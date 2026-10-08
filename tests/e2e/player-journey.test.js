/* End to end: a player, a browser, and each of the three things this repository
   ships. Not a gate — the gates ask whether an invariant survived; this asks
   whether the game works, the way a person would find out.

   The journey is the same one in all three cases, because it is the same game:

     open it → begin a run → play a quarter → look at a second screen
            → reload → the run is still there

   Three surfaces, three ways of arriving at the same file:
     * `ledger/` — the zip, served over http, with a service worker
     * `apps/phone/www/` — the same payload as the store build's WebView loads it
     * `apps/web` — the React app, built and started the way it deploys

   The 390px claims — no sideways scroll, usable targets, nothing clipped — are
   asserted here too, on the app, because a design that only works at 1440px is a
   design for the machine it was written on.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { serve, page, evidence, launch, beginRun, startScreen } = require('../helpers/web.js');
const { ROOT } = require('../helpers/env.js');

const VIEWPORT = { width: 390, height: 844 };
let browser = null;
test.before(async () => { browser = await launch(); });
test.after(async () => { if (browser) await browser.close(); });

/* the save the browser holds, read the way the game writes it: ledger_v1_* keys */
const saved = (p) => p.evaluate(() => {
  const keys = Object.keys(window.localStorage).filter((k) => /^ledger_v1_/.test(k));
  for (const k of keys) {
    try {
      const blob = JSON.parse(window.localStorage.getItem(k));
      if (blob && blob.S && typeof blob.S.turn === 'number') return { key: k, S: blob.S, rs: blob.rs, ui: blob.ui };
    } catch (e) { /* a key that is not a save */ }
  }
  return null;
});
const turnOf = async (p) => { const s = await saved(p); return s ? s.S.turn : -1; };
const nwOf = async (p) => { const s = await saved(p); return s ? Math.round(s.S.der ? s.S.der.nw : 0) : -1; };

/* Advance the quarter the way the game offers it: press the control, then close
   whatever the quarter put on the table. */
async function advance(p) {
  const before = await turnOf(p);
  await p.evaluate(() => {
    const btn = document.querySelector('[data-a="advance"]') ||
      Array.from(document.querySelectorAll('button')).find((b) => /advance|next quarter/i.test(b.textContent));
    if (btn) btn.click();
  });
  await p.waitForTimeout(700);
  for (let i = 0; i < 6; i++) {
    const modal = await p.evaluate(() => {
      const host = document.getElementById('modalHost');
      const open = host && host.children.length && host.firstElementChild;
      if (!open) return null;
      const first = open.querySelector('[data-a^="opt"],[data-a="startgame"],[data-a*="close"],[data-a="okamount"]');
      if (first) { first.click(); return 'clicked'; }
      return 'stuck';
    });
    if (modal !== 'clicked') break;
    await p.waitForTimeout(400);
  }
  return { before, after: await turnOf(p) };
}

