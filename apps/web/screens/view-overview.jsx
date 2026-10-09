/*
  Overview — the screen the game opens on.

  Five things, in the order a player needs them: anything on fire, where you
  stand, what is waiting on you, the quarter that just closed, and the dials
  that end runs. Three of those are other people's cards and are embedded, not
  reimplemented:

  - `bigStat()`, `sparkline()`, `threadStrip()`, `bar()` and `statRow()` are the
    simulation's own drawing helpers;
  - the agenda is a **converted** screen, so it is imported as a component
    rather than asked for as markup. A converted screen may depend on another
    converted screen - the rule that forbids importing `@ledger/ui` exists
    because that package is the caller, and a sibling file has no such problem;
  - `viewPulse()` and `viewPressure()` are converted screens too, so they are
    imported like the agenda rather than asked for as markup;

  This is also the first screen that **arranges its own sections**. The route's
  cards used to be gathered into `Where you stand` / `Waiting on you` / `This
  quarter` / `Background` by core's `groupRoute()`, which parses the route's
  markup - something a React tree cannot be handed. Here the port places them
  itself with `<Group route="overview" i={n}>`, and every word and figure on the
  section headers still comes from `ROUTE_GROUPS`: the spec says what groups
  exist, the screen says where they sit. The nesting is deliberately the same as
  the string path's - the quarter and background sections live inside their
  `grid g2` wrappers - and `.harness/react-route.js` compares both renderers
  card for card, header for header, to prove it.

  Nothing here is restyled or reworded. The alert chips are the same six
  conditions, the same order, the same thresholds (stress above 75, cash below
  zero, a business below zero), and the Advance button keeps its block layout
  and its own padding, because it is the one control a player presses every
  quarter and it should not move.
*/
import { S, fmt, pct, esc, bar, bigStat, sparkline, threadStrip, comingBackHTML, dateLabel, CITY,
  netWorth, freedomIndex, ambitionOf, ambitionPct, firstMovesHTML } from '@ledger/core';
import ViewAgenda, { hasAgenda } from './view-agenda.jsx';
import ViewPulse from './view-pulse.jsx';
import ViewPressure from './view-pressure.jsx';
import Group from './group.jsx';

const SKILLS = ['finance', 'ops', 'hustle', 'network', 'tech'];

