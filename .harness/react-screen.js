/*
  Gate: a converted screen and the screen it replaced must offer the same game.

  Converting a screen from string-building to React is exactly the kind of
  change that looks fine and is not: every number is re-derived, every class is
  re-typed, and the failure mode is a control that no longer works, or a figure
  that quietly reads differently. Nothing about the difference shows up in a
  screenshot, and nothing in the existing suite knows the screen was rewritten.

  So this gate renders BOTH versions of the same screen, from the same game
  state, and compares what they offer. Not the bytes - the two are allowed to
  differ in whitespace, attribute order and element nesting, and a gate that
  demands identical markup would be a gate that gets deleted the first time it
  is right for the wrong reason.

  What it compares, and why each one matters:

    1. every control: data-a plus all of its data-* attributes, as multisets.
       A missing button is a missing feature; a changed data-t is a button that
       acts on the wrong thing.
    2. every input: type, data-inp, data-k, min, max, step, value. A slider
       with a different max is a lever that stops working at the wrong place.
    3. every state marker: disabled, and the reason attached to it.
    4. every h3 heading, as a multiset - the shape of the screen.
    5. every money figure printed anywhere, as a multiset. This is the one that
       catches an arithmetic slip in the port, and it is the reason the gate
       renders the same state twice rather than trusting a fixture.
    6. every CSS class token used. The React version may add one; it may not
       drop one, because a dropped class is styling that silently vanished.

  Claims are asserted on BOTH states a screen can be in - the game is a game,
  and a screen that agrees with itself only when you have no company has not
  been checked. The fixtures come from the same fixed seed as every other gate.

  Deliberately not asserted: element order, attribute order, inline styles,
  text wording (only the figures inside the text), or which renderer is
  "better". This gate exists to prove a rewrite changed nothing a player can
  act on.
*/
require('./dom.js');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const M = require('./mod.js');                       /* the single-file build */

/* Two builds, one game. The legacy renderer is driven from the single-file
   harness build (mod.js); the React screens import @ledger/core, which is the
   same code as a real module and therefore a different instance with its own
   `S`. So the fixture is run twice - once in each build, same seed, same
   profile - and the two screens are compared across them.

   That is not a workaround; it is a stronger check than comparing one state
   with itself. modules.js already proves the two builds resolve 40 quarters to
   the same 53 fields, so if a screen renders differently in the two it is the
   conversion that disagrees, and if the two builds ever drift apart this gate
   says so too. */
let core = null;
const win = new JSDOM('<!doctype html><body></body>').window;
const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const pad = (s, n) => String(s).padEnd(n);

/* ---- the converted screens, straight out of the app ------------------- */
const SCREENS_DIR = path.join(ROOT, 'apps', 'web', 'screens');
const indexFile = path.join(SCREENS_DIR, 'index.jsx');

/* The app's index.js is ESM with JSX imports and no build step of its own in
   node, so it is bundled here the same way Next bundles it: esbuild, JSX
   automatic, react left external so both sides share one React. */
async function loadConverted() {
  const out = await esbuild.build({
    entryPoints: [indexFile],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    loader: { '.js': 'jsx' },      /* the screens directory is all JSX, whatever the extension */
    external: ['react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react/jsx-runtime', '@ledger/core'],
    write: false,
    logLevel: 'silent'
  });
  const code = out.outputFiles[0].text;
  /* The scratch module has to be written inside the workspace, not /tmp: bare
     specifiers ('react-dom/server') resolve from the file's own location, and
     a file in /tmp cannot see the workspace's node_modules. */
  const tmp = path.join(__dirname, '.screens-' + process.pid + '.mjs');
  fs.writeFileSync(tmp, code);
  const mod = await import('file://' + tmp);
  fs.rmSync(tmp, { force: true });
  /* in the app this is @ledger/ui's builtinScreen; here it is the single-file
     harness build, which modules.js already proves is the same game */
  if (mod.setPlatformFacts) {
    mod.setPlatformFacts({
      canInstall: () => (typeof M.installAvailable === 'function' ? M.installAvailable() : false),
      canScan: () => false
    });
  }
  if (mod.setBuiltinRenderer) {
    mod.setBuiltinRenderer((name, ...args) => {
      const fn = M[name];
      if (typeof fn !== 'function') {
        bad.push('a converted screen asked for a panel that does not exist: ' + name);
        return '';
      }
      return fn.apply(null, args);
    });
  }
  return mod;                     /* the module, so the gate can ask what it groups */
}

/* ---- reading a screen, whichever renderer produced it ----------------- */
/* Is this element something the player can actually see and press?

   The game hides things with inline styles, and it always has: the Install
   button was rendered with style="display:none" until the browser offered an
   install prompt, which is exactly how it went a long time without ever being
   pressable. A gate that reads hidden elements is a gate that can be satisfied
   by markup no player can reach - so it compares the controls a player can use
   and the text a player can read, and says so when the two renderers disagree
   about which elements those are.

   Found with this screen: the built-in version emitted the button hidden, the
   React version omitted it, and the comparison reported a *missing control* -
   the one thing it must never be wrong about, wrong for a reason that had
   nothing to do with the conversion. The built-in now omits it too (a control
   that does not exist cannot be found); this rule is what made that visible. */
