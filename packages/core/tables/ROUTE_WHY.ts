/*
  ROUTE_WHY — from 12-main.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ROUTE_WHYShape {
  overview: string;
  "work/business": string;
  "work/career": string;
  "work/household": string;
  "work/life": string;
  "work/rival": string;
  "work/levers": string;
  "money/position": string;
  "money/budget": string;
  "money/property": string;
  "money/markets": string;
  "money/deals": string;
  "money/group": string;
  "governance/pack": string;
  "governance/register": string;
  "governance/board": string;
  "governance/votes": string;
  "governance/deed": string;
  "governance/bids": string;
  "legacy/record": string;
  "legacy/people": string;
  "legacy/ambition": string;
  "legacy/chronicle": string;
  "legacy/season": string;
  "legacy/settings": string;
}

const ROUTE_WHY: ROUTE_WHYShape = {
  'overview'         : 'This is your position at a glance. Read the top line, deal with what needs you, then advance the quarter.',
  'work/business'    : 'A company is a machine with a handful of dials. Everything on this screen moves one of them.',
  'work/career'      : 'Your job is the floor under everything else. Lose it and the run gets harder, not shorter.',
  'work/household'   : 'People you pay to run your life. They buy back time - check they are worth the salary.',
  'work/life'        : 'The parts of a week that are not work. Health, stress and family decide how long you last.',
  'work/rival'       : 'Someone else is playing the same game. Worth watching; not worth copying.',
  'work/levers'      : 'Everything that moves this business, sorted by how much it costs to change your mind. The dials are the easy column; the term commitments are the ones that decide a run.',
  'money/position'   : 'Net worth is the score and runway is the clock. Every other screen here is a lever on one of them.',
  'money/budget'     : 'Your monthly spend sets your burn. Cut here and every other number gets easier.',
  'money/property'   : 'Things bought with cash. Most lose value and cost upkeep - the good ones change what you can do.',
  'money/markets'    : 'Returns are drawn from a distribution, not a promise. High volatility means big up quarters and big down ones.',
  'money/deals'      : 'One-off opportunities with a price and a consequence. Most of them expire.',
  'money/group'      : 'Once you own more than one company the group has rules a single company never had.',
  'governance/pack'  : 'Who owns what. Every governance fight is decided by these numbers long before anyone speaks.',
  'governance/register' : 'The share register is the legal truth. If it is not written here, it did not happen.',
  'governance/board' : 'The board can outvote you. Seats are power - count them before every vote.',
  'governance/votes' : 'Resolutions in flight. Whip the votes before the deadline or lose by default.',
  'governance/deed'  : 'The deed sets what you cannot do alone. Signing away a reserved matter is signing away control.',
  'governance/bids'  : 'Someone wants to buy you. Diligence is where a headline price becomes a real one.',
  'legacy/record'    : 'Every run you have finished. The game remembers what you did with the time.',
  'legacy/people'    : 'The people in your life. The only part of this run that is not a number.',
  'legacy/ambition'  : 'What you said you wanted at the start. The run is graded against it.',
  'legacy/chronicle' : 'Everything that happened, in order. Read it back to see which decisions actually mattered.',
  'legacy/season'    : 'A season is a finish line fixed in advance and a score out of 1000 across six axes. Several people can play the same season with the same seed and be compared - the conditions are pinned, so the only difference between two entries is how they played.',
  'legacy/settings'  : 'Difficulty is not locked. Change it whenever the run stops being interesting.'
};
