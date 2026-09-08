import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
// Capture CLI credentials in process memory; never echo them or write tracked files.
const data = JSON.parse(
  execFileSync("npx", ["supabase", "status", "-o", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);
const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
  NEXT_PUBLIC_SUPABASE_URL: data.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: data.PUBLISHABLE_KEY || data.ANON_KEY,
  SUPABASE_SECRET_KEY: data.SECRET_KEY || data.SERVICE_ROLE_KEY,
  TOKEN_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  RATE_LIMIT_SALT: randomBytes(32).toString("base64"),
  INNGEST_DEV: "1",
};
console.log("Starting RankSushi against isolated local Supabase on port 3100.");
const child = spawn("npx", ["next", "dev", "--port", "3100"], {
  env,
  stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
