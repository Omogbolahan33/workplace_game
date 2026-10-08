/*
  MASKS — from 24-seadraftcode.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/

const MASKS: ((a0: any, a1: any) => boolean)[] = [
  (r,c) => (r + c) % 2 === 0,
  (r,c) => r % 2 === 0,
  (r,c) => c % 3 === 0,
  (r,c) => (r + c) % 3 === 0,
  (r,c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r,c) => (r * c) % 2 + (r * c) % 3 === 0,
  (r,c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r,c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0
];
