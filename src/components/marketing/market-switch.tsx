import type { Market } from "@/lib/seo/types";
import { MARKETS } from "@/lib/seo/markets";
import { cn } from "@/lib/utils";

/** "GR · US" toggle, styled like a language switch. Sets the default market for the lab. */
export function MarketSwitch({ market, onChange, paper, compact }: { market: Market; onChange: (m: Market) => void; paper?: boolean; compact?: boolean }) {
  const next: Market = market === "gr" ? "us" : "gr";
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      title={`Market: ${MARKETS[market].label}. Switch to ${MARKETS[next].label}.`}
      aria-label={`Market ${MARKETS[market].label}, switch to ${MARKETS[next].label}`}
      className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full font-mono text-[12px] tracking-[0.12em] transition-colors", compact ? "px-2" : "px-3", paper ? "hover:bg-ink-900/5" : "hover:bg-white/6")}
    >
      <span className={cn("transition-colors", market === "gr" ? (paper ? "text-ink-900" : "text-fg") : paper ? "text-paper-muted/60" : "text-fg-subtle")}>GR</span>
      <span className={paper ? "text-paper-muted/60" : "text-fg-subtle"} aria-hidden>
        ·
      </span>
      <span className={cn("transition-colors", market === "us" ? (paper ? "text-ink-900" : "text-fg") : paper ? "text-paper-muted/60" : "text-fg-subtle")}>US</span>
    </button>
  );
}
