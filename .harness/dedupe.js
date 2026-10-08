/* Gate: no two (tab,sub) routes may render identical HTML.
   Phase 2 of the rebuild: sub-tabs were whole-function assignments, so some
   rendered byte-identical screens. Every sub-tab must now be its own screen. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* ---- setup: a real run with a company, possessions, assets and history ---- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 8; i++) M.advanceQuarter();
/* Seed the conditional cards: debt (Liabilities) and a possession (What you
   own). Without these the money cards render empty and the gate cannot see
   whether the split kept them. */
S.fin.debt.push({ id: 'dg1', name: 'Personal loan', bal: 1200000, rate: 0.09,
                  minPay: 144000, kind: 'bank' });
S.fin.goods.push({ id: 'car', turn: S.turn });
const aid = (M.ASSETS || [])[0];
if (aid) S.assets.push({ id: aid.id, value: 500000, cost: 500000, lastRet: 0.02 });

console.log('setup           : turn', S.turn, '| goods', (S.fin.goods || []).length,
  '| assets', S.assets.length, '| journal', S.journal.length);

/* ---- render every route ---- */
const rendered = {};
const empties = [];
/* Grouping (P3) may collapse a section by default. A gate that asks "is
   this content still here?" has to force every group open first, or it is
   really asking "is this content in a group that happens to be open?". */
function expand(key){
  S.grp = {};
  (M.ROUTE_GROUPS[key] || []).forEach(function(g, i){ S.grp[key + '.' + i] = false; });
}

function render(tab, sub, label) {
  M.UI.tab = tab; M.UI.sub = sub;
  expand(label);
  let out = '';
  try { out = M.routeView(); } catch (e) { out = '<<threw: ' + e.message + '>>'; }
  if (typeof out !== 'string') out = '';
  if (out.length < 200) empties.push(label + ' (' + out.length + ') ' + out.slice(0, 60));
  rendered[label] = out;
}
Object.keys(M.SUBS).forEach(function (tab) {
  M.subsFor(tab).forEach(function (o) {
    render(tab, o.id, tab + '/' + o.id);
  });
});
render('overview', '', 'overview');

const keys = Object.keys(rendered);
console.log('routes rendered :', keys.length);
ck(empties.length === 0, 'routes rendering near-empty: ' + empties.join(' | '));

/* ---- the assertion: no two routes identical, none threw ---- */
keys.forEach(function (k) {
  ck(rendered[k].indexOf('<<threw') !== 0, k + ' threw while rendering');
});
const byHash = {};
keys.forEach(function (k) { (byHash[rendered[k]] = byHash[rendered[k]] || []).push(k); });
const dupes = Object.keys(byHash).filter(function (h) { return byHash[h].length > 1; });
dupes.forEach(function (h) { ck(false, 'identical screens: ' + byHash[h].join(' == ')); });
if (!dupes.length) console.log('identical pairs : none');

keys.forEach(function (k) { console.log('   ' + k.padEnd(22) + rendered[k].length); });

/* ---- every card that used to be duplicated must still exist somewhere ---- */
const all = keys.map(function (k) { return rendered[k]; }).join('\n');
['Monthly budget', 'Buy something', 'Cash &amp; debt', 'Liabilities', 'Borrow',
 'What you own', 'What this tab is really asking', 'Portfolio', 'Markets',
 'Macro picture', 'Recent market news', 'How returns work here',
 'Chronicle', 'Save &amp; load', 'Install', 'Run settings'
].forEach(function (card) {
  ck(all.indexOf(card) >= 0, 'card vanished after the split: ' + card);
});
console.log('cards preserved : 16 checked');

/* ---- Position must answer "how am I doing" without scrolling (§17 P4) ---- */
M.UI.tab='money'; M.UI.sub='position'; expand('money/position');
const pos = M.routeView();
['Net worth','Income','Burn','Runway','Where you stand'].forEach(function (k) {
  ck(pos.indexOf(k) >= 0, 'Position is missing the ' + k + ' figure');
});
ck(/Runway<\/div><div style="font-size:21px[^>]*>(Indefinite|12\+ qtrs|\d+ qtrs|\d+ months?)</.test(pos),
   'Position runway did not render a value');

/* runway must be finite and correctly scaled when genuinely bleeding */
M.newGame({ name: 'Broke', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
const B = M.getS();
B.fin.cash = 1200000; B.p.job = null; B.informalIncome = 0;
B.fin.budget = { housing:400000, food:150000, transport:100000,
                 lifestyle:120000, family:80000, learning:40000, giving:20000 };
B.fin.debt.push({ id:'ds1', name:'Informal lender', bal:900000, rate:0.30,
                  minPay:315000, kind:'shark' });
M.UI.tab='money'; M.UI.sub='position'; S.grp={}; expand('money/position');
const broke = M.routeView();
ck(broke.indexOf('Indefinite') < 0, 'a broke run still reports indefinite runway');
ck(broke.indexOf('Informal lender') >= 0, 'shark debt not flagged as an exposure');
ck(/\d+ months?<\/div>/.test(broke), 'broke run did not report runway in months');
console.log('position strip  : net worth / income / burn / runway / exposures ok');

if (bad.length) { console.log('\nDEDUPE FAIL'); bad.forEach(function (b) { console.log('  FAIL:', b); }); process.exit(1); }
console.log('DEDUPE CLEAN');
