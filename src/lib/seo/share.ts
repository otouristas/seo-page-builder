import type { AppTab, Device, Market } from "./types";
import { isMarket } from "./markets";
import { playKey } from "./plays";

export type SceneShare = {
  url?: string;
  kw?: string;
  tab?: AppTab;
  market?: Market;
  plays?: string[];
  device?: Device;
  compare?: boolean;
  demo?: boolean;
};

const TABS: AppTab[] = ["overview", "serp", "audit", "keywords", "gsc", "coach"];

export function encodePlays(playIds: string[], nicheId: string): string | undefined {
  const keys = playIds.map((id) => playKey(id, nicheId)).filter(Boolean);
  return keys.length ? keys.join(",") : undefined;
}

export function decodePlays(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function resolvePlayIds(keys: string[], nicheId: string, available: { id: string }[]): string[] {
  const set = new Set(keys);
  return available.filter((p) => set.has(playKey(p.id, nicheId))).map((p) => p.id);
}

export function parseDevice(v: unknown): Device | undefined {
  return v === "mobile" || v === "desktop" ? v : undefined;
}

export function parseCompare(v: unknown): boolean | undefined {
  return v === true || v === 1 || v === "true" || v === "1" ? true : undefined;
}

export function parseTab(v: unknown): AppTab | undefined {
  return TABS.includes(v as AppTab) ? (v as AppTab) : undefined;
}

export function parseShareMarket(v: unknown): Market | undefined {
  return isMarket(v) ? v : undefined;
}
