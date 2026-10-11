

function render(){
  if(!S){ renderStart(); return; }
  recompute();
  /* First thing, before ANY renderer draws: put the container back the way the
     last renderer left it. The disclosure chrome is DOM this package adds -
     chevrons into headings, the rest of each card wrapped in a `.discbody`, an
     Expand all row at the top - and React cannot patch its way around chrome it
     does not know about: it removes a child through the parent it mounted it in,
     and a re-parented node makes that throw.

     This ran after the route was drawn for one cycle, and the walk said so at
     once: two NotFoundErrors, an insertBefore on the first page the app drew
     after the start screen and a removeChild on Work. Order is the whole of it -
     chrome off, whoever draws, chrome back on. */
  releaseDisclosure(Q('main'));
  /* One question before anything else: does the app draw the page? If it does,
     the header, the strip, the route and the modal are one commit in an order the
     app chose, and this function writes no markup at all - it does the four
     things that are about the page rather than about who filled it in, below. */
  const page = appDrawsPage();
  if(!page) renderChrome();
  const v = routeView;
  const _sy = window.pageYOffset || document.documentElement.scrollTop || 0;
  /* document.activeElement is an Element; what this needs is the input fields
     of one. One cast, because the three reads below are all "if it is an input
     with data-inp". */
  const _af = /** @type {HTMLInputElement} */ (document.activeElement);
  const _fk = (_af && _af.dataset && _af.dataset.inp) ? (_af.dataset.inp+'|'+(_af.dataset.k||'')) : '';
  const _fs = (_af && _af.selectionStart!==undefined && _af.type!=='range') ? _af.selectionStart : null;
  /* The app draws the route itself when it can draw all of it; see
     appDrawsRoute() below. Either way this function does the rest - the modal,
     the inputs, the disclosure, the scroll and the focus - because those are
     about the page, not about who filled it in. */
  if(!page) renderMarkupPage(v);
  bindInputs();
  applyDisclosure();
  if(UI.scrollTop){ UI.scrollTop=false; window.scrollTo(0,0); }
  else { window.scrollTo(0, _sy); }
  if(_fk){
    const parts = _fk.split('|');
    const sel = '[data-inp="'+parts[0]+'"]'+(parts[1]?'[data-k="'+parts[1]+'"]':'');
    const nf = /** @type {HTMLInputElement} */ (Q('main').querySelector(sel) || (Q('modalHost')||document).querySelector(sel));
    if(nf){ try{ nf.focus(); if(_fs!==null && nf.setSelectionRange) nf.setSelectionRange(_fs,_fs); }catch(e){} }
  }
  /* P5: "take me there" - from the bell in the header or from the Overview
     agenda - lands here. Scroll the card that was named into view and flash it
     once, so guidance is a place and not a sentence. */
  if(UI.focus){
    try{
      const hs = Q('main').querySelectorAll('h3,h4');
      for(let i=0;i<hs.length;i++){
        if((hs[i].textContent||'').indexOf(UI.focus) < 0) continue;
        const card = hs[i].closest ? hs[i].closest('.card') : null;
        if(card){
          if(card.scrollIntoView) card.scrollIntoView({block:'center'});
          if(card.classList){
            card.classList.add('flash');
            setTimeout(function(){ try{ card.classList.remove('flash'); }catch(e){} }, 1800);
          }
        }
        break;
      }
    }catch(e){}
    UI.focus = '';
  }
  /* the scene is drawn last, behind whatever filled the page, by either
     renderer; a scene that cannot be drawn is reported and cleared, and the
     page it sits behind still works */
  try{ worldSync(); }catch(e){ console.error('the scene could not be drawn', e); worldSync(true); }
}
/* The two names the markup path goes by.

   `render()` is three jobs, and it is worth being able to say which one is
   running: it draws the chrome above the page, it draws the route and the modal
   underneath, and it does the page-level work that belongs to the page rather
   than to whoever filled it in (bindings, disclosure, scroll, focus). The first
   two are the markup path - the single file, and any load where the app has not
   claimed the page - and they are two functions so that "the string path" is a
   place in this file rather than a pair of `if(!page)` blocks. Nothing moved:
   these are the same statements, called in the same order, and the gates that
   compare the two paths (react-shell, react-route, single) are what say so. */
