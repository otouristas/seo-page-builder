import { GUIDES, articleSources } from "./content";
import type { DraftKind, PageSnapshot } from "../types";
export const KNOWLEDGE_VERSION = "2026-09-09.1";
export type GuidanceReference = {
  slug: string;
  title: string;
  url: string;
  version: string;
};
const preferred: Record<DraftKind, string> = {
  brief: "search-intent-content-map",
  metadata: "titles-and-snippets",
  content: "search-intent-content-map",
  "internal-links": "internal-linking",
  schema: "answer-ready-content",
  coach: "technical-triage",
};
export function selectGuidance(
  kind: DraftKind,
  prompt: string,
  snapshots: Pick<PageSnapshot, "findings">[],
) {
  const terms = [
    kind,
    prompt,
    ...snapshots
      .slice(0, 5)
      .flatMap((s) =>
        s.findings
          .filter((f) => ["fail", "warning"].includes(f.status))
          .map((f) => f.id + " " + f.title),
      ),
  ]
    .join(" ")
    .toLowerCase();
  return GUIDES.map((guide) => ({
    guide,
    score:
      (guide.slug === preferred[kind] ? 100 : 0) +
      guide.tags.reduce(
        (score, tag) => score + (terms.includes(tag) ? 1 : 0),
        0,
      ),
  }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .slice(0, 3)
    .map(({ guide }) => ({
      slug: guide.slug,
      title: guide.title,
      url: `https://ranksushi.com/learn/${guide.slug}`,
      version: KNOWLEDGE_VERSION,
      summary: guide.summary,
      checklist: guide.checklist,
      sources: articleSources(guide),
    }));
}
