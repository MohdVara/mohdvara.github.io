import { buildPixelEnvironment, pixelCell } from './hybrid-geometry.js';
import { noise } from './engine.js';
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export function ridge(g, x) { let sum = 0, weight = 0; for (let i = 0; i < g.octaves; i++) {
    sum += Math.abs(Math.sin(x * g.frequency * 2 ** i + g.phase + i * 1.7)) * g.amplitude / 2 ** i;
    weight += 1 / 2 ** i;
} return g.base - sum / weight; }
export function riverCenter(g, y) { return .61 + Math.sin((y - .45) * 7 + g.phase) * g.bend - (y - .45) * .07; }
export function contains(g, x, y) {
    if (x < 0 || x > 1 || y < 0 || y > 1)
        return false;
    switch (g.kind) {
        case 'ridge': return y > ridge(g, x) && y < .98;
        case 'forest': {
            const base = g.base + Math.sin(x * 9 + g.phase) * .028 + Math.sin(x * 23) * .012;
            if (y > base)
                return true;
            const t = x * g.count, index = Math.floor(t), local = t - index - .5;
            const top = base - g.height * (.55 + noise(index, Math.floor(g.phase * 100), 1842) * .45);
            const crownY = top + g.height * .21;
            const r = .39 + Math.sin(index * 1.8) * .07;
            const crown = (local / r) ** 2 + ((y - crownY) / (g.height * .25)) ** 2 < 1 || ((local + .2) / .25) ** 2 + ((y - crownY - g.height * .09) / (g.height * .19)) ** 2 < 1 || ((local - .2) / .25) ** 2 + ((y - crownY - g.height * .07) / (g.height * .20)) ** 2 < 1;
            const branchY = crownY + g.height * .48 - Math.abs(local) * g.height * .9;
            return crown || (Math.abs(local) < .07 && y > crownY && y < base) || (Math.abs(local) < .36 && Math.abs(y - branchY) < .007);
        }
        case 'river': return y >= g.start && y <= g.end && Math.abs(x - riverCenter(g, y)) < g.halfWidth * (.12 + (y - g.start) / (g.end - g.start) * 1.8);
        case 'atmosphere': return g.bands.some(b => ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 < 1);
        case 'vegetation': {
            if (g.side === 'floor')
                return y > .90 + Math.sin(x * 15) * .018;
            const u = g.side === 'left' ? x : 1 - x;
            // Arching tropical fronds: stems plus alternating leaf fans.
            if (y > .94 && u < .14)
                return true;
            if (u < .018 && y > .50)
                return true;
            for (let i = 0; i < Math.round(2 + g.complexity * 3); i++) {
                const cy = .72 + i * .045, span = .18 + i * .025;
                const q = u / span;
                if (q < 0 || q > 1)
                    continue;
                const stemY = cy - Math.sin(q * Math.PI) * (.11 + i * .009) + q * .06;
                if (Math.abs(y - stemY) < .009)
                    return true;
                if (Math.abs(y - stemY) < (.025 + Math.sin(q * Math.PI) * .038) && Math.sin(q * (10 + g.complexity * 8) * Math.PI) > .05)
                    return true;
            }
            return false;
        }
        case 'rocks': return g.centers.some(p => ((x - p.x) / g.radius) ** 2 + ((y - p.y) / (g.radius * .5)) ** 2 < 1);
        case 'cabin': {
            const dx = Math.abs(x - g.center.x), dy = y - g.center.y;
            return dx < g.size && dy > -.5 * g.size && dy < g.size || dy < -.5 * g.size && dy > -1.4 * g.size && dx < (dy + 1.4 * g.size) / .9;
        }
        case 'pixelGrid': return pixelCell(g, x, y) > 0;
        case 'legacy-object': return false;
    }
}
export function ownerAt(graph, x, y) { for (let i = graph.layers.length - 1; i >= 0; i--)
    if (contains(graph.layers[i].geometry, x, y))
        return graph.layers[i]; return null; }
