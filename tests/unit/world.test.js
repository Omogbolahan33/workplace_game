/* The world: your home behind every screen (VISUAL.md, M1), and the city
   model the 3D renderer still draws from until M2 retires it.

   The claims: the house, the things and the people in the picture are readings
   of the run - housing spend against the city's need, the goods you bought,
   your family and staff, the quarter's season - and looking at the world
   changes nothing: no random draw, no state touched, so a run that is looked
   at is the same run as one that is not. */
const test = require('node:test');
const assert = require('node:assert/strict');

const { core, playQuarter } = require('../helpers/env.js');

const quiet = { save: () => true, load: () => false, hasSave: () => false, wipe: () => {} };

async function world() {
  const C = await core();
  C.installHost(quiet);
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  return C;
}

test('every screen in the navigation is exactly one building, and nothing else is', async () => {
  const C = await world();
  const m = C.worldModel();
  const routes = C.TABS.filter((t) => t.id !== 'overview')
    .flatMap((t) => (C.subsFor(t.id) || []).map((s) => t.id + '/' + s.id));
  const ids = m.buildings.map((b) => b.id);
  assert.deepEqual([...ids].sort(), [...routes].sort(),
    'the world and the navigation disagree: missing ' +
    JSON.stringify(routes.filter((r) => !ids.includes(r))) + ', extra ' + JSON.stringify(ids.filter((i) => !routes.includes(i))));
  assert.equal(new Set(ids).size, ids.length, 'two buildings stand for the same screen');
  assert.deepEqual(m.districts.map((d) => d.tab).sort(), C.TABS.filter((t) => t.id !== 'overview').map((t) => t.id).sort());
  for (const b of m.buildings) {
    assert.ok(b.h > 0 && b.h <= 9.5, b.id + ' has a height the camera cannot frame: ' + b.h);
    assert.ok(Number.isFinite(b.x) && Number.isFinite(b.z), b.id + ' stands nowhere');
    assert.ok(b.note.length <= 18, b.id + "'s note is a sentence, not a fact: " + JSON.stringify(b.note));
  }
});

test('no two buildings share a lot', async () => {
  const C = await world();
  const lots = C.worldModel().buildings;
  for (let i = 0; i < lots.length; i++) {
    for (let j = i + 1; j < lots.length; j++) {
      const d = Math.hypot(lots[i].x - lots[j].x, lots[i].z - lots[j].z);
      assert.ok(d > 4, lots[i].id + ' and ' + lots[j].id + ' stand ' + d.toFixed(2) + ' apart, inside each other');
    }
  }
});

