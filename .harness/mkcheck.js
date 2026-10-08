/* Regenerate check.js - the page script the gates drive.

   It comes from dist/index.html, which tools/rebuild.sh builds out of
   packages/core and packages/ui. So the gates test the file the game actually
   ships, and they test it *after* it has been through the module pipeline,
   not just after the last hand edit. build.js reads check.js and writes
   mod.js, so this MUST be re-run after every edit - `npm test` does it.

   Falls back to the single file if dist has not been built yet. */
const fs = require('fs');
const candidates = [
  __dirname + '/../dist/index.html',
  __dirname + '/../ledger/index.html'
];
const file = candidates.find(f => fs.existsSync(f));
if (!file) throw new Error('no dist/index.html and no ledger/index.html - run tools/rebuild.sh');
const html = fs.readFileSync(file, 'utf8');
const a = html.indexOf('<script>');
const b = html.indexOf('</script>', a);
if (a < 0 || b < 0) throw new Error('script block not found in ' + file);
const body = html.slice(a + '<script>'.length, b);
fs.writeFileSync(__dirname + '/check.js', body);
console.log('check.js regenerated from ' + file.replace(/^.*\//, '') + ': ' + body.length + ' chars');
