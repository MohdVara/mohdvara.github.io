import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium,webkit}=createRequire(resolve('../pace-rag/package.json'))('playwright');
const AxeBuilder=createRequire(resolve('/private/tmp/pace-qa/package.json'))('@axe-core/playwright').default;
const engine=process.env.QA_BROWSER||'chromium',base=process.env.QA_URL||'http://127.0.0.1:5177';
const output=`output/playwright/pace-v1.6/${engine}`;await mkdir(output,{recursive:true});
const browser=await({chromium,webkit}[engine]).launch();
const report={engine,measuredAt:new Date().toISOString(),layouts:[],noJavaScript:[],errors:[],scope:'Local production preview and browser emulation; no physical-device or actual screen-reader testing, production verification or deployment.'};
const projects={insurance:['event-driven','seven days'],campus:['stakeholders','HRMS document-expiration tracking'],rental:['mobile-friendly','contract PDFs'],wensymes:['system flexibility','organizational headcount']};
try{
 for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  for(const[id,phrases]of Object.entries(projects)){
   await page.goto(`${base}/#case-${id}`);const card=page.locator(`#case-${id}`),details=card.locator('.case-details'),summary=details.locator('summary');
   await page.waitForFunction(id=>document.querySelector(`#case-${id} details`)?.open,id);
   await page.evaluate(({theme})=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.textSize='largest';},{theme});
   await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'24px');
   for(const phrase of phrases)assert((await details.innerText()).includes(phrase));
   assert.equal(await details.locator('dt',{hasText:'Key Engineering Decision'}).count(),1);assert.equal(await details.locator('dt',{hasText:'Delivered Capability'}).count(),1);assert.equal(await card.locator('.project-stack').count(),1);
   await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>!document.querySelector(`#case-${id} details`).open,id);await page.keyboard.press('Enter');await page.waitForFunction(id=>document.querySelector(`#case-${id} details`).open,id);assert.equal(await page.locator('.case-details[open]').count(),1);
   if(id!=='rental')assert.equal(await card.locator('.project-visual').count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   if(width===390&&theme==='light'||width===1440&&theme==='dark'){await details.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/${id}-${width}-${theme}.png`});}
   report.layouts.push({id,width,theme,text:'largest',reducedMotion:true,keyboardDisclosure:true,axeViolations:0,incomplete:audit.incomplete.map(v=>v.id),overflow:false});
  }
  await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();await page.goto(base);
 for(const[id,phrases]of Object.entries(projects)){const details=page.locator(`#case-${id} details`);await details.locator('summary').click();assert(await details.evaluate(e=>e.open));for(const phrase of phrases)assert((await details.innerText()).includes(phrase));report.noJavaScript.push(id);}
 await context.close();assert.deepEqual(report.errors,[]);
}finally{await writeFile(`${output}/results.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(report,null,2));
