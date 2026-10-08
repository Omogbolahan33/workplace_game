/*
  Money › Markets — the portfolio table.

  The one subtlety is the "last quarter" column: an asset that has never had a
  return prints an em dash rather than a number, and the string version did it
  with a nested ternary in the middle of a concatenation. Here it is a small
  function with a name, which is what the column actually means.

  Assets whose definition is missing from ASSETS are skipped — the string
  version returned early inside a forEach, which JSX does with `null`.
*/
import Group from './group.jsx';
import { S, fmt, pct, ASSETS } from '@ledger/core';

/* — for "no reading yet", +/− for a real one */
function lastQuarter(a) {
  if (a.lastRet === undefined) return '—';
  return (a.lastRet >= 0 ? '+' : '') + pct(a.lastRet, 1);
}

export default function ViewInvestPortfolio() {
  const d = S.der;
  const assets = S.assets || [];

  return (
    <Group route="money/markets" i={0}>
    <div className="card">
      <h3>Portfolio <span className="tag">{fmt(d.assets)}</span></h3>

      {assets.length === 0 ? (
        <div className="small muted">
          You hold no investments. Cash in a current account loses to inflation every single
          quarter — that is not a metaphor, it is arithmetic on this screen.
        </div>
      ) : (
        <table>
          <tr>
            <th>Asset</th><th className="num">Value</th><th className="num">Last qtr</th>
            <th className="num">Total P/L</th><th></th>
          </tr>
          {assets.slice().sort((a, b) => b.value - a.value).map((a) => {
            const def = ASSETS.find((x) => x.id === a.id);
            if (!def) return null;
            const pl = a.value - a.cost;
            return (
              <tr key={a.id}>
                <td>{def.name}<div className="tiny muted">{def.cls}</div></td>
                <td className="num">{fmt(a.value)}</td>
                <td className={'num ' + (a.lastRet >= 0 ? 'good' : 'bad')}>{lastQuarter(a)}</td>
                <td className={'num ' + (pl >= 0 ? 'good' : 'bad')}>{fmt(pl)}</td>
                <td className="num">
                  <button className="btn xs" data-a="sellasset" data-i={a.id} data-f="0.25">25%</button>{' '}
                  <button className="btn xs" data-a="sellasset" data-i={a.id} data-f="1">All</button>
                </td>
              </tr>
            );
          })}
        </table>
      )}

      <hr className="sep" />
      <div className="tiny muted">
        Idle cash: <b>{fmt(S.fin.cash)}</b>. Inflation is running at {pct(S.mkt.infl, 1)} a year,
        which means that number is shrinking while you read this.
      </div>
    </div>
    </Group>
  );
}
