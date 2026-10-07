import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(resolve(process.env.QA_MODULES_DIR || ".", "package.json"));
const { chromium } = require("playwright");
const output = resolve(process.env.QA_OUTPUT_DIR || ".qa");
const base = process.env.QA_URL || "http://127.0.0.1:4173";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const results = [];
const pause = (page, ms = 300) => page.waitForTimeout(ms);
async function jump(page, top) {
  await page.evaluate((value) => scrollTo({ top: value, behavior: "instant" }), top);
  await pause(page);
}
async function docTop(locator) {
  return locator.evaluate((element) => element.getBoundingClientRect().top + scrollY);
}
try {
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: "dark", reducedMotion: "no-preference" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.qaCLS = 0;
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) window.qaCLS += entry.value;
      })).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(() => document.documentElement.style.scrollBehavior = "auto");
    const copyPosition = await docTop(page.locator(".hero-copy"));
    await jump(page, 350);
    assert.equal(await docTop(page.locator(".hero-copy")), copyPosition, "Hero copy moves relative to document");
    const portrait = await page.locator(".portrait").evaluate((element) => parseFloat(getComputedStyle(element).getPropertyValue("--portrait-depth")));
    assert.ok(width <= 760 ? portrait === 0 : portrait > 0 && portrait <= 8);
    const rolePositions = [];
    for (const role of await page.locator(".timeline li").all()) {
      await jump(page, await docTop(role) - 450);
      await page.waitForFunction((id) => document.getElementById(id).classList.contains("reading-active"), await role.getAttribute("id"));
      rolePositions.push(Number(await page.locator("#experience").evaluate((e) => e.style.getPropertyValue("--section-progress"))));
    }
    assert.ok(rolePositions.every((value, i) => i === 0 || value >= rolePositions[i - 1]));
    assert.ok(rolePositions.at(-1) > 0.995);
    const capTop = await docTop(page.locator("#capabilities"));
    await jump(page, capTop - 300);
    const mapBefore = await page.locator(".map-growth").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset));
    await jump(page, capTop + 200);
    const mapAfter = await page.locator(".map-growth").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset));
    assert.ok(mapAfter < mapBefore, "Capability growth doesn't advance");
    await page.getByRole("button", { name: "Knowledge tools", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.getByRole("button", { name: "Knowledge tools", exact: true }).getAttribute("aria-pressed"), "true");
    const contactTop = await docTop(page.locator("#contact"));
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    await jump(page, contactTop - 950);
    await pause(page, 750);
    const dormant = await page.locator(".convergence-final").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset));
    await jump(page, maxScroll);
    await pause(page, 750);
    assert.equal(await page.locator("#contact").evaluate((e) => e.style.getPropertyValue("--section-progress")), "1.0000");
    assert.equal(await page.locator(".convergence-final").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset)), 0);
    assert.ok(dormant > 0.9, `Contact main path is active too early at ${width}: ${dormant}`);
    assert.equal(await page.locator(".convergence-end").evaluate((e) => getComputedStyle(e).opacity), "0.6");
    await jump(page, contactTop - 950);
    await pause(page, 750);
    assert.ok(await page.locator(".convergence-final").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset)) > 0.9, "Reverse scroll leaves Contact completed");
    // Slow, fast and reversed native scroll; no wheel interception/inertia.
    for (const top of [400, 450, 500, 550, 4800, 200, maxScroll, 0]) await jump(page, top);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    await page.getByRole("combobox", { name: "Color theme" }).selectOption("light");
    await page.locator("#about").scrollIntoViewIfNeeded(); await pause(page, 1250);
    assert.equal(await page.locator(".borneo-botanical .botanical-drawing > g").evaluate((e) => getComputedStyle(e).animationPlayState), "running");
    await page.screenshot({ path: `${output}/motion-light-${width}.png` });
    await page.emulateMedia({ reducedMotion: "reduce" }); await pause(page);
    assert.equal(await page.locator(".borneo-botanical .botanical-drawing > g").evaluate((e) => getComputedStyle(e).animationName), "none");
    assert.equal(await page.locator(".convergence-final").evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset)), 0);
    assert.equal(await page.locator("#experience").evaluate((e) => e.style.getPropertyValue("--section-progress")), "");
    assert.equal(await page.locator(".flow-signal").first().evaluate((e) => getComputedStyle(e).display), "none");
    assert.deepEqual(errors, []);
    assert.ok(await page.evaluate(() => window.qaCLS) < 0.1, "Motion produces excessive layout shift");
    results.push({ width, rolePositions, contactStages: true, reverse: true, slowFastScroll: true, reducedMotion: true, cls: await page.evaluate(() => window.qaCLS), consoleErrors: errors.length });
    console.log(`Motion stages and layout stability passed at ${width}px`);
    await page.close();
  }
  // Observe a real idle interval, then measure main-thread frame cadence separately.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", colorScheme: "dark" });
  await page.goto(base, { waitUntil: "networkidle" });
  const session = await page.context().newCDPSession(page);
  await session.send("Performance.enable");
  const metrics = async () => Object.fromEntries((await session.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]));
  const before = await metrics();
  const first = await page.locator(".hero-botanical > g").evaluate((e) => getComputedStyle(e).transform);
  await page.screenshot({ path: `${output}/idle-start.png` });
  await pause(page, 30000);
  const last = await page.locator(".hero-botanical > g").evaluate((e) => getComputedStyle(e).transform);
  const after = await metrics();
  assert.notEqual(first, last, "Idle network remains static");
  await page.screenshot({ path: `${output}/idle-30s.png` });
  const cadence = await page.evaluate(() => new Promise((resolve) => {
    const deltas = []; let previous = performance.now(); const start = previous;
    const sample = (now) => { deltas.push(now - previous); previous = now; if (now - start < 2000) requestAnimationFrame(sample); else resolve({ frames: deltas.length, meanMs: deltas.reduce((a, b) => a + b) / deltas.length, maxMs: Math.max(...deltas) }); };
    requestAnimationFrame(sample);
  }));
  await page.locator(".project-visual").first().scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => document.querySelectorAll(".motion-signal-host").length === 1);
  let pulseSeen = false;
  for (let i = 0; i < 52; i++) { if (await page.locator(".motion-signal-host .flow-signal").evaluate((e) => parseFloat(getComputedStyle(e).opacity)) > 0.1) pulseSeen = true; await pause(page, 250); }
  assert.ok(pulseSeen, "No occasional project signal during idle");
  assert.equal(await page.locator(".motion-signal-host").count(), 1);
  await page.locator("#about").scrollIntoViewIfNeeded(); await pause(page, 1500);
  assert.equal(await page.locator(".motion-signal-host").count(), 0);
  assert.equal(await page.locator(".hero-botanical > g").evaluate((e) => getComputedStyle(e).animationPlayState), "paused");
  // Headless Chrome keeps inactive pages visible. Exercise the same browser event
  // contract explicitly without claiming a physical tab-backgrounding test.
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  assert.equal(await page.locator("html").evaluate((e) => e.classList.contains("motion-enabled")), false);
  assert.equal(await page.locator(".borneo-botanical .botanical-drawing > g").evaluate((e) => getComputedStyle(e).animationPlayState), "paused");
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
  await pause(page);
  assert.equal(await page.locator("html").evaluate((e) => e.classList.contains("motion-enabled")), true);
  const report = { results, idle: { seconds: 30, first, last, taskSeconds: after.TaskDuration - before.TaskDuration, scriptSeconds: after.ScriptDuration - before.ScriptDuration, layouts: after.LayoutCount - before.LayoutCount }, cadence, projectPulse: true, visibilityEventPauseResume: true };
  await writeFile(`${output}/motion-results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await page.close();
} finally { await browser.close(); }
