import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// Uses the same external, audit-only Playwright installation as i18n-qa.mjs.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium} = require('playwright');
const stage = process.env.QA_STAGE || 'after';
const output = `output/playwright/pme-type-1.6/${stage}`;
const base = process.env.QA_URL || 'http://127.0.0.1:4178';
const registry = JSON.parse(await readFile('src/i18n/languages.json', 'utf8'));
const latin = ['en', 'ms', 'es', 'fr', 'de', 'pt-BR'];
// A focused rerun updates the existing matrix without discarding unaffected
// evidence. Use only when the change's affected states are known (e.g. light).
const filter = process.env.QA_FILTER ? new RegExp(process.env.QA_FILTER) : null;
const report = filter ? JSON.parse(await readFile(`${output}/report.json`, 'utf8')) : {stage, cases: [], errors: [], failures: []};
report.resampledLabels = [];
await mkdir(output, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
async function sample(locale, route = '', options = {}) {
  const {width = 1440, height = 1000, theme = 'dark', size = 'default', mode} = options;
  const label = `${locale}-${route || 'home'}-${width}x${height}-${theme}-${size}-${mode || 'default'}`;
  if (filter && !filter.test(label)) return;
  report.cases = report.cases.filter(c => c.label !== label);
  report.errors = report.errors.filter(c => c.label !== label);
  report.failures = report.failures.filter(c => c.label !== label);
  report.resampledLabels.push(label);
  const context = await browser.newContext({viewport: {width, height}, locale, reducedMotion: 'reduce'});
  await context.addInitScript(({theme, size}) => {
    localStorage.setItem('portfolio-theme', theme);
    localStorage.setItem('portfolio-text-size', size);
    window.typeMetrics = {cls: 0, lcp: null};
    new PerformanceObserver(list => list.getEntries().forEach(e => {if (!e.hadRecentInput) window.typeMetrics.cls += e.value;})).observe({type: 'layout-shift', buffered: true});
    new PerformanceObserver(list => {window.typeMetrics.lcp = list.getEntries().at(-1).startTime;}).observe({type: 'largest-contentful-paint', buffered: true});
  }, {theme, size});
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push({label, message: error.message}));
  await page.goto(`${base}/${locale}/${route ? route + '/' : ''}`, {waitUntil: 'networkidle'});
  await page.waitForFunction(locale => document.documentElement.dataset.localeReady === locale, locale);
  await page.evaluate(() => document.fonts.ready);
  // The seeded, reduced-motion artwork still initializes asynchronously.
  // Wait for its final texture instead of comparing different loading frames.
  await page.locator('.ascii-forest[data-ready="true"]').first().waitFor();
  if (mode) {
    const entry = page.locator('.utility-entry');
    if (await entry.isVisible() && await entry.getAttribute('aria-expanded') === 'false') await entry.click();
    await page.locator('[data-control="language"]').click();
    await page.waitForFunction(() => document.querySelector('.ascii-forest')?.dataset.textureStatus !== 'loading');
    await page.locator('.reading-control select').selectOption(mode);
    await page.locator('[data-control="language"]').click();
  }
  const measure = await page.evaluate(() => {
    const rect = el => {const r = el.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right};};
    const style = el => {const s = getComputedStyle(el); return {family: s.fontFamily, size: s.fontSize, line: s.lineHeight, weight: s.fontWeight, tracking: s.letterSpacing, writing: s.writingMode, direction: s.direction, ...rect(el)};};
    const heading = document.querySelector('h1');
    const hero = document.querySelector('.hero-environment');
    const headingRanges = [];
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {const r = document.createRange(); r.selectNodeContents(node); headingRanges.push(...[...r.getClientRects()].map(r => ({x: r.x, right: r.right, y: r.y, bottom: r.bottom})));}
    return {lang: document.documentElement.lang, dir: document.documentElement.dir, mode: document.documentElement.dataset.writingMode,
      rootSize: getComputedStyle(document.documentElement).fontSize, scrollWidth: document.documentElement.scrollWidth,
      heading: style(heading), headingRanges, body: style(document.querySelector('main p')),
      native: document.querySelector('.hero-native-name') ? style(document.querySelector('.hero-native-name')) : null,
      vertical: document.querySelector('.vertical-text') ? style(document.querySelector('.vertical-text')) : null,
      hero: hero ? rect(hero) : null, portrait: hero ? rect(document.querySelector('.portrait')) : null,
      copy: hero ? rect(document.querySelector('.hero-copy')) : null,
      last: hero ? rect(document.querySelector('.hero-copy > .hero-social:last-child')) : null,
      loaderGone: !document.querySelector('#portfolio-loader'), ...window.typeMetrics,
      resources: performance.getEntriesByType('resource').filter(r => /\.(woff2?|css)(\?|$)/.test(r.name)).map(r => ({url: r.name.replace(location.origin, ''), transfer: r.transferSize, bytes: r.encodedBodySize})),
      controls: [...document.querySelectorAll('.site-header button,.site-header select,.pace-assistant')].map(style)};
  });
  const session = await context.newCDPSession(page);
  const {root} = await session.send('DOM.getDocument');
  const {nodeId} = await session.send('DOM.querySelector', {nodeId: root.nodeId, selector: 'h1'});
  measure.platformFonts = (await session.send('CSS.enable'), await session.send('CSS.getPlatformFontsForNode', {nodeId})).fonts;
  const check = (condition, message) => {if (!condition) report.failures.push({label, message});};
  check(measure.scrollWidth <= width + 1, 'horizontal page overflow');
  check(measure.dir === registry.find(i => i.locale === locale).direction, 'locale direction');
  check(measure.loaderGone, 'loader completion');
  check(measure.headingRanges.every(r => r.x >= -1 && r.right <= width + 1), 'heading text stays within viewport');
  if (measure.portrait) check(measure.headingRanges.every(r => r.right <= measure.portrait.x || r.x >= measure.portrait.right || r.bottom <= measure.portrait.y || r.y >= measure.portrait.bottom), 'heading text clears portrait');
  if (stage === 'after') {
    const display = measure.resources.filter(r => r.url.includes('/fonts/editorial/') && r.url.endsWith('.woff2'));
    check(display.length === (latin.includes(locale) ? 1 : 0), 'locale-scoped single display font request');
    check(!measure.body.family.includes('Space Grotesk'), 'body remains narrative font');
    check(measure.controls.every(c => !c.family.includes('Space Grotesk')), 'controls remain functional fonts');
    // The upstream variable binary's legacy family name is Space Grotesk Light;
    // CSS selects its 600 instance. Inspect the binary PostScript family too.
    if (latin.includes(locale)) check(measure.platformFonts.some(f => f.postScriptName.startsWith('SpaceGrotesk-') && f.isCustomFont), 'actual display face rendered');
  }
  if (mode === 'vertical') check(measure.vertical?.writing === 'vertical-rl', 'vertical editorial writing');
  if (heroChecks(measure, locale, width)) check(measure.portrait.right <= measure.copy.x + 1, 'Arabic portrait on left');
  if (measure.hero) check(measure.last.bottom <= measure.hero.bottom + 1, 'hero content clipped');
  await page.screenshot({path: `${output}/${label}.png`});
  report.cases.push({label, locale, route, width, height, theme, size, ...measure});
  await context.close();
}
function heroChecks(measure, locale, width) {return measure.hero && locale === 'ar' && width >= 1100;}
try {
  for (const item of registry) for (const width of [390, 1440]) await sample(item.locale, '', {width});
  for (const locale of ['en', 'ar', 'ta', 'hi', 'ja', 'zh-Hans', 'de', 'pt-BR']) {
    await sample(locale, '', {width: 320, size: 'largest', theme: 'light'});
    await sample(locale, '', {width: 1440, height: 650, theme: 'light'});
  }
  for (const width of [320, 375, 768, 1024, 1920]) await sample('en', '', {width});
  for (const locale of ['en', 'ar', 'ta', 'ja']) await sample(locale, '', {width: 390, size: 'large'});
  for (const locale of ['ja', 'zh-Hans']) for (const mode of ['horizontal', 'vertical']) await sample(locale, '', {mode});
  for (const route of ['work-with-me', 'mmcats-modern', 'pace-rag-case-study', 'multilingual-engineering', 'naae', 'no-two-mondays', 'incident-zero']) await sample('en', route);
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({cases: report.cases.length, resampled: report.resampledLabels.length, errors: report.errors, failures: report.failures}, null, 2));
assert.equal(report.errors.length + report.failures.length, 0);
