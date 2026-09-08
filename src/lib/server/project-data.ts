import "server-only";
import { requireProject, entitlements } from "./auth";
import { checked } from "./http";
import type { PageSnapshot, Project, Job } from "../types";
export type SavedOpportunity = {
  id: string;
  title: string;
  detail: string;
  page_url: string;
  effort: string;
  status: string;
  finding_key: string;
  evidence: {
    source: string;
    observedAt: string;
    market: string;
    status: string;
    detail: string;
    severity?: string;
    demand?: number;
  };
  verified_at: string | null;
};
export type SavedDraft = {
  id: string;
  title: string;
  kind: string;
  created_at: string;
  metadata?: {
    model?: string;
    evidenceUrls?: string[];
    needsConfirmation?: string[];
    guidanceSources?: import("../learning/retrieval").GuidanceReference[];
  };
  draft_revisions: {
    id: string;
    version: number;
    content: string;
    created_at: string;
  }[];
};
export type SavedAnswer = {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  answer: string;
  citations: { url: string; title: string }[];
  mentions: string[];
  market: string;
  created_at: string;
};
export type SavedReport = {
  id: string;
  title: string;
  created_at: string;
  share_expires_at: string | null;
};
export type ProjectData = {
  project: Project;
  projects: Project[];
  plan: string;
  limits: {
    projects: number;
    pages: number;
    drafts: number;
    answers: number;
    serps: number;
  };
  period: string;
  subscription: {
    status: string;
    period_end: string | null;
    cancel_at_period_end: boolean;
    plan: string;
  } | null;
  usage: { kind: string; amount: number }[];
  pages: PageSnapshot[];
  opportunities: SavedOpportunity[];
  drafts: SavedDraft[];
  jobs: Job[];
  answers: SavedAnswer[];
  reports: SavedReport[];
  gsc: import("../seo/gsc").GscRow[];
  connections: { gsc: string; providers: Record<string, boolean> };
  email: string;
  sample?: boolean;
};
export async function projectData(id: string): Promise<ProjectData> {
  const { db, project, workspace, user } = await requireProject(id);
  const access = await entitlements(workspace.id);
  const queries = await Promise.all([
    db
      .from("projects")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at"),
    db
      .from("usage_counters")
      .select("kind,amount")
      .eq("workspace_id", workspace.id)
      .eq("period", access.period),
    db
      .from("page_snapshots")
      .select("snapshot")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(500),
    db
      .from("opportunities")
      .select("*")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(500),
    db
      .from("drafts")
      .select("*,draft_revisions(*)")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("jobs")
      .select(
        "id,workspace_id,project_id,kind,status,stage,input,output,error,created_at,updated_at",
      )
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("ai_checks")
      .select("*")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("reports")
      .select("id,title,created_at,share_expires_at")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("gsc_daily")
      .select(
        "date,dataset,query,page,country,device,clicks,impressions,position,property",
      )
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .eq("property", project.gsc_property || "")
      .eq("dataset", "totals")
      .order("date", { ascending: false })
      .limit(90),
    db
      .from("integrations")
      .select("status")
      .eq("project_id", id)
      .eq("workspace_id", workspace.id)
      .eq("provider", "gsc")
      .maybeSingle(),
  ]);
  const projects = checked(queries[0]),
    usage = checked(queries[1]),
    snaps = checked(queries[2]),
    opportunities = checked(queries[3]),
    drafts = checked(queries[4]),
    jobs = checked(queries[5]),
    answers = checked(queries[6]),
    reports = checked(queries[7]),
    gsc = checked(queries[8]),
    connection = checked(queries[9]);
  const pages: PageSnapshot[] = [];
  for (const row of snaps || [])
    if (!pages.some((s) => s.finalUrl === row.snapshot.finalUrl))
      pages.push(row.snapshot as PageSnapshot);
  return {
    project,
    projects: projects || [],
    plan: access.plan,
    limits: access.limits,
    period: access.period,
    subscription: access.subscription
      ? {
          status: access.subscription.status,
          period_end: access.subscription.period_end,
          cancel_at_period_end: access.subscription.cancel_at_period_end,
          plan: access.subscription.plan,
        }
      : null,
    usage: usage || [],
    pages,
    opportunities: opportunities || [],
    drafts: drafts || [],
    jobs: jobs || [],
    answers: answers || [],
    reports: reports || [],
    gsc: gsc || [],
    connections: {
      gsc: connection?.status || "disconnected",
      providers: {
        firecrawl: !!process.env.FIRECRAWL_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        perplexity: !!process.env.PERPLEXITY_API_KEY,
        serp:
          !!process.env.DATAFORSEO_LOGIN && !!process.env.DATAFORSEO_PASSWORD,
        pagespeed: !!process.env.PAGESPEED_API_KEY,
        background:
          !!process.env.INNGEST_EVENT_KEY || process.env.INNGEST_DEV === "1",
        billing: !!process.env.STRIPE_SECRET_KEY,
        email: !!process.env.RESEND_API_KEY,
      },
    },
    email: user.email || "",
  } as ProjectData;
}