for (const [what, dir, opts] of [
  ['the zip, served as it ships', path.join(ROOT, 'ledger'), {}],
  ['the store build’s WebView payload', path.join(ROOT, 'apps', 'phone', 'www'), {}],
]) {
  test(what + ': a run begins, a quarter passes, and a reload keeps it', async () => {
    const site = await serve(dir);
    const p = await page(browser, { name: what });
    try {
      await p.goto(site.url, { waitUntil: 'load' });
      await p.waitForTimeout(1200);

      assert.ok((await startScreen(p)) && (await startScreen(p)).steps === 3,
        'the game opened without offering Begin');

      const started = await beginRun(p);
      assert.ok(started.tabs.length >= 3, 'Begin started a game with ' + started.tabs.length + ' tabs');
      assert.ok(started.page.length > 40, 'the first screen has almost nothing on it: "' + started.page + '"');

      const turn = await advance(p);
      const after = await turnOf(p);
      assert.ok(after > turn.before, 'the turn counter did not move: ' + turn.before + ' → ' + after);

      /* and it is saved without being asked */
      const stored = await p.evaluate(() => {
        const keys = Object.keys(window.localStorage).filter((k) => /ledger_v1_/.test(k));
        return { keys, sizes: keys.map((k) => window.localStorage.getItem(k).length) };
      });
      assert.ok(stored.keys.length >= 1, 'nothing was saved — this game saves as it goes');
      assert.ok(stored.sizes[0] > 1000, 'the save is ' + stored.sizes[0] + ' characters, which is not a run');
      const blob = await p.evaluate((k) => JSON.parse(window.localStorage.getItem(k)), stored.keys[0]);
      /* The blob is a format: the run, its history, the ui, and the two fields
         the header and the resume greeting are drawn from — `at` (when it was
         written) and `head` (one line about the run). Anything else in here is a
         field nobody agreed to, and the summary has to agree with the run. */
      assert.deepEqual(Object.keys(blob).sort(),
        ['S', 'rs', 'ui', 'at', 'head'].filter((k) => k in blob).sort(),
        'the save blob carries keys nobody agreed to: ' + Object.keys(blob).join(', '));
      assert.ok(!('head' in blob) || blob.head.turn === blob.S.turn,
        'the save summary disagrees with the save: head.turn ' + blob.head.turn + ' vs S.turn ' + blob.S.turn);
      assert.equal(blob.S.turn, after, 'the save is behind the game: turn ' + blob.S.turn + ' vs ' + after);

      const money = await nwOf(p);
      await p.reload({ waitUntil: 'load' });
      await p.waitForTimeout(1200);
      assert.equal(await turnOf(p), after, 'the reload lost the quarter');
      assert.equal(await nwOf(p), money, 'the reload changed the money');

      assert.deepEqual(p.errors, [], 'the console was not clean: ' + p.errors.join(' | '));
    } catch (e) {
      await evidence(p, 'journey-' + path.basename(dir), { what });
      throw e;
    } finally {
      await p.close(); await site.close();
    }
  });
}

test('the store build opens from file://, the way an installed WebView can', async () => {
  /* Capacitor serves the payload out of the app bundle rather than from a
     server. A file URL is the closest thing to that in a test — no origin, no
     http, and a service worker is not allowed to register at all, which is
     exactly what the shell's README says about it. What must still be true is
     that the game opens and plays. */
  const index = path.join(ROOT, 'apps', 'phone', 'www', 'index.html');
  const p = await page(browser, { name: 'file-url' });
  try {
    await p.goto('file://' + index, { waitUntil: 'load' });
    await p.waitForTimeout(1200);
    assert.ok((await startScreen(p)) && (await startScreen(p)).steps === 3,
      'the payload does not open from a file URL — an installed app would show a blank screen');

    const started = await beginRun(p);
    assert.ok(started.tabs.length >= 3, 'Begin did not start a game from file://');

    /* no service worker here, so the save is the only thing standing between the
       player and a lost run — and it is written by the game, not by the shell */
    const turn = await advance(p);
    assert.ok((await turnOf(p)) > turn.before, 'a quarter did not pass from file://');
    const keys = await p.evaluate(() => Object.keys(window.localStorage).filter((k) => /ledger_v1_/.test(k)));
    assert.ok(keys.length >= 1, 'nothing was saved from file://');

    /* errors are allowed here — a blocked worker is expected — but a *page* error
       is not: that is the game breaking rather than a browser refusing */
    const pageErrors = p.errors.filter((e) => /pageerror/.test(e));
    assert.deepEqual(pageErrors, [], 'the payload threw from file://: ' + pageErrors.join(' | '));
  } catch (e) {
    await evidence(p, 'file-url', { index });
    throw e;
  } finally {
    await p.close();
  }
});

/* The path a Hardcore run takes, and the one that had no way back.

   Hardcore is not auto-saved — that is the whole of Hardcore — so when the tab
   closes, the run exists only where the player put it: a slot. The start screen
   used to offer a resume from the *auto* slot alone, so a hardcore player was
   offered nothing on a cold start and had to begin a game to go and find their
   own run. The card now reads every slot and resumes the newest.

   Everything here is what a player would do: play, save to a slot, close the
   tab, come back. The auto slot is deleted between the two halves because that
   is the honest hardcore state — nothing is being written for you. */
