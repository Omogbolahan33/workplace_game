/*
  CITIES — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface CITIESShape {
  id: string;
  name: string;
  cur: string;
  fxName: string;
  fxBase: number;
  rentMult: number;
  payMult: number;
  infl: number;
  label: string;
}

const CITIES: CITIESShape[] = [
  {id:'lagos', name:'Lagos, Nigeria', cur:'₦', fxName:'USD/NGN', fxBase:1520, rentMult:1.30, payMult:1.00, infl:0.140, label:'Lagos'},
  {id:'abuja', name:'Abuja, Nigeria', cur:'₦', fxName:'USD/NGN', fxBase:1520, rentMult:1.00, payMult:0.92, infl:0.135, label:'Abuja'},
  {id:'accra', name:'Accra, Ghana',    cur:'₵', fxName:'USD/GHS', fxBase:15.5, rentMult:1.05, payMult:0.80, infl:0.105, label:'Accra'},
  {id:'nairobi',name:'Nairobi, Kenya', cur:'KSh',fxName:'USD/KES',fxBase:129,  rentMult:1.00, payMult:0.85, infl:0.085, label:'Nairobi'},
  {id:'ldn',   name:'London, UK',      cur:'£', fxName:'USD/GBP', fxBase:0.78, rentMult:2.60, payMult:5.20, infl:0.035, label:'London'},
  {id:'nyc',   name:'New York, USA',   cur:'$', fxName:'USD/USD', fxBase:1.00, rentMult:3.10, payMult:6.40, infl:0.038, label:'New York'},
];
