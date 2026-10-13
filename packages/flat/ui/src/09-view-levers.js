
function viewLevers(){
  const b = S.biz;
  if(!b) return '<div class="card"><h3>Levers</h3><div class="tiny muted">Nothing to lever yet. '+
    'The dials, the commitments, the negotiations and the things you cannot control all belong to a business you do not have.</div></div>';
  const react = leverColReact(b);
  return '<div class="levers">'+ leverColSet(b) + leverColCommit(b) + leverColNego(b) + (react||'') +'</div>'+
    '<div class="card" style="margin-top:12px"><h3>How to read this screen</h3>'+
    '<div class="tiny muted" style="line-height:1.7">One screen, four columns, sorted by how much it costs you to change your mind. '+
    'The first column you can turn tonight and turn back tomorrow, which is why it is not where any business is won. '+
    'The second you are stuck with for quarters, and getting out costs more than staying in ever felt like — that is the column that decides things. '+
    'The third belongs to somebody else as much as to you, and is usually lost by not turning up. '+
    'The fourth is not yours at all: it shows itself when it begins to cost you money, and the only choice it offers is how you answer.</div></div>';
}
/* --------------------------------- Outlets ---------------------------------- */
function viewOutlets(){
  const b = S.biz; if(!b) return '';
  const T = BIZ.find(function(x){return x.id===b.type;});
  let h = '<div class="card"><h3>Units <span class="tag">'+outletCount(b)+' \u00b7 '+fmt(Math.round(outletRent(b)*S.cumInfl/b.startInfl))+'/q rent</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">Each unit has its own lease, its own condition and its own staff. '+
    'Condition decays with trade and can be held up with maintenance spend. Neglected units quietly lose you the customers standing in them.</div>';
  (b.outlets||[]).forEach(function(o){
    const cm = CITIES.find(function(c){ return c.id===(o.city||S.city); }) || CITY();
    const cond = o.cond===undefined?80:o.cond;
    const condCol = cond>=65?'var(--good)':cond>=40?'var(--warn)':'var(--bad)';
    const st = outletStaff(b, o.id);
    const upCost = Math.round((o.fitout||3000000)*0.55*(o.size||1)*S.cumInfl);
    h += '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">'+
      '<div class="between"><div><b>'+esc(o.name)+'</b> <span class="tiny muted">\u00b7 '+esc(cm.label)+' \u00b7 size '+(o.size||1)+'</span></div>'+
      '<span class="chip" style="background:'+condCol+'22;color:'+condCol+'">Condition '+Math.round(cond)+'</span></div>'+
      '<div style="margin:6px 0">'+bar(cond,100,condCol)+'</div>'+
      '<div class="tiny muted">'+fmt(Math.round((o.rent||0)*S.cumInfl/b.startInfl))+'/mo \u00b7 lease '+(o.end>0?o.end+'q':'RENEWAL DUE')+
      ' \u00b7 '+st.length+' staff assigned'+(o.hikes?' \u00b7 '+o.hikes+' rent increase'+(o.hikes>1?'s':''):'')+'</div>'+
      '<div class="row wrap" style="margin-top:8px;gap:5px">'+
      (o.end<=1? '<button class="btn xs primary" data-a="rentnego" data-o="'+o.id+'">Negotiate the renewal</button>':'')+
      '<button class="btn xs" data-a="upgradeoutlet" data-o="'+o.id+'"'+(b.cash<upCost?' disabled aria-disabled="true" title="Needs '+fmt(upCost)+' in the company \u00b7 it has '+fmt(b.cash)+' \u00b7 short '+fmt(Math.round(upCost - b.cash))+'"':'')+'>Extend ('+fmt(upCost)+')</button>'+
      '<button class="btn xs" data-a="maintainoutlet" data-o="'+o.id+'">Maintain</button>'+
      ((b.outlets||[]).length>1? '<button class="btn xs bad" data-a="closeoutlet" data-o="'+o.id+'">Close unit</button>':'')+
      '</div></div>';
  });
  const newCost = Math.round(Math.max(2500000, (b.revenue||0)*0.45 + T.rentQ*3)*S.cumInfl*CITY().rentMult);
  h += '<hr class="sep"><div class="row wrap" style="gap:6px">'+
    '<button class="btn sm" data-a="openoutlet" data-c="'+S.city+'"'+(b.cash<newCost?' disabled aria-disabled="true" title="Needs '+fmt(newCost)+' in the company \u00b7 it has '+fmt(b.cash)+' \u00b7 short '+fmt(Math.round(newCost - b.cash))+'"':'')+'>Open a unit here ('+fmt(newCost)+')</button>'+
    CITIES.filter(function(c){ return c.id!==S.city; }).slice(0,3).map(function(c){
      const cost = Math.round(Math.max(2500000, (b.revenue||0)*0.45 + T.rentQ*3)*S.cumInfl*c.rentMult);
      return '<button class="btn sm" data-a="openoutlet" data-c="'+c.id+'"'+(b.cash<cost?' disabled aria-disabled="true" title="Needs '+fmt(cost)+' in the company to open in '+esc(c.label)+' \u00b7 it has '+fmt(b.cash)+' \u00b7 short '+fmt(Math.round(cost - b.cash))+'"':'')+'>'+esc(c.label)+' ('+fmt(cost)+')</button>';
    }).join('')+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:7px">Opening in another city costs more and cannot be managed as closely \u2014 but it is real diversification in a country where one city can stop trading for a month.</div>';
  h += '</div>';
  return h;
}

