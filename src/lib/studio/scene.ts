import type { PageSnapshot } from "../types";
import type { ResearchResult } from "../research";
export type StudioField = "title" | "description" | "h1" | "answer";
export type StudioEdits = Record<StudioField, string>;
export type StudioMove = {
  id: StudioField;
  title: string;
  why: string;
  observation: string;
  proposal: string;
  guide: string;
};
export function pageIdentity(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.hash = "";
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}${url.search}`;
  } catch {
    return null;
  }
}
export function hostName(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
export function queryTerms(query: string) {
  const stop = new Set([
    "a",
    "an",
    "the",
    "in",
    "on",
    "for",
    "of",
    "and",
    "to",
    "with",
  ]);
  return [
    ...new Set(
      query
        .normalize("NFKC")
        .toLocaleLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? [],
    ),
  ]
    .filter((t) => !stop.has(t))
    .slice(0, 16);
}
export function termCoverage(text: string, query: string) {
  const words = new Set(
    text
      .normalize("NFKC")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? [],
  );
  return queryTerms(query).filter((t) => words.has(t));
}
export function locatePage(
  serp: ResearchResult,
  page: Pick<PageSnapshot, "url" | "finalUrl" | "canonical">,
) {
  const identities = [
    pageIdentity(page.url),
    pageIdentity(page.finalUrl),
  ].filter(Boolean);
  const direct = serp.results?.find((r) =>
    identities.includes(pageIdentity(r.url)),
  );
  if (direct) return { listing: direct, match: "page" as const };
  const canonical = page.canonical && pageIdentity(page.canonical);
  const indirect =
    canonical && serp.results?.find((r) => pageIdentity(r.url) === canonical);
  return indirect ? { listing: indirect, match: "canonical" as const } : null;
}
export function sameSearch(a: ResearchResult, b: ResearchResult) {
  return (
    a.keyword.trim().toLocaleLowerCase() ===
      b.keyword.trim().toLocaleLowerCase() &&
    a.country === b.country &&
    a.language === b.language &&
    a.device === b.device &&
    a.mode === b.mode
  );
}
export function observedEdits(page: PageSnapshot): StudioEdits {
  return {
    title: page.title,
    description: page.description,
    h1: page.h1[0] ?? "",
    answer: "",
  };
}
export function proposeMoves(
  page: PageSnapshot,
  serp: ResearchResult,
  name: string,
): StudioMove[] {
  const query = serp.keyword.trim(),
    terms = queryTerms(query);
  const matched = termCoverage(page.title, query);
  const peers = (serp.results ?? []).filter(
    (r) => termCoverage(r.title, query).length > 0,
  ).length;
  const phrase = (query.charAt(0).toLocaleUpperCase() + query.slice(1)).replace(
    /\b(seo|aeo|geo)\b/gi,
    (term) => term.toUpperCase(),
  );
  const excerpt =
    page.description || page.text.slice(0, 200).replace(/\s+\S*$/, "");
  return [
    {
      id: "title",
      title:
        matched.length < terms.length
          ? "Make the topic visible"
          : "Sharpen your search invitation",
      why: "Help a searcher recognize what this page is about. Review the wording for accuracy; matching words alone does not explain rankings.",
      observation: `Your title includes ${matched.length} of ${terms.length} query terms. ${peers} of ${serp.results?.length ?? 0} returned titles include at least one.`,
      proposal: `${phrase} | ${name}`,
      guide: "titles-and-snippets",
    },
    {
      id: "description",
      title: page.description
        ? "Make the next click clearer"
        : "Give the page a description",
      why: "Describe the actual page and who it helps. Google may choose a different snippet from visible content.",
      observation: page.description
        ? `Fetched description: “${page.description}”`
        : "No meta description was present in the inspected HTML.",
      proposal: excerpt,
      guide: "titles-and-snippets",
    },
    {
      id: "h1",
      title: "Let the page keep the promise",
      why: "Connect the search invitation to the main heading visitors see when they arrive. Keep it natural and specific to this page.",
      observation: page.h1.length
        ? `Visible H1: “${page.h1[0]}”`
        : "No H1 was found in the inspected HTML.",
      proposal: phrase,
      guide: "search-intent-content-map",
    },
    {
      id: "answer",
      title: "Answer the next question",
      why: "Use a question from this search as a research prompt. Add an answer only when your own evidence supports it; inspect competitor pages before inferring their full coverage.",
      observation: serp.questions?.length
        ? `Google returned this related question: “${serp.questions[0]}”`
        : "No related questions were returned in this snapshot. Start with the question your page actually serves.",
      proposal: "",
      guide: "answer-ready-content",
    },
  ];
}
export function verifyEdits(
  before: PageSnapshot,
  current: PageSnapshot,
  edits: StudioEdits,
) {
  const original = observedEdits(before);
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const inspectedLater =
    new Date(current.fetchedAt).getTime() >
    new Date(before.fetchedAt).getTime();
  return (Object.keys(edits) as StudioField[])
    .filter((key) => edits[key] !== original[key])
    .map((key) => ({
      field: key,
      status: !inspectedLater
        ? "awaiting-recheck"
        : key === "answer"
          ? normalize(current.text).includes(normalize(edits[key])) &&
            !!edits[key].trim()
            ? "matched"
            : "not-found"
          : normalize(observedEdits(current)[key]) === normalize(edits[key])
            ? "matched"
            : "not-found",
    }));
}
export function sceneExport(
  page: PageSnapshot,
  serp: ResearchResult,
  edits: StudioEdits,
) {
  return `# Reviewed change proposal\n\nPage: ${page.finalUrl}\nQuery: ${serp.keyword}\nMarket: ${serp.country} / ${serp.language} / ${serp.device}\nSERP source: ${serp.source}\nSERP observed: ${serp.observedAt}\nPage inspected: ${page.fetchedAt}\n\n## Proposed title\n${edits.title}\n\n## Proposed description\n${edits.description}\n\n## Proposed H1\n${edits.h1}\n\n## Answer draft\n${edits.answer || "Not drafted. Add only supported facts."}\n\nReview every claim, publish through your website editor, then recheck the page. This export does not publish changes or predict a ranking. Competitor evidence is limited to returned search-result text.\n`;
}
