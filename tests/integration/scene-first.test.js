/* The sheet, scene first (VISUAL.md, M11).

   The claim: where the picture holds a decision, the sheet under it shows the
   people as faces that open the same cards the picture does, and nothing is
   lost - (i) brings the full tables back, in the same renderer. Core and ui
   together, because the sheet is ui's and the cards are core's. */
const test = require('node:test');
const assert = require('node:assert/strict');

const { core, ui, stubDOM } = require('../helpers/env.js');

test('staff and cast are faces on the sheet; (i) brings the full cards back', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  for (let i = 0; i < 3; i++) C.S.biz.staff.push({ id: 'st' + i, name: 'Staff ' + i, role: 'ops', skill: 5, salary: 90000, morale: 60, trait: null, joined: 0 });

  C.UI.details = false;
  const biz = C.viewBiz();
  assert.deepEqual([...biz.matchAll(/class="facebtn" data-a="hot" data-k="staff" data-c="([^"]+)"/g)].map((m) => m[1]), ['st0', 'st1', 'st2']);
  assert.doesNotMatch(biz, /data-a="fire"/, 'the staff table is still on the sheet');
  const people = C.viewPeople();
  const cast = [...people.matchAll(/class="facebtn" data-a="hot" data-k="person" data-c="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(cast.length > 0, 'the cast strip is empty');

  /* the card behind each face has what the table row had */
  const card = C.hotModal({ type: 'hot', kind: 'staff', id: 'st0' });
  assert.match(card, /data-a="raise" data-i="st0"/); assert.match(card, /data-a="fire" data-i="st0"/);

  C.UI.details = true;
  assert.match(C.viewBiz(), /data-a="fire" data-i="st0"/, 'the staff table did not come back with (i)');
  assert.doesNotMatch(C.viewBiz(), /class="facebtn"/);
  assert.doesNotMatch(C.viewPeople(), /class="facebtn"/, 'the cast strip stayed with (i) on');
  C.UI.details = false;
});

test('the household and the board are faces on the sheet; (i) brings the rows back', async () => {
  stubDOM();
  const C = await core();
  const U = await ui();
  U.install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  const viewBoard = U.exported.viewBoard;
  C.S.house = ['security', 'driver', 'nanny'].map((r, i) => ({ id: 'hh' + i, role: r, name: 'H' + i, skill: 5, salary: 120000, morale: 60, loyalty: 70, perks: {}, payer: 'you' }));
  C.S.fin.cash = 60000000;
  C.startBiz('tech', 'Paystack 2', 6000000, null);
  const b = C.S.biz;
  C.ensureGov(b); C.grantPct(b, 22, { name: 'Lekki Ventures', kind: 'vc' }); C.formBoard(b, {});
  const seated = C.boardOf(b).filter((d) => !d.departing).map((d) => d.id);

  C.UI.details = false;
  const house = C.viewHousehold();
  assert.deepEqual([...house.matchAll(/class="facebtn" data-a="hot" data-k="house" data-c="([^"]+)"/g)].map((m) => m[1]), ['hh0', 'hh1', 'hh2']);
  assert.doesNotMatch(house, /data-hrole=/, 'the household rows are still on the sheet');
  const board = viewBoard(b);
  assert.deepEqual([...board.matchAll(/class="facebtn" data-a="hot" data-k="director" data-c="([^"]+)"/g)].map((m) => m[1]), seated);
  assert.doesNotMatch(board, /data-a="lobby"/, 'the director rows are still on the sheet');

  C.UI.details = true;
  const full = C.viewHousehold();
  assert.match(full, /data-hrole="hh0"/, 'the household rows did not come back with (i)');
  /* the row and the card read the same controls */
  assert.ok(full.includes(C.houseControlsHTML(C.S.house[0])));
  assert.doesNotMatch(full, /class="facebtn"/);
  const fullBoard = viewBoard(b);
  assert.match(fullBoard, /data-a="lobby"/, 'the director rows did not come back with (i)');
  for (const d of C.boardOf(b).filter((x) => !x.departing)) assert.ok(fullBoard.includes(C.directorFactsHTML(b, d)));
  C.UI.details = false;
});

test('the applicants and the household\'s job seekers are faces on the sheet; (i) brings the offer cards back', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  C.S.candidates = [0, 1, 2].map((i) => ({ id: 'cd' + i, name: 'Applicant ' + i, skill: 4 + i * 2, salary: 300000, ask: 330000, trait: null }));
  C.S.houseCands = [0, 1, 2].map((i) => ({ id: 'hc' + i, name: 'Seeker ' + i, role: 'driver', skill: 5, salary: 150000, ask: 170000, trait: null }));

  C.UI.details = false;
  const biz = C.viewBiz();
  assert.deepEqual([...biz.matchAll(/class="facebtn" data-a="hot" data-k="applicant" data-c="([^"]+)"/g)].map((m) => m[1]), ['cd0', 'cd1', 'cd2']);
  assert.doesNotMatch(biz, /data-a="hirenego"/, 'the offer cards are still on the sheet');
  const house = C.viewHousehold();
  assert.deepEqual([...house.matchAll(/class="facebtn" data-a="hot" data-k="seeker" data-c="([^"]+)"/g)].map((m) => m[1]), ['hc0', 'hc1', 'hc2']);
  assert.doesNotMatch(house, /data-a="housenego"/);

  C.UI.details = true;
  assert.match(C.viewBiz(), /data-a="hirenego" data-i="cd0"/, 'the offer cards did not come back with (i)');
  assert.match(C.viewHousehold(), /data-a="housenego" data-i="hc0"/);
  C.UI.details = false;
});

test('the Levers card is four tiles and Conditions is on their cards; (i) brings both back', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  const b = C.S.biz;

  C.UI.details = false;
  const engine = C.viewEngine();
  assert.deepEqual([...engine.matchAll(/class="facebtn" data-a="hot" data-k="([^"]+)"/g)].map((m) => m[1]), ['stock', 'customers', 'owner', 'premises']);
  assert.match(engine, /<h3>Levers /, 'the agenda\'s "Levers" link has nowhere to land');
  assert.doesNotMatch(engine, /data-inp="bizcred"|data-inp="bizstock"|data-inp="bizdraw"/, 'the sliders are still on the sheet');
  assert.doesNotMatch(engine, /<h3>Conditions<\/h3>/);
  /* the grid still closes: as many </div> as <div */
  assert.equal((engine.match(/<div/g) || []).length, (engine.match(/<\/div>/g) || []).length);

  C.UI.details = true;
  const full = C.viewEngine();
  for (const w of ['cred', 'stock', 'draw']) assert.ok(full.includes(C.leverSliderHTML(b, w)), w + ' did not come back with (i)');
  assert.ok(full.includes(C.coverButtonsHTML(b)));
  assert.match(full, /<h3>Conditions<\/h3>/);
  assert.match(full, /data-a="supplnego"/);
  C.UI.details = false;
});

test('the Levers screen leads with tiles: the dials are the machine, the commitments open their cards', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  const b = C.S.biz;

  C.UI.details = false;
  const set = C.leverColSet(b), commit = C.leverColCommit(b);
  assert.ok(set.includes(C.machineTilesHTML(b)));
  assert.doesNotMatch(set, /data-a="goto"/, 'the Change buttons are still on the sheet');
  assert.ok(commit.includes(C.commitTilesHTML(b)));
  assert.doesNotMatch(commit, /data-a="levershift"/, 'the commit rows are still on the sheet');
  assert.match(commit, />Hire someone</); assert.match(commit, />Open a unit</);

  C.UI.details = true;
  assert.match(C.leverColSet(b), />Change</, 'the dials did not come back with (i)');
  assert.match(C.leverColCommit(b), /data-a="levershift"/);
  C.UI.details = false;
});

test('the deals on the table are pictures and the partnership offers faces; (i) brings the rows back', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  C.S.deals = [C.genDeal(), C.genDeal()];
  C.S.offers = [{ id: 'of1', name: 'Segun Ibrahim', equity: 31, capital: 6900000, bg: 'family money', skill: 'tech', ask: 'a seat' }];

  C.UI.details = false;
  const v = C.viewDeals();
  assert.deepEqual([...v.matchAll(/class="dealtile" data-a="hot" data-k="deal" data-c="([^"]+)"/g)].map((m) => m[1]), C.S.deals.map((d) => d.id));
  assert.match(v, /data-k="offer" data-c="of1"/);
  assert.doesNotMatch(v, /data-a="takedeal"|data-a="takepartner"/, 'the rows are still on the sheet');
  assert.match(C.hotModal({ type: 'hot', kind: 'offer', id: 'of1' }), /data-a="takepartner" data-i="of1"/);

  C.UI.details = true;
  const full = C.viewDeals();
  assert.match(full, /data-a="takedeal"/); assert.match(full, /data-a="takepartner" data-i="of1"/);
  assert.doesNotMatch(full, /class="dealtile"/);
  C.UI.details = false;
});

test('the Deed is seals and the register a picture; (i) brings the table and the buttons back', async () => {
  stubDOM();
  const C = await core();
  const U = await ui();
  U.install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 60000000;
  C.startBiz('tech', 'Paystack 2', 6000000, null);
  const b = C.S.biz;
  C.ensureGov(b); C.grantPct(b, 22, { name: 'Lekki Ventures', kind: 'vc' });
  const viewDeed = U.exported.viewDeed, viewRegister = U.exported.viewRegister;

  C.UI.details = false;
  const deed = viewDeed(b);
  assert.ok(deed.includes(C.deedTilesHTML(b)));
  assert.doesNotMatch(deed, /data-a="amenddeed"|data-a="shotgun"/, 'the buttons are still on the sheet');
  assert.ok(viewRegister(b).includes(C.registerPictureHTML(b)));

  C.UI.details = true;
  assert.match(viewDeed(b), /data-a="amenddeed" data-k="preEmption"/, 'the amendments did not come back with (i)');
  assert.match(viewRegister(b), /If the company were sold at today/);
  C.UI.details = false;
});

test('the chronicle reads newest first, and world-first it is a line and tiles', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  for (let i = 0; i < 6; i++) { C.advanceQuarter(); C.UI.modal = null; }
  C.UI.details = true;
  const list = C.viewLedgerChronicle();
  /* the first entry on the screen is the latest thing that happened */
  const first = list.match(/<div class="logline"[^>]*><div class="t">([^<]+)<\/div>/)[1];
  assert.ok(first.indexOf(C.S.journal[0].date) === 0, 'the chronicle opens on ' + first + ', not on the latest quarter ' + C.S.journal[0].date);
  C.UI.details = false;
  const pic = C.viewLedgerChronicle();
  assert.ok(pic.includes(C.chronicleInnerHTML(C.S.journal.slice(0, 40))));
  assert.doesNotMatch(pic, /class="logline"/);
});

test('the board pack leads with the waterfalls; (i) brings the rows back', async () => {
  stubDOM();
  const C = await core();
  const U = await ui();
  U.install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  for (let i = 0; i < 4; i++) { C.advanceQuarter(); C.UI.modal = null; }
  const viewPack = U.exported.viewPack, b = C.S.biz;
  C.UI.details = false;
  const pack = viewPack(b);
  assert.equal((pack.match(/class="gfx wfchart"/g) || []).length, 2, 'the accounts and the cash are not both waterfalls');
  assert.match(pack, /data-a="proposeplan"/, 'the plan lost its control');
  assert.equal((pack.match(/<div/g) || []).length, (pack.match(/<\/div>/g) || []).length, 'the cards do not close');
  C.UI.details = true;
  const rows = viewPack(b);
  assert.doesNotMatch(rows, /wfchart/); assert.match(rows, /Opening cash/);
  C.UI.details = false;
});

test('the business screen draws working capital, position and demand; (i) brings the rows back', async () => {
  stubDOM();
  const C = await core();
  (await ui()).install();
  C.newGame({ name: 'Ada', city: 'lagos', profile: 'returnee', difficulty: 'realistic', seed: 4242 });
  C.S.fin.cash = 40000000;
  C.startBiz('food', 'Mama T Kitchen', 4000000, null);
  for (let i = 0; i < 4; i++) { C.advanceQuarter(); C.UI.modal = null; }
  const b = C.S.biz;
  C.UI.details = false;
  assert.ok(C.viewWorkingCapital().includes(C.wcCycleInner(b)));
  assert.match(C.viewWorkingCapital(), /The bill for growth/, 'the bill for growth went with the rows');
  assert.ok(C.viewEngine().includes(C.positionInner(b)));
  assert.ok(C.viewBiz().includes(C.companyMeterInner(b)));
  C.UI.details = true;
  assert.match(C.viewWorkingCapital(), /Sitting in stock/);
  assert.match(C.viewEngine(), /Equipment &amp; fit-out/);
  assert.match(C.viewBiz(), /Demand at current price/);
  C.UI.details = false;
});
