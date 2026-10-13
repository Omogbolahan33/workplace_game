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
