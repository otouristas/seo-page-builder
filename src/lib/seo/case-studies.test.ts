import { describe, expect, it } from "vitest";
import { CASE_STUDIES, buildCaseStudyView } from "./case-studies";
import { composeScene } from "./scene";

describe("case studies", () => {
  it("applied plays improve or hold modeled rank (no hardcoded ranks)", () => {
    expect(CASE_STUDIES.map((s) => s.market).sort()).toEqual(["gr", "us", "us"].sort());
    for (const study of CASE_STUDIES) {
      const view = buildCaseStudyView(study);
      const niche = view.analysis.niches.find((n) => n.id === view.nicheId);
      expect(niche).toBeTruthy();
      expect(view.appliedIds.length).toBeGreaterThan(0);
      const before = composeScene(niche!, view.analysis.score, []);
      const after = composeScene(niche!, view.analysis.score, view.appliedIds);
      const b = before.rank ?? 12;
      const a = after.rank ?? 12;
      expect(a).toBeLessThanOrEqual(b);
    }
  });
});
