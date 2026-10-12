/* =========================================================================
   Your home, drawn — the first of LEDGER's places (VISUAL.md, M1)
   ========================================================================= */
/* What your home looks like, read from the run. Nothing here is chosen at
   random: the house is what you spend on housing against what housing costs a
   single person in your city (so a family on the same rent lives tighter), the
   generator, solar and cars are the goods you bought, the people are your
   spouse, children and household staff, the light is the grid, the air is the
   season of the quarter, the skyline is the era, and the hour is the player's
   own clock. */
/* Each city is its own place (VISUAL.md, M10): its seasons quarter by quarter,
   its word for the lights going off, its roofs and windows, whether water sits
   on the roof, power poles or street lamps, the colour of its walls, and the
   landmark on its skyline. Lagos is the default the kit was drawn for. */
const CITY_SKINS = {
  lagos:  {seasons:['harmattan','rain','rain','dry'], outage:'NEPA has taken light', roof:'zinc', bars:true, tank:'gp', pole:true, paved:false, wall1:'#d8c9ab', wall2:'#e4d6b8', mark:'minaret'},
  abuja:  {seasons:['harmattan','rain','rain','dry'], outage:'NEPA has taken light', roof:'zinc', bars:true, tank:'gp', pole:true, paved:false, wall1:'#dccdb0', wall2:'#e8dcc4', mark:'aso'},
  accra:  {seasons:['harmattan','rain','rain','dry'], outage:'Dumsor', roof:'zinc', bars:true, tank:'poly', pole:true, paved:false, wall1:'#e2d2b6', wall2:'#ecdcc0', mark:'arch'},
  nairobi:{seasons:['dry','rain','cool','rain'], outage:'Stima imepotea', roof:'zinc', bars:true, tank:'poly', pole:true, paved:false, wall1:'#d2c6b0', wall2:'#ddd2bd', mark:'kicc'},
  ldn:    {seasons:['winter','spring','summer','autumn'], outage:'', roof:'slate', bars:false, tank:'', pole:false, paved:true, wall1:'#9c5a45', wall2:'#a8664c', mark:'shard'},
  nyc:    {seasons:['snow','spring','summer','autumn'], outage:'', roof:'slate', bars:false, tank:'wood', pole:false, paved:true, wall1:'#7a4f3a', wall2:'#8a5c44', mark:'empire'}
};
function skinOf(city){ return CITY_SKINS[city] || CITY_SKINS.lagos; }
const HOME_TIERS = [{max:1.8, name:'a room'}, {max:4.5, name:'a flat'}, {max:12, name:'a house in an estate'}, {max:Infinity, name:'a mansion'}];
function homeLook(){
  const p = S.p, c = CITY(), inf = S.cumInfl || 1;
  const base = 70000 * c.rentMult * 0.75 * inf;
  const r = ((S.fin.budget || {}).housing || 0) / Math.max(1, base);
  let tier = 1; while(tier < HOME_TIERS.length && r >= HOME_TIERS[tier - 1].max) tier++;
  const owned = function(id){ return (S.fin.goods || []).filter(function(g){ return g.id === id; }).length; };
  const hr = new Date().getHours();
  const q = ((S.turn || 0) % 4 + 4) % 4;
  return {tier: tier, ratio: Math.round(r * 100) / 100,
    gen: owned('gen') > 0, solar: owned('solar') > 0, car: Math.min(2, owned('car')),
    job: !!p.job, age: p.age, spouse: !!p.married, kids: p.kids || 0, kidAge: Math.max(0, Math.min(15, (S.turn || 0) / 8)),
    staff: (S.house || []).map(function(h){ return h.role; }),
    grid: S.mkt ? S.mkt.power : 50, era: S.era ? S.era.id : 'calm',
    city: S.city, season: skinOf(S.city).seasons[q],
    time: hr >= 6 && hr < 17 ? 'day' : hr >= 17 && hr < 19 ? 'dusk' : 'night',
    label: 'Your home: ' + HOME_TIERS[tier - 1].name + ' in ' + c.label};
}
/* The drawing kit every place is drawn with (VISUAL.md): one hand, so your
   home and your work look like the same city. It lays the backdrop at once -
   the sky for the hour, season and era, the city behind, the ground (laterite,
   or interlocking paving when st.ground is 'pave') - and returns the tools:
   box() for a building in three-quarter view (lit front, shaded side, cast
   shadow, weathered walls), win() and door() on its front, pole() for the
   power lines, car(), person(), and finish(), which lays the season's air and
   returns the picture. `vh` is the view's height; the extra is sky. */
