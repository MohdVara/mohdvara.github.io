import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve(process.env.QA_MODULES_DIR||'.','package.json'));
const {chromium}=require('playwright');
const output=resolve('output/playwright/pme-v1.5/fixtures');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 await page.goto(process.env.QA_DEV_URL||'http://127.0.0.1:4192/en/');
 const result=await page.evaluate(async()=>{
  const {mountForest}=await import('/src/AsciiForest/renderer.ts');
  const {renderSceneTexture,geometryForScene}=await import('/src/artwork/adapter.ts');
  const {generateScene}=await import('/src/AsciiForest/scene.ts');
  const {narrativeForestInks}=await import('/src/AsciiForest/narrativeField.ts');
  const registry=(await import('/src/i18n/languages.json')).default;
  const frame=document.createElement('div');frame.style.cssText='position:fixed;inset:0;width:1440px;height:900px;z-index:10000;background:#101310;';document.body.append(frame);
  const host=document.createElement('div');host.style.cssText='position:absolute;inset:0;width:1440px;height:900px;mask:none;';frame.append(host);
  const renderer=mountForest(host,{theme:'dark',enabled:false,locale:'en',writingMode:'horizontal'},false,240916,false,true);
  const wait=async(locale,mode='horizontal')=>{const start=performance.now();while(host.dataset.locale!==locale||host.dataset.writingMode!==mode||host.dataset.textureStatus!=='complete'||host.dataset.ready!=='true'){if(performance.now()-start>20000)throw Error('Fixture did not initialize '+locale);await new Promise(r=>setTimeout(r,20));}};
  await wait('en');
  const masks=[],images=[],data=[];
  for(const profile of registry){renderer.update({theme:'dark',enabled:false,locale:profile.locale,writingMode:'horizontal'});await wait(profile.locale);
   const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   const mask=[];for(let cy=0;cy<45;cy++)for(let cx=0;cx<72;cx++){let count=0;for(let y=Math.floor(cy*canvas.height/45);y<Math.floor((cy+1)*canvas.height/45);y++)for(let x=Math.floor(cx*canvas.width/72);x<Math.floor((cx+1)*canvas.width/72);x++)if(pixels[(y*canvas.width+x)*4+3]>12&&pixels[(y*canvas.width+x)*4+1]>80)count++;mask.push(count>4);}
   masks.push({locale:profile.locale,mask});images.push({locale:profile.locale,data:canvas.toDataURL()});data.push({locale:profile.locale,...host.dataset});
  }
  const reference=masks[0].mask;const similarity=masks.map(({locale,mask})=>{let intersection=0,union=0;for(let i=0;i<mask.length;i++){if(reference[i]||mask[i])union++;if(reference[i]&&mask[i])intersection++;}return {locale,occupiedFraction:mask.filter(Boolean).length/mask.length,coarseSilhouetteIoU:intersection/union};});
  // Inspect the actual engine runs for joining-safe vocabulary and nonoverlap.
  const steps=generateScene(128,75,240916);let next;do{next=steps.next();}while(!next.done);const geometry=geometryForScene(next.value,1440,900,false,narrativeForestInks.dark,'dark');
  const runs=[];
  for(const profile of registry){const art=await renderSceneTexture(geometry,profile.locale,'horizontal','dark');const allowed=new Set([...art.artwork.request.textPack.tokens.map(t=>t.text),...art.artwork.request.textPack.densityMarks]);
   if(!art.artwork.runs.every(run=>allowed.has(run.text)))throw Error('A semantic run was split');
   runs.push({locale:profile.locale,total:art.artwork.runs.length,words:art.artwork.runs.filter(r=>!r.id.startsWith('density-mark-')).length,hidden:art.artwork.runs.filter(r=>r.kind==='highlight').map(r=>r.text),clipped:art.artwork.report.clipped,unplaced:art.artwork.report.unplacedTokens,geometryRevision:art.artwork.request.geometry.revision});}
  renderer.dispose();frame.remove();return {data,similarity,images,runs};
 });
 for(const img of result.images)await writeFile(`${output}/${img.locale}.png`,Buffer.from(img.data.split(',')[1],'base64'));
 delete result.images;await writeFile(output+'/results.json',JSON.stringify(result,null,2));
 assert.ok(result.similarity.every(r=>r.coarseSilhouetteIoU>.9),JSON.stringify(result.similarity));assert.ok(result.runs.every(r=>r.words>100&&r.clipped===0));
 console.log(JSON.stringify({locales:result.data.length,minSilhouetteIoU:Math.min(...result.similarity.map(r=>r.coarseSilhouetteIoU)),splitRuns:0}));
}finally{await browser.close();}
