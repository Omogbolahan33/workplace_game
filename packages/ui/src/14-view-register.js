

function viewRegister(b){
  let h = '<div class="card"><h3>The register <span class="tag">'+fmt(bizValue(b))+' equity value</span></h3>';
  h += '<div class="grid g4" style="margin-bottom:8px">'+
    '<div><div class="tiny muted">Your holding</div><div class="mid '+(yourPct(b)>=50?'good':'bad')+'">'+pct(yourPct(b)/100,1)+'</div></div>'+
    '<div><div class="tiny muted">Outside money</div><div class="mid">'+pct((b.externalPct||0)/100,1)+'</div></div>'+
    '<div><div class="tiny muted">Board seats</div><div class="mid">'+boardOf(b).filter(function(d){ return !d.departing; }).length+' / '+seatEntitlement(b)+'</div></div>'+
    '<div><div class="tiny muted">Chair</div><div class="mid '+(chairIsYours(b)?'good':'bad')+'">'+(chairIsYours(b)?'You':esc((chairOf(b)||{name:'\u2014'}).name))+'</div></div>'+
    '</div>';
  const hs = (b.shares||[]).slice().sort(function(a,c){ return c.shares-a.shares; });
  h += '<div style="margin-top:6px">';
  hs.forEach(function(x){
    const prefTxt = (x.pref>0) ? '<span class="chip y">'+(x.pref).toFixed(1)+'x pref'+(x.participate?' + part':'')+'</span>' : '';
    const cls = x.cls||'Ordinary';
    h += '<div class="kv"><span>'+(x.you?'<b>'+esc(x.name)+'</b>':esc(x.name))+
      ' <span class="tiny muted">'+esc(cls)+(x.roundLabel?' · '+esc(x.roundLabel):(x.kind==='founder'?' · founder':' · '+esc(x.kind||'investor')))+'</span>'+
      (x.trust!==undefined && !x.you ? '<br><span class="tiny muted">trust '+Math.round(x.trust)+'/100</span>':'')+'</span>'+
      '<span style="text-align:right">'+pct((x.pct||0)/100,1)+'<br><span class="tiny muted">'+fmt(x.paid||0)+' in</span> '+prefTxt+'</span></div>';
  });
  h += '</div>';
  // waterfall
  const w = liquidationWaterfall(b, bizValue(b));
  h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">If the company were sold at today\u2019s value, after the preference stack:</div>';
  w.rows.forEach(function(r){
    h += '<div class="kv"><span class="'+(r.you?'good':'')+'">'+esc(r.name)+' <span class="tiny muted">'+esc(r.kind)+'</span></span><span>'+fmt(r.amt)+'</span></div>';
  });
  h += '<div class="kv" style="border-top:1px solid #16202c;margin-top:4px"><span><b>Your net on a sale today</b></span><span class="mid '+(w.mine>0?'good':'bad')+'">'+fmt(w.mine)+'</span></div>';
  const stack = (b.shares||[]).filter(function(x){ return !x.you && x.pref>0; }).reduce(function(s,x){ return s + Math.round((x.paid||0)*x.pref); },0);
  if(stack>0) h += '<div class="tiny muted" style="margin-top:6px">There is '+fmt(stack)+' of preference ahead of the ordinary shares. A headline number is not a number you receive.</div>';
  h += '</div>';
  return h;
}

