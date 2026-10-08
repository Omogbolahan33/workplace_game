const {JSDOM} = require('jsdom');
require('./dom.js');
const dom = new JSDOM('<!doctype html><html><body>'+
  '<div id="top"><div class="toprow" id="toprow"></div><div class="tabs" id="tabs"></div></div>'+
  '<div id="main"></div><div id="modalHost"></div><div id="toastHost"></div></body></html>',
  {pretendToBeVisual:true});
global.window = dom.window; global.document = dom.window.document;
/* jsdom has no scrolling; render() restores scroll position on every call.
   Without this the run fills with 'Not implemented: window.scrollTo'.
   It is a harness gap - scrollTo is a real browser API. */
dom.window.scrollTo = function(){};
if(!global.Node) global.Node = dom.window.Node;
const M = require('./sim.js');
const DOC = global.document;
let bad = []; const ck = (c,m)=>{ if(!c) bad.push(m); };
const click = el => { if(el) el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true})); return !!el; };
const $ = s => DOC.querySelector(s);

M.UI.noAnim = true;
/* Fixed seed: without one every run of this gate plays a different world,
   so a failure can appear once and never reproduce. */

M.newGame({name:'Ada', city:'lagos', profile:'founder', difficulty:'realistic', seed:4242});
const S = M.getS();
for(let q=0;q<6 && !S.gameOver;q++){ M.ACT.advance(); M.UI.modal=null; }
if(!S.biz){ try{ M.startBiz('retail', null, 8000000, null); }catch(e){ bad.push('startBiz: '+e.message); } }
for(let q=0;q<4 && !S.gameOver;q++){ M.ACT.advance(); M.UI.modal=null; }
S.fin.cash = 60000000;          // fund the experiment
S.p.kids = 2; S.p.married = true;

const biz = M.bizList()[0] || S.biz;
console.log('business           :', biz ? biz.name : 'NONE');
console.log('roles available    :', Object.keys(M.HOUSE_ROLES).filter(k=>M.houseRoleAvail(k)).join(', '));

/* ---------- 1. candidates generate and are gated ---------- */
M.refreshHouseCands();
const cands = S.houseCands||[];
console.log('candidates         :', cands.length, '(' + cands.map(c=>c.role).join(', ') + ')');
ck(cands.length>0, 'no household candidates generated');
ck(M.houseRoleAvail('nanny')===true, 'nanny should be available with kids');
ck(M.houseRoleAvail('cos')===true, 'chief of staff should be available with a business');
S.p.kids = 0; ck(M.houseRoleAvail('nanny')===false, 'nanny should NOT be available with no children');
S.p.kids = 2;

/* ---------- 2. hire by accepting their asking price ---------- */
M.refreshHouseCands();
const c1 = (S.houseCands||[])[0];
ck(!!c1, 'no candidate to hire');
if(c1){
  M.ACT.houseask({dataset:{i:c1.id}});
  ck((S.house||[]).length===1, 'accept-at-asking did not hire');
  console.log('hired by accept    :', (S.house[0]||{}).name, M.fmt((S.house[0]||{}).salary)+'/mo', 'payer='+((S.house[0]||{}).payer));
}

/* ---------- 3. hire through negotiation ---------- */
M.refreshHouseCands();
const c2 = (S.houseCands||[]).find(c=>c.id!==c1.id) || (S.houseCands||[])[0];
if(c2){
  M.ACT.housenego({dataset:{i:c2.id}});
  ck(M.UI.modal && M.UI.modal.type==='nego', 'housenego did not open a negotiation');
  let g=0, done=false;
  while(g++<15){
    const t = M.UI.modal && M.UI.modal.type;
    if(t==='nego'){
      const btns=[...DOC.querySelectorAll('#modalHost button.opt[data-a="negtactic"]')];
      if(!btns.length) break;
      click(btns[0]);
    } else if(t==='negoResult'){ done=true; break; }
    else break;
    M.render();
  }
  ck(done, 'household negotiation never resolved');
  const cont = $('#modalHost [data-a="negclose"]'); if(cont) click(cont);
  console.log('negotiated hire    :', (S.house||[]).length, 'on the roster after negotiation');
}

