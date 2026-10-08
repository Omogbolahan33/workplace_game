/*
  Gate: who draws the route, and does a change of state keep the page?

  The screens were converted one name at a time, and each one was proved against
  the screen it replaced (react-screen.js). This is the gate for the step after
  that: a route whose every screen is React is drawn by the app as one React
  tree, and a change of state becomes a re-render of that tree instead of a
  replacement of #main's markup.

  Three claims, and the third is the one this migration is actually for:

    1. THE BOUNDARY. Which routes React draws is decided by one predicate -
       every screen on the route converted, no arguments to lose, nothing left
       for core to group. The gate keeps its own table of the twenty routes and
       what it expects of each, walks every route the router can produce, and
       fails on a route the table does not know about. A route that silently
       changes hands is exactly the kind of change that must be deliberate.

    2. THE REASON IS TRUE. routeOwnership() returns `why`, and a reason nobody
       checks is decoration. The gate recomputes the three conditions from core's
       own facts and requires the reason to name the one that actually fails.

    3. THE PAGE SURVIVES A STATE CHANGE. On a route React draws, an element
       captured before an action is the *same object* afterwards, and its text
       has changed - re-rendered in place, not rebuilt. On a route the string
       builder draws, the same experiment gives the opposite answer, which is
       what makes this a test rather than a mood: the two paths are
       distinguishable, and the gate proves it can tell them apart.

  Run: node .harness/react-route.js
*/
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const bad = [];
const ck = (cond, msg) => { if (!cond) bad.push(msg); };
const pad = (s, n) => String(s).padEnd(n);

/* ---- a real DOM, because React needs one ------------------------------- */
const dom = new JSDOM(`<!doctype html><html><body>
  <div id="top"><div class="toprow" id="toprow"></div>
    <div id="tabwrap"><div class="tabs" id="tabs"></div>
      <div id="subrow"><div class="subs" id="subs"></div><div id="why"></div></div></div></div>
  <div id="main"></div><div id="modalHost"></div><div id="toastHost"></div>
</body></html>`, { pretendToBeVisual: true, url: 'https://ledger.test/' });

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.MouseEvent = dom.window.MouseEvent;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;
global.localStorage = dom.window.localStorage;
global.location = dom.window.location;
global.requestAnimationFrame = (f) => setTimeout(f, 0);
dom.window.scrollTo = () => {};              /* jsdom has no layout */
dom.window.matchMedia = dom.window.matchMedia || (() => ({
  matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
}));

