import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium} = require('playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:4178';
const output = 'output/playwright/pme-type-1.6/loading';
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
// Intentionally capture the real fallback while the display request is held.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const report = {scenarios: [], errors: []};
try {
  for (const failure of [false, true]) {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    let release;
    const gate = new Promise(r => {release = r;});
    await page.route('**/fonts/editorial/*.woff2', async route => {await gate; if (failure) await route.abort(); else await route.continue();});
    await page.goto(base + '/en/', {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.dataset.localeReady === 'en' && !document.querySelector('#portfolio-loader'));
    await page.locator('.ascii-forest[data-ready="true"]').waitFor();
    const state = () => page.locator('.hero-environment > .ascii-forest').evaluate(el => ({signature: el.dataset.signature, geometryBuilds: el.dataset.geometryBuilds, revision: el.dataset.textureRevision, runs: el.dataset.textRuns, canvas: [...el.querySelectorAll('canvas')].map(c => [c.width, c.height])}));
    const before = await state();
    assert.ok(before.signature && before.geometryBuilds, 'real artwork ready while editorial font is delayed');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate(el => el === document.activeElement), true);
    await page.screenshot({path: `${output}/${failure ? 'failed' : 'delayed'}-fallback.png`});
    release();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const after = await state();
    assert.deepEqual(after, before, 'editorial font completion does not reconstruct artwork');
    assert.ok(await page.locator('.hero-role').isVisible());
    assert.equal(await page.locator('#portfolio-loader').count(), 0);
    report.scenarios.push({name: failure ? 'failed-font-fallback' : 'delayed-font-swap', before, after, loaderIndependent: true, keyboardSkipLink: true});
    await page.screenshot({path: `${output}/${failure ? 'failed' : 'loaded'}-artwork.png`});
    await context.close();
  }
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const page = await context.newPage();
  const requests = [];
  page.on('request', r => {if (r.url().includes('/fonts/editorial/') && r.url().endsWith('.woff2')) requests.push(r.url());});
  await page.goto(base + '/en/', {waitUntil: 'networkidle'});
  for (const locale of ['ms', 'de', 'ar', 'en']) {
    const entry = page.locator('.utility-entry');
    if (await entry.isVisible() && await entry.getAttribute('aria-expanded') === 'false') await entry.click();
    if (await page.locator('[data-control="language"]').getAttribute('aria-expanded') !== 'true') await page.locator('[data-control="language"]').click();
    await page.locator('.utility-panel > .theme-control > select').selectOption(locale);
    await page.waitForFunction(locale => document.documentElement.dataset.localeReady === locale, locale);
  }
  assert.equal(requests.length, 1, 'display font is reused across locale switches');
  await page.emulateMedia({forcedColors: 'active'});
  assert.equal(await page.locator('.hero-environment > .ascii-forest').evaluate(el => getComputedStyle(el).display), 'none');
  assert.ok(await page.locator('h1').isVisible());
  report.scenarios.push({name: 'locale-switch-cache-and-forced-colors', requests});
  await context.close();
  // Equivalent CSS reflow area for a 1440×1000 window at 200% browser zoom.
  // This is not a claim that browser chrome's actual zoom setting was changed.
  for (const locale of ['en', 'ar', 'ta', 'ja']) {
    const ctx = await browser.newContext({viewport: {width: 720, height: 500}, deviceScaleFactor: 2, reducedMotion: 'reduce'});
    const p = await ctx.newPage();
    await p.goto(`${base}/${locale}/`, {waitUntil: 'networkidle'});
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.screenshot({path: `${output}/${locale}-200-percent-reflow-equivalent.png`});
    report.scenarios.push({name: '200-percent-reflow-equivalent', locale, viewport: [720, 500], deviceScaleFactor: 2});
    await ctx.close();
  }
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(`PASS ${report.scenarios.length} typography loading/accessibility scenarios`);
