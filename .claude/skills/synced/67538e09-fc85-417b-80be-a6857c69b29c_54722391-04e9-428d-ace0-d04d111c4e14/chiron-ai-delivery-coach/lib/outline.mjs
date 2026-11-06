// Course outline page: fills the branded template with the learner's current phase.
import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stepsFor } from './record.mjs';

const template = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'course-outline.template.html'),
  'utf8'
);
// Phases are numbered 1 to 10. Phases 1 to 8 are the foundation. Below the divider: 9 Level Up (optional) and 10 Ongoing
// Coaching, which is never done.
const LAST_COURSE_PHASE = 9;
const COACHING_PHASE = 10;
export const COACHING_TITLE = 'Ongoing Coaching';

// The titles of phases 1 to 9, in order, shared by the outline page and the course card. Phase 7 names the learner's platform.
export function phaseTitles(platforms = []) {
  const names = { salesforce: 'Salesforce', netsuite: 'NetSuite' };
  const chosen = platforms.map((p) => names[p]).filter(Boolean);
  const platform = chosen.length === 1 ? chosen[0] : 'Salesforce and NetSuite';
  return [
    'Start', 'Install AI Toolchain', 'Get Comfortable With VS Code and Terminal', 'Learn GitHub Fundamentals',
    'Brainstorming and Browser Use With Claude Code', 'Prepare Sandbox and Jira Connections', `Agentically Configure ${platform}`,
    'Record and Share Your Learnings', 'Level Up With Advanced Claude Code Tips',
  ];
}
const EXERCISES = [
  ['data-model', 'Data model'], ['interface', 'Interface'], ['automation', 'Automation'],
  ['data-load', 'Data load'], ['reporting', 'Reporting'], ['analysis', 'Analysis'],
];

export function stateFromCompleted(completed, platforms = []) {
  const steps = stepsFor(platforms);
  const donePhases = [];
  for (let n = 1; n <= LAST_COURSE_PHASE; n++) {
    const ids = steps.filter((id) => id.startsWith(`p${n}-`));
    if (ids.length && ids.every((id) => completed.includes(id))) donePhases.push(n);
  }
  let currentPhase = 1;
  while (donePhases.includes(currentPhase)) currentPhase++;
  // Exercise dots: complete once done on every chosen platform; the next one in progress once Phase 7 has started.
  const exercises = {};
  let next = currentPhase === 7;
  for (const [id] of EXERCISES) {
    const mine = steps.filter((s) => s === `p7-${id}` || s === `p7-ns-${id}`);
    if (mine.every((s) => completed.includes(s))) exercises[id] = 'complete';
    else if (next) { exercises[id] = 'in-progress'; next = false; }
    else exercises[id] = 'not-started';
  }
  return { currentPhase, donePhases, exercises };
}

export function renderOutline(state) {
  const done = state.donePhases ?? [];
  let html = template;
  for (let n = 1; n <= COACHING_PHASE; n++) {
    const cls = done.includes(n) ? ' done' : n === state.currentPhase ? ' current' : '';
    html = html
      .replace(`{{PHASE_CLASS_${n}}}`, cls)
      .replace(`{{ARIA_${n}}}`, n === state.currentPhase ? ' aria-current="step"' : '');
  }
  // Platform: Homebrew only on a Mac, and only the chosen platform's exercise column. No profile yet: everything.
  const tools = 'VS Code, Python, Node.js, Git, GitHub CLI, SF CLI, SuiteCloud SDF CLI, JDK, jq';
  html = html.replace('{{TOOL_LIST}}', state.os === 'windows' ? `${tools} and uv` : `${tools}, uv and Homebrew`);
  const p = state.platforms || [];
  [...phaseTitles(p), COACHING_TITLE].forEach((t, i) => { html = html.replaceAll(`{{TITLE_${i + 1}}}`, t); });
  const only = p.length === 1 && p[0] === 'salesforce' ? 'only-sf' : p.length === 1 && p[0] === 'netsuite' ? 'only-ns' : '';
  html = html.replace('{{PLATFORM_CLASS}}', only);
  const dots = EXERCISES.map(([id, label]) => `<li class="${state.exercises?.[id] ?? 'not-started'}">${label}</li>`).join('');
  return html.replace('{{EXERCISE_DOTS}}', dots);
}

export function writeOutline(dir, state) {
  // The page reloads itself every few seconds: write a temporary file and swap it in, so a reload never sees half a page.
  mkdirSync(dir, { recursive: true }); // the folder may not exist yet on a first start
  const path = join(dir, 'course-outline.html');
  writeFileSync(`${path}.tmp`, renderOutline(state));
  renameSync(`${path}.tmp`, path);
  return path;
}
