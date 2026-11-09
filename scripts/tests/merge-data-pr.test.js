import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeDataPr } from '../merge-data-pr.js';

const clean = { state: 'OPEN', isDraft: false, baseRefName: 'main', headRefName: 'auto/collect-realtime', headRefOid: 'abc123', mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN', autoMergeRequest: null };
function harness(states, failMerge = false) {
  const commands = [];
  let index = 0;
  return { commands, options: {
    number: 3819, branch: clean.headRefName, attempts: 3, sleep: async () => {},
    gh: args => {
      commands.push(args);
      if (args[1] === 'view') return JSON.stringify(states[Math.min(index++, states.length - 1)]);
      if (failMerge) throw new Error('Repository protection denied merge');
      return '';
    },
  } };
}
test('exact CLEAN regression uses normal squash, pins head, verifies MERGED', async () => {
  const { commands, options } = harness([clean, { ...clean, state: 'MERGED' }]);
  assert.deepEqual(await mergeDataPr(options), { outcome: 'merged', head: 'abc123' });
  assert.deepEqual(commands[1], ['pr', 'merge', '3819', '--squash', '--match-head-commit', 'abc123']);
});
test('BLOCKED requests protected auto merge, never reports pending as success', async () => {
  const { commands, options } = harness([{ ...clean, mergeStateStatus: 'BLOCKED' }]);
  await assert.rejects(mergeDataPr(options), /still pending, not merged/);
  const merges = commands.filter(c => c[1] === 'merge');
  assert.equal(merges.length, 1);
  assert.equal(merges[0].at(-1), '--auto');
  assert.ok(!merges[0].includes('--admin'));
});
test('auto merge may complete normally', async () => {
  const { options } = harness([{ ...clean, mergeStateStatus: 'BLOCKED' }, { ...clean, state: 'MERGED' }]);
  assert.equal((await mergeDataPr(options)).outcome, 'merged');
});
test('existing auto-merge request is monitored without repeating mutation', async () => {
  const { commands, options } = harness([{ ...clean, mergeStateStatus: 'BLOCKED', autoMergeRequest: {} }, { ...clean, state: 'MERGED' }]);
  await mergeDataPr(options);
  assert.ok(commands.every(c => c[1] === 'view'));
});
test('UNKNOWN is polled until GitHub computes mergeability', async () => {
  const { commands, options } = harness([{ ...clean, mergeable: 'UNKNOWN', mergeStateStatus: 'UNKNOWN' }, clean, { ...clean, state: 'MERGED' }]);
  await mergeDataPr(options);
  assert.equal(commands[2][1], 'merge');
});
for (const [label, patch, pattern] of [
  ['conflict', { mergeable: 'CONFLICTING', mergeStateStatus: 'DIRTY' }, /conflicts/],
  ['closed', { state: 'CLOSED' }, /not merged/],
  ['draft', { isDraft: true }, /unexpected/],
  ['wrong base', { baseRefName: 'other' }, /unexpected/],
  ['wrong branch', { headRefName: 'feature/test' }, /unexpected/],
]) test(`${label} fails without merge attempt`, async () => {
  const { commands, options } = harness([{ ...clean, ...patch }]);
  await assert.rejects(mergeDataPr(options), pattern);
  assert.ok(commands.every(c => c[1] === 'view'));
});
test('head change fails closed', async () => {
  const { options } = harness([clean, { ...clean, headRefOid: 'new-head', state: 'MERGED' }]);
  await assert.rejects(mergeDataPr(options), /head changed/);
});
test('protection denial is not bypassed or converted to success', async () => {
  const { commands, options } = harness([clean], true);
  await assert.rejects(mergeDataPr(options), /protection denied/);
  assert.equal(commands.length, 2);
});