export function buildEnvironment(c, detail, iteration = 0) {
    if (c.renderStyle === 'pixelHybrid')
        return buildPixelEnvironment(c, detail);
    const e = c.environment, phase = noise(5, 8, c.seed) * 3.4;
    const layers = [];
    const add = (id, depth, regionId, geometry, density, contrast) => layers.push({ id, depth, regionId, geometry, density, contrast, occlusion: 'opaque', narrativePriority: 1 });
    const skyBands = [{ cx: .26, cy: .16, rx: .23, ry: .046 }, { cx: .69, cy: .11, rx: .19, ry: .034 }, { cx: .78, cy: .255, rx: .21, ry: .025 }];
    add('sky-bands', 0, 'sky', { kind: 'atmosphere', bands: skyBands }, .24, .65);
    add('distant-range', 1, 'mountains', { kind: 'ridge', base: .47, amplitude: .15 + e.mountains * .12, frequency: 5, phase, octaves: detail < .4 ? 1 : 3 }, .51, .50);
    add('near-range', 2, 'mountains', { kind: 'ridge', base: .53, amplitude: .07 + e.mountains * .08, frequency: 7, phase: phase + 1.4, octaves: detail < .4 ? 1 : 2 }, .68, .70);
    add('valley-mist', 3, 'sky', { kind: 'atmosphere', bands: [{ cx: .52, cy: .48, rx: .50, ry: .022 + e.atmosphere * .025 }] }, .12, .47);
    const rows = detail < .35 ? 2 : 3;
    for (let i = 0; i < rows; i++)
        add(`forest-${i}`, 4 + i, 'forest', { kind: 'forest', base: .57 + i * .10 + e.terrain * .025, height: .07 + i * .045 + e.forest * .03, count: Math.round((11 + i * 4) * (0.75 + detail * .35)), phase: phase + i * .7 }, .55 + i * .12, .67 + i * .13);
    if (e.river)
        add('river', 8, 'river', { kind: 'river', start: .49, end: 1, halfWidth: .064 + iteration * .02, bend: .10 + e.terrain * .035, phase: phase * .25 }, .40, .93);
    add('earth', 9, 'earth', { kind: 'vegetation', side: 'floor', complexity: detail }, .79, .95);
    // A genuine gap for the river mouth, controlled by mask ownership below.
    if (detail > .24)
        for (const side of ['left', 'right'])
            add(`${side}-fronds`, 10, 'earth', { kind: 'vegetation', side, complexity: detail * e.foreground }, .88, 1);
    if (detail > .6)
        add('river-stones', 11, 'earth', { kind: 'rocks', centers: [{ x: .77, y: .82 }, { x: .37, y: .91 }], radius: .024 }, .85, 1);
    if (c.mode === 'scene')
        add('experimental-cabin', 12, 'earth', { kind: 'cabin', center: { x: .24, y: .76 }, size: .055 }, .94, 1);
    if (c.preset === 'valley')
        layers.forEach(l => { if (l.geometry.kind === 'ridge')
            l.geometry.amplitude *= 1.3; if (l.geometry.kind === 'forest')
            l.geometry.height *= .75; });
    if (c.preset === 'coast') {
        const river = layers.find(l => l.geometry.kind === 'river');
        if (river && river.geometry.kind === 'river') {
            river.geometry.halfWidth = .19;
            river.geometry.bend = .035;
        }
    }
    if (c.preset === 'night') {
        const sky = layers[0].geometry;
        if (sky.kind === 'atmosphere')
            sky.bands.push({ cx: .49, cy: .07, rx: .43, ry: .022 });
    }
    const simplifications = detail < .35 ? ['Reduce texture before layout.', 'Use one terrain octave.', 'Remove one forest tier and decorative fronds/rocks.'] : detail < .6 ? ['Use fewer tree crowns and omit decorative rocks.'] : [];
    return { id: c.mode === 'scene' ? 'scene-003' : 'borneo-002', title: c.mode === 'scene' ? 'SCENE / 003 — A Shelter in the Valley' : 'BORNEO / 002 — The Land Remembers', mode: c.mode, seed: c.seed, rendererVersion: '0.2.0', world: { width: 1, height: 1 }, camera: { x: 0, y: 0, zoom: 1 }, layers: layers.sort((a, b) => a.depth - b.depth), regions: [], detailLevel: detail, simplifications };
}
export function visibleOwner(graph, c, x, y) {
    let owner = ownerAt(graph, x, y);
    // Open the foreground floor along the river rather than erasing its narrative later.
    if (owner?.id === 'earth') {
        const water = graph.layers.find(l => l.id === 'river');
        if (water && contains(water.geometry, x, y))
            owner = water;
    }
    if (owner && !c.visible[owner.regionId])
        return null;
    return owner;
}
export function narrativeMask(region, x, y, graph, c) {
    if (visibleOwner(graph, c, x, y)?.regionId !== region)
        return false;
    if (c.renderStyle === 'pixelHybrid') {
        if (region === 'sky')
            return y > .07 && y < .23 && x > .06 && x < .57;
        if (region === 'mountains')
            return y > .28 && y < .49;
        if (region === 'forest')
            return y > .55 && y < .84 && x < .55;
        if (region === 'river')
            return y > .63 && y < .94;
        return y > .87 && y < .98;
    }
    if (region === 'sky')
        return y > .105 && y < .20 && x > .075 && x < .47;
    if (region === 'mountains')
        return y > .29 && y < .45 && x > .10 && x < .86;
    if (region === 'forest')
        return y > .59 && y < .78 && x > .09 && x < .54;
    if (region === 'river')
        return y > .64 && y < .94;
    return y > .86 && y < .98 && x > .07 && x < .94;
}