function visible(el) {
  let n = el;
  while (n && n.nodeType === 1) {
    if (n.hasAttribute && n.hasAttribute('hidden')) return false;
    const st = (n.getAttribute && n.getAttribute('style')) || '';
    if (/display\s*:\s*none/i.test(st) || /visibility\s*:\s*hidden/i.test(st)) return false;
    n = n.parentElement;
  }
  return true;
}

function read(html) {
  const d = win.document.createElement('div');
  d.innerHTML = String(html);
  const controls = [];
  d.querySelectorAll('button, [data-a]').forEach(el => {
    if (!visible(el)) return;
    const attrs = {};
    for (const a of Array.from(el.attributes)) {
      if (a.name.startsWith('data-')) attrs[a.name] = a.value;
    }
    controls.push(JSON.stringify({
      a: attrs['data-a'] || '',
      attrs,
      disabled: el.hasAttribute('disabled'),
      why: (el.getAttribute('title') || '').trim()
    }));
  });
  const inputs = [];
  d.querySelectorAll('input').forEach(el => {
    inputs.push([el.getAttribute('type'), el.getAttribute('data-inp'), el.getAttribute('data-k'),
      el.getAttribute('min'), el.getAttribute('max'), el.getAttribute('step'), el.getAttribute('value')].join('|'));
  });
  /* Selects, which the first version of this gate did not read at all.
     `input` does not match them and they carry data-role / data-outlet rather
     than data-a, so a screen could have converted with every dropdown pointing
     at the wrong person, or missing an option, and the comparison would have
     reported a pass. A dropdown is a control: its target and its whole option
     list are compared, and which one is selected. */
  const selects = [];
  d.querySelectorAll('select').forEach(el => {
    const target = Array.from(el.attributes)
      .filter(a => a.name.indexOf('data-') === 0 && a.name !== 'data-a')
      .map(a => a.name + '=' + a.value).join(' ');
    const options = Array.from(el.options).map(o => o.value + ':' + o.textContent.replace(/\s+/g, ' ').trim()).join(' · ');
    selects.push(target + ' | selected=' + el.value + ' | ' + options);
  });
  const heads = [];
  d.querySelectorAll('h3').forEach(el => { if (visible(el)) heads.push(el.textContent.replace(/\s+/g, ' ').trim()); });
  /* the text a player reads: hidden subtrees contribute nothing, because a
     control nobody can see must not count as something the player was told */
  const shown = d.cloneNode(true);
  shown.querySelectorAll('*').forEach((el) => { if (!visible(el)) el.remove(); });
  /* figures: currency amounts only, so wording can change and arithmetic cannot */
  const text = shown.innerHTML.replace(/<[^>]*>/g, ' ');
  const money = (text.match(/₦[0-9][0-9,.]*[kmbn]?/gi) || []).map(s => s.toLowerCase());
  /* ...and every other number that reaches the screen: sizes, scores, out of
     hundreds, counts, quarters. A readout screen like Rival prints no naira at
     all - it prints "size 47/140 · aggression 43/100" and two stat rows - so a
     gate that counts currency has checked none of it. */
  const numbers = (text.match(/[0-9]+(?:[.,][0-9]+)?/g) || []);
  const classes = new Set();
  d.querySelectorAll('*').forEach(el => {
    const c = el.getAttribute('class');
    if (c) c.split(/\s+/).forEach(t => t && classes.add(t));
  });
  /* the text, whitespace-normalised, as one string. This is the claim that
     makes the gate a *port* check rather than a structure check: a conversion
     is allowed to re-nest elements, re-order attributes and move style objects
     around, and it is not allowed to change a word the player reads. It was
     added because a mutation proved the gap - moving Rival's "Wary" threshold
     from 20 to 25 changed a status word on screen and the gate saw nothing,
     since nothing was comparing words at all. */
  const body = shown.textContent.replace(/\s+/g, ' ').trim();
  /* the raw markup too, for the one claim that cannot be read off the parsed
     document: who rendered it */
  return { html: String(html), controls, inputs, selects, heads, money, numbers, body, classes, buttons: d.querySelectorAll('button').length };
}

const tally = list => list.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {});
function diffMultiset(label, a, b, report) {
  const A = tally(a), B = tally(b);
  const missing = [], extra = [];
  for (const k of Object.keys(A)) if ((B[k] || 0) < A[k]) missing.push(k + (A[k] > 1 ? ' x' + A[k] : ''));
  for (const k of Object.keys(B)) if ((A[k] || 0) < B[k]) extra.push(k + (B[k] > 1 ? ' x' + B[k] : ''));
  if (missing.length) report.push('missing from React: ' + missing.slice(0, 5).join(' · '));
  if (extra.length) report.push('only in React: ' + extra.slice(0, 5).join(' · '));
  return missing.length + extra.length;
}

/* ---- the branches a comparison has to stand in -------------------------

   Comparing two renderers in a state that never draws the interesting branch
   compares them about the parts that were never in question. This has cost
   this project three separate times: a fixture comfortably inside the Wary band
   could not see a threshold move, five states that all left the portfolio table
   empty "agreed" about an empty table, and Commitments' only control - Abandon -
   sat in a box no fixture reached.

   So the fixtures' reach is asserted, not assumed. Each entry names a screen, a
   fixture by name, and a phrase that screen must show in that fixture. If a
   fixture stops reaching its branch, this fails and says so, instead of the
   comparison quietly getting weaker while still printing "agree". */
