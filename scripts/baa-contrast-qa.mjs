import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Audit-only dependency; never add a browser runner to application dependencies.
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa', 'package.json'));
const { chromium } = require('playwright');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const contact = process.env.QA_CONTACT === '1';
const sectionSelector = contact ? '#contact' : '.hero-environment';
const textSelector = contact ? '#contact [data-reveal]' : '.hero-copy, .portrait figcaption';
const forestSelector = contact ? '.ascii-river' : '.ascii-forest';
const output = resolve(process.env.QA_CONTRAST_OUTPUT_DIR || `output/playwright/baa-v1.1/${contact ? 'contrast-contact' : 'contrast'}`);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {
  section: contact ? 'contact' : 'hero',
  isolatedOverlays: contact ? 'Site header and skip link visibility hidden, retaining layout, to keep unrelated sticky overlays out of full-section pixel samples.' : 'None',
  method: 'Actual rendered section background with semantic text made transparent in an isolated QA page. Samples every 2 screenshot pixels inside text-node Range rectangles, including rectangle edges; WCAG sRGB luminance with foreground alpha/ancestor opacity composited onto each sampled background pixel. 4.5 normal / 3 large text.',
  limitations: 'Bounded sampled contrast review of the selected semantic section text in six static reduced-motion Chrome layouts. It is not a complete WCAG audit, screen-reader review, all text coverage, or proof of every possible animated pixel. Rectangle sampling is conservative: it includes spaces between actual glyph strokes. Screenshots preserve original layout, canvas, button backgrounds and borders; text, text shadows and text decorations alone are suppressed.',
  cases: [], errors: [],
};

