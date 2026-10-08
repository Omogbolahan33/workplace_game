/*
  SECTOR_MULT — from 28-votes-and-decisions.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface SECTOR_MULTShape {
  tech: number[];
  proserv: number[];
  creative: number[];
  food: number[];
  retail: number[];
  mfg: number[];
  logi: number[];
  agri: number[];
  energy: number[];
  estate: number[];
}

const SECTOR_MULT: SECTOR_MULTShape = {
  tech:[7,11], proserv:[5,9], creative:[4.5,8], food:[3.5,6], retail:[3,5.5],
  mfg:[3.5,6.5], logi:[4,7], agri:[3,6], energy:[4,7.5], estate:[4,8]
};
