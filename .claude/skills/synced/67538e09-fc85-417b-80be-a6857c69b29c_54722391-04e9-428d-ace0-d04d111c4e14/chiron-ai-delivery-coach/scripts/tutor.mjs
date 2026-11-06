// Command line for the router: state, init, step, outline, publish, save, publish-line, and the checks. Keeps quoting out of
// the skill's instructions. The progress folder is ~/<workspaceFolder>, or TUTOR_WORKSPACE when set.
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { initWorkspace, appendStep, appendCoaching, endCoaching, resume, canonicalStep, EVIDENCE_STEPS } from '../lib/record.mjs';
import { run } from '../lib/run.mjs';
import { hideFolder } from '../lib/hide.mjs';
import { orgInfo } from '../lib/org.mjs';
import { checkExercise, checkConflict } from '../lib/exercise.mjs';
import { checkStatusline, previewStatusline } from '../lib/levelup.mjs';
import { listOwn, deleteOwn, saveList, loadList } from '../lib/cleanup.mjs';
import { checkPractice } from '../lib/practice.mjs';
import { checkPlugins, checkBrowser, checkBrowsers, browserDir, BROWSERS, defaultClaudeDir } from '../lib/browser.mjs';
import { writeOutline, stateFromCompleted } from '../lib/outline.mjs';
import { renderMap } from '../lib/map.mjs';
import { sync } from '../lib/sync.mjs';
import { screenshot, sessionRead } from '../lib/looks.mjs';
import { refreshPath } from '../lib/winpath.mjs';

refreshPath(); // Windows: see tools installed after this window was opened

const here = dirname(fileURLToPath(import.meta.url));
// TUTOR_CONFIG points the tests at another config file. The progress service token is read from the config only.
const config = JSON.parse(readFileSync(process.env.TUTOR_CONFIG || join(here, '..', 'config.json'), 'utf8'));
const dir = process.env.TUTOR_WORKSPACE || join(homedir(), config.workspaceFolder);
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i < 0 ? undefined : rest[i + 1]; };

const git = (...args) => run('git', ['-C', dir, ...args]);
const COMPUTER_STEPS = ['p2-signin', 'p2-toolchain', 'p2-drive', 'p2-installer'];
const lastLine = (t) => (t.split('\n').filter(Boolean).pop() || '').replace(/\|/g, ' ').slice(0, 200);
const profile = () => {
  try { return JSON.parse(readFileSync(join(dir, 'profile.json'), 'utf8')); } catch { return {}; }
};

// Caches that tools drop into the folder, and the send queue (it can hold customer names from coaching summaries). None of these go to the progress backup.
const IGNORED = ['.sf/', '.sfdx/', '.DS_Store', 'outbox.jsonl', 'outbox.sent', 'cleanup-list.json'];

// Commits whatever changed. A Git name and email come from the sign-in when the person has none.
function commitAll() {
  if (!existsSync(join(dir, '.git'))) git('init', '-q', '-b', 'main');
  writeFileSync(join(dir, '.gitignore'), IGNORED.join('\n') + '\n');
  git('rm', '-r', '-q', '--cached', '--ignore-unmatch', ...IGNORED.map((p) => p.replace(/\/$/, '')));
  if (!git('config', 'user.email').out) {
    const email = profile().email || 'learner@plative.com';
    git('config', 'user.email', email);
    git('config', 'user.name', email.split('@')[0]);
  }
  git('add', '-A');
  git('commit', '-q', '-m', 'Save progress');
}
const hasRemote = () => existsSync(join(dir, '.git')) && git('remote', 'get-url', 'origin').code === 0;

// First save: a private repo in the person's own GitHub account, or on a new computer, their existing one.
function publish() {
  if (!existsSync(join(dir, 'ledger.md'))) throw new Error('run init first');
  commitAll();
  if (hasRemote()) {
    const p = git('push', '-q', '-u', 'origin', 'main');
    return p.code === 0 ? 'PUBLISH|ok|pushed' : `PUBLISH|push-failed|${lastLine(p.err)}`;
  }
  const view = run('gh', ['repo', 'view', config.workspaceRepo, '--json', 'visibility,nameWithOwner']);
  if (view.code === 0) {
    const v = JSON.parse(view.out);
    if (v.visibility !== 'PRIVATE') { process.exitCode = 1; return `PUBLISH|not-private|${v.nameWithOwner}`; }
    // Saved from another computer: that copy is the person's place. Keep this one aside, never delete it.
    const aside = `${dir}.local-${Date.now()}`;
    renameSync(dir, aside);
    const c = run('gh', ['repo', 'clone', v.nameWithOwner, dir]);
    if (c.code !== 0) { renameSync(aside, dir); process.exitCode = 1; return `PUBLISH|clone-failed|${lastLine(c.err)}`; }
    // Setup belongs to a computer: check it again here. Lessons and exercises carry over.
    for (const stepId of COMPUTER_STEPS) appendStep(dir, { stepId, status: 'recheck', summary: 'check again on this computer' });
    hideFolder(dir);
    return `PUBLISH|restored|${v.nameWithOwner}`;
  }
  const c = run('gh', ['repo', 'create', config.workspaceRepo, '--private', '--source', dir, '--remote', 'origin', '--push']);
  if (c.code !== 0) { process.exitCode = 1; return `PUBLISH|create-failed|${lastLine(c.err || c.out)}`; }
  return 'PUBLISH|ok|created';
}

