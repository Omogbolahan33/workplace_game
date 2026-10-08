
function ensureProfile(){ if(!PROF) loadProfile(); if(!PROF) PROF = blankProfile(); return PROF; }
function profReset(){ PROF = blankProfile(); saveProfile(); return PROF; }

/* ---------------- what a finished run was actually worth ---------------- */
function runQuality(r){
  const free   = clamp(r.freedom||0, 0, 100);
  const wealth = clamp(Math.log10(Math.max(1, r.nwReal||0)/1000000)*22 + 42, 0, 100);
  const tot    = (r.dec && r.dec.total) || 0;
  const dsc    = tot ? ((r.dec.good||0) - (r.dec.bad||0)*0.7)/tot : 0;
  const decis  = clamp(50 + dsc*45, 0, 100);
  const surv   = r.reason==='retire' ? 80 : r.reason==='bankrupt' ? 16 : 34;
  const dw     = r.difficulty==='hardcore' ? 1.24 : r.difficulty==='apprentice' ? 0.76 : 1.0;
  const q      = free*0.34 + wealth*0.30 + decis*0.20 + surv*0.16;
  return clamp(q * (0.90 + (dw-0.76)*0.40), 0, 100);
}
/* Recency-weighted, and pulled toward the middle while the evidence is thin.
   Three runs should not convince the game you are a master. */
function skillRating(p){
  const runs = ((p||PROF||{}).runs||[]).slice(-24);
  if(!runs.length) return null;
  let num=0, den=0;
  runs.forEach(function(r,i){ const w = Math.pow(1.16, i); num += runQuality(r)*w; den += w; });
  const n = runs.length, conf = n/(n+3.5);
  return clamp((num/den)*conf + 45*(1-conf), 0, 100);
}
function skillBand(sk){
  if(sk===null) return {label:'No record yet', tone:'muted',
    note:'The game will take you at face value until it has seen you play.'};
  if(sk<32) return {label:'Finding your feet', tone:'good',
    note:'Shocks are being eased and failures softened while you learn the machine.'};
  if(sk<46) return {label:'Competent', tone:'good',
    note:'Close to baseline. Very little is being adjusted.'};
  if(sk<60) return {label:'Seasoned', tone:'warn',
    note:'You are being tested a little harder each quarter.'};
  if(sk<74) return {label:'Veteran', tone:'bad',
    note:'Shocks land harder and failure is more likely to stick.'};
  return {label:'Master', tone:'bad',
    note:'The game is pressing as hard as this tier allows.'};
}
/* The challenge index is the whole answer to "the hardest tier is no longer
   hard". It is derived from your record, it starts at zero for an average
   player, and it does not stop at a number someone picked in advance. A
   rating of 95 produces roughly three times the pressure a rating of 45 does.
   Nothing here has a ceiling except the mechanics that would simply break the
   economy if they ran away. */
function challengeIndex(skill){
  if(skill===null) return 0;
  /* Negative is deliberate: a player who is struggling gets the pressure taken
     off, not merely held steady. The floor stops it turning into a different game. */
  return clamp((skill - 42)/9, -2.2, 8);
}
/* Amplitude: how much of that index a given tier actually applies. The teaching
   tier barely moves. Adaptive over-applies it, deliberately — that is the tier
   for someone who has run out of road everywhere else. */
function tierAmp(key){
  return key==='apprentice' ? 0.35 : key==='realistic' ? 0.70 :
         key==='adaptive'   ? 1.35 : 1.00;
}
function computeTune(skill, diffKey){
  const base = DIFFS[diffKey] || DIFFS.realistic;
  const s    = (skill===null ? 42 : skill);
  const ci   = challengeIndex(s);
  const amp  = tierAmp(base.key);
  const t    = ci * amp;
  return {
    skill: skill===null ? null : Math.round(skill),
    tier:  base.key,
    ci:    Math.round(ci*10)/10,
    amp:   amp,
    /* shock and failure carry the challenge and are allowed to run */
    shock: 1 + 0.16*t,
    fail:  Math.min(2.4,  1 + 0.13*t),
    /* inflation and pay are floored - past a point they stop being difficulty
       and start being arithmetic */
    infl:  Math.min(1.75, 1 + 0.05*t),
    pay:   Math.max(0.55, 1 - 0.045*t),
    /* pressure that is different in kind, not just bigger numbers */
    talent: Math.min(2.0, 1 + 0.10*t),   // good people get expensive and scarce
    heat:   Math.min(2.2, 1 + 0.12*t)    // creditors, inspectors and the state close in
  };
}
function challengeLabel(t){
  if(!t) return 'Baseline';
  const ci = t.ci||0;
  if(ci < 0.4) return 'Eased';
  if(ci < 1.5) return 'Baseline';
  if(ci < 2.8) return 'Pressing';
  if(ci < 4.2) return 'Hard';
  if(ci < 5.8) return 'Relentless';
  return 'Beyond measure';
}

