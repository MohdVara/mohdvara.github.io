import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
const registry=await readJson('src/i18n/languages.json');
const source=await readJson('src/i18n/locales/en.json');
const metadata=await readJson('scripts/i18n/metadata.json');
test('each locale offers distinct professional and independent homepage paths',async()=>{
 for(const {locale,nativeName} of registry){const html=await readFile(`dist/${locale}/index.html`,'utf8');const c=await readJson(`src/i18n/locales/${locale}.json`);
  assert.ok(html.includes(`aria-label="${c.Language}: ${nativeName}"`),"language trigger accessible name includes visible selection");
  assert.ok(html.includes(`href="#work">${c['Professional delivery']}`));
  assert.ok(html.includes(`href="#public-engineering">${c['Independent engineering']}`));
  assert.match(html,/id="public-engineering"/);assert.match(html,/id="work"/);
  assert.match(html,/mailto:mohd@paramasvara.online/);assert.match(html,/rxresu.me\/mwara95\/2-page-resume/);
 }
});
test('Quick Read action destinations exist without suggesting undeployed applications',async()=>{
 for(const {locale} of registry)for(const route of ['mmcats-modern','naae','multilingual-engineering','pace-rag-case-study','no-two-mondays','incident-zero']){
  const html=await readFile(`dist/${locale}/${route}/index.html`,'utf8');const aside=html.match(/<aside class="case-quick-read"[\s\S]*?<\/aside>/)?.[0];assert.ok(aside);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);const links=[...aside.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);assert.ok(links.length>=1);
  for(const id of links)assert.ok(ids.includes(id),`${locale}/${route}: ${id}`);
  assert.match(aside,/class="quick-read-actions"/);
  if(route==='mmcats-modern'){assert.ok(links.includes('sources'));assert.match(html,/github.com\/MohdVara\/mmcats-modern/);assert.doesNotMatch(aside,/wrangler|localhost|Live demo/i);}
 }
 for(const {locale} of registry){const html=await readFile(`dist/${locale}/index.html`,'utf8');for(const id of ['insurance','wensymes','campus','rental']){assert.ok(html.includes(`href="#delivery-${id}"`));assert.ok(html.includes(`id="delivery-${id}"`));}}
});
test('new interface labels have current machine provenance and narrowly corrected terms retain React',async()=>{
 assert.equal(registry.length,11);assert.equal(registry[3].locale,'ta');
 for(const {locale} of registry.filter(l=>l.locale!=='en')){const c=await readJson(`src/i18n/locales/${locale}.json`);for(const key of ['Professional delivery','Compare artwork','Delivery decisions']){
  assert.ok(c[key]);const m=metadata.locales[locale][key];assert.equal(m.status,'machine_translated');assert.equal(m.sourceHash,createHash('sha256').update(source[key]).digest('hex'));
 }}
 for(const locale of ['fr','pt-BR']){const c=await readJson(`src/i18n/locales/${locale}.json`);assert.equal(c['React interface'],'Interface React');assert.equal(metadata.locales[locale]['React interface'].status,'machine_translated');}
});
