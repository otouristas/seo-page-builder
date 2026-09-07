# Rankframe — τι χτίστηκε και ποιο είναι το goal

Στόχος upload: [octolens/seo-page-builder](https://github.com/octolens/seo-page-builder)  
Γράφτηκε εδώ: [otouristas/seo-page-builder](https://github.com/otouristas/seo-page-builder)

Το connected GitHub (`otouristas`) έχει μόνο **read** στο org `octolens`. Create/push στο org έδωσε 403. Για να κάτσει ο κώδικας στο octolens repo χρειάζεται write στο org (invite `otouristas` ή reconnect GitHub με org admin).

## Goal

Εργαλείο SEO όπου ο χρήστης βάζει **οποιοδήποτε δημόσιο URL**, γίνεται fetch του on-page, και βλέπει μια **σκηνή Google SERP** για keyword niches. Αριστερά plays («κάνε αυτό για να ανέβεις»), δεξιά coach. Τα plays μετακινούν live τη θέση στη σκηνή.

Δεν είναι εγγύηση κατάταξης. Είναι lab: audit + επίδειξη + κινήσεις.

Ζητήθηκε επίσης πλήρες SaaS presentation (header, indicators, case studies, CTAs, footer), **Sign in with Google**, Search Console, και **DataForSEO** με όρια.

## Τι υπάρχει σήμερα

### Marketing
- Landing `/` με pillar header: Product, Proof, Case studies, Pricing
- Hero με πεδίο URL → ανοίγει το lab
- Indicators (12 on-page checks, 10 SERP slots, 8 DataForSEO/μέρα, GSC export)
- Case studies σε δημόσιες σελίδες (Stripe, Ahrefs Blog, Skroutz) — labeled ως modeled, όχι fake client ROI
- Pricing / limits και footer
- CTA: Sign in with Google + Open lab

### Lab `/app`
- Overview: on-page score, technical score, modeled rank chart
- SERP lab: Google-like αποτελέσματα + plays που αλλάζουν θέση
- Audit: Pass/Fix checks από το πραγματικό HTML
- Keywords: οποιοδήποτε query στήνει νέα σκηνή
- Search Console: import CSV/TSV (Query, Clicks, Impressions, CTR, Position)
- Coach: συζήτηση πάνω στο ενεργό niche

### Δεδομένα — τι είναι real και τι όχι

| Πηγή | Κατάσταση |
|---|---|
| Δημόσιο HTML fetch | Real. Title, meta, H1–H3, OG, schema, word count, images, links |
| Sign in with Google | Real Better Auth μέσω Grok broker. Ανοίγει workspace account |
| GSC properties via OAuth | **Δεν γίνεται.** Το Google login δεν έχει `webmasters` scope. Τα queries μπαίνουν μόνο από GSC export |
| GSC export | Real αρχείο. Signed-in χρήστης το αποθηκεύει στη βάση (`gsc_rows`) |
| DataForSEO live SERP | Κλήση `serp/google/organic/live/regular` όταν υπάρχουν `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`. Όριο **8 / user / ημέρα** |
| Θέση χωρίς GSC / DataForSEO | Modeled από on-page σήματα. Δεν είναι live Google rank |

### Auth & persistence
- `VITE_AUTH_ENABLED` on
- Routes: `/login`, `/api/auth/*`
- Tables: Better Auth schema + `gsc_rows` + `dataforseo_usage`
- Guest μπορεί να ανοίξει το lab. GSC persist και DataForSEO quota θέλουν session

### Stack
TanStack Start, React, Tailwind v4, Zustand, Recharts, Better Auth (Google + X), Postgres / PGLite.

## Τι λείπει για «αληθινό GSC»
Για properties από την Google χρειάζεται ξεχωριστό OAuth client με Search Console API (`https://www.googleapis.com/auth/webmasters.readonly`). Αυτό δεν το δίνει το Grok Google sign-in.

## Env (server only, όχι στο client)
```
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
DATABASE_URL=          # στο preview πέφτει σε PGLite
```

## Τοπικό τρέξιμο
```
npm install
npm run dev
```
Landing: `/` · Lab: `/app` · Login: `/login`
