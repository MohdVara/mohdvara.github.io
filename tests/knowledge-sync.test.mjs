import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {discover,inventory,updateLedger,fingerprint,canonical,historicalRevision} from '../scripts/knowledge-sync.mjs';
import {loadFormatting} from '../scripts/i18n/load-formatting.mjs';
const data=await inventory();
test('inventory contains exactly portfolio-linked repositories, with explicit project associations',async()=>{
  assert.deepEqual(data.repositories.map(r=>r.name).sort(),['Hostel-Management-System','mmcats-legacy','mmcats-modern','mohdvara.github.io','nodejs-hotel-problem','pace-rag'].sort());
  assert(data.repositories.every(r=>r.projectIds.length||r.exclusionReason));
  assert(data.projects.filter(p=>p.evidenceClassification==='owner-reported-commercial').length===5);
  assert.equal(data.projects.find(p=>p.id==='ntm').repositoryUrls.length,0);
  assert.equal((await discover()).projects.length,15);
});
test('canonical hashes ignore object key order, preserving array semantics',()=>{
  assert.equal(fingerprint({a:1,b:2}),fingerprint({b:2,a:1}));
  assert.notEqual(fingerprint([1,2]),fingerprint([2,1]));
  assert.equal(canonical({b:1,a:2}),'{"a":2,"b":1}');
});
test('initial unknown dates stay null and content changes require explicit revision metadata',()=>{
  const projects=[{id:'one',content:{summary:'First'}},{id:'two',content:{summary:'Second'}}];
  const initial=updateLedger(projects,null,{initialize:true});
  assert.equal(initial.records.one.lastMeaningfulRevisionAt,null);
  assert.equal(initial.records.one.lastReviewedAt,null);
  const baseline=structuredClone(initial);baseline.records.one.lastMeaningfulRevisionAt='2020-01-01T00:00:00Z';
  assert.deepEqual(updateLedger(projects,baseline),baseline);
  const changed=structuredClone(projects);changed[0].content.summary='Updated';
  assert.throws(()=>updateLedger(changed,baseline),/Meaningful content changed/);
  const next=updateLedger(changed,baseline,{accept:true,at:'2026-01-01T00:00:00Z'});
  assert.equal(next.records.one.lastMeaningfulRevisionAt,'2026-01-01T00:00:00Z');
  assert.deepEqual(next.records.two,baseline.records.two);
  assert.equal(next.records.one.lastReviewedAt,null);
});
test('shared-file history uses the selected record instead of unrelated commit dates',()=>{
  const project={id:'one',content:{},sourcePaths:['src/content.ts']};
  const file=(one,two)=>`const projectContent=[{id:"one",summary:"${one}"},{id:"two",summary:"${two}"}];`;
  const versions={HEAD:file('same','changed'),latest:file('same','changed'),earlier:file('same','old'),old:file('different','old')};
  const read=args=>args[0]==='log'?'latest 2026-02-03T00:00:00Z\nearlier 2026-02-02T00:00:00Z\nold 2026-02-01T00:00:00Z':versions[args[1].split(':')[0]];
  const result=historicalRevision(project,read);
  assert.equal(result.sourceCommitSha,'earlier');assert.equal(result.lastMeaningfulRevisionAt,'2026-02-02T00:00:00.000Z');
});
test('revision records have explicit provenance and no manufactured review date',()=>{
  for(const p of data.projects){assert.equal(p.freshness.lastReviewedAt,null);if(p.freshness.lastMeaningfulRevisionAt){assert(p.freshness.lastMeaningfulRevisionAt.endsWith('Z'));assert.match(p.freshness.sourceCommitSha,/^[a-f0-9]{40}$/);}}
});
test('all freshness labels have translations and use the existing Gregorian/calendar behavior',async()=>{
  const {calendarDate}=await loadFormatting();
  const locales=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
  for(const {locale} of locales){
    const catalog=JSON.parse(await readFile(`src/i18n/locales/${locale}.json`,'utf8'));
    for(const key of ['Content last revised:','Site build:','Knowledge last synchronized:','Knowledge synchronization date unavailable.'])assert(catalog[key]);
    const actual=calendarDate('2026-10-24',locale,'day','gregorian');
    assert.equal(actual,new Intl.DateTimeFormat(locale,{calendar:'gregory',timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date('2026-10-24T12:00:00Z')));
  }
});
test('site metadata labels build creation independently of deployment',async()=>{
  const {siteBuildInfo}=await import('../scripts/build-revision.mjs');
  const info=siteBuildInfo();assert(info.generatedAt);assert.equal(info.deploymentAt,undefined);
  assert.equal(info.lastReviewedAt,undefined);
});
