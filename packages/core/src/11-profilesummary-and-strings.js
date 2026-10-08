/* What is left of the file that used to be called 11-cloudpull.js: the summary
   and the two save strings (`exportStr`/`importStr` — a string, never a file,
   §15.26), plus three small helpers. The pulling itself moved to
   10a-cloud-api.js, where every request now lives. */

function profileSummary(){
  const p = ensureProfile();
  const runs = p.runs||[];
  const byDiff = {};
  runs.forEach(function(r){ byDiff[r.difficulty] = (byDiff[r.difficulty]||0)+1; });
  const sk = skillRating(p);
  return {
    n:runs.length, byDiff:byDiff, skill:sk, band:skillBand(sk),
    bestNW:runs.reduce(function(a,r){ return Math.max(a, r.nwReal||0); }, 0),
    bestFreedom:runs.reduce(function(a,r){ return Math.max(a, r.freedom||0); }, 0),
    bestQuality:runs.reduce(function(a,r){ return Math.max(a, r.quality||0); }, 0),
    retired:runs.filter(function(r){ return r.reason==='retire'; }).length,
    years:runs.reduce(function(a,r){ return a + (r.years||0); }, 0)
  };
}

function exportStr(){ return JSON.stringify({S:S, rs:R.s}); }
function importStr(str){
  try{
    const d = JSON.parse(str);
    if(!d.S) return false;
    S = d.S; R.s = d.rs|0; S.gameOver=null;
    if(!S.pending) S.pending=[]; if(!S.decisions) S.decisions=[];
    recompute(); render(); return true;
  }catch(e){ toast('That save string is not valid.'); return false; }
}

/* =========================================================================
   Section 14: Presentation — chrome, dashboard, money, investing
   ========================================================================= */
/* Five tabs, not ten. The old structure was organised around systems
   (governance, market, property), which is why it did not read as a life.
   This one is organised around time: where you stand this quarter, what you
   do about it, and what it all adds up to. */
/*@table:TABS@*/
/* Second-level navigation. Overview has none - it is the quarter itself. */
/*@table:SUBS@*/
function subsFor(tab){ return SUBS[tab] || null; }
/* Every view in the game is reachable from exactly one (tab, sub) pair.
   Nothing was dropped in the consolidation - the ten old tabs were folded
   into five, and their cards distributed across the second level. */
/* A big number with a label under it. Used for the three things that decide
   whether a run is going well. */
function bigStat(label, value, note, tone){
  return '<div style="border:1px solid var(--line);border-radius:10px;padding:11px">'+
    '<div class="tiny muted">'+esc(label)+'</div>'+
    '<div style="font-size:21px;font-weight:650;line-height:1.25;margin:3px 0 1px'+
      (tone?';color:var(--'+tone+')':'')+'">'+value+'</div>'+
    (note ? '<div class="tiny muted">'+note+'</div>' : '')+'</div>';
}