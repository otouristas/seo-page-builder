import { CORPUS_ARTICLES } from "../knowledge/articles";
import { CORPUS_SOURCES } from "../knowledge/corpus";
export type LearningSection = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
  sourceIds?: string[];
};
export type LearningArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  summary: string;
  updated: string;
  sections: LearningSection[];
  checklist: string[];
  related: string[];
  action: { label: string; href: string };
  tags: string[];
};
export const SOURCES: Record<string, { title: string; url: string }> = {
  ...CORPUS_SOURCES,
  helpful: {
    title: "Google: Creating helpful, reliable content",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
  },
  canonical: {
    title: "Google: Consolidating duplicate URLs",
    url: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
  },
  titles: {
    title: "Google: Title links in Search",
    url: "https://developers.google.com/search/docs/appearance/title-link",
  },
  ai: {
    title: "Google: AI features and your website",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
  },
  schema: {
    title: "Google: Structured data policies",
    url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
  },
  gsc: {
    title: "Google: Search Analytics API coverage",
    url: "https://developers.google.com/webmaster-tools/v1/searchanalytics/query",
  },
  llms: { title: "The llms.txt proposal", url: "https://llmstxt.org/" },
  dfs: {
    title: "DataForSEO: Google Keyword Overview",
    url: "https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live/",
  },
};
const updated = "2026-09-09";
export const GUIDES: LearningArticle[] = [
  ...CORPUS_ARTICLES,
  {
    slug: "search-intent-content-map",
    title: "Turn keywords into a useful content map",
    category: "Content strategy",
    description:
      "Sort queries by the decision they serve, map them to existing pages, and build a content brief with evidence and clear publishing gates.",
    summary:
      "Start with a customer decision. Group related queries around it, choose one suitable page, and keep the evidence behind every proposed change.",
    updated,
    tags: [
      "keyword",
      "intent",
      "brief",
      "content",
      "roadmap",
      "research",
      "demand",
    ],
    sections: [
      {
        id: "decision",
        title: "Name the decision before the keyword",
        paragraphs: [
          "Write one sentence describing what the visitor needs to decide. ‘Choose an olive oil for everyday cooking’ is a clearer assignment than ‘write about olive oil.’ Add the audience, market, available products, and the next step a useful page should support.",
          "Collect queries from Search Console, customer questions, and an explicitly requested research lookup. Keep their origins separate. A customer question has qualitative value; it does not have a measured search volume just because it sounds plausible.",
        ],
      },
      {
        id: "map",
        title: "Give each intent a home",
        paragraphs: [
          "Group wording variants that would be satisfied by the same answer. Compare the group with existing pages before proposing another URL. If a page already does the job, consider improving it rather than splitting its purpose across near-duplicates.",
          "Use the worksheet below to record the query, intent, current URL, proposed action, evidence, and owner. Keep an explicit ‘exclude’ decision for queries unrelated to the business. This makes the content map a working plan, not a growing pile of keywords.",
        ],
        items: [
          "Keep: the query fits a real customer decision and the business can answer it.",
          "Merge: the answer belongs on an existing page with the same purpose.",
          "Exclude: the intent, market, or offer does not fit.",
        ],
      },
      {
        id: "brief",
        title: "Write the brief before the page",
        paragraphs: [
          "Give the writer a primary question, supporting questions, business facts to verify, and useful source pages. Include the answer format: a comparison, explanation, checklist, or product page. Treat the search results as context, not an outline to copy.",
          "Our publishing gate asks whether the proposed page has a distinct purpose, credible inputs, useful visible content, an internal discovery path, and a named reviewer. A new URL is the output of that review, not the starting assumption.",
        ],
        sourceIds: ["helpful"],
      },
    ],
    checklist: [
      "Customer decision and intended audience",
      "Query, market, source, and observation date",
      "Keep / merge / exclude decision with reason",
      "Existing URL or proposed canonical URL",
      "Supporting questions and facts to verify",
      "Internal links, reviewer, and next action",
    ],
    related: [
      "/learn/internal-linking",
      "/blog/a-90-day-seo-plan",
      "/help/drafts-and-rechecks",
    ],
    action: { label: "Explore Content Studio", href: "/demo/content-studio" },
  },
  {
    slug: "technical-triage",
    title: "Triage an audit without chasing every warning",
    category: "Technical SEO",
    description:
      "Separate crawl access, indexing intent, canonical decisions, and missing evidence before prioritizing a technical SEO fix.",
    summary:
      "First decide whether the page should be discoverable. Then inspect access, indexing intent, canonical signals, and the evidence behind each warning.",
    updated,
    tags: [
      "canonical",
      "robots",
      "noindex",
      "technical",
      "crawl",
      "status",
      "redirect",
      "audit",
    ],
    sections: [
      {
        id: "purpose",
        title: "Start with the page’s job",
        paragraphs: [
          "A public product guide and a private account screen need different outcomes. Record whether the page is intended for search discovery, which URL represents it, and who owns that decision. A warning is not a request to remove every noindex directive.",
          "Work through the customer journey before the longest issue list. A broken intended landing page usually deserves investigation before a stylistic heading observation on a working page.",
        ],
      },
      {
        id: "evidence",
        title: "Inspect the actual response",
        paragraphs: [
          "Keep the requested URL, final URL, response status, retrieval time, and HTML source together. A fetched response and a rendered page can contain different content. A timeout means the observation failed; it does not establish that the title, heading, or markup is missing.",
          "When sources disagree, preserve both observations and reproduce the difference. Check whether consent, JavaScript, redirects, or crawler access changes what is available. Avoid turning an incomplete crawl into a website-wide conclusion.",
        ],
      },
      {
        id: "canonical",
        title: "Review canonical choices in context",
        paragraphs: [
          "An alternate canonical can be intentional. Google treats canonical declarations as signals and can choose a different representative URL. Align internal links and sitemap entries with the version you intend to represent the content.",
          "Record the reason for any change, publish it through your editor, and recheck the same page. If the observed response changed as intended, record implementation verified. Search performance is a separate follow-up.",
        ],
        sourceIds: ["canonical"],
      },
    ],
    checklist: [
      "Page is intended for public discovery",
      "Requested and final URLs recorded",
      "HTTP and rendered evidence identified separately",
      "Indexing and canonical intent confirmed",
      "Highest-impact access issues investigated first",
      "Same page rechecked after the change",
    ],
    related: [
      "/learn/measure-before-after",
      "/help/understanding-evidence",
      "/features/website-audits",
    ],
    action: { label: "Audit a page", href: "/tools/seo-audit" },
  },
  {
    slug: "titles-and-snippets",
    title: "Write titles that make a clear invitation",
    category: "On-page SEO",
    description:
      "Prepare accurate titles and descriptions around a page’s purpose, preview them, and review the live implementation.",
    summary:
      "Describe the page people will actually get. Be specific about its purpose, keep promises supportable, and use previews as a visual aid.",
    updated,
    tags: ["title", "description", "metadata", "snippet", "heading", "h1"],
    sections: [
      {
        id: "promise",
        title: "Make one accurate promise",
        paragraphs: [
          "Read the page before rewriting its title. Identify the product, question, audience, and distinguishing detail that the page genuinely supports. Replace a vague label such as ‘Products’ with a description that helps a visitor recognize the destination.",
          "For a hypothetical olive-oil collection, ‘Extra Virgin Olive Oils | Olive & Earth’ is more informative than ‘Products.’ This is a copy example, not evidence of higher click-through rate. Do not add ‘best,’ a discount, or a delivery promise unless the page and business support it.",
        ],
      },
      {
        id: "preview",
        title: "Preview the invitation, not a ranking prediction",
        paragraphs: [
          "Google generates title links using several sources and may display wording different from the title element. Descriptive, concise titles help communicate the page’s subject; an exact character target cannot guarantee the displayed result.",
          "Use the metadata preview to inspect clarity and likely visual truncation. The preview is illustrative. Read the title and description together and ask whether the destination fulfills the promise.",
        ],
        sourceIds: ["titles"],
      },
      {
        id: "verify",
        title: "Keep the revision and check the live page",
        paragraphs: [
          "Save the original wording, proposed revision, source URL, and reason for the change. Review it with the page owner, apply it in the website editor, and recheck the page in RankSushi.",
          "If you later compare search data, use equivalent reporting periods and record other changes. A different CTR can be associated with many factors, including query mix and position. Avoid declaring a copy test won from a single before-and-after number.",
        ],
      },
    ],
    checklist: [
      "Title describes the actual destination",
      "Specific wording replaces a vague label",
      "Claims, prices, and promises are supported",
      "Preview inspected without treating it as a Google result",
      "Original and new wording saved",
      "Live page rechecked",
    ],
    related: [
      "/tools/metadata-preview",
      "/learn/measure-before-after",
      "/help/drafts-and-rechecks",
    ],
    action: { label: "Preview your metadata", href: "/tools/metadata-preview" },
  },
  {
    slug: "answer-ready-content",
    title: "Make your page easier to understand and cite",
    category: "AEO & GEO",
    description:
      "Review answer clarity, entities, evidence, authorship, and relevant markup while measuring AI answer samples honestly.",
    summary:
      "Give the reader a clear answer, identify the subject consistently, and attach credible support to important claims. Inspect AI responses as dated samples.",
    updated,
    tags: [
      "answer",
      "ai",
      "aeo",
      "geo",
      "schema",
      "author",
      "entity",
      "citation",
      "coach",
    ],
    sections: [
      {
        id: "answer",
        title: "Answer the question that brought the reader",
        paragraphs: [
          "Put a direct answer near the relevant question, then explain the conditions and exceptions that matter. A table helps when the user is comparing equivalent attributes; a checklist helps when the user is completing a task. Choose the format because it serves the question.",
          "Use the business, product, and author names consistently. Link to the person or organization responsible for the content. Separate your own claims from independent evidence so the reader can assess both.",
        ],
      },
      {
        id: "markup",
        title: "Make the visible page the source of truth",
        paragraphs: [
          "Structured data should describe the page’s visible, relevant content. Valid syntax does not make an unsupported review, price, or qualification acceptable. Confirm the facts and applicable type before exporting a draft.",
          "Google’s AI features do not require additional AI-specific markup. RankSushi’s readiness checklist is an editorial review aid, not an eligibility score or promise of citation.",
        ],
        sourceIds: ["schema", "ai"],
      },
      {
        id: "samples",
        title: "Keep the answer sample attached to its context",
        paragraphs: [
          "For an AI check, keep the exact prompt, provider, returned model, timestamp, market, answer, and citations. Review whether a brand mention is accurate and relevant before counting it as useful exposure.",
          "A sampled API response does not represent every consumer conversation. Use repeatable questions to support an investigation, and keep mention, citation, and answer accuracy as different observations.",
        ],
        items: [
          "Mention: the name appears in the returned text.",
          "Citation: a returned source points to a relevant page.",
          "Accuracy: the surrounding claim is supported by that source.",
        ],
      },
    ],
    checklist: [
      "A direct answer with useful qualifications",
      "Consistent business and product identity",
      "Sources close to important claims",
      "Responsible author or organization identified",
      "Markup matches visible facts",
      "Samples retain prompt, model, date, and citations",
    ],
    related: [
      "/blog/seo-aeo-geo",
      "/blog/llms-txt-without-the-myths",
      "/features/ai-visibility",
    ],
    action: { label: "Explore AI Visibility", href: "/demo/ai-visibility" },
  },
  {
    slug: "internal-linking",
    title: "Build internal links around the next useful question",
    category: "Content strategy",
    description:
      "Map relevant links between existing pages with clear anchors, useful destinations, and a reviewable linking worksheet.",
    summary:
      "Link when the destination helps the reader’s next decision. Use existing, relevant pages and wording that describes where the link leads.",
    updated,
    tags: ["link", "internal-links", "navigation", "orphan", "content", "hub"],
    sections: [
      {
        id: "journey",
        title: "Follow a real reading journey",
        paragraphs: [
          "Start with one important landing page. List what someone may need before they can act: a definition, a comparison, a product detail, or a practical answer. Locate existing pages that satisfy those needs.",
          "A guide to selecting olive oil might lead to a comparison of varieties, then a relevant collection. This is a proposed reading journey. Confirm that those destinations exist and contain useful information before preparing the links.",
        ],
      },
      {
        id: "worksheet",
        title: "Record the link as an editorial decision",
        paragraphs: [
          "For each suggestion, record the source URL, destination URL, proposed anchor, placement, and reason. Anchors should describe the destination. Avoid inserting the same exact phrase everywhere simply to meet a keyword target.",
          "There is no need to invent a required number of links for every page. A short answer may need one relevant destination; a resource hub may need many. Review usefulness, destination quality, and navigation together.",
        ],
        items: [
          "Source: the page where the reader needs the next step.",
          "Destination: an existing page that satisfies it.",
          "Anchor: a clear description of that destination.",
          "Reason: the reader question this link helps resolve.",
        ],
      },
      {
        id: "check",
        title: "Check the complete path",
        paragraphs: [
          "After publishing, open each destination and verify the link text, target, and resulting page. Correct broken targets and unintended redirect chains. Recheck the edited page so its saved snapshot records the change.",
          "Keep the linking worksheet with the content map. When a page is consolidated or retired, use it to identify the source pages that may need updating. This avoids leaving the next editor to rediscover the same dependencies.",
        ],
      },
    ],
    checklist: [
      "Existing source and destination pages confirmed",
      "Each link serves a reader question",
      "Anchor describes the destination",
      "Placement and reason recorded",
      "Targets verified after publishing",
      "Links reviewed after URL consolidation",
    ],
    related: [
      "/learn/search-intent-content-map",
      "/help/drafts-and-rechecks",
      "/features/content-studio",
    ],
    action: { label: "Explore linking drafts", href: "/demo/content-studio" },
  },
  {
    slug: "measure-before-after",
    title: "Measure progress without giving a change all the credit",
    category: "Measurement",
    description:
      "Keep implementation verification separate from search performance, compare complete periods, and preserve source and coverage limits.",
    summary:
      "Record what changed, verify it on the live page, then inspect comparable search periods. Report association and uncertainty alongside the numbers.",
    updated,
    tags: [
      "gsc",
      "search-console",
      "performance",
      "report",
      "measurement",
      "ctr",
      "clicks",
      "position",
    ],
    sections: [
      {
        id: "baseline",
        title: "Save a baseline you can explain",
        paragraphs: [
          "Before applying a change, record the page URL, current state, intended effect, owner, and date. Keep the original snapshot. Decide what evidence would show that the implementation succeeded: for example, the new title is present on the same live URL.",
          "A saved intention and a verified implementation answer different questions. ‘Applied’ records the owner’s action. ‘Verified’ requires a new observation that supports the expected change.",
        ],
      },
      {
        id: "comparison",
        title: "Compare equivalent reporting windows",
        paragraphs: [
          "In RankSushi, compare the latest complete 28 days with the preceding 28. Check the through-date and available days before interpreting the difference. Keep the same property, search type, country, and device where possible.",
          "Search Console’s API can omit detailed queries and does not guarantee every row. Property totals and query detail therefore stay separate. Missing detail is not automatically a tracking error, and adding totals to their component rows double-counts traffic.",
        ],
        sourceIds: ["gsc"],
      },
      {
        id: "interpret",
        title: "Write the caveat as part of the result",
        paragraphs: [
          "Report the observed change and the context: other releases, seasonal demand, position changes, tracking gaps, or major promotions. Use language such as ‘clicks increased in the period following the update’ when the evidence cannot isolate cause.",
          "Choose the next investigation from the data. If impressions rise while CTR falls, inspect the new query mix and positions before rewriting the page again. If the period is incomplete, wait for more evidence instead of filling the gap with a projection.",
        ],
        items: [
          "Implementation: what was observed on the live page.",
          "Performance: what the connected dataset reports.",
          "Interpretation: a qualified explanation that can be challenged.",
        ],
      },
    ],
    checklist: [
      "Original snapshot and change date saved",
      "Live implementation checked",
      "Equivalent complete periods selected",
      "Source, freshness, and coverage visible",
      "Other changes recorded",
      "Association distinguished from causation",
    ],
    related: [
      "/help/understanding-evidence",
      "/features/search-console",
      "/help/reports-and-sharing",
    ],
    action: {
      label: "Explore performance reporting",
      href: "/demo/search-console",
    },
  },
];

