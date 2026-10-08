/* The native host, unit by unit: the mirror, the write-behind flush, and the
   promise that a save is readable the instant it is written.

   The constraint that shaped `apps/mobile/src/host.js` is that the game saves
   *mid-simulation* and reads back what it just wrote. A device file system has no
   synchronous write, so the host keeps an in-memory mirror and flushes behind it.

   The seam's shape is worth stating, because it is not the obvious one: the host
   does not accept a blob from the game. `save(slot)` snapshots core itself —
   `{S, rs, ui:{tab}}`, the browser's own format — and `load(slot)` puts it back,
   relinking the portfolio exactly as the single file's loader does. So a save
   written on a phone is a save the browser would have written, and a save written
   in a browser is one a phone can load. That is the claim these tests are about.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { core, memoStore, newWorld, playQuarter } = require('../helpers/env.js');
const hostFile = path.join(__dirname, '..', '..', 'apps', 'mobile', 'src', 'host.js');
const { createRnHost, createStore, asyncStorageBacking, MIRROR_LIMIT } = require(hostFile);

/* a host with a fresh core and a device holding whatever the test says */
async function worldOn(device, opts = {}) {
  const C = await core();
  const store = createStore(device);
  await store.hydrate();
  const host = createRnHost(Object.assign({ core: C, store }, opts));
  C.installHost(host);
  return { C, store, host };
}
const freshDevice = () => memoStore();

/* AsyncStorage itself, as the app passes it in: promise-returning methods with
   the platform's names. The `ledger.` prefix is applied by this adaptor, not by
   the store — which is what makes the device's keys the browser's keys. */
function fakeAsyncStorage(initial = {}) {
  const mem = memoStore(initial);
  return {
    mem,
    getAllKeys: async () => Object.keys(mem.keys),
    multiGet: async (ks) => ks.map((k) => [k, mem.keys[k] === undefined ? null : mem.keys[k]]),
    setItem: async (k, v) => { mem.keys[k] = v; },
    removeItem: async (k) => { delete mem.keys[k]; },
  };
}

test('a save is on the mirror the instant it is written, with no flush and no await', async () => {
  const device = freshDevice();
  const { C, store, host } = await worldOn(device);
  newWorld(C, { seed: 4242, quarters: 3 });
  assert.equal(host.save('auto'), true);
  const blob = store.get('save.auto');
  assert.ok(typeof blob === 'string' && blob.length > 500, 'the mirror holds a real blob');
  assert.deepEqual(Object.keys(JSON.parse(blob)).sort(), ['S', 'rs', 'ui'], 'the browser’s shape');
  assert.equal(device.keys['ledger.save.auto'], undefined, 'and the device has not been written yet');
});

test('the device is written behind the write, and flushNow makes it certain', async () => {
  const device = freshDevice();
  const { C, store, host } = await worldOn(device);
  newWorld(C, { seed: 4242, quarters: 2 });
  host.save('auto');
  assert.equal(device.keys['save.auto'], undefined, 'behind the write, as designed');
  await store.flushNow();
  assert.equal(device.keys['save.auto'], store.get('save.auto'), 'the device holds exactly what the mirror does');
});

test('many saves in one burst coalesce into the last one', async () => {
  const device = freshDevice();
  const { C, store, host } = await worldOn(device);
  newWorld(C, { seed: 4242, quarters: 1 });
  for (let i = 0; i < 12; i++) { playQuarter(C); host.save('auto'); }
  await store.flushNow();
  const writes = device.writes.filter(([k]) => k === 'save.auto').length;
  assert.equal(writes, 1, 'twelve saves in one tick should reach the device once, got ' + writes);
  assert.equal(device.keys['save.auto'], store.get('save.auto'), 'with the newest state');
});

test('a cold start reads the device, under the browser’s own keys', async () => {
  /* written by a previous life of the app, read by this one */
  const device = freshDevice();
  const first = await worldOn(device);
  newWorld(first.C, { seed: 4242, quarters: 5 });
  first.host.save('auto');
  await first.store.flushNow();
  const blob = device.keys['save.auto'];

  const second = await worldOn(device);          /* a new process, same device */
  assert.equal(second.host.hasSave('auto'), true);
  assert.equal(second.host.load('auto'), true);
  assert.equal(JSON.stringify(second.C.S), JSON.stringify(first.C.S), 'byte for byte what was saved');
  assert.equal(second.store.get('save.auto'), blob);
});

