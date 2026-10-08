/* The browser side of the e2e suite: a static server, a page, and the two things
   that make a failing browser test worth reading.

   Two lessons from the gates are built in rather than re-learned:

     1. **A leaked server makes the next run lie.** `stop()` kills the process
        *group*, because a killed wrapper leaves its child listening.
     2. **A screenshot on failure is the whole diagnosis.** When a test fails, the
        page is written to `tests/artifacts/` with a trace; on success nothing is
        written at all.

   `serve()` is deliberately the same shape as the gates': absolute paths only,
   `/` → index.html, real MIME types, 404 for anything that escapes the root.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACTS = path.join(ROOT, 'tests', 'artifacts');

/* Launching Chromium, with a failure that names the actual problem.

   Playwright reports a browser that cannot start because a *shared library* is
   missing as "Target page, context or browser has been closed" — which reads like
   a concurrency bug and is a container missing `libnspr4`. The libraries live
   outside the workspace, so a fresh sandbox always loses them (MIGRATION's *Fresh
   checkout* lists them). This finds the missing ones and says so. */
let missingLibs = null;
function browserLibraries() {
  if (missingLibs !== null) return missingLibs;
  try {
    const bin = require('fs').readdirSync(require('os').homedir() + '/.cache/ms-playwright')
      .filter((d) => /^chromium(-\d+)?$/.test(d)).sort().pop();
    const dir = require('os').homedir() + '/.cache/ms-playwright/' + bin;
    const exe = require('path').join(dir, require('fs').readdirSync(dir)
      .find((d) => d.startsWith('chrome-linux')) || '', 'chrome');
    const out = require('child_process').execFileSync('ldd', [exe], { encoding: 'utf8' });
    missingLibs = out.split('\n').filter((l) => /not found/.test(l)).map((l) => l.trim().split(' ')[0]);
  } catch (e) { missingLibs = []; }
  return missingLibs;
}

async function launch() {
  const { chromium } = require(path.join(ROOT, '.harness', 'node_modules', 'playwright'));
  try {
    return await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  } catch (e) {
    const libs = browserLibraries();
    const hint = libs.length
      ? '\n  chromium cannot start: ' + libs.length + ' shared librar' + (libs.length === 1 ? 'y is' : 'ies are') +
        ' missing (' + libs.slice(0, 5).join(', ') + '). Install them:\n' +
        '  sudo apt-get install -y libnspr4 libnss3 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \\\n' +
        '    libcups2t64 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2'
      : '\n  chromium cannot start here — see MIGRATION.md, *Running this in a fresh sandbox*';
    throw new Error(String(e.message).split('\n')[0] + hint);
  }
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json',
  '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
};

function serve(dir, { spa = false } = {}) {
  const root = path.resolve(dir);
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(root, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end('no'); }
    if (spa && !fs.existsSync(file)) file = path.join(root, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => {
    r({ url: 'http://127.0.0.1:' + srv.address().port + '/', close: () => new Promise((d) => srv.close(d)) });
  }));
}

/* The Next app, built and started the way `next start` runs it. The build is
   shared with the `appshell` gate (`.next/gate`) and is reused when it is newer
   than every source file, so the suite does not build the app twice in one run. */
