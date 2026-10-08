/* Gate: working capital and the cash conversion cycle (phase 8).

   The lesson: profitable companies go bust because they are growing. Every
   naira of new revenue must be financed - as stock before it sells, as a
   receivable after it does - and that cash leaves quarters before the profit
   arrives. It is not on the P&L.

   Before this, service level depended on the stock *setting* rather than on
   whether the stock had actually been paid for, so a business that could not
   fund its inventory still served every customer who walked in.

   Claims:
     1. the cycle is a real identity: CCC = DSO + DIO - DPO
     2. growth carries a cash bill, and the bill grows with growth, with
        customer credit terms, and with stock depth
     3. stock you have not paid for is stock you do not have - funding gates
        service, measured in the running sim
     4. end to end, a quarter of growth absorbs cash into stock and receivables
     5. it is on screen

   Deliberately not asserted: the specific day counts. Those are balance
   numbers. The identity and the direction of each effect are what must hold. */
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
b.cash = 20000000; b.stockPolicy = 0.6; b.creditTerms = 0.4;
/* staffed, so that staff cover is not the thing being measured */
for (let i = 0; i < 5; i++) {
  const c = M.genCandidate(0); c.id = 'wcs' + i;
  c.salary = Math.round(M.marketSalary(c.skill) * 1.3);
  M.hire(c);
}
for (let i = 0; i < 5; i++) M.advanceQuarter();
const q = () => M.advanceQuarter();

/* ---------------- 1. the identity ---------------- */
const c = M.cccOf(b);
ck(c.ccc === c.dso + c.dio - c.dpo, 'CCC is not DSO + DIO - DPO: ' + JSON.stringify(c));
ck(c.dso >= 0 && c.dio >= 0 && c.dpo >= 0, 'a component of the cycle is negative: ' + JSON.stringify(c));
ck(c.tied >= 0, 'cash tied up in the cycle is negative');

/* ---------------- 2. the bill for growth ---------------- */
ck(M.growthBill(b, 0) === 0, 'standing still still costs working capital');
const g10 = M.growthBill(b, 0.10), g30 = M.growthBill(b, 0.30);
ck(g30 > g10 && g10 > 0, 'the growth bill does not grow with growth: 10%=' + g10 + ' 30%=' + g30);

const t0 = b.creditTerms, s0 = b.stockPolicy;
b.creditTerms = 0;    const billNoCredit = M.growthBill(b, 0.20);
b.creditTerms = 0.85; const billCredit   = M.growthBill(b, 0.20);
b.creditTerms = t0;
ck(billCredit > billNoCredit, 'selling on credit does not cost cash: ' + billNoCredit + ' -> ' + billCredit);

b.stockPolicy = 0.1; const billLean = M.growthBill(b, 0.20);
b.stockPolicy = 0.9; const billDeep = M.growthBill(b, 0.20);
b.stockPolicy = s0;
ck(billDeep > billLean, 'holding more stock does not cost cash: ' + billLean + ' -> ' + billDeep);

/* ---------------- 3. stock you have not paid for ---------------- */
const rev = b.revenue || 0;
const target = M.wcTargetInv(b, rev);
ck(target > 0, 'a trading business targets no inventory at all');
b.inventory = 0;              ck(M.wcFunded(b, rev) === 0, 'no inventory still counts as fully funded');
b.inventory = target;         ck(M.wcFunded(b, rev) === 1, 'a fully stocked shelf does not count as funded');
b.inventory = target * 0.5;   const half = M.wcFunded(b, rev);
ck(Math.abs(half - 0.5) < 0.02, 'funding is not proportional: half the stock reads ' + half);

/* measured in the running sim, with cash held tight so the quarter cannot
   quietly re-buy what is missing */
let svcStocked = 0, svcEmpty = 0;
b.inventory = target; b.cash = 0; q(); svcStocked = b.serviceQ || 0;
b.inventory = 0;      b.cash = 0; q(); svcEmpty   = b.serviceQ || 0;
ck(svcStocked > svcEmpty, 'an empty shelf serves as well as a stocked one: ' +
   svcStocked.toFixed(3) + ' vs ' + svcEmpty.toFixed(3));
ck(svcEmpty < 0.75, 'running with no stock barely dents service: ' + svcEmpty.toFixed(3));

/* ---------------- 4. growth absorbs cash, end to end ---------------- */
/* Measured across a window, not quarter by quarter. A single growing quarter
   can legitimately be served out of stock bought earlier, and a gate that
   calls that a failure is wrong, not the model. Over a window of real growth
   the cycle must hold more cash than it did. */
/* Go and grow — and note the quality spend, which the first version of this
   fixture did without. Since customers became a stock that decays (phase 11),
   marketing alone does not grow a business whose product is mediocre: you buy
   them in the front door and they leave out the back. The gate was right that
   the window measured nothing; the fixture was the thing that had gone stale.

   It is primed for six quarters before the window opens, because quality is a
   five-quarter process and a window that opens on an unprimed firm measures
   the wrong half of the curve. */
