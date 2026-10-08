

/* =========================================================================
   Section 21c: Contracts — winning them, running them, renewing them
   ========================================================================= */
/*@table:CONTRACT_KINDS@*/
/*@table:CONTRACT_CLIENTS@*/
function contractCapacityOK(b, offer){
  const T = BIZ.find(function(x){ return x.id===b.type; });
  const needUnits = offer.value / Math.max(1, T.basePrice*b.priceIdx*S.cumInfl);
  return needUnits < Math.max(6, (b.capacity||0)*0.75);
}
function genContractOffer(b){
  if(!b) return null;
  const K = R.weighted(CONTRACT_KINDS, function(x){
    if(x.needFormal && !b.formal) return 0;
    return x.w * (b.formal?1.15:0.85);
  }) || CONTRACT_KINDS[0];
  // a contract can only ever be as big as the output you can actually deliver
  const T = BIZ.find(function(x){ return x.id===b.type; });
  const unitPrice = T.basePrice * (b.priceIdx||1) * S.cumInfl * CITY().payMult;
  const maxUnits = Math.max(4, (b.capacity||0) * 0.55);
  const scale = Math.max(1500000, (b.revenue||0) * R.range(0.35, 1.15));
  const months = R.pick([3,6,9,12,18,24]);
  return {
    id:'ct'+(++S.seq), kind:K.id, kindName:K.name, client:R.pick(CONTRACT_CLIENTS),
    value:Math.round(Math.min(scale*S.cumInfl, unitPrice*maxUnits)), months:months, turns:Math.round(months/3),
    payDays:K.payDays + R.int(-10, 30), margin:K.margin, risk:K.risk,
    needFormal:!!K.needFormal, expires:S.turn+2,
    leverage: Math.round(clamp(38 + (b.rep||40)/4 - scale/Math.max(1,(b.revenue||1))*22, 5, 92))
  };
}
function refreshContractOffers(){
  bizList().forEach(function(b){
    if(!b.offersC) b.offersC = [];
    if(!b.formal && R.chance(0.6)) { b.offersC = []; return; }
    const want = clamp(1 + Math.floor((b.rep||30)/45) + (b.locations>1?1:0), 1, 3);
    b.offersC = b.offersC.filter(function(o){ return o.expires > S.turn; });
    while(b.offersC.length < want && R.chance(0.55)) b.offersC.push(genContractOffer(b));
  });
}
function contractBidOptions(){
  return [
    {id:'full',  label:'Bid at full value',        disc:0.00, win:0.30},
    {id:'five',  label:'Bid 5% under',             disc:0.05, win:0.44},
    {id:'ten',   label:'Bid 10% under',            disc:0.10, win:0.56},
    {id:'twenty',label:'Bid 20% under',            disc:0.20, win:0.66},
    {id:'thirty',label:'Bid 30% under — buy it',   disc:0.30, win:0.74}
  ];
}
function submitBid(b, offerId, bidId){
  const b2 = b || S.biz; if(!b2) return null;
  const off = (b2.offersC||[]).find(function(o){ return o.id===offerId; }); if(!off) return null;
  const bid = contractBidOptions().find(function(x){ return x.id===bidId; });
  b2.offersC = (b2.offersC||[]).filter(function(o){ return o.id!==offerId; });
  const prob = clamp(bid.win * (0.55 + (b2.rep||40)/110) * (b2.formal?1.15:0.8) * (1 + (S.p.skills.network||30)/260), 0.05, 0.95);
  const won = R.chance(prob);
  if(!won){
    log('biz','You bid '+Math.round(bid.disc*100)+'% under on the '+off.kindName.toLowerCase()+' with '+off.client+'. You did not win it.','neutral');
    return {won:false, off:off};
  }
  const value = Math.round(off.value*(1-bid.disc));
  const c = {id:'cn'+(++S.seq), kind:off.kind, kindName:off.kindName, client:off.client,
    value:value, turns:off.turns, payDays:off.payDays, margin:clamp(off.margin - bid.disc*0.9, -0.15, 0.7),
    risk:off.risk + bid.disc*0.5, start:S.turn, renewals:0, incidents:[]};
  b2.contracts = b2.contracts || [];
  b2.contracts.push(c);
  normaliseContract(c);
  log('biz','You won the '+off.kindName.toLowerCase()+' with '+off.client+': '+fmt(value)+'/quarter for '+off.months+' months.','good');
  return {won:true, off:off, contract:c};
}
function contractRevenue(b){
  return (b.contracts||[]).reduce(function(a,c){ return a + Math.max(0,(c.value||0)); }, 0);
}
function contractCost(b){
  return (b.contracts||[]).reduce(function(a,c){ return a + Math.max(0,(c.value||0))*(1-(c.margin||0.2)); }, 0);
}
function stepContracts(b){
  const notes = [];
  (b.contracts||[]).slice().forEach(function(c){
    c.turns -= 1;
    // problems: scope creep, delay penalties, disputes
    if(R.chance((c.risk||0.12)*0.55)){
      const what = R.weighted(['scope','delay','dispute','fx'], function(x){
        return x==='scope'?1.2 : x==='delay'?1.0 : x==='dispute'?0.7 : 0.5; }) || 'scope';
      if(what==='scope'){
        const cost = Math.round((c.value||0)*R.range(0.12,0.4));
        b.cash -= cost; c.margin = clamp((c.margin||0.2)-0.09, -0.3, 0.7);
        notes.push({level:'warn', text:offName(c)+': the scope grew. '+fmt(cost)+' of unfunded work this quarter.'});
      } else if(what==='delay'){
        const pen = Math.round((c.value||0)*R.range(0.08,0.22));
        b.cash -= pen;
        notes.push({level:'bad', text:offName(c)+': a delivery slipped and the penalty clause bit. '+fmt(pen)+'.'});
      } else if(what==='dispute'){
        const hold = Math.round((c.value||0)*R.range(0.4,1.0));
        b.recv = (b.recv||0) + hold;
        notes.push({level:'bad', text:offName(c)+': they are disputing an invoice. '+fmt(hold)+' is now stuck in query.'});
      } else {
        const loss = Math.round((c.value||0)*R.range(0.05,0.16));
        b.cash -= loss;
        notes.push({level:'warn', text:offName(c)+': currency moved against a fixed-price contract. '+fmt(loss)+'.'});
      }
      c.incidents = (c.incidents||[]).concat([{turn:S.turn, kind:what}]);
      if(c.incidents.length>6) c.incidents.shift();
    }
    if(c.turns <= 0){
      b.contracts = (b.contracts||[]).filter(function(x){ return x.id!==c.id; });
      notes.push({level:'warn', text:'The contract with '+c.client+' has ended. They may come back.'});
    }
  });
  return notes;
}
function normaliseContract(c){
  if(!c) return c;
  if(!c.id) c.id = 'cn'+(++S.seq);
  if(!c.kindName) c.kindName = ((CONTRACT_KINDS.find(function(k){ return k.id===c.kind; })||{}).name) || 'Contract';
  if(c.kind===undefined) c.kind = 'supply';
  if(c.margin===undefined) c.margin = 0.2;
  if(c.payDays===undefined) c.payDays = 45;
  if(c.risk===undefined) c.risk = 0.12;
  if(c.turns===undefined) c.turns = 4;
  if(c.value===undefined) c.value = 0;
  if(!c.client) c.client = 'a client';
  if(!c.incidents) c.incidents = [];
  if(c.renewals===undefined) c.renewals = 0;
  return c;
}
function offName(c){ return (c.kindName||'Contract')+' with '+(c.client||'a client'); }
function renewContract(b, c){
  if(!b || !c) return;
  const ask = Math.round((c.value||0) * R.range(1.0, 1.28));
  startNego({
    kind:'money', ctxLabel:'Contract renewal', title:'Renewing with '+c.client, other:c.client,
    blurb:'The contract is up. They want to renew, and they have opened at '+fmt(ask)+' a quarter. '+
      'They know what you charge. You know what it costs you to serve them, and it has gone up.',
    metric:{low:Math.round((c.value||0)*0.86), high:ask, you:Math.round((c.value||0)*0.95), them:ask},
    leverage:clamp(45 + (b.rep||40)/4, 10, 90), maxRounds:3,
    terms:R.pickN(NEG_TERM_POOL,3),
    onDeal:function(v, termsGiven){
      c.value = Math.round(v);
      c.turns = Math.max(2, c.turns + 4);
      c.renewals = (c.renewals||0)+1;
      if(termsGiven.indexOf('days')>=0) c.payDays = Math.max(14, Math.round((c.payDays||45)*0.6));
      log('biz','Renewed with '+c.client+' at '+fmt(Math.round(v))+'/quarter.','good');
      S.p.skills.network = clamp(S.p.skills.network+2,0,100);
    },
    onWalk:function(){ b.contracts = (b.contracts||[]).filter(function(x){ return x.id!==c.id; });
      log('biz','You let the contract with '+c.client+' lapse rather than renew at their number.','warn'); },
    onImpasse:function(){ b.contracts = (b.contracts||[]).filter(function(x){ return x.id!==c.id; });
      log('biz','The renewal with '+c.client+' fell through.','warn'); }
  });
}
/* ------------------------------- The group ---------------------------------- */
function portfolioBar(){
  const list = bizList();
  let h = '<div class="card"><div class="between"><h3 style="margin:0">Your companies</h3>'+
    '<span class="tiny muted">'+(list.length?list.length+' of 4':'None yet')+'</span></div>';
  if(list.length){
    h += '<div class="row wrap" style="gap:6px;margin:9px 0">';
    list.forEach(function(b){
      const on = S.biz && S.biz.id===b.id;
      const warn = (b.cash<0) || (b.diag||[]).some(function(d){ return d.level==='bad'; });
      h += '<button class="btn sm '+(on?'primary':'')+'" data-a="switchbiz" data-b="'+b.id+'">'+
        (warn?'<span class="dot"></span> ':'')+esc(b.name)+
        ' <span class="tiny muted">'+fmt(b.revenue)+'</span></button>';
    });
    h += '</div>';
    let rev=0, prof=0, staff=0, out=0;
    list.forEach(function(b){ rev+=b.revenue||0; prof+=b.profit||0; staff+=(b.staff||[]).length; out+=outletCount(b); });
    h += '<div class="grid g4" style="margin-top:4px">'+
      '<div><div class="tiny muted">Group revenue</div><div class="mid">'+fmt(rev)+'</div></div>'+
      '<div><div class="tiny muted">Group profit</div><div class="mid '+(prof>=0?'good':'bad')+'">'+fmt(prof)+'</div></div>'+
      '<div><div class="tiny muted">Staff</div><div class="mid">'+staff+'</div></div>'+
      '<div><div class="tiny muted">Units</div><div class="mid">'+out+'</div></div>'+
      '</div>';
    h += '<div class="tiny muted" style="margin-top:8px">Combined valuation '+fmt(bizValueTotal())+'. '+
      'You are spread across '+list.length+' compan'+(list.length===1?'y':'ies')+
      (list.length>1? ' \u2014 your personal attention is divided, and a business without a general manager suffers most from it.':'.')+'</div>';
    let extMax=0, emptySeats=0, tabled=0;
    list.forEach(function(b){ ensureGov(b); extMax=Math.max(extMax, b.externalPct||0);
      emptySeats+=freeSeats(b); tabled+=openResolutions(b).length; });
    if(extMax>0 || tabled>0){
      h += '<div class="row wrap" style="margin-top:9px;gap:7px">'+
        '<button class="btn sm" data-a="tab" data-t="gov">Governance'+(tabled?' <span class="dot"></span>':'')+'</button>'+
        '<span class="tiny muted">Largest outside stake '+pct(extMax/100,0)+
        (tabled? ' \u00b7 '+tabled+' resolution'+(tabled>1?'s':'')+' tabled':'')+
        (emptySeats? ' \u00b7 '+emptySeats+' empty seat'+(emptySeats>1?'s':''):'')+'</span></div>';
    }
  } else {
    h += '<div class="small muted" style="margin:8px 0">You do not own a company yet.</div>';
  }
  if(list.length > 1){
    h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Group treasury — move cash between your companies</div><div class="row wrap" style="gap:5px">';
    list.forEach(function(src){
      list.forEach(function(dst){
        if(src.id===dst.id) return;
        h += '<button class="btn xs" data-a="transfer" data-f="'+src.id+'" data-t="'+dst.id+'"'+(src.cash<=0?' disabled aria-disabled="true" title="Nothing to move: this company holds no cash"':'')+'>'+
          esc(src.name.split(' ')[0])+' → '+esc(dst.name.split(' ')[0])+'</button>';
      });
    });
    h += '</div><div class="tiny muted" style="margin-top:6px">Moving money out of a company you do not wholly own will be noticed by your partner.</div>';
  }
  h += '<div class="row wrap" style="margin-top:10px;gap:6px">'+
    (list.length < 4
      ? '<button class="btn sm" data-a="anotherbiz">Start another company'+(list.length?' (you have '+list.length+')':'')+'</button>'
      : '<span class="tiny muted">Four companies is the practical limit of one person\u2019s attention.</span>')+
    (S.biz? ' <button class="btn sm" data-a="sellbiz">Sell this one</button> <button class="btn sm bad" data-a="closebiz">Wind this one up</button>':'')+
    '</div>';
  h += '</div>';
  return h;
}
/* ── Start another company, redesigned (the redesign's shell phase) ─────────
   Measured by `tools/shellaudit.mjs`: 1,633 characters in the way with 13
   controls — the heaviest surface outside a route, and heavy for the same reason
   Money > Property was: ten companies, each a bordered box with a paragraph of
   description, and an opening lecture above them. The rows lead with the name and
   the price and the Start button; the ten sentences are one fold, in order; the
   lecture is a fold. Same ten Start buttons, same disabled reasons, same prices. */
