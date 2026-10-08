

/* =========================================================================
   Section 21d: Governance — the register, the board, the deed
   ========================================================================= */

/*@table:BOARD_ARCHETYPES@*/
function archOf(id){ return BOARD_ARCHETYPES.find(function(x){ return x.id===id; }) || BOARD_ARCHETYPES[0]; }

/*@table:RES_KINDS@*/

/* ------------------------------- the register ------------------------------ */

function ensureGov(b){
  if(!b) return;
  if(!b.shares) b.shares = [];
  if(!b.shares.length){
    const seed = Math.max(1, Math.round(((b.capex||0) + (b.cash||0)) || 1000000));
    b.shares.push({id:'h'+(++S.seq), name:(S.name||'You'), you:true, kind:'founder', cls:'Ordinary',
      shares:1000, paid:seed, price:Math.max(1,Math.round(seed/1000)), since:(b.foundedTurn||S.turn),
      pref:0, participate:false, antiDilute:'none', seniority:0, tag:true, drag:false,
      board:true, vested:true, trust:80, seat:true});
  }
  if(!b.board) b.board = [];
  if(!b.resolutions) b.resolutions = [];
  if(!b.inbound) b.inbound = [];
  if(!b.undertakings) b.undertakings = [];
  if(!b.dividends) b.dividends = [];
  if(!b.rounds) b.rounds = [];
  if(!b.const) b.const = {seats:1, chair:'you', casting:true, quorum:1, classic:'Ordinary'};
  if(!b.deed) b.deed = null;
  syncCapTable(b);
}
function totalShares(b){ return ((b&&b.shares)||[]).reduce(function(s,h){ return s+(h.shares||0); },0); }
function yourShares(b){ return ((b&&b.shares)||[]).filter(function(h){ return h.you; }).reduce(function(s,h){ return s+(h.shares||0); },0); }
function yourPct(b){ const t = totalShares(b); return t>0 ? yourShares(b)/t*100 : 100; }
function holderPct(b,h){ const t = totalShares(b); return t>0 ? (h.shares||0)/t*100 : 0; }
function holderById(b,id){ return ((b&&b.shares)||[]).find(function(h){ return h.id===id; }) || null; }
function extHolders(b){ return ((b&&b.shares)||[]).filter(function(h){ return !h.you; }); }
function syncCapTable(b){
  if(!b) return;
  if(!b.shares) b.shares = [];
  const t = totalShares(b);
  (b.shares||[]).forEach(function(h){ h.pct = t>0 ? (h.shares||0)/t*100 : 0; h.equity = Math.round(h.pct); });
  b.equity = Math.round(clamp(yourPct(b),0,100));
  const ext = extHolders(b).slice().sort(function(a,c){ return c.shares-a.shares; });
  b.externalPct = ext.reduce(function(s,h){ return s+(h.pct||0); },0);
  b.partner = ext.length ? ext[0] : null;
  const sd = b.const ? b.const.seats : 1;
  if(b.const) b.const.seats = Math.max(1, sd);
}
function addHolder(b, spec){
  ensureGov(b);
  const h = {id:'h'+(++S.seq), name:spec.name||'Investor', you:false, kind:spec.kind||'investor',
    cls:spec.cls||'Ordinary', shares:0, paid:0, price:0, since:S.turn, pref:spec.pref||0,
    participate:!!spec.participate, antiDilute:spec.antiDilute||'none', seniority:spec.seniority||1,
    tag:spec.tag!==false, drag:!!spec.drag, board:!!spec.board, vested:spec.vested!==false,
    trust:spec.trust===undefined?60:spec.trust, seat:!!spec.board, kindName:spec.kindName||'',
    roundLabel:spec.roundLabel||''};
  b.shares.push(h);
  return h;
}
/* Issue n new shares to holder h at price p. Returns the cash raised. */
function issueTo(b, h, n, p){
  ensureGov(b);
  n = Math.max(1, Math.round(n));
  const before = totalShares(b);
  h.shares = (h.shares||0) + n;
  h.paid = (h.paid||0) + Math.round(n*p);
  h.price = h.shares>0 ? (h.paid/h.shares) : p;
  const raised = Math.round(n*p);
  b.cash += raised;
  const after = totalShares(b);
  if(b.founderWarn===undefined) b.founderWarn = 0;
  if(before>0 && after>before*1.02) b.dilutionEvents = (b.dilutionEvents||0)+1;
  syncCapTable(b);
  return raised;
}
/* Grant targetPct of the post-issue company to a holder, creating one if needed. */
function grantPct(b, targetPct, spec){
  ensureGov(b);
  targetPct = clamp(targetPct, 0, 90);
  const T = totalShares(b) || 1000;
  const f = targetPct/100;
  let h = spec && spec.holderId ? holderById(b, spec.holderId) : null;
  if(!h){
    const name = (spec && spec.name) || R.pick(FIRST)+' '+R.pick(LAST);
    h = extHolders(b).find(function(x){ return x.name===name; }) ||
        addHolder(b, {name:name, kind:(spec&&spec.kind)||'investor', trust:(spec&&spec.trust)||58,
          board:!!(spec&&spec.board), pref:(spec&&spec.pref)||0, seniority:(spec&&spec.seniority)||1});
  }
  const need = Math.max(0, Math.round((f*T - (h.shares||0))/Math.max(0.001,(1-f))));
  let price;
  if(spec && spec.capital !== undefined && spec.capital !== null) price = Math.max(1, Math.round(spec.capital/Math.max(1,need)));
  else price = Math.max(1, Math.round(Math.max(1500000, bizValue(b))/Math.max(1,T)));
  const raised = issueTo(b, h, need, price);
  if(spec && spec.noCash) b.cash -= raised;
  if(spec && spec.capital !== undefined && spec.capital !== null) h.paid = Math.round(spec.capital);
  syncCapTable(b);
  return h;
}
/* Buy every external holder out at a negotiated multiple of their stake value. */
function buyoutExternal(b, premium){
  ensureGov(b);
  const v = Math.max(1000000, bizValue(b));
  const mine = yourShares(b);
  let cost = 0, list = extHolders(b).slice();
  list.forEach(function(h){ cost += Math.round(v*((h.pct||0)/100)*(premium||1.25)); });
  return {cost:cost, holders:list, value:v};
}
function doBuyoutExternal(b, premium){
  const q = buyoutExternal(b, premium);
  if(S.fin.cash < q.cost) return null;
  S.fin.cash -= q.cost;
  const names = q.holders.map(function(h){ return h.name; }).join(', ');
  b.shares = (b.shares||[]).filter(function(h){ return h.you; });
  (b.board||[]).forEach(function(d){ if(!d.yours) d.departing = S.turn; });
  b.board = (b.board||[]).filter(function(d){ return d.yours; });
  syncCapTable(b);
  return {cost:q.cost, names:names};
}

/* How the money from an exit actually splits. */
function optionDilution(b, gross){
  ensureGov(b);
  const T = Math.max(1, totalShares(b));
  const perShare = Math.max(0, gross)/T;
  let cost = 0; const lines = [];
  vestedOptions(b).forEach(function(o){
    const px = (o.st.options && o.st.options.strikePx) || 0;
    const sh = Math.round((o.pct/100)*T*(o.vested||0));
    const spread = Math.max(0, perShare - px) * sh;
    if(spread > 0){ cost += spread; lines.push({name:o.st.name, pct:o.pct, vested:o.vested, amt:Math.round(spread)}); }
  });
  return {cost:Math.round(cost), lines:lines, perShare:perShare};
}
function liquidationWaterfall(b, gross){
  ensureGov(b);
  const hs = (b.shares||[]).slice();
  let rem = Math.max(0, gross), rows = [];
  const OD = optionDilution(b, gross);
  if(OD.cost > 0){
    rem = Math.max(0, rem - OD.cost);
    OD.lines.forEach(function(l){
      rows.push({id:'opt_'+l.name, name:l.name+' (options)', you:false, opt:true,
        kind:pct(l.pct/100,2)+' granted, '+pct(l.vested,0)+' vested', amt:l.amt});
    });
  }
  const prefH = hs.filter(function(h){ return (h.pref||0)>0; })
                  .sort(function(a,c){ return (c.seniority||0)-(a.seniority||0); });
  prefH.forEach(function(h){
    const amt = Math.min(rem, Math.round((h.paid||0)*(h.pref||1)));
    rem -= amt; h._got = amt;
    rows.push({id:h.id, name:h.name, you:!!h.you, kind:'Preference '+(h.pref||1).toFixed(1)+'x on '+fmt(h.paid||0), amt:amt});
  });
  let base = hs.filter(function(h){ return (h.pref||0)<=0 || h.participate; });
  let convert = [];
  for(let guard=0; guard<8; guard++){
    const poolTot = base.reduce(function(s,h){ return s+h.shares; },0) + convert.reduce(function(s,h){ return s+h.shares; },0);
    const pot = rem + convert.reduce(function(s,h){ return s+(h._got||0); },0);
    const per = pot/Math.max(1,poolTot);
    let changed = false;
    prefH.forEach(function(h){
      if(h.participate || convert.indexOf(h)>=0) return;
      if(per*(h.shares||0) > (h._got||0) + 1){ convert.push(h); changed = true; }
    });
    if(!changed) break;
  }
  const finalPool = base.concat(convert);
  const finalShares = finalPool.reduce(function(s,h){ return s+(h.shares||0); },0) || 1;
  const pot = Math.max(0, rem + convert.reduce(function(s,h){ return s+(h._got||0); },0));
  finalPool.forEach(function(h){
    rows.push({id:h.id, name:h.name, you:!!h.you, kind:(h.pref>0&&h.participate)?'Participating':'Pro rata', amt:Math.round(pot*((h.shares||0)/finalShares))});
  });
  const tot = {};
  rows.forEach(function(r){ tot[r.id] = (tot[r.id]||0) + r.amt; });
  const mine = (b.shares||[]).filter(function(h){ return h.you; }).reduce(function(s,h){ return s + (tot[h.id]||0); },0);
  return {rows:rows, byHolder:tot, mine:Math.round(mine), gross:gross};
}

