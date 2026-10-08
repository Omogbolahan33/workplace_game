// Minimal DOM + storage stub so index.html's script can run under node.
function mkEl(id){
  const el = {
    id, innerHTML:'', value:'', textContent:'', style:{}, dataset:{},
    classList:{add(){},remove(){},toggle(){},contains(){return false}},
    addEventListener(){}, removeEventListener(){}, closest(){return null},
    focus(){}, select(){}, click(){}, querySelector(){return null},
    querySelectorAll(){return []}, appendChild(){}, remove(){}, setAttribute(){}, getAttribute(){return null}
  };
  return el;
}
const _els = {};
global.document = {
  getElementById(id){ if(!_els[id]) _els[id]=mkEl(id); return _els[id]; },
  querySelector(){ return null; },
  querySelectorAll(){ return []; },
  createElement(){ return mkEl('tmp'); },
  addEventListener(){}, removeEventListener(){},
  body: mkEl('body'), documentElement: mkEl('html')
};
/* A window that remembers what was registered on it.

   This used to be `addEventListener(){}` — a stub that swallowed every listener
   the game registers at load. That is one line, and it cost a real bug its
   gate: the install-prompt handler (and the service-worker one) could not be
   fired by anything, so no test in the suite could ever have noticed that the
   Install button was unreachable. A harness that silently drops the code under
   test is worse than no harness, because the suite still says CLEAN. */
const _winHandlers = {};
global.window = {
  addEventListener(t, f){ (_winHandlers[t] = _winHandlers[t] || []).push(f); },
  removeEventListener(t, f){ const a = _winHandlers[t] || []; const i = a.indexOf(f); if (i >= 0) a.splice(i, 1); },
  dispatchEvent(ev){
    const list = _winHandlers[ev && ev.type] || [];
    list.slice().forEach(f => { try { f(ev); } catch (e) { console.warn('window.' + ev.type + ' handler threw: ' + e.message); } });
    return true;
  },
  scrollTo(){}, localStorage:null, location:{href:''}
};
global.addEventListener = global.window.addEventListener;
global.removeEventListener = global.window.removeEventListener;
const _store = {};
global.localStorage = {
  getItem(k){ return Object.prototype.hasOwnProperty.call(_store,k)?_store[k]:null; },
  setItem(k,v){ _store[k]=String(v); },
  removeItem(k){ delete _store[k]; },
  clear(){ for(const k in _store) delete _store[k]; }
};
global.window.localStorage = global.localStorage;
global.navigator = { userAgent:'node', clipboard:{ writeText(){ return Promise.resolve(); } } };
global.alert = ()=>{}; global.confirm = ()=>true; global.prompt = ()=>null;
/* Every gate fixture must pass a fixed seed (4242, by convention — see the
   note in commit.js). An unseeded newGame() rolls a fresh RNG per process, so
   the gate plays a different world every run; slider.js failed roughly one
   time in forty for exactly that reason, and a suite that fails one time in
   forty is a suite people learn to re-run instead of fixing. */
global.requestAnimationFrame = f=>setTimeout(f,0);
global.setTimeout = setTimeout;
