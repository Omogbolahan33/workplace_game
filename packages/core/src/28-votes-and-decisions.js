

/* ------------------------------- the vote modal ------------------------------ */

function govVoteModal(){
  const M = UI.modal;
  const b = bizById(M.biz) || S.biz;
  const res = M.res, w = M.whip, passed = M.passed;
  let h = '<span class="chip '+(passed?'g':'r')+'">'+(passed?'Carried':'Lost')+'</span>';
  h += '<h2 style="margin-top:8px;font-size:19px">'+esc(resMeta(res.kind).label)+'</h2>';
  let body = '<div style="font-size:14px;line-height:1.65">'+esc(M.out||'')+'</div>';
  body += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">'+
    (res.cls==='shareholder'?'Shareholder vote, weighted by shares':'Board vote, one seat one vote')+' · '+
    (res.thr==='special'?'75% required':'simple majority required')+'</div>';
  body += '<div class="kv"><span>For</span><span class="good">'+Math.round(w.for)+(res.cls==='shareholder'?' votes':' seats')+'</span></div>';
  body += '<div class="kv"><span>Against</span><span class="bad">'+Math.round(w.against)+'</span></div>';
  body += '<div class="kv"><span>Abstained</span><span class="muted">'+Math.round(w.abstain)+'</span></div>';
  body += '<hr class="sep">';
  (w.rows||[]).forEach(function(r){
    if(r.d.yours) return;
    const v = r.st.vote==='for'?'<span class="chip g">for</span>':r.st.vote==='against'?'<span class="chip r">against</span>':'<span class="chip">abstain</span>';
    body += '<div class="kv"><span>'+esc(r.d.name)+(r.holder?' <span class="chip">holder</span>':'')+' '+v+(r.st.reasons.length?'<br><span class="tiny muted">'+esc(r.st.reasons.join('; '))+'</span>':'')+'</span><span class="tiny muted">'+
      (res.cls==='shareholder'?Math.round(r.w).toLocaleString()+' shares':'1 seat')+'</span></div>';
  });
  return {head:h, body:body, foot:'<button class="btn primary" data-a="close">Understood</button>'};
}

function govDot(){
  return bizList().some(function(b){
    return openResolutions(b).length > 0 ||
           (b.inbound||[]).some(function(x){ return x.status==='live'; }) ||
           (b.shotgun && !b.shotgun.responded);
  });
}
/* Push an existing holder (or create one) up by extraPct points of the company. */
function widenHolder(b, holderId, extraPct){
  ensureGov(b);
  let h = holderId ? holderById(b, holderId) : null;
  if(!h){
    const ext = extHolders(b).slice().sort(function(a,c){ return (c.shares||0)-(a.shares||0); });
    h = ext[0] || addHolder(b, {name:R.pick(FIRST)+' '+R.pick(LAST), kind:'investor', trust:56, seniority:2});
  }
  const target = clamp(holderPct(b,h) + extraPct, 1, 88);
  grantPct(b, target, {holderId:h.id, noCash:true});
  return h;
}
/* Take the register back to one name. */
function wipeExternal(b){
  ensureGov(b);
  b.shares = (b.shares||[]).filter(function(h){ return h.you; });
  b.board  = (b.board||[]).filter(function(d){ return d.yours; });
  syncCapTable(b);
}

/* =========================================================================
   Section 21f: The pack, the plan, the covenants, the pool
   ========================================================================= */

/*@table:SECTOR_MULT@*/
function sectorComps(b){ return SECTOR_MULT[b.type] || [3.5,6.5]; }
function bizDep(b){ return Math.round((b.capex||0)*0.05); }
function bizInterest(b){ return Math.round((b.debt||0)*0.055); }
function lastQ(b, back){
  const h=(b&&b.history)||[]; if(!h.length) return null;
  return h[h.length-1-(back||0)] || null;
}
function sumQ(b, n, key){
  const h=(b&&b.history)||[]; const s=h.slice(-n);
  return s.reduce(function(a,r){ return a + (r[key]||0); },0);
}

/* ------------------------------ management accounts ------------------------ */

