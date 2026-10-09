/*
  How the sections become the single file. One copy, three readers.

  The order the game is assembled in is a fact about the game, and two tools
  need it:

    tools/bundle.mjs            writes dist/index.html and measures it against
                                the original single file
    tools/declared-changes.mjs  reads the built script to transcribe what a
                                declared change now says

  When the transcriber read dist/index.html instead of this composition, the two
  tools were circular: the build refuses to finish while a declaration is rot,
  and the only thing that can un-rot a declaration is a build. Worse, the
  transcription silently depended on the ORDER of tools/rebuild.sh - run it
  before the bundle and it would transcribe yesterday's script and declare that
  as today's intent. So the composition lives here, both tools read it, and the
  transcriber no longer needs a build to have happened first. The build still
  checks the declaration against the built file, which is the claim worth
  making, and now nothing depends on which tool ran first.
*/
import fs from 'node:fs';
import path from 'node:path';
import { splice } from './tables.mjs';

export const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
export const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
export const exists = p => fs.existsSync(path.join(ROOT, p));

const HEADER = `/* =========================================================================
   Ledger — one file, assembled from packages/.

   The simulation is packages/core/src, in the order it was written; the
   screens are packages/ui/src, likewise. Built by tools/bundle.mjs — edit the
   section that owns the code, never this file.
   ========================================================================= */
`;

export function composeBundle() {
  const ORDER = ['core', 'ui'];          /* the simulation first, then the drawing */
  const sections = [];
  for (const kind of ORDER) {
    const dir = `packages/${kind}/src`;
    /* every file in src is a section: modules cannot get in here, or they would
       be bundled into the game */
    for (const f of fs.readdirSync(path.join(ROOT, dir)).filter(x => x.endsWith('.js')).sort()) {
      /* sections carry the tables as a one-line directive; the literal is
         spliced back in here, so what is composed below is the transcript */
      sections.push({ kind, file: f, text: splice(read(`${dir}/${f}`), `${dir}/${f}`) });
    }
  }
  const js = HEADER + sections.map(s => s.text).join('');
  const css = read('packages/ui/styles.css');
  const tpl = read('packages/ui/index.template.html');
  /* function replacers: String.replace() gives meaning to $& and $' inside a
     replacement string, and a 16,000-line script contains some */
  /* the one third-party library: built by tools/vendor-three.mjs, committed,
     and spliced in as text the world evaluates on first use */
  const vendor = exists('packages/ui/vendor/three-world.js') ? read('packages/ui/vendor/three-world.js') : '';
  const html = tpl.replace('<!--STYLES-->', () => css).replace('<!--VENDOR-->', () => vendor)
    .replace('<!--SCRIPT-->', () => js);
  return { sections, js, css, html, vendor };
}
