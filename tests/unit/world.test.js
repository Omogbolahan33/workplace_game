/* The world: your home behind every screen (VISUAL.md, M1).

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

test('the scene is your home off Work\'s career and company screens, and the house is what you spend on housing', async () => {
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
  /* everywhere but Work's career and company screens, which are at work */
  for (const [tab, sub] of [['overview', ''], ['work', 'household'], ['money', 'budget'], ['legacy', 'people'], ['governance', '']]) {
    C.UI.tab = tab; C.UI.sub = sub || ((C.subsFor(tab) || [])[0] || {}).id || '';
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

test('at work: the career screen is the tower, and your floor is your pay', async () => {
  const C = await world();
  C.UI.tab = 'work'; C.UI.sub = 'career';
  assert.match(C.worldHTML(), /<svg class="workscene"/, 'the career screen is not drawn at work');
  const floorAt = (monthly) => { C.S.p.job = { title: 'Analyst', monthly: Math.round(monthly * (C.S.cumInfl || 1) * C.CITY().payMult), industry: 'Corporate' }; return C.workLook('job').floor; };
  const floors = [250000, 900000, 3000000, 20000000].map(floorAt);
  for (let i = 1; i < floors.length; i++) assert.ok(floors[i] > floors[i - 1], 'a higher salary did not move you up the tower: ' + floors.join(' → '));
  assert.ok(floors.every((f) => f >= 1 && f <= 14), 'a floor outside the tower: ' + floors.join(', '));
  C.S.p.job = null;
  const out = C.workLook('job');
  assert.equal(out.employed, false); assert.match(out.label, /looking for a job/);
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('at work: a company is drawn as its kind of place, at its stage', async () => {
  const C = await world();
  C.UI.tab = 'work'; C.UI.sub = 'business';
  assert.equal(C.workLook('biz').kind, 'tolet', 'no company, and the scene is not an empty shop to let');
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  assert.equal(C.bizStage(C.S.biz), 'startup');
  assert.equal(C.workLook('biz').kind, 'buka', 'a new food business is not a buka');
  assert.match(C.worldHTML(), /MAMA T KITCHEN/, 'the company\'s sign does not carry its name');
  for (const [type, stage] of Object.entries({ retail: 'scale', logi: 'scale', tech: 'startup', mfg: 'scale' })) {
    assert.ok(C.WORK_PLACES[type][stage], type + ' at ' + stage + ' has no place');
  }
  for (const t of Object.keys(C.WORK_PLACES)) for (const st of ['startup', 'survival', 'traction', 'scale', 'maturity', 'decline']) {
    const svg = C.workSceneSVG({ kind: C.WORK_PLACES[t][st], name: 'Test', staff: 4, customers: 3, branches: 2, stage: st, decline: st === 'decline', broke: true, time: 'night', season: 'rain', grid: 20, gen: true, era: 'boom', age: 40 }, 560);
    assert.doesNotMatch(svg, /NaN|undefined/, t + ' at ' + st + ' drew a number it did not have');
  }
  /* household and life are still at home */
  C.UI.sub = 'household';
  assert.match(C.worldHTML(), /<svg class="homescene"/, 'the household screen is not at home');
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('looking at your home changes nothing about the run', async () => {
  const C = await world();
  for (let q = 0; q < 6; q++) playQuarter(C);
  const before = JSON.stringify(C.S), rs = C.R.s;
  const look = JSON.stringify(C.homeLook());
  const a = C.homeSceneSVG(C.homeLook(), 500);
  C.worldHTML(); C.worldHTML();
  assert.equal(C.R.s, rs, 'drawing your home moved the random stream');
  assert.equal(JSON.stringify(C.S), before, 'drawing your home changed the run');
  assert.equal(JSON.stringify(C.homeLook()), look, 'the same state read as two different homes');
  /* the same look draws the same picture, apart from each drawing's own ids */
  const strip = (svg) => svg.replace(/hs\d+-/g, 'hs-');
  assert.equal(strip(C.homeSceneSVG(C.homeLook(), 500)), strip(a), 'the same home drew two different pictures');
});

test('the quarter in pictures: home with what changed, work, the person, the headline', async () => {
  const C = await world();
  /* what changed at home, said the way a person would */
  const a = C.homeLook();
  const b = Object.assign({}, a, { kids: a.kids + 1 });
  assert.equal(C.homeChange(a, b), 'A child was born.');
  assert.match(C.homeChange(a, Object.assign({}, a, { tier: a.tier + 1 })), /^You moved: /);
  assert.equal(C.homeChange(a, a), '', 'nothing changed and something was said');
  /* a quarter played: the first picture is home, and every picture has a line */
  const before = C.quarterSnapshot();
  playQuarter(C);
  let reel = C.quarterReel(before, C.quarterSnapshot());
  assert.equal(reel[0].kind, 'home');
  assert.ok(reel.length >= 1 && reel.length <= 4, reel.length + ' pictures');
  for (const f of reel) {
    assert.ok(f.caption.length > 0 && f.caption.length <= 150, f.kind + ' has no line, or a paragraph: ' + f.caption);
    assert.doesNotMatch(f.html, /NaN|undefined/, f.kind + ' drew a number it did not have');
  }
  /* news about someone shows their face; the world turning is a headline */
  const c = C.S.cast.find((x) => x.alive);
  const t = C.S.turn;
  C.S.digest.push({ turn: t, kind: 'cast', text: c.name + ' got married.', tone: 'neutral', castId: c.id });
  C.S.digest.push({ turn: t, kind: 'era', text: 'The Bust — The music stopped.', tone: 'bad' });
  reel = C.quarterReel({ turn: t, home: C.homeLook() }, C.quarterSnapshot());
  const kinds = reel.map((f) => f.kind);
  assert.ok(kinds.includes('person'), 'news about ' + c.name + ' did not show them: ' + kinds.join(', '));
  assert.ok(kinds.includes('world'), 'a new era did not make the paper: ' + kinds.join(', '));
  assert.match(reel.find((f) => f.kind === 'world').html, /THE BUST/);
});

test('every decision has its moment: a place, the people in it, drawn', async () => {
  const C = await world();
  const places = new Set(['home', 'work', 'hall', 'hospital', 'office', 'bank', 'court', 'church', 'school', 'airport', 'land', 'street', 'market', 'boardroom', 'news']);
  for (const ev of C.ALL_EVENTS) {
    const m = C.momentOf(ev, null);
    assert.ok(places.has(m.place), ev.id + ' happens nowhere the game can draw: ' + m.place);
  }
  /* every row the table names is a place it can draw, and draws without a missing number */
  for (const key of Object.keys(C.MOMENTS)) {
    const m = C.momentOf({ id: key, cat: 'life', title: key }, null);
    assert.ok(places.has(m.place), key + ' names a place that is not drawn: ' + m.place);
    assert.doesNotMatch(C.momentSceneSVG(m, 250), /NaN|undefined/, key + ' drew a number it did not have');
  }
  /* a story's moment has the person the story is with in it */
  const c = C.S.cast.find((x) => x.alive);
  const m = C.momentOf({ id: 'x', cat: 'life', title: 'The Cousin' }, { arc: 'thecousin', castId: c.id });
  assert.equal(m.cast && m.cast.id, c.id, 'the story with ' + c.name + ' does not have them in it');
  assert.equal(m.place, 'home');
  /* governance meets in the boardroom, a wedding in a hall */
  assert.equal(C.momentOf({ id: 'deadlock_now', cat: 'biz', title: 'x' }, null).place, 'boardroom');
  assert.equal(C.momentOf(C.ALL_EVENTS.find((e) => e.id === 'wedding'), null).place, 'hall');
  /* and the card carries it */
  assert.match(C.momentHTML({ ev: C.ALL_EVENTS.find((e) => e.id === 'wedding') }), /^<div class="moment"><svg class="momentscene"/);
});

test('what comes back: on its way up the road, on the strip, and at your gate', async () => {
  const C = await world();
  C.S.pending = [];
  C.S.active = [];
  C.UI.tab = 'overview'; C.UI.sub = '';
  const quiet = C.worldHTML();
  C.S.pending.push({ turn: C.S.turn + 1, title: 'The call you were dreading', text: 'x', kind: 'bad', eff: {} });
  C.S.pending.push({ turn: C.S.turn + 5, title: 'The loan comes back', text: 'y', kind: 'good', eff: {} });
  assert.ok(C.worldHTML().length > quiet.length, 'two consequences on their way and the scene did not change');
  /* the strip marks each one at its quarter, with its date and title on the mark */
  const road = C.roadAheadSVG(C.comingBack());
  assert.equal((road.match(/<title>/g) || []).length, 2);
  assert.match(road, /The call you were dreading/);
  /* the card leads with the road, outside the fold */
  assert.match(C.comingBackHTML(), /^<div class="roadwrap"><svg class="gfx road"/);
  /* and the arrival is a picture of them at your gate */
  const arr = C.arrivalHTML([C.S.pending[0]]);
  assert.match(arr, /^<div class="moment"><svg class="homescene"/);
  assert.match(arr, /At your gate: The call you were dreading/);
  assert.doesNotMatch(arr + road, /NaN|undefined/);
});

test('the boardroom: who owns what is who sits, votes are hands, the bank watches', async () => {
  const C = await world();
  C.S.fin.cash = 60000000;
  C.startBiz('tech', 'Paystack 2', 6000000, null);
  const b = C.S.biz;
  /* looking never writes the register: ensureGov() would, and drawing must not */
  const seq = C.S.seq, shares = JSON.stringify(b.shares || null);
  C.UI.tab = 'governance'; C.UI.sub = 'register';
  assert.match(C.worldHTML(), /<svg class="boardscene"/, 'governance is not the boardroom');
  assert.equal(C.S.seq, seq, 'drawing the boardroom moved the id counter');
  assert.equal(JSON.stringify(b.shares || null), shares, 'drawing the boardroom wrote the register');
  C.ensureGov(b);
  C.grantPct(b, 22, { name: 'Lekki Ventures', kind: 'vc' });
  C.formBoard(b, {});
  let L = C.boardLook();
  const you = L.seats.find((s) => s.yours), them = L.seats.find((s) => !s.yours);
  assert.ok(you && them, 'the board is not at the table');
  assert.ok(you.pct > them.pct, 'your stake is not the larger chair: ' + you.pct + ' vs ' + them.pct);
  assert.ok(Math.abs(L.holders.reduce((s, h) => s + h.pct, 0) - 100) < 0.01, 'the register on the wall does not add up');
  assert.equal(L.lender, false);
  C.addCovenant(b, 'mincash', 900000000, 'the facility');
  L = C.boardLook();
  assert.equal(L.lender, true, 'a covenant and no bank in the room');
  assert.equal(L.breached, true, 'a breached minimum-cash covenant shows as kept');
  assert.doesNotMatch(C.boardSceneSVG(L, 560), /NaN|undefined/);
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('your city: everything you own, where it stands, as big as it is', async () => {
  const C = await world();
  C.UI.tab = 'money';
  C.UI.sub = 'markets';
  assert.match(C.worldHTML(), /<svg class="cityscene"/, 'the money screens in Lagos are not the city');
  C.UI.sub = 'budget';
  assert.match(C.worldHTML(), /<svg class="homescene"/, 'the budget is the household\'s, at home');
  C.UI.sub = 'markets';
  /* a company, a branch, land, a rental: each a pin where it lives */
  C.S.fin.cash = 300000000;
  C.startBiz('logi', 'Swift Dispatch', 6000000, null);
  C.openOutlet(C.S.biz, {});
  C.S.assets.push({ id: 'land', value: 25000000 }, { id: 'rental', value: 60000000 });
  let L = C.cityLook();
  const kinds = L.pins.map((p) => p.kind + '@' + p.area);
  assert.ok(kinds.includes('company@Apapa'), 'a logistics company is not in Apapa: ' + kinds.join(', '));
  assert.ok(kinds.includes('land@Ibeju-Lekki') && kinds.includes('rental@Ogba'), 'property is not on the map: ' + kinds.join(', '));
  assert.ok(L.pins.some((p) => p.kind === 'branch' || p.kind === 'site'), 'the branch is not on the map');
  assert.equal(JSON.stringify(C.cityLook().pins.map((p) => p.area)), JSON.stringify(L.pins.map((p) => p.area)), 'a branch moved between two looks');
  const biggest = L.pins.reduce((a, p) => (p.value > a.value ? p : a));
  assert.equal(biggest.size, Math.max(...L.pins.map((p) => p.size)), 'the biggest holding is not the biggest pin');
  assert.doesNotMatch(C.citySceneSVG(L, 560), /NaN|undefined/);
  /* every city has its own map: Abuja's has Jabi Lake, and its trades in its own neighbourhoods */
  C.S.city = 'abuja';
  const abuja = C.worldHTML();
  assert.match(abuja, /<svg class="cityscene"/);
  assert.match(abuja, /Jabi Lake/);
  assert.ok(C.cityLook().pins.some((p) => p.kind === 'company' && p.area === 'Lugbe'), 'a logistics company in Abuja is not at Lugbe');
  for (const city of Object.keys(C.CITY_MAPS)) {
    C.S.city = city;
    const L = C.cityLook();
    assert.ok(L.pins.every((p) => C.CITY_MAPS[city].areas[p.area]), city + ': a pin stands in a neighbourhood the map does not have');
    assert.doesNotMatch(C.citySceneSVG(L, 560), /NaN|undefined/, city);
  }
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('the people in your life: gathered as close as they feel, the rival across the street', async () => {
  const C = await world();
  const c = C.S.cast;
  c[0].relation = 90; c[2].relation = -60; c[3].alive = false;
  C.UI.tab = 'legacy'; C.UI.sub = 'people';
  assert.match(C.worldHTML(), /<svg class="homescene"[^>]*aria-label="The people in your life/, 'the People screen is not the gathering');
  const L = C.peopleLook();
  assert.equal(L.people[0].relation, Math.max(...L.people.map((p) => p.relation)), 'the warmest is not first');
  assert.ok(!L.people.some((p) => p.id === c[3].id), 'someone who died is standing in the compound');
  assert.ok(L.gone.includes(c[3].name), 'someone who died is not remembered');
  assert.doesNotMatch(C.peopleSceneSVG(L, 560), /NaN|undefined/);
  /* a story open with someone brings them to your gate */
  C.S.threads = [{ id: 't1', arc: 'thecousin', stage: 0, next: C.S.turn + 1, castId: c[1].id, data: {} }];
  C.UI.tab = 'overview'; C.UI.sub = '';
  assert.match(C.worldHTML(), new RegExp(c[1].name + ' · [a-z]+ · a story is open'), 'the person a story is with is not at the gate');
  /* the rival: across the street at work, outside when spoiling for a fight */
  C.S.fin.cash = 40000000;
  C.startBiz('retail', 'Tunde Ventures', 4000000, null);
  C.S.rival.aggro = 80;
  C.UI.tab = 'work'; C.UI.sub = 'rival';
  const work = C.worldHTML();
  assert.match(work, new RegExp(C.S.rival.name.toUpperCase()), 'the rival\'s sign is not across the street');
  assert.match(work, new RegExp('<title>' + C.S.rival.name + '</title>'), 'an aggressive rival is not outside');
  C.UI.tab = 'overview'; C.UI.sub = '';
});

test('every city is its own place: its seasons, its outages, its skyline', async () => {
  const C = await world();
  const night = (city, extra) => C.homeSceneSVG(Object.assign(C.homeLook(), { city, time: 'night', grid: 10, gen: false, solar: false }, extra || {}), 560);
  assert.match(night('lagos'), /NEPA has taken light/);
  assert.match(night('accra'), /Dumsor/);
  assert.match(night('nairobi'), /Stima imepotea/);
  assert.doesNotMatch(night('ldn'), /NEPA|Dumsor|Stima/, 'London has a blackout line');
  assert.doesNotMatch(night('nyc'), /NEPA|Dumsor|Stima/, 'New York has a blackout line');
  /* the season is the city's: New York snows in Q1, London is grey in Q4, Lagos has harmattan */
  for (const [city, q, season] of [['nyc', 0, 'snow'], ['ldn', 3, 'autumn'], ['lagos', 0, 'harmattan'], ['nairobi', 2, 'cool']]) {
    C.S.city = city; C.S.turn = q;
    assert.equal(C.homeLook().season, season, city + ' in Q' + (q + 1) + ' is not ' + season);
  }
  /* everything draws everywhere */
  for (const city of Object.keys(C.CITY_SKINS)) for (const tier of [1, 2, 3, 4]) {
    assert.doesNotMatch(C.homeSceneSVG(Object.assign(C.homeLook(), { city, tier }), 560), /NaN|undefined/, city + ' tier ' + tier);
  }
  C.S.city = 'lagos'; C.S.turn = 0;
});

test('the scene is a place you can tap: every place is an ordinary control', async () => {
  const C = await world();
  const controls = (html) => [...html.matchAll(/<(?:rect|g) class="(?:hotzone|hot)"[^>]*>/g)].map((m) => m[0]);
  const attr = (tag, k) => (tag.match(new RegExp('data-' + k + '="([^"]*)"')) || [])[1];
  /* at home: the house opens the budget, you open your card */
  C.UI.tab = 'overview'; C.UI.sub = '';
  let cs = controls(C.worldHTML());
  assert.ok(cs.some((t) => attr(t, 'a') === 'goto' && attr(t, 's') === 'budget'), 'the house does not open the budget');
  assert.ok(cs.some((t) => attr(t, 'a') === 'hot' && attr(t, 'k') === 'you'), 'you are not a control at home');
  for (const t of cs) {
    assert.match(t, /role="button"/); assert.match(t, /tabindex="0"/); assert.match(t, /aria-label="[^"]+"/);
    /* the scene fires only the tabs' own goto and the card it opens (ACT is the ui's; the audit gate holds both exist) */
    assert.ok(['goto', 'hot'].includes(attr(t, 'a')), 'a place in the scene fires an action it should not: ' + attr(t, 'a'));
  }
  /* in the gathering every living person opens their card, and the card is their tile */
  C.UI.tab = 'legacy'; C.UI.sub = 'people';
  cs = controls(C.worldHTML()).filter((t) => attr(t, 'k') === 'person');
  assert.equal(cs.length, C.peopleLook().people.length, 'not everyone in the gathering can be tapped');
  const id = attr(cs[0], 'c');
  assert.match(C.hotModal({ type: 'hot', kind: 'person', id: id }), /class="ctile/);
  assert.match(C.hotModal({ type: 'hot', kind: 'you' }), /data-a="spend" data-k="family"/);
  /* the air never catches a tap meant for the scene */
  assert.match(C.worldHTML(), /<g pointer-events="none">/);
  C.UI.tab = 'overview'; C.UI.sub = '';
});
