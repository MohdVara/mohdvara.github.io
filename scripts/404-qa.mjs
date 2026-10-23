import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const { chromium } = require('playwright');
const axeRequire = process.env.QA_AXE_MODULES_DIR ? createRequire(resolve(process.env.QA_AXE_MODULES_DIR, 'package.json')) : require;
const axeSource = await readFile(axeRequire.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.QA_URL || 'http://127.0.0.1:4192';
const out = process.env.QA_OUTPUT || 'output/playwright/404-experience-v1';
await mkdir(out, { recursive: true });
const locales = JSON.parse(await readFile('src/i18n/languages.json', 'utf8'));
const report = { observedAt: new Date().toISOString(), host: 'Cloudflare Wrangler Pages local emulator', layouts: [], accessibility: [], errors: [], recovery: [], staticRoutes: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  let injectingFailure = false;
  page.on('pageerror', e => { if (injectingFailure) (report.injectedFailureErrors ||= []).push(e.message); else report.errors.push(e.message); });
  for (const {locale} of locales) {
    for (const theme of ['dark', 'light']) {
      for (const width of locale === 'en' ? [320,390,768,1280,1440,1920,3840] : [390,1440]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : width === 768 ? 1024 : 900 });
        const response = await page.goto(`${base}/${locale}/unmapped/deep/`, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 404);
        await page.waitForFunction(l => document.documentElement.dataset.localeReady === l, locale);
        await page.locator('#portfolio-loader').waitFor({ state: 'detached' });
        await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
        await page.waitForFunction(t => getComputedStyle(document.documentElement).color === (t === 'dark' ? 'rgb(241, 240, 236)' : 'rgb(37, 40, 34)'), theme);
        await page.evaluate(() => document.fonts.ready);
        const shape = await page.evaluate(() => ({
          width: innerWidth, document: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length, quote: document.querySelector('blockquote').textContent,
          direction: document.documentElement.dir, lang: document.documentElement.lang,
          canonical: !!document.querySelector('link[rel=canonical],link[hreflang]'),
          robots: document.querySelector('meta[name=robots]')?.content,
          actions: [...document.querySelectorAll('main a')].map(a => ({href: a.getAttribute('href'), height: a.getBoundingClientRect().height})),
          maximumWordWidth: Math.max(...[...document.querySelectorAll('.unmapped-wide .word text')].map(t => t.getComputedTextLength())),
          artTop:document.querySelector('.unmapped-landscape').getBoundingClientRect().top,
          contactBottom:document.querySelector('.unmapped-contact').getBoundingClientRect().bottom,
          quoteFont: getComputedStyle(document.querySelector('blockquote p')).fontSize,
        }));
        assert.ok(shape.document <= width + 1, `${locale} overflow at ${width}`);
        if(width<=900) assert.ok(shape.artTop >= shape.contactBottom + 12, `${locale} artwork competes with recovery links`);
        assert.equal(shape.h1, 1); assert.ok(!shape.canonical); assert.equal(shape.robots, 'noindex, follow');
        assert.equal(shape.lang, locale); assert.ok(shape.quote.trim());
        assert.equal(shape.direction, locale === 'ar' ? 'rtl' : 'ltr');
        assert.ok(shape.maximumWordWidth < 100, `${locale} semantic word exceeds reserved slot`);
        assert.ok(shape.actions.every(a => a.href.startsWith('/'+locale+'/') && a.height >= 44));
        report.layouts.push({locale,theme,width,...shape});
        if (['en','ar','ja'].includes(locale) && [390,768,1440].includes(width)) {
          await page.screenshot({path:`${out}/${locale}-${theme}-${width}.png`,fullPage:true});
        }
        if (width === 390 || width === 1440) {
          await page.addScriptTag({content:axeSource});
          const result = await page.evaluate(async () => window.axe.run(document, { runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21aa']} }));
          report.accessibility.push({locale,theme,width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.length}))});
        }
      }
    }
    console.log(`404 layouts checked: ${locale}`);
  }
  // Match literal recovery destinations against real static documents/anchors.
  for (const {locale} of locales) {
    await page.goto(`${base}/${locale}/lost/`); await page.waitForFunction(l=>document.documentElement.dataset.localeReady===l,locale);
    for (const href of [`/${locale}/`,`/${locale}/#public-engineering`,`/${locale}/#contact`]) {
      const target=await context.request.get(base+href); assert.equal(target.status(),200);
      const html=await target.text();const id=href.split('#')[1];if(id) assert.ok(html.includes(`id="${id}"`));
      report.recovery.push({locale,href,status:target.status()});
    }
  }
  await page.goto(`${base}/en/lost/`);await page.locator('#portfolio-loader').waitFor({state:'detached'});
  await page.keyboard.press('Tab'); report.keyboard={firstFocus:await page.evaluate(()=>document.activeElement.className)};
  assert.equal(report.keyboard.firstFocus,'skip-link');await page.keyboard.press('Enter');
  report.keyboard.skipTarget=await page.evaluate(()=>document.activeElement.id); assert.equal(report.keyboard.skipTarget,'main');
  await page.locator('.unmapped-actions .primary').focus();await page.keyboard.press('Enter');await page.waitForURL('**/en/');report.keyboard.home=page.url();
  // Actual selector: change locale on a missing path without inventing a route.
  await page.goto(`${base}/en/lost/?source=qa#trace`);await page.locator('#portfolio-loader').waitFor({state:'detached'});
  await page.locator('[data-control="language"]').click();await page.locator('.utility-panel select').first().selectOption('ar');
  await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='ar');
  report.localeSwitch={url:page.url(),title:await page.title(),quote:await page.locator('blockquote').innerText(),canonical:await page.locator('link[rel=canonical],link[hreflang]').count()};
  assert.ok(page.url().endsWith('/ar/lost/?source=qa#trace'));assert.equal(report.localeSwitch.canonical,0);
  await page.goto(`${base}/ja/lost/`);await page.locator('#portfolio-loader').waitFor({state:'detached'});
  await page.locator('[data-control="language"]').click();await page.locator('.reading-control select').selectOption('vertical');
  await page.keyboard.press('Escape');await page.screenshot({path:`${out}/ja-vertical-1440.png`,fullPage:true});
  report.vertical={writing:await page.locator('blockquote .vertical-text').evaluate(e=>getComputedStyle(e).writingMode),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
  assert.equal(report.vertical.writing,'vertical-rl');assert.ok(!report.vertical.overflow);
  await page.goto(`${base}/en/lost/`);await page.locator('#portfolio-loader').waitFor({state:'detached'});
  await page.evaluate(()=>document.documentElement.dataset.theme='light');
  await page.locator('.unmapped-landscape').screenshot({path:`${out}/artwork-light-1440.png`});
  await page.locator('.unmapped-wide').screenshot({path:`${out}/glyph-detail-source.png`});
  await page.screenshot({path:`${out}/glyph-detail.png`,clip:{x:960,y:460,width:400,height:400},scale:'css'});
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();report.noJavaScript=[];
  for(const {locale} of locales){const r=await staticPage.goto(`${base}/${locale}/missing/`);assert.equal(r.status(),404);assert.equal(await staticPage.locator('h1').count(),1);assert.ok(await staticPage.locator('blockquote').isVisible());report.noJavaScript.push({locale,status:r.status(),quote:await staticPage.locator('blockquote').innerText()});}
  await nojs.close();
  // No artwork dependency can delay or remove the server-rendered recovery.
  injectingFailure = true;
  await page.route('**/assets/NotFound-*.js',r=>r.abort());
  await page.goto(`${base}/en/asset-failure/`);assert.ok(await page.locator('#missing-title').isVisible());assert.ok(await page.locator('.unmapped-actions .primary').isVisible());report.failedArtworkChunk='Static error message and recovery remain visible';
  const sitemap=await readFile('dist/sitemap.xml','utf8');assert.ok(!sitemap.includes('/404'));
  for(const [,url] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)){const path=new URL(url).pathname;const response=await context.request.get(base+path);assert.equal(response.status(),200,path);report.staticRoutes.push({path,status:response.status()});}
} finally {
  await browser.close();await writeFile(`${out}/browser.json`,JSON.stringify(report,null,2)+'\n');
}
assert.deepEqual(report.errors,[]);
assert.equal(report.accessibility.flatMap(a=>a.violations).length,0);
console.log(JSON.stringify({layouts:report.layouts.length,accessibility:report.accessibility.length,routes:report.staticRoutes.length,errors:report.errors}));
