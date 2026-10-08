

/* =========================================================================
   Section 19: Eras — the decade you are actually living through
   ========================================================================= */
/*@table:ERAS@*/
function eraById(id){ return ERAS.find(function(e){ return e.id===id; }) || ERAS[0]; }
function initEra(){ return {id:'calm', start:0, end:R.int(8,14), prev:null}; }
function stepEra(){
  const e = S.era || (S.era = initEra());
  if(S.turn >= e.end){
    const pool = ERAS.filter(function(x){ return x.id!==e.id; });
    const nx = R.weighted(pool, function(x){ return x.w * (x.id==='calm'?1.4:1); }) || ERAS[0];
    const len = R.int(nx.len[0], nx.len[1]);
    e.prev = e.id; e.id = nx.id; e.start = S.turn; e.end = S.turn + len;
    log('macro', 'THE ' + nx.name.toUpperCase() + '. ' + nx.head, nx.tone==='bad'?'bad':nx.tone==='good'?'good':'warn');
    pushNews(nx.name+' begins', nx.tone);
    S.digest.push({turn:S.turn, kind:'era', text:nx.name+' — '+nx.head, tone:nx.tone});
  }
  return eraById(e.id);
}
function eraFx(key){ const f = eraById(S.era?S.era.id:'calm').fx; return f[key]||0; }

/* =========================================================================
   Section 20: Arcs — stories that take years to finish
   A thread is {id, arc, stage, next, castId, data}. Stages are functions that
   return an event object. Options may carry: next (stage index or 'end'),
   delay (quarters until the next beat), rel ({delta, note}) for the cast member.
   ========================================================================= */
function cn(t){ const c = castOf(t.castId); return c ? c.name : 'Your contact'; }
function naira(base){ return Math.round(base * S.cumInfl); }

/*@table:ARCS@*/

function closeBizSilent(bb){
  const b = bb || S.biz; if(!b) return;
  S.fin.cash += Math.max(0, Math.round(b.cash*0.8));
  S.flags.soldBiz = true; S.flags.hadBiz = true;
  dropBiz(b);
}
function sellBiz(b, price){
  if(!b) return 0;
  const mine = Math.round(price*(b.equity/100));
  S.fin.cash += mine;
  closeBizSilent(b);
  return mine;
}
function startArc(id, castId){
  const A = ARCS[id]; if(!A) return null;
  if((S.threads||[]).some(function(t){ return t.arc===id; })) return null;
  const t = {id:'t'+(++S.seq), arc:id, stage:0, next:S.turn+1, castId:castId||null, data:{}};
  if(castId){ const c=castOf(castId); if(c) c.lastAct = S.turn; }
  S.threads.push(t);
  S.flags['arc_'+id.replace(/^the/,'')] = true;
  const nm = castId ? (castOf(castId)||{}).name : null;
  log('life', '— ' + A.title + ' —' + (nm? ' (with '+nm+')':''), 'neutral');
  return t;
}
function maybeStartArc(){
  if((S.threads||[]).length >= 2) return null;
  if(S.turn < 3) return null;
  const pool = [];
  Object.keys(ARCS).forEach(function(id){
    const A = ARCS[id];
    if(S.flags['arc_'+id.replace(/^the/,'')]) return;
    if((S.threads||[]).some(function(t){ return t.arc===id; })) return;
    if(A.minTurn && S.turn < A.minTurn) return;
    if(A.cond && !A.cond(S)) return;
    pool.push({id:id, A:A});
  });
  if(!pool.length) return null;
  const pickd = R.weighted(pool, function(x){ return x.A.w; });
  if(!pickd) return null;
  // prefer attaching it to a cast member who fits
  let castId = null;
  if(pickd.A.cast){ const cands = castByRole(pickd.A.cast); if(cands.length) castId = R.pick(cands).id; }
  if(!castId){ const inst = pickInstigator(); if(inst) castId = inst.id; }
  return startArc(pickd.id, castId);
}
function pruneThreads(){
  (S.threads||[]).slice().forEach(function(t){
    const A = ARCS[t.arc];
    if(!A){ S.threads = S.threads.filter(function(x){ return x.id!==t.id; }); return; }
    if(A.needsBiz && !S.biz){ S.threads = S.threads.filter(function(x){ return x.id!==t.id; }); return; }
    if(A.minTurn && S.turn < A.minTurn){ S.threads = S.threads.filter(function(x){ return x.id!==t.id; }); return; }
    if(!A.stages[t.stage]){ S.threads = S.threads.filter(function(x){ return x.id!==t.id; }); return; }
  });
}
function dueThread(){
  pruneThreads();
  const list = (S.threads||[]).filter(function(t){ return t.next <= S.turn; });
  return list.length ? list[0] : null;
}