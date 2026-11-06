// Sends the learner's unsent outbox lines to the Chiron progress service. It never blocks the course: a failed send
// leaves the lines for next time and the caller says nothing about it. outbox.sent holds how many outbox lines have
// been accepted, so each line goes once; the service also ignores exact repeats.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BATCH = 50;

async function defaultPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  return { ok: res.ok, status: res.status };
}

const read = (file, fallback) => {
  try { return readFileSync(file, 'utf8'); } catch { return fallback; }
};

// Complete lines only: a last line without its newline may still be mid-write.
function completeLines(dir) {
  const text = read(join(dir, 'outbox.jsonl'), '');
  const parts = text.split('\n');
  parts.pop();
  return parts;
}

function parse(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' && o.stepId ? o : null;
  } catch {
    return null;
  }
}

// 'ok', 'retry' (offline, busy, bad token: try again next time) or 'rejected' (a 4xx the service will always repeat).
async function attempt(post, url, token, lines) {
  let r;
  try { r = await post(url, { token, lines }); } catch { return 'retry'; }
  if (r.ok === true) return 'ok';
  const s = r.status;
  return s >= 400 && s < 500 && ![403, 408, 429].includes(s) ? 'rejected' : 'retry';
}

export async function sync(dir, { url, token, enabled, post = defaultPost } = {}) {
  if (!enabled || !url || !token) return 'SYNC|off';
  const sentFile = join(dir, 'outbox.sent');
  const done = Math.max(0, Number(read(sentFile, '0')) || 0);
  const lines = completeLines(dir).slice(done);
  let profile = {};
  try { profile = JSON.parse(read(join(dir, 'profile.json'), '{}')); } catch { /* no profile */ }
  const entries = lines.map((raw) => ({ rec: parse(raw) }));
  const valid = (list) => list.filter((e) => e.rec).length;
  if (!valid(entries)) {
    if (lines.length) writeFileSync(sentFile, String(done + lines.length));
    return 'SYNC|ok|0';
  }
  if (!profile.email) return `SYNC|queued|${valid(entries)}`;

  let advanced = 0;
  let sentCount = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    const recs = batch.filter((e) => e.rec).map((e) => ({
      email: profile.email,
      org: profile.org ?? '',
      platforms: (profile.platforms ?? []).join(','),
      stepId: e.rec.stepId,
      status: e.rec.status,
      date: e.rec.date ?? '',
      summary: e.rec.summary ?? '',
      jiraKey: e.rec.jiraKey ?? '',
      // The demo step keeps its link as evidence, so that is the demo link.
      demoLink: e.rec.demoLink ?? (e.rec.stepId === 'p8-demo' && /^https:\/\/[^\s[\]]+$/.test(e.rec.output ?? '') ? e.rec.output : ''),
      evidence: e.rec.output ?? '',
      at: e.rec.at ?? '',
      tutorVersion: profile.tutorVersion ?? '',
      // Coaching lines carry their tags and outcome; the service files them on the Coaching tab.
      ...(e.rec.kind === 'coaching' ? { kind: 'coaching', sessionId: e.rec.sessionId ?? '', area: e.rec.area ?? '', helpKind: e.rec.helpKind ?? '', looks: (e.rec.looks ?? []).join(','), outcome: e.rec.outcome ?? '' } : {}),
    }));
    let accepted = recs.length;
    if (recs.length) {
      const first = await attempt(post, url, token, recs);
      if (first === 'retry') return `SYNC|queued|${valid(entries.slice(i))}`;
      if (first === 'rejected') {
        // The service will never take a line in this batch. Send them one at a time so the bad one is skipped and the
        // rest still arrive; anything that merely failed (offline, busy) waits for next time.
        accepted = 0;
        for (let k = 0; k < recs.length; k++) {
          const one = await attempt(post, url, token, [recs[k]]);
          if (one === 'retry') {
            const rest = valid(entries.slice(i)) - accepted - k;
            return `SYNC|queued|${rest + 0}`;
          }
          if (one === 'ok') accepted++;
        }
      }
    }
    advanced += batch.length;
    sentCount += accepted;
    writeFileSync(sentFile, String(done + advanced));
  }
  return `SYNC|ok|${sentCount}`;
}
