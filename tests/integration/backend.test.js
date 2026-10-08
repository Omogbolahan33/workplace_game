/* The backend, checked without a network.

   There is no server in CI and there should not be one: the game ships no
   credentials, the schema lives in a player's own Supabase project, and a test
   that needed a database would be a test nobody could run. What *can* be checked
   — and what actually breaks — is the contract: **every table, column and query
   the client uses must exist in the schema the player is told to run.**

   So this file does not restate the contract. It parses both halves:

     * the schema, from `deploy/supabase.sql` (generated from core's CLOUD_SQL)
     * the client, from `packages/core/core.js` — the shipped module — reading the
       REST paths it calls and the JSON bodies it posts

   Rename a column in the SQL and forget the client (or the reverse) and this
   fails by name. That is the whole point: a backend is two files that must agree,
   and nothing else in the repository looks at both.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { ROOT, read } = require('../helpers/env.js');

const sql = read('deploy', 'supabase.sql');
const client = read('packages', 'core', 'core.js');

/* Code, with the prose taken out.

   The API file documents every endpoint in a header table — a table that reads
   exactly like the calls it describes. A parser that scans the raw text finds
   the documentation and counts it as a request, which is how the first version
   of this suite started reporting columns named `id | [{id`. So: parse the
   code, quote the comments. (The same distinction, the other way round, is in
   `tests/unit/boundary.test.js`: there a comment saying "we never call X" must
   not count as calling X. Both directions cost a red test to learn.) */
const bare = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
const clientCode = bare(client);

/* ---- parse the schema ---------------------------------------------------- */

function schema(text) {
  const tables = {};
  /* columns are the lines inside each create table block that name one */
  const re = /create table if not exists (\w+)\s*\(([\s\S]*?)\n\);/g;
  for (const m of text.matchAll(re)) {
    const [, name, body] = m;
    const columns = [];
    for (const line of body.split('\n')) {
      const col = line.trim().replace(/,$/, '');
      const id = col.match(/^([a-z_][a-z0-9_]*)\s+(text|uuid|jsonb|int|bigserial|timestamptz|boolean)/i);
      if (id) columns.push(id[1]);
    }
    const unique = Array.from(body.matchAll(/unique\s*\(([^)]*)\)/g)).map((u) => u[1].split(',').map((s) => s.trim()));
    tables[name] = { columns, unique };
  }
  const rls = Array.from(text.matchAll(/alter table (\w+) enable row level security/g)).map((m) => m[1]);
  const policies = Array.from(text.matchAll(/create policy "(\w+)"\s+on (\w+)\s+for (\w+)/g))
    .map((m) => ({ name: m[1], table: m[2], op: m[3] }));
  return { tables, rls, policies };
}

const DB = schema(sql);

/* ---- parse the client ---------------------------------------------------- */

/* Every REST path the shipped module calls. There are two spellings, because the
   client has two URL builders: a save/profile call writes `/rest/v1/profiles?...`
   inline, and the season calls go through `seasonUrl('seasons?code=eq.…')`. Both
   are read here — a parser that understands one of them would quietly cover half
   the backend. */
