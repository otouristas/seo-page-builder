import { validateStructuredData } from "./schema";
import * as cheerio from "cheerio";
import type { AuditFinding, PageSnapshot } from "../types";
export function parseSnapshot(
  html: string,
  url: string,
  options: {
    finalUrl?: string;
    status?: number;
    robotsHeader?: string;
    source?: "fetched" | "rendered";
    truncated?: boolean;
    market?: string;
    fetchedAt?: string;
  } = {},
): PageSnapshot {
  const $ = cheerio.load(html);
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  const text = (selector: string) => clean($(selector).first().text());
  const attr = (selector: string, name: string) =>
    $(selector).first().attr(name) || "";
  const finalUrl = options.finalUrl || url;
  const schema: unknown[] = [];
  let invalidSchema = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      schema.push(JSON.parse($(el).text()));
    } catch {
      invalidSchema++;
    }
  });
  const links: { url: string; text: string }[] = [];
  $("a[href]").each((_, el) => {
    try {
      const href = new URL($(el).attr("href")!, finalUrl);
      if (["http:", "https:"].includes(href.protocol))
        links.push({ url: href.href, text: clean($(el).text()) });
    } catch {}
  });
  const images: { alt: string | null; decorative: boolean }[] = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    images.push({
      alt: alt ?? null,
      decorative:
        alt === "" ||
        $(el).attr("role") === "presentation" ||
        $(el).attr("aria-hidden") === "true",
    });
  });
  let canonical: string | null = null;
  try {
    const href = attr('link[rel="canonical"]', "href");
    if (href) canonical = new URL(href, finalUrl).href;
  } catch {}
  const headings = $("h1,h2,h3")
    .map((_, e) => clean($(e).text()))
    .get()
    .filter(Boolean);
  const h1 = $("h1")
    .map((_, e) => clean($(e).text()))
    .get()
    .filter(Boolean);
  const title = text("title");
  const description = attr('meta[name="description"]', "content");
  const lang = attr("html", "lang");
  const author =
    attr('meta[name="author"]', "content") ||
    text('[rel="author"], [itemprop="author"]') ||
    null;
  const robots = [
    attr('meta[name="robots"]', "content"),
    options.robotsHeader || "",
  ]
    .filter(Boolean)
    .join(";");
  const viewport = !!attr('meta[name="viewport"]', "content");
  $("script,style,nav,header,footer,aside,noscript,svg,template").remove();
  const main = $('main,article,[role="main"]').first();
  const bodyText = clean(main.length ? main.text() : $("body").text());
  const s: PageSnapshot = {
    url,
    finalUrl,
    title,
    description,
    h1,
    headings,
    canonical,
    robots,
    lang,
    words: bodyText ? bodyText.split(/\s+/).length : 0,
    links: links.slice(0, 1000),
    images,
    schema,
    invalidSchema,
    text: bodyText.slice(0, 40_000),
    htmlSource: options.source || "fetched",
    status: options.status ?? 200,
    fetchedAt: options.fetchedAt || new Date().toISOString(),
    truncated: !!options.truncated,
    author,
    findings: [],
  };
  const add = (
    id: string,
    title: string,
    category: AuditFinding["category"],
    status: AuditFinding["status"],
    severity: AuditFinding["severity"],
    detail: string,
    recommendation: string,
    effort: AuditFinding["effort"] = "small",
    inferred = false,
  ) =>
    s.findings.push({
      id,
      title,
      category,
      status,
      severity,
      detail,
      recommendation,
      effort,
      evidence: {
        source:
          s.htmlSource === "rendered"
            ? "Firecrawl rendered HTML"
            : "Public HTML response",
        observedAt: s.fetchedAt,
        market: options.market || "US",
        status: inferred ? "inferred" : "measured",
        url: finalUrl,
        detail,
      },
    });
  add(
    "http",
    "HTTP response",
    "technical",
    s.status >= 200 && s.status < 300
      ? "pass"
      : s.status === 0
        ? "unknown"
        : "fail",
    "critical",
    s.status
      ? `The page returned HTTP ${s.status}.`
      : "HTTP status was not included by the provider.",
    "Check the live response and fix unexpected HTTP errors.",
  );
  add(
    "title",
    "A descriptive page title",
    "on-page",
    title ? "pass" : "fail",
    "high",
    title ? `Observed title: ${title}` : "No page title was found.",
    "Describe the page’s purpose in a specific title. Length is a preview consideration, not a ranking rule.",
  );
  add(
    "description",
    "A useful search description",
    "on-page",
    description ? "pass" : "warning",
    "medium",
    description
      ? `${description.length} characters: ${description}`
      : "No meta description was found.",
    "Write an accurate summary that gives people a reason to visit. Search engines may choose a different snippet.",
  );
  add(
    "headings",
    "Clear page structure",
    "content",
    h1.length ? "pass" : "warning",
    "medium",
    `${h1.length} H1 headings and ${headings.length} H1–H3 headings were observed.`,
    "Give the page a clear main heading and organize sections logically. Multiple H1s are not automatically an SEO failure.",
  );
  add(
    "canonical",
    "Preferred page URL",
    "technical",
    canonical ? "pass" : "warning",
    "medium",
    canonical
      ? `Preferred URL: ${canonical}${canonical !== finalUrl ? " (points to another URL; may be intentional)" : ""}`
      : "No canonical link was observed.",
    "Confirm the preferred URL before changing canonicals. An alternate canonical can be intentional.",
  );
  const noindex = /\bnoindex\b/i.test(robots);
  add(
    "robots",
    "Search indexing preference",
    "technical",
    noindex ? "warning" : "pass",
    "high",
    noindex
      ? "A noindex directive is present. This may be intentional."
      : "No noindex directive was found in the available evidence. This does not confirm indexability or indexing.",
    "Keep noindex for pages meant to be private or excluded. Only remove it when this page should appear in search.",
  );
  add(
    "viewport",
    "Responsive viewport",
    "technical",
    viewport ? "pass" : "warning",
    "medium",
    viewport
      ? "A mobile viewport was found."
      : "No viewport meta tag was found.",
    "Check the mobile layout and declare an appropriate viewport.",
  );
  const missing = images.filter((i) => i.alt === null && !i.decorative).length;
  add(
    "alt",
    "Image alternatives",
    "content",
    missing ? "warning" : "pass",
    "medium",
    `${missing} of ${images.length} images lack an alt attribute. Empty alt attributes are treated as decorative.`,
    "Describe meaningful images and use empty alt text for decorative images. Review image purpose before editing.",
  );
  add(
    "schema",
    "Readable structured data",
    "technical",
    invalidSchema ? "fail" : schema.length ? "pass" : "not-applicable",
    "medium",
    `${schema.length} valid JSON-LD blocks; ${invalidSchema} malformed blocks. Syntax validation does not confirm rich-result eligibility or factual accuracy.`,
    "Use a relevant schema type only when it matches visible page content. Review required fields and test eligible markup.",
  );
  if (schema.length) {
    const alignment = validateStructuredData(JSON.stringify(schema), bodyText);
    const needsReview = alignment.issues.filter((i) => i.level === "review");
    add(
      "schema-alignment",
      "Structured data matches the page",
      "answer-readiness",
      needsReview.length ? "warning" : "unknown",
      "medium",
      needsReview.length
        ? `${needsReview.length} markup checks need review: ${needsReview
            .slice(0, 3)
            .map((i) => i.message)
            .join(" ")}`
        : "Selected markup fields match extracted text, but type relevance and rich-result eligibility still require review.",
      "Confirm the schema type is relevant and every factual claim is visible and supported. This is a selected-field check, not complete Schema.org validation.",
      "medium",
      true,
    );
  }
  add(
    "readable",
    "Readable content",
    "content",
    bodyText.length > 50 ? "pass" : s.truncated ? "unknown" : "warning",
    "high",
    `${s.words} words extracted from the available main content.`,
    "Answer the visitor’s actual question. There is no universal minimum word count; short product and contact pages can be appropriate.",
    "medium",
  );
  const internal = links.filter(
    (l) => new URL(l.url).hostname === new URL(finalUrl).hostname,
  );
  add(
    "links",
    "Connected, useful pages",
    "content",
    internal.length ? "pass" : "warning",
    "medium",
    `${internal.length} internal links were observed in this page.`,
    "Link where it helps visitors. Site-wide crawl evidence is needed to identify orphan pages; no fixed link quota applies.",
  );
  add(
    "language",
    "Declared content language",
    "technical",
    lang ? "pass" : "warning",
    "low",
    lang ? `The page declares ${lang}.` : "No document language was declared.",
    "Declare the actual language of the page for accessibility. A country selection should not change the language of genuine content.",
  );
  add(
    "authorship",
    "Identifiable authorship",
    "answer-readiness",
    author ? "pass" : "unknown",
    "low",
    author
      ? `Author found: ${author}`
      : "Authorship could not be confirmed from the extracted metadata.",
    "For advice or editorial content, identify the responsible author and relevant experience. This may not apply to every page.",
    "small",
    !author,
  );
  add(
    "answer",
    "Answer clarity review",
    "answer-readiness",
    "unknown",
    "medium",
    "Answer quality requires a contextual review; heading counts alone cannot establish it.",
    "Use Content Studio to review whether this page directly answers its intended questions and supports factual claims.",
    "medium",
    true,
  );
  if (s.truncated)
    add(
      "coverage",
      "Partial page evidence",
      "technical",
      "unknown",
      "medium",
      "The response exceeded the extraction size limit. Some content was not inspected.",
      "Review the missing content before drawing conclusions.",
    );
  return s;
}
export function actionableFindings(snapshot: PageSnapshot) {
  const weight = { critical: 4, high: 3, medium: 2, low: 1 };
  return snapshot.findings
    .filter((f) => f.status === "fail" || f.status === "warning")
    .sort((a, b) => weight[b.severity] - weight[a.severity]);
}
export function compareSnapshots(before: PageSnapshot, after: PageSnapshot) {
  const changes = (
    ["title", "description", "canonical", "robots", "text"] as const
  ).filter((k) => before[k] !== after[k]);
  const resolved = before.findings
    .filter(
      (f) =>
        ["fail", "warning"].includes(f.status) &&
        after.findings.some((n) => n.id === f.id && n.status === "pass"),
    )
    .map((f) => f.id);
  return {
    changes,
    resolved,
    observedAt: after.fetchedAt,
    note: "A detected page change is not proof of a ranking or traffic effect.",
  };
}
