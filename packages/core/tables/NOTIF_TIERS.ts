/*
  NOTIF_TIERS — from 19-what-next-agenda.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface NOTIF_TIERSShape {
  id: string;
  label: string;
  col: string;
}

const NOTIF_TIERS: NOTIF_TIERSShape[] = [
  { id:'bad',  label:'Needs you now',      col:'var(--bad)'  },
  { id:'warn', label:'Before you advance', col:'var(--warn)' },
  { id:'go',   label:'Worth doing',        col:'var(--acc)'  }
];
