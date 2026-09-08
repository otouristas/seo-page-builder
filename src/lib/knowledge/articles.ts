import type { LearningArticle } from "../learning/content";
import { CORPUS_RULES, CORPUS_VERSION, EVIDENCE_LABELS } from "./corpus";
export const CORPUS_ARTICLES: LearningArticle[] = [
  {
    slug: "seo-evidence-library",
    title: "The SEO evidence library",
    category: "Evidence & methods",
    description:
      "Find the evidence behind your next SEO fix. Search practical methods, check the source, and copy a brief with implementation and verification steps.",
    summary: `${CORPUS_RULES.length} curated methods for useful SEO work. Google guidance, vendor research and RankSushi workflows carry separate labels. These methods inform fix prompts and Content Studio; observations about your website still come from your own evidence.`,
    updated: "2026-09-09",
    tags: ["evidence", "corpus", "research", "methods", "guidance"],
    sections: [
      {
        id: "how-to-use",
        title: "A source. A decision. A next step.",
        paragraphs: [
          "Start with the problem you actually observed. Choose a method below, inspect its source and copy the brief. Add your public page URL and evidence before handing it to your editor, developer or AI assistant.",
          `This edition (${CORPUS_VERSION}) was curated from eleven research reviews dated August 22–September 1, 2026, with source checks and editorial review on September 9. It is a selected working library, not a complete crawl of every SEO source. New evidence may change a method.`,
          "Google guidance describes the documented behavior or requirements of a feature. Vendor research describes a particular study. RankSushi workflows are our practical interpretations. None is proof that a particular change will increase your rankings.",
        ],
      },
      ...CORPUS_RULES.map((r) => ({
        id: r.id,
        title: r.title,
        paragraphs: [
          `${EVIDENCE_LABELS[r.category]} · Reviewed ${r.reviewed}`,
          `Use when: ${r.when}`,
          r.action,
          `Keep in mind: ${r.guardrail}`,
          `Verify: ${r.verify}`,
        ],
        sourceIds: r.sourceIds,
      })),
    ],
    checklist: [
      "Record the affected URL, observation and date.",
      "Choose an applicable method and inspect the source.",
      "Supply missing business facts before preparing a change.",
      "Review, implement and recheck the live page.",
      "Compare later performance with the conditions and time window recorded.",
    ],
    related: [
      "/learn/original-evidence-content",
      "/help/fix-prompts",
      "/methodology",
    ],
    action: { label: "Inspect a page first", href: "/tools/seo-audit" },
  },
  {
    slug: "original-evidence-content",
    title: "Write the page only your business can write",
    category: "Content strategy",
    description:
      "A practical information-gain workflow: answer the visitor’s question, identify what is missing, add defensible original evidence, and prepare a reviewable brief.",
    summary:
      "The useful difference is a fact, example, tool or explanation your visitor could not get from a paraphrase of the existing results. Name that contribution before asking for a draft.",
    updated: "2026-09-09",
    tags: ["content", "brief", "original", "information gain", "evidence"],
    sections: [
      {
        id: "question",
        title: "Start with the job the visitor needs done",
        paragraphs: [
          "Write the visitor’s question and the decision a good answer should enable. Save the observed query, market, result date and relevant pages. A suggestion without demand data can still be useful, but label it as an editorial idea.",
          "For ‘how to fix a missing page title,’ the job is to find the setting, write an accurate title and verify the output. A long history of SEO does not help complete that job.",
        ],
        sourceIds: ["corpus-helpful"],
      },
      {
        id: "contribution",
        title: "Choose an ingredient you can substantiate",
        paragraphs: [
          "List what the existing results already cover. Then identify one meaningful gap you can answer with evidence you own or can legitimately cite. Do not invent expertise to make the page seem distinctive.",
          "For RankSushi, an original contribution can be a working metadata preview, an editable fix brief, or a dated SERP capture with its source and limits visible. The useful result is the evidence; claiming ‘the best SEO tool’ adds none.",
        ],
        items: [
          "First-hand observation: who observed it, when, and under what conditions?",
          "Measured result: what was measured, with which method and limitations?",
          "Expert explanation: who can verify the explanation and any exceptions?",
          "Usable tool: what task does the output let the visitor complete?",
        ],
        sourceIds: ["corpus-original"],
      },
      {
        id: "brief",
        title: "Give the draft a proof requirement",
        paragraphs: [
          "Write a short brief containing the visitor question, required coverage, original contribution, supporting evidence, intended format and next action. If the original contribution is missing, ask the owner for it before drafting that claim.",
          "Content Studio receives applicable library methods alongside your page evidence. Its methods guide the process; they cannot supply your prices, qualifications or results. Unsupported claims should remain marked for confirmation.",
        ],
        sourceIds: ["corpus-generative"],
      },
      {
        id: "review",
        title: "Review the work, then observe what happened",
        paragraphs: [
          "Check each important claim, test the tool or example, and confirm internal links and metadata. Publish only after review. Rechecking verifies the page change; Search Console later shows observed performance.",
          "Information gain is a useful editorial framework. It is not a confirmed scoring formula to maximize, and a distinctive page does not come with a guaranteed position.",
        ],
        sourceIds: ["corpus-original", "corpus-helpful"],
      },
    ],
    checklist: [
      "Name the visitor’s question and decision.",
      "Record what the existing results cover.",
      "Choose one original contribution and its source.",
      "Mark missing facts [Confirm: …].",
      "Review the draft, test the output and recheck the page.",
    ],
    related: [
      "/learn/seo-evidence-library",
      "/learn/search-intent-content-map",
      "/help/drafts-and-rechecks",
    ],
    action: { label: "Try an editable SERP example", href: "/demo" },
  },
];
