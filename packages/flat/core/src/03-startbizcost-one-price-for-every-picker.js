

/* =========================================================================
   Section 6: Business engine
   ========================================================================= */
/* One number, used by every picker. It used to be three: the first-company
   card showed T.min, the second-company modal showed T.min*S.cumInfl, and a
   third card showed BIZ.startCost — a field that does not exist, so that
   card priced every business at ₦NaN. */
function startBizCost(typeId){ const T=BIZ.find(x=>x.id===typeId); return Math.round((T?T.min:0) * (S.cumInfl||1)); }
/* A SECOND ownerTime() was declared after this one and shadowed it: in the
   flat build a later function declaration of the same name simply overwrote
   the earlier one, so this was dead code no gate could see. Deleted rather
   than kept, and safe to delete - the surviving version returns the same value
   when handed no business. This is the class of bug a module boundary finds
   for free. */
function marketSalary(skill){
  const talent = (S && S.tune) ? (S.tune.talent||1) : 1;
  return Math.round((95000 + skill*58000) * CITY().payMult * S.cumInfl * talent);
}
/*@table:EDU@*/
function eduMult(){ return EDU[S.p.edu] || 1; }
/* What the market pays someone with your skills, experience and education right now.
   Job-hopping closes the gap to this number. It does not compound past it. */
function marketMonthly(){
  const k = S.p.skills, yrs = Math.min(10, S.p.jobYears||0);
  const base = 90000 + k.ops*5000 + k.tech*4200 + k.finance*3200 + k.network*2600 + yrs*11000;
  return Math.max(120000, Math.round(base * CITY().payMult * eduMult() * (0.75 + S.p.rep/220) * S.cumInfl));
}
/* The trait a staff member carries, by id, or an empty one when the id is not in
   the table. One place, and typed: TRAITS is a data table, so the fields it
   holds are known, and every rule that reads one off a member now reads them off
   the table's own element type instead of off `{}`. It is also what found the
   hiring message below, which looked up a trait by comparing it to itself and
   printed the word "undefined" to the player on every hire. */
/** @param {string} id @returns {Partial<(typeof TRAITS)[number]>} */
function traitOf(id){
  return TRAITS.find(function(x){ return x.id===id; }) || {};
}
function staffProd(b){
  b = b || S.biz; if(!b) return 0;
  let t=0;
  (b.staff||[]).forEach(s=>{
    const tr = traitOf(s.trait);
    const roleMult = (s.role==='gm') ? 1.18 : (s.role==='sales') ? 1.10 : 1.0;
    const fit = (s.outlet && (b.outlets||[]).some(o=>o.id===s.outlet)) ? 1.0 : (b.outlets&&b.outlets.length>1 ? 0.88 : 1.0);
    const ramp = (s.ramp === undefined) ? 1 : (s.ramp||0);          // fully ramped if hired before this existed
    const notice = (s.leaving !== undefined) ? 0.65 : 1;            // serving notice, mentally gone
    t += (0.55 + s.skill/10) * (s.morale/74) * (1 + (tr.output||0)) * roleMult * fit * ramp * notice;
  });
  return t;
}
function staffMonthly(b){
  b = b || S.biz; if(!b) return 0;
  const own = (b.staff||[]).reduce((a,s)=>a+s.salary,0);
  // Household staff on the company payroll are a wage cost like any other, and they
  // can push the company into the same missed-payroll trouble. That is deliberate.
  return own + houseMonthlyBiz(b.id);
}
function theftRate(b){ b = b || S.biz; if(!b) return 0; return (b.staff||[]).reduce((a,s)=>{const t=traitOf(s.trait); return a + (t.theft||0);},0)*0.010; }
function connBonus(b){ b = b || S.biz; if(!b) return 0; return (b.staff||[]).reduce((a,s)=>{const t=traitOf(s.trait); return a + (t.demand||0);},0); }

