import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
const registry=await readJson('src/i18n/languages.json');
const routes=['mmcats-modern','naae','multilingual-engineering'];
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(await readFile('src/caseStudies.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const summaries=context.exports.quickReads;

test('all new localized routes are prerendered with equivalent SEO and English originals',async()=>{
 for(const {locale,direction} of registry)for(const route of routes){
  const html=await readFile(`dist/${locale}/${route}/index.html`,'utf8');
  assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
  assert.match(html,new RegExp(`<html lang="${locale}" dir="${direction}"`));
  assert.match(html,new RegExp(`rel="canonical" href="https://mohd.paramasvara.online/${locale}/${route}/"`));
  assert.equal((html.match(/hreflang=/g)||[]).length,12);
  assert.match(html,/EngineeringCaseStudy-[^" ]+\.css/);
  assert.match(html,/class="case-quick-read"/);
  assert.doesNotMatch(html,/(?:href|src)="(?:https?:\/\/(?:localhost|127\.0\.0\.1)|file:|\/Users\/)/);
  if(locale!=='en'){
   const catalog=await readJson(`src/i18n/locales/${locale}.json`);
   const eyebrow=route==='multilingual-engineering'?'The portfolio as an engineering artifact':'Independent engineering';
   assert.ok(catalog[eyebrow] && catalog[eyebrow]!==eyebrow);
   assert.ok(html.includes(catalog[eyebrow]));
   assert.match(html,/class="translation-notice/);
   assert.match(html,new RegExp(`href="/en/${route}/" hrefLang="en"`));
  }
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(id),`${locale}/${route}: ${id}`);
  for(const [,href] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)){
   const path=new URL(href,'https://test.local').pathname;
   await access('dist'+path);
  }
 }
});
test('six summaries disclose ownership, evidence, results and bounded statuses in a short read',()=>{
 assert.equal(Object.keys(summaries).length,6);
 for(const [id,item] of Object.entries(summaries)){
  for(const field of ['name','problem','role','decision','result','status','focus','evidence'])assert.ok(item[field],id+' '+field);
  const words=[item.name,item.problem,item.role,item.decision,item.result,item.status,item.focus].join(' ').split(/\s+/).length;
  assert.ok(words>=75 && words<=110,`${id}: ${words} words`);
 }
 assert.match(summaries['mmcats-modern'].status,/public release blocked/);
 assert.match(summaries.naae.status,/public studio pending/);
 assert.match(summaries.pace.focus,/English-only/);
});
test('latest MMCATS results remain separate from earlier artifact measurements',async()=>{
 const html=await readFile('dist/en/mmcats-modern/index.html','utf8');
 assert.match(html,/66 tests.*568 assertions/);
 assert.match(html,/61 tests.*518 assertions/);
 assert.match(html,/43 HIGH and 1 UNKNOWN/);
 assert.match(html,/Strict emulated AMD64 load failed/);
 assert.match(html,/real historical data was not migrated/);
  assert.match(html,/href="https:\/\/github.com\/MohdVara\/mmcats-modern"/);
  assert.match(html,/mmcats-modern\/blob\/main\/docs\/RENDER_FREE_ACCEPTANCE.md/);
  assert.match(html,/Source publication does not authorize application deployment/);
  assert.doesNotMatch(html,/The modern evidence is local-only/);
});
test('saved NAAE artifacts retain their renderer identity and exact SVG hashes',async()=>{
 const artifacts=await readJson('src/data/naae-evolution.json');
 assert.deepEqual(artifacts.map(x=>x.config.rendererVersion),['0.2.0','0.3.0','0.4.0']);
 for(const item of artifacts){
  const svg=await readFile('public'+item.original);
  assert.equal(createHash('sha256').update(svg).digest('hex'),item.sha256);
  assert.match(svg.toString(),/<text[\s>]/);
  await access('public'+item.preview);
 }
});
test('every case-study source unit has current machine-translation provenance in all ten locales',async()=>{
 const source=await readJson('src/i18n/locales/en.json');
 const locations=await readJson('scripts/i18n/source-locations.json');
 const metadata=await readJson('scripts/i18n/metadata.json');
 const keys=Object.keys(locations).filter(k=>locations[k].some(p=>/caseStudies|CaseStudyQuickRead|EngineeringCaseStudy|NaaeEvolution/.test(p)));
 assert.ok(keys.length>100);
 for(const {locale} of registry.filter(x=>x.locale!=='en')){
  const catalog=await readJson(`src/i18n/locales/${locale}.json`);
  for(const key of keys){assert.ok(catalog[key],`${locale}: ${key}`);assert.equal(metadata.locales[locale][key].sourceHash,createHash('sha256').update(source[key]).digest('hex'));}
 }
});
test('public HTML links never point at loopback servers or local files',async()=>{
 async function scan(dir){for(const file of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+file.name;if(file.isDirectory() && file.name!=='pace-rag')await scan(p);else if(file.name.endsWith('.html')){const html=await readFile(p,'utf8');assert.doesNotMatch(html,/(?:href|src)="(?:https?:\/\/(?:localhost|127\.0\.0\.1)|file:|\/Users\/)/,p);}}}
 await scan('dist');
});
test('commercial quick reads retain approved contribution wording and disclose verification limits',async()=>{
 const html=await readFile('dist/en/index.html','utf8');
 for(const id of ['insurance','wensymes','campus','rental'])assert.match(html,new RegExp(`id="quick-commercial-${id}"`));
 assert.equal((html.match(/Production status not independently verified\./g)||[]).length,4);
});
test('missing translated case-study text safely resolves to canonical English',async()=>{
 const context={exports:{}};
 vm.runInNewContext(ts.transpileModule(await readFile('src/i18n/lookup.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 const source=summaries.naae.problem;
 assert.equal(context.exports.translateSource(source,{[source]:source},key=>key),source);
});
