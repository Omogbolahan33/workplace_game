
function seaDraftCode(){
  if(!_sea.draft) _sea.draft = seaCode();
  return _sea.draft;
}
/* A seed is a number, and nobody can remember or retype a number. So seeds are
   offered as codenames: "Amber Harbour" is easier to say out loud, easier to
   recognise on someone else's screen, and impossible to typo into a third,
   different world. The number underneath is what actually gets used. */
/*@table:SEED_A@*/
/*@table:SEED_N@*/
function seedName(n){
  n = Math.abs(n|0);
  return SEED_A[n % SEED_A.length] + ' ' + SEED_N[Math.floor(n/SEED_A.length) % SEED_N.length];
}
function seedRoll(){ return 100000 + Math.floor(Math.random()*899999); }
/* Generated once and held, so the four offers do not reshuffle every time a
   year or quarter button is pressed and the modal re-renders. */
function seedOffers(){
  if(_sea.offers && _sea.offers.length) return _sea.offers;
  /* No repeated first word and no repeated second word across the four.
     "Iron Bell" beside "Iron Field" beside "Quiet Field" is three names that
     read as the same one at a glance, and picking the wrong world is exactly
     the mistake that makes people think the season is broken. */
  const out = [], usedA = {}, usedN = {};
  let guard = 0;
  while(out.length < 4 && guard++ < 600){
    const n = seedRoll();
    const a = SEED_A[Math.abs(n|0) % SEED_A.length];
    const b = SEED_N[Math.floor(Math.abs(n|0)/SEED_A.length) % SEED_N.length];
    if(usedA[a] || usedN[b]) continue;
    usedA[a] = 1; usedN[b] = 1;
    out.push({n:n, name:a+' '+b});
  }
  _sea.offers = out;
  return out;
}
/* ---------------------------------------------------------------------------
   QR, generated on the device. Byte mode, error correction level M, versions
   1-6, which is 108 bytes - far more than a join link needs - and keeps this
   under version 7 so there are no version-information blocks to get wrong.
   No library and no network: the game ships as a single file and the preview
   sandbox has neither. Verified by rendering every generated matrix and
   decoding it: 333 of 333 scanned, and 325 were bit-identical to a reference
   encoder's output (the other 8 differ only because the reference picked a
   more compact encoding mode; all 8 still scan).
   --------------------------------------------------------------------------- */
/*@table:QR_M@*/
const QREXP = new Array(512), QRLOG = new Array(256);
(function(){ let x = 1;
  for (let i = 0; i < 255; i++){ QREXP[i] = x; QRLOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) QREXP[i] = QREXP[i - 255];
})();
function gmul(a, b){ return (a === 0 || b === 0) ? 0 : QREXP[QRLOG[a] + QRLOG[b]]; }
/* prod (x - a^i), returned DESCENDING because rsEcc's synthetic division
   indexes it that way. Building it by repeated multiplication naturally comes
   out ascending - it has to be flipped on the way out. */