function bizAccounts(b){
  ensureGov(b);
  const T = BIZ.find(function(x){ return x.id===b.type; }) || BIZ[0];
  const h = (b.history||[]);
  const cur  = h[h.length-1] || {revenue:0,cogs:0,opex:0,profit:0,ebitda:0,units:0,cap:0,dem:0,cash:0,recv:0,inv:0,pay:0,staff:0,out:1,dep:0,int:0,tax:0,debt:0};
  const prev = h[h.length-2] || null;
  const yoy  = h[h.length-5] || null;
  const rev  = cur.revenue||0, cogs = cur.cogs||0, opex = cur.opex||0, prof = cur.profit||0;
  const gross= (cur.gross!==undefined) ? cur.gross : (rev - cogs);
  const gm   = rev>0 ? gross/rev : 0;
  const nm   = rev>0 ? prof/rev : 0;
  const om   = rev>0 ? opex/rev : 0;
  const ebitdaQ = (cur.ebitda!==undefined) ? cur.ebitda : (prof + (cur.tax||0) + (cur.dep||0) + (cur.int||0));
  const ebitda  = sumQ(b, 4, 'ebitda');                 // trailing twelve months
  const revTTM  = sumQ(b, 4, 'revenue');
  const profTTM = sumQ(b, 4, 'profit');
  const qoq = prev && prev.revenue ? (rev/prev.revenue - 1) : 0;
  const yoyR= yoy  && yoy.revenue  ? (rev/yoy.revenue  - 1) : 0;
  const days = function(stock, flow){ return flow>0 ? Math.round(stock/flow*91) : 0; };
  const dso = days(cur.recv||0, rev);
  const dio = days(cur.inv||0, cogs);
  const dpo = days(cur.pay||0, cogs);
  const ccc = dso + dio - dpo;
  const wcMove = (prev ? ((cur.recv||0)-(prev.recv||0)) + ((cur.inv||0)-(prev.inv||0)) - ((cur.pay||0)-(prev.pay||0)) : 0);
  const openCash = prev ? (prev.cash||0) : Math.round((b.cash||0) - prof);
  const capexQ = Math.max(0, (b.capexQ||0));
  const financing = Math.round((b.cash||0) - openCash - prof - (cur.dep||0) + wcMove + capexQ);
  const burn = (profTTM < 0) ? Math.abs(profTTM/4) : 0;
  const cashNow = Math.max(0, b.cash||0);
  return {
    T:T, cur:cur, prev:prev, yoy:yoy, h:h,
    revenue:rev, cogs:cogs, opex:opex, gross:gross, profit:prof,
    gm:gm, nm:nm, om:om, ebitdaQ:ebitdaQ, ebitda:ebitda, revTTM:revTTM, profTTM:profTTM,
    qoq:qoq, yoyRev:yoyR, revYoY:yoyR,
    dso:dso, dio:dio, dpo:dpo, ccc:ccc, wcMove:wcMove,
    openCash:openCash, capexQ:capexQ, financing:financing, closeCash:Math.round(b.cash||0),
    staff:(cur.staff||0), outlets:Math.max(1,(cur.out||1)),
    util:(cur.cap||0)>0 ? Math.min(1,(cur.units||0)/cur.cap) : 0,
    revPerHead: (cur.staff||0)>0 ? rev/(cur.staff||1) : 0,
    revPerUnit: rev/Math.max(1,(cur.out||1)),
    debt:Math.round(b.debt||0), burn:burn,
    runway: burn>0.5 ? Math.max(0, Math.round(cashNow/burn)) : 99,
    interest: (cur.int||0), dep:(cur.dep||0)
  };
}

/* --------------------------- what the number is made of -------------------- */

