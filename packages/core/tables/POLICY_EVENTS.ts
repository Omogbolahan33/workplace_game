/*
  POLICY_EVENTS — from 01-game-state.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface POLICY_EVENTSShape {
  id: string;
  w: number;
  cond: ((a0: any) => boolean);
  head: string;
  text: string;
  fx: ((a0: any) => any);
}

const POLICY_EVENTS: POLICY_EVENTSShape[] = [
  {id:'fuel',   w:1.0, cond:m=>true, head:'Fuel subsidy removed overnight',
   text:'Pump price triples before dawn. Transport, food and diesel repriced by lunchtime.',
   fx:m=>{ m.infl += 0.055*D().shock; m.sentiment -= 12; m.demand -= 0.05; }},
  {id:'deval',  w:1.4, cond:m=>true, head:'Currency devalued at the official window',
   text:'The central bank unification lands. Importers reprice everything within a week.',
   fx:m=>{ const s=(0.14+R.f()*0.26)*D().shock; m.usd *= (1+s); m.fxShockTurn = S.turn; m.infl += 0.035*D().shock; m.sentiment -= 8; return 'FX move: +'+(s*100).toFixed(0)+'%'; }},
  {id:'naira',  w:0.7, cond:m=>true, head:'Cash redesign / naira scarcity',
   text:'New notes, no notes. POS operators become the most powerful people in the country for six weeks.',
   fx:m=>{ m.demand -= 0.12; m.sentiment -= 6; }},
  {id:'rate',   w:1.2, cond:m=>true, head:'Monetary policy committee hikes aggressively',
   text:'Borrowing gets expensive. Fixed income suddenly pays; equities and property stop moving.',
   fx:m=>{ m.mpr += 0.05*D().shock; m.demand -= 0.04; m.sentiment -= 4; }},
  {id:'ease',   w:0.9, cond:m=>m.mpr>0.10, head:'Central bank begins an easing cycle',
   text:'Credit loosens. Cheap money returns and risk assets breathe again.',
   fx:m=>{ m.mpr = Math.max(0.05, m.mpr-0.045); m.demand += 0.05; m.sentiment += 7; }},
  {id:'oil',    w:0.9, cond:m=>true, head:'Oil price collapse',
   text:'The budget gaps widen, the currency wobbles, and government contracts stop paying.',
   fx:m=>{ m.oil = clamp(m.oil*0.62, 28, 130); m.usd *= 1.07; m.sentiment -= 9; m.gdp -= 0.012; }},
  {id:'boom',   w:0.8, cond:m=>true, head:'Foreign investment returns',
   text:'Capital floods in. Valuations, land prices and confidence move together.',
   fx:m=>{ m.usd *= 0.94; m.sentiment += 12; m.demand += 0.08; m.gdp += 0.008; }},
  {id:'grid',   w:1.1, cond:m=>true, head:'National grid collapses — again',
   text:'Eleven days of darkness. Diesel sellers and solar installers have a very good quarter.',
   fx:m=>{ m.power = clamp(m.power-22, 5, 95); m.demand -= 0.03; m.infl += 0.008; }},
  {id:'gridup', w:0.7, cond:m=>m.power<70, head:'Power supply improves unexpectedly',
   text:'A new independent grid deal lands. Businesses quietly stop budgeting for diesel.',
   fx:m=>{ m.power = clamp(m.power+26, 5, 98); m.demand += 0.03; }},
  {id:'tax',    w:0.8, cond:m=>true, head:'New tax regime takes effect',
   text:'Withholding, VAT and levies get restructured. Compliance costs go up for everyone formal.',
   fx:m=>{ if(S.biz && S.biz.formal){ S.biz.taxLoad = (S.biz.taxLoad||0.05)+0.02; } m.sentiment -= 5; }},
  {id:'bank',   w:0.5, cond:m=>true, head:'Bank recapitalisation directive',
   text:'Lenders must raise capital. Credit to small business dries up for two quarters.',
   fx:m=>{ S.creditCrunch = 2; m.demand -= 0.03; }},
  {id:'insec',  w:0.6, cond:m=>true, head:'Security incident spooks investors',
   text:'A high-profile incident dominates the news. Logistics routes lengthen, insurance rises.',
   fx:m=>{ m.sentiment -= 10; m.demand -= 0.05; }},
];
