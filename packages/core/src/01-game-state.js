

/* =========================================================================
   Section 3: Game state
   ========================================================================= */
let S = null;          // live game state
/* The ui reads a save out of storage, but S is the core's to hold. In the
   single file both sides were in one scope and the assignment just worked; a
   module boundary makes that an error, which is the boundary doing its job. */
function setS(v){ S = v; return S; }
          // live game state
let UI = { tab:'overview', sub:'', bizSub:'ops', modal:null, lastGain:0, worldFocus:'', details:false };
let TX = [];           // this-turn transaction ledger lines

function blankState(){
  return {
    v:1, seed:1, city:'lagos', difficulty:'realistic', name:'', profile:'grad',
    turn:0, gameOver:null, startedAt:Date.now(),
    p:{ age:24, edu:'BSc', health:80, stress:30, happy:65, family:70, rep:40,
        skills:{finance:30,ops:30,hustle:30,network:30,tech:30},
        job:null, jobPerf:60, jobYears:0, married:false, kids:0, parents:2, partner:null },
    fin:{ cash:0, usdCash:0, debt:[], goods:[], budget:null, credit:62, overdrawn:0 },
    assets:[], biz:null, bizs:[], activeBiz:null, offers:[], informalIncome:0, cumInfl:1, creditCrunch:0,
    cast:[], threads:[], deals:[], rival:null, ambition:null, era:null, digest:[], stand:null, pegBudget:false,
    mkt:null, hist:[], journal:[], pending:[], flags:{}, cd:{}, seq:0, decisions:[], candidates:[],
    quarter:{ income:0, expense:0, bizProfit:0, invest:0, note:'' },
    house:[], houseCands:[],
    season:null,                   /* a fixed finish line — see Seasons, below */
    dealt:null,                    /* today's life, when the start was dealt: {day, draw} */
    why:{},                     /* dismissed "why this screen matters" hints */
    grp:{}                     /* collapsed card groups, per screen */
  };
}

function newGame(cfg){
  S = blankState();
  S.seed = cfg.seed || (Math.floor(Math.random()*1e9));
  R.s = S.seed|0;
  S.city = cfg.city || 'lagos';
  S.difficulty = cfg.difficulty || 'realistic';
  /* The adaptive tune is normally keyed to your own record, which is right for
     a solo run and wrong for a season: two people in the same season would get
     different worlds because one of them has played more. Measured spread was
     32.6% in shock intensity between a novice and a veteran — enough to decide
     a leaderboard on its own. So a season pins the tune to the untuned
     baseline for everybody. The tier still applies; only the adaptive
     component is held constant, and that is exactly the part that would have
     made the comparison meaningless. */
  S.tune = computeTune(cfg.season ? null : skillRating(ensureProfile()), S.difficulty);
  S._runLogged = false;
  S.name = (cfg.name||'You').trim() || 'You';
  const P = PROFILES.find(p=>p.id===cfg.profile) || PROFILES[0];
  S.profile = P.id;
  const c = CITIES.find(x=>x.id===S.city);
  const scale = c.payMult;
  S.p.age = P.age; S.p.edu = P.edu;
  S.p.skills = Object.assign({}, P.skills);
  S.p.health = P.start.health; S.p.stress = P.start.stress; S.p.happy = P.start.happy;
  S.p.family = P.start.family; S.p.rep = P.start.rep;
  S.fin.cash = Math.round(P.cash * (0.6 + 0.4*c.payMult));
  S.fin.usdCash = P.usd;
  if(P.salary>0){
    S.p.job = { title:P.jobTitle, monthly:Math.round(P.salary*scale), industry:'Corporate' };
  }
  if(P.debt>0){ S.fin.debt.push({id:'d1', name:'Personal loan', bal:P.debt, rate:0.09, minPay:Math.round(P.debt*0.12), kind:'bank'}); }
  S.informalIncome = P.informalIncome ? Math.round(P.informalIncome*scale) : 0;
  S.fin.budget = defaultBudget(P, c);
  S.budgetInfl = 1;
  S.mkt = initMarket(c);
  S.hist = [];
  S.journal = [];
  log('start','You begin in '+c.name+'. Age '+P.age+'. '+P.blurb, 'begin');
  if(P.debt>0) log('start','You carry an existing personal loan of '+fmt(P.debt)+'.', 'warn');
  TX = [];
  S.cast = buildCast();
  S.threads = []; S.deals = []; S.active = []; S.digest = [];
  S.era = initEra();
  S.rival = genRival();
  S.ambition = {id:(cfg.ambition || 'free'), chosen:!!cfg.ambition};
  S.stand = {family:60, industry:35, community:50, state:40, street:30};
  S.pegBudget = false;
  S._startAge = S.p.age;
  TX = [];
  refreshDeals();
  S.vignette = makeVignette();
  S.candidates = [genCandidate(0), genCandidate(0), genCandidate(1)];
  UI.tab='overview'; UI.bizSub='ops'; UI.modal=null;
  recompute();
  snapshot();
  if(S.difficulty!=='hardcore') save('auto');
  return S;
}