// Later saves: commit and push. Offline or refused, the commit waits for the next save.
function save() {
  if (!hasRemote()) return 'SAVE|not-published';
  commitAll();
  return git('push', '-q', 'origin', 'main').code === 0 ? 'SAVE|ok' : 'SAVE|queued';
}

// Sends unsent progress lines to the progress service. Never throws and never blocks the course.
async function syncQuietly() {
  // A custom workspace (TUTOR_WORKSPACE) means a test or a harness run: it never sends to the live service unless a
  // test config (TUTOR_CONFIG) says where.
  if (process.env.TUTOR_WORKSPACE && !process.env.TUTOR_CONFIG) return 'SYNC|off';
  try {
    return await sync(dir, { url: config.progressUrl, token: config.progressToken, enabled: config.syncEnabled !== false });
  } catch {
    return 'SYNC|queued|0';
  }
}

// The one line the person runs with !, put on their clipboard when possible.
function publishLine() {
  const line = `node "${join(here, 'tutor.mjs').replace(/\\/g, '/')}" publish`;
  let copied = 'not-copied';
  if (!process.env.TUTOR_NO_CLIPBOARD) {
    const tool = process.platform === 'darwin' ? ['/usr/bin/pbcopy', []] : process.platform === 'win32' ? ['clip', []] : null;
    if (tool && spawnSync(tool[0], tool[1], { input: line }).status === 0) copied = 'copied';
  }
  return `LINE|${line}|${copied}`;
}

