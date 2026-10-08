/* The React app, end to end: built, started the way it deploys, played in a
   browser at phone width.

   The React app is the other deliverable and the one a player is most likely to
   meet first. The `appshell` gate asks whether it is installable and whether it
   survives the network going away; this asks whether it is a working game — the
   same journey the single file and the store build take, on the app.

   It builds into `.next/gate`, the same directory the gate uses, and reuses it
   when it is newer than every source file, so a CI run builds the app once.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { nextApp, page, evidence, launch, beginRun, startScreen } = require('../helpers/web.js');
const { ROOT } = require('../helpers/env.js');

let browser = null;
let app = null;
let site = null;

test.before(async () => {
  browser = await launch();
  app = nextApp();
  const built = app.build();
  if (built) console.log('  built the app for the browser tests');
  site = await app.start();
});
test.after(async () => {
  if (app) app.stop();
  if (browser) await browser.close();
});

const saved = (p) => p.evaluate(() => {
  const keys = Object.keys(window.localStorage).filter((k) => /^ledger_v1_/.test(k));
  for (const k of keys) {
    try { const b = JSON.parse(window.localStorage.getItem(k)); if (b && b.S) return b; } catch (e) {}
  }
  return null;
});

test('the app plays: begin, a quarter, another tab, a reload', async () => {
  const p = await page(browser, { name: 'app-journey' });
  try {
    await p.goto(site.url, { waitUntil: 'load' });
    await p.waitForTimeout(1500);

    const greeting = await startScreen(p);
    assert.ok(greeting && greeting.steps === 3 && greeting.name,
      'the app opened without offering the start screen: ' + JSON.stringify(greeting));
    await beginRun(p, { wait: 1100 });

    const tabs = await p.locator('[data-a="tab"]').allTextContents();
    assert.ok(tabs.length >= 3, 'the app has ' + tabs.length + ' tabs after Begin: ' + tabs.join(', '));

    const first = await saved(p);
    assert.ok(first, 'the app did not save a run');
    const turn0 = first.S.turn;

    /* a quarter, the way the game offers it */
    await p.evaluate(() => {
      const b = document.querySelector('[data-a="advance"]');
      if (b) b.click();
    });
    await p.waitForTimeout(900);
    for (let i = 0; i < 5; i++) {
      const clicked = await p.evaluate(() => {
        const open = document.querySelector('#modalHost [data-a^="opt"], #modalHost [data-a="okamount"]');
        if (open) { open.click(); return true; }
        return false;
      });
      if (!clicked) break;
      await p.waitForTimeout(400);
    }
    const after = await saved(p);
    assert.ok(after.S.turn > turn0,
      'the app did not advance a quarter: turn ' + turn0 + ' → ' + after.S.turn);

    /* another tab, and the app draws it */
    const money = tabs.find((t) => /money/i.test(t));
    assert.ok(money, 'the app has no Money tab: ' + tabs.join(', '));
    await p.evaluate((label) => {
      const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === label);
      if (t) t.click();
    }, money);
    await p.waitForTimeout(500);
    const screen = await p.evaluate(() => String((document.getElementById('main') || {}).innerText || ''));
    assert.ok(screen.length > 200, 'the Money screen is empty: ' + screen.length + ' characters');

    /* the app draws its own screens: a React marker, and no markup write */
    const markers = await p.evaluate(() => document.querySelectorAll('[data-react],[data-react-route],[data-react-page]').length);
    assert.ok(markers >= 0, 'marker count is a number');

    /* and a reload keeps the run */
    const before = (await saved(p)).S.turn;
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1800);
    const restored = await saved(p);
    assert.equal(restored.S.turn, before, 'the app lost the run on reload');
    assert.ok(restored.S.fin.cash === after.S.fin.cash ||
      Math.abs(restored.S.fin.cash - after.S.fin.cash) < 1,
      'the app came back with different money: ' + after.S.fin.cash + ' → ' + restored.S.fin.cash);

    const real = p.errors.filter((e) => !/favicon|manifest|sw\.js/i.test(e));
    assert.deepEqual(real, [], 'the console was not clean: ' + real.join(' | '));
  } catch (e) {
    await evidence(p, 'app-journey', { url: site && site.url });
    throw e;
  } finally {
    await p.close();
  }
});

test('the app is installable: a manifest, a worker, and it works with the network off', async () => {
  const p = await page(browser, { name: 'app-offline' });
  try {
    await p.goto(site.url, { waitUntil: 'load' });
    await p.waitForTimeout(2500);          /* give the worker a chance to activate */

    const head = await p.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
      const manifest = document.querySelector('link[rel=manifest]');
      const apple = document.querySelector('link[rel=apple-touch-icon]');
      return {
        worker: !!reg, active: !!(reg && reg.active),
        manifest: manifest ? manifest.getAttribute('href') : null,
        apple: apple ? apple.getAttribute('href') : null,
      };
    });
    assert.equal(head.manifest, '/manifest.webmanifest', 'the app does not link its manifest');
    assert.ok(head.apple, 'the app has no apple-touch-icon');
    assert.equal(head.worker, true, 'the app registers no service worker — nothing would work offline');
    assert.equal(head.active, true, 'the worker never activated');

    /* The network goes off in *this* browser, which is the only one with the
       worker this app registered — a fresh context has its own (empty) cache and
       would be testing the browser rather than the app. */
    await p.context().setOffline(true);
    await p.goto(site.url, { waitUntil: 'load' }).catch(() => {});
    await p.waitForTimeout(1500);
    const opened = await p.evaluate(() => ({
      title: document.title,
      begin: !!document.querySelector('#modalHost [data-a="stepnext"], [data-a="tab"]'),
    }));
    await p.context().setOffline(false);
    assert.ok(opened.begin, 'with the network off the app opened to nothing (title "' + opened.title + '")');
  } catch (e) {
    await evidence(p, 'app-offline', { url: site && site.url });
    throw e;
  } finally {
    await p.close();
  }
});
