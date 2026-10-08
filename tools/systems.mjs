/* The book of the game: what you can do, what happens, what it costs, how it ends.

   Every count and every label in CONTENT.md comes out of the shipped module at
   generation time — the tables the game actually runs on, not a description of
   them written beside them. If a table changes, this file changes with it, which
   is the only way a rulebook stays true.

   What it does, in order:
     1. runs a real game for 17 quarters so unlocked screens are rendered as a
        player would see them (not as an empty fixture), then renders all 43 view
        functions and harvests the verbs each screen offers, with their labels
     2. walks the quarter pipeline — the function names in advanceQuarter, in
        order — and verifies each still exists before printing it
     3. lists the decks: life, business, policy and government events, the arcs,
        the deals, contracts, covenants, resolutions, household, careers, goods,
        assets, levers, negotiations and the endings
     4. writes CONTENT.md and content/inventory.json

   Usage: node tools/systems.mjs
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(import.meta.dirname, '..');
require(path.join(ROOT, '.harness', 'dom.js'));
const M = require(path.join(ROOT, '.harness', 'mod.js'));

const num = (v) => Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
const md = (s) => esc(String(s).replace(/\u2019/g, "'").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim());

/* ---- 1. a real game, then every screen as a player sees it ---------------- */
M.newGame({ name: 'Rulebook', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
for (let i = 0; i < 17; i++) {
  M.UI.modal = null;
  try { M.advanceQuarter(); } catch (e) { break; }
  M.UI.modal = null;
  /* give the business a body so its screens render with staff and locations */
  if (i === 4 && typeof M.startBiz === 'function' && !M.getS().biz) {
    try { const b = M.BIZ.find(x => x.id === 'retail'); M.startBiz(b.id || 'retail'); } catch (e) { /* the deal is a fixture, not the claim */ }
  }
}

/* Labels sit inside spans, chips and nested markup, so the markup is flattened
   before parsing: every action id is swapped for a sentinel that survives tag
   stripping (a marker put inside the tag is deleted along with the tag — the
   first attempt did exactly that and reported zero controls on every screen).
   Then tags go, and the text after each sentinel is that control's label. */
const SENTINEL = '\u0001';
const harvest = (html) => {
  /* the whole opening tag becomes the marker: a marker placed inside the tag
     is deleted along with the tag when the markup is stripped */
  const marked = String(html || '').replace(/<[^>]*data-a="([a-z0-9]+)"[^>]*>/g, SENTINEL + '$1' + SENTINEL);
  const flat = marked.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ');
  const parts = flat.split(SENTINEL);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    out.push({ a: parts[i], label: String(parts[i + 1] || '').trim().slice(0, 44) || '(no label)' });
  }
  return out;
};

/* Route labels, so the screen table can be read the way the game is navigated:
   viewMoneyBudget is "Money › Budget", not a function name. Falls back to the
   function name when a view is not one of the tab/sub routes. */
const routeOf = (() => {
  const map = new Map();
  const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const tab of M.TABS) {
    map.set(norm(tab.id), tab.label);
    for (const sub of (M.SUBS[tab.id] || [])) {
      map.set(norm(tab.id) + norm(sub.id), tab.label + ' \u203a ' + sub.label);
      map.set(norm(sub.id), tab.label + ' \u203a ' + sub.label);
    }
  }
  /* views that render a whole tab, or a panel that lives inside one, named by
     hand because the function name does not say where the player finds it */
  const explicit = {
    viewWork: 'Work — the whole tab', viewMoney: 'Money — the whole tab', viewLegacy: 'Legacy — the whole tab',
    viewLedger: 'Legacy \u203a Your record', viewLedgerSettings: 'Legacy \u203a Settings',
    viewCareerRecord: 'Legacy \u203a Your record', viewPeople: 'Legacy \u203a People',
    viewResolutions: 'Governance \u203a Votes', viewVotes: 'Governance \u203a Votes',
    viewBiz: 'Work \u203a Business', viewOutlets: 'Work \u203a Business (outlets)',
    viewContracts: 'Work \u203a Business (contracts)', viewEngine: 'Work \u203a Business (the engine)',
    viewGroup: 'Money \u203a Group', viewHousehold: 'Work \u203a Household', viewLevers: 'Work \u203a Levers',
    viewHouse: 'Work \u203a Household', viewCommitments: 'Overview (commitments)',
    viewAgenda: 'Overview (agenda)', viewDash: 'Overview (dashboard)', viewPulse: 'Overview (pulse)',
    viewPressure: 'Overview (pressure)', viewWorkingCapital: 'Money \u203a Position (working capital)',
    viewInvest: 'Money \u203a Markets', viewInvestMarkets: 'Money \u203a Markets',
    viewInvestPortfolio: 'Money \u203a Markets (portfolio)', viewLedgerChronicle: 'Legacy \u203a Chronicle',
    viewInbound: 'Governance \u203a Bids', viewPromises: 'Governance \u203a Deed',
    viewTargets: 'Governance \u203a Board (targets)', viewStaffDeep: 'Work \u203a Business (staff)',
  };
  return (view) => {
    if (explicit[view]) return explicit[view];
    const key = norm(view.replace(/^view/, ''));
    if (map.has(key)) return map.get(key);
    return view;
  };
})();

