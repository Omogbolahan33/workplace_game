

function viewPack(b){
  if(!b) return '<div class="card"><h3>Investor pack</h3><div class="small muted">No company selected.</div></div>';
  const a = bizAccounts(b);
  const P = b.plan && b.plan.status==='approved' ? b.plan : null;
  const V = planVariance(b);
  const pl = planLabel(b);
  let h = '';

  /* ---- P&L ---- */
  h += '<div class="card"><h3>Management accounts <span class="tag">quarter ended '+dateLabel(S.turn)+'</span></h3>';
  if(!a.h.length){ h += '<div class="tiny muted">No quarter has closed yet.</div></div>'; return h; }
  h += acctRow('Revenue', a.revenue, delta(a.revenue, a.yoy?a.yoy.revenue:null));
  h += acctRow('Cost of sales', -a.cogs);
  h += acctRow('Gross profit', a.gross, undefined, function(v){ return fmt(v)+' <span class="tiny muted">'+pct(a.gm,0)+'</span>'; });
  h += acctRow('Operating costs', -a.opex, undefined, function(v){ return fmt(v)+' <span class="tiny muted">'+pct(a.om,0)+' of revenue</span>'; });
  h += '<hr class="sep">';
  h += acctRow('<b>EBITDA</b>', a.ebitdaQ, delta(a.ebitdaQ, a.yoy?a.yoy.ebitda:null));
  h += acctRow('Depreciation', -a.dep);
  h += acctRow('Interest', -a.interest);
  h += acctRow('Tax', -(a.cur.tax||0));
  h += acctRow('<b>Net profit</b>', a.profit, delta(a.profit, a.yoy?a.yoy.profit:null),
        function(v){ return '<span class="'+(v>=0?'good':'bad')+'">'+fmt(v)+'</span> <span class="tiny muted">'+pct(a.nm,0)+'</span>'; });
  h += '<hr class="sep">';
  h += acctRow('Trailing twelve months: revenue', a.revTTM);
  h += acctRow('Trailing twelve months: EBITDA', a.ebitda, undefined, function(v){ return '<span class="'+(v>=0?'good':'bad')+'">'+fmt(v)+'</span>'; });
  h += '</div>';

  /* ---- cash + working capital ---- */
  h += '<div class="card" style="margin-top:12px"><h3>Cash and working capital</h3>';
  h += acctRow('Opening cash', a.openCash);
  h += acctRow('Operating', Math.round(a.profit + a.dep - a.wcMove));
  h += acctRow('Working capital movement', -Math.round(a.wcMove), undefined, function(v){
    return '<span class="'+(v<=0?'good':'bad')+'">'+fmt(v)+'</span>'; });
  h += acctRow('Capital expenditure', -a.capexQ);
  h += acctRow('Financing and other', a.financing);
  h += acctRow('<b>Closing cash</b>', a.closeCash, undefined, function(v){ return '<span class="'+(v>=0?'good':'bad')+'">'+fmt(v)+'</span>'; });
  h += '<hr class="sep"><div class="grid g4" style="margin-top:4px">'+
    '<div><div class="tiny muted">Receivable days</div><div class="mid">'+a.dso+'</div></div>'+
    '<div><div class="tiny muted">Inventory days</div><div class="mid">'+a.dio+'</div></div>'+
    '<div><div class="tiny muted">Payable days</div><div class="mid">'+a.dpo+'</div></div>'+
    '<div><div class="tiny muted">Cash cycle</div><div class="mid '+(a.ccc<45?'good':a.ccc>90?'bad':'warn')+'">'+a.ccc+'</div></div>'+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:7px">The cash cycle is how long a naira spends inside the business before it comes back. '+
    (a.ccc>90? 'Yours is '+a.ccc+' days, which means growth consumes cash faster than it generates it.':
     a.ccc<45? 'Yours is '+a.ccc+' days. Growth here is close to self-funding.':'Yours is '+a.ccc+' days, which is normal and worth watching.')+'</div>';
  h += '</div>';

  /* ---- KPIs ---- */
  h += '<div class="card" style="margin-top:12px"><h3>Operating KPIs</h3><div class="grid g4">'+
    '<div><div class="tiny muted">Capacity used</div><div class="mid">'+pct(a.util,0)+'</div></div>'+
    '<div><div class="tiny muted">Revenue per head</div><div class="mid">'+(a.staff>0?fmt(a.revPerHead):'\u2014')+'</div></div>'+
    '<div><div class="tiny muted">Revenue per unit</div><div class="mid">'+fmt(a.revPerUnit)+'</div></div>'+
    '<div><div class="tiny muted">Headcount</div><div class="mid">'+a.staff+'</div></div>'+
    '</div>';
  if((b.externalPct||0) > 0){
    h += '<hr class="sep"><div class="grid g3">'+
      '<div><div class="tiny muted">Quarterly burn</div><div class="mid '+(a.burn>0?'bad':'')+'">'+(a.burn>0?fmt(a.burn):'profitable')+'</div></div>'+
      '<div><div class="tiny muted">Runway</div><div class="mid '+(a.runway<4?'bad':a.runway<8?'warn':'good')+'">'+(a.runway>=99?'indefinite':a.runway+' quarters')+'</div></div>'+
      '<div><div class="tiny muted">Company debt</div><div class="mid '+(a.debt>0?'warn':'')+'">'+fmt(a.debt)+'</div></div>'+
      '</div>';
    h += '<div class="tiny muted" style="margin-top:7px">'+
      (a.runway<4 ? 'Under four quarters of runway, outside shareholders stop asking about strategy and start asking about the next raise.'
       : a.runway<8 ? 'Eight quarters is enough to raise from a position of strength. Fewer is not.'
       : 'You have time, which is the only thing money cannot buy later.')+'</div>';
  }
  h += '</div>';

  /* ---- valuation ---- */
  const VB = valuationBridge(b);
  h += '<div class="card" style="margin-top:12px"><h3>What it is worth, and why <span class="tag">'+fmt(VB.equity)+' equity</span></h3>';
  h += '<div class="grid g4">'+
    '<div><div class="tiny muted">Enterprise value</div><div class="mid">'+fmt(VB.ev)+'</div></div>'+
    '<div><div class="tiny muted">Net debt / (cash)</div><div class="mid '+(VB.netDebt>0?'bad':'good')+'">'+fmt(VB.netDebt)+'</div></div>'+
    '<div><div class="tiny muted">Equity value</div><div class="mid">'+fmt(VB.equity)+'</div></div>'+
    '<div><div class="tiny muted">EV / EBITDA</div><div class="mid">'+(VB.mult? VB.mult.toFixed(1)+'x' : 'n/a')+'</div></div>'+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:6px">Equity value is what the shares are worth. Enterprise value is what the business is worth before what it owes is subtracted, and it is the number a trade buyer looks at.</div>';
  h += '<div class="tiny muted" style="margin:7px 0">Sector comparables trade at '+VB.comps[0]+'x to '+VB.comps[1]+'x EBITDA. '+
    (VB.mult? (VB.mult > VB.comps[1] ? 'You are above the range, which means a buyer will test the number hard.'
      : VB.mult < VB.comps[0] ? 'You are below the range. That is either the market or your accounts, and both are fixable.'
      : 'You are inside the range.') : 'With negative trailing EBITDA you are being valued on revenue and assets, not earnings.')+'</div>';
  h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:5px">What is moving the number:</div>';
  VB.drivers.forEach(function(d){
    h += '<div class="kv"><span><span class="chip '+(d.s==='+'?'g':d.s==='\u2212'?'r':'')+'">'+d.s+'</span> '+esc(d.t)+'</span></div>';
  });
  h += '<hr class="sep"><div class="kv"><span><b>Your share, after the preference stack</b></span><span class="mid '+(VB.mine>0?'good':'bad')+'">'+fmt(VB.mine)+'</span></div>';
  h += '</div>';

  /* ---- the plan ---- */
  h += '<div class="card" style="margin-top:12px"><h3>The plan <span class="tag">'+(P?(pl?pl.t:'approved'):'none' )+'</span></h3>';
  if(!P){
    h += '<div class="tiny muted">You have no approved operating plan. A board that has not approved a plan will judge you against whatever number it invents, which is always the least generous available.</div>';
    h += '<button class="btn sm primary" style="margin-top:9px" data-a="proposeplan">Put a plan to the board</button>';
  } else {
    h += '<div class="grid g2"><div>';
    h += '<div class="kv"><span class="muted">Revenue (annual)</span><span>'+fmt(P.revenue)+' <span class="tiny muted">actual TTM '+fmt(a.revTTM)+'</span></span></div>';
    h += '<div class="kv"><span class="muted">Gross margin</span><span>'+P.gm+'% <span class="tiny muted">actual '+pct(a.gm,0)+'</span></span></div>';
    h += '<div class="kv"><span class="muted">Operating costs</span><span>'+fmt(P.opex)+' <span class="tiny muted">actual '+fmt(a.opex*4)+'</span></span></div>';
    h += '<div class="kv"><span class="muted">EBITDA</span><span>'+fmt(P.ebitda)+' <span class="tiny muted">actual '+fmt(a.ebitda)+'</span></span></div>';
    h += '<div class="kv"><span class="muted">Headcount</span><span>'+P.headcount+' <span class="tiny muted">actual '+a.staff+'</span></span></div>';
    h += '</div><div>';
    if(V){
      const rows = [['Revenue', V.rev], ['EBITDA', V.ebitda], ['Operating costs', -V.opex]];
      rows.forEach(function(r){
        /* the variance in a P&L row: the rows are [label, figure] pairs and the
       figure is a number the string path has always compared as one */
    const v = /** @type {number} */ (r[1]), c = (r[0]==='Operating costs') ? (v>0?'bad':'good') : (v>=0?'good':'bad');
        h += '<div class="kv"><span class="muted">'+r[0]+' variance</span><span class="'+c+'">'+(v>=0?'+':'\u2212')+pct(Math.abs(v),0)+'</span></div>';
      });
      h += '<div class="kv"><span class="muted">Headcount variance</span><span>'+(V.head>=0?'+':'')+V.head+'</span></div>';
      h += '<div class="kv"><span class="muted">Quarters into the plan</span><span>'+V.quarters+'</span></div>';
      h += (pl? '<div class="chip '+pl.c+'" style="margin-top:8px">'+pl.t+'</div>':'');
    }
    h += '</div></div>';
    h += '<div class="tiny muted" style="margin-top:8px">Approved '+dateLabel(P.turn||S.turn)+'. Directors judge you on variance against these numbers, not on the absolute result. '+
      'A small miss explained early is survivable. A large miss discovered at year end is not.</div>';
    h += '<button class="btn sm" style="margin-top:9px" data-a="proposeplan">Re-plan</button>';
  }
  h += '</div>';

  /* ---- covenants ---- */
  const covs = covenantsOf(b);
  h += '<div class="card" style="margin-top:12px"><h3>Covenants <span class="tag">'+covs.length+' tested quarterly</span></h3>';
  if(!covs.length){
    h += '<div class="tiny muted">No financial covenants. Company borrowing brings them, and they are tested every quarter whether or not you are thinking about them.</div>';
  } else {
    covs.forEach(function(c){
      const st = covenantState(c, b);
      const K = COVENANT_KINDS[c.kind]||{label:c.kind, unit:'', desc:''};
      const fv = function(v){ return c.kind==='mincash'||c.kind==='capex' ? fmt(Math.round(v)) : (c.kind==='conc'? Math.round(v)+'%' : v.toFixed(2)+'x'); };
      h += '<div style="border:1px solid '+(st.ok?(st.tight?'rgba(255,159,67,.4)':'var(--line)'):'rgba(255,95,109,.45)')+';border-radius:9px;padding:9px;margin-bottom:8px">';
      h += '<div class="between"><b>'+esc(K.label)+'</b><span class="chip '+(st.ok?(st.tight?'y':'g'):'r')+'">'+(st.ok?(st.tight?'tight':'in compliance'):'BREACHED')+'</span></div>';
      h += '<div class="tiny muted" style="margin:4px 0">'+esc(K.desc)+'</div>';
      h += '<div class="grid g3"><div><div class="tiny muted">Limit</div><div>'+(c.kind==='keyman'?'\u2014':fv(c.limit))+'</div></div>'+
        '<div><div class="tiny muted">Actual</div><div class="'+(st.ok?'':'bad')+'">'+(c.kind==='keyman'?(b.founderOusted?'you were removed':'you are still MD'):fv(st.actual))+'</div></div>'+
        '<div><div class="tiny muted">Headroom</div><div class="'+(st.ok?'':'bad')+'">'+(c.kind==='keyman'?'\u2014':fv(Math.abs(st.headroom)))+'</div></div></div>';
      h += '<div class="tiny muted" style="margin-top:5px">Imposed by '+esc(c.from)+'.'+(c.waived? ' Waived '+c.waived+' time(s).':'')+'</div>';
      h += '</div>';
    });
    h += '<div class="tiny muted">A breach is not automatic death. It is a conversation, and the bank sets the price of the conversation \u2014 a fee, tighter terms, sometimes a seat or a share of the company.</div>';
  }
  h += '</div>';

  /* ---- option pool ---- */
  h += '<div class="card" style="margin-top:12px"><h3>Option pool <span class="tag">'+pct((b.pool||0)/100,1)+' unallocated</span></h3>';
  const vested = vestedOptions(b);
  if(!vested.length && !(b.pool||0)){
    h += '<div class="tiny muted">No pool. Serious investors will require one before they subscribe, and they will require it to come out of your side of the register.</div>';
    h += '<button class="btn sm" style="margin-top:9px" data-a="tablepool">Propose a pool</button>';
  } else {
    if(vested.length){
      h += '<div class="tiny muted" style="margin-bottom:6px">Granted and vesting:</div>';
      vested.forEach(function(v){
        h += '<div class="kv"><span>'+esc(v.st.name)+' <span class="tiny muted">'+esc(v.st.role||'')+'</span></span>'+
          '<span>'+pct(v.pct/100,2)+' <span class="tiny muted">'+pct(v.vested,0)+' vested</span></span></div>';
      });
    }
    h += '<div class="tiny muted" style="margin-top:7px">Options dilute every holder on exit. Granting '+pct(1,0)+' of the company to the person who runs it is how you keep them; '+
      'granting it to everybody is how you arrive at the exit with less than you expected.</div>';
    h += '<div class="row wrap" style="gap:6px;margin-top:9px">'+
      '<button class="btn xs" data-a="tablepool">Top the pool up</button>'+
      ((b.staff||[]).length? '<button class="btn xs" data-a="grantopt">Grant options</button>':'')+
      '</div>';
  }
  h += '</div>';

  return h;
}

