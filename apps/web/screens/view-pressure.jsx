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
import { S, ringsHTML, hoursLeft, hoursBudget, sleepDebt } from '@ledger/core';

export default function ViewPressure() {
  const p = S.p;
  const debt = sleepDebt();
  /* the dials that end runs as rings, the HUD's own pictures, with the hours
     you have left as the sixth - core's, drawn the same by both renderers */
  const rings = ringsHTML([{ ico: 'heart', label: 'Health', v: p.health }, { ico: 'bolt', label: 'Calm', v: 100 - p.stress, note: 'Stress ' + Math.round(p.stress) },
    { ico: 'smile', label: 'Happiness', v: p.happy }, { ico: 'home', label: 'Family', v: p.family },
    { ico: 'star', label: 'Reputation', v: p.rep },
    { ico: 'glass', label: 'Hours left', v: hoursLeft() / Math.max(1, hoursBudget()) * 100, tone: 'var(--info)', text: hoursLeft() + 'h of ' + hoursBudget() }]);

  return (
    <div className="card">
      <h3>What is at risk</h3>
      <div dangerouslySetInnerHTML={{ __html: rings }} />
      {debt > 0 ? (
        <div className="kv">
          <span className="muted">Sleep debt</span>
          <span className="mono bad">{Math.round(debt)}h</span>
        </div>
      ) : null}
    </div>
  );
}
