import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.QA_URL || 'http://127.0.0.1:4175';
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/pace-v1.2');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = { layouts: [], fragments: [], screenshots: [], axe: [], errors: [], consoleErrors: [], failedResources: [], noJavaScript: false, limitations: ['Local Chrome, simulated viewport and preferences; no physical device or screen-reader certification.', 'No deployment or hosted CDN verification.'] };
const sizes = process.env.QA_TEXT_SIZES?.split(',') || ['default', 'largest'];
assert.ok(sizes.every(size => ['default', 'large', 'largest'].includes(size)));
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.case-details[open] .project-stack')].every(node => node.scrollWidth <= node.clientWidth + 1));
try {
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) for (const theme of ['light', 'dark']) for (const size of sizes) {
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', colorScheme: theme });
    await ctx.addInitScript(({theme, size}) => { localStorage.setItem('portfolio-theme', theme); localStorage.setItem('portfolio-text-size', size); }, {theme, size});
    const page = await ctx.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
    page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) report.failedResources.push(r.url()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await page.locator('html').getAttribute('data-text-size'), size);
    for (const id of ['campus', 'insurance', 'wensymes', 'rental']) {
      const summary = page.locator(`#case-${id} summary`);
      await summary.focus(); await summary.press('Enter');
      assert.equal(await page.locator('.case-details[open]').count(), 1);
      assert.equal(await page.locator(`#case-${id} .project-stack`).isVisible(), true);
      assert.ok(await fits(page), `${width}/${theme}/${size}/${id} overflow`);
      if (id === 'campus') {
        assert.equal(await page.locator('#case-campus .technology-generation').count(), 2);
        assert.match(await page.locator('#case-campus .project-stack').innerText(), /Legacy systems[\s\S]*PHP 5[\s\S]*Modern systems[\s\S]*Laravel/);
      }
      if ((width === 320 && theme === 'dark' && size === 'largest' && id === 'campus') || (width === 1440 && theme === 'light' && size === 'default' && id === 'campus') || (width === 390 && theme === 'light' && size === 'largest' && id === 'wensymes')) {
        const path = `${output}/${id}-${width}-${theme}-${size}.png`;
        await page.locator(`#case-${id}`).screenshot({ path }); report.screenshots.push(path);
        const audit = await new AxeBuilder({page}).include(`#case-${id}`).analyze();
        report.axe.push({ width, theme, size, id, violations: audit.violations, incomplete: audit.incomplete.map(item => item.id) });
        assert.deepEqual(audit.violations, []);
      }
    }
    await page.locator('#additional-systems > summary').focus();
    await page.locator('#additional-systems > summary').press('Enter');
    assert.equal(await page.locator('.case-details[open]').count(), 1);
    for (const id of ['hostel', 'asset']) assert.equal(await page.locator(`#system-${id} .project-stack`).isVisible(), true);
    assert.ok(await fits(page), `${width}/${theme}/${size}/additional overflow`);
    assert.match(await page.locator('#system-hostel').innerText(), /unmaintained and not production-ready/);
    if (width === 320 && theme === 'light' && size === 'largest') {
      const path = `${output}/additional-${width}-${theme}-${size}.png`;
      await page.locator('#additional-systems').screenshot({path}); report.screenshots.push(path);
      const audit = await new AxeBuilder({page}).include('#additional-systems').analyze();
      report.axe.push({width, theme, size, id:'additional', violations:audit.violations, incomplete:audit.incomplete.map(item => item.id)});
      assert.deepEqual(audit.violations, []);
    }
    report.layouts.push({width, theme, size, expandedStacks:6, overflow:false});
    await ctx.close();
  }
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const id of ['case-campus', 'case-insurance', 'case-wensymes', 'case-rental', 'system-hostel', 'system-asset']) {
    await page.goto(`${base}/#${id}`, {waitUntil:'networkidle'});
    await page.waitForFunction(id => { const target = document.getElementById(id); const details = target?.matches('article[id^="case-"]') ? target.querySelector('details') : target?.closest('details'); return details?.open; }, id);
    assert.ok(await page.locator(`#${id} .project-stack`).isVisible());
    report.fragments.push(id);
  }
  await context.close();
  const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});
  const staticPage=await nojs.newPage();await staticPage.goto(base);
  for (const id of ['campus','insurance','wensymes','rental']) {
    await staticPage.locator(`#case-${id} summary`).click();
    assert.ok(await staticPage.locator(`#case-${id} .project-stack`).isVisible());
  }
  await staticPage.locator('#additional-systems > summary').click();
  assert.ok(await staticPage.locator('#system-asset').isVisible());
  assert.ok(await staticPage.locator('#system-hostel').isVisible());
  report.noJavaScript=true;await nojs.close();
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.failedResources,[]);
} finally {
  await writeFile(`${output}/technology-results.json`,JSON.stringify(report,null,2));await browser.close();
}
console.log(JSON.stringify({layouts:report.layouts.length,fragments:report.fragments.length,axe:report.axe.length,noJavaScript:report.noJavaScript,errors:report.errors,consoleErrors:report.consoleErrors,failedResources:report.failedResources,screenshots:report.screenshots},null,2));