function viewBoard(b){
  let h = '<div class="card"><h3>The board <span class="tag">'+(seatEntitlement(b)-boardOf(b).filter(function(d){return !d.departing;}).length)+' empty seat(s)</span></h3>';
  const bd = boardOf(b).filter(function(d){ return !d.departing; });
  if(!bd.length) h += '<div class="tiny muted">There is no board. There is only you, which is a decision as well.</div>';
  bd.forEach(function(d){
    const A = archOf(d.arc);
    const loy = d.loyalty||50, pat = d.patience||50;
    const col = loy>66?'var(--good)':loy>38?'var(--warn)':'var(--bad)';
    const pcol = pat>60?'var(--good)':pat>28?'var(--warn)':'var(--bad)';
    h += '<div style="border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:9px">';
    h += '<div class="between"><b>'+esc(d.name)+'</b><span class="chip '+(d.role==='chair'?'p':d.yours?'b':'')+'">'+(d.role==='chair'?'Chair':d.yours?'You':esc(d.label))+'</span></div>';
    h += '<div class="tiny muted" style="margin:4px 0 7px">'+esc(A.blurb)+(d.holderName? ' · nominated by '+esc(d.holderName):'')+
      (d.fee? ' · '+fmt(d.fee)+'/yr':'')+'</div>';
    h += '<div class="statline"><span class="lbl">Loyalty</span>'+bar(loy,100,col)+'<span class="val">'+Math.round(loy)+'</span></div>';
    h += '<div class="statline"><span class="lbl">Patience</span>'+bar(pat,100,pcol)+'<span class="val">'+Math.round(pat)+'</span></div>';
    h += '<div class="row wrap" style="gap:5px;margin:6px 0">'+
      (d.agenda||[]).map(function(a){ return '<span class="chip '+(a==='sell'||a==='buyout'?'r':'')+'">'+esc((RES_KINDS[a]||{label:a}).label)+'</span>'; }).join('')+
      '<span class="chip b">'+esc(A.skill)+' '+Math.round(d.skill[A.skill]||0)+'</span>'+
      (d.grudges&&d.grudges.length?'<span class="chip r">'+d.grudges.length+' grievance'+(d.grudges.length>1?'s':'')+'</span>':'')+
      (d.briefed>=S.turn-1?'<span class="chip g">briefed</span>':'')+
      '</div>';
    if(d.grudges && d.grudges.length) h += '<div class="tiny muted" style="margin-bottom:6px">Remembers: '+esc(d.grudges.slice(-2).join('; '))+'.</div>';
    const dv = Math.round(dirVotes(b,d));
    h += '<div class="tiny muted">'+(dv>0 ? 'Controls '+dv.toLocaleString()+' shares' : 'Carries no shares, one seat')+
      ' / voted with you '+(d.votesFor||0)+' / against '+(d.votesAgainst||0)+' / abstained '+(d.abstained||0)+
      ((d.consulting||0)>0 ? ' / '+fmt(d.consulting)+' in fee arrangements' : '')+'</div>';
    if(!d.yours){
      h += '<div class="row wrap" style="gap:5px;margin-top:7px">'+directorButtonsHTML(d)+'</div>';
      h += '<div class="tiny muted" style="margin-top:5px">Wants: '+esc(A.likes)+'. Cannot stand: '+esc(A.hates)+'.</div>';
    }
    h += '</div>';
  });
  if(freeSeats(b)>0){
    h += '<div class="row wrap" style="gap:6px"><button class="btn sm primary" data-a="appointdir">Fill a seat ('+freeSeats(b)+' free)</button>'+
      '<span class="tiny muted">A good non-executive costs a fee and gives you a skill you do not have.</span></div>';
  }
  const sk = {finance:boardSkill(b,'finance'), ops:boardSkill(b,'ops'), network:boardSkill(b,'network'), tech:boardSkill(b,'tech')};
  if(boardOf(b).filter(function(d){return !d.yours;}).length){
    h += '<hr class="sep"><div class="tiny muted">Board-level capability, which the company actually uses:</div>';
    h += '<div class="grid g4" style="margin-top:5px">'+['finance','ops','network','tech'].map(function(k){
      return '<div><div class="tiny muted">'+k+'</div><div class="mid">'+Math.round(sk[k]||0)+'</div></div>'; }).join('')+'</div>';
  }
  h += '</div>';
  return h;
}

