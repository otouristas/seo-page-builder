import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Favicon } from "./favicon";

const COMPETITORS = [
  { domain: "forbes.com", title: "The 10 Best Payment Processors of 2026 (Tested)" },
  { domain: "g2.com", title: "Best Payment Processing Software: Top Picks Compared" },
  { domain: "nerdwallet.com", title: "Payment Processing: How It Works and What It Costs" },
  { domain: "reddit.com", title: "What's the best payment processing right now? Honest answers" },
  { domain: "capterra.com", title: "Payment Processing Reviews 2026: Pros, Cons & Pricing" },
  { domain: "zapier.com", title: "Payment Processing Explained: How It Works" },
];

const PLAYS = ["Keyword-first title", "Comparison table", "FAQ + schema", "3 new links"];
const RANKS = [7, 6, 4, 3, 2];

/** Hero animation: "your page" climbs a mini SERP as plays light up. */
export function SerpClimb({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? PLAYS.length : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s >= PLAYS.length + 1 ? 0 : s + 1)), 1700);
    return () => clearInterval(id);
  }, [reduce]);

  const applied = Math.min(step, PLAYS.length);
  const rank = RANKS[applied] ?? 2;
  const rows = [...COMPETITORS.map((c) => ({ id: c.domain, ...c, you: false }))];
  rows.splice(rank - 1, 0, { id: "you", domain: "yoursite.com", title: "Payment processing that scales with you | YourSite", you: true });
  const shown = rows.slice(0, 7);
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <div className={cn("relative", className)}>
      <div className="min-w-0 overflow-hidden rounded-2xl bg-white font-serp shadow-stage">
        <div className="flex items-center gap-3 border-b border-google-border px-4 py-3">
          <div className="flex items-center gap-1" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#4285f4]" />
            <span className="size-2.5 rounded-full bg-[#ea4335]" />
            <span className="size-2.5 rounded-full bg-[#fbbc05]" />
            <span className="size-2.5 rounded-full bg-[#34a853]" />
          </div>
          <div className="flex h-9 flex-1 items-center rounded-full border border-google-border px-4 text-[14px] text-[#202124] shadow-[0_1px_6px_rgba(32,33,36,0.16)]">payment processing</div>
        </div>
        <LayoutGroup id="climb">
          <div className="space-y-3 px-4 pt-4 pb-10">
            {shown.map((r, i) => (
              <motion.div key={r.id} layout transition={{ layout: spring }} className={cn("relative rounded-xl px-3 py-2", r.you && "z-10 bg-[#f6ffdf] ring-2 ring-[#a8e01f]")}>
                {r.you && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-ink-900 px-2 py-0.5 font-sans text-[10px] font-semibold text-signal">#{i + 1} · you</span>
                )}
                <div className="flex items-center gap-2">
                  <Favicon domain={r.domain} size={18} you={r.you} />
                  <span className="truncate text-[11px] text-[#4d5156]">{r.domain}</span>
                </div>
                <div className="mt-0.5 truncate text-[15px] leading-tight text-google-title">{r.title}</div>
                <div className="mt-1 h-2 w-4/5 rounded bg-[#eceff1]" aria-hidden />
              </motion.div>
            ))}
          </div>
        </LayoutGroup>
      </div>

      <div className="relative z-10 -mt-6 flex flex-wrap justify-center gap-2 px-2 font-sans">
        {PLAYS.map((p, i) => {
          const on = i < applied;
          return (
            <motion.span
              key={p}
              animate={{ scale: on ? 1 : 0.96 }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium shadow-card transition-colors duration-300",
                on ? "bg-signal text-ink-900" : "glass text-fg-muted ring-hairline",
              )}
            >
              <span className={cn("grid size-4 place-items-center rounded-full", on ? "bg-ink-900 text-signal" : "bg-white/10")}>{on ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-fg-subtle" />}</span>
              {p}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
