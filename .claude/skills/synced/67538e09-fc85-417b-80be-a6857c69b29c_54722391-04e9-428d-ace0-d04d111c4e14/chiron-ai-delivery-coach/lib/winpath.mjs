// Windows: a window opened before the installer ran has the old PATH, so tools installed a minute ago look missing.
// The registry holds the current PATH; adding what is missing from it lets Chiron find the new tools without a restart.
import { spawnSync } from 'node:child_process';

// Adds each registry folder that the current PATH lacks. %NAME% parts are filled in from the environment.
export function mergePath(current, registryPaths, env = process.env) {
  const have = new Set(current.split(';').filter(Boolean).map((p) => p.toLowerCase().replace(/[\\/]+$/, '')));
  const out = current.split(';').filter(Boolean);
  for (const raw of registryPaths.flatMap((v) => v.split(';'))) {
    const p = raw.trim().replace(/%([^%]+)%/g, (m, n) => env[n] ?? env[n.toUpperCase()] ?? m);
    if (!p || p.includes('%')) continue;
    const key = p.toLowerCase().replace(/[\\/]+$/, '');
    if (!have.has(key)) { have.add(key); out.push(p); }
  }
  return out.join(';');
}

const regPath = (key) => {
  const r = spawnSync('reg', ['query', key, '/v', 'Path'], { encoding: 'utf8', windowsHide: true });
  const m = r.status === 0 && /REG_(?:EXPAND_)?SZ\s+(.*)/.exec(r.stdout || '');
  return m ? m[1].trim() : '';
};

export function refreshPath(platform = process.platform) {
  if (platform !== 'win32') return;
  const key = Object.keys(process.env).find((k) => k.toLowerCase() === 'path') || 'Path';
  try {
    process.env[key] = mergePath(process.env[key] || '', [
      regPath('HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment'),
      regPath('HKCU\\Environment'),
    ]);
  } catch { /* keep the PATH this window has */ }
}
