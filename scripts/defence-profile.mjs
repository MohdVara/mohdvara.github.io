import {createRequire} from 'node:module';import {resolve} from 'node:path';import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'/private/tmp/portfolio-qa','package.json'));const {chromium}=require('playwright');
const phase=process.argv[2]||'baseline',base=process.env.QA_URL||'http://127.0.0.1:4188',out=resolve(`.qa/defence-stage2/${phase}`);await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
const scenarios=process.env.PROFILE_SCENARIOS?.split(',')||['idle','pursuit','navigation','firing','combined'];
try{for(const scenario of scenarios){const repeated=['navigation','combined'].includes(scenario)?3:1;for(let sample=0;sample<repeated;sample++){
 const p=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.waitForFunction(()=>window.__ready);await p.evaluate(scenario=>{
  const p=window.__profile,c=window.__controller,s=p.state(),original=structuredClone(s.enemies);c.start();
  if(scenario==='idle')s.enemies=[];
  if(scenario==='pursuit')s.enemies.forEach(e=>e.kind='flood');
  p.before=(s,input)=>{s.player.protection=10;s.enemies.forEach(e=>{e.hp=1000;e.active=true;});input.assisted=true;input.fire=['firing','combined'].includes(scenario);input.x=['pursuit','navigation','combined'].includes(scenario)?Math.sin(s.time*.8):0;input.y=['pursuit','navigation','combined'].includes(scenario)?Math.cos(s.time*.65):0;};
  p.initialEnemies=original.length;
 },scenario);
 await p.waitForTimeout(1200);await p.evaluate(()=>{const p=window.__profile;p.frame=[];p.sim=[];p.render=[];p.nav=[];p.counts=[];p.longTasks=[];});
 const cdp=await p.context().newCDPSession(p);let trace;
 if(scenario==='navigation'&&sample===0){await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,disabled-by-default-v8.gc,disabled-by-default-devtools.timeline',transferMode:'ReturnAsStream'});}
 const duration=Number(process.env.PROFILE_SECONDS||60)*1000;await p.waitForTimeout(duration);
 if(scenario==='navigation'&&sample===0){const complete=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const {stream}=await complete;trace='';while(true){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});await writeFile(`${out}/trace-navigation.json`,trace);}
 const result=await p.evaluate(({scenario,sample,duration})=>{const p=window.__profile;window.__controller.pause();const summary=values=>{const sorted=[...values].sort((a,b)=>a-b);return {n:sorted.length,median:sorted[Math.floor(sorted.length*.5)]||0,p95:sorted[Math.floor(sorted.length*.95)]||0,p99:sorted[Math.floor(sorted.length*.99)]||0,max:sorted.at(-1)||0};};const intervals=p.frame.slice(1).map((v,i)=>v-p.frame[i]);const spikes=intervals.map((ms,i)=>({ms,at:p.frame[i],enemies:p.counts[i][0],projectiles:p.counts[i][1],sim:p.sim[i],render:p.render[i]})).filter(x=>x.ms>33.3);return{scenario,sample,duration,frames:summary(intervals),over33:spikes.length,over50:intervals.filter(x=>x>50).length,over100:intervals.filter(x=>x>100).length,simulation:summary(p.sim),navigation:summary(p.nav),rendering:summary(p.render),spikes,longTasks:p.longTasks,environment:{userAgent:navigator.userAgent,cores:navigator.hardwareConcurrency},status:p.state().status};},{scenario,sample,duration});
 result.errors=errors;results.push(result);await writeFile(`${out}/performance.json`,JSON.stringify(results,null,2));console.log(phase,scenario,sample,JSON.stringify({frames:result.frames,sim:result.simulation,nav:result.navigation,spikes:result.over33,errors}));await p.close();
}}}finally{await browser.close();}
