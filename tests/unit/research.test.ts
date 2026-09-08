import { afterEach, describe, it, expect, vi } from "vitest";
import { normalizeResearch, fetchResearch } from "@/lib/integrations/serp";
import { jobInput } from "@/lib/jobs/queue";
import { ordinaryQuery } from "@/lib/research";
const fixture = (items: unknown[]) => ({
  status_code: 20000,
  cost: 0.001,
  tasks: [
    {
      id: "fixture-task",
      status_code: 20000,
      cost: 0.001,
      result: [{ items }],
    },
  ],
});
afterEach(() => vi.unstubAllGlobals());
describe("Bounded DataForSEO research", () => {
  it("retains real zeroes while keeping missing keyword values unavailable", () => {
    const r = normalizeResearch(
      fixture([
        {
          keyword: "test",
          keyword_info: {
            search_volume: 0,
            cpc: null,
            competition: 0,
            monthly_searches: [
              { year: 2026, month: 8, search_volume: 0 },
              { year: 2026, month: 7, search_volume: null },
            ],
          },
          keyword_properties: { keyword_difficulty: 0 },
        },
      ]),
      "keywords",
      "test",
      "US",
      "en",
    );
    expect(r.metrics?.searchVolume).toBe(0);
    expect(r.metrics?.cpc).toBeNull();
    expect(r.metrics?.keywordDifficulty).toBe(0);
    expect(r.metrics?.monthlySearches[1].searchVolume).toBeNull();
    expect(r.status).toBe("inferred");
    expect(r.providerTaskId).toBe("fixture-task");
  });
  it("does not substitute another keyword when the requested record is missing", () => {
    const r = normalizeResearch(
      fixture([
        { keyword: "another phrase", keyword_info: { search_volume: 900 } },
      ]),
      "keywords",
      "test",
      "US",
      "en",
    );
    expect(r.available).toBe(false);
    expect(r.metrics?.searchVolume).toBeNull();
  });
  it("keeps organic results separate from paid listings and extracts only returned questions", () => {
    const r = normalizeResearch(
      fixture([
        { type: "paid", url: "https://ads.example", title: "Ad" },
        {
          type: "organic",
          url: "https://example.com",
          title: "Result",
          rank_group: 1,
        },
        { type: "organic", url: "javascript:alert(1)", title: "unsafe" },
        {
          type: "people_also_ask",
          items: [
            { title: "A returned question?" },
            { title: "A returned question?" },
          ],
        },
        { type: "related_searches" },
      ]),
      "serp",
      "test",
      "US",
      "en",
    );
    expect(r.results).toHaveLength(1);
    expect(r.results?.[0].url).toBe("https://example.com");
    expect(r.questions).toEqual(["A returned question?"]);
    expect(r.features).toContain("related_searches");
    expect(r.status).toBe("measured");
  });
  it("rejects provider task failures even inside successful HTTP envelopes", () => {
    expect(() =>
      normalizeResearch(
        { status_code: 20000, tasks: [{ status_code: 40200, result: null }] },
        "serp",
        "x",
        "US",
        "en",
      ),
    ).toThrow("account access");
    expect(() =>
      normalizeResearch(
        { status_code: 20000, tasks: [{ status_code: 20000, result: null }] },
        "serp",
        "x",
        "US",
        "en",
      ),
    ).toThrow("incomplete");
    expect(() => normalizeResearch({}, "serp", "x", "US", "en")).toThrow(
      "unreadable",
    );
  });
  it.each([
    "site:example.com",
    "coffee site%3Aexample.com",
    "s%2569te%253Aexample.com",
    "foo+allintitle%3Abar",
    "inurl:admin",
  ])(
    "blocks differently priced advanced operators before queuing: %s",
    (query) => {
      expect(ordinaryQuery(query)).toBe(false);
      expect(jobInput.safeParse({ kind: "serp", query }).success).toBe(false);
    },
  );
  it("keeps old SERP job inputs compatible and bounds the new keyword mode", () => {
    expect(jobInput.parse({ kind: "serp", query: "olive oil" })).toMatchObject({
      mode: "serp",
    });
    expect(
      jobInput.safeParse({
        kind: "serp",
        mode: "keywords",
        query: "x".repeat(81),
      }).success,
    ).toBe(false);
    expect(
      jobInput.safeParse({
        kind: "serp",
        mode: "keywords",
        query: Array(11).fill("word").join(" "),
      }).success,
    ).toBe(false);
    expect(
      jobInput.safeParse({ kind: "serp", mode: "keywords", query: "olive oil" })
        .success,
    ).toBe(true);
  });
  it("rejects unsupported countries before making any network request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(fetchResearch("olive oil", "XX", "en")).rejects.toThrow(
      "not available",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
