/* Keep packages/flat in step with the section files.

   `packages/flat` is the plain-text copy of the sections as the module converter
   was handed them. Nothing reads it at build time — it exists so that the day
   anyone re-cuts the sections from the reference file (`tools/split.mjs
   --bootstrap`), the work done in the section files is not silently reverted. That means an
   edit that is not mirrored is an edit with an expiry date, and the `modules`
   gate fails when it finds one.

   It was a hand ritual until §22.60, when splitting the API layer out of core
   left five sections unmirrored and only the gate knew. Now it is one command:

     node tools/mirror.mjs            copy src → flat, report what moved
     node tools/mirror.mjs --check    report and exit 1 if anything is out of
                                      step, without writing (for CI)

   Two deliberate rules, both matching the gate:
     - `00-host.js` is hand-written and never the bootstrap's output,
       so it is not mirrored.
     - a file that exists in `flat` but no longer in `src` is *removed*, because a
       stale record is worse than a missing one: it would restore code that was
       deliberately taken out.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const KINDS = ['core', 'ui'];
const SKIP = new Set(['00-host.js']);
const check = process.argv.includes('--check');

let written = 0, removed = 0, same = 0;
const stale = [];

for (const kind of KINDS) {
  const srcDir = path.join(ROOT, 'packages', kind, 'src');
  const flatDir = path.join(ROOT, 'packages', 'flat', kind, 'src');
  if (!fs.existsSync(srcDir)) continue;
  if (!check) fs.mkdirSync(flatDir, { recursive: true });

  const srcFiles = fs.readdirSync(srcDir).filter((f) => !SKIP.has(f)).sort();
  for (const f of srcFiles) {
    const a = path.join(srcDir, f);
    const b = path.join(flatDir, f);
    const text = fs.readFileSync(a, 'utf8');
    if (fs.existsSync(b) && fs.readFileSync(b, 'utf8') === text) { same += 1; continue; }
    if (check) { stale.push(kind + '/' + f + (fs.existsSync(b) ? ' (differs)' : ' (missing from flat)')); continue; }
    fs.writeFileSync(b, text);
    console.log('  mirrored  ' + kind + '/' + f);
    written += 1;
  }

  /* files the record still holds but the working copy no longer has */
  if (fs.existsSync(flatDir)) {
    const kept = new Set(srcFiles);
    for (const f of fs.readdirSync(flatDir).sort()) {
      if (kept.has(f) || SKIP.has(f)) continue;
      if (check) { stale.push(kind + '/' + f + ' (stale: not a section any more)'); continue; }
      fs.unlinkSync(path.join(flatDir, f));
      console.log('  dropped   ' + kind + '/' + f + ' — no such section any more');
      removed += 1;
    }
  }
}

const n = (x) => String(x).padStart(2, ' ');
console.log('flat record       : ' + n(same) + ' in step · ' + n(written) + ' written · ' + n(removed) + ' dropped');

if (check && stale.length) {
  console.error('\nOUT OF STEP (' + stale.length + '):');
  for (const s of stale) console.error('  - ' + s);
  console.error('\nRun `npm run mirror` to bring packages/flat back into step.');
  process.exit(1);
}
if (check) console.log('flat record       : in step with every section');
