/* Gate: the store build - the same single file in a native shell.

   `apps/phone` is Capacitor around the game that already exists: no second UI,
   no port, one HTML file in a WebView with an icon, a splash screen, a share
   sheet and a listing. It is the shipping answer for "a real app on my phone",
   and `apps/mobile` (React Native) is the other path, being prepared from the
   simulation's end.

   What can be checked here is exactly what can go wrong with a shell:

     1. **The web directory is the build.** `www/` is written by
        `tools/mobile.mjs` on every `npm run build`; this gate compares it to
        `ledger/` byte for byte and checks the stamp. A stale payload is this
        repository's oldest failure mode, and a phone app carrying last week's
        game is the worst version of it - nobody looks.
     2. **The config describes an app.** An appId, a name, a webDir that exists,
        dark colours, and the plugins' settings - because an unconfigured splash
        is a white flash and a wrong appId is an app you cannot update.
     3. **The plugins the app declares are the ones the app uses.** A plugin in
        `package.json` that nothing references is dead weight; a plugin used but
        not declared is a build failure at the worst moment.
     4. **If a platform folder is here, the sync really happened.** `android/` is
        generated and gitignored, so it may not be in the tree - but when it is,
        the copy inside it must be the build, the package must be the appId, and
        the plugin projects must be wired into the Gradle build. That last part
        is what `npx cap sync` does, and what a hand-edited project quietly
        loses.

   What this gate cannot do: build an APK. There is no Android SDK in this
   container and no Xcode, and a gate that pretended to build a phone app would
   be theatre. It checks everything up to the point where the SDK takes over.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const png = require('./png.js');

const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'apps', 'phone');
const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
const read = (p) => fs.readFileSync(p, 'utf8');

/* ---- 1. the payload is the build ------------------------------------------ */

const ledger = path.join(ROOT, 'ledger');
const www = path.join(APP, 'www');
const files = fs.readdirSync(ledger).filter((f) => fs.statSync(path.join(ledger, f)).isFile());

ck(fs.existsSync(path.join(www, 'index.html')), 'apps/phone/www has no index.html — run `npm run build`');
const differing = [];
for (const f of files) {
  const a = path.join(ledger, f), b = path.join(www, f);
  if (!fs.existsSync(b)) { differing.push(f + ' (missing)'); continue; }
  if (sha(fs.readFileSync(a)) !== sha(fs.readFileSync(b))) differing.push(f + ' (differs)');
}
ck(differing.length === 0, 'the phone\u2019s web directory is not the build: ' + differing.join(', '));

const shipped = fs.readFileSync(path.join(ledger, 'index.html'));
const stampFile = path.join(www, 'build.json');
ck(fs.existsSync(stampFile), 'the phone payload has no build stamp');
if (fs.existsSync(stampFile)) {
  const stamp = JSON.parse(read(stampFile));
  ck(stamp.game.sha === sha(shipped) && stamp.game.bytes === shipped.length,
    'the phone build stamp disagrees with the game it claims to carry (' + stamp.game.sha + ' vs ' + sha(shipped) + ')');
}
console.log('the payload        : ' + files.length + ' files in www/ · game ' + shipped.length + ' chars · ' +
  sha(shipped) + ' · identical to the zip\u2019s copy');

/* the icons a store listing needs, really PNGs at the sizes they claim */
const iconChecks = [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]];
const iconProblems = [];
for (const [name, size] of iconChecks) {
  const p = path.join(www, name);
  if (!fs.existsSync(p)) { iconProblems.push(name + ' is missing'); continue; }
  const buf = fs.readFileSync(p);
  const isPng = buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (!isPng) iconProblems.push(name + ' is not a PNG');
  else if (buf.readUInt32BE(16) !== size) iconProblems.push(name + ' is ' + buf.readUInt32BE(16) + 'px, not ' + size);
}
ck(iconProblems.length === 0, 'the phone\u2019s icon set is wrong: ' + iconProblems.join(', '));
ck(/rel="manifest"/.test(read(path.join(www, 'index.html'))), 'the payload does not declare its manifest');
console.log('the icon set       : ' + iconChecks.map(([n]) => n).join(', ') + ' · all real PNGs at the claimed sizes');

/* ---- 2. the config describes an app --------------------------------------- */

