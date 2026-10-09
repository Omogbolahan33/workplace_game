
const ACT = {
  tab: e=>{
    UI.bellOpen = false;
    UI.tab = e.dataset.t;
    const subs = subsFor(UI.tab);
    UI.sub = subs ? subs[0].id : '';
    if(UI.tab==='governance') UI.govSub = UI.sub;
    UI.modal=null; UI.scrollTop=true; render();
  },
  sub: e=>{
    UI.bellOpen = false;
    UI.sub = e.dataset.s;
    if(UI.tab==='governance') UI.govSub = UI.sub;
    UI.modal=null; UI.scrollTop=true; render();
  },
  /* P5: the rail's buttons. goto lands on a (tab, sub) and, when it knows
     the card, opens the group hiding it and flashes it. doact performs the
     action against the right business, which the agenda's own button never
     did - it acted on whatever happened to be active. */
  goto: e=>{
    UI.bellOpen = false;                   /* you acted; the list can close */
    const t = e.dataset.t, sb = e.dataset.s || '';
    if(t){
      UI.tab = t;
      UI.sub = sb || (((subsFor(t) || [])[0] || {}).id || '');
      if(t === 'governance') UI.govSub = UI.sub;
    }
    if(e.dataset.b) setActiveBiz(e.dataset.b);
    UI.focus = e.dataset.f || '';
    UI.modal = null; UI.scrollTop = !UI.focus; render();
  },
  doact: e=>{
    UI.bellOpen = false;
    if(e.dataset.b) setActiveBiz(e.dataset.b);
    const a = e.dataset.act;
    if(a && ACT[a]) ACT[a](e);
  },
  discall: e=>{
    const open = e.dataset.v==='1', tab = normTab(UI.tab);
    UI.collapsed = UI.collapsed || {};
    Object.keys(UI.collapsed).forEach(function(k){ if(k.indexOf(tab+'|')===0) UI.collapsed[k]=!open; });
    render();
  },
  help: ()=>{ UI.modal={type:'help'}; render(); },
  settings: ()=>{ UI.modal={type:'settings'}; render(); },
  close: ()=>{ UI.modal=null; render(); },
  advance: ()=>{
    if(S.gameOver){ message('The run is over','Start a new run from the Ledger tab, or review the board.'); return; }
    UI.animFast = !!S.optAnimFast;
    const _a = quarterSnapshot();
    advanceQuarter();
    if(UI.noAnim || S.gameOver) return;
    const _pend = UI.modal || null;
    UI.modal = {type:'advance', before:_a, after:quarterSnapshot(),
                rows:advanceRows(_a, quarterSnapshot()), line:advanceLine(_a, quarterSnapshot()),
                pending:_pend};
    render();
    startAdvanceAnim();
  },
  skipanim: ()=>{ if(UI._anim && UI._anim.finish) UI._anim.finish(); else { UI.modal=null; render(); } },
  animtoggle: ()=>{
    UI.animFast = !UI.animFast; S.optAnimFast = !!UI.animFast; save('auto');
    if(UI._anim && UI._anim.finish) UI._anim.finish(); else render();
  },
  keepplaying: ()=>{ S.gameOver=null; UI.modal=null; render(); },

  pickcity: e=>{ _cfg.city=e.dataset.c; render(); },
  seasontoggle: ()=>{
    UI.seaOpen = !UI.seaOpen;
    const chip = document.querySelector && document.querySelector('.seachip');
    if(chip) chip.className = 'seachip' + (UI.seaOpen ? ' open' : '') +
      ((seasonStatus()||{}).left <= 4 ? ' warn' : '');
  },
  eratoggle: ()=>{ UI.eraOpen = !UI.eraOpen; renderTop(); },
  /* The bell is pinned open by click and previewed by hover, so re-rendering
     must not lose the pin. Like the ? popover it is a flag on UI that the
     renderer re-emits, rather than a class painted onto the live DOM. */
  belltoggle: ()=>{ UI.bellOpen = !UI.bellOpen; renderTop(); },
  whyopen: e=>{
    const k = e.dataset.k;
    /* Clicking pins it open; hovering already previews it where there is a
       pointer. On a touch screen the hover rule never fires, so the click is
       the only way in - and it has to toggle, not just open. */
    UI.whyOpen = (UI.whyOpen === k) ? null : k;
    renderWhy();
    if(Q('why')) Q('why').className = UI.whyOpen ? 'open' : '';
  },
  hidewhy: e=>{
    const k = e.dataset.k;
    if(!S.why) S.why = {};
    S.why[k] = 1;
    UI.whyOpen = null;
    render();
  },
  showwhy: e=>{
    S.why = {};
    toast('Screen tips restored');
    render();
  },
  toggrp: e=>{
    const k = e.dataset.k;
    if(!S.grp) S.grp = {};
    S.grp[k] = !S.grp[k];          /* stored as "collapsed" */
    render();
  },
  installapp: e=>{ doInstall(); },
  grpdiv: e=>{ const b=bizById(e.dataset.b); if(!b) return;
    const own = yourPct(b);
    askAmount('Dividend from '+b.name,
      'Reserves '+fmt(Math.round(b.retained||0))+'. Distributable right now is '+fmt(divCapacity(b))+'. '+
      (own < 99.5
        ? 'You own '+Math.round(own)+'%. The other '+Math.round(100-own)+'% of this dividend is paid to the other holders, and '+Math.round(WHT_RATE*100)+'% is withheld from your share.'
        : Math.round(WHT_RATE*100)+'% withholding tax is deducted at source.'),
      divCapacity(b), function(v){ UI.modal=null; message('Dividend', payDividendUp(b, v)); }); },
  grploan: e=>{ const from=e.dataset.b, to=e.dataset.to;
    askAmount('Intercompany loan',
      entityName(from)+' has '+fmt(Math.max(0,entityCash(from)))+'. '+entityName(to)+' will owe the balance at '+pct(IC_RATE,1)+' a quarter, and servicing it is not optional.',
      Math.round(Math.max(0,entityCash(from))*0.5),
      function(v){ UI.modal=null; message('Intercompany', intercoLoan(from, to, v)); }); },
  grprepay: e=>{ const L=(intercoLoans()||[]).filter(function(x){ return x.id===e.dataset.l; })[0]; if(!L) return;
    askAmount('Repay intercompany balance',
      entityName(L.to)+' has '+fmt(Math.max(0,entityCash(L.to)))+'. Balance outstanding '+fmt(L.amt)+'.',
      Math.min(L.amt, Math.max(0,entityCash(L.to))),
      function(v){ UI.modal=null; message('Repayment', repayInterco(L.id, v)); }); },
  grpmgmt: e=>{ const b=bizById(e.dataset.b); if(!b) return;
    setMgmtFee(b, mgmtPct(b) + Number(e.dataset.d)); UI.modal=null; render(); },
  startgame: ()=>{
    /* The name is on step one and the run begins on step three, so it is read
       from the field when the field is there and from `_cfg.name` when it is not
       - which is every time after the first step. Reading the DOM alone meant
       walking forward and starting a nameless run. */
    const n = inputValue('inName') || _cfg.name || '';
    const sel = document.querySelector('input[name=prof]:checked');
    _cfg.profile = sel ? /** @type {HTMLInputElement} */ (sel).value : _cfg.profile;
    _cfg.name = n;
    /* today's life is played on its own terms - the dealt profile, seed, city
       and tier - unless a season pins the start, which always wins */
    const dealt = (_cfg.dealt && !seaPins()) ? _cfg.dealt : null;
    if(dealt){
      newGame({name:_cfg.name, city:dealt.city, profile:dealt.profile, difficulty:dealt.difficulty, seed:dealt.seed});
      S.dealt = {day:dealt.day, draw:dealt.draw};
      applyDraw(dealt.draw);
      if(S.difficulty!=='hardcore') save('auto');
    } else
    newGame({name:_cfg.name, city:seaCity(), profile:seaProfile(), difficulty:seaDifficulty(),
             seed:(_sea.code && _sea.seed) ? (/** @type {number} */ (_sea.seed)|0) : null, season:!!_sea.code});
    /* The name you typed becomes your handle the first time, so the profile says
       "Ada" rather than "no handle set" to a player who has been Ada since the
       first screen. It is a default, not a rule: the profile can be renamed. */
    if(_cfg.name){ const pr = ensureProfile(); if(!pr.handle){ pr.handle = _cfg.name; saveProfile(); } }
    /* A season is fixed at the moment the run begins. It cannot be edited
       afterwards: a finish line you could move is not a finish line, and a
       leaderboard where somebody quietly played eight more quarters is
       worthless. */
    if(_sea.code){
      S.season = { code:_sea.code, name:_sea.name || 'Season',
                   endYear:_sea.endYear, endQ:_sea.endQ,
                   endTurn:seasonTurnFor(_sea.endYear, _sea.endQ),
                   startTurn:S.turn, seed:S.seed, hardStop:true,
                   organiser:!!_sea.organiser };
      log('season', 'Season '+S.season.code+' begins. It ends at the close of Q'+
        S.season.endQ+' '+S.season.endYear+', and the run stops there.', 'neutral');
    }
    UI.modal = null; UI.tab='overview'; UI.sub='';
    toast(S.season ? 'It is '+dateLabel(0)+'. You have '+seasonsLeft()+' quarters.' 
                   : 'It is '+dateLabel(0)+'. You are '+S.p.age+'. Good luck.', 3400);
    render();
  },
  seasonopen: ()=>{ UI.modal = {type:'season'}; render();
    setTimeout(function(){ const el=Q('seaJoin'); if(el) el.focus(); }, 30); },
  seasetyear: e=>{ _sea.endYear = parseInt(e.dataset.y,10)||_sea.endYear; UI.modal={type:'season'}; render(); },
  seasetq:    e=>{ _sea.endQ = parseInt(e.dataset.q,10)||_sea.endQ; UI.modal={type:'season'}; render(); },
  seasonpickseed: e=>{
    _sea.seed = parseInt(e.dataset.s,10) || 0;
    UI.modal = {type:'season'}; render();
  },
  seasonreroll: ()=>{ _sea.offers = null; seedOffers(); UI.modal = {type:'season'}; render(); },
  seasonrecode: ()=>{ _sea.draft = seaCode(); UI.modal = {type:'season'}; render(); },
  seasoncopylink: ()=>{
    const code = inputValue('seaCodeBox').trim() || seaDraftCode();
    const ok = copyText(seasonLink(code));
    toast(ok ? 'Invite link copied.' : 'Could not reach the clipboard — copy it from the box below.',
          ok ? 2600 : 5000);
    render();
  },
  /* Scanning leans entirely on the browser's own BarcodeDetector, where it has
     one. If it has not, the button is never drawn — a scan button that cannot
     work is worse than no scan button. */
  seasonscan: async ()=>{
    if(!seasonCanScan()){ toast('This browser cannot scan. Paste the code or the link instead.', 4000); render(); return; }
    let stream = null;
    const stop = function(){ try{ if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} };
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    }catch(err){
      toast('No camera, or it was blocked. Paste the code instead.', 4200);
      render(); return;
    }
    const v = document.createElement('video');
    v.srcObject = stream; v.setAttribute('playsinline',''); v.muted = true;
    try{ await v.play(); }catch(e){}
    UI.modal = {type:'seasonscan'}; render();
    const host = Q('scanHost');
    if(host) try{ host.appendChild(v); }catch(e){}
    let det = null;
    try{ det = new window.BarcodeDetector({formats:['qr_code']}); }catch(e){ det = new window.BarcodeDetector(); }
    const deadline = Date.now() + 30000;
    const tick = async function(){
      if(!UI.modal || UI.modal.type !== 'seasonscan' || Date.now() > deadline){
        stop();
        if(UI.modal && UI.modal.type === 'seasonscan'){ UI.modal = {type:'season'}; render(); }
        return;
      }
      try{
        const found = await det.detect(v);
        if(found && found.length){
          const code = seasonCodeFrom(found[0].rawValue);
          stop();
          if(code){
            _sea.joinCode = code; _sea.code = code; _sea.organiser = false;
            UI.modal = {type:'season'}; render();
            toast('Scanned '+code+'. Press Join.', 3400);
            seasonFetchAsync(code).then(function(got){
              if(got){
                _sea.name = got.name || code;
                _sea.endYear = got.endYear || _sea.endYear;
                _sea.endQ = got.endQ || 1;
                _sea.seed = got.seed || '';
                toast('Joined '+code+'. Your run now matches theirs.', 3400);
              }
              if(UI.modal && UI.modal.type === 'season') render();
            });
          }
          return;
        }
      }catch(e){}
      setTimeout(tick, 250);
    };
    tick();
  },
  seasonscancancel: ()=>{ UI.modal = {type:'season'}; render(); },
  seasoncopy: ()=>{
    const code = inputValue('seaCodeBox').trim() || seaDraftCode();
    const ok = copyText(code);
    toast(ok ? 'Code '+code+' copied.' : 'Could not reach the clipboard — the code is '+code+'.',
          ok ? 2600 : 5000);
    render();
  },
  /* mint a new code too: the prefix carries the city, and nothing has been
     shared yet, so there is nothing to invalidate */
  seasetcity: e=>{ _sea.city = e.dataset.c; _sea.draft = null; UI.modal={type:'season'}; render(); },
  seasetprof: e=>{ _sea.profile = e.dataset.p; UI.modal={type:'season'}; render(); },
  seasetdiff: e=>{ _sea.difficulty = e.dataset.d; UI.modal={type:'season'}; render(); },
  seasoncreate: ()=>{
    setSeaInviteUsed(true);
    _sea.name = inputValue('seaName').trim();
    /* whatever the organiser left the pickers on becomes the season's
       conditions; there is no "unset" state for a season you are creating */
    _sea.city       = _sea.city       || M_city();
    _sea.profile    = _sea.profile    || M_prof();
    _sea.difficulty = _sea.difficulty || M_diff();
    /* the box is readonly and prefilled, but a player can still edit it, and
       somebody reading a code off a screen should be able to type it in */
    const typed = inputValue('seaCodeBox').trim().toUpperCase();
    _sea.code = typed || _sea.draft || seaCode();
    _sea.organiser = true;
    _sea.draft = null;                        /* the next season gets a fresh one */
    UI.modal = null;
    seasonPublish(_sea);                      /* best effort; offline is fine */
    render();
  },
  seasonjoin: ()=>{
    setSeaInviteUsed(true);
    const raw = inputValue('seaJoin').trim().toUpperCase();
    if(!raw){ toast('Enter a season code.', 2600); render(); return; }
    _sea.joinCode = raw; _sea.code = raw; _sea.organiser = false;
    UI.modal = null; render();
    toast('Joining '+raw+'…', 1800);
    /* The code alone is enough to play; the conditions are fetched so this
       run matches theirs. Offline you still get the code, and a season played
       alone is still a fixed finish line with a score. */
    seasonFetchAsync(raw).then(function(got){
      if(got){
        _sea.name = got.name || raw;
        _sea.endYear = got.endYear || _sea.endYear;
        _sea.endQ   = got.endQ || 1;
        _sea.seed   = got.seed || '';
        /* left empty where the season predates these, which leaves the player
           choosing for themselves instead of being blocked */
        _sea.city       = got.city || '';
        _sea.profile    = got.profile || '';
        _sea.difficulty = got.difficulty || '';
        toast('Joined '+raw+'. Your run now matches theirs.', 3400);
      } else {
        toast('Joined '+raw+'. Conditions will match when you are online.', 3800);
      }
      if(UI.modal && UI.modal.type === 'start') render();
    });
  },
  seasonclear: ()=>{ setSeaInviteUsed(true); seaDraftReset(); render(); },
  setdiff: e=>{
    const k = e.dataset.d;
    if(!DIFFS[k]) return;
    if(!tierUnlocked(k)){ toast(tierLockNote(k), 3800); render(); return; }
    S.difficulty = k;
    S.tune = computeTune(skillRating(ensureProfile()), k);
    save('auto'); toast('Difficulty: '+DIFFS[k].name); render();
  },
  pickdiff: e=>{
    const k = e.dataset.d;
    if(!DIFFS[k]) return;
    if(!tierUnlocked(k)){ toast(tierLockNote(k), 3800); render(); return; }
    _cfg.difficulty = k; render();
  },
  profile:   e=>{ UI.modal = {type:'profile'}; render(); },
  /* the record screen, which is where progress is explained and the slots live */
  goprofile: e=>{ UI.modal = null; UI.tab = 'legacy'; UI.sub = 'record'; render(); },
  /* onboarding: three steps, one screen. Nothing here is required except a name —
     the rest has a default that is as honest as any other answer. */
  step:      e=>{ const n = parseInt(e.dataset.n,10)||1; _cfg.step = n; UI.modal = {type:'start'}; render(); },
  stepnext:  e=>{
    if((_cfg.step||1) === 1 && !String(inputValue('inName') || _cfg.name || '').trim()){
      toast('Give your character a name first.'); return;
    }
    if((_cfg.step||1) === 1) _cfg.name = inputValue('inName') || _cfg.name;
    _cfg.step = Math.min(3, (_cfg.step||1) + 1); UI.modal = {type:'start'}; render();
  },
  stepback:  e=>{ _cfg.step = Math.max(1, (_cfg.step||1) - 1); UI.modal = {type:'start'}; render(); },
  /* the world: open a district, or go back to the whole city. Only the camera
     moves; the screens are the buildings' labels, which are plain goto */
  worldfocus: e=>{
    UI.worldFocus = e.dataset.d || '';
    /* from a screen, "City" is the overview with the whole city in view */
    if(e.dataset.t){ UI.bellOpen = false; UI.tab = e.dataset.t; UI.sub = ''; UI.modal = null; UI.scrollTop = true; }
    render();
  },
  /* the deal is the date's, so pressing it twice deals the same life twice */
  dealtoday: e=>{ _cfg.dealt = todaysLife(); UI.modal = {type:'start'}; render(); },
  undeal:    e=>{ _cfg.dealt = null; UI.modal = {type:'start'}; render(); },
  fmdone:    e=>{ if(S){ S.flags = S.flags || {}; S.flags.fm = 1; save('auto'); } render(); },
  runinfo:   e=>{ UI.modal = {type:'runinfo', id:e.dataset.i}; render(); },
  cloudin:   e=>{ cloudAuth('login'); },
  cloudup:   e=>{ cloudAuth('signup'); },
  cloudpush: e=>{ cloudPush(); },
  cloudpull: e=>{ cloudPull(); },
  cloudout:  e=>{ cloudLogout(); },
  /* Export and import of the profile are gone, deliberately. The player's
     position was that a profile is not a file you carry around: "I won't be
     exporting anything. Thats not how profile should work." Portability here
     is sync, or it is nothing. These two actions had no button anywhere and
     were dead; they are removed rather than left as a trap for whoever reads
     ACT next and wires them up again. */

  profclear: e=>{
    const n = (ensureProfile().runs||[]).length;
    UI.modal = {type:'confirm', title:'Erase your entire record?',
      text:'All '+n+' recorded run'+(n===1?'':'s')+' and your experience rating will be deleted. '+
        'This cannot be undone, and it does not affect any run currently in progress.',
      okLabel:'Erase it', cb:function(){
        profReset(); UI.modal=null; toast('Record cleared.'); render();
      }};
    render();
  },
  setcity: e=>{
    const from = CITY(), to = CITIES.find(c=>c.id===e.dataset.c);
    if(!to || to.id===S.city) return;
    const ratio = to.rentMult/from.rentMult;
    S.city = to.id;
    S.fin.budget.housing = Math.round(S.fin.budget.housing*ratio);
    S.fin.budget.food = Math.round(S.fin.budget.food*(0.6+0.4*ratio));
    log('life','You rebased the run to '+to.name+'. Local prices, wages and inflation now follow that economy.','warn');
    toast('Now set in '+to.name); UI.modal=null; render();
  },
  restart: ()=>{ confirmBox('Abandon this run?','This ends the current life and returns to the setup screen. Anything not exported is lost.', ()=>{ wipe(); setS(null); render(); }, 'Abandon'); },

  preset: e=>{
    const nd = needs(), inc = (salaryMonthly() + (S.informalIncome||0) + passiveMonthly());
    const mode = e.dataset.p, b = S.fin.budget;
    let mult = {housing:1, food:1, transport:1, lifestyle:1, family:1, learning:0, giving:0};
    if(mode==='survive') mult = {housing:0.85, food:0.85, transport:0.6, lifestyle:0.35, family:0.6, learning:0, giving:0};
    if(mode==='balanced') mult = {housing:1, food:1, transport:1, lifestyle:0.9, family:1, learning:0.3, giving:0.2};
    if(mode==='invest')   mult = {housing:0.8, food:1, transport:0.7, lifestyle:0.5, family:0.8, learning:2.2, giving:0.1};
    if(mode==='flex')     mult = {housing:1.5, food:1.2, transport:1.4, lifestyle:1.8, family:1.6, learning:0.2, giving:0.6};
    Object.keys(mult).forEach(k=>{ b[k] = Math.round((nd[k]||0)*mult[k]); });
    b.learning = mode==='invest' ? Math.round(Math.max(150000, inc*0.10)) : Math.round((nd.lifestyle||0)*mult.learning);
    S.budgetInfl = S.cumInfl;
    render();
  },
  infladj: ()=>{
    const r = S.cumInfl/Math.max(0.0001, S.budgetInfl||1);
    if(r<=1.01){ toast('Your budget is already up to date with prices.'); return; }
    Object.keys(S.fin.budget).forEach(k=>{ S.fin.budget[k] = Math.round(S.fin.budget[k]*r); });
    S.budgetInfl = S.cumInfl;
    log('money','You rebased your budget upward by '+pct(r-1,0)+' to keep pace with prices. Most people do this two years late.','neutral');
    toast('Budget adjusted +'+pct(r-1,0)); render();
  },
  buygood: e=>{ if(buyGood(e.dataset.g)){ toast('Bought.'); render(); } },
  buyasset: e=>{
    const id = e.dataset.i; const v = parseAmt(inputValue('amt_'+id));
    if(buyAsset(id, v)){ toast('Position opened.'); render(); }
  },
  sellasset: e=>{ if(sellAsset(e.dataset.i, (S.assets.find(a=>a.id===e.dataset.i)||{value:0}).value * parseFloat(e.dataset.f))){ render(); } },
  repay: e=>{
    const d = S.fin.debt.find(x=>x.id===e.dataset.d); if(!d) return;
    askAmount('Repay '+d.name, 'Balance '+fmt(d.bal)+'. Cash available '+fmt(S.fin.cash)+'. Paying this down removes a '+pct(d.rate,0)+'-per-quarter drag.',
      Math.min(Math.round(d.bal), Math.max(0,Math.round(S.fin.cash*0.9))), function(v){
        if(v<=0) return; const pay = Math.min(v, Math.round(d.bal), Math.max(0,S.fin.cash));
        S.fin.cash -= pay; d.bal = Math.max(0, d.bal - pay);
        S.fin.debt = S.fin.debt.filter(x=>x.bal>0.5);
        S.fin.credit = clamp(S.fin.credit+2,0,100);
        log('money','You repaid '+fmt(pay)+' of the '+d.name+'.','good');
        UI.modal=null; render();
      });
  },
  borrow: e=>{
    const kind = e.dataset.k;
    const maxBank = Math.round(clamp((salaryMonthly()*6 + Math.max(0,netWorth())*0.25)*(S.fin.credit/100), 0, 250000000));
    if(kind==='bank'){
      if(S.fin.credit<35){ toast('No bank will look at you at a credit score of '+Math.round(S.fin.credit)+'.'); return; }
      if(maxBank<200000){ toast('The most anyone will offer is '+fmt(maxBank)+'.'); return; }
      const rate = clamp(0.055 + (100-S.fin.credit)/600, 0.05, 0.16);
      askAmount('Bank loan', 'Approved up to '+fmt(maxBank)+' at '+pct(rate,1)+' per quarter. Your credit score is '+Math.round(S.fin.credit)+'.',
        Math.round(maxBank*0.5), function(v){
          v = Math.min(v, maxBank);
          S.fin.debt.push({id:'d'+(++S.seq), name:'Bank facility', bal:v, rate:rate, minPay:Math.round(v*0.12), kind:'bank'});
          S.fin.cash += v; log('money','You drew a bank facility of '+fmt(v)+' at '+pct(rate,1)+' a quarter.','warn');
          UI.modal=null; render();
        });
    } else {
      askAmount('Private lender', 'No paperwork, no questions, '+pct(0.30,0)+' per quarter. This is not a loan, it is a countdown.',
        Math.round(Math.max(200000, budgetMonthly()*3)), function(v){
          S.fin.debt.push({id:'d'+(++S.seq), name:'Private lender', bal:v, rate:0.30, minPay:Math.round(v*0.4), kind:'shark'});
          S.fin.cash += v; S.p.stress = clamp(S.p.stress+7,0,100);
          log('money','You took '+fmt(v)+' from a private lender at 30% a quarter.','bad');
          UI.modal=null; render();
        });
    }
  },

  startbiz: e=>{ ACT._start(e.dataset.t, false); },
  startbizpartner: e=>{ ACT._start(e.dataset.t, true); },
  _start: function(typeId, withPartner){
    const T = BIZ.find(x=>x.id===typeId);
    if(withPartner){
      const offers = [genPartnerOffer(), genPartnerOffer(), genPartnerOffer()];
      UI.modal = {type:'partner', offers:offers, typeId:typeId, mode:'start'}; render(); return;
    }
    askAmount('Capital for '+T.name, 'Minimum viable is '+fmt(T.min)+'. You have '+fmt(S.fin.cash)+'. Keep six months of personal expenses outside the company.',
      Math.min(S.fin.cash, T.min), function(v){
        if(v < T.min*0.6){ toast('That is below what this business needs to function.'); return; }
        UI.modal = null; startBiz(typeId, null, v, null); render();
      });
  },

  /* ---- employing people for your own life ---- */
  housenego: e=>{
    const c = (S.houseCands||[]).find(function(x){ return x.id===e.dataset.i; }); if(!c) return;
    const R0 = HOUSE_ROLES[c.role]; if(!R0) return;
    const ask = c.ask || Math.round(c.salary*1.2);
    const fair = houseSalaryFor(c.role, c.skill);
    startNego({
      kind:'money', ctxLabel:'Hiring', title:R0.label+' — '+c.name, other:c.name,
      blurb:'Skill '+c.skill+'/10, '+(TRAITS.find(function(t){return t.id===c.trait;})||{name:''}).name+
        '. They are asking '+fmt(ask)+' a month. The going rate for this work at that level is about '+fmt(fair)+'. '+
        R0.note+' Every naira you agree to now is a naira you pay every month for as long as they stay, '+
        'and the person they describe to their friends afterwards is you.',
      metric:{low:Math.round(Math.max(fair*0.72, 30000)), high:ask, you:Math.round(fair*0.90), them:ask},
      leverage:clamp(46 + (S.p.rep||40)/6 - c.skill*2.5, 6, 90), maxRounds:3,
      onDeal:function(v){ hireHouse(c, v, c.payer||'you'); },
      onWalk:function(){ S.houseCands = (S.houseCands||[]).filter(function(x){ return x.id!==c.id; });
        log('life','You and '+c.name+' could not agree on money. They went elsewhere.','neutral'); },
      onImpasse:function(){ }
    });
  },
  houseask: e=>{
    const c = (S.houseCands||[]).find(function(x){ return x.id===e.dataset.i; }); if(!c) return;
    const ask = c.ask || Math.round(c.salary*1.2);
    if(S.fin.cash < Math.round(ask*0.5)){ toast('You need '+fmt(Math.round(ask*0.5))+' to place them.'); return; }
    hireHouse(c, ask, c.payer||'you');
    save('auto'); render();
  },
  housereview: e=>{
    const st = (S.house||[]).find(function(x){ return x.id===e.dataset.i; }); if(!st) return;
    const ask = Math.round((st.salary||0)*R.range(1.16,1.42));
    const fair = houseSalaryFor(st.role, st.skill);
    startNego({
      kind:'money', ctxLabel:'Pay review', title:st.name+' wants a review', other:st.name,
      blurb:'They have asked for '+fmt(ask)+' a month. The going rate for this work is about '+fmt(fair)+'. '+
        'This is the conversation where people decide whether you are somebody worth staying with.',
      metric:{low:Math.round(fair*0.92), high:ask, you:Math.round((st.salary||0)*R.range(1.01,1.08)), them:ask},
      leverage:clamp(40 + (st.loyalty||50)/8, 6, 85), maxRounds:3,
      onDeal:function(v){ st.salary = Math.round(v); st.morale = clamp(st.morale+9,3,100); st.loyalty = clamp(st.loyalty+7,0,100);
        log('life','You settled '+st.name+' at '+fmt(st.salary)+' a month.','good'); },
      onWalk:function(){ st.morale = clamp(st.morale-16,3,100); st.loyalty = clamp(st.loyalty-14,0,100);
        log('life','You refused '+st.name+' a review outright. They stayed. They also stopped volunteering anything.','warn'); },
      onImpasse:function(){ st.morale = clamp(st.morale-6,3,100); }
    });
  },
  houseraise: e=>{ houseRaise(e.dataset.i, parseFloat(e.dataset.v)||0.10); save('auto'); render(); },
  housetrain: e=>{ houseTrain(e.dataset.i); save('auto'); render(); },
  houseperk:  e=>{ housePerkToggle(e.dataset.i, e.dataset.k); save('auto'); render(); },
  housedeclare: e=>{ houseToggleDeclare(e.dataset.i); save('auto'); render(); },
  housefire: e=>{
    const st = (S.house||[]).find(function(x){ return x.id===e.dataset.i; }); if(!st) return;
    const due = Math.round((st.salary||0)*((S.turn-(st.joined||S.turn))>8?3:1));
    startNego({
      kind:'money', ctxLabel:'Severance', title:'Letting '+st.name+' go', other:st.name,
      blurb:'By contract and by custom they are owed about '+fmt(due)+'. You can offer less and most people take it, '+
        'because most people cannot afford to argue. Whether you should is a different question, and the rest of your '+
        'household will draw their own conclusions from whatever you do here.',
      metric:{low:0, high:Math.round(due*1.3), you:Math.round(due*0.55), them:Math.round(due*1.15)},
      leverage:clamp(58 + (S.p.rep||40)/10, 10, 88), maxRounds:3,
      onDeal:function(v){ fireHouse(st.id, v); },
      onWalk:function(){ st.morale = clamp(st.morale-22,3,100); st.loyalty = clamp(st.loyalty-20,0,100);
        log('life','You withdrew the offer and said nothing further. '+st.name+' is still in your house and now knows.','bad'); },
      onImpasse:function(){ st.morale = clamp(st.morale-14,3,100); st.loyalty = clamp(st.loyalty-12,0,100);
        log('life','You and '+st.name+' got nowhere on severance. They are still in your house, and now everybody '+
          'knows you tried to move them on.','warn'); }
    });
  },
  hireask: e=>{
    const c = (S.candidates||[]).find(function(x){ return x.id===e.dataset.i; }); if(!c) return;
    if(!S.biz){ toast('You have no company to hire into.'); return; }
    const ask = c.ask || Math.round(c.salary*1.2);
    if(S.fin.cash < Math.round(ask*0.5)){ toast('You need '+fmt(Math.round(ask*0.5))+' for the recruitment cost.'); return; }
    c.salary = Math.round(ask);
    hire(c);
    S.candidates = (S.candidates||[]).filter(function(x){ return x.id!==c.id; });
    S.p.skills.ops = clamp(S.p.skills.ops+1,0,100);
    log('biz','You took '+c.name+' at their asking price, '+fmt(c.salary)+' a month, without arguing. '+
      'Sometimes the negotiation costs more than the difference.','neutral');
    save('auto'); render();
  },
  negoaccept: e=>{
    const N = S.nego; if(!N) return;
    negFinish({status:'deal', value:Math.round(N.theirPos),
      text:'You took the number on the table. Not every negotiation is worth having, and you decided this was not one of them.'});
  },
  hirenego: e=>{
    const c = (S.candidates||[]).find(function(x){ return x.id===e.dataset.i; }); if(!c) return;
    if(!S.biz){ toast('You have no company to hire into.'); return; }
    const ask = c.ask || Math.round(c.salary*1.2);
    const fair = marketSalary(c.skill);
    const b = S.biz;
    startNego({
      kind:'money', ctxLabel:'Hiring', title:'Offer to '+c.name, other:c.name,
      blurb:'Skill '+c.skill+'/10, '+(TRAITS.find(function(t){return t.id===c.trait;})||{name:''}).name+
        '. They are asking '+fmt(ask)+' a month. Market for this skill is '+fmt(fair)+
        '. Every naira you agree to now is a naira you pay every month for as long as they stay, '+
        'and it sets the benchmark for everyone you hire afterwards.',
      metric:{low:Math.round(Math.max(c.salary*0.72, fair*0.78)), high:ask, you:Math.round(c.salary*0.92), them:ask},
      leverage:clamp(45 + (S.p.rep||40)/6 - c.skill*2.5, 6, 90), maxRounds:3,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        const cc = (S.candidates||[]).find(function(x){ return x.id===c.id; }); if(!cc) return;
        cc.salary = Math.round(v);
        hire(cc);
        S.candidates = (S.candidates||[]).filter(function(x){ return x.id!==cc.id; });
        const bb = S.biz;
        if(bb){
          const st = (bb.staff||[]).find(function(x){ return x.name===cc.name; });
          if(st){
            if(given.indexOf('notice')>=0) st.loyalty = clamp((st.loyalty||50)+12,0,100);
            if(given.indexOf('title')>=0){ st.title = R.pick(['Senior','Lead','Manager']); st.morale = clamp(st.morale+8,3,100); }
            if(given.indexOf('flex')>=0) st.morale = clamp(st.morale+7,3,100);
          }
        }
        S.p.skills.ops = clamp(S.p.skills.ops+1,0,100);
      },
      onWalk:function(){ S.candidates = (S.candidates||[]).filter(function(x){ return x.id!==c.id; });
        log('biz','You and '+c.name+' could not agree on money. They went elsewhere.','neutral'); },
      onImpasse:function(){ }
    });
  },
  supplnego: e=>{
    const b = S.biz; if(!b) return;
    const cur = b.supplierDays||30;
    startNego({
      kind:'days', ctxLabel:'Supplier terms', title:'Terms with your main supplier', other:'your supplier',
      blurb:'You currently settle in '+cur+' days. Every extra week of terms is stock you can carry without cash, '+
        'and stock is the difference between a business that sells and one that apologises. '+
        'They will want to shorten it. Their confidence in you is '+Math.round(b.supplierConf===undefined?70:b.supplierConf)+'/100.',
      metric:{low:cur, high:Math.max(14, Math.round(cur*0.45)), you:Math.round(cur*1.6), them:Math.max(14, Math.round(cur*0.45))},
      leverage:clamp(30 + (b.supplierConf===undefined?70:b.supplierConf)/3 + ((b.revenue||0)>(S.biz.lastRevenue||0)?8:0), 6, 90), maxRounds:2,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        b.supplierDays = Math.round(v);
        b.supplierConf = clamp((b.supplierConf===undefined?70:b.supplierConf) - (v>cur+20?8:0) + 4, 0, 100);
        if(given.indexOf('volume')>=0){ b.supplierConf = clamp(b.supplierConf+10,0,100); b.supplierDays = Math.round(b.supplierDays*1.15); }
        log('biz','Supplier terms agreed at '+Math.round(v)+' days.','good');
        S.p.skills.finance = clamp(S.p.skills.finance+2,0,100);
      },
      onWalk:function(){
        b.supplierConf = clamp((b.supplierConf===undefined?70:b.supplierConf)-14,0,100);
        b.supplierDays = Math.max(14, Math.round((b.supplierDays||30)*0.75));
        log('biz','You pushed for longer terms and your supplier pushed back. They now want paying sooner.','bad');
      },
      onImpasse:function(){ }
    });
  },
  transfer: e=>{
    const from = bizById(e.dataset.f) || S.biz; if(!from) return;
    const to = bizById(e.dataset.t); if(!to || to.id===from.id) return;
    const maxOut = Math.max(0, Math.round(from.cash));
    if(maxOut<=0){ toast(from.name+' has no cash to move.'); return; }
    askAmount('Move cash from '+from.name+' to '+to.name,
      'Treasury. The company has '+fmt(maxOut)+' available. '+
      (from.equity<100? 'You own '+Math.round(from.equity)+'% of this one — moving money out that the minority partner cannot see is how partnerships end badly.':'')+
      ' Cash moved between your own companies is not income, but starving one to feed another is a decision with consequences.',
      Math.round(maxOut*0.4), function(v){
      if(!v || v<=0) return;
      const amt = Math.min(v, Math.max(0, M_get(from).cash));
      from.cash -= amt; to.cash += amt;
      log('biz','You moved '+fmt(amt)+' from '+from.name+' to '+to.name+'.','neutral');
      if(from.equity<100 && from.partner){ from.partner.trust = clamp((from.partner.trust||50)-9,0,100); }
      save('auto'); render();
    });
  },
  /* ---------------- governance: board, votes, register, bids ---------------- */
  appointdir: ()=>{
    const b=S.biz; if(!b) return; ensureGov(b);
    if(freeSeats(b)<=0){ toast('Every seat is taken.'); return; }
    const cands=[genDirector('pro'), genDirector(R.pick(['money','operator','connector','craft'])), genDirector(R.pick(['money','operator','connector','craft','nominee']))];
    cands.forEach(function(d){ const A=archOf(d.arc); d.fee = Math.round((180000 + (d.skill[A.skill]||50)*5400)*S.cumInfl); });
    UI.modal={type:'govappoint', cands:cands, biz:b.id}; render();
  },
  pickdir: e=>{
    const M=UI.modal; const b=bizById(M.biz)||S.biz; const d=M.cands[parseInt(e.dataset.i,10)];
    if(!b||!d) return;
    b.board.push(d); syncCapTable(b);
    log('biz', d.name+' joined the board of '+b.name+' as a non-executive, for '+fmt(d.fee)+' a year and one opinion you did not previously have.','neutral');
    UI.modal=null; render();
  },
  removedir: e=>{
    const b=S.biz; if(!b) return; const d=directorById(b, e.dataset.d); if(!d||d.yours) return;
    if(reservedMatter(b,'remove') && (b.externalPct||0)>0){
      openResolution(b,'remove',{dirId:d.id},'you');
      message('Reserved matter','Removing a director needs a special resolution \u2014 75% of the shares. It is tabled. Go to the Governance tab and go to work on it.');
      return;
    }
    confirmBox('Remove '+d.name+'?','They will not be neutral about it afterwards, and whoever nominated them will hear their version first.',function(){
      b.board=(b.board||[]).filter(function(x){ return x.id!==d.id; });
      const h=holderById(b, d.holderId||''); if(h) h.trust=clamp((h.trust||50)-26,0,100);
      log('biz', d.name+' was removed from the board of '+b.name+'.','warn');
      UI.modal=null; render();
    },'Remove');
  },
  lobby: e=>{
    const b=S.biz; if(!b) return;
    const open=openResolutions(b);
    if(!open.length){ toast('Nothing is tabled yet.'); return; }
    const res=open[open.length-1];
    toast(lobbyDirector(b, res, e.dataset.d, e.dataset.m), 4800);
    render();
  },
  govsub: e=>{ UI.govSub = e.dataset.s; render(); },
  proposeplan: ()=>{
    const b=S.biz; if(!b) return; ensureGov(b);
    UI.modal = {type:'govplan', biz:b.id, plan: defaultPlan(b)}; render();
  },
  submitplan: ()=>{
    const M=UI.modal, b=bizById(M.biz)||S.biz; const p=M.plan; if(!b||!p) return;
    UI.modal=null;
    openResolution(b,'plan',{plan:Object.assign({},p,{ebitda:Math.round(p.revenue*Math.max(0.02,(p.gm/100)-(p.opex/Math.max(1,p.revenue))))})},'you');
    render();
  },
  tablepool: ()=>{
    const b=S.biz; if(!b) return; ensureGov(b);
    askAmount('Option pool','Investors will require a pool for the management team before they subscribe, and they will require it to come out of the existing holders. '+
      'Current unallocated pool: '+pct((b.pool||0)/100,1)+'.', Math.max(8, Math.round((b.pool||0)+6)), function(v){
        UI.modal=null; openResolution(b,'pool',{target:clamp(Math.round(v),1,20)},'you'); render(); });
  },
  grantopt: ()=>{ if(!S.biz) return; UI.modal={type:'govopt', biz:S.biz.id}; render(); },
  dogrant: e=>{
    const b=S.biz; if(!b) return;
    toast(grantOptions(b, e.dataset.s, parseFloat(e.dataset.p)||1, 1), 4200);
    UI.modal=null; render();
  },
  whip: e=>{ const b=S.biz; if(!b) return;
    const r=((b.resolutions)||[]).find(function(x){ return x.id===e.dataset.r; }); if(!r) return;
    r.youWant = (e.dataset.w==='1'); render(); },
  callvote: e=>{ const b=S.biz; if(!b) return; callVote(b, e.dataset.r); render(); },
  withdrawres: e=>{ const b=S.biz; if(!b) return;
    b.resolutions=(b.resolutions||[]).filter(function(r){ return r.id!==e.dataset.r; });
    toast('Withdrawn. Nobody records a resolution that was never called.'); render(); },
  tableres: e=>{
    const b=S.biz; if(!b) return; const k=e.dataset.k;
    ensureGov(b); formBoard(b);
    if(k==='dividend'){
      const max=Math.max(0, Math.round((b.cash||0)*0.8));
      if(max<=0){ toast('There is no cash to distribute.'); return; }
      askAmount('Declare a distribution','The company holds '+fmt(b.cash||0)+'. Distributing it starves working capital; refusing it starves your directors\u2019 patience. Both are real costs.',
        Math.round(max*0.5), function(v){ UI.modal=null; openResolution(b,'dividend',{amt:Math.round(v)},'you'); render(); });
      return;
    }
    if(k==='raise'){
      const v=Math.max(2000000, bizValue(b));
      askAmount('Raise outside capital','At a whole-company value of '+fmt(v)+', every naira you take in costs you a slice of the company. The investor will want a preference, and the board will vote on whether to have them.',
        Math.round(v*0.25), function(amt){
          UI.modal=null;
          const pctv=clamp(Math.round(amt/(v+amt)*100),5,45);
          openResolution(b,'raise',{amount:Math.round(amt), pct:pctv, pref:1.0, participate:false,
            antiDilute:'weighted', board:true, roundLabel:'Round '+(((b.rounds||[]).length)+1),
            name:R.pick(FIRST)+' '+R.pick(LAST)+' ('+R.pick(['a fund','a family office','an industry investor','a syndicate of three','a diaspora group'])+')'},'you');
          render(); });
      return;
    }
    if(k==='sell'){
      let bd=(b.inbound||[]).filter(function(x){ return x.status==='live'; })[0];
      if(!bd){ bd=genInboundBid(b, true);
        if(bd) log('biz','You asked a broker to take '+b.name+' to market. One approach came back: '+bd.from+', headline '+fmt(bd.head)+'.','neutral'); }
      if(!bd){ toast('Nobody will make an offer on these numbers.'); return; }
      openResolution(b,'sell',{bidId:bd.id},'you'); render(); return;
    }
    if(k==='acquire'){
      const t=(S.mkt.targets||[]).filter(function(x){ return !x.won; })[0];
      if(!t){ toast('Nothing is on the market to you.'); return; }
      askAmount('Bid for '+t.name,'Asking '+fmt(t.asking)+'. '+t.bidders+' other bidder(s). Revenue '+fmt(t.revenue)+', profit '+fmt(t.profit)+'.',
        Math.round((t.asking||0)*1.05), function(v){ UI.modal={type:'govfin', tid:t.id, bid:b.id, price:Math.round(v)}; render(); });
      return;
    }
    if(k==='borrow'){
      askAmount('Borrow at company level','The company carries the debt and the board carries the vote. What the company cannot service, the shareholders eventually do.',
        Math.round(Math.max(2000000,(b.revenue||0)*0.3)), function(v){ UI.modal=null; openResolution(b,'borrow',{amount:Math.round(v)},'you'); render(); });
      return;
    }
    if(k==='ceo'){ UI.modal={type:'govceo', cands:[genMD(1),genMD(2),genMD(3)], biz:b.id}; render(); return; }
    if(k==='expand'){
      askAmount('Capital commitment','This is the resolution that turns an intention into an entry in the accounts. Name the sum and the board will decide whether you get it.',
        Math.round(Math.max(3000000,(b.revenue||0)*0.25)), function(v){ UI.modal=null; openResolution(b,'expand',{cost:Math.round(v)},'you'); render(); });
      return;
    }
    if(k==='audit'){ openResolution(b,'audit',{},'you'); render(); return; }
    if(k==='deed'){ UI.modal={type:'govdeed', biz:b.id}; render(); return; }
    if(k==='dissolve'){
      confirmBox('Wind up '+b.name+'?','The shareholders vote. If it carries, the company is wound up and the residue goes out through the preference stack.',
        function(){ UI.modal=null; openResolution(b,'dissolve',{},'you'); render(); },'Table it');
      return;
    }
  },
  pickceo: e=>{ const M=UI.modal; const b=bizById(M.biz)||S.biz; const m=M.cands[parseInt(e.dataset.i,10)];
    UI.modal=null; openResolution(b,'ceo',{md:m},'you'); render(); },
  amenddeed: ()=>{ if(!S.biz) return; UI.modal={type:'govdeed', biz:S.biz.id}; render(); },
  pickdeed: e=>{
    const M=UI.modal, b=bizById(M.biz)||S.biz, i=parseInt(e.dataset.i,10);
    const O=[{k:'preEmption',label:'Pre-emption rights',flip:true,on:'New shares are offered to existing holders first.',off:'New shares can be placed with anybody.'},
             {k:'drag',label:'Drag-along',flip:true,on:'A qualifying majority can force everyone to sell.',off:'Nobody can be dragged into a sale.'},
             {k:'tag',label:'Tag-along',flip:true,on:'Minorities can join any sale on identical terms.',off:'Minorities can be left behind.'},
             {k:'deadlock',label:'Deadlock mechanism',cycle:['mediation','shotgun','expert']},
             {k:'infoRights',label:'Reporting to holders',cycle:['annual','quarterly','monthly']}][i];
    if(!O) return;
    const dd=deedOf(b); let val,label;
    if(O.flip){ val=!dd[O.k]; label=O.label+' turned '+(val?'on':'off')+' \u2014 '+(val?O.on:O.off); }
    else { const cur=O.cycle.indexOf(dd[O.k]); val=O.cycle[(cur+1)%O.cycle.length]; label=O.label+' set to '+val+'.'; }
    UI.modal=null; openResolution(b,'deed',{key:O.k, value:val, label:label},'you'); render();
  },
  fulfil: e=>{
    const b=S.biz; if(!b) return;
    toast(fulfilUndertaking(b, e.dataset.u), 4600); render();
  },
  shotgun: e=>{
    const b=S.biz; if(!b) return; const h=holderById(b, e.dataset.h); if(!h) return;
    const fair=Math.max(1000000, bizValue(b));
    askAmount('Name your number','A whole-company value. '+esc(h.name)+' must then either buy your '+pct(yourPct(b)/100,1)+
      ' at that number, or sell their '+pct((h.pct||0)/100,1)+' to you at it. Independent value today is about '+fmt(fair)+
      '. Name it high and you will be funding the buyout; name it low and you have sold at your own number.',
      fair, function(v){ UI.modal=null; triggerShotgun(b, h.id, Math.round(v)); render(); });
  },
  buyoutminority: ()=>{
    const b=S.biz; if(!b) return; ensureGov(b);
    const q=buyoutExternal(b,1.30);
    if(!q.holders.length){ toast('There is nobody to buy out.'); return; }
    confirmBox('Buy out the minorities?',
      'About '+fmt(q.cost)+' for '+pct((b.externalPct||0)/100,1)+' of '+b.name+', at a 30% premium to today\u2019s '+fmt(q.value)+
      '. You have '+fmt(S.fin.cash)+' in personal cash.', function(){
        const r=doBuyoutExternal(b,1.30);
        if(!r){ toast('You cannot fund it.'); return; }
        log('biz','You bought out '+r.names+' for '+fmt(r.cost)+'. The register has one name on it again.','good');
        UI.modal=null; render();
      },'Pay about '+fmt(q.cost));
  },
  biddd: e=>{ const b=S.biz; if(!b) return; toast(runDiligence(b, e.dataset.i), 4800); render(); },
  bidnego: e=>{
    const b=S.biz; if(!b) return; const bd=(b.inbound||[]).find(function(x){ return x.id===e.dataset.i; }); if(!bd) return;
    const ask=Math.round(bidHead(bd)*1.34);
    startNego({kind:'pct', ctxLabel:'Discount off your asking price', title:'Terms with '+bd.from, other:bd.from,
      blurb:'You are asking '+fmt(ask)+' for the whole company. Their headline is '+fmt(bidHead(bd))+
        '. What is being negotiated is how much of your number you keep.',
      metric:{low:0, high:32, you:2, them:23},
      leverage:clamp(34 + bizMomentum(b)*24 + (b.externalPct||0)*0.35 + (b.formal?8:0), 5, 95), maxRounds:3,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v){ bd.head=Math.round(ask*(1 - v/100)); bd.chip=0;
        log('biz','Renegotiated with '+bd.from+': headline now '+fmt(bd.head)+'.','good'); },
      onWalk:function(){ bd.status='dead'; b.inbound=(b.inbound||[]).filter(function(x){ return x.id!==bd.id; });
        log('biz','You walked away from '+bd.from+'. They may come back. They will not come back at that number.','neutral'); }});
  },
  bidaccept: e=>{
    const b=S.biz; if(!b) return; const bd=(b.inbound||[]).find(function(x){ return x.id===e.dataset.i; }); if(!bd) return;
    openResolution(b,'sell',{bidId:bd.id},'you'); render();
  },
  bidreject: e=>{
    const b=S.biz; if(!b) return; const bd=(b.inbound||[]).find(function(x){ return x.id!==undefined && x.id===e.dataset.i; }); if(!bd) return;
    b.inbound=(b.inbound||[]).filter(function(x){ return x.id!==bd.id; });
    log('biz','You rejected the approach from '+bd.from+'. They will be back if the numbers improve, and they will remember if you handled it badly.','neutral');
    render();
  },
  tgtdd: e=>{
    const t=(S.mkt.targets||[]).find(function(x){ return x.id===e.dataset.i; }); if(!t) return;
    const c=diligenceTarget(t);
    if(c===null){ toast('You cannot fund the diligence.'); return; }
    toast('Diligence cost '+fmt(c)+'. '+(((t.hidden||[]).length)? 'It found things.':'It came back clean.'), 4800); render();
  },
  tgtbid: e=>{
    const t=(S.mkt.targets||[]).find(function(x){ return x.id===e.dataset.i; }); if(!t) return;
    askAmount('Bid for '+t.name,'Asking '+fmt(t.asking)+'. '+t.bidders+' other bidder(s). Diligence '+(t.dd?'done':'NOT done, and undiscovered problems arrive after completion at full price')+'.',
      Math.round((t.asking||0)*1.05), function(v){ UI.modal={type:'govfin', tid:t.id, bid:(S.biz&&S.biz.id), price:Math.round(v)}; render(); });
  },
  pickfin: e=>{
    const M=UI.modal, b=bizById(M.bid)||S.biz, t=(S.mkt.targets||[]).find(function(x){ return x.id===M.tid; });
    UI.modal=null; if(!t||!b){ render(); return; }
    if(reservedMatter(b,'acquire') && (b.externalPct||0)>0){
      openResolution(b,'acquire',{targetId:t.id, price:M.price, finance:e.dataset.f},'you');
      message('Reserved matter','Acquisitions need a special resolution \u2014 75% of the shares. It is tabled.');
      return;
    }
    makeBid(b, t, M.price, e.dataset.f); render();
  },

  rentnego: e=>{
    const b = S.biz; if(!b) return;
    const o = (b.outlets||[]).find(function(x){ return x.id===e.dataset.o; }); if(!o) return;
    const current = o.rent||0;
    const ask = Math.round(current*(1+R.range(0.18,0.55)));
    startNego({
      kind:'money', ctxLabel:'Lease renewal', title:'Renewing the lease at '+o.name, other:'Mr '+o.landlord,
      blurb:'Your landlord has opened at '+fmt(ask)+' a month, up from '+fmt(current)+
        '. You have been here since turn '+(o.opened||0)+', you have never missed a rent payment, '+
        'and the unit next door has been empty for five months. All three of those facts are worth something in this conversation.',
      metric:{low:Math.round(current*0.98), high:ask, you:Math.round(current*1.06), them:ask},
      leverage:clamp(38 + (o.goodwill||50)/4 + (b.locations>1?6:0), 8, 88), maxRounds:2,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        o.rent = Math.round(v); o.end = R.int(6,12); o.hikes = (o.hikes||0)+1;
        o.goodwill = clamp((o.goodwill||50)+8,0,100);
        if(given.indexOf('notice')>=0) o.end += 4;
        log('biz','Lease renewed at '+fmt(o.rent)+'/month for '+o.end+' quarters.','good');
      },
      onWalk:function(){
        o.goodwill = clamp((o.goodwill||50)-25,0,100); o.end = 1;
        log('biz','You refused the increase. The landlord has given you one quarter to leave.','bad');
        S.flags.mustRelocate = true;
      },
      onImpasse:function(){ o.rent = Math.round(current*1.18); o.end = R.int(4,8);
        log('biz','The lease rolled over at '+fmt(o.rent)+'/month. You neither agreed nor left.','warn'); }
    });
  },
  sellbiz: e=>{
    const b = S.biz; if(!b) return;
    const base = bizValue(b);
    const buyer = R.pick(['a competitor','a private equity fund','a family office','a larger group','an industry buyer']);
    startNego({
      kind:'pct', ctxLabel:'Discount off your asking price', title:'Selling '+b.name, other:buyer,
      blurb:'They have valued the business at '+fmt(Math.round(base*0.82))+'. You are asking '+fmt(Math.round(base*1.30))+
        '. Everything you concede comes straight off the number you receive, so the unit here is the discount, not the price.',
      metric:{low:0, high:34, you:3, them:24},
      leverage:clamp(35 + (b.rep||40)/5 + (b.formal?10:0) + ((b.contracts||[]).length*4), 8, 92), maxRounds:3,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        const price = Math.round(base*1.30*(1 - v/100));
        const mine = sellBiz(b, price);
        log('biz','You sold '+b.name+' to '+buyer+' for '+fmt(price)+'. Your share after partners: '+fmt(mine)+'.','good');
        S.p.stress = clamp(S.p.stress-8,0,100); S.p.happy = clamp(S.p.happy+6,0,100);
        S.flags.hadExit = true;
        toast('Sold for '+fmt(price), 3600);
      },
      onWalk:function(){ log('biz','You pulled out of the sale. It is still yours.','neutral'); },
      onImpasse:function(){ log('biz','The sale fell apart over price. They may come back.','warn'); }
    });
  },
  switchbiz: e=>{ if(setActiveBiz(e.dataset.b)){ render(); } },
  anotherbiz: ()=>{ UI.modal = {type:'anotherbiz'}; render(); },

  openoutlet: e=>{
    const b = S.biz; if(!b) return;
    const T = BIZ.find(function(x){ return x.id===b.type; });
    const cm = CITIES.find(function(c){ return c.id===e.dataset.c; }) || CITY();
    const cost = Math.round(Math.max(2500000, (b.revenue||0)*0.45 + T.rentQ*3)*S.cumInfl*cm.rentMult);
    UI.modal = {type:'confirm', title:'Open a unit in '+cm.label+'?',
      text:'Fit-out, deposits and the first quarter of rent come to <b>'+fmt(cost)+'</b>. The company has '+fmt(Math.round(Math.max(0,b.cash)))+' in cash. '+
        'Opening a second unit roughly doubles your fixed costs immediately and takes about four quarters to reach the trade of the first.',
      okLabel:'Open it', cb:function(){
        const o = openOutlet(S.biz, {city:e.dataset.c});
        if(o) log('biz','You opened a unit in '+cm.label+': '+o.name+'. Rent '+fmt(o.rent)+'/month.','good');
        UI.modal = null; save('auto'); render();
      }};
    render();
  },
  closeoutlet: e=>{
    const b = S.biz; if(!b) return;
    const o = (b.outlets||[]).find(function(x){ return x.id===e.dataset.o; }); if(!o) return;
    UI.modal = {type:'confirm', title:'Close '+o.name+'?',
      text:'Severance for the staff who cannot be redeployed, dilapidations, and whatever remains of the fit-out. '+
        'The customers do not transfer to your other units as reliably as you are assuming they will.',
      okLabel:'Close it', cb:function(){ closeOutlet(S.biz, e.dataset.o); UI.modal=null; save('auto'); render(); }};
    render();
  },
  upgradeoutlet: e=>{ const b=S.biz; if(b && upgradeOutlet(b, e.dataset.o)){ save('auto'); render(); } },
  maintainoutlet: e=>{
    const b = S.biz; if(!b) return;
    const o = (b.outlets||[]).find(function(x){ return x.id===e.dataset.o; }); if(!o) return;
    askAmount('Maintain this unit', 'Condition is '+Math.round(o.cond||80)+'/100. Bringing it back up costs roughly '+fmt(Math.round((o.fitout||3000000)*0.012))+' per point of condition, and it decays every quarter you ignore it.',
      Math.round((o.fitout||3000000)*0.05), function(v){
      if(!v || v<=0) return;
      maintainOutlet(S.biz, e.dataset.o, v);
      log('biz','You spent '+fmt(v)+' on the '+o.name+' unit.','neutral');
      save('auto'); render();
    });
  },

  bid: e=>{
    const b = S.biz; if(!b) return;
    const r = submitBid(b, e.dataset.o, e.dataset.v);
    if(r && r.won){
      // winner gets to argue about payment terms
      const c = r.contract;
      startNego({
        kind:'days', ctxLabel:'Payment terms', title:'How quickly '+c.client+' pays', other:c.client,
        blurb:'You have won the work at '+fmt(c.value)+' a quarter. Nothing is signed yet, and payment terms were left "to be agreed". '+
          'This is the single most consequential sentence in most contracts, and it is usually the one nobody argues about.',
        metric:{low:14, high:Math.max(30,(c.payDays||45)+15), you:14, them:(c.payDays||45)},
        leverage:clamp(35 + (b.rep||40)/4, 8, 88), maxRounds:2,
        terms:R.pickN(NEG_TERM_POOL,3),
        onDeal:function(v, given){
          c.payDays = Math.round(v);
          if(given.indexOf('deposit')>=0){ b.cash += Math.round((c.value||0)*0.3); c.deposit = true; }
          if(given.indexOf('penalty')>=0){ c.risk = (c.risk||0.12)+0.06; }
          log('biz','Payment agreed at '+Math.round(v)+' days.'+(given.indexOf('deposit')>=0?' They also paid three months up front.':''),'good');
        },
        onWalk:function(){ b.contracts = (b.contracts||[]).filter(function(x){ return x.id!==c.id; });
          log('biz','You won the tender and then lost it arguing about payment terms.','warn'); },
        onImpasse:function(){ c.payDays = Math.max(30,(c.payDays||45)); }
      });
      return;
    }
    save('auto'); render();
  },
  renewc: e=>{
    const b = S.biz; if(!b) return;
    const c = (b.contracts||[]).find(function(x){ return x.id===e.dataset.c; });
    if(c) renewContract(b, c);
  },
  dropc: e=>{
    const b = S.biz; if(!b) return;
    const c = (b.contracts||[]).find(function(x){ return x.id===e.dataset.c; }); if(!c) return;
    UI.modal = {type:'confirm', title:'Walk away from '+c.client+'?',
      text:'You lose '+fmt(c.value)+' a quarter of contracted revenue. You also stop whatever this contract has been costing you in margin and attention.',
      okLabel:'Walk away', cb:function(){
        b.contracts = (b.contracts||[]).filter(function(x){ return x.id!==c.id; });
        log('biz','You walked away from the contract with '+c.client+'.','warn');
        UI.modal=null; save('auto'); render();
      }};
    render();
  },

  trainstaff: e=>{
    const b = S.biz; if(!b) return;
    const st = (b.staff||[]).find(function(x){ return x.id===e.dataset.s; }); if(!st) return;
    const cost = Math.round(st.salary*2.6);
    UI.modal = {type:'confirm', title:'Train '+st.name+'?',
      text:'A short course: <b>'+fmt(cost)+'</b>. About a third of these turn into a real skill point. '+
        'Even when they do not, people notice that you paid.',
      okLabel:'Pay for it', cb:function(){
        const r = trainStaff(S.biz, e.dataset.s, 1);
        UI.modal = {type:'message', title:r&&r.ok?'It took':'It did not take', text:(r?r.text:'Nothing happened.')};
        save('auto'); render();
      }};
    render();
  },
  promotegm: e=>{
    const b = S.biz; if(!b) return;
    if(promoteGM(b, e.dataset.s)){ save('auto'); render(); }
    else { message('Not yet','A general manager needs to be genuinely senior — skill 6 or above — and you can only have one.'); }
  },
  raisenego: e=>{
    const b = S.biz; if(!b) return;
    const st = (b.staff||[]).find(function(x){ return x.id===e.dataset.s; }); if(!st) return;
    const ask = Math.round(st.salary*R.range(1.18,1.45));
    const fair = marketSalary(st.skill);
    startNego({
      kind:'money', ctxLabel:'Pay review', title:st.name+' wants a review', other:st.name,
      blurb:'They have asked for '+fmt(ask)+' a month. Market for someone at skill '+st.skill+'/10 is about '+fmt(fair)+
        ', and you are currently paying '+fmt(st.salary)+'. Their morale is '+Math.round(st.morale)+' and their loyalty is '+Math.round(st.loyalty)+'.',
      metric:{low:Math.round(st.salary*1.02), high:ask, you:Math.round(Math.min(ask*0.92, st.salary*1.10)), them:ask},
      leverage:clamp(70 - st.skill*3 - (st.morale||50)/8, 5, 92), maxRounds:3,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        st.salary = Math.round(v);
        st.morale = clamp(st.morale + (v>=ask*0.9?16:8), 3, 100);
        st.loyalty = clamp(st.loyalty + 8, 0, 100);
        if(given.indexOf('title')>=0){ st.title = R.pick(['Senior','Lead','Head of Operations','Manager']); st.morale = clamp(st.morale+8,3,100); }
        if(given.indexOf('review')>=0){ st.reviewIn = 2; }
        log('biz','Pay review settled at '+fmt(st.salary)+'/month for '+st.name+'.','good');
      },
      onWalk:function(){
        st.morale = clamp(st.morale-22,3,100); st.loyalty = clamp(st.loyalty-20,0,100);
        log('biz','You refused '+st.name+'\u2019s pay review outright. They are still here. They are also looking.','bad');
      },
      onImpasse:function(){ st.morale = clamp(st.morale-9,3,100); log('biz','The pay review ended without agreement.','warn'); }
    });
  },
  firenego: e=>{
    const b = S.biz; if(!b) return;
    const st = (b.staff||[]).find(function(x){ return x.id===e.dataset.s; }); if(!st) return;
    const due = Math.round(st.salary*((S.turn-(st.joined||S.turn))>8?3:1));
    startNego({
      kind:'money', ctxLabel:'Severance', title:'Letting '+st.name+' go', other:st.name,
      blurb:'They are entitled to about '+fmt(due)+' by contract and custom. You can offer less and most people take it, '+
        'because contesting it costs them more than it is worth. That is not the same as it being right.',
      metric:{low:0, high:due*2, you:Math.round(due*0.35), them:due*2},
      leverage:clamp(58 + (b.cash>0?10:0), 20, 90), maxRounds:2,
      terms:R.pickN(NEG_TERM_POOL,3),
      onDeal:function(v, given){
        const sev = Math.round(v);
        b.cash -= sev;
        b.staff = (b.staff||[]).filter(function(x){ return x.id!==st.id; });
        b.staff.forEach(function(o){ o.morale = clamp(o.morale - (sev<due*0.6?10:3), 3, 100); o.loyalty = clamp(o.loyalty-6,0,100); });
        if(given.indexOf('ref')>=0) st.amicable = true;
        log('biz','You let '+st.name+' go. Severance '+fmt(sev)+'. '+(sev<due*0.6?'The rest of the team noticed.':'It was handled properly.'), sev<due*0.6?'warn':'neutral');
      },
      onWalk:function(){ log('biz','The conversation went badly and '+st.name+' is still on the payroll.','warn'); },
      onImpasse:function(){ b.cash -= due; b.staff = (b.staff||[]).filter(function(x){ return x.id!==st.id; });
        log('biz','You paid the full severance rather than keep arguing: '+fmt(due)+'.','neutral'); }
    });
  },

  negtactic: e=>{
    const r = negResolveTactic(e.dataset.t, e.dataset.m);
    if(r && r.status==='open'){
      // stay in the negotiation; refresh the board text
      UI.modal = {type:'nego', beat:r.text, gave:r.gaveTerm};
      render();
    }
  },
  negclose: ()=>{ negCloseModal(); },
  bizinsure: ()=>{
    const b = S.biz; if(!b) return;
    const prem = Math.round(Math.max(180000, (b.revenue||0)*0.012)*S.cumInfl);
    if(b.insured===true){ message('Already covered','The policy is in force.'); return; }
    if(b.cash < prem){ toast('The company cannot fund '+fmt(prem)+' this quarter.'); return; }
    b.cash -= prem; b.insured = true;
    log('biz','You insured the business for '+fmt(prem)+' a quarter. Every year it felt like a waste, until the year it was not.','good');
    toast('Insured.', 2600); save('auto'); render();
  },
  bizacct: ()=>{
    const b = S.biz; if(!b) return;
    const cost = Math.round(Math.max(120000, (b.revenue||0)*0.008)*S.cumInfl);
    if(b.cash < cost){ toast('The company cannot fund '+fmt(cost)+' this quarter.'); return; }
    b.cash -= cost;
    b.compliance = clamp((b.compliance||40) + 16, 0, 100);
    b.taxRisk = clamp((b.taxRisk||0) - 12, 0, 100);
    S.p.skills.finance = clamp(S.p.skills.finance+1.5,0,100);
    log('biz','You engaged an accountant at '+fmt(cost)+'/quarter. The books are now defensible.','good');
    save('auto'); render();
  },
  bizauto: e=>{
    const b = S.biz; if(!b) return;
    const cost = Math.round(Math.max(1500000, (b.revenue||0)*0.35)*S.cumInfl);
    askAmount('Invest in equipment', 'Equipment raises output per person, improves stock control and reduces shrinkage. It also turns cash into something you cannot spend. You have '+fmt(Math.max(0,b.cash))+' in the company.',
      Math.min(Math.max(0,Math.round(b.cash*0.5)), cost), function(v){
      if(!v || v<=0) return;
      const spend = Math.min(v, Math.max(0, S.biz.cash));
      if(spend<=0){ toast('No cash in the company to invest.'); return; }
      S.biz.cash -= spend;
      S.biz.capex += spend;
      const gain = clamp(spend/(Math.max(1,(S.biz.revenue||0)*0.35))*14, 3, 18);
      S.biz.auto = clamp((S.biz.auto||0)+gain, 0, 100);
      S.biz.quality = clamp(S.biz.quality + gain*0.25, 0, 100);
      log('biz','You put '+fmt(spend)+' into equipment. Automation is now '+Math.round(S.biz.auto)+'/100.','good');
      save('auto'); render();
    });
  },
  takedeal: e=>{ if(takeDeal(e.dataset.d)){ toast('Capital committed.', 2600); render(); } },
  passdeal: e=>{ S.deals = (S.deals||[]).filter(function(d){ return d.id!==e.dataset.d; }); render(); },

  favour: e=>{
    const c = castOf(e.dataset.c); if(!c || !c.alive) return;
    const F = FAVOURS[c.role]; if(!F) return;
    const odds = clamp(F.odds(c), 0.05, 0.97);
    const cd = 'fav_'+c.id;
    S.cd[cd] = S.cd[cd] || 0;
    if(S.cd[cd] > S.turn){ message(c.name+' needs a bit of time','You have already asked them for something recently. Asking twice in a year is how a relationship becomes a transaction.'); return; }
    if(R.chance(odds)){
      S.cd[cd] = S.turn + R.int(3,6);
      F.fx(); relate(c, 6, 'you asked and they came through');
      S.stand.community = clamp(S.stand.community+1,0,100);
      UI.modal = {type:'result', res:{kind:'good', text:F.ok, principle:'Asking is a skill. The worst outcome is usually a no, and a no costs nothing.'}, opt:{label:F.ask}};
    } else {
      S.cd[cd] = S.turn + R.int(4,8);
      relate(c, -7, 'you asked and they declined');
      UI.modal = {type:'result', res:{kind:'warn', text:F.fail, principle:'Relationships are accounts. Every withdrawal shows up eventually.'}, opt:{label:F.ask}};
    }
    save('auto'); render();
  },
  give: e=>{
    const c = castOf(e.dataset.c); if(!c || !c.alive) return;
    askAmount('Send money to '+c.name, 'Gifts buy goodwill and, in this economy, they are also a form of insurance. There is no return on this except the relationship.',
      Math.round(50000*S.cumInfl), function(amt){
        if(amt<=0) return;
        if(S.fin.cash < amt){ toast('You do not have that.'); return; }
        S.fin.cash -= amt;
        const warm = clamp(amt/(40000*S.cumInfl), 1, 34);
        relate(c, warm, 'you sent them '+fmt(amt));
        S.stand.community = clamp(S.stand.community + clamp(warm*0.5,1,12), 0, 100);
        S.p.rep = clamp(S.p.rep + clamp(warm*0.3,0,6), 0, 100);
        log('life','You sent '+c.name+' '+fmt(amt)+'. '+(warm>18?'They will remember this for years.':'It was received with thanks.'), 'good');
        if(c.role==='sibling'||c.role==='cousin') S.p.family = clamp(S.p.family+3,0,100);
        save('auto'); render();
      });
  },
  cutoff: e=>{
    const c = castOf(e.dataset.c); if(!c) return;
    UI.modal = {type:'confirm', title:'Let it lapse?',
      text:'<b>'+esc(c.name)+'</b> will drift out of your life. Not angrily — just gradually, the way it actually happens. You can still cross paths.',
      okLabel:'Let it lapse', cb:function(){
        relate(c, -30, 'you let the relationship lapse');
        c.relation = Math.min(c.relation, 8);
        log('life','You and '+c.name+' stopped calling each other. Nobody decided it.','neutral');
        save('auto'); UI.modal=null; render();
      }};
    render();
  },
  setambition: e=>{
    S.ambition = {id:e.dataset.m, chosen:true};
    log('life','You decided what this is all for: '+esc(AMBITIONS.find(function(a){return a.id===e.dataset.m;}).name)+'.','neutral');
    toast('Ambition set.'); save('auto'); render();
  },
  makewill: ()=>{
    const cost = Math.round(120000*S.cumInfl);
    if(S.flags.will){ message('Already done','The will exists. Update it if your life changes shape.'); return; }
    if(S.fin.cash < cost){ toast('A will costs about '+fmt(cost)+' here.'); return; }
    S.fin.cash -= cost; S.flags.will = true;
    S.p.stress = clamp(S.p.stress-4,0,100); S.p.family = clamp(S.p.family+3,0,100);
    log('life','You drew up a will. It took an afternoon and it is the most useful document you own.','good');
    toast('Will in place.', 2800); save('auto'); render();
  },
  trust: ()=>{
    const cost = Math.round(2500000*S.cumInfl);
    if(S.flags.trust){ message('Already done','The trust is in place.'); return; }
    if(netWorth() < Math.round(50000000*S.cumInfl)){ message('Too early','A trust costs '+fmt(cost)+' to set up and only makes sense above roughly '+fmt(Math.round(50000000*S.cumInfl))+' of assets. Come back later.'); return; }
    if(S.fin.cash < cost){ toast('Setting it up costs '+fmt(cost)+' in cash.'); return; }
    S.fin.cash -= cost; S.flags.trust = true;
    S.stand.family = clamp(S.stand.family+10,0,100); S.p.rep = clamp(S.p.rep+5,0,100);
    log('life','You put the assets into a family trust. It will outlive an argument.','good');
    toast('Family trust established.', 3200); save('auto'); render();
  },
  spend: e=>{
    const k = e.dataset.k;
    const amounts = {family:150000, health:220000, social:120000};
    const base = amounts[k]||100000;
    const amt = Math.round(base*S.cumInfl);
    if(S.fin.cash < amt){ toast('You do not have '+fmt(amt)+' right now.'); return; }
    S.fin.cash -= amt;
    if(k==='family'){ S.p.family = clamp(S.p.family+8,0,100); S.stand.family = clamp(S.stand.family+6,0,100);
      log('life','You sent money home. '+fmt(amt)+'. It was needed and it was noticed.','good'); }
    if(k==='health'){ S.p.health = clamp(S.p.health+6,0,100); S.p.stress = clamp(S.p.stress-3,0,100);
      log('life','You paid for proper medical attention instead of managing it.','good'); }
    if(k==='social'){ S.p.rep = clamp(S.p.rep+4,0,100); S.p.happy = clamp(S.p.happy+4,0,100); S.stand.community = clamp(S.stand.community+5,0,100);
      log('life','You showed up where you needed to be seen.','good'); }
    save('auto'); render();
  },

  /* Shaking hands on the Deals screen used to call acceptpartner, which is
     the handler for starting a NEW business alongside a partner. It read
     UI.modal.offers and UI.modal.typeId, and the Deals screen sets neither,
     so it threw on T.min every single time it was pressed. It has never
     worked. This is the action the card was always promising. */
  takepartner: e=>{ takePartner(e.dataset.i); },
  declineoffer: e=>{
    const o = offerById(e.dataset.i); if(!o) return;
    offerRemove(o);
    log('biz', 'You let ' + o.name + ' go. Somebody else will take that money.', 'neutral');
    toast('Offer declined');
    render();
  },
  acceptpartner: e=>{
    /* guarded: it used to assume a partner modal was open, and threw when
       it was not */
    const M = UI.modal;
    if(!M || M.type !== 'partner' || !M.offers) return;
    const o = M.offers[parseInt(e.dataset.i,10)];
    const T = BIZ.find(x=>x.id===M.typeId);
    /* Say so. Guarding this turned a visible crash into a button that did
       nothing when pressed, which is the worse of the two failures: a thrown
       error at least gets reported. */
    if(!o || !T){ toast('That offer cannot be taken up from here.'); return; }
    const need = startBizCost(M.typeId);
    const theirs = Math.round(o.capital||0);
    askAmount('Your contribution',
      o.name+' puts in <b>'+fmt(theirs)+'</b> for <b>'+o.equity+'%</b> of it. '+
      'This business wants about '+fmt(need)+' to start; between you that is '+
      fmt(theirs + S.fin.cash)+'. You have <b>'+fmt(S.fin.cash)+'</b> &mdash; how much of it goes in?'+
      '<br><br><span class="muted">Whatever you put in is what you can afford to lose, and the '+
      'company starts with the two contributions together. Put in nothing and it starts on '+
      'their money alone, which is a business you do not really control.</span>',
      Math.min(S.fin.cash, Math.round(need*0.6)), function(v){
        UI.modal=null; startBiz(M.typeId, null, v, o); render();
      });
  },
  /* "Sound people out" is on a screen you only reach with a company already
     running, so its handshake has to be the same act as the Deals one: bring
     them into the business you have. It used to open the modal with
     typeId:null, because that modal was built for starting a company with a
     partner — a different feature wearing the same button label. Every Shake
     hands in it then called acceptpartner, which needs a business type to
     price your contribution, found none, and did nothing at all. */
  seekpartner: ()=>{
    const b = S.biz;
    if(!b){ toast('There is no company to bring anyone into'); return; }
    const offers = [genPartnerOffer(), genPartnerOffer()];
    S.offers = (S.offers||[]).concat(offers);
    UI.modal = {type:'partner', offers:offers, typeId:b.type, mode:'join', inject:true}; render();
  },
  buyout: ()=>{ buyOutPartner(); render(); },
  hire: e=>{
    const c = (S.candidates||[]).find(x=>x.id===e.dataset.i); if(!c) return;
    hire(c); S.candidates = (S.candidates||[]).filter(x=>x.id!==c.id); render();
  },
  fire: e=>{ fire(e.dataset.i); render(); },
  raise: e=>{ giveRaise(e.dataset.i, 0.15); render(); },
  expand: ()=>{ if(expandBiz()) render(); },
  /* Phase 12: the three term commitments, and the way out of any of them. */
  levershift:   ()=>{ leverTake('shifts'); },
  leversupply:  ()=>{ leverTake('supply'); },
  leverchannel: ()=>{ leverTake('channel'); },
  leverdrop: e=>{
    const b = S.biz; if(!b) return;
    const c = (b.commitments||[]).find(function(x){ return x.id===e.dataset.i; });
    if(!c) return;
    const building = c.status === 'building';
    const cost = building ? commitBreak(c) : commitDropCost(c);
    const left = building ? Math.max(0,(c.readyAt||S.turn)-S.turn)
                          : Math.max(0,(c.endsAt||S.turn)-S.turn);
    confirmBox('Get out of '+(c.label||'it'),
      'Walking away now costs <b>'+fmt(cost)+'</b>.'+
      (left ? ' You are giving up '+left+' more quarter'+(left===1?'':'s')+' of it.' : '')+
      '<br><br><span class="muted">What is already spent is gone either way. This is only the part you can still avoid.</span>',
      function(){
        const paid = building ? commitCancel(b, c.id) : commitDrop(b, c.id);
        b.cash -= paid;
        log('biz', (c.label||'The commitment')+' abandoned. '+fmt(paid)+
          ' to make it stop, and nothing to show for the rest.','bad');
        toast((c.label||'Commitment')+' ended');
        render();
      }, 'Pay '+fmt(cost)+' and stop');
  },
  abandon: e=>{
    const b=S.biz; if(!b) return;
    const c=(b.commitments||[]).find(function(x){ return x.id===e.dataset.i; });
    if(!c || c.status!=='building') return;
    const sunk = commitSunk(c), cost = commitCancel(b, e.dataset.i);
    b.cash -= cost;
    log('biz','You abandoned '+c.label+'. '+fmt(cost)+' to walk away, on top of the '+
      fmt(sunk)+' already spent, and nothing to show for either.','bad');
    render();
  },
  formalize: ()=>{ if(formalizeBiz()) render(); },
  inject: ()=>{ askAmount('Inject capital','Move personal cash into the company. It becomes business working capital and increases capacity. You may never see it again.',
      Math.round(Math.max(100000, S.fin.cash*0.25)), function(v){ UI.modal=null; injectBiz(v); render(); }); },
  draw: ()=>{ askAmount('Pay yourself','Take distributable cash out of the business. If you have a partner, they are paid their share at the same time.',
      Math.round(Math.max(0, S.biz.cash*0.5)), function(v){ UI.modal=null; drawFromBiz(v); render(); }); },
  closebiz: ()=>{ confirmBox('Wind up '+S.biz.name+'?','You will salvage what you can and walk away. Your operational skill goes up. Your reputation and stress take a hit.',
      function(){ UI.modal=null; closeBiz('You decided the price was too high.'); render(); }, 'Wind it up'); },
  toggle: e=>{ const k=e.dataset.k; S.flags[k]=!S.flags[k]; toast(S.flags[k]?'You are now working evenings too.':'You stopped the evening shift.'); render(); },

  career: e=>{
    const c = CAREER[parseInt(e.dataset.i,10)]; if(!c) return;
    if(c.cost && S.fin.cash < c.cost){ toast('You need '+fmt(c.cost)+'.'); return; }
    if(c.cost) S.fin.cash -= c.cost;
    const msg = c.run();
    toast(msg, 3000); render();
  },
  findjob: ()=>{
    const p = clamp(0.2 + S.p.skills.ops/380 + S.p.skills.network/300 + S.p.rep/700, 0.1, 0.9);
    if(R.chance(p)){
      const base = Math.round(marketMonthly()*R.range(0.80,1.05));
      S.p.job = {title:R.pick(['Officer','Associate','Executive','Analyst','Coordinator']), monthly:base, industry:'Corporate'};
      S.p.jobPerf = 55; S.p.jobYears = 0; S.p.happy = clamp(S.p.happy+6,0,100);
      log('career','You found work: '+S.p.job.title+' at '+fmt(base)+'/month.','good');
      toast('Hired at '+fmt(base)+'/month');
    } else {
      S.p.stress = clamp(S.p.stress+5,0,100); log('career','Another round of applications, another silence.','bad');
      toast('No offer yet.');
    }
    render();
  },

  opt: e=>{
    const ev = UI.modal.ev; const opt = ev.opts[parseInt(e.dataset.i,10)];
    const th = UI.modal.thread || ev.thread || null;
    const res = resolveOption(ev, opt);
    if(th && (S.threads||[]).indexOf(th)>=0) afterThreadChoice(th, opt);
    UI.modal = {type:'result', ev:ev, opt:opt, res:res};
    render();
    /* in the world you react to how it went; a story that is somebody's
       brings them over to talk it through first */
    worldReact(res, th && th.castId);
    const mb = document.querySelector('.modalbox'); if(mb) mb.scrollTop = 0;
  },
  okamount: ()=>{
    const v = parseAmt(inputValue('amtBox')); const cb = UI.modal.cb; UI.modal=null;
    if(cb) cb(v); else render();
  },
  okconfirm: ()=>{ const cb = UI.modal.cb; UI.modal=null; if(cb) cb(); else render(); },

  save: e=>{ if(save(e.dataset.s)) toast('Saved to slot '+e.dataset.s.replace('s','')); else toast('Save failed.'); },
  load: e=>{ if(load(e.dataset.s)){
      UI.modal=null;
      /* the slot may hold a decision that was on the table when it was written */
      let waiting = false; try{ waiting = askAgain(); }catch(err){ waiting = false; }
      render();
      toast(waiting ? 'Loaded \u2014 and it had a decision waiting.' : 'Loaded.');
    } else toast('No save in that slot.'); },
  copyexp: ()=>{ const el=/** @type {HTMLInputElement} */ (Q('exp')); el.select(); try{ document.execCommand('copy'); toast('Save string copied.'); }catch(err){ toast('Select and copy manually.'); } },
  import: ()=>{ if(importStr(inputValue('exp'))){ UI.modal=null; toast('Imported.'); } },
};

