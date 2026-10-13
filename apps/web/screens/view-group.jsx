/*
  Money › Group — the holdco view: what the group earned, where the cash and the
  debt actually sit, and the three ways money moves between the companies.

  This screen is a **consolidation**: nine of its rows are arithmetic across
  every company the player owns, and the cells are built by core's own
  `_gcell()`/`_glabel()` — right-aligned, negative figures in red, group totals
  ruled off. Re-implementing those cells in JSX would be re-typing a tax
  calculation in a second place, so the table rows are embedded as the strings
  core builds them from (`dangerouslySetInnerHTML`), which is the same way
  `positionStrip()` is embedded on Money › Position. Everything around them —
  the cards, the headings, the controls, the prose — is a component.

  Three of the cards carry controls with **stated reasons** when they are
  disabled, and all of them are kept verbatim: a dividend can only be declared
  out of distributable reserves and the button says what it can pay up; the
  lend/fund buttons say which company has no cash; the two management-charge
  steppers are disabled at the ends of the 0–15% rails and each says why — "the
  charge is already 0%" and "15% is the ceiling for an arms-length charge". A
  disabled control with no reason is indistinguishable from a missing feature
  (§22.23), and on this screen four of the six disabled states are *correct*
  positions rather than gaps.

  The group obligations card is emitted only when the group has any, and the
  section around it is emitted only when the card is: `Group` renders nothing
  when it has no members, so the one-company run shows two sections and not
  three, exactly as core's grouping does.

  **The stray close tag in the original is not reproduced.** `viewGroup()`
  closes the first card inside the "one company is not a group" branch and closes
  it again at the end of the consolidation block, so on a single-company run the
  consolidation table lands *outside* the card it belongs to — an extra `</div>`
  a browser silently swallows. The port nests the table where the code plainly
  means it to go. What a player reads, in what order, is unchanged, and that is
  the line a conversion may not cross.
*/
import { Fragment } from 'react';
import Group from './group.jsx';
import {
  S, fmt, esc, clamp, _gcell, _glabel, groupAccounts, holdcoName, entityName,
  intercoOwed, intercoUpstream, groupCovenantStrip, groupCrossDefault,
  WHT_RATE, IC_RATE, ARMS_LENGTH, UI, groupPLInner, groupCashInner
} from '@ledger/core';

/* ---- the consolidation table, built the way core builds it -------------- */
function plRows(g, subs) {
  const cols = subs.map((r) =>
    '<th style="text-align:right;padding:4px 7px;font-weight:600">' + esc(r.name) + '</th>').join('');
  const line = (label, key, strong) =>
    '<tr>' + _glabel(label, strong) + subs.map((r) => _gcell(r[key], strong)).join('') + _gcell(g[key], strong) + '</tr>';
  return '<tr>' + _glabel('This quarter') + cols +
    '<th style="text-align:right;padding:4px 7px;border-left:1px solid var(--line2)">Group</th></tr>' +
    line('Revenue', 'rev') +
    line('Cost of sales', 'cogs') +
    line('Gross profit', 'gross') +
    line('Overheads (incl. management charge)', 'opex') +
    line('EBITDA', 'ebitda', true) +
    line('Depreciation', 'dep') +
    line('Interest', 'int') +
    line('Tax', 'tax') +
    line('Net profit', 'net', true);
}

function balanceRows(g, subs) {
  const cell = (v, style) => '<td style="' + style + '">' + v + '</td>';
  let h = '<tr>' + cell('Entity', 'padding:4px 7px;color:var(--dim)') +
    cell('Cash', 'text-align:right;padding:4px 7px;color:var(--dim)') +
    cell('Debt', 'text-align:right;padding:4px 7px;color:var(--dim)') +
    cell('Reserves', 'text-align:right;padding:4px 7px;color:var(--dim)') +
    cell('Yours', 'text-align:right;padding:4px 7px;color:var(--dim)') +
    cell('Can pay up', 'text-align:right;padding:4px 7px;color:var(--dim)') + '</tr>';

  h += '<tr>' + cell('<b>' + esc(holdcoName()) + '</b>', 'padding:4px 7px') +
    _gcell(g.holdcoCash) + _gcell(g.holdcoDebt) + _gcell(g.holdcoRetained) +
    cell('100%', 'text-align:right;padding:4px 7px') +
    cell('—', 'text-align:right;padding:4px 7px;color:var(--dim2)') + '</tr>';

  subs.forEach((r) => {
    h += '<tr>' + cell(esc(r.name), 'padding:4px 7px') +
      _gcell(r.cash) + _gcell(r.debt) + _gcell(r.retained) +
      cell(Math.round(r.own) + '%', 'text-align:right;padding:4px 7px') +
      cell(r.cap > 0 ? fmt(r.cap) : (r.note ? 'blocked' : '—'),
        'text-align:right;padding:4px 7px;' + (r.cap > 0 ? 'color:var(--good)' : 'color:var(--dim2)')) + '</tr>';
  });

  h += '<tr>' + _glabel('Group', true) + _gcell(g.groupCash, true) + _gcell(g.groupDebt, true) +
    _gcell(g.subRetained + g.holdcoRetained, true) +
    '<td style="border-top:1px solid var(--line2)"></td>' +
    '<td style="border-top:1px solid var(--line2)"></td></tr>';
  return h;
}

