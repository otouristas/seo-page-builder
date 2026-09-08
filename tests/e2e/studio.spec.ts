import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("the default studio ties real results to an editable visual change", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: /See the search/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Search keyword", { exact: true })).toHaveValue(
    "seo software",
  );
  await expect(
    page.getByLabel("Search keyword", { exact: true }),
  ).toHaveAttribute("readonly", "");
  const positions = await page.locator(".serp-position").allTextContents();
  const oldTitle = await page.getByTestId("studio-preview-title").innerText();
  await page
    .getByRole("button", { name: "Try this wording", exact: true })
    .click();
  await expect(page.getByTestId("studio-preview-title")).toContainText(
    "SEO software | RankSushi",
  );
  expect(await page.locator(".serp-position").allTextContents()).toEqual(
    positions,
  );
  await expect(
    page.getByText("1 draft field changed. Your website is unchanged."),
  ).toBeVisible();
  await page
    .getByLabel("Search title", { exact: true })
    .fill("A clearer, reviewed SEO title");
  await expect(page.getByTestId("studio-preview-title")).toHaveText(
    "A clearer, reviewed SEO title",
  );
  await page.getByRole("button", { name: "Current page", exact: true }).click();
  await expect(page.getByTestId("studio-preview-title")).toHaveText(oldTitle);
  await page.getByRole("button", { name: /My draft/ }).click();
  await page.getByRole("button", { name: "Preview at phone width" }).click();
  await expect(page.locator(".your-page-preview")).toHaveClass(/phone-preview/);
  const saved = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export this change", exact: true })
    .click();
  expect((await saved).suggestedFilename()).toBe("ranksushi-serp-change.md");
  await page.getByRole("button", { name: "Reset draft", exact: true }).click();
  await expect(page.getByTestId("studio-preview-title")).toHaveText(oldTitle);
  await expect(
    page.getByRole("button", { name: "Export this change", exact: true }),
  ).toBeDisabled();
  const rows = page.getByRole("button", { name: /Inspect result/ });
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".peer-evidence h2")).toHaveText(
    await rows
      .nth(1)
      .locator(".serp-result-domain")
      .innerText()
      .then((s) => s.split("\n").filter((v) => v.length > 1)[0]),
  );
  await page
    .getByRole("button", {
      name: "What is the best SEO software?",
      exact: true,
    })
    .click();
  await expect(page.locator(".studio-selected-question strong")).toHaveText(
    "What is the best SEO software?",
  );
  await expect(page.getByLabel("Answer draft", { exact: true })).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
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
  await page.screenshot({
    path: `artifacts/qa/${info.project.name}-serp-studio.png`,
    fullPage: true,
  });
});
test("snapshot history preserves its actual time and landing teaser responds", async ({
  page,
}) => {
  await page.goto("/demo");
  const history = page.locator(".studio-history button");
  const current = await page.locator(".serp-engine-bar").innerText();
  await history.nth(1).click();
  expect(await page.locator(".serp-engine-bar").innerText()).not.toBe(current);
  await expect(history.nth(1)).toHaveAttribute("aria-pressed", "true");
  await page.goto("/");
  const title = page.locator(".teaser-your-page h3");
  const original = await title.innerText();
  await page.getByRole("button", { name: /Try a clearer page title/ }).click();
  await expect(title).toHaveText("SEO software | RankSushi");
  await page.getByRole("button", { name: /A clearer title/ }).click();
  await expect(title).toHaveText(original);
  await page
    .getByRole("link", { name: "Open the studio", exact: false })
    .click();
  await expect(page).toHaveURL(/\/demo$/);
});
