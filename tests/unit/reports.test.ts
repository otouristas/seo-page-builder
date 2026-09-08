import { expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { writeFileSync, mkdirSync } from "node:fs";
import { reportPdf, reportCsv, type ReportPayload } from "@/lib/server/reports";
const fixture: ReportPayload = {
  project: {
    name: "QA fixture — Καλημέρα",
    url: "https://example.com",
    country: "GR",
  },
  createdAt: "2026-09-08T20:00:00.000Z",
  performance: null,
  answers: [],
  opportunities: [
    {
      title: "Add a useful search description",
      detail:
        "Explicit test fixture: the page has no meta description. Review a short description of what the page actually offers.",
      page_url: "https://example.com/" + "long-path-segment-".repeat(35),
      status: "open",
      evidence: {
        source: "QA fixture",
        status: "sample",
        observedAt: "2026-09-08T20:00:00.000Z",
      },
      verified_at: null,
    },
  ],
  methodology:
    "This PDF contains explicit QA fixtures. Real reports use saved HTML observations, measured Search Console data and labeled sampled AI answers. Traffic changes show association, not proof of causation.",
};
it("exports a readable paginated PDF with embedded font and long URL wrapping", async () => {
  const bytes = await reportPdf(fixture, "RankSushi report — QA fixture");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBeGreaterThan(0);
  expect(doc.getTitle()).toBe("RankSushi report — QA fixture");
  expect(bytes.byteLength).toBeGreaterThan(5000);
  mkdirSync("artifacts/qa", { recursive: true });
  writeFileSync("artifacts/qa/report-fixture.pdf", bytes);
});
it("CSV export preserves original Unicode and quotes spreadsheet formulas safely", () => {
  const csv = reportCsv({
    ...fixture,
    opportunities: [
      { ...fixture.opportunities[0], title: "=SUM(A1) Καλημέρα" },
    ],
  });
  expect(csv).toContain("'=SUM(A1) Καλημέρα");
});
