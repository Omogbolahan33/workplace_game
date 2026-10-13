/*
  Engine room — the machine, as numbers.

  Four cards: the stage and what is structurally wrong, the four levers that turn
  profit into cash, the balance sheet with the P&L under it, and the conditions
  the company lives under. It is the biggest panel on Work › Business and it is
  read as much as the agenda is.

  Three things are kept exactly, because each one is a claim the game makes:

  - **The four levers are inputs, not buttons.** `data-inp` is what binds them
    (`bindInputs()` in the ui reads it), and the value each one carries is the
    company's current setting — credit terms as a percentage of 100, stock as a
    percentage, the draw in naira. Nothing here is rounded differently from the
    string version, because a slider that moves by one step between the two
    renderers would be a slider that loses a setting.
  - **The Insure button is disabled in its own success state**, and says which
    one it is in: `Insured`, `Part-insured`, or `Insure (₦x/q)` with the reason
    on the control. That was fixed in §22.23 and it is reproduced here rather
    than re-derived.
  - **`bar()` is core's painter**, used for supplier confidence and tax exposure;
    it is embedded, per the rule that a converted screen does not get its own
    opinion about what a bar looks like.
*/
import { S, UI, fmt, bar, BIZ_STAGES, machineTilesHTML } from '@ledger/core';

/* The four cards are exported separately as well as together.

   Core's grouping finds cards a level down inside a wrapper and gathers them
   into the section at the level it found them - so `The machine` is a group
   *inside* the `grid g2` here, holding these four cards directly. A route that
   arranges its own sections therefore needs the cards, not the grid: `<Group>`
   counts the .card children it is handed, and one `<ViewEngine/>` element would
   count as one member where the game has four. */

export function EngineRoomCard() {
  const b = S.biz;
  if (!b) return null;
  const st = BIZ_STAGES[b.stage] || BIZ_STAGES.startup;
  const diag = b.diag || [];
  return (
      <div className="card">
        <div className="between">
          <h3 style={{ margin: 0 }}>
            Engine room <span className={'chip ' + (b.stage === 'decline' ? 'r' : b.stage === 'scale' || b.stage === 'maturity' ? 'g' : '')}>{st.label}</span>
          </h3>
          <span className="tiny muted">Quarter {b.quarters || 0} of trading</span>
        </div>
        <div className="tiny muted" style={{ marginTop: '6px' }}>{st.note}</div>
        {diag.length ? (
          <>
            <hr className="sep" />
            {diag.slice(0, 7).map((d, i) => (
              <div key={i} className="small" style={{
                borderLeft: '2px solid ' + (d.level === 'bad' ? 'var(--bad)' : 'var(--warn)'),
                padding: '3px 0 3px 9px', marginBottom: '6px'
              }}>{d.text}</div>
            ))}
          </>
        ) : (
          <>
            <hr className="sep" />
            <div className="small" style={{ color: 'var(--good)' }}>
              Nothing structurally wrong that the numbers can see. This is rare. Enjoy it.
            </div>
          </>
        )}
      </div>

  );
}

