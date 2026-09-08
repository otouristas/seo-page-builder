import { describe, expect, it } from "vitest";
import { scoreRelevance } from "./relevance";
import { snap } from "./test-snapshot";

describe("relevance", () => {
  it("scores an English keyword in title and H1 highly", () => {
    const r = scoreRelevance("payment processing", snap(), "commercial", "us");
    expect(r.score).toBeGreaterThan(60);
    expect(r.notes.some((n) => /title/i.test(n))).toBe(true);
  });

  it("drops when the query is unrelated", () => {
    const r = scoreRelevance("cloud accounting software", snap(), "commercial", "us");
    expect(r.score).toBeLessThan(40);
  });

  it("credits German keyword overlap", () => {
    const s = snap({
      title: "Zahlungsabwicklung für Teams",
      h1: ["Zahlungsabwicklung die skaliert"],
      excerpt: "Zahlungsabwicklung für wachsende Teams.",
      lang: "de",
    });
    const r = scoreRelevance("zahlungsabwicklung", s, "commercial", "de");
    expect(r.score).toBeGreaterThan(50);
  });

  it("credits Greek keyword in title", () => {
    const s = snap({
      title: "Σύγκριση τιμών στα ηλεκτρονικά",
      h1: ["Σύγκριση τιμών"],
      excerpt: "Σύγκριση τιμών σε χιλιάδες προϊόντα.",
      lang: "el",
      schemaTypes: ["WebSite"],
    });
    const r = scoreRelevance("σύγκριση τιμών", s, "commercial", "gr");
    expect(r.score).toBeGreaterThan(50);
  });
});
