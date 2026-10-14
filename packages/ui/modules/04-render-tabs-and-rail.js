
import { TABS, UI, normTab, subsFor, tabDot, worldGlyph } from '@ledger/core';
import { Q } from './00-q.js';
import { renderWhy } from './02-view-overview.js';
import { shellDraw } from './03-render.js';

/* Generated from src/04-render-tabs-and-rail.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function renderTabs(){
  /* the app draws the strip, its second level and the hint together - three
     containers, one component tree on the app's side */
  if(shellDraw('tabs', { tabs: Q('tabs'), subs: Q('subs'), why: Q('why') })){ centerActiveTab(); return; }
  Q('tabs').innerHTML = TABS.map(t=>{
    /* an icon over a short label: navigation is a picture first */
    return '<button class="tab'+(UI.tab===t.id?' on':'')+'" data-a="tab" data-t="'+t.id+'">'+
      '<span class="gfx tico" aria-hidden="true">'+worldGlyph(t.id)+'</span><span class="tlbl">'+t.label+'</span>'+tabDot(t.id)+'</button>';
  }).join('');
  centerActiveTab();
  renderSubs();
  renderWhy();
}
/* The two containers the start screen has no use for. When the app owns the
   strip, letting go removed its contents but left the app's own host-level
   styling on them - a `display:none` on the second level or an `open` class on
   the hint - and a start screen wearing the last run's chrome is exactly the
   kind of ghost this whole seam exists to avoid. */
export function shellClear(subs, why){
  if(subs){ subs.innerHTML = ''; subs.style.display = 'none'; }
  if(why){ why.innerHTML = ''; why.className = ''; }
}

/* Where the strip is scrolled to is a fact about the page, not about who drew
   the markup: whichever renderer filled #tabs, the tab you are on is brought
   into view. Kept out of renderTabs' body so the app's strip gets it too. */
export function centerActiveTab(){
  const tb = Q('tabs'), on = /** @type {HTMLElement} */ (tb && tb.querySelector('.tab.on'));
  if(on){ const l = on.offsetLeft - tb.clientWidth/2 + on.offsetWidth/2; tb.scrollLeft = Math.max(0, l); }
}
/* Second level. Only rendered when the tab has one, so Overview stays clean. */
export function renderSubs(){
  const host = Q('subs');
  if(!host) return;
  if(shellDraw('tabs', { tabs: Q('tabs'), subs: host, why: Q('why') })) return;
  const subs = subsFor(UI.tab);
  if(!subs || subs.length < 2){ host.innerHTML = ''; host.style.display = 'none'; return; }
  host.style.display = '';
  host.innerHTML = subs.map(function(sb){
    return '<button class="sub'+(UI.sub===sb.id?' on':'')+'" data-a="sub" data-s="'+sb.id+'">'+
      '<span class="gfx sbico" aria-hidden="true">'+worldGlyph(sb.id)+'</span>'+sb.label+'</button>';
  }).join('');
}
/* Take the disclosure chrome back off the container.

   `applyDisclosure()` was written for a container whose contents are replaced on
   every render: it appends a chevron to each heading, moves everything under it
   into a `.discbody`, and inserts an Expand all / Collapse all row at the top.
   `#main.innerHTML = ...` destroyed all of that once per render, so it never
   accumulated - and nothing noticed that the pass has no way to run twice.

   A container React owns is not replaced. It is re-rendered, in place, which is
   the whole point of that path: the DOM survives a change of state on purpose.
   So the chrome stacked - one more chevron per heading, one more Expand all row
   per render, each card's contents wrapped one level deeper than the last - and
   a card's heading read "Where you stand Lagos▾▾▾▾" after four renders.

   Worse, moving a node React owns into a wrapper of our own making is the one
   thing a React tree cannot survive: React removes a child through the parent it
   mounted it in, and a node that has been re-parented behind React's back makes
   that throw. So this runs *before* React draws, and puts the container back
   exactly the way React left it: bodies unwrapped, chevrons gone, the attributes
   we added gone. The player's open/closed state is not lost, because it never
   lived in the DOM - `UI.collapsed` holds it and the next pass rebuilds the
   chrome from that map, which is precisely what the string path does too. */
