/* Fixtures for the test tree: real modules, a real world, real bytes.

   Three suites sit under `tests/`, and each one is a different kind of claim:

     unit/          one function, no DOM, no filesystem, no browser — fast enough
                    to run on every save
     integration/   two or more real modules together: core + ui, the host seam,
                    and the build's own contracts (the payload, the zip, the faces)
     e2e/           a player's journey in a real browser, against each of the
                    three things this repository ships

   They are not gates. A gate exists to make a specific class of drift
   impossible, and it fails by printing a sentence a maintainer can act on; these
   are ordinary tests with assertions, named so a person reading a CI run can tell
   what the game claims. The gates stay where they are, in `.harness/`.

   Everything here reads the real files. Nothing here writes to the workspace
   except `tests/artifacts/`, which is gitignored and only filled on failure.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const at = (...p) => path.join(ROOT, ...p);
const read = (...p) => fs.readFileSync(at(...p), 'utf8');
const sha = (x) => crypto.createHash('sha256').update(x).digest('hex');
const short = (x) => sha(x).slice(0, 16);

/* the DOM stub, for the units that need `document` to exist and nothing more */
function stubDOM() { require(at('.harness', 'dom.js')); }
/* the DOM stub, reversed — for the units that must prove they never touch it */
function forbidDOM() {
  const trap = (what) => new Proxy({}, { get() { throw new Error('this code read ' + what); } });
  Object.defineProperty(globalThis, 'document', { configurable: true, get: () => trap('document') });
  Object.defineProperty(globalThis, 'window', { configurable: true, get: () => trap('window') });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => trap('localStorage') });
}

const importFrom = (rel) => import('file://' + at(rel));
const core = () => importFrom(path.join('packages', 'core', 'index.js'));
const ui = () => importFrom(path.join('packages', 'ui', 'index.js'));

/* A world, seeded, played the way a player plays it: advance, then answer
   whatever the quarter put on the table. First option every time — the point is
   that two runs make the same choice, not that the choice is good. Both
   `resolveOption` and `afterThreadChoice` are core's own functions, so a test's
   choice goes through the code a tap goes through. */
function playQuarter(coreIn) {
  coreIn.advanceQuarter();
  const m = coreIn.UI.modal;
  if (m && m.type === 'event' && m.ev && m.ev.opts && m.ev.opts.length) {
    const ev = m.ev, opt = ev.opts[0];
    coreIn.resolveOption(ev, opt);
    const th = m.thread || ev.thread || null;
    if (th && (coreIn.S.threads || []).indexOf(th) >= 0) coreIn.afterThreadChoice(th, opt);
  }
  coreIn.UI.modal = null;
  return m ? m.type : null;
}
function newWorld(coreIn, { seed = 4242, quarters = 0, name = 'Ada Okonjo', city = 'lagos',
  profile = 'returnee', difficulty = 'realistic' } = {}) {
  coreIn.newGame({ name, city, profile, difficulty, seed });
  for (let q = 0; q < quarters; q++) playQuarter(coreIn);
  return coreIn;
}
const face = (coreIn) => {
  const S = coreIn.S || coreIn;
  return { turn: S.turn, seed: S.seed, nw: Math.round(coreIn.netWorth ? coreIn.netWorth() : 0), h: short(JSON.stringify(S)) };
};

/* What the host writes, and what the browser writes: the same blob. */
const saveBlob = (coreIn) => JSON.stringify({ S: coreIn.S, rs: coreIn.R.s, ui: { tab: coreIn.UI.tab } });

/* An AsyncStorage shaped like the device's: all-promises, one flat map. */
function memoStore(initial = {}) {
  const keys = Object.assign({}, initial);
  const writes = [];
  return {
    keys, writes,
    getAll: async () => Object.assign({}, keys),
    async set(k, v) { keys[k] = v; writes.push([k, v]); },
    async remove(k) { delete keys[k]; writes.push([k, null]); },
    async flush() { await new Promise((r) => setTimeout(r, 0)); },
  };
}

module.exports = { ROOT, at, read, sha, short, stubDOM, forbidDOM, core, ui, importFrom,
  playQuarter, newWorld, face, saveBlob, memoStore };