/* Funded every quarter. The point of this window is what growth does to the
   cycle, not whether an aggressively growing firm can survive on its own cash
   — let it go insolvent and the card check later renders nothing, which looks
   like a UI failure and is actually a fixture failure. */
/* The growth driver here is the market itself, stepped up deterministically,
   with the rival removed. An earlier version leaned on marketing spend alone
   and the result swung from +48% to -45% between runs, because it was really
   measuring whether a random event or a rival's move happened to land that
   run. This gate asks what growth does to the cycle, so growth is arranged
   rather than hoped for; the rival is out because an undercut is a separate
   lesson with its own gate. */
S.rival = null;
/* Capacity headroom. Without it the firm hits the ceiling of what its outlets
   and staff can serve, demand keeps rising and revenue does not, and the gate
   reports "never grew" about a business that was simply full. */
try {
  for (let i = 0; i < 2; i++) M.openOutlet(b, { city: S.city, trading: true });
  for (let i = 0; i < 6; i++) { const c = M.genCandidate(1); c.id = 'wc' + i;
    c.salary = Math.round(M.marketSalary(c.skill) * 1.2); M.hire(c); }
} catch (e) { /* a fixture that cannot add capacity still runs, just tighter */ }
const grow = () => {
  S.mkt.demand = Math.min(6, (S.mkt.demand || 1) * 1.14);
  if (S.biz) { S.biz.marketing = 2500000;
               S.biz.qualitySpendMonthly = Math.round((S.biz.revenue || 0) * 0.06);
               S.biz.cash = Math.max(S.biz.cash || 0, 20000000); }
};
/* Primed only briefly. Six quarters of priming took revenue so high that the
   window opened against a capacity ceiling — outlets and staff cannot serve
   more — and the firm grew +1% or went backwards, which is a real constraint
   but not the one this window exists to measure. Two quarters leaves the
   headroom for growth to actually show up as growth. */
for (let i = 0; i < 2; i++) { grow(); q(); }
b.cash = 25000000; b.inventory = target; b.creditTerms = 0.4; b.stockPolicy = 0.6;
grow();
/* Measured on GROSS cycle assets — stock plus what customers owe — not net of
   payables. An earlier version measured net and failed on any firm with long
   supplier credit, where the cycle is negative and growth releases cash rather
   than absorbing it. That is not a broken model, it is negative working
   capital, and it is the whole reason suppliers are a form of financing. So
   the claim is the one that is always true: growth must be financed as stock
   before it sells and as a receivable after it does, whoever funds it. */
const gross = x => (x.inventory || 0) + (x.recv || 0);
const net   = x => gross(x) - (x.payable || 0);
const rev0 = b.revenue || 0, tie0 = gross(b), net0 = net(b);
for (let i = 0; i < 6; i++) { grow(); q(); }
const b1 = S.biz || {};
const rev1 = b1.revenue || 0, tie1 = gross(b1), net1 = net(b1);
ck(rev1 > rev0, 'the business never grew, so the window measured nothing (' + rev0 + ' -> ' + rev1 + ')');
ck(tie1 > tie0, 'six quarters of growth tied up no extra cash: ' + M.fmt(tie0) + ' -> ' + M.fmt(tie1));
const growthPct = rev0 > 0 ? ((rev1 - rev0) / rev0) : 0;

/* ---------------- 5. on screen ---------------- */
M.UI.tab = 'work'; M.UI.sub = 'business';
const card = M.viewWorkingCapital();
ck(!!card, 'no working capital card renders');
ck(/CCC -?\d+ days/.test(card), 'the card does not state the cycle');
ck(/bill for growth/i.test(card), 'the card never mentions the cost of growth');

console.log('cycle            : DSO ' + c.dso + 'd + DIO ' + c.dio + 'd - DPO ' + c.dpo +
            'd = CCC ' + c.ccc + 'd · ' + M.fmt(c.tied) + ' tied up');
console.log('growth bill      : 10% ' + M.fmt(g10) + ' · 30% ' + M.fmt(g30));
console.log('credit terms     : 0d ' + M.fmt(billNoCredit) + ' -> 77d ' + M.fmt(billCredit));
console.log('stock depth      : lean ' + M.fmt(billLean) + ' -> deep ' + M.fmt(billDeep));
console.log('service          : stocked ' + svcStocked.toFixed(3) + ' vs empty ' + svcEmpty.toFixed(3));
console.log('growth window    : revenue ' + M.fmt(rev0) + ' -> ' + M.fmt(rev1) +
  ' (+' + Math.round(growthPct*100) + '%), stock+debtors ' + M.fmt(tie0) + ' -> ' + M.fmt(tie1) +
  ' \u00b7 net of suppliers ' + M.fmt(net0) + ' -> ' + M.fmt(net1));

if (bad.length) { console.log('\nWC ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nWC CLEAN');
