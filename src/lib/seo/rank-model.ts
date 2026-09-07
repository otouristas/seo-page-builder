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

/**
 * Distance from the top of page one, 0 = #1, 1 = #10, > 1 = page two.
 * Blends how weak the page is (100 − score) with how contested the niche is.
 */
export function baselineDistance(score: number, difficulty: number): number {
  const weakness = (100 - clamp(score, 0, 100)) / 100;
  const contest = clamp(difficulty, 0, 100) / 100;
  return clamp(weakness * 0.55 + contest * 0.65, 0, 1.25);
}

export function distanceToRank(distance: number): number | null {
  if (distance > 1) return null;
  return clamp(1 + Math.round(distance * 9), 1, 10);
}

export function playReduction(play: Play): number {
  return clamp(play.impact, 0, 1) * PILLAR_WEIGHT[play.pillar] * STEP;
}

export function distanceAfter(base: number, applied: Play[]): number {
  const reduction = applied.reduce((sum, p) => sum + playReduction(p), 0);
  return clamp(base - reduction, 0, 1.25);
}

/** Rank after each applied play in order — feeds the sparkline. */
export function trajectory(base: number, applied: Play[]): (number | null)[] {
  const out: (number | null)[] = [distanceToRank(base)];
  let d = base;
  for (const p of applied) {
    d = clamp(d - playReduction(p), 0, 1.25);
    out.push(distanceToRank(d));
  }
  return out;
}

export function rankLabel(rank: number | null): string {
  return rank === null ? "Page 2" : `#${rank}`;
}
