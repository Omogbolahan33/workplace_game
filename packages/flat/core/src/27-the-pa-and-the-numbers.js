

/* --------------------------------- the pack --------------------------------- */

function acctRow(label, val, cmp, fmtFn, hint){
  const f = fmtFn || fmt;
  return '<div class="kv"><span class="muted">'+label+(hint?' <span class="tiny">'+esc(hint)+'</span>':'')+'</span>'+
    '<span>'+f(val)+(cmp===undefined?'':' <span class="tiny '+(cmp>=0?'good':'bad')+'">'+(cmp>=0?'+':'\u2212')+pct(Math.abs(cmp),0)+'</span>')+'</span></div>';
}
/* Year on year, as a share of last year's size. cur/prev - 1 read a loss
   turning into a profit as a fall (−3024% in red on a company that had just
   made money) and a near-zero base as +30295%; the change over the base's
   magnitude has the right sign, and past ±1000% the base is too small for the
   percentage to say anything, so it is not said. Same figure as before
   whenever last year was positive. */
function delta(cur, prev){
  if(prev===undefined||prev===null||prev===0) return undefined;
  const d = (cur - prev) / Math.abs(prev);
  return Math.abs(d) > 10 ? undefined : d;
}

/* ------------------------------- restructured tab --------------------------- */

/*@table:GOV_SUBS@*/