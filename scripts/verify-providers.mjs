import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { parseEnv } from "node:util";
const env = {
  ...(existsSync(".env.local")
    ? parseEnv(readFileSync(".env.local", "utf8"))
    : {}),
  ...process.env,
};
const results = [];
async function check(name, needed, url, headers = {}) {
  if (needed.some((k) => !env[k])) {
    results.push({ provider: name, state: "unconfigured" });
    return;
  }
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    results.push({
      provider: name,
      state: r.ok ? "read-only connection verified" : "needs attention",
      http: r.status,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    results.push({ provider: name, state: "unreachable" });
  }
}
await check(
  "Supabase schema",
  ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"],
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?select=id&limit=0`,
  {
    apikey: env.SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
  },
);
await check(
  "OpenAI model access",
  ["OPENAI_API_KEY"],
  `https://api.openai.com/v1/models/${env.OPENAI_MODEL || "gpt-5.4-mini"}`,
  { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
);
await check(
  "Stripe account",
  ["STRIPE_SECRET_KEY"],
  "https://api.stripe.com/v1/account",
  { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
);
await check(
  "Resend domains",
  ["RESEND_API_KEY"],
  "https://api.resend.com/domains",
  { Authorization: `Bearer ${env.RESEND_API_KEY}` },
);
// The remaining adapters require a requested real job, account consent or a signed
// webhook fixture. Do not spend provider credits in a configuration health check.
for (const name of [
  "Firecrawl crawl",
  "Google Search Console OAuth/import",
  "OpenAI draft/web answer",
  "Perplexity answer",
  "DataForSEO SERP",
  "PageSpeed",
  "Inngest durable execution",
  "Stripe lifecycle",
  "Resend delivery",
])
  results.push({ provider: name, state: "live workflow validation required" });
mkdirSync("artifacts", { recursive: true });
writeFileSync(
  "artifacts/provider-validation.json",
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.some(
  (r) => r.state !== "read-only connection verified",
)
  ? 1
  : 0;
