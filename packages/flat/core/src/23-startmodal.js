
function startModal(){
  const profiles = (function(){
    const pinned = seaPins();
    return PROFILES.map(function(p){
    const on = seaProfile() === p.id;
    if(pinned && !on) return '';          /* the season picked; the others are noise */
    /* Four cards used to carry four blurbs and sixteen trait chips at once, all
       of it read before anything was chosen. The chosen one keeps its detail. */
    return '<label style="display:block;border:1px solid '+(on?'var(--acc)':'var(--line)')+
      ';border-radius:10px;padding:10px;margin-bottom:8px;cursor:'+(pinned?'default':'pointer')+'">'+
      '<input type="radio" name="prof" value="'+p.id+'" '+(on?'checked':'')+
      (pinned?' disabled aria-disabled="true" title="This season is played as '+esc(p.name)+' \u2014 everyone in it starts the same way"':'')+' style="width:auto;margin-right:8px">'+
      '<b>'+p.name+'</b> <span class="tiny muted">age '+p.age+' · '+p.edu+' · '+fmt(p.cash)+'</span>'+
      (on ? '<div class="tiny muted" style="margin-left:22px">'+p.blurb+'</div>'+
            '<div class="row wrap" style="margin:5px 0 0 22px;gap:4px">'+p.traits.map(t=>'<span class="chip">'+t+'</span>').join('')+'</div>'
          : '')+'</label>';
  }).join(''); })();
  /* Three steps instead of one wall: who you are, where you start, how hard.
     Each step is a place you can leave and come back to, and the rail at the top
     says which one you are on. The name is the only thing that is required. */
  const step = _cfg.step || 1;
  /* What is on the device and waiting: the best run in any slot, in preference to
     what this session happened to save. A hardcore run is never auto-saved, so on
     a cold start this is the only thing that knows it exists. */
  const waiting = (typeof resumeInfo === 'function') ? resumeInfo() : null;
  const stored = (waiting && waiting.head) ? waiting.head
    : ((typeof SAVE !== 'undefined' && SAVE.head) ? SAVE.head : null);
  const storedSlot = (waiting && waiting.slot) ? waiting.slot : 'auto';
  const storedAt = (waiting && waiting.at) ? waiting.at : ((typeof SAVE !== 'undefined') ? SAVE.at : 0);
  const rail = [['1','You'],['2','Start'],['3','Rules']].map(function(r){
    const n = parseInt(r[0],10), on = n === step;
    return '<button class="btn xs '+(on?'primary':'ghost')+'" data-a="step" data-n="'+r[0]+'" '+
      (on?'aria-current="step" ':'')+'>'+r[0]+' '+r[1]+'</button>';
  }).join('');
  const railRow = '<div class="row wrap" style="gap:5px;margin-bottom:10px">'+rail+'</div>';

  /* What is already on this device, said once, with the way back in. */
  const resume = (step === 1 && stored && stored.name)
    ? '<div class="card" style="margin-bottom:10px;padding:10px">'+
        '<div class="small"><b>'+esc(stored.name)+'</b> is waiting — '+dateLabel(stored.turn||0)+
        ' · '+fmt(stored.nw||0)+(storedAt ? ' · saved '+agoLabel(storedAt) : '')+
        (storedSlot !== 'auto' ? ' · slot '+esc(storedSlot.replace('s','')) : '')+'</div>'+
        (stored.diff === 'hardcore'
          ? '<div class="tiny" style="margin-top:4px;color:var(--warn)">Hardcore — this run is only '+
            'in this slot. Nothing is saved for you.</div>' : '')+
        '<div class="row wrap" style="gap:5px;margin-top:7px">'+
        '<button class="btn sm primary" data-a="load" data-s="'+esc(storedSlot)+'">Continue</button>'+
        '<button class="btn sm ghost" data-a="restart">Start fresh</button></div></div>'
    : '';

  const stepOne =
    '<div class="tiny muted" style="margin-bottom:8px">Your name</div>'+
    '<input type="text" id="inName" value="'+(M_name()||'')+'" placeholder="e.g. Tunde" maxlength="18">'+
    (function(){
      const pinned = seaPins();
      const cityRow = CITIES.map(function(c){
        const on = seaCity() === c.id;
        return '<button class="btn xs '+(on?'primary':'')+'" data-a="pickcity" data-c="'+c.id+'"'+
          (pinned && !on ? ' disabled aria-disabled="true" title="This season is played in '+esc(c.label)+' \u2014 everyone in it starts in the same city" style="opacity:.35"' : '')+'>'+c.label+'</button>';
      }).join('');
      return '<div class="tiny muted" style="margin:12px 0 6px">Where you live'+
        (pinned?' <span class="chip">set by the season</span>':'')+'</div>'+
        '<div class="row wrap" style="gap:5px">'+cityRow+'</div>';
    })();

  const stepThree = (function(){
      const pinned = seaPins();
      /* a dealt life is played on fixed terms, or today's results cannot be
         compared with anybody else's - the same reason a season pins them */
      if(_cfg.dealt && !pinned)
        return '<div class="tiny muted" style="margin:0 0 6px">Difficulty <span class="chip">set by today\u2019s life</span></div>'+
          '<div class="small"><b>'+esc(DIFFS[_cfg.dealt.difficulty].name)+'</b> in <b>'+
            esc((CITIES.find(function(c){ return c.id === _cfg.dealt.city; })||{label:''}).label)+'</b></div>'+
          '<div class="tiny muted" style="margin-top:6px">Everyone dealt today\u2019s life plays it on the same '+
            'terms, so your result means something next to theirs.</div>';
      const diffRow = Object.keys(DIFFS).map(function(k){
        const on = seaDifficulty() === k;
        const lk = !tierUnlocked(k) && !(pinned && on);
        return '<button class="btn xs '+(on?'primary':'')+'" data-a="pickdiff" data-d="'+k+'"'+
          (pinned && !on ? ' disabled aria-disabled="true" title="This season is played at '+esc(DIFFS[k].name)+' \u2014 everyone in it plays the same tier" style="opacity:.35"'
                         : (lk ? ' disabled style="opacity:.45" title="'+tierLockNote(k)+'"' : ''))+'>'+
          DIFFS[k].name+(lk?' (locked)':'')+'</button>';
      }).join('');
      /* Difficulty is locked by the season even where it is a tier this player
         has not unlocked: they chose to join a season set at that tier, and
         blocking them would silently make their run different from everyone
         else's - which is the one thing a season must not do. */
      const lockNote = (pinned && !tierUnlocked(seaDifficulty()))
        ? '<div class="tiny" style="margin-top:6px;color:var(--warn)">This tier is locked for you '+
          'normally ('+esc(tierLockNote(seaDifficulty()))+'). The season overrides that, so your run '+
          'matches everybody else\'s.</div>' : '';
      return '<div class="tiny muted" style="margin:0 0 6px">Difficulty'+
        (pinned?' <span class="chip">set by the season</span>':' (changeable at any time)')+'</div>'+
        '<div class="row wrap" style="gap:5px">'+diffRow+'</div>'+
        '<div class="tiny muted" style="margin-top:6px">'+DIFFS[seaDifficulty()].desc+'</div>'+
        lockNote+
        (pinned ? '<div class="tiny muted" style="margin-top:6px">City, who you are and difficulty '+
          'are the same for everybody in '+esc(_sea.code)+' \u2014 that is what makes the scores '+
          'comparable. Remove the season to choose for yourself.</div>' : '')+
        seasonRowHTML();
    })();

  const stepTwo = (function(){
      const pinned = seaPins();
      /* Today's life is offered before the list, because it is the one start
         you cannot pick: dealt from the date, the same for everyone today. A
         season pins its own start, so the two never meet. */
      const dealt = _cfg.dealt;
      if(dealt && !pinned){
        const P = PROFILES.find(function(p){ return p.id === dealt.profile; }) || PROFILES[0];
        const d = DRAWS.find(function(x){ return x.id === dealt.draw; }) || DRAWS[0];
        return '<div class="card" style="border-color:var(--acc);padding:12px">'+
          '<div class="tiny muted">Today\u2019s life \u00b7 '+esc(dealt.day)+'</div>'+
          '<div style="margin:6px 0 2px"><b>'+esc(P.name)+'</b> <span class="tiny muted">age '+P.age+' \u00b7 '+
            esc(P.edu)+' \u00b7 '+fmt(P.cash)+'</span></div>'+
          '<div class="tiny muted">'+esc(P.blurb)+'</div>'+
          '<div style="margin:10px 0 2px"><b>Born into: '+esc(d.name)+'</b></div>'+
          '<div class="tiny"><span class="chip g">+</span> '+esc(d.up)+'</div>'+
          '<div class="tiny" style="margin-top:4px"><span class="chip r">\u2212</span> '+esc(d.down)+'</div>'+
          '<div class="tiny muted" style="margin-top:8px">Dealt, not chosen. Everyone who starts today '+
            'gets this life. Tomorrow there is another.</div>'+
          '<div class="row wrap" style="gap:5px;margin-top:8px">'+
            '<button class="btn xs ghost" data-a="undeal">Choose my own instead</button></div>'+
        '</div>';
      }
      return (pinned ? '' :
        '<div class="card" style="padding:10px;margin-bottom:10px">'+
          '<div class="small"><b>Today\u2019s life</b> <span class="tiny muted">\u00b7 dealt, not chosen</span></div>'+
          '<div class="tiny muted" style="margin:4px 0 8px">Who you are and what you were born into, '+
            'dealt from today\u2019s date. Everyone who starts today gets the same one.</div>'+
          '<button class="btn sm primary" data-a="dealtoday">Deal me today\u2019s life</button></div>')+
        '<div class="tiny muted" style="margin:0 0 6px">'+(pinned?'Who you are on day one':'Or choose who you are')+
        (pinned?' <span class="chip">set by the season</span>':'')+'</div>'+profiles;
    })();

  const whoCity = (_cfg.dealt && !seaPins()) ? _cfg.dealt.city : seaCity();
  const who = (M_name() ? esc(M_name()) : 'no name yet')+' · '+esc((CITIES.filter(function(c){ return c.id === whoCity; })[0]||{}).label||'');

  return modalHTML(
    '<h1 style="font-size:24px;letter-spacing:.14em;color:var(--acc)">LEDGER</h1>'+
    '<div class="small muted" style="margin-top:4px">A life in decisions — and the compound interest of your own.</div>',
    railRow + resume + (step === 1 ? stepOne : step === 2 ? stepTwo : stepThree),
    (step > 1 ? '<button class="btn ghost" data-a="stepback">‹ Back</button>' : '<span></span>')+
    '<div class="small muted" style="flex:1;text-align:center">'+who+'</div>'+
    (step < 3
      ? '<button class="btn primary" data-a="stepnext" style="padding:11px 18px">Next ›</button>'
      : '<button class="btn primary" data-a="startgame" style="padding:11px 18px">Begin</button>')+
    '<button class="btn ghost" data-a="help">?</button>',
    'style="max-width:620px"');


}
/** @type {{name:string, city:string, profile:string, difficulty:string, step?:number,
 *          dealt?:(null|{day:string, seed:number, profile:string, draw:string, city:string, difficulty:string})}} */
