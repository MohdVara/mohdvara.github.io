import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='public/narrative/r1/';
const manifest=JSON.parse(readFileSync(root+'manifest.json','utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const decode=s=>s.replace(/&(lt|gt|amp|quot|apos);/g,(_,v)=>({lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"}[v]));
function texts(svg){return [...svg.matchAll(/<text\s([^>]+)>([\s\S]*?)<\/text>/g)].map(([,attr,text])=>({attr:Object.fromEntries([...attr.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([,k,v])=>[k,decode(v)])),text:decode(text)}));}
test('versioned NAAE assets have genuine bounded text, independent coverage and verified content hashes',()=>{
 assert.equal(manifest.sourceEngine,'NAAE');assert.equal(manifest.engineVersion,'0.3.0');assert.equal(manifest.seed,1842);assert.equal(manifest.glyphCount,14175);
 assert.equal(manifest.config.coverage.target,1);assert.equal(manifest.coverage.coverage,1);assert.equal(manifest.config.coverage.intensity,.7);
 for(const [name,asset]of Object.entries(manifest.assets)){
  assert.match(asset.url,/^\/narrative\/r1\/[a-z-]+-[0-9a-f]{12}\.svg$/);
  const bytes=readFileSync('public'+asset.url),svg=bytes.toString(),runs=texts(svg);assert.equal(hash(bytes),asset.sha256);assert.equal(bytes.length,asset.bytes);
  assert.equal(runs.length,asset.textNodes);assert.ok(runs.length<150,'batch glyphs instead of introducing per-character DOM elements');
  assert.equal(runs.reduce((n,r)=>n+r.text.length,0),asset.glyphCount);
  assert.doesNotMatch(svg,/<(?:image|script|foreignObject|path|polygon|rect)\b|data:image|https?:\/\/(?!www\.w3\.org)/i);
  for(const r of runs){assert.equal(r.text.length,r.attr.x.split(' ').length);assert.equal(r.text.length,r.attr.y.split(' ').length);assert.match(r.text,/^[\x20-\x7e]*$/);for(const x of r.attr.x.split(' ').map(Number))assert.ok(x>=0&&x<=manifest.width);for(const y of r.attr.y.split(' ').map(Number))assert.ok(y>=0&&y<=manifest.height);}
  assert.equal(asset.completeNarratives,name==='panorama');
 }
 const font=readFileSync('public'+manifest.font.url);assert.equal(hash(font),manifest.font.sha256);assert.match(readFileSync(root+'LICENSE_LIBERATION.txt','utf8'),/SIL OPEN FONT LICENSE/);
 assert.equal(Object.keys(manifest.assets).join(','),'panorama');
});
test('batched SVG reconstructs every original narrative character and source index exactly',()=>{
 const runs=texts(readFileSync('public'+manifest.assets.panorama.url,'utf8')).filter(r=>r.attr['data-kind']==='narrative');
 const scene=JSON.parse(readFileSync(root+'source.scene.json','utf8'));
 for(const region of manifest.regions){
  const chars=[];for(const run of runs.filter(r=>r.attr['data-region']===region.id)){const ids=run.attr['data-indices'].split(' ').map(Number);assert.equal(ids.length,run.text.length);for(let i=0;i<ids.length;i++)chars.push([ids[i],run.text[i]]);}
  chars.sort((a,b)=>a[0]-b[0]);assert.equal(new Set(chars.map(c=>c[0])).size,chars.length);assert.deepEqual(chars.map(c=>c[0]),Array.from({length:region.passage.length},(_,i)=>i));
  assert.equal(chars.map(c=>c[1]).join(''),region.passage);assert.equal(region.passage,scene.narratives[region.id]);
  assert.equal(region.language,'en');assert.equal(region.direction,'ltr');assert.equal(region.writingMode,'horizontal-tb');
  assert.ok(region.bounds.width>0&&region.bounds.height>0);
  assert.ok(readFileSync(root+'passages.html','utf8').includes(region.passage.replaceAll('&','&amp;')));
 }
 assert.equal(manifest.regions.reduce((n,r)=>n+r.passage.length,0),581);
});
