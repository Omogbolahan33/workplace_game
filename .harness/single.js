/* Single-file gate: the shipped artifact, in a browser, with no app on the page.

   Everything else in this harness either runs the simulation headlessly, drives
   the sections directly, or walks the NEXT APP. None of them opens the thing the
   player downloads. That is what this gate is: `ledger/` served as it ships
   (index.html plus the service worker, manifest and icons), loaded in Chromium,
   played through its own controls.

   The claim is the one Step 4 is now about: the app may own the page in the
   module build, but the single file has no app, declares nothing, and its
   `render()` still draws the whole game as markup. So the walk asserts the
   opposite of browser-screens.cjs - **no React marker anywhere, ever** - and
   then asks for the page-level work that stays in `render()` even when the
   markup is what changed: the disclosure chrome, the focus and caret memory, the
   scroll position, and the fact that a redraw puts the player back on the route
   they were looking at.

   Fixture: one seeded world (4242, the harness rule) built by calling the same
   entry point the Begin button calls, and a second, fresh page that presses
   Begin itself so the button is exercised too. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'ledger');
const SEED = 4242;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* The same list browser-screens.cjs walks, from the one place both read: the app
   walk asks which of these pages React drew, this gate asks that the shipped file
   draws every one of them as markup. 23 entries, 22 distinct routes - Money >
   markets is one route with two screens the app serves inside it, and the single
   file draws both through the same route. */
const { ROUTES: WALK } = require('./routes.js');
const ROUTES = WALK.map((r) => ({ tab: r.tab, sub: r.sub, name: r.tab + (r.sub ? ' \u203a ' + r.sub : '') }));

