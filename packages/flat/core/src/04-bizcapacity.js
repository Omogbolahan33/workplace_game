
function bizCapacity(b){
  const T = BIZ.find(x=>x.id===b.type);
  const capFactor = (1 + Math.log(1 + Math.max(0,b.capex)/2.5e6)*0.30) * (1 + (b.auto||0)/110);
  const loc = Math.pow(Math.max(0.2, outletScale(b)), 0.85);
  const prod = staffProd(b) + ownerTime(b)*(0.75 + S.p.skills.ops/85);
  const govOps = 1 + (boardSkill(b,'ops')-50)/850;
  return Math.max(0, prod * (230/T.laborPer) * loc * capFactor * govOps * shiftCapMult(b));
}
/* ===========================================================================
   Price is a claim, not a number

   You cannot decide to charge 18% above list. You can only charge what your
   positioning supports, and positioning is a slow stock built out of quality
   evidence, service, brand and price discipline. Charge above it and customers
   do not gently buy less - they leave, and they take the positioning with
   them. Cut repeatedly and the market learns to wait for the sale, so the
   climb back costs more than the slide ever gained.

   `priceIdx` used to be a raw elasticity multiplier: any value, effective
   instantly, fully reversible, with no memory on either side.
   =========================================================================== */
function priceBand(b){
  const pos = (b.positioning === undefined ? 45 : b.positioning);
  return { lo: 0.72 + (pos-50)/100 * 0.20,        // below this you are leaving money behind
           hi: 1.00 + (pos-50)/100 * 0.55 };      // above this customers stop believing you
}
function stepPriceMemory(b){
  const prev = (b.lastPriceIdx === undefined ? (b.priceIdx||1) : b.lastPriceIdx);
  const cur  = (b.priceIdx||1);
  const band = priceBand(b);
  /* captured before lastPriceIdx moves, or demand can never tell a rise from
     a fall and the whole memory mechanism is dead code */
  const raising = cur > prev + 0.005;
  b.priceRaising = raising;
  b.priceRise = Math.max(0, cur - prev);      // how much you are asking them to forget
  b.priceCut  = Math.max(0, prev - cur);
  /* Rule: cutting teaches the market fast, staying on sale teaches it slowly,
     and only selling at list lets it forget. An earlier version keyed this off
     the band, which was self-defeating - discounting erodes positioning, which
     lowers the band, which stopped counting as discounting, so the memory
     decayed while the business was still on sale. */
  const cutNow   = cur < prev - 0.005;
  const belowList = cur < 0.98;
  if(cutNow)        b.discountMemory = clamp((b.discountMemory||0) + 0.24, 0, 1);
  else if(belowList) b.discountMemory = clamp((b.discountMemory||0) + 0.08, 0, 1);
  else              b.discountMemory = clamp((b.discountMemory||0)*0.85 - (raising ? 0.05 : 0), 0, 1);
  b.lastPriceIdx = cur;
  b.priceOver  = Math.max(0, cur - band.hi);
  b.priceUnder = Math.max(0, band.lo - cur);
  /* positioning is earned slowly, by what you actually deliver, and a habit
     of discounting spends it */
  const earned = clamp((b.quality||50)*0.42 + (b.rep||45)*0.26
    + (b.serviceQ===undefined ? 0.85 : b.serviceQ)*28
    + Math.min(26, (b.brand||0)/Math.max(1, 4e6))
    - (b.discountMemory||0)*24, 0, 100);
  b.positioning = (b.positioning === undefined ? 45 : b.positioning)*0.82 + earned*0.18;
}
/* ===========================================================================
   Quality is a process, not a purchase

   The slider used to charge you for quality every quarter and then do nothing
   with the money: `qualitySpendMonthly` went into opex, and the only thing
   that ever moved `b.quality` was a random event. It was a money incinerator
   with a label on it.

   Real quality has two properties that make it a trap rather than a dial:

     1. LAG. Spend builds a process over quarters, and a bigger business has
        to spend more just to hold the line.
     2. DISCOVERY DELAY. The defects you ship this quarter surface three to
        six quarters later, as warranty claims and a reputation hit - long
        after the saving has been booked and spent.

   Together those produce the harvest trap: cutting quality reads as pure
   profit for two or three quarters, and the bill arrives when you have
   forgotten what you bought with it.
   =========================================================================== */
function stepQuality(b, units){
  const T = BIZ.find(x=>x.id===b.type);
  if(b.qualInvest === undefined) b.qualInvest = (b.quality===undefined ? 55 : b.quality);
  /* events move b.quality directly; fold that movement into the investment
     stock so there is exactly one writer and the two cannot disagree */
  const prevQ = (b._qualLast === undefined ? (b.quality===undefined?55:b.quality) : b._qualLast);
  if(Math.abs((b.quality||0) - (prevQ||0)) > 0.4)
    b.qualInvest = clamp(b.qualInvest + ((b.quality||0) - (prevQ||0)), 0, 100);

  const spend = b.qualitySpendMonthly||0;
  const scale = Math.max(1, (b.revenue||0) * 0.055);   // holding the line gets more expensive as you grow
  const feed  = clamp(spend/scale, 0, 2.0);
  /* The floor matters. At 14 a business that never spent on quality settled
     near 19, which made growth impossible whatever else it did - the harvest
     trap with no way out and no explanation. At 38 it settles near 48:
     mediocre, visibly mediocre, but survivable, and spending is still the
     only way to get above it. */
  const target = clamp(38 + feed*40 + (b.auto||0)*0.10 + ((b.outlets||[]).length? outletAvgCond(b)*0.12 : 0), 0, 100);
  b.qualInvest = b.qualInvest*0.80 + target*0.20;      // about five quarters to get there
  b.quality = clamp(b.qualInvest, 0, 100);
  b._qualLast = b.quality;

  /* --- the defects pipeline: built now, discovered later ----------------- */
  const defectRate = clamp((74 - b.quality)/240, 0, 0.34);
  const shipped = Math.max(0, (units||0) * defectRate);
  b.defects = b.defects || [];
  if(shipped >= 0.5) b.defects.push({ turn: S.turn + 3 + R.int(0,3), q: shipped, at: S.turn });

  let surfaced = 0, oldest = 0;
  b.defects = (b.defects||[]).filter(function(d){
    if(d.turn > S.turn) return true;
    surfaced += d.q; if(!oldest) oldest = d.at; return false;
  });
  b.defectsQ = Math.round(surfaced);
  if(surfaced > 0){
    const unit = (T.basePrice||100000) * S.cumInfl * 0.30 * (CITY().payMult||1);
    const cost = Math.round(surfaced * unit);
    b.cash -= cost;
    b.warrantyQ = cost;
    const repHit = clamp(0.7 + surfaced/Math.max(20,(units||1))*7, 0, 9);
    b.rep = clamp(b.rep - repHit, 0, 100);
    b.notes.push('Defects from ' + (S.turn - oldest) + ' quarters ago have surfaced: ' +
      Math.round(surfaced) + ' units and ' + fmt(cost) + ' in warranty, returns and goodwill.');
    log('biz','Warranty claims have landed for work shipped ' + (S.turn - oldest) +
      ' quarters ago. ' + fmt(cost) + '. You sold it, they bought it, and then it broke.','bad');
  } else b.warrantyQ = 0;

  b.pendingDefects = Math.round((b.defects||[]).reduce(function(a,d){ return a + d.q; }, 0));
  /* what the bill will be when it lands, so the trap is visible before it closes */
  const u = (T.basePrice||100000) * S.cumInfl * 0.30 * (CITY().payMult||1);
  b.defectBill = Math.round(b.pendingDefects * u);
}
/* ===========================================================================
   Customers are a stock, and a rival is a rival

   Marketing used to be `1 + 0.35*(m/(m+250000))`: spend more, get more
   demand, instantly, forever, and stop spending and it all vanishes at once.
   Neither of those is true.

   Real demand is a base of customers that behaves like a stock:
     - it DECAYS by a retention rate, so stopping spend loses you people
       gradually rather than all at once
     - you can ADD to it by buying customers, but CAC rises as you saturate
       the market you are fishing in
     - and above a quality threshold it grows on its own, because people tell
       each other - the only channel that compounds

   And a price cut is not an act in a vacuum: a rival with any aggression in
   them matches it, a quarter or two later, and takes back part of what you
   bought. Which is why "competing on price is a race you win by being the
   one willing to earn least" is a line in this game and not a slogan.
   =========================================================================== */
