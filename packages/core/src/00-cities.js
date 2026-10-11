
"use strict";
/* =========================================================================
   LEDGER — A Life in Decisions
   Section 1: World data (profiles, assets, goods, business types, names)
   ========================================================================= */
/*@table:CITIES@*/
const CUR = ()=> (S && S.city) ? (CITIES.find(c=>c.id===S.city)||CITIES[0]).cur : '₦';

/*@table:PROFILES@*/

/* Investable assets. ret/vol are QUARTERLY, nominal, in local currency.
   fx:true  -> return is earned in USD then converted (so devaluation helps). */
/*@table:ASSETS@*/

/*@table:GOODS@*/

/*@table:BIZ@*/

/*@table:FIRST@*/
/*@table:LAST@*/
/*@table:TRAITS@*/

/* =========================================================================
   Section 2: Utilities, RNG, formatting
   ========================================================================= */
/*@table:R@*/
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function fmt(n, opt){
  opt = opt||{};
  if(n===null||n===undefined||isNaN(n)) return CUR()+'—';
  const neg = n<0; const abs = Math.abs(n); let s;
  if(abs>=1e12) s=(abs/1e12).toFixed(2)+'tr';
  else if(abs>=1e9) s=(abs/1e9).toFixed(2)+'bn';
  else if(abs>=1e6) s=(abs/1e6).toFixed(abs>=1e8?1:2)+'m';
  else if(abs>=1e4) s=(abs/1e3).toFixed(0)+'k';
  else if(abs>=1e3) s=(abs/1e3).toFixed(1)+'k';
  else s=Math.round(abs).toLocaleString();
  return (neg?'-':'')+(opt.sign&&!neg?'+':'')+CUR()+s;
}
const pct = (v,d) => (v*100).toFixed(d===undefined?1:d)+'%';
const dateLabel = t => 'Q'+((t%4)+1)+' '+(START_YEAR + Math.floor(t/4));
const START_YEAR = 2026;
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
/* A folded explanation, the redesign's central move: the label is always there,
   the paragraph is not. It lives in core, not the ui, because both renderers
   write it — the single file's string screens and the app's React screens — and
   because core's own strips use it (the open stories on Overview). It was in the
   ui for one afternoon, and the module build caught it the moment a core strip
   called it: `foldHTML is not defined`, in a test that had nothing to do with
   folds. The single-file build hid the bug completely, which is the whole reason
   the modular build and its tests exist. */
function foldHTML(label, html){
  return '<details class="fold"><summary>'+esc(label)+'</summary><div>'+html+'</div></details>';
}
function bar(v, max, color){
  const p = clamp((v/max)*100, 0, 100);
  /* gfx: a bar is a picture of a number, and the visual audit counts it as one */
  return '<div class="bar gfx"><i style="width:'+p+'%;background:'+(color||'var(--acc)')+'"></i></div>';
}