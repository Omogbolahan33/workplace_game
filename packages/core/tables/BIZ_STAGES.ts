/*
  BIZ_STAGES — from 04-bizcapacity.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface BIZ_STAGESShape {
  label: string;
  note: string;
}
interface BIZ_STAGESShape2 {
  startup: BIZ_STAGESShape;
  survival: BIZ_STAGESShape;
  traction: BIZ_STAGESShape;
  scale: BIZ_STAGESShape;
  maturity: BIZ_STAGESShape;
  decline: BIZ_STAGESShape;
}

const BIZ_STAGES: BIZ_STAGESShape2 = {
  startup:  {label:'Startup',   note:'You are still finding out whether anyone wants this.'},
  survival: {label:'Survival',  note:'It exists. It has not yet proven it can pay for itself.'},
  traction: {label:'Traction',  note:'Something is working. Now the constraint is you.'},
  scale:    {label:'Scale',     note:'Growth is the main risk now. Growth breaks things.'},
  maturity: {label:'Maturity',  note:'It makes money. The question is for how much longer.'},
  decline:  {label:'Decline',   note:'Revenue is going the wrong way and it is not the market.'}
};
