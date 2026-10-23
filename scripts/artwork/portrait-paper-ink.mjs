// Opaque ink on paper, independent of dark-mode illumination and past highlight passes.
export const portraitPaperInkPreset=Object.freeze({family:'sepia-engraving',variant:'sepia-remap',bins:64,stops:[[0,'#30251c'],[.30,'#583a26'],[.68,'#88562f'],[1,'#bb884f']],paper:'#faf8f2'});
const clamp=x=>Math.max(0,Math.min(1,x));
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const hex=a=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const piecewise=(x,stops)=>{for(let i=1;i<stops.length;i++){if(x<=stops[i][0]){const[a,v]=stops[i-1],[b,w]=stops[i];return v+(w-v)*clamp((x-a)/(b-a));}}return stops.at(-1)[1];};
export function portraitPaperInk(ink,variant=portraitPaperInkPreset.variant){
 if(!/^#[a-f0-9]{6}$/i.test(ink))throw Error('Expected reconstructed RGB portrait ink');
 if(!['sepia','sepia-remap'].includes(variant))throw Error('Unknown paper-ink variant');
 const [r,g,b]=rgb(ink),l=(.2126*r+.7152*g+.0722*b)/255;
 const warm=r>b*1.18&&r>g*1.03;
 // Source luminance retains shadow ordering; cool/dark source ink identifies
 // existing hair/clothing without guessed eye outlines or new feature geometry.
 let tone=variant==='sepia'?clamp(l/.82):piecewise(l,[[0,0],[.25,.10],[.45,.25],[.63,.48],[.72,.68],[.82,1]]);
 if(variant==='sepia-remap'&&!warm)tone*=.42;
 tone=Math.round(clamp(tone)*63)/63;
 const stops=portraitPaperInkPreset.stops;let i=1;while(i<stops.length-1&&tone>stops[i][0])i++;
 const[a,h]=stops[i-1],[z,k]=stops[i],v=rgb(h),w=rgb(k),t=clamp((tone-a)/(z-a));
 return hex(v.map((n,i)=>n+(w[i]-n)*t));
}
export function applyPortraitPaperInk(source,variant=portraitPaperInkPreset.variant){
 const classes=new Map();let glyphs=0;const output=source.replace(/<text\b[^>]*>/g,tag=>{
 const ink=tag.match(/\bfill="([^"]+)"/)?.[1],colour=portraitPaperInk(ink,variant);if(!classes.has(colour))classes.set(colour,`lp${classes.size}`);glyphs++;
 return tag.replace('<text ',`<text class="${classes.get(colour)}" `);
 });
 const rules=[...classes].map(([c,n])=>`.${n}{fill:${c};stroke:${c};opacity:1;fill-opacity:1}`).join('');
 return{output:output.replace('</svg>',`<style id="portrait-light-palette">@media(prefers-color-scheme:light){${rules}}</style></svg>`),report:{variant,family:portraitPaperInkPreset.family,preset:portraitPaperInkPreset,glyphs,colours:classes.size,geometryChanged:false,darkAttributesChanged:false,foregroundAlpha:1,previousEyeAndProminenceColourPasses:false}};
}
