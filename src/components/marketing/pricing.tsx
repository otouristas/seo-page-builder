import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

type Plan = {
  name: string;
  tagline: string;
  features: [string, boolean][];
  cta: "app" | "login";
  ctaLabel: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Guest",
    tagline: "The whole lab, in this browser.",
    features: [
      ["Unlimited URL analyses", true],
      ["Weighted on-page checks with fix copy", true],
      ["Modeled SERP scenes and plays", true],
      ["14 markets, language-aware copy", true],
      ["Shareable scenes (plays in the URL)", true],
      ["Recent analyses on this browser", true],
      ["GSC import for the session", true],
      ["Live page one via DataForSEO", false],
      ["Saved Search Console data", false],
    ],
    cta: "app",
    ctaLabel: "Open the lab",
  },
  {
    name: "Signed in",
    tagline: "Verify against live Google. Keep your export.",
    features: [
      ["Everything in Guest", true],
      ["8 live SERP lookups a day", true],
      ["Saved Search Console imports", true],
      ["Same 14 markets", true],
      ["No card required", true],
    ],
    cta: "login",
    ctaLabel: "Sign in",
    featured: true,
  },
];

export function PricingTable({ full }: { full?: boolean }) {
  return (
    <div id="pricing" className={cn("border-t border-ink-900/8", full ? "py-16" : "py-24")}>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow tone="paper">Access</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance sm:text-5xl">The lab is free. Sign in to verify and to keep Search Console.</h2>
          <p className="mt-4 text-lg text-paper-muted">No paid plans. Sign-in unlocks live page-one lookups and saved GSC rows — nothing else is locked.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.name} className={cn("relative flex flex-col rounded-3xl p-7 ring-hairline-paper", p.featured ? "bg-ink-900 text-fg shadow-stage" : "bg-white text-ink-900 shadow-paper")}>
              {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-signal px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-ink-900 uppercase">Keep and verify</span>}
              <div className="font-display text-xl font-semibold tracking-tight">{p.name}</div>
              <div className={cn("mt-1 text-[14px]", p.featured ? "text-fg-muted" : "text-paper-muted")}>{p.tagline}</div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map(([f, on]) => (
                  <li key={f} className={cn("flex items-start gap-2.5 text-[14px]", !on && (p.featured ? "text-fg-subtle" : "text-paper-muted/70"))}>
                    {on ? <Check className={cn("mt-0.5 size-4 shrink-0", p.featured ? "text-signal" : "text-[#0b7a4b]")} /> : <Minus className="mt-0.5 size-4 shrink-0 opacity-50" />}
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink to={p.cta === "app" ? "/app" : "/login"} variant={p.featured ? "primary" : "paper"} size="lg" className="w-full">
                  {p.ctaLabel}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-paper-muted">Live lookups count per signed-in user per day and reset at midnight UTC. Markets: US, UK, CA, AU, IN, DE, FR, ES, IT, NL, GR, BR, MX, AE.</p>
      </Container>
    </div>
  );
}
