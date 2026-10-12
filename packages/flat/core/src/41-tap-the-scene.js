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
  return modalHTML('<h2>You</h2>', lifeRingsHTML() + '<div class="row wrap" style="margin-top:12px;gap:6px">' + householdButtonsHTML() + '</div>',
    '<button class="btn" data-a="goto" data-t="legacy" data-s="record">Your record</button><button class="btn ghost" data-a="close">Close</button>', 'style="max-width:460px"');
}
