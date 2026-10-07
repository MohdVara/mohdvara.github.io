import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const output = resolve(process.env.QA_OUTPUT_DIR || '.qa');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
 for (const width of [320,375,430,768,1024,1440,1920]) for (const theme of ['light','dark']) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce', hasTouch: width <= 430, isMobile: width <= 430 });
  const page = await context.newPage();
  const errors = [], githubRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (/api\.github\.com/.test(r.url())) githubRequests.push(r.url()); });
  await page.goto(process.env.QA_URL || 'http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const section = page.locator('#public-engineering');
  await section.scrollIntoViewIfNeeded();
  assert.equal(await section.locator('article').count(), 2);
  for (const link of await section.locator('a').all()) {
   assert.match(await link.getAttribute('href'), /^https:\/\/github.com\/MohdVara(?:\/[-\w.]+)?$/);
   assert.equal(await link.getAttribute('target'), '_blank');
   assert.match(await link.getAttribute('rel'), /noopener/);
   await link.focus();
   assert.equal(await link.evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
   assert.ok((await link.boundingBox()).height >= 44);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  const axe = await new AxeBuilder({ page }).include('#public-engineering').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(axe.violations, []);
  await page.screenshot({ path: `${output}/public-${width}-${theme}.png` });
  // Layout stress: intentionally oversized repository identifiers and descriptions.
  await section.locator('.public-repository-name').first().evaluate(e => { e.textContent = 'repository-with-an-extremely-long-unbroken-identifier'.repeat(4); });
  await section.locator('.public-repository-detail > p').first().evaluate(e => { e.textContent = 'A longer technical description with details about inspectable source. '.repeat(15); });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.deepEqual(errors, []); assert.deepEqual(githubRequests, []);
  results.push({ width, theme, axeViolations: axe.violations.length, consoleErrors: errors, runtimeGithubRequests: githubRequests, longContentOverflow: false });
  await context.close();
 }
 const touch = await browser.newPage({ viewport: { width: 375, height: 900 }, hasTouch: true, isMobile: true });
 await touch.context().route('https://github.com/**', route => route.fulfill({ status: 200, body: '<html><title>Link destination</title></html>' }));
 await touch.goto(process.env.QA_URL || 'http://127.0.0.1:4173');
 const popupPromise = touch.waitForEvent('popup');
 await touch.locator('#public-engineering article a').first().tap();
 const popup = await popupPromise; await popup.waitForLoadState();
 assert.equal(popup.url(), 'https://github.com/MohdVara/nodejs-hotel-problem');
 await popup.close(); await touch.close();
 const staticPage = await browser.newPage({ javaScriptEnabled: false });
 await staticPage.goto(process.env.QA_URL || 'http://127.0.0.1:4173');
 assert.equal(await staticPage.locator('#public-engineering article').count(), 2);
 assert.equal(await staticPage.locator('#public-engineering article a').first().isVisible(), true);
 await staticPage.close();
 await writeFile(`${output}/public-results.json`, JSON.stringify({ results, touch: true, noJavaScript: true }, null, 2));
 console.log(JSON.stringify({ cases: results.length, touch: true, noJavaScript: true, violations: 0, runtimeGithubRequests: 0 }));
} finally { await browser.close(); }
