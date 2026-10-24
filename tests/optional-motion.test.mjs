import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(await readFile('src/useOptionalMotion.ts', 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
}).outputText.replace(/import .* from "react";/, '').replace('export function', 'function')
  .replace('import("./portfolioMotion")', 'loadModule()');
function fixture({reduced = false, fail = false} = {}) {
  const listeners = new Map();
  let cleanup, release, loads = 0, mounts = 0, stops = 0;
  const gate = new Promise(resolve => {release = resolve;});
  const state = {matches: reduced};
  const context = {useEffect: effect => {cleanup = effect();}, matchMedia: () => state,
    window: {addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name)},
    loadModule: async () => {loads++; await gate; if (fail) throw Error('blocked'); return {
      mountHeroPointer: () => {mounts++; return () => {stops++;};},
      mountSystemMotion: () => {mounts++; return () => {stops++;};},
    };},
  };
  vm.runInNewContext(`${compiled}\nuseOptionalMotion();`, context);
  return {state, listeners, release, cleanup: () => cleanup(), counts: () => ({loads, mounts, stops})};
}
const settle = () => new Promise(resolve => setImmediate(resolve));
test('motion is absent at startup, loads once on input and disposes both controllers', async () => {
  const f = fixture(); assert.equal(f.counts().loads, 0);
  f.listeners.get('scroll')(); assert.equal(f.listeners.size, 0);
  f.release(); await settle(); assert.deepEqual(f.counts(), {loads: 1, mounts: 2, stops: 0});
  f.cleanup(); assert.equal(f.counts().stops, 2);
});
test('reduced motion avoids the download and can be changed before the next input', async () => {
  const f = fixture({reduced: true}); f.listeners.get('pointermove')(); assert.equal(f.counts().loads, 0);
  f.state.matches = false; f.listeners.get('pointermove')(); f.release(); await settle();
  assert.equal(f.counts().mounts, 2); f.cleanup();
});
test('navigation during download never installs observers; failed enhancement stays nonfatal', async () => {
  const f = fixture(); f.listeners.get('scroll')(); f.cleanup(); f.release(); await settle();
  assert.equal(f.counts().mounts, 0);
  const blocked = fixture({fail: true}); blocked.listeners.get('scroll')(); blocked.release(); await settle();
  assert.equal(blocked.counts().mounts, 0); blocked.cleanup();
});