export const BLOG_POSTS: LearningArticle[] = [
  {
    slug: "a-90-day-seo-plan",
    title: "A 90-day SEO plan you can actually finish",
    category: "Working smarter",
    description:
      "A practical sequence for small teams: establish evidence, improve a focused set of pages, then review observed results and decide what comes next.",
    summary:
      "Your plan needs a short queue, a visible owner, and a way to learn. Here is how we turn a content map into a manageable quarter of work.",
    updated,
    tags: ["planning", "roadmap", "content"],
    sections: [
      {
        id: "week-one",
        title: "Start by making the work smaller",
        paragraphs: [
          "A long audit can create the impression that everything is urgent. Give the first week a narrower job: understand the business, confirm the intended landing pages, and save a baseline. Pick the customer decisions that matter now. A small business selling a seasonal product does not need the same queue as a publisher with thousands of guides.",
          "Build a content map with existing URLs, audience questions, available evidence, and keep / merge / exclude decisions. Assign an owner to each useful next action. Unknown search demand stays unknown until a real source supplies it.",
        ],
      },
      {
        id: "first-month",
        title: "Days 1–30: remove friction and prepare the next bites",
        paragraphs: [
          "Investigate access problems on the pages that should serve those decisions. Review unexpected redirects, indexing exclusions, and canonical choices in context. Confirm whether a finding came from fetched HTML, rendered content, or an HTTP observation.",
          "Choose a small batch that the team can review and publish. Three changes is a useful planning constraint, not a proven optimum. For each, write the reason, proposed draft, source, owner, and verification step. Keep higher-effort ideas visible without pretending they are already scheduled.",
        ],
      },
      {
        id: "second-month",
        title: "Days 31–60: publish reviewed work and verify it",
        paragraphs: [
          "Improve the selected pages in your own editor. Save the previous copy and the date of publication. Check internal destinations, business facts, and visible markup together. Recheck the live page to confirm what was implemented.",
          "Use that review to improve the next brief. If a draft repeatedly needs facts that do not exist, the missing ingredient may be business research: product specifications, an expert explanation, or a documented process. More generated paragraphs will not resolve that gap.",
        ],
      },
      {
        id: "third-month",
        title: "Days 61–90: inspect outcomes and change the queue",
        paragraphs: [
          "Compare equivalent complete reporting periods. Look at the pages and queries involved, and include changes in demand, marketing, and the website that could influence the result. Keep technical verification separate from traffic interpretation.",
          "End the quarter with decisions: continue a useful direction, revise an assumption, consolidate overlapping work, or stop something that no longer fits. The deliverable is a better next queue, supported by what you learned—not a promised growth percentage.",
        ],
      },
    ],
    checklist: [
      "A short list of customer decisions",
      "An owned content map",
      "A small reviewable implementation batch",
      "Saved baselines and publication dates",
      "Rechecks and comparable reporting windows",
      "A revised next-action queue",
    ],
    related: [
      "/learn/search-intent-content-map",
      "/learn/technical-triage",
      "/learn/measure-before-after",
    ],
    action: { label: "Start with one page", href: "/tools/seo-audit" },
  },
  {
    slug: "seo-aeo-geo",
    title: "SEO, AEO, GEO: one useful system, different observations",
    category: "AI & search",
    description:
      "How to organize website discovery, clear answers, and sampled AI visibility without mixing them into a misleading universal score.",
    summary:
      "The labels describe different questions. A useful workflow shares content and evidence while keeping the measurements distinct.",
    updated,
    tags: ["seo", "aeo", "geo", "ai"],
    sections: [
      {
        id: "questions",
        title: "Start with what you want to learn",
        paragraphs: [
          "For SEO, a small team might ask whether intended pages are accessible and which queries bring impressions or clicks. For answer-focused editorial work, it might ask whether a page resolves a specific question clearly. For generative-engine research, it might inspect how a provider describes the business in a dated answer sample.",
          "Those questions can share a page and a source set. They should not share an invented unit of success. A crawler seeing a heading, a person clicking a result, and an API mentioning a brand are different observations.",
        ],
      },
      {
        id: "foundation",
        title: "Use a shared editorial foundation",
        paragraphs: [
          "Give the page a clear purpose, support its important claims, identify the responsible organization, and connect it to relevant pages. Review the visible content before drafting structured data. Google says its AI features do not introduce a separate set of AI-specific optimization requirements.",
          "Our workflow adds an explicit review of the reader’s questions. This is an editorial practice, not a disclosed ranking formula. A concise answer, explanation, and credible reference can make a page more useful even when no sampled response cites it.",
        ],
        sourceIds: ["ai"],
      },
      {
        id: "measurement",
        title: "Keep a small evidence table",
        paragraphs: [
          "Use columns for the question, source, observed time, market, result, and limitation. A Search Console row belongs beside its reporting period and coverage. A sampled answer belongs beside its exact prompt, provider, and returned model. A readiness note should be labeled as an interpretation.",
          "When you review the table, ask which uncertainty the next action would reduce. A missing answer on your own page may call for a content change. A surprising API response may call for another carefully defined sample or a source review. Neither requires inventing a universal AI visibility score.",
        ],
      },
    ],
    checklist: [
      "Define the decision behind each measurement",
      "Keep website, analytics, and AI samples separate",
      "Retain sources and observation dates",
      "Label editorial judgments as interpretations",
      "Review answer accuracy as well as mentions",
      "Choose a next action that resolves a real uncertainty",
    ],
    related: [
      "/learn/answer-ready-content",
      "/help/understanding-evidence",
      "/methodology",
    ],
    action: { label: "Read the methodology", href: "/methodology" },
  },
  {
    slug: "llms-txt-without-the-myths",
    title: "What our llms.txt does—and what it cannot promise",
    category: "Behind the kitchen",
    description:
      "Why RankSushi publishes an llms.txt resource index, how it relates to the sitemap and Markdown guides, and how we avoid claiming a ranking benefit.",
    summary:
      "It is a small map to useful public content. We publish it to help readers and agents find our guides, without treating it as a search-ranking switch.",
    updated,
    tags: ["llms.txt", "sitemap", "markdown", "discovery"],
    sections: [
      {
        id: "purpose",
        title: "A curated map to the public kitchen",
        paragraphs: [
          "The llms.txt proposal describes a Markdown file that gives agents a concise introduction and links to useful content. RankSushi’s file points to learning guides, help articles, product information, and methodology. The linked Markdown versions carry the same editorial content as their HTML pages.",
          "We generate the index and article exports from the same content registry. This reduces the chance that an agent gets an old description while a person sees a newer one. The file contains public material only.",
        ],
        sourceIds: ["llms"],
      },
      {
        id: "different-files",
        title: "Sitemap, robots, and llms.txt have different jobs",
        paragraphs: [
          "Our XML sitemap lists canonical public pages. The human-readable sitemap organizes those pages for browsing. The llms.txt index provides a shorter route into explanatory material. None of these files gives access to a private workspace or report.",
          "We keep account areas behind authorization. A discovery file is never an access-control system. Adding a link to a file also does not require another service to fetch it, trust it, or cite the site.",
        ],
      },
      {
        id: "claims",
        title: "Measure whether it helps your actual task",
        paragraphs: [
          "A practical test is to follow the index to a help article and check whether the exported text answers the same question as the page. Broken links, stale instructions, and missing qualifications are concrete problems we can fix.",
          "We do not assign a ranking lift to the presence of llms.txt. Google’s AI guidance does not require special AI files or markup for inclusion. Useful content, accessible pages, and source clarity remain the focus.",
        ],
        sourceIds: ["ai"],
      },
    ],
    checklist: [
      "A concise project description",
      "Working links to useful public resources",
      "HTML and Markdown content remain aligned",
      "Private data excluded",
      "Updated content has a recorded date",
      "No unsupported ranking or citation claim",
    ],
    related: ["/llms.txt", "/sitemap", "/learn/answer-ready-content"],
    action: { label: "Read our llms.txt", href: "/llms.txt" },
  },
];

