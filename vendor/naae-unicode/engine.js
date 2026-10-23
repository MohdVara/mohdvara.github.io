import { featureInk } from './ink.js';
import { blendNarratives } from './blending.js';
import { flowText, normalizeText } from './typography.js';
import { renderSVG, renderASCII } from './svg.js';
export { escapeXml } from './svg.js';
/** NAAE: pure, deterministic, glyph-only scene construction. No DOM or raster inputs. */
export const REGIONS = ['canopy', 'trunk', 'roots'];
export const narratives = {
    canopy: 'I have held the light of a thousand wet seasons. Children became elders beneath these leaves. Each dawn arrives unnamed; each leaf learns the sun again.',
    trunk: 'I remember the hands that rested here. Their names left with the rain. The warmth stayed, ring within ring.',
    roots: 'Below the last footprint, I keep the paths no map remembers. What the river carries away, the dark returns to us. Nothing loved is wholly lost.'
};
export const titles = { canopy: 'What the Forest Sees', trunk: 'What the Forest Remembers', roots: 'What the Forest Keeps' };
export const defaults = { seed: 1842, width: 1200, height: 1200, fontSize: 12, tracking: 0.5,
    density: 0.94, narrativeRatio: 0.25, contrast: 0.85, detail: 0.8, printWidthMm: 480, minCharacterMm: 2.5,
    visible: { canopy: true, trunk: true, roots: true, mountains: true, forest: true, water: true } };
