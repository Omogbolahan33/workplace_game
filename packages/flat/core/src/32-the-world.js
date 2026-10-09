
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
  /* the people in your life live around the plaza; where each one stands is
     a function of who they are, not of a random draw */
  const people = (S.cast||[]).filter(function(c){ return c.alive; }).slice(0, 10).map(function(c, i){
    let h = 0; for(let j = 0; j < c.id.length; j++) h = (h * 31 + c.id.charCodeAt(j)) >>> 0;
    return {id: c.id, name: String(c.name||'').split(' ')[0], role: c.role,
      ring: 2.4 + (i % 3) * 0.7, phase: (h % 628) / 100, hue: h % 360};
  });
  const districts = WORLD_DISTRICTS.map(function(D){
    const t = TABS.find(function(x){ return x.id === D.tab; });
    const at = worldAt(D.sx, D.sy);
    return {tab: D.tab, label: t ? t.label : D.tab, x: at.x, z: at.z,
      w: 3 * WORLD_COL + 2.4, d: 2 * WORLD_ROW + 2.4, colour: D.colour};
  });
  return {city: CITY().label, date: dateLabel(S.turn), era: era ? era.name : '', tone: era ? era.tone : 'neutral',
    plaza: {h: worldHeight(Math.max(0, netWorth()), 5, 9.5), tone: netWorth() > 0 ? 'good' : 'bad'},
    districts: districts, buildings: buildings, people: people};
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
    '<div class="world-labels">'+labels+'</div>'+
    '<div class="world-cap">'+esc(m.city)+' \u00b7 '+esc(m.date)+(m.era ? ' \u00b7 '+esc(m.era) : '')+'</div>'+
    '</div>';
}
