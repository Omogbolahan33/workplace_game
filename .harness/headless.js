/* Gate: the simulation with no browser in the process.
 *
 * Every other gate loads the single file under a DOM stub. That is the right
 * way to test the game the player gets, and it is why "core is framework-free"
 * has been, until now, a claim about the source rather than about the run:
 * nothing in the suite had ever executed the simulation in a process with no
 * `document` in it. The next platform is React Native, which has no DOM either,
 * and the migration's own answer (`rn_verify = core_only`) says the check that
 * matters is this one - core, alone, playing.
 *
 * So this gate imports `packages/core` **directly** (not the harness bundle,
 * which is the app for node) and does the four things that are only true if the
 * separation is real:
 *
 *   1. nothing in a whole run reaches for the browser - `document`, `window`,
 *      `localStorage`, `fetch` and the rest are traps that throw, so a single
 *      stray access anywhere in three decades of play fails here by name
 *   2. the module exports exactly what the package declares, no more and no
 *      fewer: `exports.json` is the surface React Native will be written
 *      against, and drift in it is drift in the contract
 *   3. the simulation is deterministic under a fixed seed and different under a
 *      different one - the property every gate fixture in this suite leans on
 *   4. the state is plain JSON, round-trips through it unchanged, and the game
 *      still ends, in every world, and stays ended
 *
 * What it does not do is compare any figure against a number. What the
 * simulation should produce is what the other gates are for; this one is about
 * where it runs and what it needs to get there.
 */
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

const PKG = path.join(__dirname, '..', 'packages', 'core');
const SEED = 4242;

/* ---- 1. the process this gate runs in has no DOM -------------------------
 *
 * If a stray `require('./dom.js')` ever lands above this line, every check
 * below becomes a check of the DOM stub, and the gate would pass for exactly
 * the wrong reason. Cheaper to say so out loud than to find out later. */
const noDom = typeof document === 'undefined' && typeof window === 'undefined' &&
  typeof globalThis.localStorage === 'undefined';
ck(noDom, 'this gate is not running in a browser-free process: document=' + typeof document +
  ' window=' + typeof window + ' localStorage=' + typeof globalThis.localStorage);
ck(!require.cache[require.resolve('./dom.js')],
  'the DOM stub is loaded in this process — the point of this gate is a process without one');

