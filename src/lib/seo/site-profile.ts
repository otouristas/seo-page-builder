import * as cheerio from "cheerio";
import { COUNTRIES, LANGUAGES } from "../locales";
import { safeIconUrl } from "../site-icons";
export type SiteProfile = {
  /** The page we actually read, after redirects. */
  url: string;
  /** Suggested project name. Always from the website, never invented. */
  name: string;
  description: string;
  logo: string | null;
  language: string;
  country: string;
  title: string;
  /** Which of the fields above the website actually declared. */
  found: ("name" | "description" | "logo" | "language" | "country")[];
};
/** ccTLDs that are sold as generic namespaces tell us nothing about a market. */
const GENERIC_CCTLDS = new Set([
  "io",
  "co",
  "ai",
  "tv",
  "me",
  "cc",
  "ly",
  "to",
  "gg",
  "fm",
  "am",
  "la",
  "ws",
  "sh",
  "st",
  "vc",
  "nu",
]);
const COUNTRY_CODES = new Set(COUNTRIES.map((c) => c.code));
const LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));
const clean = (value: string) => value.replace(/\s+/g, " ").trim();
function country(value: string) {
  const code = value.trim().toUpperCase();
  return COUNTRY_CODES.has(code) ? code : "";
}
function language(value: string) {
  const code = value.trim().toLowerCase().split(/[-_]/)[0];
  return LANGUAGE_CODES.has(code) ? code : "";
}
/** Collect every node of a JSON-LD graph so nested @graph entries are read. */
function flatten(node: unknown, out: Record<string, unknown>[] = []) {
  if (Array.isArray(node)) {
    for (const item of node) flatten(item, out);
    return out;
  }
  if (!node || typeof node !== "object") return out;
  const record = node as Record<string, unknown>;
  out.push(record);
  for (const key of ["@graph", "mainEntity", "publisher", "brand", "author"])
    if (record[key]) flatten(record[key], out);
  return out;
}
function schemaText(value: unknown): string {
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value)) return schemaText(value[0]);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return schemaText(record.name ?? record.url ?? record["@id"]);
  }
  return "";
}
function types(node: Record<string, unknown>) {
  const raw = node["@type"];
  return (Array.isArray(raw) ? raw : [raw])
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase());
}
/**
 * Turn a title such as "Home | Acme Bakery" into the brand a person would use
 * as a project name, preferring the segment that matches the domain.
 */
function nameFromTitle(title: string, hostname: string) {
  const parts = title
    .split(/\s[|•·—–-]\s|[|•·]/)
    .map(clean)
    .filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  const brand = hostname
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  const matching = parts.find(
    (part) => part.replace(/[^a-z0-9]/gi, "").toLowerCase() === brand,
  );
  if (matching) return matching;
  const last = parts.at(-1)!;
  return last.length <= parts[0].length ? last : parts[0];
}
/** A readable fallback name from the domain itself: "acme-bakery" → "Acme Bakery". */
export function nameFromHostname(hostname: string) {
  return hostname
    .replace(/^www\./, "")
    .split(".")[0]
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
export function parseSiteProfile(
  html: string,
  url: string,
  finalUrl = url,
): SiteProfile {
  const $ = cheerio.load(html);
  const attr = (selector: string, name = "content") =>
    clean($(selector).first().attr(name) || "");
  const meta = (name: string) =>
    attr(`meta[property="${name}"]`) || attr(`meta[name="${name}"]`);
  const nodes: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      flatten(JSON.parse($(element).text()), nodes);
    } catch {
      /* Invalid structured data is reported by the audit, not here. */
    }
  });
  const organization = nodes.find((node) =>
    types(node).some((type) =>
      /organization|localbusiness|store|restaurant|corporation|ngo|business/.test(
        type,
      ),
    ),
  );
  const site = nodes.find((node) => types(node).includes("website"));
  const hostname = (() => {
    try {
      return new URL(finalUrl).hostname;
    } catch {
      return "";
    }
  })();
  const title = clean($("title").first().text());
  const declaredName =
    meta("og:site_name") ||
    schemaText(organization?.name) ||
    schemaText(site?.name) ||
    attr('meta[name="application-name"]') ||
    attr('meta[name="apple-mobile-web-app-title"]');
  const name =
    declaredName ||
    nameFromTitle(title, hostname) ||
    nameFromHostname(hostname);
  const description =
    meta("description") ||
    meta("og:description") ||
    schemaText(organization?.description) ||
    schemaText(site?.description);
  const declaredLogo =
    schemaText(organization?.logo) ||
    attr('link[rel="apple-touch-icon"]', "href") ||
    attr('link[rel="apple-touch-icon-precomposed"]', "href") ||
    attr('link[rel~="icon"][type="image/svg+xml"]', "href") ||
    attr('link[rel~="icon"]', "href") ||
    attr('link[rel="shortcut icon"]', "href") ||
    attr('meta[name="msapplication-TileImage"]') ||
    meta("og:image");
  const logo =
    safeIconUrl(declaredLogo, finalUrl) ||
    safeIconUrl("/favicon.ico", finalUrl);
  const locale = meta("og:locale");
  const declaredLanguage = language(attr("html", "lang") || locale);
  const tld = hostname.split(".").at(-1)?.toLowerCase() || "";
  const declaredCountry =
    country(locale.split(/[-_]/)[1] || "") ||
    country(attr("html", "lang").split(/[-_]/)[1] || "");
  const guessedCountry =
    declaredCountry ||
    (GENERIC_CCTLDS.has(tld)
      ? ""
      : country(tld === "uk" ? "GB" : tld === "su" ? "RU" : tld));
  const found: SiteProfile["found"] = [];
  if (declaredName) found.push("name");
  if (description) found.push("description");
  if (safeIconUrl(declaredLogo, finalUrl)) found.push("logo");
  if (declaredLanguage) found.push("language");
  if (guessedCountry) found.push("country");
  return {
    url: finalUrl,
    name: name.slice(0, 80),
    description: description.slice(0, 2000),
    logo,
    language: declaredLanguage,
    country: guessedCountry,
    title,
    found,
  };
}
