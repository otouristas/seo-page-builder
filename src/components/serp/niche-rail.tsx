import { ArrowUpRight, LoaderCircle, Radio, TrendingUp } from "lucide-react";
import type { GscRow, Niche } from "@/lib/seo/types";
import type { Scene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { clicksAt, ctrAt } from "@/lib/seo/ctr-curve";
import { cn, formatNumber } from "@/lib/utils";
import { Badge, IntentBadge } from "@/components/ui/badge";
import { RadialGauge, Sparkline } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

type Props = {
  niche: Niche;
  scene: Scene;
  gscRow?: GscRow | null;
  live?: { fetchedAt: string } | null;
  liveStatus?: "idle" | "loading" | "error";
  liveError?: string | null;
  quota?: { used: number; limit: number } | null;
  canLive?: boolean;
  onLive?: () => void;
  className?: string;
};

export function NicheRail({ niche, scene, gscRow, live, liveStatus, liveError, quota, canLive = true, onLive, className }: Props) {
  const impressions = gscRow?.impressions ?? 1000;
  const from = scene.baseRank;
  const to = scene.rank;
  const delta = scene.delta ?? 0;
  const volume = { low: "Low volume", mid: "Mid volume", high: "High volume" }[niche.volumeHint];

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <IntentBadge intent={niche.intent} size="sm" />
          <Badge size="sm">{volume}</Badge>
          {niche.source === "staged" && (
            <Badge size="sm" tone="peri">
              Staged
            </Badge>
          )}
          {niche.source === "gsc" && (
            <Badge size="sm" tone="success">
              From GSC
            </Badge>
          )}
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">“{niche.keyword}”</h3>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl bg-ink-900/60 p-4 ring-hairline">
        <div>
          <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Modeled position</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span data-testid="modeled-rank" className="font-display text-4xl font-semibold tracking-tight tabular">{rankLabel(to)}</span>
            {delta !== 0 && (
              <span className={cn("inline-flex items-center gap-0.5 text-[13px] font-medium tabular", delta > 0 ? "text-signal" : "text-danger")}>
                <TrendingUp className="size-3.5" /> {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-fg-muted">was {rankLabel(from)} · {scene.applied.length} plays on</div>
        </div>
        <div className="justify-self-end">
          <Sparkline points={scene.trajectory} width={128} height={44} />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-4 rounded-2xl bg-ink-900/60 p-3 ring-hairline">
          <RadialGauge value={niche.difficulty} size={60} stroke={6} tone="peri" />
          <div className="min-w-0">
            <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Difficulty</div>
            <div className="text-[14px] font-medium">{niche.difficulty >= 70 ? "Contested" : niche.difficulty >= 45 ? "Winnable" : "Open"}</div>
            <div className="text-[11px] text-fg-muted">shorter, commercial phrases score higher</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-ink-900/60 p-3 ring-hairline">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Est. clicks / month</div>
            <div className="font-display text-2xl font-semibold tracking-tight tabular">{formatNumber(clicksAt(impressions, to))}</div>
            <div className="text-[11px] text-fg-muted">
              {Math.round(ctrAt(to) * 100)}% CTR at {rankLabel(to)}
              {gscRow ? ` · ${formatNumber(gscRow.impressions)} impr. (GSC)` : " · assumes 1k impressions"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Why this scene</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{niche.why}</p>
      </div>

      <div className="rounded-2xl border border-white/8 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <Radio className={cn("size-4", live ? "text-success" : "text-fg-muted")} />
            Live SERP
          </div>
          {quota && (
            <Tooltip content="Live lookups through DataForSEO, per signed-in user per day.">
              <span className="font-mono text-[11px] text-fg-muted tabular">
                {quota.used}/{quota.limit} today
              </span>
            </Tooltip>
          )}
        </div>
        <p className="mt-1 text-[12px] text-fg-muted">
          {live ? `Real page one from ${new Date(live.fetchedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}. Your slot stays modeled.` : "Replace the modeled competitors with today's real page one."}
        </p>
        {liveError && <p className="mt-2 text-[12px] text-warn">{liveError}</p>}
        <Button size="sm" variant={live ? "secondary" : "primary"} className="mt-3 w-full" onClick={onLive} disabled={!canLive || liveStatus === "loading"} leading={liveStatus === "loading" ? <LoaderCircle className="size-3.5 animate-spin" /> : <ArrowUpRight className="size-3.5" />}>
          {liveStatus === "loading" ? "Pulling live results…" : live ? "Refresh live results" : "Pull live results"}
        </Button>
      </div>
    </div>
  );
}
