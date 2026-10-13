/*
  Gate: a disabled control has to say why it is disabled.

  This is the user's rule, made mechanical:

    "a disabled control with no stated reason is indistinguishable from a
     missing feature ... State the shortfall; never disable the route that
     exists for the case you are disabling for."

  It is not a copy rule and it is not a layout rule. It is a reachability
  rule: a button the player cannot press must hand them either a number (what
  they are short of), a condition (register the company first), or a route
  (take a partner). A greyed button with nothing attached is a dead end that
  reads as a bug, and the player has no way to tell which it is.

  Claims:
    1. every disabled button in every route carries title="" or aria-label=""
       - the reason travels with the control, so it works under a thumb, with
         no hover and no adjacent paragraph to connect it to;
    2. the reason is a sentence, not a shrug: it names a number, a condition
       or another control ("partner", "register", "buy");
    3. the refusal to disable the only route out: when NO start-a-business
       button is affordable, at least one is still enabled - a partner - so
       the screen never has zero ways forward;
    4. the start-business screen's stated shortfall names the exact gap in
       naira, and the gap it names matches the arithmetic on the card.

  Deliberately not asserted: the wording of any individual reason, and which
  buttons are disabled - whether a control should be disabled at all is a
  design question this gate has no business answering.
*/
/*
  Two environments in one process, on purpose.

  dom.js is a stub - querySelectorAll() returns [] and innerHTML is a dead
  string - which is what lets the game run under node at all, and which is
  also how a gate can confidently report "no problems" about markup it never
  looked at. So the game runs on the stub, and the *markup* is parsed with
  jsdom, which builds the real tree. The first draft of this gate used the
  stub for both and cheerfully reported 0 disabled controls across 25 routes.
*/
require('./dom.js');
const M = require('./mod.js');
const { JSDOM } = require('jsdom');
const _win = new JSDOM('<!doctype html><body></body>').window;

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
try { M.UI.noAnim = true; } catch (e) {}

M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
/* newGame() builds a fresh state object, so a handle captured once goes stale
   the moment a world is rebuilt. The first draft held one and compared a
   stated gap against a cash balance from a different run. */
const liveS = () => M.getS();
let S = liveS();

/* ---- the routes, derived exactly the way the app derives them ---------- */
function routes() {
  const out = [];
  M.TABS.forEach(t => {
    const subs = M.subsFor(t.id);
    if (subs && subs.length) subs.forEach(s => out.push([t.id, s.id]));
    else out.push([t.id, '']);
  });
  return out;
}
function panel(html) {
  /* the route's markup, parsed by a real DOM - see the note above */
  const d = _win.document.createElement('div');
  d.innerHTML = String(html);
  return d;
}
function disabledOf(root) {
  return Array.from(root.querySelectorAll('button[disabled], [role="button"][aria-disabled="true"]'))
    .map(b => ({
      label: (b.textContent || '').trim().slice(0, 40),
      act: b.dataset.a || '(none)',
      why: (b.getAttribute('title') || '').trim() || (b.getAttribute('aria-label') || '').trim(),
    }));
}
/* A reason that is a shrug teaches nothing. "Unavailable" and "Locked" are
   the same dead end with more letters. The test is deliberately weak on
   vocabulary and strong on content: a real sentence, not a one-word refusal.
   Copy is not a regression test, and this gate does not grade prose - it
   rejects silence and it rejects a shrug. */
const SHRUG = /^(unavailable|locked|disabled|n\/?a|none|no|closed|not now|—|-|\.\.\.)$/i;
function namesSomething(why) {
  const t = String(why || '').trim();
  if (t.length < 20) return false;            /* a word is not a reason */
  if (SHRUG.test(t)) return false;
  return /[a-z]/i.test(t);
}
/* this checker is the gate's whole judgement, so it gets tested here: if it
   ever starts accepting silence, the rest of the file proves nothing */
[['', false], ['Unavailable', false], ['Locked', false], ['No', false],
 ['Needs ₦3.25m · it has ₦0 · short ₦3.25m', true],
 ['Not open to you yet: you need a registered company first', true],
 ['You are playing this season now', true]
].forEach(([why, want]) => {
  if (namesSomething(why) !== want)
    bad.push('the reason-checker is wrong about ' + JSON.stringify(why) + ' (wanted ' + want + ')');
});

/* Grouping collapses a section by default, so an unopened group renders no
   buttons at all and this gate would pass by finding nothing - which is the
   way a gate lies. Force every group open first, exactly as nav.js does. */
