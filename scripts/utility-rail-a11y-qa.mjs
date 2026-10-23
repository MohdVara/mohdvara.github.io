import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome'});
const output=process.env.QA_OUTPUT||`output/playwright/utility-a11y-${Date.now()}`;await mkdir(output,{recursive:true});
const report=[];
try {
 for(const locale of ['en','ar','ja'])for(const width of [390,1440]) {
  const context=await browser.newContext({locale:'en',viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();await page.goto(`http://127.0.0.1:4183/${locale}/`,{waitUntil:'networkidle'});await page.addScriptTag({path:process.env.QA_AXE});
  if(width===390)await page.locator('.utility-entry').click();
  for(const control of ['language','theme','size','motion','privacy']) {
   await page.locator(`[data-control="${control}"]`).click();await page.locator('.utility-panel select,.utility-panel input').first().waitFor();
   const result=await page.evaluate(async()=>window.axe.run(document.querySelector('.utility-rail')));report.push({locale,width,control,violations:result.violations});
   assert.equal(result.violations.length,0,JSON.stringify({locale,width,control,violations:result.violations}));
  }
  await context.close();
 }
}finally{await browser.close();await writeFile(`${output}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({output,scans:report.length,violations:report.flatMap(row=>row.violations).length}));
