/* The device half of the seam: real RN APIs behind the interfaces in host.js.

   Kept apart from the host so the host can be run in a plain JS engine (which
   is what the `rn` gate does - no Metro, no emulator, no phone) and so that
   what a phone *is* good at is in one file: storage that survives a restart, a
   share sheet, the back button, and the URL an invite link should carry. */
'use strict';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Share, Platform } from 'react-native';
import { createRnHost, createStore, asyncStorageBacking } from './host';

const PREFIX = 'ledger.';

/* One store for the whole app, hydrated before the game is asked anything */
export function makeStore() {
  return createStore(asyncStorageBacking(AsyncStorage, PREFIX));
}

/* The address a join link or a QR code points at. On a phone that is the hosted
   build, and it is configured rather than guessed: an invite link built from
   "whatever the app happens to be" is a link that goes nowhere for the person
   who receives it. */
export function makeHost(core, opts) {
  const o = opts || {};
  return createRnHost({
    core: core,
    store: o.store || makeStore(),
    toast: o.toast || function () {},
    url: o.url || function () { return o.webUrl || ''; },
    /* A phone can scan, and saying so is a promise: this answers true only when
       a scanner is actually wired (see App.jsx). The ui asks through
       `seasonCanScan()` and shows the Scan control on the answer. */
    canScan: o.canScan || function () { return false; },
    fetch: (typeof fetch === 'function') ? fetch.bind(globalThis) : undefined,
    cloudSync: o.cloudSync
  });
}

export async function shareGame(text) {
  try {
    await Share.share({ message: String(text == null ? '' : text) });
    return true;
  } catch (e) { return false; }
}

export async function openUrl(u) {
  try { if (await Linking.canOpenURL(u)) { await Linking.openURL(u); return true; } } catch (e) {}
  return false;
}

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export { PREFIX };
