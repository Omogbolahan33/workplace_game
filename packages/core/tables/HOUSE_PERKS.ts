/*
  HOUSE_PERKS — from 04-bizcapacity.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface HOUSE_PERKSShape {
  label: string;
  cost: number;
  morale: number;
  loyalty: number;
  note: string;
}
interface HOUSE_PERKSShape2 {
  housing: HOUSE_PERKSShape;
  transport: HOUSE_PERKSShape;
  feeding: HOUSE_PERKSShape;
  medical: HOUSE_PERKSShape;
  bonus: HOUSE_PERKSShape;
}

const HOUSE_PERKS: HOUSE_PERKSShape2 = {
  housing:   {label:'Accommodation', cost:0.18, morale:6, loyalty:5, note:'They live in. Cheaper than the equivalent allowance, and they are always there.'},
  transport: {label:'Transport',     cost:0.12, morale:3, loyalty:2, note:'You cover getting to work and back.'},
  feeding:   {label:'Feeding',       cost:0.10, morale:4, loyalty:3, note:'One proper meal a day on you.'},
  medical:   {label:'Medical',       cost:0.07, morale:2, loyalty:4, note:'A retainer at a clinic. They stop bringing you their problems.'},
  bonus:     {label:'13th month',    cost:0.09, morale:5, loyalty:7, note:'An extra month every December. The cheapest way to keep somebody through a hard year.'}
};
