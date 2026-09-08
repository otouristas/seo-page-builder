import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

test("isolated Supabase: email sign-in, audit adoption, persistence, RLS, quotas, durable report and revoked sharing", async ({
  page,
  browser,
}, info) => {
  test.skip(
    process.env.LOCAL_SUPABASE_TEST !== "1" || info.project.name !== "desktop",
    "Requires the isolated local Supabase and Inngest services.",
  );
  test.setTimeout(180000);
  const config = JSON.parse(
    execFileSync("npx", ["supabase", "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
  expect(new URL(config.API_URL).hostname).toMatch(
    /^(127\.0\.0\.1|localhost)$/,
  );
  const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const must = <T>(r: { data: T; error: unknown }) => {
    expect(r.error).toBeNull();
    return r.data;
  };
  const mustLink = (
    r: Awaited<ReturnType<typeof db.auth.admin.generateLink>>,
  ) => {
    expect(r.error).toBeNull();
    if (!r.data.user || !r.data.properties)
      throw new Error("Local link creation failed");
    return { user: r.data.user, properties: r.data.properties };
  };
  const email = `qa-${randomUUID()}@example.test`;
  let ownerId: string | undefined;
  let otherId: string | undefined;
  const otherContext = await browser.newContext();
  try {
    await page.goto("/tools/seo-audit");
    await page
      .getByLabel("Your website URL", { exact: true })
      .fill("https://example.com");
    await page.getByRole("button", { name: "Audit one page" }).click();
    await expect(
      page.getByRole("link", { name: "Save my project" }),
    ).toBeVisible({ timeout: 30000 });
    await page.getByRole("link", { name: "Save my project" }).click();
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByRole("status")).toContainText("Check your inbox");
    let messageId = "";
    await expect
      .poll(async () => {
        const mail = await (
          await fetch(config.MAILPIT_URL + "/api/v1/messages")
        ).json();
        messageId =
          mail.messages.find((m: { ID: string; To: { Address: string }[] }) =>
            m.To.some((a) => a.Address === email),
          )?.ID || "";
        return !!messageId;
      })
      .toBe(true);
    const mail = await (
      await fetch(config.MAILPIT_URL + "/api/v1/message/" + messageId)
    ).json();
    const link = (mail.HTML as string)
      .match(/href="([^"]+)"/)?.[1]
      ?.replaceAll("&amp;", "&");
    expect(link).toBeTruthy();
    // Follow the real Supabase mail link with the browser that owns the PKCE cookie.
    await page.goto(link!);
    await expect(
      page.getByRole("heading", { name: "Your first ingredients" }),
    ).toBeVisible();
    await page
      .getByLabel("Website URL", { exact: true })
      .fill("https://example.com");
    await page
      .getByLabel("Business / project name")
      .fill("QA evidence project");
    await page
      .getByLabel("What do you do, and who is it for?")
      .fill("An isolated verification project for the RankSushi workflow.");
    await page.getByRole("button", { name: "Create my project" }).click();
    await expect(page).toHaveURL(/\/app\/[a-f0-9-]{36}/);
    const projectId = page.url().match(/\/app\/([a-f0-9-]{36})/)![1];
    const workspace = must(
      await db.from("workspaces").select("*").eq("owner_email", email).single(),
    );
    ownerId = workspace.owner_id;
    expect(
      must(
        await db
          .from("page_snapshots")
          .select("id")
          .eq("project_id", projectId),
      ),
    ).toHaveLength(1);
    await page.reload();
    await expect(page.locator("main h1")).toBeVisible();
    expect((await page.request.get("/api/projects")).status()).toBe(200);
    // Two real local sessions: cross-owner API reads, writes, polling and storage fail.
    const other = mustLink(
      await db.auth.admin.generateLink({
        type: "magiclink",
        email: `qa-${randomUUID()}@example.test`,
      }),
    );
    otherId = other.user.id;
    const otherPage = await otherContext.newPage();
    await otherPage.goto(
      "/auth/callback?token_hash=" +
        encodeURIComponent(other.properties.hashed_token),
    );
    expect(
      (await otherContext.request.get(`/api/projects/${projectId}`)).status(),
    ).toBe(404);
    expect(
      (
        await otherContext.request.patch(`/api/projects/${projectId}`, {
          headers: { Origin: "http://localhost:3100" },
          data: { name: "stolen" },
        })
      ).status(),
    ).toBe(404);
    const otherClient = createClient(config.API_URL, config.ANON_KEY, {
      auth: { persistSession: false },
    });
    const second = mustLink(
      await db.auth.admin.generateLink({
        type: "magiclink",
        email: other.user.email!,
      }),
    );
    must(
      await otherClient.auth.verifyOtp({
        token_hash: second.properties.hashed_token,
        type: "email",
      }),
    );
    expect(
      must(await otherClient.from("projects").select("*").eq("id", projectId)),
    ).toHaveLength(0);
    expect(
      (await otherClient.from("integrations").select("*")).error,
    ).toBeTruthy();
    const claims = await Promise.all(
      Array.from({ length: 20 }, () =>
        db.rpc("reserve_usage", {
          p_workspace: workspace.id,
          p_kind: "drafts",
          p_period: "qa-concurrency",
          p_amount: 1,
          p_limit: 7,
          p_key: randomUUID(),
        }),
      ),
    );
    claims.forEach((r) => must(r));
    expect(claims.filter((r) => r.data).length).toBe(7);
    // A test-only database fixture unlocks report execution. No Stripe sale or provider calls.
    must(
      await db.from("subscriptions").upsert({
        workspace_id: workspace.id,
        plan: "maki",
        status: "active",
        period_start: new Date().toISOString(),
        paid_through: new Date(Date.now() + 30 * 86400000).toISOString(),
        period_end: new Date(Date.now() + 86400000).toISOString(),
      }),
    );
    const headers = {
      Origin: "http://localhost:3100",
      "Idempotency-Key": randomUUID(),
    };
    const queue = await page.request.post(`/api/projects/${projectId}/jobs`, {
      headers,
      data: { kind: "report", title: "Isolated QA report" },
    });
    expect(queue.status()).toBe(202);
    const { job } = await queue.json();
    const repeat = await page.request.post(`/api/projects/${projectId}/jobs`, {
      headers,
      data: { kind: "report", title: "Isolated QA report" },
    });
    expect((await repeat.json()).job.id).toBe(job.id);
    expect(
      (await otherContext.request.get(`/api/jobs/${job.id}`)).status(),
    ).toBe(404);
    await page.goto("/"); // Durable execution continues away from the workspace.
    await expect
      .poll(
        async () => {
          const r = await db
            .from("jobs")
            .select("status")
            .eq("id", job.id)
            .single();
          return r.data?.status;
        },
        { timeout: 90000, intervals: [1000, 2000, 3000] },
      )
      .toBe("completed");
    const report = must(
      await db.from("reports").select("*").eq("job_id", job.id).single(),
    );
    expect(
      (await otherContext.request.get(`/api/reports/${report.id}`)).status(),
    ).toBe(404);
    const stored = await otherClient.storage
      .from("reports")
      .download(`${workspace.id}/${report.id}.pdf`);
    expect(stored.error).toBeTruthy();
    const pdf = await page.request.get(`/api/reports/${report.id}?format=pdf`);
    expect(pdf.status()).toBe(200);
    expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
    mkdirSync("artifacts/qa", { recursive: true });
    writeFileSync("artifacts/qa/local-report.pdf", await pdf.body());
    const share = await page.request.post(`/api/reports/${report.id}`, {
      headers: { Origin: "http://localhost:3100" },
      data: { action: "share" },
    });
    const { url } = await share.json();
    expect((await otherContext.request.get(url)).status()).toBe(200);
    await page.request.post(`/api/reports/${report.id}`, {
      headers: { Origin: "http://localhost:3100" },
      data: { action: "revoke" },
    });
    expect((await otherContext.request.get(url)).status()).toBe(404);
    await db.storage
      .from("reports")
      .remove([
        `${workspace.id}/${report.id}.pdf`,
        `${workspace.id}/${report.id}.csv`,
      ]);
  } finally {
    await otherContext.close();
    if (ownerId) await db.auth.admin.deleteUser(ownerId);
    if (otherId) await db.auth.admin.deleteUser(otherId);
  }
});
