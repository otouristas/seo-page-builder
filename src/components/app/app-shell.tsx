import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { AppTab } from "@/lib/seo/types";
import { normalizeUrl } from "@/lib/utils";
import { readMarketPref } from "@/lib/marketing/market-pref";
import { inferMarket } from "@/lib/seo/markets";
import { decodePlays, encodePlays, resolvePlayIds } from "@/lib/seo/share";
import { TABS, useLab } from "@/store/lab";
import { getSessionInfo } from "@/server/session";
import { getLiveQuota } from "@/server/live-serp";
import { loadGscRows } from "@/server/gsc";
import { buildAnalysis } from "@/lib/seo/analysis";
import type { RecentEntry } from "@/lib/seo/recents";
import { Sheet } from "@/components/ui/sheet";
import { Sidebar, MobileTabs } from "./sidebar";
import { Topbar } from "./topbar";
import { EmptyState, ErrorState, LoadingState } from "./states";
import { CoachPanel } from "./coach-panel";
import { ToastProvider, useToast } from "./toast";
import { useHotkeys } from "./use-hotkeys";
import { OverviewView } from "./overview-view";
import { SerpView } from "./serp-view";
import { AuditView } from "./audit-view";
import { KeywordsView } from "./keywords-view";
import { GscView } from "./gsc-view";

export function AppShell() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

