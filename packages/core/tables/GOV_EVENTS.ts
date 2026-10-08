/*
  GOV_EVENTS — from 08-events-reactive-to-people.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface GOV_EVENTSShape {
  label: string;
  hint: string;
  effFn?: (() => any);
  odds?: (() => any);
  okEffFn?: (() => any);
  okText?: string;
  failEffFn?: (() => any);
  failText?: string;
}
interface GOV_EVENTSShape2 {
  label: string;
  hint: string;
  effFn: (() => any);
}
interface GOV_EVENTSShape3 {
  id: string;
  cat: string;
  w: number;
  cd: number;
  cond: ((a0: any) => any);
  title: (() => any) | string;
  text: (() => any);
  opts: GOV_EVENTSShape[] | GOV_EVENTSShape2[];
}

const GOV_EVENTS: GOV_EVENTSShape3[] = [

{id:'dir_resigns', cat:'biz', w:1.1, cd:16,
 cond:function(s){ const b=s.biz; if(!b) return false;
   return boardOf(b).some(function(d){ return !d.yours && (d.patience||50) < 18; }); },
 title:function(){ const d=angriestDirector(S.biz); return d ? (d.name+' wants to resign') : 'A director wants out'; },
 text:function(){
   const b=S.biz, d=angriestDirector(b); if(!d) return 'Somebody on your board has had enough.';
   const A=archOf(d.arc);
   return d.name+' has asked for a private word, which is how these things start. They have been on the board of '+b.name+
     ' for '+Math.max(1, S.turn-(d.since||S.turn))+' quarters, they have watched '+((b.profit||0)>=0?'a business that works':'a business that does not')+
     ', and they have come to the view that their name is attached to something they cannot influence. '+
     '"I would rather go now, cleanly," they say, "than be in the room when it goes wrong." '+
     'Patience '+Math.round(d.patience||50)+'/100. Loyalty '+Math.round(d.loyalty||50)+'/100. '+esc(A.blurb)+'.';
 },
 opts:[
  {label:'Let them go, with thanks and a dinner.', hint:'Cheap. Leaves an empty seat, and an empty seat is an invitation.',
   effFn:function(){ const b=S.biz, d=angriestDirector(b);
     if(d){ b.board=(b.board||[]).filter(function(x){ return x.id!==d.id; });
       const h=holderById(b,d.holderId||''); if(h) h.trust=clamp((h.trust||50)-10,0,100); }
     return {log:['biz',(d?d.name:'The director')+' left the board of '+b.name+' on good terms. Those are the ones who come back as a competitor\u2019s adviser.','warn'],
       skill:{network:1}}; }},
  {label:'Ask what it would take to keep them.', hint:'You will be asked for something specific, and then held to it.',
   odds:function(){ const d=angriestDirector(S.biz); return d? clamp(0.30 + (d.loyalty||50)/230, 0.1, 0.8) : 0.4; },
   okEffFn:function(){ const b=S.biz, d=angriestDirector(b);
     if(d){
       const pick=R.pick([{k:'reporting',text:'monthly management accounts within ten days of month end'},
                          {k:'seat',text:'a second seat for their side at the next AGM'},
                          {k:'cap',text:'a hard cap on your monthly drawings'}]);
       b.undertakings.push({id:'u'+(++S.seq), kind:pick.k, text:pick.text, dirId:d.id, dirName:d.name,
         holderId:d.holderId||null, due:S.turn+4, made:S.turn, done:false, broken:false});
       d.patience=clamp((d.patience||50)+40,0,100); d.loyalty=clamp((d.loyalty||50)+12,0,100);
     }
     return {log:['biz','You asked what it would take. They told you, and wrote it down.','good'], skill:{network:2}}; },
   okText:'They told you exactly what they wanted, which is the best possible answer. It is now minuted and you have four quarters.',
   failEffFn:function(){ const b=S.biz, d=angriestDirector(b);
     if(d){ b.board=(b.board||[]).filter(function(x){ return x.id!==d.id; });
       boardOf(b).forEach(function(x){ if(!x.yours) x.loyalty=clamp((x.loyalty||50)-5,0,100); }); }
     return {log:['biz','You asked. They resigned anyway, and now the rest of the board knows you were willing to beg.','bad'], stress:4}; },
   failText:'"It is not about the money," they said, and it was not. They left on Friday.'},
  {label:'Remind them what they signed up for.', hint:'High handed. Works on the weak,poisons the rest.',
   odds:function(){ const d=angriestDirector(S.biz); return d? clamp(0.22 + (100-(d.loyalty||50))/240, 0.05, 0.5) : 0.2; },
   okEffFn:function(){ const b=S.biz, d=angriestDirector(b);
     if(d){ d.patience=clamp((d.patience||50)+30,0,100); d.loyalty=clamp((d.loyalty||50)-16,0,100); d.grudges.push('you reminded them of their obligations'); }
     return {log:['biz','They stayed. They will do what they are told and nothing else, which is a different kind of problem.','warn']}; },
   okText:'They stayed, and they have stopped offering you anything you did not ask for.',
   failEffFn:function(){ const b=S.biz, d=angriestDirector(b);
     if(d){ b.board=(b.board||[]).filter(function(x){ return x.id!==d.id; });
       const h=holderById(b,d.holderId||''); if(h) h.trust=clamp((h.trust||50)-30,0,100);
       boardOf(b).forEach(function(x){ if(!x.yours){ x.loyalty=clamp((x.loyalty||50)-8,0,100); x.grudges.push('how you spoke to '+d.name); } }); }
     return {log:['biz','They resigned the same afternoon and told the others why.','bad'], rep:-4}; },
   failText:'They resigned the same afternoon. Everyone else heard about it before you got home.'}]},

{id:'holder_exit', cat:'biz', w:1.0, cd:18,
 cond:function(s){ const b=s.biz; return !!(b && extHolders(b).some(function(h){ return (h.pct||0) >= 8; })); },
 title:function(){ const h=biggestHolder(S.biz); return h ? (h.name+' is selling their stake') : 'A shareholder is selling'; },
 text:function(){
   const b=S.biz, h=biggestHolder(b); if(!h) return 'One of your shareholders is selling.';
   const price=Math.round(bizValue(b)*((h.pct||0)/100)*R.range(0.72,1.15));
   S._gevPrice=price; S._gevHolder=h.id;
   return h.name+' holds '+pct((h.pct||0)/100,1)+' of '+b.name+' and has found a buyer \u2014 '+
     R.pick(['a fund that specialises in distressed consumer businesses','a competitor you have lost tenders to',
             'an overseas group buying into the sector','a consortium with no operating experience and a lot of money'])+
     '. The price agreed is '+fmt(price)+'. Under the shareholders\u2019 agreement you '+
     (deedOf(b).preEmption ? 'have a right of first refusal: you can buy it at that price before it transfers.' 
                           : 'have no pre-emption right. It can transfer without your consent.')+
     (deedOf(b).tag ? ' You also have tag-along rights, which let you sell alongside on identical terms.' : '');
 },
 opts:[
  {label:'Exercise pre-emption and buy the stake yourself.', hint:'Costs cash you probably need elsewhere. Keeps the register as it is.',
   effFn:function(){
     const b=S.biz, h=holderById(b, S._gevHolder||''); const price=S._gevPrice||0;
     if(!h || S.fin.cash < price) return {log:['biz','You could not fund the pre-emption. The stake transferred anyway.','bad']};
     S.fin.cash -= price;
     const me=(b.shares||[]).find(function(x){ return x.you; });
     if(me){ me.shares += (h.shares||0); me.paid=(me.paid||0)+price; }
     b.shares=(b.shares||[]).filter(function(x){ return x.id!==h.id; });
     b.board=(b.board||[]).filter(function(d){ return d.holderId!==h.id; });
     syncCapTable(b);
     return {log:['biz','You bought '+h.name+' out at the pre-empted price of '+fmt(price)+'. You now hold '+pct(yourPct(b)/100,1)+' of '+b.name+'.','good'],
       skill:{finance:2}, stress:5}; }},
  {label:'Consent to the transfer.', hint:'A new name on the register. You do not get to choose it.',
   effFn:function(){
     const b=S.biz, h=holderById(b, S._gevHolder||'');
     if(!h) return {log:['biz','The transfer did not proceed.','neutral']};
     const arc=R.pick(['money','predator','professional','connector']);
     h.name=R.pick(FIRST)+' '+R.pick(LAST); h.kind='investor'; h.trust=clamp(R.int(28,72),0,100);
     h.arcKind=arc; h.board=true;
     const d=genDirector(arc,{holderId:h.id, holderName:h.name, fee:Math.round(200000*S.cumInfl)});
     b.board=(b.board||[]).filter(function(x){ return x.holderId!==h.id; });
     if(freeSeats(b)>0) b.board.push(d);
     syncCapTable(b);
     return {log:['biz','The stake transferred to '+h.name+', who has taken the seat that goes with it. '+esc(archOf(arc).blurb)+'.','warn'],
       skill:{network:1}}; }},
  {label:'Block it and cite the agreement.', hint:'Only works if you actually have the clause. Otherwise it is just noise.',
   odds:function(){ return deedOf(S.biz).preEmption ? 0.78 : 0.22; },
   okEffFn:function(){ const b=S.biz, h=holderById(b, S._gevHolder||'');
     if(h) h.trust=clamp((h.trust||50)-34,0,100);
     return {log:['biz','You blocked the transfer. The stake stays where it is and its owner is now your enemy.','warn']}; },
   okText:'The transfer did not complete. They were within their rights to try, and you were within yours to stop it. Neither of you enjoyed it.',
   failEffFn:function(){ const b=S.biz, h=holderById(b, S._gevHolder||'');
     if(h){ h.trust=clamp((h.trust||50)-22,0,100);
       h.name=R.pick(FIRST)+' '+R.pick(LAST); h.trust=clamp(R.int(24,60),0,100); h.board=true; }
     return {log:['biz','You had no ground to block it. The stake transferred and the new holder knows you tried.','bad']}; },
   failText:'Your lawyers read the agreement and told you what it says. It transferred anyway.'}]},

{id:'related_push', cat:'biz', w:0.9, cd:20,
 cond:function(s){ const b=s.biz; return !!(b && extHolders(b).length && (b.revenue||0) > 6000000); },
 title:function(){ const h=biggestHolder(S.biz); return h ? (h.name+' wants the company to buy from them') : 'A related-party proposal'; },
 text:function(){
   const b=S.biz, h=biggestHolder(b); if(!h) return 'A shareholder wants to sell to the company.';
   const amt=Math.round((b.revenue||0)*R.range(0.10,0.26));
   S._gevRel=amt; S._gevHolder=h.id;
   return h.name+' owns another company. It supplies '+R.pick(['packaging','logistics','raw input','IT services','cleaning and facilities'])+
     ', and it would like '+b.name+'\u2019s business: about '+fmt(amt)+' a year, on a three-year term. '+
     'Their price is roughly '+R.int(8,26)+'% above what you pay now, which they describe as "certainty of supply". '+
     'The board will have to approve it as a related-party transaction, and it will be minuted.';
 },
 opts:[
  {label:'Approve it. It is only money.', hint:'Buying from a shareholder at above market is the oldest way to move money out of a company.',
   effFn:function(){ const b=S.biz, amt=S._gevRel||0, h=holderById(b, S._gevHolder||'');
     b.relatedParty=(b.relatedParty||0)+1; b.compliance=clamp((b.compliance||40)-9,0,100);
     b.taxRisk=clamp((b.taxRisk||0)+10,0,100);
     if(h) h.trust=clamp((h.trust||50)+18,0,100);
     boardOf(b).forEach(function(d){ if(!d.yours && archOf(d.arc).id!=='family'){ d.loyalty=clamp((d.loyalty||50)-6,0,100); d.grudges.push('a related-party contract they disliked'); } });
     return {bizcash:-Math.round(amt*0.25), log:['biz','You approved the related-party contract. It is in the minutes, which is where these things end up when they go wrong.','warn']}; }},
  {label:'Refuse, and put it out to competitive tender.', hint:'The right answer, and it costs you the relationship.',
   effFn:function(){ const b=S.biz, h=holderById(b, S._gevHolder||'');
     if(h) h.trust=clamp((h.trust||50)-26,0,100);
     b.compliance=clamp((b.compliance||40)+6,0,100);
     boardOf(b).forEach(function(d){ if(!d.yours) d.loyalty=clamp((d.loyalty||50)+4,0,100); });
     return {log:['biz','You refused and went to tender. It came back '+R.int(9,24)+'% cheaper, which is the entire point.','good'],
       skill:{finance:1}, rep:2}; }},
  {label:'Approve it, but at market price and on a published tender.', hint:'The compromise. They may withdraw, insulted.',
   odds:function(){ return 0.55; },
   okEffFn:function(){ const b=S.biz, h=holderById(b, S._gevHolder||'');
     b.relatedParty=(b.relatedParty||0)+1; b.compliance=clamp((b.compliance||40)+2,0,100);
     if(h) h.trust=clamp((h.trust||50)+4,0,100);
     return {log:['biz','They won the tender at market price, on the record. Not what they wanted, and not nothing.','good'], skill:{finance:2}}; },
   okText:'They bid, they won, and the file shows a competitive process. That file is what you are actually paying for.',
   failEffFn:function(){ const b=S.biz, h=holderById(b, S._gevHolder||'');
     if(h) h.trust=clamp((h.trust||50)-14,0,100);
     return {log:['biz','They withdrew rather than bid competitively, which tells you what the margin was.','neutral']}; },
   failText:'"If you want to put my company out to tender, put it out to tender," they said, and withdrew.'}]},

{id:'nominee_fee', cat:'biz', w:0.7, cd:26,
 cond:function(s){ const b=s.biz; return !!(b && boardOf(b).some(function(d){ return d.arc==='nominee'; })); },
 title:'The nominee has a request',
 text:function(){
   const b=S.biz;
   const d=boardOf(b).find(function(x){ return x.arc==='nominee'; });
   S._gevDir=d?d.id:null;
   const amt=Math.round((b.revenue||0)*R.range(0.01,0.035)+400000*S.cumInfl);
   S._gevFee=amt;
   return (d?d.name:'Your government nominee')+' has mentioned, twice, that your '+R.pick(['operating licence','import permit','environmental clearance','sector registration'])+
     ' is due for renewal, and that renewal "can be assisted". The figure discussed is '+fmt(amt)+
     '. It would be invoiced as consultancy. Everyone in the room understands what it is, and nobody will write down that they said so.';
 },
 opts:[
  {label:'Pay it. The licence matters more.', hint:'Fast. It is also a criminal offence in most of the jurisdictions this game is set in.',
   effFn:function(){ const b=S.biz, amt=S._gevFee||0;
     b.cash-=amt; b.compliance=clamp((b.compliance||40)-14,0,100); b.taxRisk=clamp((b.taxRisk||0)+6,0,100);
     S.flags.paidFacilitation = true;
     return {log:['biz','You paid '+fmt(amt)+' as "consultancy". The licence renewed in nine days.','warn']}; }},
  {label:'Refuse, and let the renewal take as long as it takes.', hint:'Months of nothing happening is a cost too.',
   effFn:function(){ const b=S.biz;
     b.demandMultiplier=(b.demandMultiplier||1)*0.94;
     b.notes=(b.notes||[]).concat(['A licence renewal is being processed. It has been processing for some time.']);
     const d=directorById(b, S._gevDir||''); if(d){ d.loyalty=clamp((d.loyalty||50)-20,0,100); d.grudges.push('you declined to be helped'); }
     S.stand.state=clamp((S.stand.state||40)-6,0,100);
     return {bizrep:-3, log:['biz','You declined. The renewal has entered the phase where nothing happens and nobody is responsible.','warn'],
       rep:3, skill:{finance:1}}; }},
  {label:'Thank them, and minute it.', hint:'Turns it into evidence. They will resign; the record will survive them.',
   odds:function(){ return 0.44; },
   okEffFn:function(){ const b=S.biz, d=directorById(b, S._gevDir||'');
     b.compliance=clamp((b.compliance||40)+16,0,100);
     if(d){ b.board=(b.board||[]).filter(function(x){ return x.id!==d.id; }); }
     S.stand.state=clamp((S.stand.state||40)+10,0,100);
     return {log:['biz','You had it minuted. '+((d?d.name:'The nominee'))+' resigned rather than have it read back. The minute survives.','good'],
       rep:7, skill:{finance:2}}; },
   okText:'You asked for it to be minuted. They stood up, and the licence renewed six weeks later without assistance.',
   failEffFn:function(){ const b=S.biz;
     b.compliance=clamp((b.compliance||40)-4,0,100);
     S.stand.state=clamp((S.stand.state||40)-10,0,100);
     return {log:['biz','You minuted it. Nobody in the ministry cared, and now they know you keep notes.','bad'], rep:-3, stress:6}; },
   failText:'The minute was read back. Nobody in the ministry cared. The renewal is still pending.'}]},

{id:'derivative_suit', cat:'biz', w:0.8, cd:22,
 cond:function(s){ const b=s.biz; return !!(b && (b.relatedParty||0) > 0 && (b.externalPct||0) >= 15); },
 title:'A minority shareholder has sued',
 text:function(){
   const b=S.biz;
   return 'A holder of '+pct((b.externalPct||0)/100,0)+' of '+b.name+' has filed a derivative action. '+
     'The claim is that related-party contracts were approved without disclosure, that the company paid above market for them, '+
     'and that you, as the controlling shareholder, caused it. They want the contracts set aside, an account of profits, and your removal as a director. '+
     'They have counsel. Whether they win depends partly on the facts and partly on whether you wrote anything down.';
 },
 opts:[
  {label:'Settle quietly. Unwind the contracts and pay their costs.', hint:'Expensive, contained, and over.',
   effFn:function(){ const b=S.biz;
     const cost=Math.round(Math.max(3000000, (b.revenue||0)*0.06)*S.cumInfl);
     b.cash-=cost; b.relatedParty=0; b.compliance=clamp((b.compliance||40)+12,0,100);
     extHolders(b).forEach(function(h){ h.trust=clamp((h.trust||50)-6,0,100); });
     return {log:['biz','You unwound the contracts and paid '+fmt(cost)+' in costs. It is over, and it is on the record.','warn'],
       skill:{finance:1}, stress:5}; }},
  {label:'Fight it.', hint:'Two years of your life and a retainer. Possibly the right call.',
   odds:function(){ const b=S.biz; return clamp(0.30 + (b.compliance||40)/250 - (b.relatedParty||0)*0.06, 0.08, 0.72); },
   okEffFn:function(){ const b=S.biz;
     S.pending.push({turn:S.turn+1, title:'Judgment in the derivative action', kind:'good',
       text:'The court found the contracts were disclosed and approved. The claim was dismissed with costs. It took two years.'});
     b.compliance=clamp((b.compliance||40)+10,0,100);
     return {cash:-Math.round(2500000*S.cumInfl), log:['biz','You defended it. It was dismissed. Two years of your life and a retainer you will remember.','good'],
       rep:4, skill:{finance:2}, stress:10}; },
   okText:'Two years, a retainer, and judgment in your favour. The court noted the contracts had been minuted and properly approved.',
   failEffFn:function(){ const b=S.biz;
     const cost=Math.round(Math.max(6000000,(b.revenue||0)*0.14)*S.cumInfl);
     b.cash-=cost; b.relatedParty=0;
     S.flags.lostDerivative=true;
     return {log:['biz','You lost. The contracts were set aside, the company paid '+fmt(cost)+', and the judgment says what it says about you.','bad'],
       rep:-11, stress:16}; },
   failText:'The court set the contracts aside and made findings about disclosure. The judgment is public and it has your name in it.'},
  {label:'Offer to buy them out at a premium to end it.', hint:'Costs the most per share and buys the most peace.',
   effFn:function(){ const b=S.biz;
     const v=Math.max(1000000,bizValue(b));
     const cost=Math.round(v*((b.externalPct||0)/100)*1.45);
     if(S.fin.cash<cost) return {log:['biz','You could not fund the settlement. The action continues.','bad'], stress:8};
     S.fin.cash-=cost; wipeExternal(b);
     return {log:['biz','You bought the claim and the claimant for '+fmt(cost)+'. The register has one name on it again.','neutral'],
       skill:{finance:1}, stress:-3}; }}] },

{id:'secondary_grab', cat:'biz', w:0.7, cd:24,
 cond:function(s){ const b=s.biz; return !!(b && extHolders(b).length >= 1 && (b.externalPct||0) >= 10 && (b.revenue||0) > 5000000); },
 title:'Somebody has been buying in the secondary market',
 text:function(){
   const b=S.biz, h=biggestHolder(b); if(!h) return 'A stake in your company has changed hands.';
   const seller=h;
   const buyerName=R.pick(FIRST)+' '+R.pick(LAST);
   return 'You were not consulted, because you did not have to be. '+seller.name+' has sold their '+pct((seller.pct||0)/100,1)+
     ' of '+b.name+' to '+buyerName+', who '+(R.chance(0.5)
       ? 'already owns two companies in adjacent sectors and has been asking about you for a year.'
       : 'has made a career of buying minority stakes in founder-led businesses and waiting.')+
     ' The new holder has the same shares, the same seat, and a completely different plan. '+
     (deedOf(b).tag ? 'You had tag-along rights on a sale like this and did not use them.' : 'There is no tag-along clause, which is why you are reading about it now.');
 },
 opts:[
  {label:'Introduce yourself properly and find out what they want.', hint:'Information is the only free asset here.',
   effFn:function(){ const b=S.biz;
     const h=biggestHolder(b);
     if(h){ h.name=h.name; h.kind='strategic'; h.arcKind='predator'; h.trust=clamp((h.trust||50)+8,0,100); h.board=true;
       b.board=(b.board||[]).filter(function(x){ return x.holderId!==h.id; });
       if(freeSeats(b)>0){ const d=genDirector(R.chance(0.55)?'predator':'money',{holderId:h.id, holderName:h.name, fee:Math.round(220000*S.cumInfl)}); b.board.push(d); } }
     return {log:['biz','You met the new holder. They were charming, specific about the sector, and entirely unhurried.','neutral'],
       skill:{network:2}}; }},
  {label:'Offer to buy the stake back at a premium.', hint:'Expensive. Removes the problem rather than managing it.',
   effFn:function(){ const b=S.biz;
     const v=Math.max(1000000,bizValue(b));
     const cost=Math.round(v*((b.externalPct||0)/100)*R.range(1.3,1.7));
     if(S.fin.cash<cost) return {log:['biz','You could not raise '+fmt(cost)+'. The stake stays where it is.','bad'], stress:6};
     S.fin.cash-=cost; wipeExternal(b);
     return {log:['biz','You bought the stake back at '+fmt(cost)+' \u2014 well over the odds, and worth every naira of it.','good'], stress:-4}; }},
  {label:'Do nothing. Watch what they do next.', hint:'Sometimes correct. Never free.',
   effFn:function(){ const b=S.biz;
     const h=biggestHolder(b);
     if(h){ h.trust=clamp((h.trust||50)-10,0,100); h.kind='strategic'; h.arcKind='predator'; h.board=true;
       b.board=(b.board||[]).filter(function(x){ return x.holderId!==h.id; });
       if(freeSeats(b)>0){ const d=genDirector('predator',{holderId:h.id, holderName:h.name, fee:Math.round(220000*S.cumInfl)});
         d.plan={kind:'consolidate', at:S.turn+R.int(6,14)}; b.board.push(d); } }
     return {log:['biz','You said nothing. Six weeks later a resolution to bring the company to market landed on the table.','bad']}; }}] },

{id:'md_poached', cat:'biz', w:0.7, cd:24,
 cond:function(s){ const b=s.biz; return !!(b && b.md && !b.founderOusted); },
 title:function(){ return ((S.biz&&S.biz.md&&S.biz.md.name)||'Your managing director')+' has been approached'; },
 text:function(){
   const b=S.biz, m=b.md; if(!m) return 'Your managing director has been approached.';
   const offer=Math.round(m.salary*R.range(1.7,2.6));
   S._gevOffer=offer;
   return m.name+' has been running '+b.name+' for '+Math.max(1,S.turn-(m.since||S.turn))+' quarters. '+
     'Somebody has offered them '+fmt(offer)+' a quarter \u2014 roughly '+Math.round(offer/Math.max(1,m.salary)*10)/10+
     ' times what you pay \u2014 to run a larger operation. They have told you before accepting, which is either loyalty or leverage, '+
     'and you have about a week to decide which it is.';
 },
 opts:[
  {label:'Match it.', hint:'Resets your cost base permanently and everyone else will eventually find out.',
   effFn:function(){ const b=S.biz, offer=S._gevOffer||0;
     b.md.salary=Math.round(offer); b.md.since=S.turn;
     return {bizcash:-Math.round(offer*0.6), log:['biz','You matched it. '+b.md.name+' stayed, and your wage bill is now built around one person.','warn']}; }},
  {label:'Let them go.', hint:'You get the time back by losing the person who was saving it.',
   effFn:function(){ const b=S.biz;
     const name=b.md.name; b.md=null; b.founderOusted=false;
     return {log:['biz',name+' left for '+fmt(S._gevOffer||0)+' a quarter. You are the managing director again, which is exactly the job you hired them to do.','bad'],
       bizmorale:-5, stress:8}; }},
  {label:'Offer equity instead of salary.', hint:'Cheaper in cash, permanent in every other way.',
   odds:function(){ const b=S.biz; return clamp(0.34 + yourPct(b)/220, 0.1, 0.7); },
   okEffFn:function(){ const b=S.biz;
     widenHolder(b, null, R.int(4,9));
     b.md.equity=true; b.md.salary=Math.round((b.md.salary||0)*1.15);
     return {log:['biz','You gave '+b.md.name+' equity. They turned the other offer down and started behaving like an owner, because they are one.','good'],
       skill:{network:1}}; },
   okText:'They took shares instead of salary. You kept the cash and gave away a piece of the thing, which is the trade you will be making for the rest of your working life.',
   failEffFn:function(){ const b=S.biz; const name=b.md.name; b.md=null;
     return {log:['biz',name+' did not want shares in a company they can see the ceiling of.','bad'], stress:6}; },
   failText:'"I have seen how these end," they said. "I would like to be paid in money."'}]},

{id:'investor_ceo', cat:'biz', w:0.7, cd:26,
 cond:function(s){ const b=s.biz; return !!(b && !b.md && (b.externalPct||0) >= 18 && (b.revenue||0) > 9000000); },
 title:'The investors want their own managing director',
 text:function(){
   const b=S.biz;
   return 'The holders of '+pct((b.externalPct||0)/100,0)+' of '+b.name+' have written to you. They are, they say, delighted with progress. '+
     'They also think the company has reached the size where it needs "professional management", which is the phrase used '+
     'immediately before a founder is asked to become chairman. They have a candidate: '+
     R.pick(['a former group MD of a listed company','an operator from a business three times this size','somebody who has done two turnarounds and one collapse'])+
     ', at about '+fmt(Math.round(1100000*S.cumInfl))+' a quarter. They would like your view, by which they mean your agreement.';
 },
 opts:[
  {label:'Agree. Take the chair and let them run it.', hint:'You keep the shares and give up the last word on how they are used.',
   effFn:function(){ const b=S.biz;
     const m=genMD(3); b.md=m; b.founderOusted=false; b.chairOnly=true;
     return {log:['biz','You became chairman and '+m.name+' became managing director of '+b.name+'. You still own '+pct(yourPct(b)/100,1)+' of it.','warn'],
       skill:{network:1}, stress:-4}; }},
  {label:'Refuse. You built it and you will run it.', hint:'They will not drop it. They will wait for a worse quarter.',
   effFn:function(){ const b=S.biz;
     extHolders(b).forEach(function(h){ h.trust=clamp((h.trust||50)-16,0,100); });
     boardOf(b).forEach(function(d){ if(!d.yours){ d.patience=clamp((d.patience||50)-18,0,100); d.grudges.push('you refused professional management'); } });
     return {log:['biz','You refused. They did not argue. They noted it, which is worse.','warn'], stress:6}; }},
  {label:'Pre-empt them: hire your own MD before they hire theirs.', hint:'Costs real money. It is your candidate.',
   effFn:function(){ const b=S.biz;
     const m=genMD(2);
     if((b.cash||0) < m.salary*4) return {log:['biz','You cannot fund a managing director on this balance sheet. The investors will notice.','bad'], stress:5};
     b.md=m;
     extHolders(b).forEach(function(h){ h.trust=clamp((h.trust||50)+10,0,100); });
     return {bizcash:-Math.round(m.salary*2), log:['biz','You hired '+m.name+' yourself, before they could hire somebody else. Same outcome, your choice of person.','good'],
       skill:{ops:2}}; }}] },

{id:'deadlock_now', cat:'biz', w:0.6, cd:28,
 cond:function(s){ const b=s.biz; return !!(b && (b.externalPct||0) >= 26 && (b.board||[]).filter(function(d){ return !d.yours; }).length >= 2); },
 title:'The board is deadlocked',
 text:function(){
   const b=S.biz;
   return 'It has happened three times now: a resolution split exactly down the middle, with the chair '+
     (chairIsYours(b)?'using a casting vote to break it':'unable to break it, because the chair is not yours')+
     '. The company is not being mismanaged so much as not being managed. Under the shareholders\u2019 agreement, deadlock is '+
     (({mediation:'resolved by mediation', shotgun:'resolved by a shotgun clause', expert:'referred to an independent expert'})[deedOf(b).deadlock]||'unresolved')+
     ', and somebody on the other side has started quoting that clause at you.';
 },
 opts:[
  {label:'Agree to mediation.', hint:'Six weeks, a fee, and a document neither side is bound by.',
   effFn:function(){ const b=S.biz;
     const cost=Math.round(1800000*S.cumInfl); b.cash-=cost;
     boardOf(b).forEach(function(d){ if(!d.yours){ d.patience=clamp((d.patience||50)+16,0,100); d.loyalty=clamp((d.loyalty||50)+3,0,100); } });
     return {log:['biz','You mediated. It produced a document, a '+fmt(cost)+' bill, and about two quarters of peace.','neutral'], skill:{finance:1}}; }},
  {label:'Propose a shotgun clause.', hint:'It resolves deadlock permanently, by forcing somebody to name a price and live with it.',
   effFn:function(){ const b=S.biz;
     openResolution(b,'deed',{key:'deadlock', value:'shotgun', label:'Deadlock is now resolved by a shotgun clause.'},'you');
     return {log:['biz','You tabled a shotgun clause. If it carries, the next deadlock ends with somebody buying and somebody leaving.','warn']}; }},
  {label:'Buy a share from a friendly holder and break the deadlock that way.', hint:'The most expensive option and the only certain one.',
   effFn:function(){ const b=S.biz;
     const exts=extHolders(b).slice().sort(function(a,c){ return (c.trust||50)-(a.trust||50); });
     const h=exts[0];
     if(!h) return {log:['biz','There is nobody on the register prepared to sell to you.','neutral']};
     const cost=Math.round(bizValue(b)*((h.pct||0)/100)*1.35);
     if(S.fin.cash<cost) return {log:['biz','You cannot fund '+fmt(cost)+'.','bad'], stress:5};
     S.fin.cash-=cost;
     const me=(b.shares||[]).find(function(x){ return x.you; });
     if(me) me.shares+=(h.shares||0);
     b.shares=(b.shares||[]).filter(function(x){ return x.id!==h.id; });
     b.board=(b.board||[]).filter(function(d){ return d.holderId!==h.id; });
     syncCapTable(b);
     return {log:['biz','You bought '+h.name+' out for '+fmt(cost)+'. You hold '+pct(yourPct(b)/100,1)+' and the deadlock is arithmetically over.','good'],
       skill:{finance:2}}; }}] },

{id:'holder_distress', cat:'biz', w:0.6, cd:26,
 cond:function(s){ const b=s.biz; return !!(b && extHolders(b).some(function(h){ return (h.pct||0) >= 12; })); },
 title:function(){ const h=biggestHolder(S.biz); return h ? (h.name+' needs their money back') : 'A shareholder needs liquidity'; },
 text:function(){
   const b=S.biz, h=biggestHolder(b); if(!h) return 'A shareholder needs their money back.';
   const v=Math.max(1000000,bizValue(b));
   const ask=Math.round(v*((h.pct||0)/100)*R.range(0.55,0.85));
   S._gevAsk=ask; S._gevHolder=h.id;
   return h.name+' has called about something else entirely and got round to it in the last minute. '+
     'They need liquidity \u2014 '+R.pick(['a property completion','a margin call','a divorce','a business of their own that is short'])+
     ' \u2014 and they would rather sell to you than to a stranger. They are asking '+fmt(ask)+' for their '+
     pct((h.pct||0)/100,1)+', which is '+Math.round(ask/Math.max(1, v*((h.pct||0)/100))*100)+'% of what the stake is worth on paper. '+
     'You have '+fmt(S.fin.cash)+'.';
 },
 opts:[
  {label:'Buy it. That price will not come round again.', hint:'Cheap equity needs cash you may not have.',
   effFn:function(){ const b=S.biz, ask=S._gevAsk||0, h=holderById(b,S._gevHolder||'');
     if(S.fin.cash<ask) return {log:['biz','You did not have '+fmt(ask)+'. They sold to somebody else, or they are still looking.','bad'], stress:5};
     S.fin.cash-=ask;
     const me=(b.shares||[]).find(function(x){ return x.you; });
     if(me && h){ me.shares+=(h.shares||0); }
     b.shares=(b.shares||[]).filter(function(x){ return x.id!==(h?h.id:''); });
     b.board=(b.board||[]).filter(function(d){ return d.holderId!==(h?h.id:''); });
     syncCapTable(b);
     return {log:['biz','You bought '+pct((100-yourPct(b))/100,0)+' back for '+fmt(ask)+'. You hold '+pct(yourPct(b)/100,1)+'.','good'],
       skill:{finance:2}, stress:-3}; }},
  {label:'Decline. You have plans for that cash.', hint:'Reasonable. They will sell to somebody you did not vet.',
   effFn:function(){ const b=S.biz, h=holderById(b,S._gevHolder||'');
     if(h){ h.trust=clamp((h.trust||50)-12,0,100); h.name=R.pick(FIRST)+' '+R.pick(LAST); h.trust=clamp(R.int(30,66),0,100);
       h.kind='investor'; h.arcKind=R.pick(['money','professional','predator']); }
     return {log:['biz','You passed. They found another buyer, whose name you now have to live with.','warn']}; }},
  {label:'Offer to buy half of it at their price.', hint:'The compromise that leaves everybody slightly annoyed.',
   odds:function(){ return 0.6; },
   okEffFn:function(){ const b=S.biz, ask=(S._gevAsk||0), h=holderById(b,S._gevHolder||'');
     const half=Math.round(ask/2);
     if(S.fin.cash<half) return {log:['biz','You could not fund even half of it.','bad']};
     S.fin.cash-=half;
     if(h){ const move=Math.round((h.shares||0)/2);
       const me=(b.shares||[]).find(function(x){ return x.you; });
       if(me) me.shares+=move; h.shares=(h.shares||0)-move; }
     syncCapTable(b);
     return {log:['biz','You took half their stake at their price. Nobody got everything they wanted, which is how these usually end.','good'],
       skill:{finance:1}}; },
   okText:'They took it. Half a loaf, and the register has shifted slightly in your favour.',
   failEffFn:function(){ const b=S.biz, h=holderById(b,S._gevHolder||'');
     if(h){ h.trust=clamp((h.trust||50)-8,0,100); h.name=R.pick(FIRST)+' '+R.pick(LAST); h.trust=clamp(R.int(30,66),0,100); }
     return {log:['biz','They wanted all of it or none. They sold the whole thing elsewhere.','warn']}; },
   failText:'"Half does not help me," they said, and they were right.'}]},

{id:'covenant_breach', cat:'biz', w:1.4, cd:10,
 cond:function(s){ const b=s.biz; return !!(b && covenantBreaches(b).length); },
 title:function(){ const b=S.biz; const x=covenantBreaches(b)[0];
   return x ? ('Covenant breach: '+(COVENANT_KINDS[x.c.kind]||{label:x.c.kind}).label) : 'Covenant breach'; },
 text:function(){
   const b=S.biz; const x=covenantBreaches(b)[0]; if(!x) return 'A covenant has been breached.';
   const K=COVENANT_KINDS[x.c.kind]||{label:x.c.kind,desc:''};
   const a=bizAccounts(b);
   S._gevCov=x.c.id;
   const fmtv=function(v){ return (x.c.kind==='mincash'||x.c.kind==='capex')? fmt(Math.round(v)) : (x.c.kind==='conc'? Math.round(v)+'%' : v.toFixed(2)+'x'); };
   return 'The certificate is due under the facility from '+x.c.from+'. '+esc(K.desc)+' '+
     'The limit is '+fmtv(x.c.limit)+'. You are at '+fmtv(x.actual)+'. '+
     (x.c.kind==='leverage' ? 'Trailing EBITDA is '+fmt(a.ebitda)+' against borrowings of '+fmt(a.debt)+'.'
      : x.c.kind==='cover' ? 'Trailing EBITDA is '+fmt(a.ebitda)+' and the annual interest bill is '+fmt(a.interest*4)+'.'
      : x.c.kind==='mincash' ? 'The company closed the quarter with '+fmt(a.closeCash)+'.'
      : x.c.kind==='capex' ? 'Trailing capital spend is '+fmt(b.capex12||0)+'.'
      : x.c.kind==='conc' ? 'One customer is '+Math.round(x.actual)+'% of revenue.'
      : 'You are no longer the managing director, which is an event of default under the facility.')+
     ' This is not the end of the company. It is the beginning of a conversation in which you have no leverage at all.';
 },
 opts:[
  {label:'Ask for a waiver.', hint:'A fee, tighter terms, and sometimes a slice of the company.',
   odds:function(){ const b=S.biz; return clamp(0.34 + (b.compliance||40)/300 + (b.rep||40)/300 - covenantBreaches(b).length*0.08, 0.08, 0.82); },
   okEffFn:function(){
     const b=S.biz; const c=(b.covenants||[]).find(function(x){ return x.id===S._gevCov; });
     const fee=Math.round(Math.max(1500000,(b.debt||0)*0.02));
     b.cash-=fee; if(c){ c.limit = c.limit*0.85; c.waived=(c.waived||0)+1; }
     return {log:['biz','Waiver granted. '+fmt(fee)+' in fees, and the covenant is now tighter than it was.','warn'],
       skill:{finance:2}, stress:6}; },
   okText:'They waived it. The fee is on the statement and the covenant has been reset tighter \u2014 you will be back here if the numbers do not turn.',
   failEffFn:function(){
     const b=S.biz;
     const due=Math.round((b.debt||0)*R.range(0.6,1.0));
     return {log:['biz','They would not waive it. The facility has been accelerated: '+fmt(due)+' is now payable.','bad'],
       debt:{name:'Accelerated facility', bal:due, rate:0.09, minPay:Math.round(due*0.2), kind:'bank'},
       stress:18, rep:-6}; },
   failText:'They did not waive it. They accelerated. The whole facility is due, and it is due now.'},
  {label:'Cure it: inject your own money to get back inside the limit.', hint:'The fastest fix, and it is your money, not the company\u2019s.',
   effFn:function(){
     const b=S.biz; const x=covenantBreaches(b)[0]; if(!x) return {log:['biz','Nothing to cure.','neutral']};
     let need=0;
     if(x.c.kind==='mincash') need=Math.round(x.c.limit-(b.cash||0));
     else if(x.c.kind==='leverage') need=Math.round(Math.max(0,(b.debt||0)-x.c.limit*Math.max(0,bizAccounts(b).ebitda)));
     else if(x.c.kind==='cover') need=Math.round((b.debt||0)*0.35);
     else if(x.c.kind==='capex') need=Math.round((b.capex12||0)-x.c.limit);
     else need=Math.round(Math.max(2000000,(b.revenue||0)*0.08));
     need=Math.max(1000000, need);
     if(S.fin.cash<need) return {log:['biz','You did not have '+fmt(need)+' in personal cash. The breach stands.','bad'], stress:10};
     S.fin.cash-=need; b.cash+=need;
     if(x.c.kind==='leverage'||x.c.kind==='cover'){ const pay=Math.min(need, b.debt||0); b.cash-=pay; b.debt=(b.debt||0)-pay; }
     return {log:['biz','You put '+fmt(need)+' of your own money into '+b.name+' to cure the breach. The bank calls that a cure. You may call it something else.','warn'],
       skill:{finance:1}, stress:4}; }},
  {label:'Sell something to get inside the limit.', hint:'An outlet, a contract, a machine. Prices are worse when you need to sell.',
   odds:function(){ return (S.biz.outlets||[]).length>1 ? 0.7 : 0.35; },
   okEffFn:function(){
     const b=S.biz; const x=covenantBreaches(b)[0];
     let raise=0;
     if((b.outlets||[]).length>1){
       const o=b.outlets[b.outlets.length-1];
       raise=Math.round(Math.max(1500000,(b.revenue||0)*0.14));
       closeOutlet(b,o.id); b.cash+=raise;
     } else { raise=Math.round(Math.max(1000000,(b.capex||0)*0.18)); b.capex=Math.max(0,(b.capex||0)-raise); b.cash+=raise; }
     if(x && (x.c.kind==='leverage'||x.c.kind==='cover')){ const pay=Math.min(raise,b.debt||0); b.cash-=pay; b.debt=(b.debt||0)-pay; }
     return {log:['biz','You sold assets to get back inside the covenant, realising '+fmt(raise)+'. Assets sold under pressure sell at a discount to everything.','warn'],
       skill:{ops:1}, stress:8}; },
   okText:'It was done in three weeks, which is why the price was what it was. The covenant is cured.',
   failEffFn:function(){ return {log:['biz','Nothing could be sold quickly enough. The breach stands.','bad'], stress:12}; },
   failText:'Three weeks of phone calls and one buyer who smelled it. Nothing completed in time.'},
  {label:'Do nothing and see if they notice.', hint:'They will notice. The certificate is a legal document.',
   effFn:function(){
     const b=S.biz; const x=covenantBreaches(b)[0];
     const due=Math.round((b.debt||0)*R.range(0.5,1.0));
     if(due>0) S.fin.debt.push({id:'d'+(++S.seq), name:'Accelerated facility', bal:due, rate:0.10, minPay:Math.round(due*0.22), kind:'bank'});
     S.fin.credit=clamp((S.fin.credit||60)-16,0,100);
     if(x) x.waived=(x.waived||0)+1;
     return {log:['biz','You said nothing. They noticed, as they are paid to. The facility was accelerated and your name is now on a list.','bad'],
       rep:-9, stress:20}; }}]
}

];
