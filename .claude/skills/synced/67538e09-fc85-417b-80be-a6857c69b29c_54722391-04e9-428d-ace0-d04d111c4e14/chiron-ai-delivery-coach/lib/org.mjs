// Describes a connected Salesforce org without its sign-in secrets: `sf org display` prints the access token, so
// Chiron reads the JSON here and prints only the web address, the user and the connection status.
import { run } from './run.mjs';

export function orgInfo(alias, runner = run) {
  const r = runner('sf', ['org', 'display', '--target-org', alias, '--json']);
  let res;
  try { res = JSON.parse(r.out).result; } catch { res = null; }
  if (r.code !== 0 || !res?.instanceUrl) return `ORG|missing|${alias}`;
  const clean = (s) => String(s ?? '').replace(/[|\r\n]/g, ' ');
  return `ORG|ok|${clean(res.instanceUrl)}|${clean(res.username)}|${clean(res.connectedStatus)}`;
}