/* ---------- 4. effects actually land ---------- */
/* effects are role-specific, so hire known roles rather than trusting the draw */
S.houseCands = [M.genHouseCand('driver'), M.genHouseCand('cook'), M.genHouseCand('pa')];
const cid = S.houseCands.map(c=>c.id);
M.ACT.houseask({dataset:{i:cid[0]}});      // driver
M.ACT.houseask({dataset:{i:cid[1]}});      // cook
const h0 = (S.house||[]).find(x=>x.id===cid[0]);
ck(!!h0, 'driver did not join the roster');
const hid = h0 ? h0.id : null;
const getH = () => (S.house||[]).find(x=>x.id===hid);
const h = h0 || S.house[0];
const otBase = M.ownerTime(), otEff = M.ownerTimeEff();
const timeBoost = M.houseTimeBoost();
console.log('driver+cook hired  :', (S.house||[]).length, 'on the roster');
console.log('time / calm / health support :',
  M.staffSupport('time').toFixed(2), '/', M.staffSupport('calm').toFixed(2), '/', M.staffSupport('health').toFixed(2));
console.log('owner attention    :', Math.round(otBase*100)+'% -> '+Math.round(otEff*100)+'%');
ck(timeBoost > 0, 'a driver gave no time back');
ck(M.staffSupport('calm') > 0, 'a driver + cook gave no calm');
ck(M.staffSupport('health') > 0, 'a cook gave no health benefit');
ck(otEff > otBase, 'household staff gave no attention back');
ck(M.houseMonthly() > 0, 'household payroll is zero');

/* ---------- 5. company payroll + benefit in kind ---------- */
const beforeWage = M.staffMonthly(biz);
M.houseSetPayer(h.id, biz.id);
const afterWage = M.staffMonthly(biz);
console.log('company wage bill  :', M.fmt(Math.round(beforeWage)), '->', M.fmt(Math.round(afterWage)));
ck(afterWage > beforeWage, 'company payroll did not pick up the household cost');
ck(M.houseMonthlyBiz(biz.id) > 0, 'houseMonthlyBiz reported zero');

const riskBefore = biz.taxRisk||0;
M.ACT.advance(); M.UI.modal=null;
const riskAfter = biz.taxRisk||0;
console.log('tax risk undeclared:', riskBefore.toFixed(1), '->', riskAfter.toFixed(1));
ck(riskAfter > riskBefore, 'undeclared benefit in kind did not raise tax exposure');

if(!getH()){ bad.push('the driver left during the benefit-in-kind quarter (attrition)'); }
else {
  const grossed = M.houseMonthlyBiz(biz.id);
  M.houseToggleDeclare(hid);
  const grossedDeclared = M.houseMonthlyBiz(biz.id);
  console.log('declared gross-up  :', M.fmt(Math.round(grossed)), '->', M.fmt(Math.round(grossedDeclared)));
  ck(grossedDeclared > grossed, 'declaring benefit in kind did not gross the cost up');
}

/* ---------- 6. management actions ---------- */
M.houseSetPayer(hid, 'you');
const sk0 = getH().skill; M.ACT.housetrain({dataset:{i:hid}}); M.ACT.housetrain({dataset:{i:hid}});
console.log('training           : skill', sk0, '->', getH().skill, '(trained '+getH().trained+')');
ck(getH().trained===2, 'training did not accumulate');
const sal0 = getH().salary; M.ACT.houseraise({dataset:{i:hid, v:'0.10'}});
ck(getH().salary > sal0, 'raise did not move salary');
M.ACT.houseperk({dataset:{i:hid, k:'bonus'}});
ck(getH().perks && getH().perks.bonus, 'perk did not stick');
console.log('raise + perk       :', M.fmt(sal0), '->', M.fmt(getH().salary), '| 13th month:', !!(getH().perks&&getH().perks.bonus));

