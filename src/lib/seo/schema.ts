export type SchemaIssue = {
  level: "error" | "review" | "info";
  message: string;
  path: string;
};
export type SchemaValidation = {
  validJson: boolean;
  types: string[];
  issues: SchemaIssue[];
  note: string;
};
const recommendations: Record<string, string[]> = {
  Article: ["headline", "author", "datePublished"],
  NewsArticle: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author", "datePublished"],
  Product: ["name", "image"],
  LocalBusiness: ["name", "address"],
  Organization: ["name", "url"],
  WebPage: ["name", "url"],
  Recipe: ["name", "image", "recipeIngredient", "recipeInstructions"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
};
export function validateStructuredData(
  input: string,
  visibleText = "",
): SchemaValidation {
  const result: SchemaValidation = {
    validJson: false,
    types: [],
    issues: [],
    note: "This checks JSON syntax, selected type fields, and supplied visible-text matches. It is not a complete Schema.org validator or a guarantee of Google rich-result or AI eligibility.",
  };
  let data: unknown;
  try {
    data = JSON.parse(input);
    result.validJson = true;
  } catch {
    result.issues.push({
      level: "error",
      path: "$",
      message:
        "The input is not valid JSON. Check quotes, commas, and brackets.",
    });
    return result;
  }
  const queue: { node: unknown; path: string; depth: number }[] = [
    { node: data, path: "$", depth: 0 },
  ];
  let visited = 0;
  const visible = visibleText.toLowerCase().replace(/\s+/g, " ").trim();
  while (queue.length && visited++ < 1000) {
    const { node, path, depth } = queue.shift()!;
    if (depth > 20) {
      result.issues.push({
        level: "review",
        path,
        message: "Nested data exceeds the inspection depth.",
      });
      continue;
    }
    if (Array.isArray(node)) {
      node.forEach((n, i) =>
        queue.push({ node: n, path: `${path}[${i}]`, depth: depth + 1 }),
      );
      continue;
    }
    if (!node || typeof node !== "object") continue;
    const object = node as Record<string, unknown>;
    const types = Array.isArray(object["@type"])
      ? object["@type"]
      : object["@type"]
        ? [object["@type"]]
        : [];
    for (const type of types) {
      if (typeof type !== "string") continue;
      result.types.push(type);
      for (const field of recommendations[type] || [])
        if (
          object[field] === undefined ||
          object[field] === null ||
          object[field] === ""
        )
          result.issues.push({
            level: "review",
            path: `${path}.${field}`,
            message: `Review ${field} for ${type}. It is commonly relevant; exact eligibility rules depend on the search feature.`,
          });
      if (!recommendations[type])
        result.issues.push({
          level: "info",
          path,
          message: `No specific field checklist is implemented for ${type}. Review its Schema.org definition.`,
        });
    }
    for (const [key, value] of Object.entries(object)) {
      if (
        ["name", "headline", "description", "text"].includes(key) &&
        typeof value === "string" &&
        visible &&
        !visible.includes(value.toLowerCase().replace(/\s+/g, " ").trim())
      )
        result.issues.push({
          level: "review",
          path: `${path}.${key}`,
          message:
            "This value was not matched in the supplied visible content. Confirm it is accurate and visible where required.",
        });
      if (value && typeof value === "object")
        queue.push({ node: value, path: `${path}.${key}`, depth: depth + 1 });
    }
  }
  result.types = [...new Set(result.types)];
  if (!result.types.length)
    result.issues.push({
      level: "review",
      path: "$",
      message:
        "No @type was found. Valid JSON alone is not a structured-data description.",
    });
  const root = Array.isArray(data) ? data[0] : data;
  if (!root || typeof root !== "object" || !("@context" in root))
    result.issues.push({
      level: "review",
      path: "$.@context",
      message:
        "No top-level @context was found. Use a relevant schema context such as https://schema.org.",
    });
  if (!visible)
    result.issues.push({
      level: "review",
      path: "$",
      message:
        "No visible page content was supplied. Factual alignment has not been checked.",
    });
  if (queue.length)
    result.issues.push({
      level: "review",
      path: "$",
      message:
        "The inspection limit was reached; some nested data was not inspected.",
    });
  return result;
}