const REACH = [
  ['viewWorkingCapital', 'a build in flight, staff ramping and leaving, and thin working capital',
    /You do not have it\. Growth is what will kill/, 'the amber bill-for-growth box'],
  ['viewWorkingCapital', 'a build in flight, staff ramping and leaving, and thin working capital',
    /served off a shelf you never paid for/, 'the under-funded shelf warning'],
  ['viewWorkingCapital', 'a build in flight, staff ramping and leaving, and thin working capital',
    /days behind with suppliers/, 'the supplier-confidence note'],
  ['viewCommitments', 'a build in flight, staff ramping and leaving, and thin working capital',
    /arrives in \d+ quarter/, 'a build that is still arriving'],
  ['viewCommitments', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Abandon/, 'the Abandon control'],
  ['viewCommitments', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Working notice/, 'someone working their notice'],
  ['viewCommitments', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Still finding their feet/, 'someone still ramping'],
  ['viewMoneyBudget', 'overspending: budget above income', /more than you earn/, 'the overspend warning'],
  ['viewDeals', 'deals on the table, an offer, and one commitment',
    /Lagos cold-chain run/, 'a deal row with its odds and its Commit control'],
  ['viewDeals', 'deals on the table, an offer, and one commitment',
    /Abuja pharmacy chain · |via Bode/, 'a deal somebody introduced'],
  ['viewDeals', 'deals on the table, an offer, and one commitment',
    /* world-first the offer is a face: their first name with the stake under
       it (the commitment line also says "Ngozi", so the name alone would prove
       nothing) */
    /Ngozi Adeyemi|Shake hands|Ngozi\s*20% · /, 'a partnership offer'],
  ['viewDeals', 'deals on the table, an offer, and one commitment',
    /resolves |committed/, 'a commitment already running'],
  ['viewDeals', 'deals on the table, an offer, and one commitment',
    /paid out early|went sour in Kano/, 'the deal history'],
  ['viewMoneyPosition', 'in debt, both kinds', /Repay/, 'the Repay controls'],
  ['viewRival', 'trading, with a rival and staff', /Wary|Hostile|Cordial|Trusted/, 'a named relationship'],
  ['viewInvestPortfolio', 'portfolio held, second company on the register', /\u20a6/, 'a held asset'],
  ['viewGovernance', 'portfolio held, second company on the register', /Which company/, 'the company switcher'],
  ['viewStaffDeep', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Make GM/, 'the promote-to-GM rule (skill 6 or better, and no GM yet)'],
  ['viewStaffDeep', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Train/, 'a person you can train'],
  ['viewOutlets', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Close unit/, 'Close unit, which exists only for a business with more than one'],
  ['viewOutlets', 'a build in flight, staff ramping and leaving, and thin working capital',
    /RENEWAL DUE/, 'a lease that has already run out'],
  ['viewOutlets', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Negotiate the renewal/, 'a lease with a quarter left'],
  ['viewOutlets', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Maintain/, 'the maintenance control'],
  ['viewContracts', 'a build in flight, staff ramping and leaving, and thin working capital',
    /Walk away from it/, 'a live contract with its walk-away control'],
  ['viewContracts', 'trading, with a rival and staff', /On tender/, 'the tender list'],
  ['viewLegacy', 'trading, with a rival and staff', /The scoreboard that matters at 65/, 'the other scoreboard'],
  ['viewLegacy', 'trading, with a rival and staff', /Posterity/, 'the posterity card and its will controls'],
  ['viewLedgerSettings', 'trading, with a rival and staff', /Save & load/, 'the save slots'],
  /* the install section is now the Device & data card, and what identifies it
     on the screen is the line about running with the network off - the word
     "Install" only appears on the button, which only exists while the browser
     has a prompt in hand, so a guard keyed on it would fail for a reason that
     has nothing to do with the section being there */
  ['viewLedgerSettings', 'trading, with a rival and staff', /runs with the network off/, 'the install section'],
  ['viewInvestMarkets', 'trading, with a rival and staff', /Macro picture/, 'the macro picture'],
  ['viewInvestMarkets', 'portfolio held, second company on the register', /holding /, 'an asset you already hold'],
  ['viewOverview', 'trading, with a rival and staff', /Where you stand/, 'where you stand'],
  ['viewOverview', 'trading, with a rival and staff', /Advance to/, 'the Advance control'],
  ['viewOverview', 'a build in flight, staff ramping and leaving, and thin working capital', /Waiting on you/, 'the agenda nested inside Overview'],
  ['viewCareer', 'trading, with a rival and staff', /What you can do this quarter/, 'the career actions'],
  ['viewCareer', 'trading, with a rival and staff', /Do it/, 'the Do it control with its stated reason'],
  ['viewCareerRecord', 'trading, with a rival and staff', /Challenge|challenge index/, 'this run\u2019s challenge index'],
  ['viewCareerRecord', 'trading, with a rival and staff', /Profile, sync/, 'the profile control']
];

