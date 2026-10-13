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
    else if(st.kind === 'tolet') out.push(goZone(54, gy - 134, 293, 183, 'Start a company', 'work', 'business'));
    /* the premises open their card: the lease, the cover, the books */
    else out.push(hotZone(54, gy - 134, 293, 183, (st.name || 'Your company') + ': the premises, the cover, the books', {a: 'hot', k: 'premises'}));
    if(st.rival && st.kind !== 'tower' && st.kind !== 'tolet') out.push(goZone(316, gy - 80, 74, 104, 'Your rival: ' + st.rival.name, 'work', 'rival'));
    /* the customers at the door: what brings them in */
    (st.cspots || []).forEach(function(c){ out.push(hotZone(c.x, c.y, Math.max(16, c.w), Math.max(30, c.h), 'Your customers: price, marketing, quality', {a: 'hot', k: 'customers'})); });
    /* your staff, at their stations, over the premises: each opens their card */
    (st.spots || []).forEach(function(sp){ out.push(hotZone(sp.x, sp.y, Math.max(16, sp.w), Math.max(30, sp.h), 'Your staff', {a: 'hot', k: 'staff', c: sp.id})); });
    /* the stock beside it, and you */
    if(st.stockspot) out.push(hotZone(st.stockspot.x, st.stockspot.y, Math.max(24, st.stockspot.w), Math.max(24, st.stockspot.h), 'Your stock and your suppliers', {a: 'hot', k: 'stock'}));
    if(st.mespot) out.push(hotZone(st.mespot.x, st.mespot.y, st.mespot.w, st.mespot.h, 'You: what you take out of the company', {a: 'hot', k: 'owner'}));
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
/* The machine, in one place: the three levers that turn profit into cash and
   the three buttons for cover, books and equipment - the Levers card and the
   cards opened from the scene (the stock, the customers, you, the premises),
   the same inputs through the same handlers */
function leverSliderHTML(b, which){
  const rev = Math.max(1, b.revenue || 0), sp = b.stockPolicy === undefined ? .45 : b.stockPolicy;
  if(which === 'cred') return '<div class="slider"><span>Credit terms</span><input type="range" data-inp="bizcred" min="0" max="100" step="5" value="' + Math.round((b.creditTerms || 0) * 100) + '"><span class="mono" style="text-align:right">' + Math.round((b.creditTerms || 0) * 90) + ' days</span></div>' +
    '<div class="tiny muted" style="margin:-4px 0 9px 0">Selling on credit raises demand by up to 22%, but the cash arrives later and some of it never arrives at all.</div>';
  if(which === 'stock') return '<div class="slider"><span>Stock depth</span><input type="range" data-inp="bizstock" min="0" max="100" step="5" value="' + Math.round(sp * 100) + '"><span class="mono" style="text-align:right">' + stockWord(sp) + '</span></div>' +
    '<div class="tiny muted" style="margin:-4px 0 9px 0">Under-stock and you turn customers away with demand in the room. Over-stock and your cash is on a shelf, shrinking.</div>';
  return '<div class="slider"><span>Owner draw</span><input type="range" data-inp="bizdraw" min="0" max="' + Math.max(1000000, Math.round(rev * 0.5)) + '" step="' + Math.max(50000, Math.round(rev * 0.01)) + '" value="' + Math.round(b.draw || 0) + '"><span class="mono" style="text-align:right">' + fmt(Math.round(b.draw || 0)) + '</span></div>' +
    '<div class="tiny muted" style="margin:-4px 0 9px 0">Per quarter, if the company can fund it. Last quarter it paid out ' + fmt(b.drawnQ || 0) + '.</div>';
}
function stockWord(sp){ return sp < 0.25 ? 'Lean' : sp < 0.5 ? 'Balanced' : sp < 0.75 ? 'Deep' : 'Very deep'; }
function coverButtonsHTML(b){
  const rev = Math.max(1, b.revenue || 0);
  return '<button class="btn sm" data-a="bizinsure"' + (b.insured ? ' disabled aria-disabled="true" title="' + (b.insured === true ? 'This company is fully insured already' : 'It is part-insured; the policy tops up at the next quarter') + '"' : '') + '>' + (b.insured === true ? 'Insured' : b.insured ? 'Part-insured' : 'Insure (' + fmt(Math.round(Math.max(180000, rev * 0.012))) + '/q)') + '</button>' +
    '<button class="btn sm" data-a="bizacct">Engage an accountant (' + fmt(Math.round(Math.max(120000, rev * 0.008))) + '/q)</button>' +
    '<button class="btn sm" data-a="bizauto">Invest in equipment</button>';
}
/* the machine as four tiles on the sheet: each opens its card */
function machineTilesHTML(b){
  const sp = b.stockPolicy === undefined ? .45 : b.stockPolicy, conf = b.supplierConf === undefined ? 70 : b.supplierConf;
  const kept = Math.round((1 - (b.churnQ || 0)) * 100), L = b.lease || {};
  const tile = function(kind, ico, v, tone, name, what){
    return '<button class="facebtn" data-a="hot" data-k="' + kind + '" aria-label="' + esc(name + ': ' + what) + '"><span class="gfx hring" style="--p:' + Math.round(Math.max(0, Math.min(100, v))) + ';--c:' + tone + '"><em>' + worldIco(ico) + '</em></span>' +
      '<span>' + esc(name) + '</span><small>' + esc(what) + '</small></button>';
  };
  const t = function(v){ return v >= 60 ? 'var(--good)' : v >= 35 ? 'var(--warn)' : 'var(--bad)'; };
  return tile('stock', 'box', conf, t(conf), 'Stock', stockWord(sp)) +
    tile('customers', 'people', kept, t(kept), 'Customers', Math.round((b.creditTerms || 0) * 90) + ' days credit') +
    tile('owner', 'coins', Math.min(100, (b.draw || 0) / Math.max(1, (b.revenue || 0) * .5) * 100), 'var(--acc)', 'You', fmt(Math.round(b.draw || 0)) + '/q') +
    tile('premises', 'shop', b.compliance || 40, t(b.compliance || 40), 'Premises', L.end > 0 ? L.end + 'q on lease' : 'renewal due');
}
/* The commitments as tiles: what is in flight, then each lever you can take
   on. The ring is how far along it is - built while it is being set up, the
   term left while it runs - and each opens its card. */
const COMMIT_ICO = {shifts: 'moon', supply: 'truck', channel: 'cart', hire: 'hire', outlet: 'shop'};
function commitTilesHTML(b){
  const tile = function(id, ico, v, tone, name, what){
    return '<button class="facebtn" data-a="hot" data-k="commit" data-c="' + esc(id) + '" aria-label="' + esc(name + ': ' + what) + '"><span class="gfx hring" style="--p:' + Math.round(Math.max(0, Math.min(100, v))) + ';--c:' + tone + '"><em>' + worldIco(ico) + '</em></span>' +
      '<span>' + esc(name) + '</span><small>' + esc(what) + '</small></button>';
  };
  const live = (b.commitments || []).filter(function(c){ return (c.status === 'building' || c.status === 'active') && !LEVER_KINDS[c.kind]; });
  return live.map(function(c){
    const left = Math.max(0, (c.readyAt || S.turn) - S.turn), lead = Math.max(1, c.lead || 1);
    return tile(c.id, COMMIT_ICO[c.kind] || 'calendar', c.status === 'active' ? 100 : (1 - left / lead) * 100, 'var(--warn)', String(c.label || 'Commitment').replace(/^Hiring /, ''), c.status === 'active' ? 'running' : 'arrives in ' + left + 'q');
  }).join('') + Object.keys(LEVER_KINDS).map(function(k){
    const K = LEVER_KINDS[k], run = leverOf(b, k, 'active'), build = leverOf(b, k, 'building');
    if(run) return tile(k, COMMIT_ICO[k], Math.max(0, (run.endsAt || S.turn) - S.turn) / Math.max(1, K.term) * 100, 'var(--acc)', K.label, Math.max(0, (run.endsAt || S.turn) - S.turn) + 'q left');
    if(build) return tile(k, COMMIT_ICO[k], (1 - Math.max(0, (build.readyAt || S.turn) - S.turn) / Math.max(1, K.lead)) * 100, 'var(--warn)', K.label, 'arrives in ' + Math.max(0, (build.readyAt || S.turn) - S.turn) + 'q');
    return tile(k, COMMIT_ICO[k], 0, 'var(--line)', K.label, fmt(K.cost(b)));
  }).join('');
}
/* a commitment's card: what it gives and takes, how far along, and the one
   move it allows now - take it on, stand it down, or abandon it */
