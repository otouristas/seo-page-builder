# Configuration and release

Production identity: **RankSushi**, **Touristas Technologies**, **ranksushi.com**, **anotherseoguru@gmail.com**. The public terms/privacy pages identify the operator and support contact. Confirm the registered address, jurisdiction, merchant disclosures, refund wording, processors/retention and applicable rights before live sales. Do not replace these with invented details.

## 1. Supabase

Use isolated development/test resources first. The supplied hosted project is `ecfvgnzkysmycxlcyzpg`; its publishable credentials belong only in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A management connection for that project was not available during implementation. Its production schema has **not** been migrated by this implementation.

Apply both migrations in timestamp order, starting with `supabase/migrations/20260908195431_ranksushi_core.sql` and then `20260908223826_paid_starter_trial.sql`, to the intended empty project using the dashboard SQL editor or the Supabase CLI with verified project access. Review the target before running a remote migration; never reset production. It creates RLS policies and the private reports bucket. Add `SUPABASE_SECRET_KEY` only to the server environment. Generate independent 32-byte base64 values for `TOKEN_ENCRYPTION_KEY` and `RATE_LIMIT_SALT`, and keep the encryption key stable across deployments. Back it up securely; rotating it requires re-encrypting stored Google credentials or reconnecting accounts.

Set Auth site URL to `https://ranksushi.com`. Allow `https://ranksushi.com/auth/callback` and the exact preview callback while testing. Enable Google with its OAuth client secret in Supabase; Google’s account-login redirect is the Supabase Auth callback displayed in the dashboard. Enable email OTP/magic links. For the token-hash email template use:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&next=/app
```

The normal Supabase confirmation link also works with the PKCE exchange when followed in the browser that initiated sign-in. Configure Resend SMTP for real delivery; the application does not send auth tokens itself. Test expired/replayed links, refresh and logout. Public credentials alone do not enable saved work.

## 2. Google Search Console

Create an OAuth web client, enable Search Console API, configure the consent screen and request only `https://www.googleapis.com/auth/webmasters.readonly` for the separate integration. Account login is independent. Register exactly `https://ranksushi.com/api/gsc/callback` plus the preview callback while testing. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` server-side. Google verification and test-user limits apply to the consent configuration.

Connect inside Settings → Connections, select a property that covers the project URL, and run the initial sync. Verify a 90-day import, separate property totals/detail, revoked consent, reconnect, disconnect and daily reconciliation. Grant only read access; no indexing or website edits are performed. CSV import remains labeled and does not count as a verified OAuth connection.

## 3. Jobs, crawling and diagnostics

