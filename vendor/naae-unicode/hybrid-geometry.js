import { regionAt, backgroundTreeAt } from './engine.js';
import { mainBranchAt } from './object-branches.js';
import { objectFrame } from './canvas.js';
import { pixelDetailGain } from './hybrid-model.js';
import { noise } from './engine.js';
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export function buildPixelEnvironment(c, detail) {
    const s = c.pixel, e = c.environment, fine = pixelDetailGain(s);
    const cols = Math.round(96 - s.tileEmphasis * 48 + fine * 125), rows = Math.max(24, Math.min(160 + Math.round(fine * 140), Math.round(cols * c.height / c.width))), layers = [];
    const add = (id, depth, regionId, role, fn) => {
        const cells = Array.from({ length: cols * rows }, (_, i) => fn((i % cols + .5) / cols, (Math.floor(i / cols) + .5) / rows, i % cols, Math.floor(i / cols)));
        layers.push({ id, depth, regionId, geometry: { kind: 'pixelGrid', cols, rows, cells, role }, density: 1, contrast: 1, occlusion: 'opaque', narrativePriority: 1 });
    };
    const simplify = Math.round(10 + (1 - s.shapeSimplification) * 28 + fine * 125), step = (1 + Math.round(s.steppedContours * 2)) / rows;
    const ridge = (x, near) => {
        const k = Math.floor(x * simplify), u = (k + .5) / simplify, phase = noise(near ? 17 : 11, 6, c.seed) * 2;
        const h = (near ? .53 : .42) - Math.abs(Math.sin(u * (near ? 6 : 5) + phase)) * (.07 + e.mountains * (near ? .08 : .13)) + (noise(k, near ? 3 : 1, c.seed) - .5) * (.012 + (1 - s.shapeSimplification) * .035);
        return Math.round(h / step) * step;
    };
    const river = (x, y) => { const row = Math.floor(y * rows), v = (Math.floor(row / 2) * 2 + .5) / rows, center = .67 - Math.sin((v - .5) * 6 + noise(3, 9, c.seed) * .6) * (.09 + e.terrain * .07), width = .018 + Math.max(0, y - .49) * .31; return e.river && y > .49 && Math.abs(x - center) < width; };
    add('px-sky', 0, 'sky', 'sky', () => 1);
    const clouds = Array.from({ length: 2 + Math.round(e.atmosphere * 3) }, (_, i) => ({ x: .08 + noise(i, 1, c.seed) * .7, y: .07 + noise(i, 2, c.seed) * .16, w: .10 + noise(i, 3, c.seed) * .16 }));
    add('px-clouds', 1, 'sky', 'cloud', (x, y) => clouds.some(p => (Math.abs(x - p.x) < p.w && y > p.y && y < p.y + 1.6 / rows) || (Math.abs(x - p.x) < p.w * .6 && y > p.y - 1 / rows && y < p.y + 2 / rows)) ? 1 : 0);
    add('px-distant-range', 2, 'mountains', 'mountainFar', (x, y) => y >= ridge(x, false) ? 1 : 0);
    add('px-near-range', 3, 'mountains', 'mountainNear', (x, y, col, row) => y >= ridge(x, true) ? (row % 5 === 0 && col % 8 < 5 ? 2 : 1) : 0);
    for (let tier = 0; tier < 2; tier++) {
        const count = Math.round(8 + e.forest * 8 + tier * 2), base = .60 + tier * .16, heights = Array.from({ length: count }, (_, i) => .055 + noise(i, tier + 31, c.seed) * (.065 + e.forest * .035)), tops = heights.map(h => Math.round((base - h) / step) * step);
        add(`px-forest-${tier}`, 4 + tier, 'forest', tier ? 'forestNear' : 'forestFar', (x, y, col, row) => {
            const t = x * count, i = Math.min(count - 1, Math.floor(t)), local = t - i, top = tops[i], level = Math.round((y - top) * rows);
            const relative = (y - top) / (heights[i] * .7), steppedWidth = level < 1 ? .24 : level < 3 ? .42 : .49;
            const crown = level >= 0 && relative < 1 && Math.abs(local - .5) < steppedWidth * (1 - fine) + (.12 + .37 * Math.sin(Math.max(0, relative) * Math.PI * .8)) * fine;
            if (crown)
                return noise(Math.floor(col / 2), Math.floor(row / 2), c.seed + tier) > .55 + s.macroBalance * .3 ? 2 : 1;
            if (y >= top + heights[i] * .3 && y < base && Math.abs(local - .5) < .07)
                return 3;
            return y >= base ? (noise(Math.floor(col / 4), Math.floor(row / 3), c.seed + tier) > .82 ? 2 : 1) : 0;
        });
    }
    add('px-river', 6, 'river', 'water', (x, y, col, row) => river(x, y) ? (row % 3 === 0 && col % 5 < 4 ? 2 : 1) : 0);
    add('px-earth', 7, 'earth', 'ground', (x, y, col, row) => y > .88 + Math.floor(noise(Math.floor(col / 6), 13, c.seed) * 3) / rows && !river(x, y) ? ((col + row) % 7 === 0 ? 2 : 1) : 0);
    add('px-foreground', 8, 'earth', 'foreground', (x, y, col, row) => {
        if (river(x, y))
            return 0;
        const edge = x < .16 || x > .86, stepY = .78 + noise(Math.floor(col / 3), 24, c.seed) * .12;
        if (edge && y > stepY && e.foreground > .15)
            return row % 4 === 0 ? 2 : 1;
        if (y > .90 && noise(Math.floor(col / 3), Math.floor(row / 2), c.seed + 8) > .90 - e.foreground * .15)
            return 3;
        return 0;
    });
    if (c.mode === 'scene')
        add('px-lookout', 9, 'earth', 'wood', (x, y) => ((y > .76 && y < .85 && ((x > .81 && x < .825) || (x > .855 && x < .87))) || (y > .745 && y < .77 && x > .80 && x < .88)) ? 1 : 0);
    return { id: 'borneo-px001', title: 'BORNEO / PX001 — The Land Remembers', mode: c.mode, seed: c.seed, rendererVersion: '0.4.0', world: { width: 1, height: 1 }, camera: { x: 0, y: 0, zoom: 1 }, layers, regions: [], detailLevel: detail, simplifications: [`Pixel macro grid ${cols} × ${rows}; terrain uses ${simplify} horizontal samples.`, `Contours quantized to ${Math.round(step * rows)} tile rows. Glyphs never become raster tiles.`] };
}
export function pixelCell(g, x, y) { return x < 0 || y < 0 || x >= 1 || y >= 1 ? 0 : g.cells[Math.floor(y * g.rows) * g.cols + Math.floor(x * g.cols)] ?? 0; }
/** Pixel contours sample the existing tree, preserving its authored anatomy and branch hierarchy. */
export function buildPixelObjectEnvironment(c, b, regions) {
    const s = c.pixel, fine = pixelDetailGain(s), cols = Math.round(120 - s.tileEmphasis * 64 + fine * 125), rows = Math.max(30, Math.min(180 + Math.round(fine * 120), Math.round(cols * c.height / c.width))), f = objectFrame(b, c.canvasFit === 'recompose');
    const samples = Array.from({ length: cols * rows }, (_, i) => {
        const u = (i % cols + .5) / cols, v = (Math.floor(i / cols) + .5) / rows, px = u * b.drawWidth, py = v * b.drawHeight;
        let x = (32 + px - f.col * b.advance) / f.width, y = (32 + py - f.row * b.leading) / f.height;
        const step = (1 + Math.round(s.steppedContours * 2)) / (80 + (1 - s.shapeSimplification) * 100 + fine * 500);
        x = Math.round(x / step) * step;
        y = Math.round(y / step) * step;
        const hit = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? regionAt(x, y, c.seed) : null;
        const tree = hit === 'forest' ? backgroundTreeAt(x, y, c.seed) : null, branch = hit === 'canopy' ? mainBranchAt(x, y) : null;
        return { hit: hit ?? 'atmosphere', wood: !!branch || tree?.part === 'wood', direction: branch?.orientation, understory: !!tree?.understory, shade: noise(Math.floor(x * 32), Math.floor(y * 26), c.seed) };
    });
    const definitions = [['atmosphere', 'sky', 'sky', 0], ['mountains', 'mountains', 'mountainFar', 1], ['forest', 'forest', 'forestFar', 3], ['water', 'water', 'water', 4], ['canopy', 'canopy', 'forestNear', 7], ['trunk', 'trunk', 'wood', 8], ['roots', 'roots', 'ground', 9]];
    const layers = definitions.map(([hit, id, role, depth]) => ({ id: 'px-tree-' + id, depth, regionId: id === 'sky' ? 'atmosphere' : id, geometry: { kind: 'pixelGrid', cols, rows, role, cells: samples.map(p => p.hit === hit ? (p.wood ? (p.direction === 'rising' ? 5 : p.direction === 'falling' ? 6 : 3) : p.understory ? 4 : p.shade > .7 ? 2 : 1) : 0) }, density: 1, contrast: 1, occlusion: 'opaque', narrativePriority: 1 }));
    return { id: 'forest-px001', title: 'FOREST / PX001 — The Forest Remembers', mode: 'object', seed: c.seed, rendererVersion: '0.4.0', world: { width: 1, height: 1 }, camera: { x: 0, y: 0, zoom: 1 }, layers, regions, detailLevel: b.detailLevel, simplifications: [`Tree contours sampled on a ${cols} × ${rows} tile grid; original crown, trunk, roots and branch hierarchy retained.`, `Contour quantization ${stepDescription(s.steppedContours, s.shapeSimplification, fine)}. No visible vector shapes.`] };
}
function stepDescription(strength, simplification, fine = 0) { return ((1 + Math.round(strength * 2)) / (80 + (1 - simplification) * 100 + fine * 500)).toFixed(4); }
