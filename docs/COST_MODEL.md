# Cost approval before live sales

The proposed prices and limits are implemented. Provider unit costs have **not** been validated against this merchant’s accounts or actual workload, so `BILLING_COSTS_APPROVED=false` remains a release gate. Do not insert guessed current prices or present modeled margins as measured results.

Collect billed usage from an isolated test batch, including a partial crawl, recheck, each draft type, both answer providers, SERP calls, retries and the largest allowed prompt. Use conservative observed costs (including model input/output, search tool calls and render premiums), not a low average from one short prompt. OpenAI drafts are capped at 3,500 output tokens; API answer checks at 2,000 and two tool calls. Firecrawl jobs have at most 200 requested pages; monthly allowances remain workspace-wide.

Record the following in an **untracked** `measured-costs.json`, using dollars per action and percentages where specified:

| Field                | Meaning                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| page                 | Conservative cost per inspected page, including rendered fetches/recrawls                                                             |
| draft                | Conservative bounded drafting action, including input and output                                                                      |
| answer               | More expensive observed provider + tools for one prompt/provider check                                                                |
| serp                 | The more expensive conservative cost of one live SERP request or one keyword-overview request; both use the shared research allowance |
| workspaceOperations  | Allocated database, jobs, storage, email, logs and scheduled work per workspace                                                       |
| paymentPercent       | Merchant’s verified percentage payment fee                                                                                            |
| paymentFixed         | Merchant’s verified fixed payment fee in USD                                                                                          |
| refundReservePercent | Merchant-approved reserve assumption                                                                                                  |

Run `node scripts/cost-model.mjs measured-costs.json`. It models 100% allowance use for all plans, payment fees and the explicit reserve. Retain the invoice evidence, run date, provider models/prices and rationale for each input privately. Include host/service minimums at plausible customer counts, free-audit abuse budgets (500 global audits/day), currency/tax treatment and support cost in the merchant review.

If a tier does not meet the chosen contribution target under conservative consumption, revise pricing/allowances before sales. Do not enable overages or silently increase caps. The three live-sale gates are independent: cost approval, merchant/tax/legal readiness and the explicit live launch flag.

## Recorded DataForSEO verification

Two single-query calls through the actual adapters returned usable data for `seo software`, US / English: live Google advanced results cost **$0.002**; Labs keyword overview cost **$0.01212**; combined **$0.01412**. The returned task IDs, costs and normalized data are recorded in `artifacts/qa/dataforseo-live-research.json`. Account authentication was separately checked with the no-cost user-data endpoint.

These observations validate the account and two adapter paths, not every market or a conservative full-workload cost. Keyword demand is more expensive in this sample, so modeling every research action as the cheaper SERP request would understate costs. Ordinary phrases only, one keyword, depth 10, no extra question-expansion clicks and no clickstream add-ons are the current boundaries. Keep the billing cost gate disabled pending the complete review above.

## Three-day starter trial

The same calculator includes the $1 trial at full consumption: 20 pages, 3 drafts, 3 answer checks, and 3 SERP/research lookups. Include the full fixed payment fee; do not divide it across subscription renewals or assume every trial converts. Apply the conservative workspace-operations input and refund reserve too. The trial is a separate unit-economics row, with no assumed provider cost or claimed positive margin until measured inputs are supplied. Live sales remain gated pending this review.
