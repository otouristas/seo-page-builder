import type { MetadataRoute } from "next";
import { ARTICLES, FEATURES, TOOL_PAGES } from "@/lib/content";
import { CANONICAL_URL } from "@/lib/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/features",
    "/pricing",
    "/tools",
    ...Object.keys(ARTICLES).map((k) => `/${k}`),
    ...Object.keys(FEATURES).map((k) => `/features/${k}`),
    ...Object.keys(TOOL_PAGES).map((k) => `/tools/${k}`),
  ].map((path) => ({
    url: `${CANONICAL_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/features/") ? 0.8 : 0.6,
  }));
}
