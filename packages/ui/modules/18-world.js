/* =========================================================================
   The scene, placed
   ========================================================================= */
/* core draws the scene - your home, from the run (homeSceneSVG, VISUAL.md) -
   and worldHTML() writes it with the HUD over it; this file puts it in #scene,
   measures the view it fills, places the HUD and the move tiles in the part of
   it the player can see, and keeps all of that right as the window changes and
   the sheet scrolls. Nothing but this file writes #scene, so neither renderer
   shares a node with it: the React tree and the string path both leave it
   alone, and it leaves #main alone. */

/* Called at the end of every render, by both renderers, and by the start
   screen with `off` - the start screen can open while a run still exists (a new
   run from Settings), and it is no place for your home. It writes #scene (and
   only #scene). */
import { S, UI, routeViewInner, sceneSVG, worldGlyph, worldHTML } from '@ledger/core';
import { toast } from './00-q.js';

/* Generated from src/18-world.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function worldSync(off){
  const scene = document.getElementById('scene');
  if(!scene) return;
  if(off || !S){
    scene.innerHTML = '';
    document.body.classList.remove('has-world', 'terse');
    return;
  }
  /* the picture is as tall as the view it fills, measured here because core
     cannot see the screen */
  UI.sceneVH = homeVH();
  scene.innerHTML = worldHTML();
  const host = /** @type {HTMLElement} */ (scene.querySelector('#world'));
  /* a document that does not parse markup (a test's stub) has no scene to place */
  if(!host) return;
  /* world-first: your home fills the screen and the page is a sheet over it;
     the explanations are one tap off unless the player asked for them */
  document.body.classList.add('has-world');
  document.body.classList.toggle('terse', !UI.details);
  /* measured now that the stage is laid out: a different height redraws the
     picture once, at the size it is shown */
  const vh = homeVH(), stage = host.querySelector('.world-stage');
  if(stage && Math.abs(vh - UI.sceneVH) > 8){ UI.sceneVH = vh; stage.innerHTML = sceneSVG(vh); }
  worldTiles(host);
  homeBand(host);
}
/* How tall the scene's view is, in its own units (it is 390 wide): the
   stage's own box once it is laid out, and before that the CSS's answer - the
   band down to just under the top of the sheet. */
export function homeVH(){
  const st = /** @type {HTMLElement|null} */ (document.querySelector('#world .world-stage'));
  const h = st && st.clientHeight ? st.clientHeight : window.innerHeight * 0.66 + 24;
  const w = st && st.clientWidth ? st.clientWidth : window.innerWidth;
  return Math.round(390 * h / Math.max(1, w));
}
/* The band of the scene the player can see, from under the nav to the top of
   the sheet: the HUD and the tiles are placed in it, and it shrinks as the
   sheet scrolls up. */
export function homeBand(host){
  const tw = document.getElementById('tabwrap'), main = document.getElementById('main');
  const top = Math.max(0, tw ? tw.getBoundingClientRect().bottom : 0);
  const bot = Math.max(top, Math.min(window.innerHeight, main ? main.getBoundingClientRect().top : window.innerHeight));
  host.style.setProperty('--band-top', Math.round(top) + 'px');
  host.style.setProperty('--band-bot', Math.round(window.innerHeight - bot) + 'px');
  host.classList.toggle('narrow', bot - top <= 260);
}
/* "Things to do here": the moves on the page, as tiles along the bottom of the
   city. Read from the page itself after it is drawn - every button that does
   something rather than goes somewhere - so a tile can never offer a move the
   screen does not, and pressing a tile presses the screen's own button: the
   same action, the same dispatcher, the same refusal when it cannot be done. */
