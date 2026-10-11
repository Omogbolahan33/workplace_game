
/* =========================================================================
   The world: the game, as a place
   ========================================================================= */
/* Every screen in the game is a building, and every building stands where its
   screen sits in the navigation: the five tabs are a plaza and four districts,
   and each district's second-level routes are its buildings. Nothing here is a
   new screen and nothing here is a new rule - tapping a building is the same
   `goto` the tabs already use, and the screen it opens is the one that was
   always there. What the world adds is that the state each screen shows is
   also its *shape*: the career tower grows with the salary, the company with
   its outlets, the monument with the ambition.

   This half is core's: what the world contains, as data, with no DOM and no
   random draw - so the single file and the app read the same city, a test can
   hold it, and a world that is looked at is the same run as one that is not.
   How it is drawn is the ui's (`worldSync`, in packages/ui/src/18-world.js). */

/* The city is laid out on the axes of the screen, not of the ground: the camera
   looks along the diagonal, so `sx` runs left to right as the player sees it
   and `sy` runs top to bottom. A district's three lots in a row then read as a
   row, and their labels sit side by side instead of stacking up the screen.
   worldAt() turns a screen-axis position into ground coordinates. */
const WORLD_DISTRICTS = [
  {tab:'work',       sx:-12.6, sy:-13.6, colour:'#c9a978'},
  {tab:'money',      sx: 12.6, sy:-13.6, colour:'#6fb3a3'},
  {tab:'governance', sx:-12.6, sy: 13.6, colour:'#8e9bb8'},
  {tab:'legacy',     sx: 12.6, sy: 13.6, colour:'#b59ad0'},
];
const WORLD_COL = 6.8;           /* lot to lot along a row, screen-left to screen-right */
const WORLD_ROW = 10.6;          /* row to row, screen-top to screen-bottom */
function worldAt(sx, sy){
  const r = Math.SQRT1_2;
  return {x: Math.round((sx + sy) * r * 100) / 100, z: Math.round((sy - sx) * r * 100) / 100};
}

/* A building's height from a quantity that can span orders of magnitude, so a
   ₦50k salary and a ₦50m one are both on screen: 1.2 for nothing, up to 9. */
function worldHeight(v, lo, hi){
  if(!(v > 0)) return 1.2;
  const t = (Math.log10(v) - lo) / Math.max(0.01, hi - lo);
  return Math.round((1.6 + Math.max(0, Math.min(1, t)) * 7.4) * 10) / 10;
}
/* the short status a label carries under its name - one fact, never a sentence */
function worldNote(text){
  const t = String(text || '');
  return t.length > 18 ? t.slice(0, 17) + '…' : t;
}

/* What each screen looks like from outside, read from the state that screen
   draws. `shape` is one of tower | shop | house | plot | monument | hall |
   kiosk; `tone` is good | bad | warn | info | acc | '' (and `muted` when the
   screen has nothing to show yet - it is still there, and still opens). */
