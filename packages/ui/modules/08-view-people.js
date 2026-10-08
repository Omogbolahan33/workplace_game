
import { BIZ, FAVOURS, NEXT_DEST, ROLES, S, agendaItems, bar, esc, fmt, nextBtn, relationWord, statRow, subLabel } from '@ledger/core';

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
  h += '<div class="card"><h3>The cast <span class="tag">means &amp; standing 0\u2013100</span></h3>';
  h += cast.map(function(c){
    const R_ = ROLES[c.role] || {label:c.role, blurb:''};
    const rel = relationWord(c.relation);
    const relCol = c.relation>=70?'var(--good)':c.relation>=40?'var(--acc)':c.relation>=15?'var(--warn)':'var(--bad)';
    const last = c.memory && c.memory.length ? c.memory[0] : null;
    const dead = !c.alive;
    return '<div class="mrow"'+(dead?';opacity:.62':'')+'>'+
      '<div class="between"><div><b>'+esc(c.name)+'</b> <span class="tiny muted">· '+esc(R_.label)+' · '+c.age+(dead?' · deceased':'')+'</span></div>'+
      '<span class="chip" style="background:'+relCol+'22;color:'+relCol+'">'+esc(rel)+' '+Math.round(c.relation)+'</span></div>'+
      '<div style="margin:5px 0 4px">'+bar(c.relation+100, 200, relCol)+'</div>'+
      '<div class="row wrap" style="gap:4px">'+
        c.traits.map(function(t){ return '<span class="chip">'+esc(t)+'</span>'; }).join('')+
        '<span class="chip">means '+Math.round(c.wealth)+'</span>'+
        '<span class="chip">standing '+Math.round(c.status)+'</span>'+
      '</div>'+
      (last? '<div class="tiny muted" style="margin-top:5px;font-style:italic">Remembers: '+esc(last.note)+' <span class="muted">('+esc(last.d)+')</span></div>':'')+
      (dead? '' :
        '<div class="row wrap" style="margin-top:8px">'+
        (FAVOURS[c.role]? '<button class="btn xs" data-a="favour" data-c="'+c.id+'">'+esc(FAVOURS[c.role].ask)+'</button>':'')+
        '<button class="btn xs" data-a="give" data-c="'+c.id+'">Send money</button>'+
        '<button class="btn xs" data-a="cutoff" data-c="'+c.id+'">Let it lapse</button>'+
        '</div>')+
      '</div>';
  }).join('');
  /* the sentence that opened this card, at the foot of it, one tap away */
  h += '<details class="fold"><summary>Why they remember</summary><div>'+
    'These people get older, richer, poorer and dead whether you are paying attention or not. '+
    'What they remember is what you did.</div></details>';
  h += '</div></div><div>';
  h += '<div class="card"><h3>Household &amp; family</h3>'+
    statRow('Family harmony', S.p.family)+
    statRow('Happiness', S.p.happy)+
    statRow('Health', S.p.health)+
    statRow('Stress (lower is better)', 100-S.p.stress)+
    '<hr class="sep">'+
    '<div class="tiny muted">'+esc((S.p.married?'Married to '+(S.p.spouseName||'your spouse'):(S.p.kids>0?'Not married, with children':'Not married'))+
    (S.p.kids>0? ' · '+S.p.kids+' child'+(S.p.kids===1?'':'ren'):''))+'</div>'+
    '<div class="row wrap" style="margin-top:9px">'+
    '<button class="btn xs" data-a="spend" data-k="family">Help family ('+fmt(Math.round(150000*S.cumInfl))+')</button>'+
    '<button class="btn xs" data-a="spend" data-k="health">Private care ('+fmt(Math.round(220000*S.cumInfl))+')</button>'+
    '<button class="btn xs" data-a="spend" data-k="social">Be seen ('+fmt(Math.round(120000*S.cumInfl))+')</button>'+
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
  const order = {bad:0, warn:1};
  items.sort(function(a,b){ return (order[a.lv]||2)-(order[b.lv]||2); });
  let h = '<div class="card" style="border-left:3px solid '+(items[0].lv==='bad'?'var(--bad)':'var(--warn)')+'"><h3>Waiting on you</h3>';
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