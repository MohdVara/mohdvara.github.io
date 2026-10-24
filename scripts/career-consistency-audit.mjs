// Presence checks support, but do not replace, the field-level editorial matrix.
// Capture current public document text through the browser or extract its PDF;
// this script never fetches, edits, or publishes an external career document.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const args=process.argv.slice(2);
const value=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const sources={portfolio:value('--portfolio')||'dist/en/index.html',resume:value('--resume'),cv:value('--cv')};
const rules=JSON.parse(await readFile(new URL('../verification/career-consistency-rules.json',import.meta.url),'utf8'));
const results=[];
for(const [document,path] of Object.entries(sources)) {
  if(!path){results.push({document,status:'NOT_SUPPLIED',checks:[]});continue;}
  const text=(await readFile(path,'utf8')).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/\s+/g,' ');
  const checks=rules.map(rule=>({field:rule.field,status:rule[document]===null?'INTENTIONAL_OMISSION':rule[document].every(pattern=>new RegExp(pattern,'iu').test(text))?'PRESENT':'REVIEW_REQUIRED'}));
  results.push({document,path,status:checks.some(x=>x.status==='REVIEW_REQUIRED')?'REVIEW_REQUIRED':'PRESENCE_CHECKS_PASS',checks});
}
const report={observedAt:new Date().toISOString(),scope:'Approved wording and date presence only. Manual contextual attribution, visibility, actual save state and PDF layout still require review.',results};
if(value('--output')){await mkdir(resolve(value('--output'),'..'),{recursive:true});await writeFile(value('--output'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
if(results.some(x=>x.status==='REVIEW_REQUIRED'))process.exitCode=1;
