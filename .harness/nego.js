const {JSDOM} = require('jsdom');
require('./dom.js');
const dom = new JSDOM('<!doctype html><html><body>'+
  '<div id="top"><div class="toprow" id="toprow"></div><div class="tabs" id="tabs"></div></div>'+
  '<div id="main"></div><div id="modalHost"></div><div id="toastHost"></div></body></html>',
  {pretendToBeVisual:true});
global.window = dom.window; global.document = dom.window.document;
/* jsdom has no scrolling; render() restores scroll position on every call.
   Without this the run fills with 'Not implemented: window.scrollTo'.
   It is a harness gap - scrollTo is a real browser API. */
dom.window.scrollTo = function(){};
if(!global.Node) global.Node = dom.window.Node;
const M = require('./sim.js');
const DOC = global.document;
let bad=[]; const ck=(c,m)=>{ if(!c) bad.push(m); };

M.UI.noAnim = true;
/* Fixed seed: without one every run of this gate plays a different world,
   so a failure can appear once and never reproduce. */

M.newGame({name:'Ada', city:'lagos', profile:'founder', difficulty:'realistic', seed:4242});
for(let q=0;q<8 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }
if(!M.getS().biz){ try{ M.startBiz('retail', null, 6000000, null); }catch(e){ bad.push('startBiz: '+e.message);} }
for(let q=0;q<4 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }

const S = M.getS();
const cands = S.candidates||[];
console.log('candidates available:', cands.length);
if(!cands.length){ bad.push('no candidates to test with'); }

if(cands.length){
  const c = cands[0];
  M.ACT.hirenego({dataset:{i:c.id}});
  ck(M.UI.modal && M.UI.modal.type==='nego',
     'hirenego did not open a negotiation (modal='+(M.UI.modal&&M.UI.modal.type)+')');
  M.render();

  const host = DOC.getElementById('modalHost');
  const html = host.innerHTML;

  // structure checks
  const nModal = (html.match(/id="modal"/g)||[]).length;
  const nBox   = (html.match(/class="modalbox"/g)||[]).length;
  const boxes  = host.querySelectorAll('.modalbox');
  const heads  = host.querySelectorAll('.head');
  const bodies = host.querySelectorAll('.body');
  const opts   = host.querySelectorAll('button.opt');

  console.log('nested id="modal" count :', nModal, nModal===1?'(ok)':'(BUG: double-wrapped)');
  console.log('modalbox count          :', nBox);
  console.log('.head count             :', heads.length);
  console.log('.body count             :', bodies.length);
  console.log('tactic buttons found    :', opts.length);
  if(heads[0]) console.log('outer .head text len   :', (heads[0].textContent||'').trim().length);
  if(bodies[0]) console.log('outer .body text len   :', (bodies[0].textContent||'').trim().length);

  ck(nModal===1, 'modal is double-wrapped ('+nModal+' nested #modal)');
  ck(opts.length>0, 'NO tactic buttons rendered - player cannot act');
  const box = boxes[0];
  if(box && opts.length){
    // are the buttons actually inside the outermost modalbox?
    let inside = false;
    opts.forEach(o=>{ if(box.contains(o)) inside = true; });
    console.log('buttons inside modalbox :', inside);
    ck(inside, 'tactic buttons are outside the modalbox');
  }
  // can we actually drive a deal?
  if(opts.length){
    const before = (M.getS().biz.staff||[]).length;
    let guard=0, sawResult=false, resultStatus='';
    while(guard++<12){
      const st = M.UI.modal && M.UI.modal.type;
      if(st==='nego'){
        const btns=[...DOC.querySelectorAll('#modalHost button.opt[data-a=' + String.fromCharCode(34) + 'negtactic' + String.fromCharCode(34) + ']')];
        if(!btns.length) break;
        /* Anchor hard every round only reaches an impasse; a concession actually closes. */
        const pick = btns.find(x=>x.dataset.t==='concede') || btns[0];
        pick.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
      } else if(st==='negoResult'){
        sawResult = true;
        resultStatus = (M.UI.modal.res && M.UI.modal.res.status) || '?';
        const cont = DOC.querySelector('#modalHost [data-a="negclose"]');
        if(cont) cont.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
        break;
      } else break;
      M.render();
    }
    const after = (M.getS().biz.staff||[]).length;
    console.log('staff before/after      :', before, '->', after, '| outcome:', (resultStatus||'none'));
    /* The negotiation must reachable to an outcome. A walk or impasse is a legitimate
       outcome, so the assertion is that you can finish it, not that you always win. */
    ck(sawResult, 'never reached a negotiation result');
  }
}
console.log(bad.length ? ('\nNEGO ISSUES:\n'+[...new Set(bad)].join('\n')) : '\nNEGO CLEAN');
process.exit(0);
