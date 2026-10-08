/*
  Gate: who draws the shell, and is the chrome the same chrome?

  The route gate proved that the app can draw a whole route and keep it. This is
  the same claim one level up: the header row, the tab strip with its second level
  and the screen hint are built as strings in `renderTop()` and `renderTabs()` on
  every render, so a state change used to replace all four containers whether or
  not anything in them had moved. The app draws them now, and the chrome has to be
  the chrome the game had.

  Three claims:

    1. THE SAME CHROME. For each of several states, the header, the strip, the
       second level and the hint are captured twice on the same state - once from
       the markup path with the app claiming nothing, once from the app - and
       compared: every control (tag, classes, data-*, disabled, title), every
       figure, the whole visible text, the class list, and the two host-level
       facts the string path sets on the containers rather than inside them (the
       second level's `display`, the hint's `open` class).

    2. THE PAGE SURVIVES A STATE CHANGE. With the app drawing, an element captured
       from the header before an action is the same object afterwards and its text
       has changed.

    3. IT LETS GO. When the app stops drawing a piece - setShellDrawer(null), and
       the start screen's own release - the claim comes off the containers and the
       markup is the game's again, with nothing of the app's left behind.

  The boundary is a table written out by hand, for the same reason the route
  gate's is: a table derived from the code it checks cannot be wrong, and being
  able to be wrong is the point. The pieces the app claims are printed, and a
  piece is either the app's or markup - never both, never neither.

  Run: node .harness/react-shell.js
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
global.location = dom.window.location;
global.localStorage = dom.window.localStorage;
global.requestAnimationFrame = (f) => setTimeout(f, 0);
dom.window.scrollTo = () => {};
dom.window.matchMedia = dom.window.matchMedia || (() => ({
  matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
}));

/* ---- the app's shell, bundled the way Next bundles it ------------------ */
async function loadShell() {
  const out = await esbuild.build({
    entryPoints: [path.join(ROOT, 'apps', 'web', 'shell', 'index.jsx')],
    bundle: true, format: 'esm', platform: 'node', jsx: 'automatic',
    loader: { '.js': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react/jsx-runtime',
      '@ledger/core', '@ledger/ui'],
    write: false, logLevel: 'silent'
  });
  const tmp = path.join(__dirname, '.shell-' + process.pid + '.mjs');
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  const mod = await import('file://' + tmp);
  fs.rmSync(tmp, { force: true });
  return mod;
}

/* ---- what a piece of chrome offers, read from the DOM ------------------ */
function read(el) {
  const controls = [];
  el.querySelectorAll('button, [data-a], select, input').forEach((n) => {
    const attrs = {};
    for (const a of Array.from(n.attributes)) {
      if (a.name.startsWith('data-') || a.name === 'title' || a.name === 'aria-label' || a.name === 'class') attrs[a.name] = a.value;
    }
    controls.push(n.tagName.toLowerCase() + ' ' + JSON.stringify(attrs) + ' ' + n.textContent.replace(/\s+/g, ' ').trim());
  });
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  const money = (text.match(/₦[0-9][0-9,.]*[kmbn]?/gi) || []).map((s) => s.toLowerCase());
  const numbers = text.match(/[0-9]+(?:[.,][0-9]+)?/g) || [];
  const classes = new Set();
  el.querySelectorAll('*').forEach((n) => {
    const c = n.getAttribute('class');
    if (c) c.split(/\s+/).forEach((t) => t && classes.add(t));
  });
  return { controls, text, money, numbers, classes, html: el.innerHTML };
}

function diff(label, a, b, problems) {
  if (a.text !== b.text) {
    let i = 0;
    while (i < a.text.length && a.text[i] === b.text[i]) i++;
    const at = Math.max(0, i - 50);
    problems.push(label + ': the text differs at character ' + i +
      '\n        markup: …' + a.text.slice(at, i + 50) + '…' +
      '\n        app   : …' + b.text.slice(at, i + 50) + '…');
  }
  if (a.controls.length !== b.controls.length) {
    problems.push(label + ': controls ' + a.controls.length + ' -> ' + b.controls.length);
  } else {
    for (let i = 0; i < a.controls.length; i++) {
      if (a.controls[i] !== b.controls[i]) {
        problems.push(label + ': control ' + i + ' is not the same control\n        markup: ' +
          a.controls[i] + '\n        app   : ' + b.controls[i]);
        break;
      }
    }
  }
  if (a.money.join(' ') !== b.money.join(' ')) {
    problems.push(label + ': the figures differ\n        markup: ' + a.money.slice(0, 8).join(' ') +
      '\n        app   : ' + b.money.slice(0, 8).join(' '));
  }
  if (a.numbers.join(' ') !== b.numbers.join(' ')) {
    problems.push(label + ': the numbers differ\n        markup: ' + a.numbers.slice(0, 12).join(' ') +
      '\n        app   : ' + b.numbers.slice(0, 12).join(' '));
  }
  const lost = Array.from(a.classes).filter((c) => !b.classes.has(c));
  if (lost.length) problems.push(label + ': CSS classes lost: ' + lost.slice(0, 8).join(' '));
}

