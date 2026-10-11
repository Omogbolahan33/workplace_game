/* =========================================================================
   The quarter, in pictures (VISUAL.md, M4)
   ========================================================================= */
/* Three months pass when you advance, and before the figures settle you see
   them: your home in the new season with whatever changed there, your work and
   what happened at it, the person whose news it was, and the headline if the
   world turned. Up to four pictures, each with one line the game already
   wrote. Read from the quarter's own record - the snapshot before and after,
   the journal, the digest - so nothing here is invented, and a quiet quarter
   is two quiet pictures. */
const REEL_SEASON = {harmattan: 'Harmattan. Dust on everything, cold mornings.', rain: 'The rains. The street outside is a river again.', dry: 'Dry season. Hot nights, light that comes and goes.'};
/* what changed at home between two looks, in the order a person would say it */
function homeChange(a, b){
  if(!a || !b) return '';
  if(b.tier > a.tier) return 'You moved: ' + HOME_TIERS[b.tier - 1].name + ' now.';
  if(b.tier < a.tier) return 'You moved down to ' + HOME_TIERS[b.tier - 1].name + '.';
  if(b.spouse && !a.spouse) return 'You married.';
  if(b.kids > a.kids) return b.kids - a.kids === 1 ? 'A child was born.' : (b.kids - a.kids) + ' children were born.';
  if(b.car > a.car) return 'A car in the compound.';
  if(b.gen && !a.gen) return 'You bought a generator.';
  if(b.solar && !a.solar) return 'Solar on the roof.';
  if(b.staff.length > a.staff.length) return 'Someone new works in the house.';
  if(b.staff.length < a.staff.length) return 'One of the household staff left.';
  return '';
}
/* a headline, on a newspaper, over the city */
function newsSceneSVG(st, head, vh){
  const k = sceneKit(Object.assign({ground: 'pave', towers: true, noNepa: true, seed: 41}, st), vh, 'ns');
  const add = k.add, f1 = k.f1, shade = k.shade, groundY = k.groundY, dayK = k.dayK;
  const words = String(head).toUpperCase().split(/\s+/), lines = [];
  let cur = '';
  words.forEach((w) => { if((cur + ' ' + w).trim().length > 20 && cur){ lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if(cur) lines.push(cur);
  const L = lines.slice(0, 3), paper = shade('#f1ece0', Math.max(.8, dayK)), ink = '#1d1b18';
  add('<g transform="translate(195 ' + (groundY + 44) + ') rotate(-4)">' +
    '<rect x="-150" y="-170" width="300" height="210" fill="#000" opacity=".3" transform="translate(6 8)"/>' +
    '<rect x="-150" y="-170" width="300" height="210" fill="' + paper + '"/>' +
    '<text x="0" y="-146" font-family="Georgia,serif" font-weight="700" font-size="20" text-anchor="middle" fill="' + ink + '">The Daily Ledger</text>' +
    '<path d="M-138 -138 H138 M-138 -134 H138" stroke="' + ink + '" stroke-width=".8"/>' +
    '<text x="-138" y="-127" font-family="sans-serif" font-size="6.5" fill="#555">' + esc(dateLabel(S.turn)) + ' · ' + esc(CITY().label) + '</text>' +
    L.map((l, i) => '<text x="0" y="' + (-104 + i * 24) + '" font-family="Georgia,serif" font-weight="700" font-size="20" text-anchor="middle" fill="' + ink + '">' + esc(l) + '</text>').join('') +
    '<rect x="-138" y="' + (-96 + L.length * 24) + '" width="120" height="' + (104 - L.length * 24 + 20) + '" fill="#8c8678" opacity=".55"/>' +
    Array.from({length: 7}, (_, i) => '<rect x="-8" y="' + (-92 + L.length * 24 + i * 9) + '" width="' + (138 - (i % 3) * 12) + '" height="3" fill="#9b958a"/>').join('') +
  '</g>');
  return k.finish('newsscene', head);
}
function quarterReel(before, after){
  const t0 = before ? before.turn : S.turn - 1;
  const journal = (S.journal || []).filter(function(e){ return e.turn >= t0; });
  const digest = (S.digest || []).filter(function(d){ return d.turn >= t0; });
  const frames = [];
  const home = homeLook();
  /* 1. home, in the new season, with what changed */
  frames.push({kind: 'home', html: homeSceneSVG(home, 300), tone: 'neutral',
    caption: dateLabel(S.turn) + '. ' + (homeChange(before && before.home, home) || REEL_SEASON[home.season] || '')});
  /* 2. work, with the line that mattered most there */
  if(S.biz || S.p.job){
    const pick = function(cats){
      const rank = {bad: 0, warn: 1, good: 2, neutral: 3};
      return journal.filter(function(e){ return cats.indexOf(e.cat) >= 0; })
        .sort(function(x, y){ return (rank[x.kind] === undefined ? 4 : rank[x.kind]) - (rank[y.kind] === undefined ? 4 : rank[y.kind]); })[0];
    };
    const mode = S.biz ? 'biz' : 'job', look = workLook(mode), e = pick(mode === 'biz' ? ['biz'] : ['career', 'job', 'work']);
    const quiet = S.biz ? S.biz.name + (S.biz.profit >= 0 ? ' made ' + fmt(S.biz.profit) + ' this quarter.' : ' lost ' + fmt(-S.biz.profit) + ' this quarter.')
                        : 'Another quarter at ' + (S.p.job.title || 'work') + '.';
    frames.push({kind: 'work', html: workSceneSVG(look, 300), tone: e ? e.kind : (S.biz && S.biz.profit < 0 ? 'bad' : 'neutral'), caption: e ? e.text : quiet});
  }
  /* 3. the person whose news it was */
  const news = digest.filter(function(d){ return d.kind === 'cast' && d.castId; })[0];
  const who = news ? (S.cast || []).find(function(c){ return c.id === news.castId; }) : null;
  if(who) frames.push({kind: 'person', html: '<div class="rface">' + castFaceHTML(who) + '</div>', tone: news.tone || 'neutral', caption: news.text});
  /* 4. the world, if it turned */
  const world = digest.filter(function(d){ return d.kind === 'swan' || d.kind === 'era'; })[0] ||
    journal.filter(function(e){ return e.cat === 'macro'; })[0];
  if(world){
    const text = String(world.text || ''), head = text.split(/ — |\. /)[0];
    frames.push({kind: 'world', html: newsSceneSVG(home, head, 300), tone: world.tone || 'neutral', caption: text});
  }
  return frames.slice(0, 4).map(function(f){ return Object.assign(f, {caption: f.caption.length > 150 ? f.caption.slice(0, 147) + '…' : f.caption}); });
}
/* the reel's markup: the pictures stacked, the first one showing, a dot for each */
function quarterReelHTML(frames){
  if(!frames || !frames.length) return '';
  return '<div class="reel" id="avReel">' + frames.map(function(f, i){
    return '<figure class="rframe' + (i === 0 ? ' on' : '') + ' t-' + f.tone + '" data-i="' + i + '">' + f.html +
      '<figcaption>' + esc(f.caption) + '</figcaption></figure>';
  }).join('') + '<div class="rdots">' + frames.map(function(f, i){ return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</div></div>';
}
