/* Gate: the feature inventory is true, not just ticked.

   272 rows across §0–14, §19 and §20 sat unticked for most of the rebuild,
   and the standing rule was "unticked is not missing". True, but it is also
   not proof. This gate is the proof, and it comes in two halves:

     1. every countable claim in the document is asserted against the actual
        data tables, so a number that drifts fails the suite instead of
        quietly becoming folklore
     2. the three claims that were simply wrong are re-checked, so a well
        meaning edit cannot put the wrong number back

   Three were wrong. HOUSE_ROLES has 10 roles, not the 20 the document
   claimed. There are 3 save slots plus the autosave, not 4. And there is no
   cap of four companies at all — the limit on how many businesses you can
   run is attention, not a number, and a hard cap was never implemented. The
   document now says what the code does.

   What this gate deliberately does not claim: that a row being ticked means
   the feature is *good*. It means the thing the row names exists and is
   reachable. */
require('./dom.js');
const M = require('./mod.js');
const fs = require('fs');
const path = require('path');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const n = x => Array.isArray(x) ? x.length : (x && typeof x === 'object' ? Object.keys(x).length : NaN);

/* ---------- 1. the countable claims, against the real tables ------------- */
const CLAIMS = [
  ['ASSETS', 13, '§7.1 / §8.8 / §12.14 — 13 asset classes'],
  ['GOODS', 11, '§7.3 / §12.14 — 11 goods tracked on the market'],
  ['TRAITS', 8, '§12.9 — staff have 8 traits'],
  ['DEAL_TYPES', 8, '§3.1 — deal flow, 8 deal types'],
  ['STAFF_ROLES', 5, '§12.9 — staff, 5 roles'],
  ['HOUSE_PERKS', 5, '§12.10 — household, 5 perks'],
  ['HOUSE_ROLES', 10, '§12.10 — household roles (the document said 20)'],
  ['CONTRACT_KINDS', 5, '§12.8 — contracts, 5 kinds'],
  ['ERAS', 7, '§22.14 — seven eras'],
  ['CITIES', 6, '§14.5 — six cities'],
  ['BIZ', 10, '§12.4 — ten business types'],
  ['DIFFS', 7, '§14 — seven difficulty tiers'],
  ['TABS', 5, 'the top-level tab bar'],
  ['SEASON_AXES', 6, 'season score, six weighted axes'],
  ['ROLES', 10, '§2.1 — the cast, ten roles'],
  ['LIFE_EVENTS', 23, '§12.16 — life deck, 23'],
  ['BIZ_EVENTS', 14, '§12.16 — business deck, 14'],
  ['MORE_EVENTS', 27, '§12.16 — wider deck, 27'],
  ['GOV_EVENTS', 11, '§12.16 — governance deck, 11']
];
const seen = [];
CLAIMS.forEach(([k, want, why]) => {
  ck(k in M, k + ' is not reachable from the harness — it cannot be counted');
  if (!(k in M)) return;
  const got = n(M[k]);
  ck(got === want, k + ' has ' + got + ' entries, the document says ' + want + ' — ' + why);
  seen.push(k + ' ' + got);
});
console.log('countable claims : ' + CLAIMS.length + ' checked · ' + seen.join(', '));

/* ---------- 2. the three that were wrong stay right ---------------------- */
const doc = fs.readFileSync(path.join(__dirname, '..', 'FEATURES.md'), 'utf8');
const rowOf = id => {
  const m = doc.match(new RegExp('^\\|\\s*' + id.replace('.', '\\.') + '\\s*\\|(.*)$', 'm'));
  return m ? m[1] : '';
};
const r1210 = rowOf('12.10'), r137 = rowOf('13.7'), r69 = rowOf('6.9');
ck(/\*\*10\*\* roles/.test(r1210), '§12.10 has gone back to claiming 20 household roles');
ck(/\b20 roles\b/.test(r1210) === false, '§12.10 still says "20 roles" somewhere in the row');
ck(/\*\*3\*\* \+ auto/.test(r137), '§13.7 has gone back to claiming 4 save slots');
ck(/no hard cap/.test(r69), '§6.9 has gone back to claiming a cap of four companies');
ck(/\[x\]/.test(r69), '§6.9 is not ticked');
console.log('corrected claims : 12.10 roles · 13.7 slots · 6.9 no cap — all three still true in the document');

/* the save slots are where they are claimed to be — counted on the screen the
   game actually draws, not grepped out of the source. The source grep could not
   see a slot the screen builds in a loop, so it reported a screen with three
   buttons as a screen with none: a gate that cannot see the control is a gate
   that lies about it. This renders Legacy > Settings and reads the slots off it.
   `S.grp` is cleared first because a collapsed group renders no body at all, and
   a check that passes by finding nothing is the other way a gate lies. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
const ST = M.getS();
ST.grp = {};
M.UI.tab = 'ledger'; M.UI.sub = 'settings';
/* rendered the way the audit renders it: the screen, then the grouping the
   route would apply to it */
