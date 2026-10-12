/* =========================================================================
   Your city (VISUAL.md, M8 and M10)
   ========================================================================= */
/* Net worth is a number; a life's worth of it is a footprint. Behind the money
   screens is your city from above - its water, its neighbourhoods named - and
   on it, everything you own where it stands: your home in a neighbourhood that
   fits it, each company where its trade lives and every branch it has opened,
   land at the edge of town, a rental, money where the banks are. Each pin is
   as big as what stands behind it. A drifting life is one pin; a built one
   covers the city. Nothing is random: where a branch stands is read from its
   own id.

   Each city is a map in CITY_MAPS: its water and land as shapes, its roads,
   where its neighbourhoods lie, which of them each kind of home and trade
   belongs to, and where land, rentals and money go. Simplified, not surveyed:
   it is the city a resident would draw on a napkin. */
const CITY_MAPS = {
  lagos: {
    areas: {'Ikeja':[112, 92], 'Ogba':[150, 62], 'Ikorodu':[300, 66], 'Gbagada':[166, 128], 'Mushin':[58, 156], 'Yaba':[120, 180],
      'Surulere':[62, 216], 'Apapa':[60, 318], 'Lagos Island':[132, 280], 'Marina':[94, 296], 'Ikoyi':[172, 274], 'Banana Island':[214, 262],
      'Victoria Island':[160, 322], 'Lekki':[236, 318], 'Ajah':[310, 326], 'Ibeju-Lekki':[352, 314]},
    homes: ['Yaba', 'Gbagada', 'Lekki', 'Banana Island'],
    trades: {retail:'Lagos Island', food:'Surulere', logi:'Apapa', tech:'Yaba', agri:'Ikorodu', estate:'Lekki', creative:'Victoria Island', mfg:'Ikeja', proserv:'Victoria Island', energy:'Ikeja'},
    branches: ['Ikeja', 'Surulere', 'Lekki', 'Ajah', 'Yaba', 'Gbagada', 'Victoria Island', 'Ogba', 'Ikoyi', 'Mushin'],
    land: 'Ibeju-Lekki', rental: 'Ogba', money: 'Marina',
    shapes: [
      ['water', 'M150 150 Q210 130 260 112 Q330 96 390 104 V300 H330 Q300 296 270 300 Q235 300 205 298 Q190 290 182 296 Q160 300 150 302 Q140 296 132 300 Q120 300 106 304 Q96 306 90 300 Q80 296 70 302 L40 300 Q30 290 0 296 V262 Q40 258 80 262 Q100 262 118 250 Q130 230 132 200 Q138 170 150 150Z'],
      ['land2', 'M96 276 Q112 268 140 272 Q150 280 146 296 Q126 302 104 298 Q92 290 96 276Z'], ['land2', 'M148 266 Q176 256 200 264 Q206 278 196 292 Q172 296 152 290 Q146 278 148 266Z'],
      ['land2', 'M202 262 a12 6 0 1 0 24 0 a12 6 0 1 0 -24 0Z'], ['land2', 'M128 306 Q170 300 230 304 Q300 306 390 300 V352 Q300 350 220 352 Q160 352 130 346 Q118 330 128 306Z'],
      ['land', 'M20 304 Q50 300 84 308 Q90 326 78 340 Q50 344 22 338Z'], ['ocean', 'M0 352 Q100 346 200 352 T390 350 V420 H0Z']],
    roads: [['M124 206 Q116 238 120 276', 3.2], ['M196 288 L214 308', 2.6], ['M150 62 L112 92 L120 180 L118 276 M120 180 L62 216 L60 318 M166 128 L120 180 M160 322 L390 326', 1.6]],
    names: [[300, 200, 'Lagos Lagoon'], [300, 384, 'Atlantic Ocean']]
  },
  abuja: {
    areas: {'Kubwa':[70, 60], 'Gwarinpa':[120, 104], 'Jabi':[118, 176], 'Maitama':[214, 140], 'Wuse':[184, 196], 'Central Business District':[236, 226],
      'Asokoro':[306, 250], 'Garki':[202, 278], 'Idu':[56, 240], 'Lugbe':[112, 336], 'Lokogoma':[232, 352], 'Nyanya':[346, 318], 'Kuje':[60, 392]},
    homes: ['Nyanya', 'Gwarinpa', 'Wuse', 'Maitama'],
    trades: {retail:'Wuse', food:'Garki', logi:'Lugbe', tech:'Jabi', agri:'Kubwa', estate:'Lokogoma', creative:'Wuse', mfg:'Idu', proserv:'Central Business District', energy:'Idu'},
    branches: ['Wuse', 'Garki', 'Gwarinpa', 'Jabi', 'Kubwa', 'Lugbe', 'Maitama', 'Lokogoma', 'Nyanya'],
    land: 'Kuje', rental: 'Gwarinpa', money: 'Central Business District',
    shapes: [['water', 'M86 196 q30 -20 56 2 q8 22 -24 26 q-34 -2 -32 -28Z'], ['rock', 'M300 236 q20 -60 62 -66 q30 8 34 66Z']],
    roads: [['M70 60 L120 104 L184 196 L236 226 L306 250 M184 196 L202 278 L232 352 M120 104 L118 176 L184 196 M202 278 L112 336 M236 226 L346 318', 2.2]],
    names: [[112, 236, 'Jabi Lake'], [348, 214, 'Aso Rock']]
  },
  accra: {
    areas: {'Achimota':[120, 116], 'Dzorwulu':[190, 140], 'Madina':[296, 78], 'Adenta':[350, 112], 'East Legon':[286, 156], 'Airport Residential':[214, 194],
      'Kaneshie':[80, 236], 'Ridge':[160, 262], 'Cantonments':[236, 246], 'Spintex':[330, 226], 'Makola':[112, 292], 'Osu':[196, 300], 'Labadi':[256, 314], 'Tema':[372, 272], 'Kasoa':[24, 316]},
    homes: ['Madina', 'Achimota', 'East Legon', 'Cantonments'],
    trades: {retail:'Makola', food:'Osu', logi:'Tema', tech:'Airport Residential', agri:'Adenta', estate:'East Legon', creative:'Osu', mfg:'Tema', proserv:'Ridge', energy:'Spintex'},
    branches: ['Osu', 'East Legon', 'Spintex', 'Kaneshie', 'Achimota', 'Madina', 'Labadi', 'Dzorwulu', 'Adenta'],
    land: 'Kasoa', rental: 'Spintex', money: 'Ridge',
    shapes: [['ocean', 'M0 340 Q60 330 120 336 Q200 344 260 334 Q330 326 390 312 V420 H0Z'], ['water', 'M84 318 q20 -8 34 4 q-6 12 -30 8Z']],
    roads: [['M24 316 L80 236 L120 116 L190 140 L286 156 L350 112 M80 236 L160 262 L236 246 L330 226 L372 272 M190 140 L214 194 L236 246 M112 292 L196 300 L256 314', 2]],
    names: [[200, 376, 'Gulf of Guinea'], [96, 344, 'Korle Lagoon']]
  },
  nairobi: {
    areas: {'Ruaka':[110, 44], 'Runda':[176, 70], 'Kasarani':[296, 86], 'Westlands':[140, 160], 'Lavington':[88, 208], 'Kileleshwa':[130, 210], 'Eastleigh':[252, 182],
      'CBD':[196, 218], 'Kilimani':[136, 248], 'Upper Hill':[184, 258], 'Industrial Area':[246, 270], 'South B':[262, 304], 'Embakasi':[330, 298], 'Karen':[70, 344], 'Kitengela':[334, 392]},
    homes: ['Kasarani', 'South B', 'Kilimani', 'Karen'],
    trades: {retail:'Eastleigh', food:'Westlands', logi:'Embakasi', tech:'Kilimani', agri:'Kitengela', estate:'Ruaka', creative:'Westlands', mfg:'Industrial Area', proserv:'Upper Hill', energy:'Industrial Area'},
    branches: ['Westlands', 'Kilimani', 'Eastleigh', 'Kasarani', 'South B', 'Ruaka', 'Lavington', 'Embakasi', 'Karen'],
    land: 'Kitengela', rental: 'South B', money: 'CBD',
    shapes: [['green', 'M130 330 Q200 300 300 336 Q320 370 260 380 Q170 384 130 330Z'], ['green', 'M150 96 q30 -28 70 -6 q6 22 -30 30 q-34 4 -40 -24Z'], ['river', 'M0 196 Q90 186 160 200 Q220 212 280 200 T390 214']],
    roads: [['M110 44 L140 160 L196 218 L252 182 L296 86 M196 218 L184 258 L136 248 L88 208 M184 258 L246 270 L330 298 M136 248 L70 344 M246 270 L262 304', 2]],
    names: [[214, 352, 'Nairobi National Park'], [186, 82, 'Karura Forest']]
  },
  ldn: {
    areas: {'Tottenham':[222, 42], 'Camden':[136, 92], 'Islington':[192, 106], 'Hackney':[252, 104], 'Stratford':[334, 120], 'Ealing':[22, 168], 'Shoreditch':[236, 152],
      'Mayfair':[110, 186], 'City':[204, 196], 'Kensington':[56, 214], 'Westminster':[128, 232], 'Canary Wharf':[300, 236], 'Brixton':[150, 304], 'Peckham':[228, 300], 'Lewisham':[290, 332], 'Croydon':[176, 392]},
    homes: ['Tottenham', 'Peckham', 'Islington', 'Kensington'],
    trades: {retail:'Brixton', food:'Peckham', logi:'Ealing', tech:'Shoreditch', agri:'Croydon', estate:'Stratford', creative:'Shoreditch', mfg:'Ealing', proserv:'City', energy:'Croydon'},
    branches: ['Camden', 'Hackney', 'Brixton', 'Peckham', 'Islington', 'Shoreditch', 'Stratford', 'Lewisham', 'Croydon', 'Ealing'],
    land: 'Croydon', rental: 'Lewisham', money: 'City',
    shapes: [['river', 'M0 246 Q50 238 96 256 Q140 272 176 236 Q206 214 236 232 Q262 250 272 270 Q286 290 310 272 Q326 252 300 240 Q290 226 320 222 Q360 220 390 244']],
    roads: [['M22 168 L136 92 L192 106 L252 104 L334 120 M110 186 L204 196 L300 236 M128 232 L150 304 L176 392 M204 196 L228 300 L290 332 M192 106 L222 42', 1.8]],
    names: [[64, 262, 'River Thames']]
  },
  nyc: {
    areas: {'Bronx':[262, 46], 'Harlem':[196, 96], 'Upper West Side':[166, 146], 'Upper East Side':[214, 156], 'Astoria':[294, 150], 'Flushing':[368, 176], 'Hoboken':[96, 222],
      'Midtown':[196, 214], 'Long Island City':[276, 214], 'Chelsea':[176, 254], 'Williamsburg':[268, 272], 'Bushwick':[330, 282], 'Jersey City':[86, 300],
      'Financial District':[194, 324], 'Brooklyn Heights':[244, 330], 'Bed-Stuy':[310, 334], 'Staten Island':[110, 400]},
    homes: ['Bronx', 'Bushwick', 'Brooklyn Heights', 'Upper East Side'],
    trades: {retail:'Midtown', food:'Williamsburg', logi:'Long Island City', tech:'Chelsea', agri:'Staten Island', estate:'Jersey City', creative:'Chelsea', mfg:'Long Island City', proserv:'Financial District', energy:'Astoria'},
    branches: ['Midtown', 'Williamsburg', 'Astoria', 'Harlem', 'Bushwick', 'Chelsea', 'Flushing', 'Bed-Stuy', 'Hoboken'],
    land: 'Staten Island', rental: 'Astoria', money: 'Financial District',
    shapes: [['water', 'M128 0 H150 Q156 120 152 220 Q148 300 158 352 H120 Q126 280 126 200 Q124 100 128 0Z'], ['water', 'M240 100 Q232 180 236 250 Q240 300 222 352 H244 Q262 290 258 240 Q254 170 262 100Z'],
      ['water', 'M190 70 Q220 66 262 92 V104 Q220 80 190 82Z'], ['ocean', 'M0 352 H390 V372 Q300 368 260 376 Q200 372 150 380 Q90 372 0 380Z']],
    roads: [['M196 96 L166 146 L196 214 L176 254 L194 324 M214 156 L196 214 M276 214 L268 272 L244 330 M268 272 L330 282 L310 334 M294 150 L368 176', 1.8]],
    names: [[136, 160, 'Hudson'], [246, 196, 'East River']]
  }
};
function cityLook(){
  const air = homeLook(), M = CITY_MAPS[S.city] || CITY_MAPS.lagos;
  /** @type {Array<{kind:string, area:string, value:number, label:string, decline?:boolean, size?:number}>} */
  const pins = [];
  let elsewhere = 0;
  const value = function(v){ return Math.max(0, v || 0); };
  pins.push({kind: 'home', area: M.homes[air.tier - 1], value: Math.max(1, (S.fin.budget || {}).housing || 0) * 120, label: 'Home'});
  bizList().forEach(function(b){
    const hq = M.trades[b.type] || M.branches[0];
    pins.push({kind: 'company', area: hq, value: value(b.revenue) * 4 + value(b.cash), label: b.name || 'Your company', decline: bizStage(b) === 'decline'});
    (b.outlets || []).slice(1).forEach(function(o){
      if(o.city && o.city !== S.city){ elsewhere++; return; }
      let h = 0; for(let i = 0; i < o.id.length; i++) h = (h * 31 + o.id.charCodeAt(i)) >>> 0;
      const free = M.branches.filter(function(a){ return a !== hq; });
      pins.push({kind: o.status === 'building' ? 'site' : 'branch', area: free[h % free.length], value: value(o.revenue) * 4 + 1, label: o.name});
    });
  });
  let money = 0;
  (S.assets || []).forEach(function(a){
    if(a.id === 'land') pins.push({kind: 'land', area: M.land, value: value(a.value), label: 'Land'});
    else if(a.id === 'rental') pins.push({kind: 'rental', area: M.rental, value: value(a.value), label: 'Rental property'});
    else money += value(a.value);
  });
  money += value(S.fin.cash);
  if(money > 0) pins.push({kind: 'money', area: M.money, value: money, label: 'Money in the bank and the markets'});
  /* the biggest holding is the biggest pin; a pin is never smaller than you can see */
  const top = Math.max.apply(null, pins.map(function(p){ return p.value; }).concat([1]));
  pins.forEach(function(p){ p.size = 7 + 13 * Math.sqrt(Math.min(1, p.value / top)); });
  return {city: S.city, time: air.time, era: air.era, pins: pins, elsewhere: elsewhere,
    label: 'Your ' + CITY().label + ': ' + pins.length + ' place' + (pins.length === 1 ? '' : 's') + ' you own or run' + (elsewhere ? ', and ' + elsewhere + ' elsewhere' : '')};
}
function citySceneSVG(st, vh){
  const M = CITY_MAPS[st.city] || CITY_MAPS.lagos;
  const W = 390, H = 420, VH = Math.max(H, Math.round(vh || H)), TOP = H - VH, night = st.time === 'night', dusk = st.time === 'dusk';
  /** @type {Object<string, string>} */
  const fill = {
    land: night ? '#262b36' : dusk ? '#b49a7e' : '#d8cdb3', land2: night ? '#2e3442' : dusk ? '#c2a98b' : '#e3d9c2',
    water: night ? '#16233a' : dusk ? '#55708a' : '#76abc9', ocean: night ? '#0f1a2e' : dusk ? '#3f5f7d' : '#4f8ab3',
    green: night ? '#22302a' : dusk ? '#8a9a6e' : '#a9c08a', rock: night ? '#3a3633' : dusk ? '#8c7a6a' : '#a08c78'
  };
  const ink = night ? '#c9d2de' : '#3b3326', road = night ? '#5b6475' : '#b9a98a', wname = night ? '#5f7a9c' : '#e8f1f7';
  const out = [];
  out.push('<rect x="0" y="' + TOP + '" width="' + W + '" height="' + VH + '" fill="' + fill.land + '"/>');
  /* the water and the land, the parks and the rock */
  M.shapes.forEach(function(sh){
    if(sh[0] === 'river') out.push('<path d="' + sh[1] + '" stroke="' + fill.water + '" stroke-width="13" fill="none" stroke-linecap="round"/>');
    else out.push('<path d="' + sh[1] + '" fill="' + fill[sh[0]] + '"/>');
  });
  /* the roads that hold it together */
  M.roads.forEach(function(r){ out.push('<path d="' + r[0] + '" stroke="' + road + '" stroke-width="' + r[1] + '" fill="none" opacity=".8"/>'); });
  /* the city's lights at night */
  if(night){ let s = 7; const rnd = function(){ return (s = (s * 9301 + 49297) % 233280) / 233280; }; let dots = '';
    for(let i = 0; i < 180; i++){ const x = rnd() * W, y = TOP + rnd() * (300 - TOP); if(rnd() < .35) dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r=".9" fill="#ffd27a" opacity=".7"/>'; }
    out.push(dots); }
  /* the neighbourhoods and the water, named */
  Object.keys(M.areas).forEach(function(a){ const p = M.areas[a]; out.push('<text x="' + p[0] + '" y="' + (p[1] + 18) + '" font-family="sans-serif" font-size="8" text-anchor="middle" fill="' + ink + '" opacity=".75">' + esc(a) + '</text>'); });
  M.names.forEach(function(n){ out.push('<text x="' + n[0] + '" y="' + n[1] + '" font-family="Georgia,serif" font-style="italic" font-size="11" text-anchor="middle" fill="' + wname + '">' + esc(n[2]) + '</text>'); });
  /* what you own, where it stands: several things in one area sit side by side */
  /** @type {Object<string, number>} */
  const used = {};
  const glyph = function(kind, r){
    const g = {home: 'M-5 1 L0 -4 L5 1 V5 H-5Z', company: 'M-5 -2 H5 V5 H-5Z M-6 -2 L-3 -6 H3 L6 -2', branch: 'M-4 -1 H4 V4 H-4Z M-5 -1 L-2 -4 H2 L5 -1',
      site: 'M-5 5 L0 -5 L5 5 M-3 1 H3', land: 'M-3 5 V-5 L4 -2 L-3 1', rental: 'M-4 -5 H4 V5 H-4Z M-2 -3 h1 M1 -3 h1 M-2 0 h1 M1 0 h1', money: 'M-5 4 H5 M-4 3 V-2 M0 3 V-2 M4 3 V-2 M-6 -2 L0 -6 L6 -2Z'}[kind] || 'M-3 -3 H3 V3 H-3Z';
    return '<path d="' + g + '" transform="scale(' + (r / 9).toFixed(2) + ')" fill="none" stroke="#1a1405" stroke-width="1.7" stroke-linejoin="round"/>';
  };
  (st.pins || []).forEach(function(p){
    const base = M.areas[p.area]; if(!base) return;
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
