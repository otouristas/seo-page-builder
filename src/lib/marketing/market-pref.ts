import { useCallback, useEffect, useState } from "react";
import type { Market } from "@/lib/seo/types";
import { inferMarket, isMarket } from "@/lib/seo/markets";

const KEY = "rf-market";
const EVENT = "rf-market-change";

/** The market chosen in the site header. The lab reads it on boot. */
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

export function useMarketPref(fallback?: Market): [Market, (m: Market) => void] {
  const [market, setMarket] = useState<Market>(fallback ?? "us");
  useEffect(() => {
    const stored = readMarketPref();
    if (stored) setMarket(stored);
    else {
      const inferred = inferMarket(typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : ["en-US"]);
      setMarket(inferred);
    }
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
