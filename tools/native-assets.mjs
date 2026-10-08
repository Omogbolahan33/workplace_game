/* The app's own face: every icon and splash the phone build ships, drawn from
   the one drawing the game already uses.

   `assets/phone` was created by `npx cap add android`, which is a template, and a
   template has its own icon: a light-blue cross on a white plate, at all five
   densities, in the round and adaptive flavours, plus a white splash. Every size
   was right and every picture was somebody else's. The `phone` gate now asks what
   the icons *look like*, so this tool has to answer it.

   One source of truth, deliberately: `ledger/icon.svg` - the same file the PWA
   icons, the favicon and the zip carry - and the background colour from
   `apps/phone/capacitor.config.json`. Nothing here has a colour or a shape of its
   own.

   What it writes:

     apps/phone/resources/       masters, committed: a store listing and a fresh
                                 `cap add` both need a picture at a big size
     apps/phone/android/...      every density the platform asks for, plus the
                                 adaptive icon's plate colour and the splash set
                                 - only when a platform folder is present, since
                                 it is generated and gitignored

   Idempotent: unchanged bytes are not rewritten. Run it after `cap add` with
   `npm run assets` in apps/phone, or as part of `tools/rebuild.sh`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PHONE = path.join(ROOT, 'apps', 'phone');
const require = createRequire(path.join(ROOT, '.harness', 'x.js'));
let chromium = null;
try { ({ chromium } = require('playwright')); } catch (e) {
  /* the faces are already in the tree and the `phone` gate checks them; a fresh
     checkout that has not installed the harness keeps the ones it has rather
     than failing the build over a drawing tool */
  console.log('the app’s face     : skipped — playwright is not installed (cd .harness && npm install), ' +
    'the icons already in apps/phone are untouched');
  process.exit(0);
}

const svgSource = fs.readFileSync(path.join(ROOT, 'ledger', 'icon.svg'), 'utf8');
const cfg = JSON.parse(fs.readFileSync(path.join(PHONE, 'capacitor.config.json'), 'utf8'));
const BG = cfg.backgroundColor || '#080b10';

/* the mark's own plate is the rect that covers the whole viewBox; it is only in
   the way when the picture has to be a foreground layer on someone else's plate */
const plate = /<rect[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*fill="(#[0-9a-fA-F]{3,8})"[^>]*\/>/;
const m = svgSource.match(plate);
const plateFill = m && m[1] === m[2] ? m[3].toLowerCase() : null;
if (!plateFill) { console.error('icon.svg has no full-canvas plate rect — nothing to strip for the foreground layers'); process.exit(1); }
const foregroundSvg = svgSource.replace(plate, '');
const matchesBg = plateFill === BG.toLowerCase();

/* density → the sizes Android asks for. The launcher icon is 48dp, its
   foreground layer 108dp (the adaptive canvas, of which the middle ~62% is safe
   to draw in), and the splash is the screen. */
const DENSITY = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const SPLASH = {
  mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280],
  xxhdpi: [960, 1600], xxxhdpi: [1280, 1920],
};

const canvas = async () => {
  /* A browser that cannot *start* is the same situation as one that is not
     installed: this container has no `libnspr4` until somebody apt-installs it,
     and a build that dies halfway through — after the payloads were copied and
     before the faces were painted — leaves the tree in a state nobody asked for.
     The faces already in `apps/phone` and `apps/mobile` are the ones the gates
     check, so this skips loudly and lets the build finish. */
  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    /* A missing shared library is reported by playwright as "Target page, context
       or browser has been closed", which reads like a concurrency bug. Find the
       real reason and print it: the libraries are outside the workspace, so a
       fresh container always loses them. */
    let libs = [];
    try {
      const home = process.env.HOME || '';
      const dir = path.join(home, '.cache', 'ms-playwright');
      const chromiumDir = fs.readdirSync(dir).filter((d) => /^chromium(-\d+)?$/.test(d)).sort().pop();
      const inside = path.join(dir, chromiumDir);
      const exe = path.join(inside, fs.readdirSync(inside).find((d) => d.startsWith('chrome-linux')) || '', 'chrome');
      libs = require('node:child_process').execFileSync('ldd', [exe], { encoding: 'utf8' })
        .split('\n').filter((l) => /not found/.test(l)).map((l) => l.trim().split(' ')[0]);
    } catch (err) { /* not the missing-library case, or not Linux */ }
    console.log('the app’s face     : skipped — chromium cannot start here ('
      + (libs.length ? libs.length + ' missing shared librar' + (libs.length === 1 ? 'y' : 'ies') +
        ': ' + libs.slice(0, 4).join(', ') : String(e.message).split('\n')[0].slice(0, 80))
      + ') · the icons already in the tree are untouched');
    return null;
  }
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.setContent('<!doctype html><meta charset="utf-8"><body></body>');
  /* every picture this tool writes comes out of here: the same drawing, a
     canvas at the exact pixel size, and one of four ways of framing it */
  const draw = (svg, w, h, opts) => page.evaluate(async ({ svg, w, h, opts }) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = new Image();
    img.width = w; img.height = h;
    await new Promise((ok, no) => { img.onload = ok; img.onerror = () => no(new Error('svg did not load')); img.src = url; });
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    if (opts.bg) { x.fillStyle = opts.bg; x.fillRect(0, 0, w, h); }
    if (opts.round) { x.beginPath(); x.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2); x.clip(); }
    const box = Math.min(w, h) * (opts.fit || 1);
    const dx = (w - box) / 2, dy = (h - box) / 2;
    x.drawImage(img, dx, dy, box, box);
    URL.revokeObjectURL(url);
    return c.toDataURL('image/png').split(',')[1];
  }, { svg, w, h, opts });

  return { page, done: () => browser.close(), draw };
};

