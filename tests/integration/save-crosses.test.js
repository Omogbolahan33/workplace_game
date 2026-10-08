/* The claim Step 5 exists for: a run moves between the browser and the phone,
   and it is the same run on both sides.

   The `rn` gate proves this end to end, crossing a real save between two real
   processes. This is the same claim at the level below it — one process, both
   save paths, no browser — so that a failure says which half broke: the format
   (`{S, rs, ui}`), the keys (`ledger_v1_auto` vs `ledger.save.auto`), the
   loader, or the RNG.

   The one behaviour worth knowing before reading the assertions: **a save does
   not carry the modal.** Save with a decision on the table and the reload has
   nothing on the table. That is the game's own behaviour (it is true in the
   single file too), it does not move money, and it is recorded in FEATURES
   §22.53 as an open decision rather than fixed here.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { core, ui, stubDOM, memoStore, newWorld, playQuarter, saveBlob, short } = require('../helpers/env.js');
const { createRnHost, createStore, asyncStorageBacking } = require(
  path.join(__dirname, '..', '..', 'apps', 'mobile', 'src', 'host.js'));

/* a phone: the store, the host, core installed behind it */
async function phone() {
  const storage = (() => {
    const mem = memoStore();
    return { mem, getAllKeys: async () => Object.keys(mem.keys),
      multiGet: async (ks) => ks.map((k) => [k, mem.keys[k]]),
      setItem: async (k, v) => { mem.keys[k] = v; }, removeItem: async (k) => { delete mem.keys[k]; } };
  })();
  const C = await core();
  const backing = asyncStorageBacking(storage, 'ledger.');
  const store = createStore(backing);
  await store.hydrate();
  const host = createRnHost({ core: C, store });
  C.installHost(host);
  /* `backing` is handed out so a test can start a *second app on the same
     device* — a new store over the same bytes, which is what a cold start is */
  return { C, store, host, storage, backing };
}

test('the phone writes exactly the blob the browser writes', async () => {
  const { C, store, host } = await phone();
  newWorld(C, { seed: 4242, quarters: 5 });
  host.save('auto');
  await store.flushNow();
  const phoneBlob = store.get('save.auto');

  const browserBlob = saveBlob(C);          /* what the ui writes, from the same state */
  assert.deepEqual(JSON.parse(phoneBlob), JSON.parse(browserBlob),
    'the two runtimes disagree about the save format');
  assert.deepEqual(Object.keys(JSON.parse(phoneBlob)).sort(), ['S', 'rs', 'ui']);
  assert.equal(JSON.parse(phoneBlob).rs, C.R.s);
});

test('the phone’s device key is the browser’s key, one prefix apart', async () => {
  const { C, store, host, storage } = await phone();
  newWorld(C, { seed: 4242, quarters: 2 });
  host.save('auto');
  await store.flushNow();
  const deviceKey = Object.keys(storage.mem.keys).find((k) => /save\.auto$/.test(k));
  assert.ok(deviceKey, 'the save reached the device under some key');
  assert.equal(deviceKey, 'ledger.save.auto');
  assert.equal((await core()).SKEY + 'auto', 'ledger_v1_auto',
    'the browser stores the same slot under its own key — a crossing is a rename, not a translation');
});

test('a browser save loads on the phone, and a phone save loads in the browser', async () => {
  /* Out: the browser's localStorage holds a run; the phone is handed the bytes. */
  const { C, store, host, storage } = await phone();
  newWorld(C, { seed: 4242, quarters: 6 });
  const fromBrowser = saveBlob(C);
  storage.mem.keys['ledger.save.auto'] = fromBrowser;      /* planted, as the gate plants it */
  const store2 = createStore(asyncStorageBacking(storage, 'ledger.'));
  await store2.hydrate();
  const host2 = createRnHost({ core: C, store: store2 });
  C.installHost(host2);
  /* The live world is moved out from under the save *without saving* — which is
     what a second app on the same device looks like to the first one. Starting a
     new game would not do: core auto-saves every quarter AND on every start, so
     a new game legitimately overwrites the slot it is saving into. */
  C.S.turn = 99; C.S.fin.cash = 1; C.S.city = 'elsewhere';
  assert.equal(host2.load('auto'), true, 'the phone read the browser’s blob');
  assert.equal(JSON.stringify(C.S), JSON.stringify(JSON.parse(fromBrowser).S),
    'and the world is what the browser saved');
  assert.equal(C.S.turn, JSON.parse(fromBrowser).S.turn);

  /* Back: the phone's blob, read by the browser's own loader in this process. */
  stubDOM();
  const U = await ui();
  U.install();
  globalThis.localStorage.setItem('ledger_v1_auto', fromBrowser);
  U.boot();                                   /* the reload path, for real */
  assert.equal(JSON.stringify(C.S), JSON.stringify(JSON.parse(fromBrowser).S),
    'the browser’s boot read the same blob to the same world');
});

