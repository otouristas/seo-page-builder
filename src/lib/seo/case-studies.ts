import type { Analysis, Market, SeoSnapshot } from "./types";
import { buildAnalysis } from "./analysis";
import { auditScore, buildAudit } from "./audit";
import { buildNiche } from "./niches";
import { fillSnapshot } from "./snapshot";

export type CaseStudy = {
  slug: string;
  brand: string;
  url: string;
  sector: string;
  tagline: string;
  /** What the study is meant to show. */
  angle: string;
  market: Market;
  /** Keyword the case study focuses on (must be a phrase the engine will stage). */
  focus: string;
  /** Play ids (suffix after the niche id) applied in the "after" scene. */
  appliedKeys: string[];
  snapshot: SeoSnapshot;
  accent: "signal" | "peri" | "success";
};

const base = (url: string, over: Partial<SeoSnapshot>): SeoSnapshot =>
  fillSnapshot({
    url,
    finalUrl: url,
    title: "",
    metaDescription: "",
    canonical: url,
    robots: null,
    lang: "en",
    h1: [],
    h2: [],
    h3: [],
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterCard: "summary_large_image",
    schemaTypes: [],
    wordCount: 0,
    wordCountMain: 0,
    excerpt: "",
    hreflang: [],
    xRobots: null,
    status: 200,
    redirected: false,
    imagesTotal: 0,
    imagesWithAlt: 0,
    linksInternal: 0,
    linksExternal: 0,
    hasViewport: true,
    titleChars: 0,
    descriptionChars: 0,
    fetchedAt: "2026-09-01T09:00:00.000Z",
    source: "demo",
    ...over,
  });

function withCounts(s: SeoSnapshot): SeoSnapshot {
  return { ...s, titleChars: s.title.length, descriptionChars: s.metaDescription.length };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "stripe-payments",
    brand: "Stripe",
    url: "https://stripe.com/payments",
    sector: "Fintech · product page",
    tagline: "A strong brand page that still leaves commercial clicks on the table.",
    angle: "Commercial intent: the SERP is listicles and review sites. A comparison block and Offer-style clarity close the gap.",
    market: "us",
    focus: "payment processing",
    appliedKeys: ["compare", "verdict", "links"],
    accent: "signal",
    snapshot: withCounts(
      base("https://stripe.com/payments", {
        title: "Stripe Payments | Global Payment Processing Platform",
        metaDescription:
          "Accept payments online, in person and around the world with a payments platform built for growth. Cards, wallets, local methods and optimized checkout.",
        h1: ["Financial infrastructure to grow your revenue"],
        h2: ["Accept payments everywhere", "Optimize checkout conversion", "Payment processing built for scale", "Fight fraud with machine learning", "Pricing that scales with you"],
        h3: ["Cards and wallets", "Local payment methods", "Recurring billing", "In-person payments", "Payment links"],
        ogTitle: "Stripe Payments",
        ogDescription: "Online payment processing for internet businesses.",
        ogImage: "https://stripe.com/og.png",
        schemaTypes: ["Organization"],
        wordCount: 1180,
        imagesTotal: 18,
        imagesWithAlt: 12,
        linksInternal: 64,
        linksExternal: 6,
      }),
    ),
  },
  {
    slug: "ahrefs-blog",
    brand: "Ahrefs Blog",
    url: "https://ahrefs.com/blog",
    sector: "SaaS · content hub",
    tagline: "An authority hub whose index page under-serves informational queries.",
    angle: "Informational intent: AI Overview and featured snippet sit on top. A quotable definition and FAQ markup let the hub compete for them.",
    market: "us",
    focus: "seo blog",
    appliedKeys: ["summary", "faq", "schema", "meta"],
    accent: "peri",
    snapshot: withCounts(
      base("https://ahrefs.com/blog", {
        title: "Ahrefs Blog: SEO and Marketing Insights",
        metaDescription: "",
        h1: ["The Ahrefs Blog"],
        h2: ["Latest posts", "SEO", "Content marketing", "Keyword research", "Link building", "Data & studies", "Product updates"],
        h3: ["How to do keyword research", "SEO checklist", "Link building strategies", "Content marketing guide", "Technical SEO basics"],
        ogTitle: "Ahrefs Blog",
        ogDescription: "Actionable SEO and marketing advice from the Ahrefs team.",
        ogImage: "https://ahrefs.com/blog/og.png",
        schemaTypes: [],
        wordCount: 520,
        imagesTotal: 42,
        imagesWithAlt: 40,
        linksInternal: 210,
        linksExternal: 4,
      }),
    ),
  },
  {
    slug: "skroutz",
    brand: "Skroutz",
    url: "https://www.skroutz.gr/",
    sector: "Marketplace · Greek market",
    tagline: "A category leader in Greece where the brand SERP is already won.",
    angle: "Navigational intent: the win is owning the whole SERP with sitelinks and entity markup, then pushing category pages for transactional queries.",
    market: "gr",
    focus: "skroutz",
    appliedKeys: ["sitelinks", "links", "refresh"],
    accent: "success",
    snapshot: withCounts(
      base("https://www.skroutz.gr/", {
        title: "Skroutz.gr - Σύγκριση τιμών & αγορές online",
        metaDescription: "Βρες τις καλύτερες τιμές σε χιλιάδες προϊόντα, διάβασε αξιολογήσεις και αγόρασε online με ασφάλεια από 3.000+ καταστήματα.",
        lang: "el",
        h1: ["Skroutz"],
        h2: ["Δημοφιλείς κατηγορίες", "Προσφορές ημέρας", "Νέα προϊόντα", "Skroutz Plus", "Αξιολογήσεις"],
        h3: ["Κινητά τηλέφωνα", "Laptops", "Τηλεοράσεις", "Παιχνίδια", "Παπούτσια"],
        ogTitle: "Skroutz.gr",
        ogDescription: "Σύγκριση τιμών και αγορές online.",
        ogImage: "https://www.skroutz.gr/og.png",
        schemaTypes: ["WebSite"],
        wordCount: 860,
        imagesTotal: 120,
        imagesWithAlt: 118,
        linksInternal: 480,
        linksExternal: 12,
      }),
    ),
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export type CaseStudyView = {
  study: CaseStudy;
  analysis: Analysis;
  nicheId: string;
  appliedIds: string[];
};

export function buildCaseStudyView(study: CaseStudy): CaseStudyView {
  let analysis = buildAnalysis(study.snapshot, study.market);
  let niche = analysis.niches.find((n) => n.keyword === study.focus);
  if (!niche) {
    const audit = buildAudit(study.snapshot, study.market);
    niche = buildNiche(study.focus, { snapshot: study.snapshot, audit, score: auditScore(audit), market: study.market }, "staged");
    analysis = { ...analysis, niches: [niche, ...analysis.niches] };
  }
  const active = niche;
  const appliedIds = study.appliedKeys.map((k) => `${active.id}-${k}`).filter((id) => active.plays.some((p) => p.id === id));
  return { study, analysis, nicheId: active.id, appliedIds };
}
