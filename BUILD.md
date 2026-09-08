# Rankframe — build notes

## Goal

A tool where a user pastes **any public URL**, the page is fetched and audited, and a **Google-like SERP scene** is staged for its best keyword niches. Plays on the left ("do this to move up"), a coach on the right, and the plays move the modeled position live. Presented as a full SaaS: pillar header, indicators, case studies, pricing, footer, sign-in.

Not a ranking guarantee. A lab: audit + demonstration + moves.

## What exists

### Marketing (`/`)
- Sticky pillar header: Product (mega-menu into each lab tab), Proof, Case studies, Pricing; **Sign in** and **Try it free**; mobile sheet and sticky CTA bar.
- Hero with URL entry and an animated SERP where "your page" climbs as plays light up.
- Indicators (14 checks, 14 markets, 10 slots, 8 live lookups/day, 5 pillars) plus **live counters** from real product events (hidden until there is data).
- Logo strip of the public pages used in case studies (labeled as subjects, not customers).
- Feature bento, how-it-works, an **interactive live demo** running the real stage on a modeled snapshot of stripe.com/payments.
- Three case studies (Stripe, Ahrefs Blog, Skroutz) with before/after stages at `/case-studies/:slug`. Modeled snapshots, produced by the same engine as the lab.
- Testimonial slots ship as **placeholders flagged "Sample"** (`src/lib/marketing/testimonials.ts`). Replace with attributed quotes and set `placeholder: false`.
- Pricing is **Guest vs Signed in** (no paid plans). FAQ, CTA band, footer, privacy and terms.

### Lab (`/app`)
- **Overview**: on-page and technical gauges, best modeled position, click estimate, trajectory chart per scene, quick wins, Google-style snippet preview, snapshot facts.
- **SERP Lab**: scene pills, plays grouped by pillar, Google-like stage, niche rail (hygiene / relevance / contest breakdown, competition floor, sparkline, live pull), desktop/mobile frame, before/after compare.
- **Audit**: 14 weighted checks with fix copy; snippet editor with pixel meters that re-runs checks and re-models every scene.
- **Keywords**: stage any query; suggestions from the page's headings.
- **Search Console**: drag-drop CSV/TSV import (EN, DE, FR, ES, IT, NL, PT, EL headers), striking-distance (8–20) and CTR-opportunity filters, stage a query as a scene, save to account when signed in.
- **Coach**: rule-based answers from the analysis (language of the question, else market pack). No LLM.
- Keyboard: `⌘K` focuses the URL, `1–6` switch tabs. Share copies a deep link including market, keyword, applied plays, device and compare.
- **Recents**: last 8 analyses on this browser (`localStorage`), reopen without refetch.

### Data — real vs modeled

| Source | Status |
|---|---|
| Public HTML fetch | **Real.** Title, meta, canonical, robots + X-Robots-Tag, lang, hreflang, H1–H3, OG, JSON-LD types, full and main-content word count, excerpt, images/alt, links, viewport, status. 8 s timeout, 1.5 MB cap. Loopback/private hosts blocked unless `ALLOW_PRIVATE_URLS=true`. |
| Audit score | **Real** checks on the fetched HTML, weighted (hygiene). |
| Relevance | **Modeled** from keyword vs title/H1/H2/excerpt/schema/lang. Per scene. |
| Keyword niches | **Modeled** from headings: n-gram extraction, intent by trigger words (8 language packs) and page bias. Difficulty = intent base + phrase length, **no jitter**. |
| SERP competitors | **Modeled** from language pools + local overlay per market (14 locales). Titles follow the keyword language. |
| Position | **Modeled**: `fitness = hygiene×0.55 + relevance×0.45`; `distance = (1−fitness/100)×0.55 + contest/100×0.50`; plays diminish by 0.85 each and cannot pass `contest/100×0.28`. `rank = 1 + round(distance × 9)`, beyond 1.0 = page two. |
| Live page one | **Real** via DataForSEO `serp/google/organic/live/regular` when `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` are set. Signed-in users, **8 / user / day**. Your slot inside live results stays modeled. |
| Sign in | **Real** Better Auth (Google, X). Sessions in Postgres or embedded PGLite. |
| GSC | Import from an export file. Google's Search Console API is not connected (the sign-in has no `webmasters` scope). Signed-in users persist rows in `gsc_rows`. |
| Counters | **Real** rows in `lab_events`, never seeded. |

## Stack

