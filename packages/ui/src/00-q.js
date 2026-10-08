
/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
const Q = id => document.getElementById(id);
/* The handle of the toast currently on screen, kept beside the host rather than
   on it: `h._t` worked and read as a property the DOM element happens to have,
   which is a place a checker cannot follow. One slot, one host, and the same
   "only the newest toast clears the host" behaviour. */
let _toastT = null;
function toast(msg, ms){
  const h = Q('toastHost'); if(!h) return;
  h.innerHTML = '<div class="toast">'+msg+'</div>';
  clearTimeout(_toastT); _toastT = setTimeout(()=>{h.innerHTML='';}, ms||2600);
}
/**
 * What is in an input, or '' when the element is not there yet.
 * @param {string} id
 * @returns {string}
 */
function inputValue(id){
  const el = Q(id);
  return (el && /** @type {HTMLInputElement} */ (el).value) || '';
}