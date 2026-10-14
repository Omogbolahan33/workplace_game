

function viewMoneyPosition(){
  let h = positionStrip();
  /* world-first: what you are worth as one bar of its parts, what you owe under it */
  if(sceneFirst()) h += '<div class="card" style="margin-top:12px"><h3>Cash &amp; debt</h3><div class="worthpic">'+worthInner()+'</div></div>';
  else h += '<div class="card" style="margin-top:12px"><h3>Cash &amp; debt</h3>'+
    '<div class="kv"><span class="muted">Cash</span><span>'+fmt(S.fin.cash)+'</span></div>'+
    '<div class="kv"><span class="muted">Hard currency</span><span>'+fmt(S.fin.usdCash*S.mkt.usd)+' ($'+Math.round(S.fin.usdCash).toLocaleString()+')</span></div>'+
    '<div class="kv"><span class="muted">Invested</span><span>'+fmt(S.der.assets)+'</span></div>'+
    (S.biz?'<div class="kv"><span class="muted">Business value</span><span>'+fmt(S.der.biz)+'</span></div>':'')+
    '<div class="kv"><span class="muted">Possessions (resale)</span><span>'+fmt(S.der.goods)+'</span></div>'+
    '<div class="kv"><span><b>Debt</b></span><span class="'+(S.der.debt>0?'bad':'')+'"><b>'+fmt(S.der.debt)+'</b></span></div>'+
    '</div>';
  if((S.fin.debt||[]).length){
    h += '<div class="card" style="margin-top:12px"><h3>Liabilities</h3><table><tr><th>What</th><th class="num">Balance</th><th class="num">Rate/qtr</th><th></th></tr>';
    S.fin.debt.forEach(function(dt){
      h += '<tr><td>'+esc(dt.name)+'</td><td class="num">'+fmt(dt.bal)+'</td><td class="num">'+(dt.rate*100).toFixed(0)+'%</td>'+
        '<td class="num"><button class="btn xs" data-a="repay" data-d="'+dt.id+'">Repay</button></td></tr>';
    });
    h += '</table>'+foldHTML('Why repay early', 'Repay early from cash. A 30% quarterly informal lender is not a loan, it is a countdown.')+'</div>';
  }
  h += '<div class="card" style="margin-top:12px"><h3>Borrow <span class="tag">credit '+Math.round(S.fin.credit)+'/100</span></h3>'+
    '<div class="row wrap"><button class="btn sm" data-a="borrow" data-k="bank">Bank loan</button>'+
    '<button class="btn sm bad" data-a="borrow" data-k="shark">Private lender (30%/qtr)</button></div>'+
    foldHTML('How borrowing works',
      'Your credit score determines whether anyone lends to you and at what rate. '+
      'Bank lending is cheaper but requires credit and often a formal business. Private money is instant and brutal.')+
    '</div>';
  h += '<div class="card flat" style="margin-top:12px"><h3>What this tab is really asking</h3>'+
    foldHTML('What this tab is asking',
      'Every naira you spend here is a naira that is not compounding somewhere else. The game does not tell you '+
      'the right answer — it tells you what your answer cost you, about six quarters later.')+'</div>';
  return h;
}
/* Kept whole for anyone still calling it; the router uses the pieces. */
function viewMoney(){
  return '<div class="grid g2"><div>' + viewMoneyBudget() + viewMoneyProperty() +
         '</div><div>' + viewMoneyPosition() + '</div></div>';
}

