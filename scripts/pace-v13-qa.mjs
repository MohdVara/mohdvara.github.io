import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve('/private/tmp/pace-qa/package.json'));
const {chromium,webkit}=createRequire(resolve('../pace-rag/package.json'))('playwright'), AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:5177',out='output/playwright/pace-v1.4';await mkdir(out,{recursive:true});
const report={measuredAt:new Date().toISOString(),layouts:[],journeys:[],errors:[],limits:['Local emulated browsers, not physical-device or screen-reader certification.','No deployed site changed.']};
for(const [engine,kind]of Object.entries({chromium,webkit})){
 const browser=await kind.launch();
 try{
  for(const theme of ['light','dark'])for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
   await p.goto(base+'/pace-rag-case-study/');await p.locator('h1').waitFor();await p.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.textSize='largest';},theme);
   assert.equal(await p.locator('h1').count(),1);assert.match(await p.locator('main').innerText(),/Live AI is disabled/);assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://mohd.paramasvara.online/pace-rag-case-study/');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const axe=await new AxeBuilder({page:p}).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   if(width===390||width===1440)await p.screenshot({path:`${out}/${engine}-${theme}-${width}.png`,fullPage:true});
   report.layouts.push({engine,theme,width,text:'largest',reducedMotion:true,axeViolations:0,overflow:false});await context.close();
  }
  const context=await browser.newContext(),p=await context.newPage(),requests=[];p.on('request',r=>requests.push(r.url()));
  await p.goto(base);await p.waitForLoadState('networkidle');assert(!requests.some(u=>/PaceRagCaseStudy-|\/pace-rag\/models\//.test(u)));
  assert.equal(await p.locator('.project-primary-stack').count(),3);
  for(const text of await p.locator('.project-primary-stack').allTextContents())assert(text.split(' · ').length>=3&&text.split(' · ').length<=5);
  assert.match(await p.locator('#role-0').innerText(),/ongoing collaboration/);
  await p.getByRole('navigation',{name:'Engineering evidence',exact:true}).getByRole('link',{name:/Applied AI/}).click();await p.locator('h1').filter({hasText:'Knowledge first.'}).waitFor();
  assert(requests.some(u=>/PaceRagCaseStudy-/.test(u)));report.journeys.push({engine,lazyRoute:true,visibleStacks:true,employment:true});await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false}),n=await nojs.newPage();await n.goto(base+'/pace-rag-case-study/');assert.match(await n.locator('main').innerText(),/72.5%/);await n.getByRole('link',{name:'Explore an engagement approach'}).click();assert(await n.locator('#engagement-fit').count());await nojs.close();
  report.journeys.push({engine,noJavaScriptCaseStudy:true,engagementLink:true});
 }finally{await browser.close();}
}
assert.deepEqual(report.errors,[]);await writeFile(`${out}/results.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
