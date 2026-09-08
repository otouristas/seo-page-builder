import type { Market, SeoSnapshot } from "./types";
import { hostOf } from "../utils";
import { isMarket } from "./markets";
import { fillSnapshot } from "./snapshot";

export const RECENTS_KEY = "rankframe.recents";
export const RECENTS_MAX = 8;

export type RecentEntry = {
  url: string;
  market: Market;
  host: string;
  score: number;
  keyword: string;
  rank: number | null;
  at: string;
  snapshot: SeoSnapshot;
};

function canStore(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readRecents(): RecentEntry[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r.url === "string" && isMarket(r.market) && r.snapshot)
      .slice(0, RECENTS_MAX)
      .map((r) => ({ ...r, snapshot: fillSnapshot(r.snapshot) }));
  } catch {
    return [];
  }
}

export function writeRecent(entry: RecentEntry) {
  if (!canStore()) return;
  const rest = readRecents().filter((r) => !(r.url === entry.url && r.market === entry.market));
  const next = [entry, ...rest].slice(0, RECENTS_MAX);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function recentFromAnalysis(args: {
  url: string;
  market: Market;
  score: number;
  keyword: string;
  rank: number | null;
  snapshot: SeoSnapshot;
}): RecentEntry {
  return {
    ...args,
    host: hostOf(args.snapshot.finalUrl || args.url),
    at: new Date().toISOString(),
  };
}
