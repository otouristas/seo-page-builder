import { Link } from "@tanstack/react-router";
import { Columns2, Plus, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { AppTab } from "@/lib/seo/types";
import { selectActive, useLab } from "@/store/lab";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { fetchLiveSerp } from "@/server/live-serp";
import { recordLabEvent } from "@/server/stats";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/misc";
import { SerpStage } from "@/components/serp/serp-stage";
import { PlaysPanel } from "@/components/serp/plays-panel";
import { NicheRail } from "@/components/serp/niche-rail";
import { CompareView } from "@/components/serp/compare-view";

export function SerpView({ onTab }: { onTab: (t: AppTab) => void }) {
  const lab = useLab();
  const analysis = lab.analysis!;
  const { niche, scene, appliedIds, live } = selectActive(lab);
  const [playsOpen, setPlaysOpen] = useState(false);
  if (!niche || !scene) return null;

  const gscRow = lab.gscRows.find((r) => r.query.toLowerCase() === niche.keyword) ?? null;
  const canLive = Boolean(lab.session?.dataforseo);

  async function pullLive() {
    if (!niche) return;
    lab.setLiveStatus("loading");
    try {
      const res = await fetchLiveSerp({ data: { keyword: niche.keyword, market: analysis.market } });
      if (res.ok) lab.setLive(niche.id, res.results, res.quota);
      else {
        lab.setLiveStatus("error", res.error);
        if (res.quota) lab.setQuota(res.quota);
      }
    } catch {
      lab.setLiveStatus("error", "Live lookup failed. Try again in a minute.");
    }
  }

  function toggle(playId: string) {
    if (!niche) return;
    const applying = !appliedIds.includes(playId);
    lab.togglePlay(niche.id, playId);
    if (applying) void recordLabEvent({ data: { kind: "play" } }).catch(() => undefined);
  }

  const plays = (
    <PlaysPanel niche={niche} appliedIds={appliedIds} onToggle={toggle} onApplyQuickWins={() => lab.applyQuickWins(niche.id)} onReset={() => lab.resetPlays(niche.id)} />
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/8 px-4 py-2.5 scrollbar-none">
        {analysis.niches.map((n) => {
          const s = n.id === niche.id ? scene : composeScene(n, analysis.score, lab.applied[n.id] ?? [], lab.live[n.id]?.results);
          const activeTab = n.id === niche.id;
          return (
            <button key={n.id} type="button" onClick={() => lab.setActiveNiche(n.id)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors", activeTab ? "border-signal/60 bg-signal/10 text-fg" : "border-white/10 text-fg-muted hover:border-white/25 hover:text-fg")}>
              <span className="max-w-[180px] truncate">{n.keyword}</span>
              <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular", activeTab ? "bg-signal text-ink-900" : "bg-white/8 text-fg-muted")}>{rankLabel(s.rank)}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => onTab("keywords")} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-[13px] text-fg-muted hover:border-white/30 hover:text-fg">
          <Plus className="size-3.5" /> Stage keyword
        </button>
        <div className="sticky right-0 ml-auto flex shrink-0 items-center gap-3 bg-ink-900 pl-3 shadow-[-12px_0_12px_-6px_rgb(10_15_30)]">
          <label className="inline-flex items-center gap-2 text-[12px] text-fg-muted">
            <Columns2 className="size-4" />
            <span className="hidden sm:inline">Compare</span>
            <Toggle checked={lab.compare} onChange={lab.setCompare} label="Compare before and after" />
          </label>
          <Button size="sm" variant="secondary" className="xl:hidden" onClick={() => setPlaysOpen(true)} leading={<SlidersHorizontal className="size-4" />}>
            Plays {appliedIds.length ? `(${appliedIds.length})` : ""}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {lab.compare ? (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[14px] text-fg-muted">
                “{niche.keyword}” · {appliedIds.length} plays applied · {rankLabel(scene.baseRank)} → <span className="font-medium text-signal">{rankLabel(scene.rank)}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => lab.setCompare(false)} leading={<X className="size-4" />}>
                Exit compare
              </Button>
            </div>
            <CompareView niche={niche} score={analysis.score} appliedIds={appliedIds} market={analysis.market} />
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
            <div className="hidden xl:block">
              <div className="sticky top-0 rounded-2xl bg-ink-800/70 p-4 ring-hairline">{plays}</div>
            </div>
            <div className="min-w-0">
              <div className={cn(lab.device === "desktop" && "glow-ring rounded-2xl")}>
                <SerpStage scene={scene} keyword={niche.keyword} market={analysis.market} intent={niche.intent} device={lab.device} liveAt={live?.fetchedAt ?? null} />
              </div>
              {lab.liveStatus === "error" && lab.liveError && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-[13px]">
                  <span>{lab.liveError}</span>
                  {!lab.session?.user && lab.session?.authEnabled && (
                    <Link to="/login" className="font-medium text-signal hover:underline">
                      Sign in
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="rounded-2xl bg-ink-800/70 p-4 ring-hairline xl:sticky xl:top-0">
                <NicheRail niche={niche} scene={scene} gscRow={gscRow} live={live} liveStatus={lab.liveStatus} liveError={null} quota={lab.quota} canLive={canLive || !lab.session} onLive={pullLive} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Sheet open={playsOpen} onClose={() => setPlaysOpen(false)} title={`Plays · “${niche.keyword}”`} side="bottom">
        <div className="p-4">{plays}</div>
      </Sheet>
    </div>
  );
}
