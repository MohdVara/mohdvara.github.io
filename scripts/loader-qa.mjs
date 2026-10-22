import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const require=createRequire(resolve(process.env.QA_MODULES_DIR||".","package.json"));
const {chromium}=require("playwright");
const base=process.env.QA_URL||"http://127.0.0.1:4173";
const output="output/playwright/loader";
await mkdir(output,{recursive:true});
const registry=JSON.parse(await readFile("src/i18n/languages.json","utf8"));
const browser=await chromium.launch({channel:"chrome",headless:true});
const report={scenarios:[],errors:[]};
async function context(options={}){
 const ctx=await browser.newContext({viewport:{width:1440,height:900},...options});
 await ctx.addInitScript(()=>{
   window.loaderMetrics={states:[],shifts:[],longTasks:[]};
   new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.loaderMetrics.shifts.push({time:e.startTime,value:e.value,inLoader:e.sources.some(s=>s.node?.closest?.("#portfolio-loader"))});})).observe({type:"layout-shift",buffered:true});
   new PerformanceObserver(list=>list.getEntries().forEach(e=>window.loaderMetrics.longTasks.push({time:e.startTime,duration:e.duration}))).observe({type:"longtask",buffered:true});
   new MutationObserver(()=>{
     const state=document.getElementById("portfolio-loader")?.dataset.state||"removed";
     if(window.loaderMetrics.states.at(-1)?.state!==state)window.loaderMetrics.states.push({state,time:performance.now()});
   }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:["data-state"]});
 });
 return ctx;
}
try{
 // Warm local cache; fast navigation still uses the actual React lifecycle.
 const fast=await context();const page=await fast.newPage();page.on("pageerror",e=>report.errors.push(e.message));
 await page.goto(base+"/en/");await page.waitForFunction(()=>!document.getElementById("portfolio-loader"));
 await page.reload();await page.waitForFunction(()=>!document.getElementById("portfolio-loader"));
 report.scenarios.push({name:"fast",...await page.evaluate(()=>window.loaderMetrics)});await fast.close();
 for(const item of registry){
   const ctx=await context({colorScheme:item.locale==="ar"?"dark":"light",viewport:{width:item.locale==="en"?320:item.locale==="ar"?390:768,height:844},reducedMotion:item.locale==="ta"?"reduce":"no-preference"});
   const p=await ctx.newPage();p.on("pageerror",e=>report.errors.push(`${item.locale}: ${e.message}`));
   let release;const gate=new Promise(r=>release=r);
   await p.route(/\/assets\/index-[^/]+\.js$/,async route=>{await gate;await route.continue();});
   await p.goto(`${base}/${item.locale}/`,{waitUntil:"commit"});
   const shell=p.locator("#portfolio-loader");await shell.locator('.loader-message').waitFor({state:"visible"});
   assert.equal(await shell.getAttribute("lang"),item.locale);assert.equal(await shell.getAttribute("dir"),item.direction);
   const metrics=await shell.evaluate(el=>{
     const art=el.querySelector(".loader-art"),r=art.getBoundingClientRect();
     return {width:innerWidth,scroll:document.documentElement.scrollWidth,art:[r.left,r.right],direction:getComputedStyle(art).direction,writing:getComputedStyle(art).writingMode,pointer:getComputedStyle(el).pointerEvents,animation:getComputedStyle(el.querySelector('.loader-highlight')).animationName,...window.loaderMetrics};
   });
   assert.ok(metrics.scroll<=metrics.width+1);assert.ok(metrics.art[0]>=0&&metrics.art[1]<=metrics.width);assert.equal(metrics.direction,"ltr");assert.equal(metrics.pointer,"none");assert.equal(metrics.writing,"horizontal-tb");
   const brand=await p.evaluate(()=>{
     const a=document.querySelector('#portfolio-loader .monogram'),b=document.querySelector('.site-header .monogram');
     const properties=['fontFamily','fontSize','fontWeight','letterSpacing','lineHeight','paddingInlineEnd','direction','color'];
     const style=el=>Object.fromEntries(properties.map(key=>[key,getComputedStyle(el)[key]]));
     return {loader:style(a),header:style(b),loaderDot:getComputedStyle(a.querySelector('span')).color,headerDot:getComputedStyle(b.querySelector('span')).color,loaderText:a.textContent,headerText:b.textContent};
   });
   assert.deepEqual(brand.loader,brand.header,`${item.locale}: logo must match the website exactly`);
   assert.equal(brand.loaderDot,brand.headerDot);assert.equal(brand.loaderText,brand.headerText);
   const colors=await shell.locator('.loader-art').evaluate(el=>[...el.querySelectorAll('.loader-far,.loader-mid,.loader-near,.loader-sunlit,.loader-bark')].map(node=>getComputedStyle(node).color));
   assert.equal(new Set(colors).size,5,'Canopy depth, sunlight and bark must have distinct colors');
   if(item.locale==="en"){
     const before=await shell.locator('.loader-highlight').evaluate(el=>getComputedStyle(el).clipPath);
     await p.waitForTimeout(250);
     const after=await shell.locator('.loader-highlight').evaluate(el=>getComputedStyle(el).clipPath);
     assert.notEqual(before,after,"Loading band must visibly travel across the glyphs");
   }
   if(item.locale==="ta")assert.equal(metrics.animation,"none");
   else assert.equal(await shell.locator('.loader-highlight').evaluate(el=>getComputedStyle(el).animationIterationCount),'infinite');
   if(["en","ar","ta"].includes(item.locale))await p.screenshot({path:`${output}/slow-${item.locale}.png`});
   if(item.locale==="en")for(const width of [390,768,1440]){
     await p.setViewportSize({width,height:900});
     assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     await p.screenshot({path:`${output}/slow-en-${width}.png`});
   }
   report.scenarios.push({name:`slow-${item.locale}`,shell:metrics});
   release();await shell.waitFor({state:"detached"});await ctx.close();
 }
 const lazy=await context();const lp=await lazy.newPage();let resolveRoute;const routeGate=new Promise(r=>resolveRoute=r);
 await lp.route(/\/assets\/WorkWithMe-[^/]+\.js$/,async route=>{await routeGate;await route.continue();});
 await lp.goto(base+'/en/work-with-me/',{waitUntil:'commit'});
 await lp.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
 await lp.waitForFunction(()=>document.querySelector('#portfolio-loader')?.dataset.state==='loading');
 resolveRoute();await lp.locator('#portfolio-loader').waitFor({state:'detached'});report.scenarios.push({name:'lazy-route-commit',ready:true});await lazy.close();
 // Real network latency/throughput throttling, distinct from controlled bundle gates.
 const throttled=await context();const tp=await throttled.newPage();const cdp=await throttled.newCDPSession(tp);
 await cdp.send("Network.enable");await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:150000,uploadThroughput:75000});
 await tp.goto(base+"/en/",{waitUntil:"commit"});await tp.waitForFunction(()=>document.querySelector('#portfolio-loader')?.dataset.state==='loading');
 await tp.waitForFunction(()=>!document.querySelector('#portfolio-loader'),null,{timeout:20000});report.scenarios.push({name:"throttled-network",...await tp.evaluate(()=>window.loaderMetrics)});await throttled.close();
 for(const mode of ["entry-error","slow-connection","empty-root","mount-error","route-error","stylesheet-error"]){
   const ctx=await context();const p=await ctx.newPage();
   if(mode==="slow-connection")await p.clock.install();
   let release;const gate=new Promise(r=>release=r);
   if(mode==="empty-root")await p.route(base+"/en/",async route=>{const response=await route.fetch();const html=await response.text();await route.fulfill({response,body:html.replace(/(<div id="root"[^>]*>)[\s\S]*(<\/div>\s*<\/body>)/,"$1$2")});});
   if(mode==="route-error")await p.route(/\/assets\/WorkWithMe-[^/]+\.js$/,route=>route.abort());
   else if(mode==="stylesheet-error")await p.route(/\/assets\/index-[^/]+\.css$/,route=>route.abort());
   else await p.route(/\/assets\/index-[^/]+\.js$/,async route=>{
     if(["entry-error","empty-root"].includes(mode))await route.abort();
     else if(mode==="mount-error")await route.fulfill({contentType:"text/javascript",body:'throw new Error("Synthetic startup failure")'});
     else{await gate;await route.continue();}
   });
   await p.goto(base+(mode==="route-error"?"/en/work-with-me/":"/en/"),{waitUntil:"commit"});
   const shell=p.locator('#portfolio-loader');
   if(mode==="slow-connection"){
     await shell.waitFor({state:"visible"});
     await p.clock.fastForward(12000);assert.equal(await shell.getAttribute('data-state'),'loading');
     await p.clock.fastForward(18000);assert.equal(await shell.getAttribute('data-state'),'slow');
     const motion=await shell.locator('.loader-highlight').evaluate(el=>({iterations:getComputedStyle(el).animationIterationCount,clip:getComputedStyle(el).clipPath}));
     assert.equal(motion.iterations,'infinite');assert.notEqual(motion.clip,'none');
     assert.ok(await shell.locator('.loader-art').isVisible());
   }else await p.waitForFunction(()=>document.querySelector('#portfolio-loader')?.dataset.state==='failed',null,{timeout:16000});
   assert.ok(await shell.locator('a').isVisible());
   const blank=mode==="empty-root";if(blank)assert.equal(await shell.locator('button').isVisible(),false);else await shell.locator('button').waitFor({state:"visible"});
   await p.screenshot({path:`${output}/${mode}.png`});report.scenarios.push({name:mode,state:await shell.getAttribute('data-state')});
   if(mode==="slow-connection"){release();await p.clock.resume();await shell.waitFor({state:"detached"});}
   else if(!blank){await shell.locator('button').click();await shell.waitFor({state:"detached"});assert.ok(await p.locator('main').isVisible());}
   await ctx.close();
 }
 const nojs=await context({javaScriptEnabled:false});const nj=await nojs.newPage();await nj.goto(base+'/ar/');assert.ok(await nj.locator('main').isVisible());assert.equal(await nj.locator('#portfolio-loader').isVisible(),false);report.scenarios.push({name:'no-javascript',main:true,shell:false});await nojs.close();
 assert.deepEqual(report.errors,[]);
}finally{await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(`Loader browser QA: ${report.scenarios.length} scenarios passed.`);