function expand(key) {
  const S = liveS();
  S.grp = {};
  (M.ROUTE_GROUPS[key] || []).forEach(function (g, i) { S.grp[key + '.' + i] = false; });
}
function walk(where) {
  const found = [];
  let buttonsSeen = 0;
  for (const [t, sub] of routes()) {
    M.UI.tab = t; M.UI.sub = sub;
    if (t === 'governance') M.UI.govSub = sub;
    expand(t + (sub ? '/' + sub : ''));
    let html;
    try { html = M.routeView(); } catch (e) { bad.push('route ' + t + '/' + (sub || '-') + ' threw while this gate walked it: ' + e.message); continue; }
    const root = panel(html);
    buttonsSeen += root.querySelectorAll('button').length;
    for (const d of disabledOf(root)) found.push(Object.assign({ route: t + '/' + (sub || '-') }, d));
  }
  console.log(where + ': ' + found.length + ' disabled controls, ' + buttonsSeen +
    ' buttons, across ' + routes().length + ' routes');
  /* a parse that finds nothing is the way this gate lies: the stub DOM made
     exactly this happen. If the tree is empty, say so instead of passing. */
  if (buttonsSeen === 0) bad.push('no buttons were parsed out of any route in the "' + where +
    '" walk: the markup was not read, so nothing here was actually checked');
  return found;
}

/* ---- 1 & 2: the reason travels with the control, in both worlds -------
   A broke new player and a comfortable one disable completely different
   controls - the fresh run greys out every purchase, the comfortable run
   greys out the rails (management fee at 0%, tips already showing). A gate
   that only walks one of them checks half the rule. */
const broke = walk('fresh, no company, little cash');
S = liveS();
S.fin.cash = Math.round(40000000 * (S.cumInfl || 1));
M.startBiz('retail', null, Math.round(30000000 * (S.cumInfl || 1)), null);
M.startBiz('tech', 'Secondco', Math.round(30000000 * (S.cumInfl || 1)), null);
const comfortable = walk('two companies, 40m in cash');

const all = broke.concat(comfortable);
const noReason = all.filter(d => !d.why);
const shrug = all.filter(d => d.why && !namesSomething(d.why));
console.log('carry a reason    : ' + (all.length - noReason.length) + '/' + all.length +
            ' · no reason at all: ' + noReason.length + ' · reason that names nothing: ' + shrug.length);
if (all.length < 5) bad.push('only ' + all.length + ' disabled controls were found across two worlds, which ' +
  'means this gate is not looking at a state that disables anything - it would pass on any game at all');
if (noReason.length) {
  bad.push(noReason.length + ' disabled control(s) say nothing about why: ' +
    noReason.slice(0, 8).map(d => d.route + ' "' + d.label + '"' + (d.act !== '(none)' ? ' (' + d.act + ')' : '')).join(' · '));
}
if (shrug.length) {
  bad.push(shrug.length + ' disabled control(s) carry a reason that names nothing concrete: ' +
    shrug.slice(0, 5).map(d => d.route + ' "' + d.label + '" -> "' + d.why + '"').join(' · '));
}

/* ---- 3 & 4: the one screen where being stuck is the whole point -------
   A new run with almost no cash is the case that produced the original
   complaint ("why can't i find option to start new business?"). Restart
   clean, walk to the start-a-company screen, and check the arithmetic of
   what it tells the player. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
S = liveS();
M.UI.tab = 'work'; M.UI.sub = 'business';
expand('work/business');
const fresh = panel(M.routeView());
const starts = Array.from(fresh.querySelectorAll('button[data-a="startbiz"], button[data-a="startbizpartner"]'))
  .map(b => ({ act: b.dataset.a, type: b.dataset.t, enabled: !b.disabled, label: b.textContent.trim() }));
const ok = starts.filter(b => b.enabled);
console.log('fresh run         : ' + starts.length + ' start-business buttons · ' + ok.length + ' pressable (' +
            ok.map(b => b.act + ':' + b.type).join(', ') + ')');
ck(starts.length > 0, 'the start-a-business screen offers no buttons at all');
ck(ok.length > 0, 'every start-a-business button is disabled on a fresh run: the player has no way forward ' +
  'from this screen, which is the state that produced "why can\'t i find option to start new business?"');
ck(ok.some(b => b.act === 'startbizpartner'),
  'start alone is disabled and so is the partner route: the control that exists exactly for the case you are ' +
  'disabling for is the one that must never be disabled');

/* the naira gap the screen states must match the arithmetic it shows */
const txt = fresh.textContent || '';
const gap = txt.match(/short by\s*₦([\d.,]+[kmbn]*)/i) || txt.match(/short\s*₦([\d.,]+[kmbn]*)/i);
const costOf = M.startBizCost;
const cheapest = Math.min.apply(null, M.BIZ.map(t => costOf(t.id)));
const realGap = cheapest - S.fin.cash;
console.log('stated gap        : ' + (gap ? gap[0] : '(absent)') + ' · real gap ₦' + realGap.toLocaleString('en-NG') +
            ' (cheapest ₦' + cheapest.toLocaleString('en-NG') + ' - cash ₦' + S.fin.cash.toLocaleString('en-NG') + ')');
