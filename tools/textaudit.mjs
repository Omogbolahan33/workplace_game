/*
  How much text is on each screen.

  "The UI is too text bulky" is an assertion about a feeling, and feelings are
  not a plan. This turns it into numbers per route: how many characters a screen
  prints, how much of that is prose rather than figures, how many cards and
  controls it holds, and what the longest single block of prose is. The redesign
  is then ordered by evidence rather than by whichever screen was seen last.

  It renders the real screens — the single-file build, through .harness/build.js
  and .harness/mod.js, the same module the gates drive — reads the markup, and
  counts. No DOM, no browser: the markup is the thing under audit.

  Run: node tools/textaudit.mjs [--json] [--route=overview]
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const ROOT = path.join(import.meta.dirname, '..');
/* the same DOM stub the gates use: mod.js is the whole page, and the page has a
   listener on document before any screen is drawn */
require(path.join(ROOT, '.harness', 'dom.js'));
const M = require(path.join(ROOT, '.harness', 'mod.js'));
const { ROUTES } = require(path.join(ROOT, '.harness', 'routes.js'));

/* Markup -> the text a reader sees. Tags out, entities back to characters,
   whitespace collapsed: the same reading the layout gate takes in a browser. */
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&middot;': '·', '&hellip;': '…', '&mdash;': '—', '&ndash;': '–', '&times;': '×', '&rarr;': '→' };
/* Machine text is not reading text. The settings screen carries the portable
   save string — ten thousand characters of JSON in a textarea — and counting it
   as "text the player reads" would have made that screen the whole redesign on
   a measurement artefact. Textareas, pres and code are counted separately. */
function machineOf(html) {
  const out = [];
  for (const m of html.matchAll(/<(textarea|pre|code)[^>]*>([\s\S]*?)<\/\1>/gi)) out.push(m[2]);
  return out.join('').replace(/\s+/g, ' ').trim().length;
}
function readable(html) {
  return html.replace(/<(textarea|pre|code)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
}
/* Text behind a close-by-default disclosure is not text in the way. This is the
   number the redesign is judged on: a `<details>` the player may open costs
   nothing until they open it, and a popover costs nothing until it is tapped.
   The words still exist — `total` reports them — they are simply not between the
   player and the decision. Counting only what is on screen by default is also
   what stops this tool being a way to pass by hiding things: the same rule the
   layout gate uses (it measures visible text, never textContent). */
function inTheWay(html) {
  return html
    .replace(/<details(?![^>]*\bopen\b)[^>]*>[\s\S]*?<\/details>/gi, ' ')
    .replace(/<div class="whypop">[\s\S]*?<\/div><\/div>/gi, ' ')
    .replace(/<div class="(bellpop|seapop|erapop)"[\s\S]*?<\/div><\/div>/gi, ' ');
}
function textOf(html) {
  html = readable(html);
  const blocks = [];
  html.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/summary|\/td|\/tr)>/gi, '\n');
  const noTags = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n');
  for (let raw of noTags.split('\n')) {
    let t = raw.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
              .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
    for (const [k, v] of Object.entries(ENT)) t = t.split(k).join(v);
    t = t.replace(/\s+/g, ' ').trim();
    if (t) blocks.push(t);
  }
  return blocks;
}
const count = (html, re) => (html.match(re) || []).length;

/* The whole page as it stands for one route: the route's own screens, grouped
   the way the game groups them, under the strip the route lives on. */
function render(route) {
  const screens = route.screen.split('/');
  let html = '';
  for (const name of screens) {
    if (typeof M[name] !== 'function') return { html: '', missing: name };
    html += M[name]();
  }
  if (typeof M.groupRoute === 'function') html = M.groupRoute(html, route.key || route.screen);
  return { html, missing: null };
}

