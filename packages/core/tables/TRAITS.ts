/*
  TRAITS — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface TRAITSShape {
  id: string;
  name: string;
  d: string;
  skill: number;
  salary: number;
  loyalty?: number;
  theft?: number;
  demand?: number;
  output?: number;
}

const TRAITS: TRAITSShape[] = [
  {id:'sharp',    name:'Sharp',      d:'High output, negotiates hard on salary.',       skill:+2, salary:+0.22, loyalty:-8},
  {id:'loyal',    name:'Loyal',      d:'Stays through hard quarters. Rare.',            skill:0,  salary:-0.05, loyalty:+30, theft:-0.9},
  {id:'connected',name:'Connected',  d:'Brings clients and shortcuts with them.',       skill:+1, salary:+0.15, demand:+0.14},
  {id:'lazy',     name:'Coasts',     d:'Does the minimum. Needs managing.',             skill:-1, salary:-0.10, output:-0.28},
  {id:'thief',    name:'Light fingers', d:'Inventory goes missing. You will find out late.', skill:0, salary:-0.05, theft:+2.2},
  {id:'ambitious',name:'Ambitious',  d:'Grows fast, leaves faster if underpaid.',       skill:+1, salary:+0.10, output:+0.18, loyalty:-14},
  {id:'steady',   name:'Steady',     d:'Nothing spectacular, nothing breaks.',          skill:+1, salary:0,    output:+0.05, loyalty:+10},
  {id:'genius',   name:'Genuinely excellent', d:'Top decile. You will struggle to keep them.', skill:+4, salary:+0.45, output:+0.55, loyalty:-18},
];
