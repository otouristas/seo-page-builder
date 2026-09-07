import { Check, RotateCcw, Zap } from "lucide-react";
import { useState } from "react";
import type { Niche, Play, PlayPillar } from "@/lib/seo/types";
import { PILLAR_LABEL } from "@/lib/seo/rank-model";
import { cn } from "@/lib/utils";
import { Badge, PILLAR_DOT } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ORDER: PlayPillar[] = ["on-page", "content", "technical", "intent", "authority"];

type Props = {
  niche: Niche;
  appliedIds: string[];
  onToggle: (playId: string) => void;
  onApplyQuickWins: () => void;
  onReset: () => void;
  compact?: boolean;
  className?: string;
};

function ImpactMeter({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Impact ${Math.round(value * 100)}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cn("h-2.5 w-1 rounded-sm", i < filled ? "bg-signal" : "bg-white/12")} />
      ))}
    </span>
  );
}

export function PlayRow({ play, applied, onToggle, compact }: { play: Play; applied: boolean; onToggle: () => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("group rounded-xl border transition-colors", applied ? "border-signal/40 bg-signal/6" : "border-white/8 bg-ink-900/40 hover:border-white/15")}>
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={applied}
          aria-label={applied ? `Undo ${play.title}` : `Apply ${play.title}`}
          onClick={onToggle}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-[background-color,border-color,transform] duration-150 active:scale-95",
            applied ? "border-signal bg-signal text-ink-900" : "border-ink-500 bg-ink-900 hover:border-fg-muted",
          )}
        >
          {applied && <Check className="size-3.5" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => setOpen((v) => !v)} className="w-full text-left" aria-expanded={open}>
            <div className="flex items-start justify-between gap-2">
              <span className={cn("text-[14px] font-medium leading-snug", applied ? "text-fg" : "text-fg")}>{play.title}</span>
            </div>
          </button>
          <div className={cn("mt-1 text-[12px] leading-relaxed text-fg-muted", !open && !compact && "line-clamp-2", compact && !open && "hidden")}>{play.detail}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-subtle">
              <span className={cn("size-1.5 rounded-full", PILLAR_DOT[play.pillar])} /> {PILLAR_LABEL[play.pillar]}
            </span>
            <ImpactMeter value={play.impact} />
            <span className="text-[11px] text-fg-subtle">{play.effort} effort</span>
            {play.quickWin && (
              <Badge tone="signal" size="sm">
                <Zap className="size-3" /> Quick win
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlaysPanel({ niche, appliedIds, onToggle, onApplyQuickWins, onReset, compact, className }: Props) {
  const applied = new Set(appliedIds);
  const groups = ORDER.map((p) => ({ pillar: p, plays: niche.plays.filter((x) => x.pillar === p) })).filter((g) => g.plays.length);
  const quickLeft = niche.plays.filter((p) => p.quickWin && !applied.has(p.id)).length;
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 pb-3">
        <div>
          <div className="font-display text-[15px] font-semibold tracking-tight">Plays</div>
          <div className="text-[12px] text-fg-muted">
            {appliedIds.length}/{niche.plays.length} applied
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="xs" variant="secondary" onClick={onApplyQuickWins} disabled={!quickLeft} leading={<Zap className="size-3" />}>
            Quick wins{quickLeft ? ` (${quickLeft})` : ""}
          </Button>
          <Button size="xs" variant="ghost" onClick={onReset} disabled={!appliedIds.length} aria-label="Reset plays">
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.pillar}>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">
              <span className={cn("size-1.5 rounded-full", PILLAR_DOT[g.pillar])} /> {PILLAR_LABEL[g.pillar]}
            </div>
            <div className="space-y-2">
              {g.plays.map((p) => (
                <PlayRow key={p.id} play={p} applied={applied.has(p.id)} onToggle={() => onToggle(p.id)} compact={compact} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