function HoldcoCard({ g, subs }) {
  return (
    <div className="card">
      <h3>{holdcoName()}</h3>
      <details className="fold">
        <summary>What a group is</summary>
        <div>
        A company's profit is not your money. It belongs to the company until the board declares it,
        and when it is declared every holder is paid pro rata — including the people whose names are on the register beside yours.
        This view is where you decide how much cash to lift, how to lift it, and what it costs you.
        </div>
      </details>

      {subs.length < 2 ? (
        <div className="tiny muted">
          One company is not a group. Once you own more than one, consolidation,
          upstream dividends, intercompany funding and cross-default all start to matter.
        </div>
      ) : null}

      {subs.length ? (
        <>
          {/* world-first: the group's quarter as a waterfall, each company's share of it */}
          {!UI.details ? <div className="gpic" dangerouslySetInnerHTML={{ __html: groupPLInner(g, subs) }} /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '4px' }}
                dangerouslySetInnerHTML={{ __html: plRows(g, subs) }} />
            </div>
          )}

          <div className="row wrap" style={{ gap: '14px', marginTop: '9px' }}>
            <span className="tiny muted">
              Trailing twelve months: revenue <b style={{ color: 'var(--txt)' }}>{fmt(g.revTTM)}</b>, EBITDA{' '}
              <b style={{ color: 'var(--txt)' }}>{fmt(g.ebitdaTTM)}</b>
            </span>
            <span className="tiny muted">
              Attributable to you <b style={{ color: 'var(--txt)' }}>{fmt(g.attributable)}</b>
              {Math.abs(g.minorityNet) > 1 ? (
                <> · minority <b style={{ color: 'var(--warn)' }}>{fmt(g.minorityNet)}</b></>
              ) : null}
            </span>
          </div>

          {g.elimMgmt > 0 ? (
            <div className="tiny muted" style={{ marginTop: '5px' }}>
              {fmt(g.elimMgmt)} of management charges are eliminated on consolidation —
              income at the holdco, cost in the subsidiaries, never group profit in the first place.
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function CashDebtCard({ g, subs }) {
  const blocked = subs.filter((r) => r.note && r.cap <= 0);
  return (
    <div className="card">
      <h3>Cash, debt and reserves</h3>
      {/* world-first: each company as three bars to one scale, what is yours and what it can pay up */}
      {!UI.details ? <div className="gpic" dangerouslySetInnerHTML={{ __html: groupCashInner(g, subs) }} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}
            dangerouslySetInnerHTML={{ __html: balanceRows(g, subs) }} />
        </div>
      )}

      <div className="row wrap" style={{ gap: '8px', marginTop: '9px' }}>
        <span className={'chip ' + (g.netCash >= 0 ? 'g' : 'r')}>
          {g.netCash >= 0 ? 'Net cash ' : 'Net debt '}{fmt(Math.abs(g.netCash))}
        </span>
        {g.leverage !== null ? (
          <span className={'chip ' + (g.leverage > 3 ? 'r' : g.leverage > 2.6 ? 'y' : 'g')}>
            Group leverage {g.leverage.toFixed(2)}x
          </span>
        ) : null}
      </div>

      {blocked.length ? (
        <>
          <hr className="sep" />
          {blocked.map((r) => (
            <div className="tiny" key={r.id} style={{ marginBottom: '5px' }}><b>{r.name}</b> — {r.note}</div>
          ))}
        </>
      ) : null}
    </div>
  );
}

function TakeMoneyOutCard({ g, subs }) {
  return (
    <div className="card">
      <h3>Getting cash out of a subsidiary</h3>
      <details className="fold">
        <summary>The two doors</summary>
        <div>
        Two doors, and they are not equivalent.{' '}
        <b style={{ color: 'var(--txt)' }}>A dividend</b> is paid out of reserves, is taxed at {Math.round(WHT_RATE * 100)}% on the way up,
        pays the other shareholders their share, and cannot be undone.{' '}
        <b style={{ color: 'var(--txt)' }}>An upstream loan</b> is not taxed, pays nobody else, and can be repaid —
        but it is debt owed by a company that other people have lent money to, and every lender reads it as you stripping the business.
        </div>
      </details>

      {subs.map((r) => (
        <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '9px', marginBottom: '8px' }}>
          <div className="between"><b>{r.name}</b><span className="tiny muted">you own {Math.round(r.own)}%</span></div>
          <div className="tiny muted" style={{ margin: '3px 0 7px' }}>
            Reserves {fmt(r.retained)} · cash {fmt(r.cash)} · can pay up {fmt(r.cap)}
          </div>
          <div className="row wrap" style={{ gap: '5px' }}>
            <button className="btn xs primary" data-a="grpdiv" data-b={r.id}
              disabled={r.cap <= 0} aria-disabled={r.cap <= 0 ? 'true' : undefined}
              title={r.cap <= 0
                ? 'Nothing to declare: after what it owes, this company can pay up ' + fmt(r.cap)
                : undefined}>
              Declare dividend
            </button>
            <button className="btn xs" data-a="grploan" data-b={r.id} data-to="holdco"
              disabled={!(r.cash > 0)} aria-disabled={!(r.cash > 0) ? 'true' : undefined}
              title={!(r.cash > 0) ? 'This company has no cash to lend' : undefined}>
              Lend up to holdco
            </button>
            {g.holdcoCash > 0 ? (
              <button className="btn xs" data-a="grploan" data-b="holdco" data-to={r.id}>Fund from holdco</button>
            ) : null}
          </div>
        </div>
      ))}

      {subs.length > 1 ? (
        <div className="tiny muted" style={{ marginTop: '4px' }}>
          Subsidiary to subsidiary:{' '}
          {subs.map((r, i) => (
            <span key={r.id}>
              {i ? ' ' : null}
              <button className="btn xs" data-a="grpdiv" data-b={r.id} style={{ opacity: '.5' }}
                disabled aria-disabled="true"
                title="Subsidiary-to-subsidiary funding comes later — for now money moves through the holdco">
                {r.name}
              </button>
            </span>
          ))}
          {' — cross-funding comes later; for now money moves through the holdco.'}
        </div>
      ) : null}
    </div>
  );
}