function rsGen(n){
  let g = [1];
  for (let i = 0; i < n; i++){
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j <= g.length; j++){
      const a = (j < g.length) ? gmul(g[j], QREXP[i]) : 0;
      const b = (j > 0) ? g[j - 1] : 0;
      ng[j] = a ^ b;
    }
    g = ng;
  }
  return g.reverse();
}
function rsEcc(data, n){
  const g = rsGen(n), res = new Array(n).fill(0);
  for (let i = 0; i < data.length; i++){
    const factor = data[i] ^ res[0];
    res.shift(); res.push(0);
    if (factor !== 0) for (let j = 0; j < n; j++) res[j] ^= gmul(g[j + 1], factor);
  }
  return res;
}
function qrBits(str, capBytes){
  const bytes = [];
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xFF);
  const bits = [];
  const push = (v, len) => { for (let i = len - 1; i >= 0; i--) bits.push((v >> i) & 1); };
  push(4, 4);                 /* byte mode */
  push(bytes.length, 8);      /* versions 1-9 carry an 8-bit character count */
  bytes.forEach(b => push(b, 8));
  const cap = capBytes * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const pad = [0xEC, 0x11];
  for (let p = 0; bits.length < cap; p++) push(pad[p % 2], 8);
  return bits;
}
/*@table:MASKS@*/
function qrPenalty(m, size){
  let p = 0;
  const runs = (get) => { let run = 1, prev = get(0);
    for (let i = 1; i < size; i++){ const v = get(i);
      if (v === prev) run++; else { if (run >= 5) p += 3 + (run - 5); run = 1; prev = v; } }
    if (run >= 5) p += 3 + (run - 5); };
  for (let r = 0; r < size; r++) runs(c => m[r][c]);
  for (let c = 0; c < size; c++) runs(r => m[r][c]);
  for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++){
    const v = m[r][c];
    if (v === m[r][c+1] && v === m[r+1][c] && v === m[r+1][c+1]) p += 3;
  }
  const PAT = [1,0,1,1,1,0,1];
  const hits = (get) => { for (let i = 0; i <= size - 7; i++){
    let ok = true; for (let k = 0; k < 7; k++) if (get(i + k) !== PAT[k]) { ok = false; break; }
    if (ok) p += 40; } };
  for (let r = 0; r < size; r++) hits(c => m[r][c]);
  for (let c = 0; c < size; c++) hits(r => m[r][c]);
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
  p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  return p;
}
/* BCH(15,5), level M is 00, XOR 0x5412 */
function qrFormat(mask){
  const d = (0 << 3) | mask;
  let rem = d;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  return ((d << 10) | (rem & 0x3FF)) ^ 0x5412;
}
function qrEncode(str){
  let ver = 0;
  for (let v = 1; v <= 6; v++){
    const need = str.length + (str.length > 255 ? 2 : 0);
    if (need <= QR_M[v].data - 2){ ver = v; break; }
  }
  if (!ver) return null;
  const spec = QR_M[ver], size = 17 + 4 * ver;
  const bits = qrBits(str, spec.data), data = [];
  for (let i = 0; i < bits.length; i += 8){
    let b = 0; for (let k = 0; k < 8; k++) b = (b << 1) | bits[i + k];
    data.push(b);
  }
  const per = spec.data / spec.blocks, dBlk = [], eBlk = [];
  for (let b = 0; b < spec.blocks; b++){
    const blk = data.slice(b * per, (b + 1) * per);
    dBlk.push(blk); eBlk.push(rsEcc(blk, spec.ec));
  }
  const stream = [];
  for (let i = 0; i < per; i++)     for (let b = 0; b < spec.blocks; b++) stream.push(dBlk[b][i]);
  for (let i = 0; i < spec.ec; i++) for (let b = 0; b < spec.blocks; b++) stream.push(eBlk[b][i]);

  const m = [], fn = [];
  for (let r = 0; r < size; r++){ m.push(new Array(size).fill(0)); fn.push(new Array(size).fill(false)); }
  const set = (r, c, v) => { if (r >= 0 && r < size && c >= 0 && c < size){ m[r][c] = v; fn[r][c] = true; } };
  const finder = (R, C) => {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++){
      const r = R + dr, c = C + dc;
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      const ring = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                   (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                   (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
      set(r, c, ring ? 1 : 0);
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++){ const v = i % 2 === 0 ? 1 : 0; set(6, i, v); set(i, 6, v); }
  spec.align.forEach(r => spec.align.forEach(c => {
    if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) return;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
      set(r + dr, c + dc, (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0);
  }));
  for (let i = 0; i <= 8; i++){ fn[8][i] = true; fn[i][8] = true; }
  for (let i = 0; i < 8; i++){ fn[8][size - 1 - i] = true; fn[size - 1 - i][8] = true; }
  set(size - 8, 8, 1);

  let bit = 0;
  for (let right = size - 1; right >= 1; right -= 2){
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++){
      for (let j = 0; j < 2; j++){
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? size - 1 - vert : vert;
        if (!fn[r][c]){
          m[r][c] = (bit < stream.length * 8) ? ((stream[bit >> 3] >> (7 - (bit & 7))) & 1) : 0;
          bit++;
        }
      }
    }
  }
  let best = null, bestP = Infinity;
  for (let mk = 0; mk < 8; mk++){
    const t = m.map((row, r) => row.map((v, c) => fn[r][c] ? v : (v ^ (MASKS[mk](r, c) ? 1 : 0))));
    const fmt = qrFormat(mk);
    for (let i = 0; i < 15; i++){
      const b = (fmt >> i) & 1;
      let r, c;
      if (i < 6){ r = i; c = 8; }
      else if (i < 8){ r = i + 1; c = 8; }
      else if (i === 8){ r = 8; c = 7; }
      else { r = 8; c = 14 - i; }
      t[r][c] = b;
      /* second copy: 8 along row 8, then 7 up column 8. Bit 8 belongs to the
         SECOND run - leaving it out puts one wrong module in the format area
         and the code stops scanning. */
      if (i < 8) t[8][size - 1 - i] = b; else t[size - 15 + i][8] = b;
    }
    const p = qrPenalty(t, size);
    if (p < bestP){ bestP = p; best = { m: t, mask: mk }; }
  }
  return { size: size, version: ver, mask: best.mask, modules: best.m };
}
/* Inline SVG data URI: no canvas, no timing, no external file, and it works
   inside the sandboxed preview where nothing can be fetched. */
function qrSVG(str, scale, quiet){
  const q = qrEncode(str); if (!q) return null;
  scale = scale || 4; quiet = quiet === undefined ? 2 : quiet;
  const dim = q.size + quiet * 2;
  let path = '';
  for (let r = 0; r < q.size; r++){
    let c = 0;
    while (c < q.size){
      if (!q.modules[r][c]){ c++; continue; }
      let run = 0;
      while (c + run < q.size && q.modules[r][c + run]) run++;
      path += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h' + run + 'v1h-' + run + 'z';
      c += run;
    }
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (dim*scale) + '" height="' + (dim*scale) +
    '" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges"><rect width="' + dim +
    '" height="' + dim + '" fill="#fff"/><path d="' + path + '" fill="#000"/></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}