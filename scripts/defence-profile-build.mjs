// Build an isolated production profiling harness without changing gameplay sources.
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {resolve} from 'node:path';
import {build} from 'vite';
const phase=process.argv[2]||'baseline',root=resolve(`.qa/defence-stage2/${phase}`);await mkdir(root+'/defence',{recursive:true});
if(phase==='baseline'){for(const file of ['simulation.ts','renderer.ts'])await cp(`${root}/pristine/${file}`,`${root}/defence/${file}`);}
if(phase!=='baseline') {for(const file of ['simulation.ts','renderer.ts','input.ts','floor.ts','navigation.ts','diagnostics.ts','generation.ts'])await cp(`src/features/incident-zero/defence/${file}`,`${root}/defence/${file}`);await cp('src/features/incident-zero/PortfolioGame.ts',root+'/PortfolioGame.ts');}
let sim=await readFile(root+'/defence/simulation.ts','utf8');
{sim=sim.replace('export function findPath(', 'function findPathRaw(');sim+=`\nexport function findPath(from:Vec,to:Vec,...extra:any[]):Vec[]{const start=performance.now();const path=findPathRaw(from,to,...extra);(window as any).__profile.nav.push(performance.now()-start);return path;}\n`;}
await writeFile(root+'/defence/simulation.ts',sim);
let renderer=await readFile(root+'/defence/renderer.ts','utf8');
// Instrument copied source; observers and raw timings do not enter normal bundles.
renderer=renderer.replace("    const reduced = matchMedia",`    (window as any).__profile.state=()=>state;\n    const reduced = matchMedia`);
renderer=renderer.replace('step(state, input.value, delta / 1000);',`const p=(window as any).__profile; const profileBegin=performance.now();\n            p.before(state,input.value);step(state, input.value, delta / 1000);p.sim.push(performance.now()-profileBegin);p.counts.push([state.enemies.filter(e=>e.hp>0).length,state.shots.length]);p.frame.push(profileBegin);`);
const updateAt=renderer.indexOf('        update(');
renderer=renderer.slice(0,updateAt)+renderer.slice(updateAt).replace(/this.draw\(\);\s*emit\(\);/, 'const renderStart=performance.now();this.draw();p.render.push(performance.now()-renderStart);emit();');
await writeFile(root+'/defence/renderer.ts',renderer);
await writeFile(root+'/index.html','<html><body style="margin:0;background:#101110"><div id="arena" tabindex="0" style="width:900px;height:540px"></div><script type="module" src="/main.ts"></script></body></html>');
await writeFile(root+'/main.ts',`${phase==='baseline'?'':"import {generateFloor} from './defence/generation';"}\nimport {createDefence} from './defence/renderer';\nconst p:any=(window as any).__profile={frame:[],sim:[],render:[],nav:[],counts:[],before:()=>{},longTasks:[]};\ntry{new PerformanceObserver(list=>p.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});}catch{}\n(window as any).__factory=createDefence;\n(window as any).__controller=createDefence(document.getElementById('arena')!,'pulse',()=>{},()=>{},()=>{(window as any).__ready=true},()=>{}${phase==='baseline'?'':",new URLSearchParams(location.search).has('maximum')?generateFloor('performance-maximum',5):undefined"});`);
await build({configFile:false,root,build:{outDir:'build',emptyOutDir:true},resolve:{dedupe:['phaser']}});
