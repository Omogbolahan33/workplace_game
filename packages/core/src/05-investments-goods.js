

/* =========================================================================
   Section 7: Investments & goods
   ========================================================================= */
function buyAsset(id, amt){
  const d = ASSETS.find(x=>x.id===id); if(!d) return false;
  amt = Math.floor(amt);
  if(amt < d.min){ toast('Minimum for '+d.name+' is '+fmt(d.min)+'.'); return false; }
  if(amt > S.fin.cash){ toast('You only have '+fmt(S.fin.cash)+'.'); return false; }
  S.fin.cash -= amt;
  let h = S.assets.find(a=>a.id===id);
  if(h){ h.value += amt; h.cost += amt; } else { S.assets.push({id:id, value:amt, cost:amt, from:S.turn}); }
  log('invest','Bought '+fmt(amt)+' of '+d.name+'.', 'neutral');
  recompute(); return true;
}
function sellAsset(id, amt){
  const d = ASSETS.find(x=>x.id===id); const h = S.assets.find(a=>a.id===id);
  if(!h) return false;
  amt = Math.min(Math.floor(amt), Math.floor(h.value));
  if(amt<=0) return false;
  const penalty = d && d.illiquid ? 0.82 : 0.99;
  const proceeds = Math.round(amt*penalty);
  h.value -= amt;
  S.fin.cash += proceeds;
  const pl = proceeds - amt;
  log('invest','Sold '+fmt(amt)+' of '+d.name+' for '+fmt(proceeds)+(d&&d.illiquid?' (illiquidity discount applied)':'')+'. P/L '+fmt(pl)+'.', pl>=0?'good':'bad');
  if(h.value < 1) S.assets = S.assets.filter(a=>a.id!==id);
  recompute(); return true;
}
function volRet(ret, vol){
  // fat tails are real, but a 6-sigma quarter turns a simulation into a lottery
  return ret + vol*clamp(R.gauss(0,1), -2.1, 2.1);
}
function stepAssets(){
  const m = S.mkt, fx = m.usd / Math.max(1, m.usdPrev);
  let income = 0;
  (S.assets||[]).forEach(a=>{
    const d = ASSETS.find(x=>x.id===a.id); if(!d) return;
    let r;
    switch(a.id){
      case 'savings': r = m.mpr/4*0.22; break;
      case 'ajo':     r = 0.026 + d.vol*clamp(R.gauss(0,1),-2.1,2.1); break;
      case 'tbill':   r = m.mpr/4*0.95; break;
      case 'fd':      r = m.mpr/4*0.88; break;
      case 'bond':    r = m.mpr/4*1.05 - 2.4*(m.mpr-(a.prevMpr||m.mpr)) + R.gauss(0,0.02); break;
      case 'ngx':     r = volRet(d.ret, d.vol) + (m.sentiment-50)/900; break;
      case 'sp500':   r = volRet(d.ret, d.vol) + (m.sentiment-50)/3500; break;
      case 'reit':    r = volRet(d.ret, d.vol) + (m.sentiment-50)/1400; break;
      case 'land':    r = volRet(d.ret, d.vol) + (m.gdp-0.03)*0.7; break;
      case 'rental':  r = volRet(d.ret, d.vol); break;
      case 'gold':    r = volRet(d.ret, d.vol) + (m.infl>0.25?0.020:0); break;
      case 'crypto':  r = volRet(d.ret, d.vol); break;
      case 'usd':     r = 0.001; break;
      default:        r = volRet(d.ret, d.vol);
    }
    a.prevMpr = m.mpr;
    r = clamp(r, -0.85, 1.20) + eraFx('ret');   // eras tilt every asset class at once
    let mult = 1 + r;
    if(d.fx) mult *= fx;
    const before = a.value;
    a.value = Math.max(0, a.value*mult);
    a.lastRet = mult - 1;
    if(d.yieldQ){ const inc = Math.round(a.value*d.yieldQ); income += inc; a.yieldAcc = (a.yieldAcc||0)+inc; }
    if(a.lastRet < -0.35) log('invest', d.name+' fell '+pct(a.lastRet,0)+' this quarter. '+fmt(a.value-before)+'.', 'bad');
    else if(a.lastRet > 0.35) log('invest', d.name+' rose '+pct(a.lastRet,0)+' this quarter. '+fmt(a.value-before)+'.', 'good');
  });
  return income;
}
function buyGood(id){
  const g = GOODS.find(x=>x.id===id); if(!g) return false;
  const cost = Math.round(g.cost * (0.85 + 0.3*CITY().rentMult/1.3));
  if(S.fin.cash < cost){ toast('You need '+fmt(cost)+'.'); return false; }
  S.fin.cash -= cost;
  S.fin.goods.push({id:id, turn:S.turn, paid:cost});
  const p = S.p;
  if(g.eff.happy) p.happy = clamp(p.happy+g.eff.happy,0,100);
  if(g.eff.stress) p.stress = clamp(p.stress+g.eff.stress,0,100);
  if(g.eff.health) p.health = clamp(p.health+g.eff.health,0,100);
  if(g.eff.rep) p.rep = clamp(p.rep+g.eff.rep,0,100);
  if(g.eff.finance) p.skills.finance = clamp(p.skills.finance+g.eff.finance,0,100);
  if(g.eff.ops) p.skills.ops = clamp(p.skills.ops+g.eff.ops,0,100);
  if(g.eff.tech) p.skills.tech = clamp(p.skills.tech+g.eff.tech,0,100);
  if(g.eff.network) p.skills.network = clamp(p.skills.network+g.eff.network,0,100);
  log('life','Bought: '+g.name+' for '+fmt(cost)+'. '+g.note, 'neutral');
  recompute(); return true;
}