/* ------------------------- portfolio: several companies -------------------- */
function bizList(){ return (S.bizs||[]).filter(Boolean); }
function bizById(id){ return bizList().find(function(b){ return b.id===id; }) || null; }
function setActiveBiz(id){
  const b = bizById(id); if(!b) return false;
  S.biz = b; S.activeBiz = b.id; return true;
}
function ownerTime(b){
  const avail = S.p.job ? (S.flags.moonlight ? 0.62 : 0.32) : 1.0;
  const list = bizList();
  if(!b || list.length <= 1) return avail;
  // a business with a general manager needs far less of you personally
  const w = list.map(function(x){ return (x.staff||[]).some(function(st){ return st.role==='gm'; }) ? 0.34 : 1; });
  const tot = w.reduce(function(a,x){ return a+x; }, 0) || 1;
  const idx = Math.max(0, list.indexOf(b));
  const span = 1 + S.p.skills.ops/230;      // you get better at covering ground
  return clamp(avail * ((w[idx]||1)/tot) * span, 0.04, 1.0);
}
function outletValue(o){
  if(!o || o.status==='building') return 0;
  const site = (o.site===undefined?70:o.site);
  const mgr  = (o.manager? 1.06 : 1.0);
  return (o.size||1) * (0.55 + (o.cond===undefined?80:o.cond)/200) * (0.62 + site/140) * mgr;
}
function outletScale(b){
  if(!b) return 0;
  const os = (b.outlets && b.outlets.length) ? b.outlets : null;
  if(!os || !os.length) return Math.max(0.2, b.locations||1);
  // outlets in the same city eat each other's catchment; across cities they do not
  const byCity = {};
  os.forEach(function(o){
    const c = o.city || S.city;
    byCity[c] = (byCity[c]||0) + outletValue(o);
  });
  let tot = 0;
  Object.keys(byCity).forEach(function(c){ if(byCity[c]>0) tot += Math.pow(byCity[c], 0.92); });
  return tot;
}
function outletOpen(b){ return ((b&&b.outlets)||[]).filter(function(o){ return o.status!=='building'; }); }
function staffNeed(b){
  const os = outletOpen(b);
  if(!os.length) return 1;
  return Math.max(1, Math.round(os.reduce(function(a,o){ return a + (o.size||1)*1.25; }, 0)));
}
function staffCover(b){
  const need = staffNeed(b);
  return clamp((b.staff||[]).length / Math.max(1,need), 0, 1.4);
}
/* distribute the company P&L across units so you can see which ones work */
function allocateOutlets(b, revenue, cogs, opex, profit){
  const os = outletOpen(b); if(!os.length) return;
  const vals = os.map(function(o){ return Math.max(0.05, outletValue(o)); });
  const tot = vals.reduce(function(a,x){ return a+x; }, 0) || 1;
  os.forEach(function(o,i){
    const sh = vals[i]/tot;
    o.revenue = Math.round(revenue*sh);
    o.cost    = Math.round((cogs+opex)*sh);
    o.profit  = Math.round(profit*sh);
    o.share   = sh;
  });
}
function companyCulture(b){
  const st = (b&&b.staff)||[]; if(!st.length) return 50;
  let c = 50;
  const fair = st.reduce(function(a,x){ return a + (x.salary/Math.max(1,marketSalary(x.skill))); }, 0)/st.length;
  c += (fair-1)*45;
  c += ((b.staffTrust||55)-55)*0.35;
  c -= (b.arrears>0? 22:0);
  c += st.reduce(function(a,x){ return a + ((x.trained||0)*3); },0)/st.length;
  c -= st.reduce(function(a,x){ return a + (x.morale<35?6:0); },0);
  return clamp(c, 0, 100);
}
function outletRent(b){
  const os = (b && b.outlets && b.outlets.length) ? b.outlets : null;
  if(!os) return (BIZ.find(function(x){return x.id===b.type;})||{rentQ:400000}).rentQ*0.6*(b.locations||1);
  return os.reduce(function(a,o){
    const r = (o.rent||0)*(o.size||1);
    return a + (o.status==='building' ? r*0.5 : r);
  }, 0);
}
function outletCount(b){ return (b && b.outlets && b.outlets.length) ? outletOpen(b).length : (b? (b.locations||1) : 0); }
function outletAvgCond(b){
  const os = (b && b.outlets) ? b.outlets : [];
  if(!os.length) return 80;
  return os.reduce(function(a,o){ return a + (o.cond===undefined?80:o.cond); },0)/os.length;
}
function outletCities(b){
  const os=(b&&b.outlets)||[]; const set={}; os.forEach(function(o){ set[o.city||S.city]=1; });
  return Object.keys(set).length;
}
function openOutlet(b, opts){
  if(!b) return null;
  opts = opts||{};
  const T = BIZ.find(function(x){return x.id===b.type;});
  const city = opts.city || S.city;
  const cm = CITIES.find(function(c){ return c.id===city; }) || CITY();
  const grade = opts.site===undefined ? R.int(42, 94) : opts.site;
  const gradeMult = 0.62 + grade/115;                       // a good position costs real money
  const rent = Math.round(T.rentQ*0.6*cm.rentMult*R.range(0.85,1.25)*gradeMult);
  const fit  = Math.round(Math.max(2500000, (b.revenue||0)*0.45 + T.rentQ*3)*S.cumInfl*cm.rentMult*gradeMult);
  /* trading:true is used when a commitment has already carried the build -
     the delay was paid for before the unit existed, not after. */
  const trading = !!opts.trading;
  const build = trading ? 0 : 1 + (R.chance(0.35)?1:0) + (city!==S.city?1:0);   // further away takes longer
  const o = {id:'o'+(++S.seq), name:opts.name || (T.name.replace(/ .*/,'')+' '+(b.outlets.length+1)),
    size:1, cond:82, rent:rent, end:S.turn+R.int(6,12), landlord:R.pick(LAST), goodwill:50, hikes:0,
    city:city, staff:[], maint:0, opened:S.turn, fitout:fit,
    site:grade, status:trading?'open':'building', opensAt:S.turn+build, buildCost:fit, manager:null, revenue:0, cost:0, profit:0};
  b.outlets = b.outlets || [];
  b.outlets.push(o);
  b.locations = b.outlets.length;
  if(!trading){                                            // a commitment already paid for this
    b.cash -= Math.round(fit*0.45);                        // deposit and first draw
    b.capex += Math.round(fit*0.25);
  }
  if(!b.lease) b.lease = o;
  log('biz','You signed for a unit in '+cm.label+' ('+(grade>80?'an excellent':grade>62?'a decent':'a mediocre')+
    ' position). Fit-out is underway and it should be trading in about '+build+' quarter'+(build===1?'':'s')+'.','neutral');
  return o;
}
function closeOutlet(b, oid){
  if(!b || !b.outlets) return null;
  const o = b.outlets.find(function(x){ return x.id===oid; }); if(!o) return null;
  if(b.outlets.length<=1) return null;
  // staff at that outlet: redeploy or pay off
  let sev = 0;
  (b.staff||[]).slice().forEach(function(st){
    if(st.outlet===oid){
      if(R.f()<0.55){ st.outlet = null; }   /* seeded: a season run must be reproducible */
      else { sev += Math.round(st.salary*(S.turn-(st.joined||S.turn)>8?2:1)); b.staff = b.staff.filter(function(x){return x.id!==st.id;}); }
    }
  });
  b.outlets = b.outlets.filter(function(x){ return x.id!==oid; });
  b.locations = b.outlets.length;
  b.cash -= sev + Math.round((o.fitout||0)*0.12);
  b.capex = Math.max(0, Math.round(b.capex*0.9));
  b.lease = b.outlets[0] || null;
  log('biz','You closed the '+esc(o.name)+' unit. Severance and dilapidations: '+fmt(sev)+'.','warn');
  return o;
}
function upgradeOutlet(b, oid){
  const o = (b && b.outlets) ? b.outlets.find(function(x){ return x.id===oid; }) : null; if(!o) return null;
  if((o.size||1) >= 4) return null;
  const cost = Math.round((o.fitout||3000000)*0.55*(o.size||1)*S.cumInfl);
  if(b.cash < cost) return null;
  b.cash -= cost; b.capex += Math.round(cost*0.7);
  o.size = (o.size||1)+1; o.cond = clamp((o.cond||80)+12,0,100);
  o.rent = Math.round((o.rent||0)*1.35);
  log('biz','You extended the '+esc(o.name)+' unit for '+fmt(cost)+'. Capacity up, rent up.','good');
  return o;
}
function maintainOutlet(b, oid, amt){
  const o = (b && b.outlets) ? b.outlets.find(function(x){ return x.id===oid; }) : null; if(!o) return null;
  const spend = Math.min(amt, Math.max(0,b.cash));
  if(spend<=0) return null;
  b.cash -= spend;
  o.cond = clamp((o.cond||80) + spend/Math.max(1,(o.fitout||3000000)*0.012), 0, 100);
  o.maint = (o.maint||0) + spend;
  return o;
}
function stepOutlets(b){
  const notes = [];
  (b.outlets||[]).forEach(function(o){
    // under construction: it costs money and earns nothing
    if(o.status==='building'){
      const draw = Math.round((o.buildCost||0)*0.28);
      b.cash -= draw; b.capex += Math.round(draw*0.8);
      if(S.turn >= (o.opensAt||S.turn)){
        const overrun = Math.round((o.buildCost||0)*R.range(0, 0.42));
        if(overrun>0){ b.cash -= overrun; b.capex += Math.round(overrun*0.7); }
        o.status = 'open';
        o.cond = clamp((o.cond||82) - 4, 0, 100);
        notes.push({level: overrun>0?'warn':'good', text: o.name+' is open and trading.'+(overrun>0?
          ' The fit-out overran by '+fmt(overrun)+', which is what fit-outs do.':' It came in on budget, which is rare.')});
      }
      return;
    }
    // a unit manager holds the place together
    if(o.manager && !(b.staff||[]).some(function(x){ return x.id===o.manager; })) o.manager = null;
    // condition decays with trade and age; maintenance holds it up
    const wear = 1.6 + (o.size||1)*0.7 + (S.mkt.infl*8);
    o.cond = clamp((o.cond===undefined?80:o.cond) - wear*R.range(0.6,1.4) + ((o.maint||0)>0?0.9:0) + (o.manager?0.8:0), 0, 100);
    o.maint = 0;
    o.end = (o.end||S.turn+8) - 1;
    if(o.end <= 0){
      const hike = clamp(R.gauss(S.mkt.infl*0.85, 0.055) - ((o.goodwill===undefined?50:o.goodwill)-50)/900, -0.04, 0.34);
      const gw = o.goodwill===undefined?50:o.goodwill;
      if(R.chance(clamp(gw/130 + 0.3, 0.2, 0.94))){
        o.rent = Math.round((o.rent||0)*(1+hike)); o.end = R.int(6,12); o.hikes=(o.hikes||0)+1;
        notes.push({level: hike>0.2?'bad':'warn', text:'Lease renewed at '+esc(o.name)+': '+fmt(o.rent)+'/mo, up '+Math.round(hike*100)+'%.', outlet:o.id});
      } else {
        notes.push({level:'bad', text:'The landlord at '+esc(o.name)+' will not renew. You have one quarter to find premises.', outlet:o.id});
        o.end = 1;
      }
    }
  });
  return notes;
}

