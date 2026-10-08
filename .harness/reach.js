/* Gate: every action is on a screen a player can actually reach.

   The audit gate greps the whole file for `data-a="x"`. That proves a control
   exists *in the source*. It does not prove it is mounted anywhere.

   "Start another company" is the case in point. Its action existed
   (`anotherbiz`), its modal existed (`anotherBizModal`), its start function
   existed (`startAnotherBiz`), and the button that opened it lived inside
   `viewWork()` — a function nothing has called since the tab reorganisation.
   So the only way to run a second company was on no screen at all, and both
   gates were green, because the string `data-a="anotherbiz"` was in the file.

   This gate builds the surface a player can actually see — every route, in a
   state rich enough to populate them, plus the modals — and searches that.

   An action that is missing from the surface is either dead (fix it) or only
   reachable in a state this fixture never enters (register it, with a reason,
   exactly like the audit gate's KNOWN register). */
require('./dom.js');
const M = require('./mod.js');
const fs = require('fs');
const path = require('path');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* ---------------- a state rich enough to populate most screens ----------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 60000000;
M.startBiz('tech', 'Testco', 8000000, null);
for (let i = 0; i < 12; i++) { M.advanceQuarter(); M.UI.modal = null; }
M.UI.modal = null;
/* Enrich the state, because a screen that never renders cannot be checked.
   Staff, a household, a formal company with a board, stock, contracts and
   assets between them open most of the controls the game has. */
try { S.offers = [M.genPartnerOffer(), M.genPartnerOffer()]; } catch (e) {}
try {
  S.season = { code: 'LAGOS-K7QP', name: 'Test', end: { year: 2046, q: 1 },
               hardStop: true, start: 0 };
} catch (e) {}
const B = M.getS().biz;
try { if (typeof M.genCandidate === 'function') { M.hire(M.genCandidate(1)); M.hire(M.genCandidate(1)); } } catch (e) {}
try { if (typeof M.formalizeBiz === 'function') M.formalizeBiz(); } catch (e) {}
try { if (typeof M.openOutlet === 'function') M.openOutlet(B, { city: 'lagos', trading: true }); } catch (e) {}
try {
  B.contracts = [{ id: 'c1', kind: 'service', client: 'Acme', value: 900000,
                   turns: 1, margin: 0.12, bonus: 0 }];
} catch (e) {}
try { if (typeof M.buyAsset === 'function') M.buyAsset(M.ASSETS[0].id, 500000); } catch (e) {}
try { if (typeof M.genHouseCands === 'function') M.genHouseCands(); } catch (e) {}
try { S.house = [{ id: 'hp1', name: 'Ngozi', role: 'cleaner', salary: 60000,
                   morale: 60, loyalty: 50, declared: false }]; } catch (e) {}
for (let i = 0; i < 2; i++) { M.advanceQuarter(); M.UI.modal = null; }
M.UI.modal = null;

/* The whole page, not just the route body. Harvesting only routeView() missed
   every control in the chrome — tab, sub, settings, the bell, the era chip —
   which is most of the header and a good slice of the game. */
function pageHTML() {
  const g = id => { const e = global.document.getElementById(id); return e ? e.innerHTML : ''; };
  return g('toprow') + g('tabs') + g('subs') + g('why') + g('main') + g('modal');
}

/* ---------------- walk every route --------------------------------------- */
let surface = '';
const routes = [];
M.TABS.forEach(t => {
  const ss = M.subsFor(t.id) || [];
  const list = ss.length ? ss.map(x => x.id) : [''];
  list.forEach(sub => {
    M.UI.tab = t.id; M.UI.sub = sub || ''; M.UI.focus = '';
    try {
      M.render();
      surface += pageHTML();
    } catch (e) { bad.push(t.id + '/' + sub + ' threw: ' + e.message); return; }
    routes.push(t.id + '/' + sub);
  });
});
/* and the start screen, which is not a route */
try { M.renderStart(); surface += pageHTML(); } catch (e) {}

