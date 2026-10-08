/*
  Work › Career — the job, the hours, and what you can spend them on.

  The right-hand column is the interesting half and the reason this screen is
  worth converting: every career action is a card whose *enabledness* is a
  two-part question (is it open to you yet, and can you afford it) and whose
  card carries a third question again (do you have the hours). The string version
  wrote that three-part judgement as one nested ternary on the button; here it is
  a named expression, and the sentence a disabled button says — "Not open to you
  yet: <hint>" or "Costs ₦x · you have ₦y · short ₦z" — is chosen where a reader
  can see both.

  The hour economics are core's readings: `hoursLeft()`, `weeklyFreeHours()`,
  `hoursBudget()` and `sleepDebt()`. An action that overspends the quarter's
  hours does not disable itself; it says how much sleep it will borrow, which is
  the whole point of the hours system (§22.23: a disabled control with no stated
  reason is indistinguishable from a missing feature).
*/
import Group from './group.jsx';
import { S, fmt, pct, esc, statRow, clamp, D, CAREER, hoursLeft, weeklyFreeHours, hoursBudget, sleepDebt } from '@ledger/core';

export default function ViewCareer() {
  const p = S.p;
  const left = hoursLeft();
  const showOdds = D().showOdds;
  const careerLog = S.journal.filter((j) => j.cat === 'career').slice(0, 10);
  const SKILLS = ['finance', 'ops', 'hustle', 'network', 'tech'];

  return (
    <div className="grid g2">
      <div>
        <Group route="work/career" i={0}>
        <div className="card">
          <h3>Employment</h3>
          {p.job ? (
            <>
              <div className="between">
                <div>
                  <b style={{ fontSize: '17px' }}>{p.job.title}</b>
                  <div className="tiny muted">
                    {p.jobYears.toFixed(1)} years · performance {Math.round(p.jobPerf)}/100
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mid">{fmt(p.job.monthly)}</div>
                  <div className="tiny muted">per month</div>
                </div>
              </div>
              <div style={{ margin: '10px 0' }} dangerouslySetInnerHTML={{ __html: statRow('Performance', p.jobPerf, 'var(--info)') }} />
              <details className="fold">
                <summary>Why performance drifts</summary>
                <div>
                  Performance drifts toward a baseline set by your skills and tenure. Below about 34, redundancy
                  becomes a live risk.
                </div>
              </details>
            </>
          ) : (
            <>
              <div className="small muted">
                You are not employed. No salary arrives, and nothing is stopping you either.
              </div>
              <button className="btn sm block" style={{ marginTop: '9px' }} data-a="findjob">Look for a job</button>
            </>
          )}
        </div>

        </Group>

        <Group route="work/career" i={1}>
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>What you can do this quarter <span className="tag">{left}h left</span></h3>
          <details className="fold">
            <summary>Where the hours come from</summary>
            <div>
              You have about <b>{weeklyFreeHours()}</b> discretionary hours a week once work, sleep, commuting and
              the house have taken their share — <b>{hoursBudget()}</b> this quarter. Spend past that and the
              difference comes out of your sleeping.
            </div>
          </details>
          {sleepDebt() > 0 ? (
            <div className="principle" style={{ marginBottom: '9px', borderLeftColor: 'var(--bad)' }}>
              <b>Sleep debt: {Math.round(sleepDebt())} hours.</b> You have been spending nights you did not have.
              It is being repaid out of this quarter, and until it clears your health and performance both suffer.
            </div>
          ) : null}

          {CAREER.map((c, i) => {
            const ok = !c.can || c.can(S);
            const odds = typeof c.odds === 'function' ? clamp(c.odds(S), 0, 1) : c.odds;
            const hrs = c.hours || 0;
            const short = hrs > left;
            const done = (S.p.acts || {})[c.id] || 0;
            let tag = '';
            if (hrs) {
              tag = hrs + 'h' + (short ? ' · borrows ' + (hrs - left) + 'h from sleep' : '');
              if (done) tag += ' · done ' + done + 'x';
            } else if (c.cost) tag = fmt(c.cost);
            const affordable = ok && S.fin.cash >= c.cost;
            return (
              <div key={i} className="mrow" style={{ opacity: ok ? 1 : 0.45 }}>
                <div className="between">
                  <b>{c.label}</b>
                  {odds !== undefined && showOdds
                    ? <span className="chip b">{pct(odds, 0)} odds</span>
                    : (tag ? <span className="chip">{tag}</span> : null)}
                </div>
                {/* the hint is the action's own teaching: one tap away, and still
                    what a disabled button says when it refuses */}
                <details className="fold">
                  <summary>Why</summary>
                  <div>{c.hint}</div>
                </details>
                {short ? (
                  <div className="tiny bad" style={{ margin: '6px 0' }}>
                    You do not have {hrs} hours left this quarter. Doing this will cost you sleep.
                  </div>
                ) : null}
                <button className="btn sm primary block" data-a="career" data-i={i}
                  disabled={!affordable} aria-disabled={!affordable ? 'true' : undefined}
                  title={!affordable
                    ? (!ok
                      ? 'Not open to you yet: ' + c.hint
                      : 'Costs ' + fmt(c.cost) + ' · you have ' + fmt(S.fin.cash) + ' · short ' + fmt(Math.round(c.cost - S.fin.cash)))
                    : undefined}>
                  Do it
                </button>
              </div>
            );
          })}
        </div>
        </Group>
      </div>

      <div>
        {/* Capability is named in the `This quarter` group and rendered outside
            it, because the group was spent on the column where its first member
            was found. Core's own output does the same, and the route gate
            compares the two arrangements rather than assuming. */}
        <div className="card">
          <h3>Capability</h3>
          {SKILLS.map((k) => (
            <div key={k} dangerouslySetInnerHTML={{ __html: statRow(k, p.skills[k], 'var(--info)') }} />
          ))}
          <details className="fold">
            <summary>How skills rise</summary>
            <div>
              Skills rise from deliberate spending (Learning in the budget), from certifications, and from simply
              operating a business for long enough.
            </div>
          </details>
        </div>

        <Group route="work/career" i={2}>
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Recent career log</h3>
          {careerLog.length
            ? careerLog.map((j, i) => (
              <div className="logline" key={i}>
                <div className="t">{j.date}</div>{j.text}
              </div>
            ))
            : <div className="tiny muted">Nothing yet.</div>}
        </div>
        </Group>
      </div>
    </div>
  );
}
