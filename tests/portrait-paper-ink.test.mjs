import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{portraitPaperInk,applyPortraitPaperInk,portraitPaperInkPreset}from'../scripts/artwork/portrait-paper-ink.mjs';
import{reconstructPortraitV3}from'../scripts/artwork/portrait-v3.mjs';import{refineSelectedPortrait}from'../scripts/artwork/portrait.mjs';
const source=readFileSync('assets/source/MohdVaraLetters.svg','utf8'),metrics=JSON.parse(readFileSync('scripts/artwork/portrait-glyph-metrics.json','utf8')),raw=reconstructPortraitV3(source,metrics).output;
const strip=s=>s.replace(/ class="lp\d+"/g,'').replace(/<style id="portrait-light-palette">[\s\S]*?<\/style>/,'');
const linear=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};
const lum=h=>[1,3,5].reduce((s,i,n)=>s+linear(parseInt(h.slice(i,i+2),16))*[.2126,.7152,.0722][n],0);
test('paper ink is opaque, bounded and contrast-calibrated to actual light paper',()=>{
 assert.equal(portraitPaperInkPreset.paper,'#faf8f2');const paper=lum('#faf8f2');
 for(const variant of ['sepia','sepia-remap']){let previous=0;for(let v=0;v<=255;v++){const h='#'+[v,Math.round(v*.65),Math.round(v*.15)].map(n=>n.toString(16).padStart(2,'0')).join('');const c=portraitPaperInk(h,variant);assert.match(c,/^#[a-f0-9]{6}$/);const l=lum(c);assert.ok(l>=previous-1e-6);previous=l;assert.ok((paper+.05)/(l+.05)>=2.95);}
 const dark=portraitPaperInk('#0d314a',variant);assert.ok((paper+.05)/(lum(dark)+.05)>10);}
 assert.throws(()=>portraitPaperInk('bad'),/Expected/);assert.throws(()=>portraitPaperInk('#123456','bad'),/Unknown/);
});
test('both paper-ink variants preserve every original glyph attribute, font and narrative',()=>{
 for(const variant of ['sepia','sepia-remap']){const a=applyPortraitPaperInk(raw,variant);assert.equal(strip(a.output),raw);assert.equal(a.report.glyphs,4632);assert.ok(a.report.colours<=64);assert.ok(a.output.includes('@media(prefers-color-scheme:light)'));assert.ok(a.output.includes('opacity:1;fill-opacity:1'));assert.equal(applyPortraitPaperInk(raw,variant).output,a.output);}
 assert.equal(strip(refineSelectedPortrait(source).output),raw);assert.equal(refineSelectedPortrait(source).output,readFileSync('public/images/MohdVaraLetters-refined.svg','utf8'));
});
test('source-aware ink treatment grounds cool source regions while retaining ordered warm tones',()=>{
 assert.ok(lum(portraitPaperInk('#808090','sepia-remap'))<lum(portraitPaperInk('#808090','sepia')));
 assert.notEqual(portraitPaperInk('#ffb080','sepia-remap'),portraitPaperInk('#ffe080','sepia-remap'));
 const code=readFileSync('scripts/artwork/portrait.mjs','utf8');assert.ok(code.includes('applyPortraitPaperInk(selected.output)'));assert.ok(!code.includes('applyLightPortraitPalette(selected.output)'));
});
