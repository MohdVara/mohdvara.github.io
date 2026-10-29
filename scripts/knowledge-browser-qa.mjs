import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'../pace-rag','package.json'));
const {chromium}=require('playwright');
const {loadFormatting}=await import('./i18n/load-formatting.mjs');
const {calendarDate}=await loadFormatting();
const base=process.env.QA_URL||'http://127.0.0.1:4187';
const lab=process.env.QA_LAB_URL||'http://127.0.0.1:5180/pace-rag/';
const out=process.env.QA_OUTPUT||'output/playwright/pme-v17';await mkdir(out,{recursive:true});
const locales=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const approvedPacket=JSON.parse(await readFile('../pace-rag/content/portfolio/published-synchronization.json','utf8'));
const newQuestions=approvedPacket.answers.filter(a=>a.matchPolicy.intent.startsWith('sync-'));
const revision=JSON.parse(await readFile('src/data/content-revisions.json','utf8'));
const report={layouts:[],assistant:[],errors:[],runtimeGitHubRequests:[],inferenceRequests:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const {locale,direction}of (process.env.QA_ASSISTANT_ONLY?[]:locales))for(const width of [320,375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.setItem('portfolio.calendar.v1','gregorian');});
  const page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(30000);page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{if(/api.github.com|raw.githubusercontent.com/.test(r.url()))report.runtimeGitHubRequests.push(r.url());if(/\/generate|\/session|api.openai.com/.test(r.url()))report.inferenceRequests.push(r.url());});
  await page.route(/api\.github\.com|raw\.githubusercontent\.com/,route=>route.abort());
  await page.goto(base+'/'+locale+'/mmcats-modern/',{waitUntil:'networkidle'});
  await page.waitForFunction(l=>document.documentElement.dataset.localeReady===l,locale);
  assert.equal(await page.locator('html').getAttribute('dir'),direction);
  const times=page.locator('.content-freshness time');assert.equal(await times.count(),2);
  assert.equal(await times.first().getAttribute('datetime'),revision.records['mmcats-modern'].lastMeaningfulRevisionAt);
  assert(await times.last().getAttribute('datetime'));
  const expected=new Intl.DateTimeFormat(locale,{calendar:'gregory',timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(new Date(revision.records['mmcats-modern'].lastMeaningfulRevisionAt.slice(0,10)+'T12:00:00Z'));
  assert((await times.first().innerText()).includes(expected));
  const cultural=calendarDate(revision.records['mmcats-modern'].lastMeaningfulRevisionAt.slice(0,10),locale,'day','cultural');
  const entry=page.locator('.utility-entry');
  if(await entry.isVisible()&&await entry.getAttribute('aria-expanded')==='false')await entry.click();
  const language=page.locator('[data-control="language"]');
  if(await language.getAttribute('aria-expanded')!=='true')await language.click();
  await page.locator('select[aria-describedby="calendar-display-help"]').selectOption('cultural');
  await page.keyboard.press('Escape');
  await page.waitForFunction(expected=>document.querySelector('.content-freshness time')?.textContent.includes(expected),cultural);
  if(width===320)await page.evaluate(()=>{document.documentElement.dataset.textSize='largest';document.documentElement.style.fontSize='150%';});
  const widthActual=await page.evaluate(()=>document.documentElement.scrollWidth);assert(widthActual<=width+2,`${locale}/${width}: ${widthActual}`);
  const writing=await page.locator('.content-freshness').first().evaluate(e=>getComputedStyle(e).writingMode);assert.equal(writing,'horizontal-tb');
  if(['en','ar','ta','ja'].includes(locale))await page.screenshot({path:`${out}/${locale}-${width}.png`,fullPage:false});
  report.layouts.push({locale,width,dir:direction,scrollWidth:widthActual,gregorian:true,cultural:true,largestText:width===320,metadataWritingMode:writing});
  await context.close();
  await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
 }
 // Exercise the exact immutable artifact independently on both local applications.
 for(const [name,url]of [['portfolio',base+'/ar/'],['lab',lab]])for(const assistantWidth of [375,1440]){
  const context=await browser.newContext({viewport:{width:assistantWidth,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(30000);page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{if(/api.github.com|raw.githubusercontent.com/.test(r.url()))report.runtimeGitHubRequests.push(r.url());if(/\/generate|\/session|api.openai.com/.test(r.url()))report.inferenceRequests.push(r.url());});
  await page.route(/api\.github\.com|raw\.githubusercontent\.com/,route=>route.abort());
  await page.goto(url,{waitUntil:'networkidle'});
  if(name==='portfolio'){
    await page.locator('.experience-assistant > summary').click();
  }
  await page.locator('.pace-assistant textarea').waitFor({timeout:30000});
  await page.waitForFunction(()=>!document.querySelector('.pace-assistant button[type=submit]')?.disabled);
  const assetBase=name==='portfolio'?'/pace-rag/':'/pace-rag/';
  const loaded=await page.evaluate(async assetBase=>{const p=await(await fetch(assetBase+'knowledge/portfolio/current.json')).json();return(await fetch(assetBase+'knowledge/portfolio/'+p.manifest)).json();},assetBase);
  const text=await page.locator(name==='portfolio'?'.pace-english-boundary > .content-freshness':'.pace-freshness').innerText();
  const datetime=await page.locator(name==='portfolio'?'.pace-english-boundary > .content-freshness time':'.pace-freshness time').getAttribute('datetime');assert.equal(datetime,loaded.freshness.indexedAt);
  await page.locator('.pace-assistant textarea').fill("How current is PACE-RAG's knowledge?");
  await page.locator('.pace-assistant button[type=submit]').click();
  await page.locator('[data-result-kind="snapshot-metadata"]').waitFor({timeout:30000});
  const answer=await page.locator('[data-result-kind="snapshot-metadata"]').innerText();assert(answer.includes(loaded.corpusVersion));assert(answer.includes('not live GitHub state'));
  assert.equal(await page.locator('.pace-assistant').getAttribute('lang'),'en');assert.equal(await page.locator('.pace-assistant').getAttribute('dir'),'ltr');
  for(const question of newQuestions){
    await page.locator('.pace-assistant textarea').fill(question.canonicalQuestion);
    await page.locator('.pace-assistant button[type=submit]').click();
    await page.waitForFunction(q=>document.querySelector('.pace-answer h3')?.textContent===q,question.canonicalQuestion);
    assert((await page.locator('.pace-answer').innerText()).includes(question.answerText));
    assert.equal(await page.locator('.pace-answer').getAttribute('data-result-kind'),'reviewed-answer');
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  report.assistant.push({name,width:assistantWidth,newReviewedQuestions:newQuestions.length,corpusVersion:loaded.corpusVersion,indexedAt:datetime,display:text,metadataAnswer:answer});
  await page.screenshot({path:out+'/'+name+'-assistant-'+assistantWidth+'.png',fullPage:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.runtimeGitHubRequests,[]);assert.deepEqual(report.inferenceRequests,[]);
 await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');
 console.log(`${report.layouts.length} localized layouts and ${report.assistant.length} loaded-manifest assistant checks passed.`);
}finally{await browser.close();await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');}
