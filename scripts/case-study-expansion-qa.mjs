import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium}=require('playwright');
const axe=await readFile(process.env.QA_AXE_PATH,'utf8');
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const routes=['mmcats-modern','naae','multilingual-engineering'];
const base=process.env.QA_URL || 'http://127.0.0.1:4173';
const output=process.env.QA_OUTPUT || 'output/playwright/case-study-expansion';
await mkdir(output,{recursive:true});
const freshReport={routes:[],layouts:[],accessibility:[],interactions:[],errors:[],limits:['No actual screen-reader, physical-device or fluent editorial review.','Axe incomplete results require contextual review; zero violations is not certification.']};
const report=process.env.QA_INTERACTIONS_ONLY ? JSON.parse(await readFile(`${output}/report.json`,'utf8')) : freshReport;
report.interactions=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 if(!process.env.QA_INTERACTIONS_ONLY) for(const {locale,direction} of registry){
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(`${locale}: ${error.message}`));
  for(const route of routes){
   await page.goto(`${base}/${locale}/${route}/`);
   await page.locator(`#quick-${route}`).waitFor();
   await page.waitForFunction(locale=>document.documentElement.dataset.localeReady===locale,locale);
   // Locale readiness can precede the lazy case module's hydrated heading.
   await page.locator('h1').waitFor({state:'visible'});
   assert.equal(await page.locator('html').getAttribute('dir'),direction);
   assert.equal(await page.locator('h1').count(),1);
   if(locale!=='en'){
    assert.ok(await page.locator('.translation-notice').isVisible());
    assert.equal(await page.locator('.translation-original').getAttribute('href'),`/en/${route}/`);
   }
   report.routes.push({locale,route,direction,canonical:await page.locator('link[rel=canonical]').getAttribute('href')});
   for(const image of await page.locator('.engineering-evidence img').all()){
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async img=>{await img.decode();if(img.naturalWidth!==1440||img.naturalHeight!==900)throw Error('Evidence image dimensions');});
    assert.equal(await image.getAttribute('loading'),'lazy');
    assert.ok(await image.getAttribute('alt'));
    assert.ok(await image.locator('..').locator('figcaption').innerText());
   }
   await page.evaluate(()=>scrollTo(0,0));
   if(['en','ar','ta','ja'].includes(locale)){
    for(const width of [320,390,768,1280,1920,3840]){
     await page.setViewportSize({width,height:1000});
     const measure=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
     report.layouts.push({locale,route,...measure});
     assert.ok(measure.scroll<=width+1,`${locale}/${route}/${width} overflow ${measure.scroll}`);
    }
    await page.setViewportSize({width:1280,height:900});
    for(const theme of ['light','dark']){
     await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
     await page.addScriptTag({content:axe});
     const result=await page.evaluate(async()=>{const a=await window.axe.run(document.querySelector('main'));return{violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:a.incomplete.map(v=>({id:v.id,count:v.nodes.length}))}});
     report.accessibility.push({locale,route,theme,...result});
     assert.deepEqual(result.violations,[],`${locale}/${route}/${theme} accessibility`);
    }
   }
  }
  await context.close();
  console.log(`${locale}: routes, direction and applicable layout/a11y checks passed`);
 }
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto(`${base}/en/naae/`);await page.locator('#quick-naae').waitFor();
 await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
 const stages=page.locator('.evolution-controls fieldset');
 await stages.nth(1).locator('input[value="2"]').check();
 await stages.nth(0).locator('input[value="0"]').focus();await page.keyboard.press('ArrowRight');
 assert.equal(await stages.nth(0).locator('input:checked').inputValue(),'1');
 const slider=page.locator('.evolution-controls input[type=range]');await slider.focus();await page.keyboard.press('ArrowRight');
 assert.equal(await slider.inputValue(),'125');
 await page.locator('.evolution-grid details').first().locator('summary').click();
 await page.locator('.evolution-viewport').first().focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.evolution-viewport').scrollLeft>0);
 assert.equal(await page.locator('.evolution-explorer').evaluate(el=>el.getAnimations({subtree:true}).length),0);
 await page.screenshot({path:`${output}/naae-desktop.png`,fullPage:true});
 await page.screenshot({path:`${output}/naae-viewer-desktop.png`});
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`${output}/naae-mobile.png`,fullPage:true});
 await page.screenshot({path:`${output}/naae-viewer-mobile.png`});
 await page.locator('.evolution-controls button').click();assert.equal(await slider.inputValue(),'100');
 report.interactions.push('Native stage radios, keyboard range zoom, focused arrow scrolling, configuration disclosure, reset and reduced motion passed.');
 await page.route('**/images/naae/*.png',route=>route.abort());
 await page.goto(`${base}/en/naae/`);await page.locator('.evolution-viewport').first().scrollIntoViewIfNeeded();await page.locator('.evolution-missing').first().waitFor();
 assert.ok(await page.locator('.evolution-grid details').first().isVisible());
 report.interactions.push('Missing image fallback preserves configuration and milestone text.');
 await page.unroute('**/images/naae/*.png');
 await page.goto(`${base}/ar/multilingual-engineering/`);await page.locator('#quick-multilingual-engineering').waitFor();
 await page.locator('#direction-demo select').selectOption('ar');assert.equal(await page.locator('.direction-sample').getAttribute('dir'),'rtl');
 await page.locator('#direction-demo select').selectOption('ja');assert.equal(await page.locator('.direction-sample').getAttribute('dir'),'ltr');
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:`${output}/multilingual-ar-mobile.png`,fullPage:true});
 await page.screenshot({path:`${output}/multilingual-ar-viewport.png`});
 await page.evaluate(()=>document.documentElement.dataset.textSize='largest');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('.translation-original').click();await page.waitForURL('**/en/multilingual-engineering/');
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 report.interactions.push('RTL/LTR direction samples, Arabic largest text and matching English-original navigation passed.');
 await page.goto(`${base}/ja/multilingual-engineering/`);await page.locator('#quick-multilingual-engineering').waitFor();
 await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='ja');
 const entry=page.locator('.utility-entry');
 if(await entry.isVisible() && await entry.getAttribute('aria-expanded')==='false')await entry.click();
 await page.locator('[data-control=language]').click();
 await page.locator('.reading-control select').selectOption('vertical');
 await page.waitForFunction(()=>document.documentElement.dataset.writingMode==='vertical');
 assert.equal(await page.locator('#direction-demo select').evaluate(el=>getComputedStyle(el).writingMode),'horizontal-tb');
 await page.goto(`${base}/en/mmcats-modern/`);await page.locator('#quick-mmcats-modern').waitFor();
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:`${output}/mmcats-desktop.png`,fullPage:true});await page.screenshot({path:`${output}/mmcats-viewport.png`});
 assert.deepEqual(report.errors,[]);
 await context.close();
}finally{
 await browser.close();
 await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({routes:report.routes.length,layouts:report.layouts.length,accessibility:report.accessibility.length,interactions:report.interactions.length,errors:report.errors.length}));
