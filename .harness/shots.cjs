/*
  Screenshots of the running app, for a human to look at.

  Not a gate: nothing here asserts anything. `.harness/browser-screens.cjs` is
  the check; this is the picture, and it exists because a conversion can pass
  every structural comparison and still look wrong.

  Usage: node .harness/shots.cjs [outDir]
*/
const { chromium } = require('playwright');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, '..', 'apps', 'web');
const SHOTS = [
  { file: 'web-react-overview.png', tab: 'Overview', sub: null, openGroups: false },
  { file: 'web-react-career.png', tab: 'Work', sub: 'career', openGroups: false },
  { file: 'web-react-settings.png', tab: 'Legacy', sub: 'settings', openGroups: false },
  { file: 'web-react-work-business.png', tab: 'Work', sub: 'business', openGroups: true },
  /* routes the app draws whole: the wrapper each screen sits in is
     display:contents and must not move anything */
  { file: 'web-react-work-levers.png', tab: 'Work', sub: 'levers', openGroups: false },
  { file: 'web-react-money-budget.png', tab: 'Money', sub: 'budget', openGroups: false },
  { file: 'web-react-governance-route.png', tab: 'Governance', sub: null, openGroups: false },
  /* routes whose sections the app arranges itself */
  { file: 'web-react-governance-pack.png', tab: 'Governance', sub: 'pack', openGroups: true },
  /* the modal, opened the way a player opens it: the gear in the header */
  { file: 'web-react-modal-settings.png', tab: 'Overview', sub: null, openGroups: false,
    click: '#toprow [data-a="settings"]' },
  { file: 'web-react-money-position.png', tab: 'Money', sub: 'position', openGroups: false },
  { file: 'web-react-money-deals.png', tab: 'Money', sub: 'deals', openGroups: true },
  { file: 'web-react-money-group.png', tab: 'Money', sub: 'group', openGroups: true },
  { file: 'web-react-work-household.png', tab: 'Work', sub: 'household', openGroups: false },
  { file: 'web-react-work-life.png', tab: 'Work', sub: 'life', openGroups: true },
  { file: 'web-react-legacy-season.png', tab: 'Legacy', sub: 'season', openGroups: false },
  { file: 'web-react-legacy-people.png', tab: 'Legacy', sub: 'people', openGroups: false },
  { file: 'web-react-work-career.png', tab: 'Work', sub: 'career', openGroups: false }
];

(async () => {
  const b = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const p = await b.newPage({ viewport: { width: 390, height: 1400 } });
  await p.goto('http://127.0.0.1:3007/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  const go = async (tab, sub) => {
    await p.evaluate((l) => {
      const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === l);
      if (t) t.click();
    }, tab);
    await p.waitForTimeout(400);
    if (sub) {
      await p.evaluate((s) => {
        const el = Array.from(document.querySelectorAll('[data-a="sub"]')).find((n) => (n.getAttribute('data-s') || '') === s);
        if (el) el.click();
      }, sub);
      await p.waitForTimeout(500);
    }
  };

  /* a run with a company, so the screens are not all first-quarter emptiness */
  await p.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-a]')).find((n) => /^pickprof/.test(n.getAttribute('data-a') || ''));
    if (el) el.click();
  });
  for (const a of ['pickcity', 'pickdiff', 'startgame']) {
    await p.evaluate((x) => { const e = document.querySelector('[data-a="' + x + '"]'); if (e) e.click(); }, a);
    await p.waitForTimeout(300);
  }
  await p.waitForTimeout(1200);
  await go('Work', 'business');
  await p.evaluate(() => { const el = document.querySelector('[data-a="startbizpartner"][data-t="proserv"]'); if (el) el.click(); });
  await p.waitForTimeout(1300);
  await p.evaluate(() => { const m = document.getElementById('modalHost'); const t = m && m.querySelector('[data-a="acceptpartner"]'); if (t) t.click(); });
  await p.waitForTimeout(1300);
  await p.evaluate(() => { const m = document.getElementById('modalHost'); const ok = m && m.querySelector('[data-a="okamount"]'); if (ok) ok.click(); });
  await p.waitForTimeout(1300);
  await p.evaluate(() => { const a = document.querySelector('[data-a="advance"]'); if (a) a.click(); });
  await p.waitForTimeout(1200);

  for (const s of SHOTS) {
    await go(s.tab, s.sub);
    if (s.openGroups) {
      for (let i = 0; i < 4; i++) {
        const n = await p.evaluate(() => {
          let c = 0;
          document.querySelectorAll('[data-a="toggrp"]').forEach((el) => {
            const v = el.querySelector('.sectchev');
            if (v && v.textContent.indexOf('\u25b8') >= 0) { el.click(); c++; }
          });
          return c;
        });
        await p.waitForTimeout(450);
        if (!n) break;
      }
    }
    /* a shot can also be about something that has to be opened first */
    if (s.click) {
      await p.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.click(); }, s.click);
      await p.waitForTimeout(700);
    }
    await p.screenshot({ path: path.join(OUT, s.file), fullPage: true });
    console.log('  ' + s.file);
  }
  await b.close();
})();
