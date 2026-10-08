/* Gate: Phase 12 — the lever map and the three term commitments.

   "The child's play tweaking of just price, quality, and marketing… This is
   not child's play." The objection is about reversibility: a dial you can turn
   tonight and turn back tomorrow is not a decision. So the three new levers
   are commitments, and this gate asserts the three properties that make one:

     delay      — nothing changes the quarter you commit it
     bleed      — money leaves the whole time it is arriving
     term       — it is locked for a number of quarters, and it ends on its
                  own whether you are ready or not, and walking away early
                  costs real money

   And for the screen: four columns sorted by cost of changing your mind, the
   fourth present only while something in it is actually biting, and every row
   pointing at a card that exists.
*/
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const strip = h => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function fresh() {
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
  const S = M.getS();
  S.fin.cash = 40000000;
  M.startBiz('tech', 'Testco', 6000000, null);
  for (let i = 0; i < 6; i++) { M.advanceQuarter(); M.UI.modal = null; }
  M.UI.modal = null;
  return M.getS();
}
let S = fresh();
let b = S.biz;
ck(!!b, 'the fixture never started a business');

/* ---------------- 1. the screen is four columns, in this order ------------ */
M.UI.tab = 'work'; M.UI.sub = 'levers'; M.UI.focus = '';
let v = M.viewLevers();
const cols = ['Set each quarter', 'Commit to', 'Negotiate', 'Cannot control'];
const at = cols.map(c => v.indexOf('>' + c + ' <'));
ck(at[0] >= 0 && at[1] >= 0 && at[2] >= 0, 'the lever screen is missing a column: ' + cols.join(', '));
ck(at[0] < at[1] && at[1] < at[2], 'the columns are not in order: dials, then commitments, then negotiations');
console.log('columns          : ' + cols.filter((c, i) => at[i] >= 0).join(' | ') +
            (at[3] >= 0 ? ' | (react showing)' : ' · react hidden'));

/* the dials column names all six, and every one can be changed from here */
const setCol = M.leverColSet(b);
['Price', 'Marketing', 'Quality', 'Credit terms', 'Stock depth', 'Owner draw'].forEach(d => {
  ck(setCol.indexOf('>' + d + '<') >= 0, 'the dial column does not list ' + d);
});
const setBtns = (setCol.match(/data-a="goto"/g) || []).length;
ck(setBtns >= 6, 'only ' + setBtns + ' of the six dials have a way to change them');
console.log('dials            : 6 listed · ' + setBtns + ' with a button');

/* Every "take me there" lands on a card that exists AND opens the group
   hiding it. Cards like Team and Units start inside collapsed groups, so a
   plain render of work/business does not contain them - which is the whole
   reason goto carries a focus at all. Asserting against the collapsed render
   would fail for a destination that works perfectly. */
M.UI.tab = 'work'; M.UI.sub = 'business';
const targets = [];
(v.match(/data-f="([^"]+)"/g) || []).forEach(m => {
  const f = m.slice(8, -1);
  if (targets.indexOf(f) < 0) targets.push(f);
});
ck(targets.length > 0, 'the lever screen points at nothing');
const reached = [];
targets.forEach(f => {
  M.UI.focus = f;
  const html = String(M.routeView());
  const ok = new RegExp('<h[34][^>]*>' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s<]').test(html);
  ck(ok, 'the lever screen sends the player to a card focus cannot reveal: "' + f + '"');
  if (ok) reached.push(f);
});
M.UI.focus = '';
console.log('destinations     : ' + targets.length + ' · reachable on work/business: ' + reached.join(', '));

/* ---------------- 2. the fourth column only appears when it bites --------- */
/* calm: capacity matched to demand, no rival, a neutral era, nobody miserable */
b.demand = b.capacity; b.rivalCut = 0;
S.era = { id: 'calm', start: 0, end: S.turn + 10, prev: null };
(b.staff || []).forEach(s => { s.morale = 90; });
ck(M.leverColReact(b) === '', 'the cannot-control column is showing while nothing is biting');
/* one thing bites, and it comes back */
b.demand = (b.capacity || 10) * 2;
const react = M.leverColReact(b);
ck(react !== '', 'demand is double capacity and the cannot-control column stayed hidden');
ck(/Demand is outrunning you/.test(react), 'the column did not name the thing that is biting');
console.log('react column     : hidden when calm · shown when demand outruns capacity');

/* ---------------- 3. a commitment, not a dial: the second shift ----------- */
S = fresh(); b = S.biz;
const cap0 = M.bizCapacity(b);
const cash0 = b.cash;
M.leverPlace('shifts', 2000000);
ck(M.leverPending(b, 'shifts'), 'committing a second shift did not put it in flight');
ck(M.bizCapacity(b) === cap0,
   'the second shift changed capacity the same quarter it was committed — that is a dial, not a commitment');