export function releaseDisclosure(main){
  main = main || Q('main');
  if(!main || !main.querySelectorAll) return 0;
  let n = 0;
  const all = function(sel){ return Array.prototype.slice.call(main.querySelectorAll(sel)); };
  all('.disctools').forEach(function(t){ if(t.parentNode) t.parentNode.removeChild(t); });
  /* outermost first: a wrapper inside a wrapper is lifted out with it, and is
     still in this list, so it gets lifted and dropped in its turn */
  all('.discbody').forEach(function(wrap){
    const parent = wrap.parentNode;
    if(!parent) return;
    while(wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
    parent.removeChild(wrap);
    n++;
  });
  all('h3 > .chev, h4 > .chev').forEach(function(c){ if(c.parentNode) c.parentNode.removeChild(c); });
  all('h3[data-disc], h4[data-disc]').forEach(function(h){ h.removeAttribute('data-disc'); });
  return n;
}
export function applyDisclosure(){
  const main = Q('main'); if(!main) return;
  /* idempotent: whatever a previous pass added comes off first, whether or not
     render() has already done this */
  releaseDisclosure(main);
  if(!UI.collapsed) UI.collapsed = {};
  const tab = normTab(UI.tab);
  const cards = Array.prototype.slice.call(main.querySelectorAll('.card'));
  let n = 0;
  cards.forEach(function(card){
    const h3 = card.querySelector('h3');
    if(!h3) return;
    if(card.querySelector('[data-a],input,select,button')) return;   // never hide controls
    /* ...nor a picture: folding is for text in the way, and a card that is a
       drawing - a waterfall, the cash cycle, what it owns and owes, the demand
       meter, the register, a life - is the thing the screen is for */
    if(card.querySelector('.wfchart,.wccycle,.posbars,.dmeter,.regpic,.lifeline,.gpic,.trackchart')) return;
    const label = (h3.textContent||'').trim().slice(0,40);
    const ck = tab+'|'+n+'|'+label;
    /* first two stay open - or, with the explanations folded away (the
       world-first default), the first stays open so the screen leads with its
       main thing, and the rest start as their headings under the city and the
       tiles; what the player opens stays open */
    if(UI.collapsed[ck]===undefined) UI.collapsed[ck] = UI.details ? (n>=2) : (n>=1);
    /* P5: never leave the card the rail pointed at collapsed. */
    if(UI.focus && label && label.indexOf(UI.focus)>=0) UI.collapsed[ck] = false;
    h3.setAttribute('data-disc', ck);
    const chev = document.createElement('span');
    chev.className='chev';
    chev.textContent = UI.collapsed[ck] ? '\u25b8' : '\u25be';
    h3.appendChild(chev);
    const wrap = document.createElement('div');
    wrap.className='discbody';
    if(UI.collapsed[ck]) wrap.style.display='none';
    const move=[]; let node = h3.nextSibling;
    while(node){ move.push(node); node = node.nextSibling; }
    move.forEach(function(nd){ wrap.appendChild(nd); });
    card.appendChild(wrap);
    n++;
  });
  if(n>1){
    const t = document.createElement('div');
    t.className='disctools';
    t.innerHTML = '<button class="btn xs" data-a="discall" data-v="1">Expand all</button>'+
                  '<button class="btn xs" data-a="discall" data-v="0">Collapse all</button>';
    main.insertBefore(t, main.firstChild);
  }
}
export function toggleDisclosure(h3){
  const ck = h3.dataset.disc; if(!ck || !UI.collapsed) return;
  UI.collapsed[ck] = !UI.collapsed[ck];
  const card = h3.parentElement;
  const body = card && card.querySelector('.discbody');
  if(body) body.style.display = UI.collapsed[ck] ? 'none' : '';
  const chev = h3.querySelector('.chev');
  if(chev) chev.textContent = UI.collapsed[ck] ? '\u25b8' : '\u25be';
}