// Render the canonical English share card from the real homepage components.
// Start Vite, then run: QA_MODULES_DIR=<Playwright install> node scripts/home-social-preview.mjs
// This is an authoring tool; production does not depend on Playwright.
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export async function renderHomeSocialPreview(page, base = 'http://127.0.0.1:5177') {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'dark');
    localStorage.removeItem('portfolio-text-size');
  });
  await page.goto(`${base}/en/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: `
    html, body { width: 1200px !important; height: 630px !important; overflow: hidden !important; }
    body > #root > * { display: none !important; }
    body > #root > main { display: block !important; }
    main > :not(#home) { display: none !important; }
    #home { display: block !important; width: 1200px; height: 630px !important; min-height: 0 !important; }
    #home .hero { width: 1080px; max-width: none; height: 560px !important; min-height: 0 !important;
      margin: 0 60px; padding: 40px 0 0 !important; display: grid; grid-template-columns: 650px 330px;
      gap: 70px; align-items: center; }
    #home .hero-copy { align-self: center; }
    #home .eyebrow { font-size: 14px; margin: 0; }
    #home #hero-title { font-size: 82px !important; line-height: 1.03 !important; margin-top: 22px; }
    #home .hero-role { font-size: 25px; line-height: 1.5; margin-top: 24px; }
    #home .hero-role span { font-size: 22px; }
    #home .hero-description { font-size: 19px; line-height: 1.6; max-width: 610px; margin-top: 20px; }
    #home .actions, #home .hero-social { display: none !important; }
    #home .portrait { width: 330px; max-width: 330px; margin: 0 !important; transform: none; }
    #home .portrait-frame { width: 330px; }
    #home .portrait figcaption { font-size: 12px; }
    #home::after { content: 'mohd.paramasvara.online'; position: absolute; z-index: 2;
      left: 60px; right: 60px; bottom: 23px; padding-top: 15px;
      border-top: 1px solid var(--line); color: var(--muted); font-size: 17px; }
  ` });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('#home img')].map(img => img.decode()));
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForFunction(() => {
    const art = document.querySelector('#home > .ascii-forest');
    return art?.dataset.ready === 'true' && art.dataset.textureStatus === 'complete';
  });
  await page.locator('#home').screenshot({ path: resolve('public/og-image.png'), animations: 'disabled' });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await renderHomeSocialPreview(await browser.newPage(), process.env.QA_URL);
  } finally {
    await browser.close();
  }
}
