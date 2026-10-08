/* The journey instrument: walks the shipped page the way a new player walks it,
   and counts what the walk costs.

   Why: `tools/textaudit.mjs` measures what is ON a screen and
   `tools/shellaudit.mjs` measures the modals, but neither answers the question a
   player actually asks — *what do I do next, and how many taps until it happens*.
   A journey is a different shape of thing from a screen, so it gets its own tool.

   It drives the real page in Chromium through the preview server, not the module:
   the point is to measure what a player meets, including re-renders, disabled
   controls and modals that steal the screen.

   Records: taps and seconds per milestone; what one quarter costs in taps and
   interruptions; how many taps each destination costs from where you stand; and
   which screens leave the player without an obvious next action.

   Usage:
     node tools/journey.mjs                 # walk, print, write ux/journey-ours.json
     node tools/journey.mjs --url=…         # a different server
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(import.meta.dirname, '..');
const { chromium } = require(path.join(ROOT, '.harness', 'node_modules', 'playwright'));

const urlArg = process.argv.find(a => a.startsWith('--url='));
const URL = urlArg ? urlArg.slice(6) : 'http://127.0.0.1:8080/index.html';
const WAIT = 420;

let taps = 0, t0 = 0;
const milestones = [];

const click = async (page, sel, opts = {}) => {
  const { text = null, wait = WAIT } = opts;
  const hit = await page.evaluate(([s, t]) => {
    const els = [...document.querySelectorAll(s)];
    const el = t ? els.find(e => new RegExp(t, 'i').test(e.textContent)) : els[0];
    if (!el) return false;
    el.click();
    return true;
  }, [sel, text]);
  if (hit) taps++;
  await page.waitForTimeout(wait);
  return hit;
};

/* The quarter's interruptions: what the game puts on top of the screen, and what
   it takes to get back to playing. Counted, because it is the recurring tax. */
const clearModal = async (page, seen) => {
  let n = 0;
  for (let k = 0; k < 5; k++) {
    const title = await page.evaluate(() => {
      const m = document.querySelector('.modalbox');
      if (!m) return null;
      const h = m.querySelector('h2, h3');
      return h ? h.textContent.trim().slice(0, 40) : 'untitled';
    });
    if (title === null) break;
    if (seen) seen.push(title);
    const ok = await page.evaluate(() => {
      const m = document.querySelector('.modalbox');
      const b = m.querySelector('[data-a="close"], .btn.primary, .foot .btn:not(.ghost)');
      if (b) { b.click(); return true; }
      return false;
    });
    if (!ok) break;
    n++; taps++;
    await page.waitForTimeout(WAIT);
  }
  return n;
};

/* The header is the player's scoreboard: reading it is how the instrument tells a
   click that did nothing from a commitment that actually happened. An in-page
   `click()` on a disabled button returns true and changes nothing — which is
   exactly the lie a journey tool must not tell. */
const header = (page) => page.evaluate(() => {
  const b = [...document.querySelectorAll('.hstat b')].map(e => e.textContent.trim());
  const toast = document.querySelector('.toast, #toast, .notif');
  return { cells: b.join(' | '), toast: toast ? toast.textContent.trim().slice(0, 80) : null };
});

const state = (page) => page.evaluate(() => {
  const NAV = new Set(['tab', 'sub', 'help', 'settings', 'belltoggle', 'seasonopen', 'sortby', 'kind', 'whyopen', 'discall', 'toggrp', 'goprofile']);
  const vis = [...document.querySelectorAll('[data-a]')].filter(e => e.offsetParent !== null);
  const acts = vis.map(e => e.dataset.a).filter(a => a && !NAV.has(a));
  const tab = [...document.querySelectorAll('.tab.on')][0];
  const sub = [...document.querySelectorAll('.sub.on')][0];
  const modal = document.querySelector('.modalbox');
  return {
    screen: (tab ? tab.textContent.trim() : '?') + (sub ? ' › ' + sub.textContent.trim().slice(0, 16) : ''),
    modal: modal ? ((modal.querySelector('h2, h3') || {}).textContent || 'untitled').slice(0, 34) : null,
    actionable: new Set(acts).size,
    sample: [...new Set(acts)].slice(0, 5),
  };
});