/* -------------------------------- the board -------------------------------- */

function genDirector(arcId, opts){
  opts = opts||{};
  const A = archOf(arcId);
  const d = {id:'d'+(++S.seq), name:opts.name || (R.pick(FIRST)+' '+R.pick(LAST)),
    arc:A.id, label:A.label, temper:A.temper, role:opts.role||'ned',
    holderId:opts.holderId||null, yours:!!opts.yours,
    shares:0, proxies:opts.proxies||0,
    loyalty:Math.round(clamp(R.gauss(opts.loyalty===undefined?56:opts.loyalty,11),10,94)),
    patience:Math.round(clamp(R.range(0.7,1.3)*100*(A.patience||0.8),10,100)),
    skill:{finance:R.int(28,92), ops:R.int(28,92), network:R.int(28,92), tech:R.int(28,92)},
    agenda:R.pickN(A.push,2), briefed:-99, fee:opts.fee||0, grudges:[], favours:0, since:S.turn,
    votesFor:0, votesAgainst:0, abstained:0, lastPaid:-99, consulting:0,
    plan:(A.id==='predator') ? {kind:'consolidate', at:S.turn+R.int(10,30)} : null,
    holderName:opts.holderName||''};
  d.skill[A.skill] = clamp(Math.max(d.skill[A.skill], R.int(62,95)), 0, 100);
  return d;
}
function boardOf(b){ return (b && b.board) || []; }
function directorById(b,id){ return boardOf(b).find(function(d){ return d.id===id; }) || null; }
function chairOf(b){ const c = boardOf(b).find(function(d){ return d.role==='chair'; }); return c || null; }
function seatEntitlement(b){
  const ext = b.externalPct||0;
  let n = 1;
  if(b.formal || ext>0) n = 3;
  if(ext>=28) n = 5;
  if(ext>=50) n = 7;
  return n;
}
function freeSeats(b){ return Math.max(0, seatEntitlement(b) - boardOf(b).filter(function(d){ return !d.departing; }).length); }

function formBoard(b, opts){
  opts = opts||{};
  ensureGov(b);
  b.const.seats = seatEntitlement(b);
  if(!boardOf(b).some(function(d){ return d.role==='chair'; })){
    const me = {id:'d'+(++S.seq), name:(S.name||'You'), arc:'founder', label:'Founder', temper:'yours',
      role:'chair', yours:true, holderId:null, shares:0, proxies:0, loyalty:100, patience:100,
      skill:{finance:(S.p.skills.finance||40), ops:(S.p.skills.ops||40), network:(S.p.skills.network||40), tech:(S.p.skills.tech||40)},
      agenda:[], briefed:S.turn, fee:0, grudges:[], favours:0, since:S.turn, votesFor:0, votesAgainst:0, abstained:0, lastPaid:S.turn, consulting:0, plan:null, holderName:''};
    b.board.push(me);
  }
  // any holder holding enough gets to name someone
  extHolders(b).forEach(function(h){
    if((h.pct||0) < 10) return;
    if((b.board||[]).some(function(d){ return d.holderId===h.id; })) return;
    if(freeSeats(b)<=0) return;
    const arc = h.kind==='family' ? 'family' : (h.kind==='strategic' ? 'predator' : (h.kind==='gov' ? 'nominee' : 'money'));
    const d = genDirector(arc, {holderId:h.id, holderName:h.name, role:'ned', fee:Math.round(180000*S.cumInfl*(0.6+ (h.pct||0)/60))});
    b.board.push(d);
    log('biz', h.name+' ('+Math.round(h.pct)+'%) has taken a seat on the board of '+b.name+' and nominated '+d.name+'.', 'warn');
  });
  syncCapTable(b);
  return b.board;
}
function boardSkill(b, key){
  const bd = boardOf(b).filter(function(d){ return !d.yours && !d.departing; });
  if(!bd.length) return 50;
  return bd.reduce(function(s,d){ return s + (d.skill[key]||0); },0)/bd.length;
}
function chairIsYours(b){ const c = chairOf(b); return !c || c.yours; }

/* ------------------------------- the deed ---------------------------------- */

function defaultDeed(b){
  return {formed:S.turn, signatories:['you'],
    preEmption:true, drag:false, dragPct:60, tag:true,
    deadlock:'mediation', quorum:2, chairCasting:true,
    reserved:['sell','raise','dissolve','acquire','related','deed','remove'],
    nonCompete:2, leaver:'goodbad', dividendPolicy:null, infoRights:'quarterly',
    shotgunUsed:false, shotgunCooldown:0, amended:0};
}
function deedOf(b){ ensureGov(b); if(!b.deed) b.deed = defaultDeed(b); return b.deed; }
function reservedMatter(b, kind){
  const dd = deedOf(b);
  return dd.reserved.indexOf(kind) >= 0;
}

/* ------------------------- momentum: what the board sees ------------------- */

function bizMomentum(b){
  const h = (b.history||[]).slice(-4);
  if(!h.length) return 0;
  const rp = h.map(function(x){ return x.revenue||0; });
  const pf = h.map(function(x){ return x.profit||0; });
  let g = 0;
  for(let i=1;i<rp.length;i++) g += (rp[i] >= rp[i-1]*1.02 ? 1 : (rp[i] < rp[i-1]*0.98 ? -1 : 0));
  g = g/Math.max(1,(rp.length-1));
  const last = pf[pf.length-1]||0, first = pf[0]||0;
  const profiting = last > 0 ? 1 : -1;
  const improving = pf.length>1 ? (last > first ? 0.55 : -0.45) : 0;
  return clamp(g*0.60 + profiting*0.50 + improving*0.45, -1.4, 1.4);
}

/* ------------------------------- resolutions -------------------------------- */

function resMeta(kind){ return RES_KINDS[kind] || {label:kind, cls:'board', thr:'ordinary', reserved:false}; }

function openResolution(b, kind, data, proposer){
  ensureGov(b);
  formBoard(b);
  const meta = resMeta(kind);
  const res = {id:'r'+(++S.seq), kind:kind, cls:meta.cls, thr:meta.thr,
    data:data||{}, proposer:proposer||'you', turn:S.turn, lobby:{}, status:'open',
    youWant:(proposer==='you'),
    briefed:false, called:false};
  b.resolutions.push(res);
  return res;
}
function openResolutions(b){ return ((b&&b.resolutions)||[]).filter(function(r){ return r.status==='open'; }); }

function dirVotes(b, d){
  let v = (d.proxies||0);
  if(d.holderId){ const h = holderById(b, d.holderId); if(h) v += (h.shares||0); }
  if(d.yours) v += yourShares(b);
  return v;
}
function shareVotes(b){
  return totalShares(b);
}

