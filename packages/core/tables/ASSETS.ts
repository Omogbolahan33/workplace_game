/*
  ASSETS — from 00-cities.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ASSETSShape {
  id: string;
  name: string;
  cls: string;
  ret: number;
  vol: number;
  min: number;
  note: string;
  fx?: boolean;
  illiquid?: boolean;
  yieldQ?: number;
}

const ASSETS: ASSETSShape[] = [
  {id:'savings',name:'Bank Savings',      cls:'Cash',     ret:0.004,vol:0.000,min:0,     note:'Instant access. Loses to inflation, every single quarter.'},
  {id:'ajo',    name:'Ajo / Esusu Group', cls:'Cash',     ret:0.026,vol:0.030,min:10000, note:'Informal rotating savings. Decent return, real risk the collector disappears.'},
  {id:'tbill',  name:'Treasury Bills',    cls:'Fixed Income',ret:0.048,vol:0.004,min:100000, note:'Sovereign short-term. Priced off the central bank rate.'},
  {id:'fd',     name:'Fixed Deposit',     cls:'Fixed Income',ret:0.044,vol:0.003,min:50000, note:'Locked 90 days. Break it and you lose the interest.'},
  {id:'bond',   name:'Government Bonds',  cls:'Fixed Income',ret:0.050,vol:0.020,min:200000, note:'Long duration. Price falls when rates rise.'},
  {id:'ngx',    name:'Local Equities',    cls:'Equity',   ret:0.036,vol:0.155,min:20000, note:'The domestic stock market. Violent drawdowns, violent recoveries.'},
  {id:'usd',    name:'Dollar Account',    cls:'Currency', ret:0.001,vol:0.000,min:50000, fx:true, note:'Pure FX hedge. Earns nothing, protects everything.'},
  {id:'sp500',  name:'Global Equity ETF', cls:'Equity',   ret:0.016,vol:0.075,min:100000,fx:true, note:'Broad index in hard currency. Your returns are amplified by devaluation.'},
  {id:'reit',   name:'REIT / Property Fund',cls:'Property',ret:0.024,vol:0.085,min:100000, note:'Listed real estate. Liquid-ish, moves with rates and rent.'},
  {id:'land',   name:'Land (peri-urban)', cls:'Property', ret:0.030,vol:0.072,min:3000000,illiquid:true, note:'Illiquid, title risk is real, but this is where generational money is made.'},
  {id:'rental', name:'Rental Property',   cls:'Property', ret:0.024,vol:0.048,min:20000000,illiquid:true, yieldQ:0.011, note:'Completed unit. Rents come in, tenants happen.'},
  {id:'gold',   name:'Gold',              cls:'Commodity',ret:0.014,vol:0.072,min:100000, fx:true, note:'Crisis hedge. Boring until the quarter it is not.'},
  {id:'crypto', name:'Crypto',            cls:'Crypto',   ret:0.014,vol:0.210,min:10000, fx:true, note:'Genuinely life-changing and genuinely ruinous. Position size is the only real skill.'},
];