function stepCustomers(b){
  const T = BIZ.find(x=>x.id===b.type);
  if(b.custBase === undefined)
    b.custBase = Math.max(25, Math.round((b.revenue||0) / Math.max(1,(T.basePrice||100000)*S.cumInfl) * 0.6));
  /* ~10% a quarter at average quality and service. Higher than that and no
     level of spending can hold a base together; lower and retention stops
     being a thing you have to manage at all. */
  const qualRet  = clamp(0.93 + ((b.quality||50) - 50)/260, 0.82, 0.99);
  const svcRet   = clamp(0.97 + (((b.serviceQ===undefined?0.85:b.serviceQ) - 0.85)*0.05), 0.94, 0.995);
  const priceRet = clamp(1.0 - (b.discountMemory||0)*0.035, 0.95, 1.0);
  const churn    = 1 - clamp(qualRet*svcRet*priceRet, 0.42, 0.985);
  b.churnQ = churn;
  b.custBase = Math.max(0, b.custBase * (1 - churn));

  /* paid acquisition, with CAC rising as the pool fills up */
  const mkt = b.marketing||0;
  const marketSz = Math.max(1, 1250 * Math.pow(Math.max(0.2, outletScale(b)), 0.80) * S.mkt.demand);
  const satur = clamp(b.custBase / Math.max(1, marketSz*2.6), 0, 1.5);
  const cac   = Math.max(1, (T.basePrice||100000) * S.cumInfl * (0.55 + satur*2.2) * (CITY().payMult||1));
  const bought = mkt / cac;
  /* word of mouth: only above a quality threshold, and it compounds */
  const wom = (b.quality||50) > 58
    ? clamp(((b.quality||50)-58)/300 + (b.rep||45)/1400, 0, 0.10) : 0;
  const referred = b.custBase * wom;
  b.custBase = Math.max(0, b.custBase + bought + referred);
  b.cacQ = Math.round(cac); b.boughtQ = Math.round(bought);
  b.referredQ = Math.round(referred); b.womQ = wom;
}
function stepCompetitor(b){
  if(!S.rival){ b.rivalCut = (b.rivalCut||0)*0.80; return; }
  const band = priceBand(b);
  /* how far below your own station you are selling is what they notice */
  const aggressive = Math.max(0, band.lo - (b.priceIdx||1));
  const target = clamp(aggressive*1.7 + (S.rival.aggro||30)/300, 0, 0.60);
  b.rivalCut = (b.rivalCut||0)*0.62 + target*0.38;      // they take a quarter or two to move
  if(b.rivalCut > 0.14 && (b.quality||50) < 64)
    b.notes.push('Your rival has matched your price. You bought this volume once; holding it means cutting again.');
}
function bizDemand(b){
  const T = BIZ.find(x=>x.id===b.type), m = S.mkt;
  const marketSize = 1250 * Math.pow(Math.max(0.2, outletScale(b)), 0.80) * m.demand;
  const repF  = 0.15 + Math.pow(b.rep/100, 1.6)*1.35;   // reputation is the whole pipeline
  const _band = priceBand(b);
  const _over  = Math.max(0, (b.priceIdx||1) - _band.hi) / Math.max(0.2, _band.hi);
  const _under = Math.max(0, _band.lo - (b.priceIdx||1)) / Math.max(0.2, _band.lo);
  /* Raising price after a history of cuts is not the same act as raising it
     from a standing start: the market learned to wait for the sale, and it
     punishes the climb far harder than it rewarded the slide. That asymmetry
     is most of what real pricing is. */
  const _raising = !!b.priceRaising;
  const _mem = (b.discountMemory||0);
  const _elast = T.elasticity * (1 + _mem * (_raising ? 1.15 : -0.12));
  /* The climb back. This is the whole asymmetry: elasticity alone would hand
     you the volume straight back, because it only knows the level. Customers
     know the history. They leave in proportion to how much you are asking
     them to unlearn. */
  const _climb = 1 - Math.min(0.55, (b.priceRise||0) * _mem * 1.6);
  const priceF= Math.max(0.10,
      Math.pow(1/Math.max(0.3,b.priceIdx), _elast)
      * (1 - _over*1.95)        // charging above your station: they simply go
      * (1 + _under*0.40*(1 - (b.rivalCut||0)))   // cheap sells once, and they match it
      * (1 - (b.rivalCut||0)*0.22)
      * _climb);
  const brandB= 1 + 0.50*(b.brand/(b.brand+400000));
  const cb = Math.max(0, b.custBase||0);
  const mktB  = 1 + 0.85*(cb / (cb + Math.max(40, marketSize*0.35)));  // the base, not the spend
  const qualF = (0.72 + b.quality/190) * (0.90 + outletAvgCond(b)/500);
  const ramp  = clamp(0.22 + (S.turn - b.foundedTurn)*0.13, 0.22, 1);  // finding customers takes time
  const credit= 1 + (b.creditTerms||0)*0.22;                            // selling on credit buys volume
  const contractF = 1 + ((b.contracts||[]).reduce(function(a,c){ return a + (c.bonus||0); }, 0));
  const incF  = 1 - Math.min(0.35, ((b.incidents||[]).filter(function(i){ return i.turns>0; }).length)*0.09);
  const govF  = 1 + (boardSkill(b,'network')-50)/900;      // a board that opens doors
  return marketSize * repF * priceF * brandB * mktB * (1+connBonus(b)) * qualF * ramp * credit * contractF * incF * govF * channelDemandMult(b);
}
function simBusiness(){
  if(!S.bizs || !S.bizs.length){
    if(S.biz && !S.bizs){ S.bizs = [S.biz]; }
    else return 0;
  }
  let total = 0;
  bizList().slice().forEach(function(b){
    total += simOneBiz(b) || 0;
  });
  return total;
}
function simOneBiz(b){
  if(!b) return 0;
  const T = BIZ.find(x=>x.id===b.type), m = S.mkt;
  const inflF = S.cumInfl / b.startInfl;
  b.notes = [];
  // marketing memory decays, brand builds
  b.mktCarry = (b.mktCarry||0)*0.55 + Math.min(1, b.marketing/250000)*0.35;
  b.brand = b.brand*(1-0.04) + b.marketing*0.16;
  stepCommitments(b);                    /* promises come due before anything else is computed */
  stepPriceMemory(b);                    /* and the market remembers what you charged last time */
  stepCustomers(b);                      /* customers are a stock that decays and can compound */
  stepCompetitor(b);                     /* and somebody else is watching your price */
  b.capacity = bizCapacity(b);
  b.outletNotes = stepOutlets(b);
  let demand = bizDemand(b);
  let units = Math.min(b.capacity, demand);
  let shortCash = false;
  if(b.cash < 0){ shortCash = true; units *= 0.78; b.notes.push('Working capital is negative — you could not stock up properly.'); b.rep = clamp(b.rep-2.5,0,100); }
  // service level: under-stock and you turn customers away even when demand is there
  const cover = staffCover(b);
  const coverF = cover>=1 ? 1.02 : (0.58 + cover*0.42);
  /* Stock you have not paid for is stock you do not have. The policy sets
     what you want; `funded` is what you could actually afford. */
  const funded = wcFunded(b, b.revenue);
  const service = clamp((0.70 + wcPolicy(b)*0.30 + (b.auto||0)/260) * coverF * (0.52 + funded*0.48), 0.30, 0.995);
  b.wcFunded = funded; b.serviceQ = service;
  if(funded < 0.75) b.notes.push('You could only fund ' + Math.round(funded*100) +
    '% of the stock this business needs. Customers are being served off an empty shelf.');
  if(cover < 0.75) b.notes.push('You are short-staffed across your units — '+Math.round(cover*100)+'% of what these units need. Customers are waiting.');
  stepQuality(b, units);                 /* defects are built now and discovered later */
  const lostToStock = units * (1-service);
  units *= service;
  const serviceFail = (1-service) > 0.11;      // a genuine service failure, not normal thinning
  if(serviceFail && lostToStock > Math.max(2, b.capacity*0.10)){
    b.notes.push('You ran out of stock with customers in front of you. '+Math.round(lostToStock)+' units of demand went elsewhere.');
  }
  // supplier confidence: stretch them too far and the goods stop arriving
  if((b.supplierConf!==undefined && b.supplierConf < 36) || (b.payable||0) > Math.max(1,b.revenue*0.85)){
    units *= 0.74;
    b.notes.push('Suppliers are supplying less. You have been stretching them and they have noticed.');
  }
  // incidents (a bad batch, a bad review) suppress demand for a while
  if((b.incidents||[]).length){
    const active = b.incidents.filter(function(i){ return i.turns>0; });
    if(active.length) b.notes.push('Lingering damage: ' + active.map(function(i){return i.name;}).join(', ') + '.');
  }
  units *= R.range(0.93,1.07);
  b.units = units; b.demand = demand;
  const age = Math.max(0, S.turn - b.foundedTurn);
  const unitPrice = T.basePrice * b.priceIdx * inflF * CITY().payMult;
  // working capital: you can only sell what you can afford to stock and fund
  const wcPerUnit = unitPrice * (T.wc||0.25);
  // What you can actually stock is funded three ways: your own cash, the equipment
  // you can borrow against, and — the big one — the credit your suppliers extend.
  // That last one is a relationship, and it is the first thing to disappear.
  const supplyBase = Math.max(0,b.cash) + 0.6*Math.max(0,b.capex)
    + (b.supplierConf===undefined?70:b.supplierConf)/100 * Math.max(0,(b.lastRevenue||b.revenue||0)) * (T.wc||0.25) * 1.4
    * clamp((b.supplierDays||30)/30, 0.4, 4.0);
  const wcUnits = wcPerUnit>0 ? supplyBase / wcPerUnit : 1e9;
  const ceilingUnits = ((T.ceiling/4)*inflF)/unitPrice * outletCount(b);   // a real ceiling, not a nominal one
  units = Math.min(units, wcUnits, ceilingUnits);
  let revenue = units * unitPrice;
  // contracted work sits on top of walk-in trade, at whatever margin you bid
  const cRev = contractRevenue(b);
  const cCost = contractCost(b);
  revenue += cRev;
  // competitors arrive. Your margin erodes unless you keep investing in quality.
  // Competitors arrive and your margin erodes with age. You buy it back by
  // investing in the product and in the machinery — that is what those levers are for.
  const compression = Math.min(0.12, age*0.0030);
  const defence = (b.quality-50)/380 + (b.auto||0)/520 + (b.brand||0)/Math.max(1, 4000000 + (b.revenue||0))*0.05;
  const effMargin = clamp(T.margin - compression + defence, 0.05, 0.92);
  let cogs = (revenue - cRev) * (1 - effMargin) * (1 + theftRate(b)) * supplyCogsMult(b) + cCost;
  // opex
  /* a second shift is paid for in wages and in goodwill, not in equipment */
  const salaries = Math.round(staffMonthly(b)*3*shiftWageMult(b));
  const rent = Math.round(outletRent(b) * inflF * CITY().payMult);
  const nOut = outletCount(b);
  // organisations accumulate overhead as they age unless somebody keeps cutting
  const overhead = Math.round(260000*nOut*inflF*CITY().payMult*0.6 + revenue*(0.032 + Math.min(0.028, age*0.0008)));
  const power = Math.round((1 - m.power/100) * T.power * 900000 * nOut * inflF * CITY().payMult*0.6);
  const quality = (b.qualitySpendMonthly||0)*3;
  const _chanCut = channelCut(b, revenue);
  let opex = salaries + rent + b.marketing + overhead + power + quality + _chanCut;
  let gross = revenue - cogs;
  // A management charge is a real cost here and real income at the holdco. It is
  // deductible down here — which is precisely why the revenue service cares how big it is.
  const _mgmtFee = Math.round(revenue * (((S.holdco && S.holdco.mgmt) ? (S.holdco.mgmt[b.id]||0) : 0)/100));
  if(_mgmtFee > 0){ opex += _mgmtFee; b.cash -= _mgmtFee; b.mgmtFeeQ = _mgmtFee; }
  else { b.mgmtFeeQ = 0; }
  let profitBeforeTax = gross - opex;
  let tax = 0;
  if(b.formal && profitBeforeTax > 0) tax = profitBeforeTax * (0.20 + (b.taxLoad||0));
  let profit = profitBeforeTax - tax;
  // rent + salaries must be paid even in a bad quarter
  b.cash += profit;
  bizDeep(b, revenue, profit, {salaries:salaries, cogs:cogs});
  b.revenue = Math.round(revenue); b.cogs = Math.round(cogs); b.opex = Math.round(opex);
  b.tax = Math.round(tax); b.profit = Math.round(profit);
  b.chanCutQ = _chanCut; b.cogsMultQ = supplyCogsMult(b);
  b.retained = Math.round((b.retained||0) + (b.profit||0));
  b.culture = Math.round(companyCulture(b));
  b.ccc = cccOf(b);
  allocateOutlets(b, b.revenue, b.cogs, b.opex, b.profit);
  const _dep = Math.round((b.capex||0)*0.05);
  const _int = Math.round((b.debt||0)*0.055);
  const _ebitda = Math.round(profitBeforeTax + _dep + _int);
  b.history.push({turn:S.turn, revenue:b.revenue, cogs:b.cogs, opex:b.opex, profit:b.profit,
    units:Math.round(units), gross:Math.round(gross), ebitda:_ebitda, dep:_dep, int:_int, tax:b.tax,
    cash:Math.round(b.cash), recv:Math.round(b.recv||0), inv:Math.round(b.inventory||0),
    pay:Math.round(b.payable||0), staff:(b.staff||[]).length, out:outletCount(b),
    cap:Math.round(b.capacity||0), dem:Math.round(demand||0), debt:Math.round(b.debt||0)});
  if(b.history.length>40) b.history.shift();
  b.capexQ  = Math.max(0, Math.round((b.capex||0) - (b._capexMark||0)));
  b._capexMark = Math.round(b.capex||0);
  b.capex12 = Math.round(Math.max(0,(b.capex12||0)*0.75 + (b.capexQ||0)));
  // reputation dynamics
  // Reputation is measured on what actually happened, and exactly one thing can
  // damage it per quarter. Running flat out and running out of stock are the
  // same event, not two.
  if(b.capacity>0 && units >= b.capacity*0.96){ b.rep = clamp(b.rep-1.5,0,100); b.notes.push('You sold out — customers were turned away.'); }
  else if(serviceFail && b.capacity>0 && units < b.capacity*0.88 && lostToStock > Math.max(2, b.capacity*0.08)){
    b.rep = clamp(b.rep-1.2,0,100);
  }
  else if(units < b.capacity*0.55 && b.capacity>20){ b.notes.push('Idle capacity. You are paying for output you are not selling.'); }
  b.rep = clamp(b.rep + (b.quality-50)*0.035 + (50-b.rep)*0.05, 0, 100);
  if(b.priceOver > 0.02){
    b.rep = clamp(b.rep - (1.2 + b.priceOver*9), 0, 100);
    b.notes.push('You are charging ' + Math.round((b.priceOver + 1)*100 - 100) +
      '% above what this business has earned the right to charge. People have noticed, and they are telling each other.');
  }
  if((b.discountMemory||0) > 0.45)
    b.notes.push('The market has learned to wait for your discounts. Putting prices back up will cost you more than the cuts ever bought.');
  // staff morale
  b.staff.forEach(s=>{
    const fair = marketSalary(s.skill);
    const ratio = s.salary/fair;
    const tr = traitOf(s.trait);
    const tenure = Math.min(7, (S.turn - (s.joined||S.turn))*0.28);
    const profitHit = profit<0 ? (profit < -(revenue||0)*0.15 ? -6 : -2.5) : 3;
    const shiftWear = leverActive(b,'shifts') ? -3.2 : 0;   /* nights, weekends, and the people who stop coming */
    let dm = (ratio-1)*16 + profitHit + (ownerTimeEff()*2) + tenure - (b.staff.length>9?1.2:0) + shiftWear + R.gauss(0,3);
    s.morale = clamp(s.morale + dm, 3, 100);
    s.loyalty = clamp((s.loyalty||50) + (tr.loyalty||0)*0.12 + (ratio>1.05?1.5:-1.2), 0, 100);
  });
  // attrition
  const quitters = [];
  b.staff.forEach(s=>{
    /* Nobody quits in the quarter they joined. They have just negotiated,
       signed and served nothing; more to the point, you paid a recruitment
       fee for them, and having them vanish before they are ever on the
       payroll meant hiring was a coin flip in any mediocre firm. */
    if((S.turn - (s.joined||S.turn)) < 1) return;
    const tr = traitOf(s.trait);
    const tenureHold = Math.min(0.06, (S.turn-(s.joined||S.turn))*0.006);
    let p = 0.018 + (s.morale<32?0.16:0) + (100-(s.loyalty||50))/1400 + (s.salary<marketSalary(s.skill)*0.85?0.10:0) - tenureHold;
    // people who are happy and well paid are not quietly updating their CVs
    if(s.morale > 68) p *= 0.38;
    if(s.salary > marketSalary(s.skill)*1.08) p *= 0.60;
    if((b.staffTrust||55) > 70) p *= 0.72;
    p = clamp(p, 0, 0.42);
    if(R.chance(p)) quitters.push(s);
  });
  quitters.forEach(s=>{ b.staff = b.staff.filter(x=>x.id!==s.id);
    b.notes.push(s.name+' resigned.'); log('biz', s.name+' left '+b.name+'. '+(s.morale<30?'You saw it coming.':'You did not see it coming.'), 'warn'); });
  b.morale = b.staff.length ? Math.round(b.staff.reduce((a,s)=>a+s.morale,0)/b.staff.length) : 65;
  // owner skill accumulation
  S.p.skills.ops = clamp(S.p.skills.ops + (b.staff.length>0?0.9:0.5) + (profit>0?0.5:0.2), 0, 100);
  S.p.skills.finance = clamp(S.p.skills.finance + (revenue>0?0.4:0), 0, 100);
  // collapse check — one company dying does not take the rest with it
  if(b.cash < -Math.max(2000000, b.revenue*0.9) && R.chance(0.5)){
    closeBiz('The debts outran the business.', b);
    return 0;
  }
  return b.profit;
}
/* ---------------------- the deep operating model --------------------------- */
/* Everything below runs after the headline P&L is booked. It is the difference
   between a business that shows a profit and a business that has money.        */
