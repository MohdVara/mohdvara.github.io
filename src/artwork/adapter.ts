import type { ForestScene } from '../AsciiForest/scene';
import type { ForestTheme } from '../AsciiForest/config';
import type { Locale, WritingMode } from '../i18n/languages';
import { language } from '../i18n/languages';
import { renderWithNAAE } from './engine';
import type { ArtworkGeometry, LocaleTextPack, UnicodeArtwork } from '../../vendor/naae-unicode/unicode/contract.js';

export type ArtworkPack = { pack: LocaleTextPack; status?: string; mainText?: Record<string,string>; typography: { profileRevision: string; fontRevision: string; minFontSize: number }; provenance: Record<string, {status: string; sourceHash: string}> };
type Entry = {path: string; revision: string; status: string};
type Manifest = {geometryRevision: string; locales: Record<Locale, Entry>};
let manifest: Promise<Manifest> | undefined;
const packs = new Map<Locale, Promise<ArtworkPack>>();
const placements = new Map<string, Promise<Awaited<ReturnType<typeof renderWithNAAE>>>>();
export const rendererRevision = 'PME/NAAE-1.5.1';
function boundedAssetWork<T>(work: Promise<T>): Promise<T> {
  return new Promise((resolve,reject) => {
    const timeout=setTimeout(()=>reject(Error('Artwork asset deadline exceeded')),12000);
    work.then(value=>{clearTimeout(timeout);resolve(value);},error=>{clearTimeout(timeout);reject(error);});
  });
}
async function json<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw Error(`Artwork asset unavailable: ${response.status}`);
  return response.json() as Promise<T>;
}
export async function loadArtworkPack(locale: Locale): Promise<ArtworkPack> {
  if (!manifest) manifest = json<Manifest>('/artwork/pme-v1.5/manifest.json').catch(error => {manifest = undefined; throw error;});
  if (!packs.has(locale)) packs.set(locale, (async () => {
    const entry = (await manifest!).locales[locale];
    // An incompatible/stale vocabulary never silently becomes current English.
    if (!entry?.path) throw Error('No compatible localized artwork pack.');
    const result = await json<ArtworkPack>(entry.path);
    if (result.pack.locale !== locale) throw Error('Artwork locale mismatch.');
    return {...result,status:entry.status};
  })().catch(error => {packs.delete(locale); throw error;}));
  return packs.get(locale)!;
}

// Preserve the established field and seed. Close only short stipple holes so a
// complete shaped word can occupy a patch; wide silhouette gaps stay empty.
export function geometryForScene(scene: ForestScene, width: number, height: number, aerial: boolean, palette: readonly (readonly string[])[], theme: ForestTheme): ArtworkGeometry {
  width = Math.max(300, Math.min(1920, width)); height = Math.max(240, Math.min(1100, height));
  const cols = scene.grids[0].cols, rows = scene.grids[0].rows;
  const dx = width / cols, dy = height / rows;
  const cells: ArtworkGeometry['cells'] = [];
  for (let layer = 0; layer < 4; layer++) {
    const grid = scene.grids[layer];
    for (let row = 0; row < rows; row++) {
      let last = -100;
      const filled = new Uint8Array(cols);
      for (let col = 0; col < cols; col++) if (grid.glyph[row * cols + col]) {
        filled[col] = 1;
        if (col - last <= 4) for (let x = last + 1; x < col; x++) filled[x] = 1;
        last = col;
      }
      for (let col = 0; col < cols; col++) if (filled[col]) {
        const i = row * cols + col;
        const region = aerial ? ['forest','earth','river','forest'][layer] : layer === 0 ? 'mountains' : layer === 3 ? 'earth' : 'forest';
        cells.push({x:col*dx,y:row*dy,width:dx,height:dy,region,material:`layer-${layer}`,depth:layer,tone:(grid.color[i]||0)/3,ink:palette[layer][grid.color[i]||0]});
      }
    }
  }
  return {schema:'NAAE/geometry/1',id:`${aerial?'river':'forest'}-${scene.seed}`,width,height,seed:scene.seed>>>0,background:theme==='light'?'#faf8f2':'#101310',transparent:true,cells,revision:`forest-field-1:${scene.signature}:${cols}:${rows}`};
}
export async function renderSceneTexture(geometry: ArtworkGeometry, locale: Locale, writingMode: WritingMode, theme: ForestTheme) {
  const data = await boundedAssetWork(loadArtworkPack(locale));
  const mode = writingMode === 'vertical' && data.pack.writingModes.includes('vertical-rl') ? 'vertical-rl' : 'horizontal-tb';
  const key = JSON.stringify([geometry.id,geometry.revision,geometry.width,geometry.height,locale,data.pack.sourceRevision,language(locale).artwork.profileRevision,data.typography.fontRevision,mode,theme,rendererRevision]);
  const hit = placements.has(key);
  if (!hit) {
    const promise = boundedAssetWork(renderWithNAAE({schema:'NAAE/PME/1',geometry,textPack:data.pack,mainText:data.mainText||{},hiddenWords:data.pack.tokens.filter(t=>t.role==='highlight'),settings:{writingMode:mode,fontId:data.pack.preferredFont,fontSize:data.typography.minFontSize,strategy:'words',density:.95,lineHeight:data.pack.metrics.lineHeight,tracking:0,maxRuns:2600,decorative:true,description:'',phraseFrequency:0}}));
    placements.set(key,promise);
    promise.catch(() => placements.delete(key));
    if (placements.size > 6) placements.delete(placements.keys().next().value!);
  }
  const result = await placements.get(key)!;
  return {...result,status:data.status,cacheKey:key,placementCacheHit:hit};
}
export function layerOf(run: UnicodeArtwork['runs'][number]) { return Number(run.material.slice(6)); }
