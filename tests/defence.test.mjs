import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const urls=new Map();
async function moduleUrl(file){if(urls.has(file))return urls.get(file);let code=ts.transpileModule(await readFile(`src/features/incident-zero/defence/${file}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;for(const dependency of [...code.matchAll(/from ['"]\.\/([^'"]+)['"]/g)])code=code.replace(dependency[0],`from ${JSON.stringify(await moduleUrl(dependency[1]))}`);const url=`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;urls.set(file,url);return url;}
async function load(file){return import(await moduleUrl(file));}
const sim=await load('simulation'),session=await load('session');
const playing=()=>{const s=sim.newCombat();s.status='playing';return s;};
const empty=sim.emptyInput;
test('weapons enforce shared cooldown even across switching, with distinct range/spread/cadence',()=>{
 const s=playing();assert.ok(sim.fire(s));assert.equal(s.shots.length,1);assert.equal(sim.fire(s),false);s.weapon='fan';assert.equal(sim.fire(s),false);sim.step(s,empty(),.1);sim.step(s,empty(),.1);sim.step(s,empty(),.05);assert.ok(sim.fire(s));assert.equal(s.shots.length,6);assert.ok(sim.weapons.fan.range<sim.weapons.pulse.range);assert.ok(sim.weapons.fan.cooldown>sim.weapons.pulse.cooldown);
});
test('damage removes one integrity and protection blocks repeated contact; defeat is terminal',()=>{
 const s=playing();assert.ok(sim.hurtPlayer(s));assert.equal(s.player.integrity,2);assert.equal(sim.hurtPlayer(s),false);for(let i=0;i<10;i++)sim.step(s,empty(),.1);assert.ok(sim.hurtPlayer(s));s.player.protection=0;assert.ok(sim.hurtPlayer(s));assert.equal(s.status,'defeat');assert.equal(sim.hurtPlayer(s),false);assert.equal(sim.fire(s),false);assert.equal(sim.restore(s),false);const p={...s.player};sim.step(s,{...empty(),x:1},.1);assert.deepEqual(s.player,p);
});
test('each enemy awards points once regardless of repeated collision callbacks',()=>{
 const s=playing();for(const e of s.enemies){sim.hitEnemy(s,e,100);sim.hitEnemy(s,e,100);}assert.equal(s.score,1000);assert.equal(s.flood,4);assert.equal(s.probe,4);
});
test('victory requires all enemies AND terminal interaction; bonuses once, completed result frozen',()=>{
 const s=playing();Object.assign(s.player,sim.arena.terminal);assert.equal(sim.restore(s),false);for(const e of s.enemies)sim.hitEnemy(s,e,100);s.player.x=80;assert.equal(sim.restore(s),false);Object.assign(s.player,sim.arena.terminal);assert.ok(sim.restore(s));assert.equal(s.score,1750);assert.equal(sim.restore(s),false);assert.equal(sim.hurtPlayer(s),false);assert.equal(sim.fire(s),false);assert.equal(s.score,1750);
});
test('damaged completion earns 500 restoration points with no undamaged bonus',()=>{
 const s=playing();sim.hurtPlayer(s);for(const e of s.enemies)sim.hitEnemy(s,e,100);Object.assign(s.player,sim.arena.terminal);sim.restore(s);assert.equal(s.score,1500);
});
test('restart model resets actors, timers, hits, score and projectiles and retains chosen tool',()=>{
 const s=playing();s.weapon='fan';sim.fire(s);sim.hurtPlayer(s);sim.hitEnemy(s,s.enemies[0],100);const retry=sim.newCombat(s.weapon);assert.equal(retry.score,0);assert.equal(retry.hits,0);assert.equal(retry.cooldown,0);assert.equal(retry.player.protection,0);assert.equal(retry.player.integrity,3);assert.equal(retry.enemies.filter(e=>e.hp>0).length,8);assert.equal(retry.shots.length,0);assert.equal(retry.weapon,'fan');assert.equal(retry.status,'ready');
});
test('pause freezes all simulation, including timers and positions',()=>{
 const s=playing();sim.fire(s);s.status='paused';const before=structuredClone(s);sim.step(s,{...empty(),x:1,fire:true},.1);assert.deepEqual(s,before);
});
test('movement is frame-rate independent, diagonal normalised and walls block movement',()=>{
 const a=playing(),b=playing();for(let i=0;i<60;i++)sim.step(a,{...empty(),x:1},1/60);for(let i=0;i<30;i++)sim.step(b,{...empty(),x:1},1/30);assert.ok(Math.abs(a.player.x-b.player.x)<.001);assert.ok(a.player.x<278);const c=playing();sim.step(c,{...empty(),x:1,y:-1},.1);assert.ok(Math.abs(sim.distance(c.player,{x:85,y:445})-18.5)<.001);
});
test('walls block fast projectiles and line of sight; fan expires at short range',()=>{
 assert.equal(sim.lineOfSight({x:250,y:80},{x:350,y:80}),false);assert.equal(sim.lineOfSight({x:250,y:205},{x:350,y:205}),true);const s=playing();s.player={...s.player,x:270,y:80,angle:0};sim.fire(s);sim.step(s,empty(),.1);assert.equal(s.shots.length,0);const f=playing();f.weapon='fan';f.player.angle=0;sim.fire(f);for(let i=0;i<6;i++)sim.step(f,empty(),.1);assert.equal(f.shots.length,0);
});
test('fixed spawn is safe, all actors outside walls; grid paths connect combat spaces',()=>{
 const s=playing();assert.equal(sim.blocked(s.player,12),false);for(const e of s.enemies){assert.equal(sim.blocked(e,13),false);assert.ok(sim.distance(e,s.player)>150);const path=sim.findPath(e,s.player);assert.ok(path.length>0);assert.ok(path.every(p=>!sim.blocked(p,13)));}for(let i=0;i<10;i++)sim.step(s,empty(),.1);assert.equal(s.player.integrity,3);
});
test('flood packets traverse cover without getting stuck and probe attacks telegraph',()=>{
 const s=playing();s.enemies=s.enemies.filter(e=>e.id===2);const e=s.enemies[0];e.active=true;const original=sim.distance(e,s.player);for(let i=0;i<200;i++)sim.step(s,empty(),.05);assert.ok(sim.distance(e,s.player)<original-100);assert.equal(sim.blocked(e,13),false);
 const p=playing();p.player.x=220;p.player.y=440;p.enemies=p.enemies.filter(e=>e.id===1);p.enemies[0].cooldown=0;sim.step(p,empty(),.05);assert.ok(p.enemies[0].warning>0);assert.equal(p.shots.filter(x=>x.hostile).length,0);for(let i=0;i<18;i++)sim.step(p,empty(),.05);assert.ok(p.shots.some(x=>x.hostile));
});
function active(){return {...session.parseSession(null),status:'active',attemptId:'attempt-a'};}
const result={attemptId:'attempt-a',outcome:'victory',score:1750,flood:4,probe:4,undamaged:true};
test('session completion is idempotent and fresh attempts retain best/count',()=>{
 const first=session.finishSession(active(),result),again=session.finishSession(first,result);assert.equal(again.completed,1);assert.equal(again.best,1750);assert.strictEqual(again,first);assert.strictEqual(session.finishSession(active(),{...result,attemptId:'wrong'}).status,'active');const defeated=session.finishSession({...first,status:'active',attemptId:'b'},{...result,attemptId:'b',outcome:'defeat',score:1000});assert.equal(defeated.best,1750);assert.equal(defeated.completed,1);
});
test('active refresh recovers beginning in ready state, preserves best/count/tool; result refresh never reawards',()=>{
 const recovered=session.recoverSession({...active(),weapon:'fan',best:1500,completed:2});assert.equal(recovered.recovered,true);assert.equal(recovered.session.status,'ready');assert.equal(recovered.session.best,1500);assert.equal(recovered.session.completed,2);assert.equal(recovered.session.weapon,'fan');const finished=session.finishSession(active(),result);const reload=session.parseSession(JSON.stringify(finished));assert.deepEqual(session.recoverSession(reload),{session:finished,recovered:false});assert.equal(session.finishSession(reload,result).completed,1);
});
test('invalid, outdated and unavailable storage gracefully fall back to playable memory',()=>{
 for(const raw of ['{','null','{}',JSON.stringify({...active(),version:2}),JSON.stringify({...active(),best:-1}),JSON.stringify({...active(),weapon:'unknown'}),JSON.stringify({...active(),status:'victory',lastResult:null}),JSON.stringify({...active(),lastResult:{...result,score:9999}})])assert.equal(session.parseSession(raw).status,'ready');
 const port=session.createSessionStore({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});assert.equal(port.load().best,0);port.save(active());assert.equal(port.load().status,'active');const memory=session.createSessionStore();memory.save(active());assert.equal(memory.load().status,'active');
});
test('navigation reaches players beside wall edges whose raw grid cell is obstructed',()=>{
 const path=sim.findPath({x:500,y:230},{x:327,y:310});assert.ok(path.length>0);assert.ok(path.every(p=>!sim.blocked(p,13)));assert.ok(sim.distance(path.at(-1),{x:327,y:310})<45);
});
test('quick interaction presses are latched until a frame consumes them; blur/pause clearing and focused UI filtering',async()=>{
 const {createInput}=await load('input');
 const previous=globalThis.window;globalThis.window=new EventTarget();const host=new EventTarget();let selected=0;
 const input=createInput(host,()=>{},()=>selected++);
 const send=(target,type,key,focusedUi=false)=>{const e=new Event(type,{cancelable:true});Object.defineProperty(e,'key',{value:key});if(focusedUi)Object.defineProperty(e,'target',{value:{}});target.dispatchEvent(e);};
 try{
  send(host,'keydown','e');send(window,'keyup','e');assert.equal(input.value.interact,true);
  send(host,'keydown','d');assert.equal(input.value.x,1);input.clear();assert.deepEqual(input.value,empty());const repeat=new Event('keydown',{cancelable:true});Object.defineProperties(repeat,{key:{value:'d'},repeat:{value:true}});host.dispatchEvent(repeat);assert.equal(input.value.x,0);
  send(host,'keydown','d',true);send(host,'keydown','q',true);assert.equal(input.value.x,0);assert.equal(selected,0);
  send(host,'keydown','q');assert.equal(selected,1);input.destroy();send(host,'keydown','d');assert.equal(input.value.x,0);
 }finally{input.destroy();globalThis.window=previous;}
});

test('only Flood Packets inflict contact damage; probes require their projectile attack',()=>{
 const probe=playing();probe.enemies=probe.enemies.filter(e=>e.kind==='probe').slice(0,1);Object.assign(probe.enemies[0],{x:probe.player.x,y:probe.player.y,cooldown:10});sim.step(probe,empty(),.05);assert.equal(probe.player.integrity,3);
 const flood=playing();flood.enemies=flood.enemies.filter(e=>e.kind==='flood').slice(0,1);Object.assign(flood.enemies[0],{x:flood.player.x,y:flood.player.y});sim.step(flood,empty(),.05);assert.equal(flood.player.integrity,2);
});

test('attempt IDs work without secure-context randomUUID and with unavailable or blocked crypto',()=>{
 const httpCrypto={getRandomValues(bytes){bytes.fill(42);return bytes;}};
 const first=session.createAttemptId(httpCrypto),second=session.createAttemptId(httpCrypto);
 assert.notEqual(first,second);assert.ok(first.endsWith('2a'.repeat(16)));
 const none=session.createAttemptId(null),blocked=session.createAttemptId({getRandomValues(){throw new Error('blocked');}});
 assert.ok(none.startsWith('attempt-'));assert.ok(blocked.startsWith('attempt-'));assert.notEqual(none,blocked);
});
