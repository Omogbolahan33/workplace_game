/*
  DIFFS — from 01-game-state.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface DIFFSShape {
  key: string;
  name: string;
  shock: number;
  infl: number;
  showOdds: boolean;
  coaching: boolean;
  saveScum: boolean;
  pay: number;
  fail: number;
  desc: string;
}
interface DIFFSShape2 {
  key: string;
  name: string;
  shock: number;
  infl: number;
  showOdds: boolean;
  coaching: boolean;
  saveScum: boolean;
  pay: number;
  fail: number;
  need: number;
  desc: string;
}
interface DIFFSShape3 {
  key: string;
  name: string;
  shock: number;
  infl: number;
  showOdds: boolean;
  coaching: boolean;
  saveScum: boolean;
  pay: number;
  fail: number;
  adaptive: boolean;
  desc: string;
}
interface DIFFSShape4 {
  apprentice: DIFFSShape;
  realistic: DIFFSShape;
  hardcore: DIFFSShape;
  relentless: DIFFSShape2;
  brutal: DIFFSShape2;
  merciless: DIFFSShape2;
  adaptive: DIFFSShape3;
}

const DIFFS: DIFFSShape4 = {
  apprentice:{key:'apprentice', name:'Apprentice', shock:0.55, infl:0.68, showOdds:true,  coaching:true,  saveScum:true,  pay:1.12, fail:0.72,
    desc:'Softer shocks and every decision explains the real-world principle. Learn the machine.'},
  realistic: {key:'realistic',  name:'Realistic',  shock:1.45, infl:1.18, showOdds:false, coaching:false, saveScum:true,  pay:0.93, fail:1.32,
    desc:'The intended experience. Probabilities are honest. Save and load freely.'},
  hardcore:  {key:'hardcore',   name:'Hardcore',   shock:1.40, infl:1.22, showOdds:false, coaching:false, saveScum:false, pay:0.92, fail:1.35,
    desc:'One autosave slot, no rewinds, harsher macro. Bankruptcy ends the run.'},
  /* The three tiers above are not the ceiling. They are the point at which most
     people stop. These unlock as your record proves you can take more, and the
     adaptive tier below has no ceiling at all. */
  relentless:{key:'relentless', name:'Relentless', shock:1.72, infl:1.24, showOdds:false, coaching:false, saveScum:false, pay:0.88, fail:1.48, need:60,
    desc:'The macro turns on you and stays turned. Good quarters are still possible; they are no longer the default. Talent gets expensive and credit gets personal.'},
  brutal:    {key:'brutal',     name:'Brutal',     shock:1.72, infl:1.32, showOdds:false, coaching:false, saveScum:false, pay:0.82, fail:1.65, need:72,
    desc:'Two bad decisions in a row now end runs. Competitors price against you, staff leave for less than you would believe, and the state notices you.'},
  merciless: {key:'merciless',  name:'Merciless',  shock:1.90, infl:1.40, showOdds:false, coaching:false, saveScum:false, pay:0.72, fail:2.05, need:84,
    desc:'The game is no longer pretending to be fair. You are playing against an economy that has read your record and adjusted accordingly.'},
  adaptive:  {key:'adaptive',   name:'Adaptive',   shock:1.45, infl:1.18, showOdds:false, coaching:false, saveScum:true,  pay:0.93, fail:1.32, adaptive:true,
    desc:'No fixed setting. The game reads your record and sets the difficulty itself, then keeps raising it for as long as you keep proving you can take it. There is no ceiling — if Hardcore stopped being hard, this is the one you want.'}
};
