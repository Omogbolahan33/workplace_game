/*
  MORE_EVENTS — from 07-events-life-deck.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface MORE_EVENTSShape {
  ops: number;
}
interface MORE_EVENTSShape2 {
  bizcash: any;
  skill: MORE_EVENTSShape;
  log: string[];
}
interface MORE_EVENTSShape3 {
  log: string[];
}
interface MORE_EVENTSShape4 {
  bizcash: any;
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape5 {
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape6 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape2) | (() => MORE_EVENTSShape4);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape3) | (() => MORE_EVENTSShape5);
  failText?: string;
  effFn?: (() => any);
}
interface MORE_EVENTSShape7 {
  bizqual: number;
  log: string[];
}
interface MORE_EVENTSShape8 {
  cash: number;
  bizrep: number;
  log: string[];
}
interface MORE_EVENTSShape9 {
  cash: number;
  log: string[];
}
interface MORE_EVENTSShape10 {
  bizcash: number;
  bizrep: number;
  log: string[];
}
interface MORE_EVENTSShape11 {
  bizcash: number;
  log: string[];
}
interface MORE_EVENTSShape12 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape7);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape8) | (() => MORE_EVENTSShape10);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape9) | (() => MORE_EVENTSShape11);
  failText?: string;
}
interface MORE_EVENTSShape13 {
  id: string;
  value: any;
}
interface MORE_EVENTSShape14 {
  network: number;
}
interface MORE_EVENTSShape15 {
  asset: MORE_EVENTSShape13;
  skill: MORE_EVENTSShape14;
  log: string[];
}
interface MORE_EVENTSShape16 {
  label: string;
  hint: string;
  odds?: (() => any) | (() => number);
  okEffFn?: (() => any) | (() => MORE_EVENTSShape15);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape3);
  failText?: string;
  effFn?: (() => any);
}
interface MORE_EVENTSShape17 {
  bizrep: number;
  log: string[];
}
interface MORE_EVENTSShape18 {
  label: string;
  hint: string;
  effFn?: (() => any) | (() => MORE_EVENTSShape17);
  odds?: (() => any);
  okEffFn?: (() => any);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape3);
  failText?: string;
}
interface MORE_EVENTSShape19 {
  cash: number;
  skill: MORE_EVENTSShape;
  biztrust: number;
  log: string[];
}
interface MORE_EVENTSShape20 {
  label: string;
  hint: string;
  effFn?: (() => any) | (() => MORE_EVENTSShape19);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape11);
  okText?: string;
  failEffFn?: (() => any);
  failText?: string;
}
interface MORE_EVENTSShape21 {
  bizrep: number;
  bizcash: any;
  biztrust: number;
  log: string[];
}
interface MORE_EVENTSShape22 {
  biztrust: number;
  log: string[];
}
interface MORE_EVENTSShape23 {
  label: string;
  hint: string;
  effFn?: (() => any) | (() => MORE_EVENTSShape22);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape21);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape11);
  failText?: string;
}
interface MORE_EVENTSShape24 {
  bizrep: number;
  bizqual: number;
  log: string[];
}
interface MORE_EVENTSShape25 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape24) | (() => MORE_EVENTSShape3);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape17);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape11);
}
interface MORE_EVENTSShape26 {
  inAssociation: boolean;
}
interface MORE_EVENTSShape27 {
  bizcash: number;
  skill: MORE_EVENTSShape14;
  bizcomp: number;
  flag: MORE_EVENTSShape26;
  log: string[];
}
interface MORE_EVENTSShape28 {
  label: string;
  hint: string;
  effFn?: (() => any) | (() => MORE_EVENTSShape27);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape3);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape10);
  failText?: string;
}
interface MORE_EVENTSShape29 {
  finance: number;
}
interface MORE_EVENTSShape30 {
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape31 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => any);
  okText?: string;
  failEffFn?: (() => any) | (() => MORE_EVENTSShape3);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape30);
}
interface MORE_EVENTSShape32 {
  cash: number;
  family: number;
  log: string[];
}
interface MORE_EVENTSShape33 {
  family: number;
  log: string[];
}
interface MORE_EVENTSShape34 {
  label: string;
  hint: string;
  effFn: (() => any) | (() => MORE_EVENTSShape32) | (() => MORE_EVENTSShape33);
}
interface MORE_EVENTSShape35 {
  skill: MORE_EVENTSShape29;
  credit: number;
  log: string[];
}
interface MORE_EVENTSShape36 {
  label: string;
  hint: string;
  effFn: (() => any) | (() => MORE_EVENTSShape35);
}
interface MORE_EVENTSShape37 {
  bizcash: number;
  skill: MORE_EVENTSShape14;
  rep: number;
  flag: MORE_EVENTSShape26;
  log: string[];
}
interface MORE_EVENTSShape38 {
  rep: number;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape39 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape11) | (() => MORE_EVENTSShape37);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape38);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape10);
  failText?: string;
}
interface MORE_EVENTSShape40 {
  franchised: boolean;
}
interface MORE_EVENTSShape41 {
  bizcash: any;
  bizrep: number;
  bizbrand: any;
  flag: MORE_EVENTSShape40;
  log: string[];
}
interface MORE_EVENTSShape42 {
  exporter: boolean;
}
interface MORE_EVENTSShape43 {
  bizcash: any;
  flag: MORE_EVENTSShape42;
  log: string[];
}
interface MORE_EVENTSShape44 {
  savvy: number;
}
interface MORE_EVENTSShape45 {
  skill: MORE_EVENTSShape44;
  log: string[];
}
interface MORE_EVENTSShape46 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape41);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape17);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape43) | (() => MORE_EVENTSShape45);
}
interface MORE_EVENTSShape47 {
  family: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape48 {
  label: string;
  hint: string;
  effFn: (() => MORE_EVENTSShape32) | (() => MORE_EVENTSShape47);
}
interface MORE_EVENTSShape49 {
  titled: boolean;
}
interface MORE_EVENTSShape50 {
  cash: number;
  rep: number;
  happy: number;
  flag: MORE_EVENTSShape49;
  log: string[];
}
interface MORE_EVENTSShape51 {
  cash: number;
  rep: number;
  skill: MORE_EVENTSShape44;
  flag: MORE_EVENTSShape49;
  log: string[];
}
interface MORE_EVENTSShape52 {
  rep: number;
  family: number;
  log: string[];
}
interface MORE_EVENTSShape53 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape50) | (() => MORE_EVENTSShape52);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape51);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape5);
  failText?: string;
}
interface MORE_EVENTSShape54 {
  cash: number;
  family: number;
  rep: number;
  happy: number;
  log: string[];
}
interface MORE_EVENTSShape55 {
  rep: number;
  family: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape56 {
  label: string;
  hint: string;
  effFn: (() => MORE_EVENTSShape54) | (() => MORE_EVENTSShape9) | (() => MORE_EVENTSShape55);
}
interface MORE_EVENTSShape57 {
  cash: number;
  stress: number;
  happy: number;
  log: string[];
}
interface MORE_EVENTSShape58 {
  name: string;
  bal: any;
  rate: number;
  minPay: any;
  kind: string;
}
interface MORE_EVENTSShape59 {
  debt: MORE_EVENTSShape58;
  log: string[];
}
interface MORE_EVENTSShape60 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape57) | (() => any);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape59);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape3);
  failText?: string;
}
interface MORE_EVENTSShape61 {
  cash: number;
  health: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape62 {
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape63 {
  health: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape64 {
  health: number;
  log: string[];
}
interface MORE_EVENTSShape65 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape61);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape62) | (() => MORE_EVENTSShape3);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape63) | (() => MORE_EVENTSShape64);
  failText?: string;
}
interface MORE_EVENTSShape66 {
  title: string;
  monthly: any;
  industry: string;
}
interface MORE_EVENTSShape67 {
  quitOwnBiz: any;
}
interface MORE_EVENTSShape68 {
  job: MORE_EVENTSShape66;
  happy: number;
  stress: number;
  flag: MORE_EVENTSShape67;
  log: string[];
}
interface MORE_EVENTSShape69 {
  bizcash: any | number;
  rep: number;
  skill: MORE_EVENTSShape14;
  bizrep: number;
  log: string[];
}
interface MORE_EVENTSShape70 {
  angelBacked: boolean;
}
interface MORE_EVENTSShape71 {
  bizcash: any;
  flag: MORE_EVENTSShape70;
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape72 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape68);
  odds?: (() => number) | (() => any);
  okEffFn?: (() => MORE_EVENTSShape69) | (() => MORE_EVENTSShape71);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape3);
  failText?: string;
}
interface MORE_EVENTSShape73 {
  inPolitics: boolean;
}
interface MORE_EVENTSShape74 {
  cash: number;
  rep: number;
  skill: MORE_EVENTSShape14;
  stress: number;
  flag: MORE_EVENTSShape73;
  log: string[];
}
interface MORE_EVENTSShape75 {
  rep: number;
  skill: MORE_EVENTSShape14;
  log: string[];
}
interface MORE_EVENTSShape76 {
  label: string;
  hint: string;
  effFn: (() => MORE_EVENTSShape74) | (() => MORE_EVENTSShape75) | (() => MORE_EVENTSShape3);
}
interface MORE_EVENTSShape77 {
  cash: any;
  family: number;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape78 {
  cash: number;
  family: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape79 {
  cash: any;
  family: number;
  log: string[];
}
interface MORE_EVENTSShape80 {
  family: number;
  rep: number;
  log: Array<string | number>;
}
interface MORE_EVENTSShape81 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape77);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape78);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape79) | (() => MORE_EVENTSShape80);
}
interface MORE_EVENTSShape82 {
  cash: number;
  family: number;
  happy: number;
  log: string[];
}
interface MORE_EVENTSShape83 {
  cash: number;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape84 {
  cash: number;
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape85 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape82);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape83);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape84);
  failText?: string;
}
interface MORE_EVENTSShape86 {
  usd: any;
  debt: MORE_EVENTSShape58;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape87 {
  debt: MORE_EVENTSShape58;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape88 {
  label: string;
  hint: string;
  effFn?: (() => any) | (() => MORE_EVENTSShape35);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape86);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape87);
  failText?: string;
}
interface MORE_EVENTSShape89 {
  cash: any;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape90 {
  cash: number;
  credit: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape91 {
  usd: any;
  cash: number;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape92 {
  label: (() => string) | number | string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape89);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape90);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape91) | (() => MORE_EVENTSShape30);
}
interface MORE_EVENTSShape93 {
  lifeCover: boolean;
}
interface MORE_EVENTSShape94 {
  cash: number;
  flag: MORE_EVENTSShape93;
  stress: number;
  family: number;
  log: string[];
}
interface MORE_EVENTSShape95 {
  selfInsure: boolean;
}
interface MORE_EVENTSShape96 {
  flag: MORE_EVENTSShape95;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape97 {
  label: string;
  hint: string;
  effFn: (() => MORE_EVENTSShape94) | (() => MORE_EVENTSShape96) | (() => MORE_EVENTSShape62);
}
interface MORE_EVENTSShape98 {
  pensionMaxed: boolean;
}
interface MORE_EVENTSShape99 {
  cash: number;
  asset: MORE_EVENTSShape13;
  flag: MORE_EVENTSShape98;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape100 {
  pensionEquities: boolean;
}
interface MORE_EVENTSShape101 {
  asset: MORE_EVENTSShape13;
  skill: MORE_EVENTSShape29;
  flag: MORE_EVENTSShape100;
  log: string[];
}
interface MORE_EVENTSShape102 {
  id: string;
  value: number;
}
interface MORE_EVENTSShape103 {
  asset: MORE_EVENTSShape102;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape104 {
  label: string;
  hint: string;
  effFn?: (() => MORE_EVENTSShape99) | (() => MORE_EVENTSShape3);
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape101);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape103);
  failText?: string;
}
interface MORE_EVENTSShape105 {
  cash: any;
  happy: number;
  skill: MORE_EVENTSShape29;
  log: string[];
}
interface MORE_EVENTSShape106 {
  cash: number;
  stress: number;
  log: string[];
}
interface MORE_EVENTSShape107 {
  rodeBubble: boolean;
}
interface MORE_EVENTSShape108 {
  cash: any;
  happy: number;
  flag: MORE_EVENTSShape107;
  log: string[];
}
interface MORE_EVENTSShape109 {
  cash: number;
  stress: number;
  credit: number;
  happy: number;
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape110 {
  skill: MORE_EVENTSShape44;
  rep: number;
  log: string[];
}
interface MORE_EVENTSShape111 {
  label: string;
  hint: string;
  odds?: (() => number);
  okEffFn?: (() => MORE_EVENTSShape105) | (() => MORE_EVENTSShape108);
  okText?: string;
  failEffFn?: (() => MORE_EVENTSShape106) | (() => MORE_EVENTSShape109);
  failText?: string;
  effFn?: (() => MORE_EVENTSShape110);
}
interface MORE_EVENTSShape112 {
  id: string;
  cat: string;
  w: number;
  cd: number;
  cond: ((a0: any) => any) | boolean | ((a0: any) => boolean) | any;
  title: string;
  text: (() => string) | number | string;
  opts: MORE_EVENTSShape6[] | MORE_EVENTSShape12[] | MORE_EVENTSShape16[] | MORE_EVENTSShape18[] | MORE_EVENTSShape20[] | MORE_EVENTSShape23[] | MORE_EVENTSShape25[] | MORE_EVENTSShape28[] | MORE_EVENTSShape31[] | MORE_EVENTSShape34[] | MORE_EVENTSShape36[] | MORE_EVENTSShape39[] | MORE_EVENTSShape46[] | MORE_EVENTSShape48[] | MORE_EVENTSShape53[] | MORE_EVENTSShape56[] | MORE_EVENTSShape60[] | MORE_EVENTSShape65[] | MORE_EVENTSShape72[] | MORE_EVENTSShape76[] | MORE_EVENTSShape81[] | MORE_EVENTSShape85[] | MORE_EVENTSShape88[] | MORE_EVENTSShape92[] | MORE_EVENTSShape97[] | MORE_EVENTSShape104[] | MORE_EVENTSShape111[];
}

const MORE_EVENTS: MORE_EVENTSShape112[] = [

/* ------------------------------------------------------------ BUSINESS --- */
{id:'deadbeat', cat:'biz', w:1.0, cd:10, cond:s=>s.biz && (s.biz.recv||0)>0,
 title:'A customer has stopped answering',
 text:()=>'You delivered '+fmt(Math.round(S.biz.recv*0.4))+' of goods six weeks ago. The goods were accepted. The phone is now going to voicemail, and the person who signed for it has "travelled".',
 opts:[
  {label:'Go there in person, every day if necessary.', hint:'In this market, presence is a collection strategy.',
   odds:()=>0.62,
   okEffFn:()=>({bizcash:Math.round(Math.max(200000,(S.biz.recv||0)*0.4)), skill:{ops:2}, log:['biz','You sat in their reception until somebody senior came out. It was paid that afternoon.','good']}),
   okText:'You went and sat there. On the third day a director walked past, saw you, and made a phone call. Paid that afternoon.',
   failEffFn:()=>({log:['biz','Three days of sitting in a reception and nothing came of it.','bad']}),
   failText:'Three days, two security guards, one empty promise.'},
  {label:'Write it off and move on.', hint:'Some money is not worth the months.',
   effFn:()=>{ const w=Math.round((S.biz.recv||0)*0.4); S.biz.recv=Math.max(0,(S.biz.recv||0)-w); return {skill:{finance:2}, log:['biz','You wrote off '+fmt(w)+' and stopped chasing it.','neutral']}; }},
  {label:'Tell the whole trade association.', hint:'Reputational enforcement. Costs you the account forever.',
   odds:()=>0.5,
   okEffFn:()=>({bizcash:Math.round(Math.max(200000,(S.biz.recv||0)*0.4)), rep:4, log:['biz','Word got round. They paid, and now everyone knows they pay slowly.','good']}),
   okText:'They paid within a week and the market now knows their payment habits. Nobody will offer them terms again.',
   failEffFn:()=>({rep:-5, log:['biz','You made it public and gained a reputation as someone who makes things public.','bad']}),
   failText:'They paid eventually, but you are now known as somebody who escalates. Some suppliers will not deal with you on credit any more.'}]},