function dirStance(b, d, res){
  const A = archOf(d.arc);
  let s = -3;                                     /* directors arrive sceptical, not supportive */
  const reasons = [];
  const aligned  = (A.push||[]).indexOf(res.kind) >= 0;
  const onAgenda = (d.agenda||[]).indexOf(res.kind) >= 0;
  const isCoup   = (res.kind==='removeceo' || res.kind==='fireceo');
  const youWant  = (res.youWant !== false);
  if(d.yours){
    const v = isCoup ? 'against' : (youWant ? 'for' : 'against');
    return {vote:v, score:(v==='for'?100:-100), reasons:[isCoup?'it is you':'it is your own resolution']};
  }
  if(isCoup){
    /* loyalty and patience are loyalty to YOU, so on a motion to remove you they invert */
    s += (55 - (d.loyalty||50))*1.05;
    s += (55 - (d.patience||50))*0.30;
    if((d.loyalty||50) < 34) reasons.push('they stopped believing in you some time ago');
    if((d.loyalty||50) > 72) reasons.push('they are not going to be part of this');
    s -= (yourPct(b) - 50)*0.40;                 /* a big founder stake is hard to vote away */
  } else {
    if(aligned && onAgenda){ s += 34; reasons.push('it is precisely what they came here for'); }
    else if(aligned){ s += 26; reasons.push('this is their kind of decision'); }
    else if(onAgenda){ s += 14; reasons.push('it is on their list this year'); }
    else { s -= 9; reasons.push('it is not what they are here for'); }
    s += (d.loyalty - 55)*0.62;
    if(d.loyalty<34) reasons.push('they have stopped believing in you');
    if(d.loyalty>72) reasons.push('they are with you almost regardless');
    s += (d.patience - 55)*0.24;
    if(d.patience<26) reasons.push('patience is gone');
    if(res.proposer !== 'you'){
      s += (youWant ? 13 : -8);
      reasons.push(youWant ? 'it is not your idea' : 'you have asked them to vote it down');
    }
  }
  if(d.briefed >= S.turn-1){
    s += (youWant?1:-1) * (10 + (S.p.skills.network||30)*0.20);
    reasons.push('you briefed them properly');
  }
  s -= (d.grudges||[]).length*13;
  if((d.grudges||[]).length) reasons.push('there are old scores');
  let mom = bizMomentum(b);
  const _pv = planVariance(b);
  if(_pv) mom = clamp(mom*0.45 + planGrade(b)*0.95, -1.5, 1.5);
  if(isCoup){
    s += mom < -0.45 ? 20 : (mom < 0 ? 6 : -18);
    if(mom < -0.45) reasons.push('they can justify it on the numbers, and say so out loud');
    else if(mom >= 0) reasons.push('they cannot justify it on the numbers');
  } else {
    s += mom*24;
    if(mom > 0.40) reasons.push('the numbers are going the right way');
    if(mom < -0.40) reasons.push('the numbers are going the wrong way');
  }
  if(res.kind==='dividend'){
    if((b.profit||0)<=0){ s -= 52; reasons.push('there is no profit to distribute'); }
    if((b.cash||0) < (b.payable||0)){ s -= 24; reasons.push('payables are already stretched'); }
    if(A.id==='money') s += 22;
  }
  if(res.kind==='sell' || res.kind==='force'){
    if(A.id==='predator') s += 44;
    const bd = (b.inbound||[]).find(function(x){ return x.id===(res.data&&res.data.bidId); });
    if(bd && d.holderId){
      const ratio = bidHead(bd)/Math.max(1, bizValue(b));
      s += clamp((ratio-1.15)*95, -75, 30);
      if(ratio<0.98) reasons.push('the price is not a number they will vote for');
      if(ratio>1.35) reasons.push('the price is better than they expected');
    }
  }
  if((res.kind==='raise') && d.holderId){
    const v = Math.max(1, bizValue(b));
    const implied = (res.data&&res.data.amount ? res.data.amount : v*0.2) / Math.max(0.01, ((res.data&&res.data.pct)||20)/100);
    s += clamp((implied/v - 1)*90, -70, 30);
    if(implied < v*0.8) reasons.push('you are selling the company cheap and they can do the arithmetic');
    if(!deedOf(b).preEmption) s -= 12;
  }
  if(res.kind==='raise' && (b.profit||0)<0 && A.id!=='predator') s -= 12;
  if(res.kind==='related' && A.id!=='family') s -= 22;
  if(res.kind==='audit' && A.id==='family') s -= 22;
  if(res.kind==='expand' && A.id==='operator') s += 26;
  if(res.kind==='acquire' && A.id==='connector') s += 24;
  if(res.kind==='borrow'){ if(A.id==='money') s += 8; if(A.id==='pro') s -= 14; }
  if(res.kind==='reserve' && (A.id==='money'||A.id==='family')) s -= 20;
  const lob = (res.lobby||{})[d.id];
  if(lob){
    s += (youWant ? 1 : -1) * (lob.push||0);
    if(lob.mode==='pay') reasons.push('there is a consulting fee on the table');
    if(lob.mode==='concede') reasons.push('you made them a promise');
    if(lob.mode==='equity') reasons.push('you gave them a piece of your own');
    if(lob.mode==='pressure') reasons.push('they would rather not be on the wrong side of this');
    if(lob.mode==='favour') reasons.push('somebody they owe something to called them');
  }
  if(d.departing) s -= 30;
  let vote = s > 6 ? 'for' : (s < -6 ? 'against' : 'abstain');
  return {vote:vote, score:Math.round(s), reasons:reasons.slice(0,2)};
}

function whipCount(b, res){
  ensureGov(b);
  const bd = boardOf(b).filter(function(d){ return !d.departing; });
  const tot = Math.max(1, totalShares(b));
  let f=0, a=0, ab=0;
  const rows = bd.map(function(d){
    const st = dirStance(b, d, res);
    const w = dirVotes(b, d);
    if(st.vote==='for') f += (res.cls==='shareholder' ? w : 1);
    else if(st.vote==='against') a += (res.cls==='shareholder' ? w : 1);
    else ab += (res.cls==='shareholder' ? w : 1);
    return {d:d, st:st, w:w, holder:false};
  });
  /* holders with no seat vote their own paper, on trust and on self-interest */
  const seen = {};
  bd.forEach(function(d){ if(d.holderId) seen[d.holderId] = true; });
  (b.shares||[]).forEach(function(h){
    if(h.you || seen[h.id]) return;
    const t = (h.trust===undefined) ? 55 : h.trust;
    let align = (res.proposer==='you') ? (t-52) : (48-t);
    if(res.kind==='sell' || res.kind==='force'){
      const bd = (b.inbound||[]).find(function(x){ return x.id===(res.data&&res.data.bidId); });
      align += bd ? clamp((bidHead(bd)/Math.max(1,bizValue(b)) - 1.1)*70, -45, 30) : 12;
    }
    if(res.kind==='raise' || res.kind==='dilute'){
      const v = Math.max(1, bizValue(b));
      const implied = (res.data&&res.data.amount ? res.data.amount : v*0.2) / Math.max(0.01, ((res.data&&res.data.pct)||20)/100);
      align += clamp((implied/v - 1)*80, -50, 26) - (deedOf(b).preEmption ? 0 : 14);
    }
    if(res.kind==='dividend') align += 14;
    const vote = align > 10 ? 'for' : (align < -10 ? 'against' : 'abstain');
    const w = (h.shares||0);
    if(res.cls!=='shareholder') return;          /* no seat, no vote on board business */
    if(vote==='for') f += w; else if(vote==='against') a += w; else ab += w;
    rows.push({d:{id:h.id, name:h.name, yours:false, arc:'holder', label:'Shareholder'}, holder:true, w:w,
      st:{vote:vote, score:Math.round(align), reasons:[(t>62?'they trust you':(t<38?'they do not trust you':'they are undecided'))]}});
  });
  const denom = res.cls==='shareholder' ? tot : Math.max(1, bd.length);
  return {rows:rows, for:f, against:a, abstain:ab, denom:denom,
    pctFor:denom? f/denom*100 : 0, need:(res.thr==='special'?75:(res.thr==='unanimous'?100:50)),
    chair:chairIsYours(b) && (b.const.casting!==false)};
}
function callVote(b, rid){
  const res = ((b&&b.resolutions)||[]).find(function(r){ return r.id===rid; });
  if(!res || res.status!=='open') return null;
  const w = whipCount(b, res);
  let f = w.for, a = w.against;
  if(w.chair && f===a) f += 0.5;             // chair's casting vote
  let passed;
  if(res.thr==='special') passed = (f/Math.max(1,totalShares(b))) >= 0.75;
  else if(res.cls==='shareholder') passed = (f/Math.max(1,totalShares(b))) > 0.5;
  else passed = (f > a) && (f >= Math.max(1, Math.min(w.rows.length, (b.const.quorum||1))));
  if(w.denom===0) passed = true;
  // record
  w.rows.forEach(function(r){
    const d = r.d;
    if(d.yours) return;
    if(r.st.vote==='for') d.votesFor=(d.votesFor||0)+1;
    else if(r.st.vote==='against') d.votesAgainst=(d.votesAgainst||0)+1;
    else d.abstained=(d.abstained||0)+1;
    if(res.proposer==='you' && r.st.vote==='for') d.patience = clamp((d.patience||50)-4,0,100);
    if(res.proposer==='you' && r.st.vote==='against') d.patience = clamp((d.patience||50)+3,0,100);
    if(r.st.vote!=='for') d.loyalty = clamp((d.loyalty||50)-2,0,100);
  });
  res.status = passed ? 'passed' : 'lost';
  res.called = S.turn;
  res.result = {for:Math.round(w.for), against:Math.round(w.against), abstain:Math.round(w.abstain), denom:Math.round(w.denom)};
  const out = executeResolution(b, res, passed);
  b.resolutions = (b.resolutions||[]).filter(function(r){ return r.id!==rid; });
  UI.modal = {type:'govvote', biz:b.id, res:res, passed:passed, whip:w, out:out};
  return out;
}

