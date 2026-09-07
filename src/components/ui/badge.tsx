import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { PlayPillar, SearchIntent } from "@/lib/seo/types";

export type Tone = "neutral" | "signal" | "peri" | "success" | "warn" | "danger" | "rose" | "cyan" | "paper";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink-700/70 text-fg-muted ring-1 ring-inset ring-white/10",
  signal: "bg-signal/15 text-signal ring-1 ring-inset ring-signal/30",
  peri: "bg-peri/15 text-peri-300 ring-1 ring-inset ring-peri/30",
  success: "bg-success/15 text-success ring-1 ring-inset ring-success/30",
  warn: "bg-warn/15 text-warn ring-1 ring-inset ring-warn/30",
  danger: "bg-danger/15 text-danger ring-1 ring-inset ring-danger/30",
  rose: "bg-rose/15 text-rose ring-1 ring-inset ring-rose/30",
  cyan: "bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/30",
  paper: "bg-ink-900/6 text-ink-900 ring-1 ring-inset ring-ink-900/10",
};

const DOTS: Record<Tone, string> = {
  neutral: "bg-fg-muted",
  signal: "bg-signal",
  peri: "bg-peri",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  rose: "bg-rose",
  cyan: "bg-cyan",
  paper: "bg-ink-900",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean; size?: "sm" | "md" };

export function Badge({ tone = "neutral", dot, size = "md", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-[12px]",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} aria-hidden />}
      {children}
    </span>
  );
}

export const INTENT_TONE: Record<SearchIntent, Tone> = {
  informational: "peri",
  commercial: "warn",
  transactional: "success",
  navigational: "neutral",
};

export const INTENT_LABEL: Record<SearchIntent, string> = {
  informational: "Informational",
  commercial: "Commercial",
  transactional: "Transactional",
  navigational: "Navigational",
};

export function IntentBadge({ intent, size, className }: { intent: SearchIntent; size?: "sm" | "md"; className?: string }) {
  return (
    <Badge tone={INTENT_TONE[intent]} dot size={size} className={className}>
      {INTENT_LABEL[intent]}
    </Badge>
  );
}

export const PILLAR_TONE: Record<PlayPillar, Tone> = {
  "on-page": "signal",
  content: "peri",
  technical: "success",
  authority: "warn",
  intent: "rose",
};

export const PILLAR_DOT: Record<PlayPillar, string> = {
  "on-page": "bg-signal",
  content: "bg-peri",
  technical: "bg-success",
  authority: "bg-warn",
  intent: "bg-rose",
};

export function Eyebrow({ className, children, tone = "signal" }: { className?: string; children: React.ReactNode; tone?: "signal" | "peri" | "muted" | "paper" }) {
  const color = tone === "signal" ? "text-signal" : tone === "peri" ? "text-peri" : tone === "paper" ? "text-ink-900/60" : "text-fg-muted";
  return <p className={cn("font-mono text-[11px] font-medium tracking-[0.18em] uppercase", color, className)}>{children}</p>;
}
