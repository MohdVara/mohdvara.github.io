import { requestForPME, type PMEArtworkInput } from '../../vendor/naae-unicode/unicode/pme-adapter.js';
import { loadFont, assertFontCoverage } from '../../vendor/naae-unicode/unicode/fonts.js';
import { BrowserTextMeasurer } from '../../vendor/naae-unicode/unicode/measure.js';
import type { UnicodeArtwork } from '../../vendor/naae-unicode/unicode/contract.js';
let worker: Worker | undefined, sequence=0;
const pending = new Map<number,{resolve:(result:{artwork:UnicodeArtwork;layoutMs:number})=>void;reject:(error:Error)=>void}>();
function placementWorker() {
  if (!worker) {
    worker = new Worker(new URL('./layout.worker.ts',import.meta.url),{type:'module'});
    worker.onmessage = event => {
      const job=pending.get(event.data.id);pending.delete(event.data.id);
      if(event.data.error)job?.reject(Error(event.data.error));else job?.resolve(event.data);
    };
    worker.onerror = () => { for(const job of pending.values())job.reject(Error('NAAE placement worker unavailable'));pending.clear();worker?.terminate();worker=undefined; };
  }
  return worker;
}
export async function renderWithNAAE(input:PMEArtworkInput) {
  const request=requestForPME(input),start=performance.now();
  const ids=[...new Set([request.settings.fontId,...request.textPack.fallbackFonts,'latin'])];
  const fonts=await Promise.all(ids.map(loadFont));
  const texts=[...new Set([...request.textPack.tokens.map(t=>t.text),...request.textPack.densityMarks,...request.textPack.characters,...Object.values(request.mainText),...request.hiddenWords.map(t=>t.text)])];
  assertFontCoverage(texts,fonts);
  const measurer=new BrowserTextMeasurer(fonts,request.settings,request.textPack);
  await measurer.calibrateVertical(texts);
  if(Object.keys(request.mainText).length)throw Error('Portfolio passages require precomputed NAAE runs; use word/phrase texture tokens for runtime scenes.');
  const metrics=texts.map(text=>[text,measurer.measure(text)] as const);
  const id=++sequence;
  const result=await new Promise<{artwork:UnicodeArtwork;layoutMs:number}>((resolve,reject)=>{
    pending.set(id,{resolve,reject});
    try{placementWorker().postMessage({id,request,metrics,fonts:fonts.map(({id,sha256})=>({id,sha256}))});}
    catch(error){pending.delete(id);reject(error);}
  });
  return {...result,fonts,performance:{elapsedMs:performance.now()-start,measurements:measurer.misses,cacheHits:measurer.hits,backend:'NAAE/PME/1 + browser shaping + worker layout'}};
}
