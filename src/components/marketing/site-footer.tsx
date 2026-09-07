import { Link } from "@tanstack/react-router";
import { Container } from "@/components/patterns";
import { Logo } from "./logo";
import { LINKS, PRODUCT_NAV } from "@/lib/marketing/links";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/8 bg-ink-950">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-fg-muted">An SEO lab: audit, a Google-like SERP scene, and the plays that move you. Modeled positions are labeled modeled. Live results come from DataForSEO.</p>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Product</div>
          <ul className="mt-3 space-y-2 text-[14px]">
            {PRODUCT_NAV.map((p) => (
              <li key={p.tab}>
                <Link to="/app" search={{ tab: p.tab, demo: true }} className="text-fg-muted hover:text-fg">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Company</div>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li>
              <Link to="/" hash="case-studies" className="text-fg-muted hover:text-fg">
                Case studies
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-fg-muted hover:text-fg">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/" hash="faq" className="text-fg-muted hover:text-fg">
                FAQ
              </Link>
            </li>
            {LINKS.github && (
              <li>
                <a href={LINKS.github} target="_blank" rel="noreferrer" className="text-fg-muted hover:text-fg">
                  GitHub
                </a>
              </li>
            )}
            {LINKS.x && (
              <li>
                <a href={LINKS.x} target="_blank" rel="noreferrer" className="text-fg-muted hover:text-fg">
                  X
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">Legal</div>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li>
              <Link to="/privacy" className="text-fg-muted hover:text-fg">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-fg-muted hover:text-fg">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-fg-muted hover:text-fg">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 py-6 text-[12px] text-fg-subtle">
        <span>© {year} Rankframe. Not affiliated with Google. Google is a trademark of Google LLC.</span>
        <span>Greece · United States</span>
      </Container>
    </footer>
  );
}