/* ---------- 7. firing ---------- */
const n0 = (S.house||[]).length;
M.ACT.housefire({dataset:{i:hid}});
ck(M.UI.modal && M.UI.modal.type==='nego', 'housefire did not open a severance negotiation');
const mor0 = getH() ? getH().morale : 0;
let g2=0;
while(g2++<15){
  const t = M.UI.modal && M.UI.modal.type;
  if(t==='nego'){
    /* concede closes almost every time, so the test is not at the mercy of the dice */
    const b=[...DOC.querySelectorAll('#modalHost button.opt[data-a="negtactic"]')];
    const conc = b.find(x=>x.dataset.t==='concede') || b[0];
    if(!conc) break;
    click(conc);
  }
  else if(t==='negoResult') break; else break;
  M.render();
}
const cl2 = $('#modalHost [data-a="negclose"]'); if(cl2) click(cl2);
console.log('after fire         :', n0, '->', (S.house||[]).length, 'on the roster');
/* a deal removes them; an impasse leaves them behind but must cost you something */
ck(((S.house||[]).length < n0) || (getH() && getH().morale < mor0), 'severance neither removed anybody nor soured them');

/* ---------- 8. long run, no crash ---------- */
M.refreshHouseCands();
for(let i=0;i<3;i++){ const c=(S.houseCands||[])[i]; if(c) M.ACT.houseask({dataset:{i:c.id}}); }
let crashes = 0, left = 0;
const names0 = (S.house||[]).map(h=>h.name);
for(let q=0;q<40 && !S.gameOver;q++){
  const before = (S.house||[]).length;
  try{ M.ACT.advance(); }catch(e){ crashes++; if(crashes<2) bad.push('crash q'+q+': '+e.message); }
  const after = (S.house||[]).length;
  if(after < before) left += (before-after);
  M.UI.modal=null;
}
console.log('40 quarters        :', crashes, 'crashes |', left, 'departures | roster', names0.length, '->', (S.house||[]).length);
console.log('cash after         :', M.fmt(Math.round(S.fin.cash)));
ck(crashes===0, 'crashes during long run');
(S.house||[]).forEach(function(hh){
  console.log('  stayed:', hh.name, 'morale', Math.round(hh.morale), 'loyalty', Math.round(hh.loyalty),
    'pay ratio', ((hh.salary/Math.max(1,M.houseSalaryFor(hh.role,hh.skill))).toFixed(2)));
});
S.journal.filter(j=>j.cat==='life'&&/left\./.test(j.text)).slice(0,4).forEach(function(j){ console.log('  depart:', j.text.slice(0,90)); });

/* ---------- 9. the UI renders ---------- */
/* household and life are separate sub-tabs of Work now */
M.UI.tab = 'work'; M.UI.sub = 'household'; M.render();
const hh = DOC.getElementById('main').innerHTML;
ck(hh.indexOf('Your household')>=0, 'household card missing from Work tab');
ck(hh.indexOf('People looking for work')>=0, 'household candidates card missing');
ck((hh.match(/id="modal"/g)||[]).length===0, 'stray modal in main');

M.UI.tab = 'work'; M.UI.sub = 'life'; M.render();
const main = DOC.getElementById('main').innerHTML;
ck(main.indexOf('Your life')>=0, 'revived Life view missing');

/* ---------- 10. accept-without-negotiating, both flavours ---------- */
S.fin.cash = 60000000;      // the long run can legitimately bankrupt you; fund this leg
if(!S.biz){ try{ M.startBiz('retail', null, 8000000, null); }catch(e){ bad.push('restart biz: '+e.message); } }
const biz2 = S.biz;
S.candidates = [M.genCandidate(0)];
const bc = S.candidates[0];
/* A neglected firm with no perks and low trust loses new joiners within a
   quarter - which is the model working, not a bug, but it is not what this
   leg is testing. Fund the firm so the only thing under test is the
   commitment mechanic itself. */
