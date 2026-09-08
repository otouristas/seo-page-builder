import type { Market, SearchIntent, SeoSnapshot } from "./types";
import { langMatchesMarket } from "./markets";
import { tokenCoverage } from "./locale";
import { clamp } from "../utils";

const SCHEMA_FOR_INTENT: Record<SearchIntent, string[]> = {
  informational: ["faqpage", "article", "blogposting", "howto"],
  commercial: ["itemlist", "review", "product", "aggregateoffering"],
  transactional: ["product", "offer", "offerCatalog"],
  navigational: ["organization", "website", "webpage"],
};

export type RelevanceResult = { score: number; notes: string[] };

function credit(coverage: number, weight: number): number {
  if (coverage >= 0.99) return weight;
  if (coverage <= 0) return 0;
  return Math.round(weight * coverage);
}

export function scoreRelevance(
  keyword: string,
  snapshot: SeoSnapshot,
  intent: SearchIntent,
  market: Market,
): RelevanceResult {
  const notes: string[] = [];
  let got = 0;

  const titleC = tokenCoverage(keyword, snapshot.title);
  const t = credit(titleC, 28);
  got += t;
  notes.push(titleC >= 0.99 ? "Keyword in title" : titleC > 0 ? `Partial keyword in title (${Math.round(titleC * 100)}%)` : "Keyword missing from title");

  const h1C = Math.max(0, ...snapshot.h1.map((h) => tokenCoverage(keyword, h)), snapshot.h1.length ? 0 : 0);
  const h1 = credit(h1C, 22);
  got += h1;
  notes.push(h1C >= 0.99 ? "Keyword in H1" : h1C > 0 ? "Partial keyword in H1" : "Keyword missing from H1");

  const h2C = snapshot.h2.length ? Math.max(0, ...snapshot.h2.map((h) => tokenCoverage(keyword, h))) : 0;
  const h2 = credit(h2C, 16);
  got += h2;
  notes.push(h2C > 0 ? "Keyword in an H2" : "No H2 carries the keyword");

  const exC = tokenCoverage(keyword, snapshot.excerpt || snapshot.metaDescription);
  const ex = credit(exC, 14);
  got += ex;
  notes.push(exC > 0 ? "Keyword in the opening" : "Keyword missing from the opening excerpt");

  const types = snapshot.schemaTypes.map((s) => s.toLowerCase());
  const want = SCHEMA_FOR_INTENT[intent];
  const schemaHit = types.some((t) => want.some((w) => t.includes(w.toLowerCase())));
  const schema = schemaHit ? 12 : 0;
  got += schema;
  notes.push(schemaHit ? `Schema matches ${intent} intent` : `No ${intent}-shaped schema`);

  const lang = langMatchesMarket(snapshot.lang, market);
  const langPts = lang === "match" ? 8 : lang === "missing" ? 4 : 0;
  got += langPts;
  notes.push(lang === "match" ? "html lang matches market" : lang === "missing" ? "html lang not set" : "html lang does not match market");

  return { score: clamp(got, 0, 100), notes };
}
