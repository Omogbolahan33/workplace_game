/*
  Gate: nothing the player reads is an unrendered escape sequence.

  Found by looking at a screenshot of the Overview - which is exactly the point.
  Every structural gate in this suite passed while the opening screen printed

      Living + debt    \u2212N688k

  because the string builder for that one line had two backslashes instead of
  one:

      h += '...<span class="mono bad">\\\\u2212' + fmt(exp) + '</span>';

  In JavaScript that is an escaped backslash followed by the four characters
  "u2212", so the minus sign was never drawn; it was printed. The same file uses
  the correct form fourteen other times, and the mistake is in the ORIGINAL
  single file - the player has been seeing it for the life of the game. No gate
  caught it because no gate was asking whether the text on a screen is text a
  human would want to read: `react-screen` compares the two renderers, and both
  rendered the same wrong thing.

  So this gate asks the question directly, in two ways:

    1. every route the router can produce is rendered and its text is scanned
       for escape sequences that were meant to be characters (\\uXXXX, \\n, \\t);
    2. the sections' own source is scanned for the same typo, which also covers
       modals, cards and log lines that a route walk does not reach.

  It is deliberately about *rendered output* first: a source lint can be fooled
  by a legitimate backslash, and the claim worth making is about what a player
  sees. The source scan is the cheap net underneath it.

  Run: node .harness/escapes.js
*/
require('./dom.js');
const fs = require('fs');
const path = require('path');
const M = require('./mod.js');

const ROOT = path.join(__dirname, '..');
const bad = [];
const note = (label, ok, detail) => {
  console.log('        ' + (ok ? 'ok   ' : 'FAIL ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) bad.push(label + (detail ? ' — ' + detail : ''));
};

/* an escape sequence that survived into the markup: backslash, then a letter
   and (for \u) four hex digits. A single backslash before a letter is not
   something a game writes on purpose. */
const ESCAPE = /\\u[0-9a-fA-F]{4}|\\[ntr]\b/g;

function scanText(where, html) {
  const text = String(html).replace(/<[^>]*>/g, ' ');
  const hits = text.match(ESCAPE);
  if (hits && hits.length) {
    const at = text.search(ESCAPE);
    bad.push(where + ': the player is shown ' + JSON.stringify(hits[0]) +
      ' as text — near ' + JSON.stringify(text.slice(Math.max(0, at - 45), at + 25).trim()));
    return false;
  }
  return true;
}

(async () => {
  console.log('escape sequences  : looking at every screen the router can produce');

  /* ---- 1. every route, rendered, read --------------------------------- */
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
  const S = M.getS();
  S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
  M.startBiz('food', 'Testco', Math.round(6000000 * (S.cumInfl || 1)), null);
  for (let i = 0; i < 3; i++) M.advanceQuarter();      /* so the log and news are populated */

  const TABS = ['overview', 'work', 'money', 'governance', 'legacy'];
  const SUBS = {
    work: ['business', 'career', 'household', 'life', 'rival', 'levers'],
    money: ['position', 'budget', 'property', 'markets', 'deals', 'group'],
    legacy: ['record', 'people', 'ambition', 'chronicle', 'season', 'settings']
  };
  let routes = 0, offenders = 0;
  for (const tab of TABS) {
    const subs = SUBS[tab] || [null];
    for (const sub of subs) {
      M.UI.tab = tab;
      M.UI.sub = sub;
      let html = '';
      try { html = M.routeViewInner(); }
      catch (err) { bad.push('route ' + tab + (sub ? '/' + sub : '') + ' threw: ' + err.message); continue; }
      routes++;
      if (!scanText(tab + (sub ? '/' + sub : ''), html)) offenders++;
    }
  }
  note('every route rendered and read', offenders === 0,
    offenders ? offenders + ' of ' + routes + ' routes show an escape sequence' : routes + ' routes clean');

  /* the start screen and the season screens are separate entry points */
  const extras = [['start screen', () => M.renderStart()],
                  ['season', () => M.viewSeason()],
                  ['chronicle', () => M.viewLedgerChronicle()],
                  ['career record', () => M.viewCareerRecord()]];
  let extraBad = 0;
  for (const [label, fn] of extras) {
    try { if (!scanText(label, fn())) extraBad++; }
    catch (err) { bad.push(label + ' threw: ' + err.message); extraBad++; }
  }
  note('the screens outside the router too', extraBad === 0, extras.map(e => e[0]).join(' · '));

  /* ---- 2. the sources themselves --------------------------------------
     A route walk cannot reach a modal that no fixture opens, and this typo is
     a typo: it is the same mistake in a string literal wherever it is written.
     Two backslashes before a letter that a single one would render is a bug in
     a game whose text is prose. */
  const files = [];
  for (const kind of ['core', 'ui']) {
    const dir = path.join(ROOT, 'packages', kind, 'src');
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.js'))) files.push(path.join(dir, f));
  }
  const lit = [];
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(/\\\\[nrtu]/);
      if (m) lit.push(path.relative(ROOT, f) + ':' + (i + 1) + '  ' + line.trim().slice(0, 90));
    });
  }
  note('no section writes an escaped backslash where a character was meant', lit.length === 0,
    lit.length ? lit.length + ' line(s), first: ' + lit[0] : files.length + ' sections clean');

  console.log('');
  if (bad.length) {
    console.log('ESCAPE ISSUES (' + bad.length + '):');
    bad.forEach(b => console.log('  - ' + b));
    process.exit(1);
  }
  console.log('ESCAPES CLEAN — every screen prints characters, not escape sequences');
})();
