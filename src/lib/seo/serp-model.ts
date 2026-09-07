import type { Market, SearchIntent, SeoSnapshot, SerpResult } from "./types";
import { hostOf, seeded } from "../utils";

type Style = "guide" | "review" | "marketplace" | "brand" | "forum" | "news" | "tool" | "encyclopedia";

type Competitor = { domain: string; name: string; authority: number; style: Style; hint: string };

const US: Record<Exclude<SearchIntent, "navigational">, Competitor[]> = {
  informational: [
    { domain: "en.wikipedia.org", name: "Wikipedia", authority: 98, style: "encyclopedia", hint: "Entity coverage and thousands of referring domains." },
    { domain: "hubspot.com", name: "HubSpot", authority: 93, style: "guide", hint: "Long-form guides with strong internal linking." },
    { domain: "investopedia.com", name: "Investopedia", authority: 92, style: "guide", hint: "Definition-first structure that wins featured snippets." },
    { domain: "forbes.com", name: "Forbes", authority: 95, style: "news", hint: "Publisher authority and fresh dates." },
    { domain: "moz.com", name: "Moz", authority: 91, style: "guide", hint: "Topical authority in its niche, deep FAQ sections." },
    { domain: "medium.com", name: "Medium", authority: 94, style: "forum", hint: "Domain strength carries thin posts." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video intent blended into the SERP." },
    { domain: "semrush.com", name: "Semrush", authority: 92, style: "guide", hint: "Data-backed examples and original charts." },
    { domain: "quora.com", name: "Quora", authority: 93, style: "forum", hint: "UGC answers matching question phrasing." },
  ],
  commercial: [
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Thousands of verified reviews per category." },
    { domain: "capterra.com", name: "Capterra", authority: 89, style: "review", hint: "Comparison tables and filters for every tool." },
    { domain: "techradar.com", name: "TechRadar", authority: 92, style: "review", hint: "Tested roundups refreshed monthly." },
    { domain: "pcmag.com", name: "PCMag", authority: 91, style: "review", hint: "Lab-tested verdicts and rating badges." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "Threads ranking for 'best' queries via UGC." },
    { domain: "forbes.com", name: "Forbes Advisor", authority: 95, style: "review", hint: "Publisher authority plus affiliate depth." },
    { domain: "zapier.com", name: "Zapier", authority: 92, style: "guide", hint: "Hands-on comparisons with screenshots." },
    { domain: "shopify.com", name: "Shopify", authority: 96, style: "guide", hint: "Brand authority extended to educational posts." },
    { domain: "nerdwallet.com", name: "NerdWallet", authority: 90, style: "review", hint: "Structured pros/cons that match intent." },
  ],
  transactional: [
    { domain: "amazon.com", name: "Amazon", authority: 99, style: "marketplace", hint: "Product schema, reviews and price signals." },
    { domain: "shopify.com", name: "Shopify", authority: 96, style: "brand", hint: "Brand landing pages with clear offers." },
    { domain: "bestbuy.com", name: "Best Buy", authority: 92, style: "marketplace", hint: "Availability and local pickup markup." },
    { domain: "walmart.com", name: "Walmart", authority: 94, style: "marketplace", hint: "Price competitiveness and stock data." },
    { domain: "etsy.com", name: "Etsy", authority: 93, style: "marketplace", hint: "Long-tail product titles at scale." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Aggregated inventory with rich results." },
    { domain: "ebay.com", name: "eBay", authority: 96, style: "marketplace", hint: "Massive listing depth for every variant." },
    { domain: "target.com", name: "Target", authority: 91, style: "marketplace", hint: "Offer schema plus store availability." },
    { domain: "apple.com", name: "Apple", authority: 99, style: "brand", hint: "Brand demand and clean product pages." },
  ],
};

const GR: Record<Exclude<SearchIntent, "navigational">, Competitor[]> = {
  informational: [
    { domain: "el.wikipedia.org", name: "Βικιπαίδεια", authority: 96, style: "encyclopedia", hint: "Entity coverage in Greek." },
    { domain: "in.gr", name: "in.gr", authority: 82, style: "news", hint: "Publisher authority and freshness." },
    { domain: "kathimerini.gr", name: "Καθημερινή", authority: 84, style: "news", hint: "Trusted news domain with deep archives." },
    { domain: "capital.gr", name: "Capital.gr", authority: 78, style: "guide", hint: "Explainers for finance and business queries." },
    { domain: "insomnia.gr", name: "Insomnia", authority: 72, style: "forum", hint: "Forum threads matching question phrasing." },
    { domain: "protothema.gr", name: "Πρώτο Θέμα", authority: 83, style: "news", hint: "High crawl frequency and fresh dates." },
    { domain: "naftemporiki.gr", name: "Ναυτεμπορική", authority: 79, style: "news", hint: "Business coverage with strong internal links." },
    { domain: "hubspot.com", name: "HubSpot", authority: 93, style: "guide", hint: "English guides still rank for mixed-language queries." },
    { domain: "youtube.com", name: "YouTube", authority: 100, style: "brand", hint: "Video intent blended into the SERP." },
  ],
  commercial: [
    { domain: "skroutz.gr", name: "Skroutz", authority: 86, style: "marketplace", hint: "Category pages with thousands of listings and reviews." },
    { domain: "bestprice.gr", name: "BestPrice", authority: 74, style: "marketplace", hint: "Price comparison with fresh offers." },
    { domain: "insomnia.gr", name: "Insomnia", authority: 72, style: "forum", hint: "'Ποιο είναι το καλύτερο' threads rank for best-of queries." },
    { domain: "techmaniacs.gr", name: "Techmaniacs", authority: 61, style: "review", hint: "Tested roundups for Greek buyers." },
    { domain: "capital.gr", name: "Capital.gr", authority: 78, style: "review", hint: "Publisher comparisons for services." },
    { domain: "g2.com", name: "G2", authority: 90, style: "review", hint: "Global review authority bleeds into the Greek SERP." },
    { domain: "reddit.com", name: "Reddit", authority: 97, style: "forum", hint: "UGC threads for 'best' queries." },
    { domain: "e-shop.gr", name: "e-shop.gr", authority: 70, style: "marketplace", hint: "Deep catalog and long-standing domain." },
    { domain: "plaisio.gr", name: "Πλαίσιο", authority: 71, style: "marketplace", hint: "Retail brand with strong category pages." },
  ],
  transactional: [
    { domain: "skroutz.gr", name: "Skroutz", authority: 86, style: "marketplace", hint: "Offer schema, reviews and price signals." },
    { domain: "public.gr", name: "Public", authority: 76, style: "marketplace", hint: "Availability and store pickup markup." },
    { domain: "e-shop.gr", name: "e-shop.gr", authority: 70, style: "marketplace", hint: "Massive listing depth." },
    { domain: "plaisio.gr", name: "Πλαίσιο", authority: 71, style: "marketplace", hint: "Retail authority with product schema." },
    { domain: "kotsovolos.gr", name: "Κωτσόβολος", authority: 73, style: "marketplace", hint: "Brand demand plus price competitiveness." },
    { domain: "bestprice.gr", name: "BestPrice", authority: 74, style: "marketplace", hint: "Aggregated offers with fresh prices." },
    { domain: "amazon.de", name: "Amazon.de", authority: 97, style: "marketplace", hint: "Cross-border authority for Greek shoppers." },
    { domain: "booking.com", name: "Booking.com", authority: 95, style: "marketplace", hint: "Aggregated inventory with rich results." },
    { domain: "efood.gr", name: "efood", authority: 68, style: "brand", hint: "Local brand demand and app deep links." },
  ],
};

function cap(s: string) {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

const TITLES: Record<Style, ((kw: string, name: string) => string)[]> = {
  guide: [
    (kw) => `${cap(kw)}: The Complete Guide (2026)`,
    (kw) => `What Is ${cap(kw)}? Definition, Examples & Tips`,
    (kw, n) => `${cap(kw)} Explained: How It Works | ${n}`,
  ],
  encyclopedia: [(kw) => `${cap(kw)} - Wikipedia`],
  review: [
    (kw) => `The 10 Best ${cap(kw)} of 2026 (Tested & Ranked)`,
    (kw, n) => `Best ${cap(kw)}: Top Picks Compared | ${n}`,
    (kw, n) => `${cap(kw)} Reviews 2026: Pros, Cons & Pricing - ${n}`,
  ],
  marketplace: [
    (kw, n) => `${cap(kw)} - Compare Prices & Offers | ${n}`,
    (kw, n) => `Buy ${cap(kw)} Online - Best Prices | ${n}`,
    (kw, n) => `${cap(kw)}: ${n}`,
  ],
  brand: [(kw, n) => `${n} - ${cap(kw)}`, (kw, n) => `${cap(kw)} | ${n}`],
  forum: [
    (kw) => `What's the best ${kw} right now? Honest answers`,
    (kw) => `${cap(kw)} - is it worth it? (2026 thread)`,
  ],
  news: [(kw, n) => `${cap(kw)} in 2026: What's Changing | ${n}`, (kw, n) => `${n}: Everything About ${cap(kw)}`],
  tool: [(kw, n) => `Free ${cap(kw)} Tool - ${n}`],
};

const SNIPPETS: Record<Style, ((kw: string) => string)[]> = {
  guide: [
    (kw) => `Learn what ${kw} is, how it works and when to use it. We cover definitions, real examples, common mistakes and a step-by-step checklist you can apply today.`,
    (kw) => `A practical, plain-language guide to ${kw}. Updated for 2026 with new examples, benchmarks and answers to the questions people ask most.`,
  ],
  encyclopedia: [(kw) => `${cap(kw)} refers to … This article covers history, terminology, notable examples and related concepts, with citations.`],
  review: [
    (kw) => `We tested the leading ${kw} options on price, features and support. See our top picks, who each one is best for, and what to avoid.`,
    (kw) => `Compare the best ${kw} side by side: pricing, ratings, pros and cons from thousands of verified users.`,
  ],
  marketplace: [
    (kw) => `Browse ${kw} from top brands. Compare prices, read reviews and find the best offer with fast delivery and free returns.`,
    (kw) => `Thousands of ${kw} listings in stock. Filter by price, rating and brand. Secure checkout and price match.`,
  ],
  brand: [(kw) => `Discover ${kw} built for teams that move fast. Transparent pricing, world-class support and everything you need to get started.`],
  forum: [(kw) => `I've been looking into ${kw} for months. Here's what actually worked, what didn't, and what the community recommends …`],
  news: [(kw) => `New rules, new tools and shifting prices: our reporters break down what ${kw} looks like this year and what it means for you.`],
  tool: [(kw) => `Free ${kw} tool. No sign-up. Paste your data, get instant results and export in one click.`],
};

const PAA: Record<SearchIntent, ((kw: string) => string)[]> = {
  informational: [
    (kw) => `What is ${kw}?`,
    (kw) => `How does ${kw} work?`,
    (kw) => `What are examples of ${kw}?`,
    (kw) => `Is ${kw} worth it in 2026?`,
  ],
  commercial: [
    (kw) => `What is the best ${kw}?`,
    (kw) => `How much does ${kw} cost?`,
    (kw) => `Which ${kw} is best for small business?`,
    (kw) => `What should I look for in ${kw}?`,
  ],
  transactional: [
    (kw) => `Where can I buy ${kw}?`,
    (kw) => `How much is ${kw}?`,
    (kw) => `Is there a discount on ${kw}?`,
    (kw) => `What is the cheapest ${kw}?`,
  ],
  navigational: [
    (kw) => `Is ${kw} free?`,
    (kw) => `How do I log in to ${kw}?`,
    (kw) => `Who owns ${kw}?`,
    (kw) => `Is ${kw} safe to use?`,
  ],
};

function slug(kw: string) {
  return kw.replace(/[^a-z0-9α-ω]+/gi, "-").replace(/(^-|-$)/g, "");
}

export type SceneInput = {
  keyword: string;
  intent: SearchIntent;
  market: Market;
  seed: number;
  snapshot: SeoSnapshot;
};

/** Build the competitor set and SERP features for one keyword. Deterministic per seed. */
export function buildSerpScene(input: SceneInput): SerpResult[] {
  const { keyword: kw, intent, market, seed, snapshot } = input;
  const rnd = seeded(seed ^ 0x9e3779b9);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!;
  const yourDomain = hostOf(snapshot.finalUrl);
  const brand = yourDomain.split(".")[0] ?? yourDomain;

  const pools = market === "gr" ? GR : US;
  const poolIntent = intent === "navigational" ? "informational" : intent;
  const pool = pools[poolIntent].filter((c) => c.domain !== yourDomain);
  // Shuffle deterministically, then bias toward authority so strong domains sit higher.
  const shuffled = [...pool].sort(() => rnd() - 0.5).sort((a, b) => b.authority + rnd() * 18 - (a.authority + rnd() * 18));
  const competitors = shuffled.slice(0, 9);

  const out: SerpResult[] = [];

  if (intent === "informational") {
    const sources = competitors.slice(0, 3).map((c) => c.domain);
    out.push({
      id: `${seed}-ai`,
      kind: "ai-overview",
      domain: "google",
      url: "",
      title: "AI Overview",
      snippet: `${cap(kw)} is best understood as a set of practices and tools that solve a specific problem. Most sources agree on three things: start with the basics, measure results, and adjust based on what the data shows.`,
      sitelinks: sources,
    });
    const top = competitors[0]!;
    out.push({
      id: `${seed}-featured`,
      kind: "featured",
      domain: top.domain,
      url: `https://${top.domain}/${slug(kw)}`,
      title: pick(TITLES[top.style])(kw, top.name),
      snippet: `${cap(kw)} is the process of … In practice it involves three steps: defining the goal, choosing the right approach, and measuring the outcome against a baseline.`,
      authority: top.authority,
      hint: top.hint,
    });
  }

  out.push({
    id: `${seed}-paa`,
    kind: "paa",
    domain: "google",
    url: "",
    title: "People also ask",
    snippet: "",
    questions: PAA[intent].map((f) => f(kw)),
  });

  if (intent === "navigational") {
    out.push({
      id: `${seed}-you`,
      kind: "organic",
      isYou: true,
      domain: yourDomain,
      url: snapshot.finalUrl,
      title: snapshot.title || `${cap(brand)} — official site`,
      snippet: snapshot.metaDescription || snapshot.ogDescription || `${cap(brand)}: ${snapshot.h1[0] ?? "official website"}.`,
      sitelinks: snapshot.h2.slice(0, 4).length >= 2 ? snapshot.h2.slice(0, 4) : ["Pricing", "Docs", "Sign in", "Blog"],
    });
  } else {
    out.push({
      id: `${seed}-you`,
      kind: "organic",
      isYou: true,
      domain: yourDomain,
      url: snapshot.finalUrl,
      title: snapshot.title || `${cap(kw)} | ${cap(brand)}`,
      snippet:
        snapshot.metaDescription ||
        snapshot.ogDescription ||
        (snapshot.h2.length ? snapshot.h2.slice(0, 3).join(". ") + "." : `${cap(brand)} on ${kw}.`),
    });
  }

  competitors.forEach((c, i) => {
    const title = pick(TITLES[c.style])(kw, c.name);
    out.push({
      id: `${seed}-c${i}`,
      kind: "organic",
      domain: c.domain,
      url: `https://${c.domain}/${slug(kw)}${c.style === "forum" ? "/comments" : ""}`,
      title,
      snippet: pick(SNIPPETS[c.style])(kw),
      authority: c.authority,
      hint: c.hint,
      sitelinks: i === 0 && intent !== "navigational" ? ["Overview", "Pricing", "Reviews", "Alternatives"] : undefined,
    });
  });

  return out;
}
