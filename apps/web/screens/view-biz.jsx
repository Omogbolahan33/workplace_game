/*
  Testco — the company itself, and everything you do to it.

  Two states, and the first one is the door into the game:

  - **No company.** Ten company types with their cost, their margin, their
    labour, their regulatory risk, and two ways in per type: `Start` (disabled
    with the shortfall stated on the control) and `With partner` — which is
    never disabled by cash, because covering a gap you cannot cover is exactly
    what a partner is for. Above them, when the cheapest company is out of
    reach, the notice that names the shortfall *and hands over the two routes
    that close it* (§22.23: a disabled control with no stated reason is
    indistinguishable from a missing feature; naming a route is not the same as
    opening it).
  - **A company.** The company card, the operations card with the four
    marketing/quality levers, the people table, the candidates, the partner, the
    minority holders and the track record.

  Like `view-engine.jsx`, the cards are exported individually as well as
  together: `The company` section in the route's spec holds the company card,
  the operations card, the partnerships card and the track record, and `The
  people` holds the people card and the candidates. A `<Group>` counts the cards
  it is handed, so the route needs the cards, not the panel.

  **One defect fixed here, deliberately.** The string version closes its layout
  grid early and then opens the hiring column *outside* it — an extra `</div>`
  that the browser silently ignores, so the right-hand column renders full width
  underneath instead of beside. The column is nested where its own comment says
  it goes (`// right column: hiring, partner`). Re-nesting is allowed; changing a
  word the player reads is not, and none changed.
*/
import {
  S, fmt, esc, pct, bar, BIZ, TRAITS, bizValue, startBizCost, priceBand,
  expandCost, ownerTime, staffMonthly, marketSalary, buyoutExternal, dateLabel, bizTypeTileHTML, UI, staffStripBody
} from '@ledger/core';

/* --------------------------------------------------------------------------
   No company yet: the door
   -------------------------------------------------------------------------- */