function renderChrome(){
  renderTop(); renderTabs();
}
function renderMarkupPage(v){
  if(!appDrawsRoute()) Q('main').innerHTML = v();
  renderModal();
}
function renderTop(){
  if(shellDraw('top', Q('toprow'))) return;
  const d = S.der, prev = S.hist.length>1 ? S.hist[S.hist.length-2].nw : d.nw;
  const delta = d.nw - prev;
  const freedom = freedomIndex();
  Q('toprow').innerHTML =
    '<div class="brandwrap">'+
      '<div class="brand">LEDGER</div>'+
      '<small class="brandsub">'+esc(CITY().name)+' · '+esc(D().name)+'</small>'+
      saveLineHTML()+
    '</div>'+
    '<div class="stats">'+
      '<div class="hstat"><b>'+dateLabel(S.turn)+'</b><span>Quarter</span></div>'+
      '<div class="hstat"><b>'+S.p.age+' yrs</b><span>Age</span></div>'+
      '<div class="hstat"><b class="'+(delta>=0?'good':'bad')+'">'+fmt(d.nw)+
        (delta>=0?' ▲':' ▼')+'</b><span>Net worth</span></div>'+
      '<div class="hstat"><b>'+fmt(S.fin.cash)+'</b><span>Cash</span></div>'+
      '<div class="hstat"><b>'+freedom+'</b><span>Freedom</span></div>'+
    '</div>'+
    '<div class="acts">'+
      bellHTML()+
      eraChipHTML()+
      seasonChipHTML()+
      '<button class="btn sm helpbtn" data-a="help" title="How to play">?</button>'+
      '<button class="btn sm setbtn" data-a="settings" title="Settings" aria-label="Settings">'+
        '<span class="lbl">Settings</span><span class="icn">\u2699</span></button>'+
      '<button class="btn primary sm" data-a="advance">Advance ▸</button>'+
    '</div>';
}
function startAdvanceAnim(){
  const M = UI.modal; if(!M || M.type!=='advance') return;
  /* long enough to see each of the quarter's pictures */
  const shots = (M.reel || []).length;
  const DUR = UI.animFast ? Math.max(1500, shots * 700) : Math.max(5000, shots * 1500);
  const nowFn = (typeof performance!=='undefined' && performance.now) ? function(){return performance.now();} : Date.now;
  const t0 = nowFn();
  let raf=null, tw=null, done=false;
  function stop(){ if(raf!==null && typeof cancelAnimationFrame==='function') cancelAnimationFrame(raf); if(tw) clearInterval(tw); }
  function finish(){
    if(done) return; done=true; stop(); UI._anim=null;
    const pend = (UI.modal && UI.modal.type==='advance') ? (UI.modal.pending||null) : UI.modal;
    UI.modal = pend || null;
    render();
  }
  UI._anim = {finish:finish};
  function frame(){
    if(!S) return;
    const cur = UI.modal;
    if(!cur || cur.type!=='advance'){ stop(); return; }
    const p = clamp((nowFn()-t0)/DUR, 0, 1);
    const e = 1-Math.pow(1-p,3);
    (cur.rows||[]).forEach(function(r){
      const el = document.getElementById('av_'+r.key);
      if(el) el.textContent = fmt(Math.round(r.from + (r.to-r.from)*e));
    });
    const bar = document.getElementById('avBar');
    if(bar) bar.style.width = (p*100).toFixed(1)+'%';
    /* the pictures turn on the same clock as the figures */
    const reel = document.getElementById('avReel');
    if(reel){
      const fr = reel.querySelectorAll('.rframe'), dots = reel.querySelectorAll('.rdots i');
      const on = Math.min(fr.length - 1, Math.floor(p * fr.length));
      for(let i = 0; i < fr.length; i++){ fr[i].classList.toggle('on', i === on); if(dots[i]) dots[i].classList.toggle('on', i === on); }
    }
    if(p>=1){ finish(); return; }
    raf = (typeof requestAnimationFrame==='function') ? requestAnimationFrame(frame) : setTimeout(frame,16);
  }
  const line = M.line||'';
  if(line){
    let i=0;
    const per = Math.max(11, Math.round((DUR*0.72)/Math.max(1,line.length)));
    tw = setInterval(function(){
      const e2 = document.getElementById('avLine');
      if(!e2 || !UI.modal || UI.modal.type!=='advance'){ clearInterval(tw); return; }
      i++; e2.textContent = line.slice(0,i);
      if(i>=line.length) clearInterval(tw);
    }, per);
  }
  frame();
}