function valuationBridge(b){
  const a = bizAccounts(b);
  const equity = Math.max(0, bizValue(b));
  const netDebt = Math.round((b.debt||0) - Math.max(0, b.cash||0));
  const ev = Math.max(0, equity + netDebt);
  const ebitda = a.ebitda;
  const mult = ebitda > 0 ? ev/ebitda : null;
  const comps = sectorComps(b);
  const drivers = [];
  if(a.yoyRev > 0.15) drivers.push({s:'+', t:'revenue growing '+pct(a.yoyRev,0)+' year on year supports a premium'});
  else if(a.yoyRev < -0.08) drivers.push({s:'\u2212', t:'revenue shrinking '+pct(Math.abs(a.yoyRev),0)+' year on year'});
  else drivers.push({s:'=', t:'revenue broadly flat \u2014 no growth premium, no growth discount'});
  if(!b.formal) drivers.push({s:'\u2212', t:'unregistered. Buyers discount informal books heavily'});
  if((b.compliance||0) < 50) drivers.push({s:'\u2212', t:'weak compliance records make diligence expensive'});
  else if((b.compliance||0) > 72) drivers.push({s:'+', t:'clean books shorten diligence and support the price'});
  const kc = (b.keyClient && (b.keyClient.share||0)) || 0;
  if(kc > 0.30) drivers.push({s:'\u2212', t:'one customer is '+pct(kc,0)+' of revenue \u2014 concentration risk'});
  if(!b.md && !b.founderOusted) drivers.push({s:'\u2212', t:'key-man risk: it is you, and a buyer prices for your departure'});
  else if(b.md) drivers.push({s:'+', t:'a management team that survives your absence'});
  if(((b.incidents||[]).filter(function(i){ return i.turns>0; })).length) drivers.push({s:'\u2212', t:'open incidents a buyer will find'});
  if((b.rep||0) > 66) drivers.push({s:'+', t:'reputation '+Math.round(b.rep)+'/100 \u2014 demand a buyer does not have to rebuild'});
  if((b.contracts||[]).length) drivers.push({s:'+', t:(b.contracts).length+' contracted revenue stream(s), which are worth more than walk-in trade'});
  if((b.outlets||[]).length > 2) drivers.push({s:'+', t:(b.outlets).length+' units \u2014 scale, if the leases hold'});
  if(b.integration) drivers.push({s:'\u2212', t:'an acquisition still being integrated'});
  if((b.relatedParty||0) > 0) drivers.push({s:'\u2212', t:'related-party contracts on the record'});
  if((b.taxRisk||0) > 25) drivers.push({s:'\u2212', t:'an unresolved tax position'});
  const w = liquidationWaterfall(b, equity);
  return {ev:ev, netDebt:netDebt, equity:equity, ebitda:ebitda, mult:mult, comps:comps,
    drivers:drivers, waterfall:w, mine:w.mine};
}

/* ------------------------------ the operating plan -------------------------- */

function defaultPlan(b){
  const a = bizAccounts(b);
  const T = BIZ.find(function(x){ return x.id===b.type; }) || BIZ[0];
  const rev = Math.max(a.revTTM*1.18, a.revenue*4*1.10);
  return {revenue:Math.round(rev), gm:Math.round(a.gm*100), opex:Math.round(rev*(a.om||0.28)),
    capex:Math.round(rev*0.08), headcount:Math.max(1,(a.staff||0)+1), ebitda:Math.round(rev*Math.max(0.06,a.gm-(a.om||0.28))),
    note:'', turn:S.turn, horizon:4};
}
function planVariance(b){
  const p = b.plan;
  if(!p || p.status!=='approved') return null;
  const a = bizAccounts(b);
  const annRev = a.revTTM, annEbitda = a.ebitda, annOpex = a.opex*4;
  return {
    rev:   p.revenue>0 ? (annRev/p.revenue - 1) : 0,
    gm:    a.gm - (p.gm||0)/100,
    opex:  p.opex>0 ? (annOpex/p.opex - 1) : 0,
    ebitda:p.ebitda>0 ? (annEbitda/p.ebitda - 1) : (annEbitda>0?1:0),
    head:  (a.staff||0) - (p.headcount||0),
    quarters: S.turn - (p.turn||S.turn)
  };
}
function planGrade(b){
  const v = planVariance(b); if(!v) return 0;
  return clamp(v.rev*1.4 + v.ebitda*1.6 - Math.max(0,v.opex-0.10)*0.8, -1.5, 1.5);
}
function planLabel(b){
  const g = planGrade(b); if(!b.plan || b.plan.status!=='approved') return null;
  if(g > 0.35) return {t:'ahead of plan', c:'g'};
  if(g > 0.05) return {t:'on plan', c:'g'};
  if(g > -0.18) return {t:'marginally behind', c:'y'};
  if(g > -0.45) return {t:'behind plan', c:'y'};
  return {t:'materially behind plan', c:'r'};
}

/* --------------------------------- covenants -------------------------------- */