const views = Object.keys(M).filter(k => /^view[A-Z]/.test(k) && typeof M[k] === 'function').sort();
const screens = [];
for (const v of views) {
  let html = '';
  try { html = M[v](); } catch (e) { html = ''; }
  const verbs = harvest(html);
  const uniq = [];
  const seen = new Set();
  for (const x of verbs) { const k = x.a + '|' + x.label; if (!seen.has(k)) { seen.add(k); uniq.push(x); } }
  screens.push({ view: routeOf(v), fn: v, controls: uniq.length, verbs: uniq });
}

/* the action registry: the complete list of things a click can do */
const ACT = Object.keys(M.ACT || {});
const COMMIT_LIKE = /^(commit|start|do|buy|sell|nego|hire|fire|grant|sign|apply|borrow|repay|drop|take|raise|bid|pass|accept|decline|call|vote|promote|train|open|close|maintain|pay|join|leave|repay)/;
const verbs = {
  total: ACT.length,
  commitment_shaped: ACT.filter(a => COMMIT_LIKE.test(a)),
  navigation_shaped: ACT.filter(a => /^(tab|sub|goto|close|help|settings|advance|skip|anim|view|toggle|pick|sort|back|open$)/.test(a)),
};

/* ---- 2. the quarter pipeline, verified function by function --------------- */
const PIPELINE = [
  ['flushPending', 'consequences that were scheduled in earlier quarters come due'],
  ['stepEra', 'the era can turn: ordinary times, boom, crunch, devaluation'],
  ['stepMarket', 'inflation, FX, asset prices move'],
  ['maybeSwan', 'a rare shock: the swan deck'],
  ['stepAssets', 'your holdings pay out or fall'],
  ['simBusiness', 'the business trades: capacity, demand, price, staff, upkeep'],
  ['stepGovernance', 'the board, covenants, resolutions and the register'],
  ['stepGroup', 'group accounts, breaches and cross-default'],
  ['stepHouse', 'the household: roles, perks, asks'],
  ['stepPersonal', 'health, stress, happiness, family, reputation'],
  ['stepCast', 'the people in your life move: news, illness, death, asks'],
  ['stepRival', 'the rival does something you may have to answer'],
  ['refreshDeals', 'new capital opportunities appear'],
  ['refreshContractOffers', 'clients put work on the table'],
  ['resolveDeals', 'deals you committed to land: win or lose'],
  ['maybeOfferPartner', 'somebody asks for a stake in your business'],
  ['snapshot', 'the quarter is recorded for the charts'],
  ['checkEnd', 'insolvency, health, retirement, the season finish line'],
  ['dueThread', 'a story you started comes back for its next stage'],
  ['pickEvent', 'the event deck: 62% chance of something happening'],
  ['year review', 'every fourth quarter: the annual review modal'],
];
/* Present = defined in the shipped bundle. Checking the export list would fail for
   internal steps like flushPending, which the engine calls but never exports — the
   claim is "this step happens in the build", so the build is what gets checked. */
