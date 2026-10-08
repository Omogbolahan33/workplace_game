/* Governance fuzz: hammer the register, board, votes, deed, bids, acquisitions. */
const M = require('./sim.js');
try{ M.UI.noAnim = true; }catch(e){}
const bad = [];
const scan = (label, html)=>{ const h=String(html);
  ['undefined','NaN','[object Object]','Infinity','null%'].forEach(t=>{ if(h.includes(t)) bad.push(label+' :: '+t); }); };

const C = {res:0, votes:0, passed:0, lost:0, lobby:0, raises:0, sales:0, acq:0, shotgun:0,
  buyout:0, coup:0, dilute:0, appoint:0, remove:0, deed:0, dd:0, targets:0, bidsWon:0, bidsLost:0,
  divs:0, broken:0, honoured:0, proposals:0, resigned:0, boardFees:0, earnout:0};

const KINDS = ['dividend','raise','sell','acquire','borrow','ceo','expand','audit','deed','dissolve'];
const MODES = ['brief','concede','pay','equity','pressure','favour'];

function drainAmount(v){
  const mo = M.UI.modal;
  if(mo && mo.type==='amount'){ const cb=mo.cb; M.UI.modal=null; if(cb) cb(v!==undefined? v : (mo.def||0)); return true; }
  return false;
}
function resolveModals(){
  let guard=0;
  while(M.UI.modal && guard++ < 25){
    const mo = M.UI.modal;
    try{
      if(mo.type==='event' && mo.ev && mo.ev.opts){ M.ACT.opt({dataset:{i:String(Math.floor(Math.random()*mo.ev.opts.length))}}); continue; }
      if(mo.type==='nego'){ M.ACT.negclose ? M.ACT.negclose() : (M.UI.modal=null); continue; }
      if(mo.type==='negoResult'){ M.ACT.negclose ? M.ACT.negclose() : (M.UI.modal=null); continue; }
      if(mo.type==='govvote'){ if(mo.passed) C.passed++; else C.lost++; M.ACT.close(); continue; }
      if(mo.type==='govappoint'){ M.ACT.pickdir({dataset:{i:String(Math.floor(Math.random()*mo.cands.length))}}); C.appoint++; continue; }
      if(mo.type==='govceo'){ M.ACT.pickceo({dataset:{i:String(Math.floor(Math.random()*mo.cands.length))}}); continue; }
      if(mo.type==='govdeed'){ M.ACT.pickdeed({dataset:{i:String(Math.floor(Math.random()*5))}}); C.deed++; continue; }
      if(mo.type==='govfin'){ M.ACT.pickfin({dataset:{f:['cash','debt','seller','paper'][Math.floor(Math.random()*4)]}}); continue; }
      if(mo.type==='amount'){ const cb=mo.cb; M.UI.modal=null; if(cb) cb(mo.def||0); continue; }
      if(mo.type==='confirm'){ const cb=mo.cb; M.UI.modal=null; if(cb) cb(); continue; }
      if(mo.type==='message'||mo.type==='pending'||mo.type==='year'||mo.type==='result'){ M.ACT.close(); continue; }
      M.UI.modal = null;
    }catch(e){ bad.push('modal '+mo.type+' :: '+e.message); M.UI.modal=null; }
  }
}