/* ── Today's life: a start that is dealt, not chosen ──────────────────────
   The five profiles say who you are; a draw says what you were born into, and
   nobody picks that. The deal is a function of the date in Lagos, so everyone
   who starts today is dealt the same life, and it cannot be re-dealt: the only
   way to get another is to come back tomorrow. That is what makes it worth a
   screenshot - a deal you could reroll is a slot machine.

   Every draw is unequal and none is a free win: each one carries the thing it
   costs you, the way a loan from day one also teaches you to count every naira.
   The amounts are at the price level a run starts on (cumInfl 1). */
const DRAWS = [
  {id:'nepo', name:'Daddy’s name opens doors',
   up:'₦2.5m from home, and a network that returns calls',
   down:'everyone assumes it was Daddy, and you never learned to hustle',
   fx:{cash:2500000, skills:{network:15, hustle:-12}, p:{rep:-6}, stand:{industry:10}}},
  {id:'lapo', name:'A microfinance loan from day one',
   up:'you learned to count every naira, and to move fast',
   down:'₦450k owed at 7% a quarter before your first payslip',
   fx:{debt:{bal:450000, rate:0.07, minPay:75000, name:'Microfinance loan'}, skills:{hustle:15, finance:10}, p:{stress:6}}},
  {id:'ada', name:'First child, family breadwinner',
   up:'the family stands behind you, and so does their network',
   down:'the family budget is yours to carry, and it is bigger',
   fx:{skills:{network:8}, p:{family:12, stress:8}, stand:{family:15}, familyBudget:1.6}},
  {id:'houston', name:'An uncle in Houston',
   up:'$2,000 sent home for your start',
   down:'the remittance runs both ways: home now expects its share',
   fx:{usd:2000, p:{stress:5}, familyBudget:1.25}},
  {id:'mushin', name:'Raised in Mushin, schooled by the street',
   up:'hustle and a street that knows your name',
   down:'banks do not know you, and some rooms close when you walk in',
   fx:{skills:{hustle:18, network:10}, p:{rep:-8}, stand:{street:20}, credit:-12}},
  {id:'fellowship', name:'Your mother runs the women’s fellowship',
   up:'a congregation that vouches for you',
   down:'tithe and harvest levies from the first month',
   fx:{skills:{network:12}, p:{happy:5}, stand:{community:20}, giving:15000}},
];
/* The date the deal belongs to: the calendar day in Lagos (UTC+1, no DST). */
function todayKey(now){
  return new Date((now === undefined ? Date.now() : now) + 3600000).toISOString().slice(0, 10);
}
/* FNV-1a over the day, so the same day always deals the same life on every
   device and in both runtimes, with no server and no clock but the player's. */