let sceneDrawings = 0;
function sceneKit(st, vh, tag){
  const W = 390, H = 300, VH = Math.max(H, Math.round(vh || H)), TOP = H - VH;
  const u = (tag || 's') + (++sceneDrawings) + '-';
  const id = (n) => u + n, url = (n) => 'url(#' + u + n + ')';
  const night = st.time === 'night', dusk = st.time === 'dusk';
  const skin = skinOf(st.city);
  /* a city with no outages has no blackouts, whatever the grid reads */
  const blackout = st.grid < 40 && !!skin.outage, genOn = blackout && st.gen;
  const lights = (night || dusk) && (!blackout || genOn || st.solar);
  const out = [], add = (s) => out.push(s);
  let seed = st.seed || 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const f1 = (n) => (+n).toFixed(1);

  /* oblique three-quarter projection: x to the right, y up, z away from you */
  const K = 0.62, KY = 0.36;
  const P = (ox, oy) => (x, y, z) => [ox + x + z * K, oy - y - z * KY];
  const poly = (pts, fill, extra) => '<path d="M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z" fill="' + fill + '"' + (extra || '') + '/>';

  /* light */
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k)))); return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''); };
  const dayK = night ? 0.34 : dusk ? 0.7 : 1, sideK = night ? 0.26 : dusk ? 0.5 : 0.7;
  const warm = '#ffcf7a';

  /* ---- defs ---- */
  const skyC = night ? ['#060b1d', '#142049', '#2a2c4f'] : dusk ? ['#24346a', '#c8714c', '#f2b46e']
    : st.season === 'harmattan' ? ['#c9b48f', '#dcc6a0', '#e9d6b0'] : st.season === 'rain' ? ['#6f7d8c', '#9aa6b1', '#bcc3c7']
    : st.season === 'snow' ? ['#9aa3ad', '#c3c9cf', '#e4e7ea'] : /winter|autumn|cool/.test(st.season) ? ['#7d8794', '#a3abb5', '#c6cbd1'] : ['#5d9fd8', '#b8d6ea', '#efe3c6'];
  add('<defs>' +
    '<linearGradient id="' + id('sky') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skyC[0] + '"/><stop offset=".6" stop-color="' + skyC[1] + '"/><stop offset="1" stop-color="' + skyC[2] + '"/></linearGradient>' +
    '<linearGradient id="' + id('haze') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skyC[2] + '" stop-opacity="0"/><stop offset="1" stop-color="' + skyC[2] + '" stop-opacity="' + (st.season === 'harmattan' ? .85 : .55) + '"/></linearGradient>' +
    '<linearGradient id="' + id('ao') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>' +
    '<linearGradient id="' + id('streak') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1c" stop-opacity=".42"/><stop offset="1" stop-color="#3b2a1c" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + id('glassD') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (night ? '#1a2440' : '#a9cbe0') + '"/><stop offset=".5" stop-color="' + (night ? '#0f1730' : '#6b93b0') + '"/><stop offset="1" stop-color="' + (night ? '#141c34' : '#8db3cc') + '"/></linearGradient>' +
    '<linearGradient id="' + id('glassL') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a6"/><stop offset="1" stop-color="#f3a64a"/></linearGradient>' +
    '<radialGradient id="' + id('spill') + '"><stop offset="0" stop-color="' + warm + '" stop-opacity=".5"/><stop offset="1" stop-color="' + warm + '" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + id('sun') + '"><stop offset="0" stop-color="#fff8e0"/><stop offset=".25" stop-color="#fff1c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff1c4" stop-opacity="0"/></radialGradient>' +
    '<filter id="' + id('grime') + '" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".055 .5" numOctaves="3" seed="' + ((st.seed || 11) % 9 + 3) + '"/>' +
      '<feColorMatrix values="0 0 0 0 .22  0 0 0 0 .16  0 0 0 0 .1  0 0 0 -1.4 1.05"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
    '<filter id="' + id('grain') + '"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .4  0 0 0 .09 0"/></filter>' +
    '<filter id="' + id('soft') + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<filter id="' + id('blur1') + '"><feGaussianBlur stdDeviation="1.2"/></filter>' +
    '<pattern id="' + id('zinc') + '" width="4" height="40" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="4" height="40" fill="' + shade('#8a6447', dayK) + '"/><rect width="1.4" height="40" fill="#000" opacity=".22"/><rect x="2" width=".6" height="40" fill="#fff" opacity=".12"/></pattern>' +
    '<pattern id="' + id('slate') + '" width="10" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="10" height="6" fill="' + shade('#4b5058', dayK) + '"/><path d="M0 6h10M5 0v3M0 3h10M2 3v3" stroke="#000" stroke-opacity=".25" stroke-width=".6"/></pattern>' +
    '<pattern id="' + id('lat') + '" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="' + shade('#b26a42', dayK) + '"/>' +
      '<circle cx="12" cy="8" r="1.2" fill="#000" opacity=".12"/><circle cx="40" cy="20" r="1.6" fill="#000" opacity=".1"/><circle cx="52" cy="6" r=".9" fill="#fff" opacity=".12"/><path d="M0 24 q15 -3 30 0 t30 0" stroke="#000" stroke-opacity=".08" fill="none"/></pattern>' +
    '<pattern id="' + id('pave') + '" width="16" height="8" patternUnits="userSpaceOnUse" patternTransform="skewX(-50)"><rect width="16" height="8" fill="' + shade('#9c958a', dayK) + '"/><path d="M0 8h16M8 0v8" stroke="#000" stroke-opacity=".16"/></pattern>' +
  '</defs>');

  /* ---- sky and the city behind ---- */
  add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="' + url('sky') + '"/>');
  if (night) for (let i = 0; i < 46 + Math.round(-TOP / 6); i++) add('<circle cx="' + f1(rnd() * W) + '" cy="' + f1(TOP + rnd() * (100 - TOP)) + '" r="' + (rnd() * .8 + .25).toFixed(2) + '" fill="#fff" opacity="' + (rnd() * .6 + .25).toFixed(2) + '"/>');
  if (night) add('<circle cx="300" cy="40" r="11" fill="#f4efe0"/><circle cx="304" cy="37" r="10" fill="' + skyC[0] + '" opacity=".9"/>');
  else if (!/rain|winter|autumn|snow|cool/.test(st.season)) add('<circle cx="' + (dusk ? 310 : 70) + '" cy="' + (dusk ? 150 : 46) + '" r="' + (dusk ? 60 : 50) + '" fill="' + url('sun') + '" opacity="' + (st.season === 'harmattan' ? .55 : .95) + '"/>');
  if (/rain|winter|autumn|snow|cool/.test(st.season)) for (let i = 0; i < 4; i++) add('<ellipse cx="' + f1(40 + i * 100 + rnd() * 30) + '" cy="' + f1(30 + rnd() * 30) + '" rx="' + f1(60 + rnd() * 30) + '" ry="16" fill="' + (night ? '#1c2238' : '#7f8a96') + '" opacity=".7"/>');
  const far = night ? '#151c36' : dusk ? '#6a5876' : st.season === 'harmattan' ? '#b9a688' : '#93a7b9';
  let x = -6;
  while (x < W) {
    const w = 16 + rnd() * 30, tall = !!st.towers && rnd() > 0.55, h = tall ? 60 + rnd() * 70 : 14 + rnd() * 30, base = 178;
    add('<rect x="' + f1(x) + '" y="' + f1(base - h) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + far + '"/>');
    if (!tall && rnd() > 0.55) add('<rect x="' + f1(x + w * .25) + '" y="' + f1(base - h - 10) + '" width="8" height="8" rx="2" fill="' + far + '"/><rect x="' + f1(x + w * .25 + 3) + '" y="' + f1(base - h - 3) + '" width="2" height="3" fill="' + far + '"/>');
    if (!tall && skin.mark === 'minaret' && rnd() > 0.93) add('<rect x="' + f1(x + w / 2) + '" y="' + f1(base - h - 34) + '" width="3" height="34" fill="' + far + '"/><circle cx="' + f1(x + w / 2 + 1.5) + '" cy="' + f1(base - h - 36) + '" r="3" fill="' + far + '"/>');   // a minaret
    if ((night || dusk) && (!blackout || rnd() > .82)) for (let k = 0; k < (tall ? 6 : 2); k++) if (rnd() > .5) add('<rect x="' + f1(x + 2 + rnd() * (w - 5)) + '" y="' + f1(base - h + 4 + rnd() * (h - 8)) + '" width="2" height="2.6" fill="' + warm + '" opacity=".8"/>');
    x += w + 1 + rnd() * 5;
  }
  if (st.era === 'boom') add('<g stroke="' + far + '" stroke-width="1.6" fill="none"><path d="M330 178V64M330 68h-62M330 68l14 8M272 68v24"/><path d="M324 178l6 -10 6 10"/></g><rect x="268" y="92" width="8" height="6" fill="' + far + '"/>');
  /* the city's landmark, far off */
  const mk = {
    aso: '<path d="M-10 178 Q20 96 70 92 Q120 96 150 178Z" fill="' + far + '" opacity=".9"/><circle cx="250" cy="150" r="14" fill="' + far + '"/><rect x="236" y="150" width="28" height="28" fill="' + far + '"/><rect x="226" y="118" width="3" height="60" fill="' + far + '"/><rect x="271" y="118" width="3" height="60" fill="' + far + '"/>',
    arch: '<path d="M236 178 V120 H300 V178 H286 V138 H250 V178Z" fill="' + far + '"/><path d="M262 116 l6 -12 l6 12z" fill="' + far + '"/>',
    kicc: '<rect x="250" y="80" width="26" height="98" rx="4" fill="' + far + '"/><path d="M246 84 L263 62 L280 84Z" fill="' + far + '"/><path d="M-10 178 Q60 150 120 160 Q200 140 260 165 Q330 150 400 170 V178Z" fill="' + far + '" opacity=".6"/>',
    shard: '<path d="M262 178 L282 40 L302 178Z" fill="' + far + '"/><path d="M282 40 l-2 -10 l4 0z" fill="' + far + '"/>',
    empire: '<path d="M262 178 V100 H270 V80 H276 V62 H280 V40 L282 26 L284 40 V62 H288 V80 H294 V100 H302 V178Z" fill="' + far + '"/>'
  }[skin.mark];
  if (mk) add(mk);
  add('<rect y="110" width="' + W + '" height="74" fill="' + url('haze') + '"/>');

  /* ---- ground ---- */
  const groundY = 182;
  const paved = st.ground === 'pave' || skin.paved;
  add('<rect y="' + groundY + '" width="' + W + '" height="' + (H - groundY) + '" fill="' + (paved ? url('pave') : url('lat')) + '"/>');
  /* snow lies on the ground, under whoever stands on it */
  if (st.season === 'snow') add('<rect y="' + (groundY - 2) + '" width="' + W + '" height="' + (H - groundY + 2) + '" fill="#eef2f5" opacity=".55"/>');
  if (!paved) {
    add('<path d="M0 ' + (groundY + 40) + ' q120 -8 240 4 t160 -2" stroke="#000" stroke-opacity=".08" stroke-width="8" fill="none"/>');   // tyre ruts
    add('<ellipse cx="78" cy="268" rx="46" ry="7" fill="' + skyC[1] + '" opacity="' + (st.season === 'rain' ? .75 : .35) + '"/><ellipse cx="78" cy="268" rx="46" ry="7" fill="none" stroke="#000" stroke-opacity=".15"/>');
  }
  add('<rect y="' + groundY + '" width="' + W + '" height="14" fill="' + url('ao') + '" opacity=".35"/>');

  /* ---- a box building: front face, side face, roof, shadow, wear ---- */
  const box = (o, w, d, h, wall, opts) => {
    const p = P(o[0], o[1]), parts = [];
    const fA = p(0, 0, 0), fB = p(w, 0, 0), fC = p(w, h, 0), fD = p(0, h, 0);
    const sB = p(w, 0, d), sC = p(w, h, d), tD = p(0, h, d);
    /* the cast shadow: the sun is up and to the left, so it falls right */
    const sh = (pt) => [pt[0] + h * 0.55, pt[1] + h * 0.08];
    parts.push(poly([fB, sB, sh(sC), sh(fC)], '#000', ' opacity="' + (night ? .25 : .3) + '" filter="' + url('soft') + '"'));
    parts.push(poly([fA, fB, fC, fD], shade(wall, dayK)));
    parts.push(poly([fB, sB, sC, fC], shade(wall, sideK)));
    if (!opts || !opts.noGrime) {
      parts.push(poly([fA, fB, fC, fD], '#000', ' filter="' + url('grime') + '" opacity=".75"'));
      parts.push(poly([fB, sB, sC, fC], '#000', ' filter="' + url('grime') + '" opacity=".6"'));
    }
    parts.push('<path d="M' + f1(fA[0]) + ' ' + f1(fA[1] - 10) + 'H' + f1(fB[0]) + 'L' + f1(sB[0]) + ' ' + f1(sB[1] - 10) + '" stroke="#000" stroke-opacity=".18" stroke-width="10" fill="none" filter="' + url('blur1') + '"/>');   // damp at the foot
    if (opts && opts.flat) parts.push(poly([fD, fC, sC, tD], shade(opts.flat, dayK * 1.05)));
    return { p, parts, fA, fB, fC, fD, sB, sC, tD, w, d, h };
  };
  /* a window on the front face, with its frame, bars, louvres and the stain below */
  const win = (b, x, y, w, h, kind) => {
    const a = b.p(x, y + h, 0), c = b.p(x + w, y, 0), on = lights && (kind === 'mine' || rnd() > .35);
    let s = '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" fill="' + (on ? url('glassL') : url('glassD')) + '" stroke="' + shade('#3a3027', dayK) + '" stroke-width="1.2"/>';
    if (kind !== 'glass' && !skin.bars) {
      /* a sash: the meeting rail and the glazing bar */
      s += '<line x1="' + f1(a[0]) + '" y1="' + f1((a[1] + c[1]) / 2) + '" x2="' + f1(c[0]) + '" y2="' + f1((a[1] + c[1]) / 2) + '" stroke="' + shade('#f2efe8', dayK) + '" stroke-width="1.6"/><line x1="' + f1((a[0] + c[0]) / 2) + '" y1="' + f1(a[1]) + '" x2="' + f1((a[0] + c[0]) / 2) + '" y2="' + f1(c[1]) + '" stroke="' + shade('#f2efe8', dayK) + '" stroke-width="1"/>';
    } else if (kind !== 'glass') {
      for (let i = 1; i < 5; i++) s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1] + i * (c[1] - a[1]) / 5) + '" x2="' + f1(c[0]) + '" y2="' + f1(a[1] + i * (c[1] - a[1]) / 5) + '" stroke="#000" stroke-opacity=".25" stroke-width=".7"/>';   // louvre slats
      for (let i = 1; i < Math.floor((c[0] - a[0]) / 4); i++) s += '<line x1="' + f1(a[0] + i * 4) + '" y1="' + f1(a[1]) + '" x2="' + f1(a[0] + i * 4) + '" y2="' + f1(c[1]) + '" stroke="' + shade('#2b2b2b', dayK) + '" stroke-width=".9"/>';   // burglar-proof
    } else s += '<path d="M' + f1(a[0] + 3) + ' ' + f1(c[1] - 3) + 'L' + f1(a[0] + (c[0] - a[0]) * .45) + ' ' + f1(a[1] + 3) + '" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>';
    if (kind !== 'glass' && !night) s += '<rect x="' + f1(a[0] + 1) + '" y="' + f1(c[1]) + '" width="' + f1(c[0] - a[0] - 2) + '" height="16" fill="' + url('streak') + '"/>';
    if (on) s += '<ellipse cx="' + f1((a[0] + c[0]) / 2) + '" cy="' + f1(c[1] + 4) + '" rx="' + f1((c[0] - a[0]) * 1.6) + '" ry="16" fill="' + url('spill') + '"/>';
    return s;
  };
  const door = (b, x, w, h, col) => { const a = b.p(x, h, 0), c = b.p(x + w, 0, 0); return '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" fill="' + shade(col, dayK) + '" stroke="#1b130d" stroke-width="1"/><circle cx="' + f1(c[0] - 3) + '" cy="' + f1((a[1] + c[1]) / 2) + '" r=".9" fill="#d8c27a"/>'; };

  /* power lines: a concrete pole and the wires sagging across the street */
  const pole = (px) => {
    if (!skin.pole) {
      /* the wires are underground here: a street lamp */
      const lc = shade('#2b3036', Math.max(.7, dayK));
      return '<rect x="' + px + '" y="110" width="3" height="' + (groundY + 30 - 110) + '" fill="' + lc + '"/><path d="M' + (px + 1.5) + ' 112 q0 -8 -12 -8" stroke="' + lc + '" stroke-width="2.4" fill="none"/>' +
        '<path d="M' + (px - 18) + ' 104 h12 l-2 5 h-8z" fill="' + lc + '"/>' + (night || dusk ? '<ellipse cx="' + (px - 12) + '" cy="' + (groundY + 26) + '" rx="34" ry="9" fill="' + url('spill') + '"/><circle cx="' + (px - 12) + '" cy="110" r="3" fill="' + warm + '"/>' : '');
    }
    const top = 70, col = shade('#8d8a84', dayK);
    let s = '<rect x="' + px + '" y="' + top + '" width="4" height="' + (groundY + 30 - top) + '" fill="' + col + '"/><rect x="' + (px - 14) + '" y="' + (top + 6) + '" width="32" height="3" fill="' + col + '"/>';
    s += '<rect x="' + (px + 4) + '" y="' + (top + 40) + '" width="7" height="9" fill="' + shade('#556', dayK) + '"/>';   // transformer box
    [-12, -2, 10].forEach((dx, i) => { s += '<path d="M-10 ' + (top + 2 + i * 3) + ' Q' + (px / 2) + ' ' + (top + 24 + i * 4) + ' ' + (px + dx + 2) + ' ' + (top + 7) + ' Q' + ((px + W) / 2 + 20) + ' ' + (top + 30 + i * 5) + ' ' + (W + 10) + ' ' + (top + 14 + i * 4) + '" stroke="#1a1a1a" stroke-width=".8" fill="none" opacity=".75"/>'; });
    return s;
  };

  const car = (cx, cy, col, suv) => {
    const c = shade(col, dayK), r = suv ? 12 : 9;
    return '<g transform="translate(' + cx + ' ' + cy + ')"><ellipse cx="38" cy="23" rx="44" ry="5" fill="#000" opacity=".35" filter="' + url('blur1') + '"/>' +
      '<path d="M2 16 q0 -9 12 -10 l10 -' + r + ' q4 -2 10 -2 h' + (suv ? 22 : 16) + ' q6 0 10 4 l10 ' + (r - 2) + ' q12 2 14 8 v6 q0 3 -3 3 h-70 q-3 0 -3 -3z" fill="' + c + '"/>' +
      '<path d="M26 5 l7 -' + (r - 2) + ' h' + (suv ? 10 : 8) + ' v' + (r - 2) + 'z M' + (suv ? 47 : 43) + ' 5 v-' + (r - 2) + ' h' + (suv ? 10 : 7) + ' l8 ' + (r - 2) + 'z" fill="' + url('glassD') + '"/>' +
      '<path d="M4 15 h70" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>' +
      '<circle cx="18" cy="22" r="6.5" fill="#141414"/><circle cx="60" cy="22" r="6.5" fill="#141414"/><circle cx="18" cy="22" r="3" fill="#aaa"/><circle cx="60" cy="22" r="3" fill="#aaa"/>' +
      (night ? '<path d="M76 14 l40 -6 v14z" fill="' + warm + '" opacity=".18"/>' : '') + '</g>';
  };
  const person = (px, py, o) => {
    const k = o.scale || 1, skin = shade(o.skin || '#6b4a32', Math.max(.55, dayK)), top = shade(o.shirt, dayK), legs = shade(o.legs || '#262b36', dayK);
    let s = '<g transform="translate(' + px + ' ' + py + ') scale(' + k + ')"><ellipse cx="3" cy="0" rx="9" ry="2.4" fill="#000" opacity=".3" filter="' + url('blur1') + '"/>';
    if (o.dress) s += '<path d="M-6.5 -24 h13 l3 24 h-19z" fill="' + top + '"/><path d="M-6.5 -24 h13 l3 24 h-19z" fill="' + shade(o.trim || '#f2c94c', dayK) + '" opacity=".35" transform="translate(0 -2) scale(1 .3)"/>';
    else s += '<path d="M-4.4 -15 h3.6 l-.2 15 h-3.4z M.8 -15 h3.6 l.2 15 h-3.4z" fill="' + legs + '"/>';
    s += '<path d="M-6.5 -31 q6.5 -3.5 13 0 l1.5 16 h-16z" fill="' + top + '"/><path d="M2 -31 q4.5 1 4.5 1 l1.5 16 h-6z" fill="#000" opacity=".16"/>';
    s += '<path d="M-6.5 -30 l-2 13" stroke="' + top + '" stroke-width="3" stroke-linecap="round"/><path d="M6.5 -30 l2 13" stroke="' + shade(o.shirt, dayK * .85) + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<rect x="-1.5" y="-34" width="3" height="4" fill="' + skin + '"/><ellipse cx="0" cy="-38.5" rx="4.6" ry="5.2" fill="' + skin + '"/>';
    if (o.tie) s += '<path d="M0 -30 l-1.4 9 l1.4 2 l1.4 -2z" fill="#c9a227"/>';
    if (o.gele) s += '<path d="M-7 -41 q7 -10 14 0 q-3 -5 -7 -4 q-4 -1 -7 4z" fill="' + shade(o.gele, dayK) + '"/><path d="M5 -43 l5 -4 l-2 6z" fill="' + shade(o.gele, dayK) + '"/>';
    else if (o.cap) s += '<path d="M-5 -41 q5 -6 10 0z" fill="' + shade(o.cap, dayK) + '"/>';
    else s += '<path d="M-4.6 -40 q4.6 -6 9.2 0 q-4.6 -2.5 -9.2 0z" fill="' + (o.grey ? '#bdb8ae' : '#17110c') + '"/>';
    return s + '</g>';
  };
  const finish = (cls, label) => {
    /* a moment's people and things, laid over the place before the air */
    if (st.extra) add(typeof st.extra === 'function' ? st.extra(self) : st.extra);
    /* the air is something you look through, never something you tap */
    add('<g pointer-events="none">');
    if (st.season === 'rain') { let r = ''; for (let i = 0; i < 120 + Math.round(-TOP / 3); i++) { const x0 = rnd() * (W + 40) - 20, y0 = TOP + rnd() * VH; r += 'M' + f1(x0) + ' ' + f1(y0) + 'l-3 9'; } add('<path d="' + r + '" stroke="#dfe7ee" stroke-opacity=".45" stroke-width=".7"/>'); }
    if (st.season === 'snow') { let sn = ''; for (let i = 0; i < 140 + Math.round(-TOP / 3); i++) sn += '<circle cx="' + f1(rnd() * W) + '" cy="' + f1(TOP + rnd() * VH) + '" r="' + (rnd() * 1.2 + .5).toFixed(2) + '"/>'; add('<g fill="#fff" opacity=".8">' + sn + '</g>'); }
    if (/winter|autumn|cool/.test(st.season)) add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="#8a96a3" opacity=".12"/>');
    if (st.season === 'summer') add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="#ffd98a" opacity=".07"/>');
    if (st.season === 'harmattan') add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="#d9c09a" opacity=".16"/>');
    if (night) add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="#0a1030" opacity=".18"/>');
    add('<rect y="' + TOP + '" width="' + W + '" height="' + VH + '" filter="' + url('grain') + '" opacity=".9"/>');
    if (blackout && !st.gen && !st.solar && (night || dusk) && !st.noNepa && skin.outage) add('<text x="' + W / 2 + '" y="122" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="' + warm + '" opacity=".85">' + esc(skin.outage) + '</text>');
    add('</g>');
    /* the places you can tap, over everything (VISUAL.md, M11) */
    if (st.hot) add(typeof st.hot === 'function' ? st.hot(self) : st.hot);
    return '<svg class="' + cls + '" viewBox="0 ' + TOP + ' ' + W + ' ' + VH + '" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label) + '">' + out.join('') + '</svg>';
  };
  const self = {skin:skin, W:W, H:H, VH:VH, TOP:TOP, url:url, night:night, dusk:dusk, blackout:blackout, genOn:genOn, lights:lights,
    add:add, rnd:rnd, f1:f1, P:P, poly:poly, shade:shade, dayK:dayK, sideK:sideK, warm:warm, skyC:skyC, groundY:groundY,
    box:box, win:win, door:door, pole:pole, car:car, person:person, finish:finish};
  return self;
}
/* Your home, drawn from homeLook() with the kit: the house for your tier,
   what you own, who lives there. */
