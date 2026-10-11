/* App-shell gate: the React app has the resources an app needs, and they work.

   `single.js` plays the file a player downloads. This gate plays the *app* -
   and it is here because the app was deployable and not installable: `next
   build` passed, the walks passed, and `/manifest.webmanifest`, `/sw.js`, the
   icons and the apple-touch-icon were all 404, because `apps/web` had no
   `public/` and the layout linked no manifest. A gate that only asks whether
   something renders cannot see a missing worker.

   It builds and starts the app itself, in a build directory of its own
   (`LEDGER_DIST_DIR=.next/gate`), so it can run while a dev server is up
   without the two Next processes fighting over `.next`. The build is reused
   while it is newer than every source file, which is what makes a repeat run
   fast and a changed source slow - never stale.

   What it asks, in order:
     1. the manifest exists, parses, and describes an app (name, start_url,
        standalone, maskable icon)
     2. every icon it names exists, is really a PNG at the size it claims,
        and the apple-touch-icon exists for iOS
     3. the service worker is served, is not our placeholder, and is not cached
        by the browser
     4. the page's own head links the manifest and the apple icon, and carries a
        viewport that fits a notch
     5. in a real browser: the worker registers, activates, and caches the shell
     6. **with the network off**, a cold navigation still opens the app and the
        game boots - the claim "installable and works offline" made real
     7. the app it serves is the React one: the header, the strip and a converted
        route answer React, and the console is clean
*/
const { chromium } = require('playwright');
const { execFileSync, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'apps', 'web');
const DIST = path.join(APP, '.next', 'gate');
/* A port of our own, asked of the kernel. The first version of this gate fixed
   3009 and leaked its server: killing `npx` does not kill the server npx
   started, so a later run's build replaced the directory a *stale* server was
   still serving from memory, and the gate reported the app broken while a ghost
   answered on the port. */
function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)); });
  });
}
let PORT = 0;
let BASE = '';

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const global_step = (s) => { global.__step = s; };

/* ---- 0. a build, if the one on disk is older than the source --------------- */

function sources() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.next')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else out.push(p);
    }
  };
  walk(APP);
  for (const pkg of ['core', 'ui']) {
    const dir = path.join(ROOT, 'packages', pkg);
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isFile() && /\.(js|jsx|ts|css|json)$/.test(e.name)) out.push(path.join(dir, e.name));
    }
    /* modules/ is generated, and it is what the app actually compiles: a section
       edited and regenerated has to invalidate this build too */
    for (const sub of ['src', 'tables', 'modules']) {
      const d = path.join(dir, sub);
      if (!fs.existsSync(d)) continue;
      for (const f of fs.readdirSync(d)) if (/\.(js|jsx|ts|css)$/.test(f)) out.push(path.join(d, f));
    }
  }
  return out;
}

const stamp = path.join(DIST, 'BUILD_ID');
const newest = Math.max(...sources().map((f) => fs.statSync(f).mtimeMs));
const haveBuild = fs.existsSync(stamp) && fs.statSync(stamp).mtimeMs > newest;

if (!haveBuild) {
  process.stdout.write('building the app (LEDGER_DIST_DIR=.next/gate) … ');
  try {
    execFileSync('npx', ['next', 'build'], {
      cwd: APP, stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
      env: Object.assign({}, process.env, { LEDGER_DIST_DIR: '.next/gate' })
    });
    console.log('done');
  } catch (e) {
    console.log('FAILED');
    console.log('APP-SHELL ISSUES:\n - the app does not build: ' +
      String((e.stdout || '') + (e.stderr || '')).split('\n').filter((l) => /error|Error|failed/i.test(l)).slice(0, 5).join('\n   '));
    process.exit(1);
  }
} else {
  console.log('build              : reusing .next/gate (newer than every source file)');
}

/* ---- 1. serve it exactly the way `next start` does ------------------------ */

let server = null;
let serverLog = '';
/* detached, so the server and everything it starts are one process *group* and
   the group can be killed: `npx` is a wrapper, and a SIGTERM to a wrapper leaves
   the wrapper's child listening on the port. */
function start(port) {
  server = spawn('npx', ['next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd: APP, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
    env: Object.assign({}, process.env, { LEDGER_DIST_DIR: '.next/gate' })
  });
  server.stdout.on('data', (d) => { serverLog += d; });
  server.stderr.on('data', (d) => { serverLog += d; });
}
const stop = () => {
  if (!server) return;
  try { process.kill(-server.pid, 'SIGTERM'); } catch (e) { try { server.kill('SIGTERM'); } catch (e2) {} }
};

