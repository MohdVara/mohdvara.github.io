import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const engines = require('playwright');
const engine = process.env.QA_BROWSER || 'chromium';
const output = resolve(process.env.QA_OUTPUT_DIR || `output/playwright/pace-v1.1/consent-${engine}`);
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
await mkdir(output, { recursive: true });
const browser = await engines[engine].launch(engine === 'chromium' ? { channel: 'chrome' } : {});
const results = { engine, layouts: [], errors: [], sdkRequests: [], crossTabWithdrawal: false };
try {
  for (const [width, height] of [[320,568],[1440,900]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(error.message));
    page.on('request', request => { if (/posthog|\/assets\/module-/.test(request.url())) results.sdkRequests.push(request.url()); });
    await page.goto(base);
    await page.locator('.display-settings summary').click();
    const checkbox = page.getByRole('checkbox', { name: 'Usage analytics', exact: true });
    assert.equal(await checkbox.isChecked(), false);
    assert.match(await page.locator('#analytics-notice').innerText(), /Off until you enable/);
    await checkbox.focus(); await page.keyboard.press('Space');
    assert.equal(await checkbox.isChecked(), true);
    await page.reload(); await page.locator('.display-settings summary').click();
    assert.equal(await checkbox.isChecked(), true);
    const second = await context.newPage(); await second.goto(base);
    await second.locator('.display-settings summary').click();
    const secondCheckbox = second.getByRole('checkbox', { name: 'Usage analytics', exact: true });
    assert.equal(await secondCheckbox.isChecked(), true);
    await secondCheckbox.uncheck();
    await page.waitForFunction(() => document.querySelector('.analytics-control input').checked === false);
    results.crossTabWithdrawal = true; await second.close();
    for (const theme of ['light','dark']) {
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
      await page.getByRole('combobox', { name: 'Text size' }).selectOption('largest');
      await checkbox.scrollIntoViewIfNeeded();
      const panel = await page.locator('.display-panel').boundingBox();
      assert.ok(panel.x >= 0 && panel.x + panel.width <= width + 1);
      assert.ok(panel.y >= 0 && panel.y + panel.height <= height + 1);
      assert.ok(await checkbox.isVisible());
      if (width === 320) {
        const edges = await page.evaluate(() => ['.monogram', '.display-settings', '.mobile-menu'].map(selector => {
          const box = document.querySelector(selector).getBoundingClientRect(); return { left: box.left, right: box.right };
        }));
        assert.ok(edges[0].right < edges[1].left && edges[1].right < edges[2].left, 'Largest header controls overlap');
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: `${output}/display-${width}-${theme}.png` });
      results.layouts.push({ width, height, theme, largest: true, preferenceOff: !(await checkbox.isChecked()), panelFits: true });
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.display-settings').evaluate(el => el.open), false);
    await context.close();
  }
  assert.deepEqual(results.errors, []); assert.deepEqual(results.sdkRequests, []);
} finally { await writeFile(`${output}/results.json`, JSON.stringify(results,null,2)); await browser.close(); }
console.log(JSON.stringify(results,null,2));
