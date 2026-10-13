/* =========================================================================
   What comes back (VISUAL.md, M6)
   ========================================================================= */
/* LEDGER's consequences arrive late: the father you could not pay for, the
   loan that falls due, the deal that resolves in two years. Until now they
   were a list. Here they are on their way to you - people walking up the road
   to your door, nearer the sooner they land, carrying a letter for news you
   will not like and money for news you will - and on the quarter they land,
   at your gate. The road ahead is the same thing as a strip of quarters, on
   the card that lists them. All of it reads comingBack(): nothing new is
   scheduled, nothing is invented. */
const ROAD_QUARTERS = 8;
/* what someone coming carries, and the colour of the news */
function arrivalTone(kind){ return kind === 'good' ? 'var(--good)' : kind === 'bad' ? 'var(--bad)' : 'var(--acc)'; }
/* the people on their way, as a layer the scene's own kit draws: the nearer
   the quarter, the nearer the door */
function arrivalsLayer(items){
  return function(k){
    const gy = k.groundY, person = k.person, shade = k.shade, dayK = k.dayK, out = [];
    const soon = items.slice(0, 3);
    if (!soon.length) return '';
    out.push('<path d="M-10 ' + (gy + 112) + ' Q50 ' + (gy + 104) + ' 104 ' + (gy + 92) + '" stroke="#000" stroke-opacity=".14" stroke-width="10" fill="none" stroke-linecap="round"/>');
    soon.forEach(function(it, i){
      const q = Math.max(0, it.turn - S.turn);
      const x = 96 - Math.min(q, ROAD_QUARTERS - 1) * 12 - i * 6, y = gy + 104 - Math.min(q, ROAD_QUARTERS - 1) * 1.4 + i * 4;
      const s = 1.2 - Math.min(q, ROAD_QUARTERS - 1) * .05;
      const coat = it.kind === 'good' ? '#2fae6a' : it.kind === 'bad' ? '#3b3f46' : '#6f56b3';
      out.push(person(x, y, {shirt: coat, cap: it.kind === 'bad' ? '#2e3238' : null, skin: ['#5a3b27', '#4a3020', '#7d573b'][i % 3], scale: s}));
      /* what they carry, and above them the colour of the news */
      const hx = x + 8 * s, hy = y - 22 * s;
      out.push(it.kind === 'good'
        ? '<rect x="' + hx.toFixed(1) + '" y="' + hy.toFixed(1) + '" width="' + (8 * s).toFixed(1) + '" height="' + (4.5 * s).toFixed(1) + '" fill="' + shade('#2e8b57', dayK) + '" stroke="#fff" stroke-opacity=".4" stroke-width=".4"/>'
        : '<rect x="' + hx.toFixed(1) + '" y="' + (hy - 2).toFixed(1) + '" width="' + (6 * s).toFixed(1) + '" height="' + (8 * s).toFixed(1) + '" fill="' + shade('#f4f1e6', dayK) + '"/><circle cx="' + (hx + 4.5 * s).toFixed(1) + '" cy="' + (hy + 4.5 * s).toFixed(1) + '" r="' + (1.2 * s).toFixed(1) + '" fill="#b22222"/>');
      out.push('<circle cx="' + x.toFixed(1) + '" cy="' + (y - 58 * s).toFixed(1) + '" r="' + (4 * s).toFixed(1) + '" fill="' + (it.kind === 'good' ? '#2fd47a' : it.kind === 'bad' ? '#ff5f6d' : '#f5b301') + '" stroke="#0b1017" stroke-width="1"/>');
    });
    return out.join('');
  };
}
/* the road ahead, for the card: this quarter to eight from now, and each thing
   coming back at its quarter */
/* tap: each marker is a control that opens what is coming (the card inside
   one shows the road without them) */
