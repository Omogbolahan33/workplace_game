/*
  The converted screens, by the name core asks for them.

  core calls viewMoneyBudget(); in the module build that call arrives at the
  host as host.view('viewMoneyBudget'). Whoever answers decides what draws.
  This file is the answer for the screens that have been moved to React, and
  @ledger/ui's registry answers for every screen that has not.

      core                              the simulation, unchanged
        +- host.view('viewMoneyBudget') -+
                                         +-- apps/web/screens  (React)  <- here
                                         +-- @ledger/ui registry (string builders)

  A screen is rendered with renderToStaticMarkup, synchronously, because the
  host contract is synchronous: core asks for a screen and gets markup back in
  the same tick. That is a deliberate stopping point, not an accident - it
  means the event model, the router and the render loop are untouched, so a
  conversion can be reverted by deleting one line from the map below, and the
  screens that have not been converted cannot be affected by the ones that have.

  Every entry is a screen name -> a function that returns markup.
*/
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ViewMoneyBudget from './view-money-budget.jsx';
import ViewMoneyPosition from './view-money-position.jsx';
import ViewMoneyProperty from './view-money-property.jsx';
import ViewRival from './view-rival.jsx';
import ViewLedgerChronicle from './view-ledger-chronicle.jsx';
import ViewLevers from './view-levers.jsx';
import ViewAgenda from './view-agenda.jsx';
import ViewInvestPortfolio from './view-invest-portfolio.jsx';
import ViewPeople from './view-people.jsx';
import ViewGovernance from './view-governance.jsx';
import ViewCommitments from './view-commitments.jsx';
import ViewWorkingCapital from './view-working-capital.jsx';
import ViewStaffDeep from './view-staff-deep.jsx';
import ViewContracts from './view-contracts.jsx';
import ViewOutlets from './view-outlets.jsx';
import ViewLegacy from './view-legacy.jsx';
import ViewLedgerSettings from './view-ledger-settings.jsx';
import ViewInvestMarkets from './view-invest-markets.jsx';
import ViewOverview from './view-overview.jsx';
import ViewCareer from './view-career.jsx';
import ViewCareerRecord from './view-career-record.jsx';
import ViewPulse from './view-pulse.jsx';
import ViewEngine from './view-engine.jsx';
import ViewBiz from './view-biz.jsx';
import ViewDeals from './view-deals.jsx';
import ViewGroup from './view-group.jsx';
import ViewHousehold from './view-household.jsx';
import ViewSeason from './view-season.jsx';
import ViewLife from './view-life.jsx';
import WorkBusiness from './route-work-business.jsx';
import ViewPressure from './view-pressure.jsx';

/* ONE RULE THAT IS EASY TO GET WRONG, and was: do not call core's esc() on a
   value you hand to React as a child. React escapes children itself, so
   {esc(name)} renders "Delta &amp; Co" where the string builder rendered
   "Delta & Co" - the text comparison in .harness/react-screen.js caught exactly
   that, on a rival whose name happened to contain an ampersand. esc() stays for
   anything going through dangerouslySetInnerHTML, which is not escaped for you.

   One import per screen. When this list is long enough to be annoying it is a
   directory scan, but a list you can read is worth more than a list that
   maintains itself, as long as a gate proves the list is complete. */
const COMPONENTS = {
  viewMoneyBudget: ViewMoneyBudget,
  viewMoneyPosition: ViewMoneyPosition,
  viewMoneyProperty: ViewMoneyProperty,
  viewRival: ViewRival,
  viewLedgerChronicle: ViewLedgerChronicle,
  viewLevers: ViewLevers,
  viewAgenda: ViewAgenda,
  viewInvestPortfolio: ViewInvestPortfolio,
  viewPeople: ViewPeople,
  viewGovernance: ViewGovernance,
  viewCommitments: ViewCommitments,
  viewWorkingCapital: ViewWorkingCapital,
  viewStaffDeep: ViewStaffDeep,
  viewContracts: ViewContracts,
  viewOutlets: ViewOutlets,
  viewLegacy: ViewLegacy,
  viewLedgerSettings: ViewLedgerSettings,
  viewInvestMarkets: ViewInvestMarkets,
  viewOverview: ViewOverview,
  viewCareer: ViewCareer,
  viewCareerRecord: ViewCareerRecord,
  /* panels, not routes: nothing asks the host for these by name - the overview
     renders them as components - and they are listed so the gate can compare
     each one against the string version it replaced */
  viewPulse: ViewPulse,
  viewPressure: ViewPressure,
  viewEngine: ViewEngine,
  viewBiz: ViewBiz,
  viewDeals: ViewDeals,
  viewGroup: ViewGroup,
  viewHousehold: ViewHousehold,
  viewSeason: ViewSeason,
  viewLife: ViewLife
};

/* Route components, keyed by the route rather than by a screen.

   A route the app assembles itself is not a screen and cannot be one: core never
   asks the host for "work/business", and putting it in the map above would make
   every screen-shaped check in the project ask why a screen with that name does
   not exist. So it lives here, and the route drawer looks in both maps. */
const ROUTES = {
  'work': WorkBusiness,
  'work/business': WorkBusiness
};