function nextApp({ distDir = '.next/gate', rebuild = false } = {}) {
  const APP = path.join(ROOT, 'apps', 'web');
  const DIST = path.join(APP, distDir);
  const sources = () => {
    const out = [];
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      if (/^(node_modules|\.next|\.next-gate)$/.test(e.name)) return;
      const p = path.join(d, e.name);
      e.isDirectory() ? walk(p) : /\.(js|jsx|mjs|css|json)$/.test(e.name) && out.push(p);
    });
    walk(APP);
    return out;
  };
  const fresh = () => {
    const stamp = path.join(DIST, 'BUILD_ID');
    if (!fs.existsSync(stamp)) return false;
    const t = fs.statSync(stamp).mtimeMs;
    return Math.min(...sources().map((f) => fs.statSync(f).mtimeMs)) < t;
  };
  let proc = null;
  return {
    dist: DIST,
    fresh,
    build() {
      if (!rebuild && fresh()) return false;
      execFileSync('npx', ['next', 'build'], {
        cwd: APP, stdio: 'pipe', timeout: 600000,
        env: Object.assign({}, process.env, { LEDGER_DIST_DIR: distDir }),
      });
      return true;
    },
    async start() {
      const port = await new Promise((r) => {          /* a port the kernel gives us */
        const s = require('net').createServer(); s.listen(0, '127.0.0.1', () => {
          const p = s.address().port; s.close(() => r(p));
        });
      });
      proc = spawn('npx', ['next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
        cwd: APP, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
        env: Object.assign({}, process.env, { LEDGER_DIST_DIR: distDir }),
      });
      let log = '';
      proc.stdout.on('data', (d) => { log += d; }); proc.stderr.on('data', (d) => { log += d; });
      const url = 'http://127.0.0.1:' + port + '/';
      for (let i = 0; i < 60; i++) {
        try {
          const res = await fetch(url);
          if (res.ok) return { url, log: () => log };
        } catch (e) { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 500));
      }
      this.stop();
      throw new Error('the app never answered on ' + url + '\n' + log.slice(-600));
    },
    stop() {
      if (!proc) return;
      try { process.kill(-proc.pid, 'SIGKILL'); } catch (e) { try { proc.kill('SIGKILL'); } catch (e2) {} }
      proc = null;
    },
  };
}

/* A page with the console watched and the failure evidence wired up. */
async function page(browser, { name, viewport = { width: 390, height: 844 } } = {}) {
  const p = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().replace(/\s+/g, ' ').trim().slice(0, 200)); });
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.errors = errors;
  return p;
}

/* Written only when something failed: the picture, the console, and the state. */
async function evidence(p, name, extra = {}) {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const shot = path.join(ARTIFACTS, name + '.png');
  try { await p.screenshot({ path: shot, fullPage: false }); } catch (e) {}
  fs.writeFileSync(path.join(ARTIFACTS, name + '.json'), JSON.stringify({
    url: p.url(), errors: p.errors || [], ...extra,
  }, null, 1));
  return shot;
}

/* Begin a run the way a player does. The start screen is three steps — a name
   and a city, who you are, then the rules and the button that starts the game —
   and the walk lives here rather than in three test files, because a walk
   written out three times is three places to fix the next time a step is added. */
async function beginRun(p, { name = 'Ada Okonjo', wait = 900 } = {}) {
  await p.evaluate((who) => {
    const next = () => { const b = document.querySelector('[data-a="stepnext"]'); if (b) b.click(); };
    const n = document.getElementById('inName');
    if (n) { n.value = who; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const city = document.querySelector('[data-a="pickcity"]'); if (city) city.click();
    next();                                    /* step 2: who you are */
    const prof = document.querySelector('[name="prof"]') || document.querySelector('#modalHost input[type=radio]');
    if (prof) prof.click();
    next();                                    /* step 3: the rules */
    const diff = Array.from(document.querySelectorAll('[data-a="pickdiff"]')).find((x) => !x.disabled);
    if (diff) diff.click();
    const go = document.querySelector('[data-a="startgame"]'); if (go) go.click();
  }, name);
  await p.waitForTimeout(wait);
  return p.evaluate(() => ({
    tabs: Array.from(document.querySelectorAll('[data-a="tab"]')).map((n) => n.textContent.trim()),
    page: String((document.getElementById('main') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
  }));
}

/* What greets a player on a cold start: step one of the start screen, with the
   rail that says how many steps there are. */
const startScreen = (p) => p.evaluate(() => {
  const host = document.querySelector('#modalHost');
  if (!host) return null;
  return { steps: host.querySelectorAll('[data-a="step"]').length,
           name: !!host.querySelector('#inName'),
           next: !!host.querySelector('[data-a="stepnext"]') };
});

module.exports = { serve, nextApp, page, evidence, launch, ARTIFACTS, ROOT, beginRun, startScreen };
