
/* =========================================================================
   LEDGER's pictures: icons, gauges, rings and the HUD
   ========================================================================= */
/* Core's half of what the player sees: every picture is a function that
   returns markup, with no DOM and no random draw, so the single file and the
   app draw the same one and a test can hold it. The scene behind every screen
   is your home (33-your-home.js); worldHTML() puts it under the HUD. */
/* LEDGER's own pictures: one hand of thin gold ink on the dark page, the way an
   entry is inked in a ledger. Every icon is a few strokes on a 24-unit grid,
   drawn here as inline SVG so the file stays one file with no requests, and
   coloured by whatever holds it (currentColor) so a state can tint it. */
function worldIco(name){
  const P = {
    skyline:'<path d="M3 21V11h5v10M8 21V5h6v16M14 21v-8h7v8M2 21h20M10.5 9h1M10.5 13h1M17 16h1"/>',
    case:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.5h18M11 12.5v2h2v-2"/>',
    coins:'<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 10v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-4M5 14v4c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-4"/>',
    columns:'<path d="M12 3 3 8.5h18zM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v12M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2M9.5 9h6M9.5 12.5h6M9.5 16h3.5"/>',
    shop:'<path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10c0 1.3 1 2.3 2.2 2.3S7.4 11.3 7.4 10c0 1.3 1 2.3 2.2 2.3s2.2-1 2.2-2.3c0 1.3 1 2.3 2.2 2.3s2.2-1 2.2-2.3c0 1.3 1 2.3 2.2 2.3S21 11.3 21 10M10 20v-5h4v5"/>',
    tie:'<path d="M9.5 3h5l-1.3 3.2L15.5 16 12 20.5 8.5 16l2.3-9.8z"/>',
    home:'<path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M12 17.5s-3-1.7-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 1.9-3 3.6-3 3.6z"/>',
    pulse:'<path d="M3 12.5h4l2.2-5.5 4 11 2.3-5.5H21"/>',
    swords:'<path d="M4 4l11 11M20 4 9 15M13 17l4-4M7 13l4 4M5.5 18.5 3.5 20.5M18.5 18.5l2 2"/>',
    sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    bars:'<path d="M5.5 20v-6M11.5 20V8M17.5 20V4.5M3 20.5h18"/>',
    jar:'<path d="M8 3.5h8M9 3.5v2.3C6.6 7 5.5 9 5.5 11.5V19a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-7.5c0-2.5-1.1-4.5-3.5-5.7V3.5M5.5 14h13"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 6.5l2.5 2.5M13.5 9 16 11.5"/>',
    trend:'<path d="M3 17.5l6-6 4 4 8-8M15.5 7.5H21V13"/>',
    hands:'<path d="M2 12.5 6.5 8H11l2.5 1.8L16 8h6M6.5 8l4.3 7.2c.6 1 1.9 1.2 2.7.4M13.5 15.6l1.4 1.4c.8.8 2.1.6 2.6-.4l-4-6.8M2 15.5h4M18 15.5h4"/>',
    towers:'<path d="M3 21V7.5L9 4.5v16.5M9 21V9h12v12M2 21h20M12.5 12.5h2M17 12.5h1.5M12.5 16.5h2M17 16.5h1.5M5.5 10h1M5.5 14h1"/>',
    box:'<path d="M3 7.5 12 3.5l9 4-9 4zM3 7.5v9.5l9 4 9-4V7.5M12 11.5V21"/>',
    book:'<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
    table:'<path d="M3 10.5h18M5.5 10.5V19M18.5 10.5V19M8 10.5V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3.5"/>',
    ballot:'<path d="M4 13.5h16V21H4zM8 13.5V4h8v9.5M10 9l1.8 1.8L15 7.3"/>',
    seal:'<circle cx="12" cy="9.5" r="5.5"/><path d="M9 14.4 7.5 21l4.5-2.6 4.5 2.6-1.5-6.6"/>',
    gavel:'<path d="m13.5 4.5 6 6M11 7l6 6M14.5 8.5l-9 9a1.4 1.4 0 0 0 2 2l9-9M3 21h9"/>',
    medal:'<circle cx="12" cy="15" r="5.5"/><path d="M8 3l3.2 6.6M16 3l-3.2 6.6M12 12.8l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5M16 5.3a3 3 0 0 1 0 5.4M20.5 20c0-2.6-1.4-4.6-3.6-5.3"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    open:'<path d="M3 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3zM21 5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6z"/>',
    flag:'<path d="M5 21V3.5M5 4h12.5l-2.5 4 2.5 4H5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
    note:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    heart:'<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>',
    bolt:'<path d="M13 2.5 4.5 14h7l-1 7.5L19 10h-7z"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14.2s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/>',
    star:'<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    glass:'<path d="M6.5 3h11M6.5 21h11M7.5 3c0 5.5 9 5.5 9 9s-9 3.5-9 9M16.5 3c0 5.5-9 5.5-9 9s9 3.5 9 9M10 18.5h4"/>',
    door:'<path d="M4 21h16M6 21V3.5h9V21M15 4.5l4 2V21M12 12.5h.01"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.01"/>',
    spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    meal:'<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16.5 3c-2 0-3 2.2-3 5.2s1.2 4 3 4V21"/>',
    bank:'<path d="M3 10l9-6 9 6M5.5 10.5v7M9.5 10.5v7M14.5 10.5v7M18.5 10.5v7M3 20.5h18"/>',
    cart:'<path d="M3 4h2.2l2.2 11h10.8l2-8H6.3"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    cap:'<path d="M2 9.5 12 4.5l10 5-10 5zM6 11.5v4.8c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.8M21 10v5"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    hire:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5M19 8v6M16 11h6"/>',
    warn:'<path d="M12 3.5 2.5 20h19zM12 9.5v5M12 17.2v.01"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
    pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    horn:'<path d="M3 10v4l11 5V5zM14 8.5h2.5a3.5 3.5 0 0 1 0 7H14M6 14.5l1 5h3l-1-4"/>',
    tag:'<path d="M3 12.5V4h8.5l9.5 9.5-8.5 8.5z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    wrench:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-9.5 9.5a2.1 2.1 0 0 1-3-3l9.5-9.5a4 4 0 0 0-2-2z"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11M12 15v2"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8C10.5 4.5 6.5 4 6.5 6.5S12 8 12 8M12 8c1.5-3.5 5.5-4 5.5-1.5S12 8 12 8"/>',
    disk:'<path d="M5 3.5h11l3.5 3.5v13.5H5zM8 3.5v5h7v-5M8 20.5v-6.5h8v6.5"/>',
    chat:'<path d="M4 5h16v11H9.5L4 20.5z M8.5 9.5h7M8.5 12.5h4.5"/>',
    truck:'<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3.5 3.5v3h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    laptop:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19l-2-4h-15z"/>',
    leaf:'<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19c3-4 6-6.5 10-8.5"/>',
    crane:'<path d="M6 21V3.5M3 21h8M6 4h14M6 8l4-4M16 4v4M16 8v3.5M14.5 11.5h3v2h-3z"/>',
    brush:'<path d="M19.5 3.5 10 13M8 14.2c-2 0-3.5 1.6-3.5 3.6 0 1.4-.8 2.2-1.7 2.7 4 .9 7.7-.5 7.7-4 0-1.2-1-2.3-2.5-2.3z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    factory:'<path d="M3 21V11l5 3V11l5 3V11l5 3V5h3v16zM2 21h20M7 17.5h2M12 17.5h2"/>',
    briefs:'<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 11.5h8M8 15h5"/>',
    up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
    down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
    car:'<path d="M3.5 16.5V12l2-5h13l2 5v4.5zM3.5 12h17"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    shirt:'<path d="M8.5 3.5 4 6.5l2 4 2-1V20.5h8V9.5l2 1 2-4-4.5-3c-.5 1.5-2 2.5-3.5 2.5S9 5 8.5 3.5z"/>',
    dumbbell:'<path d="M3 12h18M5.5 8v8M8.5 6.5v11M15.5 6.5v11M18.5 8v8"/>',
    sofa:'<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 17.5V13a2 2 0 0 1 4 0v1.5h10V13a2 2 0 0 1 4 0v4.5zM5 17.5V20M19 17.5V20"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  };
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(P[name] || P.spark)+'</svg>';
}
/* A line of the budget, as a jar: how full it is against what that line of
   life actually needs, with the need drawn as a dashed mark. Green at or above
   the mark, amber near it, red well short - "below need" becomes a jar you can
   see is short. */
function budgetJarHTML(v, need){
  const r = need > 0 ? Math.min(1.25, v / need) : (v > 0 ? 1.25 : 0);
  const top = 32 - Math.round(24 * Math.min(1, r / 1.25));
  const tone = r >= 1 ? 'var(--good)' : r >= 0.75 ? 'var(--warn)' : 'var(--bad)';
  return '<svg class="jar" viewBox="0 0 26 34" role="img" aria-label="'+Math.round(r * 100)+'% of what it needs">'+
    (r > 0 ? '<rect x="4.5" y="'+top+'" width="17" height="'+(32 - top)+'" rx="2.5" fill="'+tone+'" opacity=".85"/>' : '')+
    '<path d="M8.5 2.5h9M9.5 2.5v4C6.5 7.6 3.5 9.6 3.5 13v16a3 3 0 0 0 3 3h13a3 3 0 0 0 3-3V13c0-3.4-3-5.4-6-6.5v-4" fill="none" stroke="var(--acc)" stroke-width="1.5" stroke-linejoin="round"/>'+
    '<path d="M3.5 13h19" stroke="#e8eef5" stroke-width="1" stroke-dasharray="2 2"/>'+
  '</svg>';
}
/* Whether a budget line covers what that part of life needs, said in the
   line itself under its amount: a word in the jar's colour, the shortfall in
   the title too. */
function budgetMarkHTML(v, need){
  return v >= need ? '<span class="bmark good">covered</span>'
    : '<span class="bmark bad" title="below need '+fmt(need)+'">below need '+fmt(need)+'</span>';
}
/* Your month as one bar: each part of life a segment as wide as its share of
   what you earn, in the order the lines are listed, with a mark where your
   income ends - a budget past the mark is visibly paid for by savings or debt.
   Under it, the surplus or the overspend, rising or falling. */
const BUDGET_TINT = {housing:'#f5b301', food:'#2fd47a', transport:'#5aa9ff', lifestyle:'#a78bfa',
  family:'#ff9f43', learning:'#4dd0c8', giving:'#f78fb3'};
function budgetSplitHTML(){
  const b = S.fin.budget, inc = salaryMonthly() + (S.informalIncome||0) + passiveMonthly(), total = budgetMonthly();
  const span = Math.max(inc, total, 1), net = inc - total;
  const segs = BUDGET_KEYS.map(function(k){
    const v = b[k[0]] || 0; if(v <= 0) return '';
    const say = k[1].split(' ')[0]+' '+fmt(v);
    return '<i style="width:'+(v / span * 100).toFixed(2)+'%;background:'+BUDGET_TINT[k[0]]+'" title="'+esc(say)+'"></i>';
  }).join('');
  return '<div class="bsplit">'+
    '<span class="gfx bsbar" role="img" aria-label="'+esc('Committing '+fmt(total)+' of '+fmt(inc)+' a month')+'">'+segs+
      '<b class="bsinc" style="left:'+(inc / span * 100).toFixed(2)+'%" title="what you earn: '+fmt(inc)+'"></b></span>'+
    '<div class="bskey">'+BUDGET_KEYS.map(function(k){
      return '<span><i style="background:'+BUDGET_TINT[k[0]]+'"></i>'+esc(k[1].split(' ')[0])+'</span>'; }).join('')+'</div>'+
    '<div class="qnet '+(net >= 0 ? 'good' : 'bad')+'"><span class="gfx" aria-hidden="true">'+worldIco(net >= 0 ? 'up' : 'down')+'</span>'+
      '<span class="tiny muted">'+(net >= 0 ? 'Surplus' : 'Overspending')+'</span><b class="mono">'+fmt(Math.abs(net))+'/mo</b></div>'+
  '</div>';
}
/* The budget's presets as picture buttons: what each one is for, drawn. The
   inflation adjustment is lit when prices have outrun the budget. */
function budgetPresetsHTML(){
  const eroded = S.cumInfl / Math.max(0.0001, S.budgetInfl || 1), late = eroded > 1.18;
  const btn = function(ico, attrs, label, cls){
    return '<button class="btn sm pbtn'+(cls ? ' '+cls : '')+'" '+attrs+'><span class="gfx" aria-hidden="true">'+worldIco(ico)+'</span>'+label+'</button>';
  };
  return '<div class="presets">'+
    btn('lock', 'data-a="preset" data-p="survive"', 'Survival mode')+
    btn('sliders', 'data-a="preset" data-p="balanced"', 'Balanced')+
    btn('cap', 'data-a="preset" data-p="invest"', 'Invest in myself')+
    btn('home', 'data-a="preset" data-p="flex"', 'Status &amp; family')+
    btn('trend', 'data-a="infladj"', 'Adjust for inflation'+(late ? ' (+'+pct(eroded - 1, 0)+')' : ''), late ? 'primary' : '')+
  '</div>';
}
/* What a thing does to you, drawn: the stat's picture with a rising or falling
   mark and the size of it, toned by whether it helps (less stress helps), and
   what it costs to keep. */
function effectMarksHTML(eff, upkeep){
  const ICON = {stress:'bolt', happy:'smile', health:'heart', rep:'star', family:'home',
                tech:'cap', finance:'cap', ops:'cap', hustle:'cap', network:'people'};
  let h = Object.keys(eff || {}).map(function(k){
    const v = eff[k], good = k === 'stress' ? v < 0 : v > 0;
    return '<span class="emark '+(good ? 'good' : 'bad')+'" title="'+k+' '+(v > 0 ? '+' : '')+v+'">'+
      worldIco(ICON[k] || 'spark')+worldIco(v > 0 ? 'up' : 'down')+'<b>'+Math.abs(v)+'</b></span>';
  }).join('');
  if(upkeep) h += '<span class="emark" title="'+fmt(upkeep)+' a month to keep">'+worldIco('coins')+'<b>'+fmt(upkeep)+'/mo</b></span>';
  return h;
}
/* Which picture: each tab and screen by its id, a kind of company by its id,
   anything else - a section, a move - by what it is about. The tabs, the
   second level, the section headers, the tiles and the HUD all draw from here,
   in both renderers. */
function worldGlyph(key){
  const k = String(key || '').toLowerCase();
  const exact = {overview:'skyline', work:'case', money:'coins', governance:'columns', legacy:'scroll',
    business:'shop', career:'tie', household:'home', life:'pulse', rival:'swords', levers:'sliders',
    position:'bars', budget:'jar', property:'key', markets:'trend', deals:'hands', group:'towers',
    pack:'box', register:'book', board:'table', votes:'ballot', deed:'seal', bids:'gavel',
    record:'medal', people:'people', ambition:'target', chronicle:'open', season:'flag', settings:'gear',
    retail:'box', food:'meal', logi:'truck', tech:'laptop', agri:'leaf', estate:'crane', creative:'brush',
    mfg:'factory', proserv:'briefs', energy:'sun'};
  if(exact[k]) return worldIco(exact[k]);
  /** @type {Array<[RegExp, string]>} */
  const map = [
    [/where you stand|net worth|standing/, 'pin'], [/this quarter|agenda|waiting|needs you|first quarter/, 'calendar'],
    [/background|economy|\btimes\b|\bera\b|weather/, 'globe'], [/risk|pressure|exposure|danger|warning/, 'warn'],
    [/raise|promot/, 'trend'], [/interview|job|career|work|shift|deliver|overtime|employ|capabilit/, 'case'],
    [/lunch|dinner|network|friend|introduc/, 'meal'], [/deal|commit|partner/, 'hands'],
    [/pass|decline|ignore/, 'lock'], [/hire|recruit|candidate/, 'hire'], [/staff|team|people|cast|rival/, 'people'],
    [/fire|let go|dismiss|resign/, 'door'], [/loan|borrow|repay|debt|bank|overdraft|credit/, 'bank'],
    [/sell|dispose/, 'tag'], [/laptop|computer/, 'laptop'], [/generator|solar|inverter|power/, 'plug'],
    [/car\b|vehicle/, 'car'], [/wardrobe|clothes/, 'shirt'], [/gym|fitness/, 'dumbbell'], [/furnish|flat/, 'sofa'],
    [/phone/, 'phone'], [/buy|purchase|goods|possession/, 'cart'],
    [/rent|lease|house|home|property|land|plot/, 'key'], [/doctor|health|hospital|check|exercise/, 'heart'],
    [/rest|holiday|leave|sleep|break|month off/, 'moon'], [/family|child|parent|wedding|spouse|marr|household/, 'home'],
    [/learn|course|study|skill|train|school|mba/, 'cap'], [/market|stock|equit|bond|treasury|fund|invest|ajo|gold|crypto|dollar|portfolio/, 'trend'],
    [/price/, 'tag'], [/advert|marketing|brand|campaign/, 'horn'],
    [/start|company|business|outlet|unit|open|trade|machine|capacity|hustle/, 'shop'],
    [/vote|resolution/, 'ballot'], [/board|director/, 'table'], [/register|govern/, 'book'], [/deed/, 'seal'], [/bid/, 'gavel'],
    [/save|load|slot/, 'disk'], [/budget|spend|cash|money|income|pulse|bill/, 'coins'], [/negotiat|haggle|talk/, 'chat'],
    [/maintain|repair|fix|extend/, 'wrench'], [/close|shut/, 'lock'], [/give|donat|charity|tithe|legacy|estate|will/, 'gift'],
    [/season|join|invite|code/, 'flag'], [/ambition|goal|dream/, 'target'], [/chronicle|story|thread|history|record/, 'open'],
  ];
  for(let i = 0; i < map.length; i++) if(map[i][0].test(k)) return worldIco(map[i][1]);
  return worldIco('spark');
}
/* The HUD: the numbers that used to be a row of words in the header, drawn
   over the city - money as two pills, the five things you are as bars, the
   hours you have left and how free you are as rings, and a way to show every
   explanation the game has. The same numbers the header holds; the header keeps
   them too, for anything that reads them. */
function worldHUD(){
  const p = S.p, d = S.der || {}, nw = netWorth();
  const prev = S.hist.length > 1 ? S.hist[S.hist.length - 2].nw : nw;
  const hb = Math.max(1, hoursBudget()), hl = hoursLeft();
  const ico = function(e, label){ return '<span class="gfx hi" role="img" aria-label="'+label+'">'+e+'</span>'; };
  const row = function(e, label, v, good){
    const tone = good ? (v >= 60 ? 'var(--good)' : v >= 35 ? 'var(--warn)' : 'var(--bad)')
                      : (v <= 40 ? 'var(--good)' : v <= 65 ? 'var(--warn)' : 'var(--bad)');
    return '<div class="hrow">'+ico(e, label)+'<span class="gfx hb" title="'+label+' '+Math.round(v)+'">'+
      '<i style="width:'+Math.round(Math.max(3, Math.min(100, v)))+'%;background:'+tone+'"></i></span></div>';
  };
  const ring = function(e, label, pc, colour){
    return '<span class="gfx hring" title="'+label+'" role="img" aria-label="'+label+'" style="--p:'+Math.round(Math.max(0, Math.min(100, pc)))+';--c:'+colour+'"><em>'+e+'</em></span>';
  };
  return '<div class="hud"><div class="hleft">'+
    '<div class="hmoney">'+ico(worldIco('note'), 'cash')+'<b>'+fmt(S.fin.cash)+'</b>'+
      '<span class="hsep"></span>'+ico(worldIco('trend'), 'net worth')+'<b class="'+(nw >= prev ? 'good' : 'bad')+'">'+fmt(nw)+'</b></div>'+
    '<div class="hbody">'+
      '<div class="hbars">'+
        row(worldIco('heart'), 'health', p.health, true)+
        row(worldIco('bolt'), 'stress', p.stress, false)+
        row(worldIco('smile'), 'happiness', p.happy, true)+
        row(worldIco('home'), 'family', p.family, true)+
        row(worldIco('star'), 'reputation', p.rep, true)+
      '</div>'+
    '</div></div>'+
    '<div class="hright">'+
      ring(worldIco('glass'), Math.round(hl)+' hours left this quarter', hl / hb * 100, 'var(--info)')+
      ring(worldIco('door'), 'freedom '+freedomIndex(), freedomIndex(), 'var(--acc)')+
    '<button class="hinfo'+(UI.details ? ' on' : '')+'" data-a="details" aria-pressed="'+(UI.details ? 'true' : 'false')+'" title="'+
      (UI.details ? 'Hide the explanations' : 'Show every explanation')+'">'+worldIco('info')+'</button>'+
  '</div></div>';
}
/* A thing you can buy, as a picture on a shelf: its drawing (with how many
   you own), its name and price, what it does to you as marks, and - when you
   cannot afford it yet - how far your cash gets you toward it. The Buy button,
   its refusal and its reason are the screen's as they were. */
function goodPrice(g){ return Math.round(g.cost*(0.85+0.3*CITY().rentMult/1.3)); }
function goodTileHTML(g){
  const cost = goodPrice(g), have = S.fin.goods.filter(function(x){ return x.id === g.id; }).length;
  const afford = S.fin.cash >= cost, part = Math.max(0, Math.min(1, S.fin.cash / Math.max(1, cost)));
  return '<div class="btile gtile'+(afford ? '' : ' off')+'">'+
    '<div class="gfx bico" aria-hidden="true">'+worldGlyph(g.name)+(have ? '<span class="gown">×'+have+'</span>' : '')+'</div>'+
    '<div class="bname"><b>'+g.name+'</b><span class="mono">'+fmt(cost)+'</span></div>'+
    '<span class="emarks">'+effectMarksHTML(g.eff, g.upkeep)+'</span>'+
    (afford ? '' : '<span class="gfx bmb gsave" role="img" aria-label="you have '+fmt(S.fin.cash)+' of '+fmt(cost)+'" title="you have '+
      fmt(S.fin.cash)+' of '+fmt(cost)+'"><i style="width:'+Math.max(3, Math.round(part * 100))+'%;background:var(--acc)"></i></span>')+
    '<button class="btn sm primary block" data-a="buygood" data-g="'+g.id+'"'+(afford ? '' : ' disabled aria-disabled="true" title="Costs '+fmt(cost)+
      ' · you have '+fmt(S.fin.cash)+' · short '+fmt(Math.round(cost - S.fin.cash))+'"')+'>'+(have ? 'Buy another' : 'Buy')+'</button>'+
  '</div>';
}
/* What you are trying to do, drawn: the ambition as a large ring filling
   toward it, its name beside it, what it means shown with the explanations,
   and the five you could choose as picture tiles - the one you hold lit. */
const AMBITION_ICO = {million:'coins', dynasty:'towers', free:'door', builder:'crane', land:'key'};
function ambitionHTML(){
  const a = ambitionOf(), pc = ambitionPct();
  if(!a) return '<div class="tiny muted">No ambition set.</div>';
  const tone = pc >= 100 ? 'var(--good)' : pc >= 50 ? 'var(--acc)' : 'var(--warn)';
  return '<div class="ahero">'+
      '<span class="gfx hring abig" role="img" aria-label="'+esc(a.name+' '+pc+'%')+'" style="--p:'+Math.max(0, Math.min(100, pc))+';--c:'+tone+'">'+
        '<em>'+worldIco(AMBITION_ICO[a.id] || 'target')+'<b>'+pc+'%</b></em></span>'+
      '<div><b class="aname">'+esc(a.name)+'</b><div class="tiny muted prose">'+esc(a.blurb)+'</div></div>'+
    '</div>'+
    (pc >= 100 ? '<div class="principle" style="margin-top:9px">'+esc(a.done)+'</div>' : '')+
    '<hr class="sep">'+foldHTML('Changing your mind', 'You can change what you are aiming at. People do.')+
    '<div class="presets apick">'+AMBITIONS.map(function(x){
      return '<button class="btn sm pbtn'+(x.id === a.id ? ' primary' : '')+'" data-a="setambition" data-m="'+x.id+'">'+
        '<span class="gfx" aria-hidden="true">'+worldIco(AMBITION_ICO[x.id] || 'target')+'</span>'+esc(x.name)+'</button>';
    }).join('')+'</div>';
}
/* The five constituencies and the scoreboard at 65, as rings. */
const STAND_RINGS = [['family','home','Your family'], ['industry','factory','Your industry'], ['community','people','Your community'],
  ['state','seal','The state'], ['street','shop','The street']];
function standRingsHTML(){
  const st = S.stand || {};
  return ringsHTML(STAND_RINGS.filter(function(r){ return r[0] in st; }).map(function(r){ return {ico:r[1], label:r[2], v:st[r[0]]}; }));
}
function scoreboardRingsHTML(){
  return ringsHTML([{ico:'star', label:'Reputation', v:S.p.rep}, {ico:'door', label:'Freedom index', v:freedomIndex()},
    {ico:'home', label:'Family', v:S.p.family}, {ico:'heart', label:'Health', v:S.p.health},
    {ico:'coins', label:'Wealth built (real)', v:clamp((S.der.nw/Math.max(1,S.cumInfl))/6e8*100,0,100)}]);
}
/* Where you stand, at a glance: what you are worth as the one big number
   (and in start-of-game money), and freedom and the years of working life
   left as rings. What each means is in the ring's title and, with the
   explanations shown, under it. */
function standingHTML(){
  const nw = netWorth(), fr = freedomIndex(), age = S.p.age, left = Math.max(0, 65 - age);
  const real = nw / Math.max(0.01, S.cumInfl);
  return '<div class="stand">'+
    '<div class="snw"><span class="gfx" aria-hidden="true">'+worldIco('trend')+'</span>'+
      '<span class="tiny muted">Net worth</span><b class="mono">'+fmt(nw)+'</b>'+
      '<span class="tiny muted prose">'+fmt(real)+' in start-of-game money</span></div>'+
    ringsHTML([
      {ico:'door', label:'Freedom', v:fr, tone: fr > 70 ? 'var(--good)' : fr > 40 ? 'var(--warn)' : 'var(--bad)',
        note: fr > 70 ? 'work is optional' : fr > 40 ? 'not yet optional' : 'work pays for this'},
      {ico:'glass', label:'Years to 65', v: left / 47 * 100, tone:'var(--info)', text:String(left), note:'you are '+age}])+
  '</div>';
}
/* Numbers a player reads at a glance, drawn - shared by both renderers.

   ringsHTML: each a ring filling 0-100, its picture in the middle, the label
   and number underneath (or `text` in place of the number); toned by the
   value unless a tone is given. A full ring is always good: anything where
   less is better (stress) is passed inverted and named for its good side. */
function ringsHTML(list){
  return '<div class="lrings n'+list.length+'">'+list.map(function(r){
    const v = Math.max(0, Math.min(100, r.v)), say = r.label+' '+(r.text != null ? r.text : Math.round(r.v)) + (r.note ? ' \u00b7 '+r.note : '');
    const tone = r.tone || (v >= 60 ? 'var(--good)' : v >= 35 ? 'var(--warn)' : 'var(--bad)');
    return '<div class="lring"><span class="gfx hring" role="img" aria-label="'+esc(say)+'" title="'+esc(say)+'" '+
      'style="--p:'+Math.round(v)+';--c:'+tone+'"><em>'+worldIco(r.ico)+'</em></span>'+
      '<span class="tiny muted">'+esc(r.label+' '+(r.text != null ? r.text : Math.round(r.v)))+'</span>'+
      (r.note ? '<span class="tiny muted prose">'+esc(r.note)+'</span>' : '')+'</div>';
  }).join('')+'</div>';
}
/* The economy as six gauges: an arc filling toward where the number gets
   dangerous (or good), the indicator's picture under it, its reading and its
   name. The thresholds are the ones the words used to be coloured by. */
function economyHTML(){
  const m = S.mkt, base = CITY().fxBase || m.usd || 1;
  const tone = function(good, warn){ return good ? 'var(--good)' : warn ? 'var(--warn)' : 'var(--bad)'; };
  const g = [
    {ico:'trend', label:'Inflation', val:pct(m.infl, 1), f:m.infl / 0.4, c: m.infl > 0.25 ? 'var(--bad)' : m.infl > 0.12 ? 'var(--warn)' : 'var(--good)'},
    {ico:'globe', label:CITY().fxName, val:Math.round(m.usd).toLocaleString(), f:m.usd / (base * 2.5), c: tone(m.usd <= (m.usdPrev || m.usd), m.usd < base * 1.5)},
    {ico:'bank', label:'Policy rate', val:pct(m.mpr, 1), f:m.mpr / 0.4, c:'var(--info)'},
    {ico:'cart', label:'Demand', val:(m.demand * 100).toFixed(0), f:m.demand / 1.6, c: tone(m.demand >= 1, m.demand >= 0.85)},
    {ico:'plug', label:'Grid', val:Math.round(m.power)+'%', f:m.power / 100, c: tone(m.power >= 60, m.power >= 35)},
    {ico:'smile', label:'Confidence', val:String(Math.round(m.sentiment)), f:m.sentiment / 100, c: tone(m.sentiment >= 55, m.sentiment >= 35)}];
  const L = Math.PI * 26;
  return '<div class="gauges">'+g.map(function(x){
    const f = Math.max(0.03, Math.min(1, x.f));
    return '<div class="gauge" title="'+esc(x.label+' '+x.val)+'">'+
      '<span class="gfx gdial" role="img" aria-label="'+esc(x.label+' '+x.val)+'"><svg viewBox="0 0 64 38" aria-hidden="true">'+
        '<path d="M6 34a26 26 0 0 1 52 0" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="6" stroke-linecap="round"/>'+
        '<path d="M6 34a26 26 0 0 1 52 0" fill="none" stroke="'+x.c+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(L * f).toFixed(1)+' '+L.toFixed(1)+'"/>'+
      '</svg><em>'+worldIco(x.ico)+'</em></span>'+
      '<b class="mono" style="color:'+x.c+'">'+esc(x.val)+'</b><span class="tiny muted">'+esc(x.label)+'</span></div>';
  }).join('')+'</div>';
}
/* Your five skills as one shape: a pentagon whose corners reach out as each
   skill grows, so a lopsided career looks lopsided. Each corner carries the
   skill's picture, its name and its number. */
const SKILL_ICO = {finance:'coins', ops:'gear', hustle:'bolt', network:'people', tech:'laptop'};
function skillsRadarHTML(){
  const ks = ['finance','ops','hustle','network','tech'], sk = S.p.skills, cx = 120, cy = 104, R = 70;
  const pt = function(i, f){ const a = (-90 + i * 72) * Math.PI / 180; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; };
  const poly = function(fs){ return fs.map(function(f, i){ const q = pt(i, f); return q[0].toFixed(1)+','+q[1].toFixed(1); }).join(' '); };
  const grid = [1/3, 2/3, 1].map(function(f){ return '<polygon points="'+poly([f,f,f,f,f])+'" fill="none" stroke="rgba(255,255,255,'+(f === 1 ? '.2' : '.09')+'"/>'; }).join('')+
    ks.map(function(k, i){ const q = pt(i, 1); return '<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" stroke="rgba(255,255,255,.08)"/>'; }).join('');
  const vals = ks.map(function(k){ return Math.max(0.04, Math.min(1, (sk[k] || 0) / 100)); });
  const say = ks.map(function(k){ return k+' '+Math.round(sk[k] || 0); }).join(', ');
  return '<div class="gfx radar" role="img" aria-label="Skills: '+say+'">'+
    '<svg viewBox="0 0 240 200" aria-hidden="true">'+grid+
      '<polygon points="'+poly(vals)+'" fill="rgba(77,163,255,.28)" stroke="var(--info)" stroke-width="2" stroke-linejoin="round"/>'+
      vals.map(function(f, i){ const q = pt(i, f); return '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.2" fill="var(--info)"/>'; }).join('')+
    '</svg>'+
    ks.map(function(k, i){
      const q = pt(i, 1.36);
      return '<span class="rlab" style="left:'+(q[0] / 2.4).toFixed(1)+'%;top:'+(q[1] / 2).toFixed(1)+'%">'+worldIco(SKILL_ICO[k])+
        '<b>'+Math.round(sk[k] || 0)+'</b><i>'+k+'</i></span>';
    }).join('')+
  '</div>';
}
/* Money as bars against each other: each row as long as its share of the
   biggest, with its picture, figure and name, and the net under them rising
   or falling. `net` is {label, v, text}. */
function flowBarsHTML(rows, net){
  const top = Math.max.apply(null, rows.map(function(r){ return Math.abs(r.v); }).concat([1]));
  return '<div class="qflow">'+rows.map(function(r){
    return '<div class="qrow" title="'+esc(r.label+' '+r.t)+'"><span class="gfx qi" aria-hidden="true">'+worldIco(r.ico)+'</span>'+
      '<span class="gfx qb" role="img" aria-label="'+esc(r.label+' '+r.t)+'"><i style="width:'+Math.max(2, Math.round(Math.abs(r.v) / top * 100))+'%;background:'+r.c+'"></i></span>'+
      '<span class="qv"><span class="mono '+(r.c === 'var(--good)' ? 'good' : 'bad')+'">'+r.t+'</span><span class="tiny muted">'+esc(r.label)+'</span></span></div>';
  }).join('')+
  '<div class="qnet '+(net.v >= 0 ? 'good' : 'bad')+'"><span class="gfx" aria-hidden="true">'+worldIco(net.v >= 0 ? 'up' : 'down')+'</span>'+
    '<span class="tiny muted">'+esc(net.label)+'</span><b class="mono">'+net.text+'</b></div></div>';
}
/* The quarter's money: what came in, what the business made or lost, what
   living and debt took, and the net. */
function quarterFlowHTML(){
  const q = S.quarter || {}, inc = Math.round(q.income || 0), exp = Math.round(q.expense || 0);
  const profit = S.biz ? (S.biz.profit || 0) : 0, net = inc - exp + profit;
  const rows = [{ico:'note', label:'Income', v:inc, c:'var(--good)', t:fmt(inc)}];
  if(S.biz) rows.push({ico:'case', label:'Business P&L', v:profit, c: profit >= 0 ? 'var(--good)' : 'var(--bad)', t:fmt(profit)});
  rows.push({ico:'cart', label:'Living + debt', v:exp, c:'var(--bad)', t:'−'+fmt(exp)});
  return flowBarsHTML(rows, {label:'Net', v:net, text:fmt(net)});
}
function worldHTML(){
  /* The scene behind every screen is your home (VISUAL.md, M1): the place you
     live, drawn from the run. UI.sceneVH is the height of the view the ui
     measured, so the picture fills it with sky rather than cropping the house.
     The HUD sits over it, and the ui adds the moves along its foot. */
  const era = eraById(S.era ? S.era.id : 'calm');
  return '<div class="world home" id="world">'+
    '<div class="world-stage">'+homeSceneSVG(homeLook(), UI.sceneVH)+'</div>'+
    worldHUD()+
    '<div class="world-cap">'+esc(CITY().label)+' \u00b7 '+esc(dateLabel(S.turn))+(era ? ' \u00b7 '+esc(era.name) : '')+'</div>'+
    '</div>';
}
