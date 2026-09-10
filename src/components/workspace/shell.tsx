"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  House,
  Sparkles,
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  FileText,
  Settings2,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Menu,
  LogOut,
  RefreshCw,
  Info,
  Search,
  Globe2,
  Focus,
} from "lucide-react";
import { SerpStudio } from "./serp-studio";
import { Logo, Maki } from "../maki";
import { Badge, Button } from "../ui";
import { NAV, PLANS, type AppSection } from "@/lib/plans";
import type { ProjectData } from "@/lib/server/project-data";
import { Modal, Notice, request } from "./shared";
import {
  Overview,
  Opportunities,
  Audits,
  SearchConsole,
  ContentStudio,
  AIVisibility,
  Reports,
  Settings,
} from "./views";
const icons = [
  Focus,
  House,
  Sparkles,
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  FileText,
  Settings2,
];
export type WorkspaceContext = {
  data: ProjectData;
  base: string;
  refresh: () => void;
  notify: (text: string) => void;
  run: (body: Record<string, unknown>) => Promise<void>;
  openScan: () => void;
};
const titles: Record<AppSection, [string, string]> = {
  "serp-studio": ["SERP Studio", "See the search. Make your next move."],
  overview: [
    "A fresh perspective",
    "What needs attention, what to do next, and what changed.",
  ],
  opportunities: [
    "Your next useful moves",
    "A little evidence. A clear next step.",
  ],
  audits: [
    "Fresh findings",
    "See what your pages are serving, with the evidence alongside.",
  ],
  "search-console": [
    "Let your data do the talking",
    "Real queries. Real visitors. A little more clarity.",
  ],
  "content-studio": [
    "Good ideas, ready to roll",
    "Prepare it. Make it yours. Publish it through your own website editor.",
  ],
  "ai-visibility": [
    "See how your story is served",
    "Answer readiness and sampled API answers, with their limits in view.",
  ],
  reports: [
    "All rolled up",
    "Your completed work, remaining opportunities, and observed performance.",
  ],
  settings: [
    "Make yourself at home",
    "Your website, connections, preferences, and billing.",
  ],
};
export function Workspace({
  initial,
  section,
}: {
  initial: ProjectData;
  section: AppSection;
}) {
  const [data, setData] = useState(initial),
    [message, setMessage] = useState(""),
    [scanning, setScanning] = useState(false);
  const router = useRouter();
  const base = data.sample ? "/demo" : `/app/${data.project.id}`;
  const refresh = useCallback(() => {
    if (!data.sample)
      request<ProjectData>(`/api/projects/${data.project.id}`)
        .then(setData)
        .catch((e) => setMessage(e.message));
  }, [data.project.id, data.sample]);
  const active = data.jobs.some((j) =>
    ["queued", "running"].includes(j.status),
  );
  useEffect(() => {
    if (!active || data.sample) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [active, data.sample, refresh]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(t);
  }, [message]);
  const run = async (body: Record<string, unknown>) => {
    if (data.sample) {
      setMessage(
        "This is the example workspace. Create your own project to run a live job.",
      );
      return;
    }
    await request(`/api/projects/${data.project.id}/jobs`, body);
    setMessage("Your job is saved. You can close this tab while it runs.");
    refresh();
  };
  const ctx: WorkspaceContext = {
    data,
    base,
    refresh,
    notify: setMessage,
    run,
    openScan: () => setScanning(true),
  };
  const nav = (mobile = false) => (
    <nav
      className={mobile ? "" : "app-nav"}
      aria-label={mobile ? "Mobile workspace" : "Workspace"}
    >
      {NAV.map((item, i) => {
        const Icon = icons[i];
        return (
          <Link
            key={item.id}
            href={item.id === "serp-studio" ? base : `${base}/${item.id}`}
            className={section === item.id ? "active" : ""}
            aria-current={section === item.id ? "page" : undefined}
          >
            <Icon size={16} />
            {item.label}
            {item.id === "opportunities" && (
              <span className="nav-pill">
                {
                  data.opportunities.filter((o) => o.status !== "verified")
                    .length
                }
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
  const View = {
    "serp-studio": SerpStudio,
    overview: Overview,
    opportunities: Opportunities,
    audits: Audits,
    "search-console": SearchConsole,
    "content-studio": ContentStudio,
    "ai-visibility": AIVisibility,
    reports: Reports,
    settings: Settings,
  }[section];
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" aria-label="RankSushi home">
          <Logo />
        </Link>
        <div className="workspace-switch">
          <span className="project-avatar">{data.project.name[0]}</span>
          <div>
            <label className="sr-only" htmlFor="project-switch">
              Current project
            </label>
            <select
              id="project-switch"
              value={data.project.id}
              onChange={(e) => router.push(`/app/${e.target.value}`)}
            >
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {data.sample && section === "serp-studio"
                    ? "RankSushi · recorded scene"
                    : p.name}
                </option>
              ))}
            </select>
            <small>
              {data.sample
                ? "Example workspace"
                : new URL(data.project.url).hostname}
            </small>
          </div>
          <ChevronDown size={12} />
        </div>
        <div className="nav-caption">YOUR WORKSPACE</div>
        {nav()}
        <div className="sidebar-bottom">
          <Link className="knowledge-link" href="/learn">
            The SEO kitchen <ArrowUpRight size={13} />
          </Link>
          <div className="sidebar-tip">
            <Maki pose="wave" />
            <h4>Small bites. Big clarity.</h4>
            <p>A little useful progress beats a very long to-do list.</p>
            <Link className="text-link" href={`${base}/opportunities`}>
              Find your next bite <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="sidebar-account">
            <span>{data.sample ? "A" : data.email[0]?.toUpperCase()}</span>
            <div>
              <strong>
                {data.sample ? "Alex · example" : data.email.split("@")[0]}
              </strong>
              <br />
              <span>
                {data.phase === "trial"
                  ? "$1 trial"
                  : PLANS[data.plan as keyof typeof PLANS]?.name || "Free"}{" "}
                workspace
              </span>
            </div>
            {!data.sample && (
              <button
                className="icon-button"
                title="Sign out"
                aria-label="Sign out"
                onClick={async () => {
                  await request("/api/auth/signout", {});
                  router.push("/login");
                  router.refresh();
                }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <details className="app-mobile-menu">
            <summary aria-label="Open workspace navigation">
              <Menu size={20} />
            </summary>
            {nav(true)}
          </details>
          <div className="breadcrumbs">
            <span className="crumb-workspace">Workspace</span>
            <ChevronRight size={13} />
            <strong>{NAV.find((n) => n.id === section)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <Link className="topbar-search" href={`${base}/opportunities`}>
              <Search size={12} /> Find an opportunity <kbd>↗</kbd>
            </Link>
            <Badge tone="green">
              {data.sample
                ? "Example workspace"
                : data.phase === "trial"
                  ? "$1 trial · limited usage"
                  : PLANS[data.plan as keyof typeof PLANS]?.name}
            </Badge>
            <Link
              href={data.sample ? "/login" : "/app/new"}
              className="icon-button"
              aria-label="Create another website project"
              title="Create another website project"
            >
              <Plus size={17} />
            </Link>
          </div>
        </header>
        <main
          id="main"
          className={`app-content ${section === "serp-studio" ? "studio-content" : ""}`}
        >
          {data.sample && (
            <div className="sample-notice">
              <Info size={13} />
              <span>
                {section === "serp-studio"
                  ? "Recorded public Google results and fetched page evidence. Suggested changes are editable proposals."
                  : "You’re exploring a product example. All metrics and findings on this page are illustrative."}
              </span>
              <Link href="/tools/seo-audit">
                Try your own website <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
          {section !== "serp-studio" && (
            <div className="app-page-heading">
              <div>
                <div className="eyebrow">
                  <span className="tiny-dot" />
                  {data.project.name} · {data.project.country}
                </div>
                <h1>
                  {titles[section][0]}
                  {section === "overview" && (
                    <span className="salmon-star" aria-hidden="true">
                      {" "}
                      ✳
                    </span>
                  )}
                </h1>
                <p>{titles[section][1]}</p>
              </div>
              <div className="heading-actions">
                <Button
                  variant="secondary"
                  onClick={refresh}
                  aria-label="Refresh workspace"
                >
                  <RefreshCw size={13} />
                  <span>Refresh</span>
                </Button>
                <Button onClick={() => setScanning(true)}>
                  <ScanLine size={14} />
                  Scan website
                </Button>
              </div>
            </div>
          )}
          {active && (
            <div className="active-jobs" aria-live="polite">
              {data.jobs
                .filter((j) => ["queued", "running"].includes(j.status))
                .map((j) => (
                  <div className="job-running" key={j.id}>
                    <RefreshCw className="spin" size={13} />
                    <strong>{j.kind}</strong>
                    <span>{j.stage}</span>
                    <Link href={`${base}/audits`}>View job</Link>
                  </div>
                ))}
            </div>
          )}
          <View {...ctx} />
          <div className="workspace-footnote">
            <Globe2 size={11} /> Evidence first. Every useful next step has a
            source. <Link href="/methodology">Read our methodology ↗</Link>
          </div>
        </main>
      </div>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
      {scanning && <ScanModal ctx={ctx} onClose={() => setScanning(false)} />}
    </div>
  );
}
function ScanModal({
  ctx,
  onClose,
}: {
  ctx: WorkspaceContext;
  onClose: () => void;
}) {
  const [limit, setLimit] = useState(Math.min(20, ctx.data.limits.pages)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notify, setNotify] = useState(false);
  const used = ctx.data.usage.find((u) => u.kind === "pages")?.amount || 0;
  return (
    <Modal title="A fresh look at your website" onClose={onClose}>
      <p className="form-intro">
        We’ll discover and inspect public pages on{" "}
        <strong>{new URL(ctx.data.project.url).hostname}</strong>.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await ctx.run({ kind: "crawl", limit, notify });
            onClose();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label htmlFor="crawl-limit">Maximum pages to inspect</label>
          <input
            id="crawl-limit"
            type="number"
            min={1}
            max={200}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            required
          />
          <p>
            {Math.max(0, ctx.data.limits.pages - used)} of{" "}
            {ctx.data.limits.pages} pages remaining this period.
          </p>
        </div>
        <Notice>
          This reserves up to {limit} page credits. Successful rechecks and
          scheduled scans use the same allowance. Unused pages are released
          after a completed crawl.
        </Notice>
        <label className="consent-check">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          Email me when this scan finishes.
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          className="full"
          busy={busy}
          disabled={
            limit < 1 ||
            (!ctx.data.sample && limit > ctx.data.limits.pages - used)
          }
        >
          Start scan <ArrowUpRight size={15} />
        </Button>
      </form>
    </Modal>
  );
}
