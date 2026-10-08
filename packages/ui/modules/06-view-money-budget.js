

import { BUDGET_KEYS, CITY, GOODS, S, budgetMonthly, fmt, foldHTML, goodsUpkeep, needs, passiveMonthly, pct, salaryMonthly } from '@ledger/core';

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
  h += '<div class="tiny muted" style="margin-bottom:10px">You are committing <b>'+fmt(total)+'</b> a month. '+
       (total>inc?'<span class="bad">That is more than you earn — the gap is being funded by savings or debt.</span>':'<span class="good">Surplus of '+fmt(inc-total)+' a month.</span>')+'</div>';
  BUDGET_KEYS.forEach(function(k){
    const def = GOODS.find(x=>1); // noop
    const need = nd[k[0]]||0;
    const v = b[k[0]]||0;
    const mark = v>=need ? '<span class="chip g">covered</span>' : '<span class="chip r">below need '+fmt(need)+'</span>';
    h += '<div class="slider"><span>'+k[1].split(' ')[0]+'</span>'+
      '<input type="range" data-inp="budget" data-k="'+k[0]+'" min="0" max="'+Math.max(400000, Math.round(need*3))+'" step="5000" value="'+v+'">'+
      '<span class="mono" style="text-align:right">'+fmt(v)+'</span></div>'+
      '<div class="tiny muted" style="margin:-4px 0 10px 0">'+k[2]+' '+mark+'</div>';
  });
  h += '<hr class="sep"><div class="row wrap">'+
    '<button class="btn sm" data-a="preset" data-p="survive">Survival mode</button>'+
    '<button class="btn sm" data-a="preset" data-p="balanced">Balanced</button>'+
    '<button class="btn sm" data-a="preset" data-p="invest">Invest in myself</button>'+
    '<button class="btn sm" data-a="preset" data-p="flex">Status &amp; family</button>'+
    '<button class="btn sm '+(eroded>1.18?'primary':'')+'" data-a="infladj">Adjust for inflation'+(eroded>1.18?' (+'+pct(eroded-1,0)+')':'')+'</button>'+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:8px">Total: <b>'+fmt(total)+'</b>/month plus '+fmt(gu)+' of asset upkeep. Annual: '+fmt((total+gu)*12)+'.</div>';
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
  GOODS.forEach(function(g){
    const cost = Math.round(g.cost*(0.85+0.3*CITY().rentMult/1.3));
    const owned = S.fin.goods.filter(x=>x.id===g.id).length;
    h += '<div class="mrow">'+
      '<div class="between"><b>'+g.name+'</b><span class="row wrap" style="gap:4px;justify-content:flex-end">'+
        (g.upkeep?'<span class="chip">'+fmt(g.upkeep)+'/mo upkeep</span>':'')+
        Object.keys(g.eff).map(function(k){ return '<span class="chip '+(g.eff[k]>0?'g':'r')+'">'+k+' '+(g.eff[k]>0?'+':'')+g.eff[k]+'</span>'; }).join('')+
        '<span class="chip b">'+fmt(cost)+'</span>'+
      '</span></div>'+
      '<button class="btn sm primary block" style="margin-top:6px" data-a="buygood" data-g="'+g.id+'"'+(S.fin.cash<cost?' disabled aria-disabled="true" title="Costs '+fmt(cost)+' \u00b7 you have '+fmt(S.fin.cash)+' \u00b7 short '+fmt(Math.round(cost - S.fin.cash))+'"':'')+'>'+
      (owned?'Buy another':'Buy')+'</button></div>';
  });
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