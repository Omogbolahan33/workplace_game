/* Browser check: does the RUNNING app actually serve React for each converted route?

   The boot line lists the names the app declares; this asks the DOM instead,
   through the data-react marker every converted screen carries on its first
   element. "Registered" and "what rendered" are different claims: a screen can
   be listed in the app's map, misspelt against the registry, and quietly be
   drawn by the old string builder.

   Not-converted neighbours are checked too, and must NOT carry the marker -
   otherwise the marker proves nothing about who drew what. */
const { chromium } = require('playwright');
const path = require('path');

const { ROUTES } = require('./routes.js');
/* Screens that are not routes of their own: they are cards inside one, and the
   walk above cannot reach them by asking for a route. On a route the app draws
   whole there are no per-screen wrappers by design - the app draws the route,
   not a list of screens - so the claim to check is not "each card carries a
   stamp" but "every card on the route is inside the one thing the app drew".
   A card outside it is markup the route left behind, which on this route is the
   only way a converted panel can silently go missing. */
const EMBEDDED = 'the route\u2019s own wrapper';

/* ---- the Install button, end to end ------------------------------------

   This control was unreachable for the life of the game: it is rendered only
   while the browser has an install prompt in hand, and the code meant to reveal
   it looked up an id no element has ever had, so on a browser that can install
   the game Settings showed an Install heading, a note, and no button. A browser
   is the only place the whole path can be exercised - the ui takes the event,
   the router re-renders, the screen draws the control - so the event is fired
   here for real. */
async function checkInstallButton(p, go, rows, problems) {
  await go('Legacy', 'settings');
  const before = await p.evaluate(() => !!document.querySelector('[data-a="installapp"]'));
  await p.evaluate(() => { window.dispatchEvent(new Event('beforeinstallprompt', { cancelable: true })); });
  await p.waitForTimeout(700);
  const during = await p.evaluate(() => {
    const el = document.querySelector('[data-a="installapp"]');
    if (!el) return null;
    const st = window.getComputedStyle(el);
    return { text: el.textContent.trim(), shown: st.display !== 'none' && st.visibility !== 'hidden' };
  });
  await p.evaluate(() => { window.dispatchEvent(new Event('appinstalled')); });
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => !!document.querySelector('[data-a="installapp"]'));
  const ok = !before && during && during.shown && !after;
  if (!ok) {
    problems.push('the Install button: before=' + before + ' during=' + JSON.stringify(during) +
      ' after=' + after + ' — it should be absent, then present and visible, then absent again');
  }
  rows.push('  ' + String('Legacy \u203a settings').padEnd(24) + String('(Install button)').padEnd(22) +
    (ok ? 'WORKS' : 'BROKEN').padEnd(11) + 'absent \u2192 ' + (during ? during.text : '\u2014') + ' \u2192 absent');
}

/* Routes nobody has converted: these must show the marker nowhere. The list
   shrinks every time a screen is converted - Money > Deals, Money > Group,
   Work > Household and Legacy > Season have all left it - and a route that has
   just become React is exactly what this check is here to notice, by failing
   until the list is corrected.

   It caught a listing mistake too: Governance > Pack and Governance > Register
   were on this list, and the moment they were walked they carried the marker -
   because both sub-tabs are drawn INSIDE viewGovernance, which is converted.
   They are sub-views of one React screen, not markup routes, and they are now
   walked above as that screen. What is left here is one route: Work > Life. */

/* Empty, and that is the news: every route in the game is drawn by React now.
   The list stays because the claim it makes is the one that keeps the marker
   honest - if a screen is ever un-converted, or a route added that nobody has
   ported, this is where it is written down, and the walk fails the moment such a
   route carries a stamp. */
const CONTROLS_UNCONVERTED = [];

/* Screens that are React inside a route the GAME still arranges.

   Governance > Pack and Governance > Register were briefly listed above, and the
   walk passed - which is why the question was asked properly rather than
   believed. The marker is on the page because a converted screen answers
   `host.view` with React-generated markup wherever it is asked for, grouping or
   no grouping: on those two routes core's own `groupRoute()` still rearranges
   the cards into sections, so the ROUTE is markup and only the screen inside it
   is React. Filing them as React routes would say the opposite of what
   react-route.js proves about the same two routes ("core still groups this
   route's cards"), and two gates would disagree while both passed. So they get
   their own claim: the screen marker is here, the route stamp is not. */
