/*
  RES_KINDS — from 26-governance-register-board.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface RES_KINDSShape {
  label: string;
  cls: string;
  thr: string;
  reserved: boolean;
}
interface RES_KINDSShape2 {
  dividend: RES_KINDSShape;
  draw: RES_KINDSShape;
  raise: RES_KINDSShape;
  sell: RES_KINDSShape;
  dissolve: RES_KINDSShape;
  borrow: RES_KINDSShape;
  expand: RES_KINDSShape;
  appoint: RES_KINDSShape;
  remove: RES_KINDSShape;
  fireceo: RES_KINDSShape;
  ceo: RES_KINDSShape;
  plan: RES_KINDSShape;
  pool: RES_KINDSShape;
  audit: RES_KINDSShape;
  acquire: RES_KINDSShape;
  related: RES_KINDSShape;
  deed: RES_KINDSShape;
  reserve: RES_KINDSShape;
  force: RES_KINDSShape;
  removeceo: RES_KINDSShape;
  dilute: RES_KINDSShape;
}

const RES_KINDS: RES_KINDSShape2 = {
  dividend:{label:'Declare a distribution',    cls:'board',       thr:'ordinary', reserved:true},
  draw:    {label:'Cap owner drawings',        cls:'board',       thr:'ordinary', reserved:false},
  raise:   {label:'Raise outside capital',     cls:'shareholder', thr:'special',  reserved:true},
  sell:    {label:'Sell the company',          cls:'shareholder', thr:'special',  reserved:true},
  dissolve:{label:'Wind the company up',       cls:'shareholder', thr:'special',  reserved:true},
  borrow:  {label:'Take on material debt',     cls:'board',       thr:'ordinary', reserved:true},
  expand:  {label:'Major capital commitment',  cls:'board',       thr:'ordinary', reserved:false},
  appoint: {label:'Appoint to the board',      cls:'shareholder', thr:'ordinary', reserved:true},
  remove:  {label:'Remove a director',         cls:'shareholder', thr:'special',  reserved:true},
  fireceo: {label:'Replace the managing director', cls:'board',   thr:'ordinary', reserved:true},
  ceo:     {label:'Install a professional MD', cls:'board',       thr:'ordinary', reserved:false},
  plan:    {label:'Approve the annual operating plan', cls:'board', thr:'ordinary', reserved:false},
  pool:    {label:'Approve an option pool top-up', cls:'shareholder', thr:'special', reserved:true},
  audit:   {label:'Commission a forensic audit', cls:'board',     thr:'ordinary', reserved:false},
  acquire: {label:'Acquire another business',  cls:'shareholder', thr:'special',  reserved:true},
  related: {label:'Approve a related-party contract', cls:'board',thr:'ordinary', reserved:true},
  deed:    {label:'Amend the shareholders\u2019 agreement', cls:'shareholder', thr:'special', reserved:true},
  reserve: {label:'Hold back profit as reserve', cls:'board',     thr:'ordinary', reserved:false},
  force:   {label:'Bring the company to market', cls:'shareholder', thr:'special', reserved:true},
  removeceo:{label:'Remove the founder as MD', cls:'board',       thr:'ordinary', reserved:true},
  dilute:  {label:'Fund the company or be diluted', cls:'shareholder', thr:'special', reserved:true}
};
