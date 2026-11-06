// Phase 3 and 4 check of the person's practice project: private, in their own GitHub account, on main, and how far
// their saving, website edits, pulls and merged pull requests have got. Offline, it reports what this computer knows.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './run.mjs';

// repoName is the GitHub name to clone on a new computer. It differs from the folder when the usual name was taken.
export function checkPractice(path, repoName) {
  const fail = (reason, detail) => [`PRACTICE|repo|${reason}|${detail}`];
  if (!existsSync(path)) return [`PRACTICE|repo|no-folder|${path}|${repoName}`];
  if (!existsSync(join(path, '.git'))) return fail('no-git', path);
  const git = (...args) => run('git', ['-C', path, ...args]);
  // Never wait on a sign-in prompt or a GitHub that does not answer: give up and use what the last fetch saw.
  const fetchOpts = {
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    timeout: Number(process.env.TUTOR_FETCH_TIMEOUT_MS) || 20000,
    stdio: 'ignore', // a timed-out fetch leaves a helper running; with no pipes to drain, nothing waits for it
  };
  if (git('remote', 'get-url', 'origin').code !== 0) return fail('no-remote', path);

  const view = run('gh', ['repo', 'view', '--json', 'visibility,nameWithOwner,owner,defaultBranchRef'], { cwd: path });
  if (view.code !== 0) {
    // No network: GitHub cannot answer, so report what this computer knows and leave the rest for later.
    if (OFFLINE.test(view.err)) return [`PRACTICE|repo|offline|${path}`, ...localCounts(git)];
    return fail('not-found', (view.err.split('\n').pop() || '').replace(/\|/g, ' ').slice(0, 200));
  }
  const repo = JSON.parse(view.out);
  // Whose account comes first: a project in the Plative organization is never theirs to fix, public or not.
  const login = run('gh', ['api', 'user', '--jq', '.login']).out;
  if (repo.owner?.login !== login) return fail('not-own', repo.owner?.login);
  if (repo.visibility !== 'PRIVATE') return fail('not-private', repo.nameWithOwner);
  const branch = repo.defaultBranchRef?.name;
  if (branch !== 'main') return fail('not-main', branch);

  run('git', ['-C', path, 'fetch', '-q', 'origin'], fetchOpts); // a failed fetch is fine: the counts use what the last fetch saw
  const prs = run('gh', ['pr', 'list', '--state', 'merged', '--json', 'number'], { cwd: path });
  let merged = 0;
  try { merged = prs.code === 0 ? JSON.parse(prs.out).length : 0; } catch { /* unreadable list counts as none */ }

  return [`PRACTICE|repo|ok|${repo.nameWithOwner}`, ...localCounts(git), `PRACTICE|merged-prs|${merged}`];
}

const OFFLINE = /error connecting|could not resolve host|dial tcp|i\/o timeout|network is unreachable/i;

function localCounts(git) {
  const count = (range) => { const r = git('rev-list', '--count', range); return r.code === 0 ? Number(r.out) : null; };
  const commits = count('main') ?? 0;
  const ahead = count('origin/main..main') ?? commits; // never pushed: every commit is ahead
  const behind = count('main..origin/main') ?? 0;
  const committers = git('log', '--all', '--format=%cn').out.split('\n');
  return [
    `PRACTICE|commits|${commits}`,
    commits === 0 ? 'PRACTICE|pushed|none' : ahead ? `PRACTICE|pushed|ahead|${ahead}` : 'PRACTICE|pushed|ok',
    behind ? `PRACTICE|pulled|behind|${behind}` : 'PRACTICE|pulled|ok',
    `PRACTICE|web-edit|${committers.includes('GitHub') ? 'yes' : 'no'}`,
  ];
}
