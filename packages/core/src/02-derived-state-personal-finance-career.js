

/* =========================================================================
   Section 5: Derived state, personal finance, career
   ========================================================================= */
function CITY(){ return CITIES.find(c=>c.id===S.city) || CITIES[0]; }
function log(cat, text, kind){
  S.journal.unshift({turn:S.turn, date:dateLabel(S.turn), cat:cat, text:text, kind:kind||'neutral'});
  if(S.journal.length>320) S.journal.pop();
}
function tx(line){ TX.push(line); }

function assetValue(a){ return a.value||0; }
function goodsResale(){
  let v=0; const t=S.turn;
  (S.fin.goods||[]).forEach(g=>{
    const def = GOODS.find(x=>x.id===g.id); if(!def) return;
    const age = t - g.turn;
    if(def.life===0){ v += def.cost*0.15; return; }
    v += Math.max(0, def.cost * (1 - 0.055*age));
  });
  return v;
}
function bizValue(b){
  b = b || S.biz; if(!b) return 0;
  const T = BIZ.find(x=>x.id===b.type);
  const h = b.history.slice(-4);
  const avgP = h.length ? h.reduce((s,x)=>s+x.profit,0)/h.length : b.profit;
  const annP = avgP*4;
  const mult = (T.id==='tech'? 7.5 : 5.0) * (0.75 + (T.growth*2.2));
  let v = Math.max(0,b.cash) + (annP>0 ? annP*mult : annP*1.2) + (b.revenue*4)*(T.id==='tech'?1.6:0.6);
  if(!b.formal) v *= 0.82;              // informal businesses sell at a discount
  v *= (0.85 + outletAvgCond(b)/430);   // neglected units are worth less
  return Math.max(0, Math.round(v));
}
function bizValueTotal(){
  return bizList().reduce(function(a,b){ return a + bizValue(b); }, 0);
}
function debtTotal(){ return (S.fin.debt||[]).reduce((s,d)=>s+d.bal,0); }

function netWorth(){
  const a = (S.assets||[]).reduce((s,x)=>s+assetValue(x),0);
  return Math.round((S.fin.cash||0) + (S.fin.usdCash||0)*S.mkt.usd + a + goodsResale() + bizValueTotal() - debtTotal());
}
function salaryMonthly(){ return S.p.job ? S.p.job.monthly : 0; }
function informalMonthly(){ return (S.informalIncome||0) * (0.7 + R.f()*0.6); }
function goodsUpkeep(){ return (S.fin.goods||[]).reduce((s,g)=>{const d=GOODS.find(x=>x.id===g.id); return s + (d?d.upkeep:0);},0); }
function budgetMonthly(){ const b=S.fin.budget||{}; return (b.housing||0)+(b.food||0)+(b.transport||0)+(b.lifestyle||0)+(b.family||0)+(b.learning||0)+(b.giving||0); }
function passiveMonthly(){ // rents, dividends arriving as cash
  let v=0; (S.assets||[]).forEach(a=>{ const d=ASSETS.find(x=>x.id===a.id); if(d&&d.yieldQ) v += a.value*d.yieldQ/3; });
  return v;
}
function recompute(){
  S.der = {
    nw: netWorth(), assets:(S.assets||[]).reduce((s,x)=>s+assetValue(x),0),
    debt: debtTotal(), biz: bizValue(), goods: goodsResale(),
    income: salaryMonthly()*3 + (S.informalIncome||0)*3 + passiveMonthly()*3,
    spend: (budgetMonthly()+goodsUpkeep())*3
  };
  if(S.biz){ const T=BIZ.find(x=>x.id===S.biz.type); S.der.bizType=T; }
  return S.der;
}
function freedomIndex(){
  // 0-100: how much of your life you actually own
  const d = recompute();
  const monthlyPassive = (passiveMonthly() + (S.biz? Math.max(0,S.biz.profit)/3 : 0) + (S.assets||[]).reduce((s,a)=>{const x=ASSETS.find(y=>y.id===a.id); return s + (x&&!x.illiquid? a.value*(x.ret-0.02)/3 : 0);},0));
  const need = (budgetMonthly())||1;
  const coverage = clamp(monthlyPassive/need, 0, 3)/3;              // 0..1
  const wealth   = clamp(Math.log10(Math.max(1,d.nw)/1e6)/3.3, 0, 1); // 0 at 1m, 1 at ~2bn
  const life     = (S.p.health/100*0.28) + (S.p.happy/100*0.24) + (S.p.family/100*0.18) + (1-S.p.stress/100)*0.30;
  return Math.round((coverage*0.34 + wealth*0.36 + life*0.30)*100);
}

