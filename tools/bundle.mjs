/*
  Bundle the packages into the single file the game ships as.

  The game is one HTML file. That was a decision about the game, not about its
  source layout, and it does not change: index.html is assembled here from
  packages/core/src (the simulation, in the order it was written) followed by
  packages/ui/src (everything that draws, in the order it was written).

  Why the sections are not interleaved the way the original file was: an
  interleaved build needs a recorded offset for every statement, and a recorded
  offset is wrong the moment anybody edits the file it points into. This build
  found that out the hard way - a one-line edit to a section left the bundler
  reading the old offsets and emitting a truncated file, with no error. Nothing
  here is by offset. Sections are concatenated whole.

  The order is checked rather than assumed:
    1. every statement of the reference file must still be in the bundle,
       exactly once, character for character - the bundle may reorder the
       sections but it may not lose or alter a single one
    2. the sections must run in an order that works, which is what the gates
       are for: 30 of them drive every route, modal and action through a real
       DOM, and a `const` read before it is initialised fails all of them

  Run: node tools/bundle.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import { composeBundle } from './compose.mjs';

import { ROOT, read, exists } from './compose.mjs';

const { sections, js, css, html } = composeBundle();
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), html);
/* the served copy; reference/baseline-single-file.html stays untouched, so
   every build can still be measured against the file the player had */
fs.writeFileSync(path.join(ROOT, 'ledger/index.html'), html);

console.log('sections          : ' + sections.length + ' files (' +
  sections.filter(s => s.kind === 'core').length + ' core, ' +
  sections.filter(s => s.kind === 'ui').length + ' ui) · ' +
  js.split('\n').length.toLocaleString() + ' lines');
/* bytes, not JavaScript string length: the game carries ₦, ▸ and · — 715 of them,
   at three bytes each — so `html.length` reads 1,058,117 for a file that is
   1,058,832 bytes on disk. Two numbers for one file is a discrepancy somebody
   chases at midnight; the rest of the build reports bytes (the payload copier,
   the zip, the tests), so this does too. */
console.log('bundle            : dist/index.html ' + Buffer.byteLength(html).toLocaleString() + ' bytes');
/* what was composed is what is on disk. This block exists because it was not:
   moving the composition into tools/compose.mjs silently dropped the two
   fs.writeFileSync calls, and this build went on printing the size of a file it
   no longer wrote while the statement ledger said everything was present,
   because the ledger reads the sections and compares them to the original - it
   never looked at the file the player is served. A build that reports on a file
   it did not write is the failure mode of every build tool, and the only honest
   check is to read the bytes back. */
const DISK = ['dist/index.html', 'ledger/index.html'].map(f => ({ f, text: read(f) }));
const wrong = DISK.filter(d => d.text !== html);
if (wrong.length) {
  console.log('THE BUNDLE ON DISK IS NOT WHAT WAS COMPOSED:');
  wrong.forEach(d => console.log('  - ' + d.f + ' is ' + d.text.length.toLocaleString() +
    ' chars, composed ' + html.length.toLocaleString()));
  process.exit(1);
}
console.log('on disk           : ' + DISK.map(d => d.f).join(' and ') +
  ' hold exactly what was composed, byte for byte');

/* ---- the statement ledger ----
   Parse both scripts and compare their top-level statements as multisets. A
   statement that was edited, dropped or duplicated shows up by name. */
