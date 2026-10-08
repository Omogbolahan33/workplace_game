/*
  Money › Property — what you own, and what you could own.

  The Buy button is the case §22.23 was written for on this screen: it is
  disabled below the price, and the reason travels on the control (costs /
  you have / short). In the string version that was one concatenated attribute;
  here it is a small function, because the same three numbers are used in the
  card and on the button and they should not be able to disagree.
*/
import { S, fmt, CITY, GOODS } from '@ledger/core';

/* the price of a good where you live: dearer in a dearer city */
function priceOf(g) {
  return Math.round(g.cost * (0.85 + 0.3 * CITY().rentMult / 1.3));
}

/* resale value decays 5.5% a quarter from the turn you bought it */
function resaleOf(def, owned) {
  return Math.max(0, def.cost * (1 - 0.055 * (S.turn - owned.turn)));
}

function shortfallReason(cost) {
  return 'Costs ' + fmt(cost) + ' · you have ' + fmt(S.fin.cash) +
    ' · short ' + fmt(Math.round(cost - S.fin.cash));
}

export default function ViewMoneyProperty() {
  const owned = S.fin.goods || [];

  return (
    <>
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Buy something <span className="tag">cash {fmt(S.fin.cash)}</span></h3>
          {GOODS.map((g) => {
            const cost = priceOf(g);
            const have = owned.filter((x) => x.id === g.id).length;
            const afford = S.fin.cash >= cost;
            return (
              <div key={g.id} className="mrow">
                <div className="between">
                  <b>{g.name}</b>
                  <span className="row wrap" style={{ gap: '4px', justifyContent: 'flex-end' }}>
                    {g.upkeep ? <span className="chip">{fmt(g.upkeep)}/mo upkeep</span> : null}
                    {Object.keys(g.eff).map((k) => (
                      <span key={k} className={'chip ' + (g.eff[k] > 0 ? 'g' : 'r')}>
                        {k} {g.eff[k] > 0 ? '+' : ''}{g.eff[k]}
                      </span>
                    ))}
                    <span className="chip b">{fmt(cost)}</span>
                  </span>
                </div>
                <button className="btn sm primary block" style={{ marginTop: '6px' }}
                  data-a="buygood" data-g={g.id}
                  disabled={!afford}
                  aria-disabled={!afford ? 'true' : undefined}
                  title={!afford ? shortfallReason(cost) : undefined}>
                  {have ? 'Buy another' : 'Buy'}
                </button>
              </div>
            );
          })}
        <details className="fold">
          <summary>What each thing is for</summary>
          <div>
            {GOODS.map((g) => (
              <div key={g.id} style={{ marginBottom: '6px' }}><b>{g.name}</b> — {g.note}</div>
            ))}
          </div>
        </details>
      </div>

      {owned.length > 0 && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>What you own</h3>
          {owned.map((g, i) => {
            const def = GOODS.find((x) => x.id === g.id);
            if (!def) return null;
            return (
              <div className="kv" key={i}>
                <span>{def.name} <span className="tiny muted">Q{g.turn}</span></span>
                <span className="muted">{fmt(resaleOf(def, g))}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
