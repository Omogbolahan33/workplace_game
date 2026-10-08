/* Gate: customers are a stock, and a rival is a rival (phase 11).

   Marketing used to be `1 + 0.35*(m/(m+250000))`: spend more, get more
   demand, instantly, forever - and stop spending and all of it vanishes at
   once. Neither is true.

   Claims:
     1. CAC rises as you fish out the market - the same spend buys fewer
        customers the longer you keep spending it
     2. stopping spend loses customers GRADUALLY, not in a cliff
     3. word of mouth only works above a quality threshold, and compounds off
        the base you already have
     4. the base, not the spend, is what drives demand
     5. a price cut brings a rival response, a quarter or two later
     6. no regression - the business still trades

   Not asserted: the specific CAC, churn or referral rates. Balance numbers. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* Fixed seed: without one every run of this gate plays a different world,
   so a failure can appear once and never reproduce. */

M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 80000000;
M.startBiz('tech', 'Testco', 6000000, null);
const b = S.biz;
b.cash = 30000000;
for (let i = 0; i < 3; i++) M.advanceQuarter();

/* ---------------- 1. CAC rises with saturation ---------------- */
b.marketing = 2500000;
const cacs = [], bought = [];
for (let i = 0; i < 8; i++) { M.advanceQuarter(); cacs.push(b.cacQ || 0); bought.push(b.boughtQ || 0); }
ck(cacs[cacs.length - 1] > cacs[0], 'CAC never rises: ' + M.fmt(cacs[0]) + ' -> ' + M.fmt(cacs[cacs.length - 1]));
ck(bought[bought.length - 1] < bought[0], 'the same spend keeps buying the same customers: ' +
  bought[0] + ' -> ' + bought[bought.length - 1]);
ck((b.custBase || 0) > 0, 'spending on marketing built no customer base at all');

/* ---------------- 2. decay, not a cliff ---------------- */
b.marketing = 0;
const decay = [];
for (let i = 0; i < 4; i++) { M.advanceQuarter(); decay.push(Math.round(b.custBase || 0)); }
let monotonic = true;
for (let i = 1; i < decay.length; i++) if (decay[i] >= decay[i - 1]) monotonic = false;
ck(monotonic, 'the base did not shrink steadily with no spend: ' + decay.join(' -> '));
ck(decay[decay.length - 1] > 0, 'the base went to zero the moment spending stopped: ' + decay.join(' -> '));
ck(decay[decay.length - 1] > decay[0] * 0.15,
  'the base collapsed faster than a cliff: ' + decay[0] + ' -> ' + decay[decay.length - 1]);

/* ---------------- 3. word of mouth needs quality ---------------- */
b.custBase = 5000;
b.quality = 30; b.rep = 30; M.stepCustomers(b); const womLow = b.referredQ || 0;
b.quality = 92; b.rep = 85; M.stepCustomers(b); const womHigh = b.referredQ || 0;
ck(womLow === 0, 'a bad product still gets referrals: ' + Math.round(womLow));
ck(womHigh > 0, 'a genuinely good product gets no word of mouth at all');

/* ---------------- 4. the base drives demand, not the spend ---------------- */
b.marketing = 0; b.quality = 70; b.rep = 60; b.priceIdx = 1.0; b.discountMemory = 0; b.priceRise = 0;
b.custBase = 50;  const dSmall = M.bizDemand(b);
b.custBase = 5000; const dBig = M.bizDemand(b);
ck(dBig > dSmall * 1.15, 'a hundred times the customers barely moves demand: ' +
  Math.round(dSmall) + ' -> ' + Math.round(dBig));

/* ---------------- 5. the rival answers a price cut ---------------- */
if (!S.rival) { try { M.genRival(); } catch (e) { bad.push('genRival failed: ' + e.message); } }
b.priceIdx = 1.0; b.rivalCut = 0; b.custBase = 5000;
for (let i = 0; i < 3; i++) M.advanceQuarter();
const rc0 = b.rivalCut || 0;
b.priceIdx = 0.62;
const rc = [];
for (let i = 0; i < 4; i++) { M.advanceQuarter(); rc.push(b.rivalCut || 0); }
ck(rc[rc.length - 1] > rc0 + 0.05,
  'the rival never responded to a 38% price cut: ' + rc0.toFixed(2) + ' -> ' + rc[rc.length - 1].toFixed(2));
ck(rc[0] < rc[rc.length - 1], 'the rival responded instantly, with no delay: ' + rc.map(x => x.toFixed(2)).join(' -> '));

/* ---------------- 6. no regression ---------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S3 = M.getS(); S3.fin.cash = 80000000;
M.startBiz('tech', 'Testco', 6000000, null);
S3.biz.cash = 30000000; S3.biz.marketing = 600000;
for (let i = 0; i < 10; i++) M.advanceQuarter();
ck((S3.biz.revenue || 0) > 0, 'a business with marketing stopped trading entirely');
ck((S3.biz.custBase || 0) > 0, 'a trading business has no customers at all');

console.log('CAC as you saturate : ' + cacs.map(c => M.fmt(c)).join(' -> '));
console.log('customers bought    : ' + bought.join(' -> ') + ' for the same spend');
console.log('decay with no spend : ' + decay.join(' -> ') + ' (gradual, not a cliff)');
console.log('word of mouth       : quality 30 -> ' + Math.round(womLow) + ', quality 92 -> ' + Math.round(womHigh));
console.log('demand vs base      : 50 customers ' + Math.round(dSmall) + ', 5000 customers ' + Math.round(dBig));
console.log('rival response      : ' + rc0.toFixed(2) + ' -> ' + rc.map(x => x.toFixed(2)).join(' -> ') + ' after a 38% cut');
console.log('no regression       : revenue ' + M.fmt(Math.round(S3.biz.revenue)) + ', base ' + Math.round(S3.biz.custBase));

if (bad.length) { console.log('\nMARKET ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nMARKET CLEAN');
