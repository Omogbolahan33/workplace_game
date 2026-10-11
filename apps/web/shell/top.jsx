/*
  The shell, as components: the header row, the tab strip, its second level and
  the hint popover.

  These four containers used to be rebuilt as strings in `renderTop()` and
  `renderTabs()` on every render, so a change of state replaced the whole header
  and the whole strip whether or not anything in them had moved. They are the
  same markup now, built by React, and the difference is that the nodes survive:
  the quarter counter, the net-worth arrow, the dot that appears on a tab and the
  strip's scroll position update in place.

  **The words are core's.** `bellHTML()`, `eraChipHTML()` and `seasonChipHTML()`
  build the three chips in the header actions - the bell is the one counted
  affordance for everything waiting on you (§22.13) - and `whyHTML()` builds the
  hint popover. They are embedded rather than reimplemented: they are not
  screens, core calls them directly, and a second definition of the bell would
  drift from the first the moment either changed.

  `tabDot(id)` is the dot that says a tab has something behind it, and it is
  embedded the same way - the button's children are the label and the dot, in
  that order, exactly as the string path emits them.

  Where the strip is scrolled to is **not** here: `centerActiveTab()` in the ui
  runs after either renderer has filled `#tabs`, because a scroll position is a
  fact about the page and not about who drew the markup.

  The hint popover's open state (`UI.whyOpen`) stays core-side: this reads it and
  renders `class="open"` or nothing, which is what the string path does too.
*/
import { S, UI, TABS, tabDot, whyHTML, bellHTML, eraChipHTML, seasonChipHTML, saveLineHTML, dateLabel, freedomIndex, CITY, D, fmt, esc, worldGlyph } from '@ledger/core';

/* Markup from core, embedded. display:contents so the wrapper is not a box and
   the chip lays out exactly where it would have without one. */
/**
 * @param {{ html: string, className?: string, style?: any }} props
 */
function Raw({ html, className }) {
  return <div className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Top() {
  const d = S.der;
  const prev = S.hist.length > 1 ? S.hist[S.hist.length - 2].nw : d.nw;
  const delta = d.nw - prev;
  const freedom = freedomIndex();

  return (
    <>
      <div className="brandwrap">
        <div className="brand">LEDGER</div>
        <small className="brandsub">{CITY().name} · {D().name}</small>
        <Raw html={saveLineHTML()} />
      </div>
      <div className="stats">
        <div className="hstat"><b>{dateLabel(S.turn)}</b><span>Quarter</span></div>
        <div className="hstat"><b>{S.p.age} yrs</b><span>Age</span></div>
        <div className="hstat">
          <b className={delta >= 0 ? 'good' : 'bad'}>
            {fmt(d.nw)}{delta >= 0 ? ' ▲' : ' ▼'}
          </b>
          <span>Net worth</span>
        </div>
        <div className="hstat"><b>{fmt(S.fin.cash)}</b><span>Cash</span></div>
        <div className="hstat"><b>{freedom}</b><span>Freedom</span></div>
      </div>
      <div className="acts">
        <Raw html={bellHTML()} />
        <Raw html={eraChipHTML()} />
        <Raw html={seasonChipHTML()} />
        <button className="btn sm helpbtn" data-a="help" title="How to play">?</button>
        <button className="btn sm setbtn" data-a="settings" title="Settings" aria-label="Settings">
          <span className="lbl">Settings</span><span className="icn">{'\u2699'}</span>
        </button>
        <button className="btn primary sm" data-a="advance">Advance ▸</button>
      </div>
    </>
  );
}

export function Tabs() {
  return (
    <>
      {TABS.map((t) => (
        <button key={t.id} className={'tab' + (UI.tab === t.id ? ' on' : '')} data-a="tab" data-t={t.id}>
          {/* an icon over a short label - core's glyph, the same one the string path draws */}
          <span className="gfx tico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: worldGlyph(t.id) }} /><span className="tlbl">{t.label}</span>
          {/* the dot is core's; embedded so the markup is the game's, not a copy */}
          <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: tabDot(t.id) }} />
        </button>
      ))}
    </>
  );
}

/* Second level. The list is handed in by the drawer rather than read here, so
   "does this tab have a second level" is decided once - the same rule the string
   path applies when it hides the host instead of emptying it. */
export function Subs({ subs }) {
  return (
    <>
      {(subs || []).map((sb) => (
        <button key={sb.id} className={'sub' + (UI.sub === sb.id ? ' on' : '')} data-a="sub" data-s={sb.id}>
          <span className="gfx sbico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: worldGlyph(sb.id) }} />{sb.label}
        </button>
      ))}
    </>
  );
}

export function Why() {
  return <Raw html={whyHTML()} />;
}