/* ===========================================================================
   Working capital and the cash conversion cycle

   The counterintuitive lesson: profitable companies go bust because they are
   growing. Every naira of new revenue has to be financed - as stock before it
   is sold, as a receivable after it is - and the cash leaves quarters before
   the profit arrives. The cycle is:

       DSO (days sales outstanding) + DIO (days inventory) - DPO (days payables)
       = CCC, the number of days your cash is stuck inside the business.

   Grow by X% and you must fund X% more cycle, today. That bill is not on the
   P&L. It is the single most common way a real business dies, and until now
   it was invisible: service level depended on the stock *setting* rather than
   on whether the stock had actually been paid for, so a business that could
   not fund its inventory still served every customer who walked in.
   =========================================================================== */
function wcPolicy(b){ return b.stockPolicy===undefined ? 0.45 : b.stockPolicy; }
function wcTargetInv(b, revenue){
  const T = BIZ.find(x=>x.id===b.type);
  return Math.max(0, (revenue||0) * (T.wc||0.25) * (0.35 + wcPolicy(b)*1.5));
}
function wcCollectRate(b){
  return clamp(0.55 + (b.compliance||40)/280 +
    ((b.staff||[]).some(function(x){ return x.trait==='connected'; }) ? 0.08 : 0)
    - (S.mkt.demand<0.85 ? 0.10 : 0) - ((b.creditTerms||0)>0.7 ? 0.10 : 0), 0.22, 0.96);
}
const WC_DAYS = 91;                                   // a quarter
function cccOf(b){
  const rev  = Math.max(1, (b.revenue||0));
  const cogs = Math.max(1, (b.cogs||0));
  /* rounded first, then summed: the parts on screen have to add up to the
     whole on screen, or the player does the arithmetic and stops trusting it */
  const dso = Math.round((b.recv||0)      / rev  * WC_DAYS);
  const dio = Math.round((b.inventory||0) / cogs * WC_DAYS);
  const dpo = Math.round((b.payable||0)   / cogs * WC_DAYS);
  const ccc = dso + dio - dpo;
  return { dso:dso, dio:dio, dpo:dpo, ccc:ccc,
           tied: Math.round(Math.max(0, (b.recv||0) + (b.inventory||0) - (b.payable||0))) };
}
/* The bill for a quarter of growth, in cash, before any of it comes back.
   This is the number a growing business does not see coming. */
