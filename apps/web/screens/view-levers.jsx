/*
  Work › Levers — one screen, four columns.

  The four columns are core's (`leverColSet`, `leverColCommit`, `leverColNego`,
  `leverColReact`), they are large, they are shared with the "what next"
  machinery, and they are not what this conversion is about. They are embedded.

  What converts is the screen: the empty state, the four-column container, and
  the card that explains how to read it — with the explanation written as text
  a reader can read rather than one nine-part concatenation. The last column is
  optional (`leverColReact` returns an empty string when you have nothing to
  react to), which in JSX is `|| null` and in the string version was a `(x||'')`
  wedged between two `+`s.
*/
import {
  S, leverColSet, leverColCommit, leverColNego, leverColReact
} from '@ledger/core';

export default function ViewLevers() {
  const b = S.biz;
  if (!b) {
    return (
      <div className="card">
        <h3>Levers</h3>
        <div className="tiny muted">
          Nothing to lever yet. The dials, the commitments, the negotiations and the things you
          cannot control all belong to a business you do not have.
        </div>
      </div>
    );
  }

  const reactColumn = leverColReact(b);

  return (
    <>
      <div className="levers">
        <div dangerouslySetInnerHTML={{ __html: leverColSet(b) }} />
        <div dangerouslySetInnerHTML={{ __html: leverColCommit(b) }} />
        <div dangerouslySetInnerHTML={{ __html: leverColNego(b) }} />
        {reactColumn ? <div dangerouslySetInnerHTML={{ __html: reactColumn }} /> : null}
      </div>
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>How to read this screen</h3>
        <div className="tiny muted" style={{ lineHeight: '1.7' }}>
          One screen, four columns, sorted by how much it costs you to change your mind. The first
          column you can turn tonight and turn back tomorrow, which is why it is not where any
          business is won. The second you are stuck with for quarters, and getting out costs more
          than staying in ever felt like — that is the column that decides things. The third
          belongs to somebody else as much as to you, and is usually lost by not turning up. The
          fourth is not yours at all: it shows itself when it begins to cost you money, and the
          only choice it offers is how you answer.
        </div>
      </div>
    </>
  );
}