function serve() {
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

const txt = (s) => String(s).replace(/\s+/g, ' ').trim();

(async () => {
  const srv = await serve();
  const url = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  /* the one helper the page side needs: whitespace flattened, so a length is a
     length and a heading is comparable. Installed before any page script runs,
     so it survives the reload the last check does. */
  await p.addInitScript(() => {
    window.txt = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  });
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(txt(m.text()).slice(0, 160)); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message + ' @ ' + (global.__step || 'boot')));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(1500);

  /* ---- 1. it boots as a game with no app on the page ---------------------- */

  global.__step = 'boot';
  const boot = await p.evaluate(() => {
    const asks = {};
    /* The seam is the ui's own and is in this file by design (it is how an app
       would declare itself). What must not be true is that anything HAS declared
       itself - so the gate asks the ui, rather than counting names: an app that
       quietly claimed the page in the single-file build would leave the markup
       path drawing piece by piece and this file would be a half-app. */
    try { asks.page = window.pageOwnership ? window.pageOwnership() : null; } catch (e) { asks.page = 'threw: ' + e.message; }
    try { asks.app = typeof window.appDrawsPage === 'function' ? window.appDrawsPage() : null; } catch (e) { asks.app = 'threw: ' + e.message; }
    try { asks.shell = window.shellOwnership ? window.shellOwnership() : null; } catch (e) { asks.shell = 'threw: ' + e.message; }
    return {
      markers: document.querySelectorAll('[data-react],[data-react-route],[data-react-page],[data-react-shell]').length,
      asks: asks,
      title: document.title,
      /* The start screen is the thing that greets the player, and the start
         screen is three steps with a rail: the first step asks for the name.
         Equality with the old single button would be testing a screen that no
         longer exists, so this asserts the shape the player actually meets. */
      screen: (function(){
        const host = document.querySelector('#modalHost');
        if (!host) return null;
        return { steps: host.querySelectorAll('[data-a="step"]').length,
                 name: !!host.querySelector('#inName'),
                 next: !!host.querySelector('[data-a="stepnext"]') };
      })(),
      tabsBefore: document.querySelectorAll('[data-a="tab"]').length
    };
  });
  ck(boot.markers === 0, 'the single file carries ' + boot.markers + ' React marker(s) - there is no app here');
  ck(boot.asks.app === false && boot.asks.page && boot.asks.page.owned === false,
    'something has claimed the page in the single file: appDrawsPage=' + JSON.stringify(boot.asks.app) +
    ' pageOwnership=' + JSON.stringify(boot.asks.page));
  ck(Array.isArray(boot.asks.shell) && boot.asks.shell.length === 0,
    'something has claimed the chrome in the single file: ' + JSON.stringify(boot.asks.shell));
  ck(boot.screen && boot.screen.steps === 3 && boot.screen.name && boot.screen.next && boot.tabsBefore === 0,
    'the start screen is not the thing that greets the player (' + JSON.stringify(boot.screen) +
    ', ' + boot.tabsBefore + ' tabs)');
  console.log('boots              : ' + boot.title + ' \u00b7 start screen, ' + boot.screen.steps +
    ' steps, a name field \u00b7 ' +
    boot.markers + ' React markers \u00b7 the seam answers "' + (boot.asks.page && boot.asks.page.why) + '"');

  /* ---- 1b. the zip's own resources ---------------------------------------- */

  /* The five companions the HTML is shipped with: a manifest, a worker and the
     icons. Gate `appshell` asks the same questions of the app; this asks them of
     the file a player unzips, where a missing icon is a home screen with a
     screenshot of the page on it and a missing worker is no offline at all. */
  const res = await p.evaluate(async () => {
    const head = (n) => new Uint8Array(n.slice(0, 8));
    const isPng = (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    const get = async (u) => {
      try { const r = await fetch(u, { cache: 'no-store' }); return { url: u, status: r.status, buf: await r.arrayBuffer() }; }
      catch (e) { return { url: u, status: 0, error: e.message }; }
    };
    const man = await get('manifest.webmanifest');
    let m = null;
    try { m = JSON.parse(new TextDecoder().decode(man.buf)); } catch (e) {}
    const out = { manifest: man.status, linked: !!document.querySelector('link[rel="manifest"]'), icons: [], apple: null, sw: null, m: m };
    if (m && Array.isArray(m.icons)) {
      for (const ic of m.icons) {
        const r = await get(ic.src);
        const png = r.status === 200 && isPng(head(r.buf));
        out.icons.push({ src: ic.src, status: r.status, png: png,
          size: png ? new DataView(r.buf).getUint32(16) + 'x' + new DataView(r.buf).getUint32(20) : null,
          claims: ic.sizes, purpose: ic.purpose || 'any' });
      }
    }
    const ap = await get('apple-touch-icon.png');
    out.apple = { status: ap.status, png: ap.status === 200 && isPng(head(ap.buf)),
      size: ap.status === 200 && isPng(head(ap.buf)) ? new DataView(ap.buf).getUint32(16) : null };
    const sw = await get('sw.js');
    out.sw = { status: sw.status, text: sw.status === 200 ? new TextDecoder().decode(sw.buf) : '' };
    return out;
  });

  ck(res.manifest === 200 && res.m, 'the zip has no manifest the browser can read (' + res.manifest + ')');
  ck(res.linked, 'index.html does not link its manifest');
  if (res.m) {
    ck(res.m.display === 'standalone', 'the manifest does not ask for display: standalone');
    ck(String(res.m.start_url || '').replace(/^\.\//, '') === 'index.html', 'the manifest start_url is not the file');
    const sized = (n) => res.icons.some((i) => i.png && i.size === n);
    ck(sized('192x192'), 'no 192x192 PNG icon in the zip');
    ck(sized('512x512'), 'no 512x512 PNG icon in the zip (Android needs one for a splash)');
    ck(res.icons.some((i) => i.png && i.purpose.indexOf('maskable') > -1), 'no maskable PNG icon in the zip');
    ck(res.icons.every((i) => i.status === 200), 'an icon the manifest names is missing: ' +
      res.icons.filter((i) => i.status !== 200).map((i) => i.src).join(', '));
  }
  ck(res.apple.status === 200 && res.apple.png, 'the zip has no apple-touch-icon.png (iOS would use a screenshot)');
  ck(res.sw.status === 200, 'the zip has no service worker, so no offline');
  if (res.sw.status === 200) {
    ck(/addEventListener\('install'/.test(res.sw.text) && /addEventListener\('fetch'/.test(res.sw.text),
      'the zip\u2019s worker has no install/fetch handler');
    const named = ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'].filter((f) => res.sw.text.indexOf(f) < 0);
    ck(named.length === 0, 'the worker does not precache ' + named.join(', ') +
      ' - an installed game would have no icon offline');
  }
  console.log('the zip\u2019s resources   : manifest ' + res.manifest + ' · ' +
    res.icons.filter((i) => i.png).length + ' PNG icons at the sizes claimed · apple-touch-icon ' +
    (res.apple.png ? res.apple.size + 'px' : 'MISSING') + ' · worker ' + res.sw.status + ' precaching its icons');

  /* ---- 2. Begin starts a game, by clicking Begin -------------------------- */

  global.__step = 'Begin';
  await p.evaluate(() => {
    /* the walk a player makes: name and city, next, who you are, next, rules */
    const n = document.getElementById('inName');
    if (n) { n.value = 'Ada Okonjo'; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const city = document.querySelector('[data-a="pickcity"]');
    if (city) city.click();
    const next = () => { const b = document.querySelector('[data-a="stepnext"]'); if (b) b.click(); };
    next();
    const prof = document.querySelector('[name="prof"]') || document.querySelector('#modalHost input[type=radio]');
    if (prof) prof.click();
    next();
    const diff = Array.from(document.querySelectorAll('[data-a="pickdiff"]')).find((x) => !x.disabled);
    if (diff) diff.click();
    const go = document.querySelector('[data-a="startgame"]');
    if (go) go.click();
  });
  await p.waitForTimeout(1200);
  const started = await p.evaluate(() => ({
    tabs: Array.from(document.querySelectorAll('[data-a="tab"]')).map((n) => n.textContent.trim()),
    main: txt((document.getElementById('main') || {}).innerText || '').length,
    modal: (document.getElementById('modalHost') || { children: [] }).children.length,
    markers: document.querySelectorAll('[data-react],[data-react-route],[data-react-page]').length
  }));
  ck(started.tabs.length >= 3 && started.main > 200,
    'Begin did not start a game: ' + started.tabs.length + ' tabs, ' + started.main + ' characters of page');
  ck(started.modal === 0, 'the start modal is still on the screen after Begin');
  ck(started.markers === 0, 'a React marker appeared on the markup path');
  console.log('Begin              : starts a game \u00b7 tabs ' + started.tabs.join('/') + ' \u00b7 ' +
    started.main + ' characters on the page');

  /* ---- 3. the walk: 23 routes, all of them markup -------------------------- */

  const go = async (tab, sub) => {
    await p.evaluate(([label, s]) => {
      if (label) {
        const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === label);
        if (t) t.click();
      }
      if (s) {
        const el = Array.from(document.querySelectorAll('[data-a="sub"]'))
          .find((n) => (n.getAttribute('data-s') || n.getAttribute('data-v') || '') === s);
        if (el) el.click();
      }
    }, [tab, sub]);
    await p.waitForTimeout(320);
    return p.evaluate(() => {
      const el = document.getElementById('main');
      const t = el ? el.innerText.replace(/\s+/g, ' ').trim() : '';
      return {
        cards: el ? el.querySelectorAll('.card').length : 0,
        chars: t.length,
        head: t.slice(0, 60),
        markers: document.querySelectorAll('[data-react],[data-react-route],[data-react-page]').length,
        dirty: ['undefined', 'NaN', '[object Object]', 'null%', 'Infinity', 'function()'].filter((x) => t.includes(x)),
        amp: /&amp;(?!amp;)/.test(t)
      };
    });
  };

  /* A seeded world, so the walk sees the same page every run: this is the same
     call the Begin button makes, with the harness's fixed seed. Then a company,
     because the walk is about pages a player can be on and half this game is
     about a company a player owns - Governance with no company is one honest
     card that says so, and walking 23 routes over that world would be checking
     the same short page 23 times. */
  global.__step = 'a seeded world, and a company in it';
  /* The harness rule is a fixed seed, so the walk is the same world every run.
     The profile is chosen with the seed: at 4242 a fresh graduate in Lagos has
     N180k and cannot afford a single one of the ten companies - which is a real
     state of the game and a real screen, but it is not the screen the other
     twenty-two routes are about. A returnee at the same seed can afford four,
     and the world behind them is the same world. */
  await p.evaluate((seed) => {
    const w = window;
    w.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: seed });
    w.render();
  }, SEED);
  await p.waitForTimeout(500);
  await go('Work', 'business');
  const offered = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#main [data-a="startbiz"]'));
    const off = btns.filter((b) => b.disabled);
    return {
      all: btns.length,
      can: btns.filter((b) => !b.disabled).length,
      /* the harness's own rule, on the screen that needs it most: a disabled
         control has to say why it is disabled, and the reason has to name a
         number the player can act on */
      silent: off.filter((b) => {
        const why = (b.getAttribute('title') || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + b.textContent;
        return !/[\u20a6\d]/.test(why);
      }).length
    };
  });
  const founded = await p.evaluate(async () => {
    const pick = Array.from(document.querySelectorAll('#main [data-a="startbiz"]')).find((b) => !b.disabled);
    if (!pick) return { none: true };
    const card = pick.closest('.card');
    const name = card ? (card.querySelector('h3') || {}).textContent : '';
    pick.click();
    await new Promise((r) => setTimeout(r, 600));
    /* starting a company asks what capital to put in: the box is pre-filled with
       the default, which is what a player who just presses the button gets */
    const box = document.getElementById('amtBox');
    const ok = document.querySelector('#modalHost [data-a="okamount"]') ||
               document.querySelector('#modalHost [data-a="okconfirm"]') ||
               document.querySelector('#modalHost [data-a="close"]');
    if (box && ok) { ok.click(); await new Promise((r) => setTimeout(r, 600)); }
    return { name: (name || '').replace(/\s+/g, ' ').trim().slice(0, 34) };
  });
  await p.waitForTimeout(500);
  const hasCompany = await p.evaluate(() => !/There is nothing to govern|START A COMPANY/.test(
    (document.getElementById('main') || {}).innerText || ''));
  ck(!founded.none, 'not one of the ten companies could be started in this world, so the walk would be one page');
  ck(hasCompany, 'the world has no company after starting one, so half the walk would be the same short card');
  ck(offered.silent === 0, offered.silent + ' of the ' + offered.all + ' company buttons are disabled without a ' +
    'reason a player can act on - a disabled control with no number beside it is indistinguishable from a missing game');
  console.log('the world          : seed ' + SEED + ', ' + offered.can + ' of ' + offered.all +
    ' companies affordable \u00b7 started "' + founded.name + '" by clicking Start alone');

  const seen = [];
  let walked = 0;
  for (const r of ROUTES) {
    global.__step = 'go ' + r.name;
    const got = await go(r.tab, r.sub);
    if (got.markers) bad.push(r.name + ': ' + got.markers + ' React marker(s) on a page with no app');
    if (got.dirty.length) bad.push(r.name + ': the page says ' + got.dirty.join(', '));
    if (got.amp) bad.push(r.name + ': the page has a literal &amp;');
    /* A route is allowed to be short - Governance before a quarter has closed
       is three collapsed headers that say exactly that - but it is not allowed
       to be empty, and a route with no card on it is a route that drew nothing
       worth reading. */
    if (got.cards < 1) bad.push(r.name + ': the route has no card on it');
    if (got.chars < 60) bad.push(r.name + ': the route is empty (' + got.chars + ' characters)');
    seen.push(r.name + ' ' + got.cards + ' cards/' + got.chars + ' chars');
    walked++;
  }
  console.log('routes walked      : ' + walked + ' entries, ' +
    new Set(ROUTES.map((r) => r.tab + '|' + r.sub)).size + ' distinct routes \u00b7 every one drawn as ' +
    'markup, with a card on it \u00b7 none saying undefined/NaN/[object Object] \u00b7 ' +
    Math.max(...seen.map((s) => Number(/(\d+) chars/.exec(s)[1]))) + ' characters on the fullest');

  /* ---- 4. the page-level work that lives in render() ---------------------- */

  /* the route the player is on survives a redraw */
  global.__step = 'the route survives a redraw';
  await go('Money', 'position');
  const beforeRoute = await p.evaluate(() => ({
    sub: (document.querySelector('[data-a="sub"].on') || {}).getAttribute
      ? document.querySelector('[data-a="sub"].on').getAttribute('data-s') : null,
    head: txt((document.getElementById('main') || {}).innerText || '').slice(0, 40)
  }));
  await p.evaluate(() => { window.render(); });
  await p.waitForTimeout(400);
  const afterRoute = await p.evaluate(() => ({
    sub: (document.querySelector('[data-a="sub"].on') || {}).getAttribute
      ? document.querySelector('[data-a="sub"].on').getAttribute('data-s') : null,
    head: txt((document.getElementById('main') || {}).innerText || '').slice(0, 40)
  }));
  ck(beforeRoute.sub === afterRoute.sub && beforeRoute.head === afterRoute.head,
    'a redraw moved the player: ' + JSON.stringify(beforeRoute) + ' \u2192 ' + JSON.stringify(afterRoute));
  console.log('a redraw           : the player is still on ' + afterRoute.sub + ' \u00b7 "' + afterRoute.head.slice(0, 30) + '"');

  /* the disclosure chrome: open a chevron, redraw, and it is still open */
  global.__step = 'disclosure';
  /* The state that matters is the body the chevron hides: the chevron glyph and
     the computed display of the card's body are what a player sees, and the
     collapsed map is game state that a redraw has to honour. */
  const readDisc = () => p.evaluate(() => {
    const d = document.querySelector('#main [data-disc]');
    if (!d) return { none: true };
    const card = d.parentElement;
    const body = card && card.querySelector('.discbody');
    const chev = d.querySelector('.chev');
    return {
      id: d.getAttribute('data-disc'),
      glyph: chev ? chev.textContent.trim() : null,
      shown: body ? window.getComputedStyle(body).display !== 'none' : null
    };
  });
  const d0 = await readDisc();
  if (!d0.none) {
    await p.evaluate(() => { const d = document.querySelector('#main [data-disc]'); d.click(); });
    await p.waitForTimeout(250);
    const d1 = await readDisc();
    ck(d1.shown !== d0.shown, 'clicking the chevron on ' + d0.id + ' did not change what the card shows');
    await p.evaluate(() => { window.render(); });
    await p.waitForTimeout(300);
    const d2 = await readDisc();
    ck(d2.shown === d1.shown && d2.glyph === d1.glyph,
      'a redraw lost the disclosure state of ' + d1.id + ': ' + JSON.stringify(d1) + ' \u2192 ' + JSON.stringify(d2));
    console.log('disclosure         : ' + d0.id + ' ' + (d0.shown ? 'open' : 'closed') + ' \u2192 clicked (' +
      (d1.shown ? 'open' : 'closed') + ', glyph ' + d1.glyph + ') \u2192 redrew and it is still ' +
      (d2.shown ? 'open' : 'closed'));
  }

  /* the focus and caret memory: the page is redrawn as a string, and the input
     the player is typing in keeps the caret where it was */
  global.__step = 'focus memory';
  global.__step = 'focus memory';
  /* Money \u203a budget is the route of rows: seven controls, each one a number
     the player drags, and the page is redrawn as a string every time one moves.
     The page-level work is the row the player is holding keeping focus, keeping
     the value they just set, and - in a box you can type in - keeping the caret
     where they left it. */
  await go('Money', 'budget');
  const typed = await p.evaluate(async () => {
    const rows = Array.from(document.querySelectorAll('#main [data-inp]'));
    if (!rows.length) return { none: true };
    /* a box if there is one, since a caret only exists in a box; the row is the
       claim either way */
    const canType = (n) => ['text', 'number', 'search', 'tel', 'email', ''].includes(n.type);
    const el = rows.find(canType) || rows[0];
    const key = (n) => (n.dataset.inp || n.name || n.id || n.tagName) + '|' + (n.dataset.k || '');
    const before = Number(el.value) || 0;
    el.focus();
    /* a range is dragged, a box is typed in: only the second has a caret, and
       setSelectionRange throws on the first */
    if (canType(el)) { el.value = '120000'; el.setSelectionRange(2, 2); }
    else { el.value = String(Math.max(0, Math.round(before * 0.8))); }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const set = el.value;
    await new Promise((r) => setTimeout(r, 120));
    window.render();
    await new Promise((r) => setTimeout(r, 250));
    const now = document.activeElement;
    return {
      key: key(el),
      typed: canType(el),
      same: now && now.dataset && now.dataset.inp ? key(now) : (now ? now.tagName : null),
      caret: now && now.selectionStart !== undefined ? now.selectionStart : null,
      value: now && 'value' in now ? now.value : null,
      set: set,
      spent: (document.querySelector('#main .card') || {}).innerText ? true : false
    };
  });
  ck(!typed.none, 'there is no row on Money \u203a budget to test the focus memory with');
  if (!typed.none) {
    ck(typed.same === typed.key, 'the focus did not come back to the row the player was holding: ' +
      typed.key + ' \u2192 ' + typed.same);
    ck(String(typed.value) === String(typed.set), 'the row lost the value the player set across a redraw: ' +
      typed.set + ' \u2192 ' + typed.value);
    if (typed.typed) ck(typed.caret === 2, 'the caret moved across a redraw: ' + typed.caret + ', expected 2');
    console.log('focus memory       : ' + typed.key + ' keeps focus' +
      (typed.typed ? ', caret ' + typed.caret : '') + ' and the value ' + typed.set + ' across a redraw');
  }

  /* the scroll position is page-level work too: the page is replaced, so who
     ever redraws has to put it back */
  global.__step = 'scroll';
  await go('Money', 'budget');
  const scroll = await p.evaluate(async () => {
    const room = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const at = Math.min(400, Math.max(0, room() - 10));
    window.scrollTo(0, at);
    await new Promise((r) => setTimeout(r, 200));
    const y = Math.round(window.scrollY);
    window.render();
    await new Promise((r) => setTimeout(r, 300));
    return { at: y, after: Math.round(window.scrollY), room: room() };
  });
  ck(scroll.at > 40, 'the page on Money \u203a budget is too short to test the scroll memory with (' +
    scroll.room + 'px of room)');
  ck(Math.abs(scroll.after - scroll.at) < 12,
    'the scroll position was lost across a redraw: ' + scroll.at + ' \u2192 ' + scroll.after);
  console.log('scroll             : ' + scroll.at + 'px before the redraw, ' + scroll.after +
    'px after (the page has ' + scroll.room + 'px of room)');

  /* ---- 5. a quarter advances, and the page is still markup ---------------- */

  global.__step = 'advance';
  const adv = await p.evaluate(() => {
    const b = document.querySelector('#toprow [data-a="advance"]');
    if (b) b.click();
    return !!b;
  });
  await p.waitForTimeout(500);
  /* the advance may land on a decision, which is a modal: answer it the way a
     player would, by choosing the first option offered */
  let turns = 0;
  for (let i = 0; i < 6; i++) {
    const opened = await p.evaluate(() => {
      const host = document.getElementById('modalHost');
      const pick = host.querySelector('[data-a="negoopt"], [data-a="okconfirm"], [data-a="close"], [data-a="choose"]');
      if (host.children.length && pick) { pick.click(); return true; }
      return false;
    });
    await p.waitForTimeout(400);
    if (!opened) break;
  }
  const afterAdvance = await p.evaluate(() => ({
    stamp: document.querySelector('[data-react-page],[data-react-route]'),
    markers: document.querySelectorAll('[data-react]').length,
    head: txt((document.querySelector('#toprow') || {}).innerText || '').slice(0, 40),
    chars: txt((document.getElementById('main') || {}).innerText || '').length,
    modal: (document.getElementById('modalHost') || { children: [] }).children.length
  }));
  ck(adv, 'there is no Advance control in the header');
  ck(!afterAdvance.stamp && afterAdvance.markers === 0, 'a React marker appeared after advancing a quarter');
  ck(afterAdvance.chars > 120, 'the page was empty after advancing a quarter');
  console.log('a quarter          : advanced and redrawn by render() \u00b7 "' +
    afterAdvance.head.slice(0, 34) + '" \u00b7 ' + afterAdvance.chars + ' characters \u00b7 modal ' +
    (afterAdvance.modal ? 'asked something' : 'closed'));

  /* ---- 6. the modal and the season drawer are markup too ------------------ */

  global.__step = 'the modal';
  await p.evaluate(() => { const b = document.querySelector('#toprow [data-a="settings"]'); if (b) b.click(); });
  await p.waitForTimeout(600);
  const modal = await p.evaluate(() => {
    const host = document.getElementById('modalHost');
    const box = host.querySelector('.modalbox');
    return {
      markers: host.querySelectorAll('[data-react]').length,
      boxes: host.querySelectorAll('.modalbox').length,
      text: box ? txt(box.textContent).slice(0, 50) : '',
      closes: host.querySelectorAll('[data-a="close"]').length
    };
  });
  ck(modal.boxes === 1 && modal.closes === 1, 'the modal did not open from the header: ' + JSON.stringify(modal));
  ck(modal.markers === 0, 'the modal carries a React marker on the markup path');
  await p.evaluate(() => { const c = document.querySelector('#modalHost [data-a="close"]'); if (c) c.click(); });
  await p.waitForTimeout(500);
  const emptied = await p.evaluate(() => (document.getElementById('modalHost') || { children: [] }).children.length);
  ck(emptied === 0, 'the modal host still had something in it after closing');
  console.log('the modal          : ' + modal.text + ' \u00b7 closed and the host is empty');

  /* ---- 7. it keeps its own game: storage is the whole backend ------------- */

  global.__step = 'reload';
  const beforeReload = await p.evaluate(() => {
    const t = document.querySelector('#toprow .stat, #toprow');
    return { head: txt((t || {}).innerText || '').slice(0, 80), saved: !!window.localStorage.getItem('ledger.save.v3') };
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const afterReload = await p.evaluate(() => ({
    head: txt((document.querySelector('#toprow') || {}).innerText || '').slice(0, 80),
    markers: document.querySelectorAll('[data-react]').length,
    begin: !!document.querySelector('#modalHost [data-a="startgame"]'),
    tabs: document.querySelectorAll('[data-a="tab"]').length
  }));
  ck(!afterReload.begin && afterReload.tabs >= 3,
    'the game did not come back after a reload: Begin ' + afterReload.begin + ', ' + afterReload.tabs + ' tabs');
  ck(afterReload.head === beforeReload.head,
    'the reloaded game is not the game that was saved:\n      before: ' + beforeReload.head + '\n      after:  ' + afterReload.head);
  ck(afterReload.markers === 0, 'a React marker appeared after a reload');
  console.log('a reload           : the same game comes back from its own storage \u00b7 "' +
    afterReload.head.slice(0, 46) + '"');

  /* ---- 8. nothing was thrown along the way -------------------------------- */

  await b.close(); srv.close();

  const real = errs.filter((e) => !/favicon/i.test(e));
  ck(real.length === 0, 'the console was not clean: ' + real.slice(0, 4).join(' | '));
  console.log('console errors     : ' + real.length);

  if (bad.length) { console.log('\nSINGLE-FILE ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
  console.log('\nSINGLE CLEAN \u2014 the file a player downloads boots on its own, draws all ' + walked +
    ' route entries as markup with no app on the page, keeps the route, the disclosure, the focus, the caret ' +
    'and the scroll across a redraw, advances a quarter, opens and closes its modal, and comes back after a reload');
})().catch((e) => { console.error('SINGLE THREW: ' + e.message); process.exit(1); });
