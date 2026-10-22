import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
const source = resolve(process.argv[2] || '../portfolio-inspired-ascii-art');
const out = resolve('public/narrative/r1');
await mkdir(out, { recursive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
const xml = s => String(s).replace(/[<>&"']/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[ch]));
const unxml = s => s.replace(/&(lt|gt|amp|quot|apos);/g, (_, x) => ({lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"}[x]));
const font = await readFile(join(source, 'public/fonts/LiberationMono-Regular.ttf'));
const fontName = `LiberationMono-${hash(font).slice(0, 12)}.ttf`;
await writeFile(join(out, fontName), font);
await writeFile(join(out, 'LICENSE_LIBERATION.txt'), await readFile(join(source, 'public/fonts/LICENSE_LIBERATION.txt')));
const original = await readFile(join(source, 'artifacts/v0.3/borneo-002.svg'), 'utf8');
const envelope = JSON.parse(unxml(original.match(/<metadata>([\s\S]*?)<\/metadata>/)[1]));
if (envelope.engine !== 'NAAE/0.3' || envelope.config.rendererVersion !== '0.3.0') throw Error('NAAE v0.3 export required');
const glyphs = [...original.matchAll(/<text\s([^>]+)>([\s\S]*?)<\/text>/g)].map(([, attr, char]) => {
  const a = Object.fromEntries([...attr.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, unxml(v)]));
  return { char: unxml(char), x: +a.x, y: +a.y, ink: a.fill, region: a['data-region'], kind: a['data-kind'], index: a['data-index'] === undefined ? null : +a['data-index'], word:a['data-texture-word'], size: +(a['font-size'] || envelope.budget.fontSize) };
});
if (glyphs.some(g => g.char.length !== 1 || !/^[\x20-\x7e]$/.test(g.char))) throw Error('This adapter only accepts measured Latin ASCII exports');
const regions = envelope.graph.regions.map(region => {
  const placed = glyphs.filter(g => g.kind === 'narrative' && g.region === region.id).sort((a,b) => a.index - b.index);
  if (!envelope.passages[region.id].pass || placed.map(g => g.char).join('') !== region.passage) throw Error(`Narrative integrity failed: ${region.id}`);
  const xs = placed.map(g=>g.x), ys=placed.map(g=>g.y);
  return { id:region.id, title:region.title, feature:region.feature, passage:region.passage, language:'en', direction:'ltr', writingMode:'horizontal-tb', bounds:{x:Math.min(...xs),y:Math.min(...ys)-envelope.budget.fontSize,width:Math.max(...xs)-Math.min(...xs)+envelope.budget.advance,height:Math.max(...ys)-Math.min(...ys)+envelope.budget.leading} };
});
if(glyphs.some(g=>!Number.isFinite(g.x)||!Number.isFinite(g.y)||!/^#[0-9a-f]{6}$/i.test(g.ink)||!['sky','mountains','forest','river','earth'].includes(g.region))) throw Error('Invalid glyph export');
const width=envelope.config.width, height=envelope.config.height;
const manifest = { revision:1, sourceEngine:'NAAE', engineVersion:'0.3.0', artworkId:'borneo-002', composition:'Borneo panoramic landscape', seed:envelope.config.seed, sourceSha256:hash(original), font:{url:`/narrative/r1/${fontName}`,sha256:hash(font),license:'/narrative/r1/LICENSE_LIBERATION.txt'}, language:'en', supportedShaping:'Latin ASCII only; other scripts require a shaped export', width,height,glyphCount:glyphs.length,coverage:envelope.coverage,regions,assets:{},config:envelope.config };
for (const [name, selected, viewBox, complete] of [
  ['panorama', glyphs, [0,0,width,height],true],
]) {
  const groups = new Map();
  for (const g of selected) {
    const key = [g.region,g.kind,g.ink,g.size].join(':');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(g);
  }
  const style = `:root{color-scheme:only light;background:#101713}@font-face{font-family:NAAEExport;src:url('/narrative/r1/${fontName}') format('truetype');font-display:block}text{font-family:NAAEExport,monospace;font-variant-ligatures:none;white-space:pre}svg[data-theme=light] text[data-region=sky]{fill:#93a6a1}svg[data-theme=light] text[data-region=mountains]{fill:#83977d}svg[data-theme=light] text[data-region=forest]{fill:#677e4d}svg[data-theme=light] text[data-region=river]{fill:#557d7a}svg[data-theme=light] text[data-region=earth]{fill:#887646}svg[data-region] text{opacity:.2}svg[data-region=sky] text[data-region=sky],svg[data-region=mountains] text[data-region=mountains],svg[data-region=forest] text[data-region=forest],svg[data-region=river] text[data-region=river],svg[data-region=earth] text[data-region=earth]{opacity:1}svg[data-region] text[data-kind=narrative]{font-weight:400}svg[data-region=sky] text[data-region=sky][data-kind=narrative],svg[data-region=mountains] text[data-region=mountains][data-kind=narrative],svg[data-region=forest] text[data-region=forest][data-kind=narrative],svg[data-region=river] text[data-region=river][data-kind=narrative],svg[data-region=earth] text[data-region=earth][data-kind=narrative]{fill:#e3bf75}`;
  const text = [...groups.values()].map(items => {
    const g=items[0];
    return `<text fill="${g.ink}" font-size="${g.size}" data-region="${g.region}" data-kind="${g.kind}"${g.kind==='narrative'?` data-indices="${items.map(x=>x.index).join(' ')}"`:''} x="${items.map(x=>x.x).join(' ')}" y="${items.map(x=>x.y).join(' ')}" xml:space="preserve">${xml(items.map(x=>x.char).join(''))}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${viewBox.join(' ')}" preserveAspectRatio="${complete?'xMidYMid meet':'xMidYMin slice'}" role="img" aria-labelledby="title desc"><title id="title">What the landscape holds</title><desc id="desc">Borneo narrative landscape generated by NAAE v0.3. Seed ${manifest.seed}. ${complete?'Complete narrative panorama.':'Atmospheric excerpt; complete passages are available in the portfolio explorer.'}</desc><metadata>${xml(JSON.stringify({engine:manifest.sourceEngine,version:manifest.engineVersion,seed:manifest.seed,sourceSha256:manifest.sourceSha256,completeNarratives:complete,glyphCount:selected.length}))}</metadata><defs><style>${style}</style></defs>${text}</svg>`;
  const filename=`${name}-${hash(svg).slice(0,12)}.svg`;
  await writeFile(join(out,filename),svg);
  manifest.assets[name]={url:`/narrative/r1/${filename}`,sha256:hash(svg),bytes:Buffer.byteLength(svg),gzipBytes:gzipSync(svg,{mtime:0}).length,glyphCount:selected.length,textNodes:groups.size,viewBox,completeNarratives:complete};
}
await writeFile(join(out,'source.scene.json'),await readFile(join(source,'artifacts/v0.3/borneo-002.scene.json')));
await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile('src/NarrativeArtwork/assets.ts',`// Generated by scripts/import-naae-artwork.mjs; versioned local assets only.\nexport const narrativeAssets = ${JSON.stringify(Object.fromEntries(Object.entries(manifest.assets).map(([k,v])=>[k,v.url])),null,2)} as const;\nexport const narrativeAccents = ${JSON.stringify(Object.fromEntries(['forest','mountains','earth','river'].map(region=>[region,[...new Set(glyphs.filter(g=>g.region===region&&g.word).map(g=>g.word))].slice(0,7).join(' . ')])))} as const;\n`);
console.log(JSON.stringify({source:manifest.sourceEngine,version:manifest.engineVersion,seed:manifest.seed,glyphs:glyphs.length,coverage:manifest.coverage.coverage,assets:manifest.assets,fontBytes:font.length},null,2));

await writeFile(join(out,'passages.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>What the landscape holds — Mohd. Paramasvara</title><style>body{font:18px/1.8 system-ui;max-width:70ch;margin:3rem auto;padding:0 1.25rem;background:#faf8f2;color:#252822}a{color:#73500b}h1,h2{line-height:1.2}</style><a href="/">Return to the portfolio</a><h1>What the landscape holds</h1><p>Five passages from the Borneo landscape. Generated by Narrative ASCII Art Engine v0.3, seed ${manifest.seed}. The artwork is an artistic layer; career information remains on the portfolio.</p>${regions.map(r=>`<section id="${r.id}" lang="${r.language}" dir="${r.direction}"><h2>${xml(r.title)}</h2><p>${xml(r.passage)}</p></section>`).join('')}<p><a href="${manifest.assets.panorama.url}">Open the complete text-based SVG</a> · <a href="/narrative/r1/LICENSE_LIBERATION.txt">Font license</a></p></html>`);

const semanticWords = Object.fromEntries(['sky','mountains','forest','river','earth'].map(region => [region,[...new Set(glyphs.filter(g=>g.region===region&&g.word).map(g=>g.word))]]));
await writeFile('src/NarrativeArtwork/texture.ts', `// Derived at build time from the hash-bound NAAE v0.3 export.\nexport const narrativeWords = ${JSON.stringify(semanticWords)} as const;\n`);
