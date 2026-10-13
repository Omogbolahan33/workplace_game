/*
  Work › Life — what the run is doing to the person running it.

  Two columns: the life you are living on the left, the record of it on the
  right. The route is grouped (`Where you are` · `What it costs` · `Record`), so
  the sections are the port's and the spec is core's:

      Where you are    → Your life                 (left column, open)
      What it costs    → What it costs to run this life (left column, open)
      Record           → Decisions on record · Life log (right column, CLOSED)

  The third section starts collapsed and stays that way unless the player opens
  it, which is why the port passes `tags` explicitly: the string path promotes the
  members' key figures onto a collapsed header — here `N made` from the decisions
  card, and nothing from the life log, which has no tag — and a collapsed section
  does not render its members at all, so the tags cannot be read out of the DOM
  the way the grouping layer reads them out of the markup.

  One thing this screen does that a port must not "tidy": **the two columns are
  the levels.** `Decisions on record` and `Life log` are siblings inside the right
  column, so both are members of `Record`; the left column's two cards each sit in
  their own section. Nothing is grouped across the columns, exactly as the game's
  own grouping layer leaves it.

  `statRow()`, `fmt()` and the month-figure rows are core's own output embedded as
  markup (`statRow` is used on five other screens; a second definition of a stat
  row would drift). The `.kv` rows are ordinary elements, so they are ordinary
  JSX.
*/
import { S, UI, esc, fmt, statRow, needs, D, PRINCIPLES, lifeInner } from '@ledger/core';
import Group from './group.jsx';

function YourLife() {
  const p = S.p;
  /* world-first: the facts as icons, the four that move as gauges */
  if (!UI.details) {
    return (
      <div className="card">
        <h3>Your life</h3>
        <div className="lifepic" dangerouslySetInnerHTML={{ __html: lifeInner(p) }} />
      </div>
    );
  }
  return (
    <div className="card">
      <h3>Your life</h3>
      <div className="kv"><span className="muted">Age</span><span>{p.age}</span></div>
      <div className="kv"><span className="muted">Education</span><span>{p.edu}</span></div>
      <div className="kv">
        <span className="muted">Relationship</span>
        <span>{p.married ? ('Married' + (p.partner ? ' to ' + p.partner.name : '')) : 'Single'}</span>
      </div>
      <div className="kv"><span className="muted">Children</span><span>{p.kids}</span></div>
      <div className="kv"><span className="muted">Parents living</span><span>{p.parents}</span></div>
      <div className="kv">
        <span className="muted">Dependants cost multiplier</span>
        <span>{((1 + (p.married ? 0.75 : 0) + p.kids * 0.55 + (p.parents > 0 ? 0.30 : 0)).toFixed(2))}×</span>
      </div>
      <hr className="sep" />
      <div dangerouslySetInnerHTML={{ __html: statRow('Health', p.health, p.health > 60 ? 'var(--good)' : p.health > 30 ? 'var(--warn)' : 'var(--bad)') }} />
      <div dangerouslySetInnerHTML={{ __html: statRow('Stress (lower better)', 100 - p.stress, p.stress < 40 ? 'var(--good)' : p.stress < 70 ? 'var(--warn)' : 'var(--bad)') }} />
      <div dangerouslySetInnerHTML={{ __html: statRow('Happiness', p.happy, 'var(--acc)') }} />
      <div dangerouslySetInnerHTML={{ __html: statRow('Family standing', p.family, 'var(--info)') }} />
    </div>
  );
}

function WhatItCosts() {
  const nd = needs();
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>What it costs to run this life</h3>
      <div className="tiny muted" style={{ marginBottom: '8px' }}>
        These are the monthly figures at which your stats hold steady. Go below and something deteriorates. Every dependant you add raises all of them.
      </div>
      {Object.keys(nd).map((k) => {
        const spend = S.fin.budget[k] || 0;
        const ok = spend >= nd[k];
        return (
          <div className="kv" key={k}>
            <span>{k} <span className={'chip ' + (ok ? 'g' : 'r')}>{ok ? 'ok' : 'short'}</span></span>
            <span>{fmt(spend)} / {fmt(nd[k])}</span>
          </div>
        );
      })}
    </div>
  );
}

function DecisionsOnRecord() {
  const decs = (S.decisions || []).slice(0, 14);
  return (
    <div className="card">
      <h3>Decisions on record <span className="tag">{(S.decisions || []).length} made</span></h3>
      {!decs.length ? (
        <div className="small muted">No decisions recorded yet. Advance a quarter.</div>
      ) : decs.map((x, i) => (
        <div className="logline" key={i}
          style={{ borderLeftColor: x.kind === 'good' ? 'var(--good)' : x.kind === 'bad' ? 'var(--bad)' : 'var(--line)' }}>
          <div className="t">{x.date}</div><b>{x.title}</b><br />{x.choice} → {x.outcome}
          {D().coaching && PRINCIPLES[x.title] ? <div className="principle">{PRINCIPLES[x.title]}</div> : null}
        </div>
      ))}
    </div>
  );
}

function LifeLog() {
  const life = S.journal.filter((j) => ['life', 'health'].indexOf(j.cat) >= 0).slice(0, 12);
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Life log</h3>
      {!life.length ? (
        <div className="tiny muted">Nothing yet.</div>
      ) : life.map((j, i) => (
        <div className="logline" key={i}><div className="t">{j.date}</div>{j.text}</div>
      ))}
    </div>
  );
}

export default function ViewLife() {
  return (
    <div className="grid g2">
      <div>
        <Group route="work/life" i={0}>
          <YourLife />
        </Group>
        <Group route="work/life" i={1}>
          <WhatItCosts />
        </Group>
      </div>
      <div>
        <Group route="work/life" i={2} tags={[(S.decisions || []).length + ' made']}>
          <DecisionsOnRecord />
          <LifeLog />
        </Group>
      </div>
    </div>
  );
}
