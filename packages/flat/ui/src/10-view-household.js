
/* Every trait and its meaning, once. These sentences were on the screen up to
   five times over — once per person and once per candidate — which is the
   opposite of what "say a thing once" asks for. They are also the sentences that
   tell you what a hire does to your house, so they are one tap away, not gone. */
function traitsGlossaryHTML(){
  return foldHTML('What the traits mean', TRAITS.map(function(t){
    return '<div style="margin-bottom:6px"><b>'+esc(t.name)+'</b> \u2014 '+esc(t.d)+'</div>';
  }).join(''));
}
function viewHousehold(){
  const list = S.house||[];
  if(!S.houseCands) refreshHouseCands();
  const cands = S.houseCands||[];
  let h = '';

  /* ---------------- the roster ---------------- */
  h += '<div class="card"><h3>Your household <span class="tag">'+
    (list.length ? list.length+(list.length===1?' person':' people')+' · '+fmt(houseMonthly())+'/mo' : 'nobody yet')+
    '</span></h3>';
  if(!list.length){
    /* ── Work > Household, redesigned (the redesign's phase 6) ───────────────
       Measured first: 1,605 characters in the way for eight controls, and the
       two longest blocks on the screen were both pure teaching — 160 and 287
       characters — sitting exactly where a player decides whether to hire
       anybody at all. Then the candidates: four of them, each repeating the
       boilerplate "Going rate for this work is about ₦N/mo." and each spelling
       out its trait in full, so the same eight sentences about traits appeared
       up to five times on one screen.

       What it is now: the decision leads, the teaching is one tap away, and a
       fact is stated once. The trait meanings are a single glossary, the going
       rate is a chip instead of a sentence, and the two lectures are two folds.
       Nothing is deleted — the audit reports the total, and what it loses here
       is duplication, which is what the "say a thing once" move is for. */
    h += foldHTML('Why hire anybody, and where to start',
      'Nobody works for you personally. Every hour the house takes is an hour you are not spending on the thing that '+
      'makes you money, and you are spending them anyway. '+
      'Start with a housekeeper or a cook. Add a nanny when there are children and a driver when traffic costs you '+
      'more than the driver does. Later, once there is something worth running: a personal assistant, a chief of '+
      'staff, an accountant who works for you rather than for a company you own.');
  } else {
    const boost = houseTimeBoost();
    h += '<div class="statline"><span class="lbl">Attention free</span>'+bar(ownerTimeEff()*100,130,'var(--good)')+
      '<span class="val">'+Math.round(ownerTimeEff()*100)+'%</span></div>';
    if(boost>0.005){
      h += '<div class="tiny muted" style="margin-bottom:8px">Your household hands you back <b>'+pct(boost,0)+
        '</b> of your working attention — '+Math.round(ownerTime()*100)+'% to '+Math.round(ownerTimeEff()*100)+
        '%. That, and not the money, is what you are actually buying.</div>';
    }
    h += housePayrollSummary();
    h += '<hr class="sep">';
    /* world-first: each of them is a face; the face opens their card, which
       has everything the row below has. (i) brings the rows back. */
    if(sceneFirst()) h += '<div class="facerow">'+houseFacesHTML(list)+'</div><div class="tiny muted prose">Tap anyone, here or at home in the picture, for their pay, their terms and what you can do.</div>';
    else list.forEach(function(st){
      const R0 = HOUSE_ROLES[st.role] || HOUSE_ROLES.cleaner;
      const tr = TRAITS.find(function(x){ return x.id===st.trait; })||{name:'',d:''};
      const fair = houseSalaryFor(st.role, st.skill);
      h += '<div style="border:1px solid var(--line);border-radius:9px;padding:10px;margin-bottom:9px">';
      h += '<div class="between"><b>'+esc(st.name)+'</b><span class="row wrap" style="gap:4px;justify-content:flex-end">'+
        '<span class="chip '+((st.perf===undefined?60:st.perf)>=70?'g':(st.perf===undefined?60:st.perf)<40?'r':'')+'">'+esc(R0.label)+'</span>'+
        (tr.name?'<span class="chip">'+esc(tr.name)+'</span>':'')+'</span></div>';
      h += '<div class="tiny muted" style="margin-bottom:6px">Skill '+st.skill+'/10'+
        (st.trained?' (+'+st.trained+' trained)':'')+' · '+fmt(st.salary)+'/mo'+
        ((st.salary||0) < fair*0.9 ? ' <span class="bad">below the going rate</span>' : '')+
        ' · '+(st.quarters||0)+' quarters with you</div>';
      h += statRow('Morale',  st.morale===undefined?60:st.morale, (st.morale||0)>60?'var(--good)':(st.morale||0)>35?'var(--warn)':'var(--bad)');
      h += statRow('Loyalty', st.loyalty===undefined?50:st.loyalty, (st.loyalty||0)>60?'var(--good)':(st.loyalty||0)>35?'var(--warn)':'var(--bad)');
      h += statRow('Output',  st.perf===undefined?60:st.perf, 'var(--acc)');
      /* who they are, who pays, their terms and the four - core's, the card has the same */
      h += houseControlsHTML(st);
      h += '</div>';
    });
  }
  h += '</div>';

  /* ---------------- people looking for work ---------------- */
  h += '<div class="card" style="margin-top:12px"><h3>People looking for work <span class="tag">'+cands.length+' this quarter</span></h3>';
  if(!cands.length){
    h += '<div class="small muted">Nobody is available right now. Check again next quarter.</div>';
  } else {
    cands.forEach(function(c){
      const R0 = HOUSE_ROLES[c.role]; if(!R0) return;
      const tr = TRAITS.find(function(x){ return x.id===c.trait; })||{name:'',d:''};
      const fair = houseSalaryFor(c.role, c.skill);
      h += '<div style="border:1px solid var(--line);border-radius:9px;padding:10px;margin-bottom:8px">'+
        '<div class="between"><b>'+esc(c.name)+'</b><span class="row wrap" style="gap:4px;justify-content:flex-end">'+
          '<span class="chip '+(c.skill>=8?'g':c.skill<=3?'r':'')+'">'+esc(R0.label)+' · skill '+c.skill+'/10</span>'+
          '<span class="chip">going rate '+fmt(fair)+'/mo</span>'+
          (tr.name?'<span class="chip">'+esc(tr.name)+'</span>':'')+'</span></div>'+
        (c.ref?'<div class="tiny muted" style="margin:4px 0 6px">via '+esc(c.ref||'')+'</div>':'')+
        '<div class="row wrap" style="gap:5px">'+
          '<button class="btn sm primary" data-a="housenego" data-i="'+c.id+'">Make an offer</button>'+
          '<button class="btn sm" data-a="houseask" data-i="'+c.id+'">Take at '+fmt(c.ask||c.salary)+'/mo</button>'+
        '</div>'+
        '<div class="tiny muted" style="margin-top:6px">Paid by: '+
          '<select data-hpayerc="'+c.id+'" style="font-size:11px;padding:2px">'+
          '<option value="you"'+((c.payer||'you')==='you'?' selected':'')+'>You</option>'+
          bizList().map(function(b){ return '<option value="'+b.id+'"'+(c.payer===b.id?' selected':'')+'>'+esc(b.name)+'</option>'; }).join('')+
          '</select></div>'+
        '</div>';
    });
    h += foldHTML('How offers work',
      'You can take them at what they are asking and be done with it, or make an offer and argue. Arguing is free and '+
      'usually wins you something. It also spends goodwill with someone who is about to be in your house, and deciding '+
      'not to spend it is a perfectly good decision.')+traitsGlossaryHTML();
  }
  h += '</div>';
  return h;
}

