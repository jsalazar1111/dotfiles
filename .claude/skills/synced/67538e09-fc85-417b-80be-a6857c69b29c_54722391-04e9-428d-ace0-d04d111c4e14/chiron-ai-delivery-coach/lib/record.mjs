// Local progress record: profile.json, ledger.md (append-only, pipe-separated) and outbox.jsonl (queue for later sync).
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { tutorPrefix } from './prefix.mjs';

// 'recheck' asks for a step's check to run again (a new computer) without taking its credit away.
export const STATUSES = ['not-started', 'in-progress', 'complete', 'blocked', 'demo-submitted', 'recheck'];
// Steps with a real check: marking one complete needs that check's result as evidence (the step command enforces it).
export const EVIDENCE_STEPS = [
  'p2-signin', 'p2-toolchain', 'p2-save', 'p4-repo', 'p4-versions', 'p4-backup', 'p4-branch',
  'p5-plugins', 'p5-brainstorm', 'p5-browser', 'p6-sandbox', 'p6-jira',
  'p7-data-model', 'p7-interface', 'p7-automation', 'p7-data-load', 'p7-reporting', 'p7-analysis',
  'p7-ns-data-model', 'p7-ns-interface', 'p7-ns-automation', 'p7-ns-data-load', 'p7-ns-reporting', 'p7-ns-analysis',
  'p9-statusline', 'p9-compact', 'p8-demo',
];
export const STEP_IDS = [
  'p1-start', 'p2-notice', 'p2-signin', 'p2-toolchain', 'p2-drive',
  'p2-installer', 'p2-github', 'p2-save', 'p3-model', 'p3-comfort',
  'p4-repo', 'p4-versions', 'p4-backup', 'p4-branch',
  'p5-windows', 'p5-plugins', 'p5-brainstorm', 'p5-browser',
  'p6-sandbox', 'p6-jira',
  'p7-data-model', 'p7-interface', 'p7-automation', 'p7-data-load', 'p7-reporting', 'p7-analysis',
  'p7-ns-data-model', 'p7-ns-interface', 'p7-ns-automation', 'p7-ns-data-load', 'p7-ns-reporting', 'p7-ns-analysis',
  'p8-demo-plan', 'p8-demo',
  'p9-statusline', 'p9-init', 'p9-compact', 'p9-subagent', 'p9-rewind', 'p9-resume', 'p9-remote',
];

// Phases 1 to 8 are the foundation; Level Up (9) sits below the line and never holds up the certification.
export const FOUNDATION_PHASES = 8;

// Ledgers written before a renumbering (phases 0 to 9, or Level Up before the demo) used other numbers, but the name after
// the number is unique to each step, so an old line is read under the step that carries the same name today. Earned
// credit carries over and nothing in a ledger is rewritten.
const BY_NAME = new Map(STEP_IDS.map((id) => [id.replace(/^p\d+-/, ''), id]));
const current = (id) => (STEP_IDS.includes(id) ? id : BY_NAME.get(String(id).replace(/^p\d+-/, '')) ?? id);
// Today's id for a step id, old or new. An old id from before a renumbering is read as the step that carries its name, so it can
// never dodge the evidence rule. An id that is no step stays as it is.
export const canonicalStep = current;

// Phase 7 has one set of six exercises per platform: p7-<id> for Salesforce, p7-ns-<id> for NetSuite. A learner gets
// the sets for the platforms they chose (owner, October 31, 2026); someone with no platform yet gets Salesforce's.
export function stepsFor(platforms = []) {
  const sf = !platforms.includes('netsuite') || platforms.includes('salesforce');
  const ns = platforms.includes('netsuite');
  return STEP_IDS.filter((id) => (id.startsWith('p7-ns-') ? ns : id.startsWith('p7-') ? sf : true));
}

const SUMMARY_MAX = 500;
const FIELDS = 6; // date|stepId|status|jiraKey|summary|output
const config = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'config.json'), 'utf8'));
const header = `# Chiron, schema 1, tutor ${config.tutorVersion}`;

