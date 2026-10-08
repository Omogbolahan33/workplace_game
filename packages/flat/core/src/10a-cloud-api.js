/* ── The API layer ─────────────────────────────────────────────────────────
   Every request this game makes, and nothing else. There is no service of ours:
   a player points the game at their own Supabase project, and these are the two
   APIs they are buying — PostgREST (the REST API generated over the three
   tables) and GoTrue (Supabase's auth service). Both are reached through the
   host's `fetch`, so the phone hands them to its own networking stack.

   | what | method and path | body |
   |---|---|---|
   | create an account | POST /auth/v1/signup | {email, password} |
   | sign in | POST /auth/v1/token?grant_type=password | {email, password} |
   | stay signed in | POST /auth/v1/token?grant_type=refresh_token | {refresh_token} |
   | upload the save | POST /rest/v1/profiles?on_conflict=id | [{id, user_id, data, updated_at}] |
   | download the save | GET /rest/v1/profiles?select=data&id=eq.{profile} | — |
   | publish a season | POST /rest/v1/seasons | {code, config} |
   | read a season | GET /rest/v1/seasons?code=eq.{code}&select=config | — |
   | submit a run | POST /rest/v1/season_runs | {code, player, total, score} |
   | the board | GET /rest/v1/season_runs?code=eq.{code}&select=…&order=total.desc | — |

   All of it is absolute: `{url}/rest/v1/…` and `{url}/auth/v1/…` are built from
   the project URL in Settings, so there is no base-URL constant and no place to
   point this at anything the player did not name. Two headers carry the whole
   session — `apikey` (the project's anon key, public by design) and
   `Authorization: Bearer <token>`. Writes carry
   `Prefer: resolution=merge-duplicates,return=minimal`, which is what makes
   every one of them an upsert.

   What is *not* here is as much of the point: the game plays a whole career
   without a single call, `cloudReady()` is false until a player supplies a URL,
   a key and a token, and `tests/unit/boundary.test.js` locks this surface — a
   seventh endpoint is a failing test, not a surprise.

   Configuration lives on the profile (`cloudCfg()`); the credentials themselves
   are read out of the form at the moment of signing in and never stored.
   ────────────────────────────────────────────────────────────────────────── */


const CLOUD_SQL =
"create table if not exists profiles (\n"+
"  id           text primary key,\n"+
"  user_id      uuid not null references auth.users on delete cascade,\n"+
"  data         jsonb not null,\n"+
"  updated_at   timestamptz not null default now()\n"+
");\n"+
"alter table profiles enable row level security;\n"+
"create policy \"own_profile\" on profiles\n"+
"  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);\n"+
"\n"+
"-- seasons: a finish line fixed in advance, shared by everyone who joins\n"+
"create table if not exists seasons (\n"+
"  code        text primary key,\n"+
"  config      jsonb not null,\n"+
"  created_by  uuid not null default auth.uid(),\n"+
"  created_at  timestamptz not null default now()\n"+
");\n"+
"alter table seasons enable row level security;\n"+
"create policy \"seasons_read\"   on seasons for select using (true);\n"+
"create policy \"seasons_insert\" on seasons for insert with check (auth.uid() = created_by);\n"+
"create policy \"seasons_update\" on seasons for update using (auth.uid() = created_by);\n"+
"\n"+
"-- one entry per player per season; re-submitting updates theirs and only theirs\n"+
"create table if not exists season_runs (\n"+
"  id           bigserial primary key,\n"+
"  code         text not null references seasons(code) on delete cascade,\n"+
"  user_id      uuid not null default auth.uid(),\n"+
"  player       text not null,\n"+
"  total        int  not null,\n"+
"  score        jsonb not null,\n"+
"  submitted_at timestamptz not null default now(),\n"+
"  unique (code, user_id)\n"+
");\n"+
"alter table season_runs enable row level security;\n"+
"create policy \"runs_read\"   on season_runs for select using (true);\n"+
"create policy \"runs_insert\" on season_runs for insert with check (auth.uid() = user_id);\n"+
"create policy \"runs_update\" on season_runs for update using (auth.uid() = user_id);";
/* ---------------------------------------------------------------------------
   Season sync. Deliberately not export/import: a score that leaves the device
   as a file is a score anybody can edit, and the standing rule here is that
   portability is sync, never a file. Every call is best-effort and
   offline-safe — a season must be fully playable with no network, and the
   only thing that degrades is seeing other people's scores.
   --------------------------------------------------------------------------- */
