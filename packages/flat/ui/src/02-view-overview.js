
/* The overview answers three questions in this order: where do I stand, what
   needs me, and what just happened. Everything else in the game is a drill-down
   from one of those. */
function viewOverview(){
  const d = S.der, m = S.mkt, p = S.p, q = S.quarter || {};
  const amb = ambitionOf(), ap = ambitionPct();
  let h = '';
  /* the first quarter only, once per player: the loop and three places to start */
  h += firstMovesHTML();

  /* ---- the decade, and anything that is on fire ---- */
  const alerts = [];
  if(S.pending && S.pending.length) alerts.push('<span class="chip y">'+S.pending.length+' consequence'+(S.pending.length>1?'s':'')+' scheduled</span>');
  if(S.fin.cash < 0) alerts.push('<span class="chip r">Cash is negative</span>');
  if(S.biz && S.biz.cash < 0) alerts.push('<span class="chip r">'+esc(S.biz.name)+' is insolvent</span>');
  if(S.p.stress > 75) alerts.push('<span class="chip r">Severe stress</span>');
  if(S.offers && S.offers.length) alerts.push('<span class="chip p">'+S.offers.length+' partnership offer'+(S.offers.length>1?'s':'')+'</span>');
  if(alerts.length) h += '<div class="row wrap" style="margin-bottom:12px">'+alerts.join('')+'</div>';

  /* ---- where you stand ---- */
  h += '<div class="card"><h3>Where you stand <span class="tag">'+esc(CITY().label)+'</span></h3>';
  /* the one big number and two rings - core's, drawn the same by the app */
  h += standingHTML();
  h += '<div style="margin:9px 0 2px">'+sparkline()+'</div>';
  if(amb){
    h += '<div class="statline" style="margin-top:8px"><span class="lbl">'+esc(amb.name)+'</span>'+
      bar(ap,130,'var(--acc)')+'<span class="val">'+ap+'%</span></div>';
    if(amb.blurb) h += '<div class="tiny muted prose" style="margin-top:3px">'+esc(amb.blurb)+'</div>';
  } else {
    h += '<div class="tiny muted" style="margin-top:9px">You have not said what you are building toward. '+
      '<button class="btn xs" data-a="tab" data-t="legacy">Choose an ambition</button></div>';
  }
  h += '</div>';

  /* ---- what needs a decision ---- */
  h += threadStrip();
  /* what you have already set in motion, with the choice that set it */
  h += comingBackHTML();
  h += viewAgenda();

  /* ---- the quarter that just closed, and the person living it ---- */
  h += '<div class="grid g2">';
  h +=   viewPulse();
  h +=   viewPressure();
  h += '</div>';

  /* ---- capability and the weather ---- */
  h += '<div class="grid g2">';
  /* the five skills as one shape, and the economy as gauges - both core's,
     drawn the same by the app */
  h += '<div class="card"><h3>Skills</h3>'+skillsRadarHTML()+'</div>';
  h += '<div class="card"><h3>The economy <span class="tag">'+dateLabel(S.turn)+'</span></h3>'+economyHTML()+'</div>';
  h += '</div>';

  if(S.vignette) h += '<div class="vignette" style="margin-top:12px">'+S.vignette+'</div>';

  /* ---- the quarter loop ends here ---- */
  h += '<div style="margin-top:14px"><button class="btn primary block" data-a="advance" '+
    'style="padding:13px;font-size:15px">Advance to '+dateLabel(S.turn+1)+' ▸</button></div>';
  return h;
}
/* Money in and out, plainly. */
function viewPulse(){
  const q = S.quarter || {};
  const inc = Math.round(q.income||0), exp = Math.round(q.expense||0);
  const net = inc - exp + (S.biz ? (S.biz.profit||0) : 0);
  let h = '<div class="card"><h3>This quarter</h3>';
  /* money in and out as bars against each other, and the net - core's */
  h += quarterFlowHTML();
  if(typeof TX!=='undefined' && TX.length)
    h += '<hr class="sep prose"><div class="tiny muted prose">'+TX.slice(0,8).map(esc).join('<br>')+'</div>';
  h += '<hr class="sep"><div class="tiny muted">'+
    (net>=0 ? foldHTML('Why this matters', 'You are living inside your means. Keep doing that and compounding does the rest.')
            : 'You are spending more than you earn. Survivable for a while, fatal eventually.')+'</div>';
  h += '</div>';
  return h;
}
/* The dials that end runs, plus the hours you have left to spend. */
function viewPressure(){
  const p = S.p;
  let h = '<div class="card"><h3>What is at risk</h3>';
  /* the dials that end runs as rings, the HUD's own pictures, with the hours
     you have left as the sixth */
  h += ringsHTML([{ico:'heart', label:'Health', v:p.health}, {ico:'bolt', label:'Calm', v:100 - p.stress, note:'Stress '+Math.round(p.stress)},
    {ico:'smile', label:'Happiness', v:p.happy}, {ico:'home', label:'Family', v:p.family},
    {ico:'star', label:'Reputation', v:p.rep},
    {ico:'glass', label:'Hours left', v:hoursLeft() / Math.max(1, hoursBudget()) * 100, tone:'var(--info)', text:hoursLeft()+'h of '+hoursBudget()}]);
  if(sleepDebt() > 0)
    h += '<div class="kv"><span class="muted">Sleep debt</span><span class="mono bad">'+
      Math.round(sleepDebt())+'h</span></div>';
  h += '</div>';
  return h;
}
/* The rival, on its own so Work can host it. */
function viewRival(){
  let h = '<div class="card"><h3>Your rival</h3>';
  if(S.rival){
    const rv = S.rival;
    h += '<div class="between"><b>'+esc(rv.name)+'</b><span class="chip '+(rv.relation>=40?'g':'r')+'">'+
      (rv.relation>=60?'Warm':rv.relation>=20?'Wary':'Hostile')+'</span></div>'+
      '<div class="tiny muted" style="margin:6px 0">'+esc((BIZ.find(function(b){return b.id===rv.type;})||{name:rv.type}).name)+
      ' · size '+Math.round(rv.size)+'/140 · aggression '+Math.round(rv.aggro)+'/100</div>'+
      statRow('Their scale', rv.size)+
      statRow('How much they like you', rv.relation+100, rv.relation>=0?'var(--good)':'var(--bad)')+
      '<div class="tiny muted" style="margin-top:7px">'+
      (rv.moves ? 'They have moved on you '+rv.moves+' time'+(rv.moves===1?'':'s')+'.'
                : 'So far they have left you alone.')+'</div>';
  } else h += '<div class="tiny muted">Nobody is competing with you yet.</div>';
  h += '</div>';
  return h;
}
function renderWhy(){
  const host = Q('why');
  if(!host) return;
  if(shellDraw('tabs', { tabs: Q('tabs'), subs: Q('subs'), why: host })) return;
  /* the popover is pinned by click as well as hover, so re-rendering must not
     lose that - otherwise the chip slams shut the moment you press "Got it"
     on something else */
  if(UI.whyOpen && UI.whyOpen !== routeKey()) UI.whyOpen = null;
  host.innerHTML = whyHTML();
  host.className = UI.whyOpen ? 'open' : '';
}