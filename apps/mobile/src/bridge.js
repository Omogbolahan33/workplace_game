/* The bridge: the two halves of the phone app, talking.

   The game runs in a WebView - the same single file the browser gets, with the
   whole ui in it - and the native side holds the things a WebView cannot: the
   device's storage, the share sheet, the status bar, the back button, and
   (later) a camera for the season QR codes.

   Everything that crosses is one of these messages, and both directions are
   parsed through this file rather than read straight off the event object.
   That is deliberate: a WebView's `postMessage` is the one place in this app
   where a string from one runtime is trusted by another, and a bridge with no
   validation is a bridge that turns a typo in the HTML into a native crash. So
   there is exactly one shape - `{ type, body }` - one parser per direction, and
   a gate that throws nonsense at both. */
'use strict';

const TYPES = ['ready', 'toast', 'share', 'save', 'load', 'keys', 'remove', 'scan', 'url', 'canInstall'];

/* WebView -> native */
function parseFromGame(raw) {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 8 * 1024 * 1024) return null;
  let msg;
  try { msg = JSON.parse(raw); } catch (e) { return null; }
  if (!msg || typeof msg !== 'object') return null;
  if (TYPES.indexOf(msg.type) < 0) return null;
  /* A body is optional, but it is never a number, a string or an array: those
     are a message that means something else, and coercing one to `{}` would
     turn "save this" into "save nothing" without a word. */
  const b = msg.body;
  if (b !== undefined && b !== null && (typeof b !== 'object' || Array.isArray(b))) return null;
  return { type: msg.type, body: b || {} };
}

/* native -> WebView */
function encodeToGame(type, body) {
  if (TYPES.indexOf(type) < 0) throw new Error('unknown bridge message: ' + type);
  return JSON.stringify({ type: type, body: body === undefined ? null : body });
}

/* What each message is allowed to carry, and what it answers. Kept beside the
   parser so the two cannot drift: a message with no handler is a message that
   silently does nothing, which is how a Share button becomes decoration. */
const HANDLERS = {
  ready: 'nothing - the game has drawn its first screen',
  toast: 'body.text -> a native banner',
  share: 'body.text/body.url -> the platform share sheet',
  save: 'body.key + body.text -> the device store',
  load: 'body.key -> the stored text, or null',
  keys: 'nothing -> every stored key',
  remove: 'body.key -> delete it',
  scan: 'nothing -> a scanned season code, or null',
  url: 'nothing -> the address an invite link should point at',
  canInstall: 'nothing -> false on a phone: it is already installed'
};

/* A reply is the same shape, so one parser reads both directions */
function parseReply(raw) { return parseFromGame(raw); }

module.exports = { TYPES, HANDLERS, parseFromGame, parseReply, encodeToGame };
