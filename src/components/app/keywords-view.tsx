import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { AppTab } from "@/lib/seo/types";
import { useLab } from "@/store/lab";
import { extractKeyphrases } from "@/lib/seo/niches";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { recordLabEvent } from "@/server/stats";
import { cn } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, IntentBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadialGauge, Sparkline } from "@/components/charts";

export function KeywordsView({ onTab }: { onTab: (t: AppTab) => void }) {
  const lab = useLab();
  const analysis = lab.analysis!;
  const [value, setValue] = useState("");
  const existing = new Set(analysis.niches.map((n) => n.keyword));
  const suggestions = useMemo(() => extractKeyphrases(analysis.snapshot, 14).map((c) => c.phrase).filter((p) => !existing.has(p)).slice(0, 8), [analysis.snapshot, analysis.niches.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function stage(kw: string) {
    const niche = lab.stageKeyword(kw, "staged");
    if (niche) {
      void recordLabEvent({ data: { kind: "stage" } }).catch(() => undefined);
      setValue("");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) stage(value);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Stage a keyword</CardTitle>
            <div className="text-[12px] text-fg-muted">Any query becomes a scene: intent, difficulty, competitors and plays are modeled for this page.</div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={submit} className="flex gap-2">
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. best payment gateway for startups" aria-label="Keyword" />
            <Button type="submit" disabled={!value.trim()} leading={<Plus className="size-4" />}>
              Stage
            </Button>
          </form>
          {suggestions.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">From your headings</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => stage(s)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[13px] text-fg-muted transition-colors hover:border-signal/50 hover:text-fg">
                    <Plus className="size-3" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analysis.niches.map((n) => {
          const scene = composeScene(n, analysis.score, lab.applied[n.id] ?? [], lab.live[n.id]?.results);
          const active = n.id === lab.activeNicheId;
          return (
            <Card key={n.id} className={cn("flex flex-col p-5", active && "ring-1 ring-signal/50")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <IntentBadge intent={n.intent} size="sm" />
                    {n.source === "staged" && (
                      <Badge tone="peri" size="sm">
                        Staged
                      </Badge>
                    )}
                    {n.source === "gsc" && (
                      <Badge tone="success" size="sm">
                        GSC
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 truncate font-display text-lg font-semibold tracking-tight">“{n.keyword}”</div>
                </div>
                <RadialGauge value={n.difficulty} size={56} stroke={5} tone="peri" />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Modeled</div>
                  <div className="font-display text-3xl font-semibold tracking-tight tabular">
                    {rankLabel(scene.rank)}
                    {scene.delta ? <span className="ml-1.5 text-sm text-signal">+{scene.delta}</span> : null}
                  </div>
                </div>
                <Sparkline points={scene.trajectory} width={96} height={36} />
              </div>
              <div className="mt-2 text-[12px] text-fg-muted">
                {n.volumeHint} volume · {n.plays.length} plays · {(lab.applied[n.id] ?? []).length} applied
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  className="flex-1"
                  trailing={<ArrowRight className="size-3.5" />}
                  onClick={() => {
                    lab.setActiveNiche(n.id);
                    onTab("serp");
                  }}
                >
                  Open in SERP Lab
                </Button>
                {n.source && n.source !== "headings" && (
                  <Button size="sm" variant="ghost" aria-label="Remove scene" onClick={() => lab.removeNiche(n.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