function executeResolution(b, res, passed){
  const d = res.data||{};
  const note = [];
  if(res.kind==='dividend'){
    if(passed && (d.amt||0)>0){
      const amt = Math.min(d.amt, Math.max(0, b.cash));
      b.cash -= amt;
      (b.shares||[]).forEach(function(h){
        const their = Math.round(amt*((h.pct||0)/100));
        if(h.you) S.fin.cash += their;
        else { h.trust = clamp((h.trust||50)+7,0,100); }
      });
      b.dividends.push({turn:S.turn, amt:amt});
      (b.board||[]).forEach(function(x){ if(!x.yours){ x.patience = clamp((x.patience||50)+26,0,100); x.loyalty = clamp((x.loyalty||50)+5,0,100);} });
      note.push('A distribution of '+fmt(amt)+' was declared and paid.');
      log('biz','The board declared '+fmt(amt)+'. Your share arrived after withholding.','good');
    } else {
      (b.board||[]).forEach(function(x){ if(!x.yours){ x.patience = clamp((x.patience||50)-14,0,100);} });
      note.push('The distribution was voted down. Every director who wanted cash became less patient.');
      log('biz','The board refused the distribution. The people who wanted cash did not hide it.','warn');
    }
  }
  else if(res.kind==='raise'){
    if(passed){
      const amount = d.amount||0, pctGive = d.pct||20, pref = d.pref===undefined?1:d.pref;
      const h = grantPct(b, pctGive, {name:d.name, kind:'investor', board:d.board!==false,
        pref:pref, participate:!!d.participate, seniority:(b.rounds.length+1), trust:62,
        roundLabel:d.roundLabel||'Round'});
      h.pref = pref; h.participate = !!d.participate; h.antiDilute = d.antiDilute||'none';
      h.roundLabel = d.roundLabel||'Round';
      b.rounds.push({turn:S.turn, name:h.name, pct:pctGive, amount:amount, pref:pref, label:d.roundLabel||'Round'});
      formBoard(b);
      note.push(h.name+' subscribed '+fmt(amount)+' for '+Math.round(holderPct(b,h))+'%. The company now has other people in it.');
      log('biz','Round closed: '+h.name+' took '+Math.round(holderPct(b,h))+'% of '+b.name+' for '+fmt(amount)+'.','good');
    } else {
      note.push('The raise was blocked. The money is not coming and the plan has to be rewritten.');
      log('biz','The board blocked the raise. Whatever that money was for, it now has to wait.','warn');
    }
  }
  else if(res.kind==='sell' || res.kind==='force'){
    if(passed){
      const bid = (b.inbound||[]).find(function(x){ return x.id===d.bidId; }) || (b.inbound||[])[0];
      note.push('The sale was approved. Completion follows due diligence.');
      if(bid){ completeSale(b, bid); }
      else { S._forceSale = b.id; }
    } else {
      note.push('The sale was voted down. Whoever wanted out now knows who stopped them.');
      if(d.proposer!=='you') (b.board||[]).forEach(function(x){ if(!x.yours){ x.loyalty = clamp((x.loyalty||50)-9,0,100); x.grudges.push('blocked an exit at '+dateLabel(S.turn));} });
      log('biz','The board voted the sale down. Somebody in that room wanted liquidity and will remember.','warn');
    }
  }
  else if(res.kind==='removeceo' || res.kind==='fireceo'){
    if(passed){
      b.md = d.md || null;
      b.founderOusted = true;
      if(b.chairLoss===undefined) b.chairLoss = S.turn;
      (b.board||[]).forEach(function(x){ if(x.role==='chair' && x.yours){ x.role='ned'; } });
      if(!boardOf(b).some(function(x){ return x.role==='chair' && !x.yours; })){
        const nd = boardOf(b).filter(function(x){ return !x.yours; })[0];
        if(nd) nd.role = 'chair';
      }
      const md = d.md || {name:'a professional', skill:62, salary:Math.round(900000*S.cumInfl)};
      b.md = md;
      note.push('You are no longer the managing director. '+md.name+' is. You still own '+Math.round(yourPct(b))+'%, which is not the same thing as control.');
      log('biz','The board removed you as managing director of '+b.name+'. '+md.name+' takes over. You keep the shares.','bad');
      S.p.stress = clamp(S.p.stress+16,0,100); S.p.happy = clamp(S.p.happy-14,0,100);
      S.p.rep = clamp(S.p.rep-8,0,100);
    } else {
      note.push('You survived the vote. The people who moved against you are still on the board.');
      (b.board||[]).forEach(function(x){ if(!x.yours){ x.loyalty = clamp((x.loyalty||50)-12,0,100); x.grudges.push('survived a vote they called');} });
      log('biz','The motion to remove you failed. It failed narrowly, and everyone in the room counted.','warn');
    }
  }
  else if(res.kind==='ceo'){
    if(passed){
      const md = d.md; b.md = md;
      note.push(md.name+' was appointed managing director at '+fmt(md.salary)+' a quarter. You buy back your own time and give up the last word on how it is spent.');
      log('biz','You hired '+md.name+' to run '+b.name+'. It costs '+fmt(md.salary)+' a quarter.','neutral');
    } else {
      note.push('The board would not fund a managing director. You are still the one doing it.');
    }
  }
  else if(res.kind==='audit'){
    if(passed || res.proposer!=='you'){
      const found = [];
      if((b.compliance||0)<52) found.push('unreconciled cash sales');
      if((b.taxRisk||0)>25) found.push('understated tax');
      if((b.relatedParty||0)>0) found.push('contracts with companies you also own');
      if((b.draw||0)>0 && (b.profit||0)<0) found.push('drawings taken against a loss');
      const cost = Math.round(700000*S.cumInfl);
      b.cash -= cost;
      b.audited = S.turn;
      if(found.length){
        b.compliance = clamp((b.compliance||40)+18,0,100);
        b.diag.push({level:'bad', text:'Forensic audit found: '+found.join(', ')+'.'});
        S.p.rep = clamp(S.p.rep-6,0,100);
        note.push('The audit cost '+fmt(cost)+' and found: '+found.join('; ')+'. It is in the file now, permanently.');
        log('biz','The audit found '+found.length+' thing(s) nobody had written down. It cost '+fmt(cost)+'.','bad');
      } else {
        b.compliance = clamp((b.compliance||40)+10,0,100);
        note.push('The audit cost '+fmt(cost)+' and found nothing. The cleanest possible outcome, and the most expensive.');
        log('biz','The forensic audit found nothing. '+fmt(cost)+' for a clean file.','neutral');
      }
    } else note.push('The audit was voted down. Whatever is in the books stays in the books.');
  }
  else if(res.kind==='dilute'){
    if(passed){
      const need = d.amount||0;
      const h = grantPct(b, d.pct||20, {name:d.name||'the existing investors', kind:'investor', board:true, pref:1, seniority:9, trust:40});
      b.cash += need;
      note.push('The company was funded without you. '+h.name+' now holds '+Math.round(holderPct(b,h))+'% and you did not buy any of it.');
      log('biz','The board funded '+b.name+' over your head. You were diluted to '+Math.round(yourPct(b))+'%.','bad');
    } else {
      b.cash += (d.own||0);
      S.fin.cash -= (d.own||0);
      note.push('You funded it yourself to avoid the dilution. That money came out of your pocket, not the company\u2019s.');
    }
  }
  else if(res.kind==='acquire'){
    if(passed && d.targetId){
      const t = (S.mkt.targets||[]).find(function(x){ return x.id===d.targetId; });
      if(t) note.push(absorbTarget(b, t, d.price||t.asking, d.finance||'cash') || 'The acquisition completed.');
    } else note.push('The acquisition was blocked.');
  }
  else if(res.kind==='deed'){
    if(passed && d.key){
      const dd = deedOf(b); dd[d.key] = d.value; dd.amended = (dd.amended||0)+1;
      note.push('The shareholders\u2019 agreement was amended: '+d.label+'.');
      log('biz','The shareholders\u2019 agreement changed. '+d.label+'.','neutral');
    } else note.push('The amendment failed. The old agreement stands.');
  }
  else if(res.kind==='expand'){
    if(passed && d.cost){ b.cash -= d.cost; b.capex = (b.capex||0)+Math.round(d.cost*0.8); note.push('The board approved '+fmt(d.cost)+' of capital spending.'); }
    else note.push('The capital commitment was refused.');
  }
  else if(res.kind==='borrow'){
    if(passed && d.amount){
      b.cash += d.amount; b.debt = (b.debt||0)+d.amount;
      const pkg = facilityPackage(b, d.amount);
      note.push('The company borrowed '+fmt(d.amount)+'. It came with '+pkg.length+' covenant(s): '+
        pkg.map(function(c){ return (COVENANT_KINDS[c.kind]||{label:c.kind}).label+' at '+c.limit.toFixed(1); }).join(', ')+'.');
      log('biz','The facility on '+b.name+' is subject to '+pkg.length+' financial covenant(s). They are tested every quarter.','warn');
    }
    else note.push('The borrowing was refused.');
  }
  else if(res.kind==='plan'){
    if(passed){
      b.plan = Object.assign({}, d.plan||{}, {status:'approved', turn:S.turn});
      note.push('The operating plan was approved. You will be measured against it, quarterly, by people who wrote the numbers down.');
      log('biz','The board approved the operating plan for '+b.name+': '+fmt((d.plan||{}).revenue||0)+' of revenue at '+((d.plan||{}).gm||0)+'% gross margin.','neutral');
    } else {
      b.plan = Object.assign({}, d.plan||{}, {status:'rejected', turn:S.turn});
      note.push('The plan was rejected. Go back with different numbers, or go back with a better argument.');
      (b.board||[]).forEach(function(x){ if(!x.yours){ x.patience = clamp((x.patience||50)-8,0,100); } });
    }
  }
  else if(res.kind==='pool'){
    if(passed){
      const r = topUpPool(b, d.target||10);
      note.push('The pool was topped up to '+pct(d.target||10,0)+'. '+fmt(0)+
        (r? ' It diluted every existing holder, you most of all.':''));
      log('biz','The option pool at '+b.name+' was increased to '+pct(d.target||10,0)+'. The dilution lands on the founder.','warn');
      extHolders(b).forEach(function(h){ h.trust = clamp((h.trust||50)+8,0,100); });
    } else note.push('The pool top-up was refused. Whoever asked for it will ask again at the next round.');
  }
  else if(res.kind==='reserve'){
    note.push(passed ? 'Profit is being retained. Directors who wanted cash are not thrilled.' : 'The reserve policy was rejected.');
  }
  else if(res.kind==='related'){
    if(passed){ b.relatedParty = (b.relatedParty||0)+1; note.push('The related-party contract was approved, and minuted.'); }
    else { note.push('The related-party contract was refused.'); (b.board||[]).forEach(function(x){ if(!x.yours) x.grudges.push('blocked their related-party contract'); }); }
  }
  else if(res.kind==='dissolve'){
    if(passed){ closeBiz('The shareholders voted to wind it up.', b); note.push('The company is being wound up.'); }
    else note.push('Winding up was refused. It continues.');
  }
  else if(res.kind==='draw'){
    if(passed){ b.drawCap = d.cap; note.push('Owner drawings are now capped at '+fmt(d.cap)+' a quarter.'); }
    else note.push('The cap on drawings was rejected.');
  }
  else if(res.kind==='appoint'){
    if(passed && d.dirId){ const nd = genDirector(d.arc||'pro', {fee:Math.round(200000*S.cumInfl)}); if(d.name) nd.name=d.name; b.board.push(nd); note.push(nd.name+' joined the board.'); }
    else note.push('The appointment was rejected.');
  }
  else if(res.kind==='remove'){
    if(passed && d.dirId){
      const dd = directorById(b, d.dirId);
      b.board = (b.board||[]).filter(function(x){ return x.id!==d.dirId; });
      if(dd){ const hd = holderById(b, dd.holderId||''); if(hd) hd.trust = clamp((hd.trust||50)-28,0,100); }
      const hd2 = holderById(b, d.dirId||'');
      note.push('Removed from the board. Their side of the register will not forget it.');
    } else note.push('The removal failed. They are still there, and now they know you tried.');
  }
  else note.push(passed ? 'Carried.' : 'Lost.');
  return note.join(' ');
}

