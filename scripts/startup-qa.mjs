// Controlled local comparison. Raw Vite-preview transfers are not production
// compression, Core Web Vitals, or a statistically significant speed benchmark.
import {readFile, readdir, stat, mkdir, writeFile} from 'node:fs/promises';
import {resolve, dirname, relative} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const out = process.env.QA_OUTPUT || 'output/playwright/palda-v1.2/startup';
await mkdir(out, {recursive:true});
async function artifact(root) {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const entry = html.match(/<script type="module"[^>]*src="([^"]+)"/)[1];
  const eager = new Set();
  async function visit(path) {
    if (eager.has(path)) return;
    eager.add(path);
    const code = await readFile(path, 'utf8');
    for (const match of code.matchAll(/(?:from|import)\s*["'](\.[^"']+\.js)["']/g)) await visit(resolve(dirname(path), match[1]));
  }
  await visit(resolve(root, '.'+entry));
  async function bytes(path) { const buffer = await readFile(path); return {path:relative(resolve(root), path), raw:buffer.length, gzip9:gzipSync(buffer, {level:9}).length}; }
  const files = [];
  async function walk(folder) {for (const file of await readdir(folder)) {const path=resolve(folder,file); if ((await stat(path)).isDirectory()) await walk(path); else files.push(path);}}
  await walk(resolve(root));
  const chunks = await Promise.all(files.filter(x=>/\.(js|css)$/.test(x)).map(bytes));
  return {entry:await bytes(resolve(root,'.'+entry)), headroom:215000-(await stat(resolve(root,'.'+entry))).size,
    eager:await Promise.all([...eager].map(bytes)), chunks, totalAssetBytes:(await Promise.all(files.map(async path=>(await stat(path)).size))).reduce((a,b)=>a+b,0)};
}
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={scope:'Cold isolated local Chrome contexts; Vite preview, identical viewport and cache settings. Timings/heap are noisy lab observations, not causal speed or memory claims.', baseline:await artifact(process.env.QA_BASELINE_DIST||'output/playwright/palda-v1.2/baseline-dist'),candidate:await artifact('dist'),samples:[],checks:[]};
try {
  for(let run=0;run<3;run++) for(const [name,base] of [['baseline',process.env.QA_BASELINE_URL||'http://127.0.0.1:4207'],['candidate',process.env.QA_URL||'http://127.0.0.1:4206']]) {
    const context=await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'no-preference'}),page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{window.__startup={ready:null,shifts:0};window.addEventListener('portfolio:ready',()=>{window.__startup.ready=performance.now();});new PerformanceObserver(list=>{for(const x of list.getEntries())if(!x.hadRecentInput)window.__startup.shifts+=x.value;}).observe({type:'layout-shift',buffered:true});});
    const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
    await page.goto(base+'/en/');await page.waitForFunction(()=>window.__startup.ready!==null);
    await page.locator('.ascii-forest[data-ready=true]').waitFor();
    await page.waitForTimeout(1200);
    const sample=await page.evaluate(()=>({...window.__startup,resources:performance.getEntriesByType('resource').map(x=>({path:new URL(x.name).pathname,transfer:x.transferSize,encoded:x.encodedBodySize,decoded:x.decodedBodySize,type:x.initiatorType}))}));
    const metrics=(await cdp.send('Performance.getMetrics')).metrics.filter(x=>['ScriptDuration','TaskDuration','JSHeapUsedSize'].includes(x.name));
    assert.deepEqual(errors,[]); assert.ok(!sample.resources.some(x=>/phaser|portfolioMotion|posthog/.test(x.path)));
    report.samples.push({name,run,...sample,metrics,errors});
    if(name==='candidate') {
      await page.mouse.move(120,120);await page.waitForFunction(()=>document.documentElement.classList.contains('motion-ready'));
      assert.ok((await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name))).some(x=>x.includes('portfolioMotion')));
      await page.locator('#contact').scrollIntoViewIfNeeded();await page.getByRole('button',{name:/Copy email/}).waitFor({state:'visible'});
      report.checks.push('Input loads motion; contact remains reachable');
    }
    await context.close();
  }
  for(const mode of ['reduced','blocked']) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference'}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    if(mode==='blocked')await page.route('**/*portfolioMotion*.js',route=>route.abort());
    await page.goto((process.env.QA_URL||'http://127.0.0.1:4206')+'/en/');await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
    await page.locator('#experience').scrollIntoViewIfNeeded();await page.waitForTimeout(250);
    await page.locator('#case-insurance summary').click();assert.ok(await page.locator('#case-insurance .case-body').isVisible());
    assert.deepEqual(errors,[]);
    if(mode==='reduced')assert.ok(!(await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>x.name))).some(x=>x.includes('portfolioMotion')));
    report.checks.push(`${mode}: content, native disclosure and error-free fallback`);await context.close();
  }
} finally {await browser.close();await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({baselineEntry:report.baseline.entry,candidateEntry:report.candidate.entry,headroom:report.candidate.headroom,samples:report.samples.length,checks:report.checks}));
