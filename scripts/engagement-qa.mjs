import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium}=require('playwright');const AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.QA_URL || 'http://127.0.0.1:4173';
const output=resolve(process.env.QA_OUTPUT_DIR || '.qa');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});const results=[];
try {
for(const width of [320,375,430,768,1024,1440,1920])for(const theme of ['dark','light']) {
 const context=await browser.newContext({viewport:{width,height:1000},colorScheme:theme,reducedMotion:'reduce'});const page=await context.newPage();const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.locator('#home .actions .primary').getAttribute('href'),'#work');
 assert.equal(await page.locator('.problem-translation-row').count(),4);
 await page.locator('.problems-section .engagement-link').click();await page.waitForURL('**/work-with-me/');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.engagement-problem').count(),4);assert.equal(await page.locator('.engagement-types article').count(),3);
 assert.match(await page.title(),/Work with Mohd/);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://mohd.paramasvara.online/work-with-me/');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations,[]);
 const booking=page.locator('[data-conversation-cta]');await booking.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await booking.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');assert.ok((await booking.boundingBox()).height>=44);
 assert.equal(await booking.getAttribute('target'),'_blank');assert.equal(await booking.getAttribute('href'),'https://cal.com/mohd-paramasvara/discovery');assert.equal(await page.locator('.contact-email').getAttribute('href'),'mailto:mohd@paramasvara.online');
 await page.goto(base+'/work-with-me/',{waitUntil:'networkidle'});await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('h1').textContent(),/Complex systems/);
 for(const id of ['engagement-problems','engagement-fit','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();if([375,768,1440].includes(width))await page.screenshot({path:`${output}/${id}-${width}-${theme}.png`});}
 await page.evaluate(()=>scrollTo(0,0));if([375,1440].includes(width))await page.screenshot({path:`${output}/hero-${width}-${theme}.png`});
 await page.locator('.engagement-problem a').first().click();await page.waitForURL('**/#case-insurance');assert.equal(await page.locator('#case-insurance').count(),1);
 await page.locator('#case-insurance summary').click();assert.equal(await page.locator('#case-insurance details').getAttribute('open'),'');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);results.push({width,theme,violations:0,overflow:false,consoleErrors:0,failedResources:0,staticRefresh:true,clientJourney:true,proofLink:true});await context.close();console.log(width,theme,'passed');
}
const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:375,height:900}});await context.route('https://cal.com/**',r=>r.fulfill({status:200,body:'<html><title>Booking destination</title></html>'}));const touch=await context.newPage();await touch.goto(base+'/work-with-me/');const popupPromise=touch.waitForEvent('popup');await touch.locator('[data-conversation-cta]').tap();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),'https://cal.com/mohd-paramasvara/discovery');await context.close();
const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.goto(base+'/work-with-me/');assert.match(await staticPage.locator('h1').textContent(),/Complex systems/);await staticPage.locator('.engagement-problem a').first().click();await staticPage.waitForURL('**/#case-insurance');assert.equal(await staticPage.locator('#case-insurance').count(),1);
await writeFile(`${output}/engagement-results.json`,JSON.stringify({results,touch:true,noJavaScript:true},null,2));
}finally{await browser.close();}
