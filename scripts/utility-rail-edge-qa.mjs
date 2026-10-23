import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4183';
const notFoundBase=process.env.QA_404_URL||'http://127.0.0.1:4191';
const browser=await chromium.launch({channel:'chrome'});
const out=process.env.QA_OUTPUT||`output/playwright/utility-edge-${Date.now()}`;await mkdir(out,{recursive:true});
const report=[];
try {
 const context=await browser.newContext({locale:'en'});const page=await context.newPage();
 for(const [width,height] of [[320,568],[844,390],[720,450]]) {
  await page.setViewportSize({width,height});await page.goto(base+'/en/',{waitUntil:'networkidle'});
  await page.locator('.utility-entry').click();await page.locator('[data-control="size"]').click();await page.locator('.utility-panel select').selectOption('largest');
  for(const control of ['privacy','language','theme']) {
   await page.locator(`[data-control="${control}"]`).click();await page.locator('.utility-panel select,.utility-panel input').first().waitFor();
   const rect=await page.locator('.utility-panel').boundingBox();assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=width+1&&rect.y+rect.height<=height+1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.screenshot({path:`${out}/largest-${width}-${height}.png`});report.push({width,height,largest:true,bounds:'pass'});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/en/',{waitUntil:'networkidle'});
 await page.locator('[data-control="theme"]').click();await page.locator('.utility-panel select').waitFor();
 await page.evaluate(()=>{const dialog=document.createElement('dialog');dialog.innerHTML='<button>Dismiss</button>';document.body.append(dialog);dialog.showModal();});
 assert.equal(await page.locator('.utility-rail').isVisible(),false);assert.ok(await page.locator('dialog button').evaluate(el=>el===document.activeElement));await page.keyboard.press('Tab');assert.ok(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)||document.activeElement===document.body));
 await page.evaluate(()=>document.querySelector('dialog').close());report.push({nativeModal:'rail hidden, modal focus preserved'});
 await page.emulateMedia({forcedColors:'active'});await page.screenshot({path:`${out}/forced-colors.png`});report.push({forcedColors:'rendered'});
 await context.close();
 const blocked=await browser.newContext({locale:'en'});await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('storage unavailable');};Storage.prototype.setItem=()=>{throw new Error('storage unavailable');};});const bp=await blocked.newPage();await bp.goto(base+'/en/',{waitUntil:'networkidle'});await bp.locator('[data-control="theme"]').click();await bp.locator('.utility-panel select').selectOption('dark');assert.equal(await bp.locator('html').getAttribute('data-theme'),'dark');await bp.locator('[data-control="privacy"]').click();assert.equal(await bp.locator('.utility-panel input').isChecked(),false);await bp.locator('.utility-panel input').check();assert.ok(await bp.locator('.utility-panel input').isChecked());report.push({storageUnavailable:'theme and explicit in-memory consent usable'});await blocked.close();
 const response=await fetch(notFoundBase+'/en/unknown-utility-rail-qa/');assert.equal(response.status,404);assert.ok((await response.text()).includes('utility-rail'));report.push({unknownRouteHTTP:404});
}finally{await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({output:out,report},null,2));
