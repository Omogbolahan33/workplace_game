/* The account modal: your handle, and the account your record syncs to.

   It used to carry the record as well — runs, rating, years played, the adaptive
   tuning — which the record screen already shows in more room and with the run
   list under it. One fact, one home: this is where you *edit* who you are and
   sign in, and `viewCareerRecord()` is where you read what you have done.

   It is markup, not a converted React tree: the last screen in the app still
   drawn as a string, and moving it is a declared change, not a rename. */
function profileModal(){
  const pr = ensureProfile(), ps = profileSummary(), c = pr.cloud||{};
  let b = '';
  b += '<div class="tiny muted" style="margin-bottom:5px">Handle — just a name for the record</div>'+
    '<input type="text" data-inp="phandle" value="'+esc(pr.handle||'')+'" placeholder="e.g. Ada" style="width:100%;margin-bottom:5px">'+
    '<div class="tiny muted" style="margin-bottom:2px">Profile <span class="mono">'+esc(pr.id)+'</span></div>'+
    '<div class="tiny muted" style="margin-bottom:10px">Created '+esc(String(pr.created||'').slice(0,10))+
    ' · '+(cloudCfg().token ? 'synced across your devices' : 'stored on this device only')+'</div>';
  /* The record used to be repeated here in full — runs, rating, years, the
     adaptive tuning. All of it is on the record screen, which is where a player
     goes to read it, so this modal is now the two things a modal is for: the
     handle you can edit, and the account you can sign in to. */
  b += '<hr class="sep">'+
    '<div class="kv"><span class="muted">Runs recorded</span><span><b>'+ps.n+'</b></span></div>';
  b += '<hr class="sep"><div class="tiny muted" style="margin-bottom:7px"><b>Sign in to keep this record.</b> '+
    'Without it your record lives on this device and dies with the browser data. Sign in once and it '+
    'follows you to any device, automatically — the game plays offline regardless and reconciles '+
    'whenever there is a connection. Nothing is sent anywhere until you sign in.</div>';
  if(cloudReady()){
    b += '<div class="kv"><span>Signed in as</span><span class="mono">'+esc(c.email||'')+'</span></div>'+
      '<div class="kv"><span class="muted">Last sync</span><span>'+
      (c.lastSync ? esc(String(c.lastSync).replace('T',' ').slice(0,16)) : 'never')+'</span></div>'+
      '<div class="row wrap" style="gap:5px;margin-top:8px">'+
      '<button class="btn sm primary" data-a="cloudpush">Upload</button>'+
      '<button class="btn sm" data-a="cloudpull">Download &amp; merge</button>'+
      '<button class="btn sm ghost" data-a="cloudout">Sign out</button></div>';
  } else {
    b += '<input id="pUrl"  type="text"     value="'+esc(c.url||'')+'"  placeholder="https://xxxx.supabase.co" style="width:100%;margin-bottom:5px">'+
         '<input id="pKey"  type="text"     value="'+esc(c.key||'')+'"  placeholder="anon public key"          style="width:100%;margin-bottom:5px">'+
         '<input id="pMail" type="email"    value="'+esc(c.email||'')+'" placeholder="you@example.com"          style="width:100%;margin-bottom:5px">'+
         '<input id="pPw"   type="password" value=""                    placeholder="password"                 style="width:100%;margin-bottom:7px">'+
      '<div class="row wrap" style="gap:5px">'+
      '<button class="btn sm primary" data-a="cloudin">Sign in</button>'+
      '<button class="btn sm" data-a="cloudup">Create account</button></div>'+
      '<div class="tiny muted" style="margin-top:6px">The password is used once to get a token and is never stored.</div>';
    b += '<details style="margin-top:9px"><summary class="tiny muted" style="cursor:pointer">One-time database setup (paste into the Supabase SQL editor)</summary>'+
      '<pre style="white-space:pre-wrap;font-size:10px;line-height:1.5;background:var(--panel3);padding:9px;border-radius:7px;margin-top:6px">'+
      esc(CLOUD_SQL)+'</pre></details>';
  }
  if(c.lastError) b += '<div class="tiny bad" style="margin-top:7px">Last error: '+esc(c.lastError)+'</div>';
  b += '<hr class="sep"><div class="row wrap" style="gap:5px">'+
    '<button class="btn sm bad" data-a="profclear">Clear record</button></div>';
  return modalHTML('<h2>Profile &amp; record</h2>', b,
    '<button class="btn primary" data-a="close">Done</button>', 'style="max-width:560px"');
}