function commitCardHTML(b, id){
  const back = '<button class="btn" data-a="goto" data-t="work" data-s="business">The business</button><button class="btn ghost" data-a="close">Close</button>';
  const K = LEVER_KINDS[id];
  const c = K ? (leverOf(b, id, 'active') || leverOf(b, id, 'building')) : (b.commitments || []).find(function(x){ return x.id === id; });
  if(!K && !c) return modalHTML('<h2>Done</h2>', '<div class="tiny muted">It has already arrived, or been let go.</div>', '<button class="btn primary" data-a="close">Close</button>');
  const running = !!c && c.status === 'active', building = !!c && c.status === 'building';
  const left = running ? Math.max(0, (c.endsAt || S.turn) - S.turn) : building ? Math.max(0, (c.readyAt || S.turn) - S.turn) : 0;
  const term = K ? K.term : Math.max(1, (c && c.term) || 1), lead = K ? K.lead : Math.max(1, (c && c.lead) || 1);
  const ring = running ? {ico: 'calendar', label: 'Term left', v: left / term * 100, text: left + 'q', tone: 'var(--acc)'}
    : building ? {ico: 'calendar', label: 'Arrives in', v: (1 - left / lead) * 100, text: left + 'q', tone: 'var(--warn)'}
    : {ico: 'calendar', label: 'Arrives in', v: 0, text: lead + 'q', tone: 'var(--line)'};
  const take = !K || c ? '' : id === 'shifts' ? '<button class="btn sm primary" data-a="levershift">Commit ' + fmt(K.cost(b)) + '</button>'
    : id === 'supply' ? '<button class="btn sm primary" data-a="leversupply">Commit ' + fmt(K.cost(b)) + '</button>'
    : '<button class="btn sm primary" data-a="leverchannel">Commit ' + fmt(K.cost(b)) + '</button>';
  const out = running ? '<button class="btn sm bad" data-a="leverdrop" data-i="' + esc(c.id) + '">Stand it down — ' + fmt(commitDropCost(c)) + '</button>'
    : building ? '<button class="btn sm bad" data-a="abandon" data-i="' + esc(c.id) + '">Abandon — ' + fmt(commitBreak(c)) + '</button>' : '';
  return modalHTML('<h2>' + esc(K ? K.label : c.label || 'Commitment') + '</h2><div class="tiny muted">' +
      (running ? 'Running · ' + left + 'q of the term left' : building ? 'Being set up · ' + fmt(Math.round(c.paid || 0)) + ' of ' + fmt(Math.round(c.total || 0)) + ' spent' : lead + 'q to arrive · locked for ' + term + 'q') + '</div>',
    ringsHTML([ring]) +
    (K ? '<div class="tiny" style="margin-top:10px"><b class="good">Gives</b> — ' + esc(K.gives) + '</div><div class="tiny" style="margin-top:4px"><b class="bad">Takes</b> — ' + esc(K.takes) + '</div>' : c && c.note ? '<div class="tiny muted" style="margin-top:10px">' + esc(c.note) + '</div>' : '') +
    '<div class="row wrap" style="margin-top:12px;gap:6px">' + take + out + '</div>' +
    '<div class="tiny muted" style="margin-top:8px">A term, not a setting: changing your mind is priced to hurt.</div>',
    back, 'style="max-width:460px"');
}
/* A deal is somebody bringing you a bet with a date on it. Each kind is
   drawn as where it happens - the bank for a bridge loan, the market for
   stock, the airport for an import, the land - with whoever introduced it standing in it,
   in their own colours. Read from the deal; the picture draws nothing new. */
const DEAL_MOMENTS = {flip: ['street', 'cast', 'letter'], place: ['office', 'cast investor', 'letter'], distress: ['market', 'cast', 'boxes'],
  bridge: ['bank', 'cast', 'cash letter'], arbitrage: ['airport', 'cast', 'boxes suitcase'], landbank: ['land', 'cast', 'sand'],
  franchise: ['office', 'cast', 'cert'], equity: ['market', 'cast', 'gen boxes']};
function dealMoment(d){
  const row = DEAL_MOMENTS[d.type] || ['bank', 'cast', 'cash'];
  const cast = d.castId ? (S.cast || []).find(function(c){ return c.id === d.castId; }) || null : null;
  return {place: row[0], sign: '', who: row[1].split(' ').map(function(w){ return w === 'cast' && !cast ? 'investor' : w; }), props: row[2].split(' '), cast: cast, title: ''};
}
/* the deals on the table as pictures: each opens its card */
function dealTilesHTML(ds){
  return ds.map(function(d){
    return '<button class="dealtile" data-a="hot" data-k="deal" data-c="' + esc(d.id) + '" aria-label="' + esc(d.name + ', upside ' + Math.round(d.ret * 100) + '%, ' + Math.round((1 - d.risk) * 100) + '% work out, ' + fmt(d.capital)) + '">' +
      '<span class="gfx dpic">' + momentSceneSVG(dealMoment(d), 220) + '</span>' +
      '<b>' + esc(d.name) + '</b>' + (d.via ? '<span class="dvia">via ' + esc(d.via) + '</span>' : '') +
      /* what you cannot afford says so before you tap it */
      (S.fin.cash < d.capital ? '<span class="dshort">short ' + fmt(Math.round(d.capital - S.fin.cash)) + '</span>' : '') +
      '<span class="dmeta"><span class="good">+' + Math.round(d.ret * 100) + '%</span> · ' + Math.round((1 - d.risk) * 100) + '% work out · ' + fmt(d.capital) + '</span></button>';
  }).join('');
}
/* a deal's card: the picture, the terms, what it is, and Commit or Pass -
   the row's own buttons, the refusal on a short Commit included */
