import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShieldCheck, KeyRound, Upload, MessageCircle, LayoutDashboard, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_NAV } from "@/lib/marketing/links";
import { Logo } from "./logo";
import { ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

const ICONS = { serp: Search, audit: ShieldCheck, keywords: KeyRound, gsc: Upload, coach: MessageCircle, overview: LayoutDashboard } as const;

export function SiteHeader({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const paper = tone === "paper";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = cn("rounded-full px-3 py-2 text-[14px] font-medium transition-colors", paper ? "text-paper-muted hover:bg-ink-900/5 hover:text-ink-900" : "text-fg-muted hover:bg-white/5 hover:text-fg");

  return (
    <header className={cn("sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300", scrolled ? (paper ? "glass-paper border-b border-ink-900/8 shadow-paper" : "glass border-b border-white/8") : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
        <Logo tone={tone} />
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div className="group/menu relative">
            <button type="button" className={cn(link, "inline-flex items-center gap-1")} aria-haspopup="true">
              Product <ChevronDown className="size-3.5 transition-transform group-hover/menu:rotate-180" aria-hidden />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
              <div className="w-[560px] rounded-2xl bg-ink-900 p-2 shadow-stage ring-hairline">
                <div className="grid grid-cols-2 gap-1">
                  {PRODUCT_NAV.map((item) => {
                    const Icon = ICONS[item.tab];
                    return (
                      <Link key={item.tab} to="/app" search={{ tab: item.tab, demo: true }} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-800 text-signal ring-hairline">
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
                <div className="mt-1 flex items-center justify-between rounded-xl bg-ink-800/70 px-3 py-2 text-[12px] text-fg-muted">
                  Every tab works as a guest. Sign in for GSC persistence and live SERP.
                  <Link to="/app" search={{ demo: true }} className="inline-flex items-center gap-1 font-medium text-signal">
                    Open the lab <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Link to="/" hash="proof" className={link}>
            Proof
          </Link>
          <Link to="/" hash="case-studies" className={link}>
            Case studies
          </Link>
          <Link to="/pricing" className={link}>
            Pricing
          </Link>
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <ButtonLink to="/login" variant={paper ? "paper-ghost" : "ghost"} size="md">
            Sign in
          </ButtonLink>
          <ButtonLink to="/app" variant={paper ? "paper" : "primary"} size="md" trailing={<ArrowRight className="size-4" />}>
            Try it free
          </ButtonLink>
        </div>
        <button type="button" onClick={() => setOpen(true)} className={cn("ml-auto grid size-10 place-items-center rounded-full lg:hidden", paper ? "text-ink-900 hover:bg-ink-900/5" : "text-fg hover:bg-white/5")} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Menu" side="right" width="max-w-sm">
        <div className="space-y-6 p-5">
          <div>
            <div className="mb-2 font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase">Product</div>
            <div className="space-y-1">
              {PRODUCT_NAV.map((item) => {
                const Icon = ICONS[item.tab];
                return (
                  <Link key={item.tab} to="/app" search={{ tab: item.tab, demo: true }} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
                    <Icon className="size-4 text-signal" />
                    <span className="text-[15px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            {[
              { label: "Proof", hash: "proof" },
              { label: "Case studies", hash: "case-studies" },
            ].map((l) => (
              <Link key={l.hash} to="/" hash={l.hash} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-white/5">
                {l.label}
              </Link>
            ))}
            <Link to="/pricing" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-white/5">
              Pricing
            </Link>
          </div>
          <div className="grid gap-2">
            <ButtonLink to="/app" variant="primary" size="lg" onClick={() => setOpen(false)}>
              Try it free
            </ButtonLink>
            <ButtonLink to="/login" variant="outline" size="lg" onClick={() => setOpen(false)}>
              Sign in
            </ButtonLink>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
