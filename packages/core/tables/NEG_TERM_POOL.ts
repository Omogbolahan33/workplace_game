/*
  NEG_TERM_POOL — from 17-negotiation.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface NEG_TERM_POOLShape {
  id: string;
  label: string;
  note: string;
}

const NEG_TERM_POOL: NEG_TERM_POOLShape[] = [
 {id:'notice',  label:'Longer notice period',       note:'They get security, you get time.'},
 {id:'days',    label:'Faster payment terms',       note:'Cash sooner is worth more than a bigger number later.'},
 {id:'title',   label:'A better title',             note:'Costs nothing, and people are surprisingly moved by it.'},
 {id:'review',  label:'A review in six months',     note:'Defers the argument. Does not settle it.'},
 {id:'flex',    label:'Flexible hours / remote',    note:'Free to you, worth a lot to them.'},
 {id:'volume',  label:'Commit to a bigger volume',  note:'Trades margin for throughput.'},
 {id:'excl',    label:'Exclusivity for twelve months', note:'Worth real money to them. Costs you optionality.'},
 {id:'deposit', label:'A deposit up front',         note:'Turns a promise into cash.'},
 {id:'penalty', label:'Accept a late-delivery penalty', note:'Gives them certainty. Risks you real money.'},
 {id:'ref',     label:'A public reference / case study', note:'Marketing value, no cash cost.'}
];