/* ---- the states a screen has to agree with itself in ------------------
   A fixture is a script, not a pile of fields: it is written against a game
   API and run against both of them. `new()` returns the live state object
   because the two builds expose it differently - mod.js has getS(), core has
   the binding S. */
const STATES = [
  { name: 'fresh run', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
      return state(g);
    } },
  { name: 'comfortable, four quarters in', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4243 });
      const S = state(g);
      S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
      g.startBiz('tech', 'Testco', Math.round(4000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 4; i++) g.advanceQuarter();
      return S;
    } },
  /* Debt, because the liabilities table and its Repay buttons only exist for a
     player who owes something. A screen checked in two comfortable states has
     not been checked: banks and loan sharks are where the controls are. */
  /* A rival, a staff, outlets and the levers that only exist once you are
     actually trading. Three of the converted screens rendered nothing at all in
     the first three states - rival, chronicle, levers - and three states that
     show an empty screen three times have not checked the screen. */
  { name: 'trading, with a rival and staff', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4245 });
      const S = state(g);
      S.fin.cash = Math.round(25000000 * (S.cumInfl || 1));
      g.startBiz('food', 'Testco', Math.round(6000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 8; i++) g.advanceQuarter();
      if (!S.rival) S.rival = g.genRival();          /* rivals arrive on their own schedule */
      /* 22, not 68: on the boundary. The word on this screen changes at 20 and
         at 60, and a fixture comfortably inside a band cannot see a threshold
         move - the first mutation run on this screen proved exactly that, by
         moving "Wary" from 20 to 25 and rendering identically in all four
         states. A fixture sits on the edge of the branch it is testing. */
      S.rival.moves = 2; S.rival.relation = 22;
      return state(g);
    } },
  /* Overspending, because the budget screen has two whole branches - the
     "surplus" line and the "that is more than you earn" warning - and three
     fixtures that all live inside their means exercise one of them. A mutation
     run caught this by rewording the warning and rendering identically four
     times. A screen with a branch needs a fixture standing in that branch. */
  /* A portfolio, and a second company.
     Two screens were being "agreed" about while rendering their subject as
     nothing: the portfolio table is empty for a player who has never bought an
     asset, and the company switcher has one company to switch between unless
     somebody starts another. Five states that all render an empty table have
     not checked the table. This one buys into every asset the screen can list
     and starts a second company for the switchers and the board panel. */
  { name: 'portfolio held, second company on the register', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4247 });
      const S = state(g);
      S.fin.cash = Math.round(60000000 * (S.cumInfl || 1));
      g.startBiz('food', 'Testco', Math.round(6000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 4; i++) g.advanceQuarter();
      const list = g.ASSETS || M.ASSETS || [];
      list.forEach((a, i) => {
        const want = Math.max(a.min || 0, 25000 * (i + 1));
        g.buyAsset(a.id, want);
      });
      g.startBiz('tech', 'Secondco', Math.round(4000000 * (S.cumInfl || 1)), null);
      g.advanceQuarter();
      return state(g);
    } },
  { name: 'overspending: budget above income', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4246 });
      const S = state(g);
      Object.keys(S.fin.budget || {}).forEach((k) => { S.fin.budget[k] = 220000; });
      g.advanceQuarter();
      return state(g);
    } },
  /* A build in flight, staff arriving and staff on notice, and a working-capital
     squeeze. Commitments is a card whose only control is Abandon, and Abandon
     exists for a build that is still arriving - so a fixture without one
     compares the screen's paragraph and never its button. Working capital has
     three branches of its own (the amber bill box, the under-funded shelf
     warning, the supplier note) and one fixture reaches all three by hand:
     these are the fields the quarter engine writes, set to the values that
     select the branch. A fixture is a script, not a pile of fields - but a
     script is allowed to set the fields a quarter would have set. */
  { name: 'a build in flight, staff ramping and leaving, and thin working capital', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4248 });
      const S = state(g);
      S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
      g.startBiz('food', 'Testco', Math.round(6000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 4; i++) g.advanceQuarter();
      const b = S.biz;
      b.commitments = b.commitments || [];
      g.commitNew(b, { kind: 'unit', label: 'Location #2', total: Math.round(3000000 * (S.cumInfl || 1)),
        paid: Math.round(900000 * (S.cumInfl || 1)), lead: 3 });
      g.commitNew(b, { kind: 'fitout', label: 'Cold room', total: Math.round(1200000 * (S.cumInfl || 1)),
        paid: Math.round(1200000 * (S.cumInfl || 1)), lead: 1, readyAt: S.turn });
      /* Two units, so the unit table has more than one row and Close unit exists
         at all; one lease with a quarter left and one already due, which are two
         different branches of the same line; and someone at skill 7, because the
         only way "Make GM" appears is a person good enough to be one. */
      b.outlets = [
        { id: 'o1', name: 'Unit A', city: S.city, cond: 52, rent: Math.round(240000 * (S.cumInfl || 1)),
          end: 1, fitout: 3000000, size: 1, staff: [] },
        { id: 'o2', name: 'Unit B', city: S.city, cond: 30, rent: Math.round(180000 * (S.cumInfl || 1)),
          end: 0, fitout: 2500000, size: 2, staff: [] }
      ];
      b.staff = b.staff || [];
      b.staff.push({ id: 'st' + (++S.seq), name: 'Ngozi Eze', role: 'ops', skill: 7, salary: 220000, morale: 70,
        ramp: 0.4, outlet: 'o1' });
      b.staff.push({ id: 'st' + (++S.seq), name: 'Tunde Bakare', role: 'sales', skill: 2, salary: 180000, morale: 55,
        leaving: S.turn + 1, outlet: 'o2' });
      /* Two live contracts, normalised through core's own normaliser so they are
         the shape the engine writes: one with a quarter left (so the renewal
         button exists) and one with three (so it does not). */
      b.contracts = (b.contracts || []).concat([
        g.normaliseContract ? g.normaliseContract({ client: 'Ironwood Supplies', kind: 'supply', margin: 0.31,
          value: Math.round(900000 * (S.cumInfl || 1)), payDays: 45, turns: 1, renewals: 1,
          incidents: [] }) : { id: 'cn1', client: 'Ironwood Supplies', kindName: 'Supply agreement',
          margin: 0.31, value: 900000, payDays: 45, turns: 1, renewals: 1, incidents: [] },
        { id: 'cn' + (++S.seq), client: 'Bright Foods', kindName: 'Distribution', margin: 0.04,
          value: Math.round(600000 * (S.cumInfl || 1)), payDays: 30, turns: 3, renewals: 0, incidents: ['late'] }
      ]);
      /* the quarter engine's own fields, set to the values that select the branch */
      b.wcFunded = 0.55;
      b.supplierConf = 38;
      b.receivable = undefined;
      b.revenue = Math.round(2400000 * (S.cumInfl || 1));
      b.cogs = Math.round(1400000 * (S.cumInfl || 1));
      b.recv = Math.round(1900000 * (S.cumInfl || 1));
      b.inventory = Math.round(2100000 * (S.cumInfl || 1));
      b.payable = Math.round(2900000 * (S.cumInfl || 1));   /* dpo well past 45 days */
      b.cash = Math.round(60000 * (S.cumInfl || 1));        /* smaller than half the growth bill */
      return state(g);
    } },
  { name: 'in debt, both kinds', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4244 });
      const S = state(g);
      S.fin.cash = Math.round(1200000 * (S.cumInfl || 1));
      S.fin.debt.push({ id: 'd' + (++S.seq), name: 'Bank working capital', bal: Math.round(2400000 * (S.cumInfl || 1)), rate: 0.09, minPay: Math.round(288000 * (S.cumInfl || 1)), kind: 'bank' });
      S.fin.debt.push({ id: 'd' + (++S.seq), name: 'Informal lender', bal: Math.round(700000 * (S.cumInfl || 1)), rate: 0.18, minPay: Math.round(245000 * (S.cumInfl || 1)), kind: 'shark' });
      M.advanceQuarter && g.advanceQuarter();
      return state(g);
    } },
  /* Deals, an offer and a commitment in flight.

     Without this fixture the Deals screen is only ever compared with nothing on
     it: the deal row, the partnership offer and the running-commitment line all
     live behind S.deals / S.offers / S.active, and no other state fills them.
     A screen compared only in its empty state is a screen half checked - the
     comparison would agree about two "nothing here yet" paragraphs and never
     look at the markup a player actually reads when there IS something on the
     table. The REACH entries below hold this fixture to it. */
  { name: 'deals on the table, an offer, and one commitment', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4249 });
      const S = state(g);
      S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
      g.startBiz('food', 'Testco', Math.round(6000000 * (S.cumInfl || 1)), null);
      S.deals = [
        { id: 'dl' + (++S.seq), name: 'Lagos cold-chain run', capital: Math.round(2500000 * (S.cumInfl || 1)),
          desc: 'A distributor needs working capital for one season and pays on delivery.',
          turns: 3, ret: 0.34, risk: 0.25 },
        { id: 'dl' + (++S.seq), name: 'Abuja pharmacy chain', capital: Math.round(900000 * (S.cumInfl || 1)),
          desc: 'Two outlets, one lease dispute, and a price that assumes both.',
          turns: 1, ret: 0.2, risk: 0.4, via: 'Bode' }
      ];
      S.active = [
        { id: 'ac' + (++S.seq), name: 'Ibadan poultry cycle', capital: Math.round(1200000 * (S.cumInfl || 1)),
          due: S.turn + 3, via: 'Ngozi' }
      ];
      S.offers = [
        { id: 'of' + (++S.seq), name: 'Ngozi Adeyemi', equity: 20, capital: Math.round(4000000 * (S.cumInfl || 1)),
          bg: 'runs a logistics yard on the Apapa road', skill: 'logistics', ask: 'wants a board seat and the books' }
      ];
      S.digest = (S.digest || []).concat([
        { turn: Math.max(1, S.turn - 2), kind: 'deal', tone: 'good', text: 'The poultry cycle paid out early.' },
        { turn: Math.max(1, S.turn - 5), kind: 'deal', tone: 'bad', text: 'A deal went sour in Kano.' }
      ]);
      return state(g);
    } },
  /* A season the player is actually in. Eight fixtures that all leave `S.season`
     null compared exactly one of Season's two states - the "not in one" card -
     eight times over: the board, the six axes and the live score, which are the
     screen, were never rendered by either side. The season is assigned after the
     quarters are advanced so the run does not hit its own finish line on the way
     here. */
  { name: 'in a season, twelve quarters from the finish line', run: (g, state) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4250 });
      const S = state(g);
      S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
      g.startBiz('tech', 'Testco', Math.round(4000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 4; i++) g.advanceQuarter();
      S.season = {
        code: 'SEA-4K2M', name: 'Lagos, forty quarters', seed: 4250,
        startTurn: S.turn, endTurn: S.turn + 12, hardStop: true, organiser: true
      };
      /* The board itself. It only draws for a signed-in player, and only marks a
         row as yours when the name and the total match what was submitted - so
         without this the one table on the screen, and the chip that says which
         row is the reader's, would never be rendered by either side. The leader
         board cache is told this season is already loaded so the refresh call
         does not go to the network. */
      const pr = g.ensureProfile();
      pr.cloud = { url: 'https://seasons.test', key: 'anon-key', token: 'anon-token' };
      pr.handle = 'Ada';
      const sc = g.scoreRun();
      S._submitted = S.season.code;
      S._lbFor = S.season.code;
      S._lb = [
        { player: 'Bode', total: 812, score: { rank: 'Trader' } },
        { player: 'Ada', total: sc.total, score: { rank: sc.rank } },
        { player: 'Chidi', total: 540, score: { rank: 'Operator' } }
      ];
      return state(g);
    } }
];

