
import { BIZ, NEXT_DEST, S, agendaItems, agendaRank, agendaSorted, agendaTilesHTML, castStripHTML, castTileHTML, esc, householdButtonsHTML, lifeRingsHTML, nextBtn, sceneFirst, statRow, subLabel } from '@ledger/core';

/* Generated from src/08-view-people.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewPeople(){
  const cast = (S.cast||[]).slice().sort(function(a,b){ return (b.alive?1:0)-(a.alive?1:0) || b.relation-a.relation; });
  let h = '';
  h += '<div class="grid g2"><div>';
  /* ── Legacy › People, redesigned (the redesign's phase 4) ─────────────────
     Measured first: 1,817 characters in the way and 24 controls, most of it one
     line per person —

         generous, careless · means 16.778310123996636/100 · standing 22.88567320808015/100

     — which is ninety-odd characters carrying two facts, and two of them printed
     as **raw floats**, because the value is a fraction of 100 and nothing ever
     rounded it. Nobody reads 16.778310123996636. The line is four chips now
     (two traits, means, standing, all whole numbers) on the same reading, the
     scale stated once in the heading instead of eighteen times in the rows, and
     each person is a hairline row rather than a box. The screen's own sentence
     about mortality moved into a fold at the foot of the card, where the people
     it is about are.

     Nothing was removed: the relation chip and its bar, the traits, the memory
     line, and every action stay, and `textaudit --check` fails if one loses its
     button. */
  /* world-first: the cast is a strip of faces, each opening the card the
     picture opens; with the explanations shown, the full tiles come back */
  if(sceneFirst()) h += castStripHTML(cast);
  else {
    h += '<div class="card"><h3>The cast</h3>';
    /* each person is a face now - castTileHTML(), the tile the app draws too:
       the relation ring around them, their mood on their face, means and standing
       as meters, and the same traits, memory and actions as before */
    h += '<div class="ctiles">'+cast.map(function(c){ return castTileHTML(c); }).join('')+'</div>';
    /* the sentence that opened this card, at the foot of it, one tap away */
    h += '<details class="fold"><summary>Why they remember</summary><div>'+
      'These people get older, richer, poorer and dead whether you are paying attention or not. '+
      'What they remember is what you did.</div></details></div>';
  }
  h += '</div><div>';
  h += '<div class="card"><h3>Household &amp; family</h3>'+
    lifeRingsHTML()+
    '<hr class="sep">'+
    '<div class="tiny muted">'+esc((S.p.married?'Married to '+(S.p.spouseName||'your spouse'):(S.p.kids>0?'Not married, with children':'Not married'))+
    (S.p.kids>0? ' · '+S.p.kids+' child'+(S.p.kids===1?'':'ren'):''))+'</div>'+
    '<div class="row wrap" style="margin-top:9px">'+
    householdButtonsHTML()+
    '</div></div>';
  h += '<div class="card" style="margin-top:12px"><h3>Your rival</h3>';
  if(S.rival){
    const rv = S.rival;
    h += '<div class="between"><b>'+esc(rv.name)+'</b><span class="chip '+(rv.relation>=40?'g':'r')+'">'+(rv.relation>=60?'Warm':rv.relation>=20?'Wary':'Hostile')+'</span></div>'+
      '<div class="tiny muted" style="margin:6px 0">'+esc((BIZ.find(function(b){return b.id===rv.type;})||{name:rv.type}).name)+' · size '+Math.round(rv.size)+'/140 · aggression '+Math.round(rv.aggro)+'/100</div>'+
      statRow('Their scale', rv.size)+
      statRow('How much they like you', rv.relation+100, rv.relation>=0?'var(--good)':'var(--bad)')+
      '<div class="tiny muted" style="margin-top:7px">'+(rv.moves? 'They have moved on you '+rv.moves+' time'+(rv.moves===1?'':'s')+'.' : 'So far they have left you alone.')+'</div>';
  } else h += '<div class="tiny muted">Nobody is competing with you yet.</div>';
  h += '</div>';
  h += '</div></div>';
  return h;
}
export function viewAgenda(){
  const items = agendaItems();
  if(!items.length) return '';
  /* fires first: agendaRank(), because order[lv]||2 read a fire's 0 as falsy */
  items.sort(function(a,b){ return agendaRank(a.lv)-agendaRank(b.lv); });
  let h = '<div class="card" style="border-left:3px solid '+(items[0].lv==='bad'?'var(--bad)':'var(--warn)')+'"><h3>Waiting on you</h3>';
  /* world-first: each is a tile - what it is, whether it is a fire, who it is
     about - and the sentence and the button are on its card */
  if(sceneFirst()) return h + '<div class="facerow">'+agendaTilesHTML(agendaSorted())+'</div></div>';
  items.slice(0,8).forEach(function(it){
    const c = it.lv==='bad'?'var(--bad)':'var(--warn)';
    const d = NEXT_DEST[it.kind] || { tab:'work', sub:'business', focus:'' };
    h += '<div style="border-left:2px solid '+c+';padding:3px 0 3px 9px;margin-bottom:8px" class="small">'+esc(it.text)+
      '<div class="tiny muted" style="margin:2px 0 4px">'+esc(subLabel(d.tab, d.sub))+'</div>'+
      nextBtn({ act:it.act||'', id:it.id||'', biz:it.biz||'',
                tab:d.tab, sub:d.sub, focus:d.focus||'' }, false)+'</div>';
  });
  h += '</div>';
  return h;
}