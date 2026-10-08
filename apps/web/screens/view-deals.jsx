/*
  Money › Deals — what is being offered, what you have committed, and how to
  think about either.

  The arrangement is core's grouping, and core's grouping does one thing here
  that a reader would not guess: **`Partnership offers` ends up outside the
  section that names it.** The spec puts it in `Live` with `On the table`, but
  the two cards are in different columns, and `groupLevel()` walks the route's
  markup a level at a time — so the `Live` group is claimed in the left column by
  `On the table`, and by the time the walk reaches the right column `Live` is
  already used and `Partnership offers` matches nothing. It stays exactly where
  it was: in the right column, below the `Background` section.

  A port that helpfully gathered both cards into `Live` would look tidier and be
  wrong: the player would lose a card from the column they are used to finding it
  in, and the section would claim a member the game's section does not have. The
  route comparison gate renders both arrangements and compares them card for
  card, which is how this was found rather than assumed.

  Same walk, same consequence: `Last twelve months` is a member of `Background`
  even though `Partnership offers` sits between them in the source, because the
  section is emitted where its FIRST member was found and later members are
  gathered into it. The card keeps its own `margin-top`, as it does in the string
  path — the member's markup is moved, not rebuilt.

  Both empty states are reproduced word for word (§22.6: a screen with nothing
  to show still has something to say), including the one on `On the table`, which
  is the difference between "nothing is happening" and "you are not looking".
*/
import Group from './group.jsx';
import {
  S, fmt, dateLabel
} from '@ledger/core';

function OnTheTableCard() {
  const ds = S.deals || [];
  return (
    <div className="card">
      <h3>On the table</h3>
      <details className="fold">
        <summary>Why deals expire</summary>
        <div>
          Deals expire. The good ones expire fastest. Nobody is going to hold an opportunity open while you
          think about it for a year.
        </div>
      </details>
      {!ds.length ? <div className="tiny muted">Nothing on the table this quarter. Check back.</div> : null}
      {ds.map((d) => {
        const short = S.fin.cash < d.capital;
        return (
          <div key={d.id} className="mrow">
            <div className="between">
              <b>{d.name}</b>
              <span className="row wrap" style={{ gap: '4px', justifyContent: 'flex-end' }}>
                <span className="chip">{d.turns} quarter{d.turns === 1 ? '' : 's'}</span>
                <span className="chip g">upside +{Math.round(d.ret * 100)}%</span>
                <span className="chip">{Math.round((1 - d.risk) * 100)}% work out</span>
                {d.via ? <span className="chip b">via {d.via}</span> : null}
                <span className="chip b">{fmt(d.capital)}</span>
              </span>
            </div>
            <details className="fold">
              <summary>What it is</summary>
              <div>{d.desc}</div>
            </details>
            <div className="row wrap" style={{ marginTop: '8px' }}>
              {short ? <span className="chip y">short {fmt(Math.round(d.capital - S.fin.cash))}</span> : null}
              <button className="btn xs primary" data-a="takedeal" data-d={d.id}
                disabled={short} aria-disabled={short ? 'true' : undefined}
                title={short
                  ? 'Needs ' + fmt(d.capital) + ' \u00b7 you have ' + fmt(S.fin.cash) + ' \u00b7 short ' +
                    fmt(Math.round(d.capital - S.fin.cash)) + ' \u00b7 pass it and it is gone'
                  : undefined}>
                Commit {fmt(d.capital)}
              </button>
              <button className="btn xs" data-a="passdeal" data-d={d.id}>Pass</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommittedCard() {
  const act = S.active || [];
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Committed capital</h3>
      {!act.length ? (
        <div className="tiny muted">Nothing running. Capital sitting still is not the same as capital being safe.</div>
      ) : null}
      {act.map((a) => (
        <div className="logline" key={a.id} style={{ borderLeftColor: 'var(--acc)' }}>
          <div className="t">{a.name} · resolves {dateLabel(a.due)}</div>
          {fmt(a.capital)} committed{a.via ? ' · introduced by ' + a.via : ''}
        </div>
      ))}
    </div>
  );
}

function HowToReadCard() {
  return (
    <div className="card">
      <h3>How to read these</h3>
      {/* the card keeps its heading — the grouping table names it — and its
          three paragraphs; they are one tap away under one label */}
      <details className="fold">
        <summary>The three rules</summary>
        <div>
          A deal is a bet with a date on it. The listed odds are honest averages, not promises — the same deal can return
          twice your money or a third of it.<br /><br />
          The correct size for a speculative deal is the amount you could hand over and never mention again.
          Most people learn this by doing the opposite.<br /><br />
          Deals introduced by people who like you are more common and no safer. Being introduced is not the same as being protected.
        </div>
      </details>
    </div>
  );
}

function LastTwelveCard() {
  const lines = (S.digest || []).filter((d) => d.kind === 'deal');
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Last twelve months</h3>
      {lines.length ? lines.map((d, i) => (
        <div className="logline" key={i} style={{ borderLeftColor: d.tone === 'good' ? 'var(--good)' : 'var(--bad)' }}>
          <div className="t">{dateLabel(d.turn)}</div>
          {d.text}
        </div>
      )) : <div className="tiny muted">No deal history yet.</div>}
    </div>
  );
}

/* named by `Live`, outside it: see the note at the top of this file */
function PartnershipOffersCard() {
  const offers = (S.biz && S.offers) || [];
  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <h3>Partnership offers</h3>
      {offers.length ? offers.map((o) => (
        <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: '10px', padding: '11px', marginBottom: '9px' }}>
          <div className="between"><b>{o.name}</b><span className="chip p">{o.equity}% for {fmt(o.capital)}</span></div>
          <div className="tiny muted" style={{ margin: '5px 0' }}>
            {o.bg}. Brings <b>{o.skill}</b>. {o.ask}.
          </div>
          <div className="row wrap" style={{ gap: '6px' }}>
            <button className="btn xs primary" data-a="takepartner" data-i={o.id}>Shake hands</button>
            <button className="btn xs ghost" data-a="declineoffer" data-i={o.id}>Not now</button>
          </div>
        </div>
      )) : <div className="tiny muted">Nobody is offering to go into business with you at the moment.</div>}
    </div>
  );
}

export default function ViewDeals() {
  return (
    <div className="grid g2">
      <div>
        <Group route="money/deals" i={0}>
          <OnTheTableCard />
        </Group>
        <Group route="money/deals" i={1}>
          <CommittedCard />
        </Group>
      </div>
      <div>
        <Group route="money/deals" i={2}>
          <HowToReadCard />
          <LastTwelveCard />
        </Group>
        <PartnershipOffersCard />
      </div>
    </div>
  );
}
