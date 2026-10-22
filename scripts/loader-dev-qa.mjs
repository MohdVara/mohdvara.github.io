import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {resolve} from "node:path";
import {mkdir,writeFile} from "node:fs/promises";
const require=createRequire(resolve(process.env.QA_MODULES_DIR||".","package.json"));
const {chromium}=require("playwright");
const browser=await chromium.launch({channel:"chrome",headless:true});
const output="output/playwright/loader";
await mkdir(output,{recursive:true});
const report={samples:[],requests:[],errors:[]};
try {
  const page=await browser.newPage({viewport:{width:980,height:900},colorScheme:"dark"});
  page.on("pageerror",error=>report.errors.push(error.message));
  page.on("request",request=>{if(request.resourceType()==="script")report.requests.push(request.url());});
  await page.addInitScript(()=>{
    window.loaderSamples=[];
    new MutationObserver(()=>{
      const shell=document.getElementById("portfolio-loader");
      if(!shell)return;
      const text=shell.querySelector(".loader-progress")?.textContent;
      if(text&&window.loaderSamples.at(-1)?.text!==text)window.loaderSamples.push({time:performance.now(),text,pending:shell.querySelector('.loader-pending').textContent,completed:shell.querySelector('.loader-completed').textContent,state:shell.dataset.state});
    }).observe(document,{subtree:true,childList:true});
  });
  const cdp=await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
  await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:400,downloadThroughput:100000,uploadThroughput:50000});
  await page.goto(process.env.QA_URL||"http://127.0.0.1:5174/en/",{waitUntil:"commit",timeout:120000});
  const shell=page.locator('#portfolio-loader');await shell.waitFor({state:'visible',timeout:30000});
  await page.waitForFunction(()=>window.loaderSamples.some(s=>/Startup files: [1-9]/.test(s.text)),null,{timeout:60000});
  await page.screenshot({path:`${output}/dev-3g-progress.png`});
  await shell.waitFor({state:'detached',timeout:120000});
  report.samples=await page.evaluate(()=>window.loaderSamples);
  assert.ok(report.samples.length>5,"Counter must advance during nested module loading");
  const loaded=report.samples.map(sample=>Number(sample.text.match(/files: (\d+)/)?.[1]||0));
  assert.ok(Math.max(...loaded)>10,"Count individual module files, not just the entry tag");
  assert.ok(report.samples.some(s=>/pending:|Pending:/.test(s.pending)&&!s.pending.endsWith('—')));
  assert.ok(await page.locator('main').isVisible());
  assert.deepEqual(report.errors,[]);
}finally{await writeFile(`${output}/dev-progress.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(`Dev 3G progress passed: ${report.samples.length} live updates; ${report.requests.length} script requests.`);
