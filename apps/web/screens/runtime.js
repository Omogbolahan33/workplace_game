/*
  How a converted screen asks for a panel that has not been converted.

  A converted screen is often a container: Governance is a switcher and a
  two-column arrangement around eight sub-screens that are all still core's
  markup builders. It cannot import them — they live in @ledger/ui, which lives
  in the registry the app is in the middle of installing, and a converted screen
  reaching back into the package that called it is how a conversion becomes a
  cycle.

  So the app hands the built-in renderer in, once, at boot:

      setBuiltinRenderer((name, ...args) => ui.builtinScreen(name, ...args))

  and the screens ask for `builtin('viewPack', b)`.

  **It must be the built-in renderer, never `screenFor`.** `screenFor` consults
  the overrides, so a converted screen asking for a converted name would call
  itself until the stack ran out. `builtinScreen` reads the generated registry
  and ignores the overrides, which is exactly the right answer: "draw me the
  panel the way this app would have drawn it before anyone converted anything."

  Before boot the renderer returns an empty string rather than throwing, and it
  says so once — a panel that renders as nothing is the failure mode this whole
  seam exists to make loud, not quiet.
*/
let render = null;
let warned = false;

/* Facts about the platform that a screen has to render from, but that the
   simulation has no business knowing: can this browser install the game right
   now, and does it have a camera it may point at a QR code. They arrive the
   same way the built-in renderer does - the app hands them in at boot - and
   they default to "no", which is the honest answer for a host that has not
   said otherwise.

   A screen must render from the fact rather than testing for it itself: the
   Install button is the worked example, since testing for it wrong was a bug
   that hid a control for the life of the game. */
let facts = { canInstall: () => false, canScan: () => false };
export function setPlatformFacts(f) {
  facts = Object.assign({ canInstall: () => false, canScan: () => false }, f || {});
  return facts;
}
export function canInstall() { return !!facts.canInstall(); }
export function canScan() { return !!facts.canScan(); }

export function setBuiltinRenderer(fn) {
  render = typeof fn === 'function' ? fn : null;
  warned = false;
  return render;
}

export function builtin(name, ...args) {
  if (!render) {
    if (!warned) {
      warned = true;
      console.warn('a converted screen asked for the built-in "' + name + '" before the app ' +
        'installed the built-in renderer — it will render as nothing');
    }
    return '';
  }
  return render(name, ...args);
}
