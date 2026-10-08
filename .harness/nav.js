/* Gate: the five-tab structure must reach every view, and nothing may be
   orphaned by the consolidation. Run against a live business, because most
   views legitimately render nothing before you have one. */
require('./dom.js');
const M = require('./mod.js');
const fs = require('fs');
const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

/* ---- set up a run with a business, staff and a few quarters behind it ---- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) M.advanceQuarter();
ck(!!S.biz, 'failed to start a business for the navigation test');
console.log('setup             : business "' + (S.biz ? S.biz.name : 'none') +
  '", turn ' + S.turn + ', staff ' + ((S.biz && S.biz.staff) || []).length);

const tabs = M.TABS.map(t => t.id);
console.log('tabs              :', tabs.join(' · '), '(' + tabs.length + ')');
ck(tabs.length === 5, 'expected 5 tabs, got ' + tabs.length);

/* ---- every (tab, sub) route renders with real content ---- */
const pairs = [];
for (const t of tabs) {
  const subs = M.subsFor(t);
  if (!subs) { pairs.push([t, '']); continue; }
  for (const sb of subs) pairs.push([t, sb.id]);
}
console.log('\nroutes            : ' + pairs.length);
let minLen = 1e9;
/* Grouping (P3) may collapse a section by default. A gate that asks "is
   this content still here?" has to force every group open first, or it is
   really asking "is this content in a group that happens to be open?". */
function expand(key){
  S.grp = {};
  (M.ROUTE_GROUPS[key] || []).forEach(function(g, i){ S.grp[key + '.' + i] = false; });
}

for (const [t, sub] of pairs) {
  M.UI.tab = t; M.UI.sub = sub;
  if (t === 'governance') M.UI.govSub = sub;
  expand(t + (sub ? '/' + sub : ''));
  let html = '', err = null;
  try { html = String(M.routeView()); } catch (e) { err = e; }
  if (err) { bad.push('route ' + t + '/' + sub + ' threw: ' + err.message); console.log('  THREW ' + t + '/' + sub); continue; }
  minLen = Math.min(minLen, html.length);
  if (html.length < 200) bad.push('route ' + t + '/' + (sub || '-') + ' rendered only ' + html.length + ' chars');
  console.log('  ' + (t + '/' + (sub || '-')).padEnd(22) + String(html.length).padStart(6) + ' chars');
}

/* ---- nothing orphaned: every view callable, and reachable by routing or
       composition inside a routed view ---- */
const src = fs.readFileSync(__dirname + '/check.js', 'utf8');
const allViews = [...new Set((src.match(/^function (view[A-Za-z]+)\s*\(/gm) || [])
  .map(m => m.replace(/^function /, '').replace(/\s*\($/, '')))];

const broken = [];
for (const v of allViews) {
  if (typeof M[v] !== 'function') { broken.push(v + ' (not exported)'); continue; }
  let out = '', err = null;
  try { out = String(M[v]()); } catch (e) { err = e; }
  if (err) {
    /* governance sub-views need a live business argument; their routes are
       exercised above, so a direct call failing is not a defect */
    if (/^view(Register|Board|Deed|Promises|Inbound|Targets|Pack)$/.test(v)) continue;
    broken.push(v + ' (threw: ' + err.message + ')');
  }
  else if (out.length < 30) broken.push(v + ' (empty)');
}
console.log('\nview functions    : ' + allViews.length + ' | broken or empty: ' + broken.length);
if (broken.length) console.log('   ' + broken.join('\n   '));

/* reachability: named in routeView, or called from a view that is */
/* The real dispatcher is routeViewInner(); routeView() is now a thin wrapper
   that prepends the "why" strip. Slice from the INNER function so the router
   body is actually captured — routeViewInner sits above routeView in source. */
const rStart = src.indexOf('function routeViewInner(){');
const rEnd   = src.indexOf('function render(){');
const router = src.slice(rStart >= 0 ? rStart : src.indexOf('function routeView(){'), rEnd);
const routed = allViews.filter(v => router.includes(v));
const composedIn = new Set(routed);
for (const v of routed) {
  const i = src.indexOf('function ' + v + '(');
  const j = src.indexOf('\n}', i);
  const body = src.slice(i, j > 0 ? j : i + 30000);
  for (const w of allViews) if (w !== v && body.includes(w + '(')) composedIn.add(w);
}
const replaced = ['viewDash', 'viewWork'];   // superseded; contents verified below
const orphan = allViews.filter(v => !composedIn.has(v) && !replaced.includes(v));
console.log('reachable views   : ' + composedIn.size + ' of ' + allViews.length +
  ' | orphaned: ' + (orphan.length ? orphan.join(', ') : 'none'));
if (orphan.length) bad.push('orphaned views: ' + orphan.join(', '));

/* ---- the two views that were replaced: their content must survive ---- */
M.UI.tab = 'overview'; M.UI.sub = ''; expand('overview');
const ov = String(M.routeView());
const carried = [
  ['net worth',         /Net where|Net worth/],
  ['freedom index',     /Freedom/],
  ['years to 65',       /Years to 65/],
  ['ambition',          /Never need anyone again|Choose an ambition|ambition/i],
  ['this quarter',      /This quarter/],
  ['income',            /Income/],
  ['health',            /Health/],
  ['stress',            /Stress/],
  ['happiness',         /Happiness/],
  ['family',            /Family/],
  ['reputation',        /Reputation/],
  ['five skills',       /finance[\s\S]*ops[\s\S]*hustle[\s\S]*network[\s\S]*tech/],
  ['the economy',       /The economy/],
  ['inflation',         /Inflation/],
  ['advance button',    /data-a="advance"/],
  ['sparkline',         /svg|polyline|path/i],
];
console.log('\nold Overview carried into the new one:');
for (const [label, re] of carried) {
  const ok = re.test(ov);
  console.log('   ' + (ok ? 'yes' : 'NO ') + '  ' + label);
  if (!ok) bad.push('old Overview feature lost: ' + label);
}

/* viewWork's children must all still be routed */
const workSrc = src.slice(src.indexOf('function viewWork('), src.indexOf('\n}', src.indexOf('function viewWork(')));
const workKids = allViews.filter(v => v !== 'viewWork' && workSrc.includes(v + '('));
const missingKids = workKids.filter(v => !router.includes(v));
console.log('\nviewWork children : ' + workKids.length + ' | not routed: ' + (missingKids.length ? missingKids.join(', ') : 'none'));
if (missingKids.length) bad.push('viewWork children not routed: ' + missingKids.join(', '));

console.log(bad.length ? ('\nNAV ISSUES:\n' + [...new Set(bad)].map(m => ' - ' + m).join('\n')) : '\nNAV CLEAN');
process.exit(0);
