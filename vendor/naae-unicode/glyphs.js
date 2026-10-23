import { measuredGlyphs } from './glyph-metrics.js';
import { contrastRatio } from './ink.js';
import { artworkGround, isLightGround, materialInk, contrastInk } from './appearance.js';
import { clamp } from './geometry.js';
const palettes = { atmosphere: ".:'-~", cloud: ":~-_=", rock: '/\\^=+#', leaves: '*oO+%', bark: '|!:/\\', water: '~_-=.', soil: ';:/\\v+*', shadow: ".:'-" };
export function glyphMetric(char) { const data = measuredGlyphs.glyphs[char]; if (!data)
    throw new Error('Unmeasured glyph: ' + char); return data; }
export const glyphCatalog = Object.keys(measuredGlyphs.glyphs).map(char => ({ char, ...glyphMetric(char), direction: char === '|' || char === '!' ? 'vertical' : char === '/' ? 'rising' : char === '\\' ? 'falling' : '-_=~'.includes(char) ? 'horizontal' : 'organic', materials: (/[a-z]/i.test(char) ? Object.keys(palettes) : Object.entries(palettes).filter(([, p]) => p.includes(char)).map(([m]) => m)), script: 'Latin ASCII', font: measuredGlyphs.font }));
const choiceCache = new Map();
const toneCache = new Map();
export function chooseGlyph(sample, field, target, s) {
    field = Math.round(field * 32) / 32;
    target = Math.round(target * 64) / 64;
    const key = JSON.stringify([sample.material, sample.region === 'canopy', sample.orientation, field, target, isLightGround(artworkGround(s)), s.intent, s.process, s.minWeight, s.maxWeight]);
    const cached = choiceCache.get(key);
    if (cached)
        return cached;
    const material = sample.material, branch = material === 'bark' && sample.region === 'canopy', all = branch ? [sample.orientation === 'vertical' ? '|' : sample.orientation === 'rising' ? '/' : '\\'] : [...palettes[material]], printMin = s.intent === 'print' ? (s.process === 'screen' ? .07 : .05) : 0;
    let allowed = all.filter(ch => { const weight = glyphMetric(ch).inkCoverage; return weight >= Math.max(s.minWeight, printMin) && weight <= s.maxWeight; });
    const constrained = allowed.length === 0;
    if (constrained)
        allowed = all;
    const weights = allowed.map(ch => glyphMetric(ch).inkCoverage), min = Math.min(...weights), max = Math.max(...weights);
    const desired = min + (max - min) * clamp(.5 + (field - .5) * 2.5 + (target - .5) * .5 + (isLightGround(artworkGround(s)) ? .12 : 0));
    const ranked = allowed.map((char, index) => {
        const metric = glyphMetric(char), direction = glyphCatalog.find(g => g.char === char).direction;
        return { char, score: Math.abs(metric.inkCoverage - desired) + ((sample.orientation === 'vertical' || sample.orientation === 'rising' || sample.orientation === 'falling') && direction !== sample.orientation ? .01 : 0) + Math.abs(index / (allowed.length || 1) - field) * .035 };
    }).sort((a, b) => a.score - b.score || (a.char < b.char ? -1 : a.char > b.char ? 1 : 0));
    const result = { char: ranked[0].char, constrained };
    choiceCache.set(key, result);
    if (choiceCache.size > 12000)
        choiceCache.clear();
    return result;
}
export function targetIntensity(sample, field, s) { const depth = clamp((sample.depth + 1) / 12), attenuation = 1 - s.depthContrast * (1 - depth) * .28; return clamp(s.intensity * s.materialIntensity[sample.material] * attenuation * (sample.material === 'bark' && sample.region === 'canopy' ? 1.4 : .82 + sample.light * .25 + field * .15)); }
export function toneInk(sample, field, target, s, narrative, monochrome) {
    field = Math.round(field * 32) / 32;
    target = Math.round(target * 64) / 64;
    const key = JSON.stringify([sample.material, sample.region, sample.wordDomain, Math.round(sample.light * 16), field, target, s.intent, artworkGround(s), s.colorVariation, s.narrativeContrast, s.minimumContrast, narrative, monochrome]);
    const cached = toneCache.get(key);
    if (cached)
        return cached;
    const original = materialInk({ ...sample, light: Math.round(sample.light * 16) / 16 }, field, s, monochrome), ground = artworkGround(s);
    const floor = Math.max(s.minimumContrast, isLightGround(ground) ? 2.8 : 1.1, narrative ? s.narrativeContrast : s.intent === 'print' ? 4.5 : 1.1);
    const maximum = Math.max(contrastRatio('#000000', ground), contrastRatio('#ffffff', ground));
    const requested = 1 + target * Math.min(10, (maximum - 1) * .88), goal = Math.max(floor, requested), mapped = contrastInk(original, ground, goal), ink = mapped.ink, ratio = mapped.contrast;
    const result = { ink, contrast: ratio, clamped: requested < floor || mapped.limited || ratio + 1e-3 < goal };
    toneCache.set(key, result);
    if (toneCache.size > 18000)
        toneCache.clear();
    return result;
}
export function perceivedIntensity(char, contrast) { return clamp(glyphMetric(char).inkCoverage / .23 * Math.min(1, (contrast - 1) / 9)); }