function renderStart(){
  /* The start screen can appear long after boot - from the last screen of a run,
     or from the ledger's own New run - so the offer is refreshed here rather than
     trusted from boot. It is a read of four localStorage entries. */
  try{ noteResume(bestSave()); }catch(e){}
  /* No game yet, so there is nothing for the app's header to say: it lets go of
     the shell containers before they are written over, the same rule the route
     root follows one line below. The claim itself is kept - when a run starts,
     the header is the app's again. */
  releaseShell();
  Q('toprow').innerHTML = '<div class="brand">LEDGER<small>a life in decisions</small></div>';
  Q('tabs').innerHTML = '';
  shellClear(Q('subs'), Q('why'));
  UI.modal = UI.modal || {type:'start'};
  /* Arriving from an invite link: pre-fill the join box and open the setup on
     it, so the only thing left to press is Join.

     Read fresh every time rather than cached. Caching it meant the first
     render - which can happen before there is any address to read - froze the
     answer at "no invite" for the rest of the session, and the link silently
     did nothing. */
  if(!_seaInviteUsed){
    const inv = seasonFromURL();
    if(inv && UI.modal.type === 'start'){
      _sea.joinCode = inv;
      UI.modal = {type:'season'};
    }
  }
  renderModal();
  /* The start screen draws its own markup and calls renderModal() rather than
     render(), so `bindInputs()` never ran here - which is why the name field had
     no listener and `_cfg.name` stayed empty however much you typed. Nothing
     noticed while `startgame` read the field straight out of the DOM; the moment
     a step asked `_cfg` the question instead, it did. */
  bindInputs();
  /* the start screen is no place for a city: the world takes itself off the
     page, whether or not a run still exists behind this screen */
  worldSync(true);
  /* the app may be holding a React root on #main; it lets go before this
     writes over it */
  releaseAppRoute();
  Q('main').innerHTML =
    '<div class="grid g3" style="margin-top:6px">'+
    '<div class="card"><h3>Decisions, not dice</h3><div class="small muted">Every choice is a real trade-off with a real distribution of outcomes. Some decisions pay you in six quarters. Some charge you in six quarters.</div></div>'+
    '<div class="card"><h3>Money decays</h3><div class="small muted">Inflation is modelled honestly. Cash that is not working is losing. The game will keep showing you the arithmetic until you act on it.</div></div>'+
    '<div class="card"><h3>Businesses are machines</h3><div class="small muted">Hire, price, market, expand, formalise, take on partners. Capacity, demand, reputation and working capital all behave the way they do in reality.</div></div>'+
    '</div>' +
    buildStampStart();
}
function bindInputs(){
  document.querySelectorAll('[data-inp]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('input', function(){
      const t = el.dataset.inp, v = parseFloat(el.value);
      const lab = el.parentElement.querySelector('.mono');
      if(t==='budget'){ S.fin.budget[el.dataset.k] = v; if(lab) lab.textContent = fmt(v); }
      else if(t==='phandle'){ ensureProfile().handle = el.value; saveProfile(); }
      else if(t==='bizprice'){ S.biz.priceIdx = v/100; if(lab) lab.textContent = v.toFixed(0)+'%'; }
      else if(t==='bizmark'){ S.biz.marketing = v; if(lab) lab.textContent = fmt(v); }
      else if(t==='bizqual'){ S.biz.qualitySpendMonthly = v; if(lab) lab.textContent = fmt(v)+'/mo'; }
      else if(t==='bizcred'){ S.biz.creditTerms = v/100; if(lab) lab.textContent = Math.round(v*0.9)+' days'; }
      else if(t==='bizstock'){ S.biz.stockPolicy = v/100; if(lab) lab.textContent = (v<25?'Lean':v<50?'Balanced':v<75?'Deep':'Very deep'); }
      else if(t==='bizdraw'){ S.biz.draw = v; if(lab) lab.textContent = fmt(v); }
      else if(t==='bizauto'){ /* display only; investment is via the Invest button */ if(lab) lab.textContent = v+'%'; }
      else if(t==='planrev'){ if(UI.modal&&UI.modal.plan){ UI.modal.plan.revenue = v; if(lab) lab.textContent = fmt(v); } }
      else if(t==='plangm'){ if(UI.modal&&UI.modal.plan){ UI.modal.plan.gm = v; if(lab) lab.textContent = v+'%'; } }
      else if(t==='planopex'){ if(UI.modal&&UI.modal.plan){ UI.modal.plan.opex = v; if(lab) lab.textContent = fmt(v); } }
      else if(t==='plancapex'){ if(UI.modal&&UI.modal.plan){ UI.modal.plan.capex = v; if(lab) lab.textContent = fmt(v); } }
      else if(t==='planhead'){ if(UI.modal&&UI.modal.plan){ UI.modal.plan.headcount = v; if(lab) lab.textContent = v+''; } }
    });
    el.addEventListener('change', function(){
      if(el.type==='range'){
        if(UI._sliderT) clearTimeout(UI._sliderT);
        UI._sliderT = setTimeout(function(){ UI._sliderT=null; render(); }, 160);
      } else render();
    });
  });
  document.querySelectorAll('[data-role]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return; el.dataset.bound='1';
    el.addEventListener('change', function(){
      const b = S.biz; if(!b) return;
      const st = (b.staff||[]).find(function(x){ return x.id===el.dataset.role; }); if(!st) return;
      if(el.value==='gm' && st.role!=='gm'){ if(!promoteGM(b, st.id)){ render(); return; } }
      else { st.role = el.value; if(el.value==='sales') st.morale = clamp(st.morale+3,3,100); }
      save('auto'); render();
    });
  });
  document.querySelectorAll('[data-outlet]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return; el.dataset.bound='1';
    el.addEventListener('change', function(){
      const b = S.biz; if(!b) return;
      const st = (b.staff||[]).find(function(x){ return x.id===el.dataset.outlet; }); if(!st) return;
      st.outlet = el.value || null;
      save('auto'); render();
    });
  });
  document.querySelectorAll('[data-hrole]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return; el.dataset.bound='1';
    el.addEventListener('change', function(){ houseReassign(el.dataset.hrole, el.value); save('auto'); render(); });
  });
  document.querySelectorAll('[data-hpayer]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return; el.dataset.bound='1';
    el.addEventListener('change', function(){ houseSetPayer(el.dataset.hpayer, el.value); save('auto'); render(); });
  });
  document.querySelectorAll('[data-hpayerc]').forEach(function(node){
    const el = /** @type {HTMLInputElement} */ (node);
    if(el.dataset.bound) return; el.dataset.bound='1';
    el.addEventListener('change', function(){
      const c = (S.houseCands||[]).find(function(x){ return x.id===el.dataset.hpayerc; });
      if(c) c.payer = el.value || 'you';
      render();
    });
  });
  const name = /** @type {HTMLInputElement} */ (Q('inName'));
  if(name && !name.dataset.bound){ name.dataset.bound='1'; name.addEventListener('input', function(){ _cfg.name = name.value; }); }
  document.querySelectorAll('input[name=prof]').forEach(function(node){
    const r = /** @type {HTMLInputElement} */ (node);
    if(r.dataset.bound) return; r.dataset.bound='1';
    r.addEventListener('change', function(){ _cfg.profile = r.value; render(); });
  });
}
document.addEventListener('click', function(e){
  /* the delegated target: `e.target` is an EventTarget, and the lines below are
     asking it for the control it is inside, which is what has always happened -
     the cast says which of the two it is */
  const tgt = /** @type {HTMLElement} */ (e.target);
  const dh = tgt.closest('[data-disc]');
  if(dh){ e.preventDefault(); toggleDisclosure(dh); return; }
  const el = /** @type {HTMLElement} */ (tgt.closest('[data-a]'));
  if(!el) return;
  const a = el.dataset.a;
  if(!ACT[a]) return;
  /* every move is measured at the one funnel every move goes through: what it
     did to the numbers a player feels is said where they pressed it. A choice
     on an event says it on its result card instead, and a move that opens a
     modal, starts a run or closes a quarter is not a move with an effect yet */
  const run0 = S, before = (S && !UI.modal) ? vitals() : null;
  e.preventDefault(); ACT[a](el); autosaveSoon();
  /* the quarter closes: in the world, everyone goes home */
  if(a === 'advance' && S === run0) worldAdvance();
  if(before && S === run0 && !UI.modal && a !== 'advance'){
    const fx = deltaOf(before, vitals());
    if(fx.length){
      fxToast('<div class="row wrap" style="gap:4px;justify-content:center">'+fxChipsHTML(fx)+'</div>');
      /* and you act it out in the world, at the building of the screen the
         move was made on - working, resting, paying, shaking hands - with the
         money moving between your hand and the building */
      worldMove(a, fx);
    }
  }
});
document.addEventListener('keydown', function(e){
  if(e.key==='Escape' && UI.modal){
    if(UI.modal.type==='advance'){ if(UI._anim && UI._anim.finish) UI._anim.finish(); else { UI.modal=null; render(); } return; }
    if(UI.modal.type!=='start' && UI.modal.type!=='nego'){ UI.modal=null; render(); }
  }
  if(e.key==='Enter' && UI.modal && UI.modal.type==='amount'){ ACT.okamount(); }
})
function renderThreadStage(t){
  const A = ARCS[t.arc]; if(!A) return null;
  const fn = A.stages[t.stage]; if(!fn) return null;
  const ev = fn(t);
  ev.thread = t;
  ev.cat = ev.cat || 'life';
  return ev;
}
let _installEvt = null;
/* Whether the browser has offered an install prompt that has not been used yet.

   This is state, so it is read in one place: the Settings screen renders the
   Install button from it, and an app that renders its own Settings asks through
   this rather than keeping a second copy of the answer. Checked because the
   alternative already existed and was wrong - see the note on the listeners
   below. */
