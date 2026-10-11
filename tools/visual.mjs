/*
  How visual is the game? The first screen of every route, measured.

    node tools/visual.mjs            the table, and the mean
    node tools/visual.mjs --json     the same, as JSON

  The target is a game that is mostly picture - the scene, icons, gauges, bars -
  and the measurement has to be one a player would agree with, so it is taken
  from what is on top at each point of a 390x844 phone screen, before any
  scrolling:

    graphic  the topmost element at the point is a canvas, an <svg>, an <img>,
             or carries the `gfx` class (an icon, a gauge, a bar), and no line
             of text is drawn there
    text     anything else that is not the bare page: a line of text, and the
             card, row, chip or button around it - a card full of writing is
             writing, padding included, and a label over the scene is text
    neither  the page's own background (html, body and the bare containers)

  A widget built around a picture - a move tile, a tab with its icon, the HUD's
  bar panel and rings - counts as picture except where its words are drawn: the
  words are still text. The list is PICTURE_LED below, kept here rather than as
  a class in the game's markup, so the instrument's rules are in one place.

  visual% = graphic / (graphic + text), sampled every 6px - over the WHOLE page,
  one screenful at a time, because that is what a player scrolls through to
  play; the first screen alone is reported beside it. A first version measured
  only the first screen and called the game 70% visual while every move was a
  text card below the fold. A crude instrument on purpose: it cannot be argued
  with, and it moves when the screen does.

  Reads the shipped single file (ledger/index.html) through a real browser
  window, so the layout measured is the one a player gets.
*/
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.join(import.meta.dirname, '..');
const require = createRequire(path.join(ROOT, '.harness', 'package.json'));
const { chromium } = require('playwright');

const json = process.argv.includes('--json');
const b = await chromium.launch({ headless: false,
  ...(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : {}) });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })).newPage();
await p.goto('file://' + path.join(ROOT, 'ledger', 'index.html'));
await p.waitForTimeout(800);
await p.fill('#inName', 'Tunde');
await p.click('[data-a="stepnext"]'); await p.click('[data-a="stepnext"]'); await p.click('[data-a="startgame"]');
await p.waitForTimeout(2500);

const routes = await p.evaluate(() => {
  const out = [['overview', '']];
  TABS.forEach((t) => (subsFor(t.id) || []).forEach((s) => out.push([t.id, s.id])));
  return out;
});

const measure = (scrollY) => p.evaluate((scrollY) => {
  window.scrollTo(0, scrollY);
  const W = innerWidth, H = innerHeight, STEP = 6;
  /* every line of text on screen, as rectangles, with the node that draws it */
  const lines = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('script, style')) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const q of r.getClientRects()) {
      if (q.bottom < 0 || q.top > H || q.width < 1) continue;
      lines.push({ q, el });
    }
  }
  const BARE = new Set(['main', 'scene', 'top', 'tabwrap', 'subrow', 'toastHost', 'modalHost']);
  const PICTURE_LED = '.wtile, .tab, .hbars, .hring';
  let gfx = 0, text = 0;
  for (let y = STEP / 2; y < H; y += STEP) {
    for (let x = STEP / 2; x < W; x += STEP) {
      const top = document.elementFromPoint(x, y);
      if (!top) continue;
      const onText = lines.some((l) => x >= l.q.left && x <= l.q.right && y >= l.q.top && y <= l.q.bottom &&
        (top === l.el || top.contains(l.el) || l.el.contains(top)));
      if (onText) { text++; continue; }
      if (top.closest('canvas, svg, img, .gfx, ' + PICTURE_LED) || top.tagName === 'CANVAS') { gfx++; continue; }
      if (BARE.has(top.id) || top === document.body || top === document.documentElement ||
          top.classList.contains('world-stage')) continue;
      text++;
    }
  }
  return { gfx, text };
}, scrollY);
const pct = (g, t) => g + t ? Math.round(g / (g + t) * 1000) / 10 : 0;

const rows = [];
for (const [t, s] of routes) {
  await p.evaluate(([t, s]) => { UI.modal = null; UI.tab = t; UI.sub = s; window.scrollTo(0, 0); render(); window.scrollTo(0, 0); }, [t, s]);
  await p.waitForTimeout(450);
  const height = await p.evaluate(() => document.documentElement.scrollHeight);
  let gfx = 0, text = 0, first = null;
  for (let y = 0; y < height; y += 844) {
    const m = await measure(y);
    gfx += m.gfx; text += m.text;
    if (first === null) first = pct(m.gfx, m.text);
  }
  rows.push({ route: t + (s ? '/' + s : ''), visual: pct(gfx, text), first: first, screens: Math.ceil(height / 844) });
}
await b.close();

const avg = (k) => Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length * 10) / 10;
if (json) console.log(JSON.stringify({ page: avg('visual'), first: avg('first'), rows }, null, 1));
else {
  console.log('route'.padEnd(22) + 'whole page'.padStart(11) + 'first screen'.padStart(14) + '  screens');
  for (const r of rows) console.log(r.route.padEnd(22) + (r.visual + '%').padStart(11) + (r.first + '%').padStart(14) + String(r.screens).padStart(9));
  console.log('\nvisual, mean of ' + rows.length + ' routes: whole page ' + avg('visual') + '% · first screen ' + avg('first') + '%');
}
