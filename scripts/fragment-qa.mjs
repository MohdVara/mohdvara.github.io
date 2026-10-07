import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome' });
let checks = 0;
async function aligned(page, id) {
  // Checking that the target merely exists misses client-rendered navigation
  // failures. Assert its actual position below the sticky header instead.
  await page.waitForFunction(id => {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = target.getBoundingClientRect().top;
    const header = document.querySelector('header').getBoundingClientRect().bottom;
    return top >= header && top <= header + 50;
  }, id);
  await page.waitForTimeout(500);
  const top = await page.locator(`#${id}`).evaluate(e => e.getBoundingClientRect().top);
  assert.ok(top >= 75 && top <= 145, `${id} settled at ${top}px`);
  checks++;
}
try {
  for (const width of [375, 1440]) for (const reducedMotion of ['reduce', 'no-preference']) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const id of ['case-meetings', 'case-insurance', 'case-hr', 'case-rental']) {
      await page.goto(`${base}/#${id}`, { waitUntil: 'networkidle' });
      await aligned(page, id);
      await page.reload({ waitUntil: 'networkidle' });
      await aligned(page, id);
    }
    await page.goto(`${base}/work-with-me/`, { waitUntil: 'networkidle' });
    await page.locator('a[href="/#case-insurance"]').click();
    await page.waitForURL('**/#case-insurance');
    await aligned(page, 'case-insurance');
    await page.evaluate(() => { location.hash = 'case-rental'; });
    await aligned(page, 'case-rental');
    assert.deepEqual(errors, []);
    console.log(`${width}px / ${reducedMotion}: direct visits, refreshes, cross-page and same-page links passed`);
    await page.close();
  }
  console.log(`${checks} fragment-position checks passed at ${base}`);
} finally { await browser.close(); }