/* ------------------------------ Investing ------------------------------ */
function viewInvestPortfolio(){
  const d = S.der;
  let h = '';
  h += '<div class="card"><h3>Portfolio <span class="tag">'+fmt(d.assets)+'</span></h3>';
  if(!S.assets.length){
    h += '<div class="small muted">You hold no investments. Cash in a current account loses to inflation every single quarter — that is not a metaphor, it is arithmetic on this screen.</div>';
  } else {
    h += '<table><tr><th>Asset</th><th class="num">Value</th><th class="num">Last qtr</th><th class="num">Total P/L</th><th></th></tr>';
    S.assets.slice().sort((a,b)=>b.value-a.value).forEach(function(a){
      const def = ASSETS.find(x=>x.id===a.id); if(!def) return;
      const pl = a.value - a.cost;
      h += '<tr><td>'+def.name+'<div class="tiny muted">'+def.cls+'</div></td>'+
        '<td class="num">'+fmt(a.value)+'</td>'+
        '<td class="num '+(a.lastRet>=0?'good':'bad')+'">'+((a.lastRet===undefined?'—':((a.lastRet>=0?'+':'')+pct(a.lastRet,1))))+'</td>'+
        '<td class="num '+(pl>=0?'good':'bad')+'">'+fmt(pl)+'</td>'+
        '<td class="num"><button class="btn xs" data-a="sellasset" data-i="'+a.id+'" data-f="0.25">25%</button> '+
        '<button class="btn xs" data-a="sellasset" data-i="'+a.id+'" data-f="1">All</button></td></tr>';
    });
    h += '</table>';
  }
  h += '<hr class="sep"><div class="tiny muted">Idle cash: <b>'+fmt(S.fin.cash)+'</b>. Inflation is running at '+pct(S.mkt.infl,1)+' a year, which means that number is shrinking while you read this.</div>';
  h += '</div>';
  return h;
}
/* ── Money › Markets, redesigned (the redesign's phase 2) ───────────────────
   What was wrong with it, measured: 2,566 characters in the way, the worst route
   in the game. Three hundred and eight of those were the thirteen asset notes —
   one sentence of teaching per instrument, stacked under thirteen bordered boxes
   — and the rest was two paragraphs of explanation wrapped around the numbers
   they explain: the macro lecture under the macro rates, the returns lecture in
   a card of its own, both sitting exactly where a player is trying to decide
   what to buy.

   What it is now: **a price sheet**. One compact row per instrument — its name,
   the chips that decide it, and the amount box and Buy button on the row itself
   — so thirteen instruments can be read down in one pass instead of scrolling
   through thirteen boxes. The notes are not gone: *What each asset is for* holds
   all thirteen sentences, in the same order, one tap away. The two lectures are
   folds on the cards they belong to, and the news shows what is recent with the
   tail behind a disclosure.

   Nothing was removed. The controls are the same thirteen Buy buttons and their
   thirteen amount boxes, with the same ids (the buy handler reads the box out of
   the DOM by `amt_<asset>`, and a redesign may not break a handler it does not
   own); the chips carry the same words; every sentence that was on the screen is
   still on the screen. `node tools/textaudit.mjs --check` fails if a control
   loses its button anywhere in the game, and `react-screen` compares this screen
   with the app's React copy character for character. */
function assetNotesHTML(){
  return '<details class="fold"><summary>What each asset is for</summary><div>'+
    ASSETS.map(function(a){
      return '<div style="margin-bottom:6px"><b>'+a.name+'</b> \u2014 '+a.note+'</div>';
    }).join('')+
    '</div></details>';
}
function assetRowHTML(a){
  const held = S.assets.find(function(x){ return x.id === a.id; });
  return '<div class="mrow">'+
    '<div class="between" style="align-items:flex-start;gap:8px">'+
      '<b>'+a.name+'</b>'+
      '<span class="row wrap" style="gap:4px;justify-content:flex-end">'+
        '<span class="chip">exp. '+pct(a.ret,1)+'/qtr</span>'+
        '<span class="chip '+(a.vol>0.2?'r':a.vol>0.05?'y':'g')+'">vol '+pct(a.vol,1)+'</span>'+
        (a.fx?'<span class="chip p">FX-linked</span>':'')+
        (a.illiquid?'<span class="chip y">illiquid</span>':'')+
        (a.yieldQ?'<span class="chip g">pays income</span>':'')+
        (held?'<span class="chip b">holding '+fmt(held.value)+'</span>':'')+
      '</span>'+
    '</div>'+
    '<div class="row" style="margin-top:6px;gap:6px">'+
      '<input type="text" class="mono" style="flex:1" placeholder="amount" id="amt_'+a.id+'" value="'+(a.min||50000)+'">'+
      '<button class="btn sm primary" data-a="buyasset" data-i="'+a.id+'">Buy</button>'+
    '</div></div>';
}
/* The returns paragraph, kept whole. It used to be a card of its own, titled
   "How returns work here", sitting under the market it explains — so the title
   survives as the fold's summary and the sentences survive inside it. */