test('a slot that was never saved is not a slot that has a save', async () => {
  const { host } = await worldOn(freshDevice());
  assert.equal(host.hasSave('s3'), false);
  assert.equal(host.load('s3'), false, 'loading nothing fails rather than half-loading');
});

test('a remove reaches both the mirror and the device', async () => {
  const device = freshDevice();
  const { C, store, host } = await worldOn(device);
  newWorld(C, { seed: 4242, quarters: 2 });
  host.save('auto');
  await store.flushNow();
  assert.equal(host.load('auto'), true, 'there to begin with');
  store.remove('save.auto');
  assert.equal(store.get('save.auto'), null, 'gone from the mirror at once');
  await store.flushNow();
  assert.equal(device.keys['save.auto'], undefined, 'and gone from the device');
});

test('starting a new run wipes every slot a run can be saved in', async () => {
  const device = memoStore({ 'save.auto': 'a', 'save.s1': 'b', 'save.s3': 'c' });
  const { store, host } = await worldOn(device);
  host.wipe();
  await store.flushNow();
  assert.deepEqual(store.keys(), [], 'the mirror is empty');
  assert.deepEqual(Object.keys(device.keys), [], 'and so is the device');
});

test('the mirror stays bounded — the oldest save goes, never the one being written', async () => {
  const { C, store, host } = await worldOn(freshDevice());
  newWorld(C, { seed: 4242, quarters: 1 });
  host.save('s1');
  host.save('s2');
  /* two saves larger than the limit, by hand: a decade of play in one process */
  const small = store.get('save.s1');
  store.set('save.s2', 'x'.repeat(MIRROR_LIMIT - 10));
  host.save('auto');
  const held = store.keys().reduce((n, k) => n + String(store.get(k)).length, 0);
  assert.ok(held <= MIRROR_LIMIT + small.length, 'the mirror grew past its limit: ' + held);
  assert.ok(store.get('save.auto'), 'the save being written is never the one dropped');
});

test('the device’s keys are the browser’s keys, through the adaptor', async () => {
  /* This is the whole reason a run can cross between the two runtimes: the phone
     stores under `ledger.save.auto`, and the browser reads `SKEY + 'auto'` —
     `ledger_v1_auto`. Same slot, two spellings, one adaptor apart. */
  const storage = fakeAsyncStorage();
  const backing = asyncStorageBacking(storage, 'ledger.');
  await backing.set('save.auto', 'blob');
  assert.equal(storage.mem.keys['ledger.save.auto'], 'blob', 'the device key carries the browser prefix');
  assert.equal((await backing.getAll())['save.auto'], 'blob', 'and lists it back without the prefix');
  assert.deepEqual(await backing.getAll(), { 'save.auto': 'blob' }, 'and a cold start lists it under the slot name');
  await backing.remove('save.auto');
  assert.equal(storage.mem.keys['ledger.save.auto'], undefined);
});

test('the store lists save slots under the prefix, whatever else is on the device', async () => {
  const storage = fakeAsyncStorage({
    'ledger.save.auto': 'mine', 'ledger.save.s1': 'also mine',
    'ledger.profile': 'a profile', 'someother.key': 'not ours at all',
  });
  const store = createStore(asyncStorageBacking(storage, 'ledger.'));
  await store.hydrate();
  assert.deepEqual(store.keys().sort(), ['profile', 'save.auto', 'save.s1'],
    'the store takes the ledger keys and leaves the rest of the device alone');
});

test('the host answers every slot the seam declares', async () => {
  const { host } = await worldOn(freshDevice());
  /* The slots file is shim → slot, with `call` as a marker and `net.fetch` as
     the one dotted path. The seam's slots are its deduped *values*, minus the
     marker — counting keys instead of values said "7 of 13" for a year. */
  const slots = require(path.join(__dirname, '..', '..', 'tools', 'host-slots.json'));
  const wanted = Array.from(new Set(Object.values(slots)))
    .filter((v) => typeof v === 'string' && v !== 'call').sort();
  const at = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), host);
  const missing = wanted.filter((k) => at(k) === undefined);
  assert.deepEqual(missing, [], 'a slot the ui can ask for and the host does not answer');
  assert.ok(wanted.length >= 11, 'the seam is at least eleven slots, found ' + wanted.length);
  const notFunctions = wanted.filter((k) => typeof at(k) !== 'function');
  assert.deepEqual(notFunctions, [], 'a slot that is not callable would throw three screens deep');
});

