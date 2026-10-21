import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// Load the real TS modules, keeping one shared browser environment per fixture.
function modules(globals = {}) {
  const cache = new Map();
  function load(file) {
    const path = resolve(file.endsWith('.ts') ? file : `${file}.ts`);
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    cache.set(path, exports);
    const source = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(source, { ...globals, exports,
      require: name => name.endsWith("?raw")
        ? { default: readFileSync(resolve(dirname(path), name.slice(0, -4)), "utf8") }
        : load(resolve(dirname(path), name)),
    }, { filename: path });
    return exports;
  }
  return name => load(`src/AsciiForest/${name}.ts`);
}

const load = modules();
const { createScene, generateScene } = load('scene');
const { forestConfig, qualityFor, pageSceneSeeds } = load('config');
const { palettes } = load('palette');
const { createAnimation } = load('animation');
const { generateRiverScene } = load('river');
const plain = value => JSON.parse(JSON.stringify(value));

function riverScene(cols, rows, seed) {
  const steps = generateRiverScene(cols, rows, seed);
  let next;
  do { next = steps.next(); } while (!next.done);
  return next.value;
}

test('aerial river generation is seeded and retains its geometry identity across resolutions', () => {
  const first = riverScene(128, 80), repeated = riverScene(128, 80);
  const mobile = riverScene(84, 60);
  assert.equal(first.signature, mobile.signature);
  assert.equal(first.signature, repeated.signature);
  assert.notEqual(first.signature, riverScene(128, 80, forestConfig.seed + 1).signature);
  for (let layer = 0; layer < 4; layer++) {
    assert.deepEqual(Array.from(first.grids[layer].glyph), Array.from(repeated.grids[layer].glyph));
    assert.ok(first.grids[layer].glyph.some(Boolean), `layer ${layer} is populated`);
    assert.ok(first.grids[layer].color.every(color => color < 4));
  }
  assert.equal(first.crowns.length, 0);
});

test('aerial river has an uninterrupted top-to-bottom water channel with forest outside its banks', () => {
  for (const seed of [forestConfig.seed, ...Object.values(pageSceneSeeds)]) for (const [cols, rows] of [[84, 60], [128, 80], [176, 100]]) {
    const scene = riverScene(cols, rows, seed);
    const water = scene.grids[2].glyph;
    const visited = new Set(), pending = [];
    for (let col = 0; col < cols; col++) if (water[col]) { pending.push(col); visited.add(col); }
    let reachesBottom = false;
    while (pending.length) {
      const index = pending.pop(), x = index % cols, y = Math.floor(index / cols);
      if (y === rows - 1) reachesBottom = true;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy, next = ny * cols + nx;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || !water[next] || visited.has(next)) continue;
        visited.add(next); pending.push(next);
      }
    }
    assert.ok(reachesBottom, 'main water channel is four-neighbor connected');
    for (let row = 0; row < rows; row++) {
      const channel = [...water.slice(row * cols, (row + 1) * cols)].filter(Boolean);
      assert.ok(channel.length >= 2, 'channel remains legible at each row');
    }
    assert.ok(scene.grids[3].glyph.some(Boolean));
    assert.ok(scene.grids[2].motion.some(Boolean), 'selected current bands can shimmer coherently');
    const tributaries = new Set([...scene.grids[2].motion].filter(group => group >= 64));
    assert.deepEqual([...tributaries].sort(), [64, 65, 66, 67], 'four tributaries retain separate reveal groups');
    for (let i = 0; i < water.length; i++) {
      if (scene.grids[2].motion[i]) assert.ok(water[i], 'motion only belongs to water');
      if (water[i]) {
        assert.ok(water[i] === 15 || water[i] === 16 || water[i] === 17);
        assert.equal(scene.grids[3].glyph[i], 0, 'forest never paints over water');
      }
    }
  }
});

