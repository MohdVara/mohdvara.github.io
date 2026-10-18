import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
// Optional browser tooling lives outside production dependencies.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const browserTypes = require('playwright');
const browserName = process.env.QA_BROWSER || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(browserName), 'QA_BROWSER must be chromium, firefox or webkit');
const supportsTouch = browserName !== 'firefox';
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/pace-v1.1/games');
await mkdir(output, { recursive: true });
const browser = await browserTypes[browserName].launch(browserName === 'chromium' ? { channel: 'chrome' } : {});
const results = { browser: browserName, simulatedTouch: supportsTouch, previews: [], defence: [], recovery: [], errors: [], limitations: [supportsTouch ? 'Simulated touch, not a physical device.' : 'Firefox contexts do not support hasTouch; previews use keyboard input at every width.', 'External conversion destinations verified as links; booking and résumé provider workflows are not submitted.', 'Full normal investigations and defence progression/recovery are covered separately by the existing game harnesses.'] };
const capture = page => page.on('pageerror', error => results.errors.push(error.message));
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
try {
  for (const width of [320, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: supportsTouch && width < 500, reducedMotion: 'reduce' });
    const page = await context.newPage(); capture(page);
    await page.goto(base, { waitUntil: 'networkidle' });
    const shortcut = page.locator('.incident-callout').getByRole('link', { name: 'Preview engineering decisions' });
    assert.equal(await shortcut.getAttribute('href'), '/incident-zero/?mode=preview');
    await shortcut.press('Enter');
    await page.getByRole('dialog').waitFor();
    assert.match(await page.getByRole('dialog').innerText(), /Recruiter preview \/ auto-selected demonstration/i);
    for (const title of ['The Firefighter', 'The Great Rewrite', 'The Pragmatic Modernizer']) {
      // A fresh direct visit and reload must both honor the shortcut.
      await page.goto(base + '/incident-zero/?mode=preview');
      await page.reload();
      const choice = page.locator('.iz-decision-list').getByRole('button', { name: title });
      if (supportsTouch && width < 500) await choice.tap(); else await choice.press('Enter');
      await page.waitForFunction(() => document.activeElement?.id === 'iz-report-title');
      assert.equal(await page.locator('#iz-report-title').innerText(), title);
      const report = await page.locator('.iz-report').innerText();
      assert.match(report, /auto-selected; no investigation credit claimed/);
      assert.doesNotMatch(report, /The Archaeologist \/ additional insight/);
      assert.equal(await page.locator('canvas').count(), 0);
      for (const [name, href] of [
        ['Explore real engineering work', '/#work'],
        ['Book a conversation', 'https://cal.com/mohd-paramasvara/discovery'],
        ['2-page résumé', 'https://rxresu.me/mwara95/2-page-resume'],
        ['Full CV', 'https://rxresu.me/mwara95/curriculum-vitae'],
      ]) assert.equal(await page.locator('.iz-report').getByRole('link', { name }).getAttribute('href'), href);
      assert.ok(await fits(page));
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      assert.deepEqual(audit.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), []);
      await page.screenshot({ path: `${output}/preview-${width}-${title.replaceAll(' ', '-')}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Replay incident' }).press('Enter');
      await page.getByRole('button', { name: 'Skip conversation' }).press('Enter');
      assert.match(await page.locator('.iz-toolbar').innerText(), /0 \/ 6 evidence/);
      await page.getByRole('button', { name: 'Use simplified navigation', exact: true }).click();
      assert.equal(await page.locator('canvas').count(), 0);
      const help = page.getByRole('button', { name: 'Help', exact: true });
      await help.press('Enter'); await page.keyboard.press('Escape');
      assert.ok(await help.evaluate(e => e === document.activeElement));
      await page.locator('.iz-footer').getByRole('link', { name: 'Explore real engineering work' }).click();
      assert.equal(new URL(page.url()).hash, '#work');
      assert.equal(new URL(page.url()).pathname, '/');
      await page.locator('#work').waitFor();
      results.previews.push({ width, title, freshAndReload: true, input: supportsTouch && width < 500 ? 'simulated touch' : 'keyboard', focus: true, truthfulCredit: true, replay: true, axeViolations: 0, axeIncomplete: audit.incomplete.map(v => v.id) });
    }
    await page.goto(base + '/incident-zero/?mode=unknown');
    await page.getByRole('button', { name: 'Play the incident', exact: false }).waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    await context.close();
  }
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: supportsTouch && width < 500 });
    const page = await context.newPage(); capture(page);
    await page.goto(base + '/incident-zero/defence/');
    await page.getByRole('button', { name: 'Start run', exact: true }).click();
    const key = 'incident-zero-defence-v2';
    const initial = await page.evaluate(k => JSON.parse(sessionStorage.getItem(k)), key);
    assert.equal(await page.locator(':focus').getAttribute('class'), 'defence-world');
    await page.keyboard.press('2');
    assert.match(await page.locator('.defence-hud').innerText(), /Firewall Fan/);
    await page.getByRole('button', { name: 'Pause / help' }).click();
    await page.getByRole('heading', { name: 'Hold position.', exact: true }).waitFor();
    assert.equal(await page.locator(':focus').getAttribute('id'), 'defence-overlay-title');
    const frame = await page.locator('canvas').evaluate(c => c.toDataURL());
    await page.waitForTimeout(150);
    assert.equal(await page.locator('canvas').evaluate(c => c.toDataURL()), frame);
    await page.getByRole('button', { name: 'Resume run', exact: true }).click();
    await page.reload();
    await page.getByRole('heading', { name: 'Hold position.', exact: true }).waitFor();
    const restored = await page.evaluate(k => JSON.parse(sessionStorage.getItem(k)), key);
    assert.equal(restored.seed, initial.seed); assert.equal(restored.status, 'paused');
    await page.getByRole('button', { name: 'Restart same seed' }).click();
    const restarted = await page.evaluate(k => JSON.parse(sessionStorage.getItem(k)), key);
    assert.equal(restarted.seed, initial.seed); assert.notEqual(restarted.attemptId, initial.attemptId);
    assert.equal(restarted.score, 0); assert.equal(restarted.level, 1);
    assert.ok(await fits(page));
    await page.getByRole('button', { name: 'Pause / help' }).click();
    await page.getByRole('link', { name: 'Return to Incident Zero', exact: true }).click();
    await page.getByRole('button', { name: 'Play the incident', exact: false }).waitFor();
    results.defence.push({ width, start: true, controls: true, pauseFocusAndFreeze: true, resume: true, refreshCheckpoint: true, restartSameSeed: true, returnNavigation: true });
    await context.close();
  }
  for (const [route, pattern, message, retry] of [
    ['/incident-zero/', /(?:\/assets\/game-[^/]+\.js|\/src\/features\/incident-zero\/game\.ts)(?:\?.*)?$/, 'Incident map could not start.', 'Retry map'],
    ['/incident-zero/defence/', /(?:\/assets\/renderer-[^/]+\.js|\/src\/features\/incident-zero\/defence\/renderer\.ts)(?:\?.*)?$/, 'Renderer could not start.', 'Retry loading'],
  ]) {
    const context = await browser.newContext();
    await context.route(pattern, request => request.abort());
    const page = await context.newPage();
    await page.goto(base + route);
    if (route === '/incident-zero/') {
      await page.getByRole('button', { name: 'Play the incident', exact: false }).click();
      await page.getByRole('button', { name: 'Skip conversation' }).click();
    }
    await page.getByText(message, { exact: false }).waitFor();
    assert.ok(await page.getByRole('button', { name: retry, exact: true }).isVisible());
    if (route === '/incident-zero/') {
      await page.getByRole('button', { name: 'Use simplified navigation', exact: true }).click();
      await page.locator('.iz-location-list').getByRole('button', { name: 'Finance', exact: true }).click();
      await page.getByRole('button', { name: 'Inspect Finance analyst', exact: true }).click();
      await page.getByRole('dialog').waitFor();
    } else {
      await page.getByRole('link', { name: 'Return to story', exact: true }).click();
      await page.getByRole('button', { name: 'Play the incident', exact: false }).waitFor();
    }
    results.recovery.push({ route, simulatedChunkFailure: true, retryVisible: true, alternativeNavigation: true });
    await context.close();
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await nojs.newPage();
  await staticPage.goto(base + '/incident-zero/?mode=preview');
  // A production build prerenders this explanation; dev serves an empty root.
  if (process.env.QA_PRERENDERED === '1') {
    assert.equal(await staticPage.locator('h1').count(), 1);
    assert.match(await staticPage.locator('main noscript').innerText(), /requires JavaScript/);
  }
  await nojs.close();
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
