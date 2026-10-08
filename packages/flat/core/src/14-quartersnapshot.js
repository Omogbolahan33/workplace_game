
function quarterSnapshot(){
  const b = S.biz;
  return { turn:S.turn, cash:Math.round(S.fin.cash||0), nw:Math.round(netWorth()||0),
    rev: b?Math.round(b.revenue||0):null, profit: b?Math.round(b.profit||0):null,
    staff: b?(b.staff||[]).length:null, outlets: b?(b.locations||0):null };
}
function advanceRows(a,b){
  const rows=[];
  function add(k,label,from,to,always){
    if(from===null||from===undefined||to===null||to===undefined) return;
    if(!always && Math.round(from)===Math.round(to)) return;
    rows.push({key:k,label:label,from:Math.round(from),to:Math.round(to)});
  }
  add('cash','Cash',a.cash,b.cash,true);
  add('nw','Net worth',a.nw,b.nw,true);
  add('rev','Revenue',a.rev,b.rev,false);
  add('profit','Profit',a.profit,b.profit,false);
  add('staff','Headcount',a.staff,b.staff,false);
  add('outlets','Outlets',a.outlets,b.outlets,false);
  return rows.slice(0,5);
}
function advanceLine(a,b){
  const dn=(b.nw||0)-(a.nw||0);
  const d=S.digest||[];
  const last=d.length?d[d.length-1]:null;
  let s;
  if(Math.abs(dn)>Math.max(500000,Math.abs(a.nw||0)*0.05)){
    s = dn>0 ? 'Net worth moved sharply up this quarter. Enjoy it; the game has a long memory.'
             : 'Net worth fell hard this quarter. Nothing here is fatal yet, but the arithmetic is not sentimental.';
  } else if(last&&last.text){ s = last.text; }
  else { s = 'The quarter closed. Rent was paid, salaries were paid, and the market did what markets do.'; }
  return s.length>180 ? s.slice(0,177)+'\u2026' : s;
}
function advanceModal(M){
  const a=M.before||{}, b=M.after||{};
  let rows='';
  (M.rows||[]).forEach(function(r){
    rows += '<div class="avrow"><span class="avlbl">'+esc(r.label)+'</span>'+
      '<span class="avfrom mono">'+fmt(r.from)+'</span>'+
      '<span class="avarrow">\u2192</span>'+
      '<span class="avto mono" id="av_'+r.key+'">'+fmt(r.from)+'</span></div>';
  });
  const body =
    '<div class="tiny muted">'+esc(dateLabel(a.turn))+' &nbsp;\u2192&nbsp; '+
      '<b class="acc">'+esc(dateLabel(b.turn))+'</b></div>'+
    '<div class="avbar"><i id="avBar" style="width:0%"></i></div>'+
    (rows || '<div class="tiny muted">Nothing of substance moved this quarter.</div>')+
    '<div class="avline"><span id="avLine"></span><span class="caret"></span></div>';
  return modalHTML('<h2>Closing the quarter</h2>', body,
    '<button class="btn ghost" data-a="skipanim">Skip \u25b8</button>'+
    '<button class="btn sm" data-a="animtoggle">'+(UI.animFast?'Slower':'Faster')+'</button>',
    'style="max-width:520px"');
}
function tabDot(id){
  if(id==='work' && S.biz && (S.biz.profit<0 || S.biz.cash<0)) return '<span class="dot"></span>';
  if(id==='money' && (S.deals||[]).length>2) return '<span class="dot"></span>';
  if(id==='governance' && govDot()) return '<span class="dot"></span>';
  return '';
}
function sparkline(){
  const h = S.hist.slice(-40);
  if(h.length<2) return '<div class="tiny muted" style="padding:16px 0">The chart fills in as you play.</div>';
  const vals = h.map(x=>x.nw);
  let mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
  if(mx===mn){ mx = mn*1.2+1000; }
  const W=300, H=54;
  const pts = vals.map((v,i)=>{
    const x = (i/(vals.length-1))*W;
    const y = H - ((v-mn)/(mx-mn))*(H-6) - 3;
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  const up = vals[vals.length-1] >= vals[0];
  const col = up ? '#2fd47a' : '#ff5f6d';
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+
    '<defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">'+
    '<stop offset="0%" stop-color="'+col+'" stop-opacity=".28"/><stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="url(#gg)"/>'+
    '<polyline points="'+pts+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linejoin="round"/></svg>'+
    '<div class="tiny muted">'+fmt(mn)+' → '+fmt(mx)+' over '+h.length+' quarters</div>';
}
function statRow(label, val, color){
  return '<div class="statline"><span class="lbl">'+label+'</span>'+bar(val,100,color)+'<span class="val">'+Math.round(val)+'</span></div>';
}

/* ------------------------------- Money ------------------------------- */
function parseAmt(str){
  if(!str) return 0;
  str = String(str).toLowerCase().replace(/[,₦$£\s]/g,'');
  let mult = 1;
  if(/tr$/.test(str)){ mult=1e12; str=str.replace(/tr$/,''); }
  else if(/bn$/.test(str)){ mult=1e9; str=str.replace(/bn$/,''); }
  else if(/m$/.test(str)){ mult=1e6; str=str.replace(/m$/,''); }
  else if(/k$/.test(str)){ mult=1e3; str=str.replace(/k$/,''); }
  const n = parseFloat(str);
  return isNaN(n)?0:Math.round(n*mult);
}
/*@table:BUDGET_KEYS@*/