function worldBuilding(tab, sub){
  const p = S.p, f = S.fin, bz = bizList(), biz = S.biz;
  const cast = (S.cast||[]).filter(function(c){ return c.alive; });
  const assets = S.assets || [];
  const prop = assets.filter(function(a){ return a.id==='land' || a.id==='rental'; })
                     .reduce(function(s,a){ return s + (a.value||0); }, 0);
  const inv = assets.filter(function(a){ return a.id!=='land' && a.id!=='rental' && a.id!=='savings'; })
                    .reduce(function(s,a){ return s + (a.value||0); }, 0);
  const nw = netWorth();
  const k = tab + '/' + sub;
  switch(k){
    case 'work/business': {
      const units = bz.reduce(function(s,b){ return s + Math.max(1, (b.outlets||[]).length || b.locations || 1); }, 0);
      const broke = bz.some(function(b){ return b.cash < 0; });
      return {shape: bz.length ? 'shop' : 'plot', h: bz.length ? Math.min(7, 1.8 + units*0.9) : 1,
        tone: broke ? 'bad' : bz.length ? 'good' : '', muted: !bz.length,
        note: bz.length ? (bz.length===1 ? bz[0].name : bz.length+' companies') : 'no company yet'};
    }
    case 'work/career':
      return {shape:'tower', h: p.job ? worldHeight(p.job.monthly, 4.5, 7.5) : 1.4,
        tone: !p.job ? '' : p.jobPerf >= 65 ? 'good' : p.jobPerf < 40 ? 'warn' : '', muted: !p.job,
        note: p.job ? p.job.title : 'no job'};
    case 'work/household':
      return {shape:'house', h: 2 + Math.min(4, (S.house||[]).length*0.8 + (p.married?1:0) + p.kids*0.5),
        tone: p.family < 40 ? 'warn' : p.family >= 70 ? 'good' : '', muted:false,
        note: 'family ' + Math.round(p.family)};
    case 'work/life':
      return {shape:'house', h: 1.8 + p.happy/100*3,
        tone: p.stress > 75 || p.health < 35 ? 'bad' : p.stress > 55 ? 'warn' : 'good', muted:false,
        note: 'stress ' + Math.round(p.stress) + ' · health ' + Math.round(p.health)};
    case 'work/rival': {
      const r = S.rival;
      return {shape:'tower', h: r ? 1.5 + (r.size||0)/100*7 : 1.2,
        tone: r && r.aggro > 60 ? 'bad' : r ? 'warn' : '', muted: !r, note: r ? r.name : 'none'};
    }
    case 'work/levers':
      return {shape:'hall', h: biz ? 2.6 : 1.2, tone: '', muted: !biz, note: biz ? biz.name : 'needs a company'};
    case 'money/position':
      return {shape:'tower', h: worldHeight(Math.max(0, nw), 5, 9.5), tone: nw > 0 ? 'good' : 'bad', muted:false,
        note: fmt(nw)};
    case 'money/budget':
      return {shape:'kiosk', h: 2.2, tone: f.cash < 0 ? 'bad' : '', muted:false,
        note: fmt(budgetMonthly()) + '/mo'};
    case 'money/property':
      return {shape: prop > 0 ? 'house' : 'plot', h: prop > 0 ? worldHeight(prop, 5.5, 9) : 1,
        tone: prop > 0 ? 'good' : '', muted: !(prop > 0), note: prop > 0 ? fmt(prop) : 'nothing held'};
    case 'money/markets':
      return {shape:'hall', h: worldHeight(inv, 5, 9), tone: inv > 0 ? 'info' : '', muted: !(inv > 0),
        note: inv > 0 ? fmt(inv) : 'nothing invested'};
    case 'money/deals': {
      const n = (S.active||[]).length, open = (S.deals||[]).length;
      return {shape:'kiosk', h: 1.8 + n*0.8, tone: n ? 'acc' : '', muted: !n && !open,
        note: n ? n + ' running' : open + ' on the table'};
    }
    case 'money/group':
      return {shape:'tower', h: bz.length > 1 ? 2.5 + bz.length : 1.2, tone:'', muted: bz.length < 2,
        note: bz.length > 1 ? bz.length + ' companies' : 'one company or none'};
    case 'governance/pack': case 'governance/register': case 'governance/board':
    case 'governance/votes': case 'governance/deed': case 'governance/bids': {
      const i = ['pack','register','board','votes','deed','bids'].indexOf(sub);
      return {shape: i % 2 ? 'hall' : 'tower', h: biz ? 2.4 + (i % 3) * 0.9 : 1.2, tone:'', muted: !biz,
        note: biz ? biz.name : 'needs a company'};
    }
    case 'legacy/record':
      return {shape:'hall', h: 1.6 + Math.min(6, S.turn/4 * 0.2), tone:'', muted:false,
        note: Math.floor(S.turn/4) + ' years in'};
    case 'legacy/people':
      return {shape:'house', h: 1.6 + Math.min(4, cast.length*0.35), tone:'', muted: !cast.length,
        note: cast.length + ' people'};
    case 'legacy/ambition': {
      const a = ambitionOf(), pc = ambitionPct();
      return {shape:'monument', h: 1.4 + pc/100*7.6, tone: a ? 'acc' : '', muted: !a,
        note: a ? pc + '% · ' + a.name : 'not chosen'};
    }
    case 'legacy/chronicle':
      return {shape:'monument', h: 1.4 + Math.min(6, (S.journal||[]).length/12), tone:'', muted:false,
        note: (S.journal||[]).length + ' entries'};
    case 'legacy/season':
      return {shape:'kiosk', h: S.season ? 2.6 : 1.4, tone: S.season ? 'info' : '', muted: !S.season,
        note: S.season ? S.season.code : 'no season'};
    case 'legacy/settings':
      return {shape:'kiosk', h: 1.6, tone:'', muted:false, note:'saves and options'};
  }
  return {shape:'kiosk', h:1.4, tone:'', muted:true, note:''};
}