test('every tagged tributary water cell physically connects to the main river', () => {
  for (const seed of [forestConfig.seed, ...Object.values(pageSceneSeeds)]) for (const [cols, rows] of [[84, 60], [128, 80], [176, 100]]) {
    const { grids } = riverScene(cols, rows, seed);
    const water = grids[2].glyph, groups = grids[2].motion;
    // Main-channel water is untagged or in low-numbered shimmer groups.
    // Flood across all eight neighbors because rasterized diagonal streams are
    // physically continuous even where neighboring rows touch at a corner.
    const connected = new Set(), pending = [];
    for (let i = 0; i < water.length; i++) {
      if (water[i] && groups[i] < 64) { connected.add(i); pending.push(i); }
    }
    while (pending.length) {
      const i = pending.pop(), x = i % cols, y = Math.floor(i / cols);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy, next = yy * cols + xx;
        if (xx < 0 || xx >= cols || yy < 0 || yy >= rows || !water[next] || connected.has(next)) continue;
        connected.add(next); pending.push(next);
      }
    }
    for (const branch of [64, 65, 66, 67]) {
      const cells = [...groups.keys()].filter(i => groups[i] === branch);
      assert.ok(cells.length > 0, `tributary ${branch} exists at ${cols} columns`);
      for (const i of cells) assert.ok(connected.has(i), `tributary ${branch} has detached water at ${i % cols},${Math.floor(i / cols)} (${cols} columns)`);
    }
  }
});

test('final artwork removes X marks and gathers winding streams into a calm outlet', () => {
  assert.doesNotMatch(forestConfig.glyphs, /[xX]/);
  for (const scene of [createScene(128, 80), riverScene(128, 80)]) {
    const used = new Set(scene.grids.flatMap(grid => [...grid.glyph].map(index => forestConfig.glyphs[index])));
    assert.ok([...used].every(glyph => glyph !== undefined));
    assert.ok(!used.has('x') && !used.has('X'));
    assert.ok(used.has('o') && used.has('*'), 'organic foliage retains mixed rounded and star marks');
  }
  const { grids } = riverScene(128, 80);
  const water = grids[2].glyph;
  const centerOf = row => {
    const positions = [];
    for (let col = 0; col < 128; col++) if (water[row * 128 + col]) positions.push(col / 127);
    return positions.reduce((sum, x) => sum + x, 0) / positions.length;
  };
  const outlet = Array.from({ length: 14 }, (_, row) => centerOf(row));
  const winding = Array.from({ length: 32 }, (_, row) => centerOf(row + 32));
  assert.ok(Math.max(...outlet) - Math.min(...outlet) < 0.06, 'resolved outlet has a calm coherent course');
  assert.ok(Math.max(...winding) - Math.min(...winding) > 0.10, 'upstream landscape keeps pronounced meanders');
  const cues = [...water.keys()].filter(i => water[i] === 17);
  assert.ok(cues.length > 0, 'a sparse ASCII current cue marks the clear downstream direction');
  assert.ok(cues.every(i => Math.floor(i / 128) < 80 * 0.3), 'direction cues belong only to the resolved outlet');
  assert.ok(grids[2].motion.some(group => group >= 64), 'reflected distribution channels retain reveal tags');
});

test('tributary catchments stay separate until they reach the main channel', () => {
  const cols = 176, rows = 100;
  for (const seed of [forestConfig.seed, ...Object.values(pageSceneSeeds)]) {
    const groups = riverScene(cols, rows, seed).grids[2].motion;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] < 64) continue;
      const x = i % cols, y = Math.floor(i / cols);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || xx >= cols || yy < 0 || yy >= rows) continue;
        const next = groups[yy * cols + xx];
        assert.ok(next < 64 || next === groups[i], `different tributaries cross or touch outside the main channel at ${x},${y}`);
      }
    }
  }
});

