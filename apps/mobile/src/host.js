/* The host seam, answered by a phone.

   packages/core asks the outside world for exactly eleven things (see
   `tools/host-slots.json`) and this file answers all eleven with React Native
   APIs instead of DOM ones. Three of them need reading before the code:

   1. **`save` is synchronous, and React Native's storage is not.**
      The seam was written for a browser, where `localStorage.setItem` returns
      before the next line runs, and the game leans on that: it saves after every
      action and can read a save back in the same tick. React Native has no
      synchronous store in the box - AsyncStorage, expo-sqlite and the file
      system are all promises. So this host keeps the save in an **in-memory
      mirror that is always current** (synchronous by construction) and flushes
      it to the device behind the write, debounced. `hasSave()` answers from the
      mirror, hydrated at boot. The alternative - making the seam async - would
      have changed every call site in the simulation to satisfy one platform,
      which is the wrong direction: the seam is the contract, and a platform
      adapts to it.

   2. **The save is a format two runtimes share.**
      `packages/ui/src/01-view-working-capital.js` writes
      `{S, rs, ui:{tab}}` under `ledger_v1_<slot>`, and `load()` there normalises
      what comes back (pending/cd/flags/decisions exist, the company portfolio is
      relinked because JSON duplicated the active-business reference, the tab is
      normalised, `recompute()` runs). The phone writes the **same bytes under
      the same key**, using core's own state and core's own `setS` / `recompute`
      / `normTab` - so a player can play a quarter on a phone, open the same run
      in a browser, and pick it up. The `rn` gate plays a world on this host,
      hands the blob to the browser's loader in another process, and back.

      The normalisation therefore exists in two places (here and in the ui's
      `load`), which is a real cost, paid deliberately: folding it into core
      would have meant editing the shipped save path on the same day the phone
      arrived, and the gate proves the two equivalent on a real blob instead.

   3. **`el` and `render` have nothing to answer here.** They exist because the
      ui draws HTML strings into `#main`. A phone has no document, so on the
      native side they are inert on purpose: the phone draws the game in a
      WebView (where the whole ui runs untouched), and this host exists for the
      parts of the app that are *native* - sync, notifications, the leaderboard,
      share - which only ever need the simulation.

   Nothing here reaches for the DOM, and the `rn` gate runs a whole world through
   this file with `document`, `window`, `localStorage` and `fetch` deleted. */
'use strict';

/* Ten years of quarterly saves, and a save is a JSON string of the whole state
   including every table the player has touched. 12 MB is generous and bounded;
   the oldest keys are dropped first when it is reached. */
const MIRROR_LIMIT = 12 * 1024 * 1024;

function createStore(backing) {
  const mirror = new Map();      /* key -> string: the truth for the game */
  let queued = null;             /* the debounce handle */
  let pending = new Set();       /* keys written since the last flush */
  let bytes = 0;

  const flush = () => {
    queued = null;
    const keys = Array.from(pending);
    pending = new Set();
    for (const k of keys) {
      const v = mirror.get(k);
      if (v === undefined) backing.remove(k).catch(() => {});
      else backing.set(k, v).catch(() => {});
    }
  };

  return {
    /* what the game calls, synchronously */
    get(key) { return mirror.has(key) ? mirror.get(key) : null; },
    set(key, value) {
      const was = mirror.get(key);
      if (was !== undefined) bytes -= was.length;
      mirror.set(key, value);
      bytes += value.length;
      if (bytes > MIRROR_LIMIT) {
        for (const k of Array.from(mirror.keys())) {
          if (bytes <= MIRROR_LIMIT) break;
          if (k === key) continue;
          const v = mirror.get(k);
          mirror.delete(k);
          bytes -= v.length;
          pending.add(k);
        }
      }
      pending.add(key);
      if (queued) clearTimeout(queued);
      queued = setTimeout(flush, 250);
    },
    remove(key) {
      bytes -= (mirror.get(key) || '').length;
      mirror.delete(key);
      pending.add(key);
      if (queued) clearTimeout(queued);
      queued = setTimeout(flush, 250);
    },
    keys() { return Array.from(mirror.keys()); },
    /* called once at boot, before the game is asked anything */
    async hydrate() {
      const all = await backing.getAll();
      for (const [k, v] of Object.entries(all || {})) {
        if (typeof v !== 'string') continue;
        mirror.set(k, v);
        bytes += v.length;
      }
      return mirror.size;
    },
    /* and once on the way out: a phone can be suspended between the set and the
       flush, and a lost quarter is a lost quarter */
    flushNow() { if (queued) { clearTimeout(queued); } flush(); }
  };
}

/* The device half. In the app this is `@react-native-async-storage/async-storage`;
   here it is an interface, so the gate can run the same store against a fake and
   a real phone gets the real thing. */