/* Where each kind of person in your life is found: family at home, the banker
   at the bank, the supplier at the business, the contact where the forms are
   filed, the rival at the rival's tower. A friend is wherever your own life is. */
function worldHome(role){
  return ({sibling:'work/household', cousin:'work/household', elder:'work/household', love:'work/household',
           friend:'work/life', mentor:'work/career', banker:'money/position', supplier:'work/business',
           contact:'governance/register', rival:'work/rival'})[role] || 'work/life';
}

function worldModel(){
  const era = S.era ? eraById(S.era.id) : null;
  const buildings = [];
  WORLD_DISTRICTS.forEach(function(D){
    (subsFor(D.tab) || []).forEach(function(s, i){
      const col = i % 3, row = Math.floor(i / 3);
      const b = worldBuilding(D.tab, s.id);
      const at = worldAt(D.sx + (col - 1) * WORLD_COL, D.sy + (row - 0.5) * WORLD_ROW);
      buildings.push({id: D.tab + '/' + s.id, tab: D.tab, sub: s.id, label: s.label,
        x: at.x, z: at.z,
        shape: b.shape, h: b.h, tone: b.tone, muted: !!b.muted, note: worldNote(b.note),
        colour: D.colour});
    });
  });
  /* The people in your life, as characters. Each lives at the building their
     role belongs to, and what the game knows about them is what they show: how
     they feel about you, whether a story with them is open, what you last did
     to them, how life has treated them. Someone who has died or emigrated is
     not in the city. Nothing here is drawn at random. */
  const people = (S.cast||[]).filter(function(c){
    return c.alive && !(c.tags && (c.tags.emigrated || c.tags.abroad));
  }).slice(0, 10).map(function(c){
    let h = 0; for(let j = 0; j < c.id.length; j++) h = (h * 31 + c.id.charCodeAt(j)) >>> 0;
    const last = (c.memory && c.memory[0] && S.turn - c.memory[0].turn <= 1) ? c.memory[0] : null;
    return {id: c.id, name: String(c.name||'').split(' ')[0], role: c.role, home: worldHome(c.role),
      hue: h % 360, age: c.age,
      mood: c.relation >= 65 ? 'warm' : c.relation >= 25 ? 'cordial' : c.relation >= -20 ? 'cool' : 'hostile',
      story: (S.threads||[]).some(function(t){ return t.castId === c.id; }),
      felt: last ? (last.delta > 0 ? 'up' : last.delta < 0 ? 'down' : '') : '',
      fortune: c.tags && c.tags.madeIt ? 'rich' : c.tags && c.tags.broke ? 'broke' : ''};
  });
  /* and you: how you are, read from the same five numbers the header shows */
  const p = S.p;
  const me = {name: String(S.name||'You').split(' ')[0], age: p.age,
    mood: p.health < 35 ? 'ill' : p.stress > 72 ? 'tired' : p.happy >= 72 ? 'happy' : '',
    suit: !!p.job, rich: netWorth() > 50000000 * (S.cumInfl || 1)};
  const districts = WORLD_DISTRICTS.map(function(D){
    const t = TABS.find(function(x){ return x.id === D.tab; });
    const at = worldAt(D.sx, D.sy);
    return {tab: D.tab, label: t ? t.label : D.tab, x: at.x, z: at.z,
      w: 3 * WORLD_COL + 2.4, d: 2 * WORLD_ROW + 2.4, colour: D.colour};
  });
  return {city: CITY().label, date: dateLabel(S.turn), era: era ? era.name : '', tone: era ? era.tone : 'neutral',
    plaza: {h: worldHeight(Math.max(0, netWorth()), 5, 9.5), tone: netWorth() > 0 ? 'good' : 'bad'},
    districts: districts, buildings: buildings, people: people, me: me};
}

