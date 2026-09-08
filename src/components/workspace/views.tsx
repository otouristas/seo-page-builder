"use client";
import { FixKit } from "../fix-kit";
import { CopyActions } from "../copy-actions";
import { findingBundle } from "@/lib/fixes/prompts";
import { COUNTRIES, LANGUAGES } from "@/lib/locales";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Sparkles,
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  FileText,
  CheckCircle2,
  Globe2,
  Download,
  RefreshCw,
  Search,
  Link2,
  Plus,
  Check,
  ExternalLink as ExternalIcon,
  ChevronRight,
} from "lucide-react";
import { Button, ButtonLink, Badge, EmptyState } from "../ui";
import { Maki } from "../maki";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import { summarizeGsc, type GscRow } from "@/lib/seo/gsc";
import { displayDate, toCsv, escapeHtml } from "@/lib/utils";
import { PerformanceChart } from "./chart";
import { ResearchPanel } from "./research-panel";
import {
  Finding,
  Notice,
  request,
  download,
  ExternalLink,
  Modal,
} from "./shared";
import type { WorkspaceContext } from "./shell";
import type { SavedDraft, SavedOpportunity } from "@/lib/server/project-data";
import type { DraftKind, Job } from "@/lib/types";
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n);
function Metric({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof ScanLine;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        {title}
        <Icon size={15} />
      </div>
      <div className="metric-number">{value}</div>
      <div className="metric-bottom">{note}</div>
    </div>
  );
}
function Panel({
  title,
  note,
  children,
  action,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
        {action}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}
function SmallLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowUpRight size={13} />
    </Link>
  );
}
function latestPeriod(data: WorkspaceContext["data"]) {
  return summarizeGsc(data.gsc);
}
function sortedOpportunities(data: WorkspaceContext["data"]) {
  const severity: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return [...data.opportunities].sort(
    (a, b) =>
      (severity[b.evidence.severity || "medium"] || 0) -
        (severity[a.evidence.severity || "medium"] || 0) ||
      (b.evidence.demand || 0) - (a.evidence.demand || 0) ||
      ({ small: 1, medium: 2, large: 3 }[a.effort] || 2) -
        ({ small: 1, medium: 2, large: 3 }[b.effort] || 2),
  );
}
export function Overview(ctx: WorkspaceContext) {
  const { data, base } = ctx;
  const performance = latestPeriod(data);
  const open = sortedOpportunities(data).filter((o) => o.status !== "verified");
  const done = data.opportunities.filter((o) => o.status === "verified").length;
  return (
    <>
      <div className="welcome-panel">
        <div>
          <h2>
            {data.pages.length
              ? "Your next three bites.\nA little progress, with purpose."
              : "Your website has a story.\nLet’s see what it’s serving."}
          </h2>
          <p>
            {data.pages.length
              ? "You don’t have to fix everything today. Start with a useful change, review the evidence, and check the live page when it’s ready."
              : "Start with one scan. We’ll inspect what we can see and turn the findings into practical next steps."}
          </p>
          <ButtonLink
            href={
              data.pages.length ? `${base}/opportunities` : `${base}/audits`
            }
          >
            Find my next bite <ArrowUpRight size={13} />
          </ButtonLink>
        </div>
        <Maki pose="wave" />
      </div>
      <div className="stats-grid">
        <Metric
          title="Organic clicks"
          value={performance ? fmt(performance.current.clicks) : "—"}
          note={
            performance
              ? `${data.sample ? "Example · " : ""}${performance.current.days} reporting days`
              : "Connect Search Console to measure"
          }
          icon={ChartNoAxesCombined}
        />
        <Metric
          title="Pages with evidence"
          value={data.sample ? "48" : fmt(data.pages.length)}
          note={
            data.sample
              ? "Example crawl · 1 representative page"
              : "Latest saved snapshots"
          }
          icon={ScanLine}
        />
        <Metric
          title="Open opportunities"
          value={String(open.length)}
          note="Evidence and next steps included"
          icon={Sparkles}
        />
        <Metric
          title="Verified changes"
          value={String(done)}
          note="Rechecked on the live website"
          icon={CheckCircle2}
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Your next three bites"
          note="Prioritized by severity, observed demand, and effort."
          action={<SmallLink href={`${base}/opportunities`}>See all</SmallLink>}
        >
          {open.length ? (
            open.slice(0, 3).map((o, i) => (
              <Link
                className="task-row"
                href={`${base}/opportunities?finding=${o.id}`}
                key={o.id}
              >
                <span className="task-symbol">
                  {i === 0 ? (
                    <PenLine size={17} />
                  ) : i === 1 ? (
                    <Sparkles size={17} />
                  ) : (
                    <Link2 size={17} />
                  )}
                </span>
                <div>
                  <h3>{o.title}</h3>
                  <p>
                    {new URL(o.page_url).pathname} · {o.effort} effort
                  </p>
                </div>
                <ChevronRight size={14} />
              </Link>
            ))
          ) : (
            <EmptyState
              title={data.pages.length ? "A clear plate." : "A fresh start."}
            >
              {data.pages.length
                ? "No open opportunities are saved. Review the audit for contextual checks and missing evidence."
                : "Run your first scan to see evidence-backed next steps here."}
            </EmptyState>
          )}
        </Panel>
        <Panel
          title="Search performance"
          note={
            performance
              ? `${performance.currentStart} – ${performance.end}`
              : "The latest complete 28 days"
          }
          action={
            <Badge tone="green">{data.sample ? "Example" : "Google"}</Badge>
          }
        >
          {performance ? (
            <PerformanceChart rows={performance.series} sample={data.sample} />
          ) : (
            <EmptyState
              title="Let’s connect the dots"
              action={
                <ButtonLink href={`${base}/settings`} variant="secondary">
                  Connect Search Console
                </ButtonLink>
              }
            >
              A website audit works on its own. Add Google’s data when you’re
              ready to see how people find you.
            </EmptyState>
          )}
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Recently on the menu"
          note="Actual job stages and completed work."
          action={<SmallLink href={`${base}/audits`}>View activity</SmallLink>}
        >
          {data.jobs.length ? (
            data.jobs.slice(0, 4).map((j) => (
              <div className="activity-row" key={j.id}>
                <span className="activity-dot" />
                <div>
                  <strong>
                    {j.kind.replace("-", " ")}{" "}
                    <Badge
                      tone={
                        j.status === "completed"
                          ? "green"
                          : j.status === "failed"
                            ? "red"
                            : "neutral"
                      }
                    >
                      {j.status}
                    </Badge>
                  </strong>
                  <p>{j.stage}</p>
                </div>
                <time dateTime={j.updated_at}>{displayDate(j.updated_at)}</time>
              </div>
            ))
          ) : (
            <p className="quiet-message">
              Your first completed job will appear here.
            </p>
          )}
        </Panel>
        <div className="answer-panel">
          <div>
            <Badge tone="green">A LITTLE HELP FROM MAKI</Badge>
            <h3 style={{ marginTop: 17 }}>
              Blank page?
              <br />
              Let’s roll.
            </h3>
            <p>
              Turn a finding into a brief, a clearer page title, or a useful
              first draft. Your evidence comes along for the ride.
            </p>
            <SmallLink href={`${base}/content-studio`}>
              Step into Content Studio
            </SmallLink>
          </div>
          <Maki pose="thinking" />
        </div>
      </div>
    </>
  );
}
export function Opportunities(ctx: WorkspaceContext) {
  const { data, base } = ctx;
  const params = useSearchParams();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("open"),
    [busy, setBusy] = useState("");
  const selected = params.get("finding");
  const opportunities = sortedOpportunities(data).filter(
    (o) =>
      (filter === "all" ||
        (filter === "open" ? o.status !== "verified" : o.status === filter)) &&
      `${o.title} ${o.page_url} ${o.detail}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const change = async (o: SavedOpportunity, status: string) => {
    if (data.sample) {
      ctx.notify(
        "Example status preview. Create your workspace to save changes and verify a live page.",
      );
      return;
    }
    setBusy(o.id);
    try {
      await request(
        `/api/projects/${data.project.id}/opportunities/${o.id}`,
        { status },
        "PATCH",
      );
      ctx.refresh();
      ctx.notify(
        "Opportunity updated. A live recheck is required to verify the change.",
      );
    } catch (e) {
      ctx.notify((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <div className="toolbar">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search opportunities"
            placeholder="Find a page or opportunity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter opportunity status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="open">Needs attention</option>
          <option value="verified">Verified</option>
          <option value="all">All opportunities</option>
        </select>
        <Button
          variant="secondary"
          onClick={() =>
            download(
              "ranksushi-opportunities.csv",
              toCsv(
                opportunities.map((o) => ({
                  title: o.title,
                  status: o.status,
                  page: o.page_url,
                  evidence: o.detail,
                  source: o.evidence.source,
                  observed: o.evidence.observedAt,
                })),
              ),
              "text/csv",
            )
          }
        >
          <Download size={14} />
          Export CSV
        </Button>
      </div>
      <div className="finding-list">
        {opportunities.map((o) => (
          <details
            className="opportunity-card"
            key={o.id}
            open={selected === o.id || undefined}
          >
            <summary>
              <span className="opportunity-icon">
                <Sparkles size={17} />
              </span>
              <div>
                <h2>{o.title}</h2>
                <p>
                  {new URL(o.page_url).pathname}{" "}
                  <span>· {o.effort} effort</span>
                </p>
              </div>
              <Badge
                tone={
                  o.status === "verified"
                    ? "green"
                    : o.evidence.severity === "critical"
                      ? "red"
                      : "orange"
                }
              >
                {o.status === "verified"
                  ? "Verified"
                  : o.evidence.severity || "Review"}
              </Badge>
              <ChevronDownIcon />
            </summary>
            <div className="opportunity-detail">
              <p>{o.detail}</p>
              <div className="finding-evidence">
                <strong>
                  {o.evidence.status === "sample"
                    ? "Example evidence"
                    : o.evidence.source}
                </strong>{" "}
                · {displayDate(o.evidence.observedAt)} · {o.evidence.market}
                <br />
                {o.page_url}
              </div>
              <div className="toolbar">
                <ButtonLink
                  href={`${base}/content-studio?kind=${o.finding_key === "description" || o.finding_key === "title" ? "metadata" : "brief"}&url=${encodeURIComponent(o.page_url)}&prompt=${encodeURIComponent(o.detail)}`}
                >
                  <PenLine size={14} />
                  Prepare a draft
                </ButtonLink>
                <Button
                  variant="secondary"
                  busy={busy === o.id}
                  onClick={() => change(o, "applied")}
                >
                  <Check size={14} />
                  Mark as applied
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await ctx.run({
                        kind: "recheck",
                        url: o.page_url,
                        notify: false,
                      });
                    } catch (e) {
                      ctx.notify((e as Error).message);
                    }
                  }}
                >
                  <RefreshCw size={14} />
                  Recheck live page · 1 page
                </Button>
              </div>
              <FixKit
                context={{
                  key: o.finding_key || "opportunity",
                  title: o.title,
                  url: o.page_url,
                  detail: o.detail,
                  evidence: o.evidence,
                  status: o.status === "verified" ? "pass" : undefined,
                }}
              />
              <p className="small-note">
                “Applied” records your confirmation. “Verified” requires a new
                live snapshot showing that the observed issue is resolved.
              </p>
            </div>
          </details>
        ))}
      </div>
      {!opportunities.length && (
        <EmptyState
          title={
            data.pages.length
              ? "Nothing on this plate."
              : "Let’s find your first opportunity."
          }
          action={
            !data.pages.length ? (
              <Button onClick={ctx.openScan}>Scan website</Button>
            ) : undefined
          }
        >
          {data.pages.length
            ? "Try a different filter, or inspect your audit for checks that need human context."
            : "Scan your website to collect evidence and prepare a practical to-do list."}
        </EmptyState>
      )}
    </>
  );
}
function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function JobCard({ job, ctx }: { job: Job; ctx: WorkspaceContext }) {
  return (
    <article className="job-card">
      <div className="job-card-top">
        <h3>
          {job.kind.replace("-", " ")}
          <Badge
            tone={
              job.status === "failed"
                ? "red"
                : job.status === "completed"
                  ? "green"
                  : "neutral"
            }
          >
            {job.status}
          </Badge>
        </h3>
        <time dateTime={job.created_at}>{displayDate(job.created_at)}</time>
      </div>
      <p>{job.stage}</p>
      {job.error && <p className="form-error">{job.error}</p>}
      {job.kind === "crawl" && job.output && (
        <div className="crawl-counts">
          {[
            ["Successful", Number(job.output.successful || 0)],
            [
              "Failed",
              Array.isArray(job.output.failed) ? job.output.failed.length : 0,
            ],
            [
              "Blocked",
              Array.isArray(job.output.blocked) ? job.output.blocked.length : 0,
            ],
            ["Unvisited", Number(job.output.unvisited || 0)],
          ].map(([label, value]) => (
            <span key={label}>
              <strong>{value}</strong>
              {label}
            </span>
          ))}
        </div>
      )}
      {job.output && (
        <details className="job-output">
          <summary>View result details</summary>
          <pre className="code-output">
            {JSON.stringify(job.output, null, 2)}
          </pre>
        </details>
      )}
      {["queued", "running"].includes(job.status) && (
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await request(`/api/jobs/${job.id}`, undefined, "DELETE");
              ctx.refresh();
            } catch (e) {
              ctx.notify((e as Error).message);
            }
          }}
        >
          Cancel job
        </Button>
      )}
      {["failed", "partial"].includes(job.status) && (
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await ctx.run(job.input);
            } catch (e) {
              ctx.notify((e as Error).message);
            }
          }}
        >
          Start a new attempt (uses allowance)
        </Button>
      )}
    </article>
  );
}
export function Audits(ctx: WorkspaceContext) {
  const { data } = ctx;
  const [pageUrl, setPageUrl] = useState(data.pages[0]?.finalUrl || ""),
    [filter, setFilter] = useState("attention");
  const page = data.pages.find((p) => p.finalUrl === pageUrl) || data.pages[0];
  return (
    <>
      <div className="two-col">
        <Panel
          title="Website evidence"
          note="Latest saved snapshot for each inspected page."
        >
          <div className="toolbar">
            <select
              aria-label="Choose audited page"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
            >
              {data.pages.map((p) => (
                <option value={p.finalUrl} key={p.finalUrl}>
                  {new URL(p.finalUrl).pathname}
                </option>
              ))}
            </select>
          </div>
          {page ? (
            <>
              <h3 style={{ fontSize: 18 }}>{page.title || "Untitled page"}</h3>
              <div className="finding-evidence">
                {data.sample
                  ? "Example snapshot"
                  : page.htmlSource === "rendered"
                    ? "Firecrawl rendered HTML"
                    : "Fetched HTML"}{" "}
                · {displayDate(page.fetchedAt)}
                <br />
                {page.finalUrl}
                <br />
                HTTP {page.status || "status unavailable"} · {page.words}{" "}
                extracted words
              </div>
              <div className="toolbar">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await ctx.run({
                        kind: "recheck",
                        url: page.finalUrl,
                        notify: false,
                      });
                    } catch (e) {
                      ctx.notify((e as Error).message);
                    }
                  }}
                >
                  <RefreshCw size={14} />
                  Recheck · 1 page
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await ctx.run({ kind: "pagespeed", url: page.finalUrl });
                    } catch (e) {
                      ctx.notify((e as Error).message);
                    }
                  }}
                >
                  PageSpeed diagnostics <ArrowUpRight size={14} />
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              title="No pages on the menu yet"
              action={
                <Button onClick={ctx.openScan}>Run your first scan</Button>
              }
            >
              A bounded crawl saves the evidence your opportunities and drafts
              are based on.
            </EmptyState>
          )}
        </Panel>
        <div className="answer-panel">
          <div>
            <Badge tone="green">GOOD TO KNOW</Badge>
            <h3 style={{ marginTop: 15 }}>Context beats a mystery score.</h3>
            <p>
              Short pages can be useful. Multiple headings can be intentional.
              Missing evidence is a question to investigate. Every finding
              explains what was observed and what still needs your judgment.
            </p>
            <SmallLink href="/methodology">How we inspect a page</SmallLink>
          </div>
          <Maki pose="thinking" />
        </div>
      </div>
      {page && (
        <>
          <div className="audit-fix-plan">
            <div>
              <strong>A fix plan for this page.</strong>
              <p>
                All findings that need review, with evidence and acceptance
                checks.
              </p>
            </div>
            <CopyActions
              label="Copy page fix plan"
              filename="ranksushi-page-fix-plan.md"
              text={findingBundle(
                page.findings.map((f) => ({
                  key: f.id,
                  title: f.title,
                  url: page.finalUrl,
                  detail: f.detail,
                  recommendation: f.recommendation,
                  status: f.status,
                  evidence: f.evidence,
                })),
                page.finalUrl,
              )}
            />
          </div>
          <div className="toolbar">
            <div className="tab-pills">
              {[
                ["attention", "Needs a look"],
                ["all", "All checks"],
                ["pass", "Passed"],
                ["unknown", "Needs context"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={filter === id ? "active" : ""}
                  aria-pressed={filter === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="finding-list">
            {page.findings
              .filter(
                (f) =>
                  filter === "all" ||
                  (filter === "attention" &&
                    ["fail", "warning"].includes(f.status)) ||
                  f.status === filter,
              )
              .map((f) => (
                <Finding key={f.id} finding={f} />
              ))}
          </div>
        </>
      )}
      <div className="section-subheading">
        <h2>Job history</h2>
        <p>
          Stages reflect actual background work. Partial results stay available.
        </p>
      </div>
      {data.jobs.length ? (
        data.jobs.map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)
      ) : (
        <p>No jobs have been started yet.</p>
      )}
    </>
  );
}
export function SearchConsole(ctx: WorkspaceContext) {
  const { data, base } = ctx;
  const [dataset, setDataset] = useState("detail"),
    [rows, setRows] = useState<GscRow[]>([]),
    [loading, setLoading] = useState(false),
    [importing, setImporting] = useState(false);
  const performance = latestPeriod(data);
  useEffect(() => {
    if (data.sample) return;
    let stopped = false;
    request<{ rows: GscRow[] }>(
      `/api/projects/${data.project.id}/gsc/data?dataset=${dataset}`,
    )
      .then((r) => {
        if (!stopped) setRows(r.rows);
      })
      .catch(() => {});
    return () => {
      stopped = true;
    };
  }, [data.project.id, data.sample, dataset]);
  const shown = data.sample
    ? [
        {
          date: "2026-09-01",
          dataset: "detail",
          query: "how to choose olive oil",
          page: `${data.project.url}guides/choosing-olive-oil`,
          country: "usa",
          device: "MOBILE",
          clicks: 82,
          impressions: 1874,
          position: 6.8,
        },
        {
          date: "2026-09-01",
          dataset: "detail",
          query: "olive oil for cooking",
          page: `${data.project.url}collections/olive-oil`,
          country: "usa",
          device: "DESKTOP",
          clicks: 61,
          impressions: 2150,
          position: 9.2,
        },
      ]
    : rows;
  return (
    <>
      <div className="toolbar">
        <Badge
          tone={
            data.connections.gsc === "connected" || data.sample
              ? "green"
              : "neutral"
          }
        >
          {data.sample ? "Example property" : data.connections.gsc}
        </Badge>
        <span className="small-note">
          {data.project.gsc_property || "No property selected"}
        </span>
        <Button
          variant="secondary"
          busy={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await ctx.run({ kind: "gsc-sync", initial: !performance });
            } catch (e) {
              ctx.notify((e as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <RefreshCw size={14} />
          Sync data
        </Button>
        <Button variant="ghost" onClick={() => setImporting(true)}>
          Import CSV fallback
        </Button>
      </div>
      {performance ? (
        <>
          <div className="stats-grid">
            <Metric
              title="Clicks"
              value={fmt(performance.current.clicks)}
              note={`Previous: ${fmt(performance.previous.clicks)}`}
              icon={ChartNoAxesCombined}
            />
            <Metric
              title="Impressions"
              value={fmt(performance.current.impressions)}
              note={`Previous: ${fmt(performance.previous.impressions)}`}
              icon={Search}
            />
            <Metric
              title="Click-through rate"
              value={`${fmt(performance.current.ctr * 100)}%`}
              note={`Previous: ${fmt(performance.previous.ctr * 100)}%`}
              icon={ArrowUpRight}
            />
            <Metric
              title="Average position"
              value={fmt(performance.current.position)}
              note="Impression-weighted property average"
              icon={Globe2}
            />
          </div>
          <Panel
            title="People finding your website"
            note={`${performance.currentStart} – ${performance.end}, compared with the preceding 28 days`}
          >
            <PerformanceChart rows={performance.series} sample={data.sample} />
          </Panel>
          {!performance.complete && (
            <Notice>
              Coverage is incomplete: {performance.current.days}/28 current days
              and {performance.previous.days}/28 previous days. Compare these
              periods cautiously.
            </Notice>
          )}
        </>
      ) : (
        <div className="page-card">
          <EmptyState
            title="Your real search story starts here"
            action={
              <ButtonLink href={`${base}/settings`}>
                Connect Search Console <ArrowUpRight size={14} />
              </ButtonLink>
            }
          >
            Give RankSushi read-only access, choose the property for this
            website, and import up to 90 days. Sign-in and Search Console
            permission are separate.
          </EmptyState>
        </div>
      )}
      <Notice>
        Search Console’s API returns top detailed rows and may omit anonymized
        queries. We keep property totals separate to prevent double counting.
        Final data is imported through a conservative three-day delay; it is not
        real time.
      </Notice>
      <ResearchPanel ctx={ctx} />
      <div className="section-subheading">
        <h2>Queries with context</h2>
        <div className="toolbar">
          <div className="tab-pills">
            <button
              className={dataset === "detail" ? "active" : ""}
              onClick={() => setDataset("detail")}
              aria-pressed={dataset === "detail"}
            >
              API details
            </button>
            <button
              className={dataset === "csv" ? "active" : ""}
              onClick={() => setDataset("csv")}
              aria-pressed={dataset === "csv"}
            >
              CSV fallback
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              download("ranksushi-search-console.csv", toCsv(shown), "text/csv")
            }
          >
            <Download size={14} />
            Export displayed rows
          </Button>
        </div>
      </div>
      <div
        className="panel table-wrap"
        role="region"
        tabIndex={0}
        aria-label="Search Console query table"
      >
        <table className="data-table">
          <caption className="sr-only">
            {data.sample ? "Illustrative " : ""}Search Console detailed records
          </caption>
          <thead>
            <tr>
              <th>Query / page</th>
              <th>Date</th>
              <th>Clicks</th>
              <th>Impressions</th>
              <th>Position</th>
              <th>Country / device</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                <td>
                  <strong>{r.query || "(aggregate)"}</strong>
                  <small>
                    {r.page ? new URL(r.page).pathname : "All pages"}
                  </small>
                  {!data.sample && r.query && r.page && (
                    <Link
                      className="text-link"
                      href={`${ctx.base}?${new URLSearchParams({ query: r.query, url: r.page })}`}
                    >
                      Explore in SERP Studio <ArrowUpRight size={12} />
                    </Link>
                  )}
                </td>
                <td>{r.date}</td>
                <td>{fmt(r.clicks)}</td>
                <td>{fmt(r.impressions)}</td>
                <td>{fmt(r.position)}</td>
                <td>
                  {r.country || "All"} · {r.device || "All"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && (
          <EmptyState
            title={
              dataset === "csv"
                ? "No CSV records yet"
                : "No detailed records yet"
            }
          >
            {dataset === "csv"
              ? "Import a dated CSV export. Its rows stay separate from API data."
              : "Connect a property and complete the first import to see queries here."}
          </EmptyState>
        )}
      </div>
      <p className="small-note" style={{ marginTop: 12 }}>
        Displays up to 1,000 recent rows. CSV records never change the API
        totals above.
      </p>
      {importing && (
        <ImportModal ctx={ctx} onClose={() => setImporting(false)} />
      )}
    </>
  );
}
function ImportModal({
  ctx,
  onClose,
}: {
  ctx: WorkspaceContext;
  onClose: () => void;
}) {
  const [csv, setCsv] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Bring your Search Console CSV" onClose={onClose}>
      <p className="form-intro">
        Use a dated export with Date, Clicks, Impressions, and Position columns.
        Optional dimensions: Query, Page, Country, Device.
      </p>
      <label className="field">
        CSV file
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f && f.size <= 900000) setCsv(await f.text());
            else setError("Choose a CSV file smaller than 900 KB.");
          }}
        />
      </label>
      <div className="field">
        <label htmlFor="csv-data">Or paste CSV data</label>
        <textarea
          id="csv-data"
          rows={7}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="Date,Clicks,Impressions,Position"
        />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button
        busy={busy}
        disabled={!csv}
        onClick={async () => {
          if (ctx.data.sample) {
            ctx.notify(
              "Create a real workspace to import Search Console data.",
            );
            onClose();
            return;
          }
          setBusy(true);
          try {
            const r = await request<{ imported: number }>(
              `/api/projects/${ctx.data.project.id}/gsc/import`,
              { csv },
            );
            ctx.notify(`Imported ${r.imported} rows as CSV fallback data.`);
            ctx.refresh();
            onClose();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Import records
      </Button>
    </Modal>
  );
}
const draftKinds: [DraftKind, string, string][] = [
  [
    "brief",
    "Content brief",
    "A focused outline, questions to answer, and sources.",
  ],
  [
    "metadata",
    "Title & description",
    "A clearer invitation in search results.",
  ],
  ["content", "Content draft", "A useful first draft grounded in your pages."],
  [
    "internal-links",
    "Internal links",
    "Relevant connections between known pages.",
  ],
  ["schema", "Structured data", "JSON-LD supported by visible page content."],
  ["coach", "Ask Maki", "A direct answer, with the evidence attached."],
];
export function ContentStudio(ctx: WorkspaceContext) {
  const { data } = ctx;
  const params = useSearchParams();
  const rawKind = params.get("kind");
  const [kind, setKind] = useState<DraftKind>(
    draftKinds.some((d) => d[0] === rawKind) ? (rawKind as DraftKind) : "brief",
  );
  const [prompt, setPrompt] = useState(params.get("prompt") || ""),
    [url, setUrl] = useState(
      params.get("url") || data.pages[0]?.finalUrl || "",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<string | null>(null);
  const selectedDraft = data.drafts.find((d) => d.id === selected);
  const remaining =
    data.limits.drafts -
    (data.usage.find((u) => u.kind === "drafts")?.amount || 0);
  return (
    <>
      <div className="studio-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>What are we making?</h2>
              <p>One bounded deliverable per drafting action.</p>
            </div>
            <Badge tone="green">{remaining} left</Badge>
          </div>
          <form
            className="panel-body"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await ctx.run({
                  kind: "draft",
                  draftKind: kind,
                  prompt,
                  url: url || undefined,
                  notify: false,
                });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="draft-kinds">
              {draftKinds.map(([id, title, description]) => (
                <button
                  type="button"
                  key={id}
                  className={kind === id ? "selected" : ""}
                  aria-pressed={kind === id}
                  onClick={() => setKind(id)}
                >
                  <PenLine size={16} />
                  <strong>{title}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="draft-page">Primary source page</label>
              <select
                id="draft-page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              >
                <option value="">All saved pages</option>
                {data.pages.map((p) => (
                  <option key={p.finalUrl} value={p.finalUrl}>
                    {new URL(p.finalUrl).pathname}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="draft-prompt">What would make this useful?</label>
              <textarea
                id="draft-prompt"
                rows={4}
                maxLength={3000}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Who is this for? What question should it answer? Add any tone or format preferences."
              />
            </div>
            <p className="small-note">
              Uses your latest saved page evidence and the SEO kitchen’s
              editorial guidance. Unsupported claims are flagged for your
              confirmation. Review all content before publishing.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button className="full" style={{ marginTop: 18 }} busy={busy}>
              <Sparkles size={15} />
              Prepare my {kind === "coach" ? "answer" : "draft"} · 1 action
            </Button>
          </form>
        </div>
        <div className="studio-side">
          <div className="answer-panel">
            <div>
              <Badge tone="green">YOUR EDITOR, NOT YOUR AUTOPILOT</Badge>
              <h3 style={{ marginTop: 15 }}>
                A first draft.
                <br />
                Your final say.
              </h3>
              <p>
                Maki brings the evidence. You bring the judgment. Edit, confirm,
                export, and publish using your own website editor.
              </p>
            </div>
            <Maki pose="thinking" />
          </div>
          <div className="page-card">
            <h2>Fresh from the studio</h2>
            {data.drafts.length ? (
              data.drafts.map((d) => (
                <button
                  className="draft-row"
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                >
                  <span className="task-symbol">
                    <FileText size={17} />
                  </span>
                  <div>
                    <strong>{d.title}</strong>
                    <small>
                      {d.kind} · {d.draft_revisions.length}{" "}
                      {d.draft_revisions.length === 1 ? "version" : "versions"}
                    </small>
                  </div>
                  <ArrowUpRight size={15} />
                </button>
              ))
            ) : (
              <p>
                Completed drafts appear here, with version history and exports.
                Your first one is a prompt away.
              </p>
            )}
          </div>
        </div>
      </div>
      {selectedDraft && (
        <DraftEditor
          draft={selectedDraft}
          ctx={ctx}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
function DraftEditor({
  draft,
  ctx,
  onClose,
}: {
  draft: SavedDraft;
  ctx: WorkspaceContext;
  onClose: () => void;
}) {
  const revisions = [...draft.draft_revisions].sort(
    (a, b) => b.version - a.version,
  );
  const [text, setText] = useState(revisions[0]?.content || ""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  return (
    <Modal title={draft.title} onClose={onClose}>
      {draft.metadata?.model && (
        <p className="small-note">
          Prepared with {draft.metadata.model}. Sources and confirmation
          requests describe the original generated version.
        </p>
      )}
      {!!draft.metadata?.evidenceUrls?.length && (
        <p className="small-note">
          Evidence:{" "}
          {draft.metadata.evidenceUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-link"
            >
              {url}{" "}
            </a>
          ))}
        </p>
      )}
      {!!draft.metadata?.guidanceSources?.length && (
        <div className="notice">
          <strong>Editorial guidance used</strong>
          <ul>
            {draft.metadata.guidanceSources.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/learn/${g.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {g.title}
                </Link>{" "}
                · version {g.version}
              </li>
            ))}
          </ul>
          <p className="small-note">
            Methods used to prepare this draft; your page snapshots remain the
            business evidence.
          </p>
        </div>
      )}
      {!!draft.metadata?.needsConfirmation?.length && (
        <Notice>
          <strong>Confirm before using:</strong>{" "}
          {draft.metadata.needsConfirmation.join("; ")}
        </Notice>
      )}
      <div className="toolbar">
        <Badge tone="green">{draft.kind}</Badge>
        <label className="small-note" htmlFor="draft-version">
          Load version
        </label>
        <select
          id="draft-version"
          defaultValue={revisions[0]?.version}
          onChange={(e) => {
            setText(
              revisions.find((r) => r.version === Number(e.target.value))
                ?.content || "",
            );
            setSaved(false);
          }}
        >
          {revisions.map((r) => (
            <option key={r.id} value={r.version}>
              Version {r.version} · {displayDate(r.created_at)}
            </option>
          ))}
        </select>
      </div>
      <label className="sr-only" htmlFor="draft-content">
        Edit draft content
      </label>
      <textarea
        className="draft-editor"
        id="draft-content"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
      />
      <Notice>
        Review factual claims and source URLs before you publish. Exporting
        downloads your current edits. It does not change your website.
      </Notice>
      <div className="toolbar">
        <Button
          busy={busy}
          onClick={async () => {
            setBusy(true);
            try {
              if (!ctx.data.sample)
                await request(
                  `/api/projects/${ctx.data.project.id}/drafts/${draft.id}`,
                  { content: text },
                  "PATCH",
                );
              setSaved(true);
              ctx.notify(
                ctx.data.sample
                  ? "Example draft edited locally. It resets when this demo closes."
                  : "Saved a new draft revision.",
              );
              ctx.refresh();
            } catch (e) {
              ctx.notify((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {saved ? <Check size={14} /> : <PenLine size={14} />}Save revision
        </Button>
        {["md", "html", "json", "csv"].map((format) => (
          <Button
            key={format}
            variant="secondary"
            onClick={() => {
              const result =
                format === "md"
                  ? text
                  : format === "html"
                    ? `<!doctype html><html lang="${ctx.data.project.language}"><meta charset="utf-8"><title>${escapeHtml(draft.title)}</title><article><h1>${escapeHtml(draft.title)}</h1><pre style="white-space:pre-wrap">${escapeHtml(text)}</pre></article></html>`
                    : format === "csv"
                      ? toCsv([
                          {
                            title: draft.title,
                            kind: draft.kind,
                            content: text,
                          },
                        ])
                      : (() => {
                          try {
                            return JSON.stringify(JSON.parse(text), null, 2);
                          } catch {
                            return JSON.stringify(
                              {
                                title: draft.title,
                                kind: draft.kind,
                                content: text,
                              },
                              null,
                              2,
                            );
                          }
                        })();
              download(
                `ranksushi-draft.${format}`,
                result,
                format === "html"
                  ? "text/html"
                  : format === "json"
                    ? "application/json"
                    : format === "csv"
                      ? "text/csv"
                      : "text/markdown",
              );
            }}
          >
            <Download size={12} />
            {format.toUpperCase()}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
export function AIVisibility(ctx: WorkspaceContext) {
  const { data } = ctx;
  const [provider, setProvider] = useState("openai"),
    [prompt, setPrompt] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const first = data.pages[0];
  const readiness = [
    [
      "Answer clarity",
      "Does this page answer its main question directly?",
      null,
    ],
    [
      "Entity consistency",
      "Are your name, services, and contact details consistent?",
      null,
    ],
    [
      "Source support",
      "Can readers follow evidence behind important claims?",
      null,
    ],
    [
      "Authorship",
      "Can readers identify who is responsible for advice?",
      first?.author ? "Observed" : "Review",
    ],
    [
      "Crawlability",
      "Can the intended page be fetched and inspected?",
      first
        ? first.status >= 200 && first.status < 300
          ? "Observed"
          : "Review"
        : null,
    ],
    [
      "Structured data",
      "Does relevant markup accurately describe visible content?",
      first?.schema.length ? "Review match" : "Review relevance",
    ],
  ];
  return (
    <>
      <div className="answer-banner">
        <div>
          <Badge tone="green">CLARITY, WITH THE CAVEATS INCLUDED</Badge>
          <h2>
            Be a useful answer.
            <br />
            Then see what comes back.
          </h2>
          <p>
            Readiness is a checklist for clearer content. Live checks sample API
            answers to specific prompts. They do not measure every consumer AI
            experience or guarantee a citation.
          </p>
        </div>
        <Maki pose="wave" />
      </div>
      <div className="readiness-grid">
        {readiness.map(([title, description, status]) => (
          <article className="readiness-card" key={title}>
            <div>
              <CheckCircle2 size={17} />
              <Badge tone={status === "Observed" ? "green" : "neutral"}>
                {status || "Needs evidence"}
              </Badge>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="two-col">
        <Panel
          title="Ask a real question"
          note="One prompt × one provider = one answer check."
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await ctx.run({ kind: "ai-check", provider, prompt });
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label htmlFor="answer-provider">Answer provider</label>
              <select
                id="answer-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI with web search</option>
                <option value="perplexity">Perplexity Agent API</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="answer-prompt">Exact prompt to sample</label>
              <textarea
                id="answer-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                minLength={10}
                maxLength={1000}
                required
                placeholder="What would a potential customer ask about your product or service?"
              />
            </div>
            <p className="small-note">
              Market: {data.project.country}. We save the prompt, returned
              model, time, answer, citations, and detected mentions of “
              {data.project.name}”.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button busy={busy} style={{ marginTop: 18 }}>
              <Orbit size={15} />
              Run answer check · 1 check
            </Button>
          </form>
        </Panel>
        <Panel
          title="Google SERP evidence"
          note="An on-demand look at organic search results."
        >
          <SmallLink href={`${ctx.base}/search-console#market-research`}>
            Open search research
          </SmallLink>
          <Notice>
            Google does not require special AI markup. Relevant structured data
            must match what people can see on the page. There is no separate
            Google AI eligibility score.
          </Notice>
          <ExternalLink href="https://developers.google.com/search/docs/appearance/ai-features">
            Google’s AI feature guidance
          </ExternalLink>
        </Panel>
      </div>
      <div className="section-subheading">
        <h2>Sampled answers</h2>
        <p>Each result describes one response at one point in time.</p>
      </div>
      {data.answers.length ? (
        data.answers.map((a) => (
          <article className="answer-result panel" key={a.id}>
            <div className="panel-header">
              <div>
                <h2>{a.provider}</h2>
                <p>
                  {a.model} · {new Date(a.created_at).toLocaleString("en-US")} ·{" "}
                  {a.market}
                </p>
              </div>
              <Badge tone="orange">
                {data.sample ? "Illustrative example" : "Sampled API answer"}
              </Badge>
            </div>
            <div className="panel-body">
              <blockquote>{a.prompt}</blockquote>
              <p className="answer-text">{a.answer}</p>
              <div className="finding-evidence">
                Brand mentions detected:{" "}
                {a.mentions.length
                  ? a.mentions.join(", ")
                  : "None in this answer"}
                . Mention detection is a text match; it is not an endorsement or
                ranking.
              </div>
              <h3 className="sources-title">Returned citations</h3>
              <ul className="source-list">
                {a.citations.map((c, i) => (
                  <li key={`${c.url}-${i}`}>
                    {data.sample ? (
                      <span>
                        {c.title} <small>(example URL)</small>
                      </span>
                    ) : (
                      <ExternalLink href={c.url}>{c.title}</ExternalLink>
                    )}
                  </li>
                ))}
              </ul>
              {!a.citations.length && (
                <p className="small-note">
                  No citations were returned with this answer.
                </p>
              )}
            </div>
          </article>
        ))
      ) : (
        <EmptyState title="Your first sample is one question away">
          Run a prompt to see the answer and its returned sources here. Try the
          same prompt later to compare observations.
        </EmptyState>
      )}
    </>
  );
}
export function Reports(ctx: WorkspaceContext) {
  const { data } = ctx;
  const [busy, setBusy] = useState(false),
    [share, setShare] = useState("");
  return (
    <>
      <div className="welcome-panel">
        <div>
          <h2>Your progress, with the receipts.</h2>
          <p>
            Bring completed work, remaining findings, and observed search
            performance into one report. Export it, or create a revocable link
            that expires after 30 days.
          </p>
          <Button
            busy={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await ctx.run({
                  kind: "report",
                  title: `${data.project.name} · Fresh findings`,
                  notify: false,
                });
              } catch (e) {
                ctx.notify((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus size={14} />
            Prepare a report
          </Button>
        </div>
        <Maki pose="happy" />
      </div>
      {data.sample && (
        <div className="page-card">
          <Badge tone="orange">ILLUSTRATIVE EXPORT</Badge>
          <h2 style={{ marginTop: 12 }}>A taste of your next report</h2>
          <p>
            Download the example opportunities as a CSV to see how evidence
            travels with each finding.
          </p>
          <Button
            variant="secondary"
            style={{ marginTop: 18 }}
            onClick={() =>
              download(
                "ranksushi-example-report.csv",
                toCsv(
                  data.opportunities.map((o) => ({
                    classification: "Illustrative sample",
                    finding: o.title,
                    status: o.status,
                    evidence: o.detail,
                    page: o.page_url,
                  })),
                ),
                "text/csv",
              )
            }
          >
            <Download size={14} />
            Download sample CSV
          </Button>
        </div>
      )}
      {data.reports.map((r) => (
        <article key={r.id} className="report-card panel">
          <div>
            <span className="report-icon">
              <FileText size={23} />
            </span>
            <h2>{r.title}</h2>
            <p>
              Prepared {displayDate(r.created_at)} ·{" "}
              {r.share_expires_at
                ? `Sharing expires ${displayDate(r.share_expires_at)}`
                : "Private report"}
            </p>
          </div>
          <div className="toolbar">
            <a
              className="button secondary"
              href={`/api/reports/${r.id}?format=pdf`}
            >
              <Download size={13} />
              PDF
            </a>
            <a
              className="button secondary"
              href={`/api/reports/${r.id}?format=csv`}
            >
              CSV
            </a>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const result = await request<{ url: string }>(
                    `/api/reports/${r.id}`,
                    { action: "share" },
                  );
                  setShare(result.url);
                  ctx.refresh();
                } catch (e) {
                  ctx.notify((e as Error).message);
                }
              }}
            >
              <Link2 size={13} />
              Create sharing link
            </Button>
            {r.share_expires_at && (
              <Button
                variant="ghost"
                onClick={async () => {
                  await request(`/api/reports/${r.id}`, { action: "revoke" });
                  setShare("");
                  ctx.refresh();
                  ctx.notify("The sharing link has been revoked.");
                }}
              >
                Revoke link
              </Button>
            )}
          </div>
        </article>
      ))}
      {!data.reports.length && !data.sample && (
        <EmptyState title="A clean plate, ready for a report">
          Complete an audit, prepare a change, or connect Search Console. Your
          report will include the evidence available when it is generated.
        </EmptyState>
      )}
      <Notice>
        Reports describe observed associations, not proven causes of ranking or
        traffic changes. No synthetic competitors, invented gains, or
        unsupported success stories are included.
      </Notice>
      {share && (
        <Modal title="Your report sharing link" onClose={() => setShare("")}>
          <p className="form-intro">
            Anyone with this link can view the report for 30 days. Revoking it
            immediately stops future access. Creating a new link replaces the
            previous one.
          </p>
          <label className="field">
            Report link
            <input readOnly value={share} onFocus={(e) => e.target.select()} />
          </label>
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(share);
              ctx.notify("Report link copied.");
            }}
          >
            Copy link
          </Button>
        </Modal>
      )}
    </>
  );
}
export function Settings(ctx: WorkspaceContext) {
  const { data } = ctx;
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(
    searchParams.get("gsc")
      ? "connections"
      : searchParams.get("tab") === "billing" ||
          searchParams.get("plan") ||
          searchParams.get("billing")
        ? "billing"
        : "project",
  );
  return (
    <>
      <div className="toolbar tab-pills">
        {[
          ["project", "Your project"],
          ["connections", "Connections"],
          ["billing", "Plan & billing"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "project" && <ProjectSettings ctx={ctx} />}{" "}
      {tab === "connections" && <Connections ctx={ctx} />}{" "}
      {tab === "billing" && <Billing ctx={ctx} />}
      <p className="small-note" style={{ marginTop: 30 }}>
        Workspace owner: {data.email}. One owner per workspace at launch.{" "}
        <Link href="/security" className="text-link">
          How your data is protected ↗
        </Link>
      </p>
    </>
  );
}
function ProjectSettings({ ctx }: { ctx: WorkspaceContext }) {
  const { data } = ctx;
  const [name, setName] = useState(data.project.name),
    [description, setDescription] = useState(data.project.description),
    [country, setCountry] = useState(data.project.country),
    [language, setLanguage] = useState(data.project.language),
    [weekly, setWeekly] = useState(data.project.weekly_scan),
    [limit, setLimit] = useState(data.project.scan_limit),
    [digest, setDigest] = useState(data.project.email_digest),
    [busy, setBusy] = useState(false);
  return (
    <div className="two-col">
      <Panel
        title="A little about your business"
        note="Good context makes the next step more useful."
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              if (!data.sample)
                await request(
                  `/api/projects/${data.project.id}`,
                  {
                    name,
                    description,
                    country,
                    language,
                    weekly_scan: weekly,
                    scan_limit: limit,
                    email_digest: digest,
                  },
                  "PATCH",
                );
              ctx.notify(
                data.sample
                  ? "Example preferences are not saved to a real account."
                  : "Your project preferences are saved.",
              );
              ctx.refresh();
            } catch (e) {
              ctx.notify((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field">
            <label htmlFor="project-name">Business / project name</label>
            <input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="project-url">Website</label>
            <input id="project-url" value={data.project.url} readOnly />
            <p>Create a separate project for a different website.</p>
          </div>
          <div className="field">
            <label htmlFor="project-description">
              What do you do, and who is it for?
            </label>
            <textarea
              id="project-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={2000}
              required
            />
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="project-country">Target country</label>
              <select
                id="project-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                {COUNTRIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="project-language">Content language</label>
              <select
                id="project-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              >
                {LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings-divider" />
          <h3>Freshness, on your terms</h3>
          <label className="consent-check">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => setWeekly(e.target.checked)}
            />
            Scan this website weekly (paid plans; uses the same page allowance).
          </label>
          <div className="field">
            <label htmlFor="weekly-limit">Maximum pages per weekly scan</label>
            <input
              id="weekly-limit"
              type="number"
              min={1}
              max={200}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>
          <label className="consent-check">
            <input
              type="checkbox"
              checked={digest}
              onChange={(e) => setDigest(e.target.checked)}
            />
            Send me an optional weekly digest. I can turn it off here at any
            time.
          </label>
          <Button busy={busy}>
            Save preferences <Check size={14} />
          </Button>
        </form>
      </Panel>
      <div className="answer-panel">
        <div>
          <h3>
            The right context.
            <br />A better first draft.
          </h3>
          <p>
            Your target country informs market-specific checks. Your content
            language guides drafts. Neither changes the language of your website
            automatically.
          </p>
          <p>
            Weekly scans run on Mondays. Daily Search Console imports are
            included with paid plans when a property is connected.
          </p>
        </div>
        <Maki pose="thinking" />
      </div>
    </div>
  );
}
function Connections({ ctx }: { ctx: WorkspaceContext }) {
  const { data } = ctx;
  const [properties, setProperties] = useState<
      { siteUrl: string; permissionLevel: string }[]
    >([]),
    [property, setProperty] = useState(data.project.gsc_property || ""),
    [busy, setBusy] = useState("");
  const connected = data.connections.gsc === "connected";
  const action = async (name: string, fn: () => Promise<void>) => {
    if (data.sample) {
      ctx.notify(
        "Connect providers in your own workspace. The demo contains illustrative data only.",
      );
      return;
    }
    setBusy(name);
    try {
      await fn();
    } catch (e) {
      ctx.notify((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <Panel
        title="Google Search Console"
        note="A separate, read-only connection. Your Google sign-in does not grant it automatically."
      >
        <div className="connection-main">
          <span className="google-g large">G</span>
          <div>
            <h3>Your website’s search evidence</h3>
            <p>
              We request webmasters.readonly, list your verified properties, and
              store refresh credentials on the server.
            </p>
          </div>
          <Badge tone={connected ? "green" : "neutral"}>
            {data.connections.gsc}
          </Badge>
        </div>
        <div className="toolbar">
          <Button
            busy={busy === "connect"}
            onClick={() =>
              action("connect", async () => {
                const r = await request<{ url: string }>("/api/gsc/connect", {
                  projectId: data.project.id,
                });
                location.assign(r.url);
              })
            }
          >
            {connected ? "Reconnect Google" : "Connect Search Console"}
            <ArrowUpRight size={14} />
          </Button>
          {connected && (
            <>
              <Button
                variant="secondary"
                busy={busy === "properties"}
                onClick={() =>
                  action("properties", async () => {
                    const r = await request<{
                      properties: {
                        siteUrl: string;
                        permissionLevel: string;
                      }[];
                    }>(`/api/projects/${data.project.id}/gsc`);
                    setProperties(r.properties);
                  })
                }
              >
                Choose property
              </Button>
              <Button
                variant="ghost"
                busy={busy === "disconnect"}
                onClick={() =>
                  action("disconnect", async () => {
                    await request(
                      `/api/projects/${data.project.id}/gsc`,
                      undefined,
                      "DELETE",
                    );
                    ctx.refresh();
                    ctx.notify(
                      "Search Console disconnected. Saved evidence is retained.",
                    );
                  })
                }
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
        {properties.length > 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action("save-property", async () => {
                const r = await request<{ job: unknown }>(
                  `/api/projects/${data.project.id}/gsc`,
                  { property },
                );
                ctx.refresh();
                ctx.notify(
                  r.job
                    ? "Property saved. Your 90-day import is queued."
                    : "Property saved. Choose a paid plan to start daily imports.",
                );
              });
            }}
          >
            <div className="field">
              <label htmlFor="gsc-property">Verified property</label>
              <select
                id="gsc-property"
                required
                value={property}
                onChange={(e) => setProperty(e.target.value)}
              >
                <option value="">Choose this website’s property</option>
                {properties.map((p) => (
                  <option key={p.siteUrl} value={p.siteUrl}>
                    {p.siteUrl}
                  </option>
                ))}
              </select>
            </div>
            <Button busy={busy === "save-property"}>
              Save property and import
            </Button>
          </form>
        )}
        <p className="small-note">
          {data.project.gsc_property
            ? `Selected: ${data.project.gsc_property}`
            : "No property selected yet."}{" "}
          You can revoke access in your Google account at any time.
        </p>
      </Panel>
      <div className="section-subheading">
        <h2>Good ingredients</h2>
        <p>
          Platform connections are configured by the operator. A configured key
          is not a successful live validation.
        </p>
      </div>
      {[
        ["firecrawl", "Firecrawl", "Page discovery and rendered HTML."],
        [
          "openai",
          "OpenAI",
          "Evidence-grounded drafts and sampled web answers.",
        ],
        [
          "perplexity",
          "Perplexity",
          "A second provider for sampled API answers.",
        ],
        [
          "serp",
          "DataForSEO",
          "Live Google listings and keyword-demand estimates.",
        ],
        [
          "pagespeed",
          "Google PageSpeed",
          "Mobile lab diagnostics and field data when available.",
        ],
        ["background", "Inngest", "Persistent jobs, retries, and schedules."],
        ["email", "Resend", "Authentication delivery and requested notices."],
      ].map(([id, title, description]) => (
        <div className="integration-card" key={id}>
          <span className="integration-symbol">
            <Globe2 size={20} />
          </span>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <Badge tone={data.connections.providers[id] ? "green" : "neutral"}>
            {data.connections.providers[id]
              ? "Configured · validate on use"
              : "Setup required"}
          </Badge>
        </div>
      ))}
    </>
  );
}
function Billing({ ctx }: { ctx: WorkspaceContext }) {
  const { data } = ctx;
  const [busy, setBusy] = useState(""),
    [confirm, setConfirm] = useState<{
      action: "cancel" | "resume" | "change";
      plan?: (typeof PAID_PLANS)[number];
    } | null>(null);
  const paid = data.plan !== "free";
  const run = async (id: string, fn: () => Promise<void>) => {
    if (data.sample) {
      ctx.notify("Billing is disabled in the illustrative workspace.");
      return;
    }
    setBusy(id);
    try {
      await fn();
    } catch (e) {
      ctx.notify((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <Panel
        title={`${PLANS[data.plan as keyof typeof PLANS]?.name || "Free"} workspace`}
        note={
          data.subscription?.period_end
            ? `Current period ends ${new Date(data.subscription.period_end).toLocaleDateString("en-US")}. Status: ${data.subscription.status}.`
            : "Your saved results stay accessible when paid access ends."
        }
      >
        <div className="usage-grid">
          {(["pages", "drafts", "answers", "serps"] as const).map((kind) => {
            const used = data.usage.find((u) => u.kind === kind)?.amount || 0;
            return (
              <div key={kind}>
                <div>
                  <strong>
                    {kind === "answers"
                      ? "Answer checks"
                      : kind === "serps"
                        ? "SERP lookups"
                        : kind === "pages"
                          ? "Crawled pages"
                          : "Drafting actions"}
                  </strong>
                  <span>
                    {used} / {data.limits[kind]}
                  </span>
                </div>
                <progress
                  value={used}
                  max={Math.max(1, data.limits[kind])}
                  aria-label={`${kind} allowance used`}
                />
              </div>
            );
          })}
        </div>
        <div className="toolbar">
          <Button
            variant="secondary"
            busy={busy === "portal"}
            onClick={() =>
              run("portal", async () => {
                const r = await request<{ url: string }>(
                  "/api/billing/portal",
                  {},
                );
                location.assign(r.url);
              })
            }
          >
            Payment methods & invoices <ExternalIcon size={14} />
          </Button>
          {paid && (
            <Button
              variant="ghost"
              onClick={() =>
                setConfirm({
                  action: data.subscription?.cancel_at_period_end
                    ? "resume"
                    : "cancel",
                })
              }
            >
              {data.subscription?.cancel_at_period_end
                ? "Resume renewal"
                : "Cancel at period end"}
            </Button>
          )}
        </div>
        {data.subscription?.cancel_at_period_end && (
          <Notice>
            Cancellation is scheduled. Your current allowance stays available
            until this paid period ends. Existing results are retained.
          </Notice>
        )}
      </Panel>
      <div className="section-subheading">
        <h2>Choose your appetite</h2>
        <p>
          Monthly USD subscriptions, with fixed shared allowances. Changes start
          next billing period.
        </p>
      </div>
      <div className="price-grid">
        {PAID_PLANS.map((p) => (
          <div
            key={p}
            className={`price-card ${p === "nigiri" ? "featured" : ""}`}
          >
            <h3>{PLANS[p].name}</h3>
            <div className="price-amount">
              ${PLANS[p].price}
              <span>/ month</span>
            </div>
            <p>
              {PLANS[p].limits.projects} projects · {PLANS[p].limits.pages}{" "}
              pages
            </p>
            <ul className="plain-list">
              <li>{PLANS[p].limits.drafts} drafting actions</li>
              <li>{PLANS[p].limits.answers} answer checks</li>
              <li>{PLANS[p].limits.serps} SERP lookups</li>
            </ul>
            <Button
              variant={p === data.plan ? "secondary" : "primary"}
              disabled={p === data.plan}
              busy={busy === p}
              onClick={() =>
                paid
                  ? setConfirm({ action: "change", plan: p })
                  : run(p, async () => {
                      const r = await request<{ url: string }>(
                        "/api/billing/checkout",
                        { plan: p },
                      );
                      location.assign(r.url);
                    })
              }
            >
              {p === data.plan
                ? "Current plan"
                : paid
                  ? `Change to ${PLANS[p].name}`
                  : `Choose ${PLANS[p].name}`}
            </Button>
          </div>
        ))}
      </div>
      <Notice>
        No automatic overages or credit packs. A drafting action produces one
        bounded deliverable. One answer check runs one prompt against one
        provider. Recrawls consume page allowance. Applicable tax is displayed
        at Checkout.
      </Notice>
      {confirm && (
        <Modal
          title={
            confirm.action === "cancel"
              ? "Cancel your subscription?"
              : confirm.action === "resume"
                ? "Resume renewal?"
                : "Schedule a plan change?"
          }
          onClose={() => setConfirm(null)}
        >
          <p className="form-intro">
            {confirm.action === "cancel"
              ? "Cancellation takes effect at the end of your current billing period. Saved results remain available in read-only mode."
              : confirm.action === "resume"
                ? "Your subscription will renew at the end of this billing period."
                : `Your workspace will move to ${PLANS[confirm.plan!].name} at $${PLANS[confirm.plan!].price}/month at the next renewal. Existing results are retained; new work will use that plan’s limits.`}
          </p>
          <Button
            busy={busy === "change"}
            onClick={() =>
              run("change", async () => {
                const r = await request<{ message: string }>(
                  "/api/billing/subscription",
                  confirm,
                );
                ctx.notify(r.message);
                setConfirm(null);
                ctx.refresh();
              })
            }
          >
            Confirm{" "}
            {confirm.action === "cancel"
              ? "cancellation"
              : confirm.action === "resume"
                ? "renewal"
                : "scheduled change"}
          </Button>
        </Modal>
      )}
    </>
  );
}