{id:'copycat', cat:'biz', w:0.9, cd:12, cond:s=>s.biz && (s.biz.rep||0)>45,
 title:'Somebody is selling your thing',
 text:'A former employee, or someone who studied you closely, has launched a near-identical product at two-thirds of your price. They have copied the name, the packaging and, you notice, a typo from your own artwork.',
 opts:[
  {label:'Ignore them. Out-execute them.', hint:'The most common advice and often the right one.',
   effFn:()=>({bizqual:5, log:['biz','You ignored the copy and improved your own product. Most copycats cannot keep up.','good']})},
  {label:'Send a cease and desist.', hint:'₦400k in legal fees. Sometimes that is all it takes.',
   odds:()=>0.48,
   okEffFn:()=>({cash:-Math.round(400000*S.cumInfl), bizrep:4, log:['biz','A letter on a lawyer\'s letterhead ended it in three weeks.','good']}),
   okText:'Three weeks and they rebranded. Sometimes a letterhead is the entire product.',
   failEffFn:()=>({cash:-Math.round(900000*S.cumInfl), log:['biz','They had a lawyer too, and theirs was cheaper.','bad']}),
   failText:'They had a lawyer, and yours found a genuine trademark problem on your side. Drop it.'},
  {label:'Undercut them into the ground.', hint:'You have the volume. Use it.',
   odds:()=>0.5,
   okEffFn:()=>({bizcash:-Math.round(Math.max(800000,(S.biz.revenue||0)*0.15)), bizrep:6, log:['biz','You dropped your price below theirs for two quarters. They folded. So did your margin, briefly.','good']}),
   okText:'Two quarters of selling at a loss and they were gone. You bought the market back.',
   failEffFn:()=>({bizcash:-Math.round(Math.max(1500000,(S.biz.revenue||0)*0.25)), log:['biz','They had deeper pockets than you expected.','bad']}),
   failText:'They matched you and kept matching. You ran out of money first.'}]},