function startBiz(typeId, name, capital, partner){
  const T = BIZ.find(x=>x.id===typeId);
  const infl = S.cumInfl;
  const c = Math.min(capital, S.fin.cash);
  S.fin.cash -= c;
  const eq = partner ? (100 - partner.equity) : 100;
  const nb = {
    id:'b'+(++S.seq),
    type:typeId, name:name||T.name, foundedTurn:S.turn, startInfl:infl,
    equity:eq, partner:partner||null, cash:Math.round(c*0.75), capex:Math.round(c*0.25),
    staff:[], priceIdx:1.0, marketing:0, quality:55, rep:45, locations:1, brand:0,
    qualitySpendMonthly:0, formal:false, revenue:0, cogs:0, opex:0, profit:0, tax:0,
    units:0, capacity:0, demand:0, history:[], morale:65, conn:0, moonlight:false,
    lastNotes:[],
    /* --- depth --- */
    recv:0, payable:0, inventory:0, creditTerms:0.15, stockPolicy:0.58, draw:0,
    positioning:45, discountMemory:0, lastPriceIdx:1.0, priceOver:0, priceUnder:0,
    qualInvest:55, defects:[], pendingDefects:0, defectBill:0, defectsQ:0, warrantyQ:0,
    custBase:0, churnQ:0, cacQ:0, boughtQ:0, referredQ:0, womQ:0, rivalCut:0,
    compliance:42, taxRisk:0, auditPending:0, auto:0, products:1, arrears:0,
    lease:{rent:Math.round(T.rentQ*0.25), end:S.turn+8, landlord:R.pick(LAST), goodwill:50, hikes:0},
    keyClient:null, supplierConf:70, supplierDays:30, staffTrust:55, insured:false,
    incidents:[], contracts:[], diag:[], lastRevenue:0, quarters:0, everProfitable:0,
    outlets:[], bids:[], openRoles:[]
  };
  nb.outlets.push({id:'o'+(++S.seq), name:(name||T.name)+' \u2014 unit 1', size:1, cond:85,
    rent:Math.round(T.rentQ*0.6*CITY().rentMult), end:S.turn+8, landlord:R.pick(LAST), goodwill:52, hikes:0,
    city:S.city, staff:[], maint:0, opened:S.turn, fitout:Math.round(c*0.25),
    site:R.int(58,88), status:'open', opensAt:S.turn, manager:null, revenue:0, cost:0, profit:0});
  nb.lease = nb.outlets[0];
  nb.locations = 1;
  ensureGov(nb);
  if(partner){
    nb.cash += partner.capital; nb.capex += Math.round(partner.capital*0.2);
    S.p.skills.network = clamp(S.p.skills.network + 4, 0, 100);
    const wantsBoard = (partner.ask||'').toLowerCase().indexOf('board') >= 0;
    const holder = addHolder(nb, {name:partner.name, kind:'partner', board:wantsBoard,
      trust:(partner.trust||60), seniority:1, kindName:'Founding partner'});
    holder.skillKey = partner.skill; holder.bg = partner.bg; holder.ask = partner.ask;
    grantPct(nb, partner.equity, {holderId:holder.id, capital:partner.capital, noCash:true});
    if(wantsBoard || partner.equity >= 25) formBoard(nb);
  }
  ensureGov(nb);
  if(!S.bizs) S.bizs = [];
  S.bizs.push(nb);
  S.biz = nb; S.activeBiz = nb.id;
  log('biz','You started '+nb.name+' with '+fmt(c)+' of your own money.'+(partner?' '+partner.name+' took '+partner.equity+'% for '+fmt(partner.capital)+'.':''), 'good');
  log('biz', T.desc, 'neutral');
  S.p.stress = clamp(S.p.stress+8, 0, 100);
  recompute();
  return nb;
}
function startAnotherBiz(typeId, name, capital, partner){ return startBiz(typeId, name, capital, partner); }
function dropBiz(b){
  if(!b) return;
  if(!S.bizs) S.bizs = [];
  S.bizs = S.bizs.filter(function(x){ return x && x.id!==b.id; });
  if(S.biz && S.biz.id===b.id) S.biz = S.bizs.length ? S.bizs[0] : null;
  S.activeBiz = S.biz ? S.biz.id : null;
}
function closeBiz(reason, bb){
  const b = bb || S.biz; if(!b) return;
  const salvage = Math.max(0, Math.round(b.cash*0.6 + b.capex*0.25));
  S.fin.cash += salvage;
  log('biz', b.name+' is wound up. '+reason+' You salvage '+fmt(salvage)+'.', 'bad');
  S.p.stress = clamp(S.p.stress+12,0,100); S.p.happy = clamp(S.p.happy-8,0,100);
  S.p.skills.ops = clamp(S.p.skills.ops+3,0,100);
  S.flags.hadBiz = true; S.flags.bizFailures = (S.flags.bizFailures||0)+1;
  dropBiz(b);
}
/* ===========================================================================
   Commitments

   A business is not a set of dials. It is a set of promises already made:
   leases signed, offers accepted, fit-outs paid for. Those promises arrive
   late, they cost money the whole time they are arriving, and they cannot be
   unmade for free. Those three properties - delay, bleed, irreversibility -
   are what make a decision hard, and the game had none of them. expandBiz()
   added a location the same quarter you paid for it. hire() delivered a
   fully productive human being the day you signed them. Both were dials.

   No closures are stored in here: state is serialised, so a commitment keeps
   plain data and commitActivate() switches on its kind.
   =========================================================================== */