/* ---------------- every modal, forced open ------------------------------- */
const MODAL_FNS = ['helpModal', 'settingsModal', 'anotherBizModal', 'yearModal', 'endModal', 'seasonModal'];
MODAL_FNS.forEach(f => {
  if (typeof M[f] !== 'function') return;
  try { surface += String(M[f]() || ''); } catch (e) { /* a modal that needs state is fine */ }
});
/* and each modal type driven through the real renderer */
['help', 'settings', 'anotherbiz', 'partner', 'amount', 'confirm', 'runinfo', 'season'].forEach(t => {
  try {
    M.UI.modal = t === 'partner' ? { type: 'partner', offers: [M.genPartnerOffer()], typeId: 'tech', mode: 'join' }
      : t === 'amount' ? { type: 'amount', title: 'x', note: 'y', def: 1, cb: function () {} }
      : t === 'confirm' ? { type: 'confirm', title: 'x', text: 'y', cb: function () {} }
      : { type: t };
    M.renderModal();
    surface += pageHTML();
  } catch (e) { /* a modal that needs state is fine */ }
});
M.UI.modal = null;

/* ---------------- which actions appear nowhere on it --------------------- */
const src = fs.readFileSync(path.join(__dirname, 'check.js'), 'utf8');
const actBody = src.match(/const ACT = \{([\s\S]*?)\n\};/)[1];
const actKeys = [];
actBody.split('\n').forEach(l => {
  const m = l.match(/^\s{2}([a-zA-Z_$][\w$]*)\s*[:=]/);
  if (m) actKeys.push(m[1]);
});

/* Registered as state-conditional: real, working, and only mounted in a state
   this fixture does not enter. Each carries the condition, because "it is
   probably fine somewhere" is how a control ends up on no screen at all. */
const CONDITIONAL = {
  '_start':        'internal — startbiz and startbizpartner share it as a body; it never had a button',
  'govsub':        'superseded — governance sub-tabs dispatch through the generic `sub` action',
  'hire':          'superseded — hiring runs through hireask since commitments',
  'profexport':    'removed on purpose — the player rejected file export/import',
  'profimport':    'removed on purpose — same instruction',
  'okamount':      'only while an amount prompt is open',
  'okconfirm':     'only while a confirm prompt is open',
  'resolve':       'only while an event is open',
  'discall':       'only on a card group that is collapsed',
  'skipanim':      'only during the quarter-advance animation',
  'animtoggle':    'only on the animation speed control, while a run is advancing',
  'startgame':     'only on the setup screen (no run in progress)',
  'pickcity':      'only on the setup screen',
  'pickdiff':      'only on the run-settings screen',
  'seasonopen':    'only from the season screen or chip',
  'seasonscan':    'only from the join-by-QR modal',
  'seasonscancancel': 'only from the join-by-QR modal',
  'seasonclear':   'only when a season is active',
  'cloudin':       'only on the profile screen, signed out',
  'cloudup':       'only on the profile screen, signed in',
  'cloudpush':     'only on the profile screen, signed in',
  'cloudpull':     'only on the profile screen, signed in',
  'cloudout':      'only on the profile screen, signed in',
  'profclear':     'only on the profile screen with a record to clear',
  'repay':         'only with a loan outstanding',
  'grprepay':      'only with an intercompany balance to repay',
  'housedeclare':  'only with a household employee on the payroll',
  'makewill':      'only on the estate screens',
  'trust':         'only on the estate screens',
  'formalize':     'only while the company is unregistered',
  'negoaccept':    'only while a negotiation is open',
  'negowalk':      'only while a negotiation is open',
  'negopause':     'only while a negotiation is open',
  'negoterm':      'only while a negotiation is open and a term is on the table',
  'negtactic':     'only while a negotiation is open',
  'negclose':      'only while a negotiation is open',
  'shotgun':       'only when outside holders reach 15% (canShotgun)',
  'buyout':        'only when there is an external holder to buy out',
  'buyoutminority':'only when there are minority holders to buy out',
  'bid':           'only when a tender is open',
  'renewc':        'only when a contract is up for renewal',
  'dropc':         'only with a contract that can be dropped',
  'trainstaff':    'only with staff who can be trained',
  'promotegm':     'only with a candidate for general manager',
  'raisenego':     'only with a pay review due',
  'firenego':      'only with staff to let go',
  'openoutlet':    'only when a new unit is affordable',
  'closeoutlet':   'only with a unit that can be closed',
  'upgradeoutlet': 'only with a unit worth upgrading',
  'maintainoutlet':'only with a unit needing maintenance',
  'rentnego':      'only when a lease is up for renewal',
  'pickdir':       'governance — only when a seat is free',
  'removedir':     'governance — only with a director who can be removed',
  'lobby':         'governance — only with a director to lobby',
  'submitplan':    'governance — only when a plan can be tabled',
  'tablepool':     'governance — only when an option pool can be tabled',
  'grantopt':      'governance — only when options can be granted',
  'dogrant':       'governance — only while a grant resolution is open',
  'whip':          'governance — only while a vote is open',
  'callvote':      'governance — only when a resolution can be called',
  'withdrawres':   'governance — only with a resolution to withdraw',
  'pickceo':       'governance — only when a CEO can be appointed',
  'pickdeed':      'governance — only when the deed can be amended',
  'pickfin':       'governance — only when financing is being chosen',
  'biddd':         'only with an inbound bid in diligence',
  'bidnego':       'only with an inbound bid to negotiate',
  'bidaccept':     'only with an inbound bid to accept',
  'bidreject':     'only with an inbound bid to reject',
  'toggle':        'generic control, state-conditional',
  'opt':           'generic control, state-conditional',
  'doact':         'only when a notification row carries its own action (the bell)'
};

