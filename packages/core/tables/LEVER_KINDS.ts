/*
  LEVER_KINDS — from 03-startbizcost-one-price-for-every-picker.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface LEVER_KINDSShape {
  label: string;
  lead: number;
  term: number;
  breakPct: number;
  cost: ((a0: any) => any);
  ask: string;
  gives: string;
  takes: string;
  risk: string;
}
interface LEVER_KINDSShape2 {
  shifts: LEVER_KINDSShape;
  supply: LEVER_KINDSShape;
  channel: LEVER_KINDSShape;
}

const LEVER_KINDS: LEVER_KINDSShape2 = {
  shifts: {
    label:'Second shift', lead:2, term:8, breakPct:0.55,
    cost:function(b){ return Math.round(2200000 * (S.cumInfl||1) * Math.max(1, outletCount(b))); },
    ask:'Run the units a second time',
    gives:'Capacity +35% for as long as it runs.',
    takes:'Wages +45%, and morale falls every quarter it runs.',
    risk:'Two quarters of lead time. The volume only pays for itself if the demand is still there when the shift arrives — and if it is not, you are paying a 45% premium to stand around.'
  },
  supply: {
    label:'Input supply contract', lead:1, term:8, breakPct:0.5,
    cost:function(b){ return Math.round(Math.max(900000, ((b.cogs||0) || (b.revenue||3000000)*0.6) * 0.12)); },
    ask:'Lock your input costs',
    gives:'Cost of goods about 10% lower for the term.',
    takes:'A deposit up front, and a fixed price whether or not it should be.',
    risk:'You are fixing a price against a world that moves. If costs fall while you are locked in, you go on paying the old one — and the card will tell you, in numbers, exactly how much that is costing you.'
  },
  channel: {
    label:'Distribution deal', lead:1, term:6, breakPct:0.5,
    cost:function(b){ return Math.round(Math.max(1200000, (b.revenue||3000000) * 0.08)); },
    ask:'Hand the selling to a distributor',
    gives:'Demand +22% for the term.',
    takes:'They take 6% of revenue off the top, every quarter of the term.',
    risk:'You stop meeting your own customers. When the term ends the demand goes with it, and you will be selling to a market that forgot you.'
  }
};