TanStack Start + Router, Vite 8, React 19, TypeScript, Tailwind CSS v4 (`@theme` tokens in `src/styles/app.css`), Zustand, Recharts, Motion, lucide, cheerio, Better Auth, Kysely on `pg` or `@electric-sql/pglite` (own dialect in `src/lib/db/pglite-dialect.ts`), self-hosted fonts (Bricolage Grotesque, Inter, JetBrains Mono), Nitro for the server build, Playwright for screenshots.

Design direction "Ink & Signal": navy ink shell, electric lime accent, periwinkle secondary, off-white paper bands on marketing pages, white Google-styled stage. Patterns: dot grid, grid lines, aurora glows, grain.

## Layout

```
src/routes/            file routes (+ /api/auth/$ for Better Auth)
src/components/marketing  landing sections, header, footer, legal
src/components/serp    stage, plays panel, niche rail, compare, hero climb
src/components/app     shell, sidebar, topbar, views, coach, states
src/components/ui|patterns|charts   primitives, backgrounds, charts
src/lib/seo            engine: audit, relevance, fetch-page, niches, serp-model, locale packs, plays, rank-model, ctr-curve, scene, share, recents, coach, demo, case-studies
src/server             server functions: analyze, session, stats, gsc, live-serp
src/lib/db             Kysely + migrations runner + PGLite dialect
src/lib/auth           Better Auth server + client
migrations/            0001 auth, 0002 gsc_rows + dataforseo_usage, 0003 lab_events
```

## Environment

```
VITE_AUTH_ENABLED=true          # client flag
BETTER_AUTH_SECRET=             # required for sign-in
BETTER_AUTH_URL=                # e.g. https://rankframe.app
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID= / TWITTER_CLIENT_SECRET=
DATABASE_URL=                   # Postgres; unset → PGLite in ./.data/pglite
DATAFORSEO_LOGIN= / DATAFORSEO_PASSWORD=
ALLOW_PRIVATE_URLS=true         # local testing only
```

Migrations in `migrations/*.sql` are idempotent and run on first DB access (both Postgres and PGLite).

## Run, build, deploy

```
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm test             # vitest: audit, relevance, rank-model, share, markets, GSC
npm run build        # .output/ (Nitro node-server preset)
npm start            # node .output/server/index.mjs
npm run screenshots  # BASE_URL=http://localhost:3000 node scripts/screenshots.mjs
```

Vercel: standard Nitro deployment. Set `DATABASE_URL` in production; PGLite is for dev and previews. `@electric-sql/pglite` and `pg` are externalized from the server bundle (see `vite.config.ts`).

### Netlify

`netlify.toml` pins the build: command `npm run build`, publish directory **`dist`**, Node 22. Inside a Netlify build, Nitro switches to its `netlify` preset (pinned in `vite.config.ts` via the `NETLIFY` env var): the SSR function lands in `.netlify/functions-internal/main.mjs`, the deploy manifest in `.netlify/deploy/v1/config.json`, and static assets in `dist/`. If the site was created before this file existed, check that Netlify's publish directory is `dist` and that the production branch is the one carrying this code.

Environment variables to set in Netlify (Site configuration → Environment variables):

- `DATABASE_URL` — required for sign-in, saved Search Console data, live-lookup quotas and the landing counters. Serverless functions have a read-only filesystem, so the embedded PGLite fallback is disabled there; without a database the site runs in guest mode (analysis, scenes, plays, coach all work) and `/api/auth/*` answers 503.
- `VITE_AUTH_ENABLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (the site URL), `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, optionally `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET`. Add `https://<site>/api/auth/callback/google` as an authorized redirect URI in the Google client.
- `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` for live page-one lookups.

Local dry run of the Netlify build: `NETLIFY=true npm run build`, then inspect `dist/` and `.netlify/`.

## What would make GSC "real"

A separate OAuth client with the Search Console API scope (`https://www.googleapis.com/auth/webmasters.readonly`). The Google sign-in used for accounts does not carry it.

## Markets (Day 0)

Fourteen locales in `src/lib/seo/markets.ts`: `us uk ca au in de fr es it nl gr br mx ae`. Default is inferred from `navigator.languages`, not Greece. Copy packs live on language (`en de fr es it nl el pt`); keyword script wins over market for SERP titles. Competitor lists are a language pool plus a small local overlay. Live DataForSEO uses each row's `locationCode` / `languageCode`.