function IntercompanyCard({ g }) {
  return (
    <div className="card">
      <h3>Intercompany balances</h3>
      {!g.loans.length ? (
        <div className="tiny muted">
          Nothing owed between group companies. Clean, and possibly inefficient —
          cash sitting in a subsidiary that another one needs is a decision too.
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 7px', color: 'var(--dim)' }}>Owed by</td>
                <td style={{ padding: '4px 7px', color: 'var(--dim)' }}>To</td>
                <td style={{ textAlign: 'right', padding: '4px 7px', color: 'var(--dim)' }}>Balance</td>
                <td style={{ textAlign: 'right', padding: '4px 7px', color: 'var(--dim)' }}>Interest / q</td>
                <td />
              </tr>
              {g.loans.map((L) => (
                <Fragment key={L.id}>
                  <tr>
                    <td style={{ padding: '4px 7px' }}>{entityName(L.to)}</td>
                    <td style={{ padding: '4px 7px' }}>{entityName(L.from)}</td>
                    <td style={{ textAlign: 'right', padding: '4px 7px' }}>{fmt(Math.round(L.amt))}</td>
                    <td style={{ textAlign: 'right', padding: '4px 7px' }}>{fmt(Math.round(Math.round(L.amt * IC_RATE)))}</td>
                    <td style={{ textAlign: 'right', padding: '4px 7px' }}>
                      <button className="btn xs" data-a="grprepay" data-l={L.id}>Repay</button>
                    </td>
                  </tr>
                  {L.to === 'holdco' ? (
                    <tr>
                      <td colSpan={5} className="tiny" style={{ padding: '0 7px 6px', color: 'var(--warn)' }}>
                        Upstream. A lender to {entityName(L.to)} will treat this as you taking cash out from under them.
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="tiny muted" style={{ marginTop: '7px' }}>
            Total owed across the group {fmt(intercoOwed())}
            {', of which '}{fmt(intercoUpstream())}{' has moved up to the holdco rather than out as dividend.'}
          </div>
        </>
      )}
    </div>
  );
}

function MgmtChargesCard({ g, subs }) {
  const risk = g.tpRisk;
  return (
    <div className="card">
      <h3>Management charges</h3>
      <details className="fold">
        <summary>How the charge works</summary>
        <div>
        The holdco can charge each subsidiary for the work it does.
        The charge is deductible in the subsidiary and taxable at the holdco, so it moves profit to where the tax is lower.
        Anything above about {ARMS_LENGTH}% of revenue is more than an unrelated party would pay, and that is a position you have to defend.
        </div>
      </details>

      {subs.map((r) => {
        const f = r.mgmtPct;
        return (
          <div className="between" key={r.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <b>{r.name}</b>
              <div className="tiny muted">
                {f > 0 ? fmt(r.mgmtFee) + ' this quarter (' + f + '% of revenue)' : 'no charge'}
                {f > ARMS_LENGTH ? <> · <span style={{ color: 'var(--warn)' }}>above arm's length</span></> : null}
              </div>
            </div>
            <div className="row" style={{ gap: '4px' }}>
              <button className="btn xs" data-a="grpmgmt" data-b={r.id} data-d="-1"
                disabled={!(f > 0)} aria-disabled={!(f > 0) ? 'true' : undefined}
                title={!(f > 0) ? 'The charge is already 0% \u2014 there is nothing to reduce' : undefined}>
                {'\u2212'}
              </button>
              <span style={{ minWidth: '34px', textAlign: 'center', fontSize: '13px' }}>{f}%</span>
              <button className="btn xs" data-a="grpmgmt" data-b={r.id} data-d="1"
                disabled={!(f < 15)} aria-disabled={!(f < 15) ? 'true' : undefined}
                title={!(f < 15) ? '15% is the ceiling for an arms-length charge; above that it is the tax office asking questions' : undefined}>
                +
              </button>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: '9px' }}>
        <div className="tiny muted">Transfer-pricing exposure</div>
        <div style={{ height: '7px', background: 'var(--panel3)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
          <div style={{
            height: '100%', width: clamp(risk / 140 * 100, 0, 100) + '%',
            background: risk > 100 ? 'var(--bad)' : risk > 70 ? 'var(--warn)' : 'var(--good)'
          }} />
        </div>
        <div className="tiny muted" style={{ marginTop: '4px' }}>
          {risk <= 0 ? 'Nothing on the charge sheet. The structure is unremarkable.'
            : risk > 100 ? 'This is past defensible. Expect an assessment, penalties and interest on top.'
              : risk > 70 ? 'Visible. An auditor who picks this file will not struggle to make a case.'
                : 'Modest, and getting smaller if you leave it alone.'}
        </div>
      </div>
    </div>
  );
}

function GroupObligationsCard() {
  const strip = groupCovenantStrip();
  const xd = groupCrossDefault();
  return (
    <div className="card">
      <h3>Group obligations</h3>
      {strip.map((c, i) => (
        <div className="between" key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
          <div>
            <b>{c.label}</b>
            {c.detail ? <div className="tiny muted">{c.detail}</div> : null}
          </div>
          <div className="row" style={{ gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>{c.actual}</span>
            {c.limit !== '—' ? (
              <span className={'chip ' + (c.ok ? (c.tight ? 'y' : 'g') : 'r')}>limit {c.limit}</span>
            ) : null}
          </div>
        </div>
      ))}
      {xd ? (
        <div className="tiny" style={{ marginTop: '8px', color: 'var(--bad)' }}>
          Cross-default is live. A breach in one subsidiary is a breach of every facility in the group.
          Fixing the breached company is now the only thing that matters this quarter.
        </div>
      ) : null}
    </div>
  );
}

export default function ViewGroup() {
  const g = groupAccounts();
  const subs = g.rows;

  return (
    <>
      <Group route="money/group" i={0}>
        <HoldcoCard g={g} subs={subs} />
        <CashDebtCard g={g} subs={subs} />
      </Group>
      <Group route="money/group" i={1}>
        <TakeMoneyOutCard g={g} subs={subs} />
        <IntercompanyCard g={g} />
        <MgmtChargesCard g={g} subs={subs} />
      </Group>
      {/* emitted only when the group has obligations: core does not emit an empty
          section and `Group` renders nothing when it has no members */}
      <Group route="money/group" i={2}>
        {groupCovenantStrip().length ? <GroupObligationsCard /> : null}
      </Group>
    </>
  );
}
