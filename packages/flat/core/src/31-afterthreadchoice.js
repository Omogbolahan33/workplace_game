
function afterThreadChoice(t, opt){
  if(opt.rel && t.castId){ relate(castOf(t.castId), opt.rel.d, opt.rel.note); }
  if(opt.next === 'end' || opt.next === undefined){
    S.threads = (S.threads||[]).filter(function(x){ return x.id!==t.id; });
  } else {
    t.stage = opt.next;
    t.next = S.turn + (opt.delay || 2);
  }
}
/* =========================================================================
   Section 21: Deal flow, ambitions, rivals, black swans
   ========================================================================= */
/*@table:DEAL_TYPES@*/
function genDeal(){
  const T = R.pick(DEAL_TYPES);
  const scale = Math.max(1, S.cumInfl);
  const base = 2500000 + Math.max(0, netWorth())*0.10;
  const capital = Math.round(base * T.capital * R.range(0.7,1.5) * scale);
  const c = pickInstigator();
  return {id:'dl'+(++S.seq), type:T.id, name:T.name, desc:T.desc,
    capital:capital, turns:T.turns, ret:T.ret, risk:T.risk,
    castId: c?c.id:null, via: c?c.name:null, expires:S.turn+4};
}
function refreshDeals(){
  const want = clamp(2 + Math.floor(S.p.rep/40) + (S.p.skills.network>60?1:0), 2, 4);
  while((S.deals||[]).length < want) S.deals.push(genDeal());
  S.deals = (S.deals||[]).filter(function(d){ return d.expires > S.turn; });
}
function takeDeal(id){
  const d = (S.deals||[]).find(function(x){ return x.id===id; }); if(!d) return false;
  if(S.fin.cash < d.capital){ toast('You need '+fmt(d.capital)+' for this. You have '+fmt(S.fin.cash)+'.'); return false; }
  S.fin.cash -= d.capital;
  S.deals = S.deals.filter(function(x){ return x.id!==id; });
  (S.active || (S.active=[])).push({id:'ac'+(++S.seq), type:d.type, name:d.name, capital:d.capital,
    turns:d.turns, ret:d.ret, risk:d.risk, due:S.turn+d.turns, castId:d.castId, via:d.via});
  log('invest','You committed '+fmt(d.capital)+' to: '+d.name+(d.via?' (introduced by '+d.via+')':'')+'.','warn');
  if(d.castId) relate(castOf(d.castId), 5, 'brought you a deal');
  return true;
}
function resolveDeals(){
  const out = [];
  (S.active||[]).slice().forEach(function(a){
    if(S.turn < a.due) return;
    S.active = S.active.filter(function(x){ return x.id!==a.id; });
    const T = DEAL_TYPES.find(function(x){ return x.id===a.type; }) || DEAL_TYPES[0];
    const win = R.chance(1 - a.risk);
    const gross = Math.round(a.capital * (1 + (win? a.ret : -R.range(0.45,0.95))));
    S.fin.cash += gross;
    const pl = gross - a.capital;
    log('invest', a.name+': '+(win?T.win:T.lose)+' '+fmt(gross)+' back on '+fmt(a.capital)+' ('+fmt(pl)+').', win?'good':'bad');
    out.push({name:a.name, win:win, pl:pl, text:(win?T.win:T.lose), via:a.via});
    if(a.castId) relate(castOf(a.castId), win?12:-16, win?'brought you a winner':'brought you a loser');
  });
  return out;
}

/* ------------------------------- Ambitions -------------------------------- */
/*@table:AMBITIONS@*/
function ambitionOf(){ return AMBITIONS.find(function(a){ return a.id===(S.ambition&&S.ambition.id); }) || null; }
function ambitionPct(){ const a = ambitionOf(); if(!a) return 0; return Math.round(clamp(a.check(S),0,1)*100); }

/* --------------------------------- Rival ---------------------------------- */
/*@table:RIVAL_NAMES@*/
function genRival(){
  const t = R.pick(BIZ);
  return {id:'rv'+(++S.seq), name:R.pick(RIVAL_NAMES)+' '+R.pick(['Group','Partners','Industries','Holdings','& Co']),
    type:t.id, size:R.int(20, 55), aggro:R.int(20,70), relation:R.int(20,60),
    founded:S.turn, lastMove:-99, moves:0, alive:true};
}
function stepRival(){
  const rv = S.rival; if(!rv) return null;
  const b = S.biz;
  rv.size = clamp(rv.size + R.gauss(1.1, 2.4) + (S.mkt.demand-1)*8, 0, 140);
  if(!b || S.turn - rv.lastMove < 8) return null;
  if(R.chance(0.16 + rv.aggro/220)){
    rv.lastMove = S.turn; rv.moves++;
    /* Poachers buy a track record, not a probationer. This used to pick any
       member of staff at random, so a rival would routinely hire away the
       person who had started that same quarter - before they had finished
       ramping, before they had produced anything, and after you had already
       paid a recruitment fee for them. */
    const poachable = (b.staff||[]).filter(function(x){
      return (S.turn - (x.joined||S.turn)) >= 3 && x.leaving === undefined;
    });
    const moves = ['undercut','poach','smear','copy','expand'];
    const m = R.weighted(moves, function(x){ return x==='undercut'? (rv.aggro/40) : x==='poach'? (poachable.length?2:0) : 1; }) || 'copy';
    const out = {move:m, rival:rv};
    if(m==='undercut'){ S.biz.rep = clamp(S.biz.rep-5,0,100); S.biz.cash -= Math.round(Math.max(200000, S.biz.revenue*0.10)*S.cumInfl);
      out.text = rv.name+' cut prices across the board. You matched them for a month before you realised what it was costing.'; }
    if(m==='poach' && poachable.length){ const s = R.pick(poachable); b.staff = b.staff.filter(function(x){ return x.id!==s.id; });
      out.text = rv.name+' hired '+s.name+' out from under you with a 40% raise and a car.'; out.poached = s; }
    if(m==='smear'){ S.biz.rep = clamp(S.biz.rep-8,0,100);
      out.text = 'A story about your business started circulating. Nobody can source it. Everybody has heard it.'; }
    if(m==='copy'){ S.biz.rep = clamp(S.biz.rep-2,0,100);
      out.text = rv.name+' launched a product that is your product with a different logo on it.'; }
    if(m==='expand'){ rv.size = clamp(rv.size+12,0,140);
      out.text = rv.name+' opened three new locations this quarter and put it in the trade press.'; }
    log('biz', out.text, 'warn'); relateRival(rv, -6, out.text);
    return out;
  }
  return null;
}
function relateRival(rv, d, note){ if(!rv) return; rv.relation = clamp(rv.relation+d,-100,100); }

/* ------------------------------ Black swans -------------------------------- */
/*@table:SWANS@*/
function maybeSwan(){
  if(S.turn < 8) return null;
  if(R.chance(0.028 * D().shock)){
    const sw = R.weighted(SWANS, function(x){ return x.w; });
    if(!sw) return null;
    sw.fx();
    log('macro', sw.head+'. '+sw.text, 'bad');
    pushNews(sw.head, 'bad');
    S.digest.push({turn:S.turn, kind:'swan', text:sw.head, tone:'bad'});
    return sw;
  }
  return null;
}

/* =========================================================================
   Section 18: Boot
   ========================================================================= */