export default function ViewOverview() {
  const m = S.mkt, p = S.p;
  const nw = netWorth(), fr = freedomIndex();
  const real = nw / Math.max(0.01, S.cumInfl);
  const yearsLeft = Math.max(0, 65 - p.age);
  const amb = ambitionOf(), ap = ambitionPct();

  const alerts = [];
  if (S.pending && S.pending.length) {
    alerts.push(<span className="chip y" key="pending">{S.pending.length} consequence{S.pending.length > 1 ? 's' : ''} scheduled</span>);
  }
  if (S.fin.cash < 0) alerts.push(<span className="chip r" key="cash">Cash is negative</span>);
  if (S.biz && S.biz.cash < 0) {
    alerts.push(<span className="chip r" key="biz">{S.biz.name} is insolvent</span>);
  }
  if (S.p.stress > 75) alerts.push(<span className="chip r" key="stress">Severe stress</span>);
  if (S.offers && S.offers.length) {
    alerts.push(<span className="chip p" key="offers">{S.offers.length} partnership offer{S.offers.length > 1 ? 's' : ''}</span>);
  }

  /* The first-quarter coach, embedded from core rather than restated: it is one
     card, the same on both renderers, and the words live in one place. */
  const firstMoves = firstMovesHTML();

  return (
    <>
      {firstMoves ? <div dangerouslySetInnerHTML={{ __html: firstMoves }} /> : null}

      {alerts.length
        ? <div className="row wrap" style={{ marginBottom: '12px' }}>{alerts}</div>
        : null}

      <Group route="overview" i={0}>
      <div className="card">
        <h3>Where you stand <span className="tag">{CITY().label}</span></h3>
        <div className="grid g3">
          <div dangerouslySetInnerHTML={{ __html: bigStat('Net worth', fmt(nw), fmt(real) + ' in start-of-game money') }} />
          <div dangerouslySetInnerHTML={{
            __html: bigStat('Freedom', String(fr),
              fr > 70 ? 'work is optional' : fr > 40 ? 'not yet optional' : 'work pays for this',
              fr > 70 ? 'good' : fr > 40 ? 'warn' : 'bad')
          }} />
          <div dangerouslySetInnerHTML={{ __html: bigStat('Years to 65', String(yearsLeft), 'you are ' + p.age) }} />
        </div>
        <div style={{ margin: '9px 0 2px' }} dangerouslySetInnerHTML={{ __html: sparkline() }} />

        {amb ? (
          <>
            <div className="statline" style={{ marginTop: '8px' }}>
              <span className="lbl">{amb.name}</span>
              <span dangerouslySetInnerHTML={{ __html: bar(ap, 130, 'var(--acc)') }} />
              <span className="val">{ap}%</span>
            </div>
            {amb.blurb ? <div className="tiny muted" style={{ marginTop: '3px' }}>{amb.blurb}</div> : null}
          </>
        ) : (
          <div className="tiny muted" style={{ marginTop: '9px' }}>
            You have not said what you are building toward.{' '}
            <button className="btn xs" data-a="tab" data-t="legacy">Choose an ambition</button>
          </div>
        )}
      </div>
      </Group>

      <div dangerouslySetInnerHTML={{ __html: threadStrip() }} />

      {/* what you have already set in motion - core's card, as threadStrip is */}
      <div dangerouslySetInnerHTML={{ __html: comingBackHTML() }} />

      {/* a section with nothing in it is not a section: the agenda renders
          nothing when nothing is waiting, so its group is not composed at all */}
      {hasAgenda() ? <Group route="overview" i={1}><ViewAgenda /></Group> : null}

      <div className="grid g2">
        <Group route="overview" i={2}>
          <ViewPulse />
          <ViewPressure />
        </Group>
      </div>

      <div className="grid g2">
        <Group route="overview" i={3} tags={[dateLabel(S.turn)]}>
        <div className="card">
          <h3>Skills</h3>
          {SKILLS.map((k) => (
            <div className="statline" key={k}>
              <span className="lbl">{k}</span>
              <span dangerouslySetInnerHTML={{ __html: bar(p.skills[k], 100, 'var(--info)') }} />
              <span className="val">{Math.round(p.skills[k])}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>The economy <span className="tag">{dateLabel(S.turn)}</span></h3>
          <div className="kv">
            <span className="muted">Inflation</span>
            <span className={m.infl > 0.25 ? 'bad' : m.infl > 0.12 ? 'warn' : 'good'}>{pct(m.infl, 1)}</span>
          </div>
          <div className="kv"><span className="muted">{CITY().fxName}</span><span>{Math.round(m.usd).toLocaleString()}</span></div>
          <div className="kv"><span className="muted">Policy rate</span><span>{pct(m.mpr, 1)}</span></div>
          <div className="kv"><span className="muted">Demand</span><span>{(m.demand * 100).toFixed(0)}</span></div>
          <div className="kv"><span className="muted">Grid</span><span>{Math.round(m.power)}%</span></div>
          <div className="kv"><span className="muted">Confidence</span><span>{Math.round(m.sentiment)}</span></div>
        </div>
        </Group>
      </div>

      {/* the vignette is prose the simulation wrote, and it may carry its own markup */}
      {S.vignette ? <div className="vignette" style={{ marginTop: '12px' }} dangerouslySetInnerHTML={{ __html: S.vignette }} /> : null}

      <div style={{ marginTop: '14px' }}>
        <button className="btn primary block" data-a="advance" style={{ padding: '13px', fontSize: '15px' }}>
          Advance to {dateLabel(S.turn + 1)} ▸
        </button>
      </div>
    </>
  );
}
