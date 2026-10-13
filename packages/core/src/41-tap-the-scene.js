/* =========================================================================
   Tap the scene (VISUAL.md, M11)
   ========================================================================= */
/* The scene behind every screen is a place you can touch. Your house opens
   the budget; the generator, the car and the solar open what you own; you
   open a card about your own life; a person - in the gathering, or at your
   gate - opens their card; your premises open the business and the rival's
   place opens the rival; in the boardroom the register, the table and the
   bank's man open their screens; on the map each pin opens what it stands for.
   Every zone is an ordinary control: `goto` to a screen the tabs already
   reach, or `hot` for a card whose buttons are the game's own buttons - the
   same actions through the same dispatcher, refused for the same reasons.
   Nothing here is a new way to change the run. */
function hotZone(x, y, w, h, label, attrs){
  const data = Object.keys(attrs).map(function(k){ return ' data-' + k + '="' + esc(attrs[k]) + '"'; }).join('');
  return '<rect class="hotzone" x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="' + Math.round(w) + '" height="' + Math.round(h) + '" rx="10"' +
    ' fill="#fff" fill-opacity="0" role="button" tabindex="0" aria-label="' + esc(label) + '"' + data + '><title>' + esc(label) + '</title></rect>';
}
function goZone(x, y, w, h, label, tab, sub){ return hotZone(x, y, w, h, label, {a: 'goto', t: tab, s: sub}); }
/* the three things you can do for your household, in one place: the People
   screen, in both renderers, and the card you open by tapping yourself */
function householdButtonsHTML(){
  return '<button class="btn xs" data-a="spend" data-k="family">Help family ('+fmt(Math.round(150000*S.cumInfl))+')</button>'+
    '<button class="btn xs" data-a="spend" data-k="health">Private care ('+fmt(Math.round(220000*S.cumInfl))+')</button>'+
    '<button class="btn xs" data-a="spend" data-k="social">Be seen ('+fmt(Math.round(120000*S.cumInfl))+')</button>';
}
/* a member of the household's four decisions, in one place: the Household
   screen in both renderers, and the card you open by tapping them at home */
function houseButtonsHTML(st){
  return '<button class="btn xs" data-a="housetrain" data-i="'+esc(st.id)+'">Train ('+fmt(Math.round((st.salary||0)*0.9))+')</button>'+
    '<button class="btn xs" data-a="houseraise" data-i="'+esc(st.id)+'" data-v="0.10">+10%</button>'+
    '<button class="btn xs" data-a="housereview" data-i="'+esc(st.id)+'">Pay review</button>'+
    '<button class="btn xs bad" data-a="housefire" data-i="'+esc(st.id)+'">Let go</button>';
}
/* a director's seven: the ways to lobby them, and removing them - in one
   place, for the Board screen and the card you open by tapping them */
