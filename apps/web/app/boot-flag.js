/*
  Sets the flag @ledger/ui checks before it boots itself, and makes storage
  safe to touch.

  This has to be its own module that the game component imports first, because
  ESM evaluates imports in order: by the time '@ledger/ui' is imported, this has
  already run. Without it, the UI would boot on import - restoring a save and
  rendering into a document React has not finished with.
*/

if (typeof globalThis !== 'undefined') globalThis.__LEDGER_IS_APP__ = true;

/*
  A sandboxed iframe (the in-app preview, an embed, a strict CSP) throws on
  localStorage access rather than returning null. The game treats storage as
  optional everywhere - it is a save, not the game - but a throw at import time
  would take the whole page down with it. So: probe it, and if it throws,
  substitute a memory store that behaves the same way for one session.
*/
if (typeof window !== 'undefined') {
  try {
    window.localStorage.getItem('__ledger_probe__');
  } catch (e) {
    const mem = new Map();
    const store = {
      getItem: k => (mem.has(String(k)) ? mem.get(String(k)) : null),
      setItem: (k, v) => { mem.set(String(k), String(v)); },
      removeItem: k => { mem.delete(String(k)); },
      clear: () => mem.clear(),
      key: i => [...mem.keys()][i] ?? null,
      get length() { return mem.size; }
    };
    try {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: store });
    } catch (e2) {
      /* if even that is refused, the game runs without persistence */
    }
  }
}
