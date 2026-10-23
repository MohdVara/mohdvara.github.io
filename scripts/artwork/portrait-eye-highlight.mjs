// Manual tonal supports inspected in the exported SVG's 900 × 972 coordinates.
// They identify existing bright glyph samples, not new pupil or eye geometry.
export const eyeHighlightPreset=Object.freeze({variant:'colour',regions:[{x:497,y:305,rx:39,ry:25},{x:635,y:314,rx:49,ry:25}],sand:'#d1b17c',peripheralSand:'#c5a169',shadow:'#76503a',brightThreshold:.69});
const clamp=x=>Math.max(0,Math.min(1,x));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=a=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const blend=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*clamp(t));
const luminance=a=>a.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)/255;
export function eyeHighlightColour(ink,x,y,variant=eyeHighlightPreset.variant){
 if(!['none','colour','area','shadow'].includes(variant))throw Error('Unknown eye-highlight variant');
 if(!/^#[\da-f]{6}$/i.test(ink)||![x,y].every(Number.isFinite))throw Error('Invalid eye-highlight sample');
 if(variant==='none')return ink;
 const distance=Math.min(...eyeHighlightPreset.regions.map(r=>Math.hypot((x-r.x)/r.rx,(y-r.y)/r.ry)));
 if(distance>=1)return ink;
 const feather=clamp((1-distance)/.3);const weight=feather*feather*(3-2*feather);
 const colour=rgb(ink),l=luminance(colour);
 if(l>=eyeHighlightPreset.brightThreshold){
  // Compress the existing light samples. Never add a brighter mark or alter ink area.
  let adjusted=blend(colour,rgb(eyeHighlightPreset.sand),.72*weight);
  if(variant!=='colour')adjusted=blend(adjusted,rgb(eyeHighlightPreset.peripheralSand),clamp((distance-.25)/.35)*.68*weight);
  return hex(adjusted);
 }
 // Candidate C only: restrained existing socket shadows, no painted contour.
 if(variant==='shadow'&&l<.55&&colour[0]>colour[2]*1.18)return hex(blend(colour,rgb(eyeHighlightPreset.shadow),.055*weight));
 return ink;
}
