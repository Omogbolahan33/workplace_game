
function runInfoModal(id){
  const r = (ensureProfile().runs||[]).find(function(x){ return x.id===id; });
  if(!r) return modalHTML('<h2>Run not found</h2>',
    '<div class="small muted">That run is no longer in your record.</div>',
    '<button class="btn" data-a="close">Close</button>');
  const tone = r.reason==='retire' ? 'g' : r.reason==='bankrupt' ? 'r' : 'y';
  const lbl  = r.reason==='retire' ? 'Retired' : r.reason==='bankrupt' ? 'Bankrupt' : 'Health';
  let b = '';
  b += '<div class="kv"><span class="muted">Ended</span><span>'+esc(String(r.ended||'').replace('T',' ').slice(0,16))+'</span></div>';
  b += '<div class="kv"><span class="muted">How it ended</span><span class="chip '+tone+'">'+lbl+'</span></div>';
  b += '<div class="kv"><span class="muted">Tier</span><span>'+esc((DIFFS[r.difficulty]||{}).name||r.difficulty)+'</span></div>';
  b += '<div class="kv"><span class="muted">Started as</span><span>'+esc(r.profile||'—')+'</span></div>';
  b += '<div class="kv"><span class="muted">Length</span><span>'+r.years+' years (to age '+r.age+')</span></div>';
  b += '<hr class="sep">';
  b += '<div class="kv"><span class="muted">Net worth (real)</span><span><b>'+fmt(r.nwReal||0)+'</b></span></div>';
  b += '<div class="kv"><span class="muted">Net worth (nominal)</span><span>'+fmt(r.nw||0)+'</span></div>';
  b += '<div class="kv"><span class="muted">Freedom index</span><span>'+r.freedom+'</span></div>';
  b += '<div class="kv"><span class="muted">Rating for this run</span><span>'+(r.quality===undefined?'—':r.quality)+'</span></div>';
  b += '<div class="kv"><span class="muted">Life at the end</span><span>health '+r.health+' · stress '+r.stress+' · family '+r.family+'</span></div>';
  b += '<div class="kv"><span class="muted">Built</span><span>'+(r.companies||0)+' compan'+(r.companies===1?'y':'ies')+
       ' · '+(r.staff||0)+' staff · '+(r.household||0)+' household</span></div>';
  if(r.dec) b += '<div class="kv"><span class="muted">Decisions</span><span>'+(r.dec.total||0)+
    ' &nbsp;<span class="good">'+(r.dec.good||0)+' good</span> · <span class="bad">'+(r.dec.bad||0)+' costly</span></span></div>';
  if(r.tune) b += '<div class="tiny muted" style="margin-top:7px">Played under adaptive tuning: shocks &times;'+
    r.tune.shock+', failure &times;'+r.tune.fail+', from a rating of '+r.tune.skill+'.</div>';
  if((r.best||[]).length){
    b += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Calls that paid</div>'+
      r.best.map(function(x){ return '<div class="logline" style="border-left-color:var(--good)"><div class="t">'+
        esc(x.d||'')+'</div><b>'+esc(x.t||'')+'</b><br>'+esc(x.c||'')+'</div>'; }).join('');
  }
  if((r.worst||[]).length){
    b += '<div class="tiny muted" style="margin:12px 0 6px">Calls that cost</div>'+
      r.worst.map(function(x){ return '<div class="logline" style="border-left-color:var(--bad)"><div class="t">'+
        esc(x.d||'')+'</div><b>'+esc(x.t||'')+'</b><br>'+esc(x.c||'')+'</div>'; }).join('');
  }
  if((r.marks||[]).length){
    b += '<div class="tiny muted" style="margin:12px 0 6px">From the log</div>'+
      r.marks.map(function(m){ return '<div class="logline" style="border-left-color:var(--'+
        (m.k==='good'?'good':'bad')+')">'+esc(m.t||'')+'</div>'; }).join('');
  }
  return modalHTML(
    '<div class="between"><span class="chip '+tone+'">'+esc(r.rank||'Run')+'</span>'+
    '<span class="tiny muted">'+esc(String(r.ended||'').slice(0,10))+'</span></div>'+
    '<h2 style="font-size:19px;margin-top:8px">'+esc(r.name||'A life')+'</h2>'+
    '<div class="small muted" style="margin-top:4px">'+esc(r.epitaph||'')+'</div>',
    b, '<button class="btn" data-a="close">Close</button>', 'style="max-width:600px"');
}
