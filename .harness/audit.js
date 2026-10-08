/* Gate: nothing documented has been lost (the nothing-dropped rule, measured).

   FEATURES.md §15 lists every entry in ACT as it existed before the rebuild,
   and rebuild rule 1 says none of them may disappear without being ticked
   there. For most of this project that rule was honoured by memory and by
   spot checks — which is exactly how `apprentice` and `hire` ended up wired
   into ACT but rendered on no screen anywhere: present in the object, absent
   from the game. Present enough to pass a grep, gone in fact.

   Getting this right took three attempts, and the failures are worth keeping
   in the file because they are the whole problem:

     v1 walked the routes of one mid-game save: 80 "orphans". Garbage — most
        of those actions only exist in states that save never reaches: the
        setup flow, an open negotiation, a household with staff in it.
     v2 called every view* / *Modal function: 64 "orphans". Still garbage —
        it only found builders whose names happen to look like screens, and
        most of these are emitted by row- and card-builders with plain names
        like `houseRow` or `negoBody`.

   Absence from a state is not absence from the game, and matching on naming
   conventions is guessing. So v3 stops looking at names and looks at the
   call graph, which is the only thing that actually answers the question:

     1. read the actions the document claims exist (§15)
     2. parse the ACT object out of the shipped file (brace matched)
     3. parse every function in the file, with its real extent (brace matched)
     4. find which function emits each action's `data-a` control
     5. walk the call graph forward from render() — the only thing standing
        between a function and a player — and see if that function is reachable

   VERIFIED     — its builder is reachable from render(), so a player can get to it
   UNREACHABLE  — the builder exists but nothing calls it, or nothing renders it
   MISSING      — the document claims it, ACT has no such key
   UNDOCUMENTED — in ACT, absent from §15

   The route sweep is kept as corroborating evidence, not as the verdict:
   it says which actions were actually on screen in one particular save. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'ledger');
const HTML = path.join(ROOT, 'index.html');
const DOC  = path.resolve(__dirname, '..', 'FEATURES.md');

const html = fs.readFileSync(HTML, 'utf8');
const doc  = fs.readFileSync(DOC, 'utf8');

/* ---------- 1. what the document claims ---------- */
const claimed = [];
doc.replace(/^\|\s*15\.\d+\s*\|\s*`([a-zA-Z0-9_]+)`\s*\|/gm, (_, k) => { claimed.push(k); return _; });

/* ---------- 2. what ACT actually contains ---------- */
const at = html.indexOf('const ACT = {');
if (at < 0) { console.log('AUDIT FAILED: cannot find the ACT object'); process.exit(1); }
let depth = 0, end = -1;
for (let i = at + 'const ACT = '.length; i < html.length; i++) {
  if (html[i] === '{') depth++;
  else if (html[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const actBlock = html.slice(at, end);
const inAct = new Set();
actBlock.replace(/\n  ([A-Za-z_][A-Za-z0-9_]*)\s*:/g, (_, k) => { inAct.add(k); return _; });

/* ---------- 3. parse every function, brace matched ---------- */
const fns = [];
{
  const re = /\nfunction\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = re.exec(html))) {
    const bodyStart = m.index + m[0].length - 1;
    let d = 0, e = -1;
    for (let i = bodyStart; i < html.length; i++) {
      if (html[i] === '{') d++;
      else if (html[i] === '}') { d--; if (d === 0) { e = i; break; } }
    }
    if (e > bodyStart) fns.push({ name: m[1], start: m.index + 1, end: e, body: html.slice(bodyStart, e) });
  }
}
const byName = new Map();
fns.forEach(f => { if (!byName.has(f.name)) byName.set(f.name, f); });

/* enclosing function for a character position */
function enclosing(pos) {
  let best = null;
  for (const f of fns) if (f.start <= pos && f.end >= pos && (!best || f.start > best.start)) best = f;
  return best;
}

/* ---------- 4. forward reachability from render() ---------- */
const IDENT = /\b([A-Za-z_$][\w$]*)\s*\(/g;
const ALIAS = /[=:,]\s*([A-Za-z_$][\w$]*)\s*(?=[;,\)\]}\n]|$)/g;
const reachable = new Set();
{
  /* render() is the root. Every view* function is an entry point too, because
     the route table dispatches them through a variable — `const v = routeView`
     then `v()` — which a call graph built on `name(` cannot follow, and which
     made an earlier version of this gate report viewBiz() as unreachable when
     it plainly is not. Whether a given view is actually routed to is the nav
     gate's job; this gate only asks what is reachable from the views. */
  const seeds = ['render', 'renderModal', 'toast'].filter(s => byName.has(s));
  fns.forEach(f => { if (/^view/i.test(f.name)) seeds.push(f.name); });
  const queue = [];
  seeds.forEach(s => { if (!reachable.has(s)) { reachable.add(s); queue.push(s); } });
  while (queue.length) {
    const name = queue.shift();
    const f = byName.get(name);
    if (!f) continue;
    let m;
    IDENT.lastIndex = 0;
    while ((m = IDENT.exec(f.body))) {
      const callee = m[1];
      if (reachable.has(callee)) continue;
      if (!byName.has(callee)) continue;
      reachable.add(callee);
      queue.push(callee);
    }
    /* Second kind of edge: an alias — `const v = f;` or `{k: f}` — where f is
       invoked later under another name. Not hypothetical: the route table does
       `const v = routeView` then `v()`, which is why an earlier version of this
       gate declared whyStrip() and sect() unreachable when both plainly run on
       every screen. */
    ALIAS.lastIndex = 0;
    while ((m = ALIAS.exec(f.body))) {
      const ref = m[1];
      if (reachable.has(ref) || !byName.has(ref)) continue;
      reachable.add(ref);
      queue.push(ref);
    }
  }
}
/* every ACT handler is reachable: the document-level click delegate calls it
   by name from UI state, which the call graph cannot see */
