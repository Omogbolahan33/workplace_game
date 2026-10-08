/* The bridge: every string that crosses between the WebView and React Native.

   This is the narrowest surface in the app and the only one where a mistake is
   silent — a message that parses into something plausible but wrong ("save
   this" becoming "save nothing") cannot be seen from either side. So the tests
   are about shape: what is accepted, what is refused, and what a refusal looks
   like from the other side.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const bridge = require(path.join(__dirname, '..', '..', 'apps', 'mobile', 'src', 'bridge.js'));

/* the ten types the app and the page agree on, read from the module rather than
   typed here — a test with its own copy of the contract tests the copy */
const TYPES = bridge.TYPES || Object.keys(bridge.HANDLERS || {});

test('the contract is ten named message types, each of them documented', () => {
  /* `HANDLERS` is the contract written down: type → what crosses, on which side
     of the body. Not a function table — the app's handlers live in App.jsx where
     the ones that need a native module can reach one, and this is the list both
     sides are written against. */
  assert.equal(TYPES.length, 10, 'the bridge carries ten types, found ' + TYPES.length);
  assert.equal(new Set(TYPES).size, TYPES.length, 'a duplicated type is a message that means two things');
  for (const t of TYPES) {
    const doc = bridge.HANDLERS && bridge.HANDLERS[t];
    assert.ok(typeof doc === 'string' && doc.length > 8,
      'type "' + t + '" is declared and not documented — an undocumented message is one nobody can change safely');
  }
  const documented = Object.keys(bridge.HANDLERS);
  assert.deepEqual(documented.slice().sort(), TYPES.slice().sort(),
    'a handler documented that is not declared, or the reverse');
});

test('every type survives the trip in both directions', () => {
  for (const t of TYPES) {
    const fromPage = bridge.parseFromGame(JSON.stringify({ type: t, body: { note: 'hello' } }));
    assert.ok(fromPage, 'the page sent "' + t + '" and the bridge dropped it');
    assert.equal(fromPage.type, t);
    assert.deepEqual(fromPage.body, { note: 'hello' }, 'the body is carried, not reinterpreted');
  }
});

test('an unknown type is refused rather than passed through', () => {
  assert.equal(bridge.parseFromGame('{"type":"nope"}'), null);
  assert.equal(bridge.parseFromGame('{"type":123}'), null);
  assert.equal(bridge.parseFromGame('{"type":""}'), null);
});

test('nonsense from the page is refused, in every shape it can arrive', () => {
  const junk = [
    null, undefined, '', '   ', 'x', '{}', '[]', '[1,2,3]',
    '{"type":"save"',                 /* truncated: what a killed bridge looks like */
    'null', '42', '"save"',           /* valid JSON, wrong kind of thing */
  ];
  for (const j of junk) {
    assert.equal(bridge.parseFromGame(j), null, 'the bridge accepted ' + JSON.stringify(j));
  }
});

test('a body is optional, but it is never a number, a string or an array', () => {
  /* The bug this test is named after: `{"type":"save","body":123}` was coerced
     to `{}` — a message that means something else, quietly turned into "save
     nothing". Either a message means what it says or it is refused. */
  assert.deepEqual(bridge.parseFromGame('{"type":"save"}').body, {}, 'no body is a body of nothing, fine');
  assert.deepEqual(bridge.parseFromGame('{"type":"save","body":null}').body, {});
  for (const bad of [123, 'text', [1, 2], true]) {
    const msg = JSON.stringify({ type: 'save', body: bad });
    assert.equal(bridge.parseFromGame(msg), null, 'the bridge coerced a body of ' + JSON.stringify(bad) + ' to {}');
  }
});

test('an empty body object is accepted — the difference between absent and empty', () => {
  assert.deepEqual(bridge.parseFromGame('{"type":"ready","body":{}}').body, {});
});

test('nested bodies arrive whole', () => {
  const body = { slot: 'auto', state: { turn: 7, biz: [{ id: 'b1', name: 'Market stall' }] }, sealed: true };
  const msg = bridge.parseFromGame(JSON.stringify({ type: 'save', body }));
  assert.deepEqual(msg.body, body, 'a body with structure is not flattened on the way across');
});

test('a refusal is null, not undefined and not a throw', () => {
  /* The WebView's side calls this on every message it receives, including ones
     from a page version it does not know. `undefined` and a thrown error are
     both worse than `null`: one is falsy in a way that hides a bug, the other
     takes down the handler that was only trying to be polite. */
  assert.strictEqual(bridge.parseFromGame('nonsense'), null);
  assert.doesNotThrow(() => bridge.parseFromGame(Symbol ? 'ok' : 'ok'));
});

test('the page and the app agree on the type list, name for name', () => {
  /* The half that runs in the WebView is generated into the game's asset; if the
     two lists ever drift, one side starts sending messages the other refuses.
     Read from the app's side and compare to what the bridge module publishes. */
  const src = require('fs').readFileSync(
    path.join(__dirname, '..', '..', 'apps', 'mobile', 'src', 'bridge.js'), 'utf8');
  for (const t of TYPES) {
    assert.ok(src.includes("'" + t + "'") || src.includes('"' + t + '"'),
      'type "' + t + '" is not in the bridge source where the WebView half is generated from');
  }
});
