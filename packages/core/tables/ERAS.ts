/*
  ERAS — from 30-eras-you-live-through.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface ERASShape {
  infl: number;
  demand: number;
  sent: number;
  shock: number;
}
interface ERASShape2 {
  infl: number;
  demand: number;
  sent: number;
  shock: number;
  ret: number;
}
interface ERASShape3 {
  infl: number;
  demand: number;
  sent: number;
  shock: number;
  reg: number;
}
interface ERASShapesShape {
  infl: number;
  demand: number;
  sent: number;
  shock: number;
  ret?: number;
  reg?: number;
}
interface ERASShape4 {
  id: string;
  name: string;
  tone: string;
  w: number;
  len: number[];
  head: string;
  fx: ERASShapesShape;
}

const ERAS: ERASShape4[] = [
  {id:'calm',    name:'Ordinary Times', tone:'neutral', w:1.0, len:[8,20],
   head:'Nothing is happening, which is its own kind of luck.',
   fx:{infl:0, demand:0, sent:0, shock:1.0}},
  {id:'boom',    name:'The Boom', tone:'good', w:0.9, len:[6,16],
   head:'Money is cheap, valuations are silly, and everyone you know is suddenly an investor.',
   fx:{infl:-0.02, demand:0.16, sent:18, shock:0.8, ret:0.012}},
  {id:'bust',    name:'The Bust', tone:'bad', w:0.8, len:[5,12],
   head:'The music stopped. Nobody wants to admit they were still dancing.',
   fx:{infl:0.02, demand:-0.20, sent:-24, shock:1.5, ret:-0.020}},
  {id:'stagnation',name:'The Long Stagnation', tone:'warn', w:0.8, len:[10,24],
   head:'Nothing collapses. Nothing improves. Years go by like this.',
   fx:{infl:0.01, demand:-0.06, sent:-8, shock:0.9, ret:-0.004}},
  {id:'reform',  name:'Reform Season', tone:'info', w:0.7, len:[6,14],
   head:'New rules, new taxes, new forms. Some of this is good for you. Most of it is paperwork.',
   fx:{infl:0.01, demand:0.02, sent:2, shock:1.2, reg:1.6}},
  {id:'election',name:'Election Season', tone:'warn', w:0.6, len:[4,8],
   head:'Promises are cheap, contracts are frozen, and everyone with a file is waiting for the result.',
   fx:{infl:0.015, demand:-0.04, sent:-6, shock:1.1, reg:1.3}},
  {id:'crisis',  name:'Crisis', tone:'bad', w:0.5, len:[3,8],
   head:'Something broke. Nobody agrees what, and the argument is expensive.',
   fx:{infl:0.05, demand:-0.24, sent:-30, shock:2.2, ret:-0.045}},
];
