/*
  DEAL_TYPES — from 31-afterthreadchoice.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface DEAL_TYPESShape {
  id: string;
  name: string;
  capital: number;
  turns: number;
  ret: number;
  risk: number;
  desc: string;
  win: string;
  lose: string;
}

const DEAL_TYPES: DEAL_TYPESShape[] = [
  {id:'flip',   name:'Property flip',        capital:0.9, turns:4, ret:0.55, risk:0.30,
   desc:'A unit that needs work and a seller who needs to be somewhere else. Four quarters to turn it.',
   win:'The refurb took eleven weeks instead of six and it still made money. That is how good the entry price was.',
   lose:'The refurb uncovered structural problems that were not in the survey. The money went into concrete.'},
  {id:'place',  name:'Private placement',    capital:0.6, turns:8, ret:0.95, risk:0.48,
   desc:'A growing company wants money before it wants a valuation. Illiquid for at least two years.',
   win:'They raised a proper round at four times your entry. Your shares are worth several times what you paid.',
   lose:'They ran out of runway in year two. There was no liquidation preference and there was no money.'},
  {id:'distress',name:'Distressed stock',    capital:0.7, turns:2, ret:0.45, risk:0.28,
   desc:'A business is closing. Stock, equipment and a customer list, priced to move this week.',
   win:'You resold the stock in six weeks. The equipment alone covered most of what you paid.',
   lose:'Half of it was obsolete and the rest was somebody else\'s problem for a reason.'},
  {id:'bridge', name:'Bridge loan',          capital:1.0, turns:3, ret:0.32, risk:0.38,
   desc:'Ninety days, twelve per cent, secured against a contract that has already been signed. Everyone says it is safe.',
   win:'It paid on day eighty-eight, exactly as agreed, with interest.',
   lose:'The contract was real. The payment was not. You are now in the debt collection business.'},
  {id:'arbitrage',name:'Import arbitrage',   capital:1.2, turns:2, ret:0.40, risk:0.42,
   desc:'Buy here, sell there, before the next FX move. The window is about one quarter wide.',
   win:'You moved before the rate did. The margin was thin and the volume was not.',
   lose:'The currency moved while the goods were on the water. The margin went with it.'},
  {id:'landbank',name:'Land banking',        capital:1.4, turns:12, ret:1.30, risk:0.22,
   desc:'A corridor nobody wants yet. Nothing happens for two years and then everything happens.',
   win:'They announced the road. The parcel tripled in eighteen months and you did nothing except wait.',
   lose:'The road was announced somewhere else. You own a field.'},
  {id:'franchise',name:'Franchise unit',     capital:1.1, turns:6, ret:0.50, risk:0.30,
   desc:'A proven brand wants an operator with capital. You supply both and follow their system.',
   win:'The system works. It is not exciting and it is making money every month.',
   lose:'The brand was proven in a different city. Footfall here never matched the model.'},
  {id:'equity', name:'Equipment purchase',   capital:0.8, turns:4, ret:0.38, risk:0.20,
   desc:'Buy the machine your business keeps renting. It pays for itself or it sits in the yard.',
   win:'It paid for itself in fourteen months and it is still running.',
   lose:'It broke twice and the servicing contract was not worth the paper.'},
];
