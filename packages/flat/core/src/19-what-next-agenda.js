

/* ===========================================================================
   What next (§17 P5)

   The game never said what to do next. The agenda listed fires, but only on
   two screens, never explained why a thing mattered, and when nothing was
   wrong it said nothing at all - which is precisely when a player is lost.

   nextActions() answers in the order the loop actually runs:

     1. put out the fire             lv 'bad'
     2. handle it before advancing   lv 'warn'
     3. make one deliberate move     lv 'go'   - never empty by construction

   Every entry names the (tab, sub) that owns it and, where one exists, the
   card on that screen, so the button lands the player on the control rather
   than on a tab. `goto` opens the group that hides that card first: a target
   the player cannot see is worse than no target at all.
   =========================================================================== */
/*@table:NEXT_DEST@*/
function subLabel(tab, sub){
  const t = (TABS || []).find(function(x){ return x.id === tab; });
  const sb = (subsFor(tab) || []).find(function(x){ return x.id === sub; });
  return (t ? t.label : tab) + (sb ? ' \u203a ' + sb.label : '');
}
function nextActions(){
  const out = [];
  const push = function(o){ out.push(o); };

  /* 1 + 2: everything the agenda already knows how to detect, now with a
     destination attached. The agenda card itself is untouched. */
  agendaItems().forEach(function(it){
    const d = NEXT_DEST[it.kind] || { tab:'work', sub:'business', focus:'' };
    push({ lv:it.lv, pri:0, text:it.text, act:it.act || '', id:it.id || '',
           biz:it.biz || '', tab:d.tab, sub:d.sub, focus:d.focus || '' });
  });

  /* 3: the deliberate move. Present even when nothing is on fire, ordered by
     how soon the chance expires - a vote closes, an offer lapses, the quarter
     ends, and only then the things that can wait. */
  if(S.biz){
    if(openResolutions(S.biz).length){
      const n = openResolutions(S.biz).length;
      push({ lv:'go', pri:0, text:n + ' resolution' + (n > 1 ? 's are' : ' is') +
        ' in flight. Whip the votes before the deadline or lose by default.',
        tab:'governance', sub:'votes', focus:'' });
    }
    if((S.biz.inbound || []).some(function(x){ return x.status === 'live'; }))
      push({ lv:'go', pri:0, text:'Someone has a live bid on the company. Diligence is where a headline price becomes a real one.',
        tab:'governance', sub:'bids', focus:'' });
    if(extHolders(S.biz).length){
      const empty = seatEntitlement(S.biz) - boardOf(S.biz).filter(function(d){ return !d.departing; }).length;
      if(empty > 0) push({ lv:'go', pri:0, text:'There are ' + empty + ' empty seat' +
        (empty > 1 ? 's' : '') + ' on the board. An empty seat is an invitation.',
        tab:'governance', sub:'board', focus:'' });
    }
    if((S.offers || []).length) push({ lv:'go', pri:1, text:(S.offers || []).length +
      ' partnership offer' + ((S.offers || []).length > 1 ? 's are' : ' is') +
      ' on the table. Offers lapse.', tab:'work', sub:'business', focus:'Partnerships' });
  }
  if((S.deals || []).length > 1) push({ lv:'go', pri:2, text:(S.deals || []).length +
    ' deals are open. Most of them close on their own if you ignore them.',
    tab:'money', sub:'deals', focus:'' });

  const hb = hoursBudget(), hl = hoursLeft();
  if(hb > 0 && hl > hb * 0.35) push({ lv:'go', pri:3, text:'You have ' + hl + ' of ' + hb +
    ' hours left this quarter. Unspent time is the one thing you never get back.',
    tab:'work', sub:'career', focus:'What you can do this quarter' });

  if((S.fin.cash || 0) > 3000000 && !(S.assets || []).length)
    push({ lv:'go', pri:4, text:fmt(Math.round(S.fin.cash)) +
      ' is sitting in cash. Inflation eats it every quarter you leave it there.',
      tab:'money', sub:'markets', focus:'Markets' });

  if(!S.ambition) push({ lv:'go', pri:5, text:'You have not said what you are building toward. The run is graded against that answer.',
    tab:'legacy', sub:'ambition', focus:'' });

  /* The rail is never empty: being told there is nothing to do is itself the
     answer a lost player needs. */
  if(!out.length) push({ lv:'go', pri:9, text:'Nothing needs you. This is the part where you choose: grow something, buy something, or close the quarter.',
    tab:'money', sub:'position', focus:'' });
  return out;
}
/* The button an action gets. Shared with the agenda card on Overview so the
   two never disagree about where a thing lives. */
