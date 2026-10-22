import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/pace-qa','package.json'));
const playwright=require('playwright'), AxeBuilder=require('@axe-core/playwright').default;
const engine=process.env.QA_BROWSER||'chromium',base=process.env.QA_URL||'http://127.0.0.1:4174';
const output=resolve(process.env.QA_OUTPUT_DIR || `output/playwright/naae-integration/${engine}`);await mkdir(output,{recursive:true});
const browser=await playwright[engine].launch({...engine==='chromium'?{channel:'chrome'}:{},headless:true});
const report={engine,layouts:[],rivers:[],lifecycle:[],errors:[],incomplete:[]};
async function context(width=1440,theme='dark',extra={}){const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',...extra});await c.addInitScript(theme=>localStorage.setItem('portfolio-theme',theme),theme);return c;}
function track(page,label){page.on('pageerror',e=>report.errors.push({label,message:e.message}));}
async function artReady(page){await page.locator('.ascii-forest[data-ready=true][data-narrative="naae-v0.3"]').waitFor();}
try{
 for(const width of (process.env.QA_PHASE==='behavior'?[]:process.env.QA_QUICK==='1'?[390,1440]:[360,390,768,1280,1440,2560]))for(const theme of ['light','dark']){
  const c=await context(width,theme),p=await c.newPage();track(p,`${width}-${theme}`);await p.goto(base);await artReady(p);
  assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await p.locator('.ascii-forest').getAttribute('aria-hidden'),'true');
  assert.equal(await p.locator('.ascii-forest').getAttribute('data-running'),'false');
  const data=await p.locator('.ascii-forest').evaluate(el=>({...el.dataset}));
  assert.equal(await p.locator('.hero-environment object').count(),0, 'No separately scaled SVG overlaps the animated canvas');
  const audit=await new AxeBuilder({page:p}).include('.hero-environment').analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);report.incomplete.push({width,theme,ids:audit.incomplete.map(v=>v.id)});
  await p.locator('.hero-environment').screenshot({path:`${output}/hero-${width}-${theme}.png`});report.layouts.push({width,theme,...data});
  assert.equal(await p.getByRole('link',{name:'Explore the written landscape'}).count(),0);
  assert.equal(await p.getByRole('link',{name:'Read the river passage'}).count(),0);
  await p.locator('#contact').scrollIntoViewIfNeeded();
  const river=p.locator('.ascii-river[data-ready=true][data-narrative="naae-v0.3"]');await river.waitFor();
  assert.equal(await river.getAttribute('data-running'),'false');
  const contactAudit=await new AxeBuilder({page:p}).include('#contact').analyze();assert.deepEqual(contactAudit.violations.map(v=>v.id),[]);
  await p.locator('#contact').screenshot({path:`${output}/river-${width}-${theme}.png`});report.rivers.push({width,theme,...await river.evaluate(el=>({...el.dataset}))});
  await c.close();console.log(`PASS ${engine} ${width}/${theme}`);
 }
 if(process.env.QA_QUICK!=='1'){
  const c=await context(1440,'dark',{reducedMotion:'no-preference'}),p=await c.newPage();track(p,'motion');await p.goto(base);await artReady(p);
  await p.waitForFunction(()=>document.querySelector('.ascii-forest')?.dataset.running==='true');
  const signature=await p.locator('.ascii-forest').getAttribute('data-signature');const f=Number(await p.locator('.ascii-forest').getAttribute('data-frames'));await p.waitForFunction(before=>Number(document.querySelector('.ascii-forest')?.dataset.frames)>before,f);
  await p.locator('.display-settings summary').click();await p.getByLabel('Animated scenery').selectOption('paused');await p.waitForFunction(()=>document.querySelector('.ascii-forest')?.dataset.running==='false');
  const raw=await p.locator('.ascii-forest canvas').evaluate(c=>c.toDataURL());await p.waitForTimeout(200);assert.equal(await p.locator('.ascii-forest canvas').evaluate(c=>c.toDataURL()),raw);
  await p.evaluate(()=>window.dispatchEvent(new CustomEvent('theme-preference',{detail:'light'})));await p.waitForFunction(()=>document.documentElement.dataset.theme==='light');assert.equal(await p.locator('.ascii-forest').getAttribute('data-signature'),signature);
  await p.locator('#contact').scrollIntoViewIfNeeded();await p.locator('.ascii-river[data-ready=true]').waitFor();assert.equal(await p.locator('.ascii-river').getAttribute('data-running'),'false');
  report.lifecycle.push('Existing forest frames advance; shared pause freezes scenery, theme preserves identity and contact river loads.');await c.close();
  for(const route of ['/work-with-me/','/no-two-mondays/','/pace-rag-case-study/','/incident-zero/']){const c=await context(390,'light'),p=await c.newPage();track(p,route);await p.goto(base+route);await artReady(p);await p.locator('.ascii-river').scrollIntoViewIfNeeded();await p.locator('.ascii-river[data-ready=true]').waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.lifecycle.push(`${route} retains both scenes with a native NAAE-derived typographic field`);await c.close();}

 }
 assert.deepEqual(report.errors,[]);
}finally{await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));await browser.close();}