function installAvailable(){ return !!_installEvt; }
function doInstall(){
  if(_installEvt){ _installEvt.prompt(); _installEvt.userChoice.then(function(){ _installEvt=null; render(); }); }
}
/* The Install button was unreachable, in the original file and in this one.

   viewLedgerSettings() renders it with style="display:none" while _installEvt
   is null, and these listeners were supposed to reveal it by looking up
   getElementById('installBtn') - an id no element in the game has ever had, so
   both "reveals" silently did nothing (each was guarded by if(b)). Worse, the
   button says nothing about being hidden: on a browser that can install the
   game, Settings showed an Install section with a note and no button, which is
   indistinguishable from a feature that was never built.

   The fix is not to add the missing id - that would leave the DOM and the state
   able to disagree, and a React screen has no DOM node to poke. It is to
   re-render, because the screen already renders correctly from _installEvt:
   once this is true, the button is simply there. */
window.addEventListener('beforeinstallprompt', function(ev){
  ev.preventDefault(); _installEvt = ev;
  render();
});
window.addEventListener('appinstalled', function(){ _installEvt = null; render(); });
// A service worker only exists when the folder is served over http(s). From file://
// this silently does nothing, and the game is already fully offline either way.
//
// `location` means two different things in the two builds. In the single file it
// is the browser's object and `.protocol` is the page's. In the module build the
// name is imported from core - the host shim, where `location()` asks the host
// for its url - so `.protocol` read off a function is undefined and this
// condition was FALSE in the app: the registration never even ran, and the
// offline half of the game was quietly switched off by a name collision.
function pageProtocol(){
  try{
    /* An app may answer this itself - a webview knows the url it is showing.
       But a host that has nothing to say (the default slot returns '') must not
       be able to switch a feature off by staying silent, which is exactly what
       happened to the service worker: the app registered no worker for a whole
       release because the protocol came back empty. So: the host's answer wins
       when it has one, and otherwise the page's own location is the truth. */
    if(typeof location === 'function'){
      const m = /^([a-z][a-z0-9+.-]*):/i.exec(location() || '');
      if(m) return m[1].toLowerCase();
    }
  }catch(e){}
  /* `window.location` and not the bare name, because in the module build the
     bare name is the host shim above: one name, two things, and only one of
     them has a `.protocol`. */
  try{ return window.location.protocol || ''; }catch(e){ return ''; }
}
if('serviceWorker' in navigator && (pageProtocol() === 'http:' || pageProtocol() === 'https:')){
  /* Waiting for `load` is right in the single file, where this runs while the
     page is still arriving — and wrong in the app, where the game is imported
     after `load` has already fired, so the listener was added to an event that
     would never come again. The worker then never registered on any deploy of
     the app, and nothing said a word. So: if the page is already done, register
     now; otherwise wait, as before. */
  function registerWorker(){ try{ navigator.serviceWorker.register('sw.js').catch(function(){}); }catch(e){} }
  if(document.readyState === 'complete') registerWorker();
  else window.addEventListener('load', registerWorker);
}
/* ── progress, kept ────────────────────────────────────────────────────────
   Every move is saved, but not on the click that made it: the write is deferred
   by a moment so a burst of moves is one save, and flushed at once when the page
   is going away. `visibilitychange` is the event that matters on a phone — a tab
   that is backgrounded may never fire `beforeunload` — and `pagehide` covers the
   same ground on the way out. Three lines of insurance around a debounce.

   Hardcore runs are not auto-saved, and that is the one rule here: a run that
   rewinds is not a hardcore run. The chip in the header says so, and the slot
   buttons still work, because choosing to save is the player's business. */