export function LeversCard() {
  const b = S.biz;
  if (!b) return null;
  /* A range input the player drags cannot be React-controlled: the string
     version set `value` and left the DOM alone, and the ui's bindInputs() reads
     the element and writes straight into S. A controlled `value` without an
     onChange makes React treat the field as read-only and the slider stops
     working entirely - React says so in the console, which is how this was
     caught. `defaultValue` with a key on the company id gives the same result
     the string version had: initialised from state, owned by the DOM after
     that, and re-initialised when you switch company. */
  /* world-first: the levers live where they act, and each is a tile here that
     opens the same card; (i) brings the full card back */
  if (!UI.details) {
    return (
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Levers <span className="tag">take effect next quarter</span></h3>
        <div className="facerow" dangerouslySetInnerHTML={{ __html: machineTilesHTML(b) }} />
        <div className="tiny muted prose">Tap a tile, or the thing in the picture: the stock, the customers, yourself, the premises.</div>
      </div>
    );
  }
  const k = b.id || b.type;
  const rev = Math.max(1, b.revenue || 0);
  const stock = b.stockPolicy === undefined ? 0.45 : b.stockPolicy;
  return (
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Levers <span className="tag">take effect next quarter</span></h3>
        <div className="tiny muted" style={{ marginBottom: '10px' }}>
          These are the four decisions that decide whether a profitable business has money.
          Profit is an opinion. Cash is a fact, and these levers are what turn one into the other.
        </div>

        <div className="slider">
          <span>Credit terms</span>
          <input key={'cred' + k} type="range" data-inp="bizcred" min="0" max="100" step="5"
            defaultValue={Math.round((b.creditTerms || 0) * 100)} />
          <span className="mono" style={{ textAlign: 'right' }}>{Math.round((b.creditTerms || 0) * 90)} days</span>
        </div>
        <div className="tiny muted" style={{ margin: '-4px 0 9px 0' }}>
          Selling on credit raises demand by up to 22%, but the cash arrives later and some of it never arrives at all.
        </div>

        <div className="slider">
          <span>Stock depth</span>
          <input key={'stock' + k} type="range" data-inp="bizstock" min="0" max="100" step="5"
            defaultValue={Math.round(stock * 100)} />
          <span className="mono" style={{ textAlign: 'right' }}>
            {stock < 0.25 ? 'Lean' : stock < 0.5 ? 'Balanced' : stock < 0.75 ? 'Deep' : 'Very deep'}
          </span>
        </div>
        <div className="tiny muted" style={{ margin: '-4px 0 9px 0' }}>
          Under-stock and you turn customers away with demand in the room. Over-stock and your cash is on a shelf, shrinking.
        </div>

        <div className="slider">
          <span>Owner draw</span>
          <input key={'draw' + k} type="range" data-inp="bizdraw" min="0"
            max={Math.max(1000000, Math.round(rev * 0.5))}
            step={Math.max(50000, Math.round(rev * 0.01))} defaultValue={Math.round(b.draw || 0)} />
          <span className="mono" style={{ textAlign: 'right' }}>{fmt(Math.round(b.draw || 0))}</span>
        </div>
        <div className="tiny muted" style={{ margin: '-4px 0 9px 0' }}>
          Per quarter, if the company can fund it. Last quarter it paid out {fmt(b.drawnQ || 0)}.
        </div>

        <div className="row wrap" style={{ marginTop: '4px' }}>
          <button className="btn sm" data-a="bizinsure"
            disabled={!!b.insured} aria-disabled={b.insured ? 'true' : undefined}
            title={b.insured ? (b.insured === true
              ? 'This company is fully insured already'
              : 'It is part-insured; the policy tops up at the next quarter') : undefined}>
            {b.insured === true ? 'Insured'
              : b.insured ? 'Part-insured'
                : 'Insure (' + fmt(Math.round(Math.max(180000, rev * 0.012))) + '/q)'}
          </button>
          <button className="btn sm" data-a="bizacct">
            Engage an accountant ({fmt(Math.round(Math.max(120000, rev * 0.008)))}/q)
          </button>
          <button className="btn sm" data-a="bizauto">Invest in equipment</button>
        </div>
        <div className="tiny muted" style={{ marginTop: '8px' }}>
          Automation {Math.round(b.auto || 0)}/100 — raises output per person and improves stock control.{' '}
          Compliance {Math.round(b.compliance || 40)}/100 — this is what an assessment will be judged against.
        </div>
      </div>

  );
}

export function PositionCard() {
  const b = S.biz;
  if (!b) return null;
  const rev = Math.max(1, b.revenue || 0);
  const equip = Math.max(0, b.capex || 0);
  const assets = Math.max(0, b.cash || 0) + (b.recv || 0) + (b.inventory || 0) + equip;
  const liabs = (b.payable || 0) + (b.arrears || 0);
  const cashRun = (b.cash || 0) > 0 ? ((b.cash || 0) / Math.max(1, (b.opex || 0))).toFixed(1) : '0';
  return (
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Position</h3>
        <div className="tiny muted" style={{ marginBottom: '8px' }}>
          Balance sheet, roughly. The gap between the top half and the bottom half is what you actually own.
        </div>
        <div className="kv"><span className="muted">Cash</span><span className={b.cash < 0 ? 'bad' : ''}>{fmt(Math.round(b.cash || 0))}</span></div>
        <div className="kv"><span className="muted">Owed by customers</span><span>{fmt(Math.round(b.recv || 0))}</span></div>
        <div className="kv"><span className="muted">Stock on hand</span><span>{fmt(Math.round(b.inventory || 0))}</span></div>
        <div className="kv"><span className="muted">Equipment &amp; fit-out</span><span>{fmt(equip)}</span></div>
        <div className="kv"><span><b>Total</b></span><span><b>{fmt(Math.round(assets - liabs))}</b></span></div>
        <hr className="sep" />
        <div className="kv">
          <span className="muted">Owed to suppliers</span>
          <span className={(b.payable || 0) > rev * 0.8 ? 'bad' : ''}>{fmt(Math.round(b.payable || 0))}</span>
        </div>
        <div className="kv">
          <span className="muted">Wages in arrears</span>
          <span className={(b.arrears || 0) > 0 ? 'bad' : ''}>{fmt(Math.round(b.arrears || 0))}</span>
        </div>
        <hr className="sep" />
        <div className="kv"><span className="muted">Revenue</span><span>{fmt(b.revenue)}</span></div>
        <div className="kv"><span className="muted">Cost of goods</span><span>{fmt(b.cogs)}</span></div>
        <div className="kv"><span className="muted">Overheads</span><span>{fmt(b.opex)}</span></div>
        <div className="kv">
          <span><b>Profit</b></span>
          <span className={b.profit >= 0 ? 'good' : 'bad'}><b>{fmt(b.profit)}</b></span>
        </div>
        <div className="tiny muted" style={{ marginTop: '8px' }}>
          Written off as bad debt this quarter: {fmt(b.badDebtQ || 0)}. Lost to shrinkage and spoilage: {fmt(b.shrinkQ || 0)}.
        </div>
        <div className="tiny muted" style={{ marginTop: '5px' }}>
          At current overheads the company has <b>{cashRun}</b> quarters of cash.
        </div>
      </div>

  );
}