function seasonUrl(path){
  const c = cloudCfg();
  return (c.url || '').replace(/\/+$/, '') + '/rest/v1/' + path;
}
async function seasonPublish(cfg){
  if(!cloudReady()) return false;
  try{
    const r = await fetch(seasonUrl('seasons'), {
      method:'POST', headers: cloudHeaders('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify({ code: cfg.code,
        config: { name:cfg.name, endYear:cfg.endYear, endQ:cfg.endQ, seed:cfg.seed,
                  city:cfg.city, profile:cfg.profile, difficulty:cfg.difficulty } })
    });
    return r.ok;
  }catch(e){ return false; }
}
async function seasonFetchAsync(code){
  if(!cloudReady() || !code) return null;
  try{
    const r = await fetch(seasonUrl('seasons?code=eq.' + encodeURIComponent(code) + '&select=config'),
      { headers: cloudHeaders() });
    if(!r.ok) return null;
    const j = await r.json();
    return (j && j[0] && j[0].config) ? j[0].config : null;
  }catch(e){ return null; }
}
/* Submitted once, at the end. Upsert on (code, user_id) so nobody can quietly
   hold two places on the board. */
async function seasonSubmit(){
  const s = S.season; if(!s || !cloudReady()) return false;
  try{
    const sc = scoreRun();
    const r = await fetch(seasonUrl('season_runs'), {
      method:'POST', headers: cloudHeaders('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify({ code:s.code, player:S.name || 'Anonymous',
        total:sc.total, score:{ total:sc.total, pct:sc.pct, axes:sc.axes, rank:sc.rank } })
    });
    if(r.ok) S._submitted = s.code;
    return r.ok;
  }catch(e){ return false; }
}
async function seasonLeaderboard(code){
  if(!cloudReady() || !code) return [];
  try{
    const r = await fetch(seasonUrl('season_runs?code=eq.' + encodeURIComponent(code) +
      '&select=player,total,score,submitted_at&order=total.desc'), { headers: cloudHeaders() });
    if(!r.ok) return [];
    return await r.json();
  }catch(e){ return []; }
}
/* Fetched out-of-band and cached, because a view function has to return
   immediately — it cannot await a network call in the middle of a render.
   _lbFor is the loop guard: once this code's board has been fetched it is not
   fetched again, so the re-render it triggers does not trigger another. */
function seasonRefreshLeaderboard(code){
  if(!code || !cloudReady()) return;
  if(S._lbFor === code) return;
  S._lbFor = code;
  seasonLeaderboard(code).then(function(list){
    S._lb = list || [];
    if(UI.tab === 'legacy' && UI.sub === 'season') render();
  }).catch(function(){ S._lb = []; });
}
function cloudCfg(){ return ensureProfile().cloud || {}; }
function cloudReady(){ const c = cloudCfg(); return !!(c.url && c.key && c.token); }
function cloudHeaders(prefer){
  const c = cloudCfg();
  const h = {apikey:c.key, 'Content-Type':'application/json'};
  if(c.token) h['Authorization'] = 'Bearer '+c.token;
  if(prefer) h['Prefer'] = prefer;
  return h;
}
/* Credentials are read straight out of the form so the password is never
   written to storage and never survives a re-render. */
function cloudReadForm(){
  const c = cloudCfg();
  const g = function(id){ const el = Q(id); return el ? String(el.value||'').trim() : ''; };
  c.url = g('pUrl'); c.key = g('pKey'); c.email = g('pMail');
  return {url:c.url, key:c.key, email:c.email, password:g('pPw')};
}
async function cloudAuth(mode){
  const f = cloudReadForm(), c = cloudCfg();
  if(!f.url || !f.key){ toast('Add your project URL and anon key first.'); return false; }
  if(!f.email || !f.password){ toast('Enter an email and a password.'); return false; }
  saveProfile();
  try{
    const base = f.url.replace(/\/+$/,'');
    const url  = base + (mode==='signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password');
    const res  = await fetch(url, {method:'POST', headers:cloudHeaders(null),
                  body: JSON.stringify({email:f.email, password:f.password})});
    const j = await res.json().catch(function(){ return null; });
    if(!res.ok || !j || !j.access_token){
      const msg = (j && (j.msg || j.error_description || j.message)) || ('HTTP '+res.status);
      c.lastError = String(msg); saveProfile();
      toast('Sign in failed: '+msg, 4500); render();
      return false;
    }
    c.token = j.access_token;
    c.refresh = j.refresh_token || '';
    c.expires = Date.now() + ((j.expires_in||3600)*1000);
    c.userId = (j.user && j.user.id) || c.userId || '';
    c.lastError = ''; saveProfile();
    toast(mode==='signup' ? 'Account created and signed in.' : 'Signed in.', 2600);
    render();
    return true;
  }catch(err){
    c.lastError = String((err && err.message) || err);
    saveProfile();
    toast('Could not reach the backend: '+c.lastError, 4500); render();
    return false;
  }
}
function cloudLogout(){
  const c = cloudCfg();
  c.token=''; c.refresh=''; c.userId=''; c.lastSync=null; c.lastError='';
  saveProfile();
  toast('Signed out. Your record stays on this device.'); render();
}
async function cloudPush(){
  if(!cloudReady()){ toast('Sign in first.'); return false; }
  const c = cloudCfg(), pr = ensureProfile();
  try{
    const res = await fetch(c.url.replace(/\/+$/,'')+'/rest/v1/profiles?on_conflict=id',
      {method:'POST', headers:cloudHeaders('resolution=merge-duplicates,return=minimal'),
       body: JSON.stringify([{id:pr.id, user_id:c.userId, data:pr, updated_at:new Date().toISOString()}])});
    if(!res.ok){ const t = await res.text().catch(function(){ return ''; });
      throw new Error('HTTP '+res.status+' '+String(t).slice(0,120)); }
    c.lastSync = new Date().toISOString(); c.lastError=''; saveProfile();
    toast('Record uploaded.'); render(); return true;
  }catch(err){
    c.lastError = String((err && err.message) || err); saveProfile();
    toast('Upload failed: '+c.lastError, 4500); render(); return false;
  }
}
/* Automatic sync. The game is local-first: it never waits on the network and
   never fails because of it. If a session exists, the record is pulled and
   pushed in the background; if anything goes wrong the device copy simply
   carries on and the next successful sync merges the two. */

