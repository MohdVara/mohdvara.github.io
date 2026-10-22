// Production-preview regressions; uses the existing external Playwright/axe install.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4185';
const output=process.env.QA_OUTPUT||'output/playwright/ux-localization-v1/browser';
await mkdir(output,{recursive:true});
const report={switches:[],dismissal:[],journeys:[],layouts:[],accessibility:[],errors:[],requests:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
for(const width of [320,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push({url:page.url(),message:e.message}));
 page.on('request',r=>{if(/posthog|api.openai.com|translate.googleapis.com|images\/naae/.test(r.url()))report.requests.push(r.url());});
 await page.goto(`${base}/en/multilingual-engineering/?source=ux#direction-demo`,{waitUntil:'networkidle'});
 for(const locale of ['ar','en','ms','en','ja','ar','ta']){
  await page.locator('.language-control summary').click();const select=page.locator('.language-panel > label:first-child select');await select.focus();await select.selectOption(locale);
  await page.waitForFunction(locale=>document.documentElement.dataset.localeReady===locale,locale);
  await page.waitForFunction(()=>!document.querySelector('.language-control').open);
  assert.equal(await page.locator('.language-control summary').evaluate(el=>el===document.activeElement),true,'focus restored to trigger');
  assert.equal(new URL(page.url()).pathname,`/${locale}/multilingual-engineering/`);assert.equal(new URL(page.url()).search,'?source=ux');assert.equal(new URL(page.url()).hash,'#direction-demo');
  assert.equal(await select.inputValue(),locale);assert.equal(await page.locator('html').getAttribute('dir'),locale==='ar'?'rtl':'ltr');
  report.switches.push({width,locale,url:page.url(),closed:true,focus:'summary'});
 }
 await page.goBack();await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='ar');await page.goForward();await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='ta');
 await page.locator('.translation-original').click();await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');assert.equal(new URL(page.url()).hash,'#direction-demo');
 // Keyboard activation of English-original after selection, with no manual close.
 await page.locator('.language-control summary').click();await page.locator('.language-panel > label:first-child select').focus();await page.locator('.language-panel > label:first-child select').selectOption('ar');await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='ar'&&!document.querySelector('.language-control').open);
 await page.locator('.translation-original').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
 await page.locator('.language-control summary').click();await page.locator('.language-panel > label:first-child select').focus();await page.keyboard.press('Escape');assert.equal(await page.locator('.language-control').getAttribute('open'),null);assert.ok(await page.locator('.language-control summary').evaluate(el=>el===document.activeElement));
 await page.locator('.language-control summary').click();await page.locator('h1').click();assert.equal(await page.locator('.language-control').getAttribute('open'),null);
 if(width<768){await page.locator('.language-control summary').click();await page.locator('.mobile-menu summary').click();assert.equal(await page.locator('.language-control').getAttribute('open'),null);assert.ok(await page.locator('.mobile-menu').getAttribute('open')!==null);await page.keyboard.press('Escape');}
 report.dismissal.push({width,escape:true,outside:true,englishPointer:true,englishKeyboard:true,history:true});
 await page.goto(`${base}/ja/multilingual-engineering/`,{waitUntil:'networkidle'});await page.locator('.language-control summary').click();await page.locator('.reading-control select').selectOption('vertical');assert.equal(await page.locator('#direction-demo select').evaluate(el=>getComputedStyle(el).writingMode),'horizontal-tb');await page.keyboard.press('Escape');
 await page.goto(`${base}/en/`,{waitUntil:'networkidle'});await page.locator('.actions a[href="#work"]').click();assert.equal(new URL(page.url()).hash,'#work');report.journeys.push({width,task:'professional delivery',clicks:1,destination:page.url()});
 await page.locator('.hero-projects a[href="#public-engineering"]').click();assert.equal(new URL(page.url()).hash,'#public-engineering');report.journeys.push({width,task:'independent engineering',clicks:1,destination:page.url()});
 const homeRequests=report.requests.filter(url=>url.includes('/images/naae/'));assert.deepEqual(homeRequests,[],'home paths do not fetch NAAE artwork');
 await page.screenshot({path:`${output}/independent-${width}.png`});
 await page.goto(`${base}/en/`,{waitUntil:'networkidle'});await page.screenshot({path:`${output}/home-${width}.png`});
 for(const [route,id] of [['mmcats-modern','mmcats-modern'],['naae','naae'],['multilingual-engineering','multilingual-engineering'],['pace-rag-case-study','pace'],['no-two-mondays','ntm']]){
  await page.goto(`${base}/en/${route}/`,{waitUntil:'networkidle'});await page.locator(`#quick-${id}`).waitFor();
  const quick=page.locator('.case-quick-read');const links=quick.locator('nav a');assert.ok(await links.count()>=2);
  for(const a of await links.all()){const href=await a.getAttribute('href');assert.ok(await page.locator(href).count(),href);}
  const architecture=links.filter({hasText:/Architecture/}).first();await architecture.focus();await page.keyboard.press('Enter');
  const target=page.locator(new URL(page.url()).hash);await page.waitForTimeout(100);const box=await target.boundingBox();const header=await page.locator('.site-header').boundingBox();assert.ok(box.y>=header.height-2,'anchor not covered by sticky header');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.layouts.push({width,route,actions:await links.allTextContents(),anchorTop:box.y});
  await page.goto(`${base}/en/${route}/`,{waitUntil:'networkidle'});await page.screenshot({path:`${output}/${id}-${width}.png`});
 }
 // Clear request slice for next context's homepage assertion; full requests remain in context evidence below.
 report.requests=report.requests.filter(url=>!url.includes('/images/naae/'));
 await context.close();
}
// Lazy locale load failure must retain current locale, open disclosure and usable select.
const failureContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const failurePage=await failureContext.newPage();await failurePage.route('**/assets/ar-*.js',r=>r.abort());await failurePage.goto(`${base}/en/multilingual-engineering/`,{waitUntil:'networkidle'});await failurePage.locator('.language-control summary').click();await failurePage.locator('.language-panel > label:first-child select').focus();await failurePage.locator('.language-panel > label:first-child select').selectOption('ar');await failurePage.getByRole('alert').waitFor();assert.equal(await failurePage.locator('html').getAttribute('lang'),'en');assert.notEqual(await failurePage.locator('.language-control').getAttribute('open'),null);report.dismissal.push({task:'failed locale load',keepsOpen:true,locale:'en'});await failureContext.close();
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();
for(const locale of ['en','ms','ar','ta','ja','zh-Hans','es','fr','de','pt-BR','hi']){
 await page.goto(`${base}/${locale}/multilingual-engineering/`,{waitUntil:'networkidle'});await page.waitForFunction(l=>document.documentElement.dataset.localeReady===l,locale);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${width} overflow`);report.layouts.push({locale,width,noOverflow:true});}
 if(locale!=='en')assert.equal(await page.locator('.translation-original').getAttribute('href'),'/en/multilingual-engineering/');
 if(['ms','ar','ta','ja','zh-Hans'].includes(locale)){await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.dataset.textSize='largest');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${output}/${locale}-largest.png`});}
 if(process.env.QA_AXE_PATH&&['en','ar','ja','ta'].includes(locale)){
  await page.addScriptTag({content:await readFile(process.env.QA_AXE_PATH,'utf8')});const a=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('main'));return{violations:r.violations.map(x=>({id:x.id,targets:x.nodes.map(n=>n.target)})),incomplete:r.incomplete.map(x=>({id:x.id,count:x.nodes.length}))}});report.accessibility.push({locale,...a});assert.deepEqual(a.violations,[]);
 }
}
await page.goto(`${base}/en/#case-insurance`,{waitUntil:'networkidle'});await page.locator('#quick-commercial-insurance').waitFor();await page.locator('.case-quick-read a').first().click();assert.equal(new URL(page.url()).hash,'#delivery-insurance');report.journeys.push({task:'commercial delivery decision',passed:true});
await page.goto(`${base}/en/work-with-me/`,{waitUntil:'networkidle'});assert.ok(await page.locator('a[href="mailto:mohd@paramasvara.online"]').count());assert.ok(await page.locator('a[href="https://cal.com/mohd-paramasvara/discovery"]').count());report.journeys.push({task:'consulting contact alternatives',submitted:false});
await context.close();assert.deepEqual(report.errors,[]);
}finally{await browser.close();await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({switches:report.switches.length,dismissal:report.dismissal.length,layouts:report.layouts.length,journeys:report.journeys.length,accessibility:report.accessibility.length,errors:report.errors}));
