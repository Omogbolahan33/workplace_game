/*
  Work › Household — the people who work for you rather than for a company.

  Converted as the game drew it: one card for the roster, one for the people
  looking for work, and nothing else. This route is not grouped (core's
  `ROUTE_GROUPS` has no `work/household` key), so there are no sections here and
  the port must not invent any — a screen that arrives wearing the framework of
  the wrong route is a change to what the player reads.

  Three things on this screen are embedded rather than rebuilt:

  - **`housePayrollSummary()`** — the payroll block, including the perk costs.
    It is arithmetic over the roster, and core already computes it once.
  - **`statRow()`** ×3 per person — morale, loyalty, output. The string version
    emits three bars side by side with their own labels and values; rebuilding
    that in JSX would be a second definition of what a stat row looks like, and
    the first one is already on five other screens.
  - **`bar()`** for the attention line.

  **The two dropdowns are controls**, and they are the reason this screen has
  selects at all: who a person is (their role) and who pays them — you, or a
  company you own. A household paid out of a company is a benefit in kind, which
  is why the declared/undeclared line under it is not decoration. Each select is
  rendered uncontrolled (`defaultValue`) with the option list built from the same
  table core reads, because a controlled select with no change handler is a
  dropdown that refuses to be used — the failure the range sliders already taught
  this project.

  The role list is filtered the way core filters it: a role you cannot hire for
  yet stays visible **while it is the role this person already has**, because a
  select that silently drops the value it is showing is a lie about the state of
  the household.
*/
import {
  S, fmt, pct, bar, statRow, houseMonthly, housePayrollSummary, houseTimeBoost,
  ownerTime, ownerTimeEff, houseRoleAvail, houseSalaryFor, refreshHouseCands,
  bizList, HOUSE_ROLES, HOUSE_PERKS, TRAITS, houseButtonsHTML, UI, houseFacesHTML
} from '@ledger/core';