try {
  for (const [width, height, textSize] of [[390, 844, 'default'], [1440, 900, 'default'], [390, 844, 'largest']]) {
    for (const theme of ['light', 'dark']) {
      const label = `${width}-${theme}-${textSize}`;
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1,
        colorScheme: theme, reducedMotion: 'reduce' });
      await context.addInitScript(({ theme, textSize }) => {
        localStorage.setItem('portfolio-theme', theme);
        localStorage.setItem('portfolio-text-size', textSize);
      }, { theme, textSize });
      const page = await context.newPage();
      page.on('pageerror', error => report.errors.push({ label, message: error.message }));
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (contact) await page.locator('#contact').scrollIntoViewIfNeeded();
      await page.locator(`${forestSelector}[data-ready="true"]`).waitFor();
      await page.waitForFunction(selector => document.querySelector(selector)?.dataset.running === 'false', forestSelector);
      if (!contact) await page.evaluate(() => scrollTo(0, 0));
      // Tall element screenshots can scroll the sticky header across Contact's
      // first text rows. Remove only these unrelated overlays from the isolated
      // section audit, retaining their layout boxes and all section backgrounds.
      if (contact) await page.addStyleTag({ content: '.site-header, .skip-link { visibility: hidden !important; }' });
      const hero = page.locator(sectionSelector);
      await hero.screenshot({ path: `${output}/${label}-original.png` });
      const data = await page.evaluate(({ sectionSelector, textSelector, forestSelector }) => {
        const environment = document.querySelector(sectionSelector);
        const bounds = environment.getBoundingClientRect();
        const origin = { x: bounds.left + scrollX, y: bounds.top + scrollY, width: bounds.width, height: bounds.height };
        const text = [];
        const pixel = document.createElement('canvas'); pixel.width = pixel.height = 1;
        const colorContext = pixel.getContext('2d', { willReadFrequently: true });
        const rgba = color => {
          colorContext.clearRect(0, 0, 1, 1); colorContext.fillStyle = color; colorContext.fillRect(0, 0, 1, 1);
          return [...colorContext.getImageData(0, 0, 1, 1).data];
        };
        for (const root of document.querySelectorAll(textSelector)) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let node; (node = walker.nextNode());) {
            if (!node.textContent.trim()) continue;
            const element = node.parentElement;
            // Existing screen-reader-only labels have real Range rectangles but
            // are clipped out of the rendered page, so have no visual contrast.
            if (element.closest('.sr-only, svg')) continue;
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility !== 'visible') continue;
            let opacity = 1;
            for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
            if (!opacity) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({
              x: r.left + scrollX - origin.x, y: r.top + scrollY - origin.y, width: r.width, height: r.height,
            })).filter(r => r.x < origin.width && r.y < origin.height && r.x + r.width > 0 && r.y + r.height > 0);
            if (!rects.length) continue;
            const fontSize = parseFloat(style.fontSize), fontWeight = parseFloat(style.fontWeight);
            text.push({ text: node.textContent.trim(), tag: element.tagName.toLowerCase(), color: style.color,
              rgba: rgba(style.color), opacity, fontSize, fontWeight,
              threshold: fontSize >= 24 || (fontSize >= 18.666 && fontWeight >= 700) ? 3 : 4.5,
              rects,
            });
          }
        }
        // Preserve computed border colors before transparent currentColor could
        // affect them; background images and layout remain the real page's.
        const targets = new Set();
        for (const root of document.querySelectorAll(textSelector)) {
          targets.add(root); root.querySelectorAll('*').forEach(element => targets.add(element));
        }
        for (const element of targets) {
          const s = getComputedStyle(element);
          for (const edge of ['Top', 'Right', 'Bottom', 'Left']) element.style[`border${edge}Color`] = s[`border${edge}Color`];
        }
        return { origin, text, forest: { ...document.querySelector(forestSelector).dataset } };
      }, { sectionSelector, textSelector, forestSelector });
      if (!data.text.length) throw Error(`${label}: no semantic text rectangles found`);
      const hideSelector = textSelector.split(',').flatMap(selector => [selector.trim(), `${selector.trim()} *`]).join(',');
      await page.addStyleTag({ content: `
        ${hideSelector} {
          color: transparent !important; -webkit-text-fill-color: transparent !important;
          text-shadow: none !important; text-decoration: none !important; caret-color: transparent !important;
        }
      ` });
      const png = await hero.screenshot({ path: `${output}/${label}-background.png` });
      const samples = await page.evaluate(async ({ data, encoded }) => {
        const blob = await (await fetch(`data:image/png;base64,${encoded}`)).blob();
        const image = await createImageBitmap(blob);
        const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
        const sx = image.width / data.origin.width, sy = image.height / data.origin.height;
        const luminance = rgb => {
          const linear = rgb.map(channel => { const v = channel / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
          return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        };
        const values = data.text.map(text => {
          let minimum = Infinity, sampleCount = 0, worst;
          const alpha = text.rgba[3] / 255 * text.opacity;
          for (const rect of text.rects) {
            const left = Math.max(0, Math.floor(rect.x * sx)), right = Math.min(image.width - 1, Math.ceil((rect.x + rect.width) * sx) - 1);
            const top = Math.max(0, Math.floor(rect.y * sy)), bottom = Math.min(image.height - 1, Math.ceil((rect.y + rect.height) * sy) - 1);
            // Include each final edge even if the two-pixel stride skips it.
            const xs = [], ys = [];
            for (let x = left; x <= right; x += 2) xs.push(x);
            for (let y = top; y <= bottom; y += 2) ys.push(y);
            if (xs.at(-1) !== right) xs.push(right); if (ys.at(-1) !== bottom) ys.push(bottom);
            for (const y of ys) for (const x of xs) {
              const i = (y * image.width + x) * 4;
              const background = [pixels[i], pixels[i + 1], pixels[i + 2]];
              const foreground = background.map((channel, c) => channel * (1 - alpha) + text.rgba[c] * alpha);
              const a = luminance(foreground), b = luminance(background);
              const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
              sampleCount++;
              if (ratio < minimum) { minimum = ratio; worst = { x, y, background }; }
            }
          }
          return { ...text, sampleCount, minimumContrast: minimum, pass: minimum >= text.threshold, worst };
        });
        image.close();
        return { screenshot: { width: canvas.width, height: canvas.height, scaleX: sx, scaleY: sy }, values };
      }, { data, encoded: png.toString('base64') });
      const failures = samples.values.filter(value => !value.pass);
      const result = { label, width, height, theme, textSize, forest: data.forest, screenshot: samples.screenshot,
        minimumContrast: Math.min(...samples.values.map(value => value.minimumContrast)),
        textNodes: samples.values.length, sampleCount: samples.values.reduce((sum, value) => sum + value.sampleCount, 0),
        pass: !failures.length, failures, samples: samples.values };
      report.cases.push(result);
      await writeFile(`${output}/${label}-samples.json`, JSON.stringify(result, null, 2));
      console.log(`${label}: ${result.pass ? 'PASS' : 'FAIL'}; ${result.textNodes} text nodes; ${result.sampleCount} samples; minimum ${result.minimumContrast.toFixed(2)}; ${failures.length} failing nodes`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  report.pass = report.cases.length === 6 && report.cases.every(result => result.pass) && !report.errors.length;
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
}
if (!report.pass) process.exitCode = 1;
