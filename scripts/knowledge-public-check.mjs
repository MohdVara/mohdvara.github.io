import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {inventory,root,writeChanged} from './knowledge-sync.mjs';
// Same unauthenticated public-only, bounded request policy as public-github.mjs.
// This command is build-time only and never falls back to a local checkout.
if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
const input=await inventory(),path=resolve(root,'verification/knowledge-public-sources.json');
const prior=JSON.parse(await readFile(path,'utf8')),repositories=[],checks=[];
async function request(url){const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(8000)});if(!r.ok){const error=Error('Public source unavailable: '+r.status);error.status=r.status;error.rateLimited=r.status===429||(r.status===403&&r.headers.get('x-ratelimit-remaining')==='0');throw error;}return r;}
for(const source of input.repositories){
  const old=prior.repositories.find(r=>r.url===source.url);
  if(!old){checks.push({url:source.url,status:'excluded',reason:'New repository requires an explicit public extraction path review'});continue;}
  try{
    const api='https://api.github.com/repos/MohdVara/'+source.name;
    const metadata=await(await request(api)).json();
    if(metadata.private!==false||metadata.visibility!=='public'||metadata.full_name!=='MohdVara/'+source.name){checks.push({url:source.url,status:'excluded',reason:'Public visibility or repository identity not verified'});continue;}
    const commit=await(await request(api+'/commits/'+encodeURIComponent(metadata.default_branch))).json();
    if(!/^[a-f0-9]{40}$/.test(commit.sha))throw Error('Invalid public commit');
    const files=[];
    for(const file of old.files){
      if(!/^(README\.md|Gemfile|docs\/(LEGACY_PARITY_MATRIX|RENDER_FREE_ACCEPTANCE)\.md)$/.test(file.path))throw Error('Unapproved public extraction path');
      const text=await(await request('https://raw.githubusercontent.com/MohdVara/'+source.name+'/'+commit.sha+'/'+file.path)).text();
      files.push({path:file.path,text,url:source.url+'/blob/'+commit.sha+'/'+file.path});
    }
    repositories.push({name:source.name,url:source.url,visibility:'public',defaultBranch:metadata.default_branch,commitSha:commit.sha,sourceChangedAt:commit.commit.committer.date,checkedAt:new Date().toISOString(),verification:'public-github-api',availability:'verified-public-snapshot',files});
    checks.push({url:source.url,status:'verified',commitSha:commit.sha});
  }catch(error){
    // Explicit access/identity failures revoke eligibility; transient outages use
    // only the already verified public snapshot, retaining its original date.
    if([401,404,410,451].includes(error.status)||(error.status===403&&!error.rateLimited))checks.push({url:source.url,status:'excluded',reason:error.message});
    else {repositories.push({...old,availability:'last-known-good'});checks.push({url:source.url,status:'last-known-good',checkedAt:old.checkedAt,reason:error.message});}
  }
}
await writeChanged(path,{...prior,repositories});
await writeChanged(resolve(root,'output/pme-v17/public-source-check.json'),{attemptedAt:new Date().toISOString(),checks});
console.log(JSON.stringify(checks,null,2));
