

/* =========================================================================
   Section 11: Resolving decisions
   ========================================================================= */
/*@table:PRINCIPLES@*/

function effOf(o, key){
  const fn = o[key+'EffFn']; if(fn) return fn()||{};
  return Object.assign({}, o[key+'Eff']||{});
}
function optLabel(o){ return typeof o.label==='function' ? o.label() : o.label; }
function optHint(o){ return typeof o.hint==='function' ? o.hint() : o.hint; }
function evText(ev){ return typeof ev.title==='function' ? ev.title() : ev.title; }
function evBody(ev){ return typeof ev.text==='function' ? ev.text() : ev.text; }
/* ── Repercussions you can see ────────────────────────────────────────────
   A choice in this game moves numbers now and schedules more for later, and
   neither was visible: the result card said a sentence, and 91 delayed
   consequences in the decks arrived quarters later with nothing to say where
   they came from. vitals() is the handful of numbers a player feels, deltaOf()
   is what one move did to them, and comingBack() is everything already set in
   motion, with the choice that set it. All three read state and draw nothing
   from the seeded stream. */
function vitals(){
  return { cash:S.fin.cash, usd:S.fin.usdCash, debt:debtTotal(), biz:S.biz ? S.biz.cash : 0,
           health:S.p.health, stress:S.p.stress, happy:S.p.happy, family:S.p.family, rep:S.p.rep,
           credit:S.fin.credit, hours:hoursLeft(), perf:S.p.job ? S.p.jobPerf : 0 };
}
/* label, whether the number is money, and which way is good (0: neither) */
/** @type {Array<[string, string, number, number]>} */
const VITAL_KEYS = [
  ['cash','cash',1,1], ['usd','USD',2,1], ['debt','debt',1,-1], ['biz','company cash',1,1],
  ['hours','hours',0,0], ['health','health',0,1], ['stress','stress',0,-1], ['happy','happiness',0,1],
  ['family','family',0,1], ['rep','reputation',0,1], ['credit','credit',0,1], ['perf','performance',0,1],
];
function deltaOf(a, b){
  const out = [];
  VITAL_KEYS.forEach(function(k){
    const d = (b[k[0]]||0) - (a[k[0]]||0);
    if(Math.abs(d) < 1 || (k[2] === 0 && Math.round(Math.abs(d)) < 1)) return;
    out.push({k:k[0], label:k[1], d:d, money:k[2], tone:k[3] === 0 ? 0 : (d*k[3] > 0 ? 1 : -1)});
  });
  return out;
}
function fxChipsHTML(list){
  return list.map(function(x){
    const sign = x.d > 0 ? '+' : '−', n = Math.abs(x.d);
    const v = x.money === 1 ? fmt(Math.round(n)) : x.money === 2 ? '$'+Math.round(n).toLocaleString() : String(Math.round(n));
    return '<span class="chip '+(x.tone > 0 ? 'g' : x.tone < 0 ? 'r' : '')+'">'+esc(x.label)+' '+sign+v+'</span>';
  }).join('');
}
/* what a decision did, and what it set in motion: drawn under the result in
   both renderers, so the two cannot disagree about it */
function resultFxHTML(r){
  const fx = (r && r.fx) || [], echo = (r && r.echo) || [];
  if(!fx.length && !echo.length) return '';
  return '<div class="tiny muted" style="margin-top:12px">What that did</div>'+
    (fx.length ? '<div class="row wrap" style="gap:4px;margin-top:5px">'+fxChipsHTML(fx)+'</div>' : '')+
    echo.map(function(e){
      return '<div class="logline" style="margin-top:8px;border-left-color:'+
        (e.kind === 'good' ? 'var(--good)' : e.kind === 'bad' ? 'var(--bad)' : 'var(--acc)')+'">'+
        '<div class="t">Comes back '+dateLabel(e.turn)+'</div>'+esc(e.title)+'</div>';
    }).join('');
}
/* everything already set in motion: delayed consequences and committed deals,
   soonest first */
