/*
  The module build gate.

  Two things this proves, and neither is provable by any other gate:

  1. @ledger/core runs as a module, on its own, with no DOM at all. Everything
     it needs from outside arrives through the host object, so a bare Node
     process can drive a whole run of the game and see the host being called.

  2. The module build and the single-file build are the same game. Both are
     driven with the same seed, the same profile and the same number of
     quarters, and their states are compared. If the decomposition changed
     anything at all about how a quarter resolves, this is where it shows.

  The single file is mod.js (built from dist/index.html, which is built from the
  packages); the module build is packages/core/index.js. Same source, two
  shapes, one outcome.
*/
require('./dom.js');                        /* document, localStorage, window */
const crypto = require('crypto');
const path = require('path');

const M = require('./sim.js');              /* the single-file build */
const flat = M.getS ? M : null;
let bad = [];
const note = (label, value) => console.log(('  ' + label).padEnd(28) + value);

/* A field-by-field comparison, not a hash. A hash tells you the two builds
   disagree; it does not tell you what about, so the first time this ran it
   said "5c201c4050bb vs 5b366f4a402b" and left it there. The difference was
   S.startedAt - a wall clock - and everything else, all 15,440 characters of
   it, was identical.

   Clock fields are the one thing two runs cannot share, so they are named
   here rather than papered over with a tolerance. */
const CLOCK = /^(startedAt|savedAt|lastSaved|lastPlayed|ts|at|now|stamp)$/;

function stable(v, seen) {
  seen = seen || new Set();
  if (v === null || typeof v !== 'object') return typeof v === 'function' ? '[fn]' : v;
  if (seen.has(v)) return '[cycle]';
  seen.add(v);
  if (Array.isArray(v)) return v.map(x => stable(x, seen));
  const out = {};
  for (const k of Object.keys(v).sort()) {
    if (typeof v[k] === 'function') continue;
    out[k] = stable(v[k], seen);
  }
  return out;
}

function compare(a, b, path, diffs) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const bothObjects = a && b && typeof a === 'object' && typeof b === 'object' &&
    !Array.isArray(a) && !Array.isArray(b);
  if (bothObjects) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      compare(a[k], b[k], path + '.' + k, diffs);
    }
    return;
  }
  diffs.push({ path, a: JSON.stringify(a), b: JSON.stringify(b) });
}

function drive(run, advance, quarters) {
  run.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
  for (let q = 0; q < quarters; q++) {
    const S = run.getS();
    if (S.gameOver) break;
    advance();
  }
  return run.getS();
}

/* ---- 1. the single-file build, for comparison ---- */
let refState = null, refWorth = null;
try {
  const S = drive(M, () => M.advanceQuarter(), 40);
  refState = stable(S);
  refWorth = M.netWorth();
  note('single file', 'quarter ' + S.turn + ' · net worth ' + M.fmt(refWorth));
} catch (e) {
  bad.push('the single-file build could not be driven: ' + e.message);
}

/* ---- 2. the module build ---- */
globalThis.__LEDGER_IS_APP__ = true;        /* do not self-boot */

