import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';

const source = ts.transpileModule(await readFile('src/AsciiForest/preference.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function fixture(blocked = false) {
  const store = new Map(), events = new Map(), motionListeners = new Set();
  const motion = {
    matches: false,
    addEventListener: (_, listener) => motionListeners.add(listener),
    removeEventListener: (_, listener) => motionListeners.delete(listener),
  };
  const context = { exports: {}, Event: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return store.get(key) ?? null; },
      setItem: (key, value) => { if (blocked) throw Error('blocked'); store.set(key, value); },
    },
    window: {
      matchMedia: () => motion,
      addEventListener: (type, fn) => { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(fn); },
      removeEventListener: (type, fn) => events.get(type)?.delete(fn),
      dispatchEvent: event => events.get(event.type)?.forEach(fn => fn(event)),
    },
  };
  vm.runInNewContext(source, context);
  return { ...context.exports, store, events, motionListeners,
    emit: (type, data = {}) => context.window.dispatchEvent({ type, ...data }),
    reduce: value => { motion.matches = value; motionListeners.forEach(fn => fn()); },
  };
}

test('scenery defaults enabled; manual pause persists and resuming notifies this page', () => {
  const f = fixture(); let changes = 0;
  const stop = f.subscribeSceneryPreference(() => changes++);
  assert.equal(f.readSceneryPreference(), true);
  f.setSceneryPreference(false);
  assert.equal(f.store.get('baa-scenery'), 'paused');
  assert.equal(f.readSceneryPreference(), false);
  f.setSceneryPreference(true);
  assert.equal(f.store.get('baa-scenery'), 'enabled');
  assert.equal(f.readSceneryPreference(), true);
  assert.equal(changes, 2);
  stop();
});

test('OS reduced motion overrides enabled and preserves the saved choice', () => {
  const f = fixture(); let changes = 0;
  f.subscribeSceneryPreference(() => changes++);
  f.setSceneryPreference(true);
  f.reduce(true);
  assert.equal(f.readSceneryPreference(), false);
  assert.equal(f.store.get('baa-scenery'), 'enabled');
  f.setSceneryPreference(true);
  assert.equal(f.readSceneryPreference(), false);
  f.reduce(false);
  assert.equal(f.readSceneryPreference(), true);
  f.setSceneryPreference(false);
  f.reduce(true); f.reduce(false);
  assert.equal(f.readSceneryPreference(), false);
  assert.equal(changes, 7);
});

test('cross-tab pause and storage clearing resync; all listeners clean up', () => {
  const f = fixture(); let changes = 0;
  const stop = f.subscribeSceneryPreference(() => changes++);
  f.store.set('baa-scenery', 'paused');
  f.emit('storage', { key: 'baa-scenery' });
  assert.equal(f.readSceneryPreference(), false);
  f.emit('storage', { key: 'unrelated' });
  assert.equal(changes, 1);
  f.store.clear(); f.emit('storage', { key: null });
  assert.equal(f.readSceneryPreference(), true);
  assert.equal(changes, 2);
  stop();
  f.emit('storage', { key: null }); f.reduce(true); f.setSceneryPreference(false);
  assert.equal(changes, 2);
  assert.equal(f.motionListeners.size, 0);
  for (const listeners of f.events.values()) assert.equal(listeners.size, 0);
});

test('blocked storage supports an in-memory pause while preserving OS priority', () => {
  const f = fixture(true);
  assert.equal(f.readSceneryPreference(), true);
  f.setSceneryPreference(false);
  assert.equal(f.readSceneryPreference(), false);
  f.setSceneryPreference(true);
  assert.equal(f.readSceneryPreference(), true);
  f.reduce(true);
  assert.equal(f.readSceneryPreference(), false);
});

test('prerendering can read, set, and unsubscribe without browser globals', () => {
  const context = { exports: {} };
  vm.runInNewContext(source, context);
  assert.equal(context.exports.readSceneryPreference(), true);
  context.exports.setSceneryPreference(false);
  context.exports.subscribeSceneryPreference(() => {})();
});