/*@table:COVENANT_KINDS@*/
function covenantsOf(b){ ensureGov(b); return (b.covenants)||[]; }
function covenantActual(c, b){
  const a = bizAccounts(b);
  if(c.kind==='leverage') return a.ebitda>0 ? (a.debt/a.ebitda) : (a.debt>0 ? 99 : 0);
  if(c.kind==='cover')    return a.interest>0 ? (a.ebitda/Math.max(1,a.interest*4)) : 99;
  if(c.kind==='mincash')  return Math.max(0, b.cash||0);
  if(c.kind==='capex')    return Math.max(0,(b.capex12||0));
  if(c.kind==='conc')     return ((b.keyClient&&b.keyClient.share)||0)*100;
  if(c.kind==='keyman')   return (b.founderOusted ? 1 : 0);
  return 0;
}
function covenantState(c, b){
  const actual = covenantActual(c, b);
  const worseHigh = (COVENANT_KINDS[c.kind]||{worse:'higher'}).worse === 'higher';
  let ok;
  if(c.kind==='keyman') ok = !b.founderOusted;
  else if(c.kind==='cover') ok = actual >= c.limit;
  else if(worseHigh) ok = actual <= c.limit;
  else ok = actual >= c.limit;
  const headroom = (c.kind==='keyman') ? (ok?1:0)
    : (worseHigh ? (c.limit - actual) : (actual - c.limit));
  return {c:c, actual:actual, ok:ok, headroom:headroom,
    tight: (c.kind!=='keyman') && (Math.abs(headroom) < Math.max(0.15*c.limit, 0.01))};
}
function covenantBreaches(b){ return covenantsOf(b).map(function(c){ return covenantState(c,b); }).filter(function(x){ return !x.ok; }); }
function covenantWarnings(b){ return covenantsOf(b).map(function(c){ return covenantState(c,b); }).filter(function(x){ return x.ok && x.tight; }); }
function addCovenant(b, kind, limit, from){
  ensureGov(b); if(!b.covenants) b.covenants = [];
  const cv = {id:'cv'+(++S.seq), kind:kind, limit:limit, from:from||'the facility', since:S.turn, waived:0};
  b.covenants.push(cv); return cv;
}
function facilityPackage(b, amount){
  /* A bank does not hand over money; it hands over money and a list. */
  const a = bizAccounts(b);
  const pkg = [];
  pkg.push(addCovenant(b, 'leverage', clamp(R.range(2.2,3.4), 1.8, 4.0), 'the facility'));
  pkg.push(addCovenant(b, 'cover',    clamp(R.range(1.8,2.8), 1.4, 3.2), 'the facility'));
  pkg.push(addCovenant(b, 'mincash',  Math.round(amount*0.10), 'the facility'));
  if(R.chance(0.5)) pkg.push(addCovenant(b, 'capex', Math.round(Math.max(4000000, a.revTTM*0.14)), 'the facility'));
  if((b.revenue||0) > 6000000 && R.chance(0.4)) pkg.push(addCovenant(b, 'keyman', 0, 'the facility'));
  return pkg;
}

/* -------------------------------- the option pool --------------------------- */

function poolPct(b){ return (b.pool||0); }
function grantOptions(b, staffId, pctv, strikePct){
  ensureGov(b);
  const st = (b.staff||[]).find(function(x){ return x.id===staffId; });
  if(!st) return 'No such person.';
  pctv = clamp(pctv, 0.1, 6);
  if((b.pool||0) < pctv) return 'The pool only has '+pct(b.pool||0,1)+' left. Top it up at the next round.';
  b.pool = (b.pool||0) - pctv;
  st.options = {pct:pctv, granted:S.turn, vested:0, strike:(strikePct===undefined?1:strikePct), cliff:4,
    strikePx: Math.max(1, bizValue(b)/Math.max(1, totalShares(b)))};
  st.morale = clamp((st.morale||60)+14, 3, 100);
  st.loyalty = clamp((st.loyalty||60)+18, 0, 100);
  syncCapTable(b);
  return st.name+' now holds '+pct(pctv/100,2)+' of the company in options, vesting over four years.';
}
function topUpPool(b, targetPct){
  ensureGov(b);
  const target = clamp(targetPct, 0, 20);
  const have = (b.pool||0);
  if(target <= have) return 0;
  /* a top-up dilutes everybody pro rata, which in practice means it dilutes you */
  const T = totalShares(b)||1;
  const extra = T * ((target-have)/(100-target));
  const me = (b.shares||[]).find(function(x){ return x.you; });
  const before = me ? me.shares : 0;
  (b.shares||[]).forEach(function(h){ });
  b._poolShares = (b._poolShares||0) + Math.round(extra);
  b.shares.forEach(function(h){ /* pool is unallocated: hold it outside the register */ });
  /* represent the pool as an unallocated line so the register stays honest */
  let pool = (b.shares||[]).find(function(x){ return x.pool; });
  if(!pool){ pool = {id:'h'+(++S.seq), name:'Unallocated option pool', you:false, pool:true, kind:'pool',
    cls:'Ordinary', shares:0, paid:0, price:0, since:S.turn, pref:0, seniority:0, trust:50, vested:true}; (b.shares||[]).push(pool); }
  pool.shares += Math.round(extra);
  syncCapTable(b);
  const after = me ? me.shares : 0;
  b.pool = target;
  return {issued:Math.round(extra), yourBefore:before, yourAfter:after};
}
function vestedOptions(b){
  const out = [];
  (b.staff||[]).forEach(function(st){
    if(!st.options) return;
    const g0 = st.options.granted;
    const held = S.turn - ((g0===undefined||g0===null) ? S.turn : g0);
    const v = clamp(Math.floor(held/4)/4, 0, 1);
    if(v > (st.options.vested||0)) st.options.vested = v;
    out.push({st:st, vested:st.options.vested, pct:st.options.pct});
  });
  return out;
}

