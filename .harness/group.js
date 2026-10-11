/* Gate: P3 in-tab grouping.

   The screen must have shape and priority, and grouping must never cost
   content. Four claims:

     1. every group in ROUTE_GROUPS actually matches something on its route
        — a spec that matches nothing is a "phantom" and is a bug
     2. with nothing collapsed, grouping preserves every heading the route
        rendered before grouping existed
     3. collapsing a group hides that group's cards and nothing else
     4. collapse state survives a re-render and is per-screen

   Run against a live business with a few quarters behind it, because most
   views render little or nothing before you have one. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });

/* This gate checks what the screens contain. The world-first default folds
   every section and card closed behind the HUD's (i); the content is the same
   either way, so it is checked with the explanations shown - the folded
   default has its own check in group.js. */
M.UI.details = true;
const S = M.getS();
S.fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) M.advanceQuarter();

const heads = h => [...String(h).matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/g)]
  .map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const keys = Object.keys(M.ROUTE_GROUPS);
console.log('routes with groups : ' + keys.length);

let phantoms = 0, dropped = [], collapsed = 0;

for (const key of keys) {
  const [t, sub] = key.split('/');
  M.UI.tab = t; M.UI.sub = sub || '';
  if (t === 'governance') M.UI.govSub = sub;
  S.grp = {};

  let raw = '';
  try { raw = String(M.routeViewInner()); } catch (e) { bad.push(key + ' routeViewInner threw: ' + e.message); continue; }

  /* Discover the group ids, then force them ALL open. Groups are allowed
     to start collapsed, so "did anything disappear?" is only a fair
     question with every group expanded. S.grp[id]=false means "not
     collapsed", and it overrides the spec's default. */
  let probe = '';
  try { probe = String(M.routeView()); } catch (e) { bad.push(key + ' grouped render threw: ' + e.message); continue; }
  const ids = [...probe.matchAll(/data-a="toggrp" data-k="([^"]+)"/g)].map(m => m[1]);
  ids.forEach(i => { S.grp[i] = false; });

  let out = '';
  try { out = String(M.routeView()); } catch (e) { bad.push(key + ' expanded render threw: ' + e.message); continue; }

  /* ---- 1. no phantom groups ------------------------------------------ */
  const want = M.ROUTE_GROUPS[key].map((g, i) => key + '.' + i);
  const missing = want.filter(w => !ids.includes(w));
  if (missing.length) {
    phantoms += missing.length;
    const names = missing.map(x => M.ROUTE_GROUPS[key][+x.split('.').pop()].t);
    bad.push(key + ': phantom groups ' + names.join(', ') +
             ' (no card on this route matches them)');
  }

  /* ---- 2. grouping drops nothing ------------------------------------- */
  const before = heads(raw), after = heads(out);
  for (const h of before) {
    if (!after.includes(h)) dropped.push(key + ' :: ' + h);
  }

  /* ---- 3. collapsing hides only that group --------------------------- */
  if (ids.length) {
    /* Isolate one group's effect: baseline has ONLY that group forced open
       and everything else at its spec default, then collapse that one. */
    const first = ids[0];
    S.grp = {}; S.grp[first] = false;
    let base = '';
    try { base = String(M.routeView()); } catch (e) { bad.push(key + ' baseline render threw: ' + e.message); continue; }
    S.grp[first] = true;
    let shut = '';
    try { shut = String(M.routeView()); } catch (e) { bad.push(key + ' collapsed render threw: ' + e.message); continue; }
    const shutHeads = heads(shut);
    const lost = heads(base).filter(h => !shutHeads.includes(h));
    if (!lost.length) bad.push(key + ': collapsing ' + first + ' hid nothing');
    if (shut.length >= base.length) bad.push(key + ': collapsing ' + first + ' did not shorten the screen');
    collapsed += lost.length;
  }
  S.grp = {};
}

console.log('phantom groups     : ' + phantoms);
console.log('headings dropped   : ' + dropped.length);
if (dropped.length) dropped.slice(0, 8).forEach(d => console.log('   ' + d));
console.log('headings hidden by one collapse : ' + collapsed);

/* ---- 4. state is per-screen and durable ------------------------------ */
M.UI.tab = 'money'; M.UI.sub = 'position';
S.grp = {};
/* money/position.0 ("Your money") is open by default, so toggling it must
   hide something. Group .1 starts collapsed, so toggling it would OPEN it
   and prove nothing about hiding. */
ck(String(M.routeView()).includes('Cash &amp; debt'),
   'money/position.0 content missing before the toggle');
M.ACT.toggrp({ dataset: { k: 'money/position.0' } });
ck(S.grp['money/position.0'] === true, 'toggrp did not record the collapse in S.grp');
const afterToggle = String(M.routeView());
ck(!afterToggle.includes('Cash &amp; debt'),
   'collapsing money/position.0 left its content on screen');
