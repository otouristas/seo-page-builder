import type { Analysis, Market, SeoSnapshot } from "./types";
import { auditScore, buildAudit, groupScore } from "./audit";
import { buildNiches } from "./niches";
import { hostOf } from "../utils";
import { rankLabel } from "./rank-model";

/** Pure: snapshot in, full analysis out. Used by the server function and by the offline demo. */
export function buildAnalysis(snapshot: SeoSnapshot, market: Market): Analysis {
  const audit = buildAudit(snapshot);
  const score = auditScore(audit);
  const technicalScore = groupScore(audit, "technical");
  const niches = buildNiches({ snapshot, audit, score, market });
  const failing = audit.filter((c) => !c.pass);
  const host = hostOf(snapshot.finalUrl);
  const byRank = (a: { currentRank: number | null }, b: { currentRank: number | null }) => (a.currentRank ?? 12) - (b.currentRank ?? 12);
  const contested = niches.filter((n) => n.intent !== "navigational");
  const best = [...(contested.length ? contested : niches)].sort(byRank)[0];
  const quick = niches[0]?.plays.filter((p) => p.quickWin).slice(0, 2) ?? [];

  const summary = best
    ? `${host} scores ${score}/100 on-page. Strongest scene: "${best.keyword}" (${best.intent}, modeled ${rankLabel(best.currentRank)}).${
        quick.length ? ` ${quick.length} quick win${quick.length > 1 ? "s" : ""} would move it first.` : ""
      }`
    : `${host} scores ${score}/100 on-page.`;

  const briefing = failing.length
    ? `Start with the ${failing.length} failing check${failing.length > 1 ? "s" : ""}: ${failing
        .slice(0, 3)
        .map((c) => c.label.toLowerCase())
        .join(", ")}${failing.length > 3 ? " and more" : ""}. Then open the SERP lab, pick the scene with the best modeled position, and apply the quick wins before the heavier content and authority plays.`
    : "Every on-page check passes. The remaining distance is competition: work the content and authority plays in the SERP lab, and validate with a live SERP pull.";

  return { snapshot, score, technicalScore, summary, niches, briefing, usedAi: false, market };
}
