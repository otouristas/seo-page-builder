export type EvidenceStatus = "measured" | "inferred" | "sample";
export type EvidenceRecord = {
  source: string;
  observedAt: string;
  market: string;
  status: EvidenceStatus;
  url?: string;
  detail: string;
};
export type AuditFinding = {
  id: string;
  title: string;
  category: "technical" | "content" | "on-page" | "answer-readiness";
  status: "pass" | "warning" | "fail" | "unknown" | "not-applicable";
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  recommendation: string;
  evidence: EvidenceRecord;
  effort: "small" | "medium" | "large";
};
export type PageSnapshot = {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  h1: string[];
  headings: string[];
  canonical: string | null;
  robots: string;
  lang: string;
  words: number;
  links: { url: string; text: string }[];
  images: { alt: string | null; decorative: boolean }[];
  schema: unknown[];
  invalidSchema: number;
  text: string;
  htmlSource: "fetched" | "rendered";
  status: number;
  fetchedAt: string;
  truncated: boolean;
  author: string | null;
  findings: AuditFinding[];
};
export type Opportunity = {
  id: string;
  title: string;
  detail: string;
  effort: string;
  status: "open" | "in-progress" | "applied" | "verified";
  pageUrl: string;
  evidence: EvidenceRecord;
  findingId?: string;
};
export type DraftKind =
  "brief" | "metadata" | "content" | "internal-links" | "schema" | "coach";
export type DraftRevision = {
  id: string;
  draft_id: string;
  version: number;
  content: string;
  created_at: string;
};
export type JobStatus =
  "queued" | "running" | "completed" | "partial" | "failed" | "cancelled";
export type JobKind =
  | "crawl"
  | "recheck"
  | "gsc-sync"
  | "draft"
  | "ai-check"
  | "serp"
  | "report"
  | "pagespeed";
export type PlanId = "free" | "maki" | "nigiri" | "omakase";
export type UsageKind = "pages" | "drafts" | "answers" | "serps";
export type PlanEntitlements = {
  projects: number;
  pages: number;
  drafts: number;
  answers: number;
  serps: number;
};
export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  description: string;
  country: string;
  language: string;
  gsc_property: string | null;
  weekly_scan: boolean;
  scan_limit: number;
  email_digest: boolean;
  created_at: string;
};
export type Job = {
  id: string;
  workspace_id: string;
  project_id: string;
  kind: JobKind;
  status: JobStatus;
  stage: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};
