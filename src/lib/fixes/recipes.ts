export type FixRecipe = {
  label: string;
  location: string;
  steps: string[];
  check: string;
  caution: string;
};
export const FIX_RECIPES: Record<string, FixRecipe> = {
  title: {
    label: "Page title",
    location: "The page’s SEO title field or title metadata in its template.",
    steps: [
      "Open the affected page in your website editor and find its SEO or search appearance settings.",
      "Write a specific title that accurately names what the page offers. Keep your brand name where it helps.",
      "Check the preview for readability. Save a draft, review it, then publish through your usual process.",
    ],
    check:
      "Recheck the page and compare the fetched title with your approved wording. Google can display a different title.",
    caution:
      "Do not force an arbitrary character count or add claims the page cannot support.",
  },
  description: {
    label: "Search description",
    location: "The page’s meta description field in SEO settings.",
    steps: [
      "Open the affected page’s SEO settings and find Meta description or Search description.",
      "Summarize the actual page in one or two clear sentences. Say who it helps and what the visitor can do next.",
      "Review the preview, save the change and publish it through your website editor.",
    ],
    check:
      "Recheck the meta description in the inspected HTML. A search engine may use another passage as its snippet.",
    caution:
      "A missing description is an opportunity to clarify the page, not proof of a ranking penalty.",
  },
  headings: {
    label: "Page headings",
    location:
      "The main page heading and section headings in the content editor or page template.",
    steps: [
      "Open the page and identify the main heading a visitor sees.",
      "Make the heading explain the page’s purpose. Use descriptive section headings to organize the answer.",
      "Preview the page on a phone and desktop. Check that headings describe the structure rather than just making text larger.",
    ],
    check:
      "Recheck the live page and inspect its H1–H3 headings, then read the page to confirm the structure makes sense.",
    caution:
      "Multiple H1 elements are not automatically a failure. Keep legitimate layout and accessibility choices.",
  },
  canonical: {
    label: "Preferred URL",
    location:
      "Advanced SEO settings, a canonical URL field, or the canonical link in the page template.",
    steps: [
      "Decide which public URL should be the preferred version. Compare duplicates, redirects and language versions first.",
      "Ask the site owner to confirm that preferred URL before changing a canonical.",
      "Set one consistent canonical declaration in the owning template or SEO tool. Avoid competing declarations from multiple plugins.",
    ],
    check:
      "Inspect the live canonical link and confirm its destination works and is the intended preferred page.",
    caution:
      "A canonical pointing elsewhere can be intentional. Do not replace it with a self-canonical automatically.",
  },
  robots: {
    label: "Indexing preference",
    location:
      "Search visibility settings and any robots meta tag or X-Robots-Tag response header.",
    steps: [
      "Confirm whether this page should appear in search. Account pages, private reports and intentional exclusions should stay excluded.",
      "If the owner confirms that it should be public and indexable, find the setting or header that applies noindex.",
      "Change only the unintended exclusion. Review access controls separately before publishing.",
    ],
    check:
      "Inspect both live response headers and HTML, then use Search Console URL Inspection when available.",
    caution:
      "Never remove noindex, login protections or other access controls simply to clear a warning.",
  },
  http: {
    label: "Page response",
    location:
      "The website’s page routing, redirect settings or hosting configuration.",
    steps: [
      "Open the affected URL and check the exact HTTP response and redirect destination.",
      "If this page should exist, investigate its route, slug and hosting error. If it moved or was removed, confirm the intended replacement or removal.",
      "Fix the underlying route or approved redirect. Ask your developer or host for help when this is outside your editor.",
    ],
    check:
      "Fetch the URL again and verify the expected response and destination. An intentionally removed page can correctly return 404 or 410.",
    caution:
      "Do not turn every error into a 200 page or redirect unrelated URLs to the homepage.",
  },
  viewport: {
    label: "Mobile layout",
    location: "The shared page head or responsive theme settings.",
    steps: [
      "Preview the affected page at phone width and note overflowing text, controls or columns.",
      "Ask the developer to check the viewport declaration and responsive layout in the owning template.",
      "Keep text zoom available and test forms, navigation and content on a narrow screen.",
    ],
    check:
      "Confirm an appropriate viewport and check that content fits a phone without horizontal page scrolling.",
    caution:
      "Do not disable pinch zoom or add duplicate viewport declarations.",
  },
  alt: {
    label: "Image descriptions",
    location:
      "Each image’s alternative text field in the media library or content editor.",
    steps: [
      "Find the images on the affected page and decide which convey information and which are decorative.",
      "Write concise alternative text for meaningful images based on what the image actually shows and its role on the page.",
      "Use empty alt text for decorative images. Check image links and buttons have a useful accessible name.",
    ],
    check:
      "Recheck image attributes and inspect each image in context. Missing and intentionally empty alt text are different.",
    caution:
      "The audit may not identify individual image files. Locate them before editing; do not invent descriptions or stuff keywords.",
  },
  schema: {
    label: "Structured data",
    location: "JSON-LD in the page template or your structured-data plugin.",
    steps: [
      "Find the existing JSON-LD and the feature it is meant to describe.",
      "Correct malformed JSON and confirm the schema type and fields match visible, supported page content.",
      "Test the draft with the relevant validator, review the page and publish only accurate markup.",
    ],
    check:
      "Recheck the JSON-LD, inspect any remaining validation messages and compare factual fields with the visible page.",
    caution:
      "Do not invent reviews, ratings, prices, people or eligibility claims. Valid JSON alone does not establish rich-result eligibility.",
  },
  readable: {
    label: "Readable content",
    location: "The page body, content blocks or rendering template.",
    steps: [
      "Open the page as a visitor and compare what you see with the fetched evidence.",
      "If content appears only after JavaScript runs, inspect rendered HTML before assuming that content is missing.",
      "Clarify the answer to the visitor’s actual question. Add only useful, supported information.",
    ],
    check:
      "Recheck the relevant fetched or rendered content, and have a person confirm that it answers the page’s intended question.",
    caution:
      "Do not add filler to reach a word-count target. Short pages can be useful.",
  },
  links: {
    label: "Internal links",
    location:
      "Relevant passages, navigation or related-content blocks on the page.",
    steps: [
      "Identify existing pages that would help the visitor take the next step.",
      "Add a link where it is useful, using descriptive link text that matches the destination.",
      "Open each destination and check that the link works and belongs in the same user journey.",
    ],
    check:
      "Recheck the live links and click through to the approved destination pages.",
    caution:
      "Do not invent URLs or add unrelated links to meet a link-count target.",
  },
  language: {
    label: "Content language",
    location:
      "The document language setting or the html lang attribute in the page template.",
    steps: [
      "Identify the actual language used in the page content.",
      "Set the document language to the appropriate language tag in the website or template settings.",
      "If the site is multilingual, check each locale’s template separately.",
    ],
    check:
      "Inspect the live html lang attribute and confirm it matches the page’s real language.",
    caution:
      "A target country does not determine the language of the content. Do not relabel or translate content without review.",
  },
  authorship: {
    label: "Authorship",
    location: "A relevant byline, author profile or page ownership statement.",
    steps: [
      "Decide whether this page needs an author or a responsible organization identified.",
      "Ask the owner for the real author’s name, role and relevant experience before adding a byline.",
      "Add useful, accurate authorship information in visible content and consistent metadata where appropriate.",
    ],
    check:
      "Inspect the live byline and profile. A human reviewer should confirm the identity and experience are accurate.",
    caution:
      "Do not invent credentials or assume that missing author metadata proves missing authorship.",
  },
  answer: {
    label: "Helpful answers",
    location: "A relevant answer section in the page’s main content.",
    steps: [
      "Write down the specific question this page should answer and who is asking it.",
      "Gather confirmed business facts and credible sources. Write a direct answer followed by useful detail.",
      "Review every claim and place the answer where it helps visitors. Keep it consistent with the rest of the page.",
    ],
    check:
      "Recheck that the approved answer is present, then review its clarity and source support. This is not a guarantee of an AI citation.",
    caution:
      "A search question is a research prompt, not permission to invent an answer or copy a competitor.",
  },
  coverage: {
    label: "Incomplete evidence",
    location:
      "The audit source and the part of the page that was not inspected.",
    steps: [
      "Read the reason the response was incomplete or truncated.",
      "Inspect the missing content in a browser or with a suitable bounded rendered crawl.",
      "Reassess the finding only after collecting the missing evidence.",
    ],
    check:
      "Confirm the new inspection covers the relevant content before marking an issue resolved.",
    caution:
      "Do not change the website just because the inspection was incomplete.",
  },
};
export function recipeFor(key: string): FixRecipe {
  const normalized =
    key === "h1" ? "headings" : key === "schema-alignment" ? "schema" : key;
  return (
    FIX_RECIPES[normalized] || {
      label: "Review this finding",
      location: "The affected page and the evidence attached to this finding.",
      steps: [
        "Read the finding and open the affected page.",
        "Confirm that the suggested change applies to this page and identify the setting, content block or template that owns it.",
        "Prepare the smallest useful change, review it and publish through your normal process.",
      ],
      check:
        "Collect fresh evidence and compare it with the original finding. Keep the issue open if evidence is missing.",
      caution:
        "Ask for the missing context before changing an unfamiliar setting. Do not guess the cause.",
    }
  );
}
