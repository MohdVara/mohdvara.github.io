import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {applyLightPortraitPalette,lightPortraitColour,lightPortraitPreset} from '../scripts/artwork/portrait-light-palette.mjs';
import {reconstructPortraitV3} from '../scripts/artwork/portrait-v3.mjs';
const source=reconstructPortraitV3(readFileSync('public/images/MohdVaraLetters.svg','utf8'),JSON.parse(readFileSync('scripts/artwork/portrait-glyph-metrics.json','utf8'))).output;
// Compare every tag after removing only new class attributes and the light-only style.
const original=s=>s.replace(/ class="lp\d+"/g,'').replace(/<style id="portrait-light-palette">[\s\S]*?<\/style>/,'');
test('light variants preserve all dark attributes, text and reconstructed glyph geometry',()=>{
 for(const variant of ['palette','contrast','background']){const a=applyLightPortraitPalette(source,variant);assert.equal(original(a.output),source);assert.equal(a.report.glyphs,4632);assert.ok(a.report.colours<=512);assert.ok(a.output.includes('@media(prefers-color-scheme:light)'));assert.equal(applyLightPortraitPalette(source,variant).output,a.output);}
});
test('warm light palette remains bounded, ordered and distinctly brown in dark regions',()=>{
 const luminance=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 for(const variant of ['palette','contrast','background']){let before=0;for(let v=1;v<256;v++){const h='#'+[v,Math.round(v*.65),Math.round(v*.15)].map(x=>x.toString(16).padStart(2,'0')).join('');const c=lightPortraitColour(h,variant);assert.match(c,/^#[a-f0-9]{6}$/);assert.ok(luminance(c)>=before);before=luminance(c);}
 const hair=lightPortraitColour('#0d314a',variant);assert.ok(parseInt(hair.slice(1,3),16)>parseInt(hair.slice(5,7),16));}
 assert.throws(()=>lightPortraitColour('invalid'),/Expected/);assert.throws(()=>lightPortraitColour('#112233','bad'),/Unknown/);
});

test('distinct light family reaches ivory highlights and cocoa shadows, separate from dark amber',()=>{
 assert.equal(lightPortraitPreset.family,'ivory-honey-sepia');
 const colours=lightPortraitPreset.stops.map(s=>s[1]);assert.ok(colours.includes('#f3e5c7'));assert.ok(colours.includes('#482c24'));
 const high=lightPortraitColour('#fff0aa'),low=lightPortraitColour('#301a10');
 assert.equal(high,'#f3e5c7');assert.notEqual(high,low);assert.notEqual(lightPortraitColour('#cc9933','palette'),lightPortraitColour('#cc9933','contrast'));
 assert.equal(lightPortraitColour('#cc9933','contrast'),lightPortraitColour('#cc9933','background'));
});
