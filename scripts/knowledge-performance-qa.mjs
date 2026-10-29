import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'../pace-rag','package.json'));const {chromium}=require('playwright');
const output='output/pme-v17';await mkdir(output,{recursive:true});
const beforeRoot=process.env.QA_BASELINE_DIST||'/tmp/pme-v17-portfolio-baseline/dist',afterRoot='dist';
const bundles={};for(const [name,root]of [['before',beforeRoot],['after',afterRoot]]){
 const names=await readdir(root+'/assets');const assets={};let allJsRaw=0,allCssRaw=0;
 for(const file of names){const bytes=await readFile(root+'/assets/'+file);if(file.endsWith('.js'))allJsRaw+=bytes.length;if(file.endsWith('.css'))allCssRaw+=bytes.length;
  for(const [role,pattern]of [['main',/^index-.*\.js$/],['assistant',/^PaceAssistant-.*\.js$/],['caseStudy',/^PaceRagCaseStudy-.*\.js$/]])if(pattern.test(file))assets[role]={file,rawBytes:bytes.length,gzip9Bytes:gzipSync(bytes,{level:9}).length};
 }
 bundles[name]={assets,allJsRaw,allCssRaw};
}
await writeFile(output+'/bundle-comparison.json',JSON.stringify(bundles,null,2)+'\n');
const browser=await chromium.launch({channel:'chrome',headless:true});const samples=[];
try{for(let trial=0;trial<3;trial++)for(const [name,base]of [['before',process.env.QA_BASELINE_URL||'http://127.0.0.1:4188'],['after',process.env.QA_URL||'http://127.0.0.1:4187']]){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});context.setDefaultTimeout(30000);
 const page=await context.newPage();const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/en/',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.dataset.localeReady==='en');
 const initial=await page.evaluate(()=>{const resources=performance.getEntriesByType('resource');return {jsBodyBytes:resources.filter(r=>/\.js(?:$|\?)/.test(r.name)).reduce((sum,r)=>sum+r.encodedBodySize,0),responseTransferBytes:resources.reduce((sum,r)=>sum+r.transferSize,0),resourceCount:resources.length};});
 const openingStarted=await page.evaluate(()=>performance.now());await page.locator('.experience-assistant > summary').click();await page.waitForFunction(()=>!document.querySelector('.pace-assistant button[type=submit]')?.disabled&&!!document.querySelector('.pace-assistant button[type=submit]'));
 const assistantReadyIntervalMs=(await page.evaluate(()=>performance.now()))-openingStarted;
 const started=await page.evaluate(()=>performance.now());await page.getByRole('button',{name:'Which projects used React?',exact:true}).first().click();await page.locator('.pace-answer').waitFor();const ended=await page.evaluate(()=>performance.now());
 const modelRequests=requests.filter(url=>/\.onnx|\.wasm|\.f32/.test(url));
 samples.push({trial,name,initial,assistantReadyIntervalMs,modelDownloadRequests:requests.filter(url=>/\.onnx|\.wasm/.test(url)).length,inventoryRequests:requests.filter(url=>url.includes("portfolio-knowledge-inventory")).length,automationAnswerIntervalMs:ended-started,embeddingAssetRequests:modelRequests.length,inferenceRequests:requests.filter(url=>/\/generate|\/session|api.openai.com/.test(url)).length});await context.close();
}}finally{await browser.close();}
const report={measuredAt:new Date().toISOString(),scope:'Sequential alternating local cold browser contexts; 1440×1000, reduced motion, no CPU/network throttling. Transfer through locale readiness/network idle; answer interval includes Playwright input and observation overhead. Three samples are descriptive, not significance, production LCP or device-memory measurements.',browser:browser.version(),bundles,samples};
await writeFile(output+'/performance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
if(bundles.after.assets.main.rawBytes>215000||samples.some(s=>s.inferenceRequests))process.exitCode=1;
