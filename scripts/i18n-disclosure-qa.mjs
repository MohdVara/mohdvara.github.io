import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8')).filter(item=>!process.env.QA_LOCALES||process.env.QA_LOCALES.split(',').includes(item.locale));
const base=process.env.QA_URL||'http://127.0.0.1:4173';
const report={layouts:[],disclosures:[],errors:[],translationRequests:[],failures:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('output/playwright/pme-disclosure',{recursive:true});
let cursor=0;
try {
 await Promise.all(Array.from({length:3},async()=>{while(cursor<registry.length){
  const item=registry[cursor++];const context=await browser.newContext({viewport:{width:1440,height:900},locale:item.locale,reducedMotion:'reduce',colorScheme:'dark'});const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(`${item.locale} ${page.url()}: ${error.message}`));
  page.on('request',request=>{if(/api\.openai\.com|translate\.googleapis\.com/.test(request.url()))report.translationRequests.push(request.url());});
  for(const path of ['','work-with-me/','no-two-mondays/','pace-rag-case-study/','incident-zero/']){
   await page.goto(`${base}/${item.locale}/${path}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(locale=>document.documentElement.dataset.localeReady===locale,item.locale);
   await page.evaluate(()=>document.fonts.ready);
   for(const [width,height] of [[1366,768],[1440,900],[1920,1080]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(100);
    const data=await page.evaluate(()=>{const q=s=>document.querySelector(s),box=e=>e?.getBoundingClientRect();const hero=q('.hero-environment,.engagement-hero,.ntm-case-hero,.page-landscape-intro');const endings=[...document.querySelectorAll('.contact,.page-landscape-ending,.ntm-evidence')];const ending=endings.at(-1);const h=box(hero);return {heroHeight:h?.height||0,heroBottom:h?.bottom||0,endingHeight:box(ending)?.height||0,headerHeight:box(q('.site-header'))?.height||0,footerHeight:box(q('footer.footer,.iz-footer'))?.height||0,scrollWidth:document.documentElement.scrollWidth,heroOverflow:q('.hero')?getComputedStyle(q('.hero')).overflowY:null};});
    const row={locale:item.locale,path,width,height,...data};report.layouts.push(row);
    if(data.heroBottom>height+2)report.failures.push({issue:"hero height",...row});
    if(data.endingHeight+data.headerHeight>height+2)report.failures.push({issue:"final section height",...row});
    assert.ok(data.scrollWidth<=width+1,`Horizontal overflow: ${JSON.stringify(row)}`);
    if(data.heroOverflow)assert.equal(data.heroOverflow,'visible','Hero must use page scrolling');
   }
   if(item.locale!=='en'){
    const notice=page.locator('.translation-notice');assert.equal(await notice.count(),1);
    assert.equal(await page.locator('.translation-disclosure').getAttribute('open'),null);
    assert.equal(await notice.locator('.translation-original').isVisible(),true);
    await notice.locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await notice.locator('p').first().isVisible(),true);
    assert.equal(await notice.evaluate(el=>getComputedStyle(el).writingMode),'horizontal-tb');
    assert.equal(await notice.evaluate(el=>getComputedStyle(el).direction),item.direction);
    await notice.locator('summary').click();
    assert.equal(await notice.locator('p').first().isVisible(),false);
    report.disclosures.push({locale:item.locale,path,keyboardToggle:true,originalAlwaysVisible:true});
   }else assert.equal(await page.locator('.translation-notice').count(),0);
   if(!path&&['ja','ar','ta'].includes(item.locale))await page.screenshot({path:`output/playwright/pme-disclosure/${item.locale}-desktop.png`});
  }
  if(item.locale!=='en') {
    await page.goto(`${base}/${item.locale}/work-with-me/?source=disclosure-qa#contact`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(locale=>document.documentElement.dataset.localeReady===locale,item.locale);
    const original=page.locator('.translation-original');
    await page.waitForFunction(()=>document.querySelector('.translation-original')?.getAttribute('href')==='/en/work-with-me/?source=disclosure-qa#contact');
    await original.click();await page.waitForURL('**/en/work-with-me/?source=disclosure-qa#contact');
    assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio.locale.v1')),'en');
    assert.equal(await page.locator('.translation-notice').count(),0);
  }
  if(item.locale==='fr') {
    const noScript=await browser.newContext({javaScriptEnabled:false});const staticPage=await noScript.newPage();
    await staticPage.goto(`${base}/fr/incident-zero/`,{waitUntil:'domcontentloaded'});
    const catalog=JSON.parse(await readFile('src/i18n/locales/fr.json','utf8'));
    assert.equal(await staticPage.locator('main noscript').textContent(),catalog['This interactive story requires JavaScript. The engineering portfolio and public source remain available through normal links.']);
    await noScript.close();
  }
  await context.close();console.log(`PASS ${item.locale}: desktop sections and disclosure`);
 }}));
 assert.deepEqual(report.failures,[]);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.translationRequests,[]);
}finally{await writeFile('output/playwright/pme-disclosure/results.json',JSON.stringify(report,null,2));await browser.close();}
