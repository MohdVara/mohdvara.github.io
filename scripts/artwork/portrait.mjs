import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {applyPortraitPaperInk} from './portrait-paper-ink.mjs';
import {reconstructPortraitV3} from './portrait-v3.mjs';
export const portraitPaths={source:'assets/source/MohdVaraLetters.svg',output:'public/images/MohdVaraLetters-refined.svg',geometry:'src/AsciiForest/portraitGeometry.json',mask:'public/images/MohdVaraPortrait-mask.svg'};
export const detailPreset=Object.freeze({strength:0.3,radius:36,maxDelta:0.055,minGain:0.72,maxGain:1.3,lightStroke:0.28});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function refinePortrait(source,config=detailPreset){
 if(!/viewBox="0 0 900 972"/.test(source) || /<(?:image|rect|path)\b/i.test(source))throw Error('Expected transparent, glyph-only 900 × 972 portrait source');
 const strength=clamp(Number.isFinite(config.strength)?config.strength:detailPreset.strength,0,0.5);
 const radius=clamp(Number.isFinite(config.radius)?config.radius:detailPreset.radius,12,72);
 const lightStroke=clamp(Number.isFinite(config.lightStroke)?config.lightStroke:detailPreset.lightStroke,0,0.4);
 const glyphs=[...source.matchAll(/<text\b[^>]*>[^<]*<\/text>/g)].map(m=>{
  const attr=n=>m[0].match(new RegExp(`\\b${n}="([^"]+)"`))?.[1];const hex=attr('fill');
  if(!/^#[\da-f]{6}$/i.test(hex))throw Error('Expected authored RGB glyph ink');
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  return {markup:m[0],x:Number(attr('x')),y:Number(attr('y')),rgb,l:(rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722)/255};
 });
 if(glyphs.length<100)throw Error('Missing glyph portrait');
 let maxChange=0,changed=0;
 const adjusted=glyphs.map(g=>{
  // Broad support window, not invented facial landmarks: retain source structure.
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const region=smooth((g.y-130)/65)*smooth((730-g.y)/85)*smooth((g.x-190)/65)*smooth((755-g.x)/65);
  let total=0,weight=0;
  for(const n of glyphs){const d2=(g.x-n.x)**2+(g.y-n.y)**2;if(d2<radius*radius){const w=1-d2/(radius*radius);total+=n.l*w;weight+=w;}}
  const delta=clamp((g.l-total/weight)*strength,-detailPreset.maxDelta,detailPreset.maxDelta)*region;
  const gain=g.l>0?clamp((g.l+delta)/g.l,detailPreset.minGain,detailPreset.maxGain):1;
  const rgb=g.rgb.map(v=>Math.round(clamp(v*gain,0,255)));const hex='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
  maxChange=Math.max(maxChange,...rgb.map((v,i)=>Math.abs(v-g.rgb[i])));if(hex!==g.markup.match(/\bfill="([^"]+)"/)[1])changed++;
  const markup=g.markup.replace(/\bfill="[^"]+"/,`fill="${hex}"`);
  return region>0 ? markup.replace('<text ',`<text stroke="${hex}" stroke-width="${(lightStroke*region).toFixed(3)}" `) : markup;
 });
 let index=0;const output=source.replace(/<text\b[^>]*>[^<]*<\/text>/g,()=>adjusted[index++]).replace('</svg>', '<style id="portrait-light-ink">text{stroke-opacity:0}@media(prefers-color-scheme:light){text{stroke-opacity:1;paint-order:stroke fill;stroke-linejoin:round}}</style></svg>');
 // Derive an envelope from authored glyph positions, never from a guessed face.
 const rows=[];
 for(let y=0;y<972;y+=24){const row=glyphs.filter(g=>g.y>=y&&g.y<y+24);if(row.length){rows.push({y:clamp((y+12)/972,0,1),left:clamp((Math.min(...row.map(g=>g.x))-5)/900,0,1),right:clamp((Math.max(...row.map(g=>g.x))+8)/900,0,1)});}}
 const points=[...rows.map(r=>[r.left,r.y]),...rows.toReversed().map(r=>[r.right,r.y])].map(p=>p.map(v=>+v.toFixed(5)));
 return {output,geometry:{schemaVersion:1,sourceHash:createHash('sha256').update(source).digest('hex'),width:900,height:972,points,detail:{...detailPreset,strength,radius,lightStroke},glyphs:glyphs.length,changed,maxChannelChange:maxChange}};
}
export function refineSelectedPortrait(source){
 const {geometry}=refinePortrait(source);
 const metrics=JSON.parse(readFileSync('scripts/artwork/portrait-glyph-metrics.json','utf8'));
 const selected=reconstructPortraitV3(source,metrics);
 const light=applyPortraitPaperInk(selected.output);
 return {output:light.output,geometry:{...geometry,v3:selected.report,lightPalette:light.report}};
}
/** Alpha-only silhouette for a translucent backing below the unchanged letters. */
export function portraitBackingMask(geometry){
 const points=geometry.points.map(([x,y])=>`${(x*900).toFixed(2)},${(y*972).toFixed(2)}`).join(' ');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 972"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="white" stop-opacity=".85"/><stop offset=".2" stop-color="white" stop-opacity=".9"/><stop offset=".32" stop-color="white"/><stop offset=".7" stop-color="white" stop-opacity=".9"/><stop offset=".93" stop-color="white" stop-opacity="0"/></linearGradient><filter id="feather" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18"/></filter></defs><polygon points="${points}" fill="url(#fade)" filter="url(#feather)"/></svg>\n`;
}
export function syncPortrait(){const source=readFileSync(portraitPaths.source,'utf8');const {output,geometry}=refineSelectedPortrait(source);writeFileSync(portraitPaths.output,output);writeFileSync(portraitPaths.mask,portraitBackingMask(geometry));writeFileSync(portraitPaths.geometry,JSON.stringify(geometry,null,2)+'\n');return geometry;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const g=syncPortrait();console.log(`Portrait V3: ${g.glyphs} glyphs, ${g.v3.changedTone} local tone adjustments, source ${g.sourceHash.slice(0,12)}.`);}
