import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_NAV } from "@/lib/marketing/links";
import { PILLARS, PRODUCT_ICONS, type Pillar } from "@/lib/marketing/nav";
import { PRODUCT_INDICATORS } from "@/lib/marketing/indicators";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

/** Which landing section is in view, so the matching pillar lights up while scrolling. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.05, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);
  return active;
}

type Tone = "ink" | "paper";

function PillarBody({ p, active, paper, chevron }: { p: Pillar; active: boolean; paper: boolean; chevron?: boolean }) {
  return (
    <>
      <span className={cn("font-mono text-[10px] tracking-[0.22em]", active ? (paper ? "text-signal-700" : "text-signal") : paper ? "text-paper-muted/70" : "text-fg-subtle")}>{p.index}</span>
      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium leading-none">
        {p.label}
        {chevron && <ChevronDown className="size-3.5 transition-transform duration-200 group-hover/menu:rotate-180" aria-hidden />}
      </span>
      <span
        className={cn("absolute inset-x-0 top-0 h-[3px] origin-left bg-signal transition-transform duration-300 ease-fluid", active ? "scale-x-100" : "scale-x-0")}
        aria-hidden
      />
    </>
  );
}

/**
 * Pillar header: every item is a full-height column separated by hairlines, numbered like an index,
 * with a lime bar on the pillar whose section is in view. The CTA is a solid lime pillar at the edge.
 */
export function SiteHeader({ tone = "ink" }: { tone?: Tone }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const paper = tone === "paper";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const section = useActiveSection(PILLARS.map((p) => p.section));
  const routeActive = pathname.startsWith("/pricing") ? "pricing" : pathname.startsWith("/case-studies") ? "case-studies" : null;
  const activeId = routeActive ?? (pathname === "/" ? section : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hairline = paper ? "border-ink-900/10" : "border-white/8";
  const pillar = cn(
    "group relative flex h-full shrink-0 flex-col justify-center gap-1 whitespace-nowrap border-l px-5 transition-colors xl:px-6",
    hairline,
    paper ? "text-paper-muted hover:bg-ink-900/4 hover:text-ink-900" : "text-fg-muted hover:bg-white/4 hover:text-fg",
  );
  const pillarActive = paper ? "text-ink-900" : "text-fg";

  return (
    <header className={cn("sticky top-0 z-40 border-b transition-[background-color,box-shadow] duration-300", hairline, scrolled && (paper ? "glass-paper shadow-paper" : "glass"))}>
      <div className="flex h-[72px] items-stretch">
        <div className="flex items-center px-5 sm:px-8">
          <Logo tone={tone} />
        </div>

        <nav className="hidden items-stretch lg:flex" aria-label="Primary">
          {PILLARS.map((p) => {
            const active = activeId === p.id;
            if (p.id === "product") {
              return (
                <div key={p.id} className="group/menu relative flex items-stretch">
                  <Link to={p.to} hash={p.hash} className={cn(pillar, active && pillarActive)} aria-haspopup="true" aria-current={active ? "location" : undefined}>
                    <PillarBody p={p} active={active} paper={paper} chevron />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
                    <div className="w-[580px] rounded-2xl bg-ink-900 p-2 shadow-stage ring-hairline">
                      <div className="grid grid-cols-2 gap-1">
                        {PRODUCT_NAV.map((item, i) => {
                          const Icon = PRODUCT_ICONS[item.tab];
                          return (
                            <Link key={item.tab} to="/app" search={{ tab: item.tab, demo: true }} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-800 text-signal ring-hairline">
                                <Icon className="size-4" />
                              </span>
                              <span>
                                <span className="flex items-center gap-2 text-[14px] font-medium text-fg">
                                  {item.label}
                                  <span className="font-mono text-[10px] text-fg-subtle">0{i + 1}</span>
                                </span>
                                <span className="block text-[12px] leading-snug text-fg-muted">{item.description}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-1 flex items-center justify-between rounded-xl bg-ink-800/70 px-3 py-2 text-[12px] text-fg-muted">
                        Every tab works as a guest. Sign in for GSC persistence and live SERP.
                        <Link to="/app" search={{ demo: true }} className="inline-flex items-center gap-1 font-medium text-signal">
                          Open the lab <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link key={p.id} to={p.to} hash={p.hash} className={cn(pillar, active && pillarActive)} aria-current={active ? "location" : undefined}>
                <PillarBody p={p} active={active} paper={paper} />
              </Link>
            );
          })}
        </nav>

        <div className={cn("hidden min-w-0 flex-1 items-center justify-end gap-6 overflow-hidden border-l px-6 lg:flex", hairline)} aria-label="Product indicators">
          {PRODUCT_INDICATORS.slice(0, 4).map((p) => (
            <span key={p.label} className={cn("hidden whitespace-nowrap font-mono text-[11px] tracking-wide 2xl:inline", paper ? "text-paper-muted" : "text-fg-subtle")}>
              <span className={cn("font-semibold tabular", paper ? "text-ink-900" : "text-fg")}>{p.value}</span> {p.label}
            </span>
          ))}
        </div>

        <Link to="/login" className={cn(pillar, "hidden shrink-0 items-center whitespace-nowrap lg:flex")}>
          <span className="text-[14px] font-medium leading-none">Sign in</span>
        </Link>
        <Link to="/app" className="hidden shrink-0 items-center gap-2 whitespace-nowrap bg-signal px-7 text-[14px] font-semibold text-ink-900 transition-colors hover:bg-signal-600 lg:flex">
          Try it free <ArrowRight className="size-4" aria-hidden />
        </Link>

        <div className="flex-1 lg:hidden" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("grid w-[72px] place-items-center border-l lg:hidden", hairline, paper ? "text-ink-900 hover:bg-ink-900/4" : "text-fg hover:bg-white/5")}
          aria-label="Open menu"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
