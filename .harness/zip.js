/* Rebuild ledger-app.zip from ledger/.

   This exists because the zip used to be a manual step, and a manual step is a
   step that gets skipped: at one point the deliverable sat three phases behind
   the code — commitments, working capital, price, quality and the customer
   model all landed and the zip still predated every one of them. A stale
   deliverable is worse than no deliverable, because it looks fine.

   So it is now part of the build. `npm run build` regenerates it alongside
   mod.js and check.js, and `npm test` runs the build first, which means the
   zip cannot outlive a change to the app by more than one test run.

   It fails loudly rather than silently: if the archive is not newer than every
   file it was built from, or if no `zip` binary is available, it errors. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ledger');
const OUT = path.join(ROOT, 'ledger-app.zip');

if (!fs.existsSync(SRC)) { console.log('zip.js: no ledger/ directory to package'); process.exit(1); }

const files = fs.readdirSync(SRC).map(f => path.join(SRC, f));
if (!files.length) { console.log('zip.js: ledger/ is empty'); process.exit(1); }

try { fs.unlinkSync(OUT); } catch (e) { /* nothing to remove */ }
try {
  execFileSync('zip', ['-rq', OUT, '.', '-x', '*.git*', 'node_modules/*', '.DS_Store'],
    { cwd: SRC, stdio: ['ignore', 'ignore', 'pipe'] });
} catch (e) {
  console.log('zip.js: could not run zip — ' + (e.stderr ? e.stderr.toString().trim() : e.message));
  process.exit(1);
}

if (!fs.existsSync(OUT)) { console.log('zip.js: archive was not written'); process.exit(1); }

/* freshness: the archive must be newer than everything inside it */
const outMtime = fs.statSync(OUT).mtimeMs;
const stale = files.filter(f => fs.statSync(f).mtimeMs > outMtime).map(f => path.basename(f));
if (stale.length) {
  console.log('zip.js: archive is older than ' + stale.join(', '));
  process.exit(1);
}

console.log('ledger-app.zip rebuilt: ' + fs.statSync(OUT).size + ' bytes (' +
            files.length + ' files, fresh)');