function nextBtn(it, here){
  if(here) return '<button class="btn xs primary" data-a="advance">Close the quarter \u25b8</button>';
  if(it.act) return '<button class="btn xs primary" data-a="doact" data-act="'+it.act+
    '" data-o="'+it.id+'" data-c="'+it.id+'" data-b="'+it.biz+'">Do it</button>';
  return '<button class="btn xs primary" data-a="goto" data-t="'+it.tab+'" data-s="'+it.sub+
    '" data-f="'+esc(it.focus)+'"'+(it.biz?' data-b="'+it.biz+'"':'')+'>Take me there</button>';
}
/* ===========================================================================
   §22.13 — the notification centre.

   nextRail() used to return one card that render() put at the top of every
   screen except Overview. Twenty screens, the same card, every time - and the
   one thing it could never do was count. It is a bell in the header instead:

     - the badge counts what genuinely needs you (a fire, or something with a
       deadline). Suggestions never badge, because a number that is never
       zero is a number you have trained yourself not to see.
     - opening it gives the whole list, worst first, and every row keeps the
       button the rail used to have, so it is a place to act from and not
       just a place to read.
     - the badge and every row come out of one call to nextActions(), so the
       bell and the Overview's "Waiting on you" card cannot disagree.

   The rail is gone from the page body on purpose: a sentence that appears on
   every screen is a sentence nobody reads by the third screen.
   =========================================================================== */
/*@table:NOTIF_TIERS@*/
/* One pass over nextActions(): the counts for the badge and the groups for
   the list. Two passes would let the badge and the list disagree for one
   render, which is exactly the kind of thing that gets reported as a lie. */
function notifModel(){
  const all = nextActions();
  const c = { bad:0, warn:0, go:0, total:all.length, urgent:0 };
  const byId = {};
  NOTIF_TIERS.forEach(function(t){ byId[t.id] = []; });
  all.forEach(function(a){
    if(byId[a.lv]) byId[a.lv].push(a);
    if(c[a.lv] !== undefined) c[a.lv]++;
  });
  c.urgent = c.bad + c.warn;
  const groups = NOTIF_TIERS.filter(function(t){ return byId[t.id].length; })
                            .map(function(t){ return { tier:t, items:byId[t.id] }; });
  return { counts:c, groups:groups, all:all };
}
function notifCounts(){ return notifModel().counts; }
function notifGroups(){ return notifModel().groups; }
/* Drawn rather than typed, so it inherits the button colour on hover and
   needs no font that a downloaded copy of the page would not have. */
const BELL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '+
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
  '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>'+
  '<path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>';
