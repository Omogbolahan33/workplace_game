require('./dom.js');
const M = require('./sim.js');
try{ M.UI.noAnim = true; }catch(e){}
let bad=[];
function scan(label, html){
  if(html===undefined||html===null) return bad.push(label+' :: undefined html');
  const h=String(html);
  ['undefined','NaN','[object Object]','null%','Infinity','function ()'].forEach(t=>{
    if(h.includes(t)) bad.push(label+' :: contains "'+t+'"');
  });
}
const views=['viewDash','viewPeople','viewDeals','viewWork','viewInvest','viewMoney','viewLegacy','viewLedger','viewGroup','viewGovernance'];
for(const city of ['lagos','abuja','accra','nairobi','ldn','nyc']){
 for(const prof of ['grad','corp','founder','trader','returnee']){
  for(const diff of ['apprentice','realistic','brutal','hardcore']){
    M.newGame({name:'Ada Okonjo',city,profile:prof,difficulty:diff, seed: 4242 });
    // run a while so biz / cast / threads get populated
    for(let q=0;q<40;q++){ const S=M.getS(); if(S.gameOver) break; M.ACT.advance(); M.UI.modal=null; }
    if(M.getS().gameOver) continue;
    const S=M.getS();
    /* Scan the no-business state BEFORE forcing a company into existence.
       Every previous scan created a business first, so the one state that
       shows the "start a company" cards was never looked at - and that is
       where a NaN hid: the Work tab priced each business from BIZ.startCost,
       a field that does not exist, so a broke player was offered ten
       companies at "NaN" each. */
    if(!S.biz){
      for(const v of ['viewWork','viewBiz']){
        if(typeof M[v] !== 'function') { bad.push(v + ' :: not exported to this gate'); continue; }
        try{ scan(v+'/nobiz/'+city+'/'+prof+'/'+diff, M[v]()); }catch(e){ bad.push(v+'/nobiz :: '+e.message); }
      }
    }
    // force a business so viewWork has both halves
    if(!S.biz){ try{ M.startBiz('retail', null, Math.round(3000000*(M.getS().cumInfl||1)), null); }catch(e){ bad.push('startBiz :: '+e.message); } }
    for(const v of views){
      try{ scan(v+'/'+city+'/'+prof+'/'+diff, M[v]()); }catch(e){ bad.push(v+' :: '+e.message); }
    }
    for(const md of ['helpModal','settingsModal','yearModal']){
      try{ scan(md, M[md]()); }catch(e){ bad.push(md+' :: '+e.message); }
    }
    try{ M.renderStart(); }catch(e){ bad.push('renderStart :: '+e.message); }
    try{ M.renderModal(); }catch(e){ bad.push('renderModal :: '+e.message); }
  }
 }
}
// modals in various states
M.newGame({name:'X',city:'lagos',profile:'founder',difficulty:'realistic', seed: 4242 });
for(let q=0;q<30;q++){ if(M.getS().gameOver) break; M.ACT.advance(); if(M.UI.modal && M.UI.modal.type==='event'){
  // exercise every option
  const ev=M.UI.modal.ev; if(ev&&ev.opts) for(let i=0;i<ev.opts.length;i++){ try{ M.resolveOption(ev, ev.opts[i]); }catch(e){ bad.push('opt '+i+' :: '+e.message); } }
} M.UI.modal=null; }
try{ M.getS().gameOver=true; M.endGame('retire'); scan('endModal', M.endModal()); }catch(e){ bad.push('endModal :: '+e.message); }
console.log(bad.length? ('RENDER ISSUES ('+bad.length+'):\n'+[...new Set(bad)].slice(0,40).join('\n')) : 'RENDER CLEAN');
