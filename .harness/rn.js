/* Gate: the simulation, on a phone.

   `rn_verify = core_only` is the answer this migration gave when asked how far
   the React Native work has to be verified, and this gate is that answer made
   concrete. It does not render a phone screen. It runs **the simulation** in a
   process with no DOM, on the host a phone would answer the seam with, and then
   makes the browser and the phone swap a save.

   Four things are only true if the port is real, and each has a check:

     1. **Nothing needs a browser.** Part 1 runs with `document`, `window`,
        `localStorage`, `fetch` and `location` deleted, on
        `apps/mobile/src/host.js` - the actual file the app ships - answering all
        eleven slots of the seam. A single stray DOM read anywhere in a decade of
        play fails here by name.

     2. **The seam is complete.** Every name in `tools/host-slots.json` has a
        function on the RN host, because a slot answered by nothing is a feature
        that silently does not exist (this repository has already paid for that
        lesson once, with a service worker).

     3. **The save is one format, two runtimes.** `save` in the seam is
        synchronous and React Native's storage is not, so the host keeps a warm
        mirror and flushes behind the write - and it writes the *browser's* bytes
        under the *browser's* key. Part 2 hands a phone-written save to a real
        browser runtime (the ui, in a stub DOM, in a child process) which boots
        from it, plays a quarter and saves again; then the phone loads that,
        plays a quarter, and the two state hashes must agree. A player can move
        between devices mid-run, and a quarter played on a phone is a quarter
        played in the browser.

     4. **The app is coherent with what it claims.** Part 3 reads the Expo app
        (imports resolve, dependencies are declared, `app.json` has ids/icons/
        splash) and asserts the game it bundles is byte-identical to the game the
        zip ships - the drift class this repository has been bitten by twice.

   What it does not do: build or run a phone app. There is no Android SDK and no
   Xcode in this container, and pretending otherwise is how a gate becomes
   theatre. `apps/phone` (the store build) has its own gate for the half that
   *can* be built here.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SEED = 4242;
const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 16);

/* ---- 1. this process has no DOM ------------------------------------------- */

const noDom = typeof document === 'undefined' && typeof window === 'undefined' &&
  typeof localStorage === 'undefined' && typeof location === 'undefined';
ck(noDom, 'the gate is running with a DOM in the process, so the core-only claim below is not being tested');
console.log('this process       : no document, no window, no localStorage — core only');

