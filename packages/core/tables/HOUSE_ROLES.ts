/*
  HOUSE_ROLES — from 04-bizcapacity.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface HOUSE_ROLESShape {
  calm: number;
  joy: number;
  time: number;
}
interface HOUSE_ROLESShape2 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape;
}
interface HOUSE_ROLESShape3 {
  health: number;
  joy: number;
  calm: number;
}
interface HOUSE_ROLESShape4 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape3;
}
interface HOUSE_ROLESShape5 {
  calm: number;
  family: number;
  time: number;
}
interface HOUSE_ROLESShape6 {
  label: string;
  tier: string;
  pay: number;
  req: string;
  note: string;
  fx: HOUSE_ROLESShape5;
}
interface HOUSE_ROLESShape7 {
  time: number;
  calm: number;
  status: number;
}
interface HOUSE_ROLESShape8 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape7;
}
interface HOUSE_ROLESShape9 {
  upkeep: number;
  joy: number;
  status: number;
}
interface HOUSE_ROLESShape10 {
  label: string;
  tier: string;
  pay: number;
  req: string;
  note: string;
  fx: HOUSE_ROLESShape9;
}
interface HOUSE_ROLESShape11 {
  calm: number;
  secure: number;
  status: number;
}
interface HOUSE_ROLESShape12 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape11;
}
interface HOUSE_ROLESShape13 {
  time: number;
  calm: number;
  gmCover: number;
}
interface HOUSE_ROLESShape14 {
  label: string;
  tier: string;
  pay: number;
  req: string;
  note: string;
  fx: HOUSE_ROLESShape13;
}
interface HOUSE_ROLESShape15 {
  tax: number;
  compliance: number;
}
interface HOUSE_ROLESShape16 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape15;
}
interface HOUSE_ROLESShape17 {
  legal: number;
  compliance: number;
}
interface HOUSE_ROLESShape18 {
  label: string;
  tier: string;
  pay: number;
  req: null;
  note: string;
  fx: HOUSE_ROLESShape17;
}
interface HOUSE_ROLESShape19 {
  cleaner: HOUSE_ROLESShape2;
  cook: HOUSE_ROLESShape4;
  nanny: HOUSE_ROLESShape6;
  driver: HOUSE_ROLESShape8;
  gardener: HOUSE_ROLESShape10;
  security: HOUSE_ROLESShape12;
  pa: HOUSE_ROLESShape8;
  cos: HOUSE_ROLESShape14;
  acct: HOUSE_ROLESShape16;
  lawyer: HOUSE_ROLESShape18;
}

const HOUSE_ROLES: HOUSE_ROLESShape19 = {
  cleaner:  {label:'Housekeeper', tier:'home', pay:0.55, req:null,
    note:'The house stops being a second job. Nothing dramatic, every single week.',
    fx:{calm:1.7, joy:0.8, time:0.03}},
  cook:     {label:'Cook', tier:'home', pay:0.72, req:null,
    note:'You eat properly and at the same hour. It turns up in your bloodwork a decade later.',
    fx:{health:2.6, joy:1.3, calm:1.1}},
  nanny:    {label:'Nanny', tier:'home', pay:0.80, req:'kids',
    note:'Childcare that is not you at two in the morning. The largest single block of attention you can buy.',
    fx:{calm:2.3, family:2.8, time:0.16}},
  driver:   {label:'Driver', tier:'home', pay:0.95, req:null,
    note:'Traffic stops being your job. You arrive composed and you work in the back seat.',
    fx:{time:0.13, calm:1.5, status:1.2}},
  gardener: {label:'Gardener', tier:'home', pay:0.45, req:'assets',
    note:'Grounds, generator, gutters. Property upkeep falls and the place looks like somebody owns it.',
    fx:{upkeep:0.18, joy:0.9, status:0.4}},
  security: {label:'Security', tier:'home', pay:0.62, req:null,
    note:'A gate and a man on it. Cuts theft at home and, if you post him there, at the business.',
    fx:{calm:1.6, secure:1.0, status:0.6}},
  pa:       {label:'Personal assistant', tier:'exec', pay:1.15, req:null,
    note:'Your calendar, your calls, the birthday you always forget. The best return on attention on this list.',
    fx:{time:0.20, calm:2.1, status:1.0}},
  cos:      {label:'Chief of staff', tier:'exec', pay:2.25, req:'biz',
    note:'Runs your affairs across every company you own. Partly covers businesses that have no general manager.',
    fx:{time:0.26, calm:1.7, gmCover:1.0}},
  acct:     {label:'Accountant', tier:'exec', pay:1.60, req:null,
    note:'Books kept properly across the companies and your own affairs. Tax exposure falls, compliance rises.',
    fx:{tax:5.5, compliance:5.0}},
  lawyer:   {label:'Lawyer', tier:'exec', pay:1.95, req:null,
    note:'Reads what you are about to sign. Contracts tighten and disputes cost less when they arrive.',
    fx:{legal:1.0, compliance:3.0}}
};
