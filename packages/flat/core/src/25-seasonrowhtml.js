
function seasonRowHTML(){
  if(!_sea.code) return '<div class="tiny muted" style="margin:12px 0 6px">Finish line</div>'+
    '<button class="btn xs block" data-a="seasonopen">Set a finish line, or join a season</button>'+
    '<div class="tiny muted" style="margin-top:5px">Left open, the run ends when it ends &mdash; retirement, collapse, or turn 168.</div>';
  const n = seasonTurnFor(_sea.endYear, _sea.endQ);
  return '<div class="tiny muted" style="margin:12px 0 6px">Finish line</div>'+
    '<div class="kv"><span><b>'+esc(_sea.name||'Season')+'</b> <span class="chip">'+esc(_sea.code)+'</span></span>'+
    '<span class="mono">Q'+_sea.endQ+' '+_sea.endYear+'</span></div>'+
    '<div class="tiny muted" style="margin-top:4px">'+n+' quarters ('+(n/4).toFixed(1)+' years) &middot; world '+
    (_sea.seed ? esc(seedName(_sea.seed)) : 'random')+(_sea.organiser?' &middot; you created this':'')+'</div>'+
    (function(){
      if(!seaPins()) return '';
      const c = CITIES.find(function(x){return x.id===_sea.city;});
      const p = PROFILES.find(function(x){return x.id===_sea.profile;});
      return '<div class="tiny muted" style="margin-top:3px">Everybody starts in '+
        esc(c?c.label:_sea.city)+', as '+esc(p?p.name:_sea.profile)+', on '+
        esc((DIFFS[_sea.difficulty]||{name:_sea.difficulty}).name)+'.</div>';
    })()+
    '<div class="row" style="gap:5px;margin-top:7px"><button class="btn xs" data-a="seasonopen">Change</button>'+
    '<button class="btn xs ghost" data-a="seasonclear">Remove</button></div>';
}
function seasonModal(){
  const code = seaDraftCode();
  const years = []; for(let y=START_YEAR+4; y<=START_YEAR+44; y+=4)
    years.push('<button class="btn xs '+(_sea.endYear>=y && _sea.endYear<y+4 ? 'primary':'')+
      '" data-a="seasetyear" data-y="'+y+'">'+y+'</button>');
  const qs = [1,2,3,4].map(function(q){
    return '<button class="btn xs '+(_sea.endQ===q?'primary':'')+'" data-a="seasetq" data-q="'+q+'">Q'+q+'</button>';}).join('');
  const n = seasonTurnFor(_sea.endYear, _sea.endQ);
  return modalHTML('<h2>Season</h2>',
    foldHTML('What a season is', 'A season fixes the finish line in advance. '+
    'Everybody in it plays to the same quarter, from the same seed, and is scored on the same axes &mdash; '+
    'so the comparison at the end means something.')+
    '<div class="tiny muted" style="margin:12px 0 6px">Join one</div>'+
    '<div class="row" style="gap:6px"><input type="text" id="seaJoin" value="'+esc(_sea.joinCode||'')+
    '" placeholder="Season code, e.g. LAGOS-4K7Q" style="flex:1"><button class="btn" data-a="seasonjoin">Join</button></div>'+
    foldHTML('What joining does', 'Joining pulls the season\'s conditions down so your run matches everybody else\'s.')+
    '<hr class="sep">'+
    '<div class="tiny muted" style="margin:10px 0 6px">Or start one</div>'+
    '<input type="text" id="seaName" value="'+esc(_sea.name||'')+'" placeholder="Season name, e.g. Lagos cohort &mdash; spring">'+
    '<div class="tiny muted" style="margin:12px 0 6px">Season code &mdash; this is what you send people</div>'+
    '<div class="row" style="gap:6px">'+
      '<input type="text" id="seaCodeBox" class="mono" readonly value="'+esc(code)+
      '" style="flex:1;font-size:15px;letter-spacing:.08em">'+
      '<button class="btn" data-a="seasoncopy" style="white-space:nowrap">Copy</button>'+
      '<button class="btn" data-a="seasonrecode" title="Generate a different code" style="padding:0 10px">&#8635;</button>'+
    '</div>'+
    (function(){
      const link = seasonLink(code);
      const qr = qrSVG(link, 4, 2);
      const short = link.length > 46 ? link.slice(0, 46) + '…' : link;
      return '<div class="row" style="gap:10px;margin-top:10px;align-items:flex-start">'+
        (qr ? '<img src="'+qr+'" width="108" height="108" alt="Scan to join '+esc(code)+
              '" style="border:1px solid var(--line);border-radius:8px;background:#fff;padding:4px;flex:none">'
            : '')+
        '<div style="flex:1;min-width:0">'+
          foldHTML('How they join', 'Point a camera at this, or send the link. Either one lands '+
          'the other player in this season with the code already filled in.')+
          '<button class="btn xs block" style="margin-top:6px" data-a="seasoncopylink">Copy invite link</button>'+
          (seasonCanScan()
            ? '<button class="btn xs block" style="margin-top:5px" data-a="seasonscan">Scan a code instead</button>'
            : '')+
          '<div class="tiny muted" style="margin-top:6px;word-break:break-all">'+esc(short)+'</div>'+
        '</div></div>';
    })()+
    '<div class="tiny muted" style="margin:12px 0 6px">Everybody starts as the same person, in the same '+
      'place, on the same difficulty</div>'+
    '<div class="tiny muted" style="margin:4px 0 5px">Where</div>'+
    '<div class="row wrap" style="gap:4px">'+CITIES.map(function(c){
      return '<button class="btn xs '+(seaCity()===c.id?'primary':'')+
        '" data-a="seasetcity" data-c="'+c.id+'">'+c.label+'</button>';}).join('')+'</div>'+
    '<div class="tiny muted" style="margin:8px 0 5px">Who</div>'+
    '<div class="row wrap" style="gap:4px">'+PROFILES.map(function(p){
      return '<button class="btn xs '+(seaProfile()===p.id?'primary':'')+
        '" data-a="seasetprof" data-p="'+p.id+'">'+esc(p.name)+'</button>';}).join('')+'</div>'+
    '<div class="tiny muted" style="margin:8px 0 5px">Difficulty</div>'+
    '<div class="row wrap" style="gap:4px">'+Object.keys(DIFFS).map(function(k){
      return '<button class="btn xs '+(seaDifficulty()===k?'primary':'')+
        '" data-a="seasetdiff" data-d="'+k+'">'+DIFFS[k].name+'</button>';}).join('')+'</div>'+
    '<div class="tiny muted" style="margin-top:5px">These are fixed for the season. Whoever joins '+
      'starts here too, so the only thing separating two entries at the end is how they played.</div>'+
    '<div class="tiny muted" style="margin:12px 0 6px">It ends</div>'+
    '<div class="row wrap" style="gap:4px">'+years.join('')+'</div>'+
    '<div class="row wrap" style="gap:4px;margin-top:5px">'+qs+'</div>'+
    '<div class="tiny muted" style="margin:10px 0 6px">World &mdash; pick one; everybody in the season gets '+
      'whichever you choose</div>'+
    '<div class="row wrap" style="gap:5px">'+
      seedOffers().map(function(o){
        return '<button class="btn xs '+(_sea.seed===o.n?'primary':'')+
          '" data-a="seasonpickseed" data-s="'+o.n+'">'+esc(o.name)+'</button>';
      }).join('')+
      '<button class="btn xs '+(!_sea.seed?'primary':'')+'" data-a="seasonpickseed" data-s="0">'+
      'Random</button>'+
      '<button class="btn xs ghost" data-a="seasonreroll" title="Offer four different worlds">&#8635;</button>'+
    '</div>'+
    '<div class="tiny muted" style="margin-top:6px">'+
      (_sea.seed
        ? 'Everybody joining '+esc(seaDraftCode())+' will play <b>'+esc(seedName(_sea.seed))+'</b> &mdash; '+
          'the same shocks in the same quarters, and the same starting hand.'
        : 'Random: each player gets their own world. Fine for a casual season, '+
          'but the comparison at the end means less.')+
    '</div>'+
    '<div class="tiny muted" style="margin-top:8px">'+n+' quarters ('+(n/4).toFixed(1)+
    ' years). The run stops at the end of Q'+_sea.endQ+' '+_sea.endYear+', whatever else is true of it.</div>',
    '<button class="btn primary" data-a="seasoncreate">Create season</button>'+
    '<button class="btn ghost" data-a="close">Cancel</button>');
}
const M_name = ()=>_cfg.name, M_city = ()=>_cfg.city, M_prof = ()=>_cfg.profile, M_diff = ()=>_cfg.difficulty;
/* How this works — the seven rules, as a table.
   ────────────────────────────────────────────────────────────────────────────
   Measured by `tools/shellaudit.mjs`: 1,142 characters in the way, as one wall of
   seven bold-led paragraphs. It was honest and unreadable: a player opening Help
   wants to *find* the rule they are unsure about, and a wall has no index. It is a
   table now — the rule on the left, what it means on the right, one row each — so
   the eye can run down the rules and stop at the one that matters. Every sentence
   is kept, word for word; the only text that moved is the difficulty note, which
   is a footnote and is now a foot. */
