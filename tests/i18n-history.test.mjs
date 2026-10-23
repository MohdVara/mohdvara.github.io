import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
function compile(source,imports={}) {const context={exports:{},require:name=>imports[name]};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const resolution=compile(await readFile('src/i18n/localeResolution.ts','utf8'),{'./languages':{isLocale:value=>registry.some(item=>item.locale===value)}});
const {createLocaleRestorer}=compile(await readFile('src/i18n/history.ts','utf8'),{'./localeResolution':resolution});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
function fixture(){let path='/ja/incident-zero/';const loads=[],changes=[],commits=[],errors=[];const sync=createLocaleRestorer({path:()=>path,load:locale=>{const pending=deferred();loads.push({locale,...pending});return pending.promise;},change:async locale=>{changes.push(locale);},commit:path=>commits.push(path),failed:()=>errors.push(path)});return {sync,loads,changes,commits,errors,setPath:next=>{path=next;}};}
test('rapid Back/Forward cannot apply a slower obsolete locale',async()=>{
 const f=fixture();const back=f.sync.restore();f.setPath('/zh-Hans/incident-zero/');const forward=f.sync.restore();f.loads[1].resolve();await forward;f.loads[0].resolve();await back;
 assert.deepEqual(f.changes,['zh-Hans']);assert.deepEqual(f.commits,['/zh-Hans/incident-zero/']);
});
test('cached-page restoration reloads the URL locale even on the same route',async()=>{
 const f=fixture();const restore=f.sync.restore();assert.equal(f.loads[0].locale,'ja');f.loads[0].resolve();await restore;assert.deepEqual(f.changes,['ja']);assert.deepEqual(f.commits,['/ja/incident-zero/']);
});
test('obsolete failures and cancelled work cannot overwrite a new selection',async()=>{
 const f=fixture();const old=f.sync.restore();f.sync.cancel();f.loads[0].reject(new Error('old load'));await old;assert.deepEqual(f.errors,[]);assert.deepEqual(f.changes,[]);
 const pending=f.sync.restore();f.setPath('/en/incident-zero/');f.loads[1].resolve();await pending;assert.deepEqual(f.commits,[]);
});
test('current failures are reported and unprefixed history entries use English',async()=>{
 const f=fixture();f.setPath('/incident-zero/');const pending=f.sync.restore();assert.equal(f.loads[0].locale,'en');f.loads[0].reject(new Error('offline'));await pending;assert.deepEqual(f.errors,['/incident-zero/']);
});
