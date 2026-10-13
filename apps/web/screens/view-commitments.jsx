/*
  Work › Business — "Commitments".

  This is the card that says what you are already stuck with: money that leaves
  every quarter whatever the company sells, a build that is still arriving, staff
  on notice, staff still finding their feet. Everything on it is a reading plus
  one control, and the reading is the point — "owed next quarter, whatever you
  sell" is the number a player is here to see.

  Two things are deliberately embedded rather than rebuilt: `bar()` (core's one
  bar, shared with half a dozen screens) and `commitBreak()`, which is the same
  calculation the Abandon button has to state before the player presses it. A
  converted screen does not get its own opinion about what a bar looks like, and
  it does not get to compute the cost of undoing something differently from the
  code that undoes it.
*/
import { S, fmt, clamp, bar, commitBuilding, committedFixedQ, commitBreak } from '@ledger/core';

export default function ViewCommitments() {
  const b = S.biz;
  if (!b) return null;

  const building = commitBuilding(b);
  const leaving = (b.staff || []).filter((st) => st.leaving !== undefined);
  const ramping = (b.staff || []).filter((st) => st.ramp !== undefined && st.ramp < 0.98 && st.leaving === undefined);
  const fx = committedFixedQ(b);

  return (
    <div className="card">
      <h3>Commitments <span className="tag">{building.length ? building.length + ' in flight' : 'none in flight'}</span></h3>
      <div className="tiny muted prose" style={{ marginBottom: '10px' }}>
        Everything here is already decided. It costs money the whole time it is arriving, and it cannot be
        unmade for free. The dials are further down the screen; this is the part you are stuck with.
      </div>
      <div className="kv">
        <span className="muted">Owed next quarter, whatever you sell</span>
        <span className="mono">{fmt(fx.total)}</span>
      </div>
      <div className="tiny muted" style={{ margin: '-2px 0 9px' }}>
        {fmt(fx.rent)} rent · {fmt(fx.salaries)} salaries
        {fx.builds ? ' · ' + fmt(fx.builds) + ' still building' : ''}
      </div>

      {!building.length && !leaving.length && !ramping.length
        ? <div className="tiny muted">Nothing is in flight. For once you can still choose.</div>
        : null}

      {building.map((c) => {
        const eta = Math.max(0, (c.readyAt || 0) - S.turn);
        const prog = clamp(((c.paid || 0) / Math.max(1, c.total || 1)) * 100, 0, 100);
        return (
          <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '10px', marginBottom: '8px' }}>
            <div className="between">
              <b>{c.label}</b>
              <span className={'chip ' + (eta ? 'y' : 'g')}>
                {eta ? 'arrives in ' + eta + ' quarter' + (eta === 1 ? '' : 's') : 'due now'}
              </span>
            </div>
            <div className="tiny muted" style={{ margin: '4px 0 6px' }}>
              {fmt(Math.round(c.total))} committed · {fmt(Math.round(c.paid))} spent · {fmt(c.perQ)} a quarter while it builds
            </div>
            <div dangerouslySetInnerHTML={{ __html: bar(prog, 100, 'var(--acc)') }} />
            <div className="row" style={{ marginTop: '8px', gap: '6px' }}>
              <button className="btn xs bad" data-a="abandon" data-i={c.id}>
                Abandon — costs {fmt(commitBreak(c))}
              </button>
            </div>
          </div>
        );
      })}

      {leaving.length ? (
        <><hr className="sep" />
          <div className="tiny muted">
            <b>Working notice:</b> {leaving.map((st) => st.name).join(', ')}. Still on the payroll for another
            quarter, still not really here.
          </div>
        </>
      ) : null}

      {ramping.length ? (
        <div className="tiny muted" style={{ marginTop: '7px' }}>
          <b>Still finding their feet:</b>{' '}
          {ramping.map((st) => st.name + ' (' + Math.round((st.ramp || 0) * 100) + '%)').join(', ')}.
          {' '}Nobody is fully useful in their first quarter.
        </div>
      ) : null}
    </div>
  );
}