function returnsFoldHTML(){
  return '<details class="fold"><summary>How returns work here</summary><div>'+
    'Each asset has an expected quarterly return and a volatility. Returns are drawn from that distribution, '+
    'so a high-volatility asset will hand you a +60% quarter and then a \u221245% one. Fixed income tracks '+
    'the policy rate. Anything marked <b>FX-linked</b> earns its return in hard currency and then gets '+
    'multiplied by the currency move \u2014 which is why dollar assets can look spectacular in a devaluation year.'+
    '</div></details>';
}
function viewInvestMarkets(){
  let h = '';
  const groups = {};
  ASSETS.forEach(function(a){ (groups[a.cls]=groups[a.cls]||[]).push(a); });
  h += '<div class="card" style="margin-top:12px"><h3>Markets</h3>';
  Object.keys(groups).forEach(function(cls){
    h += '<div class="tiny muted" style="margin:10px 0 4px;text-transform:uppercase;letter-spacing:.08em">'+cls+'</div>';
    groups[cls].forEach(function(a){ h += assetRowHTML(a); });
  });
  /* The teaching that used to sit under every instrument, and the paragraph that
     used to be a card of its own, both kept whole and both one tap away. */
  h += assetNotesHTML();
  h += returnsFoldHTML();
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Macro picture</h3>'+
    '<div class="kv"><span class="muted">Inflation</span><span class="'+(S.mkt.infl>0.25?'bad':'')+'">'+pct(S.mkt.infl,1)+'</span></div>'+
    '<div class="kv"><span class="muted">Policy rate</span><span>'+pct(S.mkt.mpr,1)+'</span></div>'+
    '<div class="kv"><span class="muted">Real rate (MPR \u2212 inflation)</span><span class="'+((S.mkt.mpr-S.mkt.infl)>0?'good':'bad')+'">'+pct(S.mkt.mpr-S.mkt.infl,1)+'</span></div>'+
    '<div class="kv"><span class="muted">'+CITY().fxName+' change this qtr</span><span class="'+((S.mkt.usd/S.mkt.usdPrev)>1.01?'bad':'')+'">'+pct((S.mkt.usd/S.mkt.usdPrev)-1,1)+'</span></div>'+
    '<div class="kv"><span class="muted">Cumulative inflation since start</span><span>'+pct(S.cumInfl-1,0)+'</span></div>'+
    '<details class="fold"><summary>What those rates mean</summary><div>'+
      'When inflation exceeds the policy rate, holding cash is a guaranteed loss. When the currency is falling, '+
      'anything priced in hard currency quietly rises in local terms. Both of those sentences are load-bearing.'+
    '</div></details>'+
    '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Recent market news</h3>';
  const news = S.mkt.news.slice(0,8);
  news.slice(0,3).forEach(function(n){
    h += '<div class="logline"><div class="t">'+dateLabel(n.turn)+'</div>'+esc(n.t)+'</div>';
  });
  if(news.length > 3)
    h += '<details class="fold"><summary>Earlier news \u00b7 '+(news.length-3)+' more</summary><div>'+
      news.slice(3).map(function(n){
        return '<div class="logline"><div class="t">'+dateLabel(n.turn)+'</div>'+esc(n.t)+'</div>';
      }).join('')+
    '</div></details>';
  h += '</div>';
  return h;
}
/* Kept whole for anyone still calling it; the router uses the pieces. */
function viewInvest(){
  return '<div class="grid g2"><div>' + viewInvestPortfolio() + viewInvestMarkets() + '</div></div>';
}
/* ------------------------------ Business ------------------------------ */
function viewBiz(){
  const b = S.biz;
  if(!b){
    let h = '<div class="card"><h3>Start a company <span class="tag">cash '+fmt(S.fin.cash)+'</span></h3>'+
      '<div class="small muted prose" style="margin-bottom:12px">Each of these is a different machine. They differ in how much capital they need, how thin the margin is, how fast they can grow, and how much of your life they will consume. Pick the one that matches the balance sheet you actually have, not the one that sounds impressive.</div>';
    /* Ten greyed-out cards with no explanation read as "this game has no such
       option". They did not. On a fresh run you hold ₦180k and the cheapest
       company is ₦1.5m, so every Start was disabled and nothing said so, or
       said what the gap was, or mentioned the one route that is open: a
       partner, which is precisely what partners are for. */
    const cheapest = Math.min.apply(null, BIZ.map(function(t){ return startBizCost(t.id); }));
    if(S.fin.cash < cheapest){
      h += '<div class="tutorial" style="border-color:rgba(255,159,67,.45);color:#ffcda0;background:rgba(255,159,67,.07)">'+
        '<b>None of these is within reach yet.</b> The cheapest is '+fmt(cheapest)+' and you have '+
        fmt(S.fin.cash)+' &mdash; short by <b>'+fmt(cheapest - S.fin.cash)+'</b>.<br>'+
        'Two ways in. Earn it: work, or take a deal. Or bring someone in: '+
        '<b>With partner</b> is open on every one of these at any price, because covering a gap '+
        'you cannot cover is exactly what a partner is for &mdash; and it costs you a share of '+
        'everything, forever.'+
        /* This block used to name two routes and give you no way to walk to
           either. Naming a route is not the same as opening it, and the whole
           point of stating the shortfall is that the player can act on it. */
        '<div class="row wrap" style="gap:6px;margin-top:9px">'+
          '<button class="btn sm primary" data-a="goto" data-t="work" data-s="career">Work &rsaquo; Career &mdash; earn it</button>'+
          '<button class="btn sm" data-a="goto" data-t="money" data-s="deals">Money &rsaquo; Deals &mdash; borrow or sell</button>'+
        '</div></div>';
    }
    /* each kind of company as a picture tile, drawn by core so the app's
       screen is the same tile */
    h += '<div class="grid g2">' + BIZ.map(function(t){ return bizTypeTileHTML(t); }).join('') + '</div>';
    h += '<div class="tutorial">Bootstrapping note: whatever you start with, keep at least six months of personal expenses OUTSIDE the business. Most small companies do not die from a bad idea; they die from a good idea with no working capital.</div>';
    h += '</div>';
    return h;
  }
  const T = BIZ.find(x=>x.id===b.type);
  let h = '<div class="grid g2"><div>';
  h += '<div class="card"><h3>'+esc(b.name)+' <span class="tag">'+T.name+' · '+(b.formal?'Registered':'Informal')+'</span></h3>';
  h += '<div class="grid g4" style="margin-bottom:10px">'+
    '<div><div class="tiny muted">Revenue</div><div class="mid">'+fmt(b.revenue)+'</div></div>'+
    '<div><div class="tiny muted">Profit</div><div class="mid '+(b.profit>=0?'good':'bad')+'">'+fmt(b.profit)+'</div></div>'+
    '<div><div class="tiny muted">Cash in co.</div><div class="mid '+(b.cash>=0?'':'bad')+'">'+fmt(b.cash)+'</div></div>'+
    '<div><div class="tiny muted">Valuation</div><div class="mid">'+fmt(bizValue())+'</div></div>'+
    '</div>';
  /* world-first: sold, can make and wanted on one meter; the standing as gauges */
  if(sceneFirst()) h += '<div class="cpic">'+companyMeterInner(b)+'</div>';
  else h += '<div class="kv"><span class="muted">Units sold</span><span>'+Math.round(b.units)+'</span></div>'+
    '<div class="kv"><span class="muted">Capacity</span><span>'+Math.round(b.capacity)+'</span></div>'+
    '<div class="kv"><span class="muted">Demand at current price</span><span>'+Math.round(b.demand)+'</span></div>'+
    '<div class="kv"><span class="muted">Locations</span><span>'+b.locations+'</span></div>'+
    '<div class="kv"><span class="muted">Reputation</span><span>'+Math.round(b.rep)+'/100</span></div>'+
    '<div class="kv"><span class="muted">Your equity</span><span>'+b.equity+'%</span></div>';
  if(b.cash<0) h += '<div class="tutorial bad" style="border-color:rgba(255,95,109,.4);color:#ffb3b8;background:rgba(255,95,109,.08)">The company is cash-negative. It cannot buy stock, it turns customers away, and its reputation is falling every quarter it stays this way. Inject capital or cut costs now.</div>';
  if(b.demand > b.capacity*1.25) h += '<div class="tutorial">Demand is outrunning capacity. You are leaving money on the table — hire, add equipment, or raise prices.</div>';
  if(b.capacity > b.demand*1.6 && b.capacity>40) h += '<div class="tutorial">You have significant idle capacity. You are paying for output nobody is buying. Lower prices, market harder, or cut headcount.</div>';
  if((b.notes||[]).length) h += '<div class="tiny muted" style="margin-top:8px">'+b.notes.map(esc).join('<br>')+'</div>';
  h += '</div>';
  // operations controls
  h += '<div class="card" style="margin-top:12px"><h3>Operations</h3>';
  h += '<div class="slider"><span>Price</span><input type="range" data-inp="bizprice" min="60" max="160" step="2" value="'+Math.round(b.priceIdx*100)+'"><span class="mono" style="text-align:right">'+(b.priceIdx*100).toFixed(0)+'%</span></div>';
  const _band = priceBand(b), _mem = b.discountMemory||0;
  h += '<div class="tiny muted" style="margin:-4px 0 10px 0">Demand elasticity for this sector is '+T.elasticity.toFixed(1)+'. '+
    (T.elasticity>1.3?'Customers are price-sensitive here.':'Customers here are relatively insensitive to price.')+
    '<br>Your positioning (<b>'+Math.round(b.positioning===undefined?45:b.positioning)+'/100</b>) earns you a band of '+
    '<b>'+Math.round(_band.lo*100)+'&ndash;'+Math.round(_band.hi*100)+'%</b> of list. Inside it, price behaves as above. '+
    'Outside it, you are making a claim this business has not earned.'+
    (_mem>0.15?'<br><span class="warn">The market has learned to wait for your discounts ('+Math.round(_mem*100)+'%). '+
      'Putting the price back up will cost more than the cuts ever bought.</span>':'')+'</div>';
  h += '<div class="slider"><span>Marketing</span><input type="range" data-inp="bizmark" min="0" max="2000000" step="25000" value="'+b.marketing+'"><span class="mono" style="text-align:right">'+fmt(b.marketing)+'</span></div>';
  h += '<div class="tiny muted" style="margin:-4px 0 10px 0">You are buying customers, not demand. '+
    'Each one currently costs about <b>'+fmt(b.cacQ||0)+'</b> to acquire, and that rises as you fish out the market. '+
    'You keep <b>'+Math.round((1-(b.churnQ||0))*100)+'%</b> of them a quarter'+
    (b.referredQ>0 ? ', and <b>'+Math.round(b.referredQ)+'</b> more arrived because somebody told them to.' : '.')+
    (b.rivalCut>0.14 ? ' <span class="warn">Your rival has matched your price.</span>' : '')+'</div>';
  h += '<div class="slider"><span>Quality</span><input type="range" data-inp="bizqual" min="0" max="600000" step="10000" value="'+(b.qualitySpendMonthly||0)+'"><span class="mono" style="text-align:right">'+fmt(b.qualitySpendMonthly||0)+'/mo</span></div>';
  h += '<div class="tiny muted" style="margin:-4px 0 10px 0">Current product quality: <b>'+Math.round(b.quality)+'</b>/100. '+
    'Quality is a process, not a purchase &mdash; it takes about five quarters of sustained spend to move it, '+
    'and a bigger business has to spend more just to hold the line.</div>';
  if(b.pendingDefects > 0)
    h += '<div class="tutorial bad" style="border-color:rgba(255,95,109,.4);color:#ffb3b8;background:rgba(255,95,109,.08)">'+
      '<b>'+Math.round(b.pendingDefects)+' defective units are already out there.</b> They were shipped at this quality '+
      'and they will surface as warranty claims in three to six quarters &mdash; about '+fmt(b.defectBill||0)+
      ', plus the reputation. Cutting the spend now books a saving today and the bill later.</div>';
  if(b.warrantyQ > 0)
    h += '<div class="tiny muted" style="margin:-2px 0 9px">Warranty and returns this quarter: <b class="bad">'+fmt(b.warrantyQ)+'</b>.</div>';
  h += '<hr class="sep"><div class="row wrap">'+
    '<button class="btn sm" data-a="expand">Commit to location #'+(b.locations+1)+' &middot; '+
      fmt(Math.round(expandCost()*0.35))+' now</button>'+
    (b.formal?'':'<button class="btn sm" data-a="formalize">Register company ('+fmt(Math.round(450000*S.cumInfl))+')</button>')+
    '<button class="btn sm" data-a="inject">Inject capital</button>'+
    '<button class="btn sm good" data-a="draw">Pay myself</button>'+
    '<button class="btn sm bad" data-a="closebiz">Wind it up</button>'+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:9px">Owner attention: <b>'+(ownerTime()*100).toFixed(0)+'%</b>'+(S.p.job?' — you still have a job.':(S.flags.moonlight?' — moonlighting.':' — full-time. This is your only income.'))+
    (S.p.job?' <button class="btn xs" data-a="toggle" data-k="moonlight">'+(S.flags.moonlight?'Stop':'Work evenings too')+'</button>':'')+'</div>';
  h += '</div>';
  // staff - world-first, a strip of badges, each opening the card the picture
  // opens; with the explanations shown, the full table comes back
  if(sceneFirst()) h += staffStripHTML(b);
  else {
    h += '<div class="card" style="margin-top:12px"><h3>People <span class="tag">'+b.staff.length+' staff · '+fmt(staffMonthly())+'/mo</span></h3>';
    if(b.staff.length){
      h += '<table><tr><th>Name</th><th>Skill</th><th>Type</th><th class="num">Salary</th><th>Morale</th><th></th></tr>';
      b.staff.forEach(function(s){
        const tr = TRAITS.find(x=>x.id===s.trait)||{name:'—'};
        h += '<tr><td>'+esc(s.name)+'</td><td class="num">'+s.skill+'/10</td><td><span class="chip '+(s.trait==='thief'||s.trait==='lazy'?'r':s.trait==='genius'||s.trait==='sharp'?'g':'')+'">'+tr.name+'</span></td>'+
          '<td class="num">'+fmt(s.salary)+'</td>'+
          '<td>'+bar(s.morale,100,s.morale>60?'var(--good)':s.morale>35?'var(--warn)':'var(--bad)')+'</td>'+
          '<td class="num"><button class="btn xs" data-a="raise" data-i="'+s.id+'">+15%</button> <button class="btn xs bad" data-a="fire" data-i="'+s.id+'">Let go</button></td></tr>';
      });
      h += '</table>';
    } else {
      h += '<div class="small muted">No staff. You are the operations department, the sales team and the cleaner. That works until it does not.</div>';
    }
    h += '<hr class="sep"><div class="tiny muted">Fair market salary for a skill-5 hire right now: <b>'+fmt(marketSalary(5))+'</b>/month. Underpay and they leave or steal; overpay and your break-even rises permanently.</div>';
    h += '</div>';
  }
  h += '</div>';
  // right column: hiring, partner
  h += '<div>';
  h += '<div class="card"><h3>Candidates this quarter</h3>';
  if(!S.candidates || !S.candidates.length){
    h += '<div class="small muted">No one is waiting. Check back next quarter.</div>';
  } else if(sceneFirst()){
    /* world-first: they are queuing outside in the picture; here each is a
       face that opens the same card, with the offer and the take */
    h += '<div class="facerow">'+applicantFacesHTML(S.candidates,'applicant')+'</div><div class="tiny muted prose">Tap anyone, here or in the queue outside, for what they ask and what you can do.</div>';
  } else {
    S.candidates.forEach(function(c){
      const tr = TRAITS.find(x=>x.id===c.trait)||{name:'—',d:''};
      h += '<div style="border:1px solid var(--line);border-radius:9px;padding:10px;margin-bottom:8px">'+
        '<div class="between"><b>'+esc(c.name)+'</b><span class="chip '+(c.skill>=8?'g':c.skill<=3?'r':'')+'">skill '+c.skill+'/10</span></div>'+
        '<div class="tiny muted" style="margin:4px 0">'+tr.name+' — '+tr.d+'</div>'+
        '<div class="row"><span class="mono">'+fmt(c.salary)+'/mo <span class="tiny muted">· asking '+fmt(c.ask||c.salary)+'</span></span><div class="spacer"></div>'+
        '<button class="btn sm primary" data-a="hirenego" data-i="'+c.id+'">Make an offer</button></div>'+
        '<div class="row" style="margin-top:6px"><button class="btn sm block" data-a="hireask" data-i="'+c.id+'">'+
          'Take them at '+fmt(c.ask||c.salary)+'/mo</button></div></div>';
    });
    h += '<div class="tiny muted">Hiring costs half a month of salary upfront in recruitment. Nobody tells you the best hires are the ones who cost the most per month and least per unit of output.</div>';
  }
  h += '</div>';
  if(b.partner){
    const pt = b.partner;
    const ptBg  = pt.bg  || (pt.kind==='partner' ? 'came in at the founding' : 'came in on a later round');
    const ptAsk = pt.ask || (((pt.pct||0) >= 25) ? 'holds enough to require a seat and a say' : 'holds a minority and knows it');
    h += '<div class="card" style="margin-top:12px"><h3>'+(pt.kind==='partner'?'Partner':'Largest outside holder')+'</h3>'+
      '<div class="kv"><span>'+esc(pt.name)+'</span><span class="chip p">'+(pt.equity||Math.round(pt.pct||0))+'%</span></div>'+
      '<div class="tiny muted" style="margin:6px 0">'+esc(ptBg)+'. '+esc(ptAsk)+'.</div>'+
      '<div class="statline"><span class="lbl">Trust</span>'+bar(pt.trust||50,100,'var(--purple)')+'<span class="val">'+Math.round(pt.trust||50)+'</span></div>'+
      '<button class="btn sm block" data-a="buyout">Buy them out</button>'+
      '<button class="btn sm block" style="margin-top:6px" data-a="tab" data-t="gov">The register and the board</button></div>';
  } else {
    h += '<div class="card" style="margin-top:12px"><h3>Partnerships</h3>'+
      '<div class="small muted">A partner brings capital, skills and a network — and takes a permanent share of everything. Choose the person, not the money.</div>'+
      '<button class="btn sm block" style="margin-top:9px" data-a="seekpartner">Sound people out</button></div>';
  }
  /* Buying out the minorities was wired into ACT and into the cap table and
     then never given a button: the action existed, the feature did not, and
     the audit found it because nothing anywhere emitted a control for it.
     It shows only when there is somebody to buy, and it names the premium and
     the cash you have against it - a 30% premium is exactly the kind of thing
     you should have to look at before agreeing to pay it. */
  {
    const q = buyoutExternal(b, 1.30);
    if(q.holders.length){
      h += '<div class="card" style="margin-top:12px"><h3>Minority holders '+
        '<span class="tag">'+q.holders.length+' outside</span></h3>'+
        '<div class="tiny muted" style="margin-bottom:8px">They own a share of this and they did not build it. '+
        'You can have the whole company back. In cash, today, at a premium.</div>'+
        '<div class="kv"><span class="muted">To buy them out</span><span class="mono">'+fmt(Math.round(q.cost))+'</span></div>'+
        '<div class="kv"><span class="muted">Cash on hand</span><span class="mono">'+fmt(S.fin.cash)+'</span></div>'+
        '<button class="btn sm block" style="margin-top:9px" data-a="buyoutminority"'+
        (S.fin.cash < q.cost ? ' disabled aria-disabled="true" title="Costs '+fmt(Math.round(q.cost))+' \u00b7 you have '+fmt(S.fin.cash)+' \u00b7 short '+fmt(Math.round(q.cost - S.fin.cash))+'"' : '')+'>Buy the minorities out</button></div>';
    }
  }
  h += '<div class="card" style="margin-top:12px"><h3>Track record</h3>';
  const hh = b.history.slice(-8).reverse();
  if(!hh.length) h += '<div class="tiny muted">No quarters closed yet.</div>';
  /* world-first: the quarters as bars, oldest to newest - revenue, and profit beside it */
  else if(sceneFirst()) h += trackChartSVG(hh.slice().reverse());
  if(!sceneFirst()) hh.forEach(function(x){
    h += '<div class="kv"><span class="muted">'+dateLabel(x.turn)+'</span><span>'+fmt(x.revenue)+' rev · <span class="'+(x.profit>=0?'good':'bad')+'">'+fmt(x.profit)+'</span></span></div>';
  });
  h += '</div>';
  h += '</div></div>';
  return h;
}
/* ------------------------------- Career ------------------------------- */
function viewCareer(){
  const p = S.p;
  let h = '<div class="grid g2"><div>';
  h += '<div class="card"><h3>Employment</h3>';
  if(p.job){
    h += '<div class="between"><div><b style="font-size:17px">'+esc(p.job.title)+'</b><div class="tiny muted">'+p.jobYears.toFixed(1)+' years · performance '+Math.round(p.jobPerf)+'/100</div></div>'+
      '<div style="text-align:right"><div class="mid">'+fmt(p.job.monthly)+'</div><div class="tiny muted">per month</div></div></div>'+
      '<div style="margin:10px 0">'+statRow('Performance', p.jobPerf, 'var(--info)')+'</div>'+
      foldHTML('Why performance drifts', 'Performance drifts toward a baseline set by your skills and tenure. Below about 34, redundancy becomes a live risk.');
  } else {
    h += '<div class="small muted">You are not employed. No salary arrives, and nothing is stopping you either.</div>';
    h += '<button class="btn sm block" style="margin-top:9px" data-a="findjob">Look for a job</button>';
  }
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>What you can do this quarter <span class="tag">'+
    hoursLeft()+'h left</span></h3>';
  h += foldHTML('Where the hours come from', 'You have about <b>'+weeklyFreeHours()+
    '</b> discretionary hours a week once work, sleep, commuting and the house have taken their share — <b>'+
    hoursBudget()+'</b> this quarter. Spend past that and the difference comes out of your sleeping.');
  if(sleepDebt() > 0){
    h += '<div class="principle" style="margin-bottom:9px;border-left-color:var(--bad)"><b>Sleep debt: '+
      Math.round(sleepDebt())+' hours.</b> You have been spending nights you did not have. It is being repaid '+
      'out of this quarter, and until it clears your health and performance both suffer.</div>';
  }
  CAREER.forEach(function(c, i){
    const ok = !c.can || c.can(S);
    const odds = (typeof c.odds==='function') ? clamp(c.odds(S),0,1) : c.odds;
    const hrs = c.hours || 0;
    const short = hrs > hoursLeft();
    const done = (S.p.acts||{})[c.id] || 0;
    let tag = '';
    if(hrs){
      tag = hrs+'h' + (short ? ' · borrows '+(hrs-hoursLeft())+'h from sleep' : '');
      if(done) tag += ' · done '+done+'x';
    } else if(c.cost) tag = fmt(c.cost);
    h += '<div class="mrow" style="opacity:'+(ok?1:.45)+'">'+
      '<div class="between"><b>'+c.label+'</b>'+
      ((odds!==undefined && (D().showOdds)) ? '<span class="chip b">'+pct(odds,0)+' odds</span>' : (tag?'<span class="chip">'+tag+'</span>':''))+'</div>'+
      /* the hint is the action's own teaching: what it costs you, and why you
         would. It stays one tap away - and it is still what a disabled button
         says when it refuses, so the reason is never further than the control. */
      foldHTML('Why', c.hint)+
      (short ? '<div class="tiny bad" style="margin:6px 0">You do not have '+hrs+
        ' hours left this quarter. Doing this will cost you sleep.</div>' : '')+
      '<button class="btn sm primary block" data-a="career" data-i="'+i+'"'+((ok && S.fin.cash>=c.cost)?'':' disabled aria-disabled="true" title="'+
        (!ok ? 'Not open to you yet: '+esc(c.hint) : 'Costs '+fmt(c.cost)+' \u00b7 you have '+fmt(S.fin.cash)+' \u00b7 short '+fmt(Math.round(c.cost - S.fin.cash)))+'"')+'>Do it</button></div>';
  });
  h += '</div></div>';
  h += '<div>';
  h += '<div class="card"><h3>Capability</h3>';
  ['finance','ops','hustle','network','tech'].forEach(function(k){
    h += statRow(k, p.skills[k], 'var(--info)');
  });
  h += foldHTML('How skills rise', 'Skills rise from deliberate spending (Learning in the budget), from certifications, and from simply operating a business for long enough.')+'</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Recent career log</h3>';
  S.journal.filter(j=>j.cat==='career').slice(0,10).forEach(function(j){
    h += '<div class="logline"><div class="t">'+j.date+'</div>'+esc(j.text)+'</div>';
  });
  if(!S.journal.filter(j=>j.cat==='career').length) h += '<div class="tiny muted">Nothing yet.</div>';
  h += '</div></div></div>';
  return h;
}

