export function guideForFinding(id: string) {
  if (/title|description|h1|heading/.test(id))
    return {
      slug: "titles-and-snippets",
      label: "Write a clearer title and snippet",
    };
  if (/schema|author|answer|entity/.test(id))
    return {
      slug: "answer-ready-content",
      label: "Review answer-ready content",
    };
  if (/link/.test(id))
    return { slug: "internal-linking", label: "Plan useful internal links" };
  if (/content|word/.test(id))
    return {
      slug: "search-intent-content-map",
      label: "Build a useful content map",
    };
  return { slug: "technical-triage", label: "Understand this audit finding" };
}
