/*
  BIZ_EVENTS — from 06-events-business-deck.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface BIZ_EVENTSShape {
  bizcash: any;
  bizrep: number;
  log: string[];
}
interface BIZ_EVENTSShape2 {
  turns: number;
  kind: string;
  title: string;
  text: string;
  eff: BIZ_EVENTSShape;
}
interface BIZ_EVENTSShape3 {
  bizcash: any;
  bizrep: number;
}
interface BIZ_EVENTSShape4 {
  bizrep: number;
  failText: string;
}
interface BIZ_EVENTSShape5 {
  finance: number;
}
interface BIZ_EVENTSShape6 {
  skill: BIZ_EVENTSShape5;
  log: string[];
}
interface BIZ_EVENTSShape7 {
  label: string;
  hint: string;
  effFn?: (() => BIZ_EVENTSShape);
  delayFn?: (() => BIZ_EVENTSShape2);
  odds?: (() => number);
  okEffFn?: (() => BIZ_EVENTSShape3);
  okText?: string;
  okLog?: string[];
  failEff?: BIZ_EVENTSShape4;
  eff?: BIZ_EVENTSShape6;
}
interface BIZ_EVENTSShape8 {
  bizcash: number;
  bizrep: number;
  bizcap: number;
  okText: string;
  log: string[];
}
interface BIZ_EVENTSShape9 {
  bizcash: number;
  bizrep: number;
  failText: string;
}
interface BIZ_EVENTSShape10 {
  log: string[];
}
interface BIZ_EVENTSShape11 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape8;
  failEff?: BIZ_EVENTSShape9;
  eff?: BIZ_EVENTSShape10;
}
interface BIZ_EVENTSShape12 {
  gaveEquity: boolean;
}
interface BIZ_EVENTSShape13 {
  bizrep: number;
  log: string[];
  flag: BIZ_EVENTSShape12;
}
interface BIZ_EVENTSShapesShape {
  bizrep?: number;
  log: string[];
  flag?: BIZ_EVENTSShape12;
}
interface BIZ_EVENTSShape14 {
  label: string;
  hint: string;
  effFn?: (() => any);
  eff?: BIZ_EVENTSShapesShape;
}
interface BIZ_EVENTSShape15 {
  ops: number;
}
interface BIZ_EVENTSShape16 {
  cash: number;
  bizrep: number;
  skill: BIZ_EVENTSShape15;
  log: string[];
}
interface BIZ_EVENTSShape17 {
  bizrep: number;
  okText: string;
  log: string[];
}
interface BIZ_EVENTSShape18 {
  bizrep: number;
  cash: number;
  failText: string;
  log: string[];
}
interface BIZ_EVENTSShapesShape3 {
  ops?: number;
  finance?: number;
}
interface BIZ_EVENTSShapesShape2 {
  cash?: number;
  bizrep?: number;
  skill: BIZ_EVENTSShapesShape3;
  log: string[];
}
interface BIZ_EVENTSShape19 {
  label: string;
  hint: string;
  eff?: BIZ_EVENTSShapesShape2;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape17;
  failEff?: BIZ_EVENTSShape18;
}
interface BIZ_EVENTSShape20 {
  cash: number;
  stress: number;
  log: string[];
}
interface BIZ_EVENTSShape21 {
  onList: boolean;
}
interface BIZ_EVENTSShape22 {
  turns: number;
  title: string;
  text: string;
  kind: string;
  eff: BIZ_EVENTSShape20;
}
interface BIZ_EVENTSShape23 {
  cash: number;
  flag: BIZ_EVENTSShape21;
  log: string[];
  delay: BIZ_EVENTSShape22;
}
interface BIZ_EVENTSShape24 {
  formalizing: boolean;
}
interface BIZ_EVENTSShape25 {
  cash: number;
  log: string[];
  flag: BIZ_EVENTSShape24;
}
interface BIZ_EVENTSShapesShape5 {
  onList?: boolean;
  formalizing?: boolean;
}
interface BIZ_EVENTSShapesShape4 {
  cash: number;
  stress?: number;
  log: string[];
  flag?: BIZ_EVENTSShapesShape5;
  delay?: BIZ_EVENTSShape22;
}
interface BIZ_EVENTSShape26 {
  label: string;
  hint: string;
  eff: BIZ_EVENTSShapesShape4;
}
interface BIZ_EVENTSShape27 {
  bizcash: number;
  log: string[];
}
interface BIZ_EVENTSShape28 {
  cash: number;
  bizrep: number;
  stress: number;
  log: string[];
}
interface BIZ_EVENTSShape29 {
  okText: string;
  log: string[];
}
interface BIZ_EVENTSShape30 {
  bizcash: number;
}
interface BIZ_EVENTSShape31 {
  label: string;
  hint: string;
  effFn?: (() => BIZ_EVENTSShape27);
  eff?: BIZ_EVENTSShape28;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape29;
  failEffFn?: (() => BIZ_EVENTSShape30);
  failText?: string;
}
interface BIZ_EVENTSShape32 {
  cash: number;
  log: string[];
}
interface BIZ_EVENTSShape33 {
  cash: number;
  bizrep: number;
  log: string[];
}
interface BIZ_EVENTSShape34 {
  solar: boolean;
}
interface BIZ_EVENTSShape35 {
  cash: number;
  log: string[];
  flag: BIZ_EVENTSShape34;
}
interface BIZ_EVENTSShapesShape6 {
  cash: number;
  log: string[];
  bizrep?: number;
  flag?: BIZ_EVENTSShape34;
}
interface BIZ_EVENTSShape36 {
  label: string;
  hint: string;
  eff: BIZ_EVENTSShapesShape6;
}
interface BIZ_EVENTSShape37 {
  bizrep: number;
  log: string[];
}
interface BIZ_EVENTSShape38 {
  bizcash: number;
  bizqual: number;
  bizrep: number;
  log: string[];
}
interface BIZ_EVENTSShape39 {
  network: number;
}
interface BIZ_EVENTSShape40 {
  bizrep: number;
  skill: BIZ_EVENTSShape39;
  okText: string;
  log: string[];
}
interface BIZ_EVENTSShapesShape7 {
  bizrep: number;
  log: string[];
  bizcash?: number;
  bizqual?: number;
}
interface BIZ_EVENTSShape41 {
  label: string;
  hint: string;
  eff?: BIZ_EVENTSShapesShape7;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape40;
  failEff?: BIZ_EVENTSShape4;
}
interface BIZ_EVENTSShape42 {
  cash: number;
  failText: string;
  log: string[];
}
interface BIZ_EVENTSShape43 {
  label: string;
  hint: string;
  odds?: ((a0: any) => any);
  okEffFn?: (() => BIZ_EVENTSShape);
  okText?: string;
  failEff?: BIZ_EVENTSShape42;
  eff?: BIZ_EVENTSShape10;
}
interface BIZ_EVENTSShape44 {
  funded: boolean;
}
interface BIZ_EVENTSShape45 {
  bizcash: any;
  flag: BIZ_EVENTSShape44;
  log: string[];
}
interface BIZ_EVENTSShape46 {
  fundedLight: boolean;
}
interface BIZ_EVENTSShape47 {
  bizcash: any;
  flag: BIZ_EVENTSShape46;
  log: string[];
}
interface BIZ_EVENTSShape48 {
  rep: number;
  happy: number;
  log: string[];
}
interface BIZ_EVENTSShape49 {
  label: string;
  hint: string;
  effFn?: (() => BIZ_EVENTSShape45) | (() => BIZ_EVENTSShape47);
  eff?: BIZ_EVENTSShape48;
}
interface BIZ_EVENTSShape50 {
  okText: string;
}
interface BIZ_EVENTSShape51 {
  bizrep: number;
  stress: number;
  failText: string;
  log: string[];
}
interface BIZ_EVENTSShape52 {
  label: string;
  hint: string;
  effFn?: (() => BIZ_EVENTSShape27);
  eff?: BIZ_EVENTSShape10;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape50;
  failEff?: BIZ_EVENTSShape51;
}
interface BIZ_EVENTSShape53 {
  failText: string;
}
interface BIZ_EVENTSShapesShape8 {
  log: string[];
  bizcash?: number;
}
interface BIZ_EVENTSShape54 {
  label: string;
  hint: string;
  eff?: BIZ_EVENTSShapesShape8;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape29;
  failEff?: BIZ_EVENTSShape53;
}
interface BIZ_EVENTSShape55 {
  bizcash: number;
  bizrep: number;
  log: string[];
}
interface BIZ_EVENTSShape56 {
  hedged: boolean;
}
interface BIZ_EVENTSShape57 {
  cash: number;
  skill: BIZ_EVENTSShape5;
  flag: BIZ_EVENTSShape56;
  log: string[];
}
interface BIZ_EVENTSShapesShape9 {
  bizrep?: number;
  log: string[];
  cash?: number;
  skill?: BIZ_EVENTSShape5;
  flag?: BIZ_EVENTSShape56;
}
interface BIZ_EVENTSShape58 {
  label: string;
  hint: string;
  eff?: BIZ_EVENTSShapesShape9;
  effFn?: (() => BIZ_EVENTSShape55);
}
interface BIZ_EVENTSShape59 {
  cash: number;
  bizrep: number;
  bizqual: number;
  log: string[];
}
interface BIZ_EVENTSShapesShape10 {
  cash: number;
  bizrep: number;
  bizqual?: number;
  log: string[];
}
interface BIZ_EVENTSShape60 {
  label: string;
  hint: string;
  eff?: BIZ_EVENTSShapesShape10;
  odds?: (() => number);
  okEff?: BIZ_EVENTSShape50;
  failEffFn?: (() => BIZ_EVENTSShape55);
  failText?: string;
}
interface BIZ_EVENTSShape61 {
  id: string;
  cat: string;
  w: number;
  cd: number;
  cond: ((a0: any) => any) | boolean;
  title: string;
  text: string;
  opts: BIZ_EVENTSShape7[] | BIZ_EVENTSShape11[] | BIZ_EVENTSShape14[] | BIZ_EVENTSShape19[] | BIZ_EVENTSShape26[] | BIZ_EVENTSShape31[] | BIZ_EVENTSShape36[] | BIZ_EVENTSShape41[] | BIZ_EVENTSShape43[] | BIZ_EVENTSShape49[] | BIZ_EVENTSShape52[] | BIZ_EVENTSShape54[] | BIZ_EVENTSShape58[] | BIZ_EVENTSShape60[];
}

const BIZ_EVENTS: BIZ_EVENTSShape61[] = [
 {id:'bigorder', cat:'biz', w:1.2, cd:6, cond:s=>s.biz && s.biz.rep>35,
  title:'A corporate client wants a large order',
  text:'The volume is three times your normal quarter. They want it delivered in six weeks and they want 90-day payment terms.',
  opts:[
   {label:'Take it. Finance the gap yourself.', hint:'Revenue now, cash in 90 days. Working capital will hurt.',
    effFn:()=>({bizcash:Math.round(-0.35*Math.max(600000,(S.biz.revenue||0))), bizrep:5,
      log:['biz','You took the big order. The invoice is real; the cash arrives in ninety days.','good']}),
    delayFn:()=>({turns:1, kind:'good', title:'The big order lands', text:'It delivered. Payment cleared on day 88.',
      eff:{bizcash:Math.round(2.6*Math.max(600000,(S.biz.revenue||0))), bizrep:7,
        log:['biz','The corporate order paid. Three quarters of revenue in one cheque.','good']}})},
   {label:'Take it, but negotiate 50% upfront.', hint:'Lower volume, healthier cash.',
    odds:()=>0.55,
    okEffFn:()=>({bizcash:Math.round(0.9*Math.max(600000,(S.biz.revenue||0))), bizrep:4}),
    okText:'They agreed to 50% upfront. The order is smaller but it is funded.',
    okLog:['biz','You negotiated part payment upfront. Less revenue, no heart attack.','good'],
    failEff:{bizrep:-2, failText:'They walked. Procurement does not negotiate with suppliers your size.'}},
   {label:'Decline. You cannot fund the gap.', hint:'Discipline over vanity.',
    eff:{skill:{finance:2}, log:['biz','You declined an order you could not finance. Surviving is a strategy.','neutral']}}
 ]},
 {id:'viral', cat:'biz', w:0.5, cd:14, cond:s=>s.biz,
  title:'Someone filmed you',
  text:'A customer posted a video. It has 400,000 views by Tuesday and your phone has not stopped since.',
  opts:[
   {label:'Lean in. Spend ₦600k on fulfilment.', hint:'Convert attention into orders.',
    odds:()=>0.62,
    okEff:{bizcash:-600000, bizrep:14, bizcap:400000, okText:'You caught it. Orders tripled for two quarters and some of them stayed.',
      log:['biz','You rode the wave. Attention converted into a customer base.','good']},
    failEff:{bizcash:-600000, bizrep:-8, failText:'You could not fulfil fast enough. The comments turned.'}},
   {label:'Do nothing. Let it pass.', hint:'No cost, no gain.',
    eff:{log:['biz','The moment passed. Attention is the most perishable asset there is.','neutral']}}
 ]},
 {id:'poach', cat:'biz', w:0.9, cd:8, cond:s=>s.biz && s.biz.staff.length>0,
  title:'They are being interviewed',
  text:'Your best person has been taking calls during lunch. A competitor is offering 40% more, and they have told you about it, which means they have not decided yet.',
  opts:[
   {label:'Counter-offer. +30% immediately.', hint:'Keeps them today. Resets the market for everyone.',
    effFn:()=>{ const b=S.biz; if(b.staff.length){
        const best = b.staff.slice().sort((x,y)=>y.skill-x.skill)[0];
        best.salary = Math.round(best.salary*1.3); best.morale = clamp(best.morale+22,3,100); best.loyalty = clamp(best.loyalty+12,0,100);
      }
      return {log:['biz','You countered. They stayed. Now everyone knows what it costs to make you move.','warn']}; }},
   {label:'Give them equity and a real role.', hint:'No cash. Genuine alignment, permanent dilution.',
    eff:{bizrep:2, log:['biz','You gave them 3% and a title. They stopped taking lunch calls.','good'], flag:{gaveEquity:true}}},
   {label:'Let them go and wish them well.', hint:'The team notices how you handle it.',
    eff:{log:['biz','You let them go well. Two people stayed specifically because of how you handled it.','good']}}
 ]},
 {id:'thief', cat:'biz', w:0.8, cd:10, cond:s=>s.biz && s.biz.staff.length>0,
  title:'The numbers do not add up',
  text:'Stock is disappearing. It is small enough to be invisible per day and large enough to matter per quarter. Someone in this building is taking it.',
  opts:[
   {label:'Install controls. Cameras, stock counts. ₦450k.', hint:'Stops the bleeding structurally.',
    eff:{cash:-450000, bizrep:1, skill:{ops:3},
      log:['biz','You installed controls. Losses stopped and the honest staff were relieved.','good']}},
   {label:'Investigate and fire whoever it is.', hint:'Free if you are right. Costly if you are wrong.',
    odds:()=>0.6,
    okEff:{bizrep:2, okText:'You found them. It was the person nobody suspected. Morale across the team went up.',
      log:['biz','You found the leak and removed it.','good']},
    failEff:{bizrep:-6, cash:-200000, failText:'You fired the wrong person. Two others resigned in protest and you paid a settlement.',
      log:['biz','You fired the wrong person. That mistake cost more than the theft did.','bad']}},
   {label:'Absorb it as a cost of doing business.', hint:'It scales with volume. It always does.',
    eff:{skill:{finance:-1}, log:['biz','You absorbed it. Theft scales with revenue; it will not stay this small.','bad']}}
 ]},
 {id:'regulate', cat:'biz', w:0.9, cd:9, cond:s=>s.biz && !s.biz.formal && s.biz.revenue>2500000,
  title:'Officials at the door',
  text:'Two men, one clipboard, and a laminated ID each. They would like to see your registration documents, your tax clearance, and your fire certificate.',
  opts:[
   {label:'Cooperate fully. Pay the fines. ₦380k.', hint:'Painful, and it ends quickly.',
    eff:{cash:-380000, stress:6, log:['biz','You paid the fines and started the registration process the same week.','warn']}},
   {label:'Settle informally. ₦120k.', hint:'Cheaper today. Creates a recurring line item.',
    eff:{cash:-120000, flag:{onList:true}, log:['biz','You settled informally. They will be back. They always come back.','bad'],
      delay:{turns:4, title:'They are back', text:'Same office, new faces, higher number.', kind:'bad',
        eff:{cash:-600000, stress:8, log:['biz','The informal settlement became an annual subscription. It went up 400%.','bad']}}}},
   {label:'Formalise the company properly first.', hint:'₦450k now, and this stops being possible.',
    eff:{cash:-450000, log:['biz','You registered properly. It is now much harder for anyone to shut you down on a Tuesday.','good'], flag:{formalizing:true}}}
 ]},
 {id:'rentshock', cat:'biz', w:0.7, cd:12, cond:s=>s.biz,
  title:'The landlord has "reviewed" the rent',
  text:'A 65% increase, effective next quarter. He knows exactly what it would cost you to move.',
  opts:[
   {label:'Pay it.', hint:'Expensive, zero disruption.',
    effFn:()=>({bizcash:-Math.round(400000*S.cumInfl), log:['biz','You absorbed the increase. Your margins are now somebody else’s.','warn']})},
   {label:'Move. ₦900k in downtime and fit-out.', hint:'Three weeks of chaos.',
    eff:{cash:-900000, bizrep:-5, stress:9,
      log:['biz','You moved. Three weeks of chaos, and you are paying 20% less for ten years.','good']}},
   {label:'Negotiate. Offer a longer lease.', hint:'Landlords want certainty more than they want upside.',
    odds:()=>0.58,
    okEff:{okText:'He took a 3-year lease at +20%. Certainty beats a bigger number.',
      log:['biz','You traded lease length for a smaller increase. The oldest trick in commercial property.','good']},
    failEffFn:()=>({bizcash:-Math.round(400000*S.cumInfl)}),
    failText:'He had another tenant waiting. You paid the increase.'}
 ]},
 {id:'power', cat:'biz', w:0.8, cd:8, cond:s=>s.biz && (BIZ.find(x=>x.id===s.biz.type).power>0.3),
  title:'A surge took out your equipment',
  text:'The grid came back on at 2am with enthusiasm. Some of your equipment did not come back with it.',
  opts:[
   {label:'Replace it. ₦1.1m.', hint:'Fast, keeps output intact.',
    eff:{cash:-1100000, log:['biz','You replaced the equipment in four days. Output barely dipped.','good']}},
   {label:'Repair it. ₦320k, slower.', hint:'Two weeks at reduced capacity.',
    eff:{cash:-320000, bizrep:-3, log:['biz','You repaired it. Two weeks of reduced output cost more than the repair did.','warn']}},
   {label:'Buy solar and stop paying this tax.', hint:'₦4.2m. Permanent fix.',
    eff:{cash:-4200000, log:['biz','You installed solar. From this quarter on, the grid is someone else’s problem.','good'], flag:{solar:true}}}
 ]},
 {id:'competitor', cat:'biz', w:0.8, cd:11, cond:s=>s.biz,
  title:'Someone opened next door',
  text:'Same product, cheaper, and they copied your branding closely enough that customers are asking if you are related.',
  opts:[
   {label:'Compete on price. Cut your margin.', hint:'A race to the bottom you might lose.',
    eff:{bizrep:-3, log:['biz','You cut prices. Volume held, profit did not.','warn']}},
   {label:'Compete on quality and service.', hint:'Slower. More durable.',
    eff:{bizcash:-500000, bizqual:12, bizrep:6,
      log:['biz','You doubled down on quality. Six months later you are the expensive one and people are proud to say they buy from you.','good']}},
   {label:'Go and talk to them.', hint:'Sometimes the best outcome is a shared market.',
    odds:()=>0.42,
    okEff:{bizrep:4, skill:{network:4}, okText:'You agreed on a referral arrangement. He sends you overflow; you send him what you cannot do.',
      log:['biz','You turned a competitor into a referral partner.','good']},
    failEff:{bizrep:-2, failText:'He undercut you the following week using what he learned in that meeting.'}}
 ]},
 {id:'tender', cat:'biz', w:0.7, cd:10, cond:s=>s.biz && s.biz.formal,
  title:'A government tender is open',
  text:'Real money, published criteria, and a process. It will take three weeks of your life to prepare the bid.',
  opts:[
   {label:'Bid. Bring in a consultant. ₦700k.', hint:'Long odds, large payoff.',
    odds:s=>clamp(0.18 + s.p.rep/400 + s.biz.rep/500, 0.08, 0.55),
    okEffFn:()=>({bizcash:Math.round(12000000*S.cumInfl), bizrep:10,
      log:['biz','You won the tender. One contract, twelve months of certainty.','good']}),
    okText:'You won. A contract that covers overhead for a year.',
    failEff:{cash:-700000, failText:'You lost to a company with better connections. The consultant was paid either way.',
      log:['biz','You lost the tender. You learned how the process actually works, which was not free.','warn']}},
   {label:'Skip it.', hint:'Free.',
    eff:{log:['biz','You skipped the tender.','neutral']}}
 ]},
 {id:'investor', cat:'biz', w:0.45, cd:16, cond:s=>s.biz && s.biz.revenue>8000000,
  title:'A fund wants to talk',
  text:'They have seen the numbers and they would like to invest. The term sheet involves a valuation, a board seat, and a growth plan you will be held to.',
  opts:[
   {label:'Take the money. Give up 25%.', hint:'Fuel, expectations, and a clock.',
    effFn:()=>({bizcash:Math.round(Math.max(6000000, (S.biz.revenue*4)*0.25)), flag:{funded:true},
      log:['biz','You took institutional money. You now have fuel and a board.','good']})},
   {label:'Take a smaller cheque at a higher price.', hint:'Less dilution, less fuel.',
    effFn:()=>({bizcash:Math.round(Math.max(2500000, (S.biz.revenue*4)*0.10)), flag:{fundedLight:true},
      log:['biz','You took a small raise at a good price. Optionality preserved.','good']})},
   {label:'Decline. You like being the owner.', hint:'Slower growth, full control.',
    eff:{rep:3, happy:3, log:['biz','You declined. The company grows at the speed of its own cashflow now.','neutral']}}
 ]},
 {id:'staffraise', cat:'biz', w:0.8, cd:9, cond:s=>s.biz && s.biz.staff.length>=3,
  title:'The team has organised',
  text:'They have elected a spokesperson. The ask is a 20% increase, and the timing is not an accident — it is your best quarter yet.',
  opts:[
   {label:'Grant it in full.', hint:'Morale and loyalty jump. Margins tighten permanently.',
    effFn:()=>({bizcash:-Math.round(staffMonthly()*3*0.20), log:['biz','You granted the increase in full. The team found out what you are willing to do.','good']})},
   {label:'Grant 10% plus a profit-share.', hint:'Aligns cost with performance.',
    eff:{log:['biz','You granted 10% and introduced a profit-share. It costs you nothing in a bad quarter.','good']}},
   {label:'Refuse. There is no room.', hint:'Cheapest today.',
    odds:()=>0.35,
    okEff:{okText:'They grumbled and stayed. You have until your next bad quarter.'},
    failEff:{bizrep:-10, stress:12, failText:'Three of them resigned in the same week, including two you cannot replace quickly.',
      log:['biz','You refused. Three people resigned in seven days.','bad']}}
 ]},
 {id:'supplier', cat:'biz', w:0.8, cd:9, cond:s=>s.biz,
  title:'Your supplier offers 60-day terms',
  text:'A genuine offer of credit — with a 4% premium baked into the price if you take it. You did not ask for the premium; it is simply in there.',
  opts:[
   {label:'Take the credit.', hint:'Cash flow relief, quietly more expensive.',
    eff:{log:['biz','You took 60-day terms. Your cash cycle relaxed and your unit cost went up 4%.','warn']}},
   {label:'Negotiate the premium out.', hint:'Free to ask.',
    odds:()=>0.5,
    okEff:{okText:'They dropped the premium to 1.5% once you asked for it in writing.', log:['biz','You asked. It worked.','good']},
    failEff:{failText:'Terms only, no discount. You took it anyway.'}},
   {label:'Pay cash and take the 5% discount.', hint:'Requires treasury depth. Pure arbitrage.',
    eff:{bizcash:-400000, log:['biz','You paid upfront for the discount. Free money if you can fund it.','good']}}
 ]},
 {id:'fxhit', cat:'biz', w:0.7, cd:10, cond:s=>s.biz && ['retail','mfg','energy','logi'].indexOf(s.biz.type)>=0,
  title:'Your inputs are priced in dollars',
  text:'A devaluation lands mid-quarter. Your suppliers reprice before your customers will accept a new price. For six weeks, your margin simply does not exist.',
  opts:[
   {label:'Raise prices immediately.', hint:'Protects margin, loses volume.',
    eff:{bizrep:-5, log:['biz','You raised prices within the week. You lost a quarter of your volume and kept the company solvent.','warn']}},
   {label:'Absorb it. Do not scare customers.', hint:'Cash hit now, loyalty later.',
    effFn:()=>({bizcash:-Math.round(Math.max(600000, (S.biz.revenue||2000000)*0.28)), bizrep:4,
      log:['biz','You absorbed the FX hit. It cost you a quarter of profit and bought you real goodwill.','warn']})},
   {label:'Hedge forward from now on.', hint:'₦250k to set up. Removes this entire class of problem.',
    eff:{cash:-250000, skill:{finance:5}, flag:{hedged:true},
      log:['biz','You set up forward cover. This specific disaster can no longer happen to you.','good']}}
 ]},
 {id:'recall', cat:'biz', w:0.5, cd:16, cond:s=>s.biz && s.biz.quality<62,
  title:'A batch went out bad',
  text:'Twenty-eight customers have complained in four days. The problem is traceable to one supplier batch and everyone can see it.',
  opts:[
   {label:'Full recall and refund. ₦1.4m.', hint:'Expensive. Reputational recovery is immediate.',
    eff:{cash:-1400000, bizrep:12, bizqual:8, log:['biz','You recalled and refunded everything. Two of those customers became your loudest advocates.','good']}},
   {label:'Replace quietly, case by case. ₦520k.', hint:'Cheaper. Leaves a trail.',
    eff:{cash:-520000, bizrep:-2, log:['biz','You handled it quietly. Most people were satisfied. Some told everyone anyway.','neutral']}},
   {label:'Deny and wait for it to blow over.', hint:'Cheapest. There is a version of this that ends the company.',
    odds:()=>0.3,
    okEff:{okText:'It faded. The internet moved on.'},
    failEffFn:()=>({bizrep:-22, bizcash:-Math.round((S.biz.revenue||3000000)*0.6),
      log:['biz','You denied it. The internet did not move on. Revenue halved.','bad']}),
    failText:'It went properly viral. Revenue halved for three quarters.'}
 ]},
];
