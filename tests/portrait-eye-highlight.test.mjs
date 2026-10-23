import test from 'node:test';import assert from 'node:assert/strict';
import {eyeHighlightColour,eyeHighlightPreset}from'../scripts/artwork/portrait-eye-highlight.mjs';
import {portraitProminenceColour}from'../scripts/artwork/portrait-light-palette.mjs';
const l=h=>[1,3,5].reduce((s,i,n)=>s+parseInt(h.slice(i,i+2),16)*[.2126,.7152,.0722][n],0);
test('eye treatments are local, warm, bounded and never introduce a brighter highlight',()=>{
 for(const variant of ['colour','area','shadow']){
  assert.equal(eyeHighlightColour('#ebd7ae',100,100,variant),'#ebd7ae');
  assert.equal(eyeHighlightColour('#ebd7ae',497,500,variant),'#ebd7ae');
  for(const r of eyeHighlightPreset.regions){for(const colour of ['#ebd7ae','#f3e5c7','#a97934','#482c24']){const a=eyeHighlightColour(colour,r.x,r.y,variant);assert.match(a,/^#[a-f0-9]{6}$/);assert.ok(l(a)<=l(colour)+.01||variant==='shadow');}}
 }
 assert.equal(eyeHighlightColour('#a97934',497,305,'colour'),'#a97934');
 assert.notEqual(eyeHighlightColour('#ebd7ae',497,305,'colour'),'#ebd7ae');
 assert.ok(l(eyeHighlightColour('#ebd7ae',520,305,'area'))<l(eyeHighlightColour('#ebd7ae',520,305,'colour')));
 assert.throws(()=>eyeHighlightColour('#ebd7ae',NaN,1),/Invalid/);
});
test('local prominence anchors shadows without changing upper highlights or shoulder baseline',()=>{
 assert.equal(portraitProminenceColour('#85432d',400,0),'#85432d');
 assert.ok(l(portraitProminenceColour('#85432d',400,.12))<l('#85432d'));
 assert.equal(portraitProminenceColour('#f3e5c7',400,.12),'#f3e5c7');
 assert.equal(portraitProminenceColour('#85432d',900,.12),'#85432d');
 assert.equal(portraitProminenceColour('#85432d',400,100),portraitProminenceColour('#85432d',400,.16));
});
