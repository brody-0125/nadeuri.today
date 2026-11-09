import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionFreshness, STALE_AFTER_MS } from '../lib/freshness.js';
const now = Date.parse('2026-11-09T06:00:00Z');
const source = (age = 0) => ({ collected_at: new Date(now - age).toISOString(), facilities: [{}] });
const data = () => ({ elevator: source(), escalator: source(), 'wheelchair-lift': source() });

test('180-minute exact boundary matches frontend policy', () => {
  const sources = data();
  sources.elevator = source(STALE_AFTER_MS);
  assert.equal(collectionFreshness(sources, now).is_stale, false);
  assert.equal(collectionFreshness(sources, now + 1).is_stale, true);
});
test('aggregation preserves oldest populated source time and per-type metadata', () => {
  const sources = data();
  sources.escalator = source(STALE_AFTER_MS + 1);
  sources['moving-walk'] = { collected_at: 'invalid', facilities: [] };
  const result = collectionFreshness(sources, now);
  assert.equal(result.updated_at, sources.escalator.collected_at);
  assert.equal(result.collected_at_by_type.escalator, sources.escalator.collected_at);
  assert.equal(result.is_stale, true);
  assert.equal('moving-walk' in result.collected_at_by_type, false);
});
test('missing and invalid required collection times are unknown, never build time', () => {
  for (const collected_at of [null, '', 'bad', new Date(now + 1).toISOString()]) {
    const sources = data();
    sources.elevator.collected_at = collected_at;
    assert.equal(collectionFreshness(sources, now).is_stale, true);
    assert.equal(collectionFreshness(sources, now).collected_at_by_type.elevator, null);
  }
  const result = collectionFreshness({}, now);
  assert.equal(result.updated_at, null);
  assert.equal(result.is_stale, true);
});