test('a Hardcore run comes back from its slot, and the header says nothing is being saved', async () => {
  const site = await serve(path.join(ROOT, 'ledger'));
  const p = await page(browser, { name: 'hardcore-resume' });
  try {
    await p.goto(site.url, { waitUntil: 'load' });
    await p.waitForTimeout(1000);
    await beginRun(p);

    const turn = await advance(p);
    const played = await turnOf(p);
    assert.ok(played > turn.before, 'the quarter did not pass, so there is nothing to resume');

    /* the slots are on the Ledger screen, which is where a player finds them */
    await p.evaluate(() => {
      const t = document.querySelector('[data-a="tab"][data-t="legacy"]'); if (t) t.click();
    });
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      const s = document.querySelector('[data-a="sub"][data-s="settings"]'); if (s) s.click();
    });
    await p.waitForTimeout(500);
    assert.equal(await p.locator('[data-a="save"][data-s="s1"]').count(), 1,
      'the Ledger screen offers no slot 1 to save to');

    /* two facts, held at once: this is a hardcore run, and the player chose to
       keep it. The run is what makes the header's sentence true; the slot is
       what makes it survivable. */
    await p.evaluate(() => {
      const auto = JSON.parse(window.localStorage.getItem('ledger_v1_auto'));
      auto.S.difficulty = 'hardcore';
      window.localStorage.setItem('ledger_v1_auto', JSON.stringify(auto));
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(900);
    assert.equal(await p.locator('.saveline').innerText(), 'Not auto-saved',
      'a hardcore run says it is being saved when it is not');

    await p.evaluate(() => {
      const t = document.querySelector('[data-a="tab"][data-t="legacy"]'); if (t) t.click();
    });
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      const s = document.querySelector('[data-a="sub"][data-s="settings"]'); if (s) s.click();
    });
    await p.waitForTimeout(500);
    await p.click('[data-a="save"][data-s="s1"]');
    await p.waitForTimeout(500);

    const slot = await p.evaluate(() => {
      const raw = window.localStorage.getItem('ledger_v1_s1');
      window.localStorage.removeItem('ledger_v1_auto');   /* hardcore writes no auto slot */
      if (!raw) return null;
      const d = JSON.parse(raw);
      return { turn: d.S.turn, diff: d.S.difficulty, name: d.head && d.head.name };
    });
    assert.ok(slot, 'the slot save wrote nothing to slot 1');
    assert.equal(slot.diff, 'hardcore', 'the slot holds a non-hardcore run, so this is not the case under test');
    assert.equal(slot.turn, played, 'the slot is behind the run: turn ' + slot.turn + ' vs ' + played);

    /* close the tab and come back: there is no auto save, only the slot */
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1100);
    const offered = await startScreen(p);
    assert.ok(offered && offered.steps === 3, 'the cold start did not come back to the start screen');
    assert.equal(await p.locator('[data-a="load"]').count(), 1,
      'a hardcore run in a slot was not offered on the start screen — the way back in is gone');
    assert.equal(await p.locator('[data-a="load"]').getAttribute('data-s'), 's1',
      'the resume is pointed at a slot the run is not in');
    const card = await p.evaluate(() => {
      const b = document.querySelector('[data-a="load"]');
      const box = b && b.closest('.card');
      return box ? box.innerText.replace(/\s+/g, ' ') : '';
    });
    assert.ok(/Hardcore/.test(card), 'the card does not warn that this run is only in its slot: ' + card);

    await p.click('[data-a="load"]');
    await p.waitForTimeout(1000);
    assert.ok((await p.locator('[data-a="tab"]').count()) >= 3, 'Continue did not open the run');
    assert.equal(await turnOf(p), played, 'Continue resumed a different quarter: ' + (await turnOf(p)) + ' vs ' + played);
    assert.equal(await p.locator('.saveline').innerText(), 'Not auto-saved',
      'the resumed hardcore run claims to be auto-saved');

    const pageErrors = p.errors.filter((e) => /pageerror/.test(e));
    assert.deepEqual(pageErrors, [], 'the resume threw: ' + pageErrors.join(' | '));
  } catch (e) {
    await evidence(p, 'hardcore-resume', { url: site && site.url });
    throw e;
  } finally {
    /* Close what you opened, both of it. A listening server keeps the process
       alive, and node --test then waits forever: the suite passes, the summary
       prints, and the runner never exits — which in CI is a job that hangs until
       its timeout rather than a job that fails. The other tests in this file
       close their server; this one has to as well. */
    await p.close();
    if (site) await site.close();
  }
});

