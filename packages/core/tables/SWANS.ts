/*
  SWANS — from 31-afterthreadchoice.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface SWANSShape {
  id: string;
  w: number;
  head: string;
  text: string;
  fx: (() => any);
}

const SWANS: SWANSShape[] = [
  {id:'pandemic', w:0.7, head:'A pandemic shuts the country for two quarters',
   text:'Offices close, movement stops, and a quarter of all small businesses in the country do not reopen.',
   fx:function(){ S.mkt.demand = clamp(S.mkt.demand*0.55,0.35,1.4); S.mkt.sentiment = clamp(S.mkt.sentiment-30,3,96);
     if(S.biz){ S.biz.cash -= Math.round(S.biz.revenue*0.7); S.biz.rep = clamp(S.biz.rep-6,0,100); } S.p.health = clamp(S.p.health-6,0,100); }},
  {id:'bankrun', w:0.6, head:'A bank fails and deposits are frozen',
   text:'Six weeks where nobody can get their own money out. Businesses that kept everything in one account stop trading.',
   fx:function(){ const lost = Math.round(S.fin.cash*R.range(0.12,0.35)); S.fin.cash -= lost;
     log('money','A bank you used failed. '+fmt(lost)+' is trapped in a process with no published end date.','bad'); }},
  {id:'oilboom', w:0.6, head:'An oil discovery rewrites the budget',
   text:'Money the government did not have six months ago is now being spent on things with your name on the contract.',
   fx:function(){ S.mkt.demand = clamp(S.mkt.demand*1.35,0.4,1.7); S.mkt.sentiment = clamp(S.mkt.sentiment+26,3,96);
     S.mkt.oil = clamp(S.mkt.oil*1.5,20,190); }},
  {id:'fire', w:0.5, head:'A fire in the market',
   text:'It starts in one shop at 4am and it takes a whole row with it. Several people you know lose everything before breakfast.',
   fx:function(){ if(S.biz){ const loss = Math.round(S.biz.capex*0.55 + S.biz.cash*0.3); S.biz.cash -= loss; S.biz.capex = Math.round(S.biz.capex*0.35);
       log('biz','Fire. You lost '+fmt(loss)+' of equipment and stock. Nobody was hurt, which is the only good sentence here.','bad'); } }},
  {id:'nairacash', w:0.5, head:'Cash disappears from the country',
   text:'New notes, no notes. For seven weeks the economy runs on POS terminals and favours.',
   fx:function(){ S.mkt.demand = clamp(S.mkt.demand*0.62,0.35,1.4); S.mkt.sentiment = clamp(S.mkt.sentiment-14,3,96); }},
  {id:'techhub', w:0.5, head:'Your city becomes the place',
   text:'A foreign fund opens an office. For about three years, anybody with a laptop and a story can raise money.',
   fx:function(){ S.mkt.sentiment = clamp(S.mkt.sentiment+22,3,96); S.mkt.demand = clamp(S.mkt.demand*1.22,0.4,1.7);
     S.p.rep = clamp(S.p.rep+5,0,100); log('macro','Your city has become a place people fly into on purpose.','good'); }},
  {id:'flood', w:0.6, head:'The rain does not stop',
   text:'Eleven days. Roads become rivers, the market is underwater, and half your suppliers cannot reach a warehouse.',
   fx:function(){ S.mkt.demand = clamp(S.mkt.demand*0.72,0.35,1.4); S.mkt.infl = clamp(S.mkt.infl+0.045,0.01,0.8);
     if(S.biz){ S.biz.cash -= Math.round(Math.max(200000,S.biz.revenue*0.25)*S.cumInfl); } }},
  {id:'scandal', w:0.5, head:'A scandal in your sector',
   text:'Somebody else did something unforgivable and the whole industry is being punished for it, including you.',
   fx:function(){ if(S.biz){ S.biz.rep = clamp(S.biz.rep-18,0,100); log('biz','A competitor\'s fraud became your industry\'s reputation problem.','bad'); }
     S.p.rep = clamp(S.p.rep-6,0,100); }},
];
