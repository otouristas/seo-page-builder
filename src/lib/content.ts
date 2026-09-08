export type PublicArticle = {
  title: string;
  description: string;
  kicker: string;
  lead: string;
  sections: { title: string; paragraphs: string[]; items?: string[] }[];
};
export const FEATURES: Record<string, PublicArticle> = {
  "website-audits": {
    title: "Website audits that explain the next step",
    description:
      "Inspect your website with evidence-based SEO audits. Review technical findings, preserve page snapshots, prepare changes, and verify the live page.",
    kicker: "FRESH FINDINGS",
    lead: "Find the good. Fix the “could be better.” A thoughtful audit shows what is happening, why it may matter, and what to do next.",
    sections: [
      {
        title: "Evidence you can actually inspect",
        paragraphs: [
          "Start with a public page or a bounded website crawl. RankSushi records what was available at observation time: titles, descriptions, headings, canonical links, indexing directives, image alternatives, internal links, and structured data. Each finding names its source and the affected page.",
          "The free tool inspects fetched HTML. Paid crawls use Firecrawl for rendered HTML and discovery. These sources are labeled separately: content that appears after JavaScript runs may be absent from a plain HTML response.",
        ],
        items: [
          "Passed: the available evidence supports this check.",
          "Needs a look: an observed condition deserves attention.",
          "Needs context: a conclusion cannot be drawn from the available evidence.",
        ],
      },
      {
        title: "Useful context, instead of arbitrary rules",
        paragraphs: [
          "There is no universal minimum word count, perfect title length, or required number of internal links. A short contact page can be useful. An alternate canonical or noindex directive can be intentional. Empty alt text can correctly mark a decorative image.",
          "RankSushi brings those distinctions into the finding. Review the page purpose before applying a change. A syntactically valid JSON-LD block still needs relevant types, accurate facts, and alignment with visible content.",
        ],
      },
      {
        title: "From observation to verified change",
        paragraphs: [
          "Open an opportunity to inspect the evidence and prepare an editable deliverable. Publish the reviewed change through your own website editor, then recheck the live page. RankSushi compares the new snapshot with the earlier observation.",
          "Crawls report successful, failed, blocked, and unvisited pages separately. PageSpeed diagnostics distinguish Lighthouse lab tests from real-user field data when it is available. A changed page is evidence of an implementation change; it is not proof of a traffic effect.",
        ],
      },
    ],
  },
  "search-console": {
    title: "Search Console, with a clearer story",
    description:
      "Connect Google Search Console read-only, import 90 days of search data, compare complete periods, and find opportunities from observed demand.",
    kicker: "LET YOUR DATA DO THE TALKING",
    lead: "Real queries. Real visitors. Less spreadsheet archaeology. Bring your website’s search evidence into the same place as your next useful changes.",
    sections: [
      {
        title: "A separate, read-only connection",
        paragraphs: [
          "Signing in with Google identifies your RankSushi account. Connecting Search Console is a separate, optional authorization that requests read-only access to Search Console properties. Choose a verified property that covers your project website.",
          "Refresh credentials stay encrypted on the server. You can disconnect in Settings or revoke access from Google. Existing observations remain available so your reports retain the context of earlier work.",
        ],
      },
      {
        title: "Compare like with like",
        paragraphs: [
          "The initial import covers up to 90 days. Paid workspaces synchronize daily and reconcile a rolling window so recently finalized values can replace earlier records. The default report compares the latest complete 28 days with the previous 28 days.",
          "Dates follow Search Console’s reporting calendar. We use final data with a conservative delay, show the through-date, and report the number of available days. An incomplete comparison is labeled rather than presented as a complete trend.",
        ],
      },
      {
        title: "Totals and details answer different questions",
        paragraphs: [
          "Property totals show overall clicks, impressions, click-through rate, and impression-weighted average position. Detailed records preserve date, query, page, country, device, and search type. The API may omit anonymized queries and return only its top detailed rows.",
          "We store these datasets separately to avoid counting the same traffic twice. A dated CSV import is available as a clearly labeled fallback. Imported CSV rows do not overwrite the API totals. Use observed demand to prioritize relevant improvements; a traffic change alone does not establish why it happened.",
        ],
      },
    ],
  },
  "content-studio": {
    title: "Content Studio for useful, editable drafts",
    description:
      "Create evidence-grounded content briefs, metadata, internal-link suggestions and JSON-LD. Edit revisions and export reviewed work from RankSushi.",
    kicker: "BLANK PAGE? LET’S ROLL.",
    lead: "A useful first draft. Your final say. Turn what your website already tells us into a clearer page, a focused brief, or a more helpful answer.",
    sections: [
      {
        title: "Give the draft a job to do",
        paragraphs: [
          "Choose a content brief, title and description, content draft, internal-link suggestions, structured data, or a direct answer from Maki. Add the audience, question, tone, and constraints that would make the result useful.",
          "A drafting action produces one bounded deliverable. The selected page and other saved snapshots provide evidence. If the project has no saved page evidence yet, run an audit before generating a draft.",
        ],
        items: [
          "Briefs: an outline, questions, and source references.",
          "Metadata: a clear title and accurate invitation to the page.",
          "Internal links: suggestions between known source and destination pages.",
          "Structured data: a draft limited to facts supported on the page.",
        ],
      },
      {
        title: "Keep facts attached to their sources",
        paragraphs: [
          "Crawled material is treated as untrusted source content, not instructions for the model. Drafts should use supplied evidence and flag unsupported factual claims for your confirmation. A model can still make mistakes, so source review remains part of your workflow.",
          "Do not publish invented credentials, reviews, statistics, prices, or guarantees. Confirm details with the business owner and original sources. Markup should describe visible content; it cannot create special AI eligibility.",
        ],
      },
      {
        title: "Edit, save a version, and take it with you",
        paragraphs: [
          "Review the draft in Content Studio, edit the wording, and save a new revision. Earlier revisions remain available for comparison. Export your current work as Markdown, HTML, JSON, or CSV, depending on how you want to use it.",
          "RankSushi does not publish to your website. Apply the reviewed change in your CMS, then recheck the live page from Opportunities or Audits. This keeps the process reviewable and gives the next performance report a clear implementation record.",
        ],
      },
    ],
  },
  "ai-visibility": {
    title: "AI visibility, with evidence and context",
    description:
      "Review answer readiness and sample answers through OpenAI and Perplexity APIs. Inspect exact prompts, models, timestamps, citations and brand mentions.",
    kicker: "SEE HOW YOUR STORY IS SERVED",
    lead: "Be a useful answer. Then inspect what comes back. A practical readiness checklist meets limited, clearly labeled samples from AI APIs.",
    sections: [
      {
        title: "Readiness starts with useful content",
        paragraphs: [
          "Can a reader understand the answer quickly? Is the business entity consistent across the page? Are important claims supported? Can readers identify who is responsible for editorial advice? Is the intended page accessible to crawlers? Does relevant structured data match visible content?",
          "These are review questions, not a magic score. Some checks require human judgment, and some do not apply to every page. Google documents no additional AI-specific markup requirement for its AI features.",
        ],
      },
      {
        title: "One prompt, one provider, one observation",
        paragraphs: [
          "Run a specific prompt through OpenAI with web search or the Perplexity Agent API. RankSushi saves the exact prompt, returned model, observation time, market context, answer, citations, and detected mentions of your project name.",
          "Each record is a sampled API answer. It is not a measurement of all conversations in ChatGPT, Perplexity, or Google, and it does not reproduce every consumer interface or personalization setting. Running the same prompt later gives another observation, not a guaranteed trend.",
        ],
      },
      {
        title: "Read the answer before counting the mention",
        paragraphs: [
          "A brand mention is a text match. It does not automatically mean endorsement, relevance, or a link. Inspect the surrounding answer and returned sources. A missing citation in one sample is not proof that a platform never cites your website.",
          "Use the evidence to ask better editorial questions and improve the clarity of your pages. RankSushi also provides on-demand Google organic SERP evidence through DataForSEO; it keeps that evidence separate from AI answer samples and never adds synthetic competitors to real reports.",
        ],
      },
    ],
  },
};
export const ARTICLES: Record<string, PublicArticle> = {
  methodology: {
    title: "Our methodology: evidence before everything",
    description:
      "How RankSushi audits websites, interprets Search Console data, samples AI answers, and verifies changes without promising rankings or citations.",
    kicker: "HOW WE KNOW WHAT WE KNOW",
    lead: "Useful insights should come with receipts. Here is what we measure, what we infer, and where a human needs to take a closer look.",
    sections: [
      {
        title: "Three labels, three kinds of evidence",
        paragraphs: [
          "Measured observations come from a source at a recorded time: a fetched page, a rendered crawl, Search Console, or a performance test. Inferences are interpretations drawn from that evidence. Samples show a bounded observation or an illustrative product example.",
          "Every finding carries a source, time, market, and classification. Public examples are labeled. We do not present invented ranking gains, synthetic competitors, fabricated testimonials, or modeled revenue as measured results.",
        ],
      },
      {
        title: "What a page audit can and cannot see",
        paragraphs: [
          "Fetched HTML and rendered content are different sources. A plain HTTP response may not contain content loaded by JavaScript. A crawl can be partial, blocked, or limited by the requested page budget. We separate successful, failed, blocked, and unvisited pages.",
          "Rules account for intentional canonicalization, decorative images, and indexing exclusions. Word counts, heading counts, title lengths, and link counts are contextual observations. Structured-data checks are not a complete eligibility or factual review.",
        ],
      },
      {
        title: "How search performance is compared",
        paragraphs: [
          "The default comparison uses the latest complete 28 days and the preceding 28. We show freshness and coverage. Property totals are not added to detailed query rows, and CSV fallback data remains separate. Detailed API results are not exhaustive.",
          "Average position is weighted by impressions, and click-through rate is calculated from clicks divided by impressions. A comparison is labeled incomplete when reporting days are missing. A page change and a traffic change can be associated without proving causation.",
        ],
      },
      {
        title: "What AI visibility means here",
        paragraphs: [
          "A readiness checklist considers clarity, entity consistency, source support, authorship, crawlability, and relevant markup. It is not a guarantee of citation or a special Google AI eligibility score.",
          "Live answer checks save one prompt-provider response with its returned model, timestamp, answer, sources, and detected brand mentions. These are sampled API answers, not comprehensive tracking of consumer AI platforms. Website source material is untrusted input, and generated drafts require review.",
        ],
      },
      {
        title: "A change is verified by looking again",
        paragraphs: [
          "Marking an opportunity as applied records your confirmation. Verification fetches the live page again and compares it with the previous saved snapshot. Only a supported change in the observed check can mark a technical finding verified.",
          "Subsequent Search Console observations provide context for progress. They cannot isolate every other change in the market, website, algorithm, competition, or visitor behavior. That limitation travels with the report.",
        ],
      },
    ],
  },
  help: {
    title: "The RankSushi help menu",
    description:
      "Get started with website audits, Search Console connections, content drafts, rechecks, exports, usage allowances, and recovery from failed jobs.",
    kicker: "A LITTLE HELP GOES A LONG WAY",
    lead: "A calm path from your first URL to your next useful change. Start small, keep the evidence, and ask better questions as you go.",
    sections: [
      {
        title: "Start with one page",
        paragraphs: [
          "Open the free page audit, enter a public website URL, and inspect the findings. This first tool uses public HTML. A page blocked by robots.txt, a private address, or an unsupported response cannot be inspected.",
          "Sign in and create a project to save a recent free audit from the same browser. Enter the website, business description, target country, and content language. Your free audit can be claimed for one hour. Google sign-in and Search Console access are separate.",
        ],
      },
      {
        title: "Connect Google Search Console",
        paragraphs: [
          "In Settings → Connections, choose Connect Search Console. Authorize read-only access, then load and choose a verified property covering your project URL. Paid workspaces can import an initial 90 days and synchronize daily.",
          "If Google consent is revoked or refresh access expires, reconnect. A dated CSV with Date, Clicks, Impressions, and Position columns can be imported as fallback data. It remains separate from API totals.",
        ],
      },
      {
        title: "Turn a finding into a reviewed change",
        paragraphs: [
          "Open Opportunities, read the evidence, and choose Prepare a draft. Select the artifact and add useful context. Saved page snapshots ground the draft; unsupported claims still need confirmation.",
          "Edit the result in Content Studio, save a revision, and export it. Publish through your own website editor. Mark the opportunity applied, then recheck the live page. A successful observation verifies implementation, not a guaranteed traffic outcome.",
        ],
      },
      {
        title: "Understand allowances and jobs",
        paragraphs: [
          "Workspace allowances are shared across projects. A page scan reserves its maximum page budget before it starts. Completed crawls release unused allowance; already-started provider work can retain allowance while an uncertain failure is reconciled.",
          "Jobs persist after the tab closes. Audits shows their real stages, partial results, failures, and cancellation controls. A new attempt is a new job and may consume allowance. Weekly scans use the same visible page limit and pause when it is exhausted.",
        ],
      },
      {
        title: "Billing, email, and exports",
        paragraphs: [
          "Paid plans use monthly USD subscriptions. Manage payment methods and invoices in the Stripe customer portal. Plan changes and cancellation take effect at the next billing period; existing results remain accessible.",
          "Completion emails are sent when requested. Weekly digests are opt-in and can be switched off in Settings. Reports export as PDF or CSV, and optional sharing links expire after 30 days or can be revoked earlier.",
        ],
      },
    ],
  },
  security: {
    title: "Security and data boundaries",
    description:
      "How RankSushi separates workspaces, protects provider credentials, validates requests, and controls report sharing and background work.",
    kicker: "GOOD BOUNDARIES MAKE GOOD PRODUCTS",
    lead: "Your website evidence belongs in your workspace. Connections, billing, and shared reports each have a specific access boundary.",
    sections: [
      {
        title: "Owner-scoped access",
        paragraphs: [
          "The launch model has one owner per workspace. Authenticated server operations independently verify that ownership. Supabase row-level security restricts browser reads to owner-scoped records, while application writes run through validated server operations.",
          "Provider credentials are excluded from browser-readable tables and encrypted before storage. Report files use a private storage bucket. A job identifier or report identifier alone does not grant account access.",
        ],
      },
      {
        title: "Sessions and external authorization",
        paragraphs: [
          "Supabase manages account sessions through Google sign-in and email links. Session refresh validates authentication rather than merely creating a client. Search Console authorization uses separate read-only permission, expiring state, and a callback bound to the initiating account.",
          "Webhook handlers verify provider signatures. Billing entitlements come from reconciled subscription state, never from a successful redirect alone. Usage reservations are atomic to keep concurrent work within allowance.",
        ],
      },
      {
        title: "Safe inspection and sharing",
        paragraphs: [
          "Public fetches reject private and reserved addresses, unsupported protocols, custom ports, oversized responses, and unsafe redirects. DNS addresses are validated and pinned for direct HTTP fetches. Crawls are bounded and robots exclusions are respected.",
          "Shared report links use random tokens, expire after 30 days, and can be revoked. They provide a snapshot of a report, not access to the surrounding workspace. Treat a sharing link as access to the report it represents.",
        ],
      },
      {
        title: "Operational visibility",
        paragraphs: [
          "Operational monitoring is designed to scrub sensitive request data. Product events are recorded internally without session replay. Authentication, provider connections, retries, and delivery failures require validation in the deployment environment before the service is considered operational.",
          "This preview documents the implemented architecture. A production security review and live integration checks are required before launch.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy notice for the RankSushi preview",
    description:
      "Understand the account, website, Search Console, AI-provider, billing, and report-sharing data used by the RankSushi preview.",
    kicker: "THE FINE PRINT, IN PLAIN LANGUAGE",
    lead: "RankSushi uses the information needed to inspect your website, prepare reviewed work, and maintain your workspace. RankSushi is operated by Touristas Technologies. Contact anotherseoguru@gmail.com for privacy requests and support.",
    sections: [
      {
        title: "Information processed",
        paragraphs: [
          "Account information includes your sign-in identity and email address. Project information includes your website URL, business description, target country, language, and preferences. Audits store page evidence and findings; Content Studio stores drafts and revisions.",
          "If connected, Search Console provides performance records such as dates, queries, pages, countries, devices, clicks, impressions, and positions. Authorization credentials are encrypted on the server and excluded from browser access.",
        ],
      },
      {
        title: "Service providers and purposes",
        paragraphs: [
          "Supabase handles authentication and workspace storage. Firecrawl retrieves rendered website content. Google provides Search Console and optional PageSpeed data. OpenAI and Perplexity process the prompts and relevant evidence used for requested drafts or answer checks. DataForSEO provides requested SERP evidence.",
          "Stripe hosts payment collection and billing management; RankSushi does not store card numbers. Resend delivers authentication and requested service emails. Inngest runs persistent jobs, Vercel hosts the application, and Sentry may receive scrubbed operational error data.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "Search Console authorization is optional and can be disconnected or revoked at Google. Weekly digests are opt-in. Requested job notices are controlled at job creation. We do not run session replay in this implementation.",
          "Reports are private unless you create a sharing link. Anyone with that link can view the report until it expires or you revoke it. Draft exports are downloaded to your device and do not publish to your website.",
        ],
      },
      {
        title: "Retention and preview status",
        paragraphs: [
          "Anonymous audit evidence expires after one hour. Saved project records are retained to support history and read-only access after a subscription ends. Delivery suppression records help prevent unwanted email. Operational retention and account deletion procedures must be confirmed before production launch.",
          "Do not submit highly sensitive personal information or confidential material that is unnecessary for a website audit. Touristas Technologies handles requests at anotherseoguru@gmail.com. Contact us to request access, correction, or deletion of account information. Production retention settings and any jurisdiction-specific notices will be finalized before live sales.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms for the RankSushi preview",
    description:
      "RankSushi preview terms covering website inspection, reviewed drafts, third-party evidence, fixed subscription allowances, and launch status.",
    kicker: "A FEW GROUND RULES",
    lead: "RankSushi helps you understand and improve a website you own or are authorized to manage. The current preview is for evaluation; paid live sales remain gated pending merchant, cost, and tax setup.",
    sections: [
      {
        title: "Use the service with permission",
        paragraphs: [
          "Submit websites you own or have permission to inspect and manage. Do not use the service to access private networks, bypass access controls, or submit unlawful content. Your account is responsible for requested work and the material it supplies.",
          "RankSushi prepares findings and drafts. You remain responsible for reviewing factual accuracy, permissions, accessibility, and legal requirements before publishing changes through your own website tools.",
        ],
      },
      {
        title: "Evidence has limits",
        paragraphs: [
          "Crawls may be incomplete, pages may be inaccessible, and providers may fail or change their behavior. Search Console detailed rows are not exhaustive. AI answers are sampled API responses and can contain errors.",
          "The service does not guarantee rankings, traffic, revenue, rich-result eligibility, AI citations, or a particular commercial outcome. Rechecking a page can verify an observed implementation change; it cannot prove the cause of a later performance change.",
        ],
      },
      {
        title: "Subscriptions and allowance",
        paragraphs: [
          "The proposed monthly USD plans are Maki at $29, Nigiri at $79, and Omakase at $149, with the limits displayed on the pricing page. Workspaces share their allowance across projects. There are no automatic overages or credit packs at launch.",
          "Plan changes and cancellation are scheduled for the next billing period. Saved results remain accessible when paid access ends. Checkout displays applicable taxes and the actual subscription terms before payment. Live billing is disabled until the final merchant terms and required setup are approved.",
        ],
      },
      {
        title: "Preview availability",
        paragraphs: [
          "The preview may contain incomplete connections or setup-required states. Illustrative examples are labeled and do not represent customer results. Provider outages or revoked permission may interrupt work; stored partial evidence and job status help explain the result.",
          "RankSushi is operated by Touristas Technologies. For support, billing questions, or a refund request, contact anotherseoguru@gmail.com. Applicable consumer rights remain in effect. The final merchant address, refund terms, and any required jurisdiction-specific notices must be completed before production sales.",
        ],
      },
    ],
  },
};
export const TOOL_PAGES = {
  "seo-audit": {
    title: "Free single-page SEO audit",
    description:
      "Get an evidence-based audit of one public page. Inspect titles, metadata, indexing preferences, headings, links and structured data without a card.",
    kicker: "A LITTLE TASTE OF CLARITY",
    lead: "Your next useful insight starts with one little URL.",
  },
  "metadata-preview": {
    title: "Search metadata preview",
    description:
      "Preview and edit page titles and meta descriptions for desktop and mobile search results. Download your reviewed metadata as JSON.",
    kicker: "MAKE A CLEARER FIRST IMPRESSION",
    lead: "A useful invitation beats a perfect character count.",
  },
  "structured-data": {
    title: "Structured-data checker",
    description:
      "Check JSON-LD syntax, selected schema fields and alignment with supplied visible content. Review findings and export your structured data.",
    kicker: "GOOD MARKUP STARTS WITH REAL CONTENT",
    lead: "Check the structure. Confirm the facts. Keep it relevant.",
  },
} as const;