for(let seed=1; seed<=30; seed++){
  M.newGame({name:'Ada Okonjo', city:'lagos', profile:'founder', difficulty:'realistic', seed});
  const S = M.getS();
  S.fin.cash = 400000000;
  const types=['retail','food','tech','mfg','logi','proserv','agri','energy','creative'];
  try{
    const t = types[seed % types.length];
    const T = M.BIZ.find(b=>b.id===t);
    M.startBiz(t, 'Holdings '+seed, Math.max(T.min, 60000000), null);
  }catch(e){ bad.push('startBiz :: '+e.message); continue; }
  const b0 = M.getS().biz;
  if(!b0){ bad.push('no biz'); continue; }
  b0.formal = true;
  M.ensureGov(b0);
  // seed some outside money so governance is live
  try{ M.grantPct(b0, 12 + (seed%20), {name:'Seed investor', kind:'investor', board:true, pref:1}); }catch(e){ bad.push('grantPct :: '+e.message); }
  try{ M.formBoard(b0); }catch(e){ bad.push('formBoard :: '+e.message); }

  for(let q=0;q<70;q++){
    const s = M.getS();
    if(s.gameOver) break;
    const b = s.biz;
    try{ scan('viewGovernance/q'+q+'/s'+seed, M.viewGovernance()); }catch(e){ bad.push('viewGovernance :: '+e.message); }
    if(!b) break;

    // ---- board ----
    try{ if(Math.random()<0.14 && M.freeSeats(b)>0){ M.ACT.appointdir(); resolveModals(); } }catch(e){ bad.push('appointdir :: '+e.message); }
    try{ const bd = M.boardOf(b).filter(d=>!d.yours);
      if(bd.length && Math.random()<0.08){ M.ACT.removedir({dataset:{d:bd[Math.floor(Math.random()*bd.length)].id}}); C.remove++; resolveModals(); } }catch(e){ bad.push('removedir :: '+e.message); }

    // ---- resolutions ----
    try{
      const open = M.openResolutions(b);
      if(open.length && Math.random()<0.5){
        const bd = M.boardOf(b).filter(d=>!d.yours);
        const n = 1 + Math.floor(Math.random()*2);
        for(let i=0;i<n && bd.length;i++){
          const d = bd[Math.floor(Math.random()*bd.length)];
          M.ACT.lobby({dataset:{d:d.id, m:MODES[Math.floor(Math.random()*MODES.length)]}});
          C.lobby++;
        }
      }
      if(open.length && Math.random()<0.75){
        const r = open[open.length-1];
        const before = (b.resolutions||[]).length;
        M.ACT.callvote({dataset:{r:r.id}});
        C.votes++;
        if(M.UI.modal && M.UI.modal.type==='govvote'){ if(M.UI.modal.passed) C.passed++; else C.lost++; }
        resolveModals();
      } else if(open.length && Math.random()<0.15){
        M.ACT.withdrawres({dataset:{r:open[0].id}});
      }
      if(Math.random()<0.35){
        const k = KINDS[Math.floor(Math.random()*KINDS.length)];
        M.ACT.tableres({dataset:{k:k}});
        const nb2=M.getS().biz;
        if(nb2 && M.openResolutions(nb2).length > open.length) C.res++;
        resolveModals();
      }
    }catch(e){ bad.push('resolutions :: '+e.message); }

    // ---- deed + shotgun ----
    try{ if(Math.random()<0.06){ M.ACT.amenddeed(); resolveModals(); } }catch(e){ bad.push('amenddeed :: '+e.message); }
    try{
      const ext = M.extHolders(b);
      if(ext.length && Math.random()<0.05 && M.canShotgun(b)){
        M.ACT.shotgun({dataset:{h:ext[0].id}});
        const mo=M.UI.modal;
        if(mo && mo.type==='amount'){ const cb=mo.cb; M.UI.modal=null; if(cb) cb(Math.round((mo.def||1)*[0.7,1.0,1.35][Math.floor(Math.random()*3)])); }
        C.shotgun++;
      }
    }catch(e){ bad.push('shotgun :: '+e.message); }
    try{ if(Math.random()<0.05){ M.ACT.buyoutminority(); resolveModals(); C.buyout++; } }catch(e){ bad.push('buyoutminority :: '+e.message); }

    // ---- inbound bids ----
    try{
      if(Math.random()<0.10 && !(b.inbound||[]).length){ M.genInboundBid(b, true); }
      const ins=(b.inbound||[]).filter(x=>x.status==='live');
      if(ins.length){
        const bd=ins[Math.floor(Math.random()*ins.length)];
        const r=Math.random();
        if(r<0.3){ M.ACT.biddd({dataset:{i:bd.id}}); C.dd++; }
        else if(r<0.5){ M.ACT.bidnego({dataset:{i:bd.id}}); resolveModals(); }
        else if(r<0.75){ M.ACT.bidaccept({dataset:{i:bd.id}}); resolveModals(); }
        else { M.ACT.bidreject({dataset:{i:bd.id}}); }
      }
    }catch(e){ bad.push('inbound :: '+e.message); }

    // ---- outbound ----
    try{
      M.refreshTargets();
      const ts=(M.getS().mkt.targets||[]);
      if(ts.length) C.targets++;
      const t=ts[Math.floor(Math.random()*Math.max(1,ts.length))];
      if(t && Math.random()<0.4){
        if(!t.dd && Math.random()<0.5){ M.ACT.tgtdd({dataset:{i:t.id}}); }
        else { M.ACT.tgtbid({dataset:{i:t.id}}); resolveModals(); }
      }
    }catch(e){ bad.push('outbound :: '+e.message); }

    // ---- dividend ----
    try{ if(Math.random()<0.06 && (b.cash||0)>5000000){ M.declareDividend(b, Math.round((b.cash||0)*0.2)); C.divs++; resolveModals(); } }catch(e){ bad.push('dividend :: '+e.message); }

    resolveModals();
    try{ M.ACT.advance(); }catch(e){ bad.push('advance :: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,6).join('\n')); break; }
    resolveModals();

    // tallies
    const bb = M.getS().biz;
    if(bb){
      ((bb.undertakings)||[]).forEach(u=>{ if(u.broken) C.broken++; else if(u.done) C.honoured++; });
      if(bb.founderOusted) C.coup++;
      if(bb.rounds && bb.rounds.length) C.raises = Math.max(C.raises, bb.rounds.length);
      if((bb.inbound||[]).some(x=>x.status==='done')) C.sales++;
    }
    if(M.getS().flags && M.getS().flags.soldBiz) C.sales++;
    if(M.getS().flags && M.getS().flags.shotgunned) C.shotgun++;
  }
}

// ---- summary ----
console.log('--- GOVERNANCE PROBE (30 runs, 70 quarters) ---');
console.log('resolutions tabled :', C.res, '| votes called:', C.votes, '| carried:', C.passed, '| lost:', C.lost);
console.log('lobbying attempts  :', C.lobby, '| directors appointed:', C.appoint, '| removed:', C.remove);
console.log('deed amendments    :', C.deed, '| shotguns:', C.shotgun, '| minority buyouts:', C.buyout);
console.log('diligence passes   :', C.dd, '| targets seen:', C.targets, '| distributions:', C.divs);
console.log('promises           : honoured', C.honoured, '| broken', C.broken);
console.log('coups survived/not :', C.coup, '| exits:', C.sales);
console.log(bad.length ? ('GOV ISSUES ('+bad.length+'):\n'+[...new Set(bad)].slice(0,30).join('\n')) : 'GOVERNANCE CLEAN');
