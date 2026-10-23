import { featureInk } from './ink.js';
/** Share local ink with the feature itself. Highlighting remains a view-only operation. */
export function blendNarratives(glyphs) {
    const cells = new Map();
    for (const g of glyphs)
        if (g.kind === 'texture')
            cells.set(`${g.col},${g.row}`, g);
    return glyphs.map(g => {
        if (g.kind !== 'narrative')
            return g;
        const nearby = [];
        for (let dy = -3; dy <= 3; dy++)
            for (let dx = -9; dx <= 9; dx++) {
                const n = cells.get(`${g.col + dx},${g.row + dy}`);
                if (n && (n.region ?? n.layer) === (g.region ?? g.layer))
                    nearby.push({ g: n, distance: Math.abs(dx) + Math.abs(dy) * 1.6 });
            }
        nearby.sort((a, b) => a.distance - b.distance);
        const colors = nearby.slice(0, 6).map(n => n.g.ink);
        // A texture-free scene still has feature-specific ink, never a separate story color.
        const ink = colors.length ? '#' + [1, 3, 5].map(i => Math.round(colors.reduce((sum, color) => sum + parseInt(color.slice(i, i + 2), 16), 0) / colors.length).toString(16).padStart(2, '0')).join('') : featureInk(g.region ?? g.layer, .5, .9);
        return { ...g, ink };
    });
}
