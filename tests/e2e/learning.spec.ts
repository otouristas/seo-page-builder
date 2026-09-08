import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { load } from "cheerio";
test("pill navigation and full-screen mobile menu preserve access and focus", async ({
  page,
}, info) => {
  await page.goto("/");
  if (info.project.name === "desktop") {
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "SEO kitchen" }),
    ).toBeVisible();
    expect(
      await page
        .locator(".pill-header")
        .evaluate((e) => Number.parseFloat(getComputedStyle(e).borderRadius)),
    ).toBeGreaterThan(30);
    return;
  }
  const opener = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "GOOD THINGS ON THE MENU" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBe(0);
  expect(box!.y).toBe(0);
  expect(box!.width).toBe(viewport.width);
  expect(box!.height).toBe(viewport.height);
  await expect(
    dialog.getByText("No card required", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(
    "hidden",
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: "artifacts/qa/mobile-fullscreen-menu.png" });
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
  await opener.click();
  await dialog.getByRole("link", { name: /Help center/ }).click();
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("learning search, topic filters, and recovery work accessibly", async ({
  page,
}, info) => {
  await page.goto("/learn");
  await page
    .getByLabel("Search guides, questions, or topics")
    .fill("canonical");
  await expect(page.locator(".learning-card")).toHaveCount(1);
  await expect(page.locator(".learning-card")).toContainText("Triage an audit");
  await page.getByLabel("Clear search").click();
  await page.getByRole("button", { name: "AEO & GEO", exact: true }).click();
  await expect(page.locator(".learning-card")).toHaveCount(1);
  await page
    .getByLabel("Search guides, questions, or topics")
    .fill("zzzz-no-match");
  await expect(page.getByText("Nothing on this plate yet.")).toBeVisible();
  await page.getByRole("button", { name: "Show every read" }).click();
  await expect(page.locator(".learning-card")).toHaveCount(8);
  for (const path of [
    "/learn",
    "/help",
    "/blog",
    "/learn/answer-ready-content",
    "/demo/search-console",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      path,
    ).toBe(true);
  }
  await page.goto("/learn");
  await page.screenshot({
    path: `artifacts/qa/${info.project.name}-learning.png`,
    fullPage: true,
  });
});
test("every public sitemap URL and Markdown export is complete and canonical", async ({
  request,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Static resource coverage is viewport-independent.",
  );
  test.setTimeout(180000);
  const sitemap = await request.get("/sitemap.xml");
  const xml = load(await sitemap.text(), { xml: true });
  const urls = xml("loc")
    .map((_, el) => xml(el).text())
    .get();
  expect(new Set(urls).size).toBe(urls.length);
  const titles = new Set();
  for (const url of urls) {
    const path = new URL(url).pathname;
    const r = await request.get(path);
    expect(r.status(), path).toBe(200);
    const html = load(await r.text());
    expect(html("main h1").length, path).toBe(1);
    expect(html("link[rel=canonical]").attr("href"), path).toBe(url);
    const title = html("title").text();
    expect(titles.has(title), path).toBe(false);
    titles.add(title);
    if (/^\/(learn|blog|help)\/.+/.test(path)) {
      const md = await request.get(path + "/index.md");
      expect(md.status()).toBe(200);
      expect(md.headers()["content-type"]).toContain("text/markdown");
      expect(await md.text()).toContain(html("main h1").text());
      const json = html('script[type="application/ld+json"]')
        .map((_, el) => JSON.parse(html(el).text()))
        .get();
      expect(
        json.some((v) =>
          v["@graph"]?.some((x: { "@type": string }) =>
            ["TechArticle", "BlogPosting"].includes(x["@type"]),
          ),
        ),
        path,
      ).toBe(true);
    }
  }
  const index = await (await request.get("/llms.txt")).text();
  const links = [
    ...index.matchAll(/\]\((https:\/\/ranksushi\.com[^)]*\/index\.md)\)/g),
  ];
  expect(links.length).toBe(21);
  for (const [, url] of links) {
    expect((await request.get(new URL(url).pathname)).status()).toBe(200);
  }
  expect((await request.get("/feed.xml")).headers()["content-type"]).toContain(
    "application/rss+xml",
  );
});
test("research demo changes mode without making a paid provider call", async ({
  page,
}) => {
  await page.goto("/demo/search-console");
  await page.getByRole("button", { name: /Keyword demand/ }).click();
  await expect(page.getByLabel("Keyword phrase")).toHaveAttribute(
    "maxlength",
    "80",
  );
  await page.getByLabel("Keyword phrase").fill("olive oil");
  await page.getByRole("button", { name: "Run research · 1 lookup" }).click();
  await expect(
    page.getByText("Research examples do not call DataForSEO.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Real research starts with your website."),
  ).toBeVisible();
});