const mark = async (page, name, note) => {
  const s = await state(page);
  milestones.push({
    milestone: name, taps, seconds: +((Date.now() - t0) / 1000).toFixed(1),
    screen: s.screen, modal: s.modal, actions_on_screen: s.actionable,
    next_action_offered: s.actionable > 1, note: note || '',
  });
  return s;
};

/* A destination is where a player wants to go; the cost is the taps to stand there. */
const visit = async (page, wanted, tabText) => {
  const start = taps;
  await click(page, '[data-a="tab"]', { text: '^' + tabText + '$' });
  const found = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('[data-a="sub"]')].find(e => new RegExp(t, 'i').test(e.textContent));
    if (el) { el.click(); return true; }
    return false;
  }, wanted);
  if (found) taps++;
  await page.waitForTimeout(WAIT);
  return { reached: found, taps: taps - start };
};

(async () => {
  const browser = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  t0 = Date.now();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(700);

  await mark(page, 'cold open — the deal is already on screen', 'zero taps: the start modal is the landing state');

  await page.evaluate(() => {
    const i = document.querySelector('input[type=text]');
    if (i) { i.value = 'Tunde'; i.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await click(page, '[data-a="stepnext"]');
  await mark(page, 'step 2 of 3 — difficulty and the finish line', 'a player who only wants to play is two taps from it');
  await click(page, '[data-a="stepnext"]');
  await mark(page, 'step 3 of 3 — the rules table', 'the rules are shown, not hidden: good, and reversible via Back');
  await click(page, '[data-a="startgame"]', { wait: 900 });
  await mark(page, 'Q1 2026 — the run has started', 'the screen states the loop and offers one gold action');

  /* --- the first thing a player can commit ------------------------------- */
  const toDeals = await visit(page, 'deal', 'Money');
  await mark(page, 'Money › Deals', 'where the game\u2019s own agenda points at Q1: "2 deals are open"');
  /* --- who can actually be committed at Q1? ------------------------------ */
  const reachable = await page.evaluate(() => {
    const vis = [...document.querySelectorAll('[data-a]')].filter(e => e.offsetParent !== null);
    const on = vis.filter(e => !e.disabled);
    const off = vis.filter(e => e.disabled);
    return { live: [...new Set(on.map(e => e.dataset.a))].length, dead: [...new Set(off.map(e => e.dataset.a))].length,
      deadSample: [...new Set(off.map(e => e.dataset.a))].slice(0, 4) };
  });
  await mark(page, 'standing on Money › Deals at Q1',
    reachable.live + ' live controls, ' + reachable.dead + ' disabled on this screen (' + reachable.deadSample.join(', ') + ')');

  const beforeTake = await header(page);
  const btn = await page.evaluate(() => {
    const b = document.querySelector('[data-a="takedeal"]');
    return b ? { text: b.textContent.trim(), disabled: !!b.disabled, title: b.getAttribute('title') || '' } : null;
  });
  await click(page, '[data-a="takedeal"]');
  const modals = [];
  await clearModal(page, modals);
  const afterTake = await header(page);
  const committed = beforeTake.cells !== afterTake.cells;
  await mark(page,
    committed ? 'FIRST COMMITMENT: capital committed' : 'FIRST COMMITMENT: refused — the control is disabled',
    (btn && btn.disabled ? 'disabled, and its reason lives in a title tooltip: "' + btn.title.slice(0, 60) + '…"' : btn ? 'enabled: "' + btn.text : 'no takedeal control on the screen')
    + (modals.length ? ' · confirmed through: ' + modals.join(' → ') : ''));

  /* --- the first thing a player can do ----------------------------------- */
  await visit(page, 'career', 'Work');
  await mark(page, 'Work › Career', 'seven actions, each costing hours');
  const beforeDo = await header(page);
  const did = await click(page, '[data-a="career"]');
  const modals2 = [];
  await clearModal(page, modals2);
  const hours = await page.evaluate(() => {
    const m = document.body.textContent.match(/(\d+)\s*of\s*(\d+)\s*hours/i);
    return m ? m[1] + ' of ' + m[2] + ' hours left' : null;
  });
  await mark(page, did ? 'FIRST CAREER ACTION — spent hours, not money' : 'no career action found',
    (hours ? 'the screen says: ' + hours : 'header ' + (beforeDo.cells === (await header(page)).cells ? 'unchanged' : 'changed'))
    + (modals2.length ? ' · confirmed through: ' + modals2.join(' → ') : ''));

  /* --- the loop's recurring tax ------------------------------------------ */
  const loop = [];
  for (let q = 0; q < 6; q++) {
    const t = taps;
    const seen = [];
    await click(page, '[data-a="advance"]', { wait: 800 });
    const n = await clearModal(page, seen);
    loop.push({ quarter: 'Q' + (q + 2), taps: taps - t, interruptions: n, what: seen });
  }
  await mark(page, 'six quarters of steady play', 'what one quarter costs, over and over');

  /* --- how far away is everything? --------------------------------------- */
  const destinations = [
    ['Budget', 'Money'], ['Position', 'Money'], ['Markets', 'Money'], ['Property', 'Money'],
    ['Group', 'Money'], ['Business', 'Work'], ['Household', 'Work'], ['Rival', 'Work'],
    ['Record', 'Legacy'], ['Chronicle', 'Legacy'], ['Ambition', 'Legacy'],
  ];
  const costs = [];
  for (const [sub, tab] of destinations) {
    const r = await visit(page, sub, tab);
    costs.push({ destination: tab + ' › ' + sub, taps: r.taps, reached: r.reached });
  }

  const avg = loop.reduce((a, x) => a + x.taps, 0) / loop.length;
  const avgInt = loop.reduce((a, x) => a + x.interruptions, 0) / loop.length;
  const out = {
    url: URL, viewport: '390×844',
    fixture: 'name Tunde · Lagos · Fresh Graduate · Realistic · default seed, no season',
    total_taps: taps,
    seconds_to_first_quarter: milestones[3] ? milestones[3].seconds : null,
    taps_to_first_quarter: milestones[3] ? milestones[3].taps : null,
    taps_to_first_commitment: milestones[5] ? milestones[5].taps : null,
    taps_per_quarter_steady: +avg.toFixed(2),
    interruptions_per_quarter: +avgInt.toFixed(2),
    what_interrupts: [...new Set(loop.flatMap(l => l.what))],
    at_q1_on_deals: reachable,
    first_commitment: (milestones.find(m => /FIRST COMMITMENT/.test(m.milestone)) || {}).milestone || null,
    destination_costs: costs,
    loop, milestones,
  };
  fs.mkdirSync(path.join(ROOT, 'ux'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'ux', 'journey-ours.json'), JSON.stringify(out, null, 1));

  const pad = (s, n) => String(s).slice(0, n - 2).padEnd(n);
  console.log('THE JOURNEY, WALKED (390px · ' + URL + ')');
  console.log('  ' + pad('milestone', 46) + pad('taps', 6) + pad('sec', 7) + pad('screen', 20) + 'next action?');
  console.log('  ' + '─'.repeat(96));
  for (const m of milestones) {
    console.log('  ' + pad(m.milestone, 46) + pad(m.taps, 6) + pad(m.seconds, 7) + pad(m.screen, 20) + (m.next_action_offered ? 'yes' : 'NO'));
  }
  console.log('');
  console.log('  to the first quarter      : ' + out.taps_to_first_quarter + ' taps · ' + out.seconds_to_first_quarter + 's');
  console.log('  to the first commitment   : ' + out.taps_to_first_commitment + ' taps');
  console.log('  one quarter, steady state : ' + out.taps_per_quarter_steady + ' taps · ' + out.interruptions_per_quarter + ' interruptions');
  console.log('  what interrupts           : ' + (out.what_interrupts.join(', ') || 'nothing'));
  console.log('  getting anywhere costs    : ' + costs.map(c => c.destination.split(' › ')[1] + ' ' + c.taps).join(' · '));
  console.log('  written: ux/journey-ours.json');
  await browser.close();
})().catch(e => { console.error('journey.mjs:', e.message.slice(0, 200)); process.exit(1); });
