import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
import { featured } from './public-github-curation.mjs';
export const root = fileURLToPath(new URL('..', import.meta.url));
export const compare = (a,b) => a < b ? -1 : a > b ? 1 : 0;
export const canonical = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a],[b]) => compare(a,b))) : item);
export const fingerprint = value => createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
export async function writeChanged(path, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n';
  try { if (await readFile(path, 'utf8') === body) return false; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(resolve(path, '..'), { recursive: true }); await writeFile(path, body); return true;
}
async function evaluate(path, dependencies = {}) {
  const source = await readFile(resolve(root, path), 'utf8');
  const context = { exports: {}, require: name => { if (!(name in dependencies)) throw Error('Unexpected content import: ' + name); return dependencies[name]; } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022} }).outputText, context);
  return JSON.parse(JSON.stringify(context.exports));
}
function prose(source, functionName) {
  const ast = ts.createSourceFile('content.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), values = [];
  function visit(node) {
    if (functionName && ts.isFunctionDeclaration(node) && node.name?.text !== functionName) return;
    if (ts.isCallExpression(node) && ['text','localizedContent'].includes(node.expression.getText(ast)) && ts.isStringLiteral(node.arguments[0])) values.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(ast); return [...new Set(values)];
}
export async function discover() {
  const technology = await evaluate('src/technology.ts');
  const content = await evaluate('src/content.ts', {'./technology': { ...technology, technologyFor: id => technology.technologyExperience.find(r => r.projectId === id), technologyStack: id => technology.technologyExperience.find(r => r.projectId === id)?.generations.flatMap(g => g.groups.flatMap(x => x.technologies)) || [] }});
  const { quickReads } = await evaluate('src/caseStudies.ts');
  const projects = content.projects.map(project => ({ id: project.id, name: project.title, route: '/en/#case-' + project.id, evidenceClassification: 'owner-reported-commercial', implementationStatus: 'See reviewed commercial narrative; no independent production verification', content: project, sourcePaths: ['src/content.ts', 'src/technology.ts'] }));
  const definitions = {
    'mmcats-modern': ['/en/mmcats-modern/', 'src/EngineeringCaseStudy.tsx', 'Mmcats'],
    naae: ['/en/naae/', 'src/EngineeringCaseStudy.tsx', 'Naae'],
    'multilingual-engineering': ['/en/multilingual-engineering/', 'src/EngineeringCaseStudy.tsx', 'Multilingual'],
    pace: ['/en/pace-rag-case-study/', 'src/PaceRagCaseStudy.tsx'],
    ntm: ['/en/no-two-mondays/', 'src/NoTwoMondaysCaseStudy.tsx'],
    incident: ['/en/incident-zero/', 'src/features/incident-zero/IncidentZeroRoute.tsx'],
  };
  for (const [id, [route, path, fn]] of Object.entries(definitions)) projects.push({ id, name: quickReads[id].name, route, evidenceClassification: id === 'incident' ? 'fictional-demonstration' : 'independent-engineering', implementationStatus: quickReads[id].status, content: { ...quickReads[id], narrative: prose(await readFile(resolve(root, path), 'utf8'), fn) }, sourcePaths: ['src/caseStudies.ts', path] });
  for (const t of technology.technologyExperience.filter(t => !t.projectId)) projects.push({ id: t.id, name: t.projectTitle, route: '/en/#' + t.anchor, evidenceClassification: t.legacy ? 'historical-personal-project' : 'owner-confirmed-technology', implementationStatus: t.note || 'Technology involvement only; deployment not established', content: t, sourcePaths: ['src/technology.ts'] });
  for (const item of featured) projects.push({ id: item.name === 'mohdvara.github.io' ? 'portfolio' : item.name, name: item.title, route: '/en/#public-engineering', evidenceClassification: 'public-source-description', implementationStatus: item.kind, content: item, sourcePaths: ['scripts/public-github-curation.mjs'] });
  // Scan visitor-facing source, not account membership, local repositories or generated manifests.
  const references = new Map();
  async function scan(dir) { for (const entry of await readdir(resolve(root, dir), {withFileTypes:true})) {
    const path = dir + '/' + entry.name;
    if (entry.isDirectory()) { if (!['i18n','data','artwork'].includes(entry.name)) await scan(path); }
    else if (/\.(tsx?|mjs)$/.test(path)) {
      const source = await readFile(resolve(root, path), 'utf8');
      for (const match of source.matchAll(/https:\/\/github\.com\/MohdVara\/([A-Za-z0-9_.-]+)([^\s"'<>`]*)/g)) {
        const name = match[1]; const record = references.get(name) || { name, url: 'https://github.com/MohdVara/' + name, references: [] };
        record.references.push({ path, url: match[0] }); references.set(name, record);
      }
    }
  }}
  await scan('src');
  for (const item of featured) if (!references.has(item.name)) references.set(item.name, {name:item.name,url:'https://github.com/MohdVara/'+item.name,references:[{path:'scripts/public-github-curation.mjs',url:'https://github.com/MohdVara/'+item.name}]});
  const associations = { 'mmcats-modern':['mmcats-modern'], 'mmcats-legacy':['mmcats-modern'], 'pace-rag':['pace'], 'Hostel-Management-System':['hostel'], 'mohdvara.github.io':['portfolio','naae','multilingual-engineering'], 'nodejs-hotel-problem':['nodejs-hotel-problem'] };
  const repositories = [...references.values()].sort((a,b)=>compare(a.name,b.name)).map(r => ({...r, projectIds:associations[r.name] || [], ingestionEligibility:associations[r.name] ? 'public-verification-required' : 'excluded', exclusionReason:associations[r.name] ? null : 'No reviewed project association; explicit review required'}));
  return { projects:projects.sort((a,b)=>compare(a.id,b.id)), repositories };
}
// Reconstruct each record's own semantic history; a shared file commit is insufficient.
function semanticPiece(source, path, project) {
  const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,path.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  let selected;
  function visit(node) {
    if (ts.isObjectLiteralExpression(node) && node.properties.some(p=>ts.isPropertyAssignment(p)&&['id','name'].includes(p.name.getText(ast))&&ts.isStringLiteral(p.initializer)&&[project.id,project.content.name].includes(p.initializer.text))) selected=node;
    if(path.endsWith('caseStudies.ts')&&ts.isPropertyAssignment(node)&&node.name.getText(ast).replace(/^['"]|['"]$/g,'')===project.id)selected=node.initializer;
    ts.forEachChild(node,visit);
  }
  visit(ast);
  if(selected) {const values=[];function literals(n){if(ts.isStringLiteral(n)||ts.isNumericLiteral(n)||ts.isIdentifier(n))values.push([n.kind,n.text]);ts.forEachChild(n,literals);}literals(selected);return values;}
  if(path.endsWith('content.ts')||path.endsWith('technology.ts')||path.endsWith('caseStudies.ts'))return null;
  const fn={'mmcats-modern':'Mmcats',naae:'Naae','multilingual-engineering':'Multilingual'}[project.id];
  return prose(source,path.endsWith('EngineeringCaseStudy.tsx')?fn:undefined);
}
export function historicalRevision(project, readGit=(args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']})) {
  try {
    const current=project.sourcePaths.map(path=>semanticPiece(readGit(['show',`HEAD:${path}`]),path,project));
    const signature=fingerprint(current);
    let newest;
    const commits=readGit(['log','--format=%H %cI','--',...project.sourcePaths]).trim().split('\n').filter(Boolean);
    for(const line of commits){const [sha,at]=line.split(' ');let pieces;
      try{pieces=project.sourcePaths.map(path=>semanticPiece(readGit(['show',`${sha}:${path}`]),path,project));}catch{break;}
      if(fingerprint(pieces)!==signature)break;
      newest={sourceCommitSha:sha,lastMeaningfulRevisionAt:new Date(at).toISOString()};
    }
    return newest?{...newest,revisionBasis:'Per-record semantic literals and prose reconstructed from local Git history; commit time is not an editorial review or deployment time'}:null;
  }catch{return null;}
}
export function updateLedger(projects, previous, { initialize = false, accept = false, at = new Date().toISOString() } = {}) {
  const records = {};
  for (const project of projects) {
    const contentFingerprint = fingerprint({id:project.id, content:project.content});
    const old = previous?.records?.[project.id];
    if (old?.contentFingerprint === contentFingerprint) { records[project.id] = old; continue; }
    if (!old && !initialize && !accept) throw Error('Missing revision metadata: ' + project.id);
    if (old && !accept) throw Error('Meaningful content changed; record revision explicitly: ' + project.id);
    records[project.id] = { contentId:project.id, contentFingerprint, lastMeaningfulRevisionAt: old || accept ? at : null, lastReviewedAt:null, revisionBasis: old || accept ? 'Explicit canonical-content change recorded by knowledge:revision; not an editorial review' : 'Initial semantic baseline; historical per-case revision date unknown' };
  }
  return {schemaVersion:1, records};
}
export async function inventory({initialize=false, accept=false} = {}) {
  const input = await discover(); let old;
  const ledgerPath = resolve(root,'src/data/content-revisions.json');
  try {old=JSON.parse(await readFile(ledgerPath,'utf8'));} catch(error) {if(error.code !== 'ENOENT') throw error;}
  const ledger=updateLedger(input.projects,old,{initialize,accept});
  if(initialize&&!old)for(const project of input.projects){
    const history=historicalRevision(project);
    // A dirty content source cannot borrow HEAD's date.
    const actual=await Promise.all(project.sourcePaths.map(async path=>semanticPiece(await readFile(resolve(root,path),'utf8'),path,project)));
    let committed;try{committed=project.sourcePaths.map(path=>semanticPiece(execFileSync('git',['show',`HEAD:${path}`],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}),path,project));}catch{committed=null;}
    if(history&&fingerprint(actual)===fingerprint(committed))Object.assign(ledger.records[project.id],history);
  }
  if(initialize||accept)await writeChanged(ledgerPath,ledger);
  let snapshots=[];try{snapshots=JSON.parse(await readFile(resolve(root,'verification/knowledge-public-sources.json'),'utf8')).repositories;}catch(error){if(error.code!=='ENOENT')throw error;}
  const repositories=input.repositories.map(record=>{const source=snapshots.find(s=>s.url===record.url&&s.visibility==='public'&&/^[a-f0-9]{40}$/.test(s.commitSha));return {...record,visibility:source?'public':'unknown',availability:source?(source.availability||'verified-public-snapshot'):'unverified',defaultBranch:source?.defaultBranch||null,sourceCommitSha:source?.commitSha||null,checkedAt:source?.checkedAt||null,sourceVerificationStatus:source?.verification||'not-verified',documentationReferences:source?.files.map(f=>f.url)||[],exclusionReason:record.exclusionReason||(!source?'No verified public snapshot available':null)};});
  const projects=input.projects.map(p=>({...p,freshness:ledger.records[p.id],repositoryUrls:repositories.filter(r=>r.projectIds.includes(p.id)).map(r=>r.url),technologyTags:technologyTags(p),sourceVerificationStatus:'Canonical portfolio source; not an independent audit or live deployment check',knowledgeIngestionEligibility:p.evidenceClassification==='fictional-demonstration'?'excluded-from-professional-evidence':'eligible-subject-to-record-level-publication-review'}));
  const body={schemaVersion:1,publicOnly:true,projects,repositories};
  return {...body,sourceFingerprint:fingerprint({...body,repositories:repositories.map(({checkedAt,availability,...record})=>record)})};
}
function technologyTags(project) {return [...new Set(project.content.stack || project.content.generations?.flatMap(g=>g.groups.flatMap(t=>t.technologies)) || project.content.technologies || [])];}
async function main() {
  const args=new Set(process.argv.slice(2)); const data=await inventory({initialize:args.has('--initialize'),accept:args.has('--record-revision')});
  const path=resolve(root,'verification/portfolio-knowledge-inventory.json');
  const runtimePath=resolve(root,'src/data/content-freshness.json');
  const publicPath=resolve(root,'public/evidence/portfolio-knowledge-inventory.v1.json');
  if(args.has('--check')){if(await readFile(publicPath,'utf8')!==JSON.stringify(data,null,2)+'\n')throw Error('Public knowledge inventory is stale');}
  else await writeChanged(publicPath,data);
  const runtime=Object.fromEntries(data.projects.map(p=>[p.id,p.freshness.lastMeaningfulRevisionAt]));
  if(args.has('--check')){if(await readFile(runtimePath,'utf8')!==JSON.stringify(runtime,null,2)+'\n')throw Error('Runtime freshness projection is stale');}
  else await writeChanged(runtimePath,runtime);
  if(args.has('--check')) {if(await readFile(path,'utf8')!==JSON.stringify(data,null,2)+'\n')throw Error('Knowledge inventory is stale; run knowledge:sync');}
  else await writeChanged(path,data);
  console.log(`${data.projects.length} projects; ${data.repositories.length} explicitly linked repositories; ${data.sourceFingerprint}`);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