function commitNew(b, spec){
  b.commitments = b.commitments || [];
  const c = Object.assign({ id:'cm'+(++S.seq), kind:'generic', status:'building',
    placed:S.turn, lead:1, total:0, paid:0, breakPct:0.35, note:'' }, spec || {});
  c.readyAt = (c.readyAt===undefined) ? S.turn + (c.lead||1) : c.readyAt;
  /* the deposit is already gone; the rest is drawn evenly over the lead time */
  c.perQ = Math.round(Math.max(0, (c.total||0) - (c.paid||0)) / Math.max(1, c.lead));
  b.commitments.push(c);
  return c;
}
function commitSunk(c){ return Math.round(c.paid||0); }
/* Walking away costs everything already spent plus a share of what is left:
   the supplier keeps the deposit, the landlord keeps the rent, and the person
   you withdrew the offer on tells other people. The whole trap of the thing
   is that this number is painful enough to make finishing feel rational. */
function commitBreak(c){
  if(!c || c.status !== 'building') return 0;
  const left = Math.max(0, (c.total||0) - (c.paid||0));
  return Math.round((c.paid||0) + left * (c.breakPct===undefined ? 0.35 : c.breakPct));
}
function commitCancel(b, id){
  const c = (b.commitments||[]).find(function(x){ return x.id===id; });
  if(!c || c.status !== 'building') return 0;
  const cost = commitBreak(c);
  c.status = 'cancelled'; c.cancelledAt = S.turn; c.breakPaid = cost;
  return cost;
}
function commitBuilding(b){
  return (b.commitments||[]).filter(function(c){ return c.status === 'building'; });
}
/* What you must pay next quarter before you sell a single thing. Rent you
   cannot exit, salaries you are stuck with, fit-outs still drawing. This is
   the number that turns a downturn into a crisis, and it is the reason
   operating leverage is a strategy rather than a footnote. */
