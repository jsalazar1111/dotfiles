// The optional cleanup after the demo: only components carrying the learner's own prefix, listed first, removed in
// dependency order, and never forced. Salesforce only: the SuiteCloud tools cannot delete objects, so NetSuite cleanup is
// guided in the NetSuite UI (modules/phase-8-demo.md).
import { run } from './run.mjs';
import { forPlatform } from './soql.mjs';
import { tutorPrefix } from './prefix.mjs';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

// Plain LIKE pattern, then an exact check in code (some Salesforce views ignore an escaped wildcard).
const like = (prefix) => `'${prefix}%'`;
// A tagged name starts with the tag, or with the tag and a space instead of its last underscore ("ai_mkhan Test Account").
const tagged = (prefix, name) => String(name ?? '').startsWith(prefix) || String(name ?? '').startsWith(`${prefix.replace(/_$/, '')} `);
// Standard objects where Claude may leave tagged test records, such as an account for a renewal to link to.
const STANDARD = ['Account', 'Contact', 'Opportunity'];
const quote = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const clean = (s) => String(s ?? '').replace(/[|\r\n]/g, ' ').trim();

function sf(o, args, opts) {
  const q = forPlatform([...args, '--target-org', o.alias, '--json']);
  let r;
  try { r = o.runner('sf', q.args, opts); } finally { q.done(); }
  let body = null;
  try { body = JSON.parse(r.out); } catch { /* reported below */ }
  // A failed deploy puts its reason in the result, not in the message.
  const why = body?.message || body?.result?.deletedSource?.find((d) => d.error)?.error || r.err;
  return { ok: r.code === 0 && body?.status === 0, result: body?.result, message: why };
}
const rows = (o, soql, tooling = false) => sf(o, ['data', 'query', '--query', soql, ...(tooling ? ['--use-tooling-api'] : [])]).result?.records ?? [];

// Two people can share a tag (christopher.anderson and christopher.andrews are both ai_christopher_). A component whose
// description says it was made for someone else with the same tag is not the learner's, so it never goes on the list.
// A component with no such note stays: nothing shows it belongs to anyone else.
function madeForSomeoneElse(description, prefix, email) {
  const owner = /Created by Chiron for ([^\s"']+@[^\s"'.]+(?:\.[^\s"'.]+)*)/.exec(description ?? '')?.[1];
  if (!owner || !email) return false;
  return owner.split('@')[0] !== String(email).split('@')[0] && tutorPrefix(owner) === prefix;
}

// Records go with their object, so they are counted for the list, not deleted on their own.
export function listOwn(prefix, { alias, runner = run, email } = {}) {
  const o = { alias, runner };
  const objects = rows(o, `SELECT Id, DeveloperName, Description FROM CustomObject WHERE DeveloperName LIKE ${like(prefix)}`, true)
    .filter((r) => r.DeveloperName?.startsWith(prefix) && !madeForSomeoneElse(r.Description, prefix, email));
  const components = [];
  let records = 0;
  for (const obj of objects) {
    const api = `${obj.DeveloperName}__c`;
    records += rows(o, `SELECT Name FROM ${api} WHERE Name LIKE ${like(prefix)} LIMIT 2000`).filter((r) => r.Name?.startsWith(prefix)).length;
    for (const l of rows(o, `SELECT Name FROM Layout WHERE TableEnumOrId = ${quote(obj.Id)}`, true)) {
      if (l.Name?.startsWith(prefix)) components.push({ type: 'Layout', name: `${api}-${l.Name}` });
    }
  }
  for (const f of rows(o, `SELECT ApiName, DurableId, ActiveVersionId, Description FROM FlowDefinitionView WHERE ApiName LIKE ${like(prefix)}`).filter((r) => r.ApiName?.startsWith(prefix) && !madeForSomeoneElse(r.Description, prefix, email))) {
    components.push({ type: 'Flow', name: f.ApiName, definitionId: f.DurableId, active: Boolean(f.ActiveVersionId) });
  }
  // Report folders and dashboard folders are separate in Salesforce: one of each, both named for the tag.
  const folderOf = (type) => rows(o, `SELECT Id, DeveloperName FROM Folder WHERE DeveloperName = ${quote(prefix.replace(/_$/, ''))} AND Type = '${type}'`)[0];
  const dashboardFolder = folderOf('Dashboard');
  const reportFolder = folderOf('Report');
  if (dashboardFolder) {
    for (const d of rows(o, `SELECT DeveloperName FROM Dashboard WHERE FolderId = ${quote(dashboardFolder.Id)}`)) components.push({ type: 'Dashboard', name: `${dashboardFolder.DeveloperName}/${d.DeveloperName}` });
  }
  if (reportFolder) {
    for (const r of rows(o, `SELECT DeveloperName FROM Report WHERE OwnerId = ${quote(reportFolder.Id)}`)) components.push({ type: 'Report', name: `${reportFolder.DeveloperName}/${r.DeveloperName}` });
  }
  for (const obj of objects) components.push({ type: 'CustomObject', name: `${obj.DeveloperName}__c` });
  const tag = prefix.replace(/_$/, '');
  const standardRecords = [];
  for (const sobject of STANDARD) {
    for (const r of rows(o, `SELECT Id, Name FROM ${sobject} WHERE Name LIKE '${tag}%' LIMIT 200`)) {
      if (tagged(prefix, r.Name)) standardRecords.push({ sobject, id: r.Id, name: r.Name });
    }
  }
  return { records, components, standardRecords };
}

