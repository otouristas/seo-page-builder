"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Menu,
  X,
} from "lucide-react";
import { Logo, Maki } from "./maki";

const navigation = [
  { href: "/features", label: "Features", note: "Find it. Fix it. Follow it." },
  {
    href: "/learn",
    label: "SEO kitchen",
    note: "Practical guides, with sources",
  },
  { href: "/blog", label: "Fresh reads", note: "Ideas worth taking a bite of" },
  { href: "/pricing", label: "Pricing", note: "Clear plans. Visible limits." },
  { href: "/help", label: "Help center", note: "A hand when you need one" },
];

export function SiteHeader() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1051px)");
    const onResize = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header className="site-header-shell">
      <div className="pill-header">
        <Link href="/" aria-label="RankSushi home">
          <Logo />
        </Link>
        <nav className="pill-navigation" aria-label="Main navigation">
          {navigation.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="pill-actions">
          <Link href="/login" className="pill-login">
            Log in
          </Link>
          <Link href="/tools/seo-audit" className="button primary pill-cta">
            Free audit <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <button
            className="menu-toggle"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-site-menu"
            ref={opener}
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
          >
            <Menu size={21} aria-hidden="true" />
          </button>
        </div>
      </div>
      <dialog
        className="mobile-site-menu"
        id="mobile-site-menu"
        ref={dialog}
        aria-labelledby="mobile-menu-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const items = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href], button:not(:disabled)",
            ),
          ).filter((el) => el.getClientRects().length > 0);
          const first = items[0],
            last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => {
          setOpen(false);
          opener.current?.focus();
        }}
      >
        <div className="mobile-menu-top">
          <Link href="/" aria-label="RankSushi home" onClick={close}>
            <Logo />
          </Link>
          <button
            className="menu-close"
            aria-label="Close navigation"
            onClick={close}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="mobile-menu-content">
          <div className="menu-intro">
            <span className="eyebrow" id="mobile-menu-title">
              GOOD THINGS ON THE MENU
            </span>
            <span className="menu-indicator">
              <span aria-hidden="true" /> Made for your next move
            </span>
          </div>
          <nav aria-label="Mobile navigation" className="mobile-menu-links">
            {navigation.map(({ href, label, note }, i) => (
              <Link key={href} href={href} onClick={close}>
                <span className="menu-number">0{i + 1}</span>
                <span>
                  <strong>{label}</strong>
                  <small>{note}</small>
                </span>
                <ArrowUpRight aria-hidden="true" size={23} />
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-promo">
            <div>
              <BookOpen size={20} aria-hidden="true" />
              <h2>A little less guesswork.</h2>
              <p>Find one useful thing to improve today.</p>
              <Link href="/demo" onClick={close}>
                Take a look inside <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <Maki pose="wave" />
          </div>
          <div className="mobile-menu-bottom">
            <div className="menu-benefits">
              <span>
                <Check size={14} aria-hidden="true" /> Free page audit
              </span>
              <span>
                <Check size={14} aria-hidden="true" /> No card required
              </span>
              <span>
                <Check size={14} aria-hidden="true" /> You approve every change
              </span>
            </div>
            <Link
              href="/tools/seo-audit"
              onClick={close}
              className="button primary full"
            >
              Find my next bite <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <p>
              Already at the table?{" "}
              <Link href="/login" onClick={close}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