/* THE ROUTES THIS APP GROUPS ITSELF.

   Grouping is a section around cards: `Where you stand`, `This quarter`,
   `Background`. It used to be core's `groupRoute()`, which parses the route's
   markup - so every grouped route had to stay on the string path even when all
   of its screens were converted. A route whose screens arrange their own
   sections is declared here, and then:

     - `routeOwnership()` stops refusing it because core would have grouped it;
     - core's `groupRoute()` is not applied, because the markup never exists;
     - `.harness/react-route.js` compares what this app draws against what core
       would have drawn, header for header and card for card, on the same state.

   A route is listed only when *every* section on it is a `<Group>` in a
   converted screen. */
export const groupedRoutes = [
  'overview',
  'money/position',
  'money/markets',
  'work/career',
  'legacy/people',
  'legacy/ambition',
  'legacy/settings',
  'work/business',
  'money/deals',
  'money/group',
  'governance/pack',
  'governance/register',
  'work/life'
]

/* Routes with a shape a list of screens cannot express: core's grouping gathers
   cards from two different panels into one section, or the router emits a panel
   that is not a screen at all (the company switcher). These are drawn as one
   component named here, and checked against core's own arrangement, card for
   card, by .harness/react-route.js. */
export const composedRoutes = Object.keys(ROUTES);

/* WHO DREW THIS.

   Every converted screen's markup goes out with one additive attribute on its
   first element: data-react="viewMoneyBudget". Nothing reads it in the game -
   it is there so that a check outside the game can ask the DOM which renderer
   answered, instead of inferring it from a console line that only lists the
   names this file declares. "The override is registered" and "the override is
   what rendered" are different claims, and only the second one matters: a
   screen can be listed here, misspelled against the registry, and quietly be
   drawn by the old string builder.

   It is added centrally, in one place, because an attribute every screen has to
   remember to add is an attribute some screen will not have. */
function mark(name, html) {
  return String(html).replace(/^<([a-zA-Z][\w-]*)/, '<$1 data-react="' + name + '"');
}

/* name -> () => markup */
export const converted = Object.fromEntries(
  Object.entries(COMPONENTS).map(([name, Component]) => [
    name,
    () => mark(name, renderToStaticMarkup(<Component />))
  ])
);

export const convertedNames = Object.keys(converted);

/* ---- the route ----------------------------------------------------------

   Drawing one screen at a time was the first half of the migration; this is the
   second. When every screen on a route is converted, the app draws the whole
   route with one React root and keeps it: a change of state re-renders the tree
   in place instead of replacing the page's markup, so focus, selection, scroll
   and a half-typed figure survive a quarter's worth of updates.

   The ui decides whether that is allowed (routeOwnership(): every screen on the
   route converted, no arguments to lose, nothing left for core to group) and
   calls this with either the screen names or null. Null means the container is
   needed back, and the honest answer to that is to unmount - a React root whose
   nodes were replaced behind its back is a crash waiting for the next click.

   flushSync, because the host contract is synchronous: core asks for a screen
   and the DOM has to be there when the call returns. React 19 renders
   concurrently by default, which would hand control back before the markup
   exists and make render() a lie.

   Last, the stamps. data-react-route says which renderer drew this route, and
   each screen's own data-react is put on the top-level element it rendered -
   the same claim the string path makes with mark(), asked of the DOM instead of
   of a string. It relies on one screen rendering exactly one root element, so
   when that is not true this says so out loud rather than stamping the wrong
   screen. .harness/react-screen.js asserts the one-root rule for every screen. */
let routeRoot = null;
let routeEl = null;

/* One wrapper per screen, carrying the stamp.

   display:contents, so the wrapper is not a box: the screen's own markup lays
   out exactly where it would have laid out without the wrapper, and the route's
   top-level geometry does not change because React is drawing it. That is the
   whole point of a wrapper that cannot be seen - the stamp is metadata about who
   drew a subtree, and metadata must not move anything.

   A wrapper rather than an attribute on the screen's own first element, because
   a screen may legitimately render more than one top-level element (viewLevers
   emits its four columns and then the card that explains them). Stamping the
   i-th child would silently label the wrong screen from the second one on; a
   wrapper cannot be wrong. */
function Route({ names }) {
  return names.map((name) => {
    const C = COMPONENTS[name] || ROUTES[name];
    return (
      <div key={name} data-react={name} style={{ display: 'contents' }}>
        <C />
      </div>
    );
  });
}

export function drawRoute(names, el) {
  if (!names || !names.length) {
    /* the ui needs the container back before it writes markup into it. The
       container is remembered rather than passed, because the release call
       arrives with nothing: "let go" does not need to know what of. The
       data-react-route attribute goes with it - an attribute that says React
       drew this route, left on a route the string builder just drew, is a
       claim that is now false, and a false claim in the DOM is worse than no
       stamp at all. (The attribute survives innerHTML being replaced: it is on
       the container, not on what is inside it.) */
    if (routeRoot) {
      flushSync(() => routeRoot.unmount());
      routeRoot = null;
    }
    if (routeEl) { routeEl.removeAttribute('data-react-route'); routeEl = null; }
    return false;
  }
  if (!el) return false;
  if (!routeRoot) {
    el.innerHTML = '';                 /* a React root starts from an empty container */
    routeRoot = createRoot(el);
    routeEl = el;
  }
  flushSync(() => routeRoot.render(<Route names={names} />));
  el.setAttribute('data-react-route', names.join(' '));
  return true;
}

/* the app hands the built-in renderer in through this, once, at boot */
export { setBuiltinRenderer, setPlatformFacts } from './runtime.js';