/* -------------------------------- lobbying ---------------------------------- */

/*@table:LOBBY_MODES@*/
function lobbyDirector(b, res, dirId, mode){
  const d = directorById(b, dirId);
  if(!d || !res) return 'Nothing happened.';
  const prior = res.lobby[dirId];
  const decay = prior ? ([1, 0.60, 0.32][Math.min(2, prior.n||1)]) : 1;
  if(prior && (prior.n||1) >= 3) return 'You have already worked '+d.name+' over three times on this one. They are beginning to enjoy it.';
  const M = LOBBY_MODES[mode]; if(!M) return 'Nothing happened.';
  let push = M.push * decay, msg = '';
  if(mode==='brief'){
    const nk = S.p.skills.network||30;
    push = 8 + nk*0.30;
    d.briefed = S.turn;
    d.loyalty = clamp(d.loyalty + 4 + nk*0.06, 0, 100);
    msg = 'You spent the evening with '+d.name+'. They now understand what you are actually asking for'+
          (nk>60?', and you read them well enough to know which argument landed.':', which is more than they did this morning.');
  }
  else if(mode==='concede'){
    const pick = R.pick([
      {k:'reporting', text:'monthly management accounts within ten days of month end'},
      {k:'dividend',  text:'a distribution at the next profitable year end'},
      {k:'seat',      text:'a second seat for their side at the next AGM'},
      {k:'audit',     text:'an external audit of the current financial year'},
      {k:'cap',       text:'a hard cap on your monthly drawings'}]);
    b.undertakings.push({id:'u'+(++S.seq), kind:pick.k, text:pick.text, dirId:d.id, dirName:d.name,
      due:S.turn + 4, made:S.turn, done:false, broken:false});
    d.loyalty = clamp(d.loyalty + 9, 0, 100);
    push = M.push;
    msg = 'You promised '+d.name+' '+pick.text+'. It is minuted. Four quarters.';
  }
  else if(mode==='pay'){
    if(S.fin.cash < M.cost) return 'You do not have '+fmt(M.cost)+' in personal cash.';
    S.fin.cash -= M.cost;
    d.consulting = (d.consulting||0) + M.cost;
    push = M.push;
    b.compliance = clamp((b.compliance||40) - 5, 0, 100);
    if(R.chance(0.16)){ S.flags.consultingTrail = true;
      msg = 'The fee was arranged. It went through a company you also own, which is exactly the kind of thing an audit finds.'; }
    else msg = 'A consulting fee of '+fmt(M.cost)+' was arranged through a third party. It works, and it is on a piece of paper somewhere.';
  }
  else if(mode==='equity'){
    const me = (b.shares||[]).find(function(h){ return h.you; });
    if(!me || (me.shares||0) < 40) return 'You have nothing left to give away.';
    const give = Math.max(10, Math.round((me.shares||0)*0.02));
    me.shares -= give;
    let h = extHolders(b).find(function(x){ return x.name===d.name; });
    if(!h) h = addHolder(b, {name:d.name, kind:'insider', board:true, trust:70, seniority:0});
    h.shares += give;
    d.holderId = h.id; d.holderName = h.name;
    d.loyalty = clamp(d.loyalty + 20, 0, 100);
    d.patience = clamp(d.patience + 18, 0, 100);
    push = M.push;
    syncCapTable(b);
    msg = 'You moved '+pct(give/Math.max(1,totalShares(b)),1)+' of your own holding to '+d.name+'. They are now an owner in their own right.';
  }
  else if(mode==='pressure'){
    const nr = (S.negRep===undefined?55:S.negRep);
    push = 6 + nr*0.34;
    d.loyalty = clamp(d.loyalty - 12, 0, 100);
    d.grudges.push('you leaned on them at '+dateLabel(S.turn));
    S.negRep = clamp((S.negRep===undefined?55:S.negRep) - 2, 0, 100);
    msg = 'You made it clear what happens to people who vote the wrong way. '+d.name+' will vote with you. They will not forget how it happened.';
  }
  else if(mode==='favour'){
    if((S.stand.network||0) < 1 || (S.p.skills.network||0) < 45) return 'Nobody who owes you anything has enough pull here.';
    S.stand.network = Math.max(0, (S.stand.network||0) - 1);
    push = M.push;
    msg = 'You called someone '+d.name+' owes. The call lasted four minutes.';
  }
  res.lobby[dirId] = {mode:mode, push:Math.round(push), n:(prior ? (prior.n||1)+1 : 1)};
  return msg;
}

/* ----------------------------- inbound bids --------------------------------- */

/*@table:BID_BUYERS@*/
function genInboundBid(b, force){
  ensureGov(b);
  if(!force && (b.revenue||0) < 4000000 && (b.profit||0) <= 0) return null;
  const v = Math.max(2000000, bizValue(b));
  const buyer = R.pick(BID_BUYERS);
  const mom = clamp(bizMomentum(b), -0.9, 0.9);
  const head = Math.round(v * buyer.mult * R.range(0.85,1.18) * (1 + mom*0.22) * (0.85 + (b.rep||45)/380));
  let cashPct = R.range(0.45, 0.85);
  const earn = R.chance(0.45) ? R.range(0.10, 0.30) : 0;
  const def = R.range(0.05, 0.20);
  const rest = Math.max(0, 1 - cashPct - earn - def);
  const bd = {id:'bid'+(++S.seq), buyer:buyer.k, from:buyer.name, head:head,
    cash:Math.round(head*cashPct), deferred:Math.round(head*def), earnout:Math.round(head*earn), swap:Math.round(head*rest),
    cond:buyer.cond.slice(0, R.int(1, buyer.cond.length)), expires:S.turn + R.int(2,4),
    dd:0, chip:0, gaming: R.chance(0.3), exclusivity:false, escrow: R.chance(0.4) ? Math.round(head*R.range(0.06,0.14)) : 0,
    nonCompete: R.chance(0.5) ? R.int(1,3) : 0, status:'live', arrived:S.turn};
  b.inbound.push(bd);
  return bd;
}
function bidHead(bd){ return Math.max(0, (bd.head||0) - (bd.chip||0)); }
function runDiligence(b, bidId){
  const bd = (b.inbound||[]).find(function(x){ return x.id===bidId; }); if(!bd) return 'No such offer.';
  if(bd.dd >= 2) return 'Their diligence is already finished.';
  bd.dd += 1;
  let chip = 0, found = [];
  if((b.compliance||0) < 50){ chip += R.range(0.04,0.10); found.push('unreconciled cash sales'); }
  if((b.taxRisk||0) > 22){ chip += R.range(0.03,0.09); found.push('an unresolved tax position'); }
  if((b.recv||0) > (b.revenue||1)*0.45){ chip += R.range(0.03,0.07); found.push('a receivables book older than the year'); }
  if(((b.incidents||[]).filter(function(i){ return i.turns>0; })).length){ chip += R.range(0.02,0.06); found.push('an unresolved incident'); }
  if((b.keyClient||null) && (b.keyClient.share||0) > 0.3){ chip += R.range(0.03,0.08); found.push('customer concentration'); }
  if(bd.dd===2){
    bd.chip = Math.round((bd.head||0)*Math.min(0.34, chip));
    if(!found.length) return 'Their diligence came back clean. Nothing to chip you for.';
    return 'Diligence found '+found.join(', ')+'. They have reduced the headline by '+fmt(bd.chip)+'.';
  }
  return found.length ? 'First pass flagged '+found.join(', ')+'. They are still counting.' : 'First pass came back clean.';
}
function completeSale(b, bd){
  if(!S.escrows) S.escrows = [];
  if(!S.earnouts) S.earnouts = [];
  const gross = bidHead(bd);
  const w = liquidationWaterfall(b, gross);
  const escrow = bd.escrow||0;
  const cashNow = Math.round((w.mine) * (1 - (escrow/Math.max(1,gross))) * (1 - ((bd.deferred||0)+(bd.earnout||0))/Math.max(1,gross)));
  const tax = Math.round(w.mine * 0.10 * (1.4 - (b.compliance||40)/100));
  S.fin.cash += Math.max(0, cashNow - tax);
  if(escrow>0) S.escrows = (S.escrows||[]).concat([{id:'e'+(++S.seq), amt:Math.round(escrow*(w.mine/Math.max(1,gross))), due:S.turn+6, name:b.name}]);
  if((bd.earnout||0)>0) S.earnouts = (S.earnouts||[]).concat([{id:'n'+(++S.seq), amt:Math.round((bd.earnout||0)*(w.mine/Math.max(1,gross))), left:8, per:Math.round((bd.earnout||0)*(w.mine/Math.max(1,gross))/8), gaming:bd.gaming, name:b.name, from:bd.from}]);
  if((bd.deferred||0)>0) S.escrows.push({id:'e'+(++S.seq), amt:Math.round((bd.deferred||0)*(w.mine/Math.max(1,gross))), due:S.turn+4, name:b.name});
  if(bd.nonCompete) S.flags.nonCompeteUntil = S.turn + bd.nonCompete*4;
  S.flags.soldBiz = true; S.flags.exits = (S.flags.exits||0)+1;
  S.p.skills.finance = clamp(S.p.skills.finance + 4, 0, 100);
  S.p.skills.network = clamp(S.p.skills.network + 2, 0, 100);
  log('biz','Completed: '+b.name+' sold to '+bd.from+' for a headline '+fmt(bd.head)+'. Your share after the preference stack, escrow and tax: '+fmt(cashNow-tax)+'.','good');
  dropBiz(b);
  return 'Sale completed.';
}
function stepEarnouts(){
  (S.earnouts||[]).forEach(function(e){
    e.left -= 1;
    let pay = e.per;
    if(e.gaming && R.chance(0.34)){ pay = 0; log('biz','The earnout from '+e.name+' paid nothing this quarter. Their finance director has found a definition of profit that excludes you.','bad'); }
    else if(R.chance(0.12)){ pay = Math.round(e.per*R.range(1.2,1.8)); }
    if(pay>0) S.fin.cash += pay;
    if(e.left<=0) e.done = true;
  });
  S.earnouts = (S.earnouts||[]).filter(function(e){ return !e.done; });
  (S.escrows||[]).forEach(function(e){ if(S.turn>=e.due){ S.fin.cash += Math.round(e.amt*R.range(0.6,1.0)); e.done=true; } });
  S.escrows = (S.escrows||[]).filter(function(e){ return !e.done; });
}