{id:'landlord', cat:'biz', w:0.9, cd:14, cond:s=>s.biz,
 title:'The landlord wants to sell',
 text:()=>'Your landlord has decided to sell the building. You have first refusal on your own premises for '+fmt(Math.round(Math.max(12000000,(S.biz.capex||0)*3)*S.cumInfl))+', or you can find somewhere else, or you can take your chances with whoever buys it.',
 opts:[
  {label:'Buy the premises.', hint:'Enormous. Removes rent from your cost base forever.',
   odds:()=>clamp(0.18+S.fin.credit/300+(S.biz.formal?0.12:0),0.08,0.7),
   okEffFn:()=>{ const p=Math.round(Math.max(12000000,(S.biz.capex||0)*3)*S.cumInfl);
     return {asset:{id:'comm', value:p}, debt:{name:'Mortgage on premises', bal:Math.round(p*0.65), rate:0.19, minPay:Math.round(p*0.03), kind:'bank'}, flag:{ownsPremises:true},
       log:['biz','You bought your premises. Rent is gone from the P&L and replaced by a mortgage, which is a better thing to have.','good']}; },
   okText:'It took four months and every document you own, but the premises are yours. Rent is now a mortgage.',
   failEffFn:()=>({log:['biz','No lender would finance a purchase this size on this business.','bad']}),
   failText:'No financing. You are renting from whoever buys it.'},
  {label:'Move. Take the disruption.', hint:'A quarter of lost trade and a fit-out bill.',
   effFn:()=>{ S.biz.cash -= Math.round(Math.max(2500000,(S.biz.revenue||0)*0.25)); S.biz.rep=clamp(S.biz.rep-5,0,100);
     S.biz.lease = {rent:Math.round((S.biz.lease.rent||0)*(1+S.mkt.infl*1.2)), end:S.turn+8, landlord:R.pick(LAST), goodwill:50, hikes:0};
     return {log:['biz','You moved. A quarter of confusion, some lost customers, and a new address nobody can find.','warn']}; }},
  {label:'Organise the other tenants and buy it together.', hint:'Slow, political, and sometimes the only way.',
   odds:()=>0.42,
   okEffFn:()=>({asset:{id:'comm', value:Math.round(Math.max(4000000,(S.biz.capex||0)*1.2)*S.cumInfl)}, skill:{network:6},
     log:['biz','You organised the other tenants and bought the building jointly. You now own a share of your own rent.','good']}),
   okText:'Four tenants, one lawyer, and a jointly owned building. You own a piece of the roof over your own business.',
   failEffFn:()=>({log:['biz','Two of the four tenants pulled out and the plan collapsed.','bad']}),
   failText:'The other tenants could not agree on anything, including which lawyer. The building sold to a stranger.'}]},

{id:'powerout', cat:'biz', w:1.0, cd:9, cond:s=>s.biz,
 title:'The grid has given up',
 text:'National power has been down for eleven days. Your generator is running nine hours a day, diesel has gone up 40%, and the generator itself has started making a noise that a mechanic has described, at length, as expensive.',
 opts:[
  {label:'Buy a bigger generator and fuel it properly.', hint:'Capital outlay. Solves it for a decade.',
   effFn:()=>{ const c=Math.round(Math.max(2500000,(S.biz.revenue||0)*0.2)*S.cumInfl); S.biz.cash-=c; S.biz.capex+=Math.round(c*0.8);
     return {log:['biz','You bought proper backup power for '+fmt(c)+'. Uninteresting infrastructure, permanently useful.','good']}; }},
  {label:'Cut hours to match the power.', hint:'Free. Revenue goes down too.',
   effFn:()=>({bizrep:-4, log:['biz','You cut trading hours to match what the generator can carry. Customers noticed.','warn']})},
  {label:'Go solar. Borrow to do it.', hint:'High upfront. Near-zero running cost. Fuel risk gone.',
   odds:()=>clamp(0.25+S.fin.credit/280,0.1,0.75),
   okEffFn:()=>{ const c=Math.round(Math.max(9000000,(S.biz.revenue||0)*0.8)*S.cumInfl);
     return {bizcap:Math.round(c*0.7), bizcash:Math.round(c*0.15), debt:{name:'Solar asset finance', bal:Math.round(c*0.8), rate:0.22, minPay:Math.round(c*0.06), kind:'bank'},
       log:['biz','You installed solar with asset finance. The diesel line in your accounts has simply stopped existing.','good'], flag:{solar:true}}; },
   okText:'The panels went up in six weeks. Your diesel bill is now a rounding error and the generator is for emergencies.',
   failEffFn:()=>({log:['biz','No asset financier would touch it without three years of accounts.','bad']}),
   failText:'Nobody would finance it without audited accounts. You will be buying diesel for a while yet.'}]},

