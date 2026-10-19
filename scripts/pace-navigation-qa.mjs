import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const engines = process.env.QA_BROWSER_MODULES_DIR ? createRequire(resolve(process.env.QA_BROWSER_MODULES_DIR, 'package.json'))('playwright') : require('playwright');
const engine = process.env.QA_BROWSER || 'chromium';
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT_DIR || `output/playwright/pace-v1.1/navigation-${engine}`);
await mkdir(output, { recursive: true });
const browser = await engines[engine].launch(engine === 'chromium' ? { channel: 'chrome' } : {});
const results = { engine, cases: [], evidence: [], ntm: [], noJavaScript: [], recovery: [], errors: [] };
const projects = ['insurance', 'wensymes', 'campus', 'rental', 'meetings', 'hr'];
async function aligned(page, id, open = false) {
  await page.waitForFunction(({ id, open }) => {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = target.getBoundingClientRect().top;
    const header = document.querySelector('header')?.getBoundingClientRect().bottom || 0;
    const bottom = window.scrollY >= document.documentElement.scrollHeight - innerHeight - 2;
    return top >= header - 1 && (top < header + 110 || (bottom && top < innerHeight - 40)) && (!open || target.querySelector('details')?.open);
  }, { id, open }).catch(async error => {
    console.error('Fragment alignment failed', await page.evaluate(id=>({hash:location.hash,id,top:document.getElementById(id)?.getBoundingClientRect().top,header:document.querySelector('header')?.getBoundingClientRect().bottom,scroll:scrollY,details:document.getElementById(id)?.querySelector('details')?.open}),id));
    throw error;
  });
}
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 375 ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    page.on('pageerror', error => results.errors.push(error.message));
    for (const id of projects) {
      await page.goto(`${base}/#case-${id}`); await aligned(page, `case-${id}`, true);
      assert.equal(await page.locator('.case-details[open]').count(), 1);
      await page.reload(); await aligned(page, `case-${id}`, true);
      results.cases.push({ width, project: id, directAndReload: true });
    }
    await page.goto(`${base}/#case-insurance`); await aligned(page, 'case-insurance', true);
    await page.evaluate(() => { location.hash = 'case-wensymes'; }); await aligned(page, 'case-wensymes', true);
    await page.goBack(); await aligned(page, 'case-insurance', true);
    await page.goForward(); await aligned(page, 'case-wensymes', true);
    await page.evaluate(() => { location.hash = 'contact'; }); await aligned(page, 'contact');
    assert.equal(await page.locator('#case-wensymes details').evaluate(el => el.open), true);
    await page.evaluate(() => { location.hash = 'case-not-a-project'; });
    assert.equal(await page.locator('.case-details[open]').count(), 1);
    await page.goto(base);
    for (const id of ['insurance', 'campus']) {
      const link = page.locator(`.principle-list a[href="#case-${id}"]`);
      await link.focus(); await page.keyboard.press('Enter');
      await aligned(page, `case-${id}`, true);
      await page.waitForFunction(id => document.activeElement === document.querySelector(`#case-${id} h3`), id);
    }
    const hrefs = await page.goto(`${base}/work-with-me/`).then(() => page.locator('.engagement-problems a, .engagement-types a').evaluateAll(els => els.map(el => el.getAttribute('href'))));
    for (let i = 0; i < hrefs.length; i++) {
      await page.goto(`${base}/work-with-me/`); await page.reload();
      await page.locator('.engagement-problems a, .engagement-types a').nth(i).click();
      const destination = new URL(hrefs[i], base);
      await page.waitForURL(url => url.pathname === destination.pathname && url.hash === destination.hash);
      if (destination.hash) await aligned(page, destination.hash.slice(1), destination.hash.startsWith('#case-'));
      else { await page.locator('h1').waitFor(); assert.equal(destination.pathname, '/pace-rag-case-study/'); }
      results.evidence.push({ width, href: hrefs[i], opened: true });
    }
    await page.goto(`${base}/no-two-mondays/`); await page.reload();
    const contents = await page.locator('.ntm-contents a').evaluateAll(els => els.map(el => el.getAttribute('href')));
    assert.ok(contents.includes('#ntm-summary'));
    for (const href of contents) {
      await page.locator(`.ntm-contents a[href="${href}"]`).click(); await aligned(page, href.slice(1));
    }
    assert.equal(await page.locator('#ntm-summary dt').count(), 6);
    const images = await page.locator('a[href^="/images/"]').evaluateAll(els => els.map(el => el.getAttribute('href')));
    for (const image of images) assert.equal((await page.request.get(base + image)).status(), 200);
    const histogram = page.locator('.ntm-ending-chart-scroll');
    if (await histogram.count()) {
      await histogram.evaluate(el => { el.scrollTop = el.scrollHeight; });
      assert.ok(await histogram.evaluate(el => el.scrollTop > 0));
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.ok(await page.locator('a[href="https://modvar.itch.io/no-two-mondays"]').count());
    await page.goto(`${base}/no-two-mondays/#ntm-summary`); await aligned(page, 'ntm-summary');
    await page.screenshot({ path: `${output}/ntm-summary-${width}.png` });
    await page.locator('.display-settings summary').click();
    await page.getByRole('combobox', { name: 'Text size' }).selectOption('largest');
    await page.locator('.display-settings summary').press('Escape');
    await page.goto(`${base}/no-two-mondays/#ntm-summary`); await aligned(page, 'ntm-summary');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await page.locator('#ntm-summary dt').count(), 6);
    await page.screenshot({ path: `${output}/ntm-summary-largest-${width}.png` });
    results.ntm.push({ width, contents: contents.length, imageLinks: images.length, overflow: false, largestText: true });
    await context.close();
  }
  for (const route of ['/', '/work-with-me/', '/no-two-mondays/', '/incident-zero/', '/incident-zero/defence/']) {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage(); await page.goto(base + route + (route === '/' ? '#case-insurance' : ''));
    assert.equal(await page.locator('h1').count(), 1);
    if (route === '/') {
      // Native fragments expose the summary; JS is required for automatic opening.
      assert.equal(await page.locator('#case-insurance details').evaluate(el => el.open), false);
      await page.locator('#case-insurance summary').click();
      assert.equal(await page.locator('#case-insurance details').evaluate(el => el.open), true);
    }
    results.noJavaScript.push(route); await context.close();
  }
  for (const [route, chunk] of [['work-with-me','WorkWithMe'], ['no-two-mondays','NoTwoMondaysCaseStudy']]) {
    const page = await browser.newPage();
    await page.route(`**/${chunk}-*.js`, request => request.abort());
    await page.goto(`${base}/${route}/`);
    await page.getByRole('heading', { name: 'This experience could not load.' }).waitFor();
    assert.equal(await page.locator(':focus').getAttribute('id'), 'route-error-title');
    await page.unroute(`**/${chunk}-*.js`);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.locator(route === 'work-with-me' ? '#engagement-title' : 'main h1').waitFor();
    results.recovery.push(route); await page.close();
  }
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)); await browser.close();
}
console.log(JSON.stringify(results, null, 2));
