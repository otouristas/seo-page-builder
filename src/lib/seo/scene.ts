import type { Niche, Play, SerpResult } from "./types";
import { baselineDistance, distanceAfter, distanceToRank, trajectory, rankBreakdown, type RankBreakdown } from "./rank-model";

export type Scene = {
  rank: number | null;
  baseRank: number | null;
  distance: number;
  base: number;
  applied: Play[];
  /** SERP blocks followed by ordered organic results with "You" inserted at the modeled slot. */
  results: SerpResult[];
  you: SerpResult;
  trajectory: (number | null)[];
  /** Positive = moved up. */
  delta: number | null;
  breakdown: RankBreakdown;
};

export function composeScene(
  niche: Niche,
  score: number,
  appliedIds: string[],
  liveOrganic?: SerpResult[] | null,
): Scene {
  const applied = niche.plays.filter((p) => appliedIds.includes(p.id));
  const relevance = niche.relevance ?? 0;
  const base = baselineDistance(score, niche.difficulty, relevance);
  const distance = distanceAfter(base, applied, niche.difficulty);
  const rank = distanceToRank(distance);
  const baseRank = distanceToRank(base);
  const blocks = niche.results.filter((r) => r.kind !== "organic");
  const you = niche.results.find((r) => r.isYou) ?? {
    id: `${niche.id}-you`,
    kind: "organic" as const,
    isYou: true,
    domain: "you",
    url: "",
    title: "Your page",
    snippet: "",
  };
  const competitors = (liveOrganic && liveOrganic.length ? liveOrganic : niche.results.filter((r) => r.kind === "organic" && !r.isYou)).filter(
    (r) => r.domain !== you.domain,
  );
  const organic: SerpResult[] = [];
  const slot = rank === null ? -1 : rank - 1;
  let ci = 0;
  for (let i = 0; i < 10; i++) {
    if (i === slot) {
      organic.push(you);
      continue;
    }
    const c = competitors[ci++];
    if (c) organic.push(c);
  }
  return {
    rank,
    baseRank,
    distance,
    base,
    applied,
    results: [...blocks, ...organic],
    you,
    trajectory: trajectory(base, applied, niche.difficulty),
    delta: baseRank !== null && rank !== null ? baseRank - rank : baseRank === null && rank !== null ? 11 - rank : null,
    breakdown: rankBreakdown(score, relevance, niche.difficulty, applied),
  };
}
