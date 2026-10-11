
/* Kept as a thin wrapper so anything still calling it gets the markup. */
function whyStrip(){ return whyHTML(); }

/* ===================================================================
   P3 — in-tab grouping.

   A screen used to be one flat list of cards with no shape and no sense
   of what mattered. ROUTE_GROUPS declares, per route, which cards belong
   together under a heading and which groups start closed.

   The contract that makes this safe: a card that no group names is left
   exactly where it was. Grouping can therefore never hide or drop
   anything — if a spec is out of date the card simply stays visible,
   outside every group, and the `group` gate catches the drift.
   =================================================================== */
/*@table:ROUTE_GROUPS@*/

/* Split html into its top-level divs. Each entry keeps its own open/close
   tags and its inner html so a wrapper can be re-emitted unchanged around
   whatever grouping does to its children. */
/** what splitTop hands back: one entry per top-level block, with the wrapper it
    was found in, the markup as it arrived, and whether it is a card - or, for
    the tail that is not inside any block, just `tail` */
/**
 * @param {string} html
 * @returns {Array<{lead?:string, open?:string, inner?:string, close?:string, html?:string, card?:boolean, tail?:string}>}
 */
function splitTop(html){
  const out = [], re = /<div\b[^>]*>|<\/div>/g;
  let m, depth = 0, start = -1, open = '', olen = 0, last = 0;
  /* Some views emit a div they never close. A strict depth walk would then
     swallow every card after it, so: a block that never closes is emitted
     at the end of the string anyway, a stray </div> is ignored, and a new
     <div> at depth 0 closes off whatever was left open. Markup is passed
     through exactly as it arrived — unbalanced in, unbalanced out. */
  const emit = function(end){
    const atEnd = end >= html.length;
    out.push({
      lead:  html.slice(last, start),
      open:  open,
      inner: html.slice(start + olen, atEnd ? html.length : end),
      close: atEnd ? '' : '</div>',
      html:  html.slice(last, atEnd ? html.length : end + 6),
      card:  /class="[^"]*\bcard\b/.test(open)
    });
    last = atEnd ? html.length : end + 6;
    start = -1; open = '';
  };
  while ((m = re.exec(html))) {
    if (m[0].charAt(1) !== '/') {
      if (depth === 0) {
        if (start >= 0) emit(m.index);          // previous block never closed
        start = m.index; open = m[0]; olen = m[0].length;
      }
      depth++;
    } else if (depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) emit(m.index);
    }
  }
  if (start >= 0) emit(html.length);            // trailing unclosed block
  if (last < html.length) out.push({ tail: html.slice(last) });
  return out;
}

/* The heading a card renders under, which is what a group spec matches on.
   Cards are not consistent: most use <h3>, but several render their title in
   <h4>, so fall back to that. Tags and entities are stripped, so
   "Household &amp; family" -> "Household & family". */