/* A stale build is a lying measurement, and it has already happened once: the
   rebuild aborts before `.harness/mkcheck.js` when a statement is undeclared, so
   the bundle on disk is new while the module every gate drives is old - and this
   tool spends a minute reporting yesterday's numbers with no complaint. So it
   refuses to report at all when the module it would measure is older than the
   build it came from. Not a warning: a warning in a report nobody reads is the
   same silence, and the whole point of this tool is that it cannot flatter a
   screen. */
{
  const built = path.join(ROOT, 'dist', 'index.html');
  const mod = path.join(ROOT, '.harness', 'mod.js');
  if (fs.existsSync(built) && fs.existsSync(mod)) {
    const b = fs.statSync(built).mtimeMs, m = fs.statSync(mod).mtimeMs;
    if (m < b) {
      console.error('STALE BUILD — .harness/mod.js is older than dist/index.html, so this');
      console.error('would measure the previous build. Run `bash tools/rebuild.sh` (it must');
      console.error('finish: an undeclared statement stops it before mkcheck) and try again.');
      process.exit(2);
    }
  }
}

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const only = (argv.find(a => a.startsWith('--route=')) || '').split('=')[1];
const SEED = 4242;

const rows = [];
for (const route of ROUTES) {
  /* Money > markets is two routes - a portfolio and a market list - so the key
     carries the screen as well. Without it the baseline kept whichever came
     second and the comparison read the difference as a change in the game. */
  const key = (route.tab + (route.sub ? '/' + route.sub : '')).toLowerCase() + '#' + route.screen;
  if (only && key.split('#')[0] !== only && route.screen !== only) continue;
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: SEED });
  M.UI.tab = route.tab.toLowerCase(); M.UI.sub = route.sub || null;
  /* Two worlds, because a screen's text depends on what exists: early (a
     person, no company) and trading (ten years in, staff, a board, a group).
     Measuring only the first would have called the governance and group screens
     empty, and they are the ones a mature run actually lives in. */
  if (process.env.WORLD === 'trading') {
    M.startBiz('tech', 'Testco', 4000000, null);
    for (let i = 0; i < 40; i++) { M.advanceQuarter(); M.UI.modal = null; }
  } else {
    for (let i = 0; i < 12; i++) { M.advanceQuarter(); M.UI.modal = null; }
  }
  const rendered = render(route);
  if (rendered.missing) { rows.push({ key, missing: rendered.missing }); continue; }
  const html = rendered.html;
  /* A control one tap away is still on the route (VISUAL.md, M11). In the
     world-first view a list of people becomes a strip of their faces, and each
     face opens a card holding the buttons the list held. Those buttons are
     counted as this route's, read from the card itself - so a strip that lost
     a person's card, or a card that lost a button, is still a lost control. */
  const cards = [...html.matchAll(/<button[^>]*data-a="hot"[^>]*>/g)].map((m) => m[0]).map((t) => ({
    kind: (t.match(/data-k="([^"]*)"/) || [])[1], id: (t.match(/data-c="([^"]*)"/) || [])[1] || '' }));
  const behind = cards.map((c) => typeof M.hotModal === 'function' ? M.hotModal({ type: 'hot', kind: c.kind, id: c.id }) : '').join('');
  const blocks = textOf(html);
  const shown = textOf(inTheWay(html));
  const chars = blocks.reduce((n, b) => n + b.length, 0);
  const words = blocks.reduce((n, b) => n + b.split(' ').length, 0);
  /* prose: blocks that are sentences rather than figures. A block with no
     digit, longer than 60 characters, is a sentence the player has to read. */
  const prose = blocks.filter(b => b.length > 60 && !/\d/.test(b));
  const figures = blocks.filter(b => /\d|₦/.test(b) && b.length < 24).length;
  rows.push({
    key,
    screen: route.screen,
    chars, words, machine: machineOf(html),
    read: shown.reduce((n, b) => n + b.length, 0),
    blocks: blocks.length,
    proseBlocks: prose.length,
    proseChars: prose.reduce((n, b) => n + b.length, 0),
    longestProse: prose.reduce((a, b) => (b.length > (a || '').length ? b : a), '') || '',
    cards: count(html, /class="card"/g),
    sections: count(html, /<hr class="sep">/g),
    controls: count(html, /<button/g),
    /* every control, by the action it fires and the words on it. Compared as a
       set: a redesign may re-label a button (and the label is reported), but a
       button that disappears is a feature that disappeared. */
    acts: ((html + behind).match(/<button[^>]*data-a="([^"]+)"[^>]*>[\s\S]*?<\/button>/g) || [])
      /* the faces and the card's own way out are how you reach a control, not controls the screen had */
      .filter(b => !/data-a="(hot|close)"/.test(b) && !/data-a="goto"[^>]*>(Everyone|The business|The board|The household|Your record|The deals|The deed|The covenants|Everything coming back)</.test(b))
      .map(b => (b.match(/data-a="([^"]+)"/) || [,'?'])[1] + '|' +
                textOf(b.replace(/<button[^>]*>/, '')).join(' ').slice(0, 40).replace(/\|/g, '/'))
      .sort(),
    headings: count(html, /<h[1-6][ >]/g),
    figures,
    details: count(html, /<details/g)
  });
}

