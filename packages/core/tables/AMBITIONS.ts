/*
  AMBITIONS — from 31-afterthreadchoice.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface AMBITIONSShape {
  id: string;
  name: string;
  blurb: string;
  check: ((a0: any) => any);
  done: string;
}

const AMBITIONS: AMBITIONSShape[] = [
  {id:'million', name:'Clean millionaire by 40',
   blurb:'Net worth of ₦500m in start-of-game money before you turn forty, with no debt hanging off it.',
   check:function(s){ return s.p.age<40 ? Math.min(1, (s.der.nw/Math.max(1,S.cumInfl))/5e8) : ((s.der.nw/S.cumInfl)>=5e8 && s.der.debt<=0 ? 1 : 0); },
   done:'You got there before forty, and you did not have to borrow to do it.'},
  {id:'dynasty', name:'Build something that outlasts you',
   blurb:'Raise a family, keep them close, and leave behind more than money.',
   check:function(s){ const w = clamp((s.der.nw/S.cumInfl)/4e8,0,1)*0.5 + clamp((s.p.family-40)/60,0,1)*0.3 + clamp(S.p.kids/3,0,1)*0.2; return w; },
   done:'Money, a family that still speaks to each other, and a name that means something.'},
  {id:'free',    name:'Never need anyone again',
   blurb:'A Freedom Index above 80 with zero debt. Work becomes a choice.',
   check:function(s){ return clamp(freedomIndex()/80,0,1) * (s.der.debt<=0?1:0.55); },
   done:'You can say no to anything. That was always the actual goal.'},
  {id:'builder', name:'Build the biggest thing you can',
   blurb:'Scale a business past ₦250m of quarterly revenue and employ more than twenty people.',
   check:function(s){ if(!s.biz) return 0; const rev = s.biz.revenue/Math.max(1,S.cumInfl);
     return clamp(rev/250e6,0,1)*0.7 + clamp(s.biz.staff.length/20,0,1)*0.3; },
   done:'It started as an idea at a kitchen table and it now has a payroll.'},
  {id:'land',    name:'Buy back what was lost',
   blurb:'Own land and property worth ₦1bn in start-of-game money. The family gets the point.',
   check:function(s){ let v=0; (s.assets||[]).forEach(function(a){ if(a.id==='land'||a.id==='rental'||a.id==='reit') v+=a.value; });
     return clamp((v/S.cumInfl)/1e9,0,1); },
   done:'Acres, title deeds, and a quiet kind of vindication.'},
];
