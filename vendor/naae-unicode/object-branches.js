/** Tapered, connected limbs in the existing object canopy. No visible vector geometry. */
const limbs = [
    [.54, .59, .43, .45, .018, .013], [.43, .45, .29, .34, .013, .007], [.29, .34, .19, .29, .007, .003],
    [.43, .45, .38, .30, .011, .006], [.38, .30, .32, .20, .006, .0025], [.38, .30, .44, .19, .006, .0025],
    [.54, .57, .64, .43, .019, .012], [.64, .43, .76, .32, .012, .007], [.76, .32, .84, .29, .007, .0025],
    [.64, .43, .66, .29, .011, .005], [.66, .29, .73, .21, .005, .0025], [.66, .29, .61, .18, .005, .0025],
    [.54, .49, .51, .33, .016, .009], [.51, .33, .55, .20, .009, .004], [.55, .20, .51, .13, .004, .002],
    [.29, .34, .26, .25, .005, .002], [.76, .32, .79, .23, .005, .002],
];
export function mainBranchAt(x, y) {
    let best = null;
    for (const [ax, ay, bx, by, start, end] of limbs) {
        const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))), width = start + (end - start) * t, distance = Math.hypot(x - ax - t * dx, y - ay - t * dy);
        if (distance < width) {
            const strength = 1 - distance / width;
            if (!best || strength > best.strength)
                best = { orientation: Math.abs(dx) < .05 ? 'vertical' : dx < 0 ? 'falling' : 'rising', strength };
        }
    }
    return best;
}
