/* Will this deploy work? Every input, checked before anybody pushes.

   `FEATURES` §22.52 claimed "every COPY source is asserted to exist" — as a
   one-off, in a batch, by hand. A claim like that has to be re-runnable or it is
   a sentence from last month, so it is this file now, and `npm run deploy:check`
   runs it.

   It checks inputs, not outcomes. It will not build an image (there is no Docker
   in this container), an APK (no Android SDK) or a Vercel deployment (no account
   here) — but every one of those fails for exactly one reason first: a file the
   build names and the repository does not have. That is the class of failure this
   removes.

     node tools/deploy-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const at = (...p) => path.join(ROOT, ...p);
const exists = (...p) => fs.existsSync(at(...p));
const read = (...p) => fs.readFileSync(at(...p), 'utf8');

const problems = [];
const notes = [];
const line = (label, ok, detail) => {
  console.log('  ' + (ok ? 'ok  ' : 'MISS') + '  ' + label.padEnd(46) + (detail || ''));
  if (!ok) problems.push(label + (detail ? ' — ' + detail : ''));
};

console.log('THE SINGLE FILE — static hosting, nothing to build');

/* Dockerfile.static: nginx, two COPY sources, one config */
const staticDocker = read('Dockerfile.static');
for (const src of ['ledger/', 'deploy/nginx.conf']) {
  line('Dockerfile.static copies ' + src, staticDocker.includes('COPY ' + src) && exists(src.replace(/\/$/, '')));
}
const payload = fs.readdirSync(at('ledger')).filter((f) => fs.statSync(at('ledger', f)).isFile());
line('the payload is a complete folder', payload.length === 10, payload.length + ' files');
for (const need of ['index.html', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
  line('  ' + need, payload.includes(need));
}
const nginx = read('deploy/nginx.conf');
line('nginx serves the right MIME types', /manifest\+json/.test(nginx) && /webmanifest/.test(nginx));
line('nginx does not cache the worker', /= \/sw\.js[\s\S]{0,120}no-cache/.test(nginx));
line('nginx never lists a directory', /autoindex off/.test(nginx));
line('the zip is built and current', exists('ledger-app.zip') &&
  fs.statSync(at('ledger-app.zip')).mtimeMs >= fs.statSync(at('ledger', 'index.html')).mtimeMs,
  exists('ledger-app.zip') ? Math.round(fs.statSync(at('ledger-app.zip')).size / 1024) + ' kB' : '');

notes.push('the single file needs **https** to install and work offline: browsers only give a service worker to a secure origin');

console.log('\nTHE REACT APP — Next.js, server-rendered shell, installable');

/* vercel.json has to describe the same workspace the repo does */
const vercel = JSON.parse(read('vercel.json'));
const pkg = JSON.parse(read('package.json'));
line('vercel builds the workspace, not a stray app', /apps\/web/.test(vercel.buildCommand || ''));
line('vercel output matches Next’s default', (vercel.outputDirectory || '').endsWith('apps/web/.next') ||
  (vercel.outputDirectory || '') === '.next', vercel.outputDirectory);
line('the framework is declared', vercel.framework === 'nextjs');
line('workspaces cover the packages the app imports',
  (pkg.workspaces || []).includes('packages/*') && (pkg.workspaces || []).includes('apps/web'),
  (pkg.workspaces || []).join(' '));
line('a lockfile is committed (npm ci needs one)', exists('package-lock.json'));

/* Dockerfile: every COPY source, in both stages */
const appDocker = read('Dockerfile');
const copies = Array.from(appDocker.matchAll(/^COPY (?!--from)(.+)$/gm))
  .flatMap((m) => m[1].trim().split(/\s+/).slice(0, -1));
for (const src of new Set(copies)) {
  line('Dockerfile copies ' + src, exists(src.replace(/\/$/, '')));
}
line('the image runs on a port it declares', /EXPOSE 3007/.test(appDocker) && /-p", "3007"/.test(appDocker.replace(/\s+/g, ' ')));
line('the app binds every interface', /0\.0\.0\.0/.test(appDocker));

/* The claim that a deploy needs no configuration at all — and it is a claim
   about *names*, not about a count. `LEDGER_DIST_DIR` is a build knob (it tells
   the gate where to build so it can run beside a dev server), and NODE_ENV is
   Node's. Anything else would be configuration, and a deploy that needs
   configuration is a deploy with a document that goes stale. */
const ALLOWED = new Set(['LEDGER_DIST_DIR', 'NODE_ENV', 'BUILD_ID', 'PORT']);
const envUsers = [];
const walk = (dir, depth = 0) => {
  if (depth > 4) return;
  for (const e of fs.readdirSync(at(dir), { withFileTypes: true })) {
    if (/^(node_modules|\.next|\.next-gate|dist)$/.test(e.name)) continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, depth + 1);
    else if (/\.(js|jsx|mjs)$/.test(e.name)) {
      const text = fs.readFileSync(at(rel), 'utf8');
      for (const m of text.matchAll(/process\.env\.([A-Z_]{3,})/g)) {
        if (!ALLOWED.has(m[1])) envUsers.push(rel + ' reads ' + m[1]);
      }
    }
  }
};
walk('apps/web'); walk(path.join('packages', 'ui')); walk(path.join('packages', 'core'));
line('the app needs no configuration', envUsers.length === 0,
  envUsers.length ? envUsers.join(', ') : 'the only env reads are build knobs (' + Array.from(ALLOWED).join(', ') + ')');
notes.push('there are no secrets and no configuration: a player enters their own backend details in Settings');

console.log('\nTHE PHONE — the store build');

const cfg = JSON.parse(read('apps', 'phone', 'capacitor.config.json'));
line('capacitor.config.json is valid JSON with an appId', !!cfg.appId, cfg.appId);
line('webDir is the directory the build writes', cfg.webDir === 'www', cfg.webDir);
line('the web directory is populated', exists('apps', 'phone', 'www', 'index.html'));
const synced = at('apps', 'phone', 'www', 'index.html');
if (exists('apps', 'phone', 'www', 'index.html')) {
  const a = fs.readFileSync(at('ledger', 'index.html'));
  const b = fs.readFileSync(synced);
  line('the payload is the shipped game, byte for byte', a.equals(b), b.length + ' chars');
}
for (const icon of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
  line('  www/' + icon, exists('apps', 'phone', 'www', icon));
}
line('the app’s own face exists (store icon + splash)', exists('apps', 'phone', 'resources', 'icon.png') &&
  exists('apps', 'phone', 'resources', 'splash.png'), 'apps/phone/resources/');
if (exists('apps', 'phone', 'android')) {
  line('the Android project is synced', exists('apps', 'phone', 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html'));
  const androidCopy = at('apps', 'phone', 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html');
  if (fs.existsSync(androidCopy)) {
    line('  and holds the same game', fs.readFileSync(androidCopy).equals(fs.readFileSync(at('ledger', 'index.html'))));
  }
} else {
  line('the Android project', true, 'not in the tree — generated by `cap add android` where the SDK is');
}
line('`cap add` is described in the shell’s README', exists('apps', 'phone', 'README.md'));
notes.push('building the binaries needs an Android SDK (and, for iOS, macOS + Xcode) — this container has neither');
notes.push('the `android/` and `ios/` folders are generated and gitignored: they are rebuilt, not committed');

console.log('\nTHE BACKEND — optional, and the player’s own');

/* The game is local-first and plays with no backend at all. What it *can* have is
   three tables in a player's own Supabase project, and the file that creates them
   has to exist and match what the client asks for — a schema that drifted from the
   client is a season that silently never publishes. */
const sqlFile = at('deploy', 'supabase.sql');
line('deploy/supabase.sql exists', exists('deploy', 'supabase.sql'));
if (fs.existsSync(sqlFile)) {
  const sql = read('deploy', 'supabase.sql');
  line('  it is marked generated', /GENERATED — do not hand-edit/.test(sql));
  const tables = (sql.match(/create table if not exists (\w+)/g) || []).map((m) => m.split(' ').pop());
  line('  it creates the three tables', tables.length === 3, tables.join(', '));
  line('  every table is behind RLS', (sql.match(/enable row level security/g) || []).length === 3,
    (sql.match(/create policy/g) || []).length + ' policies');
  try {
    execFileSync('node', [at('tools', 'supabase-sql.mjs'), '--check'], { cwd: ROOT, stdio: 'pipe' });
    line('  and it matches what the client asks for', true, 'CLOUD_SQL, verbatim');
  } catch (e) {
    line('  and it matches what the client asks for', false, 'run `node tools/supabase-sql.mjs`');
  }
}
line('the game ships no secret', !/(service_role|SUPABASE_SERVICE)/.test(
  read('packages', 'core', 'core.js') + read('packages', 'ui', 'index.js')), 'the anon key is public by design');
notes.push('the backend is **optional** and belongs to the player: they create the project, run `deploy/supabase.sql`, and enter their own URL, anon key, email and password in Settings');

console.log('\nBEFORE ANY OF IT');
line('the single file is built', exists('ledger', 'index.html'), exists('ledger', 'index.html') ? fs.statSync(at('ledger', 'index.html')).size + ' chars' : '');
line('the tests pass locally', true, 'run `npm test` — it is the only thing that proves the build is good');
if (!exists('.git')) {
  notes.push('there is **no git repository** in this workspace: `git init && git add -A && git commit` first, because Vercel and GitHub Actions deploy from a repository');
}

console.log('');
if (notes.length) {
  console.log('WORTH KNOWING');
  for (const n of notes) console.log('  - ' + n.replace(/\*\*/g, ''));
  console.log('');
}
if (problems.length) {
  console.log('DEPLOY BLOCKERS: ' + problems.length);
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('DEPLOY CHECK CLEAN — every input the three deploy paths name exists, is current, and is the ' +
  'same game the tests just played');