function clientQueries(text) {
  const out = [];
  const push = (table, query) => {
    const params = {};
    for (const pair of String(query || '').replace(/^\?/, '').split('&')) {
      const eq = pair.indexOf('=');
      if (eq > 0) params[pair.slice(0, eq)] = decodeURIComponent(pair.slice(eq + 1));
    }
    out.push({ table, params });
  };
  for (const m of text.matchAll(/\/rest\/v1\/(\w+)(\?[^'`"\\]*)?/g)) push(m[1], m[2]);
  /* The season calls build their query with `+`, so the interesting half —
     `&select=player,total,score,submitted_at&order=total.desc` — is in a *second*
     string literal. Reading only the head would leave the columns of the one
     query that names four of them unchecked, which is precisely the query a
     column rename breaks. So the whole argument expression is read, with each
     dynamic part collapsed to a placeholder it cannot be confused for data. */
  for (const m of text.matchAll(/seasonUrl\(/g)) {
    const start = m.index + m[0].length;
    let depth = 0, end = -1;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') { if (depth === 0) { end = i; break; } depth--; }
    }
    const args = text.slice(start, end < 0 ? text.length : end);
    const literals = Array.from(args.matchAll(/'([^']*)'/g)).map((x) => x[1]);
    if (!literals.length) continue;
    const joined = literals.join('X');           /* encodeURIComponent(code) → X */
    const at = joined.indexOf('?');
    push(at < 0 ? joined : joined.slice(0, at), at < 0 ? '' : joined.slice(at + 1));
  }
  return out;
}

/* The top-level keys of every JSON body the client posts, found by scanning to
   the matching paren so a nested object (`config: {...}`) does not leak its keys
   into the column list. */
function clientBodies(text) {
  const out = [];
  const at = text.indexOf('/rest/v1/');
  let from = 0;
  for (;;) {
    const i = text.indexOf('/rest/v1/', from);
    if (i < 0) break;
    /* `seasonUrl()` builds '/rest/v1/' + path, so a bare occurrence is the URL
       builder and not a call site: skip it rather than crash on it. */
    const named = text.slice(i).match(/^\/rest\/v1\/(\w+)/);
    from = i + 1;
    if (!named) continue;
    const table = named[1];
    const call = text.indexOf('JSON.stringify(', i);
    if (call < 0 || call - i > 700) continue;                 /* a read, not a write */
    let j = text.indexOf('{', call);
    if (j < 0) continue;
    const open = text[j - 1] === '[' ? '[' : '{';
    let depth = 0, k = text.indexOf(open, call);
    for (; k < text.length; k++) {
      if (text[k] === open) depth++;
      else if (text[k] === (open === '[' ? ']' : '}')) { depth--; if (!depth) break; }
    }
    const object = text.slice(text.indexOf('{', call), k);
    const keys = [];
    let d = 0;
    for (let p = 0; p < object.length; p++) {
      const ch = object[p];
      if (ch === '{' || ch === '[') d++;
      else if (ch === '}' || ch === ']') d--;
      else if (ch === ':' && d === 1) {
        const before = object.slice(0, p).match(/([A-Za-z_][\w]*)\s*$/);
        if (before) keys.push(before[1]);
      }
    }
    if (keys.length) out.push({ table, keys: Array.from(new Set(keys)) });
  }
  return out;
}

const QUERIES = clientQueries(clientCode);
const BODIES = clientBodies(clientCode);

/* ---- the checks ---------------------------------------------------------- */

test('the schema is the three tables the game uses, all behind RLS', () => {
  assert.deepEqual(Object.keys(DB.tables).sort(), ['profiles', 'season_runs', 'seasons']);
  assert.deepEqual(DB.rls.sort(), ['profiles', 'season_runs', 'seasons'],
    'every table must have row level security on: the anon key is public, and without RLS it reads everything');
  assert.equal(DB.policies.length, 7, 'the schema declares seven policies, found ' + DB.policies.length);
  /* the two that matter most: a profile is private, a leaderboard is not */
  assert.ok(DB.policies.some((p) => p.table === 'profiles' && /own_profile/.test(p.name)),
    'no policy keeps a player’s profile to themselves');
  assert.ok(DB.policies.some((p) => p.table === 'season_runs' && p.op === 'select'),
    'nobody could read the leaderboard');
  for (const p of DB.policies) {
    assert.ok(/auth\.uid\(\)/.test(sql.slice(sql.indexOf('create policy "' + p.name + '"'))),
      'policy "' + p.name + '" does not use auth.uid() — it cannot be enforced against the client');
  }
});

test('the file is generated from the client, not written beside it', () => {
  const core = require(path.join(ROOT, 'packages', 'core', 'index.js'));
  assert.ok(sql.includes(core.CLOUD_SQL.trimEnd()),
    'deploy/supabase.sql has drifted from CLOUD_SQL — run `node tools/supabase-sql.mjs`');
  assert.match(sql, /GENERATED — do not hand-edit/,
    'the file does not say it is generated, so somebody will hand-edit it');
});

test('every column the client reads exists in the schema', () => {
  const problems = [];
  for (const q of QUERIES) {
    const table = DB.tables[q.table];
    if (!table) { problems.push('the client queries a table that is not in the schema: ' + q.table); continue; }
    const names = [];
    if (q.params.select) names.push(...q.params.select.split(',').map((s) => s.trim()).filter((s) => /^[a-z_]+$/.test(s)));
    if (q.params.order) names.push(...q.params.order.split(',').map((s) => s.trim().split('.')[0]));
    if (q.params.on_conflict) names.push(...q.params.on_conflict.split(',').map((s) => s.trim()));
    for (const n of names) {
      if (!table.columns.includes(n)) problems.push(q.table + ' has no column "' + n + '" (the client reads it)');
    }
  }
  assert.deepEqual(problems, [], problems.join('\n  '));
});

test('every field the client writes exists in the schema', () => {
  const problems = [];
  for (const b of BODIES) {
    const table = DB.tables[b.table];
    if (!table) { problems.push('the client writes to ' + b.table + ', which is not in the schema'); continue; }
    for (const k of b.keys) {
      if (!table.columns.includes(k)) problems.push(b.table + ' has no column "' + k + '" (the client sends it)');
    }
  }
  assert.deepEqual(problems, [], problems.join('\n  '));
});

test('the client only ever talks to those three tables', () => {
  const touched = new Set([...QUERIES.map((q) => q.table), ...BODIES.map((b) => b.table)]);
  assert.deepEqual(Array.from(touched).sort(), ['profiles', 'season_runs', 'seasons'],
    'the client reaches for tables the schema does not create: ' + Array.from(touched).join(', '));
});

test('one row per player per season, enforced by the database rather than the client', () => {
  /* The client upserts on (code, user_id); if the unique constraint were only a
     habit, a second device would put the same player on the board twice. */
  assert.deepEqual(DB.tables.season_runs.unique, [['code', 'user_id']],
    'season_runs must be unique on (code, user_id) — that is what makes a re-submit an update');
  assert.equal(DB.tables.profiles.columns.includes('id'), true);
  assert.equal(DB.tables.profiles.unique.length, 0);
});

test('nothing in the client requires a secret', () => {
  /* The whole reason this repository has no .env: a deploy ships no credentials,
     and every player brings their own project. The anon key is public by design,
     the password is never stored, and the only credential kept is a token. */
  const ui = read('packages', 'ui', 'src', '12-view-ledger-settings.js');
  /* the credentials form and the requests it feeds are one file now (§22.60) */
  const coreText = read('packages', 'core', 'src', '10a-cloud-api.js');
  assert.ok(!/SUPABASE_SERVICE_ROLE|service_role/.test(sql + client + ui + coreText),
    'a service-role key appears somewhere — that key must never leave a server');
  assert.match(coreText, /password is never\s+written to storage|never\s+written to storage/,
    'the comment that says the password is not stored has gone; check that it is still true');
  assert.ok(!/localStorage[^\n]*password/.test(coreText), 'a password is being written to storage');
});
