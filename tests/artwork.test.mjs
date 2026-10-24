import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import {compilePack,hash} from '../scripts/artwork/packs.mjs';
import {validatePack,validateGeometry} from '../vendor/naae-unicode/unicode/contract.js';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const source=await json('src/artwork/vocabulary.json'),registry=await json('src/i18n/languages.json'),metadata=(await json('scripts/i18n/metadata.json')).locales;
const manifest=await json('public/artwork/pme-v1.5/manifest.json'),fonts=await json('public/fonts/unicode/manifest.json');
async function module(path,imports){const context={exports:{},require:name=>imports[name]};vm.runInNewContext(ts.transpileModule(await readFile(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);return context.exports;}
const config=await module('src/AsciiForest/config.ts',{});
const {generateScene}=await module('src/AsciiForest/scene.ts',{'./config':config});
const {geometryForScene}=await module('src/artwork/adapter.ts',{'../i18n/languages':{},'./engine':{}});
function scene(){const steps=generateScene(128,75,240916);let next;do{next=steps.next();}while(!next.done);return next.value;}
test('all eleven registry locales have complete native semantic packs and accurate hashes',async()=>{
 assert.equal(registry.length,11);assert.deepEqual(Object.keys(manifest.locales),registry.map(r=>r.locale));
 for(const profile of registry){const catalog=await json(`src/i18n/locales/${profile.locale}.json`);const {pack,issues}=compilePack(source,profile,catalog,metadata[profile.locale]||{});assert.deepEqual(issues,[]);validatePack(pack);assert.equal(pack.tokens.length,source.entries.filter(e=>e.visible).length);assert.equal(manifest.locales[profile.locale].status,'complete');assert.equal(pack.direction,profile.direction);for(const token of pack.tokens){assert.ok(token.text.trim());if(profile.locale!=='en')assert.notEqual(token.text,source.entries.find(e=>e.id===token.id).source);}}
});
test('source changes invalidate only affected packs without modifying reviewed translations',async()=>{
 const profile=registry.find(r=>r.locale==='ta'),catalog=await json('src/i18n/locales/ta.json'),meta=structuredClone(metadata.ta);const key=source.entries[0].key;meta[key].status='human_reviewed';const original=JSON.stringify([catalog,meta]);const changed=structuredClone(source);changed.entries[0].source='fresh wind';const result=compilePack(changed,profile,catalog,meta);assert.deepEqual(result.issues,[{key,status:'stale',protected:true}]);assert.equal(JSON.stringify([catalog,meta]),original);assert.notEqual(result.pack.sourceRevision,compilePack(source,profile,catalog,meta).pack.sourceRevision);assert.equal(result.pack.tokens[0].text,catalog[key]);
});
test('missing translations stay incomplete and unrelated pack revisions are deterministic',async()=>{
 const p=registry[1],catalog=await json(`src/i18n/locales/${p.locale}.json`),copy={...catalog};delete copy[source.entries[2].key];assert.equal(compilePack(source,p,copy,metadata[p.locale]).issues[0].status,'missing');const first=compilePack(source,p,catalog,metadata[p.locale]);assert.deepEqual(compilePack(source,p,catalog,metadata[p.locale]),first);assert.equal(manifest.sourceRevision,hash(source));
});
test('geometry is locale-independent, unmirrored, bounded and deterministically seeded',()=>{
 const field=scene(),palette=Array.from({length:4},()=>['#507050','#709060','#90a080','#b0c0a0']);const a=geometryForScene(field,1440,900,false,palette,'dark');validateGeometry(a);assert.deepEqual(geometryForScene(scene(),1440,900,false,palette,'dark'),a);for(const locale of registry){const b=geometryForScene(field,1440,900,false,palette,'dark');assert.equal(hash(b),hash(a),locale.locale);}validateGeometry(geometryForScene(field,3840,1400,true,palette,'light'));assert.ok(a.cells.some(c=>c.material==='layer-3'));assert.ok(a.cells.some(c=>c.region==='forest'));
});
test('complex scripts use whole words with zero tracking; CJK vertical modes remain optional',async()=>{
 for(const p of registry){const {pack}=compilePack(source,p,await json(`src/i18n/locales/${p.locale}.json`),metadata[p.locale]||{});assert.equal(p.artwork.tracking,0);assert.equal(p.defaultWritingMode,['ja','zh-Hans'].includes(p.locale)?'vertical':'horizontal');if(['ar','hi','ta'].includes(p.locale)){assert.deepEqual(pack.characters,[]);assert.ok(!pack.strategies.includes('characters'));assert.equal(pack.metrics.trackingSafe,false);}assert.equal(pack.writingModes.includes('vertical-rl'),['ja','zh-Hans'].includes(p.locale));}
});
test('licensed font subsets cover every semantic run including marks and diacritics',async()=>{
 for(const p of registry){const {pack}=compilePack(source,p,await json(`src/i18n/locales/${p.locale}.json`),metadata[p.locale]||{});const selected=fonts.filter(f=>[pack.preferredFont,...pack.fallbackFonts].includes(f.id));for(const word of [...pack.tokens.map(t=>t.text),...pack.densityMarks])for(const ch of word){const cp=ch.codePointAt(0);if(!/\s/u.test(ch))assert.ok(selected.some(f=>f.coverage.some(([a,b])=>cp>=a&&cp<=b)),`${p.locale} ${ch}`);}}
 for(const f of fonts){const data=await readFile('public/fonts/unicode/'+f.file);assert.equal(hash(data),f.sha256);assert.ok(data.length<40000);assert.ok((await readFile('public/fonts/unicode/'+f.license,'utf8')).includes('SIL OPEN FONT LICENSE'));}
});