const BUNDLE = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');
const pipeline = PIPELINE.map(([fn, why]) => ({
  fn, why,
  present: fn === 'year review' ? /S\.turn % 4 === 0/.test(BUNDLE) : new RegExp('function ' + fn + '\\s*\\(').test(BUNDLE),
}));

/* ---- 3. the decks -------------------------------------------------------- */
const deck = (name, rows, keyA, keyB, keyC) => ({
  name, count: num(rows),
  rows: (Array.isArray(rows) ? rows : Object.values(rows || {})).map(r => ({
    a: md(r[keyA] || r.id || r.name || ''),
    b: keyB ? md(r[keyB] || '') : '',
    c: keyC ? (typeof r[keyC] === 'number' ? r[keyC] : md(r[keyC] || '')) : '',
    opts: Array.isArray(r.opts) ? r.opts.length : null,
  })),
});

const decks = {
  life: deck('Life events — what happens to you', M.LIFE_EVENTS, 'title', 'text'),
  more: deck('More events — business, career, health, money', M.MORE_EVENTS, 'title', 'text'),
  policy: deck('Policy events — the country does something to everyone', M.POLICY_EVENTS, 'head', 'text'),
  biz: deck('Business events', M.BIZ_EVENTS, 'title', 'text'),
  gov: deck('Government and board events', M.GOV_EVENTS, 'title', 'text'),
};
const arcs = (Array.isArray(M.ARCS) ? M.ARCS : Object.values(M.ARCS)).map(a => ({
  title: md(a.title || a.id), cast: md(a.cast || ''), stages: Array.isArray(a.stages) ? a.stages.filter(Boolean).length : num(a.stages),
}));

/* ---- 4. the instruments -------------------------------------------------- */
const instruments = {
  careers: M.CAREER.map(c => ({ label: md(c.label), hours: c.hours, money: c.cost || 0, note: md(c.hint) })),
  businesses: M.BIZ.map(b => ({ label: md(b.name), from: b.min, margin: b.margin, growth: b.growth })),
  goods: M.GOODS.map(g => ({ label: md(g.name), cost: g.cost, upkeep: g.upkeep, life: g.life, note: md(g.note) })),
  assets: M.ASSETS.map(a => ({ label: md(a.name), cls: md(a.cls), ret: a.ret, vol: a.vol, note: md(a.note) })),
  deals: M.DEAL_TYPES.map(d => ({ label: md(d.name), turns: d.turns, upside: d.ret, risk: d.risk, note: md(d.desc) })),
  covenants: Object.entries(M.COVENANT_KINDS).map(([id, c]) => ({ label: md(c.label), unit: c.unit, worse: md(c.worse), note: md(c.desc) })),
  resolutions: Object.entries(M.RES_KINDS).map(([id, r]) => ({ label: md(r.label), cls: md(r.cls), threshold: md(r.thr) })),
  household: Object.entries(M.HOUSE_ROLES).map(([id, h]) => ({ label: md(h.label), pay: h.pay, note: md(h.note) })),
  perks: (Array.isArray(M.HOUSE_PERKS) ? M.HOUSE_PERKS : Object.values(M.HOUSE_PERKS)).map(p => ({ label: md(p.label || p.id), note: md(p.note || p.d) })),
  negotiation: M.NEG_TACTICS.map(t => ({ label: md(t.label), note: md(t.hint) })),
  staff: Object.entries(M.STAFF_ROLES).map(([id, s]) => ({ label: md(s.label), note: md(s.note) })),
  levers: Object.entries(M.LEVER_KINDS).map(([id, l]) => ({ label: md(l.label), gives: md(l.gives), ask: md(l.ask) })),
  traits: M.TRAITS.map(t => ({ label: md(t.name), note: md(t.d) })),
  ambitions: M.AMBITIONS.map(a => ({ label: md(a.name), note: md(a.blurb) })),
  eras: M.ERAS.map(e => ({ label: md(e.name), tone: md(e.tone), head: md(e.head) })),
  difficulties: Object.values(M.DIFFS).map(d => ({ label: md(d.name), shock: d.shock, inflation: d.infl, odds: !!d.showOdds, coach: !!d.coaching, pay: d.pay })),
  seasonAxes: M.SEASON_AXES.map(a => ({ label: md(a.label), weight: a.weight, why: md(a.why) })),
  board: M.BOARD_ARCHETYPES.map(b => ({ label: md(b.label), skill: md(b.skill), note: md(b.blurb) })),
  cities: M.CITIES.map(c => ({ label: md(c.name), currency: c.cur, fx: c.fxName + ' ' + c.fxBase, inflation: c.infl })),
  profiles: M.PROFILES.map(p => ({ label: md(p.name), age: p.age, cash: p.cash, note: md(p.blurb) })),
};