function viewResolutions(b){
  const open = openResolutions(b);
  let h = '<div class="card"><h3>On the table <span class="tag">'+open.length+' open</span></h3>';
  if(!open.length){
    h += '<div class="tiny muted">Nothing tabled. Resolutions are how everything structural gets decided \u2014 a sale, a raise, a removal.</div>';
  }
  open.forEach(function(res){
    const meta = resMeta(res.kind);
    const w = whipCount(b, res);
    const need = res.thr==='special' ? 75 : 50;
    const proj = w.denom ? (w.for/w.denom*100) : 0;
    h += '<div style="border:1px solid '+(res.proposer==='you'?'var(--line)':'rgba(255,95,109,.4)')+';border-radius:10px;padding:11px;margin-bottom:10px">';
    h += '<div class="between"><b>'+esc(meta.label)+'</b><span class="chip '+(res.proposer==='you'?'b':'r')+'">'+
      (res.proposer==='you'?'You proposed':esc(res.proposer)+' proposed')+'</span></div>';
    h += '<div class="tiny muted" style="margin:5px 0 8px">'+esc((res.cls==='shareholder'?'Shareholder vote, weighted by shares. ':'Board vote, one seat one vote. ')+
      (res.thr==='special'?'Needs 75%. ':'Needs a simple majority. ')+
      (res.cls==='shareholder'
         ? (chairIsYours(b)?'You chair the meeting and set the order of business.':'The chair is not yours, and they set the order of business.')
         : (chairIsYours(b) && b.const.casting?'You hold the casting vote on a tie.':'The chair is not yours \u2014 a tie goes against you.')))+'</div>';
    h += '<div class="statline"><span class="lbl">Whip</span>'+bar(proj,100,(proj>=need?'var(--good)':'var(--bad)'))+'<span class="val">'+Math.round(proj)+'%</span></div>';
    w.rows.forEach(function(r){
      if(r.d.yours) return;
      const mark = r.st.vote==='for' ? '<span class="chip g">for</span>' : r.st.vote==='against' ? '<span class="chip r">against</span>' : '<span class="chip">abstain</span>';
      h += '<div class="kv"><span>'+esc(r.d.name)+(r.holder?' <span class="chip">holder</span>':'')+' '+mark+
        ((res.lobby&&res.lobby[r.d.id])?'<span class="chip b">'+esc(LOBBY_MODES[res.lobby[r.d.id].mode].label)+'</span>':'')+
        (r.st.reasons.length?'<br><span class="tiny muted">'+esc(r.st.reasons.join('; '))+'</span>':'')+'</span>'+
        '<span class="tiny muted">'+(res.cls==='shareholder'? Math.round(r.w).toLocaleString()+' shares':'1 seat')+'</span></div>';
    });
    if(res.data && res.data.amt) h += '<div class="tiny muted" style="margin-top:6px">Amount: '+fmt(res.data.amt)+'</div>';
    if(res.data && res.data.pct) h += '<div class="tiny muted">Dilution on the table: '+res.data.pct+'%</div>';
    h += '<div class="row wrap" style="gap:6px;margin-top:9px">'+
      (res.youWant===false ? '<button class="btn sm" data-a="whip" data-r="'+res.id+'" data-w="1">Switch to whipping for it</button>'
                           : '<button class="btn sm" data-a="whip" data-r="'+res.id+'" data-w="0">Switch to whipping against it</button>')+
      '<button class="btn sm primary" data-a="callvote" data-r="'+res.id+'">Call the vote</button>'+
      (res.proposer==='you' ? '<button class="btn sm" data-a="withdrawres" data-r="'+res.id+'">Withdraw</button>' : '')+
      '</div>';
    h += '<div class="tiny muted" style="margin-top:6px">You are currently whipping <b>'+(res.youWant===false?'against':'for')+
      '</b> it. Lobbying moves a director in whichever direction you have chosen, so check this before you spend a favour.</div>';
    h += '<div class="tiny muted" style="margin-top:6px">Uncalled resolutions are called for you at the end of the quarter. Work the room first.</div>';
    h += '</div>';
  });
  h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px">Table something yourself:</div><div class="row wrap" style="gap:6px">'+
    '<button class="btn xs" data-a="tableres" data-k="dividend">Distribution</button>'+
    '<button class="btn xs" data-a="tableres" data-k="raise">Raise capital</button>'+
    '<button class="btn xs" data-a="tableres" data-k="sell">Sell the company</button>'+
    '<button class="btn xs" data-a="tableres" data-k="acquire">Acquisition</button>'+
    '<button class="btn xs" data-a="tableres" data-k="borrow">Borrow</button>'+
    '<button class="btn xs" data-a="tableres" data-k="ceo">Hire an MD</button>'+
    '<button class="btn xs" data-a="tableres" data-k="expand">Capital spend</button>'+
    '<button class="btn xs" data-a="tableres" data-k="audit">Audit</button>'+
    '<button class="btn xs" data-a="tableres" data-k="deed">Amend the deed</button>'+
    '<button class="btn xs bad" data-a="tableres" data-k="dissolve">Wind up</button>'+
    '</div>';
  h += '</div>';
  return h;
}