function committedFixedQ(b){
  if(!b) return { rent:0, salaries:0, builds:0, total:0 };
  const inflF = S.cumInfl / (b.startInfl || 1);
  let rent = 0;
  (b.outlets||[]).forEach(function(o){
    if(o.status === 'building') return;
    if(((o.end||0) - S.turn) > 0) rent += Math.round((o.rent||0) * inflF);
  });
  const salaries = Math.round((staffMonthly(b)||0) * 3);
  const builds = commitBuilding(b).reduce(function(a,c){ return a + (c.perQ||0); }, 0);
  return { rent: rent, salaries: salaries, builds: builds,
           total: Math.round(rent + salaries + builds) };
}
function commitActivate(b, c){
  if(c.kind === 'unit'){
    const o = openOutlet(b, { city: c.city || S.city, trading: true });
    if(o) log('biz', c.label + ' is trading. ' + fmt(Math.round(c.total)) +
      ' committed ' + (S.turn - c.placed) + ' quarters ago, opens today.', 'good');
  } else if(c.kind === 'shifts'){
    log('biz', 'The second shift starts tonight. Capacity is up a third; so is the wage bill, and nobody thanks you for it.', 'neutral');
  } else if(c.kind === 'supply'){
    c.lockedIdx = inputIndex();
    log('biz', 'The supply contract is signed. Your input cost is fixed for ' + (c.term||8) +
      ' quarters, whether that turns out to have been clever or not.', 'neutral');
  } else if(c.kind === 'channel'){
    log('biz', 'The distributor is selling for you now. Demand jumps this quarter — and 6% of revenue leaves with them, every quarter until the term is up.', 'neutral');
  } else if(c.kind === 'hire'){
    c.staff = c.staff || {};
    c.staff.ramp = 0.30;
    c.staff.joined = S.turn;
    b.staff = b.staff || [];
    b.staff.push(c.staff);
    log('biz', c.staff.name + ' has started. They will not be fully useful for a few quarters.', 'neutral');
  }
}
/* ===========================================================================
   Phase 12 — the levers that are not dials.

   Price, marketing and quality are dials: continuous, reversible, and
   effective next quarter. There is nothing hard about turning one. What a
   manager actually cannot do is reverse a decision cheaply or see its
   consequence quickly — and apart from property and hiring, the business had
   no lever with that shape at all. That is what made running it feel like
   child's play: every decision was undoable at no cost before it had even
   finished arriving.

   These three are commitments built on the phase-7 machinery, so they inherit
   its three properties — a lead time before anything arrives, money leaving
   the whole time it does, and a price for changing your mind that is meant to
   hurt. Each also has a TERM: you are in it for a number of quarters, not
   until you feel like stopping.

   Each one is worth taking because it trades a certain cost now for a bigger
   number later. Each one is dangerous for the same reason the term exists:
   the world does not wait for your commitment to end.
   =========================================================================== */
