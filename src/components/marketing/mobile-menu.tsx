import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, ChevronRight, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Market } from "@/lib/seo/types";
import { cn } from "@/lib/utils";
import { LINKS, PRODUCT_NAV } from "@/lib/marketing/links";
import { MENU_CHIPS, PILLARS, PRODUCT_ICONS } from "@/lib/marketing/nav";
import { Aurora, DotGrid, Noise } from "@/components/patterns";
import { LogoMark } from "./logo";
import { MenuArt } from "./menu-art";
import { MarketSwitch } from "./market-switch";

type Props = { open: boolean; onClose: () => void; market: Market; onMarket: (m: Market) => void };

/** Full-screen mega menu: gradient CTA card, quick chips, an Explore list with thumbnails and counts. */
export function MobileMenu({ open, onClose, market, onMarket }: Props) {
  const reduce = useReducedMotion();
  const [productOpen, setProductOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const list = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.05 } } };
  const item = { hidden: { opacity: 0, y: reduce ? 0 : 12 }, show: { opacity: 1, y: 0 } };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[linear-gradient(180deg,#0a0f1e_0%,#0f1a3a_55%,#0a0f1e_100%)] text-fg lg:hidden"
        >
          <DotGrid className="mask-fade-b opacity-40" />
          <Aurora intensity={0.7} />
          <Noise />

          <div className="relative flex items-center gap-3 px-4 pb-4 pt-[max(env(safe-area-inset-top),16px)]">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-800 ring-hairline">
              <LogoMark size={30} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[22px] font-semibold leading-tight tracking-tight">Rankframe</div>
              <div className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                <Sparkles className="size-3.5 text-signal" aria-hidden /> SEO lab · modeled, labeled as such
              </div>
            </div>
            <MarketSwitch market={market} onChange={onMarket} compact />
            <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/8 text-fg ring-hairline hover:bg-white/12" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>

          <motion.div variants={list} initial="hidden" animate="show" className="relative space-y-4 px-4 pb-6">
            <motion.div variants={item}>
              <Link
                to="/app"
                onClick={onClose}
                className="flex items-center gap-4 rounded-3xl bg-[linear-gradient(105deg,#c7ff3b_0%,#9fe86a_35%,#7c9bff_75%,#22d3ee_100%)] p-4 text-ink-900 shadow-[0_24px_60px_-24px_rgba(124,155,255,0.6)] transition-transform active:scale-[0.99]"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-ink-900/12">
                  <Sparkles className="size-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[24px] font-semibold leading-tight tracking-tight">Run the lab</span>
                  <span className="block text-[15px] text-ink-900/75">Paste a URL. See page one in 60 seconds.</span>
                </span>
                <ArrowRight className="size-6 shrink-0" />
              </Link>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-3 gap-2.5">
              {MENU_CHIPS.map((c) => (
                <Link
                  key={c.tab}
                  to="/app"
                  search={{ tab: c.tab, demo: true }}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-[76px] flex-col items-center justify-center rounded-3xl px-2 py-3 text-center transition-colors",
                    c.accent ? "bg-signal text-ink-900" : "bg-white/8 text-fg ring-hairline hover:bg-white/12",
                  )}
                >
                  <span className="text-[15px] font-semibold leading-tight">{c.label}</span>
                  <span className={cn("mt-1 text-[11px] leading-snug", c.accent ? "text-ink-900/70" : "text-fg-muted")}>{c.hint}</span>
                </Link>
              ))}
            </motion.div>

            <motion.div variants={item} className="pt-2 font-mono text-[12px] tracking-[0.2em] text-fg-muted uppercase">
              Explore
            </motion.div>

            {PILLARS.map((p) => {
              const Icon = p.icon;
              const body = (
                <>
                  <span className="relative w-[96px] shrink-0 self-stretch overflow-hidden">
                    <MenuArt kind={p.art} />
                  </span>
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-signal/15 text-signal ring-1 ring-inset ring-signal/25">
                    <Icon className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1 py-3">
                    <span className="block font-display text-[22px] font-semibold leading-tight tracking-tight">{p.label}</span>
                    <span className="line-clamp-2 block text-[13px] leading-snug text-fg-muted">{p.hint}</span>
                    <span className="mt-1 block text-[12px] font-semibold text-signal">{p.count}</span>
                  </span>
                </>
              );
              const rowClass = "flex w-full items-center gap-3 overflow-hidden rounded-3xl bg-white/6 pr-3 text-left ring-hairline transition-colors hover:bg-white/10";
              if (p.id === "product") {
                return (
                  <motion.div key={p.id} variants={item}>
                    <button type="button" onClick={() => setProductOpen((v) => !v)} aria-expanded={productOpen} className={rowClass}>
                      {body}
                      <ChevronDown className={cn("size-5 shrink-0 text-fg-muted transition-transform duration-200", productOpen && "rotate-180")} aria-hidden />
                    </button>
                    {productOpen && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {PRODUCT_NAV.map((t) => {
                          const TabIcon = PRODUCT_ICONS[t.tab];
                          return (
                            <Link key={t.tab} to="/app" search={{ tab: t.tab, demo: true }} onClick={onClose} className="flex items-center gap-2.5 rounded-2xl bg-white/6 px-3 py-3 text-[14px] font-medium ring-hairline hover:bg-white/10">
                              <TabIcon className="size-4 shrink-0 text-signal" />
                              {t.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              }
              return (
                <motion.div key={p.id} variants={item}>
                  <Link to={p.to} hash={p.hash} onClick={onClose} className={rowClass}>
                    {body}
                    <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="relative mt-auto flex items-center justify-center gap-3 border-t border-white/8 bg-ink-950/60 px-4 py-4 pb-[max(env(safe-area-inset-bottom),16px)] text-[14px] text-fg-muted">
            <Link to="/login" onClick={onClose} className="hover:text-fg">
              Sign in
            </Link>
            <span aria-hidden>·</span>
            {LINKS.github ? (
              <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-fg">
                GitHub
              </a>
            ) : (
              <Link to="/terms" onClick={onClose} className="hover:text-fg">
                Terms
              </Link>
            )}
            <span aria-hidden>·</span>
            <Link to="/privacy" onClick={onClose} className="hover:text-fg">
              Privacy
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