/* ------------------------- the career record ------------------------------ */
/* The season board. Shows the finish line, the six axes this season is scored
   on, where you stand right now, and everybody else who has finished. Your own
   row is highlighted, and during a run your score is shown live — it is a
   projection of the run as it stands today, not a promise. */
function viewSeason(){
  const s = S.season;
  if(!s){
    return '<div class="card"><h3>Season <span class="tag">not in one</span></h3>'+
      '<div class="small" style="line-height:1.7">This run has no finish line. It ends when it ends — '+
      'retirement at 65, collapse, or turn 168.<br><br>'+
      'A season is the alternative: an end date fixed before you begin, a shared seed, '+
      'and a score out of 1000 that lets several people play the same run and be compared. '+
      'You set one from the start screen when you begin your next run.</div></div>';
  }
  /* seasonStatus() answers null before a season exists, and this screen is only
     on the route a season is on; the fallback keeps the read honest */
  const st = seasonStatus() || /** @type {{left:number, total:number, done:number, end:any, hardStop:boolean}} */ ({});
  const sc = scoreRun();
  const live = !S.gameOver;
  const code = s.code;
  seasonRefreshLeaderboard(code);
  const rows = S._lb || [];
  const online = cloudReady();

  let h = '<div class="card"><h3>'+esc(s.name||'Season')+' <span class="tag">'+esc(code)+'</span></h3>';
  h += '<div class="grid g3" style="margin-top:8px">'+
    bigStat('Ends', 'Q'+st.end.q+' '+st.end.year, (st.total||0)+' quarters in all')+
    bigStat('Left', st.left+'', live ? 'quarters to the finish line' : 'the run is over',
            (st.left!==undefined && st.left<=4) ? 'warn' : '')+
    bigStat('Your score', sc.total+'', 'out of 1000')+
    '</div>';
  h += '<div class="tiny muted" style="margin-top:8px">World <b>'+esc(s.seed ? seedName(s.seed) : 'random')+
    '</b> &middot; hard stop at the finish line'+
    ' &middot; conditions pinned, so everybody in this season faces the same world however much they have played'+
    (s.organiser ? ' &middot; you created this season' : '')+'. '+
    (live ? 'The score below is where this run stands <b>right now</b>, not where it will finish.'
          : 'The run is finished. This is the score that was submitted.')+'</div>';
  h += '</div>';

  h += '<div class="card"><h3>Scored on six axes <span class="tag">'+esc(sc.rank)+'</span></h3>'+
    '<div class="tiny muted" style="margin-bottom:9px">'+
    'A season is not scored on net worth alone. You can get rich by running a business into the ground, '+
    'and a leaderboard that rewards that is a leaderboard nobody should believe.</div>';
  h += SEASON_AXES.map(function(ax){
    const v = sc.axes[ax.id] || 0;
    return '<div style="margin-bottom:9px"><div class="between">'+
      '<span class="tiny"><b>'+ax.label+'</b> <span class="muted">'+ax.weight+'%</span></span>'+
      '<span class="mono tiny">'+v.toFixed(0)+'<span class="muted">/100</span></span></div>'+
      bar(v, 100, 'var(--acc)')+
      '<div class="tiny muted" style="margin-top:2px">'+esc(ax.why)+'</div></div>';
  }).join('');
  h += '</div>';

  /* The board. Sorted server-side by total; your own row is marked. */
  h += '<div class="card"><h3>The board <span class="tag">'+
    (rows.length ? rows.length+' entr'+(rows.length===1?'y':'ies') : 'empty')+'</span></h3>';
  if(!online){
    h += '<div class="tiny muted">You are not signed in, so this board cannot be read. '+
      'The season itself plays fine offline — your score is submitted automatically '+
      'at the end if you sign in before then.</div>';
  } else if(!rows.length){
    h += '<div class="tiny muted">Nobody has posted a score yet. Finish the season and yours will appear here.</div>';
  } else {
    h += '<table class="tbl"><thead><tr><th>#</th><th>Player</th><th>Score</th><th>Rank</th></tr></thead><tbody>'+
      rows.map(function(r, i){
        const mine = r.player === (S.name||'Anonymous') && Math.abs((r.total||0) - (S._submitted===code ? sc.total : -1)) === 0;
        const sco = (r.score||{});
        return '<tr'+(mine?' style="background:rgba(255,255,255,.04)"':'')+'>'+
          '<td class="mono">'+(i+1)+'</td>'+
          '<td>'+esc(r.player||'—')+(mine?' <span class="chip g">you</span>':'')+'</td>'+
          '<td class="mono"><b>'+(r.total||0)+'</b></td>'+
          '<td class="tiny muted">'+esc(sco.rank||'—')+'</td></tr>';
      }).join('')+'</tbody></table>';
    h += '<div class="tiny muted" style="margin-top:7px">Scores are written once, at the end of each run, '+
      'and each player holds one place on the board.</div>';
  }
  h += '</div>';
  return h;
}
function viewCareerRecord(){
  const ps = profileSummary();
  const pr = ensureProfile();
  const runs = (pr.runs||[]).slice().reverse();
  let h = profileHeadHTML(pr, ps);
  h += '<div class="card"><h3>Your record <span class="tag">'+ps.n+' run'+(ps.n===1?'':'s')+
    (ps.n ? ' · '+Math.round(ps.years)+' years played' : '')+'</span></h3>';
  const sk = ps.skill;
  h += '<div class="statline"><span class="lbl">Experience</span>'+
    bar(sk===null?45:sk, 100, sk===null?'var(--dim)':sk>60?'var(--bad)':sk>46?'var(--warn)':'var(--good)')+
    '<span class="val">'+(sk===null?'—':Math.round(sk))+'</span></div>';
  h += '<div class="between" style="margin-bottom:5px"><b>'+esc(ps.band.label)+'</b>'+
    '<span class="chip '+(ps.band.tone==='bad'?'r':ps.band.tone==='warn'?'y':ps.band.tone==='good'?'g':'')+'">'+
    (pr.handle ? esc(pr.handle) : 'no handle set')+'</span></div>';
  h += '<div class="tiny muted" style="margin-bottom:8px">'+esc(ps.band.note)+'</div>';
  if(S && S.tune){
    const t = S.tune;
    h += '<div class="principle" style="margin-bottom:9px"><b>This run — '+challengeLabel(t)+'.</b> '+
      'Shocks &times;'+t.shock.toFixed(2)+' · failure &times;'+t.fail.toFixed(2)+
      ' · inflation &times;'+t.infl.toFixed(2)+' · pay &times;'+t.pay.toFixed(2)+
      ' · talent market &times;'+(t.talent||1).toFixed(2)+' · official heat &times;'+(t.heat||1).toFixed(2)+
      ' — on top of '+esc((DIFFS[t.tier]||{}).name||t.tier)+' (challenge index '+t.ci+'). '+
      (t.skill===null ? 'You have no record yet, so nothing is being adjusted.'
                      : 'Set from a rating of '+t.skill+' across '+(pr.runs||[]).length+' recorded run'+((pr.runs||[]).length===1?'':'s')+'. '+
                        'Beat it and this number goes up; there is no point at which it stops rising.')+
      '</div>';
  }
  if(ps.n){
    h += '<div class="grid g3" style="gap:8px;margin-bottom:8px">'+
      '<div><div class="tiny muted">Best worth (real)</div><div>'+fmt(ps.bestNW)+'</div></div>'+
      '<div><div class="tiny muted">Best freedom</div><div>'+ps.bestFreedom+'</div></div>'+
      '<div><div class="tiny muted">Best run rating</div><div>'+ps.bestQuality+'</div></div></div>';
    const bd = ps.byDiff, keys = Object.keys(bd);
    if(keys.length) h += '<div class="tiny muted" style="margin-bottom:8px">Tiers played: '+
      keys.map(function(k){ return ((DIFFS[k]||{}).name||k)+' &times;'+bd[k]; }).join(' · ')+'</div>';
  }
  h += '<div class="row wrap" style="gap:5px;margin-bottom:8px">'+
    '<button class="btn xs" data-a="profile">Profile, sync &amp; export</button></div>';
  if(!ps.n){
    h += '<div class="small muted">No finished runs yet. The record starts the first time a run ends — '+
      'at 65, after 42 years, or earlier than either if it goes badly.</div>';
  } else {
    h += '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Every run, newest first. '+
      'Open one to see what you did and what it cost you.</div>';
    runs.slice(0,8).forEach(function(r){
      const tone = r.reason==='retire' ? 'g' : r.reason==='bankrupt' ? 'r' : 'y';
      const col  = tone==='g' ? 'var(--good)' : tone==='r' ? 'var(--bad)' : 'var(--warn)';
      h += '<div class="logline" style="border-left-color:'+col+';cursor:pointer" data-a="runinfo" data-i="'+r.id+'">'+
        '<div class="t">'+esc(String(r.ended||'').slice(0,10))+'</div>'+
        '<b>'+esc(r.rank||'—')+'</b> <span class="chip '+tone+'">'+esc((DIFFS[r.difficulty]||{}).name||r.difficulty)+'</span> '+
        '<span class="tiny muted">'+r.years+' yrs · '+fmt(r.nwReal||0)+' real · freedom '+r.freedom+'</span>'+
        '<div class="tiny muted">'+esc(String(r.epitaph||'').slice(0,110))+'</div></div>';
    });
    if(runs.length>8) h += '<div class="tiny muted" style="margin-top:6px">'+(runs.length-8)+
      ' earlier runs not shown. The profile keeps the last '+MAX_RUNS+'.</div>';
  }
  h += '</div>';
  return h;
}