function needs(){
  const c = CITY(), p = S.p;
  const inf = S.cumInfl || 1;                              // a budget you never revisit stops working
  const fam   = 1 + (p.married?0.75:0) + p.kids*0.55;      // people actually in the house
  const oblig = 1 + (p.parents>0?0.55:0) + (p.kids*0.15);  // people you send money to
  return {
    housing:  Math.round(70000*c.rentMult*fam*0.75*inf),
    food:     Math.round(58000*fam*(0.55+0.45*c.rentMult)*inf),
    transport:Math.round(38000*fam*0.65*inf),
    lifestyle:Math.round(48000*fam*(0.6+0.4*c.rentMult)*inf),
    family:   Math.round(22000*oblig*(p.family<55?1.5:1)*inf)
  };
}

/* ---- one quarter of personal life ---- */
function stepPersonal(){
  const p = S.p, b = S.fin.budget, m = S.mkt, c = CITY(), d = D();
  const nd = needs();
  let income = 0, expense = 0;

  /* Sleep debt. The body collects what the calendar could not. It is repaid
     out of this quarter's discretionary hours at a limited rate, and until it
     clears, health and performance both suffer for it. */
  if(p.debt > 0){
    const repay = Math.min(p.debt, Math.round(hoursBudget()*0.30));
    p.debt  = Math.max(0, p.debt - repay);
    p.spent = Math.max(0, hoursSpent() - repay);
    const load = p.debt;
    p.health = clamp(p.health - 0.9 - load*0.045, 0, 100);
    p.stress = clamp(p.stress + 1.6 + load*0.05, 0, 100);
    if(p.jobPerf !== undefined) p.jobPerf = clamp(p.jobPerf - (1.2 + load*0.035), 5, 99);
    if(load > 60)  log('life','You are running on borrowed sleep and people can tell.','warn');
    if(load > 140) log('life','You have not properly slept in weeks. It is starting to cost you.','bad');
    if(load > 200 && R.chance(0.35)){
      p.health = clamp(p.health - 6, 0, 100);
      p.debt = Math.max(0, p.debt - 60);
      log('life','Your body made the decision for you. You lost a week to it.','bad');
    }
  }

  // ---- income
  if(p.job){
    const perfFactor = 0.85 + (p.jobPerf/100)*0.3;
    let sal = Math.round(p.job.monthly*3*perfFactor*d.pay);
    const tax = p.job.industry==='Informal' ? 0 : sal*0.11;
    income += sal - tax;
    if(tax>0) tx('PAYE & deductions −'+fmt(tax));
    tx('Salary ('+esc(p.job.title)+') +'+fmt(sal-tax));
    p.jobYears += 0.25;
    // annual review: wages chase inflation but usually lose the race
    if(S.turn % 4 === 3){
      const rise = m.infl*0.80 + 0.005 + R.gauss(0,0.02);
      const cap = Math.round(marketMonthly()*1.25);
      const next = Math.min(Math.round(p.job.monthly * (1 + Math.max(-0.05, rise))), cap);
      if(next > p.job.monthly) tx('Annual review +'+pct((next/p.job.monthly)-1,1));
      p.job.monthly = next;
    }
    // performance drifts toward a baseline set by skill + attention
    const target = 46 + p.skills.ops*0.22 + p.skills.tech*0.12 + (p.jobYears*3);
    p.jobPerf = clamp(p.jobPerf + (target - p.jobPerf)*0.18 + R.gauss(0,5), 5, 99);
    // redundancy risk
    if(p.jobPerf < 34 && R.chance(0.20*d.fail)) { fireFromJob(); }
  }
  if(S.informalIncome>0){
    const inf = Math.round(informalMonthly()*3);
    income += inf; tx('Informal trading income +'+fmt(inf));
  }
  if(p.partner && p.partner.income){
    income += p.partner.income*3; tx('Partner contributes +'+fmt(p.partner.income*3));
  }
  income += Math.round(passiveMonthly()*3);

  // ---- expenses
  const cats = ['housing','food','transport','lifestyle','family','learning','giving'];
  cats.forEach(k=>{ expense += (b[k]||0)*3; });
  const gu = goodsUpkeep()*3; expense += gu; if(gu>0) tx('Asset upkeep −'+fmt(gu));
  tx('Living costs −'+fmt(budgetMonthly()*3));

  // ---- needs satisfaction → stats
  const ratio = k => (b[k]||0)/Math.max(1,nd[k]);
  const foodR = clamp(ratio('food'),0,1.5), houseR = clamp(ratio('housing'),0,1.5);
  const foodPen = foodR>=1 ? (foodR-1)*22 : (foodR-1)*70;      // under-eating bites hard, over-eating barely helps
  const deprive = Math.max(-46, foodPen + (houseR-1)*20);      // neglect makes you ill; it does not, on its own, kill you
  const healthTarget = 80 + deprive - Math.max(0,p.age-42)*0.85 + clamp(staffSupport('health'), 0, 6);
  p.health = clamp(p.health + (healthTarget-p.health)*0.22 - Math.max(0,p.stress-62)/12 + R.gauss(0,1.2), 0, 100);
  p.happy  = clamp(p.happy + (clamp(ratio('lifestyle'),0,2)-1.0)*4 + (clamp(ratio('food'),0,1.5)-0.95)*2.5 - (p.stress-55)/90 + clamp(staffSupport('joy'),0,5) + R.gauss(0,1.6), 0, 100);
  const famGive = ratio('family');
  p.family = clamp(p.family + (clamp(famGive,0,2)-1.0)*11 - (p.kids*0.4) + (p.married?0.6:-0.2) + clamp(staffSupport('family'),0,6), 0, 100);
  const learnSpend = (b.learning||0)*3;
  if(learnSpend>60000){
    const gain = clamp(learnSpend/900000, 0.15, 2.2);
    const which = R.pick(['finance','ops','tech','network']);
    p.skills[which] = clamp(p.skills[which] + gain*R.range(1.6,3.4), 0, 100);
    tx('Learning: '+which+' skill improved');
  }
  if((b.giving||0)*3 > 40000){ p.rep = clamp(p.rep + 1.2, 0, 100); p.happy = clamp(p.happy+1.4,0,100); }
  const houseStatus = clamp(staffSupport('status'),0,4);
  if(houseStatus>0) p.rep = clamp(p.rep + houseStatus*0.10, 0, 100);   // a driver and a gate change how you are read

  // ---- stress
  const months = S.fin.cash / Math.max(1, budgetMonthly() + houseMonthlyYou());
  const moneyStress = months<0 ? 8 : months<1 ? 3.5 : months<3 ? 1.2 : 0;
  const bizStress = S.biz ? ((S.biz.profit<0?7:2) + Math.min(6, S.biz.staff.length*0.35)) : 0;
  const debtStress = debtTotal() > Math.max(1, income) ? 3.5 : (debtTotal()>0 ? 0.8 : 0);
  const relief = (clamp(ratio('lifestyle'),0,2)-1)*4 + (clamp(ratio('housing'),0,1.6)-1)*2.5;
  /* Your household: the house running is worth a great deal of quiet. It is also
     more people to manage, and a household in a bad mood is a thing you live inside. */
  const houseN      = (S.house||[]).length;
  const houseCalm   = clamp(staffSupport('calm'), 0, 13);
  const houseManage = houseN ? Math.min(7, 0.55*houseN + (S.house||[]).filter(function(h){ return (h.morale||60)<35; }).length*2.4) : 0;
  const stressTarget = 20 + moneyStress + bizStress + debtStress - relief - houseCalm + houseManage + (p.job?2:0) + (p.kids*1.2);
  p.stress = clamp(p.stress + (stressTarget-p.stress)*0.30 + R.gauss(0,2)*d.shock, 0, 100);
  if(p.stress>78){ p.health = clamp(p.health-1.6,0,100); if(R.chance(0.06)) log('health','Burnout is no longer theoretical. Your body is filing complaints.','bad'); }

  // ---- debt service
  (S.fin.debt||[]).forEach(dt=>{
    const interest = dt.bal*dt.rate;
    const pay = Math.min(dt.bal + interest, Math.max(dt.minPay, Math.round(dt.bal*0.10 + interest)));
    dt.bal = Math.max(0, dt.bal + interest - pay);
    expense += pay;
    if(dt.bal<=0){ tx('Cleared: '+esc(dt.name)); toast('Debt cleared: '+esc(dt.name), 3000); log('money','You cleared the '+dt.name+'. Sleep improves immediately.','good'); }
    else tx(dt.name+' −'+fmt(pay));
  });
  S.fin.debt = (S.fin.debt||[]).filter(x=>x.bal>0.5);

  // ---- debt that can never be serviced gets restructured rather than compounding forever
  (S.fin.debt||[]).forEach(function(dt){
    const service = dt.bal*dt.rate + dt.minPay;
    if(dt.kind==='shark' && service > income*0.55 && (S.turn - (dt.started||S.turn)) >= 2){
      if(dt.warned !== S.turn && R.chance(0.45)){
        dt.warned = S.turn;
        const relief = Math.round(dt.bal*0.35);
        dt.bal = Math.max(0, dt.bal - relief); dt.rate = 0.10; dt.minPay = Math.round(dt.bal*0.15); dt.kind='bank';
        dt.name = 'Restructured debt';
        log('money','The lender accepted a restructuring: '+fmt(relief)+' written off, the balance moved to 10% a quarter. They would rather be paid something.','warn');
      }
    }
  });
  // ---- the ledger closes
  S.fin.cash += income - expense;
  S.quarter = {income:income, expense:expense};

  // ---- overdraft / survival
  if(S.fin.cash < 0){
    const affordable = Math.max(0, (income*0.35) - (S.fin.debt||[]).reduce((a,x)=>a+x.minPay+x.bal*x.rate,0));
    if(S.fin.credit > 15 && affordable > 0 && R.chance(0.55)){
      const amt = Math.min(Math.round(-S.fin.cash*1.15), Math.round(affordable/0.09));
      S.fin.debt.push({id:'d'+ (++S.seq), name:'Overdraft', bal:amt, rate:0.09, minPay:Math.round(amt*0.3), kind:'bank'});
      S.fin.cash += amt;
      log('money','The bank covered a shortfall of '+fmt(amt)+'. You are now paying 14% a quarter for the privilege.','bad');
    } else if(R.chance(0.6)){
      const amt = Math.round(-S.fin.cash*1.2);
      S.fin.debt.push({id:'d'+(++S.seq), name:'Informal lender', bal:amt, rate:0.18, minPay:Math.round(amt*0.35), kind:'shark'});
      S.fin.cash += amt;
      log('money','You borrowed '+fmt(amt)+' from a private lender at 30% a quarter. There is no paperwork and no mercy.','bad');
      p.stress = clamp(p.stress+9,0,100);
    } else {
      log('money','You ended the quarter in the red. Essentials got skipped.','bad');
      p.health = clamp(p.health-3.2,0,100); p.happy = clamp(p.happy-4,0,100);
      S.fin.credit = clamp(S.fin.credit-7,0,100);
      S.fin.cash = Math.max(S.fin.cash, -budgetMonthly()*6);
    }
    S.fin.credit = clamp(S.fin.credit-3,0,100);
  } else {
    S.fin.credit = clamp(S.fin.credit+0.8,0,100);
  }
  // credit score drifts with repayment behaviour
  if(debtTotal()<=0) S.fin.credit = clamp(S.fin.credit+1.4,0,100);
}

