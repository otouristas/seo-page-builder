# Architecture and evidence boundaries

## Runtime and interface

Next.js App Router, TypeScript, self-hosted Inter/Bricolage fonts, custom responsive design tokens and original SVG Maki poses. Server-rendered public pages have unique metadata, canonical URLs, sitemap entries and semantic structure. Account, API, demo and shared-report routes are excluded from indexing. React state holds temporary UI choices; Supabase stores all actual work. `/demo` uses explicitly labeled fixtures and never writes customer data.

All project operations independently authenticate through `getUser` and require the immutable workspace owner relation. `proxy.ts` calls `getClaims` to refresh cookie sessions. Browser clients get only the publishable key. Credentials and provider response receipts have no authenticated read grants. Writes go through checked server operations; RLS provides a separate layer for browser reads. Composite foreign keys prevent malformed service writes from mixing workspaces.

## Database

The migration creates workspaces, projects, subscriptions, jobs, page snapshots, opportunities, drafts/revisions, GSC records, AI checks, reports, counters/reservations, integrations, OAuth states, webhook journals, rate buckets, product/email events and free-audit claims. Launch has one owner per workspace. The reports bucket is private; downloads authenticate the owner. Optional 30-day share tokens are hashed, revocable and noindex. No service credentials appear in project responses.

Quota reservations and job insertion share one transaction. PostgreSQL advisory/row locks serialize simultaneous claims. Replays must match workspace, project, job kind and input. Usage is tied to the Stripe billing period, not the calendar month. Settlement happens once. Free usage is one page per account lifetime. Recrawls use the same page allowance. Ended paid subscriptions retain read-only results.

## Evidence

HTML observations distinguish HTTP/fetched and rendered content. Every finding records its source, observed time, market and measured/inferred/sample classification. Missing evidence is `unknown`; contextual thresholds are guidance. Canonicals, deliberate noindex and empty decorative alt attributes are not automatically errors. The schema tool checks supported JSON-LD shapes and visible text consistency; it does not promise Google eligibility or full Schema.org validation.

Free audits use bounded direct HTML requests with public DNS validation, pinned resolved addresses, redirect revalidation, byte/time limits and robots checks. Paid rendering/discovery uses Firecrawl. Its crawl is capped, same-host, asynchronous and robots-aware; results save incrementally. API callbacks are signed; polling reconciles provider status. Failed, blocked and unvisited URLs remain distinct. PageSpeed lab and field data are shown separately.

GSC authorization is separate from account login. State, PKCE, cookie, user and expiry are checked and consumed once. Refresh credentials are AES-256-GCM encrypted. Readonly access is the only requested Search Console scope. Initial imports cover 90 final-data days; daily imports reconcile seven days. Property totals and query/page/country/device detail are distinct datasets; totals never sum detail rows. CSV remains labeled. The 28-day comparison shows missing dates and limited detail coverage; it does not claim traffic causation.

Drafts record their returned model, supplied evidence URLs and confirmation requests. All content is reviewable with versioned edits and exports. Crawled text is untrusted data in model instructions. Readiness criteria do not predict citation or rankings. AI visibility records exact prompts, provider/model, timestamp, market, answer, citations and literal brand mentions. These are sampled API responses, not consumer-product share of voice. DataForSEO competitors are actual returned organic results.

The public learning registry supplies six guides, three blog posts and eight help articles, plus HTML/Markdown/checklist exports, RSS and `llms.txt`. Draft preparation selects up to three versioned editorial methods separately from page evidence and retains their references in draft metadata. Audit findings link to matching methods. See [KNOWLEDGE.md](KNOWLEDGE.md) for provenance and editorial updates.

DataForSEO research reuses the durable `serp` job kind with an explicit mode, defaulting old requests to live SERP. One requested mode is one allowance reservation and one provider receipt: either a bounded Google advanced snapshot or a one-keyword Labs overview. Returned estimates and paid-search competition never masquerade as the project's measured traffic. Provider-level and task-level status must both succeed. Research output and CSV retain source, observation time and market; only the owner can retrieve saved jobs.

## Durable work and recovery

Inngest handles bounded jobs, retries, workspace concurrency, cancellation, a persisted dispatch outbox, daily/weekly schedules, hourly Stripe reconciliation and requested notices. A provider receipt is claimed before a billable request. A saved response is reused. If a timeout leaves the outcome uncertain, that billable operation is not automatically replayed. Its reservation is retained for operator reconciliation. Confirmed auth/rate-limit rejection can retry. Credentials are never included in events.

Cancellation is persisted before the Inngest cancellation event; each subsequent stage also checks persisted status. A report retry reuses its saved payload and completes both storage uploads. Closing a tab does not stop work. Large initial GSC imports use one durable step per date. Scheduling and reconciliation currently process up to 1,000 projects/subscriptions per run; add cursor fan-out before exceeding that scale.

Stripe webhooks are signature-verified and journaled. The handler refetches current subscription state instead of applying stale event payloads; timestamp-ordered database writes reject older fetches. Checkout redirects do not grant access. Checkout intent/customer/session idempotency prevents concurrent duplicate sessions. Plan changes and cancellation are deferred to the next billing period. Portal configuration must prohibit immediate plan changes.

Resend uses idempotency keys and a delivery journal. Bounces/complaints/suppressions suppress later app emails. Supabase Auth uses separately configured Resend SMTP. Digests default off. Sentry removes user identity, payloads, credentials, query strings and share tokens; there is no session replay. Product events contain workspace/project/job identifiers and bounded operational metadata.

## Launch limits

No CMS publishing, team/agency roles, historical-account migration, unlimited site crawls, automatic overages, consumer-AI tracking or promised rankings. Live costs, OAuth verification, email/domain verification, merchant/tax configuration and signed-provider lifecycle tests are release gates. Configuration presence is never labeled operational validation.

## Paid introductory access

`billingAccess` is the common server decision for project and provider quotas. The new subscription evidence columns and private checkout-intent flag distinguish three-day trial access from the selected renewal plan. A verified initial invoice unlocks the trial; `active` without a verified paid monthly invoice does not unlock full monthly quotas. Trial usage uses `trial:<subscription id>`, so a price/period edit cannot refill it. SQL locks serialize trial eligibility and reconciliation; the first observed trial dates and lifetime use survive retries and cancellation. `STARTER_TRIAL` defines the allowance. After a successful renewal, usage keys switch to the paid billing period.
