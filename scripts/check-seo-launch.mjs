import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { load } from "cheerio";
import robotsParser from "robots-parser";
const config = JSON.parse(
  readFileSync(new URL("../config/ranksushi-seo.json", import.meta.url)),
);
const live = process.argv.includes("--live");
const baseIndex = process.argv.indexOf("--base");
const base = new URL(
  live
    ? config.canonicalOrigin
    : baseIndex >= 0
      ? process.argv[baseIndex + 1]
      : "http://localhost:3100",
);
if (
  !["http:", "https:"].includes(base.protocol) ||
  base.username ||
  base.password
)
  throw new Error("Use a public HTTP(S) origin without credentials.");
const get = async (path) => {
  const r = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(20000),
    redirect: "manual",
  });
  return {
    status: r.status,
    html: await r.text(),
    robots: r.headers.get("x-robots-tag") || "",
  };
};
const outcomes = await Promise.allSettled([
  get("/robots.txt"),
  get("/sitemap.xml"),
]);
const robots = outcomes[0].status === "fulfilled" ? outcomes[0].value : null;
const sitemap = outcomes[1].status === "fulfilled" ? outcomes[1].value : null;
const rules = robotsParser(
  new URL("/robots.txt", base).href,
  robots?.html || "",
);
const urls = new Set(
  sitemap
    ? load(sitemap.html, { xml: true })("loc")
        .map((_, el) => load(el).text())
        .get()
    : [],
);
const checks = [];
for (let i = 0; i < config.targets.length; i += 4) {
  const results = await Promise.allSettled(
    config.targets.slice(i, i + 4).map(async (target) => {
      const r = await get(target.path),
        $ = load(r.html);
      const canonical = `${config.canonicalOrigin}${target.path === "/" ? "" : target.path}`;
      const directives =
        $("meta")
          .toArray()
          .filter((el) =>
            ["robots", "googlebot"].includes(
              ($(el).attr("name") || "").toLowerCase(),
            ),
          )
          .map((el) => $(el).attr("content"))
          .join(",") + r.robots;
      const failures = [];
      if (r.status !== 200) failures.push(`HTTP ${r.status}`);
      if ($("link[rel=canonical]").attr("href") !== canonical)
        failures.push("Canonical differs from the configured intent URL");
      if (
        !$("title").text().trim() ||
        !$("meta[name=description]").attr("content")
      )
        failures.push("Missing title or description");
      if ($("main h1").length !== 1) failures.push("Expected one main heading");
      if (/\b(noindex|none)\b/i.test(directives))
        failures.push("Indexing restriction found");
      if (
        rules.isAllowed(new URL(target.path, base).href, "Googlebot") === false
      )
        failures.push("Robots disallows this target");
      if (!urls.has(canonical)) failures.push("Missing from sitemap");
      let schemaCount = 0;
      $("script[type='application/ld+json']").each((_, el) => {
        try {
          JSON.parse($(el).text());
          schemaCount++;
        } catch {
          failures.push("Invalid JSON-LD");
        }
      });
      return {
        path: target.path,
        title: $("title").text(),
        canonical,
        schemaCount,
        failures,
      };
    }),
  );
  for (let j = 0; j < results.length; j++) {
    const r = results[j];
    checks.push(
      r.status === "fulfilled"
        ? r.value
        : {
            path: config.targets[i + j].path,
            failures: ["Route fetch failed"],
          },
    );
  }
}
const titles = checks.map((c) => c.title).filter(Boolean);
const resourceFailures = [];
if (robots?.status !== 200) resourceFailures.push("robots.txt unavailable");
if (sitemap?.status !== 200 || !urls.size)
  resourceFailures.push("XML sitemap unavailable or empty");
if (new Set(titles).size !== titles.length)
  resourceFailures.push("Duplicate target titles");
const launchBlockers = [];
if (config.launch.domainStatus !== "verified")
  launchBlockers.push(
    "Canonical domain purchase/connection remains pending the owner’s launch decision.",
  );
if (!config.launch.searchConsoleVerified)
  launchBlockers.push(
    "Search Console ownership and baseline are not verified.",
  );
const passed =
  !resourceFailures.length && checks.every((c) => !c.failures.length);
const report = {
  checkedAt: new Date().toISOString(),
  base: base.origin,
  mode: live ? "canonical-origin" : "preview-quality",
  passed,
  launchReady: passed && !launchBlockers.length && live,
  launchBlockers,
  resourceFailures,
  checks,
  note: "These checks inspect implementation. They do not establish indexing, rankings, field performance or provider readiness.",
};
mkdirSync("artifacts/qa", { recursive: true });
writeFileSync(
  `artifacts/qa/seo-${live ? "launch" : "preview"}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (!passed) process.exitCode = 1;
else if (live && launchBlockers.length) process.exitCode = 2;