function viewDeed(b){
  const dd = deedOf(b);
  let h = '<div class="card"><h3>Shareholders\u2019 agreement <span class="tag">'+(dd.amended||0)+' amendment(s)</span></h3>';
  const rows = [
    ['Pre-emption', dd.preEmption?'Existing holders may buy new shares first':'New shares can go straight to an outsider'],
    ['Drag-along', dd.drag?('Holders of '+dd.dragPct+'% can force the rest to sell'):'Nobody can be forced into a sale'],
    ['Tag-along', dd.tag?'Minorities can join any sale on the same terms':'Minorities can be left behind'],
    ['Deadlock', ({mediation:'resolved by mediation', shotgun:'resolved by a shotgun clause', expert:'resolved by an independent expert'})[dd.deadlock]||dd.deadlock],
    ['Reserved matters', dd.reserved.map(function(k){ return (RES_KINDS[k]||{label:k}).label; }).join(', ')],
    ['Non-compete', dd.nonCompete?dd.nonCompete+' years after you leave':'None'],
    ['Reporting', dd.infoRights==='monthly'?'Monthly accounts to holders':(dd.infoRights==='quarterly'?'Quarterly accounts to holders':'Annual only')],
    ['Leaver provisions', dd.leaver==='goodbad'?'Good leaver keeps vested equity; bad leaver forfeits':'All equity vests regardless']
  ];
  rows.forEach(function(r){
    h += '<div class="kv"><span class="muted">'+esc(r[0])+'</span><span style="text-align:right">'+esc(r[1])+'</span></div>';
  });
  h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px">Amendments need a special resolution \u2014 75% of the shares. If you hold less than 25%, you can block one.</div>';
  h += '<div class="row wrap" style="gap:6px">'+
    '<button class="btn xs" data-a="amenddeed" data-k="preEmption">Pre-emption</button>'+
    '<button class="btn xs" data-a="amenddeed" data-k="drag">Drag-along</button>'+
    '<button class="btn xs" data-a="amenddeed" data-k="tag">Tag-along</button>'+
    '<button class="btn xs" data-a="amenddeed" data-k="deadlock">Deadlock</button>'+
    '<button class="btn xs" data-a="amenddeed" data-k="infoRights">Reporting</button>'+
    '</div>';
  const sg = extHolders(b);
  if(sg.length){
    h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px">'+
      'The shotgun: you name a whole-company price. The other side must either buy you out at it or sell to you at it. '+
      'Name it too high and you fund the buyout. Name it too low and you have just sold your company at your own number.</div>';
    if(canShotgun(b)){
      h += '<div class="row wrap" style="gap:6px">'+sg.slice(0,2).map(function(x){
        return '<button class="btn xs bad" data-a="shotgun" data-h="'+x.id+'">Trigger against '+esc(x.name)+'</button>'; }).join('');
      h += '</div>';
    } else h += '<div class="tiny muted">Not available yet'+(deedOf(b).shotgunCooldown>0?' (used recently)':(b.externalPct||0)<15?' (needs a holder with at least 15%)':'')+'.</div>';
  }
  h += '</div>';
  return h;
}