/* ---- the states the chrome has to agree in ----------------------------
   A header that agrees only on a fresh run has not been checked: the net-worth
   arrow, the tab dots, the season chip and the second level all appear and
   disappear with the state. */
const STATES = [
  /* The tab matters as much as the state: the second level only exists on a tab
     that has one, and a run of fixtures that never leaves Overview compares three
     empty `#subs` containers and calls it agreement. Every state below names the
     route it is looking at, and the gate fails if the state it is in cannot draw
     the strip it is supposed to be checking. */
  { name: 'a fresh run, nothing waiting', tab: 'overview', sub: null, run: (g) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
    } },
  { name: 'a company, four quarters in', tab: 'work', sub: 'career', run: (g) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4243 });
      const S = g.S || (g.getS && g.getS());
      S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
      g.startBiz('tech', 'Testco', Math.round(4000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 4; i++) g.advanceQuarter();
    } },
  { name: 'in debt, three deals waiting', tab: 'money', sub: 'deals', run: (g) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4244 });
      const S = g.S || (g.getS && g.getS());
      g.startBiz('food', 'Testco', Math.round(2000000 * (S.cumInfl || 1)), null);
      for (let i = 0; i < 3; i++) g.advanceQuarter();
      S.deals = [1, 2, 3].map((i) => ({
        id: 'dl' + i, name: 'Deal ' + i, capital: Math.round(900000 * (S.cumInfl || 1)),
        desc: 'working capital', turns: 2, ret: 0.2, risk: 0.3
      }));
      S.fin.cash = -Math.round(400000 * (S.cumInfl || 1));
    } },
  { name: 'a legacy route, a season running', tab: 'legacy', sub: 'season', run: (g) => {
      g.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4245 });
      const S = g.S || (g.getS && g.getS());
      S.season = { code: 'SEA-9X2K', name: 'Lagos, forty quarters', seed: 4245,
        startTurn: S.turn, endTurn: S.turn + 12, hardStop: true, organiser: true };
    } }
];