const get = (pathname) => new Promise((resolve, reject) => {
  const req = http.get(BASE + pathname, (res) => {
    const chunks = [];
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
  });
  req.on('error', reject);
  req.setTimeout(15000, () => { req.destroy(new Error('timeout')); });
});

(async () => {
  PORT = await freePort();
  BASE = 'http://127.0.0.1:' + PORT;
  start(PORT);

  /* wait for the port, not for a sleep */
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    try { const r = await get('/'); up = r.status === 200; } catch (e) { await new Promise((r) => setTimeout(r, 500)); }
  }
  if (!up) {
    stop();
    console.log('APP-SHELL ISSUES:\n - the app never answered on ' + BASE + '\n   ' +
      serverLog.split('\n').slice(-4).join('\n   '));
    process.exit(1);
  }

  /* ---- 2. the manifest --------------------------------------------------- */

  const man = await get('/manifest.webmanifest');
  ck(man.status === 200, 'GET /manifest.webmanifest is ' + man.status);
  let m = null;
  try { m = JSON.parse(man.body.toString('utf8')); } catch (e) { ck(false, 'the manifest is not JSON: ' + e.message); }
  if (m) {
    ck(!!m.name && !!m.short_name, 'the manifest has no name/short_name');
    ck(m.display === 'standalone', 'the manifest does not ask for display: standalone (' + m.display + ')');
    ck(!!m.start_url && !!m.scope, 'the manifest has no start_url/scope');
    ck(/^#|^rgb/.test(String(m.theme_color || '')), 'the manifest has no theme_color, so an installed app gets a white bar');
    const icons = m.icons || [];
    const png = (size, purpose) => icons.some((i) =>
      /png/.test(i.type || '') && String(i.sizes).indexOf(size) === 0 && (!purpose || (i.purpose || 'any').indexOf(purpose) > -1));
    ck(png('192'), 'the manifest has no 192×192 PNG icon (Android will scale something else)');
    ck(png('512'), 'the manifest has no 512×512 PNG icon (Android needs one for a splash)');
    ck(icons.some((i) => (i.purpose || '').indexOf('maskable') > -1), 'the manifest has no maskable icon, so Android crops the mark');

    /* every icon it names: really there, really a PNG, really that size */
    for (const ic of icons) {
      const r = await get(ic.src);
      ck(r.status === 200, 'the manifest names ' + ic.src + ' and it is ' + r.status);
      if (r.status !== 200) continue;
      if (/png/.test(ic.type || '')) {
        const isPng = r.body.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
        ck(isPng, ic.src + ' is served as a PNG and is not one');
        if (isPng) {
          const w = r.body.readUInt32BE(16), h = r.body.readUInt32BE(20);
          ck(String(ic.sizes) === w + 'x' + h, ic.src + ' claims ' + ic.sizes + ' and is ' + w + 'x' + h);
        }
      }
    }
  }

  /* ---- 3. the apple icon and the worker --------------------------------- */

  const apple = await get('/apple-touch-icon.png');
  ck(apple.status === 200, 'GET /apple-touch-icon.png is ' + apple.status + ' — iOS falls back to a screenshot of the page');
  if (apple.status === 200) {
    const isPng = apple.body.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
    ck(isPng, 'the apple-touch-icon is not a PNG (iOS ignores an SVG one)');
    ck(apple.body.readUInt32BE(16) === 180, 'the apple-touch-icon is ' + apple.body.readUInt32BE(16) + 'px, not 180');
  }

  const sw = await get('/sw.js');
  ck(sw.status === 200, 'GET /sw.js is ' + sw.status + ' — the ui registers a worker that is not there');
  if (sw.status === 200) {
    const text = sw.body.toString('utf8');
    ck(!/Generated by|placeholder/i.test(text), 'sw.js looks like a placeholder');
    ck(/addEventListener\('fetch'/.test(text), 'sw.js registers no fetch handler, so it caches nothing');
    ck(/addEventListener\('install'/.test(text), 'sw.js has no install handler, so there is no precache');
    const cc = String(sw.headers['cache-control'] || '');
    ck(/no-cache|no-store/.test(cc), 'sw.js is served with Cache-Control "' + cc + '" — a deploy would ship behind a cached worker');
  }

  /* ---- 4. the page's own head ------------------------------------------- */

  const home = await get('/');
  const html = home.body.toString('utf8');
  ck(home.status === 200, 'GET / is ' + home.status);
  ck(/rel="manifest"[^>]*href="\/manifest\.webmanifest"|href="\/manifest\.webmanifest"[^>]*rel="manifest"/.test(html),
    'the page does not link the manifest, so a browser never offers to install it');
  ck(/rel="apple-touch-icon"/.test(html), 'the page does not link an apple-touch-icon');
  ck(/name="theme-color"/.test(html), 'the page has no theme-color meta');
  ck(/viewport-fit=cover/.test(html), 'the viewport does not fit a notch (viewport-fit=cover)');
  console.log('resources          : manifest ' + man.status + ' · ' + (m && (m.icons || []).length) + ' icons · worker ' +
    sw.status + ' · apple ' + apple.status + ' · manifest linked ' +
    (/rel="manifest"/.test(html) ? 'yes' : 'NO'));

  /* ---- 5-7. in a browser: register, activate, go offline ---------------- */

  const b = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  const onPage = (page) => {
    page.on('console', (mm) => { if (mm.type() === 'error') errs.push(String(mm.text()).slice(0, 160)); });
    page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  };
  onPage(p);
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.waitForTimeout(1800);

  /* The app opens on the start screen, which is a modal and no chrome — so the
     first thing to ask is that it is the app asking (a title, a start screen,
     no tabs yet), and the second is that pressing Begin gets a game: the same
     three clicks the app walk makes. */
  const booted = await p.evaluate(() => ({
    /* three steps with a rail, the first of them asking for a name */
    screen: (function(){
      const host = document.querySelector('#modalHost');
      if (!host) return null;
      return { steps: host.querySelectorAll('[data-a="step"]').length,
               name: !!host.querySelector('#inName'),
               next: !!host.querySelector('[data-a="stepnext"]') };
    })(),
    tabs: document.querySelectorAll('[data-a="tab"]').length,
    title: document.title,
    markers: document.querySelectorAll('[data-react],[data-react-shell]').length
  }));
  ck(booted.screen && booted.screen.steps === 3 && booted.screen.name, 'the app did not open the start screen');
  ck(booted.tabs === 0, 'the app drew a tab strip before a game exists');
  ck(booted.markers > 0, 'nothing on the start screen claims to be drawn by React');
  console.log('the app            : "' + booted.title + '" · start screen asked for a name · ' +
    booted.markers + ' React markers, ' + booted.tabs + ' tabs before a game');

  global_step('Begin');
  await p.evaluate(() => {
    const next = () => { const b = document.querySelector('[data-a="stepnext"]'); if (b) b.click(); };
    const name = document.getElementById('inName');
    if (name) { name.value = 'Ada Okonjo'; name.dispatchEvent(new Event('input', { bubbles: true })); }
    const city = document.querySelector('[data-a="pickcity"]'); if (city) city.click();
    next();
    const prof = document.querySelector('[name="prof"]'); if (prof) prof.click();
    next();
    const diff = document.querySelector('[data-a="pickdiff"]'); if (diff) diff.click();
    const go = document.querySelector('[data-a="startgame"]'); if (go) go.click();
  });
  await p.waitForTimeout(1800);
  const shell = await p.evaluate(() => ({
    top: (document.getElementById('toprow') || {}).getAttribute ? document.getElementById('toprow').getAttribute('data-react-shell') : null,
    tabs: (document.getElementById('tabs') || {}).getAttribute ? document.getElementById('tabs').getAttribute('data-react-shell') : null,
    subs: (document.getElementById('subs') || {}).getAttribute ? document.getElementById('subs').getAttribute('data-react-shell') : null,
    tabsN: document.querySelectorAll('[data-a="tab"]').length,
    page: document.body.getAttribute('data-react-page'),
    modal: (document.getElementById('modalHost') || { children: [] }).children.length
  }));
  ck(shell.top === 'top' && shell.tabs === 'tabs',
    'the React shell is not drawing the app (top=' + shell.top + ', tabs=' + shell.tabs + ')');
  ck(shell.tabsN >= 3, 'Begin started no game: ' + shell.tabsN + ' tabs');
  ck(shell.modal === 0, 'the start modal is still up after Begin');
  console.log('Begin              : a game starts · header, strip and sub-strip from React · ' +
    shell.tabsN + ' tabs · the page is ' + (shell.page ? 'React\u2019s' : 'NOT React\u2019s'));

  /* the worker: registered, active, and holding a cache */
  const reg = await p.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false };
    const r = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      scope: r ? r.scope : null,
      active: r && r.active ? r.active.state : null,
      script: r && r.active ? r.active.scriptURL : null
    };
  });
  ck(reg.supported, 'this browser has no service worker support, so installability cannot be claimed');
  ck(!!reg.scope, 'the service worker never registered: ' + JSON.stringify(reg));

  /* wait for activation, which is what makes the caches usable */
  let active = reg.active;
  for (let i = 0; i < 20 && active !== 'activated'; i++) {
    await p.waitForTimeout(500);
    active = await p.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      return r && r.active ? r.active.state : null;
    });
  }
  ck(active === 'activated', 'the worker registered but never activated (' + active + ')');
  const caches = await p.evaluate(async () => {
    if (!self.caches) return { names: [], shell: false };
    const names = await caches.keys();
    let shell = false;
    for (const n of names) {
      const c = await caches.open(n);
      const keys = await c.keys();
      if (keys.some((r) => new URL(r.url).pathname === '/')) shell = true;
    }
    return { names: names, shell: shell };
  });
  ck(caches.names.length > 0, 'the worker activated and cached nothing');
  ck(caches.shell, 'the worker cached no app shell, so an offline visit has nothing to open');
  console.log('the worker         : scope ' + reg.scope + ' · ' + active + ' · caches ' +
    JSON.stringify(caches.names) + ' · shell cached ' + (caches.shell ? 'yes' : 'NO'));

  /* one visit to a route, so the walk's own chunks are in the cache too */
  await p.evaluate(() => {
    const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === 'Overview');
    if (t) t.click();
  });
  await p.waitForTimeout(1200);

  /* ---- offline: the claim, tested by turning the network off ------------- */

  await ctx.setOffline(true);
  const off = await ctx.newPage();
  onPage(off);
  let offErr = null;
  try {
    await off.goto(BASE + '/', { waitUntil: 'load', timeout: 20000 });
  } catch (e) { offErr = e.message; }
  await off.waitForTimeout(1500);
  const offline = offErr ? { failed: offErr } : await off.evaluate(() => ({
    top: (document.getElementById('toprow') || {}).getAttribute ? document.getElementById('toprow').getAttribute('data-react-shell') : null,
    /* the header's content, not what is painted: world-first on a phone draws
       the header's numbers as the HUD over the city, so they are in the row but
       not shown in it - the question is whether the app drew a header at all */
    chars: ((document.getElementById('toprow') || {}).textContent || '').replace(/\s+/g, ' ').trim().length,
    screen: !!document.querySelector('#modalHost [data-a="stepnext"]'),
    body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 40)
  }));
  ck(!offline.failed, 'with the network off the app does not open at all: ' + offline.failed);
  if (!offline.failed) {
    /* Either screen is a pass, and the resumed one is the stronger claim: the
       worker answered the navigation from its cache, the chunks came from its
       cache too, and the run came back out of localStorage - offline, a game in
       progress, not a start screen. What must not happen is a browser error
       page, and that is what the check is really about. */
    ck(offline.top === 'top' && (offline.begin || offline.chars > 40),
      'offline the app opened something that is not the game: ' + JSON.stringify(offline));
    console.log('offline            : opened with the network off · ' + (offline.begin ? 'the start screen' :
      'a run resumed from its own save') + ' · ' + offline.chars + ' characters of chrome · "' +
      offline.body.slice(0, 30) + '"');
  }
  await ctx.setOffline(false);

  /* ---- the walk's routes too: a converted route draws from React --------- */

  await p.evaluate(() => {
    const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === 'Money');
    if (t) t.click();
  });
  await p.waitForTimeout(600);
  await p.evaluate(() => {
    const s = Array.from(document.querySelectorAll('[data-a="sub"]')).find((n) => (n.getAttribute('data-s') || '') === 'budget');
    if (s) s.click();
  });
  await p.waitForTimeout(700);
  const route = await p.evaluate(() => {
    const m = document.getElementById('main');
    return {
      stamp: m ? m.getAttribute('data-react-route') : null,
      cards: m ? m.querySelectorAll('.card').length : 0,
      head: m ? m.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : ''
    };
  });
  ck(!!route.stamp, 'Money › budget is drawn as markup in the app (no route stamp)');
  ck(route.cards > 0, 'Money › budget drew no card');
  console.log('a converted route  : Money › budget · ' + route.cards + ' cards · "' + route.head + '"');

  const real = errs.filter((e) => !/favicon/i.test(e));
  ck(real.length === 0, 'the console was not clean: ' + real.slice(0, 4).join(' | '));
  console.log('console errors     : ' + real.length);

  await b.close();
  stop();

  if (bad.length) { console.log('\nAPP-SHELL ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
  console.log('\nAPPSHELL CLEAN \u2014 the app builds, serves its manifest, icons and worker, registers the worker, caches ' +
    'its shell, opens with the network off, and draws the shell and a converted route from React');
})().catch((e) => { stop(); console.error('APPSHELL THREW: ' + e.message); process.exit(1); });
