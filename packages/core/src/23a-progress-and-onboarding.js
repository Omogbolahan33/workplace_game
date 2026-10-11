
/* ── Progress, and the first quarter ───────────────────────────────────────
   Two things live here and they are the same subject: what the game remembers,
   and what a new player is told.

   **Progress.** The run is saved after every move — `save()` in the ui writes
   `{S, rs, ui, at, head}`, and `head` is the one line the game needs to describe
   a save without loading it (name, age, quarter, net worth, city). This file
   holds the *state* of that: when it last happened, whether it happens at all
   (hardcore runs are not auto-saved — a roguelike that rewinds is not a
   roguelike), and the header chip that says so. The chip is the answer to "is my
   progress safe?", which is otherwise a question the game never answers until
   something goes wrong.

   **The first quarter.** `firstMovesHTML()` is the only onboarding a player
   needs after the start screen: the loop in one sentence and three places to
   start, each of them a real destination. It shows on the first quarter of a
   player's first run and never again — the flag is on the save, so a reload does
   not bring it back, and a second run does not see it at all.
   ────────────────────────────────────────────────────────────────────────── */

/* `at` is a timestamp, `head` the summary written beside the save blob. Nothing
   here is authority: if the storage layer forgets to call noteSaved(), the chip
   says "Saved" and the details are missing, which is a cosmetic failure and not
   a lie about the game state. */
let SAVE = { at:0, head:null, hardcore:false };
function noteSaved(at, head){
  SAVE.at = Number(at) || Date.now();
  if(head) SAVE.head = head;
  SAVE.hardcore = !!(S && S.difficulty === 'hardcore');
}
/* How long ago, in the shortest honest form. The chip does not tick — it is
   redrawn whenever anything else is — so this is a label, not a clock. */
function agoLabel(t){
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if(s < 45) return 'just now';
  if(s < 3600) return Math.max(1, Math.round(s/60)) + 'm ago';
  if(s < 86400) return Math.round(s/3600) + 'h ago';
  return Math.round(s/86400) + 'd ago';
}
function savedAtLabel(){
  if(!SAVE.at) return '';
  return new Date(SAVE.at).toTimeString().slice(0,5);
}
/* The save state, as one line under the brand — the block that already says who
   you are, now also saying that your progress is being kept.

   It is a line and not a chip for a measured reason: the header's action row has
   about fourteen pixels of slack in its widest case (era and season chips both
   showing), so a fourth control there wraps the header to three rows and blows
   the mobile budget by 26px. A line under the brand costs no width at all — it
   is narrower than the word LEDGER — and the row it sits in has the height.

   And it is silent when there is nothing to say. "Saved" every second of a run
   is noise; the state that needs saying is the one where progress is *not* being
   kept, which is hardcore, and it says so in the warning colour. */
/* A stored save, read for what it says about itself. The *read* is the host's
   business — the page does it from localStorage, the app asks its own platform
   layer — but the shape of the blob is core's, so the parse is core's too, and
   there is exactly one of it. `null` when there is nothing stored, or when the
   save predates this header, in which case the caller says what it can rather
   than inventing a quarter. */
function parseSaveRaw(raw){
  try{
    if(!raw) return null;
    const d = JSON.parse(raw);
    const head = d.head || null;
    return { at:d.at || 0, head:head,
             turn:(head && head.turn) || (d.S && d.S.turn) || 0,
             name:(head && head.name) || (d.S && d.S.name) || '',
             nw:Math.round((head && head.nw) || ((d.S && d.S.der && d.S.der.nw) || 0)) };
  }catch(e){ return null; }
}
/* One save slot, as a row: what is in it, and the two controls that act on it.
   "Load 1" used to be a button with no way to know what slot 1 held — you
   pressed it and found out. This is markup both renderers draw (the single
   file and the app's React screen), so the row, its buttons and the run it
   names cannot drift apart between them. */
function saveSlotRowHTML(slot, label, info){
  const filled = !!(info && info.head && info.head.name);
  const what = filled
    ? '<b>'+esc(String(info.head.name).slice(0,14))+'</b> \u00b7 '+dateLabel(info.turn||0)+' \u00b7 '+fmt(info.nw||0)
    : 'empty';
  /* a slot is a disk: lit when something is on it, with whose life, when and
     what it was worth; Save and Load under it */
  return '<div class="stile'+(filled ? ' filled' : '')+'">'+
    '<span class="gfx sdisk" aria-hidden="true">'+worldIco('disk')+'</span>'+
    '<b>'+label+'</b><span class="tiny'+(filled?'':' muted')+'">'+what+'</span>'+
    '<span class="spair"><button class="btn xs" data-a="save" data-s="'+slot+'">Save</button>'+
      '<button class="btn xs" data-a="load" data-s="'+slot+'">Load</button></span>'+
  '</div>';
}
function saveLineHTML(){
  if(!S || !S.p) return '';
  /* Asked of the run in front of you, not of the last save: a hardcore run that
     was loaded rather than written - which is every hardcore run, since it is
     never auto-saved - would otherwise announce "Saved" over a run nothing is
     saving. The remembered flag is still what the profile head and the settings
     read, and it is what save() sets. */
  if((S && S.difficulty === 'hardcore') || SAVE.hardcore)
    return '<button class="saveline warn" data-a="goprofile" '+
      'title="Hardcore: progress is not auto-saved. Save a slot before you close, or it is gone." '+
      'aria-label="Progress is not auto-saved — open your record">Not auto-saved</button>';
  const at = savedAtLabel();
  return '<button class="saveline" data-a="goprofile" '+
    'title="Saved automatically after every move'+(at?' — last at '+at:'')+'. Tap for your record and slots." '+
    'aria-label="Progress is saved automatically — open your record">Saved'+(at?' · '+at:'')+'</button>';
}
/* Who you are, and whether your progress is safe — the first card of the record
   screen, and the answer to the two questions a player arrives with. It lives in
   core rather than in the ui because the app's React screen embeds it. */
