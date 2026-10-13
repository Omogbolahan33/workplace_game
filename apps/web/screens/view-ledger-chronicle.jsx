/*
  Legacy › Chronicle — the journal, as a list.

  The only interesting thing on this screen is the colour map: five kinds of
  entry, each with a tone, and a fallback for a kind nobody has thought of yet.
  In the string version that lookup was built fresh inside the loop, once per
  entry, forty times a render. Here it is a module constant, and the fallback
  is visible at the top of the file instead of buried on line 56.

  `S.journal.slice(0, 40)` is kept exactly as it was — forty entries, most
  recent first. If that cap ever moves it should move once, in the game's data,
  not be re-derived by whichever screen happens to render the list.
*/
import { S, UI, chronicleInnerHTML } from '@ledger/core';

const TONE = {
  good: 'var(--good)',
  bad: 'var(--bad)',
  warn: 'var(--warn)',
  macro: 'var(--info)',
  begin: 'var(--acc)'
};

/* The redesign's final screen, ported from the string renderer: newest first, the
   eight latest entries on the screen, older ones grouped by year behind folds that
   say how much they hold. Forty entries in the way at once was 3,966 characters in
   a mature run — the heaviest route in the game. */
export default function ViewLedgerChronicle() {
  const entries = S.journal.slice(0, 40);
  /* the journal is newest-first already (log() unshifts); reversing it put the
     run's first eight entries on the screen and folded away everything since */
  const rev = entries.slice();

  const entry = (j, i) => (
    <div className="logline" key={i} style={{ borderLeftColor: TONE[j.kind] || 'var(--line)' }}>
      <div className="t">{j.date} · {j.cat}</div>
      {j.text}
    </div>
  );

  /* grouped by the year in the entry's own date, newest year first */
  const years = [];
  rev.slice(8).forEach((j) => {
    const y = (String(j.date).match(/\d{4}/) || ['Earlier'])[0];
    const last = years[years.length - 1];
    if (last && last.y === y) last.items.push(j); else years.push({ y, items: [j] });
  });

  return (
    <div className="card">
      <h3>Chronicle <span className="tag">{entries.length}{entries.length === 1 ? ' entry' : ' entries'}</span></h3>
      {entries.length === 0 ? <div className="tiny muted">Empty.</div> : null}
      {/* world-first: your life as a line with what happened pinned on it, and the quarters as tiles */}
      {entries.length > 0 && !UI.details ? <div className="chron" dangerouslySetInnerHTML={{ __html: chronicleInnerHTML(entries) }} /> : null}
      {entries.length > 0 && !UI.details ? null : rev.slice(0, 8).map(entry)}
      {entries.length > 0 && !UI.details ? null : years.map((g) => (
        <details className="fold" key={g.y}>
          <summary>{g.y} · {g.items.length}{g.items.length === 1 ? ' entry' : ' entries'}</summary>
          <div>{g.items.map(entry)}</div>
        </details>
      ))}
    </div>
  );
}
