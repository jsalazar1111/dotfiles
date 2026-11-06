// The course card Chiron shows in Claude Code: the foundation (phases 1 to 8), then, below a divider, Level Up (9) and
// Ongoing Coaching (10); what is done and where the learner is, in a box drawn with box characters so it lines up in any
// terminal. The progress bar counts the foundation only, because Level Up never holds up the certification.
import { phaseTitles, COACHING_TITLE } from './outline.mjs';
import { FOUNDATION_PHASES } from './record.mjs';

const BAR = 28;

export function renderMap(state) {
  const done = state.donePhases ?? [];
  const titles = phaseTitles(state.platforms ?? []);
  const row = (n, t) => {
    const mark = done.includes(n) ? '✓' : n === state.currentPhase ? '▸' : ' ';
    const shown = String(n).padStart(2);
    return ` ${mark} ${shown}  ${t}${n === state.currentPhase && !done.includes(n) ? '  ← here' : ''}`;
  };
  const rows = [' FOUNDATIONAL CERT', ...titles.slice(0, FOUNDATION_PHASES).map((t, i) => row(i + 1, t))];
  const below = [' ONGOING', ...titles.slice(FOUNDATION_PHASES).map((t, i) => row(FOUNDATION_PHASES + i + 1, t)), row(titles.length + 1, COACHING_TITLE)];
  const foundationDone = done.filter((n) => n <= FOUNDATION_PHASES).length;
  const filled = Math.round((foundationDone / FOUNDATION_PHASES) * BAR);
  const bar = `${'█'.repeat(filled)}${'░'.repeat(BAR - filled)}   ${foundationDone} of ${FOUNDATION_PHASES} done`;
  const head = ['PLATIVE AI ACADEMY · Chiron', 'From AI tool setup to hands-on agentic delivery.'];
  const width = Math.max(...[...head, ...rows, ...below, bar].map((l) => [...l].length)) + 2;
  const line = (text) => `┃ ${text}${' '.repeat(width - 1 - [...text].length)}┃`;
  const rule = (l, r) => `${l}${'━'.repeat(width)}${r}`;
  return [rule('┏', '┓'), ...head.map(line), rule('┣', '┫'), ...rows.map(line), rule('┠', '┨').replaceAll('━', '─'), ...below.map(line), rule('┣', '┫'), line(bar), rule('┗', '┛')].join('\n');
}
