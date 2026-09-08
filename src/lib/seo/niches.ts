import type { Market, Niche, SearchIntent, SeoSnapshot } from "./types";
import { hash32, hostOf, seeded, clamp } from "../utils";
import { buildSerpScene } from "./serp-model";
import { buildPlays } from "./plays";
import type { AuditCheck } from "./audit";
import { baselineDistance, distanceToRank } from "./rank-model";
import { ALL_STOPWORDS, anyIntent } from "./locale";
import { scoreRelevance } from "./relevance";

type Candidate = { phrase: string; score: number; grams: number; seen: Set<number> };

/** Split a heading into phrase segments at separators, then into tokens. */
function segments(text: string): string[][] {
  return text
    .toLowerCase()
    .split(/[|•·–—:;,!?"“”‘’()[\]{}<>/\\@#$%^*_+=~`]|\s-\s|\.\s/)
    .map((seg) =>
      seg
        .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter((t) => t.length > 1 && !/^\d+$/.test(t)),
    )
    .filter((seg) => seg.length > 0);
}

function grams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    const slice = tokens.slice(i, i + n);
    const first = slice[0]!;
    const last = slice[slice.length - 1]!;
    if (ALL_STOPWORDS.has(first) || ALL_STOPWORDS.has(last)) continue;
    if (slice.every((t) => ALL_STOPWORDS.has(t))) continue;
    if (slice.some((t) => t.length < 3 && !ALL_STOPWORDS.has(t))) continue;
    if (n === 3 && ALL_STOPWORDS.has(slice[1]!)) continue;
    out.push(slice.join(" "));
  }
  return out;
}

/** Rank keyphrases from the page's headings and metadata. Deterministic for a given snapshot. */
export function extractKeyphrases(s: SeoSnapshot, limit = 12): Candidate[] {
  const brand = hostOf(s.finalUrl).split(".")[0] ?? "";
  const sources: { text: string; weight: number; maxGrams: number }[] = [
    { text: s.title, weight: 3, maxGrams: 5 },
    ...s.h1.map((t) => ({ text: t, weight: 3, maxGrams: 5 })),
    ...s.h2.slice(0, 16).map((t) => ({ text: t, weight: 2, maxGrams: 5 })),
    ...s.h3.slice(0, 16).map((t) => ({ text: t, weight: 1, maxGrams: 4 })),
    { text: s.metaDescription, weight: 1, maxGrams: 2 },
    { text: s.ogTitle ?? "", weight: 1, maxGrams: 3 },
  ];
  const scores = new Map<string, Candidate>();
  const BONUS = [0, 0.55, 1.4, 1.55, 1.65, 1.7] as const;
  sources.forEach((src, si) => {
    if (!src.text) return;
    for (const seg of segments(src.text)) {
      const tokens = seg.filter((t) => t !== brand);
      for (const n of [1, 2, 3, 4, 5] as const) {
        if (n > src.maxGrams) continue;
        for (const g of grams(tokens, n)) {
          const prev = scores.get(g);
          const add = src.weight * BONUS[n];
          if (prev) {
            prev.score += add;
            prev.seen.add(si);
          } else scores.set(g, { phrase: g, score: add, grams: n, seen: new Set([si]) });
        }
      }
    }
  });
  const descIndex = sources.findIndex((src) => src.text === s.metaDescription && src.maxGrams === 2);
  const list = [...scores.values()]
    .filter((c) => c.grams < 3 || c.seen.size >= 2)
    .filter((c) => !(c.seen.size === 1 && c.seen.has(descIndex)))
    .sort((a, b) => b.score - a.score);
  const kept: Candidate[] = [];
  for (const c of list) {
    const shadowed = kept.some(
      (k) => k.phrase !== c.phrase && k.phrase.includes(c.phrase) && k.score >= c.score * 0.75,
    );
    const shadows = kept.some((k) => c.phrase.includes(k.phrase) && c.score * 0.75 >= k.score);
    if (shadowed || shadows) continue;
    kept.push(c);
    if (kept.length >= limit) break;
  }
  return kept;
}

export function pageIntentBias(s: SeoSnapshot): SearchIntent {
  const head = `${s.title} ${s.h1.join(" ")}`;
  return anyIntent(head) ?? "informational";
}

export function classifyIntent(keyword: string, brand: string, bias: SearchIntent = "informational"): SearchIntent {
  const kw = keyword.toLowerCase();
  if (brand && kw.includes(brand.toLowerCase())) return "navigational";
  const hit = anyIntent(kw);
  if (hit) return hit;
  const words = kw.split(" ").length;
  if (words === 1) return "commercial";
  return bias;
}

