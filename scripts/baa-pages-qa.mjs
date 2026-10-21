import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/baa-pages');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { layouts: [], errors: [], lifecycle: [] };
const base = process.env.QA_URL || 'http://127.0.0.1:4174';
try {
  for (const route of ['work-with-me', 'no-two-mondays', 'pace-rag-case-study', 'incident-zero']) {
    for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => { localStorage.setItem('portfolio-theme', theme); }, theme);
      const page = await context.newPage();
      page.on('pageerror', error => results.errors.push({ route, error: error.message }));
      await page.goto(`${base}/${route}/`);
      await page.locator('.page-landscape').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      const landscapes = page.locator('.page-landscape');
      assert.equal(await landscapes.count(), 2);
      const data = [];
      for (const [index, kind] of ['forest', 'river'].entries()) {
        const landscape = landscapes.nth(index);
        await landscape.scrollIntoViewIfNeeded();
        await landscape.locator('[data-ready="true"]').waitFor();
        assert.equal(await landscape.locator('[aria-hidden="true"]').first().getAttribute('aria-hidden'), 'true');
        assert.equal(await landscape.locator('[data-running]').getAttribute('data-running'), 'false');
        if (kind === 'river') assert.equal(Number(await landscape.locator('[data-branch-progress]').getAttribute('data-branch-progress')), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const axe = await new AxeBuilder({ page }).include(`.page-landscape-${kind}`).analyze();
        assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
        await landscape.screenshot({ path: `${output}/${route}-${width}-${theme}-${kind}.png` });
        data.push({ kind, signature: await landscape.locator('[data-signature]').getAttribute('data-signature'), incomplete: axe.incomplete.map(v => v.id) });
      }
      results.layouts.push({ route, width, theme, data });
      await context.close();
      console.log(`PASS ${route} ${width} ${theme}`);
    }
  }
  for (const kind of ['forest', 'river']) {
    assert.equal(new Set(results.layouts.filter(x => x.width === 1440 && x.theme === 'light').map(x => x.data.find(d => d.kind === kind).signature)).size, 4);
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${base}/work-with-me/`);
  const forest = page.locator('.ascii-forest');
  await forest.locator('canvas').waitFor();
  await page.waitForFunction(() => document.querySelector('.ascii-forest')?.dataset.running === 'true');
  await page.locator('.display-settings summary').click();
  await page.getByLabel('Animated scenery').selectOption('paused');
  await page.waitForFunction(() => document.querySelector('.ascii-forest')?.dataset.running === 'false');
  await page.locator('.ascii-river').scrollIntoViewIfNeeded();
  await page.locator('.ascii-river[data-ready="true"]').waitFor();
  const pixels = await page.locator('.ascii-river canvas').evaluate(c => c.toDataURL());
  await page.waitForTimeout(200);
  assert.equal(await page.locator('.ascii-river canvas').evaluate(c => c.toDataURL()), pixels);
  results.lifecycle.push('Shared pause freezes both new scenes; reduced motion and complete static tributaries checked on every page.');
  await context.close();
  for (const route of ['work-with-me', 'no-two-mondays', 'pace-rag-case-study', 'incident-zero']) {
    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(`${base}/${route}/`);
    assert.equal(await staticPage.locator('main h1').count(), 1);
    assert.ok(await staticPage.locator('main a[href]').count() > 0);
    assert.equal(await staticPage.locator('.page-landscape canvas').count(), 0);
    await staticContext.close();
    for (const theme of ['light', 'dark']) {
      const largeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const largePage = await largeContext.newPage();
      largePage.on('pageerror', error => results.errors.push({ route, error: error.message }));
      await largePage.goto(`${base}/${route}/`);
      await largePage.locator('.page-landscape').first().waitFor();
      await largePage.evaluate(theme => {
        window.dispatchEvent(new CustomEvent('theme-preference', { detail: theme }));
        window.dispatchEvent(new CustomEvent('text-size-preference', { detail: 'largest' }));
      }, theme);
      assert.equal(await largePage.locator('html').getAttribute('data-text-size'), 'largest');
      for (const kind of ['forest', 'river']) {
        const landscape = largePage.locator(`.page-landscape-${kind}`);
        await landscape.scrollIntoViewIfNeeded();
        await landscape.locator('[data-ready="true"]').waitFor();
        assert.ok(await largePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await landscape.screenshot({ path: `${output}/${route}-390-${theme}-largest-${kind}.png` });
      }
      await largeContext.close();
    }
    results.lifecycle.push(`${route}: no-JavaScript content/links and mobile Largest in both themes passed`);
  }
  const gameContext = await browser.newContext();
  const gamePage = await gameContext.newPage();
  await gamePage.goto(`${base}/incident-zero/`);
  await gamePage.getByRole('button', { name: 'Preview the engineering decisions' }).click();
  await gamePage.waitForFunction(() => document.querySelectorAll('.page-landscape').length === 0);
  results.lifecycle.push('Incident scenery unmounts when entering the interactive experience.');
  await gameContext.close();
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
