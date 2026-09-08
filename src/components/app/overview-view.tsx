import { ArrowRight, Zap } from "lucide-react";
import type { AppTab } from "@/lib/seo/types";
import { selectActive, useLab } from "@/store/lab";
import { auditScore, buildAudit, groupScore } from "@/lib/seo/audit";
import { composeScene } from "@/lib/seo/scene";
import { rankLabel } from "@/lib/seo/rank-model";
import { clicksAt } from "@/lib/seo/ctr-curve";
import { cn, formatNumber, hostOf } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, IntentBadge, PILLAR_DOT } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { RadialGauge, RankChart } from "@/components/charts";
import { SnippetPreview } from "./snippet-preview";

export function OverviewView({ onTab }: { onTab: (t: AppTab) => void }) {
  const lab = useLab();
  const analysis = lab.analysis!;
  const { snapshot } = analysis;
  const audit = buildAudit(snapshot, analysis.market);
  const failing = audit.filter((c) => !c.pass);
  const scenes = analysis.niches.map((n) => ({ niche: n, scene: composeScene(n, analysis.score, lab.applied[n.id] ?? [], lab.live[n.id]?.results) }));
  const best = [...scenes].sort((a, b) => (a.scene.rank ?? 12) - (b.scene.rank ?? 12))[0];
  const clicks = scenes.reduce((sum, s) => {
    const row = lab.gscRows.find((r) => r.query.toLowerCase() === s.niche.keyword);
    return sum + clicksAt(row?.impressions ?? 1000, s.scene.rank);
  }, 0);
  const quickWins = analysis.niches.flatMap((n) => n.plays.filter((p) => p.quickWin && !(lab.applied[n.id] ?? []).includes(p.id)).map((p) => ({ n, p }))).slice(0, 3);
  const { niche: active } = selectActive(lab);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Overview</div>
          <h1 className="mt-1 truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{hostOf(snapshot.finalUrl)}</h1>
          <p className="mt-1 max-w-2xl text-[14px] text-fg-muted">{analysis.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={snapshot.source === "live" ? "success" : snapshot.source === "partial" ? "warn" : "peri"} dot>
            {snapshot.source === "live" ? "Live HTML" : snapshot.source === "partial" ? "Partial read" : "Demo snapshot"}
          </Badge>
          <Badge>{analysis.market.toUpperCase()} market</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <RadialGauge value={analysis.score} size={84} stroke={7} label="on-page" />
          <div>
            <div className="text-[14px] font-medium">On-page score</div>
            <div className="text-[12px] text-fg-muted">
              {failing.length ? `${failing.length} check${failing.length > 1 ? "s" : ""} to fix` : "All checks pass"}
            </div>
            <button type="button" onClick={() => onTab("audit")} className="mt-1 text-[12px] font-medium text-signal hover:underline">
              Open audit →
            </button>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <RadialGauge value={analysis.technicalScore} size={84} stroke={7} label="technical" tone="peri" />
          <div>
            <div className="text-[14px] font-medium">Technical score</div>
            <div className="text-[12px] text-fg-muted">canonical · viewport · schema · robots</div>
            <div className="mt-1 text-[12px] text-fg-muted">content {groupScore(audit, "content")} · on-page {groupScore(audit, "on-page")}</div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Best modeled position</div>
          <div className="mt-1 font-display text-4xl font-semibold tracking-tight tabular">{best ? rankLabel(best.scene.rank) : "—"}</div>
          <div className="mt-1 truncate text-[12px] text-fg-muted">{best ? `“${best.niche.keyword}”` : "no scenes"}</div>
          {best && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-fg-muted">
                <span>Hygiene</span>
                <span className="font-mono tabular">{Math.round(best.scene.breakdown.hygiene)}</span>
              </div>
              <Progress value={best.scene.breakdown.hygiene} className="h-1" />
              <div className="flex justify-between text-[11px] text-fg-muted">
                <span>Relevance</span>
                <span className="font-mono tabular">{Math.round(best.scene.breakdown.relevance)}</span>
              </div>
              <Progress value={best.scene.breakdown.relevance} tone="success" className="h-1" />
              <div className="flex justify-between text-[11px] text-fg-muted">
                <span>Contest / floor</span>
                <span className="font-mono tabular">{Math.round(best.scene.breakdown.contest)} · {rankLabel(best.scene.breakdown.floorRank)}</span>
              </div>
              <Progress value={best.scene.breakdown.contest} tone="peri" className="h-1" />
            </div>
          )}
        </Card>
        <Card className="p-5">
          <div className="font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Est. clicks / month</div>
          <div className="mt-1 font-display text-4xl font-semibold tracking-tight tabular">{formatNumber(clicks)}</div>
          <div className="mt-1 text-[12px] text-fg-muted">{lab.gscRows.length ? "from GSC impressions where matched" : "assumes 1k impressions per scene"}</div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Modeled trajectory per scene</CardTitle>
              <div className="text-[12px] text-fg-muted">Position after each applied play. #1 is the top.</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => onTab("serp")} trailing={<ArrowRight className="size-3.5" />}>
              SERP Lab
            </Button>
          </CardHeader>
          <CardBody>
            <RankChart series={scenes.map((s) => ({ name: s.niche.keyword, points: s.scene.trajectory }))} height={240} />
            <div className="mt-3 flex flex-wrap gap-2">
              {scenes.map((s, i) => (
                <button
                  key={s.niche.id}
                  type="button"
                  onClick={() => {
                    lab.setActiveNiche(s.niche.id);
                    onTab("serp");
                  }}
                  className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] transition-colors", s.niche.id === active?.id ? "border-signal/50 bg-signal/10 text-fg" : "border-white/10 text-fg-muted hover:text-fg")}
                >
                  <span className="size-2 rounded-full" style={{ background: ["#c7ff3b", "#7c9bff", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"][i % 6] }} />
                  {s.niche.keyword}
                  <span className="font-mono text-[11px] tabular">{rankLabel(s.scene.rank)}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick wins</CardTitle>
              <div className="text-[12px] text-fg-muted">Low effort, real movement. Applied in the lab.</div>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {quickWins.length === 0 && <div className="rounded-xl bg-ink-900/60 p-4 text-[13px] text-fg-muted">Every quick win is applied. Work the content and authority plays next.</div>}
            {quickWins.map(({ n, p }) => (
              <div key={p.id} className="flex items-start gap-3 rounded-xl bg-ink-900/60 p-3 ring-hairline">
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", PILLAR_DOT[p.pillar])} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{p.title}</div>
                  <div className="mt-0.5 truncate text-[11px] text-fg-muted">for “{n.keyword}”</div>
                </div>
                <Button
                  size="xs"
                  variant="secondary"
                  leading={<Zap className="size-3" />}
                  onClick={() => {
                    lab.setActiveNiche(n.id);
                    lab.togglePlay(n.id, p.id);
                    onTab("serp");
                  }}
                >
                  Apply
                </Button>
              </div>
            ))}
            <p className="pt-1 text-[12px] leading-relaxed text-fg-muted">{analysis.briefing}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>How Google would show it</CardTitle>
              <div className="text-[12px] text-fg-muted">Title and meta description as a result.</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onTab("audit")}>
              Edit
            </Button>
          </CardHeader>
          <CardBody>
            <SnippetPreview url={snapshot.finalUrl} title={snapshot.title} description={snapshot.metaDescription} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Snapshot facts</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
              {[
                ["Title", `${snapshot.titleChars} chars`],
                ["Description", `${snapshot.descriptionChars} chars`],
                ["H1 / H2 / H3", `${snapshot.h1.length} / ${snapshot.h2.length} / ${snapshot.h3.length}`],
                ["Words (main)", formatNumber(snapshot.wordCountMain || snapshot.wordCount)],
                ["Hreflang", snapshot.hreflang?.length ? snapshot.hreflang.slice(0, 4).join(", ") : "—"],
                ["Images with alt", `${snapshot.imagesWithAlt} / ${snapshot.imagesTotal}`],
                ["Links", `${snapshot.linksInternal} in · ${snapshot.linksExternal} out`],
                ["Schema", snapshot.schemaTypes.length ? snapshot.schemaTypes.join(", ") : "none"],
                ["Canonical", snapshot.canonical ? "set" : "missing"],
                ["Robots", snapshot.robots ?? "indexable"],
                ["Language", snapshot.lang ?? "—"],
                ["Open Graph", snapshot.ogTitle ? "yes" : "no"],
                ["Fetched", new Date(snapshot.fetchedAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="font-mono text-[10px] tracking-wider text-fg-subtle uppercase">{k}</dt>
                  <dd className="truncate text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.niches.map((n) => (
                <span key={n.id} className="inline-flex items-center gap-2 rounded-full bg-ink-900/60 px-3 py-1 text-[12px] ring-hairline">
                  <IntentBadge intent={n.intent} size="sm" />
                  {n.keyword}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
