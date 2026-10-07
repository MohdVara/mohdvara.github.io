import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(resolve(process.env.QA_MODULES_DIR || ".", "package.json"));
const { chromium } = require("playwright");
import assert from 'node:assert/strict';
import {writeFile, mkdir} from 'node:fs/promises';
const output = resolve(process.env.QA_OUTPUT_DIR || '.qa');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
await mkdir(output, { recursive: true });
const browser=await chromium.launch({channel:'chrome'});const results=[];
try{
for(const width of [320,375,430,768,1024,1440,1920]){
 const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',colorScheme:'dark'});
 await p.goto(base,{waitUntil:'networkidle'});
 const row={width,projectHeights:[],capabilityHeights:[]};
 for(const diagram of await p.locator('.project-visual').all()){
 const buttons=diagram.locator('button');const heights=[];
 for(const button of await buttons.all()){
 await button.focus();await p.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');
 assert.equal(await diagram.locator('[aria-pressed="true"]').count(),1);
 assert.equal(await button.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 const bounds=await button.boundingBox();assert.ok(bounds.height>=44);assert.ok(bounds.width>=44);
 assert.ok((await diagram.locator('.node-explanation').textContent()).length>35);
 assert.ok(await diagram.locator('path.connected').count()>0);
 heights.push((await diagram.boundingBox()).height);
 }row.projectHeights.push(heights);
 }
 for(const button of await p.locator('.capability-map button').all()){
 await button.focus();await p.keyboard.press('Space');assert.equal(await button.getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('.capability-map [aria-pressed="true"]').count(),1);
 assert.ok((await button.boundingBox()).height>=44);
 assert.ok((await p.locator('.capability-tools').textContent()).length>10);
 row.capabilityHeights.push((await p.locator('.capability-system').boundingBox()).height);
 }
 assert.ok(Math.max(...row.capabilityHeights)-Math.min(...row.capabilityHeights)<1,"Capability selection shifts layout");
 for(const role of await p.locator('.career-node').all()){assert.ok((await role.boundingBox()).height>=44);await role.click();assert.ok(p.url().includes('#role-'));}
 assert.equal(await p.locator('.borneo-botanical .botanical-drawing').evaluate(e=>getComputedStyle(e.querySelector('g')).animationName),'none');
 assert.equal(await p.locator('.convergence-final').evaluate(e=>getComputedStyle(e).animationName),'none');
 const endpoints = await p.locator('.convergence-outer path,.convergence-merge,.convergence-final,.map-growth,.diagram-connection').evaluateAll(paths => paths.filter(path => getComputedStyle(path).display !== 'none').map(path => ({ vector: getComputedStyle(path).vectorEffect, covered: path.isPointInStroke(path.getPointAtLength(path.getTotalLength() * .99)) })));
 assert.ok(endpoints.every(path => path.vector === 'none' && path.covered), 'Completed visible paths must reach their endpoints');
 results.push(row);await p.close();
}
await writeFile(`${output}/heights.json`,JSON.stringify(results,null,2));
const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
await p.goto(base,{waitUntil:'networkidle'});
await p.mouse.move(900,400);await p.waitForTimeout(250);
const pointer=await p.locator('.hero-botanical').evaluate(e=>[e.style.getPropertyValue('--pointer-x'),e.style.getPropertyValue('--pointer-y')].map(parseFloat));
assert.ok(pointer.every(v=>Number.isFinite(v)&&Math.abs(v)<=3));
await p.evaluate(()=>scrollTo({top:350,behavior:'instant'}));await p.waitForTimeout(200);
const depth=await p.locator('.portrait').evaluate(e=>parseFloat(getComputedStyle(e).getPropertyValue('--portrait-depth')));assert.ok(depth>0&&depth<=8);
const btn=p.locator('.project-visual').first().locator('button').nth(1);await btn.hover();assert.ok(await btn.evaluate(e=>e.classList.contains('active')));
await p.locator('#about').scrollIntoViewIfNeeded();await p.waitForTimeout(600);
assert.equal(await p.locator('.borneo-botanical .botanical-drawing').evaluate(e=>getComputedStyle(e.querySelector('g')).animationPlayState),'running');
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await p.waitForTimeout(800);
assert.equal(await p.locator('#contact').evaluate(e=>e.style.getPropertyValue('--section-progress')),'1.0000');
assert.equal(await p.locator('.convergence-final').evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset)),0);
await p.locator('#home').scrollIntoViewIfNeeded();await p.waitForTimeout(150);
assert.equal(await p.locator('.borneo-botanical .botanical-drawing').evaluate(e=>getComputedStyle(e.querySelector('g')).animationPlayState),'paused');
await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);
assert.equal(await p.locator('.hero-botanical').evaluate(e=>e.style.getPropertyValue('--pointer-x')),'');
assert.equal(await p.locator('#home').evaluate(e=>e.style.getPropertyValue('--portrait-depth')),'');
await p.close();
const touch=await browser.newPage({viewport:{width:375,height:900},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
await touch.goto(base);
const tap=touch.locator('.project-visual').first().locator('button').nth(2);await tap.tap();assert.equal(await tap.getAttribute('aria-pressed'),'true');
const leaf=touch.getByRole('button',{name:'Knowledge tools',exact:true});await leaf.tap();assert.equal(await leaf.getAttribute('aria-pressed'),'true');
assert.match(await touch.locator('.capability-tools').textContent(),/Vector databases/);
assert.equal(await touch.locator('.hero-botanical').evaluate(e=>e.style.getPropertyValue('--pointer-x')),'');
await touch.close();
await writeFile(`${output}/interactions.json`,JSON.stringify({results,motion:true,touch:true},null,2));
console.log(JSON.stringify({results,motion:true,touch:true}));
}finally{await browser.close();}