function helpModal(){
  const RULES = [
    ['One turn is one quarter',
     'Every quarter you set a budget, invest, run your business, and then advance time. Then the world responds.'],
    ['Decisions have delayed consequences',
     'Skipping a medical check-up costs you nothing this quarter and \u20a61.4m in six quarters. The game schedules those consequences and delivers them when they are due.'],
    ['Money decays',
     'Inflation is real on this screen. Cash sitting in a current account loses purchasing power every single quarter. That is the central tension of the game.'],
    ['Nothing is labelled \u201cthe right answer\u201d',
     'Every option has a genuine trade-off. Some have worse expected value than others, and you will learn which by losing money.'],
    ['Businesses are machines',
     'Revenue equals the lesser of what you can produce and what the market wants at your price. Capacity comes from staff and equipment; demand comes from reputation, quality, marketing and price.'],
    ['The run ends at 65',
     'Or earlier if you break yourself or your finances. The score that matters is the Freedom Index on the dashboard.'],
    ['Difficulty is a dial',
     'It can be switched at any time from the Ledger tab. Apprentice mode explains the principle behind every decision.']
  ];
  return modalHTML('<h2>How this works</h2>',
    '<div class="tblwrap"><table class="tbl">'+
    RULES.map(function(r){
      return '<tr><td style="white-space:normal"><b>'+r[0]+'</b></td>'+
             '<td style="white-space:normal" class="muted">'+r[1]+'</td></tr>';
    }).join('')+
    '</table></div>',
    '<button class="btn primary" data-a="close">Got it</button>', 'style="max-width:620px"');
}
/* The difficulty tiers, as a comparison rather than six paragraphs.
   ────────────────────────────────────────────────────────────────────────────
   This was one bordered block per tier: a name, a Switch button, and a full
   sentence of description. Six of those is about eight hundred characters of
   prose, and the prose is *not* comparable — you cannot read down six
   paragraphs and see which tier shows you the odds or which one lets you
   reload. The tiers differ in six facts, and those six facts are fields on the
   table, so this draws the table: the tier you are playing keeps its sentence,
   the rest are rows. Shorter, and it says more.

   The locked tiers keep the reason in words — a tier that refuses without
   saying what it wants is indistinguishable from a tier that is missing. */
