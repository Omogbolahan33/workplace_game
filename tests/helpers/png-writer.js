/* A PNG *writer*, for the tests that read PNGs.

   `.harness/png.js` decodes pictures, and a decoder tested only against the
   pictures that happen to be in the repository is tested against one encoder's
   output. This writes them: IHDR, one IDAT of filter-0 rows, IEND, with real
   CRCs. It is the smallest thing that can produce a PNG whose pixels a test
   already knows — so `decode()` can be asked what colour the middle of it is and
   be told the truth.

   Not a general encoder: 8-bit RGB/RGBA/grayscale, no interlacing, no filtering.
 */
const zlib = require('zlib');

const TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, body) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
  const t = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, body])));
  return Buffer.concat([len, t, body, crc]);
};

/* `fill` is called with (x, y) and returns [r,g,b] or [r,g,b,a] */
function png(width, height, fill, { alpha = false } = {}) {
  const ch = alpha ? 4 : 3;
  const rows = Buffer.alloc(height * (1 + width * ch));
  for (let y = 0; y < height; y++) {
    const rowAt = y * (1 + width * ch);
    rows[rowAt] = 0;                                  /* filter: none */
    for (let x = 0; x < width; x++) {
      const px = fill(x, y);
      const at = rowAt + 1 + x * ch;
      rows[at] = px[0]; rows[at + 1] = px[1]; rows[at + 2] = px[2];
      if (alpha) rows[at + 3] = px[3] === undefined ? 255 : px[3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;                                        /* bit depth */
  ihdr[9] = alpha ? 6 : 2;                            /* colour type */
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* the two pictures every face test wants: a flat colour, and a plate with a mark
   in the middle of it */
const flat = (w, h, colour) => png(w, h, () => colour);
const plate = (w, h, background, mark, inset = 0.25) => png(w, h, (x, y) => {
  const a = w * inset, b = w * (1 - inset);
  return x >= a && x < b && y >= a && y < b ? mark : background;
});

module.exports = { png, flat, plate, crc32 };