function statementsOf(script) {
  const ast = acorn.parse(script, { ecmaVersion: 2022, locations: true });
  return ast.body.map((n, i) => {
    const lead = i === 0 ? 0 : ast.body[i - 1].end;
    return {
      code: script.slice(n.start, n.end),      /* the code, comments excluded */
      lead: script.slice(lead, n.start),       /* the comments in front of it */
      line: n.loc.start.line
    };
  });
}
const squash = t => t.replace(/\s+/g, ' ').trim();
const byCode = arr => {
  const m = new Map();
  for (const s of arr) {
    const k = squash(s.code);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
};

const deletions = exists('packages/deletions.json')
  ? JSON.parse(read('packages/deletions.json')) : [];
const deletedCodes = new Set();
for (const d of deletions) {
  for (const s of statementsOf(d.match)) deletedCodes.add(squash(s.code));
}

if (exists('reference/baseline-single-file.html')) {
  const ref = read('reference/baseline-single-file.html');
  const a = ref.lastIndexOf('<script>') + 8, b = ref.lastIndexOf('</script>');
  const refStmts = statementsOf(ref.slice(a, b));
  const cut = js.indexOf('*/') + 2;               /* past the bundle's header */
  const newStmts = statementsOf(js.slice(cut));

  /* edits are declarable too. An unexplained difference from the reference is
     a change nobody wrote down, and that is the thing this check exists to
     catch; a declared one is reported with its reason and moves on. */
  const changes = exists('packages/changes.json')
    ? JSON.parse(read('packages/changes.json')) : [];
  const explainedWas = new Set(), explainedNow = new Set();
  for (const c of changes) {
    for (const w of c.was || []) { const t = statementsOf(w)[0]; if (t) explainedWas.add(squash(t.code)); }
    for (const n of c.now || []) { const t = statementsOf(n)[0]; if (t) explainedNow.add(squash(t.code)); }
  }

  const A = byCode(refStmts), B = byCode(newStmts);
  const missing = [], added = [];
  for (const [k, n] of A) {
    const have = B.get(k) || 0;
    if (have >= n) continue;
    if (deletedCodes.has(k) || explainedWas.has(k)) continue;
    missing.push(k);
  }
  for (const [k, n] of B) {
    const had = A.get(k) || 0;
    if (n > had && !explainedNow.has(k)) added.push(k);
  }

  /* comments are documentation: a statement whose code is unchanged but whose
     leading comment was rewritten is a note to the reader, not a change to the
     game. Reported, not failed. */
  const leadOf = new Map();
  for (const s of refStmts) leadOf.set(squash(s.code), squash(s.lead));
  const notes = newStmts.filter(s => {
    const was = leadOf.get(squash(s.code));
    return was !== undefined && was !== squash(s.lead);
  });

  console.log('statement ledger  : reference ' + refStmts.length +
    ' · bundle ' + newStmts.length);
  for (const d of deletions) console.log('  deleted on purpose: ' + d.name + ' — ' + d.why);
  for (const c of changes) console.log('  changed on purpose: ' + c.name + ' — ' + c.why);
  if (missing.length) {
    console.log('LOST FROM THE REFERENCE (' + missing.length + '):');
    missing.slice(0, 40).forEach(k => console.log('  - ' + k.slice(0, 110)));
  }
  /* An undeclared addition used to fail this build without saying what it was:
     the list was computed, the exit code was set, and nothing was printed, so
     the message a person got was "the build failed" and nothing else. A check
     that will not say what it found is a check people learn to work around. */
  if (added.length) {
    console.log('NEW STATEMENTS NOBODY DECLARED (' + added.length + '):');
    added.slice(0, 40).forEach(k => console.log('  - ' + k.slice(0, 140)));
    console.log('  (add the statement to packages/changes.json with addition: true,');
    console.log('   or run node tools/declared-changes.mjs if it is already declared)');
  }
  /* A declaration has to stay true. Without this, the list of declared changes
     is quietly able to rot: edit a statement a second time and its old "now"
     text is still in changes.json, explaining a difference that no longer
     exists while the *new* difference is explained by nothing - and because the
     old text was declared, the missing check above stays silent. That is exactly
     what happened to the install-prompt listeners, and it is the third time in
     this migration that a gate passed about a file it had never read. */
  const rotten = [];
  for (const c of changes) {
    for (const w of c.was || []) {
      const t = statementsOf(w)[0]; if (!t) continue;
      if (!A.has(squash(t.code))) rotten.push('declared "was" is not a statement of the reference: ' + c.name);
    }
    for (const n of c.now || []) {
      const t = statementsOf(n)[0]; if (!t) continue;
      if (!B.has(squash(t.code))) rotten.push('declared "now" is not in the bundle any more: ' + c.name);
    }
  }
  if (rotten.length) {
    console.log('ROTTED DECLARATIONS (' + rotten.length + '):');
    [...new Set(rotten)].slice(0, 20).forEach(r => console.log('  - ' + r));
    console.log('  (a declared change describes a difference that no longer exists;');
    console.log('   run node tools/declared-changes.mjs to re-transcribe the list)');
  }
  console.log('  comments rewritten: ' + notes.length);
  if (missing.length || added.length || rotten.length) process.exit(1);
  console.log('  every other statement is present, once, character for character');

}
