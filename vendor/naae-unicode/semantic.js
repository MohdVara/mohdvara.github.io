import { hybridSemantic } from './hybrid-render.js';
import { objectFrame } from './canvas.js';
import { mainBranchAt } from './object-branches.js';
import { regionAt, backgroundTreeAt, noise } from './engine.js';
import { visibleOwner, riverCenter, ridge, clamp } from './geometry.js';
export function smoothNoise(x, y, seed) { const ix = Math.floor(x), iy = Math.floor(y), tx = x - ix, ty = y - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty); const a = noise(ix, iy, seed) * (1 - sx) + noise(ix + 1, iy, seed) * sx, b = noise(ix, iy + 1, seed) * (1 - sx) + noise(ix + 1, iy + 1, seed) * sx; return a * (1 - sy) + b * sy; }
export function sampleSemantic(s, col, row, settings) {
    const b = s.budget, x = b.marginX + col * b.advance + b.advance * .5, y = b.marginY + (row + 1) * b.leading - b.fontSize * .33;
    const u = (x - b.marginX) / b.drawWidth, v = (y - b.marginY) / b.drawHeight;
    if (s.config.renderStyle === 'pixelHybrid')
        return hybridSemantic(s, u, v);
    let region = 'sky', layer = 'atmosphere-field', material = 'atmosphere', depth = -1, orientation = 'horizontal', structure = .2, light = .5;
    if (s.config.mode === 'object') {
        const frame = objectFrame(b, s.config.canvasFit === 'recompose'), width = frame.width, height = frame.height, ox = (32 + (col - frame.col) * b.advance + b.advance * .5) / width, oy = (32 + (row - frame.row + 1) * b.leading - b.fontSize * .33) / height;
        const hit = ox >= 0 && ox <= 1 && oy >= 0 && oy <= 1 ? regionAt(ox, oy, s.config.seed) : null;
        region = hit ?? 'atmosphere';
        layer = hit ?? 'atmosphere-field';
        const mapping = { canopy: ['leaves', 9], trunk: ['bark', 10], roots: ['soil', 11], forest: ['leaves', 4], mountains: ['rock', 2], water: ['water', 5] };
        if (hit) {
            [material, depth] = mapping[hit];
            structure = hit === 'trunk' ? .95 : hit === 'roots' ? .9 : .65;
        }
        if (hit === 'forest') {
            const tree = backgroundTreeAt(ox, oy, s.config.seed);
            if (tree?.part === 'wood') {
                material = 'bark';
                structure = .9;
            }
            if (tree?.understory) {
                depth = 3;
                light = .35;
            }
            else
                light = .4 + (tree?.shade ?? .4) * .35;
        }
        if (hit === 'trunk')
            orientation = 'vertical';
        if (hit === 'roots')
            orientation = ox < .54 ? 'rising' : 'falling';
        if (hit === 'canopy') {
            const branch = mainBranchAt(ox, oy);
            if (branch) {
                material = 'bark';
                orientation = branch.orientation;
                depth = 10;
                structure = 1;
                light = .72 + branch.strength * .18;
            }
        }
        if (!hit && oy > .65) {
            material = 'shadow';
            depth = 1;
            light = .25;
        }
    }
    else {
        const owner = visibleOwner(s.graph, s.config, u, v);
        if (owner) {
            region = owner.regionId;
            layer = owner.id;
            depth = owner.depth;
            structure = .5 + owner.density * .25;
            const g = owner.geometry;
            if (g.kind === 'atmosphere') {
                material = owner.id === 'sky-bands' ? 'cloud' : 'atmosphere';
                structure = .3;
                light = .7;
            }
            else if (g.kind === 'ridge') {
                material = 'rock';
                orientation = Math.cos(u * g.frequency + g.phase) > 0 ? 'rising' : 'falling';
                const h = ridge(g, u);
                structure = clamp(.9 - (v - h) * 2, .3, 1);
                light = .5 + Math.sin(u * 12 + v * 6) * .18;
            }
            else if (g.kind === 'river') {
                material = 'water';
                orientation = 'horizontal';
                light = .5 + Math.cos((u - riverCenter(g, v)) * 80) * .2;
                structure = .75;
            }
            else if (g.kind === 'forest') {
                material = 'leaves';
                orientation = 'organic';
                const t = u * g.count, index = Math.floor(t), local = t - index - .5, base = g.base + Math.sin(u * 9 + g.phase) * .028 + Math.sin(u * 23) * .012, top = base - g.height * (.55 + noise(index, Math.floor(g.phase * 100), 1842) * .45), cy = top + g.height * .21;
                if (Math.abs(local) < .08 && v > cy + g.height * .15 && v < base || Math.abs(local) < .36 && Math.abs(v - (cy + g.height * .48 - Math.abs(local) * g.height * .9)) < .008) {
                    material = 'bark';
                    orientation = Math.abs(local) < .08 ? 'vertical' : local < 0 ? 'falling' : 'rising';
                    structure = .95;
                }
                else
                    light = .3 + smoothNoise(u * g.count * 1.7, v * 22, s.config.seed) * .5;
            }
            else if (g.kind === 'vegetation') {
                material = g.side === 'floor' ? 'soil' : 'leaves';
                orientation = g.side === 'floor' ? 'horizontal' : g.side === 'left' ? 'rising' : 'falling';
                structure = .85;
            }
            else if (g.kind === 'rocks') {
                material = 'rock';
                structure = .9;
            }
            else {
                material = 'bark';
                orientation = 'vertical';
            }
        }
    }
    // Missing object or sky geometry still represents atmosphere, never decorative random text.
    const macro = smoothNoise(u * 4, v * 5, s.config.seed), meso = smoothNoise(u * 18 + v * 2, v * 14, s.config.seed + 31);
    light = clamp(light * .55 + macro * .28 + meso * .17, .12, .96);
    let wordDomain = material;
    if (material === 'atmosphere' || material === 'cloud')
        wordDomain = s.config.mode === 'object' ? (v < .08 ? 'sky' : 'forest-air') : (layer === 'valley-mist' || v > .32 ? 'mist' : material === 'cloud' ? 'cloud' : 'sky');
    else if (material === 'leaves')
        wordDomain = region === 'canopy' ? 'canopy' : layer.includes('fronds') ? 'understory' : 'leaves';
    else if (material === 'soil')
        wordDomain = region === 'roots' ? 'roots' : 'ground';
    else if (material === 'rock')
        wordDomain = 'mountain';
    else if (material === 'water')
        wordDomain = 'river';
    if (s.config.mode === 'object' && material === 'leaves' && region === 'forest') {
        const f = objectFrame(b, s.config.canvasFit === 'recompose');
        if (backgroundTreeAt((32 + (col - f.col) * b.advance + b.advance * .5) / f.width, (32 + (row - f.row + 1) * b.leading - b.fontSize * .33) / f.height, s.config.seed)?.understory)
            wordDomain = 'understory';
    }
    return { region, layer, material, depth, orientation, structure, light, u, v, wordDomain };
}
export function textureField(sample, col, row, seed, s) {
    if (sample.hybridRole)
        return Math.max(.02, Math.min(.98, sample.light * .7 + (noise(col, row, seed) - .5) * s.textureComplexity * .3 + .15));
    const { material, u, v } = sample, complex = s.textureComplexity, warp = smoothNoise(u * 9, v * 8, seed + 76);
    const atmospheric = s.atmosphericDetail, back = s.backgroundDetail, front = s.foregroundDetail;
    let field;
    if (material === 'atmosphere' || material === 'cloud')
        field = .5 + .30 * Math.sin(v * (16 + atmospheric * 12) + u * 5 + warp * 3) + .14 * smoothNoise(u * 35, v * 10, seed + 4);
    else if (material === 'rock')
        field = .45 + .25 * Math.sin((u * .8 + v) * 38 + warp * 5) + .18 * smoothNoise(u * (12 + back * 20), v * 24, seed + 7);
    else if (material === 'leaves')
        field = .2 + smoothNoise(u * (30 + front * 28) + warp, v * (22 + front * 20), seed + 9) * .7 + .1 * Math.sin(u * 72 + v * 41);
    else if (material === 'bark')
        field = .5 + .26 * Math.sin(col * .7 + warp * 2 + v * 3) + .12 * smoothNoise(u * 55, v * 9, seed + 11);
    else if (material === 'water')
        field = .45 + .3 * Math.sin(v * 90 + u * 17 + warp * 3) + .12 * smoothNoise(u * 35, v * 13, seed + 13);
    else if (material === 'soil')
        field = .45 + .24 * Math.sin(u * 34 - v * 26 + warp * 2) + .18 * smoothNoise(u * 36, v * 26, seed + 17);
    else
        field = .2 + smoothNoise(u * 12, v * 16, seed + 21) * .4;
    const micro = smoothNoise(col * .65, row * .7, seed + 93) - .5;
    return clamp(field + micro * .4 * complex, .02, .98);
}
