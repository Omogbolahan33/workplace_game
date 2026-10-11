/* =========================================================================
   Moments: every decision, as a picture of where it happens (VISUAL.md, M5)
   ========================================================================= */
/* An event is a moment in a place with people in it: the wedding is the
   canopies of an event hall, your father's blood pressure is the general
   hospital, the roadblock is a plank across the road and a man in uniform.
   Each event, story arc and black swan names its place, who is there and what
   is in hand; the picture is drawn with the same kit as your home and work,
   under the same sky. When the story is somebody's, the somebody is them, in
   their own colours. Nothing in the picture is random. */
const MOMENTS = {
  /* life */
  wedding:['hall','couple crowd','fabric cash'], parents:['hospital','elder doctor','cash'], japa:['airport','','suitcase letter'],
  angel:['office','investor','laptop cash'], scam:['street','investor','cash letter'], marry:['home','love','fabric'],
  lend:['home','friend','cash'], bribe:['street','police police','roadblock cash'], fees:['school','kids','letter cash'],
  levy:['home','official','letter'], health:['hospital','doctor',''], burnout:['home','','laptop'], theft:['street','thief','phone'],
  mentor:['office','mentor',''], sidegig:['work','','laptop cash'], tithe:['church','pastor crowd','letter'],
  distressed:['land','seller','letter'], taxletter:['office:REVENUE SERVICE','official','letter'], relative:['home','cousin','suitcase'],
  windfall:['bank','','cash letter'], network_event:['hall','suits','phone'], carbreak:['street','mechanic','carbroken'],
  omoland:['land','landgrab landgrab landgrab','sand'], bail:['street:POLICE DIVISION','police family','cash'],
  titletaker:['hall','elder crowd','title'], burial:['hall','mourners','photo'], rentyear:['home','landlord','cash'],
  scare:['hospital','doctor','letter'], oldfriend:['office','friend','car'], runforoffice:['hall','crowd crowd','poster'],
  inheritance:['court','lawyer','letter'], schoolfees:['school','kids','cash'], preapproved:['bank','','phone'],
  fxwindow:['bank','','cash'], lifecover:['home','spouse kids','letter'], pension:['office:PENSION COMMISSION','official','letter'],
  bubble:['news','',''],
  /* business */
  bigorder:['work','client','boxes letter'], viral:['work','crowd','camera'], poach:['work','staff','phone'],
  thief:['work','staff','letter'], regulate:['work','official official','letter'], rentshock:['work','landlord','letter'],
  power:['work','staff','spark'], competitor:['work','rivalshop',''], tender:['office','official','letter'],
  investor:['boardroom','investor investor',''], staffraise:['work','staff staff staff','letter'], supplier:['work','supplier','boxes'],
  fxhit:['news','',''], recall:['work','customer','boxes'], deadbeat:['work','','phone letter'], copycat:['market','',''],
  landlord:['work','landlord','letter'], powerout:['work','staff','gen'], japastaff:['airport','staff staff','suitcase'],
  sidehustle:['work','staff','boxes'], badreview:['work','','phone'], certs:['office','official','cert'],
  bulkbuy:['market','supplier','boxes'], familystaff:['work','cousin',''], posloan:['bank','','phone cash'],
  assoclevy:['market','official','letter'], diaspora:['airport','investor','letter'],
  /* the story arcs: the person is whoever the story is with */
  'arc:container':['market','cast','boxes'], 'arc:familyland':['land','cast','sand'], 'arc:thedoor':['office','cast',''],
  'arc:undercut':['work','cast','rivalshop'], 'arc:thefile':['office','cast','letter'], 'arc:theline':['bank','cast','letter'],
  'arc:thecousin':['home','cast','suitcase'], 'arc:thetitle':['hall','cast crowd','title'], 'arc:theask':['home','cast','fabric'],
  'arc:theexit':['boardroom','cast investor','letter'], 'arc:thecrash':['news','',''], 'arc:tender':['office','cast','letter'],
  'arc:whale':['work','client','letter'], 'arc:partnerwar':['boardroom','investor','letter'], 'arc:secondfloor':['work','','boxes'],
  'arc:newline':['work','staff','boxes'], 'arc:crunch':['bank','cast','letter'], 'arc:audit':['office:REVENUE SERVICE','official','letter'],
  'arc:keyperson':['work','staff',''], 'arc:exitsale':['boardroom','investor investor','letter'], 'arc:disaster':['work','staff','fire'],
  'arc:export':['work','client','boxes'], 'arc:formalise':['office','official','cert'], 'arc:supply':['work','cast','boxes'],
  'arc:fraud':['work','staff','letter'], 'arc:succession':['boardroom','family family',''],
  /* the black swans */
  'swan:pandemic':['street','masked masked masked',''], 'swan:bankrun':['bank','queue',''], 'swan:oilboom':['news','',''],
  'swan:fire':['work','staff','fire'], 'swan:nairacash':['bank','queue','cash'], 'swan:techhub':['news','',''],
  'swan:flood':['home','family','water'], 'swan:scandal':['news','','']
};
/* where an event the table does not name happens, by its kind */
const MOMENT_BY_CAT = {life:'home', biz:'work', money:'bank', health:'hospital', career:'office', invest:'bank'};
function momentOf(ev, thread){
  const key = thread && thread.arc ? 'arc:' + thread.arc : ev && ev.id;
  const row = MOMENTS[key] || (ev && ev.cat === 'biz' && /^(dir_|holder_|related_|nominee_|derivative_|secondary_|md_|investor_|deadlock_|covenant_)/.test(ev.id || '') ? ['boardroom','investor investor investor','letter'] : null) ||
    [MOMENT_BY_CAT[ev && ev.cat] || 'home', '', ''];
  const at = row[0].split(':');
  const cast = thread && thread.castId ? (S.cast || []).find(function(c){ return c.id === thread.castId; }) : null;
  /* the title is read only for the paper's headline: a governance event's title
     is worked out from the company, and the picture should not depend on it */
  return {place: at[0], sign: at[1] || '', who: row[1] ? row[1].split(' ') : [], props: row[2] ? row[2].split(' ') : [],
    cast: cast || null, title: at[0] === 'news' ? evText(ev || {title: ''}) : ''};
}
/* a hue as a colour the kit can shade */
function hueHex(h, s, l){
  const a = s * Math.min(l, 1 - l), f = function(n){ const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
/* the place, with the moment's people and things in front of it */
function momentSceneSVG(m, vh){
  const home = homeLook();
  const air = {time: home.time, season: home.season, era: home.era, grid: home.grid, age: home.age};
  /* the people and things, as a layer in the scene's own space */
  const overlay = function(k){
    const f1 = k.f1, shade = k.shade, person = k.person, gy = k.groundY, dayK = k.dayK;
    const L = [], add = function(s){ L.push(s); };
    /* the moment's people are its subject: drawn larger than the people who live in the place */
    const Z = 1.7;
    const spot = [[118, gy + 106], [282, gy + 104], [334, gy + 110], [70, gy + 112], [372, gy + 106], [30, gy + 104]];
    let n = 0;
    const at = function(){ return spot[Math.min(spot.length - 1, n++)]; };
    const look = {
      official:{shirt:'#3b3f46', tie:true, cap:'#2e3238'}, police:{shirt:'#1f2a44', legs:'#141b2d', cap:'#141b2d'}, landlord:{shirt:'#efe9dc', dress:true, cap:'#8a6a2c'},
      doctor:{shirt:'#f4f6f7', legs:'#3d5a80'}, pastor:{shirt:'#1b1b1e', legs:'#1b1b1e'}, investor:{shirt:'#20242c', legs:'#20242c', tie:true},
      suits:{shirt:'#2f3d5c', tie:true}, client:{shirt:'#26313f', tie:true}, mentor:{shirt:'#3a3f48', tie:true, grey:true}, lawyer:{shirt:'#141414', tie:true},
      seller:{shirt:'#8a6a46'}, supplier:{shirt:'#d98c1f'}, staff:{shirt:'#2f6fb3'}, customer:{shirt:'#c0392b'}, mechanic:{shirt:'#4a5a3a', legs:'#3a4a2a'},
      thief:{shirt:'#2b2b2b', cap:'#2b2b2b'}, elder:{shirt:'#efe9dc', dress:true, cap:'#b22222', grey:true}, friend:{shirt:'#3a7fcf'}, cousin:{shirt:'#e7b931'},
      love:{shirt:'#b8275f', dress:true, gele:'#d4a017'}, spouse:{shirt:'#b8275f', dress:true, gele:'#d4a017'}, family:{shirt:'#2fae6a', dress:true, gele:'#2fae6a'},
      landgrab:{shirt:'#5a4632', cap:'#2b2b2b'}, masked:{shirt:'#7f8c8d'}, mourners:{shirt:'#1b1b1e', dress:true, gele:'#f1f1f1'}
    };
    const who = m.who.slice();
    /* you, unless the moment is the world's */
    if (m.place !== 'news' && !/queue|masked/.test(who.join(' '))) { const p = [200, gy + 108]; add(person(p[0], p[1], {shirt: S.p && S.p.job ? '#ece7dc' : '#3c79c4', legs: '#20242c', tie: !!(S.p && S.p.job), scale: 1.35 * Z, grey: (S.p && S.p.age) >= 50})); }
    who.forEach(function(w, i){
      if (w === 'cast' && m.cast) { const L0 = castLook(m.cast), p = at(); add(person(p[0], p[1], {shirt: hueHex(L0.hue, .5, .58), skin: L0.skin, scale: 1.3 * Z, grey: m.cast.age >= 58})); return; }
      if (w === 'couple') { add(person(110, gy + 104, {shirt: '#f6f2ea', dress: true, gele: '#f6f2ea', skin: '#5a3b27', scale: 1.25 * Z}) + person(146, gy + 104, {shirt: '#efe4c8', dress: true, cap: '#b8860b', skin: '#4a3020', scale: 1.3 * Z})); return; }
      if (w === 'kids') { for (let j = 0; j < 3; j++) add(person(262 + j * 26, gy + 110, {shirt: '#e8eef5', legs: '#1f4e8c', skin: ['#5a3b27', '#7d573b', '#4a3020'][j], scale: .75 * Z})); return; }
      if (w === 'crowd' || w === 'queue') { for (let j = 0; j < 6; j++) add(person(w === 'queue' ? 120 + j * 22 : 40 + j * 54, gy + (w === 'queue' ? 100 : 70 + (j % 2) * 6), {shirt: ['#e7b931', '#3a7fcf', '#d64a3a', '#2fae6a', '#8e5bd1', '#f08a24'][j], dress: j % 3 === 1, gele: j % 3 === 1 ? '#d4a017' : null, skin: ['#5a3b27', '#7d573b', '#4a3020'][j % 3], scale: (w === 'queue' ? 1.15 : .95) * (w === 'queue' ? 1.4 : 1.15)})); return; }
      if (w === 'rivalshop') return;
      const o = look[w] || {shirt: '#6f56b3'}, p = at();
      add(person(p[0], p[1], Object.assign({skin: ['#5a3b27', '#4a3020', '#7d573b'][i % 3], scale: 1.25 * Z}, o)));
    });
    /* what is in hand */
    m.props.forEach(function(pr, i){
      const x = 218 + i * 10, y = gy + 62;
      /* what is in your hand is drawn at the size of your hand */
      const held = /^(cash|letter|cert|phone|camera|laptop|fabric|title)$/.test(pr);
      if (held) add('<g transform="translate(' + x + ' ' + y + ') scale(1.7) translate(' + (-x) + ' ' + (-y) + ')">');
      if (pr === 'cash') add('<g transform="translate(' + (x + 6) + ' ' + y + ') rotate(-10)">' + [0, 1, 2].map(function(j){ return '<rect x="' + (j * 2) + '" y="' + (-j * 3) + '" width="18" height="9" rx="1" fill="' + shade(['#2e8b57', '#c05a7a', '#3b6ea8'][j], dayK) + '" stroke="#fff" stroke-opacity=".35"/>'; }).join('') + '</g>');
      if (pr === 'letter' || pr === 'cert') add('<g transform="translate(' + (x + 4) + ' ' + (y - 2) + ') rotate(8)"><rect width="14" height="18" fill="' + shade('#f4f1e6', dayK) + '" stroke="#999" stroke-width=".5"/>' + (pr === 'cert' ? '<rect x="2" y="2" width="10" height="14" fill="none" stroke="#b8860b"/>' : '<path d="M3 5h8M3 8h7M3 11h8" stroke="#888" stroke-width=".7"/><circle cx="10" cy="15" r="2" fill="#b22222"/>') + '</g>');
      if (pr === 'phone' || pr === 'camera') add('<g transform="translate(' + (x + 8) + ' ' + (y - 10) + ')"><rect width="7" height="12" rx="1.5" fill="#15181d"/><rect x="1" y="1.5" width="5" height="8" fill="#9fd0ff"/>' + (pr === 'camera' ? '<circle cx="5" cy="-3" r="2" fill="#e53935"/>' : '') + '</g>');
      if (pr === 'laptop') add('<g transform="translate(' + (x - 4) + ' ' + (y + 6) + ')"><path d="M0 0 l3 -12 h18 l-3 12z" fill="#2b2e33"/><path d="M4 -1 l2.4 -9.4 h14 l-2.4 9.4z" fill="#9fd0ff"/><rect x="-2" y="0" width="24" height="2" fill="#555"/></g>');
      if (pr === 'suitcase') add('<g transform="translate(232 ' + (gy + 84) + ')"><rect width="18" height="22" rx="2" fill="' + shade('#8e5bd1', dayK) + '"/><path d="M6 0 v-4 h6 v4" fill="none" stroke="#333" stroke-width="1.5"/><circle cx="4" cy="23" r="1.6" fill="#222"/><circle cx="14" cy="23" r="1.6" fill="#222"/></g>');
      if (pr === 'boxes') for (let j = 0; j < 5; j++) add('<rect x="' + (300 + (j % 3) * 18) + '" y="' + (gy + 88 - Math.floor(j / 3) * 15) + '" width="17" height="15" fill="' + shade('#b9864d', dayK) + '" stroke="#7a5634" stroke-width=".6"/>');
      if (pr === 'fabric') add('<g transform="translate(' + (x + 2) + ' ' + y + ')">' + [0, 1, 2].map(function(j){ return '<rect y="' + (-j * 4) + '" width="20" height="4" fill="' + shade(['#d4a017', '#1e8a4c', '#b8275f'][j], dayK) + '"/>'; }).join('') + '</g>');
      if (pr === 'roadblock') add('<g>' + [0, 1].map(function(j){ return '<rect x="' + (40 + j * 300) + '" y="' + (gy + 74) + '" width="14" height="22" rx="2" fill="' + shade('#d64a3a', dayK) + '"/><rect x="' + (40 + j * 300) + '" y="' + (gy + 80) + '" width="14" height="4" fill="#fff" opacity=".8"/>'; }).join('') + '<rect x="50" y="' + (gy + 76) + '" width="296" height="5" fill="' + shade('#8a6a46', dayK) + '"/></g>');
      if (pr === 'carbroken') add(k.car(250, gy + 64, '#8c8f94', false) + '<g fill="#9a9a9a" opacity=".6"><circle cx="330" cy="' + (gy + 56) + '" r="6"/><circle cx="338" cy="' + (gy + 44) + '" r="9"/><circle cx="350" cy="' + (gy + 28) + '" r="12"/></g>');
      if (pr === 'car') add(k.car(250, gy + 64, '#15171a', true));
      if (pr === 'gen') add('<rect x="300" y="' + (gy + 76) + '" width="34" height="22" rx="2" fill="' + shade('#3f6b48', dayK) + '"/><g fill="#9a9a9a" opacity=".55"><circle cx="336" cy="' + (gy + 66) + '" r="5"/><circle cx="342" cy="' + (gy + 54) + '" r="8"/></g>');
      if (pr === 'spark') add('<path d="M300 ' + (gy + 40) + ' l10 14 l-6 2 l12 18" stroke="#ffd54a" stroke-width="3" fill="none"/><circle cx="316" cy="' + (gy + 74) + '" r="10" fill="#ffd54a" opacity=".35"/>');
      if (pr === 'fire') add('<g opacity=".9">' + [0, 1, 2, 3, 4].map(function(j){ const fx = 110 + j * 40, fh = 40 + (j % 2) * 26; return '<path d="M' + fx + ' ' + (gy + 30) + ' q-14 -' + fh / 2 + ' 4 -' + fh + ' q6 ' + fh / 3 + ' 14 ' + fh / 4 + ' q8 ' + fh / 2 + ' -6 ' + (fh * .75) + 'z" fill="#f08a24"/><path d="M' + (fx + 4) + ' ' + (gy + 30) + ' q-6 -' + fh / 3 + ' 2 -' + fh / 1.8 + ' q8 ' + fh / 4 + ' 4 ' + fh / 1.8 + 'z" fill="#ffd54a"/>'; }).join('') + '<g fill="#555" opacity=".5"><circle cx="160" cy="' + (gy - 70) + '" r="22"/><circle cx="210" cy="' + (gy - 100) + '" r="30"/><circle cx="250" cy="' + (gy - 60) + '" r="20"/></g></g>');
      if (pr === 'water') add('<rect x="-10" y="' + (gy + 60) + '" width="410" height="80" fill="#5d7a8c" opacity=".7"/><path d="M-10 ' + (gy + 60) + Array.from({length: 22}, function(){ return ' q10 -4 20 0'; }).join('') + '" stroke="#cfe3ef" stroke-opacity=".6" fill="none"/>');
      if (pr === 'title') add('<g transform="translate(' + (x - 2) + ' ' + (y - 8) + ')"><path d="M0 8 q8 -14 16 0z" fill="#b22222"/>' + [0, 1, 2, 3, 4].map(function(j){ return '<circle cx="' + (2 + j * 3) + '" cy="11" r="1.4" fill="#e07a1f"/>'; }).join('') + '</g>');
      if (pr === 'photo') add('<g transform="translate(300 ' + (gy + 40) + ')"><path d="M4 50 l8 -50 l8 50 M12 0 v50" stroke="#6a4b2c" stroke-width="1.6" fill="none"/><rect x="-2" y="-6" width="28" height="34" fill="#1b1b1e" stroke="#d4af37" stroke-width="1.4"/><circle cx="12" cy="6" r="5" fill="#6b4a32"/><path d="M4 22 q8 -10 16 0z" fill="#2b2b2b"/></g>');
      if (pr === 'poster') add('<rect x="300" y="' + (gy - 12) + '" width="40" height="52" fill="' + shade('#1e8a4c', dayK) + '"/><circle cx="320" cy="' + (gy + 6) + '" r="8" fill="#6b4a32"/><rect x="304" y="' + (gy + 22) + '" width="32" height="10" fill="#fff"/><path d="M306 ' + (gy + 27) + 'h28" stroke="#1e8a4c" stroke-width="2"/>');
      if (pr === 'sand') add('<path d="M60 ' + (gy + 70) + ' q30 -26 60 0z M150 ' + (gy + 76) + ' q22 -20 44 0z" fill="' + shade('#d9b77a', dayK) + '"/>');
      if (held) add('</g>');
    });
    return L.join('');
  };
  /* the places that are neither your home nor your work */
  const institution = function(k){
    const add = k.add, box = k.box, win = k.win, door = k.door, f1 = k.f1, shade = k.shade, gy = k.groundY, dayK = k.dayK, poly = k.poly, url = k.url;
    const sign = function(b, x, y, w, h, text, col, fg){
      const a = b.p(x, y + h, 0), c = b.p(x + w, y, 0);
      return '<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" rx="1.5" fill="' + shade(col, dayK) + '"/>' +
        '<text x="' + f1((a[0] + c[0]) / 2) + '" y="' + f1(c[1] - (c[1] - a[1]) * .28) + '" font-family="sans-serif" font-weight="700" font-size="' + f1(Math.min(10, (c[1] - a[1]) * .64)) + '" text-anchor="middle" fill="' + (fg || '#fff') + '">' + esc(text) + '</text>';
    };
    const p = m.place;
    if (p === 'hall') {
      const b = box([20, gy + 2], 350, 30, 46, '#e7dfcf', {flat: '#cdbd9c'});
      add(b.parts.join('') + sign(b, 110, 30, 130, 11, m.sign || 'EVENT CENTRE', '#7b3fa0'));
      for (let t = 0; t < 2; t++) { const x0 = 30 + t * 180; add('<path d="M' + x0 + ' ' + (gy + 36) + ' h160 l-14 -30 h-132z" fill="' + shade(t ? '#f6f2ea' : '#d4a017', dayK) + '"/><path d="M' + (x0 + 14) + ' ' + (gy + 6) + Array.from({length: 8}, function(){ return ' q8 8 16 0'; }).join('') + '" stroke="' + shade(t ? '#d4a017' : '#f6f2ea', dayK) + '" stroke-width="3" fill="none"/>' +
        [0, 1, 2].map(function(r){ return Array.from({length: 7}, function(_, c){ return '<rect x="' + (x0 + 14 + c * 20) + '" y="' + (gy + 46 + r * 10) + '" width="10" height="7" fill="' + shade('#e8e2d6', dayK) + '" opacity=".9"/>'; }).join(''); }).join('')); }
      add('<rect x="360" y="' + (gy + 30) + '" width="16" height="30" fill="#1b1b1e"/><circle cx="368" cy="' + (gy + 40) + '" r="5" fill="#333"/><circle cx="368" cy="' + (gy + 53) + '" r="4" fill="#333"/>');
    }
    if (p === 'hospital' || p === 'office' || p === 'bank' || p === 'court' || p === 'school' || p === 'church') {
      const spec = {hospital: ['#f2f2ee', 'GENERAL HOSPITAL', '#b22222'], office: ['#d6d2c8', m.sign || 'FEDERAL SECRETARIAT', '#1e6b3a'], bank: ['#e9e6df', m.sign || 'BANK', '#1f4e8c'],
        court: ['#e3dccb', 'HIGH COURT', '#3b2a1c'], school: ['#efe2b8', 'SECONDARY SCHOOL', '#1f4e8c'], church: ['#f2ede2', 'PARISH CHURCH', '#5e3a8c']}[p];
      const tall = p === 'office' || p === 'bank' ? 100 : 70;
      const b = box([60, gy + 24], 270, 50, tall, spec[0], {flat: shade(spec[0], .85), noGrime: p === 'bank'});
      add(b.parts.join(''));
      if (p === 'court') for (let i = 0; i < 6; i++) { const a = b.p(20 + i * 46, tall - 12, 0), c = b.p(30 + i * 46, 0, 0); add('<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="' + f1(c[0] - a[0]) + '" height="' + f1(c[1] - a[1]) + '" fill="' + shade('#f4efe2', dayK) + '"/>'); }
      else for (let f = 0; f < (tall > 80 ? 3 : 2); f++) for (let i = 0; i < 6; i++) add(win(b, 14 + i * 43, 10 + f * 28, 26, 16, p === 'bank' ? 'glass' : ''));
      if (p === 'church') { const a = b.p(135, tall, 25); add('<path d="M' + f1(a[0] - 60) + ' ' + f1(a[1]) + ' L' + f1(a[0]) + ' ' + f1(a[1] - 50) + ' L' + f1(a[0] + 60) + ' ' + f1(a[1]) + 'z" fill="' + shade('#e6dfd0', dayK) + '"/><path d="M' + f1(a[0]) + ' ' + f1(a[1] - 74) + 'v26M' + f1(a[0] - 8) + ' ' + f1(a[1] - 66) + 'h16" stroke="' + shade('#b8860b', dayK) + '" stroke-width="3"/>'); }
      if (p === 'hospital') { const a = b.p(240, tall - 22, 0); add('<rect x="' + f1(a[0]) + '" y="' + f1(a[1]) + '" width="18" height="18" fill="#fff"/><path d="M' + f1(a[0] + 9) + ' ' + f1(a[1] + 3) + 'v12M' + f1(a[0] + 3) + ' ' + f1(a[1] + 9) + 'h12" stroke="#d32f2f" stroke-width="4"/>'); }
      if (p === 'office') { const a = b.p(-10, tall + 30, 0); add('<path d="M' + f1(a[0]) + ' ' + f1(a[1]) + 'v' + (tall + 40) + '" stroke="#777" stroke-width="2"/><rect x="' + f1(a[0] + 1) + '" y="' + f1(a[1]) + '" width="9" height="14" fill="#1e8a4c"/><rect x="' + f1(a[0] + 10) + '" y="' + f1(a[1]) + '" width="9" height="14" fill="#fff"/><rect x="' + f1(a[0] + 19) + '" y="' + f1(a[1]) + '" width="9" height="14" fill="#1e8a4c"/>'); }
      if (p === 'bank') add('<rect x="40" y="' + (gy + 44) + '" width="20" height="30" fill="' + shade('#555b63', dayK) + '"/><rect x="44" y="' + (gy + 50) + '" width="12" height="8" fill="#9fd0ff"/>');
      add(sign(b, 70, tall - 2 - (p === 'court' ? 0 : 0) + 4, 130, 12, spec[1], spec[2]));
      add(door(b, 120, 34, 30, p === 'bank' || p === 'hospital' ? '#9fc4dc' : '#4a3626'));
    }
    if (p === 'airport') {
      const b = box([10, gy + 10], 370, 40, 50, '#d9dee3', {flat: '#b8bfc6', noGrime: true});
      add(b.parts.join(''));
      const gl = [b.p(10, 6, 0), b.p(360, 6, 0), b.p(360, 40, 0), b.p(10, 40, 0)]; add(poly(gl, url('glassD'), ' opacity=".9"'));
      add(sign(b, 120, 42, 130, 7, 'INTERNATIONAL AIRPORT', '#1f4e8c'));
      add('<rect x="320" y="' + (gy - 90) + '" width="12" height="80" fill="' + shade('#c9ced3', dayK) + '"/><rect x="310" y="' + (gy - 104) + '" width="32" height="16" fill="' + url('glassD') + '"/>');
      add('<g transform="translate(60 ' + (gy - 74) + ') rotate(-14)"><rect x="0" y="0" width="120" height="12" rx="6" fill="#f2f4f6"/><path d="M50 6 l-20 -26 h12 l26 26z M50 6 l-20 26 h12 l26 -26z M4 6 l-6 -14 h8 l8 14z" fill="#d6dbe0"/></g>');
    }
    if (p === 'land') {
      add('<rect x="-10" y="' + (gy + 6) + '" width="410" height="34" fill="' + shade('#cbb995', dayK) + '"/><rect x="-10" y="' + (gy + 6) + '" width="410" height="34" fill="#000" filter="' + url('grime') + '" opacity=".5"/>');
      add('<text x="195" y="' + (gy + 22) + '" font-family="sans-serif" font-weight="800" font-size="11" text-anchor="middle" fill="' + shade('#b22222', dayK) + '">THIS LAND IS NOT FOR SALE</text><text x="195" y="' + (gy + 34) + '" font-family="sans-serif" font-weight="800" font-size="9" text-anchor="middle" fill="' + shade('#b22222', dayK) + '">BEWARE OF 419</text>');
      for (let i = 0; i < 4; i++) add('<rect x="' + (250 + i * 13) + '" y="' + (gy + 54) + '" width="12" height="6" fill="' + shade('#c9c4b8', dayK) + '"/>');
    }
    if (p === 'street' || p === 'market') {
      for (let i = 0; i < 4; i++) { const b = box([10 + i * 96, gy + 6], 78, 24, 34, ['#d8ccb1', '#cfd8dc', '#e4d7bd', '#d6c7a6'][i], {flat: '#cdbd9c'}); add(b.parts.join('') + door(b, 26, 22, 26, '#2a2f36') + (m.sign && i === 1 ? sign(b, 4, 26, 70, 7, m.sign, '#1f2a44') : '')); }
      if (p === 'market') for (let i = 0; i < 4; i++) { const x0 = 30 + i * 90; add('<path d="M' + (x0 - 30) + ' ' + (gy + 58) + ' Q' + x0 + ' ' + (gy + 30) + ' ' + (x0 + 30) + ' ' + (gy + 58) + 'z" fill="' + shade(['#d64a3a', '#2f6fb3', '#e7b931', '#1e8a4c'][i], dayK) + '"/><path d="M' + x0 + ' ' + (gy + 58) + 'v26" stroke="#555"/><rect x="' + (x0 - 20) + '" y="' + (gy + 70) + '" width="40" height="10" fill="' + shade('#8a6a46', dayK) + '"/>'); }
      add(k.pole(372));
    }
    if (p === 'boardroom') {
      add('<rect x="-10" y="' + (k.TOP) + '" width="410" height="' + (gy + 40 - k.TOP) + '" fill="' + shade('#3a3f48', dayK) + '"/>');
      add('<rect x="40" y="' + (gy - 120) + '" width="310" height="110" fill="' + url('glassD') + '"/>' + Array.from({length: 7}, function(_, i){ return '<rect x="' + (52 + i * 44) + '" y="' + (gy - 70 + (i % 3) * 14) + '" width="26" height="' + (60 - (i % 3) * 14) + '" fill="#1d2433" opacity=".6"/>'; }).join('') + '<path d="M40 ' + (gy - 120) + 'h310v110h-310z" fill="none" stroke="#222" stroke-width="3"/>');
      add('<rect x="-10" y="' + (gy + 40) + '" width="410" height="' + (k.H - gy) + '" fill="' + shade('#5a4632', dayK) + '"/>');
      for (let i = 0; i < 5; i++) add(k.person(80 + i * 58, gy + 36, {shirt: ['#20242c', '#2f3d5c', '#3a3f48', '#20242c', '#4a3a5c'][i], tie: true, skin: ['#5a3b27', '#4a3020', '#7d573b'][i % 3], scale: 1.1, grey: i === 2}));
      add('<path d="M30 ' + (gy + 40) + ' h330 l20 30 h-370z" fill="' + shade('#6e4a32', dayK) + '"/><rect x="10" y="' + (gy + 70) + '" width="370" height="6" fill="' + shade('#4a3020', dayK) + '"/>');
      for (let i = 0; i < 4; i++) add('<rect x="' + (70 + i * 76) + '" y="' + (gy + 48) + '" width="14" height="18" fill="#f4f1e6" transform="rotate(' + (i % 2 ? 6 : -5) + ' ' + (77 + i * 76) + ' ' + (gy + 57) + ')"/>');
    }
  };
  if (m.place === 'news') return newsSceneSVG(home, m.title, vh);
  /* at home and at work the people and things join that scene, drawn by its own kit */
  if (m.place === 'home') return homeSceneSVG(Object.assign({}, home, {extra: overlay}), vh);
  if (m.place === 'work') return workSceneSVG(Object.assign({}, workLook(S.biz ? 'biz' : 'job'), {extra: overlay}), vh);
  const st = Object.assign({ground: /bank|office|airport|boardroom|court/.test(m.place) ? 'pave' : 'earth', towers: /bank|office|airport/.test(m.place), seed: 53 + m.place.length, noNepa: true}, air);
  const k = sceneKit(st, vh, 'ms');
  institution(k);
  k.add(overlay(k));
  return k.finish('momentscene', 'The moment: ' + m.place);
}
/* the moment's picture for an event card, both renderers */
function momentHTML(M){
  if(!M || !M.ev) return '';
  /* a picture that cannot be drawn must not cost the player the decision: the
     card is drawn without it, and the failure is reported */
  try{ return '<div class="moment">' + momentSceneSVG(momentOf(M.ev, M.thread), 240) + '</div>'; }
  catch(e){ if(typeof console !== 'undefined') console.error('the moment could not be drawn', M.ev && M.ev.id, e); return ''; }
}