/* -------------------------------- Contracts --------------------------------- */
function viewContracts(){
  const b = S.biz; if(!b) return '';
  let h = '<div class="card"><h3>Contracts <span class="tag">'+((b.contracts||[]).length)+' live</span></h3>';
  const cs = b.contracts||[];
  if(!cs.length){
    h += '<div class="small muted">No contracted revenue. Everything you earn, you earn again every quarter from scratch. '+
      'Contracts are the difference between a business and a very demanding hobby.</div>';
  } else {
    cs.forEach(function(c){
      const marginCol = (c.margin||0)>=0.25?'var(--good)':(c.margin||0)>=0.08?'var(--warn)':'var(--bad)';
      h += '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">'+
        '<div class="between"><div><b>'+esc(c.client||'a client')+'</b> <span class="tiny muted">\u00b7 '+esc(c.kindName||'Contract')+'</span></div>'+
        '<span class="chip" style="background:'+marginCol+'22;color:'+marginCol+'">margin '+Math.round((c.margin||0)*100)+'%</span></div>'+
        '<div class="tiny muted" style="margin:5px 0">'+fmt(Math.max(0,c.value||0))+'/quarter \u00b7 paid in '+(c.payDays||30)+' days \u00b7 '+
        (c.turns>0? c.turns+' quarter'+(c.turns===1?'':'s')+' left':'up for renewal')+
        (c.renewals? ' \u00b7 renewed '+c.renewals+'\u00d7':'')+'</div>'+
        ((c.incidents||[]).length? '<div class="tiny bad">Incidents so far: '+c.incidents.length+'</div>':'')+
        '<div class="row wrap" style="margin-top:7px;gap:5px">'+
        (c.turns<=1? '<button class="btn xs primary" data-a="renewc" data-c="'+c.id+'">Negotiate the renewal</button>':'')+
        '<button class="btn xs bad" data-a="dropc" data-c="'+c.id+'">Walk away from it</button>'+
        '</div></div>';
    });
  }
  const offs = b.offersC || [];
  h += '<hr class="sep"><h3 style="font-size:14px">On tender</h3>';
  if(!offs.length){
    h += '<div class="tiny muted">'+(b.formal? 'Nothing out to tender this quarter.' : 'Nothing out to tender. Unregistered businesses are not invited to bid for most of this work.')+'</div>';
  } else {
    offs.forEach(function(o){
      h += '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">'+
        '<div class="between"><b>'+esc(o.client)+'</b><span class="chip b">'+fmt(o.value)+'/q</span></div>'+
        '<div class="tiny muted" style="margin:5px 0">'+esc(o.kindName)+' \u00b7 '+o.months+' months \u00b7 paid in '+o.payDays+' days \u00b7 '+
        'expires in '+(o.expires-S.turn)+'q</div>'+
        '<div class="tiny muted" style="margin-bottom:7px">Bid lower to win it more often. Bid lower still and you win work you lose money on.</div>'+
        '<div class="row wrap" style="gap:4px">'+
        contractBidOptions().map(function(x){
          return '<button class="btn xs" data-a="bid" data-o="'+o.id+'" data-v="'+x.id+'">'+esc(x.label.split(' \u2014 ')[0])+' \u00b7 '+fmt(Math.round(o.value*(1-x.disc)))+'</button>';
        }).join('')+
        '</div></div>';
    });
  }
  h += '</div>';
  return h;
}