try {
  if (cmd === 'state') {
    console.log(JSON.stringify(existsSync(join(dir, 'ledger.md')) ? { exists: true, dir, ...resume(dir) } : { exists: false }));
  } else if (cmd === 'init') {
    initWorkspace(dir, { platforms: (flag('platforms') || '').split(','), os: flag('os'), email: flag('email'), org: flag('org') });
    hideFolder(dir);
    console.log(dir);
  } else if (cmd === 'step') {
    const status = rest[1];
    // An old step id is read as today's, so the evidence rule below always applies to it.
    const stepId = canonicalStep(rest[0]);
    const summary = rest[2]?.startsWith('--') ? '' : rest[2];
    const evidence = flag('evidence');
    if (status === 'complete' && EVIDENCE_STEPS.includes(stepId) && !evidence) {
      throw new Error(`${stepId} needs --evidence "<the check result that passed>" to be marked complete`);
    }
    appendStep(dir, { stepId, status, summary, jiraKey: flag('jira'), output: evidence });
  } else if (cmd === 'outline') {
    const p = profile();
    console.log(writeOutline(dir, { ...stateFromCompleted(resume(dir).completed, p.platforms), os: p.os, platforms: p.platforms }));
  } else if (cmd === 'check-exercise' || cmd === 'check-conflict') {
    // The learner's org (Phase 5's alias) and their saved prefix, so a check only ever looks at their own components.
    const p = profile();
    if (!p.prefix) throw new Error('run init first');
    const opts = { platform: flag('platform') || (p.platforms || [])[0] || 'salesforce', prefix: p.prefix, alias: config.sandboxAlias, email: p.email, object: flag('object'),
      project: join(homedir(), 'plative-learning', 'my-netsuite-project') };
    if (cmd === 'check-exercise') console.log(checkExercise(rest[0], opts).join('\n'));
    else console.log(checkConflict(String(rest[0] || '').split(',').filter(Boolean), p.prefix, opts));
  } else if (cmd === 'statusline-preview') {
    console.log(previewStatusline(defaultClaudeDir(), join(homedir(), 'plative-learning', config.practiceRepo)).join('\n'));
  } else if (cmd === 'check-statusline') {
    console.log(checkStatusline(defaultClaudeDir()));
  } else if (cmd === 'cleanup-list' || cmd === 'cleanup-run') {
    // Only after the demo is shared, and cleanup-run only after the learner confirmed the list Chiron showed them.
    if (cmd === 'cleanup-run' && !rest.includes('--confirmed')) throw new Error('cleanup-run needs --confirmed, after the learner confirms the list');
    const p = profile();
    if (!p.prefix) throw new Error('run init first');
    const opts = { alias: config.sandboxAlias, confirmed: true };
    const listFile = join(dir, 'cleanup-list.json');
    // cleanup-run deletes the list cleanup-list showed and the learner confirmed, never a fresh listing.
    const list = cmd === 'cleanup-run' ? loadList(listFile) : listOwn(p.prefix, { ...opts, email: p.email });
    if (cmd === 'cleanup-list') saveList(list, listFile);
    if (cmd === 'cleanup-list') console.log([`CLEANUP|records|${list.records}`, ...list.components.map((c) => `CLEANUP|item|${c.type}:${c.name}`), ...(list.standardRecords ?? []).map((r) => `CLEANUP|item|${r.sobject}:${r.name}`)].join('\n'));
    else console.log(deleteOwn(list, { ...opts, cwd: join(homedir(), 'plative-learning', config.practiceRepo) }).join('\n'));
  } else if (cmd === 'org-info') {
    console.log(orgInfo(rest[0] || config.sandboxAlias));
  } else if (cmd === 'map') {
    // Before the first start has saved anything, the card shows the whole path from Phase 1.
    if (!existsSync(join(dir, 'ledger.md'))) console.log(renderMap({ currentPhase: 1, donePhases: [], platforms: [] }));
    else console.log(renderMap({ ...stateFromCompleted(resume(dir).completed, profile().platforms), platforms: profile().platforms }));
  } else if (cmd === 'publish') {
    console.log(publish());
  } else if (cmd === 'save') {
    console.log(save());
    await syncQuietly();
  } else if (cmd === 'sync') {
    console.log(await syncQuietly());
  } else if (cmd === 'coach-start') {
    const looks = (flag('looks') || '').split(',').map((l) => l.trim()).filter(Boolean);
    const id = appendCoaching(dir, { summary: flag('summary') || '', area: flag('area'), kind: flag('kind'), looks });
    console.log(`COACH|${id}`);
    // Coaching never runs `save`, so send it now: leaders see it on the dashboard without waiting for a course step.
    await syncQuietly();
  } else if (cmd === 'coach-end') {
    endCoaching(dir, rest[0], flag('outcome'));
    console.log(`COACH|ended|${rest[0]}`);
    await syncQuietly();
  } else if (cmd === 'screenshot') {
    console.log(screenshot({ os: profile().os === 'windows' || process.platform === 'win32' ? 'windows' : 'mac' }));
  } else if (cmd === 'session-read') {
    console.log(sessionRead(rest[0] ?? '', join(defaultClaudeDir(), 'projects')));
  } else if (cmd === 'publish-line') {
    console.log(publishLine());
  } else if (cmd === 'check-practice') {
    // The folder is always the practice project in the learning folder; its GitHub name can differ (set-practice-repo).
    const given = flag('path');
    const path = given ? given.replace(/^~(?=$|[\\/])/, homedir()) : join(homedir(), 'plative-learning', config.practiceRepo);
    console.log(checkPractice(path, profile().practiceRepo || config.practiceRepo).join('\n'));
  } else if (cmd === 'set-practice-repo') {
    if (!rest[0] || !existsSync(join(dir, 'profile.json'))) throw new Error('usage: set-practice-repo <name>, after init');
    writeFileSync(join(dir, 'profile.json'), JSON.stringify({ ...profile(), practiceRepo: rest[0] }, null, 2) + '\n');
  } else if (cmd === 'check-plugins') {
    console.log(checkPlugins(defaultClaudeDir(), config.requiredPlugins));
  } else if (cmd === 'check-browser') {
    const id = flag('browser');
    if (id && !BROWSERS[id]) throw new Error(`unknown browser: ${id} (chrome or brave)`);
    console.log(id ? await checkBrowser(id, browserDir(id)) : await checkBrowsers());
  } else {
    throw new Error('usage: tutor.mjs state | map | init --platforms a,b --os mac|windows --email e --org o | step <id> <status> [summary] [--evidence <check result>] | outline | publish | save | sync | coach-start --summary s --area a --kind k --looks l,l | coach-end <id> --outcome yes|partly|no | screenshot | session-read <id> | publish-line | check-practice [--path <dir>] | set-practice-repo <name> | check-plugins | check-browser [--browser chrome|brave]');
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
