/*
  SEASON_AXES — from 09-resolving-decisions.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface SEASON_AXESShape {
  id: string;
  label: string;
  weight: number;
  why: string;
}

const SEASON_AXES: SEASON_AXESShape[] = [
  {id:'wealth',     label:'Wealth',     weight:25,
   why:'What you are worth in real terms, after inflation has had its say.'},
  {id:'enterprise', label:'Enterprise', weight:20,
   why:'Not what a business earned, but that you built one that would still be standing without you.'},
  {id:'reputation', label:'Reputation', weight:15,
   why:'What your name is worth in a room you are not in.'},
  {id:'family',     label:'Family',     weight:15,
   why:'Who is actually there at the end of it.'},
  {id:'health',     label:'Health',     weight:10,
   why:'You have to be alive and well enough to enjoy any of the rest of this.'},
  {id:'integrity',  label:'Integrity',  weight:15,
   why:'Whether you got there in a way you could describe out loud.'}
];