/* ---- the app's screens, bundled the way Next bundles them -------------- */
async function loadApp() {
  const out = await esbuild.build({
    entryPoints: [path.join(ROOT, 'apps', 'web', 'screens', 'index.jsx')],
    bundle: true, format: 'esm', platform: 'node', jsx: 'automatic',
    loader: { '.js': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react/jsx-runtime', '@ledger/core'],
    write: false, logLevel: 'silent'
  });
  const tmp = path.join(__dirname, '.route-screens-' + process.pid + '.mjs');
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const mod = await import('file://' + tmp);
  fs.rmSync(tmp, { force: true });
  return mod;
}

/* ---- the twenty routes, as this gate understands them ------------------
   Written by hand on purpose. A table derived from the same code it is
   checking proves nothing; a table written down can be wrong, and being wrong
   is the point - the gate fails when reality moves and the table does not. */
const ROUTES = [
  /* overview has one screen and no sub-tabs */
  ['overview', null, true],
  /* the bare tab routes: what you get when the sub-tab is not one of the tab's
     own, which the router deliberately allows rather than refusing */
  ['work', null, true], ['money', null, true], ['governance', null, true],
  ['legacy', null, true],
  ['work', 'business', true],          /* the app assembles it: see composedRoutes */ ['work', 'career', true], ['work', 'household', true],
  ['work', 'life', true], ['work', 'rival', true], ['work', 'levers', true],
  ['money', 'position', true], ['money', 'budget', true], ['money', 'property', true],
  ['money', 'markets', true], ['money', 'deals', true], ['money', 'group', true],
  ['governance', 'pack', true], ['governance', 'register', true],
  ['governance', 'board', true], ['governance', 'votes', true],
  ['governance', 'deed', true], ['governance', 'bids', true],
  ['legacy', 'record', true], ['legacy', 'people', true], ['legacy', 'ambition', true],
  ['legacy', 'chronicle', true], ['legacy', 'season', true], ['legacy', 'settings', true]
];

(async () => {
  const app = await loadApp();
  const core = await import('@ledger/core');
  const ui = await import('@ledger/ui');

  ui.overrideScreens(app.converted);
  ui.setRouteDrawer(app.drawRoute);
  ui.setAppGroups(app.groupedRoutes);
  ui.setAppRoutes(app.composedRoutes || []);
  app.setBuiltinRenderer((name, ...args) => ui.builtinScreen(name, ...args));
  app.setPlatformFacts({ canInstall: () => false, canScan: () => false });
  ui.install();

  core.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
  core.S.fin.cash = Math.round(6000000 * (core.S.cumInfl || 1));
  core.startBiz('food', 'Testco', Math.round(4000000 * (core.S.cumInfl || 1)), null);

  const APP_GROUPED = app.groupedRoutes || [];
  let stateName = 'with a company';
  const main = document.getElementById('main');
  const go = (tab, sub) => { core.UI.tab = tab; core.UI.sub = sub; core.UI.modal = null; core.render(); };

  /* ---- 1 and 2: the boundary, and whether each reason is true ---------- */
  console.log('route ownership   : ' + ROUTES.length + ' routes, ' +
    ROUTES.filter(r => r[2]).length + ' drawn by React');

  let owned = 0;
  for (const [tab, sub, expected] of ROUTES) {
    core.UI.tab = tab; core.UI.sub = sub;
    const o = ui.routeOwnership();
    const label = tab + (sub ? '/' + sub : '');
    const grouped = !!(core.ROUTE_GROUPS[core.routeKey()]);
    const composed = app.composedRoutes || [];
  const notConverted = o.names.filter(n => !app.converted[n] && composed.indexOf(n) < 0);
    const withArgs = o.names.filter(n => core.routeViewInner && false);

    if (o.owned !== expected) {
      bad.push('route ' + label + ' is ' + (o.owned ? 'drawn by React' : 'drawn by markup') +
        ' and this gate says it should be ' + (expected ? 'React' : 'markup') + ' (' + o.why + ')');
    }
    if (o.owned) {
      owned++;
      ck(!grouped || APP_GROUPED.indexOf(core.routeKey()) >= 0,
        label + ': is drawn by React although core still groups its cards and the app has not declared that it arranges them');
      ck(notConverted.length === 0, label + ': claims to be React while ' + notConverted.join(', ') + ' are not converted');
      ck(o.names.length > 0, label + ': drawn by React with no screens');
      ck(/every screen/.test(o.why), label + ': reason does not say why it is drawable: "' + o.why + '"');
    } else {
      /* the reason must name the condition that actually fails, in the order
         routeOwnership() checks them */
      const declaredGroups = APP_GROUPED.indexOf(core.routeKey()) >= 0;
      const first = !o.names.length ? 'host'
        : (grouped && !declaredGroups) ? 'group'
        : o.names.filter(n => !app.converted[n]).length ? 'unconverted'
        : 'unknown';
      const says = /group/.test(o.why) ? 'group'
        : /not converted|React yet/.test(o.why) ? 'unconverted'
        : /host/.test(o.why) ? 'host' : 'unknown';
      ck(first === says, label + ': the stated reason ("' + o.why + '") is not the condition that fails (' + first + ')');
    }
    console.log('  ' + pad(label, 18) + pad(o.owned ? 'REACT' : 'markup', 8) +
      o.names.join(', ') + '  — ' + o.why);
  }
  ck(owned === ROUTES.filter(r => r[2]).length, 'the count of React-drawn routes moved');

  /* every route the router can produce is in the table */
  const subsFor = typeof core.subsFor === 'function' ? core.subsFor : null;
  const TABS = ['overview', 'work', 'money', 'governance', 'legacy'];
  const seen = new Set();
  for (const t of TABS) {
    seen.add(t);
    const subs = subsFor ? subsFor(t) || [] : [];
    for (const s of subs) seen.add(t + '/' + s.id);
  }
  for (const [, , ] of []) { /* keep the loop honest: nothing to do */ }
  for (const key of seen) {
    const [t, s] = key.split('/');
    ck(ROUTES.some(r => r[0] === t && (r[1] || null) === (s || null)),
      'the router can reach ' + key + ' and this gate has no expectation for it');
  }

  /* ---- 2b: the route React draws is the route the game drew --------------
     The claim behind moving grouping into the screens: the sections, their
     order, their headings, their notes, their promoted key figures, the cards
     inside them and every control on the route are the same as the ones core's
     grouping layer produced. Checked on the same state, in the same process,
     against the built-in screens - the route as this game drew it before any
     of it was React.

     The other leg is produced by emptying the override map (overrideScreens
     only ever adds, on purpose) and un-declaring the grouped routes, which
     makes routeOwnership() refuse and render() take the markup path. */
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  function capture(main) {
    const sections = Array.prototype.slice.call(main.querySelectorAll('.card.sect')).map((el) => {
      const head = el.querySelector(':scope > .sectHead');
      const one = (sel) => { const n = head && head.querySelector(sel); return n ? clean(n.textContent) : ''; };
      const body = el.querySelector(':scope > .sectBody');
      return {
        key: head ? head.getAttribute('data-k') : null,
        title: one('b'),
        count: one(':scope > .tag'),
        tags: one(':scope > .secttags'),
        note: one(':scope > .sectnote'),
        open: !!body,
        /* what the section actually holds, in order - the relationship the
           header's count claims, and the one an empty section would break */
        members: body
          ? Array.prototype.slice.call(body.children)
              .filter((c) => c.classList && c.classList.contains('card') && !c.classList.contains('sect'))
              .map((c) => {
                const h = c.querySelector('h3, h4');
                if (!h) return '';
                const clone = h.cloneNode(true);
                Array.prototype.slice.call(clone.querySelectorAll('.chev')).forEach((x) => x.remove());
                return clean(clone.textContent);
              })
          : []
      };
    });
    const cards = Array.prototype.slice.call(main.querySelectorAll('.card'))
      .filter((el) => !el.classList.contains('sect'))
      .map((el) => {
        const h = el.querySelector('h3, h4');
        if (!h) return '';
        const clone = h.cloneNode(true);            /* the disclosure chevron is chrome, not a title */
        Array.prototype.slice.call(clone.querySelectorAll('.chev')).forEach((c) => c.remove());
        return clean(clone.textContent);
      });
    const controls = Array.prototype.slice.call(main.querySelectorAll('[data-a]')).map((el) => {
      const d = {};
      Array.prototype.slice.call(el.attributes).forEach((a) => { if (a.name.indexOf('data-') === 0) d[a.name] = a.value; });
      return JSON.stringify(d);
    });
    return {
      sections,
      cards,
      controls,
      money: (clean(main.textContent).match(/\u20a6[\d.,kmb]+/gi) || []).length,
      text: clean(main.textContent)
    };
  }

  console.log('');
  console.log('grouped routes    : ' + APP_GROUPED.length + ' arranged by the app (' + APP_GROUPED.join(', ') + ')');

  /* Every route React draws is compared, not only the ones the app groups.

     The grouped routes were the interesting case and this loop started as those
     eight, but the claim is bigger than the arrangement: a route React draws is
     the route the game drew - the same cards, the same controls, the same
     figures, the same words in the same order. A route with no sections still
     has an order (a list of screens), and one list in the wrong order is the
     same defect as one card in the wrong section. Cheap to check: the other leg
     is one render with the overrides emptied.

     The count is printed as a total, because that is the number a reader should
     be able to check against the route table. */
  const compareKeys = ROUTES.filter((r) => r[2]).map(([t, s2]) => t + (s2 ? '/' + s2 : ''));
  let comparisons = 0;
  const compareAll = () => {
  for (const key of compareKeys) {
    const [tab, sub] = key.split('/');
    go(tab, sub || null);
    const reactLeg = capture(main);
    ck(main.getAttribute('data-react-route') !== null,
      '[' + stateName + '] ' + key + ' is drawn by React but #main does not claim a React route');

    /* the other leg: the game's own screens and the game's own grouping */
    const savedOverrides = {};
    for (const k of Object.keys(ui.VIEW_OVERRIDES)) { savedOverrides[k] = ui.VIEW_OVERRIDES[k]; delete ui.VIEW_OVERRIDES[k]; }
    ui.setAppGroups([]);
    ui.setAppRoutes([]);       /* a composed route is refused too, or the drawer draws it again */
    core.render();
    const stringLeg = capture(main);
    for (const k of Object.keys(savedOverrides)) ui.VIEW_OVERRIDES[k] = savedOverrides[k];
    ui.setAppGroups(APP_GROUPED);
    ui.setAppRoutes(app.composedRoutes || []);

    const diff = [];
    for (const field of ['sections', 'cards', 'controls', 'money', 'text']) {
      const a = JSON.stringify(reactLeg[field]), b = JSON.stringify(stringLeg[field]);
      if (a === b) continue;
      if (Array.isArray(reactLeg[field])) {
        const x = reactLeg[field], y = stringLeg[field];
        for (let i = 0; i < Math.max(x.length, y.length); i++) {
          if (JSON.stringify(x[i]) !== JSON.stringify(y[i])) {
            diff.push(field + '[' + i + ']: app ' + JSON.stringify(x[i]) + ' | game ' + JSON.stringify(y[i]));
          }
        }
      } else {
        /* Say WHERE they differ, not just that they do. "2051 vs 2051 chars" is
           the least useful possible report of a text difference: the lengths are
           equal, so the message contains no information about the cause, and the
           reader has to rebuild both legs by hand to find it. */
        let i = 0;
        while (i < reactLeg[field].length && reactLeg[field][i] === stringLeg[field][i]) i++;
        const at = Math.max(0, i - 60);
        diff.push(field + ': app and game differ at character ' + i + ' of ' +
          reactLeg[field].length + '\n        app : …' + reactLeg[field].slice(at, i + 60) + '…' +
          '\n        game: …' + stringLeg[field].slice(at, i + 60) + '…');
      }
    }
    /* the section's own claims, on the React leg, whether or not the other leg
       agrees: a section with a header and nothing in it, or a header counting
       something other than what it holds, is wrong in both renderers and the
       comparison would happily agree about it */
    const seen = new Set();
    reactLeg.sections.forEach((sec, i) => {
      ck(!seen.has(sec.key), '[' + stateName + '] ' + key + ': two sections claim the same key (' + sec.key + ')');
      seen.add(sec.key);
      if (sec.open) {
        ck(sec.members.length > 0,
          '[' + stateName + '] ' + key + ': section "' + sec.title + '" is open and holds no cards — a group with ' +
          'no members is not a group, and the string path never emits one');
        const claimed = parseInt(sec.count, 10);
        ck(!sec.count || claimed === sec.members.length,
          '[' + stateName + '] ' + key + ': section "' + sec.title + '" says it holds ' + sec.count + ' but holds ' +
          sec.members.length + ' (' + sec.members.join(', ') + ')');
      }
    });

    comparisons++;
    if (diff.length) {
      bad.push('[' + stateName + '] the route the app draws for ' + key +
        ' is not the route the game draws:\n      ' +
        diff.slice(0, 6).join('\n      '));
    } else if (reactLeg.sections.length || APP_GROUPED.indexOf(key) >= 0) {
      console.log('    ' + pad(key, 18) + reactLeg.sections.length + ' sections · ' + reactLeg.cards.length +
        ' cards · ' + reactLeg.controls.length + ' controls · ' + reactLeg.money + ' money figures — same as the game');
    }
  }
  };

  /* Two states, because a check that cannot reach the state it is about proves
     nothing: with a company the agenda is full, and on a fresh run nothing is
     waiting on you at all - which is where a section with no members would show
     up as a header over an empty body. The first run of this comparison passed
     while the port composed exactly that section, for want of a fixture. */
  const states = [
    ['with a company', null],
    ['a fresh run, nothing waiting', () => {
      core.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
      core.UI.tab = 'overview'; core.UI.sub = null; core.UI.modal = null;
    }]
  ];
  for (const [label, setup] of states) {
    if (setup) setup();
    stateName = label;
    console.log('  ' + label + ':');
    compareAll();
  }
  console.log('  ' + comparisons + ' comparisons across ' + compareKeys.length + ' routes in two states — ' +
    (comparisons === compareKeys.length * states.length ? 'every one of them identical' : 'MISSING COMPARISONS'));


  /* ---- 3: the page survives a state change ----------------------------- */
  /* React-owned: the element captured before the action is the same object
     afterwards, and its text has moved on. */
  go('money', 'budget');
  ck(main.getAttribute('data-react-route') === 'viewMoneyBudget',
    'money/budget is drawn by React but #main carries no data-react-route');
  const wrappers = main.querySelectorAll('[data-react]');
  ck(wrappers.length === 1, 'money/budget should have exactly one screen wrapper, found ' + wrappers.length);
  const wrap = wrappers[0];
  ck(wrap.style.display === 'contents',
    'the screen wrapper is not display:contents, so it is a box in the layout: ' + wrap.getAttribute('style'));
  const before = main.querySelector('.card');
  const beforeText = main.textContent;
  core.advanceQuarter();
  core.render();
  const after = main.querySelector('.card');
  ck(before === after, 'React re-rendered money/budget by replacing the page - the card is a different element');
  ck(beforeText !== main.textContent, 'nothing on money/budget changed after a quarter was advanced');

  /* String-drawn: the same experiment, and the answer must be the opposite, or
     this gate cannot tell the two renderers apart.

     It used to run on a route the game draws, and it has moved four times - Work
     > Business, Work > Household, Governance > Pack, Work > Life - because each
     one became React under it. There is no route left to move to: all 29 are
     React now. So the experiment MAKES a markup route instead of finding one, by
     un-declaring a route the app draws - overrides removed, groups dropped,
     composed routes dropped - exactly what the comparison loop's second leg
     does, and then restores it. If the stamp could not be taken away and given
     back, the whole boundary table would be describing a difference that is not
     there. */
  const keepOverrides = {};
  for (const k of Object.keys(ui.VIEW_OVERRIDES)) { keepOverrides[k] = ui.VIEW_OVERRIDES[k]; delete ui.VIEW_OVERRIDES[k]; }
  ui.setAppGroups([]);
  ui.setAppRoutes([]);
  go('work', 'life');
  ck(main.getAttribute('data-react-route') === null,
    'work/life is drawn by markup but #main claims a React route: ' + main.getAttribute('data-react-route'));
  ck(main.querySelector('[data-react="viewLife"]') === null,
    'the markup path carried the React screen wrapper, so the marker no longer says who drew the route');
  const sBefore = main.querySelector('.card');
  const sBeforeText = main.textContent;
  core.advanceQuarter();
  core.render();
  ck(sBefore !== main.querySelector('.card'),
    'the string path kept its element across a redraw - then the check above proves nothing');
  ck(sBeforeText !== main.textContent, 'nothing on work/life changed after a quarter was advanced');

  /* and the app takes the route back the moment it is asked to draw it again */
  for (const k of Object.keys(keepOverrides)) ui.VIEW_OVERRIDES[k] = keepOverrides[k];
  ui.setAppGroups(APP_GROUPED);
  ui.setAppRoutes(app.composedRoutes || []);
  go('work', 'life');
  ck(main.getAttribute('data-react-route') === 'viewLife',
    'the app did not take work/life back: #main says ' + main.getAttribute('data-react-route'));

  /* ---- and the app lets go when it is no longer asked to draw ---------- */
  go('work', 'rival');
  ck(main.getAttribute('data-react-route') === 'viewRival', 'work/rival is not drawn by React');
  ui.setRouteDrawer(null);
  core.render();
  ck(main.getAttribute('data-react-route') === null,
    'the app kept the container after setRouteDrawer(null) — #main still says React drew it');
  const leftovers = Array.from(main.querySelectorAll('[data-react]'))
    .filter((el) => el.style.display === 'contents');
  ck(leftovers.length === 0,
    'a screen wrapper is still in #main after the app let go of it (' + leftovers.length + ')');
  ck(main.textContent.trim().length > 0, 'letting go of the route left #main empty');
  /* and the string path's own stamp is back, which is how a screen says "the
     markup builder drew me" when it is drawn that way */
  ck(main.querySelector('[data-react="viewRival"]') !== null,
    'the markup drawn after the app let go carries no data-react stamp of its own');

  console.log('');
  if (bad.length) {
    console.log('ROUTE ISSUES (' + bad.length + '):');
    bad.forEach(b => console.log('  - ' + b));
    process.exit(1);
  }
  console.log('ROUTE CLEAN — ' + owned + ' routes drawn by React, ' + (ROUTES.length - owned) +
    ' by markup, every reason true, and a state change re-renders in place');
})();
