export type Vec = {
    x: number;
    y: number;
};
export type Wall = Vec & {
    w: number;
    h: number;
};
export type Spawn = Vec & {
    kind: 'flood' | 'probe';
};
export type Chamber = {
    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
};
export type Floor = {
    width: number;
    height: number;
    walls: Wall[];
    entry: Vec;
    terminal: Vec;
    exit: Vec;
    spawns: Spawn[];
    chambers: Chamber[];
    name: string;
    seed: string;
    generatorVersion: number;
    level: number;
    fallback: boolean;
};
const authoredArena = { width: 900, height: 540, terminal: { x: 802, y: 435 }, walls: [
        { x: 0, y: 0, w: 900, h: 16 }, { x: 0, y: 524, w: 900, h: 16 }, { x: 0, y: 0, w: 16, h: 540 }, { x: 884, y: 0, w: 16, h: 540 },
        { x: 290, y: 16, w: 24, h: 134 }, { x: 290, y: 260, w: 24, h: 100 }, { x: 290, y: 460, w: 24, h: 64 },
        { x: 590, y: 16, w: 24, h: 144 }, { x: 590, y: 270, w: 24, h: 84 }, { x: 590, y: 454, w: 24, h: 70 },
        { x: 125, y: 230, w: 82, h: 44 }, { x: 135, y: 355, w: 70, h: 40 }, { x: 410, y: 115, w: 76, h: 44 }, { x: 420, y: 350, w: 80, h: 46 }, { x: 715, y: 260, w: 82, h: 46 },
    ] };
export const authoredFloor: Floor = { ...authoredArena, entry: { x: 85, y: 445 }, exit: { ...authoredArena.terminal }, spawns: [['flood', 205, 115], ['probe', 230, 330], ['flood', 385, 240], ['probe', 500, 235], ['flood', 535, 455], ['probe', 760, 110], ['flood', 685, 375], ['probe', 830, 350]].map(([kind, x, y]) => ({ kind: kind as Spawn['kind'], x: Number(x), y: Number(y) })), chambers: [{ id: 0, x: 16, y: 16, w: 274, h: 508 }, { id: 1, x: 314, y: 16, w: 276, h: 508 }, { id: 2, x: 614, y: 16, w: 270, h: 508 }], name: 'EDGE GATEWAY · AUTHORED', seed: 'authored', generatorVersion: 0, level: 1, fallback: true };
export function worldBlocked(floor: Floor, x: number, y: number, radius = 0): boolean {
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < radius || y < radius || x > floor.width - radius || y > floor.height - radius)
        return true;
    for (const w of floor.walls)
        if (x > w.x - radius && x < w.x + w.w + radius && y > w.y - radius && y < w.y + w.h + radius)
            return true;
    return false;
}
export function worldLineOfSight(floor: Floor, a: Vec, b: Vec, radius = 0): boolean {
    const dx = b.x - a.x, dy = b.y - a.y;
    for (const w of floor.walls) {
        let lo = 0, hi = 1;
        const left = w.x - radius, right = w.x + w.w + radius, top = w.y - radius, bottom = w.y + w.h + radius;
        if (Math.abs(dx) < .0001) {
            if (a.x < left || a.x > right)
                continue;
        }
        else {
            const t1 = (left - a.x) / dx, t2 = (right - a.x) / dx;
            lo = Math.max(lo, Math.min(t1, t2));
            hi = Math.min(hi, Math.max(t1, t2));
            if (lo > hi)
                continue;
        }
        if (Math.abs(dy) < .0001) {
            if (a.y < top || a.y > bottom)
                continue;
        }
        else {
            const t1 = (top - a.y) / dy, t2 = (bottom - a.y) / dy;
            lo = Math.max(lo, Math.min(t1, t2));
            hi = Math.min(hi, Math.max(t1, t2));
            if (lo > hi)
                continue;
        }
        return false;
    }
    return true;
}
