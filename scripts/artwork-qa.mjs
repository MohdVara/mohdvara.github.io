import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const base=process.env.QA_URL||'http://127.0.0.1:4190';
const output=resolve(process.env.QA_OUTPUT||'output/playwright/pme-v1.5/browser');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={layouts:[],switches:[],fallbacks:[],errors:[],resources:[],performance:[],vertical:[]};
const ready=async(p,locale)=>{await p.waitForFunction(locale=>{const e=document.querySelector('.hero-environment > .ascii-forest');return e?.dataset.locale===locale&&e.dataset.ready==='true'&&e.dataset.textureStatus==='complete';},locale);};
async function tracked(extra={}){const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',...extra});await context.addInitScript(()=>{localStorage.setItem('portfolio-theme','dark');window.artworkPerf={longTasks:[],shifts:[]};try{new PerformanceObserver(list=>window.artworkPerf.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});new PerformanceObserver(list=>window.artworkPerf.shifts.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>e.value))).observe({type:'layout-shift',buffered:true});}catch{}});const page=await context.newPage();page.on('pageerror',e=>report.errors.push({url:page.url(),message:e.message}));return {context,page};}
try{
 for(const profile of registry){
  const {context,page}=await tracked();await page.goto(`${base}/${profile.locale}/`,{waitUntil:'networkidle'});await ready(page,profile.locale);
  const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>/artwork\/|fonts\/unicode/.test(e.name)).map(e=>({name:new URL(e.name).pathname,transfer:e.transferSize,encoded:e.encodedBodySize})));
  assert.ok(resources.filter(r=>r.name.includes('/artwork/')&&!r.name.endsWith('manifest.json')).every(r=>r.name.includes('/'+profile.locale+'-')),'Only the selected locale artwork pack is loaded');
  report.resources.push({locale:profile.locale,resources});
  for(const width of [320,375,390,768,1024,1440,1920,3840]){
   await page.setViewportSize({width,height:900});await page.waitForTimeout(180);await ready(page,profile.locale);
   const result=await page.locator('.hero-environment > .ascii-forest').evaluate(e=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,canvases:e.querySelectorAll('canvas').length,...e.dataset}));
   assert.equal(result.overflow,false,`${profile.locale}/${width} overflow`);assert.equal(result.clippedRuns,'0');assert.ok(Number(result.textRuns)>0);assert.equal(result.running,'false');assert.equal(await page.locator('.hero-environment > .ascii-forest').getAttribute('aria-hidden'),'true');
   report.layouts.push({locale:profile.locale,...result});
   if([390,1440].includes(width))await page.locator('.hero-environment').screenshot({path:`${output}/${profile.locale}-${width}.png`});
  }
  await page.setViewportSize({width:1440,height:900});await ready(page,profile.locale);
  if(['ja','zh-Hans'].includes(profile.locale)){
   await page.locator('.language-control summary').click();await page.locator('.reading-control select').selectOption('vertical');await page.locator('.language-control summary').click();
   await page.waitForFunction(locale=>{const e=document.querySelector('.ascii-forest');return e?.dataset.locale===locale&&e.dataset.writingMode==='vertical'&&e.dataset.textureStatus==='complete';},profile.locale);
   await page.locator('.hero-environment').screenshot({path:`${output}/${profile.locale}-vertical.png`});report.vertical.push({locale:profile.locale,...await page.locator('.ascii-forest').evaluate(e=>({...e.dataset}))});
  }
  await page.locator('#contact').scrollIntoViewIfNeeded();await page.locator('.ascii-river[data-ready=true][data-texture-status=complete]').waitFor();
  report.performance.push({locale:profile.locale,...await page.evaluate(()=>({...window.artworkPerf,heap:performance.memory?.usedJSHeapSize,river:{...document.querySelector('.ascii-river').dataset}}))});
  await context.close();console.log(`PASS ${profile.locale}: eight widths, native texture, reduced motion, river`);
 }
 // Locale switching keeps scene geometry and the active conversation subtree.
 {const {context,page}=await tracked();await page.goto(base+'/en/');await ready(page,'en');const signature=await page.locator('.ascii-forest').getAttribute('data-signature');
 for(const locale of ['ar','ta','hi','ja','zh-Hans','fr','en']){await page.locator('.language-control summary').click();const start=Date.now();await page.locator('.language-control select').first().selectOption(locale);await ready(page,locale);assert.equal(await page.locator('.ascii-forest').getAttribute('data-signature'),signature);report.switches.push({locale,elapsedMs:Date.now()-start,...await page.locator('.ascii-forest').evaluate(e=>({...e.dataset}))});}
 await context.close();}
 for(const failure of ['pack','font','worker']){
  const {context,page}=await tracked();await page.route(failure==='pack'?'**/artwork/pme-v1.5/ar-*.json':failure==='font'?'**/fonts/unicode/arabic.woff2*':'**/*layout.worker*.js',route=>route.abort());await page.goto(base+'/ar/');
  await page.locator('.ascii-forest[data-ready=true][data-texture-status=fallback]').waitFor();assert.ok(await page.locator('h1').isVisible());report.fallbacks.push({failure,status:'geometry-only fallback; content available'});await context.close();
 }
 assert.deepEqual(report.errors,[]);
}finally{await writeFile(output+'/results.json',JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({layouts:report.layouts.length,vertical:report.vertical.length,switches:report.switches.length,fallbacks:report.fallbacks.length,errors:report.errors.length}));