function growthBill(b, g){
  const T = BIZ.find(x=>x.id===b.type);
  const dRev = Math.max(0, (b.revenue||0) * (g||0));
  const recvDrag = dRev * clamp((b.creditTerms||0)*0.85, 0, 0.80) * (1 - wcCollectRate(b));
  const invDrag  = dRev * (T.wc||0.25) * (0.35 + wcPolicy(b)*1.5);
  const supFund  = invDrag * 0.25;                    // suppliers fund part of the stock
  return Math.round(Math.max(0, recvDrag + invDrag - supFund));
}
/* How much of the stock you want you could actually pay for. Nothing else in
   the model punished a business for not funding its own inventory. */
function wcFunded(b, revenue){
  const target = wcTargetInv(b, revenue);
  if(target <= 0) return 1;
  return clamp((b.inventory||0) / target, 0, 1);
}
function bizDeep(b, revenue, profit, ctx){
  const T = BIZ.find(x=>x.id===b.type);
  b.quarters = (b.quarters||0) + 1;
  if(profit>0) b.everProfitable = (b.everProfitable||0)+1;
  b.lastRevenue = b.revenue;
  const inflF = S.cumInfl / b.startInfl;

  /* --- 1. Receivables. Selling on credit buys volume and defers cash. ------- */
  const creditShare = clamp((b.creditTerms||0) * 0.85, 0, 0.80);
  const newRecv = Math.max(0, revenue * creditShare);
  b.recv = (b.recv||0) + newRecv;
  const collectRate = wcCollectRate(b);
  const collected = b.recv * collectRate;
  b.recv -= collected;
  const writeOff = b.recv * clamp(0.020 + (1-collectRate)*0.16, 0.01, 0.14);
  b.recv = Math.max(0, b.recv - writeOff);
  b.badDebtQ = Math.round(writeOff);
  b.cash -= newRecv;      // credit sales are not cash this quarter
  b.cash += collected;    // this quarter's collections are
  b.cash -= writeOff;     // and some of it never arrives

  /* --- 2. Inventory. Stock is cash that has stopped being liquid. ----------- */
  const targetInv = wcTargetInv(b, revenue);
  const invGap = targetInv - (b.inventory||0);
  if(invGap > 0){
    const buy = Math.min(invGap, Math.max(0, b.cash*0.75));
    b.inventory = (b.inventory||0) + buy; b.cash -= buy;
  } else {
    const release = Math.min(-invGap, (b.inventory||0), Math.max(0, revenue*(T.wc||0.25)*0.5));
    b.inventory = (b.inventory||0) - release; b.cash += release*0.9;   // you rarely sell stock back at cost
  }
  // spoilage / shrinkage / obsolescence
  const shrink = (b.inventory||0) * clamp(0.012 + theftRate()*1.4 + (T.id==='food'?0.030:T.id==='agri'?0.026:0.008), 0, 0.10);
  b.inventory = Math.max(0, (b.inventory||0) - shrink);
  b.shrinkQ = Math.round(shrink);

  /* --- 3. Payables. The free loan suppliers give you, until they don't. ----- */
  if(b.cash < 0){
    const stretch = Math.min(-b.cash, Math.max(0, cogsSafe(ctx)*0.60));
    if(stretch > 0){
      b.payable = (b.payable||0) + stretch; b.cash += stretch;
      b.supplierConf = clamp((b.supplierConf===undefined?70:b.supplierConf) - (5 + stretch/Math.max(1,revenue)*22), 0, 100);
      b.notes.push('You stretched suppliers by '+fmt(Math.round(stretch))+' to make the week.');
    }
  } else {
    const pay = Math.min((b.payable||0), b.cash*0.45);
    b.payable = (b.payable||0) - pay; b.cash -= pay;
    b.supplierConf = clamp((b.supplierConf===undefined?70:b.supplierConf) + (pay>0?4:0) + 1.2, 0, 100);
  }
  // suppliers cut you off
  if(b.supplierConf < 22 && R.chance(0.35)){
    b.payable = Math.max(0, b.payable*0.5);
    b.cash -= Math.round(Math.max(0, revenue*0.10));
    b.notes.push('A key supplier has stopped supplying until the account is settled. You had to buy spot, at spot prices.');
    log('biz','A supplier cut you off. Buying spot is more expensive, which is the point.','bad');
    b.supplierConf = clamp(b.supplierConf+12,0,100);
  }

  /* --- 4. Wages. If you miss payroll, the business changes character. ------- */
  const wageBill = (ctx && ctx.salaries) || staffMonthly(b)*3;
  if(wageBill > 0 && b.cash < wageBill*0.5){
    const shortfall = wageBill - Math.max(0, b.cash*0.9);
    b.arrears = (b.arrears||0) + Math.max(0, shortfall);
    b.staff.forEach(function(x){ x.morale = clamp(x.morale - 14, 3, 100); x.loyalty = clamp(x.loyalty-12,0,100); });
    b.staffTrust = clamp((b.staffTrust===undefined?55:b.staffTrust) - 16, 0, 100);
    b.notes.push('You could not pay salaries in full. Everyone knows by the next morning.');
    log('biz','You missed payroll at '+b.name+'. Arrears now '+fmt(Math.round(b.arrears||0))+'.','bad');
  } else if((b.arrears||0) > 0){
    const clear = Math.min(b.arrears, Math.max(0, b.cash*0.4));
    b.arrears -= clear; b.cash -= clear;
    if(clear>0){ b.staffTrust = clamp(b.staffTrust+8,0,100); b.staff.forEach(function(x){ x.morale = clamp(x.morale+6,3,100); }); }
  }

  /* --- 5. Owner draw. Taking money out is a decision, not a reward. --------- */
  const want = Math.max(0, b.draw||0);
  if(want > 0){
    const take = Math.min(want, Math.max(0, b.cash));
    b.cash -= take; S.fin.cash += take;
    b.drawnQ = Math.round(take);
    if(take>0) b.notes.push('You drew '+fmt(Math.round(take))+' out of the business this quarter.');
    if(take < want*0.5) b.notes.push('The business could not fund the draw you asked for.');
  } else b.drawnQ = 0;

  /* --- 6. Compliance, tax and the state. ----------------------------------- */
  if(b.formal){
    const bookkeeping = clamp(28 + (b.staff.some(function(x){return x.skill>=6;})?18:0) + S.p.skills.finance*0.34
                        + (b.auto||0)*0.12 - b.locations*3 - b.products*2, 5, 95);
    b.compliance = clamp((b.compliance||40) + (bookkeeping - (b.compliance||40))*0.22 + R.gauss(0,1.6), 0, 100);
    b.taxRisk = clamp((b.taxRisk||0) + (52 - b.compliance)*0.09 + (revenue>Math.max(1,b.lastRevenue*1.8)?9:0) - 1.5, 0, 100);
  } else {
    b.compliance = clamp((b.compliance||40) - 0.4, 0, 100);
    b.taxRisk = clamp((b.taxRisk||0) + (revenue>20000000?3.4:1.2) - 1.0, 0, 100);
  }
  /* Your own accountant works across every company you own; that is the point of having one. */
  const _acctTax = clamp(staffSupport('tax'), 0, 22), _acctCom = clamp(staffSupport('compliance'), 0, 20);
  if(_acctTax>0) b.taxRisk    = clamp((b.taxRisk||0)    - _acctTax*0.34, 0, 100);
  if(_acctCom>0) b.compliance = clamp((b.compliance||40)+ _acctCom*0.45, 0, 100);
  /* Benefit in kind: your own household staff sitting on the company payroll. */
  const _bikHidden = (S.house||[]).filter(function(h){ return h.payer===b.id && !h.declared; });
  if(_bikHidden.length){
    b.taxRisk = clamp((b.taxRisk||0) + _bikHidden.length*1.8, 0, 100);
    b.notes.push(_bikHidden.length+' member'+(_bikHidden.length>1?'s':'')+' of your household staff '+
      (_bikHidden.length>1?'are':'is')+' on this company payroll and not declared as a benefit in kind. '+
      'That is a tax exposure sitting there with your name on it.');
  }
  if(b.taxRisk > 78 && !S.flags.auditDue && R.chance(0.35)){ S.flags.auditDue = true; }
  // informal businesses get shaken down; formal ones get assessed
  if(!b.formal && revenue > 12000000 && R.chance(0.10 * (D().heat||1))){
    const ask = Math.round(Math.max(120000, revenue*0.018)*inflF);
    b.cash -= ask; b.notes.push('An inspector came by. '+fmt(ask)+' settled it informally.');
    log('biz','A visit from the local authority. '+fmt(ask)+' and it went away.','warn');
  }

  /* --- 7. Leases are handled per unit in stepOutlets(); surface the notes. --- */
  b.lease = (b.outlets && b.outlets[0]) || b.lease || null;
  (b.outletNotes||[]).forEach(function(n){
    log('biz', n.text, n.level==='bad'?'bad':'warn');
    if(n.level==='bad') S.flags.mustRelocate = true;
    b.notes.push(n.text);
  });

  /* --- 8. Key client concentration. ---------------------------------------- */
  if(b.keyClient){
    b.keyClient.turns = (b.keyClient.turns||0) - 1;
    b.keyClient.share = clamp(b.keyClient.share + R.gauss(0,0.02), 0.03, 0.75);
  } else if(b.quarters > 5 && revenue > 8000000 && R.chance(0.09)){
    b.keyClient = {name:R.pick(['a supermarket chain','a government MDA','a telco','a hotel group','an oil services firm','a church organisation','a school group','a diaspora buyer']),
      share:R.range(0.18,0.42), turns:R.int(4,10), payDays:R.int(30,120)};
    log('biz', b.keyClient.name+' has become a serious share of your revenue. That is good news with an expiry date.','warn');
  }

  /* --- 9. Incidents decay. -------------------------------------------------- */
  if(b.incidents && b.incidents.length){
    b.incidents.forEach(function(i){ i.turns -= 1; });
    b.incidents = b.incidents.filter(function(i){ return i.turns>0; });
  }

  /* --- 10. Contracts run, pay late, and go wrong. --------------------------- */
  if(b.contracts && b.contracts.length){
    (b.contracts||[]).forEach(function(c){
      if(!c.value) return;
      // contracted revenue arrives on the client's terms, not yours
      const days = Math.max(0, c.payDays||30);
      const onTime = clamp(1 - days/150, 0.05, 1);
      // The P&L already booked this revenue and its cost. All that happens here
      // is the timing: whatever the client has not paid yet becomes a receivable.
      const gross = c.value;
      b.cash -= Math.round(gross*(1-onTime));
      b.recv = (b.recv||0) + Math.round(gross*(1-onTime));
    });
    const cNotes = stepContracts(b);
    cNotes.forEach(function(n){ log('biz', n.text, n.level==='bad'?'bad':'warn'); b.notes.push(n.text); });
  }

  b.diag = bizDiag(b);
  b.stage = bizStage(b);
}
function cogsSafe(ctx){ return (ctx && ctx.cogs) || Math.max(0, (S.biz&&S.biz.cogs)||0); }

