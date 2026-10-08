

/* =========================================================================
   Section 21b: Negotiation
   A reusable bargaining engine. Salary, contracts, rent, supplier terms,
   severance, sale price and partnership equity all run through it.
   ========================================================================= */
/*@table:NEG_TACTICS@*/
/*@table:NEG_TERM_POOL@*/
function M_get(o){ return o; }
function negFmt(kind, v){
  if(kind==='pct'||kind==='equity') return Math.round(v)+'%';
  if(kind==='days') return Math.round(v)+' days';
  if(kind==='months') return Math.round(v)+' months';
  return fmt(Math.round(v));
}
function startNego(cfg){
  const m = cfg.metric;
  S.nego = {
    id:'ng'+(++S.seq), kind:cfg.kind||'money', title:cfg.title, other:cfg.other||'Them',
    blurb:cfg.blurb||'', ctxLabel:cfg.ctxLabel||'',
    low:m.low, high:m.high,           // low = best for you, high = best for them
    yourPos:m.you, theirPos:m.them,
    start:{you:m.you, them:m.them},
    leverage:clamp((cfg.leverage===undefined?50:cfg.leverage) * (0.80 + (S.negRep===undefined?55:S.negRep)/225), 0, 100),
    patience:cfg.patience||3, round:1, maxRounds:cfg.maxRounds||3,
    gw:50, usedLever:false,
    terms:(cfg.terms||R.pickN(NEG_TERM_POOL,3)).map(function(t){ return {id:t.id,label:t.label,note:t.note,given:false}; }),
    onDeal:cfg.onDeal||null, onWalk:cfg.onWalk||null, onImpasse:cfg.onImpasse||null,
    log:[]
  };
  UI.modal = {type:'nego'};
  render();
  return S.nego;
}
function negSkillBonus(t){
  if(!t.skill) return 1;
  const k = S.p.skills[t.skill] || 30;
  return 0.72 + k/145;      // 0.93 at skill 30, 1.41 at skill 100
}
function negResolveTactic(tid, termId){
  const N = S.nego; if(!N) return null;
  const T = NEG_TACTICS.find(function(x){ return x.id===tid; }); if(!T) return null;
  const range = Math.max(1, N.high - N.low);
  const out = {status:'open', text:'', value:null};

  if(T.walk){
    out.status = 'walked';
    out.text = 'You stood up and left it on the table. Some negotiations are won by the person who is willing to end them.';
    return negFinish(out);
  }
  if(T.usesLever && N.usedLever){ out.status='open'; out.text='You have already spent that.'; return out; }
  if(T.usesTerm){
    const tm = N.terms.find(function(x){ return x.id===termId && !x.given; });
    if(!tm){ out.status='open'; out.text='Pick which term you are offering.'; out.needTerm = true; return out; }
    tm.given = true; out.gaveTerm = tm.label;
  }
  if(T.usesLever){ N.usedLever = true; N.leverage = Math.max(0, N.leverage - 45); }

  const gap = Math.max(0, N.theirPos - N.yourPos);
  const skl = negSkillBonus(T);
  const deadline = 1 + (N.round/N.maxRounds)*0.45;         // the clock does half the work
  const levF = 0.62 + N.leverage/130;
  const gwF  = 0.82 + N.gw/300;

  const yourMove = gap * T.move * (1 - 0.28*(N.leverage/100));
  const theirMove= gap * T.push * skl * levF * gwF * deadline;
  N.yourPos  = clamp(N.yourPos + yourMove, N.low, N.high);
  N.theirPos = clamp(N.theirPos - theirMove, N.low, N.high);
  N.gw = clamp(N.gw + (T.gw||0), 0, 100);

  const gap2 = Math.max(0, N.theirPos - N.yourPos);
  N.log.push({round:N.round, tactic:T.label, you:N.yourPos, them:N.theirPos});

  // did they break?
  const brk = (T.risk||0) * (1 - N.leverage/230) * (1 + (N.theirPos-N.low)/range*0.5);
  if(R.chance(brk)){
    out.status='walked';
    out.text = R.pick([
      'They pushed their chair back. "I do not think we are going to get there." And then they did not.',
      'The other side decided they had better options, and they may well have been right.',
      'It ended. Not badly, but it ended, and you are no closer than you were this morning.'
    ]);
    return negFinish(out);
  }
  // settled?
  if(gap2 <= range*0.02 || N.yourPos >= N.theirPos){
    const settle = clamp((N.yourPos + Math.max(N.yourPos, N.theirPos - gap2*0.4))/2, N.low, N.high);
    out.status='deal'; out.value = settle;
    out.text = 'Done. '+negFmt(N.kind, settle)+'. '+negQuality(settle, N);
    return negFinish(out);
  }
  N.round++;
  if(N.round > N.maxRounds){
    const p = 0.30 + N.leverage/210 + N.gw/320;
    if(R.chance(p)){
      const settle = clamp(N.yourPos + gap2*0.45, N.low, N.high);
      out.status='deal'; out.value=settle;
      out.text='They took a breath and said yes. '+negFmt(N.kind, settle)+'. '+negQuality(settle, N);
    } else {
      out.status='impasse';
      out.text='You ran out of rounds with the gap still open. Nobody agreed to anything.';
    }
    return negFinish(out);
  }
  out.status='open';
  out.text = negBeatText(N, T, out.gaveTerm);
  return out;
}
function negQuality(v, N){
  const range = Math.max(1, N.high - N.low);
  const q = 1 - (v - N.low)/range;      // 1 = you got your best case
  if(q>0.78) return 'That is close to the best version of this outcome.';
  if(q>0.55) return 'A good result. Not the best available, but genuinely good.';
  if(q>0.32) return 'You met in the middle, which is what most negotiations actually are.';
  if(q>0.14) return 'You gave more than you wanted to.';
  return 'You were negotiated. It happens to everyone, and it is worth working out why.';
}
function negBeatText(N, T, gave){
  const range = Math.max(1, N.high - N.low);
  const gap = N.theirPos - N.yourPos;
  const lines = [];
  if(gave) lines.push('You put '+gave+' on the table.');
  if(T.id==='anchor') lines.push('You named your number and let it sit there. It changed the room.');
  if(T.id==='reason') lines.push('You walked them through the arithmetic properly.');
  if(T.id==='concede') lines.push('You moved, and they saw you move.');
  if(T.id==='hold') lines.push('You said nothing for longer than was comfortable.');
  if(T.id==='lever') lines.push('You reminded them, in specific terms, what it costs them if this does not happen.');
  lines.push('They are now at '+negFmt(N.kind, N.theirPos)+' and you are at '+negFmt(N.kind, N.yourPos)+
    ' — a gap of '+negFmt(N.kind, Math.max(0,gap))+', '+(gap<range*0.18?'which is nearly closed.':'which is still real.'));
  return lines.join(' ');
}
function negFinish(out){
  const N = S.nego; if(!N) return out;
  const termsGiven = N.terms.filter(function(t){ return t.given; }).map(function(t){ return t.id; });
  // how you conduct yourself gets around
  if(S.negRep===undefined) S.negRep = 55;
  const hardRounds = (N.log||[]).filter(function(x){ return x.tactic==='Anchor hard' || x.tactic==='Use your leverage'; }).length;
  let dr = 0;
  if(out.status==='deal'){
    const range = Math.max(1, N.high - N.low);
    const gave = 1 - (out.value - N.low)/range;
    dr += gave > 0.45 ? 2.5 : (gave < 0.12 ? -3.5 : 0.5);
    dr += termsGiven.length * 1.8;
  }
  if(out.status==='walked') dr -= 4;
  if(out.status==='impasse') dr -= 1.5;
  dr -= hardRounds * 1.4;
  S.negRep = clamp(S.negRep + dr, 0, 100);
  // a callback may reference a company or person that ceased to exist mid-negotiation
  try{
    if(out.status==='deal' && N.onDeal) N.onDeal(out.value, termsGiven);
    if(out.status==='walked' && N.onWalk) N.onWalk(termsGiven);
    if(out.status==='impasse' && N.onImpasse) N.onImpasse(termsGiven);
  }catch(err){ console.warn('negotiation callback failed', err); }
  UI.modal = {type:'negoResult', res:out};
  render();
  return out;
}
function negCloseModal(){
  S.nego = null; UI.modal = null; render();
}
function negoModal(){
  const N = S.nego; if(!N) return '';
  const range = Math.max(1, N.high - N.low);
  const yp = ((N.yourPos-N.low)/range)*100, tp = ((N.theirPos-N.low)/range)*100;
  const mid = (( (N.yourPos+N.theirPos)/2 - N.low)/range)*100;
  let body = '';
  body += '<div class="between" style="margin-bottom:8px"><span class="chip">'+esc(N.ctxLabel||'Negotiation')+'</span>'+
    '<span class="tiny muted">Round '+N.round+' of '+N.maxRounds+' · vs '+esc(N.other)+'</span></div>';
  if(N.blurb) body += '<div style="font-size:14.5px;line-height:1.6;margin-bottom:10px">'+esc(N.blurb)+'</div>';
  if(UI.modal && UI.modal.beat) body += '<div class="principle" style="margin-top:2px">'+esc(UI.modal.beat)+'</div>';
  // the zone
  body += '<div style="margin:12px 0 6px"><div class="between"><span class="tiny muted">Your best case</span>'+
    '<span class="tiny muted">Their best case</span></div>'+
    '<div style="position:relative;height:26px;background:linear-gradient(90deg,rgba(47,212,122,.28),rgba(255,95,109,.28));border-radius:6px;border:1px solid var(--line)">'+
    '<div style="position:absolute;left:'+clamp(yp,0,100).toFixed(1)+'%;top:-3px;width:3px;height:32px;background:var(--good);border-radius:2px"></div>'+
    '<div style="position:absolute;left:'+clamp(tp,0,100).toFixed(1)+'%;top:-3px;width:3px;height:32px;background:var(--bad);border-radius:2px"></div>'+
    '</div>'+
    '<div class="between" style="margin-top:4px"><span class="mono good">'+negFmt(N.kind,N.yourPos)+'</span>'+
    '<span class="tiny muted">gap '+negFmt(N.kind,Math.max(0,N.theirPos-N.yourPos))+'</span>'+
    '<span class="mono bad">'+negFmt(N.kind,N.theirPos)+'</span></div></div>';
  body += '<div class="row wrap" style="margin:8px 0 10px;gap:6px">'+
    '<span class="chip '+(N.leverage>60?'g':N.leverage<30?'r':'')+'">Your leverage '+Math.round(N.leverage)+'</span>'+
    '<span class="chip">Goodwill '+Math.round(N.gw)+'</span>'+
    '<span class="chip '+(S.negRep>68?'g':S.negRep<34?'r':'')+'" title="How you are known as someone to deal with. Hardball tactics get you better terms today and worse leverage for years.">'+
    (S.negRep>75?'Feared':S.negRep>58?'Respected':S.negRep>40?'Fair':S.negRep>22?'Difficult':'Notorious')+'</span>'+
    (N.usedLever?'<span class="chip r">Leverage spent</span>':'')+'</div>';
  const avail = N.terms.filter(function(t){ return !t.given; });
  if(avail.length){
    body += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Terms you can trade (choose one when you pick "Trade a term")</div>'+
      '<div class="row wrap" style="gap:5px;margin-bottom:4px">'+
      avail.map(function(t){ return '<span class="chip" title="'+esc(t.note)+'">'+esc(t.label)+'</span>'; }).join('')+
      '</div>';
  } else {
    body += '<hr class="sep"><div class="tiny muted">You have nothing left to trade except money.</div>';
  }
  return modalHTML('<h2>'+esc(N.title)+'</h2>', body, '');
}
function negoTacticButtons(){
  const N = S.nego; if(!N) return '';
  const tactics = NEG_TACTICS.map(function(T){
    if(T.usesTerm){
      const avail = N.terms.filter(function(t){ return !t.given; });
      if(!avail.length) return '';
      return avail.slice(0,3).map(function(t){
        return '<button class="opt" data-a="negtactic" data-t="'+T.id+'" data-m="'+t.id+'">'+
          '<div class="ol">'+esc(T.label)+': '+esc(t.label)+'</div>'+
          '<div class="od">'+esc(t.note)+'</div></button>';
      }).join('');
    }
    if(T.usesLever && N.usedLever) return '';
    return '<button class="opt" data-a="negtactic" data-t="'+T.id+'">'+
      '<div class="ol">'+esc(T.label)+'</div><div class="od">'+esc(T.hint)+'</div></button>';
  }).join('');
  /* Not every deal needs negotiating. Sometimes the number on the table is fine. */
  return tactics + '<button class="opt" data-a="negoaccept" style="border-color:var(--warn)">'+
    '<div class="ol">Accept their terms — '+negFmt(N.kind, Math.round(N.theirPos))+'</div>'+
    '<div class="od">Stop negotiating and take what is on the table. Costs you nothing except the difference.</div></button>';
}