import { describe, expect, it } from "vitest";
import { baselineDistance, competitionFloor, distanceAfter, distanceToRank, pageFitness, rankBreakdown } from "./rank-model";
import type { Play } from "./types";

const play = (impact: number, pillar: Play["pillar"] = "on-page"): Play => ({
  id: "p",
  title: "t",
  detail: "",
  impact,
  pillar,
  effort: "low",
});

describe("rank-model", () => {
  it("fitness blends hygiene and relevance", () => {
    expect(pageFitness(100, 0)).toBeCloseTo(55);
    expect(pageFitness(0, 100)).toBeCloseTo(45);
    expect(pageFitness(100, 100)).toBe(100);
  });

  it("higher relevance shortens distance", () => {
    const weak = baselineDistance(80, 50, 10);
    const strong = baselineDistance(80, 50, 90);
    expect(strong).toBeLessThan(weak);
  });

  it("plays diminish and cannot cross the floor", () => {
    const difficulty = 80;
    const base = baselineDistance(40, difficulty, 20);
    const floor = competitionFloor(difficulty);
    const many = Array.from({ length: 8 }, () => play(1, "authority"));
    const after = distanceAfter(base, many, difficulty);
    expect(after).toBeGreaterThanOrEqual(floor - 1e-9);
    expect(after).toBeLessThan(base);
    const one = distanceAfter(base, [play(1, "authority")], difficulty);
    const two = distanceAfter(base, [play(1, "authority"), play(1, "authority")], difficulty);
    expect(base - two).toBeLessThan((base - one) * 2);
  });

  it("maps distance to ranks", () => {
    expect(distanceToRank(0)).toBe(1);
    expect(distanceToRank(1)).toBe(10);
    expect(distanceToRank(1.01)).toBeNull();
  });

  it("breakdown is consistent", () => {
    const b = rankBreakdown(70, 50, 60, [play(0.5)]);
    expect(b.hygiene).toBe(70);
    expect(b.relevance).toBe(50);
    expect(b.distance).toBeGreaterThanOrEqual(b.floor);
    expect(b.rank).toEqual(distanceToRank(b.distance));
  });
});