/* --------------------------- lifecycle + diagnosis -------------------------- */
function bizStage(b){
  if(!b) return 'none';
  const age = Math.max(0, S.turn - b.foundedTurn);
  const rev = b.revenue||0;
  if(age < 5 || rev < 1500000) return 'startup';
  if((b.everProfitable||0) < 3) return 'survival';
  if(b.locations<=1 && rev < 60000000) return 'traction';
  if(rev < (b.lastRevenue||0)*1.35 && (b.everProfitable||0) > 8 && age > 26) return 'decline';
  if(b.locations>=3 || rev > 250000000) return 'scale';
  return 'maturity';
}
/*@table:BIZ_STAGES@*/
function bizDiag(b){
  const out = []; if(!b) return out;
  const rev = Math.max(1, b.revenue||0);
  const push = (lvl,txt,key)=>out.push({level:lvl, text:txt, key:key});
  // receivables
  const recvQ = (b.recv||0)/rev;
  if(recvQ > 1.1) push('bad','You are owed '+fmt(Math.round(b.recv))+' — '+recvQ.toFixed(1)+' quarters of revenue. You are financing your customers.','recv');
  else if(recvQ > 0.6) push('warn','Receivables are '+recvQ.toFixed(1)+' quarters of revenue. Watch the ageing.','recv');
  if((b.badDebtQ||0) > rev*0.03) push('warn','You wrote off '+fmt(b.badDebtQ)+' in bad debt this quarter.','recv');
  // payables
  const payQ = (b.payable||0)/rev;
  if(payQ > 0.8) push('bad','You owe suppliers '+fmt(Math.round(b.payable))+'. They are close to cutting you off.','pay');
  else if((b.supplierConf!==undefined && b.supplierConf<45)) push('warn','Supplier confidence is '+Math.round(b.supplierConf)+'/100. They are watching the account.','pay');
  // inventory
  const invQ = (b.inventory||0)/rev;
  if(invQ > 1.4) push('warn','Inventory is '+invQ.toFixed(1)+' quarters of revenue sitting on a shelf.','inv');
  if((b.shrinkQ||0) > rev*0.018) push('warn','Shrinkage and spoilage cost '+fmt(b.shrinkQ)+' this quarter. Some of that is theft.','inv');
  // labour
  if(b.arrears>0) push('bad','You owe '+fmt(Math.round(b.arrears))+' in unpaid wages.','people');
  if(b.morale<35 && b.staff.length) push('bad','Morale is '+Math.round(b.morale)+'. People are updating their CVs.','people');
  else if(b.morale<50 && b.staff.length) push('warn','Morale is '+Math.round(b.morale)+'. Not a crisis yet.','people');
  if(b.staff.length===0 && b.locations>=1) push('warn','You are doing everything yourself.','people');
  // concentration
  if(b.keyClient && b.keyClient.share>0.30) push('warn','One customer ('+b.keyClient.name+') is about '+Math.round(b.keyClient.share*100)+'% of revenue.','conc');
  // cost structure
  const rentQ = (b.lease && b.lease.rent ? b.lease.rent*3 : 0);
  if(rentQ/rev > 0.18) push('warn','Rent is '+Math.round(rentQ/rev*100)+'% of revenue.','cost');
  const wageShare = (staffMonthly()*3)/rev;
  if(wageShare > 0.35) push('warn','Wages are '+Math.round(wageShare*100)+'% of revenue.','cost');
  // cash
  const runway = (b.cash||0) / Math.max(1, Math.max(0,(b.opex||0))*0.8);
  if((b.cash||0) < 0) push('bad','The company is cash-negative by '+fmt(Math.round(-b.cash))+'.','cash');
  else if(runway < 1) push('bad','You have under one quarter of operating cash left.','cash');
  // compliance
  if(b.taxRisk > 70) push('bad','Tax exposure is high. An assessment is likely.','tax');
  else if(b.compliance < 30 && b.formal) push('warn','Your books would not survive a serious look.','tax');
  // capacity
  if(b.capacity>0 && (b.units||0) < b.capacity*0.5) push('warn','You are running at '+Math.round((b.units||0)/Math.max(1,b.capacity)*100)+'% of capacity.','ops');
  if(b.capacity>0 && (b.units||0) > b.capacity*0.95) push('warn','You are at capacity. Demand is being turned away.','ops');
  return out;
}