if(biz2) biz2.cash = Math.max(biz2.cash||0, 20000000);
const bizStaff0 = (biz2 && biz2.staff ? biz2.staff.length : 0);
const cashBefore = S.fin.cash;
M.ACT.hireask({dataset:{i:bc.id}});
const bizStaff1 = (biz2 && biz2.staff ? biz2.staff.length : 0);
/* Accepting an offer is still accepting an offer - they have a job to leave.
   The headcount must not move this quarter; a commitment must. (Before the
   commitment system this gate asserted the opposite, because hire() used to
   deliver a person the same day.) */
ck(bizStaff1 === bizStaff0, 'hireask added someone the same quarter - no notice period');
ck(M.commitBuilding(biz2).some(function(c){ return c.kind === 'hire'; }),
   'hireask placed no commitment');
/* Measured here, before the quarter runs. Sampling it after advanceQuarter()
   reads a whole quarter of cash flow - which can be positive - instead of the
   recruitment fee. (A gate bug, not an app bug: it flaked ~1 run in 3.) */
const spent = cashBefore - S.fin.cash;
const hireComm = (biz2.commitments||[]).filter(function(c){ return c.kind === 'hire'; }).pop();
let bizStaff2 = bizStaff0;
for(var qi = 0; qi < 2; qi++){
  M.advanceQuarter();
  bizStaff2 = Math.max(bizStaff2, (biz2 && biz2.staff ? biz2.staff.length : 0));
}
ck(hireComm && hireComm.status === 'active', 'the hire commitment never came due');
/* Peak over two quarters, not the count after one: a joiner who then quits
   still joined, and turnover is not the claim being tested here. */
if(!(bizStaff2 > bizStaff0)){
  console.log('  DIAG hire: staff ' + bizStaff0 + ' -> peak ' + bizStaff2 +
    ' | commitment ' + (hireComm ? hireComm.status : 'none') +
    ' | firm still trading ' + ((S.bizs||[]).indexOf(biz2) >= 0) +
    ' | firm cash ' + M.fmt(biz2.cash||0) + ' | trust ' + Math.round(biz2.staffTrust||0));
}
ck(bizStaff2 > bizStaff0, 'hireask never delivered the hire');
if(!(spent > 0)){
  console.log('  DIAG cash before/after:', Math.round(cashBefore), '/', Math.round(S.fin.cash),
    '| biz?', !!S.biz, '| cand still listed?', (S.candidates||[]).some(x=>x.id===bc.id),
    '| ask', M.fmt(bc.ask||0), '| NaN?', Number.isNaN(S.fin.cash));
}
ck(spent > 0, 'hireask charged no recruitment cost');
console.log('business accept    : staff', bizStaff0, '->', bizStaff1, 'same quarter, ->', bizStaff2,
  'after notice | recruitment', M.fmt(Math.round(spent)));

M.refreshHouseCands();
const c3 = (S.houseCands||[])[0];
if(c3){
  M.ACT.housenego({dataset:{i:c3.id}});
  const acc = $('#modalHost [data-a="negoaccept"]');
  ck(!!acc, 'no accept-their-terms button in the negotiation');
  if(acc){
    click(acc);
    ck(M.UI.modal && M.UI.modal.type==='negoResult', 'accept-their-terms did not settle');
    const c4 = $('#modalHost [data-a="negclose"]'); if(c4) click(c4);
  }
}
console.log('final roster       :', (S.house||[]).length, 'people,', M.fmt(M.houseMonthly())+'/mo');

/* underpaid household staff must surface on the agenda, not just drift away */
const poor = M.genHouseCand('cleaner');
poor.salary = Math.round(M.houseSalaryFor('cleaner', poor.skill)*0.70);
poor.morale = 55; poor.loyalty = 40;
S.house = (S.house||[]).concat([poor]);
M.UI.tab='work'; M.render();
const agenda = M.agendaItems ? M.agendaItems().map(a=>a.text).join(' | ') : '';
ck(/below what a housekeeper costs/.test(agenda), 'underpaid household staff never reached the agenda');
console.log('agenda warning     :', /below what a housekeeper costs/.test(agenda) ? 'fires' : 'MISSING');

console.log(bad.length ? ('\nHOUSE ISSUES:\n'+[...new Set(bad)].join('\n')) : '\nHOUSE CLEAN');
process.exit(0);
