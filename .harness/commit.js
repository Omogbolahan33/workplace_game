/* Gate: commitments are irreversible (phase 7).

   A business is not a set of dials. Before this, expandBiz() added a location
   the same quarter you paid for it, and hire() delivered a fully productive
   human being the day you signed them. Both were dials. A real commitment has
   three properties and this gate asserts all three:

     1. DELAY        it does not take effect when you pay for it
     2. BLEED       it costs money the whole time it is arriving
     3. IRREVERSIBLE walking away costs more than what you already spent

   Plus the two facts about people that used to be invisible: nobody joins the
   day you hire them, and nobody leaves the day you fire them.

   Deliberately not asserted: the exact lead times, ramps and break
   percentages. Those are balance numbers and will be tuned; the shape is what
   must hold. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* Fixed seed: without one every run of this gate plays a different world,
   so a failure can appear once and never reproduce. */

M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 60000000;
M.startBiz('tech', 'Testco', 6000000, null);
const b = S.biz;
b.cash = 60000000;                       // fund the fit-out draws
const q = () => M.advanceQuarter();
const openN = () => ((M.getS().biz.outlets) || []).filter(o => o.status !== 'building').length;

/* ---------------- 1 + 2 + 3: a location is a promise ---------------- */
M.expandBiz();
const c = M.commitBuilding(b)[0];
const deposit0 = c.paid, lead0 = c.readyAt - S.turn;
ck(!!c, 'expanding placed no commitment at all');
const loc0 = b.locations, open0 = openN();
ck(loc0 === 1 && open0 === 1, 'the location appeared the quarter it was paid for - still a dial');
ck(c.readyAt > S.turn, 'the commitment has no lead time');
ck(M.commitBreak(c) > M.commitSunk(c), 'abandoning costs no more than what is already sunk');

const cash0 = b.cash, paid0 = c.paid;
q();
const c1 = (b.commitments || []).filter(x => x.kind === 'unit')[0];
ck(c1 && c1.paid > paid0, 'no money was drawn while the unit was building - it does not bleed');
ck(b.cash < cash0, 'the build did not cost the business anything this quarter');
ck(openN() === 1, 'the unit opened early');

q();
const c2 = (b.commitments || []).filter(x => x.kind === 'unit')[0];
ck(c2 && c2.status === 'active', 'the commitment never came due');
ck(openN() === 2, 'the unit never opened');
/* sampled here: a lease is only a locked-in cost while it is still running,
   and by the end of this gate the first lease will have expired. */
const fx = M.committedFixedQ(b);
ck(fx.total > 0, 'committedFixedQ reports 0 for a business with a lease');
ck(fx.rent > 0, 'committedFixedQ is not counting rent');

/* ---------------- 3: walking away is expensive ---------------- */
M.expandBiz();
const c3 = M.commitBuilding(b).filter(x => x.kind === 'unit').pop();
ck(!!c3, 'second expansion placed no commitment');
const breakCost = M.commitBreak(c3), sunk = M.commitSunk(c3);
ck(breakCost > sunk, 'abandon (' + breakCost + ') is not worse than carrying on (' + sunk + ' sunk)');
const cashA = b.cash, openA = openN();
M.ACT.abandon({ dataset: { i: c3.id } });
ck(Math.round(cashA - b.cash) === breakCost, 'abandoning charged ' + Math.round(cashA - b.cash) + ', quoted ' + breakCost);
ck(c3.status === 'cancelled', 'the cancelled commitment is still marked building');
q();
ck(openN() === openA, 'an abandoned commitment still delivered its unit');

/* ---------------- people: nobody joins on day one ---------------- */
/* Turnover is random, so five are hired and the peak ramp across all of them
   is what is measured. The deterministic claims - none of them join the
   quarter they are hired, and whoever arrives arrives below full productivity
   - are asserted directly. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S2 = M.getS(); S2.fin.cash = 60000000;
M.startBiz('tech', 'Testco', 6000000, null);
S2.biz.cash = 60000000;
/* Paid above market on purpose. A gate that starves its own staff and then
   reports turnover as a failure is measuring the wrong thing. */
for (let i = 0; i < 5; i++) {
  const cd = M.genCandidate(0); cd.id = 'gatecand' + i;
  cd.salary = Math.round(M.marketSalary(cd.skill) * 1.25);
  M.hire(cd);
}
ck((S2.biz.staff || []).length === 0, 'a hire joined the same quarter they were offered the job');
ck(M.commitBuilding(S2.biz).length >= 1, 'hiring placed no commitment');
let waited = 0;
while ((S2.biz.staff || []).length === 0 && waited < 4) { q(); waited++; }
ck(waited >= 1, 'a hire joined with no delay at all');
const first = S2.biz.staff[0];
ck(!!first, 'no hire ever arrived');
ck(first && first.ramp < 1, 'the new hire arrived fully productive');

const ramps = [];
let peak = 0;
for (let i = 0; i < 6; i++) {
  q();
  const rs = (S2.biz.staff || []).map(x => x.ramp || 0);
  if (rs.length) { ramps.push(Math.max.apply(null, rs)); peak = Math.max(peak, Math.max.apply(null, rs)); }
}
ck(peak >= 0.99, 'no hire ever reached full productivity - peak ramp was ' + peak.toFixed(2));
ck(ramps.length >= 3, 'too few samples to call it a ramp: ' + ramps.length);

/* ---------------- people: nobody leaves on day one ---------------- */
if (S2.biz.staff && S2.biz.staff.length) {
  const v = S2.biz.staff[0], n0 = S2.biz.staff.length, p0 = M.staffProd(S2.biz);
  M.fire(v.id);
  ck(S2.biz.staff.length === n0, 'firing removed someone the same quarter - no notice period');
  ck(v.leaving !== undefined, 'the person given notice has no leaving date');
  ck(M.staffProd(S2.biz) < p0, 'someone serving notice still produces at full output');
  q();
  ck(!(S2.biz.staff || []).some(x => x.id === v.id), 'the person never actually left');
} else {
  bad.push('everyone quit before the firing test could run');
}

/* ---------------- 4: the locked-in number ---------------- */
/* ---------------- no regression: no commitments, no change ---------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S3 = M.getS(); S3.fin.cash = 60000000;
M.startBiz('tech', 'Testco', 6000000, null);
ck((S3.biz.commitments || []).length === 0, 'a brand-new business starts with commitments');
const capBefore = M.bizCapacity(S3.biz);
for (let i = 0; i < 3; i++) q();
ck(S3.biz.revenue > 0, 'a business with no commitments stopped trading');
ck(M.bizCapacity(S3.biz) > 0, 'capacity collapsed with no commitments');
console.log('no-commitment run : revenue ' + Math.round(S3.biz.revenue) +
            ', capacity ' + Math.round(M.bizCapacity(S3.biz)) + ' (was ' + Math.round(capBefore) + ')');

console.log('unit commitment   : ' + c.total + ' all in, ' + deposit0 + ' now, ' + lead0 + 'q lead');
console.log('abandon           : ' + breakCost + ' to walk away, ' + sunk + ' already sunk');
console.log('hire ramp         : ' + ramps.map(r => r.toFixed(2)).join(' -> '));
console.log('locked in per qtr : ' + fx.total + ' (rent ' + fx.rent + ')');

if (bad.length) { console.log('\nCOMMIT ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nCOMMIT CLEAN');