function dealCardHTML(id){
  const d = (S.deals || []).find(function(x){ return x.id === id; });
  if(!d) return modalHTML('<h2>Gone</h2>', '<div class="tiny muted">That deal is off the table.</div>', '<button class="btn primary" data-a="close">Close</button>');
  const short = S.fin.cash < d.capital;
  return modalHTML('<h2>' + esc(d.name) + '</h2><div class="tiny muted">' + d.turns + ' quarter' + (d.turns === 1 ? '' : 's') + (d.via ? ' · introduced by ' + esc(d.via) : '') + ' · expires ' + dateLabel(d.expires) + '</div>',
    '<div class="moment">' + momentSceneSVG(dealMoment(d), 240) + '</div>' +
    ringsHTML([{ico: 'trend', label: 'Upside', v: Math.min(100, d.ret * 100), text: '+' + Math.round(d.ret * 100) + '%', tone: 'var(--good)'}, {ico: 'target', label: 'Work out', v: (1 - d.risk) * 100, text: Math.round((1 - d.risk) * 100) + '%'}]) +
    '<div class="tiny muted" style="margin-top:8px">' + esc(d.desc) + '</div>' +
    '<div class="row wrap" style="margin-top:12px;gap:6px">' +
      (short ? '<span class="chip y">short ' + fmt(Math.round(d.capital - S.fin.cash)) + '</span>' : '') +
      '<button class="btn sm primary" data-a="takedeal" data-d="' + esc(d.id) + '"' + (short ? ' disabled aria-disabled="true" title="Needs ' + fmt(d.capital) + ' · you have ' + fmt(S.fin.cash) + ' · short ' + fmt(Math.round(d.capital - S.fin.cash)) + ' · pass it and it is gone"' : '') + '>Commit ' + fmt(d.capital) + '</button>' +
      '<button class="btn sm" data-a="passdeal" data-d="' + esc(d.id) + '">Pass</button></div>' +
    '<div class="tiny muted" style="margin-top:8px">The odds are honest averages, not promises. Being introduced is not the same as being protected.</div>',
    '<button class="btn" data-a="goto" data-t="money" data-s="deals">The deals</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
}
/* the people offering to go into business with you, as faces: the stake as the ring */
function offerFacesHTML(offers){
  return offers.map(function(o){
    return '<button class="facebtn" data-a="hot" data-k="offer" data-c="' + esc(o.id) + '" aria-label="' + esc(o.name + ', ' + o.equity + '% for ' + fmt(o.capital)) + '">' +
      faceBadgeSVG(o.name, o.equity || 0, '#6b4fbf') + '<span>' + esc(String(o.name).split(' ')[0]) + '</span><small>' + o.equity + '% · ' + fmt(o.capital) + '</small></button>';
  }).join('');
}
function offerCardHTML(id){
  const o = (S.offers || []).find(function(x){ return x.id === id; });
  if(!o) return modalHTML('<h2>Gone</h2>', '<div class="tiny muted">They have taken their money elsewhere.</div>', '<button class="btn primary" data-a="close">Close</button>');
  return modalHTML('<h2>' + esc(o.name) + '</h2><div class="tiny muted">' + o.equity + '% of the company for ' + fmt(o.capital) + '</div>',
    '<div class="moment">' + momentSceneSVG({place: 'office', sign: '', who: ['investor'], props: ['cash'], cast: null, title: ''}, 240) + '</div>' +
    '<div class="tiny muted" style="margin-top:8px">' + esc(o.bg) + '. Brings <b>' + esc(o.skill) + '</b>. ' + esc(o.ask) + '.</div>' +
    '<div class="row wrap" style="margin-top:12px;gap:6px"><button class="btn sm primary" data-a="takepartner" data-i="' + esc(o.id) + '">Shake hands</button>' +
    '<button class="btn sm ghost" data-a="declineoffer" data-i="' + esc(o.id) + '">Not now</button></div>' +
    '<div class="tiny muted" style="margin-top:8px">A partner takes a permanent share of everything. Choose the person, not the money.</div>',
    '<button class="btn" data-a="goto" data-t="money" data-s="deals">The deals</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
}
/* The shareholders' agreement, clause by clause: what each says now, in a
   few words and in full, why it matters to you, and - for the five a special
   resolution can change - the amendment. Read from the deed. */
function deedClauses(b){
  const dd = deedOf(b), dl = ({mediation: 'resolved by mediation', shotgun: 'resolved by a shotgun clause', expert: 'resolved by an independent expert'})[dd.deadlock] || dd.deadlock;
  return [
    {key: 'preEmption', name: 'Pre-emption', ico: 'key', on: !!dd.preEmption, short: dd.preEmption ? 'holders first' : 'open to outsiders', amend: true,
      text: dd.preEmption ? 'Existing holders may buy new shares first' : 'New shares can go straight to an outsider', why: 'Whether a new round can dilute you without asking you first.'},
    {key: 'drag', name: 'Drag-along', ico: 'up', on: !!dd.drag, short: dd.drag ? dd.dragPct + '% can force' : 'nobody forced', amend: true,
      text: dd.drag ? 'Holders of ' + dd.dragPct + '% can force the rest to sell' : 'Nobody can be forced into a sale', why: 'Whether a buyer can be handed the whole company, you included.'},
    {key: 'tag', name: 'Tag-along', ico: 'hands', on: !!dd.tag, short: dd.tag ? 'minorities join' : 'left behind', amend: true,
      text: dd.tag ? 'Minorities can join any sale on the same terms' : 'Minorities can be left behind', why: 'Whether a sale of control has to take the small holders with it.'},
    {key: 'deadlock', name: 'Deadlock', ico: 'swords', on: true, short: dd.deadlock, amend: true,
      text: dl.charAt(0).toUpperCase() + dl.slice(1), why: 'What happens when the board splits and nobody will move.'},
    {key: 'reserved', name: 'Reserved matters', ico: 'ballot', on: dd.reserved.length > 0, short: dd.reserved.length + ' matters', amend: false,
      text: dd.reserved.map(function(k){ return (RES_KINDS[k] || {label: k}).label; }).join(', '), why: 'The decisions that need the holders, not just the board.'},
    {key: 'nonCompete', name: 'Non-compete', ico: 'lock', on: !!dd.nonCompete, short: dd.nonCompete ? dd.nonCompete + ' years' : 'none', amend: false,
      text: dd.nonCompete ? dd.nonCompete + ' years after you leave' : 'None', why: 'How long you cannot do this again somewhere else.'},
    {key: 'infoRights', name: 'Reporting', ico: 'calendar', on: true, short: dd.infoRights || 'annual', amend: true,
      text: dd.infoRights === 'monthly' ? 'Monthly accounts to holders' : (dd.infoRights === 'quarterly' ? 'Quarterly accounts to holders' : 'Annual only'), why: 'How often the holders see the numbers, and so how early they see trouble.'},
    {key: 'leaver', name: 'Leaver', ico: 'door', on: dd.leaver === 'goodbad', short: dd.leaver === 'goodbad' ? 'good / bad' : 'vests anyway', amend: false,
      text: dd.leaver === 'goodbad' ? 'Good leaver keeps vested equity; bad leaver forfeits' : 'All equity vests regardless', why: 'What a founder who walks away keeps.'}
  ];
}
function deedTilesHTML(b){
  const tile = function(key, ico, v, tone, name, what){
    return '<button class="facebtn" data-a="hot" data-k="clause" data-c="' + key + '" aria-label="' + esc(name + ': ' + what) + '"><span class="gfx hring" style="--p:' + v + ';--c:' + tone + '"><em>' + worldIco(ico) + '</em></span>' +
      '<span>' + esc(name) + '</span><small>' + esc(what) + '</small></button>';
  };
  return deedClauses(b).map(function(c){ return tile(c.key, c.ico, c.on ? 100 : 0, 'var(--acc)', c.name, c.short); }).join('') +
    (extHolders(b).length ? tile('shotgun', 'target', canShotgun(b) ? 100 : 0, 'var(--bad)', 'Shotgun', canShotgun(b) ? 'can be fired' : 'not yet') : '');
}
function clauseCardHTML(b, key){
  const back = '<button class="btn" data-a="goto" data-t="governance" data-s="deed">The deed</button><button class="btn ghost" data-a="close">Close</button>';
  if(key === 'shotgun'){
    const sg = extHolders(b);
    return modalHTML('<h2>The shotgun</h2><div class="tiny muted">A whole-company price, named by you</div>',
      '<div class="tiny muted">You name a whole-company price. The other side must either buy you out at it or sell to you at it. Name it too high and you fund the buyout. Name it too low and you have just sold your company at your own number.</div>' +
      (canShotgun(b) ? '<div class="row wrap" style="margin-top:12px;gap:6px">' + sg.slice(0, 2).map(function(x){ return '<button class="btn sm bad" data-a="shotgun" data-h="' + esc(x.id) + '">Trigger against ' + esc(x.name) + '</button>'; }).join('') + '</div>'
        : '<div class="tiny muted" style="margin-top:10px">Not available yet' + (deedOf(b).shotgunCooldown > 0 ? ' (used recently)' : (b.externalPct || 0) < 15 ? ' (needs a holder with at least 15%)' : '') + '.</div>'),
      back, 'style="max-width:460px"');
  }
  const c = deedClauses(b).find(function(x){ return x.key === key; });
  if(!c) return modalHTML('<h2>Not a clause</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
  return modalHTML('<h2>' + esc(c.name) + '</h2><div class="tiny muted">' + esc(c.why) + '</div>',
    '<div class="clause">' + (c.key === 'reserved' ? deedOf(b).reserved.map(function(k){ return '<span class="chip">' + esc((RES_KINDS[k] || {label: k}).label) + '</span>'; }).join(' ') : esc(c.text)) + '</div>' +
    (c.amend ? '<div class="tiny muted" style="margin-top:10px">Amendments need a special resolution — 75% of the shares. If you hold less than 25%, you can block one.</div>' +
      '<div class="row wrap" style="margin-top:8px"><button class="btn sm" data-a="amenddeed" data-k="' + c.key + '">Propose an amendment</button></div>'
      : '<div class="tiny muted" style="margin-top:10px">Set when the agreement was signed.</div>'),
    back, 'style="max-width:460px"');
}
/* The register as a picture: who owns what as a ring - you in gold, as on
   the boardroom wall - your holding, the board and the chair as gauges, and
   what a sale today would pay each holder as one bar. */
function registerPictureHTML(b){
  const hs = (b.shares || []).slice().sort(function(a, c){ return c.shares - a.shares; });
  const pal = ['#5aa9ff', '#a78bfa', '#2fd47a', '#ff9f43', '#ff5f6d', '#8b9bb0'];
  const colOf = function(x, i){ return x.you ? '#f5b301' : pal[i % pal.length]; };
  const R = 38, C = 2 * Math.PI * R;
  let at = 0, i = 0;
  const arcs = hs.map(function(x){
    const p = Math.max(0, x.pct || 0) / 100, s = '<circle cx="50" cy="50" r="' + R + '" fill="none" stroke="' + colOf(x, x.you ? 0 : i++) + '" stroke-width="16" stroke-dasharray="' + (C * p).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-C * at).toFixed(2) + '" transform="rotate(-90 50 50)"/>';
    at += p; return s;
  }).join('');
  i = 0;
  const legend = hs.map(function(x){
    const col = colOf(x, x.you ? 0 : i++);
    return '<div class="rleg"><i style="background:' + col + '"></i><span>' + (x.you ? '<b>' + esc(x.name) + '</b>' : esc(x.name)) + '</span><b>' + pct((x.pct || 0) / 100, 1) + '</b>' +
      (x.pref > 0 ? '<span class="chip y">' + x.pref.toFixed(1) + 'x pref' + (x.participate ? ' + part' : '') + '</span>' : '') + '</div>';
  }).join('');
  const seats = boardOf(b).filter(function(d){ return !d.departing; }).length, ent = Math.max(1, seatEntitlement(b));
  const w = liquidationWaterfall(b, bizValue(b)), tot = Math.max(1, w.rows.reduce(function(s, r){ return s + Math.max(0, r.amt); }, 0));
  i = 0;
  const bar = w.rows.map(function(r){
    const col = r.you ? '#f5b301' : pal[(i++) % pal.length];
    return '<i style="width:' + (Math.max(0, r.amt) / tot * 100).toFixed(1) + '%;background:' + col + '" title="' + esc(r.name + ' ' + fmt(r.amt)) + '"></i>';
  }).join('');
  return '<div class="regpic"><svg class="gfx regring" viewBox="0 0 100 100" role="img" aria-label="' + esc(hs.map(function(x){ return x.name + ' ' + Math.round(x.pct || 0) + '%'; }).join(', ')) + '">' +
      '<circle cx="50" cy="50" r="' + R + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="16"/>' + arcs +
      '<text x="50" y="48" text-anchor="middle" font-size="15" font-weight="700" fill="#f5b301">' + Math.round(yourPct(b)) + '%</text><text x="50" y="62" text-anchor="middle" font-size="8" fill="#9aa7b6">yours</text></svg>' +
    '<div class="rlegs">' + legend + '</div></div>' +
    ringsHTML([{ico: 'seal', label: 'Your holding', v: yourPct(b), text: pct(yourPct(b) / 100, 1)}, {ico: 'table', label: 'Board seats', v: seats / ent * 100, text: seats + ' / ' + ent, tone: 'var(--info)'},
      {ico: 'medal', label: 'Chair', v: chairIsYours(b) ? 100 : 0, text: chairIsYours(b) ? 'You' : (chairOf(b) || {name: '—'}).name.split(' ')[0], tone: 'var(--acc)'}]) +
    '<div class="tiny muted" style="margin-top:10px">Sold at today’s value, after the preference stack:</div>' +
    '<span class="gfx wfall" role="img" aria-label="' + esc(w.rows.map(function(r){ return r.name + ' ' + fmt(r.amt); }).join(', ')) + '">' + bar + '</span>' +
    '<div class="kv"><span><b>Your net on a sale today</b></span><span class="mid ' + (w.mine > 0 ? 'good' : 'bad') + '">' + fmt(w.mine) + '</span></div>';
}
/* The chronicle as a life: what you are worth, quarter by quarter, as one
   line from the start of the run to now, with every quarter something
   happened pinned on it - green where the good outweighed the bad, red where
   it did not - and the quarters as tiles, an icon for each thing that
   happened. Each opens the quarter in full. Read from the journal and the
   run's own history. */
const CHRONICLE_ICO = {biz: 'shop', life: 'home', money: 'coins', invest: 'trend', macro: 'globe', start: 'flag', career: 'case', season: 'calendar', health: 'heart', end: 'medal'};
const CHRONICLE_TONE = {good: 'var(--good)', bad: 'var(--bad)', warn: 'var(--warn)', macro: 'var(--info)', begin: 'var(--acc)'};
function chronicleQuarters(js){
  const out = [];
  js.forEach(function(j){
    const last = out[out.length - 1];
    if(last && last.turn === j.turn) last.items.push(j); else out.push({turn: j.turn, date: j.date, items: [j]});
  });
  return out;
}
function quarterTone(q){
  const g = q.items.filter(function(j){ return j.kind === 'good'; }).length, b = q.items.filter(function(j){ return j.kind === 'bad'; }).length;
  return g > b ? '#2fd47a' : b > g ? '#ff5f6d' : '#f5b301';
}
function lifeLineSVG(qs){
  const hist = (S.hist || []).filter(function(h){ return typeof h.nw === 'number'; });
  if(hist.length < 2) return '';
  const W = 390, H = 130, L = 14, R = 14, T = 16, B = 22;
  const t0 = hist[0].t, t1 = Math.max(t0 + 1, hist[hist.length - 1].t);
  const lo = Math.min(0, Math.min.apply(null, hist.map(function(h){ return h.nw; }))), hi = Math.max(1, Math.max.apply(null, hist.map(function(h){ return h.nw; })));
  const X = function(t){ return L + (t - t0) / (t1 - t0) * (W - L - R); }, Y = function(v){ return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); };
  const nwAt = function(t){ let best = hist[0]; hist.forEach(function(h){ if(h.t <= t) best = h; }); return best.nw; };
  const line = hist.map(function(h, i){ return (i ? 'L' : 'M') + X(h.t).toFixed(1) + ' ' + Y(h.nw).toFixed(1); }).join(' ');
  const area = line + ' L' + X(hist[hist.length - 1].t).toFixed(1) + ' ' + Y(lo).toFixed(1) + ' L' + X(t0).toFixed(1) + ' ' + Y(lo).toFixed(1) + 'Z';
  const pins = qs.filter(function(q){ return q.turn >= t0 && q.turn <= t1; }).map(function(q){
    const x = X(q.turn), y = Y(nwAt(q.turn)), r = 3.5 + Math.min(3.5, q.items.length * .7);
    return '<g class="hot" data-a="hot" data-k="quarter" data-c="' + q.turn + '" role="button" tabindex="0" aria-label="' + esc(q.date + ': ' + q.items.length + ' thing' + (q.items.length === 1 ? '' : 's') + ' happened') + '"><title>' + esc(q.date) + '</title>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11" fill="#fff" fill-opacity="0"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + quarterTone(q) + '" stroke="#0b1017" stroke-width="1.5"/></g>';
  }).join('');
  const first = hist[0], last = hist[hist.length - 1];
  return '<svg class="gfx lifeline" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Net worth from ' + fmt(first.nw) + ' at ' + first.age + ' to ' + fmt(last.nw) + ' at ' + last.age) + '">' +
    '<defs><linearGradient id="llg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5b301" stop-opacity=".35"/><stop offset="1" stop-color="#f5b301" stop-opacity="0"/></linearGradient></defs>' +
    (lo < 0 ? '<path d="M' + L + ' ' + Y(0).toFixed(1) + ' H' + (W - R) + '" stroke="rgba(255,255,255,.18)" stroke-dasharray="3 3"/>' : '') +
    '<path d="' + area + '" fill="url(#llg)"/><path d="' + line + '" fill="none" stroke="#f5b301" stroke-width="2.2" stroke-linejoin="round"/>' + pins +
    '<text x="' + L + '" y="' + (H - 6) + '" font-size="10" fill="#9aa7b6">age ' + first.age + '</text><text x="' + (W - R) + '" y="' + (H - 6) + '" font-size="10" fill="#9aa7b6" text-anchor="end">age ' + last.age + ' · ' + fmt(last.nw) + '</text>' +
    '<text x="' + L + '" y="11" font-size="10" fill="#9aa7b6">' + fmt(hi) + '</text></svg>';
}
function chronicleTilesHTML(qs){
  return qs.map(function(q){
    return '<button class="qtile" data-a="hot" data-k="quarter" data-c="' + q.turn + '" aria-label="' + esc(q.date + ': ' + q.items.length + ' thing' + (q.items.length === 1 ? '' : 's') + ' happened') + '" style="border-top-color:' + quarterTone(q) + '">' +
      '<b>' + esc(q.date) + '</b><span class="gfx qicos">' + q.items.slice(0, 6).map(function(j){ return '<i style="color:' + (CHRONICLE_TONE[j.kind] || 'var(--dim)') + '">' + worldIco(CHRONICLE_ICO[j.cat] || 'note') + '</i>'; }).join('') + '</span>' +
      '<small>' + q.items.length + ' thing' + (q.items.length === 1 ? '' : 's') + '</small></button>';
  }).join('');
}
/* the chronicle, world-first: the line, then what just happened open in
   full - the newest quarter - and every quarter before it as a tile */