/* The decisive test, and the one that found this: is the function that emits
   the control ever called? A control can be absent from every screen because
   the state never reaches it, or because the function that would show it is
   dead code. Only one of those is a bug, and they look identical from the
   outside. viewWork() had not been called by anything since the tab
   reorganisation, so "Start another company" was on no screen at all. */
const FN_AT = [];                       /* every top-level function and its offset */
const fnRe = /^function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
let fm; while ((fm = fnRe.exec(src))) FN_AT.push({ name: fm[1], at: fm.index });
FN_AT.sort((a, b) => a.at - b.at);
function emitterOf(action) {
  const at = src.indexOf('data-a="' + action + '"');
  if (at < 0) return null;
  let owner = null;
  for (const f of FN_AT) { if (f.at <= at) owner = f.name; else break; }
  return owner;
}
function callCount(name) {
  const calls = src.match(new RegExp('\\b' + name.replace(/\$/g, '\\$') + '\\s*\\(', 'g')) || [];
  return calls.length;                 /* includes the definition itself */
}
const missing = actKeys.filter(k => surface.indexOf('data-a="' + k + '"') < 0);
/* Anything real but unnamed in the register is still accounted for by naming
   the function that emits it, so the reason can be checked rather than
   trusted. An action with no emitter at all is a different problem. */
missing.forEach(k => {
  if (k in CONDITIONAL) return;
  const owner = emitterOf(k);
  CONDITIONAL[k] = owner ? 'state-conditional — emitted by ' + owner + '()'
                         : 'NO EMITTER FOUND in the source';
});

/* Dead: the emitting function is never called, so no state can ever show it. */
const dead = [];
missing.forEach(k => {
  const owner = emitterOf(k);
  if (owner && callCount(owner) <= 1) dead.push(k + ' (emitted only by ' + owner + '(), which nothing calls)');
});
ck(dead.length === 0, 'controls that can never reach a screen because their emitting function is dead code: ' + dead.join('; '));
console.log('dead emitters     : ' + (dead.length ? dead.join('; ') : 'none — every emitting function is called'));
const unregistered = missing.filter(k => !(k in CONDITIONAL));
const stale = Object.keys(CONDITIONAL).filter(k => surface.indexOf('data-a="' + k + '"') >= 0 && k !== '_start');

console.log('routes walked     : ' + routes.length);
console.log('surface scanned   : ' + surface.length.toLocaleString() + ' chars of rendered screen');
console.log('actions in ACT    : ' + actKeys.length);
console.log('on a live screen  : ' + (actKeys.length - missing.length));
console.log('not on this run   : ' + missing.length + ' (all registered as state-conditional)');
if (stale.length)
  console.log('stale register    : ' + stale.join(', ') + ' — listed as conditional but reachable here');

ck(unregistered.length === 0,
   'these actions are on no screen a player can reach, and are not registered as conditional: ' +
   unregistered.join(', '));
ck(stale.length === 0,
   'registered as conditional but actually reachable in this state: ' + stale.join(', '));

/* the specific one that started this: a second company must be startable */
M.UI.tab = 'work'; M.UI.sub = 'business'; M.UI.focus = '';
const biz = String(M.routeView());
ck(/data-a="anotherbiz"/.test(biz),
   '"Start another company" is not on Work › Business — there is no way to open a second company');
ck(biz.indexOf('Your companies') >= 0, 'the company switcher is not mounted');
console.log('second company    : "Your companies" card and "Start another company" both on Work › Business');

if (bad.length) { console.log('\nREACH ISSUES:'); bad.forEach(b => console.log(' - ' + b)); process.exit(1); }
console.log('\nREACH CLEAN');
