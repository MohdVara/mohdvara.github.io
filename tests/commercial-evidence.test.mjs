import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const technology={exports:{}};vm.runInNewContext(compile(await readFile('src/technology.ts','utf8')),technology);
const context={exports:{},require:name=>{assert.equal(name,'./technology');return technology.exports;}};
vm.runInNewContext(compile(await readFile('src/content.ts','utf8')),context);
const home=await readFile('dist/index.html','utf8');
const cases=[
 {id:'insurance',decision:/event-driven quotation architecture using Node\.js/,capability:/real-time mass quotations.*rate normalization.*integrated issuance.*consumers, large commercial clients, internal teams and partners/,unique:'Quotations expire after seven days',extra:/quotation revision.*Caching and pre-warming do not exempt/s,forbidden:/Redis|Kafka|RabbitMQ|automatic invalidation|\b\d+\s*ms\b/},
 {id:'campus',decision:/Engaged stakeholders.*operational processes/,capability:/browser-based meetings for older supported browsers.*recordings.*telemetry.*reporting.*AWS Chime.*Amazon S3/,unique:'HRMS document-expiration tracking',extra:/Online class activity tracking/,forbidden:/automated notifications|every legacy process was replaced|\d+%/},
 {id:'rental',decision:/mobile-friendly, web-based rental management system/,capability:/contract renewals.*contract PDFs directly from mobile devices.*reports remotely/s,unique:'contract PDFs directly from mobile devices',extra:/internet-connected.*compatible mobile or desktop browsers/s,forbidden:/native mobile app|offline support|digital signatures|automated delivery|\d+%/},
 {id:'wensymes',decision:/system flexibility.*employee roles and responsibilities.*headcount/,capability:/External applications were integrated through APIs.*Authentication and permission checks.*sensitive HRMS records.*protected workflows/,unique:'organizational headcount',extra:/occasional professional collaboration.*clear responsibilities.*appropriate access/s,forbidden:/fully configurable RBAC|permission engine|\d+%/},
];
const article=id=>{const mark=`id="case-${id}"`;assert(home.includes(mark));return home.slice(home.indexOf(mark)).split('</article>')[0];};
for(const spec of cases)test(`${spec.id}: owner-confirmed decision and capability stay within their own native disclosure`,()=>{
 const p=context.exports.projects.find(p=>p.id===spec.id),fields=new Map(p.details),html=article(spec.id);
 assert.match(fields.get('Key Engineering Decision'),spec.decision);assert.match(fields.get('Delivered Capability'),spec.capability);
 assert(!fields.has('Result')&&!fields.has('Contribution'),'Consolidate redundant disclosure results');
 assert.equal(fields.size,p.details.length,'No duplicate field labels');assert(p.details.some(([k])=>/Ownership|contribution|Role/i.test(k)));
 assert.match(p.details.map(([,v])=>v).join(' '),spec.extra);assert.doesNotMatch(p.details.map(([,v])=>v).join(' '),spec.forbidden);
 const disclosure=html.slice(html.indexOf('<details'));assert.match(disclosure,spec.decision);assert.match(disclosure,spec.capability);assert(disclosure.includes('Key Engineering Decision'));assert(disclosure.includes('Delivered Capability'));assert(disclosure.includes('Technology stack'));assert(disclosure.includes('Professional role &amp; project background: full CV'));
 for(const other of cases.filter(other=>other.id!==spec.id))assert(!article(other.id).includes(spec.unique),`${spec.unique} leaked to ${other.id}`);
 assert.deepEqual(p.stack,technology.exports.technologyStack(p.id));
});
test('ongoing occasional WenSymes collaboration keeps its confirmed chronology and role',()=>{
 const role=context.exports.experience[0];assert.equal(role.period,'Mar 2025 — ongoing collaboration');assert.equal(role.title,'Principal Full Stack Developer');assert.match(role.type,/Occasional professional collaboration/);
});