/* -------------------------------- Life -------------------------------- */
function viewLife(){
  const p = S.p, nd = needs();
  let h = '<div class="grid g2"><div>';
  /* world-first: the facts as icons, the four that move as gauges */
  if(sceneFirst()) h += '<div class="card"><h3>Your life</h3><div class="lifepic">'+lifeInner(p)+'</div></div>';
  else h += '<div class="card"><h3>Your life</h3>'+
    '<div class="kv"><span class="muted">Age</span><span>'+p.age+'</span></div>'+
    '<div class="kv"><span class="muted">Education</span><span>'+esc(p.edu)+'</span></div>'+
    '<div class="kv"><span class="muted">Relationship</span><span>'+(p.married?('Married'+(p.partner?' to '+esc(p.partner.name):'')):'Single')+'</span></div>'+
    '<div class="kv"><span class="muted">Children</span><span>'+p.kids+'</span></div>'+
    '<div class="kv"><span class="muted">Parents living</span><span>'+p.parents+'</span></div>'+
    '<div class="kv"><span class="muted">Dependants cost multiplier</span><span>'+((1+(p.married?0.75:0)+p.kids*0.55+(p.parents>0?0.30:0)).toFixed(2))+'×</span></div>'+
    '<hr class="sep">'+
    statRow('Health', p.health, p.health>60?'var(--good)':p.health>30?'var(--warn)':'var(--bad)')+
    statRow('Stress (lower better)', 100-p.stress, p.stress<40?'var(--good)':p.stress<70?'var(--warn)':'var(--bad)')+
    statRow('Happiness', p.happy, 'var(--acc)')+
    statRow('Family standing', p.family, 'var(--info)')+
    '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>What it costs to run this life</h3>'+
    '<div class="tiny muted" style="margin-bottom:8px">These are the monthly figures at which your stats hold steady. Go below and something deteriorates. Every dependant you add raises all of them.</div>'+
    Object.keys(nd).map(function(k){
      const spend = S.fin.budget[k]||0;
      const ok = spend >= nd[k];
      return '<div class="kv"><span>'+k+' <span class="chip '+(ok?'g':'r')+'">'+(ok?'ok':'short')+'</span></span><span>'+fmt(spend)+' / '+fmt(nd[k])+'</span></div>';
    }).join('')+
    '</div>';
  h += '</div>';
  h += '<div>';
  h += '<div class="card"><h3>Decisions on record <span class="tag">'+(S.decisions||[]).length+' made</span></h3>';
  const decs = (S.decisions||[]).slice(0,14);
  if(!decs.length) h += '<div class="small muted">No decisions recorded yet. Advance a quarter.</div>';
  decs.forEach(function(x){
    h += '<div class="logline" style="border-left-color:'+(x.kind==='good'?'var(--good)':x.kind==='bad'?'var(--bad)':'var(--line)')+'">'+
      '<div class="t">'+x.date+'</div><b>'+esc(x.title)+'</b><br>'+esc(x.choice)+' → '+esc(x.outcome)+
      (D().coaching && PRINCIPLES[x.title] ? '<div class="principle">'+esc(PRINCIPLES[x.title])+'</div>' : '')+
      '</div>';
  });
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Life log</h3>';
  const life = S.journal.filter(j=>['life','health'].indexOf(j.cat)>=0).slice(0,12);
  if(!life.length) h += '<div class="tiny muted">Nothing yet.</div>';
  life.forEach(function(j){ h += '<div class="logline"><div class="t">'+j.date+'</div>'+esc(j.text)+'</div>'; });
  h += '</div></div></div>';
  return h;
}