test('seeded forest reproduces all glyphs and keeps its canonical trees across resolutions', () => {
  const desktop = createScene(176, 80), again = createScene(176, 80);
  const mobile = createScene(84, 45), tablet = createScene(128, 60);
  assert.equal(desktop.signature, again.signature);
  for (let i = 0; i < 4; i++) {
    for (const channel of ['glyph', 'color', 'depth', 'motion']) {
      assert.deepEqual(Array.from(desktop.grids[i][channel]), Array.from(again.grids[i][channel]));
    }
  }
  for (const resized of [mobile, tablet]) {
    assert.equal(resized.signature, desktop.signature);
    assert.deepEqual(plain(resized.crowns), plain(desktop.crowns));
  }
  const different = createScene(176, 80, forestConfig.seed + 1);
  assert.notEqual(different.signature, desktop.signature);
  assert.notDeepEqual(Array.from(different.grids[2].glyph), Array.from(desktop.grids[2].glyph));
});

test('incremental generation yields bounded work stages and matches the synchronous scene', () => {
  const steps = generateScene(128, 60);
  let yielded = 0, result;
  do { result = steps.next(); if (!result.done) yielded++; } while (!result.done && yielded < 60);
  assert.ok(result.done, 'finite generation completes');
  assert.ok(yielded >= 8, 'terrain and crown work is split into multiple stages');
  const sync = createScene(128, 60);
  assert.equal(result.value.signature, sync.signature);
  for (let i = 0; i < 4; i++) {
    assert.deepEqual(Array.from(result.value.grids[i].glyph), Array.from(sync.grids[i].glyph));
  }
});

test('four populated layers have valid glyph, ink, depth and motion data at every quality', () => {
  for (const [cols, rows] of [[84, 45], [128, 60], [176, 80], [200, 150], [40, 30]]) {
    const scene = createScene(cols, rows);
    assert.equal(scene.grids.length, 4);
    assert.ok(scene.crowns.length > 0);
    scene.grids.forEach((grid, layer) => {
      assert.equal(grid.cols, cols); assert.equal(grid.rows, rows);
      assert.equal(grid.glyph.length, cols * rows);
      assert.ok(grid.glyph.some(glyph => glyph !== 0));
      for (let i = 0; i < grid.glyph.length; i++) {
        assert.ok(grid.glyph[i] < forestConfig.glyphs.length);
        assert.ok(grid.color[i] < palettes.light[layer].length);
        assert.ok(grid.color[i] < palettes.dark[layer].length);
        assert.equal(grid.depth[i], layer);
        if (grid.motion[i]) assert.ok(grid.glyph[i] > 0);
      }
    });
  }
  assert.equal(qualityFor(390), 'mobile');
  assert.equal(qualityFor(900), 'tablet');
  assert.equal(qualityFor(1440), 'desktop');
});

function clockFixture() {
  let id = 0;
  const queue = new Map();
  return {
    queue,
    request: callback => { queue.set(++id, callback); return id; },
    cancel: frame => queue.delete(frame),
    step(time) {
      const callbacks = [...queue.values()]; queue.clear();
      callbacks.forEach(callback => callback(time));
    },
  };
}

test('animation owns one frame, freezes while paused, clamps gaps and cannot restart after disposal', () => {
  const clock = clockFixture(), painted = [];
  const animation = createAnimation(clock, time => painted.push(time), 25);
  assert.equal(clock.queue.size, 0);
  animation.setActive(true); animation.setActive(true);
  assert.equal(clock.queue.size, 1);
  clock.step(1000); clock.step(1040);
  assert.equal(painted.length, 2);
  assert.equal(animation.time, 0.04);
  animation.setActive(false);
  assert.equal(clock.queue.size, 0);
  const frozen = animation.time;
  clock.step(100000);
  assert.equal(animation.time, frozen);
  animation.setActive(true); clock.step(200000);
  assert.equal(animation.time, frozen, 'resuming does not include suspended wall time');
  clock.step(300000);
  assert.ok(animation.time - frozen <= 0.080001, 'an active long frame is bounded');
  animation.dispose(); animation.dispose(); animation.setActive(true);
  assert.equal(clock.queue.size, 0);
  const count = painted.length;
  clock.step(400000);
  assert.equal(painted.length, count);
});

