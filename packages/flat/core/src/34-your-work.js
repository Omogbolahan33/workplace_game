/* =========================================================================
   Your work, drawn — the second of LEDGER's places (VISUAL.md, M3)
   ========================================================================= */
/* Where you work, read from the run. Employed, it is the office tower, and
   your desk is a floor higher as the salary climbs (there are no ranks in the
   game, only pay, so the floor is the pay). With a company it is the company's
   own premises: what kind of place it is comes from what it sells and the stage
   it has reached - a buka becomes a restaurant, two dispatch bikes a truck
   depot, a laptop in your room an office floor - and what happens in it is the
   company's state: staff at work, customers at the door, a second shift lit at
   night, branches down the street, shutters coming down in decline, a notice on
   the door when it cannot pay. The sky, the season and the grid are the same
   as at home: it is one city. Nothing here is random. */
const WORK_PLACES = {
  retail:   {startup:'stall', survival:'shop',  traction:'shop',   scale:'store',  maturity:'store',  decline:'shop'},
  food:     {startup:'buka',  survival:'buka',  traction:'eatery', scale:'eatery', maturity:'eatery', decline:'eatery'},
  logi:     {startup:'bikes', survival:'yard',  traction:'yard',   scale:'depot',  maturity:'depot',  decline:'yard'},
  tech:     {startup:'desk',  survival:'desk',  traction:'office', scale:'tower',  maturity:'tower',  decline:'office'},
  agri:     {startup:'farm',  survival:'farm',  traction:'farm',   scale:'factory',maturity:'factory',decline:'farm'},
  estate:   {startup:'site',  survival:'site',  traction:'site',   scale:'site',   maturity:'site',   decline:'site'},
  creative: {startup:'desk',  survival:'office',traction:'office', scale:'tower',  maturity:'tower',  decline:'office'},
  mfg:      {startup:'workshop',survival:'workshop',traction:'workshop',scale:'factory',maturity:'factory',decline:'workshop'},
  proserv:  {startup:'desk',  survival:'office',traction:'office', scale:'tower',  maturity:'tower',  decline:'office'},
  energy:   {startup:'yard',  survival:'yard',  traction:'yard',   scale:'depot',  maturity:'depot',  decline:'yard'}
};
/* which of your places a work screen stands in: the career screen is the
   job, the company's screens are the company; the rest of life is at home */
function workSceneFor(sub){
  if(sub === 'career') return 'job';
  if(sub === 'business' || sub === 'levers' || sub === 'rival') return 'biz';
  return '';
}
/* the scene for the screen you are on: your work under Work's career and
   company screens, the boardroom under Governance, your city under the money
   screens, your home everywhere else */
