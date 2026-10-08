/*
  STAFF_ROLES — from 04-bizcapacity.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface STAFF_ROLESShape {
  label: string;
  note: string;
}
interface STAFF_ROLESShape2 {
  ops: STAFF_ROLESShape;
  sales: STAFF_ROLESShape;
  support: STAFF_ROLESShape;
  finance: STAFF_ROLESShape;
  gm: STAFF_ROLESShape;
}

const STAFF_ROLES: STAFF_ROLESShape2 = {
  ops:     {label:'Operations',  note:'Produces the thing you sell.'},
  sales:   {label:'Sales',       note:'Brings demand in. +10% effectiveness.'},
  support: {label:'Support',     note:'Admin, stores, front of house.'},
  finance: {label:'Finance',     note:'Improves the books and reduces tax risk.'},
  gm:      {label:'General manager', note:'Runs the unit without you. Frees your attention for other companies.'}
};
