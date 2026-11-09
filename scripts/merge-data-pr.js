import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const fields = 'state,isDraft,baseRefName,headRefName,headRefOid,mergeable,mergeStateStatus,autoMergeRequest';

// Never use --admin: GitHub must enforce all repository protections.
export async function mergeDataPr({ number, branch, gh, sleep, attempts = 24 }) {
  if (!/^\d+$/.test(String(number)) || !branch?.startsWith('auto/collect-')) {
    throw new Error('A collector PR number and expected branch are required');
  }
  let requested = false;
  let head;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const pr = JSON.parse(gh(['pr', 'view', String(number), '--json', fields]));
    if (pr.baseRefName !== 'main' || pr.headRefName !== branch || pr.isDraft) {
      throw new Error('Refusing unexpected base, head branch, or draft PR');
    }
    if (head && head !== pr.headRefOid) throw new Error('PR head changed while merging; rerun collection');
    head = pr.headRefOid;
    if (pr.state === 'MERGED') return { outcome: 'merged', head };
    if (pr.state !== 'OPEN') throw new Error(`PR is ${pr.state}, not merged`);
    if (pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY') {
      throw new Error('PR has conflicts; regenerate the collector branch from main');
    }
    if (!requested && pr.mergeable === 'MERGEABLE' && pr.mergeStateStatus !== 'UNKNOWN') {
      const args = ['pr', 'merge', String(number), '--squash', '--match-head-commit', head];
      // GitHub rejects enablePullRequestAutoMerge for an already CLEAN PR.
      // A normal merge also respects required checks, reviews, and merge queues.
      if (pr.mergeStateStatus !== 'CLEAN') args.push('--auto');
      if (pr.mergeStateStatus === 'CLEAN' || !pr.autoMergeRequest) gh(args);
      requested = true;
    }
    if (attempt + 1 < attempts) await sleep(5000);
  }
  throw new Error('PR is still pending, not merged. Check required checks/reviews or the merge queue, then rerun collection/deployment after merge.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await mergeDataPr({
      number: process.env.PR_NUMBER,
      branch: process.env.PR_BRANCH,
      gh: args => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }),
      sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
    });
    console.log(`Collector PR #${process.env.PR_NUMBER}: ${result.outcome} (${result.head})`);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `outcome=${result.outcome}\n`);
  } catch (error) {
    console.error(`Collector PR was not confirmed merged: ${error.message}`);
    process.exitCode = 1;
  }
}
