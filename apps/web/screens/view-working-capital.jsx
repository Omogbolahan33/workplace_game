/*
  Work › Business — "Working capital".

  The card that explains why a growing company runs out of money: every naira of
  new revenue is financed first, as stock before it sells and as a receivable
  after it does. The reading is the cash conversion cycle, the bill for growth,
  and the honest warning under it.

  The three style decisions the string version made inline are kept exactly,
  because they are the difference between a warning and a decoration: the "bill
  for growth" box turns amber when the bill is more than half your cash, and the
  "customers are being served off a shelf you never paid for" line only appears
  below 90% funded. Both thresholds are core's readings; neither is restated
  here as a different number.
*/
import { S, UI, fmt, cccOf, recentGrowth, growthBill, wcCycleInner } from '@ledger/core';

export default function ViewWorkingCapital() {
  const b = S.biz;
  if (!b) return null;

  const c = cccOf(b);
  const g = recentGrowth(b);
  const bill = growthBill(b, Math.max(0.10, g > 0 ? g : 0.10));
  const funded = b.wcFunded === undefined ? 1 : b.wcFunded;
  const tight = bill > (b.cash || 0) * 0.5;

  return (
    <div className="card">
      <h3>Working capital <span className="tag">CCC {c.ccc} days</span></h3>
      {/* world-first: the cycle drawn as time; the rows with the explanations shown */}
      {!UI.details ? <div className="wcpic" dangerouslySetInnerHTML={{ __html: wcCycleInner(b) }} /> : null}
      {!UI.details ? null : <>
        <div className="tiny muted" style={{ marginBottom: '10px' }}>
          Every naira of new revenue has to be financed first — as stock before it sells, as a receivable after
          it does. That cash leaves quarters before the profit arrives, and it does not appear on the P&amp;L.
        </div>
        <div className="kv">
          <span className="muted">Owed by customers · DSO</span>
          <span className="mono">{fmt(Math.round(b.recv || 0))} · {c.dso}d</span>
        </div>
        <div className="kv">
          <span className="muted">Sitting in stock · DIO</span>
          <span className="mono">{fmt(Math.round(b.inventory || 0))} · {c.dio}d</span>
        </div>
        <div className="kv">
          <span className="muted">Owed to suppliers · DPO</span>
          <span className="mono good">−{fmt(Math.round(b.payable || 0))} · {c.dpo}d</span>
        </div>
        <hr className="sep" />
      </>}
      <div className="kv">
        <span><b>Cash stuck in the cycle</b></span>
        <span className={'mono ' + (c.tied > (b.cash || 0) ? 'bad' : '')}><b>{fmt(c.tied)}</b></span>
      </div>
      <div className="tiny muted" style={{ margin: '-2px 0 9px' }}>
        Your cash on hand is {fmt(Math.round(b.cash || 0))}.
      </div>

      <div style={{
        border: '1px solid ' + (tight ? 'rgba(255,159,67,.45)' : 'var(--line)'),
        borderRadius: '9px', padding: '10px', marginBottom: '8px',
        background: tight ? 'rgba(255,159,67,.06)' : 'transparent'
      }}>
        <div className="tiny muted">The bill for growth</div>
        <div style={{ fontSize: '17px', fontWeight: 650, margin: '2px 0 3px' }}>{fmt(bill)}</div>
        <div className="tiny muted">
          Growing another {Math.round(Math.max(0.10, g > 0 ? g : 0.10) * 100)}% next quarter costs this much in
          cash <b>before any of it comes back</b>.
          {tight ? ' You do not have it. Growth is what will kill this business, not losses.' : ''}
        </div>
      </div>

      {funded < 0.9 ? (
        <div className="tutorial bad" style={{
          borderColor: 'rgba(255,95,109,.4)', color: '#ffb3b8', background: 'rgba(255,95,109,.08)'
        }}>
          You could only fund {Math.round(funded * 100)}% of the stock this business needs. Customers are being
          served off a shelf you never paid for — and some of them are going elsewhere.
        </div>
      ) : null}

      {c.dpo > 45 ? (
        <div className="tiny muted" style={{ marginTop: '7px' }}>
          You are {c.dpo} days behind with suppliers. That is a loan they did not agree to, and supplier
          confidence is {Math.round(b.supplierConf === undefined ? 70 : b.supplierConf)}/100.
        </div>
      ) : null}
    </div>
  );
}
