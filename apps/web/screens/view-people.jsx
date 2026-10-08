/*
  Legacy › People — the cast, the household, and the rival.

  Two things worth recording.

  1. **The rival card was written twice in the codebase** — once in `viewRival()`
     and once inline inside `viewPeople()`, identically, eight lines each. This
     screen does not get a second copy: it renders the same component. If the two
     copies had drifted, the gate's text comparison would have said so when this
     screen was converted, which is a better way to find out than by reading.

  2. `ensureGov()`'s sibling problem does not arise here, but `bar()` and
     `statRow()` do: both are core widgets used by several screens. They are
     embedded, per the rule — one converted screen does not get to have its own
     opinion about what a bar looks like.

  `relationWord()` stays in core because the rival screen and this one both use
  the same three-word scale, and one scale in two places is one place too many.
*/
import { S, fmt, ROLES, FAVOURS, bar, statRow, relationWord } from '@ledger/core';
import { RivalCard } from './view-rival.jsx';
import Group from './group.jsx';

/* the relation colour ramp: good, accent, warning, bad */
function relationColour(relation) {
  if (relation >= 70) return 'var(--good)';
  if (relation >= 40) return 'var(--acc)';
  if (relation >= 15) return 'var(--warn)';
  return 'var(--bad)';
}

/* `key` is React's, not the component's: React takes it out of props before the
   component ever runs, and this declaration exists so the JSX attribute is legal
   on a props type that came from a JSDoc - React's own types do the same thing
   with `Attributes`. Nothing in the body reads it. */
/**
 * @param {{ c: any, key?: any }} props
 */
function Person({ c }) {
  const role = ROLES[c.role] || { label: c.role, blurb: '' };
  const rel = relationWord(c.relation);
  const colour = relationColour(c.relation);
  const last = c.memory && c.memory.length ? c.memory[0] : null;
  const dead = !c.alive;

  return (
    <div className="mrow" style={dead ? { opacity: '.62' } : undefined}>
      <div className="between">
        <div>
          <b>{c.name}</b>{' '}
          <span className="tiny muted">· {role.label} · {c.age}{dead ? ' · deceased' : ''}</span>
        </div>
        <span className="chip" style={{ background: colour + '22', color: colour }}>
          {rel} {Math.round(c.relation)}
        </span>
      </div>
      <div style={{ margin: '5px 0 4px' }} dangerouslySetInnerHTML={{ __html: bar(c.relation + 100, 200, colour) }} />
      <div className="row wrap" style={{ gap: '4px' }}>
        {c.traits.map((t) => <span className="chip" key={t}>{t}</span>)}
        <span className="chip">means {Math.round(c.wealth)}</span>
        <span className="chip">standing {Math.round(c.status)}</span>
      </div>
      {last && (
        <div className="tiny muted" style={{ marginTop: '5px', fontStyle: 'italic' }}>
          Remembers: {last.note} <span className="muted">({last.d})</span>
        </div>
      )}
      {!dead && (
        <div className="row wrap" style={{ marginTop: '8px' }}>
          {FAVOURS[c.role] ? (
            <button className="btn xs" data-a="favour" data-c={c.id}>{FAVOURS[c.role].ask}</button>
          ) : null}
          <button className="btn xs" data-a="give" data-c={c.id}>Send money</button>
          <button className="btn xs" data-a="cutoff" data-c={c.id}>Let it lapse</button>
        </div>
      )}
    </div>
  );
}

/* The grid is core's arrangement and this screen keeps it. Two sections sit in
   it: `The people in your life` around the cast, and `The rival` around the
   rival. `Household & family` is named in the first group's spec, and it is
   still OUTSIDE it - because core emits a group at the level where its first
   member was found, and `The cast` claimed that group one level down; the
   household card then matched a group that was already spent. That is not a
   rule worth re-deriving here: the port places the two sections where they
   belong, and .harness/react-route.js compares the result with what core drew. */
/* The grid is core's arrangement and this screen keeps it, with its two
   sections where core puts them: `The people in your life` around the cast, and
   `The rival` around the rival, one in each column.

   `Household & family` is named in the first group's spec and it is still
   OUTSIDE it. Core emits a group at the level where its first member was found,
   and `The cast` claimed that group one level further down; the household card
   then matched a group that was already spent. That is a quirk of the matcher,
   not a rule worth re-deriving here - so the port places both sections where
   core left them and `.harness/react-route.js` compares the two arrangements
   card for card, including which cards ended up grouped. */
export default function ViewPeople() {
  const cast = (S.cast || []).slice().sort((a, b) =>
    (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.relation - a.relation);

  const p = S.p;
  const household = p.married
    ? 'Married to ' + (p.spouseName || 'your spouse')
    : (p.kids > 0 ? 'Not married, with children' : 'Not married');

  return (
    <div className="grid g2">
      <div>
        <Group route="legacy/people" i={0}>
          <div className="card">
            {/* the scale, once, instead of on all thirty-odd numbers below it */}
            <h3>The cast <span className="tag">means &amp; standing 0–100</span></h3>
            {cast.map((c) => <Person c={c} key={c.id} />)}
            {/* the sentence that opened this card, at the foot of it, one tap away */}
            <details className="fold">
              <summary>Why they remember</summary>
              <div>
                These people get older, richer, poorer and dead whether you are paying attention or
                not. What they remember is what you did.
              </div>
            </details>
          </div>
        </Group>

        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Household &amp; family</h3>
          <div dangerouslySetInnerHTML={{ __html: statRow('Family harmony', p.family) }} />
          <div dangerouslySetInnerHTML={{ __html: statRow('Happiness', p.happy) }} />
          <div dangerouslySetInnerHTML={{ __html: statRow('Health', p.health) }} />
          <div dangerouslySetInnerHTML={{ __html: statRow('Stress (lower is better)', 100 - p.stress) }} />
          <hr className="sep" />
          <div className="tiny muted">
            {household}{p.kids > 0 ? ' · ' + p.kids + ' child' + (p.kids === 1 ? '' : 'ren') : ''}
          </div>
          <div className="row wrap" style={{ marginTop: '9px' }}>
            <button className="btn xs" data-a="spend" data-k="family">Help family ({fmt(Math.round(150000 * S.cumInfl))})</button>
            <button className="btn xs" data-a="spend" data-k="health">Private care ({fmt(Math.round(220000 * S.cumInfl))})</button>
            <button className="btn xs" data-a="spend" data-k="social">Be seen ({fmt(Math.round(120000 * S.cumInfl))})</button>
          </div>
        </div>
      </div>

      <div>
        <Group route="legacy/people" i={1}>
          <div className="card">
            <h3>Your rival</h3>
            {/* the same component the Rival screen renders: one card, one copy */}
            <RivalCard />
          </div>
        </Group>
      </div>
    </div>
  );
}
