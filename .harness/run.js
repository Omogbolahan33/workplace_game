/* Gate runner.

   Runs every gate in order and reports the tally, so the suite is one command
   (`npm test`) rather than a shell loop that has to be remembered.

   `escapes` came last of all and was found by looking at a screenshot: every
   structural gate passed while the opening screen printed a literal \u2212.
   `react-route` is the gate for the step after the screens: which routes React
   draws whole, and whether a change of state re-renders in place. `react-shell`
   is the same claim for the chrome above the route - the header, the tab strip,
   its second level and the hint - which the app draws now.

   Order matters only for the report: a gate that fails is reported and the
   rest still run, because a single broken gate should not hide the other
   twenty-one. The exit code is 1 if anything failed, so it can be wired to CI.

   The build step must have been run first (npm run build) — it rebuilds
   dist/index.html from packages/, and mod.js and check.js from that. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GATES = ['render', 'gov', 'portfolio', 'disc', 'slider', 'anim', 'nego',
  'house', 'prof', 'hours', 'nav', 'dedupe', 'why', 'group', 'next', 'era', 'mobile',
  'commit', 'wc', 'price', 'quality', 'market', 'levers', 'partner', 'inventory', 'reach',
  'season', 'qr', 'modules', 'headless', 'types', 'audit', 'disabled', 'react-screen', 'escapes',
  'react-route', 'react-shell', 'single', 'appshell', 'rn', 'phone', 'portable'];

if (!fs.existsSync(path.join(__dirname, 'mod.js'))) {
  console.log('mod.js is missing — run `npm run build` first.');
  process.exit(1);
}

const only = process.argv[2];
const gates = only ? GATES.filter(g => g.includes(only)) : GATES;

let pass = 0;
const failed = [];
const t0 = Date.now();

for (const g of gates) {
  const file = path.join(__dirname, g + '.js');
  if (!fs.existsSync(file)) { failed.push([g, 'no such gate']); continue; }
  let out = '';
  try {
    out = execFileSync('node', [file], { cwd: __dirname, timeout: 300000,
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }
  if (/CLEAN|OK/.test(out)) {
    pass++;
    console.log('  pass  ' + g);
  } else {
    failed.push([g, out.trim().split('\n').slice(-4).join('\n        ')]);
    console.log('  FAIL  ' + g);
  }
}

console.log('');
console.log(GATES.length + ' gates · ' + pass + ' passed · ' + failed.length +
            ' failed · ' + Math.round((Date.now() - t0) / 1000) + 's');
if (failed.length) {
  console.log('');
  failed.forEach(([g, why]) => console.log(g + ':\n        ' + why));
  process.exit(1);
}
console.log('ALL GATES CLEAN');
