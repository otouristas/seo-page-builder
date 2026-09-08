import {
  SiteHeader,
  SiteFooter,
  PricingCards,
  FAQS,
} from "@/components/marketing";
import { SectionLabel } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Simple pricing for every appetite",
  "Try RankSushi for $1 for 3 days with limited usage, then Maki $29, Nigiri $79 or Omakase $149 per month. Shared workspace allowances for audits, drafts, AI answer checks and SERP lookups. No automatic overages.",
  "/pricing",
);
export default function Pricing() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container">
        <header className="public-heading">
          <SectionLabel>SOMETHING FOR EVERY APPETITE</SectionLabel>
          <h1>
            A little investment.
            <br />A clearer direction.
          </h1>
          <p>
            Start with a $1, three-day trial. Choose your monthly plan for what
            comes next.
          </p>
        </header>
        <h2 className="sr-only">Monthly subscription plans</h2>
        <PricingCards />
        <div className="pricing-explainer">
          <h2>What counts as a bite?</h2>
          <div className="two-col">
            <div>
              <h3>Crawled pages</h3>
              <p>
                Each inspected page uses a page credit. Recrawls, live rechecks,
                and scheduled scans share this allowance. A completed bounded
                crawl releases unused reserved pages.
              </p>
              <h3>Drafting actions</h3>
              <p>
                One action creates one bounded deliverable or coach response.
                You can edit saved drafts and export your work without another
                generation action.
              </p>
            </div>
            <div>
              <h3>Answer checks and SERPs</h3>
              <p>
                An answer check runs one prompt against one provider. A SERP
                lookup retrieves one query in your selected supported market.
                These are separate allowances.
              </p>
              <h3>Your next billing period</h3>
              <p>
                Plan changes and cancellation take effect at renewal. When paid
                access ends, existing results remain available in read-only
                mode. No automatic overages or credit packs.
              </p>
            </div>
          </div>
        </div>
        <div className="faq-list pricing-faq">
          {FAQS.slice(2).map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
