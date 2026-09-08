import { readFileSync, existsSync } from "node:fs";
import { parseEnv } from "node:util";
const env = {
  ...(existsSync(".env.local")
    ? parseEnv(readFileSync(".env.local", "utf8"))
    : {}),
  ...process.env,
};
const groups = {
  database: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "TOKEN_ENCRYPTION_KEY",
    "RATE_LIMIT_SALT",
  ],
  jobs: ["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"],
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  audits: ["FIRECRAWL_API_KEY", "FIRECRAWL_WEBHOOK_SECRET"],
  ai: ["OPENAI_API_KEY", "PERPLEXITY_API_KEY"],
  serp: ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"],
  performance: ["PAGESPEED_API_KEY"],
  billing: [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_TRIAL",
    "STRIPE_PRICE_MAKI",
    "STRIPE_PRICE_NIGIRI",
    "STRIPE_PRICE_OMAKASE",
    "STRIPE_PORTAL_CONFIGURATION",
  ],
  email: ["RESEND_API_KEY", "RESEND_FROM", "RESEND_WEBHOOK_SECRET"],
  monitoring: ["SENTRY_DSN"],
};
let missing = 0;
for (const [group, keys] of Object.entries(groups)) {
  const absent = keys.filter((k) => !env[k]);
  missing += absent.length;
  console.log(
    `${absent.length ? "MISSING" : "CONFIGURED"} ${group}${absent.length ? `: ${absent.join(", ")}` : ""}`,
  );
}
if (
  env.TOKEN_ENCRYPTION_KEY &&
  Buffer.from(env.TOKEN_ENCRYPTION_KEY, "base64").length !== 32
) {
  console.log("INVALID TOKEN_ENCRYPTION_KEY: expected 32 base64-decoded bytes");
  missing++;
}
console.log(
  "Configuration presence is not a successful live provider validation.",
);
console.log(
  `Live billing gates: ${["BILLING_LIVE_ENABLED", "BILLING_COSTS_APPROVED", "BILLING_MERCHANT_READY"].every((k) => env[k] === "true") ? "enabled" : "disabled"}`,
);
process.exitCode = missing ? 1 : 0;
