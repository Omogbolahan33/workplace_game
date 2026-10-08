
/* ---------------------------------------------------------------------------
   Screen hints (§17 P7)
   Teaching copy used to sit at the bottom of long tabs where nobody read it.
   Each route now opens with one sentence saying why the screen exists. The
   long-form cards stay where they are - this is the hook, not a replacement.
   --------------------------------------------------------------------------- */
/*@table:ROUTE_WHY@*/
/* 'dash' is the old name for the overview screen and it is what saved games
   carry. TABS, ROUTE_WHY and ROUTE_GROUPS are all keyed 'overview', so an
   untranslated 'dash' silently matches nothing: no hint, no grouping, and no
   second-level tabs, on the one screen everybody lands on first. */
function normTab(t){ return (!t || t === 'dash') ? 'overview' : t; }
/* A sub only counts if it belongs to the tab you are on. Carrying one over
   from the previous tab - which is what happens when a run starts, or when
   anything sets UI.tab without touching UI.sub - produced keys like
   'overview/business' that exist in no table, and the screen quietly lost its
   hint and its grouping. */
function routeKey(){
  const t = normTab(UI.tab);
  const subs = subsFor(t);
  const mine = !!subs && subs.some(function(x){ return x.id === UI.sub; });
  return t + (mine ? '/' + UI.sub : '');
}
/* The hint for this screen, or '' if it has none or was dismissed. */
function whyText(){
  const txt = ROUTE_WHY[routeKey()];
  if(!txt) return '';
  if((S.why||{})[routeKey()]) return '';    /* dismissed on this screen */
  return txt;
}
/* Why this screen matters, kept out of the way.

   This was a banner above every screen. That is the right place for it the
   first time you open a screen and the wrong place every time after: you
   scroll past the same paragraph to reach the numbers you came for. It lives
   behind a question mark in the header now - hover on a desktop, tap on a
   phone - and the screen keeps its full height for the thing you opened it
   for. Dismissing it still works, and still only affects the screen you
   dismissed it on. */
function whyHTML(){
  const key = routeKey();
  const txt = whyText();
  if(!txt) return '';
  return '<button class="whyq" data-a="whyopen" data-k="'+key+'" '+
    'aria-label="Why this screen matters" title="Why this screen matters">?</button>'+
    '<div class="whypop"><div><b>Why this screen matters.</b> '+esc(txt)+'</div>'+
    '<div class="row" style="gap:5px;margin-top:9px;justify-content:flex-end">'+
    '<button class="btn xs" data-a="hidewhy" data-k="'+key+'">Got it</button></div></div>';
}