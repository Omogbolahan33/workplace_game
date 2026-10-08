/*
  CAREER — from 02-derived-state-personal-finance-career.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface CAREERShape {
  id: string;
  label: string;
  cost: number;
  hours?: number;
  borrow?: boolean;
  hint: string;
  can: ((a0: any) => any) | (() => boolean) | boolean | ((a0: any) => boolean) | any;
  run: (() => any);
  odds?: ((a0: any) => any);
}

const CAREER: CAREERShape[] = [
  {id:'grind', label:'Work late, deliver hard', cost:0, hours:52, borrow:true,
   hint:'Four extra hours a week, every week, for a whole quarter. It works, and then it stops working. The second lot of late nights in one quarter buys far less than the first.',
   can:s=>!!s.p.job,
   run:()=>{
     const f = repeatFactor('grind');
     const debt = spendHours(52, true);
     const gain = R.range(6,13) * f;
     S.p.jobPerf=clamp(S.p.jobPerf+gain,0,99);
     S.p.stress=clamp(S.p.stress+R.range(5,10)*(0.6+0.6*f)+debt*0.05,0,100);
     S.p.skills.ops=clamp(S.p.skills.ops+R.range(0.6,1.6)*f,0,100);
     S.p.happy=clamp(S.p.happy-2-3*(1-f),0,100);
     noteAction('grind');
     const msg = f>0.72 ? 'You grind. Output goes up. So does the quiet resentment.'
       : f>0.45 ? 'Another run of late nights. It moves the needle less than the last lot did.'
       : 'You are working late out of habit now. Nobody is getting much out of it, least of all you.';
     log('career', msg, f>0.72?'neutral':'warn');
     return 'Performance +'+Math.round(gain)+(debt>0 ? ', borrowed '+debt+'h from sleep' : '');
   }},
  {id:'network', label:'Take people to lunch', cost:60000, hours:18,
   hint:'Relationship capital compounds faster than money capital early on. It takes afternoons, though, and the same people can only be asked to lunch so often before it becomes a story about you.',
   can:()=>hoursLeft() >= 18,
   run:()=>{
     const f = repeatFactor('network');
     spendHours(18, false);
     S.fin.cash-=60000;
     S.p.skills.network=clamp(S.p.skills.network+R.range(1.5,3.6)*f,0,100);
     S.p.rep=clamp(S.p.rep+R.range(0.8,2.4)*f,0,100);
     S.p.stress=clamp(S.p.stress-2*f,0,100);
     noteAction('network');
     const msg = f>0.72 ? 'Three lunches, two coffees, one introduction that might matter.'
       : f>0.45 ? 'More lunches. You are starting to see the same faces.'
       : 'You are lunching out of obligation now. It is not buying you anything new.';
     log('career', msg, f>0.72?'neutral':'warn');
     return 'Network and reputation up'+(f<0.72?' (diminishing)':'')+'.';
   }},
  {id:'raise', label:'Ask for a raise', cost:0,
   hint:'Odds scale with performance, tenure and how replaceable you are.',
   can:s=>!!s.p.job && (s.cd.raise == null || (s.turn - s.cd.raise) >= 4),
   odds:s=>clamp(0.10 + (s.p.jobPerf-45)/160 + s.p.jobYears*0.035 + s.p.skills.network/900, 0.05, 0.88),
   run:()=>{ const s=S.p; S.cd.raise = S.turn;
     const ok=R.chance(clamp(0.10+(s.jobPerf-45)/160+s.jobYears*0.035+s.skills.network/900,0.05,0.88));
     if(ok){
       const mkt = marketMonthly();
       const target = Math.min(Math.round(Math.max(s.job.monthly*1.10, mkt*0.95)), Math.round(mkt*1.18));
       const inc = target/s.job.monthly - 1;
       s.job.monthly = target; s.jobPerf = clamp(s.jobPerf+4,0,99);
       log('career','You asked. They said yes: '+fmt(target)+'/month'+(Math.abs(inc)>0.005?' ('+(inc>=0?'+':'')+pct(inc,0)+')':'')+'. Turns out the meeting was the hard part.','good');
       return inc>0.005 ? 'Raise secured: +'+pct(inc,0)+'.' : 'You are already at the top of what this role pays.';
     }
     s.jobPerf=clamp(s.jobPerf-6,0,99); s.rep=clamp(s.rep-1.5,0,100);
     log('career','"Let us revisit at the next review." You have been put on a list.','bad'); return 'Rejected. Performance dipped.'; }},
  {id:'jump', label:'Interview elsewhere', cost:45000,
   hint:'The fastest way to close the gap between what you are paid and what you are worth.',
   can:s=>!s.cd.jobJump || (s.turn - s.cd.jobJump) >= 6,
   odds:s=>clamp(0.16 + s.p.skills.ops/420 + s.p.skills.network/320 + s.p.rep/900, 0.06, 0.9),
   run:()=>{ const s=S.p;
     const p=clamp(0.16+s.skills.ops/420+s.skills.network/320+s.rep/900,0.06,0.9);
     S.cd.jobJump = S.turn;
     if(R.chance(p)){
       const was = s.job?s.job.monthly:0;
       const offer = Math.round(marketMonthly()*R.range(0.85,1.22));
       s.job={title:R.pick(['Senior Associate','Manager','Lead','Head of Function','Specialist']), monthly:offer, industry:'Corporate'};
       s.jobPerf=58; s.jobYears=0; s.stress=clamp(s.stress+7,0,100); s.rep=clamp(s.rep+2,0,100);
       const inc = was>0 ? (offer/was - 1) : 0;
       log('career','You moved to '+s.job.title+' at '+fmt(offer)+'/month'+(was>0?' ('+(inc>=0?'+':'')+pct(inc,0)+')':'')+'. New title, new politics, better money.','good');
       return was>0 ? 'New job: '+fmt(offer)+'/mo ('+(inc>=0?'+':'')+pct(inc,0)+')' : 'Hired at '+fmt(offer)+'/mo';
     }
     s.happy=clamp(s.happy-4,0,100); s.stress=clamp(s.stress+4,0,100);
     log('career','Four interviews, two finals, no offer. You go back to your desk.','bad'); return 'No offer this time.'; }},
  {id:'sidehustle', label:'Run a side hustle after hours', cost:0, hours:88, borrow:true,
   hint:'Seven hours a week of evenings and weekends, sold off in blocks. There are only so many nights in a quarter — take on a second hustle and the second one comes out of your sleep.',
   can:()=>true,
   run:()=>{
     const f = repeatFactor('sidehustle');
     const debt = spendHours(88, true);
     const earn=Math.round(R.range(0.75,1.35)*(60000 + S.p.skills.hustle*5200)*CITY().payMult*f);
     S.fin.cash+=earn;
     S.p.stress=clamp(S.p.stress+R.range(7,13)*(0.6+0.6*f)+debt*0.07,0,100);
     S.p.skills.hustle=clamp(S.p.skills.hustle+R.range(0.8,2.2)*f,0,100);
     S.p.health=clamp(S.p.health-1.4-debt*0.035,0,100);
     noteAction('sidehustle');
     log('career', debt>0
       ? 'You ran out of evenings and started using the night. You made '+fmt(earn)+', and you will pay for it.'
       : 'Evenings and weekends sold off in blocks. You made '+fmt(earn)+'.', debt>0?'warn':'neutral');
     return 'Earned '+fmt(earn)+(debt>0 ? ', borrowed '+debt+'h from sleep' : ', paid for it in sleep');
   }},
  {id:'quit', label:'Resign and go full-time on the business', cost:0,
   hint:'Burn the boats. Business output jumps — and so does the cost of being wrong.',
   can:s=>!!s.p.job,
   run:()=>{ log('career','You resigned. No salary, no structure, no excuse.','warn');
     S.p.job=null; S.p.jobYears=0; S.p.happy=clamp(S.p.happy+6,0,100); S.p.stress=clamp(S.p.stress+10,0,100);
     if(S.p.family<60){ S.p.family=clamp(S.p.family-8,0,100); log('life','Your family does not understand what you just did.','bad'); }
     return 'Unemployed by choice. Business output up.'; }},
  {id:'sabbatical', label:'Take a month off to reset', cost:0, hours:0,
   hint:'Sometimes the highest-return action available is stopping. Once a year, at most — a month off every quarter is not a sabbatical, it is unemployment.',
   can:s=>s.fin.cash>400000 && (!s.cd.sab || (s.turn - s.cd.sab) >= 4),
   run:()=>{ S.fin.cash-=Math.round(budgetMonthly()*1.2); S.p.stress=clamp(S.p.stress-26,0,100); S.p.health=clamp(S.p.health+7,0,100);
     S.p.happy=clamp(S.p.happy+11,0,100); S.p.jobPerf=clamp(S.p.jobPerf-5,0,99); S.p.family=clamp(S.p.family+4,0,100);
     S.cd.sab = S.turn;
     S.p.debt = Math.max(0, sleepDebt() - 90);
     log('life','You stopped. Nothing collapsed. That was the lesson.','good'); return 'Stress down sharply.'; }},
];
