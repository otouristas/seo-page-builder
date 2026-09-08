import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("the handbook supports task navigation, keyboard search and mobile topics", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/help");
  await expect(
    page.getByRole("heading", { name: "Let’s get you unstuck." }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Browse the docs" }).click();
    await expect(
      page.getByRole("navigation", { name: "Documentation topics" }),
    ).toBeVisible();
  }
  await page
    .getByRole("navigation", { name: "Documentation topics" })
    .getByRole("link", { name: "Copy a prompt. Make a useful fix." })
    .click();
  await expect(page).toHaveURL(/\/help\/fix-prompts$/);
  if (info.project.name === "mobile")
    await expect(
      page.getByRole("button", { name: "Browse the docs" }),
    ).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search documentation" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Search documentation").fill("canonical");
  await expect(
    dialog.getByRole("link", { name: /Triage an audit/ }),
  ).toBeVisible();
  await dialog.getByLabel("Search documentation").fill("zznoresultzz");
  await expect(
    dialog.getByText("No answer for that phrase yet."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Show all answers" }).click();
  await expect(dialog.getByRole("link")).toHaveCount(16);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
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
  await page.screenshot({
    path: `artifacts/qa/${info.project.name}-handbook.png`,
    fullPage: true,
  });
});
test("copy page, personal prompt and checklist preserve the selected guide", async ({
  page,
  context,
}, info) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/help/fix-prompts");
  await page.getByRole("button", { name: "Copy page", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "# Copy a prompt. Make a useful fix.",
  );
  const companion = page.locator(".docs-playbook");
  await companion
    .getByRole("button", { name: "Checklist", exact: true })
    .click();
  await companion.getByRole("checkbox").first().check();
  await expect(companion.getByText("1 of 5 checked")).toBeVisible();
  await companion.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(companion.getByRole("checkbox").first()).not.toBeChecked();
  await companion
    .getByRole("button", { name: "AI prompt", exact: true })
    .click();
  await companion
    .getByLabel("Make it about your page")
    .fill("https://example.com/services?token=private-token");
  await companion.getByLabel("What needs a look?").selectOption("canonical");
  await companion
    .getByRole("button", { name: "Copy prompt", exact: true })
    .click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("canonical");
  expect(text).toContain("The result is unknown");
  expect(text).not.toContain("private-token");
  await companion.getByRole("button", { name: "More copy options" }).click();
  await expect(
    companion.getByRole("link", { name: "Copy & open ChatGPT" }),
  ).toHaveAttribute("href", "https://chatgpt.com/");
  await expect(
    companion.getByRole("link", { name: "Copy & open Claude" }),
  ).toHaveAttribute("href", "https://claude.ai/new");
  await context.route("https://chatgpt.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>Assistant navigation test fixture</title>",
    }),
  );
  const opened = page.waitForEvent("popup");
  await companion.getByRole("link", { name: "Copy & open ChatGPT" }).click();
  const assistant = await opened;
  await assistant.waitForLoadState();
  expect(assistant.url()).toBe("https://chatgpt.com/");
  await assistant.close();
  await page.bringToFront();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "canonical",
  );
  await companion.getByRole("button", { name: "More copy options" }).click();
  await page.keyboard.press("Escape");
  await expect(
    companion.getByRole("button", { name: "More copy options" }),
  ).toBeFocused();
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.screenshot({
    path: `artifacts/qa/${info.project.name}-handbook-prompt.png`,
    fullPage: info.project.name === "desktop",
  });
});
test("finding instructions and page plans include the exact sample evidence", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/demo/audits");
  const finding = page.locator(".finding-item").filter({
    has: page.getByRole("heading", { name: /A useful search description/ }),
  });
  await finding.locator(".fix-kit > summary").click();
  await expect(
    finding.getByText("Where to look", { exact: true }),
  ).toBeVisible();
  await finding
    .getByRole("button", { name: "AI assistant", exact: true })
    .click();
  await finding
    .getByRole("button", { name: "Copy fix prompt", exact: true })
    .click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("oliveandearth.example/collections/olive-oil");
  expect(text).toContain('"status": "sample"');
  expect(text).toContain("No meta description was found");
  expect(text).toContain("2026-09-01T10:00:00.000Z");
  await finding.getByRole("button", { name: "Developer", exact: true }).click();
  await expect(finding.getByLabel("Fix prompt preview")).toHaveValue(
    /rollback/,
  );
  await page
    .getByRole("button", { name: "Copy page fix plan", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "# RankSushi page fix plan",
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
test("studio prompts follow edits and blocked clipboard has a usable fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new DOMException("Blocked", "NotAllowedError");
        },
      },
      configurable: true,
    });
  });
  await page.goto("/demo");
  await page
    .getByLabel("Search title", { exact: true })
    .fill("My reviewed page title");
  const kit = page.locator(".studio-editor .fix-kit");
  await kit.locator("summary").click();
  await kit.getByRole("button", { name: "AI assistant", exact: true }).click();
  await kit
    .getByRole("button", { name: "Copy fix prompt", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Your text is ready" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Text to copy manually")).toHaveValue(
    /My reviewed page title/,
  );
  await dialog.getByRole("button", { name: "Select all text" }).click();
  expect(
    await dialog
      .getByLabel("Text to copy manually")
      .evaluate(
        (el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart,
      ),
  ).toBeGreaterThan(200);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await kit.getByRole("button", { name: "More copy options" }).click();
  const save = page.waitForEvent("download");
  await kit.getByRole("button", { name: "Download Markdown" }).click();
  expect((await save).suggestedFilename()).toBe("ranksushi-title-fix.md");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
