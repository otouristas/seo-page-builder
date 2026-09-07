import type { Analysis, GscRow, Niche } from "./types";
import type { Scene } from "./scene";
import { buildAudit } from "./audit";
import { PILLAR_LABEL, rankLabel } from "./rank-model";
import { ctrAt, clicksAt } from "./ctr-curve";
import { hostOf } from "../utils";

export type CoachContext = {
  analysis: Analysis;
  niche: Niche | null;
  scene: Scene | null;
  gscRows: GscRow[];
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function suggestedPrompts(ctx: CoachContext): string[] {
  const kw = ctx.niche?.keyword ?? "this page";
  return [
    `Why isn't ${hostOf(ctx.analysis.snapshot.finalUrl)} ranking higher for "${kw}"?`,
    "What should I do first?",
    "How many clicks would moving up get me?",
    "Who am I up against?",
    "Are these positions real?",
  ];
}

export function coachReply(question: string, ctx: CoachContext): string {
  const q = question.toLowerCase();
  const { analysis, niche, scene } = ctx;
  const host = hostOf(analysis.snapshot.finalUrl);
  const audit = buildAudit(analysis.snapshot);
  const failing = audit.filter((c) => !c.pass);
  const kw = niche?.keyword ?? "the page";
  const plays = niche?.plays ?? [];
  const quick = plays.filter((p) => p.quickWin);
  const remaining = plays.filter((p) => !scene?.applied.some((a) => a.id === p.id));
  const competitors = (niche?.results ?? []).filter((r) => r.kind === "organic" && !r.isYou).slice(0, 3);

  const matchedPlay = plays.find((p) => q.includes(p.title.toLowerCase().slice(0, 18)) || (p.id.split("-").pop() && q.includes(p.id.split("-").pop()!)));
  if (/(explain|what does|what is|how do i|how to)/.test(q) && matchedPlay) {
    return `**${matchedPlay.title}** is a ${PILLAR_LABEL[matchedPlay.pillar].toLowerCase()} play with ${matchedPlay.effort} effort.\n\n${matchedPlay.detail}\n\nIn the model it moves you about ${Math.round(matchedPlay.impact * 10) / 10 * 100 / 100 * 100}% of a full step, so stack it with the other ${PILLAR_LABEL[matchedPlay.pillar].toLowerCase()} plays for a visible jump.`;
  }

  if (/(real|live|actual|guarantee|true|accurate|dataforseo)/.test(q)) {
    return `Positions in the lab are **modeled**, not live Google ranks. The model blends your on-page score (${analysis.score}/100) with the niche difficulty (${niche?.difficulty ?? "—"}/100), and each applied play reduces that distance.\n\nTo see the real page one, press **Live SERP** in the SERP lab. It pulls the current results through DataForSEO (8 lookups a day when signed in) and places your modeled slot inside them.`;
  }

  if (/(why).*(not|n't|isn't|rank|higher|top|first|page one)/.test(q) || /position|rank\b/.test(q)) {
    const reasons = failing.slice(0, 3).map((c) => `• ${c.label} — ${c.detail}`);
    const rank = scene ? rankLabel(scene.rank) : niche ? rankLabel(niche.currentRank) : "—";
    return `For "${kw}" ${host} models at **${rank}**. Two forces set that: an on-page score of ${analysis.score}/100 and a niche difficulty of ${niche?.difficulty ?? "—"}/100 (${niche?.intent ?? "mixed"} intent).\n\n${
      reasons.length ? `What's holding it back:\n${reasons.join("\n")}` : "Every on-page check passes, so the gap is competition and authority."
    }\n\n${
      competitors.length
        ? `Above you: ${competitors.map((c) => `${c.domain} (${c.hint ?? "strong domain"})`).join("; ")}.`
        : ""
    }`;
  }

  if (/(first|start|priority|begin|quick win|do now|today)/.test(q)) {
    const list = (quick.length ? quick : remaining).slice(0, 3);
    return list.length
      ? `Start with the quick wins for "${kw}":\n${list.map((p, i) => `${i + 1}. **${p.title}** — ${p.detail}`).join("\n")}\n\nApply them in the SERP lab to watch the modeled position move, then take on the content and authority plays.`
      : "Every play for this scene is already applied. Stage another keyword or pull a live SERP to validate.";
  }

  if (/(click|traffic|visit|ctr|impression|how many)/.test(q)) {
    const from = scene?.baseRank ?? niche?.currentRank ?? null;
    const to = scene?.rank ?? from;
    const gsc = ctx.gscRows.find((r) => r.query.toLowerCase() === kw);
    const impressions = gsc?.impressions ?? 1000;
    const label = gsc ? `Search Console shows ${gsc.impressions.toLocaleString("en")} impressions for this query` : "assuming 1,000 monthly impressions";
    return `Using the industry CTR curve (${label}): ${rankLabel(from)} captures about ${pct(ctrAt(from))} of clicks, ${rankLabel(to)} about ${pct(ctrAt(to))}.\n\nThat's roughly **${clicksAt(impressions, from).toLocaleString("en")} → ${clicksAt(impressions, to).toLocaleString("en")} clicks a month**. Import your GSC export to replace the assumption with your real impressions.`;
  }

  if (/(competitor|against|who ranks|beat|above me)/.test(q)) {
    return competitors.length
      ? `Page one for "${kw}" is held by:\n${competitors.map((c, i) => `${i + 1}. **${c.domain}** — ${c.hint ?? "strong domain"}${c.authority ? ` (authority ~${c.authority})` : ""}`).join("\n")}\n\nThe fastest way past them is matching the SERP's shape (${niche?.intent} intent) before you chase links.`
      : "Stage a keyword first and I'll break down who holds page one.";
  }

  if (/(intent)/.test(q)) {
    return niche ? `"${kw}" reads as **${niche.intent}** intent. ${niche.why}` : "Pick a scene and I'll explain its intent.";
  }

  if (/(difficult|hard|competitive)/.test(q)) {
    return niche
      ? `Difficulty for "${kw}" is modeled at **${niche.difficulty}/100**. It rises with shorter phrases and commercial intent, and it's what stretches the distance between your on-page score and page one. Authority plays shrink it fastest.`
      : "Stage a keyword first.";
  }

  if (/(schema|structured|json)/.test(q)) {
    const has = analysis.snapshot.schemaTypes;
    return has.length
      ? `The page already declares ${has.join(", ")}. For ${niche?.intent ?? "this"} intent, add ${niche?.intent === "informational" ? "FAQPage" : niche?.intent === "transactional" ? "Product + Offer" : niche?.intent === "commercial" ? "ItemList + Review" : "Organization + WebSite"} markup and validate it in Rich Results Test.`
      : `No structured data was found. Add JSON-LD for the page type — it's the "${plays.find((p) => p.id.endsWith("-schema"))?.title ?? "schema"}" play in the lab.`;
  }

  if (/(title|meta|description|h1|heading)/.test(q)) {
    const t = audit.find((c) => c.id === "title")!;
    const m = audit.find((c) => c.id === "meta")!;
    const h = audit.find((c) => c.id === "h1")!;
    return `Title: ${t.pass ? "✓" : "✗"} ${t.detail}\nMeta: ${m.pass ? "✓" : "✗"} ${m.detail}\nH1: ${h.pass ? "✓" : "✗"} ${h.detail}\n\n${[t, m, h].filter((c) => !c.pass).map((c) => `Fix: ${c.fix}`).join("\n") || "All three pass. Use the snippet editor in Audit to test sharper copy."}`;
  }

  return `Here's the picture for ${host}: on-page ${analysis.score}/100, technical ${analysis.technicalScore}/100, ${analysis.niches.length} scenes staged.\n\n${analysis.briefing}\n\nAsk me "what should I do first", "who am I up against" or "how many clicks would that get me".`;
}
