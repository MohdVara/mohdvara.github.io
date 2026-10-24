import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4208',out=process.env.QA_OUTPUT||'output/playwright/palda-v1.3/loading';
await mkdir(out,{recursive:true});
const routes=['/en/','/en/pace-rag-case-study/','/en/mmcats-modern/','/en/naae/','/en/multilingual-engineering/','/en/incident-zero/','/en/no-two-mondays/','/en/work-with-me/','/en/incident-zero/defence/'];
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,scope:'Computed browser visibility and interaction; extracted loader text alone is not a defect. Local injected failures are separate from live observations.',routes:[],scenarios:[]};
async function snapshot(page){return page.evaluate(()=>{const el=document.getElementById('portfolio-loader');if(!el)return{present:false,state:'removed',obstructing:false,focusable:0};const s=getComputedStyle(el),r=el.getBoundingClientRect();return{present:true,state:el.dataset.state,text:el.textContent,display:s.display,visibility:s.visibility,opacity:s.opacity,pointerEvents:s.pointerEvents,obstructing:s.display!=='none'&&s.visibility==='visible'&&Number(s.opacity)>0&&r.width>0,focusable:[...el.querySelectorAll('a,button,input')].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility==='visible'&&!n.disabled).length};});}
async function ready(page){await page.waitForFunction(()=>window.__palda?.ready>0,null,{timeout:20000});await page.waitForFunction(()=>{const x=document.getElementById('portfolio-loader');return !x||getComputedStyle(x).visibility==='hidden';},null,{timeout:5000});}
async function context(options={}){const c=await browser.newContext({viewport:{width:1440,height:1000},...options});await c.addInitScript(()=>{window.__palda={ready:0,failed:0,states:[],rejections:[]};window.addEventListener('portfolio:ready',()=>window.__palda.ready++);window.addEventListener('portfolio:failed',()=>window.__palda.failed++);window.addEventListener('unhandledrejection',e=>window.__palda.rejections.push(String(e.reason)));new MutationObserver(()=>{const state=document.getElementById('portfolio-loader')?.dataset.state||'removed';if(window.__palda.states.at(-1)!==state)window.__palda.states.push(state);}).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-state']});});return c;}
try{
for(const path of routes){const c=await context(),p=await c.newPage(),errors=[],failed=[],warnings=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push({url:r.url(),reason:r.failure()?.errorText}));p.on('console',m=>{if(['error','warning'].includes(m.type()))warnings.push(m.text());});await p.goto(base+path,{waitUntil:'commit',timeout:20000});const initial=await snapshot(p);await ready(p);const final=await snapshot(p);assert.equal(final.obstructing,false);assert.equal(final.focusable,0);await p.getByRole('heading',{level:1}).waitFor({state:'visible'});await p.keyboard.press('Tab');assert.equal(await p.locator('#portfolio-loader :focus').count(),0);const ax=await p.locator('body').ariaSnapshot();assert.ok(!ax.includes('Still loading. You can wait or retry.'));await p.screenshot({path:`${out}/${path.split('/')[2]||'home'}-ready.png`});const lifecycle=await p.evaluate(()=>window.__palda);await p.reload();await ready(p);assert.equal((await snapshot(p)).obstructing,false);report.routes.push({path,initial,final,lifecycle,errors,failed,warnings,reload:'PASS',accessibility:'No loader recovery text in accessible tree; no loader focus'});assert.deepEqual(errors,[]);await c.close();}
if(process.env.QA_FAILURES==='1'){
for(const mode of ['delayed-route','failed-route','failed-style','failed-optional','init-failure','reduced','no-js']){
 const c=await context({javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'}),p=await c.newPage();const requests=[];p.on('requestfailed',r=>requests.push(r.url()));
 if(mode==='delayed-route')await p.route('**/*EngineeringCaseStudy*.js',async r=>{await new Promise(ok=>setTimeout(ok,1500));await r.continue();});
 if(mode==='failed-route')await p.route('**/*EngineeringCaseStudy*.js',r=>r.abort());
 if(mode==='failed-style')await p.route('**/*EngineeringCaseStudy*.css',r=>r.abort());
 if(mode==='failed-optional')await p.route('**/*renderer*.js',r=>r.abort());
 if(mode==='init-failure')await p.route('**/*EngineeringCaseStudy*.js',r=>r.fulfill({contentType:'application/javascript',body:'throw new Error("Injected route initialization failure");'}));
 await p.goto(base+'/en/mmcats-modern/',{waitUntil:'commit',timeout:20000});
 if(['failed-route','failed-style','init-failure'].includes(mode)){
  await p.waitForFunction(()=>document.getElementById('portfolio-loader')?.dataset.state==='failed'||document.querySelector('#route-error-title'));
  const shell=p.locator('#portfolio-loader');if(await shell.count()&&await shell.isVisible()){await shell.getByRole('button',{name:'Continue',exact:true}).click();} if(mode==='failed-route'||mode==='init-failure'){await p.getByRole('button',{name:'Retry',exact:true}).waitFor({state:'visible'});}
  assert.ok(await p.locator('main').count());
 }else if(mode!=='no-js')await ready(p);
 if(mode==='no-js')assert.ok(await p.getByRole('heading',{level:1}).isVisible());
 report.scenarios.push({mode,loader:await snapshot(p),requests});await p.screenshot({path:`${out}/${mode}.png`});await c.close();
}
// Observe the actual 30-second slow state, then a real route commit.
const c=await context(),p=await c.newPage();let release;const gate=new Promise(ok=>release=ok);await p.route('**/*EngineeringCaseStudy*.js',async r=>{await gate;await r.continue();});await p.goto(base+'/en/mmcats-modern/',{waitUntil:'commit'});await p.waitForFunction(()=>document.getElementById('portfolio-loader')?.dataset.state==='slow',null,{timeout:40000});const slow=await snapshot(p);await p.screenshot({path:`out/slow-before-ready.png`.replace('out/',out+'/')});release();await ready(p);report.scenarios.push({mode:'slow-route',slow,after:await snapshot(p)});await c.close();
}
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({routes:report.routes.length,scenarios:report.scenarios.length,obstructing:report.routes.filter(x=>x.final.obstructing).length}));
