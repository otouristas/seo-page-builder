import { Mail, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/marketing/testimonials";
import { LINKS } from "@/lib/marketing/links";
import { Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.2 8.2L23.3 22h-6.6l-5.2-6.8L5.6 22H2.5l7.7-8.8L1.5 2h6.7l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
    </svg>
  );
}

export function Testimonials() {
  const community = [
    { label: "Follow on X", href: LINKS.x, icon: XIcon },
    { label: "Source on GitHub", href: LINKS.github, icon: GithubIcon },
    { label: "Email the maker", href: LINKS.email ? `mailto:${LINKS.email}` : "", icon: Mail },
  ].filter((c) => c.href);

  return (
    <div className="border-t border-white/8 py-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What people say</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance">Built in public. Quotes go here as they come in.</h2>
          <p className="mt-4 text-fg-muted">Sample quotes below are placeholders and are labeled as such until real, attributed feedback replaces them.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.quote} className="relative rounded-3xl bg-ink-800/70 p-6 shadow-card ring-hairline">
              {t.placeholder && <span className="absolute right-4 top-4 rounded-full bg-warn/15 px-2 py-0.5 font-mono text-[10px] tracking-wider text-warn uppercase">Sample</span>}
              <Quote className="size-5 text-signal" aria-hidden />
              <blockquote className="mt-3 text-[15px] leading-relaxed text-fg">{t.quote}</blockquote>
              <figcaption className="mt-4 text-[13px] text-fg-muted">
                <span className="font-medium text-fg">{t.name}</span> · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
        {community.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {community.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:border-white/25 hover:text-fg">
                <c.icon className="size-4" /> {c.label}
              </a>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
