import { SITE_URL } from "../utils";
import { required } from "../server/errors";
import { providerJson } from "./http";
import { validatePublicUrl } from "../seo/safe-fetch";
export type CrawlDocument = {
  html?: string;
  rawHtml?: string;
  markdown?: string;
  metadata?: {
    sourceURL?: string;
    url?: string;
    statusCode?: number;
    error?: string;
  };
};
export type CrawlState = {
  success: boolean;
  status: "scraping" | "completed" | "failed" | "cancelled";
  completed: number;
  total: number;
  creditsUsed: number;
  data: CrawlDocument[];
  next?: string;
  expiresAt?: string;
};
const base = "https://api.firecrawl.dev/v2";
const headers = () => ({
  Authorization: `Bearer ${required("FIRECRAWL_API_KEY")}`,
  "Content-Type": "application/json",
});
export async function startCrawl(url: string, limit: number) {
  await validatePublicUrl(url);
  return providerJson<{ id: string; success: boolean }>(`${base}/crawl`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      url,
      limit,
      maxDiscoveryDepth: 5,
      allowExternalLinks: false,
      allowSubdomains: false,
      crawlEntireDomain: true,
      ...(SITE_URL.startsWith("https://") &&
      process.env.FIRECRAWL_WEBHOOK_SECRET
        ? {
            webhook: {
              url: `${SITE_URL}/api/webhooks/firecrawl`,
              events: ["completed", "failed"],
            },
          }
        : {}),
      scrapeOptions: { formats: ["html", "markdown"], onlyMainContent: false },
      excludePaths: [
        "/wp-admin/.*",
        "/cart.*",
        "/checkout.*",
        "/account.*",
        "/login.*",
      ],
    }),
  });
}
export async function scrape(url: string) {
  await validatePublicUrl(url);
  return providerJson<{ success: boolean; data: CrawlDocument }>(
    `${base}/scrape`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        url,
        formats: ["html", "markdown"],
        onlyMainContent: false,
        maxAge: 0,
      }),
    },
    60_000,
  );
}
export async function getCrawl(id: string) {
  return providerJson<CrawlState>(`${base}/crawl/${encodeURIComponent(id)}`, {
    headers: headers(),
  });
}
export async function getCrawlPage(next: string) {
  const u = new URL(next);
  if (
    u.origin !== "https://api.firecrawl.dev" ||
    !u.pathname.startsWith("/v2/crawl/")
  )
    throw new Error("Untrusted crawl pagination URL");
  return providerJson<CrawlState>(u.href, { headers: headers() });
}
export async function getCrawlErrors(id: string) {
  return providerJson<{
    errors: { url: string; error: string }[];
    robotsBlocked: string[];
  }>(`${base}/crawl/${encodeURIComponent(id)}/errors`, { headers: headers() });
}
export async function cancelCrawl(id: string) {
  return providerJson(`${base}/crawl/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
}
