import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/patterns";
import { Eyebrow } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { LINKS } from "@/lib/marketing/links";

type Plan = {
  name: string;
  monthly: number | null;
  yearly: number | null;
  tagline: string;
  features: [string, boolean][];
  cta: "app" | "login" | "contact";
  ctaLabel: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "The whole lab, as a guest.",
    features: [
      ["Unlimited URL analyses", true],
      ["12 on-page checks with fix copy", true],
      ["Modeled SERP scenes and plays", true],
      ["Keyword staging and coach", true],
      ["GSC import (session only)", true],
      ["Live page one via DataForSEO", false],
      ["Saved Search Console data", false],
    ],
    cta: "app",
    ctaLabel: "Open the lab",
  },
  {
    name: "Pro",
    monthly: 29,
    yearly: 24,
    tagline: "Sign in, keep your data, check the field.",
    features: [
      ["Everything in Free", true],
      ["8 live SERP lookups a day", true],
      ["Saved Search Console imports", true],
      ["Greece and US markets", true],
      ["Shareable scene snapshots", true],
      ["Priority fixes and requests", true],
      ["Team workspaces", false],
    ],
    cta: "login",
    ctaLabel: "Sign in to start",
    featured: true,
  },
  {
    name: "Team",
    monthly: 99,
    yearly: 84,
    tagline: "Agencies and in-house teams.",
    features: [
      ["Everything in Pro", true],
      ["Shared workspaces and roles", true],
      ["Higher live SERP limits", true],
      ["White-label case-study pages", true],
      ["Onboarding call", true],
      ["Invoice billing", true],
      ["Custom markets on request", true],
    ],
    cta: "contact",
    ctaLabel: "Talk to us",
  },
];

export function PricingTable({ full }: { full?: boolean }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");
  return (
    <div id="pricing" className={cn("border-t border-ink-900/8", full ? "py-16" : "py-24")}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow tone="paper">Pricing</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 text-balance sm:text-5xl">Free to run. Pay to keep and to verify.</h2>
            <p className="mt-4 text-lg text-paper-muted">The lab never asks for a card. Paid plans add persistence and live Google results.</p>
          </div>
          <Segmented
            paper
            size="md"
            layoutId="pricing-period"
            ariaLabel="Billing period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: <>Yearly <span className="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[10px] text-ink-900">-17%</span></> },
            ]}
          />
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p) => {
            const price = period === "monthly" ? p.monthly : p.yearly;
            return (
              <div key={p.name} className={cn("relative flex flex-col rounded-3xl p-7 ring-hairline-paper", p.featured ? "bg-ink-900 text-fg shadow-stage" : "bg-white text-ink-900 shadow-paper")}>
                {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-signal px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-ink-900 uppercase">Most useful</span>}
                <div className="font-display text-xl font-semibold tracking-tight">{p.name}</div>
                <div className={cn("mt-1 text-[14px]", p.featured ? "text-fg-muted" : "text-paper-muted")}>{p.tagline}</div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-semibold tracking-tight tabular">{price === null ? "Custom" : `€${price}`}</span>
                  {price !== null && price > 0 && <span className={cn("text-[14px]", p.featured ? "text-fg-muted" : "text-paper-muted")}>/ month{period === "yearly" ? ", billed yearly" : ""}</span>}
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map(([f, on]) => (
                    <li key={f} className={cn("flex items-start gap-2.5 text-[14px]", !on && (p.featured ? "text-fg-subtle" : "text-paper-muted/70"))}>
                      {on ? <Check className={cn("mt-0.5 size-4 shrink-0", p.featured ? "text-signal" : "text-[#0b7a4b]")} /> : <Minus className="mt-0.5 size-4 shrink-0 opacity-50" />}
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {p.cta === "contact" ? (
                    <ButtonAnchor href={`mailto:${LINKS.email}?subject=Rankframe%20Team`} variant="paper-outline" size="lg" className="w-full">
                      {p.ctaLabel}
                    </ButtonAnchor>
                  ) : (
                    <ButtonLink to={p.cta === "app" ? "/app" : "/login"} variant={p.featured ? "primary" : "paper"} size="lg" className="w-full">
                      {p.ctaLabel}
                    </ButtonLink>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[13px] text-paper-muted">Prices in EUR, VAT excluded. Live lookups count per signed-in user per day and reset at midnight UTC.</p>
      </Container>
    </div>
  );
}