/* ---------------------------------- People ---------------------------------- */
function viewStaffDeep(){
  const b = S.biz; if(!b) return '';
  let h = '<div class="card"><h3>Team <span class="tag">'+(b.staff||[]).length+' staff \u00b7 '+fmt(staffMonthly(b))+'/mo</span></h3>';
  if(!(b.staff||[]).length){
    h += '<div class="small muted">No staff. You are the operations department, the sales team and the cleaner.</div>';
  } else {
    h += '<table><tr><th>Name</th><th>Role</th><th>Unit</th><th class="num">Skill</th><th class="num">Salary</th><th>Morale</th><th></th></tr>';
    (b.staff||[]).forEach(function(st){
      const tr = TRAITS.find(function(x){ return x.id===st.trait; })||{name:'\u2014'};
      h += '<tr><td>'+esc(st.name)+'<div class="tiny muted">'+esc(tr.name)+'</div></td>'+
        '<td><select data-role="'+st.id+'" style="font-size:11px;padding:2px">'+
          Object.keys(STAFF_ROLES).filter(function(k){ return k!=='gm' || st.role==='gm' || st.skill>=6; }).map(function(k){
            return '<option value="'+k+'"'+((st.role||'ops')===k?' selected':'')+'>'+STAFF_ROLES[k].label+'</option>'; }).join('')+
        '</select></td>'+
        '<td><select data-outlet="'+st.id+'" style="font-size:11px;padding:2px">'+
          '<option value=""'+(st.outlet?'':' selected')+'>\u2014 none \u2014</option>'+
          (b.outlets||[]).map(function(o){ return '<option value="'+o.id+'"'+(st.outlet===o.id?' selected':'')+'>'+esc(o.name)+'</option>'; }).join('')+
        '</select></td>'+
        '<td class="num">'+st.skill+'/10'+(st.trained?' <span class="tiny good">+'+st.trained+'</span>':'')+'</td>'+
        '<td class="num">'+fmt(st.salary)+'</td>'+
        '<td>'+bar(st.morale,100,st.morale>60?'var(--good)':st.morale>35?'var(--warn)':'var(--bad)')+'</td>'+
        '<td class="num" style="white-space:nowrap">'+
          '<button class="btn xs" data-a="trainstaff" data-s="'+st.id+'">Train</button> '+
          '<button class="btn xs" data-a="raisenego" data-s="'+st.id+'">Pay review</button> '+
          ((st.role!=='gm' && st.skill>=6 && !hasGM(b))? '<button class="btn xs" data-a="promotegm" data-s="'+st.id+'">Make GM</button> ':'')+
          '<button class="btn xs bad" data-a="firenego" data-s="'+st.id+'">Let go</button>'+
        '</td></tr>';
    });
    h += '</table>';
    h += '<div class="tiny muted" style="margin-top:8px">A general manager frees your attention and lets you run other things. '+
      'Someone assigned to a unit works better there; unassigned staff in a multi-unit business lose effectiveness.</div>';
  }
  h += '</div>';
  return h;
}
/* ------------------------------- Engine room -------------------------------- */
function viewEngine(){
  const b = S.biz; if(!b) return '';
  const T = BIZ.find(function(x){return x.id===b.type;});
  const st = BIZ_STAGES[b.stage] || BIZ_STAGES.startup;
  const rev = Math.max(1, b.revenue||0);
  let h = '<div class="grid g2">';

  /* ---- stage + diagnostics ---- */
  h += '<div class="card"><div class="between"><h3 style="margin:0">Engine room <span class="chip '+
       (b.stage==='decline'?'r':b.stage==='scale'||b.stage==='maturity'?'g':'')+'">'+st.label+'</span></h3>'+
       '<span class="tiny muted">Quarter '+(b.quarters||0)+' of trading</span></div>'+
       '<div class="tiny muted" style="margin-top:6px">'+esc(st.note)+'</div>';
  const diag = b.diag || [];
  if(diag.length){
    h += '<hr class="sep">';
    diag.slice(0,7).forEach(function(d){
      const c = d.level==='bad'?'var(--bad)':'var(--warn)';
      h += '<div style="border-left:2px solid '+c+';padding:3px 0 3px 9px;margin-bottom:6px" class="small">'+esc(d.text)+'</div>';
    });
  } else {
    h += '<hr class="sep"><div class="small" style="color:var(--good)">Nothing structurally wrong that the numbers can see. This is rare. Enjoy it.</div>';
  }
  h += '</div>';

  /* ---- working capital levers ---- */
  /* world-first: the levers live where they act - the stock beside the
     premises, the customers at the door, you, the premises themselves - and
     here each is a tile that opens the same card. (i) brings the card back. */
  if(sceneFirst()){
    h += '<div class="card" style="margin-top:12px"><h3>Levers <span class="tag">take effect next quarter</span></h3>'+
      '<div class="facerow">'+machineTilesHTML(b)+'</div>'+
      '<div class="tiny muted prose">Tap a tile, or the thing in the picture: the stock, the customers, yourself, the premises.</div></div>';
  } else {
    h += '<div class="card" style="margin-top:12px"><h3>Levers <span class="tag">take effect next quarter</span></h3>'+
      '<div class="tiny muted" style="margin-bottom:10px">These are the four decisions that decide whether a profitable business has money. '+
      'Profit is an opinion. Cash is a fact, and these levers are what turn one into the other.</div>';
    /* the three levers and the three buttons - core's, the cards have the same */
    h += leverSliderHTML(b,'cred') + leverSliderHTML(b,'stock') + leverSliderHTML(b,'draw');
    h += '<div class="row wrap" style="margin-top:4px">'+coverButtonsHTML(b)+'</div>';
    h += '<div class="tiny muted" style="margin-top:8px">Automation '+Math.round(b.auto||0)+'/100 — raises output per person and improves stock control. '+
         'Compliance '+Math.round(b.compliance||40)+'/100 — this is what an assessment will be judged against.</div>';
    h += '</div>';
  }

  /* ---- balance sheet + P&L ---- */
  const equip = Math.max(0, b.capex||0);
  const assets = Math.max(0,b.cash||0) + (b.recv||0) + (b.inventory||0) + equip;
  const liabs = (b.payable||0) + (b.arrears||0);
  h += '<div class="card" style="margin-top:12px"><h3>Position</h3>'+
    '<div class="tiny muted" style="margin-bottom:8px">Balance sheet, roughly. The gap between the top half and the bottom half is what you actually own.</div>'+
    '<div class="kv"><span class="muted">Cash</span><span class="'+(b.cash<0?'bad':'')+'">'+fmt(Math.round(b.cash||0))+'</span></div>'+
    '<div class="kv"><span class="muted">Owed by customers</span><span>'+fmt(Math.round(b.recv||0))+'</span></div>'+
    '<div class="kv"><span class="muted">Stock on hand</span><span>'+fmt(Math.round(b.inventory||0))+'</span></div>'+
    '<div class="kv"><span class="muted">Equipment &amp; fit-out</span><span>'+fmt(equip)+'</span></div>'+
    '<div class="kv"><b>Total</b><b>'+fmt(Math.round(assets-liabs))+'</b></div>'+
    '<hr class="sep">'+
    '<div class="kv"><span class="muted">Owed to suppliers</span><span class="'+((b.payable||0)>rev*0.8?'bad':'')+'">'+fmt(Math.round(b.payable||0))+'</span></div>'+
    '<div class="kv"><span class="muted">Wages in arrears</span><span class="'+((b.arrears||0)>0?'bad':'')+'">'+fmt(Math.round(b.arrears||0))+'</span></div>'+
    '<hr class="sep">'+
    '<div class="kv"><span class="muted">Revenue</span><span>'+fmt(b.revenue)+'</span></div>'+
    '<div class="kv"><span class="muted">Cost of goods</span><span>'+fmt(b.cogs)+'</span></div>'+
    '<div class="kv"><span class="muted">Overheads</span><span>'+fmt(b.opex)+'</span></div>'+
    '<div class="kv"><b>Profit</b><b class="'+(b.profit>=0?'good':'bad')+'">'+fmt(b.profit)+'</b></div>'+
    '<div class="tiny muted" style="margin-top:8px">Written off as bad debt this quarter: '+fmt(b.badDebtQ||0)+
    '. Lost to shrinkage and spoilage: '+fmt(b.shrinkQ||0)+'.</div>';
  const cashRun = (b.cash||0)>0 ? ((b.cash||0)/Math.max(1,(b.opex||0))).toFixed(1) : '0';
  h += '<div class="tiny muted" style="margin-top:5px">At current overheads the company has <b>'+cashRun+'</b> quarters of cash.</div>';
  h += '</div>';

  /* ---- conditions ---- */
  /* world-first: every line of it is on a card the tiles open */
  if(sceneFirst()){ h += '</div>'; return h; }
  h += '<div class="card" style="margin-top:12px"><h3>Conditions</h3>';
  const L = b.lease||{};
  h += '<div class="kv"><span class="muted">Premises</span><span>'+fmt(Math.round(L.rent||0))+'/mo · '+(L.end>0? L.end+'q left on lease':'RENEWAL DUE')+'</span></div>';
  const sConf = b.supplierConf===undefined?70:b.supplierConf;
  h += '<div class="kv"><span class="muted">Supplier confidence</span><span>'+bar(sConf,100,sConf>60?'var(--good)':sConf>35?'var(--warn)':'var(--bad)')+'</span></div>';
  h += '<div class="kv"><span class="muted">Supplier terms</span><span>'+(b.supplierDays||30)+' days</span></div>';
  h += '<div style="margin-top:8px"><button class="btn xs" data-a="supplnego">Renegotiate supplier terms</button></div>'+
    '<div class="tiny muted" style="margin-top:6px">Your suppliers finance most of the stock you sell. '+
    'Longer terms mean more stock on the shelf without cash; the relationship is what buys you those terms, and it is spent by stretching them.</div>';
  h += '<div class="kv"><span class="muted">Tax exposure</span><span>'+bar(b.taxRisk||0,100,(b.taxRisk||0)>65?'var(--bad)':(b.taxRisk||0)>35?'var(--warn)':'var(--good)')+'</span></div>';
  h += '<div class="kv"><span class="muted">Insurance</span><span>'+(b.insured===true?'Full':b.insured?'Partial':'<span class="bad">None</span>')+'</span></div>';
  if(b.keyClient) h += '<div class="kv"><span class="muted">Concentration</span><span class="'+(b.keyClient.share>0.3?'bad':'')+'">'+esc(b.keyClient.name)+' · '+Math.round(b.keyClient.share*100)+'% of revenue</span></div>';
  if((b.contracts||[]).length) b.contracts.forEach(function(c){
    h += '<div class="kv"><span class="muted">Contract</span><span>'+esc(c.client||'Client')+' · '+c.turns+'q left</span></div>'; });
  if((b.incidents||[]).length) b.incidents.forEach(function(i){
    h += '<div class="kv"><span class="muted">Lingering</span><span class="bad">'+esc(i.name)+' ('+i.turns+'q)</span></div>'; });
  h += '<div class="kv"><span class="muted">Product lines</span><span>'+(b.products||1)+'</span></div>';
  h += '<div class="kv"><span class="muted">Locations</span><span>'+b.locations+'</span></div>';
  h += '</div>';
  h += '</div>';
  return h;
}
/* ---------------------------------- Deals ---------------------------------- */
function viewDeals(){
  let h = '';
  h += '<div class="grid g2"><div>';
  /* ── Money > Deals, redesigned (the redesign's phase 7) ───────────────────
     Measured first: 1,200 characters in the way, and 429 of them were a card of
     pure background — three paragraphs of how to think about deals — with the
     deal rows themselves carrying a description above the odds they are about.

     What it is now: each deal is a row that leads with its terms as chips
     (quarters, upside, how often they work out, who introduced it, what it
     asks for) and keeps its own sentence one tap away under **What it is**; the
     background card's three paragraphs are one fold called **The three rules**;
     and the card's opening line is folded too. The rows' "Commit ₦N" and "Pass"
     controls are untouched, including the refusal text on a disabled Commit. */
  h += '<div class="card"><h3>On the table</h3>'+
    foldHTML('Why deals expire', 'Deals expire. The good ones expire fastest. '+
    'Nobody is going to hold an opportunity open while you think about it for a year.');
  const ds = S.deals||[];
  if(!ds.length) h += '<div class="tiny muted">Nothing on the table this quarter. Check back.</div>';
  h += ds.map(function(d){
    return '<div class="mrow">'+
      '<div class="between"><b>'+esc(d.name)+'</b><span class="row wrap" style="gap:4px;justify-content:flex-end">'+
        '<span class="chip">'+d.turns+' quarter'+(d.turns===1?'':'s')+'</span>'+
        '<span class="chip g">upside +'+Math.round(d.ret*100)+'%</span>'+
        '<span class="chip">'+Math.round((1-d.risk)*100)+'% work out</span>'+
        (d.via?'<span class="chip b">via '+esc(d.via)+'</span>':'')+
        '<span class="chip b">'+fmt(d.capital)+'</span>'+
      '</span></div>'+
      foldHTML('What it is', esc(d.desc))+
      '<div class="row wrap" style="margin-top:8px">'+
      /* the shortfall is on the row, not only in the title: a phone never
         shows a tooltip, so the refusal said nothing at 390px */
      (S.fin.cash<d.capital?'<span class="chip y">short '+fmt(Math.round(d.capital - S.fin.cash))+'</span>':'')+
      '<button class="btn xs primary" data-a="takedeal" data-d="'+d.id+'"'+(S.fin.cash<d.capital?' disabled aria-disabled="true" title="Needs '+fmt(d.capital)+' \u00b7 you have '+fmt(S.fin.cash)+' \u00b7 short '+fmt(Math.round(d.capital - S.fin.cash))+' \u00b7 pass it and it is gone"':'')+'>Commit '+fmt(d.capital)+'</button>'+
      '<button class="btn xs" data-a="passdeal" data-d="'+d.id+'">Pass</button>'+
      '</div></div>';
  }).join('');
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Committed capital</h3>';
  const act = S.active||[];
  if(!act.length) h += '<div class="tiny muted">Nothing running. Capital sitting still is not the same as capital being safe.</div>';
  h += act.map(function(a){
    return '<div class="logline" style="border-left-color:var(--acc)"><div class="t">'+esc(a.name)+' · resolves '+dateLabel(a.due)+'</div>'+
      fmt(a.capital)+' committed'+(a.via? ' · introduced by '+esc(a.via):'')+'</div>';
  }).join('');
  h += '</div></div><div>';
  h += '<div class="card"><h3>How to read these</h3>'+
    /* the card keeps its heading (the grouping table names it) and its three
       paragraphs; they are one tap away under one label instead of 429
       characters of reading in front of the deals */
    foldHTML('The three rules',
    'A deal is a bet with a date on it. The listed odds are honest averages, not promises — the same deal can return '+
    'twice your money or a third of it.<br><br>'+
    'The correct size for a speculative deal is the amount you could hand over and never mention again. '+
    'Most people learn this by doing the opposite.<br><br>'+
    'Deals introduced by people who like you are more common and no safer. Being introduced is not the same as being protected.')+
    '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Partnership offers</h3>';
  if(S.biz && S.offers && S.offers.length){
    h += S.offers.map(function(o,i){
      return '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">'+
        '<div class="between"><b>'+esc(o.name)+'</b><span class="chip p">'+o.equity+'% for '+fmt(o.capital)+'</span></div>'+
        '<div class="tiny muted" style="margin:5px 0">'+esc(o.bg)+'. Brings <b>'+esc(o.skill)+'</b>. '+esc(o.ask)+'.</div>'+
        '<div class="row wrap" style="gap:6px">'+
      '<button class="btn xs primary" data-a="takepartner" data-i="'+o.id+'">Shake hands</button>'+
      '<button class="btn xs ghost" data-a="declineoffer" data-i="'+o.id+'">Not now</button></div>'+
      '</div>';
    }).join('');
  } else h += '<div class="tiny muted">Nobody is offering to go into business with you at the moment.</div>';
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Last twelve months</h3>'+
    ((S.digest||[]).filter(function(d){ return d.kind==='deal'; }).map(function(d){
      return '<div class="logline" style="border-left-color:'+(d.tone==='good'?'var(--good)':'var(--bad)')+'"><div class="t">'+dateLabel(d.turn)+'</div>'+esc(d.text)+'</div>';
    }).join('') || '<div class="tiny muted">No deal history yet.</div>')+'</div>';
  h += '</div></div>';
  return h;
}

/* ----------------------------------- Work ---------------------------------- */
function viewWork(){
  let h = '';
  h += portfolioBar();
  h += viewAgenda();
  if(S.biz){
    h += viewEngine();
    h += '<div class="grid g2"><div>'+viewOutlets()+'</div><div>'+viewContracts()+'</div></div>';
    h += viewStaffDeep();
    h += viewBiz();
  } else {
    h += viewBiz();
  }
  h += viewCareer();
  h += viewHousehold();
  h += viewLife();
  if(!S.biz){
    h += '<div class="card"><h3>Or, start something</h3>'+
      '<div class="tiny muted" style="margin-bottom:10px">You do not have a business. You could get one. '+
      'It is the fastest way to turn a decade into either an asset or a story you tell at weddings.</div>'+
      '<div class="row wrap">'+BIZ.map(function(b){
        const cost = startBizCost(b.id);
        return '<button class="btn sm" data-a="startbiz" data-t="'+b.id+'">'+esc(b.name)+' · '+fmt(cost)+'</button>';
      }).join('')+'</div></div>';
  }
  return h;
}