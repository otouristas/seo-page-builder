import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CASE_STUDIES, buildCaseStudyView } from "@/lib/seo/case-studies";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { cn } from "@/lib/utils";
import { Container } from "@/components/patterns";
import { Eyebrow, IntentBadge } from "@/components/ui/badge";
import { Sparkline } from "@/components/charts";

const ACCENT = { signal: "from-signal/40", peri: "from-peri/40", success: "from-success/40" } as const;

export function CaseStudies() {
  const views = CASE_STUDIES.map((s) => {
    const v = buildCaseStudyView(s);
    const niche = v.analysis.niches.find((n) => n.id === v.nicheId)!;
    const before = composeScene(niche, v.analysis.score, []);
    const after = composeScene(niche, v.analysis.score, v.appliedIds);
    return { study: s, niche, before, after, score: v.analysis.score, plays: niche.plays.filter((p) => v.appliedIds.includes(p.id)) };
  });

  return (
    <div id="case-studies" className="border-t border-ink-900/8 py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow tone="paper">Case studies</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance sm:text-5xl">Three public pages, three intents, three plans.</h2>
            <p className="mt-4 text-lg text-paper-muted">Modeled on public pages, not client work. Every number here is produced by the same engine you get in the lab.</p>
          </div>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {views.map(({ study, niche, before, after, score, plays }) => (
            <Link key={study.slug} to="/case-studies/$slug" params={{ slug: study.slug }} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-paper ring-hairline-paper transition-[transform,box-shadow] duration-300 ease-fluid hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(10,15,30,0.35)]">
              <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent", ACCENT[study.accent])} aria-hidden />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.16em] text-paper-muted uppercase">{study.sector}</div>
                  <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-900">{study.brand}</div>
                </div>
                <ArrowUpRight className="size-5 text-ink-900/30 transition-colors group-hover:text-ink-900" />
              </div>
              <p className="relative mt-4 text-[14px] leading-relaxed text-paper-muted">{study.tagline}</p>
              <div className="relative mt-5 flex items-center gap-2">
                <IntentBadge intent={niche.intent} size="sm" className="!bg-ink-900/6 !text-ink-900 !ring-ink-900/10" />
                <span className="text-[13px] text-ink-900">“{niche.keyword}”</span>
              </div>
              <div className="relative mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-paper p-4">
                <div>
                  <div className="font-mono text-[10px] tracking-wider text-paper-muted uppercase">On-page</div>
                  <div className="font-display text-2xl font-semibold text-ink-900 tabular">{score}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-wider text-paper-muted uppercase">Modeled</div>
                  <div className="font-display text-2xl font-semibold text-ink-900 tabular">
                    {rankLabel(before.rank)} <span className="text-paper-muted">→</span> {rankLabel(after.rank)}
                  </div>
                </div>
                <div className="justify-self-end">
                  <Sparkline points={after.trajectory} width={80} height={40} color="#0a0f1e" />
                </div>
              </div>
              <ul className="relative mt-4 space-y-1.5 text-[13px] text-ink-900">
                {plays.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-900" /> {p.title}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