/* =========================================================================
   Group structure and consolidation.

   A group is not a portfolio. The differences that matter:
     - profit belongs to the company, not to you, until it is declared
     - a dividend pays EVERY holder pro rata, so taking cash out of a company
       you do not wholly own leaks to the people on the register
     - a management charge moves profit to a lower-taxed place and the tax
       authority is entitled to ask whether it is arm's length
     - cash in one subsidiary does not fund another unless someone actually
       moves it, and moving it creates a debt that has to be serviced
     - a covenant breach anywhere is a breach everywhere
   ========================================================================= */

const WHT_RATE = 0.10;          // withholding tax on dividends upstream
const IC_RATE  = 0.045;         // intercompany lending rate, per quarter
const ARMS_LENGTH = 5;          // management charge above this % invites challenge

function ensureHoldco(){
  if(!S.holdco) S.holdco = {cash:0, retained:0, debt:0, mgmt:{}, loans:[], divs:0, tpRisk:0, seq:1};
  const h = S.holdco;
  if(!h.loans) h.loans = [];
  if(!h.mgmt) h.mgmt = {};
  if(h.cash===undefined) h.cash = 0;
  if(h.retained===undefined) h.retained = 0;
  if(h.debt===undefined) h.debt = 0;
  if(h.divs===undefined) h.divs = 0;
  if(h.tpRisk===undefined) h.tpRisk = 0;
  if(h.seq===undefined) h.seq = 1;
  if(!h.name) h.name = (((S.p && S.p.name) || 'Your') + ' Holdings');
  return h;
}
function holdcoName(){ return ensureHoldco().name; }
function groupSubs(){ return bizList(); }
function groupOn(){ return bizList().length > 1; }

/* ---- management charge ------------------------------------------------- */
function mgmtPct(b){ const h = ensureHoldco(); return (b && h.mgmt[b.id]) || 0; }
function setMgmtFee(b, pctv){
  if(!b) return 'No company selected.';
  ensureHoldco();
  const v = clamp(Math.round(Number(pctv)||0), 0, 15);
  const old = mgmtPct(b);
  S.holdco.mgmt[b.id] = v;
  if(old === v) return 'The management charge on '+b.name+' stays at '+v+'% of revenue.';
  return 'The management charge on '+b.name+' moves from '+old+'% to '+v+'% of revenue.';
}

