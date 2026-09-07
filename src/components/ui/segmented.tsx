import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: ReactNode; title?: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  paper?: boolean;
  className?: string;
  layoutId?: string;
  ariaLabel?: string;
};

/** Pill group with a sliding highlight. */
export function Segmented<T extends string>({ options, value, onChange, size = "sm", paper, className, layoutId, ariaLabel }: Props<T>) {
  const id = layoutId ?? "segmented";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        paper ? "bg-ink-900/6" : "bg-ink-900/70 ring-hairline",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            title={o.title}
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-full font-medium transition-colors",
              size === "sm" ? "h-7 px-3 text-[12px]" : "h-9 px-4 text-[13px]",
              active ? (paper ? "text-ink-900" : "text-ink-900") : paper ? "text-paper-muted hover:text-ink-900" : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={id}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className={cn("absolute inset-0 rounded-full", paper ? "bg-white shadow-paper" : "bg-signal")}
                aria-hidden
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