function bellHTML(){
  const m = notifModel(), c = m.counts;
  let h = '<div class="bellwrap'+(UI.bellOpen?' on':'')+'">'+
    '<button class="bellbtn" data-a="belltoggle" title="Notifications" '+
      'aria-label="Notifications'+(c.urgent?', '+c.urgent+' waiting':'')+'">'+ BELL_SVG +
      (c.urgent ? '<span class="bellbadge'+(c.bad?' bad':'')+'">'+c.urgent+'</span>' : '')+
    '</button><div class="bellpop">';
  h += '<div class="bellhead"><span>Notifications</span><span class="mono">'+
       (c.urgent ? c.urgent+' waiting' : 'nothing urgent')+'</span></div>';
  h += '<div class="bellbody">';
  if(!m.groups.length){
    h += '<div class="tiny muted" style="padding:9px 1px">Nothing is waiting. '+
         'This is the part where you choose: grow something, buy something, '+
         'or close the quarter.</div>';
  }
  m.groups.forEach(function(g){
    h += '<div class="belltier" style="color:'+g.tier.col+'"><i></i><b>'+g.tier.label+
         '</b><span class="muted">· '+g.items.length+'</span></div>';
    g.items.forEach(function(it){
      h += '<div class="nitem" style="border-left-color:'+g.tier.col+'">'+
        '<div class="row" style="gap:8px;align-items:flex-start">'+
          '<div class="small" style="flex:1;min-width:0">'+esc(it.text)+
            '<div class="tiny muted" style="margin-top:2px">'+
            (it.act ? 'one button from done' : esc(subLabel(it.tab, it.sub)))+'</div>'+
          '</div>'+
          nextBtn(it, false)+
        '</div></div>';
    });
  });
  h += '</div>';
  h += '<div class="nfoot"><span>'+c.total+' thing'+(c.total===1?'':'s')+
       ' on the list</span>'+
       '<button class="btn xs ghost" data-a="tab" data-t="overview">'+
       'Open the overview</button></div>';
  h += '</div></div>';
  return h;
}
/* ===========================================================================
   Phase 12 — the lever map (§22.16)

   The machine was scattered: price, marketing and quality on one card, credit
   terms and stock on another, staffing on a third, leases and contracts on two
   more, commitments on a sixth. To answer "what can I actually move?" you had
   to know where everything lived.

   This screen is the answer, sorted by the only property that matters when you
   are deciding: how much it costs you to change your mind.

     1. Set each quarter  - dials. Turn tonight, turn back tomorrow.
     2. Commit to         - lumpy, lead-timed, and expensive to unmake.
     3. Negotiate         - yours and somebody else's, settled between you.
     4. Cannot control    - not yours at all.

   The fourth column is the one design decision worth naming: it is absent
   until something in it is actually biting you. A permanent list of things you
   cannot change is wallpaper; the same list appearing the week a competitor
   undercuts you is information.
   =========================================================================== */
