

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
/* Who someone is to look at, from who they are: the same hue and skin the
   world's figure of them wears, so the face on the People screen is the person
   walking in the city. Read from the id, so it never changes and is never
   random. */
function castLook(c){
  let h = 0; for(let j = 0; j < c.id.length; j++) h = (h * 31 + c.id.charCodeAt(j)) >>> 0;
  /* ids are c1, c2, c3...: a plain string hash of those differs by one, which
     dressed the whole cast in one colour, so the bits are mixed first */
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h = Math.imul(h ^ (h >>> 12), 0x297a2d39); h = (h ^ (h >>> 15)) >>> 0;
  return {hue: h % 360, skin: ['#6b4a32','#5a3b27','#7d573b','#4a3020'][(h >>> 9) % 4], hair: (h >>> 13) % 5,
    shirt: 'hsl('+(h % 360)+',50%,'+(c.tags && c.tags.broke ? 42 : 58)+'%)'};
}
const CAST_ROLE_ICO = {friend:'hands', sibling:'home', cousin:'spark', mentor:'cap', contact:'seal', love:'heart',
  banker:'bank', supplier:'truck', elder:'scroll', rival:'swords'};
/* A face, drawn: the relation ring around it filling from hostile to devoted,
   their mood on their mouth, grey hair with age, a tie when money has found
   them, and their role as a badge. The figure is the same one the world draws,
   so the screen and the city agree about who this is. */
function castFaceHTML(c){
  const L = castLook(c), r = c.relation, col = r>=70?'var(--good)':r>=40?'var(--acc)':r>=15?'var(--warn)':'var(--bad)';
  const ink = '#1a1410', hair = c.age >= 58 ? '#c9c3b5' : ink, C = 2 * Math.PI * 29;
  const frac = Math.max(0.02, Math.min(1, (r + 100) / 200));
  const hairs = [
    '<path d="M23 25c0-7 4-10.5 9-10.5s9 3.5 9 10.5c-2-3-5-4.5-9-4.5s-7 1.5-9 4.5z" fill="'+hair+'"/>',
    '<circle cx="32" cy="21" r="11.5" fill="'+hair+'"/>',
    '',
    '<circle cx="32" cy="13" r="4.2" fill="'+hair+'"/><path d="M23 24c0-6 4-9.5 9-9.5s9 3.5 9 9.5c-2-2.5-5-3.5-9-3.5s-7 1-9 3.5z" fill="'+hair+'"/>',
    '<path d="M21.5 25c-1-8 4-13 10.5-13s11.5 5 10.5 13c-3-3-6.5-4-10.5-4s-7.5 1-10.5 4z" fill="'+L.shirt+'" stroke="'+ink+'" stroke-width=".6"/>'];
  const mouth = r >= 65 ? 'M28.5 31.5Q32 35 35.5 31.5' : r >= 25 ? 'M29 32.5Q32 34 35 32.5' : r >= -20 ? 'M29 33H35' : 'M28.5 34Q32 30.5 35.5 34';
  const last = c.memory && c.memory[0] && S.turn - c.memory[0].turn <= 1 ? c.memory[0] : null;
  const story = (S.threads||[]).some(function(t){ return t.castId === c.id; });
  const label = c.name+', '+relationWord(r)+' '+Math.round(r);
  return '<div class="gfx cface'+(c.alive ? '' : ' gone')+'" role="img" aria-label="'+esc(label)+'" title="'+esc(label)+'">'+
    '<svg viewBox="0 0 64 64" aria-hidden="true">'+
      '<defs><clipPath id="cf-'+c.id+'"><circle cx="32" cy="32" r="25"/></clipPath></defs>'+
      '<circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.2"/>'+
      '<circle cx="32" cy="32" r="29" fill="none" stroke="'+col+'" stroke-width="3.2" stroke-linecap="round" '+
        'stroke-dasharray="'+(C * frac).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 32 32)"/>'+
      '<circle cx="32" cy="32" r="25" fill="#141b26"/>'+
      '<g clip-path="url(#cf-'+c.id+')">'+
        (L.hair === 1 ? hairs[1] : '')+
        '<path d="M12 62c1-12 9-18 20-18s19 6 20 18z" fill="'+L.shirt+'"/>'+
        '<path d="M28 44h8l-4 5z" fill="'+L.skin+'"/>'+
        (c.tags && c.tags.madeIt || c.role === 'banker' ? '<path d="M31 48.5h2l1.2 9-2.2 2.5-2.2-2.5z" fill="#f5b301"/>' : '')+
        '<rect x="29" y="35" width="6" height="9" rx="2" fill="'+L.skin+'"/>'+
        '<ellipse cx="32" cy="27" rx="9" ry="10.5" fill="'+L.skin+'"/>'+
        (L.hair === 1 ? '' : hairs[L.hair])+
        '<circle cx="28.6" cy="27" r="1.15" fill="'+ink+'"/><circle cx="35.4" cy="27" r="1.15" fill="'+ink+'"/>'+
        (r < -20 ? '<path d="M26.5 23.5l3.5 1.4M37.5 23.5l-3.5 1.4" stroke="'+ink+'" stroke-width="1.1" stroke-linecap="round"/>' : '')+
        '<path d="'+mouth+'" fill="none" stroke="'+ink+'" stroke-width="1.3" stroke-linecap="round"/>'+
      '</g></svg>'+
    '<span class="cbadge">'+worldIco(CAST_ROLE_ICO[c.role] || 'people')+'</span>'+
    (last && last.delta ? '<span class="cfelt '+(last.delta > 0 ? 'up' : 'down')+'">'+worldIco(last.delta > 0 ? 'up' : 'down')+'</span>' : '')+
    (story && c.alive ? '<span class="cstory">'+worldIco('chat')+'</span>' : '')+
  '</div>';
}
/* A person on the People screen: their face, who they are, how they are doing
   as two meters, their traits, the last thing they remember, and what you can
   do for or to them. Both renderers draw the cast from this one tile. */
