
/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
/* Generated from src/00-q.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export const Q = id => document.getElementById(id);
/* The handle of the toast currently on screen, kept beside the host rather than
   on it: `h._t` worked and read as a property the DOM element happens to have,
   which is a place a checker cannot follow. One slot, one host, and the same
   "only the newest toast clears the host" behaviour. */
export let _toastT = null;
export function toast(msg, ms){
  const h = Q('toastHost'); if(!h) return;
  h.innerHTML = '<div class="toast">'+msg+'</div>';
  clearTimeout(_toastT); _toastT = setTimeout(()=>{h.innerHTML='';}, ms||2600);
}
/* What a move just did, as chips: its own node in the toast host with its own
   timer, so an action's own message and its effect can be on screen together.
   The newest effect replaces the last one. */
export let _fxT = null;
export function fxToast(html, ms){
  const h = Q('toastHost'); if(!h || !html) return;
  const old = h.querySelector('.toast.fx'); if(old) old.remove();
  const n = document.createElement('div');
  n.className = 'toast fx'; n.setAttribute('role', 'status'); n.innerHTML = html;
  h.appendChild(n);
  clearTimeout(_fxT); _fxT = setTimeout(()=>{ if(n.parentNode) n.remove(); }, ms||3600);
}
/**
 * What is in an input, or '' when the element is not there yet.
 * @param {string} id
 * @returns {string}
 */
export function inputValue(id){
  const el = Q(id);
  return (el && /** @type {HTMLInputElement} */ (el).value) || '';
}