function chronicleInnerHTML(js){
  const qs = chronicleQuarters(js), now = qs[0];
  return lifeLineSVG(qs) +
    (now ? '<div class="qnow"><b>' + esc(now.date) + '</b>' + now.items.map(quarterEntryHTML).join('') + '</div>' : '') +
    (qs.length > 1 ? '<div class="qtiles">' + chronicleTilesHTML(qs.slice(1)) + '</div>' : '');
}
function quarterEntryHTML(j){
  return '<div class="qentry" style="border-left-color:' + (CHRONICLE_TONE[j.kind] || 'var(--line)') + '"><span class="gfx">' + worldIco(CHRONICLE_ICO[j.cat] || 'note') + '</span><div>' + esc(j.text) + '</div></div>';
}
function quarterCardHTML(turn){
  const q = chronicleQuarters(S.journal.slice(0, 40)).find(function(x){ return String(x.turn) === String(turn); });
  if(!q) return modalHTML('<h2>Not in the chronicle</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
  const h = (S.hist || []).find(function(x){ return x.t === q.turn; });
  return modalHTML('<h2>' + esc(q.date) + '</h2><div class="tiny muted">' + (h ? 'Age ' + h.age + ' · worth ' + fmt(h.nw) + ' · ' : '') + q.items.length + ' thing' + (q.items.length === 1 ? '' : 's') + ' happened</div>',
    q.items.map(quarterEntryHTML).join(''),
    '<button class="btn" data-a="goto" data-t="legacy" data-s="chronicle">The chronicle</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:480px"');
}
/* A waterfall: totals stand on the floor, each movement steps from where the
   last bar ended - up in green, down in red. The board pack's profit and its
   cash, drawn the way a finance director draws them. */
function waterfallSVG(steps, label){
  const W = 390, H = 170, T = 18, B = 30, L = 4, n = steps.length, bw = (W - L * 2) / n;
  let run = 0;
  const bars = steps.map(function(s){
    const from = s.kind === 'total' ? 0 : run, to = s.kind === 'total' ? s.v : run + s.v;
    run = to;
    return {s: s, from: from, to: to};
  });
  const vals = bars.reduce(function(a, b){ return a.concat([b.from, b.to]); }, [0]);
  const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), span = Math.max(1, hi - lo);
  const Y = function(v){ return T + (1 - (v - lo) / span) * (H - T - B); };
  const short = function(v){ const a = Math.abs(v), sign = v < 0 ? '−' : ''; return sign + '₦' + (a >= 1e9 ? (a / 1e9).toFixed(1) + 'b' : a >= 1e6 ? (a / 1e6).toFixed(1) + 'm' : a >= 1e3 ? Math.round(a / 1e3) + 'k' : Math.round(a)); };
  const g = bars.map(function(b, i){
    const x = L + i * bw + bw * .14, w = bw * .72, y0 = Y(Math.max(b.from, b.to)), h = Math.max(1.5, Math.abs(Y(b.from) - Y(b.to)));
    const col = b.s.kind === 'total' ? (b.to >= 0 ? '#f5b301' : '#ff5f6d') : (b.s.v >= 0 ? '#2fd47a' : '#ff5f6d');
    const link = i < bars.length - 1 ? '<path d="M' + (x + w).toFixed(1) + ' ' + Y(b.to).toFixed(1) + ' H' + (x + bw).toFixed(1) + '" stroke="rgba(255,255,255,.25)" stroke-dasharray="2 2"/>' : '';
    return '<rect x="' + x.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2" fill="' + col + '"' + (b.s.kind === 'total' ? '' : ' opacity=".9"') + '/>' + link +
      '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y0 - 4).toFixed(1) + '" font-size="8.5" text-anchor="middle" fill="#dfe6ee"' + (b.s.kind === 'total' ? ' font-weight="700"' : '') + '>' + short(b.s.v) + '</text>' +
      '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 16) + '" font-size="8.5" text-anchor="middle" fill="#9aa7b6">' + esc(b.s.t) + '</text>';
  }).join('');
  return '<svg class="gfx wfchart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label + ': ' + steps.map(function(s){ return s.t + ' ' + fmt(s.v); }).join(', ')) + '">' +
    (lo < 0 ? '<path d="M0 ' + Y(0).toFixed(1) + ' H' + W + '" stroke="rgba(255,255,255,.22)"/>' : '') + g + '</svg>';
}
/* the management accounts as a picture: the quarter from revenue down to
   net profit, the margins and the year on year under it */
