/* The world: every screen in the game, as a place.

   The claims are the ones that make "everything in LEDGER, in 3D" true rather
   than a picture: one building per screen and no screen without one, read from
   the same table the tabs are drawn from; every building's label opens its own
   screen through the action the tabs already use; and looking at the world
   changes nothing - no random draw, no state touched - so a run that is looked
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

test('the labels are the controls: districts in the city, screens in a district', async () => {
  const C = await world();
  /* the markup's own buttons, read without a DOM: the unit layer has none, and
     these are flat buttons with their attributes in a fixed order */
  const buttons = (html) => [...html.matchAll(/<button class="([^"]*)" data-a="(\w+)"([^>]*)>(.*?)<\/button>/g)]
    .map((m) => ({ cls: m[1], a: m[2], attrs: m[3], text: m[4].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      d: (m[3].match(/data-d="([^"]*)"/) || [])[1], t: (m[3].match(/data-t="([^"]*)"/) || [])[1],
      s: (m[3].match(/data-s="([^"]*)"/) || [])[1] }));

  C.UI.worldFocus = '';
  const city = buttons(C.worldHTML());
  assert.deepEqual(city.filter((b) => b.a === 'worldfocus').map((b) => b.d).sort(), ['governance', 'legacy', 'money', 'work'],
    'the city does not offer the four districts');
  assert.equal(city.filter((b) => b.a === 'goto').length, 0, 'the city view offers screens before a district is open');

  for (const tab of ['work', 'money', 'governance', 'legacy']) {
    C.UI.worldFocus = tab;
    const bs = buttons(C.worldHTML());
    const gos = bs.filter((b) => b.a === 'goto').map((b) => b.t + '/' + b.s);
    const want = (C.subsFor(tab) || []).map((s) => tab + '/' + s.id);
    assert.deepEqual(gos, want, tab + ' district does not open its own screens');
    assert.ok(bs.some((b) => b.a === 'worldfocus' && b.d === ''), tab + ' district has no way back to the city');
    for (const b of bs) assert.ok(b.text.length <= 42, 'a world label is over 42 characters: ' + b.text);
  }
  C.UI.worldFocus = '';
});

test('on any screen the world stands on that screen\'s building, with a way back to the city', async () => {
  const C = await world();
  const buttons = (html) => [...html.matchAll(/<button class="([^"]*)" data-a="(\w+)"([^>]*)>(.*?)<\/button>/g)]
    .map((m) => ({ cls: m[1], a: m[2], attrs: m[3],
      d: (m[3].match(/data-d="([^"]*)"/) || [])[1], t: (m[3].match(/data-t="([^"]*)"/) || [])[1],
      s: (m[3].match(/data-s="([^"]*)"/) || [])[1] }));
  for (const tab of ['work', 'money', 'governance', 'legacy']) {
    for (const sub of C.subsFor(tab)) {
      C.UI.tab = tab; C.UI.sub = sub.id;
      const html = C.worldHTML();
      assert.match(html, new RegExp('data-here="' + tab + '/' + sub.id + '"'), tab + '/' + sub.id + ': the world does not say which building the page is');
      const bs = buttons(html);
      const here = bs.filter((b) => / here\b/.test(b.cls));
      assert.equal(here.length, 1, tab + '/' + sub.id + ': ' + here.length + ' buildings are marked as the one you are on');
      assert.equal(here[0].t + '/' + here[0].s, tab + '/' + sub.id);
      assert.match(here[0].attrs, /aria-current="page"/, 'the building you are on does not say so to a screen reader');
      assert.deepEqual(bs.filter((b) => b.a === 'goto').map((b) => b.t + '/' + b.s), C.subsFor(tab).map((x) => tab + '/' + x.id),
        tab + '/' + sub.id + ': the district around it is not its own six screens');
      const back = bs.find((b) => b.a === 'worldfocus');
      assert.ok(back && back.d === '' && back.t === 'overview', tab + '/' + sub.id + ': City does not lead back to the whole city');
    }
  }
  C.UI.tab = 'overview'; C.UI.sub = '';
  assert.match(C.worldHTML(), /data-here=""/, 'the overview claims to be a building');
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

