
/* §17 P4: burn, runway and risk were never surfaced anywhere. Position is the
   flagship of the Money tab, so it opens with the three numbers that decide
   whether the run survives the year, then the detail cards underneath. */
function positionStrip(){
  const inc  = salaryMonthly() + (S.informalIncome||0) + passiveMonthly();
  const burn = budgetMonthly() + goodsUpkeep() +
               (S.fin.debt||[]).reduce((t,d)=>t+(d.minPay||0),0);
  const net  = inc - burn;
  const cash = S.fin.cash||0;
  const nw   = netWorth();
  /* net is monthly, so cash/net is months. Quarters are the game's unit, so
     convert before printing. Beyond twelve quarters runway stops being the
     binding constraint and the number is just noise - cap it. */
  const rm    = net < 0 ? (cash / -net) : null;   /* months */
  const rq    = rm===null ? null : rm/3;          /* quarters */
  const runTxt  = rq===null ? 'Indefinite'
                : rq >= 12 ? '12+ qtrs'
                : rq >= 4  ? Math.round(rq)+' qtrs'
                : Math.max(1,Math.round(rm))+' month'+(Math.round(rm)===1?'':'s');
  const runNote = rq===null ? 'You live inside your means'
                : 'Cash '+fmt(cash)+' against '+fmt(-net)+'/month of burn';
  const tone    = rq===null ? 'good' : rq>=8 ? 'good' : rq>=4 ? '' : rq>=2 ? 'warn' : 'bad';

  /* risk: only real, checkable exposures - no vibes */
  const risks = [];
  (S.fin.debt||[]).forEach(function(d){
    if(d.kind==='shark') risks.push('Informal lender at '+Math.round(d.rate*100)+'%/qtr');
  });
  if(S.biz){
    if(covenantBreaches(S.biz).length) risks.push(covenantBreaches(S.biz).length+' covenant breach'+(covenantBreaches(S.biz).length>1?'es':''));
    if(openResolutions(S.biz).length)  risks.push(openResolutions(S.biz).length+' resolution open');
    const bq = lastQ(S.biz);
    if(bq && bq.net < 0) risks.push(esc(S.biz.name)+' lost '+fmt(-bq.net)+' last quarter');
  }
  if(S.fin.credit < 45) risks.push('Credit score '+Math.round(S.fin.credit)+' — banks will not look at you');
  if(S.mkt.infl > 0.25) risks.push('Inflation '+pct(S.mkt.infl,0)+' — cash is melting');

  let h = '<div class="card"><h3>Where you stand <span class="tag">Q'+S.turn+'</span></h3>';
  h += '<div class="grid g4" style="margin-bottom:9px">'+
       bigStat('Net worth', fmt(nw), debtTotal()>0 ? 'after '+fmt(debtTotal())+' of debt' : 'no debt', nw>=0?'':'bad')+
       bigStat('Income', fmt(inc)+'/mo', 'salary, side income, yields', 'good')+
       bigStat('Burn', fmt(burn)+'/mo', 'budget, upkeep, debt service', burn>inc?'bad':'')+
       bigStat('Runway', runTxt, runNote, tone)+
       '</div>';
  h += '<div class="tiny muted" style="margin-top:2px">'+
       (net>=0
         ? 'You are banking <b>'+fmt(net)+'</b> a month. That surplus is the only thing in this game that compounds.'
         : (rq>=8
             ? 'You are bleeding <b>'+fmt(-net)+'</b> a month, but cash covers years of it. Watch it, do not fear it yet.'
             : 'You are bleeding <b>'+fmt(-net)+'</b> a month. Runway: <b>'+runTxt+'</b>. That is the number this tab exists to move.'))+
       '</div>';
  if(risks.length){
    h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:5px">Exposures</div><div class="row wrap" style="gap:5px">'+
         risks.map(function(r){ return '<span class="chip r">'+r+'</span>'; }).join('')+'</div>';
  } else {
    h += '<hr class="sep"><div class="tiny muted">No live exposures. Nothing here is quietly killing the run.</div>';
  }
  h += '</div>';
  return h;
}