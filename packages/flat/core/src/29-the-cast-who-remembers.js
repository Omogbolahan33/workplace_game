

/* =========================================================================
   Section 18: The cast — people who remember what you did
   ========================================================================= */
/*@table:ROLES@*/
/*@table:CAST_TRAITS@*/
/*@table:ROLE_POOL@*/
function genCastMember(role, ageOffset){
  return {
    id:'c'+(++S.seq), name:R.pick(FIRST)+' '+R.pick(LAST), role:role,
    age: clamp(S.p.age + (ageOffset!==undefined?ageOffset:R.int(-5,9)), 14, 90),
    relation: R.int(40, 82), wealth: R.int(5, 70), status: R.int(15, 70),
    alive:true, traits:R.pickN(CAST_TRAITS, 2), memory:[], lastAct:-99,
    city: S.city, tags:{}
  };
}
function buildCast(){
  const chosen = [];
  const pool = ROLE_POOL.slice();
  // always: friend, sibling, cousin, elder. Then fill from the pool.
  ['friend','sibling','cousin','elder'].forEach(function(r){
    if(r==='love' && S.p.married) return;
    chosen.push(genCastMember(r));
  });
  let n = 4;
  while(chosen.length < 8 && pool.length){
    const pickd = R.weighted(pool, x=>x[1]);
    if(!pickd) break;
    pool.splice(pool.indexOf(pickd), 1);
    if(pickd[0]==='love' && S.p.married) continue;
    if(pickd[0]==='supplier' && !S.biz) continue;
    chosen.push(genCastMember(pickd[0]));
  }
  return chosen;
}
function castOf(id){ return (S.cast||[]).find(function(c){ return c.id===id; }) || null; }
function castByRole(r){ return (S.cast||[]).filter(function(c){ return c.role===r && c.alive; }); }
function relate(c, delta, note){
  if(!c) return;
  c.relation = clamp(c.relation + delta, -100, 100);
  c.memory.unshift({turn:S.turn, d:dateLabel(S.turn), note:note, delta:delta});
  if(c.memory.length>8) c.memory.pop();
}
function relationWord(v){
  if(v>=85) return 'devoted'; if(v>=65) return 'warm'; if(v>=45) return 'cordial';
  if(v>=25) return 'cool';    if(v>=5)  return 'strained'; if(v>=-20) return 'cold';
  return 'hostile';
}
function castOneLiner(c){
  const t = c.traits.join(', ');
  const mem = c.memory.length ? c.memory[0].note : null;
  return '<b>'+esc(c.name)+'</b> <span class="tiny muted">'+ROLES[c.role].label+' · '+c.age+' · '+relationWord(c.relation)+'</span>'+
    '<div class="tiny muted">'+t+(mem?' · last: '+esc(mem):'')+'</div>';
}
/* People drift. Fortunes change. Some of them die. */
function stepCast(){
  const events = [];
  (S.cast||[]).forEach(function(c){
    if(!c.alive) return;
    c.age = S.p.age + (c.age - S.p.age);   // they age with you, roughly
    if(S.turn % 4 === 0) c.age += 1;
    // slow drift in their own fortunes
    c.wealth = clamp(c.wealth + R.gauss(c.traits.indexOf('ambitious')>=0?1.1:0.4, 3.2) + (S.mkt.gdp-0.03)*60, 0, 100);
    c.status = clamp(c.status + R.gauss(0.3, 2.0) + (c.wealth-50)/90, 0, 100);
    // relationships decay if you never see anyone
    if(S.turn - c.lastAct > 12){ c.relation = clamp(c.relation - R.range(0.4, 1.8), -100, 100); }
    // mortality, late in the run
    if(c.age > 62 && R.chance(0.012 + Math.max(0,(c.age-70))*0.010)){
      c.alive = false;
      const note = c.name+' died. '+(c.relation>70?'You had meant to call.':'You had not spoken in a while.');
      log('life', note, 'bad'); relate(c, 0, 'died');
      events.push({kind:'death', c:c, text:note});
      if(c.role==='sibling' && S.p.parents>0){ S.p.family = clamp(S.p.family-6,0,100); }
      return;
    }
    // life milestones
    if(R.chance(0.030) && S.turn - c.lastAct > 5){
      const opts = [];
      if(!c.tags.married && c.age>24 && c.age<55) opts.push('married');
      if(c.wealth>72 && !c.tags.broke) opts.push('made it');
      if(c.wealth<12 && !c.tags.broke) opts.push('broke');
      if(c.role==='friend' && !c.tags.abroad && c.age<45) opts.push('emigrated');
      if(opts.length){
        const what = R.pick(opts);
        c.tags[what==='made it'?'madeIt':what] = true;
        c.lastAct = S.turn;
        const lines = {
          'married': c.name+' got married. There is an aso-ebi and you are expected to have opinions about it.',
          'made it': c.name+' has done very well for themselves. You are happy for them. You are also doing arithmetic.',
          'broke':   c.name+' has run out of money and is telling people a version of the story that does not include the reason.',
          'emigrated': c.name+' emigrated. The group chat will never recover.'
        };
        log('life', lines[what], what==='broke'?'bad':'neutral');
        events.push({kind:what, c:c, text:lines[what]});
      }
    }
  });
  return events;
}
/* Which cast member is most likely to walk through the door right now? */
function pickInstigator(){
  const pool = (S.cast||[]).filter(function(c){
    return c.alive && (S.turn - c.lastAct) > 3 && !(S.threads||[]).some(function(t){ return t.castId===c.id; });
  });
  if(!pool.length) return null;
  return R.weighted(pool, function(c){
    return 1 + c.relation/60 + (S.turn - c.lastAct)/14;
  });
}