/* =========================================================================
   Section 8: Consequence engine
   ========================================================================= */
function applyEff(e){
  if(!e) return;
  if(e.cash){ S.fin.cash += e.cash; tx((e.cash>0?'+':'−')+fmt(Math.abs(e.cash))); }
  if(e.usd) S.fin.usdCash = Math.max(0, S.fin.usdCash + e.usd);
  if(e.health) S.p.health = clamp(S.p.health+e.health,0,100);
  if(e.stress) S.p.stress = clamp(S.p.stress+e.stress,0,100);
  if(e.happy)  S.p.happy  = clamp(S.p.happy+e.happy,0,100);
  if(e.family) S.p.family = clamp(S.p.family+e.family,0,100);
  if(e.rep)    S.p.rep    = clamp(S.p.rep+e.rep,0,100);
  if(e.credit) S.fin.credit = clamp(S.fin.credit+e.credit,0,100);
  if(e.skill)  Object.keys(e.skill).forEach(k=>{ S.p.skills[k]=clamp(S.p.skills[k]+e.skill[k],0,100); });
  if(e.flag)   Object.keys(e.flag).forEach(k=>{ S.flags[k]=e.flag[k]; });
  if(e.informal) S.informalIncome = Math.max(0, (S.informalIncome||0) + e.informal);
  if(e.debt) S.fin.debt.push(Object.assign({id:'d'+(++S.seq), rate:0.12, minPay:0, kind:'bank'}, e.debt));
  if(e.asset){ const h=S.assets.find(a=>a.id===e.asset.id);
    if(h) h.value += e.asset.value; else S.assets.push({id:e.asset.id, value:e.asset.value, cost:e.asset.value, from:S.turn}); }
  if(e.good) S.fin.goods.push({id:e.good, turn:S.turn, paid:0});
  if(S.biz){
    const b = S.biz;
    if(e.bizcash) b.cash += e.bizcash;
    if(e.bizrep)  b.rep = clamp(b.rep+e.bizrep,0,100);
    if(e.bizcap)  b.capex += e.bizcap;
    if(e.bizqual) b.quality = clamp(b.quality+e.bizqual,0,100);
    if(e.bizloc)  { b.locations = Math.max(1, b.locations+e.bizloc); if(e.bizloc>0) b.lease.end = Math.max(b.lease.end, S.turn+8); }
    if(e.bizrecv)   b.recv = Math.max(0, (b.recv||0) + e.bizrecv);
    if(e.bizpay)    b.payable = Math.max(0, (b.payable||0) + e.bizpay);
    if(e.bizinv)    b.inventory = Math.max(0, (b.inventory||0) + e.bizinv);
    if(e.bizcomp)   b.compliance = clamp((b.compliance||40)+e.bizcomp,0,100);
    if(e.biztax)    b.taxRisk = clamp((b.taxRisk||0)+e.biztax,0,100);
    if(e.bizauto)   b.auto = clamp((b.auto||0)+e.bizauto,0,100);
    if(e.bizprod)   b.products = clamp((b.products||1)+e.bizprod,1,12);
    if(e.bizbrand)  b.brand = Math.max(0, (b.brand||0) + e.bizbrand);
    if(e.bizmorale) b.staff.forEach(function(x){ x.morale = clamp(x.morale+e.bizmorale,3,100); });
    if(e.biztrust)  b.staffTrust = clamp((b.staffTrust||55)+e.biztrust,0,100);
    if(e.bizsupp)   b.supplierConf = clamp((b.supplierConf||70)+e.bizsupp,0,100);
    if(e.bizinsure !== undefined) b.insured = !!e.bizinsure;
    if(e.bizcred !== undefined)   b.creditTerms = clamp(b.creditTerms+e.bizcred,0,1);
    if(e.bizstock !== undefined)  b.stockPolicy = clamp(b.stockPolicy+e.bizstock,0,1);
    if(e.bizkeyclient !== undefined) b.keyClient = e.bizkeyclient;
    if(e.bizcontract) { if(!b.contracts) b.contracts=[]; b.contracts.push(e.bizcontract); }
  }
  if(e.kid) S.p.kids = Math.max(0, S.p.kids + e.kid);
  if(e.marry){ S.p.married = true; S.p.partner = {name:R.pick(FIRST), income:e.marryIncome||0}; }
  if(e.job) S.p.job = e.job;
  if(e.delay) S.pending.push({turn:S.turn+e.delay.turns, title:e.delay.title, text:e.delay.text, eff:e.delay.eff, kind:e.delay.kind||'neutral'});
  if(e.log) log(e.log[0], e.log[1], e.log[2]);
}
function flushPending(){
  const due = (S.pending||[]).filter(x=>x.turn<=S.turn);
  S.pending = (S.pending||[]).filter(x=>x.turn>S.turn);
  due.forEach(p=>{
    log(p.kind==='good'?'life':(p.kind||'life'), p.title+' — '+p.text, p.kind||'neutral');
    if(p.eff) applyEff(p.eff);
  });
  return due;
}

/* =========================================================================
   Section 9: The event deck — life
   ========================================================================= */
/*@table:LIFE_EVENTS@*/