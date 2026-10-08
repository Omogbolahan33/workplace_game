/* Gate: §22.14 — the era lives in a header chip, and its countdown works.

   eraBanner() sat at the top of four screens (Overview, People, Deals, money)
   carrying the same line of explanation on each. It is a chip in the header
   now, beside the season chip, and this gate claims:

     1. the countdown actually counts. The banner read
            const left = (S.era.until || 0) - S.turn;
        and the era object has no `until` — initEra() and stepEra() both write
        `end`. left was therefore always negative and the card always said
        "turning". It shipped like that and no test could have caught it,
        because no test looked. This one does.
     2. the era is in the header and in no route body
     3. nothing the banner said was lost — headline, effect, the one line of
        explanation — it is all in the popover
     4. the tone dot matches the era
     5. every era renders, and the effect line is honest: 'calm' really does
        do nothing, so it says so rather than printing zeros
     6. the tap-pin survives a re-render, like the other three popovers */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const toprowHTML = () => global.document.getElementById('toprow').innerHTML;

M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();

/* --- 1: the countdown counts --------------------------------------------- */
const l0 = M.eraLeft();
ck(l0 > 0, 'a fresh run has no era countdown (eraLeft() = ' + l0 + ')');
ck(l0 === Math.max(0, (S.era.end || 0) - S.turn),
   'eraLeft() disagrees with S.era.end - S.turn (' + l0 + ' vs ' + ((S.era.end || 0) - S.turn) + ')');
M.advanceQuarter();
ck(M.eraLeft() === l0 - 1, 'the countdown did not tick down (' + l0 + ' -> ' + M.eraLeft() + ')');
M.advanceQuarter();
ck(M.eraLeft() === l0 - 2, 'the countdown did not tick down on the second quarter');
console.log('countdown      : ' + l0 + ' -> ' + M.eraLeft() + ' over two quarters');

/* the old bug, stated as behaviour: the banner could never show a number */
M.renderTop();
ck(!/turning/.test(toprowHTML()), 'the era chip says "turning" — the until/end bug is back');
ck(new RegExp('<b style="color:[^"]*">' + M.eraLeft() + '</b>q').test(toprowHTML()),
   'the chip does not show the countdown as a number');

/* --- rollover: when an era ends the next one must also count -------------- */
S.era.end = M.getS().turn;               /* it expires this quarter */
M.advanceQuarter();
ck(M.eraLeft() > 0, 'after an era turned over the countdown is ' + M.eraLeft() + ' — it must be positive');
ck(M.eraLeft() === Math.max(0, (S.era.end || 0) - M.getS().turn), 'after a rollover eraLeft() is wrong');
console.log('after rollover : ' + M.eraById(S.era.id).name + ' · ' + M.eraLeft() + 'q left');

/* --- 2: in the header, in no route body ---------------------------------- */
const MARK = 'Eras change what works';   /* the line the four cards repeated */
M.renderTop();
ck(/class="erachip/.test(toprowHTML()), 'renderTop() emits no era chip');
ck(toprowHTML().indexOf(MARK) >= 0, 'the explanation did not survive the move into the popover');
ck(/data-a="eratoggle"/.test(toprowHTML()), 'the era chip has no toggle action');

const routes = [];
M.TABS.forEach(t => {
  const ss = M.subsFor(t.id);
  if (!ss) routes.push([t.id, '']); else ss.forEach(x => routes.push([t.id, x.id]));
});
ck(routes.length >= 23, 'only ' + routes.length + ' routes discovered');
let dirty = 0;
for (const [t, s] of routes) {
  M.UI.tab = t; M.UI.sub = s || ''; M.UI.focus = '';
  let r = '';
  try { r = M.routeView(); } catch (e) { bad.push(t + '/' + s + ' threw: ' + e.message); continue; }
  if (r.indexOf(MARK) >= 0) { bad.push(t + '/' + s + ' still carries the era card'); dirty++; }
  if (/erachip/.test(r))    { bad.push(t + '/' + s + ' carries an era chip in its body'); dirty++; }
}
console.log('route bodies   : ' + routes.length + ' clean · ' + dirty + ' still carrying the era');

/* --- 3 + 4: every era renders, with its tone and its effect -------------- */
const seen = [];
M.ERAS.forEach(e => {
  S.era.id = e.id; S.era.end = M.getS().turn + 5;
  M.renderTop();
  const h = toprowHTML();
  const tone = M.ERA_TONE[e.tone] || 'var(--acc)';
  ck(h.indexOf('erachip') >= 0, e.id + ': no chip rendered');
  ck(h.indexOf(e.name) >= 0, e.id + ': the chip is missing the era name');
  ck(h.indexOf('<i style="background:' + tone + '">') >= 0,
     e.id + ': the tone dot is not ' + tone);
  ck(h.indexOf(M.esc(e.head)) >= 0 || h.indexOf(e.head) >= 0,
     e.id + ': the headline did not survive the move');
  const fx = M.eraFxLine(e);
  if (e.id === 'calm') {
    ck(fx === '', 'calm should have nothing to report, got "' + fx + '"');
    ck(/Nothing out of the ordinary/.test(h), 'calm does not say so in plain words');
  } else {
    ck(fx.length > 0, e.id + ': the effect line is empty — the popover tells you nothing');
    ck(h.indexOf(M.esc(fx)) >= 0 || h.indexOf(fx) >= 0, e.id + ': the effect line is not in the popover');
  }
  seen.push(e.id + ':' + (fx || '—'));
});
console.log('eras           : ' + M.ERAS.length + ' rendered');
console.log('  effects      : ' + seen.join(' | ').slice(0, 150));

/* --- 6: the pin survives a re-render ------------------------------------- */
M.UI.eraOpen = false;
M.ACT.eratoggle();
ck(M.UI.eraOpen === true, 'eratoggle did not pin the popover open');
M.renderTop();
ck(/erachip open/.test(toprowHTML()), 'a re-render lost the pinned era popover');
M.render();
ck(/erachip open/.test(toprowHTML()), 'a full render lost the pinned era popover');
M.ACT.eratoggle();
ck(M.UI.eraOpen === false, 'eratoggle did not close it again');
console.log('pin            : survives renderTop() and render()');

/* the chip must not pretend when there is no era at all */
S.era = null;
M.renderTop();
ck(!/erachip/.test(toprowHTML()), 'a run with no era renders an empty era chip');
console.log('no era         : chip absent');

if (bad.length) { console.log('\nERA ISSUES:'); bad.forEach(b => console.log(' - ' + b)); process.exit(1); }
console.log('\nERA CLEAN');
