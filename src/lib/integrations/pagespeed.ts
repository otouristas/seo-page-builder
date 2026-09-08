import { required } from "../server/errors";
import { validatePublicUrl } from "../seo/safe-fetch";
import { providerJson } from "./http";
export async function pageSpeed(url: string) {
  await validatePublicUrl(url);
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance",
    key: required("PAGESPEED_API_KEY"),
  });
  type Result = {
    lighthouseResult: {
      categories: { performance: { score: number | null } };
      audits: Record<
        string,
        { title: string; displayValue?: string; numericValue?: number }
      >;
    };
    loadingExperience?: { metrics?: unknown; overall_category?: string };
  };
  const r = await providerJson<Result>(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    {},
    90_000,
  );
  const audits = r.lighthouseResult.audits;
  return {
    url,
    observedAt: new Date().toISOString(),
    lab: {
      score: r.lighthouseResult.categories.performance.score,
      metrics: [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
        "speed-index",
      ].map((k) => ({ key: k, ...audits[k] })),
    },
    field: r.loadingExperience?.metrics ? r.loadingExperience : null,
    note: "Lighthouse is a lab test. Field data, when available, represents real-user measurements.",
  };
}
