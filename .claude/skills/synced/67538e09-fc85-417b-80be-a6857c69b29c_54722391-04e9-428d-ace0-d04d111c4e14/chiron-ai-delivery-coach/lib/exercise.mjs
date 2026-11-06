// Checks a Phase 6 exercise in the learner's org, by the learner's own prefix only. Prints result lines such as
// EXERCISE|data-model|ok|<detail>, never raw command output, so no sign-in secret reaches the chat.
import { run } from './run.mjs';
import { tutorPrefix } from './prefix.mjs';
import { forPlatform } from './soql.mjs';

const MIN_FIELDS = 4;
const MIN_RECORDS = 10;

class OrgProblem extends Error {}
class CheckProblem extends Error {}

// SOQL LIKE treats _ as a wildcard, and some views (FlowDefinitionView) ignore an escaped one, so queries use the plain
// pattern and the code keeps only names that really start with the tag (ai_mkhan_ but never ai_mkhan2_).
const like = (prefix) => `'${prefix}%'`;
const own = (prefix, rows, field) => (rows ?? []).filter((r) => String(r[field] ?? '').startsWith(prefix));
const quote = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const clean = (s) => String(s ?? '').replace(/[|\r\n]/g, ' ');

function sf(runner, alias, args) {
  const q = forPlatform([...args, '--target-org', alias, '--json']);
  let r;
  try { r = runner('sf', q.args); } finally { q.done(); }
  let body = null;
  try { body = JSON.parse(r.out); } catch { /* not JSON: treated as a failure below */ }
  if (r.code !== 0 || !body || body.status !== 0) {
    const why = `${body?.name ?? ''} ${body?.message ?? r.err ?? ''}`;
    if (/expired|invalid_grant/i.test(why)) throw new OrgProblem(`ORG|expired|${alias}`);
    if (!body || /NoOrgFound|NamedOrgNotFound|NoAuthInfo|AuthInfo|No authorization information/i.test(why)) throw new OrgProblem(`ORG|missing|${alias}`);
    // Anything else is a problem with the check itself, not with the learner's org.
    throw new CheckProblem(clean(why.trim()).slice(0, 200));
  }
  return body.result;
}
const query = (o, soql, tooling = false) => sf(o.runner, o.alias, ['data', 'query', '--query', soql, ...(tooling ? ['--use-tooling-api'] : [])]);

function ownObjects(o) {
  return own(o.prefix, query(o, `SELECT Id, DeveloperName FROM CustomObject WHERE DeveloperName LIKE ${like(o.prefix)}`, true).records, 'DeveloperName');
}

// Custom objects the signed-in user made today without the prefix: built, but not named for a shared sandbox.
function unprefixedToday(o, sobject, nameField) {
  const user = sf(o.runner, o.alias, ['org', 'display']).username;
  const me = query(o, `SELECT Id, Name FROM User WHERE Username = ${quote(user)}`).records?.[0];
  if (!me?.Id) return [];
  // FlowDefinitionView has no CreatedDate or CreatedById: use who last changed it, today.
  const rows = sobject === 'FlowDefinitionView'
    ? (query(o, `SELECT ApiName, LastModifiedBy FROM FlowDefinitionView WHERE LastModifiedDate = TODAY`).records ?? []).filter((r) => r.LastModifiedBy === me.Name)
    : query(o, `SELECT ${nameField} FROM ${sobject} WHERE CreatedById = ${quote(me.Id)} AND CreatedDate = TODAY`, true).records ?? [];
  return rows.map((r) => r[nameField]).filter((n) => n && !n.startsWith(o.prefix));
}

