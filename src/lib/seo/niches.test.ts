import { describe, expect, it } from "vitest";
import { difficultyFor, extractKeyphrases } from "./niches";
import { snap } from "./test-snapshot";

describe("niches", () => {
  it("difficulty is deterministic (no jitter)", () => {
    expect(difficultyFor("payment processing", "commercial")).toBe(difficultyFor("payment processing", "commercial"));
    expect(difficultyFor("seo", "commercial")).toBeGreaterThan(difficultyFor("best payment processing for startups", "commercial"));
  });

  it("extracts keyphrases from a tiny snapshot", () => {
    const phrases = extractKeyphrases(snap(), 8);
    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases.some((c) => c.phrase.includes("payment"))).toBe(true);
  });
});