function viewPromises(b){
  const us = (b.undertakings||[]).filter(function(u){ return !u.done && !u.broken; });
  const past = (b.undertakings||[]).filter(function(u){ return u.done || u.broken; });
  let h = '<div class="card"><h3>Promises <span class="tag">'+us.length+' live</span></h3>';
  if(!us.length && !past.length) h += '<div class="tiny muted">Nothing minuted against you. Keep it that way.</div>';
  us.forEach(function(u){
    const due = u.due - S.turn;
    const met = undertakingMet(b, u);
    h += '<div class="logline" style="border-left-color:'+(met?'var(--good)':(due<=0?'var(--bad)':due<=1?'var(--warn)':'var(--acc)'))+'">'+
      '<div class="t">'+esc(u.dirName)+' · '+(due<=0?'due now':'due in '+due+' quarter'+(due>1?'s':''))+'</div>'+
      '<b>'+esc(u.text)+'</b>'+
      '<div class="row wrap" style="gap:5px;margin-top:6px">'+
      (met? '<span class="chip g">delivered</span>'
          : '<button class="btn xs primary" data-a="fulfil" data-u="'+u.id+'">'+(u.kind==='seat'?'Give them the seat':u.kind==='reporting'?'Pay for proper reporting':u.kind==='audit'?'Table the audit':u.kind==='cap'?'Cap my drawings':u.kind==='dividend'?'Declare the distribution':u.kind==='agreement'?'Sign the agreement':u.kind==='job'?'Give them the job':'Deliver')+'</button>')+
      '</div></div>';
  });
  if(past.length){
    h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Settled</div>';
    past.slice(-4).forEach(function(u){
      h += '<div class="logline" style="border-left-color:'+(u.broken?'var(--bad)':'var(--good)')+'"><div class="t">'+dateLabel(u.made)+' · '+esc(u.dirName)+'</div>'+
        esc(u.text)+' \u2014 '+(u.broken?'broken':'honoured')+'</div>';
    });
  }
  h += '</div>';
  return h;
}

function viewInbound(b){
  let h = '<div class="card"><h3>Offers for this company</h3>';
  const ins = (b.inbound||[]).filter(function(x){ return x.status==='live'; });
  if(!ins.length) h += '<div class="tiny muted">Nobody is bidding. Offers arrive when a company is visibly working, or visibly for sale.</div>';
  ins.forEach(function(bd){
    const head = bidHead(bd);
    const w = liquidationWaterfall(b, head);
    h += '<div style="border:1px solid #2a3a4c;border-radius:10px;padding:11px;margin-bottom:10px">';
    h += '<div class="between"><b>'+esc(bd.from)+'</b><span class="mono '+(bd.chip?'bad':'good')+'">'+fmt(head)+'</span></div>';
    h += '<div class="grid g4" style="margin:7px 0">'+
      '<div><div class="tiny muted">Cash</div><div>'+fmt(bd.cash)+'</div></div>'+
      '<div><div class="tiny muted">Deferred</div><div>'+fmt(bd.deferred)+'</div></div>'+
      '<div><div class="tiny muted">Earnout</div><div>'+fmt(bd.earnout)+'</div></div>'+
      '<div><div class="tiny muted">Escrow</div><div>'+fmt(bd.escrow||0)+'</div></div>'+
      '</div>';
    if(bd.chip) h += '<div class="tiny bad" style="margin-bottom:6px">Diligence has chipped '+fmt(bd.chip)+' off the headline.</div>';
    h += '<div class="tiny muted">Conditions: '+bd.cond.map(esc).join(', ')+'.'+
      (bd.nonCompete? ' Non-compete: '+bd.nonCompete+' year(s).':'')+'</div>';
    h += '<div class="kv" style="margin-top:6px"><span><b>Your share after the preference stack</b></span><span class="mid '+(w.mine>0?'good':'bad')+'">'+fmt(w.mine)+'</span></div>';
    h += '<div class="tiny muted" style="margin-top:4px">Expires '+dateLabel(bd.expires)+' · diligence pass '+bd.dd+'/2</div>';
    h += '<div class="row wrap" style="gap:6px;margin-top:8px">'+
      '<button class="btn xs" data-a="biddd" data-i="'+bd.id+'">Invite diligence</button>'+
      '<button class="btn xs" data-a="bidnego" data-i="'+bd.id+'">Negotiate</button>'+
      '<button class="btn xs primary" data-a="bidaccept" data-i="'+bd.id+'">Take it to a vote</button>'+
      '<button class="btn xs bad" data-a="bidreject" data-i="'+bd.id+'">Reject</button>'+
      '</div></div>';
  });
  h += '</div>';
  return h;
}