test('animation accepts timestamp zero without dropping the next frame elapsed time', () => {
  const clock = clockFixture(), painted = [];
  const animation = createAnimation(clock, time => painted.push(time), 25);
  animation.setActive(true);
  clock.step(0); clock.step(40);
  assert.equal(animation.time, 0.04);
  assert.deepEqual(painted, [0.04]);
  animation.dispose();
  assert.equal(clock.queue.size, 0);
});

test('a 25 FPS target keeps its cadence on a simulated 60 Hz display', () => {
  const clock = clockFixture(), painted = [];
  const animation = createAnimation(clock, time => painted.push(time), 25);
  animation.setActive(true);
  for (let frame = 0; frame <= 60; frame++) clock.step(frame * 1000 / 60);
  assert.ok(painted.length >= 24 && painted.length <= 26,
    `expected approximately 25 paints in one second, got ${painted.length}`);
  assert.ok(painted.every((time, i) => i === 0 || time > painted[i - 1]));
  assert.equal(clock.queue.size, 1);
  animation.setActive(false);
  assert.equal(clock.queue.size, 0);
  animation.dispose();
});

test('disposing or pausing inside draw never queues a replacement frame', () => {
  for (const action of ['dispose', 'pause']) {
    const clock = clockFixture();
    let paints = 0, animation;
    animation = createAnimation(clock, () => {
      paints++;
      if (action === 'dispose') animation.dispose();
      else animation.setActive(false);
    });
    animation.setActive(true);
    clock.step(100);
    assert.equal(paints, 1);
    assert.equal(clock.queue.size, 0, `${action} from draw cancels future work`);
    clock.step(200);
    assert.equal(paints, 1);
    animation.dispose();
  }
});

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    emit(type, event = {}) { listeners.get(type)?.forEach(callback => callback(event)); },
  };
}

function browserFixture({ width = 1440, height = 900, dpr = 2, unavailable = false } = {}) {
  const clock = clockFixture(), canvases = [], resize = [], visibility = [];
  const bounds = { width, height, left: 0, top: 0 };
  const hero = { ...eventTarget(), getBoundingClientRect: () => bounds };
  const styleProperties = new Map();
  const host = { dataset: {}, parentElement: hero, children: [],
    style: { setProperty: (name, value) => styleProperties.set(name, value) },
    getBoundingClientRect: () => bounds,
    appendChild(canvas) { this.children.push(canvas); canvas.parent = this; },
  };
  let paints = 0, glyphs = 0;
  const document = { ...eventTarget(), hidden: false,
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const context = {
        font: '', inks: new Set(),
        setTransform() {}, clearRect() { paints++; }, drawImage() {}, fillRect() {},
        fillText() { glyphs++; this.inks.add(this.fillStyle); },
        measureText() { return { width: parseFloat(this.font) * 0.602 }; },
        createRadialGradient() { return { addColorStop() {} }; },
      };
      const canvas = { width: 0, height: 0, context,
        setAttribute() {}, getContext: () => unavailable ? null : context,
        remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); },
      };
      canvases.push(canvas); return canvas;
    },
  };
  class Observer {
    targets = new Set(); disconnected = false;
    observe(target) { this.targets.add(target); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
  }
  class ResizeObserver extends Observer {
    constructor(callback) { super(); this.callback = callback; resize.push(this); }
    emit() { this.callback([]); }
  }
  class IntersectionObserver extends Observer {
    constructor(callback) { super(); this.callback = callback; visibility.push(this); }
    emit(isIntersecting) { this.callback([{ isIntersecting, target: hero }]); }
  }
  const { mountForest } = modules({ document, devicePixelRatio: dpr,
    ResizeObserver, IntersectionObserver,
    matchMedia: () => ({ matches: true }),
    requestAnimationFrame: clock.request, cancelAnimationFrame: clock.cancel,
    performance: { now: () => 1 },
  })('renderer');
  return { mountForest, host, hero, document, clock, canvases, resize, visibility, bounds, styleProperties,
    completeBuild() {
      for (let frame = 0; frame < 60; frame++) {
        if (host.dataset.ready === 'true' && !clock.queue.size) return;
        clock.step(100 + frame * 40);
        if (host.dataset.ready === 'true' && host.dataset.running === 'true') return;
      }
      assert.fail('construction did not settle within 60 browser frames');
    },
    get paints() { return paints; }, get glyphs() { return glyphs; },
  };
}