function genCandidate(qualityBoost){
  const boost = qualityBoost||0;
  const skill = Math.round(clamp(R.gauss(4.6 + boost + S.p.rep/60, 1.9), 1, 10));
  const trait = R.weighted(TRAITS, t=>{
    if(t.id==='genius') return 0.5 + boost*0.3;
    if(t.id==='thief') return 1.0;
    if(t.id==='lazy') return 1.2;
    if(t.id==='loyal') return 1.1;
    return 1.6;
  }) || TRAITS[6];
  const sal = Math.round(marketSalary(skill) * (1 + (trait.salary||0)) * R.range(0.9,1.16));
  return { id:'s'+(++S.seq), name:R.pick(FIRST)+' '+R.pick(LAST), skill:skill, trait:trait.id,
           salary:sal, ask:Math.round(sal*R.range(1.05,1.30)),
           role:R.weighted(['ops','sales','support','finance'],function(x){ return x==='ops'?1.4:x==='sales'?1.2:x==='support'?1.0:0.5; })||'ops',
           outlet:null, trained:0, title:R.pick(['Officer','Assistant','Associate','Executive']),
           morale:clamp(62+R.gauss(0,10),20,95), loyalty:clamp(48+(trait.loyal||0)*0.5+R.gauss(0,12),5,98),
           joined:S.turn };
}
/*@table:STAFF_ROLES@*/
function staffSkillAvg(b){ const st=(b&&b.staff)||[]; return st.length? st.reduce(function(a,x){return a+x.skill;},0)/st.length : 0; }

/* =========================================================================
   The household - staff you employ for your own life
   -------------------------------------------------------------------------
   Nobody puts these people on an organogram. They are the reason you can be
   in two places, why the house works, and why you are not cooking at eleven
   at night before a board meeting. They also cost money every single month,
   they drift like any employee, and the good ones are the only thing in this
   game that gives you back hours rather than taking them.
   ========================================================================= */
/*@table:HOUSE_ROLES@*/
/*@table:HOUSE_PERKS@*/
function houseRoleAvail(k){
  const R0 = HOUSE_ROLES[k]; if(!R0) return false;
  if(R0.req==='kids')   return (S.p.kids||0) > 0;
  if(R0.req==='assets') return ((S.assets||[]).length>0 || bizList().length>0);
  if(R0.req==='biz')    return bizList().length > 0;
  return true;
}
function houseBasePay(roleId){ const R0=HOUSE_ROLES[roleId]; return (R0?R0.pay:1) * 165000; }
function houseSalaryFor(roleId, skill){
  const R0 = HOUSE_ROLES[roleId]; if(!R0) return 0;
  const sk = 0.72 + (clamp(skill,1,10)/10)*0.62;   // 0.78x at skill 1, 1.34x at skill 10
  const talent = (S && S.tune) ? (S.tune.talent||1) : 1;
  return Math.max(30000, Math.round(houseBasePay(roleId) * sk * CITY().payMult * S.cumInfl * talent));
}
function housePerkCost(h){
  const pk = (h && h.perks) || {};
  return Object.keys(HOUSE_PERKS).reduce(function(a,k){
    return a + (pk[k] ? Math.round((h.salary||0)*HOUSE_PERKS[k].cost) : 0); },0);
}
function houseMonthly(){ return (S.house||[]).reduce(function(a,h){ return a+(h.salary||0)+housePerkCost(h); },0); }
function houseMonthlyYou(){
  return (S.house||[]).filter(function(h){ return (h.payer||'you')==='you'; })
    .reduce(function(a,h){ return a+(h.salary||0)+housePerkCost(h); },0);
}
/* Declared benefit in kind is grossed up for tax. Undeclared is cheaper today and is a
   liability with your name on it. That choice is the whole mechanic. */
function houseMonthlyBiz(bid){
  return (S.house||[]).filter(function(h){ return h.payer===bid; }).reduce(function(a,h){
    const c = (h.salary||0)+housePerkCost(h);
    return a + c + (h.declared ? Math.round(c*0.30) : 0);
  },0);
}
/* How much of what you hired them for you actually get. Skill, morale, tenure and
   performance all move it. A brilliant, miserable, three-week-old hire delivers very little. */
function houseQ(h){
  const skillF  = 0.42 + (clamp(h.skill,1,10)/10)*0.78 + (h.trained||0)*0.05;
  const moraleF = clamp(0.35 + ((h.morale===undefined?60:h.morale)/100)*0.95, 0.20, 1.15);
  const tenF    = 1 + Math.min(0.25, Math.max(0,(S.turn-(h.joined||S.turn)))/40);
  const perfF   = 0.70 + ((h.perf===undefined?60:h.perf)/100)*0.60;
  return clamp(skillF*moraleF*tenF*perfF, 0, 1.60);
}
function staffSupport(tag){
  return (S.house||[]).reduce(function(a,h){
    const R0 = HOUSE_ROLES[h.role]; if(!R0 || !R0.fx || !R0.fx[tag]) return a;
    return a + R0.fx[tag]*houseQ(h);
  },0);
}
/* Hours given back. This is the entire point of employing people for your own life. */
function houseTimeBoost(){ return clamp(staffSupport('time'), 0, 0.42); }
function ownerTimeEff(){
  const base = ownerTime();
  return clamp(base + houseTimeBoost(), 0, 1.30);
}
function gmCoverQ(){ return clamp(staffSupport('gmCover'), 0, 1); }

