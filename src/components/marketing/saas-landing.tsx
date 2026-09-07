import { Band } from "@/components/patterns";
import { SiteHeader } from "./site-header";
import { Hero } from "./hero";
import { Indicators } from "./indicators";
import { LogoStrip } from "./logo-strip";
import { FeatureBento } from "./feature-bento";
import { HowItWorks } from "./how-it-works";
import { LiveDemo } from "./live-demo";
import { CaseStudies } from "./case-studies";
import { Testimonials } from "./testimonials";
import { PricingTable } from "./pricing";
import { Faq } from "./faq";
import { CtaBand } from "./cta-band";
import { SiteFooter } from "./site-footer";
import { MobileCta } from "./mobile-cta";

export function SaasLanding() {
  return (
    <div className="ink pb-20 lg:pb-0">
      <SiteHeader />
      <main>
        <Band>
          <Hero />
          <Indicators />
          <LogoStrip />
        </Band>
        <Band paper>
          <FeatureBento />
          <HowItWorks />
        </Band>
        <Band>
          <LiveDemo />
        </Band>
        <Band paper>
          <CaseStudies />
        </Band>
        <Band>
          <Testimonials />
        </Band>
        <Band paper>
          <PricingTable />
          <Faq />
        </Band>
        <Band>
          <CtaBand />
        </Band>
      </main>
      <SiteFooter />
      <MobileCta />
    </div>
  );
}
