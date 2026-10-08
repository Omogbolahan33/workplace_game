/*
  SUBS — from 11-cloudpull.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface SUBSShape {
  id: string;
  label: string;
}
interface SUBSShape2 {
  work: SUBSShape[];
  money: SUBSShape[];
  governance: SUBSShape[];
  legacy: SUBSShape[];
}

const SUBS: SUBSShape2 = {
  work:  [{id:'business',label:'Business'},  {id:'career',  label:'Career'},
          {id:'household',label:'Household'},{id:'life',    label:'Your life'},
          {id:'rival',   label:'Rival'},     {id:'levers',  label:'Levers'}],
  money: [{id:'position',label:'Position'},  {id:'budget',  label:'Budget'},
          {id:'property',label:'Property'},  {id:'markets', label:'Markets'},
          {id:'deals',   label:'Deals'},     {id:'group',   label:'Group'}],
  governance: [{id:'pack',label:'The pack'}, {id:'register',label:'Register'},
               {id:'board',label:'Board'},   {id:'votes',   label:'Votes'},
               {id:'deed',label:'Deed'},     {id:'bids',    label:'Bids'}],
  legacy: [{id:'record',label:'Your record'},{id:'people',  label:'People'},
           {id:'ambition',label:'Ambition'},{id:'chronicle',label:'Chronicle'},
           {id:'season',  label:'Season'},{id:'settings',label:'Settings'}]
};
