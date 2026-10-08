/*
  Work › Business — "Units".

  Each unit has its own lease, its own condition and its own staff, and the card
  is the same four readings repeated per unit: condition with a bar, rent, how
  long the lease has left, and who is assigned. The one judgement on it is the
  renewal button, which exists only when the lease has a quarter or less to run.

  Every control that costs money is disabled below the price and says the
  shortfall on itself — the rule from §22.23, and this screen is the densest
  place it applies: `Extend` states the cost, what the company has, and the gap,
  and so does each city's `Open a unit`, whose cost differs by the city's rent
  multiplier. The three numbers share one function here, so they cannot drift.
*/
import { S, fmt, bar, CITY, CITIES, BIZ, outletCount, outletRent, outletStaff } from '@ledger/core';

export default function ViewOutlets() {
  const b = S.biz;
  if (!b) return null;

  const T = BIZ.find((x) => x.id === b.type);
  const outlets = b.outlets || [];
  const condColour = (c) => (c >= 65 ? 'var(--good)' : c >= 40 ? 'var(--warn)' : 'var(--bad)');
  /* The city belongs inside the sentence, not appended to it: the gate caught
     my first version saying "… · short ₦4.13m to open in Abuja" where the
     built-in says "Needs ₦4.98m in the company to open in Abuja · it has …".
     Same three numbers, different sentence - and the player reads the sentence. */
  const shortfall = (cost, city) => 'Needs ' + fmt(cost) + ' in the company' +
    (city ? ' to open in ' + city : '') +
    ' · it has ' + fmt(b.cash) + ' · short ' + fmt(Math.round(cost - b.cash));
  const openCost = (rentMult) => Math.round(Math.max(2500000, (b.revenue || 0) * 0.45 + T.rentQ * 3) *
    S.cumInfl * rentMult);

  return (
    <div className="card">
      <h3>
        Units <span className="tag">{outletCount(b)} · {fmt(Math.round(outletRent(b) * S.cumInfl / b.startInfl))}/q rent</span>
      </h3>
      <div className="tiny muted" style={{ marginBottom: '10px' }}>
        Each unit has its own lease, its own condition and its own staff. Condition decays with trade and can be
        held up with maintenance spend. Neglected units quietly lose you the customers standing in them.
      </div>

      {outlets.map((o) => {
        const cm = CITIES.find((c) => c.id === (o.city || S.city)) || CITY();
        const cond = o.cond === undefined ? 80 : o.cond;
        const col = condColour(cond);
        const st = outletStaff(b, o.id);
        const upCost = Math.round((o.fitout || 3000000) * 0.55 * (o.size || 1) * S.cumInfl);
        const canExtend = !(b.cash < upCost);
        return (
          <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '11px', marginBottom: '9px' }}>
            <div className="between">
              <div>
                <b>{o.name}</b>{' '}
                <span className="tiny muted">· {cm.label} · size {o.size || 1}</span>
              </div>
              <span className="chip" style={{ background: col + '22', color: col }}>Condition {Math.round(cond)}</span>
            </div>
            <div style={{ margin: '6px 0' }} dangerouslySetInnerHTML={{ __html: bar(cond, 100, col) }} />
            <div className="tiny muted">
              {fmt(Math.round((o.rent || 0) * S.cumInfl / b.startInfl))}/mo · lease {o.end > 0 ? o.end + 'q' : 'RENEWAL DUE'}
              {' · '}{st.length} staff assigned{o.hikes ? ' · ' + o.hikes + ' rent increase' + (o.hikes > 1 ? 's' : '') : ''}
            </div>
            <div className="row wrap" style={{ marginTop: '8px', gap: '5px' }}>
              {o.end <= 1
                ? <button className="btn xs primary" data-a="rentnego" data-o={o.id}>Negotiate the renewal</button>
                : null}
              <button className="btn xs" data-a="upgradeoutlet" data-o={o.id}
                disabled={!canExtend} aria-disabled={!canExtend ? 'true' : undefined}
                title={!canExtend ? shortfall(upCost) : undefined}>
                Extend ({fmt(upCost)})
              </button>
              <button className="btn xs" data-a="maintainoutlet" data-o={o.id}>Maintain</button>
              {outlets.length > 1
                ? <button className="btn xs bad" data-a="closeoutlet" data-o={o.id}>Close unit</button>
                : null}
            </div>
          </div>
        );
      })}

      <hr className="sep" />
      <div className="row wrap" style={{ gap: '6px' }}>
        {[{ id: S.city, label: null, rentMult: CITY().rentMult }]
          .concat(CITIES.filter((c) => c.id !== S.city).slice(0, 3).map((c) => ({ id: c.id, label: c.label, rentMult: c.rentMult })))
          .map((c) => {
            const cost = openCost(c.rentMult);
            const can = !(b.cash < cost);
            return (
              <button key={c.id} className="btn sm" data-a="openoutlet" data-c={c.id}
                disabled={!can} aria-disabled={!can ? 'true' : undefined}
                title={!can ? shortfall(cost, c.label) : undefined}>
                {c.label ? c.label + ' (' + fmt(cost) + ')' : 'Open a unit here (' + fmt(cost) + ')'}
              </button>
            );
          })}
      </div>
      <div className="tiny muted" style={{ marginTop: '7px' }}>
        Opening in another city costs more and cannot be managed as closely — but it is real diversification in
        a country where one city can stop trading for a month.
      </div>
    </div>
  );
}
