import type { Analysis, GscRow, LangPack, Niche } from "./types";
import type { Scene } from "./scene";
import { buildAudit } from "./audit";
import { PILLAR_LABEL, rankLabel } from "./rank-model";
import { ctrAt, clicksAt } from "./ctr-curve";
import { hostOf } from "../utils";
import { coachLangFor } from "./locale";

export type CoachContext = {
  analysis: Analysis;
  niche: Niche | null;
  scene: Scene | null;
  gscRows: GscRow[];
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

type Vars = Record<string, string>;

const PROMPTS: Record<LangPack, (kw: string, host: string) => string[]> = {
  en: (kw, host) => [
    `Why isn't ${host} ranking higher for "${kw}"?`,
    "What should I do first?",
    "Show me the model",
    "What's the competition floor?",
    "How many clicks would moving up get me?",
    "Are these positions real?",
  ],
  de: (kw, host) => [
    `Warum rankt ${host} nicht höher für „${kw}“?`,
    "Was soll ich zuerst tun?",
    "Zeig mir das Modell",
    "Was ist die Wettbewerbsgrenze?",
    "Wie viele Klicks bringt ein Aufstieg?",
    "Sind diese Positionen echt?",
  ],
  fr: (kw, host) => [
    `Pourquoi ${host} ne ranke-t-il pas plus haut pour « ${kw} » ?`,
    "Par quoi commencer ?",
    "Montre-moi le modèle",
    "C'est quoi le plancher de concurrence ?",
    "Combien de clics en montant ?",
    "Ces positions sont-elles réelles ?",
  ],
  es: (kw, host) => [
    `¿Por qué ${host} no rankea más alto para «${kw}»?`,
    "¿Qué hago primero?",
    "Enséñame el modelo",
    "¿Cuál es el suelo de competencia?",
    "¿Cuántos clics gano si subo?",
    "¿Estas posiciones son reales?",
  ],
  it: (kw, host) => [
    `Perché ${host} non posiziona meglio per «${kw}»?`,
    "Cosa faccio per primo?",
    "Mostrami il modello",
    "Qual è il pavimento di competizione?",
    "Quanti click se salgo?",
    "Queste posizioni sono vere?",
  ],
  nl: (kw, host) => [
    `Waarom rankt ${host} niet hoger op "${kw}"?`,
    "Waarmee begin ik?",
    "Toon het model",
    "Wat is de concurrentievloer?",
    "Hoeveel clicks als ik stijg?",
    "Zijn deze posities echt?",
  ],
  el: (kw, host) => [
    `Γιατί το ${host} δεν ανεβαίνει για «${kw}»;`,
    "Τι να κάνω πρώτα;",
    "Δείξε μου το μοντέλο",
    "Ποιο είναι το πάτωμα ανταγωνισμού;",
    "Πόσα κλικ αν ανέβω;",
    "Είναι αληθινές οι θέσεις;",
  ],
  pt: (kw, host) => [
    `Por que ${host} não rankeia mais alto para "${kw}"?`,
    "O que fazer primeiro?",
    "Mostre o modelo",
    "Qual é o piso de concorrência?",
    "Quantos cliques se eu subir?",
    "Essas posições são reais?",
  ],
};

function fill(template: string, v: Vars): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
}

type CoachPack = { model: string; floor: string; real: string; first: string; firstEmpty: string; why: string };