// Links to these hosts are not secrets and often are the evidence (a Slack demo link, a pull request, a Jira story), so the
// path is kept. A token in the query string is still hidden, and a lookalike host such as slack.com.evil.test gets no exception.
const TRUSTED_URL = /https:\/\/(?:[a-z0-9-]+\.)*(?:slack\.com|github\.com|atlassian\.net|google\.com)\/[^\s?#"')<>]*/gi;

export function redact(text) {
  const kept = [];
  const masked = String(text).replace(TRUSTED_URL, (m) => `\u0000${kept.push(m) - 1}\u0000`);
  return masked
    // The value after a password or an access or refresh token, and a Salesforce session id (org id, "!", then the session).
    // Only these named forms: a bare "token" or "password" in ordinary text stays.
    .replace(/\b((?:password|passwd|access_token|refresh_token)=)[^\s&"')<>]+/gi, '$1[redacted]')
    .replace(/\b00D[A-Za-z0-9]{12,15}![A-Za-z0-9._]{16,}/g, '[redacted]')
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, '[redacted]')
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/g, '[redacted]')
    .replace(/sk-[A-Za-z0-9_-]{16,}/g, '[redacted]')
    .replace(/[A-Fa-f0-9]{32,}/g, '[redacted]')
    // Any other long run that looks like a key. Readable names (lowercase words and numbers joined by -, _ or /, such as
    // a dated file name) stay, so evidence like the plan's file name is kept.
    .replace(/[A-Za-z0-9+/=_-]{32,}/g, (m) => (/^[a-z0-9]+(?:[-_/][a-z0-9]+)+$/.test(m) ? m : '[redacted]'))
    .replace(/\u0000(\d+)\u0000/g, (_, n) => kept[Number(n)]);
}

export function initWorkspace(dir, profile) {
  mkdirSync(join(dir, 'outputs'), { recursive: true });
  // A second init (a resume after a restart) keeps what the person already set, such as the practice project name and org alias.
  let before = {};
  try { before = JSON.parse(readFileSync(join(dir, 'profile.json'), 'utf8')); } catch { /* first init */ }
  const full = {
    schemaVersion: 1,
    ...before,
    ...profile,
    prefix: tutorPrefix(profile.email),
    sandboxAlias: before.sandboxAlias ?? null,
    tutorVersion: config.tutorVersion,
  };
  writeFileSync(join(dir, 'profile.json'), JSON.stringify(full, null, 2) + '\n');
  if (!existsSync(join(dir, 'ledger.md'))) writeFileSync(join(dir, 'ledger.md'), header + '\n');
}

// A crash can leave a file without its final newline; start the next record on a fresh line.
function appendLine(file, line) {
  if (existsSync(file) && statSync(file).size > 0) {
    const fd = openSync(file, 'r');
    const b = Buffer.alloc(1);
    readSync(fd, b, 0, 1, statSync(file).size - 1);
    closeSync(fd);
    if (b[0] !== 0x0a) appendFileSync(file, '\n');
  }
  appendFileSync(file, line);
}

// One line per field value: no pipes or newlines, so a line always splits into FIELDS fields.
const clean = (s) => String(s ?? '').replace(/[|\r\n]+/g, ' ');

export function appendStep(dir, step) {
  if (!STATUSES.includes(step.status)) throw new Error(`invalid status: ${step.status}`);
  if (!step.stepId) throw new Error('stepId required');
  const stepId = current(step.stepId);
  if (!STEP_IDS.includes(stepId)) throw new Error(`unknown step: ${step.stepId}`);
  const rec = {
    date: step.date ?? new Date().toISOString().slice(0, 10),
    stepId,
    status: step.status,
    jiraKey: step.jiraKey ?? '',
    summary: redact(clean(step.summary)).slice(0, SUMMARY_MAX),
    output: redact(clean(step.output)),
  };
  appendLine(
    join(dir, 'ledger.md'),
    [rec.date, rec.stepId, rec.status, rec.jiraKey, rec.summary, rec.output].map(clean).join('|') + '\n'
  );
  // The exact time goes to the outbox only, so the progress service can spot implausible bursts of steps.
  appendLine(join(dir, 'outbox.jsonl'), JSON.stringify({ ...rec, at: new Date().toISOString() }) + '\n');
}

// Coaching (Phase 10) is written to the outbox only: it never touches the ledger, so it can never change credit.
const COACHING_SUMMARY_MAX = 300;
const OUTCOMES = ['yes', 'partly', 'no'];

function foundationDone(dir) {
  const { completed } = resume(dir);
  let platforms = [];
  try { platforms = JSON.parse(readFileSync(join(dir, 'profile.json'), 'utf8')).platforms ?? []; } catch { /* no profile yet */ }
  return stepsFor(platforms).filter((id) => Number(/^p(\d+)-/.exec(id)[1]) <= FOUNDATION_PHASES).every((id) => completed.includes(id));
}

// Starts a coaching record once Chiron understands the need. Returns the session id that coach-end uses later.
// stepId and status are set so the progress service accepts the line before it learns the difference.
export function appendCoaching(dir, { summary, area, kind, looks }) {
  const lists = config.coaching;
  if (!foundationDone(dir)) throw new Error('coaching opens after the foundation (phases 1 to 8) is complete');
  if (!lists.areas.includes(area)) throw new Error(`area must be one of: ${lists.areas.join(', ')}`);
  if (!lists.kinds.includes(kind)) throw new Error(`kind must be one of: ${lists.kinds.join(', ')}`);
  if (!Array.isArray(looks) || !looks.length || !looks.every((l) => lists.looks.includes(l))) {
    throw new Error(`looks must be one or more of: ${lists.looks.join(', ')}`);
  }
  const sessionId = randomBytes(4).toString('hex');
  const now = new Date().toISOString();
  appendLine(join(dir, 'outbox.jsonl'), JSON.stringify({
    date: now.slice(0, 10), stepId: 'coaching', status: 'in-progress', kind: 'coaching', sessionId,
    summary: redact(clean(summary)).slice(0, COACHING_SUMMARY_MAX), area, helpKind: kind, looks, at: now,
  }) + '\n');
  return sessionId;
}

// Closes a coaching record with the learner's answer to "Does this help unblock you?". A session never closed shows no outcome.
export function endCoaching(dir, sessionId, outcome) {
  if (!/^[0-9a-f]{8}$/.test(String(sessionId ?? ''))) throw new Error('session id must be the 8-character id coach-start printed');
  if (!OUTCOMES.includes(outcome)) throw new Error(`outcome must be one of: ${OUTCOMES.join(', ')}`);
  const now = new Date().toISOString();
  appendLine(join(dir, 'outbox.jsonl'), JSON.stringify({
    date: now.slice(0, 10), stepId: 'coaching', status: 'complete', kind: 'coaching', sessionId, outcome, at: now,
  }) + '\n');
}

export function resume(dir) {
  // Credit is permanent: once a step is complete, no later update (a practice rerun, a mistake) takes it back.
  const completed = [];
  const recheck = new Set();
  const jira = {}; // the latest Jira story key recorded for each step
  let text = '';
  try { text = readFileSync(join(dir, 'ledger.md'), 'utf8'); } catch { /* no ledger yet: nothing is done */ }
  for (const line of text.split('\n')) {
    const f = line.split('|');
    if (f.length !== FIELDS || !STATUSES.includes(f[2])) continue; // header, blank or half-written
    const [, raw, status, key] = f;
    const id = current(raw);
    if (key) jira[id] = key;
    if (status === 'complete') {
      if (!completed.includes(id)) completed.push(id);
      recheck.delete(id);
    } else if (status === 'recheck' && completed.includes(id)) {
      recheck.add(id);
    }
  }
  let platforms = [];
  try { platforms = JSON.parse(readFileSync(join(dir, 'profile.json'), 'utf8')).platforms ?? []; } catch { /* no profile yet */ }
  const nextStep = stepsFor(platforms).find((id) => !completed.includes(id) || recheck.has(id)) ?? null;
  return { nextStep, completed, jira };
}
