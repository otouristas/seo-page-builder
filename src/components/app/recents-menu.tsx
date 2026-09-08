import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { readRecents, type RecentEntry } from "@/lib/seo/recents";
import { MARKETS } from "@/lib/seo/markets";
import { rankLabel } from "@/lib/seo/rank-model";
import { cn } from "@/lib/utils";

export function RecentsList({ onPick, paper, title, className }: { onPick: (e: RecentEntry) => void; paper?: boolean; title?: string; className?: string }) {
  const [items, setItems] = useState<RecentEntry[]>([]);
  useEffect(() => setItems(readRecents()), []);
  if (!items.length) return null;
  return (
    <div className={className}>
      {title && <div className={cn("px-2 py-1 font-mono text-[10px] tracking-[0.16em] uppercase", paper ? "text-paper-muted" : "text-fg-subtle")}>{title}</div>}
      <ul className="space-y-1">
        {items.map((r) => (
          <li key={`${r.url}-${r.market}-${r.at}`}>
            <button
              type="button"
              onClick={() => onPick(r)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                paper ? "hover:bg-ink-900/5" : "hover:bg-white/6",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{r.host}</span>
                <span className={cn("block truncate text-[11px]", paper ? "text-paper-muted" : "text-fg-muted")}>
                  {r.keyword} · {MARKETS[r.market].short} · {r.score}/100
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular">{rankLabel(r.rank)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentsButton({ onPick }: { onPick: (e: RecentEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RecentEntry[]>([]);
  useEffect(() => setItems(readRecents()), []);
  useEffect(() => {
    if (open) setItems(readRecents());
  }, [open]);
  if (!items.length && !open) return null;
  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Recent analyses"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/6"
      >
        <Clock className="size-4" />
        <span className="sr-only">Recent</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl bg-ink-800 p-2 shadow-card ring-hairline">
          <div className="px-2 py-1.5 font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Recent</div>
          {items.length ? <RecentsList onPick={(e) => { onPick(e); setOpen(false); }} /> : <p className="px-2 py-3 text-[12px] text-fg-muted">Nothing saved on this browser yet.</p>}
        </div>
      )}
    </div>
  );
}
