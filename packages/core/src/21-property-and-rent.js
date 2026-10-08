
function estateLine(){
  const v = netWorth();
  return v<=0 ? 'Nothing yet, and some debts.' : 'About '+fmt(v)+', most of it illiquid.';
}
function willLine(){
  if(S.flags && S.flags.will) return 'In place. It is not contested yet.';
  return 'There is no will. Under the law that applies here, that is itself a decision, and not usually the one you would make.';
}
function inheritanceNote(){
  if(!(S.p.kids>0)) return 'With no children, the question of who inherits is one your family will answer for you.';
  if(S.flags && S.flags.trust) return 'A family trust is in place. It survives a bad year, which is the entire point.';
  return 'Without a will or a trust, a genuine estate becomes a family dispute with lawyers on both sides. This is the single most common way African wealth is destroyed in one generation.';
}

/* ------------------------------- Annual review ------------------------------ */
function yearModal(){
  const h4 = S.hist.slice(-4);
  const first = h4.length ? h4[0].nw : 0;
  const last = netWorth();
  const delta = last - first;
  const e = eraById(S.era && S.era.id);
  const yr = Math.floor(S.turn/4);
  const dig = (S.digest||[]).filter(function(d){ return S.turn - d.turn < 5; });
  const a = ambitionOf();
  const pctv = ambitionPct();
  const tone = delta>=0 ? 'var(--good)' : 'var(--bad)';
  let body = '';
  body += '<div class="between" style="margin-bottom:10px"><span class="chip">Year '+(yr)+' review</span>'+
    '<span class="tiny muted">'+dateLabel(S.turn)+' · age '+S.p.age+'</span></div>';
  body += '<div style="font-size:28px;font-weight:800;letter-spacing:-.5px;color:'+tone+'">'+(delta>=0?'+':'\u2212')+fmt(Math.abs(delta))+'</div>'+
    '<div class="tiny muted" style="margin-bottom:12px">Net worth moved this year, to '+fmt(last)+'. '+
    (S.cumInfl>1.3 ? 'In money from the day you started, that is '+fmt(last/Math.max(1,S.cumInfl))+'.' : '')+'</div>';
  body += '<div class="grid g2" style="gap:9px;margin-bottom:12px">'+
    '<div style="border:1px solid var(--line);border-radius:9px;padding:9px"><div class="tiny muted">Freedom</div><b style="font-size:17px">'+freedomIndex()+'</b></div>'+
    '<div style="border:1px solid var(--line);border-radius:9px;padding:9px"><div class="tiny muted">Health</div><b style="font-size:17px">'+S.p.health+'</b></div>'+
    '<div style="border:1px solid var(--line);border-radius:9px;padding:9px"><div class="tiny muted">Family</div><b style="font-size:17px">'+S.p.family+'</b></div>'+
    '<div style="border:1px solid var(--line);border-radius:9px;padding:9px"><div class="tiny muted">Reputation</div><b style="font-size:17px">'+S.p.rep+'</b></div>'+
    '</div>';
  if(e) body += '<div class="logline" style="border-left-color:var(--info)"><div class="t">The times</div><b>'+esc(e.name)+'.</b> '+esc(e.head)+'</div>';
  if(a) body += '<div class="logline" style="border-left-color:var(--acc)"><div class="t">'+esc(a.name)+'</div>'+
    bar(pctv,100,'var(--acc)')+'<div class="tiny muted" style="margin-top:5px">'+pctv+'% of the way there.</div></div>';
  const notable = dig.slice(0, 7);
  body += (notable.length ? '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px">The year in brief</div>'+
    notable.map(function(d){
      const c = d.tone==='good'?'var(--good)':d.tone==='bad'?'var(--bad)':'var(--line)';
      return '<div class="logline" style="border-left-color:'+c+'"><div class="t">'+dateLabel(d.turn)+' · '+d.kind+'</div>'+esc(d.text)+'</div>';
    }).join('') : '<hr class="sep"><div class="tiny muted">A quiet year. Those happen, and they are not wasted — they are just less interesting to read about.</div>');
  body += '<div class="principle" style="margin-top:12px">'+esc(yearClosing(delta, pctv))+'</div>';
  return modalHTML('<h2>'+(yr)+' year'+(yr===1?'':'s')+' in</h2>', body,
    '<button class="btn primary" data-a="close">On to the next one</button>');
}
function yearClosing(delta, pctv){
  const up = delta > 0;
  if(S.p.age >= 60) return 'You are closer to the end of this than the beginning. The remaining question is not how much more, it is what survives you.';
  if(up && pctv>=70) return 'This is what a good year looks like from outside. From inside it mostly felt like Tuesdays.';
  if(up) return 'Forward is forward. The compounding is invisible for about fifteen years and then it is the only thing you can see.';
  if(!up && S.der.debt>0) return 'The debt is the story now. Everything else is a subplot until that changes.';
  return 'A bad year is information, not a verdict. Most of the people you admire had several of these in a row.';
}
/* Settings: the wording that asks to be quoted in a report. */
function buildStamp(){
  const b = buildStampInfo(); if (!b) return '';
  return '<div class="tiny muted" style="margin-top:5px">Build <b class="mono">' + b.hash +
    '</b> &middot; ' + b.chars.toLocaleString() + ' chars of code. ' +
    'Quote it with any bug report - if it differs from mine, you are running an older copy.</div>';
}
/* The opening screen, too. Settings is the right place to look for a stamp and
   it is also the last place anyone thinks to look. Somebody holding three
   copies of this file in a Downloads folder cannot tell them apart until they
   have already started playing, so the first screen says which one it is. */
function buildStampStart(){
  const b = buildStampInfo(); if (!b) return '';
  return '<div class="tiny muted" style="text-align:center;margin-top:14px;opacity:.6">' +
    'build <span class="mono">' + b.hash + '</span></div>';
}