/* Nothing is on this list at the moment: Pack and Register were the last two
   routes core still arranged over a converted screen, and the app arranges them
   now - so the walk above covers them and this list is empty. It stays because
   the distinction it draws is real and the summary prints its count: a screen can
   be React on a route that is not, and a walk with only two categories would
   report that as "the route answered React". */
const SCREEN_REACT_ROUTE_NOT = [];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [], served = [];
  p.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text());
    if (m.text().startsWith('screens served by React')) served.push(m.text());
  });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message + ' @ ' + (global.__step || 'boot')));
  await p.goto('http://127.0.0.1:3007/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  const go = async (tab, sub) => {
    global.__step = 'go ' + tab + (sub ? ' \u203a ' + sub : '');
    await p.evaluate((label) => {
      const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === label);
      if (t) t.click();
    }, tab);
    await p.waitForTimeout(350);
    if (sub) {
      await p.evaluate((s) => {
        const el = Array.from(document.querySelectorAll('[data-a="sub"]')).find((n) => (n.getAttribute('data-s') || n.getAttribute('data-v') || '') === s);
        if (el) el.click();
      }, sub);
      await p.waitForTimeout(500);
    }
    return p.evaluate(() => {
      const el = document.getElementById('main');
      return {
        agenda: /Waiting on you/.test(el ? el.textContent : ''),
        h3: el ? Array.from(el.querySelectorAll('h3')).map((n) => n.textContent.trim()).slice(0, 3) : [],
        head: el ? el.innerText.replace(/\s+/g, ' ').slice(0, 100) : '',
        who: Array.from(document.querySelectorAll('[data-react]')).map((n) => n.getAttribute('data-react')),
        /* who drew the ROUTE, not just the screens: the app stamps the container
           when it owns it, and each screen it drew sits in a wrapper that is not
           a box (display:contents) so the stamp cannot move anything. */
        route: el ? el.getAttribute('data-react-route') : null,
        boxes: Array.from(document.querySelectorAll('[data-react]')).filter((n) => n.style && n.style.display === 'contents').map((n) => n.getAttribute('data-react')),
        chars: el ? el.innerText.replace(/\s+/g, ' ').trim().length : -1,
        amp: /&amp;(?!amp;)/.test(el ? el.innerText : '')
      };
    });
  };

  /* ---- the shell, in the running app ---------------------------------------

     Who drew the chrome, asked of the DOM rather than of a list. Each piece
     carries data-react-shell with its own name, and the modal is asked the same
     way: opened from the header, checked, and closed again - a modal that says
     it is the app's and then does not empty the host is worse than one that never
     claimed it. */
  const shellDrawer = async () => {
    global.__step = 'the modal + the shell';
    /* the modal, end to end: open it from the header, ask the host who drew it,
       check the box is the game's box, then close it and check the host empties */
    await p.evaluate(() => { const b = document.querySelector('#toprow [data-a="settings"]'); if (b) b.click(); });
    await p.waitForTimeout(700);
    const modal = await p.evaluate(() => {
      const host = document.getElementById('modalHost');
      const box = host.querySelector('.modalbox');
      return {
        stamp: host.getAttribute('data-react-shell'),
        boxes: host.querySelectorAll('.modalbox').length,
        modals: host.querySelectorAll('#modal').length,
        text: box ? box.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : '',
        closes: host.querySelectorAll('[data-a="close"], [data-a="okconfirm"], [data-a="negclose"]').length
      };
    });
    const modalOk = modal.stamp === 'modal' && modal.boxes === 1 && modal.modals === 1 && modal.closes > 0;
    if (!modalOk) {
      problems.push('the modal: stamp=' + modal.stamp + ' boxes=' + modal.boxes + ' #modal=' + modal.modals +
        ' close controls=' + modal.closes);
    }
    await p.evaluate(() => { const c = document.querySelector('#modalHost [data-a="close"]'); if (c) c.click(); });
    await p.waitForTimeout(500);
    const emptied = await p.evaluate(() => {
      const host = document.getElementById('modalHost');
      return { children: host.children.length, text: host.textContent.trim().length };
    });
    if (emptied.children || emptied.text) {
      problems.push('the modal host still had something in it after closing: ' + JSON.stringify(emptied));
    }
    rows.push('  ' + String('the modal').padEnd(24) + String('(opened, closed)').padEnd(22) +
      (modalOk ? 'REACT' : 'MARKUP').padEnd(11) + String(modal.text.slice(0, 22)).padStart(7));

    const got = await p.evaluate(() => ({
      top: document.getElementById('toprow').getAttribute('data-react-shell'),
      tabs: document.getElementById('tabs').getAttribute('data-react-shell'),
      subs: document.getElementById('subs').getAttribute('data-react-shell'),
      why: document.getElementById('why').getAttribute('data-react-shell'),
      advance: !!document.querySelector('#toprow [data-a="advance"]'),
      brand: (document.querySelector('#toprow .brand') || {}).textContent || '',
      tabsN: document.querySelectorAll('#tabs .tab').length
    }));
    const claims = got.top === 'top' && got.tabs === 'tabs' && got.subs === 'subs' && got.why === 'why';
    if (!claims) {
      problems.push('the shell is not drawn by the app: top=' + got.top + ' tabs=' + got.tabs +
        ' subs=' + got.subs + ' why=' + got.why);
    }
    if (!got.advance) problems.push('the app\u2019s header has no Advance button');
    if (got.brand !== 'LEDGER') problems.push('the app\u2019s header does not say LEDGER (it says "' + got.brand + '")');
    if (got.tabsN !== 5) problems.push('the app\u2019s strip has ' + got.tabsN + ' tabs, not 5');
    rows.push('  ' + String('the shell').padEnd(24) + String('(header, strip)').padEnd(22) +
      (claims ? 'REACT' : 'MARKUP').padEnd(11) + String(got.tabsN + ' tabs').padStart(7));
    /* the page itself: the app composes the loop - header, strip, route and modal
       in one place - and stamps <body> when it does. Asked of the DOM, because a
       drawer that says it draws the page and then does not is the failure this
       stamp exists to catch. */
    const page = await p.evaluate(() => ({
      stamp: document.body.getAttribute('data-react-page'),
      route: document.getElementById('main').getAttribute('data-react-route'),
      cards: document.querySelectorAll('#main .card').length
    }));
    if (page.stamp !== '1' || !page.route || !page.cards) {
      problems.push('the page is not drawn by the app: body stamp=' + page.stamp +
        ' route=' + page.route + ' cards=' + page.cards);
    }
    rows.push('  ' + String('the page').padEnd(24) + String('(header+route+modal)').padEnd(22) +
      (page.stamp === '1' && page.route ? 'REACT' : 'MARKUP').padEnd(11) +
      String(page.cards + ' cards').padStart(7));
  };

  /* DOES A CHANGE OF STATE KEEP THE PAGE?

     The last claim of this phase, checked in the real browser and in the real
     app: on a route React draws, an element captured before an action is the
     same object afterwards. A redraw that replaces #main's markup - which is
     what the string path does, and what this whole step exists to stop doing
     for converted routes - cannot pass this. */
  const reactivity = async () => {
    global.__step = 'Money \u203a budget (reactivity)';
    await go('Money', 'budget');
    const before = await p.evaluate(() => {
      const main = document.getElementById('main');
      const card = main.querySelector('[data-react-route] .card, .card');
      window.__probeCard = card;
      return { route: main.getAttribute('data-react-route'), text: main.textContent.length,
               has: !!card };
    });
    await p.evaluate(() => { const a = document.querySelector('[data-a="advance"]'); if (a) a.click(); });
    await p.waitForTimeout(1200);
    const after = await p.evaluate(() => {
      const main = document.getElementById('main');
      return { same: window.__probeCard === main.querySelector('[data-react-route] .card, .card'),
               text: main.textContent.length, route: main.getAttribute('data-react-route') };
    });
    await p.evaluate(() => { const c = document.querySelector('[data-a="close"]'); if (c) c.click(); });
    await p.waitForTimeout(400);
    return { before, after };
  };

  /* start a run, then start a company: the agenda is the card that says what is
     waiting on you, and it exists only when something is. A fresh run with no
     company has an empty agenda on the Work tab - that is the screen being
     right, not the conversion being absent, and the check below drives to a
     state where the card is real. */
  global.__step = 'start flow';
  await p.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-a]')).find((n) => /^pickprof/.test(n.getAttribute('data-a') || ''));
    if (el) el.click();
  });
  await p.evaluate(() => { document.querySelector('[data-a="pickcity"]').click(); });
  await p.evaluate(() => { document.querySelector('[data-a="pickdiff"]').click(); });
  await p.evaluate(() => { document.querySelector('[data-a="startgame"]').click(); });
  await p.waitForTimeout(1500);
  for (let i = 0; i < 2; i++) {
    await p.evaluate(() => { const a = document.querySelector('[data-a="advance"]'); if (a) a.click(); });
    await p.waitForTimeout(900);
  }
  /* The company. On Apprentice in Lagos the player cannot afford any type
     alone - every "Start alone" is disabled with the shortfall stated - and the
     route that exists for exactly that case is "With partner", so that is the
     one a check has to take. It also means this walk exercises the partner
     modal, which is the only door into a company a poor player has. */
  await go('Work', 'business');
  await p.evaluate(() => {
    const el = document.querySelector('[data-a="startbizpartner"][data-t="proserv"]') ||
               document.querySelector('[data-a="startbizpartner"][data-t]');
    if (el) el.click();
  });
  await p.waitForTimeout(1200);
  await p.evaluate(() => {
    const m = document.getElementById('modalHost');
    const take = m && m.querySelector('[data-a="acceptpartner"]');
    if (take) take.click();
  });
  await p.waitForTimeout(1200);
  /* a partner pays in and the game asks what you put in on top of it */
  await p.evaluate(() => {
    const m = document.getElementById('modalHost');
    const ok = m && m.querySelector('[data-a="okamount"]');
    if (ok) ok.click();
  });
  await p.waitForTimeout(1200);
  for (let i = 0; i < 2; i++) {
    await p.evaluate(() => { const a = document.querySelector('[data-a="advance"]'); if (a) a.click(); });
    await p.waitForTimeout(900);
  }

  console.log(served[0] || '(no boot line)');
  console.log('');
  const rows = [], problems = [];
  for (const r of ROUTES) {
    const got = await go(r.tab, r.sub);
    const ok = got.who.includes(r.screen);
    if (!ok) problems.push(r.screen + ' did not render on ' + r.tab + (r.sub ? ' › ' + r.sub : '') + ' (markers: ' + (got.who.join(', ') || 'none') + ')');
    /* the route stamp and its wrappers are one claim in two halves: the
       attribute says React drew the route, the wrappers say which screens, and
       both have to be there or the stamp is a sentence with nothing behind it */
    const named = (got.route || '').split(' ').filter(Boolean);
    if (named.length) {
      const missing = named.filter((n) => got.boxes.indexOf(n) < 0);
      if (missing.length) problems.push(r.tab + (r.sub ? ' › ' + r.sub : '') + ' claims React drew the route but has no wrapper for ' + missing.join(', '));
    } else if (got.boxes.length) {
      problems.push(r.tab + (r.sub ? ' › ' + r.sub : '') + ' has screen wrappers in #main but no data-react-route claim');
    }
    if (got.amp) problems.push(r.screen + ' shows a literal &amp; to the player');
    if (got.chars <= 0) problems.push(r.screen + ' rendered an empty main pane');
    rows.push('  ' + String(r.tab + (r.sub ? ' › ' + r.sub : '')).padEnd(24) + String(r.screen).padEnd(22) +
      (ok ? 'REACT' : 'NOT REACT').padEnd(11) + String(got.chars).padStart(5) + ' ch' +
      (r.screen === 'viewAgenda' ? (got.agenda ? '  agenda card present' : '  NO AGENDA CARD') : ''));
  }
  /* The cards inside Work › Business, asked for after the company above exists.

     They are inside groups that start collapsed - "Where you trade", "The
     people" - and a collapsed group emits its header and NOTHING ELSE: the
     cards are not in the markup until the header is tapped, because the header
     is a switch that re-renders the route with the group open. So a check that
     looks for a marker without opening the group is asking whether a card the
     player cannot yet see has been drawn. Open every closed group first, the
     way a player does, and then ask. (The header carries the members' key
     figures while closed, which is what makes a closed group honest.) */
  await go('Work', 'business');
  for (let pass = 0; pass < 4; pass++) {
    const opened = await p.evaluate(() => {
      let n = 0;
      document.querySelectorAll('[data-a="toggrp"]').forEach((el) => {
        const chev = el.querySelector('.sectchev');
        if (chev && chev.textContent.indexOf('\u25b8') >= 0) { el.click(); n++; }   /* ▸ closed */
      });
      return n;
    });
    await p.waitForTimeout(500);
    if (!opened) break;
  }
  await go('Work', 'business');
  const held = await p.evaluate(() => {
    const roots = Array.from(document.querySelectorAll('#main [data-react]'));
    const all = document.querySelectorAll('#main .card').length;
    const mine = roots.length ? roots[0].querySelectorAll('.card').length : 0;
    return { roots: roots.length, who: roots.length ? roots[0].getAttribute('data-react') : null, all, mine };
  });
  const wholeRoute = held.roots === 1 && held.mine === held.all && held.all > 0;
  if (!wholeRoute) {
    problems.push('Work › Business is drawn by the app but its cards are not all inside it: ' +
      held.mine + ' of ' + held.all + ' cards inside ' + held.roots + ' wrapper(s) (' + (held.who || 'none') + ')');
  }
  rows.push('  ' + String('Work › business').padEnd(24) + String('(the whole route)').padEnd(22) +
    (wholeRoute ? 'REACT' : 'NOT REACT').padEnd(11) + String(held.mine + ' of ' + held.all + ' cards inside one wrapper').padStart(7));

  await checkInstallButton(p, go, rows, problems);

  /* THE CHROME MUST NOT STACK.

     applyDisclosure() appends a chevron to every heading and wraps the card's
     contents; on the string path the whole container is replaced each render so
     it never mattered. A container React owns is re-rendered in place, and the
     first version of that path put another chevron in every heading and another
     Expand all row on the page for every state change. Four renders, four
     chevrons: "Where you stand Lagos \u25be\u25be\u25be\u25be". This counts, per render. */
  const chrome = async () => {
    /* on the route that HAS disclosure chrome: the overview's Skills, economy
       and "what is at risk" cards carry no controls, so they are the ones the
       pass wraps. Counting on a route with none of it would report STABLE about
       nothing at all - which is exactly what the first version of this did. */
    global.__step = 'disclosure';
    await go('Overview', null);
    const count = async () => p.evaluate(() => ({
      chev: document.querySelectorAll('#main .chev').length,
      heads: document.querySelectorAll('#main h3, #main h4').length,
      tools: document.querySelectorAll('#main .disctools').length,
      wrapped: document.querySelectorAll('#main .discbody').length
    }));
    const before = await count();
    global.__step = 'disclosure over three renders';
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => { const a = document.querySelector('[data-a="advance"]'); if (a) a.click(); });
      await p.waitForTimeout(900);
      await p.evaluate(() => { const c = document.querySelector('[data-a="close"]'); if (c) c.click(); });
      await p.waitForTimeout(500);
    }
    const after = await count();
    return { before, after };
  };

  /* the phase's own claim, in the running app */
  await shellDrawer();
  const react = await reactivity();
  const ch = await chrome();
  if (ch.before.chev === 0) {
    problems.push('the disclosure chrome check found no chrome to stack on the Overview ' +
      '(the fixture did not reach the state it is about)');
  }
  if (ch.after.chev > ch.before.heads) {
    problems.push('the disclosure chrome stacked: ' + ch.after.chev + ' chevrons for ' +
      ch.after.heads + ' headings after three more renders (' + ch.before.chev + ' before)');
  }
  if (ch.after.tools > 1) {
    problems.push('the Expand all / Collapse all row was inserted ' + ch.after.tools +
      ' times - it belongs on the page once');
  }
  rows.push('  ' + 'disclosure chrome'.padEnd(24) + String('(3 renders)').padEnd(22) +
    ((ch.after.chev <= ch.before.heads && ch.after.tools <= 1) ? 'STABLE' : 'STACKED').padEnd(11) +
    (ch.after.chev + ' chevrons / ' + ch.after.tools + ' tool rows'));
  if (react.before.route !== 'viewMoneyBudget') {
    problems.push('Money › Budget is not drawn by React in the app: data-react-route is ' + react.before.route);
  }
  if (!react.after.same) {
    problems.push('a quarter advanced on Money › Budget and the page was rebuilt - the element captured ' +
      'before the action is not the same element after it');
  }
  rows.push('  ' + 'Money › budget'.padEnd(24) + String('(reactivity)').padEnd(22) +
    (react.after.same ? 'IN PLACE' : 'REBUILT').padEnd(11) +
    ('route ' + (react.before.route || 'none')));

  for (const c of SCREEN_REACT_ROUTE_NOT) {
    const got = await go(c.tab, c.sub);
    const name = c.tab + ' \u203a ' + c.sub;
    const marked = got.who.indexOf(c.screen) >= 0;
    if (!marked) problems.push('the screen marker is missing on a route it draws inside: ' + name + ' -> ' + c.screen);
    if (got.route) problems.push('a route stamp appeared on a route the game still arranges: ' + name + ' -> ' + got.route);
    rows.push('  ' + String(name).padEnd(24) + String(c.screen).padEnd(22) + String('REACT screen / markup route').padEnd(33) + String(got.chars).padStart(5) + ' ch');
  }

  for (const c of CONTROLS_UNCONVERTED) {
    const got = await go(c.tab, c.sub);
    const name = c.tab + (c.sub ? ' › ' + c.sub : '');
    if (got.who.length) problems.push('the marker appeared on an unconverted route: ' + name + ' -> ' + got.who.join(', '));
    rows.push('  ' + String(name).padEnd(24) + String('(not converted)').padEnd(22) + (got.who.length ? 'MARKED' : 'built-in').padEnd(11) + String(got.chars).padStart(5) + ' ch');
  }
  console.log(rows.join('\n'));
  console.log('');
  /* The counts are derived, not typed: "all ten" was true for one afternoon.
     They are also counted from the LISTS rather than by scanning the rows for
     the word REACT - a row for a screen inside a markup route says "REACT
     screen / markup route", and a summary that counted it as a React route
     would report the very thing this walk exists to keep apart. */
  const reacted = ROUTES.length;
  const walkedScreens = new Set(ROUTES.map((r) => r.screen)).size;
  /* counted from the list, not by scanning rows for the word "built-in": the
     modal row says built-in too, and a summary that counted it would report one
     unconverted ROUTE when there are none - which is exactly what it did the
     first time this ran. */
  const builtin = CONTROLS_UNCONVERTED.length;
  const half = rows.filter((r) => String(r).indexOf('markup route') > 0).length;
  /* A page error is the app failing to run, and this check printed four of them
     while reporting nothing to fix: the app asked @ledger/ui for a name its
     entry file did not export, every screen that needed the fact threw, and the
     walk's summary still said "no empty pane". Errors fail the walk now. */
  /* the page row, read back out of the rows rather than remembered: the number
     in the summary is the number the walk printed one line above */
  const pageRows = rows.filter((r) => /^  the page /.test(String(r)));
  const pageRow = pageRows.length ? pageRows[0].trim().split(/\s{2,}/).slice(-1)[0] + ' on the route it was on' : 'never asked';
  const pageErrors = errs.filter((e) => e.startsWith('pageerror'));
  if (pageErrors.length) problems.push(pageErrors.length + ' page error(s): ' + pageErrors[0]);
  console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n  - ' + problems.join('\n  - ')
    : 'all ' + reacted + ' routes walked answered from React (' + walkedScreens + ' screens, and ' +
      EMBEDDED + ' holds every card on it) · the chrome (header, strip and modal) answered ' +
      'from React too · the page (' + pageRow + ') was the app\'s · ' + builtin + ' unconverted route' +
      (builtin === 1 ? '' : 's') + ' carried no marker · ' + half + ' screen' + (half === 1 ? '' : 's') +
      ' answered React inside a route the game still arranges, with no route stamp · ' +
      'a quarter advanced on a React route without rebuilding the page · ' +
      'no literal &amp; · no empty pane · no page error');
  console.log('console errors: ' + errs.length + (pageErrors.length ? ' (' + pageErrors.length + ' were page errors)' : ''));
  errs.slice(0, 6).forEach((e) => console.log('  ' + e));
  if (problems.length) process.exitCode = 1;
  await p.screenshot({ path: path.join(__dirname, '..', 'apps', 'web', 'web-react-governance.png'), fullPage: true });
  await b.close();
})();
