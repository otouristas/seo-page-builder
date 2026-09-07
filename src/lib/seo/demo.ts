import type { Analysis, Market, SeoSnapshot } from "./types";
import { buildAnalysis } from "./analysis";
import { hostOf } from "../utils";

export const DEMO_URL = "https://stripe.com/payments";

/** Modeled snapshot used when a page cannot be fetched, or for the landing-page demo. */
export function demoSnapshot(url: string = DEMO_URL): SeoSnapshot {
  const host = hostOf(url);
  const brand = (host.split(".")[0] ?? "Your brand").replace(/^\w/, (m) => m.toUpperCase());
  return {
    url,
    finalUrl: url,
    title: `${brand} Payments | Global Payment Processing Platform`,
    metaDescription: `Accept payments online, in person and around the world with ${brand}'s payment platform. Cards, wallets, local methods and optimized checkout in one integration.`,
    canonical: url,
    robots: null,
    lang: "en",
    h1: ["Financial infrastructure to grow your revenue"],
    h2: [
      "Accept payments everywhere",
      "Optimize your checkout conversion",
      "Payment processing built for scale",
      "Fight fraud with machine learning",
      "Pricing that scales with you",
      "Get started with online payments",
    ],
    h3: ["Cards and wallets", "Local payment methods", "Recurring billing", "In-person payments", "Payment links", "Developer tools"],
    ogTitle: `${brand} Payments`,
    ogDescription: `Online payment processing for internet businesses.`,
    ogImage: `${url}/og.png`,
    twitterCard: "summary_large_image",
    schemaTypes: ["Organization", "WebPage"],
    wordCount: 1140,
    imagesTotal: 18,
    imagesWithAlt: 11,
    linksInternal: 64,
    linksExternal: 6,
    hasViewport: true,
    titleChars: `${brand} Payments | Global Payment Processing Platform`.length,
    descriptionChars: 172,
    fetchedAt: "2026-09-01T09:00:00.000Z",
    source: "demo",
  };
}

export function demoAnalysis(market: Market = "us"): Analysis {
  return buildAnalysis(demoSnapshot(), market);
}
