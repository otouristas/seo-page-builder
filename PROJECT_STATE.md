# RankSushi implementation state

Updated: 9 September 2026. Domain: **ranksushi.com**. Operator: **Touristas Technologies**. Support: **anotherseoguru@gmail.com**.

## Delivered in code

- Next.js App Router replacement with original Maki SVG poses, rice/nori/salmon/wasabi design, self-hosted Bricolage Grotesque and Inter, responsive landing page, eight workspace sections and clearly labeled example workspace.
- Feature, help, methodology, privacy, terms and security pages; unique metadata/canonicals, sitemap, structured data, private-route noindex, free metadata and supported JSON-LD checks.
- Supabase SSR browser/server clients and real session refresh in `proxy.ts`; independent authorization on server operations; Google account login and email magic links; persistent onboarding/projects.
- An owner-scoped SQL schema, RLS/read grants, composite ownership constraints, encrypted Google credentials, private report storage, atomic quotas, durable jobs and webhook journals.
- Bounded free HTML audits and Firecrawl rendered crawl/recheck adapter; contextual findings, evidence, opportunities, editable versioned drafts and exports. PageSpeed lab/field separation.
- Separate GSC readonly OAuth with PKCE/state/expiry/replay checks, property selection, 90-day imports/daily reconciliation, separate totals/detail, 28-day comparisons, query opportunities and labeled CSV fallback.
- OpenAI Responses drafts and web-search samples, Perplexity Agent samples, DataForSEO real organic SERP adapter. Prompts/models/citations/observations and unsupported-claim confirmation requests are retained.
- Inngest execution, outbox retries, concurrency, cancellation, daily/weekly scheduling, Stripe reconciliation and transactional/opt-in email scheduling. Uncertain billable provider requests do not replay automatically.
- Stripe Checkout, safe portal configuration script, verified retryable webhooks, current-state reconciliation, next-period plan changes/cancellation and three explicit live-sale gates.
- Resend delivery/suppression handlers and Supabase SMTP setup instructions; scrubbed Sentry instrumentation; internal operational events without session replay.
- PDF/CSV reports, revocable expiring share links, accessible dialogs/forms, empty/error/disconnected/quota states and actual persisted job stages.
- Floating pill marketing header and an edge-to-edge mobile dialog with scroll lock, focus containment/restoration, Escape dismissal, real product benefits and Maki artwork.
- Searchable SEO kitchen (six guides), blog (three posts), Help Center (eight articles), primary sources, related reads and downloadable checklists. The available HowToRankFirst/GoCuba operating framework is the starting point; the exact earlier knowledge corpus is still awaiting user confirmation. No private client workbook data was imported.
- Shared HTML/Markdown content, article structured data, RSS, human/XML sitemaps and footer-linked `llms.txt`. Audit findings link to relevant guides; draft creation records selected guide versions separately from business evidence.
- DataForSEO research controls for live Google results and keyword demand, source/market/freshness labels, missing-data states, monthly estimate history and CSV export. Each explicit mode consumes one lookup through the existing durable jobs and quota flow.

## Verified

- `npm run typecheck`, `npm run lint`, production build and diff checks pass.
- **76 unit/SQL/integration-fixture checks pass.** Includes actual PostgreSQL-compatible migration/RLS/quotas, crypto, SSRF rules, GSC aggregation, Stripe state/renewal/signatures/retries, uncertain-provider replay protection, PDF/CSV exports, knowledge references, research normalization and bounded request validation.
- **22 desktop/mobile browser checks pass**, plus two intentional duplicate-metadata mobile skips. They cover public sitemap routes, canonical metadata, all 17 Markdown articles, all eight demo sections, accessibility, keyboard/reduced motion, editing/export, learning search/filter/recovery, full-screen menu focus/scroll behavior, research demo controls and unauthenticated denial.
- **A separate real local Supabase + Inngest end-to-end test passes**: public page fetch, magic-link email captured in local Mailpit, PKCE browser sign-in, project creation/audit adoption, reload persistence, a second real account denied reads/writes/polling/reports/storage, 20 simultaneous network quota requests admitting exactly 7, job deduplication, report completion after navigation, PDF export and share revocation.
- PDF rendered and visually inspected with an embedded static Noto Sans font, Greek text and long URL wrapping. Fixtures are explicitly labeled.
- Current local production mobile Lighthouse: homepage and SEO kitchen each score **96 performance / 100 accessibility / 100 best practices / 100 SEO**. The kitchen link-label check also passes after correction. These are lab measurements, not field data; see `lighthouse-learning-homepage.json` and `lighthouse-learning.json`.
- Screenshots, final PDF fixture, Lighthouse JSON and deployed route evidence live in `artifacts/qa/`. Provider configuration status is separately recorded in `artifacts/provider-validation.json`.
- DataForSEO account authentication passes the no-cost user-data endpoint. Two actual adapter calls returned 9 organic listings, 4 related questions and one keyword-demand record; their provider-reported total cost was **$0.01412**. See `artifacts/qa/dataforseo-live-research.json`. This is provider/adapter verification, not hosted account/job acceptance.

