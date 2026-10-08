/*
  The shell's own audit — the chrome and the modals, measured the way the routes
  are.

  `tools/textaudit.mjs` measures what each *route* puts in the way. It cannot see
  the shell: the top bar is chrome (its budget is pixels, held by the e2e layout
  gate), and a modal is not a route at all. That left the redesign's last phase
  with no number to move, which is how a phase becomes decoration.

  So this measures the same thing for the surfaces a player meets *outside* a
  route — the help, settings, year-end, run-info, profile and season modals, plus
  the bell popover and the era popover — using the same rules as the route audit,
  deliberately, so the two numbers mean the same thing:

    · in the way   characters visible by default (a closed <details> or a popover
                   is not in the way)
    · total        everything, folds included: text may move, it may not vanish
    · controls     every button by the action it fires, so a redesign cannot
                   quietly mean "removed"

  Usage:  node tools/shellaudit.mjs                 the table
          node tools/tools.mjs --breakdown=<id>     one surface, piece by piece
          node tools/shellaudit.mjs --baseline      write tools/shell-baseline.json
          node tools/shellaudit.mjs --check         compare, and fail on a lost control
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.join(import.meta.dirname, '..');
const require = createRequire(path.join(ROOT, '.harness', ''));
require(path.join(ROOT, '.harness', 'dom.js'));
const M = require(path.join(ROOT, '.harness', 'mod.js'));
const SEED = 4242;

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&middot;': '·', '&hellip;': '…', '&mdash;': '—', '&ndash;': '–', '&times;': '×', '&rarr;': '→' };
function machineOf(html) {
  let n = 0;
  for (const m of html.matchAll(/<(textarea|pre|code)[^>]*>([\s\S]*?)<\/\1>/gi)) n += m[2].replace(/\s+/g, ' ').trim().length;
  return n;
}
function readable(html) { return String(html == null ? '' : html).replace(/<(textarea|pre|code)[^>]*>[\s\S]*?<\/\1>/gi, ' '); }
function inTheWay(html) {
  return String(html == null ? '' : html)
    .replace(/<details(?![^>]*\bopen\b)[^>]*>[\s\S]*?<\/details>/gi, ' ')
    .replace(/<div class="whypop">[\s\S]*?<\/div><\/div>/gi, ' ')
    .replace(/<div class="(bellpop|seapop|erapop)"[\s\S]*?<\/div><\/div>/gi, ' ');
}
function textOf(html) {
  const t = readable(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n');
  return t.split('\n').map((raw) => {
    let s = raw.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
    for (const [k, v] of Object.entries(ENT)) s = s.split(k).join(v);
    return s.replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}
const chars = (html) => textOf(html).reduce((n, b) => n + b.length, 0);
const actsOf = (html) => [...html.matchAll(/<button[^>]*data-a="([^"]+)"[^>]*>/g)].map((m) => m[1] + '|' + (m[0].match(/>(.*?)<\/?$/s) || [, ''])[1].replace(/<[^>]+>/g, '').trim()).sort();

/* The surfaces. Each is a thunk so nothing is rendered before the fixture is
   built, and each names the state it needs — the year-end modal does not exist
   in the first quarter, and a fixture that cannot reach the thing it measures is
   a fixture that measures nothing. */
