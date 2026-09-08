import { describe, it, expect } from "vitest";
import { COLLECTIONS, SOURCES } from "@/lib/learning/content";
import { articleMarkdown, markdownResponse } from "@/lib/learning/exports";
import { selectGuidance, KNOWLEDGE_VERSION } from "@/lib/learning/retrieval";
import { publicPages } from "@/lib/public-pages";
import { GET as llms } from "@/app/llms.txt/route";
import { GET as feed } from "@/app/feed.xml/route";
import { parseSnapshot } from "@/lib/seo/audit";
import { load } from "cheerio";
describe("Public knowledge and machine-readable resources", () => {
  it("keeps public discovery unique and excludes account/report data", () => {
    const pages = publicPages();
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    expect(
      pages.some((p) => /^\/(app|api|login|share|demo)(\/|$)/.test(p.path)),
    ).toBe(false);
    for (const articles of Object.values(COLLECTIONS))
      for (const a of articles) {
        for (const s of a.sections)
          for (const id of s.sourceIds ?? [])
            expect(SOURCES[id], id).toBeDefined();
        for (const path of a.related.filter((p) => !p.endsWith(".txt")))
          expect(
            pages.some((p) => p.path === path),
            path,
          ).toBe(true);
      }
  });
  it("serves equivalent editorial text and a distinct downloadable checklist", async () => {
    const a = COLLECTIONS.learn[0],
      md = articleMarkdown(a, "learn");
    for (const section of a.sections)
      for (const paragraph of section.paragraphs)
        expect(md).toContain(paragraph);
    const checklist = markdownResponse("learn", a.slug, true);
    expect(checklist.headers.get("content-disposition")).toContain(
      "attachment",
    );
    const text = await checklist.text();
    expect(text).toContain(a.checklist[0]);
    expect(text).not.toContain(a.sections[0].paragraphs[0]);
    expect(markdownResponse("learn", "not-a-guide").status).toBe(404);
  });
  it("links llms.txt to public Markdown and publishes a parseable RSS feed", async () => {
    const index = await llms().text();
    expect(index).toContain("# RankSushi");
    expect(index).toContain("/learn/technical-triage/index.md");
    expect(index).not.toContain("/app/");
    const rss = load(await feed().text(), { xml: true });
    expect(rss("item")).toHaveLength(COLLECTIONS.blog.length);
    expect(rss("item guid").first().text()).toContain(
      "https://ranksushi.com/blog/",
    );
  });
  it("selects bounded versioned editorial guidance without replacing page evidence", () => {
    const snapshot = parseSnapshot(
      "<html><head><title>Test</title></head><body><h1>Test</h1></body></html>",
      "https://example.com",
    );
    const guidance = selectGuidance("metadata", "A useful title", [snapshot]);
    expect(guidance[0].slug).toBe("titles-and-snippets");
    expect(guidance.length).toBeLessThanOrEqual(3);
    expect(guidance.every((g) => g.version === KNOWLEDGE_VERSION)).toBe(true);
    expect(guidance.some((g) => g.url === snapshot.finalUrl)).toBe(false);
  });
});
