/* Where the backend ends and the game begins.

   There is no server of ours. "The backend" is two things: SQL the player pastes
   into their own Supabase project, and the requests the client makes when they
   have filled in four fields. So the only place this can go wrong is the seam —
   and the seam has two silent failure modes, which is why this file exists:

     - a view that starts making requests of its own (the game stops being a file
       you can open offline, and nothing says so)
     - the credentials form and the code that reads it drifting apart, so a
       signed-in player is told "add your project URL and anon key first" while
       looking straight at the fields they filled in

   Both are checked against the real sources, and the assertions are written as
   relationships — "core reaches the page in one place", "the ids match" — rather
   than as counts of files or lines, which drift on their own.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { at, read, stubDOM } = require('../helpers/env.js');

/* Comments are stripped before scanning: a note explaining that the UI never
   fetches anything should not itself fail a scan for `fetch(`. String literals
   stay, because a string literal is exactly where a table name hides. */
const strip = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\/\/[^\n'"]*$/gm, '');

const sources = (rel) => fs.readdirSync(at(rel))
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({ name: rel + '/' + f, src: strip(fs.readFileSync(at(rel, f), 'utf8')) }));

const scan = (files, re) => files
  .map((f) => {
    const found = (f.src.match(re) || []);
    return found.length ? f.name + ' → ' + [...new Set(found)].slice(0, 4).join(', ') : null;
  })
  .filter(Boolean);

const UI = sources(path.join('packages', 'ui', 'src'));
const CORE = sources(path.join('packages', 'core', 'src'));

/* The API layer, by name, because the tests below make claims about it
   specifically: it is the one file in core that makes requests, and the four
   credential fields and every call home live in it. */
const API_FILE = '10a-cloud-api.js';
/* two views of the same file: stripped, for scanning what the code *does* (a
   comment saying "we never call X" must not count as calling X), and raw, for
   reading what it *documents* — the header table exists in the comments */ 
const apiSource = () => CORE.find((f) => f.name.endsWith(API_FILE)).src;
const apiRaw = () => read('packages', 'core', 'src', API_FILE);

test('the UI cannot reach the network — a request primitive is not even named there', () => {
  /* `navigator.sendBeacon` is in here on purpose: it is a request wearing a
     device-capability name, and it is the one a view would reach for by mistake. */
  const hits = scan(UI, /fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/g);
  assert.deepEqual(hits, [],
    'the UI package makes no requests: it draws, and core talks. Found:\n  ' + hits.join('\n  '));
});

test('the UI uses the device, and the list of what it may touch is short and known', () => {
  /* These four are not the network: clipboard (copy a season code), camera (scan
     a link), service worker (install as an app) and connectivity (decide whether
     to bother syncing). The set is asserted rather than counted, so a fifth
     capability arrives as a deliberate decision in review instead of a diff
     nobody reads — and anything that *is* a request fails test 1 above. */
  const device = new Set();
  for (const f of UI) for (const m of (f.src.match(/navigator\.([A-Za-z]+)/g) || [])) device.add(m.slice(10));
  assert.deepEqual([...device].sort(), ['clipboard', 'mediaDevices', 'onLine', 'serviceWorker'],
    'the UI\'s whole contact with the device is: ' + [...device].sort().join(', ') +
    '\n  If you are adding a capability, add it to this list and say why in the same commit.');
  assert.ok(!device.has('sendBeacon'), 'a beacon is a request, not a capability');
});

test('the UI does not know the backend exists — no URL, no client, no table, no SQL', () => {
  const hits = scan(UI, /supabase|\/rest\/v1|\/auth\/v1|createClient|\bprofiles\b|\bseason_runs\b|on_conflict|CREATE TABLE|POLICY|auth\.uid/g);
  assert.deepEqual(hits, [],
    'nothing in the UI names the backend — no host, no endpoint, no table, no DDL. Found:\n  ' + hits.join('\n  '));
});

test('the UI never holds a credential — not one of the four field names appears', () => {
  const hits = scan(UI, /\bpUrl\b|\bpKey\b|\bpMail\b|\bpPw\b|service_role/g);
  assert.deepEqual(hits, [],
    'the credentials are read by core, straight out of the form, and never pass through a view. Found:\n  ' + hits.join('\n  '));
});

