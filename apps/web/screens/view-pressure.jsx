/*
  What is at risk — the five dials and the hours you have left to spend.

  The dials that end runs, on one card, with the hours system's own reading of
  the quarter underneath. Five `statRow()` bars are the simulation's own
  painters, so they are embedded rather than reimplemented; the two figures that
  are text are written the way the string version wrote them, down to the
  separator between the hours you have and the hours you were given.

  Sleep debt only appears when there is any, which is the card's one conditional:
  four dials and two figures is the ordinary state, and a nought-hours line would
  be the game telling you about a thing that is not happening.
*/
import { S, statRow, hoursLeft, hoursBudget, sleepDebt } from '@ledger/core';

export default function ViewPressure() {
  const p = S.p;
  const debt = sleepDebt();
  const rows = [
    ['Health', p.health, p.health > 60 ? 'var(--good)' : p.health > 30 ? 'var(--warn)' : 'var(--bad)'],
    ['Stress (lower better)', 100 - p.stress, p.stress < 40 ? 'var(--good)' : p.stress < 70 ? 'var(--warn)' : 'var(--bad)'],
    ['Happiness', p.happy, 'var(--acc)'],
    ['Family', p.family, 'var(--info)'],
    ['Reputation', p.rep, 'var(--purple)']
  ];

  return (
    <div className="card">
      <h3>What is at risk</h3>
      {rows.map(([label, value, colour]) => (
        <div key={label} dangerouslySetInnerHTML={{ __html: statRow(label, value, colour) }} />
      ))}
      <hr className="sep" />
      <div className="kv">
        <span className="muted">Hours left this quarter</span>
        <span className="mono">{hoursLeft()}h of {hoursBudget()}</span>
      </div>
      {debt > 0 ? (
        <div className="kv">
          <span className="muted">Sleep debt</span>
          <span className="mono bad">{Math.round(debt)}h</span>
        </div>
      ) : null}
    </div>
  );
}
