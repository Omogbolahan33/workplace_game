/*
  Legacy › People — the cast, the household, and the rival.

  Two things worth recording.

  1. **The rival card was written twice in the codebase** — once in `viewRival()`
     and once inline inside `viewPeople()`, identically, eight lines each. This
     screen does not get a second copy: it renders the same component. If the two
     copies had drifted, the gate's text comparison would have said so when this
     screen was converted, which is a better way to find out than by reading.

  2. Each person is a face: `castTileHTML()` is core's, and both renderers draw
     the cast from it - the portrait, its relation ring, the means and standing
     meters, the traits, the memory and the three actions - as the household's
     health is `lifeRingsHTML()`. One converted screen does not get to have its
     own opinion about what a person looks like.
*/
import { S, castTileHTML, lifeRingsHTML, householdButtonsHTML } from '@ledger/core';
import { RivalCard } from './view-rival.jsx';
import Group from './group.jsx';

/* The grid is core's arrangement and this screen keeps it. Two sections sit in
   it: `The people in your life` around the cast, and `The rival` around the
   rival. `Household & family` is named in the first group's spec, and it is
   still OUTSIDE it - because core emits a group at the level where its first
   member was found, and `The cast` claimed that group one level down; the
   household card then matched a group that was already spent. That is not a
   rule worth re-deriving here: the port places the two sections where they
   belong, and .harness/react-route.js compares the result with what core drew. */
/* The grid is core's arrangement and this screen keeps it, with its two
   sections where core puts them: `The people in your life` around the cast, and
   `The rival` around the rival, one in each column.

   `Household & family` is named in the first group's spec and it is still
   OUTSIDE it. Core emits a group at the level where its first member was found,
   and `The cast` claimed that group one level further down; the household card
   then matched a group that was already spent. That is a quirk of the matcher,
   not a rule worth re-deriving here - so the port places both sections where
   core left them and `.harness/react-route.js` compares the two arrangements
   card for card, including which cards ended up grouped. */
export default function ViewPeople() {
  const cast = (S.cast || []).slice().sort((a, b) =>
    (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.relation - a.relation);

  const p = S.p;
  const household = p.married
    ? 'Married to ' + (p.spouseName || 'your spouse')
    : (p.kids > 0 ? 'Not married, with children' : 'Not married');

  return (
    <div className="grid g2">
      <div>
        <Group route="legacy/people" i={0}>
          <div className="card">
            <h3>The cast</h3>
            {/* each person is a face - castTileHTML(), the same tile the string renderer draws */}
            <div className="ctiles" dangerouslySetInnerHTML={{ __html: cast.map((c) => castTileHTML(c)).join('') }} />
            {/* the sentence that opened this card, at the foot of it, one tap away */}
            <details className="fold">
              <summary>Why they remember</summary>
              <div>
                These people get older, richer, poorer and dead whether you are paying attention or
                not. What they remember is what you did.
              </div>
            </details>
          </div>
        </Group>

        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Household &amp; family</h3>
          <div dangerouslySetInnerHTML={{ __html: lifeRingsHTML() }} />
          <hr className="sep" />
          <div className="tiny muted">
            {household}{p.kids > 0 ? ' · ' + p.kids + ' child' + (p.kids === 1 ? '' : 'ren') : ''}
          </div>
          {/* the household's three, core's - the card you open by tapping yourself has the same */}
          <div className="row wrap" style={{ marginTop: '9px' }} dangerouslySetInnerHTML={{ __html: householdButtonsHTML() }} />
        </div>
      </div>

      <div>
        <Group route="legacy/people" i={1}>
          <div className="card">
            <h3>Your rival</h3>
            {/* the same component the Rival screen renders: one card, one copy */}
            <RivalCard />
          </div>
        </Group>
      </div>
    </div>
  );
}
