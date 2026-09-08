import { describe, expect, it } from "vitest";
import { auditScore, buildAudit } from "./audit";
import { snap } from "./test-snapshot";

describe("audit", () => {
  it("scores a healthy page highly", () => {
    const checks = buildAudit(snap(), "us");
    expect(auditScore(checks)).toBeGreaterThan(80);
  });

  it("fails lang when it contradicts the market", () => {
    const checks = buildAudit(snap({ lang: "en" }), "de");
    const lang = checks.find((c) => c.id === "lang")!;
    expect(lang.pass).toBe(false);
  });

  it("passes hreflang when empty (single-locale)", () => {
    const checks = buildAudit(snap({ hreflang: [] }), "us");
    expect(checks.find((c) => c.id === "hreflang")!.pass).toBe(true);
  });

  it("fails hreflang when the cluster omits the market", () => {
    const checks = buildAudit(snap({ hreflang: ["de", "fr"] }), "us");
    expect(checks.find((c) => c.id === "hreflang")!.pass).toBe(false);
  });

  it("uses main word count for depth", () => {
    const checks = buildAudit(snap({ wordCount: 2000, wordCountMain: 200 }), "us");
    expect(checks.find((c) => c.id === "words")!.pass).toBe(false);
  });

  it("canonical must match this URL", () => {
    const miss = buildAudit(snap({ canonical: "https://example.com/other" }), "us").find((c) => c.id === "canonical")!;
    expect(miss.pass).toBe(false);
  });
});
