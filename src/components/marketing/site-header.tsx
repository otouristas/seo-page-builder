import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_NAV } from "@/lib/marketing/links";
import { PILLARS, PRODUCT_ICONS } from "@/lib/marketing/nav";
import { useMarketPref } from "@/lib/marketing/market-pref";
import { Logo } from "./logo";
import { MarketSwitch } from "./market-switch";
import { MobileMenu } from "./mobile-menu";

/** Which landing section is in view, so the matching nav item lights up while scrolling. */
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

/**
 * Floating pill header: a glass capsule detached from the top edge with the brand, the nav,
 * a GR · US market switch, and round icon buttons. Sticky, so it stays with the reader.
 */
export function SiteHeader({ tone = "ink" }: { tone?: Tone }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [market, setMarket] = useMarketPref();
  const paper = tone === "paper";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const section = useActiveSection(PILLARS.map((p) => p.section));
  const routeActive = pathname.startsWith("/pricing") ? "pricing" : pathname.startsWith("/case-studies") ? "case-studies" : null;
  const activeId = routeActive ?? (pathname === "/" ? section : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItem = cn(
    "relative inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[14px] font-medium whitespace-nowrap transition-colors",
    paper ? "text-paper-muted hover:bg-ink-900/5 hover:text-ink-900" : "text-fg-muted hover:bg-white/6 hover:text-fg",
  );
  const navActive = paper ? "bg-ink-900/6 text-ink-900" : "bg-white/8 text-fg";
  const dot = (active: boolean) => <span className={cn("size-1.5 rounded-full transition-colors", active ? "bg-signal" : "bg-transparent")} aria-hidden />;

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <header
        className={cn(
          "mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-full border pl-4 pr-2 transition-[background-color,box-shadow,border-color] duration-300",
          paper
            ? cn("border-ink-900/10 bg-white/75 backdrop-blur-xl", scrolled && "bg-white/90 shadow-paper")
            : cn("border-white/10 bg-ink-900/55 backdrop-blur-xl", scrolled && "border-white/14 bg-ink-900/80 shadow-stage"),
        )}
      >
        <Logo tone={tone} />

        <nav className="ml-3 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {PILLARS.map((p) => {
            const active = activeId === p.id;
            if (p.id === "product") {
              return (
                <div key={p.id} className="group/menu relative">
                  <Link to={p.to} hash={p.hash} className={cn(navItem, active && navActive)} aria-haspopup="true" aria-current={active ? "location" : undefined}>
                    {dot(active)}
                    {p.label}
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-hover/menu:rotate-180" aria-hidden />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
                    <div className="w-[580px] rounded-3xl bg-ink-900 p-2 shadow-stage ring-hairline">
                      <div className="grid grid-cols-2 gap-1">
                        {PRODUCT_NAV.map((item) => {
                          const Icon = PRODUCT_ICONS[item.tab];
                          return (
                            <Link key={item.tab} to="/app" search={{ tab: item.tab, demo: true }} className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal ring-1 ring-inset ring-signal/25">
                                <Icon className="size-4" />
                              </span>
                              <span>
                                <span className="block text-[14px] font-medium text-fg">{item.label}</span>
                                <span className="block text-[12px] leading-snug text-fg-muted">{item.description}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-1 flex items-center justify-between rounded-2xl bg-ink-800/70 px-3 py-2 text-[12px] text-fg-muted">
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
              <Link key={p.id} to={p.to} hash={p.hash} className={cn(navItem, active && navActive)} aria-current={active ? "location" : undefined}>
                {dot(active)}
                {p.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <MarketSwitch market={market} onChange={setMarket} paper={paper} />
          <Link to="/login" className={cn(navItem, "hidden lg:inline-flex")}>
            Sign in
          </Link>
          <Link to="/app" className="hidden h-10 items-center gap-2 rounded-full bg-signal px-4 text-[14px] font-semibold text-ink-900 transition-colors hover:bg-signal-600 lg:inline-flex">
            Try it free <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn("grid size-10 place-items-center rounded-full border transition-colors lg:hidden", paper ? "border-ink-900/15 text-ink-900 hover:bg-ink-900/5" : "border-white/15 text-fg hover:bg-white/8")}
            aria-label="Open menu"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} market={market} onMarket={setMarket} />
    </div>
  );
}
