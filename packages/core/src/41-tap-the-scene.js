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
    /* whoever is waiting at your gate for work in the house */
    out.push(doorQueueTaps(st.queue || [], k));
    /* whoever is walking up the road to you: what they are bringing, and when */
    comingBack().slice(0, 3).forEach(function(it, i){
      const q = Math.max(0, it.turn - S.turn), x = 96 - Math.min(q, ROAD_QUARTERS - 1) * 12 - i * 6, y = gy + 104 - Math.min(q, ROAD_QUARTERS - 1) * 1.4 + i * 4;
      out.push(hotZone(x - 10, y - 66, 22, 68, 'On its way: ' + it.title, {a: 'hot', k: 'coming', c: String(i)}));
    });
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
    /* the customers at the door: what brings them in */
    (st.cspots || []).forEach(function(c){ out.push(hotZone(c.x, c.y, Math.max(16, c.w), Math.max(30, c.h), 'Your customers: price, marketing, quality', {a: 'hot', k: 'customers'})); });
    /* your staff, at their stations, over the premises: each opens their card */
    (st.spots || []).forEach(function(sp){ out.push(hotZone(sp.x, sp.y, Math.max(16, sp.w), Math.max(30, sp.h), 'Your staff', {a: 'hot', k: 'staff', c: sp.id})); });
    /* the applicants queuing outside */
    out.push(doorQueueTaps(st.queue || [], k));
    return out.join('');
  };
}
/* in the boardroom: the register on the wall, the table, the bank's man */
function boardTaps(st){
  return function(k){
    const gy = k.groundY, out = [];
    out.push(goZone(36, gy - 66, 250, 170, 'The board', 'governance', 'board'));
    out.push(goZone(280, gy - 138, 84, 98, 'The register: who owns what', 'governance', 'register'));
    if(st.lender) out.push(hotZone(284, gy - 40, 36, 92, 'The bank\'s man: the covenants', {a: 'hot', k: 'bank'}));
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
/* The sheet gives way to the scene (VISUAL.md, M11): in the world-first view,
   a list whose every row is a person you can tap in the picture becomes a strip
   of their faces, each opening the same card the picture does. With the
   explanations shown - the HUD's (i) - the full list comes back: the old
   layout is the fallback, never gone. */
function sceneFirst(){ return !UI.details; }
/* a member of staff, small: morale as the ring, their initials inside */
function staffBadgeSVG(s){ return faceBadgeSVG(s.name, s.morale || 0, '#1f6fb2'); }
/* anyone, small: a reading as the ring, their initials inside, the colour of
   what they are to you */
function faceBadgeSVG(name, v, fill){
  const m = Math.max(0, Math.min(100, v)), C = 2 * Math.PI * 19, col = m > 60 ? '#2fd47a' : m > 35 ? '#ff9f43' : '#ff5f6d';
  const ini = String(name || '?').split(' ').map(function(w){ return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
  return '<svg class="gfx" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="3"/>' +
    '<circle cx="22" cy="22" r="19" fill="none" stroke="' + col + '" stroke-width="3" stroke-dasharray="' + (C * m / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 22 22)"/>' +
    '<circle cx="22" cy="22" r="15" fill="' + fill + '"/><text x="22" y="26.5" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="#fff">' + esc(ini) + '</text></svg>';
}
/* a member of the household, in full: who they are, who pays them, their
   terms, and the four - the Household screen's row and the card you open by
   tapping them, the same controls through the same handlers */
function houseControlsHTML(st){
  const onBiz = (st.payer || 'you') !== 'you';
  return '<div class="row wrap" style="gap:6px;margin:7px 0">' +
    '<select data-hrole="' + esc(st.id) + '" style="font-size:11px;padding:3px">' +
      Object.keys(HOUSE_ROLES).filter(function(k){ return houseRoleAvail(k) || k === st.role; })
        .map(function(k){ return '<option value="' + k + '"' + (k === st.role ? ' selected' : '') + '>' + esc(HOUSE_ROLES[k].label) + '</option>'; }).join('') +
    '</select>' +
    '<select data-hpayer="' + esc(st.id) + '" style="font-size:11px;padding:3px">' +
      '<option value="you"' + (!onBiz ? ' selected' : '') + '>You pay</option>' +
      bizList().map(function(b){ return '<option value="' + b.id + '"' + (st.payer === b.id ? ' selected' : '') + '>' + esc(b.name) + ' pays</option>'; }).join('') +
    '</select></div>' +
    '<div class="tiny muted" style="margin-bottom:5px">Terms: ' +
    Object.keys(HOUSE_PERKS).map(function(k){
      const on = st.perks && st.perks[k];
      return '<button class="btn xs' + (on ? ' primary' : '') + '" data-a="houseperk" data-i="' + esc(st.id) + '" data-k="' + k +
        '" title="' + esc(HOUSE_PERKS[k].note) + '">' + esc(HOUSE_PERKS[k].label) + '</button>';
    }).join(' ') + '</div>' +
    (onBiz ? '<div class="tiny ' + (st.declared ? 'good' : 'bad') + '" style="margin-bottom:6px">On the company payroll as a benefit in kind: ' +
      (st.declared ? 'declared and grossed up for tax.' : '<b>undeclared</b> — that is a tax exposure with your name on it.') +
      ' <button class="btn xs" data-a="housedeclare" data-i="' + esc(st.id) + '">' + (st.declared ? 'Stop declaring it' : 'Declare it') + '</button></div>' : '') +
    '<div class="row wrap" style="gap:5px">' + houseButtonsHTML(st) + '</div>';
}
/* the household as faces: morale as the ring; each opens their card */
function houseFacesHTML(list){
  return list.map(function(st){
    const R0 = HOUSE_ROLES[st.role] || HOUSE_ROLES.cleaner;
    return '<button class="facebtn" data-a="hot" data-k="house" data-c="' + esc(st.id) + '" aria-label="' + esc(st.name + ', ' + R0.label) + '">' +
      faceBadgeSVG(st.name, st.morale === undefined ? 60 : st.morale, '#2f7d5a') + '<span>' + esc(String(st.name).split(' ')[0]) + '</span><small>' + esc(R0.label) + '</small></button>';
  }).join('');
}
/* a director, the facts: what they push for, what they are good at, what they
   hold against you, how they have voted, what they want - the Board screen's
   row and the card you open by tapping them at the table */
function directorFactsHTML(b, d){
  const A = archOf(d.arc), dv = Math.round(dirVotes(b, d));
  return '<div class="row wrap" style="gap:5px;margin:6px 0">' +
      (d.agenda || []).map(function(a){ return '<span class="chip ' + (a === 'sell' || a === 'buyout' ? 'r' : '') + '">' + esc((RES_KINDS[a] || {label: a}).label) + '</span>'; }).join('') +
      '<span class="chip b">' + esc(A.skill) + ' ' + Math.round((d.skill || {})[A.skill] || 0) + '</span>' +
      (d.grudges && d.grudges.length ? '<span class="chip r">' + d.grudges.length + ' grievance' + (d.grudges.length > 1 ? 's' : '') + '</span>' : '') +
      (d.briefed >= S.turn - 1 ? '<span class="chip g">briefed</span>' : '') +
    '</div>' +
    (d.grudges && d.grudges.length ? '<div class="tiny muted" style="margin-bottom:6px">Remembers: ' + esc(d.grudges.slice(-2).join('; ')) + '.</div>' : '') +
    '<div class="tiny muted">' + (dv > 0 ? 'Controls ' + dv.toLocaleString() + ' shares' : 'Carries no shares, one seat') +
      ' / voted with you ' + (d.votesFor || 0) + ' / against ' + (d.votesAgainst || 0) + ' / abstained ' + (d.abstained || 0) +
      ((d.consulting || 0) > 0 ? ' / ' + fmt(d.consulting) + ' in fee arrangements' : '') + '</div>';
}
/* the board as faces: loyalty as the ring, the chair in purple, you in gold */
function boardFacesHTML(bd){
  return bd.map(function(d){
    const A = archOf(d.arc), what = d.role === 'chair' ? 'Chair' : d.yours ? 'You' : (d.label || A.label || 'Director');
    return '<button class="facebtn" data-a="hot" data-k="director" data-c="' + esc(d.id) + '" aria-label="' + esc(d.name + ', ' + what) + '">' +
      faceBadgeSVG(d.name, d.loyalty || 50, d.role === 'chair' ? '#6b4fbf' : d.yours ? '#a87a00' : '#3a4a5e') + '<span>' + esc(String(d.name).split(' ')[0]) + '</span><small>' + esc(what) + '</small></button>';
  }).join('');
}
function staffStripBody(b){
  const n = (b.staff || []).length;
  return '<h3>People <span class="tag">' + n + ' staff \u00b7 ' + fmt(staffMonthly()) + '/mo</span></h3>' +
    (n ? '<div class="facerow">' + b.staff.map(function(s){
      return '<button class="facebtn" data-a="hot" data-k="staff" data-c="' + esc(s.id) + '" aria-label="' + esc(s.name) + '">' + staffBadgeSVG(s) + '<span>' + esc(String(s.name).split(' ')[0]) + '</span></button>';
    }).join('') + '</div><div class="tiny muted prose">Tap anyone, here or in the picture, for their pay, their morale and what you can do.</div>'
      : '<div class="small muted">No staff. You are the operations department, the sales team and the cleaner. That works until it does not.</div>') +
    '<hr class="sep"><div class="tiny muted">Fair market salary for a skill-5 hire right now: <b>' + fmt(marketSalary(5)) + '</b>/month. Underpay and they leave or steal; overpay and your break-even rises permanently.</div>';
}
/* the card around it - the React screen draws this element itself and fills
   it with the body, so both renderers put the same card in the section */
function staffStripHTML(b){ return '<div class="card" style="margin-top:12px">' + staffStripBody(b) + '</div>'; }
function castStripBody(cast){
  return '<h3>The cast</h3><div class="facerow">' + cast.map(function(c){
    return '<button class="facebtn" data-a="hot" data-k="person" data-c="' + esc(c.id) + '" aria-label="' + esc(c.name + ', ' + relationWord(c.relation)) + '">' + castFaceHTML(c) + '<span>' + esc(String(c.name).split(' ')[0]) + '</span></button>';
  }).join('') + '</div><div class="tiny muted prose">Tap anyone, here or in the picture, for what they remember and what you can do.</div>' +
    '<details class="fold"><summary>Why they remember</summary><div>These people get older, richer, poorer and dead whether you are paying attention or not. What they remember is what you did.</div></details>';
}
function castStripHTML(cast){ return '<div class="card">' + castStripBody(cast) + '</div>'; }
/* Looking for work, at your door: this quarter's applicants queue outside
   your premises, the household's at your gate, each with their CV - a gold
   star on it for the strongest. A tap on one opens their card, with the
   offer and the take of the sheet. Read from the candidates the quarter
   already drew; the scene never draws new ones. */
const DOOR_QUEUES = {applicant: [[14, 50], [31, 53], [48, 56], [65, 59]], seeker: [[355, 82], [373, 85]]};
function doorQueue(list, kind){
  return (list || []).slice(0, DOOR_QUEUES[kind].length).map(function(c){ return {id: c.id, name: c.name, skill: c.skill || 0, kind: kind}; });
}
function doorQueueLayer(q){
  if(!q.length) return null;
  return function(k){
    return q.map(function(c, i){
      const at = DOOR_QUEUES[c.kind][i], x = at[0], y = k.groundY + at[1], s = 1.15;
      let h = 0; for(let j = 0; j < String(c.id).length; j++) h = (h * 31 + String(c.id).charCodeAt(j)) % 997;
      return '<g>' + k.person(x, y, {shirt: ['#8a8f99', '#6f7c5e', '#9a7b5a', '#5e6f8a', '#a0606a'][h % 5], skin: ['#5a3b27', '#7d573b', '#4a3020', '#6b4a32'][h % 4], dress: h % 3 === 1, scale: s}) +
        '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="5.5" y="-27" width="7.5" height="10" rx=".6" fill="#f4f1e6" transform="rotate(10 9 -22)"/>' +
        '<path d="M7 -24.5h4.5M7 -22.5h4.5M7 -20.5h3" stroke="#8a8a8a" stroke-width=".6" transform="rotate(10 9 -22)"/>' +
        (c.skill >= 8 ? '<circle cx="12.5" cy="-27.5" r="2.2" fill="#f5b301"/>' : '') + '</g></g>';
    }).join('');
  };
}
function doorQueueTaps(q, k){
  return q.map(function(c, i){
    const at = DOOR_QUEUES[c.kind][i], s = 1.15;
    return hotZone(at[0] - 11 * s, k.groundY + at[1] - 46 * s, 22 * s, 48 * s, 'Looking for work: ' + c.name + ', skill ' + c.skill + '/10', {a: 'hot', k: c.kind, c: c.id});
  }).join('');
}
/* the applicants as faces on the sheet: skill as the ring */
function applicantFacesHTML(list, kind){
  return (list || []).map(function(c){
    const what = kind === 'seeker' ? ((HOUSE_ROLES[c.role] || {label: 'Household'}).label) : 'skill ' + c.skill + '/10';
    return '<button class="facebtn" data-a="hot" data-k="' + kind + '" data-c="' + esc(c.id) + '" aria-label="' + esc(c.name + ', ' + what) + '">' +
      faceBadgeSVG(c.name, (c.skill || 0) * 10, '#5b6b7d') + '<span>' + esc(String(c.name).split(' ')[0]) + '</span><small>' + esc(what) + '</small></button>';
  }).join('');
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
    const tr = traitOf(h.trait), fair = houseSalaryFor(h.role, h.skill);
    return modalHTML('<h2>' + esc(h.name) + '</h2><div class="tiny muted">' + esc((HOUSE_ROLES[h.role] || {label: 'Household'}).label) + (tr && tr.name ? ' \u00b7 ' + esc(tr.name) : '') + ' \u00b7 ' + fmt(h.salary || 0) + '/month' +
        ((h.salary || 0) < fair * 0.9 ? ' <span class="bad">below the going rate</span>' : '') + ' \u00b7 ' + (h.quarters || 0) + (h.quarters === 1 ? ' quarter' : ' quarters') + ' with you</div>',
      ringsHTML([{ico: 'star', label: 'Skill', v: (h.skill || 0) * 10, text: (h.skill || 0) + '/10' + (h.trained ? ' +' + h.trained : ''), tone: 'var(--info)'}, {ico: 'smile', label: 'Morale', v: h.morale === undefined ? 60 : h.morale},
        {ico: 'hands', label: 'Loyalty', v: h.loyalty === undefined ? 50 : h.loyalty}, {ico: 'bolt', label: 'Output', v: h.perf === undefined ? 60 : h.perf, tone: 'var(--acc)'}]) +
      '<div style="margin-top:10px">' + houseControlsHTML(h) + '</div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="household">The household</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:440px"');
  }
  if(M.kind === 'director'){
    const b = S.biz, d = b ? (b.board || []).find(function(x){ return x.id === M.id; }) : null;
    if(!d) return modalHTML('<h2>Not here</h2>', '<div class="tiny muted">They are no longer on the board.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const A = archOf(d.arc);
    return modalHTML('<h2>' + esc(d.name) + '</h2><div class="tiny muted">' + esc(d.role === 'chair' ? 'Chair' : d.yours ? 'You' : d.label || A.label || 'Director') + (d.holderName ? ' \u00b7 nominated by ' + esc(d.holderName) : '') + (d.fee ? ' \u00b7 ' + fmt(d.fee) + '/yr' : '') + '</div>' +
        '<div class="tiny muted">' + esc(A.blurb || '') + '</div>',
      ringsHTML([{ico: 'hands', label: 'Loyalty', v: d.loyalty || 50}, {ico: 'glass', label: 'Patience', v: d.patience || 50}]) +
      '<div style="margin-top:10px">' + directorFactsHTML(b, d) + '</div>' +
      (d.yours ? '' : '<div class="tiny muted" style="margin-top:6px">Wants: ' + esc(A.likes || '') + '. Cannot stand: ' + esc(A.hates || '') + '.</div>' +
        '<div class="row wrap" style="margin-top:12px;gap:5px">' + directorButtonsHTML(d) + '</div>'),
      '<button class="btn" data-a="goto" data-t="governance" data-s="board">The board</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
  }
  if(M.kind === 'customers'){
    const b = S.biz;
    if(!b) return modalHTML('<h2>No company</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
    const kept = Math.round((1 - (b.churnQ || 0)) * 100);
    return modalHTML('<h2>Your customers</h2><div class="tiny muted">' + Math.round(b.custBase || 0).toLocaleString() + ' customers \u00b7 each new one costs about ' + fmt(b.cacQ || 0) + '</div>',
      ringsHTML([{ico: 'people', label: 'Kept a quarter', v: kept, text: kept + '%'}, {ico: 'star', label: 'Quality', v: b.quality || 0}, {ico: 'target', label: 'Positioning', v: b.positioning === undefined ? 45 : b.positioning, tone: 'var(--info)'}]) +
      /* the Business screen's own three dials: the same inputs, through the same handler */
      '<div style="margin-top:12px">' +
      '<div class="slider"><span>Price</span><input type="range" data-inp="bizprice" min="60" max="160" step="2" value="' + Math.round((b.priceIdx || 1) * 100) + '"><span class="mono" style="text-align:right">' + ((b.priceIdx || 1) * 100).toFixed(0) + '%</span></div>' +
      '<div class="slider"><span>Marketing</span><input type="range" data-inp="bizmark" min="0" max="2000000" step="25000" value="' + (b.marketing || 0) + '"><span class="mono" style="text-align:right">' + fmt(b.marketing || 0) + '</span></div>' +
      '<div class="slider"><span>Quality</span><input type="range" data-inp="bizqual" min="0" max="600000" step="10000" value="' + (b.qualitySpendMonthly || 0) + '"><span class="mono" style="text-align:right">' + fmt(b.qualitySpendMonthly || 0) + '/mo</span></div>' +
      '</div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="business">The business</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
  }
  if(M.kind === 'bank'){
    const b = S.biz, covs = b && b.covenants || [];
    const rows = covs.map(function(c){
      const st = covenantState(c, b), K = COVENANT_KINDS[c.kind] || {label: c.kind, desc: ''};
      const top = Math.max(Math.abs(st.actual) || 0, Math.abs(c.limit) || 0, 1) * 1.3;
      const tone = st.ok ? (st.tight ? 'var(--warn)' : 'var(--good)') : 'var(--bad)';
      const fv = function(v){ return c.kind === 'mincash' || c.kind === 'capex' ? fmt(Math.round(v)) : c.kind === 'conc' ? Math.round(v) + '%' : (+v).toFixed(2) + 'x'; };
      /* where you stand against the line: the fill is you, the mark is the limit */
      return '<div class="covrow"><div class="between"><b>' + esc(K.label) + '</b><span class="chip ' + (st.ok ? (st.tight ? 'y' : 'g') : 'r') + '">' + (st.ok ? (st.tight ? 'tight' : 'kept') : 'BREACHED') + '</span></div>' +
        (c.kind === 'keyman' ? '<div class="tiny muted">' + (b.founderOusted ? 'You were removed as managing director.' : 'You are still managing director.') + '</div>'
          : '<span class="gfx covbar" role="img" aria-label="' + esc(K.label + ': ' + fv(st.actual) + ' against ' + fv(c.limit)) + '"><i style="width:' + Math.max(2, Math.min(100, Math.abs(st.actual) / top * 100)).toFixed(1) + '%;background:' + tone + '"></i>' +
            '<b style="left:' + Math.min(100, Math.abs(c.limit) / top * 100).toFixed(1) + '%"></b></span><div class="tiny muted">' + fv(st.actual) + ' against a limit of ' + fv(c.limit) + '</div>') + '</div>';
    }).join('');
    return modalHTML('<h2>The bank</h2><div class="tiny muted">The conditions on the loan, tested every quarter</div>',
      (rows || '<div class="tiny muted">No covenants.</div>') + '<div class="tiny muted" style="margin-top:8px">A breach is a conversation, and the bank sets its price.</div>',
      '<button class="btn" data-a="goto" data-t="governance" data-s="pack">The covenants</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
  }
  if(M.kind === 'applicant'){
    const c = (S.candidates || []).find(function(x){ return x.id === M.id; });
    if(!c) return modalHTML('<h2>Gone</h2>', '<div class="tiny muted">They found work somewhere else.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const tr = traitOf(c.trait), ask = c.ask || c.salary;
    return modalHTML('<h2>' + esc(c.name) + '</h2><div class="tiny muted">Looking for work · ' + fmt(c.salary) + '/mo · asking ' + fmt(ask) + '</div>',
      ringsHTML([{ico: 'star', label: 'Skill', v: (c.skill || 0) * 10, text: (c.skill || 0) + '/10'}]) +
      (tr && tr.name ? '<div class="tiny muted" style="margin-top:8px"><b>' + esc(tr.name) + '</b> — ' + esc(tr.d || '') + '</div>' : '') +
      '<div class="row wrap" style="margin-top:12px;gap:6px"><button class="btn sm primary" data-a="hirenego" data-i="' + esc(c.id) + '">Make an offer</button>' +
      '<button class="btn sm" data-a="hireask" data-i="' + esc(c.id) + '">Take them at ' + fmt(ask) + '/mo</button></div>' +
      '<div class="tiny muted" style="margin-top:8px">Hiring costs half a month of salary upfront in recruitment.</div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="business">The business</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:440px"');
  }
  if(M.kind === 'seeker'){
    const c = (S.houseCands || []).find(function(x){ return x.id === M.id; });
    if(!c) return modalHTML('<h2>Gone</h2>', '<div class="tiny muted">They found work somewhere else.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const tr = traitOf(c.trait), R0 = HOUSE_ROLES[c.role] || {label: 'Household'}, ask = c.ask || c.salary;
    return modalHTML('<h2>' + esc(c.name) + '</h2><div class="tiny muted">' + esc(R0.label) + ' · going rate ' + fmt(houseSalaryFor(c.role, c.skill)) + '/mo' + (c.ref ? ' · via ' + esc(c.ref) : '') + '</div>',
      ringsHTML([{ico: 'star', label: 'Skill', v: (c.skill || 0) * 10, text: (c.skill || 0) + '/10'}]) +
      (tr && tr.name ? '<div class="tiny muted" style="margin-top:8px"><b>' + esc(tr.name) + '</b> — ' + esc(tr.d || '') + '</div>' : '') +
      '<div class="row wrap" style="margin-top:12px;gap:6px"><button class="btn sm primary" data-a="housenego" data-i="' + esc(c.id) + '">Make an offer</button>' +
      '<button class="btn sm" data-a="houseask" data-i="' + esc(c.id) + '">Take at ' + fmt(ask) + '/mo</button></div>' +
      '<div class="tiny muted" style="margin-top:8px">Paid by: <select data-hpayerc="' + esc(c.id) + '" style="font-size:11px;padding:2px">' +
        '<option value="you"' + ((c.payer || 'you') === 'you' ? ' selected' : '') + '>You</option>' +
        bizList().map(function(b){ return '<option value="' + b.id + '"' + (c.payer === b.id ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('') +
      '</select></div>',
      '<button class="btn" data-a="goto" data-t="work" data-s="household">The household</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:440px"');
  }
  if(M.kind === 'coming'){
    const items = comingBack(), it = items[+M.id || 0];
    if(!it) return modalHTML('<h2>Arrived</h2>', '<div class="tiny muted">It has already landed.</div>', '<button class="btn primary" data-a="close">Close</button>');
    const q = it.turn - S.turn;
    return modalHTML('<h2>' + esc(it.title) + '</h2><div class="tiny muted">' + esc(dateLabel(it.turn)) + ' \u00b7 ' + (q <= 0 ? 'this quarter' : 'in ' + q + ' quarter' + (q === 1 ? '' : 's')) + (it.from ? ' \u00b7 from ' + esc(it.from) : '') + '</div>',
      '<div class="roadwrap">' + roadAheadSVG(items) + '</div><div class="tiny muted">' + (it.kind === 'good' ? 'Good news is on its way.' : it.kind === 'bad' ? 'This one will cost you.' : 'What it brings is not yet clear.') + '</div>',
      '<button class="btn" data-a="goto" data-t="overview">Everything coming back</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
  }
  return modalHTML('<h2>You</h2>', lifeRingsHTML() + '<div class="row wrap" style="margin-top:12px;gap:6px">' + householdButtonsHTML() + '</div>',
    '<button class="btn" data-a="goto" data-t="legacy" data-s="record">Your record</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
}
