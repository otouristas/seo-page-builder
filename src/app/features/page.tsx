import Link from "next/link";
import {
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  ArrowUpRight,
} from "lucide-react";
import { FEATURES } from "@/lib/content";
import { SiteHeader, SiteFooter, ProductPreview } from "@/components/marketing";
import { SectionLabel } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "The RankSushi menu",
  "Website audits, Search Console insights, reviewed content drafts and sampled AI answers. A useful workflow for your next SEO improvement.",
  "/features",
);
export default function Features() {
  const icons = [ScanLine, ChartNoAxesCombined, PenLine, Orbit];
  return (
    <>
      <SiteHeader />
      <main id="main" className="container">
        <header className="public-heading">
          <SectionLabel>A FEW GOOD INGREDIENTS</SectionLabel>
          <h1>
            A clearer picture.
            <br />A more useful next step.
          </h1>
          <p>
            One workspace for understanding your website, preparing changes, and
            checking what happened next.
          </p>
        </header>
        <div className="features-menu">
          {Object.entries(FEATURES).map(([slug, a], i) => {
            const Icon = icons[i];
            return (
              <Link
                className="feature-menu-card"
                href={`/features/${slug}`}
                key={slug}
              >
                <Icon size={25} />
                <h2>{a.title}</h2>
                <p>{a.lead}</p>
                <span>
                  Explore this feature <ArrowUpRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
        <div style={{ marginBottom: 80 }}>
          <ProductPreview />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
