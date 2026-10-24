// Local acceptance checks for PALDA copy, disclosure reuse and evidence boundaries.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4195';
const output=process.env.QA_OUTPUT||'output/playwright/palda-v1/focused';
await mkdir(output,{recursive:true});
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const source=await readFile('src/content.ts','utf8');
const ownership=[...source.matchAll(/\["My ownership", "([^"]*final architectural decision authority[^"]*)"\]/g)].map(m=>m[1]);
assert.equal(ownership.length,3);
const outcomeNeedles={insurance:['up to 12 insurers','15,000 distinct users within one hour','not a concurrency, request-throughput or load-test measurement'],campus:['older supported browsers','AWS Chime and Amazon S3','meeting-activity telemetry'],wensymes:['External applications were integrated through APIs','Authentication and permission checks','modular service boundaries']};
const hrSource=source.slice(source.indexOf('id: "hr"'),source.indexOf('id: "rental"'));
const hrOutcome=hrSource.match(/result:\s*"([^"]+)"/)[1];
const hrEngineering=hrSource.match(/"Engineering",\s*"([^"]+)"/)[1];
const hero=(await readFile('src/App.tsx','utf8')).match(/text\("(Trusted with final architectural decisions\.[^"]+)"\)/)[1];
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={scope:'Local Chrome emulation; no human-language, screen-reader, physical-device or real-user performance certification.',layouts:[],localizedOwnership:[],noJavaScript:[],axe:[],errors:[],requests:[],journeys:[]};
try {
 for(const width of [320,375,390,430,768,1024,1440,1920,3840])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('requestfailed',r=>report.requests.push({url:r.url(),failure:r.failure()}));
  await page.goto(`${base}/en/`,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
  await page.evaluate(({theme})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.textSize='largest';},{theme});
  await page.evaluate(()=>document.fonts.ready);
  for(const id of ['insurance','wensymes','campus']){
   const card=page.locator(`#case-${id}`),summary=card.locator('.case-details > summary');
   await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>document.querySelector(`#case-${id} details`).open,id);
   const quick=card.locator('.case-quick-read'),copy=await quick.innerText();
   assert(copy.includes('final architectural decision authority'));assert(copy.includes('informed consensus'));
   assert.equal((await card.innerText()).split('final architectural decision authority').length-1,1,'ownership must render once');
   for(const needle of outcomeNeedles[id])assert((await card.innerText()).includes(needle),`${id}: missing ${needle}`);
   assert.equal(await card.locator('dt').filter({hasText:/^(Ownership|My contribution|Role & ownership)$/}).count(),0);
   assert.equal(await page.locator('.case-details[open]').count(),1);
   if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)){report.layoutFailure=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,styles:[...document.styleSheets].map(s=>s.href),hero:getComputedStyle(document.querySelector('.hero')).display,links:[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.outerHTML),resources:performance.getEntriesByType('resource').map(r=>r.name)}));await page.screenshot({path:`${output}/failure.png`});throw Error(`${id} ${width} ${theme} overflow`);}
   if(width===390&&theme==='light'||width===1440&&theme==='dark'){await quick.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/${id}-${width}-${theme}.png`});}
   report.layouts.push({id,width,theme,text:'largest',reducedMotion:true,keyboardDisclosure:true,overflow:false});
  }
  await page.locator('#case-hr summary').click();const hr=page.locator('#case-hr');assert(!(await hr.innerText()).includes('decision authority'));assert((await hr.innerText()).includes(hrOutcome));assert((await hr.innerText()).includes(hrEngineering));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.layouts.push({id:'hr',width,theme,text:'largest',keyboardDisclosure:true,overflow:false});
  if(width===390&&theme==='light'||width===1440&&theme==='dark'){await hr.locator('.case-body').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/hr-${width}-${theme}.png`});}
  await page.goto(`${base}/en/work-with-me/`);await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
  assert((await page.locator('.engagement-types').innerText()).includes('costs and risks'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  report.layouts.push({id:'work-with-me',width,theme,text:'largest',overflow:false});
  if(width===390&&theme==='light'||width===1440&&theme==='dark')await page.screenshot({path:`${output}/work-with-me-${width}-${theme}.png`,fullPage:true});
  await context.close();
 }
 for(const item of registry){
  const catalog=JSON.parse(await readFile(`src/i18n/locales/${item.locale}.json`,'utf8'));
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('requestfailed',r=>report.requests.push({url:r.url(),failure:r.failure()}));
  await page.goto(`${base}/${item.locale}/`,{waitUntil:'networkidle'});await page.waitForFunction(l=>document.documentElement.dataset.localeReady===l,item.locale);
  assert.equal(await page.locator('.hero-description').innerText(),catalog[hero]);
  if(item.locale==='en')report.resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>({name:e.name,transferSize:e.transferSize,decodedBodySize:e.decodedBodySize})));
  for(const[id,key]of [['insurance',ownership[1]],['wensymes',ownership[2]],['campus',ownership[0]]]){
   await page.locator(`#case-${id} summary`).click();
   assert((await page.locator(`#case-${id} .case-quick-read`).innerText()).includes(catalog[key]));
   assert.equal((await page.locator(`#case-${id}`).innerText()).split(catalog[key]).length-1,1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.setViewportSize({width:320,height:844});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${item.locale} ${id} 320px overflow`);
   await page.setViewportSize({width:390,height:844});
   report.localizedOwnership.push({locale:item.locale,id,widths:[320,390],translated:true,once:true});
  }
  await page.locator('#case-hr summary').click();
  assert((await page.locator('#case-hr').innerText()).includes(catalog[hrOutcome]));assert((await page.locator('#case-hr').innerText()).includes(catalog[hrEngineering]));
  for(const width of [320,390]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  report.localizedOwnership.push({locale:item.locale,id:'hr',widths:[320,390],translated:true});
  if(['en','ar','ta','ja','zh-Hans'].includes(item.locale)&&process.env.QA_AXE){
   await page.addScriptTag({path:process.env.QA_AXE});
   const result=await page.evaluate(async()=>window.axe.run({include:[[".hero-description"],["#case-insurance"],["#case-wensymes"],["#case-campus"],["#case-hr"]]}));
   report.axe.push({locale:item.locale,violations:result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:result.incomplete.map(v=>v.id)});
   assert.equal(result.violations.length,0);
  }
  await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),p=await nojs.newPage();await p.goto(`${base}/${item.locale}/`);
  assert.equal(await p.locator('.hero-description').innerText(),catalog[hero]);
  for(const[id,key]of [['insurance',ownership[1]],['wensymes',ownership[2]],['campus',ownership[0]]]){await p.locator(`#case-${id} summary`).click();assert((await p.locator(`#case-${id} .case-quick-read`).innerText()).includes(catalog[key]));}
  await p.locator('#case-hr summary').click();assert((await p.locator('#case-hr').innerText()).includes(catalog[hrEngineering]));
  report.noJavaScript.push(item.locale);await nojs.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 for(const id of ['insurance','wensymes','campus','hr']){
  await page.goto(`${base}/en/#case-${id}`);await page.waitForFunction(id=>document.querySelector(`#case-${id} details`)?.open,id);
  if(id==='hr')assert((await page.locator('#case-hr').innerText()).includes(hrEngineering));
  else assert((await page.locator(`#case-${id} .case-quick-read`).innerText()).includes('decision authority'));
  await page.reload();await page.waitForFunction(id=>document.querySelector(`#case-${id} details`)?.open,id);
  report.journeys.push({id,deepLink:true,refresh:true});
 }
 await page.goto(`${base}/en/`,{waitUntil:'networkidle'});report.requests=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name));
 assert(!report.requests.some(url=>/phaser|GameShell|DefenceRoute|images\/naae\//i.test(url)));
 await page.screenshot({path:`${output}/hero-1440.png`});await context.close();
 assert.deepEqual(report.errors,[]);
} finally {await browser.close();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({layouts:report.layouts.length,localizedOwnership:report.localizedOwnership.length,noJavaScript:report.noJavaScript.length,axeScans:report.axe.length,violations:report.axe.flatMap(x=>x.violations).length,errors:report.errors.length,journeys:report.journeys.length}));