function Shell() {
  const search = useSearch({ from: "/app" });
  const navigate = useNavigate();
  const toast = useToast();
  const lab = useLab();
  const booted = useRef(false);
  const restored = useRef(false);

  useEffect(() => {
    getSessionInfo()
      .then((s) => lab.setSession(s))
      .catch(() => lab.setSession(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (search.tab) lab.setTab(search.tab);
    const market =
      search.market ??
      readMarketPref() ??
      inferMarket(typeof navigator !== "undefined" ? (navigator.languages ?? [navigator.language]) : ["en-US"]);
    if (market && !lab.analysis) lab.setMarket(market);
    if (search.device) lab.setDevice(search.device);
    const url = search.url ? normalizeUrl(search.url) : null;
    if (search.demo && !lab.analysis) lab.loadDemo();
    else if (url && (url !== lab.url || !lab.analysis)) void lab.run(url, { market });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lab.status !== "ready" || !lab.analysis || restored.current) return;
    if (search.kw) {
      lab.stageKeyword(search.kw, "staged");
      if (!search.tab) lab.setTab("serp");
    }
    if (search.compare) lab.setCompare(true);
    const s = useLab.getState();
    const kw = search.kw?.toLowerCase();
    const niche =
      (kw ? s.analysis?.niches.find((n) => n.keyword === kw) : null) ??
      s.analysis?.niches.find((n) => n.id === s.activeNicheId) ??
      s.analysis?.niches[0];
    if (niche && search.plays) {
      const ids = resolvePlayIds(decodePlays(search.plays), niche.id, niche.plays);
      if (ids.length) lab.setAppliedFor(niche.id, ids);
    }
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab.status]);

  useEffect(() => {
    if (!restored.current || lab.status !== "ready") return;
    const s = useLab.getState();
    if (!s.analysis) return;
    const niche = s.analysis.niches.find((n) => n.id === s.activeNicheId);
    const plays = niche ? encodePlays(s.applied[niche.id] ?? [], niche.id) : undefined;
    navigate({
      to: "/app",
      replace: true,
      search: (prev) => ({
        ...prev,
        url: s.analysis!.snapshot.url,
        kw: niche?.keyword,
        tab: s.tab,
        market: s.market,
        plays,
        device: s.device === "mobile" ? "mobile" : undefined,
        compare: s.compare || undefined,
        demo: s.analysis!.snapshot.source === "demo" ? true : undefined,
      }),
    });
  }, [lab.applied, lab.activeNicheId, lab.tab, lab.device, lab.compare, lab.market, lab.status, lab.analysis, navigate]);

  const userId = lab.session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    getLiveQuota().then((q) => lab.setQuota(q)).catch(() => undefined);
    if (!lab.gscRows.length) {
      loadGscRows()
        .then((rows) => rows.length && lab.setGscRows(rows, "saved"))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const changeTab = useCallback(
    (t: AppTab) => {
      lab.setTab(t);
      navigate({ to: "/app", search: (prev) => ({ ...prev, tab: t }), replace: true });
    },
    [lab, navigate],
  );

  const focusUrl = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>(".url-field input");
    el?.focus();
    el?.select();
  }, []);

  const hotkeys = useMemo(
    () => ({
      focusUrl,
      tab: (i: number) => {
        const t = TABS[i];
        if (t && (lab.status === "ready" || t.id === "overview")) changeTab(t.id);
      },
      escape: () => lab.setCoachOpen(false),
    }),
    [focusUrl, changeTab, lab],
  );
  useHotkeys(hotkeys);

  const run = useCallback(
    (url: string) => {
      restored.current = false;
      navigate({
        to: "/app",
        search: (prev) => ({ ...prev, url, kw: undefined, demo: undefined, plays: undefined, compare: undefined }),
        replace: true,
      });
      void lab.run(url);
    },
    [lab, navigate],
  );

  const openRecent = useCallback(
    (entry: RecentEntry) => {
      restored.current = true;
      lab.setMarket(entry.market);
      lab.loadAnalysis(buildAnalysis(entry.snapshot, entry.market));
      navigate({
        to: "/app",
        search: { url: entry.url, market: entry.market, tab: "overview" },
        replace: true,
      });
    },
    [lab, navigate],
  );

  const share = useCallback(() => {
    const link = window.location.href;
    navigator.clipboard?.writeText(link).then(() => toast.show("Link copied — plays and market included"));
  }, [toast]);

  const ready = lab.status === "ready" && Boolean(lab.analysis);
  const tab: AppTab = ready ? lab.tab : "overview";

  let view: React.ReactNode;
  if (lab.status === "loading") view = <LoadingState step={lab.step} url={lab.url} />;
  else if (lab.status === "error") view = <ErrorState message={lab.error ?? "Unknown error"} onRetry={() => lab.url && run(lab.url)} onDemo={lab.loadDemo} />;
  else if (!ready) view = <EmptyState onSubmit={run} onDemo={lab.loadDemo} onRecent={openRecent} />;
  else if (tab === "serp") view = <SerpView onTab={changeTab} />;
  else if (tab === "audit") view = <AuditView onTab={changeTab} />;
  else if (tab === "keywords") view = <KeywordsView onTab={changeTab} />;
  else if (tab === "gsc") view = <GscView onTab={changeTab} />;
  else if (tab === "coach") view = <CoachPanel className="h-full" autoFocus />;
  else view = <OverviewView onTab={changeTab} />;

  return (
    <div className="ink flex h-dvh overflow-hidden">
      <Sidebar tab={tab} onTab={changeTab} session={lab.session} quota={lab.quota} ready={ready} onSignedOut={() => getSessionInfo().then((s) => lab.setSession(s))} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          url={lab.url}
          urlKey={lab.analysis?.snapshot.url ?? lab.url}
          status={lab.status}
          market={lab.market}
          device={lab.device}
          showDevice={tab === "serp"}
          onRun={run}
          onMarket={(m) => {
            lab.setMarket(m);
            if (lab.analysis) {
              restored.current = false;
              void lab.run(lab.analysis.snapshot.url, { market: m });
            }
          }}
          onDevice={lab.setDevice}
          onShare={share}
          onCoach={() => lab.setCoachOpen(true)}
          onRecent={openRecent}
        />
        <main className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">{view}</main>
      </div>
      <MobileTabs tab={tab} onTab={changeTab} ready={ready} />
      <Sheet open={lab.coachOpen} onClose={() => lab.setCoachOpen(false)} title="Coach" width="max-w-lg">
        <CoachPanel className="h-full" autoFocus />
      </Sheet>
    </div>
  );
}