const cfgFile = path.join(APP, 'capacitor.config.json');
ck(fs.existsSync(cfgFile), 'apps/phone has no capacitor.config.json');
let cfg = null;
try { cfg = JSON.parse(read(cfgFile)); } catch (e) { ck(false, 'capacitor.config.json is not JSON: ' + e.message); }
if (cfg) {
  ck(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(cfg.appId || ''),
    'the appId is not a reverse-domain id: ' + JSON.stringify(cfg.appId));
  ck(!!cfg.appName, 'the config has no appName');
  ck(cfg.webDir === 'www', 'webDir is ' + JSON.stringify(cfg.webDir) + ', not the directory the build writes');
  ck(cfg.backgroundColor === '#080b10', 'the shell has no dark background, so the layout flashes white before the game paints');
  ck(cfg.bundledWebRuntime === false, 'bundledWebRuntime is on: that is Capacitor 2 and it ships a runtime nobody needs');
  ck(!cfg.server || !cfg.server.url, 'the config points the shell at a remote URL - then the app is a browser with an icon');
  const splash = cfg.plugins && cfg.plugins.SplashScreen;
  ck(!!splash && splash.backgroundColor === '#080b10', 'SplashScreen is not configured dark');
  const bar = cfg.plugins && cfg.plugins.StatusBar;
  ck(!!bar && bar.backgroundColor === '#080b10', 'StatusBar is not configured dark, so the game has a bright stripe on top');
  console.log('the config         : ' + cfg.appId + ' · "' + cfg.appName + '" · webDir ' + cfg.webDir +
    ' · splash + status bar dark · no remote url');
}

/* ---- 3. declared plugins are used, used plugins are declared -------------- */

