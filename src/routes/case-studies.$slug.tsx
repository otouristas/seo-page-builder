import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";
import { buildCaseStudyView, getCaseStudy } from "@/lib/seo/case-studies";
import { buildAudit } from "@/lib/seo/audit";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel, PILLAR_LABEL } from "@/lib/seo/rank-model";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Band, Container, DotGrid, Aurora } from "@/components/patterns";
import { Eyebrow, IntentBadge, PILLAR_DOT } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/misc";
import { RadialGauge } from "@/components/charts";
import { CompareView } from "@/components/serp/compare-view";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const study = getCaseStudy(params.slug);
    if (!study) throw notFound();
    return { slug: study.slug };
  },
  head: ({ loaderData }) => {
    const study = loaderData ? getCaseStudy(loaderData.slug) : undefined;
    return { meta: [{ title: `${study?.brand ?? "Case study"} — Rankframe case study` }, { name: "description", content: study?.tagline ?? "" }] };
  },
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const { slug } = Route.useLoaderData();
  const study = getCaseStudy(slug)!;
  const view = buildCaseStudyView(study);
  const niche = view.analysis.niches.find((n) => n.id === view.nicheId)!;
  const audit = buildAudit(study.snapshot).filter((c) => c.id !== "live");
  const before = composeScene(niche, view.analysis.score, []);
  const after = composeScene(niche, view.analysis.score, view.appliedIds);
  const applied = niche.plays.filter((p) => view.appliedIds.includes(p.id));

  return (
    <div className="ink">
      <SiteHeader />
      <main>
        <Band className="relative overflow-hidden">
          <DotGrid className="mask-radial opacity-60" />
          <Aurora intensity={0.7} />
          <Container className="relative py-16 lg:py-24">
            <Link to="/" hash="case-studies" className="text-[13px] text-fg-muted hover:text-fg">
              ← All case studies
            </Link>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="min-w-0">
                <Eyebrow>{study.sector}</Eyebrow>
                <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-balance lg:text-6xl">{study.brand}</h1>
                <p className="mt-4 max-w-xl text-lg text-fg-muted">{study.tagline}</p>
                <p className="mt-3 max-w-xl text-[14px] text-fg-muted">{study.angle}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <IntentBadge intent={niche.intent} />
                  <span className="font-mono text-[12px] text-fg-muted">“{niche.keyword}” · {study.market.toUpperCase()}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-3xl bg-ink-800/80 p-6 shadow-card ring-hairline">
                <Stat label="On-page" value={<span>{view.analysis.score}<span className="text-base text-fg-subtle">/100</span></span>} />
                <Stat label="Before" value={rankLabel(before.rank)} hint="modeled" />
                <Stat label="After" value={<span className="text-signal">{rankLabel(after.rank)}</span>} hint={`${applied.length} plays`} />
              </div>
            </div>
          </Container>
        </Band>

        <Band className="border-t border-white/8">
          <Container className="py-16">
            <Eyebrow>Before / after</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">The scene, with the plays on.</h2>
            <div className="mt-8">
              <CompareView niche={niche} score={view.analysis.score} appliedIds={view.appliedIds} market={study.market} />
            </div>
          </Container>
        </Band>

        <Band paper>
          <Container className="grid gap-12 py-20 lg:grid-cols-2">
            <div>
              <Eyebrow tone="paper">Plays applied</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900">What moved it</h2>
              <ol className="mt-6 space-y-3">
                {applied.map((p, i) => (
                  <li key={p.id} className="flex gap-4 rounded-2xl bg-white p-5 shadow-paper ring-hairline-paper">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 font-mono text-[12px] text-signal">{i + 1}</span>
                    <div>
                      <div className="font-medium text-ink-900">{p.title}</div>
                      <p className="mt-1 text-[14px] leading-relaxed text-paper-muted">{p.detail}</p>
                      <div className="mt-2 flex items-center gap-2 text-[12px] text-paper-muted">
                        <span className={cn("size-1.5 rounded-full", PILLAR_DOT[p.pillar])} /> {PILLAR_LABEL[p.pillar]} · {p.effort} effort · impact {Math.round(p.impact * 100)}%
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <Eyebrow tone="paper">Audit</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900">The snapshot behind it</h2>
              <div className="mt-6 flex items-center gap-5 rounded-2xl bg-white p-5 shadow-paper ring-hairline-paper">
                <RadialGauge value={view.analysis.score} size={96} label="on-page" paper />
                <div className="text-[14px] text-paper-muted">
                  <div className="text-ink-900">{study.snapshot.title}</div>
                  <div className="mt-1">{study.snapshot.wordCount.toLocaleString("en")} words · {study.snapshot.h2.length} H2s · {study.snapshot.linksInternal} internal links</div>
                  <div className="mt-1 font-mono text-[11px] text-paper-muted">Modeled snapshot. Run the lab on the live URL for current numbers.</div>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-ink-900/8 rounded-2xl bg-white shadow-paper ring-hairline-paper">
                {audit.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                    <span className="text-ink-900">{c.label}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", c.pass ? "bg-success/15 text-[#0b7a4b]" : "bg-danger/15 text-[#b42323]")}>
                      {c.pass ? <Check className="size-3" /> : <X className="size-3" />} {c.pass ? "Pass" : "Fix"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ButtonLink to="/app" search={{ url: study.url }} variant="paper" size="lg" trailing={<ArrowRight className="size-4" />}>
                  Run the lab on {study.url.replace(/^https?:\/\/(www\.)?/, "")}
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Band>
      </main>
      <SiteFooter />
    </div>
  );
}
