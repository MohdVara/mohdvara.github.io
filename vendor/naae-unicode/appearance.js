import { luminance, contrastRatio, PROOF_GROUND } from './ink.js';
export const backgroundPresets = [
    { name: 'Forest dark · studio', color: '#101713' }, { name: 'Black', color: '#171717' },
    { name: 'White', color: '#ffffff' }, { name: 'Cream / natural', color: '#e9dfc8' },
    { name: 'Warm paper', color: '#f5f1e7' }, { name: 'Heather grey', color: '#a7a7a4' },
    { name: 'Charcoal', color: '#414447' }, { name: 'Navy', color: '#17263f' },
    { name: 'Forest green', color: '#263f32' }, { name: 'Burgundy', color: '#612b3a' },
    { name: 'Royal blue', color: '#244b91' }, { name: 'Red', color: '#a42f38' },
];
export const artworkGround = (s) => s?.intent === 'print' ? s.fabricColor : s?.backgroundColor ?? PROOF_GROUND;
export const isLightGround = (ground) => luminance(ground) > .179;
const banks = { atmosphere: [204, 24, 60], cloud: [220, 32, 72], rock: [263, 25, 65], leaves: [103, 48, 58], bark: [29, 60, 63], water: [184, 53, 60], soil: [39, 48, 58], shadow: [228, 24, 51] };
function hsl(h, s, l) { s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return '#' + [f(0), f(8), f(4)].map(v => Math.round(255 * v).toString(16).padStart(2, '0')).join(''); }
/** Coherent hue variation follows material and light fields, never per-character random RGB. */
export function materialInk(sample, field, s, monochrome) {
    const light = isLightGround(artworkGround(s)), variation = s.colorVariation ?? .8;
    if (monochrome)
        return light ? '#25382f' : '#e1e7d6';
    let [h, saturation, l] = banks[sample.material];
    if (sample.material === 'bark' && sample.region === 'forest') {
        h = 24;
        saturation = 37;
        l = 55;
    }
    if (sample.wordDomain === 'understory') {
        h = 153;
        saturation = 43;
        l = 54;
    }
    if (sample.material === 'leaves' && sample.region !== 'canopy')
        h = 137;
    h += (field - .5) * variation * (sample.material === 'leaves' ? 68 : 36) + (sample.light - .5) * variation * 18;
    saturation *= .7 + variation * .45;
    if (light)
        saturation = Math.min(88, saturation * 1.22);
    return hsl((h + 360) % 360, saturation, light ? 30 + (field - .5) * 8 : l + (field - .5) * 10);
}
/** Contrast on arbitrary backgrounds; selects the attainable polarity, including midtones. */
export function contrastInk(original, ground, goal) {
    const rgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
    const extreme = contrastRatio('#000000', ground) > contrastRatio('#ffffff', ground) ? '#000000' : '#ffffff';
    const maximum = contrastRatio(extreme, ground), attainable = Math.min(goal, maximum), originalRatio = contrastRatio(original, ground);
    let low = 0, high = 1;
    const from = originalRatio < attainable ? original : ground, to = originalRatio < attainable ? extreme : original;
    for (let i = 0; i < 18; i++) {
        const mid = (low + high) / 2;
        if (contrastRatio(mix(from, to, mid), ground) < attainable)
            low = mid;
        else
            high = mid;
    }
    const ink = mix(from, to, high);
    return { ink, contrast: contrastRatio(ink, ground), limited: goal > maximum };
}
