/*
  Legacy › Settings — the run's own switches, and the one screen that talks to
  the platform.

  This is the screen the Install bug lived on, and converting it is what found
  the bug: the button is rendered only while the browser has an install prompt
  outstanding, and the code that was supposed to reveal it looked up an id no
  element has ever had, so on a browser that could install the game the player
  saw an Install heading, a note, and no button. The fix is in the ui package
  (re-render when the prompt arrives, so the screen and the state cannot come
  apart) and the screen renders from exactly one reading, `canInstall()`, handed
  in by the app.

  The screen was redesigned in the text pass (REDESIGN.md, phase 1) and this is
  the port of that redesign, not a second opinion about it: 1,955 characters of
  text in the way became 1,001, four cards that each lead with their controls,
  one line of status per row, and the teaching folded behind a `Why`. The old
  shape — a card of buttons then a paragraph explaining the buttons, six
  difficulty descriptions stacked as prose, and ten thousand characters of save
  string unfolded in the middle of the page — was what made the screen the
  second-heaviest in the game.

  Two things are embedded rather than rebuilt, and for the same reason:

  - `diffListHTML()` is the difficulty comparison. It is the game's one
    description of the tiers and it always draws the tier you are actually
    playing, so a second copy here would be a second answer to "which row am I
    in". The port keeps the box, not the sentences.
  - `slotRowHTML()` is a save slot *and what is in it*. "Load 1" used to be a
    button with no way to know what slot 1 held — you pressed it and found out.
    Both renderers call the same function so the row, its buttons and the run it
    names cannot drift apart between them.

  The portable save string keeps its place and its one behaviour (tapping it
  selects the whole string), now behind a disclosure: it is machine text, and
  machine text belongs unfolded only where a person is using it.
*/
import { S, CITIES, D, SAVE, SKEY, buildStamp, diffListHTML, exportStr, savedAtLabel,
  parseSaveRaw, saveSlotRowHTML } from '@ledger/core';
import { canInstall } from './runtime.js';
import Group from './group.jsx';

/* The one thing core cannot read for itself: the blob. The read is the app's
   own platform concern, exactly like `canInstall()`; the shape of what comes
   back, and the row that shows it, are core's. No storage (an SSR pass, a
   private window, a test) reads as "empty", which is the truth about it. */
function storedSlot(slot) {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(SKEY + slot);
  } catch (e) { return null; }
}

export default function ViewLedgerSettings() {
  const hid = Object.keys(S.why || {}).length;
  const hardcore = !D().saveScum;
  const slots = ['s1', 's2', 's3'];

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: buildStamp() }} />

      <Group route="legacy/settings" i={0}>
        <div className="card">
          <h3>Save &amp; load</h3>
          <div className="stiles">
            {slots.map((s, i) => (
              <div key={s} dangerouslySetInnerHTML={{
                __html: saveSlotRowHTML(s, 'Slot ' + (i + 1), parseSaveRaw(storedSlot(s))),
              }} />
            ))}
          </div>
          <div className={'tiny' + (hardcore ? '' : ' muted')}
            style={hardcore ? { marginTop: '9px', color: 'var(--warn)' } : { marginTop: '9px' }}>
            {hardcore
              ? 'Hardcore: nothing is auto-saved. Save a slot before you close.'
              : 'Auto-saved after every move' + (SAVE.at ? ' · last at ' + savedAtLabel() : '') + '.'}
          </div>
          <details className="fold">
            <summary>Why autosave</summary>
            <div>
              Autosave runs every quarter{D().saveScum
                ? '. You may reload it freely — this is the honest way to explore consequences.'
                : '. On Hardcore there is one slot and it overwrites every quarter. There is no rewind.'}
            </div>
          </details>
        </div>
      </Group>

      <Group route="legacy/settings" i={1}>
        <div className="card" style={{ marginTop: '12px' }}>
          <h3>Run settings</h3>
          <div dangerouslySetInnerHTML={{ __html: diffListHTML() }} />
          <details className="fold">
            <summary>Changing your mind</summary>
            <div>
              Difficulty is not locked. Change it whenever you like — the world simply becomes gentler or less so
              from that quarter onward.
            </div>
          </details>
          <hr className="sep" />
          <div className="between" style={{ marginBottom: '6px' }}>
            <span className="tiny muted">Location</span>
            <span className="tiny muted">re-bases prices, wages, rent and inflation</span>
          </div>
          <div className="row wrap">
            {CITIES.map((c) => (
              <button key={c.id} className={'btn xs ' + (S.city === c.id ? 'primary' : '')}
                data-a="setcity" data-c={c.id}>
                {c.label}
              </button>
            ))}
          </div>
          <details className="fold">
            <summary>Why locations</summary>
            <div>
              Switching re-bases local prices, wages, rent and inflation. Useful if you want to replay the same run
              in a different economy.
            </div>
          </details>
        </div>
      </Group>

      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Device &amp; data</h3>
        <div className="tiny muted" id="installNote">
          LEDGER keeps no external resources — it runs with the network off.
        </div>
        <div className="row wrap" style={{ marginTop: '8px' }}>
          {/* present exactly when the browser has an install prompt to use.
              While it is absent the note above explains what the section is,
              which is what keeps a hidden control from being a missing
              feature; and when the prompt arrives, the app re-renders. */}
          {canInstall()
            ? <button className="btn sm primary" data-a="installapp">Install app</button>
            : null}
        </div>
        <hr className="sep" />
        <details className="fold">
          <summary>Portable save string · {Math.round(exportStr().length / 1024)} KB</summary>
          <textarea id="exp" rows={4} style={{ fontSize: '11px', marginTop: '6px' }}
            defaultValue={exportStr()} onClick={(e) => e.currentTarget.select()} />
          <div className="row wrap" style={{ marginTop: '8px' }}>
            <button className="btn sm" data-a="copyexp">Copy</button>
            <button className="btn sm" data-a="import">Import from box</button>
          </div>
        </details>
        <div className="row wrap" style={{ marginTop: '10px', gap: '5px', alignItems: 'center' }}>
          <button className="btn sm bad" data-a="restart">Abandon run</button>
          <span className="tiny muted">ends this life and returns to setup — export first if you want it back</span>
        </div>
      </div>

      {/* deliberately outside a group: this is the control that brings back the
          hints a player dismissed, and a control that undoes a decision must
          never be hidden behind a collapsed group */}
      <div className="card" style={{ marginTop: '12px' }}>
        <h3>Screen tips</h3>
        {/* the sentence, word for word the one the string renderer writes:
            this screen is compared against it character by character */}
        <div className="tiny muted" style={{ marginBottom: '8px' }}>
          Every screen carries one line on why it exists, behind the <b>?</b> in the bar above it.{' '}
          {hid ? 'You have taken ' + hid + ' of them away.' : 'None taken away yet.'}
        </div>
        <button className="btn sm" data-a="showwhy"
          disabled={!hid} aria-disabled={!hid ? 'true' : undefined}
          title={!hid ? 'Every tip is already showing — dismiss one first' : undefined}>
          Show all tips again
        </button>
      </div>
    </>
  );
}
