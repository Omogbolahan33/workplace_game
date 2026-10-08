/*
  Work › Business — "Contracts", and what is out to tender.

  Two lists and one rule each. A contract has a margin chip whose colour is the
  judgement on it (25% or better good, 8% or better a warning, below that bad),
  and a renewal button that appears in the last quarter of its life — the one
  moment the player can do something about it. Tenders are the opposite: a bid
  is not one button but a row of them, one per discount level, each stating what
  it would pay. That row is core's `contractBidOptions()`, used here unchanged,
  because the bid levels and the arithmetic behind each price belong to the
  negotiation that resolves them.
*/
import { S, fmt, contractBidOptions } from '@ledger/core';

export default function ViewContracts() {
  const b = S.biz;
  if (!b) return null;

  const cs = b.contracts || [];
  const offs = b.offersC || [];
  const marginColour = (m) => (m >= 0.25 ? 'var(--good)' : m >= 0.08 ? 'var(--warn)' : 'var(--bad)');

  return (
    <div className="card">
      <h3>Contracts <span className="tag">{cs.length} live</span></h3>

      {!cs.length ? (
        <div className="small muted">
          No contracted revenue. Everything you earn, you earn again every quarter from scratch. Contracts are
          the difference between a business and a very demanding hobby.
        </div>
      ) : cs.map((c) => {
        const col = marginColour(c.margin || 0);
        return (
          <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '11px', marginBottom: '9px' }}>
            <div className="between">
              <div>
                <b>{c.client || 'a client'}</b>{' '}
                <span className="tiny muted">· {c.kindName || 'Contract'}</span>
              </div>
              <span className="chip" style={{ background: col + '22', color: col }}>
                margin {Math.round((c.margin || 0) * 100)}%
              </span>
            </div>
            <div className="tiny muted" style={{ margin: '5px 0' }}>
              {fmt(Math.max(0, c.value || 0))}/quarter · paid in {c.payDays || 30} days ·{' '}
              {c.turns > 0 ? c.turns + ' quarter' + (c.turns === 1 ? '' : 's') + ' left' : 'up for renewal'}
              {c.renewals ? ' · renewed ' + c.renewals + '×' : ''}
            </div>
            {(c.incidents || []).length
              ? <div className="tiny bad">Incidents so far: {c.incidents.length}</div>
              : null}
            <div className="row wrap" style={{ marginTop: '7px', gap: '5px' }}>
              {c.turns <= 1
                ? <button className="btn xs primary" data-a="renewc" data-c={c.id}>Negotiate the renewal</button>
                : null}
              <button className="btn xs bad" data-a="dropc" data-c={c.id}>Walk away from it</button>
            </div>
          </div>
        );
      })}

      <hr className="sep" />
      <h3 style={{ fontSize: '14px' }}>On tender</h3>
      {!offs.length ? (
        <div className="tiny muted">
          {b.formal
            ? 'Nothing out to tender this quarter.'
            : 'Nothing out to tender. Unregistered businesses are not invited to bid for most of this work.'}
        </div>
      ) : offs.map((o) => (
        <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '11px', marginBottom: '9px' }}>
          <div className="between">
            <b>{o.client}</b><span className="chip b">{fmt(o.value)}/q</span>
          </div>
          <div className="tiny muted" style={{ margin: '5px 0' }}>
            {o.kindName} · {o.months} months · paid in {o.payDays} days · expires in {o.expires - S.turn}q
          </div>
          <div className="tiny muted" style={{ marginBottom: '7px' }}>
            Bid lower to win it more often. Bid lower still and you win work you lose money on.
          </div>
          <div className="row wrap" style={{ gap: '4px' }}>
            {contractBidOptions().map((x) => (
              <button key={x.id} className="btn xs" data-a="bid" data-o={o.id} data-v={x.id}>
                {x.label.split(' — ')[0]} · {fmt(Math.round(o.value * (1 - x.disc)))}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
