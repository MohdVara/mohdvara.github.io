import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');const AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.QA_URL||'http://127.0.0.1:4173';
const out=resolve(process.env.QA_OUTPUT_DIR||'.qa/incident-review');await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});const results=[];
async function start(p){await p.goto(base+'/incident-zero/',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Play the incident',exact:false}).press('Enter');await p.getByRole('button',{name:'Skip conversation'}).press('Enter');await p.waitForFunction(()=>!!document.querySelector('.iz-world canvas'));await p.waitForTimeout(200);}
async function close(p){await p.getByRole('button',{name:'Skip conversation'}).press('Enter');}
async function room(p,name){await p.locator('.iz-location-list').getByRole('button',{name,exact:true}).press('Enter');}
async function inspect(p,name){await p.getByRole('button',{name:'Inspect '+name,exact:true}).press('Enter');await close(p);}
async function task(p){await p.locator('.iz-current-task').press('Enter');}
async function apply(p){await p.getByRole('button',{name:/^Test this/}).press('Enter');await p.getByRole('button',{name:'Apply tested reasoning'}).press('Enter');}
async function reorder(p,expected){for(let target=0;target<expected.length;target++){let index=await p.locator('.iz-blocks li').evaluateAll((nodes,title)=>nodes.findIndex(n=>n.textContent.includes(title)),expected[target]);while(index>target){await p.locator('.iz-blocks li').nth(index).getByRole('button',{name:/ up$/}).press('Enter');index--;}}}
async function finish(p,fix,all=true,strategy='Plan a staged migration'){
 await start(p);await p.getByRole('button',{name:'Use simplified navigation',exact:true}).press('Enter');
 await room(p,'Finance');await inspect(p,'Finance analyst');await inspect(p,'Payroll preview');
 await room(p,'HR');await inspect(p,'HR partner');await inspect(p,'Salary history');
 if(all){await room(p,'Operations');await inspect(p,'Operations engineer');await room(p,'Server room');await inspect(p,'System owner');await inspect(p,'Legacy resolver');}
 await task(p);await p.getByLabel('The effective-dated salary history').check();await apply(p);
 await task(p);await p.getByRole('button',{name:'Test this reasoning'}).press('Enter');assert.match(await p.locator('.iz-feedback').innerText(),/excluding future/);
 await reorder(p,['effective_date','ORDER BY','LIMIT']);await apply(p);
 if(fix.startsWith('Patch the date')){await p.getByRole('button',{name:'Use spatial map',exact:true}).click();await p.waitForFunction(()=>document.querySelector('canvas')&&!document.querySelector('.iz-world-loading'));}
 await task(p);assert.match(await p.locator('dialog').innerText(),/owner is unavailable/);await p.locator('.iz-decision-list').getByRole('button',{name:fix,exact:false}).press('Enter');await p.getByRole('button',{name:'Continue investigation'}).press('Enter');
 if(fix.startsWith('Patch the date')) {
  await p.locator('.iz-room-shortcuts summary').click();await room(p,'Finance');await p.locator('canvas').screenshot({path:`${out}/consequence-payroll.png`});await p.getByRole('button',{name:'Use simplified navigation',exact:true}).click();
 }
 if(!all){await room(p,'Operations');await inspect(p,'Operations engineer');}
 await task(p);await p.getByRole('button',{name:'Test this reasoning'}).press('Enter');assert.match(await p.locator('.iz-feedback').innerText(),/producer|worker|responsibility/);
 await reorder(p,['Producer:','Queue:','Worker:','Destination:','Retry transient','Failure record']);await apply(p);
 if(fix.startsWith('Patch the date')){await room(p,'Operations');await p.getByRole('button',{name:'Use spatial map',exact:true}).click();await p.waitForFunction(()=>document.querySelector('canvas')&&!document.querySelector('.iz-world-loading'));await p.locator('canvas').screenshot({path:`${out}/consequence-delivery.png`});await p.getByRole('button',{name:'Use simplified navigation',exact:true}).click();}
 await room(p,'Architecture space');await task(p);for(const name of ['HRMS → HISTORY','HISTORY → PAYROLL','HISTORY → REPORTING'])await p.getByLabel(name,{exact:true}).check();await apply(p);
 if(fix.startsWith('Patch the date')){await p.getByRole('button',{name:'Use spatial map',exact:true}).click();await p.waitForFunction(()=>document.querySelector('canvas')&&!document.querySelector('.iz-world-loading'));await p.locator('canvas').screenshot({path:`${out}/consequence-dependencies.png`});await p.getByRole('button',{name:'Use simplified navigation',exact:true}).click();}
 await task(p);await p.locator('.iz-decision-list').getByRole('button',{name:strategy,exact:false}).press('Enter');await p.getByRole('button',{name:'Read the incident report'}).press('Enter');
 await p.waitForFunction(()=>document.activeElement?.id==='iz-report-title');const box=await p.locator('#iz-report-title').boundingBox();assert.ok(box.y>=0&&box.y<80,JSON.stringify(box));
}
try {
 const matrix=[[360,800],[390,844],[430,932],[844,390],[768,1024],[1280,800]];
 for(const [width,height] of matrix){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width<500?2:1,isMobile:width<500,hasTouch:width<900,reducedMotion:'reduce',colorScheme:'dark'});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await start(p);assert.equal(await p.locator('canvas').count(),1);
  await p.screenshot({path:`${out}/spawn-${width}x${height}.png`});
  const geometry=await p.locator('.iz-world').evaluate(e=>({host:e.getBoundingClientRect().toJSON(),canvas:e.querySelector('canvas').getBoundingClientRect().toJSON(),backing:[e.querySelector('canvas').width,e.querySelector('canvas').height]}));assert.deepEqual(geometry.backing,[900,540]);assert.ok(Math.abs(geometry.canvas.width/geometry.canvas.height-900/540)<.02);assert.ok(Math.abs(geometry.host.width-geometry.canvas.width)<4);assert.ok(Math.abs(geometry.host.height-geometry.canvas.height)<4);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // First pointer press must work while the map owns keyboard focus.
  await p.locator('.iz-world').focus();const first=p.getByRole('button',{name:'Move right',exact:true});await first.scrollIntoViewIfNeeded();const firstBox=await first.boundingBox();const initialFrame=await p.locator('canvas').evaluate(c=>c.toDataURL());await p.mouse.move(firstBox.x+firstBox.width/2,firstBox.y+firstBox.height/2);await p.mouse.down();await p.waitForTimeout(120);await p.mouse.up();await p.waitForTimeout(60);assert.ok(initialFrame!==await p.locator('canvas').evaluate(c=>c.toDataURL()),'Initial pointer press lost movement on map blur');
  // Known world-space NPC point; click through the scaled display into the scene.
  await p.locator('.iz-world').scrollIntoViewIfNeeded();let c=await p.locator('canvas').boundingBox();await p.mouse.click(c.x+c.width*.5,c.y+c.height*(240/540));await p.getByRole('dialog').waitFor({timeout:10000});await close(p);
  await p.getByRole('button',{name:'Help',exact:true}).click();assert.equal(await p.locator('dialog .iz-keyboard-only:visible').count(),await p.evaluate(()=>matchMedia('(max-width:760px), (hover:none) and (pointer:coarse)').matches)?0:1);await p.keyboard.press('Escape');await p.waitForFunction(()=>document.activeElement?.classList.contains('iz-world'));
  await p.getByRole('button',{name:'Next room',exact:true}).click();assert.match(await p.locator('.iz-toolbar').innerText(),/FINANCE/);await p.getByRole('button',{name:'Previous room',exact:true}).click();
  // Pointer release/cancellation, focus loss and pause must stop motion.
  const pixels=()=>p.locator('canvas').evaluate(c=>c.toDataURL());
  const down=p.getByRole('button',{name:'Move down',exact:true});let r=await down.boundingBox();await down.scrollIntoViewIfNeeded();r=await down.boundingBox();const before=await pixels();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.waitForTimeout(170);await p.mouse.up();await p.waitForTimeout(80);const stopped=await pixels();assert.notEqual(before,stopped);await p.waitForTimeout(180);assert.equal(await pixels(),stopped);
  for(const reason of ['pointercancel','blur','pause']){await p.mouse.down();await p.waitForTimeout(100);if(reason==='pointercancel')await down.dispatchEvent('pointercancel');else if(reason==='blur')await p.evaluate(()=>window.dispatchEvent(new Event('blur')));else await p.getByRole('button',{name:'Pause',exact:true}).dispatchEvent('click');await p.mouse.up();await p.waitForTimeout(80);const frame=await pixels();await p.waitForTimeout(150);assert.equal(await pixels(),frame);if(reason==='pause')await p.getByRole('button',{name:'Resume investigation'}).click();}
  // A map tap still works after a direction button had focus.
  await down.focus();await p.locator('.iz-world').scrollIntoViewIfNeeded();c=await p.locator('canvas').boundingBox();await p.mouse.click(c.x+c.width*.5,c.y+c.height*(240/540));await p.getByRole('dialog').waitFor({timeout:10000});await close(p);
  // Resize/orientation change uses the same coordinate model.
  await p.setViewportSize({width:height,height:width});await p.waitForTimeout(200);assert.equal(await p.locator('canvas').count(),1);await p.setViewportSize({width,height});await p.waitForTimeout(200);
  await p.getByRole('combobox',{name:'Color theme'}).selectOption('light');await p.waitForTimeout(250);await p.screenshot({path:`${out}/world-${width}x${height}-light.png`,fullPage:true});await p.getByRole('combobox',{name:'Color theme'}).selectOption('dark');await p.waitForTimeout(250);await p.locator('.iz-world').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/world-${width}x${height}-dark.png`});
  const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  await p.getByRole('button',{name:'Use simplified navigation',exact:true}).click();assert.equal(await p.locator('canvas').count(),0);await p.getByRole('button',{name:'Use spatial map',exact:true}).click();await p.waitForFunction(()=>!!document.querySelector('.iz-world canvas'));assert.equal(await p.locator('canvas').count(),1);
  assert.deepEqual(errors,[]);results.push({width,height,geometry,pointerMapping:true,stopInputs:true,resize:true,axe:0});console.log(`${width}×${height}: spatial framing, pointer mapping, movement stops, resize and accessibility passed`);await context.close();
 }
 const p=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 for(const [fix,title] of [['Reconcile this payroll','The Firefighter'],['Rewrite the integration','The Great Rewrite'],['Patch the date resolver','The Pragmatic Modernizer']]){
  await finish(p,fix);assert.equal(await p.locator('#iz-report-title').innerText(),title);assert.equal(await p.getByText('The Archaeologist / additional insight').count(),1);await p.screenshot({path:`${out}/outcome-${title.replaceAll(' ','-')}.png`});await p.getByText('How this outcome was assessed',{exact:true}).click();assert.equal(await p.evaluate(()=>document.activeElement?.id==='iz-report-title'),false);await p.screenshot({path:`${out}/ending-${title.replaceAll(' ','-')}.png`,fullPage:true});
  assert.equal(await p.getByRole('link',{name:'Book a conversation'}).getAttribute('href'),'https://cal.com/mohd-paramasvara/discovery');assert.equal(await p.getByRole('link',{name:'2-page résumé'}).getAttribute('href'),'https://rxresu.me/mwara95/2-page-resume');
  await p.getByRole('button',{name:'Replay incident'}).click();await close(p);assert.match(await p.locator('.iz-toolbar').innerText(),/0 \/ 6 evidence/);await p.locator('.iz-system-status summary').click();assert.match(await p.locator('.iz-system-status').innerText(),/RM7,500/);console.log(title,'normal play / report focus / replay passed');
 }
 await finish(p,'Patch the date resolver',false,'Add reconciliation');assert.equal(await p.locator('#iz-report-title').innerText(),'The Firefighter');assert.equal(await p.getByText('The Archaeologist / additional insight').count(),0);
 for(const title of ['The Firefighter','The Great Rewrite','The Pragmatic Modernizer']){
  await p.goto(base+'/incident-zero/');const requests=[];p.on('request',r=>requests.push(r.url()));await p.getByRole('button',{name:'Preview the engineering decisions'}).click();await p.locator('.iz-decision-list').getByRole('button',{name:title,exact:false}).click();await p.waitForFunction(()=>document.activeElement?.id==='iz-report-title');assert.equal(await p.locator('#iz-report-title').innerText(),title);assert.equal(await p.getByText('The Archaeologist / additional insight').count(),0);assert.match(await p.locator('.iz-report').innerText(),/auto-selected/);assert.ok(!requests.some(url=>/\/game-[^/]+\.js/.test(url)));await p.getByRole('button',{name:'Replay incident'}).click();await close(p);assert.match(await p.locator('.iz-toolbar').innerText(),/0 \/ 6 evidence/);console.log(title,'preview / focus / no engine load / isolation passed');
 }
 // Track global listener balance during renderer teardown, including asleep loops.
 const lifecycle=await browser.newPage({viewport:{width:1280,height:800}});
 await lifecycle.addInitScript(() => {
   const active=[];const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
   EventTarget.prototype.addEventListener=function(type,fn,options){if((this===window||this===document)&&!options?.once&&!active.some(e=>e.target===this&&e.type===type&&e.fn===fn))active.push({target:this,type,fn});return add.call(this,type,fn,options);};
   EventTarget.prototype.removeEventListener=function(type,fn,options){const i=active.findIndex(e=>e.target===this&&e.type===type&&e.fn===fn);if(i>=0)active.splice(i,1);return remove.call(this,type,fn,options);};
   window.listenerBalance=()=>active.length;
 });
 await start(lifecycle);await lifecycle.getByRole('button',{name:'Use simplified navigation',exact:true}).click();await lifecycle.waitForTimeout(200);const baseline=await lifecycle.evaluate(()=>window.listenerBalance());
 for(let cycle=0;cycle<3;cycle++) {
  await lifecycle.getByRole('button',{name:'Use spatial map',exact:true}).click();await lifecycle.waitForFunction(()=>document.querySelector('canvas')&&!document.querySelector('.iz-world-loading'));
  await lifecycle.getByRole('button',{name:'Pause',exact:true}).click();await lifecycle.locator('.iz-mode button').dispatchEvent('click');await lifecycle.getByRole('button',{name:'Resume investigation'}).click();await lifecycle.waitForTimeout(200);assert.equal(await lifecycle.evaluate(()=>window.listenerBalance()),baseline,'Renderer leaked global listeners while asleep');
 }
 await lifecycle.close();console.log('Paused renderer teardown: three cycles, no global listener growth');
 for(const route of ['/','/work-with-me/','/incident-zero/']){await p.goto(base+route,{waitUntil:'networkidle'});await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('h1').count(),1);}
 await writeFile(`${out}/results.json`,JSON.stringify({results,normalEndings:3,previewEndings:3,replay:true,routeRefresh:true,pausedTeardownCycles:3,listenerBalance:baseline},null,2));
} finally {await browser.close();}