function comingBack(){
  const out = [];
  (S.pending||[]).forEach(function(p){
    if(p.turn >= S.turn) out.push({turn:p.turn, title:p.title, kind:p.kind||'neutral', from:p.from||''});
  });
  (S.active||[]).forEach(function(a){
    out.push({turn:a.due, title:a.name+' resolves', kind:'neutral', from:fmt(a.capital)+' committed'});
  });
  return out.sort(function(x, y){ return x.turn - y.turn; });
}
function comingBackHTML(){
  const items = comingBack();
  if(!items.length) return '';
  /* the road ahead as a picture first, outside the card so it is never folded
     away: late consequences are the game, and they should always be in sight */
  return '<div class="roadwrap">'+roadAheadSVG(items)+'</div>'+
    '<div class="card" style="margin-bottom:12px"><h3>Coming back to you</h3>'+
    items.slice(0, 6).map(function(i){
      const q = i.turn - S.turn;
      return '<div class="logline" style="border-left-color:'+
        (i.kind === 'good' ? 'var(--good)' : i.kind === 'bad' ? 'var(--bad)' : 'var(--acc)')+'">'+
        '<div class="t">'+dateLabel(i.turn)+' · '+(q <= 0 ? 'this quarter' : 'in '+q+' quarter'+(q === 1 ? '' : 's'))+'</div>'+
        esc(i.title)+(i.from ? '<div class="tiny muted">from: '+esc(i.from)+'</div>' : '')+'</div>';
    }).join('')+
    (items.length > 6 ? '<div class="tiny muted" style="margin-top:6px">and '+(items.length - 6)+' more after that</div>' : '')+
    '</div>';
}
function resolveOption(ev, opt){
  /** @type {any} */
  let res = {text:'', kind:'neutral'};
  /* what the choice moves now, and what it schedules for later - measured, so
     the result card can say it rather than leave it to be discovered */
  const before = vitals(), pendAt = (S.pending||[]).length;
  const odds = (typeof opt.odds==='function') ? clamp(opt.odds(S),0,1) : opt.odds;
  if(odds!==undefined && odds!==null){
    const ok = R.chance(odds);
    const e = effOf(opt, ok?'ok':'fail');
    applyEff(e);
    res.ok = ok;
    res.text = ok ? (opt.okText || e.okText || 'It worked.') : (opt.failText || e.failText || 'It did not work out.');
    res.kind = ok?'good':'bad';
    const lg = ok?opt.okLog:opt.failLog; if(lg) log(lg[0],lg[1],lg[2]);
  } else {
    let e = opt.effFn ? (opt.effFn()||{}) : Object.assign({}, opt.eff||{});
    if(opt.delayFn) e = Object.assign({}, e, {delay: opt.delayFn()});
    applyEff(e);
    res.text = opt.text || e.text || 'Decision made.';
    res.kind = 'neutral';
  }
  const made = (S.pending||[]).slice(pendAt);
  made.forEach(function(p){ p.from = evText(ev)+' \u2014 '+optLabel(opt); });
  res.fx = deltaOf(before, vitals());
  res.echo = made.map(function(p){ return {turn:p.turn, title:p.title, kind:p.kind}; });
  if(!S.decisions) S.decisions = [];
  S.decisions.push({turn:S.turn, date:dateLabel(S.turn), title:evText(ev), choice:optLabel(opt), outcome:res.text, kind:res.kind, cat:ev.cat});
  log(ev.cat==='biz'?'biz':'life', evText(ev)+' — '+optLabel(opt)+'. '+res.text, res.kind);
  res.principle = (D().coaching) ? (ev.principle || PRINCIPLES[ev.id] || null) : null;
  /* answered: nothing is waiting on the table any more. A thread stage that
     opens next records itself in afterThreadChoice(). */
  askNow(null);
  return res;
}
function pickEvent(){
  const pool = ALL_EVENTS.filter(e=>{
    if(e.once && S.flags['ev_'+e.id]) return false;
    const last = S.cd[e.id];
    if(last!==undefined && (S.turn - last) < (e.cd||6)) return false;
    if(e.cond && !e.cond(S)) return false;
    return true;
  });
  if(!pool.length) return null;
  return R.weighted(pool, e=>e.w) || null;
}
/* ── the decision on the table, written down ────────────────────────────────
   A modal is UI: it is not in the save, and it never was. So a save written
   while a decision was open resumed into a quarter with no decision in it at
   all - the bank's letter, the offer, the choice, silently gone. `S.asking` is
   the fix: the state names the decision that is waiting, so a resume can put it
   back on the table.

   It is an id and a kind, not the event itself: events hold functions (their
   odds, their effects) and cannot be serialised. An event is looked up in the
   decks by id; a thread stage is *derived* from the thread record by
   renderThreadStage(), which is why a thread resumes at the stage it was on.

   It is cleared where a decision is answered - in resolveOption, and by the
   thread choice - so what survives is only ever an unanswered decision. */
