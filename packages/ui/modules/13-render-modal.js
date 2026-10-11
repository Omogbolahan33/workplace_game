
import { D, PRINCIPLES, S, UI, advanceModal, anotherBizModal, archOf, arrivalHTML, bizAccounts, bizById, clamp, dateLabel, deedOf, endModal, esc, evBody, evText, fmt, govVoteModal, helpModal, modalHTML, momentHTML, negFmt, negoModal, negoTacticButtons, optHint, optLabel, pct, profileModal, resultFxHTML, runInfoModal, seasonModal, settingsModal, startModal, yearModal } from '@ledger/core';
import { Q } from './00-q.js';
import { render, shellDraw } from './03-render.js';

/* Generated from src/13-render-modal.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function renderModal(){
  const host = Q('modalHost');
  /* the modal is the app's when the app says so. Everything below is unchanged
     and still the answer in the single file, and the answer for any modal type
     the app does not draw: the dispatcher and the app are two renderers of the
     same table, and the gate compares them modal type by type. */
  if(host && shellDraw('modal', host)) return;
  if(!UI.modal){ host.innerHTML=''; return; }
  const M = UI.modal;
  if(M.type==='start'){ host.innerHTML = startModal(); return; }
  if(M.type==='profile'){ host.innerHTML = profileModal(); return; }
  if(M.type==='runinfo'){ host.innerHTML = runInfoModal(M.id); return; }
  if(M.type==='advance'){ host.innerHTML = advanceModal(M); return; }
  if(M.type==='event'){
    const ev = M.ev;
    /* An event can go stale while it is still open. The common case is a
       business event: the card is shown, you advance the quarter, and the
       business fails underneath it. Thirteen odds and text closures
       dereference S.biz, so rendering the card now throws and takes the game
       with it. If the event's own condition no longer holds, the event is
       over — dismiss it rather than crash on it. */
    if(ev.cond){
      try{ if(!ev.cond(S)){ UI.modal = null; host.innerHTML = ''; return; } }
      catch(e){ UI.modal = null; host.innerHTML = ''; return; }
    }
    const opts = ev.opts.map(function(o,i){
      let odds;
      try{ odds = (typeof o.odds==='function') ? clamp(o.odds(S),0,1) : o.odds; }
      catch(e){ odds = undefined; }   /* a stale option shows no chance rather than throwing */
      return '<button class="opt" data-a="opt" data-i="'+i+'">'+
        '<div class="ol">'+esc(optLabel(o))+((odds!==undefined && D().showOdds)?'<span class="odds">'+pct(odds,0)+' chance</span>':'')+'</div>'+
        '<div class="od">'+esc(optHint(o))+'</div></button>';
    }).join('');
    const principle = D().coaching ? (ev.principle||PRINCIPLES[ev.id]) : null;
    host.innerHTML = modalHTML(
      '<div class="between"><span class="chip '+(ev.cat==='biz'?'p':ev.cat==='money'?'b':ev.cat==='health'?'r':'')+'">'+(ev.cat||'life')+'</span>'+
      '<span class="tiny muted">'+dateLabel(S.turn)+'</span></div>'+
      '<h2 style="margin-top:8px;font-size:19px">'+esc(evText(ev))+'</h2>',
      /* the moment, as a picture of where it is happening (VISUAL.md, M5) */
      momentHTML(M)+
      '<div style="font-size:14.5px;line-height:1.65">'+esc(evBody(ev))+'</div>'+
      (principle?'<div class="principle"><b>Coaching note.</b> '+esc(principle)+'</div>':'')+
      '<hr class="sep">'+opts,
      '<button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='result'){
    const r = M.res;
    host.innerHTML = modalHTML(
      '<span class="chip '+(r.kind==='good'?'g':r.kind==='bad'?'r':'')+'">'+(r.kind==='good'?'Worked out':r.kind==='bad'?'Cost you':'Noted')+'</span>'+
      '<h2 style="margin-top:8px;font-size:18px">'+esc(optLabel(M.opt))+'</h2>',
      '<div style="font-size:14.5px;line-height:1.6">'+esc(r.text)+'</div>'+
      resultFxHTML(r)+
      (r.principle?'<div class="principle"><b>The principle.</b> '+esc(r.principle)+'</div>':
        (D().coaching?'':'<div class="tutorial">Turn on Apprentice difficulty in Settings to see the underlying principle behind every decision.</div>')),
      '<button class="btn primary" data-a="close">Continue</button>');
    return;
  }
  if(M.type==='pending'){
    /* they arrive at your gate, as a picture, and then in words */
    host.innerHTML = modalHTML('<h2>Consequences arrive</h2>',
      arrivalHTML(M.items)+M.items.map(i=>'<div class="logline" style="border-left-color:'+(i.kind==='good'?'var(--good)':'var(--bad)')+'"><div class="t">'+esc(i.title)+'</div>'+esc(i.text)+'</div>').join(''),
      '<button class="btn primary" data-a="close">Understood</button>');
    return;
  }
  if(M.type==='anotherbiz'){ host.innerHTML = anotherBizModal(); return; }
  if(M.type==='govvote'){
    const g = govVoteModal();
    host.innerHTML = modalHTML(g.head, g.body, g.foot, 'style="max-width:620px"');
    return;
  }
  if(M.type==='govappoint'){
    let body='<div class="tiny muted" style="margin-bottom:9px">Three people a search would put in front of you. None of them are free and all of them will have opinions, which is rather the point.</div>';
    body += M.cands.map(function(d,i){
      const A=archOf(d.arc);
      return '<button class="opt" data-a="pickdir" data-i="'+i+'"><div class="ol">'+esc(d.name)+'<span class="chip b">'+esc(A.label)+'</span></div>'+
        '<div class="od">'+esc(A.blurb)+'. Strongest on <b>'+esc(A.skill)+'</b> ('+Math.round(d.skill[A.skill]||0)+'). Fee '+fmt(d.fee)+' a year. Starts '+
        (d.loyalty>66?'loyal':d.loyalty>45?'neutral':'sceptical')+' and '+(d.patience>60?'patient':'impatient')+'.</div></button>';
    }).join('');
    host.innerHTML = modalHTML('<h2>Fill a board seat</h2>', body, '<button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='govceo'){
    let body='<div class="tiny muted" style="margin-bottom:9px">Handing over the day-to-day buys back your time and costs you the last word. The board votes, and they will have views about which one.</div>';
    body += M.cands.map(function(m,i){
      return '<button class="opt" data-a="pickceo" data-i="'+i+'"><div class="ol">'+esc(m.name)+'<span class="chip b">'+fmt(m.salary)+' / quarter</span></div>'+
        '<div class="od">'+esc(m.style)+'. Capability '+m.skill+'/100.</div></button>';
    }).join('');
    host.innerHTML = modalHTML('<h2>Appoint a managing director</h2>', body, '<button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='govdeed'){
    const b=bizById(M.biz)||S.biz; const dd=deedOf(b);
    const O=[{k:'preEmption',label:'Pre-emption rights',on:'New shares offered to existing holders first.',off:'New shares can be placed with anybody.'},
             {k:'drag',label:'Drag-along',on:'A qualifying majority can force everyone to sell.',off:'Nobody can be dragged into a sale.'},
             {k:'tag',label:'Tag-along',on:'Minorities can join any sale on identical terms.',off:'Minorities can be left behind.'},
             {k:'deadlock',label:'Deadlock mechanism',cyc:true},
             {k:'infoRights',label:'Reporting to holders',cyc:true}];
    let body='<div class="tiny muted" style="margin-bottom:9px">Every one of these cuts both ways, and which way depends entirely on which side of the register you end up on.</div>';
    body += O.map(function(o,i){
      const cur = o.cyc ? String(dd[o.k]) : (dd[o.k] ? o.on : o.off);
      return '<button class="opt" data-a="pickdeed" data-i="'+i+'"><div class="ol">'+esc(o.label)+
        '<span class="chip '+(o.cyc?'b':(dd[o.k]?'g':'r'))+'">'+esc(o.cyc?String(dd[o.k]):(dd[o.k]?'on':'off'))+'</span></div>'+
        '<div class="od">Currently: '+esc(cur)+'</div></button>';
    }).join('');
    host.innerHTML = modalHTML('<h2>Amend the shareholders\u2019 agreement</h2>', body, '<button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='govplan'){
    const b=bizById(M.biz)||S.biz; const p=M.plan;
    const step=function(v){ return Math.max(100000, Math.round(v/120)); };
    const implied=function(){ return Math.round(p.revenue*Math.max(0, (p.gm/100) - (p.opex/Math.max(1,p.revenue)))); };
    let body='<div class="tiny muted" style="margin-bottom:10px">This is the number the board will hold you to every quarter. '+
      'Ambitious plans are approved more readily and forgiven considerably less. '+esc(b.name)+' did '+fmt(bizAccounts(b).revTTM)+' in the last four quarters.</div>';
    body += '<div class="slider"><span>Revenue</span><input type="range" data-inp="planrev" min="0" max="'+Math.round(p.revenue*2.5)+'" step="'+step(p.revenue)+'" value="'+p.revenue+'"><span class="mono" style="text-align:right">'+fmt(p.revenue)+'</span></div>';
    body += '<div class="slider"><span>Gross margin</span><input type="range" data-inp="plangm" min="5" max="90" step="1" value="'+p.gm+'"><span class="mono" style="text-align:right">'+p.gm+'%</span></div>';
    body += '<div class="slider"><span>Operating costs</span><input type="range" data-inp="planopex" min="0" max="'+Math.round(p.revenue*0.6)+'" step="'+step(p.opex)+'" value="'+p.opex+'"><span class="mono" style="text-align:right">'+fmt(p.opex)+'</span></div>';
    body += '<div class="slider"><span>Capital spend</span><input type="range" data-inp="plancapex" min="0" max="'+Math.round(p.revenue*0.35)+'" step="'+step(Math.max(1000000,p.capex))+'" value="'+p.capex+'"><span class="mono" style="text-align:right">'+fmt(p.capex)+'</span></div>';
    body += '<div class="slider"><span>Headcount</span><input type="range" data-inp="planhead" min="0" max="'+Math.max(6,(p.headcount||1)*3)+'" step="1" value="'+(p.headcount||1)+'"><span class="mono" style="text-align:right">'+(p.headcount||1)+'</span></div>';
    body += '<div class="kv"><span><b>Implied EBITDA</b></span><span class="mid">'+fmt(implied())+'</span></div>';
    body += '<div class="tiny muted" style="margin-top:7px">The board votes on this as an ordinary resolution. Once approved, every director’s patience and loyalty moves with your variance against it.</div>';
    host.innerHTML = modalHTML('<h2>Operating plan for '+esc(b.name)+'</h2>', body,
      '<button class="btn primary" data-a="submitplan">Put it to the board</button><button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='govopt'){
    const b=bizById(M.biz)||S.biz;
    let body='<div class="tiny muted" style="margin-bottom:10px">Unallocated pool: '+pct((b.pool||0)/100,1)+'. '+
      'Options vest over four years and dilute every holder, including you, on an exit.</div>';
    if(!(b.staff||[]).length) body += '<div class="tiny muted">There is nobody to grant options to.</div>';
    (b.staff||[]).forEach(function(st){
      const has = st.options ? pct(st.options.pct/100,2)+' already granted' : 'nothing granted';
      body += '<button class="opt" data-a="dogrant" data-s="'+st.id+'" data-p="1"><div class="ol">'+esc(st.name)+
        '<span class="chip b">'+esc(st.role||'staff')+'</span></div><div class="od">'+esc(has)+
        ' · skill '+st.skill+'/10 · morale '+Math.round(st.morale||0)+'. Granting 1% here moves loyalty and morale a long way, and costs you on exit.</div></button>';
    });
    host.innerHTML = modalHTML('<h2>Grant options</h2>', body, '<button class="btn ghost" data-a="close">Not now</button>');
    return;
  }
  if(M.type==='govfin'){
    const t=(S.mkt.targets||[]).find(function(x){ return x.id===M.tid; });
    if(!t){ UI.modal=null; render(); return; }
    const b=bizById(M.bid)||S.biz;
    let body='<div class="tiny muted" style="margin-bottom:9px">'+esc(t.name)+' at '+fmt(M.price)+
      '. Company cash: '+fmt(b.cash||0)+'. Your personal cash: '+fmt(S.fin.cash)+'.</div>';
    body += [['cash','Cash','Straight from the company\u2019s balance sheet. Cleanest, and it empties the thing you need for working capital.'],
             ['debt','Bank facility','65% borrowed at 5.5% a quarter, secured on the target. The bank will want covenants.'],
             ['seller','Seller note','45% left with the vendors at 3.5% a quarter. Cheaper money, and they stay in the business.'],
             ['paper','Paper','Shares in '+esc(b.name)+'. No cash out, and the vendors take a seat, a 1x preference and an opinion.']]
      .map(function(f){ return '<button class="opt" data-a="pickfin" data-f="'+f[0]+'"><div class="ol">'+f[1]+'</div><div class="od">'+f[2]+'</div></button>'; }).join('');
    host.innerHTML = modalHTML('<h2>Funding the bid</h2>', body, '<button class="btn ghost" data-a="close">Abandon the bid</button>');
    return;
  }
  if(M.type==='nego'){
    host.innerHTML = negoModal();
    const box = host.querySelector('.modalbox');
    if(box){
      const wrapEl = document.createElement('div');
      wrapEl.className = 'negoacts';
      wrapEl.innerHTML = negoTacticButtons();
      box.appendChild(wrapEl);
    }
    return;
  }
  if(M.type==='negoResult'){
    const r = M.res, N = S.nego;
    const kind = r.status==='deal' ? 'good' : r.status==='walked' ? 'bad' : 'warn';
    host.innerHTML = modalHTML(
      '<span class="chip '+(kind==='good'?'g':kind==='bad'?'r':'')+'">'+
      (r.status==='deal'?'Agreed':r.status==='walked'?'Broken off':'No agreement')+'</span>'+
      '<h2 style="margin-top:8px;font-size:19px">'+esc(N?N.title:'Negotiation')+'</h2>',
      '<div style="font-size:14.5px;line-height:1.65">'+esc(r.text)+'</div>'+
      (r.gaveTerm?'<div class="tiny muted" style="margin-top:8px">You gave: '+esc(r.gaveTerm)+'</div>':'')+
      (r.status==='deal'&&N?'<div class="principle"><b>The number.</b> '+negFmt(N.kind, r.value)+', against a range of '+negFmt(N.kind,N.low)+' to '+negFmt(N.kind,N.high)+'.</div>':''),
      '<button class="btn primary" data-a="negclose">Continue</button>');
    return;
  }
  if(M.type==='year'){ host.innerHTML = yearModal(); return; }
  if(M.type==='end'){ host.innerHTML = endModal(); return; }
  if(M.type==='endx'){ host.innerHTML = ''; return; }
  if(M.type==='help'){ host.innerHTML = helpModal(); return; }
  if(M.type==='season'){ host.innerHTML = seasonModal(); return; }
  if(M.type==='seasonscan'){
    host.innerHTML = modalHTML('<h2>Scan a season code</h2>',
      '<div class="small muted" style="margin-bottom:10px">Point the camera at the QR code '+
      'whoever started the season is showing you.</div>'+
      '<div id="scanHost" style="width:100%;background:#000;border-radius:10px;overflow:hidden;min-height:220px"></div>'+
      '<div class="tiny muted" style="margin-top:8px">Nothing is sent anywhere. The code is read '+
      'on your device and filled into the join box.</div>',
      '<button class="btn ghost" data-a="seasonscancancel">Cancel</button>');
    return;
  }
  if(M.type==='settings'){ host.innerHTML = settingsModal(); return; }
  if(M.type==='partner'){
    /* One modal, two different transactions, and it has to say which it is.

       mode 'start': you are founding a company WITH this person. Shake hands
         asks what you are putting in and starts the business.
       mode 'join':  the company already exists and this person is buying into
         it. Shake hands gives them shares in what you have.

       They wore the same heading and the same button for a long time, which
       is why one of them could be quietly dead without anyone noticing. */
    const starting = M.mode !== 'join';
    host.innerHTML = modalHTML('<h2>' + (starting ? 'Start with a partner' : 'Partnership offers') + '</h2>',
      M.offers.map(function(o,i){
        return '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">'+
          '<div class="between"><b>'+esc(o.name)+'</b><span class="chip p">'+o.equity+'% for '+fmt(o.capital)+'</span></div>'+
          '<div class="tiny muted" style="margin:5px 0">'+o.bg+'. Brings <b>'+o.skill+'</b>. '+o.ask+'.</div>'+
          '<div class="tiny muted">Starting trust: '+o.trust+'/100. You can buy them out later, at a premium that rises as trust falls.</div>'+
          '<div class="row wrap" style="gap:6px;margin-top:8px">'+
          (starting
            ? '<button class="btn sm primary" data-a="acceptpartner" data-i="'+i+'">Shake hands</button>'
            : '<button class="btn sm primary" data-a="takepartner" data-i="'+o.id+'">Shake hands</button>'+
              '<button class="btn sm ghost" data-a="declineoffer" data-i="'+o.id+'">Not now</button>')+
          '</div>'+
          '</div>';
      }).join(''),
      '<button class="btn ghost" data-a="close">'+(starting?'No thanks':'Not interested')+'</button>');
    return;
  }
  if(M.type==='amount'){
    host.innerHTML = modalHTML('<h2>'+esc(M.title)+'</h2>',
      '<div class="small muted" style="margin-bottom:10px">'+M.note+'</div>'+
      '<input type="text" class="mono" id="amtBox" value="'+M.def+'" style="font-size:16px">'+
      '<div class="tiny muted" style="margin-top:6px">You can write 500k, 2m, 1.5bn.</div>',
      '<button class="btn primary" data-a="okamount">Confirm</button><button class="btn ghost" data-a="close">Cancel</button>');
    setTimeout(function(){ const el=/** @type {HTMLInputElement} */ (Q('amtBox')); if(el){ el.focus(); el.select(); } }, 30);
    return;
  }
  if(M.type==='confirm'){
    host.innerHTML = modalHTML('<h2>'+esc(M.title)+'</h2>','<div class="small">'+M.text+'</div>',
      '<button class="btn bad" data-a="okconfirm">'+esc(M.okLabel||'Confirm')+'</button><button class="btn ghost" data-a="close">Cancel</button>');
    return;
  }
  if(M.type==='message'){
    host.innerHTML = modalHTML('<h2>'+esc(M.title)+'</h2>','<div class="small">'+M.text+'</div>',
      '<button class="btn primary" data-a="close">Close</button>');
    return;
  }
  host.innerHTML = '';
}
export function seasonCanScan(){
  try{ return typeof window !== 'undefined' && 'BarcodeDetector' in window; }catch(e){ return false; }
}
export function copyText(str){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(str);
      return true;
    }
  }catch(e){}
  try{
    const ta = document.createElement('textarea');
    ta.value = str; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){ return false; }
}