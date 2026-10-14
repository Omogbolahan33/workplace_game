/* Gate: mobile-first at 390px (the standing constraint, never actually tested).

   Everything before this gate was measured with a stub DOM that cannot lay
   anything out, so "it works on mobile" was an assumption. This one drives a
   real Chromium at 390x844 and measures.

   It claims:

     1. nothing scrolls sideways - no route, no modal, at 390px
     2. no element sticks out past the viewport (scrollable strips excused)
     3. every control is thumb-sized: 30px or more in height
     4. the pinned chrome is small - the nav strips stay, the stat row scrolls
     5. the laptop layout is untouched by any of it

   It serves its own copy of the app on an ephemeral port, so a dead preview
   server cannot make it pass. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'ledger');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rq) => {
      const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(f, (e, d) => {
        if (e) { rq.writeHead(404); rq.end('no'); return; }
        rq.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
        rq.end(d);
      });
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

(async () => {
  const { srv, port } = await serve();
  const b = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });

  await p.evaluate(() => {
    newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic' });
    S.fin.cash = 40000000;
    startBiz('tech', 'Testco', 6000000, null);
    for (let i = 0; i < 6; i++) advanceQuarter();
  });

  const routes = await p.evaluate(() => {
    const r = [];
    TABS.forEach(t => { const ss = subsFor(t.id);
      if (!ss) r.push([t.id, '']); else ss.forEach(x => r.push([t.id, x.id])); });
    return r;
  });

  let over = 0, tiny = 0, chromeMax = 0, widest = 0;
  const tinySeen = new Map(), overSeen = new Map();

  for (const [t, s] of routes) {
    const r = await p.evaluate(({ t, s }) => {
      UI.tab = t; UI.sub = s || ''; if (t === 'governance') UI.govSub = s;
      UI.modal = null; UI.scrollTop = true; render();
      const W = window.innerWidth;
      const o = { sw: document.documentElement.scrollWidth, W, pinned: 0, stickyTop: '', over: [], tiny: [] };
      const wrap = document.getElementById('tabwrap');
      if (wrap) { o.pinned = Math.round(wrap.getBoundingClientRect().height);
                  o.stickyTop = getComputedStyle(wrap).position; }
      o.topSticky = getComputedStyle(document.getElementById('top')).position;
      document.querySelectorAll('#main *').forEach(el => {
        const b = el.getBoundingClientRect();
        if (!b.width && !b.height) return;
        if (b.right > W + 0.5 || b.left < -0.5) {
          if (el.closest('.tabs,.subs,table')) return;      // deliberately scrollable
          /* a shape inside a drawing: the <svg> clips its content to its own
             box, and that box is measured here like any element - so a picture
             cropped to its people (its viewBox narrowed) cannot overflow by
             what it does not show */
          if (el.ownerSVGElement) return;
          o.over.push(el.tagName.toLowerCase() + '.' + (el.className || '').toString().slice(0, 30));
        }
      });
      document.querySelectorAll('#main button,#main input,#main select,#toprow button,.tab,.sub')
        .forEach(el => {
          const b = el.getBoundingClientRect();
          if (!b.width || !b.height) return;
          if (b.height < 30) o.tiny.push(el.tagName.toLowerCase() + '.' +
            (el.className || '').toString().slice(0, 22) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
        });
      return o;
    }, { t, s });

    const key = t + (s ? '/' + s : '');
    if (r.sw > r.W) { over++; overSeen.set(key, 'scrollWidth ' + r.sw); }
    if (r.over.length) { over++; overSeen.set(key, r.over.slice(0, 3).join(', ')); }
    if (r.tiny.length) { tiny += r.tiny.length; tinySeen.set(key, r.tiny.slice(0, 3).join(', ')); }
    chromeMax = Math.max(chromeMax, r.pinned);
    widest = Math.max(widest, r.sw);
    ck(r.topSticky === 'static', key + ': the stat row is still pinned on mobile (position:' + r.topSticky + ')');
    ck(r.stickyTop === 'sticky', key + ': the nav strips are not pinned (position:' + r.stickyTop + ')');
  }

  /* the whole point of the change: scrolled, the nav is still there and the
     stat row is gone */
  const scrolled = await p.evaluate(() => {
    UI.tab = 'work'; UI.sub = 'business'; render();
    window.scrollTo(0, 900);
    const g = id => { const b = document.getElementById(id).getBoundingClientRect();
      return { top: Math.round(b.top), bot: Math.round(b.bottom) }; };
    return { y: Math.round(window.scrollY), tw: g('tabwrap'), tr: g('toprow') };
  });
  ck(scrolled.tw.top === 0, 'scrolled: the nav is not pinned (top ' + scrolled.tw.top + ')');
  ck(scrolled.tr.bot < 0, 'scrolled: the stat row did not scroll away (bottom ' + scrolled.tr.bot + ')');

  /* modals at 390 */
  const modals = await p.evaluate(() => {
    const W = window.innerWidth, out = [];
    const tryIt = (name, make) => { UI.modal = make; render();
      const m = document.querySelector('#modalHost > *');
      if (!m) { out.push([name, 'no modal rendered']); return; }
      const b = m.getBoundingClientRect();
      if (b.right > W + 0.5 || m.scrollWidth > W + 0.5) out.push([name, 'overflows ' + Math.round(b.width)]);
      UI.modal = null; render();
    };
    tryIt('settings', { type: 'settings' });
    tryIt('help', { type: 'help' });
    return out;
  });
  modals.forEach(([n, why]) => ck(false, 'modal "' + n + '" ' + why));

  /* §22.13: the notification panel has to open on-screen at 390px. Anchored to
     the 30px bell it hung 176px off the left edge, which no amount of reading
     the CSS would have told me - only measuring it did. It anchors to the
     action group now, whose right edge is the right edge of the row. */
  const bell = await p.evaluate(() => {
    UI.tab = 'money'; UI.sub = 'deals'; render();
    const btn = document.querySelector('.bellbtn');
    if (!btn) return { err: 'the header has no notification bell' };
    const bh = Math.round(btn.getBoundingClientRect().height);
    UI.bellOpen = true; renderTop();
    const pop = document.querySelector('.bellpop');
    const b = pop.getBoundingClientRect();
    const body = document.querySelector('.bellbody');
    return { x: Math.round(b.x), r: Math.round(b.right), h: Math.round(b.height),
      W: window.innerWidth, vh: window.innerHeight, btnH: bh,
      rows: document.querySelectorAll('.nitem').length,
      btns: document.querySelectorAll('.nitem button').length,
      bodyScrolls: body.scrollHeight > body.clientHeight + 1 };
  });
  ck(!bell.err, 'mobile: ' + bell.err);
  if (!bell.err) {
    ck(bell.x >= -0.5 && bell.r <= bell.W + 0.5,
       'the notification panel hangs off the phone screen (' + bell.x + '..' + bell.r + ' of ' + bell.W + ')');
    ck(bell.h <= bell.vh, 'the notification panel is taller than the phone (' + bell.h + ' vs ' + bell.vh + ')');
    ck(bell.btnH >= 30, 'the bell is a ' + bell.btnH + 'px tap target');
    ck(bell.rows > 0 && bell.btns === bell.rows,
       'the panel lists ' + bell.rows + ' rows but ' + bell.btns + ' buttons');
    console.log('bell panel         : ' + bell.x + '..' + bell.r + ' of ' + bell.W +
                ' · ' + bell.rows + ' rows · body scrolls=' + bell.bodyScrolls);
  }

  /* §22.14: the era chip joined the header, and the season chip was already
     here. All three popovers anchor to the action group now, because anchored
     to their own chip they hung off the left of a 390px screen - the era one
     started at x=-107. And the header must stay two rows: adding the era chip
     pushed it to three (118px) until Settings became a glyph. */
  const pops = await p.evaluate(() => {
    /* without a season there is no .seapop to bound, so the widest layout the
       header ever has to survive would go untested */
    S.season = { code: 'LAGOS-K7QP', name: 'Test', end: { year: 2046, q: 1 }, hardStop: true, start: 0 };
    UI.bellOpen = true; UI.eraOpen = true; UI.seaOpen = true; renderTop();
    const W = window.innerWidth, out = [];
    ['.bellpop', '.erapop', '.seapop'].forEach(sel => {
      const e = document.querySelector(sel);
      if (!e) { out.push([sel, null, null]); return; }
      const b = e.getBoundingClientRect();
      out.push([sel, Math.round(b.x), Math.round(b.right)]);
    });
    /* Rows, by clustering vertical centres. Counting distinct top-edges is
       wrong: the children are align-items:center, so two items on the same
       row have different tops whenever they have different heights - which
       reported two rows as three. */
    const tr = document.getElementById('toprow');
    const cs = Array.from(tr.children).map(e => {
      const b = e.getBoundingClientRect(); return (b.top + b.bottom) / 2;
    }).sort((a, b) => a - b);
    let rows = cs.length ? 1 : 0;
    for (let i = 1; i < cs.length; i++) if (cs[i] - cs[i - 1] > 10) rows++;
    return { out, W, h: Math.round(tr.getBoundingClientRect().height), rows,
      chips: Array.from(document.querySelectorAll('.erachip,.seachip'))
        .map(e => Math.round(e.getBoundingClientRect().height)) };
  });
  pops.out.forEach(([sel, x, r]) => {
    if (x === null) return;
    ck(x >= -0.5 && r <= pops.W + 0.5, sel + ' hangs off the phone screen (' + x + '..' + r + ' of ' + pops.W + ')');
  });
  ck(pops.rows <= 2, 'the header is ' + pops.rows + ' rows on a phone (' + pops.h + 'px) - it must wrap to two');
  ck(pops.h <= 95, 'the header is ' + pops.h + 'px on a phone - the budget is 95');
  pops.chips.forEach(h => ck(h >= 30, 'a header chip is a ' + h + 'px tap target'));
  console.log('header rows        : ' + pops.rows + ' · ' + pops.h + 'px · chips ' + pops.chips.join('/') + 'px');
  console.log('popovers           : ' + pops.out.filter(o => o[1] !== null)
    .map(o => o[0] + ' ' + o[1] + '..' + o[2]).join('  '));

  await p.close();

  /* 5: the laptop must not have inherited any of this */
  const p2 = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p2.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  const lap = await p2.evaluate(() => {
    newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic' });
    S.fin.cash = 40000000; startBiz('tech', 'Testco', 6000000, null);
    for (let i = 0; i < 6; i++) advanceQuarter();
    UI.tab = 'work'; UI.sub = 'business'; render();
    return { top: getComputedStyle(document.getElementById('top')).position,
             wrap: getComputedStyle(document.getElementById('tabwrap')).position,
             toprow: Math.round(document.getElementById('toprow').getBoundingClientRect().height) };
  });
  ck(lap.top === 'sticky', 'the laptop header stopped being sticky (got ' + lap.top + ')');
  ck(lap.wrap === 'static', 'the laptop layout changed: #tabwrap is ' + lap.wrap);
  const lapScroll = await p2.evaluate(() => {
    window.scrollTo(0, 900);
    const g = id => Math.round(document.getElementById(id).getBoundingClientRect().top);
    return { tr: g('toprow'), tw: g('tabwrap') };
  });
  ck(lapScroll.tr === 0, 'laptop: the stat row stopped being pinned (top ' + lapScroll.tr + ')');
  /* Assert the relationship, not a pixel count. This was hard-coded to the old
     header height, so any change to the header failed it for no reason - the
     thing being tested is that the nav sits directly beneath the stat row. */
  ck(lapScroll.tw === lap.toprow,
     'laptop: the nav is not stacked directly under the stat row (nav top ' + lapScroll.tw +
     ', header height ' + lap.toprow + ')');
  console.log('laptop scrolled    : toprow ' + lapScroll.tr + ', tabwrap ' + lapScroll.tw + ' - unchanged');

  await b.close(); srv.close();

  console.log('routes measured    : ' + routes.length + ' at 390x844');
  console.log('widest scrollWidth : ' + widest + 'px (viewport 390)');
  console.log('pinned chrome      : ' + chromeMax + 'px  (was 162 - the whole header, permanently)');
  console.log('controls under 30px: ' + tiny);
  console.log('overflowing routes : ' + over);
  ck(over === 0, over + ' route(s) overflow sideways at 390px');
  ck(tiny === 0, tiny + ' control(s) under 30px tall - not thumb-sized');
  ck(chromeMax <= 90, 'pinned chrome is ' + chromeMax + 'px, budget is 90');
  console.log('laptop             : #top ' + lap.top + ', #tabwrap ' + lap.wrap + ', toprow ' + lap.toprow + 'px');

  tinySeen.forEach((v, k) => console.log('   too small  ' + k + ': ' + v));
  overSeen.forEach((v, k) => console.log('   overflow   ' + k + ': ' + v));

  if (bad.length) { console.log('\nMOBILE ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
  console.log('\nMOBILE CLEAN');
})().catch(e => { console.error('MOBILE THREW: ' + e.message); process.exit(1); });
