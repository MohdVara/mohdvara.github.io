import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));const {chromium}=require('playwright');const browser=await chromium.launch({channel:'chrome'});
const output=process.env.QA_OUTPUT||`output/playwright/utility-dark-default-${Date.now()}`;await mkdir(output,{recursive:true});const checks=[];
try {
 for(const saved of [null,'system','light','dark','time']) {
  const context=await browser.newContext({locale:'en',colorScheme:'light'});if(saved)await context.addInitScript(saved=>localStorage.setItem('portfolio-theme',saved),saved);
  const page=await context.newPage();await page.route('**/assets/index-*.js',route=>route.abort());await page.goto('http://127.0.0.1:4183/en/',{waitUntil:'domcontentloaded'});
  const preference=await page.locator('html').getAttribute('data-theme-preference');assert.equal(preference,saved||'dark');
  const theme=await page.locator('html').getAttribute('data-theme');if(saved!=='time')assert.equal(theme,saved==='system'||saved==='light'?'light':'dark');checks.push({saved,preference,theme,reactBlocked:true});await context.close();
 }
 const context=await browser.newContext({locale:'en',colorScheme:'light'});const page=await context.newPage();await page.goto('http://127.0.0.1:4183/en/',{waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('[data-control="theme"]').click();await page.locator('.utility-panel select').waitFor();assert.equal(await page.locator('.utility-panel select').inputValue(),'dark');await page.locator('.utility-panel select').selectOption('light');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');checks.push({menuOverride:'light persists after refresh'});await context.close();
 const nojs=await browser.newContext({locale:'en',colorScheme:'light',javaScriptEnabled:false});const np=await nojs.newPage();await np.goto('http://127.0.0.1:4183/en/');assert.equal(await np.locator('html').evaluate(el=>getComputedStyle(el).colorScheme),'dark');assert.equal(await np.locator('.utility-rail').isVisible(),false);checks.push({noJavaScript:'dark fallback, nonfunctional rail hidden'});await nojs.close();
}finally{await browser.close();await writeFile(`${output}/report.json`,JSON.stringify(checks,null,2));}
console.log(JSON.stringify({output,checks},null,2));
