/* Today's life — a start that is dealt from the date, not chosen.

   The claims are the ones that make it worth having: the same day deals the
   same life everywhere (so it can be compared and cannot be re-dealt), the
   days actually differ (or it is a fixed start with extra steps), every draw
   costs something (or it is a reward, not a circumstance), and applying the
   draw leaves the seeded world alone (so a dealt run is the same world as an
   undealt run on the same seed, plus the circumstance). */
const test = require('node:test');
const assert = require('node:assert/strict');

const { core, playQuarter } = require('../helpers/env.js');

const quiet = { save: () => true, load: () => false, hasSave: () => false, wipe: () => {} };

test('the same day deals the same life, on any clock within that Lagos day', async () => {
  const C = await core();
  const a = C.todaysLife('2026-10-09');
  const b = C.todaysLife('2026-10-09');
  assert.deepEqual(a, b, 'two deals for 2026-10-09 differ: ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
  /* 23:30 UTC on the 8th is 00:30 on the 9th in Lagos */
  assert.equal(C.todayKey(Date.UTC(2026, 9, 8, 23, 30)), '2026-10-09',
    'the day is not Lagos’s: 23:30 UTC on 8 Oct should already be 9 Oct in Lagos');
  assert.equal(C.todayKey(Date.UTC(2026, 9, 8, 22, 30)), '2026-10-08');
  assert.equal(a.city, 'lagos');
  assert.equal(a.difficulty, 'realistic');
});

test('a month of days deals more than one profile, more than one draw, and thirty seeds', async () => {
  const C = await core();
  const days = Array.from({ length: 30 }, (_, i) => C.todayKey(Date.UTC(2026, 9, 1) + i * 86400000));
  const deals = days.map((d) => C.todaysLife(d));
  const profiles = new Set(deals.map((d) => d.profile));
  const draws = new Set(deals.map((d) => d.draw));
  const seeds = new Set(deals.map((d) => d.seed));
  assert.ok(profiles.size >= 3, 'thirty days dealt only ' + [...profiles].join(', '));
  assert.ok(draws.size >= 4, 'thirty days dealt only ' + [...draws].join(', '));
  assert.equal(seeds.size, 30, 'two days in a month dealt the same seed');
  deals.forEach((d) => {
    assert.ok(C.PROFILES.some((p) => p.id === d.profile), 'dealt a profile that does not exist: ' + d.profile);
    assert.ok(d.seed > 0 && Number.isInteger(d.seed), 'dealt a seed newGame would replace: ' + d.seed);
  });
});

test('every draw gives something and costs something', async () => {
  const C = await core();
  for (const d of C.DRAWS) {
    assert.ok(d.up && d.down, d.id + ' is missing the half of the deal that says what it gives or costs');
    const f = d.fx;
    const gains = (f.cash > 0) || (f.usd > 0) || Object.values(f.skills || {}).some((v) => v > 0) ||
      Object.values(f.stand || {}).some((v) => v > 0) || ((f.p || {}).family > 0) || ((f.p || {}).happy > 0);
    const costs = !!f.debt || (f.credit < 0) || (f.familyBudget > 1) || (f.giving > 0) ||
      Object.values(f.skills || {}).some((v) => v < 0) || ((f.p || {}).rep < 0) || ((f.p || {}).stress > 0);
    assert.ok(gains, d.id + ' gives nothing - a draw is a circumstance, not a punishment');
    assert.ok(costs, d.id + ' costs nothing - a draw is a circumstance, not a prize');
  }
});

test('a draw changes the start and nothing about the world it starts in', async () => {
  const C = await core();
  C.installHost(quiet);
  const deal = C.todaysLife('2026-10-09');
  for (const d of C.DRAWS) {
    C.newGame({ name: 'Ada', city: deal.city, profile: deal.profile, difficulty: deal.difficulty, seed: deal.seed });
    const plain = { rs: C.R.s, deals: JSON.stringify(C.S.deals), cash: C.S.fin.cash, cast: C.S.cast.length };
    C.newGame({ name: 'Ada', city: deal.city, profile: deal.profile, difficulty: deal.difficulty, seed: deal.seed });
    C.S.dealt = { day: deal.day, draw: d.id };
    const applied = C.applyDraw(d.id);
    assert.equal(applied && applied.id, d.id, 'applyDraw did not apply ' + d.id);
    assert.equal(C.R.s, plain.rs, d.id + ' drew from the seeded stream, so a dealt world is a different world');
    assert.equal(JSON.stringify(C.S.deals), plain.deals, d.id + ' changed the deals on the table');
    assert.equal(C.S.cast.length, plain.cast);
    if (d.fx.cash) assert.equal(C.S.fin.cash, plain.cash + d.fx.cash, d.id + ' did not add its cash');
    if (d.fx.debt) assert.ok(C.S.fin.debt.some((x) => x.id === 'draw' && x.bal === d.fx.debt.bal), d.id + ' did not add its loan');
    const line = C.S.journal.find((j) => /Dealt, not chosen/.test(j.text || j.t || JSON.stringify(j)));
    assert.ok(line, d.id + ' left no line in the chronicle, so the run forgets how it began');
    /* and it still plays */
    for (let q = 0; q < 4; q++) playQuarter(C);
    assert.equal(C.S.turn, 4, d.id + ' did not survive four quarters');
    assert.ok(Number.isFinite(C.netWorth()), d.id + ' produced a net worth that is not a number');
  }
  assert.equal(C.applyDraw('no-such-draw'), null, 'an unknown draw was applied');
});
