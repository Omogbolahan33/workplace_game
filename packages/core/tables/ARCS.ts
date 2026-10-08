/*
  ARCS — from 30-eras-you-live-through.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ARCSShape {
  title: string;
  cast: string;
  w: number;
  minTurn: number;
  cond: ((a0: any) => any);
  stages: (((a0: any) => any)[]);
}
interface ARCSShape2 {
  needsBiz: boolean;
  title: string;
  cast: string;
  w: number;
  minTurn: number;
  cond: ((a0: any) => any);
  stages: (((a0: any) => any)[]);
}
interface ARCSShape3 {
  title: string;
  cast: null;
  w: number;
  minTurn: number;
  cond: ((a0: any) => any);
  stages: (((a0: any) => any)[]);
}
interface ARCSShape4 {
  needsBiz: boolean;
  title: string;
  cast: null;
  w: number;
  minTurn: number;
  cond: ((a0: any) => any);
  stages: (((a0: any) => any)[]);
}
interface ARCSShape5 {
  container: ARCSShape;
  familyland: ARCSShape;
  thedoor: ARCSShape;
  undercut: ARCSShape2;
  thefile: ARCSShape;
  theline: ARCSShape;
  thecousin: ARCSShape;
  thetitle: ARCSShape;
  theask: ARCSShape;
  theexit: ARCSShape2;
  thecrash: ARCSShape3;
  tender: ARCSShape2;
  whale: ARCSShape4;
  partnerwar: ARCSShape4;
  secondfloor: ARCSShape4;
  newline: ARCSShape4;
  crunch: ARCSShape2;
  audit: ARCSShape4;
  keyperson: ARCSShape4;
  exitsale: ARCSShape4;
  disaster: ARCSShape4;
  export: ARCSShape4;
  formalise: ARCSShape4;
  supply: ARCSShape2;
  fraud: ARCSShape4;
  succession: ARCSShape4;
}

const ARCS: ARCSShape5 = {

/* ---------------------------------------------------------------- container */
container:{ title:'The Container', cast:'friend', w:1.0, minTurn:4,
  cond:function(s){ return s.fin.cash > naira(600000) && !s.flags.arc_container; },
  stages:[
  function(t){
    return {cat:'money', title:'A container, split two ways',
      text:cn(t)+' has a contact in Guangzhou and a plan. One container of goods, halves, four months, double your money. "I have seen the samples," they say. Everyone who has lost money in this country has heard a sentence very like that one.',
      opts:[
        {label:'Go in. '+fmt(naira(1800000)), hint:'Half of a container. Real upside, real chance of nothing.',
         effFn:function(){ return {cash:-naira(1800000), log:['money','You wired '+fmt(naira(1800000))+' for half a container of goods.','warn']}; },
         rel:{d:4, note:'went halves on a container'}, next:1, delay:2},
        {label:'Go in small — '+fmt(naira(600000))+' for a quarter share.', hint:'Bounded downside. Smaller friendship risk too.',
         effFn:function(){ return {cash:-naira(600000), log:['money','You took a quarter share of the container for '+fmt(naira(600000))+'.','neutral']}; },
         next:1, delay:2, data:{small:true}},
        {label:'No. Ask to see the import documents first.', hint:'The question that ends most proposals.',
         effFn:function(){ return {skill:{finance:4}, log:['money','You asked for the import paperwork. The plan became noticeably vaguer.','good']}; },
         rel:{d:-6, note:'asked for documents instead of money'}, next:'end'}
      ]};
  },
  function(t){
    return {cat:'money', title:'The ship is "slightly delayed"',
      text:()=>'Three weeks past the date, '+cn(t)+' calls with news. The container is held at the port. The agent says a payment of '+fmt(naira(420000))+' will "expedite clearance". '+cn(t)+' is already reaching for their phone.',
      opts:[
        {label:'Send the expediting money.', hint:'Half of it, if you are splitting as agreed.',
         odds:function(){ return 0.45; },
         okEffFn:function(){ return {cash:-naira(210000), log:['money','You paid to expedite. The container cleared in nine days.','good']}; },
         okText:'It cleared. Nine days later the truck arrived and so did the goods.',
         failEffFn:function(){ return {cash:-naira(210000), log:['money','You paid to expedite. The agent stopped answering.','bad']}; },
         failText:'The agent stopped answering. The expediting fee was simply a second purchase of nothing.',
         next:2, delay:1},
        {label:'Refuse. Go to the port yourself.', hint:'A day of your life and a lot of standing around.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ return {cash:-naira(60000), skill:{ops:4}, log:['money','You went to the port yourself. It turns out the container was never held; it was never shipped. You pulled out with most of your money.','good']}; },
         okText:'You went down there. The container was never held — it was never shipped. You got most of your money back because you showed up in person.',
         failEffFn:function(){ return {log:['money','You went to the port. A day of your life, and the answer was still no.','bad']}; },
         failText:'A day of your life, three offices, and the answer did not change.',
         rel:{d:-3, note:'went to the port'}, next:2, delay:1},
        {label:'Tell '+cn(t)+' you are out. Take the loss.', hint:'Stops the bleeding. Ends something else.',
         effFn:function(){ return {log:['money','You told '+cn(t)+' you were out. They said they understood.','bad']}; },
         rel:{d:-22, note:'walked away mid-deal'}, next:'end'}
      ]};
  },
  function(t){
    const small = t.data && t.data.small;
    return {cat:'money', title:'The container resolves',
      text:'Whatever was going to happen has happened. '+cn(t)+' is standing in your sitting room with a face you have known for years, and you can read the answer before they speak.',
      opts:[
        {label:'Open the account and see.', hint:'There is only one way to find out.',
         odds:function(){ return small?0.42:0.44; },
         okEffFn:function(){ const mult = small?4.2:3.4; return {cash:naira(small?600000:1800000)*mult, rep:4, happy:6,
           log:['money','The goods sold through in five weeks. '+fmt(naira(small?600000:1800000)*mult)+' back on the container. You were lucky and you know it.','good']}; },
         okText:'It worked. The goods moved in five weeks and the numbers were real. '+cn(t)+' has not stopped talking about it since.',
         failEffFn:function(){ return {log:['money','The goods arrived and were not the goods in the samples. You recovered almost nothing.','bad']}; },
         failText:'The goods arrived. They were not the goods. You sold them at a loss and learned the difference between a sample and a shipment.',
         rel:{d:6, note:'saw the container through together'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- family land */
familyland:{ title:'The Family Land', cast:'sibling', w:0.9, minTurn:8,
  cond:function(s){ return s.p.parents>0 && !s.flags.arc_land; },
  stages:[
  function(t){
    return {cat:'life', title:'The land at Ikorodu',
      text:'Your father is getting older and the land has come up again. '+cn(t)+' wants to sell it and split the money. You have never said out loud what you actually think, which is that land is the only thing in this family that has ever gone up.',
      opts:[
        {label:'Argue to hold it. Offer to buy their share over three years.', hint:'Costs you now. Costs you more later if you are right.',
         effFn:function(){ return {cash:-naira(900000), family:6, log:['life','You offered to buy out their share of the family land in instalments.','good']}; },
         rel:{d:8, note:'bought into the family land'}, next:1, delay:6},
        {label:'Agree to sell. Take the cash.', hint:'Clean, immediate, and probably the end of the argument.',
         effFn:function(){ return {cash:naira(4200000), family:3, log:['life','The family land was sold. Your share: '+fmt(naira(4200000))+'.','neutral']}; },
         rel:{d:4, note:'sold the family land'}, next:'end'},
        {label:'Refuse to discuss it at all.', hint:'Kicks the can. The can does not go away.',
         effFn:function(){ return {family:-8, log:['life','You refused to discuss the land. The subject became a wall.','bad']}; },
         rel:{d:-16, note:'refused to discuss the land'}, next:1, delay:8, data:{refused:true}}
      ]};
  },
  function(t){
    if(t.data && t.data.refused){
      return {cat:'life', title:'The land was sold without you',
        text:cn(t)+' sold it. The papers went through while you were not returning calls. There is a share with your name on it and a version of events in which you agreed.',
        opts:[
          {label:'Take the money and say nothing.', hint:'The relationship survives. Just about.',
           effFn:function(){ return {cash:naira(3100000), family:-4, log:['life','You took your share without a fight. Some things are worth more than being right.','neutral']}; },
           rel:{d:-8, note:'took the money quietly'}, next:'end'},
          {label:'Lawyer up. Contest it.', hint:'Expensive, slow, and it will be discussed at every family gathering for a decade.',
           odds:function(){ return 0.4; },
           okEffFn:function(){ return {cash:-naira(750000), asset:{id:'land', value:naira(9000000)}, family:-10,
             log:['life','You contested the sale and won. You own the land. You are not invited to things.','good']}; },
           okText:'You won. The land is yours and the family is split in a way that will not fully heal.',
           failEffFn:function(){ return {cash:-naira(1200000), family:-16, stress:12, log:['life','You contested the sale and lost, and paid costs.','bad']}; },
           failText:'You lost, paid their costs, and bought yourself a permanent role in family arguments.',
           rel:{d:-45, note:'was sued over the land'}, next:'end'}
        ]};
    }
    return {cat:'life', title:'A surveyor finds something',
      text:'You paid for a proper survey, which almost nobody does. The surveyor comes back with a map and a bad sentence: the eastern third of the parcel sits inside a government acquisition line from 1991 that nobody has ever enforced and nobody has ever cancelled.',
      opts:[
        {label:'Sell the good two-thirds immediately.', hint:'Salvage what is clearly yours while you can.',
         effFn:function(){ return {cash:naira(6800000), family:2, skill:{finance:3},
           log:['life','You sold the clean portion of the land at a good price and walked away from the disputed third.','good']}; },
         rel:{d:2, note:'sold the clean portion'}, next:'end'},
        {label:'Apply to have the acquisition lifted.', hint:'Two years, fees, and a real chance it works.',
         odds:function(){ return 0.5; },
         okEffFn:function(){ return {cash:-naira(600000), asset:{id:'land', value:naira(14000000)}, rep:5,
           log:['life','Two years of paperwork later, the acquisition was lifted. The parcel is worth several times what it was.','good']}; },
         okText:'Two years of files and one helpful official later, the acquisition was lifted. The land multiplied.',
         failEffFn:function(){ return {cash:-naira(600000), log:['life','Two years of paperwork ended in nothing.','bad']}; },
         failText:'Two years, four offices, and a file that nobody can find. Nothing changed.',
         rel:{d:0, note:'chased the acquisition line'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the door */
thedoor:{ title:'The Door', cast:'mentor', w:0.8, minTurn:6,
  cond:function(s){ return s.p.rep>35 && !s.flags.arc_door; },
  stages:[
  function(t){
    return {cat:'life', title:'An introduction',
      text:cn(t)+' calls on a Tuesday. "There is someone you should meet." That is the whole sentence, and it is how almost every important thing in anyone\'s career begins.',
      opts:[
        {label:'Take the meeting. Clear your afternoon.', hint:'Costs you a day. Might cost you nothing else.',
         effFn:function(){ return {skill:{network:8}, rep:5, log:['life','You took the meeting '+cn(t)+' arranged. It went well.','good']}; },
         rel:{d:8, note:'took the introduction seriously'}, next:1, delay:5},
        {label:'Ask what is in it for them first.', hint:'Reasonable. Slightly smaller.',
         effFn:function(){ return {skill:{network:4}, rep:1, skill2:0, log:['life','You asked what '+cn(t)+' wanted out of it. The answer was: to be the person who introduced you.','neutral']}; },
         rel:{d:2, note:'asked what was in it for them'}, next:1, delay:6},
        {label:'Decline. You are heads-down right now.', hint:'Free. Doors like this do not stay open.',
         effFn:function(){ return {log:['life','You declined the introduction. '+cn(t)+' never offered again.','bad']}; },
         rel:{d:-14, note:'declined the introduction'}, next:'end'}
      ]};
  },
  function(t){
    return {cat:'life', title:'The favour',
      text:'The introduction worked. It worked so well that '+cn(t)+' now feels entitled to a share of the weather. They want their nephew placed in your company, at a salary the role does not justify, starting Monday.',
      opts:[
        {label:'Hire the nephew at the real rate.', hint:'Honest. Will be received as an insult.',
         effFn:function(){ return {log:['life','You offered the nephew a job at what the role is worth. It was received as an insult.','warn']}; },
         rel:{d:-12, note:'lowballed the nephew'}, next:'end'},
        {label:'Hire him at the inflated rate.', hint:'A permanent cost for a temporary peace.',
         effFn:function(){ return {cash:-naira(1400000), log:['life','You hired the nephew at well above market. You will be paying for this decision for years.','warn']}; },
         rel:{d:14, note:'hired the nephew'}, next:2, delay:4},
        {label:'Refuse, and explain exactly why.', hint:'The most expensive honesty available.',
         effFn:function(){ return {rep:-3, log:['life','You refused, clearly and kindly. The relationship will survive. The pipeline will not.','bad']}; },
         rel:{d:-26, note:'refused the favour'}, next:'end'}
      ]};
  },
  function(t){
    return {cat:'biz', title:'The nephew, eighteen months on',
      text:'He turned out to be extremely good, which is the outcome nobody predicts. Two of your clients now ask for him by name. He has just asked for a raise that would make him your second-highest paid person, and he knows exactly what he is worth.',
      opts:[
        {label:'Pay him. Make him a real prospect.', hint:'Expensive. He is the reason two clients stay.',
         effFn:function(){ return {bizrep:8, log:['biz','You paid him properly and gave him a title. He stopped interviewing.','good']}; },
         rel:{d:10, note:'made the nephew a prospect'}, next:'end'},
        {label:'Let him go and mean it well.', hint:'He will be running a competing desk within a year.',
         effFn:function(){ return {bizrep:-6, log:['biz','You let him go well. Eight months later he opened two doors down.','warn']}; },
         rel:{d:-6, note:'let the nephew go'}, next:'end'},
        {label:'Offer him equity instead of salary.', hint:'Binds him to the outcome rather than the month.',
         effFn:function(){ return {flag:{gaveEquity:true}, bizrep:6, log:['biz','You gave him equity instead of a raise. He started behaving like an owner, because he is one.','good']}; },
         rel:{d:6, note:'gave the nephew equity'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the undercut */
undercut:{ needsBiz:true, title:'The Undercut', cast:'rival', w:0.9, minTurn:8,
  cond:function(s){ return !!s.biz && s.biz.revenue>1500000 && !s.flags.arc_undercut; },
  stages:[
  function(t){
    return {cat:'biz', title:'Someone is selling your thing for less',
      text:cn(t)+' has opened four doors down and is undercutting you by thirty per cent. Three of your customers have mentioned it in the last week, each in the careful tone people use when they are deciding whether to leave you.',
      opts:[
        {label:'Match them. Price war it is.', hint:'Nobody wins a price war. Somebody loses slower.',
         effFn:function(){ return {bizrep:-4, log:['biz','You matched their price. Your margin is now a rounding error and so is theirs.','warn']}; },
         rel:{d:-8, note:'started a price war with you'}, next:1, delay:2, data:{war:true}},
        {label:'Hold your price and raise quality.', hint:'You will lose customers. You will keep the ones worth keeping.',
         effFn:function(){ return {cash:-naira(700000), bizqual:14, bizrep:4, log:['biz','You held your price and put the money into the product instead.','good']}; },
         rel:{d:-2, note:'refused to be undercut'}, next:1, delay:3, data:{quality:true}},
        {label:'Go and see them.', hint:'Talking is cheaper than both of you think.',
         odds:function(){ return 0.5; },
         okEffFn:function(){ return {bizrep:6, skill:{network:5}, log:['biz','You went to see '+cn(t)+'. You agreed on referral terms. The war never started.','good']}; },
         okText:'You went round. Two hours later you had a referral arrangement and a slightly grudging respect.',
         failEffFn:function(){ return {bizrep:-3, log:['biz','You went to see '+cn(t)+'. They used the meeting to price-shop your supplier list.','bad']}; },
         failText:'They used the meeting to find out who your suppliers are. The undercutting got worse.',
         rel:{d:-4, note:'met you and went harder'}, next:1, delay:2, data:{talked:true}}
      ]};
  },
  function(t){
    const war = t.data && t.data.war;
    return {cat:'biz', title:(war?'The war, six months in':'Six months later'),
      text:(war
        ? 'Both of you are now selling below cost and calling it strategy. Your cash is going down every month. So is theirs, presumably. Neither of you can see the other\'s books.'
        : 'You held your line. Some customers left. Some of them have already come back, quietly, without mentioning that they ever went.'),
      opts:[
        {label:'Keep going. They will break first.', hint:'A bet on their balance sheet, not yours.',
         odds:function(){ return 0.42; },
         okEffFn:function(){ return {bizrep:12, bizcash:naira(2400000), log:['biz',cn(t)+' folded. Their landlord has already repainted the unit.','good']}; },
         okText:'They folded in month seven. You raised your prices back the same week and nobody blinked.',
         failEffFn:function(){ return {bizcash:-naira(3200000), bizrep:-8, stress:12, log:['biz','You both bled for another year. You bled more.','bad']}; },
         failText:'You were both bleeding; you simply had less blood. They bought your equipment at auction.',
         next:'end'},
        {label:'End it. Go and propose a merger.', hint:'Awkward, and often the best available outcome.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ return {bizloc:1, bizcap:naira(3000000), bizrep:8, flag:{merged:true},
           log:['biz','You merged with '+cn(t)+'. Awkward for a year, then obviously correct.','good']}; },
         okText:'You merged. The combined business is worth more than the two of you were separately, which is the entire point of merging.',
         failEffFn:function(){ return {log:['biz','They laughed. Genuinely.','bad']}; },
         failText:'They laughed, then used the approach to tell your best client you were looking to sell.',
         rel:{d:6, note:'became a partner instead of a rival'}, next:'end'},
        {label:'Get out of that line entirely. Pivot.', hint:'Losing the battle to win something else.',
         effFn:function(){ return {bizrep:-10, bizcash:-naira(1500000), skill:{ops:6}, flag:{pivoted:true},
           log:['biz','You exited the line rather than fight for it. Painful and, in hindsight, correct.','warn']}; },
         rel:{d:0, note:'watched you retreat'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the file */
thefile:{ title:'The File', cast:'contact', w:0.7, minTurn:10,
  cond:function(s){ return s.p.rep>40 && !s.flags.arc_file; },
  stages:[
  function(t){
    return {cat:'money', title:'The file sitting on a desk',
      text:cn(t)+' mentions, casually, that a contract you would very much like is sitting in an office waiting for a signature. It could wait there for eight months. Or it could move this week. "These things move faster with facilitation," they say, and do not name a number.',
      opts:[
        {label:'Facilitate. '+fmt(naira(900000))+'.', hint:'It works. That is the problem with it.',
         effFn:function(){ return {cash:-naira(900000), bizcash:naira(11000000), flag:{facilitated:true},
           log:['money','The contract moved in eleven days. You paid '+fmt(naira(900000))+' to make that happen.','warn']}; },
         rel:{d:10, note:'facilitated the file'}, next:1, delay:6},
        {label:'Decline. Wait the eight months.', hint:'Slower. Cleaner. You might not get it.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ return {bizcash:naira(9000000), rep:5, log:['money','You waited eight months and got the contract anyway. It cost you time instead of money.','good']}; },
         okText:'Eight months later the contract came through anyway. It cost you time, and nothing you have to remember.',
         failEffFn:function(){ return {log:['money','You waited. The contract went to a company that did not wait.','bad']}; },
         failText:'You waited. It went to someone who did not.',
         rel:{d:-6, note:'refused to facilitate'}, next:'end'},
        {label:'Report it.', hint:'Correct. Almost never consequence-free.',
         effFn:function(){ return {rep:10, flag:{reported:true}, stress:10, log:['money','You reported it. Nothing happened to the file. Something happened to your reputation in one particular building.','warn']}; },
         rel:{d:-40, note:'was reported by you'}, next:1, delay:8, data:{reported:true}}
      ]};
  },
  function(t){
    if(t.data && t.data.reported){
      return {cat:'money', title:'Auditors, two years later',
        text:'An audit lands on the agency. Somebody has been keeping records of who paid facilitation and who did not, and the list is now evidence. Your name is on the right side of it.',
        opts:[
          {label:'Give a statement.', hint:'Two weeks of your life.',
           effFn:function(){ return {rep:14, stress:8, log:['life','You gave a statement. It was the right side of the list and it cost you two weeks.','good']}; },
           next:'end'},
          {label:'Stay out of it.', hint:'You are already on the right side. That is enough.',
           effFn:function(){ return {log:['life','You stayed out of it. The right side of a list is a good place to be quietly.','neutral']}; },
           next:'end'}
        ]};
    }
    return {cat:'money', title:'The same offer, again',
      text:'Two years on, '+cn(t)+' is back with a larger contract and a larger smile. The arrangement worked last time. That is exactly why they are here.',
      opts:[
        {label:'Do it again.', hint:'Now you are a person who does this.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ return {cash:-naira(1600000), bizcash:naira(24000000), log:['money','It worked again. You are beginning to find that frightening.','warn']}; },
         okText:'It worked again. You have stopped being able to tell whether you are smart or simply connected.',
         failEffFn:function(){ return {cash:-naira(1600000), rep:-14, stress:18, flag:{investigated:true},
           log:['money','This time there was a journalist. Your name is in a document.','bad']}; },
         failText:'This time there was a journalist. The money is gone and your name is in a document.',
         next:'end'},
        {label:'Decline, and say it is a one-time thing you regret.', hint:'Late honesty is still honesty.',
         effFn:function(){ return {rep:6, log:['life','You declined. Saying you regretted the first one out loud cost you something and bought something else.','good']}; },
         rel:{d:-10, note:'was refused the second time'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the line */
theline:{ title:'The Line', cast:'banker', w:0.7, minTurn:10,
  cond:function(s){ return s.fin.credit>45 && (!!s.biz || s.fin.cash>3000000) && !s.flags.arc_line; },
  stages:[
  function(t){
    return {cat:'money', title:'A facility you did not ask for',
      text:cn(t)+' wants to take you for lunch. The bank has "reviewed your profile" and would like to offer you a facility of '+fmt(naira(40000000))+'. It is the friendliest conversation you will have all year, and it is, structurally, a sale.',
      opts:[
        {label:'Take the full facility. You will find a use for it.', hint:'Cheap money is how people end up overextended.',
         effFn:function(){ return {debt:{name:'Bank facility', bal:naira(40000000), rate:0.055, minPay:naira(1600000), kind:'bank'}, cash:naira(40000000),
           log:['money','You drew a '+fmt(naira(40000000))+' facility. You now have money and a schedule.','warn']}; },
         rel:{d:6, note:'took the full facility'}, next:1, delay:10, data:{full:true}},
        {label:'Take a third of it and keep it untouched.', hint:'A standby line. Boring and correct.',
         effFn:function(){ return {debt:{name:'Bank facility', bal:naira(13000000), rate:0.055, minPay:naira(520000), kind:'bank'}, cash:naira(13000000), credit:5,
           log:['money','You took a third of the facility and left it sitting there as a standby.','good']}; },
         rel:{d:2, note:'took a third'}, next:1, delay:10, data:{part:true}},
        {label:'Decline. You do not borrow to feel rich.', hint:'Free. Slightly offensive to a banker.',
         effFn:function(){ return {credit:3, skill:{finance:2}, log:['money','You declined the facility. '+cn(t)+' made a note.','good']}; },
         rel:{d:-4, note:'declined the facility'}, next:'end'}
      ]};
  },
  function(t){
    const full = t.data && t.data.full;
    return {cat:'money', title:'The call',
      text:'The economy turned. The bank has "reviewed your profile" again — this time in the other direction, and the facility is repayable on demand. '+cn(t)+' is no longer taking you to lunch. '+cn(t)+' is sending emails with the word "urgent" in the subject line.',
      opts:[
        {label:'Sell assets and clear it now.', hint:'Crystallises losses. Ends the conversation.',
         effFn:function(){ const cut = full?0.30:0.12;
           let sold = 0; (S.assets||[]).forEach(function(a){ const take = a.value*cut; a.value -= take; sold += take; });
           S.assets = (S.assets||[]).filter(function(a){ return a.value>2000; });
           S.fin.debt = (S.fin.debt||[]).filter(function(d){ return d.name!=='Bank facility'; });
           S.stress = clamp(S.p.stress+12,0,100); S.fin.credit = clamp(S.fin.credit-6,0,100);
           return {log:['money','You liquidated '+fmt(sold)+' of investments to clear the facility. You sold into a bad market because you had to.','bad']}; },
         next:'end'},
        {label:'Renegotiate. Offer more security, longer tenor.', hint:'Costs you something. Buys you years.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ return {cash:-naira(700000), credit:-4, log:['money','You restructured: more collateral, three more years. They agreed because foreclosing is worse for them too.','good']}; },
         okText:'They agreed. More collateral, longer tenor, higher rate. They were never going to foreclose — foreclosing is worse for them too.',
         failEffFn:function(){ const cut = full?0.45:0.20;
           let sold=0; (S.assets||[]).forEach(function(a){ const take=a.value*cut; a.value-=take; sold+=take; });
           S.assets = (S.assets||[]).filter(function(a){ return a.value>2000; });
           S.fin.debt = (S.fin.debt||[]).filter(function(d){ return d.name!=='Bank facility'; });
           S.fin.credit = clamp(S.fin.credit-20,0,100); S.stress = clamp(S.p.stress+18,0,100);
           return {log:['money','They called the facility in full. You sold '+fmt(sold)+' of holdings at the worst possible moment.','bad']}; },
         failText:'They called it in full. You sold at the bottom, which is what being called in means.',
         rel:{d:-6, note:'was renegotiated under pressure'}, next:'end'},
        {label:'Ignore the emails.', hint:'The worst available option, and a popular one.',
         effFn:function(){ return {credit:-26, stress:16, log:['money','You ignored the emails. The bank escalated to a lawyer.','bad']}; },
         rel:{d:-20, note:'was ignored'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the cousin */
thecousin:{ title:'The Cousin', cast:'cousin', w:1.0, minTurn:3,
  cond:function(s){ return !s.flags.arc_cousin; },
  stages:[
  function(t){
    return {cat:'life', title:'A business plan, sort of',
      text:cn(t)+' has a plan. It involves a generator, a freezer, and a location somebody is holding for them until Friday. The number they need is '+fmt(naira(700000))+'. They have told the family you are handling it.',
      opts:[
        {label:'Give it. Call it a gift.', hint:'The version of generosity that survives.',
         effFn:function(){ return {cash:-naira(700000), family:8, happy:3, log:['life','You gave '+cn(t)+' '+fmt(naira(700000))+' and called it a gift, not a loan.','good']}; },
         rel:{d:16, note:'was given money, no strings'}, next:1, delay:5, data:{gift:true}},
        {label:'Lend it properly, with dates written down.', hint:'Adults do this. Families often do not.',
         effFn:function(){ return {cash:-naira(700000), family:2, log:['life','You lent it with repayment dates written down. The document has already been mentioned twice.','neutral']}; },
         rel:{d:4, note:'was lent money with a contract'}, next:1, delay:5, data:{loan:true}},
        {label:'Say no and explain the actual reason.', hint:'Free. The explanation will be repeated without you.',
         effFn:function(){ return {family:-10, log:['life','You said no and explained why. The explanation made it to your mother without the reasoning attached.','bad']}; },
         rel:{d:-24, note:'was refused'}, next:1, delay:8, data:{no:true}}
      ]};
  },
  function(t){
    if(t.data && t.data.no){
      return {cat:'life', title:cn(t)+' did it anyway',
        text:'They found the money somewhere else and the freezer business actually worked. It has worked for two years now. They have not asked you for anything since, and they have not forgotten.',
        opts:[
          {label:'Congratulate them, genuinely.', hint:'Grace is free and rare.',
           effFn:function(){ return {family:8, rep:3, log:['life','You congratulated '+cn(t)+' properly. It turns out being refused was the best thing that happened to them.','good']}; },
           rel:{d:14, note:'thanked you for saying no'}, next:'end'},
          {label:'Say nothing.', hint:'Fine. Slightly smaller.',
           effFn:function(){ return {log:['life','You said nothing about it.','neutral']}; }, next:'end'}
        ]};
    }
    return {cat:'life', title:'The freezer',
      text:()=>'The freezer business did not work. '+cn(t)+' needs '+fmt(naira(400000))+' more to "restart properly", and the family has begun calling you at the same time on Sundays.',
      opts:[
        {label:'Fund the restart.', hint:'There is always a restart.',
         effFn:function(){ return {cash:-naira(400000), family:3, log:['life','You funded the restart.','warn']}; },
         rel:{d:8, note:'was funded twice'}, next:2, delay:5, data:{twice:true}},
        {label:'No. Offer a job instead.', hint:'Bounded help, with an exit.',
         effFn:function(){ return {family:-4, log:['life','You offered '+cn(t)+' work instead of money. The offer was not taken up.','neutral']}; },
         rel:{d:-10, note:'was offered work instead of money'}, next:'end'},
        {label:'No, and say it is the last time you will discuss it.', hint:'Sets a boundary. Boundaries cost.',
         effFn:function(){ return {family:-12, stress:6, log:['life','You told '+cn(t)+' it was the last time you would discuss money. It was the last time they called you.','bad']}; },
         rel:{d:-35, note:'was cut off'}, next:'end'}
      ]};
  },
  function(t){
    return {cat:'life', title:'The third ask',
      text:'There is a third ask. There is always a third ask. This one is smaller and sadder and harder to refuse than either of the first two.',
      opts:[
        {label:'Give it. It is the last one.', hint:'You have said that twice.',
         effFn:function(){ return {cash:-naira(250000), family:1, log:['life','You gave again. You have now given three times and received one update.','warn']}; },
         rel:{d:10, note:'was funded three times'}, next:'end'},
        {label:'No. And mean it this time.', hint:'The relationship ends the way you let it.',
         effFn:function(){ return {family:-8, log:['life','You said no and held. Something in the family rebalanced permanently.','neutral']}; },
         rel:{d:-30, note:'was finally refused'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the title */
thetitle:{ title:'The Title', cast:'elder', w:0.8, minTurn:6,
  cond:function(s){ return s.fin.cash>naira(4000000) && !s.flags.arc_title; },
  stages:[
  function(t){
    return {cat:'money', title:'A parcel, quietly offered',
      text:cn(t)+' mentions, after a meeting, that there is a parcel going cheap because the family needs to settle a debt quickly. Six plots, clean survey, "everything is in order". The price is about sixty per cent of what it should be, which is either the opportunity of your life or the reason it is available.',
      opts:[
        {label:'Buy it. '+fmt(naira(9000000))+'.', hint:'The discount is either real or a warning.',
         effFn:function(){ return {cash:-naira(9000000), asset:{id:'land', value:naira(15000000)},
           log:['invest','You bought six plots at a significant discount. Now you find out why.','warn']}; },
         rel:{d:8, note:'sold you the parcel'}, next:1, delay:4},
        {label:'Buy it, but pay for a proper title search first.', hint:'₦600k and six weeks. Changes everything.',
         effFn:function(){ return {cash:-naira(9600000), asset:{id:'land', value:naira(15000000)}, skill:{finance:5}, flag:{searched:true},
           log:['invest','You paid for a full title search before completing. Everyone told you it was unnecessary.','good']}; },
         rel:{d:-2, note:'was made to wait for a title search'}, next:1, delay:4, data:{searched:true}},
        {label:'Walk away. Too cheap.', hint:'Discipline dressed as cowardice.',
         effFn:function(){ return {skill:{finance:3}, log:['invest','You walked away from a cheap parcel because it was cheap.','good']}; },
         rel:{d:-8, note:'was turned down'}, next:'end'}
      ]};
  },
  function(t){
    const searched = t.data && t.data.searched;
    return {cat:'money', title:'Men with a surveyor',
      text:'A family you have never met has produced documents. They have a surveyor who agrees with them, which surveyors can always be paid to do. '+(searched?'Your search already told you their claim dates to a sale that was never completed.':'You have no idea which set of papers is older, and that is entirely your own fault.'),
      opts:[
        {label:'Lawyer up immediately.', hint:'Slow, expensive, decisive.',
         odds:function(){ return searched?0.85:0.5; },
         okEffFn:function(){ return {cash:-naira(900000), log:['money','Your title held. You paid '+fmt(naira(900000))+' to keep land worth several times that.','good']}; },
         okText:(searched?'Because you searched first, your lawyer had the answer in an afternoon. ':'')+'Their claim collapsed. You kept all six plots.',
         failEffFn:function(){ return {cash:-naira(900000), asset:{id:'land', value:-naira(6000000)}, stress:16,
           log:['money','The older title won. You lost two of the six plots and a year of your life.','bad']}; },
         failText:'Their claim was older. You kept four plots out of six and learned to search titles before paying.',
         next:'end'},
        {label:'Settle with them. '+fmt(naira(2800000))+'.', hint:'Fast. Teaches them it works.',
         effFn:function(){ return {cash:-naira(2800000), log:['money','You settled. Peace, at a price, and now they know the method works.','neutral']}; },
         next:'end'},
        {label:'Sell the parcel on immediately, disclose nothing.', hint:'You can. People do.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ return {cash:naira(14000000), rep:-16, log:['money','You sold the disputed parcel to someone who did not search. It will come back to you.','bad']}; },
         okText:'You sold it on. The money is real. So is what you now know about yourself.',
         failEffFn:function(){ return {cash:-naira(2000000), rep:-20, log:['money','The buyer searched, found the dispute, and sued you.','bad']}; },
         failText:'The buyer searched. They found the dispute and they found you.',
         next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the ask */
theask:{ title:'The Ask', cast:'love', w:0.8, minTurn:4,
  cond:function(s){ return !s.p.married && s.p.age>=25 && !s.flags.arc_ask; },
  stages:[
  function(t){
    return {cat:'life', title:'The conversation',
      text:cn(t)+' has been patient for two years and has stopped being patient. "What are we doing?" is the question, and it is not really a question about the relationship. It is a question about money, time and whether you are going to keep choosing work.',
      opts:[
        {label:'Commit. Properly.', hint:'This changes every number on every screen.',
         effFn:function(){ return {happy:14, family:6, log:['life','You committed. Everything about your finances is now a shared decision.','good']}; },
         rel:{d:20, note:'was proposed to'}, next:1, delay:4},
        {label:'Ask for a year.', hint:'Fair, and a gamble on their patience.',
         odds:function(){ return 0.5; },
         okEffFn:function(){ return {happy:4, log:['life','You asked for a year. They gave it to you. Not everyone gets that.','good']}; },
         okText:'They gave you the year. Not everyone gets the year.',
         failEffFn:function(){ return {happy:-14, stress:8, log:['life','You asked for a year. There was not one.','bad']}; },
         failText:'They did not have a year to give. They were right about that.',
         rel:{d:-30, note:'was asked to wait'}, next:'end'},
        {label:'End it. You are not going to choose this.', hint:'The clearest option, and the one people avoid.',
         effFn:function(){ return {happy:-10, stress:6, log:['life','You ended it rather than keep someone waiting on a decision you were never going to make.','bad']}; },
         rel:{d:-50, note:'was let go'}, next:'end'}
      ]};
  },
  function(t){
    return {cat:'life', title:'The two families',
      text:()=>'The wedding is being planned by two families with different ideas about what a wedding costs. Yours would like something modest. Theirs has used the phrase "we are not doing this twice". The number on the table is '+fmt(naira(5200000))+' and it arrived with a spreadsheet.',
      opts:[
        {label:'Pay for the wedding they want.', hint:'Starts the marriage in debt and in their favour.',
         effFn:function(){ return {cash:-naira(5200000), marry:{income:Math.round(marketMonthly()*0.5)}, family:12, rep:6, stress:8, happy:12,
           log:['life','You paid for the wedding they wanted. It was beautiful and it was a line item.','good']}; },
         rel:{d:14, note:'married properly'}, next:2, delay:8},
        {label:'Negotiate down to something you can afford.', hint:'Uncomfortable. Sets a precedent you will live with.',
         effFn:function(){ return {cash:-naira(1900000), marry:{income:Math.round(marketMonthly()*0.5)}, family:2, happy:8,
           log:['life','You held the line on the budget. Somebody\'s aunt has never fully forgiven you.','neutral']}; },
         rel:{d:-6, note:'held the line on the wedding'}, next:2, delay:8},
        {label:'Elope. Register it and have dinner after.', hint:'₦300k. Nuclear.',
         effFn:function(){ return {cash:-naira(300000), marry:{income:Math.round(marketMonthly()*0.5)}, happy:10, family:-18,
           log:['life','You registered the marriage and took everyone to dinner. Both families consider this a theft.','bad']}; },
         rel:{d:-10, note:'eloped with you'}, next:2, delay:8, data:{elope:true}}
      ]};
  },
  function(t){
    return {cat:'life', title:'Two years in',
      text:'The marriage is a real thing now, with a joint reality in it. '+cn(t)+' wants a child. You have run the numbers twice and the numbers do not say yes, but the numbers also do not know anything.',
      opts:[
        {label:'Have the child.', hint:'The single largest permanent change to your finances available.',
         effFn:function(){ return {kid:1, cash:-naira(900000), happy:14, stress:14, family:8,
           log:['life','You had a child. Every model you had of your own money is now obsolete.','good']}; },
         rel:{d:16, note:'started a family with you'}, next:'end'},
        {label:'Ask for two more years.', hint:'Reasonable. Time is not indefinite.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ return {happy:2, log:['life','You agreed on two more years and used them.','good']}; },
         okText:'Two more years, and you used them properly.',
         failEffFn:function(){ return {happy:-12, family:-6, log:['life','You asked for two more years. The conversation about it is still happening, in different rooms.','bad']}; },
         failText:'You asked for two more years and got a version of the argument that has not really ended.',
         rel:{d:-18, note:'was asked to wait for a child'}, next:'end'},
        {label:'Say you do not want children.', hint:'Say it now or say it worse later.',
         effFn:function(){ return {happy:R.chance(0.5)?4:-16, flag:{noKids:true}, log:['life','You said you did not want children. It was the right time to say it.','neutral']}; },
         rel:{d:R.chance(0.5)?6:-40, note:'was told you do not want children'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the exit */
theexit:{ needsBiz:true, title:'The Exit', cast:'rival', w:0.8, minTurn:24,
  cond:function(s){ return !!s.biz && bizValue()>naira(60000000) && !s.flags.arc_exit; },
  stages:[
  function(t){
    return {cat:'biz', title:'Someone wants to buy you',
      text:()=>'An approach, through an intermediary, from a company you have spent years measuring yourself against. They are offering roughly '+fmt(naira(Math.round(bizValue()*1.15)))+' for the business. You have not told anyone. You have told '+cn(t)+', who asked the right question, which is "are you going to take it?"',
      opts:[
        {label:'Enter talks. Exclusivity for ninety days.', hint:'Serious. Binding. You stop being able to shop it.',
         effFn:function(){ return {flag:{inTalks:true}, log:['biz','You entered exclusive talks. For ninety days the company is theirs to examine.','warn']}; },
         next:1, delay:3},
        {label:'Refuse outright. You are not finished.', hint:'The answer most founders give the first time.',
         effFn:function(){ return {log:['biz','You refused without discussing it. The offer will probably come back smaller.','neutral']}; },
         next:'end'},
        {label:'Counter at a much higher number.', hint:'Tests how much they actually want it.',
         odds:function(){ return 0.4; },
         okEffFn:function(){ return {flag:{inTalks:true}, log:['biz','You countered high and they did not walk. You left a lot on the table by not asking for more.','good']}; },
         okText:'They did not walk. That is the most expensive information in a negotiation, and you got it for free.',
         failEffFn:function(){ return {log:['biz','You countered high and they walked.','bad']}; },
         failText:'They walked, politely, and bought someone else.',
         next:1, delay:3}
      ]};
  },
  function(t){
    return {cat:'biz', title:'Due diligence',
      text:'Nine weeks of a team going through your books, your contracts, your staff records and your tax position. They have found the three things you knew about and one thing you did not: a former employee with a live claim. The price is being adjusted.',
      opts:[
        {label:'Accept the reduced price.', hint:'Take the money. Most deals close like this.',
         effFx:null,
         effFn:function(){ const v = Math.round(bizValue()*0.86); S.fin.cash += v; closeBizSilent();
           return {rep:6, happy:8, log:['biz','You sold. '+fmt(v)+', less than first offered, more than it was worth to you on a bad day.','good']}; },
         next:'end'},
        {label:'Fix the claim, then re-price.', hint:'Six months of your life and a renegotiation.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ const v = Math.round(bizValue()*1.25); S.fin.cash += v; closeBizSilent();
           return {cash:-naira(1500000), rep:10, log:['biz','You cleared the claim and re-priced. It took six months and it was worth '+fmt(v)+'.','good']}; },
         okText:'Six more months, a settled claim, and a price twenty-five per cent higher than the first offer.',
         failEffFn:function(){ const v = Math.round(bizValue()*0.7); S.fin.cash += v; closeBizSilent();
           return {log:['biz','You tried to fix it and the buyer lost interest. You sold anyway, at '+fmt(v)+'.','bad']}; },
         failText:'The buyer lost interest while you were fixing it. You sold anyway, for considerably less.',
         next:'end'},
        {label:'Walk away from the deal.', hint:'You built this. That is allowed to be the answer.',
         effFn:function(){ return {flag:{inTalks:false}, bizrep:6, happy:4, log:['biz','You walked away from a signed-term-sheet deal. Your staff found out and have not forgotten it.','good']}; },
         rel:{d:0, note:'watched you walk away from an exit'}, next:'end'}
      ]};
  }]},

/* ---------------------------------------------------------------- the crash */
thecrash:{ title:'The Crash', cast:null, w:0.7, minTurn:12,
  cond:function(s){ return (s.assets||[]).reduce(function(v,a){return v+a.value;},0) > naira(5000000); },
  stages:[
  function(t){
    return {cat:'money', title:'Everyone is an investor now',
      text:'The market has been going up for so long that a taxi driver gave you a stock tip. Your portfolio is up substantially and the number has started to feel like a fact rather than a price. Somewhere underneath it, something is mispriced.',
      opts:[
        {label:'Take some money off the table. Sell a third.', hint:'Nobody ever went broke taking profits, and nobody ever feels good doing it.',
         effFn:function(){ let sold=0; (S.assets||[]).forEach(function(a){ const take=a.value*0.33; a.value-=take; sold+=take; });
           S.fin.cash += sold; return {log:['invest','You sold a third of everything into a euphoric market for '+fmt(sold)+'.','good']}; },
         next:1, delay:3, data:{trimmed:true}},
        {label:'Hold everything. It is going higher.', hint:'What everyone says at the top.',
         effFn:function(){ return {log:['invest','You held. The line went up for two more quarters.','neutral']}; },
         next:1, delay:3},
        {label:'Borrow to buy more.', hint:'Leverage turns a correction into a catastrophe.',
         effFn:function(){ const amt = naira(6000000);
           S.fin.debt.push({id:'d'+(++S.seq), name:'Margin loan', bal:amt, rate:0.07, minPay:Math.round(amt*0.12), kind:'bank'});
           const a = S.assets[0]; if(a) a.value += amt;
           return {log:['invest','You borrowed '+fmt(amt)+' to buy more at the top.','bad']}; },
         next:1, delay:3, data:{levered:true}}
      ]};
  },
  function(t){
    const cut = (t.data && t.data.trimmed) ? 0.30 : 0.45;
    const lev = t.data && t.data.levered;
    return {cat:'money', title:'It breaks',
      text:'It does not fall slowly. It falls in three weeks, in a way that makes every price you were quoted look like a typo. Your holdings are down '+pct(cut,0)+' and the newspapers have found an economist who predicted it.',
      opts:[
        {label:'Sell everything now.', hint:'Converts a paper loss into a real one. Stops the bleeding.',
         effFn:function(){ let sold=0; (S.assets||[]).forEach(function(a){ sold+=a.value; }); S.fin.cash += sold; S.assets=[];
           return {stress:14, log:['invest','You sold everything at the bottom, which is what panic is.','bad']}; },
         next:2, delay:6, data:{panicked:true}},
        {label:'Hold. Do not open the app.', hint:'The hardest correct decision in investing.',
         effFn:function(){ return {stress:8, log:['invest','You held through it. You did not enjoy a single day of it.','good']}; },
         next:2, delay:6, data:{held:true}},
        {label:'Buy more. This is the sale.', hint:'Only works if you have cash and a decade.',
         odds:function(){ return 0.62; },
         okEffFn:function(){ let bought = Math.min(S.fin.cash*0.6, naira(8000000));
           S.fin.cash -= bought; const a=S.assets[0]; if(a) a.value += bought*2.1;
           return {log:['invest','You bought through the crash with '+fmt(bought)+'. It will look obvious in hindsight.','good']}; },
         okText:'You bought when it was genuinely frightening. It will look obvious in hindsight and it was not obvious at all.',
         failEffFn:function(){ let bought = Math.min(S.fin.cash*0.6, naira(8000000));
           S.fin.cash -= bought; const a=S.assets[0]; if(a) a.value += bought*0.55;
           return {log:['invest','You bought the dip and it kept dipping.','bad']}; },
         failText:'You bought the dip. It was not the dip. There were three more dips.',
         next:2, delay:6, data:{bought:true}}
      ]};
  },
  function(t){
    const panicked = t.data && t.data.panicked;
    const held = t.data && t.data.held;
    return {cat:'money', title:'Three years later',
      text:(panicked
        ? 'The market recovered. Of course it recovered. You are watching it from the side, holding cash that has been losing to inflation the entire time.'
        : (held ? 'It took thirty-one months. You did not sell, and the portfolio is now above where it was before the fall.' : 'It took a while, and then it did not take a while any more.')),
      opts:[
        {label:'Note the lesson and move on.', hint:'The only option there is.',
         effFn:function(){ return {skill:{finance:panicked?5:9}, log:['invest', panicked
           ? 'You learned, expensively, that the worst time to sell is when selling feels urgent.'
           : 'You learned that the ability to do nothing is a genuine and rare investment skill.','good']}; },
         next:'end'}
      ]};
  }]},
/* ============================== BUSINESS ARCS ============================== */
/* These require a business. They run over several quarters and the choice you
   make in stage one changes what stage three even is.                        */

/* ------------------------------------------------------------------ tender */
tender:{ needsBiz:true, title:'The Tender', cast:'contact', w:1.0, minTurn:6,
  cond:function(s){ return !!s.biz && !s.flags.arc_tender; },
  stages:[
  function(t){
    return {cat:'biz', title:'A contract is going out to tender',
      text:'There is a supply contract going out — the kind of order that would be several quarters of your current revenue in one cheque. '+
        'The advert is two lines in a newspaper nobody reads. Getting the documents costs '+fmt(naira(180000))+' and three days of somebody\'s life. '+
        'Everybody who has ever won one of these will tell you the same thing: the bid is not where it is decided.',
      opts:[
        {label:'Buy the documents and bid properly. '+fmt(naira(180000)), hint:'Real work. Real shot.',
         effFn:function(){ return {cash:-naira(180000), skill:{finance:2}, log:['biz','You bought the tender documents and started preparing a bid.','neutral']}; },
         next:1, delay:1},
        {label:'Bid as a subcontractor to a bigger firm.', hint:'Less upside, far less politics.',
         effFn:function(){ return {skill:{network:3}, log:['biz','You approached a larger firm about bidding together. They were open to it.','neutral']}; },
         next:1, delay:1, data:{sub:true}},
        {label:'Do not bother. You know who will win.', hint:'Free. Also certain.',
         effFn:function(){ return {log:['biz','You did not bid. You may have been right. You will never know.','neutral']}; },
         next:'end'}]};
  },
  function(t){
    const sub = t.data && t.data.sub;
    return {cat:'biz', title:'Prequalification',
      text:'Your documents are in. Now comes the part that is not written down. '+(sub?
        'The larger firm says they can "handle the administrative side" for a fee of '+fmt(naira(1500000))+'. They phrase it as consultancy. Everyone phrases it as consultancy.':
        'Somebody from the procuring office calls to "clarify" your submission, and mentions that bids responsive to local considerations tend to score better. The clarification has a price: '+fmt(naira(2200000))+'.'),
      opts:[
        {label:'Pay it.', hint:'This is how it is done here. It is also how people go to prison here.',
         odds:function(){ return 0.62; },
         okEffFn:function(){ return {cash:-naira(sub?1500000:2200000), flag:{paidBribe:true}, log:['biz','You paid. Your bid moved to the shortlist.','warn']}; },
         okText:'The money moved and so did your bid. You are on the shortlist. You have also written down, in your own ledger, what you did.',
         failEffFn:function(){ return {cash:-naira(sub?1500000:2200000), flag:{paidBribe:true}, log:['biz','You paid. The shortlist was published the following week and you are not on it.','bad']}; },
         failText:'You paid and you are not on the shortlist. There is no office to complain to about this.',
         next:'end'},
        {label:'Refuse, and ask for the scoring criteria in writing.', hint:'Slows it down. Creates a record.',
         odds:function(){ return 0.34; },
         okEffFn:function(){ return {rep:5, skill:{finance:3}, log:['biz','You asked for the scoring criteria in writing. Your bid survived evaluation on its merits.','good']}; },
         okText:'It worked, which is rarer than it should be. Your bid scored well enough without money changing hands, and you now have paperwork proving it.',
         failEffFn:function(){ return {log:['biz','You asked for the criteria in writing. Your bid was found non-responsive.','bad']}; },
         failText:'Your bid was found non-responsive on a technicality. You were right and you lost, which is a combination you will meet again.',
         next:'end'},
        {label:'Withdraw the bid and say why, on the record.', hint:'Costs the contract. Buys a reputation.',
         effFn:function(){ return {rep:9, log:['biz','You withdrew and put your reasons in writing. It was read by more people than the bid would have been.','good'],
           flag:{whistleblown:true}}; },
         next:'end'}]};
  }]},

/* ------------------------------------------------------------------- whale */
whale:{ needsBiz:true, title:'The Whale', cast:null, w:1.1, minTurn:8,
  cond:function(s){ return !!s.biz && s.biz.revenue>6000000 && !s.flags.arc_whale; },
  stages:[
  function(t){
    const b = S.biz;
    const order = Math.round(Math.max(4000000, b.revenue*R.range(1.6,2.8)));
    t.data.order = order;
    return {cat:'biz', title:'An order you cannot refuse and cannot fund',
      text:()=>'A buyer wants '+fmt(order)+' of supply. That is roughly '+(order/Math.max(1,b.revenue)).toFixed(1)+' quarters of your entire revenue, in one order, delivered in six weeks. '+
        'You would have to buy the stock before they pay you. Your company has '+fmt(Math.round(b.cash))+'. '+
        'This is the moment every trading business meets: the order that can make the year or end it.',
      opts:[
        {label:'Take it. Borrow to fund the gap.', hint:'A facility against the purchase order.',
         odds:function(){ return clamp(0.30 + S.fin.credit/220 + (S.biz.formal?0.16:0), 0.12, 0.85); },
         okEffFn:function(){ return {bizcash:Math.round(order*0.55), debt:{name:'PO facility', bal:Math.round(order*0.62), rate:0.34, minPay:Math.round(order*0.20), kind:'bank'},
           log:['biz','A bank funded the purchase order at 34% a year. Expensive money that is cheaper than the alternative.','warn']}; },
         okText:'The facility cleared. You bought the stock, you delivered, and you are now in business with a lender who charges by the month.',
         failEffFn:function(){ return {log:['biz','No bank would fund a business your size against an order from a name they did not recognise.','bad']}; },
         failText:'No facility. The bank looked at your size, looked at their name, and declined.',
         next:1, delay:2},
        {label:'Take it, but only as much as your cash can fund.', hint:'Partial delivery. Smaller, survivable.',
         effFn:function(){ const part = Math.round(Math.max(0,b.cash)*1.4);
           return {bizcash:Math.round(part*0.34), bizrep:3, log:['biz','You took as much of the order as your working capital could carry and said so honestly.','good']}; },
         next:1, delay:2, data:{partial:true}},
        {label:'Decline. Explain exactly why.', hint:'Discipline. They may respect it later.',
         effFn:function(){ return {skill:{finance:4}, rep:2, log:['biz','You told them the truth: you could not fund an order that size. They thanked you for being straight.','good']}; },
         next:1, delay:3, data:{declined:true}}]};
  },
  function(t){
    const b = S.biz; const d = t.data||{};
    if(d.declined) return {cat:'biz', title:'The door opens anyway',
      text:'Six months later they call back. The supplier they chose could not deliver, and somebody remembered that you were the one who told them the truth about your own balance sheet. '+
        'They are offering a smaller order with 40% paid up front.',
      opts:[
        {label:'Take it on those terms.', hint:'Smaller, funded, and honest.',
         effFn:function(){ return {bizcash:Math.round(naira(2600000)), bizrep:8, log:['biz','You took the smaller order on funded terms. It is the beginning of a real account.','good']}; }, next:'end'},
        {label:'Ask for 60% up front and a twelve-month contract.', hint:'Negotiate while they need you.',
         odds:function(){ return 0.52; },
         okEffFn:function(){ return {bizcash:Math.round(naira(5200000)), bizrep:10, log:['biz','You asked for 60% up front and a year. They agreed. Asking was the whole trick.','good']}; },
         okText:'They agreed to 60% up front and a twelve-month term. You spent four years learning that this sentence was available.',
         failEffFn:function(){ return {bizcash:Math.round(naira(2600000)), bizrep:3, log:['biz','They countered at 40% and you took it.','neutral']}; },
         failText:'They countered at 40% up front. You took it, which is still a funded order.',
         next:'end'}]};
    return {cat:'biz', title:'The invoice is sixty days old',
      text:'You delivered. Everything was accepted. The invoice has been "in process" for two months, and the person who signed for the goods has stopped answering their phone. '+
        fmt(Math.round(b.recv||0))+' is sitting in their accounts payable, and your suppliers are asking about yours.',
      opts:[
        {label:'Escalate to their finance director, in writing.', hint:'Polite, firm, documented.',
         odds:function(){ return 0.58; },
         okEffFn:function(){ return {bizcash:Math.round(naira(3400000)), skill:{finance:3}, log:['biz','You escalated in writing. Payment arrived in eleven days.','good']}; },
         okText:'A copy to the finance director and the payment run included you. Eleven days.',
         failEffFn:function(){ return {log:['biz','You escalated. It is now "with legal".','bad']}; },
         failText:'It is now "with legal", which is where invoices go to die.',
         next:2, delay:2},
        {label:'Offer a 4% discount for payment this week.', hint:'Buy your own money back.',
         effFn:function(){ return {bizcash:Math.round(naira(3000000)), log:['biz','You discounted your own invoice to get paid. Expensive, immediate, and it worked.','warn']}; },
         next:'end'},
        {label:'Stop supplying until they pay.', hint:'The nuclear option. Sometimes the only one.',
         odds:function(){ return 0.40; },
         okEffFn:function(){ return {bizcash:Math.round(naira(3200000)), bizrep:-4, log:['biz','You stopped supplying. They paid within a week. They did not enjoy it.','good']}; },
         okText:'They paid in six days. The relationship is colder and your bank account is warmer.',
         failEffFn:function(){ return {bizrep:-14, log:['biz','You stopped supplying and they replaced you. The invoice is still unpaid.','bad']}; },
         failText:'They replaced you in a fortnight. You have an unpaid invoice and a former customer.',
         next:'end'}]};
  },
  function(t){
    return {cat:'biz', title:'Settlement, or principle',
      text:'Their legal department has offered 60% of the invoice, settled today, with a confidentiality clause and a continuing supply relationship. '+
        'The other option is two years of litigation with a lawyer who wants a third of whatever you recover.',
      opts:[
        {label:'Take the 60% and the relationship.', hint:'Most of the money, none of the two years.',
         effFn:function(){ return {bizcash:Math.round(naira(2100000)), log:['biz','You settled at 60% and kept the account. It is the correct commercial answer and it still tastes bad.','warn']}; },
         next:'end'},
        {label:'Refuse. Instruct a lawyer.', hint:'Two years. A third of it. A point made.',
         odds:function(){ return 0.45; },
         okEffFn:function(){ return {bizcash:Math.round(naira(4200000)), rep:8, skill:{finance:5}, log:['biz','Two years later you recovered the full amount plus costs. You are the supplier they now pay on time.','good'],
           flag:{litigationWon:true}}; },
         okText:'Two years, four hearings, and you recovered every naira plus costs. Nobody in that industry defaults to you any more.',
         failEffFn:function(){ return {cash:-Math.round(naira(900000)), stress:8, log:['biz','Two years of litigation ended in a settlement worse than the one you refused.','bad']}; },
         failText:'Two years later you settled for less than 60%, having paid a lawyer to get there.',
         next:'end'}]};
  }]},

/* -------------------------------------------------------------- partnerwar */
partnerwar:{ needsBiz:true, title:'The Partnership', cast:null, w:1.0, minTurn:10,
  cond:function(s){ return !!(s.biz && s.biz.partner) && !s.flags.arc_partnerwar; },
  stages:[
  function(t){
    const b = S.biz; const P = b.partner;
    return {cat:'biz', title:P.name+' wants to talk',
      text:'Your partner has asked for a meeting, which is never good news. They have done the arithmetic on what the business is worth now and what their '+
        (100-b.equity)+'% represents, and they would like to "revisit the arrangement". The business turned over '+fmt(b.revenue)+' last quarter. '+
        'Trust between you is currently '+Math.round(P.trust)+'/100.',
      opts:[
        {label:'Give them more equity to keep the peace.', hint:'Cheap now. Sets a price for next time.',
         effFn:function(){ const give = R.int(5,10); widenHolder(S.biz, (S.biz.partner?S.biz.partner.id:null), give);
           if(S.biz.partner) S.biz.partner.trust = clamp(S.biz.partner.trust+14,0,100);
           return {log:['biz','You gave '+P.name+' another '+give+'%. The meeting ended well. The next one will start from here.','warn']}; },
         next:1, delay:3},
        {label:'Offer a clear buyout formula instead.', hint:'Paper now, certainty later.',
         effFn:function(){ if(S.biz.partner) S.biz.partner.trust = clamp(S.biz.partner.trust+6,0,100);
           S.flags.buyoutFormula = true; S.p.skills.finance = clamp(S.p.skills.finance+4,0,100);
           return {log:['biz','You agreed a written buyout formula. Neither of you is happy, which is how you know it is fair.','good']}; },
         next:1, delay:4},
        {label:'Refuse. The agreement is the agreement.', hint:'Correct, and it will cost you.',
         effFn:function(){ if(S.biz.partner) S.biz.partner.trust = clamp(S.biz.partner.trust-22,0,100);
           return {log:['biz','You refused to reopen the agreement. '+P.name+' said they understood. They did not.','warn']}; },
         next:1, delay:2, data:{hard:true}}]};
  },
  function(t){
    const b = S.biz; if(!b || !b.partner) return {cat:'biz', title:'Nothing to resolve', text:'The partnership no longer exists.', opts:[{label:'Understood.', next:'end'}]};
    const P = b.partner; const hard = t.data && t.data.hard;
    const value = Math.round(Math.max(2000000, (b.revenue||0)*1.4 + Math.max(0,b.cash)) * ((100-b.equity)/100));
    return {cat:'biz', title:hard? 'They have lawyered up' : 'They want out',
      text:hard?
        (P.name+' has written to you formally. They allege the business has been run for your benefit and not theirs, and they want either a buyout at '+fmt(value)+' or a court-ordered valuation.'):
        (P.name+' wants to be bought out. They have an offer from someone else, they have a child starting school abroad, and they have named a number: '+fmt(value)+'. '+
         'You do not have that in cash. You could borrow it, or you could find someone who does.'),
      opts:[
        {label:'Borrow and buy them out.', hint:'The business carries the debt. You carry the risk.',
         odds:function(){ return clamp(0.28 + S.fin.credit/230 + (b.formal?0.14:0), 0.1, 0.8); },
         okEffFn:function(){ wipeExternal(S.biz);
           return {debt:{name:'Partner buyout loan', bal:Math.round(value*0.9), rate:0.28, minPay:Math.round(value*0.16), kind:'bank'},
             log:['biz','You borrowed to buy out '+P.name+'. The business is entirely yours and entirely leveraged.','warn'], flag:{boughtOutPartner:true}}; },
         okText:'The loan cleared. You own all of it now, and you owe most of it.',
         failEffFn:function(){ return {log:['biz','No lender would fund a buyout on these numbers.','bad']}; },
         failText:'No lender. Some decisions need money before they need courage.',
         next:'end'},
        {label:'Sell the whole business together.', hint:'Split the proceeds. Walk away with something.',
         odds:function(){ return 0.5; },
         okEffFn:function(){ const tot = Math.round(Math.max(4000000,(b.revenue||0)*2.2 + Math.max(0,b.cash)));
           const mine = Math.round(tot*(b.equity/100));
           S.fin.cash += mine; closeBizSilent();
           return {log:['biz','You sold the business together and split it '+Math.round(b.equity)+'/'+Math.round(100-b.equity)+'. Your share: '+fmt(mine)+'.','good'], flag:{soldBiz:true}}; },
         okText:'It sold. Your share cleared and the business belongs to somebody else now.',
         failEffFn:function(){ return {log:['biz','The sale fell through in diligence. Now you both know the other wants out.','bad']}; },
         failText:'The sale collapsed in diligence. Now you both know.',
         next:'end'},
        {label:'Call their bluff. Let them sue.', hint:'Months of your life. Maybe you win.',
         odds:function(){ return 0.42; },
         okEffFn:function(){ wipeExternal(S.biz);
           return {cash:-Math.round(naira(1400000)), stress:10, rep:3, log:['biz','It went to court and you won. It cost you eighteen months and then it was over.','good'], flag:{suedPartner:true}}; },
         okText:'Eighteen months, a retainer, and you won. You own all of it and you are not sure it was worth the eighteen months.',
         failEffFn:function(){ return {cash:-Math.round(naira(3600000)), stress:16, rep:-8,
           log:['biz','The court found against you. You paid the valuation, the costs, and the eighteen months.','bad']}; },
         failText:'The court valued the business higher than you did. You paid, plus costs, plus a year and a half of your attention.',
         next:'end'}]};
  }]},

/* ------------------------------------------------------------- secondfloor */
secondfloor:{ needsBiz:true, title:'The Second Location', cast:null, w:1.0, minTurn:12,
  cond:function(s){ return !!s.biz && s.biz.locations===1 && (s.biz.revenue||0)>9000000 && !s.flags.arc_secondfloor; },
  stages:[
  function(t){
    const b = S.biz; const T = BIZ.find(function(x){return x.id===b.type;});
    const cost = Math.round((T.rentQ*4 + 6000000) * S.cumInfl);
    t.data.cost = cost;
    return {cat:'biz', title:'A site has come up',
      text:'One location works. The obvious next move is a second. A site has come up in a good position, the agent says there are two other parties, '+
        'and the fit-out plus deposits would be about '+fmt(cost)+'. Your company has '+fmt(Math.round(b.cash))+' in cash. '+
        'The arithmetic that decides this is not the rent. It is whether the first location runs without you.',
      opts:[
        {label:'Take it.', hint:'Growth. Also, twice the fixed cost.',
         effFn:function(){ const c = Math.min(cost, Math.max(0,b.cash)); S.biz.cash -= c; S.biz.locations += 1;
           S.biz.lease.end = Math.max(S.biz.lease.end, S.turn+8); S.biz.capex += Math.round(c*0.5);
           return {log:['biz','You took the second site. Deposits, fit-out, and a signing. '+fmt(c)+' went out of the company.','warn'], stress:6}; },
         next:1, delay:2},
        {label:'Take it, but find a manager first.', hint:'Slower. Correct order of operations.',
         effFn:function(){ S.flags.needsManager = true;
           return {skill:{ops:4}, log:['biz','You decided to hire a manager before signing anything. This is the decision that separates the businesses that scale from the ones that break.','good']}; },
         next:1, delay:3, data:{manager:true}},
        {label:'No. Reinvest in the first location instead.', hint:'Depth before width.',
         effFn:function(){ S.biz.capex += Math.round(cost*0.4); S.biz.cash -= Math.round(cost*0.4);
           S.biz.auto = clamp((S.biz.auto||0)+18,0,100);
           return {log:['biz','You put the money into the location you already have. Capacity went up. Risk did not.','good']}; },
         next:'end'}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    const overrun = Math.round((t.data.cost||0) * R.range(0.28, 0.85));
    const mgr = t.data && t.data.manager;
    return {cat:'biz', title:'The fit-out is over budget and behind',
      text:()=>'It always is. The contractor has found what contractors find, and the overrun is '+fmt(overrun)+'. '+
        (mgr? 'Your new manager is on site every day, which is why you know about it this week rather than next quarter.'
             : 'You are running between two sites and neither of them is getting your full attention.'),
      opts:[
        {label:'Pay the overrun. Get it open.', hint:'Money now or money every month you are closed.',
         odds:function(){ return 0.7; },
         okEffFn:function(){ S.biz.cash -= overrun; S.biz.capex += Math.round(overrun*0.6);
           return {log:['biz','You paid the overrun and opened. The second location is trading.','good']}; },
         okText:'You paid and it opened. Unit two is trading.',
         failEffFn:function(){ S.biz.cash -= Math.round(overrun*1.4);
           return {log:['biz','You paid the overrun and then another one. Opening slipped by a quarter.','bad']}; },
         failText:'You paid, then you paid again. It opened a quarter late.',
         next:2, delay:2},
        {label:'Stop. Take the loss on the deposit and walk.', hint:'Sunk cost is sunk.',
         effFn:function(){ S.biz.cash -= Math.round((t.data.cost||0)*0.22); S.biz.locations = Math.max(1, S.biz.locations-1);
           return {log:['biz','You pulled out and ate the deposit. It is the only business decision you made this year that you would repeat exactly.','neutral'], stress:-4}; },
         next:'end'},
        {label:'Value-engineer it. Open thinner.', hint:'Half the fit-out. Open on time.',
         effFn:function(){ S.biz.cash -= Math.round(overrun*0.4); S.biz.quality = clamp(S.biz.quality-6,0,100);
           return {log:['biz','You cut the fit-out back and opened on time. It looks cheaper, because it is.','warn']}; },
         next:2, delay:2, data:{thin:true}}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    const thin = t.data && t.data.thin;
    const rampBad = R.chance(thin?0.55:0.38);
    return {cat:'biz', title:'Six months in',
      text:'The second location has been open two quarters. '+(rampBad?
        'It is trading at roughly a third of what you modelled, and the manager keeps telling you it needs more time. Meanwhile it consumes cash every month and the first location is subsidising it.'
        :'It is ramping. Slower than the spreadsheet, faster than you feared. Two locations cost more than twice one, but not catastrophically more.'),
      opts:[
        {label:'Give it two more quarters and review.', hint:'Patience, with a date on it.',
         effFn:function(){ S.flags.reviewLoc2 = S.turn+2;
           return {skill:{ops:3}, log:['biz','You gave it two quarters with a review date. Deadlines are what make patience a strategy instead of a hope.','good']}; },
         next:'end'},
        {label:'Close it. Cut the loss.', hint:'Admit it. Move on.',
         effFn:function(){ S.biz.locations = Math.max(1, S.biz.locations-1); S.biz.cash -= Math.round(naira(1800000)); S.biz.rep = clamp(S.biz.rep-4,0,100);
           return {log:['biz','You closed the second location. The staff were paid off and the sign came down.','bad'], stress:-6}; },
         next:'end'},
        {label:'Push harder — discount to build volume.', hint:'Buy the volume. Hope it sticks.',
         odds:function(){ return 0.42; },
         okEffFn:function(){ S.biz.rep = clamp(S.biz.rep+9,0,100); S.biz.brand = (S.biz.brand||0)+Math.round(naira(900000));
           return {log:['biz','You discounted hard for two quarters. The volume came and a third of it stayed.','good']}; },
         okText:'The volume came, and more of it stuck than you expected. You bought a customer base.',
         failEffFn:function(){ S.biz.cash -= Math.round(naira(3200000)); S.biz.rep = clamp(S.biz.rep-5,0,100);
           return {log:['biz','You discounted and trained a customer base to wait for discounts.','bad']}; },
         failText:'You taught that market your product is worth less. That lesson is permanent.',
         next:'end'}]};
  }]},

/* ----------------------------------------------------------------- newline */
newline:{ needsBiz:true, title:'The New Line', cast:null, w:0.9, minTurn:14,
  cond:function(s){ return !!s.biz && !s.flags.arc_newline; },
  stages:[
  function(t){
    return {cat:'biz', title:'What else could we sell?',
      text:'One product line is one bet. Your customers keep asking for something adjacent — you have heard it often enough that it is probably not nothing. '+
        'Developing it properly would take '+fmt(naira(2400000))+' and about two quarters of distraction. Doing it cheaply would take a month and might embarrass you.',
      opts:[
        {label:'Develop it properly. Two quarters, '+fmt(naira(2400000))+'.', hint:'Test it, cost it, then launch.',
         effFn:function(){ return {cash:-naira(2400000), skill:{ops:3}, log:['biz','You committed to developing the new line properly.','neutral']}; },
         next:1, delay:2, data:{proper:true}},
        {label:'Do it fast and cheap.', hint:'Ship it and see. Reputation is the collateral.',
         effFn:function(){ return {cash:-naira(400000), log:['biz','You knocked together a version and put it in front of customers.','neutral']}; },
         next:1, delay:1, data:{cheap:true}},
        {label:'Ask your customers what they actually want first.', hint:'Two weeks. Free. Almost nobody does this.',
         effFn:function(){ S.biz.rep = clamp(S.biz.rep+3,0,100);
           return {skill:{savvy:4}, log:['biz','You asked twenty customers what they wanted and wrote down what they said. Most of it was not what you assumed.','good']}; },
         next:1, delay:1, data:{asked:true}}]};
  },
  function(t){
    const d = t.data||{};
    return {cat:'biz', title:'Launch',
      text:'It is ready, or it is as ready as it is going to be. '+(d.asked?
        'You built what customers asked for, which is a much better position to launch from than having a good idea.'
        : d.proper? 'It cost more and took longer than you said, but it is finished and it is good.'
        : 'It is out there. It is not finished. Customers can tell.'),
      opts:[
        {label:'Launch with a marketing push. '+fmt(naira(1800000))+'.', hint:'Nobody buys what they have not heard of.',
         odds:function(){ return d.asked?0.74 : d.proper?0.62 : 0.34; },
         okEffFn:function(){ S.biz.cash -= naira(1800000); S.biz.products = clamp((S.biz.products||1)+1,1,12);
           S.biz.brand = (S.biz.brand||0)+Math.round(naira(1600000));
           return {log:['biz','The new line launched and it is working. A second product changes what this business is.','good']}; },
         okText:'It is working. You are now a business with two lines, which is a different and more durable thing.',
         failEffFn:function(){ S.biz.cash -= naira(1800000);
           return {log:['biz','You spent on marketing a product the market did not want. It sold, briefly, to people who will not return.','bad']}; },
         failText:'People bought it once. That is the least useful kind of success.',
         next:'end'},
        {label:'Launch quietly to existing customers only.', hint:'Cheap. Learn before you spend.',
         effFn:function(){ S.biz.products = clamp((S.biz.products||1)+1,1,12);
           return {skill:{savvy:2}, log:['biz','You launched quietly to the customers you already have. Slower, cheaper, safer.','good']}; },
         next:'end'},
        {label:'Kill it. The numbers do not work.', hint:'Sunk cost does not care how much you like it.',
         effFn:function(){ return {skill:{finance:3}, log:['biz','You killed the line before launch. This is a skill and most people never learn it.','good']}; },
         next:'end'}]};
  }]},

/* ------------------------------------------------------------------ crunch */
crunch:{ needsBiz:true, title:'The Crunch', cast:'banker', w:1.2, minTurn:8,
  cond:function(s){ return !!s.biz && !s.flags.arc_crunch; },
  stages:[
  function(t){
    const b = S.biz;
    return {cat:'biz', title:'The week everything is due',
      text:'Three things have arrived at once: a supplier who will not deliver without payment on the old account, '+
        'a payroll of '+fmt(Math.round(staffMonthly()*3))+' due on Friday, and a customer who is ninety days behind on '+fmt(Math.round(b.recv||0))+'. '+
        'The company has '+fmt(Math.round(b.cash))+'. This is the quarter that decides whether there is a company. '+
        'Almost every business that ever died died like this — not from a bad idea, from a bad week.',
      opts:[
        {label:'Factor the receivables. Sell the invoices at a discount.', hint:'You get about 70% today instead of 100% later.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ const got = Math.round((b.recv||0)*0.70); S.biz.recv = Math.max(0,(b.recv||0)); S.biz.cash += got;
           return {log:['biz','You factored the receivables: '+fmt(got)+' today instead of more, later. Expensive money that arrived on the right day.','warn']}; },
         okText:'The factor paid 70% within four days. You paid dearly for money you had already earned, and the week was survived.',
         failEffFn:function(){ return {log:['biz','No factor would take invoices from a debtor of that quality.','bad']}; },
         failText:'They looked at who owed you and declined. Your receivable is only as good as the person who owes it.',
         next:1, delay:1},
        {label:'Inject personal money into the company.', hint:'Your savings, into the business, at the worst possible time.',
         effFn:function(){ const amt = Math.round(Math.min(S.fin.cash*0.5, Math.max(naira(1500000), Math.abs(Math.min(0,b.cash))*2)));
           S.fin.cash -= amt; S.biz.cash += amt;
           return {log:['biz','You put '+fmt(amt)+' of your own money into the company to make the week.','warn'], stress:9}; },
         next:1, delay:1, data:{own:true}},
        {label:'Pay suppliers first, staff second, and tell the staff.', hint:'Honest. Costs you people.',
         effFn:function(){ S.biz.staff.forEach(function(x){ x.morale = clamp(x.morale-20,3,100); x.loyalty = clamp(x.loyalty-18,0,100); });
           S.biz.supplierConf = clamp((S.biz.supplierConf||70)+18,0,100);
           return {log:['biz','You paid suppliers and told staff the truth about payroll. Two of them started looking that week.','bad'], stress:12}; },
         next:1, delay:1, data:{staff:true}},
        {label:'Borrow from family. Ask, properly.', hint:'The most expensive money in the world is not measured in interest.',
         effFn:function(){ const amt = Math.round(naira(2000000)); S.fin.cash += amt; S.p.family = clamp(S.p.family-6,0,100);
           return {debt:{name:'Family loan', bal:amt, rate:0, minPay:0, kind:'family'},
             log:['life','You borrowed '+fmt(amt)+' from family to keep the business alive. No interest. Enormous cost.','warn'], stress:8}; },
         next:1, delay:1, data:{family:true}}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    const d = t.data||{};
    return {cat:'biz', title:'The month after',
      text:'The week passed. '+(d.family? 'The family money bought the month, and it is now the first thing anybody thinks about at every gathering.'
        : d.staff? 'You kept the suppliers. Two people left, and the ones who stayed now know exactly how close it was.'
        : d.own? 'Your own money is in the company now, which changes how you feel about every subsequent decision.'
        : 'You got through it on the receivables.')+
        ' The structural question has not gone away: the business sells faster than it collects, and one bad week will come again.',
      opts:[
        {label:'Tighten credit. Cash on delivery for new customers.', hint:'Smaller revenue. Actual money.',
         effFn:function(){ S.biz.creditTerms = clamp((S.biz.creditTerms||0.15)-0.45,0,1);
           return {skill:{finance:5}, log:['biz','You moved new customers to cash on delivery. Revenue dipped and never came back as a problem.','good']}; },
         next:'end'},
        {label:'Raise prices to fund the credit you are giving.', hint:'Price the financing in.',
         effFn:function(){ S.biz.priceIdx = clamp(S.biz.priceIdx*1.12, 0.4, 3);
           return {skill:{savvy:3}, log:['biz','You raised prices to fund the credit terms. Some customers left. The ones who stayed pay.','good']}; },
         next:'end'},
        {label:'Change nothing. It worked out this time.', hint:'It did work out. Once.',
         effFn:function(){ S.flags.creditBlind = true;
           return {log:['biz','You changed nothing. This is the decision that ends most businesses, made on a day when it felt like the reasonable one.','warn']}; },
         next:'end'}]};
  }]},

/* ------------------------------------------------------------------- audit */
audit:{ needsBiz:true, title:'The Assessment', cast:null, w:1.0, minTurn:10,
  cond:function(s){ return !!s.biz && (s.biz.taxRisk||0)>45 && !s.flags.arc_audit; },
  stages:[
  function(t){
    const b = S.biz;
    const bill = Math.round(Math.max(naira(2500000), (b.revenue||0)*R.range(0.10,0.26)));
    t.data.bill = bill;
    return {cat:'biz', title:'A letter with a letterhead',
      text:()=>'An assessment has arrived for '+fmt(bill)+' in back taxes, penalties and interest. Some of it is probably correct. '+
        'All of it is due within thirty days. Your books are '+Math.round(b.compliance||40)+'/100 — that number is about to matter a great deal.',
      opts:[
        {label:'Pay it in full, on time.', hint:'Expensive. Ends immediately.',
         effFn:function(){ S.biz.cash -= bill; S.biz.taxRisk = 0;
           return {log:['biz','You paid the assessment in full. It hurt and it is over.','warn']}; },
         next:'end'},
        {label:'Object formally and provide the records.', hint:'If your books are good, this works.',
         odds:function(){ return clamp(0.12 + (b.compliance||40)/110, 0.08, 0.86); },
         okEffFn:function(){ const cut = Math.round(bill*R.range(0.45,0.8)); S.biz.cash -= bill-cut; S.biz.taxRisk = 12;
           return {log:['biz','You objected with records. The assessment was reduced by '+fmt(cut)+'.','good']}; },
         okText:'Your records held up. The assessment was reduced substantially, because you could prove what you said.',
         failEffFn:function(){ S.biz.cash -= Math.round(bill*1.08);
           return {log:['biz','You objected. They disagreed, and the penalties continued to accrue while you argued.','bad']}; },
         failText:'They rejected the objection and interest kept running. Arguing with a tax authority costs clock time, and the clock charges.',
         next:1, delay:2},
        {label:'Negotiate a settlement and a payment plan.', hint:'Nobody says this out loud. It is usually available.',
         odds:function(){ return 0.66; },
         okEffFn:function(){ const settle = Math.round(bill*0.55);
           return {debt:{name:'Tax settlement', bal:settle, rate:0.14, minPay:Math.round(settle/6), kind:'tax'},
             log:['biz','You negotiated a settlement at '+fmt(settle)+' over six quarters. Nobody advertises this option. It is almost always there.','good']}; },
         okText:'They accepted 55%, payable over six quarters. The option was never in the letter; it was in the room.',
         failEffFn:function(){ return {log:['biz','They would not negotiate. Some offices cannot.','bad']}; },
         failText:'This office will not settle. You will be paying the full assessment.',
         next:1, delay:1},
        {label:'Ignore it and see what happens.', hint:'This is a real option that people really choose.',
         effFn:function(){ S.biz.taxRisk = clamp((S.biz.taxRisk||0)+30,0,100); S.flags.taxDefault = true;
           return {log:['biz','You did not respond. These things do not go away by themselves.','bad']}; },
         next:1, delay:2, data:{ignore:true}}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    if(t.data && t.data.ignore){
      return {cat:'biz', title:'They came for the account',
        text:'An enforcement notice has been served and your bank account has been frozen pending settlement. '+
          'You cannot pay suppliers, you cannot pay staff, and the notice is now a matter of record with your bank.',
        opts:[
          {label:'Settle now, in full, plus costs.', hint:'The bill has grown.',
           effFn:function(){ const tot = Math.round((t.data.bill||0)*1.35); S.biz.cash -= tot; S.biz.taxRisk = 0; S.flags.taxDefault = false;
             return {log:['biz','You settled for '+fmt(tot)+' including costs and got the account released. It cost 35% more than the original letter.','bad'], stress:12}; },
           next:'end'},
          {label:'Borrow to settle it.', hint:'The account must be released today.',
           odds:function(){ return clamp(0.3+S.fin.credit/240,0.1,0.8); },
           okEffFn:function(){ const tot = Math.round((t.data.bill||0)*1.35);
             return {debt:{name:'Emergency tax loan', bal:tot, rate:0.38, minPay:Math.round(tot/4), kind:'bank'}, bizcash:tot,
               log:['biz','You borrowed at 38% to settle the tax and free the account.','warn']}; },
           okText:'The money cleared, the account was released, and you now have a lender charging monthly for the privilege of having ignored a letter.',
           failEffFn:function(){ S.flags.bizFrozen = true; return {log:['biz','No lender would touch a business with a frozen account.','bad']}; },
           failText:'Nobody lends against a frozen account. That is the entire mechanism.',
           next:'end'}]};
    }
    return {cat:'biz', title:'The bill is paid. The problem is not.',
      text:'The assessment is settled. What remains is the reason it was possible: the books were not good enough to defend you. '+
        'This will happen again in about three years unless something structural changes.',
      opts:[
        {label:'Hire a proper accountant.', hint:'A monthly cost. Insurance against this exact day.',
         effFn:function(){ const cost = Math.round(naira(250000)); S.biz.cash -= cost; S.biz.compliance = clamp((S.biz.compliance||40)+34,0,100);
           return {log:['biz','You hired a real accountant for '+fmt(cost)+'/month. The next assessment will be a conversation, not a crisis.','good']}; },
         next:'end'},
        {label:'Formalise the business properly.', hint:'Tax, yes. Also credit, tenders, and a bank that will lend.',
         effFn:function(){ S.biz.formal = true; S.biz.compliance = clamp((S.biz.compliance||40)+28,0,100); S.biz.taxRisk = clamp((S.biz.taxRisk||0)-30,0,100);
           return {log:['biz','You registered the business properly. You will pay tax. You will also now be able to borrow, to tender, and to sleep.','good']}; },
         next:'end'},
        {label:'Do nothing. Hope for a better letter next time.', hint:'There will be a next time.',
         effFn:function(){ S.biz.taxRisk = clamp((S.biz.taxRisk||0)+14,0,100);
           return {log:['biz','You changed nothing. There will be another letter.','warn']}; },
         next:'end'}]};
  }]},

/* ---------------------------------------------------------------- keyperson */
keyperson:{ needsBiz:true, title:'The Right Hand', cast:null, w:1.1, minTurn:12,
  cond:function(s){ return !!s.biz && s.biz.staff.length>=2 && !s.flags.arc_keyperson; },
  stages:[
  function(t){
    const b = S.biz;
    const star = b.staff.slice().sort(function(x,y){ return y.skill-x.skill; })[0];
    if(!star) return {cat:'biz', title:'Nobody indispensable', text:'There is nobody here you could not replace in a fortnight. That is a diagnosis, not a compliment.',
      opts:[{label:'Note it.', next:'end'}]};
    t.data.who = star.id;
    return {cat:'biz', title:star.name+' has been offered something',
      text:()=>'Your best person — '+star.name+', skill '+star.skill+'/10, '+Math.round((S.turn-star.joined)/4)+' years with you — has told you they have an offer. '+
        'It is 45% more than you pay them and it has a car. They have told you before accepting, which means they have not decided. '+
        'Their morale is '+Math.round(star.morale)+' and their loyalty is '+Math.round(star.loyalty)+'.',
      opts:[
        {label:'Counter-offer, hard. Match the package.', hint:'You keep them. You also reset your entire wage bill.',
         odds:function(){ return clamp(0.35 + star.loyalty/180, 0.2, 0.9); },
         okEffFn:function(){ const b2=S.biz; const s2=b2.staff.find(function(x){return x.id===t.data.who;});
           if(s2){ s2.salary = Math.round(s2.salary*1.42); s2.morale = clamp(s2.morale+18,3,100); }
           b2.staff.forEach(function(x){ if(x.id!==t.data.who) x.morale = clamp(x.morale+4,3,100); });
           return {log:['biz','You matched the offer. '+star.name+' stayed, and now everybody knows roughly what it costs to make you move.','warn']}; },
         okText:'They stayed. So did the new salary, permanently, for them and as a benchmark for everyone else.',
         failEffFn:function(){ const b2=S.biz; b2.staff = b2.staff.filter(function(x){ return x.id!==t.data.who; });
           return {log:['biz','You matched it. They left anyway. People who have decided have usually decided.','bad']}; },
         failText:'They took the counter-offer, thought about it for a week, and left. Once someone has an offer in hand, you are negotiating with a decision already made.',
         next:1, delay:2},
        {label:'Give them equity and the title they want.', hint:'No cash. Permanent dilution. Real alignment.',
         odds:function(){ return 0.58; },
         okEffFn:function(){ const b2=S.biz; const s2=b2.staff.find(function(x){return x.id===t.data.who;});
           if(s2){ s2.loyalty = clamp(s2.loyalty+30,0,100); s2.morale = clamp(s2.morale+16,3,100); s2.partner = true; }
           widenHolder(b2, null, 6);
           return {log:['biz','You gave '+star.name+' 6% and the title. They stopped taking calls at lunch.','good'], flag:{gaveEquity:true}}; },
         okText:'Six per cent and a title. They are still here two years later, and they now argue with you about strategy, which is what you actually wanted.',
         failEffFn:function(){ const b2=S.biz; b2.staff = b2.staff.filter(function(x){ return x.id!==t.data.who; });
           return {log:['biz','Equity in a business this size did not compete with a salary and a car.','bad']}; },
         failText:'Six per cent of a business that has never paid a dividend is not a car. They left.',
         next:1, delay:2},
        {label:'Let them go properly. Throw the party.', hint:'Costs a person. Buys you the next one.',
         effFn:function(){ const b2=S.biz; b2.staff = b2.staff.filter(function(x){ return x.id!==t.data.who; });
           b2.staff.forEach(function(x){ x.morale = clamp(x.morale+9,3,100); x.loyalty = clamp(x.loyalty+8,0,100); });
           return {cash:-Math.round(naira(250000)), rep:4,
             log:['biz','You let '+star.name+' go with a party and a genuine speech. Two years later they sent you a client.','good']}; },
         next:1, delay:2, data:{grace:true}},
        {label:'Make them stay by withholding what they are owed.', hint:'You can. For about a month.',
         effFn:function(){ const b2=S.biz; const s2=b2.staff.find(function(x){return x.id===t.data.who;});
           if(s2){ s2.morale = 3; s2.loyalty = 0; }
           b2.staffTrust = clamp((b2.staffTrust||55)-30,0,100);
           b2.staff.forEach(function(x){ if(x.id!==t.data.who){ x.morale = clamp(x.morale-16,3,100); x.loyalty = clamp(x.loyalty-20,0,100); } });
           return {log:['biz','You made it difficult for them to leave. Everyone else watched and updated their opinion of you.','bad'], rep:-6}; },
         next:1, delay:1, data:{hostile:true}}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    const d = t.data||{};
    return {cat:'biz', title:d.hostile? 'The whole team is looking' : d.grace? 'The gap' : 'The replacement',
      text:d.hostile?
        ('It worked for about five weeks. Then two others left in the same fortnight, and the story of how you treated '+t.data.who+' is now known across your sector. '+
         'Recruitment in this market runs on reputation, and yours has changed.')
        : d.grace?
        ('For a quarter you did the work of two people. It was exactly as bad as you expected. Then you worked out that half of what '+t.data.who+' did was undocumented, '+
         'and that is the real finding here.')
        : ('You need to replace them, or restructure around the gap. The instinct is to hire the same person again. The better question is whether the role was right.'),
      opts:[
        {label:'Hire a replacement at the new market rate.', hint:'The market has moved. Your payroll has to as well.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ const b2=S.biz; const c=genCandidate(1); c.salary = Math.round(c.salary*1.3); b2.staff.push(c);
           return {log:['biz','You hired a replacement at the new market rate. Expensive, and it is the new floor.','warn']}; },
         okText:'You found someone. They cost 30% more than the person they replaced and that is simply what the job costs now.',
         failEffFn:function(){ return {log:['biz','Three months of interviews and the role is still open.','bad']}; },
         failText:'Three months of interviews and an empty chair. The work is being done by you, badly, at midnight.',
         next:'end'},
        {label:'Split the role in two and hire two juniors.', hint:'Cheaper in total. More of your time.',
         effFn:function(){ const b2=S.biz; b2.staff.push(genCandidate(0)); b2.staff.push(genCandidate(0));
           return {skill:{ops:5}, log:['biz','You split the role and hired two juniors. Cheaper, and now you are the manager full time.','good']}; },
         next:'end'},
        {label:'Write down everything they did, then decide.', hint:'A week of work that changes what you buy next.',
         effFn:function(){ const b2=S.biz; b2.auto = clamp((b2.auto||0)+10,0,100); S.p.skills.ops = clamp(S.p.skills.ops+6,0,100);
           return {log:['biz','You documented the role before filling it. It turned out a third of it was no longer necessary.','good']}; },
         next:'end'}]};
  }]},

/* ----------------------------------------------------------------- exitsale */
exitsale:{ needsBiz:true, title:'The Exit', cast:null, w:0.9, minTurn:28,
  cond:function(s){ return !!s.biz && (s.biz.revenue||0)>25000000 && !s.flags.arc_exitsale; },
  stages:[
  function(t){
    const b = S.biz;
    const offer = Math.round(Math.max(naira(20000000), (b.revenue||0)*R.range(2.0,3.6) + Math.max(0,b.cash)));
    t.data.offer = offer;
    return {cat:'biz', title:'Somebody wants to buy it',
      text:()=>'A letter of intent has arrived offering '+fmt(offer)+' for the business, subject to due diligence. '+
        'You built this. It is also, right now, the largest single number anyone has ever offered you. '+
        'The gap between those two facts is where people make bad decisions.',
      opts:[
        {label:'Sign the LOI and enter diligence.', hint:'Exclusivity for 60 days. They see everything.',
         effFn:function(){ return {log:['biz','You signed the letter of intent. Sixty days of exclusivity, and they now get to open every cupboard.','neutral']}; },
         next:1, delay:2},
        {label:'Sign, but keep running the business as if it will not happen.', hint:'Most deals do not close.',
         effFn:function(){ return {skill:{finance:4}, log:['biz','You signed and kept operating. Two-thirds of deals at this stage do not close.','good']}; },
         next:1, delay:2, data:{cautious:true}},
        {label:'Refuse. You are not finished with it.', hint:'Sometimes the right answer.',
         effFn:function(){ return {log:['biz','You said no. It is a good offer and you are not selling, which are two different things.','neutral']}; },
         next:'end'},
        {label:'Refuse, but ask them what they would pay for 30%.', hint:'A different conversation entirely.',
         odds:function(){ return 0.48; },
         okEffFn:function(){ const part = Math.round(offer*0.34); S.fin.cash += part; widenHolder(S.biz, null, 30);
           return {log:['biz','They took 30% for '+fmt(part)+'. You kept control and took real money off the table.','good'], flag:{soldStake:true}}; },
         okText:'They bought 30% at a better price per share than the whole-company offer. You kept control and banked '+fmt(Math.round(offer*0.34))+'.',
         failEffFn:function(){ return {log:['biz','They wanted all of it or none of it.','neutral']}; },
         failText:'Buyers who want control rarely want a minority stake. The conversation ended.',
         next:'end'}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    const offer = t.data.offer||0;
    const chip = R.range(0.10, 0.38);
    const adjusted = Math.round(offer*(1-chip));
    return {cat:'biz', title:'Diligence finds things',
      text:'Four weeks of diligence. Their accountants have found: customer concentration, some related-party transactions you had not documented, '+
        'and a tax position they describe as "optimistic". The revised offer is '+fmt(adjusted)+', down '+Math.round(chip*100)+'%. '+
        'This is not bad faith. This is what diligence is for.',
      opts:[
        {label:'Accept the revised price.', hint:'Less than promised. Still a very large number.',
         effFn:function(){ const mine = Math.round(adjusted*(b.equity/100)); S.fin.cash += mine; closeBizSilent();
           return {log:['biz','You accepted '+fmt(adjusted)+'. Your share after the partners: '+fmt(mine)+'.','good'], flag:{soldBiz:true, exitedWell:true}}; },
         next:'end'},
        {label:'Negotiate: hold the price, accept an earn-out on the rest.', hint:'You get paid twice if it keeps performing.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ const upfront = Math.round(adjusted*0.65*(b.equity/100));
           const earnout = Math.round(adjusted*0.55*(b.equity/100));
           S.fin.cash += upfront; closeBizSilent(); S.flags.earnout = earnout;
           return {log:['biz','You took '+fmt(upfront)+' up front with an earn-out of '+fmt(earnout)+' over two years.','good'], flag:{soldBiz:true, earnout:true}}; },
         okText:'You kept most of the headline number by betting on your own business continuing to perform. '+fmt(Math.round(adjusted*0.65*(b.equity/100)))+' now.',
         failEffFn:function(){ const mine = Math.round(adjusted*0.85*(b.equity/100)); S.fin.cash += mine; closeBizSilent();
           return {log:['biz','They would not do an earn-out. You settled slightly below the revised number.','warn'], flag:{soldBiz:true}}; },
         failText:'They refused the earn-out and you settled a little below. You lost the argument and most of the money.',
         next:'end'},
        {label:'Walk away.', hint:'You still have a business, and now you know what it is worth.',
         effFn:function(){ return {rep:3, skill:{finance:5}, log:['biz','You walked away from the sale. You now know what the business is worth and what a buyer looks for.','good']}; },
         next:2, delay:3}]};
  },
  function(t){
    return {cat:'biz', title:'A year after you said no',
      text:'The buyer has gone away. What is left is a business you now understand differently, because somebody priced it. '+
        'They marked down customer concentration and the tax position. Both of those are fixable, and you have had a year.',
      opts:[
        {label:'Fix exactly what they marked down, then go back to market.', hint:'Sell the same business for more in three years.',
         effFn:function(){ const b=S.biz; if(b){ b.compliance = clamp((b.compliance||40)+22,0,100); b.taxRisk = clamp((b.taxRisk||0)-35,0,100); }
           return {skill:{finance:6}, log:['biz','You spent a year fixing precisely what the buyer discounted.','good']}; },
         next:'end'},
        {label:'Stop trying to sell. Run it for income instead.', hint:'A business that pays you every quarter is also an exit.',
         effFn:function(){ const b=S.biz; if(b) b.draw = Math.round(Math.max(naira(1500000), (b.revenue||0)*0.12));
           return {log:['biz','You stopped treating it as something to sell and started taking an owner\'s draw.','good']}; },
         next:'end'}]};
  }]},

/* ----------------------------------------------------------------- disaster */
disaster:{ needsBiz:true, title:'The Night It Happened', cast:null, w:0.9, minTurn:8,
  cond:function(s){ return !!s.biz && !s.flags.arc_disaster; },
  stages:[
  function(t){
    const b = S.biz; const T = BIZ.find(function(x){return x.id===b.type;});
    const kinds = [
      {k:'fire',   n:'a fire',        loss:0.62, line:'It started in the unit next door at about four in the morning and it did not stop at the wall.'},
      {k:'flood',  n:'a flood',       loss:0.48, line:'Eleven days of rain. The drainage gave up on the third day and the water came in under the shutter.'},
      {k:'theft',  n:'a burglary',    loss:0.34, line:'They had keys, or somebody did. Stock, the till, and the generator.'},
      {k:'accident',n:'an accident',  loss:0.40, line:'A delivery vehicle, a pedestrian, and a crowd that formed very quickly.'}
    ];
    const K = R.pick(kinds);
    const loss = Math.round(Math.max(naira(1500000), (b.capex||0)*K.loss*R.range(0.6,1.3) + (b.inventory||0)*K.loss));
    t.data.loss = loss; t.data.kind = K.k;
    return {cat:'biz', title:'There has been '+K.n,
      text:K.line+' The damage is roughly '+fmt(loss)+' of equipment and stock. '+
        (b.insured? 'You are insured. That is about to matter enormously.' : 'You are not insured. You meant to arrange it. Everybody means to.'),
      opts:[
        {label:'File the insurance claim immediately, with photographs.', hint:'If you are insured, this is the whole point.',
         odds:function(){ return b.insured?0.78:0.12; },
         okEffFn:function(){ const payout = Math.round(loss*R.range(0.55,0.85)); S.biz.cash += payout;
           return {log:['biz','The claim paid '+fmt(payout)+'. Eleven weeks of waiting, and then it paid.','good']}; },
         okText:'Eleven weeks, three loss adjusters, and a cheque for '+fmt(Math.round(loss*0.7))+'. Being insured felt expensive every year until this one.',
         failEffFn:function(){ S.biz.cash -= loss;
           return {log:['biz','The claim was repudiated. The policy required a fire extinguisher service record nobody could produce.','bad']}; },
         failText:'Repudiated. The policy required an annual extinguisher service certificate, and there is no certificate. That is the entire claim.',
         next:1, delay:1},
        {label:'Absorb it and reopen as fast as possible.', hint:'Speed over completeness. Cash over process.',
         effFn:function(){ S.biz.cash -= loss; S.biz.capex = Math.round((S.biz.capex||0)*0.45);
           return {log:['biz','You absorbed '+fmt(loss)+' and reopened in three weeks.','warn'], stress:12}; },
         next:1, delay:1},
        {label:'Use it as cover to close quietly.', hint:'The business was already struggling. This is a face-saving door.',
         effFn:function(){ const sal = Math.max(0, Math.round(S.biz.cash*0.6)); S.fin.cash += sal;
           S.flags.closedInDisaster = true; S.biz = null;
           return {log:['biz','You did not reopen. People were kind about it, and some of them worked out why.','bad'], stress:-6}; },
         next:'end'}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    return {cat:'biz', title:'Reopening',
      text:'The doors are open again. Now the question is insurance, which is a product you buy with money you resent spending, '+
        'every year, forever, so that one bad night is survivable.',
      opts:[
        {label:'Insure properly. Full cover, every year, whatever it costs.', hint:'A permanent cost. A permanent answer.',
         effFn:function(){ const prem = Math.round(Math.max(naira(180000), (b.revenue||0)*0.012)); S.biz.cash -= prem; S.biz.insured = true;
           return {log:['biz','You insured the business properly for '+fmt(prem)+' a quarter. It is the least interesting decision here and the most important.','good']}; },
         next:'end'},
        {label:'Insure only the building and equipment, not the stock.', hint:'Cheaper. Leaves the biggest exposure open.',
         effFn:function(){ const prem = Math.round(Math.max(naira(90000), (b.revenue||0)*0.005)); S.biz.cash -= prem; S.biz.insured = 'partial';
           return {log:['biz','You insured the premises but not the stock. Half a policy is a policy that will disappoint you.','warn']}; },
         next:'end'},
        {label:'Self-insure. Keep a reserve instead.', hint:'Discipline instead of premium. Works if you are disciplined.',
         effFn:function(){ S.biz.insured = false; S.flags.selfInsure = true;
           return {skill:{finance:4}, log:['biz','You decided to hold a reserve instead of paying premium. This works for exactly the kind of person who actually builds the reserve.','warn']}; },
         next:'end'}]};
  }]},

/* ------------------------------------------------------------------- export */
export:{ needsBiz:true, title:'The Export Order', cast:null, w:0.8, minTurn:16,
  cond:function(s){ return !!s.biz && (s.biz.revenue||0)>15000000 && !s.flags.arc_export; },
  stages:[
  function(t){
    const b = S.biz;
    const usd = R.int(40, 160);
    t.data.usd = usd;
    return {cat:'biz', title:'An order from outside the country',
      text:'A buyer abroad wants '+usd+' thousand dollars of product. Paid in foreign currency, which is the entire appeal. '+
        'The complications: a letter of credit you have never used, a shipping line you do not have an account with, '+
        'customs documentation that will be judged by someone having a bad day, and a currency that may or may not still be where it is today.',
      opts:[
        {label:'Take it. Learn the paperwork as you go.', hint:'Real margin. Real chance of a container sitting at the port.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ const ngn = Math.round(usd*1000*S.mkt.usd*0.82); S.biz.cash += ngn; S.biz.rep = clamp(S.biz.rep+7,0,100);
           return {log:['biz','The export order shipped and paid. '+fmt(ngn)+' in hard currency, converted.','good'], flag:{exporter:true}}; },
         okText:'It shipped, it cleared, it paid. You are now, technically, an exporter — and you know what the documents are.',
         failEffFn:function(){ S.biz.cash -= Math.round(naira(3200000));
           return {log:['biz','The container sat at the port for seven weeks over a classification dispute. The buyer cancelled.','bad']}; },
         failText:'Seven weeks at the port over a tariff classification. The buyer cancelled and the goods came back.',
         next:1, delay:2},
        {label:'Take it, but pay an agent to handle customs and shipping.', hint:'A cut of the margin. Most of the risk removed.',
         odds:function(){ return 0.78; },
         okEffFn:function(){ const ngn = Math.round(usd*1000*S.mkt.usd*0.62); S.biz.cash += ngn;
           return {log:['biz','You used a freight agent. They took a third and earned it. '+fmt(ngn)+' landed.','good'], flag:{exporter:true, usesAgent:true}}; },
         okText:'The agent took a third of the margin and saved you a container. That is the best trade available in this industry.',
         failEffFn:function(){ S.biz.cash -= Math.round(naira(900000));
           return {log:['biz','The agent was not as good as their references.','bad']}; },
         failText:'The agent lost the container for eleven days and then blamed the port. Some of that was true.',
         next:1, delay:2},
        {label:'Decline. Domestic demand is enough.', hint:'The safe answer, and a real one.',
         effFn:function(){ return {log:['biz','You stayed domestic. Less margin, fewer ways to lose a container.','neutral']}; },
         next:'end'}]};
  },
  function(t){
    return {cat:'biz', title:'Hard currency, soft currency',
      text:'The money has arrived in dollars. Now you have a decision that most people never think they will get to make: '+
        'convert it, or hold it. The naira has moved '+pct(Math.max(0.0001,Math.abs(S.mkt.usd/(S.mkt.usdStart||S.mkt.usd)-1)),0)+' since you started.',
      opts:[
        {label:'Convert all of it now. Fund the business.', hint:'Certainty. You know what you have.',
         effFn:function(){ const ngn = Math.round((t.data.usd||0)*1000*S.mkt.usd*0.4); S.biz.cash += ngn;
           return {log:['biz','You converted and funded operations. Boring and correct.','good']}; },
         next:'end'},
        {label:'Convert 60%, keep 40% in dollars.', hint:'Hedge without having a view.',
         effFn:function(){ const ngn = Math.round((t.data.usd||0)*1000*S.mkt.usd*0.24); S.biz.cash += ngn; S.fin.usdCash += Math.round((t.data.usd||0)*400);
           return {log:['biz','You converted 60% and held 40% in dollars. You are not betting; you are refusing to bet.','good'], skill:{finance:3}}; },
         next:'end'},
        {label:'Keep all of it in dollars. The currency is going one way.', hint:'A view. Views are how people lose money confidently.',
         odds:function(){ return 0.5; },
         okEffFn:function(){ S.fin.usdCash += Math.round((t.data.usd||0)*1000*1.35);
           return {log:['biz','You held it all in dollars and the currency moved your way. You were right, and you were also lucky.','good'], skill:{finance:2}}; },
         okText:'It moved your way. You were right. Being right and being skilful are different, and the market does not care which one you were.',
         failEffFn:function(){ S.fin.usdCash += Math.round((t.data.usd||0)*1000*0.8);
           return {log:['biz','You held it in dollars and the currency went the other way.','warn']}; },
         failText:'It went the other way. You still have the dollars; you just have less business than you thought.',
         next:'end'}]};
  }]},

/* ---------------------------------------------------------------- formalise */
formalise:{ needsBiz:true, title:'Going Proper', cast:null, w:1.0, minTurn:10,
  cond:function(s){ return !!s.biz && !s.biz.formal && !s.flags.arc_formalise; },
  stages:[
  function(t){
    const b = S.biz;
    const cost = Math.round(naira(950000));
    return {cat:'biz', title:'Registering the business properly',
      text:'You are trading informally, which has been a genuine advantage: no filings, no assessments, no inspections. '+
        'It is also a ceiling. You cannot tender, you cannot borrow from a bank, you cannot sign a lease with a serious landlord, '+
        'and you cannot sell the business to anyone who does their homework. Registering costs about '+fmt(cost)+' and opens all of those doors, '+
        'including the one marked "tax".',
      opts:[
        {label:'Register. '+fmt(cost)+'.', hint:'Costs money once, and money every quarter after.',
         effFn:function(){ S.biz.formal = true; S.biz.compliance = clamp((S.biz.compliance||40)+20,0,100);
           S.fin.cash -= cost; S.fin.credit = clamp(S.fin.credit+9,0,100);
           return {log:['biz','You registered the company properly. You can now borrow, tender and sign things. You can also now be assessed.','good']}; },
         next:1, delay:3},
        {label:'Register and engage an accountant from day one.', hint:'More expensive. Considerably safer.',
         effFn:function(){ S.biz.formal = true; S.biz.compliance = clamp((S.biz.compliance||40)+40,0,100);
           S.fin.cash -= Math.round(cost*1.9); S.fin.credit = clamp(S.fin.credit+12,0,100);
           return {log:['biz','You registered with an accountant attached from the start. It is the version of this decision you will not regret.','good']}; },
         next:1, delay:3, data:{acct:true}},
        {label:'Stay informal. It is working.', hint:'True, right up until the day it is not.',
         effFn:function(){ S.biz.taxRisk = clamp((S.biz.taxRisk||0)+10,0,100);
           return {log:['biz','You stayed informal. It will keep working until the quarter it does not.','warn']}; },
         next:'end'}]};
  },
  function(t){
    const b = S.biz; if(!b) return null;
    return {cat:'biz', title:'The first year as a real company',
      text:'You are now on a register. The first thing that changes is not tax — it is that a bank will answer the phone. '+
        'You have been offered a working-capital facility against your receivables, at a rate that is high and a process that works.',
      opts:[
        {label:'Take the facility against receivables.', hint:'Growth capital, secured on what customers owe you.',
         odds:function(){ return clamp(0.4 + S.fin.credit/200, 0.2, 0.9); },
         okEffFn:function(){ const amt = Math.round(Math.max(naira(3000000), (S.biz.recv||0)*0.6 + (S.biz.revenue||0)*0.15));
           return {bizcash:amt, debt:{name:'Working capital facility', bal:amt, rate:0.26, minPay:Math.round(amt/4), kind:'bank'},
             log:['biz','You drew a working-capital facility of '+fmt(amt)+'. Being formal is what made that phone call possible.','good']}; },
         okText:'The facility cleared: '+fmt(Math.round(Math.max(naira(3000000), (S.biz.recv||0)*0.6 + (S.biz.revenue||0)*0.15)))+'. This is precisely what registration buys.',
         failEffFn:function(){ return {log:['biz','Registered, but still too small and too new for their credit committee.','bad']}; },
         failText:'Registered is necessary and not sufficient. They want two years of audited accounts.',
         next:'end'},
        {label:'Decline. Grow on retained earnings only.', hint:'Slower. You keep all of it.',
         effFn:function(){ return {skill:{finance:3}, log:['biz','You declined the facility and grew on retained earnings. Slower and entirely yours.','good']}; },
         next:'end'},
        {label:'Use the structure to bid for a government contract.', hint:'The reason most people register at all.',
         odds:function(){ return 0.45; },
         okEffFn:function(){ const amt = Math.round(Math.max(naira(6000000), (S.biz.revenue||0)*0.9));
           S.biz.contracts = (S.biz.contracts||[]).concat([{id:'cn'+(++S.seq), kind:'framework', kindName:'Framework agreement', client:'a government agency', turns:6, value:Math.round(amt*0.09), margin:0.22, payDays:60, risk:0.16, renewals:0, incidents:[], bonus:0.16}]);
           return {bizcash:Math.round(amt*0.3), bizrep:8, log:['biz','You won a government supply contract. Informal businesses cannot even apply.','good'], flag:{govContract:true}}; },
         okText:'You won it. Six quarters of contracted volume, at a price you would not accept from a private customer.',
         failEffFn:function(){ return {log:['biz','You bid and lost. The process worked, which is itself information.','neutral']}; },
         failText:'You lost the bid. You were allowed to bid, which you were not last year.',
         next:'end'}]};
  }]},

/* ------------------------------------------------------------------- supply */
supply:{ needsBiz:true, title:'The Input', cast:'supplier', w:1.0, minTurn:10,
  cond:function(s){ return !!s.biz && !s.flags.arc_supply; },
  stages:[
  function(t){
    const b = S.biz; const T = BIZ.find(function(x){return x.id===b.type;});
    const rise = R.range(0.35, 1.1);
    t.data.rise = rise;
    return {cat:'biz', title:'Your main input has gone up '+Math.round(rise*100)+'%',
      text:'The currency moved, or the port is slow, or there is a new levy. It does not really matter which. '+
        'What matters is that the thing you buy to make the thing you sell now costs '+Math.round(rise*100)+'% more than it did last quarter, '+
        'and your customers have not had a pay rise.',
      opts:[
        {label:'Pass it straight through. Raise prices tomorrow.', hint:'Honest. You will lose volume.',
         effFn:function(){ S.biz.priceIdx = clamp(S.biz.priceIdx*(1+rise*0.8), 0.4, 3);
           return {log:['biz','You passed the increase through in full. Volume fell, margin held.','warn']}; },
         next:1, delay:2, data:{passed:true}},
        {label:'Absorb it. Hold your prices.', hint:'Buys loyalty. Costs margin, every quarter, indefinitely.',
         effFn:function(){ S.biz.cash -= Math.round((b.revenue||0)*rise*0.28);
           return {log:['biz','You absorbed the increase. Your customers never knew, which is the problem with absorbing things.','warn']}; },
         next:1, delay:2, data:{absorbed:true}},
        {label:'Pass half through and reformulate to use less of it.', hint:'Two levers instead of one.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ S.biz.priceIdx = clamp(S.biz.priceIdx*(1+rise*0.4), 0.4, 3); S.biz.auto = clamp((S.biz.auto||0)+8,0,100);
           return {skill:{ops:5}, log:['biz','You half-passed the increase and reworked the product to use less of the input. That is engineering, and it is worth more than the price rise.','good']}; },
         okText:'You raised prices by half the increase and re-engineered out the rest. The second half of that sentence is the durable part.',
         failEffFn:function(){ S.biz.priceIdx = clamp(S.biz.priceIdx*(1+rise*0.4), 0.4, 3); S.biz.quality = clamp(S.biz.quality-7,0,100);
           return {log:['biz','The reformulation did not hold up. Quality slipped.','bad']}; },
         failText:'The cheaper formulation does not survive contact with customers. You raised prices and reduced quality, which is the worst combination.',
         next:1, delay:2},
        {label:'Buy six months of stock now, before it goes further.', hint:'A bet on the currency. Uses all your cash.',
         odds:function(){ return 0.48; },
         okEffFn:function(){ S.biz.inventory = (S.biz.inventory||0) + Math.round((b.revenue||0)*0.9); S.biz.cash -= Math.round((b.revenue||0)*0.55);
           return {log:['biz','You bought ahead of the increase. It kept going up and you looked like a genius for two quarters.','good'], skill:{savvy:3}}; },
         okText:'It kept rising for three more quarters. You bought at the old price and everyone else did not.',
         failEffFn:function(){ S.biz.inventory = (S.biz.inventory||0) + Math.round((b.revenue||0)*0.9); S.biz.cash -= Math.round((b.revenue||0)*0.55);
           return {log:['biz','You bought six months of stock at the peak. The price came back down.','bad']}; },
         failText:'You bought at the top. The price normalised and you are sitting on six months of expensive inventory and no cash.',
         next:1, delay:2}]};
  },
  function(t){
    const d = t.data||{};
    return {cat:'biz', title:'The quarter after',
      text:(d.passed? 'You passed it through. Volume is down but the business still makes money per unit, which is the only thing that is actually optional here.'
        : d.absorbed? 'You absorbed it. Your margin is now thinner than it has ever been, and nothing in the market suggests this input is going back down.'
        : 'The dust has settled on the input price. The structural lesson is about concentration, not cost.'),
      opts:[
        {label:'Find a second supplier, even at worse terms.', hint:'Concentration is the real risk, not price.',
         effFn:function(){ S.biz.supplierConf = clamp((S.biz.supplierConf||70)+6,0,100);
           return {skill:{ops:4}, log:['biz','You qualified a second supplier at slightly worse terms. Single-supplier businesses are one phone call from stopping.','good']}; },
         next:'end'},
        {label:'Negotiate an annual price with the existing supplier.', hint:'Certainty both ways.',
         odds:function(){ return 0.62; },
         okEffFn:function(){ return {bizcash:Math.round(naira(1200000)), log:['biz','You locked an annual price. Lower than spot, and now predictable.','good']}; },
         okText:'They agreed to twelve months fixed. It is above the old price and below the new one, and you can now plan.',
         failEffFn:function(){ return {log:['biz','They will not fix a price in this currency for twelve months.','neutral']}; },
         failText:'They will not commit for a year in this currency. Understandable.',
         next:'end'},
        {label:'Do nothing further.', hint:'Some quarters you just absorb and move on.',
         effFn:function(){ return {log:['biz','You moved on. Input shocks are a cost of operating here, not an emergency.','neutral']}; },
         next:'end'}]};
  }]},

/* -------------------------------------------------------------------- fraud */
fraud:{ needsBiz:true, title:'The Shortfall', cast:null, w:0.9, minTurn:14,
  cond:function(s){ return !!s.biz && s.biz.staff.length>=2 && (s.biz.revenue||0)>8000000 && !s.flags.arc_fraud; },
  stages:[
  function(t){
    const b = S.biz;
    const amt = Math.round(Math.max(naira(900000), (b.revenue||0)*R.range(0.04,0.14)));
    t.data.amt = amt;
    return {cat:'biz', title:'The numbers do not add up',
      text:'You counted the stock yourself on a Sunday, which is the only way anybody ever finds this. '+
        'About '+fmt(amt)+' has gone over the last year, and it did not walk out of the front door by accident. '+
        'Somebody who works here has been taking it, and they have been doing it for long enough to be comfortable.',
      opts:[
        {label:'Investigate quietly. Put controls in first, then find out who.', hint:'The order matters. Controls are the durable part.',
         effFn:function(){ S.biz.auto = clamp((S.biz.auto||0)+12,0,100); S.p.skills.finance = clamp(S.p.skills.finance+5,0,100);
           S.biz.shrinkQ = 0;
           return {cash:-Math.round(naira(400000)), log:['biz','You put in stock controls before you went looking for a thief. Fixing the hole matters more than catching the hand.','good']}; },
         next:1, delay:2},
        {label:'Confront the whole team. Let everyone know you know.', hint:'Often stops it. Always changes the room.',
         effFn:function(){ S.biz.staff.forEach(function(x){ x.morale = clamp(x.morale-12,3,100); });
           S.biz.staffTrust = clamp((S.biz.staffTrust||55)-10,0,100);
           return {log:['biz','You told everyone what you had found. The theft stopped. So did something else.','warn']}; },
         next:1, delay:2, data:{blunt:true}},
        {label:'Dismiss the person you suspect on the spot.', hint:'Fast. Illegal if you are wrong.',
         odds:function(){ return 0.55; },
         okEffFn:function(){ const b2=S.biz; if(b2.staff.length){ const gone=b2.staff[b2.staff.length-1]; b2.staff.pop();
             b2.staff.forEach(function(x){ x.loyalty = clamp(x.loyalty+8,0,100); }); }
           return {log:['biz','You dismissed the person you suspected. It was the right one. The team exhaled.','good']}; },
         okText:'It was the right person. The rest of the team had known for months and were relieved somebody finally did something.',
         failEffFn:function(){ const b2=S.biz; if(b2.staff.length){ b2.staff.pop(); }
           b2.staff.forEach(function(x){ x.morale = clamp(x.morale-22,3,100); x.loyalty = clamp(x.loyalty-25,0,100); });
           return {cash:-Math.round(naira(1800000)), rep:-5, log:['biz','You dismissed the wrong person. They took you to tribunal and won.','bad']}; },
         failText:'It was the wrong person. Unfair dismissal, a settlement, and a team that now knows you guess.',
         next:1, delay:2, data:{wrong:true}},
        {label:'Say nothing. Tighten the till quietly and move on.', hint:'Cheapest. Teaches nothing.',
         effFn:function(){ S.biz.staffTrust = clamp((S.biz.staffTrust||55)-6,0,100);
           return {log:['biz','You said nothing and tightened the process. The stealing stopped. Nobody learned anything.','neutral']}; },
         next:'end'}]};
  },
  function(t){
    const d = t.data||{};
    return {cat:'biz', title:'A quarter later',
      text:(d.wrong? 'The atmosphere has not recovered. People are careful around you now in a way that is not useful.'
        : d.blunt? 'The money stopped going missing. Two good people left anyway.'
        : 'The controls are working. The interesting finding is how much was going out through ordinary sloppiness rather than theft.'),
      opts:[
        {label:'Pay for a proper stock system and two-person counts.', hint:'Boring infrastructure. Permanent fix.',
         effFn:function(){ S.biz.cash -= Math.round(naira(700000)); S.biz.auto = clamp((S.biz.auto||0)+14,0,100);
           return {log:['biz','You installed a real stock system with two-person counts. Shrinkage is now a number on a page instead of a surprise.','good']}; },
         next:'end'},
        {label:'Pay people better and say why, out loud.', hint:'Theft is frequently a wage dispute with extra steps.',
         effFn:function(){ S.biz.staff.forEach(function(x){ x.salary = Math.round(x.salary*1.12); x.morale = clamp(x.morale+18,3,100); x.loyalty = clamp(x.loyalty+16,0,100); });
           S.biz.staffTrust = clamp((S.biz.staffTrust||55)+18,0,100);
           return {log:['biz','You raised wages 12% and told them exactly why. Shrinkage fell by more than the raise cost.','good'], skill:{ops:4}}; },
         next:'end'},
        {label:'Move on. It was never that much money.', hint:'It was, over a decade.',
         effFn:function(){ return {log:['biz','You moved on. Over ten years, that leak would have been a second location.','neutral']}; },
         next:'end'}]};
  }]},

/* ---------------------------------------------------------------- succession */
succession:{ needsBiz:true, title:'Who Runs It', cast:null, w:0.9, minTurn:40,
  cond:function(s){ return !!s.biz && s.p.age>=45 && (s.biz.revenue||0)>20000000 && !s.flags.arc_succession; },
  stages:[
  function(t){
    const b = S.biz;
    return {cat:'biz', title:'The business cannot run on you forever',
      text:()=>'You are '+S.p.age+'. The business works, and a worrying amount of what makes it work is you personally: '+
        'the supplier relationships, the pricing decisions, the two customers who only deal with you. '+
        'If you were ill for six months, this would not survive it. That is not a brag. It is a defect.',
      opts:[
        {label:'Hire a general manager and actually let them manage.', hint:'Expensive. The only real test of whether you mean it.',
         odds:function(){ return 0.6; },
         okEffFn:function(){ const c = genCandidate(2); c.salary = Math.round(c.salary*2.1); S.biz.staff.push(c);
           S.biz.auto = clamp((S.biz.auto||0)+12,0,100);
           return {log:['biz','You hired a general manager and, harder, let them make decisions. The business is now an asset rather than a job.','good'], flag:{hasGM:true}}; },
         okText:'You hired well and then did the difficult part: you let them decide things badly for a while, without intervening.',
         failEffFn:function(){ return {cash:-Math.round(naira(2200000)), log:['biz','You hired a manager and then overruled them on everything. They lasted seven months.','bad']}; },
         failText:'You hired a manager and then could not stop managing. They left in seven months, and everyone now knows the job is not real.',
         next:1, delay:3},
        {label:'Promote from inside and train them properly.', hint:'Slower. They know the customers already.',
         effFn:function(){ const c = genCandidate(0); c.salary = Math.round(c.salary*1.5); S.biz.staff.push(c);
           S.biz.staffTrust = clamp((S.biz.staffTrust||55)+14,0,100);
           return {log:['biz','You promoted from inside. They already know every customer by name, which is worth more than the CV you did not hire.','good'], flag:{hasGM:true}}; },
         next:1, delay:3},
        {label:'Document everything instead. Systems, not people.', hint:'Makes the business saleable, not just survivable.',
         effFn:function(){ S.biz.auto = clamp((S.biz.auto||0)+22,0,100); S.biz.compliance = clamp((S.biz.compliance||40)+14,0,100);
           return {skill:{ops:6}, log:['biz','You wrote the business down: suppliers, pricing rules, customer terms. It is now a thing that exists separately from you.','good']}; },
         next:1, delay:3, data:{systems:true}},
        {label:'Start handing it to family.', hint:'Usually how this actually goes.',
         effFn:function(){ S.flags.familySuccession = true; S.p.family = clamp(S.p.family+6,0,100);
           return {log:['biz','You began handing the business to family. Some of them want it. You have not asked all of them.','warn']}; },
         next:1, delay:4, data:{family:true}}]};
  },
  function(t){
    const d = t.data||{};
    return {cat:'biz', title:'Two years on',
      text:(d.family? 'The family member running it is competent and not interested in the parts you cared about. It is working, differently.'
        : d.systems? 'The business now runs on documents rather than on your memory. You took a month off and it did not notice.'
        : 'Somebody else is making the daily decisions. Some of them are worse than yours. Most of them are fine.'),
      opts:[
        {label:'Step back properly. Take a draw, not a salary.', hint:'The point of the whole exercise.',
         effFn:function(){ const b=S.biz; if(b) b.draw = Math.round(Math.max(naira(2500000), (b.revenue||0)*0.14));
           S.p.stress = clamp(S.p.stress-12,0,100); S.p.happy = clamp(S.p.happy+8,0,100);
           return {log:['biz','You stepped back and started taking an owner\'s draw instead of a manager\'s salary. This was always the goal.','good']}; },
         next:'end'},
        {label:'Stay involved, but only on strategy.', hint:'Half a step. Often where people actually land.',
         effFn:function(){ return {log:['biz','You stayed on strategy and out of operations. It works, mostly.','neutral']}; },
         next:'end'},
        {label:'Take it back. They are not doing it right.', hint:'You will. Many people do.',
         effFn:function(){ const b=S.biz; if(b) b.staff.forEach(function(x){ x.morale = clamp(x.morale-16,3,100); });
           S.p.stress = clamp(S.p.stress+10,0,100);
           return {log:['biz','You took it back. It is being done your way again, which is the problem.','warn']}; },
         next:'end'}]};
  }]},

};
