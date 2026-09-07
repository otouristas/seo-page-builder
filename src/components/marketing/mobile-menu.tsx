import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LINKS, PRODUCT_NAV } from "@/lib/marketing/links";
import { PRODUCT_INDICATORS } from "@/lib/marketing/indicators";
import { PILLARS, PRODUCT_ICONS } from "@/lib/marketing/nav";
import { Aurora, DotGrid, Noise } from "@/components/patterns";
import { Logo } from "./logo";

function PillarLabel({ index, label, hint }: { index: string; label: string; hint: string }) {
  return (
    <span className="flex items-baseline gap-4">
      <span className="w-6 font-mono text-[11px] tracking-[0.2em] text-signal">{index}</span>
      <span>
        <span className="block font-display text-[28px] font-semibold leading-none tracking-tight text-fg">{label}</span>
        <span className="mt-1.5 block text-[12px] text-fg-muted">{hint}</span>
      </span>
    </span>
  );
}

/** Full-screen, edge-to-edge menu: numbered pillars, the product tabs, marketing indicators, CTAs. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [productOpen, setProductOpen] = useState(true);

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

  const list = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.045, delayChildren: reduce ? 0 : 0.04 } } };
  const row = { hidden: { opacity: 0, y: reduce ? 0 : 10 }, show: { opacity: 1, y: 0 } };

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
          className="ink fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden"
        >
          <DotGrid className="mask-fade-b opacity-50" />
          <Aurora intensity={0.6} />
          <Noise />

          <div className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-white/8 pl-5">
            <Logo />
            <button type="button" onClick={onClose} className="grid h-full w-[72px] place-items-center border-l border-white/8 text-fg hover:bg-white/5" aria-label="Close menu">
              <X className="size-6" />
            </button>
          </div>

          <motion.nav variants={list} initial="hidden" animate="show" className="relative" aria-label="Primary">
            {PILLARS.map((p) =>
              p.id === "product" ? (
                <motion.div key={p.id} variants={row} className="border-b border-white/8">
                  <button type="button" onClick={() => setProductOpen((v) => !v)} aria-expanded={productOpen} className="flex w-full items-center justify-between px-5 py-5 text-left">
                    <PillarLabel index={p.index} label={p.label} hint={p.hint} />
                    <ChevronDown className={cn("size-5 shrink-0 text-fg-subtle transition-transform duration-200", productOpen && "rotate-180")} aria-hidden />
                  </button>
                  {productOpen && (
                    <div className="grid grid-cols-2 border-t border-white/8">
                      {PRODUCT_NAV.map((item, i) => {
                        const Icon = PRODUCT_ICONS[item.tab];
                        return (
                          <Link
                            key={item.tab}
                            to="/app"
                            search={{ tab: item.tab, demo: true }}
                            onClick={onClose}
                            className={cn("flex items-center gap-3 px-5 py-4 text-[14px] font-medium transition-colors hover:bg-white/5", i % 2 === 0 && "border-r border-white/8", i < PRODUCT_NAV.length - 2 && "border-b border-white/8")}
                          >
                            <Icon className="size-4 shrink-0 text-signal" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key={p.id} variants={row} className="border-b border-white/8">
                  <Link to={p.to} hash={p.hash} onClick={onClose} className="flex items-center justify-between px-5 py-5 transition-colors hover:bg-white/5">
                    <PillarLabel index={p.index} label={p.label} hint={p.hint} />
                    <ArrowUpRight className="size-5 shrink-0 text-fg-subtle" aria-hidden />
                  </Link>
                </motion.div>
              ),
            )}
          </motion.nav>

          <section aria-label="Marketing indicators" className="relative border-b border-white/8">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-mono text-[10px] tracking-[0.18em] text-fg-subtle uppercase">What you get</span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-fg-subtle uppercase">Free · no card</span>
            </div>
            <div className="grid grid-cols-2 border-t border-white/8">
              {PRODUCT_INDICATORS.map((p, i) => (
                <div key={p.label} className={cn("border-b border-white/8 px-5 py-4", i % 2 === 0 && "border-r border-white/8")}>
                  <div className="font-display text-[34px] font-semibold leading-none tracking-tight text-signal tabular">{p.value}</div>
                  <div className="mt-2 text-[13px] font-medium">{p.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-fg-muted">{p.hint}</div>
                </div>
              ))}
              <div className="border-b border-white/8 bg-white/3 px-5 py-4">
                <div className="font-display text-[34px] font-semibold leading-none tracking-tight text-peri">GR · US</div>
                <div className="mt-2 text-[13px] font-medium">two markets</div>
                <div className="mt-0.5 text-[11px] leading-snug text-fg-muted">positions modeled and labeled as such</div>
              </div>
            </div>
          </section>

          <div className="relative grid gap-3 px-5 py-5">
            <Link to="/app" onClick={onClose} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-signal text-[16px] font-semibold text-ink-900 transition-colors hover:bg-signal-600">
              Try it free <ArrowRight className="size-4" />
            </Link>
            <Link to="/login" onClick={onClose} className="flex h-14 items-center justify-center rounded-2xl border border-white/15 text-[16px] font-medium text-fg transition-colors hover:border-white/30">
              Sign in
            </Link>
          </div>

          <div className="relative mt-auto flex items-center justify-between gap-4 border-t border-white/8 px-5 py-4 text-[12px] text-fg-subtle">
            <span>Not affiliated with Google.</span>
            <span className="flex items-center gap-4">
              {LINKS.x && (
                <a href={LINKS.x} target="_blank" rel="noreferrer" className="hover:text-fg">
                  X
                </a>
              )}
              {LINKS.github && (
                <a href={LINKS.github} target="_blank" rel="noreferrer" className="hover:text-fg">
                  GitHub
                </a>
              )}
              <Link to="/privacy" onClick={onClose} className="hover:text-fg">
                Privacy
              </Link>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
