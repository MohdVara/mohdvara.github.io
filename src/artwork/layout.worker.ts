import { layoutText } from '../../vendor/naae-unicode/unicode/layout.js';
import type { ArtworkRenderRequest, RunMeasurement } from '../../vendor/naae-unicode/unicode/contract.js';
import type { BrowserTextMeasurer } from '../../vendor/naae-unicode/unicode/measure.js';
// Native shaping/vertical calibration happens on the main thread first. NAAE's
// unchanged placement algorithm consumes those metrics off the interaction thread.
Object.assign(globalThis,{devicePixelRatio:1});
const scope = globalThis as unknown as {onmessage: (event: MessageEvent) => void; postMessage: (value: unknown) => void};
scope.onmessage = (event: MessageEvent<{id:number;request:ArtworkRenderRequest;metrics:[string,RunMeasurement][];fonts:{id:string;sha256:string}[]}>) => {
  const {id,request,metrics,fonts} = event.data;
  try {
    const measured = new Map(metrics);
    const backend = {fonts,backend:'NAAE native shaping + worker placement',measure:(text:string) => {
      const value = measured.get(text); if (!value) throw Error('Unmeasured semantic run.'); return value;
    }} as unknown as BrowserTextMeasurer;
    const start = performance.now();
    scope.postMessage({id,artwork:layoutText(request,backend),layoutMs:performance.now()-start});
  } catch(error) {scope.postMessage({id,error:String(error)});}
};