function Terms({ st }) {
  return (
    <div className="tiny muted" style={{ marginBottom: '5px' }}>
      Terms:{' '}
      {Object.keys(HOUSE_PERKS).map((k, i) => {
        const on = st.perks && st.perks[k];
        return (
          <span key={k}>
            {i ? ' ' : null}
            <button className={'btn xs' + (on ? ' primary' : '')} data-a="houseperk" data-i={st.id} data-k={k}
              title={HOUSE_PERKS[k].note}>
              {HOUSE_PERKS[k].label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

/* `key` is React's, not the component's: React takes it out of props before the
   component ever runs, and this declaration exists so the JSX attribute is legal
   on a props type that came from a JSDoc - React's own types do the same thing
   with `Attributes`. Nothing in the body reads it. */
/**
 * @param {{ st: any, key?: any }} props
 */
function StaffBox({ st }) {
  const R0 = HOUSE_ROLES[st.role] || HOUSE_ROLES.cleaner;
  const tr = TRAITS.find((x) => x.id === st.trait) || { name: '', d: '' };
  const fair = houseSalaryFor(st.role, st.skill);
  const onBiz = (st.payer || 'you') !== 'you';
  const perf = st.perf === undefined ? 60 : st.perf;
  const morale = st.morale === undefined ? 60 : st.morale;
  const loyalty = st.loyalty === undefined ? 50 : st.loyalty;
  const roles = Object.keys(HOUSE_ROLES).filter((k) => houseRoleAvail(k) || k === st.role);

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '10px', marginBottom: '9px' }}>
      <div className="between">
        <b>{st.name}</b>
        <span className="row wrap" style={{ gap: '4px', justifyContent: 'flex-end' }}>
          <span className={'chip ' + (perf >= 70 ? 'g' : perf < 40 ? 'r' : '')}>{R0.label}</span>
          {tr.name ? <span className="chip">{tr.name}</span> : null}
        </span>
      </div>
      <div className="tiny muted" style={{ marginBottom: '6px' }}>
        Skill {st.skill}/10{st.trained ? ' (+' + st.trained + ' trained)' : ''} · {fmt(st.salary)}/mo
        {(st.salary || 0) < fair * 0.9 ? <> <span className="bad">below the going rate</span></> : null}
        {' · '}{st.quarters || 0} quarters with you
      </div>

      <div dangerouslySetInnerHTML={{ __html: statRow('Morale', morale, morale > 60 ? 'var(--good)' : morale > 35 ? 'var(--warn)' : 'var(--bad)') }} />
      <div dangerouslySetInnerHTML={{ __html: statRow('Loyalty', loyalty, loyalty > 60 ? 'var(--good)' : loyalty > 35 ? 'var(--warn)' : 'var(--bad)') }} />
      <div dangerouslySetInnerHTML={{ __html: statRow('Output', perf, 'var(--acc)') }} />

      <div className="row wrap" style={{ gap: '6px', margin: '7px 0' }}>
        <select data-hrole={st.id} defaultValue={st.role} style={{ fontSize: '11px', padding: '3px' }}>
          {roles.map((k) => <option key={k} value={k}>{HOUSE_ROLES[k].label}</option>)}
        </select>
        <select data-hpayer={st.id} defaultValue={onBiz ? st.payer : 'you'} style={{ fontSize: '11px', padding: '3px' }}>
          <option value="you">You pay</option>
          {bizList().map((b) => <option key={b.id} value={b.id}>{b.name} pays</option>)}
        </select>
      </div>

      <Terms st={st} />

      {onBiz ? (
        <div className={'tiny ' + (st.declared ? 'good' : 'bad')} style={{ marginBottom: '6px' }}>
          On the company payroll as a benefit in kind:{' '}
          {st.declared
            ? 'declared and grossed up for tax.'
            : <><b>undeclared</b> — that is a tax exposure with your name on it.</>}
          {' '}
          <button className="btn xs" data-a="housedeclare" data-i={st.id}>
            {st.declared ? 'Stop declaring it' : 'Declare it'}
          </button>
        </div>
      ) : null}

      {/* the four, core's - the card you open by tapping them at home has the same */}
      <div className="row wrap" style={{ gap: '5px' }} dangerouslySetInnerHTML={{ __html: houseButtonsHTML(st) }} />
    </div>
  );
}

function RosterCard({ list }) {
  let body = null;
  if (!list.length) {
    body = (
      <>
        {/* the two lectures, folded; the port of the same redesign in the ui */}
        <details className="fold">
          <summary>Why hire anybody, and where to start</summary>
          <div>
            Nobody works for you personally. Every hour the house takes is an hour you are not
            spending on the thing that makes you money, and you are spending them anyway.
            Start with a housekeeper or a cook. Add a nanny when there are
            children and a driver when traffic costs you more than the driver does. Later, once there is something worth
            running: a personal assistant, a chief of staff, an accountant who works for you rather than for a company you own.
          </div>
        </details>
      </>
    );
  } else {
    const boost = houseTimeBoost();
    body = (
      <>
        <div className="statline">
          <span className="lbl">Attention free</span>
          <span dangerouslySetInnerHTML={{ __html: bar(ownerTimeEff() * 100, 130, 'var(--good)') }} />
          <span className="val">{Math.round(ownerTimeEff() * 100)}%</span>
        </div>
        {boost > 0.005 ? (
          <div className="tiny muted" style={{ marginBottom: '8px' }}>
            Your household hands you back <b>{pct(boost, 0)}</b> of your working attention —{' '}
            {Math.round(ownerTime() * 100)}% to {Math.round(ownerTimeEff() * 100)}%.
            That, and not the money, is what you are actually buying.
          </div>
        ) : null}
        <div dangerouslySetInnerHTML={{ __html: housePayrollSummary() }} />
        <hr className="sep" />
        {/* world-first: each of them is a face that opens their card; (i) brings the rows back */}
        {!UI.details ? (
          <>
            <div className="facerow" dangerouslySetInnerHTML={{ __html: houseFacesHTML(list) }} />
            <div className="tiny muted prose">Tap anyone, here or at home in the picture, for their pay, their terms and what you can do.</div>
          </>
        ) : list.map((st) => <StaffBox key={st.id} st={st} />)}
      </>
    );
  }

  return (
    <div className="card">
      <h3>
        Your household <span className="tag">
          {list.length
            ? list.length + (list.length === 1 ? ' person' : ' people') + ' · ' + fmt(houseMonthly()) + '/mo'
            : 'nobody yet'}
        </span>
      </h3>
      {body}
    </div>
  );
}

export default function ViewHousehold() {
  const list = S.house || [];
  if (!S.houseCands) refreshHouseCands();
  const cands = S.houseCands || [];

  return (
    <>
      <RosterCard list={list} />

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>People looking for work <span className="tag">{cands.length} this quarter</span></h3>
        {!cands.length ? (
          <div className="small muted">Nobody is available right now. Check again next quarter.</div>
        ) : (
          <>
            {cands.map((c) => {
              const R0 = HOUSE_ROLES[c.role];
              if (!R0) return null;
              const tr = TRAITS.find((x) => x.id === c.trait) || { name: '', d: '' };
              const fair = houseSalaryFor(c.role, c.skill);
              return (
                <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '9px', padding: '10px', marginBottom: '8px' }}>
                  <div className="between">
                    <b>{c.name}</b>
                    <span className="row wrap" style={{ gap: '4px', justifyContent: 'flex-end' }}>
                      <span className={'chip ' + (c.skill >= 8 ? 'g' : c.skill <= 3 ? 'r' : '')}>
                        {R0.label} · skill {c.skill}/10
                      </span>
                      <span className="chip">going rate {fmt(fair)}/mo</span>
                      {tr.name ? <span className="chip">{tr.name}</span> : null}
                    </span>
                  </div>
                  {c.ref ? <div className="tiny muted" style={{ margin: '4px 0 6px' }}>via {c.ref}</div> : null}
                  <div className="row wrap" style={{ gap: '5px' }}>
                    <button className="btn sm primary" data-a="housenego" data-i={c.id}>Make an offer</button>
                    <button className="btn sm" data-a="houseask" data-i={c.id}>Take at {fmt(c.ask || c.salary)}/mo</button>
                  </div>
                  <div className="tiny muted" style={{ marginTop: '6px' }}>
                    Paid by:{' '}
                    <select data-hpayerc={c.id} defaultValue={(c.payer || 'you')} style={{ fontSize: '11px', padding: '2px' }}>
                      <option value="you">You</option>
                      {bizList().map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
            <details className="fold">
              <summary>How offers work</summary>
              <div>
                You can take them at what they are asking and be done with it,
                or make an offer and argue. Arguing is free and usually wins you something. It also spends goodwill with someone
                who is about to be in your house, and deciding not to spend it is a perfectly good decision.
              </div>
            </details>
            <details className="fold">
              <summary>What the traits mean</summary>
              <div>
                {TRAITS.map((t) => (
                  <div key={t.id} style={{ marginBottom: '6px' }}><b>{t.name}</b> — {t.d}</div>
                ))}
              </div>
            </details>
          </>
        )}
      </div>
    </>
  );
}
