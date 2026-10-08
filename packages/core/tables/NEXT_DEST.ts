/*
  NEXT_DEST — from 19-what-next-agenda.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface NEXT_DESTShape {
  tab: string;
  sub: string;
  focus: string;
}
interface NEXT_DESTShape2 {
  lease: NEXT_DESTShape;
  condition: NEXT_DESTShape;
  unassigned: NEXT_DESTShape;
  renewal: NEXT_DESTShape;
  margin: NEXT_DESTShape;
  tender: NEXT_DESTShape;
  morale: NEXT_DESTShape;
  underpaid: NEXT_DESTShape;
  gm: NEXT_DESTShape;
  cover: NEXT_DESTShape;
  capacity: NEXT_DESTShape;
  nostaff: NEXT_DESTShape;
  insolvent: NEXT_DESTShape;
  hmorale: NEXT_DESTShape;
  hpay: NEXT_DESTShape;
  hnanny: NEXT_DESTShape;
  hdeclared: NEXT_DESTShape;
  hsuspicion: NEXT_DESTShape;
}

const NEXT_DEST: NEXT_DESTShape2 = {
  lease:      { tab:'work',       sub:'business', focus:'Units' },
  condition:  { tab:'work',       sub:'business', focus:'Units' },
  unassigned: { tab:'work',       sub:'business', focus:'Units' },
  renewal:    { tab:'work',       sub:'business', focus:'Contracts' },
  margin:     { tab:'work',       sub:'business', focus:'Contracts' },
  tender:     { tab:'work',       sub:'business', focus:'On tender' },
  morale:     { tab:'work',       sub:'business', focus:'Team' },
  underpaid:  { tab:'work',       sub:'business', focus:'Team' },
  gm:         { tab:'work',       sub:'business', focus:'Team' },
  cover:      { tab:'work',       sub:'business', focus:'Team' },
  capacity:   { tab:'work',       sub:'business', focus:'Levers' },
  nostaff:    { tab:'work',       sub:'business', focus:'Team' },
  insolvent:  { tab:'money',      sub:'position', focus:'' },
  hmorale:    { tab:'work',       sub:'household', focus:'' },
  hpay:       { tab:'work',       sub:'household', focus:'' },
  hnanny:     { tab:'work',       sub:'household', focus:'' },
  hdeclared:  { tab:'governance', sub:'register',  focus:'' },
  hsuspicion: { tab:'work',       sub:'household', focus:'' }
};
