/*
  COVENANT_KINDS — from 28-votes-and-decisions.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface COVENANT_KINDSShape {
  label: string;
  desc: string;
  unit: string;
  worse: string;
}
interface COVENANT_KINDSShape2 {
  leverage: COVENANT_KINDSShape;
  cover: COVENANT_KINDSShape;
  mincash: COVENANT_KINDSShape;
  capex: COVENANT_KINDSShape;
  conc: COVENANT_KINDSShape;
  keyman: COVENANT_KINDSShape;
}

const COVENANT_KINDS: COVENANT_KINDSShape2 = {
  leverage:{label:'Leverage', desc:'Borrowings must stay below a multiple of trailing EBITDA.', unit:'x', worse:'higher'},
  cover:   {label:'Interest cover', desc:'Trailing EBITDA must cover interest a set number of times.', unit:'x', worse:'lower'},
  mincash: {label:'Minimum cash', desc:'The company must hold at least this much cash at every quarter end.', unit:'', worse:'lower'},
  capex:   {label:'Capital expenditure cap', desc:'Capital spend in any four quarters may not exceed this.', unit:'', worse:'higher'},
  conc:    {label:'Customer concentration', desc:'No single customer may exceed this share of revenue.', unit:'%', worse:'higher'},
  keyman:  {label:'Key person', desc:'The founder must remain managing director, or the facility falls for review.', unit:'', worse:'breach'}
};