function viewTargets(b){
  let h = '<div class="card"><h3>Things you could buy</h3>';
  const ts = (S.mkt && S.mkt.targets) || [];
  if(!ts.length){
    h += '<div class="tiny muted">Nothing on the market that a broker will show you. Brokers show opportunities to companies that look like they can complete \u2014 registered, and with real cash in the bank.</div>';
    h += '</div>'; return h;
  }
  ts.forEach(function(t){
    const fit = t.type === b.type;
    h += '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:10px">';
    h += '<div class="between"><b>'+esc(t.name)+'</b><span class="mono">'+fmt(t.asking)+'</span></div>';
    h += '<div class="tiny muted" style="margin:5px 0">'+esc(t.typeName)+' · '+t.outlets+' unit(s) · '+t.staff+' staff · '+
      fmt(t.revenue)+' revenue · '+(t.profit>=0?'<span class="good">'+fmt(t.profit)+' profit</span>':'<span class="bad">'+fmt(t.profit)+'</span>')+'</div>';
    h += '<div class="row wrap" style="gap:5px;margin-bottom:6px">'+
      (fit?'<span class="chip g">same sector</span>':'<span class="chip y">new sector</span>')+
      '<span class="chip'+(t.bidders>1?' r':'')+'">'+t.bidders+' other bidder'+(t.bidders>1?'s':'')+'</span>'+
      '<span class="tiny muted">expires '+dateLabel(t.expires)+'</span></div>';
    if(t.dd){
      const f = (t.hidden||[]).filter(function(x){ return x.found; });
      h += '<div class="tiny muted" style="margin-bottom:6px">Diligence '+(f.length? 'found: '+f.map(function(x){ return esc(x.label)+' ('+fmt(x.cost)+')'; }).join(', ')+'.':'came back clean.')+'</div>';
    } else h += '<div class="tiny muted" style="margin-bottom:6px">Diligence costs '+fmt(Math.round((t.asking||0)*0.012))+'. Undiscovered problems arrive after completion, at full price.</div>';
    h += '<div class="row wrap" style="gap:6px">'+
      (t.dd?'':'<button class="btn xs" data-a="tgtdd" data-i="'+t.id+'">Diligence</button>')+
      '<button class="btn xs primary" data-a="tgtbid" data-i="'+t.id+'">Bid</button>'+
      '</div></div>';
  });
  h += '<div class="tiny muted" style="margin-top:6px">Financing: cash you have, a bank facility against the target, a seller note, or paper \u2014 shares in this company, which dilutes you immediately.</div>';
  h += '</div>';
  return h;
}