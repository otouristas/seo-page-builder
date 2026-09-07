import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#0a0f1e" />
      <rect x="14" y="40" width="10" height="10" rx="2" fill="#2a3559" />
      <rect x="27" y="30" width="10" height="20" rx="2" fill="#7c9bff" />
      <rect x="40" y="14" width="10" height="36" rx="2" fill="#c7ff3b" />
    </svg>
  );
}

export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-tight", tone === "ink" ? "text-fg" : "text-ink-900", className)} aria-label="Rankframe home">
      <LogoMark />
      Rankframe
    </Link>
  );
}
