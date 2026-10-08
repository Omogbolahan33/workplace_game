
/* Working capital, on screen. The cycle is invisible arithmetic until it is
   the reason a profitable company cannot make payroll, so it gets a card. */
import { CITY, PKEY, PROF, R, S, SKEY, UI, bar, blankProfile, cccOf, clamp, cloudConfigured, cloudPullQuiet, cloudPushQuiet, cloudReady, cloudRefresh, cloudSessionValid, commitBreak, commitBuilding, committedFixedQ, esc, fmt, growthBill, normTab, noteResume, noteSaved, parseSaveRaw, recentGrowth, recompute, setProfile, setS } from '@ledger/core';

/* Generated from src/01-view-working-capital.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function viewWorkingCapital(){
  const b = S.biz; if(!b) return '';
  const c = cccOf(b);
  const g = recentGrowth(b);
  const bill = growthBill(b, Math.max(0.10, g > 0 ? g : 0.10));
  const funded = b.wcFunded===undefined ? 1 : b.wcFunded;
  let h = '<div class="card"><h3>Working capital <span class="tag">CCC '+c.ccc+' days</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">'+
    'Every naira of new revenue has to be financed first &mdash; as stock before it sells, '+
    'as a receivable after it does. That cash leaves quarters before the profit arrives, '+
    'and it does not appear on the P&amp;L.</div>';
  h += '<div class="kv"><span class="muted">Owed by customers &middot; DSO</span>'+
    '<span class="mono">'+fmt(Math.round(b.recv||0))+' &middot; '+c.dso+'d</span></div>';
  h += '<div class="kv"><span class="muted">Sitting in stock &middot; DIO</span>'+
    '<span class="mono">'+fmt(Math.round(b.inventory||0))+' &middot; '+c.dio+'d</span></div>';
  h += '<div class="kv"><span class="muted">Owed to suppliers &middot; DPO</span>'+
    '<span class="mono good">&minus;'+fmt(Math.round(b.payable||0))+' &middot; '+c.dpo+'d</span></div>';
  h += '<hr class="sep">';
  h += '<div class="kv"><span><b>Cash stuck in the cycle</b></span>'+
    '<span class="mono '+(c.tied > (b.cash||0) ? 'bad':'')+'"><b>'+fmt(c.tied)+'</b></span></div>';
  h += '<div class="tiny muted" style="margin:-2px 0 9px">Your cash on hand is '+fmt(Math.round(b.cash||0))+'.</div>';

  h += '<div style="border:1px solid '+(bill > (b.cash||0)*0.5 ? 'rgba(255,159,67,.45)':'var(--line)')+
    ';border-radius:9px;padding:10px;margin-bottom:8px;background:'+
    (bill > (b.cash||0)*0.5 ? 'rgba(255,159,67,.06)':'transparent')+'">';
  h += '<div class="tiny muted">The bill for growth</div>';
  h += '<div style="font-size:17px;font-weight:650;margin:2px 0 3px">'+fmt(bill)+'</div>';
  h += '<div class="tiny muted">Growing another '+Math.round(Math.max(0.10, g>0?g:0.10)*100)+
    '% next quarter costs this much in cash <b>before any of it comes back</b>.'+
    (bill > (b.cash||0)*0.5
      ? ' You do not have it. Growth is what will kill this business, not losses.'
      : '')+'</div></div>';

  if(funded < 0.9){
    h += '<div class="tutorial bad" style="border-color:rgba(255,95,109,.4);color:#ffb3b8;background:rgba(255,95,109,.08)">'+
      'You could only fund '+Math.round(funded*100)+'% of the stock this business needs. '+
      'Customers are being served off a shelf you never paid for &mdash; and some of them are going elsewhere.</div>';
  }
  if(c.dpo > 45){
    h += '<div class="tiny muted" style="margin-top:7px">You are '+c.dpo+
      ' days behind with suppliers. That is a loan they did not agree to, and supplier confidence is '+
      Math.round(b.supplierConf===undefined?70:b.supplierConf)+'/100.</div>';
  }
  h += '</div>';
  return h;
}
export function viewCommitments(){
  const b = S.biz; if(!b) return '';
  const building = commitBuilding(b);
  const leaving  = (b.staff||[]).filter(function(st){ return st.leaving !== undefined; });
  const ramping  = (b.staff||[]).filter(function(st){
    return st.ramp !== undefined && st.ramp < 0.98 && st.leaving === undefined; });
  const fx = committedFixedQ(b);
  let h = '<div class="card"><h3>Commitments <span class="tag">'+
    (building.length ? building.length+' in flight' : 'none in flight')+'</span></h3>';
  h += '<div class="tiny muted" style="margin-bottom:10px">Everything here is already decided. '+
    'It costs money the whole time it is arriving, and it cannot be unmade for free. '+
    'The dials are further down the screen; this is the part you are stuck with.</div>';
  h += '<div class="kv"><span class="muted">Owed next quarter, whatever you sell</span>'+
    '<span class="mono">'+fmt(fx.total)+'</span></div>';
  h += '<div class="tiny muted" style="margin:-2px 0 9px">'+fmt(fx.rent)+' rent &middot; '+
    fmt(fx.salaries)+' salaries'+(fx.builds ? ' &middot; '+fmt(fx.builds)+' still building' : '')+'</div>';

  if(!building.length && !leaving.length && !ramping.length)
    h += '<div class="tiny muted">Nothing is in flight. For once you can still choose.</div>';

  building.forEach(function(c){
    const eta = Math.max(0, (c.readyAt||0) - S.turn);
    const prog = clamp(((c.paid||0) / Math.max(1, c.total||1)) * 100, 0, 100);
    h += '<div style="border:1px solid var(--line);border-radius:9px;padding:10px;margin-bottom:8px">';
    h += '<div class="between"><b>'+esc(c.label)+'</b><span class="chip '+(eta?'y':'g')+'">'+
      (eta ? 'arrives in '+eta+' quarter'+(eta===1?'':'s') : 'due now')+'</span></div>';
    h += '<div class="tiny muted" style="margin:4px 0 6px">'+fmt(Math.round(c.total))+' committed &middot; '+
      fmt(Math.round(c.paid))+' spent &middot; '+fmt(c.perQ)+' a quarter while it builds</div>';
    h += bar(prog, 100, 'var(--acc)');
    h += '<div class="row" style="margin-top:8px;gap:6px">'+
      '<button class="btn xs bad" data-a="abandon" data-i="'+c.id+'">Abandon &mdash; costs '+
      fmt(commitBreak(c))+'</button></div>';
    h += '</div>';
  });

  if(leaving.length){
    h += '<hr class="sep"><div class="tiny muted"><b>Working notice:</b> '+
      leaving.map(function(st){ return esc(st.name); }).join(', ')+
      '. Still on the payroll for another quarter, still not really here.</div>';
  }
  if(ramping.length){
    h += '<div class="tiny muted" style="margin-top:7px"><b>Still finding their feet:</b> '+
      ramping.map(function(st){ return esc(st.name)+' ('+Math.round((st.ramp||0)*100)+'%)'; }).join(', ')+
      '. Nobody is fully useful in their first quarter.</div>';
  }
  h += '</div>';
  return h;
}
export function save(slot){
  try{
    const at = Date.now(), head = saveHead();
    /* `at` and `head` travel with the save so the game can describe it — "Ada,
       Q3 2031, ₦4.2m, saved 4m ago" — without loading it. Loading to ask the
       question would stop a run in progress to find out what the last one said. */
    const blob = JSON.stringify({S:S, rs:R.s, ui:{tab:UI.tab}, at:at, head:head});
    localStorage.setItem(SKEY+(slot||'auto'), blob);
    noteSaved(at, head);
    return true;
  }catch(err){ console.warn('save failed', err); return false; }
}
/* The one line a save is described by, anywhere it is described. */
export function saveHead(){
  try{
    return { name:S.name || '', age:(S.p && S.p.age) || 0, turn:S.turn || 0,
             nw:Math.round((S.der && S.der.nw) || 0), city:(CITY() || {}).label || '',
             diff:S.difficulty || '' };
  }catch(e){ return null; }
}
/* What a stored save says about itself, without loading it. `null` when there is
   no save, or when the save predates this header — in which case the caller says
   what it can rather than inventing a quarter. */
