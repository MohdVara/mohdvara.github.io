import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium}=require('playwright');
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const base=process.env.QA_URL || 'http://127.0.0.1:4173';
const out=process.env.QA_OUTPUT || 'output/playwright/calendar';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={configurations:[],layouts:[],scenarios:[],errors:[]};
async function openSettings(page){
 const entry=page.locator('.utility-entry');
 if(await entry.isVisible() && await entry.getAttribute('aria-expanded')==='false')await entry.click();
 const language=page.locator('[data-control="language"]');
 if(await language.getAttribute('aria-expanded')!=='true')await language.click();
 const select=page.locator('select[aria-describedby="calendar-display-help"]');
 await select.waitFor();return select;
}
const observe=page=>{page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/hydr|React error|did not match/i.test(m.text()))report.errors.push(m.text());});};
try {
 for(const {locale,calendar} of registry){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();observe(page);
  await page.goto(`${base}/${locale}/`,{waitUntil:'networkidle'});
  const before=await page.locator('#experience').innerText();
  let select=await openSettings(page);assert.equal(await select.inputValue(),'cultural');
  report.configurations.push({locale,mode:'cultural'});
  // A document marker proves mode updates do not reload the page.
  await page.evaluate(()=>window.calendarQaMarker=42);
  if(locale==='en'){await select.focus();await page.keyboard.press('g');await page.keyboard.press('Tab');}
  else await select.selectOption('gregorian');
  await page.waitForFunction(()=>document.querySelector('select[aria-describedby="calendar-display-help"]').value==='gregorian');
  await page.waitForFunction(()=>localStorage.getItem('portfolio.calendar.v1')==='gregorian');
  assert.equal(await page.evaluate(()=>window.calendarQaMarker),42);
  const after=await page.locator('#experience').innerText();
  if(calendar!=='gregory')assert.notEqual(before,after,`${locale}: mounted dates update`);
  report.configurations.push({locale,mode:'gregorian'});
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});select=await openSettings(page);
   const dims=await select.boundingBox();assert.ok(dims.height>=44);assert.ok(dims.x>=-1&&dims.x+dims.width<=width+1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${width}: no page overflow`);
   report.layouts.push({locale,width});
  }
  if(['ar','ta','ja','zh-Hans'].includes(locale)){
   await page.evaluate(()=>window.dispatchEvent(new CustomEvent('text-size-preference',{detail:'largest'})));
   for(const theme of ['light','dark']){
    await page.evaluate(value=>window.dispatchEvent(new CustomEvent('theme-preference',{detail:value})),theme);
    for(const width of [320,390,768,1440]){
     await page.setViewportSize({width,height:1000});select=await openSettings(page);
     if(['ja','zh-Hans'].includes(locale))for(const writing of ['horizontal','vertical']){
      await page.locator('.reading-control select').selectOption(writing);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     }
     const box=await select.boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     report.layouts.push({locale,width,theme,textSize:'largest'});
    }
   }
   await page.screenshot({path:`${out}/${locale}-settings.png`});
  }
  await page.reload({waitUntil:'networkidle'});assert.equal(await (await openSettings(page)).inputValue(),'gregorian');
  await page.goto(`${base}/${locale}/no-two-mondays/`,{waitUntil:'networkidle'});
  assert.equal(await (await openSettings(page)).inputValue(),'gregorian');
  await page.goBack({waitUntil:'networkidle'});assert.equal(await (await openSettings(page)).inputValue(),'gregorian');
  await page.goForward({waitUntil:'networkidle'});assert.equal(await (await openSettings(page)).inputValue(),'gregorian');
  console.log(`PASS calendar ${locale}`);
  report.scenarios.push(`${locale}: refresh, lazy case-study hydration, navigation, back/forward`);
  await context.close();
 }
 // Language switching preserves the independent preference and route.
 const context=await browser.newContext();const page=await context.newPage();observe(page);
 await page.addInitScript(()=>localStorage.setItem('portfolio.calendar.v1','gregorian'));
 await page.goto(base+'/ar/',{waitUntil:'networkidle'});await openSettings(page);
 await page.locator('select[aria-label]').first().selectOption('ta');
 await page.waitForURL('**/ta/');assert.equal(await (await openSettings(page)).inputValue(),'gregorian');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-control="language"]').evaluate(el=>el===document.activeElement),true);
 report.scenarios.push('Arabic to Tamil switch preserves mode; Escape restores focus');await context.close();
 for(const storage of ['invalid','throw']){
  const c=await browser.newContext();const p=await c.newPage();observe(p);
  await p.addInitScript(kind=>{if(kind==='invalid')localStorage.setItem('portfolio.calendar.v1','bogus');else{Storage.prototype.getItem=()=>{throw new Error('disabled')};Storage.prototype.setItem=()=>{throw new Error('disabled')};}},storage);
  await p.goto(base+'/ja/',{waitUntil:'networkidle'});const select=await openSettings(p);assert.equal(await select.inputValue(),'cultural');
  await select.selectOption('gregorian');await p.waitForFunction(()=>document.querySelector('select[aria-describedby="calendar-display-help"]').value==='gregorian');assert.equal(await select.inputValue(),'gregorian');report.scenarios.push(`storage ${storage}: safe rendering and selection`);await c.close();
 }
 assert.deepEqual(report.errors,[]);
 console.log(JSON.stringify({configurations:report.configurations.length,layouts:report.layouts.length,scenarios:report.scenarios.length,errors:report.errors},null,2));
} finally {await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
