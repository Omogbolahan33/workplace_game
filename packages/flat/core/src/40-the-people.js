/* =========================================================================
   The people in your life, in your scenes (VISUAL.md, M9)
   ========================================================================= */
/* The cast remembers what you did, gets older, richer or poorer, and dies.
   Here they are where you can see it. On the People screen they are gathered
   in your compound, standing as close to you as they feel - the warm ones at
   your shoulder, the cold ones at the edge with their arms folded - each in
   their own colours, grey with age, in agbada once money has found them, with
   a stick past seventy; those who have died are remembered on an easel. Your
   household stands with you. At home, whoever you have a story open with is at
   your gate. At work, the rival's place is across the street, as big as their
   business, and when they are spoiling for a fight they are standing outside
   it. Read from the cast, the threads and the rival; nothing random. */
function peopleLook(){
  const air = homeLook();
  const cast = (S.cast || []).filter(function(c){ return !(c.tags && (c.tags.emigrated || c.tags.abroad)); });
  const story = {};
  (S.threads || []).forEach(function(t){ if(t.castId) story[t.castId] = true; });
  const alive = cast.filter(function(c){ return c.alive; }).sort(function(a, b){ return b.relation - a.relation; }).map(function(c){
    const L = castLook(c);
    return {id: c.id, name: c.name, relation: c.relation, age: c.age, rich: (c.wealth || 0) > 65, story: !!story[c.id],
      shirt: hueHex(L.hue, .5, c.tags && c.tags.broke ? .42 : .58), skin: L.skin};
  });
  const gone = cast.filter(function(c){ return !c.alive; }).map(function(c){ return c.name; });
  return Object.assign({}, air, {alone: true, people: alive.slice(0, 10), gone: gone.slice(0, 3),
    label: 'The people in your life: ' + alive.length + ' with you' + (gone.length ? ', ' + gone.length + ' remembered' : '')});
}
/* a person of the cast, drawn: their colours, their age, their money */
function castFigure(k, p, x, y, scale, folded){
  const person = k.person;
  let s = person(x, y, {shirt: p.shirt, skin: p.skin, grey: p.age >= 58, dress: p.rich, cap: p.rich ? '#8a6a2c' : null, scale: scale});
  if(p.age >= 70) s += '<path d="M' + (x + 9 * scale).toFixed(1) + ' ' + (y - 16 * scale).toFixed(1) + ' l2 ' + (16 * scale).toFixed(1) + '" stroke="#6a4b2c" stroke-width="' + (1.4 * scale).toFixed(1) + '" stroke-linecap="round"/>';
  if(folded) s += '<path d="M' + (x - 6 * scale).toFixed(1) + ' ' + (y - 22 * scale).toFixed(1) + ' h' + (12 * scale).toFixed(1) + '" stroke="#111" stroke-width="' + (2.6 * scale).toFixed(1) + '" stroke-linecap="round" opacity=".6"/>';
  if(p.story) s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - 52 * scale).toFixed(1) + '" r="' + (3.4 * scale).toFixed(1) + '" fill="#f5b301" stroke="#0b1017" stroke-width="1"/>';
  const said = p.name + ' · ' + relationWord(p.relation) + (p.story ? ' · a story is open' : '');
  /* in the gathering a person is a control: tapping them opens their card */
  const tap = p.tap ? ' class="hot" data-a="hot" data-k="person" data-c="' + esc(p.id) + '" role="button" tabindex="0" aria-label="' + esc(said) + '"' : '';
  return '<g' + tap + '><title>' + esc(said) + '</title>' + s + '</g>';
}
/* the gathering: you in the middle, your household beside you, the cast as
   close as they feel, the dead remembered */
function peopleSceneSVG(st, vh){
  const layer = function(k){
    const gy = k.groundY, person = k.person, out = [];
    /* the remembered, on an easel at the back */
    (st.gone || []).forEach(function(n, i){
      const x = 300 + i * 26, y = gy + 18;
      out.push('<g><title>' + esc('Remembered: ' + n) + '</title><path d="M' + (x + 4) + ' ' + (y + 44) + ' l8 -44 l8 44 M' + (x + 12) + ' ' + y + ' v44" stroke="#6a4b2c" stroke-width="1.4" fill="none"/>' +
        '<rect x="' + (x - 1) + '" y="' + (y - 6) + '" width="26" height="30" fill="#1b1b1e" stroke="#d4af37" stroke-width="1.3"/><circle cx="' + (x + 12) + '" cy="' + (y + 4) + '" r="5" fill="#6b4a32"/><path d="M' + (x + 4) + ' ' + (y + 20) + ' q8 -10 16 0z" fill="#2b2b2b"/></g>');
    });
    /* the cast: warm ones near, cold ones further, hostile ones at the edge */
    const people = st.people || [];
    let left = 0, right = 0;
    people.forEach(function(p, i){
      const hostile = p.relation < -20, side = i % 2 ? 1 : -1, rank = side < 0 ? left++ : right++;
      const dist = hostile ? 175 : 46 + rank * 30 + Math.max(0, 70 - p.relation) * .55;
      const x = Math.max(16, Math.min(374, 195 + side * dist)), y = gy + 96 - Math.min(rank, 5) * 4;
      const scale = hostile ? 1.35 : Math.max(1.15, 1.75 - rank * .12);
      out.push(castFigure(k, Object.assign({tap: true}, p), x, y, scale, hostile || p.relation < 5));
    });
    /* your household, with you */
    if(st.spouse) out.push(person(222, gy + 112, {shirt: '#b8275f', dress: true, gele: '#d4a017', skin: '#5a3b27', scale: 1.85}));
    for(let i = 0; i < Math.min(4, st.kids || 0); i++) out.push(person(168 - i * 20, gy + 116, {shirt: ['#e7b931', '#2fae6a', '#4a8fe0', '#e05a4a'][i], skin: '#7d573b', scale: 1.05 + Math.min(.6, (st.kidAge || 0) * .05)}));
    out.push('<g class="hot" data-a="hot" data-k="you" role="button" tabindex="0" aria-label="You"><title>You</title>' + person(195, gy + 114, {shirt: S.p && S.p.job ? '#ece7dc' : '#3c79c4', legs: '#20242c', tie: !!(S.p && S.p.job), scale: 2, grey: st.age >= 50}) + '</g>');
    return out.join('');
  };
  return homeSceneSVG(Object.assign({}, st, {extra: layer, label: st.label}), vh);
}
/* at home, whoever a story is open with is at your gate */
function storyVisitor(){
  const th = (S.threads || []).filter(function(t){ return t.castId; })[0];
  return th ? (S.cast || []).find(function(x){ return x.id === th.castId && x.alive; }) || null : null;
}
function storyVisitorLayer(){
  const c = storyVisitor();
  if(!c) return null;
  const L = castLook(c), p = {name: c.name, relation: c.relation, age: c.age, rich: (c.wealth || 0) > 65, story: true, shirt: hueHex(L.hue, .5, .58), skin: L.skin};
  return function(k){ return castFigure(k, p, 334, k.groundY + 96, 1.4, c.relation < 5); };
}
/* two layers as one, for a scene that has both */
function bothLayers(a, b){
  if(!a) return b; if(!b) return a;
  return function(k){ return a(k) + b(k); };
}