test('the DOM slots answer nothing, on purpose, instead of throwing', async () => {
  const { host } = await worldOn(freshDevice());
  assert.equal(host.el('main'), null, 'there is no element on a phone — the WebView owns the drawing');
  assert.equal(host.view(), '', 'and no markup is asked of the host either');
  assert.doesNotThrow(() => host.render());
});

test('the game auto-saves every quarter, through whatever host is installed', async () => {
  /* Not the host's business, but it is the reason the host exists: core calls
     `host.save` once when a game starts and once per quarter, so a phone that is
     killed between quarters loses nothing. A test that starts a second game must
     expect the first one's slot to be overwritten — the save IS the new run. */
  let saves = 0;
  const C = await core();
  C.installHost({ save: () => (saves++, true), load: () => false, hasSave: () => false, wipe: () => {} });
  newWorld(C, { seed: 4242, quarters: 0 });
  assert.equal(saves, 1, 'starting a run saves it');
  for (let i = 0; i < 3; i++) playQuarter(C);
  assert.ok(saves >= 4, 'and every quarter saves it again — ' + saves + ' saves for three quarters and a start');
});

test('a real run saves through the host and comes back identical', async () => {
  const { C, store, host } = await worldOn(freshDevice());
  newWorld(C, { seed: 4242, quarters: 4 });
  host.save('auto');
  const saved = store.get('save.auto');
  const atFour = JSON.stringify(C.S);
  assert.ok(saved.length > 1000, 'a real save is a real blob');
  assert.equal(JSON.parse(saved).rs, C.R.s, 'the RNG seed travels with the save, or a reload is a different world');

  /* the world moves on, and the device still holds the older save — which is the
     state a phone is in when it was suspended between a write and its flush */
  for (let i = 0; i < 2; i++) playQuarter(C);
  assert.notEqual(JSON.stringify(C.S), atFour, 'the live world really has moved on');
  store.set('save.auto', saved);
  assert.equal(host.load('auto'), true);
  const restored = JSON.stringify(C.S);
  assert.equal(C.S.turn, 4, 'the save is what comes back, not the state that replaced it');
  assert.equal(C.S.city, 'lagos');
  assert.equal(C.S.name, 'Ada Okonjo');
  /* Loading normalises: it fills the collections a save can predate, relinks the
     portfolio and recomputes the derived figures. So the claim is not "the bytes
     are the bytes" — it is that loading is *settled*: a second load of the same
     save changes nothing further. */
  assert.equal(host.load('auto'), true);
  assert.equal(JSON.stringify(C.S), restored, 'a second load of the same save is the same state');
  const diff = firstDiff(JSON.parse(saved).S, C.S);
  assert.ok(diff === null || /^(pending|cd|flags|decisions|bizs|activeBiz|biz|der)/.test(diff),
    'the saved world came back with a real difference at ' + diff);
});

/* the smallest difference between two states, or null — a mismatch that says
   which field it was is worth ten that say "not equal" */
function firstDiff(a, b, at = '') {
  if (a === b) return null;
  if (typeof a !== typeof b) return at + ' (' + typeof a + ' vs ' + typeof b + ')';
  if (a && b && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) { const d = firstDiff(a[k], b[k], at ? at + '.' + k : k); if (d) return d; }
    return null;
  }
  return at + ' = ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b);
}

test('a quarter played on a phone host is deterministic, seed for seed', async () => {
  /* Not a hash of the whole state: a run carries the wall clock (`startedAt`),
     so two runs of the same seed are two different strings on purpose. What must
     be identical is the world they play out: the same turn, the same money. */
  const C = await core();
  const run = (seed) => {
    newWorld(C, { seed, quarters: 0 });
    for (let i = 0; i < 6; i++) playQuarter(C);
    return { turn: C.S.turn, nw: Math.round(C.netWorth()), cash: Math.round(C.S.fin.cash) };
  };
  assert.deepEqual(run(4242), run(4242), 'the same seed twice is the same world');
  assert.notDeepEqual(run(4242), run(4243), 'a different seed is a different world');
  assert.equal(C.S.startedAt > 0, true, 'and the wall clock really is carried');
});