export function noise(x, y, seed) {
    let n = Math.imul(x ^ seed, 374761393) ^ Math.imul(y, 668265263);
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
export const normalize = normalizeText;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function ellipse(x, y, cx, cy, rx, ry) { return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; }
function segment(x, y, ax, ay, bx, by) {
    const t = clamp(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0, 1);
    return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
}
export function backgroundTreeAt(x, y, seed) {
    for (let i = 0; i < 10; i++) {
        const cx = (i + .45) / 10 + noise(i, 2, seed) * .017;
        const cy = .55 + noise(i, 3, seed) * .13, rx = .036 + noise(i, 4, seed) * .025, ry = .039 + noise(i, 5, seed) * .024;
        const base = .84 + noise(i, 6, seed) * .07;
        const shade = noise(i, 7, seed);
        const crown = [[-.45, .13, .70, .78], [0, -.32, .83, .94], [.48, .17, .68, .76]].some(([ox, oy, sx, sy]) => ellipse(x, y, cx + ox * rx, cy + oy * ry, rx * sx, ry * sy) < 1);
        if (crown)
            return { part: 'crown', tree: i, shade };
        if (segment(x, y, cx, cy + ry * .3, cx, base) < .0048 || segment(x, y, cx, cy + .11, cx - rx * .68, cy + ry * .35) < .004 || segment(x, y, cx, cy + .095, cx + rx * .7, cy + ry * .3) < .004 || segment(x, y, cx, base, cx - rx * .5, base + .02) < .0035)
            return { part: 'wood', tree: i, shade };
    }
    // A layered understory occupies the previously empty lower forest, behind exposed stems.
    const edge = .73 + Math.sin(x * 17) * .035 + Math.sin(x * 39 + seed) * .018;
    if (y > edge && y < .97)
        return { part: 'crown', tree: 10 + Math.floor(x * 24), shade: noise(Math.floor(x * 24), Math.floor(y * 18), seed), understory: true };
    return null;
}
function rootDistance(x, y) {
    const t = Math.max(0, Math.min(1, (y - .78) / .16));
    let min = 1;
    for (const end of [.19, .29, .4, .64, .76, .89]) {
        const xx = .54 + (end - .54) * t ** .8 + Math.sin(t * Math.PI) * (end < .54 ? -.018 : .018);
        min = Math.min(min, Math.abs(x - xx));
    }
    return min;
}
/** Scene graph masks in normalized art coordinates. Geometry never enters the SVG. */
export function regionAt(x, y, seed) {
    const phase = noise(4, 7, seed) * 4;
    const ripple = Math.sin(x * 67 + phase) * 0.009 + Math.sin(y * 93 + x * 37) * 0.006;
    const crown = [[.29, .32, .18, .12], [.43, .24, .20, .15], [.59, .22, .19, .14], [.73, .31, .18, .13], [.51, .35, .24, .13]];
    if (crown.some(([cx, cy, rx, ry]) => ellipse(x, y, cx, cy, rx, ry) < 1 + ripple * 12))
        return 'canopy';
    const center = .545 + Math.sin(y * 9) * .012;
    const trunkWidth = .044 + Math.max(0, y - .52) * .055;
    if (y > .34 && y < .85 && Math.abs(x - center) < trunkWidth + ripple * .25)
        return 'trunk';
    const branches = [[.54, .57, .29, .35], [.54, .55, .75, .35], [.54, .45, .41, .26], [.55, .49, .66, .26]];
    if (branches.some(([ax, ay, bx, by]) => segment(x, y, ax, ay, bx, by) < .012 + (y - .3) * .013))
        return 'trunk';
    if (y > .77 && y < .947) {
        const spread = .075 + (y - .77) * 1.8;
        if (Math.abs(x - .54) < spread && y < .93 + Math.sin(x * 30) * .013)
            return 'roots';
    }
    if (backgroundTreeAt(x, y, seed))
        return 'forest';
    const ridge = .51 - Math.abs(Math.sin(x * 8 + phase)) * .13 + Math.sin(x * 34) * .016;
    if (y > ridge && y < .65 + Math.sin(x * 13) * .02)
        return 'mountains';
    const streamX = .84 - (y - .68) * .58 + Math.sin(y * 18) * .03;
    if (y > .66 && y < .96 && Math.abs(x - streamX) < .012 + (y - .66) * .11)
        return 'water';
    return null;
}
function insideNarrative(layer, x, y, seed) {
    if (regionAt(x, y, seed) !== layer)
        return false;
    return layer === 'canopy' ? y > .235 && y < .415 && x > .30 && x < .69
        : layer === 'trunk' ? y > .51 && y < .79 : y > .835 && y < .925;
}
function checkConfig(c) {
    for (const key of Object.keys(defaults).filter(k => k !== 'visible'))
        if (typeof c[key] !== 'number' || !Number.isFinite(c[key]))
            throw new Error(`Invalid ${key}: must be finite and numeric.`);
    if (!Number.isSafeInteger(c.seed) || c.seed < 0 || c.seed > 4294967295)
        throw new Error('Seed must be an unsigned 32-bit integer.');
    if (!c.visible || Object.keys(defaults.visible).some(k => typeof c.visible[k] !== 'boolean'))
        throw new Error('All region visibility flags must be boolean.');
    if (c.width < (c.internalGrid ? 65 : 300) || c.width > (c.internalGrid ? 3064 : 3000) || c.height < (c.internalGrid ? 65 : 300) || c.height > (c.internalGrid ? 3064 : 3000))
        throw new Error('Canvas dimensions must be 300–3000 units.');
    if (c.fontSize < 8 || c.fontSize > 36)
        throw new Error('Minimum font size must be 8–36 units; the engine never shrinks it.');
    if (c.tracking < 0 || c.tracking > 4 || c.printWidthMm <= 0 || c.minCharacterMm <= 0)
        throw new Error('Invalid spacing or print dimensions.');
    for (const key of ['density', 'narrativeRatio', 'contrast', 'detail'])
        if (c[key] < 0 || c[key] > 1)
            throw new Error(`${key} must be between 0 and 1.`);
}
export function generate(config = defaults, passages = narratives) {
    const c = structuredClone(config);
    checkConfig(c);
    // Liberation Mono advance = 1229/2048 em. Extra tracking protects ink boxes.
    const advance = c.fontSize * 1229 / 2048 + c.tracking;
    const leading = c.fontSize * (c.lineHeight ?? 1.2);
    const cols = Math.floor((c.width - 64) / advance), rows = Math.floor((c.height - 64) / leading);
    const cells = new Map();
    const reports = {};
    const position = (col, row) => ({ x: 32 + col * advance, y: 32 + (row + 1) * leading });
    const mask = (col, row) => { const p = position(col, row); return regionAt((p.x + advance / 2) / c.width, (p.y - c.fontSize * .33) / c.height, c.seed); };
    for (const region of REGIONS) {
        const result = flowText({ id: region, source: passages[region], cols, rows, enabled: c.visible[region], valid: (col, row) => {
                const p = position(col, row);
                if (c.narrativeGuards?.[region] && !c.narrativeGuards[region][row * cols + col])
                    return false;
                return [-.1, .7].every(dx => [-.7, 0].every(dy => insideNarrative(region, (p.x + advance * dx) / c.width, (p.y + c.fontSize * dy) / c.height, c.seed)));
            } });
        for (const cell of result.cells) {
            const g = { ...cell, ...position(cell.col, cell.row), layer: region, kind: 'narrative', ink: '#d5c58e' };
            cells.set(g.row * cols + g.col, g);
        }
        reports[region] = result.report;
    }
    const ramp = { canopy: ".,:;+*oO@", trunk: "|!/:IlH#", roots: "_/-=vY#", forest: ".,:;+il*", mountains: ":/+=^", water: "._~-=" };
    for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
            const key = row * cols + col;
            if (cells.has(key))
                continue;
            const layer = mask(col, row);
            if (!layer || !c.visible[layer])
                continue;
            const n = noise(col, row, c.seed), p = position(col, row), x = (p.x + advance / 2) / c.width, y = (p.y - c.fontSize * .33) / c.height;
            const back = layer === 'mountains' || layer === 'forest';
            const tree = layer === 'forest' ? backgroundTreeAt(x, y, c.seed) : null;
            const fill = c.density * (layer === 'canopy' ? 1.18 : tree?.part === 'wood' ? 1.3 : tree ? 1.16 : back ? .7 : 1) * (1 - c.narrativeRatio * .24);
            const cluster = noise(Math.floor(col / (3 + (1 - c.detail) * 5)), Math.floor(row / (2 + (1 - c.detail) * 3)), c.seed);
            if (n > fill)
                continue;
            if (layer === 'mountains') {
                const ridge = .51 - Math.abs(Math.sin(x * 8 + noise(4, 7, c.seed) * 4)) * .13 + Math.sin(x * 34) * .016;
                if (y - ridge > .025 && n > c.density * .88)
                    continue;
            }
            if (layer === 'water' && row % 3 !== 0)
                continue;
            if (layer === 'roots' && rootDistance(x, y) > .011 + (1 - Math.max(0, (y - .78) / .16)) * .018 && row % 4 !== 0)
                continue;
            let intensity = Math.max(0, Math.min(.99, .25 + cluster * .5 + Math.sin(col * .16 - row * .3) * .12));
            let char, inkRegion = layer;
            if (layer === 'canopy' || tree?.part === 'crown') {
                char = cluster > .68 ? 'O' : cluster > .36 ? 'o' : '*';
                // Visible supporting limbs connect the broad crown to its trunk.
                const limb = layer === 'canopy' && [[.54, .57, .29, .35], [.54, .55, .75, .35], [.54, .45, .41, .26], [.55, .49, .66, .26]].some(([ax, ay, bx, by]) => segment(x, y, ax, ay, bx, by) < .006);
                if (limb) {
                    char = x < .54 ? '\\' : '/';
                    inkRegion = 'trunk';
                    intensity = .56;
                }
                if (tree) {
                    intensity = .22 + tree.shade * .6;
                    inkRegion = tree.understory ? 'forestFar' : 'forest';
                }
            }
            else if (layer === 'trunk' || tree?.part === 'wood') {
                const center = .545 + Math.sin(y * 9) * .012;
                char = y < .53 ? (x < center ? '\\' : '/') : (Math.sin(col * 1.5 + Math.sin(y * 7) * .3) > .1 ? '|' : ':');
                intensity = .3 + (Math.sin(col * 1.5) + 1) * .23;
                inkRegion = tree ? 'backgroundWood' : 'trunk';
            }
            else if (layer === 'roots') {
                char = x < .54 ? '/' : '\\';
                intensity = .36 + cluster * .35;
            }
            else {
                const bank = ramp[layer];
                char = bank[Math.floor(intensity * bank.length)];
            }
            const ink = featureInk(inkRegion, intensity, c.contrast);
            cells.set(key, { char, col, row, ...p, layer, kind: 'texture', ink });
        }
    const glyphs = blendNarratives([...cells.values()].sort((a, b) => a.row - b.row || a.col - b.col));
    // Reconstruct from final, post-texture metadata, never trust the allocator alone.
    for (const region of REGIONS) {
        const actual = glyphs.filter(g => g.kind === 'narrative' && g.layer === region).sort((a, b) => a.index - b.index).map(g => g.char).join('');
        reports[region].reconstructed = actual;
        reports[region].pass = reports[region].pass && actual === reports[region].source;
    }
    return { config: c, cols, rows, advance, leading, glyphs, report: diagnose(c, glyphs, reports, cols, rows) };
}
export function collisions(glyphs) {
    const seen = new Set();
    let count = 0;
    for (const g of glyphs) {
        const key = `${g.col},${g.row}`;
        if (seen.has(key))
            count++;
        seen.add(key);
    }
    return count;
}
function diagnose(c, glyphs, passages, cols, rows) {
    // Font cap-height measured from Liberation Mono OS/2: 1349/2048 em.
    const characterMm = c.fontSize * 1349 / 2048 * c.printWidthMm / c.width;
    const lowercaseMm = c.fontSize * 1082 / 2048 * c.printWidthMm / c.width;
    const warnings = [];
    if (lowercaseMm < c.minCharacterMm)
        warnings.push(`Estimated lowercase x-height ${lowercaseMm.toFixed(2)} mm is below ${c.minCharacterMm.toFixed(2)} mm. Increase print width or font size.`);
    for (const r of REGIONS)
        if (!passages[r].pass)
            warnings.push(`${r}: ${passages[r].hidden ? 'region hidden' : passages[r].unsupported ? 'unsupported non-ASCII narrative; use printable ASCII in v0.1' : 'passage does not fit; nothing from this passage was rendered'}.`);
    const collisionCount = collisions(glyphs);
    const outOfBounds = glyphs.filter(g => g.x < 0 || g.y > c.height || g.x + c.fontSize * .61 > c.width || g.y - c.fontSize < 0).length;
    const histogram = Object.fromEntries(['canopy', 'trunk', 'roots', 'forest', 'mountains', 'water'].map(layer => [layer, glyphs.filter(g => g.layer === layer).length]));
    return { version: '0.1', seed: c.seed, normalization: 'Collapse all whitespace to one ASCII space; trim ends. Printable ASCII passages only. Each normalized source character, including spaces at line ends, has a sequential index.', passages,
        glyphCount: glyphs.length, collisionCount, outOfBounds, fontSize: c.fontSize, estimatedCapHeightMm: characterMm, estimatedLowercaseHeightMm: lowercaseMm, printWidthMm: c.printWidthMm, printHeightMm: c.printWidthMm * c.height / c.width,
        density: glyphs.length / (cols * rows), histogram, warnings, integrity: REGIONS.every(r => passages[r].pass), exportReady: REGIONS.every(r => passages[r].pass) && !collisionCount && !outOfBounds && lowercaseMm >= c.minCharacterMm,
        physicalPrintTested: false, visualAssessment: 'Manual review required: recognizability and balance are not inferred from passing integrity checks.', collisionMethod: 'Unique monospaced cell occupancy; font advance plus tracking and 1.2em leading. Ink-box overlap should also be checked in browser.' };
}
export function toSVG(scene, fontBase64, highlight = null) {
    return renderSVG({ id: 'forest-001', title: 'FOREST / 001 — The Forest Remembers', description: `A Borneo-inspired rainforest built entirely from real text. Seed ${scene.config.seed}. ${scene.report.warnings.join(' ')}`, width: scene.config.width, height: scene.config.height, physicalWidth: scene.config.printWidthMm, physicalHeight: scene.config.printWidthMm * scene.config.height / scene.config.width, fontSize: scene.config.fontSize, glyphs: scene.glyphs, metadata: { config: scene.config, report: scene.report } }, fontBase64, highlight);
}
export function toASCII(scene) { return renderASCII(scene.cols, scene.rows, scene.glyphs); }
