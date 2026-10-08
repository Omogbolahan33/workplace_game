/* Gate: P5 — "what should I do next", now the header bell (§22.13).

   The guidance used to be a card at the top of every screen. The content was
   right and the placement was wrong: twenty screens, one sentence, and no
   count. It is a bell in the header now, so this gate asserts:

     1. the bell exists in the header, and the badge counts only what needs
        you (bad + warn) — never the 'worth doing' suggestions, because a
        number that is never zero is a number you stop reading
     2. the list is never empty — being told there is nothing to do is itself
        the answer a lost player needs, on a brand-new run as on a rich one
     3. nothing is scattered: no route body carries a rail any more
     4. honest destinations — every (tab, sub) a notification names exists
     5. it reaches the control, not just the tab — when it names a card, the
        group hiding that card opens and the card is flashed
     6. acting closes it, and the pin survives a re-render until you do

   Deliberately weak claim: the *ranking* is not asserted. Which fire matters
   most is a design judgement that will keep changing. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const strip = h => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const toprowHTML = () => global.document.getElementById('toprow').innerHTML;

let S = null;

/* --- 2: never empty, even before anything has happened ------------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
S = M.getS();
S.fin.cash = 40000000;
ck(M.nextActions().length > 0, 'a brand-new run has no next action at all');
ck(M.notifGroups().length > 0, 'a brand-new run has no notification group at all');
const fresh = M.nextActions().map(a => a.text).join(' | ');
console.log('no company yet : ' + fresh.slice(0, 96));

M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) M.advanceQuarter();
const acts = M.nextActions();
ck(acts.length > 0, 'a six-quarter run has no next action');
console.log('after 6q       : ' + acts.length + ' actions, top = ' + acts[0].lv + '/' + acts[0].pri);

/* --- 1: the badge counts only what needs you ----------------------------- */
/* Manufacture a fire the badge can be checked against, rather than hoping the
   six-quarter run happens to have lit one. A cash-negative company is 'bad'. */