function genHouseCand(roleId){
  const R0 = HOUSE_ROLES[roleId]; if(!R0) return null;
  const skill = Math.round(clamp(R.gauss(4.2 + (S.p.rep||40)/70, 1.9), 1, 10));
  const trait = R.weighted(TRAITS, function(t){
    if(t.id==='genius') return 0.30;
    if(t.id==='thief')  return R0.tier==='home' ? 1.6 : 0.8;
    if(t.id==='lazy')   return 1.30;
    if(t.id==='loyal')  return 1.20;
    return 1.50;
  }) || TRAITS[6];
  const sal = houseSalaryFor(roleId, skill);
  return { id:'h'+(++S.seq), role:roleId, name:R.pick(FIRST)+' '+R.pick(LAST),
    skill:skill, trait:trait.id, salary:sal, ask:Math.round(sal*R.range(1.06,1.32)),
    morale:clamp(60+R.gauss(0,10),20,95), loyalty:clamp(46+(trait.loyal||0)*0.5+R.gauss(0,12),5,98),
    joined:S.turn, trained:0, perf:60, quarters:0, perks:{}, payer:'you', declared:false,
    suspicion:0, ref:R.pick(['a cousin of somebody who already works for you',
      'an agency that has sent you two bad ones already','a family you know from church',
      'a referral from a friend you trust','a card in a shop window']) };
}
function refreshHouseCands(){
  const avail = Object.keys(HOUSE_ROLES).filter(houseRoleAvail);
  if(!avail.length){ S.houseCands = []; return; }
  const n = clamp(2 + Math.floor(R.f()*3), 2, Math.min(5, avail.length));
  S.houseCands = R.pickN(avail, n).map(function(k){ return genHouseCand(k); }).filter(Boolean);
}
function hireHouse(c, salary, payer){
  c.salary  = Math.round(salary);
  c.payer   = payer || 'you';
  c.joined  = S.turn; c.morale = 68; c.perf = 60; c.quarters = 0;
  c.loyalty = clamp(c.loyalty, 20, 95);
  S.fin.cash -= Math.round(c.salary*0.5);            // finding and placing them costs something
  S.house = (S.house||[]).concat([c]);
  S.houseCands = (S.houseCands||[]).filter(function(x){ return x.id!==c.id; });
  const who = c.payer==='you' ? 'you' : ((bizById(c.payer)||{}).name || 'a company');
  log('life','You employed '+c.name+' as '+(HOUSE_ROLES[c.role]||{label:'staff'}).label.toLowerCase()+
    ' at '+fmt(c.salary)+' a month, paid by '+who+'.','neutral');
  return c;
}
function fireHouse(id, sev){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  const amount = Math.max(0, Math.round(sev||0));
  S.fin.cash -= amount;
  S.house = (S.house||[]).filter(function(x){ return x.id!==id; });
  S.house.forEach(function(o){ o.morale = clamp(o.morale-6,3,100); o.loyalty = clamp(o.loyalty-5,0,100); });
  log('life','You let '+h.name+' go. Severance '+fmt(amount)+'. The house is quieter and everybody else is watching.','warn');
  if(h.loyalty < 45 || h.morale < 40){
    S.p.rep = clamp(S.p.rep-1.2,0,100);
    log('life','People talk. A household that leaves unhappy takes your name with it.','warn');
  }
}
function houseTrain(id){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  const cost = Math.round((h.salary||0)*0.9);
  if(S.fin.cash < cost){ toast('Training costs '+fmt(cost)+'.'); return; }
  S.fin.cash -= cost; h.trained = (h.trained||0)+1;
  if((h.trained||0)%2===1) h.skill = clamp(h.skill+1,1,10);
  h.morale = clamp(h.morale+7,3,100); h.loyalty = clamp(h.loyalty+5,0,100);
  log('life','You paid for '+h.name+' to be trained properly. Skill is now '+h.skill+'/10.','good');
}
function houseRaise(id, pctv){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  h.salary = Math.round((h.salary||0)*(1+pctv));
  h.morale = clamp(h.morale+pctv*70,3,100); h.loyalty = clamp(h.loyalty+pctv*45,0,100);
  log('life','You raised '+h.name+' to '+fmt(h.salary)+' a month.','good');
}
function housePerkToggle(id, key){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  const P = HOUSE_PERKS[key]; if(!P) return;
  h.perks = h.perks||{};
  if(!h.perks[key]){ h.perks[key] = true;  h.morale = clamp(h.morale+P.morale,3,100);      h.loyalty = clamp(h.loyalty+P.loyalty,0,100); }
  else             { h.perks[key] = false; h.morale = clamp(h.morale-P.morale*0.8,3,100);  h.loyalty = clamp(h.loyalty-P.loyalty*0.5,0,100); }
}
function houseReassign(id, roleId){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  const R0 = HOUSE_ROLES[roleId]; if(!R0) return;
  h.role = roleId;
  h.salary = Math.max(h.salary||0, houseSalaryFor(roleId, h.skill));
  h.morale = clamp(h.morale-5,3,100);
  log('life','You moved '+h.name+' to '+R0.label.toLowerCase()+'. They will take a few months to be any good at it.','neutral');
}
function houseSetPayer(id, payerId){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  h.payer = payerId || 'you';
  if(h.payer==='you') h.declared = false;
  log('life',(HOUSE_ROLES[h.role]||{label:'Staff'}).label+' '+h.name+' is now paid by '+
    (h.payer==='you' ? 'you' : ((bizById(h.payer)||{}).name||'a company'))+'.','neutral');
}
function houseToggleDeclare(id){
  const h = (S.house||[]).find(function(x){ return x.id===id; }); if(!h) return;
  if((h.payer||'you')==='you') return;
  h.declared = !h.declared;
  log('life','Benefit in kind for '+h.name+' is now '+(h.declared?'declared and grossed up for tax':'left undeclared')+'.','warn');
}
/* One quarter of household life: pay, drift, loyalty, theft, and who walks out. */
function stepHouse(){
  const list = S.house||[];
  if(!list.length){ refreshHouseCands(); return; }
  let personalCost = 0;
  const quitters = [];
  list.forEach(function(h){
    const tr = traitOf(h.trait);
    h.quarters = (h.quarters||0)+1;
    const fair   = houseSalaryFor(h.role, h.skill);
    const ratioV = (h.salary||0)/Math.max(1,fair);
    const pk = h.perks||{};
    let perkM = 0;
    Object.keys(HOUSE_PERKS).forEach(function(k){ if(pk[k]) perkM += HOUSE_PERKS[k].morale*0.6; });
    const mTarget = 50 + (ratioV-1)*30 + perkM;                 // pay and conditions set the level
    h.morale  = clamp(h.morale + (mTarget - h.morale)*0.32 + R.gauss(0,4), 3, 100);
    h.loyalty = clamp(h.loyalty + ((ratioV-1)*16 + (pk.bonus?4:0) + (h.morale>62?2.2:-3.0))*0.5 + R.gauss(0,2.2), 0, 100);
    h.perf    = clamp(46 + h.skill*3.2 + (tr.output||0)*18 + (h.morale-60)*0.34 + (h.trained||0)*2.5 + R.gauss(0,7), 5, 99);
    // domestic staff are close to the money and close to everything you own
    if(tr.theft && R.chance(clamp(tr.theft*0.05*(h.morale<45?2.0:1.0),0,0.5))){
      const amt = Math.round(Math.min(Math.max(0,S.fin.cash)*0.06, (h.salary||0)*R.range(0.6,2.2)));
      if(amt>5000){
        S.fin.cash -= amt; h.suspicion = (h.suspicion||0)+1;
        log('life','Money has been going missing for weeks and you have known, in your gut, who it is. ('+fmt(amt)+')','bad');
      }
    }
    if((h.payer||'you')==='you') personalCost += Math.round(((h.salary||0)+housePerkCost(h))*3);
    /* Turnover. The base rate is low, but inflation raises the going rate every year,
       so a salary you never revisit quietly becomes an underpayment, and underpaid
       people leave. The pay review exists for exactly this reason. */
    const leave = clamp((ratioV<0.86?0.13:0.018) + (h.morale<32?0.14:0) + (h.loyalty<30?0.09:0)
                        - (h.loyalty>75?0.07:0) - ((h.quarters||0)<4?0.015:0), 0, 0.5);
    if((h.quarters||0)>0 && R.chance(leave*D().fail)) quitters.push(h);
  });
  if(personalCost>0){ S.fin.cash -= personalCost; tx('Household staff '+String.fromCharCode(8722)+fmt(personalCost)); }
  quitters.forEach(function(h){
    S.house = (S.house||[]).filter(function(x){ return x.id!==h.id; });
    log('life', h.name+' left. '+(h.morale<45
      ? 'They did not go quietly, and the version of you that now exists in other people is not one you would choose.'
      : 'You were not paying enough to keep them and both of you had known it for a while.'),'warn');
    if(h.morale<45) S.p.rep = clamp(S.p.rep-1.0,0,100);
    S.house.forEach(function(o){ o.morale = clamp(o.morale-4,3,100); });
  });
  refreshHouseCands();
}

