// Read-only development observations, ordinary keyboard/pointer input. No combat mutation.
import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {resolve} from 'node:path';import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/portfolio-qa','package.json'));const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://localhost:5173',out=resolve(process.env.QA_OUTPUT_DIR||'.qa/defence-stage2');await mkdir(out,{recursive:true});const browser=await chromium.launch({channel:'chrome'}),p=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
const key='incident-zero-defence-v2',read=()=>p.evaluate(()=>window.incidentZeroDiagnostics.inspect());
await p.goto(base+'/incident-zero/defence/');if(process.env.QA_SEED){await p.getByRole('button',{name:'Start run',exact:true}).waitFor();await p.evaluate(async seed=>{const {startRun,freshRun,runKey}=await import('/src/features/incident-zero/defence/run.ts');sessionStorage.setItem(runKey,JSON.stringify({...startRun(freshRun(),seed),status:'paused'}));},process.env.QA_SEED);await p.reload();await p.getByRole('button',{name:'Resume run'}).click();}else await p.getByRole('button',{name:'Start run',exact:true}).click();
let held=new Set(),weapon='pulse',used=new Set(),attempts=[],completed=false;const begun=Date.now();
const keys=async desired=>{for(const k of held)if(!desired.has(k))await p.keyboard.up(k);for(const k of desired)if(!held.has(k))await p.keyboard.down(k);held=desired;};
const fire=async()=>{const r=await p.getByRole('button',{name:'FIRE Assisted aim'}).boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();};await fire();
try{for(let tick=0;tick<3500;tick++){
 const data=await read();
 if(data.status==='victory'){
  await keys(new Set());await p.mouse.up();const r=await p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);console.log('LEVEL',r.level,r.score,r.lastResult.integrity);
  await p.screenshot({path:`${out}/level-${r.level}-result.png`});
  // Every actual intermission reload retains totals, without new awards.
  await p.reload();await p.getByRole('heading',{name:r.level===5?'Run complete.':'Service restored.',exact:true}).waitFor();const reloaded=await p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);assert.deepEqual(reloaded,r);
  if(r.level===5){completed=true;break;}
  await p.getByRole('button',{name:`Continue to level ${r.level+1}`,exact:true}).click();await fire();continue;
 }
 if(data.status==='defeat'){
  await keys(new Set());await p.mouse.up();const r=await p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);attempts.push(r);console.log('DEFEAT',r.level,r.lastResult.score);
  await p.screenshot({path:`${out}/defeat-actual.png`});if(attempts.length>=3)break;
  await p.getByRole('button',{name:'Retry same seed',exact:true}).click();await fire();continue;
 }
 // Choose visible enemies; navigate the actual generated geometry through its clearance graph.
 const plan=await p.evaluate(async d=>{const {worldLineOfSight,worldBlocked}=await import('/src/features/incident-zero/defence/floor.ts'),{searchPath}=await import('/src/features/incident-zero/defence/navigation.ts');
 const player=d.player,enemies=d.enemies.filter(e=>e.hp>0),distance=e=>Math.hypot(player.x-e.x,player.y-e.y);
 const visible=enemies.filter(e=>worldLineOfSight(d.floor,player,e,13)).sort((a,b)=>distance(a)-distance(b)),nearest=visible[0];let target,desired='pulse';
 if(nearest){const range=distance(nearest);desired=range<125?'fan':'pulse';
  // Kite pursuing diamonds and dodge fixed probe aim instead of standing in contact.
  if(nearest.kind==='flood'&&range<105){const dx=(player.x-nearest.x)/(range||1),dy=(player.y-nearest.y)/(range||1);const options=[{x:player.x+dx*65,y:player.y+dy*65},{x:player.x-dy*65,y:player.y+dx*65},{x:player.x+dy*65,y:player.y-dx*65}];target=options.find(q=>!worldBlocked(d.floor,q.x,q.y,14)&&worldLineOfSight(d.floor,player,q,14));}
  else if(nearest.warning>0){const dx=(nearest.x-player.x)/(range||1),dy=(nearest.y-player.y)/(range||1);target=[{x:player.x-dy*55,y:player.y+dx*55},{x:player.x+dy*55,y:player.y-dx*55}].find(q=>!worldBlocked(d.floor,q.x,q.y,14)&&worldLineOfSight(d.floor,player,q,14));}
  else if(range>225)target=nearest;
 }
 if(!target&&!nearest&&enemies.length){const routes=enemies.map(e=>({e,path:searchPath(d.floor,player,e)})).filter(x=>x.path.length).sort((a,b)=>a.path.length-b.path.length);target=routes[0]?.e;}
 if(!enemies.length)target=d.floor.terminal;
 let waypoint;if(target){if(worldLineOfSight(d.floor,player,target,14))waypoint=target;else {const path=searchPath(d.floor,player,target);waypoint=path.find(q=>Math.hypot(q.x-player.x,q.y-player.y)>8);}}
 return {desired,waypoint,remaining:enemies.length,terminalDistance:Math.hypot(player.x-d.floor.terminal.x,player.y-d.floor.terminal.y)};
 },data);
 if(plan.desired!==weapon){await p.keyboard.press(plan.desired==='fan'?'2':'1');weapon=plan.desired;}used.add(weapon);
 const next=new Set(),q=plan.waypoint;if(q){if(q.x-data.player.x>1.5)next.add('d');if(q.x-data.player.x< -1.5)next.add('a');if(q.y-data.player.y>1.5)next.add('s');if(q.y-data.player.y< -1.5)next.add('w');}await keys(next);
 if(!plan.remaining&&plan.terminalDistance<58)await p.keyboard.press('e');
 if(tick%150===0)console.log(tick,data.floor.level,Math.round(data.player.x),Math.round(data.player.y),plan.remaining,data.player.integrity);
 if(tick%300===0)await p.screenshot({path:`${out}/floor-${data.floor.level}-desktop.png`});
 await p.waitForTimeout(75);
}
const final=await p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);await writeFile(`${out}/playtest-results.json`,JSON.stringify({completed,durationMs:Date.now()-begun,used:[...used],attempts,final,errors,observation:'Read-only dev geometry/actor observations. Ordinary keyboard and pointer controls; scripted time is not human playtime.'},null,2));assert.deepEqual(errors,[]);assert.ok(completed,'must complete all five levels through normal controls');assert.equal(final.completed,1);
}finally{await browser.close();}