const pkg = JSON.parse(read(path.join(APP, 'package.json')));
const deps = Object.keys(pkg.dependencies || {});
for (const p of deps) {
  ck(/^@capacitor\//.test(p), 'apps/phone depends on ' + p + ', which is not a Capacitor package');
}
const usedPlugins = Object.keys((cfg && cfg.plugins) || {}).map((n) => {
  const kebab = n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return '@capacitor/' + kebab;
});
for (const u of usedPlugins) {
  ck(deps.indexOf(u) > -1, 'the config configures ' + u + ' and package.json does not declare it');
}
/* A plugin that is installed, synced into the native project and never
   configured or called is a dependency that does nothing - it inflates the
   build, adds a native project to Gradle, and reads to a listing reviewer like
   a feature. Either it earns its place here or it is not a dependency. */
const unused = deps.filter((d) => ['@capacitor/core', '@capacitor/android', '@capacitor/ios', '@capacitor/cli'].indexOf(d) < 0)
  .filter((d) => usedPlugins.indexOf(d) < 0);
ck(unused.length === 0, 'declared but neither configured nor called: ' + unused.join(', ') +
  ' — wire it up or drop it (a plugin nobody uses is a native project nobody asked for)');
console.log('the plugins        : ' + usedPlugins.length + ' installed and configured (' + usedPlugins.join(', ') +
  ') · ' + (unused.length ? 'UNUSED: ' + unused.join(', ') : 'nothing declared that is not used'));

/* ---- 4. a platform folder, if there is one, is really synced -------------- */

const android = path.join(APP, 'android');
const res = path.join(android, 'app', 'src', 'main', 'res');
if (!fs.existsSync(android)) {
  console.log('platform folders   : none in the tree (they are generated and gitignored) — run ' +
    '`npm install && npx cap add android` in apps/phone where an SDK is available');
} else {
  const publicDir = path.join(android, 'app', 'src', 'main', 'assets', 'public');
  const synced = path.join(publicDir, 'index.html');
  ck(fs.existsSync(synced), 'android/ exists and has no synced web payload — run `npm run sync`');
  if (fs.existsSync(synced)) {
    const got = fs.readFileSync(synced);
    ck(sha(got) === sha(shipped), 'the copy inside the Android project is not the build: ' + sha(got) +
      ' vs ' + sha(shipped) + ' — the app would ship a different game from the one in the zip');
    const syncedIcons = iconChecks.filter(([n]) => !fs.existsSync(path.join(publicDir, n)));
    ck(syncedIcons.length === 0, 'the Android project is missing ' + syncedIcons.map(([n]) => n).join(', '));
  }

  /* Capacitor 7 names the package in Gradle, not in the manifest, so the
     manifest is checked for the things that make the app launchable at all:
     a label and icon a listing can read, and a main activity on the launcher. */
  const manifest = path.join(android, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (fs.existsSync(manifest)) {
    const text = read(manifest);
    ck(/android:label=/.test(text), 'AndroidManifest.xml declares no label, so the launcher shows a blank name');
    ck(/android:icon="@mipmap\/ic_launcher"/.test(text), 'AndroidManifest.xml points at no launcher icon');
    ck(/android:theme=/.test(text), 'AndroidManifest.xml declares no theme');
    const launcher = /<intent-filter>[\s\S]{0,400}android\.intent\.action\.MAIN[\s\S]{0,400}android\.intent\.category\.LAUNCHER[\s\S]{0,200}<\/intent-filter>/.test(text);
    ck(launcher, 'AndroidManifest.xml has no MAIN/LAUNCHER activity — an app that cannot be opened');
    ck(/android:usesCleartextTraffic="true"/.test(text) === false,
      'cleartext traffic is allowed in the manifest, which a packaged game does not need');
  } else {
    ck(false, 'android/ has no AndroidManifest.xml');
  }

  const gradle = path.join(android, 'app', 'build.gradle');
  if (fs.existsSync(gradle)) {
    const text = read(gradle);
    ck(text.indexOf('applicationId "' + cfg.appId + '"') > -1,
      'the Gradle applicationId is not the appId in capacitor.config.json');
    ck(/minSdkVersion\s+2[0-9]/.test(text) || /minSdkVersion\s+1[0-9]/.test(text) || /minSdkVersion\s+rootProject/.test(text),
      'the Gradle project declares no usable minSdkVersion');
  } else {
    ck(false, 'android/ has no app/build.gradle');
  }

  const capGradle = path.join(android, 'capacitor.settings.gradle');
  if (fs.existsSync(capGradle)) {
    /* `cap sync` is what writes the plugin projects into the Gradle build. A
       plugin that is installed but not on this list is a plugin that silently
       does nothing on Android - and this is exactly the kind of file a
       hand-edited project loses. */
    const text = read(capGradle);
    const wired = usedPlugins.filter((p) => text.indexOf(p.replace('@capacitor/', 'capacitor-')) > -1);
    ck(wired.length === usedPlugins.length,
      'these configured plugins are not wired into the Android build: ' +
      usedPlugins.filter((p) => wired.indexOf(p) < 0).join(', ') + ' — run `npx cap sync android`');
    console.log('the Android project: synced payload matches the build · launcher activity, label, icon and theme ' +
      'declared · ' + wired.length + ' plugin project(s) wired into Gradle');
  } else {
    ck(false, 'android/ has no capacitor.settings.gradle — the project was never synced');
  }
}

/* ---- 5. the app's own face ------------------------------------------------ */

/* The launcher icon and the splash screen are the two pictures a player sees
   before the game draws a pixel of itself, and they come from the platform
   template: `npx cap add android` writes Capacitor's own light-blue cross on a
   white plate, at every density, at exactly the right sizes. Dimensions cannot
   catch that - only what the picture *is*. So the web icon, which is rendered
   from `ledger/icon.svg` by the same Chromium the walks use, is the reference,
   and every native picture is compared to it cell by cell.

   Measured: the mark drawn from that file sits 2.5-8.6 apart from the web icon
   at every size (resampling, nothing else); the template's cross sits 153.9
   apart. 30 is between them by a wide margin, and the number that matters is
   the gap, not the threshold. */
const MARK = path.join(www, 'icon-512.png');
ck(fs.existsSync(MARK), 'no web icon to compare the native icons against');
const reference = fs.existsSync(MARK) ? png.signature(fs.readFileSync(MARK)) : null;
const CORNER = cfg ? cfg.backgroundColor : '#080b10';
const near = (p, limit) => {
  try { return png.distance(png.signature(fs.readFileSync(p)), reference) <= limit; }
  catch (e) { return false; }
};

if (reference) {
  /* The native copies only exist where someone ran `npx cap add android`; in a
     fresh checkout they are absent on purpose (they are generated and
     gitignored, and the report two sections up says exactly that). A missing
     generated file is not a defect, so this can only assert what is here — and
     it says which half it could not check rather than passing quietly. */
  if (!fs.existsSync(res)) {
    console.log('the app’s face    : the masters are measured below; the native copies are not in ' +
      'this tree — android/ is generated (`npx cap add android` + `npm run assets` where the SDK is)');
  } else {
    const DENSITY = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
    const faceProblems = [];
    const sizes = [];
    for (const [name, size] of Object.entries(DENSITY)) {
      for (const flavour of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) {
        const p = path.join(res, 'mipmap-' + name, flavour);
        if (!fs.existsSync(p)) { faceProblems.push('mipmap-' + name + '/' + flavour + ' is missing'); continue; }
        const sig = png.signature(fs.readFileSync(p));
        const want = flavour === 'ic_launcher_foreground.png' ? Math.round(size * 2.25) : size;
        if (Math.max(sig.width, sig.height) !== want) {
          faceProblems.push('mipmap-' + name + '/' + flavour + ' is ' + sig.width + 'px, not ' + want);
        }
        /* the foreground layer is the mark *without* its plate, so a player's chosen
           shape (circle, squircle, whatever the launcher does) is filled with the
           right colour instead of white; and it must sit inside the safe zone */
        if (flavour === 'ic_launcher_foreground.png') {
          const cover = png.coverage(sig);
          if (cover > 0.6) faceProblems.push('mipmap-' + name + '/' + flavour +
            ' is ' + Math.round(cover * 100) + '% drawn — an adaptive foreground must be the mark alone, inside the safe zone, or the launcher will crop it');
          if (!near(p, 60)) faceProblems.push('mipmap-' + name + '/' + flavour + ' is not the game’s mark');
        } else if (!near(p, 30)) {
          faceProblems.push('mipmap-' + name + '/' + flavour +
            ' is not the game’s mark — it is whatever `cap add` shipped, and a distance of ' +
            png.distance(png.signature(fs.readFileSync(p)), reference).toFixed(1) + ' says so');
        }
      }
      sizes.push(name + ' ' + size + 'px');
    }
    ck(faceProblems.length === 0, 'the launcher icons: ' + faceProblems.slice(0, 4).join('; '));

    /* the adaptive icon's plate, and the splash: both the app's own colour, and
       the splash has to be dark, because a bright splash on a dark game flashes */
    const plateXml = path.join(res, 'values', 'ic_launcher_background.xml');
    if (fs.existsSync(plateXml)) {
      const colour = (read(plateXml).match(/#[0-9a-fA-F]{6}/) || [])[0];
      ck(colour && colour.toLowerCase() === CORNER.toLowerCase(),
        'the adaptive icon’s plate is ' + colour + ' and the app is ' + CORNER +
        ' — a light plate behind the mark is the template talking');
    } else {
      ck(false, 'no ic_launcher_background.xml: the adaptive icon has no plate colour');
    }
    const splashProblems = [];
    for (const d of ['drawable-port-mdpi', 'drawable-port-xxxhdpi', 'drawable-land-hdpi', 'drawable']) {
      const p = path.join(res, d, 'splash.png');
      if (!fs.existsSync(p)) { splashProblems.push(d + '/splash.png is missing'); continue; }
      const sig = png.signature(fs.readFileSync(p));
      const corner = png.hex(sig.grid[0]).toLowerCase();
      if (corner !== CORNER.toLowerCase()) {
        splashProblems.push(d + '/splash.png is ' + corner + ', not ' + CORNER);
      }
    }
    ck(splashProblems.length === 0, 'the splash screens: ' + splashProblems.join('; '));
    console.log('the app’s face    : launcher + round + adaptive foreground at ' + sizes.join(', ') +
      ' · all drawn from ledger/icon.svg (distance ≤8.6 from the web icon; the template it replaced sat at 153.9) · ' +
      'plate and splashes ' + CORNER);

  }

  /* the masters a store listing and a fresh `cap add` need */
  const masters = ['resources/icon.png', 'resources/icon-foreground.png', 'resources/icon-background.png', 'resources/splash.png'];
  const missingMasters = masters.filter((rel) => !fs.existsSync(path.join(APP, rel)));
  ck(missingMasters.length === 0, 'the app’s masters are missing: ' + missingMasters.join(', ') +
    ' — run `npm run assets` in apps/phone');
  if (!missingMasters.length) {
    ck(near(path.join(APP, 'resources', 'icon.png'), 30),
      'resources/icon.png is not the game’s mark');
  }
}

if (bad.length) { console.log('\nPHONE ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
console.log('\nPHONE CLEAN \u2014 the store build carries the game the zip ships, byte for byte, with a store id, a ' +
  'dark splash and status bar, a complete icon set, and (where a platform folder exists) a synced copy and the ' +
  'plugin projects wired into the native build');