const SURFACES = [
  { id: 'help',                    what: 'the ? in the top bar',              of: () => M.helpModal() },
  { id: 'settings',                what: 'Settings in the top bar',           of: () => M.settingsModal() },
  { id: 'runinfo',                 what: 'the date in the top bar',           of: () => M.runInfoModal('turn') },
  { id: 'profile',                 what: 'the save line under the brand',     of: () => M.profileModal() },
  { id: 'season',                  what: 'the season chip',                   of: () => M.seasonModal() },
  { id: 'nego',                    what: 'negotiating a hire or a deal',      of: () => M.negoModal(),
    /* a negotiation only exists mid-talk, so the fixture opens one the way the
       nego gate does rather than inventing the state object */
    then: () => M.startNego({ kind:'money', title:'Housekeeper salary', other:'Amina', metric:'pay',
                              low:120000, high:260000, yourPos:150000, theirPos:230000, maxRounds:3 }) },
  { id: 'anotherbiz',              what: 'start another company',             of: () => M.anotherBizModal() },
  { id: 'govvote',                 what: 'a board resolution',
    /* this one returns its parts — {head, body, foot} — rather than one string,
       because the renderer assembles it; the audit joins them exactly as the
       renderer does, so it measures the same markup the player sees */
    of: () => { const m = M.govVoteModal(); return m ? (m.head || '') + (m.body || '') + (m.foot || '') : ''; },
    /* a resolution needs a board; the gov gate forms one on the first company */
    /* a vote result only exists after a vote: form the board, put a resolution
       on the table, then call it. `callVote` takes the resolution's id, not its
       kind, which is the kind of thing a fixture finds out loudly. */
    then: () => {
      const b = M.bizList()[0];
      M.formBoard(b);
      M.openResolution(b, 'dividend');
      const open = M.openResolutions(b);
      if (open.length) M.callVote(b, open[0].id);
    } }
];

/* A stale build is a lying measurement: the rebuild aborts before mkcheck when a
   statement is undeclared, so the bundle is new while the module this reads is
   old. `tools/textaudit.mjs` learned this the hard way and refuses to report; so
   does this. */
{
  const built = path.join(ROOT, 'dist', 'index.html');
  const mod = path.join(ROOT, '.harness', 'mod.js');
  if (fs.existsSync(built) && fs.existsSync(mod) && fs.statSync(mod).mtimeMs < fs.statSync(built).mtimeMs) {
    console.error('STALE BUILD — .harness/mod.js is older than dist/index.html, so this');
    console.error('would measure the previous build. Run `bash tools/rebuild.sh` (it must');
    console.error('finish: an undeclared statement stops it before mkcheck) and try again.');
    process.exit(2);
  }
}

const argv = process.argv.slice(2);
const bd = (argv.find((a) => a.startsWith('--breakdown=')) || '').split('=')[1];
const asJson = argv.includes('--json');
const BASELINE = path.join(ROOT, 'tools', 'shell-baseline.json');

/* One fixture for everything, and a mature one: the shell only shows what a run
   has grown into, so a fresh run would measure an empty bar. */
function build() {
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: SEED });
  M.startBiz('tech', 'Testco', 6000000, null);
  for (let i = 0; i < 12; i++) { M.advanceQuarter(); M.UI.modal = null; }
}

const rows = [];
for (const s of SURFACES) {
  build();
  if (s.then) { try { s.then(); } catch (e) { /* the surface reports it below */ } }
  let html = '';
  let missing = null;
  try { html = s.of() || ''; } catch (e) { missing = String(e.message).slice(0, 80); }
  if (!missing && !/^\s*</.test(html)) missing = 'rendered nothing';
  rows.push({
    id: s.id, what: s.what, missing,
    chars: chars(inTheWay(html)), total: chars(html), machine: machineOf(html),
    controls: (html.match(/<button/g) || []).length,
    acts: actsOf(html),
    folds: (html.match(/<details/g) || []).length
  });
}

