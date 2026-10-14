const {JSDOM} = require('jsdom');
require('./dom.js');
const dom = new JSDOM('<!doctype html><html><body>'+
  '<div id="top"><div class="toprow" id="toprow"></div><div class="tabs" id="tabs"></div></div>'+
  '<div id="main"></div><div id="modalHost"></div><div id="toastHost"></div></body></html>',
  {pretendToBeVisual:true});
global.window = dom.window; global.document = dom.window.document;
/* jsdom has no scrolling. render() restores scroll position on every call and
   calls window.scrollTo, which jsdom answers with a "Not implemented" error
   that lands as an unhandled error after the gate has already reported. It is
   a gap in the harness, not in the game - scrollTo is a real browser API. */
dom.window.scrollTo = function(){};
if(!global.Node) global.Node = dom.window.Node;
const M = require('./sim.js');
try{ M.UI.noAnim = true; }catch(e){}
const DOC = global.document;

let bad=[]; const ck=(c,m)=>{ if(!c) bad.push(m); };

M.newGame({name:'Ada', city:'lagos', profile:'founder', difficulty:'realistic', seed: 4242 });
for(let q=0;q<20 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }
if(!M.getS().biz){ try{ M.startBiz('retail', null, 5000000, null); }catch(e){ bad.push('startBiz: '+e.message);} }
for(let q=0;q<8 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }

const S = M.getS();
console.log('has biz:', !!S.biz);

function q(n){ return DOC.querySelector('input[data-inp="'+n+'"]'); }
function fire(el, type){ el.dispatchEvent(new dom.window.Event(type,{bubbles:true})); }

// --- where do sliders actually live? ---
const found = {};
for(const t of ['dash','people','deals','work','gov','group','invest','money','legacy','ledger']){
  M.UI.tab=t; M.UI.scrollTop=true; M.render();
  const list=[...DOC.querySelectorAll('#main input[type=range]')].map(e=>e.dataset.inp);
  if(list.length) found[t]=list;
}
console.log('sliders per tab:', JSON.stringify(found));

/* The business's three sliders: on the Work screen with the explanations
   shown, and world-first on the customers' card the scene and the Operations
   gauges open. Wherever they are, the claims are the same - a drag persists
   through a render, the state moves, the label is live, focus survives. */
function workSliders(){
  M.UI.modal = null; M.UI.tab='work'; M.UI.scrollTop=true; M.render();
  if(!DOC.querySelector('#main input[data-inp="bizprice"]')){ M.UI.modal = { type:'hot', kind:'customers' }; M.render(); }
  console.log('business sliders on: '+(DOC.querySelector('#main input[data-inp="bizprice"]') ? 'the Work screen' : "the customers' card"));
}
// --- work-tab sliders ---
workSliders();
for(const name of ['bizprice','bizmark','bizqual']){
  const el = q(name);
  if(!el){ bad.push('missing slider: '+name); continue; }
  const min=+el.min, max=+el.max, step=+el.step, val=+el.value;
  console.log(name.padEnd(9), 'min='+min, 'max='+max, 'step='+step, 'value='+val);
  ck(max>min, name+': degenerate range (min='+min+' max='+max+')');
  const target = Math.min(max, Math.max(min, val + step));
  el.value = String(target);
  fire(el,'input');
  fire(el,'change');
  M.render();
  const el2 = q(name);
  ck(!!el2, name+': slider vanished after change+render');
  if(el2) ck(+el2.value===target, name+': value not persisted ('+target+' -> '+el2.value+')');
}

// --- state actually moved? ---
const b = M.getS().biz;
console.log('after drag -> priceIdx='+b.priceIdx, 'marketing='+b.marketing, 'quality='+b.qualitySpendMonthly);

// --- do repeated renders kill the binding? ---
const el = q('bizprice');
if(el){
  const before = +el.value;
  el.value = String(Math.min(+el.max, before + (+el.step)*3));
  fire(el,'input'); fire(el,'change');
  for(let i=0;i<3;i++) M.render();
  const el3 = q('bizprice');
  ck(el3 && +el3.value !== before, 'binding lost after 3 renders (still '+before+')');
  console.log('re-render persistence: '+before+' -> '+(el3?el3.value:'GONE'));
}

// --- label updates live during drag? ---
const el4 = q('bizmark');
if(el4){
  const card = el4.parentElement;
  const lab = card.querySelector('.mono');
  const t = String(Math.min(+el4.max, +el4.value + (+el.step)*2));
  el4.value = t; fire(el4,'input');
  const txt = lab ? lab.textContent : '(no label)';
  console.log('live label on input event:', JSON.stringify(txt));
  ck(lab && txt !== '(no label)', 'no .mono label sibling for slider');
}


// --- budget sliders on the Money tab ---
M.UI.modal = null; M.UI.tab='money'; M.UI.scrollTop=true; M.render();
const buds=[...DOC.querySelectorAll('#main input[data-inp="budget"]')];
console.log('budget sliders on money tab:', buds.length);
let budok=0;
buds.forEach(function(el){
  const k=el.dataset.k;
  const before = (M.getS().fin.budget||{})[k];
  const target = String(Math.min(+el.max, +el.value + (+el.step||1000)));
  el.value = target; fire(el,'input');
  const after = (M.getS().fin.budget||{})[k];
  if(after===+target) budok++;
  else bad.push('budget.'+k+': '+before+' -> '+after+' (expected '+target+')');
});
console.log('budget sliders whose state updated:', budok+'/'+buds.length);

// --- focus survives a re-render (keyboard use) ---
workSliders();
const f1 = q('bizprice');
if(f1){
  f1.focus();
  const gotFocus = DOC.activeElement === f1;
  ck(gotFocus, 'could not focus slider at all');
  M.render();
  const nf = q('bizprice');
  ck(DOC.activeElement === nf,
     'FOCUS LOST across render (activeElement='+(DOC.activeElement?DOC.activeElement.tagName:'null')+')');
  console.log('focus across render:', gotFocus && DOC.activeElement===nf ? 'RESTORED' : 'LOST');
}else bad.push('no bizprice slider for focus test');

console.log(bad.length ? ('\nSLIDER ISSUES:\n'+[...new Set(bad)].join('\n')) : '\nSLIDER CLEAN');
