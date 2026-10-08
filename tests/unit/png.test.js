/* The PNG reader, against pictures whose pixels this test already knows.

   `.harness/png.js` is what lets the two app gates say "this icon is the game's
   mark" instead of "this icon is 192 by 192". That claim is only worth anything
   if the reader reads correctly, so it is tested here against bytes written by
   `tests/helpers/png-writer.js` — a different implementation, on purpose.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const png = require(path.join(__dirname, '..', '..', '.harness', 'png.js'));
const { png: write, flat, plate } = require('../helpers/png-writer.js');

test('a flat picture decodes to the colour it was written with', () => {
  const buf = flat(16, 16, [0xf5, 0xb3, 0x01]);
  const img = png.decode(buf);
  assert.equal(img.width, 16);
  assert.equal(img.height, 16);
  assert.equal(img.data.length, 16 * 16 * 4, 'every pixel comes out RGBA');
  for (let i = 0; i < img.data.length; i += 4) {
    assert.deepEqual([img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]], [0xf5, 0xb3, 0x01, 255]);
  }
});

test('the mark in the middle of a plate lands in the middle of the grid', () => {
  /* white plate, dark mark in the middle quarter */
  const buf = plate(64, 64, [255, 255, 255], [8, 11, 16], 0.375);
  const sig = png.signature(buf, 8);
  assert.equal(png.hex(sig.grid[0]), '#ffffff', 'the top-left cell is the plate');
  assert.equal(png.hex(sig.grid[8 * 3 + 3]), '#080b10', 'the middle cell is the mark');
  assert.equal(png.hex(sig.grid[8 * 6 + 6]), '#ffffff', 'the bottom-right cell is the plate again');
});

test('an alpha channel survives the decode', () => {
  const buf = write(8, 8, (x) => [0, 0, 0, x < 4 ? 0 : 255], { alpha: true });
  const img = png.decode(buf);
  const alphaAt = (x, y) => img.data[(y * img.width + x) * 4 + 3];
  assert.equal(alphaAt(0, 0), 0, 'the left half is transparent');
  assert.equal(alphaAt(3, 7), 0, 'still transparent at the edge, on the last row');
  assert.equal(alphaAt(4, 0), 255, 'the right half is opaque');
  /* and coverage counts only what is drawn */
  const sig = png.signature(buf, 8);
  assert.equal(png.coverage(sig), 0.5);
});

test('the same drawing at two sizes measures as the same drawing', () => {
  const a = png.signature(plate(64, 64, [8, 11, 16], [245, 179, 1], 0.25));
  const b = png.signature(plate(192, 192, [8, 11, 16], [245, 179, 1], 0.25));
  assert.ok(png.distance(a, b) < 4, 'resampling is not a difference: ' + png.distance(a, b).toFixed(2));
});

test('two different drawings measure far apart', () => {
  const ours = png.signature(plate(96, 96, [8, 11, 16], [245, 179, 1], 0.25));
  const theirs = png.signature(plate(96, 96, [255, 255, 255], [86, 160, 255], 0.25));
  const d = png.distance(ours, theirs);
  assert.ok(d > 100, 'a dark mark and a light one should be far apart, got ' + d.toFixed(1));
  assert.ok(png.distance(ours, ours) === 0, 'a picture is not different from itself');
});

test('a distance is measured over what is drawn, not over empty space', () => {
  /* a transparent canvas compared to a flat one: the cells that are not drawn
     are skipped rather than counted as a giant black difference */
  const empty = png.signature(write(32, 32, () => [0, 0, 0, 0], { alpha: true }));
  const solid = png.signature(flat(32, 32, [8, 11, 16]));
  assert.equal(png.coverage(empty), 0);
  assert.equal(png.distance(empty, solid), Infinity, 'nothing drawn is not "close to anything"');
});

test('bytes that are not a PNG are refused, not guessed at', () => {
  assert.throws(() => png.decode(Buffer.from('hello')), /not a PNG/);
  assert.throws(() => png.decode(Buffer.from('89504e470d0a1a0a', 'hex')), /IHDR|not a PNG/);
  /* a JPEG's magic number, the classic mix-up */
  assert.throws(() => png.decode(Buffer.from('ffd8ffe000104a46494600010100000100010000', 'hex')), /not a PNG/);
});

test('a picture truncated mid-stream throws instead of returning half of one', () => {
  const whole = flat(32, 32, [1, 2, 3]);
  const cut = whole.slice(0, Math.floor(whole.length * 0.6));
  assert.throws(() => png.decode(cut));
});