function sceneSVG(vh){
  const k = routeKey(), mode = k.indexOf('work/') === 0 ? workSceneFor(k.slice(5)) : '';
  /* the governance screens are the company's boardroom */
  if(k.indexOf('governance') === 0 && S.biz) return boardSceneSVG(boardLook(), vh);
  /* the money screens are your city, from above: everything you own where it
     stands; the budget and your things are the household's, at home. Lagos is
     drawn; the other cities get their maps with their skins (VISUAL.md, M10) */
  if(k.indexOf('money') === 0 && !/budget|property/.test(k) && S.city === 'lagos') return citySceneSVG(cityLook(), vh);
  if(mode) return workSceneSVG(workLook(mode), vh);
  /* the People screen is everyone gathered in your compound */
  if(k === 'legacy/people') return peopleSceneSVG(peopleLook(), vh);
  /* at home, whatever you set in motion is on its way up the road to you, and
     whoever a story is open with is at your gate */
  const coming = comingBack(), extra = bothLayers(coming.length ? arrivalsLayer(coming) : null, storyVisitorLayer());
  return homeSceneSVG(extra ? Object.assign({}, homeLook(), {extra: extra}) : homeLook(), vh);
}
function workLook(mode){
  const air = homeLook(), p = S.p, b = S.biz || null;
  /* the rival, across the street: as big as their business, outside when they want a fight */
  const rv = S.rival ? {name: S.rival.name, size: S.rival.size || 0, aggro: S.rival.aggro || 0} : null;
  const base = {time: air.time, season: air.season, era: air.era, grid: air.grid, age: p.age, rival: rv};
  if(mode === 'job' || (mode !== 'biz' && !b)){
    const job = p.job, real = job ? job.monthly / Math.max(0.01, S.cumInfl || 1) / Math.max(0.1, CITY().payMult || 1) : 0;
    const floor = job ? Math.max(1, Math.min(14, Math.round(2 + 3 * Math.log2(Math.max(0.25, real / 250000))))) : 0;
    return Object.assign(base, {kind:'tower', employed: !!job, floor: floor, floors: 14,
      company: job ? (job.industry || 'Corporate') : '', seed: 23,
      label: job ? 'Your work: ' + job.title + ', floor ' + floor + ' of 14' : 'Your work: looking for a job'});
  }
  if(!b) return Object.assign(base, {kind:'tolet', seed: 31, label: 'No company yet: the shop is to let'});
  const stage = bizStage(b), place = (WORK_PLACES[b.type] || WORK_PLACES.retail)[stage] || 'shop';
  /* capacity is set when a quarter runs; a company that has not had one yet is asked directly */
  const staff = (b.staff || []).length, cap = Math.max(1, b.capacity || bizCapacity(b) || 1);
  const busy = Math.max(0, Math.min(1, (b.units || 0) / cap));
  return Object.assign(base, {kind: place, type: b.type, stage: stage, name: b.name || 'Your company',
    staff: staff, customers: Math.round(busy * 6), branches: Math.max(0, Math.min(4, (b.locations || 1) - 1)),
    shifts: typeof leverActive === 'function' ? leverActive(b, 'shifts') : false,
    broke: (b.cash || 0) < 0, decline: stage === 'decline', seed: 37 + (b.type || '').length * 5,
    gen: true, label: (b.name || 'Your company') + ': ' + (BIZ_STAGES[stage] ? BIZ_STAGES[stage].label : stage).toLowerCase() + ', ' + staff + ' staff'});
}
/* The picture of it, with the same kit as your home. */
function workSceneSVG(st, vh){
  const k = sceneKit(Object.assign({ground: /tower|store|depot|office|factory/.test(st.kind) ? 'pave' : 'earth',
    towers: /tower|office|store/.test(st.kind), noNepa: true}, st), vh, 'ws');
  const add = k.add, rnd = k.rnd, f1 = k.f1, poly = k.poly, shade = k.shade, url = k.url, box = k.box, win = k.win, door = k.door,
    pole = k.pole, car = k.car, person = k.person, dayK = k.dayK, sideK = k.sideK, groundY = k.groundY, night = k.night, warm = k.warm;
  const lit = (night || k.dusk) && (!k.blackout || st.gen);
  const brand = ['#c0392b', '#1f6fb2', '#1e8a4c', '#b8860b', '#7b3fa0'][(st.name || '').length % 5];
  /* a sign board with the company's name, on a building's front */
  const sign = (b, x, y, w, h, text, col) => {
    const a = b.p(x, y + h, 0), c = b.p(x + w, y, 0), fs = Math.min(10, (c[1] - a[1]) * .62);
    return '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" rx="1.5" fill="' + shade(col || brand, st.decline ? dayK * .6 : dayK) + '"/>' +
      '<text x="' + f1((a[0] + c[0]) / 2) + '" y="' + f1(c[1] - (c[1] - a[1]) * .3) + '" font-family="sans-serif" font-weight="700" font-size="' + f1(fs) + '" text-anchor="middle" fill="' + (st.decline ? '#cfc6b8' : '#fff') + '" opacity="' + (st.decline ? .55 : .95) + '">' + esc(String(text).slice(0, 22).toUpperCase()) + '</text>' +
      (lit && !st.decline ? '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" fill="' + warm + '" opacity=".18"/>' : '');
  };
  /* shutters: down in decline, part down when it is broke */
  const shutter = (b, x, w, h, frac) => {
    const a = b.p(x, h, 0), c = b.p(x + w, 0, 0), hh = (c[1] - a[1]) * frac;
    let s = '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(hh) + '" fill="' + shade('#8d9196', dayK) + '"/>';
    for (let i = 3; i < hh; i += 3) s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1] + i) + '" x2="' + f1(c[0]) + '" y2="' + f1(a[1] + i) + '" stroke="#000" stroke-opacity=".18"/>';
    return s;
  };
  const notice = (x, y) => '<rect x="' + x + '" y="' + y + '" width="10" height="13" fill="' + shade('#f4f1e6', dayK) + '" transform="rotate(-4 ' + x + ' ' + y + ')"/><path d="M' + (x + 2) + ' ' + (y + 4) + 'h6M' + (x + 2) + ' ' + (y + 7) + 'h5M' + (x + 2) + ' ' + (y + 10) + 'h6" stroke="#c0392b" stroke-width=".8"/>';
  /* vehicles */
  const bike = (x, y, box_) => '<g transform="translate(' + x + ' ' + y + ')"><circle cx="0" cy="0" r="6" fill="none" stroke="#151515" stroke-width="2.4"/><circle cx="24" cy="0" r="6" fill="none" stroke="#151515" stroke-width="2.4"/>' +
    '<path d="M0 0 L9 -9 H18 L24 0 M9 -9 L6 -14 M18 -9 l3 -6 h4" stroke="' + shade('#b22222', dayK) + '" stroke-width="2.4" fill="none"/>' +
    (box_ ? '<rect x="-4" y="-22" width="13" height="11" fill="' + shade(brand, dayK) + '"/>' : '') + '</g>';
  const van = (x, y, col) => '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="34" cy="24" rx="40" ry="5" fill="#000" opacity=".3"/>' +
    '<path d="M0 22 v-26 q0 -4 4 -4 h44 q4 0 8 6 l10 12 q4 2 4 6 v6z" fill="' + shade(col || '#ececec', dayK) + '"/><path d="M50 -6 l12 12 h-12z" fill="' + url('glassD') + '"/>' +
    '<rect x="4" y="2" width="40" height="7" fill="' + shade(brand, dayK) + '" opacity=".85"/>' +
    '<circle cx="14" cy="22" r="6" fill="#151515"/><circle cx="56" cy="22" r="6" fill="#151515"/><circle cx="14" cy="22" r="2.5" fill="#999"/><circle cx="56" cy="22" r="2.5" fill="#999"/></g>';
  const truck = (x, y) => '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="48" cy="26" rx="56" ry="6" fill="#000" opacity=".3"/>' +
    '<rect x="0" y="-26" width="70" height="44" fill="' + shade('#e9e6dd', dayK) + '"/><rect x="0" y="-12" width="70" height="10" fill="' + shade(brand, dayK) + '"/>' +
    '<path d="M72 18 v-28 h16 l10 14 v14z" fill="' + shade('#d98c1f', dayK) + '"/><path d="M76 -6 h11 l6 9 h-17z" fill="' + url('glassD') + '"/>' +
    [12, 58, 88].map((cx) => '<circle cx="' + cx + '" cy="22" r="7" fill="#151515"/><circle cx="' + cx + '" cy="22" r="3" fill="#999"/>').join('') + '</g>';
  /* the people: staff in the company's colour, customers in their own */
  const staffAt = (pts) => pts.slice(0, Math.min(pts.length, st.staff || 0)).forEach((q, i) => add(person(q[0], q[1], {shirt: brand, skin: ['#6b4a32', '#5a3b27', '#7d573b', '#4a3020'][i % 4], scale: q[2] || 1})));
  const customersAt = (pts) => pts.slice(0, Math.min(pts.length, st.decline ? Math.min(1, st.customers) : st.customers || 0)).forEach((q, i) =>
    add(person(q[0], q[1], {shirt: ['#e7b931', '#3a7fcf', '#d64a3a', '#2fae6a', '#8e5bd1', '#f08a24'][i % 6], dress: i % 3 === 1, gele: i % 3 === 1 ? '#d4a017' : null, skin: ['#5a3b27', '#7d573b', '#4a3020'][i % 3], scale: q[2] || 1})));
  /* branches: the same sign, further down the street */
  const branches = () => { for (let i = 0; i < (st.branches || 0); i++) { const bx = box([6 + i * 52, groundY - 2], 40, 14, 30 + (i % 2) * 8, '#e3d8c2', {flat: '#cdbd9c'}); add(bx.parts.join('') + sign(bx, 3, 20, 34, 7, st.name, brand) + door(bx, 14, 12, 18, '#2a2f36')); } };
  let me = {x: 300, y: 270};
  /* the rival's place, across the street at the back: its height is the size of
     their business, its sign theirs, and they are outside it when they are
     spoiling for a fight */
  if (st.rival && st.kind !== 'tower' && st.kind !== 'tolet') {
    const rh = 22 + Math.min(140, st.rival.size) * .36, rb = box([318, groundY - 6], 62, 16, rh, '#d9d0bf', {flat: '#bdb2a0'});
    add(rb.parts.join('') + sign(rb, 4, rh - 12, 54, 8, st.rival.name, '#8c1d1d') + door(rb, 22, 14, 18, '#2a2f36'));
    if (st.rival.aggro > 60) add('<g><title>' + esc(st.rival.name) + '</title>' + person(352, groundY + 18, {shirt: '#8c1d1d', tie: true, skin: '#4a3020', scale: .95}) +
      '<path d="M346.5 ' + (groundY - 3) + ' h11" stroke="#111" stroke-width="2.4" stroke-linecap="round" opacity=".6"/></g>');
  }
  /* a company's premises are smaller than a tower: everything in front of the
     skyline is drawn larger, anchored at the horizon so it grows upward */
  const close = st.kind !== 'tower';
  if (close) add('<g transform="translate(195 ' + groundY + ') scale(1.22) translate(-195 -' + groundY + ')">');

  if (st.kind === 'tower') {
    /* the office tower: fourteen floors of glass, your floor marked in gold */
    const floors = st.floors || 14, fh = 15, b = box([118, groundY + 30], 150, 60, floors * fh + 24, '#6f8090', {noGrime: true, flat: '#4b5763'});
    add(b.parts.join(''));
    const gl = [b.p(4, 24, 0), b.p(146, 24, 0), b.p(146, b.h - 4, 0), b.p(4, b.h - 4, 0)];
    add(poly(gl, url('glassD')));
    for (let f = 0; f < floors; f++) {
      const y0 = 24 + f * fh, mine = st.employed && f === st.floor - 1, on = lit && (mine || rnd() > .45);
      const a = b.p(4, y0 + fh, 0), c = b.p(146, y0, 0);
      if (on) add('<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" fill="' + url('glassL') + '" opacity="' + (mine ? .95 : .55) + '"/>');
      add('<line x1="' + f1(a[0]) + '" y1="' + f1(c[1]) + '" x2="' + f1(c[0]) + '" y2="' + f1(c[1]) + '" stroke="' + shade('#2f3a45', dayK) + '" stroke-width="1.6"/>');
      if (mine) {
        add('<rect x="' + f1(a[0] - 3) + '" y="' + f1(a[1] - 1) + '" width="' + f1(c[0] - a[0] + 6) + '" height="' + f1(c[1] - a[1] + 2) + '" fill="none" stroke="#f5b301" stroke-width="2"/>');
        const dx = a[0] + (c[0] - a[0]) * (.2 + .5 * Math.min(1, (st.floor - 1) / 13));
        add('<g transform="translate(' + f1(dx) + ' ' + f1(c[1] - 1) + ')"><rect x="-9" y="-4" width="18" height="2" fill="#2b2b2b"/><rect x="-3" y="-9" width="6" height="5" fill="#9fd0ff"/>' +
          '<circle cx="-12" cy="-10" r="2.2" fill="#3a2a1e"/><rect x="-14" y="-8" width="4.5" height="6" fill="#ece7dc"/></g>');
      }
    }
    for (let i = 1; i < 6; i++) { const a = b.p(4 + i * 24, 24, 0), c = b.p(4 + i * 24, b.h - 4, 0); add('<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(c[0]) + '" y2="' + f1(c[1]) + '" stroke="' + shade('#2f3a45', dayK) + '" stroke-width="1.1" opacity=".8"/>'); }
    const side = [b.p(150, 24, 0), b.p(150, 24, 60), b.p(150, b.h - 4, 60), b.p(150, b.h - 4, 0)];
    add(poly(side, url('glassD'), ' opacity=".55"'));
    /* the lobby: glass doors, a canopy, the company's name */
    add(sign(b, 30, 16, 90, 7, st.company || 'Head office', '#1d2a38'));
    add(door(b, 58, 34, 14, '#9fc4dc'));
    const can = [b.p(40, 15, -14), b.p(110, 15, -14), b.p(110, 15, 0), b.p(40, 15, 0)];
    add(poly(can, shade('#2b2e33', dayK * 1.4)));
    add(car(18, groundY + 64, '#1d2124', true) + car(290, groundY + 70, '#c3c7cc', false));
    add(person(96, groundY + 46, {shirt: '#2c3a52', legs: '#1e2633', cap: '#1e2633', skin: '#4a3020', scale: 1}));   // the gate's security
    for (let i = 0; i < 3; i++) add(person(200 + i * 18, groundY + 54 + (i % 2) * 4, {shirt: ['#ece7dc', '#2f3d5c', '#a83a4a'][i], tie: i === 0, skin: '#5a3b27', scale: 1.05}));
    me = st.employed ? null : {x: 170, y: groundY + 86};
  }

  if (st.kind === 'tolet') {
    const b = box([96, groundY + 20], 190, 40, 70, '#ded2b9', {flat: '#cdbd9c'});
    add(b.parts.join(''));
    for (let i = 0; i < 3; i++) add(shutter(b, 12 + i * 60, 48, 44, 1));
    add(sign(b, 20, 50, 150, 12, 'TO LET', '#8c2b20'));
    add('<text x="' + f1(b.p(95, 28, 0)[0]) + '" y="' + f1(b.p(95, 28, 0)[1]) + '" font-family="sans-serif" font-size="7" text-anchor="middle" fill="' + shade('#222', dayK) + '" opacity=".7">CALL 0803 *** ****</text>');
    add(pole(40));
    me = {x: 200, y: groundY + 84};
  }

  if (st.kind === 'stall') {
    /* a market stall: a table of goods under an umbrella, in the open */
    branches();
    const t = box([120, groundY + 60], 120, 30, 26, '#8a6a46', {noGrime: true, flat: '#a07a50'});
    add(t.parts.join(''));
    const top = t.p(60, 26, 15);
    for (let i = 0; i < 9; i++) add('<rect x="' + f1(top[0] - 50 + i * 11) + '" y="' + f1(top[1] - 10 - (i % 3) * 4) + '" width="10" height="' + (10 + (i % 3) * 4) + '" fill="' + shade(['#e05a4a', '#e7b931', '#3a7fcf', '#2fae6a', '#f1efe8'][i % 5], dayK) + '"/>');
    add('<path d="M' + f1(top[0]) + ' ' + f1(top[1] - 14) + ' v-62" stroke="#555" stroke-width="2"/><path d="M' + f1(top[0] - 70) + ' ' + f1(top[1] - 60) + ' Q' + f1(top[0]) + ' ' + f1(top[1] - 104) + ' ' + f1(top[0] + 70) + ' ' + f1(top[1] - 60) + 'Z" fill="' + shade(brand, dayK) + '"/>' +
      '<path d="M' + f1(top[0] - 70) + ' ' + f1(top[1] - 60) + ' Q' + f1(top[0] - 35) + ' ' + f1(top[1] - 92) + ' ' + f1(top[0]) + ' ' + f1(top[1] - 76) + ' Q' + f1(top[0] + 35) + ' ' + f1(top[1] - 92) + ' ' + f1(top[0] + 70) + ' ' + f1(top[1] - 60) + '" fill="#fff" opacity=".18"/>');
    staffAt([[150, groundY + 50, 1]]);
    customersAt([[110, groundY + 92, 1.1], [260, groundY + 90, 1.1], [286, groundY + 94, 1.1]]);
    me = {x: 200, y: groundY + 50};
  }

  if (st.kind === 'shop' || st.kind === 'store' || st.kind === 'eatery' || st.kind === 'office') {
    /* a shopfront: lock-up, store, eatery or office, with its sign, its door,
       goods or tables or desks behind the glass */
    branches();
    const big = st.kind === 'store' || st.kind === 'office', w = big ? 220 : 170, h = big ? 96 : 70;
    const b = box([90, groundY + 22], w, 46, h, st.kind === 'office' ? '#e9e6df' : '#e4d7bd', {flat: '#cdbd9c', noGrime: st.kind === 'office'});
    add(b.parts.join(''));
    add(sign(b, 10, h - 20, w - 20, 13, st.name, brand));
    if (big) for (let i = 0; i < 4; i++) add(win(b, 12 + i * 52, h - 44, 40, 18, st.kind === 'office' ? 'glass' : ''));
    const gl = [b.p(12, 4, 0), b.p(w - 12, 4, 0), b.p(w - 12, 44, 0), b.p(12, 44, 0)];
    add(poly(gl, lit && !st.decline ? url('glassL') : url('glassD'), ' opacity=".92"'));
    const ga = b.p(12, 44, 0);
    if (st.kind === 'shop' || st.kind === 'store') for (let r = 0; r < 3; r++) for (let i = 0; i < (big ? 16 : 12); i++) add('<rect x="' + f1(ga[0] + 6 + i * 11) + '" y="' + f1(ga[1] + 6 + r * 12) + '" width="8" height="8" fill="' + shade(['#e05a4a', '#e7b931', '#3a7fcf', '#2fae6a', '#f1efe8'][(i + r) % 5], dayK) + '" opacity=".85"/>');
    if (st.kind === 'eatery') for (let i = 0; i < 4; i++) add('<rect x="' + f1(ga[0] + 14 + i * 36) + '" y="' + f1(ga[1] + 26) + '" width="22" height="3" fill="' + shade('#6a4630', dayK) + '"/><rect x="' + f1(ga[0] + 23 + i * 36) + '" y="' + f1(ga[1] + 29) + '" width="3" height="9" fill="' + shade('#6a4630', dayK) + '"/>');
    if (st.kind === 'office') for (let i = 0; i < 5; i++) add('<rect x="' + f1(ga[0] + 10 + i * 40) + '" y="' + f1(ga[1] + 24) + '" width="24" height="3" fill="#2b2b2b"/><rect x="' + f1(ga[0] + 18 + i * 40) + '" y="' + f1(ga[1] + 16) + '" width="8" height="7" fill="#9fd0ff" opacity=".9"/>');
    add(door(b, w / 2 - 12, 24, 40, st.kind === 'office' ? '#9fc4dc' : '#2a2f36'));
    if (st.decline) add(shutter(b, 12, w - 24, 44, .62));
    if (st.broke) { const n = b.p(w / 2 + 14, 30, 0); add(notice(f1(n[0]), f1(n[1]))); }
    staffAt([[ga[0] + 30, groundY + 18, .9], [ga[0] + 70, groundY + 18, .9], [ga[0] + 110, groundY + 18, .9], [ga[0] + 150, groundY + 18, .9], [ga[0] + 50, groundY + 18, .9], [ga[0] + 130, groundY + 18, .9]]);
    customersAt([[120, groundY + 82, 1.1], [142, groundY + 86, 1.1], [236, groundY + 84, 1.1], [258, groundY + 88, 1.1], [280, groundY + 84, 1.1], [100, groundY + 90, 1.1]]);
    if (st.kind === 'store') add(van(250, groundY + 62, '#f1f1ef'));
    add(pole(30));
  }

  if (st.kind === 'buka') {
    /* a buka: a zinc canopy on poles, benches, the big pots over the fire */
    branches();
    const c0 = [96, groundY + 6], cw = 200;
    add('<g stroke="' + shade('#6a4b2c', dayK) + '" stroke-width="3">' + [0, cw / 2, cw].map((dx) => '<path d="M' + (c0[0] + dx) + ' ' + (c0[1] + 64) + 'v-58"/>').join('') + '</g>');
    add(poly([[c0[0] - 14, c0[1] + 8], [c0[0] + cw + 14, c0[1] + 8], [c0[0] + cw + 30, c0[1] - 12], [c0[0] + 2, c0[1] - 12]], url('zinc')));
    add('<rect x="' + (c0[0] - 14) + '" y="' + (c0[1] + 6) + '" width="' + (cw + 28) + '" height="4" fill="#3b2618"/>');
    add(sign({p: (x, y) => [c0[0] + x, c0[1] - y]}, 40, -2, 120, 12, st.name, brand).replace(/fill="#fff"/, 'fill="#fff"'));
    for (let i = 0; i < 2; i++) add('<rect x="' + (c0[0] + 18 + i * 92) + '" y="' + (c0[1] + 50) + '" width="70" height="5" fill="' + shade('#7a5634', dayK) + '"/><rect x="' + (c0[0] + 22 + i * 92) + '" y="' + (c0[1] + 55) + '" width="3" height="9" fill="' + shade('#7a5634', dayK) + '"/><rect x="' + (c0[0] + 81 + i * 92) + '" y="' + (c0[1] + 55) + '" width="3" height="9" fill="' + shade('#7a5634', dayK) + '"/>');
    for (let i = 0; i < 3; i++) { const px = 40 + i * 22, py = groundY + 70; add('<ellipse cx="' + px + '" cy="' + py + '" rx="10" ry="4" fill="' + shade('#3a3a3a', dayK) + '"/><path d="M' + (px - 10) + ' ' + py + ' q0 12 10 12 q10 0 10 -12z" fill="' + shade('#2b2b2b', dayK) + '"/>' +
      '<path d="M' + (px - 6) + ' ' + (py + 14) + ' l3 -5 l3 5 l3 -6 l3 6" stroke="#e8771e" stroke-width="2" fill="none"/>' +
      '<g fill="#bdbdbd" opacity=".45"><circle cx="' + px + '" cy="' + (py - 9) + '" r="3"/><circle cx="' + (px + 3) + '" cy="' + (py - 17) + '" r="4.5"/></g>'); }
    staffAt([[60, groundY + 62, 1.05], [96, groundY + 62, 1.05], [250, groundY + 58, 1]]);
    customersAt([[140, groundY + 58, 1], [170, groundY + 58, 1], [210, groundY + 58, 1], [300, groundY + 82, 1.1], [324, groundY + 86, 1.1], [190, groundY + 92, 1.1]]);
    if (st.broke) add(notice(c0[0] + cw - 30, c0[1] + 20));
    add(pole(360));
    me = {x: 340, y: groundY + 92};
  }

  if (st.kind === 'bikes' || st.kind === 'yard' || st.kind === 'depot') {
    /* a dispatch yard: a fenced lot, a small office, the fleet */
    branches();
    const big = st.kind === 'depot';
    const b = box([big ? 210 : 230, groundY + 18], big ? 150 : 90, 40, big ? 66 : 40, big ? '#d9d4ca' : '#e4d7bd', {flat: big ? '#9aa3ab' : '#cdbd9c'});
    add(b.parts.join('') + sign(b, 6, (big ? 66 : 40) - 13, (big ? 150 : 90) - 12, 10, st.name, brand) + door(b, 10, 16, 26, '#2a2f36'));
    if (big) add(door(b, 40, 90, 46, '#8d9196'));
    if (st.type === 'energy') for (let i = 0; i < 4; i++) add('<rect x="' + (40 + i * 6) + '" y="' + (groundY + 20 - i * 5) + '" width="56" height="5" fill="#1c3767" stroke="#8fb3e8" stroke-width=".5"/>');
    if (st.kind === 'bikes') { add(bike(70, groundY + 74, true) + bike(130, groundY + 82, true)); }
    else if (st.kind === 'yard') { add(van(30, groundY + 50, '#f1f1ef') + bike(150, groundY + 84, true) + van(120, groundY + 62, '#f1f1ef')); }
    else { add(truck(14, groundY + 46) + truck(96, groundY + 66) + van(4, groundY + 92, '#f1f1ef')); }
    if (st.decline) add(shutter(b, 10, 16, 26, .8));
    if (st.broke) { const n = b.p(30, 22, 0); add(notice(f1(n[0]), f1(n[1]))); }
    staffAt([[190, groundY + 76, 1.05], [210, groundY + 82, 1.05], [176, groundY + 90, 1.05], [300, groundY + 80, 1.05], [324, groundY + 84, 1.05], [348, groundY + 88, 1.05]]);
    add(pole(big ? 380 : 214));
    me = {x: 260, y: groundY + 94};
  }

  if (st.kind === 'desk') {
    /* the start of most companies: a laptop in your room, the fan, the gen */
    const b = box([40, groundY + 40], 300, 30, 150, '#d8ccb1', {flat: '#cdbd9c'});
    add(b.parts.join(''));
    const w0 = b.p(150, 120, 0), w1 = b.p(270, 60, 0);
    add('<rect x="' + f1(w0[0]) + '" y="' + f1(w0[1]) + '" width="' + f1(w1[0] - w0[0]) + '" height="' + f1(w1[1] - w0[1]) + '" fill="' + (night ? '#0f1730' : shade('#9fc4dc', dayK)) + '" stroke="#3a3027"/>' +
      Array.from({length: 10}, (_, i) => '<line x1="' + f1(w0[0] + 6 + i * 11.4) + '" y1="' + f1(w0[1]) + '" x2="' + f1(w0[0] + 6 + i * 11.4) + '" y2="' + f1(w1[1]) + '" stroke="#333" stroke-width=".9"/>').join(''));
    const d0 = b.p(50, 44, 0), d1 = b.p(190, 40, 0);
    add('<rect x="' + f1(d0[0]) + '" y="' + f1(d0[1]) + '" width="' + f1(d1[0] - d0[0]) + '" height="5" fill="' + shade('#7a5634', dayK) + '"/><rect x="' + f1(d0[0] + 6) + '" y="' + f1(d0[1] + 5) + '" width="4" height="40" fill="' + shade('#5e4127', dayK) + '"/><rect x="' + f1(d1[0] - 10) + '" y="' + f1(d0[1] + 5) + '" width="4" height="40" fill="' + shade('#5e4127', dayK) + '"/>');
    add('<path d="M' + f1(d0[0] + 50) + ' ' + f1(d0[1]) + ' l4 -22 h34 l-4 22z" fill="#2b2e33"/><path d="M' + f1(d0[0] + 55) + ' ' + f1(d0[1] - 3) + ' l3 -16 h28 l-3 16z" fill="' + (lit || !night ? '#9fd0ff' : '#1a2a3a') + '"/>' +
      '<ellipse cx="' + f1(d0[0] + 72) + '" cy="' + f1(d0[1] - 10) + '" rx="40" ry="24" fill="#9fd0ff" opacity="' + (night ? .18 : .06) + '"/>');
    const fan = b.p(250, 130, 0); add('<circle cx="' + f1(fan[0]) + '" cy="' + f1(fan[1]) + '" r="12" fill="none" stroke="#777"/><path d="M' + f1(fan[0]) + ' ' + f1(fan[1]) + ' l-9 -5 M' + f1(fan[0]) + ' ' + f1(fan[1]) + ' l8 -6 M' + f1(fan[0]) + ' ' + f1(fan[1]) + ' l1 10" stroke="#888" stroke-width="2"/>');
    add(sign(b, 20, 132, 110, 10, st.name, brand));
    me = {x: Math.round(d0[0] + 40), y: groundY + 86};
    staffAt([[Math.round(d0[0] + 140), groundY + 88, 1.1], [Math.round(d0[0] + 170), groundY + 90, 1.1]]);
  }

  if (st.kind === 'farm') {
    /* a farm: rows in the red earth, a shed, a tank, the hands working */
    for (let r = 0; r < 6; r++) add('<path d="M' + (-10 + r * 4) + ' ' + (groundY + 30 + r * 14) + ' L' + (400 - r * 4) + ' ' + (groundY + 22 + r * 14) + '" stroke="' + shade('#3f7a35', dayK) + '" stroke-width="5" stroke-dasharray="6 4" opacity=".9"/>');
    const b = box([250, groundY + 14], 90, 36, 44, '#d6c7a6', {flat: '#9a6a45'});
    add(b.parts.join('') + sign(b, 6, 30, 78, 9, st.name, brand) + door(b, 30, 26, 28, '#6a4630'));
    add('<rect x="200" y="' + (groundY - 50) + '" width="20" height="26" rx="5" fill="' + shade('#1d1d1f', dayK * 1.4) + '"/><path d="M203 ' + (groundY - 24) + 'v28M217 ' + (groundY - 24) + 'v28" stroke="#555" stroke-width="2"/>');
    if (st.stage !== 'startup') add('<g transform="translate(40 ' + (groundY + 60) + ')"><rect x="0" y="-18" width="30" height="16" fill="' + shade('#c0392b', dayK) + '"/><rect x="26" y="-30" width="16" height="14" fill="' + shade('#c0392b', dayK) + '"/><circle cx="8" cy="0" r="9" fill="#151515"/><circle cx="38" cy="2" r="6" fill="#151515"/></g>');
    staffAt([[110, groundY + 52, 1], [150, groundY + 66, 1], [190, groundY + 80, 1.05], [80, groundY + 94, 1.1], [230, groundY + 92, 1.1], [130, groundY + 38, .9]]);
    me = {x: 300, y: groundY + 92};
  }

  if (st.kind === 'site') {
    /* a building site: a frame going up, block stacks, a crane, a mixer */
    const floors = st.stage === 'startup' ? 1 : st.stage === 'survival' ? 2 : 3;
    const b = box([140, groundY + 40], 160, 50, floors * 30, '#bdb6aa', {flat: '#a7a094'});
    add(b.parts.join(''));
    for (let f = 0; f < floors; f++) for (let c = 0; c < 4; c++) { const a = b.p(10 + c * 38, f * 30 + 26, 0), e = b.p(36 + c * 38, f * 30 + 6, 0); add('<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(e[0] - a[0]) + '" height="' + f1(e[1] - a[1]) + '" fill="#2b2b2b" opacity=".75"/>'); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4 - i; j++) add('<rect x="' + (40 + j * 13 + i * 6) + '" y="' + (groundY + 80 - i * 7) + '" width="12" height="6" fill="' + shade('#c9c4b8', dayK) + '" stroke="#888" stroke-width=".5"/>');
    add('<g stroke="' + shade('#e0a21b', dayK) + '" stroke-width="3" fill="none"><path d="M330 ' + (groundY + 40) + 'V-60M330 -56h-150M330 -56l20 10M186 -56v40"/></g><rect x="180" y="-16" width="12" height="9" fill="' + shade('#888', dayK) + '"/>');
    add(sign({p: (x, y) => [x, -y]}, 260, -(groundY + 22), 100, 12, st.name, brand));
    staffAt([[110, groundY + 86, 1.05], [200, groundY + 92, 1.05], [240, groundY + 94, 1.05], [280, groundY + 90, 1.05], [96, groundY + 66, 1], [300, groundY + 70, 1]]);
    me = {x: 330, y: groundY + 96};
  }

  if (st.kind === 'workshop' || st.kind === 'factory') {
    /* a workshop opens to the street; a factory has a chimney and a loading bay */
    branches();
    const big = st.kind === 'factory';
    const b = box([84, groundY + 24], big ? 240 : 170, 56, big ? 90 : 60, big ? '#cfcac0' : '#d8ccb1', {flat: big ? '#8f979e' : '#cdbd9c'});
    add(b.parts.join(''));
    add(sign(b, 10, (big ? 90 : 60) - 16, (big ? 240 : 170) - 20, 11, st.name, brand));
    const op = [b.p(16, 2, 0), b.p(big ? 150 : 120, 2, 0), b.p(big ? 150 : 120, big ? 58 : 40, 0), b.p(16, big ? 58 : 40, 0)];
    add(poly(op, lit || st.shifts && (night || k.dusk) ? shade('#5a4632', 1) : shade('#2a2622', dayK * 1.2)));
    if (lit || (st.shifts && (night || k.dusk))) add(poly(op, url('glassL'), ' opacity=".45"'));
    for (let i = 0; i < 3; i++) { const m = b.p(30 + i * (big ? 40 : 30), 18, 0); add('<rect x="' + f1(m[0]) + '" y="' + f1(m[1] - 14) + '" width="' + (big ? 26 : 20) + '" height="14" fill="' + shade('#5d6b78', dayK) + '"/><circle cx="' + f1(m[0] + 8) + '" cy="' + f1(m[1] - 7) + '" r="3.5" fill="#222"/>'); }
    if (big) { const c = b.p(200, 90, 30); add('<rect x="' + f1(c[0]) + '" y="' + f1(c[1] - 70) + '" width="14" height="70" fill="' + shade('#8a7a6a', dayK) + '"/><g fill="#a9a9a9" opacity=".5"><circle cx="' + f1(c[0] + 7) + '" cy="' + f1(c[1] - 80) + '" r="7"/><circle cx="' + f1(c[0] + 16) + '" cy="' + f1(c[1] - 94) + '" r="10"/><circle cx="' + f1(c[0] + 30) + '" cy="' + f1(c[1] - 110) + '" r="13"/></g>'); add(truck(260, groundY + 62)); }
    if (st.decline) add(shutter(b, 16, (big ? 134 : 104), big ? 58 : 40, .7));
    if (st.broke) { const n = b.p(big ? 170 : 140, 30, 0); add(notice(f1(n[0]), f1(n[1]))); }
    staffAt([[124, groundY + 22, .9], [164, groundY + 22, .9], [204, groundY + 22, .9], [144, groundY + 26, .95], [184, groundY + 26, .95], [224, groundY + 26, .95]]);
    add(pole(30));
    me = {x: big ? 120 : 280, y: groundY + 90};
  }

  if (me) add(person(me.x, me.y, {shirt: S.p && S.p.job && st.kind === 'tower' ? '#ece7dc' : '#3c79c4', legs: '#20242c', scale: 1.3, grey: st.age >= 50, tie: st.kind === 'tower'}));
  if (close) add('</g>');
  return k.finish('workscene', st.label || 'Your work');
}