Connect an Inngest app to `/api/inngest`, set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`, and verify function sync. `INNGEST_DEV=1` is for localhost only. The deployed functions include the job worker, five-minute outbox, daily Search Console/weekly scans, hourly billing reconciliation and onboarding email delivery. Jobs are persisted before dispatch.

Add `FIRECRAWL_API_KEY` and `FIRECRAWL_WEBHOOK_SECRET`. Set the same signing secret in the Firecrawl account. Hosted crawl submissions include `/api/webhooks/firecrawl`; the handler expects `x-firecrawl-signature` HMAC-SHA256. Validate the actual account signing configuration and a signed callback before calling this operational. Verify a partial crawl, robots-blocked page, crawl cancellation and a changed-page recheck. The free single-page tool fetches bounded HTTP HTML directly and needs the database/rate salt, not paid rendering credits.

`npm run verify:providers` checks Firecrawl account authentication through `GET /v2/team/credit-usage` without consuming crawl credits or logging the returned balance. A passing account check does not establish that durable crawls, rechecks or webhook delivery are operational.

Enable PageSpeed Insights API and supply `PAGESPEED_API_KEY`.

DataForSEO uses the account's API login and API password in server-only `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD`. They are configured in ignored local environment storage and as sensitive Preview/Production variables in Vercel. Do not use the website-login password, publish the credentials or put them under `NEXT_PUBLIC_*`. Rotate the password that was shared in chat and update both Vercel environments and local storage; deploy again to apply an environment change.

The Search Console screen offers two separately requested research modes: a desktop Google results snapshot and a one-keyword Labs demand estimate. Each consumes one lookup from the same workspace research allowance. The API supports twelve mapped markets; unsupported markets and advanced price-multiplier operators fail before quota reservation. Keyword demand accepts at most 80 characters and ten words. The adapters preserve missing values, provider status, source, market, time and returned costs; HTTP 200 alone does not establish success.

Account authentication and both actual research adapters have been verified. See `artifacts/qa/dataforseo-live-research.json` and [COST_MODEL.md](COST_MODEL.md). Hosted workspace execution still needs the Supabase service secret/schema and Inngest configuration, then an authenticated end-to-end lookup. The demo never makes paid requests. No automatic bulk collection, backlink crawl, competitor-gap lookup or other DataForSEO API was enabled.

## 4. AI

Set `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.4-mini` and `PERPLEXITY_API_KEY`. Run a bounded draft, an OpenAI web-search answer and a Perplexity Agent answer. Verify returned model, full saved prompt, timestamp, citations, brand mentions and confirmation requests. Model access must be verified for this account. Provider responses are sampled API answers and are never represented as comprehensive consumer AI tracking.

Review actual invoices/usage against the proposed caps using [COST_MODEL.md](COST_MODEL.md). Timeouts that may hide a completed billable request stop automatic replay. Inspect `provider_receipts`, reconcile with the provider and retain evidence before manually releasing uncertain allowance. Do not delete receipts merely to retry a paid call.

## 5. Stripe

Use a separate Stripe sandbox/test account first. Create one Product per tier and one recurring monthly USD Price: Maki 2900 cents, Nigiri 7900, Omakase 14900. Add a separate one-time starter-trial Product/Price for 100 cents (`STRIPE_PRICE_TRIAL`). Use `node scripts/setup-stripe-test.mjs` with an explicitly configured **test** key to provision an idempotent catalog and safe portal configuration. It never accepts a live key. Copy the returned IDs into the named environment variables.

Set the server secret, all four `STRIPE_PRICE_*` values, and `STRIPE_PORTAL_CONFIGURATION`. The portal must enable invoices/payment-method updates and end-of-period cancellation; **disable subscription updates in the portal**, since plan changes are scheduled through the app. Verify invoice/merchant branding and support details in Stripe.

The approved trial is $1 USD for three days, then automatic renewal on the selected plan. Checkout combines the one-time price with the recurring price and a three-day recurring billing trial. Do not use Stripe's separate preview Trial Offer API: it currently does not support hosted Checkout. Require payment collection and terms consent. Configure a valid terms URL in Stripe, truthful RankSushi receipt/statement details, and trial/renewal reminders under Billing → automatic emails; review the short-trial reminder rules and receipts before enabling live sales. Avoid changing another product's global branding in a shared account.

Trial entitlements require a paid initial invoice containing the configured $1 price, matching customer/subscription and offer metadata. The entire trial allows 1 project / 20 pages / 3 drafts / 3 answer checks / 3 SERP lookups. No reset on tier changes. Expiry is checked on every request independently of webhook arrival; paid monthly quotas require a paid renewal invoice. The database records trial use permanently even after cancellation. An open initial Checkout can be resumed after a declined payment.

Create a webhook for `/api/webhooks/stripe` and store its signing secret. Subscribe to `checkout.session.completed`, async success/failure, `customer.subscription.created/updated/deleted`, `invoice.paid` and `invoice.payment_failed`. Use Stripe test clocks and test cards to verify success, failure, retries, out-of-order delivery, renewal, allowance periods, cancellation and resumption. Local signed fixtures and SQL ordering tests are implemented, but they do not replace these real Stripe sandbox lifecycle tests.

Live checkout requires all three flags: `BILLING_LIVE_ENABLED=true`, `BILLING_COSTS_APPROVED=true`, `BILLING_MERCHANT_READY=true`. Keep them false until cost and merchant review is complete. `STRIPE_AUTOMATIC_TAX=true` additionally requires active registrations; confirm origin address, tax codes, inclusive/exclusive behavior and registrations with the merchant’s applicable requirements before enabling it. No live Stripe product, payment, charge or tax registration was created during this implementation.

## 6. Email and monitoring

Verify a domain in Resend and configure SPF/DKIM and the chosen sender, such as `RankSushi <hello@ranksushi.com>`. `anotherseoguru@gmail.com` is the confirmed support contact, not an assumed verified transactional sender. Set `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_WEBHOOK_SECRET`. Route signed events to `/api/webhooks/resend`; subscribe to delivery, failure, bounce, complaint and suppression events. Test real delivery to an explicitly authorized address before launch. Onboarding notices and requested completions are transactional; weekly digests are opt-in. Suppressions prevent later app sends.

Set server/client Sentry DSNs. The event scrubber removes personal fields, credentials, URLs with query strings and share tokens. No session replay or content-bearing analytics is enabled. Test a sanitized error and delivery failure.

## 7. Vercel-only deployment and rollback

Use **Vercel only** for every hosted RankSushi environment. The project is `ranksushi` under `otouristas-projects`, connected to the GitHub repository. Public canonicals always use `https://ranksushi.com`; preview callbacks use the deployment origin when `NEXT_PUBLIC_SITE_URL` is unset. Production currently uses `NEXT_PUBLIC_SITE_URL=https://ranksushi.vercel.app`. Change it to `https://ranksushi.com` when the custom domain is connected and its callbacks validated. While testing on the default Vercel alias, allow that exact origin's Supabase and Google callbacks; also use exact preview origins in the allowlists. Never put secret keys under `NEXT_PUBLIC_*`.

```sh
npm ci
npm run check
npm run build
npx vercel link --project ranksushi --scope otouristas-projects
npx vercel deploy --scope otouristas-projects
```

A successful deployment does not certify live provider flows. Verify deployed public routes, protected APIs, exports, auth and provider callbacks; use `vercel curl` to retain preview protection. Connect the production domain/DNS and enable live sales only after the remaining setup is confirmed and validated. Roll back by promoting a previously verified deployment within this Vercel project. Keep schema changes compatible with the deployment being restored; a deployment rollback does not reverse database migrations. The original source remains at `c498f40a5db320f427218f748a81c7eca6c0db22` on `archive/rankframe-baseline` for reference; create a separate checkout to inspect it instead of resetting this rebuild.
