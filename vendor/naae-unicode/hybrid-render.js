import { pixelRoles } from './hybrid-model.js';
import { visibleOwner } from './geometry.js';
import { pixelCell } from './hybrid-geometry.js';
import { noise } from './engine.js';
import { glyphMetric } from './glyphs.js';
import { artworkGround, contrastInk, isLightGround } from './appearance.js';
import { contrastRatio } from './ink.js';
const banks = {
    borneoDusk: { sky: '#748598', cloud: '#b7bbcb', mountainFar: '#9790b8', mountainNear: '#74658f', forestFar: '#639b8a', forestNear: '#9bb772', wood: '#bf946b', water: '#68aaa8', waterLight: '#bad3bb', ground: '#a59b69', foreground: '#c3c98b', highlight: '#e4d6aa' },
    monsoon: { sky: '#7a91a3', cloud: '#becbd0', mountainFar: '#9b9bbb', mountainNear: '#76769c', forestFar: '#608d88', forestNear: '#88a887', wood: '#b1a083', water: '#6daeb9', waterLight: '#c2d3d0', ground: '#aaa080', foreground: '#b9c793', highlight: '#e2dec0' },
    sunlit: { sky: '#91a6ad', cloud: '#e2d9b9', mountainFar: '#aaa1b5', mountainNear: '#908094', forestFar: '#829b7d', forestNear: '#b6ba78', wood: '#bd9b70', water: '#87b6a6', waterLight: '#d1d9b9', ground: '#c0a577', foreground: '#d2cf91', highlight: '#f0dfb1' }
};
const baseMap = { sky: 'sky', cloud: 'sky', mountainFar: 'mountainNear', mountainNear: 'mountainNear', forestFar: 'forestNear', forestNear: 'forestNear', wood: 'wood', water: 'water', waterLight: 'water', ground: 'ground', foreground: 'forestNear', highlight: 'ground' };
const unlock = ['cloud', 'mountainFar', 'forestFar', 'waterLight', 'foreground', 'highlight'];
const roleWeight = { sky: .20, cloud: .43, mountainFar: .40, mountainNear: .55, forestFar: .54, forestNear: .81, wood: .67, water: .70, waterLight: .94, ground: .72, foreground: .98, highlight: 1 };
export function hybridSemantic(scene, u, v) {
    const owner = visibleOwner(scene.graph, scene.config, u, v), g = owner?.geometry;
    const role = g?.kind === 'pixelGrid' ? g.role : 'sky', code = g?.kind === 'pixelGrid' ? pixelCell(g, u, v) : 1, tileX = g?.kind === 'pixelGrid' ? Math.floor(u * g.cols) : 0, tileY = g?.kind === 'pixelGrid' ? Math.floor(v * g.rows) : 0;
    let material = role === 'sky' ? 'atmosphere' : role === 'cloud' ? 'cloud' : role.startsWith('mountain') ? 'rock' : role === 'water' ? 'water' : role === 'ground' ? 'soil' : role === 'wood' ? 'bark' : 'leaves', paintRole = role;
    if ((role.startsWith('forest') || role === 'wood') && [3, 5, 6].includes(code)) {
        material = 'bark';
        paintRole = 'wood';
    }
    if (role === 'water' && code === 2)
        paintRole = 'waterLight';
    if ((role === 'foreground' || role === 'ground') && code === 3) {
        material = 'rock';
        paintRole = 'highlight';
    }
    if (role === 'foreground' && code === 2)
        paintRole = 'forestNear';
    if (role.startsWith('forest') && code === 2)
        paintRole = role === 'forestFar' ? 'forestNear' : 'foreground';
    if (code === 4) {
        material = 'leaves';
        paintRole = 'foreground';
    }
    const region = owner?.regionId ?? (scene.config.mode === 'object' ? 'atmosphere' : 'sky'), wordDomain = material === 'atmosphere' ? (scene.config.mode === 'object' && v > .08 ? 'forest-air' : 'sky') : material === 'cloud' ? 'cloud' : material === 'rock' ? 'mountain' : material === 'water' ? 'river' : material === 'bark' ? 'bark' : material === 'soil' ? (region === 'roots' ? 'roots' : 'ground') : region === 'canopy' ? 'canopy' : role === 'foreground' || code === 4 ? 'understory' : 'leaves';
    return { u, v, region, layer: owner?.id ?? 'px-sky', material, depth: owner?.depth ?? 0, orientation: material === 'bark' ? (code === 5 ? 'rising' : code === 6 ? 'falling' : 'vertical') : material === 'leaves' ? 'organic' : 'horizontal', structure: material === 'bark' ? 1 : .5 + (owner?.depth ?? 0) * .04, light: noise(tileX, tileY, scene.config.seed), wordDomain, hybridRole: paintRole, tileX, tileY };
}
export function createHybridRenderer(c) {
    const s = c.pixel, coverage = c.coverage, ground = artworkGround(coverage), bank = banks[s.palettePreset], map = { ...baseMap };
    for (const role of unlock.slice(0, Math.min(6, s.paletteDepth - 6)))
        map[role] = role;
    if (c.palette === 'monochrome')
        for (const role of pixelRoles)
            map[role] = 'highlight';
    const shadeRoles = new Set(['forestNear', 'forestFar', 'mountainFar', 'wood', 'water', 'ground', 'mountainNear', 'sky', 'cloud', 'foreground', 'waterLight', 'highlight'].slice(0, c.palette === 'monochrome' ? 0 : Math.max(0, s.paletteDepth - 12)));
    const representatives = [...new Set(Object.values(map))], tones = new Map();
    for (const role of representatives)
        for (let shade = 0; shade < (shadeRoles.has(role) ? 2 : 1); shade++) {
            const weight = roleWeight[role], separated = .5 + (weight - .5) * (.4 + s.layerSeparation * .9), available = Math.max(contrastRatio('#000000', ground), contrastRatio('#ffffff', ground)), requested = 1 + coverage.intensity * Math.min(11, (available - 1) * .87) * (.5 + separated * .85);
            const minimum = Math.max(coverage.minimumContrast, coverage.narrativeContrast, 4.5), goal = Math.max(minimum, requested * (shade ? 1 - (coverage.colorVariation ?? .8) * .275 : 1));
            let original = c.palette === 'monochrome' ? (isLightGround(ground) ? '#25382f' : '#dce0c6') : bank[role];
            if (isLightGround(ground))
                original = contrastInk(original, ground, Math.max(goal, 5)).ink;
            if (shade) {
                const rgb = [1, 3, 5].map(i => parseInt(original.slice(i, i + 2), 16));
                original = '#' + rgb.map((v, i) => Math.max(0, Math.min(255, Math.round(v * (i === 1 && role.startsWith('forest') ? .98 + (coverage.colorVariation ?? .8) * .1125 : .97 - (coverage.colorVariation ?? .8) * .1375)))).toString(16).padStart(2, '0')).join('');
            }
            const tone = contrastInk(original, ground, goal);
            tones.set(role + ':' + shade, { ink: tone.ink, contrast: tone.contrast, clamped: requested < minimum || tone.limited });
        }
    return {
        tone: (sample) => { const role = map[sample.hybridRole ?? 'sky'], shade = shadeRoles.has(role) && sample.light > .5 ? 1 : 0; return tones.get(role + ':' + shade); },
        glyph: (sample, field, target) => {
            let all = [...new Set(s.glyphSets[sample.material])], allowed = all.filter(ch => { const m = glyphMetric(ch); return m.inkCoverage >= Math.max(coverage.minWeight, coverage.intent === 'print' ? (coverage.process === 'screen' ? .07 : .05) : 0) && m.inkCoverage <= coverage.maxWeight; });
            const constrained = !allowed.length;
            if (constrained)
                allowed = all;
            if (sample.material === 'bark') {
                const stroke = sample.orientation === 'rising' ? '/' : sample.orientation === 'falling' ? '\\' : '|';
                if (allowed.includes(stroke))
                    return { char: stroke, constrained };
            }
            const tileNoise = noise(sample.tileX ?? 0, sample.tileY ?? 0, c.seed + 27), micro = field, grain = tileNoise * (.65 + s.tileEmphasis * .35) + micro * (1 - s.tileEmphasis) * (1 - s.macroBalance) * 1.1;
            const rank = allowed.map(char => ({ char, weight: glyphMetric(char).inkCoverage })).sort((a, b) => a.weight - b.weight || (a.char < b.char ? -1 : 1));
            const mass = (sample.material === 'leaves' || sample.material === 'rock') ? s.macroBalance * .2 : 0;
            const density = Math.max(0, Math.min(.999, .15 + target * .65 + grain * .48 + mass));
            let index = Math.floor(density * rank.length);
            if (sample.material === 'atmosphere')
                index = Math.floor((.10 + target * .55 + grain * .25) * rank.length);
            return { char: rank[Math.min(rank.length - 1, index)].char, constrained };
        }
    };
}
export function diagnoseHybrid(s) {
    const palette = new Map(), roleOccupancy = {}, layers = {}, tiles = new Map();
    let agree = 0, pairs = 0, edges = 0;
    const byCell = new Map(s.glyphs.map(g => [`${g.col},${g.row}`, g]));
    for (const g of s.glyphs) {
        if (g.char === ' ')
            continue;
        const role = g.tileRole ?? 'sky';
        roleOccupancy[role] = (roleOccupancy[role] ?? 0) + 1;
        const p = palette.get(g.ink) ?? { ink: g.ink, glyphs: 0, roles: [] };
        p.glyphs++;
        if (!p.roles.includes(role))
            p.roles.push(role);
        palette.set(g.ink, p);
        const l = layers[g.layer] ?? { glyphs: 0, average: 0 };
        l.glyphs++;
        l.average += g.visualIntensity ?? 0;
        layers[g.layer] = l;
        const key = `${g.tileX},${g.tileY},${role}`, t = tiles.get(key) ?? [];
        t.push(g.ink);
        tiles.set(key, t);
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
            const n = byCell.get(`${g.col + dx},${g.row + dy}`);
            if (n && n.char !== ' ') {
                if (n.layer === g.layer) {
                    pairs++;
                    if (n.ink === g.ink)
                        agree++;
                }
                else
                    edges++;
            }
        }
    }
    for (const l of Object.values(layers))
        l.average /= Math.max(1, l.glyphs);
    const means = s.graph.layers.filter(l => layers[l.id]).map(l => layers[l.id].average);
    let separation = 0;
    for (let i = 1; i < means.length; i++)
        separation += Math.abs(means[i] - means[i - 1]);
    const grid = s.graph.layers[0].geometry;
    return { mode: 'pixelHybrid', palettePreset: s.config.pixel.palettePreset, paletteLimit: s.config.pixel.paletteDepth, actualInkCount: palette.size, paletteUsage: [...palette.values()], roleOccupancy, grid: { columns: grid.kind === 'pixelGrid' ? grid.cols : 0, rows: grid.kind === 'pixelGrid' ? grid.rows : 0 }, contourEdges: edges, contourSimplification: s.config.pixel.shapeSimplification, tileUniformity: [...tiles.values()].filter(inks => new Set(inks).size === 1).length / Math.max(1, tiles.size), sameLayerNeighborInkAgreement: agree / Math.max(1, pairs), layerIntensity: layers, adjacentLayerSeparation: separation / Math.max(1, means.length - 1), macroReadabilityNote: 'Tile colour agreement, contour edges and layer intensity are review heuristics. They do not certify game-like scene recognition or physical print quality.', glyphCount: s.glyphs.length, narrativeGlyphs: s.budget.actualNarrative, textureGlyphs: s.budget.actualTexture };
}