function asyncStorageBacking(AsyncStorage, prefix) {
  const p = prefix || '';
  return {
    getAll: async () => {
      const keys = await AsyncStorage.getAllKeys();
      const mine = keys.filter((k) => k.indexOf(p) === 0);
      const rows = await AsyncStorage.multiGet(mine);
      const out = {};
      for (const [k, v] of rows) out[k.slice(p.length)] = v;
      return out;
    },
    set: (k, v) => AsyncStorage.setItem(p + k, v),
    remove: (k) => AsyncStorage.removeItem(p + k)
  };
}

/* ---- the host itself -------------------------------------------------------
 *
 * `core` is injected rather than imported: the app imports `@ledger/core` at
 * boot (after the store is warm) and passes it in, which is also what lets this
 * file run in a plain JS engine in the gate. */
function createRnHost(opts) {
  const o = opts || {};
  const core = o.core || {};
  const store = o.store || createStore({ getAll: async () => ({}), set: async () => {}, remove: async () => {} });
  /* the single file's key names, read from core rather than typed here: if the
     game ever moves its saves, both runtimes move together */
  const SKEY = core.SKEY || 'ledger_v1_';
  const PKEY = core.PKEY || 'ledger_profile_v1';
  const slot = (s) => 'save.' + (s || 'auto');

  /* the headless-host fallback: an app that has not wired core yet still gets a
     host that answers every slot instead of a TypeError three screens deep */
  const noop = function () {};

  const host = {
    toast: o.toast || noop,

    /* the seam's DOM slots: a phone answers them with nothing, on purpose */
    el: function () { return null; },
    render: noop,
    view: function () { return ''; },

    /* ---- the save, in the browser's own format ---------------------------- */
    save: function (s) {
      try {
        const blob = JSON.stringify({ S: core.S, rs: core.R ? core.R.s : 0, ui: { tab: core.UI ? core.UI.tab : '' } });
        store.set(slot(s), blob);
        return true;
      } catch (e) { return false; }
    },
    hasSave: function (s) { return store.get(slot(s)) !== null; },
    load: function (s) {
      try {
        const raw = store.get(slot(s));
        if (!raw) return false;
        const data = JSON.parse(raw);
        core.setS(data.S);
        core.R.s = data.rs | 0;
        const S = core.S;
        if (!S.pending) S.pending = [];
        if (!S.cd) S.cd = {};
        if (!S.flags) S.flags = {};
        if (!S.decisions) S.decisions = [];
        /* relink the company portfolio: JSON duplicated the active-business
           reference, and the file's loader does the same thing for the same
           reason */
        if (!S.bizs || !S.bizs.length) S.bizs = S.biz ? [S.biz] : [];
        S.bizs = S.bizs.filter(Boolean);
        S.bizs.forEach(function (b) {
          if (!b.id) b.id = 'b' + (++S.seq);
          if (!b.outlets) b.outlets = [];
          if (!b.contracts) b.contracts = [];
          if (!b.staff) b.staff = [];
        });
        S.biz = (S.activeBiz && S.bizs.find(function (b) { return b.id === S.activeBiz; })) || S.bizs[0] || null;
        S.activeBiz = S.biz ? S.biz.id : null;
        core.UI.tab = core.normTab(data.ui && data.ui.tab);
        core.UI.modal = null;
        core.recompute();
        return true;
      } catch (e) { return false; }
    },
    wipe: function () { ['auto', 's1', 's2', 's3'].forEach((s) => store.remove(slot(s))); },

    /* ---- the profile, same shape as the file's ---------------------------- */
    loadProfile: function () {
      try {
        const raw = store.get('profile');
        let p = null;
        if (raw) { try { p = JSON.parse(raw); } catch (e) { p = null; } }
        if (!p || p.v !== 1 || !Array.isArray(p.runs)) {
          core.setProfile(core.blankProfile());
          host.saveProfile();
          return core.PROF;
        }
        p.runs = p.runs || [];
        p.cloud = Object.assign(core.blankProfile().cloud, p.cloud || {});
        core.setProfile(p);
        return core.PROF;
      } catch (e) { core.setProfile(core.blankProfile()); return core.PROF; }
    },
    saveProfile: function () {
      try {
        if (!core.PROF) return false;
        core.PROF.updated = new Date().toISOString();
        store.set('profile', JSON.stringify(core.PROF));
        return true;
      } catch (e) { return false; }
    },

    /* ---- sync, the network, the url, and what this phone can do ----------- */
    cloudSyncBackground: function (payload) {
      /* Fire and forget: the seam says this never blocks the game. A phone on a
         train is the normal case, not the exception, so a rejection here is
         swallowed the way the file swallows a failed sync. */
      try {
        const p = o.cloudSync ? o.cloudSync(payload) : null;
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    },
    net: { fetch: o.fetch || function () { return Promise.reject(new Error('this phone has no network')); } },
    url: o.url || function () { return ''; },
    /* A phone can point a camera at a QR code, and saying so is a promise: this
       answers true only when a scanner is actually wired (see App.jsx). The ui
       asks through `seasonCanScan()` and shows the Scan control on the answer. */
    canScan: o.canScan || function () { return false; }
  };
  return host;
}

module.exports = { createRnHost, createStore, asyncStorageBacking, MIRROR_LIMIT };