const shtml = M.groupRoute(M.viewLedgerSettings(), 'legacy/settings');
const slots = (shtml.match(/data-s="(s\d)"/g) || []).map(s => s.slice(-2, -1));
const uniq = Array.from(new Set(slots)).sort();
ck(uniq.length === 3, 'the settings screen offers ' + uniq.length + ' save slots, the document says 3');
ck((slots.length) === 6, 'the settings screen draws ' + slots.length + ' slot controls, not a Save and a Load per slot (6)');
const src = fs.readFileSync(path.join(__dirname, 'check.js'), 'utf8');
ck(/SKEY\+\(slot\|\|'auto'\)/.test(src), 'the autosave slot is gone');
console.log('save slots       : ' + uniq.join(', ') + ' + auto (rendered, not grepped)');

/* ---------- 3. no inventory row is left unticked ------------------------- */
const rows = doc.split('\n').filter(l => /^\|\s*\d+(\.\d+)?\s*\|.*\|\s*\[( |x|~|[a-z])\]/.test(l));
const open = rows.filter(l => /\|\s*\[ \]\s*\|?\s*$/.test(l));
ck(open.length === 0, open.length + ' inventory row(s) still unticked: ' +
  open.slice(0, 5).map(l => l.split('|')[1].trim()).join(', '));
console.log('inventory rows   : ' + rows.length + ' · ' + (rows.length - open.length) +
            ' closed · ' + open.length + ' open');


/* ---------- 4. the build stamp identifies the copy you are running ------- */
/* A bug report arrived against code that had already been fixed, because the
   file being run was a download from before the fix and its line numbers
   belonged to a build nobody had open. The stamp is a hash of the running
   script, so it changes with every edit and needs no one to bump a version.
   Asserted in a real browser: it must be present, and it must be the same
   hash on two renders of the same build - hashing the whole document looked
   right and was not, because the page carries live state and the stamp
   changed between renders and identified nothing. */
async function stampE2E() {
  const { chromium } = require('playwright');
  const http = require('http'), fsx = require('fs'), pp = require('path');
  const ROOT = pp.resolve(__dirname, '..', 'ledger');
  const MIME = { '.webmanifest': 'application/manifest+json', '.js': 'text/javascript',
                 '.css': 'text/css', '.html': 'text/html' };
  const srv = http.createServer((rq, rs) => {
    const rel = decodeURIComponent(rq.url.split('?')[0]);
    fsx.readFile(pp.join(ROOT, rel), (e, d) => {
      if (e) { rs.writeHead(404); rs.end('no'); return; }
      rs.writeHead(200, { 'Content-Type': MIME[pp.extname(rel)] || 'text/html' }); rs.end(d);
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch();
  const page = await b.newPage();
  await page.goto('http://127.0.0.1:' + srv.address().port + '/index.html', { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    /* the opening screen has to carry it too. Settings is where a stamp
       belongs and the last place anyone looks; the point of the stamp is to
       identify a file before you have started playing it. */
    const start = (document.getElementById('main').textContent.match(/build\s+([0-9a-f]{8})/) || [])[1] || '';
    newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
    const read = () => {
      UI.tab = 'legacy'; UI.sub = 'settings'; render();
      const m = document.getElementById('main').innerHTML.match(/<b class="mono">([0-9a-f]+)<\/b>/);
      return m ? m[1] : '';
    };
    const first = read();
    advanceQuarter();                       /* change the world, not the code */
    UI.modal = null;
    return { start, first, after: read() };
  });
  await b.close(); srv.close();
  return r;
}

const finish = extra => {
  const all = bad.concat(extra || []);
  if (all.length) { console.log('\nINVENTORY ISSUES:'); all.forEach(b => console.log(' - ' + b)); process.exit(1); }
  console.log('\nINVENTORY CLEAN');
};
stampE2E().then(r => {
  ck(/^[0-9a-f]{8}$/.test(r.first), 'the settings screen shows no build stamp, or a malformed one: "' + r.first + '"');
  ck(/^[0-9a-f]{8}$/.test(r.start), 'the opening screen shows no build stamp — a stale copy cannot be identified before you play it');
  ck(r.start === r.first, 'the opening screen says ' + r.start + ' and Settings says ' + r.first);
  ck(r.first === r.after, 'the build stamp changes between two renders of the same build (' +
     r.first + ' → ' + r.after + ') — it is hashing live state, not the code');
  console.log('build stamp       : ' + r.first + ' · opening screen and Settings agree · stable across a quarter');
  finish([]);
}).catch(e => { console.log('\nSTAMP E2E FAILED: ' + e.message); process.exit(1); });