test('paused/reduced-motion state paints a static scene with no animation frames', () => {
  const f = browserFixture();
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: false });
  assert.equal(f.clock.queue.size, 1, 'optional cache construction starts as a finite task');
  assert.notEqual(f.host.dataset.ready, 'true');
  f.completeBuild();
  assert.equal(f.host.dataset.ready, 'true');
  assert.ok(f.glyphs > 0);
  f.visibility[0].emit(true);
  assert.equal(f.host.dataset.running, 'false');
  assert.equal(f.clock.queue.size, 0);
  const paints = f.paints;
  f.hero.emit('pointermove', { pointerType: 'mouse', clientX: 10, clientY: 20 });
  f.clock.step(10000);
  assert.equal(f.paints, paints);
  handle.dispose();
});

test('renderer pauses offscreen/hidden, resumes, and fully releases observers, listeners and buffers', () => {
  const f = browserFixture();
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: true });
  f.completeBuild();
  assert.equal(f.host.children.length, 1);
  assert.equal(f.clock.queue.size, 0, 'not animating before visibility is established');
  f.visibility[0].emit(true);
  assert.equal(f.clock.queue.size, 1);
  f.clock.step(1000); f.clock.step(1040);
  f.visibility[0].emit(false);
  assert.equal(f.host.dataset.running, 'false');
  assert.equal(f.clock.queue.size, 0);
  f.visibility[0].emit(true);
  assert.equal(f.clock.queue.size, 1);
  f.document.hidden = true; f.document.emit('visibilitychange');
  assert.equal(f.clock.queue.size, 0);
  f.document.hidden = false; f.document.emit('visibilitychange');
  assert.equal(f.clock.queue.size, 1);
  handle.update({ theme: 'dark', enabled: false });
  assert.equal(f.clock.queue.size, 0);
  handle.update({ theme: 'dark', enabled: true });
  assert.equal(f.clock.queue.size, 1);
  f.resize[0].emit(); // Disposal must also cancel a pending resize rebuild.
  assert.equal(f.clock.queue.size, 2);
  handle.dispose(); handle.dispose();
  assert.equal(f.clock.queue.size, 0);
  assert.equal(f.host.children.length, 0);
  assert.equal(f.host.dataset.running, 'false');
  for (const canvas of f.canvases) { assert.equal(canvas.width, 0); assert.equal(canvas.height, 0); }
  for (const observer of [...f.resize, ...f.visibility]) assert.equal(observer.disconnected, true);
  for (const target of [f.document, f.hero]) {
    for (const callbacks of target.listeners.values()) assert.equal(callbacks.size, 0);
  }
  const paints = f.paints;
  handle.update({ theme: 'light', enabled: true }); f.clock.step(20000);
  assert.equal(f.paints, paints);
});

test('theme changes recolor without changing the forest; resize preserves composition and bounds backing pixels', () => {
  const f = browserFixture({ width: 3840, height: 1600, dpr: 3 });
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: false });
  f.completeBuild();
  const signature = f.host.dataset.signature;
  assert.ok(f.canvases[0].width <= 1920);
  assert.ok(f.canvases[0].height <= forestConfig.maxHeight);
  const oldCaches = f.canvases.slice(1);
  handle.update({ theme: 'light', enabled: false });
  f.completeBuild();
  assert.equal(f.host.dataset.signature, signature);
  assert.ok(oldCaches.every(canvas => canvas.width === 0 && canvas.height === 0));
  const newInks = new Set(f.canvases.slice(-4).flatMap(canvas => [...canvas.context.inks]));
  assert.ok([...newInks].every(ink => palettes.light.flat().includes(ink)));
  assert.ok(newInks.size > 4);
  f.bounds.width = 390; f.bounds.height = 800;
  f.resize[0].emit(); f.clock.step(1000);
  f.completeBuild();
  assert.equal(f.host.dataset.quality, 'mobile');
  assert.equal(f.host.dataset.signature, signature);
  assert.equal(f.clock.queue.size, 0, 'resize does not start paused animation');
  handle.dispose();
});