const bad = rows.filter(r => r.missing);
const good = rows.filter(r => !r.missing).sort((a, b) => b.chars - a.chars);

/* --breakdown=<route>: what one screen's text is made of, card by card, so the
   redesign has targets rather than a total. */
const bd = (argv.find(a => a.startsWith('--breakdown=')) || '').split('=')[1];
if (bd) {
  const route = ROUTES.filter(r => (r.tab + (r.sub ? '/' + r.sub : '')).toLowerCase() === bd || r.screen === bd)[0];
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: SEED });
  M.UI.tab = route.tab.toLowerCase(); M.UI.sub = route.sub || null;
  for (let i = 0; i < 12; i++) { M.advanceQuarter(); M.UI.modal = null; }
  const html = render(route).html;
  const parts = html.split(/(?=<div class="card")/);
  console.log('── ' + bd + ' — ' + textOf(html).reduce((n, b) => n + b.length, 0) + ' characters in ' + parts.length + ' top-level pieces ──\n');
  parts.forEach((p, i) => {
    const t = textOf(p).reduce((n, b) => n + b.length, 0);
    if (!t) return;
    const title = (p.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/) || [,''])[1].replace(/<[^>]+>/g, '').trim();
    const longest = textOf(p).reduce((a, b) => (b.length > (a || '').length ? b : a), '');
    console.log(String(i).padStart(2) + '. ' + String(t).padStart(5) + ' chars · ' + String(count(p, /<button/g)).padStart(3) + ' ctrl · ' +
      (title || '(no heading)').slice(0, 34).padEnd(36) + ' longest ' + String((longest || '').length).padStart(3) + ' "' + (longest || '').slice(0, 60) + '"');
  });
  process.exit(0);
}

/* --baseline writes the current reading to tools/text-baseline.json; --check
   compares against it and fails if any control has gone missing, while
   reporting how much text each screen lost or gained. This is what makes
   "redesign only, not losing features" a check rather than a promise. */
