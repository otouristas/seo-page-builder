# RankSushi

Useful insights, served fresh. A Next.js SaaS from **Touristas Technologies** for **ranksushi.com**. Support: **anotherseoguru@gmail.com**.

Connect a website → discover opportunities → prepare a reviewed draft → recheck the live page → measure observed performance.

## Run

Requires Node 24 and npm. Dependencies are exactly pinned in `package-lock.json`.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3100. `/demo` is explicitly illustrative and works without provider credentials. `/tools/metadata-preview` and `/tools/structured-data` run locally. Real accounts, the free audit, saved projects and jobs require the Supabase migration and server secret. Missing configuration produces a recovery state rather than invented results.

Explore `/learn` (six guides), `/blog` (three posts) and `/help` (eight articles), with search, filters, primary sources and downloadable checklists. Public discovery includes `/llms.txt`, `/feed.xml`, `/sitemap` and `/sitemap.xml`. The knowledge methods also inform audit links and versioned draft guidance. [KNOWLEDGE.md](docs/KNOWLEDGE.md) documents the source boundary and extension points.

For an isolated complete database/auth/storage/job test:

```sh
npx supabase start --exclude studio,realtime,edge-runtime,logflare,vector,supavisor,imgproxy
npm run dev:local
# In another terminal:
npx inngest-cli@latest dev --no-discovery -u http://localhost:3100/api/inngest
# In a third terminal:
LOCAL_SUPABASE_TEST=1 PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test local-services --project desktop
```

The local project is `ranksushi-local`, with independent ports 56321–56328. `dev:local` reads only this local stack's credentials into process memory. It never overwrites the configured hosted Supabase project. Local mail is captured by Mailpit; integration tests send nothing to external recipients and use no paid AI or payment services.

## Check

```sh
npm run check                # TypeScript, ESLint, 76 meaningful unit/SQL checks
npm run build               # Stop dev first; it shares .next
npm start
PLAYWRIGHT_BASE_URL=http://localhost:3100 npm run test:e2e
npm run check:setup          # Presence only, no values printed
npm run verify:providers     # Read-only checks, no purchases or AI calls
```

Read [SETUP.md](docs/SETUP.md) for provider configuration and deployment, [ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and recovery, [COST_MODEL.md](docs/COST_MODEL.md) for live-sale gating, and [PROJECT_STATE.md](PROJECT_STATE.md) for verified versus remaining work.

## Baseline and release

RankSushi uses **Vercel only** for previews, production deployments and rollback. The Next.js rebuild was merged into `main` through [PR #4](https://github.com/otouristas/seo-page-builder/pull/4). The original TanStack Start / Better Auth source remains on `archive/rankframe-baseline` at `c498f40a5db320f427218f748a81c7eca6c0db22` for reference.

Review the [Vercel preview](https://ranksushi-ezvgcam78-otouristas-projects.vercel.app), with all 19 deployed route checks passing. Hosted provider setup and acceptance checks remain required before a live-sales release; see `PROJECT_STATE.md`.