let _cfg = {name:'', city:'lagos', profile:'grad', difficulty:'realistic', dealt:null};
/* Season configuration, held at the start screen until a run begins. A season
   is a finish line fixed in advance plus the conditions underneath it, so that
   several people can play the same run and have the comparison mean
   something. None of it is required — without it the run ends when it ends. */
/* A season is not only a finish line. Two people playing to the same quarter
   from different cities, as different people, on different difficulty are not
   comparable no matter how carefully the date matches - so the city, the
   starting profile and the difficulty are part of the season too, set once by
   whoever creates it and handed to everyone who joins.

   Empty means "not pinned". A season created before these were part of it, or
   one whose conditions never arrived because you were offline, leaves the
   player choosing for themselves rather than being blocked. */
/* `seed` is '' until the player (or a posted season) supplies one, and a number
   after that - which is what it has always been at runtime, and what the type
   now says. */
/**
 * @type {{name:string, endYear:number, endQ:number, seed:(string|number), joinCode:string,
 *         code:(string|null), organiser:boolean, draft:any, offers:any,
 *         city:string, profile:string, difficulty:string}}
 */
let _sea = {name:'', endYear:START_YEAR+20, endQ:1, seed:'', joinCode:'', code:null,
            organiser:false, draft:null, offers:null,
            city:'', profile:'', difficulty:''};