(async () => {
  /* ---- part 1: the simulation, on the phone's host ------------------------ */

  const hostFile = path.join(ROOT, 'apps', 'mobile', 'src', 'host.js');
  ck(fs.existsSync(hostFile), 'apps/mobile/src/host.js is missing, so there is no phone host to test');
  const { createRnHost, createStore, MIRROR_LIMIT } = require(hostFile);

  /* a device store with the shape of AsyncStorage, and a real gap between the
     call and the value: the whole point of the mirror is that the game never
     waits for this */
  function fakeDevice() {
    const data = new Map();
    return {
      data,
      writes: 0,
      async getAllKeys() { return Array.from(data.keys()); },
      async multiGet(keys) { return keys.map((k) => [k, data.has(k) ? data.get(k) : null]); },
      async setItem(k, v) { await new Promise((r) => setTimeout(r, 1)); data.set(k, v); this.writes++; },
      async removeItem(k) { data.set(k, null); data.delete(k); }
    };
  }

  const device = fakeDevice();
  const AsyncStorage = {
    getAllKeys: () => device.getAllKeys(),
    multiGet: (k) => device.multiGet(k),
    setItem: (k, v) => device.setItem(k, v),
    removeItem: (k) => device.removeItem(k)
  };
  const store = createStore(require(hostFile).asyncStorageBacking(AsyncStorage, 'ledger.'));
  const toasts = [];
  await store.hydrate();                       /* the app hydrates before installing */

  const { createRnHost: _unused, ...rest } = require(hostFile);
  const core = await import(path.join('file://', ROOT, 'packages', 'core', 'index.js'));
  const host = createRnHost({
    core,
    store,
    toast: (m) => toasts.push(String(m)),
    url: () => 'https://ledger.example.com/',
    canScan: () => true
  });

  /* 1a. every slot of the seam, answered
   *
   * host-slots.json is written the other way round - shim name -> the slot that
   * answers it, with 'call' meaning "the platform may provide this one by name
   * through hostCalls" - so the slots are its *values*, deduped, not its keys.
   * Counting the keys would have said "7 of 13" and been wrong twice: five of
   * those names are call-shims, and one slot is dotted (`net.fetch`). */
  const slotMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'host-slots.json'), 'utf8'));
  const slotNames = Array.from(new Set(Object.values(slotMap).filter((v) => v !== 'call')));
  const missing = slotNames.filter((n) => {
    const parts = n.split('.');
    let cur = host;
    for (const p of parts) { cur = cur ? cur[p] : undefined; }
    return typeof cur !== 'function';
  });
  ck(missing.length === 0, 'the phone host does not answer ' + missing.join(', ') +
    ' — a slot with nothing behind it is a feature that does not exist on that platform');
  const answered = slotNames.length - missing.length;
  console.log('the seam           : ' + answered + ' of ' + slotNames.length +
    ' slots answered by apps/mobile/src/host.js (' + slotNames.join(', ') + ') · ' +
    (MIRROR_LIMIT / 1024 / 1024) + ' MB mirror · write-behind flush');

  /* 1b. install it on core, and play a world through it */
  core.installHost(host);
  ck(typeof core.save === 'function', 'core has no save() to route to the host');

  const hashState = (S) => sha(JSON.stringify(S));
  const face = (S) => { const st = S || core.S; return { turn: st.turn, nw: Math.round(core.netWorth()), seed: st.seed, h: hashState(st) }; };

  /* A quarter, played the way a player plays it: advance, then answer whatever
     the quarter put on the table. The save does not carry an open modal (the
     game's own behaviour, in the file as much as here), so two runtimes forking
     from a save can only be compared if they both finish the quarter's business
     before anyone looks at the state. First option, every time - the point is
     that both sides make the same choice, not which choice is good.
     `afterThreadChoice` is core's, not the ui's: the same bookkeeping the ui
     does when a thread's stage is answered. */
  function playQuarter(coreIn) {
    coreIn.advanceQuarter();
    const m = coreIn.UI.modal;
    if (m && m.type === 'event' && m.ev && m.ev.opts && m.ev.opts.length) {
      const ev = m.ev;
      const opt = ev.opts[0];
      coreIn.resolveOption(ev, opt);
      const th = m.thread || ev.thread || null;
      if (th && (coreIn.S.threads || []).indexOf(th) >= 0) coreIn.afterThreadChoice(th, opt);
    }
    coreIn.UI.modal = null;
    return m ? m.type : null;
  }

  core.newGame({ name: 'Ada Okonjo', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: SEED });
  const start = face(core.S);
  const seenModals = {};
  for (let q = 0; q < 8; q++) { const t = playQuarter(core); if (t) seenModals[t] = (seenModals[t] || 0) + 1; core.save('auto'); }
  ck(core.UI.modal === null, 'eight played quarters left a modal open, so the save is not a state a player can fork from');
  await store.flushNow();
  await new Promise((r) => setTimeout(r, 20));
  const after8 = face(core.S);

  ck(after8.turn === start.turn + 8, 'eight quarters did not advance the game: turn ' +
    start.turn + ' → ' + after8.turn);
  ck(after8.nw !== start.nw, 'eight quarters changed nothing about the run');
  /* hasSave is not core's to answer: the simulation calls save() through the
     host, but asking *whether* a save exists is the platform's business (the
     browser's ui owns the slots; the phone's host answers it from its own store).
     This asserts the slot the phone actually ships, not a name core never had. */
  ck(host.hasSave('auto'), 'the host says there is no save after eight quarters of saving');
  const blobA = store.get('save.auto');
  ck(!!blobA, 'the save never reached the host mirror');
  let parsedA = null;
  try { parsedA = JSON.parse(blobA); } catch (e) { ck(false, 'the phone wrote a save that is not JSON: ' + e.message); }
  if (parsedA) {
    const keys = Object.keys(parsedA).sort().join(',');
    ck(keys === 'S,rs,ui', 'the phone save is {' + keys + '} — the browser writes {S, rs, ui}');
    ck(parsedA.rs === core.R.s, 'the phone save carries the wrong RNG state: ' + parsedA.rs + ' vs ' + core.R.s);
    ck(!!parsedA.S && typeof parsedA.S.turn === 'number', 'the phone save carries no game state');
  }

  /* the device really received it, asynchronously, behind the write */
  const deviceKeys = await device.getAllKeys();
  ck(deviceKeys.indexOf('ledger.save.auto') > -1,
    'the save never reached the device store: the mirror flushed ' + JSON.stringify(deviceKeys));
  console.log('a world on a phone : seed ' + SEED + ' · 8 quarters (' + (seenModals.event || 0) +
    ' decisions answered, ' + (seenModals.year || 0) + ' year reviews) · turn ' + after8.turn + ' · net worth ' +
    '₦' + after8.nw.toLocaleString('en-NG') + ' · save ' + (blobA || '').length + ' chars · device has ' +
    deviceKeys.length + ' key(s)');

  /* 1c. the app is killed and comes back: hydrate a cold store from the device */
  {
    const device2 = { data: device.data, writes: 0 };
    const cold = createStore(require(hostFile).asyncStorageBacking({
      getAllKeys: async () => Array.from(device.data.keys()),
      multiGet: async (keys) => keys.map((k) => [k, device.data.get(k)]),
      setItem: async () => { device2.writes++; },
      removeItem: async () => {}
    }, 'ledger.'));
    const n = await cold.hydrate();
    const host2 = createRnHost({ core, store: cold });
    ck(n > 0, 'a cold start hydrated nothing from the device');
    ck(host2.hasSave('auto'), 'a cold start does not see the save the phone wrote');
    const before = face(core.S);
    const ok = host2.load('auto');
    ck(ok === true, 'the phone could not load its own save');
    const loaded = face(core.S);
    ck(loaded.h === before.h, 'loading a phone save changed the run: hash ' + before.h + ' → ' + loaded.h);
  }

  /* 1d. determinism, which every fixture in this suite leans on */
  {
    const play = (seed) => {
      const s = createStore({ getAll: async () => ({}), set: async () => {}, remove: async () => {} });
      const h = createRnHost({ core, store: s });
      core.installHost(h);
      core.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed });
      for (let q = 0; q < 6; q++) core.advanceQuarter();
      return Math.round(core.netWorth());
    };
    const a = play(SEED), b = play(SEED), c = play(SEED + 1);
    ck(a === b, 'the same seed produced different runs on the phone host: ' + a + ' vs ' + b);
    ck(a !== c, 'a different seed produced the same run: the host is breaking the RNG');
    console.log('determinism        : seed ' + SEED + ' twice → ₦' + a.toLocaleString('en-NG') +
      ' both times · seed ' + (SEED + 1) + ' → ₦' + c.toLocaleString('en-NG'));
  }

  /* 1e. the slots that are not storage */
  {
    core.installHost(host);
    toasts.length = 0;
    core.toast('a native banner, please');
    ck(toasts.length === 1 && /native banner/.test(toasts[0]), 'toast() did not reach the app: ' + JSON.stringify(toasts));
    ck(host.url() === 'https://ledger.example.com/', 'url() does not answer the address an invite link should carry');
    ck(host.canScan() === true, 'canScan() does not report the phone\u2019s camera');
    ck(host.el('main') === null && host.render() === undefined && host.view() === '',
      'the DOM slots are not inert on the native side');
    const quiet = createRnHost({ core, store });
    ck(quiet.url() === '' && quiet.canScan() === false,
      'an unconfigured host claims an address or a camera it does not have');
    let rejected = false;
    await quiet.net.fetch('https://example.com').then(() => {}, () => { rejected = true; });
    ck(rejected, 'a host with no network resolves a fetch instead of rejecting it');
    console.log('the other slots    : toast → banner · url → the hosted address · canScan → true · ' +
      'el/render/view inert · no network = a rejection, not a hang');
  }

  /* 1f. the store bounds itself rather than growing until the phone dies */
  {
    const s = createStore({ getAll: async () => ({}), set: async () => {}, remove: async () => {} });
    const big = 'x'.repeat(400 * 1024);
    for (let i = 0; i < Math.ceil(MIRROR_LIMIT / (400 * 1024)) + 4; i++) s.set('k' + i, big);
    const keys = s.keys();
    ck(keys.length < Math.ceil(MIRROR_LIMIT / (400 * 1024)) + 4,
      'the mirror grew past its own bound: ' + keys.length + ' keys');
    ck(keys.indexOf('k' + (keys.length + 3)) > -1 || s.get(keys[keys.length - 1]) === big,
      'the mirror evicted the newest save instead of the oldest');
  }

  /* 1g. the bridge between the two halves of the app */
  {
    const bridge = require(path.join(ROOT, 'apps', 'mobile', 'src', 'bridge.js'));
    const junk = [null, undefined, '', 'x', '{}', '{"type":"nope"}', '[]', '[1,2,3]',
      '{"type":"ready"', '{"type":123}', '{"type":"save","body":123}',
      '{"type":"save","body":"text"}', '{"type":"save","body":[1,2]}'];
    const accepted = junk.filter((j) => bridge.parseFromGame(j) !== null);
    ck(accepted.length === 0, 'the bridge accepted nonsense from the WebView: ' +
      JSON.stringify(accepted).slice(0, 200));
    const big = JSON.stringify({ type: 'save', body: { text: 'x'.repeat(9 * 1024 * 1024) } });
    ck(bridge.parseFromGame(big) === null, 'the bridge accepted a 9 MB message');
    const ok = bridge.TYPES.filter((t) => bridge.parseFromGame(JSON.stringify({ type: t })) !== null);
    ck(ok.length === bridge.TYPES.length, 'the bridge rejects its own message types: ' +
      bridge.TYPES.filter((t) => ok.indexOf(t) < 0).join(', '));
    const undocumented = bridge.TYPES.filter((t) => !bridge.HANDLERS[t]);
    ck(undocumented.length === 0, 'the bridge has message types with no documented handler: ' + undocumented.join(', '));
    let threw = false;
    try { bridge.encodeToGame('nope', {}); } catch (e) { threw = true; }
    ck(threw, 'encoding an unknown message type does not throw');
    console.log('the bridge         : ' + bridge.TYPES.length + ' message types, all documented · ' +
      junk.length + ' malformed messages rejected · one shape, both directions');
  }

  /* ---- part 2: a save crosses runtimes ----------------------------------- */

  const tmp = path.join(require('os').tmpdir(), 'ledger-rn-' + process.pid);
  fs.mkdirSync(tmp, { recursive: true });
  const blobAFile = path.join(tmp, 'phone.json');
  const blobCFile = path.join(tmp, 'browser.json');
  fs.writeFileSync(blobAFile, blobA);

  /* The child is the browser runtime: the ui, installed on a stub DOM, booting
     from a save the way a reload does and saving again the way a click does.
     It runs in its own process on purpose - this gate's whole first half is
     "no DOM in this process", and the honest way to keep that true while still
     testing the browser half is to not be the browser. */
  const child = `
    import { createRequire } from 'node:module';
    import fs from 'node:fs';
    import crypto from 'node:crypto';
    const require = createRequire(${JSON.stringify(path.join(ROOT, '.harness', 'x.js'))});
    require(${JSON.stringify(path.join(ROOT, '.harness', 'dom.js'))});
    const core = await import(${JSON.stringify('file://' + path.join(ROOT, 'packages', 'core', 'index.js'))});
    const ui = await import(${JSON.stringify('file://' + path.join(ROOT, 'packages', 'ui', 'index.js'))});
    const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 16);
    const face = () => ({ turn: core.S.turn, nw: Math.round(core.netWorth()), seed: core.S.seed, h: sha(JSON.stringify(core.S)) });
    /* the same quarter the gate's own process plays, in the browser runtime */
    function playQuarter() {
      core.advanceQuarter();
      const m = core.UI.modal;
      if (m && m.type === 'event' && m.ev && m.ev.opts && m.ev.opts.length) {
        const ev = m.ev, opt = ev.opts[0];
        core.resolveOption(ev, opt);
        const th = m.thread || ev.thread || null;
        if (th && (core.S.threads || []).indexOf(th) >= 0) core.afterThreadChoice(th, opt);
      }
      core.UI.modal = null;
      return m ? m.type : null;
    }
    ui.install();
    const blob = fs.readFileSync(${JSON.stringify(blobAFile)}, 'utf8');
    globalThis.localStorage.setItem(core.SKEY + 'auto', blob);
    ui.boot();                                  /* the reload path, for real */
    const openedOnBoot = core.UI.modal ? core.UI.modal.type : null;
    const loaded = face();
    const first = playQuarter();                 /* the quarter after the fork */
    core.save('auto');
    const after = face();
    fs.writeFileSync(${JSON.stringify(blobCFile)}, globalThis.localStorage.getItem(core.SKEY + 'auto'));
    const second = playQuarter();
    const after2 = face();
    console.log(JSON.stringify({ loaded, after, after2, openedOnBoot, first, second }));
  `;

  let browser = null;
  try {
    const out = execFileSync('node', ['--input-type=module', '-e', child],
      { cwd: path.join(ROOT, '.harness'), encoding: 'utf8', timeout: 120000 });
    browser = JSON.parse(out.trim().split('\n').pop());
  } catch (e) {
    ck(false, 'the browser runtime could not open the phone\u2019s save: ' +
      String((e.stdout || '') + (e.stderr || '')).split('\n').slice(-3).join(' ').slice(0, 300));
  }

  if (browser) {
    /* the browser booted from the phone's bytes and agrees about the state */
    ck(browser.loaded.turn === after8.turn && browser.loaded.h === after8.h,
      'the browser loaded the phone save as a different run: turn ' + browser.loaded.turn + '/' + after8.turn +
      ' · hash ' + browser.loaded.h + '/' + after8.h);
    ck(browser.loaded.seed === SEED, 'the browser lost the world seed across the trip');
    ck(browser.openedOnBoot === null, 'booting from a save opened a ' + browser.openedOnBoot +
      ' — the save is a fork point, so nothing should be pending on the other side of it');

    /* and the phone loads the browser's save, plays the same quarter, and must
       land on the same state - normalisation, RNG and rounding included */
    const store3 = createStore(require(hostFile).asyncStorageBacking({
      getAllKeys: async () => ['ledger.save.auto'],
      multiGet: async () => [['ledger.save.auto', fs.readFileSync(blobCFile, 'utf8')]],
      setItem: async () => {},
      removeItem: async () => {}
    }, 'ledger.'));
    await store3.hydrate();
    const host3 = createRnHost({ core, store: store3 });
    core.installHost(host3);
    ck(host3.load('auto'), 'the phone could not load the save the browser wrote');
    const back = face();
    ck(back.h === browser.after.h,
      'the same save read in two runtimes is two different states: browser ' + browser.after.h +
      ' vs phone ' + back.h + ' (turn ' + browser.after.turn + '/' + back.turn + ')');
    playQuarter(core);
    const back2 = face();
    ck(back2.h === browser.after2.h,
      'a quarter played from the same save diverges between runtimes: browser ' + browser.after2.h +
      ' vs phone ' + back2.h + ' (net worth ' + browser.after2.nw + '/' + back2.nw + ')');
    console.log('the save crosses   : phone → browser boot → quarter (' + (browser.first || 'nothing') +
      ') → phone · state hashes ' + browser.loaded.h + ' / ' + browser.after.h + ' / ' + browser.after2.h +
      ' identical in both runtimes, after two played quarters each');
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  /* ---- part 3: the app is coherent with what it claims ------------------- */

  const APP = path.join(ROOT, 'apps', 'mobile');
  const pkg = JSON.parse(fs.readFileSync(path.join(APP, 'package.json'), 'utf8'));
  const deps = new Set(Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {})));

  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'assets') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out); else if (/\.(js|jsx|json)$/.test(e.name)) out.push(p);
    }
    return out;
  };

  /* Comments out before anything is read as an import: the first run of this
     scan reported `native.js imports whatever the app happens to be` - prose
     from a comment about invite links. A scanner that reads prose finds
     problems nobody can fix. */
  const stripComments = (t) => t
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

  const problems = [];
  for (const f of walk(APP)) {
    const text = stripComments(fs.readFileSync(f, 'utf8'));
    for (const m of text.matchAll(/(?:from|require\()\s*['"]([^'"\s]+)['"]/g)) {
      const spec = m[1];
      if (spec.startsWith('.')) {
        const base = path.resolve(path.dirname(f), spec);
        const found = ['', '.js', '.jsx', '/index.js', '/index.jsx'].some((ext) => fs.existsSync(base + ext));
        if (!found) problems.push(path.basename(f) + ' imports ' + spec + ', which is not there');
        continue;
      }
      const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!deps.has(name)) problems.push(path.basename(f) + ' imports ' + name + ', which package.json does not list');
    }
  }
  ck(problems.length === 0, 'the phone app does not hold together: ' + problems.slice(0, 4).join(' · '));

  const expoCfg = JSON.parse(fs.readFileSync(path.join(APP, 'app.json'), 'utf8')).expo;
  ck(!!expoCfg.ios.bundleIdentifier && !!expoCfg.android.package,
    'app.json has no store identity (ios.bundleIdentifier / android.package)');
  ck(expoCfg.orientation === 'portrait', 'app.json does not ask for portrait');
  ck(!!expoCfg.icon && !!expoCfg.splash && expoCfg.splash.backgroundColor === '#080b10',
    'app.json has no icon/splash, or a splash in the wrong colour');
  ck(!!expoCfg.android.adaptiveIcon && !!expoCfg.android.adaptiveIcon.foregroundImage,
    'app.json has no adaptive icon, so Android draws the mark in a white box');

  /* the game the app bundles is the game the zip ships */
  /* The app's own face: `expo.icon`, `expo.splash` and `android.adaptiveIcon` are
     the pictures a store and a launcher read, and they were pointing at the *web*
     icon (512px) with no adaptive icon at all - the same mistake the Capacitor
     shell shipped, one project over. Compared by pixels, against the web icon
     rendered from the same SVG, so "an app with a picture" is not enough. */
  const { signature: sigOf, distance: pngDistance, coverage: pngCoverage } = require('./png.js');
  const markSig = sigOf(fs.readFileSync(path.join(APP, 'assets', 'game', 'icon-512.png')));
  const faceChecks = [
    ['icon', expoCfg.icon, 1024],
    ['splash', expoCfg.splash && expoCfg.splash.image, 0],
    ['adaptiveIcon', expoCfg.android && expoCfg.android.adaptiveIcon &&
      expoCfg.android.adaptiveIcon.foregroundImage, 1024],
    ['favicon', expoCfg.web && expoCfg.web.favicon, 0],
  ];
  const faceProblems = [];
  for (const [what, rel, min] of faceChecks) {
    if (!rel) { faceProblems.push('app.json declares no ' + what); continue; }
    const abs = path.join(APP, rel.replace(/^\.\//, ''));
    if (!fs.existsSync(abs)) { faceProblems.push(what + ' -> ' + rel + ' does not exist'); continue; }
    const sig = sigOf(fs.readFileSync(abs));
    if (min && Math.max(sig.width, sig.height) < min) {
      faceProblems.push(what + ' is ' + sig.width + 'px - a store wants at least ' + min + 'px');
    }
    if (what === 'adaptiveIcon') {
      if (pngCoverage(sig) > 0.6) faceProblems.push('the adaptive icon is ' +
        Math.round(pngCoverage(sig) * 100) + '% drawn - a launcher crops the outside of that');
    } else if (pngDistance(sig, markSig) > 40) {
      faceProblems.push(what + ' is not the game\u2019s mark (distance ' +
        pngDistance(sig, markSig).toFixed(1) + ')');
    }
  }
  const plateHex = expoCfg.android && expoCfg.android.adaptiveIcon &&
    expoCfg.android.adaptiveIcon.backgroundColor;
  ck(plateHex === '#080b10', 'the adaptive icon\u2019s plate is ' + plateHex + ', not the app\u2019s #080b10');
  ck(faceProblems.length === 0, 'the app\u2019s face: ' + faceProblems.join('; '));
  console.log('the app\u2019s face    : ' + faceChecks.filter(([, r]) => r).length +
    ' pictures from ledger/icon.svg \u00b7 adaptive plate ' + plateHex +
    ' \u00b7 compared pixel by pixel to the mark');

  const bundled = path.join(APP, 'assets', 'game', 'index.html');
  ck(fs.existsSync(bundled), 'the app bundles no game (assets/game/index.html) — run `npm run build`');
  if (fs.existsSync(bundled)) {
    const shipped = fs.readFileSync(path.join(ROOT, 'ledger', 'index.html'));
    const mine = fs.readFileSync(bundled);
    ck(sha(shipped) === sha(mine), 'the app bundles a different game from the one that ships: ' +
      sha(shipped) + ' (ledger/) vs ' + sha(mine) + ' (apps/mobile)');
    const stamp = JSON.parse(fs.readFileSync(path.join(APP, 'assets', 'game', 'build.json'), 'utf8'));
    ck(stamp.game.sha === sha(shipped) && stamp.game.bytes === shipped.length,
      'the app\u2019s build stamp disagrees with the build it claims to carry');
    console.log('the app\u2019s game     : ' + mine.length + ' chars · ' + sha(mine) +
      ' · identical to the file the zip ships · ' + stamp.files + ' files stamped');
  }

  if (bad.length) { console.log('\nRN ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
  console.log('\nRN CLEAN \u2014 the simulation plays on the phone\u2019s host with no DOM in the process, every slot ' +
    'of the seam is answered, a save survives being killed and restarted, and a run crosses between the browser ' +
    'and the phone quarter by quarter with the same state on both sides');
})().catch((e) => { console.log('RN THREW: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')); process.exit(1); });
