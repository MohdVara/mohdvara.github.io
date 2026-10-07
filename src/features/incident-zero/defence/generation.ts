import { authoredFloor, worldBlocked, worldLineOfSight, type Floor, type Wall, type Chamber, type Spawn, type Vec } from './floor';
import { navigationGraph, nearestCell, reachableCells } from './navigation';
export const generatorVersion = 1;
export const levelBudgets = [{ flood: 4, probe: 2 }, { flood: 5, probe: 3 }, { flood: 6, probe: 3 }, { flood: 6, probe: 4 }, { flood: 8, probe: 4 }] as const;
export const floorNames = ['EDGE GATEWAY', 'MESSAGE BROKER', 'CACHE CLUSTER', 'AUTHENTICATION SERVICE', 'JOB SCHEDULER', 'STORAGE REPLICA', 'OBSERVABILITY RELAY'];
const regions = ['AP-SOUTH', 'EU-WEST', 'US-EAST'];
export function seededRandom(seed: string) {
    let state = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        state ^= seed.charCodeAt(i);
        state = Math.imul(state, 16777619);
    }
    return () => { state += 0x6D2B79F5; let x = state; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
}
function pick<T>(random: () => number, values: readonly T[]): T { return values[Math.floor(random() * values.length)]; }
function segment(walls: Wall[], x: number, y: number, w: number, h: number, gap: number, horizontal: boolean) {
    const size = 120;
    if (horizontal) {
        walls.push({ x, y, w: gap - size / 2 - x, h }, { x: gap + size / 2, y, w: x + w - gap - size / 2, h });
    }
    else {
        walls.push({ x, y, w, h: gap - size / 2 - y }, { x, y: gap + size / 2, w, h: y + h - gap - size / 2 });
    }
}
function construct(seed: string, level: number, attempt: number): Floor {
    const layout = seededRandom(`${generatorVersion}:${seed}:${level}:layout:${attempt}`), encounter = seededRandom(`${generatorVersion}:${seed}:${level}:encounter:${attempt}`), decor = seededRandom(`${generatorVersion}:${seed}:${level}:decor`);
    const walls: Wall[] = [{ x: 0, y: 0, w: 900, h: 16 }, { x: 0, y: 524, w: 900, h: 16 }, { x: 0, y: 0, w: 16, h: 540 }, { x: 884, y: 0, w: 16, h: 540 }];
    const merged = new Set<number>();
    const count = pick(layout, [4, 5, 6]);
    const columns = [0, 1, 2];
    for (let i = columns.length - 1; i > 0; i--) {
        const j = Math.floor(layout() * (i + 1));
        [columns[i], columns[j]] = [columns[j], columns[i]];
    }
    for (const col of columns.slice(0, 6 - count))
        merged.add(col);
    const chambers: Chamber[] = [];
    for (let col = 0; col < 3; col++) {
        const x = col * 300 + 16, w = 268;
        if (merged.has(col))
            chambers.push({ id: col, x, y: 16, w, h: 508 });
        else {
            chambers.push({ id: col, x, y: 16, w, h: 246 }, { id: col + 3, x, y: 278, w, h: 246 });
            segment(walls, col * 300 + 16, 263, 268, 14, col * 300 + pick(layout, [90, 150, 210]), true);
        }
    }
    // Two parallel crossings between each column plus three vertical routes form loops.
    for (const x of [293, 593]) {
        segment(walls, x, 16, 14, 246, pick(layout, [105, 135, 165, 195]), false);
        segment(walls, x, 278, 14, 246, pick(layout, [345, 375, 405, 435]), false);
    }
    // Cover stays off door mouths and leaves routes around both ends.
    for (let col = 0; col < 3; col++)
        for (let row = 0; row < 2; row++) {
            if (col === 0 && row === 0)
                continue;
            if (layout() < .7)
                walls.push({ x: col * 300 + pick(layout, [90, 180]), y: row * 270 + pick(layout, [90, 180]), w: 60, h: 30 });
        }
    const floor: Floor = { width: 900, height: 540, walls, entry: { x: 75, y: 75 }, terminal: { x: 825, y: 465 }, exit: { x: 825, y: 465 }, spawns: [], chambers, name: `${pick(decor, regions)} · ${pick(decor, floorNames)}`, seed, generatorVersion, level, fallback: false };
    const budget = levelBudgets[level - 1];
    // Clusters at 40–55px spacing reward Fan; probes occupy more open, separated lanes.
    const rooms = [1, 4, 2, 5, 3];
    let roomOffset = Math.floor(encounter() * rooms.length);
    for (const kind of ['flood', 'probe'] as const) {
        const n = budget[kind];
        for (let i = 0; i < n; i++) {
            let placed = false;
            for (let tries = 0; tries < 60 && !placed; tries++) {
                const room = rooms[(roomOffset + Math.floor(i / (kind === 'flood' ? 2 : 1)) + Math.floor(tries / 12)) % rooms.length], col = room % 3, row = Math.floor(room / 3);
                let x = col * 300 + pick(encounter, [75, 105, 135, 165, 195, 225]), y = row * 270 + pick(encounter, [75, 105, 135, 165, 195, 225]);
                if (kind === 'flood' && i % 2 === 1 && tries < 12) {
                    const anchor = floor.spawns[floor.spawns.length - 1], offset = pick(encounter, [{ x: 45, y: 0 }, { x: -45, y: 0 }, { x: 0, y: 45 }, { x: 0, y: -45 }]);
                    x = anchor.x + offset.x;
                    y = anchor.y + offset.y;
                    if (x < col * 300 + 45 || x > col * 300 + 255 || y < row * 270 + 45 || y > row * 270 + 255)
                        continue;
                }
                const point = { x, y };
                const spacing = kind === 'flood' ? 38 : 78;
                if (worldBlocked(floor, x, y, 18) || Math.hypot(x - 75, y - 75) < 150 || Math.hypot(x - 825, y - 465) < 75 || floor.spawns.some(e => Math.hypot(e.x - x, e.y - y) < spacing))
                    continue;
                if (kind === 'probe') {
                    let sight = 0;
                    for (const offset of [{ x: x + 90, y }, { x: x - 90, y }, { x, y: y + 90 }, { x, y: y - 90 }])
                        if (!worldBlocked(floor, offset.x, offset.y, 13) && worldLineOfSight(floor, point, offset, 3))
                            sight++;
                    if (sight < 2)
                        continue;
                }
                floor.spawns.push({ ...point, kind });
                placed = true;
            }
        }
        roomOffset = (roomOffset + 1) % rooms.length;
    }
    return floor;
}
export function validateFloor(floor: Floor): string[] {
    const errors: string[] = [], budget = levelBudgets[floor.level - 1];
    if (!budget || floor.chambers.length < 4 || floor.chambers.length > 6)
        errors.push('chambers/budget');
    const total = floor.spawns.length;
    if (total > 12 || floor.spawns.filter(e => e.kind === 'flood').length !== budget?.flood || floor.spawns.filter(e => e.kind === 'probe').length !== budget?.probe)
        errors.push('enemy budget');
    const graph = navigationGraph(floor), reachable = reachableCells(floor, floor.entry);
    if (reachable.size !== graph.walkable.length)
        errors.push('inaccessible clearance pocket');
    for (const objective of [floor.entry, floor.terminal, floor.exit])
        if (worldBlocked(floor, objective.x, objective.y, 13) || !reachable.has(nearestCell(floor, objective)))
            errors.push('objective');
    for (let i = 0; i < total; i++) {
        const e = floor.spawns[i];
        if (worldBlocked(floor, e.x, e.y, 18) || Math.hypot(e.x - floor.entry.x, e.y - floor.entry.y) < 150 || Math.hypot(e.x - floor.terminal.x, e.y - floor.terminal.y) < 75 || !reachable.has(nearestCell(floor, e)))
            errors.push('spawn');
        if (floor.spawns.slice(0, i).some(other => Math.hypot(other.x - e.x, other.y - e.y) < 38))
            errors.push('overlap');
    }
    return errors;
}
export function fallbackFloor(seed: string, level: number): Floor {
    const budget = levelBudgets[level - 1], extra: Spawn[] = [{ kind: 'flood', x: 410, y: 440 }, { kind: 'flood', x: 800, y: 200 }, { kind: 'flood', x: 680, y: 465 }, { kind: 'flood', x: 370, y: 75 }];
    const available = [...authoredFloor.spawns, ...extra], spawns = [...available.filter(e => e.kind === 'flood').slice(0, budget.flood), ...available.filter(e => e.kind === 'probe').slice(0, budget.probe)].map(e => ({ ...e }));
    // Retain Stage 1 geometry and its two crossing routes, with one wide-gapped
    // divider to turn the middle bay into two physical rooms. The exact authored
    // arena remains exported separately for development benchmarking.
    const chambers = [authoredFloor.chambers[0], { id: 1, x: 314, y: 16, w: 276, h: 247 }, { id: 3, x: 314, y: 277, w: 276, h: 247 }, authoredFloor.chambers[2]];
    const walls = [...authoredFloor.walls, { x: 314, y: 263, w: 76, h: 14 }, { x: 510, y: 263, w: 80, h: 14 }];
    return { ...authoredFloor, walls, seed, level, generatorVersion, name: 'EDGE GATEWAY · FALLBACK', chambers, spawns, fallback: true };
}
export function generateFloor(seed: string, level: number, options: {
    forceFallback?: boolean;
    validate?: (floor: Floor) => string[];
} = {}): Floor {
    if (!Number.isInteger(level) || level < 1 || level > 5)
        throw new Error('Level must be 1–5');
    if (!options.forceFallback)
        for (let attempt = 0; attempt < 4; attempt++) {
            const floor = construct(seed, level, attempt);
            if ((options.validate || validateFloor)(floor).length === 0)
                return floor;
        }
    return fallbackFloor(seed, level);
}
export function roomAt(floor: Floor, p: Vec) { return floor.chambers.find(c => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h)?.id ?? -1; }
