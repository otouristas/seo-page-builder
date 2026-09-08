import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  CORPUS_RULES,
  CORPUS_SOURCES,
  CORPUS_VERSION,
  selectCorpusRules,
} from "@/lib/knowledge/corpus";
import { COLLECTIONS } from "@/lib/learning/content";
import { publicPages } from "@/lib/public-pages";
import { articleMarkdown } from "@/lib/learning/exports";
import { fixPrompt } from "@/lib/fixes/prompts";
import { validateStructuredData } from "@/lib/seo/schema";
import { parseSnapshot } from "@/lib/seo/audit";
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("openai", () => ({
  default: class {
    responses = { create };
  },
}));
import { generateDraft } from "@/lib/integrations/ai";
describe("Recovered corpus becomes bounded, inspectable product guidance", () => {
  it("has valid public sources, unique methods and a recoverable historical manifest", () => {
    expect(new Set(CORPUS_RULES.map((r) => r.id)).size).toBe(
      CORPUS_RULES.length,
    );
    const manifest = JSON.parse(
      readFileSync("knowledge/seo-corpus/manifest.json", "utf8"),
    );
    expect(manifest.reports).toHaveLength(11);
    for (const r of CORPUS_RULES) {
      expect(r.sourceIds.length).toBeGreaterThan(0);
      for (const id of r.sourceIds)
        expect(new URL(CORPUS_SOURCES[id].url).protocol).toBe("https:");
      for (const date of r.originDates)
        expect(
          manifest.reports.some(
            (report: { date: string }) => report.date === date,
          ),
        ).toBe(true);
    }
  });
  it("carries every public method into Markdown and keeps private recovery configuration out", () => {
    const article = COLLECTIONS.learn.find(
      (a) => a.slug === "seo-evidence-library",
    )!;
    const md = articleMarkdown(article, "learn");
    for (const rule of CORPUS_RULES) {
      expect(md).toContain(rule.action);
      expect(md).toContain(rule.guardrail);
      expect(md).toContain(rule.verify);
    }
    expect(md).not.toMatch(/docs\.google\.com|automationId|6a8861d7/);
    const p = fixPrompt({
      key: "schema",
      title: "Review schema",
      detail: "Observed nested review",
      status: "warning",
    });
    expect(p).toContain("Google guidance");
    expect(p).toContain("review-snippet");
    expect(p).toContain(CORPUS_VERSION);
  });
  it("keeps selection bounded, relevant and free of an unrelated fallback", () => {
    expect(selectCorpusRules("schema review")[0].id).toBe("review-subject");
    expect(
      selectCorpusRules("canonical").every((r) =>
        r.triggers.includes("canonical"),
      ),
    ).toBe(true);
    expect(selectCorpusRules("", 50)).toEqual([]);
    expect(selectCorpusRules("paid chair emails")).toEqual([]);
    expect(
      selectCorpusRules("schema ai content canonical report", 99).length,
    ).toBeLessThanOrEqual(6);
  });
  it("uses actual existing pages in RankSushi’s plan without inventing demand or activating the schedule", () => {
    const config = JSON.parse(
      readFileSync("config/ranksushi-seo.json", "utf8"),
    );
    const paths = new Set(publicPages().map((p) => p.path));
    for (const target of config.targets) {
      expect(paths.has(target.path), target.path).toBe(true);
      expect(target.queryEvidence).toContain("unmeasured");
      for (const id of target.rules)
        expect(CORPUS_RULES.some((r) => r.id === id)).toBe(true);
    }
    expect(config.launch.domainStatus).toBe("purchase-pending");
    const corpusConfig = JSON.parse(
      readFileSync("config/seo-corpus.json", "utf8"),
    );
    expect(corpusConfig.execution.enabled).toBe(false);
    expect(corpusConfig.topics).toHaveLength(20);
    expect(corpusConfig.originalTask.liveStatusVerified).toBe(false);
  });
  it("passes original-evidence methods to drafting and persists method provenance separately from factual evidence", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-fixture");
    const snapshot = parseSnapshot(
      "<html><head><title>Our service</title></head><body><h1>Our service</h1><p>Contact our team.</p></body></html>",
      "https://example.com/service",
    );
    create.mockResolvedValueOnce({
      status: "completed",
      model: "fixture-model",
      output_text: JSON.stringify({
        title: "A brief",
        content: "[Confirm: Add an original service example.]",
        evidenceUrls: [snapshot.finalUrl, "https://unrelated.example/"],
        needsConfirmation: ["An original example"],
      }),
    });
    try {
      const output = await generateDraft(
        "brief",
        "Help with original content",
        { name: "Test", description: "A service", language: "en" },
        [snapshot],
      );
      const request = create.mock.calls[0][0],
        input = JSON.parse(request.input);
      expect(input.corpusMethods.length).toBeLessThanOrEqual(4);
      expect(
        input.corpusMethods.some((m: { slug: string }) =>
          m.slug.endsWith("#original-evidence"),
        ),
      ).toBe(true);
      expect(input.evidence[0].url).toBe(snapshot.finalUrl);
      expect(output.evidenceUrls).toEqual([snapshot.finalUrl]);
      expect(
        output.guidanceSources.some(
          (r) =>
            r.url.endsWith("#original-evidence") &&
            r.version === CORPUS_VERSION,
        ),
      ).toBe(true);
      expect(output.needsConfirmation).toContain("An original example");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
describe("Corpus-derived semantic checks", () => {
  it("handles valid nested review arrays and flags conflicting or missing subjects", () => {
    const review = {
      "@type": "Review",
      author: { "@type": "Person", name: "Alex" },
      reviewRating: { "@type": "Rating", ratingValue: 4 },
    };
    const parent = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "A cup",
      image: "https://example.com/cup.png",
      review: [review],
    };
    expect(
      validateStructuredData(JSON.stringify(parent), "A cup Alex").issues.some(
        (i) => i.message.includes("subject"),
      ),
    ).toBe(false);
    const conflicting = {
      ...parent,
      review: [
        {
          ...review,
          itemReviewed: { "@type": "Product", name: "Another cup" },
        },
      ],
    };
    const issue = validateStructuredData(
      JSON.stringify(conflicting),
    ).issues.find((i) => i.message.includes("ambiguous subject"));
    expect(issue?.path).toBe("$.review[0].itemReviewed");
    expect(issue?.level).toBe("review");
    expect(
      validateStructuredData(
        JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [review],
        }),
      ).issues.some((i) => i.message.includes("standalone")),
    ).toBe(true);
  });
  it("treats business review ownership as a question and supports nested aggregate ratings", () => {
    const result = validateStructuredData(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Example",
        url: "https://example.com",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 4,
          ratingCount: 10,
        },
      }),
    );
    expect(
      result.issues.some((i) =>
        i.message.includes("Ownership has not been established"),
      ),
    ).toBe(true);
    expect(result.issues.some((i) => i.message.includes("standalone"))).toBe(
      false,
    );
    expect(result.validJson).toBe(true);
  });
  it("observes body and case-insensitive Googlebot restrictions even when a permissive tag appears first", () => {
    const s = parseSnapshot(
      '<html><head><meta name="robots" content="index,follow"></head><body><h1>Private</h1><meta name="Googlebot" content="NOINDEX"><meta name="bingbot" content="unrelated"></body></html>',
      "https://example.com",
    );
    expect(s.robots).toContain("NOINDEX");
    expect(s.robots).not.toContain("unrelated");
    expect(s.findings.find((f) => f.id === "robots")?.detail).toContain(
      "intentional",
    );
  });
});
