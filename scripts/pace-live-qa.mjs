import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.QA_LIVE_URL || 'https://mohd.paramasvara.online';
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/pace-v1.1/live');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = { url: base, note: 'Read-only checks of the deployed version, not publication or validation of local PACE v1.1 changes.', routes: [], external: [], errors: [] };
try {
  const page = await browser.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  for (const route of ['/', '/work-with-me/', '/no-two-mondays/', '/incident-zero/', '/incident-zero/defence/']) {
    const response = await page.goto(base + route); assert.equal(response.status(), 200);
    await page.reload();
    await page.locator('h1').waitFor(); assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), base + route);
    const assets = await page.locator('script[src^="/assets/"], img[src^="/images/"]').evaluateAll(els => els.map(el => el.getAttribute('src')));
    const checked = [];
    for (const asset of assets.slice(0, 4)) { const r = await page.request.get(base + asset); assert.equal(r.status(), 200); checked.push(asset); }
    results.routes.push({ route, directAndReload: true, canonical: base + route, checkedAssets: checked, title: await page.title() });
  }
  const missing = await page.goto(base + '/pace-v11-unknown-route');
  assert.equal(missing.status(), 404);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow');
  results.unknownRouteStatus = missing.status();
  for (const url of ['https://cal.com/mohd-paramasvara/discovery', 'https://rxresu.me/mwara95/2-page-resume', 'https://rxresu.me/mwara95/curriculum-vitae', 'https://modvar.itch.io/no-two-mondays']) {
    const r = await page.request.get(url); results.external.push({ url, status: r.status() }); assert.equal(r.status(), 200);
  }
  assert.deepEqual(results.errors, []);
} finally { await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)); await browser.close(); }
console.log(JSON.stringify(results, null, 2));
