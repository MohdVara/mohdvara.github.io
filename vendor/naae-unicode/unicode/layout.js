import { validateRequest, UNICODE_VERSION, wordSegments } from './contract.js';
import { contrastInk } from '../appearance.js';
const hash = (text) => { let h = 2166136261; for (const ch of text) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
} return h >>> 0; };
const rand = (seed, x, y) => hash(seed + ':' + x + ':' + y) / 4294967296;
/** Bounded field lookup and spatial occupancy. Grid spacing never estimates text width. */
export function layoutText(request, measure) {
    const r = validateRequest(request), g = r.geometry, s = r.settings, vertical = s.writingMode === 'vertical-rl';
    const xs = [...new Set(g.cells.map(c => c.x))].sort((a, b) => a - b), ys = [...new Set(g.cells.map(c => c.y))].sort((a, b) => a - b);
    const dx = g.cells[0].width, dy = g.cells[0].height, x0 = xs[0], y0 = ys[0], field = new Map(g.cells.map(c => [Math.round((c.x - x0) / dx) + ',' + Math.round((c.y - y0) / dy), c]));
    const cellAt = (x, y) => field.get(Math.floor((x - x0) / dx) + ',' + Math.floor((y - y0) / dy));
    const runs = [], occupied = new Map(), passages = Object.create(null), unplaced = [], warnings = [];
    const buckets = (b) => { const keys = []; for (let y = Math.floor(b.y / 32); y <= Math.floor((b.y + b.height) / 32); y++)
        for (let x = Math.floor(b.x / 32); x <= Math.floor((b.x + b.width) / 32); x++)
            keys.push(x + ',' + y); return keys; };
    const overlap = (a, b) => a.x < b.x + b.width + .6 && a.x + a.width + .6 > b.x && a.y < b.y + b.height + .6 && a.y + a.height + .6 > b.y;
    const fits = (box, region, material) => {
        if (box.x < x0 || box.y < y0 || box.x + box.width > g.width || box.y + box.height > g.height)
            return false;
        const minX = Math.floor((box.x - x0) / dx), maxX = Math.floor((box.x + box.width - .001 - x0) / dx), minY = Math.floor((box.y - y0) / dy), maxY = Math.floor((box.y + box.height - .001 - y0) / dy);
        for (let y = minY; y <= maxY; y++)
            for (let x = minX; x <= maxX; x++) {
                const c = field.get(x + ',' + y);
                if (!c || c.region !== region || material && c.material !== material)
                    return false;
            }
        return !buckets(box).some(k => (occupied.get(k) ?? []).some(run => overlap(box, run.box)));
    };
    const add = (text, x, y, cell, kind, id, range) => {
        if (runs.length >= s.maxRuns)
            return undefined;
        const m = measure.measure(text), box = { x, y, width: m.width, height: m.height };
        if (!fits(box, cell.region, kind === 'semantic' ? undefined : cell.material))
            return undefined;
        const ink = contrastInk(cell.ink, g.background, kind === 'texture' ? Math.max(2.8, 2.8 + cell.tone * 1.7) : 4.5).ink;
        const run = { id, text, region: cell.region, material: cell.material, kind, x: x - m.left, y: y - m.top, box, ink, measurement: m, sourceRange: range };
        runs.push(run);
        for (const k of buckets(box)) {
            const bucket = occupied.get(k) ?? [];
            bucket.push(run);
            occupied.set(k, bucket);
        }
        return run;
    };
    const crossWidth = vertical ? Math.max(s.fontSize, ...r.textPack.tokens.map(t => measure.measure(t.text).width), ...r.textPack.densityMarks.map(t => measure.measure(t).width)) : 0;
    const columnStep = Math.max(s.fontSize * (s.columnSpacing ?? s.lineHeight), crossWidth + .7);
    const scan = (callback, spacing) => {
        if (vertical) {
            for (let x = g.width - dx - s.fontSize; x >= x0; x -= columnStep) {
                let y = y0;
                while (y < g.height - s.fontSize) {
                    const before = runs.length, c = cellAt(x, y);
                    if (c && callback(x, y, c))
                        return;
                    const placed = runs.length > before ? runs[runs.length - 1] : undefined;
                    y = placed ? Math.max(y + .7, placed.box.y + placed.box.height + .7) : y + Math.min(dy / 2, s.fontSize * .35);
                }
            }
        }
        else
            for (let y = y0; y < g.height - s.fontSize; y += spacing)
                for (let x = x0; x < g.width - s.fontSize; x += Math.min(dx, s.fontSize)) {
                    const c = cellAt(x, y);
                    if (c && callback(x, y, c))
                        return;
                }
    };
    const order = [...new Set([...s.regionPriority, ...Object.keys(r.mainText)])];
    for (const region of order) {
        const source = r.mainText[region];
        if (source === undefined)
            continue;
        const start = runs.length;
        let cursor = 0;
        const units = wordSegments(source, s.locale);
        let unit = 0;
        const pending = [];
        scan((x, y, c) => {
            if (c.region !== region || unit >= units.length)
                return false;
            let text = '', best = '', count = 0;
            for (let i = unit; i < units.length; i++) {
                const candidate = text + units[i];
                if (candidate.includes('\n') || candidate.includes('\r'))
                    break;
                const m = measure.measure(candidate), box = { x, y, width: m.width, height: m.height };
                if (!fits(box, region))
                    break;
                text = candidate;
                best = text;
                count++;
            }
            if (!best)
                return false;
            const run = add(best, x, y, c, 'semantic', `main-${region}-${cursor}`, [cursor, cursor + best.length]);
            if (!run)
                return false;
            pending.push(run);
            cursor += best.length;
            unit += count;
            // Newline is a preserved source separator, not an independently positioned mark.
            while (unit < units.length && /^[\r\n]+$/.test(units[unit])) {
                const newline = units[unit++];
                run.text += newline;
                cursor += newline.length;
                run.sourceRange[1] = cursor;
            }
            return unit >= units.length;
        }, s.fontSize * s.lineHeight);
        const pass = cursor === source.length;
        passages[region] = { source, reconstructed: pass ? pending.map(p => p.text).join('') : '', pass };
        if (!pass) {
            for (const run of runs.splice(start))
                for (const k of buckets(run.box)) {
                    occupied.set(k, (occupied.get(k) ?? []).filter(item => item !== run));
                }
            warnings.push(`Main text in ${region} does not fit; source retained, partial placement discarded.`);
        }
    }
    // Optional highlights are complete runs and must respect their semantic region constraints.
    for (const token of r.hiddenWords) {
        let found = false;
        scan((x, y, c) => { if (token.regionIds && !token.regionIds.includes(c.region))
            return false; found = !!add(token.text, x, y, c, 'highlight', token.id); return found; }, s.fontSize * s.lineHeight);
        if (!found)
            unplaced.push(token.id);
    }
    const byRegion = new Map();
    for (const region of new Set(g.cells.map(c => c.region)))
        byRegion.set(region, r.textPack.tokens.filter(t => !t.regionIds || t.regionIds.includes(region)));
    const marks = r.textPack.characters;
    const densityMarks = r.textPack.densityMarks.map(text => ({ text, m: measure.measure(text) }));
    const maxMeasureHeight = Math.max(s.fontSize, ...r.textPack.tokens.map(t => measure.measure(t.text).height));
    const spacing = Math.max(s.fontSize * s.lineHeight, vertical ? s.fontSize * 1.3 : maxMeasureHeight + 1.2);
    let capped = false;
    scan((x, y, c) => {
        if (runs.length >= s.maxRuns) {
            capped = true;
            return true;
        }
        if (rand(s.seed, Math.round(x), Math.round(y)) > s.density * r.textPack.densityPreference)
            return false;
        const vocabulary = (byRegion.get(c.region) ?? []).filter(t => !t.materials || t.materials.includes(c.material)), phrase = rand(s.seed + 1, Math.round(x), Math.round(y)) < s.phraseFrequency;
        let candidates = vocabulary.filter(t => s.strategy === 'phrases' || phrase ? t.role !== 'texture' : t.role === 'texture');
        if (!candidates.length)
            candidates = vocabulary;
        if (s.strategy === 'characters' && marks.length) {
            const index = Math.floor(rand(s.seed + 2, Math.round(x), Math.round(y)) * marks.length);
            add(marks[index], x, y, c, 'texture', 'mark-' + runs.length);
            return false;
        }
        const weight = candidates.reduce((n, t) => n + t.weight, 0);
        let selected = rand(s.seed + 3, Math.round(x), Math.round(y)) * weight;
        let chosen = candidates[0];
        for (const token of candidates) {
            chosen = token;
            selected -= token.weight;
            if (selected <= 0)
                break;
        }
        let placed = chosen ? add(chosen.text, x, y, c, 'texture', chosen.id + '-' + runs.length) : undefined;
        if (!placed)
            for (const token of [...candidates].sort((a, b) => measure.measure(a.text).width - measure.measure(b.text).width)) {
                placed = add(token.text, x, y, c, 'texture', token.id + '-' + runs.length);
                if (placed)
                    break;
            }
        if (!placed && densityMarks.length) {
            const target = .1 + c.tone * .48, offset = rand(s.seed + 41, Math.round(x), Math.round(y));
            const candidates = [...densityMarks].sort((a, b) => Math.abs(a.m.inkDensity - target) - Math.abs(b.m.inkDensity - target));
            // Try varied marks near the target ink density, then narrower marks for contour gaps.
            const first = Math.floor(offset * Math.min(6, candidates.length));
            candidates.unshift(candidates.splice(first, 1)[0]);
            for (const candidate of candidates) {
                if (add(candidate.text, x, y, c, 'texture', 'density-mark-' + runs.length))
                    break;
            }
        }
        // Safe script-specific density marks; never random Arabic/Indic code points.
        return false;
    }, spacing);
    if (capped)
        warnings.push('Run budget reached; optional texture was reduced.');
    if (vertical)
        warnings.push('Vertical layout is native SVG vertical-rl; ink density uses horizontal-run alpha calibration as an estimate.');
    warnings.push('Language samples are machine authored and await qualified review. Physical printing and cross-platform pixel parity are not verified.');
    const area = g.cells.reduce((n, c) => n + c.width * c.height, 0), placed = runs.reduce((n, run) => n + run.box.width * run.box.height, 0), ink = runs.reduce((n, run) => n + run.box.width * run.box.height * run.measurement.inkDensity, 0);
    return { schema: UNICODE_VERSION, request: r, runs, fontRevisions: Object.fromEntries(measure.fonts.map(f => [f.id, f.sha256])), report: { integrity: Object.values(passages).every(p => p.pass), passages, runs: runs.length, placedAreaFraction: placed / area, meanInkDensity: ink / Math.max(1, placed), estimatedInkAreaFraction: ink / area, unplacedTokens: unplaced, warnings, measurementBackend: measure.backend, clipped: runs.filter(run => run.box.x < 0 || run.box.y < 0 || run.box.x + run.box.width > g.width || run.box.y + run.box.height > g.height).length }, environment: { userAgent: navigator.userAgent, dpr: devicePixelRatio } };
}