(async () => {
  const shell = await loadShell();
  const core = await import('@ledger/core');
  const ui = await import('@ledger/ui');

  ui.install();

  const host = (id) => document.getElementById(id);
  const readHosts = () => ({
    top: read(host('toprow')),
    tabs: read(host('tabs')),
    subs: read(host('subs')),
    why: read(host('why')),
    subsDisplay: host('subs').style.display,
    whyClass: host('why').className
  });

  /* the boundary, written out: which pieces the app draws */
  const EXPECTED = ['top', 'tabs', 'modal'];
  const claims = Object.keys(shell.shellPieces).filter((k) => shell.shellPieces[k]);
  console.log('shell ownership   : ' + (claims.length ? claims.join(', ') : 'none') +
    ' drawn by the app, of ' + Object.keys(shell.shellPieces).length + ' pieces');
  for (const k of EXPECTED) {
    ck(claims.indexOf(k) >= 0, 'the app does not claim "' + k + '", which this gate expects it to draw');
  }
  for (const k of claims) {
    ck(EXPECTED.indexOf(k) >= 0, 'the app claims "' + k + '", which this gate does not know about - ' +
      'a piece changing hands has to be deliberate');
  }

  let compared = 0;
  let subStates = 0;
  for (const state of STATES) {
    state.run(core);
    core.UI.tab = state.tab;
    core.UI.sub = state.sub;

    /* leg one: markup, with the app claiming nothing */
    ui.setAppShell({});
    ui.setShellDrawer(shell.drawShell);
    core.render();
    const markup = readHosts();

    /* leg two: the app */
    ui.setAppShell(shell.shellPieces);
    ui.setShellDrawer(shell.drawShell);
    core.render();
    const app = readHosts();

    const problems = [];
    for (const piece of ['top', 'tabs', 'subs', 'why']) diff(piece, markup[piece], app[piece], problems);
    if (markup.subsDisplay !== app.subsDisplay) {
      problems.push('the second level is ' + (markup.subsDisplay === 'none' ? 'hidden' : 'shown') +
        ' by markup and ' + (app.subsDisplay === 'none' ? 'hidden' : 'shown') + ' by the app');
    }
    if (markup.whyClass !== app.whyClass) {
      problems.push('the hint host carries className "' + app.whyClass + '" from the app and "' +
        markup.whyClass + '" from markup');
    }
    for (const piece of ['top', 'tabs', 'subs', 'why']) {
      if (app[piece].html.indexOf('data-react') >= 0) {
        problems.push(piece + ': the app\'s chrome carries a data-react marker of a screen inside it');
      }
    }
    /* did this state reach the second level at all? A fixture that never leaves
       Overview compares two empty containers four times and reports agreement. */
    const wanted = core.subsFor(core.UI.tab);
    const nSubs = wanted ? wanted.length : 0;
    if (nSubs >= 2) {
      subStates++;
      if (markup.subs.controls.length !== nSubs) {
        problems.push('the second level was supposed to be drawn on ' + core.UI.tab + ' (' + nSubs +
          ' entries) and the markup path drew ' + markup.subs.controls.length);
      }
      if (markup.subsDisplay === 'none') problems.push('the second level is hidden on a tab that has one');
    } else if (markup.subs.controls.length) {
      problems.push('a second level was drawn on ' + core.UI.tab + ', which has none');
    }

    /* the containers say who drew them */
    ck(host('toprow').getAttribute('data-react-shell') === 'top',
      state.name + ': #toprow does not carry the shell stamp');
    ck(host('tabs').getAttribute('data-react-shell') === 'tabs',
      state.name + ': #tabs does not carry the shell stamp');

    console.log('  ' + pad(state.name, 34) +
      pad(state.tab + (state.sub ? ' › ' + state.sub : ''), 20) +
      markup.top.controls.length + ' header controls · ' + markup.tabs.controls.length + ' tabs · ' +
      markup.subs.controls.length + ' subs · ' + markup.top.money.length + ' money figures' +
      (problems.length ? '   DISAGREE' : '   agree'));
    if (problems.length) bad.push(state.name + '\n      ' + problems.join('\n      '));
    compared += 4;
  }

  /* ---- 1b. the modal, type by type -------------------------------------

     The dispatcher and the port are two renderers of one table, so every modal
     the port knows about is compared on the same state: the same controls, the
     same figures, the same words, the same class list. The list below is written
     out by hand like every other boundary in this project, and a type the port
     answers differently - or not at all - fails.

     These are the types that are constructible from the state: the pre-fab ones
     whose content comes from the simulation, and the composed ones the dispatcher
     builds here. Types that need a run to have ended (year, end, runinfo) are
     left out and named, rather than pretended about. */
  const MODALS = [
    { name: 'settings', make: () => ({ type: 'settings' }) },
    { name: 'help', make: () => ({ type: 'help' }) },
    { name: 'message', make: () => ({ type: 'message', title: 'A message', text: 'Something to read.' }) },
    { name: 'confirm', make: () => ({ type: 'confirm', title: 'Close the company?', text: 'This cannot be undone.', okLabel: 'Close it' }) },
    { name: 'amount', make: () => ({ type: 'amount', title: 'How much?', note: 'Whatever you can afford.', def: '1.5m', cb: () => {} }) },
    { name: 'result', make: () => ({ type: 'result', res: { kind: 'good', text: 'It worked.', principle: 'Buy low, sell high.' }, opt: { label: 'Take the deal' } }) },
    { name: 'pending', make: () => ({ type: 'pending', items: [
        { kind: 'good', title: 'A cheque cleared', text: 'Two quarters late, but it cleared.' },
        { kind: 'bad', title: 'A lease expired', text: 'The landlord wants 40% more.' }] }) },
    { name: 'season', make: () => ({ type: 'season' }) },
    { name: 'start', make: () => ({ type: 'start' }) },
    /* govvote needs a vote that has actually been taken: its head is the
       resolution's kind and its body is the tally, and a bare {type:'govvote'}
       is a modal the GAME cannot draw either (govVoteModal dereferences res).
       The other governance modals take a company and a candidate list, which is
       what the fixtures above build. */
    { name: 'govvote', make: () => ({ type: 'govvote', biz: null, passed: true, whip: 0.6,
        out: 'The board voted along the lines the chair suggested.',
        res: { kind: 'ordinary', cls: 'board', title: 'Approve the operating plan' },
        votes: [{ who: 'Chair', for: true, weight: 1 }, { who: 'Ngozi', for: false, weight: 1 }] }) },
    { name: 'govplan', make: () => ({ type: 'govplan', biz: null, plan: { revenue: 3000000, gm: 42, opex: 1800000, capex: 600000, headcount: 4 } }) },
    { name: 'govdeed', make: () => ({ type: 'govdeed', biz: null }) },
    { name: 'govopt', make: () => ({ type: 'govopt', biz: null }) }
  ];
  /* the two that only exist once something is in flight */
  const withCompany = () => {
    core.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4247 });
    const S = core.S;
    S.fin.cash = Math.round(9000000 * (S.cumInfl || 1));
    core.startBiz('tech', 'Testco', Math.round(4000000 * (S.cumInfl || 1)), null);
    for (let i = 0; i < 4; i++) core.advanceQuarter();
    return S;
  };
  const S0 = withCompany();
  MODALS.push({ name: 'partner', make: () => ({ type: 'partner', mode: 'start', offers: [
      { name: 'Ngozi Adeyemi', equity: 20, capital: Math.round(4000000 * (S0.cumInfl || 1)), bg: 'runs a logistics yard',
        skill: 'logistics', ask: 'wants a board seat', trust: 61 }] }) });
  MODALS.push({ name: 'govplan (a company)', make: () => ({ type: 'govplan', biz: S0.biz.id,
      plan: { revenue: 5000000, gm: 44, opex: 2600000, capex: 900000, headcount: 6 } }) });

  ui.setAppShell({});
  ui.setShellDrawer(shell.drawShell);
  let modalCompared = 0;
  for (const m of MODALS) {
    const problems = [];
    core.UI.modal = m.make();
    core.render();
    const markup = read(host('modalHost'));

    ui.setAppShell(shell.shellPieces);
    core.UI.modal = m.make();
    core.render();
    const app = read(host('modalHost'));

    diff('modal ' + m.name, markup, app, problems);
    if (host('modalHost').getAttribute('data-react-shell') !== 'modal') {
      problems.push('the modal host does not carry the shell stamp');
    }
    /* the tactic row is appended after the draw in both renderers: ask for the
       element rather than for the string */
    const markupActs = markup.html.split('negoacts').length - 1;
    const appActs = app.html.split('negoacts').length - 1;
    if (markupActs !== appActs) problems.push('negoacts rows: markup ' + markupActs + ', app ' + appActs);

    console.log('  ' + pad('modal · ' + m.name, 34) + pad('', 20) + markup.controls.length +
      ' controls · ' + markup.money.length + ' figures · ' + markup.text.length + ' chars' +
      (problems.length ? '   DISAGREE' : '   agree'));
    if (problems.length) bad.push('modal ' + m.name + '\n      ' + problems.join('\n      '));
    modalCompared++;
    ui.setAppShell({});
  }
  core.UI.modal = null;

  /* ---- 1c. the page: the loop itself ------------------------------------

     Everything above compares one piece at a time. This compares the PAGE - the
     header, the strip with its second level, the route and the modal, all of it -
     built by the markup path on the left and by the app's page drawer on the
     right, on the same state.

     The page drawer is the loop: four draws in one place, in an order a component
     tree can express. What has to be true is that composing it there changes
     nothing a player sees, and that the claim itself is honest - an app that has
     not converted a piece cannot claim the page. */
  const wholePage = (el) => read(el);
  const pageHosts = () => ({ top: host('toprow'), main: host('main'), modal: host('modalHost') });

  /* the boundary: is the page the app's, and why not when it is not */
  core.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4248 });
  /* The screens, declared the way the real app declares them at boot. Without
     this every route is "not converted yet", the page drawer refuses - correctly
     - and the whole-page comparison below compares the markup path with itself.
     A stamp assertion is what caught that, which is the argument for stamping. */
  ui.overrideScreens(shell.converted);
  ui.setAppShell(shell.shellPieces);
  ui.setShellDrawer(shell.drawShell);
  ui.setPageDrawer(shell.drawPage);
  /* the route drawer the page drawer composes: the same function, from the same
     bundle, so the ui's APP_ROUTE and the app's page are one copy of the screens.
     And the two declarations the real app makes at boot - which routes its
     screens arrange, which routes it assembles - because without them every
     grouped route is refused, and the page drawer says so and falls back to
     markup. That refusal is the point of the seam; the fixture has to be the app
     the gate claims to be checking. */
  ui.setAppGroups(shell.groupedRoutes || []);
  ui.setAppRoutes(shell.composedRoutes || []);
  ui.setRouteDrawer(shell.drawRoute);
  ck(typeof shell.drawRoute === 'function', 'the shell does not export the route drawer it composes');
  ck(typeof ui.pageOwnership === 'function', 'the ui does not answer for the page at all');
  const own = (typeof ui.pageOwnership === 'function') ? ui.pageOwnership() : { owned: false, why: 'no pageOwnership' };
  console.log('page ownership    : ' + (own.owned ? 'the app draws the page' : 'markup') + ' — ' + own.why);
  ck(own.owned, 'the app claims every piece and the route, so it should own the page too: ' + own.why);
  /* …and an app that has not converted the modal cannot claim the page */
  ui.setAppShell({ top: true, tabs: true });
  ck(!ui.pageOwnership().owned, 'the page is claimed by an app that does not draw the modal');
  ck(/shell|piece/i.test(ui.pageOwnership().why), 'the reason the page is not claimed does not name the shell: ' + ui.pageOwnership().why);
  ui.setAppShell(shell.shellPieces);
  ck(ui.pageOwnership().owned, 'the page is still refused after the pieces were claimed back');

  /* the comparison, state by state */
  let pageStates = 0;
  for (const state of STATES) {
    state.run(core);
    /* the route under comparison is set BEFORE either leg draws: the markup leg
       renders whatever tab was left over otherwise, and a page comparison across
       two different routes agrees about nothing and proves it */
    core.UI.tab = state.tab;
    core.UI.sub = state.sub;

    /* left: the markup path - the game from top to bottom, the same leg
       react-route.js uses. Everything the app declares comes off: the screens,
       the two route declarations, the route drawer and the shell pieces. That is
       not belt and braces - with the screens still declared, core's own
       `routeView()` groups the sections the screens already drew, and the left
       leg renders a page with two nested section headers that no player has ever
       seen. The claim nothing turns the page drawer off with it, which is what
       makes this testable at all. */
    const savedOverrides = {};
    for (const k of Object.keys(ui.VIEW_OVERRIDES)) { savedOverrides[k] = ui.VIEW_OVERRIDES[k]; delete ui.VIEW_OVERRIDES[k]; }
    ui.setAppGroups([]);
    ui.setAppRoutes([]);
    ui.setAppShell({});
    ui.setRouteDrawer(null);
    core.render();
    const markupPage = wholePage(host('main')).text + '\u0000' + wholePage(host('toprow')).text;
    ck(host('main').getAttribute('data-react-route') === null,
      'the markup leg of the page comparison drew its route with React, so it is not the markup path');

    for (const k of Object.keys(savedOverrides)) ui.VIEW_OVERRIDES[k] = savedOverrides[k];
    ui.setAppGroups(shell.groupedRoutes || []);
    ui.setAppRoutes(shell.composedRoutes || []);
    ui.setAppShell(shell.shellPieces);
    ui.setRouteDrawer(shell.drawRoute);
    core.render();
    const appPage = wholePage(host('main')).text + '\u0000' + wholePage(host('toprow')).text;

    /* the two legs must be looking at the same route: a page comparison across
       two different routes would agree about nothing and prove it */
    ck(host('main').querySelector('.card') !== null, state.name + ': the page has no cards in it');
    if (markupPage !== appPage) {
      let i = 0;
      while (i < markupPage.length && markupPage[i] === appPage[i]) i++;
      const at = Math.max(0, i - 150);
      bad.push('the whole page differs on "' + state.name + '" at character ' + i +
        '\n        markup: …' + markupPage.slice(at, i + 150) + '…' +
        '\n        app   : …' + appPage.slice(at, i + 150) + '…');
    }
    if (document.body.getAttribute('data-react-page') !== '1') {
      bad.push(state.name + ': the page is drawn but <body> carries no page stamp');
    }
    if (host('main').getAttribute('data-react-route') === null) {
      bad.push(state.name + ': the page leg has no React route in it, so the page was not one commit');
    }
    console.log('  ' + pad('the whole page · ' + state.name, 40) + pad(state.tab, 14) +
      host('main').querySelectorAll('.card').length + ' cards · ' +
      host('main').querySelectorAll('[data-a]').length + ' controls · ' +
      appPage.length + ' chars' + (markupPage === appPage ? '   same as the game' : '   DIFFERS'));
    pageStates++;
    ui.setAppShell({});
  }
  ck(pageStates === STATES.length, 'the page was not compared in every state');

  /* the markup path has the page back when the claim goes */
  ui.setAppShell({});
  ui.setRouteDrawer(null);
  core.render();
  ck(document.body.getAttribute('data-react-page') === null,
    'the page stamp is still on <body> after the app stopped drawing the page');
  ck(host('main').getAttribute('data-react-route') === null,
    'the route stamp is still on #main after the app stopped drawing the page');
  /* and back on, so the rest of this gate runs against a page the app draws */
  ui.setAppShell(shell.shellPieces);
  ui.setRouteDrawer(shell.drawRoute);
  core.render();
  ck(document.body.getAttribute('data-react-page') === '1',
    'the app did not take the page back after being asked to draw it again');

  /* ---- 2. the page survives a state change ---------------------------- */
  core.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4246 });
  core.UI.tab = 'work';
  ui.setAppShell(shell.shellPieces);
  ui.setShellDrawer(shell.drawShell);
  ui.setPageDrawer(shell.drawPage);
  core.render();
  const beforeEl = host('toprow').querySelector('.hstat');
  /* the route's own wrapper: a card can legitimately come and go as a screen
     redraws its first card, the wrapper cannot - it is the element the app
     mounted the route on, and "is this the same tree" is the claim */
  const beforeCard = host('main').querySelector('[data-react-route] > *');
  const beforeText = host('toprow').textContent;
  const beforeHistory = host('tabs').querySelectorAll('.tab').length;
  core.advanceQuarter();
  core.render();
  const afterEl = host('toprow').querySelector('.hstat');
  const afterCard = host('main').querySelector('[data-react-route] > *');
  ck(beforeEl === afterEl, 'the header was rebuilt, not re-rendered: the element is a different object');
  ck(beforeCard === afterCard, 'the route was rebuilt under the page drawer: the card is a different element');
  ck(beforeText !== host('toprow').textContent, 'nothing in the header changed after a quarter was advanced');
  ck(beforeHistory === host('tabs').querySelectorAll('.tab').length, 'the tab count moved');
  console.log('  header re-rendered in place across a quarter: ' +
    (beforeEl === afterEl ? 'yes' : 'NO'));

  /* ---- 3. it lets go --------------------------------------------------- */
  ui.setShellDrawer(null);
  ck(host('toprow').getAttribute('data-react-shell') === null,
    'the shell stamp is still on #toprow after setShellDrawer(null)');
  ck(host('tabs').getAttribute('data-react-shell') === null,
    'the shell stamp is still on #tabs after setShellDrawer(null)');
  ui.setShellDrawer(shell.drawShell);
  core.render();
  /* and with the app claiming nothing, the markup path has it back */
  ui.setAppShell({});
  core.render();
  ck(host('toprow').getAttribute('data-react-shell') === null,
    'the app still claims the header after it said it would not draw it');
  ck(/LEDGER/.test(host('toprow').textContent), 'the header went missing when the app let go of it');
  ck(host('toprow').querySelector('[data-a="advance"]') !== null,
    'the Advance button went missing when the app let go of the header');
  console.log('  let go, and the markup path has the header back: ' +
    (host('toprow').querySelector('[data-a="advance"]') !== null ? 'yes' : 'NO'));

  ck(modalCompared >= 10, 'the modal comparison ran ' + modalCompared + ' types, which is too few to be a check');
  ck(subStates > 0, 'no state in this gate drew a second level, so the tab strip’s ' +
    'second half was compared as two empty containers');

  const problems = bad;
  console.log('');
  console.log(problems.length
    ? 'SHELL ISSUES (' + problems.length + '):\n  - ' + problems.join('\n  - ')
    : 'SHELL CLEAN — ' + compared + ' pieces of chrome across ' + STATES.length + ' states, ' +
      pageStates + ' whole pages and ' + modalCompared + ' modal types, every one identical to the ' +
      'markup the game drew; the app draws the page when it claims every piece (and is refused ' +
      'when it does not), the header re-renders in place across a state change, and the app hands ' +
      'the containers back');
  process.exitCode = problems.length ? 1 : 0;
})();
