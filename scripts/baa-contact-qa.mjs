import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '/private/tmp/pace-qa','package.json'));
const playwright=require('playwright'), AxeBuilder=require('@axe-core/playwright').default;
const engine=process.env.QA_BROWSER || 'chromium', base=process.env.QA_URL || 'http://127.0.0.1:4173';
const output=resolve(process.env.QA_OUTPUT_DIR || `output/playwright/baa-v1.1/contact-${engine}`);
await mkdir(output,{recursive:true});
const browser=await playwright[engine].launch({...engine==='chromium'?{channel:'chrome'}:{},headless:true});
const results={phase:process.env.QA_PHASE || 'full',engine,layouts:[],lifecycle:[],errors:[],incomplete:[]};
async function state(page,selector,running){await page.waitForFunction(({selector,running})=>document.querySelector(selector)?.dataset.running===String(running),{selector,running});}
async function preference(page,value){await page.locator('.display-settings summary').click();await page.getByRole('combobox',{name:'Animated scenery',exact:true}).selectOption(value);await page.locator('.display-settings summary').press('Escape');}
try{
 for(const width of process.env.QA_PHASE === 'behavior' ? [390,1440] : [320,390,1440])for(const theme of ['light','dark'])for(const textSize of process.env.QA_PHASE === 'behavior' ? ['default'] : ['default','largest']){
  const context=await browser.newContext({viewport:{width,height:width===320?568:900},colorScheme:theme,reducedMotion:'reduce'});
  await context.addInitScript(({theme,textSize})=>{localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-text-size',textSize);},{theme,textSize});
  const page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message));await page.goto(base);await page.locator('.ascii-forest[data-ready="true"]').waitFor();if(process.env.QA_PHASE === 'behavior')await page.screenshot({path:`${output}/hero-final-${width}-${theme}.png`});await page.locator('#contact').scrollIntoViewIfNeeded();await page.locator('.ascii-river[data-ready="true"]').waitFor();await state(page,'.ascii-river',false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.getByRole('link',{name:'Book a conversation (opens Cal.com in a new tab)',exact:true}).isVisible());assert.ok(await page.getByRole('button',{name:'Copy email',exact:true}).isVisible());
  assert.equal(await page.locator('.ascii-river').getAttribute('aria-hidden'),'true');assert.ok(Number(await page.locator('.ascii-river').getAttribute('data-cells'))>0);
  const audit=await new AxeBuilder({page}).include('#contact').analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);results.incomplete.push({width,theme,textSize,ids:audit.incomplete.map(v=>v.id)});
  await page.locator('#contact').screenshot({path:`${output}/contact-${width}-${theme}-${textSize}.png`});results.layouts.push({width,theme,textSize,data:await page.locator('.ascii-river').evaluate(el=>({...el.dataset}))});await context.close();console.log(`${engine}: contact ${width}/${theme}/${textSize} passed`);
 }
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'}),page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message));await page.goto(base);await page.locator('.ascii-forest[data-ready="true"]').waitFor();await state(page,'.ascii-forest',true);
 await page.locator('#contact').scrollIntoViewIfNeeded();await page.locator('.ascii-river[data-ready="true"]').waitFor();await state(page,'.ascii-river',true);await state(page,'.ascii-forest',false);
 const contactGeometry=await page.locator('#contact').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,bottom:el.getBoundingClientRect().bottom+scrollY,max:document.documentElement.scrollHeight-innerHeight}));
 const progress=[];
 for(const [index,y] of [Math.max(0,contactGeometry.top-900*.85),contactGeometry.top,Math.min(contactGeometry.max,contactGeometry.bottom-900),contactGeometry.max].entries()){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(250);const value=Number(await page.locator('.ascii-river').getAttribute('data-branch-progress'));progress.push(value);await page.screenshot({path:`${output}/river-scroll-${index}.png`});}
 assert.ok(progress.every((value,index)=>index===0||value>=progress[index-1]),`Monotonic branch growth: ${progress}`);assert.ok(progress[0]<progress.at(-1),`Branches grow through scroll: ${progress}`);assert.ok(progress.at(-1)>=.99,`Branches complete at reachable end: ${progress}`);results.lifecycle.push({branchProgress:progress});
 await preference(page,'paused');await state(page,'.ascii-river',false);await state(page,'.ascii-forest',false);const pixels=await page.locator('.ascii-river canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(350);assert.ok(pixels===await page.locator('.ascii-river canvas').evaluate(el=>el.toDataURL()));
 await preference(page,'enabled');await page.locator('#contact').scrollIntoViewIfNeeded();await state(page,'.ascii-river',true);await page.emulateMedia({reducedMotion:'reduce'});await state(page,'.ascii-river',false);await page.emulateMedia({reducedMotion:'no-preference'});await state(page,'.ascii-river',true);
 await page.evaluate(()=>scrollTo(0,0));await state(page,'.ascii-forest',true);await state(page,'.ascii-river',false);results.lifecycle.push({sharedPreference:true,rawRiverPausePixels:true,reducedMotion:true,independentOffscreen:true});await context.close();assert.deepEqual(results.errors,[]);
}finally{await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));await browser.close();}