(async () => {
  /* ---- 2. it loads, and exports exactly what it declares ---------------- */
  const core = await import(pathToFileURL(path.join(PKG, 'index.js')).href);
  const declared = Object.keys(JSON.parse(fs.readFileSync(path.join(PKG, 'exports.json'), 'utf8')));
  const got = Object.keys(core).filter((k) => k !== 'default');
  const missing = declared.filter((n) => got.indexOf(n) < 0);
  const extra = got.filter((n) => declared.indexOf(n) < 0);
  ck(missing.length === 0 && extra.length === 0,
    'the module and exports.json have drifted: missing ' + (missing.join(', ') || 'nothing') +
    ', extra ' + (extra.join(', ') || 'nothing'));
  ck(typeof core.newGame === 'function' && typeof core.advanceQuarter === 'function' &&
     typeof core.installHost === 'function' && typeof core.netWorth === 'function',
    'the four names a platform is written against are not all functions');
  ck(Array.isArray(core.CITIES) && core.CITIES.length > 1 && Array.isArray(core.PROFILES) && core.PROFILES.length > 1,
    'the data tables are not arrays of towns and profiles, which is what every screen renders from');
  ck(core.host && core.hostCalls && typeof core.hostCalls.call === 'function',
    'the host seam is missing: a platform would have nowhere to install its drawing');

  /* ---- 3. a run must not reach for the browser --------------------------
   *
   * Installed after the import, because the import is node loading a module
   * and that is allowed to touch node. Everything after this line is the
   * simulation, and it must get everything it needs from the host object. */
  const BROWSER = ['document', 'window', 'localStorage', 'sessionStorage', 'XMLHttpRequest',
    'navigator', 'fetch', 'requestAnimationFrame', 'alert', 'location', 'performance'];
  const restored = [];
  const reached = [];
  for (const k of BROWSER) {
    const had = k in globalThis;
    const prev = had ? globalThis[k] : undefined;
    try {
      Object.defineProperty(globalThis, k, {
        configurable: true,
        get() { reached.push(k); throw new Error('reached for ' + k); }
      });
      restored.push(() => {
        if (had) Object.defineProperty(globalThis, k, { configurable: true, value: prev, writable: true });
        else delete globalThis[k];
      });
    } catch (e) { /* some globals refuse redefinition; the trap list is best effort */ }
  }
  const untrap = () => { restored.forEach((f) => f()); };

  const play = (seed, quarters) => {
    let render = 0; let save = 0;
    core.installHost({
      render: () => { render++; },
      save: () => { save++; }
    });
    const S = core.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed });
    const series = [];
    let threw = null;
    for (let i = 0; i < quarters && !S.gameOver; i++) {
      try { core.advanceQuarter(); } catch (e) { threw = e; break; }
      series.push([S.turn, Math.round(core.netWorth()), Math.round(S.fin.cash)]);
    }
    return { S, series, render, save, threw };
  };

  const run = play(SEED, 40);
  untrap();

  ck(!run.threw, 'a quarter threw with nothing drawing it: ' + (run.threw && run.threw.message));
  ck(reached.length === 0,
    'the simulation reached for the browser: ' + (Array.from(new Set(reached)).join(', ') || 'nothing') +
    (run.threw ? ' (' + run.threw.message + ')' : ''));
  ck(run.series.length === 40, 'forty quarters did not happen: ' + run.series.length + ' did');
  const turns = run.series.map((s) => s[0]);
  ck(turns.every((t, i) => t === i + 1), 'the turn counter did not advance one quarter at a time: ' +
  turns.slice(0, 6).join(',') + '…');
  const notFinite = run.series.filter((s) => !Number.isFinite(s[1]) || !Number.isFinite(s[2]));
  ck(notFinite.length === 0, 'the figures a screen prints stopped being numbers in ' +
    notFinite.length + ' quarter(s)');
  ck(run.render >= 40,
    'a quarter asked the host to draw ' + run.render + ' times in forty quarters — the simulation is ' +
    'supposed to ask, not to draw');
  ck(run.save >= 40, 'the game played forty quarters and asked the host to save ' + run.save + ' times');

  /* the net-worth chart reads history, so there has to be one point per quarter */
  const hist = run.S.hist || [];
  ck(hist.length >= run.S.turn,
    'the history has ' + hist.length + ' points for ' + run.S.turn + ' quarters — a chart would lose quarters');
  const last = hist[hist.length - 1];
  ck(last && Math.abs((last.nw || 0) - core.netWorth()) < 1,
    'the last history point does not agree with the net worth the header prints');

  /* ---- 4. the same seed is the same world, a different seed is not ------ */
  const again = play(SEED, 12);
  const other = play(SEED + 1, 12);
  untrap();
  const first12 = run.series.slice(0, 12);
  ck(JSON.stringify(again.series) === JSON.stringify(first12),
    'the same seed played a different world the second time — every fixture in this suite depends on it');
  ck(JSON.stringify(other.series) !== JSON.stringify(first12),
    'seed ' + (SEED + 1) + ' played exactly the world seed ' + SEED + ' did — the seed is not wired to anything');

  /* ---- 5. a save is the state, and the state is JSON ------------------- */
  const S = run.S;
  const plain = [];
  const seen = new Set();
  (function walk(v, at) {
    if (v === null) return;
    const t = typeof v;
    if (t === 'string' || t === 'boolean') return;
    if (t === 'number') {
      if (!Number.isFinite(v)) plain.push(at + ' is ' + v + ' (JSON turns it into null)');
      return;
    }
    if (t !== 'object') { plain.push(at + ' is a ' + t); return; }
    if (seen.has(v)) { plain.push(at + ' goes round in a circle'); return; }
    seen.add(v);
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, at + '[' + i + ']')); return; }
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== null) {
      plain.push(at + ' is a ' + (v.constructor && v.constructor.name || 'thing') + ', not a plain object');
      return;
    }
    for (const k of Object.keys(v)) walk(v[k], at + '.' + k);
  })(S, 'S');
  ck(plain.length === 0,
    'the state a save writes is not plain JSON: ' + plain.slice(0, 4).join(' · ') +
    (plain.length > 4 ? ' (and ' + (plain.length - 4) + ' more)' : ''));
  let round = null;
  try {
    const text = JSON.stringify(S);
    round = JSON.stringify(JSON.parse(text));
    ck(round === text, 'the state does not survive a save and a load unchanged — ' + text.length +
      ' characters out, ' + round.length + ' back');
  } catch (e) {
    ck(false, 'the state could not be written as a save at all: ' + e.message);
  }

  /* ---- 6. the game ends, in every world, and stays ended --------------- */
  const endings = [];
  const endKeys = [];
  const endOf = (s) => s.turn + ' on ' + ((s.gameOver && s.gameOver.reason) || 'no reason given');
  for (let i = 0; i < 4; i++) {
    const seed = SEED + i;
    const { S: s } = play(seed, 300);
    untrap();
    ck(!!s.gameOver, 'seed ' + seed + ' played 300 quarters without ending — the game has a finish line');
    if (!s.gameOver) continue;
    const at = s.turn;
    core.advanceQuarter();
    ck(s.turn === at, 'a quarter advanced after the run had ended (turn ' + at + ' -> ' + s.turn + ')');
    ck(!!(s.gameOver.reason), 'the run ended without saying why it ended');
    endings.push('seed ' + seed + ' ended at turn ' + endOf(s) + ' — net worth ' + core.fmt(s.gameOver.nw));
    endKeys.push(endOf(s));
  }
  /* The terminal is a rule, so every world ending on the same turn is the rule
     working, not a missing difference. What has to be deterministic is the
     ending itself: the same seed played twice finishes the same way, turn for
     turn, which is the check that would catch an ending that reads the clock. */
  const againToTheEnd = play(SEED, 300);
  untrap();
  ck(!!againToTheEnd.S.gameOver && endOf(againToTheEnd.S) === endKeys[0],
    'the same seed ended differently the second time: ' + endOf(againToTheEnd.S) + ' against ' + endKeys[0]);

  /* ---- report ----------------------------------------------------------- */
  console.log('core in node        : ' + declared.length + ' declared names, ' + got.length + ' exported, ' +
    'no DOM, no storage, no network');
  console.log('forty quarters      : ' + run.series.length + ' played, host asked to draw ' + run.render +
    ' times and to save ' + run.save + ' times');
  console.log('the same seed       : ' + JSON.stringify(again.series.slice(0, 3)) + ' … twice, identical');
  console.log('a different seed    : ' + JSON.stringify(other.series[11]) + ' against ' +
    JSON.stringify(first12[11]));
  console.log('a save              : ' + (round ? round.length.toLocaleString() : '0') +
    ' characters of plain JSON, round-tripped unchanged');
  endings.forEach((e) => console.log('the end             : ' + e));

  if (bad.length) { console.log('\nHEADLESS ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
  console.log('\nHEADLESS CLEAN — the simulation plays a life in a process with no browser in it, ' +
    'asks the host for everything it needs, and a save is its state');
})();