/*@table:LEVER_KINDS@*/
/* What a unit of input costs today. Inflation is not the only thing in it:
   when demand is weak, suppliers cut prices to keep the volume moving, which
   is precisely when a locked price stops being a bargain. */
function inputIndex(){
  const m = S.mkt || {};
  return (S.cumInfl||1) * (1 + (((m.demand||1) - 1) * 0.35));
}
function leverOf(b, kind, status){
  return (b.commitments||[]).find(function(c){
    return c.kind === kind && c.status === status && (status !== 'active' || S.turn < (c.endsAt||0));
  });
}
function leverActive(b, kind){ return !!leverOf(b, kind, 'active'); }
function leverPending(b, kind){ return !!leverOf(b, kind, 'building'); }
/* The multipliers each lever puts into the sums. Named functions, so the
   screen and the simulation read the same number and cannot drift apart. */
function shiftCapMult(b){   return leverActive(b,'shifts')  ? 1.35 : 1; }
function shiftWageMult(b){  return leverActive(b,'shifts')  ? 1.45 : 1; }
function channelDemandMult(b){ return leverActive(b,'channel') ? 1.22 : 1; }
function channelCut(b, rev){ return leverActive(b,'channel') ? Math.round((rev||0) * 0.06) : 0; }
/* Locked input cost, marked against the world. 0.90 is the discount you were
   sold; what you actually pay depends on what has happened since. */
