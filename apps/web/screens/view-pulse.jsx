/*
  The quarter that just closed — money in, money out, plainly.

  One card, four figures and the transaction lines that produced them. It is the
  smallest screen in the game and it carries the game's central lesson: the Net
  line is the only one that matters, and the sentence under it says which side of
  it you are on.

  Two details kept exactly: the minus sign before the living costs is a real
  U+2212, and the transaction lines are the simulation's own strings — escaped
  by React as children, not by `esc()`, because a value handed to React is
  escaped for you and escaping it twice is how `&amp;` reaches a player.
*/
import { S, TX, quarterFlowHTML } from '@ledger/core';


export default function ViewPulse() {
  const q = S.quarter || {};
  const inc = Math.round(q.income || 0);
  const exp = Math.round(q.expense || 0);
  const profit = S.biz ? (S.biz.profit || 0) : 0;
  const net = inc - exp + (S.biz ? profit : 0);
  const lines = (TX || []).slice(0, 8);

  return (
    <div className="card">
      <h3>This quarter</h3>
      {/* money in and out as bars against each other, and the net - core's */}
      <div dangerouslySetInnerHTML={{ __html: quarterFlowHTML() }} />
      {lines.length ? (
        <>
          <hr className="sep prose" />
          <div className="tiny muted prose">
            {lines.map((t, i) => (
              <span key={i}>{i ? <br /> : null}{t}</span>
            ))}
          </div>
        </>
      ) : null}
      <hr className="sep" />
      <div className="tiny muted">
        {net >= 0 ? (
          <details className="fold">
            <summary>Why this matters</summary>
            <div>You are living inside your means. Keep doing that and compounding does the rest.</div>
          </details>
        ) : 'You are spending more than you earn. Survivable for a while, fatal eventually.'}
      </div>
    </div>
  );
}
