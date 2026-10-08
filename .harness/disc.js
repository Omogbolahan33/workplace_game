const {JSDOM} = require('jsdom');
require('./dom.js');            // install stub first (satisfies the module graph)

// NOW swap in a real DOM, BEFORE sim.js runs, so sim.js binds its
// document-level click listener to the real document (as a browser would).
const dom = new JSDOM('<!doctype html><html><body>'+
  '<div id="top"><div class="toprow" id="toprow"></div><div class="tabs" id="tabs"></div></div>'+
  '<div id="main"></div><div id="modalHost"></div><div id="toastHost"></div>'+
  '</body></html>', {pretendToBeVisual:true});
global.window = dom.window;
/* jsdom has no scrolling; render() restores scroll position on every call.
   Without this the run fills with 'Not implemented: window.scrollTo'.
   It is a harness gap - scrollTo is a real browser API. */
dom.window.scrollTo = function(){};
global.document = dom.window.document;
if(!global.Node) global.Node = dom.window.Node;

const M = require('./sim.js');
try{ M.UI.noAnim = true; }catch(e){}

const DOC = dom.window.document;
const mainEl = () => DOC.getElementById('main');
const scrollCalls = [];
dom.window.scrollTo = function(x,y){ scrollCalls.push([x,y]); };

let bad = [];
const ck = (c,m)=>{ if(!c) bad.push(m); };

M.newGame({name:'Ada Okonjo', city:'lagos', profile:'founder', difficulty:'realistic', seed: 4242 });
for(let q=0;q<30;q++){ if(M.getS().gameOver) break; try{ M.ACT.advance(); }catch(e){ bad.push('advance: '+e.message); } M.UI.modal=null; }
if(!M.getS().biz){ try{ M.startBiz('retail', null, 4000000, null); }catch(e){ bad.push('startBiz: '+e.message); } }
for(let q=0;q<14;q++){ if(M.getS().gameOver) break; try{ M.ACT.advance(); }catch(e){ bad.push('advance2: '+e.message); } M.UI.modal=null; }

const TABS = ['dash','people','deals','work','gov','group','invest','money','legacy','ledger'];
console.log('tab      sections  collapsed');
let totalSections = 0, totalCollapsed = 0;
for(const t of TABS){
  M.UI.tab = t; M.UI.scrollTop = true;
  try{ M.render(); }catch(e){ bad.push(t+' render: '+e.message); continue; }
  const m = mainEl();
  const heads = m.querySelectorAll('[data-disc]');
  let hidden = 0;
  m.querySelectorAll('.discbody').forEach(b=>{
    if(b.style.display === 'none'){
      hidden++;
      const inter = b.querySelectorAll('button,input,select,[data-a]');
      if(inter.length) bad.push(t+': collapsed section hides '+inter.length+' interactive element(s)');
    }
  });
  totalSections += heads.length; totalCollapsed += hidden;
  console.log(t.padEnd(9)+String(heads.length).padStart(6)+String(hidden).padStart(11));
}
console.log('TOTAL'.padEnd(9)+String(totalSections).padStart(6)+String(totalCollapsed).padStart(11));

// toggle a header
M.UI.tab='gov'; M.UI.scrollTop=true; M.render();
let heads = [...mainEl().querySelectorAll('[data-disc]')];
if(heads.length){
  const h = heads[heads.length-1];
  const card = h.parentElement;
  const body = card.querySelector('.discbody');
  const before = body.style.display;
  h.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
  const after = body.style.display;
  ck(before!==after, 'toggle did not flip (before='+JSON.stringify(before)+' after='+JSON.stringify(after)+')');
  const chev = h.querySelector('.chev');
  ck(!!chev, 'no chevron rendered on header');
  console.log('toggle      : '+JSON.stringify(before)+' -> '+JSON.stringify(after)+'  chev='+(chev?chev.textContent:'none'));
}else{ bad.push('gov: no collapsible sections found'); }

// expand / collapse all
M.ACT.discall({dataset:{v:'0'}});
let bodies = [...mainEl().querySelectorAll('.discbody')];
let hid = bodies.filter(b=>b.style.display==='none').length;
ck(hid===bodies.length, 'collapse all only hid '+hid+'/'+bodies.length);
M.ACT.discall({dataset:{v:'1'}});
bodies = [...mainEl().querySelectorAll('.discbody')];
hid = bodies.filter(b=>b.style.display==='none').length;
ck(hid===0, 'expand all left '+hid+' collapsed');
console.log('bulk toggle : collapse-all/expand-all both correct ('+bodies.length+' sections)');

// scroll preservation
Object.defineProperty(dom.window,'pageYOffset',{value:250,configurable:true});
M.UI.tab='dash'; M.UI.scrollTop=false; scrollCalls.length=0; M.render();
ck(scrollCalls.length && scrollCalls[0][1]===250, 'scroll not preserved: '+JSON.stringify(scrollCalls[0]));
M.UI.scrollTop=true; scrollCalls.length=0; M.render();
ck(scrollCalls.length && scrollCalls[0][1]===0, 'tab switch did not reset scroll: '+JSON.stringify(scrollCalls[0]));
console.log('scroll      : preserved at 250 on re-render, reset to 0 on tab switch');

// long play, rendering every quarter on every tab
let renders=0;
for(let q=0;q<60 && !M.getS().gameOver;q++){
  M.UI.tab = TABS[q % TABS.length];
  try{ M.ACT.advance(); }catch(e){ bad.push('play advance: '+e.message); }
  M.UI.modal=null;
  try{ M.render(); renders++; }catch(e){ bad.push('play render '+(q%TABS.length)+': '+e.message); }
}
console.log('long play   : '+renders+' renders across 60 quarters');

console.log(bad.length ? ('\nDISC ISSUES ('+bad.length+'):\n'+[...new Set(bad)].slice(0,25).join('\n')) : '\nDISC CLEAN');
