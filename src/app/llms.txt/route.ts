import { COLLECTIONS } from "@/lib/learning/content";
import { CANONICAL_URL } from "@/lib/utils";
export const dynamic = "force-static";
export function GET() {
  const content = `# RankSushi\n\n> Useful insights, served fresh. RankSushi helps small businesses connect website evidence to practical SEO, AEO, and GEO work. Operated by Touristas Technologies.\n\nWorkflow: connect a website, inspect evidence, prepare an editable draft, publish through your own editor, recheck, and measure observed performance.\n\nEvidence labels distinguish measured observations, inferences, and samples. AI answer checks are sampled API responses, not comprehensive consumer-platform tracking. No rankings, citations, or revenue are guaranteed. Public examples are illustrative. Integration availability depends on account and provider setup.\n\nThis index contains public editorial resources only. It does not grant access to workspaces, account data, or private reports. Guides and their Markdown versions share a source registry. Support: anotherseoguru@gmail.com.\n\n## Product and methodology\n\n- [RankSushi](${CANONICAL_URL}): Product overview.\n- [Methodology](${CANONICAL_URL}/methodology): Evidence, limitations, verification, and interpretation.\n- [Features](${CANONICAL_URL}/features): Audits, Search Console, Content Studio, and AI Visibility.\n- [Pricing](${CANONICAL_URL}/pricing): USD plans, visible allowances, and billing boundaries.\n\n${Object.entries(
    COLLECTIONS,
  )
    .map(
      ([key, articles]) =>
        `## ${key === "learn" ? "Practical guides" : key === "help" ? "Help center" : "Blog"}\n\n${articles.map((a) => `- [${a.title}](${CANONICAL_URL}/${key}/${a.slug}/index.md): ${a.description}`).join("\n")}`,
    )
    .join(
      "\n\n",
    )}\n\n## Optional\n\n- [Sitemap](${CANONICAL_URL}/sitemap): Human-readable public-page directory.\n- [XML sitemap](${CANONICAL_URL}/sitemap.xml): Canonical public HTML URLs.\n- [RSS feed](${CANONICAL_URL}/feed.xml): Published blog articles.\n- [Security](${CANONICAL_URL}/security): Access and storage boundaries.\n- [Privacy](${CANONICAL_URL}/privacy): Data practices and support contact.\n`;
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
