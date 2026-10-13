
import { ARMS_LENGTH, IC_RATE, WHT_RATE, _gcell, _glabel, clamp, ensureHoldco, entityName, esc, fmt, groupAccounts, groupCashInner, groupCovenantStrip, groupCrossDefault, groupPLInner, holdcoName, intercoOwed, intercoUpstream, sceneFirst } from '@ledger/core';

/* Generated from src/16-view-group.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewGroup(){
  const g = groupAccounts();
  const subs = g.rows;
  const h0 = ensureHoldco();
  let h = '';

  /* ---- what a group is ---- */
  h += '<div class="card"><h3>'+esc(holdcoName())+'</h3>'+
    '<details class="fold"><summary>What a group is</summary><div>'+
    'A company\'s profit is not your money. It belongs to the company until the board declares it, '+
    'and when it is declared every holder is paid pro rata — including the people whose names are on the register beside yours. '+
    'This view is where you decide how much cash to lift, how to lift it, and what it costs you.'+
    '</div></details>';

  if(subs.length < 2){
    h += '<div class="tiny muted">One company is not a group. Once you own more than one, consolidation, '+
      'upstream dividends, intercompany funding and cross-default all start to matter.</div>';
  }

  /* ---- consolidated P&L ---- */
  if(subs.length){
    const cols = subs.map(function(r){ return '<th style="text-align:right;padding:4px 7px;font-weight:600">'+esc(r.name)+'</th>'; }).join('');
    const line = function(label, key, strong){
      return '<tr>'+_glabel(label, strong)+
        subs.map(function(r){ return _gcell(r[key], strong); }).join('')+
        _gcell(g[key], strong)+'</tr>';
    };
    /* world-first: the group's quarter as a waterfall, each company's share of it
       - the table, which scrolls sideways on a phone, with the explanations shown */
    if(sceneFirst()) h += '<div class="gpic">'+groupPLInner(g, subs)+'</div>';
    else h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:4px">'+
      '<tr>'+_glabel('This quarter')+cols+'<th style="text-align:right;padding:4px 7px;border-left:1px solid var(--line2)">Group</th></tr>'+
      line('Revenue','rev')+
      line('Cost of sales','cogs')+
      line('Gross profit','gross')+
      line('Overheads (incl. management charge)','opex')+
      line('EBITDA','ebitda', true)+
      line('Depreciation','dep')+
      line('Interest','int')+
      line('Tax','tax')+
      line('Net profit','net', true)+
      '</table></div>';

    h += '<div class="row wrap" style="gap:14px;margin-top:9px">'+
      '<span class="tiny muted">Trailing twelve months: revenue <b style="color:var(--txt)">'+fmt(g.revTTM)+'</b>, EBITDA <b style="color:var(--txt)">'+fmt(g.ebitdaTTM)+'</b></span>'+
      '<span class="tiny muted">Attributable to you <b style="color:var(--txt)">'+fmt(g.attributable)+'</b>'+
      (Math.abs(g.minorityNet) > 1 ? ' · minority <b style="color:var(--warn)">'+fmt(g.minorityNet)+'</b>' : '')+'</span>'+
      '</div>';
    if(g.elimMgmt > 0){
      h += '<div class="tiny muted" style="margin-top:5px">'+fmt(g.elimMgmt)+' of management charges are eliminated on consolidation — '+
        'income at the holdco, cost in the subsidiaries, never group profit in the first place.</div>';
    }
  }
  h += '</div>';

  /* ---- where the cash and the debt actually sit ---- */
  h += '<div class="card"><h3>Cash, debt and reserves</h3>';
  /* world-first: each company as three bars to one scale, what is yours and
     what it can pay up - the table, which hid its last column, with (i) */
  if(sceneFirst()) h += '<div class="gpic">'+groupCashInner(g, subs)+'</div>';
  else {
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">'+
      '<tr><td style="padding:4px 7px;color:var(--dim)">Entity</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Cash</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Debt</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Reserves</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Yours</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Can pay up</td></tr>';

    h += '<tr><td style="padding:4px 7px"><b>'+esc(holdcoName())+'</b></td>'+
      _gcell(g.holdcoCash)+_gcell(g.holdcoDebt)+_gcell(g.holdcoRetained)+
      '<td style="text-align:right;padding:4px 7px">100%</td><td style="text-align:right;padding:4px 7px;color:var(--dim2)">—</td></tr>';

    subs.forEach(function(r){
      h += '<tr><td style="padding:4px 7px">'+esc(r.name)+'</td>'+
        _gcell(r.cash)+_gcell(r.debt)+_gcell(r.retained)+
        '<td style="text-align:right;padding:4px 7px">'+Math.round(r.own)+'%</td>'+
        '<td style="text-align:right;padding:4px 7px;'+(r.cap>0?'color:var(--good)':'color:var(--dim2)')+'">'+(r.cap>0?fmt(r.cap):(r.note?'blocked':'—'))+'</td></tr>';
    });

    h += '<tr>'+_glabel('Group', true)+_gcell(g.groupCash, true)+_gcell(g.groupDebt, true)+_gcell(g.subRetained + g.holdcoRetained, true)+
      '<td style="border-top:1px solid var(--line2)"></td><td style="border-top:1px solid var(--line2)"></td></tr>'+
      '</table></div>';
  }

  h += '<div class="row wrap" style="gap:8px;margin-top:9px">'+
    '<span class="chip '+(g.netCash>=0?'g':'r')+'">'+(g.netCash>=0?'Net cash ':'Net debt ')+fmt(Math.abs(g.netCash))+'</span>'+
    (g.leverage!==null ? '<span class="chip '+(g.leverage>3?'r':g.leverage>2.6?'y':'g')+'">Group leverage '+g.leverage.toFixed(2)+'x</span>' : '')+
    '</div>';

  const blocked = subs.filter(function(r){ return r.note && r.cap<=0; });
  if(blocked.length){
    h += '<hr class="sep">'+blocked.map(function(r){
      return '<div class="tiny" style="margin-bottom:5px"><b>'+esc(r.name)+'</b> — '+esc(r.note)+'</div>';
    }).join('');
  }
  h += '</div>';

  /* ---- taking money out ---- */
  h += '<div class="card"><h3>Getting cash out of a subsidiary</h3>'+
    '<details class="fold"><summary>The two doors</summary><div>Two doors, and they are not equivalent. '+
    '<b style="color:var(--txt)">A dividend</b> is paid out of reserves, is taxed at '+Math.round(WHT_RATE*100)+'% on the way up, '+
    'pays the other shareholders their share, and cannot be undone. '+
    '<b style="color:var(--txt)">An upstream loan</b> is not taxed, pays nobody else, and can be repaid — '+
    'but it is debt owed by a company that other people have lent money to, and every lender reads it as you stripping the business.</div></details>';

  subs.forEach(function(r){
    h += '<div style="border:1px solid var(--line);border-radius:9px;padding:9px;margin-bottom:8px">'+
      '<div class="between"><b>'+esc(r.name)+'</b><span class="tiny muted">you own '+Math.round(r.own)+'%</span></div>'+
      '<div class="tiny muted" style="margin:3px 0 7px">Reserves '+fmt(r.retained)+' · cash '+fmt(r.cash)+' · can pay up '+fmt(r.cap)+'</div>'+
      '<div class="row wrap" style="gap:5px">'+
      '<button class="btn xs primary" data-a="grpdiv" data-b="'+r.id+'"'+(r.cap>0?'':' disabled aria-disabled="true" title="Nothing to declare: after what it owes, this company can pay up '+fmt(r.cap)+'"')+'>Declare dividend</button>'+
      '<button class="btn xs" data-a="grploan" data-b="'+r.id+'" data-to="holdco"'+(r.cash>0?'':' disabled aria-disabled="true" title="This company has no cash to lend"')+'>Lend up to holdco</button>'+
      (g.holdcoCash>0 ? '<button class="btn xs" data-a="grploan" data-b="holdco" data-to="'+r.id+'">Fund from holdco</button>' : '')+
      '</div></div>';
  });

  if(subs.length > 1){
    h += '<div class="tiny muted" style="margin-top:4px">Subsidiary to subsidiary: '+
      subs.map(function(r){
        return '<button class="btn xs" data-a="grpdiv" data-b="'+r.id+'" style="opacity:.5" disabled aria-disabled="true" title="Subsidiary-to-subsidiary funding comes later \u2014 for now money moves through the holdco">'+esc(r.name)+'</button>';
      }).join(' ')+
      ' — cross-funding comes later; for now money moves through the holdco.</div>';
  }
  h += '</div>';

  /* ---- intercompany balances ---- */
  h += '<div class="card"><h3>Intercompany balances</h3>';
  if(!g.loans.length){
    h += '<div class="tiny muted">Nothing owed between group companies. Clean, and possibly inefficient — '+
      'cash sitting in a subsidiary that another one needs is a decision too.</div>';
  } else {
    h += '<table style="width:100%;border-collapse:collapse;font-size:12px">'+
      '<tr><td style="padding:4px 7px;color:var(--dim)">Owed by</td><td style="padding:4px 7px;color:var(--dim)">To</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Balance</td>'+
      '<td style="text-align:right;padding:4px 7px;color:var(--dim)">Interest / q</td><td></td></tr>';
    g.loans.forEach(function(L){
      const up = (L.to==='holdco');
      h += '<tr><td style="padding:4px 7px">'+esc(entityName(L.to))+'</td>'+
        '<td style="padding:4px 7px">'+esc(entityName(L.from))+'</td>'+
        _gcell(L.amt)+_gcell(Math.round(L.amt*IC_RATE))+
        '<td style="text-align:right;padding:4px 7px"><button class="btn xs" data-a="grprepay" data-l="'+L.id+'">Repay</button></td></tr>';
      if(up){
        h += '<tr><td colspan="5" class="tiny" style="padding:0 7px 6px;color:var(--warn)">'+
          'Upstream. A lender to '+esc(entityName(L.to))+' will treat this as you taking cash out from under them.</td></tr>';
      }
    });
    h += '</table>';
    h += '<div class="tiny muted" style="margin-top:7px">Total owed across the group '+fmt(intercoOwed())+
      ', of which '+fmt(intercoUpstream())+' has moved up to the holdco rather than out as dividend.</div>';
  }
  h += '</div>';

  /* ---- management charges and transfer pricing ---- */
  h += '<div class="card"><h3>Management charges</h3>'+
    '<details class="fold"><summary>How the charge works</summary><div>The holdco can charge each subsidiary for the work it does. '+
    'The charge is deductible in the subsidiary and taxable at the holdco, so it moves profit to where the tax is lower. '+
    'Anything above about '+ARMS_LENGTH+'% of revenue is more than an unrelated party would pay, and that is a position you have to defend.</div></details>';
  subs.forEach(function(r){
    const f = r.mgmtPct;
    h += '<div class="between" style="padding:6px 0;border-bottom:1px solid var(--line)">'+
      '<div><b>'+esc(r.name)+'</b><div class="tiny muted">'+
      (f>0 ? fmt(r.mgmtFee)+' this quarter ('+f+'% of revenue)' : 'no charge')+
      (f>ARMS_LENGTH ? ' · <span style="color:var(--warn)">above arm\'s length</span>' : '')+'</div></div>'+
      '<div class="row" style="gap:4px">'+
      '<button class="btn xs" data-a="grpmgmt" data-b="'+r.id+'" data-d="-1"'+(f>0?'':' disabled aria-disabled="true" title="The charge is already 0% \u2014 there is nothing to reduce"')+'>−</button>'+
      '<span style="min-width:34px;text-align:center;font-size:13px">'+f+'%</span>'+
      '<button class="btn xs" data-a="grpmgmt" data-b="'+r.id+'" data-d="1"'+(f<15?'':' disabled aria-disabled="true" title="15% is the ceiling for an arms-length charge; above that it is the tax office asking questions"')+'>+</button>'+
      '</div></div>';
  });
  const risk = g.tpRisk;
  h += '<div style="margin-top:9px"><div class="tiny muted">Transfer-pricing exposure</div>'+
    '<div style="height:7px;background:var(--panel3);border-radius:4px;overflow:hidden;margin-top:4px">'+
    '<div style="height:100%;width:'+clamp(risk/140*100,0,100)+'%;background:'+(risk>100?'var(--bad)':risk>70?'var(--warn)':'var(--good)')+'"></div></div>'+
    '<div class="tiny muted" style="margin-top:4px">'+
    (risk<=0 ? 'Nothing on the charge sheet. The structure is unremarkable.'
     : risk>100 ? 'This is past defensible. Expect an assessment, penalties and interest on top.'
     : risk>70 ? 'Visible. An auditor who picks this file will not struggle to make a case.'
     : 'Modest, and getting smaller if you leave it alone.')+'</div></div>';
  h += '</div>';

  /* ---- group covenant strip ---- */
  const strip = groupCovenantStrip();
  if(strip.length){
    h += '<div class="card"><h3>Group obligations</h3>';
    strip.forEach(function(c){
      h += '<div class="between" style="padding:6px 0;border-bottom:1px solid var(--line)">'+
        '<div><b>'+esc(c.label)+'</b>'+(c.detail?'<div class="tiny muted">'+esc(c.detail)+'</div>':'')+'</div>'+
        '<div class="row" style="gap:6px"><span style="font-size:13px">'+esc(c.actual)+'</span>'+
        (c.limit!=='—' ? '<span class="chip '+(c.ok?(c.tight?'y':'g'):'r')+'">limit '+esc(c.limit)+'</span>' : '')+
        '</div></div>';
    });
    const xd = groupCrossDefault();
    if(xd){
      h += '<div class="tiny" style="margin-top:8px;color:var(--bad)">Cross-default is live. '+
        'A breach in one subsidiary is a breach of every facility in the group. '+
        'Fixing the breached company is now the only thing that matters this quarter.</div>';
    }
    h += '</div>';
  }

  return h;
}