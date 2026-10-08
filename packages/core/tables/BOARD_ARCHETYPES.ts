/*
  BOARD_ARCHETYPES — from 26-governance-register-board.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface BOARD_ARCHETYPESShape {
  id: string;
  label: string;
  skill: string;
  temper: string;
  patience: number;
  blurb: string;
  push: any[] | string[];
  likes: string;
  hates: string;
}

const BOARD_ARCHETYPES: BOARD_ARCHETYPESShape[] = [
  {id:'founder', label:'Founder', skill:'ops', temper:'yours', patience:1.0,
   blurb:'you, in the chair, holding the casting vote',
   push:[], likes:'being left to get on with it', hates:'being told how to run it'},
  {id:'money',    label:'Capital',            skill:'finance', temper:'cold',    patience:0.72,
   blurb:'counts the quarters since the last distribution',
   push:['dividend','raise','sell','audit','borrow'],
   likes:'returns, reporting discipline, a clean balance sheet',
   hates:'related-party dealings, missed reporting, drawings ahead of profit'},
  {id:'operator', label:'Operations',         skill:'ops',      temper:'blunt',   patience:0.62,
   blurb:'thinks the answer to most questions is more capacity',
   push:['expand','hire','capex','fire','automate'],
   likes:'volume, utilisation, decisive hiring',
   hates:'underinvestment while you take drawings'},
  {id:'connector',label:'Access',             skill:'network',  temper:'warm',    patience:0.85,
   blurb:'knows who to call, and expects to be credited for it',
   push:['contract','partner','licence','acquire'],
   likes:'introductions made, doors opened, public thanks',
   hates:'being bypassed on the deals they brought'},
  {id:'craft',    label:'Craft',              skill:'tech',     temper:'precise', patience:0.90,
   blurb:'cares whether the thing actually works',
   push:['quality','product','automate','train'],
   likes:'specification, testing, product investment',
   hates:'cutting quality to make a quarter'},
  {id:'family',   label:'Family',             skill:'network',  temper:'proud',   patience:1.05,
   blurb:'represents a surname, not a shareholding',
   push:['hire','dividend','related','property'],
   likes:'being consulted, relatives on the payroll, visible respect',
   hates:'being treated as a small holder'},
  {id:'pro',      label:'Non-executive',      skill:'finance',  temper:'dry',     patience:0.78,
   blurb:'reads the numbers before the narrative',
   push:['audit','compliance','governance','reserve'],
   likes:'clean books, filed returns, documented process',
   hates:'informality, cash handling, surprises in the accounts'},
  {id:'predator', label:'Strategic',          skill:'finance',  temper:'patient', patience:1.35,
   blurb:'bought in intending to end up with all of it',
   push:['sell','merge','buyout','related'],
   likes:'consolidation, control, and your impatience',
   hates:'anything that delays the endgame'},
  {id:'nominee',  label:'Government nominee', skill:'network',  temper:'formal',  patience:1.10,
   blurb:'speaks for a ministry that holds opinions about your sector',
   push:['compliance','licence','local','train'],
   likes:'local content, filings, being photographed',
   hates:'regulatory trouble with their name attached'}
];
