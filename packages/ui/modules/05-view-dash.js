
import { CITY, S, TX, bar, dateLabel, esc, fmt, freedomIndex, pct, sparkline, statRow, threadStrip } from '@ledger/core';

/* Generated from src/05-view-dash.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewDash(){
  const d = S.der, m = S.mkt, p = S.p;
  const q = S.quarter||{income:0,expense:0};
  const net = q.income - q.expense + (S.biz?S.biz.profit:0);
  let h = '';
  h += '<div class="grid g2">';
  // --- left column
  h += '<div>';
  h += threadStrip();
  h += '<div class="card"><h3>Position <span class="tag">'+esc(CITY().label)+'</span></h3>'+
       '<div class="big">'+fmt(d.nw)+'</div>'+
       '<div class="row tiny muted" style="margin-top:2px">Net worth · '+fmt(d.nw/Math.max(0.01,S.cumInfl))+' in start-of-game money</div>'+
       '<div style="margin:10px 0 4px">'+sparkline()+'</div></div>';
  h += '<div class="card" style="margin-top:12px"><h3>This quarter</h3>'+
    '<div class="kv"><span class="muted">Income</span><span class="good">'+fmt(q.income)+'</span></div>'+
    (S.biz?'<div class="kv"><span class="muted">Business P&amp;L</span><span class="'+(S.biz.profit>=0?'good':'bad')+'">'+fmt(S.biz.profit)+'</span></div>':'')+
    '<div class="kv"><span class="muted">Living + debt</span><span class="bad">−'+fmt(q.expense)+'</span></div>'+
    '<div class="kv"><span><b>Net</b></span><span class="'+(net>=0?'good':'bad')+'"><b>'+fmt(net)+'</b></span></div>'+
    (TX.length?'<hr class="sep"><div class="tiny muted">'+TX.slice(0,8).map(esc).join('<br>')+'</div>':'')+
    '</div>';
  h += '<div class="vignette" style="margin-top:12px">'+(S.vignette||'')+'</div>';
  h += '</div>';
  // --- right column
  h += '<div>';
  h += '<div class="card"><h3>You</h3>'+
    statRow('Health', p.health, p.health>60?'var(--good)':p.health>30?'var(--warn)':'var(--bad)')+
    statRow('Stress (lower better)', 100-p.stress, p.stress<40?'var(--good)':p.stress<70?'var(--warn)':'var(--bad)')+
    statRow('Happiness', p.happy, 'var(--acc)')+
    statRow('Family', p.family, 'var(--info)')+
    statRow('Reputation', p.rep, 'var(--purple)')+
    '<hr class="sep">'+
    '<div class="tiny muted">Freedom index</div>'+
    '<div class="row" style="gap:8px;margin-top:4px">'+bar(freedomIndex(),100,'var(--acc)')+'<b>'+freedomIndex()+'</b></div>'+
    '<div class="tiny muted" style="margin-top:5px">Cashflow coverage, wealth and quality of life, weighted. This is the score that matters.</div>'+
    '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Skills</h3>'+
    ['finance','ops','hustle','network','tech'].map(k=>
      '<div class="statline"><span class="lbl">'+k+'</span>'+bar(p.skills[k],100,'var(--info)')+'<span class="val">'+Math.round(p.skills[k])+'</span></div>').join('')+
    '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>The economy <span class="tag">'+dateLabel(S.turn)+'</span></h3>'+
    '<div class="kv"><span class="muted">Inflation (annualised)</span><span class="'+(m.infl>0.25?'bad':m.infl>0.12?'warn':'good')+'">'+pct(m.infl,1)+'</span></div>'+
    '<div class="kv"><span class="muted">'+CITY().fxName+'</span><span>'+Math.round(m.usd).toLocaleString()+'</span></div>'+
    '<div class="kv"><span class="muted">Policy rate</span><span>'+pct(m.mpr,1)+'</span></div>'+
    '<div class="kv"><span class="muted">Consumer demand</span><span>'+(m.demand*100).toFixed(0)+'</span></div>'+
    '<div class="kv"><span class="muted">Grid reliability</span><span>'+Math.round(m.power)+'%</span></div>'+
    '<div class="kv"><span class="muted">Business confidence</span><span>'+Math.round(m.sentiment)+'</span></div>'+
    '</div>';
  h += '</div></div>';
  // --- alerts
  const alerts = [];
  if(S.pending && S.pending.length) alerts.push('<span class="chip y">'+S.pending.length+' consequence'+(S.pending.length>1?'s':'')+' scheduled</span>');
  if(S.fin.cash<0) alerts.push('<span class="chip r">Cash is negative</span>');
  if(S.biz && S.biz.cash<0) alerts.push('<span class="chip r">Business is insolvent</span>');
  if(S.p.stress>75) alerts.push('<span class="chip r">Severe stress</span>');
  if(S.offers && S.offers.length) alerts.push('<span class="chip p">'+S.offers.length+' partnership offer'+(S.offers.length>1?'s':'')+'</span>');
  if(alerts.length) h = '<div class="row wrap" style="margin-bottom:12px">'+alerts.join('')+'</div>'+h;
  h += '<div style="margin-top:14px"><button class="btn primary block" data-a="advance" style="padding:13px;font-size:15px">Advance to '+dateLabel(S.turn+1)+' ▸</button></div>';
  return h;
}