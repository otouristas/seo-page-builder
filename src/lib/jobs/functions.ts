import { providerOnce } from "./provider-once";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { adminClient, databaseConfigured } from "../supabase/server";
import { checked } from "../server/http";
import { AppError } from "../server/errors";
import {
  parseSnapshot,
  actionableFindings,
  compareSnapshots,
} from "../seo/audit";
import { normalizePublicUrl } from "../seo/safe-fetch";
import {
  startCrawl,
  getCrawl,
  getCrawlPage,
  getCrawlErrors,
  scrape,
  cancelCrawl,
  type CrawlDocument,
} from "../integrations/firecrawl";
import { generateDraft, checkAnswer } from "../integrations/ai";
import {
  importGscDay,
  dateWindow,
  saveGscOpportunities,
} from "../integrations/gsc";
import { fetchResearch } from "../integrations/serp";
import { pageSpeed } from "../integrations/pagespeed";
import { buildReport, reportPdf, reportCsv } from "../server/reports";
import { sendEmail } from "../integrations/resend";
import { dispatch, enqueueJob, type JobInput } from "./queue";
import { entitlements } from "../server/auth";
import type { Job, Project, PageSnapshot } from "../types";
async function liveJob(id: string) {
  const job = checked(
    await adminClient().from("jobs").select("*").eq("id", id).single(),
  );
  if (job.status === "cancelled") throw new NonRetriableError("Job cancelled");
  return job as Job & {
    provider_id: string | null;
    provider_attempted: boolean;
    usage_reserved: number;
    usage_consumed: number;
  };
}
async function stage(id: string, label: string, provider = false) {
  const result = checked(
    await adminClient()
      .from("jobs")
      .update({
        stage: label,
        status: "running",
        ...(provider ? { provider_attempted: true } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["queued", "running"])
      .select("id")
      .maybeSingle(),
  );
  if (!result) throw new NonRetriableError("Job is no longer active");
}
async function saveSnapshot(job: Job, project: Project, doc: CrawlDocument) {
  const raw = doc.metadata?.sourceURL || doc.metadata?.url || project.url;
  let url: URL;
  try {
    url = normalizePublicUrl(raw);
  } catch {
    return null;
  }
  if (url.hostname !== new URL(project.url).hostname || !doc.html) return null;
  const snapshot = parseSnapshot(doc.html.slice(0, 1_500_000), url.href, {
    source: "rendered",
    status: doc.metadata?.statusCode || 0,
    market: project.country,
    truncated: doc.html.length > 1_500_000,
  });
  const db = adminClient();
  checked(
    await db.from("page_snapshots").upsert(
      {
        workspace_id: job.workspace_id,
        project_id: project.id,
        job_id: job.id,
        url: url.href,
        snapshot,
      },
      { onConflict: "job_id,url" },
    ),
  );
  for (const f of actionableFindings(snapshot)) {
    const existing = checked(
      await db
        .from("opportunities")
        .select("id,status")
        .eq("project_id", project.id)
        .eq("finding_key", f.id)
        .eq("page_url", url.href)
        .maybeSingle(),
    );
    const status =
      existing?.status === "verified" ? "open" : existing?.status || "open";
    checked(
      await db.from("opportunities").upsert(
        {
          workspace_id: job.workspace_id,
          project_id: project.id,
          finding_key: f.id,
          title: f.title,
          detail: `${f.detail} ${f.recommendation}`,
          page_url: url.href,
          effort: f.effort,
          evidence: { ...f.evidence, severity: f.severity },
          status,
          verified_at: status === "verified" ? undefined : null,
        },
        { onConflict: "project_id,finding_key,page_url" },
      ),
    );
  }
  return snapshot;
}
async function snapshots(project: Project) {
  const rows = checked(
    await adminClient()
      .from("page_snapshots")
      .select("snapshot")
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id)
      .order("created_at", { ascending: false })
      .limit(100),
  );
  return [
    ...new Map(
      (rows as { snapshot: PageSnapshot }[])
        .map((r) => [r.snapshot.finalUrl, r.snapshot] as const)
        .reverse(),
    ).values(),
  ].slice(0, 20);
}
export const runJob = inngest.createFunction(
  {
    id: "run-project-job",
    triggers: [{ event: "ranksushi/job.requested" }],
    retries: 2,
    concurrency: [{ limit: 2, key: "event.data.workspaceId" }, { limit: 8 }],
    idempotency: "event.data.jobId",
    cancelOn: [{ event: "ranksushi/job.cancelled", match: "data.jobId" }],
    onFailure: async ({ event }) => {
      const id = event.data.event.data.jobId as string;
      const db = adminClient();
      const r = await db.from("jobs").select("*").eq("id", id).single();
      if (
        r.error ||
        !r.data ||
        ["cancelled", "completed", "partial"].includes(r.data.status)
      )
        return;
      const j = r.data;
      const used = j.provider_attempted ? j.usage_reserved : 0;
      await db.rpc("settle_usage", { p_key: id, p_actual: used });
      await db
        .from("jobs")
        .update({
          status: "failed",
          stage: "Needs attention",
          error:
            "The job could not finish after retries. Check the connection in Settings. Allowance for already-started provider work is retained until reconciled.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("status", "cancelled");
    },
  },
  async ({ event, step }) => {
    const context = await step.run("load", async () => {
      const j = await liveJob(event.data.jobId);
      if (["completed", "partial", "failed"].includes(j.status)) return null;
      const project = checked(
        await adminClient()
          .from("projects")
          .select("*")
          .eq("id", j.project_id)
          .eq("workspace_id", j.workspace_id)
          .single(),
      ) as Project;
      return { job: j, project };
    });
    if (!context) return;
    const { job, project } = context;
    const input = job.input as JobInput;
    let output: Record<string, unknown> = {},
      used = 0,
      partial = false;
    if (input.kind === "crawl") {
      const id = await step.run("start-crawl", async () => {
        await stage(job.id, "Discovering pages", true);
        const existing = await liveJob(job.id);
        if (existing.provider_id) return existing.provider_id;
        const r = await providerOnce(job.id, "crawl-start", () =>
          startCrawl(project.url, input.limit),
        );
        checked(
          await adminClient()
            .from("jobs")
            .update({ provider_id: r.id })
            .eq("id", job.id),
        );
        return r.id;
      });
      let finished = false,
        providerTotal = 0,
        credits = 0;
      for (let i = 0; i < 120; i++) {
        const result = await step.run(`collect-${i}`, async () => {
          await stage(job.id, "Fetching and inspecting pages");
          let result = await getCrawl(id);
          const status = result.status,
            total = result.total,
            credits = result.creditsUsed;
          let batches = 0;
          for (;;) {
            for (const doc of result.data || [])
              await saveSnapshot(job, project, doc);
            if (!result.next || ++batches >= 20) break;
            result = await getCrawlPage(result.next);
          }
          const count = await adminClient()
            .from("page_snapshots")
            .select("id", { count: "exact", head: true })
            .eq("job_id", job.id);
          checked(count);
          checked(
            await adminClient()
              .from("jobs")
              .update({
                stage: `Inspected ${count.count || 0} pages`,
                usage_consumed: Math.min(
                  input.limit,
                  credits || count.count || 0,
                ),
              })
              .eq("id", job.id)
              .neq("status", "cancelled"),
          );
          return { status, total, credits };
        });
        providerTotal = result.total;
        credits = result.credits;
        if (result.status !== "scraping") {
          finished = true;
          partial = result.status !== "completed";
          break;
        }
        await step.sleep(`wait-${i}`, "15s");
      }
      if (!finished)
        await step.run("stop-timed-out-crawl", () => cancelCrawl(id));
      output = await step.run("crawl-summary", async () => {
        const db = adminClient();
        const count = await db
          .from("page_snapshots")
          .select("id", { count: "exact", head: true })
          .eq("job_id", job.id);
        checked(count);
        let errorsAvailable = true;
        let failures: {
          errors: { url: string; error: string }[];
          robotsBlocked: string[];
        } = { errors: [], robotsBlocked: [] };
        try {
          failures = await getCrawlErrors(id);
        } catch {
          errorsAvailable = false;
        }
        return {
          successful: count.count || 0,
          errorsAvailable,
          failed: failures.errors || [],
          blocked: failures.robotsBlocked || [],
          discovered: providerTotal,
          unvisited: Math.max(
            0,
            providerTotal -
              (count.count || 0) -
              (failures.errors?.length || 0) -
              (failures.robotsBlocked?.length || 0),
          ),
          limit: input.limit,
          finished,
          note: finished
            ? "Counts describe this bounded crawl, not every page on the website."
            : "The time limit was reached. Results collected so far are retained.",
        };
      });
      used = finished
        ? Math.min(input.limit, credits || Number(output.successful))
        : input.limit;
      partial =
        partial ||
        output.errorsAvailable === false ||
        !finished ||
        Number(output.successful) === 0 ||
        (output.failed as unknown[]).length > 0;
    } else if (input.kind === "recheck") {
      output = await step.run("recheck-page", async () => {
        await stage(job.id, "Fetching the current live page", true);
        const prior = checked(
          await adminClient()
            .from("page_snapshots")
            .select("snapshot")
            .eq("project_id", project.id)
            .eq("workspace_id", job.workspace_id)
            .eq("url", input.url)
            .neq("job_id", job.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        );
        const before = prior?.snapshot as PageSnapshot | undefined;
        const r = await providerOnce(job.id, "recheck", () =>
          scrape(input.url),
        );
        const after = await saveSnapshot(job, project, r.data);
        if (!after) throw new AppError("No readable page was returned.", 422);
        const comparison = before ? compareSnapshots(before, after) : null;
        if (comparison?.resolved.length)
          checked(
            await adminClient()
              .from("opportunities")
              .update({
                status: "verified",
                verified_at: new Date().toISOString(),
              })
              .eq("project_id", project.id)
              .eq("workspace_id", job.workspace_id)
              .eq("page_url", after.finalUrl)
              .in("finding_key", comparison.resolved),
          );
        return {
          page: after.finalUrl,
          comparison,
          note: before
            ? "Compared with the previous saved page."
            : "First snapshot saved. Recheck later to compare changes.",
        };
      });
      used = 1;
    } else if (input.kind === "draft") {
      output = await step.run("prepare-draft", async () => {
        await stage(job.id, "Loading saved evidence");
        const db = adminClient();
        const exists = checked(
          await db
            .from("drafts")
            .select("id")
            .eq("source_job", job.id)
            .maybeSingle(),
        );
        if (exists) return { draftId: exists.id };
        const evidence = await snapshots(project);
        const ordered = input.url
          ? [
              ...evidence.filter((s) => s.finalUrl === input.url),
              ...evidence.filter((s) => s.finalUrl !== input.url),
            ]
          : evidence;
        if (!ordered.length)
          throw new NonRetriableError("Run an audit before drafting.");
        await stage(job.id, "Preparing a draft from saved evidence", true);
        const result = await providerOnce(job.id, "draft", () =>
          generateDraft(input.draftKind, input.prompt, project, ordered),
        );
        const d = checked(
          await db.rpc("create_generated_draft", {
            p_workspace: job.workspace_id,
            p_project: project.id,
            p_job: job.id,
            p_title: result.title,
            p_kind: input.draftKind,
            p_content: result.content,
            p_metadata: {
              model: result.model,
              evidenceUrls: result.evidenceUrls,
              needsConfirmation: result.needsConfirmation,
              guidanceSources: result.guidanceSources,
            },
          }),
        );
        return {
          draftId: d,
          model: result.model,
          evidenceUrls: result.evidenceUrls,
          needsConfirmation: result.needsConfirmation,
          guidanceSources: result.guidanceSources,
        };
      });
      used = 1;
    } else if (input.kind === "ai-check") {
      output = await step.run("sample-api-answer", async () => {
        await stage(job.id, `Sampling an answer from ${input.provider}`, true);
        const db = adminClient();
        const exists = checked(
          await db
            .from("ai_checks")
            .select("*")
            .eq("job_id", job.id)
            .maybeSingle(),
        );
        if (exists) return { checkId: exists.id };
        const result = await providerOnce(job.id, "answer", () =>
          checkAnswer(
            input.provider,
            input.prompt,
            project.name,
            project.country,
          ),
        );
        const row = checked(
          await db
            .from("ai_checks")
            .upsert(
              {
                workspace_id: job.workspace_id,
                project_id: project.id,
                job_id: job.id,
                ...result,
                status: "sample",
              },
              { onConflict: "job_id" },
            )
            .select("id")
            .single(),
        );
        return {
          checkId: row!.id,
          model: result.model,
          classification: "sampled API answer",
        };
      });
      used = 1;
    } else if (input.kind === "gsc-sync") {
      const days = await step.run("sync-window", () =>
        dateWindow(input.initial ? 90 : 7),
      );
      const imported = [];
      for (const date of days) {
        const result = await step.run(`import-${date}`, async () => {
          await stage(job.id, `Importing Search Console: ${date}`, true);
          return importGscDay(project, date);
        });
        imported.push(result);
      }
      const signals = await step.run("search-opportunities", () =>
        saveGscOpportunities(project),
      );
      output = {
        opportunities: signals,
        days: imported,
        through: days.at(-1),
        coverage:
          "Final web-search data, property totals plus limited detailed rows. API data is not exhaustive.",
      };
    } else if (input.kind === "serp") {
      output = await step.run("google-serp-evidence", async () => {
        await stage(
          job.id,
          input.mode === "keywords"
            ? "Retrieving keyword database estimates"
            : "Retrieving live Google results",
          true,
        );
        return providerOnce(job.id, "serp", () =>
          fetchResearch(
            input.query,
            project.country,
            project.language,
            input.mode ?? "serp",
          ),
        );
      });
      used = 1;
    } else if (input.kind === "pagespeed") {
      output = await step.run("performance-diagnostics", async () => {
        await stage(job.id, "Running mobile PageSpeed diagnostics", true);
        return providerOnce(job.id, "pagespeed", () => pageSpeed(input.url));
      });
    } else if (input.kind === "report") {
      output = await step.run("generate-report", async () => {
        await stage(job.id, "Combining evidence and completed work");
        const db = adminClient();
        const existing = checked(
          await db
            .from("reports")
            .select("id,payload")
            .eq("job_id", job.id)
            .maybeSingle(),
        );
        const payload = existing?.payload || (await buildReport(project));
        const row =
          existing ||
          checked(
            await db
              .from("reports")
              .upsert(
                {
                  workspace_id: job.workspace_id,
                  project_id: project.id,
                  job_id: job.id,
                  title: input.title,
                  payload,
                },
                { onConflict: "job_id" },
              )
              .select("id")
              .single(),
          );
        const prefix = `${job.workspace_id}/${row!.id}`;
        checked(
          await db.storage
            .from("reports")
            .upload(`${prefix}.pdf`, await reportPdf(payload, input.title), {
              contentType: "application/pdf",
              upsert: true,
            }),
        );
        checked(
          await db.storage
            .from("reports")
            .upload(`${prefix}.csv`, reportCsv(payload), {
              contentType: "text/csv",
              upsert: true,
            }),
        );
        return { reportId: row!.id };
      });
    }
    await step.run("complete", async () => {
      await liveJob(job.id);
      const db = adminClient();
      checked(await db.rpc("settle_usage", { p_key: job.id, p_actual: used }));
      checked(
        await db
          .from("jobs")
          .update({
            status: partial ? "partial" : "completed",
            stage: partial ? "Partial results are ready" : "All rolled up",
            output,
            usage_consumed: used,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id)
          .neq("status", "cancelled"),
      );
      checked(
        await db.from("product_events").insert({
          workspace_id: job.workspace_id,
          event: `${input.kind}.completed`,
          metadata: { projectId: project.id, jobId: job.id, partial },
        }),
      );
    });
    if ("notify" in input && input.notify && process.env.RESEND_API_KEY)
      await step.run("requested-notice", async () => {
        const w = checked(
          await adminClient()
            .from("workspaces")
            .select("owner_email")
            .eq("id", job.workspace_id)
            .single(),
        );
        await sendEmail(
          job.workspace_id,
          w!.owner_email,
          `job-${job.id}`,
          `Your ${input.kind} is ready`,
          `${project.name}: ${partial ? "Partial results" : "Results"} are ready. Open your workspace to review the evidence: https://ranksushi.com/app/${project.id}/overview`,
        );
      });
    return output;
  },
);
export const housekeeping = inngest.createFunction(
  {
    id: "outbox-and-schedules",
    triggers: [{ cron: "*/5 * * * *" }],
    concurrency: 1,
    retries: 1,
  },
  async ({ step }) => {
    if (!databaseConfigured()) return;
    await step.run("outbox", async () => {
      const jobs = checked(
        await adminClient()
          .from("jobs")
          .select("*")
          .eq("status", "queued")
          .is("dispatched_at", null)
          .limit(100),
      );
      for (const job of jobs || []) await dispatch(job as Job);
    });
    await step.run("cleanup", async () => {
      const db = adminClient();
      await db
        .from("free_audits")
        .delete()
        .lt("expires_at", new Date().toISOString());
      await db
        .from("oauth_states")
        .delete()
        .lt("expires_at", new Date().toISOString());
      await db
        .from("rate_buckets")
        .delete()
        .lt("expires_at", new Date(Date.now() - 86400000).toISOString());
    });
  },
);
export const dailyWork = inngest.createFunction(
  {
    id: "daily-sync-weekly-scans",
    triggers: [{ cron: "0 7 * * *" }],
    concurrency: 1,
    retries: 1,
  },
  async ({ step }) => {
    if (!databaseConfigured()) return;
    const projects = await step.run(
      "eligible-projects",
      async () =>
        checked(
          await adminClient()
            .from("projects")
            .select("*")
            .or(
              "gsc_property.not.is.null,weekly_scan.eq.true,email_digest.eq.true",
            )
            .limit(1000),
        ) as Project[],
    );
    const day = await step.run("schedule-date", () =>
      new Date().toISOString().slice(0, 10),
    );
    const now = new Date(`${day}T12:00:00Z`);
    for (const p of projects) {
      await step.run(`schedule-${p.id}`, async () => {
        const access = await entitlements(p.workspace_id);
        if (access.plan === "free") return;
        const db = adminClient();
        const existing = checked(
          await db
            .from("jobs")
            .select("kind")
            .eq("project_id", p.id)
            .gte("created_at", `${day}T00:00:00Z`),
        );
        for (const input of [
          ...(p.gsc_property
            ? [{ kind: "gsc-sync", initial: false } as const]
            : []),
          ...(p.weekly_scan && now.getUTCDay() === 1
            ? [{ kind: "crawl", limit: p.scan_limit, notify: false } as const]
            : []),
        ]) {
          if (existing?.some((j) => j.kind === input.kind)) continue;
          try {
            await enqueueJob(p, input);
          } catch (error) {
            if (error instanceof AppError && error.code === "quota_exhausted")
              await db.from("product_events").insert({
                workspace_id: p.workspace_id,
                event: "schedule.quota_exhausted",
                metadata: { projectId: p.id },
              });
            else throw error;
          }
        }
      });
      if (p.email_digest && now.getUTCDay() === 1 && process.env.RESEND_API_KEY)
        await step.run(`digest-${p.id}`, async () => {
          const db = adminClient();
          const w = checked(
            await db
              .from("workspaces")
              .select("owner_email")
              .eq("id", p.workspace_id)
              .single(),
          );
          const { count } = await db
            .from("opportunities")
            .select("id", { count: "exact", head: true })
            .eq("project_id", p.id)
            .eq("status", "open");
          await sendEmail(
            p.workspace_id,
            w!.owner_email,
            `digest-${p.id}-${day}`,
            `Your weekly bites: ${p.name}`,
            `${count || 0} open opportunities are saved for ${p.name}. Review evidence and choose your next step at https://ranksushi.com/app/${p.id}/overview. You can turn off this weekly digest in project Settings.`,
          );
        });
    }
  },
);

export const reconcileBilling = inngest.createFunction(
  {
    id: "reconcile-billing",
    triggers: [{ cron: "15 * * * *" }],
    concurrency: 1,
    retries: 2,
  },
  async ({ step }) => {
    if (!databaseConfigured() || !process.env.STRIPE_SECRET_KEY) return;
    const customers = await step.run(
      "billing-customers",
      async () =>
        checked(
          await adminClient()
            .from("subscriptions")
            .select("stripe_customer")
            .not("stripe_customer", "is", null)
            .limit(1000),
        ) || [],
    );
    for (const row of customers)
      await step.run(`reconcile-${row.stripe_customer}`, async () => {
        const { reconcileCustomer } = await import("../integrations/stripe");
        await reconcileCustomer(row.stripe_customer);
      });
  },
);
export const welcomeEmail = inngest.createFunction(
  {
    id: "welcome-new-workspaces",
    triggers: [{ cron: "*/10 * * * *" }],
    concurrency: 1,
    retries: 1,
  },
  async ({ step }) => {
    if (
      !databaseConfigured() ||
      !process.env.RESEND_API_KEY ||
      !process.env.RESEND_FROM
    )
      return;
    const recent = await step.run(
      "new-workspaces",
      async () =>
        checked(
          await adminClient()
            .from("workspaces")
            .select("id,owner_email")
            .gte("created_at", new Date(Date.now() - 86400000).toISOString())
            .limit(1000),
        ) || [],
    );
    for (const w of recent)
      await step.run(`welcome-${w.id}`, () =>
        sendEmail(
          w.id,
          w.owner_email,
          `welcome-${w.id}`,
          "Welcome to RankSushi",
          "Welcome to the table. Add your website, review your first findings, and prepare one useful change. You can connect Search Console when you are ready. Need help? Contact anotherseoguru@gmail.com.",
        ),
      );
  },
);

export const functions = [
  runJob,
  housekeeping,
  dailyWork,
  reconcileBilling,
  welcomeEmail,
];
