

/* --------------------------------- the pack --------------------------------- */

function acctRow(label, val, cmp, fmtFn, hint){
  const f = fmtFn || fmt;
  return '<div class="kv"><span class="muted">'+label+(hint?' <span class="tiny">'+esc(hint)+'</span>':'')+'</span>'+
    '<span>'+f(val)+(cmp===undefined?'':' <span class="tiny '+(cmp>=0?'good':'bad')+'">'+(cmp>=0?'+':'\u2212')+pct(Math.abs(cmp),0)+'</span>')+'</span></div>';
}
function delta(cur, prev){ return (prev===undefined||prev===null||prev===0) ? undefined : (cur/prev - 1); }

/* ------------------------------- restructured tab --------------------------- */

/*@table:GOV_SUBS@*/