/* LEDGER's own pictures: one hand of thin gold ink on the dark page, the way an
   entry is inked in a ledger. Every icon is a few strokes on a 24-unit grid,
   drawn here as inline SVG so the file stays one file with no requests, and
   coloured by whatever holds it (currentColor) so a state can tint it. */
function worldIco(name){
  const P = {
    skyline:'<path d="M3 21V11h5v10M8 21V5h6v16M14 21v-8h7v8M2 21h20M10.5 9h1M10.5 13h1M17 16h1"/>',
    case:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.5h18M11 12.5v2h2v-2"/>',
    coins:'<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 10v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-4M5 14v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-4"/>',
    columns:'<path d="M12 3 3 8.5h18zM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v12M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2M9.5 9h6M9.5 12.5h6M9.5 16h3.5"/>',
    shop:'<path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10c0 1.3 1 2.3 2.2 2.3S7.4 11.3 7.4 10c0 1.3 1 2.3 2.2 2.3s2.2-1 2.2-2.3c0 1.3 1 2.3 2.2 2.3s2.2-1 2.2-2.3c0 1.3 1 2.3 2.2 2.3S21 11.3 21 10M10 20v-5h4v5"/>',
    tie:'<path d="M9.5 3h5l-1.3 3.2L15.5 16 12 20.5 8.5 16l2.3-9.8z"/>',
    home:'<path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M12 17.5s-3-1.7-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.9-3 3.6-3 3.6z"/>',
    pulse:'<path d="M3 12.5h4l2.2-5.5 4 11 2.3-5.5H21"/>',
    swords:'<path d="M4 4l11 11M20 4 9 15M13 17l4-4M7 13l4 4M5.5 18.5 3.5 20.5M18.5 18.5l2 2"/>',
    sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    bars:'<path d="M5.5 20v-6M11.5 20V8M17.5 20V4.5M3 20.5h18"/>',
    jar:'<path d="M8 3.5h8M9 3.5v2.3C6.6 7 5.5 9 5.5 11.5V19a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-7.5c0-2.5-1.1-4.5-3.5-5.7V3.5M5.5 14h13"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 6.5l2.5 2.5M13.5 9 16 11.5"/>',
    trend:'<path d="M3 17.5l6-6 4 4 8-8M15.5 7.5H21V13"/>',
    hands:'<path d="M2 12.5 6.5 8H11l2.5 1.8L16 8h6M6.5 8l4.3 7.2c.6 1 1.9 1.2 2.7.4M13.5 15.6l1.4 1.4c.8.8 2.1.6 2.6-.4l-4-6.8M2 15.5h4M18 15.5h4"/>',
    towers:'<path d="M3 21V7.5L9 4.5v16.5M9 21V9h12v12M2 21h20M12.5 12.5h2M17 12.5h1.5M12.5 16.5h2M17 16.5h1.5M5.5 10h1M5.5 14h1"/>',
    box:'<path d="M3 7.5 12 3.5l9 4-9 4zM3 7.5v9.5l9 4 9-4V7.5M12 11.5V21"/>',
    book:'<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
    table:'<path d="M3 10.5h18M5.5 10.5V19M18.5 10.5V19M8 10.5V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3.5"/>',
    ballot:'<path d="M4 13.5h16V21H4zM8 13.5V4h8v9.5M10 9l1.8 1.8L15 7.3"/>',
    seal:'<circle cx="12" cy="9.5" r="5.5"/><path d="M9 14.4 7.5 21l4.5-2.6 4.5 2.6-1.5-6.6"/>',
    gavel:'<path d="m13.5 4.5 6 6M11 7l6 6M14.5 8.5l-9 9a1.4 1.4 0 0 0 2 2l9-9M3 21h9"/>',
    medal:'<circle cx="12" cy="15" r="5.5"/><path d="M8 3l3.2 6.6M16 3l-3.2 6.6M12 12.8l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5M16 5.3a3 3 0 0 1 0 5.4M20.5 20c0-2.6-1.4-4.6-3.6-5.3"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    open:'<path d="M3 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3zM21 5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6z"/>',
    flag:'<path d="M5 21V3.5M5 4h12.5l-2.5 4 2.5 4H5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
    note:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    heart:'<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>',
    bolt:'<path d="M13 2.5 4.5 14h7l-1 7.5L19 10h-7z"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14.2s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/>',
    star:'<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    glass:'<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5.5 9 5.5 9 9s-9 3.5-9 9M16.5 3c0 5.5-9 5.5-9 9s9 3.5 9 9M10 18.5h4"/>',
    door:'<path d="M4 21h16M6 21V3.5h9V21M15 4.5l4 2V21M12 12.5h.01"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.01"/>',
    spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    meal:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16.5 3c-2 0-3 2.2-3 5.2s1.2 4 3 4V21"/>',
    bank:'<path d="M3 10l9-6 9 6M5.5 10.5v7M9.5 10.5v7M14.5 10.5v7M18.5 10.5v7M3 20.5h18"/>',
    cart:'<path d="M3 4h2.2l2.2 11h10.8l2-8H6.3"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    cap:'<path d="M2 9.5 12 4.5l10 5-10 5zM6 11.5v4.8c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.8M21 10v5"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    hire:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5M19 8v6M16 11h6"/>',
    warn:'<path d="M12 3.5 2.5 20h19zM12 9.5v5M12 17.2v.01"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
    pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    horn:'<path d="M3 10v4l11 5V5zM14 8.5h2.5a3.5 3.5 0 0 1 0 7H14M6 14.5l1 5h3l-1-4"/>',
    tag:'<path d="M3 12.5V4h8.5l9.5 9.5-8.5 8.5z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    wrench:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-9.5 9.5a2.1 2.1 0 0 1-3-3l9.5-9.5a4 4 0 0 0-2-2z"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11M12 15v2"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8C10.5 4.5 6.5 4 6.5 6.5S12 8 12 8M12 8c1.5-3.5 5.5-4 5.5-1.5S12 8 12 8"/>',
    disk:'<path d="M5 3.5h11l3.5 3.5v13.5H5zM8 3.5v5h7v-5M8 20.5v-6.5h8v6.5"/>',
    chat:'<path d="M4 5h16v11H9.5L4 20.5z M8.5 9.5h7M8.5 12.5h4.5"/>',
    truck:'<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3.5 3.5v3h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    laptop:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19l-2-4h-15z"/>',
    leaf:'<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19c3-4 6-6.5 10-8.5"/>',
    crane:'<path d="M6 21V3.5M3 21h8M6 4h14M6 8l4-4M16 4v4M16 8v3.5M14.5 11.5h3v2h-3z"/>',
    brush:'<path d="M19.5 3.5 10 13M8 14.2c-2 0-3.5 1.6-3.5 3.6 0 1.4-.8 2.2-1.7 2.7 4 .9 7.7-.5 7.7-4 0-1.2-1-2.3-2.5-2.3z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    factory:'<path d="M3 21V11l5 3V11l5 3V11l5 3V5h3v16zM2 21h20M7 17.5h2M12 17.5h2"/>',
    briefs:'<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 11.5h8M8 15h5"/>',
    up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
    down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
    car:'<path d="M3.5 16.5V12l2-5h13l2 5v4.5zM3.5 12h17"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    shirt:'<path d="M8.5 3.5 4 6.5l2 4 2-1V20.5h8V9.5l2 1 2-4-4.5-3c-.5 1.5-2 2.5-3.5 2.5S9 5 8.5 3.5z"/>',
    dumbbell:'<path d="M3 12h18M5.5 8v8M8.5 6.5v11M15.5 6.5v11M18.5 8v8"/>',
    sofa:'<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 17.5V13a2 2 0 0 1 4 0v1.5h10V13a2 2 0 0 1 4 0v4.5zM5 17.5V20M19 17.5V20"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  };
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(P[name] || P.spark)+'</svg>';
}
/* A line of the budget, as a jar: how full it is against what that line of
   life actually needs, with the need drawn as a dashed mark. Green at or above
   the mark, amber near it, red well short - "below need" becomes a jar you can
   see is short. */
function budgetJarHTML(v, need){
  const r = need > 0 ? Math.min(1.25, v / need) : (v > 0 ? 1.25 : 0);
  const top = 32 - Math.round(24 * Math.min(1, r / 1.25));
  const tone = r >= 1 ? 'var(--good)' : r >= 0.75 ? 'var(--warn)' : 'var(--bad)';
  return '<svg class="jar" viewBox="0 0 26 34" role="img" aria-label="'+Math.round(r * 100)+'% of what it needs">'+
    (r > 0 ? '<rect x="4.5" y="'+top+'" width="17" height="'+(32 - top)+'" rx="2.5" fill="'+tone+'" opacity=".85"/>' : '')+
    '<path d="M8.5 2.5h9M9.5 2.5v4C6.5 7.6 3.5 9.6 3.5 13v16a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3V13c0-3.4-3-5.4-6-6.5v-4" fill="none" stroke="var(--acc)" stroke-width="1.5" stroke-linejoin="round"/>'+
    '<path d="M3.5 13h19" stroke="#e8eef5" stroke-width="1" stroke-dasharray="2 2"/>'+
  '</svg>';
}
/* What a thing does to you, drawn: the stat's picture with a rising or falling
   mark and the size of it, toned by whether it helps (less stress helps), and
   what it costs to keep. */
function effectMarksHTML(eff, upkeep){
  const ICON = {stress:'bolt', happy:'smile', health:'heart', rep:'star', family:'home',
                tech:'cap', finance:'cap', ops:'cap', hustle:'cap', network:'people'};
  let h = Object.keys(eff || {}).map(function(k){
    const v = eff[k], good = k === 'stress' ? v < 0 : v > 0;
    return '<span class="emark '+(good ? 'good' : 'bad')+'" title="'+k+' '+(v > 0 ? '+' : '')+v+'">'+
      worldIco(ICON[k] || 'spark')+worldIco(v > 0 ? 'up' : 'down')+'<b>'+Math.abs(v)+'</b></span>';
  }).join('');
  if(upkeep) h += '<span class="emark" title="'+fmt(upkeep)+' a month to keep">'+worldIco('coins')+'<b>'+fmt(upkeep)+'/mo</b></span>';
  return h;
}
/* Which picture: each tab and screen by its id, a kind of company by its id,
   anything else - a section, a move - by what it is about. The tabs, the
   second level, the section headers, the tiles and the HUD all draw from here,
   in both renderers. */
function worldGlyph(key){
  const k = String(key || '').toLowerCase();
  const exact = {overview:'skyline', work:'case', money:'coins', governance:'columns', legacy:'scroll',
    business:'shop', career:'tie', household:'home', life:'pulse', rival:'swords', levers:'sliders',
    position:'bars', budget:'jar', property:'key', markets:'trend', deals:'hands', group:'towers',
    pack:'box', register:'book', board:'table', votes:'ballot', deed:'seal', bids:'gavel',
    record:'medal', people:'people', ambition:'target', chronicle:'open', season:'flag', settings:'gear',
    retail:'box', food:'meal', logi:'truck', tech:'laptop', agri:'leaf', estate:'crane', creative:'brush',
    mfg:'factory', proserv:'briefs', energy:'sun'};
  if(exact[k]) return worldIco(exact[k]);
  /** @type {Array<[RegExp, string]>} */
  const map = [
    [/where you stand|net worth|standing/, 'pin'], [/this quarter|agenda|waiting|needs you|first quarter/, 'calendar'],
    [/background|economy|\btimes\b|\bera\b|weather/, 'globe'], [/risk|pressure|exposure|danger|warning/, 'warn'],
    [/raise|promot/, 'trend'], [/interview|job|career|work|shift|deliver|overtime|employ|capabilit/, 'case'],
    [/lunch|dinner|network|friend|introduc/, 'meal'], [/deal|commit|partner/, 'hands'],
    [/pass|decline|ignore/, 'lock'], [/hire|recruit|candidate/, 'hire'], [/staff|team|people|cast|rival/, 'people'],
    [/fire|let go|dismiss|resign/, 'door'], [/loan|borrow|repay|debt|bank|overdraft|credit/, 'bank'],
    [/sell|dispose/, 'tag'], [/laptop|computer/, 'laptop'], [/generator|solar|inverter|power/, 'plug'],
    [/car\b|vehicle/, 'car'], [/wardrobe|clothes/, 'shirt'], [/gym|fitness/, 'dumbbell'], [/furnish|flat/, 'sofa'],
    [/phone/, 'phone'], [/buy|purchase|goods|possession/, 'cart'],
    [/rent|lease|house|home|property|land|plot/, 'key'], [/doctor|health|hospital|check|exercise/, 'heart'],
    [/rest|holiday|leave|sleep|break|month off/, 'moon'], [/family|child|parent|wedding|spouse|marr|household/, 'home'],
    [/learn|course|study|skill|train|school|mba/, 'cap'], [/market|stock|equit|bond|treasury|fund|invest|ajo|gold|crypto|dollar|portfolio/, 'trend'],
    [/price/, 'tag'], [/advert|marketing|brand|campaign/, 'horn'],
    [/start|company|business|outlet|unit|open|trade|machine|capacity|hustle/, 'shop'],
    [/vote|resolution/, 'ballot'], [/board|director/, 'table'], [/register|govern/, 'book'], [/deed/, 'seal'], [/bid/, 'gavel'],
    [/save|load|slot/, 'disk'], [/budget|spend|cash|money|income|pulse|bill/, 'coins'], [/negotiat|haggle|talk/, 'chat'],
    [/maintain|repair|fix|extend/, 'wrench'], [/close|shut/, 'lock'], [/give|donat|charity|tithe|legacy|estate|will/, 'gift'],
    [/season|join|invite|code/, 'flag'], [/ambition|goal|dream/, 'target'], [/chronicle|story|thread|history|record/, 'open'],
  ];
  for(let i = 0; i < map.length; i++) if(map[i][0].test(k)) return worldIco(map[i][1]);
  return worldIco('spark');
}
/* The HUD: the numbers that used to be a row of words in the header, drawn
   over the city - money as two pills, the five things you are as bars, the
   hours you have left and how free you are as rings, and a way to show every
   explanation the game has. The same numbers the header holds; the header keeps
   them too, for anything that reads them. */
function worldHUD(){
  const p = S.p, d = S.der || {}, nw = netWorth();
  const prev = S.hist.length > 1 ? S.hist[S.hist.length - 2].nw : nw;
  const hb = Math.max(1, hoursBudget()), hl = hoursLeft();
  const ico = function(e, label){ return '<span class="gfx hi" role="img" aria-label="'+label+'">'+e+'</span>'; };
  const row = function(e, label, v, good){
    const tone = good ? (v >= 60 ? 'var(--good)' : v >= 35 ? 'var(--warn)' : 'var(--bad)')
                      : (v <= 40 ? 'var(--good)' : v <= 65 ? 'var(--warn)' : 'var(--bad)');
    return '<div class="hrow">'+ico(e, label)+'<span class="gfx hb" title="'+label+' '+Math.round(v)+'">'+
      '<i style="width:'+Math.round(Math.max(3, Math.min(100, v)))+'%;background:'+tone+'"></i></span></div>';
  };
  const ring = function(e, label, pc, colour){
    return '<span class="gfx hring" title="'+label+'" role="img" aria-label="'+label+'" style="--p:'+Math.round(Math.max(0, Math.min(100, pc)))+';--c:'+colour+'"><em>'+e+'</em></span>';
  };
  return '<div class="hud"><div class="hleft">'+
    '<div class="hmoney">'+ico(worldIco('note'), 'cash')+'<b>'+fmt(S.fin.cash)+'</b>'+
      '<span class="hsep"></span>'+ico(worldIco('trend'), 'net worth')+'<b class="'+(nw >= prev ? 'good' : 'bad')+'">'+fmt(nw)+'</b></div>'+
    '<div class="hbody">'+
      '<div class="hbars">'+
        row(worldIco('heart'), 'health', p.health, true)+
        row(worldIco('bolt'), 'stress', p.stress, false)+
        row(worldIco('smile'), 'happiness', p.happy, true)+
        row(worldIco('home'), 'family', p.family, true)+
        row(worldIco('star'), 'reputation', p.rep, true)+
      '</div>'+
    '</div></div>'+
    '<div class="hright">'+
      ring(worldIco('glass'), Math.round(hl)+' hours left this quarter', hl / hb * 100, 'var(--info)')+
      ring(worldIco('door'), 'freedom '+freedomIndex(), freedomIndex(), 'var(--acc)')+
    '<button class="hinfo'+(UI.details ? ' on' : '')+'" data-a="details" aria-pressed="'+(UI.details ? 'true' : 'false')+'" title="'+
      (UI.details ? 'Hide the explanations' : 'Show every explanation')+'">'+worldIco('info')+'</button>'+
  '</div></div>';
}
/* Which building the page is showing: the current route, or '' on the
   overview. The world stands above every screen, and on a screen it is that
   screen's building the camera looks at. */
function worldHere(){
  const k = routeKey();
  return k.indexOf('/') > 0 ? k : '';
}
/* The world's markup: a stage the ui fills with a canvas, and the labels -
   which are the controls. They are ordinary buttons with ordinary actions, so a
   player with no WebGL, a screen reader or a test sees a list of places that
   works exactly like the 3D city; the renderer only moves them over their
   buildings. Three views, one city:
   - the overview, whole: the labels are the four districts;
   - the overview, a district open: its six buildings and a way back;
   - any other screen: the camera on that screen's building, the district's
     buildings around it (the one you are in marked), and a way to the city. */
function worldHTML(){
  const m = worldModel();
  const here = worldHere();
  const focus = here ? here.split('/')[0] : (UI.worldFocus || '');
  const pin = function(x, y, z){ return ' data-wx="'+x+'" data-wy="'+y+'" data-wz="'+z+'"'; };
  const lot = function(b){
    return '<button class="wl wb'+(b.muted?' muted':'')+(b.tone?' t-'+b.tone:'')+(b.id === here ? ' here' : '')+'" data-a="goto" data-t="'+b.tab+'" data-s="'+b.sub+'"'+
      (b.id === here ? ' aria-current="page"' : '')+pin(b.x, b.h + 0.4, b.z)+'><b>'+esc(b.label)+'</b>'+(b.note ? '<span>'+esc(b.note)+'</span>' : '')+'</button>';
  };
  let labels = '';
  if(!focus){
    labels = m.districts.map(function(d){
      return '<button class="wl wd" data-a="worldfocus" data-d="'+d.tab+'"'+pin(d.x, 9, d.z)+'>'+esc(d.label)+'</button>';
    }).join('');
  } else {
    /* from a screen, "City" is the overview with the whole city; from a district
       on the overview, it is the whole city again */
    labels = '<button class="wl wback" data-a="worldfocus" data-d=""'+(here ? ' data-t="overview"' : '')+'>\u2039 City</button>' +
      m.buildings.filter(function(b){ return b.tab === focus; }).map(lot).join('');
  }
  return '<div class="world'+(here ? ' compact' : '')+'" id="world" data-focus="'+esc(focus)+'" data-here="'+esc(here)+'">'+
    '<div class="world-stage" aria-hidden="true"></div>'+
    worldHUD()+
    '<div class="world-labels">'+labels+'</div>'+
    '<div class="world-cap">'+esc(m.city)+' \u00b7 '+esc(m.date)+(m.era ? ' \u00b7 '+esc(m.era) : '')+'</div>'+
    '</div>';
}
