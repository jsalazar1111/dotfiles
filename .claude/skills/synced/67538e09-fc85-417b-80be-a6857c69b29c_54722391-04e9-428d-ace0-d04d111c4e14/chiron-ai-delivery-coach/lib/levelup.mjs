// Level Up checks. The status line is set in Claude Code's settings as a command; it works only if the script it runs
// is still there.
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export function checkStatusline(claudeDir, home = homedir()) {
  let command;
  try { command = JSON.parse(readFileSync(join(claudeDir, 'settings.json'), 'utf8')).statusLine?.command; } catch { return 'STATUSLINE|missing'; }
  if (!command) return 'STATUSLINE|missing';
  const paths = command.split(/\s+/).filter((t) => /[\\/]/.test(t)).map((t) => t.replace(/^["']|["']$/g, '').replace(/^~(?=$|[\\/])/, home));
  return paths.every((p) => existsSync(p)) ? 'STATUSLINE|ok' : 'STATUSLINE|missing';
}

// What the status line shows for a folder, such as the practice project: runs the installed status line command the
// way Claude Code does (session details on standard input), with an empty session, and prints it without colors.
// Chiron cannot see another window's status line, so it reads the script and this preview instead.
export function previewStatusline(claudeDir, folder, home = homedir()) {
  let command;
  try { command = JSON.parse(readFileSync(join(claudeDir, 'settings.json'), 'utf8')).statusLine?.command; } catch { /* below */ }
  if (!command) return ['STATUSLINE|missing'];
  const script = command.split(/\s+/).find((t) => /[\\/]/.test(t))?.replace(/^["']|["']$/g, '').replace(/^~(?=$|[\\/])/, home);
  const input = JSON.stringify({
    workspace: { current_dir: folder }, cwd: folder, model: { display_name: '' }, effort: {},
    context_window: { total_input_tokens: 0, total_output_tokens: 0, context_window_size: 1000000 },
  });
  const r = spawnSync(command, { shell: true, input, encoding: 'utf8', cwd: folder.startsWith('/') && existsSync(folder) ? folder : undefined, timeout: 10000 });
  const lines = String(r.stdout ?? '').replace(/\x1b\[[0-9;]*m/g, '').split('\n').map((l) => l.trimEnd()).filter(Boolean);
  return [...(script ? [`STATUSLINE|script|${script}`] : []), ...lines.map((l) => `STATUSLINE|line|${l.replace(/\s+/g, ' ').trim()}`)];
}
