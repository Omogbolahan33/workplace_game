/*
  Work › (top of the screen) — "Waiting on you".

  The agenda is a list of things that need a decision, worst first, each with a
  button. Three shapes of row arrive from core and the button is core's too
  (`nextBtn`), because the agenda is shared with the header bell and the two must
  not disagree about where a row takes you. So the row is React and the button is
  embedded; what converts is the card, the ordering and the per-row accent.

  The sort is `order[a.lv] || 2` — fires first, then warnings, then anything that
  did not say. It is kept exactly, including the fact that it sorts in place.
*/
import { agendaItems, NEXT_DEST, subLabel, nextBtn } from '@ledger/core';

const TONE = { bad: 'var(--bad)', warn: 'var(--warn)' };

/* Is there anything waiting on you?

   The overview arranges its own sections, and a section with no members is not
   a section - the string path never emitted one. That question cannot be asked
   from the outside of a component: `<ViewAgenda />` is an element whether or not
   it renders anything, so a Group counting its children would happily wrap an
   empty section around nothing. The port that composes the section asks this
   instead, and it asks the same function the screen itself asks. */
export function hasAgenda() { return agendaItems().length > 0; }

export default function ViewAgenda() {
  const items = agendaItems();
  if (!items.length) return null;

  /* fire before warning before untagged, as the string version did */
  const order = { bad: 0, warn: 1 };
  items.sort((a, b) => (order[a.lv] || 2) - (order[b.lv] || 2));
  const top = TONE[items[0].lv] || TONE.warn;

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + top }}>
      <h3>Waiting on you</h3>
      {items.slice(0, 8).map((it, i) => {
        const colour = TONE[it.lv] || TONE.warn;
        const dest = NEXT_DEST[it.kind] || { tab: 'work', sub: 'business', focus: '' };
        return (
          <div className="small" key={i}
            style={{ borderLeft: '2px solid ' + colour, padding: '3px 0 3px 9px', marginBottom: '8px' }}>
            {it.text}
            <div className="tiny muted" style={{ margin: '2px 0 4px' }}>{subLabel(dest.tab, dest.sub)}</div>
            <div dangerouslySetInnerHTML={{
              __html: nextBtn({
                act: it.act || '', id: it.id || '', biz: it.biz || '',
                tab: dest.tab, sub: dest.sub, focus: dest.focus || ''
              }, false)
            }} />
          </div>
        );
      })}
    </div>
  );
}
