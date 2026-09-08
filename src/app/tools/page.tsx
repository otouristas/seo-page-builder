import Link from "next/link";
import { ScanLine, Search, Code2, ArrowUpRight } from "lucide-react";
import { TOOL_PAGES } from "@/lib/content";
import { SiteHeader, SiteFooter } from "@/components/marketing";
import { SectionLabel } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Free tools for your next useful SEO fix",
  "Audit a public page, preview search metadata, and check JSON-LD structured data with RankSushi’s free tools. Clear evidence, practical next steps.",
  "/tools",
);
export default function Tools() {
  const icons = [ScanLine, Search, Code2];
  return (
    <>
      <SiteHeader />
      <main id="main" className="container">
        <header className="public-heading">
          <SectionLabel>A LITTLE SOMETHING ON THE HOUSE</SectionLabel>
          <h1>
            Small tools.
            <br />
            Useful little discoveries.
          </h1>
          <p>
            Check a page, shape a clearer search snippet, or inspect your
            markup. No card required.
          </p>
        </header>
        <div className="tools-menu">
          {Object.entries(TOOL_PAGES).map(([slug, a], i) => {
            const Icon = icons[i];
            return (
              <Link
                href={`/tools/${slug}`}
                className="feature-menu-card"
                key={slug}
              >
                <Icon size={26} />
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <span>
                  Give it a try <ArrowUpRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="tools-privacy-note">
          Metadata and structured-data previews run in your browser. The page
          audit fetches the public website you submit and retains unclaimed
          evidence for one hour.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