/* ---- intercompany balances --------------------------------------------- */
function intercoLoans(){ return ensureHoldco().loans; }
function entityName(id){
  if(id === 'holdco') return holdcoName();
  const b = bizById(id); return b ? b.name : 'a company that no longer exists';
}
function entityCash(id){
  if(id === 'holdco') return ensureHoldco().cash;
  const b = bizById(id); return b ? Math.round(b.cash||0) : 0;
}
function addEntityCash(id, amt){
  if(id === 'holdco'){ ensureHoldco().cash += amt; return; }
  const b = bizById(id); if(b) b.cash = (b.cash||0) + amt;
}
function intercoLoan(fromId, toId, amt){
  amt = Math.round(Number(amt)||0);
  if(!fromId || !toId || fromId === toId) return 'A company cannot lend to itself.';
  if(amt <= 0) return 'Nothing moved.';
  const avail = entityCash(fromId);
  if(avail < amt) return entityName(fromId)+' has '+fmt(Math.max(0,avail))+' of cash. It cannot lend '+fmt(amt)+'.';
  const h = ensureHoldco();
  addEntityCash(fromId, -amt); addEntityCash(toId, amt);
  h.loans.push({id:'ic'+(h.seq++), from:fromId, to:toId, amt:amt, rate:IC_RATE, turn:S.turn, accrued:0});
  const up = (toId === 'holdco');
  log('biz', entityName(fromId)+' lent '+fmt(amt)+' to '+entityName(toId)+' at '+pct(IC_RATE,1)+' a quarter.'+
    (up ? ' Money moving up to the holdco is the cheapest way to get cash out and the first thing a lender looks at.' : ''), up?'warn':'info');
  return entityName(fromId)+' lent '+fmt(amt)+' to '+entityName(toId)+'.';
}
function repayInterco(id, amt){
  const h = ensureHoldco();
  const L = (h.loans||[]).filter(function(x){ return x.id===id; })[0];
  if(!L) return 'That balance is already settled.';
  amt = Math.round(Math.min(Math.round(Number(amt)||0), L.amt));
  if(amt <= 0) return 'Nothing was repaid.';
  const avail = entityCash(L.to);
  if(avail < amt) return entityName(L.to)+' only has '+fmt(Math.max(0,avail))+'. It cannot repay '+fmt(amt)+'.';
  addEntityCash(L.to, -amt); addEntityCash(L.from, amt);
  L.amt -= amt;
  if(L.amt <= 0) h.loans = h.loans.filter(function(x){ return x.id!==id; });
  return entityName(L.to)+' repaid '+fmt(amt)+' to '+entityName(L.from)+'.';
}
function intercoOwed(){ return (intercoLoans()||[]).reduce(function(s,l){ return s+(l.amt||0); }, 0); }
function intercoUpstream(){
  return (intercoLoans()||[]).filter(function(l){ return l.to==='holdco'; })
    .reduce(function(s,l){ return s+(l.amt||0); }, 0);
}
function intercoInterestTotal(){
  return (intercoLoans()||[]).reduce(function(s,l){ return s + Math.round((l.amt||0)*IC_RATE); }, 0);
}

/* ---- dividends --------------------------------------------------------- */
function divCapacity(b){
  if(!b) return 0;
  const res  = Math.round(b.retained||0);
  const cash = Math.max(0, Math.round(b.cash||0));
  // It may not strip out the cash it needs to buy stock and pay people next quarter.
  const buffer = Math.round((b.opex||0)*0.60 + (b.debt||0)*0.08);
  return Math.max(0, Math.min(res, cash - buffer));
}
function divNote(b){
  const res = Math.round(b.retained||0);
  const cash = Math.max(0, Math.round(b.cash||0));
  const buffer = Math.round((b.opex||0)*0.60 + (b.debt||0)*0.08);
  if(res <= 0) return 'No distributable reserves. It has accumulated losses, not profits.';
  if(cash - buffer <= 0) return 'Profitable on paper, but the cash is working capital. Stripping it would stop the company trading.';
  return null;
}
function payDividendUp(b, amt){
  if(!b) return 'No company selected.';
  amt = Math.round(Number(amt)||0);
  const cap = divCapacity(b);
  if(amt <= 0) return 'Nothing was declared.';
  if(amt > cap) return b.name+' can distribute '+fmt(cap)+' at most. '+(divNote(b) || 'That is the lower of its reserves and the cash it can spare.');
  ensureGov(b);
  const h = ensureHoldco();
  const mine = clamp(yourPct(b), 0, 100)/100;
  const leak = Math.round(amt * (1 - mine));
  const net  = Math.round(amt * mine * (1 - WHT_RATE));
  b.cash = (b.cash||0) - amt;
  b.retained = Math.round((b.retained||0) - amt);
  b.divsPaid = Math.round((b.divsPaid||0) + amt);
  h.cash += net; h.retained = Math.round((h.retained||0) + net);
  h.divs = Math.round((h.divs||0) + net);
  let msg = b.name+' declared '+fmt(amt)+'. '+fmt(net)+' reached the holdco after '+Math.round(WHT_RATE*100)+'% withholding.';
  if(leak > 0){
    msg += ' '+fmt(leak)+' went out to the other shareholders pro rata. That is what taking cash out of a company you do not wholly own costs.';
    (extHolders(b)||[]).forEach(function(hh){ hh.trust = clamp((hh.trust||50) + 4, 0, 100); });
    log('biz', msg, 'warn');
  } else {
    log('biz', msg, 'good');
  }
  return msg;
}

