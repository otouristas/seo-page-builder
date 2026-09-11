import { parseSnapshot } from "./seo/audit";
import type { ProjectData } from "./server/project-data";
import type { Project } from "./types";
const created = "2026-09-01T10:00:00.000Z";
const project: Project = {
  id: "example",
  workspace_id: "example",
  name: "Olive & Earth",
  url: "https://oliveandearth.example/",
  description:
    "An illustrative independent shop for extra virgin olive oil, with practical guides to choosing and cooking with olive oil.",
  country: "US",
  language: "en",
  gsc_property: "sc-domain:oliveandearth.example",
  logo: null,
  weekly_scan: false,
  scan_limit: 20,
  email_digest: false,
  created_at: created,
};
const page = parseSnapshot(
  '<!doctype html><html lang="en"><head><title>Extra Virgin Olive Oil | Olive & Earth</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="canonical" href="https://oliveandearth.example/collections/olive-oil"></head><body><main><h1>Olive oil, with a story</h1><p>Explore our collection of extra virgin olive oils. Discover how to choose an oil for everyday cooking, finishing vegetables, or sharing with friends.</p><h2>Find your everyday favorite</h2><a href="/guides/choosing-olive-oil">How to choose olive oil</a></main></body></html>',
  `${project.url}collections/olive-oil`,
  { fetchedAt: created, source: "rendered" },
);
page.findings = page.findings.map((f) => ({
  ...f,
  evidence: { ...f.evidence, source: "Illustrative example", status: "sample" },
}));
const opportunity = (
  id: string,
  title: string,
  detail: string,
  path: string,
  key: string,
  effort = "small",
) => ({
  id,
  title,
  detail,
  page_url: `${project.url}${path}`,
  finding_key: key,
  effort,
  status: "open",
  verified_at: null,
  evidence: {
    source: "Illustrative product example",
    observedAt: created,
    market: "US",
    status: "sample",
    detail,
    severity: "medium",
  },
});
const gsc = Array.from({ length: 56 }, (_, i) => {
  const d = new Date("2026-07-11T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + i);
  return {
    date: d.toISOString().slice(0, 10),
    dataset: "totals",
    query: "",
    page: "",
    country: "",
    device: "",
    clicks: Math.round(51 + i * 0.9 + Math.sin(i * 1.3) * 12),
    impressions: Math.round(1800 + i * 17 + Math.sin(i) * 180),
    position: 11 - i * 0.055,
  };
});
export const DEMO_DATA: ProjectData = {
  project,
  projects: [project],
  plan: "nigiri",
  limits: { projects: 3, pages: 750, drafts: 75, answers: 120, serps: 75 },
  period: "Sample monthly period",
  subscription: null,
  usage: [
    { kind: "pages", amount: 48 },
    { kind: "drafts", amount: 12 },
    { kind: "answers", amount: 8 },
    { kind: "serps", amount: 4 },
  ],
  pages: [page],
  opportunities: [
    opportunity(
      "description",
      "Give your collection a search description",
      "The collection page has no meta description. Write an accurate summary that helps shoppers understand what they will find. Google may choose a different snippet.",
      "collections/olive-oil",
      "description",
    ),
    opportunity(
      "questions",
      "Answer the questions customers ask",
      "The sample guide introduces olive oil but does not compare flavor and cooking uses. A short, evidence-backed comparison could help readers choose.",
      "guides/choosing-olive-oil",
      "answer",
      "medium",
    ),
    opportunity(
      "links",
      "Connect your most useful pages",
      "The sample guide does not link to the collection it discusses. Add a contextual link that helps visitors take their next step.",
      "guides/choosing-olive-oil",
      "links",
    ),
    opportunity(
      "author",
      "Introduce the person behind the advice",
      "The sample guide has no identifiable author. Add a genuine byline and relevant experience, if applicable to this editorial content.",
      "guides/choosing-olive-oil",
      "authorship",
    ),
  ],
  drafts: [
    {
      id: "sample-draft",
      title: "A clearer invitation to your collection",
      kind: "metadata",
      created_at: created,
      draft_revisions: [
        {
          id: "revision-1",
          version: 1,
          created_at: created,
          content:
            "Title: Extra Virgin Olive Oil | Olive & Earth\n\nDescription: Find an extra virgin olive oil for everyday cooking and finishing your favorite dishes. Explore the Olive & Earth collection and choosing guide.\n\nEvidence: https://oliveandearth.example/collections/olive-oil\n\nEditorial note: Confirm the collection includes oils suited to both uses before publishing.",
        },
      ],
    },
  ],
  jobs: [
    {
      id: "sample-crawl",
      workspace_id: "example",
      project_id: "example",
      kind: "crawl",
      status: "completed",
      stage: "All rolled up",
      input: { limit: 48 },
      output: {
        successful: 48,
        failed: [],
        blocked: [],
        unvisited: 0,
        discovered: 48,
        note: "Illustrative crawl summary. One representative page is available in this demo.",
      },
      error: null,
      created_at: created,
      updated_at: created,
    },
  ],
  answers: [
    {
      id: "sample-answer",
      provider: "Example answer",
      model: "Illustrative output",
      prompt: "How do I choose an olive oil for everyday cooking?",
      answer:
        "Start with what you cook most often. Compare flavor, bottle size, storage advice, and the information the producer provides. A guide that clearly explains these differences can make your decision easier.\n\nThis is a written product example, not an answer returned by a live AI provider.",
      citations: [
        {
          url: "https://oliveandearth.example/guides/choosing-olive-oil",
          title: "Example choosing guide",
        },
      ],
      mentions: [],
      market: "US",
      created_at: created,
    },
  ],
  reports: [],
  gsc,
  connections: {
    gsc: "sample",
    providers: {
      firecrawl: false,
      openai: false,
      perplexity: false,
      serp: false,
      pagespeed: false,
      background: false,
      billing: false,
      email: false,
    },
  },
  email: "alex@example.com",
  sample: true,
};
