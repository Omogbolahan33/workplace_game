/*
  Money › Property — what you own, and what you could own.

  The Buy button is the case §22.23 was written for on this screen: it is
  disabled below the price, and the reason travels on the control (costs /
  you have / short). The shelf of goods is core's goodTileHTML(), so the price,
  the button and its reason are one function on both renderers and cannot
  disagree.
*/
import { S, fmt, GOODS, goodTileHTML } from '@ledger/core';

/* resale value decays 5.5% a quarter from the turn you bought it */
function resaleOf(def, owned) {
  return Math.max(0, def.cost * (1 - 0.055 * (S.turn - owned.turn)));
}

export default function ViewMoneyProperty() {
  const owned = S.fin.goods || [];

  return (
    <>
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Buy something <span className="tag">cash {fmt(S.fin.cash)}</span></h3>
          {/* a shelf of pictures - core's tile, the same as the string path */}
          <div className="grid g2" dangerouslySetInnerHTML={{ __html: GOODS.map((g) => goodTileHTML(g)).join('') }} />
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
