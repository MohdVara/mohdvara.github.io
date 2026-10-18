import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
// Optional tooling is installed outside the production dependency graph.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const playwright = require('playwright');
const engine = process.env.QA_BROWSER || 'chromium';
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/pace');
await mkdir(output, { recursive: true });
const browser = await playwright[engine].launch({ ...(engine === 'chromium' ? { channel: 'chrome' } : {}), headless: true });
const results = { layouts: [], routes: [], noJavaScript: [], errors: [], failedLocalResources: [] };
try {
  for (const [width, height] of [[320,568], [375,667], [390,844], [768,1024], [1024,768], [1280,720], [1440,900], [1920,1080]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: engine !== "firefox" && width <= 1024, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) results.failedLocalResources.push(response.url());
    });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    // WebKit on macOS uses Option-Tab to include links with default OS settings.
    await page.keyboard.press(engine === 'webkit' ? 'Alt+Tab' : 'Tab');
    assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'), 'main');
    if (width < 1200) {
      await page.locator('.mobile-menu summary').click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Work', exact: true }).click();
      assert.equal(await page.locator('.mobile-menu').evaluate(el => el.open), false);
      await page.locator('.mobile-menu summary').focus();
      await page.keyboard.press('Enter'); await page.keyboard.press('Escape');
      assert.equal(await page.locator(':focus').textContent().then(text => text.trim()), 'Menu +');
    }
    for (const summary of await page.locator('.case-details summary').all()) {
      await summary.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('.case-details[open]').count(), 1);
    }
    await page.locator('.case-details[open] summary').press('Enter');
    for (const theme of ['light', 'dark']) {
      await page.locator('.display-settings summary').click();
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
      await page.locator('.display-settings summary').press('Escape');
      for (const size of width === 320 ? ['default', 'largest'] : ['default']) {
        await page.locator('.display-settings summary').click();
        await page.getByRole('combobox', { name: 'Text size' }).selectOption(size);
        await page.locator('.display-settings summary').press('Escape');
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}/${theme}/${size} overflow`);
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const entry = { width, height, engine, theme, size, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })), incomplete: audit.incomplete.map(v => v.id) };
        results.layouts.push(entry);
        await page.screenshot({ path: `${output}/home-${width}-${theme}-${size}.png`, fullPage: true });
        assert.deepEqual(entry.violations, [], JSON.stringify(entry));
      }
    }
    await page.locator('.display-settings summary').click();
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption('system');
    await page.locator('.display-settings summary').press('Escape');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.getByRole('link', { name: 'Discuss an engineering opportunity' }).click();
    assert.ok(page.url().endsWith('#contact'));
    assert.ok(await page.locator('#contact').boundingBox().then(box => box.y >= 0));
    await context.close();
  }
  for (const route of ['/', '/work-with-me/', '/no-two-mondays/', '/incident-zero/', '/incident-zero/defence/']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(`${route}: ${error.message}`));
    const response = await page.goto(base + route); assert.equal(response.status(), 200);
    await page.reload(); assert.equal(await page.locator('h1').count(), 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const audit = await new AxeBuilder({ page }).analyze();
    results.routes.push({ route, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact })), incomplete: audit.incomplete.map(v => v.id) });
    assert.deepEqual(audit.violations, [], route);
    if (route === '/no-two-mondays/') {
      await page.goto(base + route + '#ntm-architecture');
      await page.waitForFunction(() => document.querySelector('#ntm-architecture').getBoundingClientRect().top >= 0);
      await page.screenshot({ path: `${output}/ntm-architecture-mobile.png` });
    }
    await context.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await nojs.newPage(); await staticPage.goto(base + route);
    assert.equal(await staticPage.locator('h1').count(), 1);
    if (route === '/') {
      await staticPage.locator('#case-wensymes summary').click();
      assert.equal(await staticPage.locator('#case-wensymes details').evaluate(el => el.open), true);
    }
    results.noJavaScript.push(route); await nojs.close();
  }
  assert.deepEqual(results.errors, []); assert.deepEqual(results.failedLocalResources, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
