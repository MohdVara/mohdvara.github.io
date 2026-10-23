import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile, stat } from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL || 'http://127.0.0.1:4183';
const out=process.env.QA_OUTPUT || `output/playwright/utility-rail-v1-${Date.now()}`;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={output:out,checks:[],layouts:[],errors:[],axe:[],requests:[]};
const check=(name)=>{report.checks.push(name);console.log('PASS '+name);};
async function open(page,control) {
 const entry=page.locator('.utility-entry');
 if(await entry.isVisible() && await entry.getAttribute('aria-expanded')==='false') await entry.click();
 await page.locator(`[data-control="${control}"]`).click();
 await page.locator('.utility-panel select, .utility-panel input').first().waitFor();
}
async function bounds(page) {
 return page.locator('.utility-panel').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight};});
}
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en',reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 page.on('request',r=>{if(/posthog|i\.posthog/.test(r.url()))report.requests.push(r.url());});
 await page.goto(base+'/en/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.utility-rail').count(),1);
 await page.screenshot({path:`${out}/desktop-closed.png`});
 report.initialResources=await page.evaluate(()=>performance.getEntriesByType('resource').map(item=>({path:new URL(item.name).pathname,type:item.initiatorType,transferBytes:item.transferSize,encodedBytes:item.encodedBodySize,decodedBytes:item.decodedBodySize})));
 assert.equal(await page.locator('.language-control,.display-settings').count(),0);
 assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio-analytics-consent-v1')),null);
 for(const width of [320,390,768,1024,1440,1920,3840]) {
  await page.setViewportSize({width,height:1000});
  for(const control of ['language','theme','size','motion','privacy']) {
   await open(page,control);
   assert.equal(await page.locator('.utility-panel').count(),1);
   const box=await bounds(page);assert.ok(box.x>=0&&box.y>=0&&box.right<=width+1&&box.bottom<=1001,JSON.stringify(box));
   assert.ok(await page.locator('.utility-panel').evaluate(el=>el.contains(document.activeElement)));
   if(width===1440)await page.screenshot({path:`${out}/desktop-${control}.png`});
   await page.keyboard.press('Escape');assert.equal(await page.locator('.utility-panel').count(),0);
   assert.equal(await page.locator(`[data-control="${control}"]`).evaluate(el=>el===document.activeElement),true);
  }
  const targets=await page.locator('.utility-controls > button').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height];}));assert.ok(targets.every(([w,h])=>w>=44&&h>=44));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.layouts.push({locale:'en',width,targets});
 }
 check('all five panels: seven widths, viewport bounds, touch targets, single panel, Escape and focus restoration');
 await page.setViewportSize({width:1440,height:1000});
 const before=await page.locator('.utility-rail').boundingBox();await page.evaluate(()=>scrollTo(0,1500));const after=await page.locator('.utility-rail').boundingBox();assert.equal(Math.round(before.y),Math.round(after.y));check('fixed while scrolling');
 await open(page,'language');assert.equal(await page.locator('.utility-panel option').count(),11);
 await page.locator('[data-control="theme"]').click();assert.equal(await page.locator('.utility-panel select option').count(),4);
 await page.locator('.utility-panel select').selectOption('dark');await page.screenshot({path:`${out}/dark-theme.png`});
 await page.locator('.utility-panel select').selectOption('light');await page.screenshot({path:`${out}/light-theme.png`});
 await page.locator('[data-control="size"]').click();assert.equal(await page.locator('.utility-panel option').count(),3);
 await page.locator('.utility-panel select').selectOption('largest');await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('html').getAttribute('data-text-size'),'largest');assert.equal(await page.locator('html').getAttribute('data-theme-preference'),'light');
 await open(page,'size');await page.locator('.utility-panel select').selectOption('default');await page.keyboard.press('Escape');check('all theme/text choices, direct panel replacement and persisted preferences');
 await open(page,'motion');assert.ok(await page.locator('.utility-panel select').isDisabled());assert.equal(await page.locator('.utility-panel select').inputValue(),'paused');await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'motion');await page.locator('.utility-panel select').selectOption('paused');await page.keyboard.press('Escape');await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-control="motion"]').getAttribute('aria-label').includes('Paused'));check('effective reduced-motion state and saved scenery pause');
 await open(page,'privacy');assert.equal(await page.locator('.utility-panel input').isChecked(),false);
 assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio-analytics-consent-v1')),null);
 await page.locator('.utility-panel input').check();await page.reload({waitUntil:'networkidle'});await open(page,'privacy');assert.ok(await page.locator('.utility-panel input').isChecked());await page.locator('.utility-panel input').uncheck();assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio-analytics-consent-v1')),'denied');
 await page.mouse.click(10,300);assert.equal(await page.locator('.utility-panel').count(),0);check('privacy panel never grants consent; explicit opt-in, refresh, withdrawal and outside dismissal');
 for(const signal of ['doNotTrack','globalPrivacyControl']) {
  await page.addInitScript(signal=>Object.defineProperty(navigator,signal,{value:signal==='doNotTrack'?'1':true,configurable:true}),signal);
  await page.reload({waitUntil:'networkidle'});await open(page,'privacy');assert.ok((await page.locator('.utility-current').textContent()).includes('suppressed'));await page.keyboard.press('Escape');
 }
 check('DNT/GPC effective state distinguished');
 for(const locale of ['ar','ta','ja']) {
  for(const width of [390,1440]) {
   await page.setViewportSize({width,height:1000});await page.goto(`${base}/${locale}/`,{waitUntil:'networkidle'});
   const rail=await page.locator('.utility-rail').boundingBox();assert.ok(locale==='ar'?rail.x<30:rail.x>width/2);
   await open(page,'language');const box=await bounds(page);assert.ok(box.x>=0&&box.right<=width+1);
   if(locale==='ja'){await page.locator('.reading-control select').selectOption('vertical');assert.equal(await page.locator('.utility-rail').evaluate(el=>getComputedStyle(el).writingMode),'horizontal-tb');}
   await page.screenshot({path:`${out}/${locale}-${width}.png`});await page.locator('.utility-panel select[aria-label]').first().selectOption('en');await page.waitForURL('**/en/');assert.equal(await page.locator('.utility-panel').count(),0);
   report.layouts.push({locale,width});
  }
 }
 check('Arabic left docking, Tamil, Japanese vertical mode and successful locale dismissal');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/en/',{waitUntil:'networkidle'});await page.screenshot({path:`${out}/mobile-collapsed.png`});
 await page.locator('.utility-entry').click();await page.screenshot({path:`${out}/mobile-expanded.png`});await open(page,'theme');await page.locator('.mobile-menu summary').click();assert.equal(await page.locator('.utility-panel').count(),0);assert.equal(await page.locator('.utility-rail').isVisible(),false);await page.keyboard.press('Escape');check('mobile collapse/expand and mobile navigation coexistence');
 await page.setViewportSize({width:1440,height:1000});
 for(const route of ['mmcats-modern','naae','multilingual-engineering','pace-rag-case-study','no-two-mondays','incident-zero','incident-zero/defence','work-with-me','404.html']) {
  await page.goto(`${base}/en/${route}${route.endsWith('.html')?'':'/'}`,{waitUntil:'networkidle'});assert.equal(await page.locator('.utility-rail').count(),1);await open(page,'theme');await page.keyboard.press('Escape');
 }
 check('single functional rail across all deep routes and custom 404 artifact');
 await page.goto(base+'/en/work-with-me/?source=rail#contact',{waitUntil:'networkidle'});await open(page,'language');await page.locator('.utility-panel select').focus();await page.locator('.utility-panel select').selectOption('fr');await page.waitForURL('**/fr/work-with-me/?source=rail#contact');assert.equal(await page.locator('[data-control="language"]').evaluate(el=>el===document.activeElement),true);assert.ok(await page.locator('.translation-original').isVisible());await page.locator('.translation-original').click();await page.waitForURL('**/en/work-with-me/?source=rail#contact');await page.goBack();await page.waitForFunction(()=>document.documentElement.lang==='fr');await page.goForward();await page.waitForFunction(()=>document.documentElement.lang==='en');check('equivalent deep route, query, fragment, English-original link and history');
 const failure=await browser.newContext({locale:'en'});const fp=await failure.newPage();await fp.goto(base+'/en/',{waitUntil:'networkidle'});await fp.route('**/fr-*.js',r=>r.abort());await open(fp,'language');await fp.locator('.utility-panel select').selectOption('fr');await fp.getByRole('alert').waitFor();assert.ok(await fp.locator('.utility-panel').isVisible());assert.equal(await fp.locator('.utility-panel select').inputValue(),'en');await fp.unroute('**/fr-*.js');await fp.locator('.utility-panel select').selectOption('de');await fp.waitForURL('**/de/');await failure.close();check('failed locale download retains recoverable panel and successful alternative closes it');
 if(process.env.QA_AXE) {
  await page.goto(base+'/en/',{waitUntil:'networkidle'});await open(page,'privacy');await page.addScriptTag({path:process.env.QA_AXE});const result=await page.evaluate(async()=>window.axe.run(document.querySelector('.utility-rail')));report.axe=result.violations;assert.equal(report.axe.length,0,JSON.stringify(report.axe));check('axe utility subtree: zero violations');
 }
 assert.equal(report.errors.length,0,JSON.stringify(report.errors));assert.equal(report.requests.length,0);
 await context.close();
 const files=await import('node:fs/promises');const assets=await files.readdir('dist/assets');const entry=assets.find(n=>/^index-.*\.js$/.test(n));report.entryBytes=(await stat('dist/assets/'+entry)).size;report.panelBytes=(await stat('dist/assets/'+assets.find(n=>/^UtilityPanel-.*\.js$/.test(n)))).size;assert.ok(report.entryBytes<215000);
 report.status='passed';
} finally {await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
