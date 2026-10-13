/*
  Work › Business, and the bare Work tab, assembled by the app.

  Both keys, one component, because they are one route in core: `routeViewInner()`
  emits the same chain for the tab and for the sub-tab, and only the *grouping*
  differs - Money/Work tabs are grouped by their own key, the bare tab is not. So
  the bare tab gets the same cards in the same order and no sections at all, which
  is what `Group` does when the current route is not the route the section belongs
  to.

  Why the bare tab has to be composed at all: the company switcher. Core emits
  `portfolioBar()` as part of the route, inline, and it is not a screen - the host
  is never asked for it - so a route drawn as a list of screens silently loses it.
  A player on the bare Work tab would have had no way to switch company, and no
  way to see that they own three of them. That is exactly the class of defect the
  wider route comparison was added to catch, and it caught it on the first run.

  This is the largest route in the game and the first one that cannot be drawn as
  a list of screens. `routeViewInner()` emits eight screens in a row and core's
  grouping then rearranges their *cards* into four sections — and one section can
  hold cards from two different screens (`Where you trade` is Units and
  Contracts; `The company` is Testco and Operations, both from viewBiz, with the
  rest of that panel left ungrouped beside them). A list of screens cannot
  express that, so the route is composed here: the screens' *cards* are placed
  where the game places them and the sections go around them.

  Everything a player reads is unchanged, and the arrangement is not a
  re-imagining of core's: `.harness/react-route.js` renders both and compares
  section for section, card for card, control for control.

  One note on what is embedded rather than converted: **`portfolioBar()` is
  core's** and it is not a routed screen, so it can never be overridden by name —
  it is called directly by the router. It is the company switcher and it is on
  the route whether or not a company exists, so it is embedded here with
  `dangerouslySetInnerHTML`, the same way `positionStrip()` is embedded on
  Money › Position.
  The groups' key figures are passed in, because a collapsed section does not
  render its members and the figures shown on its header are read off the
  members' own headings — the same strings, from the same functions.
*/
import {
  S, UI, fmt, portfolioBar, staffMonthly, outletCount, outletRent
} from '@ledger/core';
import Group from './group.jsx';
import ViewAgenda from './view-agenda.jsx';
import ViewCommitments from './view-commitments.jsx';
import ViewWorkingCapital from './view-working-capital.jsx';
import ViewOutlets from './view-outlets.jsx';
import ViewContracts from './view-contracts.jsx';
import ViewStaffDeep from './view-staff-deep.jsx';
import { EngineRoomCard, LeversCard, PositionCard, ConditionsCard } from './view-engine.jsx';
import {
  StartCompanyCard, CompanyCard, OperationsCard, BizPeopleCard, CandidatesCard,
  PartnershipsCard, MinorityCard, BizTrackRecordCard
} from './view-biz.jsx';

/* the heading of the Outlets card carries its own key figures; a collapsed
   `Where you trade` shows them, so they are built the same way the card does */
function unitsTag() {
  const b = S.biz; if (!b) return '';
  return outletCount(b) + ' · ' + fmt(Math.round(outletRent(b) * S.cumInfl / b.startInfl)) + '/q rent';
}

export default function WorkBusiness() {
  const b = S.biz;

  return (
    <>
      <ViewAgenda />

      {!b ? <StartCompanyCard /> : (
        <>
          {/* core's own switcher: not a screen, so it cannot be overridden by name */}
          <div dangerouslySetInnerHTML={{ __html: portfolioBar() }} />
          <ViewCommitments />
          <ViewWorkingCapital />

          <div className="grid g2">
            <Group route="work/business" i={0}>
              <EngineRoomCard />
              <LeversCard />
              <PositionCard />
              {/* world-first, the conditions are on the cards the Levers tiles
                  open: three members, as the string path counts them */}
              {UI.details ? <ConditionsCard /> : null}
            </Group>
          </div>

          {/* two members, not three: the spec also names `On tender`, but there is
              no On tender card - it is a heading inside the Contracts card - so the
              string path finds two members and the header counts two. The spec's
              third name matches nothing and is harmless, which is how a stale spec
              is designed to fail (the card stays where it was). The section's own
              `layout:'g2'` puts the two side by side, here as there. */}
          <Group route="work/business" i={1} tags={[unitsTag(), (S.biz.contracts || []).length + ' live']}>
            <ViewOutlets />
            <ViewContracts />
          </Group>

          <Group route="work/business" i={2} tags={[b.staff.length + ' staff · ' + fmt(staffMonthly()) + '/mo']}>
            <ViewStaffDeep />
          </Group>

          <div className="grid g2">
            <Group route="work/business" i={3}>
              <CompanyCard />
              <OperationsCard />
            </Group>
            <BizPeopleCard />
            <CandidatesCard />
            <PartnershipsCard />
            <MinorityCard />
            <BizTrackRecordCard />
          </div>
        </>
      )}
    </>
  );
}
