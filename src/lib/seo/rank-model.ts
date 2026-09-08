import type { Play, PlayPillar } from "./types";
import { clamp } from "../utils";

/** How much each pillar moves the modeled position per unit of impact. */
export const PILLAR_WEIGHT: Record<PlayPillar, number> = {
  "on-page": 1.0,
  content: 1.1,
  technical: 0.7,
  authority: 1.2,
  intent: 0.9,
};

export const PILLAR_LABEL: Record<PlayPillar, string> = {
  "on-page": "On-page",
  content: "Content",
  technical: "Technical",
  authority: "Authority",
  intent: "Intent",
};

/** Step size per play: impact × weight × STEP. */
const STEP = 0.12;
const DIMINISH = 0.85;
const FLOOR_FACTOR = 0.28;

export function pageFitness(hygiene: number, relevance: number): number {
  return clamp(hygiene * 0.55 + relevance * 0.45, 0, 100);
}

/**
 * Distance from the top of page one, 0 = #1, 1 = #10, > 1 = page two.
 * Fitness blends hygiene (on-page checks) with query relevance. Contest is niche difficulty.
 */
export function baselineDistance(score: number, difficulty: number, relevance = 0): number {
  const fitness = pageFitness(score, relevance) / 100;
  const contest = clamp(difficulty, 0, 100) / 100;
  return clamp((1 - fitness) * 0.55 + contest * 0.5, 0, 1.25);
}

export function competitionFloor(difficulty: number): number {
  return (clamp(difficulty, 0, 100) / 100) * FLOOR_FACTOR;
}

export function distanceToRank(distance: number): number | null {
  if (distance > 1) return null;
  return clamp(1 + Math.round(distance * 9), 1, 10);
}

export function playReduction(play: Play): number {
  return clamp(play.impact, 0, 1) * PILLAR_WEIGHT[play.pillar] * STEP;
}

export function distanceAfter(base: number, applied: Play[], difficulty = 0): number {
  let reduction = 0;
  let weight = 1;
  for (const p of applied) {
    reduction += playReduction(p) * weight;
    weight *= DIMINISH;
  }
  const floor = competitionFloor(difficulty);
  return clamp(Math.max(base - reduction, floor), 0, 1.25);
}

/** Rank after each applied play in order — feeds the sparkline. */
export function trajectory(base: number, applied: Play[], difficulty = 0): (number | null)[] {
  const out: (number | null)[] = [distanceToRank(base)];
  let d = base;
  let weight = 1;
  const floor = competitionFloor(difficulty);
  for (const p of applied) {
    d = clamp(Math.max(d - playReduction(p) * weight, floor), 0, 1.25);
    weight *= DIMINISH;
    out.push(distanceToRank(d));
  }
  return out;
}

export function rankLabel(rank: number | null): string {
  return rank === null ? "Page 2" : `#${rank}`;
}

export type RankBreakdown = {
  hygiene: number;
  relevance: number;
  fitness: number;
  contest: number;
  base: number;
  distance: number;
  floor: number;
  rank: number | null;
  baseRank: number | null;
  floorRank: number | null;
  playDrop: number;
};

export function rankBreakdown(hygiene: number, relevance: number, difficulty: number, applied: Play[]): RankBreakdown {
  const fitness = pageFitness(hygiene, relevance);
  const contest = clamp(difficulty, 0, 100);
  const base = baselineDistance(hygiene, difficulty, relevance);
  const distance = distanceAfter(base, applied, difficulty);
  const floor = competitionFloor(difficulty);
  return {
    hygiene: clamp(hygiene, 0, 100),
    relevance: clamp(relevance, 0, 100),
    fitness,
    contest,
    base,
    distance,
    floor,
    rank: distanceToRank(distance),
    baseRank: distanceToRank(base),
    floorRank: distanceToRank(floor),
    playDrop: clamp(base - distance, 0, 1.25),
  };
}