function askNow(ask){ if(S) S.asking = ask || null; }
function askAgain(){
  if(!S || !S.asking || S.gameOver) return false;
  const a = S.asking;
  try{
    if(a.kind === 'thread'){
      const th = (S.threads||[]).filter(function(x){ return x.id === a.id; })[0];
      if(!th) { S.asking = null; return false; }
      const st = renderThreadStage(th);
      if(!st) { S.asking = null; return false; }
      UI.modal = {type:'event', ev:st, thread:th};
      return true;
    }
    const ev = ALL_EVENTS.filter(function(e){ return e.id === a.id; })[0];
    if(!ev) { S.asking = null; return false; }
    UI.modal = {type:'event', ev:ev, result:null};
    return true;
  }catch(err){
    /* a decision that cannot be rebuilt must not lock the game: forget it and
       let the quarter carry on, which is what every save did before this */
    S.asking = null;
    return false;
  }
}
function fireEvent(ev){
  S.cd[ev.id] = S.turn;
  if(ev.once) S.flags['ev_'+ev.id] = true;
  askNow({kind:'event', id:ev.id});
  UI.modal = {type:'event', ev:ev, result:null};
  render();
}

/* =========================================================================
   Section 12: Time, endings, scoring
   ========================================================================= */
function snapshot(){
  recompute();
  S.hist.push({t:S.turn, nw:S.der.nw, cash:Math.round(S.fin.cash), age:S.p.age});
  if(S.hist.length>200) S.hist.shift();
}
function advanceQuarter(){
  if(S.gameOver) return;
  TX = [];
  const prevNW = netWorth();
  S.turn += 1;
  S.digest = (S.digest||[]).filter(function(d){ return S.turn - d.turn < 12; });

  const due = flushPending();

  /* the quarter's hours start again; debt carries and is collected */
  S.p.spent = 0;
  S.p.acts  = {};

  stepEra();
  stepMarket();
  maybeSwan();

  const invest = stepAssets();
  if(invest>0){ S.fin.cash += invest; tx('Investment income +'+fmt(invest)); }
  const bp = simBusiness();
  if(S.biz){ tx('Business P&L '+(bp>=0?'+':'\u2212')+fmt(Math.abs(bp))); }
  stepGovernance();
  stepGroup();
  stepHouse();
  stepPersonal();

  if(!S._startAge) S._startAge = S.p.age;
  S.p.age = S._startAge + Math.floor(S.turn/4);
  if(S.informalIncome>0 && S.turn%4===0) S.informalIncome = Math.round(S.informalIncome*(1 + S.mkt.infl*0.70));

  S.vignette = makeVignette();
  S.candidates = [genCandidate(0), genCandidate(0), genCandidate(1)];

  // the people in your life
  const castNews = stepCast();
  /* who it is about travels with it, so the quarter's pictures can show their face */
  castNews.forEach(function(n){ S.digest.push({turn:S.turn, kind:'cast', text:n.text, tone:n.kind==='death'?'bad':'neutral', castId:n.c ? n.c.id : null}); });

  // the market you compete in
  const rivalNews = stepRival();
  if(rivalNews) S.digest.push({turn:S.turn, kind:'rival', text:rivalNews.text, tone:'bad'});

  // capital opportunities + the tender board
  refreshDeals();
  refreshContractOffers();
  const dealNews = resolveDeals();
  dealNews.forEach(function(d){ S.digest.push({turn:S.turn, kind:'deal', text:d.name+': '+d.text+' ('+fmt(d.pl)+')', tone:d.win?'good':'bad'}); });

  if(S.offers && S.offers.length && S.turn - (S.offersAt||0) > 3) S.offers = [];
  maybeOfferPartner();

  snapshot();
  save('auto');
  checkEnd();

  const nwNow = netWorth();
  if(Math.abs(nwNow - prevNW) > Math.max(2000000, Math.abs(prevNW)*0.22)){
    S.digest.push({turn:S.turn, kind:'nw', text:'Net worth moved '+fmt(nwNow-prevNW)+' in one quarter.', tone:(nwNow>prevNW?'good':'bad')});
  }

  // ---- what the player actually has to respond to this quarter
  const th = dueThread();
  if(!S.gameOver && th){
    let stage = null;
    try{ stage = renderThreadStage(th); }
    catch(err){ S.threads = (S.threads||[]).filter(function(x){ return x.id!==th.id; }); stage = null; }
    if(stage){ askNow({kind:'thread', id:th.id}); UI.modal = {type:'event', ev:stage, thread:th}; }
  }
  if(!UI.modal && !S.gameOver && !th && R.chance(0.62)){
    const ev = pickEvent();
    if(ev) fireEvent(ev);
  }
  if(!UI.modal && due.length){ UI.modal = {type:'pending', items:due}; }
  if(!UI.modal && !S.gameOver && maybeStartArc()){
    const t = dueThread();
    if(t && t.next<=S.turn){ const st = renderThreadStage(t); if(st){ askNow({kind:'thread', id:t.id}); UI.modal = {type:'event', ev:st, thread:t}; } }
  }

  // ---- annual review: the rhythm that stops the game being a treadmill
  if(!UI.modal && !S.gameOver && S.turn % 4 === 0){
    UI.modal = {type:'year'};
  }

  render();
  if(!UI.modal && S.biz && S.biz.staff.length===0 && S.biz.locations>=1 && R.chance(0.5)){
    log('biz','You are doing everything yourself. That does not scale past a point you are approaching.','warn');
  }
}
function maybeOfferPartner(){
  if(S.biz && !S.biz.partner && S.biz.revenue>3000000 && R.chance(0.16)){
    S.offers = [genPartnerOffer(), genPartnerOffer()]; S.offersAt = S.turn;
    log('biz','Two people have approached you about taking a stake in the business.','neutral');
  }
}
/* ===========================================================================
   Seasons — a finish line fixed in advance, and a score you can compare

   A run used to end whenever it ended: retirement at 65, the hard cap at turn
   168, or a collapse. Fine alone, useless side by side, because two runs that
   stop in different places cannot be compared — the one that ran longer had
   more time, and no score can correct for that afterwards.

   A season fixes the finish line first: an explicit year and quarter, the
   same for everybody, and the run stops there. Then every run is scored on
   the same axes, so the comparison means something.

   The scoring is deliberately not just net worth. This game has spent its
   whole argument saying that a life is not a balance sheet — that you can be
   rich and exposed, profitable and hollow. A leaderboard ranked on net worth
   alone would spend every round teaching the opposite. So the score is
   composite, and every axis is shown, because two identical totals with
   different shapes are different runs and should read differently.
   =========================================================================== */
