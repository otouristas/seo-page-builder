import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/features",
  "/pricing",
  "/methodology",
  "/help",
  "/security",
  "/privacy",
  "/terms",
  "/features/website-audits",
  "/features/search-console",
  "/features/content-studio",
  "/features/ai-visibility",
  "/tools",
  "/tools/seo-audit",
  "/tools/metadata-preview",
  "/tools/structured-data",
];
const views = [
  "",
  "/opportunities",
  "/audits",
  "/search-console",
  "/content-studio",
  "/ai-visibility",
  "/reports",
  "/settings",
];
test("public routes have canonical metadata, one main heading, and working internal links", async ({
  page,
  request,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Metadata is viewport-independent.",
  );
  test.setTimeout(180000);
  const titles = new Set();
  const links = new Set<string>();
  for (const path of routes) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator("main h1"), path).toHaveCount(1);
    const title = await page.title();
    expect(titles.has(title), `unique title ${path}`).toBe(false);
    titles.add(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://ranksushi.com${path === "/" ? "" : path}`,
    );
    expect(
      await page.locator('meta[name="description"]').getAttribute("content"),
    ).toBeTruthy();
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).getAttribute("href")!),
      );
    for (const href of hrefs) links.add(href.split("#")[0]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `no overflow ${path}`,
    ).toBe(true);
  }
  for (const link of links) {
    const response = await request.get(link, { maxRedirects: 5 });
    expect(response.status(), `internal link ${link}`).toBeLessThan(400);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain(
    "https://ranksushi.com/features/website-audits",
  );
  expect(await sitemap.text()).not.toContain("/app/");
});
test("landing and workspace render accessibly without horizontal overflow", async ({
  page,
}, info) => {
  for (const path of ["/", "/demo", "/login", "/tools/metadata-preview"]) {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      path,
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
    expect(errors, path).toEqual([]);
    await page.screenshot({
      path: `artifacts/qa/${info.project.name}-${path === "/" ? "landing" : path.split("/").at(-1)}.png`,
      fullPage: path === "/",
    });
  }
});
test("all eight workspace sections load, including mobile navigation", async ({
  page,
}, info) => {
  for (const view of views) {
    await page.goto(`/demo${view}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(
      page.getByText(
        "All metrics and findings on this page are illustrative.",
        { exact: false },
      ),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      view || "overview",
    ).toBe(true);
  }
  if (info.project.name === "mobile") {
    await page.getByLabel("Open workspace navigation").click();
    await page
      .getByRole("navigation", { name: "Mobile workspace" })
      .getByRole("link", { name: "Content Studio", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Good ideas, ready to roll" }),
    ).toBeVisible();
  }
});
test("an opportunity opens its evidence and prepares an editable, exportable example draft", async ({
  page,
}) => {
  await page.goto("/demo/opportunities");
  await page
    .getByRole("heading", { name: "Give your collection a search description" })
    .click();
  await expect(
    page.getByRole("button", { name: "Mark as applied", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Prepare a draft" }).first().click();
  await expect(
    page.getByRole("button", { name: "Title & description", exact: false }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", {
      name: "A clearer invitation to your collection",
      exact: false,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page
    .getByLabel("Edit draft content")
    .fill(
      "Title: A useful title\nDescription: A specific, reviewed description.",
    );
  await page
    .getByRole("button", { name: "Save revision", exact: false })
    .click();
  await expect(page.getByRole("status")).toContainText("edited locally");
  const file = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "MD", exact: true }).click();
  expect((await file).suggestedFilename()).toBe("ranksushi-draft.md");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
test("metadata preview and schema checker respond to edits", async ({
  page,
}) => {
  await page.goto("/tools/metadata-preview");
  await page
    .getByLabel("Page title", { exact: true })
    .fill("My new useful title");
  await expect(page.locator(".search-result .title")).toHaveText(
    "My new useful title",
  );
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect(page.locator(".search-preview")).toHaveClass(/mobile/);
  await page.goto("/tools/structured-data");
  await page.getByLabel("Your JSON-LD").fill("{ invalid");
  await page.getByRole("button", { name: "Check structured data" }).click();
  await expect(
    page.getByRole("heading", { name: "Let’s fix the JSON first." }),
  ).toBeVisible();
  await page
    .getByLabel("Your JSON-LD")
    .fill(
      '{"@context":"https://schema.org","@type":"Organization","name":"Coffee","url":"https://example.com"}',
    );
  await page.getByLabel("Visible page content (optional)").fill("Coffee");
  await page.getByRole("button", { name: "Check structured data" }).click();
  await expect(
    page.getByRole("heading", { name: "JSON syntax checks out." }),
  ).toBeVisible();
});
test("free audit shows recovery states instead of fabricated results", async ({
  page,
}) => {
  await page.route("**/api/audit", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Audit provider is unavailable. No results were fabricated.",
      }),
    }),
  );
  await page.goto("/tools/seo-audit");
  await page
    .getByLabel("Your website URL", { exact: true })
    .fill("https://example.com");
  await page.getByRole("button", { name: "Audit one page" }).click();
  await expect(page.locator(".tool-error[role=alert]")).toContainText(
    "No results were fabricated",
  );
  await expect(page.locator(".finding-item")).toHaveCount(0);
});
test("private routes, unauthenticated APIs, and invalid sharing links deny access", async ({
  page,
  request,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
  for (const path of [
    "/api/projects",
    "/api/jobs/10000000-0000-4000-8000-000000000001",
    "/api/reports/10000000-0000-4000-8000-000000000001",
  ]) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
  expect((await request.get("/share/invalid-token")).status()).toBe(404);
  expect(
    (
      await request.post("/api/projects", {
        headers: { Origin: "https://attacker.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
});
test("keyboard focus, dialog dismissal and reduced motion work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Scan website" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Maximum pages to inspect")).toHaveValue("20");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});
