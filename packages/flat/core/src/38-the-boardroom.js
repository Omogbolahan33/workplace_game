/* =========================================================================
   The boardroom (VISUAL.md, M7)
   ========================================================================= */
/* Governance is a room. Who owns the company is who sits at the table, and
   the size of their chair is the size of their stake; the register hangs on
   the wall as a picture of who owns what. When a resolution is open, the
   hands that would go up for it are up. When the company borrowed on
   covenants, the bank's man stands by the window with his folder, and when a
   covenant is breached the folder is red and he is not smiling. Read from the
   register, the board, the open resolutions and the covenants - and only
   read: the register is never created here (ensureGov() would write one), and
   a director's stance is the same pure reading the vote uses. */
function boardLook(){
  const air = homeLook(), b = S.biz;
  const base = {time: air.time, season: air.season, era: air.era, grid: air.grid, seed: 61};
  if(!b) return Object.assign(base, {none: true, label: 'No company, no boardroom'});
  const shares = b.shares || [], total = shares.reduce(function(s, h){ return s + (h.shares || 0); }, 0);
  const pctOf = function(h){ return total > 0 ? (h.shares || 0) / total * 100 : 0; };
  const mine = total > 0 ? shares.filter(function(h){ return h.you; }).reduce(function(s, h){ return s + pctOf(h); }, 0) : 100;
  const res = ((b.resolutions || []).filter(function(r){ return r.status === 'open'; }))[0] || null;
  /* who sits: the board if there is one, and you always */
  const board = (b.board || []).filter(function(d){ return !d.departed; });
  const seats = board.length ? board.map(function(d){
    const h = d.holderId ? shares.find(function(x){ return x.id === d.holderId; }) : null;
    return {name: d.name, yours: !!d.yours, chair: d.role === 'chair', label: d.label || '',
      pct: d.yours ? mine : h ? pctOf(h) : 0,
      vote: res ? dirStance(b, d, res).vote : ''};
  }) : [{name: S.name || 'You', yours: true, chair: true, label: 'founder', pct: mine, vote: res ? 'for' : ''}];
  if(!seats.some(function(x){ return x.yours; })) seats.push({name: S.name || 'You', yours: true, chair: false, label: 'shareholder', pct: mine, vote: ''});
  const holders = total > 0 ? shares.map(function(h){ return {you: !!h.you, pct: pctOf(h), name: h.name}; }) : [{you: true, pct: 100, name: S.name || 'You'}];
  const cov = b.covenants || [];
  const breached = cov.length ? covenantBreaches(b).length > 0 : false;
  return Object.assign(base, {none: false, name: b.name || 'Your company', seats: seats.slice(0, 7), holders: holders,
    res: res ? resMeta(res.kind).label : '', lender: cov.length > 0, breached: breached,
    label: (b.name || 'Your company') + ' boardroom: you hold ' + Math.round(mine) + '%' + (res ? ', a vote is open' : '') + (breached ? ', a covenant is breached' : '')});
}
function boardSceneSVG(st, vh){
  /* indoors: the season is outside the window, not falling on the table */
  const k = sceneKit(Object.assign({ground: 'pave', towers: true, noNepa: true}, st, {season: st.season === 'rain' ? 'dry' : st.season}), vh, 'bs');
  const add = k.add, shade = k.shade, url = k.url, person = k.person, gy = k.groundY, dayK = k.dayK, f1 = k.f1, TOP = k.TOP, H = k.H;
  const wall = shade('#3b3530', Math.max(.55, dayK)), wood = shade('#6e4a32', Math.max(.6, dayK));
  /* the room: a wall with a long window onto the city, the floor */
  add('<path d="M-10 ' + TOP + ' H400 V' + (gy + 46) + ' H-10Z M30 ' + (gy - 150) + ' V' + (gy - 18) + ' H260 V' + (gy - 150) + 'Z" fill="' + wall + '" fill-rule="evenodd"/>');
  add('<path d="M30 ' + (gy - 150) + ' H260 V' + (gy - 18) + ' H30Z" fill="none" stroke="#1b1712" stroke-width="5"/><path d="M107 ' + (gy - 150) + 'V' + (gy - 18) + 'M184 ' + (gy - 150) + 'V' + (gy - 18) + '" stroke="#1b1712" stroke-width="3"/>');
  add('<rect x="-10" y="' + (gy + 46) + '" width="410" height="' + (H - gy) + '" fill="' + shade('#4a3b2c', Math.max(.55, dayK)) + '"/>');
  /* the register, framed: who owns what, you in gold */
  const cx = 322, cy = gy - 96, r = 30;
  let a0 = -Math.PI / 2, pie = '';
  (st.holders || []).forEach(function(h, i){
    const a1 = a0 + Math.max(0.001, h.pct / 100) * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
    const col = h.you ? '#f5b301' : ['#5aa9ff', '#a78bfa', '#2fd47a', '#ff9f43', '#ff5f6d', '#8b9bb0'][i % 6];
    pie += h.pct >= 99.9 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + col + '"/>'
      : '<path d="M' + cx + ' ' + cy + ' L' + f1(cx + r * Math.cos(a0)) + ' ' + f1(cy + r * Math.sin(a0)) + ' A' + r + ' ' + r + ' 0 ' + big + ' 1 ' + f1(cx + r * Math.cos(a1)) + ' ' + f1(cy + r * Math.sin(a1)) + 'Z" fill="' + col + '"/>';
    a0 = a1;
  });
  add('<rect x="' + (cx - 42) + '" y="' + (cy - 42) + '" width="84" height="98" fill="#1b1712"/><rect x="' + (cx - 38) + '" y="' + (cy - 38) + '" width="76" height="90" fill="' + shade('#efe9dc', Math.max(.7, dayK)) + '"/>' + pie +
    '<text x="' + cx + '" y="' + (cy + 46) + '" font-family="Georgia,serif" font-size="8" text-anchor="middle" fill="#3b2a1c">THE REGISTER</text>');
  /* the bank's man, by the window, when the company borrowed on covenants */
  if (st.lender) {
    add(person(300, gy + 50, {shirt: '#20242c', legs: '#20242c', tie: true, skin: '#4a3020', scale: 2.1}));
    add('<g transform="translate(312 ' + (gy - 14) + ') rotate(-8)"><rect width="22" height="16" rx="1" fill="' + (st.breached ? '#c62828' : '#1f4e8c') + '"/><rect x="3" y="-3" width="16" height="4" fill="#f4f1e6"/></g>');
    if (st.breached) add('<circle cx="300" cy="' + (gy - 50) + '" r="8" fill="#ff5f6d"/><rect x="298.8" y="' + (gy - 56) + '" width="2.4" height="7" fill="#fff"/><rect x="298.8" y="' + (gy - 47) + '" width="2.4" height="2.4" fill="#fff"/>');
  }
  /* the table, and who sits at it: the bigger the stake, the bigger the chair */
  const seats = st.seats || [], n = seats.length, x0 = 56, x1 = 244, Z = 2.1;
  seats.forEach(function(s, i){
    const x = n === 1 ? 150 : x0 + (x1 - x0) * i / (n - 1), y = gy + 50;
    const back = 30 + Math.min(100, s.pct) * .7;
    add('<rect x="' + (x - 16) + '" y="' + (y - 48 - back) + '" width="32" height="' + (back + 14) + '" rx="5" fill="' + shade(s.yours ? '#5a3a14' : '#2a2420', Math.max(.6, dayK)) + '"' + (s.yours ? ' stroke="#f5b301" stroke-width="1.6"' : '') + '/>');
    add(person(x, y, {shirt: s.yours ? (S.p && S.p.job ? '#ece7dc' : '#3c79c4') : ['#20242c', '#2f3d5c', '#3a3f48', '#4a3a5c', '#2c3a2f'][i % 5],
      tie: true, skin: ['#5a3b27', '#4a3020', '#7d573b'][i % 3], scale: Z, grey: !s.yours && i % 3 === 2}));
    /* a hand up for the open resolution; arms folded against it */
    if (s.vote === 'for') add('<path d="M' + (x + 12) + ' ' + (y - 58) + ' l7 -38" stroke="' + (s.yours ? '#ece7dc' : '#20242c') + '" stroke-width="6.4" stroke-linecap="round"/><circle cx="' + (x + 19.5) + '" cy="' + (y - 99) + '" r="4.6" fill="' + ['#5a3b27', '#4a3020', '#7d573b'][i % 3] + '"/>');
    if (s.vote === 'against') add('<path d="M' + (x - 12) + ' ' + (y - 44) + ' h24" stroke="' + shade('#111', 1) + '" stroke-width="6" stroke-linecap="round" opacity=".7"/>');
    if (s.chair) add('<path d="M' + (x - 9) + ' ' + (y - 58 - back) + ' l4.5 -9 l4.5 6 l4.5 -6 l4.5 9z" fill="#f5b301"/>');
  });
  add('<path d="M6 ' + (gy + 30) + ' H300 L344 ' + (gy + 92) + ' H-40Z" fill="' + wood + '"/><path d="M-40 ' + (gy + 92) + ' H344 V' + (gy + 104) + ' H-40Z" fill="' + shade('#4a3020', Math.max(.6, dayK)) + '"/>');
  add('<path d="M40 ' + (gy + 40) + ' H280" stroke="#fff" stroke-opacity=".08" stroke-width="4"/>');
  for (let i = 0; i < Math.max(1, n); i++) add('<rect x="' + (40 + i * 46) + '" y="' + (gy + 52 + (i % 2) * 10) + '" width="24" height="16" fill="#f4f1e6" transform="rotate(' + (i % 2 ? 5 : -4) + ' ' + (52 + i * 46) + ' ' + (gy + 60) + ')"/>');
  if (st.res) add('<rect x="120" y="' + (gy - 146) + '" width="100" height="16" rx="3" fill="#0b1017" opacity=".8"/><text x="170" y="' + (gy - 135) + '" font-family="sans-serif" font-size="8" font-weight="700" text-anchor="middle" fill="#f5b301">VOTE: ' + esc(String(st.res).toUpperCase().slice(0, 20)) + '</text>');
  return k.finish('boardscene', st.label || 'The boardroom');
}
