/*
  Legacy › Ambition — what you are aiming at, and the scoreboard that matters.

  Four cards in two columns, and three of them are readings with a judgement
  attached. The judgements are the reason to convert this screen:

  - the ambition chip is green only at 100%, red below 50%, and neutral in
    between — and the "done" line below it appears at exactly the same threshold
    the chip turns green at;
  - the bar next to it is drawn green at 100% and accent below that, which is a
    *different* rule from the chip's, and the string version had them written in
    two different places;
  - each constituency's bar is green at 60, accent at 35, bad below.

  All three rules are one expression each here, next to the thing they colour.

  `bar()` and `statRow()` are core's and are embedded: half a dozen screens draw
  a bar and this one does not get its own opinion about what one looks like.
  `estateLine()`, `willLine()` and `inheritanceNote()` are core's too, and they
  answer "what is in place today" — a question whose answer belongs to the
  simulation, not to a screen.
*/
import {
  estateLine, willLine, inheritanceNote, ambitionHTML, standRingsHTML, scoreboardRingsHTML
} from '@ledger/core';
import Group from './group.jsx';

export default function ViewLegacy() {
  return (
    <div className="grid g2">
      <div>
        <Group route="legacy/ambition" i={0}>
        <div className="card">
          <h3>What you are actually trying to do</h3>
          {/* the ambition as a ring and the five as picture tiles - core's */}
          <div dangerouslySetInnerHTML={{ __html: ambitionHTML() }} />
        </div>

        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Where you stand</h3>
          <details className="fold">
            <summary>Why five</summary>
            <div>Five constituencies. You cannot please all of them, and the game will keep asking you to choose.</div>
          </details>
          <div dangerouslySetInnerHTML={{ __html: standRingsHTML() }} />
        </div>
        </Group>
      </div>

      <div>
        <Group route="legacy/ambition" i={1}>
        <div className="card">
          <h3>The scoreboard that matters at 65</h3>
          <div dangerouslySetInnerHTML={{ __html: scoreboardRingsHTML() }} />
          <hr className="sep" />
          <details className="fold">
            <summary>Why this scoreboard</summary>
            <div>
              Nobody at your funeral is going to mention your quarterly returns. The game keeps the other score
              anyway, so that you can see the trade you are making while there is still time to make a different
              one.
            </div>
          </details>
        </div>

        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Posterity</h3>
          <div className="tiny muted" style={{ marginBottom: '8px' }}>
            What is actually in place, today, if something happened.
          </div>
          <div className="logline">
            <div className="t">Estate</div>{estateLine()}
          </div>
          <div className="logline" style={{ borderLeftColor: 'var(--warn)' }}>
            <div className="t">A will</div>{willLine()}
          </div>
          <div className="row wrap" style={{ marginTop: '9px' }}>
            <button className="btn xs" data-a="makewill">Draw up a will</button>
            <button className="btn xs" data-a="trust">Set up a family trust</button>
          </div>
          <div className="tiny muted" style={{ marginTop: '7px' }}>{inheritanceNote()}</div>
        </div>
        </Group>
      </div>
    </div>
  );
}