function seaDraftReset(){
  _sea = {name:'', endYear:START_YEAR+20, endQ:1, seed:'', joinCode:'', code:null,
          organiser:false, draft:null, offers:null, city:'', profile:'', difficulty:''};
  return _sea;
}

/* The value a run will actually start with: the season's if it pins one, the
   player's own otherwise. */
/* Empty means "not pinned", so a season that predates these - or one whose
   conditions never arrived because you were offline - leaves the player
   choosing for themselves. Deliberately not gated on _sea.code: the choice
   has to apply from the moment the organiser makes it in the setup, which is
   before any code is committed to. */
function seaCity(){      return _sea.city      || M_city(); }
function seaProfile(){   return _sea.profile   || M_prof(); }
function seaDifficulty(){return _sea.difficulty|| M_diff(); }
function seaPins(){      return !!(_sea.code && _sea.city && _sea.profile && _sea.difficulty); }
let _seaInviteUsed = false;   /* an invite link is offered until you act on it, then it stops nagging */
/* The ui's action handlers set these; the core reads them. Same reason as S. */
function setSeaInviteUsed(v){ _seaInviteUsed = !!v; return _seaInviteUsed; }
   /* an invite link is offered until you act on it, then it stops nagging */
function seaCode(){
  const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out=''; for(let i=0;i<4;i++) out += A[Math.floor(Math.random()*A.length)];
  /* named for the season's city, not the player's own - an Abuja season with a
     LAGOS- code is the kind of small lie that makes people doubt the rest */
  return (CITIES.find(function(c){return c.id===seaCity();})||{label:'RUN'}).label.toUpperCase().slice(0,5)+'-'+out;
}
/* The code is minted when the setup opens, not when the season is created, so
   there is always one on screen to copy. It lives in _sea.draft until Create
   is pressed - otherwise opening the setup and backing out would leave a
   season half-configured. */
