import { authoredFloor, worldBlocked, worldLineOfSight, type Floor } from './floor';
import { searchPath, cellOf, navigationGraph } from './navigation';
// Pure combat model: seconds and world pixels, independent of React and Phaser.
export type Vec = {
    x: number;
    y: number;
};
export type WeaponId = 'pulse' | 'fan';
export const weapons = {
    pulse: { name: 'Packet Pulse', cooldown: .24, speed: 580, range: 500, angles: [0], damage: 1 },
    fan: { name: 'Firewall Fan', cooldown: .7, speed: 450, range: 190, angles: [-.32, -.16, 0, .16, .32], damage: 2 },
};
export const enemyConfig = { flood: { hp: 4, speed: 72, points: 100 }, probe: { hp: 5, speed: 42, points: 150 } };
export const arena = authoredFloor;
export type Enemy = Vec & {
    id: number;
    kind: keyof typeof enemyConfig;
    hp: number;
    active: boolean;
    cooldown: number;
    warning: number;
    aim: Vec;
    path: Vec[];
    repath: number;
    pathIndex: number;
    goalCell: number;
};
export type Shot = Vec & {
    vx: number;
    vy: number;
    remaining: number;
    hostile: boolean;
    damage: number;
};
export type Effect = Vec & {
    life: number;
    kind: 'impact' | 'dissolve' | 'fire';
};
export type Status = 'ready' | 'playing' | 'paused' | 'victory' | 'defeat';
export type Combat = {
    status: Status;
    time: number;
    player: Vec & {
        integrity: number;
        protection: number;
        angle: number;
    };
    weapon: WeaponId;
    cooldown: number;
    enemies: Enemy[];
    shots: Shot[];
    effects: Effect[];
    score: number;
    flood: number;
    probe: number;
    hits: number;
    completed: boolean;
    floor: Floor;
    navigationBudget: number;
    navigationSearches: number;
};
export type Input = {
    x: number;
    y: number;
    aim: Vec | null;
    fire: boolean;
    assisted: boolean;
    interact: boolean;
};
export const emptyInput = (): Input => ({ x: 0, y: 0, aim: null, fire: false, assisted: false, interact: false });
export function newCombat(weapon: WeaponId = 'pulse', floor: Floor = authoredFloor, integrity = 3): Combat {
    navigationGraph(floor);
    return { status: 'ready', time: 0, player: { ...floor.entry, integrity, protection: 0, angle: 0 }, weapon, cooldown: 0, enemies: floor.spawns.map((spawn, id) => ({ ...spawn, id, hp: enemyConfig[spawn.kind].hp, active: false, cooldown: 2, warning: 0, aim: { x: 0, y: 0 }, path: [], pathIndex: 0, goalCell: -1, repath: id * .06 })), shots: [], effects: [], score: 0, flood: 0, probe: 0, hits: 0, completed: false, floor, navigationBudget: 1, navigationSearches: 0 };
}
export const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export function blocked(p: Vec, radius = 0, floor: Floor = authoredFloor) { return worldBlocked(floor, p.x, p.y, radius); }
export function lineOfSight(a: Vec, b: Vec, radius = 0, floor: Floor = authoredFloor) { return worldLineOfSight(floor, a, b, radius); }
function move(floor: Floor, p: Vec, x: number, y: number, r: number) { if (!worldBlocked(floor, p.x + x, p.y, r))
    p.x += x; if (!worldBlocked(floor, p.x, p.y + y, r))
    p.y += y; }