function roadAheadSVG(items, tap){
  const W = 390, H = 74, x0 = 22, x1 = 368, step = (x1 - x0) / ROAD_QUARTERS, at = {};
  let s = '<svg class="gfx road" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(items.length + ' thing' + (items.length === 1 ? '' : 's') + ' coming back to you over the next ' + ROAD_QUARTERS + ' quarters') + '">' +
    '<text x="' + x0 + '" y="12" font-family="sans-serif" font-size="10" font-weight="700" letter-spacing=".08em" fill="#8b9bb0">COMING BACK TO YOU</text>';
  s += '<path d="M' + x0 + ' 44 H' + x1 + '" stroke="rgba(255,255,255,.18)" stroke-width="6" stroke-linecap="round"/>';
  for (let q = 0; q <= ROAD_QUARTERS; q++) {
    const x = x0 + q * step;
    s += '<path d="M' + x.toFixed(1) + ' 39 v10" stroke="rgba(255,255,255,.3)" stroke-width="1.4"/>';
    if (q === 0 || q === 4 || q === ROAD_QUARTERS) s += '<text x="' + x.toFixed(1) + '" y="66" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#8b9bb0">' + (q === 0 ? 'now' : '+' + q + 'q') + '</text>';
  }
  s += '<circle cx="' + x0 + '" cy="44" r="6" fill="#f5b301"/>';   // you are here
  items.forEach(function(it, i){
    const q = Math.max(0, Math.min(ROAD_QUARTERS, it.turn - S.turn)), n = at[q] = (at[q] || 0) + 1;
    if (n > 3) return;
    const x = x0 + q * step, y = 32 - (n - 1) * 11;
    s += '<g' + (tap ? ' class="hot" data-a="hot" data-k="coming" data-c="' + i + '" role="button" tabindex="0" aria-label="' + esc(dateLabel(it.turn) + ': ' + it.title) + '"' : '') + '><title>' + esc(dateLabel(it.turn) + ': ' + it.title) + '</title>' +
      (tap ? '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="12" fill="#fff" fill-opacity="0"/>' : '') +
      '<path d="M' + x.toFixed(1) + ' ' + (y + 6) + ' V40" stroke="' + arrivalTone(it.kind) + '" stroke-width="1.4" opacity=".7"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="6.5" fill="#0b1017" stroke="' + arrivalTone(it.kind) + '" stroke-width="2"/>' +
      (it.kind === 'good' ? '<path d="M' + (x - 3).toFixed(1) + ' ' + (y + 1) + 'l2 2 l4 -5" stroke="' + arrivalTone(it.kind) + '" stroke-width="1.6" fill="none"/>'
        : '<rect x="' + (x - 3).toFixed(1) + '" y="' + (y - 2.5) + '" width="6" height="5" fill="none" stroke="' + arrivalTone(it.kind) + '" stroke-width="1.2"/>') + '</g>';
  });
  return s + '</svg>';
}
/* the moment they arrive: at your gate, with what they carry, and you */
function arrivalHTML(items){
  if (!items || !items.length) return '';
  const home = homeLook();
  const layer = function(k){
    const gy = k.groundY, person = k.person, out = [];
    out.push(person(214, gy + 110, {shirt: S.p && S.p.job ? '#ece7dc' : '#3c79c4', legs: '#20242c', tie: !!(S.p && S.p.job), scale: 2.2}));
    items.slice(0, 3).forEach(function(it, i){
      const x = 120 - i * 46, y = gy + 112 - i * 2;
      out.push(person(x, y, {shirt: it.kind === 'good' ? '#2fae6a' : it.kind === 'bad' ? '#3b3f46' : '#6f56b3', cap: it.kind === 'bad' ? '#2e3238' : null, skin: ['#5a3b27', '#4a3020', '#7d573b'][i % 3], scale: 2.05}));
      const hx = x + 16, hy = y - 46;
      out.push(it.kind === 'good'
        ? '<g transform="translate(' + hx + ' ' + hy + ') rotate(-8)">' + [0, 1, 2].map(function(j){ return '<rect x="' + (j * 2) + '" y="' + (-j * 3) + '" width="20" height="10" rx="1" fill="' + ['#2e8b57', '#c05a7a', '#3b6ea8'][j] + '" stroke="#fff" stroke-opacity=".35"/>'; }).join('') + '</g>'
        : '<g transform="translate(' + hx + ' ' + (hy - 8) + ') rotate(6)"><rect width="16" height="20" fill="#f4f1e6" stroke="#999" stroke-width=".5"/><path d="M3 5h10M3 8h9M3 11h10" stroke="#888" stroke-width=".7"/><circle cx="12" cy="16" r="2.2" fill="#b22222"/></g>');
    });
    return out.join('');
  };
  return '<div class="moment">' + homeSceneSVG(Object.assign({}, home, {alone: true, extra: layer, label: 'At your gate: ' + items.map(function(i){ return i.title; }).join('; ')}), 250) + '</div>';
}