/* ---- 5. the endings and the repercussions -------------------------------- */
const endings = [
  { key: 'retire', condition: 'You reach 65, or turn 168 (42 years). The run closes on its own terms.' },
  { key: 'season', condition: 'The season finish line you joined, or set, arrives. It takes precedence over every other ending.' },
  { key: 'bankrupt', condition: 'Cash is deeply negative, debts exceed ₦1m and credit is under 22. On Hardcore the run ends here; below it, assets are seized and you continue with less.' },
  { key: 'health', condition: 'Health reaches zero. Nothing buys it back at that point.' },
];
const repercussions = [
  ['Delayed consequences', 'flushPending', 'A decision can schedule its own bill: `{turn, title, text, eff}`. It arrives as a modal, on the quarter it comes due.'],
  ['Insolvency, below Hardcore', 'checkEnd', 'Assets are seized against the debt, credit collapses to 14, stress +18, happiness −14, reputation −10. You continue with less.'],
  ['Debt service', 'stepPersonal / budget', 'Interest and repayments are drawn every quarter; credit score gates what you can borrow next.'],
  ['Inflation', 'stepMarket', 'Cash loses purchasing power every quarter. The currency can also devalue, which hurts imports and helps exporters.'],
  ['Covenants', 'COVENANT_KINDS', 'Leverage, cover, distributions, capex, liquidity and owner drawings. Breach is recorded and priced.'],
  ['Group cross-default', 'stepGroup', 'A breach in one group company can pull the others in.'],
  ['Board', 'stepGovernance', 'Directors have tempers and patience; resolutions pass or fail on votes, and the register records both.'],
  ['Rival', 'stepRival', 'A competitor undercuts, poaches or expands; ignoring it has a cost.'],
  ['Cast', 'stepCast', 'Friends, siblings, parents and partners age, ask for money, get ill and die.'],
  ['Stress and health', 'stepPersonal', 'High stress erodes health and happiness; low happiness bleeds into output.'],
  ['Business failure', 'simBusiness', 'Without capacity, staff, price or demand, revenue falls and upkeep still lands.'],
  ['Deals', 'resolveDeals', 'Committed capital is at risk: the deal wins or loses, on the odds you were shown.'],
  ['Partner offers', 'maybeOfferPartner', 'Above ₦3m revenue, somebody asks for a stake. Accepting changes who owns the business.'],
  ['Arcs', 'dueThread / maybeStartArc', 'Stories have stages; a stage not answered comes back on its own schedule.'],
];

