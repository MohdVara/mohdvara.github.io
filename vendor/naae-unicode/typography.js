/** Shared word-aware allocator. Spaces retain source indices, including at wraps. */
export const normalizeText = (s) => s.replace(/\s+/gu, ' ').trim();
export const FONT = { advance: 1229 / 2048, xHeight: 1082 / 2048, capHeight: 1349 / 2048, strokeEstimate: .07 };
export function flowText(options) {
    const { id, cols, rows, valid, occupied } = options, source = options.preserveSource ? options.source : normalizeText(options.source), chars = [...source];
    const unsupported = chars.some(ch => ch.codePointAt(0) < 32 || ch.codePointAt(0) > 126);
    const pending = [];
    let cursor = 0;
    if (options.enabled && !unsupported)
        for (let row = 0; row < rows && cursor < chars.length; row++) {
            const runs = [];
            let run = [];
            for (let col = 0; col <= cols; col++) {
                if (col < cols && valid(col, row) && !occupied?.(col, row))
                    run.push(col);
                else if (run.length) {
                    runs.push(run);
                    run = [];
                }
            }
            const rank = (run) => run.length - (options.preferCol === undefined ? 0 : Math.abs((run[0] + run[run.length - 1]) / 2 - options.preferCol) * .65);
            let best = runs.sort((a, b) => rank(b) - rank(a))[0];
            if (!best)
                continue;
            best = options.shapeRun?.(best, row) ?? best;
            let offset = 0;
            while (cursor < chars.length) {
                const word = chars.slice(cursor).join('').match(/^\S+ ?/)?.[0] ?? '';
                if (!word.length || word.length > best.length - offset)
                    break;
                for (const char of word)
                    pending.push({ char, col: best[offset++], row, index: cursor, passageId: id, readingOrder: cursor++ });
            }
        }
    const pass = cursor === chars.length && !unsupported;
    return { cells: pass ? pending : [], report: { source, reconstructed: pass ? pending.map(g => g.char).join('') : '', required: chars.length, rendered: pass ? pending.length : 0, pass, overflow: !pass && !unsupported && options.enabled, hidden: !options.enabled, unsupported } };
}
/** Explicit continuation through ordered masks, with one protected source sequence. */
export function flowContinuation(id, input, zones) {
    const source = normalizeText(input), tokens = source.match(/\S+ ?/g) ?? [], pending = [], used = new Set();
    let next = 0, offset = 0;
    for (const zone of zones) {
        let low = 0, high = tokens.length - next, best;
        while (low < high) {
            const middle = Math.ceil((low + high) / 2), part = tokens.slice(next, next + middle).join('');
            const attempt = flowText({ ...zone.layout, id, source: part, preserveSource: true, occupied: (col, row) => used.has(`${col},${row}`) || !!zone.layout.occupied?.(col, row) });
            if (attempt.report.pass) {
                low = middle;
                best = attempt;
            }
            else
                high = middle - 1;
        }
        if (low)
            best = flowText({ ...zone.layout, id, source: tokens.slice(next, next + low).join(''), preserveSource: true, occupied: (col, row) => used.has(`${col},${row}`) || !!zone.layout.occupied?.(col, row) });
        if (!low || !best)
            continue;
        for (const cell of best.cells) {
            const g = { ...cell, index: cell.index + offset, readingOrder: cell.index + offset, region: zone.regionId };
            pending.push(g);
            used.add(`${g.col},${g.row}`);
        }
        offset += best.report.required;
        next += low;
    }
    const pass = next === tokens.length;
    return { cells: pass ? pending : [], report: { source, reconstructed: pass ? pending.map(c => c.char).join('') : '', required: source.length, rendered: pass ? pending.length : 0, pass, overflow: !pass, hidden: false, unsupported: [...source].some(ch => ch.codePointAt(0) > 126 || ch.codePointAt(0) < 32) } };
}
