import { cn, hash32 } from "@/lib/utils";

const PALETTE = ["#1a73e8", "#d93025", "#188038", "#f9ab00", "#9334e6", "#e8710a", "#12b5cb", "#c5221f", "#3c4043"];

/** Letter avatar standing in for a favicon; color is stable per domain. */
export function Favicon({ domain, size = 26, className, you }: { domain: string; size?: number; className?: string; you?: boolean }) {
  const letter = (domain.replace(/^www\./, "")[0] ?? "?").toUpperCase();
  const color = you ? "#0a0f1e" : PALETTE[hash32(domain) % PALETTE.length]!;
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-serp font-bold text-white", className)}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.5) }}
      aria-hidden
    >
      {you ? <span style={{ color: "#c7ff3b" }}>{letter}</span> : letter}
    </span>
  );
}
