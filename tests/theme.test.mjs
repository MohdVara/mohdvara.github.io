import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/theme.js', import.meta.url), 'utf8');
function setup({ saved, dark = false, hour = 12, storageBlocked = false } = {}) {
  const windowEvents = {}, documentEvents = {}, systemEvents = {};
  const dataset = {};
  const system = { matches: dark, addEventListener: (name, fn) => { systemEvents[name] = fn; } };
  let interval, meta;
  const storage = new Map(saved ? [['portfolio-theme', saved]] : []);
  const window = {
    matchMedia: () => system,
    addEventListener: (name, fn) => { windowEvents[name] = fn; },
    dispatchEvent: (event) => windowEvents[event.type]?.(event),
    setInterval: (fn) => { interval = fn; },
  };
  const document = {
    documentElement: { dataset },
    querySelector: () => ({ setAttribute: (_, value) => { meta = value; } }),
    addEventListener: (name, fn) => { documentEvents[name] = fn; },
  };
  runInNewContext(source, {
    window, document,
    localStorage: {
      getItem: (key) => { if (storageBlocked) throw Error('blocked'); return storage.get(key); },
      setItem: (key, value) => { if (storageBlocked) throw Error('blocked'); storage.set(key, value); },
    },
    Date: class { getHours() { return hour; } },
    Event: class { constructor(type) { this.type = type; } },
  });
  return {
    dataset, storage,
    choose: (detail) => windowEvents['theme-preference']({ detail }),
    system: (value) => { system.matches = value; systemEvents.change(); },
    tick: (value) => { hour = value; interval(); },
    resume: (value) => { hour = value; documentEvents.visibilitychange(); },
    storageEvent: (newValue, key = 'portfolio-theme') => windowEvents.storage({ key, newValue }),
    meta: () => meta,
  };
}

test('default follows system changes, explicit preference overrides and is persisted', () => {
  const site = setup();
  assert.equal(site.dataset.theme, 'light');
  site.system(true);
  assert.equal(site.dataset.theme, 'dark');
  site.choose('light');
  assert.equal(site.storage.get('portfolio-theme'), 'light');
  site.system(true);
  assert.equal(site.dataset.theme, 'light');
  assert.equal(site.meta(), '#faf8f2');
  site.choose('dark');
  assert.equal(site.dataset.theme, 'dark');
  assert.equal(site.meta(), '#101110');
  site.choose('system');
  site.system(false);
  assert.equal(site.dataset.theme, 'light');
});

test('time mode uses local 07:00 and 19:00 boundaries and updates on resume', () => {
  for (const [hour, expected] of [[0, 'dark'], [6, 'dark'], [7, 'light'], [18, 'light'], [19, 'dark'], [23, 'dark']]) {
    assert.equal(setup({ saved: 'time', hour }).dataset.theme, expected);
  }
  const site = setup({ saved: 'time', hour: 6 });
  site.tick(7);
  assert.equal(site.dataset.theme, 'light');
  site.system(true);
  assert.equal(site.dataset.theme, 'light');
  site.resume(19);
  assert.equal(site.dataset.theme, 'dark');
});

test('saved choices, invalid data, storage clearing and cross-tab updates', () => {
  assert.equal(setup({ saved: 'light', dark: true }).dataset.theme, 'light');
  assert.equal(setup({ saved: 'invalid', dark: true }).dataset.themePreference, 'system');
  const site = setup({ saved: 'dark' });
  site.choose('invalid');
  assert.equal(site.dataset.theme, 'dark');
  site.storageEvent('light');
  assert.equal(site.dataset.theme, 'light');
  site.storageEvent('dark', 'other-setting');
  assert.equal(site.dataset.theme, 'light');
  site.storageEvent(null, null);
  assert.equal(site.dataset.themePreference, 'system');
});

test('blocked storage still permits manual choices and automatic updates', () => {
  const site = setup({ storageBlocked: true });
  site.choose('dark');
  assert.equal(site.dataset.theme, 'dark');
  site.choose('time');
  site.tick(19);
  assert.equal(site.dataset.theme, 'dark');
  site.tick(7);
  assert.equal(site.dataset.theme, 'light');
});
