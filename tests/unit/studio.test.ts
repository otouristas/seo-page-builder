import { describe, expect, it, vi } from "vitest";
import { RECORDED_SCENE } from "@/lib/studio/recorded";
import {
  locatePage,
  pageIdentity,
  proposeMoves,
  sameSearch,
  termCoverage,
  observedEdits,
  verifyEdits,
  sceneExport,
} from "@/lib/studio/scene";
import { enqueueJob, jobInput } from "@/lib/jobs/queue";
import { DEMO_DATA } from "@/lib/demo";
vi.mock("@/lib/seo/safe-fetch", () => ({
  validatePublicUrl: async (input: string) => ({ url: new URL(input) }),
}));
describe("SERP Studio evidence boundaries", () => {
  const { page, serps } = RECORDED_SCENE;
  const serp = serps[0];
  it("matches exact URLs and declared canonicals without conflating pages or query strings", () => {
    const first = serp.results![0];
    expect(
      locatePage(serp, {
        url: first.url + "#section",
        finalUrl: first.url,
        canonical: null,
      })?.match,
    ).toBe("page");
    expect(
      locatePage(serp, {
        url: "https://different.example/",
        finalUrl: "https://different.example/",
        canonical: first.url,
      })?.match,
    ).toBe("canonical");
    expect(
      locatePage(serp, {
        url: first.url + "?variant=2",
        finalUrl: first.url + "?variant=2",
        canonical: null,
      }),
    ).toBeNull();
    expect(pageIdentity("javascript:alert(1)")).toBeNull();
  });
  it("uses whole query terms, including Unicode, instead of substring relevance scores", () => {
    expect(termCoverage("Care and scar tissue", "car")).toEqual([]);
    expect(termCoverage("SEO software", "the SEO software")).toEqual([
      "seo",
      "software",
    ]);
    expect(termCoverage("Διακοπές στην Ελλάδα", "Ελλάδα")).toEqual(["ελλάδα"]);
  });
  it("never reorders or invents positions when producing suggested edits", () => {
    const before = JSON.stringify(serp.results);
    const moves = proposeMoves(page, serp, "RankSushi");
    expect(moves[0].observation).toContain("returned titles");
    expect(JSON.stringify(serp.results)).toBe(before);
    expect(locatePage(serp, page)).toBeNull();
    expect(moves.find((m) => m.id === "answer")?.proposal).toBe("");
  });
  it("does not compare different countries, languages, devices or queries", () => {
    expect(sameSearch(serp, { ...serp })).toBe(true);
    for (const change of [
      { country: "GR" },
      { language: "el" },
      { device: "database" as const },
      { keyword: "another search" },
    ])
      expect(sameSearch(serp, { ...serp, ...change })).toBe(false);
  });
  it("requires a later inspected page before a draft can be verified", () => {
    const edits = {
      ...observedEdits(page),
      title: "A reviewed title",
      answer: "Supported answer",
    };
    expect(verifyEdits(page, page, edits).map((c) => c.status)).toEqual([
      "awaiting-recheck",
      "awaiting-recheck",
    ]);
    const current = {
      ...page,
      title: edits.title,
      text: "Supported   answer",
      fetchedAt: "2026-09-10T00:00:00Z",
    };
    expect(verifyEdits(page, current, edits).map((c) => c.status)).toEqual([
      "matched",
      "matched",
    ]);
    expect(
      verifyEdits(page, { ...current, title: "Something else" }, edits)[0]
        .status,
    ).toBe("not-found");
  });
  it("exports the actual evidence and reviewed text without implied publication or rank forecasts", () => {
    const output = sceneExport(page, serp, {
      ...observedEdits(page),
      title: "My reviewed title",
    });
    expect(output).toContain(serp.observedAt);
    expect(output).toContain(page.fetchedAt);
    expect(output).toContain("My reviewed title");
    expect(output).toContain("does not publish changes or predict a ranking");
  });
  it("rejects a scene for another project host before quota reservation or provider work", async () => {
    const input = jobInput.parse({
      kind: "serp",
      query: "seo software",
      pageUrl: "https://different.example/page",
    });
    await expect(enqueueJob(DEMO_DATA.project, input)).rejects.toThrow(
      "this project’s website",
    );
  });
});
