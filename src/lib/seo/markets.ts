import type { Market } from "./types";

export type MarketInfo = {
  id: Market;
  label: string;
  short: string;
  /** DataForSEO location code. */
  locationCode: number;
  /** DataForSEO language code. */
  languageCode: string;
  googleHost: string;
};

export const MARKETS: Record<Market, MarketInfo> = {
  gr: { id: "gr", label: "Greece", short: "GR", locationCode: 2356, languageCode: "el", googleHost: "google.gr" },
  us: { id: "us", label: "United States", short: "US", locationCode: 2840, languageCode: "en", googleHost: "google.com" },
};

export const MARKET_IDS: Market[] = ["gr", "us"];

export function isMarket(value: unknown): value is Market {
  return value === "gr" || value === "us";
}
