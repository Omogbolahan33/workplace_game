/*
  GOODS — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface GOODSShape {
  happy: number;
}
interface GOODSShape2 {
  tech: number;
}
interface GOODSShape3 {
  stress: number;
  happy: number;
}
interface GOODSShape4 {
  happy: number;
  rep: number;
  stress: number;
}
interface GOODSShape5 {
  rep: number;
  happy: number;
}
interface GOODSShape6 {
  health: number;
  stress: number;
}
interface GOODSShape7 {
  finance: number;
  ops: number;
  rep: number;
}
interface GOODSShape8 {
  finance: number;
  ops: number;
  network: number;
  rep: number;
}
interface GOODSShapesShape {
  happy?: number;
  tech?: number;
  stress?: number;
  rep?: number;
  health?: number;
  finance?: number;
  ops?: number;
  network?: number;
}
interface GOODSShape9 {
  id: string;
  name: string;
  cost: number;
  upkeep: number;
  eff: GOODSShapesShape;
  life: number;
  note: string;
}

const GOODS: GOODSShape9[] = [
  {id:'phone',   name:'Smartphone',          cost:420000,  upkeep:4000,  eff:{happy:3}, life:8,   note:'Everything runs through it.'},
  {id:'laptop',  name:'Laptop',              cost:950000,  upkeep:2000,  eff:{tech:2}, life:12,   note:'A tool, not a toy. Doubles as your office.'},
  {id:'gen',     name:'Generator (big boy)', cost:780000,  upkeep:28000, eff:{stress:-8,happy:4}, life:40, note:'The single most Nigerian purchase in existence. Fuel not included.'},
  {id:'solar',   name:'Solar + Inverter',    cost:4200000, upkeep:6000,  eff:{stress:-14,happy:6}, life:60, note:'Capital now, silence forever. Pays back in ~4 years.'},
  {id:'car',     name:'Used Car',            cost:6500000, upkeep:45000, eff:{happy:7,rep:5,stress:-4}, life:60, note:'Freedom, status, and a maintenance schedule that never ends.'},
  {id:'furnish', name:'Furnish the flat',    cost:1800000, upkeep:3000,  eff:{happy:6,stress:-4}, life:60, note:'You stop feeling like you are camping.'},
  {id:'wardrobe',name:'Proper Wardrobe',     cost:700000,  upkeep:4000,  eff:{rep:6,happy:3}, life:24, note:'People absolutely do judge. Especially in this town.'},
  {id:'gym',     name:'Gym Membership',      cost:180000,  upkeep:27000, eff:{health:5,stress:-5}, life:0, note:'Cheapest health insurance there is.'},
  {id:'hmo',     name:'Health Insurance',    cost:220000,  upkeep:75000, eff:{health:7,stress:-6}, life:0, note:'Turns a catastrophic event into an annoying one.'},
  {id:'cert',    name:'Professional Certification',cost:1200000,upkeep:0,eff:{finance:6,ops:3,rep:4},life:0,note:'ACA, CFA, PMP. Signals competence to strangers.'},
  {id:'mba',     name:'Executive MBA',       cost:9500000, upkeep:0,    eff:{finance:9,ops:6,network:12,rep:8},life:0,note:'Buying a network with a diploma attached.'},
];
