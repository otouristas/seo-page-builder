# Rankframe

An SEO lab. Paste any public URL, get a weighted on-page audit, and watch a Google-like results page where **plays** (concrete changes) move your modeled position. It is a lab, not a ranking guarantee: positions are modeled and labeled as such; live page-one results come from DataForSEO.

Full notes on what's real, what's modeled, and how it's built: [BUILD.md](./BUILD.md).

```
npm install
cp .env.example .env     # optional: auth, database, DataForSEO
npm run dev              # http://localhost:3000
```

| Route | What |
|---|---|
| `/` | Marketing site: hero, proof, product, live demo, case studies, pricing, FAQ |
| `/app` | The lab. `?url=` runs a page, `?demo=1` loads the modeled demo, `?tab=` and `?kw=` deep-link |
| `/login` | Sign in with Google or X (Better Auth), or continue as a guest |
| `/pricing`, `/case-studies/:slug`, `/privacy`, `/terms` | Supporting pages |

Scripts: `npm run build` (Vite + Nitro to `.output/`), `npm start`, `npm run typecheck`, `npm run screenshots` (Playwright captures of every route).
