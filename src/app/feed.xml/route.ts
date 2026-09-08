import { BLOG_POSTS } from "@/lib/learning/content";
import { CANONICAL_URL } from "@/lib/utils";
export const dynamic = "force-static";
const xml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function GET() {
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Fresh reads | RankSushi</title><link>${CANONICAL_URL}/blog</link><description>Practical ideas for SEO, AI visibility, and useful content.</description><language>en</language><atom:link href="${CANONICAL_URL}/feed.xml" rel="self" type="application/rss+xml"/>${BLOG_POSTS.map((a) => `<item><title>${xml(a.title)}</title><link>${CANONICAL_URL}/blog/${a.slug}</link><guid isPermaLink="true">${CANONICAL_URL}/blog/${a.slug}</guid><description>${xml(a.description)}</description><pubDate>${new Date(a.updated + "T00:00:00Z").toUTCString()}</pubDate><category>${xml(a.category)}</category></item>`).join("")}</channel></rss>`;
  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
