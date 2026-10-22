import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/pace-qa','package.json'));
const {chromium}=require('playwright');
const output='output/playwright/naae-integration/hero-fit';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),results=[];
try {
 for(const [width,height,size] of [[1440,900,'default'],[1900,960,'default'],[1920,1080,'default'],[1280,720,'default'],[1100,800,'default'],[390,844,'default'],[1440,900,'largest']])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.addInitScript(({theme,size})=>{localStorage.setItem('portfolio-theme',theme);localStorage.setItem('portfolio-text-size',size);},{theme,size});
  await page.goto(process.env.QA_URL||'http://127.0.0.1:4174');
  await page.locator('.ascii-forest[data-ready=true]').waitFor();
  if(size==='largest'){await page.locator('.display-settings summary').click();await page.getByLabel('Text size').selectOption('largest');await page.locator('.display-settings summary').click();}
  const geometry=await page.evaluate(()=>{
   const hero=document.querySelector('.hero-environment'),copy=document.querySelector('.hero-copy'),link=document.querySelector('.hero-copy > .hero-social:last-child'),portrait=document.querySelector('.portrait');
   const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};};
   return {hero:rect(hero),copy:rect(copy),lowerLinks:rect(link),portrait:rect(portrait),overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  assert.equal(geometry.overflow,false);
  assert.ok(geometry.lowerLinks.bottom<=geometry.hero.bottom);
  if(size==='default'&&width>=1440&&height>=900) assert.ok(geometry.hero.bottom<=height+1,JSON.stringify({width,height,geometry}));
  await page.locator('.hero-environment').screenshot({path:`${output}/${width}x${height}-${size}-${theme}.png`});
  results.push({width,height,size,theme,...geometry});await page.close();
 }
}finally{await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));await browser.close();}
console.log(`PASS ${results.length} homepage framing cases`);
