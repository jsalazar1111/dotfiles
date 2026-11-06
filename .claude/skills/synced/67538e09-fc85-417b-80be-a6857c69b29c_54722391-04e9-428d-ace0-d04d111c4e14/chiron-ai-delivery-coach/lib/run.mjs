// Runs a command for the tutor. On Windows, tools such as sf and suitecloud are .cmd files, which Node starts only
// through a shell; the shell splits unquoted arguments, so each one is quoted and anything a shell could expand is refused.
import { spawnSync } from 'node:child_process';

// A trailing backslash would escape the closing quote, so it is doubled.
export function winCommandLine(prog, args) {
  // A percent sign could be expanded by cmd.exe, and a line break ends the command. A double quote is escaped for the program, but
  // it also toggles cmd.exe's own quoting, so it is allowed only when the argument holds nothing cmd.exe treats as an operator.
  for (const a of args) {
    if (/[%\r\n]/.test(a) || (a.includes('"') && /[&|<>^]/.test(a))) throw new Error('unsafe argument');
  }
  return [prog, ...args.map((a) => `"${a.replace(/"/g, '\\"').replace(/(\\+)$/, '$1$1')}"`)].join(' ');
}

const NOT_FOUND = { code: 127, out: '', err: 'not-found' };
const result = (r) => ({ code: r.status ?? 1, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() });

// cmd.exe exits 9009 for a program it cannot find, whatever the language of its message.
export const shellResult = (s) => (s.status === 9009 ? NOT_FOUND : result(s));

// Windows: is the program on the PATH, as an .exe or a .cmd shim? where.exe answers the same in every language.
const whereExe = (prog) => spawnSync('where.exe', [prog], { stdio: 'ignore' }).status === 0;

export function run(prog, args, opts = {}, platform = process.platform, isInstalled = whereExe) {
  const r = spawnSync(prog, args, { encoding: 'utf8', ...opts });
  if (!r.error) return result(r);
  // Windows: a .cmd tool cannot start directly (EINVAL) and is not found as an .exe (ENOENT). Try the shell once, but only
  // for a program that exists: cmd.exe reports a missing one as exit code 1 when Node starts it, which looks like a failure.
  if (platform === 'win32') {
    if (!isInstalled(prog)) return NOT_FOUND;
    let line;
    try { line = winCommandLine(prog, args); } catch { return NOT_FOUND; } // cannot start directly or safely: missing
    const s = spawnSync(line, { encoding: 'utf8', shell: true, ...opts });
    if (!s.error) return shellResult(s);
  }
  return NOT_FOUND;
}
