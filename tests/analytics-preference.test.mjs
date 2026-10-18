import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';
const source = ts.transpileModule(await readFile('src/analyticsPreference.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(blocked = false) {
  const store = new Map(), events = new Map();
  const context = { exports: {}, Event: class { constructor(type) { this.type = type; } },
    localStorage: { getItem: key => { if (blocked) throw Error('blocked'); return store.get(key) ?? null; }, setItem: (key, value) => { if (blocked) throw Error('blocked'); store.set(key, value); } },
    window: { addEventListener: (type, fn) => { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(fn); }, removeEventListener: (type, fn) => events.get(type)?.delete(fn), dispatchEvent: event => events.get(event.type)?.forEach(fn => fn(event)) },
  };
  vm.runInNewContext(source, context);
  return { ...context.exports, store, events, emit: (type, data = {}) => context.window.dispatchEvent({ type, ...data }) };
}
test('usage analytics requires an explicit current-version grant, and revocation persists', () => {
  const f = fixture(); assert.equal(f.readAnalyticsPreference(), false);
  f.store.set('portfolio-analytics-consent-v1', 'yes'); assert.equal(f.readAnalyticsPreference(), false);
  f.setAnalyticsPreference(true); assert.equal(f.readAnalyticsPreference(), true);
  f.setAnalyticsPreference(false); assert.equal(f.readAnalyticsPreference(), false);
  assert.equal(f.store.get('portfolio-analytics-consent-v1'), 'denied');
});
test('cross-tab withdrawal and clearing storage resync, and subscriptions clean up', () => {
  const f = fixture(); let changes = 0;
  const unsubscribe = f.subscribeAnalyticsPreference(() => changes++);
  f.setAnalyticsPreference(true); assert.equal(changes, 1);
  f.store.clear(); f.emit('storage', { key: null });
  assert.equal(f.readAnalyticsPreference(), false); assert.equal(changes, 2);
  f.emit('storage', { key: 'unrelated' }); assert.equal(changes, 2);
  unsubscribe(); f.emit('storage', { key: null }); assert.equal(changes, 2);
});
test('blocked storage defaults off but explicit choice works in memory for this page', () => {
  const f = fixture(true); assert.equal(f.readAnalyticsPreference(), false);
  f.setAnalyticsPreference(true); assert.equal(f.readAnalyticsPreference(), true);
  f.setAnalyticsPreference(false); assert.equal(f.readAnalyticsPreference(), false);
});
