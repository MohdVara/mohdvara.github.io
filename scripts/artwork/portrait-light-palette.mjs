import {eyeHighlightColour,eyeHighlightPreset} from './portrait-eye-highlight.mjs';
// Build-time colour-only treatment. Dark attributes and all glyph geometry remain intact.
export const lightPortraitPreset=Object.freeze({family:'ivory-honey-sepia',variant:'background',bins:48,stops:[[0,'#482c24'],[.28,'#85432d'],[.58,'#ae7732'],[.83,'#d3ad63'],[1,'#f3e5c7']],hairShadow:'#30241f',hairHighlight:'#694733'});
const clamp=x=>Math.max(0,Math.min(1,x));
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=values=>'#'+values.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const interpolate=(value,stops)=>{
 for(let i=1;i<stops.length;i++)if(value<=stops[i][0]){const [x,a]=stops[i-1],[y,b]=stops[i];return a+(b-a)*clamp((value-x)/(y-x));}
 return stops.at(-1)[1];
};
export function lightPortraitColour(ink,variant='contrast'){
 if(!/^#[a-f0-9]{6}$/i.test(ink))throw Error('Expected RGB portrait ink');
 if(!['palette','contrast','background'].includes(variant))throw Error('Unknown light portrait variant');
 const [r,g,b]=rgb(ink),l=(.2126*r+.7152*g+.0722*b)/255;
 // Source colour distinguishes warm facial ink from cool hair/clothing ink;
 // no landmarks, geometry or dark-mode colour changes are introduced.
 const warm=r>b*1.18&&r>g*1.03;
 const remapped=variant==='palette'?clamp(l/.82):interpolate(l,[[0,0],[.25,.15],[.45,.35],[.63,.57],[.72,.77],[.82,1]]);
 const tone=Math.round(clamp(remapped)*47)/47;
 let colour;
 if(warm){const stops=lightPortraitPreset.stops;let index=1;while(index<stops.length-1&&tone>stops[index][0])index++;const [x,a]=stops[index-1],[y,b]=stops[index];colour=mix(rgb(a),rgb(b),clamp((tone-x)/(y-x)));}
 else colour=mix(rgb(lightPortraitPreset.hairShadow),rgb(lightPortraitPreset.hairHighlight),tone);
 return hex(colour);
}
export const lightProminencePreset=Object.freeze({contrast:.12});
/** Gentle light-only shadow anchoring; source glyph geometry and highlights remain intact. */
export function portraitProminenceColour(ink,y,amount=lightProminencePreset.contrast){
 const strength=Math.max(0,Math.min(.16,Number.isFinite(amount)?amount:0));
 const colour=rgb(ink),l=(.2126*colour[0]+.7152*colour[1]+.0722*colour[2])/255;
 // Preserve upper highlights and fade the lower shoulder baseline.
 const region=clamp((y-25)/85)*clamp((840-y)/140);
 const shadow=clamp((.84-l)/.5);
 return hex(colour.map(v=>v*(1-strength*region*shadow)));
}
export function applyLightPortraitPalette(source,variant=lightPortraitPreset.variant,eyeVariant=eyeHighlightPreset.variant,prominence=lightProminencePreset.contrast){
 const classes=new Map();let count=0;
 const output=source.replace(/<text\b[^>]*>/g,tag=>{
  const ink=tag.match(/\bfill="([^"]+)"/)?.[1];const x=Number(tag.match(/\bx="([^"]+)"/)?.[1]),y=Number(tag.match(/\by="([^"]+)"/)?.[1]);const colour=portraitProminenceColour(eyeHighlightColour(lightPortraitColour(ink,variant),x,y,eyeVariant),y,prominence);if(!classes.has(colour))classes.set(colour,`lp${classes.size}`);count++;
  return tag.replace('<text ',`<text class="${classes.get(colour)}" `);
 });
 const rules=[...classes].map(([colour,name])=>`.${name}{fill:${colour};stroke:${colour}}`).join('');
 return {output:output.replace('</svg>',`<style id="portrait-light-palette">@media(prefers-color-scheme:light){${rules}}</style></svg>`),report:{variant,prominence:{contrast:prominence},eyeHighlight:{...eyeHighlightPreset,variant:eyeVariant},glyphs:count,colours:classes.size,preset:lightPortraitPreset,geometryChanged:false,darkAttributesChanged:false}};
}