function viewGovernance(){
  const b = S.biz;
  if(!b) return '<div class="card"><h3>Governance</h3><div class="small muted">You do not own a company. There is nothing to govern.</div></div>';
  ensureGov(b);
  if(!UI.govSub) UI.govSub = 'pack';
  const list = bizList();
  let h = '';
  if(list.length>1){
    h += '<div class="card"><h3>Which company</h3><div class="row wrap" style="gap:6px">';
    list.forEach(function(x){
      const on = x.id===b.id;
      const warn = openResolutions(x).length || (x.inbound||[]).filter(function(y){return y.status==='live';}).length || covenantBreaches(x).length;
      h += '<button class="btn sm '+(on?'primary':'')+'" data-a="switchbiz" data-b="'+x.id+'">'+(warn?'<span class="dot"></span> ':'')+esc(x.name)+
        ' <span class="tiny muted">'+pct(yourPct(x)/100,0)+'</span></button>';
    });
    h += '</div></div>';
  }
  /* the second-level strip in the chrome handles this now */

  /* The shell's second-level strip writes UI.sub; UI.govSub is the retired
     pre-consolidation flag and is only a fallback now. */
  const sub = (UI.tab === 'governance' && UI.sub) ? UI.sub : (UI.govSub || 'pack');
  if(sub==='pack')     h += '<div class="grid g2"><div>'+viewPack(b)+'</div><div>'+viewPromises(b)+'</div></div>';
  else if(sub==='register') h += '<div class="grid g2"><div>'+viewRegister(b)+'</div><div>'+viewPromises(b)+viewDeed(b)+'</div></div>';
  else if(sub==='board')    h += viewBoard(b);
  else if(sub==='votes')    h += viewResolutions(b);
  else if(sub==='deed')     h += '<div class="grid g2"><div>'+viewDeed(b)+'</div><div>'+viewRegister(b)+'</div></div>';
  else                      h += '<div class="grid g2"><div>'+viewInbound(b)+'</div><div>'+viewTargets(b)+'</div></div>';
  return h;
}