/*@table:SEASON_AXES@*/
/* turn <-> calendar. turn 0 is Q1 2026, so a season ending in Q3 2041 wants
   ((2041-2026)*4)+(3-1). Kept in one place because two copies of this
   arithmetic is exactly how a finish line ends up a quarter out. */
function seasonTurnFor(year, q){ return ((year - START_YEAR) * 4) + ((q || 1) - 1); }
function seasonDateOf(turn){
  return { year: START_YEAR + Math.floor(turn / 4), q: (turn % 4) + 1 };
}
function seasonsLeft(){
  const s = S.season; if (!s) return null;
  return Math.max(0, (s.endTurn || 0) - S.turn);
}
/* An honest progress read, because a finish line you cannot see coming is
   just a surprise. */
/**
 * @returns {{left:number, total:number, done:number, end:{q:number, year:number}, hardStop:boolean} | null}
 */
function seasonStatus(){
  const s = S.season; if (!s) return null;
  const left = seasonsLeft();
  const total = Math.max(1, (s.endTurn || 0) - (s.startTurn || 0));
  return { left: left, total: total, done: Math.round(100 * (1 - left / total)),
           end: seasonDateOf(s.endTurn || 0), hardStop: s.hardStop !== false };
}
function scoreAxes(){
  const bizs  = (S.bizs || []).filter(b => b);
  const infl  = Math.max(0.01, S.cumInfl || 1);
  const real  = netWorth() / infl;

  /* Wealth: log scale. Straight-linear scoring here would make the top of the
     board a pure lottery; three decades from ₦2m to ₦2bn keeps a good run and
     a great run distinguishable without making one of them meaningless. */
  const wealth = clamp(100 * Math.log10(Math.max(1, real) / 2e6) / 3, 0, 100);

  const val     = bizs.reduce((a, b) => a + (bizValue(b) || 0), 0) / infl;
  const staff   = bizs.reduce((a, b) => a + ((b.staff || []).length), 0);
  const outlets = bizs.reduce((a, b) => a + ((b.outlets || []).length), 0);
  const trading = bizs.some(b => (b.revenue || 0) > 0);
  const valScore = clamp(100 * Math.log10(Math.max(1, val) / 1e6) / 3, 0, 100);
  const reach    = clamp(outlets * 12 + staff * 2, 0, 100);
  const enterprise = clamp(valScore * 0.60 + reach * 0.25 + (trading ? 15 : 0), 0, 100);

  const bizRep = bizs.length
    ? bizs.reduce((a, b) => a + (b.rep === undefined ? 45 : b.rep), 0) / bizs.length : 40;
  const reputation = clamp((S.p.rep || 40) * 0.60 + bizRep * 0.40, 0, 100);

  /* Family is counted in people, not in money spent on them. */
  const family = clamp((S.p.married ? 30 : 0)
    + Math.min(25, (S.p.kids || 0) * 8)
    + Math.min(15, (S.p.parents || 0) * 7)
    + (S.p.happy || 50) * 0.20
    + (S.p.family || 50) * 0.10, 0, 100);

  const health = clamp((S.p.health || 60) * 0.70 + (100 - (S.p.stress || 30)) * 0.30, 0, 100);

  const comp = bizs.length
    ? bizs.reduce((a, b) => a + (b.compliance === undefined ? 40 : b.compliance), 0) / bizs.length : 60;
  const risk = bizs.length
    ? bizs.reduce((a, b) => a + (b.taxRisk || 0), 0) / bizs.length : 0;
  const decs  = S.decisions || [];
  const good  = decs.filter(x => x.kind === 'good').length;
  const bad   = decs.filter(x => x.kind === 'bad').length;
  const ratio = decs.length ? good / decs.length : 0.5;
  const integrity = clamp(comp * 0.45 + (100 - risk) * 0.25 + ratio * 100 * 0.30, 0, 100);

  return { wealth:wealth, enterprise:enterprise, reputation:reputation,
           family:family, health:health, integrity:integrity,
           _counts:{ good:good, bad:bad, decisions:decs.length,
                     businesses:bizs.length, staff:staff, outlets:outlets } };
}
/* One comparable number, out of 1000, plus the shape that produced it. */
function scoreRun(){
  const a = scoreAxes();
  let sum = 0, wsum = 0;
  SEASON_AXES.forEach(ax => { sum += (a[ax.id] || 0) * ax.weight; wsum += ax.weight; });
  const pct = wsum ? sum / wsum : 0;
  const r = rank(netWorth(), freedomIndex());
  /* counts are carried beside the axes, never inside them: anything that
     iterates the axes (the report, the board, the cloud payload) must get
     six numbers and nothing else */
  const counts = a._counts || {};
  delete a._counts;
  return { total: Math.round(pct * 10), pct: pct, axes: a,
           rank: r[0], rankNote: r[1], counts: counts };
}
function checkEnd(){
  const d = recompute();
  // insolvency
  if(S.fin.cash < -Math.max(500000, budgetMonthly()*4) && debtTotal() > Math.max(1000000, d.nw===0?1:0) && S.fin.credit < 22){
    if(S.difficulty==='hardcore'){ endGame('bankrupt'); return; }
    else {
      // seize what can be seized, reset
      const seized = Math.min((S.assets||[]).reduce((s,a)=>s+a.value,0), debtTotal());
      let rem = seized;
      (S.assets||[]).forEach(a=>{ const take = Math.min(a.value, rem); a.value -= take; rem -= take; });
      S.assets = (S.assets||[]).filter(a=>a.value>1000);
      S.fin.debt.forEach(dbt=>{ dbt.bal = Math.max(0, dbt.bal - Math.round(seized*0.8)); });
      S.fin.debt = S.fin.debt.filter(x=>x.bal>100);
      S.fin.cash = Math.max(0, Math.round(S.fin.cash + seized*0.15));
      S.fin.credit = 14; S.p.stress = clamp(S.p.stress+18,0,100); S.p.happy = clamp(S.p.happy-14,0,100);
      S.p.rep = clamp(S.p.rep-10,0,100);
      log('money','INSOLVENCY. Assets worth '+fmt(seized)+' were liquidated against your debts. Your name is now worth considerably less.','bad');
      toast('Insolvency — assets seized', 4200);
    }
  }
  /* A season's finish line takes precedence over the ordinary endings. That is
     the entire point of it: everyone stops in the same place, whatever else is
     true of their run. Retirement at 65 is a different finish line and would
     quietly give the older starter less time. */
  if(S.season && S.turn >= (S.season.endTurn || 0)){ endGame('season'); return; }
  if(S.p.health <= 0){ endGame('health'); return; }
  if(S.p.age >= 65){ endGame('retire'); return; }
  if(S.turn >= 168){ endGame('retire'); return; }
}
function endGame(reason){
  S.gameOver = {reason:reason, at:S.turn, age:S.p.age, nw:netWorth(), freedom:freedomIndex()};
  log('end', reason==='retire' ? 'You have reached the end of the run.' : 'The run ended early.', 'warn');
  /* Write the run into the profile once. "Keep playing" can end the run again
     later, and a second entry for the same run would corrupt the record. */
  /* The season score goes in the moment the run ends, once, and
     fire-and-forget: a dead network must never delay, alter or break the end
     of somebody's run. */
  if(S.season && S._submitted !== S.season.code){ seasonSubmit(); }
  if(!S._runLogged){
    S._runLogged = true;
    try{
      S._lastRun = appendRun(captureRun(reason));
      /* The record has just changed, so send it. Fire-and-forget: a dead
         network must never delay or break the end of a run. */
      cloudSyncBackground();
    }catch(e){ console.warn('run capture failed', e); }
  }
  save('auto');
  UI.modal = {type:'end'};
  render();
}
function rank(nw, freedom){
  const real = nw / S.cumInfl;
  if(real >= 1.5e9) return ['Generational','You did not just build wealth. You built something that outlives the decisions that made it.'];
  if(real >= 4.5e8) return ['Independently Wealthy','Work became optional somewhere along the way, and you noticed.'];
  if(real >= 1.1e8) return ['Comfortable','Bills stopped being frightening. That is a significant and underrated achievement.'];
  if(real >= 2.5e7) return ['Stable','You are ahead of most people who started where you started.'];
  if(real >= 3e6)   return ['Getting There','The direction is right. The distance is still there.'];
  return ['Exposed','One bad quarter from serious trouble. Cash buffer first, ambitions second.'];
}
function finalReport(){
  const d = recompute();
  const r = rank(d.nw, freedomIndex());
  const decs = S.decisions||[];
  const good = decs.filter(x=>x.kind==='good').length;
  const bad  = decs.filter(x=>x.kind==='bad').length;
  const neutral = decs.length-good-bad;
  const best = decs.filter(x=>x.kind==='good').slice(-3).reverse();
  const worst = decs.filter(x=>x.kind==='bad').slice(-3).reverse();
  return {d:d, rank:r[0], epitaph:r[1], good:good, bad:bad, neutral:neutral, best:best, worst:worst, freedom:freedomIndex()};
}

/* =========================================================================
   Section 13: Persistence
   ========================================================================= */
const SKEY = 'ledger_v1_';

/* =========================================================================
   Section 13b: The player profile
   -------------------------------------------------------------------------
   One record that outlives every run. It lives in its own storage key, so
   wiping your save slots does not erase who you are, and starting a new run
   does not either. Every finished run is written into it. From that history
   we derive an experience rating, and from that rating the game leans on the
   difficulty - quietly, inside whatever tier you chose - so it keeps meeting
   you where you actually are rather than where you said you were.
   ========================================================================= */
const PKEY = 'ledger_profile_v1';
const MAX_RUNS = 80;
let PROF = null;
/* same rule as S: the ui loads the profile, the core holds it */
function setProfile(p){ PROF = p; return PROF; }

function blankProfile(){
  return {
    v:1,
    id:'p'+Date.now().toString(36)+Math.floor(Math.random()*1679616).toString(36),
    handle:'', created:new Date().toISOString(), updated:new Date().toISOString(),
    runs:[],
    cloud:{url:'', key:'', token:'', refresh:'', email:'', userId:'', lastSync:null, lastError:''}
  };
}