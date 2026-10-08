/*
  Money › Budget — the first screen converted to React.

  This is the whole of what a conversion is: the markup `viewMoneyBudget()`
  built by concatenating strings is built here by components instead. Same
  readings, same affordances, same classes — the difference is that a card is
  now a thing with a name, the numbers are computed once instead of inline
  seven times, and the next person to change this screen edits a component
  rather than a nine-part string concatenation.

  What is NOT changed, deliberately: core still calls `host.view('viewMoneyBudget')`
  and still gets a string of markup back, and every control still works through
  the delegated `data-a` handler. React owns the screen's shape; the game's
  event model and render pipeline are exactly where they were. Moving those is
  a different, later step — this one is reversible by deleting one line from
  the overrides map.

  Rendering to a string is the bridge, and it is a real one: a screen here is a
  pure function of the game state, so `renderToStaticMarkup` is not a trick, it
  is the honest answer to "what does this screen show right now". When the
  render pipeline itself moves to React this file does not change.
*/
import { S, fmt, pct, needs, salaryMonthly, passiveMonthly, budgetMonthly, goodsUpkeep, BUDGET_KEYS } from '@ledger/core';

/* Every reading the screen needs, taken once, at the top. The string version
   recomputed several of these inside conditions - the same number, twice, in
   two branches, which is how a screen and its own summary drift apart. */
function readings() {
  const budget = S.fin.budget;
  const need = needs();
  const income = salaryMonthly() + (S.informalIncome || 0) + passiveMonthly();
  const total = budgetMonthly();
  const upkeep = goodsUpkeep();
  /* prices have outrun the budget since it was last set */
  const eroded = S.cumInfl / Math.max(0.0001, S.budgetInfl || 1);
  return { budget, need, income, total, upkeep, eroded, over: total > income };
}

/* `key` is React's, not the component's: React takes it out of props before the
   component ever runs, and this declaration exists so the JSX attribute is legal
   on a props type that came from a JSDoc - React's own types do the same thing
   with `Attributes`. Nothing in the body reads it. */
/**
 * @param {{ keyName: string, label: string, note: string, value: any, max: any, covered: any, short: any, key?: any }} props
 */
function Line({ keyName, label, note, value, max, covered, short }) {
  return (
    <>
      <div className="slider">
        <span>{label}</span>
        <input type="range" data-inp="budget" data-k={keyName} min="0" max={max} step="5000" defaultValue={value} />
        <span className="mono" style={{ textAlign: 'right' }}>{fmt(value)}</span>
      </div>
      <div className="tiny muted" style={{ margin: '-4px 0 10px 0' }}>
        {note}{' '}
        {covered
          ? <span className="chip g">covered</span>
          : <span className="chip r">below need {fmt(short)}</span>}
      </div>
    </>
  );
}

export default function ViewMoneyBudget() {
  const { budget, need, income, total, upkeep, eroded, over } = readings();
  const outOfStep = eroded > 1.18;
  const inflationButton = (
    <button className={'btn sm' + (outOfStep ? ' primary' : '')} data-a="infladj">
      Adjust for inflation{outOfStep ? ' (+' + pct(eroded - 1, 0) + ')' : ''}
    </button>
  );

  return (
    <div className="card">
      <h3>Monthly budget <span className="tag">affordable: {fmt(income)}/mo</span></h3>

      {outOfStep && (
        <div className="tutorial bad" style={{ borderColor: 'rgba(255,159,67,.45)', color: '#ffd7a8', background: 'rgba(255,159,67,.08)' }}>
          Prices have risen {pct(eroded - 1, 0)} since you last set this budget.{' '}
          <button className="btn xs" data-a="infladj" style={{ marginLeft: '6px' }}>Adjust for inflation</button>
          <details className="fold">
            <summary>What that means</summary>
            <div>You are now buying {pct(1 / eroded - 1, 0)} less life than you were.</div>
          </details>
        </div>
      )}

      <div className="tiny muted" style={{ marginBottom: '10px' }}>
        You are committing <b>{fmt(total)}</b> a month.{' '}
        {over
          ? <span className="bad">That is more than you earn — the gap is being funded by savings or debt.</span>
          : <span className="good">Surplus of {fmt(income - total)} a month.</span>}
      </div>

      {BUDGET_KEYS.map((k) => {
        const covered = (budget[k[0]] || 0) >= (need[k[0]] || 0);
        return (
          <Line key={k[0]}
            keyName={k[0]}
            label={k[1].split(' ')[0]}
            note={k[2]}
            value={budget[k[0]] || 0}
            max={Math.max(400000, Math.round((need[k[0]] || 0) * 3))}
            covered={covered}
            short={need[k[0]] || 0} />
        );
      })}

      <hr className="sep" />
      <div className="row wrap">
        <button className="btn sm" data-a="preset" data-p="survive">Survival mode</button>
        <button className="btn sm" data-a="preset" data-p="balanced">Balanced</button>
        <button className="btn sm" data-a="preset" data-p="invest">Invest in myself</button>
        <button className="btn sm" data-a="preset" data-p="flex">Status &amp; family</button>
        {inflationButton}
      </div>

      <div className="tiny muted" style={{ marginTop: '8px' }}>
        Total: <b>{fmt(total)}</b>/month plus {fmt(upkeep)} of asset upkeep. Annual: {fmt((total + upkeep) * 12)}.
      </div>
    </div>
  );
}
