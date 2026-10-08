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
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let bad=[]; const ck=(c,m)=>{ if(!c) bad.push(m); };

(async function(){
  M.UI.noAnim = true;                       // fast setup
  M.newGame({name:'Ada', city:'lagos', profile:'founder', difficulty:'realistic', seed: 4242 });
  for(let q=0;q<14 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }
  if(!M.getS().biz){ try{ M.startBiz('retail', null, 5000000, null); }catch(e){} }
  for(let q=0;q<6 && !M.getS().gameOver;q++){ try{ M.ACT.advance(); }catch(e){} M.UI.modal=null; }

  // ---- animation ON, fast mode ----
  M.UI.noAnim = false; M.UI.animFast = true;
  const t0 = M.getS().turn;
  try{ M.ACT.advance(); }catch(e){ bad.push('advance threw: '+e.message); }

  // state must commit IMMEDIATELY (not deferred behind the animation)
  ck(M.getS().turn === t0+1, 'quarter did not commit immediately ('+t0+' -> '+M.getS().turn+')');
  console.log('state commits immediately : Q'+t0+' -> Q'+M.getS().turn);

  ck(M.UI.modal && M.UI.modal.type==='advance',
     'no advance overlay (modal='+(M.UI.modal&&M.UI.modal.type)+')');
  const rows = DOC.querySelectorAll('.avrow');
  ck(rows.length>0, 'overlay rendered 0 metric rows');
  ck(!!DOC.getElementById('avBar'), 'no progress bar');
  ck(!!DOC.getElementById('avLine'), 'no typewriter line');
  console.log('overlay                   : '+rows.length+' rows, bar='+!!DOC.getElementById('avBar')+', line='+!!DOC.getElementById('avLine'));

  const from = [...rows].map(r=>r.querySelector('.avto').textContent);
  await sleep(500);
  const mid  = [...DOC.querySelectorAll('.avrow')].map(r=>r.querySelector('.avto').textContent);
  const lineTxt = DOC.getElementById('avLine') ? DOC.getElementById('avLine').textContent : '';
  const barW = DOC.getElementById('avBar') ? DOC.getElementById('avBar').style.width : '';
  console.log('values at t=0   :', from.join('  '));
  console.log('values at t=500 :', mid.join('  '));
  console.log('progress bar    :', barW);
  console.log('typewriter      :', JSON.stringify(lineTxt.slice(0,60)+(lineTxt.length>60?'...':'')));
  ck(from.join('|') !== mid.join('|'), 'counters did not move during the animation');
  ck(lineTxt.length>0, 'typewriter produced no text');
  ck(barW && barW!=='0%', 'progress bar did not advance');

  // ---- skip ----
  M.ACT.skipanim();
  await sleep(60);
  ck(!M.UI.modal || M.UI.modal.type!=='advance',
     'skip did not clear the overlay (still '+(M.UI.modal&&M.UI.modal.type)+')');
  console.log('skip                      : overlay cleared -> '+(M.UI.modal?M.UI.modal.type:'(none)'));

  // ---- pending event modal is preserved through the transition ----
  let sawPending = false;
  for(let i=0;i<40 && !M.getS().gameOver;i++){
    M.ACT.advance();
    if(M.UI.modal && M.UI.modal.type==='advance' && M.UI.modal.pending){ sawPending = true; }
    if(M.UI.modal && M.UI.modal.type==='advance') M.ACT.skipanim();
    await sleep(20);
    if(M.UI.modal && M.UI.modal.type!=='advance' && M.UI.modal.type){
      sawPending = true;
      console.log('deferred modal surfaced   : '+M.UI.modal.type);
    }
    M.UI.modal = null;
  }
  ck(sawPending, 'no deferred modal ever surfaced across 40 quarters');
  console.log('40 animated quarters       : no crashes');

  // ---- noAnim path is untouched ----
  M.UI.noAnim = true;
  M.ACT.advance();
  ck(!M.UI.modal || M.UI.modal.type!=='advance', 'noAnim=true still opened an overlay');
  console.log('noAnim bypass              : ok');

  console.log(bad.length ? ('\nANIM ISSUES:\n'+[...new Set(bad)].join('\n')) : '\nANIM CLEAN');
  process.exit(0);
})();
