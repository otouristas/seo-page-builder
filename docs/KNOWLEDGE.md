# The RankSushi knowledge layer

RankSushi now has one versioned editorial registry in `src/lib/learning/content.ts`: six practical SEO/AEO/GEO guides, three blog posts and eight help articles. Each record supplies HTML, search/filter metadata, Markdown, a downloadable checklist, sources, related reads and sitemap entries. Blog records also supply RSS. Change the record instead of maintaining separate copies.

## Provenance

The available HowToRankFirst / GoCuba research framework informed the starting structure: search intent, an evidence-backed content map, audit triage, questions, internal links and a 90-day execution plan. The user's exact intended earlier knowledge corpus has not yet been confirmed. This is an original RankSushi adaptation of that operating framework, not an import of a private client workbook or a claim that the entire earlier corpus was recovered.

Current public guidance cites primary documentation and distinguishes editorial methods from observations about a customer's website. No client keywords, budgets, forecasts, contact details or private workbook records were published. Old project pricing, ranking forecasts and platform-visibility claims were not carried over.

## Use inside the application

Audit findings link to the relevant guide. Draft creation selects at most three guides using the draft type, request and observed findings. The AI input keeps this editorial guidance separate from page evidence; business claims still require the supplied page evidence. Saved drafts retain guide URLs and the knowledge version, so a later editorial change does not silently change the provenance of earlier work.

The current `KNOWLEDGE_VERSION` is `2026-09-09.1`. Increment it for substantive method changes. Review the related primary sources and update the article date when a claim changes. Adding an article also requires valid related slugs, sources, a summary, a checklist and a useful action; tests check these relationships.

## Public discovery

`/learn`, `/blog` and `/help` have searchable libraries and individually canonical articles. `/sitemap.xml` is the search-engine sitemap; `/sitemap` is the human directory. `/llms.txt` is a curated Markdown index, and `/feed.xml` is the blog feed. Each article exposes `/index.md` and `/checklist.md` without private application data.

`llms.txt` is a proposed discovery format. It is not a ranking signal or a guarantee that an AI provider will read or cite RankSushi. The article on this topic links to the proposal and Google's AI-feature guidance. HTML remains the canonical public version.

## Suggested next product additions

These are proposals, not delivered features:

1. **Content decay inbox.** Compare complete Search Console periods, identify affected page/query pairs and let the user account for seasonality or site changes before creating a task. Start after real Search Console sync is validated.
2. **Brand facts library.** Let a workspace owner approve business facts, claims and source URLs with review dates. Drafts should distinguish an approved business fact from a general writing method and flag stale or conflicting sources.
3. **Competitor gap worksheet.** Extend bounded DataForSEO research to compare user-selected domains and map relevant gaps to existing URLs. Show expected allowance and provider cost before adding any new paid API endpoint; keep irrelevant intent out of recommendations.
4. **Release annotations.** Tie an exported draft and verified live change to dated Search Console comparisons, preserving other changes that could explain the result. Report associations rather than claiming causation.

Prioritize validated hosted accounts/jobs and the existing evidence workflow before expanding provider scope. "All the data" should mean relevant, traceable data with explicit limits, not automatic bulk calls across every billable API.