/* ---------------------------- outbound: targets ------------------------------ */

function refreshTargets(){
  if(!S.mkt) return;
  const hasBite = bizList().some(function(b){ return b.formal && (b.cash||0) > 15000000; });
  if(!hasBite){ S.mkt.targets = []; return; }
  const keep = (S.mkt.targets||[]).filter(function(t){ return t.expires > S.turn && !t.won; });
  if(keep.length >= 3){ S.mkt.targets = keep; return; }
  let out = keep.slice();
  for(let i=0;i<4 && out.length<3;i++){
    const T = R.pick(BIZ);
    const rev = Math.round(R.range(0.4, 3.2) * 26000000 * S.cumInfl);
    const prof = Math.round(rev * R.range(-0.08, 0.20));
    const hidden = [];
    if(R.chance(0.5)) hidden.push({id:'tax', label:'an unresolved tax assessment', cost:Math.round(rev*R.range(0.05,0.16)), found:false});
    if(R.chance(0.45)) hidden.push({id:'lease', label:'two leases with no renewal option', cost:Math.round(rev*R.range(0.03,0.09)), found:false});
    if(R.chance(0.4)) hidden.push({id:'staff', label:'a payroll with three months of arrears', cost:Math.round(rev*R.range(0.02,0.07)), found:false});
    if(R.chance(0.35)) hidden.push({id:'key', label:'one customer representing 40% of revenue', cost:Math.round(rev*R.range(0.04,0.12)), found:false});
    if(R.chance(0.3)) hidden.push({id:'suit', label:'a writ filed by a former director', cost:Math.round(rev*R.range(0.02,0.08)), found:false});
    out.push({id:'t'+(++S.seq), name:R.pick(['Meridian','Kestrel','Odua','Salt & Lime','Blue Nile','Ironbark','Halcyon','Northgate','Verity','Tamarind','Sable','Highfield'])+' '+T.name,
      type:T.id, typeName:T.name, city:R.pick([S.city]).id||S.city, asking:Math.round(rev*R.range(0.7,1.5)*(prof>0?1.15:0.8)),
      revenue:rev, profit:prof, staff:R.int(4,40), outlets:R.int(1,4), quality:R.int(35,80),
      bidders:R.int(1,3), dd:false, hidden:hidden, expires:S.turn+R.int(3,6), won:false, bid:0});
  }
  S.mkt.targets = out;
}
function diligenceTarget(t){
  const cost = Math.round((t.asking||0)*0.012);
  if(S.fin.cash < cost) return null;
  S.fin.cash -= cost;
  t.dd = true;
  (t.hidden||[]).forEach(function(h){ h.found = true; });
  return cost;
}
function makeBid(b, t, price, finance){
  const rivals = (t.bidders||1);
  const rivalBest = Math.round((t.asking||0) * R.range(0.92, 1.28) * (rivals>1?1.08:1));
  const won = price >= rivalBest;
  if(!won){
    log('biz','You were outbid on '+t.name+'. Someone paid '+fmt(rivalBest)+' for it.','warn');
    t.won = true; t.lost = true;
    return {won:false, rival:rivalBest};
  }
  t.won = true;
  return {won:true, price:price, finance:finance, note:absorbTarget(b, t, price, finance)};
}
function absorbTarget(b, t, price, finance){
  let paid = 0, debt = 0, paper = 0;
  if(finance==='debt'){ debt = Math.round(price*0.65); paid = price - debt; S.fin.debt.push({id:'d'+(++S.seq), name:'Acquisition facility \u2014 '+t.name, bal:debt, rate:0.055, minPay:Math.round(debt*0.08), kind:'bank'}); }
  else if(finance==='seller'){ debt = Math.round(price*0.45); paid = price - debt; S.fin.debt.push({id:'d'+(++S.seq), name:'Seller note \u2014 '+t.name, bal:debt, rate:0.035, minPay:Math.round(debt*0.13), kind:'vendor'}); }
  else if(finance==='paper'){
    const T = totalShares(b)||1000, v = Math.max(1000000, bizValue(b));
    const n = Math.round(price/Math.max(1, v/T));
    let h = addHolder(b, {name:(t.name)+' vendors', kind:'strategic', board:true, trust:52, seniority:8, pref:1});
    paid = 0; paper = n;
    h.shares = (h.shares||0)+n; h.paid = price;
  } else { paid = price; }
  b.cash -= paid;
  const tangible = Math.round(((t.revenue||0)*0.35) + (t.outlets||1)*2500000*S.cumInfl);
  b.goodwillAcq = Math.max(0, price - tangible);
  b.capex = (b.capex||0) + Math.round((t.revenue||0)*0.18);
  b.brand = (b.brand||0) + Math.round((t.revenue||0)*0.10);
  b.rep = clamp((b.rep||45) + 4, 0, 100);
  for(let i=0;i<(t.outlets||1);i++){
    b.outlets.push({id:'o'+(++S.seq), name:t.name+' \u2014 acquired unit '+(i+1), size:1, cond:R.int(52,78),
      rent:Math.round(1200000*S.cumInfl), end:S.turn+8, landlord:R.pick(LAST), goodwill:50, hikes:0,
      city:S.city, staff:[], maint:0, opened:S.turn, fitout:0, site:R.int(50,84), status:'open', opensAt:S.turn, manager:null, revenue:0, cost:0, profit:0});
  }
  const hiddenCost = (t.hidden||[]).reduce(function(s,h){ return s + (h.found ? 0 : h.cost); },0);
  if(hiddenCost>0){ b.cash -= hiddenCost; }
  b.integration = {turns:4, quality:clamp(Math.round(50 + R.gauss(0,14) - (t.hidden||[]).filter(function(h){return !h.found;}).length*12),5,95), name:t.name};
  (b.staff||[]).forEach(function(s){ s.morale = clamp((s.morale||60) - 6, 3, 100); });
  S.p.skills.ops = clamp(S.p.skills.ops + 2, 0, 100);
  log('biz','Acquired '+t.name+' for '+fmt(price)+'. '+(paper?('Paid in paper \u2014 the vendors now own part of '+b.name+'. '):'')+
    ((t.hidden||[]).filter(function(h){return !h.found;}).length? 'Something was not in the data room.':'Diligence held up.')+
    (hiddenCost>0? ' It has already cost '+fmt(hiddenCost)+'.':''), 'neutral');
  return 'Acquisition completed for '+fmt(price)+'.';
}

/* -------------------------------- dividends --------------------------------- */