test('staged initialization can be replaced or disposed without stray work or mixed themes', () => {
  const f = browserFixture();
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: true });
  f.visibility[0].emit(true);
  f.clock.step(100); // Only the first generation slice has run; no animation is allowed yet.
  assert.equal(f.host.dataset.running, 'false');
  assert.equal(f.paints, 0);
  handle.update({ theme: 'light', enabled: false });
  f.completeBuild();
  assert.equal(f.host.dataset.ready, 'true');
  assert.equal(f.clock.queue.size, 0);
  const inks = f.canvases.slice(-4).flatMap(canvas => [...canvas.context.inks]);
  assert.ok(inks.every(ink => palettes.light.flat().includes(ink)));
  assert.equal(f.styleProperties.get('--forest-left'), String(forestConfig.mask.left));
  assert.equal(f.styleProperties.get('--forest-right'), String(forestConfig.mask.right));
  assert.equal(f.styleProperties.get('--forest-bottom-start'), `${forestConfig.mask.bottomStart * 100}%`);
  assert.equal(f.host.style.opacity, String(forestConfig.opacity));
  handle.update({ theme: 'dark', enabled: true });
  f.clock.step(500);
  handle.dispose();
  assert.equal(f.clock.queue.size, 0);
  assert.ok(f.canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
});

test('disposal during incremental generation cancels unfinished scene work', () => {
  const f = browserFixture();
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: true });
  f.clock.step(100); // Generation has yielded before caches can be allocated.
  assert.notEqual(f.host.dataset.ready, 'true');
  assert.equal(f.canvases.length, 1);
  assert.equal(f.clock.queue.size, 1);
  handle.dispose();
  assert.equal(f.clock.queue.size, 0);
  f.clock.step(1000);
  assert.equal(f.canvases.length, 1);
  assert.equal(f.host.children.length, 0);
  assert.equal(f.canvases[0].width, 0);
});

test('missing Canvas context leaves fallback intact without observers or frames', () => {
  const f = browserFixture({ unavailable: true });
  const handle = f.mountForest(f.host, { theme: 'dark', enabled: true });
  assert.equal(f.host.children.length, 0);
  assert.equal(f.clock.queue.size, 0);
  assert.equal(f.visibility.length, 0); assert.equal(f.resize.length, 0);
  handle.update({ theme: 'light', enabled: true }); handle.dispose();
});

test('editorial pages have distinct stable forest and river compositions', () => {
  const seeds = [forestConfig.seed, ...Object.values(pageSceneSeeds)];
  const forestSignatures = new Set(), riverGeometry = new Set();
  for (const seed of seeds) {
    const forest = createScene(128, 80, seed), river = riverScene(128, 80, seed);
    forestSignatures.add(forest.signature);
    riverGeometry.add([...river.grids[2].glyph].map(g => g ? '1' : '0').join(''));
    assert.equal(forest.signature, createScene(84, 60, seed).signature);
    assert.equal(river.signature, riverScene(84, 60, seed).signature);
  }
  assert.equal(forestSignatures.size, seeds.length);
  assert.equal(riverGeometry.size, seeds.length, 'water shapes differ, not just canopy textures');
});