test('the scene behind every screen is your home, and the house is what you spend on housing', async () => {
  const C = await world();
  /* the base is what housing costs a single person in the city, at today's prices */
  const base = 70000 * C.CITY().rentMult * 0.75 * (C.S.cumInfl || 1);
  const tierAt = (k) => { C.S.fin.budget.housing = Math.round(base * k); return C.homeLook().tier; };
  assert.deepEqual([0.6, 1.2, 3, 8, 20].map(tierAt), [1, 1, 2, 3, 4], 'the house does not follow the housing spend');
  /* a family on the same rent lives in the same house, tighter - not a bigger one */
  C.S.fin.budget.housing = Math.round(base * 3);
  const single = C.homeLook().tier;
  C.S.p.married = true; C.S.p.kids = 3;
  assert.equal(C.homeLook().tier, single, 'marrying moved you to a different house on the same rent');
  for (const tab of ['overview', 'work', 'money', 'legacy']) {
    C.UI.tab = tab; C.UI.sub = tab === 'overview' ? '' : C.subsFor(tab)[0].id;
    const html = C.worldHTML();
    assert.match(html, /<svg class="homescene"/, tab + ': the scene is not your home');
    assert.match(html, /class="hud"/, tab + ': the HUD is not over the scene');
    assert.doesNotMatch(html, /NaN|undefined/, tab + ': the scene drew a number it did not have');
  }
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('what you own and who lives with you are in the picture', async () => {
  const C = await world();
  C.S.fin.goods = [];
  C.S.p.married = false; C.S.p.kids = 0; C.S.house = [];
  let L = C.homeLook();
  assert.deepEqual([L.gen, L.solar, L.car, L.spouse, L.kids, L.staff.length], [false, false, 0, false, 0, 0]);
  const plain = C.homeSceneSVG(L, 300);
  C.S.fin.goods = [{ id: 'gen', turn: 0 }, { id: 'solar', turn: 0 }, { id: 'car', turn: 0 }, { id: 'car', turn: 1 }, { id: 'car', turn: 2 }];
  C.S.p.married = true; C.S.p.kids = 2; C.S.house = [{ role: 'driver' }, { role: 'security' }];
  L = C.homeLook();
  assert.deepEqual([L.gen, L.solar, L.car, L.spouse, L.kids], [true, true, 2, true, 2], 'the goods and the family do not reach the picture');
  assert.deepEqual(L.staff.sort(), ['driver', 'security']);
  assert.ok(C.homeSceneSVG(L, 300).length > plain.length, 'a family, staff, a generator and two cars drew nothing more than an empty compound');
  /* the view is as tall as it is asked to be, and never shorter than the scene */
  assert.match(C.homeSceneSVG(L, 600), /viewBox="0 -300 390 600"/);
  assert.match(C.homeSceneSVG(L, 120), /viewBox="0 0 390 300"/);
});

test('the air is the quarter\'s: harmattan in Q1, the rains in Q2 and Q3, dry in Q4', async () => {
  const C = await world();
  const at = (t) => { C.S.turn = t; return C.homeLook().season; };
  assert.deepEqual([0, 1, 2, 3, 4, 41].map(at), ['harmattan', 'rain', 'rain', 'dry', 'harmattan', 'rain']);
});

test('looking at the world changes nothing about the run', async () => {
  const C = await world();
  for (let q = 0; q < 6; q++) playQuarter(C);
  const before = JSON.stringify(C.S), rs = C.R.s;
  const a = JSON.stringify(C.worldModel());
  C.UI.worldFocus = 'money';
  C.worldHTML();
  C.UI.worldFocus = '';
  C.worldHTML();
  assert.equal(C.R.s, rs, 'drawing the world moved the random stream');
  assert.equal(JSON.stringify(C.S), before, 'drawing the world changed the run');
  assert.equal(JSON.stringify(C.worldModel()), a, 'the same state drew two different cities');
});

test('the buildings answer to the state they stand for', async () => {
  const C = await world();
  const h = (id) => C.worldModel().buildings.find((b) => b.id === id);
  const before = h('money/position').h;
  C.S.fin.cash += 500000000;
  assert.ok(h('money/position').h > before, 'net worth rose by ₦500m and the position tower did not grow');
  assert.equal(h('work/business').muted, true, 'a run with no company shows a business');
  assert.match(h('work/business').note, /no company/);
});

test('the people in your life live where their role belongs, and show what the game knows', async () => {
  const C = await world();
  const routes = new Set(C.worldModel().buildings.map((b) => b.id));
  const alive = C.S.cast.filter((c) => c.alive);
  let m = C.worldModel();
  assert.equal(m.people.length, Math.min(10, alive.length), 'not everyone alive is in the city');
  for (const p of m.people) {
    assert.ok(routes.has(p.home), p.name + ' lives at ' + p.home + ', which is not a building in the city');
    assert.equal(p.home, C.worldHome(p.role), p.name + ' is not at the building their role belongs to');
  }
  /* someone who died, or emigrated, is not in the city */
  const gone = alive[0], away = alive[1];
  gone.alive = false; away.tags = Object.assign({}, away.tags, { emigrated: true });
  m = C.worldModel();
  assert.ok(!m.people.some((p) => p.id === gone.id), 'someone who died is still walking about');
  assert.ok(!m.people.some((p) => p.id === away.id), 'someone who emigrated is still walking about');
  gone.alive = true; away.tags.emigrated = false;
  /* a story open with someone marks them; what you just did to them shows */
  const c = alive[2];
  C.S.threads = (C.S.threads || []).concat([{ castId: c.id, arc: 'test', stage: 0 }]);
  C.relate(c, 8, 'a test kindness');
  m = C.worldModel();
  const p = m.people.find((x) => x.id === c.id);
  assert.equal(p.story, true, 'an open story with ' + p.name + ' does not show on them');
  assert.equal(p.felt, 'up', 'a kindness this quarter does not show on ' + p.name);
  C.S.threads = C.S.threads.filter((t) => t.arc !== 'test');
});

test('you are in the city as you are: tired, ill or happy, and dressed for work when you have it', async () => {
  const C = await world();
  const me = () => C.worldModel().me;
  C.S.p.health = 20; assert.equal(me().mood, 'ill');
  C.S.p.health = 80; C.S.p.stress = 90; assert.equal(me().mood, 'tired');
  C.S.p.stress = 20; C.S.p.happy = 90; assert.equal(me().mood, 'happy');
  C.S.p.job = { title: 'Analyst', monthly: 500000, industry: 'Corporate' };
  assert.equal(me().suit, true, 'a job does not dress you for work');
  C.S.p.job = null;
  assert.equal(me().suit, false);
});

