import type { Effort, Play, PlayPillar, SearchIntent, SeoSnapshot, SerpResult } from "./types";
import type { AuditCheck } from "./audit";

export type PlayInput = {
  nicheId: string;
  keyword: string;
  intent: SearchIntent;
  snapshot: SeoSnapshot;
  audit: AuditCheck[];
  results: SerpResult[];
};

const SCHEMA_PLAY: Record<SearchIntent, [string, string]> = {
  informational: ["Add Article + FAQPage JSON-LD", "Mark the article up and attach the FAQ questions so rich results and AI answers can cite you."],
  commercial: ["Add ItemList + Review JSON-LD", "Structured picks with ratings give Google the list shape it shows for 'best' queries."],
  transactional: ["Add Product + Offer JSON-LD", "Price, currency and availability markup unlock rich results and price snippets."],
  navigational: ["Add Organization + WebSite JSON-LD", "Entity markup with sameAs links secures the brand panel and sitelinks search box."],
};

export function buildPlays(input: PlayInput): Play[] {
  const { nicheId, keyword: kw, intent, snapshot: s, audit, results } = input;
  const failed = new Set(audit.filter((c) => !c.pass).map((c) => c.id));
  const comps = results.filter((r) => r.kind === "organic" && !r.isYou).slice(0, 3).map((r) => r.domain);
  const paa = results.find((r) => r.kind === "paa")?.questions ?? [];
  const plays: Play[] = [];
  const add = (key: string, title: string, detail: string, impact: number, pillar: PlayPillar, effort: Effort) =>
    plays.push({ id: `${nicheId}-${key}`, title, detail, impact, pillar, effort, quickWin: effort === "low" && impact >= 0.4 });

  if (failed.has("robots")) {
    add("robots", "Remove the noindex directive", "The page is blocked from Google's index. Nothing else moves until this is fixed.", 1, "technical", "low");
  }
  if (failed.has("title")) {
    add("title", `Rewrite the title around "${kw}"`, `Lead with "${kw}", keep it 50–60 characters and end with the brand. Current title is ${s.titleChars} characters.`, 0.75, "on-page", "low");
  } else if (!s.title.toLowerCase().includes(kw)) {
    add("title-kw", `Move "${kw}" to the front of the title`, "The length is fine but the phrase is missing. Titles that open with the query win more clicks and relevance.", 0.55, "on-page", "low");
  }
  if (failed.has("meta")) {
    add("meta", "Write a meta description that earns the click", `120–155 characters, one clear outcome, "${kw}" once. Current description is ${s.descriptionChars} characters.`, 0.4, "on-page", "low");
  }
  if (failed.has("h1")) {
    add("h1", "Fix the H1", s.h1.length === 0 ? `Add a single H1 that names "${kw}" and the promise of the page.` : `Keep one H1 and demote the other ${s.h1.length - 1} to H2.`, 0.5, "on-page", "low");
  }
  if (failed.has("words")) {
    add("depth", paa[0] ? `Add a section that answers "${paa[0]}"` : "Add 400–600 words of useful depth", `The page has ${s.wordCount} words while page-one competitors run long. Split new content into H2s that mirror the questions people ask.`, 0.7, "content", "mid");
  }
  if (failed.has("internal")) {
    add("internal", "Add 5 internal links with descriptive anchors", `Link from your strongest pages using "${kw}" and close variants as anchor text. ${s.linksInternal} internal links today.`, 0.6, "content", "low");
  }
  if (failed.has("alt")) {
    add("alt", "Describe images in alt text", `${Math.max(0, s.imagesTotal - s.imagesWithAlt)} of ${s.imagesTotal} images have no alt. Describe them; mention "${kw}" only where accurate.`, 0.25, "content", "low");
  }
  if (failed.has("schema")) {
    const [title, detail] = SCHEMA_PLAY[intent];
    add("schema", title, detail, 0.5, "technical", "mid");
  }
  if (failed.has("canonical")) {
    add("canonical", "Set the canonical URL", "Point rel=canonical at the preferred URL so duplicates and parameters don't split signals.", 0.35, "technical", "low");
  }
  if (failed.has("viewport")) {
    add("viewport", "Add the mobile viewport meta tag", "Mobile-first indexing reads the mobile layout. Without a viewport the page fails basic mobile usability.", 0.45, "technical", "low");
  }
  if (failed.has("og")) {
    add("og", "Add Open Graph title, description and image", "Shares on social and chat apps get a rich card, which feeds referral traffic and links.", 0.2, "on-page", "low");
  }

  switch (intent) {
    case "informational":
      add("faq", "Answer the People-also-ask questions on the page", "Add an FAQ block with the four questions above, 40–60 words each, then mark it up with FAQPage schema.", 0.65, "intent", "mid");
      add("summary", "Open with a 50-word definition", "Give the AI Overview and featured snippet a quotable summary directly under the H1.", 0.5, "content", "low");
      break;
    case "commercial":
      add("compare", `Add a comparison table vs ${comps.slice(0, 2).join(" and ") || "the top competitors"}`, "Searchers are comparing. A table with price, best-for and rating keeps them on your page and matches the listicle shape of the SERP.", 0.75, "intent", "mid");
      add("verdict", "Add 'best for' verdicts and transparent pricing", "Commercial SERPs reward decisive recommendations. State who each option suits and what it costs.", 0.5, "content", "low");
      break;
    case "transactional":
      add("offer", "Show price, availability and delivery above the fold", "Buyers scan for the number first. Put price, stock status and delivery time next to the CTA.", 0.7, "intent", "mid");
      add("trust", "Add trust signals next to the CTA", "Returns policy, review count, secure checkout badges and delivery times reduce hesitation.", 0.45, "intent", "low");
      break;
    case "navigational":
      add("sitelinks", "Claim sitelinks with a clear navigation", "Consistent nav labels, descriptive titles on key pages and Organization schema let Google show sitelinks under your result.", 0.4, "technical", "low");
      break;
  }

  add("links", `Earn 3 links from pages like ${comps[0] ?? "your competitors"}`, `Publish a data piece, calculator or original study competitors want to cite, then pitch ${comps.join(", ") || "relevant sites"}.`, 0.9, "authority", "high");
  add("refresh", "Refresh the page and re-promote it", "Update dates, stats and screenshots, then share it with the sites that already link to your competitors.", 0.35, "authority", "mid");

  const effortRank: Record<Effort, number> = { low: 0, mid: 1, high: 2 };
  return plays
    .sort((a, b) => {
      if (Boolean(b.quickWin) !== Boolean(a.quickWin)) return b.quickWin ? 1 : -1;
      if (b.impact !== a.impact) return b.impact - a.impact;
      return effortRank[a.effort] - effortRank[b.effort];
    })
    .slice(0, 10);
}
