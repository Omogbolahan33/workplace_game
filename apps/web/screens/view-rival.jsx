/*
  Work › Rival — a pure readout, and the first converted screen with no
  controls at all.

  Worth converting anyway: it is small, it is on a route of its own, and the
  two readings that need judgement — how warm the relationship is, and whether
  their scale bar is drawn in one colour or two — are exactly the kind of
  inline ternary a string builder hides. The gate compares the words and the
  figures; a reader compares the two files and sees the same three thresholds
  in the same order.

  `statRow()` stays in core and is embedded: it is a shared widget used by
  several screens (like positionStrip on Position), and reimplementing one bar
  per converted screen is how two screens end up disagreeing about what a bar
  looks like.
*/
import { S, BIZ, statRow } from '@ledger/core';

/* the three-word relationship scale, in one place */
function warmth(relation) {
  if (relation >= 60) return 'Warm';
  if (relation >= 20) return 'Wary';
  return 'Hostile';
}

/* The body, exported, because Work › People prints the identical card. The
   string version had it written out twice - once here and once inside
   viewPeople() - and two copies of one card is one copy too many. */
export function RivalCard() {
  const rv = S.rival;

  return (
    <>
      {rv ? (
        <>
          <div className="between">
            <b>{rv.name}</b>
            <span className={'chip ' + (rv.relation >= 40 ? 'g' : 'r')}>{warmth(rv.relation)}</span>
          </div>
          <div className="tiny muted" style={{ margin: '6px 0' }}>
            {(BIZ.find((b) => b.id === rv.type) || { name: rv.type }).name}
            {' · size '}{Math.round(rv.size)}/140
            {' · aggression '}{Math.round(rv.aggro)}/100
          </div>
          <div dangerouslySetInnerHTML={{ __html: statRow('Their scale', rv.size) }} />
          <div dangerouslySetInnerHTML={{
            __html: statRow('How much they like you', rv.relation + 100, rv.relation >= 0 ? 'var(--good)' : 'var(--bad)')
          }} />
          <div className="tiny muted" style={{ marginTop: '7px' }}>
            {rv.moves
              ? 'They have moved on you ' + rv.moves + ' time' + (rv.moves === 1 ? '' : 's') + '.'
              : 'So far they have left you alone.'}
          </div>
        </>
      ) : (
        <div className="tiny muted">Nobody is competing with you yet.</div>
      )}
    </>
  );
}

export default function ViewRival() {
  return (
    <div className="card">
      <h3>Your rival</h3>
      <RivalCard />
    </div>
  );
}
