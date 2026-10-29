import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium} = require('playwright');
const output = 'output/playwright/pme-type-1.6';
await mkdir(output, {recursive: true});
// Run this alone, after the other browser/build/test suites finish. Both URLs
// must serve production builds; baseline must be the original implementation.
const browser = await chromium.launch({channel: 'chrome', headless: true});
const cases = [];
try {
  for (let run = 0; run < 5; run++) for (const [stage, base] of [
    ['before', process.env.QA_BASELINE_URL || 'http://127.0.0.1:4179'],
    ['after', process.env.QA_URL || 'http://127.0.0.1:4178'],
  ]) {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
    await context.addInitScript(() => {
      window.metrics = {cls: 0, lcp: null};
      new PerformanceObserver(list => list.getEntries().forEach(e => {if (!e.hadRecentInput) window.metrics.cls += e.value;})).observe({type: 'layout-shift', buffered: true});
      new PerformanceObserver(list => {window.metrics.lcp = list.getEntries().at(-1).startTime;}).observe({type: 'largest-contentful-paint', buffered: true});
    });
    const page = await context.newPage();
    await page.goto(`${base}/en/`, {waitUntil: 'networkidle'});
    await page.locator('.ascii-forest[data-ready=true]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    cases.push({stage, run, ...await page.evaluate(() => {
      const resources = suffix => performance.getEntriesByType('resource').filter(r => r.name.endsWith(suffix)).map(r => ({path: new URL(r.name).pathname, encodedBodySize: r.encodedBodySize, transferSize: r.transferSize}));
      return {...window.metrics, fonts: resources('.woff2'), css: resources('.css')};
    })});
    await context.close();
  }
} finally {
  await writeFile(`${output}/performance.json`, JSON.stringify({method: 'Five alternating original/final local Chrome cold-context navigations, 1440x1000, reduced motion, no network/CPU throttling; run after other QA. Local transfer includes response headers. Descriptive samples, not a production significance test.', browser: browser.version(), cases}, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify(cases.map(({stage, run, lcp, cls}) => ({stage, run, lcp, cls})), null, 2));