function anotherBizModal(){
  const list = bizList();
  let body = foldHTML('A second company', 'A second company is not diversification, it is a second job. '+
    'It only works if the first one runs without you, or if you can afford for both to be mediocre for a year.');
  const cheapest = Math.min.apply(null, BIZ.map(function(x){ return startBizCost(x.id); }));
  if(S.fin.cash < cheapest){
    body += '<div class="tutorial" style="border-color:rgba(255,159,67,.45);color:#ffcda0;background:rgba(255,159,67,.07)">'+
      '<b>None of these is within reach yet.</b> The cheapest is '+fmt(cheapest)+' and you have '+fmt(S.fin.cash)+
      ' &mdash; short by <b>'+fmt(cheapest - S.fin.cash)+'</b>. Earn it or borrow it, then come back.'+
      '<div class="row wrap" style="gap:6px;margin-top:9px">'+
        '<button class="btn sm primary" data-a="goto" data-t="work" data-s="career">Work &rsaquo; Career &mdash; earn it</button>'+
        '<button class="btn sm" data-a="goto" data-t="money" data-s="deals">Money &rsaquo; Deals &mdash; borrow or sell</button>'+
      '</div></div>';
  }
  BIZ.forEach(function(t){
    const afford = S.fin.cash >= startBizCost(t.id);
    body += '<div class="mrow" style="opacity:'+(afford?1:.5)+'">'+
      '<div class="between"><b>'+t.icon+' '+esc(t.name)+'</b><span class="chip b">'+fmt(startBizCost(t.id))+'</span></div>'+
      '<button class="btn xs primary block" style="margin-top:6px" data-a="startbiz" data-t="'+t.id+'"'+(afford?'':' disabled aria-disabled="true" title="Needs '+fmt(startBizCost(t.id))+' \u00b7 you have '+fmt(S.fin.cash)+' \u00b7 short '+fmt(startBizCost(t.id) - S.fin.cash)+'"')+'>Start</button></div>';
  });
  body += foldHTML('What each company is', BIZ.map(function(t){
    return '<div style="margin-bottom:6px"><b>'+esc(t.name)+'</b> \u2014 '+esc(t.desc)+'</div>';
  }).join(''));
  return modalHTML('<h2>Start another company</h2>', body, '<button class="btn ghost" data-a="close">Not now</button>');
}