{id:'japastaff', cat:'biz', w:0.9, cd:12, cond:s=>s.biz && s.biz.staff.length>0,
 title:'Half the team is thinking about leaving the country',
 text:'Two of your people have asked for references for visa applications. This is not about you. It is about the fact that everyone they know under thirty has a folder of documents and a plan.',
 opts:[
  {label:'Help them. Write glowing references.', hint:'Lose good people. Gain a diaspora network.',
   effFn:()=>{ const n=Math.min(2,S.biz.staff.length); for(let i=0;i<n;i++) S.biz.staff.pop();
     S.p.skills.network=clamp(S.p.skills.network+7,0,100); S.p.rep=clamp(S.p.rep+4,0,100);
     return {log:['biz','You wrote the references and helped them go. Two years later one of them sent you a client from abroad.','good']}; }},
  {label:'Counter-offer hard to keep them.', hint:'You can. For a while.',
   odds:()=>0.4,
   okEffFn:()=>({bizcash:-Math.round(Math.max(1200000,(S.biz.revenue||0)*0.12)), log:['biz','You raised pay substantially. They stayed. The plan is not cancelled, only postponed.','warn']}),
   okText:'They stayed for now. Everyone involved knows the folder is still in the drawer.',
   failEffFn:()=>{ const n=Math.min(2,S.biz.staff.length); for(let i=0;i<n;i++) S.biz.staff.pop();
     return {log:['biz','You raised pay. They left anyway, graciously, in a way that made it worse.','bad']}; },
   failText:'They thanked you, took the raise for four months, and left. It was never about the money.'},
  {label:'Plan for it. Hire two and cross-train.', hint:'Assume they go. Build for churn.',
   effFn:()=>({cash:-Math.round(600000*S.cumInfl), skill:{ops:5}, biztrust:10,
     log:['biz','You stopped trying to prevent it and started planning for it. Attrition is a condition here, not a crisis.','good']})}]},

{id:'sidehustle', cat:'biz', w:0.8, cd:14, cond:s=>s.biz && s.biz.staff.length>=2,
 title:'Your staff are running a business out of your business',
 text:'They are using your premises, your supplier account and, on two occasions you can prove, your stock. It is small. It is also systematic, and it has been going on for a while.',
 opts:[
  {label:'Dismiss everyone involved immediately.', hint:'Zero tolerance. Loses you people you needed.',
   effFn:()=>{ const n=Math.min(1,S.biz.staff.length); for(let i=0;i<n;i++) S.biz.staff.pop();
     S.biz.staff.forEach(x=>{x.morale=clamp(x.morale-8,3,100);}); S.biz.staffTrust=clamp((S.biz.staffTrust||55)+12,0,100);
     return {log:['biz','You dismissed the people involved. The message landed. So did the staff shortage.','warn']}; }},
  {label:'Offer them a commission structure and bring it inside.', hint:'Turn the leak into a channel.',
   odds:()=>0.6,
   okEffFn:()=>({bizrep:5, bizcash:Math.round(Math.max(300000,(S.biz.revenue||0)*0.08)), biztrust:14,
     log:['biz','You legalised it and paid commission on it. Same energy, now pointed at your revenue.','good']}),
   okText:'They were already selling. Now they sell your stock and you can see the numbers.',
   failEffFn:()=>({bizcash:-Math.round(Math.max(300000,(S.biz.revenue||0)*0.06)), log:['biz','The commission scheme was gamed within a month.','bad']}),
   failText:'They found the loopholes in the scheme faster than you wrote it.'},
  {label:'Say nothing. It is not worth the fight.', hint:'Cheapest. It will grow.',
   effFn:()=>({biztrust:-10, log:['biz','You decided not to see it. Everyone else saw it, including the people doing it.','warn']})}]},

{id:'badreview', cat:'biz', w:0.9, cd:12, cond:s=>s.biz && (s.biz.rep||0)>30,
 title:'A bad review is doing numbers',
 text:'One unhappy customer has written a long, specific, well-argued complaint and posted it where your customers will see it. Some of what they say is fair. Some of it is not. All of it is being shared.',
 opts:[
  {label:'Respond publicly, take the fair part, fix it.', hint:'The only response that reliably works.',
   odds:()=>0.72,
   okEffFn:()=>({bizrep:9, bizqual:4, log:['biz','You answered publicly, owned the part that was true, and fixed it. Several people shared the response instead.','good']}),
   okText:'You replied in public, conceded what was fair, and said what you were changing. The response got more shares than the complaint.',
   failEffFn:()=>({bizrep:-6, log:['biz','You responded carefully and it read as corporate. That made it worse.','bad']}),
   failText:'The reply sounded like it had been through a lawyer. The internet can smell that.'},
  {label:'Refund them fully and quietly, say nothing public.', hint:'Buys silence. Sometimes.',
   effFn:()=>({bizcash:-Math.round(Math.max(150000,(S.biz.revenue||0)*0.02)), log:['biz','You refunded in full and asked for nothing. Some customers would have removed the post. This one did not.','neutral']})},
  {label:'Ignore it. It will pass.', hint:'It may. It may not.',
   odds:()=>0.45,
   okEffFn:()=>({log:['biz','You said nothing. Two weeks later it was old news.','neutral']}),
   okText:'You said nothing and it burned out on its own. This time.',
   failEffFn:()=>({bizrep:-11, log:['biz','You said nothing. Other customers replied saying you always say nothing.','bad']}),
   failText:'The replies did the damage. Six customers confirmed the same complaint, and that pattern is what people believed.'}]},

{id:'certs', cat:'biz', w:0.8, cd:16, cond:s=>s.biz,
 title:'A new certification is now mandatory',
 text:()=>'A regulator has announced that from next quarter your category requires certification. The course and the inspection together cost about '+fmt(Math.round(900000*S.cumInfl))+'. Operating without it carries a fine of twice that, per quarter, once they start enforcing.',
 opts:[
  {label:'Get certified now.', hint:'Boring compliance. Removes a category of risk.',
   effFn:()=>{ S.biz.cash-=Math.round(900000*S.cumInfl); S.biz.compliance=clamp((S.biz.compliance||40)+18,0,100);
     return {log:['biz','You got certified. It cost money and a fortnight, and you can now be waved through.','good']}; }},
  {label:'Wait and see if they actually enforce it.', hint:'Frequently they do not. Occasionally they do.',
   odds:()=>0.45,
   okEffFn:()=>({log:['biz','You waited. Nothing happened. It was theatre, this time.','neutral']}),
   okText:'Nothing happened. Nobody came. You saved the money.',
   failEffFn:()=>({bizcash:-Math.round(Math.max(1200000,(S.biz.revenue||0)*0.15)), bizrep:-4,
     log:['biz','They enforced it, and they started with the businesses that were easiest to find.','bad']}),
   failText:'They enforced it, they started with you, and the fine was per quarter, not once.'},
  {label:'Join the trade association and fight it collectively.', hint:'Costs dues. Gives you a voice and advance warning.',
   effFn:()=>({bizcash:-Math.round(300000*S.cumInfl), skill:{network:5}, bizcomp:8, flag:{inAssociation:true},
     log:['biz','You joined the association. They get three months of warning before rules like this land.','good']})}]},

