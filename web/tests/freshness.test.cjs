const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Compile just the units under test, with a controllable wall clock and fetch.
// No new test runtime dependency or browser/network is required.
function load(relativePath, dependencies = {}, globals = {}) {
  const file = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename: file });
  return module.exports;
}

const now = Date.parse('2026-11-09T06:00:00Z');
const freshness = load('src/lib/freshness.ts');
const snapshot = (ageMs = 0) => ({
  updated_at: new Date(now - ageMs).toISOString(),
  data_age_minutes: 0, is_stale: false, stations: {}, summary: {},
});

test('stale boundary uses elapsed collection time: exactly 180 minutes is fresh, +1ms stale', () => {
  assert.equal(freshness.STALE_AFTER_MS, 180 * 60_000);
  assert.equal(freshness.getDataFreshness(snapshot(freshness.STALE_AFTER_MS), now).isStale, false);
  assert.equal(freshness.getDataFreshness(snapshot(freshness.STALE_AFTER_MS + 1), now).isStale, true);
});

test('same already-loaded snapshot becomes stale as wall clock advances', () => {
  const data = snapshot();
  assert.equal(freshness.getDataFreshness(data, now).isStale, false);
  assert.equal(freshness.getDataFreshness(data, now + freshness.STALE_AFTER_MS + 1).isStale, true);
  assert.equal(data.is_stale, false, 'does not mutate cached source snapshot');
});

test('old populated source cannot be hidden by another newly collected source', () => {
  const data = snapshot();
  data.collected_at_by_type = {
    elevator: data.updated_at,
    escalator: new Date(now - 4 * 60 * 60_000).toISOString(),
  };
  const result = freshness.getDataFreshness(data, now);
  assert.equal(result.isStale, true);
  assert.equal(result.ageMinutes, 240);
  assert.equal(result.collectedAt, Date.parse(data.collected_at_by_type.escalator));
});

test('supported fresh sources need no unsupported empty source timestamps', () => {
  const data = snapshot();
  data.collected_at_by_type = { elevator: data.updated_at, escalator: data.updated_at };
  assert.equal(freshness.getDataFreshness(data, now).isStale, false);
});

test('missing, invalid, empty or future collection metadata is never live', () => {
  for (const metadata of [{}, { elevator: null }, { elevator: '' }, { elevator: 'invalid' },
    { elevator: new Date(now + 1).toISOString() },
    { elevator: snapshot().updated_at, escalator: null }]) {
    const result = freshness.getDataFreshness({ ...snapshot(), collected_at_by_type: metadata }, now);
    assert.equal(result.isStale, true);
    assert.equal(result.hasUnknownTime, true);
  }
  for (const updated_at of ['', 'invalid', new Date(now + 1).toISOString()]) {
    assert.equal(freshness.getDataFreshness({ ...snapshot(), updated_at }, now).isStale, true);
  }
});

test('server stale flag is preserved, legacy snapshots fall back to updated_at', () => {
  assert.equal(freshness.getDataFreshness({ ...snapshot(), is_stale: true }, now).isStale, true);
  assert.equal(freshness.getDataFreshness(snapshot(), now).isStale, false);
});

test('five-minute fetch cache recalculates age and stale state without refetching', async () => {
  let clock = now;
  let fetches = 0;
  class FakeDate extends Date { static now() { return clock; } }
  const fresh = load('src/lib/freshness.ts', {}, { Date: FakeDate });
  const source = snapshot(fresh.STALE_AFTER_MS - 60_000);
  const data = load('src/lib/data.ts', {
    './freshness': fresh,
    './mock-data': {},
    './opendata': {},
  }, {
    Date: FakeDate, process: { env: { NODE_ENV: 'production' } },
    fetch: async () => { fetches++; return { ok: true, json: async () => source }; },
  });
  assert.equal((await data.fetchLatest()).is_stale, false);
  clock += 2 * 60_000;
  const cached = await data.fetchLatest();
  assert.equal(fetches, 1);
  assert.equal(cached.is_stale, true);
  assert.equal(cached.data_age_minutes, 181);
  assert.equal(cached.updated_at, source.updated_at);
  assert.equal(source.is_stale, false);
});

test('banner timer and focus recalculate stale UI, cleanup removes listeners', () => {
  let clock = now;
  let state;
  let effect;
  let interval;
  let cleared = false;
  const listeners = new Map();
  const events = {
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); },
  };
  class FakeDate extends Date { static now() { return clock; } }
  const Component = load('src/components/DataFreshnessBar.tsx', {
    react: {
      useState(initial) { state ??= initial(); return [state, value => { state = value; }]; },
      useEffect(callback) { effect = callback; },
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next-intl': { useTranslations: () => (key) => key },
    '@/lib/freshness': freshness,
  }, {
    Date: FakeDate, window: events, document: events,
    setInterval(callback, delay) { assert.equal(delay, 30_000); interval = callback; return 1; },
    clearInterval(id) { assert.equal(id, 1); cleared = true; },
  }).default;
  const data = snapshot(freshness.STALE_AFTER_MS - 60_000);
  const render = () => JSON.stringify(Component({ data }));
  assert.match(render(), /liveMessage/);
  const cleanup = effect();
  clock += 2 * 60_000;
  interval();
  assert.match(render(), /staleMessage/);
  assert.doesNotMatch(render(), /animate-ping/);
  clock = now;
  listeners.get('focus')();
  assert.match(render(), /liveMessage/);
  clock += 2 * 60_000;
  listeners.get('visibilitychange')();
  assert.match(render(), /staleMessage/);
  cleanup();
  assert.equal(cleared, true);
  assert.equal(listeners.size, 0);
});


test('populated source missing from collection metadata is not silently fresh', () => {
  const data = { ...snapshot(), summary: { escalator: { total: 1, operating: 1, fault: 0 } },
    collected_at_by_type: { elevator: snapshot().updated_at } };
  assert.equal(freshness.getDataFreshness(data, now).isStale, true);
  assert.equal(freshness.getDataFreshness(data, now).hasUnknownTime, true);
});
