# SEO Corpus Review → RankSushi

Recovered and integrated on 9 September 2026.

## Where the original material lives

- [Owner-supplied shared conversation](https://chatgpt.com/share/6aa088ed-c8f0-83eb-980f-616edd1fb769): the original 20-topic framework, task creation configuration and **11 review reports**, 22 August–1 September 2026.
- [Private Google Drive document: SEO Skill Library — 2026 Corpus Updates](https://docs.google.com/document/d/1m6T70fB1tpZ_GEJj3pNTSAqGHJQJ-dlKeIFHX0GwTeY/edit): created and last modified on 22 August; contains **six findings from the first pass**, not the subsequent reports.
- No matching local Codex automation or separate historical SKILL files were found. Statements in the conversation about updating memory do not establish another recoverable file store.
- The shared snapshot records the ChatGPT task as paused on 1 September because updates had not been viewed. This is historical snapshot evidence, not a fresh read of the scheduler. No task was created, resumed or modified.

## Where it is saved now

| Path | Purpose |
| --- | --- |
| `reviews/YYYY-MM-DD.md` | The eleven selected historical reports; recovered citation links; clearly not automatically trusted |
| `manifest.json` | Report dates, original message IDs and source URLs |
| `../../config/seo-corpus.json` | Recovered schedule, original prompt, paused snapshot state, 20 topics, storage and review policy |
| `../../src/lib/knowledge/corpus.ts` | 24 deduplicated, curated product methods with applicability, action, guardrail, verification and sources |
| `../../src/lib/knowledge/articles.ts` | Public handbook library and original-evidence content guide |
| `../../config/ranksushi-seo.json` | RankSushi's own eight-page intent map, domain launch gates and measurement plan |

Only the selected SEO reports were imported. The complete conversation and private client discussions are **not** tracked or bundled into the application. The original prompt is preserved as a record; instructions inside source material do not modify the agent's memory or create a scheduler.

## What changes in the product

- The public library at `/learn/seo-evidence-library` supports topic search, evidence-class filtering, source inspection and copy/download of contextual fix briefs. Its Markdown representation includes the same methods.
- Content Studio receives at most four selected methods and saves their IDs, URLs and version with draft metadata, alongside existing handbook references. Business claims still require project evidence. Briefs/content must identify an original contribution or ask the owner for missing evidence.
- Audit, opportunity and SERP fix prompts select up to two methods. Copying does not implement, publish, or verify a change.
- The structured-data validator inspects Review/AggregateRating nesting and subject ambiguity, distinguishes missing evidence, and asks for ownership/provenance before drawing conclusions about business reviews. It does not validate every Schema.org subtype or resolve all JSON-LD references.
- Page audits collect every applicable robots/googlebot meta tag, case-insensitively, including the body. An exclusion stays contextual and is never removed automatically.
- The sitemap, handbook search, footer and llms.txt expose the new public guides. No historical private document is exposed in these resources.

## How to update safely

1. Inspect the primary source. Record its URL, review date, scope and evidence class.
2. Compare with existing rule IDs and historical reports. Merge duplicates rather than inflate the rule count.
3. Preserve Google guidance, research and editorial interpretation as separate labels. Keep time-sensitive claims in historical notes until checked. In particular, the original crawler byte limits, regional enforcement claims, preferred-source changes and social-property support were **not** enabled as product rules here.
4. Edit the curated method and increment `CORPUS_VERSION`. Update the source review date and relevant article date only when content changes.
5. Run `npm run check`, production build and browser checks. Review the resulting fix prompt and saved provenance.
6. A future scheduler should produce review candidates; it should not automatically edit product rules, publish pages, or write private project evidence into this public corpus.

The twenty topics are a recovered taxonomy, not a claim of twenty completed standalone skills. Existing title/snippet and internal-link guides complement this selected rule library. This is not an exhaustive import of Ahrefs, Semrush or Google documentation.

## RankSushi's own search visibility

`npm run check:seo-launch` inspects the eight target pages on localhost:3100: response, title, description, canonical, main heading, applicable indexability signals, JSON-LD syntax and sitemap inclusion. It writes `artifacts/qa/seo-preview.json`. Pass means implementation checks passed, **not launch ready**.

The owner will buy ranksushi.com later. Its intended canonicals remain configured, but purchase/connection and Search Console ownership remain explicit launch gates. After the owner completes those steps, update the configuration and run `npm run check:seo-launch -- --live` against the canonical origin. The script never buys a domain, changes DNS, submits a sitemap or spends provider credits.

The query map is an editorial hypothesis until demand is measured. Start with the real tool outputs and observed findings on existing pages; collect a Search Console baseline before interpreting movement. No guaranteed position or citation is represented as an outcome.