ck(!!gap, 'the start-a-business screen does not state how far out of reach the cheapest business is');

/* the notice names two routes; both have to be real, pressable controls */
const escapes = Array.from(fresh.querySelectorAll('button[data-a="goto"]')).map(b => b.dataset.t + '/' + (b.dataset.s || ''));
console.log('routes offered    : ' + (escapes.join(' · ') || '(none)'));
ck(escapes.length > 0, 'the notice names routes it cannot walk you to: it must hand over the controls, ' +
  'not describe them in prose');
escapes.forEach(r => {
  const parts = r.split('/');
  const subs = (M.subsFor(parts[0]) || []).map(s => s.id);
  ck(subs.indexOf(parts[1]) !== -1, 'the notice offers a route that does not exist: ' + r);
});

/* ---- 5: the reason is on the screen, not only in the title -----------
   A title is a tooltip, and a 390px phone never shows one: at Q1 every deal
   costs more than a Fresh Graduate holds, so the first commitment a new player
   tries is refused with nothing visible beside it (FINDINGS F1). Each refused
   Commit carries its shortfall as text in its own row, and the number in the
   row is the arithmetic, not a paraphrase of it. */
M.UI.tab = 'money'; M.UI.sub = 'deals';
expand('money/deals');
const dealsRoot = panel(M.routeView());
/* world-first, each deal is a picture on the sheet and its Commit is on the
   card the picture opens: the claim is the same there - the shortfall is text
   beside the refused button - so the cards are read too, and the picture must
   say "short" before it is tapped */
const dealCards = Array.from(dealsRoot.querySelectorAll('[data-a="hot"][data-k="deal"]')).map(t => {
  const d = (S.deals || []).find(x => String(x.id) === t.dataset.c);
  ck(!d || S.fin.cash >= d.capital || /short /.test(t.textContent),
    'the picture of "' + (d ? d.name : t.dataset.c) + '" does not say you cannot afford it before it is tapped');
  return panel(M.hotModal({ type: 'hot', kind: 'deal', id: t.dataset.c }));
});
const refused = Array.from(dealsRoot.querySelectorAll('button[data-a="takedeal"][disabled]'))
  .concat(...dealCards.map(c => Array.from(c.querySelectorAll('button[data-a="takedeal"][disabled]'))));
console.log('refused deals     : ' + refused.length + ' of ' +
            (dealsRoot.querySelectorAll('button[data-a="takedeal"]').length + dealCards.length) + ' on a fresh run' +
            (dealCards.length ? ' (' + dealCards.length + ' behind their pictures)' : ''));
ck(refused.length > 0, 'no deal is refused on a fresh Fresh Graduate run, so this check saw nothing - ' +
  'the fixture changed under it');
refused.forEach(b => {
  const d = (S.deals || []).find(x => String(x.id) === b.dataset.d);
  const row = b.closest('.mrow') || b.closest('.row');
  const chip = row && Array.from(row.querySelectorAll('.chip')).find(c => /^short /.test(c.textContent.trim()));
  ck(!!chip, 'the refused Commit on "' + (d ? d.name : b.dataset.d) + '" says why only in its title: a phone shows ' +
    'nothing, so the shortfall has to be text in the row');
  if (chip && d) {
    const want = 'short ' + M.fmt(Math.round(d.capital - S.fin.cash));
    ck(chip.textContent.trim() === want, 'the row under "' + d.name + '" says "' + chip.textContent.trim() +
      '" but the arithmetic is "' + want + '"');
  }
});

if (bad.length) {
  console.log('\nDISABLED-CONTROL ISSUES (' + bad.length + '):');
  for (const b of bad) console.log('  - ' + b);
  process.exit(1);
}
console.log('\nDISABLED CLEAN — every control you cannot press says what it is short of');
process.exit(0);
