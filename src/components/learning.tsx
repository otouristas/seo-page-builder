import { CopyActions } from "./copy-actions";
import { articleMarkdown } from "@/lib/learning/exports";
import { guidePrompt } from "@/lib/learning/doc-prompts";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  Rss,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "./marketing";
import { Maki } from "./maki";
import { SectionLabel, ButtonLink } from "./ui";
import { LearningLibrary } from "./learning-library";
import {
  COLLECTIONS,
  SOURCES,
  readingMinutes,
  type Collection,
  type LearningArticle,
} from "@/lib/learning/content";
import { CANONICAL_URL } from "@/lib/utils";
const labels = {
  learn: "The SEO kitchen",
  blog: "Fresh reads",
  help: "Help center",
};
const copy = {
  learn: {
    kicker: "GOOD SEO STARTS WITH GOOD INGREDIENTS",
    title: "A little knowledge.\nA much clearer next move.",
    description:
      "Practical SEO, AEO, and GEO guides. Clear methods, useful checklists, and sources you can inspect. Take what you need. Put it to work.",
    search: "Search guides, questions, or topics",
    pose: "thinking" as const,
  },
  blog: {
    kicker: "FRESH FROM THE KITCHEN",
    title: "Less hot air.\nMore food for thought.",
    description:
      "Ideas for doing useful work in search and AI. A little perspective, a practical next step, and no secret ranking sauce.",
    search: "Search the blog",
    pose: "wave" as const,
  },
  help: {
    kicker: "WE ALL NEED A HAND SOMETIMES",
    title: "A little stuck?\nLet’s get you rolling.",
    description:
      "From your first audit to your next report. Find clear steps, understand your data, and get back to the work that matters.",
    search: "Search help: Google, drafts, reports…",
    pose: "wave" as const,
  },
};
export function LearningIndex({ collection }: { collection: Collection }) {
  const c = copy[collection],
    articles = COLLECTIONS[collection];
  return (
    <>
      <SiteHeader />
      <main id="main" className="learning-main">
        <section className="learning-hero container">
          <div>
            <SectionLabel>{c.kicker}</SectionLabel>
            <h1>
              {c.title.split("\n").map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
            <p>{c.description}</p>
            <div className="learning-indicators">
              <span>
                <BookOpen size={14} aria-hidden="true" />
                {articles.length}{" "}
                {collection === "learn"
                  ? "practical guides"
                  : collection === "help"
                    ? "help articles"
                    : "fresh reads"}
              </span>
              <span>
                <Check size={14} aria-hidden="true" />
                Free to read
              </span>
              <span>
                <Check size={14} aria-hidden="true" />
                Useful takeaways
              </span>
            </div>
          </div>
          <div className="learning-mascot">
            <Maki pose={c.pose} />
            <span>
              One good idea
              <br />
              at a time.
            </span>
          </div>
        </section>
        <div className="container learning-body">
          <nav className="learning-tabs" aria-label="Learning resources">
            {Object.entries(labels).map(([key, label]) => (
              <Link
                key={key}
                href={`/${key}`}
                aria-current={collection === key ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
            <a href="/feed.xml" aria-label="Subscribe to the blog RSS feed">
              <Rss size={15} aria-hidden="true" /> RSS
            </a>
          </nav>
          {collection === "learn" && (
            <div className="learning-start">
              <span className="learning-start-icon">
                <BookOpen size={25} />
              </span>
              <div>
                <span className="eyebrow">NEW HERE? START SMALL.</span>
                <h2>Your next three bites</h2>
                <p>
                  Understand the page. Pick one improvement. Check what changed.
                </p>
              </div>
              <Link href="/learn/technical-triage">
                Start with audit triage{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
          <LearningLibrary
            label={c.search}
            entries={articles.map((a) => ({
              href: `/${collection}/${a.slug}`,
              title: a.title,
              description: a.description,
              category: a.category,
              minutes: readingMinutes(a),
              tags: a.tags,
            }))}
          />
          <div className="learning-support">
            <Maki pose="happy" />
            <div>
              <h2>
                {collection === "help"
                  ? "Still need a hand?"
                  : "Put a good idea to work."}
              </h2>
              <p>
                {collection === "help"
                  ? "Tell us what you were trying to do and the message you saw. Keep passwords and private links to yourself."
                  : "Start with one page. See the evidence, decide what matters, and prepare your next useful change."}
              </p>
            </div>
            <ButtonLink
              href={
                collection === "help"
                  ? "mailto:anotherseoguru@gmail.com"
                  : "/tools/seo-audit"
              }
            >
              {collection === "help" ? "Contact support" : "Get a free taste"}
              <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
export function LearningArticlePage({
  article: a,
  collection,
}: {
  article: LearningArticle;
  collection: Collection;
}) {
  const path = `/${collection}/${a.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": collection === "blog" ? "BlogPosting" : "TechArticle",
        "@id": `${CANONICAL_URL}${path}#article`,
        headline: a.title,
        description: a.description,
        datePublished: a.updated,
        dateModified: a.updated,
        inLanguage: "en",
        author: {
          "@type": "Organization",
          name: "RankSushi",
          url: CANONICAL_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "Touristas Technologies",
          url: CANONICAL_URL,
        },
        mainEntityOfPage: `${CANONICAL_URL}${path}`,
        image: `${CANONICAL_URL}/opengraph-image`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "RankSushi",
            item: CANONICAL_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: labels[collection],
            item: `${CANONICAL_URL}/${collection}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: a.title,
            item: `${CANONICAL_URL}${path}`,
          },
        ],
      },
    ],
  };
  return (
    <>
      <SiteHeader />
      <main id="main" className="learning-main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
          }}
        />
        <div className="container reading-hero">
          <nav aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${collection}`}>{labels[collection]}</Link>
            <span aria-hidden="true">/</span>
            <span>{a.category}</span>
          </nav>
          <SectionLabel>{a.category}</SectionLabel>
          <div className="reading-title-actions">
            <h1>{a.title}</h1>
            <CopyActions
              text={articleMarkdown(a, collection)}
              prompt={guidePrompt(a, collection)}
              steps={articleMarkdown(a, collection, true)}
              markdownUrl={`${path}/index.md`}
              filename={`ranksushi-${a.slug}.md`}
            />
          </div>
          <p className="reading-description">{a.description}</p>
          <div className="reading-byline">
            <span>By RankSushi · Touristas Technologies</span>
            <span>
              Updated{" "}
              <time dateTime={a.updated}>
                {new Date(`${a.updated}T12:00:00Z`).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )}
              </time>
            </span>
            <span>{readingMinutes(a)} min read</span>
          </div>
        </div>
        <div className="container reading-layout">
          <aside className="reading-aside">
            <nav aria-label="On this page">
              <strong>ON THE MENU</strong>
              {a.sections.map((s) => (
                <a key={s.id} href={`#${s.id}`}>
                  {s.title}
                </a>
              ))}
              <a href="#takeaway">Your takeaway checklist</a>
            </nav>
            <a
              className="reading-download"
              href={`${path}/checklist.md`}
              download
            >
              <Download size={16} aria-hidden="true" /> Download checklist
            </a>
            <a className="reading-markdown" href={`${path}/index.md`}>
              Read as Markdown <ArrowUpRight size={13} />
            </a>
          </aside>
          <article className="reading-article">
            <div className="reading-answer">
              <span className="eyebrow">THE USEFUL BIT</span>
              <p>{a.summary}</p>
            </div>
            {a.sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 75)}>{p}</p>
                ))}
                {s.items && (
                  <ul>
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.sourceIds && (
                  <p className="reading-sources">
                    Source:{" "}
                    {s.sourceIds.map((id, i) => (
                      <span key={id}>
                        {i > 0 ? " · " : ""}
                        <a
                          href={SOURCES[id].url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {SOURCES[id].title}
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </section>
            ))}
            <section id="takeaway" className="takeaway-card">
              <span className="eyebrow">TAKE THIS WITH YOU</span>
              <h2>Your next useful checklist.</h2>
              <ul>
                {a.checklist.map((item) => (
                  <li key={item}>
                    <Check size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink href={a.action.href}>
                {a.action.label}
                <ArrowUpRight size={15} />
              </ButtonLink>
            </section>
            <p className="editorial-note">
              Prepared with AI assistance from RankSushi’s product workflows and
              linked sources. These guides explain a method; they do not certify
              a website or promise rankings.{" "}
              <Link href="/methodology">Read our editorial approach.</Link>
            </p>
            <nav className="reading-related" aria-label="Related resources">
              <h2>A little more to chew on.</h2>
              {a.related
                .filter((p) => !p.endsWith(".txt"))
                .map((path) => (
                  <Link key={path} href={path}>
                    {resourceLabel(path)}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
            </nav>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
export function resourceLabel(path: string) {
  for (const [key, articles] of Object.entries(COLLECTIONS)) {
    const a = articles.find((a) => `/${key}/${a.slug}` === path);
    if (a) return a.title;
  }
  const names: Record<string, string> = {
    "/methodology": "Our methodology",
    "/security": "Security and access",
    "/pricing": "Plans and allowances",
    "/sitemap": "Explore the sitemap",
    "/features/website-audits": "Website audits",
    "/features/content-studio": "Content Studio",
    "/features/search-console": "Search Console",
    "/features/ai-visibility": "AI Visibility",
    "/tools/metadata-preview": "Metadata preview",
  };
  return names[path] || path;
}
