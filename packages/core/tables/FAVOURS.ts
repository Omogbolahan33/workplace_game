/*
  FAVOURS — from 16-era-chip.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface FAVOURSShape {
  ask: string;
  odds: ((a0: any) => any);
  ok: string;
  fx: (() => any);
  fail: string;
}
interface FAVOURSShape2 {
  banker: FAVOURSShape;
  contact: FAVOURSShape;
  supplier: FAVOURSShape;
  mentor: FAVOURSShape;
  elder: FAVOURSShape;
  rival: FAVOURSShape;
  love: FAVOURSShape;
  friend: FAVOURSShape;
  sibling: FAVOURSShape;
  cousin: FAVOURSShape;
}

const FAVOURS: FAVOURSShape2 = {
  banker:   {ask:'Ask them to move a facility along',
    odds:function(c){ return clamp(0.20 + c.relation/150, 0.08, 0.9); },
    ok:'They called somebody. The rate came down and two weeks of paperwork disappeared.',
    fx:function(){ S.fin.credit = clamp(S.fin.credit+8, 0, 100); log('money','Your banker intervened. Your credit standing improved.','good'); },
    fail:'They are very fond of you. They are not fond of you to the tune of a restructured facility.'},
  contact:  {ask:'Ask about a file that is sitting somewhere',
    odds:function(c){ return clamp(0.18 + c.relation/140, 0.08, 0.9); },
    ok:'The file moved from one desk to another. That is the whole trick and it worked.',
    fx:function(){ S.p.rep = clamp(S.p.rep+6,0,100); S.stand.state = clamp(S.stand.state+8,0,100); log('life','A thing that had been stuck for months is now unstuck.','good'); },
    fail:'They have heard the question before and they have learned to be careful who they help.'},
  supplier: {ask:'Ask for sixty days instead of thirty',
    odds:function(c){ return clamp(0.25 + c.relation/130, 0.1, 0.92); },
    ok:'Sixty days. It does not sound like much until you have been short of cash.',
    fx:function(){ if(S.biz){ S.biz.cash += Math.round(Math.max(200000, S.biz.revenue*0.18)*S.cumInfl); } log('biz','Your supplier extended your terms. That is working capital you did not have.','good'); },
    fail:'They are themselves being pressed and cannot carry you as well.'},
  mentor:   {ask:'Ask for an introduction',
    odds:function(c){ return clamp(0.35 + c.relation/120, 0.15, 0.95); },
    ok:'Two phone calls. You now know somebody you did not know on Monday.',
    fx:function(){ S.p.rep = clamp(S.p.rep+9,0,100); S.p.skills.network = clamp(S.p.skills.network+7,0,100); log('life','An introduction was made on your behalf.','good'); },
    fail:'They would rather not stake their own name on it yet.'},
  elder:    {ask:'Ask them to speak for you',
    odds:function(c){ return clamp(0.30 + c.relation/120, 0.12, 0.94); },
    ok:'They said your name in a room you were not in, in the way you wanted it said.',
    fx:function(){ S.stand.community = clamp(S.stand.community+14,0,100); S.p.rep = clamp(S.p.rep+7,0,100); log('life','An elder put their weight behind you. It carries further than money here.','good'); },
    fail:'They will speak for you when there is more to speak about.'},
  rival:    {ask:'Ask what they are hearing',
    odds:function(c){ return clamp(0.30 + c.relation/150, 0.1, 0.9); },
    ok:'They told you something true, mostly out of vanity, and it is useful.',
    fx:function(){ S.p.skills.savvy = clamp(S.p.skills.savvy+5,0,100); S.vignette = makeVignette(); log('life','You learned something from a competitor that you could not have learned any other way.','good'); },
    fail:'They told you something. You are fairly sure it was not true.'},
  love:     {ask:'Ask them to wait',
    odds:function(c){ return clamp(0.40 + c.relation/110, 0.2, 0.96); },
    ok:'They waited. It is not nothing, and you should not test it twice.',
    fx:function(){ S.p.happy = clamp(S.p.happy+5,0,100); S.p.stress = clamp(S.p.stress-5,0,100); log('life','They waited.','good'); },
    fail:'They have been waiting. There is a difference and you have just been told which kind this is.'},
  friend:   {ask:'Ask them to put in money',
    odds:function(c){ return clamp(0.15 + c.relation/130 + c.wealth/400, 0.06, 0.9); },
    ok:'They put in what they could, which turned out to be more than you expected.',
    fx:function(){ const amt = Math.round(1200000*S.cumInfl); S.fin.cash += amt; log('money','A friend invested '+fmt(amt)+' on trust and no paperwork.','good'); },
    fail:'They would if they had it. The honest answer is that they do not.'},
  sibling:  {ask:'Ask them to cover the family contribution this quarter',
    odds:function(c){ return clamp(0.25 + c.relation/120 + c.wealth/400, 0.08, 0.92); },
    ok:'They covered it. Nobody said anything and nobody will forget.',
    fx:function(){ const amt = Math.round(350000*S.cumInfl); S.fin.cash += amt; S.p.family = clamp(S.p.family+4,0,100); log('life','Your sibling quietly covered the family contribution.','good'); },
    fail:'They pointed out, not unfairly, that they have their own.'},
  cousin:   {ask:'Ask them to work for you cheaply',
    odds:function(c){ return clamp(0.40 + c.relation/120, 0.15, 0.95); },
    ok:'They started on Monday. They know the family and the customers like them.',
    fx:function(){ if(S.biz){ S.biz.cash -= Math.round(180000*S.cumInfl); S.biz.rep = clamp(S.biz.rep+5,0,100); }
      log('biz','A cousin joined the business for less than market rate and more than market loyalty.','good'); },
    fail:'They have a plan. They always have a plan and it is never this one.'},
};