function homeSceneSVG(st, vh){
  const k = sceneKit(Object.assign({ground: st.tier >= 3 ? 'pave' : 'earth', towers: st.tier >= 3, seed: 11 + st.tier * 7}, st), vh, 'hs');
  const add = k.add, rnd = k.rnd, f1 = k.f1, poly = k.poly, shade = k.shade, url = k.url, box = k.box, win = k.win, door = k.door,
    pole = k.pole, car = k.car, person = k.person, dayK = k.dayK, sideK = k.sideK, groundY = k.groundY, night = k.night, genOn = k.genOn;
  /* ---- the house for your tier ---- */
  const me = { x: 150, y: 262 };
  if (st.tier === 1) {
    /* face-me-I-face-you: a long bungalow of single rooms; yours has the blue door */
    const skin = k.skin, b = box([34, 214], 300, 40, 48, skin.wall1);
    add(b.parts.join(''));
    const r0 = b.p(-8, 48, -6), r1 = b.p(308, 48, -6), r2 = b.p(308, 72, 22), r3 = b.p(-8, 72, 22);
    const r4 = b.p(308, 48, 46);
    add(poly([r1, r4, r2], shade('#6e4a32', sideK)));
    add(poly([r0, r1, r2, r3], url(skin.roof === 'slate' ? 'slate' : 'zinc')));
    /* a terrace has chimney pots; zinc rusts */
    if (skin.roof === 'slate') for (let i = 0; i < 5; i++) { const c = b.p(20 + i * 64, 68, 12); add('<rect x="' + f1(c[0]) + '" y="' + f1(c[1] - 14) + '" width="10" height="14" fill="' + shade(skin.wall1, dayK * .85) + '"/><rect x="' + f1(c[0] + 1) + '" y="' + f1(c[1] - 18) + '" width="3" height="4" fill="' + shade('#a0522d', dayK) + '"/><rect x="' + f1(c[0] + 6) + '" y="' + f1(c[1] - 18) + '" width="3" height="4" fill="' + shade('#a0522d', dayK) + '"/>'); }
    if (skin.roof !== 'slate') {
      add('<rect x="' + f1(r0[0] + 90) + '" y="' + f1(r2[1] + 6) + '" width="46" height="10" fill="#9a4e2a" opacity=".45" transform="skewX(-30)"/>');   // a rusted sheet
    }
    add('<path d="M' + f1(r0[0]) + ' ' + f1(r0[1]) + 'L' + f1(r1[0]) + ' ' + f1(r1[1]) + '" stroke="#3b2618" stroke-width="2"/>');
    for (let i = 0; i < 6; i++) { add(door(b, 10 + i * 49, 17, 32, i === 2 ? '#2f6f99' : '#6a4630')); add(win(b, 31 + i * 49, 14, 14, 14, i === 2 ? 'mine' : '')); }
    if (skin.bars) {
      add('<path d="M40 162 Q150 176 262 160" stroke="#444" stroke-width=".8" fill="none"/>' + ['#d64a3a', '#e9b93b', '#3a7fcf', '#f1efe8', '#3fa06a'].map((c, i) => '<path d="M' + (66 + i * 38) + ' ' + (166 + Math.sin(i) * 2) + 'h14l-1 17h-12z" fill="' + shade(c, dayK) + '"/>').join(''));
      add('<g><rect x="258" y="238" width="17" height="24" rx="3" fill="' + shade('#2d6cb0', dayK) + '"/><ellipse cx="266.5" cy="238" rx="8.5" ry="3" fill="' + shade('#1f507f', dayK) + '"/>' +
        '<rect x="279" y="244" width="14" height="18" rx="2" fill="' + shade('#d9d3c4', dayK) + '"/><ellipse cx="286" cy="244" rx="7" ry="2.4" fill="' + shade('#b9b2a2', dayK) + '"/></g>');   // drum and bucket
      add('<g fill="' + shade('#e6e1d6', dayK) + '"><path d="M200 252h14v-10h-14z"/><path d="M200 242l-2 -10h18l-2 10"/></g>');   // a plastic chair
    } else {
      /* wheelie bins by the doors, where the washing and the water drum would be */
      for (let i = 0; i < 3; i++) add('<g><rect x="' + (252 + i * 16) + '" y="' + (236 + (i % 2) * 2) + '" width="13" height="22" rx="1.5" fill="' + shade(['#2f3d2f', '#2d4a6b', '#4a4a4a'][i], dayK) + '"/><rect x="' + (251 + i * 16) + '" y="' + (234 + (i % 2) * 2) + '" width="15" height="3" fill="' + shade('#222', dayK) + '"/></g>');
    }
    add(pole(352));
    me.x = 150; me.y = 268;
  }
  if (st.tier === 2) {
    /* a block of flats behind a fence: balconies, louvres, the GP tank on its stand */
    const skin = k.skin, b = box([118, 222], 170, 52, 128, skin.wall2, { flat: '#cdbd9c' });
    add(b.parts.join(''));
    for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) {
      add(win(b, 12 + c * 40, 14 + f * 40, 24, 20, f === 1 && c === 1 ? 'mine' : ''));
      if (c % 2 === 0) { const a = b.p(6 + c * 40, 12 + f * 40, 0), e = b.p(42 + c * 40, 12 + f * 40, 0); add('<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(e[0] - a[0]) + '" height="3" fill="' + shade('#8c7c62', dayK) + '"/>'); }
    }
    for (let f = 0; f < 3; f++) { const s = b.p(170, 16 + f * 40, 18), e = b.p(170, 16 + f * 40, 34); add('<path d="M' + f1(s[0]) + ' ' + f1(s[1]) + 'L' + f1(e[0]) + ' ' + f1(e[1]) + 'L' + f1(e[0]) + ' ' + f1(e[1] - 18) + 'L' + f1(s[0]) + ' ' + f1(s[1] - 18) + 'Z" fill="' + url('glassD') + '" opacity=".8"/>'); }
    const t = b.p(120, 128, 30);
    /* the water on the roof: a black GP tank, a polytank, a New York water tower, or none */
    if (skin.tank === 'gp' || skin.tank === 'poly') {
      add('<g><path d="M' + f1(t[0] - 10) + ' ' + f1(t[1]) + 'v-22M' + f1(t[0] + 10) + ' ' + f1(t[1]) + 'v-22" stroke="' + shade('#555', dayK) + '" stroke-width="2"/><rect x="' + f1(t[0] - 15) + '" y="' + f1(t[1] - 46) + '" width="30" height="26" rx="6" fill="' + shade('#1d1d1f', dayK * 1.4) + '"/><rect x="' + f1(t[0] - 15) + '" y="' + f1(t[1] - 46) + '" width="30" height="26" rx="6" fill="#000" filter="' + url('grime') + '" opacity=".6"/></g>');
    } else if (skin.tank === 'wood') {
      add('<g><path d="M' + f1(t[0] - 12) + ' ' + f1(t[1]) + 'l3 -20M' + f1(t[0] + 12) + ' ' + f1(t[1]) + 'l-3 -20" stroke="' + shade('#3a3027', dayK) + '" stroke-width="2"/>' +
        '<rect x="' + f1(t[0] - 13) + '" y="' + f1(t[1] - 44) + '" width="26" height="24" fill="' + shade('#8a6a46', dayK) + '"/><path d="M' + f1(t[0] - 13) + ' ' + f1(t[1] - 36) + 'h26M' + f1(t[0] - 13) + ' ' + f1(t[1] - 28) + 'h26" stroke="#2b2b2b" stroke-width="1"/>' +
        '<path d="M' + f1(t[0] - 15) + ' ' + f1(t[1] - 44) + ' L' + f1(t[0]) + ' ' + f1(t[1] - 58) + ' L' + f1(t[0] + 15) + ' ' + f1(t[1] - 44) + 'Z" fill="' + shade('#4a3a2c', dayK) + '"/></g>');
    }
    const dsh = b.p(30, 128, 20);
    add('<path d="M' + f1(dsh[0]) + ' ' + f1(dsh[1] - 2) + 'a9 9 0 0 1 16 -4z" fill="' + shade('#ddd', dayK) + '"/>');
    if (skin.bars) {
      /* the fence and gate */
      add('<rect x="10" y="' + (groundY + 6) + '" width="370" height="30" fill="' + shade('#c9b893', dayK) + '"/><rect x="10" y="' + (groundY + 6) + '" width="370" height="30" fill="#000" filter="' + url('grime') + '" opacity=".6"/><rect x="10" y="' + (groundY + 3) + '" width="370" height="4" fill="' + shade('#a89a7c', dayK) + '"/>');
      add('<rect x="146" y="' + (groundY + 2) + '" width="74" height="34" fill="' + shade('#262b31', dayK * 1.3) + '"/>' + Array.from({ length: 14 }, (_, i) => '<rect x="' + (149 + i * 5) + '" y="' + (groundY + 4) + '" width="2" height="30" fill="' + shade('#3b434d', dayK * 1.3) + '"/>').join(''));
    } else {
      /* low iron railings and the steps up to the door */
      add('<rect x="10" y="' + (groundY + 26) + '" width="370" height="2" fill="' + shade('#1b1d20', dayK) + '"/>' + Array.from({ length: 62 }, (_, i) => '<rect x="' + (12 + i * 6) + '" y="' + (groundY + 14) + '" width="1.4" height="16" fill="' + shade('#1b1d20', dayK) + '"/>').join('') +
        '<path d="M176 ' + (groundY + 30) + ' h34 v-6 h-30 v-6 h26" fill="' + shade('#bdb6aa', dayK) + '"/>');
    }
    add(pole(40));
    me.x = 108; me.y = 272;
  }
  if (st.tier >= 3) {
    /* a duplex in a gated estate: render and cladding, glass, a parapet roof */
    const big = st.tier === 4;
    const skin = k.skin, b = box([96, 214], big ? 220 : 180, 60, big ? 112 : 96, '#efeae0', { flat: '#d8d2c6', noGrime: true });
    add(b.parts.join(''));
    const cl = [b.p(0, 0, 0), b.p(70, 0, 0), b.p(70, b.h, 0), b.p(0, b.h, 0)];
    add(poly(cl, shade('#5f6469', dayK)));
    add(win(b, 84, 50, 80, 38, 'glass') + win(b, 84, 8, 36, 34, 'glass') + win(b, 12, 56, 46, 28, 'glass') + win(b, 12, 14, 46, 28, 'glass'));
    if (big) add(win(b, 172, 50, 40, 38, 'glass') + win(b, 172, 8, 40, 34, 'glass'));
    const pr = [b.p(-4, b.h, -2), b.p(b.w + 4, b.h, -2), b.p(b.w + 4, b.h + 6, -2), b.p(-4, b.h + 6, -2)];
    add(poly(pr, shade('#2b2e33', dayK * 1.4)));
    const bal = [b.p(80, 48, 0), b.p(170, 48, 0), b.p(170, 60, 0), b.p(80, 60, 0)];
    add(poly(bal, '#bcd6e6', ' opacity=".35"') + '<path d="M' + f1(bal[3][0]) + ' ' + f1(bal[3][1]) + 'H' + f1(bal[2][0]) + '" stroke="#ccc" stroke-width="1.4"/>');
    if (st.solar) { for (let i = 0; i < 5; i++) { const a = b.p(76 + i * 18, b.h + 6, 14), c2 = b.p(92 + i * 18, b.h + 6, 14), c3 = b.p(92 + i * 18, b.h + 14, 44), c4 = b.p(76 + i * 18, b.h + 14, 44); add(poly([a, c2, c3, c4], '#1c3767', ' stroke="#8fb3e8" stroke-width=".5"')); } }
    /* AC units on the side wall */
    for (let i = 0; i < 2; i++) { const a = b.p(b.w, 30 + i * 40, 14), c2 = b.p(b.w, 40 + i * 40, 28); add('<path d="M' + f1(a[0]) + ' ' + f1(a[1]) + 'L' + f1(c2[0]) + ' ' + f1(c2[1] + 10) + 'L' + f1(c2[0]) + ' ' + f1(c2[1]) + 'L' + f1(a[0]) + ' ' + f1(a[1] - 10) + 'Z" fill="' + shade('#e9e9e9', sideK * 1.2) + '"/>'); }
    if (skin.bars) {
      /* the fence: rendered wall, spikes, razor wire, a sliding gate and a gatehouse */
      add('<rect x="0" y="' + (groundY - 4) + '" width="390" height="40" fill="' + shade('#d6d0c4', dayK) + '"/><rect x="0" y="' + (groundY - 6) + '" width="390" height="4" fill="' + shade('#8f8a80', dayK) + '"/>');
      add('<path d="M0 ' + (groundY - 10) + Array.from({ length: 49 }, (_, i) => ' l4 -5 l4 5').join('') + '" fill="none" stroke="' + shade('#666', dayK) + '" stroke-width="1.1"/>');
      add('<path d="M0 ' + (groundY - 18) + Array.from({ length: 33 }, () => ' q6 -6 12 0').join('') + '" fill="none" stroke="' + shade('#888', dayK) + '" stroke-width=".7" opacity=".8"/>');
      add('<rect x="150" y="' + (groundY - 2) + '" width="100" height="38" fill="' + shade('#1d2127', dayK * 1.4) + '"/>' + Array.from({ length: 10 }, (_, i) => '<rect x="' + (154 + i * 10) + '" y="' + groundY + '" width="5" height="34" fill="' + shade('#323944', dayK * 1.4) + '"/>').join(''));
      const gh = box([20, groundY + 34], 40, 26, 40, '#e7e2d8', { flat: '#2b2e33', noGrime: true });
      add(gh.parts.join('') + win(gh, 8, 16, 22, 14, 'glass'));
    } else {
      /* a low wall and a clipped hedge: nobody here needs razor wire */
      add('<rect x="0" y="' + (groundY + 18) + '" width="390" height="14" fill="' + shade('#d6d0c4', dayK) + '"/><path d="M0 ' + (groundY + 18) + Array.from({ length: 40 }, () => ' q5 -9 10 0').join('') + ' V' + (groundY + 18) + 'Z" fill="' + shade('#3f6b3a', dayK) + '"/>');
    }
    if (skin.bars) {
      /* a palm by the gate */
      add('<g><path d="M346 ' + (groundY + 30) + ' q-10 -60 4 -120" stroke="' + shade('#6a4b2c', dayK) + '" stroke-width="5" fill="none"/>' +
        ['M350 92 q-34 -6 -52 16 q26 -8 52 -14', 'M350 92 q-14 -28 -44 -26 q28 8 44 26', 'M350 92 q6 -30 34 -32 q-20 16 -34 32', 'M350 92 q30 -8 44 8 q-26 -4 -44 -8', 'M350 92 q-4 26 -28 40 q14 -20 28 -40', 'M350 92 q20 18 26 40 q-12 -22 -26 -40']
          .map((d) => '<path d="' + d + '" fill="' + shade('#2f6b3a', dayK) + '"/>').join('') + '</g>');
    } else {
      /* a street tree, bare in winter */
      add('<path d="M350 ' + (groundY + 30) + ' v-80" stroke="' + shade('#5a4632', dayK) + '" stroke-width="5"/><path d="M350 ' + (groundY - 30) + ' l-18 -20 M350 ' + (groundY - 40) + ' l16 -22" stroke="' + shade('#5a4632', dayK) + '" stroke-width="2.4"/>' + (/winter|snow/.test(st.season) ? '' : '<circle cx="350" cy="' + (groundY - 72) + '" r="34" fill="' + shade(st.season === 'autumn' ? '#b5651d' : '#3f6b3a', dayK) + '"/>'));
    }
    me.x = 300; me.y = 270;
  }

  /* ---- what you own ---- */
  if (st.gen) {
    const big = st.tier >= 3, gx = st.tier >= 3 ? 72 : st.tier === 2 ? 40 : 300, gy = st.tier >= 3 ? groundY + 50 : st.tier === 2 ? groundY + 50 : groundY + 40;
    const gb = box([gx, gy], big ? 34 : 20, big ? 20 : 12, big ? 22 : 15, big ? '#3f6b48' : '#d6402c', { noGrime: true, flat: big ? '#35593c' : '#b8341f' });
    add(gb.parts.join(''));
    add('<rect x="' + f1(gx + 3) + '" y="' + f1(gy - (big ? 17 : 11)) + '" width="' + (big ? 14 : 8) + '" height="' + (big ? 8 : 5) + '" fill="#111" opacity=".55"/>');
    if (genOn) add('<g fill="#9a9a9a" opacity=".5" filter="' + url('blur1') + '"><circle cx="' + (gx + (big ? 40 : 26)) + '" cy="' + (gy - 26) + '" r="4"/><circle cx="' + (gx + (big ? 46 : 31)) + '" cy="' + (gy - 36) + '" r="6"/><circle cx="' + (gx + (big ? 54 : 38)) + '" cy="' + (gy - 50) + '" r="8"/></g>' +
      '<ellipse cx="' + (gx + 12) + '" cy="' + (gy + 2) + '" rx="40" ry="9" fill="' + url('spill') + '" opacity="' + (night ? .8 : 0) + '"/>');
  }
  if (st.car === 1) add(car(st.tier === 2 ? 236 : 196, groundY + 56, '#c3c7cc', false));
  if (st.car >= 2) { add(car(214, groundY + 54, '#16181b', true)); add(car(120, groundY + 66, '#7e1820', false)); }

  /* in a moment or an arrival the moment's people are the only people */
  if (!st.alone) {
    add(person(me.x, me.y, { shirt: st.job ? '#ece7dc' : '#3c79c4', legs: st.job ? '#20242c' : '#3d3a36', tie: !!st.job, scale: 1.3, grey: st.age >= 50 }));
    if (st.spouse) add(person(me.x + 24, me.y, { shirt: '#b8275f', dress: true, gele: '#d4a017', skin: '#5a3b27', scale: 1.24 }));
    for (let i = 0; i < Math.min(4, st.kids || 0); i++) add(person(me.x + 46 + i * 15, me.y + 1, { shirt: ['#e7b931', '#2fae6a', '#4a8fe0', '#e05a4a'][i], skin: '#7d573b', scale: .72 + (st.kidAge || 0) * .02 }));
    const staff = st.staff || [];
    if (staff.indexOf('security') >= 0) add(person(st.tier >= 3 ? 64 : 30, groundY + 46, { shirt: '#2c3a52', legs: '#1e2633', cap: '#1e2633', skin: '#4a3020', scale: 1.1 }));
    if (staff.indexOf('driver') >= 0 && st.car) add(person(st.tier >= 3 ? 206 : 226, groundY + 84, { shirt: '#f0f0ee', skin: '#5a3b27', scale: 1.15 }));
    if (staff.indexOf('nanny') >= 0) add(person(me.x - 26, me.y + 2, { shirt: '#6f56b3', dress: true, skin: '#5a3b27', scale: 1.15 }));
    if (staff.indexOf('cook') >= 0) add(person(me.x - 48, me.y + 1, { shirt: '#f4f4f0', cap: '#fafafa', skin: '#4a3020', scale: 1.12 }));
  }
  return k.finish('homescene', st.label || 'Your home');
}
