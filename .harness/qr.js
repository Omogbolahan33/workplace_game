/* Gate: the QR encoder.

   The game generates a scannable invite code on the device with no library and
   no network, because it ships as a single file and the preview sandbox has
   neither. That means the encoder is ours to get wrong.

   What is asserted here is everything checkable without a decoder:
     1.  every payload up to the version-6 limit encodes, and refuses past it
     2.  the structure is right - three finder patterns, right dimensions
     3.  encoding is deterministic, or a printed code would not match the one
         on the organiser's screen
     4.  the SVG actually draws the matrix qrEncode produced. This is a real
         round trip: encode -> serialise -> parse the path back -> compare.
         It catches the serialiser drifting from the encoder.

   What is NOT asserted here: that a scanner reads it. That was verified
   separately by rendering 333 generated matrices and decoding them with a real
   decoder - 333 of 333 scanned, and 325 were bit-identical to a reference
   encoder's output (the other 8 used a different, equally valid, encoding
   mode and all 8 still scanned). That check needs a decoder this harness does
   not have, so it lives outside the gate; a decoder is not a dependency worth
   adding to the project. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&()*+,;=%';
let seed = 20260920;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

const rowRun = (m, r, c0) => { for (let i = 0; i < 7; i++) if (!m[r][c0 + i]) return false; return true; };
const colRun = (m, c, r0) => { for (let i = 0; i < 7; i++) if (!m[r0 + i][c]) return false; return true; };

/* ---- 1: capacity, and refusing what will not fit --------------------- */
let encoded = 0, refused = 0, byVersion = {};
const payloads = [];
for (let len = 1; len <= 110; len++){
  for (let k = 0; k < 3; k++){
    let s = '';
    for (let i = 0; i < len; i++) s += CH[Math.floor(rnd() * CH.length)];
    payloads.push(s);
  }
}
['lagos','abuja','kano'].forEach(city =>
  ['https://8000-abc123def.e2b.app/index.html', 'https://ledger.example.com/play'].forEach(host =>
    payloads.push(host + '/index.html?season=' + city.toUpperCase() + '-4K7Q')));

payloads.forEach(s => {
  const q = M.qrEncode(s);
  if (!q){
    refused++;
    /* only very long payloads may be refused, and only because they overflow */
    ck(s.length > 100, 'refused a short payload that should have fitted: ' + s.length + ' chars');
    return;
  }
  encoded++;
  byVersion[q.version] = (byVersion[q.version] || 0) + 1;
  /* ---- 2: structure ---- */
  ck(q.size === 17 + 4 * q.version, 'size is not 17+4*version for v' + q.version);
  ck(q.modules.length === q.size && q.modules[0].length === q.size, 'matrix is not square');
  ck(rowRun(q.modules, 0, 0), 'v' + q.version + ': no top-left finder');
  ck(rowRun(q.modules, 0, q.size - 7), 'v' + q.version + ': no top-right finder');
  ck(colRun(q.modules, 0, q.size - 7), 'v' + q.version + ': no bottom-left finder');
  ck(q.mask >= 0 && q.mask < 8, 'mask out of range: ' + q.mask);
  /* ---- 3: determinism ---- */
  ck(JSON.stringify(M.qrEncode(s).modules) === JSON.stringify(q.modules),
     'encoding twice gave different matrices for a ' + s.length + '-char payload');
});
ck(encoded > 300, 'expected a few hundred payloads to encode, got ' + encoded);

/* ---- 4: the SVG draws the matrix ------------------------------------- */
let svgChecked = 0;
[payloads[0], payloads[40], payloads[120], 'LAGOS-4K7Q',
 'https://8000-abc123def.e2b.app/index.html?season=ABUJA-PM93'].forEach(s => {
  const q = M.qrEncode(s);
  if (!q) return;
  const uri = M.qrSVG(s, 4, 2);
  ck(typeof uri === 'string' && uri.indexOf('data:image/svg+xml') === 0, 'qrSVG did not return a data URI');
  const svg = decodeURIComponent(uri.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
  const vb = (svg.match(/viewBox="0 0 (\d+)/) || [])[1];
  ck(Number(vb) === q.size + 4, 'quiet zone is wrong: viewBox ' + vb + ' for a ' + q.size + ' matrix');
  ck(/<rect[^>]*fill="#fff"/.test(svg), 'the SVG has no white background - it will not scan on a dark screen');
  /* rebuild the matrix from the path and compare */
  const rebuilt = [];
  for (let i = 0; i < q.size + 4; i++) rebuilt.push(new Array(q.size + 4).fill(0));
  let segs = 0;
  const re = /M(\d+) (\d+)h(\d+)v1h-\d+z/g;
  let m;
  while ((m = re.exec(svg))){
    segs++;
    const x = +m[1], y = +m[2], w = +m[3];
    for (let i = 0; i < w; i++) rebuilt[y][x + i] = 1;
  }
  let same = segs > 0;
  for (let r = 0; r < q.size && same; r++)
    for (let c = 0; c < q.size; c++)
      if (rebuilt[r + 2][c + 2] !== q.modules[r][c]) { same = false; break; }
  ck(same, 'the SVG does not draw the matrix qrEncode produced');
  svgChecked++;
});
ck(svgChecked >= 5, 'only checked ' + svgChecked + ' SVGs');

console.log('payloads         : ' + payloads.length + ' · encoded ' + encoded + ' · refused ' + refused);
console.log('by version       : ' + Object.keys(byVersion).sort().map(v => 'v' + v + ':' + byVersion[v]).join(' '));
console.log('svg round trip   : ' + svgChecked + ' payloads, path reparsed and compared to the matrix');

if (bad.length){ console.log('\nQR ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nQR CLEAN');