test('a run played on one runtime and continued on the other stays the same run', async () => {
  /* Two quarters in the browser, handed to the phone, two more quarters there —
     compared against the same four quarters played straight through. This is the
     claim that makes "play on your laptop, finish on the train" true. */
  const { C, store, host, storage } = await phone();
  newWorld(C, { seed: 4242, quarters: 3 });
  const atFork = JSON.stringify(C.S);

  /* browser: two quarters, saved */
  for (let i = 0; i < 2; i++) playQuarter(C);
  const afterBrowser = JSON.stringify(C.S);
  storage.mem.keys['ledger.save.auto'] = saveBlob(C);

  /* phone: load, two more */
  const store2 = createStore(asyncStorageBacking(storage, 'ledger.'));
  await store2.hydrate();
  const host2 = createRnHost({ core: C, store: store2 });
  C.installHost(host2);
  C.S.turn = 99; C.S.fin.cash = 1;
  assert.equal(host2.load('auto'), true);
  assert.equal(JSON.stringify(C.S), afterBrowser, 'the phone continued from where the browser stopped');
  for (let i = 0; i < 2; i++) playQuarter(C);
  const end = { turn: C.S.turn, cash: Math.round(C.S.fin.cash), nw: Math.round(C.netWorth()) };

  /* and the same run, unbroken, in one runtime */
  newWorld(C, { seed: 4242, quarters: 3 + 4 });
  const straight = { turn: C.S.turn, cash: Math.round(C.S.fin.cash), nw: Math.round(C.netWorth()) };
  assert.deepEqual(end, straight,
    'four quarters across two runtimes is not the same run as four quarters in one: ' +
    JSON.stringify(end) + ' vs ' + JSON.stringify(straight));
  assert.ok(atFork.length > 0);
});

test('the modal is the one thing a save does not carry', async () => {
  /* Documented behaviour, asserted so that a future change to it is a decision
     rather than a surprise: the save is the game, not the decision on top of it. */
  const { C, store, host, backing } = await phone();
  newWorld(C, { seed: 4242, quarters: 0 });
  let sawModal = false;
  for (let q = 0; q < 8 && !sawModal; q++) {
    C.advanceQuarter();
    if (C.UI.modal) { sawModal = true; host.save('auto'); }
  }
  assert.ok(sawModal, 'eight quarters should raise at least one decision');
  await store.flushNow();
  const blob = JSON.parse(store.get('save.auto'));
  assert.equal(blob.ui.modal, undefined, 'the save carries the tab and nothing about what is on screen');
  assert.equal(Object.keys(blob.ui).join(','), 'tab');

  const store2 = createStore(backing);        /* a fresh app over the same device */
  await store2.hydrate();
  const host2 = createRnHost({ core: C, store: store2 });
  C.installHost(host2);
  assert.equal(host2.load('auto'), true, 'a cold start reads the save the previous one wrote');
  assert.equal(C.UI.modal, null, 'and a load really does open with nothing pending');
});

test('a quarter is a quarter: the same seed in both runtimes is the same money', async () => {
  const { C } = await phone();
  const money = (seed) => {
    newWorld(C, { seed, quarters: 0 });
    for (let i = 0; i < 8; i++) playQuarter(C);
    return Math.round(C.netWorth());
  };
  assert.equal(money(4242), money(4242), 'the same seed twice is the same run');
  assert.notEqual(money(4242), money(4243), 'a different seed is a different run');
  assert.equal(short(JSON.stringify([money(4242), money(4243)])).length, 16);
});