/* --------------------------------- Agenda ----------------------------------- */
function agendaItems(){
  const out = [];
  bizList().forEach(function(b){
    const nm = b.name;
    (b.outlets||[]).forEach(function(o){
      if((o.end||0) <= 1) out.push({kind:'lease', lv:'bad', biz:b.id, text:nm+' — lease at '+o.name+' is up. Negotiate it or take the increase.', act:'rentnego', id:o.id});
      if((o.cond===undefined?80:o.cond) < 42) out.push({kind:'condition', lv:'warn', biz:b.id, text:nm+' — '+o.name+' is in poor condition ('+Math.round(o.cond||0)+'/100). Customers can tell.'});
      if(outletStaff(b,o.id).length===0 && (b.outlets||[]).length>1) out.push({kind:'unassigned', lv:'warn', biz:b.id, text:nm+' — nobody is assigned to '+o.name+'.'});
    });
    (b.contracts||[]).forEach(function(c){
      if((c.turns||0) <= 1) out.push({kind:'renewal', lv:'warn', biz:b.id, text:nm+' — contract with '+(c.client||'a client')+' is up for renewal.', act:'renewc', id:c.id});
      if((c.margin||0) < 0.05) out.push({kind:'margin', lv:'bad', biz:b.id, text:nm+' — the contract with '+(c.client||'a client')+' is running at '+Math.round((c.margin||0)*100)+'% margin. You are working for nothing.'});
    });
    (b.offersC||[]).forEach(function(o){
      if((o.expires - S.turn) <= 1) out.push({kind:'tender', lv:'warn', biz:b.id, text:nm+' — the tender from '+(o.client||'a client')+' closes this quarter.'});
    });
    (b.staff||[]).forEach(function(st){
      if(st.morale < 30) out.push({kind:'morale', lv:'bad', biz:b.id, text:nm+' — '+st.name+'\u2019s morale is '+Math.round(st.morale)+'. They are halfway out of the door.'});
      if((st.salary||0) < marketSalary(st.skill)*0.82) out.push({kind:'underpaid', lv:'warn', biz:b.id, text:nm+' — '+st.name+' is paid below market. That is borrowed time, not savings.'});
    });
    if(!hasGM(b) && (b.staff||[]).length>0 && bizList().length>1)
      out.push({kind:'gm', lv:'warn', biz:b.id, text:nm+' — no general manager, so it takes a full share of your attention.'});
    const cover = staffCover(b);
    if(cover < 0.8) out.push({kind:'cover', lv:'bad', biz:b.id, text:nm+' — you are '+Math.round(cover*100)+'% staffed. Units are turning customers away and your reputation falls every quarter it stays like this.'});
    if((b.demand||0) > (b.capacity||0)*1.3 && (b.capacity||0)>0)
      out.push({kind:'capacity', lv:'warn', biz:b.id, text:nm+' — demand is running '+Math.round((b.demand/Math.max(1,b.capacity)-1)*100)+'% ahead of what you can produce. Raise prices, or hire.'});
    if((b.staff||[]).length===0 && (b.revenue||0)>3000000)
      out.push({kind:'nostaff', lv:'bad', biz:b.id, text:nm+' — nobody works here except you.'});
    if((b.cash||0) < 0) out.push({kind:'insolvent', lv:'bad', biz:b.id, text:nm+' — the company is cash-negative by '+fmt(Math.round(-(b.cash||0)))+'.'});
  });
  /* your own household */
  (S.house||[]).forEach(function(h){
    const R0 = HOUSE_ROLES[h.role]; if(!R0) return;
    const lbl = R0.label.toLowerCase();
    if((h.morale||60) < 30) out.push({kind:'hmorale', lv:'bad', text:h.name+' ('+lbl+') has morale '+Math.round(h.morale)+'. A household in a bad mood is a liability you live inside.'});
    if((h.salary||0) < houseSalaryFor(h.role, h.skill)*0.85) out.push({kind:'hpay', lv:'warn', text:h.name+' is paid well below what a '+lbl+' costs. Expect a conversation, or a resignation.'});
    if(h.role==='nanny' && (S.p.kids||0)===0) out.push({kind:'hnanny', lv:'warn', text:h.name+' is still your nanny and the children are grown. Redeploy them or let them go.'});
    if((h.payer||'you')!=='you' && !h.declared)
      out.push({kind:'hdeclared', lv:'warn', biz:h.payer, text:h.name+' is on the '+(bizById(h.payer)||{name:'a company'}).name+' payroll undeclared. It is a benefit in kind whether you call it one or not.'});
    if((h.suspicion||0) >= 2) out.push({kind:'hsuspicion', lv:'bad', text:'Money keeps going missing and '+h.name+' is the person you keep not asking about.'});
  });
  return out;
}