/* the two game instances this gate can drive */
const BUILDS = [
  { label: 'single file', g: M, state: () => M.getS() },
  { label: '@ledger/core', g: null, state: () => core.S }        /* filled in below */
];

/* A fixture is a script, and a script needs a clock.

   `S.startedAt` is Date.now() when a run begins, and the Settings screen prints
   the entire save state as one portable string, so two runs started a few
   milliseconds apart differ - by exactly that number, which is not a difference
   between the two renderers. The clock is frozen for the whole run, so the
   comparison stays about what the screens do with the state rather than about
   when the state was made. */
const FROZEN_AT = 1757000000000;
Date.now = () => FROZEN_AT;

(async () => {
  core = await import('@ledger/core');
  core.installHost(core.host);          /* no DOM, no drawing: this gate reads markup */
  BUILDS[1].g = core;

  /* The profile handle id is minted randomly the first time a profile is needed
     (`pm` + eight characters), so the two game instances in this process - the
     single file and @ledger/core - print different ids for the same unset
     profile. That is a difference between the fixtures, not between the two
     renderers, and it is the same class of thing as the clock above: pin it, so
     what is left in the comparison is what the screens do with the state. */
  const pinProfile = () => BUILDS.forEach((b) => {
    if (!b.g) return;
    b.g.ensureProfile().id = 'pmledger01';
    /* And the record header says when the run was last saved. The single file
       saves through its own storage on every move and records the time; the core
       instance's newGame saves through the gate's null host, so nothing records
       it there. Same state, or the comparison is about which save plumbing a
       build has rather than about what the screen draws. */
    b.g.noteSaved(Date.now());
  });
  pinProfile();

  const appMod = await loadConverted();
  const converted = appMod.converted;
  /* A name with a slash is a route the app assembles itself, not a screen: core
     never asks for it by that name and there is no panel to compare it with.
     react-route.js owns those, route for route. */
  const composed = Object.keys(converted).filter((n) => n.indexOf('/') >= 0);
  const names = Object.keys(converted).filter((n) => n.indexOf('/') < 0);
  console.log('converted screens : ' + (names.length ? names.join(', ') : '(none)'));
  if (composed.length) console.log('composed routes   : ' + composed.join(', ') + '  (checked by react-route.js)');
  if (!names.length) {
    console.log('\nREACT CLEAN — no screen is converted yet, so there is nothing to disagree');
    process.exit(0);
  }

  /* A screen that arranges its own sections has to be compared against the
     screen the game actually drew - which for a route the app groups itself is
     the screen AFTER core's grouping layer has had it. Comparing the port with
     the raw panel would fail on the section headers the port is now responsible
     for and on the cards a collapsed section does not emit, which is the port
     behaving correctly. react-route.js compares the whole route in the running
     app; this is the same claim, one screen at a time and in both builds. */
  const groupedScreens = {};
  if (appMod.groupedRoutes && appMod.groupedRoutes.length) {
    /* Asking who owns a route composes it with the host answering nothing, and
       composing it reads the state - the router decides what a route is from the
       game, not from a list. So there has to be a game before the question can
       be asked. It is thrown away: the STATES loop below makes its own. */
    if (!core.S) core.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
    const ui = await import('@ledger/ui');       /* routeOwnership lives there, not in the app */
    /* A route the app assembles itself is left out: its sections are the route
       component's business, not any one screen's, so comparing the panel against
       `groupRoute(panel, key)` would ask a panel to be a route. react-route.js
       compares those, whole route against whole route. */
    const composedKeys = appMod.composedRoutes || [];
    const selfGrouped = (appMod.groupedRoutes || []).filter((k) => composedKeys.indexOf(k) < 0);
    for (const key of selfGrouped) {
      ui.setAppGroups([key]);
      core.UI.tab = key.split('/')[0];
      core.UI.sub = key.split('/')[1] || null;
      for (const n of ui.routeOwnership().names) {
        (groupedScreens[n] = groupedScreens[n] || []).push(key);
      }
    }
    ui.setAppGroups(appMod.groupedRoutes || []);
  }
  if (Object.keys(groupedScreens).length) {
    console.log('grouped screens   : ' + Object.entries(groupedScreens).map(([n, k]) => n + ' (' + k.join(', ') + ')').join(', '));
  }
  const asTheGameDrew = (name, key) => {
    /* A screen that arranges its own sections only does so on its own route -
       `Group` asks core which route is being drawn - so the route is made
       current before either renderer runs. Without this the port renders its
       cards without their sections on whatever route happened to be current,
       and the comparison fails for the port being right.

       BOTH builds are told, because the two legs render from different ones: the
       string leg is the single-file build's own screen function and reads that
       build's `UI`. Setting only the module build's `UI` compared the app's
       Register panels against the single-file build's Pack panels - which is the
       kind of failure that looks like a broken port and is a broken fixture. */
    if (key) {
      for (const g of [core, M]) {
        g.UI.tab = key.split('/')[0];
        g.UI.sub = key.split('/')[1] || null;
      }
    }
    const html = M[name]();
    if (!key) return html;
    if (typeof M.groupRoute !== 'function') {
      bad.push(name + ' is on a route the app groups itself, but this build cannot group it, ' +
        'so the comparison would be against the wrong screen');
      return html;
    }
    return M.groupRoute(html, key);
  };

  const coverage = {};
  for (const name of names) {
    const legacy = M[name];
    ck(typeof legacy === 'function',
      name + ': the app converts this screen but the game has no such screen - the name is wrong, ' +
      'and core will never call it, so the conversion is invisible');
    if (typeof legacy !== 'function') continue;

    for (const state of STATES) {
      /* the fixture runs in both builds, and each renderer draws from its own */
      const st = {};
      pinProfile();                      /* the fixtures start runs, so re-pin per fixture */
      for (const b of BUILDS) st[b.label] = state.run(b.g, b.state);
      /* A screen can be on more than one arranged route - viewGovernance draws
         both Pack and Register, and each has its own sections - so it is compared
         once per route. One comparison would be against whichever key happened to
         be registered last, and the other route's arrangement would never be
         checked at all. */
      for (const key of (groupedScreens[name] || [null])) {
      const before = read(asTheGameDrew(name, key));
      const after = read(converted[name]());
      const where = name + (key ? ' [' + key + ']' : '') + ' · ' + state.name;
      const problems = [];
      diffMultiset('controls', before.controls, after.controls, problems);
      diffMultiset('inputs', before.inputs, after.inputs, problems);
      diffMultiset('selects', before.selects, after.selects, problems);
      diffMultiset('headings', before.heads, after.heads, problems);
      diffMultiset('figures', before.money, after.money, problems);
      diffMultiset('numbers', before.numbers, after.numbers, problems);
      if (before.body !== after.body) {
        let i = 0;
        while (i < before.body.length && before.body[i] === after.body[i]) i++;
        const at = Math.max(0, i - 40);
        problems.push('the text read differently from character ' + i + ':\n' +
          '        built-in: …' + before.body.slice(at, i + 40) + '…\n' +
          '        React   : …' + after.body.slice(at, i + 40) + '…');
      }

      /* does this fixture actually reach the branch it is here for? */
      /* REACH is about the FIXTURE, not about the arrangement: it asks whether
         the state a screen is compared in actually draws the branch that screen
         is interesting for. So it is checked against the screen's own markup,
         never against the grouped version - a group that starts collapsed
         (legacy/ambition's `The long view`, which holds Posterity and the will
         controls) legitimately hides its members, and reading that as "the
         fixture reached nothing" would fail the gate for the grouping working
         exactly as the game's own grouping does. */
      const own = read(M[name]());
      /* world-first a screen's rows can be tiles whose controls are on the card
         each opens - the same core card in both renderers. The branch is still
         reached if it is one tap away, so the cards behind the screen's tiles
         are read with it; the comparison above is of the screen itself. */
      const behind = (String(M[name]()).match(/data-a="hot" data-k="[^"]+"(?: data-c="[^"]*")?/g) || []).map((t) => {
        const k = /data-k="([^"]+)"/.exec(t)[1], c = /data-c="([^"]*)"/.exec(t);
        try { return read(M.hotModal({ type: 'hot', kind: k, id: c ? c[1] : undefined })).body; } catch (e) { return ''; }
      }).join(' ');
      for (const [rname, rstate, re, label] of REACH) {
        if (rname !== name || rstate !== state.name) continue;
        if (!re.test(own.body) && !re.test(behind)) {
          bad.push(name + ' · ' + state.name + ': this fixture was supposed to reach ' + label +
            ', and the screen does not show it - the comparison is weaker than it looks');
        }
      }

      const droppedClasses = Array.from(before.classes).filter(c => !after.classes.has(c));
      if (droppedClasses.length) problems.push('CSS classes lost: ' + droppedClasses.slice(0, 6).join(' '));

      /* WHO DREW IT.
         "The override is registered" and "the override is what rendered" are
         two different claims, and only the second one is worth anything: a
         screen can be listed in the app's map, misspelt against the registry,
         and be drawn by the old string builder with nothing to show for the
         conversion except a line in the console. The converted markup carries
         data-react="<name>" on its first element for exactly this check - in
         the browser, where the answer is the real one. */
      const stamp = 'data-react="' + name + '"';
      const stamped = after.html.split(stamp).length - 1;
      /* a screen that legitimately renders nothing has no root element to
         stamp - the agenda card is absent when nothing needs a decision - and
         an empty screen cannot claim to have been drawn by anyone. The text
         comparison above is what catches a screen that went quiet when it
         should have spoken. */
      if (String(after.html).trim().length && stamped !== 1) {
        problems.push('the converted markup does not carry ' + stamp + ' exactly once ' +
          '(found ' + stamped + ') - nothing outside this gate could tell who rendered it');
      }
      if (before.html.indexOf('data-react') >= 0) {
        problems.push('the built-in screen carries a data-react marker - the marker no longer ' +
          'distinguishes the two renderers, so every check that reads it is worthless');
      }

      /* the React version must render something, and roughly as much */
      if (after.buttons === 0 && before.buttons > 0) problems.push('React rendered no controls at all');
      if (after.controls.length !== before.controls.length) {
        problems.push('controls ' + before.controls.length + ' -> ' + after.controls.length);
      }

      console.log('  ' + pad(where, 52) + before.controls.length + ' controls · ' +
        before.money.length + ' figures · ' + before.numbers.length + ' numbers · ' +
        before.classes.size + ' classes' +
        (problems.length ? '   DISAGREE' : '   agree'));
      if (problems.length) bad.push(where + '\n      ' + problems.join('\n      '));
      coverage[name] = coverage[name] || { controls: 0, figures: 0, states: 0, empty: 0 };
      coverage[name].controls += before.controls.length;
      coverage[name].figures += before.money.length + before.numbers.length;
      coverage[name].states++;
      /* "empty" means the screen showed nothing to compare - no controls, no
         numbers - not merely "no buttons and no naira" */
      if (!before.controls.length && !before.numbers.length) coverage[name].empty++;
      }
    }
  }

  /* ---- the branch where the browser can install the game ----------------

     Settings is the one screen that renders from a fact about the platform
     rather than about the run: whether the browser has an install prompt in
     hand. It is exactly the kind of branch a conversion gets wrong quietly,
     and it is the screen where an unreachable Install button lived for the
     life of the game, so it gets its own comparison in both directions rather
     than a comment claiming it works.

     In the app, the screen asks the host (setPlatformFacts) and the host asks
     the ui package - so here it asks the harness build, which is the same
     wiring with the same single source of truth. */
  if (converted.viewLedgerSettings) {
    const before = read(M.viewLedgerSettings());
    const after = read(converted.viewLedgerSettings());
    ck(!before.controls.some(c => c.includes('installapp')),
      'the built-in Settings offers Install with no prompt outstanding');
    ck(!after.controls.some(c => c.includes('installapp')),
      'the converted Settings offers Install with no prompt outstanding');
    if (typeof M.installAvailable === 'function') {
      /* on the window the game is actually listening to - the harness window is
         a different object, and dispatching there tests nothing */
      global.window.dispatchEvent({ type: 'beforeinstallprompt', preventDefault(){} });
      ck(M.installAvailable() === true, 'the ui did not take the install prompt it was handed');
      const beforeOn = read(M.viewLedgerSettings());
      const afterOn = read(converted.viewLedgerSettings());
      const hasIt = (r) => r.controls.filter(c => c.includes('installapp')).length;
      ck(hasIt(beforeOn) === 1, 'the built-in Settings does not offer Install while a prompt is outstanding (' + hasIt(beforeOn) + ')');
      ck(hasIt(afterOn) === 1, 'the converted Settings does not offer Install while a prompt is outstanding (' + hasIt(afterOn) + ')');
      console.log('  install branch     : with no prompt, neither renderer offers Install · with one, both do');
      global.window.dispatchEvent({ type: 'appinstalled' });
    }
  }

  /* A converted screen that renders nothing but an empty state in every
     fixture has been compared, and compared correctly, and proved nothing. Say
     so rather than reporting a pass: this is the way a screen-conversion gate
     lies, and the first run of it lied exactly here - viewRival agreed with
     itself three times about the words "Nobody is competing with you yet." */
  console.log('');
  for (const [name, c] of Object.entries(coverage)) {
    const verdict = c.empty === c.states
      ? 'NOTHING WAS EXERCISED (' + c.states + ' states, all empty)'
      : c.controls + ' controls and ' + c.figures + ' figures compared across ' + c.states + ' states';
    console.log('  ' + pad(name, 22) + verdict);
    if (c.empty === c.states) {
      bad.push(name + ': every fixture renders an empty screen - the conversion is compared ' +
        'against emptiness, so nothing about it has been proved. Add a fixture that reaches the ' +
        'populated state, or stop claiming this screen is converted');
    }
  }

  if (bad.length) {
    console.log('\nSCREEN ISSUES (' + bad.length + '):');
    for (const b of bad) console.log('  - ' + b);
    process.exit(1);
  }
  console.log('\nREACT CLEAN — every converted screen offers exactly what it replaced');
  process.exit(0);
})();
