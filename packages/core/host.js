/* =========================================================================
   The host seam — hand-written, unlike everything else in this package
   =========================================================================

   Everything the simulation needs from outside itself lives on this one
   object. Eleven slots, and that is the whole surface between the game's logic
   and whatever is drawing it.

   Why this file exists: the simulation calls render(), toast(), save() and the
   screens directly, and always has, because there was only ever one place for
   them to be. The moment the code has to run anywhere else — a React app, a
   phone, a test with no browser in it — those calls stop resolving, and there
   is no way to tell "this is broken" from "nothing is drawing yet".

   So the call sites stay exactly as they are and this answers them. In the
   standalone build the UI's own declarations sit later in the same scope and
   win; in the module build the app installs its implementations at boot:

       import { installHost } from '@ledger/core';
       installHost({ render, toast, save, el: Q, view: name => VIEWS[name]() });

   Nothing here may touch the DOM, storage, or the network. That is what makes
   it a seam rather than another leak, and tools/tomodules.mjs asserts it.
   ========================================================================= */
export const host = {
  /* drawing */
  render: function(){},
  toast: function(){},
  /* document.getElementById */
  el: function(){ return null; },
  /* a screen, by name -> markup */
  view: function(){ return ''; },
  /* persistence — a save exists, is written, is thrown away */
  save: function(){},
  hasSave: function(){ return false; },
  loadProfile: function(){ return null; },
  saveProfile: function(){},
  cloudSyncBackground: function(){},
  /* the two things the simulation cannot own: the network, and the URL a join
     link or QR code points at */
  net: { fetch: function(){ return Promise.reject(new Error('this host has no network')); } },
  url: function(){ return ''; },
  /* what this platform can physically do. A phone can point a camera at a QR
     code; a browser on a laptop usually cannot, and a host that says yes and
     then cannot is worse than one that says no. */
  canScan: function(){ return false; }
};
export function installHost(h){
  for(const k in h)if (h[k] !== undefined) host[k] = h[k];
  return host;
}
/* Anything a platform provides beyond the list above — a screen helper only
   that platform has — is held by name rather than declared here, so adding one
   costs nothing, and a platform that has not implemented it gets an empty
   string instead of a ReferenceError three screens deep. host-shims.js is
   generated from this. */
export const hostCalls = {
  extra: {},
  call (name, args){
    const f = hostCalls.extra[name];
    return f ? f.apply(host, args) : '';
  }
};