{id:'bulkbuy', cat:'biz', w:0.9, cd:12, cond:s=>s.biz && Math.max(0,s.biz.cash)>(s.biz.revenue||0)*0.3,
 title:'A bulk price, this week only',
 text:'Your supplier will sell you six months of input at 28% off if you pay today. That is a real discount and it is also all of your cash, in a warehouse, for two quarters.',
 opts:[
  {label:'Buy it.', hint:'28% of margin is a lot. Liquidity is also a lot.',
   odds:()=>0.62,
   okEffFn:()=>{ const amt=Math.round(Math.max(0,S.biz.cash)*0.55); S.biz.cash-=amt; S.biz.inventory=(S.biz.inventory||0)+Math.round(amt*1.38);
     return {log:['biz','You bought in bulk. Six months of input at a real discount, and the margin showed up in the P&L.','good'], skill:{finance:2}}; },
   okText:'It paid for itself. Cheaper inputs for two quarters and the margin is visibly better.',
   failEffFn:()=>{ const amt=Math.round(Math.max(0,S.biz.cash)*0.55); S.biz.cash-=amt; S.biz.inventory=(S.biz.inventory||0)+Math.round(amt*1.38);
     return {log:['biz','You bought six months of input, and then the price fell, and then you needed the cash.','bad'], stress:8}; },
   failText:'The input price fell four months later and you spent two quarters cash-poor with a full storeroom.'},
  {label:'Negotiate half the volume at half the discount.', hint:'The answer nobody offers but everyone accepts.',
   odds:()=>0.75,
   okEffFn:()=>{ const amt=Math.round(Math.max(0,S.biz.cash)*0.25); S.biz.cash-=amt; S.biz.inventory=(S.biz.inventory||0)+Math.round(amt*1.16);
     return {log:['biz','You took three months of input at 14% off. Worse than the offer, far better for the balance sheet.','good'], skill:{finance:4}}; },
   okText:'They agreed. Three months of cover at a smaller discount, and you kept enough cash to actually operate.',
   failEffFn:()=>({log:['biz','They wanted the full container or nothing.','neutral']}),
   failText:'All or nothing, apparently. You passed.'},
  {label:'Pass. Your cash is your survival.', hint:'The unfashionable answer.',
   effFn:()=>({skill:{finance:3}, log:['biz','You passed on the discount. Being able to pay wages is worth more than 28% of margin.','good']})}]},

{id:'familystaff', cat:'biz', w:1.0, cd:14, cond:s=>s.biz && (s.biz.revenue||0)>4000000,
 title:'A relative would like a job',
 text:'A cousin has finished their degree and needs somewhere to start. Your mother has mentioned it twice. There is a real vacancy, and there are also better candidates.',
 opts:[
  {label:'Hire them, at market rate, on the same terms as everyone.', hint:'Clean. Defensible. Boring.',
   effFn:()=>{ const c=genCandidate(0); c.name=R.pick(FIRST)+' '+R.pick(LAST); S.biz.staff.push(c);
     S.p.family=clamp(S.p.family+7,0,100);
     return {log:['biz','You hired family on exactly the terms you would hire a stranger. That is the only version of this that works.','good']}; }},
  {label:'Hire them and pay above market, because family.', hint:'Buys peace at home. Costs you internally.',
   effFn:()=>{ const c=genCandidate(0); c.salary=Math.round(c.salary*1.3); S.biz.staff.push(c);
     S.p.family=clamp(S.p.family+12,0,100); S.biz.staff.forEach(x=>x.morale=clamp(x.morale-7,3,100));
     return {log:['biz','You hired family above the market rate. Peace at home, a conversation at work.','warn']}; }},
  {label:'Give them money instead of a job.', hint:'Cheaper than the wrong employee.',
   effFn:()=>({cash:-Math.round(400000*S.cumInfl), family:4,
     log:['biz','You gave them money for a course instead of a job. Everyone understood the message and nobody had to say it.','good']})},
  {label:'Say no.', hint:'There will be a phone call.',
   effFn:()=>({family:-9, log:['biz','You said no. There was a phone call, and then a longer one.','bad']})}]},

{id:'posloan', cat:'biz', w:0.9, cd:10, cond:s=>s.biz,
 title:'Instant working capital',
 text:()=>'A lender is offering '+fmt(Math.round(Math.max(3000000,(S.biz.revenue||0)*0.5)))+' against your card receipts, approved in ten minutes, no paperwork. The rate is 7% a month. They are very clear about it and very cheerful.',
 opts:[
  {label:'Take it. You need the stock this week.', hint:'The most expensive money available, for a real reason.',
   effFn:()=>{ const amt=Math.round(Math.max(3000000,(S.biz.revenue||0)*0.5)); S.biz.cash+=amt;
     return {debt:{name:'Short-term merchant loan', bal:Math.round(amt*1.35), rate:0.84, minPay:Math.round(amt*0.45), kind:'bank'},
       log:['biz','You took merchant cash at 7% a month. It funded the stock. It will hurt for three quarters.','warn']}; }},
  {label:'Take a third of it.', hint:'Enough for the gap, not enough to build a habit.',
   effFn:()=>{ const amt=Math.round(Math.max(1000000,(S.biz.revenue||0)*0.17)); S.biz.cash+=amt;
     return {debt:{name:'Short-term merchant loan', bal:Math.round(amt*1.3), rate:0.84, minPay:Math.round(amt*0.5), kind:'bank'},
       log:['biz','You took a third of what they offered. Bounded exposure.','warn']}; }},
  {label:'Decline. Read the rate out loud to yourself first.', hint:'84% a year. Compounded monthly.',
   effFn:()=>({skill:{finance:4}, credit:2, log:['biz','You declined. 7% a month is 125% a year, and you did the arithmetic in the shop.','good']})}]},

{id:'assoclevy', cat:'biz', w:0.8, cd:16, cond:s=>s.biz,
 title:'The association wants a levy',
 text:()=>'The local traders\' association has levied every business on the street for "security and sanitation". '+fmt(Math.round(250000*S.cumInfl))+'. Nobody can tell you what it buys. Everybody is paying.',
 opts:[
  {label:'Pay it.', hint:'Being the one who did not pay is a position.',
   effFn:()=>({bizcash:-Math.round(250000*S.cumInfl), log:['biz','You paid the levy. Nothing visible changed, which is as good an outcome as this one offers.','neutral']})},
  {label:'Pay it and demand a seat on the committee.', hint:'Convert a cost into influence.',
   effFn:()=>({bizcash:-Math.round(250000*S.cumInfl), skill:{network:6}, rep:5, flag:{inAssociation:true},
     log:['biz','You paid and asked for the accounts. You are now on the committee, which is where the useful information is.','good']})},
  {label:'Refuse, in writing.', hint:'Correct. Lonely.',
   odds:()=>0.4,
   okEffFn:()=>({rep:7, skill:{finance:3}, log:['biz','You refused in writing and nothing happened. Three others quietly stopped paying too.','good']}),
   okText:'You refused in writing. Two weeks later three other traders did the same, and the levy was quietly dropped.',
   failEffFn:()=>({bizcash:-Math.round(700000*S.cumInfl), bizrep:-6,
     log:['biz','You refused. Your shop was then closed for three days for "sanitation".','bad']}),
   failText:'Your premises were sealed for three days for sanitation reasons, and reopened once you had paid, plus costs.'}]},

{id:'diaspora', cat:'biz', w:0.7, cd:20, cond:s=>s.biz && (s.biz.rep||0)>55 && (s.biz.revenue||0)>15000000,
 title:'Somebody abroad wants to franchise you',
 text:'A diaspora buyer has offered to open your brand in another country. They will pay a fee for the name and the system, and then operate it themselves. If it works, it is free money. If it fails, it is your name on a failing shop three thousand miles away.',
 opts:[
  {label:'License it, tightly, with quality controls.', hint:'Royalties. And a contract you will actually have to enforce.',
   odds:()=>0.58,
   okEffFn:()=>({bizcash:Math.round(Math.max(4000000,(S.biz.revenue||0)*0.35)), bizrep:6, bizbrand:Math.round(Math.max(2000000,(S.biz.revenue||0)*0.2)), flag:{franchised:true},
     log:['biz','You licensed the brand abroad with quality clauses. It is working and the cheques arrive in hard currency.','good']}),
   okText:'It opened, it is trading, and the royalty arrives quarterly in a currency that is not yours. This is the good version.',
   failEffFn:()=>({bizrep:-9, log:['biz','They cut every corner the contract allowed and several it did not. Your name is now on a bad shop.','bad']}),
   failText:'They ran it badly and blamed your system. Your reputation is now attached to a business you cannot walk into.'},
  {label:'Supply them instead. Keep the brand.', hint:'An export account wearing a different hat.',
   effFn:()=>({bizcash:Math.round(Math.max(2000000,(S.biz.revenue||0)*0.18)), flag:{exporter:true},
     log:['biz','You supplied them rather than licensing the brand. Lower upside, none of the reputational risk.','good']})},
  {label:'Decline. You cannot police it from here.', hint:'The honest reason most people should decline.',
   effFn:()=>({skill:{savvy:3}, log:['biz','You declined. Enforcing quality from another country is a full-time job you do not have.','good']})}]},

