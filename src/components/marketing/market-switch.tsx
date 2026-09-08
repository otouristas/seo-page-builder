import { useEffect, useMemo, useRef, useState } from "react";
import type { Market } from "@/lib/seo/types";
import { MARKETS, MARKET_IDS, MARKET_REGIONS } from "@/lib/seo/markets";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

/** Searchable market picker. Replaces the old GR · US toggle. */
export function MarketSwitch({
  market,
  onChange,
  paper,
  compact,
}: {
  market: Market;
  onChange: (m: Market) => void;
  paper?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const info = MARKETS[market];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return MARKET_IDS.filter((id) => {
      const m = MARKETS[id];
      if (!needle) return true;
      return `${m.label} ${m.short} ${m.googleHost} ${m.id}`.toLowerCase().includes(needle);
    });
  }, [q]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Market ${info.label}`}
        title={`${info.label} · ${info.googleHost}`}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full font-mono text-[12px] tracking-[0.08em] transition-colors",
          compact ? "px-2.5" : "px-3",
          paper ? "hover:bg-ink-900/5" : "hover:bg-white/6",
          open && (paper ? "bg-ink-900/5" : "bg-white/8"),
        )}
      >
        <span className={paper ? "text-ink-900" : "text-fg"}>{info.short}</span>
        <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl p-2 shadow-card ring-hairline",
            paper ? "bg-white text-ink-900" : "bg-ink-800 text-fg",
          )}
        >
          <div className={cn("mb-2 flex items-center gap-2 rounded-xl px-2.5 py-1.5", paper ? "bg-ink-900/5" : "bg-ink-900/70")}>
            <Search className="size-3.5 opacity-50" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search markets"
              className={cn("w-full bg-transparent text-[13px] outline-none", paper ? "placeholder:text-paper-muted" : "placeholder:text-fg-subtle")}
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {MARKET_REGIONS.map((region) => {
              const ids = filtered.filter((id) => MARKETS[id].region === region.id);
              if (!ids.length) return null;
              return (
                <div key={region.id} className="mb-1.5">
                  <div className={cn("px-2 py-1 font-mono text-[10px] tracking-[0.16em] uppercase", paper ? "text-paper-muted" : "text-fg-subtle")}>{region.label}</div>
                  {ids.map((id) => {
                    const m = MARKETS[id];
                    const active = id === market;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onChange(id);
                          setOpen(false);
                          setQ("");
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-[13px]",
                          active ? (paper ? "bg-ink-900 text-fg" : "bg-signal text-ink-900") : paper ? "hover:bg-ink-900/5" : "hover:bg-white/6",
                        )}
                      >
                        <span className="font-medium">{m.label}</span>
                        <span className={cn("font-mono text-[11px]", active ? "opacity-80" : paper ? "text-paper-muted" : "text-fg-muted")}>{m.googleHost}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {!filtered.length && <div className={cn("px-2 py-3 text-[12px]", paper ? "text-paper-muted" : "text-fg-muted")}>No match</div>}
          </div>
        </div>
      )}
    </div>
  );
}