/* A save may be written while a decision is on the table — the autosave is not
   fussy, and it should not be: the player asked for progress to be kept. What
   the save must not do is *lose* the decision. A modal is UI and is not in the
   blob, so before this the letter with three options was on screen, the save
   beside it described that quarter, and a reload resumed into a quarter with no
   decision in it at all.

   `S.asking` records the decision by name, and the resume puts it back. Watched
   from both sides before it was trusted: with the record removed, the reload
   after this walk came back with a decision missing ("THE DECISION IS GONE");
   with it, the same letter comes back ("THE SAME DECISION CAME BACK"). */
test('a decision waiting in a save comes back on reload, and an answered one does not', async () => {
  const site = await serve(path.join(ROOT, 'ledger'));
  const p = await page(browser, { name: 'decision-resume' });
  const decision = () => p.evaluate(() => {
    const host = document.getElementById('modalHost');
    const open = host && host.children.length ? host.firstElementChild : null;
    return { open: !!open, opts: open ? open.querySelectorAll('[data-a^="opt"]').length : 0,
             text: open ? String(open.innerText || '').replace(/\s+/g, ' ').slice(0, 90) : null };
  });
  try {
    await p.goto(site.url, { waitUntil: 'load' });
    await p.waitForTimeout(1000);
    await beginRun(p);

    /* walk quarters until a real decision is on the table */
    let found = null;
    for (let q = 0; q < 8 && !found; q++) {
      await p.evaluate(() => { const b = document.querySelector('[data-a="advance"]'); if (b) b.click(); });
      for (let t = 0; t < 14 && !found; t++) {
        await p.waitForTimeout(500);
        const d = await decision();
        if (d.opts > 0) found = d;
      }
    }
    assert.ok(found, 'eight quarters produced no decision to test with — the fixture is not reaching one');

    /* the save that exists beside it describes this quarter, with the decision open */
    const saved = await p.evaluate(() => {
      const d = JSON.parse(window.localStorage.getItem('ledger_v1_auto'));
      return { turn: d.S.turn, asking: d.S.asking || null, at: d.at };
    });
    assert.ok(saved.asking && saved.asking.kind,
      'the save does not record the decision that is on the table: ' + JSON.stringify(saved.asking));

    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1400);
    const back = await decision();
    assert.ok(back.opts > 0, 'the reload resumed with no decision on the table at all: ' + JSON.stringify(back));
    assert.equal(back.text, found.text, 'a different decision came back than the one that was waiting');

    /* answer it, and the answered decision must not be asked again */
    await p.evaluate(() => { const o = document.querySelector('[data-a^="opt"]'); if (o) o.click(); });
    await p.waitForTimeout(1200);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1400);
    const after = await decision();
    assert.equal(after.opts, 0, 'an answered decision came back to be answered twice: ' + after.text);
    const cleared = await p.evaluate(() => {
      const d = JSON.parse(window.localStorage.getItem('ledger_v1_auto'));
      return d.S.asking || null;
    });
    assert.equal(cleared, null, 'the save still claims a decision is waiting after it was answered');
    assert.ok((await p.locator('[data-a="tab"]').count()) >= 3, 'the reload did not come back into the game');
  } catch (e) {
    await evidence(p, 'decision-resume', { url: site && site.url });
    throw e;
  } finally {
    await p.close();
    if (site) await site.close();
  }
});