function cardTitle(html){
  let m = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  if (!m) m = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
  if (!m) return '';
  return m[1].replace(/<[^>]+>/g, ' ')
             .replace(/&amp;/g, '&').replace(/&#39;/g, "'")
             .replace(/&quot;/g, '"').replace(/\s+/g, ' ')
             .trim();
}

/* A collapsible group of cards. `id` must be stable across renders and
   unique per route. State lives in S.grp (true = collapsed) so a player's
   choices survive a reload; opt.open is only the default. */
function sect(id, title, note, inner, opt){
  opt = opt || {};
  if (!S.grp) S.grp = {};
  const open = (id in S.grp) ? !S.grp[id] : !!opt.open;
  /* Collapsed: promote the members' key figures onto the header. Three is
     enough to convey the state of a group; past that it is noise. */
  let sum = '';
  if (!open && opt.tags && opt.tags.length) {
    const t = opt.tags.slice(0, 3);
    sum = '<span class="secttags">' + t.join(' · ') +
          (opt.tags.length > 3 ? ' +' + (opt.tags.length - 3) : '') + '</span>';
  }
  return '<div class="card sect">'
    + '<button class="sectHead" data-a="toggrp" data-k="' + id + '">'
    +   '<span class="sectchev">' + (open ? '&#9662;' : '&#9656;') + '</span>'
    +   '<span class="gfx sico" aria-hidden="true">' + worldGlyph(title) + '</span>'
    +   '<b>' + title + '</b>'
    +   (opt.n > 1 ? '<span class="tag">' + opt.n + '</span>' : '')
    +   sum
    +   (note ? '<span class="sectnote">' + note + '</span>' : '')
    + '</button>'
    + (open ? '<div class="sectBody">' + inner + '</div>' : '')
    + '</div>';
}

/* The key figure a card renders in its heading — "0 staff · ₦0/mo",
   "affordable: ₦147k/mo". Cards already author these; grouping promotes
   them onto the collapsed header, so closing a group hides detail without
   hiding state. Nothing here is invented by the grouping layer. */
function cardTag(html){
  const h = html.match(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/);
  if (!h) return '';
  const m = h[1].match(/<span class="tag">([\s\S]*?)<\/span>/);
  if (!m) return '';
  return m[1].replace(/<[^>]+>/g, ' ')
             .replace(/&amp;/g, '&').replace(/&#39;/g, "'")
             .replace(/&quot;/g, '"').replace(/\s+/g, ' ')
             .trim();
}

/* Group the cards found at one level of the markup, then recurse into any
   wrapper so cards nested a level down are grouped too. `st` is shared
   across the walk: a group is claimed by the first level that matches it,
   so it can never be emitted twice. */
function groupLevel(html, st){
  const units   = splitTop(html);
  const which   = units.map(function(){ return -1; });
  const members = st.groups.map(function(){ return []; });

  units.forEach(function(u, i){
    if (u.tail !== undefined || !u.card) return;
    const t = cardTitle(u.html).toLowerCase();
    if (!t) return;
    for (let g = 0; g < st.groups.length; g++) {
      if (st.used.has(g)) continue;
      const pats = st.groups[g].cards || [];
      for (let p = 0; p < pats.length; p++) {
        if (t.indexOf(pats[p].toLowerCase()) === 0) { which[i] = g; members[g].push(i); return; }
      }
    }
  });
  members.forEach(function(m, g){ if (m.length) st.used.add(g); });

  /* P5: when the rail points at a card, the group hiding it must open. A
     target the player cannot see is worse than no target. */
  const fhit = new Set();
  if (UI.focus) {
    const f = String(UI.focus).toLowerCase();
    members.forEach(function(m, g){
      if (m.some(function(j){ return cardTitle(units[j].html).toLowerCase().indexOf(f) >= 0; }))
        fhit.add(g);
    });
  }

  let out = '';
  units.forEach(function(u, i){
    if (u.tail !== undefined) { out += u.tail; return; }
    if (!u.card) { out += u.lead + u.open + groupLevel(u.inner, st) + u.close; return; }
    const g = which[i];
    if (g < 0) { out += u.html; return; }
    if (members[g][0] !== i) return;              // already emitted with its group
    const spec  = st.groups[g];
    const body  = members[g].map(function(j){
      return units[j].html.slice(units[j].lead.length);
    }).join('');
    const inner = spec.layout === 'g2' ? '<div class="grid g2">' + body + '</div>' : body;
    const tags = members[g].map(function(j){ return cardTag(units[j].html); })
                           .filter(Boolean);
    out += u.lead + sect(st.key + '.' + g, spec.t, spec.note || '', inner,
                         /* with the explanations folded away (the world-first
                            default) the screen's first section opens and the rest
                            start closed - one-line headers under the city and the
                            tiles - unless "take me there" named a card in one; (i)
                            brings the old defaults back, and the player's own
                            choice always wins */
                         /* a section folded only by that default shows its picture
                            and title, not figures - fewer words is the point, and the
                            app's sections, drawn by React, say the same thing */
                         { open: (!!spec.open && (!!UI.details || g === 0)) || fhit.has(g), n: members[g].length,
                           tags: (spec.open && !((st.key + '.' + g) in (S.grp || {}))) ? [] : tags });
  });
  return out;
}

/* Gather a route's cards into the groups its spec declares. Cards no group
   names are emitted in place, so a stale spec degrades to "ungrouped"
   rather than to "missing". */
function groupRoute(html, key){
  const groups = ROUTE_GROUPS[key];
  if (!groups || !groups.length) return html;
  return groupLevel(html, { groups: groups, key: key, used: new Set() });
}

function routeViewInner(){
  const t = UI.tab, sub = UI.sub;
  if(t === 'work'){
    if(sub === 'career')    return viewCareer();
    if(sub === 'household') return viewHousehold();
    if(sub === 'life')      return viewLife();
    if(sub === 'rival')     return viewRival();
    if(sub === 'levers')    return viewLevers();
    /* business: agenda first, then the machine, then the people in it. The
       cards are emitted flat because groupRoute() gathers them into
       sections and restores the two-column layout inside "Where you trade". */
    /* portfolioBar() is the company switcher and the only control that starts
       a SECOND company. It was emitted by viewWork(), and viewWork() is dead
       code — nothing has called it since the tab reorganisation, so the
       button existed in the source, had an action, had a modal, and was on
       no screen any player could reach. Mounted here, where you run a
       company and would want another. */
    return viewAgenda() + (S.biz
      ? portfolioBar() + viewCommitments() + viewWorkingCapital() + viewEngine() + viewOutlets()
        + viewContracts() + viewStaffDeep() + viewBiz()
      : viewBiz());
  }
  if(t === 'money'){
    /* Position leads: it is the answer to "how am I doing", so the tab opens
       on net worth and runway and hands the levers to the other sub-tabs. */
    if(sub === 'position') return viewMoneyPosition();
    if(sub === 'budget')   return viewMoneyBudget();
    if(sub === 'property') return viewMoneyProperty();
    if(sub === 'deals')    return viewDeals();
    if(sub === 'group')    return viewGroup();
    /* markets: emitted flat; groupRoute() turns it into priority order */
    return viewInvestPortfolio() + viewInvestMarkets();
  }
  if(t === 'governance')   return viewGovernance();
  if(t === 'legacy'){
    if(sub === 'people')    return viewPeople();
    if(sub === 'ambition')  return viewLegacy();
    if(sub === 'chronicle') return viewLedgerChronicle();
    if(sub === 'season')    return viewSeason();
    if(sub === 'settings')  return viewLedgerSettings();
    return viewCareerRecord();                 /* record is the run's own story */
  }
  return viewOverview();
}
/* The single dispatcher: the screen, then its grouping. The "what next"
   card that used to be prepended here lives in the header bell now (§22.13),
   so a route owns its whole height and the guidance is in one counted place
   rather than repeated on twenty screens. */
function routeView(){ return groupRoute(routeViewInner(), routeKey()); }
/* A finish line you cannot see coming is just a surprise. This strip is on
   every screen for the whole of a season run, because the point of fixing the
   end in advance is that you can feel it getting closer and plan badly
   against it if you like. */
/* The season, in the header, small.

   It used to be a three-line paragraph dropped into the top of every screen:
   name, code, quarters left, and then a second line repeating the end date and
   the percentage played. That is a lot of furniture to climb over on the way to
   the numbers, twenty-four screens at a time. What you actually need at a
   glance is how long you have left; everything else is a hover away. */
function seasonChipHTML(){
  const st = seasonStatus();
  if(!st) return '';
  const urgent = st.left <= 4;
  const s = S.season;
  /* st.left drops by one each quarter, so the pinned state cannot be keyed on
     it the way the ? popover is keyed on the route: this season is the only
     season, so a plain flag is enough */
  return '<div class="seachip'+(urgent?' warn':'')+(UI.seaOpen?' open':'')+
      '" data-a="seasontoggle" title="Season '+esc(s.code||'')+'">'+
    '<b>'+st.left+'</b> <span class="sealbl">left</span>'+
    '<div class="seapop">'+
      '<b>'+esc(s.name||'Season')+'</b> <span class="chip">'+esc(s.code||'')+'</span>'+
      '<div class="tiny muted" style="margin-top:6px">Ends Q'+st.end.q+' '+st.end.year+
      ' &middot; '+st.total+' quarters in all &middot; '+Math.round(st.done)+'% played</div>'+
      '<div class="tiny muted" style="margin-top:5px">The run stops at the finish line'+
      (st.hardStop?'.':', or you can keep going afterwards.')+'</div>'+
    '</div></div>';
}
/* Kept: the strip that used to sit in the page body is now the header chip. */
function seasonStrip(){ return seasonChipHTML(); }
/* The score, in the report. Every axis is shown, not just the total, because
   two runs with the same total can be entirely different runs — and a player
   who built a great business and burned their health should be able to see
   exactly where that cost them. */
function scoreBlock(){
  const sc = scoreRun();
  const rows = SEASON_AXES.map(function(ax){
    const v = sc.axes[ax.id] || 0;
    return '<div style="margin-bottom:7px"><div class="between">'+
      '<span class="tiny"><b>'+ax.label+'</b> <span class="muted">'+ax.weight+'%</span></span>'+
      '<span class="mono tiny">'+v.toFixed(0)+'</span></div>'+
      bar(v, 100, 'var(--acc)')+
      '<div class="tiny muted" style="margin-top:2px">'+esc(ax.why)+'</div></div>';
  }).join('');
  return '<hr class="sep"><div class="between" style="margin-bottom:8px">'+
    '<b>Season score</b><span class="mono" style="font-size:19px">'+sc.total+'<span class="tiny muted">/1000</span></span></div>'+
    rows+
    '<div class="tiny muted" style="margin-top:8px">Ranked <b>'+esc(sc.rank)+'</b>. '+
    'A season score is only meaningful beside other people playing the same season, '+
    'with the same seed and the same finish line.</div>';
}