/* ---- who draws the shell ------------------------------------------------

   The page around the route: the header row, the tab strip with its second
   level and the screen hint, and the modal. Same arrangement as the route
   drawer, one level up, and for the same reason - these are rebuilt as strings
   on every render, so a state change replaces the whole header and the tab
   strip whether or not anything in them moved.

   The app declares which pieces it draws, by name, and answers when asked to
   draw one. Declared, not guessed: a piece the app does not claim stays
   markup, and that is what lets this land one piece at a time - the header
   today, the modal when the modal is ready, and nothing broken in between, in
   the single file or in the browser.

   Every entry point the game already uses (renderTop, renderTabs, renderSubs,
   renderWhy, renderModal) keeps its name and its contract, because the action
   table calls several of them directly: `belltoggle` re-renders the header, and
   an action that re-rendered the wrong thing here would be a bell that does not
   open. Each one now asks first, and hands over if the app owns it. */
/* Both of these are read through `||` below, and that is not defensive
   habit. A `var` is hoisted but its initialiser runs in source order, and this
   file is in a cycle: the tail of 17-actions.js calls boot() at module top
   level, boot() calls render(), and render() calls renderTop() - which can
   happen while this module is still being evaluated, before these two lines
   have run. APP_ROUTE has always had the same hazard and has always been fine,
   because undefined is falsy and "nobody handed a drawer in" is the right
   answer. The map is the same: not declared yet means markup draws the shell,
   never a crash. */
var APP_SHELL = {};        /* piece -> true, when the app draws it */
var SHELL_DRAW = null;
function setAppShell(map){
  const next = {};
  const keys = Object.keys(map || {});
  for(let i=0;i<keys.length;i++){ if(map[keys[i]]) next[keys[i]] = true; }
  /* A piece that has just stopped being the app's is a piece whose container is
     about to be written into as markup - so the app is told to let go first, for
     the same reason setRouteDrawer(null) does: a React root left on a container
     the markup builder is about to fill is a crash waiting for the next render.
     In the running app this happens once, at boot, before anything is drawn. */
  const dropped = Object.keys(APP_SHELL || {}).filter(function(k){ return !next[k]; });
  APP_SHELL = next;
  if(dropped.length) releaseShell();
  return Object.keys(APP_SHELL).length;
}
function setShellDrawer(fn){
  if(typeof fn !== 'function'){ releaseShell(); SHELL_DRAW = null; return false; }
  SHELL_DRAW = fn;
  return true;
}
function shellOwned(piece){ return !!(APP_SHELL && APP_SHELL[piece] && SHELL_DRAW); }
/* One piece, drawn by the app. A drawer that returns false is one that has not
   implemented it yet, and the markup path answers as it always did. A drawer
   that throws is one that said it could and could not, so the claim is dropped
   for the rest of the session - a header that disappears on a bad state is
   worse than a header that is merely rebuilt. */
function shellDraw(piece, hosts){
  if(!shellOwned(piece)) return false;
  try{ if(SHELL_DRAW(piece, hosts) === true) return true; }
  catch(e){
    console.error('the app failed to draw the ' + piece + '; the markup path has it back', e);
    APP_SHELL[piece] = false;
  }
  return false;
}
/* ---- who draws the page ------------------------------------------------

   Above the shell is the loop itself. Every render used to be four decisions and
   four markup writes in a fixed order - the header, the strip, the route, the
   modal - and each of the three seams above answers one of them. A page drawer
   answers all four at once, in one place, in an order the app can see.

   It is not a fifth renderer: it is the same four, composed by the app instead
   of by this function. What changes is that the ORDER lives somewhere a
   component tree can express, and that the ui stops writing markup between the
   pieces. What does not change is the page-level work underneath - the input
   bindings, the disclosure chrome, the scroll position, the focus - because none
   of that is about who filled the container in, and all of it still runs after.

   The claim is the intersection of the pieces: an app draws the page only if it
   already draws all three pieces of chrome AND the route. That is what keeps
   this honest - a page drawer for an app that has not converted the modal would
   be a page drawer that silently drops it - and it is also what makes this
   testable, because setAppShell({}) turns the page claim off with it. */