function diffListHTML(){
  const keys = Object.keys(DIFFS);
  const act = DIFFS[S.difficulty] ? S.difficulty : keys[0];
  const a = DIFFS[act];
  let h = '<div class="between" style="margin-bottom:4px"><b>'+esc(a.name)+'</b>'+
    '<span class="chip b">you are playing this</span></div>'+
    '<div class="tiny muted" style="margin-bottom:10px">'+esc(a.desc)+'</div>'+
    '<div class="tblwrap"><table class="tbl"><thead><tr>'+
      '<th>Tier</th><th>Odds</th><th>Coach</th><th>Replay</th><th>Pay</th><th></th>'+
    '</tr></thead><tbody>';
  keys.forEach(function(k){
    const dd = DIFFS[k], on = (k === act), locked = !tierUnlocked(k);
    h += '<tr'+(on?' class="on"':'')+'>'+
      '<td><b>'+esc(dd.name)+'</b></td>'+
      '<td>'+(dd.showOdds?'shown':'hidden')+'</td>'+
      '<td>'+(dd.coaching?'yes':'no')+'</td>'+
      '<td>'+(dd.saveScum?'free':'none')+'</td>'+
      '<td>\u00d7'+dd.pay+'</td>'+
      '<td style="text-align:right">'+(on ? '<span class="tiny muted">playing</span>'
        : locked ? '<span class="tiny muted">'+esc(tierLockNote(k))+'</span>'
        : '<button class="btn xs" data-a="setdiff" data-d="'+k+'">Switch</button>')+'</td></tr>';
  });
  h += '</tbody></table></div>';
  /* Every tier's own sentence, kept — folded rather than deleted. The table
     compares the facts; the sentences say what each tier *feels* like, and a
     player choosing between them may want either. They are one tap away instead
     of six paragraphs in the road. */
  h += '<details class="fold"><summary>What each tier plays like</summary><div>'+
    keys.map(function(k){
      const dd = DIFFS[k];
      return '<div style="margin-bottom:6px"><b>'+esc(dd.name)+'</b> \u2014 '+esc(dd.desc)+'</div>';
    }).join('')+
    '</div></details>';
  return h;
}
function settingsModal(){
  return modalHTML('<h2>Settings</h2>',
    diffListHTML()+
    '<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Location</div>'+
    '<div class="row wrap" style="gap:4px">'+CITIES.map(function(c){
      return '<button class="btn xs '+(S.city===c.id?'primary':'')+'" data-a="setcity" data-c="'+c.id+'">'+c.label+'</button>';}).join('')+'</div>'+
    '<hr class="sep"><button class="btn sm block" data-a="help">How to play</button>'+
    '<hr class="sep"><button class="btn sm block bad" data-a="restart">Abandon this run</button>',
    '<button class="btn primary" data-a="close">Close</button>', 'style="max-width:520px"');
}
function endModal(){
  if(!S.gameOver) S.gameOver = {reason:'retire', at:S.turn, age:S.p.age, nw:netWorth(), freedom:freedomIndex()};
  const f = finalReport();
  const years = (S.turn/4).toFixed(1);
  const why = S.gameOver.reason==='health' ? 'You ran yourself into the ground. Every other number on this screen is now academic.'
    : S.gameOver.reason==='bankrupt' ? 'Insolvency, on hardcore. The debts outran the assets and the run ends here.'
    : 'You reached the end of the working arc. Here is what the ledger says.';
  return modalHTML(
    '<div class="between"><span class="chip '+(f.freedom>60?'g':f.freedom>35?'y':'r')+'">Freedom '+f.freedom+'</span><span class="tiny muted">'+years+' years</span></div>'+
    '<h1 style="font-size:26px;margin-top:8px">'+f.rank+'</h1>'+
    '<div class="small muted" style="margin-top:4px">'+esc(f.epitaph)+'</div>',
    '<div class="small" style="margin-bottom:12px;line-height:1.6">'+esc(why)+'</div>'+
    '<div class="kv"><span class="muted">Final net worth</span><span><b>'+fmt(f.d.nw)+'</b></span></div>'+
    '<div class="kv"><span class="muted">In start-of-game money</span><span>'+fmt(f.d.nw/Math.max(0.01,S.cumInfl))+'</span></div>'+
    '<div class="kv"><span class="muted">Cash</span><span>'+fmt(S.fin.cash)+'</span></div>'+
    '<div class="kv"><span class="muted">Investments</span><span>'+fmt(f.d.assets)+'</span></div>'+
    '<div class="kv"><span class="muted">Business value</span><span>'+fmt(f.d.biz)+'</span></div>'+
    '<div class="kv"><span class="muted">Debt</span><span class="'+(f.d.debt>0?'bad':'')+'">'+fmt(f.d.debt)+'</span></div>'+
    '<div class="kv"><span class="muted">Decisions made</span><span>'+(f.good+f.bad+f.neutral)+' &nbsp;<span class="good">'+f.good+' good</span> · <span class="bad">'+f.bad+' costly</span></span></div>'+
    '<div class="kv"><span class="muted">Final quality of life</span><span>health '+Math.round(S.p.health)+' · stress '+Math.round(S.p.stress)+' · family '+Math.round(S.p.family)+'</span></div>'+
    scoreBlock()+
    (function(){
      const lr = S._lastRun; if(!lr) return '';
      const n = (ensureProfile().runs||[]).length;
      const up = (lr.prevSkill!==null && lr.newSkill!==null) ? (lr.newSkill - lr.prevSkill) : 0;
      return '<hr class="sep"><div class="kv"><span class="muted">Your record</span><span>'+n+' run'+(n===1?'':'s')+
        ' · rating <b>'+(lr.newSkill===null?'—':lr.newSkill)+'</b>'+
        (up ? ' <span class="tiny '+(up>0?'good':'bad')+'">'+(up>0?'+':'')+up+'</span>' : '')+
        '</span></div><div class="tiny muted" style="margin-top:4px">'+
        (lr.first ? 'First run recorded. The game now has something to judge you on, and it will lean on the difficulty from here.'
         : lr.best ? 'Your best result so far. Expect the next run to press a little harder.'
         : 'This run is in your record. The game adjusts difficulty to it, inside the tier you chose.')+
        '</div>';
    })()+
    (f.best.length?'<hr class="sep"><div class="tiny muted" style="margin-bottom:6px">Calls that paid</div>'+
      f.best.map(x=>'<div class="logline" style="border-left-color:var(--good)"><div class="t">'+x.date+'</div><b>'+esc(x.title)+'</b><br>'+esc(x.choice)+'</div>').join(''):'')+
    (f.worst.length?'<div class="tiny muted" style="margin:12px 0 6px">Calls that cost</div>'+
      f.worst.map(x=>'<div class="logline" style="border-left-color:var(--bad)"><div class="t">'+x.date+'</div><b>'+esc(x.title)+'</b><br>'+esc(x.choice)+'</div>').join(''):''),
    (S.gameOver.reason==='retire'?'<button class="btn" data-a="keepplaying">Keep playing</button>':'')+
    '<button class="btn primary" data-a="restart">New run</button>'+
    '<button class="btn ghost" data-a="close">Review the board</button>',
    'style="max-width:640px"');
}