const T: Record<LangPack, CoachPack> = {
  en: {
    model:
      "Three forces set the modeled rank for \"{kw}\":\n\n• **Hygiene** {hygiene}/100 — the weighted on-page checks.\n• **Relevance** {relevance}/100 — how well this page answers the query.\n• **Contest** {contest}/100 — phrase length and intent, no random jitter.\n\nFitness is 55% hygiene + 45% relevance = **{fitness}**. Distance {base} → **{distance}** after plays (drop {playDrop}). Competition floor {floor} (you cannot model above {floorRank} here). Modeled **{rank}**.",
    floor:
      "The competition floor for \"{kw}\" is **{floor}** distance, about **{floorRank}**. Authority plays shrink contest slowly; they cannot erase Wikipedia. Applied plays dropped distance by {playDrop}. Modeled **{rank}** (was {baseRank}).",
    real:
      "Positions in the lab are **modeled**, not live Google ranks. The model blends hygiene ({hygiene}/100) with relevance ({relevance}/100) and contest ({contest}/100). Each play reduces distance, with diminishing returns, and cannot cross the competition floor.\n\nPull **Live SERP** to see today's real page one. Your slot inside it stays modeled.",
    first: "Start with the quick wins for \"{kw}\":\n{list}\n\nApply them in the SERP lab to watch the modeled position move, then take on content and authority plays.",
    firstEmpty: "Every play for this scene is already applied. Stage another keyword or pull a live SERP to validate.",
    why: "For \"{kw}\" {host} models at **{rank}**. Hygiene {hygiene}/100, relevance {relevance}/100, contest {contest}/100 ({intent} intent).\n\n{reasons}\n\n{competitors}",
  },
  de: {
    model:
      "Drei Kräfte setzen den modellierten Rang für „{kw}“:\n\n• **Hygiene** {hygiene}/100\n• **Relevanz** {relevance}/100\n• **Wettbewerb** {contest}/100\n\nFitness {fitness}. Distanz {base} → **{distance}**. Grenze {floor} ({floorRank}). Modelliert **{rank}**.",
    floor: "Die Wettbewerbsgrenze für „{kw}“ liegt bei **{floor}**, etwa **{floorRank}**. Modelliert **{rank}**.",
    real: "Positionen sind **modelliert**, keine Live-Google-Ränge. Live SERP zeigt die echte Seite eins; dein Slot bleibt modelliert.",
    first: "Starte mit den Quick Wins für „{kw}“:\n{list}",
    firstEmpty: "Alle Plays sind angewendet.",
    why: "Für „{kw}“ modelliert {host} **{rank}**. Hygiene {hygiene}, Relevanz {relevance}, Wettbewerb {contest}.\n\n{reasons}\n\n{competitors}",
  },
  fr: {
    model:
      "Trois forces pour « {kw} » : hygiène {hygiene}/100, pertinence {relevance}/100, concurrence {contest}/100. Fitness {fitness}. Distance {base} → {distance}. Plancher {floor} ({floorRank}). Modélisé **{rank}**.",
    floor: "Le plancher pour « {kw} » est **{floor}**, vers **{floorRank}**. Modélisé **{rank}**.",
    real: "Les positions sont **modélisées**. Live SERP montre la vraie page un ; votre slot reste modélisé.",
    first: "Commencez par les quick wins pour « {kw} » :\n{list}",
    firstEmpty: "Tous les plays sont appliqués.",
    why: "Pour « {kw} », {host} est modélisé **{rank}**. Hygiène {hygiene}, pertinence {relevance}, concurrence {contest}.\n\n{reasons}\n\n{competitors}",
  },
  es: {
    model:
      "Tres fuerzas para «{kw}»: higiene {hygiene}/100, relevancia {relevance}/100, competencia {contest}/100. Fitness {fitness}. Distancia {base} → {distance}. Suelo {floor} ({floorRank}). Modelado **{rank}**.",
    floor: "El suelo para «{kw}» es **{floor}**, hacia **{floorRank}**. Modelado **{rank}**.",
    real: "Las posiciones están **modeladas**. Live SERP enseña la página uno real; tu hueco sigue modelado.",
    first: "Empieza por los quick wins de «{kw}»:\n{list}",
    firstEmpty: "Todos los plays están aplicados.",
    why: "Para «{kw}», {host} modela **{rank}**. Higiene {hygiene}, relevancia {relevance}, competencia {contest}.\n\n{reasons}\n\n{competitors}",
  },
  it: {
    model:
      "Tre forze per «{kw}»: igiene {hygiene}/100, rilevanza {relevance}/100, contest {contest}/100. Fitness {fitness}. Distanza {base} → {distance}. Pavimento {floor} ({floorRank}). Modellato **{rank}**.",
    floor: "Il pavimento per «{kw}» è **{floor}**, circa **{floorRank}**. Modellato **{rank}**.",
    real: "Le posizioni sono **modellate**. Live SERP mostra la pagina uno reale; lo slot resta modellato.",
    first: "Parti dalle quick win per «{kw}»:\n{list}",
    firstEmpty: "Tutti i play sono applicati.",
    why: "Per «{kw}» {host} è modellato **{rank}**. Igiene {hygiene}, rilevanza {relevance}, contest {contest}.\n\n{reasons}\n\n{competitors}",
  },
  nl: {
    model:
      "Drie krachten voor \"{kw}\": hygiene {hygiene}/100, relevantie {relevance}/100, contest {contest}/100. Fitness {fitness}. Afstand {base} → {distance}. Vloer {floor} ({floorRank}). Gemodelleerd **{rank}**.",
    floor: "De concurrentievloer voor \"{kw}\" is **{floor}**, ongeveer **{floorRank}**. Gemodelleerd **{rank}**.",
    real: "Posities zijn **gemodelleerd**. Live SERP toont de echte pagina één; jouw slot blijft gemodelleerd.",
    first: "Begin met de quick wins voor \"{kw}\":\n{list}",
    firstEmpty: "Alle plays zijn toegepast.",
    why: "Voor \"{kw}\" modelleert {host} **{rank}**. Hygiene {hygiene}, relevantie {relevance}, contest {contest}.\n\n{reasons}\n\n{competitors}",
  },
  el: {
    model:
      "Τρεις δυνάμεις για «{kw}»: υγιεινή {hygiene}/100, συνάφεια {relevance}/100, ανταγωνισμός {contest}/100. Fitness {fitness}. Απόσταση {base} → {distance}. Πάτωμα {floor} ({floorRank}). Μοντελοποιημένο **{rank}**.",
    floor: "Το πάτωμα ανταγωνισμού για «{kw}» είναι **{floor}**, περίπου **{floorRank}**. Μοντελοποιημένο **{rank}**.",
    real: "Οι θέσεις είναι **μοντελοποιημένες**. Το Live SERP δείχνει την πραγματική πρώτη σελίδα· η θέση σου μένει μοντελοποιημένη.",
    first: "Ξεκίνα με τα quick wins για «{kw}»:\n{list}",
    firstEmpty: "Όλα τα plays εφαρμόστηκαν.",
    why: "Για «{kw}» το {host} μοντελοποιείται **{rank}**. Υγιεινή {hygiene}, συνάφεια {relevance}, ανταγωνισμός {contest}.\n\n{reasons}\n\n{competitors}",
  },
  pt: {
    model:
      "Três forças para \"{kw}\": higiene {hygiene}/100, relevância {relevance}/100, disputa {contest}/100. Fitness {fitness}. Distância {base} → {distance}. Piso {floor} ({floorRank}). Modelado **{rank}**.",
    floor: "O piso para \"{kw}\" é **{floor}**, cerca de **{floorRank}**. Modelado **{rank}**.",
    real: "As posições são **modeladas**. Live SERP mostra a página um real; seu slot continua modelado.",
    first: "Comece pelos quick wins de \"{kw}\":\n{list}",
    firstEmpty: "Todos os plays já foram aplicados.",
    why: "Para \"{kw}\", {host} modela **{rank}**. Higiene {hygiene}, relevância {relevance}, disputa {contest}.\n\n{reasons}\n\n{competitors}",
  },
};