ck(!!S.biz, 'startBiz left no active company');
S.biz.cash = -500000;
const m1 = M.notifCounts();
ck(m1.bad > 0, 'a cash-negative company produced no bad notification');
ck(m1.urgent === m1.bad + m1.warn, 'urgent is not bad + warn');
M.renderTop();
let top = toprowHTML();
const b1 = top.match(/class="bellbadge([^"]*)">(\d+)</);
ck(!!b1, 'the bell shows no badge while a company is insolvent');
if (b1) {
  ck(Number(b1[2]) === m1.urgent, 'badge says ' + b1[2] + ' but ' + m1.urgent + ' things need you');
  ck(/bad/.test(b1[1]), 'the badge is not red while something is on fire');
  console.log('badge on fire  : ' + b1[2] + ' · class="' + b1[1].trim() + '"');
}
/* the bell itself is in the header, not the page */
M.renderTop();
ck(/class="bellwrap/.test(toprowHTML()), 'renderTop() emits no bell');
ck(/data-a="belltoggle"/.test(toprowHTML()), 'the bell has no toggle action');
ck(/bellpop/.test(toprowHTML()), 'the bell has no panel behind it');

/* --- 1b: with nothing urgent the badge must vanish ------------------------ */
/* A brand-new run has suggestions and nothing else. Those live in the panel
   but must never badge: a number that is never zero stops being read. */
M.newGame({ name: 'Bola', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
M.renderTop();
const m2 = M.notifCounts();
ck(m2.bad === 0 && m2.warn === 0, 'a brand-new run already has urgent notifications');
ck(m2.urgent === 0, 'urgent should be 0 on a fresh run, got ' + m2.urgent);
ck(m2.total > 0, 'a fresh run has nothing at all in the panel');
ck(!/bellbadge/.test(toprowHTML()),
   'the bell badges ' + m2.total + ' suggestions as if they were waiting on you');
ck(/bellpop/.test(toprowHTML()), 'the panel vanished along with the badge');
console.log('badge at rest  : none · ' + m2.total + ' suggestions still in the list');

/* back to the six-quarter run for the rest of the gate */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
S = M.getS();
S.fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) M.advanceQuarter();

/* --- 3: nothing scattered through the route bodies ----------------------- */
const routes = [];
M.TABS.forEach(t => {
  const subs = M.subsFor(t.id);
  if (!subs) routes.push([t.id, '']);
  else subs.forEach(s => routes.push([t.id, s.id]));
});
ck(routes.length >= 23, 'only ' + routes.length + ' routes discovered');

const valid = new Set(M.TABS.map(t => t.id));
let clean = 0, railed = 0;
for (const [t, s] of routes) {
  M.UI.tab = t; M.UI.sub = s || ''; M.UI.focus = '';
  const key = M.routeKey();
  let r = '';
  try { r = M.routeView(); } catch (e) { bad.push(key + ' threw: ' + e.message); continue; }
  if (/nextrail/.test(r)) { bad.push(key + ' still carries the rail in its body'); railed++; }
  else clean++;

  /* 4: every destination a notification names must be real */
  for (const a of M.nextActions()) {
    ck(valid.has(a.tab), key + ': a notification names a tab that does not exist: ' + a.tab);
    const subs = M.subsFor(a.tab);
    ck(!subs || subs.some(x => x.id === a.sub), key + ': a notification names a sub that is not on ' + a.tab + ': ' + a.sub);
  }
}
console.log('route bodies   : ' + clean + ' clean · ' + railed + ' still railed');

/* the list must survive on every route too — it is header furniture, so this
   is really a check that renderTop() does not depend on where you are */
M.UI.tab = 'legacy'; M.UI.sub = 'chronicle';
M.renderTop();
ck(/bellwrap/.test(toprowHTML()), 'the bell disappears on a back tab');

/* --- 5: a notification reaches the control, not just the tab ------------- */
/* "The people" starts collapsed on work/business, so the Team card is hidden. */
M.UI.tab = 'work'; M.UI.sub = 'business';
S.grp = {};
const TEAM = /<h[34][^>]*>Team[\s<]/;
M.UI.focus = '';
let closed = String(M.routeView());
ck(!TEAM.test(closed), 'the Team card is visible with The people collapsed — the gate proves nothing');
M.UI.focus = 'Team';
let open = String(M.routeView());
ck(TEAM.test(open), 'focus="Team" did not open the group hiding the Team card');
console.log('focus opens    : The people collapsed hides Team=' + !TEAM.test(closed) +
            ' · with focus it is visible=' + TEAM.test(open));

/* --- 6: the pin survives a render, and acting closes it ------------------ */
M.UI.tab = 'money'; M.UI.sub = 'deals'; M.UI.focus = '';
M.UI.bellOpen = false;
M.ACT.belltoggle();
ck(M.UI.bellOpen === true, 'belltoggle did not pin the panel open');
M.renderTop();
ck(/bellwrap on/.test(toprowHTML()), 'a re-render lost the pinned bell');
M.render();
ck(/bellwrap on/.test(toprowHTML()), 'a full render lost the pinned bell');
console.log('pin            : survives renderTop() and render()');

M.ACT.goto({ dataset: { t: 'governance', s: 'register', f: '' } });
ck(M.UI.bellOpen === false, 'acting on a notification left the panel hanging open');
ck(M.UI.tab === 'governance', 'goto did not switch tab (got ' + M.UI.tab + ')');
ck(M.UI.sub === 'register', 'goto did not switch sub (got ' + M.UI.sub + ')');
ck(M.UI.govSub === 'register', 'goto left UI.govSub behind, which broke the governance tabs once before');
M.renderTop();
ck(!/bellwrap on/.test(toprowHTML()), 'the panel is still open after goto re-rendered the header');
console.log('goto           : ' + M.UI.tab + '/' + M.UI.sub + ' · panel closed=' + (M.UI.bellOpen === false));

/* a stale focus must not break a render, and must not survive it */
M.UI.focus = 'No such card anywhere';
try { M.routeView(); } catch (e) { bad.push('a focus matching nothing threw: ' + e.message); }

/* the panel's own list must carry a button for every row: reading about a
   fire you cannot act on from where you are is the rail's old sin */
const m3 = M.notifModel();
let rows = 0, unacted = 0;
m3.groups.forEach(g => g.items.forEach(it => {
  rows++;
  const h = M.nextBtn(it, false);
  if (!/data-a="(goto|doact|advance)"/.test(h)) unacted++;
}));
ck(rows > 0, 'the notification model produced no rows at all');
ck(unacted === 0, unacted + ' of ' + rows + ' notifications have no button');
console.log('rows           : ' + rows + ' · every one carries a button=' + (unacted === 0));

if (bad.length) { console.log('\nNEXT ISSUES:'); bad.forEach(b => console.log(' - ' + b)); process.exit(1); }
console.log('\nNEXT CLEAN');
