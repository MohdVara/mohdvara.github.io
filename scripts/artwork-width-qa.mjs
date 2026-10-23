import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright'),base=process.env.QA_URL||'http://127.0.0.1:4190';
const output=resolve('output/playwright/pme-v1.5/widths');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),report={layouts:[],errors:[]};
try{
 for(const locale of ['en','ar','ja'])for(const width of [390,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await context.addInitScript(()=>localStorage.setItem('portfolio-theme','dark'));const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  for(const route of ['','work-with-me/','no-two-mondays/','mmcats-modern/','naae/','multilingual-engineering/','pace-rag-case-study/','incident-zero/']){
   await page.goto(`${base}/${locale}/${route}`,{waitUntil:'networkidle'});const hosts=page.locator('.ascii-forest,.ascii-river');assert.ok(await hosts.count()>=1);
   const masks=[];
   for(let index=0;index<await hosts.count();index++){const host=hosts.nth(index);await host.scrollIntoViewIfNeeded();await host.locator('canvas').waitFor();await page.waitForFunction(({index,locale})=>{const e=document.querySelectorAll('.ascii-forest,.ascii-river')[index];return e?.dataset.ready==='true'&&e.dataset.locale===locale&&e.dataset.textureStatus==='complete';},{index,locale});const result=await host.evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,viewport:innerWidth,mask:getComputedStyle(e).maskImage,status:e.dataset.textureStatus};});assert.ok(Math.abs(result.left)<2&&Math.abs(result.right-result.viewport)<2,`${route} ${locale} ${width}: ${JSON.stringify(result)}`);assert.equal(result.status,'complete');masks.push(result.mask);report.layouts.push({locale,route,width,index,...result});}
   assert.equal(new Set(masks).size,1,`${route}: opening and ending share the same width mask`);
   if(width===1920&&locale==='en'&&route===''){await page.locator('.hero-environment').screenshot({path:output+'/home-hero.png'});await page.locator('#contact').screenshot({path:output+'/home-contact.png'});}
   if(width===1920&&locale==='ar'&&route==='')await page.locator('#contact').screenshot({path:output+'/ar-contact.png'});
   if(width===1440&&locale==='en'&&route==='work-with-me/')await page.locator('.page-landscape').last().screenshot({path:output+'/work-with-me-ending.png'});
  }
  await context.close();console.log(`PASS ${locale}/${width}: eight routes, opening/ending width and mask parity`);
 }
 assert.deepEqual(report.errors,[]);
}finally{await writeFile(output+'/results.json',JSON.stringify(report,null,2));await browser.close();}