function supplyCogsMult(b){
  const c = leverOf(b, 'supply', 'active'); if(!c) return 1;
  const spot = inputIndex(), locked = c.lockedIdx || spot;
  return clamp(0.90 * (locked / Math.max(0.01, spot)), 0.80, 1.15);
}
function supplyOverpay(b){
  const c = leverOf(b, 'supply', 'active'); if(!c) return 0;
  return Math.round((supplyCogsMult(b) / 0.90 - 1) * 100);
}
/* Walking away from one that is already running. You pay a share of the
   quarters you are giving up, plus the notice. */
function commitDropCost(c){
  if(!c || c.status !== 'active') return 0;
  const term = Math.max(1, c.term || 1);
  const left = Math.max(0, (c.endsAt || S.turn) - S.turn);
  return Math.round((c.total||0) * (c.breakPct===undefined?0.5:c.breakPct) * ((left + 1) / term));
}
function commitDrop(b, id){
  const c = (b.commitments||[]).find(function(x){ return x.id===id; });
  if(!c || c.status !== 'active') return 0;
  const cost = commitDropCost(c);
  c.status = 'ended'; c.endedAt = S.turn; c.brokeEarly = true; c.breakPaid = cost;
  return cost;
}
function leverTake(kind){
  const b = S.biz; if(!b) return;
  const K = LEVER_KINDS[kind]; if(!K) return;
  if(leverPending(b,kind)){ toast('One is already being set up'); return; }
  if(leverActive(b,kind)){ toast('That is already running'); return; }
  const cost = K.cost(b);
  confirmBox(K.ask,
    '<b>'+fmt(cost)+'</b> drawn over '+K.lead+' quarter'+(K.lead===1?'':'s')+
    ', then locked in for <b>'+K.term+' quarters</b>.<br><br>'+
    '<b>You get:</b> '+K.gives+'<br><b>You pay:</b> '+K.takes+
    '<br><br><span class="muted">'+K.risk+'</span>',
    function(){ leverPlace(kind, cost); }, 'Commit '+fmt(cost));
}
function leverPlace(kind, cost){
  const b = S.biz, K = LEVER_KINDS[kind];
  if(!b || !K) return;
  commitNew(b, { kind:kind, label:K.label, lead:K.lead, term:K.term,
                 total:cost, breakPct:K.breakPct, note:K.gives });
  log('biz', K.label + ' committed. ' + fmt(cost) + ' over ' + K.lead +
    ' quarter' + (K.lead===1?'':'s') + ' before it does anything at all.', 'neutral');
  toast(K.label + ' committed');
  render();
}

