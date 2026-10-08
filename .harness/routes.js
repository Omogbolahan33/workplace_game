/* The routes both walks walk.

   Two gates now ask a browser about the same pages - browser-screens.cjs asks
   which of them React drew in the module build, single.js asks that the shipped
   file draws every one of them as markup - and two lists that drift are two
   gates that quietly stop covering the same game: a route added to one and not
   the other is a route nobody checks. So the list lives here, once.

   `screen` is what the app walk expects to see carrying the React marker; the
   single file ignores it, because on that path nothing is allowed to carry one.
   `Money > markets` appears twice on purpose: one route, two screens the app
   serves inside it, and the marker is asked about each. */

const ROUTES = [
  { tab: 'Money',      sub: 'budget',    screen: 'viewMoneyBudget' },
  { tab: 'Money',      sub: 'position',  screen: 'viewMoneyPosition' },
  { tab: 'Money',      sub: 'property',  screen: 'viewMoneyProperty' },
  { tab: 'Money',      sub: 'deals',     screen: 'viewDeals' },
  { tab: 'Money',      sub: 'group',     screen: 'viewGroup' },
  { tab: 'Work',       sub: 'household', screen: 'viewHousehold' },
  { tab: 'Work',       sub: 'life',      screen: 'viewLife' },
  { tab: 'Legacy',     sub: 'season',    screen: 'viewSeason' },
  { tab: 'Money',      sub: 'markets',   screen: 'viewInvestPortfolio' },
  { tab: 'Work',       sub: 'levers',    screen: 'viewLevers' },
  { tab: 'Work',       sub: 'rival',     screen: 'viewRival' },
  /* Work › Business is assembled by the app itself - core's grouping gathers
     cards from two panels into one section, and the router emits the company
     switcher, which is not a screen at all - so the app draws it as one
     component and the marker to look for is the route, not a screen. */
  { tab: 'Work',       sub: 'business',  screen: 'work/business' },
  { tab: 'Legacy',     sub: 'people',    screen: 'viewPeople' },
  { tab: 'Legacy',     sub: 'chronicle', screen: 'viewLedgerChronicle' },
  { tab: 'Legacy',     sub: 'settings',  screen: 'viewLedgerSettings' },
  { tab: 'Legacy',     sub: 'ambition',  screen: 'viewLegacy' },
  { tab: 'Money',      sub: 'markets',   screen: 'viewInvestMarkets' },
  { tab: 'Overview',   sub: null,        screen: 'viewOverview' },
  { tab: 'Work',       sub: 'career',    screen: 'viewCareer' },
  { tab: 'Legacy',     sub: 'record',    screen: 'viewCareerRecord' },
  { tab: 'Governance', sub: null,        screen: 'viewGovernance' },
  /* the two routes the app arranges out of built-in panels: the screen is the
     same one, the sections are the route's own */
  { tab: 'Governance', sub: 'pack',      screen: 'viewGovernance' },
  { tab: 'Governance', sub: 'register',  screen: 'viewGovernance' }
];

module.exports = { ROUTES };
