import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/baa-source-texture');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { layouts: [], errors: [] };
try {
  for (const route of (process.env.QA_ROUTES?.split(',') || ['', 'work-with-me', 'no-two-mondays', 'pace-rag-case-study', 'incident-zero'])) {
    for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), theme);
      const page = await context.newPage();
      page.on('pageerror', e => results.errors.push({ route, message: e.message }));
      await page.goto(`${process.env.QA_URL || 'http://127.0.0.1:4174'}/${route}${route ? '/' : ''}`);
      await page.locator('.ascii-forest').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      for (const kind of ['forest', 'river']) {
        const host = page.locator(`.ascii-${kind}`);
        await host.scrollIntoViewIfNeeded();
        await page.locator(`.ascii-${kind}[data-ready="true"]`).waitFor();
        assert.equal(await host.getAttribute('data-running'), 'false');
        assert.equal(await host.getAttribute('aria-hidden'), 'true');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const pixels = await host.locator('canvas').evaluate(c => c.toDataURL());
        await page.waitForTimeout(100);
        assert.equal(await host.locator('canvas').evaluate(c => c.toDataURL()), pixels);
        await host.screenshot({ path: `${output}/${route || 'home'}-${width}-${theme}-${kind}.png` });
      }
      results.layouts.push({ route: route || 'home', width, theme });
      console.log(`PASS ${route || 'home'} ${width} ${theme}`);
      await context.close();
    }
  }
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