test('core cannot reach the page — no document, no window, no storage', () => {
  /* The type check agrees: packages/core/tsconfig.json compiles with
     "lib": ["es2022"], which has no DOM types in it at all. This is the same
     claim, made against the code rather than the config, so a file that typos its
     way past tsc still fails here. */
  const hits = scan(CORE, /document\.|window\.|getElementById|querySelector|addEventListener|\.innerHTML|localStorage|sessionStorage|globalThis\./g);
  assert.deepEqual(hits, [],
    'core is the game: it renders strings and returns them, and never touches a page. Found:\n  ' + hits.join('\n  '));
});

test('core reaches the page in exactly one place, for exactly one reason', () => {
  const calls = [];
  for (const f of CORE) {
    const found = f.src.match(/\bQ\(|host\.el\b/g) || [];
    if (found.length) calls.push(f.name + ' (' + found.length + ')');
  }
  assert.equal(calls.length, 1,
    'the whole of core\'s contact with the page is one function: reading the four credential fields back out of the form. Found:\n  ' + calls.join('\n  '));
  assert.match(calls[0], new RegExp(API_FILE.replace('.', '\\.')),
    'and that one place is the API file, next to the requests the credentials feed: ' + calls[0]);
});

test('the form and the code that reads it agree on every field name', async () => {
  /* This is the seam's silent failure, and it is checked the way the page does it:
     draw the form, type four values into the fields it drew, then read them back
     with the client's own reader. Rename either side and nothing throws — but the
     credentials come back empty and the player is told to add the project URL they
     are looking at. The expectation is written here as the client's, so the form
     is the side that has to match it. */
  stubDOM();
  /* The host is installed the way the web build installs it — `el: Q`, the UI's
     own `document.getElementById` — rather than with a lookalike, because the
     thing under test is what happens when the page and the client meet. Without
     an installed host, core's `el` returns null and every field reads empty,
     which would make this test pass for the wrong reason on a broken form. */
  const ui = await import('file://' + at('packages', 'ui', 'index.js'));
  ui.install();
  const core = await import('file://' + at('packages', 'core', 'index.js'));
  const drawn = new Set((core.profileModal().match(/id="([^"]+)"/g) || []).map((x) => x.slice(4, -1)));

  const typed = {
    pUrl: 'https://example.supabase.co',
    pKey: 'anon-key-abc123',
    pMail: 'player@example.com',
    pPw: 'correct horse battery staple',
  };
  const missing = Object.keys(typed).filter((id) => !drawn.has(id));
  assert.deepEqual(missing, [],
    'the form does not draw every field the client reads back: missing ' + missing.join(', ') +
    ' (it draws ' + [...drawn].join(', ') + ')');

  for (const [id, value] of Object.entries(typed)) globalThis.document.getElementById(id).value = value;

  const read = core.cloudReadForm();
  assert.deepEqual(read,
    { url: typed.pUrl, key: typed.pKey, email: typed.pMail, password: typed.pPw },
    'what the player types is what the client sends — field for field, nothing guessed and nothing dropped');

  /* the password is in the round trip and nowhere else: it is read from the form
     at the moment of signing in, never stored on the profile */
  const reader = { src: apiSource() };
  const cfgWrites = reader.src.match(/c\.(url|key|email|token|lastSync|lastError)\s*=/g) || [];
  assert.ok(cfgWrites.length > 0, 'the client persists the four non-secret fields on the profile');
  assert.ok(!/c\.(pw|password)\s*=/.test(reader.src),
    'and never the password: `cloudReadForm` returns it to `cloudAuth` and it stops there');

  /* and the request that follows a successful read names the endpoint, so a
     rename cannot leave a live form wired to a dead path */
  assert.match(reader.src, /\/auth\/v1\/signup/, 'the signup path is built where the fields are read');
  assert.match(reader.src, /\/auth\/v1\/token\?grant_type=password/, 'so is the sign-in path');
});

test('the API is one file, and its surface is the five endpoints it documents', () => {
  /* The API layer is `packages/core/src/10a-cloud-api.js`. Two claims, both
     about the shape of the surface rather than its size:

       - every request this game can make is in that one file
       - the set of endpoints is the set in the file's own header table

     A seventh call is therefore a failing test rather than a surprise, and the
     failure prints the endpoint that appeared. */
  const callers = CORE.filter((f) => /fetch\(/.test(f.src)).map((f) => f.name.split('/').pop());
  assert.deepEqual(callers, [API_FILE],
    'the game makes its requests in one file and nowhere else. Found: ' + callers.join(', '));

  /* the endpoints, read out of the code rather than typed twice: every path
     literal that follows a request looks like /auth/v1/... or /rest/v1/... */
  const api = apiSource();
  const found = new Set();
  /* Two spellings, because the code has two: the auth and profiles calls are
     written as paths, and the season calls go through the `seasonUrl()` builder
     — `seasonUrl('seasons?code=eq.…')`. A scan that reads only the literal after
     the builder misses half the surface, which is the mistake §22.59 records. */
  let m;
  const path = /['"]\/(auth|rest)\/v1\/([a-z_]+)/g;
  while ((m = path.exec(api))) found.add('/' + m[1] + '/v1/' + m[2]);
  const built = /seasonUrl\(\s*'([a-z_]+)/g;
  while ((m = built.exec(api))) found.add('/rest/v1/' + m[1]);

  const documented = ['/auth/v1/signup', '/auth/v1/token', '/rest/v1/profiles',
                      '/rest/v1/seasons', '/rest/v1/season_runs'];
  assert.deepEqual([...found].sort(), documented.sort(),
    'the endpoints the code can reach are the ones the file documents: ' +
    [...found].sort().join(', '));

  /* and the header table is not decorative: it names every one of them. Read
     from the raw file — the scan above reads a comment-stripped copy, which by
     definition has no header in it. */
  const raw = apiRaw();
  const header = raw.slice(0, raw.indexOf('*/'));
  const missing = documented.filter((e) => !header.includes(e));
  assert.deepEqual(missing, [],
    'the API file documents every endpoint it can reach. Undocumented: ' + missing.join(', '));

  /* PostgREST needs the anon key on every call and a bearer once there is a
     session — one header builder, so no call can forget it */
  const sites = (api.match(/fetch\(/g) || []).length;
  assert.equal(sites, 10,
    'ten request sites reach those five endpoints (each has a quiet twin or a ' +
    'GET/POST pair). Found: ' + sites + ' — if this is 11, a new call was added ' +
    'and the table in the header needs it too');

  assert.match(api, /h\s*=\s*\{apikey:c\.key/, 'every call carries the project anon key');
  assert.match(api, /if\(c\.token\) h\['Authorization'\] = 'Bearer '/, 'and the session token once there is one');
});

test('the dependency runs one way: core never imports the UI', () => {
  const hits = [];
  for (const f of CORE) {
    const imports = f.src.match(/import[\s\S]*?from\s*['"]([^'"]+)['"]/g) || [];
    for (const i of imports) if (/@ledger\/ui|packages\/ui|\.\.\/ui/.test(i)) hits.push(f.name + ' → ' + i.replace(/\s+/g, ' '));
  }
  assert.deepEqual(hits, [],
    'the UI draws core and core does not know the UI exists. Found:\n  ' + hits.join('\n  '));
});

test('with no credentials, the game is a file — nothing tries to phone home', () => {
  /* The strongest version of "local-first": not that the request fails, but that
     there is no request. `cloudReady()` is the gate, and it is false until a
     player has supplied a URL, a key and a token. */
  const profile = apiSource();
  assert.match(profile, /function cloudReady\(\)\{[\s\S]*?return !!\s*\(c\.url && c\.key && c\.token\)/,
    'cloudReady() is a three-way AND over the player\'s own configuration, so an unconfigured game is an offline game');
  assert.match(profile, /function cloudConfigured\(\)\{[\s\S]*?return !!\s*\(c\.url && c\.key\)/,
    'and cloudConfigured() — the cheaper check — is the same two-way AND, so the background sync returns before it builds a request');
});
