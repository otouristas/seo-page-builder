import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("find a sourced method, copy its fix brief, and recover an empty search", async ({
  page,
  context,
}, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/seo-evidence-library");
  await expect(
    page.getByRole("heading", {
      name: "The SEO evidence library",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Search evidence methods").fill("schema");
  await page
    .getByRole("button", { name: "Google guidance", exact: true })
    .click();
  const method = page.locator("#review-subject");
  await method.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(method).toHaveAttribute("open", "");
  await expect(
    method.getByRole("link", { name: /Google: Review snippet/ }),
  ).toHaveAttribute("href", /review-snippet/);
  await method
    .getByRole("button", { name: "Copy fix brief", exact: true })
    .click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("Evidence class: Google guidance");
  expect(clipboard).toContain("itemReviewed");
  expect(clipboard).toContain("Observed evidence: [Add a dated observation]");
  expect(clipboard).not.toContain("docs.google.com");
  await page.getByLabel("Search evidence methods").fill("zzzzdoesnotexist");
  await expect(page.getByText("No matching method yet.")).toBeVisible();
  await page.getByRole("button", { name: "Show all methods" }).click();
  await expect(page.locator(".corpus-method")).toHaveCount(24);
  await page.goto("/learn/seo-evidence-library#original-evidence");
  await expect(page.locator("#original-evidence")).toHaveAttribute("open", "");
  await expect(
    page
      .locator("#original-evidence")
      .getByRole("button", { name: "Copy fix brief", exact: true }),
  ).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page
    .getByRole("heading", { name: "The SEO evidence library", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `artifacts/qa/${info.project.name}-corpus.png`,
    fullPage: true,
  });
});
