// Windows cannot carry a percent sign on a command line (cmd.exe may expand it), and every LIKE check needs one. On Windows
// a query given as text is written to a temporary file and the command names the file (sf data query --file) instead.
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// TUTOR_OS=windows lets the tests take the Windows path on any computer.
export const onWindows = () => (process.env.TUTOR_OS ? process.env.TUTOR_OS === 'windows' : process.platform === 'win32');

// Returns the arguments to run and a function that removes the file. Other computers get the arguments back unchanged.
export function forPlatform(args) {
  const i = args.indexOf('--query');
  if (!onWindows() || i < 0 || i + 1 >= args.length) return { args, done() {} };
  const dir = mkdtempSync(join(tmpdir(), 'chiron-soql-'));
  const file = join(dir, 'query.soql');
  writeFileSync(file, args[i + 1]);
  const out = [...args];
  out.splice(i, 2, '--file', file);
  return { args: out, done() { rmSync(dir, { recursive: true, force: true }); } };
}