inAct.forEach(k => reachable.add(k));

/* ---------- 5. verdict per action ---------- */
const rows = [];
for (const k of claimed) {
  const pos = html.indexOf(`data-a="${k}"`);
  if (pos < 0) {
    rows.push({ k, verdict: inAct.has(k) ? 'UNREACHABLE' : 'MISSING',
                note: 'no data-a control for it anywhere in the file' });
    continue;
  }
  const f = enclosing(pos);
  if (!f) { rows.push({ k, verdict: 'UNREACHABLE', note: 'emitted outside any function' }); continue; }
  rows.push({ k, verdict: reachable.has(f.name) ? 'VERIFIED' : 'UNREACHABLE',
              note: 'emitted by ' + f.name + '()' + (reachable.has(f.name) ? '' : ' — and nothing calls it') });
}

/* Documented actions that are deliberately not reachable. Every one carries a
   reason, because "deliberately" is exactly the kind of claim that quietly
   becomes an excuse for losing things. The register is closed: a new action
   going missing still fails the gate, and if one of these ever becomes
   reachable again the gate reports it as stale rather than staying quiet. */
const KNOWN = {
  profexport: 'removed on purpose — the player rejected file export/import outright: "I won\'t be exporting anything. That\'s not how profile should work." Struck through in §15.',
  profimport: 'removed on purpose — same instruction. Portability is by sync, never by file.',
  '_start':   'internal, not a player action — startbiz and startbizpartner call ACT._start() directly as the shared body behind both, so it never had a button and should not.',
  govsub:     'superseded — governance sub-tabs dispatch through the generic `sub` action like every other second-level strip, so this is dead plumbing. The feature (6 governance sub-tabs) works.',
  hire:       'superseded — since commitments, hiring runs through hireask, which places a lead-timed commitment. hire() is the instant-hire path from before that phase and no longer has a control. Hiring works.'
};

for (const r of rows) {
  if (r.verdict === 'UNREACHABLE' && Object.prototype.hasOwnProperty.call(KNOWN, r.k)) {
    r.verdict = 'ACCOUNTED';
    r.note = KNOWN[r.k];
  }
}

const verified    = rows.filter(r => r.verdict === 'VERIFIED').map(r => r.k);
const accounted   = rows.filter(r => r.verdict === 'ACCOUNTED');
const unreachable = rows.filter(r => r.verdict === 'UNREACHABLE');
const missing     = rows.filter(r => r.verdict === 'MISSING');
/* stale: registered as deliberate but actually reachable again */
const stale = verified.filter(k => Object.prototype.hasOwnProperty.call(KNOWN, k));
const undocumented = [...inAct].filter(k => !claimed.includes(k));

console.log('documented actions (§15)   : ' + claimed.length);
console.log('entries in ACT            : ' + inAct.size);
console.log('functions parsed          : ' + fns.length);
console.log('reachable from render()   : ' + reachable.size);
console.log('');
console.log('VERIFIED     ' + verified.length);
console.log('ACCOUNTED    ' + accounted.length + '  (deliberate, reason recorded)');
console.log('UNREACHABLE  ' + unreachable.length);
console.log('MISSING      ' + missing.length);
console.log('UNDOCUMENTED ' + undocumented.length);
console.log('');
if (accounted.length) {
  console.log('Accounted for — in the document, not in the game, on purpose:');
  accounted.forEach(r => console.log('   - ' + r.k + ': ' + r.note));
  console.log('');
}
if (stale.length) {
  console.log('Stale register — listed as deliberate but reachable again:');
  stale.forEach(k => console.log('   - ' + k));
  console.log('');
}
if (unreachable.length) {
  console.log('Unreachable — the document promises these and no player can get to them:');
  unreachable.forEach(r => console.log('   - ' + r.k + ': ' + r.note));
  console.log('');
}
if (missing.length) {
  console.log('Missing — documented, and ACT has no such key:');
  missing.forEach(r => console.log('   - ' + r.k));
  console.log('');
}
if (undocumented.length) {
  console.log('Undocumented — in ACT, no row in §15:');
  console.log('   ' + undocumented.join(', '));
  console.log('');
}

fs.writeFileSync(path.join(__dirname, 'audit.json'), JSON.stringify(
  { claimed, verified, accounted, unreachable, missing, undocumented, rows }, null, 2));

/* Undocumented fails too, and it always should have.

   The gate printed "UNDOCUMENTED 4 — in ACT, no row in §15" and then went on
   to declare itself CLEAN, because the verdict only tested `unreachable` and
   `missing`. An action in ACT with no row in §15 is precisely the thing the
   rebuild rules forbid — an entry that exists in the game and is unaccounted
   for in the feature list — and the gate was reporting it and passing anyway.
   That is worse than not checking: it looks like it is being watched.

   It came to light because adding four lever actions produced exactly that
   output, and the suite stayed green. */
if (unreachable.length || missing.length || undocumented.length) {
  if (unreachable.length || missing.length)
    console.log('AUDIT FAILED — nothing may be documented-but-unreachable.');
  else
    console.log('AUDIT FAILED — every action in ACT must have a row in §15.');
  process.exit(1);
}
console.log('AUDIT CLEAN — every documented action is reachable, and every action is documented.');
