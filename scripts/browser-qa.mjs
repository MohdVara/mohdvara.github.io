import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Optional tools live outside this project's dependency graph. See README.
const require = createRequire(
  resolve(process.env.QA_MODULES_DIR || ".", "package.json"),
);
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const base = process.env.QA_URL || "http://127.0.0.1:4173";
const output = resolve(process.env.QA_OUTPUT_DIR || ".qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const widths = [320, 375, 430, 768, 1024, 1440, 1920];
const results = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    const errors = [],
      failedResources = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("requestfailed", (request) => failedResources.push(request.url()));
    page.on("response", (response) => {
      if (response.status() >= 400)
        failedResources.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").count(), 1);
    await page.screenshot({ path: `${output}/home-${width}.png` });
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      bad: [...document.querySelectorAll("main *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
        })
        .map((el) => el.className),
    }));
    assert.ok(
      overflow.document <= width + 1,
      `Horizontal overflow at ${width}: ${JSON.stringify(overflow)}`,
    );
    assert.deepEqual(overflow.bad, [], `Clipped content at ${width}`);
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
      "auto",
    );
    const firstLink = page.getByRole("link", {
      name: "Skip to content",
      exact: true,
    });
    await page.keyboard.press("Tab");
    assert.ok(await firstLink.evaluate((el) => el === document.activeElement));
    assert.equal(
      await firstLink.evaluate((el) => getComputedStyle(el).outlineStyle),
      "solid",
    );
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.id), "main");
    if (width <= 760) {
      const menu = page.locator(".mobile-menu summary");
      await menu.focus();
      await page.keyboard.press("Enter");
      assert.ok(await page.locator(".mobile-menu").evaluate((el) => el.open));
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Work", exact: true })
        .click();
      assert.equal(
        await page.locator(".mobile-menu").evaluate((el) => el.open),
        false,
      );
      await menu.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator(".mobile-menu").evaluate((el) => el.open),
        false,
      );
      assert.ok(await menu.evaluate((el) => el === document.activeElement));
    } else {
      await page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Work", exact: true })
        .click();
    }
    assert.ok(page.url().endsWith("#work"));
    const summaries = page.locator(".case-details summary");
    for (let i = 0; i < (await summaries.count()); i++) {
      await summaries.nth(i).focus();
      await page.keyboard.press("Enter");
      assert.ok(await summaries.nth(i).evaluate((el) => el.parentElement.open));
      assert.equal(await page.locator(".case-details[open]").count(), 1);
      assert.equal(await summaries.nth(i).evaluate((el) => getComputedStyle(el).outlineStyle), "solid");
    }
    await page.screenshot({
      path: `${output}/full-${width}.png`,
      fullPage: true,
    });
    await summaries.last().focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".case-details[open]").count(), 0);
    await page.getByRole("button", { name: "Copy email", exact: true }).click();
    await page.getByRole("status").getByText("Copied ✓").waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "mohd@paramasvara.online");
    await page.waitForTimeout(1600);
    assert.equal(await page.getByRole("status").textContent(), "");
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    await writeFile(
      `${output}/axe-${width}.json`,
      JSON.stringify(axe.incomplete, null, 2),
    );
    assert.deepEqual(
      axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `Accessibility violations at ${width}`,
    );
    const theme = page.getByRole("combobox", { name: "Color theme" });
    for (const palette of ["light", "dark"]) {
      await theme.selectOption(palette);
      assert.equal(await page.locator("html").getAttribute("data-theme"), palette);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const themeAxe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      assert.deepEqual(themeAxe.violations.map((v) => ({
        id: v.id, nodes: v.nodes.map((n) => n.target),
      })), [], `${palette} accessibility at ${width}`);
      await page.screenshot({ path: `${output}/${palette}-${width}.png`, fullPage: true });
    }
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await theme.inputValue(), "dark");
    await theme.selectOption("system");
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    // Reload closed native disclosures; no closing actions are needed here.
    for (const id of ["experience", "about", "contact", "home"]) {
      if (width <= 760 && id !== "home") {
        await page.locator(".mobile-menu summary").click();
      }
      await page.locator(`a[href="#${id}"]:visible`).first().click();
      assert.ok(page.url().endsWith(`#${id}`));
    }
    await page.goto(`${base}/#work`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    assert.ok(await page.locator("#work").isVisible());
    assert.ok((await page.locator("#work").boundingBox()).y >= 90);
    const links = await page.locator("a[href]").evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent,
        href: el.getAttribute("href"),
      })),
    );
    assert.ok(
      links.some(
        (link) =>
          link.href ===
          "https://rxresu.me/mwara95/distinguished-acceptable-tern",
      ),
    );
    assert.ok(
      links.some((link) => link.href === "mailto:mohd@paramasvara.online"),
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(failedResources, []);
    const row = {
      width,
      overflow: false,
      axeViolations: axe.violations.length,
      axeIncomplete: axe.incomplete.map((x) => x.id),
      consoleErrors: errors.length,
      failedResources: failedResources.length,
      keyboard: true,
      exclusiveDisclosures: true,
      copyEmail: true,
      navigation: true,
      deepLinkRefresh: true,
    };
    results.push(row);
    console.log(JSON.stringify(row));
    await context.close();
  }
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await noJs.newPage();
  await page.goto(base);
  assert.ok(await page.locator(".hero-role").isVisible());
  await page.locator(".mobile-menu summary").click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await page.locator(".mobile-menu summary").click();
  await page.locator(".case-details summary").first().click();
  assert.ok(
    await page
      .locator(".case-details")
      .first()
      .evaluate((el) => el.open),
  );
  assert.equal(await page.locator("main").count(), 1);
  await page.screenshot({
    path: `${output}/no-javascript.png`,
    fullPage: true,
  });
  await noJs.close();
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify({ results, noJavaScript: true }, null, 2),
  );
  console.log(
    "All responsive, interaction, accessibility, resource and no-JavaScript checks passed.",
  );
} finally {
  await browser.close();
}
