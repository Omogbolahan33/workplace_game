/*
  BID_BUYERS — from 26-governance-register-board.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface BID_BUYERSShape {
  k: string;
  name: string;
  mult: number;
  cond: string[];
}

const BID_BUYERS: BID_BUYERSShape[] = [
  {k:'trade',   name:'a trade buyer',            mult:1.30, cond:['confirmatory due diligence','warranty and indemnity insurance','key man undertaking']},
  {k:'pe',      name:'a private equity fund',    mult:1.10, cond:['full financial diligence','management incentive plan','rolled equity']},
  {k:'family',  name:'a family office',          mult:1.02, cond:['six-month escrow','non-compete']},
  {k:'rival',   name:'your nearest competitor',  mult:1.22, cond:['exclusivity for 60 days','non-compete','staff retention']},
  {k:'mgmt',    name:'your own management team', mult:0.86, cond:['vendor financing','seller note over three years']},
  {k:'group',   name:'a listed group',           mult:1.42, cond:['regulatory clearance','audited three-year accounts','earnout']}
];