export function deleteOwn(list, { alias, runner = run, confirmed = false, cwd } = {}) {
  if (confirmed !== true) throw new Error('cleanup needs the learner to confirm the list first');
  const o = { alias, runner };
  const lines = [];
  for (const c of list.components) {
    const item = `${c.type}:${c.name}`;
    // An active flow cannot be deleted: switch it off first.
    if (c.type === 'Flow' && c.active) {
      sf(o, ['data', 'update', 'record', '--use-tooling-api', '--sobject', 'FlowDefinition', '--record-id', c.definitionId, '--values', 'Metadata=\'{"activeVersionNumber":0}\'']);
    }
    // A flow goes version by version through the Tooling API: the metadata delete fails on some flows ("insufficient access rights
    // on cross-reference id") even when they are switched off.
    if (c.type === 'Flow') {
      const versions = sf(o, ['data', 'query', '--use-tooling-api', '--query', `SELECT Id FROM Flow WHERE DefinitionId = ${quote(c.definitionId)}`]);
      const ids = (versions.result?.records ?? []).map((v) => v.Id);
      const failed = ids.map((id) => sf(o, ['data', 'delete', 'record', '--use-tooling-api', '--sobject', 'Flow', '--record-id', id])).find((r) => !r.ok);
      lines.push(!versions.ok || !ids.length ? `CLEANUP|kept|${item}|${clean(versions.message) || 'its versions were not found'}`
        : failed ? `CLEANUP|kept|${item}|${clean(failed.message) || 'not deleted'}` : `CLEANUP|deleted|${item}`);
      continue;
    }
    // sf project delete source only runs inside a Salesforce project folder: the learner's practice project.
    if (cwd && !existsSync(cwd)) { lines.push(`CLEANUP|kept|${item}|the practice project folder was not found`); continue; }
    const r = sf(o, ['project', 'delete', 'source', '--metadata', item, '--no-prompt'], cwd ? { cwd } : undefined);
    lines.push(r.ok ? `CLEANUP|deleted|${item}` : `CLEANUP|kept|${item}|${clean(r.message) || 'not deleted'}`);
  }
  // Last: tagged test records on standard objects, once nothing of the learner's points at them.
  for (const rec of list.standardRecords ?? []) {
    const item = `${rec.sobject}:${rec.name}`;
    const r = sf(o, ['data', 'delete', 'record', '--sobject', rec.sobject, '--record-id', rec.id]);
    lines.push(r.ok ? `CLEANUP|deleted|${item}` : `CLEANUP|kept|${item}|${clean(r.message) || 'not deleted'}`);
  }
  return lines;
}

// The list the learner is shown is written down, and cleanup-run deletes that list and nothing else. Reading it uses it up.
export function saveList(list, file) {
  writeFileSync(file, JSON.stringify(list));
}
export function loadList(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { throw new Error('run cleanup-list first, so the learner can confirm what goes'); }
  rmSync(file, { force: true });
  return JSON.parse(text);
}