export function saveInfo(slot){
  /* the parse is core's (parseSaveRaw) and there is exactly one of it; this is
     only the read, which is the part that needs a storage layer */
  try{ return parseSaveRaw(localStorage.getItem(SKEY+(slot||'auto'))); }
  catch(e){ return null; }
}
export function hasSave(slot){ try{ return !!localStorage.getItem(SKEY+(slot||'auto')); }catch(e){ return false; } }
/* The run worth offering: the newest save on the device, whichever slot it is in.
   Not "the auto slot" - a hardcore run is never auto-saved, so on a cold start
   the auto slot is empty while slot 1 holds a decade of play, and a start screen
   that only ever asked about 'auto' had nothing to offer such a player. Old files
   carry no `at`, in which case the slot without one is still offered, last. */
export function bestSave(){
  const slots = ['auto','s1','s2','s3'];
  let best = null;
  slots.forEach(function(sl){
    const info = saveInfo(sl);
    if(!info || !info.head || !info.head.name) return;
    if(!best || (info.at||0) > (best.at||0)) best = { slot:sl, at:info.at||0, head:info.head };
  });
  return best;
}
export function load(slot){
  try{
    const raw = localStorage.getItem(SKEY+(slot||'auto'));
    if(!raw) return false;
    const data = JSON.parse(raw);
    setS(data.S); R.s = data.rs|0;
    if(!S.pending) S.pending = []; if(!S.cd) S.cd = {}; if(!S.flags) S.flags = {};
    if(!S.decisions) S.decisions = [];
    // relink the company portfolio: JSON duplicated the active-business reference
    if(!S.bizs || !S.bizs.length) S.bizs = S.biz ? [S.biz] : [];
    S.bizs = S.bizs.filter(Boolean);
    S.bizs.forEach(function(b){ if(!b.id) b.id = 'b'+(++S.seq); if(!b.outlets) b.outlets=[]; if(!b.contracts) b.contracts=[]; if(!b.staff) b.staff=[]; });
    S.biz = (S.activeBiz && S.bizs.find(function(b){ return b.id===S.activeBiz; })) || S.bizs[0] || null;
    S.activeBiz = S.biz ? S.biz.id : null;
    UI.tab = normTab(data.ui&&data.ui.tab); UI.modal=null;
    recompute();
    return true;
  }catch(err){ console.warn('load failed', err); return false; }
}
export function wipe(){
  try{ ['auto','s1','s2','s3'].forEach(s=>localStorage.removeItem(SKEY+s)); }catch(e){}
  /* nothing is left to offer, so nothing may be offered: the resume card and the
     greeting are drawn from what is on the disk, and this is the disk changing */
  try{ noteResume(null); }catch(e){}
}
export function loadProfile(){
  try{
    const raw = localStorage.getItem(PKEY);
    let p = null;
    if(raw){ try{ p = JSON.parse(raw); }catch(e){ p = null; } }
    if(!p || p.v!==1 || !Array.isArray(p.runs)){ setProfile(blankProfile()); saveProfile(); return PROF; }
    p.runs = p.runs || [];
    p.cloud = Object.assign(blankProfile().cloud, p.cloud||{});
    setProfile(p); return PROF;
  }catch(e){ setProfile(blankProfile()); return PROF; }
}
export function saveProfile(){
  try{
    if(!PROF) return false;
    PROF.updated = new Date().toISOString();
    localStorage.setItem(PKEY, JSON.stringify(PROF));
    return true;
  }catch(e){ console.warn('profile save failed', e); return false; }
}
/* Pull first, then push: a device that has been away should receive before it
   imposes. Errors are swallowed by design - sync is a convenience, never a
   dependency. */
export let _syncing = false;
export async function cloudSyncBackground(){
  if(_syncing) return false;
  if(!cloudConfigured()) return false;
  if(typeof navigator!=='undefined' && navigator.onLine===false) return false;
  if(!cloudReady()) return false;
  _syncing = true;
  let ok = false;
  try{
    if(!cloudSessionValid() && !(await cloudRefresh())) return false;
    await cloudPullQuiet();
    ok = await cloudPushQuiet();
  }catch(e){ ok = false; }
  finally{ _syncing = false; }
  return ok;
}
/* Coming back online, or finishing a run, are the two moments worth syncing on. */
if(typeof window!=='undefined' && window.addEventListener){
  window.addEventListener('online', function(){ cloudSyncBackground(); });
}