export function suggestedPrompts(ctx: CoachContext): string[] {
  const kw = ctx.niche?.keyword ?? "this page";
  const host = hostOf(ctx.analysis.snapshot.finalUrl);
  const lang = coachLangFor("", ctx.analysis.market);
  return PROMPTS[lang](kw, host);
}

export function coachReply(question: string, ctx: CoachContext): string {
  const q = question.toLowerCase();
  const { analysis, niche, scene } = ctx;
  const host = hostOf(analysis.snapshot.finalUrl);
  const audit = buildAudit(analysis.snapshot, analysis.market);
  const failing = audit.filter((c) => !c.pass);
  const kw = niche?.keyword ?? "the page";
  const plays = niche?.plays ?? [];
  const quick = plays.filter((p) => p.quickWin);
  const remaining = plays.filter((p) => !scene?.applied.some((a) => a.id === p.id));
  const competitors = (niche?.results ?? []).filter((r) => r.kind === "organic" && !r.isYou).slice(0, 3);
  const b = scene?.breakdown;
  const lang = coachLangFor(question, analysis.market);
  const pack: CoachPack = T[lang] ?? T.en;
  const vars: Vars = {
    kw,
    host,
    hygiene: String(b?.hygiene ?? analysis.score),
    relevance: String(b?.relevance ?? niche?.relevance ?? "—"),
    contest: String(b?.contest ?? niche?.difficulty ?? "—"),
    fitness: String(Math.round(b?.fitness ?? 0)),
    base: (b?.base ?? 0).toFixed(2),
    distance: (b?.distance ?? 0).toFixed(2),
    floor: (b?.floor ?? 0).toFixed(2),
    floorRank: rankLabel(b?.floorRank ?? null),
    rank: scene ? rankLabel(scene.rank) : niche ? rankLabel(niche.currentRank) : "—",
    baseRank: rankLabel(b?.baseRank ?? niche?.currentRank ?? null),
    playDrop: (b?.playDrop ?? 0).toFixed(2),
    intent: niche?.intent ?? "mixed",
    reasons: failing.length
      ? failing
          .slice(0, 3)
          .map((c) => `• ${c.label} — ${c.detail}`)
          .join("\n")
      : "Every on-page check passes, so the gap is competition and authority.",
    competitors: competitors.length ? `Above you: ${competitors.map((c) => `${c.domain} (${c.hint ?? "strong domain"})`).join("; ")}.` : "",
    list: "",
  };

  const matchedPlay = plays.find((p) => q.includes(p.title.toLowerCase().slice(0, 18)) || (p.id.split("-").pop() && q.includes(p.id.split("-").pop()!)));
  if (/(explain|what does|what is|how do i|how to|erkläre|erkläre|explique|explica|spiegami|leg uit|εξήγησε|explique)/.test(q) && matchedPlay) {
    const steps = Math.round(matchedPlay.impact * PILLAR_WEIGHT_SAFE(matchedPlay.pillar) * 12);
    return `**${matchedPlay.title}** is a ${PILLAR_LABEL[matchedPlay.pillar].toLowerCase()} play with ${matchedPlay.effort} effort.\n\n${matchedPlay.detail}\n\nIn the model it reduces distance by about ${steps}% of a full step (then diminishing returns). Stack it with other ${PILLAR_LABEL[matchedPlay.pillar].toLowerCase()} plays — you still cannot cross the competition floor.`;
  }

  if (/(model|formel|modèle|modelo|modello|μοντέλο|modelo)/.test(q) && /(show|zeig|montre|ensena|mostr|toon|δείξε|mostre|what|wie|comment|cómo|come|hoe|πώς|como)/.test(q)) {
    return fill(pack.model, vars);
  }
  if (/(floor|grenze|plancher|suelo|pavimento|vloer|πάτωμα|piso|competition floor)/.test(q)) {
    return fill(pack.floor, vars);
  }
  if (/(real|live|actual|guarantee|true|accurate|dataforseo|echt|réel|real|vera|echt|αληθιν|real)/.test(q)) {
    return fill(pack.real, vars);
  }
  if (/(why).*(not|n't|isn't|rank|higher|top|first|page one)/.test(q) || /position|rank\b|warum|pourquoi|por qué|perché|waarom|γιατί|por que/.test(q)) {
    return fill(pack.why, vars);
  }
  if (/(first|start|priority|begin|quick win|do now|today|zuerst|commencer|primero|primo|begin|πρώτα|primeiro)/.test(q)) {
    const list = (quick.length ? quick : remaining).slice(0, 3);
    if (!list.length) return pack.firstEmpty;
    vars.list = list.map((p, i) => `${i + 1}. **${p.title}** — ${p.detail}`).join("\n");
    return fill(pack.first, vars);
  }
  if (/(click|traffic|visit|ctr|impression|how many|klick|clic|click|κλικ|clique)/.test(q)) {
    const from = scene?.baseRank ?? niche?.currentRank ?? null;
    const to = scene?.rank ?? from;
    const gsc = ctx.gscRows.find((r) => r.query.toLowerCase() === kw);
    const impressions = gsc?.impressions ?? 1000;
    const label = gsc ? `Search Console shows ${gsc.impressions.toLocaleString("en")} impressions for this query` : "assuming 1,000 monthly impressions";
    return `Using the industry CTR curve (${label}): ${rankLabel(from)} captures about ${pct(ctrAt(from))} of clicks, ${rankLabel(to)} about ${pct(ctrAt(to))}.\n\nThat's roughly **${clicksAt(impressions, from).toLocaleString("en")} → ${clicksAt(impressions, to).toLocaleString("en")} clicks a month**. Import your GSC export to replace the assumption with your real impressions.`;
  }
  if (/(competitor|against|who ranks|beat|above me|konkurrenz|concurrent|competidor|concorrente|concurrent|ανταγων|concorrente)/.test(q)) {
    return competitors.length
      ? `Page one for "${kw}" is held by:\n${competitors.map((c, i) => `${i + 1}. **${c.domain}** — ${c.hint ?? "strong domain"}${c.authority ? ` (authority ~${c.authority})` : ""}`).join("\n")}\n\nThe fastest way past them is matching the SERP's shape (${niche?.intent} intent) before you chase links.`
      : "Stage a keyword first and I'll break down who holds page one.";
  }
  if (/(intent)/.test(q)) {
    return niche ? `"${kw}" reads as **${niche.intent}** intent. ${niche.why}` : "Pick a scene and I'll explain its intent.";
  }
  if (/(difficult|hard|competitive|schwierig|difficile|difícil|moeilijk|δύσκολ|difícil)/.test(q)) {
    return niche
      ? `Difficulty for "${kw}" is **${niche.difficulty}/100** — intent base plus phrase length, no random jitter. Authority plays shrink contest; they cannot push you through the competition floor.`
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

  return fill(pack.why, vars) + `\n\n${analysis.briefing}`;
}

function PILLAR_WEIGHT_SAFE(pillar: keyof typeof PILLAR_LABEL): number {
  return { "on-page": 1, content: 1.1, technical: 0.7, authority: 1.2, intent: 0.9 }[pillar];
}
