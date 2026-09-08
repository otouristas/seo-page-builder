import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/marketing";
import { SectionLabel } from "@/components/ui";
import { publicPages } from "@/lib/public-pages";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "A little map of RankSushi",
  "Explore RankSushi features, practical SEO guides, blog articles, help, free tools, and public discovery resources.",
  "/sitemap",
);
export default function Page() {
  const pages = publicPages(),
    groups = [...new Set(pages.map((p) => p.group))];
  return (
    <>
      <SiteHeader />
      <main id="main" className="container sitemap-page">
        <SectionLabel>EVERYTHING IN ITS PLACE</SectionLabel>
        <h1>
          A little map.
          <br />
          Plenty to explore.
        </h1>
        <p>
          Find the right corner of the kitchen. Your private workspace and
          reports stay outside this public directory.
        </p>
        <div className="sitemap-groups">
          {groups.map((group) => (
            <section key={group}>
              <h2>{group}</h2>
              <ul>
                {pages
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <li key={p.path}>
                      <Link href={p.path}>
                        {p.title}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="sitemap-files">
          <a href="/sitemap.xml">XML sitemap</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="/feed.xml">RSS feed</a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
