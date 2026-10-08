/*
  Rebuild the edited sections from the baseline cut + packages/changes.json.

  Why this exists: the sections are hand-edited, and the declared changes are
  the ledger's record of which edits were deliberate. That record has enough
  information in it to put the edits back - every entry holds `was` (the
  statement as it appears in reference/baseline-single-file.html) and `now`
  (the statement as it appears in the built file). So changes.json is not only
  a declaration, it is a patch series, and this applies it.

  The situation that made it worth writing: tools/split.mjs takes ROOT from a
  constant, not from the working directory, so running it "in a copy" of the
  workspace re-cut the real sections from the baseline and reverted every hand
  edit - the four setters, the boot guard, the disabled-control reasons, the
  whole set. Everything was recoverable, but only because the changes were
  declared with their full text. Recovering by hand, from memory, is how a
  rewrite loses a week.

  What it does, per change entry, per was/now pair:
    - if both are statements and their code differs  -> replace one with the other
    - if `was` is empty (a declared addition)        -> insert `now` at its anchor
    - if `was` is a comment with no code             -> insert `now` at its anchor
    - if `was` is gone and `now` is present          -> already applied, skip
  Plus two moves the ledger cannot express, because the code is identical in
  both places and only its file changes: `_syncing` and `_installEvt`.

  Comments are not compared - tools/bundle.mjs compares code only - so this
  restores the code of every declared change and keeps the recorded comment
  where it has one.

  Run: node tools/apply-changes.mjs           (writes the sections, then checks)
       node tools/apply-changes.mjs --dry     (says what it would do, writes nothing)
*/
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'acorn';

const ROOT = path.join(import.meta.dirname, '..');
const DRY = process.argv.includes('--dry');
const changes = JSON.parse(fs.readFileSync(ROOT + '/packages/changes.json', 'utf8'));

/* ---- read the sections, and index the statements in each -------------- */
function sectionFiles() {
  const out = [];
  for (const kind of ['core', 'ui']) {
    const dir = path.join(ROOT, 'packages', kind, 'src');
    for (const f of fs.readdirSync(dir).sort()) out.push({ kind, file: kind + '/src/' + f, path: path.join(dir, f) });
  }
  return out;
}
function statementsOf(text) {
  if (!text || !text.trim()) return [];
  let ast;
  try { ast = parse(text, { ecmaVersion: 2022 }); } catch (e) { return []; }
  return ast.body.map(n => ({ start: n.start, end: n.end, code: text.slice(n.start, n.end) }));
}
const squash = t => t.replace(/\s+/g, ' ').trim();

const files = sectionFiles().map(f => ({ ...f, text: fs.readFileSync(f.path, 'utf8') }));
const index = () => files.map(f => ({
  ...f,
  stmts: statementsOf(f.text).map(s => ({ ...s, key: squash(s.code) }))
}));

/* How many times a statement's code appears across the sections. */
function count(key) {
  let n = 0;
  for (const f of index()) for (const s of f.stmts) if (s.key === key) n++;
  return n;
}
function findOne(key) {
  const hits = [];
  for (const f of files) {
    for (const s of statementsOf(f.text)) {
      if (squash(s.code) === key) hits.push({ file: f, s });
    }
  }
  return hits;
}

/* ---- where a declared addition belongs --------------------------------
   An addition names a binding it acts on (`S = v`, `PROF = p`, `_sea = ...`)
   or a function it follows (`boot`); it goes immediately after that
   declaration, which is where a reader looks for it and where it was before. */