/* ---------------------------------------------------------------- LIFE --- */
{id:'bail', cat:'life', w:1.0, cd:10, cond:s=>s.p.family>25,
 title:'Somebody needs bail money',
 text:()=>'A relative has been arrested and the family has called you, because you are the one they call. It is '+fmt(Math.round(700000*S.cumInfl))+' and it is needed tonight.',
 opts:[
  {label:'Send it. No questions.', hint:'You know exactly how this ends.',
   effFn:()=>({cash:-Math.round(700000*S.cumInfl), family:11, log:['life','You sent the money. Nobody discussed it afterwards, which is how these things work.','good']})},
  {label:'Send half.', hint:'Something, not everything.',
   effFn:()=>({cash:-Math.round(350000*S.cumInfl), family:3, log:['life','You sent half. It was noted, in both directions.','neutral']})},
  {label:'Say no. You have your own obligations.', hint:'True. Costly.',
   effFn:()=>({family:-13, stress:6, log:['life','You said no. The call ended and the silence lasted months.','bad']})}]},

{id:'titletaker', cat:'life', w:0.8, cd:22, cond:s=>s.p.rep>45 && s.p.age>32,
 title:'They would like to give you a title',
 text:()=>'Your community has decided you should take a chieftaincy title. It is an honour, it comes with obligations, and the committee has been very direct about the expected contribution of '+fmt(Math.round(3500000*S.cumInfl))+'.',
 opts:[
  {label:'Accept, and pay properly.', hint:'Real standing in a place where standing is an asset.',
   effFn:()=>({cash:-Math.round(3500000*S.cumInfl), rep:14, happy:6, flag:{titled:true},
     log:['life','You took the title. It opens doors that money does not open by itself.','good']})},
  {label:'Accept, but negotiate the contribution down and be open about why.', hint:'Awkward. Often respected.',
   odds:()=>0.55,
   okEffFn:()=>({cash:-Math.round(1500000*S.cumInfl), rep:9, skill:{savvy:4}, flag:{titled:true},
     log:['life','You took the title and told them honestly what you could afford. It was accepted, and respected.','good']}),
   okText:'They accepted half and think better of you for having said so plainly.',
   failEffFn:()=>({rep:-6, log:['life','You tried to negotiate the contribution. The invitation was quietly withdrawn.','bad']}),
   failText:'The invitation was withdrawn. Some things are not negotiable.'},
  {label:'Decline, respectfully.', hint:'You can. There is a cost.',
   effFn:()=>({rep:-4, family:-3, log:['life','You declined. It was understood, and it was remembered.','neutral']})}]},

{id:'burial', cat:'life', w:0.9, cd:14, cond:s=>s.p.age>28,
 title:'There has been a death',
 text:()=>'Somebody you grew up with has died, suddenly, at forty-one. There is a burial committee, a levy of '+fmt(Math.round(180000*S.cumInfl))+', and a widow with two children and no income.',
 opts:[
  {label:'Pay the levy and give more privately.', hint:'₦700k total. This is what the money was for.',
   effFn:()=>({cash:-Math.round(700000*S.cumInfl), family:8, rep:6, happy:-3,
     log:['life','You paid the levy and then quietly gave more. You will do this again. Everyone does.','good']})},
  {label:'Pay the levy only.', hint:'The minimum that is not an insult.',
   effFn:()=>({cash:-Math.round(180000*S.cumInfl), log:['life','You paid the levy. It is what is asked.','neutral']})},
  {label:'Cannot manage it this quarter.', hint:'People will understand. Some will not.',
   effFn:()=>({rep:-5, family:-5, stress:5, log:['life','You could not manage it. Somebody else covered you, and remembered.','bad']})}]},

{id:'rentyear', cat:'life', w:1.0, cd:16, cond:s=>!s.assets.find(a=>a.id==='home'),
 title:'Two years of rent, in advance',
 text:()=>'Your landlord will not renew annually any more. Two years, paid up front: '+fmt(Math.round(S.fin.budget.housing*24))+'. This is now common and it is not negotiable, only payable or not.',
 opts:[
  {label:'Find it and pay.', hint:'Two years of housing security. A large hole in your cash.',
   effFn:()=>({cash:-Math.round(S.fin.budget.housing*24), stress:-8, happy:5,
     log:['life','You paid two years up front. Expensive and the relief is real.','good']})},
  {label:'Borrow it from your employer as an advance.', hint:'If you have a job. Three years of deductions.',
   odds:()=>S.p.job?0.7:0.05,
   okEffFn:()=>({debt:{name:'Salary advance (rent)', bal:Math.round(S.fin.budget.housing*20), rate:0, minPay:Math.round(S.fin.budget.housing*0.7), kind:'employer'},
     log:['life','Your employer advanced most of it against twelve months of salary. Owed, but housed.','warn']}),
   okText:'They advanced twenty months and will deduct it monthly for two years. You are housed and you are obliged.',
   failEffFn:()=>({log:['life','No advance available to you.','bad']}),
   failText:'Nobody is advancing you twenty months of salary.'},
  {label:'Move somewhere you can afford to pay for.', hint:'Smaller, further, cheaper.',
   effFn:()=>{ S.fin.budget.housing=Math.round(S.fin.budget.housing*0.66); S.p.happy=clamp(S.p.happy-6,0,100);
     return {log:['life','You moved. Further out, smaller, and yours for a year at a time.','warn'], stress:4}; }}]},

{id:'scare', cat:'health', w:0.9, cd:16, cond:s=>s.p.age>30,
 title:'Something showed up on a scan',
 text:'A routine check has found something that needs a better scan and a specialist. It is probably nothing. "Probably" is doing a lot of work in that sentence.',
 opts:[
  {label:'Do it properly, immediately, private.', hint:'₦850k. Or a month of waiting and worrying.',
   effFn:()=>({cash:-Math.round(850000*S.cumInfl), health:8, stress:-12,
     log:['life','You paid for the scan and the specialist the same week. It was nothing. You would pay ten times over for that sentence.','good']})},
  {label:'Go on the public waiting list.', hint:'Free. Four months.',
   odds:()=>0.5,
   okEffFn:()=>({stress:10, log:['life','Four months on the list, and then it was nothing. Four months of not knowing.','warn']}),
   okText:'Four months of waiting, and then the words "it is nothing". The waiting was the expensive part.',
   failEffFn:()=>({health:-14, stress:16, log:['life','It was not nothing. It had grown while you waited.','bad']}),
   failText:'It was not nothing, and four months mattered. This is the sentence nobody wants to hear.'},
  {label:'Ignore it. You feel fine.', hint:'People do this all the time.',
   odds:()=>0.55,
   okEffFn:()=>({log:['life','You ignored it. Years later it still has not amounted to anything.','neutral']}),
   okText:'You ignored it and nothing came of it. You were lucky, and it is worth being clear with yourself about that.',
   failEffFn:()=>({health:-20, log:['life','You ignored it. It was the thing you were afraid of, and it was found late.','bad']}),
   failText:'It was the thing you were afraid of, and by the time it was found the options were worse and more expensive.'}]},

