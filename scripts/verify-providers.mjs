import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { parseEnv } from "node:util";
const env = {
  ...(existsSync(".env.local")
    ? parseEnv(readFileSync(".env.local", "utf8"))
    : {}),
  ...process.env,
};
const results = [];
async function check(name, needed, url, headers = {}, validate = () => true) {
  if (needed.some((k) => !env[k])) {
    results.push({ provider: name, state: "unconfigured" });
    return;
  }
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    const valid = r.ok && validate(await r.json().catch(() => null));
    results.push({
      provider: name,
      state: valid ? "read-only connection verified" : "needs attention",
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
await check(
  "Firecrawl account",
  ["FIRECRAWL_API_KEY"],
  "https://api.firecrawl.dev/v2/team/credit-usage",
  { Authorization: `Bearer ${env.FIRECRAWL_API_KEY}` },
  (data) =>
    data?.success === true && Number.isFinite(data?.data?.remainingCredits),
);
await check(
  "DataForSEO account",
  ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"],
  "https://api.dataforseo.com/v3/appendix/user_data",
  {
    Authorization: `Basic ${Buffer.from(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`).toString("base64")}`,
  },
  (data) =>
    data?.status_code === 20000 && data?.tasks?.[0]?.status_code === 20000,
);
// The remaining adapters require a requested real job, account consent or a signed
// webhook fixture. Do not spend provider credits in a configuration health check.
for (const name of [
  "Firecrawl crawl",
  "Google Search Console OAuth/import",
  "OpenAI draft/web answer",
  "Perplexity answer",
  "DataForSEO hosted research jobs",
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
