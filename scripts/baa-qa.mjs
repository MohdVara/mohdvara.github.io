import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Optional audit tools remain outside application dependencies, as in PACE.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const playwright = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const engine = process.env.QA_BROWSER || 'chromium';
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT_DIR || `output/playwright/baa-v1.1/${engine}`);
await mkdir(output, { recursive: true });
const browser = await playwright[engine].launch({ ...(engine === 'chromium' ? { channel: 'chrome' } : {}), headless: true });
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => { await browser.close(); process.exit(130); });
const results = { startedAt: new Date().toISOString(), engine, layouts: [], lifecycle: [], failures: [], noJavaScript: [], errors: [], accessibilityIncomplete: [], candidates: [] };
const metrics = [];
const sizes = [[320,568],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080],[3840,2160]];
function track(page, label) {
  page.on('pageerror', error => results.errors.push({ label, message: error.message }));
}
async function contextFor(width, height, theme = 'dark', motion = 'reduce', javaScriptEnabled = true) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: motion, javaScriptEnabled });
  if (javaScriptEnabled) await context.addInitScript(({ theme }) => localStorage.setItem('portfolio-theme', theme), { theme });
  return context;
}
async function load(page, ready = true) {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (ready) await page.locator('.ascii-forest[data-ready="true"]').waitFor();
}
async function semantic(page) {
  assert.equal(await page.locator('h1').count(), 1);
  assert.ok(await page.getByRole('heading', { level: 1 }).textContent());
  assert.ok(await page.locator('.hero-role').isVisible());
  assert.match(await page.locator('.hero-role').textContent(), /Principal Full-Stack Engineer/);
  assert.ok(await page.getByRole('link', { name: 'Discuss an engineering opportunity' }).isVisible());
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow');
}
async function preferences(page, name, value) {
  const summary = page.locator('.display-settings summary');
  if (!await page.locator('.display-settings').evaluate(el => el.open)) await summary.click();
  await page.getByRole('combobox', { name, exact: true }).selectOption(value);
  await summary.press('Escape');
}
async function stopped(page) {
  await page.waitForFunction(() => document.querySelector('.ascii-forest')?.dataset.running === 'false');
}
async function started(page) {
  try { await page.waitForFunction(() => document.querySelector('.ascii-forest')?.dataset.running === 'true'); }
  catch (error) { await page.screenshot({path: `${output}/running-timeout.png`}); await writeFile(`${output}/running-timeout.json`, JSON.stringify(await page.evaluate(() => ({forest:{...document.querySelector('.ascii-forest')?.dataset},hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,scrollY,storage:{...localStorage},html:document.querySelector('.scenery-control')?.outerHTML})),null,2)); throw error; }
}
async function read(page) { return page.locator('.ascii-forest').evaluate(el => ({ ...el.dataset })); }
async function audit(page, label) {
  const data = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  results.accessibilityIncomplete.push({ label, checks: data.incomplete.map(x => ({ id: x.id, targets: x.nodes.map(n => n.target) })) });
  assert.deepEqual(data.violations.map(x => ({ id: x.id, targets: x.nodes.map(n => n.target) })), [], label);
}
try {
  for (const [width, height] of process.env.QA_PHASE === 'behavior' ? [] : sizes) {
    for (const theme of ['light', 'dark']) {
      const context = await contextFor(width, height, theme);
      const page = await context.newPage(); track(page, `${width}/${theme}`);
      await load(page); await stopped(page); await semantic(page);
      assert.equal(await page.locator('.ascii-forest').getAttribute('aria-hidden'), 'true');
      assert.equal(await page.locator('.ascii-forest canvas').getAttribute('aria-hidden'), 'true');
      for (const textSize of width === 320 || width === 1440 ? ['default', 'largest'] : ['default']) {
        if (textSize !== 'default') await preferences(page, 'Text size', textSize);
        await page.evaluate(() => scrollTo(0,0)); await page.waitForTimeout(100);
        await semantic(page); await audit(page, `${width}/${theme}/${textSize}`);
        const data = await read(page);
        assert.ok(Number(data.backingPixels) <= 1920 * 1100 * 5 + 20000, 'Bounded backing storage');
        await page.screenshot({ path: `${output}/home-${width}-${theme}-${textSize}.png` });
        if ([390,1440].includes(width)) await page.locator('.hero-environment').screenshot({ path: `${output}/hero-${width}-${theme}-${textSize}.png` });
        results.layouts.push({ width, height, theme, textSize, ...data });
        console.log(`${engine}: ${width}/${theme}/${textSize} passed`);
      }
      await context.close();
    }
  }
  // Measured active samples; actual published frame counts, not the configured FPS.
  for (const width of [390,1440]) {
    console.log(`${engine}: motion ${width} start`);
    const context = await contextFor(width, width === 390 ? 844 : 900, 'dark', 'no-preference');
    const page = await context.newPage(); track(page, `motion-${width}`);
    await load(page); await started(page);
    await preferences(page, 'Animated scenery', 'paused'); await stopped(page);
    const frozen = await page.locator('.ascii-forest canvas').evaluate(el => el.toDataURL());
    await page.evaluate(value => { window.__baaFrozenPixels = value; }, frozen);
    const paused = await read(page); await page.waitForTimeout(600);
    assert.equal((await read(page)).frames, paused.frames, 'Paused frame count');
    assert.equal(await page.locator('.ascii-forest canvas').evaluate(el => el.toDataURL() === window.__baaFrozenPixels), true, 'Paused canvas pixels');
    await page.reload(); await page.locator('.ascii-forest[data-ready="true"]').waitFor(); await stopped(page);
    assert.equal((await read(page)).running, 'false', 'Remembered pause');
    const before = await read(page);
    const t0 = await page.evaluate(() => performance.now());
    await preferences(page, 'Animated scenery', 'enabled'); await started(page);
    await page.waitForTimeout(5000);
    await preferences(page, 'Animated scenery', 'paused'); await stopped(page);
    const t1 = await page.evaluate(() => performance.now()); const after = await read(page);
    const measured = { width, elapsedMs: t1-t0, paintedFrames: Number(after.frames)-Number(before.frames), fps: (Number(after.frames)-Number(before.frames))*1000/(t1-t0), averagePaintMs: Number(after.paintMs), maxPaintMs: Number(after.maxPaintMs), initializationMs: Number(after.initializationMs), initializationElapsedMs: Number(after.initializationElapsedMs), maxInitializationSliceMs: Number(after.maxInitializationSliceMs), backingPixels: Number(after.backingPixels), note: 'Wall sample includes brief UI activation/deactivation; paints include state changes. Paint timings measure JS draw calls, not GPU completion.' };
    metrics.push(measured); await writeFile(`${output}/metrics.json`, JSON.stringify(metrics,null,2)); console.log(`${engine}: motion ${width} measured ${measured.fps.toFixed(1)} FPS`); assert.ok(measured.paintedFrames > 5);
    const signature = after.signature;
    const darkPixels = await page.locator('.ascii-forest canvas').evaluate(el => el.toDataURL());
    await preferences(page, 'Color theme', 'light');
    await page.waitForTimeout(200);
    await page.evaluate(value => { window.__baaDarkPixels = value; }, darkPixels);
    assert.equal(await page.locator('.ascii-forest canvas').evaluate(el => el.toDataURL() === window.__baaDarkPixels), false, 'Theme changes rendered palette');
    assert.equal((await read(page)).signature, signature, 'Theme preserves terrain identity');
    await page.screenshot({ path: `${output}/motion-paused-${width}-light.png` });
    await preferences(page, 'Animated scenery', 'enabled'); await started(page);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await stopped(page);
    await page.locator('.display-settings summary').click();
    assert.equal(await page.getByRole('combobox', { name: 'Animated scenery', exact: true }).isDisabled(), true);
    await page.locator('.display-settings summary').press('Escape');
    const reduced = await read(page); await page.waitForTimeout(350);
    assert.equal((await read(page)).frames, reduced.frames, 'Runtime reduced motion freezes');
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await started(page);
    await page.locator('#contact').scrollIntoViewIfNeeded(); await stopped(page);
    const offscreen = await read(page); await page.waitForTimeout(350);
    assert.equal((await read(page)).frames, offscreen.frames, 'Offscreen freezes');
    await page.evaluate(() => scrollTo(0,0)); await started(page);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${output}/motion-active-${width}-light.png` });
    console.log(`${engine}: motion ${width} lifecycle passed`);
    results.lifecycle.push({ width, pausePixels: true, rememberedPause: true, themeStable: true, runtimeReducedMotion: true, offscreen: true, reentry: true });
    await context.close();
  }
  // Actual DOM relocation is confined to this isolated QA context and restored.
  for (const width of [1440,390]) {
    const context = await contextFor(width,width === 390 ? 844 : 900); const page = await context.newPage(); await load(page); await stopped(page);
    await page.screenshot({ path: `${output}/candidate-a-retained-portrait-${width}.png` });
    await page.evaluate(() => { const p=document.querySelector('.hero .portrait'); const marker=document.createComment('QA portrait position'); p.before(marker); window.__baaPortraitRestore={p,marker}; document.querySelector('#about .about-grid').append(p); });
    await page.waitForTimeout(150); await page.screenshot({ path: `${output}/candidate-b-about-portrait-${width}.png` });
    await page.locator('#about').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/candidate-b-about-placement-${width}.png` });
    await page.evaluate(() => { const {p,marker}=window.__baaPortraitRestore; marker.replaceWith(p); delete window.__baaPortraitRestore; scrollTo(0,0); });
    console.log(`${engine}: candidate comparison ${width} captured`);
    results.candidates.push({ width, retained: `candidate-a-retained-portrait-${width}.png`, relocated: `candidate-b-about-portrait-${width}.png`, about: `candidate-b-about-placement-${width}.png`, productionChanged: false });
    await context.close();
  }
  for (const failure of ['canvas-unavailable','renderer-download']) {
    const context = await contextFor(390,844); const page = await context.newPage(); track(page, failure);
    let blocked = 0;
    if (failure === 'canvas-unavailable') await page.addInitScript(() => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){ return type === '2d' ? null : original.call(this,type,...args); }; });
    else await page.route('**/assets/renderer-*.js', route => { blocked++; return route.abort(); });
    await load(page, false); await page.waitForTimeout(300); await semantic(page);
    assert.equal(await page.locator('.ascii-forest canvas').count(),0);
    if (failure === 'renderer-download') assert.ok(blocked > 0, 'Actually intercepted renderer chunk');
    await page.screenshot({path:`${output}/${failure}.png`});
    await page.getByRole('link',{name:'Discuss an engineering opportunity'}).click(); assert.ok(page.url().endsWith('#contact'));
    results.failures.push({failure,blocked,contentUsable:true}); await context.close();
  }
  for (const width of [320,1440]) {
    const context = await contextFor(width,900,'light','reduce',false); const page = await context.newPage();
    await page.goto(base); await semantic(page); assert.equal(await page.locator('.ascii-forest canvas').count(),0);
    await page.screenshot({path:`${output}/no-js-${width}.png`});
    await page.getByRole('link',{name:'Explore engineering work'}).click(); assert.ok(page.url().endsWith('#work'));
    results.noJavaScript.push(width); await context.close();
  }
  assert.deepEqual(results.errors, []);
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results,null,2));
  await writeFile(`${output}/metrics.json`, JSON.stringify(metrics,null,2));
  await browser.close();
}
