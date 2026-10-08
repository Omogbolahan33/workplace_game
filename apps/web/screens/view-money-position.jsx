/*
  Money › Position — the second converted screen.

  Two things worth noting about this one, because they are the general case and
  the first screen did not have them:

  1. `positionStrip()` still lives in core and still returns a string. It is a
     pure readout (a four-stat grid and an exposure list — no controls), it is
     used by two screens, and it is not the screen being converted, so it is
     embedded with dangerouslySetInnerHTML rather than reimplemented here. The
     conversion rule is one screen at a time, and that means a converted screen
     may still depend on an unconverted piece; pretending otherwise would mean
     either doing everything at once or writing the same numbers twice, and
     writing the same numbers twice is how a screen and its own summary drift
     apart.

  2. The liabilities table and the borrow row only exist in some states. The
     string version built them by appending conditionally, which is exactly
     what JSX does with `&&`. The gate runs both states for that reason.

  The equity line and the minority buy-out live on Work › Business, not here,
  which is why the disabled "short of" reasoning added in §22.23 does not
  appear on this screen.

  It arranges its own sections too, and the arrangement is subtle enough to be
  worth stating. The route's groups are `Your money` (Cash & debt, Borrow) and
  `How to think about it` (What this tab is really asking), and core emits a
  group at the position of its FIRST member - gathering the rest in, wherever
  they were. `Borrow` sits below `Liabilities`, so the group carries the Borrow
  card up above it, and `Liabilities` - a card no spec names - stays where it
  was, between the two sections. That is what this looks like, and
  `.harness/react-route.js` compares it card for card against core's own
  grouping.
*/
import { S, fmt, positionStrip } from '@ledger/core';
import Group from './group.jsx';

export default function ViewMoneyPosition() {
  const debt = S.fin.debt || [];

  return (
    <>
      {/* core's own readout, verbatim: not this screen's markup to convert */}
      <div dangerouslySetInnerHTML={{ __html: positionStrip() }} />

      <Group route="money/position" i={0}>
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Cash &amp; debt</h3>
        <div className="kv"><span className="muted">Cash</span><span>{fmt(S.fin.cash)}</span></div>
        <div className="kv">
          <span className="muted">Hard currency</span>
          <span>{fmt(S.fin.usdCash * S.mkt.usd)} (${Math.round(S.fin.usdCash).toLocaleString()})</span>
        </div>
        <div className="kv"><span className="muted">Invested</span><span>{fmt(S.der.assets)}</span></div>
        {S.biz && (
          <div className="kv"><span className="muted">Business value</span><span>{fmt(S.der.biz)}</span></div>
        )}
        <div className="kv"><span className="muted">Possessions (resale)</span><span>{fmt(S.der.goods)}</span></div>
        <div className="kv">
          <span><b>Debt</b></span>
          <span className={S.der.debt > 0 ? 'bad' : ''}><b>{fmt(S.der.debt)}</b></span>
        </div>
      </div>

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Borrow <span className="tag">credit {Math.round(S.fin.credit)}/100</span></h3>
        <div className="row wrap">
          <button className="btn sm" data-a="borrow" data-k="bank">Bank loan</button>
          <button className="btn sm bad" data-a="borrow" data-k="shark">Private lender (30%/qtr)</button>
        </div>
        <details className="fold">
          <summary>How borrowing works</summary>
          <div>
            Your credit score determines whether anyone lends to you and at what rate.
            Bank lending is cheaper but requires credit and often a formal business. Private money is instant and brutal.
          </div>
        </details>
      </div>
      </Group>

      {debt.length > 0 && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Liabilities</h3>
          <table>
            <tr><th>What</th><th className="num">Balance</th><th className="num">Rate/qtr</th><th></th></tr>
            {debt.map((dt) => (
              <tr key={dt.id}>
                <td>{dt.name}</td>
                <td className="num">{fmt(dt.bal)}</td>
                <td className="num">{(dt.rate * 100).toFixed(0)}%</td>
                <td className="num"><button className="btn xs" data-a="repay" data-d={dt.id}>Repay</button></td>
              </tr>
            ))}
          </table>
          <details className="fold">
            <summary>Why repay early</summary>
            <div>Repay early from cash. A 30% quarterly informal lender is not a loan, it is a countdown.</div>
          </details>
        </div>
      )}

      <Group route="money/position" i={1}>
      <div className="card flat" style={{ marginTop: '12px' }}>
        <h3>What this tab is really asking</h3>
        <details className="fold">
          <summary>What this tab is asking</summary>
          <div>
            Every naira you spend here is a naira that is not compounding somewhere else. The game does not
            tell you the right answer — it tells you what your answer cost you, about six quarters later.
          </div>
        </details>
      </div>
      </Group>
    </>
  );
}
