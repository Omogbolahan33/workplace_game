/* Gate: quality is a process with a discovery delay (phase 10).

   Before this, the quality slider charged you every quarter and did nothing
   with the money: `qualitySpendMonthly` went into opex and the only thing
   that ever moved `b.quality` was a random event. It was a money incinerator
   with a label on it.

   The trap it now sets, and what this gate asserts:

     1. spending on quality actually moves quality (the slider is no longer a
        incinerator)
     2. it moves SLOWLY - a quarter of spend is not a quarter of quality
     3. cutting the spend books a saving IMMEDIATELY
     4. the defects from that cut surface LATER, never sooner than three
        quarters, and they cost money when they do
     5. the bill is visible in advance, before it lands
     6. reputation falls when they surface

   Not asserted: the exact lag, defect rate or warranty cost per unit. Those
   are balance numbers. The ORDER - saving now, bill later - is the point. */
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
b.cash = 20000000;
b.qualitySpendMonthly = 0;
for (let i = 0; i < 3; i++) M.advanceQuarter();
const qStart = b.quality;

/* ---------------- 1 + 2. spend moves quality, slowly ---------------- */
b.qualitySpendMonthly = 600000;
M.advanceQuarter();
const q1 = b.quality;
ck(q1 > qStart, 'a quarter of quality spend moved nothing: ' + Math.round(qStart) + ' -> ' + Math.round(q1));
for (let i = 0; i < 8; i++) M.advanceQuarter();
const q9 = b.quality;
ck(q9 > q1 + 5, 'sustained spend did not keep moving quality: ' + Math.round(q1) + ' -> ' + Math.round(q9));
const totalMove = q9 - qStart, firstMove = q1 - qStart;
ck(firstMove < totalMove * 0.45, 'quality moved most of the way in one quarter - that is a dial, not a process: ' +
  Math.round(firstMove) + ' of ' + Math.round(totalMove));

/* ---------------- 3 + 4 + 6. the harvest ---------------- */
/* clear the decks so the only defects in flight are the ones this cut creates */
b.defects = []; b.pendingDefects = 0; b.defectBill = 0;
const opexBefore = b.opex || 0;
const repBefore = b.rep;
const cutTurn = S.turn;
b.qualitySpendMonthly = 0;
M.advanceQuarter();
const opexAfter = b.opex || 0;
ck(opexAfter < opexBefore, 'cutting quality spend did not reduce costs this quarter: ' +
  M.fmt(opexBefore) + ' -> ' + M.fmt(opexAfter));

/* The observation window is funded. This fixture is measuring what defects do
   to reputation, and a business that is quietly going bust pollutes the
   measurement with every other thing that also moves reputation. Arrange a
   solvent business; then the only thing left moving rep is the defects. */
let landed = -1, warranty = 0, pendingPeak = 0, repAtLanding = 0;
let repFallOnLanding = 0, repRiseOnLanding = 0, repPrev = b.rep;
for (let i = 0; i < 9; i++) {
  b.cash = Math.max(b.cash || 0, 20000000);      /* keep it solvent, not rich */
  const wBefore = b.warrantyQ || 0;
  M.advanceQuarter();
  pendingPeak = Math.max(pendingPeak, b.pendingDefects || 0);
  const claimsThisQuarter = (b.warrantyQ || 0) > wBefore;
  if (claimsThisQuarter) {
    const d = b.rep - repPrev;
    if (d < 0) repFallOnLanding += -d; else repRiseOnLanding += d;
  }
  if (landed < 0 && (b.warrantyQ || 0) > 0) { landed = S.turn; repAtLanding = b.rep; }
  warranty += (b.warrantyQ || 0);
  repPrev = b.rep;
}
ck(pendingPeak > 0, 'cutting quality planted no defects at all');
ck(landed < 0 || (landed - cutTurn) >= 3,
  'defects surfaced ' + (landed - cutTurn) + ' quarters after the cut - the discovery delay is not working');
ck(warranty > 0, 'the defects never cost anything when they surfaced');
/* Measured on the quarters where claims actually land, not across a
   ten-quarter drift: reputation should fall in those quarters more than it
   rises. That is the claim. */
ck(landed < 0 || repFallOnLanding > repRiseOnLanding,
   'surfaced defects cost no reputation: fell ' + repFallOnLanding.toFixed(1) +
   ' vs rose ' + repRiseOnLanding.toFixed(1) + ' on the quarters claims landed');
ck(b.rep < repBefore, 'reputation ended higher than before the cut: ' +
   repBefore.toFixed(1) + ' -> ' + b.rep.toFixed(1));

/* ---------------- 5. the bill is visible before it lands ---------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S2 = M.getS(); S2.fin.cash = 60000000;
M.startBiz('tech', 'Testco', 6000000, null);
S2.biz.cash = 20000000; S2.biz.qualitySpendMonthly = 0;
for (let i = 0; i < 4; i++) M.advanceQuarter();
ck((S2.biz.pendingDefects || 0) > 0, 'no defects are in the pipeline after four quarters of no spend');
ck((S2.biz.defectBill || 0) > 0, 'the pending bill is not priced');

console.log('spend moves quality : ' + Math.round(qStart) + ' -> ' + Math.round(q1) + ' after 1q, -> ' +
  Math.round(q9) + ' after 9q (' + Math.round(firstMove) + ' of it in the first quarter)');
console.log('harvest             : opex ' + M.fmt(opexBefore) + ' -> ' + M.fmt(opexAfter) + ' the same quarter');
console.log('discovery delay     : cut at q' + cutTurn + ', first claims q' + landed +
  ' (' + (landed - cutTurn) + 'q later), ' + M.fmt(warranty) + ' so far, ' + pendingPeak + ' units peaked in flight');
console.log('reputation          : ' + repBefore.toFixed(1) + ' -> ' + repAtLanding.toFixed(1) +
  ' when they landed, ' + b.rep.toFixed(1) + ' now');
console.log('rep on landing      : fell ' + repFallOnLanding.toFixed(1) + ' vs rose ' + repRiseOnLanding.toFixed(1) +
  ' across the quarters claims landed');
console.log('bill in the post    : ' + M.fmt(S2.biz.defectBill) + ' for ' + S2.biz.pendingDefects + ' units');

if (bad.length) { console.log('\nQUALITY ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nQUALITY CLEAN');