function accountsPictureHTML(a){
  const yoy = function(name, cur, prev){ const d = delta(cur, prev); return d === undefined ? '' : '<span class="chip ' + (d >= 0 ? 'g' : 'r') + '">' + name + ' ' + (d >= 0 ? '+' : '−') + pct(Math.abs(d), 0) + ' on last year</span>'; };
  return waterfallSVG([{t: 'Revenue', v: a.revenue, kind: 'total'}, {t: 'Costs', v: -a.cogs}, {t: 'Gross', v: a.gross, kind: 'total'}, {t: 'Opex', v: -a.opex},
      {t: 'EBITDA', v: a.ebitdaQ, kind: 'total'}, {t: 'Deprec.', v: -a.dep}, {t: 'Interest', v: -a.interest}, {t: 'Tax', v: -(a.cur.tax || 0)}, {t: 'Net', v: a.profit, kind: 'total'}], 'The quarter, revenue to net profit') +
    '<div class="row wrap" style="gap:5px;margin:6px 0 8px"><span class="chip">gross margin ' + pct(a.gm, 0) + '</span><span class="chip">costs ' + pct(a.om, 0) + ' of revenue</span><span class="chip ' + (a.nm >= 0 ? 'g' : 'r') + '">net margin ' + pct(a.nm, 0) + '</span>' +
      yoy('revenue', a.revenue, a.yoy ? a.yoy.revenue : null) + yoy('EBITDA', a.ebitdaQ, a.yoy ? a.yoy.ebitda : null) + yoy('profit', a.profit, a.yoy ? a.yoy.profit : null) + '</div>' +
    acctRow('Trailing twelve months: revenue', a.revTTM) +
    acctRow('Trailing twelve months: EBITDA', a.ebitda, undefined, function(v){ return '<span class="' + (v >= 0 ? 'good' : 'bad') + '">' + fmt(v) + '</span>'; });
}
/* the cash as a picture: opening to closing, and how long a naira is inside */
function cashPictureHTML(a){
  const day = function(label, ico, d, tone){ return {ico: ico, label: label, v: Math.min(100, d / 120 * 100), text: d + ' days', tone: tone}; };
  return waterfallSVG([{t: 'Opening', v: a.openCash, kind: 'total'}, {t: 'Trading', v: Math.round(a.profit + a.dep)}, {t: 'Working cap.', v: -Math.round(a.wcMove)},
      {t: 'Capex', v: -a.capexQ}, {t: 'Financing', v: a.financing}, {t: 'Closing', v: a.closeCash, kind: 'total'}], 'Cash this quarter') +
    ringsHTML([day('Customers pay', 'people', a.dso, 'var(--info)'), day('Stock sits', 'box', a.dio, 'var(--info)'), day('You pay', 'truck', a.dpo, 'var(--info)'),
      day('Cash cycle', 'calendar', a.ccc, a.ccc < 45 ? 'var(--good)' : a.ccc > 90 ? 'var(--bad)' : 'var(--warn)')]) +
    '<div class="tiny muted prose" style="margin-top:7px">The cash cycle is how long a naira spends inside the business before it comes back. ' +
    (a.ccc > 90 ? 'Yours is ' + a.ccc + ' days, which means growth consumes cash faster than it generates it.' : a.ccc < 45 ? 'Yours is ' + a.ccc + ' days. Growth here is close to self-funding.' : 'Yours is ' + a.ccc + ' days, which is normal and worth watching.') + '</div>';
}
/* the operating KPIs as gauges where they are a share, rows where they are money */
function kpisPictureHTML(a, b){
  const outside = (b.externalPct || 0) > 0;
  return ringsHTML([{ico: 'gear', label: 'Capacity used', v: a.util * 100, text: pct(a.util, 0), tone: a.util > .95 ? 'var(--bad)' : a.util > .6 ? 'var(--good)' : 'var(--warn)'}].concat(outside ? [
      {ico: 'calendar', label: 'Runway', v: Math.min(100, a.runway / 12 * 100), text: a.runway >= 99 ? 'indefinite' : a.runway + ' quarters', tone: a.runway < 4 ? 'var(--bad)' : a.runway < 8 ? 'var(--warn)' : 'var(--good)'}] : [])) +
    '<div style="margin-top:8px">' + acctRow('Revenue per head', a.staff > 0 ? a.revPerHead : 0, undefined, function(v){ return a.staff > 0 ? fmt(v) : '\u2014'; }) +
    acctRow('Revenue per unit', a.revPerUnit) + acctRow('Headcount', a.staff, undefined, function(v){ return String(v); }) +
    (outside ? acctRow('Quarterly burn', a.burn, undefined, function(v){ return v > 0 ? '<span class="bad">' + fmt(v) + '</span>' : 'profitable'; }) + acctRow('Company debt', a.debt) +
      '<div class="tiny muted" style="margin-top:7px">' + (a.runway < 4 ? 'Under four quarters of runway, outside shareholders stop asking about strategy and start asking about the next raise.'
        : a.runway < 8 ? 'Eight quarters is enough to raise from a position of strength. Fewer is not.' : 'You have time, which is the only thing money cannot buy later.') + '</div>' : '') + '</div>';
}
/* The cash cycle, drawn as time: how long the stock sits, then how long the
   customers take to pay - and under it how long the suppliers wait for you.
   The gap is the cash cycle: the days a naira is inside the business. */