function cloudConfigured(){ const c = cloudCfg(); return !!(c.url && c.key); }
function cloudSessionValid(){
  const c = cloudCfg();
  if(!c.token) return false;
  if(!c.expires) return true;                 // older sessions: assume live
  return Date.now() < c.expires - 60000;      // refresh a minute early
}
async function cloudRefresh(){
  const c = cloudCfg();
  if(!c.refresh || !c.url || !c.key) return false;
  try{
    const res = await fetch(c.url.replace(/\/+$/,'')+'/auth/v1/token?grant_type=refresh_token',
      {method:'POST', headers:cloudHeaders(null), body: JSON.stringify({refresh_token:c.refresh})});
    const j = await res.json().catch(function(){ return null; });
    if(!res.ok || !j || !j.access_token) return false;
    c.token = j.access_token;
    c.refresh = j.refresh_token || c.refresh;
    c.expires = Date.now() + ((j.expires_in||3600)*1000);
    c.userId = (j.user && j.user.id) || c.userId || '';
    saveProfile(); return true;
  }catch(e){ return false; }
}
async function cloudPullQuiet(){
  if(!cloudReady()) return false;
  const c = cloudCfg();
  try{
    const res = await fetch(c.url.replace(/\/+$/,'')+
      '/rest/v1/profiles?select=data&id=eq.'+encodeURIComponent(ensureProfile().id),
      {method:'GET', headers:cloudHeaders(null)});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const rows = await res.json().catch(function(){ return []; });
    if(rows && rows.length && rows[0].data){
      PROF = mergeProfiles(ensureProfile(), rows[0].data);
      c.lastSync = new Date().toISOString(); c.lastError = '';
      saveProfile();
      return true;
    }
    return false;
  }catch(err){
    c.lastError = String((err && err.message) || err); saveProfile(); return false;
  }
}
async function cloudPushQuiet(){
  if(!cloudReady()) return false;
  const c = cloudCfg(), pr = ensureProfile();
  try{
    const res = await fetch(c.url.replace(/\/+$/,'')+'/rest/v1/profiles?on_conflict=id',
      {method:'POST', headers:cloudHeaders('resolution=merge-duplicates,return=minimal'),
       body: JSON.stringify([{id:pr.id, user_id:c.userId, data:pr, updated_at:new Date().toISOString()}])});
    if(!res.ok) throw new Error('HTTP '+res.status);
    c.lastSync = new Date().toISOString(); c.lastError = ''; saveProfile();
    return true;
  }catch(err){
    c.lastError = String((err && err.message) || err); saveProfile(); return false;
  }
}
async function cloudPull(){
  if(!cloudReady()){ toast('Sign in first.'); return false; }
  const c = cloudCfg();
  try{
    const res = await fetch(c.url.replace(/\/+$/,'')+'/rest/v1/profiles?select=data&id=eq.'+
      encodeURIComponent(ensureProfile().id), {method:'GET', headers:cloudHeaders(null)});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const rows = await res.json().catch(function(){ return []; });
    if(!rows || !rows.length){ toast('Nothing on the server yet — upload first.'); render(); return false; }
    PROF = mergeProfiles(ensureProfile(), rows[0].data);
    PROF.cloud = Object.assign(cloudCfg(), {});
    c.lastSync = new Date().toISOString(); c.lastError='';
    saveProfile();
    toast('Record downloaded and merged.'); render(); return true;
  }catch(err){
    c.lastError = String((err && err.message) || err); saveProfile();
    toast('Download failed: '+c.lastError, 4500); render(); return false;
  }
}
