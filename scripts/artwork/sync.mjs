// No provider/API calls: translations are synchronized by the existing PME workflow.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {hash,compilePack} from './packs.mjs';
import {validatePack} from '../../vendor/naae-unicode/unicode/contract.js';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const source=await read('src/artwork/vocabulary.json'),registry=await read('src/i18n/languages.json'),metadata=(await read('scripts/i18n/metadata.json')).locales;
await mkdir('public/artwork/pme-v1.5',{recursive:true});
let previous;try{previous=await read('public/artwork/pme-v1.5/manifest.json');}catch{/* First generation. */}
const manifest={schema:'PME/artwork-manifest/1',renderer:'NAAE/Unicode-1',geometryRevision:'forest-field-1',sourceRevision:hash(source),locales:{}};
for(const profile of registry){
 const catalog=await read(`src/i18n/locales/${profile.locale}.json`);
 const {pack,issues}=compilePack(source,profile,catalog,metadata[profile.locale]??{});
 if(!issues.length)validatePack(pack);
 const provenance=Object.fromEntries(source.entries.map(e=>[e.id,profile.locale==='en'?{status:'original',sourceHash:hash(e.source)}:metadata[profile.locale]?.[e.key]]));
 if(issues.length){const old=previous?.geometryRevision===manifest.geometryRevision ? previous?.locales?.[profile.locale] : undefined;manifest.locales[profile.locale]={...old,status:'incomplete',issues};continue;}
 const fontManifest=await read('public/fonts/unicode/manifest.json');
 const faces=fontManifest.filter(f=>[pack.preferredFont,...pack.fallbackFonts].includes(f.id));
 for(const token of pack.tokens)for(const ch of token.text){const cp=ch.codePointAt(0);if(!/[\s\p{Cf}]/u.test(ch)&&!faces.some(f=>f.coverage.some(([a,b])=>cp>=a&&cp<=b)))throw Error(`Artwork font subset missing ${profile.locale} U+${cp.toString(16)}. Run the documented font subset maintenance step.`);}
 const mainText=Object.fromEntries((source.passages||[]).map(p=>[p.region,catalog[p.key]]));
 const data=JSON.stringify({pack,mainText,provenance,typography:{...profile.artwork,fontRevision:hash(faces.map(f=>[f.id,f.sha256]))}})+'\n',revision=hash(data),path=`/artwork/pme-v1.5/${profile.locale}-${revision.slice(0,16)}.json`;
 // Content addressing preserves unrelated scenes/packs and HTTP cache identity.
 await writeFile('public'+path,data);
 manifest.locales[profile.locale]={path,revision,bytes:Buffer.byteLength(data),status:'complete',issues:[]};
}
await writeFile('public/artwork/pme-v1.5/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const incomplete=Object.entries(manifest.locales).filter(([,p])=>p.status!=='complete');
console.log(`Artwork: ${registry.length-incomplete.length}/${registry.length} complete locale packs; canonical ${manifest.sourceRevision.slice(0,12)}.`);
if(incomplete.length){console.error(JSON.stringify(incomplete));if(process.argv.includes('--strict'))process.exitCode=1;}
