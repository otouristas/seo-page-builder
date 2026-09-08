import type { SeoSnapshot } from "./types";

export function fillSnapshot(s: SeoSnapshot): SeoSnapshot {
  const excerpt =
    s.excerpt ||
    [s.h1[0], s.h2.slice(0, 3).join(". "), s.metaDescription].filter(Boolean).join(". ").slice(0, 400);
  return {
    ...s,
    wordCountMain: s.wordCountMain || s.wordCount,
    excerpt,
    hreflang: s.hreflang ?? [],
    xRobots: s.xRobots ?? null,
    status: s.status || 200,
    redirected: s.redirected ?? false,
  };
}