/* ---- quarterly step ---------------------------------------------------- */
function stepGroup(){
  const h = ensureHoldco();
  // Credit the holdco for management charges booked as cost in the subsidiaries.
  // The tax benefit downstairs is the point; the risk upstairs is the price.
  groupSubs().forEach(function(b){
    const fee = Math.round(b.mgmtFeeQ || 0);
    if(fee > 0){
      h.cash += fee; h.retained = Math.round((h.retained||0) + fee);
      const f = mgmtPct(b);
      h.tpRisk = clamp((h.tpRisk||0) + (f > ARMS_LENGTH ? (f - ARMS_LENGTH)*3.5 : -1.5), 0, 140);
      if(f > ARMS_LENGTH && (h.tpRisk||0) > 70 && (S.tpWarn||0) < S.turn - 8){
        S.tpWarn = S.turn;
        log('biz','The management charge is well above what an unrelated party would pay. Somebody at the tax authority will eventually do the arithmetic.','warn');
      }
    }
  });
  // Intercompany interest: paid by the borrower, received by the lender.
  (h.loans||[]).slice().forEach(function(L){
    const int = Math.round((L.amt||0) * IC_RATE);
    if(int <= 0) return;
    addEntityCash(L.to, -int); addEntityCash(L.from, int);
    L.accrued = Math.round((L.accrued||0) + int);
    if(L.from === 'holdco') h.retained = Math.round((h.retained||0) + int);
    if(L.to   === 'holdco') h.retained = Math.round((h.retained||0) - int);
  });
  if((h.tpRisk||0) <= 0 && (h.loans||[]).length === 0) h.tpRisk = 0;
}

/* ---- consolidated accounts --------------------------------------------- */
function groupAccounts(){
  ensureHoldco();
  const h = S.holdco;
  const subs = groupSubs();
  const rows = subs.map(function(b){
    const hist = b.history || [];
    const last = hist[hist.length-1] || {};
    const rev  = last.revenue||0, cogs = last.cogs||0, opex = last.opex||0;
    const gross = (last.gross !== undefined) ? last.gross : (rev - cogs);
    const dep = last.dep||0, int = last.int||0, tax = last.tax||0, prof = last.profit||0;
    const ebitda = (last.ebitda !== undefined) ? last.ebitda : (prof + tax + dep + int);
    return {
      id:b.id, b:b, name:b.name, type:b.type, own:clamp(yourPct(b),0,100),
      rev:rev, cogs:cogs, gross:gross, opex:opex, ebitda:ebitda,
      dep:dep, int:int, tax:tax, net:prof,
      cash:Math.round(b.cash||0), debt:Math.round(b.debt||0),
      retained:Math.round(b.retained||0), cap:divCapacity(b), note:divNote(b),
      mgmtFee:Math.round(b.mgmtFeeQ||0), mgmtPct:mgmtPct(b),
      revTTM:sumQ(b,4,'revenue'), ebitdaTTM:sumQ(b,4,'ebitda')
    };
  });
  const sum = function(k){ return rows.reduce(function(s,r){ return s + (r[k]||0); }, 0); };
  const g = {
    rows:rows,
    rev:sum('rev'), cogs:sum('cogs'), gross:sum('gross'), opex:sum('opex'),
    ebitda:sum('ebitda'), dep:sum('dep'), int:sum('int'), tax:sum('tax'), net:sum('net'),
    revTTM:sum('revTTM'), ebitdaTTM:sum('ebitdaTTM'),
    subCash:sum('cash'), subDebt:sum('debt'), subRetained:sum('retained'),
    divCapacity:sum('cap'),
    holdcoCash:Math.round(h.cash||0), holdcoRetained:Math.round(h.retained||0),
    holdcoDebt:Math.round(h.debt||0), holdcoDivs:Math.round(h.divs||0),
    loans:(h.loans||[]).slice(), tpRisk:Math.round(h.tpRisk||0)
  };
  // Eliminations: the management charge is income to the holdco and cost in the
  // subsidiary. At group level it never existed. Same for intercompany interest.
  g.elimMgmt = sum('mgmtFee');
  g.elimInt  = intercoInterestTotal();
  g.holdcoIncome = g.elimMgmt;                       // what the holdco earned this quarter
  g.groupNet = g.net;                                // fees already charged below the line
  g.groupCash = g.subCash + g.holdcoCash;
  g.groupDebt = g.subDebt + g.holdcoDebt;
  g.netCash   = g.groupCash - g.groupDebt;
  g.leverage  = g.ebitdaTTM > 0 ? g.groupDebt / g.ebitdaTTM : null;
  // Minority interest: the slice of group profit that is not yours.
  g.minorityNet = rows.reduce(function(s,r){ return s + r.net * (1 - r.own/100); }, 0);
  g.attributable = g.net - g.minorityNet;
  return g;
}