export function StartCompanyCard() {
  const cheapest = Math.min.apply(null, BIZ.map((t) => startBizCost(t.id)));
  const short = S.fin.cash < cheapest;

  return (
    <div className="card">
      <h3>Start a company <span className="tag">cash {fmt(S.fin.cash)}</span></h3>
      <div className="small muted prose" style={{ marginBottom: '12px' }}>
        Each of these is a different machine. They differ in how much capital they need, how thin the margin
        is, how fast they can grow, and how much of your life they will consume. Pick the one that matches the
        balance sheet you actually have, not the one that sounds impressive.
      </div>

      {short ? (
        <div className="tutorial" style={{ borderColor: 'rgba(255,159,67,.45)', color: '#ffcda0', background: 'rgba(255,159,67,.07)' }}>
          <b>None of these is within reach yet.</b> The cheapest is {fmt(cheapest)} and you have{' '}
          {fmt(S.fin.cash)} — short by <b>{fmt(cheapest - S.fin.cash)}</b>.<br />
          Two ways in. Earn it: work, or take a deal. Or bring someone in:{' '}
          <b>With partner</b> is open on every one of these at any price, because covering a gap
          you cannot cover is exactly what a partner is for — and it costs you a share of
          everything, forever.
          <div className="row wrap" style={{ gap: '6px', marginTop: '9px' }}>
            <button className="btn sm primary" data-a="goto" data-t="work" data-s="career">Work › Career — earn it</button>
            <button className="btn sm" data-a="goto" data-t="money" data-s="deals">Money › Deals — borrow or sell</button>
          </div>
        </div>
      ) : null}

      {/* each kind of company as a picture tile - core's tile, the same one the
          string path draws */}
      <div className="grid g2" dangerouslySetInnerHTML={{ __html: BIZ.map((t) => bizTypeTileHTML(t)).join('') }} />

      <div className="tutorial">
        Bootstrapping note: whatever you start with, keep at least six months of personal expenses OUTSIDE
        the business. Most small companies do not die from a bad idea; they die from a good idea with no
        working capital.
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   A company: the cards
   -------------------------------------------------------------------------- */
export function CompanyCard() {
  const b = S.biz; if (!b) return null;
  const T = BIZ.find((x) => x.id === b.type);
  return (
    <div className="card">
      <h3>{b.name} <span className="tag">{T.name} · {b.formal ? 'Registered' : 'Informal'}</span></h3>
      <div className="grid g4" style={{ marginBottom: '10px' }}>
        <div><div className="tiny muted">Revenue</div><div className="mid">{fmt(b.revenue)}</div></div>
        <div><div className="tiny muted">Profit</div><div className={'mid ' + (b.profit >= 0 ? 'good' : 'bad')}>{fmt(b.profit)}</div></div>
        <div><div className="tiny muted">Cash in co.</div><div className={'mid ' + (b.cash >= 0 ? '' : 'bad')}>{fmt(b.cash)}</div></div>
        <div><div className="tiny muted">Valuation</div><div className="mid">{fmt(bizValue())}</div></div>
      </div>
      <div className="kv"><span className="muted">Units sold</span><span>{Math.round(b.units)}</span></div>
      <div className="kv"><span className="muted">Capacity</span><span>{Math.round(b.capacity)}</span></div>
      <div className="kv"><span className="muted">Demand at current price</span><span>{Math.round(b.demand)}</span></div>
      <div className="kv"><span className="muted">Locations</span><span>{b.locations}</span></div>
      <div className="kv"><span className="muted">Reputation</span><span>{Math.round(b.rep)}/100</span></div>
      <div className="kv"><span className="muted">Your equity</span><span>{b.equity}%</span></div>
      {b.cash < 0 ? (
        <div className="tutorial bad" style={{ borderColor: 'rgba(255,95,109,.4)', color: '#ffb3b8', background: 'rgba(255,95,109,.08)' }}>
          The company is cash-negative. It cannot buy stock, it turns customers away, and its reputation is
          falling every quarter it stays this way. Inject capital or cut costs now.
        </div>
      ) : null}
      {b.demand > b.capacity * 1.25 ? (
        <div className="tutorial">
          Demand is outrunning capacity. You are leaving money on the table — hire, add equipment, or raise prices.
        </div>
      ) : null}
      {b.capacity > b.demand * 1.6 && b.capacity > 40 ? (
        <div className="tutorial">
          You have significant idle capacity. You are paying for output nobody is buying. Lower prices,
          market harder, or cut headcount.
        </div>
      ) : null}
      {(b.notes || []).length ? (
        <div className="tiny muted" style={{ marginTop: '8px' }}>
          {b.notes.map((n, i) => <span key={i}>{i ? <br /> : null}{n}</span>)}
        </div>
      ) : null}
    </div>
  );
}

export function OperationsCard() {
  const b = S.biz; if (!b) return null;
  const T = BIZ.find((x) => x.id === b.type);
  const band = priceBand(b);
  const mem = b.discountMemory || 0;
  /* uncontrolled on purpose - the same three range inputs as the engine room,
     and the same reason: the player drags them and bindInputs() reads the DOM */
  const k = b.id || b.type;
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Operations</h3>
      <div className="slider">
        <span>Price</span>
        <input key={'price' + k} type="range" data-inp="bizprice" min="60" max="160" step="2"
          defaultValue={Math.round(b.priceIdx * 100)} />
        <span className="mono" style={{ textAlign: 'right' }}>{(b.priceIdx * 100).toFixed(0)}%</span>
      </div>
      <div className="tiny muted" style={{ margin: '-4px 0 10px 0' }}>
        Demand elasticity for this sector is {T.elasticity.toFixed(1)}.{' '}
        {T.elasticity > 1.3 ? 'Customers are price-sensitive here.' : 'Customers here are relatively insensitive to price.'}
        <br />Your positioning (<b>{Math.round(b.positioning === undefined ? 45 : b.positioning)}/100</b>) earns you a band of{' '}
        <b>{Math.round(band.lo * 100)}–{Math.round(band.hi * 100)}%</b> of list. Inside it, price behaves as above.
        Outside it, you are making a claim this business has not earned.
        {mem > 0.15 ? (
          <>
            <br /><span className="warn">
              The market has learned to wait for your discounts ({Math.round(mem * 100)}%). Putting the price
              back up will cost more than the cuts ever bought.
            </span>
          </>
        ) : null}
      </div>

      <div className="slider">
        <span>Marketing</span>
        <input key={'mark' + k} type="range" data-inp="bizmark" min="0" max="2000000" step="25000"
          defaultValue={b.marketing} />
        <span className="mono" style={{ textAlign: 'right' }}>{fmt(b.marketing)}</span>
      </div>
      <div className="tiny muted" style={{ margin: '-4px 0 10px 0' }}>
        You are buying customers, not demand. Each one currently costs about <b>{fmt(b.cacQ || 0)}</b> to
        acquire, and that rises as you fish out the market. You keep <b>{Math.round((1 - (b.churnQ || 0)) * 100)}%</b> of
        them a quarter
        {b.referredQ > 0 ? ', and ' : '.'}
        {b.referredQ > 0 ? <b>{Math.round(b.referredQ)}</b> : null}
        {b.referredQ > 0 ? ' more arrived because somebody told them to.' : null}
        {b.rivalCut > 0.14 ? <> <span className="warn">Your rival has matched your price.</span></> : null}
      </div>

      <div className="slider">
        <span>Quality</span>
        <input key={'qual' + k} type="range" data-inp="bizqual" min="0" max="600000" step="10000"
          defaultValue={b.qualitySpendMonthly || 0} />
        <span className="mono" style={{ textAlign: 'right' }}>{fmt(b.qualitySpendMonthly || 0)}/mo</span>
      </div>
      <div className="tiny muted" style={{ margin: '-4px 0 10px 0' }}>
        Current product quality: <b>{Math.round(b.quality)}</b>/100. Quality is a process, not a purchase — it
        takes about five quarters of sustained spend to move it, and a bigger business has to spend more just
        to hold the line.
      </div>

      {b.pendingDefects > 0 ? (
        <div className="tutorial bad" style={{ borderColor: 'rgba(255,95,109,.4)', color: '#ffb3b8', background: 'rgba(255,95,109,.08)' }}>
          <b>{Math.round(b.pendingDefects)} defective units are already out there.</b> They were shipped at this
          quality and they will surface as warranty claims in three to six quarters — about {fmt(b.defectBill || 0)},
          plus the reputation. Cutting the spend now books a saving today and the bill later.
        </div>
      ) : null}
      {b.warrantyQ > 0 ? (
        <div className="tiny muted" style={{ margin: '-2px 0 9px' }}>
          Warranty and returns this quarter: <b className="bad">{fmt(b.warrantyQ)}</b>.
        </div>
      ) : null}

      <hr className="sep" />
      <div className="row wrap">
        <button className="btn sm" data-a="expand">
          Commit to location #{b.locations + 1} · {fmt(Math.round(expandCost() * 0.35))} now
        </button>
        {b.formal ? null : (
          <button className="btn sm" data-a="formalize">Register company ({fmt(Math.round(450000 * S.cumInfl))})</button>
        )}
        <button className="btn sm" data-a="inject">Inject capital</button>
        <button className="btn sm good" data-a="draw">Pay myself</button>
        <button className="btn sm bad" data-a="closebiz">Wind it up</button>
      </div>
      <div className="tiny muted" style={{ marginTop: '9px' }}>
        Owner attention: <b>{(ownerTime() * 100).toFixed(0)}%</b>
        {S.p.job ? ' — you still have a job.' : (S.flags.moonlight ? ' — moonlighting.' : ' — full-time. This is your only income.')}
        {S.p.job ? (
          <>
            {' '}<button className="btn xs" data-a="toggle" data-k="moonlight">{S.flags.moonlight ? 'Stop' : 'Work evenings too'}</button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function BizPeopleCard() {
  const b = S.biz; if (!b) return null;
  /* world-first: a strip of badges, each opening the card the picture opens
     (core's, as the string path draws it); with the explanations shown, the
     full table */
  if (!UI.details) return <div className="card" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: staffStripBody(b) }} />;
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>People <span className="tag">{b.staff.length} staff · {fmt(staffMonthly())}/mo</span></h3>
      {b.staff.length ? (
        <table>
          <tbody>
            <tr><th>Name</th><th>Skill</th><th>Type</th><th className="num">Salary</th><th>Morale</th><th></th></tr>
            {b.staff.map((s) => {
              const tr = TRAITS.find((x) => x.id === s.trait) || { name: '—' };
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="num">{s.skill}/10</td>
                  <td><span className={'chip ' + (s.trait === 'thief' || s.trait === 'lazy' ? 'r' : s.trait === 'genius' || s.trait === 'sharp' ? 'g' : '')}>{tr.name}</span></td>
                  <td className="num">{fmt(s.salary)}</td>
                  <td dangerouslySetInnerHTML={{ __html: bar(s.morale, 100, s.morale > 60 ? 'var(--good)' : s.morale > 35 ? 'var(--warn)' : 'var(--bad)') }} />
                  <td className="num">
                    <button className="btn xs" data-a="raise" data-i={s.id}>+15%</button>{' '}
                    <button className="btn xs bad" data-a="fire" data-i={s.id}>Let go</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="small muted">
          No staff. You are the operations department, the sales team and the cleaner. That works until it does not.
        </div>
      )}
      <hr className="sep" />
      <div className="tiny muted">
        Fair market salary for a skill-5 hire right now: <b>{fmt(marketSalary(5))}</b>/month. Underpay and they
        leave or steal; overpay and your break-even rises permanently.
      </div>
    </div>
  );
}

export function CandidatesCard() {
  const cands = S.candidates || [];
  return (
    <div className="card">
      <h3>Candidates this quarter</h3>
      {!cands.length ? (
        <div className="small muted">No one is waiting. Check back next quarter.</div>
      ) : (
        <>
          {cands.map((c) => {
            const tr = TRAITS.find((x) => x.id === c.trait) || { name: '—', d: '' };
            return (
              <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '10px', marginBottom: '8px' }}>
                <div className="between">
                  <b>{c.name}</b>
                  <span className={'chip ' + (c.skill >= 8 ? 'g' : c.skill <= 3 ? 'r' : '')}>skill {c.skill}/10</span>
                </div>
                <div className="tiny muted" style={{ margin: '4px 0' }}>{tr.name} — {tr.d}</div>
                <div className="row">
                  <span className="mono">{fmt(c.salary)}/mo <span className="tiny muted">· asking {fmt(c.ask || c.salary)}</span></span>
                  <div className="spacer" />
                  <button className="btn sm primary" data-a="hirenego" data-i={c.id}>Make an offer</button>
                </div>
                <div className="row" style={{ marginTop: '6px' }}>
                  <button className="btn sm block" data-a="hireask" data-i={c.id}>Take them at {fmt(c.ask || c.salary)}/mo</button>
                </div>
              </div>
            );
          })}
          <div className="tiny muted">
            Hiring costs half a month of salary upfront in recruitment. Nobody tells you the best hires are the
            ones who cost the most per month and least per unit of output.
          </div>
        </>
      )}
    </div>
  );
}

export function PartnershipsCard() {
  const b = S.biz; if (!b) return null;
  if (!b.partner) {
    return (
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Partnerships</h3>
        <div className="small muted">
          A partner brings capital, skills and a network — and takes a permanent share of everything. Choose
          the person, not the money.
        </div>
        <button className="btn sm block" style={{ marginTop: '9px' }} data-a="seekpartner">Sound people out</button>
      </div>
    );
  }
  const pt = b.partner;
  const bg = pt.bg || (pt.kind === 'partner' ? 'came in at the founding' : 'came in on a later round');
  const ask = pt.ask || (((pt.pct || 0) >= 25) ? 'holds enough to require a seat and a say' : 'holds a minority and knows it');
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>{pt.kind === 'partner' ? 'Partner' : 'Largest outside holder'}</h3>
      <div className="kv">
        <span>{pt.name}</span>
        <span className="chip p">{pt.equity || Math.round(pt.pct || 0)}%</span>
      </div>
      <div className="tiny muted" style={{ margin: '6px 0' }}>{bg}. {ask}.</div>
      <div className="statline">
        <span className="lbl">Trust</span>
        <span dangerouslySetInnerHTML={{ __html: bar(pt.trust || 50, 100, 'var(--purple)') }} />
        <span className="val">{Math.round(pt.trust || 50)}</span>
      </div>
      <button className="btn sm block" data-a="buyout">Buy them out</button>
      <button className="btn sm block" style={{ marginTop: '6px' }} data-a="tab" data-t="gov">The register and the board</button>
    </div>
  );
}

/* Buying out the minorities was wired into ACT and into the cap table and then
   never given a button: the action existed, the feature did not, and the audit
   found it because nothing anywhere emitted a control for it. It shows only when
   there is somebody to buy, and it names the premium and the cash you have
   against it. */
export function MinorityCard() {
  const b = S.biz; if (!b) return null;
  const q = buyoutExternal(b, 1.30);
  if (!q.holders.length) return null;
  const short = S.fin.cash < q.cost;
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Minority holders <span className="tag">{q.holders.length} outside</span></h3>
      <div className="tiny muted" style={{ marginBottom: '8px' }}>
        They own a share of this and they did not build it. You can have the whole company back. In cash,
        today, at a premium.
      </div>
      <div className="kv"><span className="muted">To buy them out</span><span className="mono">{fmt(Math.round(q.cost))}</span></div>
      <div className="kv"><span className="muted">Cash on hand</span><span className="mono">{fmt(S.fin.cash)}</span></div>
      <button className="btn sm block" style={{ marginTop: '9px' }} data-a="buyoutminority"
        disabled={short} aria-disabled={short ? 'true' : undefined}
        title={short
          ? 'Costs ' + fmt(Math.round(q.cost)) + ' · you have ' + fmt(S.fin.cash) + ' · short ' + fmt(Math.round(q.cost - S.fin.cash))
          : undefined}>
        Buy the minorities out
      </button>
    </div>
  );
}

export function BizTrackRecordCard() {
  const b = S.biz; if (!b) return null;
  const hh = b.history.slice(-8).reverse();
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Track record</h3>
      {!hh.length ? (
        <div className="tiny muted">No quarters closed yet.</div>
      ) : (
        hh.map((x, i) => (
          <div className="kv" key={i}>
            <span className="muted">{dateLabel(x.turn)}</span>
            <span>
              {fmt(x.revenue)} rev · <span className={x.profit >= 0 ? 'good' : 'bad'}>{fmt(x.profit)}</span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   The panel as core drew it
   -------------------------------------------------------------------------- */
export default function ViewBiz() {
  const b = S.biz;
  if (!b) return <StartCompanyCard />;
  return (
    <div className="grid g2">
      <div>
        <CompanyCard />
        <OperationsCard />
        <BizPeopleCard />
      </div>
      <div>
        <CandidatesCard />
        <PartnershipsCard />
        <MinorityCard />
        <BizTrackRecordCard />
      </div>
    </div>
  );
}