M.UI.tab = 'money'; M.UI.sub = 'markets';
ck(String(M.routeView()).includes('What you could buy'),
   'collapsing a group on position also collapsed it on markets (state leaks across screens)');
console.log('state              : per-screen, survives re-render');

/* ---- the section markup itself --------------------------------------- */
M.UI.tab = 'work'; M.UI.sub = 'business'; S.grp = {};
const biz = String(M.routeView());
ck(/class="card sect"/.test(biz), 'no .card.sect rendered on work/business');
ck(/class="sectHead"/.test(biz), 'no .sectHead rendered on work/business');
ck(/class="sectBody"/.test(biz), 'no open .sectBody on work/business');
ck(/class="sectchev"/.test(biz), 'no .sectchev affordance on work/business');
console.log('markup             : sect / sectHead / sectBody / sectchev all present');

const shrunk = biz.length < String(M.routeViewInner()).length + 400;
console.log('work/business      : ' + String(M.routeViewInner()).length + ' -> ' + biz.length + ' chars grouped');

/* ---- 5. collapsing hides detail, never state -------------------------- */
/* A collapsed group must promote its cards' own tag text onto the header,
   so you can read the state of a section without opening it. The figures
   are the cards' own — the grouping layer invents nothing. */
const headerOf = (html, id) => {
  const m = html.match(new RegExp('data-k="' + id.replace(/[/.]/g, '\\$&') + '"[\\s\\S]*?</button>'));
  return m ? m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
};
M.UI.tab = 'work'; M.UI.sub = 'business';

S.grp = {};                                   // "The people" is closed by default
const shutPeople = String(M.routeView());
const hShut = headerOf(shutPeople, 'work/business.2');
ck(/staff/.test(hShut) && /\/mo/.test(hShut),
   'collapsed "The people" header hides its state: ' + hShut);

S.grp = { 'work/business.2': false };         // now open
const openPeople = String(M.routeView());
const hOpen = headerOf(openPeople, 'work/business.2');
ck(!/staff/.test(hOpen),
   'an OPEN group duplicates its figures onto the header: ' + hOpen);

/* the promoted figures must be the cards' own, not invented by grouping */
M.UI.tab = 'governance'; M.UI.sub = 'register';
S.grp = { 'governance/register.0': true };
const regShut = String(M.routeView());
const hReg = headerOf(regShut, 'governance/register.0');
ck(/equity value/.test(hReg), 'collapsed "Who owns what" lost its equity figure: ' + hReg);
S.grp = {};
console.log('collapsed headers  : promote their cards\' own figures (detail hidden, state kept)');

/* ---- 6. world-first: the folded default ------------------------------ */
/* With the explanations folded away (the HUD's (i) off), a screen's first
   section opens and every later section that would open by default starts
   closed - folded only by that default, it shows its picture and title, not
   figures. The player's own choice still wins, on the first tap. */
M.UI.details = false;
let wfKey = '', wfIndex = -1;
for (const key of keys) {
  const gs = M.ROUTE_GROUPS[key] || [];
  const j = gs.findIndex((g, n) => n > 0 && g.open);
  if (j > 0) { wfKey = key; wfIndex = j; break; }
}
ck(wfKey, 'world-first: no route has a default-open section past its first, so the fold was not checked');
if (wfKey) {
  const [wt, ws] = wfKey.split('/');
  M.UI.tab = wt; M.UI.sub = ws || ''; if (wt === 'governance') M.UI.govSub = ws; S.grp = {};
  const id = wfKey + '.' + wfIndex;
  const wf = String(M.routeView());
  const head = (wf.match(new RegExp('data-k="' + id.replace(/[/.]/g, '\\$&') + '"[\\s\\S]*?</button>')) || [''])[0];
  const body = (s) => (s.match(new RegExp('data-k="' + id.replace(/[/.]/g, '\\$&') + '"[\\s\\S]*?</button>(<div class="sectBody">)?')) || [])[1];
  ck(head, 'world-first: ' + id + ' has no header');
  ck(!body(wf), 'world-first: ' + id + ' opened by default with the explanations folded away');
  ck(/class="gfx sico"/.test(head), 'world-first: the folded section ' + id + ' has no picture on its header');
  ck(!/secttags/.test(head), 'world-first: ' + id + ', folded only by the default, shows figures');
  ck(/data-k="[^"]*\.0"[\s\S]*?<\/button><div class="sectBody">/.test(wf) || !(M.ROUTE_GROUPS[wfKey][0] || {}).open,
     'world-first: the first section of ' + wfKey + ' did not open');
  M.ACT.toggrp({ dataset: { k: id } });
  ck(body(String(M.routeView())), 'world-first: the first tap on folded ' + id + ' did not open it');
  console.log('world-first        : ' + wfKey + ' opens its first section; ' + id + ' starts folded, picture and title only; the first tap opens it');
}
M.UI.details = true; S.grp = {};

console.log('\n' + (bad.length ? 'GROUP ISSUES:\n - ' + bad.join('\n - ') : 'GROUP CLEAN'));
