import { useEffect, useState } from "react";
import { Container } from "@/components/patterns";
import { getLiveStats, type LiveStats } from "@/server/stats";
import { formatCompact } from "@/lib/utils";

const PRODUCT = [
  { value: "12", label: "on-page checks", hint: "weighted, with fix copy" },
  { value: "10", label: "SERP slots per scene", hint: "plus AI Overview, snippet, PAA" },
  { value: "8", label: "live lookups / day", hint: "DataForSEO, signed in" },
  { value: "5", label: "play pillars", hint: "on-page · content · technical · intent · authority" },
  { value: "1", label: "drop to import GSC", hint: "CSV or TSV export" },
];

export function Indicators() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  useEffect(() => {
    getLiveStats()
      .then((s) => setStats(s))
      .catch(() => setStats(null));
  }, []);
  const live = stats?.available && stats.analyses > 0 ? stats : null;

  return (
    <div id="proof" className="relative border-y border-white/8 bg-ink-950/60">
      <Container className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {PRODUCT.map((p) => (
          <div key={p.label}>
            <div className="font-display text-4xl font-semibold tracking-tight text-fg tabular">{p.value}</div>
            <div className="mt-1 text-[14px] font-medium">{p.label}</div>
            <div className="text-[12px] text-fg-muted">{p.hint}</div>
          </div>
        ))}
      </Container>
      {live && (
        <Container className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/8 py-4 text-[13px] text-fg-muted">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-signal" />
            </span>
            Since launch
          </span>
          <span>
            <strong className="font-semibold text-fg tabular">{formatCompact(live.analyses)}</strong> labs run
          </span>
          <span>
            <strong className="font-semibold text-fg tabular">{formatCompact(live.keywords)}</strong> keywords staged
          </span>
          <span>
            <strong className="font-semibold text-fg tabular">{formatCompact(live.plays)}</strong> plays applied
          </span>
          <span className="text-fg-subtle">Counted from real product events, never seeded.</span>
        </Container>
      )}
    </div>
  );
}