function fireFromJob(){
  const p=S.p;
  if(!p.job) return;
  log('career','You were let go from '+p.job.title+'. Performance had been flagged for two quarters.','bad');
  p.stress = clamp(p.stress+16,0,100); p.happy = clamp(p.happy-12,0,100); p.rep = clamp(p.rep-4,0,100);
  p.job = null; p.jobPerf = 50; p.jobYears = 0;
}

/* ------------------------------------------------------------------------
   The hours budget. A quarter is thirteen weeks. Work, sleep, commuting and
   eating are spent before you get here; what is left is discretionary, and
   it is the only thing any of these actions can draw on. You can spend hours
   you do not have by not sleeping, but the debt is collected.
   ------------------------------------------------------------------------ */
const WEEKS_PER_QUARTER = 13;
function weeklyFreeHours(){
  let h = 26;
  if(S.p.job)           h -= 6;
  if(S.biz)             h -= 7;
  if(S.p.married)       h -= 3;
  if(S.p.kids > 0)      h -= 5 * Math.min(S.p.kids, 3);
  if(S.flags.moonlight) h -= 4;
  h += houseTimeBoost() * 12;
  return Math.max(4, Math.round(h));
}
function hoursBudget(){ return weeklyFreeHours() * WEEKS_PER_QUARTER; }
function hoursSpent(){ return S.p.spent || 0; }
function hoursLeft(){ return Math.max(0, hoursBudget() - hoursSpent()); }
function sleepDebt(){ return S.p.debt || 0; }
function spendHours(n, allowDebt){
  n = Math.round(n);
  const left = hoursLeft();
  if(n <= left){ S.p.spent = hoursSpent() + n; return 0; }
  if(!allowDebt) return -1;
  const borrowed = n - left;
  S.p.spent = hoursSpent() + left;
  S.p.debt  = sleepDebt() + borrowed;
  return borrowed;
}
function repeatFactor(id){
  const n = (S.p.acts || {})[id] || 0;
  return 1 / (1 + n * 0.62);
}
function noteAction(id){
  if(!S.p.acts) S.p.acts = {};
  S.p.acts[id] = (S.p.acts[id] || 0) + 1;
}

/* ---- career actions ---- */
/*@table:CAREER@*/