import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

// A targeted review of axe's incomplete findings. This is DOM/browser evidence,
// not a replacement for a human screen-reader or physical-device session.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT_DIR || 'output/playwright/pace-v1.1/accessibility-review');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { routes: [], reflow: [], preferences: [], limits: ['No physical device tested.', 'No actual screen reader session tested.', 'Computed color ratios cover reviewed flat backgrounds and the project grid overlay; they do not certify all rendered pixels.'] };
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), theme);
    const page = await context.newPage();
    for (const route of ['/', '/work-with-me/', '/no-two-mondays/', '/incident-zero/', '/incident-zero/defence/']) {
      await page.goto(base + route);
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
      await page.evaluate(() => document.fonts.ready);
      const audit = await new AxeBuilder({ page }).analyze();
      const headings = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes => nodes.map(node => ({ level: Number(node.tagName[1]), text: node.textContent.trim() })));
      await writeFile(`${output}/${route.replaceAll('/', '-').replace(/^-|-$/g, '') || 'home'}-${theme}.aria.txt`, await page.locator('body').ariaSnapshot());
      assert.equal(headings.filter(h => h.level === 1).length, 1, `${route}: one main heading`);
      assert.deepEqual(audit.violations, [], `${route}/${theme}: axe violations`);
      assert.equal(audit.incomplete.some(rule => rule.id === 'aria-prohibited-attr'), false, `${route}: unresolved ARIA`);
      const contrast = await page.evaluate(() => {
        const rgb = color => color.match(/[\d.]+/g).map(Number);
        const luminance = color => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
        const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
        const selectors = ['.project-visual .visual-top span', '.project-visual .node span:not(.node-dot)', '.node-explanation', '.visual-bottom', '.portrait figcaption span', '.no-two-mondays-preview figcaption', '.career-path figcaption', '.borneo-botanical figcaption span', '.ntm-ending-bars li > span:first-child', '.ntm-ending-bars li > strong', '.iz-opening-map text'];
        return selectors.flatMap(selector => [...document.querySelectorAll(selector)].map(el => {
          const style = getComputedStyle(el);
          let ancestor = el;
          while (ancestor && rgb(getComputedStyle(ancestor).backgroundColor)[3] === 0) ancestor = ancestor.parentElement;
          const background = rgb(getComputedStyle(ancestor || document.documentElement).backgroundColor);
          const foreground = rgb(el instanceof SVGElement ? style.fill : style.color);
          const candidates = [background];
          const panel = el.closest('.project-visual');
          // The decorative grid is behind the panel's copy at 16% opacity.
          // Opaque node backgrounds cover it; other panel text is bounded by
          // both possible grid colors instead of treating pseudo content as absent.
          if (panel && ancestor === panel) {
            const grid = rgb(getComputedStyle(panel, '::before').backgroundImage.match(/rgba?\([^)]+\)/)[0]);
            candidates.push(background.map((c, i) => i < 3 ? c * .84 + grid[i] * .16 : c));
          }
          return { selector, text: el.textContent.trim(), foreground, background, minimumRatio: Math.min(...candidates.map(bg => ratio(foreground, bg))) };
        }));
      });
      assert.ok(contrast.every(item => item.minimumRatio >= 4.5), JSON.stringify(contrast.filter(item => item.minimumRatio < 4.5)));
      let scrollChart = null;
      if (route === '/no-two-mondays/') {
        const region = page.getByRole('region', { name: 'Scrollable chart of automated completed runs by locked ending title' });
        await region.focus(); await region.press('Control+End');
        await region.evaluate(el => { el.scrollTop = el.scrollHeight; });
        scrollChart = await region.evaluate(el => ({ maximumScroll: el.scrollHeight - el.clientHeight, scrollTop: el.scrollTop, lastLabel: el.querySelector('li:last-child')?.textContent }));
        assert.ok(scrollChart.maximumScroll > 0 && Math.abs(scrollChart.maximumScroll - scrollChart.scrollTop) <= 1);
        await page.screenshot({ path: `${output}/endings-bottom-${theme}.png` });
      }
      if (route === '/') {
        await page.locator('#engineering-principles').getAttribute('aria-labelledby').then(id => assert.equal(id, 'principles-title'));
        assert.equal(await page.locator('#engineering-principles').evaluate(el => el.tagName), 'SECTION');
      }
      if (route === '/incident-zero/defence/') {
        await page.getByRole('group', { name: 'Encounter status' }).waitFor();
        assert.equal(await page.locator('.defence-hud .sr-only').textContent(), '3 of 3 integrity');
        assert.equal(await page.locator('.defence-hud strong [aria-hidden=true]').count(), 1);
      }
      results.routes.push({ route, theme, headings, contrast, scrollChart, incomplete: audit.incomplete.map(rule => ({ id: rule.id, nodes: rule.nodes.map(node => ({ target: node.target, html: node.html, reasons: [...node.any, ...node.all, ...node.none].map(check => check.message) })) })) });
      // 320 CSS pixels is the reflow width for a 1280px viewport at 400% zoom.
      // This tests layout at the equivalent width, not native browser zoom UI.
      await page.setViewportSize({ width: 320, height: 800 });
      const reflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      assert.ok(reflow.scrollWidth <= reflow.width + 1, `${route}/${theme}: horizontal overflow`);
      results.reflow.push({ route, theme, ...reflow });
      await page.setViewportSize({ width: 1280, height: 900 });
    }
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(base);
    await page.locator('.display-settings summary').click();
    await page.getByRole('combobox', { name: 'Text size' }).selectOption('largest');
    const checkbox = page.getByRole('checkbox', { name: 'Usage analytics' });
    assert.equal(await checkbox.isChecked(), false);
    assert.equal(await checkbox.getAttribute('aria-describedby'), 'analytics-notice');
    await checkbox.focus();
    const bounds = await page.locator('.monogram,.display-settings summary,.mobile-menu summary,.display-panel').evaluateAll(nodes => nodes.map(node => ({ element: node.className || node.parentElement.className, rect: node.getBoundingClientRect().toJSON() })));
    const [monogram, display, menu, panel] = ['monogram', 'display-settings', 'mobile-menu', 'display-panel'].map(name => bounds.find(item => item.element === name).rect);
    assert.ok(monogram.right < display.left && display.right < menu.left, 'Largest text header must not overlap');
    assert.ok(panel.left >= 0 && panel.right <= 320 && panel.top >= 0 && panel.bottom <= 568, 'Preferences must stay inside viewport');
    await page.locator('#analytics-notice').evaluate(el => el.scrollIntoView({ block: 'end' }));
    await page.screenshot({ path: `${output}/display-320-largest-${theme}.png` });
    await checkbox.press('Space'); assert.equal(await checkbox.isChecked(), true);
    await checkbox.press('Space'); assert.equal(await checkbox.isChecked(), false);
    await checkbox.press('Escape');
    assert.equal(await page.locator('.display-settings').evaluate(el => el.open), false);
    assert.equal(await page.locator(':focus').evaluate(el => el.matches('.display-settings summary')), true);
    results.preferences.push({ theme, width: 320, height: 568, size: 'largest', bounds, labelled: true, defaultOff: true, keyboardToggle: true, escapeFocus: true });
    await context.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ routeReviews: results.routes.length, reflowChecks: results.reflow.length, contrastSamples: results.routes.reduce((sum, route) => sum + route.contrast.length, 0), limits: results.limits }, null, 2));
