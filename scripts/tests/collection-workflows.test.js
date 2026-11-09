import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = name => readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8');
for (const type of ['realtime', 'static', 'environment']) {
  test(`${type} publishes source only, validates and verifies merge under shared lock`, () => {
    const text = workflow(`collect-${type}`);
    assert.match(text, /group: data-collection-main/);
    assert.match(text, /cancel-in-progress: false/);
    assert.match(text, /ref: main/);
    assert.match(text, /run: node validate.js/);
    assert.match(text, /run: node scripts\/merge-data-pr.js/);
    assert.match(text, new RegExp(`PR_BRANCH: auto/collect-${type}`));
    assert.doesNotMatch(text, /web\/public\/data\/\*\*|--admin|gh pr merge|\|\| echo/);
    if (type !== 'realtime') assert.doesNotMatch(text, /data-static\/\*\*/);
  });
}
test('deployment listens to exact collector names and regenerates merged sources', () => {
  const deploy = workflow('deploy');
  for (const type of ['realtime', 'static', 'environment']) {
    const name = workflow(`collect-${type}`).split('\n')[0].slice('name: '.length);
    assert.ok(deploy.includes(`'${name}'`));
  }
  assert.match(deploy, /ref: main/);
  assert.match(deploy, /npm run build-latest\s+npm run validate/);
  assert.match(deploy, /workflow_run.conclusion == 'success'/);
});

test('realtime pipeline edits refresh main without triggering on collected data', () => {
  const realtime = workflow('collect-realtime');
  const push = realtime.match(/  push:\n([\s\S]*?)  schedule:/)?.[1];
  assert.ok(push, 'realtime push trigger is present');
  assert.match(push, /branches: \[main\]/);
  const paths = [...push.matchAll(/      - '([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(paths, [
    '.github/workflows/collect-realtime.yml',
    'scripts/collect.js',
    'scripts/api/**',
    'scripts/merge-data-pr.js',
  ]);
  assert.ok(paths.every(path => !path.startsWith('data') && !path.startsWith('web/')));
  for (const type of ['static', 'environment']) assert.doesNotMatch(workflow(`collect-${type}`), /  push:/);
});
