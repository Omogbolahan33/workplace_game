/* =========================================================================
   Your city (VISUAL.md, M8)
   ========================================================================= */
/* Net worth is a number; a life's worth of it is a footprint. Behind the money
   screens is Lagos from above - the lagoon, the islands, the Lekki peninsula,
   the Atlantic - and on it, everything you own where it stands: your home in a
   neighbourhood that fits it, each company where its trade lives and every
   branch it has opened, land out on the peninsula, a rental in Ogba, money at
   the banks on Marina. Each pin is as big as what stands behind it. A drifting
   life is one pin; a built one covers the city. Nothing is random: where a
   branch stands is read from its own id. */
const LAGOS_AREAS = {
  'Ikeja':[112, 92], 'Ogba':[150, 62], 'Ikorodu':[300, 66], 'Gbagada':[166, 128], 'Mushin':[58, 156], 'Yaba':[120, 180],
  'Surulere':[62, 216], 'Apapa':[60, 318], 'Lagos Island':[132, 280], 'Marina':[94, 296], 'Ikoyi':[172, 274], 'Banana Island':[214, 262],
  'Victoria Island':[160, 322], 'Lekki':[236, 318], 'Ajah':[310, 326], 'Ibeju-Lekki':[352, 314]
};
const HOME_AREAS = ['Yaba', 'Gbagada', 'Lekki', 'Banana Island'];
const TRADE_AREAS = {retail:'Lagos Island', food:'Surulere', logi:'Apapa', tech:'Yaba', agri:'Ikorodu', estate:'Lekki',
  creative:'Victoria Island', mfg:'Ikeja', proserv:'Victoria Island', energy:'Ikeja'};