function anchorFor(fullText) {
  const code = statementsOf(fullText).map(s => s.code).join('\n');
  /* a guard like `if (!globalThis.__X__) boot();` anchors on the function it
     calls, not on a binding - it is the last line of the build, not a
     declaration */
  const guard = code.match(/^\s*if\s*\([^)]*\)\s*([A-Za-z_$][\w$]*)\s*\(/m);
  const decl = code.match(/^\s*(?:let|var|const)\s+([A-Za-z_$][\w$]*)/m);
  const assign = code.match(/\b([A-Za-z_$][\w$]*)\s*=[^=]/);
  const fn = code.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
  const name = (decl && decl[1]) || (assign && assign[1]) || (guard && guard[1]) || (fn && fn[1]) || null;
  if (!name) return null;
  const decls = [];
  for (const f of files) {
    for (const s of statementsOf(f.text)) {
      const m = s.code.match(/^\s*(?:let|var|const)\s+([A-Za-z_$][\w$]*)/) || s.code.match(/^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/);
      if (m && m[1] === name) decls.push({ file: f, s, kind: 'decl' });
    }
  }
  if (decls.length === 1) return { where: 'after', ...decls[0], name };
  return { where: 'after', ...(decls[0] || {}), name, ambiguous: decls.length };
}

/* ---- apply ------------------------------------------------------------ */
const applied = [], inserted = [], skipped = [], problems = [];

changes.forEach((entry, ci) => {
  const was = Array.isArray(entry.was) ? entry.was : [entry.was];
  const now = Array.isArray(entry.now) ? entry.now : [entry.now];
  const n = Math.max(was.length, now.length);
  for (let j = 0; j < n; j++) {
    const w = was[j] || '';
    const t = now[j] || '';
    const wStmts = statementsOf(w);
    const tStmts = statementsOf(t);
    if (!tStmts.length) continue;                       /* nothing to place */
    const wKey = wStmts.length ? squash(wStmts[wStmts.length - 1].code) : null;
    const tKey = squash(tStmts.map(s => s.code).join('\n'));

    if (wKey && wKey === squash(t.replace(/^\s*(\/\*[\s\S]*?\*\/|\/\/[^\n]*)?\s*/, ''))) {
      /* the whole `now` is one statement and it is identical to `was` */
      if (count(tKey) === 1) { skipped.push({ ci, entry, why: 'already identical' }); continue; }
    }

    /* the edit this pair describes: the first statement of was -> all of now */
    const from = wStmts.length ? squash(wStmts[0].code) : null;
    const to = tKey;
    const already = count(to) >= 1 && (!from || count(from) === 0);
    if (already) { skipped.push({ ci, entry, why: 'already applied' }); continue; }

    const hits = from ? findOne(from) : [];
    if (hits.length === 1) {
      const { file, s } = hits[0];
      /* replace the statements covered by `was` with the statements in `now` */
      const covered = wStmts.map(x => squash(x.code));
      const all = statementsOf(file.text);
      const first = all.findIndex(x => x.start === s.start);
      let last = first;
      for (let k = 1; k < covered.length; k++) {
        const nxt = all[first + k];
        if (nxt && squash(nxt.code) === covered[k]) last = first + k; else break;
      }
      /* replace from the START OF THE LEADING COMMENT, not from the code.
         The recorded span is [previous statement's end .. this statement's
         end], which is comment plus code; replacing only the code would leave
         the old comment in place and insert the new one in front of it, which
         is how the first attempt at this put 1,144 characters of duplicated
         comments into the bundle. */
      const lead = first === 0 ? 0 : all[first - 1].end;
      const start = lead, end = all[last].end;
      const nextText = file.text.slice(0, start) + t.replace(/^\s*\n/, '\n') + file.text.slice(end);
      if (DRY) console.log('would replace  ' + file.file + ' :: ' + from.slice(0, 60));
      else file.text = nextText;
      applied.push({ ci, entry, where: file.file, what: from });
      continue;
    }
    if (hits.length > 1) { problems.push('[' + ci + '] "' + entry.name + '": the statement to replace appears ' + hits.length + ' times - ' + from.slice(0, 70)); continue; }

    /* not present anywhere: a declared addition. Place it after the binding
       or function it names. */
    const anchor = anchorFor(t);
    if (!anchor || !anchor.file) {
      problems.push('[' + ci + '] "' + entry.name + '": no anchor found for the addition (' + (anchor && anchor.name) + ')');
      continue;
    }
    const ins = statementsOf(anchor.file.text).find(x => x.start === anchor.s.start);
    const at = ins.end;
    const text = t.replace(/^\s*\n/, '\n') + '\n';
    if (DRY) console.log('would insert   ' + anchor.file.file + ' after ' + anchor.name);
    else anchor.file.text = anchor.file.text.slice(0, at) + text + anchor.file.text.slice(at);
    inserted.push({ ci, entry, where: anchor.file.file, after: anchor.name });
  }
});