var APP_PAGE = null;
/* Hosts, by name, because the app composes the page and needs all of them at
   once. Passed rather than looked up so the seam has one shape: the ui says
   where the containers are, the app fills them. */
function appPageHosts(){
  return { main: Q('main'), top: Q('toprow'), tabs: Q('tabs'), subs: Q('subs'),
           why: Q('why'), modal: Q('modalHost') };
}
function setAppPage(fn){
  if(typeof fn !== 'function'){ APP_PAGE = null; return false; }
  APP_PAGE = fn;
  return true;
}
function appDrawsPage(){
  if(!APP_PAGE) return false;
  /* the pieces, in the order they are asked for everywhere else */
  if(!shellOwned('top') || !shellOwned('tabs') || !shellOwned('modal')) return false;
  if(!APP_ROUTE) return false;
  const hosts = appPageHosts();
  if(!hosts.main) return false;
  try{ return APP_PAGE(hosts) === true; }
  catch(e){
    console.error('the app failed to draw the page; the markup path has it back', e);
    APP_PAGE = null;
    return false;
  }
}
function pageOwnership(){
  if(!APP_PAGE) return { owned:false, why:'no app handed a page drawer in' };
  if(!shellOwned('top') || !shellOwned('tabs') || !shellOwned('modal')){
    return { owned:false, why:'the app does not draw every piece of the shell' };
  }
  if(!APP_ROUTE) return { owned:false, why:'the app does not draw the route' };
  return { owned:true, why:'the app draws the header, the strip, the route and the modal' };
}

/* Let go of every container the app was drawing into, before markup is written
   over it. Called from setShellDrawer(null) and before the single-file start
   screen draws - the same rule the route drawer follows. */
function releaseShell(){
  if(!SHELL_DRAW) return false;
  try{ SHELL_DRAW(null); }catch(e){}
  return true;
}
function shellOwnership(){ return Object.keys(APP_SHELL || {}); }

/* Who draws the route.

   The game has always drawn #main by writing markup into it, and in the single
   file it still does, line for line as before. An app that has converted
   screens can do better: it holds the whole route as components and re-renders
   them from the state they already read, so a change of state becomes a
   re-render of a live tree rather than a replacement of the page. Focus,
   selection, scroll position and a half-typed figure survive, because the nodes
   survive - which is the difference between a screen that is redrawn and a
   screen that is rebuilt.

   The app hands its drawer in through @ledger/ui's setRouteDrawer() and it is
   asked on every render. It does not decide whether it *should* draw: the ui
   decides that - every screen on the route converted, no arguments to lose, and
   no grouping left for core to post-process - and calls the drawer with either
   the screen names or null. Null means "you no longer own the container", which
   is the app's cue to let go before markup is written into it.

   Conservative on purpose. A route core still has to group, or a route with one
   screen React cannot draw, keeps the string path and behaves exactly as it did
   before this existed. A throw inside the app is caught and falls back to
   markup, because a render loop that dies because an optional fast path failed
   is worse than the slow path.

   In the single file APP_ROUTE is always null and nothing changes: there is no
   app, and the markup builder is still the only renderer. */
var APP_ROUTE = null;
function setAppRoute(fn){ APP_ROUTE = (typeof fn === 'function') ? fn : null; return !!APP_ROUTE; }
function appDrawsRoute(){
  if(!APP_ROUTE) return false;
  const main = Q('main');
  if(!main) return false;
  try{ return APP_ROUTE(main) === true; }
  catch(e){
    console.error('the app failed to draw the route; falling back to markup', e);
    return false;
  }
}
/* Said out loud before anyone writes markup over a container the app owns: a
   React root whose nodes were replaced behind its back is a crash waiting for
   the next click. Every writer of #main calls this first - the route here, and
   the start screen in 17-actions.js. */
function releaseAppRoute(){
  if(!APP_ROUTE) return false;
  try{ APP_ROUTE(null); }catch(e){}
  return true;
}
