import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
const exec = promisify(execFile);
const deployment = process.argv[2];
const outputPath = process.argv[3] || "artifacts/qa/deployed-routes.json";
if (!deployment || !new URL(deployment).hostname.endsWith(".vercel.app"))
  throw new Error("Provide the verified Vercel deployment URL.");
const requestedPaths = new Set(process.argv.slice(4));
const routes = [
  ["/", 200],
  ["/demo", 200],
  ["/features/website-audits", 200],
  ["/tools/metadata-preview", 200],
  ["/learn", 200],
  ["/learn/seo-evidence-library", 200],
  ["/learn/seo-evidence-library/index.md", 200],
  ["/learn/original-evidence-content", 200],
  ["/learn/answer-ready-content", 200],
  ["/learn/answer-ready-content/index.md", 200],
  ["/learn/answer-ready-content/checklist.md", 200],
  ["/blog", 200],
  ["/blog/llms-txt-without-the-myths", 200],
  ["/help", 200],
  ["/help/dataforseo-research", 200],
  ["/help/fix-prompts", 200],
  ["/help/serp-studio", 200],
  ["/llms.txt", 200],
  ["/feed.xml", 200],
  ["/sitemap", 200],
  ["/api/health", 200],
  ["/api/projects", 401],
  ["/app", 307],
  ["/sitemap.xml", 200],
].filter(([path]) => !requestedPaths.size || requestedPaths.has(path));
if (!routes.length)
  throw new Error("No configured routes matched the requested checks.");
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
        path.startsWith("/tools/") ||
        (/^\/(learn|blog|help|sitemap)(\/|$)/.test(path) &&
          !path.endsWith(".md"))
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
      if (path === "/help" || path === "/help/fix-prompts") {
        result.docsLayout =
          html(".docs-sidebar").length === 1 &&
          html(".docs-right").length === 1;
        result.passed = result.passed && result.docsLayout;
        if (path === "/help/fix-prompts")
          result.passed = result.passed && html(".copy-actions").length >= 2;
      }
      if (path === "/demo") {
        result.heading = html("main h1").text().replace(/\s+/g, " ").trim();
        result.positions = html(".serp-position")
          .map((_, el) => html(el).text())
          .get();
        result.recorded = body.includes("Recorded real results");
        result.passed =
          result.passed &&
          result.heading.includes("See the search") &&
          result.positions.length > 0 &&
          result.recorded &&
          html("[data-testid=studio-preview-title]").length === 1;
      }
      if (path === "/")
        result.passed = result.passed && html(".serp-teaser").length === 1;
      if (path === "/api/health")
        result.passed =
          result.passed && JSON.parse(body).service === "RankSushi";
      if (path === "/llms.txt")
        result.passed =
          result.passed &&
          body.startsWith("# RankSushi") &&
          body.includes("/learn/answer-ready-content/index.md");
      if (path.endsWith(".md"))
        result.passed =
          result.passed &&
          body.startsWith("# ") &&
          body.includes(
            `Source: https://ranksushi.com${path.replace(/\/(index|checklist)\.md$/, "")}`,
          ) &&
          body.includes("## Takeaway checklist");
      if (path === "/learn/seo-evidence-library/index.md")
        result.passed =
          result.passed &&
          body.includes("## Make the reviewed subject unambiguous") &&
          body.includes("Google guidance") &&
          !body.includes("docs.google.com");
      if (path === "/feed.xml")
        result.passed =
          result.passed && load(body, { xml: true })("item").length === 3;
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
  outputPath,
  JSON.stringify(
    { deployment, checkedAt: new Date().toISOString(), checks },
    null,
    2,
  ),
);
console.log(JSON.stringify(checks, null, 2));
if (checks.some((c) => !c.passed)) process.exitCode = 1;
