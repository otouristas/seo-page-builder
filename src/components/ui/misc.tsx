import type { HTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-ink-900 px-1.5 font-mono text-[10px] text-fg-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Progress({ value, tone = "signal", className, track }: { value: number; tone?: "signal" | "peri" | "success" | "warn" | "danger"; className?: string; track?: string }) {
  const bar = { signal: "bg-signal", peri: "bg-peri", success: "bg-success", warn: "bg-warn", danger: "bg-danger" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", track ?? "bg-white/8", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-500 ease-fluid", bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-shimmer rounded-lg bg-white/6 bg-shimmer", className)} {...rest} />;
}

export function Toggle({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label?: string; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-signal" : "bg-ink-600",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ease-snappy",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Accordion({ title, children, paper, defaultOpen }: { title: ReactNode; children: ReactNode; paper?: boolean; defaultOpen?: boolean }) {
  return (
    <details className={cn("group rounded-2xl border", paper ? "border-ink-900/10 bg-white" : "border-white/8 bg-ink-800/60")} open={defaultOpen}>
      <summary className={cn("flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden", paper ? "text-ink-900" : "text-fg")}>
        {title}
        <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200 group-open:rotate-180", paper ? "text-paper-muted" : "text-fg-muted")} aria-hidden />
      </summary>
      <div className={cn("px-5 pb-5 text-[14px] leading-relaxed", paper ? "text-paper-muted" : "text-fg-muted")}>{children}</div>
    </details>
  );
}

export function Stat({ label, value, hint, className, paper }: { label: string; value: ReactNode; hint?: ReactNode; className?: string; paper?: boolean }) {
  return (
    <div className={className}>
      <div className={cn("font-mono text-[11px] tracking-[0.14em] uppercase", paper ? "text-paper-muted" : "text-fg-subtle")}>{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-semibold tracking-tight tabular", paper ? "text-ink-900" : "text-fg")}>{value}</div>
      {hint && <div className={cn("mt-1 text-[12px]", paper ? "text-paper-muted" : "text-fg-muted")}>{hint}</div>}
    </div>
  );
}
