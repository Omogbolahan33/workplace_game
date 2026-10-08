
/* The overview answers three questions in this order: where do I stand, what
   needs me, and what just happened. Everything else in the game is a drill-down
   from one of those. */
import { BIZ, CITY, S, TX, UI, ambitionOf, ambitionPct, bar, bigStat, dateLabel, esc, firstMovesHTML, fmt, foldHTML, freedomIndex, hoursBudget, hoursLeft, netWorth, pct, routeKey, sleepDebt, sparkline, statRow, threadStrip, whyHTML } from '@ledger/core';
import { Q } from './00-q.js';
import { shellDraw } from './03-render.js';
import { viewAgenda } from './08-view-people.js';

/* Generated from src/02-view-overview.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewOverview(){
  const d = S.der, m = S.mkt, p = S.p, q = S.quarter || {};
  const nw = netWorth(), fr = freedomIndex();
  const real = nw / Math.max(0.01, S.cumInfl);
  const yearsLeft = Math.max(0, 65 - p.age);
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
  h += '<div class="grid g3">';
  h +=   bigStat('Net worth', fmt(nw), fmt(real)+' in start-of-game money');
  h +=   bigStat('Freedom', String(fr), fr>70?'work is optional':fr>40?'not yet optional':'work pays for this',
                 fr>70?'good':fr>40?'warn':'bad');
  h +=   bigStat('Years to 65', String(yearsLeft), 'you are '+p.age);
  h += '</div>';
  h += '<div style="margin:9px 0 2px">'+sparkline()+'</div>';
  if(amb){
    h += '<div class="statline" style="margin-top:8px"><span class="lbl">'+esc(amb.name)+'</span>'+
      bar(ap,130,'var(--acc)')+'<span class="val">'+ap+'%</span></div>';
    if(amb.blurb) h += '<div class="tiny muted" style="margin-top:3px">'+esc(amb.blurb)+'</div>';
  } else {
    h += '<div class="tiny muted" style="margin-top:9px">You have not said what you are building toward. '+
      '<button class="btn xs" data-a="tab" data-t="legacy">Choose an ambition</button></div>';
  }
  h += '</div>';

  /* ---- what needs a decision ---- */
  h += threadStrip();
  h += viewAgenda();

  /* ---- the quarter that just closed, and the person living it ---- */
  h += '<div class="grid g2">';
  h +=   viewPulse();
  h +=   viewPressure();
  h += '</div>';

  /* ---- capability and the weather ---- */
  h += '<div class="grid g2">';
  h += '<div class="card"><h3>Skills</h3>'+
    ['finance','ops','hustle','network','tech'].map(function(k){
      return '<div class="statline"><span class="lbl">'+k+'</span>'+bar(p.skills[k],100,'var(--info)')+
        '<span class="val">'+Math.round(p.skills[k])+'</span></div>';
    }).join('')+'</div>';
  h += '<div class="card"><h3>The economy <span class="tag">'+dateLabel(S.turn)+'</span></h3>'+
    '<div class="kv"><span class="muted">Inflation</span><span class="'+(m.infl>0.25?'bad':m.infl>0.12?'warn':'good')+'">'+pct(m.infl,1)+'</span></div>'+
    '<div class="kv"><span class="muted">'+esc(CITY().fxName)+'</span><span>'+Math.round(m.usd).toLocaleString()+'</span></div>'+
    '<div class="kv"><span class="muted">Policy rate</span><span>'+pct(m.mpr,1)+'</span></div>'+
    '<div class="kv"><span class="muted">Demand</span><span>'+(m.demand*100).toFixed(0)+'</span></div>'+
    '<div class="kv"><span class="muted">Grid</span><span>'+Math.round(m.power)+'%</span></div>'+
    '<div class="kv"><span class="muted">Confidence</span><span>'+Math.round(m.sentiment)+'</span></div>'+
    '</div>';
  h += '</div>';

  if(S.vignette) h += '<div class="vignette" style="margin-top:12px">'+S.vignette+'</div>';

  /* ---- the quarter loop ends here ---- */
  h += '<div style="margin-top:14px"><button class="btn primary block" data-a="advance" '+
    'style="padding:13px;font-size:15px">Advance to '+dateLabel(S.turn+1)+' ▸</button></div>';
  return h;
}
/* Money in and out, plainly. */
export function viewPulse(){
  const q = S.quarter || {};
  const inc = Math.round(q.income||0), exp = Math.round(q.expense||0);
  const net = inc - exp + (S.biz ? (S.biz.profit||0) : 0);
  let h = '<div class="card"><h3>This quarter</h3>';
  h += '<div class="kv"><span class="muted">Income</span><span class="mono good">'+fmt(inc)+'</span></div>';
  if(S.biz) h += '<div class="kv"><span class="muted">Business P&amp;L</span><span class="mono '+
    ((S.biz.profit||0)>=0?'good':'bad')+'">'+fmt(S.biz.profit||0)+'</span></div>';
  h += '<div class="kv"><span class="muted">Living + debt</span><span class="mono bad">\u2212'+fmt(exp)+'</span></div>';
  h += '<div class="kv"><span><b>Net</b></span><span class="mono '+(net>=0?'good':'bad')+'"><b>'+fmt(net)+'</b></span></div>';
  if(typeof TX!=='undefined' && TX.length)
    h += '<hr class="sep"><div class="tiny muted">'+TX.slice(0,8).map(esc).join('<br>')+'</div>';
  h += '<hr class="sep"><div class="tiny muted">'+
    (net>=0 ? foldHTML('Why this matters', 'You are living inside your means. Keep doing that and compounding does the rest.')
            : 'You are spending more than you earn. Survivable for a while, fatal eventually.')+'</div>';
  h += '</div>';
  return h;
}
/* The dials that end runs, plus the hours you have left to spend. */
export function viewPressure(){
  const p = S.p;
  let h = '<div class="card"><h3>What is at risk</h3>';
  h += statRow('Health', p.health, p.health>60?'var(--good)':p.health>30?'var(--warn)':'var(--bad)');
  h += statRow('Stress (lower better)', 100-p.stress, p.stress<40?'var(--good)':p.stress<70?'var(--warn)':'var(--bad)');
  h += statRow('Happiness', p.happy, 'var(--acc)');
  h += statRow('Family', p.family, 'var(--info)');
  h += statRow('Reputation', p.rep, 'var(--purple)');
  h += '<hr class="sep">';
  h += '<div class="kv"><span class="muted">Hours left this quarter</span><span class="mono">'+
    hoursLeft()+'h of '+hoursBudget()+'</span></div>';
  if(sleepDebt() > 0)
    h += '<div class="kv"><span class="muted">Sleep debt</span><span class="mono bad">'+
      Math.round(sleepDebt())+'h</span></div>';
  h += '</div>';
  return h;
}
/* The rival, on its own so Work can host it. */
export function viewRival(){
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
export function renderWhy(){
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