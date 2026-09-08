import type { LangPack, Market, MarketRegion } from "./types";

export type MarketInfo = {
  id: Market;
  label: string;
  short: string;
  region: MarketRegion;
  languagePack: LangPack;
  /** DataForSEO location code. */
  locationCode: number;
  /** DataForSEO language code. */
  languageCode: string;
  googleHost: string;
};

export const MARKETS: Record<Market, MarketInfo> = {
  us: { id: "us", label: "United States", short: "US", region: "americas", languagePack: "en", locationCode: 2840, languageCode: "en", googleHost: "google.com" },
  uk: { id: "uk", label: "United Kingdom", short: "UK", region: "europe", languagePack: "en", locationCode: 2826, languageCode: "en", googleHost: "google.co.uk" },
  ca: { id: "ca", label: "Canada", short: "CA", region: "americas", languagePack: "en", locationCode: 2124, languageCode: "en", googleHost: "google.ca" },
  au: { id: "au", label: "Australia", short: "AU", region: "apac", languagePack: "en", locationCode: 2036, languageCode: "en", googleHost: "google.com.au" },
  in: { id: "in", label: "India", short: "IN", region: "apac", languagePack: "en", locationCode: 2256, languageCode: "en", googleHost: "google.co.in" },
  de: { id: "de", label: "Germany", short: "DE", region: "europe", languagePack: "de", locationCode: 2276, languageCode: "de", googleHost: "google.de" },
  fr: { id: "fr", label: "France", short: "FR", region: "europe", languagePack: "fr", locationCode: 2250, languageCode: "fr", googleHost: "google.fr" },
  es: { id: "es", label: "Spain", short: "ES", region: "europe", languagePack: "es", locationCode: 2724, languageCode: "es", googleHost: "google.es" },
  it: { id: "it", label: "Italy", short: "IT", region: "europe", languagePack: "it", locationCode: 2380, languageCode: "it", googleHost: "google.it" },
  nl: { id: "nl", label: "Netherlands", short: "NL", region: "europe", languagePack: "nl", locationCode: 2528, languageCode: "nl", googleHost: "google.nl" },
  gr: { id: "gr", label: "Greece", short: "GR", region: "europe", languagePack: "el", locationCode: 2356, languageCode: "el", googleHost: "google.gr" },
  br: { id: "br", label: "Brazil", short: "BR", region: "americas", languagePack: "pt", locationCode: 2076, languageCode: "pt", googleHost: "google.com.br" },
  mx: { id: "mx", label: "Mexico", short: "MX", region: "americas", languagePack: "es", locationCode: 2484, languageCode: "es", googleHost: "google.com.mx" },
  ae: { id: "ae", label: "United Arab Emirates", short: "AE", region: "apac", languagePack: "en", locationCode: 2784, languageCode: "en", googleHost: "google.ae" },
};

export const MARKET_IDS: Market[] = [
  "us",
  "uk",
  "ca",
  "au",
  "in",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "gr",
  "br",
  "mx",
  "ae",
];

export const MARKET_REGIONS: { id: MarketRegion; label: string }[] = [
  { id: "americas", label: "Americas" },
  { id: "europe", label: "Europe" },
  { id: "apac", label: "APAC & MEA" },
];

export function isMarket(value: unknown): value is Market {
  return typeof value === "string" && value in MARKETS;
}

export function languageOf(market: Market): LangPack {
  return MARKETS[market].languagePack;
}

const REGION_TO_MARKET: Record<string, Market> = {
  gb: "uk",
  uk: "uk",
  au: "au",
  ca: "ca",
  in: "in",
  br: "br",
  mx: "mx",
  ae: "ae",
  gr: "gr",
  us: "us",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
};

const LANG_TO_MARKET: Record<string, Market> = {
  el: "gr",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  pt: "br",
  en: "us",
};

/** Map BCP-47 tags (navigator.languages) to a catalog market. Default US. */
export function inferMarket(locales: readonly string[]): Market {
  for (const raw of locales) {
    const tag = raw.toLowerCase().replace(/_/g, "-");
    const [lang, region] = tag.split("-");
    if (region && REGION_TO_MARKET[region]) return REGION_TO_MARKET[region]!;
    if (lang && LANG_TO_MARKET[lang] && lang !== "en") return LANG_TO_MARKET[lang]!;
  }
  return "us";
}

const LANG_PREFIX: Record<LangPack, string[]> = {
  en: ["en"],
  de: ["de"],
  fr: ["fr"],
  es: ["es"],
  it: ["it"],
  nl: ["nl"],
  el: ["el", "gr"],
  pt: ["pt"],
};

export function langMatchesMarket(lang: string | null, market: Market): "match" | "missing" | "mismatch" {
  if (!lang?.trim()) return "missing";
  const code = lang.toLowerCase().split(/[-_]/)[0] ?? "";
  const want = languageOf(market);
  return LANG_PREFIX[want].includes(code) ? "match" : "mismatch";
}

export function hreflangCoversMarket(tags: string[], market: Market): boolean {
  if (!tags.length) return true;
  const want = languageOf(market);
  const prefixes = LANG_PREFIX[want];
  return tags.some((raw) => {
    const t = raw.toLowerCase();
    if (t === "x-default") return true;
    const code = t.split(/[-_]/)[0] ?? "";
    return prefixes.includes(code) || t.startsWith(`${want}-`);
  });
}
