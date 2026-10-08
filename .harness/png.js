/* A small PNG reader, so a gate can ask what an icon *looks like* rather than
   what it is called.

   The web icons, the launcher icons and the splash screens are the same drawing
   at different sizes. Filenames and dimensions cannot prove that - an app once
   shipped with the template's blue cross on a white plate, at all the right
   sizes, in every density folder. Pixels can, so this decodes them.

   Scope: what a browser and `@capacitor/assets` write - 8-bit, non-interlaced,
   RGB / RGBA / grey / grey+alpha. Anything else throws rather than guessing.
   No dependencies: `zlib` is Node's own.
 */
const zlib = require('zlib');

const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

function decode(buf) {
  if (buf.length < 8 || buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('not a PNG');
  }
  let at = 8;
  let ihdr = null;
  const idat = [];
  while (at + 8 <= buf.length) {
    const len = buf.readUInt32BE(at);
    const type = buf.slice(at + 4, at + 8).toString('latin1');
    const body = buf.slice(at + 8, at + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        width: body.readUInt32BE(0), height: body.readUInt32BE(4),
        depth: body[8], color: body[9], interlace: body[12],
      };
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    at += 12 + len;
  }
  if (!ihdr) throw new Error('no IHDR');
  if (ihdr.depth !== 8) throw new Error('only 8-bit PNGs are read (this one is ' + ihdr.depth + '-bit)');
  if (ihdr.interlace !== 0) throw new Error('interlaced PNGs are not read');
  const ch = CHANNELS[ihdr.color];
  if (!ch) throw new Error('unsupported colour type ' + ihdr.color);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = ihdr.width * ch;
  const out = Buffer.alloc(ihdr.height * stride);
  let p = 0;
  for (let y = 0; y < ihdr.height; y++) {
    const filter = raw[p++];
    const line = raw.slice(p, p + stride); p += stride;
    const prev = y ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.slice(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      } else if (filter !== 0) throw new Error('bad filter type ' + filter);
      cur[i] = v & 255;
    }
  }

  /* one shape out: RGBA, whatever went in */
  const px = Buffer.alloc(ihdr.width * ihdr.height * 4);
  for (let i = 0, n = ihdr.width * ihdr.height; i < n; i++) {
    const s = i * ch, d = i * 4;
    if (ch === 1) { px[d] = px[d + 1] = px[d + 2] = out[s]; px[d + 3] = 255; }
    else if (ch === 2) { px[d] = px[d + 1] = px[d + 2] = out[s]; px[d + 3] = out[s + 1]; }
    else if (ch === 3) { px[d] = out[s]; px[d + 1] = out[s + 1]; px[d + 2] = out[s + 2]; px[d + 3] = 255; }
    else { px[d] = out[s]; px[d + 1] = out[s + 1]; px[d + 2] = out[s + 2]; px[d + 3] = out[s + 3]; }
  }
  return { width: ihdr.width, height: ihdr.height, data: px };
}

/* What an icon looks like, small enough to compare and coarse enough to survive
   being drawn at a different size: an N×N grid of average colours, with the
   average alpha of each cell beside it. */
function signature(buf, n = 8) {
  const img = decode(buf);
  const grid = [];
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      const x0 = Math.floor(gx * img.width / n), x1 = Math.max(x0 + 1, Math.floor((gx + 1) * img.width / n));
      const y0 = Math.floor(gy * img.height / n), y1 = Math.max(y0 + 1, Math.floor((gy + 1) * img.height / n));
      let r = 0, g = 0, b = 0, a = 0, c = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const i = (y * img.width + x) * 4;
        r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; a += img.data[i + 3]; c++;
      }
      grid.push([Math.round(r / c), Math.round(g / c), Math.round(b / c), Math.round(a / c)]);
    }
  }
  return { grid, n, width: img.width, height: img.height };
}

/* How far apart two icons are: the mean per-channel difference over the grid,
   counting only cells that are actually drawn (alpha above "a smudge of
   nothing"), and the share of the picture that is drawn at all. */
function distance(a, b) {
  let sum = 0, cells = 0;
  for (let i = 0; i < a.grid.length; i++) {
    const A = a.grid[i], B = b.grid[i];
    if (A[3] < 16 || B[3] < 16) continue;
    sum += (Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2])) / 3;
    cells++;
  }
  return cells ? sum / cells : Infinity;
}
function coverage(sig) {
  return sig.grid.filter((c) => c[3] > 16).length / sig.grid.length;
}
const hex = (rgb) => '#' + rgb.slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

module.exports = { decode, signature, distance, coverage, hex };
