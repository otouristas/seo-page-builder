import {
  COLLECTIONS,
  SOURCES,
  type Collection,
  type LearningArticle,
} from "./content";
import { CANONICAL_URL } from "../utils";
export function articleMarkdown(
  a: LearningArticle,
  collection: Collection,
  checklistOnly = false,
) {
  const intro = `# ${a.title}\n\n> ${a.summary}\n\nSource: ${CANONICAL_URL}/${collection}/${a.slug}\nUpdated: ${a.updated}\nBy RankSushi, Touristas Technologies. Prepared with AI assistance.\n`;
  const sections = a.sections
    .map(
      (s) =>
        `## ${s.title}\n\n${s.paragraphs.join("\n\n")}\n${s.items ? "\n" + s.items.map((x) => `- ${x}`).join("\n") + "\n" : ""}${s.sourceIds ? "\nSources: " + s.sourceIds.map((id) => `[${SOURCES[id].title}](${SOURCES[id].url})`).join("; ") + "\n" : ""}`,
    )
    .join("\n");
  const checklist = `\n## Takeaway checklist\n\n${a.checklist.map((x) => `- [ ] ${x}`).join("\n")}\n\n[${a.action.label}](${a.action.href.startsWith("/") ? CANONICAL_URL : ""}${a.action.href})\n`;
  return (
    intro +
    "\n" +
    (checklistOnly ? "" : sections) +
    checklist +
    "\nGuidance explains a method. It does not guarantee rankings, citations, or outcomes.\n"
  );
}
export function markdownResponse(
  collection: Collection,
  slug: string,
  checklistOnly = false,
) {
  const a = COLLECTIONS[collection].find((x) => x.slug === slug);
  if (!a) return new Response("Not found", { status: 404 });
  return new Response(articleMarkdown(a, collection, checklistOnly), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
      Link: `<${CANONICAL_URL}/${collection}/${slug}>; rel="canonical", <${CANONICAL_URL}/llms.txt>; rel="describedby"`,
      ...(checklistOnly
        ? {
            "Content-Disposition": `attachment; filename="ranksushi-${slug}-checklist.md"`,
          }
        : {}),
    },
  });
}