function directorButtonsHTML(d){
  const m = [['brief', 'Brief'], ['concede', 'Promise'], ['pay', 'Fee'], ['equity', 'Shares'], ['pressure', 'Pressure'], ['favour', 'Favour']];
  return m.map(function(x){ return '<button class="btn xs" data-a="lobby" data-d="'+esc(d.id)+'" data-m="'+x[0]+'">'+x[1]+'</button>'; }).join('')+
    '<button class="btn xs bad" data-a="removedir" data-d="'+esc(d.id)+'">Remove</button>';
}
/* at home: the house, what you own, you, and whoever is at the gate */
function homeTaps(st, visitorId){
  return function(k){
    const gy = k.groundY, out = [];
    const house = st.tier === 1 ? [20, 136, 340, 82] : st.tier === 2 ? [110, 30, 215, 195] : [90, 56, 250, 160];
    out.push(goZone(house[0], house[1], house[2], house[3], 'Your home: the budget', 'money', 'budget'));
    if(st.gen){ const g = st.tier >= 3 ? [66, gy + 14, 50, 40] : st.tier === 2 ? [34, gy + 26, 34, 30] : [294, gy + 20, 34, 26]; out.push(goZone(g[0], g[1], g[2], g[3], 'Your generator: what you own', 'money', 'property')); }
    if(st.solar && st.tier >= 3) out.push(goZone(200, 40, 110, 30, 'Your solar: what you own', 'money', 'property'));
    if(st.car){
      const cars = st.tier >= 3 ? [[214, gy + 42], [120, gy + 54]] : st.tier === 2 ? [[236, gy + 44]] : [[196, gy + 44]];
      cars.slice(0, Math.max(1, st.car)).forEach(function(c){ out.push(goZone(c[0], c[1], 84, 38, 'Your car: what you own', 'money', 'property')); });
    }
    const me = st.tier >= 3 ? [300, 270] : st.tier === 2 ? [108, 272] : [150, 268];
    /* the household staff, where the scene stands them: each opens their card */
    const ids = st.houseIds || {};
    const at = {security: [st.tier >= 3 ? 64 : 30, gy + 46], driver: st.car ? [st.tier >= 3 ? 206 : 226, gy + 84] : null, nanny: [me[0] - 26, me[1] + 2], cook: [me[0] - 48, me[1] + 1]};
    Object.keys(at).forEach(function(role){ const p = at[role]; if(p && ids[role]) out.push(hotZone(p[0] - 11, p[1] - 52, 22, 54, 'Your ' + ((HOUSE_ROLES[role] || {}).label || role).toLowerCase(), {a: 'hot', k: 'house', c: ids[role]})); });
    out.push(hotZone(me[0] - 14, me[1] - 60, 28, 62, 'You: your health, your family, your standing', {a: 'hot', k: 'you'}));
    if(visitorId) out.push(hotZone(320, gy + 32, 30, 66, 'At your gate', {a: 'hot', k: 'person', c: visitorId}));
    return out.join('');
  };
}
/* at work: the premises or the tower, and the rival's place across the street */
function workTaps(st){
  return function(k){
    const gy = k.groundY, out = [];
    if(st.kind === 'tower') out.push(goZone(110, -30, 214, 250, st.employed ? 'Your job' : 'Looking for work', 'work', 'career'));
    else out.push(goZone(54, gy - 134, 293, 183, st.kind === 'tolet' ? 'Start a company' : (st.name || 'Your company'), 'work', 'business'));
    if(st.rival && st.kind !== 'tower' && st.kind !== 'tolet') out.push(goZone(316, gy - 80, 74, 104, 'Your rival: ' + st.rival.name, 'work', 'rival'));
    /* your staff, at their stations, over the premises: each opens their card */
    (st.spots || []).forEach(function(sp){ out.push(hotZone(sp.x, sp.y, Math.max(16, sp.w), Math.max(30, sp.h), 'Your staff', {a: 'hot', k: 'staff', c: sp.id})); });
    return out.join('');
  };
}
/* in the boardroom: the register on the wall, the table, the bank's man */
function boardTaps(st){
  return function(k){
    const gy = k.groundY, out = [];
    out.push(goZone(36, gy - 66, 250, 170, 'The board', 'governance', 'board'));
    out.push(goZone(280, gy - 138, 84, 98, 'The register: who owns what', 'governance', 'register'));
    if(st.lender) out.push(goZone(284, gy - 40, 36, 92, 'The bank: covenants', 'governance', 'pack'));
    /* each director at the table opens their card; your own seat opens yours */
    const seats = st.seats || [], n = seats.length;
    seats.forEach(function(s, i){
      const x = n === 1 ? 150 : 56 + 188 * i / (n - 1), y = gy + 50;
      out.push(s.yours ? hotZone(x - 15, y - 92, 30, 94, 'You', {a: 'hot', k: 'you'})
        : s.id ? hotZone(x - 15, y - 92, 30, 94, s.name + ', ' + (s.label || 'director'), {a: 'hot', k: 'director', c: s.id}) : '');
    });
    return out.join('');
  };
}
/* the card a tap opens: a person, or you */
function hotModal(M){
  if(M.kind === 'person'){
    const c = (S.cast || []).find(function(x){ return x.id === M.id; });
    if(!c) return modalHTML('<h2>Not here</h2>', '<div class="tiny muted">They are not in your life any more.</div>', '<button class="btn primary" data-a="close">Close</button>');
    return modalHTML('<h2>' + esc(c.name) + '</h2>', '<div class="ctiles one">' + castTileHTML(c) + '</div>',
      '<button class="btn" data-a="goto" data-t="legacy" data-s="people">Everyone</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:420px"');
  }
  if(M.kind === 'staff'){
    /** @type {any} */
    let s = null;
    bizList().forEach(function(b){ (b.staff || []).forEach(function(x){ if(x.id === M.id) s = x; }); });
    if(!s) return modalHTML('<h2>Not here</h2>', '<div class="tiny muted">They no longer work for you.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const tr = traitOf(s.trait), role = STAFF_ROLES[s.role] || {label: 'Staff'};
    return modalHTML('<h2>' + esc(s.name) + '</h2><div class="tiny muted">' + esc(role.label) + (tr && tr.name ? ' \u00b7 ' + esc(tr.name) : '') + ' \u00b7 ' + fmt(s.salary) + '/month</div>',
      ringsHTML([{ico: 'star', label: 'Skill', v: (s.skill || 0) * 10, text: (s.skill || 0) + '/10', tone: 'var(--info)'}, {ico: 'smile', label: 'Morale', v: s.morale || 0}]) +
      '<div class="row wrap" style="margin-top:12px;gap:6px"><button class="btn sm" data-a="raise" data-i="' + esc(s.id) + '">Raise pay 15%</button><button class="btn sm bad" data-a="fire" data-i="' + esc(s.id) + '">Let go</button></div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="business">The business</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:420px"');
  }
  if(M.kind === 'house'){
    const h = (S.house || []).find(function(x){ return x.id === M.id; });
    if(!h) return modalHTML('<h2>Not here</h2>', '<div class="tiny muted">They no longer work for you.</div>', '<button class="btn primary" data-a="close">Close</button>');
    return modalHTML('<h2>' + esc(h.name) + '</h2><div class="tiny muted">' + esc((HOUSE_ROLES[h.role] || {label: 'Household'}).label) + ' \u00b7 ' + fmt(h.salary || 0) + '/month</div>',
      ringsHTML([{ico: 'star', label: 'Skill', v: (h.skill || 0) * 10, text: (h.skill || 0) + '/10', tone: 'var(--info)'}, {ico: 'smile', label: 'Morale', v: h.morale || 0}, {ico: 'hands', label: 'Loyalty', v: h.loyalty || 0}]) +
      '<div class="row wrap" style="margin-top:12px;gap:6px">' + houseButtonsHTML(h) + '</div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="household">The household</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:440px"');
  }
  if(M.kind === 'director'){
    const b = S.biz, d = b ? (b.board || []).find(function(x){ return x.id === M.id; }) : null;
    if(!d) return modalHTML('<h2>Not here</h2>', '<div class="tiny muted">They are no longer on the board.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const A = archOf(d.arc);
    return modalHTML('<h2>' + esc(d.name) + '</h2><div class="tiny muted">' + esc(d.role === 'chair' ? 'Chair' : d.label || A.label || 'Director') + (d.holderName ? ' \u00b7 nominated by ' + esc(d.holderName) : '') + '</div>',
      ringsHTML([{ico: 'hands', label: 'Loyalty', v: d.loyalty || 0}, {ico: 'glass', label: 'Patience', v: d.patience || 0}]) +
      '<div class="row wrap" style="gap:5px;margin:10px 0 4px">' + (d.agenda || []).map(function(a){ return '<span class="chip ' + (a === 'sell' || a === 'buyout' ? 'r' : '') + '">' + esc((RES_KINDS[a] || {label: a}).label) + '</span>'; }).join('') + '</div>' +
      '<div class="tiny muted">Wants: ' + esc(A.likes || '') + '. Cannot stand: ' + esc(A.hates || '') + '.</div>' +
      '<div class="row wrap" style="margin-top:12px;gap:5px">' + directorButtonsHTML(d) + '</div>',
      '<button class="btn" data-a="goto" data-t="governance" data-s="board">The board</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
  }
  return modalHTML('<h2>You</h2>', lifeRingsHTML() + '<div class="row wrap" style="margin-top:12px;gap:6px">' + householdButtonsHTML() + '</div>',
    '<button class="btn" data-a="goto" data-t="legacy" data-s="record">Your record</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
}