const BRANCH_AREAS = ['Ikeja', 'Surulere', 'Lekki', 'Ajah', 'Yaba', 'Gbagada', 'Victoria Island', 'Ogba', 'Ikoyi', 'Mushin'];
function cityLook(){
  const air = homeLook();
  /** @type {Array<{kind:string, area:string, value:number, label:string, decline?:boolean, size?:number}>} */
  const pins = [];
  let elsewhere = 0;
  const value = function(v){ return Math.max(0, v || 0); };
  pins.push({kind: 'home', area: HOME_AREAS[air.tier - 1], value: Math.max(1, (S.fin.budget || {}).housing || 0) * 120, label: 'Home'});
  bizList().forEach(function(b){
    const hq = TRADE_AREAS[b.type] || 'Ikeja';
    pins.push({kind: 'company', area: hq, value: value(b.revenue) * 4 + value(b.cash), label: b.name || 'Your company', decline: bizStage(b) === 'decline'});
    (b.outlets || []).slice(1).forEach(function(o){
      if(o.city && o.city !== S.city){ elsewhere++; return; }
      let h = 0; for(let i = 0; i < o.id.length; i++) h = (h * 31 + o.id.charCodeAt(i)) >>> 0;
      const free = BRANCH_AREAS.filter(function(a){ return a !== hq; });
      pins.push({kind: o.status === 'building' ? 'site' : 'branch', area: free[h % free.length], value: value(o.revenue) * 4 + 1, label: o.name});
    });
  });
  let money = 0;
  (S.assets || []).forEach(function(a){
    if(a.id === 'land') pins.push({kind: 'land', area: 'Ibeju-Lekki', value: value(a.value), label: 'Land'});
    else if(a.id === 'rental') pins.push({kind: 'rental', area: 'Ogba', value: value(a.value), label: 'Rental property'});
    else money += value(a.value);
  });
  money += value(S.fin.cash);
  if(money > 0) pins.push({kind: 'money', area: 'Marina', value: money, label: 'Money in the bank and the markets'});
  /* the biggest holding is the biggest pin; a pin is never smaller than you can see */
  const top = Math.max.apply(null, pins.map(function(p){ return p.value; }).concat([1]));
  pins.forEach(function(p){ p.size = 7 + 13 * Math.sqrt(Math.min(1, p.value / top)); });
  return {city: S.city, time: air.time, era: air.era, pins: pins, elsewhere: elsewhere,
    label: 'Your Lagos: ' + pins.length + ' place' + (pins.length === 1 ? '' : 's') + ' you own or run' + (elsewhere ? ', and ' + elsewhere + ' elsewhere' : '')};
}
function citySceneSVG(st, vh){
  const W = 390, H = 420, VH = Math.max(H, Math.round(vh || H)), TOP = H - VH, night = st.time === 'night', dusk = st.time === 'dusk';
  const land = night ? '#262b36' : dusk ? '#b49a7e' : '#d8cdb3', land2 = night ? '#2e3442' : dusk ? '#c2a98b' : '#e3d9c2';
  const water = night ? '#16233a' : dusk ? '#55708a' : '#76abc9', ocean = night ? '#0f1a2e' : dusk ? '#3f5f7d' : '#4f8ab3';
  const ink = night ? '#c9d2de' : '#3b3326', road = night ? '#5b6475' : '#b9a98a';
  const out = [];
  out.push('<rect x="0" y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="' + land + '"/>');
  /* the lagoon and the harbour, then the islands, the peninsula and the sea */
  out.push('<path d="M150 150 Q210 130 260 112 Q330 96 390 104 V300 H330 Q300 296 270 300 Q235 300 205 298 Q190 290 182 296 Q160 300 150 302 Q140 296 132 300 Q120 300 106 304 Q96 306 90 300 Q80 296 70 302 L40 300 Q30 290 0 296 V262 Q40 258 80 262 Q100 262 118 250 Q130 230 132 200 Q138 170 150 150Z" fill="' + water + '"/>');
  out.push('<path d="M96 276 Q112 268 140 272 Q150 280 146 296 Q126 302 104 298 Q92 290 96 276Z" fill="' + land2 + '"/>');                 // Lagos Island
  out.push('<path d="M148 266 Q176 256 200 264 Q206 278 196 292 Q172 296 152 290 Q146 278 148 266Z" fill="' + land2 + '"/>');              // Ikoyi
  out.push('<ellipse cx="214" cy="262" rx="12" ry="6" fill="' + land2 + '"/>');                                                          // Banana Island
  out.push('<path d="M128 306 Q170 300 230 304 Q300 306 390 300 V352 Q300 350 220 352 Q160 352 130 346 Q118 330 128 306Z" fill="' + land2 + '"/>');   // VI and the peninsula
  out.push('<path d="M20 304 Q50 300 84 308 Q90 326 78 340 Q50 344 22 338Z" fill="' + land + '"/>');                                       // Apapa
  out.push('<rect x="0" y="352" width="' + W + '" height="' + (H - 352) + '" fill="' + ocean + '"/><path d="M0 352 Q100 346 200 352 T390 350" stroke="' + (night ? '#2a3a55' : '#f0e2bf') + '" stroke-width="4" fill="none"/>');
  /* the roads that hold it together: Third Mainland, the link bridge, the expressways */
  out.push('<path d="M124 206 Q116 238 120 276" stroke="' + road + '" stroke-width="3.2" fill="none"/><path d="M196 288 L214 308" stroke="' + road + '" stroke-width="2.6"/>' +
    '<path d="M150 62 L112 92 L120 180 L118 276 M120 180 L62 216 L60 318 M166 128 L120 180 M160 322 L390 326" stroke="' + road + '" stroke-width="1.6" fill="none" opacity=".75"/>');
  /* the city's lights at night, fewer when the grid is down */
  if(night){ let s = 7; const rnd = function(){ return (s = (s * 9301 + 49297) % 233280) / 233280; }; let dots = '';
    for(let i = 0; i < 180; i++){ const x = rnd() * W, y = TOP + rnd() * (300 - TOP); if(rnd() < .35) dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r=".9" fill="#ffd27a" opacity=".7"/>'; }
    out.push(dots); }
  /* the neighbourhoods, named */
  Object.keys(LAGOS_AREAS).forEach(function(a){ const p = LAGOS_AREAS[a]; out.push('<text x="' + p[0] + '" y="' + (p[1] + 18) + '" font-family="sans-serif" font-size="8" text-anchor="middle" fill="' + ink + '" opacity=".75">' + esc(a) + '</text>'); });
  out.push('<text x="300" y="200" font-family="Georgia,serif" font-style="italic" font-size="11" text-anchor="middle" fill="' + (night ? '#5f7a9c' : '#e8f1f7') + '">Lagos Lagoon</text>' +
    '<text x="300" y="384" font-family="Georgia,serif" font-style="italic" font-size="11" text-anchor="middle" fill="' + (night ? '#5f7a9c' : '#e8f1f7') + '">Atlantic Ocean</text>');
  /* what you own, where it stands: several things in one area sit side by side */
  const used = {};
  const glyph = function(kind, r){
    const g = {home: 'M-5 1 L0 -4 L5 1 V5 H-5Z', company: 'M-5 -2 H5 V5 H-5Z M-6 -2 L-3 -6 H3 L6 -2', branch: 'M-4 -1 H4 V4 H-4Z M-5 -1 L-2 -4 H2 L5 -1',
      site: 'M-5 5 L0 -5 L5 5 M-3 1 H3', land: 'M-3 5 V-5 L4 -2 L-3 1', rental: 'M-4 -5 H4 V5 H-4Z M-2 -3 h1 M1 -3 h1 M-2 0 h1 M1 0 h1', money: 'M-5 4 H5 M-4 3 V-2 M0 3 V-2 M4 3 V-2 M-6 -2 L0 -6 L6 -2Z'}[kind] || 'M-3 -3 H3 V3 H-3Z';
    return '<path d="' + g + '" transform="scale(' + (r / 9).toFixed(2) + ')" fill="none" stroke="#1a1405" stroke-width="1.7" stroke-linejoin="round"/>';
  };
  (st.pins || []).forEach(function(p){
    const base = LAGOS_AREAS[p.area]; if(!base) return;
    const n = used[p.area] = (used[p.area] || 0) + 1, dx = (n - 1) * (p.size * 1.6) * (n % 2 ? 1 : -1);
    const x = base[0] + dx, y = base[1] - p.size * .2, r = p.size;
    const col = p.kind === 'home' ? '#f5b301' : p.kind === 'money' ? '#2fd47a' : p.kind === 'land' || p.kind === 'rental' ? '#5aa9ff' : p.decline ? '#ff9f43' : '#f2f4f7';
    out.push('<g><title>' + esc(p.label + ' · ' + p.area) + '</title>' +
      '<ellipse cx="' + x.toFixed(1) + '" cy="' + (y + r * .9).toFixed(1) + '" rx="' + (r * .7).toFixed(1) + '" ry="' + (r * .22).toFixed(1) + '" fill="#000" opacity=".25"/>' +
      '<path d="M' + x.toFixed(1) + ' ' + (y + r * .9).toFixed(1) + ' l' + (-r * .45).toFixed(1) + ' ' + (-r * .7).toFixed(1) + ' a' + (r * .62).toFixed(1) + ' ' + (r * .62).toFixed(1) + ' 0 1 1 ' + (r * .9).toFixed(1) + ' 0z" fill="' + col + '" stroke="#0b1017" stroke-width="1"/>' +
      '<g transform="translate(' + x.toFixed(1) + ' ' + (y - r * .25).toFixed(1) + ')">' + glyph(p.kind, r) + '</g></g>');
  });
  if(st.elsewhere) out.push('<g transform="translate(' + (W - 78) + ' ' + (TOP + 12) + ')"><rect width="70" height="18" rx="9" fill="#0b1017" opacity=".75"/><text x="35" y="12.5" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#f5b301">+' + st.elsewhere + ' in other cities</text></g>');
  return '<svg class="cityscene" viewBox="0 ' + TOP + ' ' + W + ' ' + VH + '" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(st.label || 'Your city') + '">' + out.join('') + '</svg>';
}
