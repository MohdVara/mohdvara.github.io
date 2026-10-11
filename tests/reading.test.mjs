import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/reading.js', import.meta.url), 'utf8');
function setup(saved, blocked = false) {
  const listeners = {}, dataset = {}, storage = new Map([['portfolio-text-size', saved]]);
  let changes = 0, resizes = 0;
  const window = {
    addEventListener: (name, fn) => { listeners[name] = fn; },
    dispatchEvent: ({ type }) => { if (type === 'text-size-change') changes++; if (type === 'resize') resizes++; },
  };
  runInNewContext(source, {
    window, document: { documentElement: { dataset } },
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return storage.get(key); },
      setItem: (key, value) => { if (blocked) throw Error('blocked'); storage.set(key, value); },
    },
    Event: class { constructor(type) { this.type = type; } },
  });
  return { dataset, storage,
    choose: detail => listeners['text-size-preference']({ detail }),
    sync: (newValue, key = 'portfolio-text-size') => listeners.storage({ key, newValue }),
    notifications: () => ({ changes, resizes }),
  };
}
test('saved text size applies at startup and changing it persists and refreshes layout', () => {
  const site = setup('large');
  assert.equal(site.dataset.textSize, 'large');
  site.choose('largest');
  assert.equal(site.storage.get('portfolio-text-size'), 'largest');
  assert.equal(site.dataset.textSize, 'largest');
  assert.deepEqual(site.notifications(), { changes: 2, resizes: 2 });
});
test('invalid preferences are ignored and cross-tab changes/reset stay in sync', () => {
  const site = setup('corrupt');
  assert.equal(site.dataset.textSize, 'default');
  site.choose('largest'); site.choose('corrupt');
  assert.equal(site.dataset.textSize, 'largest');
  site.sync('large', 'portfolio-theme');
  assert.equal(site.dataset.textSize, 'largest');
  site.sync('large'); assert.equal(site.dataset.textSize, 'large');
  site.sync(null, null); assert.equal(site.dataset.textSize, 'default');
});
test('blocked storage retains usable text sizing for the current page', () => {
  const site = setup('largest', true);
  assert.equal(site.dataset.textSize, 'default');
  site.choose('large'); assert.equal(site.dataset.textSize, 'large');
});
