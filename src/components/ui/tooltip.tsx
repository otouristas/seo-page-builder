import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Hover/focus tooltip, CSS only. Wrap an inline element. */
export function Tooltip({ content, children, side = "top", className }: { content: ReactNode; children: ReactNode; side?: "top" | "bottom"; className?: string }) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-[260px] -translate-x-1/2 rounded-lg bg-ink-950 px-3 py-2 text-left text-[12px] leading-snug text-fg opacity-0 shadow-card ring-hairline transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </span>
    </span>
  );
}
