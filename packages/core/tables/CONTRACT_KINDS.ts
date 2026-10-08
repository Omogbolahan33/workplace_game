/*
  CONTRACT_KINDS — from 18-contracts-and-fulfilment.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface CONTRACT_KINDSShape {
  id: string;
  name: string;
  margin: number;
  payDays: number;
  risk: number;
  w: number;
  needFormal?: boolean;
}

const CONTRACT_KINDS: CONTRACT_KINDSShape[] = [
 {id:'supply',   name:'Supply contract',   margin:0.16, payDays:45,  risk:0.10, w:1.3},
 {id:'service',  name:'Service agreement', margin:0.38, payDays:30,  risk:0.13, w:1.2},
 {id:'retainer', name:'Monthly retainer',  margin:0.44, payDays:21,  risk:0.08, w:1.0},
 {id:'framework',name:'Framework agreement',margin:0.22, payDays:60, risk:0.16, w:0.9},
 {id:'govt',     name:'Government contract',margin:0.28, payDays:120, risk:0.24, w:0.8, needFormal:true}
];
