

/* ------------------------------- Ledger ------------------------------- */
/* ------------------------- shared chrome for the new views ---------------- */
/* The era, as a header chip (§22.14).

   This was eraBanner(): a card at the top of Overview, People, Deals and the
   money screen, each carrying the same line of explanation. Four screens is
   not twenty-three, but it is the same mistake - and it had a worse one
   inside it. It counted down with

       const left = (S.era.until || 0) - S.turn;

   and the era object has no `until`; initEra() and stepEra() both write
   `end`. So `left` was always negative and the card always read "turning".
   The countdown never worked, and nobody could tell, because a card that is
   on four screens anyway is not a card you read closely on any of them.

   The chip shows the tone, the name (where there is room) and the count. The
   headline, what the era does to the economy, and the one line of explanation
   live behind the hover/tap. */
/*@table:ERA_TONE@*/
function eraLeft(){ return Math.max(0, ((S.era && S.era.end) || 0) - S.turn); }
/* What the era is doing to the economy, in the order it bites. */
function eraFxLine(e){
  const f = (e && e.fx) || {}, out = [];
  if(f.infl)   out.push('inflation ' + (f.infl > 0 ? '+' : '') + (f.infl * 100).toFixed(1) + '%');
  if(f.demand) out.push('demand ' + (f.demand > 0 ? '+' : '') + Math.round(f.demand * 100) + '%');
  if(f.sent)   out.push('confidence ' + (f.sent > 0 ? '+' : '') + f.sent);
  if(f.ret)    out.push('returns ' + (f.ret > 0 ? '+' : '') + (f.ret * 100).toFixed(1) + '%');
  if(f.shock && f.shock !== 1) out.push('shocks \u00d7' + f.shock);
  if(f.reg && f.reg !== 1)     out.push('paperwork \u00d7' + f.reg);
  return out.join(' \u00b7 ');
}
function eraChipHTML(){
  if(!S.era) return '';
  const e = eraById(S.era.id);
  if(!e) return '';
  const tone = ERA_TONE[e.tone] || 'var(--acc)';
  const left = eraLeft();
  const fx = eraFxLine(e);
  return '<div class="erachip'+(UI.eraOpen?' open':'')+'" data-a="eratoggle" '+
      'title="'+esc(e.name)+'">'+
    '<i style="background:'+tone+'"></i>'+
    '<span class="eraname">'+esc(e.name)+' \u00b7 </span>'+
    '<b style="color:'+tone+'">'+left+'</b>q'+
    '<div class="erapop">'+
      '<b>'+esc(e.name)+'</b> <span class="chip">'+left+' quarter'+(left===1?'':'s')+' left</span>'+
      '<div class="tiny muted" style="margin-top:6px">'+esc(e.head)+'</div>'+
      (fx ? '<div class="erafx">'+esc(fx)+'</div>'
          : '<div class="erafx">Nothing out of the ordinary.</div>')+
      '<div class="tiny muted" style="margin-top:6px">Runs to '+dateLabel(S.era.end)+'. '+
      'Eras change what works: what made money last year may not this year.</div>'+
    '</div></div>';
}
function threadStrip(){
  const ts = (S.threads||[]).filter(function(t){ return ARCS[t.arc]; });
  if(!ts.length) return '';
  /* An arc's name is its title; its stages are the functions that write the
     next beat, so they have no title or text to show and must not be called
     here. This read st.title || A.name off a function and an arc that has no
     name, and every open story showed as a blank line. Now: who it is with, as
     their face (which opens their card), the arc's title, and how far along. */
  return '<div class="card"><h3>Open stories</h3>'+ts.map(function(t){
    const A = ARCS[t.arc], n = A.stages.length, at = Math.min(n, (t.stage||0) + 1);
    const c = t.castId ? castOf(t.castId) : null;
    return '<div class="story">'+
      (c ? '<button class="facebtn" data-a="hot" data-k="person" data-c="'+esc(c.id)+'" aria-label="'+esc(c.name+', '+A.title)+'">'+castFaceHTML(c)+'</button>' : '')+
      '<div class="storyb"><div class="between"><b>'+esc(A.title)+'</b>'+
      '<span class="tiny muted">'+(t.next>S.turn ? 'next beat in '+(t.next-S.turn)+'q' : 'waiting on you')+'</span></div>'+
      '<div class="tiny muted">'+(c ? 'with '+esc(c.name)+' \u00b7 ' : '')+'part '+at+' of '+n+'</div>'+
      '<span class="gfx storydots">'+A.stages.map(function(_, i){ return '<i class="'+(i < at ? 'on' : '')+'"></i>'; }).join('')+'</span></div></div>';
  }).join('')+foldHTML('About these', 'These continue whether you engage with them or not.')+'</div>';
}

/* ---------------------------------- People --------------------------------- */
/*@table:FAVOURS@*/