/*
  LIFE_EVENTS — from 05-investments-goods.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface LIFE_EVENTSShape {
  cash: number;
  rep: number;
  family: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape2 {
  rep: number;
  family: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape {
  cash?: number;
  rep: number;
  family: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape3 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape;
}
interface LIFE_EVENTSShape4 {
  cash: number;
  family: number;
  happy: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape5 {
  cash: number;
  family: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape6 {
  cash: number;
  family: number;
  stress: number;
  health: number;
  log: string[];
}
interface LIFE_EVENTSShape7 {
  turns: number;
  title: string;
  text: string;
  kind: string;
  eff: LIFE_EVENTSShape6;
}
interface LIFE_EVENTSShape8 {
  family: number;
  stress: number;
  happy: number;
  log: string[];
  delay: LIFE_EVENTSShape7;
}
interface LIFE_EVENTSShapesShape2 {
  cash?: number;
  family: number;
  happy?: number;
  stress: number;
  log: string[];
  delay?: LIFE_EVENTSShape7;
}
interface LIFE_EVENTSShape9 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape2;
}
interface LIFE_EVENTSShape10 {
  abroad: boolean;
}
interface LIFE_EVENTSShape11 {
  network: number;
}
interface LIFE_EVENTSShape12 {
  title: string;
  monthly: any;
  industry: string;
}
interface LIFE_EVENTSShape13 {
  flag: LIFE_EVENTSShape10;
  rep: number;
  family: number;
  stress: number;
  happy: number;
  skill: LIFE_EVENTSShape11;
  job: LIFE_EVENTSShape12;
  log: string[];
}
interface LIFE_EVENTSShape14 {
  happy: number;
  rep: number;
  skill: LIFE_EVENTSShape11;
  log: string[];
}
interface LIFE_EVENTSShape15 {
  job: LIFE_EVENTSShape12;
  happy: number;
  skill: LIFE_EVENTSShape11;
}
interface LIFE_EVENTSShape16 {
  happy: number;
  rep: number;
  failText: string;
}
interface LIFE_EVENTSShape17 {
  label: string;
  hint: string;
  effFn?: (() => LIFE_EVENTSShape13);
  eff?: LIFE_EVENTSShape14;
  odds?: ((a0: any) => any);
  okEffFn?: (() => LIFE_EVENTSShape15);
  okText?: string;
  failEff?: LIFE_EVENTSShape16;
}
interface LIFE_EVENTSShape18 {
  angel: boolean;
}
interface LIFE_EVENTSShape19 {
  cash: number;
  flag: LIFE_EVENTSShape18;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape20 {
  cash: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape21 {
  finance: number;
}
interface LIFE_EVENTSShape22 {
  rep: number;
  skill: LIFE_EVENTSShape21;
  log: string[];
}
interface LIFE_EVENTSShapesShape3 {
  cash?: number;
  flag?: LIFE_EVENTSShape18;
  happy?: number;
  log: string[];
  rep?: number;
  skill?: LIFE_EVENTSShape21;
}
interface LIFE_EVENTSShape23 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape3;
  delayFn?: (() => any);
}
interface LIFE_EVENTSShape24 {
  cash: number;
  okText: string;
  log: string[];
}
interface LIFE_EVENTSShape25 {
  cash: number;
  stress: number;
  rep: number;
  skill: LIFE_EVENTSShape21;
  failText: string;
  log: string[];
}
interface LIFE_EVENTSShape26 {
  log: string[];
}
interface LIFE_EVENTSShapesShape4 {
  rep?: number;
  skill?: LIFE_EVENTSShape21;
  log: string[];
}
interface LIFE_EVENTSShape27 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape24;
  failEff?: LIFE_EVENTSShape25;
  eff?: LIFE_EVENTSShapesShape4;
}
interface LIFE_EVENTSShape28 {
  income: any;
}
interface LIFE_EVENTSShape29 {
  kid: number;
  cash: number;
  happy: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape30 {
  turns: number;
  title: string;
  text: string;
  kind: string;
  eff: LIFE_EVENTSShape29;
}
interface LIFE_EVENTSShape31 {
  cash: number;
  marry: LIFE_EVENTSShape28;
  happy: number;
  family: number;
  stress: number;
  log: string[];
  delay: LIFE_EVENTSShape30;
}
interface LIFE_EVENTSShape32 {
  cash: number;
  marry: LIFE_EVENTSShape28;
  happy: number;
  family: number;
  log: string[];
}
interface LIFE_EVENTSShape33 {
  happy: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape34 {
  label: string;
  hint: string;
  effFn?: (() => LIFE_EVENTSShape31) | (() => LIFE_EVENTSShape32);
  eff?: LIFE_EVENTSShape33;
}
interface LIFE_EVENTSShape35 {
  cash: number;
  family: number;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShape36 {
  family: number;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape5 {
  cash?: number;
  family: number;
  rep: number;
  log: string[];
  happy?: number;
}
interface LIFE_EVENTSShape37 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape5;
  delayFn?: (() => any);
}
interface LIFE_EVENTSShape38 {
  cash: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape39 {
  stress: number;
  rep: number;
  okText: string;
}
interface LIFE_EVENTSShape40 {
  cash: number;
  stress: number;
  health: number;
  failText: string;
}
interface LIFE_EVENTSShape41 {
  label: string;
  hint: string;
  eff?: LIFE_EVENTSShape38;
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape39;
  failEff?: LIFE_EVENTSShape40;
}
interface LIFE_EVENTSShape42 {
  cash: number;
  family: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape43 {
  cash: number;
  family: number;
  log: string[];
}
interface LIFE_EVENTSShape44 {
  family: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape6 {
  cash?: number;
  family: number;
  happy?: number;
  log: string[];
  stress?: number;
}
interface LIFE_EVENTSShape45 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape6;
}
interface LIFE_EVENTSShape46 {
  cash: number;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShape47 {
  rep: number;
  okText: string;
}
interface LIFE_EVENTSShape48 {
  cash: number;
  rep: number;
  failText: string;
}
interface LIFE_EVENTSShape49 {
  label: string;
  hint: string;
  eff?: LIFE_EVENTSShape46;
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape47;
  failEff?: LIFE_EVENTSShape48;
}
interface LIFE_EVENTSShape50 {
  cash: number;
  health: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape51 {
  health: number;
  okText: string;
}
interface LIFE_EVENTSShape52 {
  cash: number;
  health: number;
  stress: number;
  failText: string;
  log: string[];
}
interface LIFE_EVENTSShape53 {
  label: string;
  hint: string;
  eff?: LIFE_EVENTSShape50;
  odds?: ((a0: any) => any);
  okEff?: LIFE_EVENTSShape51;
  failEff?: LIFE_EVENTSShape52;
}
interface LIFE_EVENTSShape54 {
  cash: number;
  stress: number;
  health: number;
  happy: number;
  jobPerf: number;
  log: string[];
}
interface LIFE_EVENTSShape55 {
  stress: number;
  health: number;
  okText: string;
}
interface LIFE_EVENTSShape56 {
  label: string;
  hint: string;
  effFn?: (() => LIFE_EVENTSShape54);
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape55;
  failEff?: LIFE_EVENTSShape52;
}
interface LIFE_EVENTSShape57 {
  cash: number;
  stress: number;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape7 {
  cash: number;
  stress: number;
  log: string[];
  rep?: number;
}
interface LIFE_EVENTSShape58 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape7;
}
interface LIFE_EVENTSShape59 {
  network: number;
  finance: number;
  ops: number;
}
interface LIFE_EVENTSShape60 {
  rep: number;
  skill: LIFE_EVENTSShape11;
  log: string[];
}
interface LIFE_EVENTSShape61 {
  turns: number;
  title: string;
  text: string;
  kind: string;
  eff: LIFE_EVENTSShape60;
}
interface LIFE_EVENTSShape62 {
  stress: number;
  skill: LIFE_EVENTSShape59;
  rep: number;
  log: string[];
  delay: LIFE_EVENTSShape61;
}
interface LIFE_EVENTSShapesShape8 {
  stress?: number;
  skill?: LIFE_EVENTSShape59;
  rep?: number;
  log: string[];
  delay?: LIFE_EVENTSShape61;
}
interface LIFE_EVENTSShape63 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape8;
}
interface LIFE_EVENTSShape64 {
  hustle: number;
}
interface LIFE_EVENTSShape65 {
  cash: number;
  stress: number;
  health: number;
  skill: LIFE_EVENTSShape64;
  log: string[];
}
interface LIFE_EVENTSShape66 {
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape9 {
  cash?: number;
  stress?: number;
  health?: number;
  skill?: LIFE_EVENTSShape64;
  log: string[];
  happy?: number;
}
interface LIFE_EVENTSShape67 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape9;
}
interface LIFE_EVENTSShape68 {
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape10 {
  cash?: number;
  rep: number;
  family?: number;
  happy?: number;
  log: string[];
}
interface LIFE_EVENTSShape69 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape10;
}
interface LIFE_EVENTSShape70 {
  id: string;
  value: number;
}
interface LIFE_EVENTSShape71 {
  cash: number;
  asset: LIFE_EVENTSShape70;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShape72 {
  cash: number;
  skill: LIFE_EVENTSShape11;
  okText: string;
}
interface LIFE_EVENTSShape73 {
  failText: string;
}
interface LIFE_EVENTSShape74 {
  skill: LIFE_EVENTSShape21;
  log: string[];
}
interface LIFE_EVENTSShapesShape11 {
  cash?: number;
  asset?: LIFE_EVENTSShape70;
  rep?: number;
  log: string[];
  skill?: LIFE_EVENTSShape21;
}
interface LIFE_EVENTSShape75 {
  label: string;
  hint: string;
  eff?: LIFE_EVENTSShapesShape11;
  delayFn?: (() => any);
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape72;
  failEff?: LIFE_EVENTSShape73;
}
interface LIFE_EVENTSShape76 {
  cash: number;
  stress: number;
  skill: LIFE_EVENTSShape21;
  log: string[];
}
interface LIFE_EVENTSShape77 {
  stress: number;
  okText: string;
}
interface LIFE_EVENTSShape78 {
  cash: number;
  stress: number;
  rep: number;
  failText: string;
  log: string[];
}
interface LIFE_EVENTSShape79 {
  label: string;
  hint: string;
  eff?: LIFE_EVENTSShape76;
  odds?: (() => number);
  okEff?: LIFE_EVENTSShape77;
  failEff?: LIFE_EVENTSShape78;
}
interface LIFE_EVENTSShape80 {
  informal: number;
  family: number;
  stress: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShape81 {
  family: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape12 {
  informal?: number;
  family: number;
  stress?: number;
  happy?: number;
  log: string[];
  cash?: number;
}
interface LIFE_EVENTSShape82 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape12;
}
interface LIFE_EVENTSShape83 {
  cash: number;
  log: string[];
}
interface LIFE_EVENTSShape84 {
  asset: LIFE_EVENTSShape70;
  log: string[];
}
interface LIFE_EVENTSShapesShape13 {
  cash?: number;
  log: string[];
  asset?: LIFE_EVENTSShape70;
}
interface LIFE_EVENTSShape85 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape13;
}
interface LIFE_EVENTSShape86 {
  cash: number;
  skill: LIFE_EVENTSShape11;
  rep: number;
  stress: number;
  log: string[];
}
interface LIFE_EVENTSShape87 {
  cash: number;
  skill: LIFE_EVENTSShape11;
  rep: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape14 {
  cash?: number;
  skill?: LIFE_EVENTSShape11;
  rep?: number;
  stress?: number;
  log: string[];
}
interface LIFE_EVENTSShape88 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape14;
}
interface LIFE_EVENTSShape89 {
  turns: number;
  title: string;
  text: string;
  kind: string;
  eff: LIFE_EVENTSShape38;
}
interface LIFE_EVENTSShape90 {
  cash: number;
  stress: number;
  log: string[];
  delay: LIFE_EVENTSShape89;
}
interface LIFE_EVENTSShape91 {
  soldCar: boolean;
}
interface LIFE_EVENTSShape92 {
  cash: any;
  flag: LIFE_EVENTSShape91;
  stress: number;
  happy: number;
  log: string[];
}
interface LIFE_EVENTSShapesShape15 {
  cash: number | any;
  stress: number;
  log: string[];
  delay?: LIFE_EVENTSShape89;
  flag?: LIFE_EVENTSShape91;
  happy?: number;
}
interface LIFE_EVENTSShape93 {
  label: string;
  hint: string;
  eff: LIFE_EVENTSShapesShape15;
}
interface LIFE_EVENTSShape94 {
  cash: number;
  asset: LIFE_EVENTSShape70;
  stress: number;
  failText: string;
  log: string[];
}
interface LIFE_EVENTSShapesShape16 {
  cash?: number;
  okText: string;
  log?: string[];
  stress?: number;
  rep?: number;
}
interface LIFE_EVENTSShapesShape17 {
  cash: number;
  asset?: LIFE_EVENTSShape70;
  stress: number;
  failText: string;
  log?: string[];
  health?: number;
}
interface LIFE_EVENTSShape95 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEff?: LIFE_EVENTSShapesShape16;
  failEff?: LIFE_EVENTSShapesShape17;
  eff?: LIFE_EVENTSShape38;
}
interface LIFE_EVENTSShape96 {
  id: string;
  cat: string;
  w: number;
  cd: number;
  title: string;
  text: string;
  opts: LIFE_EVENTSShape3[] | LIFE_EVENTSShape9[] | LIFE_EVENTSShape17[] | LIFE_EVENTSShape23[] | LIFE_EVENTSShape27[] | LIFE_EVENTSShape34[] | LIFE_EVENTSShape37[] | LIFE_EVENTSShape41[] | LIFE_EVENTSShape45[] | LIFE_EVENTSShape49[] | LIFE_EVENTSShape53[] | LIFE_EVENTSShape56[] | LIFE_EVENTSShape58[] | LIFE_EVENTSShape63[] | LIFE_EVENTSShape67[] | LIFE_EVENTSShape69[] | LIFE_EVENTSShape75[] | LIFE_EVENTSShape79[] | LIFE_EVENTSShape82[] | LIFE_EVENTSShape85[] | LIFE_EVENTSShape88[] | LIFE_EVENTSShape93[] | LIFE_EVENTSShape95[];
  cond?: ((a0: any) => boolean) | ((a0: any) => any) | boolean;
}

const LIFE_EVENTS: LIFE_EVENTSShape96[] = [
 {id:'wedding', cat:'life', w:1.4, cd:5,
  title:'Aso-ebi and a wedding you cannot skip',
  text:'Your university friend is getting married. The aso-ebi alone is priced like a small appliance, and everyone will notice whether you showed up properly.',
  opts:[
   {label:'Go properly. Aso-ebi, gift, hotel.', hint:'₦180k. Reputation and family goodwill.',
    eff:{cash:-180000, rep:3, family:5, happy:4, log:['life','You showed up properly. It was noted, favourably.','good']}},
   {label:'Go light. Cash gift, no aso-ebi.', hint:'₦60k. You will hear about it later.',
    eff:{cash:-60000, rep:0, family:-2, happy:1, log:['life','You went light. Someone took a photo and remembered it.','neutral']}},
   {label:'Send regrets. Money is too tight.', hint:'Free. Costs you something anyway.',
    eff:{rep:-3, family:-6, happy:-3, log:['life','You did not go. The group chat went quiet for a week.','bad']}}
 ]},
 {id:'parents', cat:'life', w:1.1, cd:8, cond:s=>s.p.parents>0,
  title:'Your father’s blood pressure is not a joke',
  text:'The clinic in the village says he needs to see a specialist in the city. The tests are not free and neither is the trip.',
  opts:[
   {label:'Pay for everything. Fly them down.', hint:'₦450k. Health and family secured.',
    eff:{cash:-450000, family:12, happy:4, stress:-4, log:['life','You paid for the specialist. He is fine. You are relieved in a way you did not expect.','good']}},
   {label:'Send money for the clinic only.', hint:'₦150k. Partial solution.',
    eff:{cash:-150000, family:3, stress:3, log:['life','You sent what you could. It helped. It was not enough, and you know it.','neutral']}},
   {label:'You cannot afford it right now.', hint:'Nothing spent. Everything felt.',
    eff:{family:-14, stress:11, happy:-7, log:['life','You said next month. You heard the silence on the phone.','bad'],
      delay:{turns:6, title:'The call you were dreading', text:'Your father had a stroke. Emergency care costs more than prevention did.', kind:'bad',
        eff:{cash:-2200000, family:-8, stress:14, health:-5, log:['life','Emergency care: ₦2.2m. The prevention would have cost a fifth of that.','bad']}}}}
  ]},
 {id:'japa', cat:'life', w:0.55, cd:20, cond:s=>s.p.skills.network>35 && s.p.age<45 && s.city!=='ldn' && s.city!=='nyc',
  title:'A visa came through',
  text:'A recruiter abroad has been pursuing you for months. The offer is real: a role, a relocation package, and a salary denominated in something that does not lose value while you sleep.',
  opts:[
   {label:'Take it. Relocate.', hint:'Income currency changes. Your network resets to near zero.',
    effFn:()=>({flag:{abroad:true}, rep:-4, family:-10, stress:12, happy:6, skill:{network:-18},
      job:{title:'Diaspora hire', monthly:Math.round(marketMonthly()*R.range(1.5,2.4)), industry:'Corporate'},
      log:['career','You relocated. The money is denominated properly now. Everything you built locally starts over.','warn']})},
   {label:'Decline. You are building something here.', hint:'Stay. Optionality preserved, network intact.',
    eff:{happy:3, rep:3, skill:{network:2}, log:['career','You turned it down. Bet on yourself, at home prices.','good']}},
   {label:'Negotiate a remote arrangement.', hint:'Odds of success depend on your reputation and network.',
    odds:s=>clamp(0.18 + s.p.rep/260 + s.p.skills.network/420, 0.1, 0.8),
    okEffFn:()=>({job:{title:'Remote (foreign payroll)', monthly:Math.round(marketMonthly()*R.range(1.1,1.7)), industry:'Corporate'}, happy:7, skill:{network:4}}),
    okText:'They agreed to remote. Foreign income, local cost base. This is the arbitrage everyone talks about.',
    failEff:{happy:-4, rep:-2, failText:'They needed someone on the ground. The offer went to someone else.'}}
 ]},
 {id:'angel', cat:'money', w:0.9, cd:10, cond:s=>s.fin.cash>400000,
  title:'A friend wants you into a round',
  text:'He has a deck, a prototype, and a deadline. He needs ₦500,000 and he is offering 4% of the company. He is also the third friend this year to ask.',
  opts:[
   {label:'Invest ₦500k.', hint:'Illiquid, high variance. Outcome lands in about three years.',
    eff:{cash:-500000, flag:{angel:true}, happy:2,
      log:['invest','You put ₦500k into a friend’s company. You may never see it again. That is the deal.','warn']},
    delayFn:()=>{ const hit = R.chance(0.20); return {turns:14, kind:hit?'good':'bad',
      title:'The angel bet resolves',
      text: hit ? 'The company found a market. Your 4% is worth real money.' : 'The company ran out of runway. Your 4% is worth nothing.',
      eff: hit ? {cash:Math.round(R.range(3.5,14)*500000), rep:4, log:['invest','The angel bet paid '+(R.f()>0.5?'well':'very well')+'. A 20% shot you took anyway.','good']}
               : {log:['invest','The angel bet went to zero. You knew the odds when you wrote the cheque.','bad']}}; }},
   {label:'Invest ₦150k as a gesture.', hint:'Small enough to lose, enough to stay in the room.',
    eff:{cash:-150000, happy:1, log:['invest','You wrote a small cheque. Relationship preserved, downside capped.','neutral']}},
   {label:'Pass. Explain why honestly.', hint:'Free. Reputation intact if you are kind about it.',
    eff:{rep:1, skill:{finance:1}, log:['invest','You passed, and you told him exactly why. He respected it.','good']}}
 ]},
 {id:'scam', cat:'money', w:0.8, cd:14, cond:s=>s.fin.cash>250000,
  title:'A man with a very confident smile',
  text:'He explains a structure. Import something, sell it, double your money in ninety days. He uses the word "guaranteed" four times in two minutes.',
  opts:[
   {label:'Put in ₦400k. It sounds certain.', hint:'It is not certain.',
    odds:()=>0.14,
    okEff:{cash:400000, okText:'It worked. Once.', log:['invest','The trade paid. You got lucky and you should know that is what it was.','good']},
    failEff:{cash:-400000, stress:9, rep:-2, skill:{finance:2}, failText:'The phone number is dead. The WhatsApp group has been deleted.',
      log:['invest','You lost ₦400k to a man with a confident smile. Tuition fees for a lesson you will not forget.','bad']}},
   {label:'Ask for the downside in writing.', hint:'The question that ends most pitches.',
    eff:{skill:{finance:3}, rep:1, log:['invest','You asked what happens if the shipment does not land. He stopped calling.','good']}},
   {label:'Walk away immediately.', hint:'Free. Nothing learned.',
    eff:{log:['invest','You walked away.','neutral']}}
 ]},
 {id:'marry', cat:'life', w:0.5, cd:40, cond:s=>!s.p.married && s.p.age>=26,
  title:'This is the person',
  text:'You have known them for two years. It is time to decide whether this becomes a formal thing with a ceremony, a family meeting, and a joint budget.',
  opts:[
   {label:'Marry. Do it properly.', hint:'₦2.4m ceremony. Big life change, real upside.',
    effFn:()=>({cash:-2400000, marry:{income:Math.round(R.range(180000,520000)*CITY().payMult)}, happy:16, family:10, stress:8,
      log:['life','You married. Everything about your finances is now a shared decision.','good'],
      delay:{turns:8, title:'A child arrives', text:'Two years in, you have a daughter. Your entire model of spending changes permanently.', kind:'neutral',
        eff:{kid:1, cash:-650000, happy:12, stress:12, log:['life','You had a child. Nothing about money looks the same again.','good']}}})},
   {label:'Move in together. Skip the ceremony.', hint:'₦350k. Your family will have opinions.',
    effFn:()=>({cash:-350000, marry:{income:Math.round(R.range(150000,420000)*CITY().payMult)}, happy:9, family:-6,
      log:['life','You moved in together. It is cheaper and your mother is unhappy.','neutral']})},
   {label:'Not now. You are mid-build.', hint:'Free. The offer may not wait.',
    eff:{happy:-6, stress:4, log:['life','You said not now. Some doors stay open. Some do not.','bad']}}
 ]},
 {id:'lend', cat:'life', w:1.0, cd:9, cond:s=>s.fin.cash>300000,
  title:'An old friend needs a soft loan',
  text:'He needs ₦300,000 before Friday. He is not a bad person. He is also not employed right now, and you have heard this story before from other people.',
  opts:[
   {label:'Lend it. No paperwork.', hint:'Relationship protected. Recovery uncertain.',
    eff:{cash:-300000, family:4, rep:2,
      log:['life','You lent ₦300k with no paperwork. You have mentally written off 60% of it already.','neutral']},
    delayFn:()=>{ const back = R.chance(0.42); return {turns:5, kind:back?'good':'bad',
      title:'The loan question',
      text: back ? 'A year later he transferred the full amount, with interest nobody asked for.' : 'A year later, the subject has not come up once.',
      eff: back ? {cash:330000, family:5, log:['life','He paid it back in full. Rare and wonderful.','good']}
                : {family:-7, log:['life','You never got it back. You also never brought it up.','bad']}}; }},
   {label:'Give ₦80k as a gift, not a loan.', hint:'Honest, bounded, and preserves the friendship.',
    eff:{cash:-80000, family:5, happy:3, rep:2, log:['life','You gave what you could afford to lose and called it a gift. That is the version that survives.','good']}},
   {label:'Say no.', hint:'Free. Reputation cost depends on how you say it.',
    eff:{family:-4, rep:-1, log:['life','You said no. He understood. Eventually.','bad']}}
 ]},
 {id:'bribe', cat:'life', w:0.8, cd:12,
  title:'The roadblock',
  text:'It is 11pm. Three men with a torch and a vehicle that is not going anywhere until something changes hands.',
  opts:[
   {label:'Pay ₦5,000 and go home.', hint:'Fast. Cheap. Teaches them the roadblock works.',
    eff:{cash:-5000, stress:3, log:['life','You paid. You got home. You funded the next roadblock.','neutral']}},
   {label:'Refuse. Insist on your rights.', hint:'Three hours, no money, and a principle.',
    odds:()=>0.55,
    okEff:{stress:6, rep:2, okText:'They got bored. You left at 2am with nothing but your dignity and a dead phone.'},
    failEff:{cash:-25000, stress:10, health:-3, failText:'It escalated. You paid more, later, and it took longer.'}}
 ]},
 {id:'fees', cat:'life', w:1.0, cd:7, cond:s=>s.p.family>25,
  title:'School fees, again',
  text:'Your younger sibling’s school has sent the third reminder. The amount is not enormous. The expectation that you will handle it is.',
  opts:[
   {label:'Pay it. ₦220k.', hint:'Family secured. Budget squeezed.',
    eff:{cash:-220000, family:9, happy:2, log:['life','You paid the fees. Nobody says thank you; that is not how it works.','good']}},
   {label:'Pay half and explain.', hint:'₦110k. Sets a boundary gently.',
    eff:{cash:-110000, family:1, log:['life','You paid half. There was a conversation. It needed to happen.','neutral']}},
   {label:'Decline. You have your own runway to protect.', hint:'Free. Family takes a real hit.',
    eff:{family:-11, stress:6, log:['life','You said no. The word travels through the family faster than your reasons do.','bad']}}
 ]},
 {id:'levy', cat:'life', w:0.7, cd:10, cond:s=>s.flags.ownsHome,
  title:'Estate levy and the community association',
  text:'The residents association has "resolved" that every household contributes to a new project. The chairman is standing in your compound with a receipt book.',
  opts:[
   {label:'Pay the ₦120k levy.', hint:'Peace with neighbours.',
    eff:{cash:-120000, rep:2, log:['life','You paid the levy. The street gets a borehole.','neutral']}},
   {label:'Ask to see the accounts first.', hint:'Costs you a quarter of friction. Often reveals a lot.',
    odds:()=>0.5,
    okEff:{rep:3, okText:'The accounts appeared. So did a discount. Asking was free.'},
    failEff:{cash:-120000, rep:-2, failText:'You paid anyway, but now you are "the difficult one".'}}
 ]},
 {id:'health', cat:'health', w:0.9, cd:11,
  title:'Something is not right',
  text:'Three weeks of tiredness that sleep does not fix. You can book a full check-up for ₦180,000, or assume it is stress and keep moving.',
  opts:[
   {label:'Full check-up. ₦180k.', hint:'Catches things early. That is the entire point.',
    eff:{cash:-180000, health:6, stress:-6, log:['health','You got checked. They found something manageable because it was early.','good']}},
   {label:'Basic tests only. ₦45k.', hint:'Partial information.',
    eff:{cash:-45000, health:2, stress:-2, log:['health','Basic tests came back inconclusive. You went home and Googled.','neutral']}},
   {label:'Ignore it. You have a quarter to survive.', hint:'Free now.',
    odds:s=>clamp(0.55 + s.p.health/300, 0.35, 0.9),
    okEff:{health:-4, okText:'It passed. You got away with it this time.'},
    failEff:{cash:-1400000, health:-18, stress:14,
      failText:'It was not stress. Emergency admission, ₦1.4m, and six weeks you did not budget for.',
      log:['health','You ignored it. It cost ₦1.4m and six weeks. Prevention was ₦180k.','bad']}}
 ]},
 {id:'burnout', cat:'health', w:0.9, cd:10, cond:s=>s.p.stress>62,
  title:'Your body is sending invoices',
  text:'You have been running at this pace for a while. Something has to give and you get to choose what.',
  opts:[
   {label:'Take two weeks off. Properly.', hint:'One month of expenses, no income.',
    effFn:()=>({cash:-Math.round(budgetMonthly()*1.1), stress:-24, health:8, happy:9, jobPerf:-6,
      log:['health','You stopped. The world did not end. That was the part you needed to learn.','good']})},
   {label:'Push through. This quarter matters.', hint:'Output holds. Something else pays.',
    odds:()=>0.4,
    okEff:{stress:8, health:-4, okText:'You pushed through and it worked. You also now believe pushing always works.'},
    failEff:{health:-14, stress:12, cash:-900000,
      failText:'You collapsed at work. Hospital, then two weeks of nothing.',
      log:['health','You pushed through. Your body overruled you.','bad']}}
 ]},
 {id:'theft', cat:'life', w:0.7, cd:15,
  title:'Your phone left with someone else',
  text:'Danfo window seat, earphones in, and then it was gone. Everything is on that phone.',
  opts:[
   {label:'Replace it today. ₦420k.', hint:'Fast, expensive, back to work.',
    eff:{cash:-420000, stress:-4, log:['life','You replaced it same day. Expensive, but your work did not stop.','neutral']}},
   {label:'Buy a cheap one and wait.', hint:'₦90k. Two quarters of inconvenience.',
    eff:{cash:-90000, stress:5, rep:-2, log:['life','You bought a ₦90k burner. Every call is slightly humiliating.','neutral']}}
 ]},
 {id:'mentor', cat:'life', w:0.6, cd:18, cond:s=>s.p.rep>45,
  title:'Someone senior offers you access',
  text:'A partner at a firm you admire asks you to join a small working group. It meets on Saturdays for a year. The pay is nothing. The room is everything.',
  opts:[
   {label:'Commit. Every Saturday for a year.', hint:'Big network and reputation gain. Real time cost.',
    eff:{stress:6, skill:{network:14, finance:5, ops:4}, rep:8,
      log:['life','You joined the group. A year later you know thirty people who can take one phone call from you.','good'],
      delay:{turns:6, title:'The room pays out', text:'Someone from the group introduces you to the client that changes your trajectory.', kind:'good',
        eff:{rep:6, skill:{network:6}, log:['life','An introduction from that group turned into real work.','good']}}}},
   {label:'Decline. Your weekends are inventory.', hint:'Free. The door closes.',
    eff:{log:['life','You declined. They asked once. Most people only ask once.']}}
 ]},
 {id:'sidegig', cat:'money', w:1.1, cd:6,
  title:'A weekend contract lands in your lap',
  text:'Someone needs work done urgently and is willing to pay cash for a two-week sprint. It will eat every evening you have.',
  opts:[
   {label:'Take it. ₦380k.', hint:'Cash now, sleep later.',
    eff:{cash:380000, stress:9, health:-3, skill:{hustle:2}, log:['money','You took the contract and delivered it. Paid in full.','good']}},
   {label:'Decline. Protect the recovery time.', hint:'Nothing gained, nothing lost.',
    eff:{happy:2, log:['money','You said no. You slept.','neutral']}}
 ]},
 {id:'tithe', cat:'life', w:0.6, cd:12,
  title:'The pledge card',
  text:'Your place of worship is building something. The pledge card has suggested amounts and everyone watches who fills what.',
  opts:[
   {label:'Pledge generously. ₦300k.', hint:'Social capital in a community that actually shows up for each other.',
    eff:{cash:-300000, rep:5, family:4, happy:3, log:['life','You pledged generously. People notice, and some of them are useful.','good']}},
   {label:'Pledge modestly. ₦50k.', hint:'Enough to be counted.',
    eff:{cash:-50000, rep:1, log:['life','You pledged modestly. Nobody commented.','neutral']}},
   {label:'Decline.', hint:'Free. Some doors quietly close.',
    eff:{rep:-3, log:['life','You declined the pledge card. It was remembered.','neutral']}}
 ]},
 {id:'distressed', cat:'money', w:0.6, cd:14, cond:s=>s.fin.cash>4000000,
  title:'A distressed seller',
  text:'A man needs to exit a property fast — relocation, deadline, no time to negotiate. He is asking 60% of what comparable units went for last quarter.',
  opts:[
   {label:'Buy it. ₦9.5m.', hint:'Illiquid. Upside if the title is clean.',
    eff:{cash:-9500000, asset:{id:'rental', value:15000000}, rep:2,
      log:['invest','You bought the distressed unit. If the title is clean, this is the trade of the decade.','good']},
    delayFn:()=>{ const bad = R.chance(0.26); return {turns:4, kind:bad?'bad':'good',
      title:'The title search comes back',
      text: bad ? 'The lawyers found a prior claim. It is fixable, for money.' : 'The lawyers found nothing. The discount was real.',
      eff: bad ? {cash:-3200000, stress:9, log:['invest','The title had an existing claim. ₦3.2m to make it go away.','bad']}
               : {log:['invest','Title confirmed clean. That discount was genuine.','good']}}; }},
   {label:'Offer to broker it for a fee.', hint:'₦0 risk, small upside.',
    odds:()=>0.45,
    okEff:{cash:650000, skill:{network:3}, okText:'You connected him to a buyer and took ₦650k for the introduction.'},
    failEff:{failText:'He found someone else before you could move.'}},
   {label:'Pass. You cannot verify the title in time.', hint:'Discipline.',
    eff:{skill:{finance:2}, log:['invest','You walked away from a cheap property because you could not verify it fast enough. That instinct is worth more than the deal.','good']}}
 ]},
 {id:'taxletter', cat:'money', w:0.6, cd:16, cond:s=>(s.biz && !s.biz.formal && s.biz.revenue>4000000) || (s.p.job && s.p.job.monthly>1500000),
  title:'A letter with a government letterhead',
  text:'It is polite, numbered, and refers to "outstanding obligations". Someone has been filing things about you, or not filing things about you.',
  opts:[
   {label:'Engage a proper accountant. ₦350k.', hint:'Usually turns a scary number into a boring one.',
    eff:{cash:-350000, stress:-8, skill:{finance:3}, log:['money','The accountant found three errors in their favour and two in yours. Net: manageable.','good']}},
   {label:'Ignore it until they escalate.', hint:'Free, for now.',
    odds:()=>0.35,
    okEff:{stress:5, okText:'Nothing happened. This time.'},
    failEff:{cash:-1800000, stress:12, rep:-4, failText:'They escalated. Penalties plus interest, and a lien that took two quarters to lift.',
      log:['money','You ignored a tax letter. It cost you ₦1.8m and two quarters.','bad']}}
 ]},
 {id:'relative', cat:'life', w:0.7, cd:13,
  title:'A cousin is coming to stay',
  text:'He needs a place for "a few weeks" while he looks for work. Your flat has one room and he has already told the family you agreed.',
  opts:[
   {label:'Host him properly.', hint:'₦35k/month, indefinitely.',
    eff:{informal:-35000, family:8, stress:7, happy:-2, log:['life','Your cousin moved in. "A few weeks" is a flexible unit of time.','neutral']}},
   {label:'Host him for one month only, clearly.', hint:'Boundary set with love.',
    eff:{cash:-60000, family:3, stress:2, log:['life','You gave him a month and a deadline. Both were honoured.','good']}},
   {label:'Say no.', hint:'Free. Family hears about it.',
    eff:{family:-8, log:['life','You said no. The family meeting about it happened without you.','bad']}}
 ]},
 {id:'windfall', cat:'money', w:0.35, cd:26,
  title:'Money you had forgotten about',
  text:'An old account. A dormant balance. A refund nobody chased. ₦640,000 has your name on it.',
  opts:[
   {label:'Bank it.', hint:'Boring. Correct.',
    eff:{cash:640000, log:['money','Found money, banked.','good']}},
   {label:'Put it straight into something risky.', hint:'Found money feels free. It is not.',
    eff:{asset:{id:'crypto', value:640000}, log:['invest','You put found money into crypto. This is called mental accounting.','warn']}}
 ]},
 {id:'network_event', cat:'life', w:0.9, cd:8,
  title:'An industry event you were invited to',
  text:'A conference. The ticket is not cheap, the speakers are mid, but the hallway is where the actual value is.',
  opts:[
   {label:'Attend properly. ₦180k and two days.', hint:'Network and deal flow.',
    eff:{cash:-180000, skill:{network:5}, rep:3, stress:3,
      log:['life','You went. Two conversations in the hallway were worth more than every session.','good']}},
   {label:'Go to the free evening session only.', hint:'₦25k. Partial access.',
    eff:{cash:-25000, skill:{network:2}, rep:1, log:['life','You showed up for the mixer. Half the value, a fifth of the price.','neutral']}},
   {label:'Skip it.', hint:'Free.',
    eff:{log:['life','You skipped it.','neutral']}}
 ]},
 {id:'carbreak', cat:'life', w:0.7, cd:14, cond:s=>s.fin.goods.some(g=>g.id==='car'),
  title:'The car makes a new sound',
  text:'A sound that was not there last week. The mechanic says two words you did not want to hear: "gearbox" and "soon".',
  opts:[
   {label:'Fix it properly. ₦780k.', hint:'Expensive, keeps the asset alive.',
    eff:{cash:-780000, stress:-3, log:['life','You fixed it properly. It will run for years now.','good']}},
   {label:'Patch it. ₦180k.', hint:'Buys time, invites a worse failure.',
    eff:{cash:-180000, stress:4, log:['life','You patched it. The sound came back louder.','neutral'],
      delay:{turns:3, title:'The patch fails', text:'The gearbox gave out on the Third Mainland Bridge at 6pm.', kind:'bad',
        eff:{cash:-1100000, stress:9, log:['life','Full rebuild: ₦1.1m. The patch cost you an extra ₦300k and a very bad evening.','bad']}}}},
   {label:'Sell it and use ride-hailing.', hint:'Lose the asset, lose the upkeep.',
    eff:{cash:Math.round(GOODS.find(x=>x.id==='car').cost*0.35), flag:{soldCar:true}, stress:5, happy:-3,
      log:['life','You sold the car. Two million a year in upkeep, gone. So is the freedom.','neutral']}}
 ]},
 {id:'omoland', cat:'money', w:0.5, cd:20, cond:s=>s.assets.some(a=>a.id==='land'),
  title:'Men have appeared on your land',
  text:'They have documents. You have documents. Both sets of documents cannot be right, and they have brought a surveyor who agrees with them.',
  opts:[
   {label:'Lawyer up immediately. ₦850k.', hint:'Expensive, usually decisive.',
    odds:()=>0.78,
    okEff:{cash:-850000, okText:'Your title held. The men have not returned.', log:['money','You lawyered up fast. That speed is why you still own the land.','good']},
    failEff:{cash:-850000, asset:{id:'land', value:-6000000}, stress:14,
      failText:'Their claim was older. You lost a third of the plot and most of a year.',
      log:['money','The land dispute went against you. Title verification happens BEFORE payment, not after.','bad']}},
   {label:'Settle with them. ₦1.2m.', hint:'Fast. Teaches them it works.',
    eff:{cash:-1200000, stress:-4, log:['money','You settled. It worked, and now they know it works.','neutral']}},
   {label:'Go and shout. Bring people.', hint:'Cheap. Unpredictable.',
    odds:()=>0.4,
    okEff:{stress:8, rep:2, okText:'Volume plus numbers worked. They withdrew to "consult".'},
    failEff:{cash:-2500000, health:-8, stress:16, failText:'It turned physical. Hospital bills, police statements, and they still have the surveyor.'}}
 ]},
];