const CHECKS = {
  'data-model'(o) {
    const obj = ownObjects(o)[0];
    if (!obj) {
      const loose = unprefixedToday(o, 'CustomObject', 'DeveloperName');
      return loose.length ? ['unprefixed', loose.map((n) => `${n}__c`).join(', ')] : ['missing', 'custom object'];
    }
    const api = `${obj.DeveloperName}__c`;
    // FieldDefinition lists every field, whatever the signed-in user is allowed to see (a describe hides fields the
    // user has no access to yet, such as before a permission set is assigned).
    const fields = query(o, `SELECT QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = ${quote(api)}`).records ?? [];
    const custom = fields.filter((f) => f.QualifiedApiName?.endsWith('__c'));
    const refs = custom.filter((f) => /^(Lookup|Master-Detail|Hierarchy)\(/.test(f.DataType ?? '')).length;
    // The data load counts records by a name that starts with the tag, so the name must be text.
    if (/^Auto ?Number/i.test(fields.find((f) => f.QualifiedApiName === 'Name')?.DataType ?? '')) return ['short', 'the record name is an auto-number; make it a text name'];
    if (custom.length < MIN_FIELDS) return ['short', `${custom.length} fields, needs ${MIN_FIELDS} or more`];
    if (!refs) return ['short', 'no relationship field'];
    return ['ok', `${api}|${custom.length} fields|${refs} relationship${refs === 1 ? '' : 's'}`];
  },
  interface(o) {
    const obj = ownObjects(o)[0];
    if (!obj) return ['missing', 'custom object'];
    const tag = `[${o.prefix.replace(/_$/, '')}]`;
    const layouts = query(o, `SELECT Name FROM Layout WHERE TableEnumOrId = ${quote(obj.Id)}`, true).records ?? [];
    const mine = layouts.find((l) => l.Name?.startsWith(o.prefix) || l.Name?.startsWith(tag));
    return mine ? ['ok', mine.Name] : ['missing', `page layout named ${o.prefix}...`];
  },
  automation(o) {
    const flows = own(o.prefix, query(o, `SELECT ApiName, ActiveVersionId FROM FlowDefinitionView WHERE ApiName LIKE ${like(o.prefix)}`).records, 'ApiName');
    if (!flows.length) {
      const loose = unprefixedToday(o, 'FlowDefinitionView', 'ApiName');
      return loose.length ? ['unprefixed', loose.join(', ')] : ['missing', 'flow'];
    }
    const active = flows.find((f) => f.ActiveVersionId);
    return active ? ['ok', active.ApiName] : ['short', `${flows[0].ApiName} is not active`];
  },
  'data-load'(o) {
    const api = o.object || (ownObjects(o)[0] && `${ownObjects(o)[0].DeveloperName}__c`);
    // The name goes into a query as it is, so only a plain API name is accepted.
    if (!api || !/^[A-Za-z][A-Za-z0-9_]*$/.test(api)) return ['missing', 'custom object'];
    const n = own(o.prefix, query(o, `SELECT Name FROM ${api} WHERE Name LIKE ${like(o.prefix)} LIMIT 2000`).records, 'Name').length;
    return n >= MIN_RECORDS ? ['ok', `${n} records`] : ['short', `${n} records, needs ${MIN_RECORDS} or more`];
  },
  reporting(o) {
    // Salesforce keeps report folders and dashboard folders apart: one of each, both named for the tag.
    const name = quote(o.prefix.replace(/_$/, ''));
    const folderOf = (type) => query(o, `SELECT Id FROM Folder WHERE DeveloperName = ${name} AND Type = '${type}'`).records?.[0];
    const reportFolder = folderOf('Report');
    const dashboardFolder = folderOf('Dashboard');
    if (!reportFolder) return ['missing', `report folder ${o.prefix.replace(/_$/, '')}`];
    const reports = query(o, `SELECT COUNT() FROM Report WHERE OwnerId = ${quote(reportFolder.Id)}`).totalSize ?? 0;
    const dashboards = dashboardFolder ? query(o, `SELECT COUNT() FROM Dashboard WHERE FolderId = ${quote(dashboardFolder.Id)}`).totalSize ?? 0 : 0;
    if (!reports) return ['missing', 'report'];
    if (!dashboards) return ['missing', 'dashboard'];
    return ['ok', `${reports} report${reports === 1 ? '' : 's'}|${dashboards} dashboard${dashboards === 1 ? '' : 's'}`];
  },
  analysis() {
    return ['ok', 'read-only'];
  },
};

// NetSuite: `suitecloud object:list` from the learner's NetSuite project lists deployed objects as type:scriptid lines.
// Each exercise looks for one script id that starts with the learner's prefix. The CLI cannot count records, so a data
// load is checked from the CSV import results page instead (Chiron reads it with browser-use).
const NS = {
  'data-model': ['customrecordtype', 'customrecord_', 'custom record type'],
  interface: [null, 'custform_', 'custom form'],
  automation: ['workflow', 'customworkflow_', 'workflow'],
  reporting: ['savedsearch', 'customsearch_', 'saved search'],
};

function checkNetSuite(id, { prefix, alias, project, runner }) {
  if (id === 'analysis') return ['ok', 'read-only'];
  if (id === 'data-load') return ['browser', 'csv-import'];
  // Reporting needs both a saved search and a SuiteAnalytics workbook (owner, matching Salesforce's report and dashboard).
  const wanted = id === 'reporting' ? [NS.reporting, ['workbook', 'custworkbook_', 'workbook']] : [NS[id]];
  const found = [];
  for (const [type, kind, label] of wanted) {
    const want = `${kind}${prefix}`;
    const r = runner('suitecloud', ['object:list', ...(type ? ['--type', type] : []), '--scriptid', want], { cwd: project });
    if (r.code !== 0) throw new OrgProblem(`ORG|missing|${alias}`);
    const sid = r.out.split('\n').map((l) => l.trim().split(':').pop()).find((x) => x.startsWith(want));
    if (!sid) return ['missing', label];
    found.push(sid);
  }
  return ['ok', found.join('|')];
}

export function checkExercise(id, { platform = 'salesforce', prefix, alias, object, project, runner = run } = {}) {
  const check = CHECKS[id];
  if (!check) throw new Error(`unknown exercise: ${id}`);
  if (platform !== 'salesforce' && platform !== 'netsuite') throw new Error(`unsupported platform: ${platform}`);
  try {
    const [status, detail] = platform === 'netsuite'
      ? checkNetSuite(id, { prefix, alias, project, runner })
      : check({ prefix, alias, object, runner });
    return [`EXERCISE|${id}|${status}|${String(detail).split('|').map(clean).join('|')}`];
  } catch (e) {
    if (e instanceof OrgProblem) return [e.message];
    if (e instanceof CheckProblem) return [`CHECK|error|${id}|${e.message}`];
    throw e;
  }
}

// Before a deploy: a component with the learner's name that someone else made means stop, never overwrite.
export function checkConflict(names, prefix, { alias, email, runner = run } = {}) {
  const o = { alias, runner };
  try {
    for (const name of names) {
      const isObject = name.endsWith('__c');
      const dev = name.replace(/__c$/, '');
      const rows = isObject
        ? query(o, `SELECT DeveloperName, Description FROM CustomObject WHERE DeveloperName = ${quote(dev)}`, true).records
        : query(o, `SELECT ApiName, Description FROM FlowDefinitionView WHERE ApiName = ${quote(dev)}`).records;
      const row = rows?.[0];
      if (!row) continue;
      // Tags are unique per person, so a component carrying this learner's tag is theirs, even when its description
      // names another of their sign-ins. It is taken only by a different person whose email gives the same tag.
      const ownerEmail = /Created by Chiron for ([^\s"']+@[^\s"'.]+(?:\.[^\s"'.]+)*)/.exec(row.Description ?? '')?.[1];
      if (!ownerEmail) return `CONFLICT|taken|${name}|unknown`;
      const owner = ownerEmail.split('@')[0];
      if (owner === String(email).split('@')[0] || tutorPrefix(ownerEmail) !== prefix) continue;
      return `CONFLICT|taken|${name}|${owner}`;
    }
    return 'CONFLICT|none';
  } catch (e) {
    if (e instanceof OrgProblem) return e.message;
    throw e;
  }
}