/* ------------------------- writing a run into history --------------------- */
function captureRun(reason){
  ensureProfile();
  const d = recompute(), f = finalReport();
  const nwReal = Math.round(d.nw/Math.max(0.01, S.cumInfl));
  const marks = (S.journal||[])
    .filter(function(j){ return j.kind==='good' || j.kind==='bad'; })
    .slice(0,60)
    .filter(function(j){ return (j.text||'').length > 24; })
    .slice(0,5)
    .map(function(j){ return {d:j.date||'', t:(j.text||'').slice(0,170), k:j.kind}; });
  let staffN = 0;
  bizList().forEach(function(b){ staffN += (b.staff||[]).length; });
  const rec = {
    id:'r'+Date.now().toString(36)+Math.floor(Math.random()*1679616).toString(36),
    ended:new Date().toISOString(),
    name:S.name, seed:S.seed, profile:S.profile, difficulty:S.difficulty,
    reason:reason, years:Math.round(S.turn/4*10)/10, turns:S.turn, age:S.p.age,
    nw:Math.round(d.nw), nwReal:nwReal,
    cash:Math.round(S.fin.cash), assets:Math.round(d.assets),
    biz:Math.round(d.biz), debt:Math.round(d.debt),
    freedom:Math.round(f.freedom), rank:f.rank, epitaph:f.epitaph,
    health:Math.round(S.p.health), stress:Math.round(S.p.stress),
    happy:Math.round(S.p.happy), family:Math.round(S.p.family), rep:Math.round(S.p.rep),
    dec:{good:f.good, bad:f.bad, neutral:f.neutral, total:f.good+f.bad+f.neutral},
    best:(f.best||[]).map(function(x){ return {d:x.date, t:x.title, c:x.choice}; }),
    worst:(f.worst||[]).map(function(x){ return {d:x.date, t:x.title, c:x.choice}; }),
    marks:marks,
    companies:bizList().length, staff:staffN, household:(S.house||[]).length,
    tune:S.tune ? {skill:S.tune.skill, shock:Math.round(S.tune.shock*100)/100,
                   fail:Math.round(S.tune.fail*100)/100} : null
  };
  rec.quality = Math.round(runQuality(rec));
  return rec;
}
function appendRun(rec){
  const p = ensureProfile();
  const prevSkill = skillRating(p);
  p.runs.push(rec);
  if(p.runs.length > MAX_RUNS) p.runs = p.runs.slice(-MAX_RUNS);
  saveProfile();
  return {rec:rec, prevSkill:prevSkill===null?null:Math.round(prevSkill),
          newSkill:(function(){ const s=skillRating(p); return s===null?null:Math.round(s); })(),
          best: rec.nwReal >= p.runs.slice(0,-1).reduce(function(a,r){ return Math.max(a,r.nwReal||0); }, 0),
          first: p.runs.length===1};
}

/* -------------------- taking the record with you -------------------------
   Local-first. The record lives on this device and works with nothing else
   configured. Everything below is additive: a file if you want to carry it,
   or a backend if you want it to follow you. Neither is required. */
function exportProfile(){ return JSON.stringify(ensureProfile()); }
function importProfile(str){
  try{
    const p = JSON.parse(str);
    if(!p || p.v!==1 || !Array.isArray(p.runs)) throw new Error('not a profile');
    PROF = mergeProfiles(ensureProfile(), p);
    saveProfile();
    return true;
  }catch(e){ toast('That file is not a valid LEDGER profile.'); return false; }
}
/* Union by run id. The newer copy of a run wins. Whichever side was created
   first keeps the created date, so a merge never rewrites your history. */
function mergeProfiles(local, remote){
  if(!remote || remote.v!==1) return local;
  const merged = Object.assign({}, local);
  const byId = {};
  merged.runs = (local.runs||[]).slice();
  merged.runs.forEach(function(r){ if(r && r.id) byId[r.id] = r; });
  (remote.runs||[]).forEach(function(r){
    if(!r || !r.id) return;
    const have = byId[r.id];
    if(!have){ merged.runs.push(r); byId[r.id] = r; }
    else if(String(r.ended||'') > String(have.ended||'')){
      const i = merged.runs.indexOf(have);
      if(i>=0){ merged.runs[i] = r; byId[r.id] = r; }
    }
  });
  merged.runs.sort(function(a,b){ return String(a.ended||'').localeCompare(String(b.ended||'')); });
  if(merged.runs.length > MAX_RUNS) merged.runs = merged.runs.slice(-MAX_RUNS);
  if(!merged.handle && remote.handle) merged.handle = remote.handle;
  if(String(remote.created||'') < String(merged.created||'')) merged.created = remote.created;
  return merged;
}