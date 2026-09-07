import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { demoAnalysis } from "@/lib/seo/demo";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { cn } from "@/lib/utils";
import { Aurora, Container, GridLines } from "@/components/patterns";
import { Eyebrow, IntentBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SerpStage } from "@/components/serp/serp-stage";
import { PlaysPanel } from "@/components/serp/plays-panel";
import { Sparkline } from "@/components/charts";

/** The real SERP stage, running on the modeled Stripe analysis. State is local to the section. */
export function LiveDemo() {
  const analysis = useMemo(() => demoAnalysis("us"), []);
  const niches = analysis.niches.filter((n) => n.intent !== "navigational").slice(0, 3);
  const [nicheId, setNicheId] = useState(niches[0]?.id ?? "");
  const [applied, setApplied] = useState<Record<string, string[]>>({});
  const niche = niches.find((n) => n.id === nicheId) ?? niches[0];
  if (!niche) return null;
  const ids = applied[niche.id] ?? [];
  const scene = composeScene(niche, analysis.score, ids);

  return (
    <div id="demo" className="relative overflow-hidden py-24">
      <GridLines className="mask-fade-y opacity-60" />
      <Aurora intensity={0.7} />
      <Container className="relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>Live demo</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Try the lab without leaving this page.</h2>
            <p className="mt-4 text-lg text-fg-muted">This is the real stage on a modeled snapshot of stripe.com/payments. Pick a scene, tick plays, watch the card move.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {niches.map((n) => (
              <button key={n.id} type="button" onClick={() => setNicheId(n.id)} className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors", n.id === niche.id ? "border-signal bg-signal text-ink-900" : "border-white/10 text-fg-muted hover:border-white/25 hover:text-fg")}>
                “{n.keyword}”
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="min-w-0 space-y-5">
            <div className="rounded-2xl bg-ink-800/80 p-4 shadow-card ring-hairline">
              <div className="flex items-center justify-between">
                <IntentBadge intent={niche.intent} size="sm" />
                <span className="font-mono text-[11px] text-fg-subtle">difficulty {niche.difficulty}</span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Modeled position</div>
                  <div className="font-display text-4xl font-semibold tracking-tight tabular">
                    {rankLabel(scene.rank)}
                    {scene.delta ? <span className="ml-2 text-lg text-signal">+{scene.delta}</span> : null}
                  </div>
                </div>
                <Sparkline points={scene.trajectory} width={110} height={40} />
              </div>
            </div>
            <div className="rounded-2xl bg-ink-800/80 p-4 shadow-card ring-hairline">
              <PlaysPanel
                niche={niche}
                appliedIds={ids}
                compact
                onToggle={(id) => setApplied((a) => ({ ...a, [niche.id]: (a[niche.id] ?? []).includes(id) ? (a[niche.id] ?? []).filter((x) => x !== id) : [...(a[niche.id] ?? []), id] }))}
                onApplyQuickWins={() => setApplied((a) => ({ ...a, [niche.id]: [...new Set([...(a[niche.id] ?? []), ...niche.plays.filter((p) => p.quickWin).map((p) => p.id)])] }))}
                onReset={() => setApplied((a) => ({ ...a, [niche.id]: [] }))}
              />
            </div>
          </div>
          <div className="glow-ring min-w-0 rounded-2xl lg:self-start">
            <div className="max-h-[760px] overflow-y-auto rounded-2xl">
              <SerpStage scene={scene} keyword={niche.keyword} market={analysis.market} intent={niche.intent} label="demo" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink to="/app" variant="primary" size="lg" trailing={<ArrowRight className="size-4" />}>
            Run it on your URL
          </ButtonLink>
          <span className="text-[13px] text-fg-muted">Free, no account. Sign in to keep Search Console data and pull live results.</span>
        </div>
      </Container>
    </div>
  );
}
