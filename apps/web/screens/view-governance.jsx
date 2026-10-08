/*
  Governance — the tab, as a dispatcher.

  This is the container shape taken to its conclusion: every sub-screen it shows
  (the pack, the register, the board, votes, the deed, promises, inbound, the
  targets) is still core's, and the tab itself is a switcher and a two-column
  arrangement. So the conversion is the *frame* — which company you are looking
  at, which sub-screen is open, and how the panels pair up — and every panel is
  embedded.

  **`ensureGov(b)` is a side effect and it is kept**, in the same place: called
  before anything is read, so that a company whose governance has not been set up
  yet gets it set up the moment you open this tab. A conversion that quietly
  dropped it would look identical on a screen that was already set up, and break
  every new run.

  The sub is read the way core reads it: `UI.tab === 'governance' && UI.sub` is
  the live second-level strip, and `UI.govSub` is the retired pre-consolidation
  flag kept as a fallback.

  **Two of those sub-tabs arrange their own sections.** Pack and Register are the
  last two routes core's grouping still arranged, and it arranged cards from two
  different panels into one section each — the register in one column, the
  promises and the shareholders' agreement in the other. So those two do not
  embed their panels whole: the panels are split, the cards matched to the
  route's spec with core's own rule and core's own helpers (see `sections.js`),
  and the members handed to `Group` as markup. Everything else about the frame —
  the switcher, the columns, every other sub-tab — is untouched.
*/
import { S, UI, pct, bizList, openResolutions, covenantBreaches, yourPct, ensureGov } from '@ledger/core';
import { builtin } from './runtime.js';
import Group from './group.jsx';
import { arrangeRoute } from './sections.js';

/* A panel that is still a screen from @ledger/ui. A converted screen cannot
   import @ledger/ui - that is the package that called it - so it asks the app
   for the built-in rendering by name (see runtime.js). Every sub-screen of this
   tab is unconverted, so the whole tab is a frame around eight of these. */
function Panel({ name, arg }) {
  return <div dangerouslySetInnerHTML={{ __html: builtin(name, arg) }} />;
}

export default function ViewGovernance() {
  const b = S.biz;
  if (!b) {
    return (
      <div className="card">
        <h3>Governance</h3>
        <div className="small muted">You do not own a company. There is nothing to govern.</div>
      </div>
    );
  }

  ensureGov(b);
  if (!UI.govSub) UI.govSub = 'pack';

  const list = bizList();
  const sub = (UI.tab === 'governance' && UI.sub) ? UI.sub : (UI.govSub || 'pack');

  /* which company, when there is more than one — with a dot for one that has
     something open against it */
  const switcher = list.length > 1 ? (
    <div className="card">
      <h3>Which company</h3>
      <div className="row wrap" style={{ gap: '6px' }}>
        {list.map((x) => {
          const warn = openResolutions(x).length ||
            (x.inbound || []).filter((y) => y.status === 'live').length ||
            covenantBreaches(x).length;
          return (
            <button key={x.id} className={'btn sm ' + (x.id === b.id ? 'primary' : '')}
              data-a="switchbiz" data-b={x.id}>
              {/* the built-in writes '<span class="dot"></span> ' only when
                  there is something open against the company - the space
                  belongs to the dot, not to the name. Rendering it
                  unconditionally put a space before every clean company's
                  name, which is a change to text a player reads. */}
              {warn ? <><span className="dot"></span>{' '}</> : null}{x.name}{' '}
              <span className="tiny muted">{pct(yourPct(x) / 100, 0)}</span>
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  /* the two arranged routes: one level per column, the panels' markup joined the
     way the built-in frame joins them, so the matching sees the same cards at the
     same levels the game's grouping layer saw */
  if (sub === 'pack' || sub === 'register') {
    const route = 'governance/' + sub;
    const columns = sub === 'pack'
      ? [builtin('viewPack', b), builtin('viewPromises', b)]
      : [builtin('viewRegister', b), builtin('viewPromises', b) + builtin('viewDeed', b)];
    const arranged = arrangeRoute(route, columns);
    return (
      <>
        {switcher}
        <div className="grid g2">
          {arranged.map((col, ci) => (
            <div key={ci}>
              {col.map((it, k) => it.sect === undefined
                /* a card no group on this route names stays where it was; the
                   wrapper is display:contents because the game has no box here
                   either - the card is a child of the column */
                ? <div key={k} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: it.html }} />
                : <Group key={k} route={route} i={it.sect} html={it.html} tags={it.tags} n={it.n} />)}
            </div>
          ))}
        </div>
      </>
    );
  }

  let panels;
  if (sub === 'board') {
    panels = <Panel name="viewBoard" arg={b} />;
  } else if (sub === 'votes') {
    panels = <Panel name="viewResolutions" arg={b} />;
  } else if (sub === 'deed') {
    panels = (
      <div className="grid g2">
        <div><Panel name="viewDeed" arg={b} /></div>
        <div><Panel name="viewRegister" arg={b} /></div>
      </div>
    );
  } else {
    panels = (
      <div className="grid g2">
        <div><Panel name="viewInbound" arg={b} /></div>
        <div><Panel name="viewTargets" arg={b} /></div>
      </div>
    );
  }

  return (
    <>
      {switcher}
      {panels}
    </>
  );
}
