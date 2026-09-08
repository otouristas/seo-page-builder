import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  ChevronDown,
  Menu,
  Check,
  Sparkles,
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  FileText,
  House,
  Settings2,
  LockKeyhole,
  Database,
  Flame,
  CreditCard,
  CircleHelp,
} from "lucide-react";
import { Logo, Maki } from "./maki";
import {
  Badge,
  ButtonLink,
  SectionLabel,
  SectionHeading,
  TextLink,
  CheckItem,
} from "./ui";
import { PAID_PLANS, PLANS } from "@/lib/plans";
import { UrlForm } from "./url-form";
export function SiteHeader() {
  return (
    <header className="container site-header">
      <Link href="/" aria-label="RankSushi home">
        <Logo />
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/features">
          The menu <ChevronDown size={10} style={{ display: "inline" }} />
        </Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/methodology">Our approach</Link>
      </nav>
      <div className="header-actions">
        <Link className="sign-in" href="/login">
          Log in
        </Link>
        <ButtonLink href="/tools/seo-audit">
          Get a free taste <ArrowUpRight size={15} />
        </ButtonLink>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">
            <Menu size={21} />
          </summary>
          <nav aria-label="Mobile navigation">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/methodology">Our approach</Link>
            <Link href="/help">Help center</Link>
            <Link href="/login">Log in</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/">
              <Logo />
            </Link>
            <p>
              A little clarity. A lot more possibility.
              <br />
              Useful insights, served fresh.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <h2>The menu</h2>
              <Link href="/features/website-audits">Website audits</Link>
              <Link href="/features/search-console">Search Console</Link>
              <Link href="/features/content-studio">Content Studio</Link>
              <Link href="/features/ai-visibility">AI Visibility</Link>
            </div>
            <div>
              <h2>Good to know</h2>
              <Link href="/pricing">Pricing</Link>
              <Link href="/methodology">Our approach</Link>
              <Link href="/tools">Free tools</Link>
              <Link href="/help">Help center</Link>
            </div>
            <div>
              <h2>The fine print</h2>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/security">Security</Link>
              <Link href="/login">Your account</Link>
              <a href="mailto:anotherseoguru@gmail.com">Contact support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} RankSushi. Made for humans who want to
            be found.
          </span>
          <span>
            Fresh thinking. No ranking guarantees.{" "}
            <span aria-hidden="true">✳</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
export const FAQS = [
  [
    "What does RankSushi actually do?",
    "It connects what your website says with how people find it. Crawl your pages, connect Search Console, prioritize the next useful changes, prepare editable drafts, and check what changed after you publish.",
  ],
  [
    "Do I need to be an SEO expert?",
    "No. Each finding includes the evidence, why it matters, and a practical next step. Technical detail is there when you need it, with plain-language guidance up front.",
  ],
  [
    "Will it change my website automatically?",
    "You stay in control. RankSushi prepares drafts and exports. You review and publish them in your own website editor, then ask RankSushi to check the live page.",
  ],
  [
    "Can you guarantee Google rankings or AI citations?",
    "No one can promise that. We distinguish observed search performance, website findings, and sampled AI answers. Progress reports describe what happened without pretending a change proves causation.",
  ],
  [
    "Is Search Console required?",
    "No. A website audit works on its own. Connecting Search Console adds your real queries, clicks, impressions, and average positions so you can prioritize opportunities using actual search demand.",
  ],
  [
    "What happens when I reach my plan limit?",
    "We show the allowance before a job starts and pause new work when you run out. Existing results stay accessible. There are no surprise overages, and plan changes take effect next billing period.",
  ],
];
export function PricingCards() {
  return (
    <>
      <div className="price-grid">
        {PAID_PLANS.map((id) => {
          const plan = PLANS[id];
          return (
            <article
              key={id}
              className={`price-card ${id === "nigiri" ? "featured" : ""}`}
            >
              <h3 className="price-name">{plan.name}</h3>
              {id === "nigiri" && (
                <span className="popular">A BALANCED BITE</span>
              )}
              <p className="price-description">{plan.description}</p>
              <div className="price-amount">
                ${plan.price}
                <span> / month</span>
              </div>
              <p style={{ fontSize: 10 }}>
                Monthly billing. Cancel for the next renewal.
              </p>
              <ul>
                <CheckItem>
                  {plan.limits.projects}{" "}
                  {plan.limits.projects === 1
                    ? "website project"
                    : "website projects"}
                </CheckItem>
                <CheckItem>
                  {plan.limits.pages.toLocaleString()} crawled pages / month
                </CheckItem>
                <CheckItem>
                  {plan.limits.drafts} AI drafting actions / month
                </CheckItem>
                <CheckItem>
                  {plan.limits.answers} AI answer checks / month
                </CheckItem>
                <CheckItem>
                  {plan.limits.serps} live SERP lookups / month
                </CheckItem>
                <CheckItem>Daily Search Console sync</CheckItem>
                <CheckItem>Reports, exports & change tracking</CheckItem>
              </ul>
              <ButtonLink
                href={`/login?plan=${id}`}
                variant={id === "nigiri" ? "primary" : "secondary"}
              >
                Choose {plan.name}
                <ArrowRight size={15} />
              </ButtonLink>
            </article>
          );
        })}
      </div>
      <p className="price-note">
        Just exploring?{" "}
        <Link href="/tools/seo-audit" style={{ textDecoration: "underline" }}>
          Your first page audit is on us.
        </Link>{" "}
        No card. No automatic overages. Applicable tax is shown at checkout.
      </p>
    </>
  );
}
const previewNav = [
  House,
  Sparkles,
  ScanLine,
  ChartNoAxesCombined,
  PenLine,
  Orbit,
  FileText,
  Settings2,
];
export function ProductPreview() {
  return (
    <div className="hero-product">
      <div className="browser-bar">
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-url">
          <LockKeyhole size={8} /> ranksushi.com/app
        </span>
      </div>
      <div className="product-preview">
        <div className="preview-sidebar">
          <Logo />
          <div className="preview-project">
            <span className="project-avatar">O</span>
            <div>
              <strong>Olive & Earth</strong>Example workspace
            </div>
            <ChevronDown size={10} />
          </div>
          <div className="preview-nav-label">YOUR WORKSPACE</div>
          <nav className="preview-nav" aria-label="Example workspace">
            <span className="active">
              <House size={12} />
              Overview
            </span>
            {[
              "Opportunities",
              "Audits",
              "Search Console",
              "Content Studio",
              "AI Visibility",
              "Reports",
              "Settings",
            ].map((n, i) => {
              const Icon = previewNav[i + 1];
              return (
                <span key={n}>
                  <Icon size={12} />
                  {n}
                </span>
              );
            })}
          </nav>
        </div>
        <div className="preview-body">
          <div className="preview-topline">
            <span>
              Workspace <span style={{ margin: "0 8px" }}>›</span> Overview
            </span>
            <span>Illustrative product example</span>
          </div>
          <div className="preview-heading">
            <div>
              <h2>
                A fresh perspective, Alex <span aria-hidden="true">✳</span>
              </h2>
              <p>Your website is growing. Let’s find its next little win.</p>
            </div>
            <Link href="/demo" className="button secondary">
              Explore demo <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="preview-stats">
            <div className="preview-stat">
              <div className="stat-label">
                Organic clicks <ChartNoAxesCombined size={11} />
              </div>
              <div className="stat-value">2,486</div>
              <svg className="mini-line" viewBox="0 0 80 27" aria-hidden="true">
                <path
                  d="M1 23 10 20 20 22 31 13 40 16 50 9 59 12 69 5 79 2"
                  stroke="#89A85C"
                  fill="none"
                  strokeWidth="2"
                />
              </svg>
              <div className="stat-foot">↗ 18.6% · example comparison</div>
            </div>
            <div className="preview-stat">
              <div className="stat-label">
                Pages checked <ScanLine size={11} />
              </div>
              <div className="stat-value">
                48<span style={{ fontSize: 15, color: "#53634D" }}> / 48</span>
              </div>
              <div className="stat-foot">A complete example crawl</div>
            </div>
            <div className="preview-stat">
              <div className="stat-label">
                Ready-to-fix opportunities <Sparkles size={11} />
              </div>
              <div className="stat-value">12</div>
              <div className="stat-foot">3 small changes to start with</div>
            </div>
          </div>
          <div className="preview-bottom">
            <div className="preview-panel">
              <h3>
                Your next three bites <ArrowUpRight size={12} />
              </h3>
              <p>A few small changes with a clear purpose.</p>
              {[
                [
                  "Give your collection a clearer title",
                  "/collections/olive-oil · On-page",
                ],
                [
                  "Answer the questions customers ask",
                  "/guides/choosing-olive-oil · Content",
                ],
                [
                  "Connect your most useful pages",
                  "3 pages · Internal linking",
                ],
              ].map(([name, desc], i) => (
                <div className="preview-task" key={name}>
                  <span className="task-icon">
                    {i === 0 ? (
                      <PenLine size={12} />
                    ) : i === 1 ? (
                      <CircleHelp size={12} />
                    ) : (
                      <Globe2 size={12} />
                    )}
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <p>{desc}</p>
                  </div>
                  <ArrowUpRight className="arrow" size={12} />
                </div>
              ))}
            </div>
            <div className="preview-panel preview-answer">
              <Maki pose="wave" />
              <h3>A little help from Maki</h3>
              <p>YOUR WEBSITE, EXPLAINED</p>
              <blockquote>
                “Your olive oil guide answers the big questions. A clearer
                comparison table could make choosing the right bottle a lot
                easier.”
              </blockquote>
              <Link href="/demo/content-studio">
                See the suggested brief <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="sample-banner">
        <CircleHelp size={10} /> Illustrative sample data. Your workspace uses
        your own website and connected sources.
      </div>
    </div>
  );
}
export function Landing() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero">
          <div className="container">
            <div className="hero-top">
              <SectionLabel>
                A little less guesswork. A lot more good stuff.
              </SectionLabel>
              <span className="hero-star" aria-hidden="true">
                ✳
              </span>
              <Maki className="hero-doodle hero-maki" pose="wave" />
              <span className="hero-note">
                Small bites.
                <br />
                Meaningful progress.
              </span>
              <h1>
                Less SEO overwhelm.
                <br />
                More <em>“found you.”</em>
              </h1>
              <p className="hero-description">
                Your website has potential. Let’s bring it out.
                <br />
                Find what matters, know what to fix, and make your next move a
                good one.
              </p>
              <UrlForm />
              <div className="form-caption">
                <span>
                  <Check size={11} /> Free first audit
                </span>
                <span>
                  <Check size={11} /> No card needed
                </span>
                <span>
                  <Check size={11} /> Actually useful
                </span>
              </div>
              <span className="hero-spark" aria-hidden="true">
                ✦
              </span>
            </div>
            <ProductPreview />
          </div>
        </section>
        <div className="integration-strip">
          <div className="container">
            <p>
              Good ingredients.
              <br />
              <strong>Better insights.</strong>
            </p>
            <div className="integration-logos">
              <span>
                <span className="google-g">G</span> Search Console
              </span>
              <span>
                <Flame size={20} /> Firecrawl
              </span>
              <span>
                <Sparkles size={19} /> OpenAI
              </span>
              <span>
                <Database size={19} /> Supabase
              </span>
              <span>
                <CreditCard size={19} /> Stripe
              </span>
            </div>
          </div>
        </div>
        <section className="features-section" id="features">
          <div className="container">
            <SectionHeading
              kicker="Everything you need. Nothing to untangle."
              title="Big-picture clarity. Bite-sized next steps."
              description="From “where do I even start?” to “I know exactly what to do.” A calmer way to grow your presence across search and AI answers."
            />
            <div className="feature-grid">
              <article className="feature-card primary-feature">
                <div>
                  <div className="feature-icon">
                    <ScanLine size={19} />
                  </div>
                  <h3>
                    Find the good.
                    <br />
                    Fix the “could be better.”
                  </h3>
                  <p>
                    A thoughtful website audit that shows what’s happening, why
                    it matters, and what to do about it.
                  </p>
                  <TextLink href="/features/website-audits">
                    Meet your next opportunity
                  </TextLink>
                </div>
                <div className="mini-finding">
                  <Badge tone="orange">A SMALL, USEFUL FIX</Badge>
                  <h4>A title with more to say.</h4>
                  <p>
                    Your collection title is “Products.” Help visitors
                    understand what they’ll find.
                  </p>
                  <div className="finding-code">
                    Products → Extra Virgin Olive Oils | Olive & Earth
                  </div>
                  <div className="finding-action">Review suggested title ↗</div>
                </div>
              </article>
              <article className="feature-card">
                <div className="feature-icon">
                  <ChartNoAxesCombined size={19} />
                </div>
                <h3>
                  Let your data
                  <br />
                  do the talking.
                </h3>
                <p>
                  Turn Search Console queries into opportunities. Less
                  spreadsheet archaeology. More “oh, that’s interesting.”
                </p>
                <TextLink href="/features/search-console">
                  Connect the dots
                </TextLink>
              </article>
              <article className="feature-card">
                <div className="feature-icon">
                  <Orbit size={19} />
                </div>
                <h3>
                  See how AI
                  <br />
                  serves your story.
                </h3>
                <p>
                  Understand answer readiness and inspect sampled AI answers,
                  mentions, and sources. Every result comes with context.
                </p>
                <TextLink href="/features/ai-visibility">
                  Explore AI visibility
                </TextLink>
              </article>
              <article className="feature-card wide-feature">
                <div>
                  <h3>Blank page? Let’s roll.</h3>
                  <p>
                    Get a useful first draft. Make it yours. From a better title
                    to a whole content brief, Maki helps you get moving.
                  </p>
                  <TextLink href="/features/content-studio">
                    Step into Content Studio
                  </TextLink>
                </div>
                <Maki pose="happy" />
              </article>
            </div>
          </div>
        </section>
        <section className="workflow" id="how-it-works">
          <div className="container">
            <div className="workflow-header">
              <div>
                <SectionLabel>A recipe you can actually follow</SectionLabel>
                <h2>
                  From a little insight
                  <br />
                  to your next good move.
                </h2>
              </div>
              <p>
                No mystery scores. No “just trust the algorithm.” Clear steps,
                backed by what we can actually see.
              </p>
            </div>
            <div className="steps">
              {[
                [
                  "Bring your website",
                  "Add your URL and tell us a little about your business. Connect Search Console when you’re ready.",
                ],
                [
                  "Find your next bite",
                  "Get a prioritized list of opportunities, with evidence and plain-language explanations.",
                ],
                [
                  "Make it your own",
                  "Review and edit your drafts. Export them, then publish through your own website editor.",
                ],
                [
                  "See what changed",
                  "Recheck the page and follow your real search performance. Keep learning as you grow.",
                ],
              ].map(([title, desc], i) => (
                <article className="step" key={title}>
                  <div className="step-num">0{i + 1}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="pricing-section">
          <div className="container">
            <SectionHeading
              kicker="Something for every appetite"
              title="A little investment. A clearer direction."
              description="Simple monthly plans. Visible limits. No unexpected extras on the bill."
            />
            <PricingCards />
          </div>
        </section>
        <section className="faq-section">
          <div className="container faq-layout">
            <div>
              <SectionLabel>A few things you might wonder</SectionLabel>
              <h2>
                Curious?
                <br />
                Good. So are we.
              </h2>
              <p>
                Here’s what’s on the menu, what isn’t, and how RankSushi helps
                you move forward.
              </p>
              <div style={{ marginTop: 25 }}>
                <TextLink href="/help">Visit the help center</TextLink>
              </div>
            </div>
            <div className="faq-list">
              {FAQS.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <div>
                <SectionLabel>
                  There’s something good in your website.
                </SectionLabel>
                <h2 style={{ marginTop: 17 }}>Let’s find it together.</h2>
                <p>Your next useful insight starts with one little URL.</p>
                <ButtonLink href="/tools/seo-audit">
                  Get your free first audit <ArrowUpRight size={17} />
                </ButtonLink>
              </div>
              <Maki pose="wave" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
