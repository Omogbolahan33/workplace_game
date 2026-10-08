/*
  NEG_TACTICS — from 17-negotiation.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface NEG_TACTICSShape {
  id: string;
  label: string;
  hint: string;
  move?: number;
  push?: number;
  risk?: number;
  gw?: number;
  skill?: string;
  usesTerm?: boolean;
  usesLever?: boolean;
  walk?: boolean;
}

const NEG_TACTICS: NEG_TACTICSShape[] = [
 {id:'anchor', label:'Anchor hard',
  hint:'Name a number near your best case and defend it. Moves them a long way when it works.',
  move:0.06, push:0.30, risk:0.15, gw:-6, skill:'savvy'},
 {id:'reason', label:'Argue it with numbers',
  hint:'Comparables, margins, what the market actually pays. Effective and low-risk if your finance skill is real.',
  move:0.18, push:0.34, risk:0.055, gw:4, skill:'finance'},
 {id:'concede',label:'Make a genuine concession',
  hint:'Move meaningfully to unlock movement from them. Costs you, nearly always closes.',
  move:0.44, push:0.20, risk:0.02, gw:9},
 {id:'hold',   label:'Hold firm and say nothing',
  hint:'Free. Works when they are under time pressure and badly when they are not.',
  move:0.02, push:0.14, risk:0.11, gw:-3},
 {id:'term',   label:'Trade a term instead of price',
  hint:'Give something that costs you less than cash: notice period, payment days, exclusivity, a title.',
  move:0.10, push:0.40, risk:0.04, gw:6, usesTerm:true, skill:'network'},
 {id:'lever',  label:'Use your leverage',
  hint:'Remind them, concretely, what you bring and what it costs them to lose you. You can only spend this once.',
  move:0.05, push:0.54, risk:0.10, gw:-5, usesLever:true},
 {id:'walk',   label:'Walk away',
  hint:'Ends it. Sometimes the only leverage you ever actually had.',
  walk:true}
];
