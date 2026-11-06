// The coaching looks that need code: a screenshot of what the learner sees, and a readable copy of another Claude Code
// session. Chiron asks first each time, reads only what the learner agreed to, and never keeps the result: the picture is
// deleted by the caller after reading, and the conversation is printed, not stored.
import { readFileSync, readdirSync, existsSync, mkdtempSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run as realRun } from './run.mjs';
import { redact } from './record.mjs';

// A capture smaller than this is blank: macOS writes an empty or near-empty picture until Screen Recording is allowed.
const MIN_CAPTURE_BYTES = 2048;
const TOOL_OUTPUT_MAX = 200;
const COMMAND_MAX = 300;
const LINE_MAX = 600;
const MAX_ENTRIES = 300;

// macOS can say whether the app running Claude Code may capture the screen, with no picture taken. JXA needs the C function
// bound before it can call it.
const PREFLIGHT = "ObjC.import('CoreGraphics'); ObjC.bindFunction('CGPreflightScreenCaptureAccess', ['bool', []]); $.CGPreflightScreenCaptureAccess() /* Preflight */";
const REQUEST = "ObjC.import('CoreGraphics'); ObjC.bindFunction('CGRequestScreenCaptureAccess', ['bool', []]); $.CGRequestScreenCaptureAccess() /* Request */";
// The app that needs the permission is the one Claude Code runs in.
const HOST_APP = { vscode: 'Visual Studio Code', Apple_Terminal: 'Terminal', 'iTerm.app': 'iTerm' };

// How many displays are connected. If the Mac cannot say, one.
function displayCount(run) {
  const r = run('/usr/bin/osascript', ['-l', 'JavaScript', '-e', "ObjC.import('AppKit'); $.NSScreen.screens.count /* NSScreen */"]);
  const n = Number(r.out.trim());
  return r.code === 0 && Number.isInteger(n) && n >= 1 && n <= 8 ? n : 1;
}

function screenPermission(run) {
  const r = run('/usr/bin/osascript', ['-l', 'JavaScript', '-e', PREFLIGHT]);
  if (r.code !== 0) return 'unknown';
  return r.out.trim() === 'true' ? 'granted' : r.out.trim() === 'false' ? 'denied' : 'unknown';
}

// Picture folders from earlier looks. Each look deletes its own pictures; this removes any folder an interrupted look left behind.
function sweepShots(root, now = Date.now()) {
  try {
    for (const name of readdirSync(root)) {
      if (!name.startsWith('chiron-shot-')) continue;
      const p = join(root, name);
      if (now - statSync(p).mtimeMs > 3600e3) rmSync(p, { recursive: true, force: true });
    }
  } catch { /* a folder we cannot read or remove is left alone */ }
}

export function screenshot({ os = process.platform === 'win32' ? 'windows' : 'mac', run = realRun, dir = mkdtempSync(join(tmpdir(), 'chiron-shot-')), env = process.env, sweepRoot = tmpdir() } = {}) {
  sweepShots(sweepRoot);
  // Ask first: a denied permission is reported before any picture is taken, naming the app to switch on. The system prompt is
  // shown once so the person can approve it there.
  if (os === 'mac' && screenPermission(run) === 'denied') {
    run('/usr/bin/osascript', ['-l', 'JavaScript', '-e', REQUEST]);
    return `SHOT|blocked|screen-recording|${HOST_APP[env.TERM_PROGRAM] ?? ''}`;
  }
  if (os === 'windows') {
    // One picture of the whole virtual desktop, however many screens there are.
    const path = join(dir, 'screen-1.png');
    const script = `Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $b=[System.Windows.Forms.SystemInformation]::VirtualScreen; ` +
      `$bmp=New-Object System.Drawing.Bitmap $b.Width,$b.Height; $g=[System.Drawing.Graphics]::FromImage($bmp); ` +
      `$g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size); $bmp.Save('${path.replace(/'/g, "''")}')`;
    const w = run('powershell', ['-NoProfile', '-NonInteractive', '-Command', script]);
    if (w.code !== 0) { rmSync(path, { force: true }); return 'SHOT|failed'; }
    if (!existsSync(path) || statSync(path).size < MIN_CAPTURE_BYTES) { rmSync(path, { force: true }); return 'SHOT|failed'; }
    return `SHOT|ok|${path}`;
  }
  // Mac: one picture per display, because the error can be on any screen. screencapture saves only the main display for a
  // single file name, and one display per name when given several.
  const paths = Array.from({ length: displayCount(run) }, (_, k) => join(dir, `screen-${k + 1}.png`));
  const r = run('/usr/sbin/screencapture', ['-x', ...paths]);
  if (r.code !== 0) { paths.forEach((x) => rmSync(x, { force: true })); return 'SHOT|failed'; }
  // A display whose picture is blank is dropped. If every one is blank, Screen Recording is not allowed yet.
  const good = paths.filter((x) => existsSync(x) && statSync(x).size >= MIN_CAPTURE_BYTES);
  paths.filter((x) => !good.includes(x)).forEach((x) => rmSync(x, { force: true }));
  return good.length ? `SHOT|ok|${good.join('|')}` : 'SHOT|blocked|screen-recording';
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n)}...` : s);
const oneLine = (s) => redact(String(s)).replace(/\s+/g, ' ').trim();

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map((b) => (typeof b === 'string' ? b : b?.type === 'text' ? b.text : b?.type === 'tool_result' ? textOf(b.content) : '')).join(' ');
}

// What was asked and answered in one session, and the commands run, shortened. Looks in every project folder.
export function sessionRead(id, projectsDir) {
  const missing = `SESSION|missing|${id}`;
  if (!/^[A-Za-z0-9-]{6,64}$/.test(id) || !existsSync(projectsDir)) return missing;
  let file = null;
  try {
    for (const d of readdirSync(projectsDir)) {
      const f = join(projectsDir, d, `${id}.jsonl`);
      if (existsSync(f)) { file = f; break; }
    }
  } catch { return missing; } // a folder that cannot be read is the same as a session that cannot be found
  if (!file) return missing;
  const out = [];
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    let e;
    try { e = JSON.parse(raw); } catch { continue; }
    const content = e?.message?.content;
    if (e?.type === 'user') {
      const blocks = Array.isArray(content) ? content : [];
      const result = blocks.find((b) => b?.type === 'tool_result');
      if (result) out.push(`Result: ${clip(oneLine(textOf(result.content)), TOOL_OUTPUT_MAX)}`);
      else out.push(`You: ${clip(oneLine(textOf(content)), LINE_MAX)}`);
    } else if (e?.type === 'assistant' && Array.isArray(content)) {
      for (const b of content) {
        if (b?.type === 'text' && b.text?.trim()) out.push(`Claude: ${clip(oneLine(b.text), LINE_MAX)}`);
        else if (b?.type === 'tool_use') out.push(`Ran: ${clip(oneLine(b.input?.command ?? b.input?.file_path ?? b.name), COMMAND_MAX)}`);
      }
    }
  }
  return out.slice(-MAX_ENTRIES).join('\n') || `SESSION|empty|${id}`;
}
