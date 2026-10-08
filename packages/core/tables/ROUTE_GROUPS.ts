/*
  ROUTE_GROUPS — from 13-route-why-and-the-screen-hint.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ROUTE_GROUPSShape {
  t: string;
  open: number;
  cards: string[];
  note?: string;
}
interface ROUTE_GROUPSShape2 {
  t: string;
  open: number;
  note?: string;
  cards: string[];
  layout?: string;
}
interface ROUTE_GROUPSShape3 {
  t: string;
  open: number;
  cards: string[];
}
interface ROUTE_GROUPSShape4 {
  overview: ROUTE_GROUPSShape[];
  "work/business": ROUTE_GROUPSShape2[];
  "work/career": ROUTE_GROUPSShape3[];
  "work/life": ROUTE_GROUPSShape3[];
  "money/position": ROUTE_GROUPSShape3[];
  "money/markets": ROUTE_GROUPSShape[];
  "money/deals": ROUTE_GROUPSShape3[];
  "money/group": ROUTE_GROUPSShape3[];
  "governance/pack": ROUTE_GROUPSShape3[];
  "governance/register": ROUTE_GROUPSShape3[];
  "legacy/people": ROUTE_GROUPSShape3[];
  "legacy/ambition": ROUTE_GROUPSShape3[];
  "legacy/settings": ROUTE_GROUPSShape3[];
}

const ROUTE_GROUPS: ROUTE_GROUPSShape4 = {
  'overview': [
    { t:'Where you stand',        open:1, cards:['Where you stand'] },
    { t:'Waiting on you',         open:1, cards:['Waiting on you'] },
    { t:'This quarter',           open:1, cards:['This quarter','What is at risk'] },
    { t:'Background',             open:0, note:'the slow-moving numbers', cards:['Skills','The economy'] }
  ],
  'work/business': [
    { t:'The machine',            open:1, note:'how this business actually runs',
      cards:['Engine room','Levers','Position','Conditions'] },
    { t:'Where you trade',        open:0, layout:'g2', cards:['Units','Contracts','On tender'] },
    { t:'The people',             open:0, cards:['Team','People','Candidates'] },
    { t:'The company',            open:1, cards:['Testco','Operations','Partnerships','Track record'] }
  ],
  'work/career': [
    { t:'The job',                open:1, cards:['Employment'] },
    { t:'This quarter',           open:1, cards:['What you can do this quarter','Capability'] },
    { t:'History',                open:0, cards:['Recent career log'] }
  ],
  'work/life': [
    { t:'Where you are',          open:1, cards:['Your life'] },
    { t:'What it costs',          open:1, cards:['What it costs to run this life'] },
    { t:'Record',                 open:0, cards:['Decisions on record','Life log'] }
  ],
  'money/position': [
    { t:'Your money',             open:1, cards:['Cash & debt','Borrow'] },
    { t:'How to think about it',  open:0, cards:['What this tab is really asking'] }
  ],
  'money/markets': [
    /* The Markets card keeps its own internal category headings (Cash,
       Bonds, Equities…), so it is grouped whole rather than split up. */
    { t:'What you hold',          open:1, cards:['Portfolio'] },
    { t:'What you could buy',     open:1, note:'every asset class, in order of access', cards:['Markets'] }
  ],
  'money/deals': [
    { t:'Live',                   open:1, cards:['On the table','Partnership offers'] },
    { t:'Committed',              open:1, cards:['Committed capital'] },
    { t:'Background',             open:0, cards:['How to read these','Last twelve months'] }
  ],
  'money/group': [
    { t:'The structure',          open:1, cards:['Your Holdings','Cash, debt and reserves'] },
    { t:'Moving money around',    open:1, cards:['Getting cash out of a subsidiary','Intercompany balances','Management charges'] },
    { t:'What the group owes',    open:0, cards:['Group obligations'] }
  ],
  'governance/pack': [
    { t:'The numbers',            open:1, cards:['Management accounts','Cash and working capital','Operating KPIs'] },
    { t:'What it is worth',       open:1, cards:['What it is worth','The plan'] },
    { t:'The terms you live under', open:0, cards:['Covenants','Option pool','Promises'] }
  ],
  'governance/register': [
    { t:'Who owns what',          open:1, cards:['The register'] },
    { t:'Side deals',             open:0, cards:['Promises','Shareholders'] }
  ],
  'legacy/people': [
    { t:'The people in your life',open:1, cards:['The cast','Household & family'] },
    { t:'The rival',              open:0, cards:['Your rival'] }
  ],
  'legacy/ambition': [
    { t:'The goal',               open:1, cards:['What you are actually trying to do','Where you stand'] },
    { t:'The long view',          open:0, cards:['The scoreboard that matters at 65','Posterity'] }
  ],
  'legacy/settings': [
    /* Install lives inside the Save & load card, so it is not a separate
       group — pulling it out would tear it away from its parent.
       "Screen tips" is deliberately left ungrouped: it is the control that
       brings back the hints a player has dismissed, and a control that
       undoes a decision must never be hidden behind a collapsed group. */
    { t:'Your run',               open:1, cards:['Save & load'] },
    { t:'How this run is tuned',  open:0, cards:['Run settings'] }
  ]
};