export const HELP_ARTICLES: LearningArticle[] = [
  {
    slug: "first-audit",
    title: "Run your first audit and save a project",
    category: "Getting started",
    description:
      "Start with a public URL, understand the free audit, and save a recent result to a new website project.",
    summary:
      "Audit one public page first. Sign in, create your project, and keep the evidence attached to the website you want to improve.",
    updated,
    tags: ["audit", "onboarding", "project"],
    sections: [
      {
        id: "run",
        title: "Choose a public page",
        paragraphs: [
          "Enter a complete website URL in the free audit. The tool retrieves bounded public HTML and respects supported access rules. It cannot inspect a private page, sign into a website, or replace a full rendered crawl.",
          "A blocked or failed fetch is shown as such. If a page relies on JavaScript, a rendered crawl may provide additional evidence once the provider is connected. Missing fetched content does not prove it is absent from every browser.",
        ],
      },
      {
        id: "save",
        title: "Keep the result",
        paragraphs: [
          "Sign in in the same browser and create a project. Add the website, business description, target country, and content language. A recent free audit can be claimed for one hour. Saving a project requires the hosted account and database setup to be operational.",
          "Search Console is optional. Review one finding, read its evidence, and decide whether it applies to this page before preparing a change.",
        ],
      },
    ],
    checklist: [
      "Use a public URL",
      "Review source and retrieval status",
      "Sign in using the same browser",
      "Save the project within the audit claim window",
    ],
    related: [
      "/help/google-login-and-search-console",
      "/learn/technical-triage",
    ],
    action: { label: "Open the free audit", href: "/tools/seo-audit" },
  },
  {
    slug: "fix-prompts",
    title: "Copy a prompt. Make a useful fix.",
    category: "Working on a page",
    description:
      "Turn a finding into instructions for your website editor, an AI assistant, or a developer. Know what to change and how to check it.",
    summary:
      "Open Help me fix this beside a finding. Choose how you work, copy the instructions, review the proposed change, and recheck the live page after you publish it.",
    updated,
    tags: [
      "prompt",
      "copy",
      "instructions",
      "ChatGPT",
      "Claude",
      "Codex",
      "Cursor",
      "developer",
      "title",
      "description",
      "canonical",
      "robots",
      "fix",
    ],
    sections: [
      {
        id: "choose",
        title: "Choose the way you work",
        paragraphs: [
          "You do not need to write a prompt from scratch. Open an audit finding, an opportunity, or a move in SERP Studio and choose Help me fix this. The instructions include the affected page and the evidence already available in that screen.",
        ],
        items: [
          "Website editor: plain steps and the field or setting to look for. If your platform is unknown, the instructions ask rather than invent a menu path.",
          "AI assistant: a prompt for ChatGPT, Claude, Codex or Cursor, with evidence, proposed wording where available, and checks to perform.",
          "Developer: a brief describing the scope, owning template or setting, acceptance checks and rollback considerations.",
        ],
      },
      {
        id: "copy",
        title: "Copy it and take the next step",
        paragraphs: [
          "Use Copy instructions, Copy fix prompt or Copy handoff. The arrow beside the button opens more options, including Markdown download and Copy & open ChatGPT or Claude. Paste the copied text into the assistant yourself and review it before submitting.",
          "RankSushi does not send your prompt to an assistant automatically. There is no MCP connection behind these buttons. In an AI coding tool, open your own project and paste the brief there. Do not add passwords or private access links.",
        ],
      },
      {
        id: "review",
        title: "Review before changing your website",
        paragraphs: [
          "An unknown result means that more evidence is needed. A passed or not-applicable check is not a request to make a change. Some canonicals, indexing exclusions, decorative images and short pages are intentional.",
          "Ask the assistant or developer to show the smallest useful change. Confirm names, claims, destinations and settings against your business and website. Save a backup or a version you can restore before publishing.",
        ],
      },
      {
        id: "verify",
        title: "Check what actually changed",
        paragraphs: [
          "Publish the reviewed change through your website editor or normal release process. Return to the project and recheck the page. Read the new evidence and confirm that it matches the intended change.",
          "Copying a prompt or ticking a documentation checklist does not mark a finding verified. Search positions can only be compared using fresh search evidence; a changed title preview is not a measured ranking improvement.",
        ],
      },
    ],
    checklist: [
      "Open the finding and read its evidence",
      "Choose website editor, AI assistant or developer",
      "Copy the instructions and review the proposed change",
      "Publish through your usual website workflow",
      "Recheck and inspect the new evidence",
    ],
    related: [
      "/help/drafts-and-rechecks",
      "/learn/technical-triage",
      "/help/serp-studio",
    ],
    action: { label: "Try a fix in SERP Studio", href: "/demo" },
  },
  {
    slug: "serp-studio",
    title: "Work on your page in SERP Studio",
    category: "Working on a page",
    description:
      "Explore returned Google results for a keyword, inspect page evidence, try a change and take it into your website workflow.",
    summary:
      "Start with one keyword and one page. Inspect the returned results, choose a suggested move, and try the wording in the page preview. Copy the fix instructions or export your draft when ready.",
    updated,
    tags: [
      "serp",
      "studio",
      "keyword",
      "Google",
      "ranking",
      "preview",
      "snapshot",
    ],
    sections: [
      {
        id: "stage",
        title: "Bring a search into focus",
        paragraphs: [
          "In your project, enter a plain search phrase and a page on the project website. Review the market and allowance, then start a live lookup. Account-based lookups require configured providers, background jobs and available allowance.",
          "The public walkthrough contains recorded, real Google results and a public page fetch. Its label and observation dates distinguish it from a fresh account lookup. It does not run a paid search when you interact with it.",
        ],
      },
      {
        id: "inspect",
        title: "Read the clues before making a move",
        paragraphs: [
          "Select a returned result to inspect its title and snippet evidence. Query words are highlighted to help you compare the wording. These clues do not explain every reason a page ranks, and a result card is not a full competitor-page crawl.",
          "If your exact page or its declared canonical is missing from the returned set, the studio says not observed. It does not invent a lower position. Snapshot comparisons preserve the query, country, language and device.",
        ],
      },
      {
        id: "edit",
        title: "Try the wording, then take it with you",
        paragraphs: [
          "Choose a title, description, heading or answer move. Edit the wording and compare Current page with My draft. On smaller screens a preview also appears beside the editor. A related question can open the answer draft while keeping the question visible.",
          "Use Help me fix this for copyable instructions, or export the draft as Markdown. Manual studio drafts belong to the current browser session; export them before leaving. Content Studio provides persistent revisions for its generated drafts.",
        ],
      },
      {
        id: "recheck",
        title: "Separate the preview from the live result",
        paragraphs: [
          "Review and publish the change through your own website workflow. A page recheck can confirm whether the approved wording is present in new page evidence. A separate search refresh supplies a new ranking observation.",
          "Draft previews update as you type. They do not publish a change, rerank Google results or guarantee a traffic outcome.",
        ],
      },
    ],
    checklist: [
      "Confirm the query, page and market",
      "Inspect the returned results and source date",
      "Try one relevant change in the preview",
      "Copy instructions or export the reviewed draft",
      "Publish, recheck the page and compare fresh observations",
    ],
    related: [
      "/help/fix-prompts",
      "/help/dataforseo-research",
      "/learn/measure-before-after",
    ],
    action: { label: "Open the SERP Studio walkthrough", href: "/demo" },
  },
  {
    slug: "google-login-and-search-console",
    title: "Google sign-in and Search Console are separate",
    category: "Connections",
    description:
      "Understand account login, the read-only Search Console handoff, property selection, and reconnecting after revoked consent.",
    summary:
      "Google sign-in identifies you. A separate read-only permission connects the Search Console data for your website.",
    updated,
    tags: ["google", "gsc", "oauth", "property", "login"],
    sections: [
      {
        id: "connect",
        title: "Connect the right property",
        paragraphs: [
          "For a new account, RankSushi sends you to Connect Search Console during onboarding. Authorize the read-only scope, then select a verified property; each selected property becomes one RankSushi project. Existing projects can start the same flow from Settings → Connections.",
          "The initial import covers up to 90 days. Paid workspaces then synchronize daily. Check the through-date and coverage in the report before comparing complete periods.",
        ],
      },
      {
        id: "recover",
        title: "If the connection stops working",
        paragraphs: [
          "Reconnect if Google consent has been revoked or refresh access is no longer usable. Disconnecting stops future access through that connection; saved observations remain available as historical evidence.",
          "Use CSV import as a labeled fallback if needed. CSV rows stay separate from API totals. Signing out of RankSushi does not revoke the separate Google consent; use disconnect or Google’s account permissions to do that.",
        ],
      },
    ],
    checklist: [
      "Sign in to RankSushi",
      "Authorize Search Console separately",
      "Choose a property covering the website",
      "Check freshness after import",
    ],
    related: ["/features/search-console", "/help/understanding-evidence"],
    action: {
      label: "See Search Console reporting",
      href: "/demo/search-console",
    },
  },
  {
    slug: "dataforseo-research",
    title: "Where DataForSEO research comes from",
    category: "Connections",
    description:
      "Understand live search results, keyword database estimates, research allowances, and how the operator connects DataForSEO securely.",
    summary:
      "DataForSEO supplies external search evidence. It complements your own Search Console data and does not expose competitors’ private analytics.",
    updated,
    tags: ["dataforseo", "serp", "keyword", "research", "connection"],
    sections: [
      {
        id: "data",
        title: "Choose the question before the lookup",
        paragraphs: [
          "A live Google results lookup records returned organic listings for the selected query, market, and device, plus available result features. Keyword research provides database metrics such as estimated demand and paid-search competition when available.",
          "Provider keyword estimates are different from clicks and impressions measured for your own property. A keyword without available data stays unavailable. CPC and advertiser competition describe paid search, not an organic ranking guarantee.",
        ],
        sourceIds: ["dfs"],
      },
      {
        id: "account",
        title: "The platform operator connects the account",
        paragraphs: [
          "RankSushi’s operator configures the DataForSEO API login and API password on the server. Website-project users do not enter or receive the shared provider password. Your website login and Google consent are independent of this connection.",
          "If Research shows ‘Setup required,’ the platform connection has not been configured. A configured key still needs a successful provider check. Jobs require working background processing, a paid workspace, and sufficient allowance.",
        ],
      },
      {
        id: "allowance",
        title: "Review the scope before starting",
        paragraphs: [
          "Choose one research mode and query. The form shows the allowance before submission. Results retain their source and observation time. Jobs run in the background and can be revisited after leaving the page.",
          "Account verification does not mean every DataForSEO dataset is enabled. Backlinks, additional databases, and wider historical coverage require separate scope and cost decisions. RankSushi does not fetch an entire account’s data automatically.",
        ],
      },
    ],
    checklist: [
      "Choose live results or keyword estimates",
      "Confirm query and market",
      "Review the lookup allowance",
      "Inspect source and date with the result",
    ],
    related: [
      "/learn/search-intent-content-map",
      "/help/quotas-and-failed-jobs",
    ],
    action: {
      label: "Explore research in the demo",
      href: "/demo/search-console",
    },
  },
  {
    slug: "drafts-and-rechecks",
    title: "Prepare, export, and verify a change",
    category: "Projects & content",
    description:
      "Move from an opportunity to an editable draft, save revisions, export the work, and recheck the live page after publishing it yourself.",
    summary:
      "RankSushi prepares the work. You review and publish it in your own editor, then ask RankSushi to look again.",
    updated,
    tags: ["draft", "export", "revision", "recheck", "content"],
    sections: [
      {
        id: "draft",
        title: "Prepare a bounded deliverable",
        paragraphs: [
          "Open an opportunity and choose Prepare a draft. Select a brief, metadata, content, links, structured data, or coach answer. Saved page snapshots provide the business evidence; the SEO kitchen supplies editorial guidance.",
          "Review unsupported claims, source references, and the requested format. Guidance explains a method; it does not establish facts about your business. One drafting action prepares one bounded deliverable.",
        ],
      },
      {
        id: "publish",
        title: "Save and take the draft with you",
        paragraphs: [
          "Edit the content and save a new revision. Export Markdown, HTML, JSON, or CSV as appropriate. Publish the reviewed change in your own website editor. RankSushi does not automatically modify the website.",
        ],
      },
      {
        id: "recheck",
        title: "Check the same live page",
        paragraphs: [
          "Mark the opportunity applied to record your action, then request a recheck. RankSushi compares the new page observation with the earlier snapshot. A finding is verified only when available evidence supports the expected change.",
          "A successful recheck confirms implementation, not a traffic benefit. Use subsequent reporting to inspect observed performance separately.",
        ],
      },
    ],
    checklist: [
      "Read the opportunity evidence",
      "Review and edit the draft",
      "Save a revision and export",
      "Publish in your own editor",
      "Recheck the live page",
    ],
    related: ["/learn/measure-before-after", "/features/content-studio"],
    action: { label: "Try the draft workflow", href: "/demo/opportunities" },
  },
  {
    slug: "understanding-evidence",
    title: "Understand measured, inferred, and sampled results",
    category: "Evidence & reporting",
    description:
      "Read source labels, timestamps, coverage, unavailable values, and AI samples without confusing unlike measurements.",
    summary:
      "Every result needs context. Read its source, observation date, market, and evidence type before deciding what it means.",
    updated,
    tags: ["evidence", "sample", "inferred", "unknown", "data"],
    sections: [
      {
        id: "labels",
        title: "Three labels to keep in view",
        paragraphs: [
          "Measured observations come from a particular source at a recorded time. Inferences interpret evidence; they are not direct measurements. Samples show a bounded API response or an explicitly illustrative product example.",
        ],
        items: [
          "A fetched title: observed page evidence.",
          "A suggested priority: an interpretation of evidence and effort.",
          "An AI provider answer: a dated sample with its prompt and model.",
          "The demo workspace: labeled examples; SERP Studio uses recorded real public evidence.",
        ],
      },
      {
        id: "gaps",
        title: "A gap is not a zero",
        paragraphs: [
          "A disconnected provider, failed fetch, missing metric, or incomplete reporting period is shown as unavailable or incomplete. Do not interpret it as zero traffic, no competition, or a failed SEO check.",
          "Search Console totals and detailed rows have different coverage and remain separate. Provider keyword metrics are estimates. For AI checks, inspect the returned sources and wording before interpreting a brand mention.",
        ],
      },
    ],
    checklist: [
      "Check the evidence label",
      "Read source, market, and date",
      "Inspect coverage and missing values",
      "Keep estimates separate from property analytics",
    ],
    related: ["/methodology", "/learn/measure-before-after"],
    action: { label: "Read our methodology", href: "/methodology" },
  },
  {
    slug: "quotas-and-failed-jobs",
    title: "Allowances, partial results, and failed jobs",
    category: "Billing & recovery",
    description:
      "Understand monthly limits, allowance reservations, partial crawls, uncertain provider requests, and safe recovery.",
    summary:
      "You see the allowance before starting. RankSushi reserves it for the job and reconciles usage when the work settles.",
    updated,
    tags: [
      "quota",
      "billing",
      "trial",
      "renewal",
      "failed",
      "partial",
      "cancel",
      "retry",
    ],
    sections: [
      {
        id: "starter-trial",
        title: "$1 today, three days to try it",
        paragraphs: [
          "The paid starter trial is available once per new workspace. Across all three days you can use 1 project, 20 crawled pages, 3 drafting actions, 3 AI answer checks and 3 SERP lookups. Picking Omakase does not increase the trial limits: the larger monthly allowance starts after your first monthly payment succeeds.",
          "Select Maki ($29/month), Nigiri ($79/month), or Omakase ($149/month) before Checkout. Pay $1 USD now; the selected monthly subscription renews automatically three days later unless canceled. Stripe Checkout shows the renewal date and amount before payment, and Settings → Plan & billing shows them afterwards. Applicable tax is additional and shown at Checkout.",
          "To avoid the monthly charge, open Settings → Plan & billing and choose Cancel at period end before the displayed renewal time. Confirm cancellation and check the scheduled cancellation notice. Your remaining trial allowance lasts until the trial ends; saved results then stay available in read-only mode. Changing plans does not extend the trial or refill its allowance.",
        ],
      },
      {
        id: "limits",
        title: "Know what consumes an allowance",
        paragraphs: [
          "Crawls and rechecks consume page allowance. Drafts consume drafting actions. An answer check runs one prompt against one provider. Search research uses the lookup allowance shown in the form. Scheduled work uses the same limits.",
          "There are no automatic overages or credit packs. If the requested work exceeds the remaining allowance, reduce its scope or wait for the next billing period. Existing results remain accessible when paid access ends.",
        ],
      },
      {
        id: "recovery",
        title: "Read the job state before retrying",
        paragraphs: [
          "Partial crawls distinguish successful, failed, blocked, and unvisited pages. A cancelled job can still have already-started provider work. Leaving the page does not cancel a persisted background job.",
          "If a paid provider request times out after submission, it may have completed remotely. RankSushi stops automatic replay of uncertain requests. Contact support with the job identifier so usage can be reconciled before another attempt. Do not share provider passwords.",
        ],
      },
    ],
    checklist: [
      "Review expected allowance",
      "Read actual job stage and outcome",
      "Inspect partial coverage",
      "Resolve an uncertain paid request before retrying",
    ],
    related: [
      "/pricing",
      "/help/dataforseo-research",
      "/help/account-recovery",
    ],
    action: { label: "Compare plan allowances", href: "/pricing" },
  },
  {
    slug: "reports-and-sharing",
    title: "Export a report and manage its share link",
    category: "Evidence & reporting",
    description:
      "Prepare reports from saved work, download PDF or CSV evidence, and create or revoke an expiring read-only share link.",
    summary:
      "A report brings completed work, remaining findings, and observed performance together. Share access stays under your control.",
    updated,
    tags: ["report", "pdf", "csv", "sharing", "privacy"],
    sections: [
      {
        id: "prepare",
        title: "Prepare from saved evidence",
        paragraphs: [
          "Open Reports and prepare a report for your project. The job runs in the background. Return after it completes to export PDF, CSV, or JSON. The report includes evidence available at preparation time; future observations do not silently rewrite it.",
          "Sample workspaces remain explicitly illustrative. In a real project, an empty dataset stays empty rather than being replaced with an example growth story.",
        ],
      },
      {
        id: "share",
        title: "Review and revoke access",
        paragraphs: [
          "A share link gives read access to that report without a workspace login. Create it only for a report you intend to share, and treat the full URL as access to its content. Links expire after 30 days and can be revoked earlier.",
          "Revocation stops access through that link. It cannot retrieve a file someone already downloaded. Private report storage otherwise requires authorized access to the workspace.",
        ],
      },
    ],
    checklist: [
      "Inspect report contents before sharing",
      "Confirm source dates and limitations",
      "Share only the intended report",
      "Revoke the link when access is no longer needed",
    ],
    related: ["/security", "/help/understanding-evidence"],
    action: { label: "Explore reports", href: "/demo/reports" },
  },
  {
    slug: "account-recovery",
    title: "Recover from sign-in and connection problems",
    category: "Billing & recovery",
    description:
      "Troubleshoot expired magic links, missing provider setup, revoked Google access, and recoverable application errors.",
    summary:
      "Start with the exact error and the action that caused it. A short, precise description helps resolve the right problem.",
    updated,
    tags: ["login", "magic-link", "support", "error", "recovery"],
    sections: [
      {
        id: "login",
        title: "If a sign-in link does not work",
        paragraphs: [
          "Request a fresh magic link and follow it in the browser where you started sign-in. An expired or already-used link cannot establish a new session. Check the address and your spam folder before requesting another.",
          "Google account login may work while Search Console is disconnected: they are separate permissions. Reconnect Search Console from the project’s Connections tab when its consent needs renewal.",
        ],
      },
      {
        id: "support",
        title: "Send useful context, not credentials",
        paragraphs: [
          "Contact anotherseoguru@gmail.com with the page you were using, the action you attempted, the displayed message, and the approximate time. Include a job identifier if one is available.",
          "Do not send passwords, API keys, magic links, or private share tokens. If a screen says a platform provider is being configured, account access alone cannot complete that operator setup. Existing saved evidence should remain available where authorized.",
        ],
      },
    ],
    checklist: [
      "Identify the exact action and message",
      "Use a fresh link in the initiating browser",
      "Distinguish login from provider consent",
      "Share support context without credentials",
    ],
    related: [
      "/help/google-login-and-search-console",
      "/help/quotas-and-failed-jobs",
    ],
    action: {
      label: "Contact support",
      href: "mailto:anotherseoguru@gmail.com",
    },
  },
];

export type Collection = "learn" | "blog" | "help";
export const COLLECTIONS = {
  learn: GUIDES,
  blog: BLOG_POSTS,
  help: HELP_ARTICLES,
};
export function getArticle(collection: Collection, slug: string) {
  return COLLECTIONS[collection].find((a) => a.slug === slug);
}
export function articleSources(article: LearningArticle) {
  return [...new Set(article.sections.flatMap((s) => s.sourceIds ?? []))].map(
    (id) => SOURCES[id],
  );
}
export function readingMinutes(article: LearningArticle) {
  const words = [
    article.summary,
    ...article.sections.flatMap((s) => [
      s.title,
      ...s.paragraphs,
      ...(s.items ?? []),
    ]),
  ]
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}