test('PolicyStreet production scope separates insurer coverage from recalled distinct-user analytics',()=>{
 const p=context.exports.projects.find(p=>p.id==='insurance'),fields=new Map(p.details),evidence=fields.get('Evidence'),html=article('insurance');
 assert.match(p.result,/real-time production quotation workflows across up to 12 insurers/);
 assert.match(evidence,/Historical production analytics.*real-user activity/);
 assert.match(evidence,/I recall a peak of approximately 15,000 distinct users within one hour/);
 assert.match(evidence,/dashboard is not available for independent corroboration/);
 assert.match(evidence,/not a concurrency, request-throughput or load-test measurement/);
 assert.equal(html.split('15,000').length-1,1,'Recalled metric belongs once in detailed evidence');
 assert(!p.result.includes('15,000')&&!p.summary.includes('15,000'));
 assert.doesNotMatch(JSON.stringify(p),/15,000 concurrent|15,000 requests|requests per second|12 insurers simultaneously|cache-hit ratio|independently benchmarked|99\.9/);
 for(const audience of ['consumers','large commercial clients','internal teams','partners'])assert(p.summary.includes(audience));
});

test('Centre configuration stays collaborative and distinct from later meeting delivery',()=>{
 const hr=context.exports.projects.find(p=>p.id==='hr'),campus=context.exports.projects.find(p=>p.id==='campus');
 const fields=new Map(hr.details),engineering=fields.get('Engineering'),meeting=new Map(campus.details).get('Delivered Capability');
 assert.equal(hr.period,'May 2016 — Dec 2024');assert.equal(hr.role,'Web Developer · collaborative development');
 assert.match(fields.get('Ownership'),/Collaborated.*Web Developer/);
 assert.match(engineering,/leave-calculation rules.*vary by organization.*individual employee.*selected group.*whole workforce/);
 assert.match(engineering,/likely and urgent policy changes.*available resources.*operational constraints/);
 assert.doesNotMatch(JSON.stringify(hr),/final architectural decision authority|Principal|AWS Chime|Amazon S3|no-code|zero code|every imaginable/);
 assert.equal(campus.period,'Jun 2021 — Present');assert.match(campus.summary,/principal since June 2022.*April 2023/);
 assert.match(meeting,/older supported browsers.*recordings.*meeting-activity telemetry.*operational reporting/);
 assert.match(meeting,/meeting solution used AWS Chime and Amazon S3.*implementation and infrastructure constraints/);
 assert.doesNotMatch(meeting,/Internet Explorer|all browsers|universal|participants|retention|WebRTC/);
 assert(!JSON.stringify(campus).includes('selected group'),'HRMS configuration is not attributed to campus Principal work');
});

test('WenSymes modular services led to implemented controlled integrations without topology claims',()=>{
 const p=context.exports.projects.find(p=>p.id==='wensymes'),f=new Map(p.details);
 assert.match(f.get('Key Engineering Decision'),/modular service boundaries.*authenticated API interfaces.*selected capabilities/);
 assert.match(f.get('Delivered Capability'),/External applications were integrated.*existing service capabilities/);
 assert.match(f.get('Delivered Capability'),/Authentication and permission checks restricted access/);
 assert.match(p.result,/occasional professional collaboration continues/);
 assert.doesNotMatch(JSON.stringify(p),/microservices|OAuth2|OpenID|JWT|RBAC|ABAC|zero vulnerabilities|no custom development|security certification|publicly exposed/);
});

test('all eleven static locales preserve outcome and evidence text in the correct employer cards',async()=>{
 const registry=JSON.parse(await readFile('src/i18n/languages.json','utf8'));
 const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
 for(const {locale}of registry){
  const catalog=JSON.parse(await readFile(`src/i18n/locales/${locale}.json`,'utf8'));
  const html=await readFile(`dist/${locale}/index.html`,'utf8');
  for(const id of ['insurance','campus','hr','wensymes']){
   const p=context.exports.projects.find(p=>p.id===id),fields=new Map(p.details);
   const values=[p.result,fields.get(id==='hr'?'Engineering':'Delivered Capability')];
   if(id==='insurance')values.push(fields.get('Evidence'));
   if(id==='wensymes')values.push(fields.get('Key Engineering Decision'));
   const card=html.slice(html.indexOf(`id="case-${id}"`)).split('</article>')[0];
   for(const value of values){assert(catalog[value],`${locale}: missing canonical outcome translation`);assert(card.includes(escape(catalog[value])),`${locale}/${id}: missing static outcome`);}
   if(id==='insurance')assert.equal(card.split(escape(catalog[fields.get('Evidence')])).length-1,1,'Historical analytics belongs once in detail');
  }
 }
});