/* ---- the two moves the ledger cannot express --------------------------
   The code is identical on both sides; only the file it lives in changes,
   because the ui is the side that reads it. Left in the core they would fail
   the module build's DOM check, which is how they were found in the first
   place. */
const MOVES = [
  { name: '_syncing',   code: 'let _syncing = false;',   to: /ui\/src\/01-[^/]*\.js$/, before: /_syncing/ },
  { name: '_installEvt', code: 'let _installEvt = null;', to: /src\/17-act\.js$/, before: /function doInstall\s*\(/ }
];
for (const mv of MOVES) {
  const key = squash(mv.code);
  const hosts = findOne(key);
  if (!hosts.length) { problems.push('the move for ' + mv.name + ': ' + JSON.stringify(mv.code) + ' is not declared anywhere'); continue; }
  const want = files.find(f => mv.to.test(f.path));
  if (!want) { problems.push('the move for ' + mv.name + ': no destination file matches ' + mv.to); continue; }
  if (hosts.length === 1 && hosts[0].file === want) { skipped.push({ entry: { name: 'move ' + mv.name }, why: 'already where it belongs' }); continue; }
  if (hosts.length > 1) { problems.push('the move for ' + mv.name + ': declared ' + hosts.length + ' times'); continue; }
  const from = hosts[0];
  if (DRY) console.log('would move     ' + mv.name + ' from ' + from.file.file + ' to ' + want.file);
  else {
    from.file.text = from.file.text.slice(0, from.s.start) + from.file.text.slice(from.s.end);
    const target = statementsOf(want.text).find(s => mv.before.test(s.code));
    const at = target ? target.start : want.text.length;
    want.text = want.text.slice(0, at) + mv.code + '\n' + want.text.slice(at);
  }
  applied.push({ entry: { name: 'move ' + mv.name }, where: from.file.file + ' -> ' + want.file, what: mv.code });
}

/* ---- write, then check what was claimed ------------------------------- */
if (!DRY) for (const f of files) fs.writeFileSync(f.path, f.text.replace(/\n{3,}/g, '\n\n'));

const after = index();
const present = key => after.reduce((n, f) => n + f.stmts.filter(s => s.key === key).length, 0);
let ok = true;
changes.forEach((entry, ci) => {
  for (const t of (Array.isArray(entry.now) ? entry.now : [entry.now])) {
    const st = statementsOf(t);
    if (!st.length) continue;
    const key = squash(st[st.length - 1].code);
    if (present(key) === 0) { problems.push('[' + ci + '] AFTER: "' + entry.name + '" -> its `now` statement is not in the sections: ' + key.slice(0, 70)); ok = false; }
  }
});

console.log('applied           : ' + applied.length);
for (const a of applied) console.log('   ' + (a.entry.name || '').slice(0, 62) + ' :: ' + a.where);
if (inserted.length) { console.log('inserted          : ' + inserted.length); for (const a of inserted) console.log('   ' + a.entry.name.slice(0, 62) + ' :: ' + a.where + ' after ' + a.after); }
console.log('already in place  : ' + skipped.length);
if (problems.length) {
  console.log('\nPROBLEMS (' + problems.length + '):');
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log(ok ? '\nAPPLIED — every declared change is in the sections; run tools/rebuild.sh' : '\nINCOMPLETE');
process.exit(0);