function hasGM(b){ return !!(b && (b.staff||[]).some(function(x){ return x.role==='gm'; })); }
function outletStaff(b, oid){ return (b&&b.staff||[]).filter(function(x){ return x.outlet===oid; }); }
function promoteGM(b, sid){
  const st = (b&&b.staff||[]).find(function(x){ return x.id===sid; }); if(!st) return false;
  if((b.staff||[]).some(function(x){ return x.role==='gm'; })) return false;
  if(st.skill < 6) return false;
  const bump = Math.round(st.salary*0.55);
  st.role = 'gm'; st.salary += bump; st.morale = clamp(st.morale+22,3,100); st.loyalty = clamp(st.loyalty+20,0,100);
  log('biz', st.name+' becomes general manager of '+b.name+'. Pay up '+fmt(bump)+'/month, and you get your evenings back.','good');
  return true;
}
function trainStaff(b, sid, level){
  const st = (b&&b.staff||[]).find(function(x){ return x.id===sid; }); if(!st) return null;
  const cost = Math.round(st.salary*(level===2?7:2.6));
  if(b.cash < cost) return null;
  b.cash -= cost;
  const p = level===2 ? 0.62 : 0.34;
  if(st.skill>=10) return {ok:false, text:st.name+' is already at the top of the scale.'};
  if(R.chance(p)){
    st.skill = clamp(st.skill+1,1,10); st.trained = (st.trained||0)+1;
    st.morale = clamp(st.morale+9,3,100); st.loyalty = clamp(st.loyalty+8,0,100);
    log('biz','You paid for '+st.name+' to train. Skill is now '+st.skill+'/10.','good');
    return {ok:true, cost:cost, text:st.name+' came back better. Skill '+st.skill+'/10.'};
  }
  st.morale = clamp(st.morale+4,3,100);
  log('biz','You paid '+fmt(cost)+' towards training for '+st.name+'. It did not show up in the work.','neutral');
  return {ok:false, cost:cost, text:'The course did not take. '+st.name+' is grateful and no more skilled.'};
}
function hire(c){
  const b = S.biz, notice = 1;
  const fee = Math.round(c.salary*0.5);          // recruitment + first-month cost
  S.fin.cash -= fee;
  const st = Object.assign({}, c); st.morale = 68; st.loyalty = clamp(st.loyalty,20,95);
  /* They work a notice period before they arrive, and they are not useful the
     day they do. Both facts used to be free. */
  commitNew(b, { kind:'hire', label:'Hiring '+st.name, total:fee, paid:fee,
    lead:notice, breakPct:0.60, staff:st });
  log('biz','You offered '+st.name+' the job — skill '+st.skill+'/10, '+fmt(st.salary)+'/month. '+
    (traitOf(st.trait).name||'No particular trait')+'. They work their notice and join next quarter.','neutral');
}
function fire(id){
  const b=S.biz; const s=b.staff.find(x=>x.id===id); if(!s) return;
  if(s.leaving !== undefined) return;                  // already working notice
  const sev = Math.round(s.salary*(S.turn - (s.joined||S.turn) > 8 ? 2 : 1));
  S.fin.cash -= sev;
  /* They do not disappear. They work a notice period on your payroll, at
     reduced output, in front of everyone else. */
  s.leaving = S.turn + 1;
  b.staff.forEach(o=>{ if(o.id===id) return;
    o.morale = clamp(o.morale - 7, 3, 100); o.loyalty = clamp(o.loyalty-6,0,100); });
  b.rep = clamp(b.rep-1.5,0,100);
  log('biz','You gave '+s.name+' notice. Severance '+fmt(sev)+
    '. They are still on the payroll this quarter, and the room got quiet.','warn');
}
function giveRaise(id, pctv){
  const s=S.biz.staff.find(x=>x.id===id); if(!s) return;
  s.salary = Math.round(s.salary*(1+pctv)); s.morale = clamp(s.morale+pctv*70,3,100); s.loyalty = clamp(s.loyalty+pctv*45,0,100);
  log('biz','You raised '+s.name+'\'s pay by '+pct(pctv,0)+'. Morale jumped.','good');
}
function expandCost(){
  const b=S.biz, T=BIZ.find(x=>x.id===b.type);
  const cm = T.capex==='vhigh'?8 : T.capex==='high'?4.5 : T.capex==='med'?2.6 : 1.5;
  return Math.round(16000000 * cm * S.cumInfl * (1 + 0.35*Math.max(0,b.locations-1)));
}
function expandBiz(){
  const b=S.biz, T=BIZ.find(x=>x.id===b.type);
  const cost = expandCost();
  const dep  = Math.round(cost*0.35);
  if(S.fin.cash < dep){ toast('You need '+fmt(dep)+' up front to commit to another location.'); return false; }
  /* A location is not bought, it is committed to: a lease, a fit-out, a
     landlord, a hiring round. It takes quarters to arrive, it costs money
     the whole time, and abandoning it later costs most of what you have
     already spent. Lead time grows with distance from what you know. */
  const lead = 2 + ((b.locations||1) > 2 ? 1 : 0);
  S.fin.cash -= dep;
  commitNew(b, { kind:'unit', label:'Location #'+((b.locations||1)+1), total:cost,
    paid:dep, lead:lead, breakPct:0.30, city:S.city });
  log('biz','You committed to location #'+((b.locations||1)+1)+' — '+fmt(cost)+' all in, '+
    fmt(dep)+' now. Fit-out starts this quarter and it trades in about '+lead+
    ' quarters. Abandoning it later will cost you most of what you have already spent.','neutral');
  return true;
}
function formalizeBiz(){
  const b=S.biz; const cost = Math.round(450000*S.cumInfl);
  if(S.fin.cash<cost){ toast('Registration costs '+fmt(cost)+'.'); return false; }
  S.fin.cash -= cost; b.formal = true; b.rep = clamp(b.rep+6,0,100);
  S.fin.credit = clamp(S.fin.credit+5,0,100);
  log('biz','You registered the company. It costs you tax, and buys you access to banks, contracts and courts.','good');
  ensureGov(b);
  if(!(b.board||[]).some(function(d){ return !d.yours; })){
    log('biz','A registered company is supposed to have a board. You can fill the seats from the Governance tab, and whether you bother will be noticed.','neutral');
  }
  return true;
}
function drawFromBiz(amt){
  const b=S.biz; if(!b) return false;
  if(b.drawCap !== undefined && amt > b.drawCap){
    toast('The board capped your drawings at '+fmt(b.drawCap)+' a quarter.');
    amt = b.drawCap;
  }
  amt = Math.min(amt, Math.max(0, Math.floor(b.cash)));
  if(amt<=0){ toast('No distributable cash in the business.'); return false; }
  const net = Math.round(amt * (b.equity/100));
  b.cash -= amt; S.fin.cash += net;
  if(b.equity<100 && b.partner){ const theirs = amt - net; log('biz','You drew '+fmt(net)+'. '+b.partner.name+' took '+fmt(theirs)+'.','neutral'); }
  else log('biz','You paid yourself '+fmt(net)+' out of the business.','neutral');
  return true;
}
function injectBiz(amt){
  if(S.fin.cash < amt){ toast('Not enough cash.'); return false; }
  S.fin.cash -= amt; S.biz.cash += amt; S.biz.capex += Math.round(amt*0.4);
  log('biz','You put '+fmt(amt)+' of personal money into the business.','warn');
  return true;
}
function genPartnerOffer(){
  const capital = Math.round(R.range(0.6,2.4)*(S.biz? startBizCost(S.biz.type):3000000));
  const equity = Math.round(clamp(R.range(0.18,0.45),0.1,0.6)*100);
  return { id:'p'+(++S.seq), name:R.pick(FIRST)+' '+R.pick(LAST), capital:capital, equity:equity,
    skill:R.pick(['ops','finance','network','tech']), trust:Math.round(R.range(45,80)),
    bg:R.pick(['ex-banker with a book of clients','operator who has built and sold once','family money and a good surname','a hustler with distribution nobody else has','technical person who can actually build the thing']),
    ask: R.pick(['wants a board seat','wants monthly reporting','wants a signed founders agreement','wants their cousin on the payroll']) };
}
/* How many new shares carry `equityPct` of the company *after* they are
   issued. Getting this wrong by using the pre-issue total is the classic way
   to hand over more of a company than was agreed. */
function partnerSharesFor(b, equityPct){
  const e = clamp((equityPct||0)/100, 0.01, 0.60);
  const before = Math.max(1, totalShares(b));
  return Math.max(1, Math.round(before * e / (1 - e)));
}
/* Somebody buys into the company you already have.

   This is the promise the Deals card has been making since the partnership
   offers were written: capital in, equity out, and one thing they asked for
   minuted against you. The money lands in the company, not with you — which
   is the part people find out later. */
/* An offer can be sitting in S.offers (the Deals screen) or in the partner
   modal you are looking at. Two places to look for one thing is how the same
   bug shipped twice under the same button label. */
/* Addressed by id, not by position.

   With an index, the same click meant different things depending on which
   list happened to be checked first: with the partner modal open, index 0 was
   the modal's first offer, and a click aimed at the Deals screen silently
   acted on the wrong person. The id means one offer is one offer wherever it
   is showing. */
function offerById(id){
  const all = (S.offers || []).concat(((UI.modal && UI.modal.offers) || []));
  for (let i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}
/* and one place that knows how to take one off the table, from wherever it is */
function offerRemove(o){
  const m = UI.modal;
  if (m && m.offers) m.offers = m.offers.filter(function(x){ return x.id !== o.id; });
  S.offers = (S.offers || []).filter(function(x){ return x.id !== o.id; });
  if (m && m.type === 'partner' && !(m.offers || []).length) UI.modal = null;   /* nothing left to look at */
}
function takePartner(id){
  const b = S.biz, o = offerById(id);
  if(!b){ toast('There is no company to bring anyone into'); return; }
  if(!o) return;
  const eq = clamp(o.equity||0, 5, 60);
  const n = partnerSharesFor(b, eq);
  const p = Math.max(1, Math.round((o.capital||0) / Math.max(1, n)));
  const before = Math.max(1, totalShares(b));
  const afterPct = Math.round(n / (before + n) * 100);
  confirmBox('Bring in ' + o.name,
    '<b>'+fmt(o.capital)+'</b> into the company for <b>'+afterPct+'%</b> of it.'+
    '<br><br>They bring <b>'+esc(o.skill)+'</b> and start at <b>'+(o.trust===undefined?60:o.trust)+
    '/100</b> trust. What they want in return: <b>'+esc(o.ask)+'</b>.'+
    '<hr class="sep"><span class="muted">The money lands in the company, not with you. '+
    'You are selling a share of everything this business ever earns, and the only way '+
    'to buy it back is at a premium that rises as their trust falls.</span>',
    function(){
      ensureGov(b);
      const wantsSeat = /board seat/i.test(o.ask||'');
      const h = addHolder(b, { name:o.name, kind:'partner', kindName:'Partner',
        cls:'Ordinary', trust:(o.trust===undefined?60:o.trust),
        board:wantsSeat, seat:wantsSeat, roundLabel:'Partnership' });
      h.ask = o.ask; h.skill = o.skill; h.cameInAt = S.turn;
      const raised = Math.round(n * p);
      issueTo(b, h, n, p);
      offerRemove(o);
      /* the ask is minuted, because it is the thing they will judge you on
         and the thing the Promises card will hold you to */
      const kind = /board seat/i.test(o.ask||'') ? 'seat'
                 : /reporting/i.test(o.ask||'')  ? 'reporting'
                 : /agreement/i.test(o.ask||'')  ? 'agreement'
                 : /payroll/i.test(o.ask||'')    ? 'job' : 'reporting';
      b.undertakings = b.undertakings || [];
      b.undertakings.push({ id:'u'+(++S.seq), kind:kind, text:o.ask, dirId:h.id, dirName:o.name,
        made:S.turn, due:S.turn + 4 });
      log('biz', o.name+' has come in for '+afterPct+'% with '+fmt(raised)+'. '+
        'You own '+b.equity+'% of it now. They asked for one thing and it is on the record.','good');
      pushNews(o.name+' joins as a partner','good');
      toast(o.name+' is in · '+afterPct+'%');
      render();
    }, 'Take the money');
}
function buyOutPartner(){
  const b=S.biz; if(!b) return false;
  ensureGov(b);
  if(!extHolders(b).length){ toast('There is nobody to buy out.'); return false; }
  const q = buyoutExternal(b, 1.30);
  const r = doBuyoutExternal(b, 1.30);
  if(!r){ toast('Buyout would cost about '+fmt(q.cost)+'. You have '+fmt(S.fin.cash)+'.'); return false; }
  log('biz','You bought out '+r.names+' for '+fmt(r.cost)+'. The register has one name on it again.','good');
  return true;
}