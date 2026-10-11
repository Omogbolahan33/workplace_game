

import { BUDGET_KEYS, GOODS, S, budgetJarHTML, budgetMarkHTML, budgetMonthly, budgetPresetsHTML, budgetSplitHTML, fmt, foldHTML, goodTileHTML, goodsUpkeep, needs, passiveMonthly, pct, salaryMonthly } from '@ledger/core';

/* Generated from src/06-view-money-budget.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewMoneyBudget(){
  const b = S.fin.budget, nd = needs(), inc = (salaryMonthly() + (S.informalIncome||0) + passiveMonthly());
  const total = budgetMonthly();
  const gu = goodsUpkeep();
  const eroded = S.cumInfl/Math.max(0.0001, S.budgetInfl||1);
  let h = '';
  h += '<div class="card"><h3>Monthly budget <span class="tag">affordable: '+fmt(inc)+'/mo</span></h3>';
  /* ── Money > Budget, redesigned (the redesign's phase 11) ─────────────────
     The screen is sliders: what is in the way is labels and figures, which is
     what a budget screen should be. The one piece of prose was the inflation
     warning — a real state change (prices rose, your budget buys less) with two
     sentences of explanation wrapped around the number. The state stays in the
     warning, the explanation folds, and the control stays exactly where it was. */
  if(eroded > 1.18){
    h += '<div class="tutorial bad" style="border-color:rgba(255,159,67,.45);color:#ffd7a8;background:rgba(255,159,67,.08)">'+
      'Prices have risen '+pct(eroded-1,0)+' since you last set this budget.'+
      ' <button class="btn xs" data-a="infladj" style="margin-left:6px">Adjust for inflation</button>'+
      foldHTML('What that means', 'You are now buying '+pct((1/eroded-1),0)+' less life than you were.')+'</div>';
  }
  /* your month as one bar against what you earn - budgetSplitHTML(), the app's
     too; the sentence that reads it is shown with the explanations */
  h += budgetSplitHTML();
  h += '<div class="tiny muted prose" style="margin-bottom:10px">You are committing <b>'+fmt(total)+'</b> a month. '+
       (total>inc?'<span class="bad">That is more than you earn — the gap is being funded by savings or debt.</span>':'<span class="good">Surplus of '+fmt(inc-total)+' a month.</span>')+'</div>';
  BUDGET_KEYS.forEach(function(k){
    const def = GOODS.find(x=>1); // noop
    const need = nd[k[0]]||0;
    const v = b[k[0]]||0;
    h += '<div class="slider jarrow"><span class="jarbox">'+budgetJarHTML(v, need)+'</span><span>'+k[1].split(' ')[0]+'</span>'+
      '<input type="range" data-inp="budget" data-k="'+k[0]+'" min="0" max="'+Math.max(400000, Math.round(need*3))+'" step="5000" value="'+v+'">'+
      '<span class="bamt"><span class="mono">'+fmt(v)+'</span>'+budgetMarkHTML(v, need)+'</span></div>'+
      '<div class="tiny muted prose" style="margin:-4px 0 10px 0">'+k[2]+'</div>';
  });
  h += '<hr class="sep">'+budgetPresetsHTML();
  h += '<div class="tiny muted prose" style="margin-top:8px">Total: <b>'+fmt(total)+'</b>/month plus '+fmt(gu)+' of asset upkeep. Annual: '+fmt((total+gu)*12)+'.</div>';
  h += '</div>';
  return h;
}
export function viewMoneyProperty(){
  /* ── Money > Property, redesigned (the redesign's phase 9) ────────────────
     Measured first: 1,111 characters in the way for eleven controls, and every
     one of them was a note. Each good carried a bordered box with a sentence
     under its name — "The single most Nigerian purchase in existence. Fuel not
     included." — and the layout held thirty pixels of empty height open for a
     line of it, which is a lot of screen spent on flavour at the exact place
     the price and the effects should be.

     What it is now: each good is a compact row that leads with what it costs
     and what it does (chips), with the sentence one tap away. All eleven notes
     are kept, in order, in one fold at the foot of the card. Same eleven Buy
     buttons, same disabled reasons, same prices. */
  let h = '';
  h += '<div class="card" style="margin-top:12px"><h3>Buy something <span class="tag">cash '+fmt(S.fin.cash)+'</span></h3>';
  /* a shelf of pictures, two to a row on a phone - goodTileHTML(), the tile
     the app draws too */
  h += '<div class="grid g2">'+GOODS.map(function(g){ return goodTileHTML(g); }).join('')+'</div>';
  h += foldHTML('What each thing is for', GOODS.map(function(g){
      return '<div style="margin-bottom:6px"><b>'+g.name+'</b> \u2014 '+g.note+'</div>';
    }).join(''))+'</div>';
  if((S.fin.goods||[]).length){
    h += '<div class="card" style="margin-top:12px"><h3>What you own</h3>';
    S.fin.goods.forEach(function(g,i){
      const def = GOODS.find(x=>x.id===g.id); if(!def) return;
      h += '<div class="kv"><span>'+def.name+' <span class="tiny muted">Q'+g.turn+'</span></span><span class="muted">'+fmt(Math.max(0,def.cost*(1-0.055*(S.turn-g.turn))))+'</span></div>';
    });
    h += '</div>';
  }
  return h;
}