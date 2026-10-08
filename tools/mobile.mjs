/* Put the built game into both phone apps, and prove it landed.

   There are three phone-shaped artifacts and they must be the same game:

     · `ledger/`               the folder the zip is made from, and what a
                               browser is served
     · `apps/mobile/assets/game/`  the Expo app's bundled asset (WebView source,
                               the icon, the splash)
     · `apps/phone/www/`       the Capacitor app's web directory

   Copying is the whole job, and that is exactly why it needs a program: a
   stale copy is the failure mode this repository has already been bitten by
   twice (a three-phase-old zip; a browser walk that was green against the wrong
   file). So this copies and then **verifies byte for byte**, and writes a stamp
   (`build.json`) carrying the size and hash of the game it copied - which is
   what lets a gate tell "fresh" from "coincidentally the same filename".

   Runs at the end of `tools/rebuild.sh`, so it cannot be a step somebody
   remembers. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(ROOT, 'ledger');
const ANDROID_PUBLIC = path.join(ROOT, 'apps', 'phone', 'android', 'app', 'src', 'main', 'assets', 'public');
const TARGETS = [
  { name: 'mobile', dir: path.join(ROOT, 'apps', 'mobile', 'assets', 'game') },
  { name: 'phone', dir: path.join(ROOT, 'apps', 'phone', 'www') },
  /* The native project's copy, when a platform folder is present. `cap sync`
     writes this too, and for a while it was the *only* thing that did — so a
     build after the last sync left the Android project with last week's game
     inside it, which is the exact failure this file exists to prevent, one
     directory deeper. Copying it here makes the copier the only owner of the
     bytes; `cap sync` afterwards copies the same bytes over themselves. */
  ...(fs.existsSync(ANDROID_PUBLIC) ? [{ name: 'android', dir: ANDROID_PUBLIC }] : [])
];

/* the whole folder: the game, the manifest, the worker and every icon, so the
   WebView build is the zip's build, and the app's own icon/splash files are the
   same drawings the browser installs */
const FILES = fs.readdirSync(SRC).filter((f) => fs.statSync(path.join(SRC, f)).isFile());

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

if (!fs.existsSync(path.join(SRC, 'index.html'))) {
  console.error('mobile.mjs: no ledger/index.html — run tools/bundle.mjs first');
  process.exit(1);
}

const game = fs.readFileSync(path.join(SRC, 'index.html'));
const stamp = {
  source: 'ledger/',
  files: FILES.length,
  game: { bytes: game.length, sha: sha(game) },
  at: new Date().toISOString()
};

let copied = 0;
const problems = [];
for (const t of TARGETS) {
  fs.mkdirSync(t.dir, { recursive: true });
  /* remove anything that is no longer part of the game, so a renamed icon does
     not linger in one app and not the other */
  for (const old of fs.readdirSync(t.dir)) {
    if (FILES.indexOf(old) < 0 && old !== 'build.json') fs.rmSync(path.join(t.dir, old), { force: true });
  }
  for (const f of FILES) {
    const buf = fs.readFileSync(path.join(SRC, f));
    fs.writeFileSync(path.join(t.dir, f), buf);
    copied++;
    const back = fs.readFileSync(path.join(t.dir, f));
    if (sha(back) !== sha(buf)) problems.push(t.name + '/' + f + ' did not copy cleanly');
  }
  fs.writeFileSync(path.join(t.dir, 'build.json'), JSON.stringify(stamp, null, 1) + '\n');
}

if (problems.length) {
  console.error('MOBILE PAYLOAD PROBLEMS:');
  problems.forEach((p) => console.error(' - ' + p));
  process.exit(1);
}

console.log('phone payloads    : ' + copied + ' files into apps/mobile + apps/phone · game ' +
  game.length + ' chars · ' + stamp.game.sha + ' · byte for byte');