/* ---- the React Native app's face -----------------------------------------
   `apps/mobile` points `expo.icon` at the *web* icon and has no adaptive icon
   at all, which is the same mistake one project over: the sizes a store asks
   for are not the sizes a manifest asks for. The masters are drawn here, for the
   same reason: one drawing, one colour, no picture invented. */
const MOBILE = path.join(ROOT, 'apps', 'mobile');
const mobileDir = path.join(MOBILE, 'assets');
const emitMobile = fs.existsSync(MOBILE);

const OUT = [];
const write = (rel, base64, root = PHONE) => {
  const buf = Buffer.from(base64, 'base64');
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const before = fs.existsSync(abs) ? fs.readFileSync(abs) : null;
  if (before && before.equals(buf)) { OUT.push(rel + ' (unchanged)'); return false; }
  fs.writeFileSync(abs, buf);
  OUT.push(rel);
  return true;
};

const painting = await canvas();
if (!painting) {
  console.log('platform folders   : nothing painted' + (androidHint()));
  process.exit(0);
}
const { page, done, draw } = painting;
function androidHint() {
  return ' — run `npx playwright install --with-deps chromium` (or apt-get the browser\u2019s libraries) ' +
    'and build again to repaint every icon from ledger/icon.svg';
}

/* ---- the app's face: iOS, Android and the web target of Expo ---- */
if (emitMobile) {
  const toMobile = (rel, b64) => write(rel, b64, MOBILE);
  toMobile('assets/icon.png', await draw(svgSource, 1024, 1024, {}));
  toMobile('assets/adaptive-icon.png', await draw(foregroundSvg, 1024, 1024, { fit: 0.62 }));
  toMobile('assets/splash-icon.png', await draw(foregroundSvg, 1024, 1024, { fit: 0.62 }));
  toMobile('assets/favicon.png', await draw(svgSource, 48, 48, {}));
}

/* ---- masters: the size a store listing wants, and what a fresh cap add needs ---- */
write('resources/icon.png', await draw(svgSource, 1024, 1024, {}));
write('resources/icon-foreground.png', await draw(foregroundSvg, 1024, 1024, { fit: 0.62 }));
write('resources/icon-background.png', await draw(foregroundSvg, 1024, 1024, { bg: BG, fit: 0 }));
write('resources/splash.png', await draw(svgSource, 2732, 2732, { bg: BG, fit: 0.24 }));
write('resources/splash-dark.png', await draw(svgSource, 2732, 2732, { bg: BG, fit: 0.24 }));

/* ---- Android: every density the platform reads ---- */
const res = path.join(PHONE, 'android', 'app', 'src', 'main', 'res');
let android = fs.existsSync(res);
if (android) {
  for (const [name, d] of Object.entries(DENSITY)) {
    const n = Math.round(48 * d);
    write(`android/app/src/main/res/mipmap-${name}/ic_launcher.png`, await draw(svgSource, n, n, {}));
    write(`android/app/src/main/res/mipmap-${name}/ic_launcher_round.png`, await draw(svgSource, n, n, { round: true }));
    const f = Math.round(108 * d);
    write(`android/app/src/main/res/mipmap-${name}/ic_launcher_foreground.png`, await draw(foregroundSvg, f, f, { fit: 0.62 }));
  }
  for (const [name, [w, h]] of Object.entries(SPLASH)) {
    write(`android/app/src/main/res/drawable-port-${name}/splash.png`, await draw(svgSource, w, h, { bg: BG, fit: 0.26 }));
    write(`android/app/src/main/res/drawable-land-${name}/splash.png`, await draw(svgSource, h, w, { bg: BG, fit: 0.26 }));
  }
  write('android/app/src/main/res/drawable/splash.png', await draw(svgSource, 480, 320, { bg: BG, fit: 0.26 }));
  const plateXml = path.join(res, 'values', 'ic_launcher_background.xml');
  if (fs.existsSync(plateXml)) {
    const xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">' + BG + '</color>\n</resources>\n';
    if (fs.readFileSync(plateXml, 'utf8') !== xml) { fs.writeFileSync(plateXml, xml); OUT.push('values/ic_launcher_background.xml'); }
    else OUT.push('values/ic_launcher_background.xml (unchanged)');
  }
} else {
  android = false;
}
await done();

console.log('the app’s face     : ' + OUT.length + ' file(s) from ledger/icon.svg · background ' + BG +
  (matchesBg ? ' (the mark\u2019s own plate)' : ' (the mark plate is ' + plateFill + ')'));
for (const o of OUT) console.log('  ' + o);
if (!android) {
  console.log('platform folders   : none in the tree — the masters are in apps/phone/resources/; run ' +
    '`npx cap add android && npm run assets` where the SDK is to paint the native resources');
}