{id:'oldfriend', cat:'career', w:0.9, cd:18, cond:s=>s.p.skills.network>40,
 title:'An old friend is now extremely successful',
 text:'Somebody you shared a room with in your twenties now runs something large. They have called, out of nowhere, to ask what you are doing with your life, and then to offer you a role that would pay roughly double.',
 opts:[
  {label:'Take the job.', hint:'Double the money. Someone else\'s vision.',
   effFn:()=>({job:{title:'Director', monthly:Math.round((S.p.job?S.p.job.monthly:400000)*2), industry:'Corporate'}, happy:4, stress:6, flag:{quitOwnBiz:!!S.biz},
     log:['career','You took the role. It pays properly and it is somebody else\'s company.','good']})},
  {label:'Decline. Ask for their business instead.', hint:'Referrals are worth more than a salary.',
   odds:()=>0.6,
   okEffFn:()=>({bizcash:S.biz?Math.round(Math.max(3000000,(S.biz.revenue||0)*0.4)):0, rep:8, skill:{network:8}, bizrep:S.biz?7:0,
     log:['career','You said no to the job and yes to their client list. That was the more valuable thing on offer.','good']}),
   okText:'They sent you three clients and made two introductions. You were right about which thing to ask for.',
   failEffFn:()=>({log:['career','They took the refusal well and did not call again.','neutral']}),
   failText:'They were hurt, or busy, or both. The call never came.'},
  {label:'Ask them to invest instead.', hint:'Money on your terms rather than theirs.',
   odds:()=>clamp(0.2+(S.biz?(S.biz.rep||0)/260:0.1),0.1,0.7),
   okEffFn:()=>({bizcash:Math.round(Math.max(5000000,(S.biz?(S.biz.revenue||0)*0.8:5000000))), flag:{angelBacked:true}, rep:4,
     log:['career','They put money into your business instead of hiring you. Some of the best capital comes from people who have watched you work.','good']}),
   okText:'They invested. Not charity — they have watched you operate for fifteen years, which is better diligence than any fund will do.',
   failEffFn:()=>({log:['career','They would not mix money and friendship. Sensible, and slightly disappointing.','neutral']}),
   failText:'They do not invest in friends, as a rule. You have just learned the rule.'}]},

{id:'runforoffice', cat:'life', w:0.6, cd:30, cond:s=>s.p.rep>55 && s.p.age>35,
 title:'They want you to stand',
 text:'Your community wants you to run for local office. It is unpaid, it will consume a year, and it is also the fastest way to become the person who is consulted about everything.',
 opts:[
  {label:'Stand. Fund it yourself.', hint:'₦6m and a year. Enormous network effects.',
   effFn:()=>({cash:-Math.round(6000000*S.cumInfl), rep:18, skill:{network:14}, stress:10, flag:{inPolitics:true},
     log:['life','You stood. You did not win the first time, and it did not matter — you met everyone.','warn']})},
  {label:'Decline to stand, but chair the committee instead.', hint:'Influence without the election.',
   effFn:()=>({rep:9, skill:{network:8}, log:['life','You took the committee instead of the ballot. Less glory, more actual effect.','good']})},
  {label:'Decline entirely.', hint:'A year of your life is not free.',
   effFn:()=>({log:['life','You declined. Somebody else stood, and is now consulted about everything.','neutral']})}]},

{id:'inheritance', cat:'money', w:0.7, cd:26, cond:s=>s.p.age>30,
 title:'Somebody left you something',
 text:()=>'A distant relative has died and left you '+fmt(Math.round(4500000*S.cumInfl))+'. Two other people are disputing the will, and one of them has already changed the locks on a house that is not theirs.',
 opts:[
  {label:'Contest it properly.', hint:'Legal fees. Principle. Maybe the money.',
   odds:()=>0.5,
   okEffFn:()=>({cash:Math.round(4500000*S.cumInfl), family:-4, skill:{finance:3},
     log:['money','You fought it and you got it. It took two years and a cousin stopped speaking to you.','good']}),
   okText:'Two years, and it came through. You have the money and one fewer cousin.',
   failEffFn:()=>({cash:-Math.round(1200000*S.cumInfl), family:-10, stress:12,
     log:['money','You contested it and lost, paying your own costs.','bad']}),
   failText:'You lost, and you paid your own legal costs, and a relative you used to like now does not speak to you.'},
  {label:'Take a third and let it go.', hint:'The money without the war.',
   effFn:()=>({cash:Math.round(1500000*S.cumInfl), family:4,
     log:['money','You took a third and let the rest go. Everyone was slightly unhappy, which is how you know it was fair.','good']})},
  {label:'Walk away from it entirely.', hint:'Sometimes the correct price.',
   effFn:()=>({family:8, rep:5, log:['money','You walked away. It cost '+fmt(Math.round(4500000*S.cumInfl))+' and bought you peace at every gathering for a decade.','good']})}]},

{id:'schoolfees', cat:'life', w:1.0, cd:12, cond:s=>S.p.kids>0,
 title:'Fees are due on Monday',
 text:()=>'The school has sent the invoice and a reminder, and a note that places are confirmed on payment. '+fmt(Math.round(Math.max(600000, 400000*S.p.kids)*S.cumInfl))+'.',
 opts:[
  {label:'Pay it. This is not the expense to economise on.', hint:'Education compounds like nothing else you will buy.',
   effFn:()=>({cash:-Math.round(Math.max(600000, 400000*S.p.kids)*S.cumInfl), family:7, happy:4,
     log:['life','You paid the fees. It is the single best return available to you and you know it.','good']})},
  {label:'Move them to a cheaper school.', hint:'Half the cost. A conversation with a nine-year-old.',
   effFn:()=>({cash:-Math.round(Math.max(300000, 200000*S.p.kids)*S.cumInfl), family:-5, happy:-4,
     log:['life','You moved them. The school is fine, and they did not take it well.','warn']})},
  {label:'Ask the school for terms.', hint:'Nobody advertises this. It usually exists.',
   odds:()=>0.6,
   okEffFn:()=>({cash:-Math.round(Math.max(300000, 200000*S.p.kids)*S.cumInfl), skill:{finance:2},
     log:['life','You asked for a payment plan and got one. Asking costs nothing and is available far more often than people assume.','good']}),
   okText:'Three instalments, no penalty. The option was always there; it just was not written down anywhere.',
   failEffFn:()=>({cash:-Math.round(Math.max(600000, 400000*S.p.kids)*S.cumInfl), rep:-2,
     log:['life','The school does not do terms. You paid in full.','bad']}),
   failText:'They do not do instalments. You found the money because there was no other option.'}]},

/* --------------------------------------------------------------- MONEY --- */
{id:'preapproved', cat:'money', w:1.0, cd:14, cond:s=>s.fin.credit>35,
 title:'You have been pre-approved',
 text:()=>'A bank has written to say you are pre-approved for '+fmt(Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)))+' at "just" 4.5% a month, with no collateral. The letter is friendly. The arithmetic is not.',
 opts:[
  {label:'Take it and put it into the business.', hint:'Leverage. The arithmetic has to beat 54% a year.',
   effFn:()=>{ const amt=Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)); S.fin.cash+=amt;
     return {debt:{name:'Unsecured personal loan', bal:Math.round(amt*1.18), rate:0.54, minPay:Math.round(amt*0.09), kind:'bank'},
       log:['money','You took unsecured money at 54% a year to fund the business. This works only if the return is much higher than that.','warn']}; }},
  {label:'Take it and buy a dollar asset.', hint:'If the currency is falling, the rate may not matter.',
   odds:()=>0.5,
   okEffFn:()=>({usd:Math.round(Math.max(3000, (salaryMonthly()+informalMonthly())*14/S.mkt.usd)), debt:{name:'Unsecured personal loan', bal:Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)*1.18), rate:0.54, minPay:Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)*0.09), kind:'bank'}, skill:{finance:3},
     log:['money','You borrowed in naira to hold dollars. It worked, and it was a bet, not a strategy.','good']}),
   okText:'The currency moved and the debt got cheaper in real terms. You were right, and you took real risk to be right.',
   failEffFn:()=>({debt:{name:'Unsecured personal loan', bal:Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)*1.18), rate:0.54, minPay:Math.round(Math.max(3000000, (salaryMonthly()+informalMonthly())*14)*0.09), kind:'bank'}, stress:10,
     log:['money','You borrowed to hold dollars and the currency held. You now have an expensive loan and no gain.','bad']}),
   failText:'The currency did not move. You have 54% money and nothing to show for it.'},
  {label:'Throw the letter away.', hint:'The best available answer, most of the time.',
   effFn:()=>({skill:{finance:4}, credit:2, log:['money','You threw it away. Unsecured lending at these rates is how people become poor slowly and then suddenly.','good']})}]},

