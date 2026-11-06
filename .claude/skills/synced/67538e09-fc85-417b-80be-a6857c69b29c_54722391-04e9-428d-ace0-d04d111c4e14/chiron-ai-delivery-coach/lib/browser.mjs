// Phase 4 checks: the two plugins the course uses, and remote debugging in Chrome or Brave for browser-use.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { connect } from 'node:net';

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return {}; } };

export const defaultClaudeDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');

// Installed: listed by Claude Code for the person (user scope), so it works in every folder. A project-only install
// does not count. Disabled: the person switched it off in settings, which is their choice to change.
export function checkPlugins(claudeDir, required) {
  const installed = readJson(join(claudeDir, 'plugins', 'installed_plugins.json')).plugins || {};
  const enabled = readJson(join(claudeDir, 'settings.json')).enabledPlugins || {};
  const missing = required.filter((k) => ![].concat(installed[k] || []).some((e) => e?.scope === 'user'));
  if (missing.length) return `PLUGINS|missing|${missing.join(',')}`;
  const off = required.filter((k) => enabled[k] === false);
  return off.length ? `PLUGINS|disabled|${off.join(',')}` : 'PLUGINS|ok';
}

// The browsers Plative deploys. Both are built on Chromium, so browser-use works with either the same way.
export const BROWSERS = {
  chrome: { env: 'TUTOR_CHROME_DIR', mac: ['Google', 'Chrome'], win: ['Google', 'Chrome', 'User Data'] },
  brave: { env: 'TUTOR_BRAVE_DIR', mac: ['BraveSoftware', 'Brave-Browser'], win: ['BraveSoftware', 'Brave-Browser', 'User Data'] },
};

export function browserDir(id) {
  const b = BROWSERS[id];
  if (process.env[b.env]) return process.env[b.env];
  if (process.platform === 'win32') return join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), ...b.win);
  return join(homedir(), 'Library', 'Application Support', ...b.mac);
}

// The browser writes DevToolsActivePort when remote debugging is on, and can leave it behind, so the port must answer.
export async function checkBrowser(id, dir) {
  if (!existsSync(dir)) return `BROWSER|missing|${id}`;
  const file = join(dir, 'DevToolsActivePort');
  if (!existsSync(file)) return `BROWSER|off|${id}`;
  const [first, path] = readFileSync(file, 'utf8').split('\n');
  const port = /^\d+$/.test(first) ? Number(first) : 0;
  // Half-written or broken: no usable port, so it is not on in any way browser-use can use.
  if (!(port > 0 && port < 65536) || !path?.startsWith('/devtools/')) return `BROWSER|stale|${id}|unknown`;
  const answers = await new Promise((res) => {
    const s = connect({ host: '127.0.0.1', port });
    const done = (ok) => { s.destroy(); res(ok); };
    s.setTimeout(1000, () => done(false));
    s.once('connect', () => done(true));
    s.once('error', () => done(false));
  });
  return `BROWSER|${answers ? 'ok' : 'stale'}|${id}|${port}`;
}

// No browser named: one line per installed browser, or BROWSER|none when neither is installed.
export async function checkBrowsers(ids = Object.keys(BROWSERS)) {
  const lines = [];
  for (const id of ids) {
    const line = await checkBrowser(id, browserDir(id));
    if (!line.startsWith('BROWSER|missing|')) lines.push(line);
  }
  return lines.length ? lines.join('\n') : 'BROWSER|none';
}