test('forest texture spells real local source lines while preserving water and tree structure', () => {
  const { forestCodeLines, sourceTextureGlyph } = load('sourceTexture');
  assert.ok(forestCodeLines.length > 20);
  const sources = ['scene', 'animation', 'config'].map(name => readFileSync(`src/AsciiForest/${name}.ts`, 'utf8'));
  for (const line of forestCodeLines) assert.ok(sources.some(source => source.includes(line)), 'each line is actual portfolio code');
  for (const seed of [forestConfig.seed, ...Object.values(pageSceneSeeds)]) {
    for (const row of [1, 13, 40]) {
      const line = forestCodeLines[(row + 22 + (seed >>> 0)) % forestCodeLines.length];
      const rendered = [...line].map((_, col) => sourceTextureGlyph('#', col, row, 2, seed, false)).join('');
      assert.equal(rendered, line, 'characters retain their source order');
    }
    for (const glyph of ['.', ':', '+', '*', 'o']) {
      assert.equal(sourceTextureGlyph(glyph, 10, 13, 3, seed, false), glyph, 'forest highlights retain their silhouette ink');
    }
    for (const row of [0, 2, 3]) assert.equal(sourceTextureGlyph('#', 10, row, 3, seed, false), '#', 'most canopy rows retain foliage shading');
    assert.equal(sourceTextureGlyph('#', 10, 13, 1, seed, false), '#', 'distant ridges remain tonal');
    for (const layer of [0, 1, 2, 3]) for (const row of [0, 13, 39]) for (const col of [0, 11, 45]) {
      const line = forestCodeLines[(row + layer * 11 + (seed >>> 0)) % forestCodeLines.length];
      const expected = layer === 0 || layer === 3 ? line[col % line.length] : '#';
      assert.equal(sourceTextureGlyph('#', col, row, layer, seed, true), expected, 'aerial texture is unchanged');
    }
    for (const glyph of ['~', '=', '^']) assert.equal(sourceTextureGlyph(glyph, 10, 20, 2, seed, true), glyph);
    for (const glyph of ['/', String.fromCharCode(92), '|', '!']) assert.equal(sourceTextureGlyph(glyph, 10, 20, 3, seed, false), glyph);
    assert.equal(sourceTextureGlyph(' ', 0, 0, 3, seed, false), ' ', 'negative space is preserved');
  }
});

test('homepage code canopy increases real code coverage while keeping silhouettes and the other modes', () => {
  const { forestCodeFragments, sourceTextureGlyph } = load('sourceTexture');
  const sources = ['scene', 'animation', 'config'].map(name => readFileSync(`src/AsciiForest/${name}.ts`, 'utf8'));
  assert.ok(forestCodeFragments.length > 20);
  for (const fragment of forestCodeFragments) assert.ok(sources.some(source => source.includes(fragment)));
  const scene = createScene(176, 100);
  let occupied = 0, priorCode = 0, newCode = 0;
  for (const [layer, grid] of scene.grids.entries()) for (let i = 0; i < grid.glyph.length; i++) {
    const original = forestConfig.glyphs[grid.glyph[i]];
    if (!grid.glyph[i]) continue;
    const col = i % grid.cols, row = Math.floor(i / grid.cols), color = grid.color[i];
    const previous = sourceTextureGlyph(original, col, row, layer, forestConfig.seed, false);
    const next = sourceTextureGlyph(original, col, row, layer, forestConfig.seed, false, true, color);
    if (layer === 0 || color === 3 || '/\\|!'.includes(original)) assert.equal(next, original, 'ridge, crown rim and structural ink survive');
    if (layer > 0 && !'/\\|!'.includes(original)) {
      occupied++;
      if (/[a-zA-Z]/.test(previous)) priorCode++;
      if (/[a-zA-Z]/.test(next)) newCode++;
    }
    for (const aerialLayer of [0, 1, 2, 3]) {
      assert.equal(sourceTextureGlyph(original, col, row, aerialLayer, forestConfig.seed, true, true, color), sourceTextureGlyph(original, col, row, aerialLayer, forestConfig.seed, true), 'aerial ink is unchanged even with the experiment flag');
    }
  }
  assert.ok(newCode > priorCode * 3, 'homepage has materially more code than the selective texture');
  assert.ok(newCode / occupied > 0.45, 'letters form a substantial portion of the canopy');
});