{id:'fxwindow', cat:'money', w:0.8, cd:16, cond:s=>s.fin.cash>Math.round(2000000*S.cumInfl),
 title:'There is a gap in the rate',
 text:'The official rate and the street rate have separated by 22%. For about a week, somebody with cash and the right contacts can move money through the gap. Everybody you know is doing it.',
 opts:[
  {label:()=>'Do it. Move '+fmt(Math.round(3000000*S.cumInfl))+' through the window.', hint:'Very profitable. Also the reason people end up in a room with no windows.',
   odds:()=>0.68,
   okEffFn:()=>({cash:Math.round(3000000*S.cumInfl*0.22), skill:{finance:3},
     log:['money','You moved money through the gap and it worked. Nobody asks where the profit came from.','good']}),
   okText:'It cleared, you made 22%, and nobody asked any questions. It is easy to conclude from this that it is safe.',
   failEffFn:()=>({cash:-Math.round(3000000*S.cumInfl*0.35), credit:-8, stress:14,
     log:['money','The counterparty took the money. There is no contract and no police station that handles this.','bad']}),
   failText:'They took it, and there is no document, no contract and no authority you can report it to. That is the design.'},
  {label:'Take the boring version: buy dollars officially, hold.', hint:'Less profit. Sleep.',
   effFn:()=>({usd:Math.round(Math.max(0,S.fin.cash*0.35)/S.mkt.usd), cash:-Math.round(S.fin.cash*0.35), skill:{finance:2},
     log:['money','You bought dollars through the bank at the official rate. Less profit and no stories to worry about.','good']})},
  {label:'Sit it out.', hint:'Arbitrage that everyone can see is usually gone.',
   effFn:()=>({skill:{finance:2}, log:['money','You sat it out. When everybody knows about the gap, the gap is usually closing.','good']})}]},

{id:'lifecover', cat:'money', w:0.8, cd:20, cond:s=>S.p.kids>0 || s.p.married,
 title:'What happens to them',
 text:'An insurance agent has asked a question you have been avoiding: if you died this year, what would your family actually live on? The honest answer appears to be "the sale of things, slowly".',
 opts:[
  {label:'Take out proper term cover.', hint:'A small quarterly cost. Replaces your income if the worst happens.',
   effFn:()=>({cash:-Math.round(180000*S.cumInfl), flag:{lifeCover:true}, stress:-8, family:6,
     log:['life','You took out term cover. It is the least glamorous and most important financial product that exists.','good']})},
  {label:'Build the reserve yourself instead.', hint:'More expensive than premium. Keeps the money.',
   effFn:()=>({flag:{selfInsure:true}, skill:{finance:2}, log:['life','You decided to self-insure. It works if you live long enough to build the reserve.','warn']})},
  {label:'Nothing. You cannot afford to think about it.', hint:'Understood. Not solved.',
   effFn:()=>({stress:6, log:['life','You put it out of your mind. The question remains, waiting.','neutral']})}]},

{id:'pension', cat:'money', w:0.9, cd:24, cond:s=>s.p.age>28 && !!s.p.job,
 title:'A pension scheme you have never read',
 text:'Your employer runs a contributory pension. You have been in it for years without looking at it. The statement shows a number, and the number is smaller than you expected, and the fund is invested mostly in government bonds.',
 opts:[
  {label:'Contribute the maximum additional voluntary amount.', hint:'Tax-deferred and matched. The rare free lunch.',
   effFn:()=>({cash:-Math.round(250000*S.cumInfl), asset:{id:'pension', value:Math.round(500000*S.cumInfl)}, flag:{pensionMaxed:true}, skill:{finance:3},
     log:['money','You maximised the voluntary contribution, which your employer matches. Matched contributions are the only guaranteed return in finance.','good']})},
  {label:'Leave it. Contribute the minimum.', hint:'Money now instead of money at sixty-five.',
   effFn:()=>({log:['money','You left it at the minimum. Compound interest is a slow machine and you want the cash now.','neutral']})},
  {label:'Move the fund to equities while you are young.', hint:'Volatile. Historically the only thing that beats inflation.',
   odds:()=>0.62,
   okEffFn:()=>({asset:{id:'pension', value:Math.round(900000*S.cumInfl)}, skill:{finance:5}, flag:{pensionEquities:true},
     log:['money','You moved the pension into equities. Twenty years of volatility for a much larger number at the end.','good']}),
   okText:'It fell 30% in the first crash and you did not touch it. Twenty years later that decision is the largest single line in your net worth.',
   failEffFn:()=>({asset:{id:'pension', value:-Math.round(300000*S.cumInfl)}, stress:6,
     log:['money','You moved to equities and the market fell. You are down, on paper, and it is uncomfortable.','bad']}),
   failText:'It fell sharply and stayed down for three years. The paper loss is real; whether it was a mistake depends entirely on whether you sell.'}]},

{id:'bubble', cat:'money', w:0.8, cd:22, cond:s=>s.p.age>26,
 title:'Everyone you know is buying the same thing',
 text:'It might be land in a particular corridor, a crypto token, a friend\'s startup, or imported cars. Whatever it is, everyone is making money and the people making money are telling everyone else about it.',
 opts:[
  {label:'Buy in, but only what you can lose entirely.', hint:'Bounded participation in something you do not fully understand.',
   odds:()=>0.45,
   okEffFn:()=>({cash:Math.round(Math.max(2000000, (salaryMonthly()+informalMonthly())*8)*2.2), happy:8, skill:{finance:2},
     log:['money','You bought in small and it went up. You were right about the size and lucky about the direction.','good']}),
   okText:'It tripled. You were in for an amount that would not have changed your life if it had gone to zero, which is the only correct way to do this.',
   failEffFn:()=>({cash:-Math.round(Math.max(2000000, (salaryMonthly()+informalMonthly())*8)*0.85), stress:10,
     log:['money','It collapsed. You lost what you put in, which was at least an amount you had decided you could lose.','bad']}),
   failText:'It went to zero over about five weeks. You lost the amount you had decided you could lose, and that is exactly why you can still function.'},
  {label:'Buy in properly. Borrow to do it.', hint:'The decision people remember for the rest of their lives.',
   odds:()=>0.28,
   okEffFn:()=>({cash:Math.round(Math.max(10000000, (salaryMonthly()+informalMonthly())*40)*3), happy:14, flag:{rodeBubble:true},
     log:['money','You borrowed and bought heavily, and it went up for another year. You sold near the top.','good']}),
   okText:'It kept going for fourteen months and you sold near the top. You will tell this story for the rest of your life and it will sound like skill.',
   failEffFn:()=>({cash:-Math.round(Math.max(10000000, (salaryMonthly()+informalMonthly())*40)*0.7), stress:26, credit:-18, happy:-18, rep:-6,
     log:['money','It collapsed and you were leveraged. You lost most of it and owed the rest.','bad']}),
   failText:'It collapsed, you were leveraged, and you are now working to pay off an asset that no longer exists. You will remember this differently to the people who got out.'},
  {label:'Stay out and say so.', hint:'Unpopular at the time. Correct in the end.',
   effFn:()=>({skill:{savvy:5}, rep:3, log:['money','You stayed out. For a year you were the person who missed it. Then you were not.','good']})}]},

];
