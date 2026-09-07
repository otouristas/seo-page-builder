import { useCallback, useEffect, useState } from "react";
import type { Market } from "@/lib/seo/types";
import { isMarket } from "@/lib/seo/markets";

const KEY = "rf-market";
const EVENT = "rf-market-change";

/** The market chosen in the site header (GR · US). The lab reads it on boot. */
export function readMarketPref(): Market | null {
  try {
    const v = localStorage.getItem(KEY);
    return isMarket(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeMarketPref(market: Market) {
  try {
    localStorage.setItem(KEY, market);
    window.dispatchEvent(new CustomEvent<Market>(EVENT, { detail: market }));
  } catch {
    /* storage unavailable */
  }
}

export function useMarketPref(fallback: Market = "gr"): [Market, (m: Market) => void] {
  const [market, setMarket] = useState<Market>(fallback);
  useEffect(() => {
    const stored = readMarketPref();
    if (stored) setMarket(stored);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Market>).detail;
      if (isMarket(detail)) setMarket(detail);
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  const set = useCallback((m: Market) => {
    setMarket(m);
    writeMarketPref(m);
  }, []);
  return [market, set];
}
