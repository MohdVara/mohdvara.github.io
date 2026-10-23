import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {refinePortrait,refineSelectedPortrait,portraitPaths} from '../scripts/artwork/portrait.mjs';
const source=readFileSync(portraitPaths.source,'utf8');
const code=ts.transpileModule(readFileSync('src/AsciiForest/portraitSeparation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const exports={};vm.runInNewContext(code,{exports,require:()=>JSON.parse(readFileSync(portraitPaths.geometry,'utf8'))});
const {portraitWeight,portraitInkAlpha,portraitInkLuminance,portraitLightForestInk}=exports;
test('portrait precomputation preserves source, geometry, glyph identities and licensing; bounded deterministic tones',()=>{
 const a=refinePortrait(source),b=refinePortrait(source);assert.equal(a.output,b.output);assert.equal(readFileSync(portraitPaths.source,'utf8'),source);
 const withoutInk=s=>s.replace(/\bfill="#[\da-f]{6}"/gi,'fill="INK"').replace(/stroke="[^"]+" stroke-width="[^"]+" /g,'').replace(/<style id="portrait-light-ink">[\s\S]*?<\/style>/,'');assert.equal(withoutInk(a.output),withoutInk(source));
 assert.equal(a.geometry.glyphs,4632);assert.ok(a.geometry.changed>0);assert.ok(a.geometry.maxChannelChange<=70);assert.ok(!/<(?:image|rect|path)\b/i.test(a.output));
 assert.equal(refineSelectedPortrait(source).output,readFileSync(portraitPaths.output,'utf8'));assert.ok(a.output.includes('SIL OPEN FONT LICENSE'));
 for(const strength of [-10,10,NaN,Infinity]){const r=refinePortrait(source,{strength,radius:NaN});assert.ok(r.geometry.detail.strength>=0&&r.geometry.detail.strength<=.5);assert.ok(!r.output.includes('NaN'));}
});
test('distance field is finite, bounded, smooth, local and invariant under responsive transforms',()=>{
 const box={x:200,y:50,width:330,height:356.4};let previous=0,maxJump=0;
 for(let x=100;x<650;x+=.5){const w=portraitWeight(x,180,box);assert.ok(w>=0&&w<=1);maxJump=Math.max(maxJump,Math.abs(w-previous));previous=w;}
 assert.ok(maxJump<.025);assert.equal(portraitWeight(0,0,box),0);assert.equal(portraitWeight(600,200,box),0);
 for(const scale of [.25,.8,2,4])assert.ok(Math.abs(portraitWeight(350,180,box)-portraitWeight(350*scale,180*scale,{x:200*scale,y:50*scale,width:330*scale,height:356.4*scale}))<1e-10);
 for(const value of [NaN,Infinity,-Infinity])assert.equal(portraitWeight(value,180,box),0);
 assert.equal(portraitWeight(350,180,{...box,width:0}),0);
});
test('only eligible green environmental ink is attenuated, warm/neutral inks and outside pixels unchanged',()=>{
 for(const ink of ['#f8bb14','#ee8811','#101110','#10083d','#000000','red'])assert.equal(portraitInkAlpha(ink,1),1);
 assert.equal(portraitInkAlpha('#67704c',0),1);assert.equal(portraitInkAlpha('#67704c',1,0),1);
 assert.ok(portraitInkAlpha('#67704c',1)<1);assert.ok(portraitInkAlpha('#67704c',1,100)>=.15);
 assert.equal(portraitInkAlpha('#67704c',NaN),1);
});
test('composition keeps glyphs above the translucent theme-aware silhouette backing',()=>{
 const css=readFileSync('src/AsciiForest/AsciiForest.css','utf8');assert.ok(css.includes("mask: url('/images/MohdVaraPortrait-mask.svg') center / contain no-repeat"));assert.ok(css.includes('background: rgb(0 0 0 / .825)'));assert.ok(css.includes('content: none;'));
 const mask=readFileSync(portraitPaths.mask,'utf8');assert.ok(mask.includes('feGaussianBlur'));assert.ok(!/<(?:image|rect)\b/.test(mask));
 const app=readFileSync('src/App.tsx','utf8');assert.ok(app.includes('src={isLight ? "/images/portrait.webp" : "/images/MohdVaraLetters-refined.svg"}'));assert.ok(app.includes('window.addEventListener("theme-change", sync)'));
 const renderer=readFileSync('src/AsciiForest/renderer.ts','utf8');assert.ok(renderer.includes('alpha *= separationAlpha'));assert.ok(!renderer.includes('ctx.filter'));
});

test('luminance comparison preserves non-environmental ink and reduces contrast in each theme',()=>{
 for(const theme of ['dark','light']){
  for(const ink of ['#f8bb14','#101110','#10083d','red'])assert.equal(portraitInkLuminance(ink,1,theme,.16),ink);
  for(const weight of [0,NaN])assert.equal(portraitInkLuminance('#67704c',weight,theme,.16),'#67704c');
  assert.equal(portraitInkLuminance('#67704c',1,theme,0),'#67704c');
  const distance=ink=>[1,3,5].reduce((sum,i,n)=>sum+Math.abs(parseInt(ink.slice(i,i+2),16)-(theme==='light'?[250,248,242]:[16,17,16])[n]),0);
  const result=portraitInkLuminance('#67704c',1,theme,.16);assert.ok(/^#[a-f0-9]{6}$/.test(result));assert.ok(distance(result)<distance('#67704c'));
  assert.equal(portraitInkLuminance('#67704c',1,theme,100),portraitInkLuminance('#67704c',1,theme,.25));
 }
});

test('light sage treatment is bounded, localized and never changes dark mode',()=>{
 const ink='#67704c';assert.equal(portraitLightForestInk(ink,1,'dark',.18),ink);
 assert.equal(portraitLightForestInk(ink,0,'light',.18),ink);assert.equal(portraitLightForestInk(ink,1,'light',0),ink);
 for(const colour of ['#f8bb14','#101110','#10083d','red'])assert.equal(portraitLightForestInk(colour,1,'light',.18),colour);
 const result=portraitLightForestInk(ink,1,'light',.18);assert.match(result,/^#[a-f0-9]{6}$/);assert.notEqual(result,ink);
 assert.equal(portraitLightForestInk(ink,1,'light',100),portraitLightForestInk(ink,1,'light',.25));
 assert.equal(portraitLightForestInk(ink,NaN,'light',NaN),ink);
});