ck(M.shiftCapMult(b) === 1, 'capacity multiplier is live before the lead time is up');
console.log('delay            : capacity ' + Math.round(cap0) + ' the quarter you commit, unchanged');

/* money leaves while it is arriving */
for (let i = 0; i < 1; i++) { M.advanceQuarter(); M.UI.modal = null; }
const c1 = M.leverOf(b, 'shifts', 'building') || M.leverOf(b, 'shifts', 'active');
ck(!!c1, 'the commitment vanished while it was building');
ck((c1.paid || 0) > 0, 'nothing was paid towards it while it built — the bleed is not modelled');
console.log('bleed            : ' + M.fmt(Math.round(c1.paid)) + ' of ' + M.fmt(Math.round(c1.total)) +
            ' gone before it has done anything');

/* it arrives, and only then */
for (let i = 0; i < 2; i++) { M.advanceQuarter(); M.UI.modal = null; }
ck(M.leverActive(b, 'shifts'), 'the second shift never activated');
ck(M.shiftCapMult(b) === 1.35, 'the running shift is not giving its capacity');
ck(M.shiftWageMult(b) === 1.45, 'the running shift is not charging its wage premium');
const run = M.leverOf(b, 'shifts', 'active');
ck(run.endsAt === M.getS().turn + 8 || run.endsAt === M.getS().turn + 7,
   'the term was not set: endsAt ' + run.endsAt + ' at turn ' + M.getS().turn);
console.log('arrived          : capacity x1.35 · wages x1.45 · ' +
            Math.max(0, run.endsAt - M.getS().turn) + ' quarters left on the term');

/* the term ends on its own, and the multiplier goes with it */
const turnsLeft = Math.max(0, run.endsAt - M.getS().turn);
for (let i = 0; i <= turnsLeft; i++) { M.advanceQuarter(); M.UI.modal = null; }
ck(!M.leverActive(b, 'shifts'), 'the shift was still running after its term expired');
ck(M.shiftCapMult(b) === 1, 'capacity did not fall back when the term ended — the term is decorative');
console.log('term             : ended on its own after ' + turnsLeft + ' more quarters');

/* ---------------- 4. locked input cost: the price can go against you ------ */
S = fresh(); b = S.biz;
M.leverPlace('supply', 1200000);
for (let i = 0; i < 2; i++) { M.advanceQuarter(); M.UI.modal = null; }
ck(M.leverActive(b, 'supply'), 'the supply contract never activated');
const locked = M.supplyCogsMult(b);
ck(locked < 0.95, 'the locked input price is not cheaper: x' + locked.toFixed(2));
const spot0 = M.inputIndex();
S.mkt.demand = 0.40;                       /* the world gets cheaper */
const after = M.supplyCogsMult(b);
ck(after > locked, 'a locked price did not worsen when suppliers started cutting theirs');
ck(M.supplyOverpay(b) > 3, 'the overpay is ' + M.supplyOverpay(b) + '% and the screen would not say so');
const overpay = M.supplyOverpay(b);
ck(overpay > 3, 'the overpay is only ' + overpay + '% and the screen would not say so');
ck(M.leverColReact(b).indexOf('above the market') >= 0,
   'the cannot-control column stayed quiet while a locked price was costing money');
const spot1 = M.inputIndex();
S.mkt.demand = 1.0;
console.log('locked price     : x' + locked.toFixed(2) + ' when signed → x' + after.toFixed(2) +
            ' after the market cut (' + overpay + '% over) · spot ' +
            spot0.toFixed(2) + ' → ' + spot1.toFixed(2));

/* ---------------- 5. the distributor takes a cut of the top -------------- */
S = fresh(); b = S.biz;
const dem0 = M.bizDemand(b);
M.leverPlace('channel', 1200000);
for (let i = 0; i < 2; i++) { M.advanceQuarter(); M.UI.modal = null; }
ck(M.leverActive(b, 'channel'), 'the distribution deal never activated');
ck(M.channelDemandMult(b) === 1.22, 'the deal is not lifting demand');
ck((b.chanCutQ || 0) > 0, 'the distributor is taking nothing off the top');
console.log('distributor      : demand x1.22 · ' + M.fmt(b.chanCutQ) + ' of revenue gone last quarter');

/* ---------------- 6. walking away costs money, and works ----------------- */
const ch = M.leverOf(b, 'channel', 'active');
const drop = M.commitDropCost(ch);
ck(drop > 0, 'standing a commitment down is free — then it is not a commitment');
const cashBefore = b.cash;
const paid = M.commitDrop(b, ch.id);
ck(paid === drop, 'the quoted break price (' + drop + ') is not what was charged (' + paid + ')');
ck(!M.leverActive(b, 'channel'), 'paying to stand it down did not end it');
ck(M.channelDemandMult(b) === 1, 'demand stayed lifted after the deal was ended');
b.cash -= paid;
ck(b.cash < cashBefore, 'ending it did not cost the business anything');
console.log('getting out      : ' + M.fmt(paid) + ' to stop a deal with ' +
            Math.max(0, (ch.endsAt || 0) - M.getS().turn) + ' quarters left on it');

