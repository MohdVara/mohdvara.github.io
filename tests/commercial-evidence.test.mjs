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
 {id:'campus',decision:/Engaged stakeholders.*operational processes/,capability:/structured workflows.*user and stakeholder responsibilities/,unique:'HRMS document-expiration tracking',extra:/Online class activity tracking/,forbidden:/automated notifications|every legacy process was replaced|\d+%/},
 {id:'rental',decision:/mobile-friendly, web-based rental management system/,capability:/contract renewals.*contract PDFs directly from mobile devices.*reports remotely/s,unique:'contract PDFs directly from mobile devices',extra:/internet-connected.*compatible mobile or desktop browsers/s,forbidden:/native mobile app|offline support|digital signatures|automated delivery|\d+%/},
 {id:'wensymes',decision:/system flexibility.*employee roles and responsibilities.*headcount/,capability:/adaptable approach to organizational roles and HR workflows/,unique:'organizational headcount',extra:/occasional professional collaboration.*clear responsibilities.*appropriate access/s,forbidden:/fully configurable RBAC|permission engine|\d+%/},
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
