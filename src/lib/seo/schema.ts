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
  Review: ["reviewRating", "author"],
  AggregateRating: ["ratingValue"],
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
  const queue: {
    node: unknown;
    path: string;
    depth: number;
    relation?: string;
    parent?: Record<string, unknown>;
  }[] = [{ node: data, path: "$", depth: 0 }];
  let visited = 0;
  const visible = visibleText.toLowerCase().replace(/\s+/g, " ").trim();
  while (queue.length && visited++ < 1000) {
    const { node, path, depth, relation, parent } = queue.shift()!;
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
        queue.push({
          node: n,
          path: `${path}[${i}]`,
          depth: depth + 1,
          relation,
          parent,
        }),
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
    if (types.some((type) => type === "Review" || type === "AggregateRating")) {
      const nested =
        (relation === "review" && types.includes("Review")) ||
        (relation === "aggregateRating" && types.includes("AggregateRating"));
      if (nested && parent) {
        if (object.itemReviewed !== undefined)
          result.issues.push({
            level: "review",
            path: `${path}.itemReviewed`,
            message:
              "This rating or review is nested under its subject. Google’s review snippet guidance says to omit itemReviewed here and use the parent entity, avoiding an ambiguous subject.",
          });
        if (!parent.name && !parent["@id"])
          result.issues.push({
            level: "review",
            path,
            message:
              "The parent reviewed entity has no name or reference. Confirm the named subject of this nested review.",
          });
      } else if (!object.itemReviewed) {
        result.issues.push({
          level: "review",
          path: `${path}.itemReviewed`,
          message:
            "A standalone rating or review needs an identifiable itemReviewed. Link it to the actual reviewed entity.",
        });
      }
      const subject = nested ? parent : object.itemReviewed;
      if (subject && typeof subject === "object") {
        const rawType = (subject as Record<string, unknown>)["@type"];
        const subjectTypes = Array.isArray(rawType) ? rawType : [rawType];
        if (
          subjectTypes.some(
            (type) => type === "Organization" || type === "LocalBusiness",
          )
        )
          result.issues.push({
            level: "review",
            path,
            message:
              "Confirm who controls these business reviews. Self-serving Organization or LocalBusiness reviews are not eligible for Google review stars, including embedded third-party widgets. Ownership has not been established by this check.",
          });
      }
      result.issues.push({
        level: "info",
        path,
        message:
          "Confirm review provenance, visible supporting content and any incentive disclosure. These facts cannot be verified from JSON alone.",
      });
    }
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
        queue.push({
          node: value,
          path: `${path}.${key}`,
          depth: depth + 1,
          relation: key,
          parent: object,
        });
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