/* ---- group covenants and cross-default --------------------------------- */
function groupBreaches(){
  const out = [];
  groupSubs().forEach(function(b){
    (covenantBreaches(b)||[]).forEach(function(c){ out.push({biz:b, cov:c}); });
  });
  return out;
}
function groupCrossDefault(){
  const br = groupBreaches();
  if(!br.length) return null;
  const withDebt = groupSubs().filter(function(b){ return (b.debt||0) > 0; });
  if(withDebt.length < 1) return null;
  return {
    breached:br,
    exposed:withDebt.filter(function(b){ return !br.some(function(x){ return x.biz.id===b.id; }); }),
    totalDebt:withDebt.reduce(function(s,b){ return s + (b.debt||0); }, 0)
  };
}
function groupCovenantStrip(){
  const g = groupAccounts();
  const rows = [];
  if(g.leverage !== null){
    rows.push({label:'Group leverage', actual:g.leverage.toFixed(2)+'x', limit:'3.00x',
      ok:g.leverage <= 3.0, tight:g.leverage > 2.6 && g.leverage <= 3.0});
  }
  const xd = groupCrossDefault();
  if(xd){
    rows.push({label:'Cross-default', actual:xd.breached.length+' breached', limit:'0',
      ok:false, tight:false, cross:true,
      detail:(xd.exposed.length
        ? fmt(xd.totalDebt)+' of group facilities can be accelerated because of a breach elsewhere in the group.'
        : 'The only companies with borrowed money are the ones already in breach.')});
  }
  const up = intercoUpstream();
  if(up > 0){
    rows.push({label:'Upstream loans', actual:fmt(up), limit:'—', ok:up < Math.max(1, g.groupCash*0.5), tight:false,
      detail:'Money you have taken out of the subsidiaries as debt rather than dividend. Lenders read this as you pulling cash out of a business they lent against.'});
  }
  if(g.tpRisk > 0){
    rows.push({label:'Transfer pricing', actual:'risk '+g.tpRisk, limit:'100', ok:g.tpRisk < 100, tight:g.tpRisk >= 70,
      detail:'How exposed the management charge is to a challenge.'});
  }
  return rows;
}

/* =========================================================================
   The Group view — consolidated accounts, upstream cash, and who owns what.
   ========================================================================= */
function _gcell(v, strong){
  const n = Math.round(v||0);
  return '<td style="text-align:right;padding:4px 7px;'+(strong?'border-top:1px solid var(--line2);font-weight:600;':'')+
    (n<0?'color:var(--bad)':'')+'">'+fmt(n)+'</td>';
}
function _glabel(t, strong){
  return '<td style="padding:4px 7px;color:var(--dim);'+(strong?'border-top:1px solid var(--line2);color:var(--txt);':'')+'">'+t+'</td>';
}

/* =========================================================================
   Section 17: Actions
   ========================================================================= */
function askAmount(title, note, def, cb){
  UI.modal = {type:'amount', title:title, note:note, def:def, cb:cb}; render();
}
function confirmBox(title, text, cb, okLabel){
  UI.modal = {type:'confirm', title:title, text:text, cb:cb, okLabel:okLabel||'Confirm'}; render();
}
function message(title, text){ UI.modal={type:'message', title:title, text:text}; render(); }