import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR || '.', 'package.json'));
const {chromium}=require('playwright');
const output=resolve(process.env.QA_OUTPUT_DIR || '.qa');await mkdir(output,{recursive:true});
const base=process.env.QA_URL || 'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'chrome'});
const results=[];
try {
 for(const width of [320,375,430,768,1024,1440,1920])for(const theme of ['dark','light']) {
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:theme,reducedMotion:'reduce',hasTouch:width<=430,isMobile:width<=430});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base,{waitUntil:'networkidle'});
  const hero=page.locator('#home');assert.match(await hero.locator('.hero-role').textContent(),/Principal Full-Stack Engineer/);
  const primary=hero.locator('.actions .primary');assert.equal((await primary.textContent()).trim(),'Explore my work ↗');assert.equal(await primary.getAttribute('href'),'#work');
  assert.equal(await hero.locator('.actions .secondary').getAttribute('href'),'https://rxresu.me/mwara95/2-page-resume');
  for(const link of await hero.locator('.actions a').all())assert.ok((await link.boundingBox()).height>=44);
  await primary.focus();await page.keyboard.press('Enter');assert.match(page.url(),/#work$/);
  const summary=page.locator('.case-details summary').first();await summary.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.case-details').first().getAttribute('open'),'');
  assert.equal(await page.locator('.case-conversation').count(),1);
  const insurance=page.locator('.case-details').nth(1);await insurance.locator('summary').click();await insurance.locator('.case-conversation').click();assert.match(page.url(),/#contact$/);
  const booking=page.locator('[data-conversation-cta]');assert.match(await booking.textContent(),/Book a conversation/);assert.equal(await booking.getAttribute('target'),'_blank');assert.equal(await booking.getAttribute('href'),'https://cal.com/mohd-paramasvara/discovery');
  await booking.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await booking.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');assert.ok((await booking.boundingBox()).height>=44);
  assert.equal(await page.locator('.contact-email').getAttribute('href'),'mailto:mohd@paramasvara.online');
  assert.equal(await page.locator('#contact .primary').count(),1);
  assert.equal(await page.locator('.capability-summary').count(),4);
  for(const label of await page.locator('.capability-summary').all())assert.ok((await label.textContent()).length>20);
  for(const [i,role] of (await page.locator('.timeline li').all()).entries()) {
   assert.equal((await role.locator('.role-index').textContent()).trim(),`0${i+1}`);
   assert.match(await page.locator(`.career-node[href="#role-${i}"]`).textContent(),new RegExp(`0${i+1} /`));
  }
  assert.equal(await page.locator('.public-repository').count(),2);
  const github=await page.locator('a[href^="https://github.com/"]').evaluateAll(a=>[...new Set(a.map(e=>e.href))]);
  assert.deepEqual(github.sort(),['https://github.com/MohdVara','https://github.com/MohdVara/mohdvara.github.io','https://github.com/MohdVara/nodejs-hotel-problem'].sort());
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await page.screenshot({path:`${output}/contact-${width}-${theme}.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  results.push({width,theme,recruiter:true,cto:true,consulting:true,consoleErrors:0,overflow:false});await context.close();
 }
 // Popup destinations are isolated; actual destination availability is checked separately.
 const context=await browser.newContext({viewport:{width:375,height:900},hasTouch:true,isMobile:true});
 await context.route(/https:\/\/(cal\.com|rxresu\.me)\//,r=>r.fulfill({status:200,body:'<html><title>Destination</title></html>'}));
 const page=await context.newPage();await page.goto(base);
 for(const locator of [page.locator('#home .actions .secondary'),page.locator('[data-conversation-cta]')]) {
  const expected=await locator.getAttribute('href');const popupPromise=page.waitForEvent('popup');await locator.tap();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),expected);await popup.close();
 }
 await context.close();
 const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.goto(base);
 assert.equal(await staticPage.locator('[data-conversation-cta]').getAttribute('href'),'https://cal.com/mohd-paramasvara/discovery');assert.equal(await staticPage.locator('.capability-summary').count(),4);
 assert.equal(await staticPage.locator('.contact-email').getAttribute('href'),'mailto:mohd@paramasvara.online');
 await writeFile(`${output}/conversion-results.json`,JSON.stringify({results,touchPopups:true,noJavaScript:true},null,2));
 console.log(JSON.stringify({cases:results.length,journeys:['recruiter','cto','consulting'],touchPopups:true,noJavaScript:true}));
}finally{await browser.close();}