/* An invite is a link, because a link is what people actually send. The code
   is still the thing underneath it, and a link is the code plus somewhere to
   put it. Offline, or where the page has no address to build from, this
   degrades to the bare code and the join box still works. */
function _href(){
  /* Two builds, two meanings for the same name. In the single file `location`
     is the browser's and `.href` is the page address. In the module build the
     host shims that name - `location()` asks the host for its url - so reading
     `.href` off it gives undefined, and every invite link the app built was the
     bare code with nowhere to click. Ask the shim when the name is callable. */
  try{
    if (typeof location === 'function') return location() || '';
    // @ts-expect-error - in the other build the name is the browser's, which no
    // single type covers here; the branch above is why this line is safe.
    return (typeof location !== 'undefined' && location.href) || '';
  }catch(e){ return ''; }
}
function seasonLink(code){
  const base = _href().split(/[?#]/)[0];
  return (base ? base + '?season=' + encodeURIComponent(code) : code);
}
/* Accepts a bare code, a full link, or anything with ?season= in it, because
   that is what arrives by paste, by scan and by hand in that order of
   likelihood. */
function seasonCodeFrom(text){
  const t = String(text || '').trim();
  if(!t) return '';
  const m = t.match(/[?&]season=([^&#\s]+)/i);
  let out = m ? m[1] : t;
  try{ out = decodeURIComponent(out); }catch(e){}
  return out.toUpperCase();
}
/* Only a URL that actually carries the parameter counts as an invite. Running
   the whole address through seasonCodeFrom would fall back to treating the
   address itself as a code, and every page load would look like a join. */
function seasonFromURL(){
  const m = _href().match(/[?&]season=([^&#\s]+)/i);
  if(!m) return null;
  let out = m[1];
  try{ out = decodeURIComponent(out); }catch(e){}
  return out.toUpperCase() || null;
}