function profileHeadHTML(pr, ps){
  const at = savedAtLabel();
  const sync = (cloudCfg().token)
    ? 'synced across your devices'
    : (cloudReady() ? 'signed in, waiting for a sync' : 'stored on this device only');
  return '<div class="card"><h3>'+esc(pr.handle || 'No handle yet')+
    ' <span class="tag">profile <span class="mono">'+esc(String(pr.id||'').slice(0,8))+'</span></span></h3>'+
    '<div class="tiny muted" style="margin-bottom:8px">'+esc(sync)+' \u00b7 '+
      (S && S.difficulty === 'hardcore'
        ? 'hardcore: progress is not auto-saved'
        : 'progress is saved automatically after every move')+
      (at ? ', last at '+at : '')+'.</div>'+
    '<div class="row wrap" style="gap:5px">'+
      '<button class="btn xs" data-a="profile">Sync &amp; sign in</button>'+
      '<button class="btn xs" data-a="goto" data-t="legacy" data-s="settings">Save slots</button>'+
      (ps && ps.n ? '<span class="chip">'+ps.n+' run'+(ps.n===1?'':'s')+' recorded</span>' : '')+
      (ps && ps.skill !== null && ps.skill !== undefined ? '<span class="chip b">rating '+Math.round(ps.skill)+'</span>' : '')+
    '</div></div>';
}
/* ── what is on the device, waiting to be played ────────────────────────────
   `SAVE` above is about this session: it is written when the game saves, and on
   a cold start it is empty until the storage layer reads a file and says what it
   found. This is that second thing — the best run on the device, whichever slot
   it is in, so the start screen can offer the way back in.

   It exists because of Hardcore. A hardcore run is never auto-saved (that is the
   whole of Hardcore), so on a cold start there is no auto slot to resume, and
   before this the only way back into such a run was to start a new game and find
   the load buttons. The card is drawn from what the storage layer reports here,
   never from what a previous session remembers, so it cannot advertise a run
   that has been wiped. */
let RESUME = null;
function noteResume(info){
  RESUME = (info && info.head && info.head.name) ? info : null;
  return RESUME;
}
function resumeInfo(){ return RESUME; }
/* The one line that says what was resumed, for the toast on a boot that found a
   save. Read from the stored head, so it is about the save and not about the
   game that is now in memory. */
function resumeLine(){
  const r = RESUME || null;
  if(r && r.head && r.head.name){
    const when = r.at ? ' \u00b7 saved ' + agoLabel(r.at) : '';
    return 'Welcome back, ' + String(r.head.name).slice(0,18) + ' \u2014 ' +
      dateLabel(r.head.turn||0) + ' \u00b7 ' + fmt(r.head.nw||0) + when +
      (r.slot && r.slot !== 'auto' ? ' \u00b7 slot ' + r.slot.replace('s','') : '');
  }
  const h = SAVE.head;
  if(!h || !h.name) return '';
  const when = SAVE.at ? ' \u00b7 saved ' + agoLabel(SAVE.at) : '';
  return 'Welcome back, ' + String(h.name).slice(0,18) + ' \u2014 ' + dateLabel(h.turn||0) +
    ' \u00b7 ' + fmt(h.nw||0) + when;
}
/* ── the first quarter ───────────────────────────────────────────────────── */
function firstMovesHTML(){
  if(!S || !S.p) return '';
  if(S.turn > 0) return '';                  /* turn is 0-based: Q1 is turn 0 */
  if(S.flags && S.flags.fm) return '';
  if(profileSummary().n > 0) return '';        /* not their first run: they know */
  const moves = [
    { t:'work',  s:'business', ico:'tag',    head:'Set your price', why:'The fastest thing you control.' },
    { t:'money', s:'position', ico:'jar',    head:'See your money', why:'What comes in, what goes out, what is left.' },
    { t:'legacy',s:'ambition', ico:'target', head:'Pick an ambition', why:'What you are building toward, and how you are judged.' }
  ];
  /* the loop as a picture - a move, then the quarter turns, and round again -
     with the sentence that says it shown alongside the explanations */
  let h = '<div class="card fmcard"><h3>First quarter <span class="tag">the loop</span></h3>'+
    '<div class="gfx fmloop" role="img" aria-label="Make a move, then advance the quarter">'+
      '<span>'+worldIco('hands')+'<i>move</i></span><b>'+worldIco('up')+'</b>'+
      '<span>'+worldIco('calendar')+'<i>quarter</i></span>'+
      '<b class="back"><svg class="ico" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"/></svg></b></div>'+
    '<div class="small prose" style="margin-bottom:9px">Make a move, then advance the quarter. '+
    'That is the whole game — everything else is what you spend and what you own.</div>'+
    '<div class="fmmoves">';
  moves.forEach(function(m){
    h += '<button class="btn fmrow" data-a="goto" data-t="'+m.t+'" data-s="'+m.s+'">'+
      '<span class="gfx fmi" aria-hidden="true">'+worldIco(m.ico)+'</span><b>'+esc(m.head)+'</b>'+
      '<span class="tiny muted prose" style="display:block">'+esc(m.why)+'</span></button>';
  });
  h += '</div><div class="row wrap" style="gap:5px;margin-top:8px">'+
    '<button class="btn xs primary" data-a="advance">Advance the quarter \u25b8</button>'+
    '<button class="btn xs ghost" data-a="fmdone">Got it</button></div></div>';
  return h;
}
