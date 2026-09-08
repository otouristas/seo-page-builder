import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { inngest } from "./client";
import { ordinaryQuery, RESEARCH_LOCATIONS } from "../research";
import { adminClient } from "../supabase/server";
import { requireWriteAccess } from "../server/auth";
import { checked } from "../server/http";
import { AppError, required } from "../server/errors";
import { validatePublicUrl } from "../seo/safe-fetch";
import type { Job, JobKind, Project, UsageKind } from "../types";
export const jobInput = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("crawl"),
    limit: z.number().int().min(1).max(200).default(20),
    notify: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("recheck"),
    url: z.string().max(2048),
    notify: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("gsc-sync"),
    initial: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("draft"),
    draftKind: z.enum([
      "brief",
      "metadata",
      "content",
      "internal-links",
      "schema",
      "coach",
    ]),
    prompt: z.string().max(3000).default(""),
    url: z.string().max(2048).optional(),
    notify: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("ai-check"),
    provider: z.enum(["openai", "perplexity"]),
    prompt: z.string().min(10).max(1000),
  }),
  z
    .object({
      kind: z.literal("serp"),
      query: z
        .string()
        .trim()
        .min(2)
        .max(200)
        .refine(
          ordinaryQuery,
          "Use a plain search phrase; advanced operators are not enabled.",
        ),
      mode: z.enum(["serp", "keywords"]).default("serp"),
      pageUrl: z.url().max(2048).optional(),
    })
    .refine(
      (v) =>
        v.mode !== "keywords" ||
        (v.query.length <= 80 && v.query.split(/\s+/).length <= 10),
      "Keyword demand accepts up to 80 characters and 10 words.",
    ),
  z.object({
    kind: z.literal("report"),
    title: z.string().max(100).default("Fresh findings report"),
    notify: z.boolean().default(false),
  }),
  z.object({ kind: z.literal("pagespeed"), url: z.string().max(2048) }),
]);
export type JobInput = z.infer<typeof jobInput>;
export async function enqueueJob(
  project: Project,
  input: JobInput,
  idempotencyKey?: string,
) {
  if (input.kind === "serp" && input.pageUrl) {
    const { url } = await validatePublicUrl(input.pageUrl);
    if (url.hostname !== new URL(project.url).hostname)
      throw new AppError("Use a page on this project’s website.");
  }
  if (input.kind === "serp" && !RESEARCH_LOCATIONS[project.country])
    throw new AppError(
      "Research is not yet available for this project country.",
      400,
    );
  const db = adminClient();
  if (!process.env.INNGEST_EVENT_KEY && process.env.INNGEST_DEV !== "1")
    throw new AppError(
      "Background processing is being configured. No allowance was used.",
      503,
      "jobs_unconfigured",
    );
  const access = await requireWriteAccess(project.workspace_id);
  let usage: UsageKind | undefined,
    amount = 0;
  const provider: Partial<Record<JobKind, string>> = {
    crawl: "FIRECRAWL_API_KEY",
    recheck: "FIRECRAWL_API_KEY",
    draft: "OPENAI_API_KEY",
    "ai-check":
      input.kind === "ai-check" && input.provider === "perplexity"
        ? "PERPLEXITY_API_KEY"
        : "OPENAI_API_KEY",
    serp: "DATAFORSEO_LOGIN",
    pagespeed: "PAGESPEED_API_KEY",
  };
  if (provider[input.kind]) required(provider[input.kind]!);
  if (input.kind === "serp") required("DATAFORSEO_PASSWORD");
  if (input.kind === "draft") {
    const count = await db
      .from("page_snapshots")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id)
      .eq("workspace_id", project.workspace_id);
    checked(count);
    if (!count.count)
      throw new AppError(
        "Run an audit before preparing a grounded draft.",
        409,
      );
  }
  if (["crawl", "recheck", "pagespeed"].includes(input.kind)) {
    const target =
      input.kind === "crawl"
        ? project.url
        : "url" in input
          ? input.url
          : project.url;
    const { url } = await validatePublicUrl(target || project.url);
    if (url.hostname !== new URL(project.url).hostname)
      throw new AppError("Use a page on this project’s website.");
  }
  if (input.kind === "crawl" || input.kind === "recheck") {
    usage = "pages";
    amount = input.kind === "crawl" ? input.limit : 1;
  }
  if (input.kind === "draft") {
    usage = "drafts";
    amount = 1;
  }
  if (input.kind === "ai-check") {
    usage = "answers";
    amount = 1;
  }
  if (input.kind === "serp") {
    usage = "serps";
    amount = 1;
  }
  if (access.plan === "free" && !["crawl", "recheck"].includes(input.kind))
    throw new AppError(
      "Choose a plan to start this work. Saved results remain available.",
      402,
      "paid_required",
    );
  if (input.kind === "gsc-sync" && !project.gsc_property)
    throw new AppError(
      "Connect Search Console and choose a property in Settings.",
      409,
    );
  const id = idempotencyKey || randomUUID();
  const result = await db.rpc("queue_job", {
    p_id: id,
    p_workspace: project.workspace_id,
    p_project: project.id,
    p_kind: input.kind,
    p_input: input,
    p_usage: usage || null,
    p_amount: amount,
    p_period: access.period,
    p_limit: usage ? access.limits[usage] : 0,
  });
  if (result.error) {
    if (result.error.message.includes("quota_exhausted"))
      throw new AppError(
        "This would exceed your remaining allowance. Reduce the job size or wait for your next billing period.",
        402,
        "quota_exhausted",
      );
    if (result.error.message.includes("idempotency_conflict"))
      throw new AppError(
        "This request identifier was already used for different work.",
        409,
      );
    checked(result);
  }
  const job = result.data as Job;
  try {
    await dispatch(job);
  } catch {
    /* Persisted outbox is retried by the scheduled reconciler. */
  }
  return job;
}
export async function dispatch(job: Job) {
  await inngest.send({
    id: job.id,
    name: "ranksushi/job.requested",
    data: {
      jobId: job.id,
      workspaceId: job.workspace_id,
      projectId: job.project_id,
    },
  });
  checked(
    await adminClient()
      .from("jobs")
      .update({ dispatched_at: new Date().toISOString() })
      .eq("id", job.id),
  );
}
export async function cancelJob(job: Job) {
  const db = adminClient();
  checked(
    await db
      .from("jobs")
      .update({
        status: "cancelled",
        stage: "Cancelled; already-started provider work may finish",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .in("status", ["queued", "running"]),
  );
  try {
    await inngest.send({
      name: "ranksushi/job.cancelled",
      data: { jobId: job.id },
    });
  } catch {
    /* Every worker stage also checks the persisted cancellation. */
  }
  const row = checked(
    await db
      .from("jobs")
      .select("provider_id,provider_attempted,usage_consumed,usage_reserved")
      .eq("id", job.id)
      .single(),
  );
  if (job.kind === "crawl" && row!.provider_id) {
    const { cancelCrawl } = await import("../integrations/firecrawl");
    try {
      await cancelCrawl(row!.provider_id);
    } catch {}
  }
  checked(
    await db.rpc("settle_usage", {
      p_key: job.id,
      p_actual: row!.provider_attempted ? row!.usage_reserved : 0,
    }),
  );
}