export function findPath(from: Vec, to: Vec, floor: Floor = authoredFloor): Vec[] { return searchPath(floor, from, to); }
export function hurtPlayer(s: Combat) {
    if (s.status !== 'playing' || s.player.protection > 0)
        return false;
    s.player.integrity--;
    s.hits++;
    s.player.protection = .75;
    if (s.player.integrity <= 0) {
        s.status = 'defeat';
        s.shots = [];
    }
    return true;
}
export function hitEnemy(s: Combat, e: Enemy, damage: number) {
    if (s.status !== 'playing' || e.hp <= 0)
        return;
    e.hp = Math.max(0, e.hp - damage);
    e.active = true;
    s.effects.push({ x: e.x, y: e.y, life: .22, kind: e.hp ? 'impact' : 'dissolve' });
    if (!e.hp) {
        s.score += enemyConfig[e.kind].points;
        s[e.kind]++;
    }
}
export function restore(s: Combat) {
    if (s.status !== 'playing' || s.completed || s.enemies.some(e => e.hp > 0) || distance(s.player, s.floor.terminal) > 60)
        return false;
    s.completed = true;
    s.score += 500 + (s.hits === 0 ? 250 : 0);
    s.status = 'victory';
    s.shots = [];
    return true;
}
export function fire(s: Combat) {
    if (s.status !== 'playing' || s.cooldown > 0)
        return false;
    const w = weapons[s.weapon];
    s.cooldown = w.cooldown;
    for (const offset of w.angles) {
        const angle = s.player.angle + offset;
        s.shots.push({ x: s.player.x, y: s.player.y, vx: Math.cos(angle) * w.speed, vy: Math.sin(angle) * w.speed, remaining: w.range, hostile: false, damage: w.damage });
    }
    s.effects.push({ x: s.player.x + Math.cos(s.player.angle) * 20, y: s.player.y + Math.sin(s.player.angle) * 20, life: .1, kind: 'fire' });
    return true;
}
export function step(s: Combat, input: Input, delta: number) {
    if (s.status !== 'playing')
        return;
    // Bounded substeps prevent tunnelling and make movement independent of display rate.
    s.navigationBudget = 1;
    let remaining = Math.min(Math.max(delta, 0), .1);
    while (remaining > 0 && s.status === 'playing') {
        const dt = Math.min(remaining, 1 / 120);
        tick(s, input, dt);
        remaining -= dt;
    }
}
function tick(s: Combat, input: Input, dt: number) {
    s.time += dt;
    s.cooldown = Math.max(0, s.cooldown - dt);
    s.player.protection = Math.max(0, s.player.protection - dt);
    const length = Math.hypot(input.x, input.y) || 1;
    move(s.floor, s.player, input.x / length * 185 * dt, input.y / length * 185 * dt, 12);
    let aim = input.aim;
    if (input.assisted) {
        let nearest: Enemy | null = null, minimum = Infinity;
        const range = weapons[s.weapon].range;
        for (const enemy of s.enemies) {
            const d = distance(s.player, enemy);
            if (enemy.hp > 0 && d < range && d < minimum && lineOfSight(s.player, enemy, 3, s.floor)) {
                nearest = enemy;
                minimum = d;
            }
        }
        aim = nearest;
    }
    if (aim)
        s.player.angle = Math.atan2(aim.y - s.player.y, aim.x - s.player.x);
    if (input.fire)
        fire(s);
    if (input.interact)
        restore(s);
    if (s.status !== 'playing')
        return;
    for (const e of s.enemies) {
        if (e.hp <= 0)
            continue;
        const d = distance(e, s.player), los = lineOfSight(e, s.player, 3, s.floor);
        if (((s.floor.generatorVersion === 0 || s.time >= 2) && d < 320) || e.hp < enemyConfig[e.kind].hp)
            e.active = true;
        if (!e.active)
            continue;
        e.cooldown = Math.max(0, e.cooldown - dt);
        e.repath -= dt;
        if (e.kind === 'probe' && e.warning > 0) {
            e.warning -= dt;
            if (e.warning <= 0) {
                if (lineOfSight(e, e.aim, 3, s.floor)) {
                    const a = Math.atan2(e.aim.y - e.y, e.aim.x - e.x);
                    s.shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, remaining: 600, hostile: true, damage: 1 });
                }
                e.cooldown = 2.3;
            }
        }
        else if (e.kind === 'probe' && los && d < 370 && e.cooldown === 0) {
            e.warning = .85;
            e.aim = { x: s.player.x, y: s.player.y };
        }
        else {
            let target: Vec | undefined;
            if (e.kind === 'probe' && los && d < 155)
                target = { x: e.x + (e.x - s.player.x), y: e.y + (e.y - s.player.y) };
            else if (e.kind === 'flood' || !los || d > 285) {
                if (lineOfSight(e, s.player, 13, s.floor))
                    target = s.player;
                else {
                    const goal = cellOf(s.floor, s.player);
                    if (e.repath <= 0 && s.navigationBudget > 0 && (e.goalCell !== goal || e.pathIndex >= e.path.length)) {
                        e.path = findPath(e, s.player, s.floor);
                        e.pathIndex = 0;
                        e.goalCell = goal;
                        e.repath = .35 + e.id * .015;
                        s.navigationBudget--;
                        s.navigationSearches++;
                    }
                    while (e.pathIndex < e.path.length && distance(e, e.path[e.pathIndex]) < 8)
                        e.pathIndex++;
                    target = e.path[e.pathIndex];
                }
            }
            if (target) {
                const a = Math.atan2(target.y - e.y, target.x - e.x), speed = enemyConfig[e.kind].speed;
                move(s.floor, e, Math.cos(a) * speed * dt, Math.sin(a) * speed * dt, 13);
            }
        }
        if (e.kind === 'flood' && distance(e, s.player) < 26)
            hurtPlayer(s);
    }
    if (s.status !== 'playing')
        return;
    s.shots = s.shots.filter(shot => {
        const next = { x: shot.x + shot.vx * dt, y: shot.y + shot.vy * dt };
        if (!lineOfSight(shot, next, 3, s.floor)) {
            s.effects.push({ ...next, life: .15, kind: 'impact' });
            return false;
        }
        shot.x = next.x;
        shot.y = next.y;
        shot.remaining -= Math.hypot(shot.vx, shot.vy) * dt;
        if (shot.remaining <= 0)
            return false;
        if (shot.hostile) {
            if (distance(shot, s.player) < 15) {
                hurtPlayer(s);
                return false;
            }
        }
        else {
            const target = s.enemies.find(e => e.hp > 0 && distance(e, shot) < 17);
            if (target) {
                hitEnemy(s, target, shot.damage);
                return false;
            }
        }
        return true;
    });
    // A fatal hit during projectile iteration must also clear the retained projectiles.
    if ((s.status as Status) === 'defeat')
        s.shots = [];
    s.effects = s.effects.filter(e => (e.life -= dt) > 0);
}
