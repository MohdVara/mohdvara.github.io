export const pixelDefaults = { tileEmphasis: .35, shapeSimplification: .3, steppedContours: .5, palettePreset: 'borneoDusk', paletteDepth: 18, layerSeparation: .8, macroBalance: .55, glyphSets: { atmosphere: ".:'-~", cloud: '-=~:', rock: '^/\\=_#H', leaves: 'oO*+%&#@', bark: '|!/\\:', water: '~_=-.', soil: '=#/\\:+', shadow: '.:-~' } };
export const pixelNarratives = {
    sky: 'The monsoon folds its map above us. Every cloud carries a shore the wind has yet to name.',
    mountains: 'These violet ridges kept the first rain. We pass beneath their silence and borrow a little time.',
    forest: 'In the layered green, each fallen branch becomes a beginning. The forest remembers by growing.',
    river: 'The river keeps no footprints. It carries the mountain to the sea, one small leaving at a time.',
    earth: 'Under moss and weather, the earth holds every return. What we leave gently may yet take root.'
};
export const pixelRoles = ['sky', 'cloud', 'mountainFar', 'mountainNear', 'forestFar', 'forestNear', 'wood', 'water', 'waterLight', 'ground', 'foreground', 'highlight'];
/** Coordinate geometry controls without changing palette, background or coverage. */
export function refinePixel(s, value) {
    if (!Number.isFinite(value) || value < 0 || value > 1)
        throw new Error('Invalid Pixel-Hybrid refinement');
    const blend = (coarse, normal, fine) => value === .65 ? normal : value <= .65 ? coarse + (normal - coarse) * value / .65 : normal + (fine - normal) * (value - .65) / .35;
    return { ...s, refinement: value, tileEmphasis: blend(1, .35, .03), shapeSimplification: blend(1, .3, .02), steppedContours: blend(1, .5, .04), macroBalance: blend(.9, .55, .18) };
}
export const pixelDetailGain = (s) => Math.max(0, ((s.refinement ?? .65) - .65) / .35);
export function validatePixel(s) {
    if (!s)
        throw new Error('Pixel-Hybrid settings are required.');
    if (s.refinement !== undefined && (!Number.isFinite(s.refinement) || s.refinement < 0 || s.refinement > 1))
        throw new Error('Invalid Pixel-Hybrid refinement');
    for (const k of ['tileEmphasis', 'shapeSimplification', 'steppedContours', 'layerSeparation', 'macroBalance'])
        if (typeof s[k] !== 'number' || !Number.isFinite(s[k]) || s[k] < 0 || s[k] > 1)
            throw new Error('Invalid Pixel-Hybrid ' + k);
    if (!['borneoDusk', 'monsoon', 'sunlit'].includes(s.palettePreset) || !Number.isInteger(s.paletteDepth) || s.paletteDepth < 6 || s.paletteDepth > 24)
        throw new Error('Invalid retro palette preset or depth.');
    for (const m of Object.keys(pixelDefaults.glyphSets))
        if (typeof s.glyphSets?.[m] !== 'string' || s.glyphSets[m].length < 1 || s.glyphSets[m].length > 32 || !/^[!-~]+$/.test(s.glyphSets[m]))
            throw new Error('Glyph sets require 1–32 visible printable ASCII characters: ' + m);
}
