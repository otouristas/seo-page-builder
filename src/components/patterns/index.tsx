import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DotGrid({ className, paper }: { className?: string; paper?: boolean }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-0", paper ? "bg-dot-grid-paper" : "bg-dot-grid", className)} />;
}

export function GridLines({ className, paper }: { className?: string; paper?: boolean }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-0", paper ? "bg-grid-lines-paper" : "bg-grid-lines", className)} />;
}

export function Noise({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay", className)} />;
}

/** Two slow-drifting glows: lime top-left, periwinkle bottom-right. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -top-48 left-[10%] h-[560px] w-[560px] rounded-full bg-signal blur-[140px] animate-drift"
        style={{ opacity: 0.16 * intensity }}
      />
      <div
        className="absolute -bottom-56 right-[5%] h-[620px] w-[620px] rounded-full bg-peri blur-[150px] animate-drift-slow"
        style={{ opacity: 0.2 * intensity }}
      />
    </div>
  );
}

export function GlowRing({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glow-ring rounded-3xl", className)}>{children}</div>;
}

/** Infinite horizontal scroller; duplicates children for a seamless loop. Pauses on hover. */
export function Marquee({ children, className, speed = "44s" }: { children: ReactNode; className?: string; speed?: string }) {
  return (
    <div className={cn("group/marquee relative overflow-hidden mask-fade-x", className)}>
      <div className="flex w-max animate-marquee gap-12 group-hover/marquee:[animation-play-state:paused]" style={{ animationDuration: speed }}>
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Section wrapper alternating ink and paper bands. */
export function Band({ paper, className, children, id }: { paper?: boolean; className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("relative", paper ? "paper" : "ink", className)}>
      {children}
    </section>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}