GitHub Actions could not start its runner: GitHub reports that the account is locked due to a billing issue (run `34277194687`). This is a CI account blocker, not a passing CI run. Local checks and Vercel builds passed; rerun the workflow after the account issue is resolved.

## Hosted setup remains required

The supplied Supabase project `ecfvgnzkysmycxlcyzpg` remains unmodified; its schema migration was applied only to `ranksushi-local`. Hosted service-secret/management access is not configured here. DataForSEO API credentials are configured in ignored local storage and sensitive Vercel Preview/Production variables. Other private provider credentials, Inngest configuration, Google consent, a verified Resend sender/SMTP, remaining merchant/legal/tax details and full-workload cost approval are still missing.

Hosted provider workflows are **not certified operational**. The live DataForSEO adapter checks do not establish hosted Supabase/Inngest execution, and local fixtures are not live Google, Firecrawl, AI, Stripe or Resend validation. Live billing remains disabled. Public tools/demo can be reviewed on Vercel; real hosted accounts/jobs require the remaining setup. Follow `docs/SETUP.md`, run `npm run check:setup`, then validate the actual provider connections before release. Rotate the DataForSEO password shared in chat and replace its stored values.

Boundaries remain as agreed: fresh English launch, USD capped subscriptions, one owner per workspace, reviewed drafts/exports, no CMS publishing, no automatic overages and no comprehensive consumer-AI tracking. Current UI/history queries are bounded (500 recent snapshots/opportunities; 50 drafts/jobs/reports), and schedules process up to 1,000 projects/subscriptions per run. Expand pagination/fan-out before exceeding those limits. Structured-data checks cover supported types and visible text, not a complete Schema.org validator.

## Repository and deployment

**Vercel only** is the confirmed hosting requirement for previews, production and rollback. The owner merged [PR #4](https://github.com/otouristas/seo-page-builder/pull/4) into `main` on 8 September 2026 at 20:52 UTC, producing merge commit `8b2b7931ba823d4db13cd6b8e99201e7cf4dadab`. The navigation, knowledge and research follow-up remains on `codex/ranksushi-rebuild` / [PR #5](https://github.com/otouristas/seo-page-builder/pull/5). `archive/rankframe-baseline` preserves original source commit `c498f40a5db320f427218f748a81c7eca6c0db22` for reference. No ranksushi.com DNS change was made.

Vercel project: `otouristas-projects/ranksushi`, connected to `otouristas/seo-page-builder`. The merged baseline is deployed at https://ranksushi.vercel.app. The supplied public Supabase variables and server-only DataForSEO credentials are configured in Preview and Production; the production callback origin is temporarily `https://ranksushi.vercel.app` until the custom domain is connected and its callbacks validated. The existing production build predates the DataForSEO environment update. Other private providers and hosted schema setup remain outstanding. This is not a custom-domain cutover or a live-sales release.

Reviewed preview: https://ranksushi-9sgrgondh-otouristas-projects.vercel.app. All eight preview route checks passed; see `artifacts/qa/deployed-preview-routes.json`. The production rebuild at https://ranksushi-7am4rmxjo-otouristas-projects.vercel.app is Ready and assigned to https://ranksushi.vercel.app. All eight production route checks pass, including API 401 and account-page login redirect after configuring the public Supabase variables. Results are recorded separately in `artifacts/qa/deployed-routes.json`.
