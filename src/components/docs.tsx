import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  FileText,
  LifeBuoy,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Logo, Maki } from "./maki";
import {
  DocsPlaybook,
  DocsSearch,
  DocsSidebar,
  type DocEntry,
} from "./docs-controls";
import { CopyActions } from "./copy-actions";
import {
  COLLECTIONS,
  SOURCES,
  readingMinutes,
  type Collection,
  type LearningArticle,
} from "@/lib/learning/content";
import { articleMarkdown } from "@/lib/learning/exports";
import { guidePrompt } from "@/lib/learning/doc-prompts";
import { CANONICAL_URL } from "@/lib/utils";
import type { ReactNode } from "react";
const entries: DocEntry[] = (["help", "learn"] as const).flatMap((collection) =>
  COLLECTIONS[collection].map((a) => ({
    href: `/${collection}/${a.slug}`,
    title: a.title,
    category: collection === "learn" ? "SEO field guides" : a.category,
    tags: a.tags,
    description: a.description,
  })),
);
export function DocsShell({
  path,
  children,
  right,
}: {
  path: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="docs-site">
      <header className="docs-header">
        <div className="docs-brand">
          <Link href="/" aria-label="RankSushi home">
            <Logo />
          </Link>
          <span className="docs-brand-divider" />
          <Link href="/help">The handbook</Link>
        </div>
        <DocsSearch entries={entries} />
        <nav aria-label="Documentation navigation">
          <Link href="/demo">
            Open Studio <ArrowUpRight size={13} />
          </Link>
          <a href="mailto:anotherseoguru@gmail.com">Support</a>
          <Link href="/login" className="docs-sign-in">
            Sign in <ArrowRight size={13} />
          </Link>
        </nav>
      </header>
      <div className="docs-section-bar">
        <Link
          href="/help"
          aria-current={path.startsWith("/help") ? "page" : undefined}
        >
          <BookOpen size={14} />
          Product guides
        </Link>
        <Link href="/learn">
          <Compass size={14} />
          SEO kitchen
        </Link>
        <Link href="/blog">
          <FileText size={14} />
          Fresh reads
        </Link>
      </div>
      <div className="docs-layout">
        <DocsSidebar entries={entries} current={path} />
        <main className="docs-main" id="main">
          {children}
        </main>
        <aside className="docs-right" aria-label="Guide actions">
          {right}
        </aside>
      </div>
      <footer className="docs-footer">
        <span>RankSushi · Useful insights, served fresh.</span>
        <div>
          <Link href="/methodology">Methodology</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/sitemap">Sitemap</Link>
          <a href="/llms.txt">llms.txt</a>
        </div>
      </footer>
    </div>
  );
}
export function DocsHome() {
  const first = COLLECTIONS.help[0];
  const paths = [
    "first-audit",
    "serp-studio",
    "fix-prompts",
    "google-login-and-search-console",
    "drafts-and-rechecks",
    "account-recovery",
  ];
  const icons = [Compass, Sparkles, Wrench, BookOpen, Check, LifeBuoy];
  return (
    <DocsShell
      path="/help"
      right={
        <>
          <div className="docs-start-card">
            <Maki pose="wave" />
            <span className="eyebrow">WELCOME TO THE KITCHEN</span>
            <h2>One useful step at a time.</h2>
            <p>
              You don’t need to know every SEO term. Start with a page and
              follow the next action.
            </p>
            <Link href="/demo">
              Try the visual walkthrough <ArrowUpRight size={14} />
            </Link>
          </div>
          <DocsPlaybook article={first} collection="help" />
        </>
      }
    >
      <div className="docs-breadcrumb">
        <BookOpen size={13} />
        The handbook <span>/</span> Start here
      </div>
      <div className="docs-home-intro">
        <span className="eyebrow">A LITTLE HELP. A LOT LESS GUESSWORK.</span>
        <h1>
          Let’s get you
          <br />
          <em>unstuck.</em>
        </h1>
        <p>
          Clear steps, copyable prompts, and a way to check your work. Pick what
          you want to do.
        </p>
      </div>
      <div className="docs-quick-start">
        <span>01</span>
        <div>
          <h2>New to RankSushi?</h2>
          <p>
            Audit one page, pick a finding, and take your first useful step.
          </p>
        </div>
        <Link href="/help/first-audit" aria-label="Start your first audit">
          <ArrowRight size={20} />
        </Link>
      </div>
      <h2 className="docs-home-section-title">What brings you here?</h2>
      <div className="docs-task-grid">
        {paths.map((slug, i) => {
          const a = COLLECTIONS.help.find((a) => a.slug === slug);
          if (!a) return null;
          const Icon = icons[i];
          return (
            <Link href={`/help/${slug}`} key={slug}>
              <Icon size={19} />
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <span>
                Show me how <ArrowRight size={13} />
              </span>
            </Link>
          );
        })}
      </div>
      <div className="docs-human-note">
        <LifeBuoy size={22} />
        <div>
          <h2>Human help is an option, too.</h2>
          <p>Tell us what you tried and the message you saw.</p>
          <a href="mailto:anotherseoguru@gmail.com">
            anotherseoguru@gmail.com <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </DocsShell>
  );
}
export function DocsArticle({
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
        "@type": "TechArticle",
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
            name: collection === "help" ? "Help center" : "SEO kitchen",
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
  const all = COLLECTIONS[collection],
    index = all.findIndex((item) => item.slug === a.slug),
    prev = all[index - 1],
    next = all[index + 1];
  return (
    <DocsShell
      path={path}
      right={
        <>
          <nav className="docs-toc" aria-label="On this page">
            <strong>ON THIS PAGE</strong>
            {a.sections.map((s) => (
              <a href={`#${s.id}`} key={s.id}>
                {s.title}
              </a>
            ))}
            <a href="#takeaway">Your next steps</a>
          </nav>
          <DocsPlaybook key={path} article={a} collection={collection} />
        </>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replaceAll("<", "\\u003c"),
        }}
      />
      <nav className="docs-breadcrumb" aria-label="Breadcrumb">
        <Link href="/help">The handbook</Link>
        <span>/</span>
        <span>{a.category}</span>
      </nav>
      <div className="docs-title-row">
        <div>
          <span className="eyebrow">{a.category}</span>
          <h1>{a.title}</h1>
        </div>
        <CopyActions
          text={articleMarkdown(a, collection)}
          prompt={guidePrompt(a, collection)}
          steps={articleMarkdown(a, collection, true)}
          markdownUrl={`${path}/index.md`}
          filename={`ranksushi-${a.slug}.md`}
        />
      </div>
      <p className="docs-article-description">{a.description}</p>
      <div className="docs-meta">
        <span>{readingMinutes(a)} min read</span>
        <span>
          Updated <time dateTime={a.updated}>{a.updated}</time>
        </span>
        <span>By RankSushi</span>
      </div>
      <article className="docs-article">
        <div className="docs-answer">
          <span>
            <Sparkles size={14} />
            THE USEFUL BIT
          </span>
          <p>{a.summary}</p>
        </div>
        {a.sections.map((s) => (
          <section id={s.id} key={s.id}>
            <h2>
              {s.title}
              <a href={`#${s.id}`} aria-label={`Link to ${s.title}`}>
                #
              </a>
            </h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.items && (
              <ul>
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {s.sourceIds && (
              <p className="docs-sources">
                Read the source:{" "}
                {s.sourceIds.map((id) => (
                  <a
                    key={id}
                    href={SOURCES[id].url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {SOURCES[id].title}
                    <ArrowUpRight size={11} />
                  </a>
                ))}
              </p>
            )}
          </section>
        ))}
        <section className="docs-takeaway" id="takeaway">
          <h2>Your next steps</h2>
          <ol>
            {a.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <Link href={a.action.href}>
            {a.action.label}
            <ArrowUpRight size={14} />
          </Link>
        </section>
        <p className="docs-editorial">
          Prepared with AI assistance from product workflows and the linked
          sources. <Link href="/methodology">How we prepare our guidance</Link>.
        </p>
      </article>
      <nav className="docs-prev-next" aria-label="Previous and next guide">
        {prev ? (
          <Link href={`/${collection}/${prev.slug}`}>
            <span>← PREVIOUS</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${collection}/${next.slug}`}>
            <span>NEXT →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </DocsShell>
  );
}