function dayHash(key){
  let h = 0x811c9dc5;
  const t = 'ledger-day:' + key;
  for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** @param {string} [key] */
function todaysLife(key){
  const day = key || todayKey();
  const h = dayHash(day);
  return { day:day, seed:(h % 999999937) + 1,
           profile:PROFILES[h % PROFILES.length].id,
           draw:DRAWS[(h >>> 8) % DRAWS.length].id,
           city:'lagos', difficulty:'realistic' };
}
/* Applied once, straight after newGame, and it draws nothing from the seeded
   stream - so a dealt run is the same world as an undealt run on the same seed,
   plus the circumstance. */
function applyDraw(id){
  const d = DRAWS.find(function(x){ return x.id === id; });
  if(!d) return null;
  const f = d.fx;
  if(f.cash) S.fin.cash += f.cash;
  if(f.usd) S.fin.usdCash += f.usd;
  if(f.debt) S.fin.debt.push({id:'draw', name:f.debt.name, bal:f.debt.bal, rate:f.debt.rate, minPay:f.debt.minPay, kind:'bank'});
  Object.keys(f.skills || {}).forEach(function(k){ S.p.skills[k] = clamp(S.p.skills[k] + f.skills[k], 0, 100); });
  Object.keys(f.p || {}).forEach(function(k){ S.p[k] = clamp(S.p[k] + f.p[k], 0, 100); });
  Object.keys(f.stand || {}).forEach(function(k){ S.stand[k] = clamp(S.stand[k] + f.stand[k], 0, 100); });
  if(f.credit) S.fin.credit = clamp(S.fin.credit + f.credit, 0, 100);
  if(f.familyBudget) S.fin.budget.family = Math.round(S.fin.budget.family * f.familyBudget);
  if(f.giving) S.fin.budget.giving = f.giving;
  log('start', 'Dealt, not chosen: '+d.name+'. '+d.up.charAt(0).toUpperCase()+d.up.slice(1)+'; '+d.down+'.', 'begin');
  recompute();
  return d;
}

function defaultBudget(P,c){
  const nd = needs();
  const inc = Math.max(0, (P.salary*c.payMult) + (P.informalIncome||0)*c.payMult);
  const total = nd.housing+nd.food+nd.transport+nd.lifestyle+nd.family;
  // how much of a decent life your income actually covers (0.92 leaves a little room to breathe)
  const scale = inc>0 ? clamp((inc*0.92)/total, 0.5, 1.15) : 0.62;
  return {
    housing:   Math.round(nd.housing*scale),
    food:      Math.round(nd.food*Math.min(1, scale*1.25)),   // food is the last thing cut
    transport: Math.round(nd.transport*scale),
    lifestyle: Math.round(nd.lifestyle*scale*0.85),
    family:    Math.round(nd.family*Math.min(1, scale*1.2)),
    learning:  0,
    giving:    0
  };
}

let _dCache = null;
/* The tier sets the character of the run; the tuning leans on it. A veteran on
   Realistic is not playing the same game as a newcomer on Realistic, and neither
   of them is playing Hardcore - the multipliers are capped well below that gap. */
function D(){
  const base = DIFFS[S.difficulty] || DIFFS.realistic;
  const t = S.tune;
  if(!t || typeof t.shock!=='number') return base;      // old saves, or before tuning exists
  if(_dCache && _dCache.base===base && _dCache.t===t) return _dCache.v;
  const v = Object.assign({}, base, {
    shock: base.shock*t.shock, fail: base.fail*t.fail,
    infl:  base.infl*t.infl,   pay:  base.pay*t.pay,
    talent: t.talent||1, heat: t.heat||1, tuned:true
  });
  _dCache = {base:base, t:t, v:v};
  return v;
}
/*@table:DIFFS@*/
/* A tier gated on your record. The base three are always open; the ones above
   Hardcore have to be earned, and the field is not a boast — it is what the
   game actually checks before it will let you select them. */
function tierUnlocked(k){
  const d = DIFFS[k]; if(!d) return false;
  if(!d.need) return true;
  const sk = skillRating(ensureProfile());
  return sk !== null && sk >= d.need;
}
function tierLockNote(k){
  const d = DIFFS[k]; if(!d || !d.need) return '';
  const sk = skillRating(ensureProfile());
  return 'Locked — reach an experience rating of '+d.need+' to unlock it'+
         (sk===null ? '.' : '. You are at '+Math.round(sk)+'.');
}

/* =========================================================================
   Section 4: Macro economy
   ========================================================================= */
function initMarket(c){
  return {
    infl:c.infl, inflTarget:c.infl, usd:c.fxBase, usdPrev:c.fxBase, mpr:c.infl+0.06,
    oil:78, sentiment:52, power:44, gdp:0.031, demand:1.00, quarterShock:0,
    news:[], fxShockTurn:-99
  };
}

/*@table:POLICY_EVENTS@*/

function stepMarket(){
  const m = S.mkt, d = D(), c = CITIES.find(x=>x.id===S.city);
  m.usdPrev = m.usd;
  // inflation: target mean-reverts to this economy's structural rate, then inflation chases the target
  const structural = clamp(c.infl * d.infl + eraFx('infl'), 0.008, 0.75);
  m.inflTarget = clamp(m.inflTarget + (structural - m.inflTarget)*0.07 + R.gauss(0, 0.010), 0.010, 0.75);
  m.infl = clamp(m.infl + (m.inflTarget - m.infl)*0.25 + R.gauss(0,0.012)*d.shock, 0.006, 0.95);
  // fx: purchasing power parity drift + occasional discrete devaluation
  const drift = (Math.max(0, m.infl - 0.035)/4) * 0.55;
  m.usd = m.usd * (1 + drift + R.gauss(0, 0.011)*d.shock);
  if(R.chance(0.040*d.shock)){
    const s = (0.10 + R.f()*0.24) * d.shock;
    m.usd *= (1+s); m.fxShockTurn = S.turn;
    pushNews('Sudden devaluation: '+c.fxName+' +'+(s*100).toFixed(0)+'%', 'bad');
    log('macro','Discrete devaluation: '+c.fxName+' moved +'+(s*100).toFixed(0)+'% inside a week. Importers repriced before the news cycle did.','macro');
  }
  // rates track inflation with a real policy premium
  m.mpr = clamp(m.mpr + (Math.max(0.04, m.infl*0.85) - m.mpr)*0.28 + R.gauss(0,0.006), 0.02, 0.85);
  m.oil = clamp(m.oil + R.gauss(0, 6.5), 26, 145);
  m.sentiment = clamp(m.sentiment + R.gauss(0, 6)*d.shock + (50+eraFx('sent')-m.sentiment)*0.14, 3, 97);
  m.power = clamp(m.power + R.gauss(0, 7) + (45-m.power)*0.08, 3, 98);
  m.gdp = clamp(m.gdp + R.gauss(0,0.006), -0.03, 0.09);
  m.demand = clamp(1 + (m.sentiment-50)/230 + (m.gdp-0.03)*2.2 + R.gauss(0,0.028)*d.shock + eraFx('demand'), 0.34, 1.7);
  S.cumInfl = S.cumInfl * (1 + m.infl/4);
  if(S.biz && S.biz.locations>1) { /* prices pass through inflation via inflF */ }
  if(S.creditCrunch>0) S.creditCrunch--;
  // policy shock
  if(R.chance(0.16 * (1 + (eraFx('reg')?eraFx('reg')*0.5:0)))){
    const pool = POLICY_EVENTS.filter(e=>e.cond(m));
    const ev = R.weighted(pool, e=>e.w);
    if(ev){ const extra = ev.fx(m)||''; pushNews(ev.head, 'warn'); log('macro', ev.head+' — '+ev.text+(extra?' ('+extra+')':''), 'macro'); }
  }
  pushNews('Inflation '+pct(m.infl,1)+' · '+c.fxName+' '+Math.round(m.usd).toLocaleString()+' · MPR '+pct(m.mpr,1), 'neutral', true);
}
function pushNews(text, kind, quiet){
  S.mkt.news.unshift({t:text, k:kind, turn:S.turn});
  if(S.mkt.news.length>26) S.mkt.news.pop();
  if(!quiet){ /* headline shown in ticker */ }
}