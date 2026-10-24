import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
const crawl=JSON.parse(await readFile('src/data/ntm-crawl-summary.json','utf8'));
test('PACE shows the reproducible supported answer before architecture and evaluation in every locale',async()=>{
 for(const {locale} of registry){const h=await readFile(`dist/${locale}/pace-rag-case-study/index.html`,'utf8');assert.ok(h.indexOf('id="rag-php-example"')<h.indexOf('id="rag-architecture"'));assert.ok(h.indexOf('id="rag-architecture"')<h.indexOf('id="evaluation"'));assert.match(h,/Which PHP frameworks have you used\?/);assert.match(h,/lang="en" dir="ltr" translate="no"/);assert.ok(h.includes(`href="/${locale}/#contact"`));}
});
test('MMCATS leads with parity contracts and preserves dated security and acceptance evidence',async()=>{
 const h=await readFile('dist/en/mmcats-modern/index.html','utf8');assert.ok(h.indexOf('formalize behavioral contracts')<h.indexOf('66 tests / 568 assertions'));for(const value of ['zero failures','43 HIGH and 1 UNKNOWN','clearance remains blocked','Strict emulated AMD64 load failed','Source publication does not authorize application deployment'])assert.ok(h.includes(value)||value==='zero failures'&&h.includes('zero failures, errors or skips'));
});
test('NTM architecture precedes archived history while all 44 counts remain in static HTML',async()=>{
 assert.equal(crawl.distribution.length,44);assert.equal(crawl.distribution.reduce((s,x)=>s+x.runs,0),112402);
 for(const {locale} of registry){const h=await readFile(`dist/${locale}/no-two-mondays/index.html`,'utf8');assert.ok(h.indexOf('id="ntm-architecture"')<h.indexOf('id="ntm-traversal"'));assert.ok(h.indexOf('id="ntm-traversal"')<h.indexOf('id="ntm-history"'));assert.match(h,/<details[^>]*data-evidence-disclosure=""[^>]*id="ntm-history"/);assert.doesNotMatch(h,/<details[^>]*open=""/);for(const id of ['ntm-brief','ntm-process','ntm-iterations','ntm-dialogue-history','ntm-puzzle-history','ntm-ending-distribution','ntm-evidence'])assert.ok(h.includes(`id="${id}"`));assert.equal((h.match(/class="ntm-bar-track"/g)||[]).length,49);}
 const en=await readFile('dist/en/no-two-mondays/index.html','utf8');for(const x of crawl.distribution)assert.ok(en.includes(x.runs.toLocaleString('en-US')));assert.match(en,/Known witness, unverified in this campaign/);assert.match(en,/not human-player popularity/);assert.match(en,/8,050/);assert.match(en,/210/);
});
test('NAAE retains all artifact choices and reproduction data before explaining portfolio-specific work',async()=>{
 for(const {locale} of registry){const h=await readFile(`dist/${locale}/naae/index.html`,'utf8');assert.ok(h.indexOf('id="evolution"')<h.indexOf('id="architecture"'));assert.ok(h.indexOf('id="architecture"')<h.indexOf('id="visual-identity"'));assert.equal((h.match(/name="evolution-stage-/g)||[]).length,6);assert.equal((h.match(/<pre lang="en" dir="ltr" translate="no">/g)||[]).length,2);assert.match(h,/\/images\/naae\/v0.2.svg/);assert.match(h,/\/images\/naae\/v0.3.svg/);}
});
