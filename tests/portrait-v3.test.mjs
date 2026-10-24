import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {analyzePortraitGlyphs,reconstructPortraitV3} from '../scripts/artwork/portrait-v3.mjs';
const source=readFileSync('assets/source/MohdVaraLetters.svg','utf8'),metrics=JSON.parse(readFileSync('scripts/artwork/portrait-glyph-metrics.json','utf8'));
const texts=s=>[...s.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);
const coordinates=s=>[...s.matchAll(/<text\b([^>]*)>/g)].map(([,a])=>['x','y'].map(n=>+a.match(new RegExp(`\\b${n}="([^"]+)"`))[1]));
test('V3 source field has bounded multiscale analysis and no invented landmarks',()=>{
 const a=analyzePortraitGlyphs(source);assert.equal(a.length,4632);for(const g of a){for(const k of ['fine','mid','broad','edge','verticalEdge','region'])assert.ok(Number.isFinite(g[k])&&g[k]>=0&&g[k]<=1);assert.ok(Number.isFinite(g.gx)&&Number.isFinite(g.gy));}
 assert.throws(()=>analyzePortraitGlyphs(source.replace(/\bx="[^"]+"/,'x="NaN"')),/Invalid source/);
});
test('tonal, structural and combined strategies preserve every authored character and anchor',()=>{
 const before=createHash('sha256').update(source).digest('hex');
 for(const strategy of ['tonal','structural','integrated']){const a=reconstructPortraitV3(source,metrics,{strategy});assert.deepEqual(texts(a.output),texts(source));assert.deepEqual(coordinates(a.output),coordinates(source));assert.ok(a.output.includes('viewBox="0 0 900 972"'));assert.ok(!/<(?:image|path|rect|polygon)\b/i.test(a.output));assert.ok(a.output.includes('SIL OPEN FONT LICENSE'));
  assert.ok(!/NaN|Infinity/.test(a.output));assert.equal(a.report.sourceHash,before);assert.ok(a.report.estimatedInk.ratio>.88&&a.report.estimatedInk.ratio<1.12);
  if(strategy==='tonal'){assert.equal(a.report.changedSize,0);assert.ok(a.report.changedTone>0);}if(strategy==='structural'){assert.equal(a.report.changedTone,0);assert.ok(a.report.variants.vertical>0&&a.report.variants.horizontal>0);}
 }
 assert.equal(createHash('sha256').update(readFileSync('assets/source/MohdVaraLetters.svg')).digest('hex'),before);
});
test('V3 metrics are measured against the actual font and unsafe configurations are clamped',()=>{
 const a=reconstructPortraitV3(source,metrics,{localContrast:Infinity,densityWeight:100,structureWeight:-4,negativeSpaceWeight:NaN,lightStroke:100});
 assert.equal(a.report.config.densityWeight,.6);assert.equal(a.report.config.structureWeight,0);assert.equal(a.report.config.lightStroke,.4);assert.ok(Number.isFinite(a.report.config.negativeSpaceWeight));
 assert.throws(()=>reconstructPortraitV3(source,{...metrics,fontSha256:'wrong'}),/font changed/);assert.throws(()=>reconstructPortraitV3(source,metrics,{strategy:'unknown'}),/Unknown/);
 assert.equal(Object.keys(metrics.glyphs).length,29);for(const list of Object.values(metrics.glyphs)){assert.equal(list.length,3);for(const v of list){assert.ok(v.coverage>0&&v.coverage<1);assert.ok(v.verticalEdge>=0&&v.verticalEdge<=1);}}
});
test('V3 output is deterministic and keeps the bounded source-cell aspect',()=>{
 const a=reconstructPortraitV3(source,metrics),b=reconstructPortraitV3(source,metrics);assert.equal(a.output,b.output);
 const original=[...source.matchAll(/\bfont-size="([^"]+)"/g)].map(m=>+m[1]),sizes=[...a.output.matchAll(/\bfont-size="([^"]+)"/g)].map(m=>+m[1]);
 assert.equal(sizes.length,original.length);for(let i=0;i<sizes.length;i++)assert.ok(sizes[i]/original[i]>=.89999&&sizes[i]/original[i]<=1.10001);
 assert.ok(a.report.estimatedInk.ratio<=1.02,'does not solve recognition by globally adding ink');
});
