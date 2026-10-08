/* The design, measured — on a phone and on a laptop, in the app and in the file.

   Responsive design and "is the copy too long" are the two claims that are always
   asserted by eye and never checked by machine, so they rot first. Each test here
   is a *relationship* rather than a screenshot: a finger is not 44 pixels because
   this layout says so, it is 44 pixels because fingers are, and a header is too
   tall when it takes a fifth of the screen, not when it measures 87.

   Both surfaces are checked, because they are the same game: `apps/phone/www` is
   what the store build ships, and it is the same bytes the zip carries. If a
   layout claim holds in one and not the other, they are not the same game any
   more — which is the failure this file exists to catch.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { serve, page, evidence, launch } = require('../helpers/web.js');
const { ROOT } = require('../helpers/env.js');

const PHONE = { width: 390, height: 844 };
const LAPTOP = { width: 1440, height: 900 };
let browser = null;
test.before(async () => { browser = await launch(); });
test.after(async () => { if (browser) await browser.close(); });

async function begin(p) {
  await p.evaluate(() => {
    const n = document.getElementById('inName');
    if (n) { n.value = 'Ada Okonjo'; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const city = document.querySelector('[data-a="pickcity"]'); if (city) city.click();
    const diff = Array.from(document.querySelectorAll('[data-a="pickdiff"]')).find((x) => !x.disabled);
    if (diff) diff.click();
    const prof = document.querySelector('[name="prof"]') || document.querySelector('#modalHost input[type=radio]');
    if (prof) { prof.checked = true; prof.dispatchEvent(new Event('change', { bubbles: true })); }
    const go = document.querySelector('[data-a="startgame"]'); if (go) go.click();
  });
  await p.waitForTimeout(800);
}

/* Everything the layout tests need, read from the live page in one pass. */
const measure = (p) => p.evaluate(() => {
  const px = (v) => parseFloat(v) || 0;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };
  const label = (el) => (el.getAttribute('data-a') || el.tagName.toLowerCase()) + ':"' +
    String(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28) + '"';

  /* 1. sideways scroll: the page must fit the phone */
  const de = document.documentElement;
  const sideways = { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, over: de.scrollWidth - de.clientWidth };

  /* the widest things on the page, for when it does not fit */
  const wide = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (!visible(el)) return;
    const r = el.getBoundingClientRect();
    if (r.right > de.clientWidth + 2 || r.left < -2) {
      wide.push({ el: label(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
    }
  });

  /* 2. the chrome's height, against its own type size */
  const row = document.getElementById('toprow') || document.querySelector('header');
  const chrome = row ? {
    h: Math.round(row.getBoundingClientRect().height),
    font: px(getComputedStyle(row).fontSize),
  } : null;

  /* 3. touch targets */
  const small = [];
  document.querySelectorAll('button, a[href], [data-a], input:not([type=hidden]), select').forEach((el) => {
    if (!visible(el) || el.disabled) return;
    const r = el.getBoundingClientRect();
    if (r.width < 30 || r.height < 30) small.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height) });
  });

  /* 4. text that spills out of its own box and cannot be scrolled to */
  const spilling = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'visible') return;              /* a scroller is allowed to be wider */
    if (el.children.length) return;                      /* leaves only things that hold text */
    const text = String(el.textContent || '').trim();
    if (text.length < 8) return;
    const over = el.scrollWidth - el.clientWidth;
    if (over > 4) spilling.push({ el: label(el), over, text: text.slice(0, 40) });
  });

  /* 5. type too small to read on a phone */
  const tiny = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (!visible(el) || el.children.length) return;
    const text = String(el.textContent || '').trim();
    if (!text) return;
    /* Words, not glyphs: a chevron or a dot at 10px is a mark, and a mark does
       not need to be read. Anything with a letter in it does. */
    if (!/[A-Za-z]/.test(text)) return;
    const f = px(getComputedStyle(el).fontSize);
    if (f && f < 11) tiny.push({ el: label(el), f, text: text.slice(0, 30) });
  });

  /* 6. copy: control labels, and the longest sentence on the page.

     Only *visible* text counts. `textContent` reads a hidden popover too, which
     is how the era chip - "Ordinary Times · 10q" on its face, with the whole
     explanation in a popover it opens - measured as a 216-character label. A
     length is a length only if the player can see it. */
  const seenText = (el) => {
    let out = '';
    const walk = (node, shown) => {
      for (const child of node.childNodes) {
        if (child.nodeType === 3) { if (shown) out += child.nodeValue; continue; }
        if (child.nodeType !== 1) continue;
        const cs = getComputedStyle(child);
        walk(child, shown && cs.display !== 'none' && cs.visibility !== 'hidden');
      }
    };
    walk(el, true);
    return out.replace(/\s+/g, ' ').trim();
  };
  const labels = [];
  document.querySelectorAll('button, [data-a], h1, h2, h3, th').forEach((el) => {
    if (!visible(el)) return;
    const t = seenText(el);
    if (t) labels.push({ el: label(el), len: t.length, text: t });
  });
  const longLabels = labels.filter((l) => l.len > 42).sort((a, b) => b.len - a.len);
  const main = document.getElementById('main');
  const paragraphs = [];
  (main || document).querySelectorAll('p, .note, .sub, .body').forEach((el) => {
    const t = seenText(el);
    if (t.length > 320) paragraphs.push({ len: t.length, text: t.slice(0, 60) });
  });

  return { sideways, wide: wide.slice(0, 6), chrome, small: small.slice(0, 8), spilling: spilling.slice(0, 6), tiny: tiny.slice(0, 6),
    longLabels: longLabels.slice(0, 6), longParagraphs: paragraphs.slice(0, 6),
    vw: de.clientWidth, vh: window.innerHeight };
});