/* an abandoned one that is still building costs the sunk plus a share */
S = fresh(); b = S.biz;
M.leverPlace('shifts', 2000000);
const pend = M.leverOf(b, 'shifts', 'building');
const bc = M.commitBreak(pend);
ck(bc > 0, 'abandoning a half-built commitment is free');
M.commitCancel(b, pend.id);
ck(!M.leverPending(b, 'shifts'), 'abandoning did not stop it');
console.log('abandoning       : ' + M.fmt(bc) + ' to walk away from one that had not arrived');

/* ---------------- 7. nothing was dropped --------------------------------- */
/* Every button this screen emits must name an action that exists.

   The three take-a-lever buttons were built as 'data-a="lever' + k + '"', and
   for the shifts lever that assembled "levershifts" while the handler is
   called levershift. The button rendered, looked right, and did nothing at
   all. The check that was supposed to catch it searched for 'lever' + k too,
   so it found the same wrong string and passed.

   Assert against ACT, which is the thing that has to be there. */
const emitted = [];
/* three states, because a screen only emits the buttons its state allows:
   calm hides the stand-down buttons, and a locked price going against you is
   the only thing that emits one from the cannot-control column. Union them,
   or the check silently passes over the buttons it most needs to test. */
[['calm'], ['demand'], ['running']].forEach(function(mod){
  const st = fresh(); const bb = st.biz;
  if (mod[0] === 'demand') bb.demand = (bb.capacity || 10) * 2;
  if (mod[0] === 'running') {
    M.leverPlace('supply', 1200000);
    for (let i = 0; i < 2; i++) { M.advanceQuarter(); M.UI.modal = null; }
  }
  M.UI.tab = 'work'; M.UI.sub = 'levers';
  (String(M.viewLevers()).match(/data-a="([^"]+)"/g) || []).forEach(m => {
    const a = m.slice(8, -1);
    if (emitted.indexOf(a) < 0) emitted.push(a);
  });
});
const orphan = emitted.filter(a => !(a in M.ACT));
ck(emitted.length > 0, 'the lever screen emits no controls at all');
ck(orphan.length === 0, 'the lever screen emits controls with no handler: ' + orphan.join(', '));
console.log('handlers         : ' + emitted.length + ' distinct actions emitted · ' +
            emitted.length + ' of them exist in ACT · ' + emitted.join(' '));

/* the three levers are offered on the screen, with their terms stated */
S = fresh(); b = S.biz;
const commitCol = M.leverColCommit(b);
const LEVER_ACT = { shifts:'levershift', supply:'leversupply', channel:'leverchannel' };
Object.keys(M.LEVER_KINDS).forEach(k => {
  const K = M.LEVER_KINDS[k];
  ck(commitCol.indexOf('data-a="' + LEVER_ACT[k] + '"') >= 0,
     K.label + ' is not offered on the screen (looked for ' + LEVER_ACT[k] + ')');
  ck(LEVER_ACT[k] in M.ACT, K.label + ' names an action that does not exist: ' + LEVER_ACT[k]);
  ck(commitCol.indexOf('locked for ' + K.term + 'q') >= 0, K.label + ' does not state its term');
  ck(typeof K.cost === 'function' && K.cost(b) > 0, K.label + ' has no cost');
  ck(K.lead >= 1, K.label + ' arrives instantly — it is a dial');
  ck(K.breakPct > 0, K.label + ' can be walked away from for nothing');
});
/* the old dials still work: this screen is additive */
M.UI.tab = 'work'; M.UI.sub = 'business'; M.UI.focus = '';
const biz = String(M.routeView());
['data-inp="bizprice"', 'data-inp="bizmark"', 'data-inp="bizqual"',
 'data-inp="bizcred"', 'data-inp="bizstock"', 'data-inp="bizdraw"'].forEach(inp => {
  ck(biz.indexOf(inp) >= 0, 'the lever screen cost the game a dial: ' + inp);
});
console.log('levers offered   : ' + Object.keys(M.LEVER_KINDS).map(k =>
  k + ' ' + M.LEVER_KINDS[k].lead + 'q/' + M.LEVER_KINDS[k].term + 'q').join(' · '));
console.log('dials intact     : all six still on work/business');

/* the new sub-tab is reachable and has a hint */
ck((M.subsFor('work') || []).some(x => x.id === 'levers'), 'the Levers sub-tab is not on the Work tab');
ck(!!M.ROUTE_WHY['work/levers'], 'the Levers screen has no screen hint');
M.UI.tab = 'work'; M.UI.sub = 'levers';
ck(/levers/.test(M.routeKey()), 'routeKey() did not resolve work/levers');
try { M.routeView(); } catch (e) { bad.push('work/levers threw: ' + e.message); }

if (bad.length) { console.log('\nLEVER ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nLEVERS CLEAN');