function declareDividend(b, amt){
  ensureGov(b);
  amt = Math.min(Math.round(amt), Math.max(0, Math.round((b.cash||0)*0.9)));
  if(amt <= 0) return;
  if(reservedMatter(b,'dividend') && (b.externalPct||0) > 0){
    openResolution(b, 'dividend', {amt:amt}, 'you');
    UI.modal = {type:'message', title:'It has to go to a vote', text:'Dividend policy is a reserved matter under the shareholders\u2019 agreement. The resolution is on the board table now \u2014 go to the Governance tab, work the directors, then call it.'};
    render(); return;
  }
  b.cash -= amt;
  (b.shares||[]).forEach(function(h){ const their = Math.round(amt*((h.pct||0)/100)); if(h.you) S.fin.cash += their; else h.trust = clamp((h.trust||50)+6,0,100); });
  b.dividends.push({turn:S.turn, amt:amt});
  log('biz','You took '+fmt(amt)+' out of '+b.name+' as a distribution.','neutral');
}

/* A promise is a real obligation. Whether it was met is a fact, not a dice roll. */
function undertakingMet(b, u){
  ensureGov(b);
  if(u.kind==='reporting') return !!(b.formal) && (b.compliance||0) >= 58;
  if(u.kind==='dividend')  return (b.dividends||[]).some(function(d){ return (d.turn||0) >= (u.made||0); });
  if(u.kind==='audit')     return (b.audited||0) >= (u.made||0);
  if(u.kind==='cap')       return (b.drawCap !== undefined) || ((b.draw||0) <= 0);
  if(u.kind==='seat')      return u.filled === true;
  if(u.kind==='agreement') return !!b.formal;
  if(u.kind==='job')       return u.filled === true;
  return (b.compliance||0) >= 60;
}
function fulfilUndertaking(b, uid){
  const u = (b.undertakings||[]).find(function(x){ return x.id===uid; }); if(!u || u.done || u.broken) return 'Nothing to do.';
  if(u.kind==='seat'){
    const ext = extHolders(b);
    const h = holderById(b, u.holderId||'') || ext[0];
    if(h){
      const d = genDirector('money', {holderId:h.id, holderName:h.name, fee:Math.round(200000*S.cumInfl), loyalty:66});
      if(freeSeats(b)<=0) return 'There is no seat to give. Somebody would have to go first.';
      b.board.push(d);
    }
    u.filled = true;
    return 'The seat is filled. They nominated '+((b.board||[]).length?'somebody':'nobody')+'.';
  }
  if(u.kind==='reporting'){
    const cost = Math.round(900000*S.cumInfl);
    if(S.fin.cash < cost) return 'Proper reporting costs '+fmt(cost)+'.';
    S.fin.cash -= cost; b.compliance = clamp((b.compliance||40)+22,0,100);
    return 'You paid for a bookkeeper, a filing agent and a monthly close. '+fmt(cost)+'.';
  }
  if(u.kind==='audit'){ openResolution(b,'audit',{},'you'); return 'The audit is tabled. Pass it and the promise is kept.'; }
  if(u.kind==='agreement'){
    if(b.formal) return 'It is already signed and filed.';
    if(!formalizeBiz()) return 'The paperwork will not go through — something about the company is not in order.';
    return 'The founders agreement is signed. The register says so now.';
  }
  if(u.kind==='job'){
    /* the cousin. Below average, at or slightly above market, and the only
       person in the building nobody can sack without a conversation. */
    const st = genCandidate(-1.6);
    st.skill = Math.min(st.skill, 3);
    st.salary = Math.round(marketSalary(st.skill) * 1.08);
    st.morale = 62; st.loyalty = 40; st.ramp = 0.30; st.joined = S.turn;
    st.note = 'Here because a partner asked.';
    b.staff = b.staff || []; b.staff.push(st);
    u.filled = true;
    return st.name + ' starts at ' + fmt(st.salary) + '/mo. They are not the best person for the job and everybody knows it.';
  }
  if(u.kind==='cap'){ b.drawCap = Math.max(0, Math.round((b.draw||0)*0.6)); return 'Drawings capped at '+fmt(b.drawCap)+' a quarter.'; }
  if(u.kind==='dividend'){ declareDividend(b, Math.max(1000000, Math.round((b.cash||0)*0.2))); return 'A distribution has been declared.'; }
  return 'Noted.';
}

/* --------------------------- the shotgun clause ----------------------------- */

function canShotgun(b){
  ensureGov(b);
  const dd = deedOf(b);
  if(dd.shotgunCooldown > 0) return false;
  if(dd.shotgunUsed && dd.deadlock !== 'shotgun') return false;
  return (b.externalPct||0) >= 15;
}
function triggerShotgun(b, holderId, price){
  ensureGov(b);
  const h = holderById(b, holderId) || extHolders(b)[0];
  if(!h) return 'There is nobody to do this with.';
  const fair = Math.max(1000000, bizValue(b));
  b.shotgun = {turn:S.turn, price:Math.round(price), holderId:h.id, holderName:h.name, fair:fair, responded:false};
  const dd = deedOf(b); dd.shotgunUsed = true; dd.shotgunCooldown = 8;
  S.pending.push({turn:S.turn+1, title:'The shotgun responds', kind:'bad',
    text:h.name+' has one quarter to decide whether to buy you out at that number or sell to you at it.'});
  log('biz','You triggered the shotgun. You have offered to trade at a whole-company value of '+fmt(price)+'. '+h.name+' must now either buy you out or be bought out.','warn');
  return null;
}
function resolveShotgun(b){
  const sg = b.shotgun; if(!sg) return;
  const h = holderById(b, sg.holderId);
  if(!h){ b.shotgun = null; log('biz','The shotgun lapsed. Whoever it was aimed at is no longer on the register.','neutral'); return; }
  const ratio = sg.price / Math.max(1, sg.fair);
  // if you pitched it high, they sell to you; low, they buy you
  let theySell;
  if(ratio > 1.10) theySell = true;
  else if(ratio < 0.90) theySell = false;
  else {
    const aggro = (h && h.trust!==undefined) ? (100 - h.trust)/100 : 0.5;
    theySell = R.chance(0.35 + (1-aggro)*0.4);
  }
  const mine = yourPct(b)/100;
  if(theySell){
    const cost = Math.round(sg.price * (1 - mine));
    if(S.fin.cash < cost){
      const gap = cost - S.fin.cash;
      S.fin.debt.push({id:'d'+(++S.seq), name:'Shotgun facility', bal:gap, rate:0.075, minPay:Math.round(gap*0.1), kind:'bank'});
      S.fin.cash = 0;
      log('biz','You did not have '+fmt(cost)+'. You borrowed '+fmt(gap)+' to finish it, at a rate you will feel for years.','bad');
    } else S.fin.cash -= cost;
    b.shares = (b.shares||[]).filter(function(x){ return x.you || x.id!==h.id; });
    b.board = (b.board||[]).filter(function(d){ return d.holderId !== h.id; });
    syncCapTable(b);
    log('biz',h.name+' sold to you. You now own '+Math.round(yourPct(b))+'% of '+b.name+' and '+fmt(cost)+' less money.','good');
  } else {
    const got = Math.round(sg.price * mine);
    S.fin.cash += got;
    log('biz',h.name+' bought you out at your own number. You said '+fmt(sg.price)+' was fair, and they agreed. You received '+fmt(got)+' and the company is theirs.','bad');
    b.soldInShotgun = true;
    S.flags.shotgunned = true;
    dropBiz(b);
  }
  b.shotgun = null;
}

/* ------------------------------ the quarterly turn --------------------------- */

function lastDivTurn(b){ const d=(b.dividends||[]); return d.length ? d[d.length-1].turn : (b.foundedTurn||0); }

