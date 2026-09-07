// Capture every route at desktop and mobile widths. Usage:
//   BASE_URL=http://localhost:3000 OUT_DIR=screenshots node scripts/screenshots.mjs
import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = process.env.OUT_DIR ?? "screenshots";
const routes = (process.env.ROUTES ?? "/,/pricing,/case-studies/stripe-payments,/login,/privacy,/app,/app?demo=true&tab=serp").split(",").filter(Boolean);
const widths = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
const fullPage = process.env.FULL_PAGE !== "false";
const selectors = (process.env.SELECTORS ?? "").split(",").filter(Boolean);

async function findChromium() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  try {
    const dirs = (await readdir(root)).filter((d) => d.startsWith("chromium-"));
    for (const d of dirs) {
      for (const candidate of ["chrome-linux/chrome", "chrome-linux64/chrome"]) {
        try {
          await readdir(path.join(root, d, path.dirname(candidate)));
          return path.join(root, d, candidate);
        } catch {}
      }
    }
  } catch {}
  return undefined;
}

await mkdir(out, { recursive: true });
let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  const exe = await findChromium();
  if (!exe) throw err;
  browser = await chromium.launch({ executablePath: exe });
}

const problems = [];
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    const url = base + route;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(900);
      const slug = route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_") || "home";
      const file = path.join(out, `${slug}-${width}.png`);
      await page.screenshot({ path: file, fullPage });
      console.log(`✓ ${route} @${width} → ${file}${errors.length ? `  (${errors.length} errors)` : ""}`);
      for (const sel of selectors) {
        const el = page.locator(sel).first();
        if ((await el.count()) === 0) continue;
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const f = path.join(out, `${slug}-${sel.replace(/[^a-z0-9]+/gi, "_")}-${width}.png`);
        await el.screenshot({ path: f });
        console.log(`  ↳ ${sel} → ${f}`);
      }
    } catch (err) {
      console.log(`✗ ${route} @${width}: ${err.message}`);
      problems.push(`${route}@${width}: ${err.message}`);
    }
    for (const e of errors) problems.push(`${route}@${width}: ${e}`);
    await page.close();
  }
  await context.close();
}
await browser.close();
if (problems.length) {
  console.log("\nProblems:");
  for (const p of problems) console.log(" - " + p);
  process.exitCode = 1;
}