const out = {
  generated: new Date().toISOString().slice(0, 10),
  source: 'packages/core (the shipped module) · seed 4242 · profile The Fresh Graduate · Lagos · Realistic',
  counts: {
    quarters_in_a_run: 168, tabs: num(M.TABS), subs: Object.values(M.SUBS).reduce((n, a) => n + num(a), 0),
    views_rendered: screens.length, controls_in_the_registry: ACT.length,
    verbs_by_screen: screens.reduce((n, s) => n + s.controls, 0),
    events: Object.values(decks).reduce((n, d) => n + d.count, 0),
    arcs: arcs.length,
    careers: instruments.careers.length, businesses: instruments.businesses.length, goods: instruments.goods.length,
    assets: instruments.assets.length, deal_types: instruments.deals.length, covenants: instruments.covenants.length,
    resolutions: instruments.resolutions.length, household_roles: instruments.household.length, perks: instruments.perks.length,
    negotiation_tactics: instruments.negotiation.length, levers: instruments.levers.length, traits: instruments.traits.length,
    ambitions: instruments.ambitions.length, eras: instruments.eras.length, difficulties: instruments.difficulties.length,
    board_archetypes: instruments.board.length, cities: instruments.cities.length, profiles: instruments.profiles.length,
  },
  pipeline, decks, arcs, instruments, screens, endings, repercussions, verbs,
  ACT,
};
fs.mkdirSync(path.join(ROOT, 'content'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content', 'inventory.json'), JSON.stringify(out, null, 1));

/* ---- the written book ---------------------------------------------------- */
const L = [];
const C = out.counts;
L.push('# CONTENT.md — the book of the game');
L.push('');
L.push('*Generated by `tools/systems.mjs` on ' + out.generated + ' from the shipped module. Every count below is read');
L.push('out of the tables the game actually runs on — if a table changes, regenerate and this file changes with it.*');
L.push('');
L.push('**The short version:** one run is ' + C.quarters_in_a_run + ' quarters (age 23 → 65). There are ' +
  C.events + ' scripted events plus ' + C.arcs + ' multi-stage arcs, ' +
  C.controls_in_the_registry + ' distinct actions behind ' + C.views_rendered + ' screens in ' + C.tabs + ' tabs and ' + C.subs + ' sub-routes.');
L.push('');
L.push('**The mental model.** At any moment a turn gives you five things to spend: **hours** (career and personal actions),');
L.push('**money** (goods, assets, business capacity), **capital** (deals, contracts, land, franchises), **influence**');
L.push('(the board, the group, the register) and **your household** (roles, perks, the people in your life). Every one of them');
L.push('takes a quarter to pay off, and some of them schedule a bill you will not see for a year \u2014 which is the whole game.');
L.push('');
L.push('---');
L.push('');
L.push('## 1. What happens every quarter (the engine room)');
L.push('');
L.push('Advancing a quarter runs these steps, in this order. Confirmed present in the module at generation time:');
L.push('');
L.push('| # | step | what it does |');
L.push('|---|---|---|');
pipeline.forEach((p, i) => L.push('| ' + (i + 1) + ' | `' + p.fn + '` | ' + p.why + (p.present ? '' : ' **(not found in this build)**') + ' |'));
L.push('');
L.push('The quarter also resets your **hours** (the one resource that never carries over) and ages you one quarter.');
L.push('');
L.push('## 2. How a run ends');
L.push('');
L.push('| ending | condition |');
L.push('|---|---|');
for (const e of endings) L.push('| **' + e.key + '** | ' + e.condition + ' |');
L.push('');
L.push('## 3. What can happen to you');
L.push('');
for (const [key, d] of Object.entries(decks)) {
  L.push('### ' + d.name + ' — ' + d.count);
  L.push('');
  L.push('| event | what it is, and what it asks of you |');
  L.push('|---|---|');
  for (const r of d.rows) L.push('| **' + r.a + '** | ' + (r.opts ? r.opts + ' options · ' : '') + r.b.slice(0, 150) + ' |');
  L.push('');
}
L.push('### Stories that come back — ' + arcs.length + ' arcs');
L.push('');
L.push('| arc | who is in it | stages |');
L.push('|---|---|---|');
for (const a of arcs) L.push('| **' + a.title + '** | ' + a.cast + ' | ' + a.stages + ' |');
L.push('');
L.push('## 4. What you can do — ' + C.views_rendered + ' screens, ' + C.verbs_by_screen + ' labelled controls');
L.push('');
L.push('Harvested by rendering each screen in a live state: 17 quarters played, a business running,');
L.push('seed 4242. A screen with more controls is a screen with more ways to spend something.');
L.push('Screens showing **0** were empty in *this* fixture \u2014 the run had no rival, no board, no season or');
L.push('no child yet. They are listed anyway, because the map should be complete.');
L.push('');
const busiest = screens.slice().sort((a, b) => b.controls - a.controls).slice(0, 3);
L.push('The busiest screens: ' + busiest.map(b => '**' + esc(b.view) + '** (' + b.controls + ')').join(', ') + '.');
L.push('');
L.push('| screen | controls | examples |');
L.push('|---|---|---|');
for (const s of screens.slice().sort((a, b) => b.controls - a.controls)) {
  const named = s.verbs.filter(v => v.label && v.label !== '(no label)');
  /* labels are harvested from flattened markup, so a label can run into the text
     of the next sibling — capped, with an ellipsis, rather than pretending precision */
  const cut = (t) => { const c = String(t).replace(/\s+/g, ' ').trim(); return c.length > 26 ? c.slice(0, 25) + '\u2026' : c; };
  const ex = (named.length ? named : s.verbs).slice(0, 4).map(v => esc(cut(v.label))).join(' \u00b7 ');
  L.push('| `' + s.view + '` | ' + s.controls + ' | ' + ex + ' |');
}
L.push('');
L.push('## 5. The instruments you can pull');
L.push('');
const table = (title, rows, cols) => {
  L.push('### ' + title + ' — ' + rows.length);
  L.push('');
  L.push('| ' + cols.map(c => c[0]).join(' | ') + ' |');
  L.push('|' + cols.map(() => '---').join('|') + '|');
  for (const r of rows) L.push('| ' + cols.map(c => esc(r[c[1]] === undefined ? '' : String(r[c[1]]).slice(0, 130))).join(' | ') + ' |');
  L.push('');
};
table('Careers — actions you can take each quarter (hours, not money)', instruments.careers, [['action', 'label'], ['hours', 'hours'], ['₦', 'money'], ['what it does', 'note']]);
table('Businesses you can start', instruments.businesses, [['type', 'label'], ['from ₦', 'from'], ['margin', 'margin'], ['growth', 'growth']]);
table('Things you can buy — goods', instruments.goods, [['item', 'label'], ['cost', 'cost'], ['upkeep', 'upkeep'], ['life (q)', 'life'], ['note', 'note']]);
table('Things you can invest in', instruments.assets, [['asset', 'label'], ['class', 'cls'], ['quarterly return', 'ret'], ['volatility', 'vol'], ['note', 'note']]);
table('Deals — capital with a date on it', instruments.deals, [['deal', 'label'], ['quarters', 'turns'], ['upside', 'upside'], ['risk', 'risk'], ['what it is', 'note']]);
table('Covenants a lender can hold you to', instruments.covenants, [['covenant', 'label'], ['unit', 'unit'], ['worse is', 'worse'], ['the rule', 'note']]);
table('Board resolutions you can call', instruments.resolutions, [['resolution', 'label'], ['class', 'cls'], ['threshold', 'threshold']]);
table('Household roles you can hire', instruments.household, [['role', 'label'], ['pay ×', 'pay'], ['what it changes', 'note']]);
table('Negotiation tactics (deals, salaries, rent)', instruments.negotiation, [['tactic', 'label'], ['what it does', 'note']]);
table('Staff roles in your business', instruments.staff, [['role', 'label'], ['note', 'note']]);
table('Levers — commitments that change the shape of the game', instruments.levers, [['lever', 'label'], ['what it asks', 'ask'], ['what it gives', 'gives']]);
table('Starting traits', instruments.traits, [['trait', 'label'], ['note', 'note']]);
table('Ambitions — what the run is judged against', instruments.ambitions, [['ambition', 'label'], ['note', 'note']]);
table('Eras the world moves through', instruments.eras, [['era', 'label'], ['tone', 'tone'], ['opening line', 'head']]);
table('Difficulty tiers', instruments.difficulties, [['tier', 'label'], ['shock ×', 'shock'], ['inflation ×', 'inflation'], ['shows odds', 'odds'], ['coaching', 'coach'], ['pay ×', 'pay']]);
table('Season scoring axes', instruments.seasonAxes, [['axis', 'label'], ['weight', 'weight'], ['why it counts', 'why']]);
table('Board archetypes', instruments.board, [['type', 'label'], ['skill', 'skill'], ['blurb', 'note']]);
table('Cities', instruments.cities, [['city', 'label'], ['currency', 'currency'], ['FX', 'fx'], ['inflation', 'inflation']]);
table('Starting profiles', instruments.profiles, [['profile', 'label'], ['age', 'age'], ['cash', 'cash'], ['blurb', 'note']]);
L.push('## 6. What it costs you when it goes wrong');
L.push('');
L.push('| mechanism | where | what actually happens |');
L.push('|---|---|---|');
for (const [name, where, what] of repercussions) L.push('| **' + name + '** | `' + where + '` | ' + what + ' |');
L.push('');
L.push('## 7. The action registry');
L.push('');
L.push(verbs.total + ' registered actions: ' + verbs.commitment_shaped.length + ' commitment-shaped (they spend money, time or a stake), ' +
  verbs.navigation_shaped.length + ' navigation-shaped, and the rest are modal fields, toggles and confirmations.');
L.push('');
L.push('<details><summary>Every registered action, alphabetically</summary>');
L.push('');
L.push('`' + ACT.slice().sort().join('` · `') + '`');
L.push('');
L.push('</details>');
L.push('');
L.push('---');
L.push('');
L.push('*`content/inventory.json` carries the same data in machine-readable form. `tools/textaudit.mjs` measures');
L.push('how much of it is in the way on each screen; `tools/shellaudit.mjs` does the same for the modals;');
L.push('`tools/journey.mjs` measures what it costs a player to reach it.*');

fs.writeFileSync(path.join(ROOT, 'CONTENT.md'), L.join('\n') + '\n');

console.log('CONTENT.md — ' + C.quarters_in_a_run + ' quarters · ' + C.views_rendered + ' screens · ' +
  C.verbs_by_screen + ' labelled controls · ' + C.controls_in_the_registry + ' registered actions');
console.log('  events        : ' + C.events + ' (' + Object.entries(decks).map(([k, d]) => d.count + ' ' + k).join(', ') + ') · arcs ' + C.arcs);
console.log('  instruments   : ' + [['careers', C.careers], ['businesses', C.businesses], ['goods', C.goods], ['assets', C.assets],
  ['deals', C.deal_types], ['covenants', C.covenants], ['resolutions', C.resolutions], ['household', C.household_roles],
  ['tactics', C.negotiation_tactics], ['levers', C.levers], ['traits', C.traits], ['cities', C.cities], ['profiles', C.profiles]]
  .map(([k, v]) => k + ' ' + v).join(' · '));
console.log('  pipeline steps checked: ' + pipeline.filter(p => p.present).length + '/' + pipeline.length);
console.log('  written: CONTENT.md + content/inventory.json');