const BASELINE = path.join(ROOT, 'tools', 'text-baseline.json');
if (argv.includes('--baseline')) {
  if (!only) {
    /* both worlds, since the set of controls depends on what exists */
    const out = { at: new Date().toISOString(), early: {}, trading: {} };
    for (const world of ['early', 'trading']) {
      const res = JSON.parse(execFileSync(process.execPath, [process.argv[1], '--json'], { env: { ...process.env, WORLD: world }, maxBuffer: 1 << 28 }).toString());
      for (const r of res) out[world][r.key] = { chars: r.chars, read: r.read, controls: r.controls, acts: r.acts, figures: r.figures, cards: r.cards };
    }
    fs.writeFileSync(BASELINE, JSON.stringify(out, null, 1));
    console.log('baseline written: ' + BASELINE);
    console.log('  routes: ' + Object.keys(out.trading).length + ' · controls recorded: ' +
      Object.values(out.trading).reduce((n, r) => n + (r.acts || []).length, 0));
    process.exit(0);
  }
}
if (argv.includes('--check')) {
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const world = process.env.WORLD === 'trading' ? 'trading' : 'early';
  const problems = [];
  let lost = 0, gained = 0; const relabels = [];
  console.log('route'.padEnd(20) + 'text before   after   change   controls');
  console.log('─'.repeat(66));
  for (const r of good) {
    const b = base[world][r.key];
    if (!b) { problems.push(r.key + ': not in the baseline'); continue; }
    const before = (b.read !== undefined ? b.read : b.chars), after = r.read;
    /* A control is identified by the ACTION it fires. A redesign may shorten
       "Save slot 1" to "Save" — the words on a button are the redesign's
       business — but an action that no longer has a control is a feature that
       no longer has a way in, and that fails. Relabelling is reported. */
    const actionOf = (a) => String(a).split('|')[0];
    const haveActions = new Set((r.acts || []).map(actionOf));
    const missing = (b.acts || []).filter(a => !haveActions.has(actionOf(a)));
    const relabelled = (b.acts || []).filter(a => (r.acts || []).indexOf(a) < 0 && haveActions.has(actionOf(a)));
    if (relabelled.length) relabels.push(...relabelled.map(a => r.key.split('#')[0] + ': ' + a + ' → ' + (r.acts || []).filter(x => actionOf(x) === actionOf(a))[0]));
    if (missing.length) lost += missing.length;
    if (r.acts.length > b.acts.length) gained += r.acts.length - b.acts.length;
    const pct = before ? Math.round((after - before) / before * 100) : 0;
    console.log(r.key.padEnd(20) + String(before).padStart(8) + String(after).padStart(8) +
      (pct > 0 ? '+' : '') + String(pct).padStart(6) + '%' + String(r.acts.length).padStart(10) +
      (missing.length ? '   LOST ' + missing.length : ''));
    if (missing.length) missing.slice(0, 4).forEach(m => problems.push('  ' + r.key + ': the control "' + m + '" is gone'));
  }
  console.log('─'.repeat(66));
  console.log('controls lost: ' + lost + ' · added: ' + gained + ' · relabelled: ' + relabels.length + ' · routes compared: ' + good.length);
  if (relabels.length && argv.includes('--say-relabels')) relabels.forEach(x => console.log('   relabelled: ' + x));
  if (problems.length) { console.log('\nFEATURES LOST OR UNMEASURED (' + problems.length + '):'); problems.forEach(p => console.log(' - ' + p)); process.exit(1); }
  console.log('NO CONTROL LOST');
  process.exit(0);
}
if (asJson) { console.log(JSON.stringify(good, null, 1)); process.exit(0); }
const byRead = good.slice().sort((a, b) => b.read - a.read);
console.log('route'.padEnd(34) + 'in way  total  ctrl  prose longest  ctrl-lost');
console.log('─'.repeat(80));
for (const r of byRead) {
  console.log(r.key.padEnd(34) +
    String(r.read).padStart(6) + String(r.chars).padStart(7) + String(r.controls).padStart(6) +
    String(r.proseBlocks).padStart(6) + String(r.longestProse.length).padStart(8));
}
const total = good.reduce((n, r) => n + r.chars, 0);
const totalRead = good.reduce((n, r) => n + r.read, 0);
const med = byRead.slice().sort((a, b) => a.read - b.read)[Math.floor(byRead.length / 2)].read;
console.log('─'.repeat(80));
console.log('routes: ' + good.length + ' · IN THE WAY: ' + totalRead.toLocaleString() +
  ' · including disclosures and machine text: ' + total.toLocaleString() + ' · median in the way: ' + med);
console.log('worst five: ' + byRead.slice(0, 5).map(r => r.key.split('#')[0] + ' ' + r.read).join(' · '));
if (bad.length) console.log('COULD NOT RENDER: ' + bad.map(b => b.key + '(' + b.missing + ')').join(', '));
if (!fs.existsSync(path.join(ROOT, '.harness', 'mod.js'))) console.log('mod.js is missing — run npm run build');
