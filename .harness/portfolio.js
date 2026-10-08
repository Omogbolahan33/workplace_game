const M = require('./sim.js');
try{ M.UI.noAnim = true; }catch(e){}
const bad = [];
const scan = (label, html)=>{ const h=String(html); ['undefined','NaN','[object Object]','Infinity'].forEach(t=>{ if(h.includes(t)){ const i=h.indexOf(t); bad.push(label+' :: '+t+' :: '+JSON.stringify(h.slice(Math.max(0,i-240), i+180))); } }); };
let negoDeals=0, negoWalks=0, negoImp=0, contractsWon=0, outletsOpened=0, bizStarted=0, staffHired=0, trained=0;

for(let seed=1; seed<=25; seed++){
  M.newGame({name:'T',city:'lagos',profile:'founder',difficulty:'realistic',seed});
  const S = M.getS(); S.fin.cash = 120000000;
  const types=['retail','food','tech','mfg','logi','proserv','agri','energy','creative'];
  const n = 1 + (seed % 3);
  for(let i=0;i<n;i++){
    try{ const t=types[(seed+i)%types.length]; const T=M.BIZ.find(b=>b.id===t);
      M.startBiz(t, 'Co '+(i+1), Math.max(T.min, 12000000), null); bizStarted++; }catch(e){ bad.push('startBiz: '+e.message); }
  }
  for(let q=0;q<80;q++){
    const s = M.getS(); if(s.gameOver) break;
    // resolve whatever modal is up
    let guard=0;
    while(M.UI.modal && guard++ < 12){
      const mo = M.UI.modal;
      if(mo.type==='event' && mo.ev.opts){ M.ACT.opt({dataset:{i:String(Math.floor(Math.random()*mo.ev.opts.length))}}); continue; }
      if(mo.type==='nego'){
        const opts = M.negoTacticButtons();
        const ids = [...opts.matchAll(/data-t="([a-z]+)"(?: data-m="([a-z]+)")?/g)];
        if(!ids.length){ M.ACT.negclose(); continue; }
        const pick = ids[Math.floor(Math.random()*ids.length)];
        M.ACT.negtactic({dataset:{t:pick[1], m:pick[2]}});
        continue;
      }
      if(mo.type==='negoResult'){
        const r = mo.res;
        if(r.status==='deal') negoDeals++; else if(r.status==='walked') negoWalks++; else negoImp++;
        M.ACT.negclose(); continue;
      }
      if(mo.type==='confirm'){ M.ACT.okconfirm(); continue; }
      if(mo.type==='amount'){ M.ACT.okamount(); continue; }
      M.UI.modal = null;
    }
    // business management actions
    const b = M.getS().biz;
    if(b){
      try{
        // outlets
        if(Math.random()<0.10 && b.outlets.length<4 && b.cash>20000000){ if(M.openOutlet(b,{city:Math.random()<0.4?'abuja':'lagos'})) outletsOpened++; }
        if(Math.random()<0.05) M.upgradeOutlet(b, b.outlets[Math.floor(Math.random()*b.outlets.length)].id);
        if(Math.random()<0.08) M.maintainOutlet(b, b.outlets[0].id, Math.round(Math.max(200000,b.cash*0.02)));
        if(Math.random()<0.03 && b.outlets.length>1) M.closeOutlet(b, b.outlets[b.outlets.length-1].id);
        // bids
        (b.offersC||[]).slice().forEach(o=>{ if(Math.random()<0.6){ M.ACT.bid({dataset:{o:o.id, v:['full','five','ten','twenty','thirty'][Math.floor(Math.random()*5)]}}); } });
        // staff
        if(Math.random()<0.18 && (S.candidates||[]).length){ const c=S.candidates[0]; M.startNego({kind:'money',ctxLabel:'Hire',title:'t',other:c.name,metric:{low:Math.round(c.salary*0.85),high:c.ask,you:Math.round(c.salary*0.9),them:c.ask},onDeal:function(v){ c.salary=Math.round(v); var bb=M.getS().biz; if(bb){ (bb.staff=bb.staff||[]).push(c); staffHired++; } }}); }
        (b.staff||[]).slice(0,2).forEach(st=>{
          if(Math.random()<0.05) M.ACT.raisenego({dataset:{s:st.id}});
          if(Math.random()<0.03) M.ACT.firenego({dataset:{s:st.id}});
          if(Math.random()<0.05) { const r=M.trainStaff(b, st.id, 1); if(r) trained++; }
          if(Math.random()<0.03 && st.skill>=6) M.promoteGM(b, st.id);
        });
        (b.contracts||[]).slice(0,1).forEach(c=>{ if(c.turns<=1 && Math.random()<0.5) M.renewContract(b, c); });
        // switch company
        if(Math.random()<0.15){ const list=M.bizList(); if(list.length>1) M.ACT.switchbiz({dataset:{b:list[Math.floor(Math.random()*list.length)].id}}); }
      }catch(e){ bad.push('mgmt: '+e.message); }
    }
    // start another company sometimes
    if(Math.random()<0.02 && M.bizList().length<4 && M.getS().fin.cash>40000000){
      try{ const t=types[Math.floor(Math.random()*types.length)]; const T=M.BIZ.find(x=>x.id===t);
        M.startAnotherBiz(t,'Extra',Math.max(T.min,10000000),null); bizStarted++; }catch(e){ bad.push('another: '+e.message); }
    }
    // render everything
    for(const v of ['viewWork','viewDash','viewPeople','viewDeals']) { try{ scan(v, M[v]()); }catch(e){ bad.push(v+': '+e.message); } }
    M.ACT.advance();
  }
}
console.log('companies started :', bizStarted);
console.log('outlets opened    :', outletsOpened);
console.log('staff hired       :', staffHired, '| training courses:', trained);
console.log('negotiations      : deals', negoDeals, '| walks', negoWalks, '| impasse', negoImp);
console.log(bad.length ? ('ISSUES ('+bad.length+'):\n'+[...new Set(bad)].slice(0,15).join('\n')) : 'PORTFOLIO CLEAN');