let _autoT = null;
function autosaveSoon(){
  if(!S || !S.p) return false;
  if(S.difficulty === 'hardcore') return false;
  if(_autoT) clearTimeout(_autoT);
  _autoT = setTimeout(function(){ _autoT = null; if(save('auto')) renderTopIfCheap(); }, 500);
  return true;
}
function autosaveFlush(){
  if(!_autoT) return false;
  clearTimeout(_autoT); _autoT = null;
  return save('auto');
}
/* The chip says the same thing before and after a save — "Saved" — so a save does
   not need a redraw to be honest. This repaints the header only when the shell is
   not the app's, where a repaint is a string write and nothing else. */
function renderTopIfCheap(){ try{ renderTop(); }catch(e){} }
window.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') autosaveFlush(); });
window.addEventListener('pagehide', function(){ autosaveFlush(); });
function boot(){
  /* what a stored save says about itself, before anything is loaded from it: the
     chip and the resume line are about the *file*, not about the game in memory.
     `best` is any slot, `stored` is the auto save - the one this start resumes by
     itself, because a player who closed the tab mid-run should not have to find a
     button to get it back. */
  const stored = saveInfo('auto');
  const best = bestSave();
  noteResume(best);
  if(stored) noteSaved(stored.at, stored.head);
  if(hasSave('auto')){ try{ load('auto'); }catch(err){ setS(null); } }
  /* A save can be written while a decision is on the table (the autosave is not
     fussy about that, and it should not be: the player asked for progress to be
     kept). The decision lives in the save by name, so it goes back on the table
     here - the same letter, the same offer - instead of vanishing into a quarter
     with nothing in it. */
  let asked = false;
  try{ asked = askAgain(); }catch(e){ asked = false; }
  if(!S){ renderStart(); }
  else { render(); }
  /* Say what was resumed. One short line and it is gone: the chip keeps saying
     "Saved" for the rest of the run, so this is a greeting and not a status. */
  if(S && S.p && best){ const line = resumeLine(); if(line) toast(line + (asked ? ' \u00b7 a decision was waiting' : ''), 4200); }
  /* Restore the session and reconcile in the background. Never awaited - the
     game is already playable and stays that way whatever the network does. */
  try{ cloudSyncBackground(); }catch(e){}
  /* nothing to reveal here: if a prompt arrived before this ran, the render
     above already drew the button, and if one arrives later the listener
     re-renders. */
}
/* The single file boots itself, because in that build there is nobody else to
   call boot(). An app sets __LEDGER_IS_APP__ before it imports this package -
   in its own first import, since ESM evaluates imports in order - and then
   calls install() and boot() itself, after the DOM is ready and with a host
   that can actually draw. */
if(!globalThis.__LEDGER_IS_APP__) boot();

