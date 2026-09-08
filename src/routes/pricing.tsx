import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/marketing/site-header";
import { PricingTable } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Band } from "@/components/patterns";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Access — Rankframe" }, { name: "description", content: "The lab is free. Sign in to pull live Google results and keep Search Console imports." }] }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="paper min-h-dvh">
      <SiteHeader tone="paper" />
      <main>
        <Band paper>
          <PricingTable full />
          <Faq />
        </Band>
        <Band>
          <CtaBand />
        </Band>
      </main>
      <SiteFooter />
    </div>
  );
}