export function ConditionsCard() {
  const b = S.biz;
  /* world-first: every line of it is on a card the Levers tiles open */
  if (!b || !UI.details) return null;
  const L = b.lease || {};
  const sConf = b.supplierConf === undefined ? 70 : b.supplierConf;
  return (
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Conditions</h3>
        <div className="kv">
          <span className="muted">Premises</span>
          <span>{fmt(Math.round(L.rent || 0))}/mo · {L.end > 0 ? L.end + 'q left on lease' : 'RENEWAL DUE'}</span>
        </div>
        <div className="kv">
          <span className="muted">Supplier confidence</span>
          <span dangerouslySetInnerHTML={{ __html: bar(sConf, 100, sConf > 60 ? 'var(--good)' : sConf > 35 ? 'var(--warn)' : 'var(--bad)') }} />
        </div>
        <div className="kv"><span className="muted">Supplier terms</span><span>{b.supplierDays || 30} days</span></div>
        <div style={{ marginTop: '8px' }}>
          <button className="btn xs" data-a="supplnego">Renegotiate supplier terms</button>
        </div>
        <div className="tiny muted" style={{ marginTop: '6px' }}>
          Your suppliers finance most of the stock you sell. Longer terms mean more stock on the shelf without
          cash; the relationship is what buys you those terms, and it is spent by stretching them.
        </div>
        <div className="kv">
          <span className="muted">Tax exposure</span>
          <span dangerouslySetInnerHTML={{
            __html: bar(b.taxRisk || 0, 100, (b.taxRisk || 0) > 65 ? 'var(--bad)' : (b.taxRisk || 0) > 35 ? 'var(--warn)' : 'var(--good)')
          }} />
        </div>
        <div className="kv">
          <span className="muted">Insurance</span>
          <span>{b.insured === true ? 'Full' : b.insured ? 'Partial' : <span className="bad">None</span>}</span>
        </div>
        {b.keyClient ? (
          <div className="kv">
            <span className="muted">Concentration</span>
            <span className={b.keyClient.share > 0.3 ? 'bad' : ''}>
              {b.keyClient.name} · {Math.round(b.keyClient.share * 100)}% of revenue
            </span>
          </div>
        ) : null}
        {(b.contracts || []).map((c, i) => (
          <div className="kv" key={'c' + i}>
            <span className="muted">Contract</span>
            <span>{c.client || 'Client'} · {c.turns}q left</span>
          </div>
        ))}
        {(b.incidents || []).map((it, i) => (
          <div className="kv" key={'i' + i}>
            <span className="muted">Lingering</span>
            <span className="bad">{it.name} ({it.turns}q)</span>
          </div>
        ))}
        <div className="kv"><span className="muted">Product lines</span><span>{b.products || 1}</span></div>
        <div className="kv"><span className="muted">Locations</span><span>{b.locations}</span></div>
      </div>
  );
}

/* the screen as core drew it: the four cards in one two-column grid */
export default function ViewEngine() {
  if (!S.biz) return null;
  return (
    <div className="grid g2">
      <EngineRoomCard />
      <LeversCard />
      <PositionCard />
      <ConditionsCard />
    </div>
  );
}
