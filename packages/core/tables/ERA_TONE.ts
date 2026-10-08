/*
  ERA_TONE — from 16-era-chip.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ERA_TONEShape {
  good: string;
  bad: string;
  warn: string;
  info: string;
  neutral: string;
}

const ERA_TONE: ERA_TONEShape = { good:'var(--good)', bad:'var(--bad)', warn:'var(--warn)',
                   info:'var(--info)', neutral:'var(--dim)' };
