import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4208',out=process.env.QA_OUTPUT||'output/playwright/palda-v1.3/evidence';
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});await mkdir(out,{recursive:true});
const report=process.env.QA_JOURNEYS_ONLY ? JSON.parse(await readFile(`${out}/results.json`,'utf8')) : {layouts:[],locales:[],noJavaScript:[],journeys:[],axe:[],errors:[],failed:[],deepLinks:[]};
if(process.env.QA_JOURNEYS_ONLY){report.journeys=[];report.deepLinks=[];report.journeyRetry='Matrix retained after passing; retry only journeys after correcting a hidden mobile-navigation selector in the harness.';}
async function ready(p){await p.waitForFunction(()=>!document.getElementById('portfolio-loader'));await p.getByRole('heading',{level:1}).waitFor({state:'visible'});}
async function overflow(p,label){assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label);}
const pages=['mmcats-modern','pace-rag-case-study','naae','no-two-mondays'];
try{
 if(!process.env.QA_JOURNEYS_ONLY){
 for(const route of pages)for(const theme of ['dark','light']){
  const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('requestfailed',r=>report.failed.push(r.url()));
  await p.addInitScript(theme=>{localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-text-size','largest');},theme);
  await p.goto(`${base}/en/${route}/`);await ready(p);
  for(const width of [320,375,390,430,768,1024,1440,1920,3840]){await p.setViewportSize({width,height:1000});await overflow(p,`${route}/${theme}/${width}`);assert.equal(await p.locator('main h1').count(),1);report.layouts.push({route,theme,width});}
  await p.setViewportSize({width:390,height:844});
  if(route==='no-two-mondays'){
   assert.equal(await p.locator('#ntm-history').getAttribute('open'),null);assert.equal(await p.locator('#ntm-iterations').isVisible(),false);
   await p.locator('#ntm-history > summary').focus();await p.keyboard.press('Enter');assert.ok(await p.locator('#ntm-iterations').isVisible());await p.keyboard.press('Enter');assert.equal(await p.locator('#ntm-iterations').isVisible(),false);
   const chart=p.locator('#ntm-ending-distribution details');await chart.locator('summary').click();assert.equal(await chart.locator('.ntm-ending-bars > li').count(),44);await chart.locator('summary').click();
  }
  if(route==='naae'){
   for(let side=0;side<2;side++)for(let i=0;i<3;i++){await p.locator(`input[name="evolution-stage-${side}"][value="${i}"]`).check();assert.ok(await p.locator('.evolution-grid > figure').nth(side).locator(`a[href="/images/naae/v0.${i+2}.svg"]`).count());}
   await p.getByRole('slider',{name:'Detail zoom'}).fill('200');await p.getByRole('button',{name:'View from a distance'}).click();assert.equal(await p.locator('output').textContent(),'100%');await p.locator('.evolution-grid details').first().locator('summary').click();assert.ok(await p.locator('.evolution-grid pre').first().isVisible());
  }
  if(route==='pace-rag-case-study'){assert.ok(await p.locator('#rag-php-example').isVisible());assert.equal(await p.locator('[translate=no]').filter({hasText:'Which PHP frameworks have you used?'}).count(),1);}
  if(process.env.QA_AXE){await p.addScriptTag({path:process.env.QA_AXE});const x=await p.evaluate(()=>window.axe.run(document.querySelector('main'),{rules:{'color-contrast':{enabled:false}}}));report.axe.push({route,theme,violations:x.violations.map(v=>({id:v.id,nodes:v.nodes.length})),incomplete:x.incomplete.map(v=>v.id),excludedRule:'color-contrast: computed/visual review separate'});assert.deepEqual(x.violations.map(v=>v.id),[]);}
  await p.screenshot({path:`${out}/${route}-${theme}-390.png`,fullPage:true});await c.close();
 }
 for(const {locale} of registry)for(const route of pages){
  const c=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(`${locale}/${route}: ${e.message}`));await p.goto(`${base}/${locale}/${route}/`);await ready(p);await overflow(p,`${locale}/${route}`);
  assert.equal(await p.locator('.case-quick-read a[href="/'+locale+'/#contact"]').count(),1);
  if(locale==='ja'){await p.evaluate(()=>{localStorage.setItem('portfolio.writing.v1','vertical');});await p.reload();await ready(p);assert.equal(await p.locator('html').getAttribute('data-writing-mode'),'vertical');await overflow(p,`${locale}/${route}/vertical`);}
  report.locales.push({locale,route,width:390});await c.close();
 }
 for(const locale of ['en','ar','ta','ja'])for(const route of pages){const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await c.newPage();await p.goto(`${base}/${locale}/${route}/`);assert.ok(await p.getByRole('heading',{level:1}).isVisible());if(route==='no-two-mondays'){await p.locator('#ntm-history > summary').click();assert.ok(await p.locator('#ntm-process').isVisible());await p.locator('#ntm-ending-distribution summary').click();assert.equal(await p.locator('.ntm-ending-bars > li').count(),44);}report.noJavaScript.push({locale,route});await c.close();}
 }
 const c=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 for(const id of ['ntm-process','ntm-dialogue-history','ntm-puzzle-history','ntm-ending-distribution']){
  await p.goto(`${base}/en/no-two-mondays/?review=architecture#${id}`);await ready(p);assert.ok(await p.locator('#'+id).isVisible());if(id!=='ntm-ending-distribution')assert.notEqual(await p.locator('#ntm-history').getAttribute('open'),null);await p.reload();await ready(p);assert.ok(await p.locator('#'+id).isVisible());report.deepLinks.push(id);
 }
 // Localized history restoration and equivalent English source keep query/hash.
 await p.goto(`${base}/ar/no-two-mondays/?review=architecture#ntm-dialogue-history`);await ready(p);assert.ok(await p.locator('#ntm-dialogue-history').isVisible());const english=p.locator('.translation-notice a').first();if(await english.count()){assert.ok((await english.getAttribute('href')).includes('?review=architecture#ntm-dialogue-history'));await english.click();await ready(p);await p.goBack();await ready(p);assert.ok(p.url().includes('/ar/'));await p.goForward();await ready(p);}report.journeys.push('Localized archive → English original → back/forward');
 await p.goto(`${base}/en/`);await ready(p);await p.getByRole('link',{name:'Professional delivery',exact:false}).click();await p.locator('#case-insurance summary').click();assert.ok(await p.locator('#case-insurance .case-quick-read').isVisible());assert.ok(await p.locator('a[href="https://rxresu.me/mwara95/2-page-resume"]').count());await p.locator('#contact').scrollIntoViewIfNeeded();assert.ok(await p.locator('#contact a[href^="mailto:"]').isVisible());report.journeys.push('Recruiter: homepage → commercial proof → résumé destination → contact; no submission');
 for(const id of ['insurance','wensymes','campus']){await p.goto(`${base}/en/#case-${id}`);await ready(p);assert.ok(await p.locator(`#case-${id} .case-quick-read`).isVisible());}report.journeys.push('Manager: three employer quick reads → ownership, decisions and outcomes');
 for(const route of ['mmcats-modern','pace-rag-case-study','naae']){await p.goto(`${base}/en/${route}/`);await ready(p);assert.ok(await p.locator('.quick-read-actions a[href="/en/#contact"]').count());}report.journeys.push('Architect: independent technical case → evidence → contact destination');
 await p.goto(`${base}/en/work-with-me/`);await ready(p);assert.ok(await p.locator('a[href*="#case-insurance"]').count());await p.locator('#contact').scrollIntoViewIfNeeded();assert.ok(await p.locator('#contact a[data-conversation-cta]').isVisible());report.journeys.push('Consulting client: Work With Me → relevant employer proof → scope/contact; no booking');
 await p.goto(`${base}/ta/nonexistent-palda-v13/`);await ready(p);assert.ok(await p.locator('main a').count());report.journeys.push('Localized 404: visible recovery links; HTTP status covered separately by existing deployment contract');
 await c.close();assert.deepEqual(report.errors,[]);
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({layouts:report.layouts.length,locales:report.locales.length,noJavaScript:report.noJavaScript.length,axe:report.axe.length,journeys:report.journeys.length,deepLinks:report.deepLinks.length,errors:report.errors,failed:report.failed}));
