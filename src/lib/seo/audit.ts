import type { Market, SeoSnapshot } from "./types";
import { hreflangCoversMarket, langMatchesMarket, languageOf } from "./markets";
import { urlsMatch } from "../utils";

export type AuditGroup = "on-page" | "content" | "technical";

export type AuditCheck = {
  id: string;
  label: string;
  detail: string;
  /** How to fix it, shown when the check fails. */
  fix: string;
  pass: boolean;
  weight: number;
  group: AuditGroup;
};

export function buildAudit(s: SeoSnapshot, market: Market = "us"): AuditCheck[] {
  const altRatio = s.imagesTotal ? s.imagesWithAlt / s.imagesTotal : 1;
  const mainWords = s.wordCountMain || s.wordCount;
  const canonicalOk = Boolean(s.canonical) && urlsMatch(s.canonical!, s.finalUrl || s.url);
  const robotsText = [s.robots, s.xRobots].filter(Boolean).join("; ");
  const indexable = !robotsText || !/noindex/i.test(robotsText);
  const langState = langMatchesMarket(s.lang, market);
  const langPass = langState !== "mismatch";
  const hreflangOk = hreflangCoversMarket(s.hreflang ?? [], market);
  const wantLang = languageOf(market);

  return [
    {
      id: "title",
      label: "Title is 15–60 characters",
      detail: s.title ? `${s.titleChars} chars · ${s.title}` : "No <title> found",
      fix: "Write one title of 50–60 characters. Lead with the primary keyword, end with the brand.",
      pass: s.titleChars >= 15 && s.titleChars <= 60,
      weight: 12,
      group: "on-page",
    },
    {
      id: "meta",
      label: "Meta description is 70–160 characters",
      detail: s.metaDescription ? `${s.descriptionChars} chars` : "No meta description",
      fix: "Add a 120–155 character description that states the outcome and includes the keyword once.",
      pass: s.descriptionChars >= 70 && s.descriptionChars <= 160,
      weight: 10,
      group: "on-page",
    },
    {
      id: "h1",
      label: "Exactly one H1",
      detail: s.h1.length ? s.h1.join(" · ") : "No H1 on the page",
      fix: "Keep a single H1 that mirrors the title's promise. Demote extra H1s to H2.",
      pass: s.h1.length === 1,
      weight: 10,
      group: "on-page",
    },
    {
      id: "words",
      label: "Main content depth (600+ words)",
      detail: `${mainWords} words in main content` + (s.wordCount && s.wordCount !== mainWords ? ` (${s.wordCount} including chrome)` : ""),
      fix: "Add sections that answer the questions people ask about this topic. Aim for 900+ useful words outside nav and footer.",
      pass: mainWords >= 600,
      weight: 12,
      group: "content",
    },
    {
      id: "canonical",
      label: "Canonical matches this URL",
      detail: s.canonical ? (canonicalOk ? s.canonical : `Points elsewhere: ${s.canonical}`) : "Missing",
      fix: "Add <link rel=\"canonical\"> pointing at this page's preferred URL, not a duplicate or parameter variant.",
      pass: canonicalOk,
      weight: 8,
      group: "technical",
    },
    {
      id: "viewport",
      label: "Mobile viewport",
      detail: s.hasViewport ? "Set" : "No meta viewport",
      fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
      pass: s.hasViewport,
      weight: 6,
      group: "technical",
    },
    {
      id: "og",
      label: "Open Graph title + description",
      detail: s.ogTitle || s.ogDescription ? `${s.ogTitle ?? "—"}` : "No og:title / og:description",
      fix: "Add og:title, og:description and a 1200×630 og:image so shares carry a rich preview.",
      pass: Boolean(s.ogTitle && s.ogDescription),
      weight: 6,
      group: "on-page",
    },
    {
      id: "schema",
      label: "JSON-LD structured data",
      detail: s.schemaTypes.length ? s.schemaTypes.join(", ") : "No structured data",
      fix: "Add JSON-LD for the page type (Article, Product, FAQPage or Organization) and validate it.",
      pass: s.schemaTypes.length > 0,
      weight: 8,
      group: "technical",
    },
    {
      id: "alt",
      label: "Alt text on images",
      detail: `${s.imagesWithAlt}/${s.imagesTotal} images have alt`,
      fix: "Describe every meaningful image in its alt attribute; leave decorative ones with alt=\"\".",
      pass: altRatio >= 0.7,
      weight: 6,
      group: "content",
    },
    {
      id: "internal",
      label: "Internal linking (5+)",
      detail: `${s.linksInternal} internal · ${s.linksExternal} external`,
      fix: "Link to and from at least 5 related pages using descriptive anchors.",
      pass: s.linksInternal >= 5,
      weight: 8,
      group: "content",
    },
    {
      id: "robots",
      label: "Indexable (no noindex)",
      detail: robotsText || "Not set (indexable)",
      fix: "Remove noindex from the robots meta tag or the X-Robots-Tag header.",
      pass: indexable,
      weight: 10,
      group: "technical",
    },
    {
      id: "lang",
      label: "html lang matches market",
      detail:
        langState === "match"
          ? `${s.lang} matches ${market.toUpperCase()} (${wantLang})`
          : langState === "missing"
            ? `Not set · ${market.toUpperCase()} expects ${wantLang}`
            : `${s.lang} vs ${market.toUpperCase()} (${wantLang})`,
      fix: `Set <html lang="${wantLang}"> (or a regional tag like ${wantLang}-*) so the selected market and the page language agree.`,
      pass: langPass,
      weight: 5,
      group: "technical",
    },
    {
      id: "hreflang",
      label: "Hreflang covers this market",
      detail: s.hreflang?.length ? s.hreflang.slice(0, 8).join(", ") : "None (single-locale page)",
      fix: `Add <link rel="alternate" hreflang="${wantLang}"> (or x-default) if this URL is part of a language cluster.`,
      pass: hreflangOk,
      weight: 4,
      group: "technical",
    },
    {
      id: "live",
      label: "Live HTML fetched",
      detail:
        s.source === "live" ? "Page read in full" : s.source === "partial" ? "Partial read (size cap)" : "Demo scene",
      fix: "Make sure the URL is public and returns HTML within 8 seconds.",
      pass: s.source === "live",
      weight: 4,
      group: "technical",
    },
  ];
}

export function auditScore(checks: AuditCheck[]): number {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  return total ? Math.round((got / total) * 100) : 0;
}

export function groupScore(checks: AuditCheck[], group: AuditGroup): number {
  return auditScore(checks.filter((c) => c.group === group));
}