function castTileHTML(c){
  const R_ = ROLES[c.role] || {label:c.role, blurb:''}, r = c.relation;
  const col = r>=70?'var(--good)':r>=40?'var(--acc)':r>=15?'var(--warn)':'var(--bad)';
  const last = c.memory && c.memory.length ? c.memory[0] : null;
  const meter = function(ico, label, v){
    return '<div class="bmeter" title="'+label+' '+Math.round(v)+'"><span class="gfx bmi" aria-hidden="true">'+worldIco(ico)+'</span>'+
      '<span class="gfx bmb" role="img" aria-label="'+label+' '+Math.round(v)+'"><i style="width:'+Math.round(Math.max(4, Math.min(100, v)))+'%;background:var(--info)"></i></span></div>';
  };
  return '<div class="ctile'+(c.alive ? '' : ' gone')+'">'+
    castFaceHTML(c)+
    '<div class="cname"><b>'+esc(c.name)+'</b><span class="tiny muted">'+esc(R_.label)+' · '+c.age+(c.alive ? '' : ' · deceased')+'</span></div>'+
    '<span class="chip crel" style="background:'+col+'22;color:'+col+'">'+esc(relationWord(r))+' '+Math.round(r)+'</span>'+
    '<div class="bmeters">'+meter('coins', 'means', c.wealth)+meter('medal', 'standing', c.status)+'</div>'+
    '<div class="row wrap prose" style="gap:4px">'+c.traits.map(function(t){ return '<span class="chip">'+esc(t)+'</span>'; }).join('')+'</div>'+
    (last ? '<div class="cmem tiny" title="'+esc(last.d)+'">'+
      '<span class="gfx cmi'+(last.delta > 0 ? ' up' : last.delta < 0 ? ' down' : '')+'" aria-hidden="true">'+worldIco('chat')+'</span>'+
      '<span><i>'+esc(last.note)+'</i> <span class="muted prose">('+esc(last.d)+')</span></span></div>' : '')+
    /* the favour is what you are asking, so it keeps its words; sending money
       and letting it lapse are a picture and a word, named in full for a
       screen reader */
    (c.alive ? '<div class="cacts">'+
      (FAVOURS[c.role] ? '<button class="btn xs cask" data-a="favour" data-c="'+c.id+'"><span class="gfx" aria-hidden="true">'+worldIco('hands')+'</span>'+esc(FAVOURS[c.role].ask)+'</button>' : '')+
      '<div class="cpair">'+
      '<button class="btn xs" data-a="give" data-c="'+c.id+'" aria-label="Send money" title="Send money"><span class="gfx" aria-hidden="true">'+worldIco('note')+'</span>Send</button>'+
      '<button class="btn xs" data-a="cutoff" data-c="'+c.id+'" aria-label="Let it lapse" title="Let it lapse"><span class="gfx" aria-hidden="true">'+worldIco('door')+'</span>Lapse</button>'+
      '</div></div>' : '')+
  '</div>';
}
/* How home is, as four rings: the household's health in the HUD's own ring
   pictures. Stress is drawn as calm, so a full ring is good on all four. */
function lifeRingsHTML(){
  const p = S.p;
  return ringsHTML([{ico:'home', label:'Family', v:p.family}, {ico:'smile', label:'Happiness', v:p.happy},
    {ico:'heart', label:'Health', v:p.health}, {ico:'bolt', label:'Calm', v:100 - p.stress, note:'Stress '+Math.round(p.stress)}]);
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