/** Explainable difficulty: intent base + phrase length. No random jitter. */
export function difficultyFor(keyword: string, intent: SearchIntent): number {
  const base = { informational: 44, commercial: 62, transactional: 56, navigational: 18 }[intent];
  const words = keyword.split(" ").length;
  const lengthAdj = words === 1 ? 22 : words === 2 ? 4 : -9;
  return clamp(base + lengthAdj, 8, 96);
}

function volumeFor(keyword: string, intent: SearchIntent, rnd: () => number): Niche["volumeHint"] {
  const words = keyword.split(" ").length;
  const roll = rnd();
  if (intent === "navigational") return roll > 0.6 ? "mid" : "low";
  if (words === 1) return roll > 0.2 ? "high" : "mid";
  if (words === 2) return roll > 0.55 ? "high" : roll > 0.2 ? "mid" : "low";
  return roll > 0.75 ? "mid" : "low";
}

const WHY: Record<SearchIntent, (kw: string, where: string) => string> = {
  informational: (kw, where) =>
    `"${kw}" shows up in ${where}. The query reads as a question, so the SERP rewards clear definitions, an AI Overview-ready summary and answers to the People-also-ask block.`,
  commercial: (kw, where) =>
    `"${kw}" appears in ${where}. Searchers are comparing options, so listicles, comparison tables and review-style pages hold most of page one.`,
  transactional: (kw, where) =>
    `"${kw}" appears in ${where}. People are ready to act: price, availability, trust signals and Product/Offer schema decide who wins the click.`,
  navigational: (kw, where) =>
    `"${kw}" carries your brand. You should own this SERP outright with sitelinks, an Organization panel and consistent titles.`,
};

function whereFound(s: SeoSnapshot, kw: string): string {
  const spots: string[] = [];
  const has = (t: string) => t.toLowerCase().includes(kw);
  if (has(s.title)) spots.push("the title");
  if (s.h1.some(has)) spots.push("the H1");
  const h2s = s.h2.filter(has).length;
  if (h2s) spots.push(`${h2s} H2${h2s > 1 ? "s" : ""}`);
  if (s.metaDescription && has(s.metaDescription)) spots.push("the meta description");
  if (!spots.length) return "your headings";
  return spots.length === 1 ? spots[0]! : `${spots.slice(0, -1).join(", ")} and ${spots[spots.length - 1]}`;
}

export type NicheInput = {
  snapshot: SeoSnapshot;
  audit: AuditCheck[];
  score: number;
  market: Market;
};

export function buildNiche(
  keyword: string,
  input: NicheInput,
  source: Niche["source"] = "headings",
): Niche {
  const kw = keyword.trim().toLowerCase().replace(/\s+/g, " ");
  const brand = hostOf(input.snapshot.finalUrl).split(".")[0] ?? "";
  const seed = hash32(`${input.snapshot.finalUrl}|${kw}|${input.market}`);
  const rnd = seeded(seed);
  const intent = classifyIntent(kw, brand, pageIntentBias(input.snapshot));
  const difficulty = difficultyFor(kw, intent);
  const rel = scoreRelevance(kw, input.snapshot, intent, input.market);
  const id = `n-${seed.toString(36)}`;
  const results = buildSerpScene({ keyword: kw, intent, market: input.market, seed, snapshot: input.snapshot });
  const plays = buildPlays({ nicheId: id, keyword: kw, intent, snapshot: input.snapshot, audit: input.audit, results });
  const currentRank = distanceToRank(baselineDistance(input.score, difficulty, rel.score));
  return {
    id,
    keyword: kw,
    intent,
    volumeHint: volumeFor(kw, intent, rnd),
    difficulty,
    relevance: rel.score,
    relevanceNotes: rel.notes,
    currentRank,
    why: WHY[intent](kw, whereFound(input.snapshot, kw)),
    results,
    plays,
    source,
  };
}

export function buildNiches(input: NicheInput): Niche[] {
  const phrases = extractKeyphrases(input.snapshot, 10);
  const picked: string[] = [];
  for (const c of phrases) {
    if (picked.length >= 4) break;
    if (c.grams === 1 && picked.length >= 3) continue;
    if (c.grams >= 4 && picked.some((p) => c.phrase.includes(p))) continue;
    picked.push(c.phrase);
  }
  const brand = hostOf(input.snapshot.finalUrl).split(".")[0];
  if (brand && brand.length > 2 && !picked.some((p) => p.includes(brand))) picked.push(brand);
  if (!picked.length) picked.push(hostOf(input.snapshot.finalUrl));
  return picked.map((kw) => buildNiche(kw, input));
}
