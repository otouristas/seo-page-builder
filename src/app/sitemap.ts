import type { MetadataRoute } from "next";
import { publicPages } from "@/lib/public-pages";
import { CANONICAL_URL } from "@/lib/utils";
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages().map((p) => ({
    url: `${CANONICAL_URL}${p.path === "/" ? "" : p.path}`,
    ...(p.updated ? { lastModified: p.updated } : {}),
    changeFrequency: p.path === "/" ? "weekly" : "monthly",
    priority: p.path === "/" ? 1 : p.path.startsWith("/features/") ? 0.8 : 0.6,
  }));
}
