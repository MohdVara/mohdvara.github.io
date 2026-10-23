import {createHash} from 'node:crypto';
export const portraitV3Preset=Object.freeze({version:3,strategy:'integrated',localContrast:.38,multiscaleDetail:.12,densityWeight:.4,structureWeight:.55,negativeSpaceWeight:.045,maxToneDelta:.065,maxScaleChange:.1,lightStroke:.28});
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const bounded=(x,fallback,a,b)=>clamp(Number.isFinite(x)?x:fallback,a,b);
export function analyzePortraitGlyphs(source){
 const glyphs=[...source.matchAll(/<text\b[^>]*>[^<]*<\/text>/g)].map(m=>{
  const get=n=>m[0].match(new RegExp(`\\b${n}="([^"]+)"`))?.[1];const hex=get('fill');
  if(!/^#[\da-f]{6}$/i.test(hex))throw Error('Uncalibrated source ink');
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const glyph={markup:m[0],text:m[0].match(/>([^<]*)<\/text>/)[1],x:+get('x'),y:+get('y'),size:+get('font-size'),rgb,l:(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)/255};
  if(![glyph.x,glyph.y,glyph.size].every(Number.isFinite)||glyph.size<=0)throw Error('Invalid source glyph geometry');
  return glyph;
 });
 if(!/viewBox="0 0 900 972"/.test(source)||glyphs.length<100||/<(?:image|path|rect)\b/i.test(source))throw Error('Expected transparent glyph-only source');
 for(const g of glyphs){
  let fine=0,fw=0,mid=0,mw=0,broad=0,bw=0,sxx=0,sxy=0,syy=0,sxl=0,syl=0;
  for(const n of glyphs){const dx=n.x-g.x,dy=n.y-g.y,d2=dx*dx+dy*dy;
   if(d2<72*72){const w=1-d2/(72*72);broad+=n.l*w;bw+=w;}
   if(d2<32*32){const w=1-d2/(32*32);mid+=n.l*w;mw+=w;}
   if(d2<18*18){const w=1-d2/(18*18);fine+=n.l*w;fw+=w;sxx+=dx*dx*w;sxy+=dx*dy*w;syy+=dy*dy*w;sxl+=dx*(n.l-g.l)*w;syl+=dy*(n.l-g.l)*w;}
  }
  const det=sxx*syy-sxy*sxy;
  g.fine=fine/fw;g.mid=mid/mw;g.broad=broad/bw;
  g.gx=det>1e-8?(sxl*syy-syl*sxy)/det:0;g.gy=det>1e-8?(syl*sxx-sxl*sxy)/det:0;
  g.edge=clamp(Math.hypot(g.gx,g.gy)*24,0,1);
  g.verticalEdge=g.gx*g.gx/(g.gx*g.gx+g.gy*g.gy||1);
  g.region=smooth((g.y-20)/70)*smooth((820-g.y)/120)*smooth((g.x-140)/65)*smooth((790-g.x)/50);
 }
 return glyphs;
}
export function reconstructPortraitV3(source,metrics,options={}){
 const config={...portraitV3Preset,...options};
 for(const [key,high] of [['localContrast',.6],['multiscaleDetail',.25],['densityWeight',.6],['structureWeight',.8],['negativeSpaceWeight',.08],['maxToneDelta',.08],['maxScaleChange',.12],['lightStroke',.4]])config[key]=bounded(config[key],portraitV3Preset[key],0,high);
 if(!['tonal','structural','integrated'].includes(config.strategy))throw Error('Unknown portrait strategy');
 const font=source.match(/src:url\(data:[^,]+,([^)]+)\)/)?.[1];
 if(!font||createHash('sha256').update(Buffer.from(font,'base64')).digest('hex')!==metrics.fontSha256)throw Error('Portrait font changed: recalibrate local glyph metrics');
 const glyphs=analyzePortraitGlyphs(source),tonal=config.strategy!=='structural',structural=config.strategy!=='tonal';
 const coverages=Object.values(metrics.glyphs).map(v=>v[0].coverage).sort((a,b)=>a-b),reference=coverages[Math.floor(coverages.length/2)];
 let originalMean=0,targetMean=0,regionWeight=0;
 for(const g of glyphs){
  const variants=metrics.glyphs[g.text];if(!variants)throw Error(`Uncalibrated authored glyph ${g.text}`);
  if(variants.some(v=>![v.coverage,v.advance,v.sx,v.sy,v.verticalEdge].every(Number.isFinite)||v.coverage<=0||v.advance<=0))throw Error('Invalid calibrated glyph metrics');
  const normal=variants[0];g.variant=normal;g.scale=1;
  if(structural&&g.region){
   const weight=config.structureWeight*g.edge*g.region;
   const score=v=>weight*(v.verticalEdge-g.verticalEdge)**2+.04*((v.sx-1)**2+(v.sy-1)**2);
   for(const v of variants)if(score(v)<score(g.variant))g.variant=v;
   // Normalize letter-dependent ink, not the narrative sequence. Keep source
   // tone-driven size variation; source shadows gain bounded negative space.
   const calibration=1+config.densityWeight*(Math.sqrt(reference/normal.coverage)-1);
   const shadow=g.rgb[0]>g.rgb[2] ? clamp((g.mid-g.l)*4,0,1)*config.negativeSpaceWeight : 0;
   g.scale=clamp(1+g.region*(calibration-1-shadow),1-config.maxScaleChange,1+config.maxScaleChange);
  }
  const delta=tonal?clamp(config.localContrast*(g.l-g.mid)+config.multiscaleDetail*(g.mid-g.broad),-config.maxToneDelta,config.maxToneDelta)*g.region:0;
  g.target=clamp(g.l+delta,0,1);originalMean+=g.l*g.region;targetMean+=g.target*g.region;regionWeight+=g.region;
 }
 const meanCorrection=tonal&&targetMean?originalMean/targetMean:1;
 let changedTone=0,changedSize=0,maxChannelChange=0,inkBefore=0,inkAfter=0;const variants={};
 const markup=glyphs.map(g=>{
  const gain=tonal&&g.l>0?clamp(g.target*(1+(meanCorrection-1)*g.region)/g.l,.72,1.3):1;
  const rgb=g.rgb.map(v=>Math.round(clamp(v*gain,0,255)));const hex='#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
  if(rgb.some((v,i)=>v!==g.rgb[i]))changedTone++;
  maxChannelChange=Math.max(maxChannelChange,...rgb.map((v,i)=>Math.abs(v-g.rgb[i])));
  // Bound horizontal ink to the existing ~7.08-unit source-cell advance.
  const size=Math.min(g.size*g.scale,6.95/(g.variant.advance*g.variant.sx));
  if(Math.abs(size-g.size)>.0001)changedSize++;
  const sx=g.variant.sx,sy=g.variant.sy,cx=g.x+g.size*.3,cy=g.y-g.size*.3;
  const transform=sx===1&&sy===1?'':` transform="matrix(${sx} 0 0 ${sy} ${(cx*(1-sx)).toFixed(3)} ${(cy*(1-sy)).toFixed(3)})"`;
  let output=g.markup.replace(/\bfill="[^"]+"/,`fill="${hex}"`).replace(/font-size="[^"]+"/,`font-size="${size.toFixed(5)}"`).replace(/font-size:[\d.]+px/,`font-size:${size.toFixed(5)}px`);
  const stroke=g.region>0?` stroke="${hex}" stroke-width="${(config.lightStroke*g.region).toFixed(3)}"`:'';
  output=output.replace('<text ',`<text${transform}${stroke} `);
  variants[g.variant.id]=(variants[g.variant.id]||0)+1;
  inkBefore+=metrics.glyphs[g.text][0].coverage*g.size*g.size;inkAfter+=g.variant.coverage*size*size;
  return output;
 });
 let index=0;const output=source.replace(/<text\b[^>]*>[^<]*<\/text>/g,()=>markup[index++]).replace('</svg>','<style id="portrait-light-ink">text{stroke-opacity:0}@media(prefers-color-scheme:light){text{stroke-opacity:1;paint-order:stroke fill;stroke-linejoin:round}}</style></svg>');
 return {output,report:{config,sourceHash:createHash('sha256').update(source).digest('hex'),fontHash:metrics.fontSha256,glyphs:glyphs.length,changedTone,changedSize,maxChannelChange,variants,estimatedInk:{before:inkBefore,after:inkAfter,ratio:inkAfter/inkBefore},sourceMean:originalMean/regionWeight,meanCorrection,analysis:'authored glyph RGB/size field, 18/32/72-unit scales; no photographic or illustrated pixel input'}};
}