/* Nobody is productive on day one, and the people you have given notice to
   are not really there any more. Both facts used to be invisible. */
function stepRamp(b){
  (b.staff||[]).forEach(function(st){
    if(st.ramp === undefined){ st.ramp = 1; return; }      // staff hired before this existed
    st.ramp = Math.min(1, (st.ramp||0) + 0.20 + (st.skill/10) * 0.07);
  });
}
function stepCommitments(b){
  /* promises coming due */
  (b.commitments||[]).forEach(function(c){
    if(c.status !== 'building') return;
    const left = Math.max(0, (c.total||0) - (c.paid||0));
    const draw = Math.min(c.perQ||0, left);
    if(draw > 0){ c.paid = Math.round((c.paid||0) + draw); b.cash -= draw;
                  b.capex = Math.round((b.capex||0) + draw*0.8); }
    if(S.turn >= c.readyAt && c.status === 'building'){
      c.status = 'active';
      if(c.term) c.endsAt = S.turn + (c.term||0);
      commitActivate(b, c);
    }
    /* a term ends whether you are ready or not. This is the whole point of
       having one: the lever stops being yours to hold. */
    if(c.status === 'active' && c.endsAt && S.turn >= c.endsAt){
      c.status = 'ended'; c.endedAt = S.turn;
      log('biz', (c.label||'A commitment') + ' has run its term and stopped. ' +
        'Nothing was renewed, because you did not renew it.', 'neutral');
    }
  });
  /* people working out their notice leave at the end of the quarter */
  const gone = (b.staff||[]).filter(function(st){ return st.leaving !== undefined && st.leaving <= S.turn; });
  if(gone.length){
    b.staff = b.staff.filter(function(st){ return !(st.leaving !== undefined && st.leaving <= S.turn); });
    gone.forEach(function(st){ log('biz', st.name + ' worked their notice and left.', 'neutral'); });
  }
  stepRamp(b);
  /* keep the finished ones around briefly so the screen can say what happened */
  b.commitments = (b.commitments||[]).filter(function(c){
    if(c.status === 'building' || c.status === 'active') return true;
    return (S.turn - (c.endedAt || c.readyAt || S.turn)) < 2;
  });
}
/* The promises, on screen. A commitment you cannot see is not a constraint,
   it is a surprise - and the point of modelling irreversibility is that the
   player can see it coming and choose badly anyway. */
function recentGrowth(b){
  const h = (b.history||[]);
  if(h.length < 2) return 0;
  const prev = h[h.length-2].revenue || 0;
  if(prev <= 0) return 0;
  return clamp(((b.revenue||0) - prev) / prev, -1, 3);
}