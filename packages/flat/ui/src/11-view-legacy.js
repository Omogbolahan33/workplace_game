

/* ---------------------------------- Legacy --------------------------------- */
function viewLegacy(){
  let h = '';
  h += '<div class="grid g2"><div>';
  h += '<div class="card"><h3>What you are actually trying to do</h3>';
  /* the ambition as a ring and the five as picture tiles - ambitionHTML(),
     the app's too */
  h += ambitionHTML();
  h += '</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Where you stand</h3>'+
    foldHTML('Why five', 'Five constituencies. You cannot please all of them, and the game will keep asking you to choose.')+
    standRingsHTML()+'</div>';
  h += '</div><div>';
  h += '<div class="card"><h3>The scoreboard that matters at 65</h3>'+
    scoreboardRingsHTML()+
    '<hr class="sep">'+foldHTML('Why this scoreboard',
    'Nobody at your funeral is going to mention your quarterly returns. The game keeps the other score anyway, '+
    'so that you can see the trade you are making while there is still time to make a different one.')+'</div>';
  h += '<div class="card" style="margin-top:12px"><h3>Posterity</h3>'+
    '<div class="tiny muted" style="margin-bottom:8px">What is actually in place, today, if something happened.</div>'+
    '<div class="logline"><div class="t">Estate</div>'+esc(estateLine())+'</div>'+
    '<div class="logline" style="border-left-color:var(--warn)"><div class="t">A will</div>'+esc(willLine())+'</div>'+
    '<div class="row wrap" style="margin-top:9px"><button class="btn xs" data-a="makewill">Draw up a will</button>'+
    '<button class="btn xs" data-a="trust">Set up a family trust</button></div>'+
    '<div class="tiny muted" style="margin-top:7px">'+esc(inheritanceNote())+'</div></div>';
  h += '</div></div>';
  return h;
}

/* ── Legacy > Chronicle, redesigned (the redesign's final phase) ────────────
   Measured first, in both worlds: 684 characters in the way early, and **3,966 in
   a mature run** — by a wide margin the heaviest route in the game, and the only
   one the plan budgets above the 1,200 line (at 1,500, because a log is long by
   nature).

   The problem was not that the entries are long. It was that **all forty were in
   the way at once**, in one column, so the log opened on its oldest quarter and a
   player arriving at the end of a decade scrolled through 2026 to find out what
   happened this year.

   What it is now: the log reads **newest first**, the eight latest entries are the
   screen, and everything older is grouped by year behind a fold that says how much
   it holds ("2027 · 14 entries"). Nothing is dropped — `--check` counts entries and
   controls — and the entry markup is unchanged, including the colour that already
   says whether an entry was good, bad, a warning, macro news or a beginning. That
   colour is why no outcome chip was added: the outcome is already on the line, and
   a chip would have been text where there is already colour. */
function viewLedgerChronicle(){
  const js = S.journal.slice(0,40);
  const entryHTML = function(j){
    const c = {good:'var(--good)',bad:'var(--bad)',warn:'var(--warn)',macro:'var(--info)',begin:'var(--acc)'}[j.kind]||'var(--line)';
    return '<div class="logline" style="border-left-color:'+c+'"><div class="t">'+j.date+' · '+j.cat+'</div>'+esc(j.text)+'</div>';
  };
  let h = '<div class="card"><h3>Chronicle <span class="tag">'+
    js.length+(js.length===1?' entry':' entries')+'</span></h3>';
  if(!js.length){ h += '<div class="tiny muted">Empty.</div></div>'; return h; }
  /* world-first: your life as a line, what happened pinned on it, the
     quarters as tiles that open in full - the list with the explanations shown */
  if(sceneFirst()) return h + '<div class="chron">'+chronicleInnerHTML(js)+'</div></div>';
  /* log() unshifts, so the journal is already newest-first - which is what the
     reader wants. It used to be reversed here, which put the run's first eight
     entries on the screen and folded away everything since. */
  const rev = js.slice();
  rev.slice(0,8).forEach(function(j){ h += entryHTML(j); });
  const rest = rev.slice(8);
  if(rest.length){
    /* grouped by the year in the entry's own date, in the order the years
       appear — newest first, like the entries */
    const years = [];
    rest.forEach(function(j){
      const y = (String(j.date).match(/\d{4}/)||['Earlier'])[0];
      const last = years[years.length-1];
      if(last && last.y === y) last.items.push(j); else years.push({ y:y, items:[j] });
    });
    h += years.map(function(g){
      return foldHTML(g.y+' \u00b7 '+g.items.length+(g.items.length===1?' entry':' entries'),
        g.items.map(entryHTML).join(''));
    }).join('');
  }
  h += '</div>';
  return h;
}
/* Build stamp.

   There was no way to tell a stale copy from a fresh one, and that is not a
   hypothetical problem: a bug report came in against code that had already
   been fixed, because the file being run was a download from before the fix
   and its stack-trace line numbers belonged to a build nobody had open. Both
   people were right and neither could tell.

   This is a hash of the document as it is running, so it changes with every
   edit and needs no one to remember to bump a number. If a report says
   "build 4f2a9c11" and this screen says something else, the copy is stale. */
function buildStampInfo(){
  try {
    /* the code, not the document. Hashing outerHTML looked right and was not:
       the page contains live state, so the stamp changed between two renders
       of the same build and identified nothing. */
    let src = '';
    const sc = document.scripts;
    for (let i = 0; i < sc.length; i++) src += (sc[i].textContent || '');
    if (!src) return null;
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < src.length; i++){
      const c = src.charCodeAt(i);
      h1 = ((h1 ^ c) * 16777619) >>> 0;
      h2 = (h2 + c * (i + 1)) >>> 0;
    }
    return { hash:(h1.toString(16).padStart(8,'0') + h2.toString(16).padStart(8,'0')).slice(0, 8),
             chars: src.length };
  } catch(e){ return null; }
}