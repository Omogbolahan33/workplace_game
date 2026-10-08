/* Gate: price is a claim, not a number (phase 9).

   You cannot decide to charge 18% above list. You can only charge what your
   positioning supports. Charge above it and customers do not gently buy less,
   they leave. Cut repeatedly and the market learns to wait for the sale, so
   the climb back costs more than the slide ever gained - an asymmetry that
   elasticity alone can never produce, because elasticity only knows the level.

   Claims:
     1. charging above your band costs more than elasticity predicts
     2. repeated cuts build discount memory
     3. ASYMMETRY - the climb back costs more with a habit than without
     4. positioning is earned by quality and service, and spent by discounting
     5. charging above your station costs reputation
     6. a stronger position earns a wider band

   Not asserted: the specific band widths or penalty sizes. Balance numbers. */
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
for (let i = 0; i < 4; i++) M.advanceQuarter();

/* ---------------- 1. above your station ---------------- */
b.priceIdx = 1.0; b.discountMemory = 0; b.lastPriceIdx = 1.0; b.priceRise = 0; b.priceRaising = false;
const base = M.bizDemand(b);
const band = M.priceBand(b);
const way = Math.max(1.61, band.hi + 0.55);
b.priceIdx = way; M.stepPriceMemory(b);
const above = M.bizDemand(b);
const naive = base * Math.pow(1 / way, 1.4);            // what elasticity alone would give
ck(above < naive * 0.6, 'charging ' + Math.round(way * 100) + '% only cost what elasticity predicts: ' +
  Math.round(above) + ' vs ' + Math.round(naive));

/* ---------------- 2 + 3. the discount habit, and the climb back ---------------- */
b.priceIdx = 1.0; b.discountMemory = 0; b.lastPriceIdx = 1.0; b.priceRise = 0; b.priceRaising = false;
const at100 = M.bizDemand(b);
let memStart = b.discountMemory || 0;
for (let i = 0; i < 4; i++) { b.priceIdx = 0.70; M.stepPriceMemory(b); }
const mem = b.discountMemory || 0;
ck(mem > memStart + 0.3, 'four price cuts built no discount memory: ' + memStart.toFixed(2) + ' -> ' + mem.toFixed(2));
const cheap = M.bizDemand(b);
ck(cheap > at100, 'cutting 30% bought no volume at all');

/* identical business, same climb, no habit */
const clean = JSON.parse(JSON.stringify(b));
clean.discountMemory = 0; clean.priceRise = 0.30; clean.priceRaising = true;
b.priceIdx = 1.0; M.stepPriceMemory(b);
const withMem = M.bizDemand(b);
const withoutMem = M.bizDemand(clean);
ck(withMem < withoutMem * 0.92, 'ASYMMETRY MISSING: climbing back with a discount habit (' +
  Math.round(withMem) + ') costs the same as without (' + Math.round(withoutMem) + ')');

/* ---------------- 4. positioning is earned, and spent ---------------- */
const posBefore = b.positioning === undefined ? 45 : b.positioning;
b.quality = 92; b.serviceQ = 0.95; b.discountMemory = 0;
for (let i = 0; i < 6; i++) M.stepPriceMemory(b);
const posHigh = b.positioning;
b.quality = 18; b.serviceQ = 0.55; b.discountMemory = 0.8;
for (let i = 0; i < 6; i++) M.stepPriceMemory(b);
const posLow = b.positioning;
ck(posHigh > posLow + 8, 'quality and service do not earn positioning: high ' +
  Math.round(posHigh) + ' vs low ' + Math.round(posLow));

/* ---------------- 5. reputation ---------------- */
b.discountMemory = 0; b.quality = 60;
b.priceIdx = 1.0; M.stepPriceMemory(b);
const repBefore = b.rep;
b.priceIdx = Math.max(1.61, M.priceBand(b).hi + 0.6);
M.stepPriceMemory(b);
M.advanceQuarter();
ck(b.rep < repBefore, 'charging above your station cost no reputation: ' + repBefore.toFixed(1) + ' -> ' + b.rep.toFixed(1));

/* ---------------- 6. a stronger position earns a wider band ---------------- */
const weak = { positioning: 20 }, strong = { positioning: 85 };
const bw = M.priceBand(weak), bs = M.priceBand(strong);
ck(bs.hi > bw.hi, 'a premium position earns no more headroom: ' + bw.hi.toFixed(2) + ' vs ' + bs.hi.toFixed(2));

console.log('above the band   : ' + Math.round(above) + ' actual vs ' + Math.round(naive) + ' if elasticity were the whole story');
console.log('cut to 70%       : volume ' + Math.round(at100) + ' -> ' + Math.round(cheap) + ', memory ' + mem.toFixed(2));
console.log('climb back       : ' + Math.round(withoutMem) + ' without a habit, ' + Math.round(withMem) +
  ' with  (' + Math.round((1 - withMem / withoutMem) * 100) + '% of the recovery lost)');
console.log('positioning      : ' + Math.round(posBefore) + ' -> ' + Math.round(posHigh) + ' (quality 92) -> ' +
  Math.round(posLow) + ' (quality 18, discounting)');
console.log('reputation       : ' + repBefore.toFixed(1) + ' -> ' + b.rep.toFixed(1) + ' after charging above the band');
console.log('band             : pos 20 -> ' + Math.round(bw.lo * 100) + '-' + Math.round(bw.hi * 100) +
  '% · pos 85 -> ' + Math.round(bs.lo * 100) + '-' + Math.round(bs.hi * 100) + '%');

if (bad.length) { console.log('\nPRICE ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nPRICE CLEAN');