if (bd) {
  const row = rows.find((r) => r.id === bd);
  if (!row) { console.error('no such surface: ' + bd + ' (have: ' + rows.map((r) => r.id).join(', ') + ')'); process.exit(1); }
  build();
  const surf = SURFACES.find((s) => s.id === bd);
  if (surf.then) { try { surf.then(); } catch (e) {} }
  const html = surf.of() || '';
  const parts = html.split(/(?=<div class="card)|(?=<div class="modalbox)/);
  console.log('── ' + bd + ' — ' + row.chars + ' in the way · ' + row.total + ' total · ' + row.folds + ' folds · ' + row.controls + ' controls');
  parts.forEach((p, i) => {
    const t = chars(inTheWay(p));
    if (!t) return;
    const head = (p.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
    const longest = textOf(inTheWay(p)).reduce((a, b) => (b.length > (a || '').length ? b : a), '');
    console.log('  ' + String(i).padStart(2) + '. ' + String(t).padStart(5) + ' chars · ' +
      String((p.match(/<button/g) || []).length).padStart(3) + ' ctrl · ' + (head || '(no heading)').slice(0, 30).padEnd(32) +
      ' longest ' + String((longest || '').length).padStart(3) + ' "' + (longest || '').slice(0, 54) + '"');
  });
  process.exit(0);
}

if (asJson) { console.log(JSON.stringify(rows.map(({ acts, ...r }) => r), null, 1)); process.exit(0); }
if (argv.includes('--baseline')) {
  const out = {};
  rows.forEach((r) => { out[r.id] = { chars: r.chars, total: r.total, controls: r.controls, acts: r.acts, folds: r.folds }; });
  fs.writeFileSync(BASELINE, JSON.stringify({ at: new Date().toISOString().slice(0, 10), surfaces: out }, null, 1));
  console.log('baseline written: ' + Object.keys(out).length + ' surfaces · controls recorded: ' +
    Object.values(out).reduce((n, r) => n + r.controls, 0));
  process.exit(0);
}

if (argv.includes('--check')) {
  if (!fs.existsSync(BASELINE)) { console.error('no baseline: run node tools/shellaudit.mjs --baseline'); process.exit(2); }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).surfaces || {};
  let lost = 0, gained = 0, moved = 0; const problems = [];
  rows.forEach((r) => {
    const b = base[r.id];
    if (!b) { problems.push(r.id + ' is new and has no baseline'); return; }
    const before = b.acts || [], after = r.acts || [];
    const gone = before.filter((x) => !after.includes(x));
    const add = after.filter((x) => !before.includes(x));
    const renamed = [];
    before.forEach((x) => {
      if (after.includes(x)) return;
      const a = x.split('|')[0];
      const same = after.filter((y) => y.split('|')[0] === a && !before.includes(y));
      if (same.length && !gone.includes(x)) { gone.push(x); renamed.push(x + ' -> ' + same[0]); }
    });
    renamed.forEach((rn) => { const from = rn.split(' -> ')[0]; const i = gone.indexOf(from); if (i >= 0) gone.splice(i, 1); });
    lost += gone.length; gained += add.length;
    if (gone.length) problems.push(r.id + ': controls lost — ' + gone.join(' | '));
    if (add.length) problems.push(r.id + ': controls added — ' + add.join(' | '));
    const d = r.chars - b.chars;
    if (d) moved++;
    console.log('  ' + r.id.padEnd(14) + String(b.chars).padStart(6) + String(r.chars).padStart(7) + '  ' +
      (d === 0 ? '0%' : (d > 0 ? '+' : '') + Math.round((d / Math.max(1, b.chars)) * 100) + '%').padStart(6) +
      '  · total ' + String(r.total).padStart(5) + ' · folds ' + String(r.folds).padStart(2));
  });
  problems.forEach((p) => console.log('  ! ' + p));
  console.log('controls lost: ' + lost + ' · added: ' + gained + ' · surfaces changed: ' + moved + ' of ' + rows.length);
  console.log(lost ? 'SHELL CHECK FAILED' : 'NO CONTROL LOST');
  process.exit(lost ? 1 : 0);
}

console.log('surface'.padEnd(15) + 'in way  total  folds  ctrl');
rows.forEach((r) => {
  console.log('  ' + r.id.padEnd(13) + String(r.chars).padStart(6) + String(r.total).padStart(7) +
    String(r.folds).padStart(7) + String(r.controls).padStart(6) + (r.missing ? '  [' + r.missing + ']' : ''));
});
const live = rows.filter((r) => !r.missing);
console.log('surfaces: ' + live.length + ' of ' + rows.length + ' · in the way ' +
  live.reduce((n, r) => n + r.chars, 0) + ' · folds ' + live.reduce((n, r) => n + r.folds, 0) +
  ' · controls ' + live.reduce((n, r) => n + r.controls, 0));