function wcCycleInner(b){
  const c = cccOf(b), W = 390, L = 8, R = 8, span = Math.max(30, c.dio + c.dso, c.dpo);
  const X = function(d){ return L + d / span * (W - L - R); };
  const tone = c.ccc < 45 ? '#2fd47a' : c.ccc > 90 ? '#ff5f6d' : '#ff9f43';
  const seg = function(x0, x1, y, col){ return '<rect x="' + X(x0).toFixed(1) + '" y="' + y + '" width="' + Math.max(2, X(x1) - X(x0)).toFixed(1) + '" height="14" rx="3" fill="' + col + '"/>'; };
  return '<svg class="gfx wccycle" viewBox="0 0 ' + W + ' 112" role="img" aria-label="' + esc('Stock sits ' + c.dio + ' days, customers take ' + c.dso + ' days, you take ' + c.dpo + ' days to pay suppliers: a cash cycle of ' + c.ccc + ' days') + '">' +
    '<text x="' + L + '" y="12" font-size="9.5" fill="#ff9f43">stock sits ' + c.dio + 'd · ' + fmt(Math.round(b.inventory || 0)) + '</text>' +
    '<text x="' + (W - R) + '" y="12" font-size="9.5" fill="#5aa9ff" text-anchor="end">customers owe ' + c.dso + 'd · ' + fmt(Math.round(b.recv || 0)) + '</text>' +
    seg(0, c.dio, 18, '#ff9f43') + seg(c.dio, c.dio + c.dso, 18, '#5aa9ff') +
    seg(0, c.dpo, 44, '#2fd47a') + '<text x="' + L + '" y="72" font-size="9.5" fill="#2fd47a">suppliers wait ' + c.dpo + 'd · you owe ' + fmt(Math.round(b.payable || 0)) + '</text>' +
    '<path d="M' + X(Math.min(c.dpo, c.dio + c.dso)).toFixed(1) + ' 86 V94 H' + X(c.dio + c.dso).toFixed(1) + ' V86" fill="none" stroke="' + tone + '" stroke-width="2"/>' +
    '<text x="' + ((X(Math.min(c.dpo, c.dio + c.dso)) + X(c.dio + c.dso)) / 2).toFixed(1) + '" y="107" font-size="10.5" font-weight="700" text-anchor="middle" fill="' + tone + '">cash cycle ' + c.ccc + ' days</text></svg>';
}
/* The position, drawn: what the company owns against what it owes, as two
   bars to the same scale - the gap is what you actually own - and the quarter
   as a waterfall from revenue to profit. */