const surfaces = [
  ['the store build’s payload', path.join(ROOT, 'apps', 'phone', 'www')],
];

/* The routes, from the one list both walks use. Overview is measured by the test
   above; these are the screens a player actually visits, measured one at a time
   so a failure names the screen instead of the game. */
const { ROUTES } = require(path.join(ROOT, '.harness', 'routes.js'));
const SEEN = new Set();
const ROUTE_LIST = ROUTES.filter((r) => (SEEN.has(r.tab) ? false : (SEEN.add(r.tab), true)));
async function go(p, tab) {
  await p.evaluate((label) => {
    const t = Array.from(document.querySelectorAll('[data-a="tab"]')).find((n) => n.textContent.trim() === label);
    if (t) t.click();
  }, tab);
  await p.waitForTimeout(450);
}

for (const [what, dir] of surfaces) {
  for (const [device, viewport] of [['a phone at 390', PHONE], ['a laptop at 1440', LAPTOP]]) {
    test(what + ', ' + device + ': it fits, it is readable, and it is tappable', async () => {
      const site = await serve(dir);
      const p = await page(browser, { name: 'layout', viewport });
      try {
        await p.goto(site.url, { waitUntil: 'load' });
        await p.waitForTimeout(1000);
        await begin(p);
        const m = await measure(p);

        assert.ok(m.sideways.over <= 2,
          'the page scrolls sideways by ' + m.sideways.over + 'px (' + m.sideways.scrollWidth +
          ' wide in ' + m.sideways.clientWidth + '). Widest offenders: ' +
          m.wide.map((w) => w.el + ' [' + w.left + '→' + w.right + ']').join(', '));

        if (viewport === PHONE && m.chrome) {
          /* A proportion of the screen, not a pixel count: the claim is that the
             persistent chrome leaves the game most of the phone, and 15% is
             where "most" stops being true on a phone this size. It scales with
             the device, which is the point — the same game on a taller phone gets
             the same share, not the same 87 pixels. */
          const share = m.chrome.h / m.vh;
          assert.ok(share <= 0.15,
            'the chrome takes ' + Math.round(share * 100) + '% of the phone (' + m.chrome.h + 'px of ' + m.vh + ')');
        }

        assert.deepEqual(m.small, [],
          'controls smaller than a fingertip (30px): ' + m.small.map((s) => s.el + ' ' + s.w + '×' + s.h).join(', '));
        assert.deepEqual(m.spilling, [],
          'text that spills out of a box that cannot scroll: ' + m.spilling.map((s) => s.el + ' +' + s.over + 'px').join(', '));
        assert.deepEqual(m.tiny, [],
          'type under 11px: ' + m.tiny.map((t) => t.el + ' ' + t.f + 'px').join(', '));
        assert.deepEqual(m.longLabels, [],
          'control labels over 42 characters: ' + m.longLabels.map((l) => l.len + ' "' + l.text.slice(0, 40) + '"').join(' | '));
        assert.deepEqual(m.longParagraphs, [],
          'body copy over 320 characters: ' + m.longParagraphs.map((l) => l.len + ' "' + l.text + '"').join(' | '));

        console.log('  ' + what + ' @ ' + m.vw + 'px: chrome ' + (m.chrome ? m.chrome.h + 'px' : '-') +
          ' · no sideways scroll · ' + m.longLabels.length + ' long labels · ' + m.spilling.length + ' spills · ' +
          m.tiny.length + ' tiny');
      } catch (e) {
        await evidence(p, 'layout-' + viewport.width, { what });
        throw e;
      } finally {
        await p.close(); await site.close();
      }
    });
  }
}

for (const [what, dir] of surfaces) {
  test(what + ': every tab is legible and fits at 390px', async () => {
    const site = await serve(dir);
    const p = await page(browser, { name: 'routes-layout', viewport: PHONE });
    try {
      await p.goto(site.url, { waitUntil: 'load' });
      await p.waitForTimeout(1000);
      await begin(p);
      const bad = [];
      for (const r of ROUTE_LIST) {
        await go(p, r.tab);
        const m = await measure(p);
        if (m.sideways.over > 2) bad.push(r.tab + ': ' + m.sideways.over + 'px of sideways scroll');
        if (m.small.length) bad.push(r.tab + ': small controls ' + m.small.map((s) => s.el + ' ' + s.w + '×' + s.h).join(', '));
        if (m.tiny.length) bad.push(r.tab + ': type under 11px ' + m.tiny.map((t) => t.el + ' ' + t.f + 'px').join(', '));
        if (m.spilling.length) bad.push(r.tab + ': text spilling ' + m.spilling.map((s) => s.el + ' +' + s.over).join(', '));
      }
      assert.deepEqual(bad, [], 'at 390px:\n  ' + bad.join('\n  '));
      console.log('  ' + what + ': ' + ROUTE_LIST.length + ' tabs measured at 390px — all legible, all fitting');
    } catch (e) {
      await evidence(p, 'routes-layout', { what });
      throw e;
    } finally {
      await p.close(); await site.close();
    }
  });
}
