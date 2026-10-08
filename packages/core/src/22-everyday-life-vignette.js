

/* =========================================================================
   Section 15: Everyday life — the vignette
   ========================================================================= */
function makeVignette(){
  const m = S.mkt, p = S.p, b = S.biz;
  const pool = [];
  const add = (w, cond, fn)=>{ if(!cond || cond(S)) pool.push({w:w, t:fn}); };
  add(1.4, s=>s.mkt.power<45, ()=>'The grid took light on Tuesday and returned it on Sunday. You ran the generator for eleven hours and watched the fuel gauge the way other people watch a heart monitor.');
  add(1.3, ()=>true, ()=>'Third Mainland Bridge, 6:40pm. Two podcasts, four kilometres, one profound reconsideration of your life choices.');
  add(1.2, s=>s.mkt.infl>0.2, ()=>'A bag of rice cost more this month than last. Nobody announced it. It simply did, and the woman at the shop did not apologise.');
  add(1.1, s=>s.biz && s.biz.profit>0, ()=>'You closed the books and for the first time the numbers looked like a business rather than an expensive hobby. You did not tell anyone. You just sat with it for a while.');
  add(1.1, s=>s.biz && s.biz.profit<0, ()=>'Another quarter, another month where the business ate money and asked for more. You ran the numbers twice, hoping for an arithmetic error. There was not one.');
  add(1.0, s=>s.fin.cash < s.fin.budget.housing, ()=>'You checked your balance three times in one morning, as though the third reading might be friendlier than the first two.');
  add(1.0, s=>s.p.stress>65, ()=>'You woke at 4am fully alert, running through a list of problems that had not changed since yesterday.');
  add(0.9, s=>s.biz && s.biz.staff.length>0, ()=>'Someone arrived forty minutes late with a story that was almost good enough. You let it go, because replacing them would cost more than the forty minutes.');
  add(0.9, ()=>true, ()=>'Three wedding invitations arrived in the same week. Someone in your circle has decided that this is the season.');
  add(0.9, s=>s.mkt.usd/s.mkt.usdPrev>1.03, ()=>'The currency moved and your supplier sent a new price list with no apology and no explanation. That is how you know it was significant.');
  add(0.8, ()=>true, ()=>'Your mother called. She did not need anything. She called again on Sunday and did.');
  add(0.8, s=>s.p.health>78 && s.p.stress<45, ()=>'You slept seven hours, twice in one week, and discovered what everyone had been telling you for years.');
  add(0.8, s=>S.p.kids>0, ()=>'Your child asked a question you had no answer to, and then a second one you did. Parenthood is mostly this.');
  add(0.7, s=>s.biz && s.biz.rep>70, ()=>'A customer you have never met recommended you to a stranger. Nobody told you. You found out from an order.');
  add(0.7, s=>s.p.married, ()=>'You and your partner had the money conversation. It went better than last time because this time you brought numbers.');
  add(0.7, ()=>true, ()=>'Everyone you know is doing one of three things: getting married, leaving the country, or starting something theydescribe differently every month.');
  add(0.6, s=>s.assets.length>2, ()=>'You opened the investment app on a red day, which you had promised yourself not to do, and then closed it again, which is progress.');
  add(0.6, s=>s.mkt.power>75, ()=>'A whole week of light. Nobody in the building mentioned it, because complaining about power is a form of superstition.');
  add(0.6, ()=>true, ()=>'It rained for four hours and the road became a river. You waited it out in a shop that sells phone accessories and existential dread.');
  add(0.5, s=>s.p.rep>70, ()=>'Someone introduced you in a room as "the person who actually delivers". You have spent years buying that sentence.');
  add(0.5, s=>s.p.job, ()=>'The rent reminder arrived the same day your salary landed, as it has every single month, like clockwork designed by a cynic.');
  const pick = R.weighted(pool, x=>x.w);
  return pick ? pick.t() : 'The quarter passed.';
}

/* =========================================================================
   Section 16: Modals
   ========================================================================= */
function modalHTML(head, body, foot, extra){
  return '<div id="modal"><div class="modalbox" '+(extra||'')+'>'+
    '<div class="head">'+head+'</div><div class="body">'+body+'</div>'+
    (foot?'<div class="foot">'+foot+'</div>':'')+'</div></div>';
}