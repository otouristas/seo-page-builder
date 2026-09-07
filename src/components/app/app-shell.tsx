import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { AppTab } from "@/lib/seo/types";
import { normalizeUrl } from "@/lib/utils";
import { TABS, useLab } from "@/store/lab";
import { getSessionInfo } from "@/server/session";
import { getLiveQuota } from "@/server/live-serp";
import { loadGscRows } from "@/server/gsc";
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

  // Session + integrations.
  useEffect(() => {
    getSessionInfo()
      .then((s) => lab.setSession(s))
      .catch(() => lab.setSession(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot from the URL: ?url= runs a lab, ?demo=1 loads the demo, ?tab= selects a tab.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (search.tab) lab.setTab(search.tab);
    const url = search.url ? normalizeUrl(search.url) : null;
    if (url && (url !== lab.url || !lab.analysis)) void lab.run(url);
    else if (search.demo && !lab.analysis) lab.loadDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?kw= stages a keyword once the analysis is ready.
  useEffect(() => {
    if (search.kw && lab.status === "ready") {
      lab.stageKeyword(search.kw, "staged");
      lab.setTab("serp");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.kw, lab.status]);

  // Signed-in extras: quota and saved GSC rows.
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
      navigate({ to: "/app", search: (prev) => ({ ...prev, url, kw: undefined, demo: undefined }), replace: true });
      void lab.run(url);
    },
    [lab, navigate],
  );

  const share = useCallback(() => {
    const active = lab.analysis?.niches.find((n) => n.id === lab.activeNicheId);
    const params = new URLSearchParams();
    if (lab.analysis) params.set("url", lab.analysis.snapshot.url);
    if (active) params.set("kw", active.keyword);
    params.set("tab", lab.tab);
    const link = `${window.location.origin}/app?${params.toString()}`;
    navigator.clipboard?.writeText(link).then(() => toast.show("Link copied"));
  }, [lab, toast]);

  const ready = lab.status === "ready" && Boolean(lab.analysis);
  const tab: AppTab = ready ? lab.tab : "overview";

  let view: React.ReactNode;
  if (lab.status === "loading") view = <LoadingState step={lab.step} url={lab.url} />;
  else if (lab.status === "error") view = <ErrorState message={lab.error ?? "Unknown error"} onRetry={() => lab.url && run(lab.url)} onDemo={lab.loadDemo} />;
  else if (!ready) view = <EmptyState onSubmit={run} onDemo={lab.loadDemo} />;
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
        <Topbar url={lab.url} urlKey={lab.analysis?.snapshot.url ?? lab.url} status={lab.status} market={lab.market} device={lab.device} showDevice={tab === "serp"} onRun={run} onMarket={(m) => {
            lab.setMarket(m);
            if (lab.analysis) void lab.run(lab.analysis.snapshot.url, { market: m });
          }} onDevice={lab.setDevice} onShare={share} onCoach={() => lab.setCoachOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">{view}</main>
      </div>
      <MobileTabs tab={tab} onTab={changeTab} ready={ready} />
      <Sheet open={lab.coachOpen} onClose={() => lab.setCoachOpen(false)} title="Coach" width="max-w-lg">
        <CoachPanel className="h-full" autoFocus />
      </Sheet>
    </div>
  );
}
