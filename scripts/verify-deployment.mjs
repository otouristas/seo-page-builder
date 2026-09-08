import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
const exec = promisify(execFile);
const deployment = process.argv[2];
if (!deployment || !new URL(deployment).hostname.endsWith(".vercel.app"))
  throw new Error("Provide the verified Vercel deployment URL.");
const routes = [
  ["/", 200],
  ["/demo", 200],
  ["/features/website-audits", 200],
  ["/tools/metadata-preview", 200],
  ["/api/health", 200],
  ["/api/projects", 401],
  ["/app", 307],
  ["/sitemap.xml", 200],
];
const checks = [];
for (let start = 0; start < routes.length; start += 4) {
  const results = await Promise.allSettled(
    routes.slice(start, start + 4).map(async ([path, expected]) => {
      const { stdout } = await exec(
        "npx",
        [
          "--yes",
          "vercel@59.11.7",
          "curl",
          path,
          "--deployment",
          deployment,
          "--scope",
          "otouristas-projects",
          "--",
          "-sS",
          "-w",
          "\n%{http_code}",
        ],
        { maxBuffer: 3000000 },
      );
      const last = stdout.lastIndexOf("\n");
      const status = Number(stdout.slice(last + 1).trim());
      const body = stdout.slice(0, last);
      const html = load(body);
      const result = { path, status, expected, passed: status === expected };
      if (
        path === "/" ||
        path.startsWith("/features/") ||
        path.startsWith("/tools/")
      ) {
        result.title = html("title").text();
        result.canonical = html("link[rel=canonical]").attr("href");
        result.heading = html("main h1").text().replace(/\s+/g, " ").trim();
        result.passed =
          result.passed &&
          !!result.title &&
          result.canonical ===
            `https://ranksushi.com${path === "/" ? "" : path}` &&
          !!result.heading;
      }
      if (path === "/api/health")
        result.passed =
          result.passed && JSON.parse(body).service === "RankSushi";
      return result;
    }),
  );
  for (const result of results)
    checks.push(
      result.status === "fulfilled"
        ? result.value
        : {
            passed: false,
            error: "Deployment request could not be completed.",
          },
    );
}
mkdirSync("artifacts/qa", { recursive: true });
writeFileSync(
  "artifacts/qa/deployed-routes.json",
  JSON.stringify(
    { deployment, checkedAt: new Date().toISOString(), checks },
    null,
    2,
  ),
);
console.log(JSON.stringify(checks, null, 2));
if (checks.some((c) => !c.passed)) process.exitCode = 1;
