/* Gate: the teaching hint on every screen.

   Every route in the game carries one line saying what the screen is for and
   why you should care. It is the difference between a dashboard and a game
   that explains itself. The cost of the rule is that a new route ships with no
   hint and nothing complains — so this gate complains.

   Claims:
     1. every reachable route has a hint
     2. no hint is a placeholder - each one is a real sentence
     3. no hint is orphaned: none of them points at a route that no longer exists
     4. the hint actually renders on the screen it belongs to

   Deliberately not asserted: the wording of any individual hint. Copy is not
   a regression test. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
try { M.UI.noAnim = true; } catch (e) {}

M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
const S = M.getS();

/* ---- the full route list, derived the same way the app derives it ------ */
const routes = [];
M.TABS.forEach(t => {
  const subs = M.subsFor(t.id);
  if (subs && subs.length) subs.forEach(s => routes.push(t.id + '/' + s.id));
  else routes.push(t.id);
});

const WHY = M.ROUTE_WHY || {};
ck(routes.length > 0, 'no routes enumerated at all');

/* ---- 1: every route has a hint ---------------------------------------- */
routes.forEach(r => {
  if (!WHY[r]) bad.push('ROUTE_WHY has no entry for: ' + r);
});
const missing = routes.filter(r => !WHY[r]);
console.log('routes           : ' + routes.length + ' · hints ' + Object.keys(WHY).length +
            ' · missing ' + missing.length);

/* ---- 2: no placeholder hints ------------------------------------------ */
Object.keys(WHY).forEach(k => {
  const t = WHY[k];
  if (typeof t !== 'string' || t.trim().length < 40)
    bad.push('hint for ' + k + ' is too short to teach anything (' +
             (t ? t.trim().length : 0) + ' chars)');
});

/* ---- 3: no orphans ---------------------------------------------------- */
Object.keys(WHY).forEach(k => {
  if (routes.indexOf(k) === -1) bad.push('ROUTE_WHY entry points at a route that does not exist: ' + k);
});

/* ---- 4: it renders behind the ?, and NOT in the content ---------------- */
{
  let chipped = 0, leaked = 0, dismissed = 0;
  routes.forEach(r => {
    const parts = r.split('/');
    M.UI.tab = parts[0];
    M.UI.sub = parts[1] || null;
    M.UI.whyOpen = null;
    S.why = {};                       /* un-dismiss everything */
    const hint = M.whyText();
    if (!hint || hint.length < 20){ bad.push('no hint for: ' + r); return; }

    /* the chip carries the hint, and hides it inside the popover element */
    const chip = M.whyHTML();
    if (!chip.includes(hint)) bad.push('the ? does not carry the hint on: ' + r);
    if (!/class="whypop"/.test(chip)) bad.push('the hint is not inside a popover on: ' + r);
    if (!/class="whyq"/.test(chip)) bad.push('no ? control rendered on: ' + r);
    if (chip.includes('<div class="card"')) bad.push('the hint is still a full-width card on: ' + r);
    chipped++;

    /* the point of the change: the hint must not be in the screen's content.
       If someone puts the banner back, this fails. */
    const view = M.routeView();
    if (view.includes(M.ROUTE_WHY[r])) leaked++;

    /* dismissing it takes the chip away, and only on that screen */
    S.why = {}; S.why[r] = true;
    if (M.whyHTML() !== '') bad.push('dismissing the tip did not remove the ? on: ' + r);
    else dismissed++;
    S.why = {};
  });
  ck(leaked === 0, leaked + ' route(s) still print the hint into the page body');
  console.log('behind the ?     : ' + chipped + '/' + routes.length + ' screens · ' +
              dismissed + ' dismissible · ' + leaked + ' leaked into the content');
}

/* ---- 5: tapping the ? pins it open, tapping again closes it ----------- */
{
  M.UI.tab = 'work'; M.UI.sub = 'business'; S.why = {}; M.UI.whyOpen = null;
  const key = M.routeKey();
  M.ACT.whyopen({ dataset: { k: key } });
  ck(M.UI.whyOpen === key, 'tapping the ? did not pin the hint open');
  M.ACT.whyopen({ dataset: { k: key } });
  ck(M.UI.whyOpen === null, 'tapping the ? again did not close it');
  /* and it is restored from settings, or dismissing would be permanent */
  M.ACT.hidewhy({ dataset: { k: key } });
  ck((S.why || {})[key], 'Got it did not record the dismissal');
  ck(M.whyHTML() === '', 'the ? should be gone once dismissed');
  M.ACT.showwhy();
  ck(M.whyHTML() !== '', 'Show all tips again did not bring the ? back');
}

/* ---- 6: the route key actually resolves on the screen you land on -----
   The overview tab is 'overview' in TABS, but starting a run used to set
   UI.tab to 'dash'. Every table keyed by tab id therefore missed it, and the
   screen everybody lands on first had no hint, no grouping and no sub-tabs.
   The gate above walks the ids from TABS, so it passed while the real game
   silently had nothing. This tests the way the game actually enters a run. */
{
  ck(M.normTab('dash') === 'overview', "'dash' should normalise to 'overview'");
  ck(M.normTab('') === 'overview', 'an empty tab should fall back to overview');
  ck(M.normTab('work') === 'work', 'a real tab id should pass through untouched');
  M.ACT.startgame();
  const key = M.routeKey();
  ck(!!M.ROUTE_WHY[key], 'the screen a new run lands on has no hint: ' + key);
  ck(!!M.whyText(), 'no hint on the screen a new run lands on');
  if (M.subsFor) ck(M.subsFor(M.normTab(M.UI.tab)) === null || Array.isArray(M.subsFor(M.normTab(M.UI.tab))),
    'subsFor broke on the landing tab');
  console.log('landing screen   : ' + key + ' · hint present, grouping resolves');
}

if (bad.length) { console.log('\nWHY FAIL'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nWHY CLEAN');