(async () => {
  let core, ui = null;
  try {
    core = await import(path.join(__dirname, '..', 'packages', 'core', 'index.js'));
    note('@ledger/core', Object.keys(core).length + ' exported names, loaded with no DOM');
  } catch (e) {
    console.log('\nMODULE ISSUES:');
    console.log('  @ledger/core failed to load: ' + e.message);
    process.exit(1);
  }

  /* the simulation must be drivable with *nothing* installed: every call it
     makes into the outside world goes to an empty default */
  let called = { render: 0, toast: 0, el: 0, view: 0, save: 0 };
  try {
    core.installHost({
      render: () => called.render++,
      toast: () => called.toast++,
      el: () => null,
      view: name => { called.view++; return ''; },
      save: () => called.save++,
      hasSave: () => false,
      loadProfile: () => null,
      saveProfile: () => {},
      cloudSyncBackground: () => {},
      canScan: () => false,
      url: () => '',
      net: { fetch: () => Promise.reject(new Error('no network in this gate')) }
    });
    const S = drive(
      { newGame: core.newGame, getS: () => core.S },
      () => core.advanceQuarter(),
      40
    );
    note('module build', 'quarter ' + S.turn + ' · net worth ' + core.fmt(core.netWorth()));

    if (refState) {
      const bState = stable(S);
      const diffs = [];
      compare(refState, bState, 'S', diffs);
      const clock = diffs.filter(d => CLOCK.test(d.path.split('.').pop()));
      const real = diffs.filter(d => !CLOCK.test(d.path.split('.').pop()));
      note('state compared', refState ? Object.keys(refState).length + ' top-level fields' : '');
      if (clock.length) note('clock fields', clock.map(d => d.path).join(', ') + ' (a wall clock; not compared)');
      if (real.length) {
        for (const d of real.slice(0, 6)) {
          bad.push('the builds disagree at ' + d.path + ': ' + d.a + ' vs ' + d.b);
        }
        if (real.length > 6) bad.push('...and ' + (real.length - 6) + ' more differing fields');
      } else {
        note('same game', 'every field matches after 40 quarters');
      }
    }
    const total = called.render + called.toast + called.view + called.el;
    if (!total) bad.push('the simulation never called the host: nothing drew, nothing toasted');
    else note('host calls', JSON.stringify(called));
  } catch (e) {
    bad.push('the module build could not be driven: ' + e.message + '\n    ' +
      (e.stack || '').split('\n')[1]);
  }

  /* ---- 3. the UI package installs onto the host and draws ---- */
  try {
    ui = await import(path.join(__dirname, '..', 'packages', 'ui', 'index.js'));
    ui.install();
    const host = core.host;
    let drew = '';
    host.render = () => { drew = document.getElementById('main').innerHTML; };
    core.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
    core.render();
    note('@ledger/ui', Object.keys(ui).length + ' names · install() wired onto core');
    note('markup rendered', drew.length + ' chars into #main');
    if (drew.length < 500) bad.push('the UI installed but rendered almost nothing (' + drew.length + ' chars)');
    if (/undefined|NaN|\[object Object\]/.test(drew)) bad.push('the rendered markup contains undefined/NaN');

    /* Every screen the package offers must resolve through the host, and every
       route the router walks must come back with a screen rather than ''.
       A screen is named by the router, so "resolves" is checked by asking for
       it by name - not by matching it against a list, which is how the first
       registry listed eleven of twenty-eight screens and drew nothing for the
       rest. Each route is walked twice: once before a company exists and once
       after. A route that throws for want of a company and a route that draws
       nothing are different faults, and both are faults. */
    const routes = [];
    for (const tab of ['overview', 'work', 'money', 'governance', 'legacy']) {
      for (const sub of ['', 'career', 'household', 'life', 'rival', 'levers', 'position', 'budget', 'property',
                         'deals', 'group', 'people', 'ambition', 'chronicle', 'season', 'settings']) {
        routes.push([tab, sub]);
      }
    }
    function walk(label) {
      const thin = [], threw = [];
      for (const [tab, sub] of routes) {
        const where = tab + (sub ? '/' + sub : '');
        core.UI.tab = tab; core.UI.sub = sub; core.UI.modal = null;
        try {
          const html = core.routeView();
          if (!html || html.length < 40) thin.push(where + ' (' + (html || '').length + ')');
        } catch (e) { threw.push(where + ' :: ' + e.message); }
      }
      note('routes ' + label, (routes.length - thin.length - threw.length) + '/' + routes.length + ' drew');
      if (thin.length) bad.push('routes that draw nothing ' + label + ': ' + thin.slice(0, 8).join(' · '));
      if (threw.length) bad.push('routes that throw ' + label + ': ' + threw.slice(0, 8).join(' · '));
    }
    walk('no company');

    if (!core.S.biz) {
      try { core.startBiz('retail', null, Math.round(3000000 * (core.S.cumInfl || 1)), null); }
      catch (e) { bad.push('could not start a business for the route walk: ' + e.message); }
    }
    walk('with a company');

    const offered = ui.screenNames();
    note('screens offered', offered.length + ' exported screens');
    /* Asked for by bare name, a screen may need an argument (viewBoard(b) is
       handed the company by the router). What it may never do is come back as
       the empty string, which is how every screen failed silently before: the
       router asked for a name no table knew and the page drew nothing with no
       error anywhere. Loud is allowed; silent is not. */
    const silent = [], loud = [];
    for (const n of offered) {
      let out;
      try { out = core.host.view(n); }
      catch (e) { loud.push(n + ' (' + e.name + ')'); continue; }
      if (!out) silent.push(n);
    }
    if (silent.length) bad.push('these screens come back empty instead of throwing: ' + silent.slice(0, 8).join(', '));
    note('screens by name', offered.length + ' asked, ' + (offered.length - silent.length - loud.length) +
      ' drew, ' + loud.length + ' want an argument, 0 silent');
    core.UI.tab = 'overview'; core.UI.sub = '';
  } catch (e) {
    bad.push('@ledger/ui failed to install: ' + e.message + '\n    ' +
      (e.stack || '').split('\n').slice(1, 6).join('\n    '));
  }

  /* ---- 4. the record keeps step with the sources ----
     packages/flat is what the module converter was handed, kept so the bundler
     can prove that stripping module syntax gives the statements back character
     for character. A hand edit to a section that is not mirrored there is a
     hand edit that vanishes the day anyone re-runs the bootstrap - which is
     exactly what happened to the header chip, silently, and it was only found
     because a gate happened to measure the header. So: check the mirror, and
     check that the bootstrap refuses to run without saying so out loud. */
  {
    const fs = require('fs');
    const pairs = [];
    for (const kind of ['core', 'ui']) {
      const srcDir = path.join(__dirname, '..', 'packages', kind, 'src');
      const flatDir = path.join(__dirname, '..', 'packages', 'flat', kind, 'src');
      for (const f of fs.readdirSync(srcDir).sort()) {
        if (f === '00-host.js') continue;           /* hand-written, never cut */
        const a = path.join(srcDir, f), b = path.join(flatDir, f);
        if (!fs.existsSync(b)) { pairs.push(kind + '/' + f + ' (missing from flat)'); continue; }
        if (fs.readFileSync(a, 'utf8') !== fs.readFileSync(b, 'utf8')) pairs.push(kind + '/' + f + ' (differs)');
      }
    }
    note('flat record', pairs.length ? pairs.length + ' section(s) out of step' : 'in step with all sections');
    if (pairs.length) bad.push('sections edited but not mirrored into packages/flat: ' + pairs.slice(0, 6).join(' · ') +
      ' - mirror them, or the bootstrap will quietly undo them');

    const out = require('child_process').spawnSync(process.execPath,
      [path.join(__dirname, '..', 'tools', 'split.mjs')], { encoding: 'utf8' });
    if (out.status === 0) bad.push('tools/split.mjs ran without --bootstrap: it rewrites the sections from the ' +
      'reference file and reverts hand edits, so it has to refuse unless it is asked for by name');
    else note('bootstrap refusal', 'split.mjs exits ' + out.status + ' without --bootstrap');
  }

  if (bad.length) {
    console.log('\nMODULE ISSUES (' + bad.length + '):');
    for (const b of bad) console.log('  - ' + b);
    process.exit(1);
  }
  console.log('\nMODULES CLEAN — the simulation runs as a module, and it is the same game');
  process.exit(0);
})();