export function worldTiles(host){
  const NAV = /^(goto|tab|sub|toggrp|discall|worldfocus|details|help|settings|close|step|stepnext|stepback|profile|goprofile|bell|bellopen|why|whyhide|fold|advance)$/;
  const strip = document.createElement('div');
  strip.className = 'wtiles';
  /* every move on the screen, from its full markup - a group that starts
     closed keeps its buttons off the page, and a tile must still offer them */
  const src = document.createElement('div');
  src.innerHTML = routeViewInner();
  const btns = Array.prototype.slice.call(src.querySelectorAll('button[data-a]')).filter(function(b){
    return !NAV.test(b.dataset.a);
  }).slice(0, 16);
  if(!btns.length){ return; }
  const head = document.createElement('div');
  head.className = 'wtiles-h';
  head.textContent = 'Things to do here';
  strip.appendChild(head);
  const row = document.createElement('div');
  row.className = 'wtiles-r';
  btns.forEach(function(b){
    const ctx = /** @type {HTMLElement} */ (b.closest('.ctile, .btile, .stile, .mrow, .ltake, .lrow, .opt, li, tr, .kv, .card'));
    const named = ctx ? ctx.querySelector('b, strong, h4, .ol') : null;
    let title = (named && named.textContent || b.textContent || '').trim().replace(/\s+/g, ' ');
    /* a tile of several moves - a person, a slot - names the move and whose it is */
    if(ctx && ctx.matches('.ctile, .stile') && named) title = (b.getAttribute('aria-label') || b.textContent || '').trim() + ' \u00b7 ' + named.textContent.trim().split(' ')[0];
    /* a face or a tile on the sheet: its name is its first line, its figure the second */
    const face = b.classList.contains('facebtn') || b.classList.contains('dealtile');
    if(face) title = ((b.querySelector(':scope > b') || b.querySelector(':scope > span:not(.hring):not(.dpic)') || b).textContent || '').trim();
    if(title.length > 30) title = title.slice(0, 29) + '…';
    const costEl = ctx ? Array.prototype.slice.call(ctx.querySelectorAll('.chip')).find(function(c){ return /₦|\d+h\b/.test(c.textContent || ''); }) : null;
    const said = (b.textContent || '').trim();
    const small = face ? b.querySelector('small, .dmeta') : null;
    /* a deal's line ends with its stake, which is the figure a tile shows */
    const cost = small ? ((small.textContent || '').split('\u00b7').pop() || '').trim() : /₦/.test(said) ? said.replace(/^[^₦]*/, '').replace(/[()]/g, '') : costEl ? costEl.textContent.trim() : '';
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'wtile' + (b.disabled ? ' off' : '');
    t.title = b.disabled ? (b.title || 'Not possible right now') : said;
    /* core's own drawing for what the move is about - static markup from core, never the move's text */
    const ic = document.createElement('span'); ic.className = 'gfx ti'; ic.innerHTML = worldGlyph(title + ' ' + said + ' ' + b.dataset.a);
    const nm = document.createElement('b'); nm.textContent = title || said;
    t.appendChild(ic); t.appendChild(nm);
    if(cost){ const c = document.createElement('span'); c.className = 'tc'; c.textContent = cost.slice(0, 12); t.appendChild(c); }
    /* the screen's own button, pressed: a copy of it joins the page for the
       moment of the click, so the move goes through the one dispatcher */
    t.addEventListener('click', function(){
      if(b.disabled){ toast(b.title || 'Not possible right now', 3200); return; }
      const real = /** @type {HTMLElement} */ (b.cloneNode(true));
      real.style.display = 'none';
      host.appendChild(real);
      real.click();
      real.remove();
    });
    row.appendChild(t);
  });
  strip.appendChild(row);
  host.appendChild(strip);
}
/* a new shape of screen is a new height of view: redraw the scene to fit */
window.addEventListener('resize', function(){
  if(!S || !document.body.classList.contains('has-world')) return;
  if(Math.abs(homeVH() - (UI.sceneVH || 0)) > 8) worldSync();
  else { const host = document.getElementById('world'); if(host) homeBand(host); }
});
/* the sheet scrolls over the scene: the band shrinks, and what sits in it moves */
window.addEventListener('scroll', function(){
  const host = document.getElementById('world');
  if(host && document.body.classList.contains('has-world')) homeBand(host);
}, {passive:true});