function positionInner(b){
  const equip = Math.max(0, b.capex || 0), cash = Math.max(0, b.cash || 0), recv = b.recv || 0, stock = b.inventory || 0, pay = b.payable || 0, arr = b.arrears || 0;
  const owns = cash + recv + stock + equip, owes = pay + arr, top = Math.max(1, owns, owes), W = 390, L = 46, R = 8;
  const bar = function(parts, y){
    let x = L;
    return parts.map(function(p){ const w = p[1] / top * (W - L - R), s = p[1] > 0 ? '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + Math.max(1, w).toFixed(1) + '" height="18" fill="' + p[2] + '"><title>' + esc(p[0] + ' ' + fmt(Math.round(p[1]))) + '</title></rect>' : ''; x += w; return s; }).join('');
  };
  const parts = [['Cash', cash, '#2fd47a'], ['Owed by customers', recv, '#5aa9ff'], ['Stock on hand', stock, '#ff9f43'], ['Equipment & fit-out', equip, '#8b9bb0']];
  const debts = [['Owed to suppliers', pay, '#ff5f6d'], ['Wages in arrears', arr, '#a3303a']];
  const run = (b.cash || 0) > 0 ? ((b.cash || 0) / Math.max(1, (b.opex || 0))).toFixed(1) : '0';
  return '<svg class="gfx posbars" viewBox="0 0 ' + W + ' 64" role="img" aria-label="' + esc('Owns ' + fmt(Math.round(owns)) + ', owes ' + fmt(Math.round(owes))) + '">' +
      '<text x="0" y="17" font-size="10" fill="#9aa7b6">owns</text>' + bar(parts, 4) + '<text x="0" y="45" font-size="10" fill="#9aa7b6">owes</text>' + bar(debts, 32) +
      '<rect x="' + L + '" y="32" width="' + (W - L - R) + '" height="18" fill="none" stroke="rgba(255,255,255,.08)"/></svg>' +
    '<div class="row wrap" style="gap:5px;margin:4px 0 8px">' + parts.concat(debts).filter(function(p){ return p[1] > 0; }).map(function(p){
      return '<span class="chip"><i class="dot" style="background:' + p[2] + '"></i>' + esc(p[0]) + ' ' + fmt(Math.round(p[1])) + '</span>'; }).join('') + '</div>' +
    '<div class="kv"><span><b>What you actually own</b></span><span class="mid ' + (owns - owes >= 0 ? 'good' : 'bad') + '">' + fmt(Math.round(owns - owes)) + '</span></div>' +
    waterfallSVG([{t: 'Revenue', v: b.revenue || 0, kind: 'total'}, {t: 'Cost of goods', v: -(b.cogs || 0)}, {t: 'Overheads', v: -(b.opex || 0)}, {t: 'Profit', v: b.profit || 0, kind: 'total'}], 'The quarter') +
    '<div class="tiny muted" style="margin-top:6px">Written off as bad debt this quarter: ' + fmt(b.badDebtQ || 0) + '. Lost to shrinkage and spoilage: ' + fmt(b.shrinkQ || 0) + '.</div>' +
    '<div class="tiny muted" style="margin-top:5px">At current overheads the company has <b>' + run + '</b> quarters of cash.</div>';
}
/* What you sold, what you can make and what was wanted, on one meter; and
   the company's standing as gauges */
function companyMeterInner(b){
  const sold = Math.round(b.units || 0), cap = Math.round(b.capacity || 0), dem = Math.round(b.demand || 0), top = Math.max(1, sold, cap, dem) * 1.06, W = 390, L = 4, R = 4;
  const X = function(v){ return L + v / top * (W - L - R); };
  return '<svg class="gfx dmeter" viewBox="0 0 ' + W + ' 66" role="img" aria-label="' + esc('Sold ' + sold + ', can make ' + cap + ', wanted ' + dem) + '">' +
      '<rect x="' + L + '" y="22" width="' + (W - L - R) + '" height="16" rx="8" fill="rgba(255,255,255,.07)"/>' +
      '<rect x="' + L + '" y="22" width="' + Math.max(2, X(sold) - L).toFixed(1) + '" height="16" rx="8" fill="#f5b301"/>' +
      '<path d="M' + X(cap).toFixed(1) + ' 16 V44" stroke="#dfe6ee" stroke-width="2.2"/><text x="' + X(cap).toFixed(1) + '" y="56" font-size="9.5" text-anchor="' + (X(cap) > W - 60 ? 'end' : 'middle') + '" fill="#dfe6ee">can make ' + cap + '</text>' +
      '<path d="M' + (X(dem) - 5).toFixed(1) + ' 8 h10 l-5 9z" fill="#5aa9ff"/><text x="' + X(dem).toFixed(1) + '" y="7" font-size="9.5" text-anchor="' + (X(dem) > W - 60 ? 'end' : X(dem) < 60 ? 'start' : 'middle') + '" fill="#5aa9ff" dy="-0">wanted ' + dem + '</text>' +
      '<text x="' + (L + 6) + '" y="34" font-size="9.5" font-weight="700" fill="#0b1017">sold ' + sold + '</text></svg>' +
    ringsHTML([{ico: 'star', label: 'Reputation', v: b.rep || 0, text: Math.round(b.rep || 0) + '/100'}, {ico: 'seal', label: 'Your equity', v: b.equity || 0, text: (b.equity || 0) + '%', tone: 'var(--acc)'},
      {ico: 'shop', label: 'Locations', v: Math.min(100, (b.locations || 1) * 20), text: String(b.locations || 1), tone: 'var(--info)'}]);
}
/* The group's quarter as a waterfall and, with more than one company, how
   much of it each one made; read from the consolidation */
function groupPLInner(g, subs){
  const pal = ['#5aa9ff', '#a78bfa', '#2fd47a', '#ff9f43', '#ff5f6d', '#8b9bb0'];
  const tot = Math.max(1, subs.reduce(function(s, r){ return s + Math.max(0, r.rev || 0); }, 0));
  return waterfallSVG([{t: 'Revenue', v: g.rev || 0, kind: 'total'}, {t: 'Costs', v: -(g.cogs || 0)}, {t: 'Overheads', v: -(g.opex || 0)}, {t: 'Deprec.', v: -(g.dep || 0)},
      {t: 'Interest', v: -(g.int || 0)}, {t: 'Tax', v: -(g.tax || 0)}, {t: 'Net', v: g.net || 0, kind: 'total'}], 'The group this quarter') +
    (subs.length > 1 ? '<div class="tiny muted" style="margin-top:6px">Revenue, by company</div><span class="gfx wfall" role="img" aria-label="' + esc(subs.map(function(r){ return r.name + ' ' + fmt(r.rev || 0); }).join(', ')) + '">' +
      subs.map(function(r, i){ return '<i style="width:' + (Math.max(0, r.rev || 0) / tot * 100).toFixed(1) + '%;background:' + pal[i % pal.length] + '" title="' + esc(r.name + ' ' + fmt(r.rev || 0)) + '"></i>'; }).join('') + '</span>' +
      '<div class="row wrap" style="gap:5px">' + subs.map(function(r, i){ return '<span class="chip"><i class="dot" style="background:' + pal[i % pal.length] + '"></i>' + esc(r.name) + ' · net <span class="' + ((r.net || 0) >= 0 ? 'good' : 'bad') + '">' + fmt(r.net || 0) + '</span></span>'; }).join('') + '</div>' : '');
}
/* Where the cash, the debt and the reserves sit: each company as three bars
   to one scale, what you own of it, and what it can pay up to you */
function groupCashInner(g, subs){
  const ents = [{name: holdcoName(), cash: g.holdcoCash, debt: g.holdcoDebt, res: g.holdcoRetained, own: 100, cap: null, note: '', you: true}]
    .concat(subs.map(function(r){ return {name: r.name, cash: r.cash, debt: r.debt, res: r.retained, own: r.own, cap: r.cap, note: r.note}; }));
  const top = Math.max(1, Math.max.apply(null, ents.map(function(e){ return Math.max(Math.abs(e.cash || 0), Math.abs(e.debt || 0), Math.abs(e.res || 0)); })));
  /* a negative figure - accumulated losses where reserves should be - is drawn red, not as a smaller good */
  const line = function(label, v, col){ return '<div class="gline"><span>' + label + '</span><span class="gfx gtrack"><i style="width:' + (Math.min(100, Math.abs(v || 0) / top * 100)).toFixed(1) + '%;background:' + ((v || 0) < 0 ? '#ff5f6d' : col) + '"></i></span><b' + ((v || 0) < 0 ? ' class="bad"' : '') + '>' + fmt(Math.round(v || 0)) + '</b></div>'; };
  return ents.map(function(e){
    return '<div class="gent"><div class="between"><b>' + esc(e.name) + '</b><span class="row" style="gap:4px">' + (e.you ? '' : '<span class="chip">' + Math.round(e.own) + '% yours</span>') +
        (e.cap === null ? '' : e.cap > 0 ? '<span class="chip g">can pay up ' + fmt(e.cap) + '</span>' : e.note ? '<span class="chip r">blocked</span>' : '') + '</span></div>' +
      line('cash', e.cash, '#2fd47a') + line('debt', e.debt, '#ff5f6d') + line('reserves', e.res, '#f5b301') + '</div>';
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
    /* a company that counts its customers says how many; one that does not says what it sold */
    return modalHTML('<h2>Your customers</h2><div class="tiny muted">' + (b.custBase ? Math.round(b.custBase).toLocaleString() + ' customers \u00b7 each new one costs about ' + fmt(b.cacQ || 0) : Math.round(b.units || 0).toLocaleString() + ' units sold last quarter') + '</div>',
      ringsHTML([{ico: 'people', label: 'Kept a quarter', v: kept, text: kept + '%'}, {ico: 'star', label: 'Quality', v: b.quality || 0}, {ico: 'target', label: 'Positioning', v: b.positioning === undefined ? 45 : b.positioning, tone: 'var(--info)'}]) +
      /* the Business screen's own three dials: the same inputs, through the same handler */
      '<div style="margin-top:12px">' +
      '<div class="slider"><span>Price</span><input type="range" data-inp="bizprice" min="60" max="160" step="2" value="' + Math.round((b.priceIdx || 1) * 100) + '"><span class="mono" style="text-align:right">' + ((b.priceIdx || 1) * 100).toFixed(0) + '%</span></div>' +
      '<div class="slider"><span>Marketing</span><input type="range" data-inp="bizmark" min="0" max="2000000" step="25000" value="' + (b.marketing || 0) + '"><span class="mono" style="text-align:right">' + fmt(b.marketing || 0) + '</span></div>' +
      '<div class="slider"><span>Quality</span><input type="range" data-inp="bizqual" min="0" max="600000" step="10000" value="' + (b.qualitySpendMonthly || 0) + '"><span class="mono" style="text-align:right">' + fmt(b.qualitySpendMonthly || 0) + '/mo</span></div>' +
      /* selling on credit is selling to them: the Levers card's own slider */
      leverSliderHTML(b, 'cred') +
      '<div class="kv"><span class="muted">Owed by customers</span><span>' + fmt(Math.round(b.recv || 0)) + '</span></div>' +
      '<div class="kv"><span class="muted">Written off as bad debt this quarter</span><span>' + fmt(b.badDebtQ || 0) + '</span></div>' +
      (b.keyClient ? '<div class="kv"><span class="muted">Concentration</span><span class="' + (b.keyClient.share > 0.3 ? 'bad' : '') + '">' + esc(b.keyClient.name) + ' · ' + Math.round(b.keyClient.share * 100) + '% of revenue</span></div>' : '') +
      (b.contracts || []).map(function(c){ return '<div class="kv"><span class="muted">Contract</span><span>' + esc(c.client || 'Client') + ' · ' + c.turns + 'q left</span></div>'; }).join('') +
      '<div class="kv"><span class="muted">Product lines</span><span>' + (b.products || 1) + '</span></div>' +
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
  if(M.kind === 'stock' || M.kind === 'owner' || M.kind === 'premises'){
    const b = S.biz;
    if(!b) return modalHTML('<h2>No company</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
    const rev = Math.max(1, b.revenue || 0), back = '<button class="btn" data-a="goto" data-t="work" data-s="business">The business</button><button class="btn ghost" data-a="close">Close</button>';
    if(M.kind === 'stock'){
      const conf = b.supplierConf === undefined ? 70 : b.supplierConf, owe = b.payable || 0;
      return modalHTML('<h2>Your stock</h2><div class="tiny muted">' + fmt(Math.round(b.inventory || 0)) + ' on hand · suppliers give you ' + (b.supplierDays || 30) + ' days</div>',
        ringsHTML([{ico: 'truck', label: 'Supplier confidence', v: conf}]) +
        '<div style="margin-top:12px">' + leverSliderHTML(b, 'stock') + '</div>' +
        '<div class="kv"><span class="muted">Owed to suppliers</span><span class="' + (owe > rev * 0.8 ? 'bad' : '') + '">' + fmt(Math.round(owe)) + '</span></div>' +
        '<div class="kv"><span class="muted">Lost to shrinkage and spoilage this quarter</span><span>' + fmt(b.shrinkQ || 0) + '</span></div>' +
        '<div style="margin-top:10px"><button class="btn sm" data-a="supplnego">Renegotiate supplier terms</button></div>' +
        '<div class="tiny muted" style="margin-top:6px">Your suppliers finance most of the stock you sell. Longer terms mean more stock on the shelf without cash; the relationship is what buys you those terms, and it is spent by stretching them.</div>',
        back, 'style="max-width:460px"');
    }
    if(M.kind === 'owner'){
      const run = (b.cash || 0) > 0 ? ((b.cash || 0) / Math.max(1, (b.opex || 0))).toFixed(1) : '0';
      return modalHTML('<h2>You, at ' + esc(b.name || 'your company') + '</h2><div class="tiny muted">The company holds ' + fmt(Math.round(b.cash || 0)) + ' · ' + run + ' quarters of overheads</div>',
        leverSliderHTML(b, 'draw') +
        '<div class="tiny muted">Profit is an opinion. Cash is a fact: what you take out is what the company no longer has when the quarter goes wrong.</div>',
        back, 'style="max-width:460px"');
    }
    const L = b.lease || {}, tax = b.taxRisk || 0;
    return modalHTML('<h2>The premises</h2><div class="tiny muted">' + fmt(Math.round(L.rent || 0)) + '/mo · ' + (L.end > 0 ? L.end + 'q left on lease' : 'RENEWAL DUE') + ' · ' + b.locations + ' location' + (b.locations === 1 ? '' : 's') + '</div>',
      ringsHTML([{ico: 'seal', label: 'Compliance', v: b.compliance || 40}, {ico: 'warn', label: 'Tax exposure', v: tax, tone: tax > 65 ? 'var(--bad)' : tax > 35 ? 'var(--warn)' : 'var(--good)'}, {ico: 'gear', label: 'Automation', v: b.auto || 0, tone: 'var(--info)'}]) +
      '<div class="kv" style="margin-top:10px"><span class="muted">Insurance</span><span>' + (b.insured === true ? 'Full' : b.insured ? 'Partial' : '<span class="bad">None</span>') + '</span></div>' +
      (b.incidents || []).map(function(i){ return '<div class="kv"><span class="muted">Lingering</span><span class="bad">' + esc(i.name) + ' (' + i.turns + 'q)</span></div>'; }).join('') +
      '<div class="row wrap" style="margin-top:10px;gap:6px">' + coverButtonsHTML(b) + '</div>' +
      '<div class="tiny muted" style="margin-top:8px">Automation raises output per person and improves stock control. Compliance is what an assessment will be judged against.</div>',
      back, 'style="max-width:460px"');
  }
  if(M.kind === 'clause'){
    if(!S.biz) return modalHTML('<h2>No company</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
    return clauseCardHTML(S.biz, M.id);
  }
  if(M.kind === 'quarter') return quarterCardHTML(M.id);
  if(M.kind === 'deal') return dealCardHTML(M.id);
  if(M.kind === 'offer') return offerCardHTML(M.id);
  if(M.kind === 'commit'){
    if(!S.biz) return modalHTML('<h2>No company</h2>', '', '<button class="btn primary" data-a="close">Close</button>');
    return commitCardHTML(S.biz, M.id);
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
