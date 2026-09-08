import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("paid trial pricing clearly separates introductory and renewal limits", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", {
      name: "Three days. One dollar. Your next useful move.",
    }),
  ).toBeVisible();
  const offer = page.locator(".trial-banner");
  await expect(offer).toContainText(
    "1 project · 20 crawled pages · 3 drafting actions",
  );
  await expect(offer).toContainText("3 AI answer checks · 3 live SERP lookups");
  await expect(offer).toContainText("automatically renew");
  for (const [plan, amount] of [
    ["Maki", 29],
    ["Nigiri", 79],
    ["Omakase", 149],
  ] as const) {
    const card = page
      .locator(".price-card")
      .filter({ has: page.getByRole("heading", { name: plan, exact: true }) });
    await expect(card).toContainText(
      `$1 for your first 3 days, then $${amount}/month.`,
    );
    await expect(
      card.getByRole("link", { name: `Start $1 trial → ${plan}` }),
    ).toHaveAttribute("href", `/login?plan=${plan.toLowerCase()}`);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `artifacts/qa/trial-pricing-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Start $1 trial → Maki" }).click();
  await expect(page).toHaveURL(/\/login\?plan=maki/);
});