function boardProposes(b){
  const bd = boardOf(b).filter(function(d){ return !d.yours && !d.departing; });
  if(!bd.length) return null;
  if((b.govCd||0) > S.turn) return null;
  if(openResolutions(b).length) return null;
  const mom = bizMomentum(b);
  const unhappy = bd.filter(function(d){ return (d.loyalty||50) < 38 || (d.patience||50) < 24; });
  const pred = bd.filter(function(d){ return d.arc==='predator' && d.plan && S.turn >= d.plan.at; });
  const pro = bd.filter(function(d){ return d.arc==='pro' && (b.compliance||0) < 44; });
  const hungry = bd.filter(function(d){ return (d.arc==='money' || d.arc==='family') && (S.turn - lastDivTurn(b)) > 8 && (b.profit||0) > 0 && (b.cash||0) > 3000000; });

  if(pred.length){
    pred[0].plan = null;
    const bd2 = genInboundBid(b, true) || null;
    if(bd2){
      const r = openResolution(b, 'force', {bidId:bd2.id, proposerName:pred[0].name}, pred[0].name);
      r.proposer = pred[0].name;
      log('biz',pred[0].name+' has moved. There is an offer on the table for '+b.name+' and a resolution to force the sale.','bad');
      b.govCd = S.turn + 5;
      return r;
    }
  }
  if(unhappy.length >= Math.ceil(bd.length/2) && mom < -0.30){
    const mover = unhappy[0];
    const cands = [genMD(1), genMD(2)];
    const r = openResolution(b, 'removeceo', {md:cands[0], mover:mover.name}, mover.name);
    r.proposer = mover.name;
    log('biz',mover.name+' has called for you to be replaced as managing director of '+b.name+'. The resolution is tabled.','bad');
    b.govCd = S.turn + 6;
    return r;
  }
  if(unhappy.length && (b.cash||0) < 0){
    const need = Math.round(Math.abs(b.cash)*1.8 + (b.revenue||0)*0.15);
    const pctv = clamp(Math.round(need/Math.max(1, bizValue(b)+need)*100), 8, 35);
    const r = openResolution(b, 'dilute', {amount:need, pct:pctv, name:'the existing investors', own:need}, unhappy[0].name);
    r.proposer = unhappy[0].name;
    log('biz',b.name+' is out of cash and the board has tabled a resolution to fund it themselves \u2014 '+pctv+'% to whoever puts the money in.','bad');
    b.govCd = S.turn + 4;
    return r;
  }
  if(hungry.length >= 1){
    const amt = Math.round(Math.max(2000000, (b.profit||0)*R.range(0.4,0.9)));
    const r = openResolution(b, 'dividend', {amt:amt}, hungry[0].name);
    r.proposer = hungry[0].name;
    log('biz',hungry[0].name+' has tabled a resolution to distribute '+fmt(amt)+' out of '+b.name+'.','warn');
    b.govCd = S.turn + 5;
    return r;
  }
  if(pro.length >= 1 && R.chance(0.4)){
    const r = openResolution(b, 'audit', {}, pro[0].name);
    r.proposer = pro[0].name;
    log('biz',pro[0].name+' wants a forensic audit of '+b.name+'. Their concern is stated as "disclosure".','warn');
    b.govCd = S.turn + 8;
    return r;
  }
  if(!chairIsYours(b) && (b.externalPct||0) >= 40 && R.chance(0.10)){
    const r = openResolution(b, 'deed', {key:'deadlock', value:'shotgun', label:'Deadlock is now resolved by a shotgun clause.'}, 'the board');
    r.proposer = 'the board';
    log('biz','The board is Deadlocked often enough that someone wants a mechanism. They have tabled a shotgun clause.','warn');
    b.govCd = S.turn + 8;
    return r;
  }
  return null;
}
function genMD(tier){
  const skill = clamp(Math.round(R.gauss(52 + tier*12, 12)), 25, 96);
  return {name:R.pick(FIRST)+' '+R.pick(LAST), skill:skill, tier:tier,
    salary:Math.round((420000 + skill*14000)*S.cumInfl),
    style:R.pick(['a turnaround operator','a process person','a salesman who calls it growth','a financier who manages the numbers','a builder who has done this twice'])};
}

function stepGovernance(){
  const list = bizList();
  list.forEach(function(b){
    ensureGov(b);
    if((b.debt||0) > 0){
      const int = Math.round((b.debt||0)*0.055);
      b.cash -= int; b.lastInterest = int;
      if((b.cash||0) < 0){ b.notes = (b.notes||[]).concat(['Company debt interest of '+fmt(int)+' was not covered by cash.']); }
    }
    if(!b.formal && (b.externalPct||0) <= 0 && !(b.board||[]).some(function(d){ return !d.yours; })) return;
    formBoard(b);

    /* ---- directors age, get paid, and lose patience ---- */
    const bd = boardOf(b).filter(function(d){ return !d.yours && !d.departing; });
    let fees = 0;
    bd.forEach(function(d){ fees += Math.round((d.fee||0) * (1 + (100-(d.loyalty||50))/300)); });
    if(fees > 0){
      const pay = Math.min(fees, Math.max(0, Math.round((b.cash||0)*0.6)));
      b.cash -= pay;
      if(pay >= fees*0.9) bd.forEach(function(d){ d.lastPaid = S.turn; });
      else bd.forEach(function(d){ d.loyalty = clamp((d.loyalty||50)-3,0,100); d.patience = clamp((d.patience||50)-9,0,100); });
      if(pay>0 && pay<fees*0.5) b.notes = (b.notes||[]).concat(['Director fees are unpaid. They have noticed.']);
    }
    bd.forEach(function(d){
      const mom = bizMomentum(b);
      d.patience = clamp((d.patience||50) + mom*7 - 2.2, 0, 100);
      d.loyalty  = clamp((d.loyalty||50) + mom*3.4 - 0.7, 0, 100);
      if((S.turn - (d.briefed||-99)) > 8) d.loyalty = clamp((d.loyalty||50) - 1.6, 0, 100);
      if((b.profit||0) < 0) d.patience = clamp((d.patience||50) - 4, 0, 100);
      if((d.grudges||[]).length > 3){ d.loyalty = clamp(d.loyalty - 2, 0, 100); }
    });

    /* ---- directors who have run out of patience leave ---- */
    bd.slice().forEach(function(d){
      if((d.patience||50) <= 2 || ((d.loyalty||50) <= 8 && R.chance(0.35))){
        b.board = (b.board||[]).filter(function(x){ return x.id!==d.id; });
        const hh = holderById(b, d.holderId||''); if(hh) hh.trust = clamp((hh.trust||50)-18,0,100);
        bd.forEach(function(x){ if(x.id!==d.id) x.loyalty = clamp((x.loyalty||50)-4,0,100); });
        log('biz', d.name+' has resigned from the board of '+b.name+'. '+R.pick([
          'The letter was courteous and said nothing.',
          'They cited other commitments. Everyone cites other commitments.',
          'They did not give a reason, which is the loudest kind of reason.'])+
          (hh? ' '+hh.name+' will want to know why.':''), 'warn');
        S.pending.push({turn:S.turn, title:d.name+' resigned', kind:'bad',
          text:'A seat on the board of '+b.name+' is empty, and an empty seat is an invitation.'});
      }
    });

    /* ---- promises come due ---- */
    (b.undertakings||[]).forEach(function(u){
      if(u.done || u.broken) return;
      if(S.turn >= u.due){
        if(undertakingMet(b, u)){
          u.done = true;
          log('biz','You honoured the undertaking to '+u.dirName+' — '+u.text+'. It was noticed.','good');
          bd.forEach(function(d){ d.loyalty = clamp(d.loyalty+3,0,100); });
          const hh = holderById(b, u.holderId||''); if(hh) hh.trust = clamp((hh.trust||50)+6,0,100);
        } else {
          u.broken = true;
          log('biz','You did not deliver on the promise to '+u.dirName+': '+u.text+'. The board keeps a record of these things.','bad');
          bd.forEach(function(d){ d.loyalty = clamp(d.loyalty-14,0,100); if(d.id===u.dirId){ d.grudges.push('a promise you broke'); } });
          S.p.rep = clamp(S.p.rep-6,0,100);
        }
      }
    });

    /* ---- uncalled resolutions are called for you ---- */
    openResolutions(b).slice().forEach(function(r){
      if(S.turn > r.turn){ callVote(b, r.id); }
    });

    /* ---- offers age out ---- */
    b.inbound = (b.inbound||[]).filter(function(x){
      if(x.status==='done' || x.status==='dead') return false;
      if(S.turn > (x.expires||0)){ x.status='dead'; log('biz','The offer from '+x.from+' for '+b.name+' lapsed. Nobody called.','neutral'); return false; }
      return true;
    });
    if((b.revenue||0) > 8000000 && (b.profit||0) > 0 && R.chance(0.06) && !(b.inbound||[]).length){
      const nb = genInboundBid(b);
      if(nb) log('biz','An approach has come in for '+b.name+' \u2014 '+nb.from+', headline '+fmt(nb.head)+'.','neutral');
    }

    /* ---- integration ---- */
    if(b.integration && b.integration.turns > 0){
      b.integration.turns -= 1;
      const q = b.integration.quality||50;
      if(q < 42){ (b.staff||[]).forEach(function(s){ s.morale = clamp((s.morale||60)-3,3,100); });
        b.rep = clamp((b.rep||45)-1.2,0,100); }
      else { b.rep = clamp((b.rep||45)+0.8,0,100); b.brand = (b.brand||0)+Math.round((b.goodwillAcq||0)*0.02); }
      if(b.integration.turns<=0){
        if(q < 38){
          const wd = Math.round((b.goodwillAcq||0)*R.range(0.25,0.6));
          b.capex = Math.max(0,(b.capex||0) - wd);
          log('biz','The '+b.integration.name+' integration has gone badly. '+fmt(wd)+' of the goodwill has been written off.','bad');
        } else log('biz','The '+b.integration.name+' integration is finished. It went about as well as these things go.','neutral');
        b.integration = null;
      }
    }

    /* ---- the shotgun ---- */
    if(b.shotgun && !b.shotgun.responded && S.turn > b.shotgun.turn) resolveShotgun(b);

    /* ---- what the board wants next ---- */
    boardProposes(b);
    syncCapTable(b);
  });

  refreshTargets();
  stepEarnouts();
  if(S.mkt && S.mkt.targets) S.mkt.targets = (S.mkt.targets||[]).filter(function(t){ return t.expires > S.turn && !t.won; });
}

/* --------------------------------- the view --------------------------------- */

function govWarn(b){
  const out = [];
  if(!chairIsYours(b)) out.push('You do not hold the chair. On a tied vote, the other side wins.');
  if((b.externalPct||0) > 50) out.push('You have lost majority control. Everything structural now needs a vote you can lose.');
  if((b.undertakings||[]).some(function(u){ return !u.done && !u.broken && S.turn >= u.due-1; })) out.push('One of your promises comes due this quarter.');
  if(b.shotgun && !b.shotgun.responded) out.push('A shotgun is in flight. There is no partial outcome.');
  if((b.inbound||[]).length) out.push('There is a live offer for this company.');
  if(b.integration) out.push('Integration of '+b.integration.name+' is still running ('+b.integration.turns+' quarters left).');
  return out;
}