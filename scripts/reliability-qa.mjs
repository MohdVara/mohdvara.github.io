import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/portfolio-qa','package.json'));
const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.QA_URL||'http://127.0.0.1:4175',out=resolve(process.env.QA_OUTPUT_DIR||'.qa/reliability');
await mkdir(out,{recursive:true});const b=await chromium.launch({channel:'chrome'});const results={recovery:[],mobile:[],accessibility:[],noJavaScript:[],errors:[]};
try {
 for(const [route,chunk] of [['incident-zero','IncidentZeroRoute'],['incident-zero/defence','DefenceRoute']]){
  const p=await b.newPage();const pattern='**/'+chunk+'-*.js';await p.route(pattern,r=>r.abort());await p.goto(base+'/'+route+'/');
  await p.getByRole('heading',{name:'This experience could not load.'}).waitFor();assert.equal(await p.locator(':focus').getAttribute('id'),'route-error-title');
  await p.keyboard.press('Tab');assert.equal(await p.locator(':focus').innerText(),'Retry');await p.screenshot({path:out+'/'+chunk+'-recovery.png'});
  await p.unroute(pattern);await p.getByRole('button',{name:'Retry',exact:true}).click();await p.getByRole('heading',{name:route==='incident-zero'?'Incident Zero.':'System Defence',exact:true}).waitFor();
  results.recovery.push({route,recovered:true});await p.close();
 }
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});p.on('pageerror',e=>results.errors.push(e.message));await p.goto(base);await p.evaluate(()=>document.fonts.ready);
 results.homeHeight=await p.evaluate(()=>document.documentElement.scrollHeight);assert.equal(await p.locator('#home a[href="/work-with-me/"]').count(),1);
 await p.screenshot({path:out+'/home-390.png'});await p.goto(base+'/unknown-reliability-check');await p.getByRole('heading',{name:'This page could not be found.'}).waitFor();await p.screenshot({path:out+'/missing-page.png'});
 const missing=await readFile('dist/404.html','utf8');assert.match(missing,/noindex, follow/);assert.match(missing,/This page could not be found/);assert.ok(!missing.includes('rel="canonical"'));
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 for(const route of ['', 'work-with-me/','incident-zero/','incident-zero/defence/']){
  const html=await readFile('dist/'+route+'index.html','utf8');assert.ok(sitemap.includes('https://mohd.paramasvara.online/'+route));assert.ok(html.includes('rel="canonical" href="https://mohd.paramasvara.online/'+route+'"'));
  const c=await b.newContext({javaScriptEnabled:false});const s=await c.newPage();await s.goto(base+'/'+route);assert.equal(await s.locator('h1').count(),1);results.noJavaScript.push(route||'/');await c.close();
 }
 const arcadeHtml=await readFile('dist/incident-zero/defence/index.html','utf8');assert.equal((arcadeHtml.match(/Five generated levels, two defensive tools/g)||[]).length,4);assert.ok(!arcadeHtml.includes('One arena'));
 for(const theme of ['light','dark'])for(const [width,height] of [[320,844],[390,844],[430,844],[844,390]]){
  const c=await b.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});await c.addInitScript(t=>localStorage.setItem('portfolio-theme',t),theme);const x=await c.newPage();await x.goto(base+'/incident-zero/defence/');
  // Explicitly set the existing theme attribute for route-only pages.
  await x.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const audit=await new AxeBuilder({page:x}).analyze();results.accessibility.push({theme,width,violations:audit.violations.map(v=>({id:v.id,impact:v.impact})),incomplete:audit.incomplete.map(v=>v.id)});assert.ok(!audit.violations.some(v=>['serious','critical'].includes(v.impact)),JSON.stringify(audit.violations));
  await x.getByRole('button',{name:'Start run',exact:true}).click();await x.locator('canvas').waitFor();const box=await x.locator('canvas').boundingBox();assert.ok(await x.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await x.screenshot({path:out+`/arcade-${theme}-${width}.png`});
  await x.getByRole('button',{name:'Pause / help'}).click();await x.getByRole('heading',{name:'Hold position.',exact:true}).waitFor();results.mobile.push({theme,width,height,canvas:box});await c.close();
 }
 assert.deepEqual(results.errors,[]);console.log(JSON.stringify(results,null,2));
}finally{await writeFile(out+'/results.json',JSON.stringify(results,null,2));await b.close();}