function leverGoto(focus, label){
  return '<button class="btn xs" data-a="goto" data-t="work" data-s="business" data-f="'+
    esc(focus)+'">'+esc(label||'Open')+'</button>';
}
function leverRow(name, val, note, btn, flag, col){
  return '<div class="lrow" style="border-left-color:'+(col||'var(--line)')+'">'+
    '<div class="between"><b>'+name+'</b><span class="mono '+(flag||'')+'">'+val+'</span></div>'+
    '<div class="tiny muted" style="margin:2px 0 6px">'+note+'</div>'+
    (btn||'')+'</div>';
}
/* ---- 1. the dials ---- */
function leverColSet(b){
  const band = priceBand(b), px = b.priceIdx||1;
  const stock = (b.stockPolicy===undefined?0.45:b.stockPolicy);
  const rows = [
    leverRow('Price', Math.round(px*100)+'%',
      (px > band.hi ? 'Above what your positioning earns. They are not buying it.'
       : px < band.lo ? 'Below the band. You are paying customers to shop.'
       : 'Inside the band your positioning supports.')+
      ' Elasticity '+ (BIZ.find(function(x){return x.id===b.type;})||{elasticity:1}).elasticity.toFixed(1) +'.',
      leverGoto('Operations','Change'),
      px > band.hi ? 'bad' : px < band.lo ? 'warn' : '',
      px > band.hi ? 'var(--bad)' : px < band.lo ? 'var(--warn)' : 'var(--line)'),
    leverRow('Marketing', fmt(b.marketing||0)+'/q',
      'Buys customers, not demand. Each one is costing '+fmt(b.cacQ||0)+' to acquire.',
      leverGoto('Operations','Change')),
    leverRow('Quality', fmt(b.qualitySpendMonthly||0)+'/mo',
      'Product quality is '+Math.round(b.quality||0)+'/100 and takes about five quarters of spend to move.',
      leverGoto('Operations','Change')),
    leverRow('Credit terms', Math.round((b.creditTerms||0)*90)+' days',
      'Buys about '+Math.round((b.creditTerms||0)*22)+'% more demand, and the cash arrives later — some of it never.',
      leverGoto('Levers','Change')),
    leverRow('Stock depth',
      (stock<0.25?'Lean':stock<0.5?'Balanced':stock<0.75?'Deep':'Very deep'),
      'Under-stock and you turn away demand standing in the room. Over-stock and your cash is on a shelf.',
      leverGoto('Levers','Change')),
    leverRow('Owner draw', fmt(Math.round(b.draw||0))+'/q',
      'It paid out '+fmt(b.drawnQ||0)+' last quarter, if the company could fund it.',
      leverGoto('Levers','Change'))
  ];
  return '<div class="card"><h3>Set each quarter <span class="tag">effective next quarter</span></h3>'+
    '<div class="tiny muted" style="margin-bottom:10px">Dials. Every one of these you can turn tonight and turn back '+
    'tomorrow, which is exactly why none of them is where a business is won.</div>'+ rows.join('') +'</div>';
}
/* ---- 2. the commitments ---- */
function leverColCommit(b){
  let h = '<div class="card"><h3>Commit to <span class="tag">'+
    (((b.commitments||[]).filter(function(c){ return c.status==='building'||c.status==='active'; }).length)
      ? ((b.commitments||[]).filter(function(c){ return c.status==='building'; }).length)+' in flight'
      : 'nothing on')+'</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">Lumpy, slow to arrive, and priced so that changing your '+
    'mind hurts. You are buying a number you will be stuck with for quarters.</div>';

  (b.commitments||[]).forEach(function(c){
    const running = c.status === 'active';
    if(!running && c.status !== 'building') return;
    const K = LEVER_KINDS[c.kind];
    const left = running ? Math.max(0,(c.endsAt||S.turn)-S.turn)
                         : Math.max(0,(c.readyAt||S.turn)-S.turn);
    const cost = running ? commitDropCost(c) : commitBreak(c);
    h += '<div class="ltake" style="border-color:'+(running?'var(--acc)':'var(--warn)')+'">'+
      '<div class="between"><b>'+esc(c.label||'Commitment')+'</b><span class="chip '+(running?'g':'y')+'">'+
      (running ? left+'q left' : 'arrives in '+left+'q')+'</span></div>'+
      '<div class="tiny muted" style="margin:5px 0 6px">'+
      (running ? esc((K && K.gives) || c.note || '') : fmt(Math.round(c.total||0))+' committed &middot; '+
        fmt(Math.round(c.paid||0))+' spent &middot; '+fmt(c.perQ||0)+' a quarter while it builds')+'</div>'+
      '<button class="btn xs bad" data-a="'+(running?'leverdrop':'abandon')+'" data-i="'+c.id+'">'+
      (running?'Stand it down &mdash; ':'Abandon &mdash; ')+fmt(cost)+'</button></div>';
  });

  h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px"><b>Take one on.</b> '+
    'Each is a term, not a setting.</div>';
  Object.keys(LEVER_KINDS).forEach(function(k){
    const K = LEVER_KINDS[k], cost = K.cost(b);
    const busy = leverActive(b,k) || leverPending(b,k);
    h += '<div class="ltake"'+(busy?' style="opacity:.5"':'')+'>'+
      '<div class="between"><b>'+esc(K.label)+'</b><span class="mono">'+fmt(cost)+'</span></div>'+
      '<div class="tiny muted" style="margin:5px 0 6px">'+esc(K.gives)+' <span class="muted">&middot;</span> '+
      esc(K.takes)+'<br><span class="muted">'+K.lead+'q to arrive &middot; locked for '+K.term+'q</span></div>'+
      (busy
        ? '<span class="tiny muted">'+(leverActive(b,k)?'Running':'Already being set up')+'</span>'
        /* written out, not built as 'lever'+k: the audit gate greps the file
           for data-a="&hellip;" to prove every action a player can take is
           reachable, and a name assembled at runtime is invisible to it - so
           the gate said these three did not exist while they plainly did. */
        : k === 'shifts'
          ? '<button class="btn xs primary" data-a="levershift">Commit '+fmt(cost)+'</button>'
        : k === 'supply'
          ? '<button class="btn xs primary" data-a="leversupply">Commit '+fmt(cost)+'</button>'
          : '<button class="btn xs primary" data-a="leverchannel">Commit '+fmt(cost)+'</button>')+
      '</div>';
  });
  h += '<div class="row wrap" style="gap:6px;margin-top:2px">'+
    leverGoto('Team','Hire someone') + leverGoto('Units','Open a unit') + '</div>';
  return h + '</div>';
}
/* ---- 3. the negotiations ---- */
function leverColNego(b){
  const soon = (b.outlets||[]).filter(function(o){ return ((o.end||0)-S.turn) <= 2 && o.status !== 'building'; });
  const renew = (b.contracts||[]).filter(function(c){ return (c.turns||0) <= 1; });
  const thin  = (b.contracts||[]).filter(function(c){ return (c.margin||0) < 0.05; });
  const tenders = (b.offersC||[]).filter(function(o){ return (o.expires - S.turn) <= 1; });
  const under = (b.staff||[]).filter(function(st){ return (st.salary||0) < marketSalary(st.skill)*0.85; });
  const dpo = cccOf(b).dpo;
  const items = [];
  if(soon.length)    items.push(leverRow(soon.length+' lease'+(soon.length===1?'':'s')+' up',
    'this quarter or next', 'Rent is the one cost you cannot cut your way out of. Negotiate before it renews, not after.',
    leverGoto('Units','Negotiate'), 'warn', 'var(--warn)'));
  if(renew.length)   items.push(leverRow(renew.length+' contract'+(renew.length===1?'':'s')+' for renewal','now',
    'Renew at the wrong margin and you have bought yourself a year of working for nothing.',
    leverGoto('Contracts','Renew'), 'warn', 'var(--warn)'));
  if(thin.length)    items.push(leverRow(thin.length+' running below 5%','margin',
    'Revenue that costs as much to deliver as it earns. It looks like growth and behaves like a loan.',
    leverGoto('Contracts','Look')));
  if(tenders.length) items.push(leverRow(tenders.length+' tender'+(tenders.length===1?'':'s')+' closing','this quarter',
    'The price you bid is the price you live with for the whole contract.',
    leverGoto('Contracts','Bid')));
  if(under.length)   items.push(leverRow(under.length+' paid below market','wages',
    'That is borrowed time, not savings. They will ask, or they will leave.',
    leverGoto('Team','Review pay')));
  if(dpo > 45)       items.push(leverRow(dpo+' days behind with suppliers','credit',
    'A loan they did not agree to. Supplier confidence is '+Math.round(b.supplierConf===undefined?70:b.supplierConf)+'/100.',
    leverGoto('Working capital','Look'), 'warn', 'var(--warn)'));
  let h = '<div class="card"><h3>Negotiate <span class="tag">'+items.length+' open</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">These belong to somebody else as much as to you. '+
    'Nothing here is yours to set; all of it is yours to lose by not turning up.</div>';
  h += items.length ? items.join('')
    : '<div class="tiny muted">Nothing to settle this quarter. Enjoy it while it lasts.</div>';
  return h + '</div>';
}
/* ---- 4. what you cannot control, and only while it is biting ---- */
function leverColReact(b){
  const items = [];
  const need = Math.max(1, b.capacity||0), dem = b.demand||0;
  if(dem > need*1.15) items.push(leverRow('Demand is outrunning you',
    Math.round((dem/Math.max(1,need)-1)*100)+'% over capacity',
    'Customers you are serving nothing to. You can raise price and keep the ones you can serve, or buy capacity and wait two quarters for it.',
    leverGoto('Operations','Raise price')));
  else if(dem < need*0.62 && need > 25) items.push(leverRow('Idle capacity',
    Math.round((1-dem/Math.max(1,need))*100)+'% unused',
    'You are paying for output nobody is buying. Nothing on this list is fixed by hoping.',
    leverGoto('Operations','Cut price')));
  const over = supplyOverpay(b);
  if(over > 3) items.push(leverRow('Your locked input price is above the market', over+'% over',
    'You fixed a price and the world got cheaper. That is the trade you made; the only question is how long you keep paying it.',
    '<button class="btn xs bad" data-a="leverdrop" data-i="'+leverOf(b,'supply','active').id+'">Stand it down</button>',
    'bad', 'var(--bad)'));
  else if(over < -2) items.push(leverRow('Your locked input price is working', Math.abs(over)+'% under',
    'Costs rose and you are still paying the old price. This is the quarter the contract was for.',
    '', 'good', 'var(--good)'));
  if((b.rivalCut||0) > 0) items.push(leverRow('Your rival has matched you', Math.round((b.rivalCut||0)*100)+'% of your price cut',
    'They can do this for as long as they can afford to. Cutting again buys nothing.',
    leverGoto('Operations','Look at price'), 'warn', 'var(--warn)'));
  const e = eraById(S.era && S.era.id);
  if(e && e.tone !== 'neutral' && e.tone !== 'good'){
    const fx = eraFxLine(e);
    if(fx) items.push(leverRow(e.name, eraLeft()+'q left',
      'What it is doing to the economy: '+fx+'. None of this is addressed to you personally.',
      leverGoto('Engine room','See the numbers'), e.tone==='bad'?'bad':'warn',
      e.tone==='bad'?'var(--bad)':'var(--warn)'));
  }
  const low = (b.staff||[]).filter(function(st){ return (st.morale||100) < 35; });
  if(low.length) items.push(leverRow(low.length+' of your people are halfway out',
    Math.round(Math.min.apply(null, low.map(function(st){ return st.morale||0; })))+' morale',
    'You do not control when they go. You only control what they were being paid when they decided.',
    leverGoto('Team','Look'), 'bad', 'var(--bad)'));
  if(!items.length) return '';
  let h = '<div class="card"><h3>Cannot control <span class="tag">'+items.length+' biting</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">Not yours to set, and not yours to keep. '+
    'This column appears when one of these starts costing you money and disappears when none of them is.</div>';
  return h + items.join('') + '</div>';
}

/* --------------------- your household: the staff you employ for your life ----- */
function housePayrollSummary(){
  const list = S.house||[]; if(!list.length) return '';
  const byBiz = {};
  list.forEach(function(h){ if((h.payer||'you')!=='you'){ byBiz[h.payer] = (byBiz[h.payer]||0) + (h.salary||0) + housePerkCost(h); } });
  let s = '<div class="kv"><span>You pay</span><span class="mono">'+fmt(houseMonthlyYou())+'/mo</span></div>';
  Object.keys(byBiz).forEach(function(k){
    const b = bizById(k);
    s += '<div class="kv"><span>'+(b?esc(b.name):'a company that no longer exists')+
      ' pays <span class="chip y">benefit in kind</span></span><span class="mono">'+fmt(Math.round(byBiz[k]))+'/mo</span></div>';
  });
  s += '<div class="kv"><span>Total</span><span class="mono"><b>'+fmt(houseMonthly())+'/mo</b></span></div>';
  return s;
}