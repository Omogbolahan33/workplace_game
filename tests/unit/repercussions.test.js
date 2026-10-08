/* Repercussions you can see.

   A decision moves numbers now and schedules more for later. The claims: the
   result says what moved, with the right sign and tone; whatever the choice
   scheduled is signed with the choice and listed under Coming back to you
   until it lands; and measuring draws nothing from the seeded stream, so a run
   that is watched is the same run as one that is not. */
const test = require('node:test');
const assert = require('node:assert/strict');

const { core, stubDOM } = require('../helpers/env.js');

const quiet = { save: () => true, load: () => false, hasSave: () => false, wipe: () => {} };

/* a real card from the decks whose option queues a consequence for later */
function delayedChoice(C) {
  for (const ev of C.ALL_EVENTS) {
    for (const opt of ev.opts || []) {
      if (opt.odds === undefined && !opt.effFn && !opt.delayFn && opt.eff && opt.eff.delay) return { ev, opt };
    }
  }
  return null;
}

test('deltaOf reports what moved, with the sign and whether it helps', async () => {
  const C = await core();
  const a = { cash: 1000000, usd: 0, debt: 0, biz: 0, hours: 200, health: 70, stress: 30, happy: 60, family: 60, rep: 40, credit: 60 };
  const b = Object.assign({}, a, { cash: 800000, stress: 36, family: 66, hours: 160, debt: 0.4 });
  const fx = C.deltaOf(a, b);
  const by = Object.fromEntries(fx.map((x) => [x.k, x]));
  assert.equal(by.cash.d, -200000);
  assert.equal(by.cash.tone, -1, 'losing cash was not reported as bad');
  assert.equal(by.stress.tone, -1, 'more stress was not reported as bad');
  assert.equal(by.family.tone, 1, 'more family was not reported as good');
  assert.equal(by.hours.tone, 0, 'spending hours was given a tone; it is neither good nor bad');
  assert.ok(!by.debt, 'a change under one naira was reported as an effect');
  const html = C.fxChipsHTML(fx);
  assert.match(html, /chip r">cash −/, 'the cash chip is not drawn as a red loss: ' + html);
  assert.match(html, /chip g">family \+6/, 'the family chip is not drawn as a green gain: ' + html);
});

test('a choice that schedules a consequence signs it, lists it, and lands it', async () => {
  stubDOM();
  const C = await core();
  C.installHost(quiet);
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  const found = delayedChoice(C);
  assert.ok(found, 'no card in the decks schedules a consequence, so nothing here was checked');
  const { ev, opt } = found;

  const before = C.S.pending.length;
  const res = C.resolveOption(ev, opt);
  const made = C.S.pending.slice(before);
  assert.equal(made.length, 1, 'the choice "' + C.optLabel(opt) + '" did not queue its consequence');
  assert.ok(made[0].from && made[0].from.includes(C.optLabel(opt)),
    'the queued consequence does not say which choice set it off: ' + JSON.stringify(made[0]));
  assert.equal(res.echo.length, 1, 'the result does not carry what the choice set in motion');
  assert.equal(res.echo[0].turn, made[0].turn);
  assert.ok(Array.isArray(res.fx), 'the result does not carry what the choice did');
  assert.match(C.resultFxHTML(res), /Comes back /, 'the result card does not say the consequence comes back');

  const listed = C.comingBack().find((i) => i.title === made[0].title);
  assert.ok(listed, 'Coming back to you does not list the consequence the choice just queued');
  assert.equal(listed.from, made[0].from);
  assert.match(C.comingBackHTML(), /Coming back to you/);

  /* and when its quarter comes, it lands and leaves the list */
  const due = made[0].turn;
  C.S.turn = due;
  const landed = C.flushPending();
  assert.ok(landed.some((p) => p.title === made[0].title), 'the consequence did not land on its quarter');
  assert.ok(!C.comingBack().some((i) => i.title === made[0].title && i.from === made[0].from),
    'a consequence that has landed is still listed as coming back');
});

test('measuring a choice draws nothing from the seeded stream', async () => {
  const C = await core();
  C.installHost(quiet);
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  const rs = C.R.s;
  C.vitals(); C.deltaOf(C.vitals(), C.vitals()); C.comingBack(); C.comingBackHTML();
  assert.equal(C.R.s, rs, 'reading the vitals moved the random stream, so watching a run changes it');
});
