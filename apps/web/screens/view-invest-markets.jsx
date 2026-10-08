/*
  Money › Markets — what you can buy, and the weather you are buying into.

  **Redesigned in the text pass (REDESIGN.md, phase 2) and this is the port of
  that redesign, not a second opinion about it.** The screen was the worst route
  in the game: 2,566 characters in the way, because every instrument carried a
  sentence of teaching under a border of its own, and two paragraphs explaining
  the numbers sat next to the numbers. It is a price sheet now — one compact row
  per instrument, name and the chips that decide it at the top, the amount box
  and Buy on the row — with the thirteen notes kept whole behind one disclosure
  and the two lectures folded onto the cards they belong to. 2,566 → 915, and
  `tools/textaudit.mjs --check` reports no control lost: thirteen amount boxes,
  thirteen Buy buttons, the same ids.

  Four things this file must not change, and why:

  - **The amount input keeps its `id`** (`amt_<asset>`): the buy handler reads the
    value back out of the DOM by that id. The event model has not moved, and a
    converted screen may not break a handler it does not own. Its placeholder, its
    default (the asset's minimum) and its class are unchanged.
  - **The volatility chip is a three-colour judgement** — over 20% red, over 5%
    yellow, the rest green — and the "real rate" line is good when the policy rate
    beats inflation. Both stay one expression, next to the chip they colour.
  - **Every sentence stays.** The notes and both lectures moved into folds, which
    is why the screen's *total* text is unchanged and only what is *in the way*
    went down. A redesign that lowered both would be deleting.
  - **The string version's closing tag.** It never closed the Markets card, so
    everything after nested inside it and any depth-based walk of the page
    swallowed the cards before it. The closing tag is here, where it belongs.

  `react-screen` compares this screen against the string renderer character for
  character, so the wording, the punctuation and the unicode dashes below are
  deliberate.
*/
import Group from './group.jsx';
import { S, fmt, pct, esc, ASSETS, CITY, dateLabel } from '@ledger/core';

function AssetRow({ a, held }) {
  return (
    <div className="mrow">
      <div className="between" style={{ alignItems: 'flex-start', gap: '8px' }}>
        <b>{a.name}</b>
        <span className="row wrap" style={{ gap: '4px', justifyContent: 'flex-end' }}>
          <span className="chip">exp. {pct(a.ret, 1)}/qtr</span>
          <span className={'chip ' + (a.vol > 0.2 ? 'r' : a.vol > 0.05 ? 'y' : 'g')}>vol {pct(a.vol, 1)}</span>
          {a.fx ? <span className="chip p">FX-linked</span> : null}
          {a.illiquid ? <span className="chip y">illiquid</span> : null}
          {a.yieldQ ? <span className="chip g">pays income</span> : null}
          {held ? <span className="chip b">holding {fmt(held.value)}</span> : null}
        </span>
      </div>
      <div className="row" style={{ marginTop: '6px', gap: '6px' }}>
        {/* the handler reads this box by id, so the id stays */}
        <input type="text" className="mono" style={{ flex: 1 }} placeholder="amount"
          id={'amt_' + a.id} defaultValue={a.min || 50000} />
        <button className="btn sm primary" data-a="buyasset" data-i={a.id}>Buy</button>
      </div>
    </div>
  );
}

export default function ViewInvestMarkets() {
  const groups = {};
  ASSETS.forEach((a) => { (groups[a.cls] = groups[a.cls] || []).push(a); });
  const news = (S.mkt.news || []).slice(0, 8);
  const real = S.mkt.mpr - S.mkt.infl;

  return (
    <>
      <Group route="money/markets" i={1}>
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Markets</h3>
        {Object.keys(groups).map((cls) => (
          <div key={cls}>
            <div className="tiny muted" style={{ margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {cls}
            </div>
            {groups[cls].map((a) => (
              <AssetRow key={a.id} a={a} held={S.assets.find((x) => x.id === a.id)} />
            ))}
          </div>
        ))}

        {/* the thirteen notes, whole: they were the bulk of the screen and they
            are the reason a player picks one instrument over another, so they
            are one tap away rather than deleted */}
        <details className="fold">
          <summary>What each asset is for</summary>
          <div>
            {ASSETS.map((a) => (
              <div key={a.id} style={{ marginBottom: '6px' }}><b>{a.name}</b> — {a.note}</div>
            ))}
          </div>
        </details>

        {/* the card that used to sit under this one, titled exactly this, with
            the same four sentences inside it */}
        <details className="fold">
          <summary>How returns work here</summary>
          <div>
            Each asset has an expected quarterly return and a volatility. Returns are drawn from that distribution, so
            a high-volatility asset will hand you a +60% quarter and then a −45% one. Fixed income tracks the policy
            rate. Anything marked <b>FX-linked</b> earns its return in hard currency and then gets multiplied by the
            currency move — which is why dollar assets can look spectacular in a devaluation year.
          </div>
        </details>
      </div>

      </Group>

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Macro picture</h3>
        <div className="kv">
          <span className="muted">Inflation</span>
          <span className={S.mkt.infl > 0.25 ? 'bad' : ''}>{pct(S.mkt.infl, 1)}</span>
        </div>
        <div className="kv"><span className="muted">Policy rate</span><span>{pct(S.mkt.mpr, 1)}</span></div>
        <div className="kv">
          <span className="muted">Real rate (MPR − inflation)</span>
          <span className={real > 0 ? 'good' : 'bad'}>{pct(real, 1)}</span>
        </div>
        <div className="kv">
          <span className="muted">{CITY().fxName} change this qtr</span>
          <span className={S.mkt.usd / S.mkt.usdPrev > 1.01 ? 'bad' : ''}>{pct((S.mkt.usd / S.mkt.usdPrev) - 1, 1)}</span>
        </div>
        <div className="kv">
          <span className="muted">Cumulative inflation since start</span>
          <span>{pct(S.cumInfl - 1, 0)}</span>
        </div>
        <details className="fold">
          <summary>What those rates mean</summary>
          <div>
            When inflation exceeds the policy rate, holding cash is a guaranteed loss. When the currency is falling, anything
            priced in hard currency quietly rises in local terms. Both of those sentences are load-bearing.
          </div>
        </details>
      </div>

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Recent market news</h3>
        {news.slice(0, 3).map((n, i) => (
          <div className="logline" key={i}>
            <div className="t">{dateLabel(n.turn)}</div>{n.t}
          </div>
        ))}
        {news.length > 3 ? (
          <details className="fold">
            <summary>Earlier news · {news.length - 3} more</summary>
            <div>
              {news.slice(3).map((n, i) => (
                <div className="logline" key={i}>
                  <div className="t">{dateLabel(n.turn)}</div>{n.t}
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </>
  );
}
