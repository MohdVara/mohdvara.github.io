import Phaser from 'phaser';
import { createPortfolioGame } from '../PortfolioGame';
import { newCombat, step, weapons, distance, type Combat, type WeaponId } from './simulation';
import { createInput } from './input';
import { authoredFloor, type Floor } from './floor';
import { createDiagnostics } from './diagnostics';
export type Hud = {
    status: Combat['status'];
    integrity: number;
    weapon: WeaponId;
    score: number;
    threats: number;
    near: boolean;
    flood: number;
    probe: number;
    hits: number;
};
export type DefenceController = ReturnType<typeof createDefence>;
export function createDefence(host: HTMLElement, initialWeapon: WeaponId, onHud: (hud: Hud) => void, onPause: () => void, onReady: () => void, onFailure: () => void, initialFloor: Floor = authoredFloor, integrity = 3) {
    let state = newCombat(initialWeapon, initialFloor, integrity), lastHud = '', disposed = false;
    let scene: Gateway | undefined;
    const input = createInput(host, onPause, (id) => select(id));
    function emit() {
        diagnostics?.transition(state.status);
        const hud: Hud = { status: state.status, integrity: state.player.integrity, weapon: state.weapon, score: state.score, threats: state.enemies.filter(e => e.hp > 0).length, near: distance(state.player, state.floor.terminal) < 60, flood: state.flood, probe: state.probe, hits: state.hits };
        const encoded = JSON.stringify(hud);
        if (encoded !== lastHud) {
            lastHud = encoded;
            onHud(hud);
        }
    }
    function select(id: WeaponId | 'switch') { state.weapon = id === 'switch' ? (state.weapon === 'pulse' ? 'fan' : 'pulse') : id; emit(); }
    const diagnostics = import.meta.env.DEV ? createDiagnostics() : null;
    if (diagnostics)
        Object.assign(window, { incidentZeroDiagnostics: Object.assign(diagnostics.api, { inspect: () => ({ floor: structuredClone(state.floor), player: { ...state.player }, enemies: state.enemies.map(e => ({ x: e.x, y: e.y, hp: e.hp, kind: e.kind, warning: e.warning })), status: state.status, time: state.time }) }) });
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    class Gateway extends Phaser.Scene {
        ink!: Phaser.GameObjects.Graphics;
        terminalText!: Phaser.GameObjects.Text;
        floorInk!: Phaser.GameObjects.Graphics;
        labels: Phaser.GameObjects.Text[] = [];
        buildFloor() {
            this.floorInk?.destroy();
            for (const label of this.labels)
                label.destroy();
            this.labels = [];
            const floor = this.add.graphics().setDepth(-1);
            this.floorInk = floor;
            floor.fillStyle(0x161c19);
            floor.fillRect(0, 0, 900, 540);
            floor.lineStyle(1, 0x28332d, .6);
            for (let x = 30; x < 900; x += 30)
                floor.lineBetween(x, 16, x, 524);
            for (let y = 30; y < 540; y += 30)
                floor.lineBetween(16, y, 884, y);
            for (const w of state.floor.walls) {
                floor.fillStyle(0x303d34);
                floor.fillRect(w.x, w.y, w.w, w.h);
                floor.lineStyle(1, 0x687b65);
                floor.strokeRect(w.x + .5, w.y + .5, w.w - 1, w.h - 1);
            }
            for (const c of state.floor.chambers)
                this.labels.push(this.add.text(c.x + 12, c.y + 10, `ZONE ${c.id + 1}`, { fontFamily: "monospace", fontSize: 11, color: "#718375" }));
            this.labels.push(this.add.text(state.floor.entry.x - 34, state.floor.entry.y - 35, "ENTRY", { fontFamily: "monospace", fontSize: 11, color: "#aeb9a8" }));
            this.terminalText = this.add.text(730, 490, "TERMINAL / LOCKED", { fontFamily: "monospace", fontSize: 11, color: "#aeb9a8" });
            this.labels.push(this.terminalText);
        }
        create() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            scene = this;
            this.buildFloor();
            this.ink = this.add.graphics();
            this.draw();
            emit();
            onReady();
        }
        draw() {
            const g = this.ink;
            g.clear();
            const unlocked = state.enemies.every(e => e.hp === 0), t = state.floor.terminal;
            g.lineStyle(2, unlocked ? 0xa4d5ae : 0x6f8673);
            g.strokeCircle(t.x, t.y, 36);
            g.fillStyle(0x263a30);
            g.fillRoundedRect(t.x - 21, t.y - 21, 42, 42, 4);
            g.lineStyle(2, 0xa4d5ae);
            g.strokeRect(t.x - 14, t.y - 13, 28, 20);
            g.lineBetween(t.x - 8, t.y + 13, t.x + 8, t.y + 13);
            this.terminalText.setText(unlocked ? 'TERMINAL / RESTORE' : 'TERMINAL / LOCKED').setColor(unlocked ? '#b9e3b9' : '#aeb9a8');
            for (const e of state.enemies) {
                if (e.hp <= 0)
                    continue;
                const color = e.kind === 'flood' ? 0xe5ac72 : 0xd992a0;
                if (e.warning > 0) {
                    g.lineStyle(2, 0xf5cf91, .7);
                    g.lineBetween(e.x, e.y, e.aim.x, e.aim.y);
                    g.strokeCircle(e.x, e.y, 20 + 10 * (1 - e.warning / .85));
                    g.fillStyle(0xf5cf91);
                    g.fillCircle(e.aim.x, e.aim.y, 4);
                }
                g.fillStyle(color);
                g.lineStyle(2, 0x191c18);
                if (e.kind === 'flood') {
                    g.fillPoints([{ x: e.x, y: e.y - 15 }, { x: e.x + 14, y: e.y }, { x: e.x, y: e.y + 15 }, { x: e.x - 14, y: e.y }], true);
                    g.lineBetween(e.x - 5, e.y, e.x + 5, e.y);
                }
                else {
                    g.fillTriangle(e.x, e.y - 16, e.x - 15, e.y + 12, e.x + 15, e.y + 12);
                    g.fillStyle(0x191c18);
                    g.fillCircle(e.x, e.y + 3, 4);
                }
                g.fillStyle(0x4a4037);
                g.fillRect(e.x - 14, e.y - 24, 28, 3);
                g.fillStyle(color);
                g.fillRect(e.x - 14, e.y - 24, 28 * e.hp / (e.kind === 'flood' ? 4 : 5), 3);
            }
            for (const shot of state.shots) {
                g.lineStyle(shot.hostile ? 4 : 3, shot.hostile ? 0xf1aa96 : state.weapon === 'fan' ? 0xb8e6c1 : 0xf7d695);
                g.lineBetween(shot.x - shot.vx * .015, shot.y - shot.vy * .015, shot.x, shot.y);
            }
            const p = state.player;
            if (p.protection > 0) {
                g.lineStyle(3, 0x9ad6da);
                g.strokeCircle(p.x, p.y, 22);
                g.lineStyle(1, 0x9ad6da, .6);
                g.strokeCircle(p.x, p.y, 27);
            }
            g.fillStyle(0xb8ddc5);
            g.fillCircle(p.x, p.y, 12);
            g.lineStyle(2, 0x203e34);
            g.strokeCircle(p.x, p.y, 12);
            g.lineStyle(5, 0xf8d490);
            g.lineBetween(p.x + Math.cos(p.angle) * 10, p.y + Math.sin(p.angle) * 10, p.x + Math.cos(p.angle) * 23, p.y + Math.sin(p.angle) * 23);
            g.lineStyle(1, 0xd8e7cd, .5);
            g.lineBetween(p.x + Math.cos(p.angle) * 29, p.y + Math.sin(p.angle) * 29, p.x + Math.cos(p.angle) * 48, p.y + Math.sin(p.angle) * 48);
            for (const effect of state.effects) {
                g.fillStyle(effect.kind === 'dissolve' ? 0xd9b48c : 0xf8d490, effect.life / .22);
                if (effect.kind === 'dissolve' && !reduced.matches) {
                    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
                        const offset = 8 + (1 - effect.life / .22) * 13;
                        g.fillRect(effect.x + dx * offset - 2, effect.y + dy * offset - 2, 4, 4);
                    }
                }
                else
                    g.fillRect(effect.x - 3, effect.y - 3, 6, 6);
            }
        }
        update(_time: number, delta: number) {
            if (disposed)
                return;
            const begin = diagnostics?.api.enabled ? performance.now() : 0, searches = state.navigationSearches;
            step(state, input.value, delta / 1000);
            const simEnd = begin ? performance.now() : 0;
            input.value.interact = false;
            this.draw();
            emit();
            if (begin)
                diagnostics?.record({ simulation: simEnd - begin, navigationSearches: state.navigationSearches - searches, rendering: performance.now() - simEnd, enemies: state.enemies.filter(e => e.hp > 0).length, projectiles: state.shots.length, status: state.status }, begin);
            if (state.status !== 'playing') {
                input.clear();
                game.loop.sleep();
            }
        }
    }
    const game = createPortfolioGame({ type: Phaser.CANVAS, parent: host, width: 900, height: 540, backgroundColor: '#161c19', scene: Gateway, audio: { noAudio: true }, banner: false, render: { antialias: true }, fps: { target: 60 }, autoFocus: false, input: { keyboard: false, mouse: false, touch: false } }, () => { input.clear(); onPause(); }, () => state.status !== 'playing');
    const resize = new ResizeObserver(() => {
        const canvas = host.querySelector('canvas');
        if (canvas) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            canvas.setAttribute('aria-hidden', 'true');
        }
    });
    resize.observe(host);
    game.events.on('destroy', () => { scene = undefined; });
    game.events.on('boot', () => {
        if (!game.canvas)
            onFailure();
    });
    return { input, select, start() { input.clear(); state.status = 'playing'; emit(); game.loop.wake(); host.focus({ preventScroll: true }); }, pause() {
            if (state.status !== 'playing')
                return;
            state.status = 'paused';
            input.clear();
            emit();
            game.loop.sleep();
        }, resume() {
            if (state.status !== 'paused')
                return;
            input.clear();
            state.status = 'playing';
            emit();
            game.loop.wake();
            host.focus({ preventScroll: true });
        }, loadFloor(floor: Floor, weapon: WeaponId, integrity: number, status: Combat["status"] = "playing") {
            input.clear();
            state = newCombat(weapon, floor, integrity);
            state.status = status;
            scene?.buildFloor();
            scene?.draw();
            emit();
            if (status === "playing") {
                game.loop.wake();
                host.focus({ preventScroll: true });
            }
            else
                game.loop.sleep();
        }, restart() { input.clear(); state = newCombat(state.weapon, state.floor, integrity); state.status = 'playing'; scene?.draw(); emit(); game.loop.wake(); host.focus({ preventScroll: true }); }, destroy() {
            disposed = true;
            diagnostics?.destroy();
            if (import.meta.env.DEV)
                delete (window as Window & {
                    incidentZeroDiagnostics?: unknown;
                }).incidentZeroDiagnostics;
            input.destroy();
            resize.disconnect();
            game.destroy(true);
            if (game.isRunning)
                game.loop.wake();
            scene = undefined;
        }, weaponName() { return weapons[state.weapon].name; } };
}
