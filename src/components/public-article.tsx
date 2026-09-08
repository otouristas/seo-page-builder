import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "./marketing";
import { SectionLabel, ButtonLink } from "./ui";
import { Maki } from "./maki";
import type { PublicArticle } from "@/lib/content";
export function PublicArticlePage({
  article,
  feature = false,
}: {
  article: PublicArticle;
  feature?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="article-hero container">
          <div>
            <SectionLabel>{article.kicker}</SectionLabel>
            <h1>{article.title}</h1>
            <p>{article.lead}</p>
            {feature && (
              <div className="toolbar">
                <ButtonLink href="/tools/seo-audit">
                  Get your free first audit <ArrowUpRight size={15} />
                </ButtonLink>
                <ButtonLink href="/demo" variant="ghost">
                  Explore the example <ArrowRight size={14} />
                </ButtonLink>
              </div>
            )}
          </div>
          <Maki pose={feature ? "wave" : "thinking"} />
        </div>
        <article className="article public-article">
          <nav className="article-toc" aria-label="On this page">
            <strong>ON THIS PAGE</strong>
            {article.sections.map((s, i) => (
              <a key={s.title} href={`#section-${i + 1}`}>
                {s.title}
              </a>
            ))}
          </nav>
          {article.sections.map((s, i) => (
            <section id={`section-${i + 1}`} key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 60)}>{p}</p>
              ))}
              {s.items && (
                <ul>
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="article-related">
            <Link href="/methodology">
              Read our methodology <ArrowUpRight size={14} />
            </Link>
            <Link href="/help">
              Visit the help menu <ArrowUpRight size={14} />
            </Link>
            <a href="mailto:anotherseoguru@gmail.com">
              Contact support <ArrowUpRight size={14} />
            </a>
            <Link href="/tools">
              Try the free tools <ArrowUpRight size={14} />
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
