/* Gate: personal actions must be constrained by a real, finite resource.
   An action that can be clicked without limit is not a decision. */
require('./dom.js');
const M = require('./mod.js');
const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
const S = () => M.getS();

/* ---------------- 1. the budget is real and finite ---------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });

/* This gate checks what the screens contain. The world-first default folds
   every section and card closed behind the HUD's (i); the content is the same
   either way, so it is checked with the explanations shown - the folded
   default has its own check in group.js. */
M.UI.details = true;
ck(typeof M.hoursBudget === 'function', 'hoursBudget is missing');
const budget = M.hoursBudget();
console.log('weekly free hours    :', M.weeklyFreeHours());
console.log('quarter budget       :', budget, 'hours');
ck(budget > 40 && budget < 500, 'the quarterly hour budget is implausible: ' + budget);
ck(M.hoursLeft() === budget, 'hoursLeft should start at the full budget');

/* ---------------- 2. hours are consumed, and run out ---------------- */
const before = M.hoursLeft();
M.spendHours(50, false);
console.log('after spending 50h   :', M.hoursLeft(), 'left (was', before + ')');
ck(M.hoursLeft() === before - 50, 'spending hours did not reduce the balance correctly');

/* refuse to overdraw when borrowing is not allowed */
M.spendHours(M.hoursLeft(), false);      // exactly empty it
ck(M.hoursLeft() === 0, 'the budget should be exhausted');
const refused = M.spendHours(10, false);
ck(refused === -1, 'spendHours should refuse to overdraw when borrowing is disabled');
ck(M.hoursLeft() === 0, 'a refused spend must not change the balance');

/* borrowing is allowed, and it is recorded as sleep debt */
const borrowed = M.spendHours(40, true);
console.log('borrowed             :', borrowed, 'hours as sleep debt');
ck(borrowed === 40, 'borrowing should report the shortfall, got ' + borrowed);
ck(M.sleepDebt() === 40, 'sleep debt was not recorded');
ck(M.hoursLeft() === 0, 'borrowing must not invent free hours');

/* ---------------- 3. repetition collapses ---------------- */
S().p.acts = {};
const f0 = M.repeatFactor('grind');
M.noteAction('grind');
const f1 = M.repeatFactor('grind');
M.noteAction('grind'); M.noteAction('grind');
const f3 = M.repeatFactor('grind');
console.log('repeat factor        : 1st', f0.toFixed(2), '| 2nd', f1.toFixed(2), '| 4th', f3.toFixed(2));
ck(f0 === 1, 'the first attempt should be at full value');
ck(f1 < 0.7, 'the second attempt is not meaningfully discounted');
ck(f3 < 0.35, 'the fourth attempt should be worth very little');

/* ---------------- 4. the actual exploit: spamming ---------------- */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
S().p.job = { title: 'Analyst', monthly: 900000, industry: 'Corporate' };
S().p.debt = 0; S().p.spent = 0; S().p.acts = {};

const grind = M.CAREER.find(c => c.id === 'grind');
const hustle = M.CAREER.find(c => c.id === 'sidehustle');
ck(!!grind && !!hustle, 'grind or sidehustle went missing from CAREER');

/* Grind ten times in one quarter. Under the old model this was +60..130
   performance with no ceiling. It should now collapse and go into debt. */
const perfs = [];
for (let i = 0; i < 10; i++) {
  S().p.jobPerf = 40;                       // pin it so we measure the gain
  grind.run();
  perfs.push(+(S().p.jobPerf - 40).toFixed(1));
}
console.log('grind x10 gains      :', perfs.join(', '));
console.log('sleep debt after     :', Math.round(M.sleepDebt()), 'hours');
ck(perfs[0] > perfs[4], 'the tenth grind is as valuable as the first - the exploit is back');
ck(perfs[9] < perfs[0] * 0.3, 'grinding ten times still pays nearly full value');
ck(M.sleepDebt() > 200, 'ten grinds should have run up real sleep debt, got ' + Math.round(M.sleepDebt()));
const totalGain = perfs.reduce((a, b) => a + b, 0);
console.log('total gain from 10   :', totalGain.toFixed(1), '(old model: ~95)');
ck(totalGain < 45, 'ten grinds still yield a huge total performance gain: ' + totalGain.toFixed(1));

/* Side hustle, same treatment: the money must dry up and the debt must bite. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
S().p.debt = 0; S().p.spent = 0; S().p.acts = {};
const earns = [];
for (let i = 0; i < 8; i++) {
  const c0 = M.getS().fin.cash;
  hustle.run();
  earns.push(S().fin.cash - c0);
}
console.log('hustle x8 earnings   :', earns.map(e => e.toLocaleString()).join(', '));
console.log('sleep debt after     :', Math.round(M.sleepDebt()), 'hours');
const firstTwo=(earns[0]+earns[1])/2, lastTwo=(earns[6]+earns[7])/2;
ck(lastTwo < firstTwo*0.5, 'the last hustles still pay like the first');
ck(M.sleepDebt() > 150, 'eight hustles should have run up sleep debt');

/* ---------------- 5. the debt is collected ----------------
   Performance drifts randomly each quarter, so a single sample can mask the
   penalty. Average enough runs to separate the signal from the noise. */
function outcomeWithDebt(debt){
  let hp = 0, pf = 0, db = 0;
  const N = 30;
  for(let i=0;i<N;i++){
    /* A different seed per iteration, not the same one thirty times. This loop
       exists to average the noise out of stepPersonal()'s random drift, so it
       needs thirty different worlds - and seeding them all 4242 turned it into
       the same world thirty times, which averages nothing. Fixed per iteration
       rather than left random, so the suite is still reproducible run to run. */
    M.newGame({ name:'Ada', city:'lagos', profile:'grad', difficulty:'realistic', seed: 4242 + i });
    S().p.job = { title:'Analyst', monthly:900000, industry:'Corporate' };
    S().p.jobPerf = 70; S().p.health = 80; S().p.debt = debt; S().p.spent = 0;
    M.stepPersonal();
    hp += S().p.health; pf += S().p.jobPerf; db += M.sleepDebt();
  }
  return { health:hp/N, perf:pf/N, debt:db/N };
}
const clear = outcomeWithDebt(0);
const owing = outcomeWithDebt(300);
console.log('no debt  -> health', clear.health.toFixed(1), '| perf', clear.perf.toFixed(1));
console.log('300h owe -> health', owing.health.toFixed(1), '| perf', owing.perf.toFixed(1),
  '| debt left', owing.debt.toFixed(0));
ck(owing.health < clear.health - 2, 'sleep debt did not cost health on average');
ck(owing.perf < clear.perf - 2, 'sleep debt did not cost performance on average');
ck(owing.debt < 300, 'sleep debt was never repaid');
ck(owing.debt > 0, 'sleep debt was wiped instantly rather than worked off');

/* ---------------- 6. the quarter resets the budget ---------------- */
M.newGame({ name:'Ada', city:'lagos', profile:'grad', difficulty:'realistic', seed: 4242 });
S().p.spent = 999; S().p.acts = { grind: 5 };
M.advanceQuarter();
ck(M.hoursSpent() === 0, 'the hour budget was not reset by the new quarter');
ck(Object.keys(S().p.acts || {}).length === 0, 'the repeat counters were not reset');
console.log('quarter reset        : spent', M.hoursSpent(), '| acts', Object.keys(S().p.acts || {}).length);

/* ---------------- 7. sabbatical cannot be taken every quarter ---------------- */
M.newGame({ name:'Ada', city:'lagos', profile:'grad', difficulty:'realistic', seed: 4242 });
const sab = M.CAREER.find(c => c.id === 'sabbatical');
S().fin.cash = 5000000; S().cd = {}; S().turn = 4;
ck(sab.can(M.getS()) === true, 'sabbatical should be available to start with');
sab.run();
ck(sab.can(M.getS()) === false, 'sabbatical could be taken again the same quarter');
S().turn += 3;
ck(sab.can(M.getS()) === false, 'sabbatical became available again after only 3 quarters');
S().turn += 1;
console.log('sabbatical cooldown  : one year, reopens at turn +4 =', sab.can(M.getS()));
ck(sab.can(M.getS()) === true, 'sabbatical did not reopen after a full year');

/* ---------------- 8. the panel tells you what it costs ---------------- */
M.newGame({ name:'Ada', city:'lagos', profile:'grad', difficulty:'realistic', seed: 4242 });
M.UI.tab = 'work'; M.UI.sub = 'career';
M.render();
const html = global.document.getElementById('main').innerHTML;
ck(html.indexOf('h left') >= 0, 'the career panel does not show the hours remaining');
S().p.spent = M.hoursBudget();
M.render();
const html2 = global.document.getElementById('main').innerHTML;
ck(html2.indexOf('cost you sleep') >= 0, 'the panel does not warn when an action would cost sleep');
console.log('panel                : budget shown', html.indexOf('h left') >= 0,
  '| shortfall warning', html2.indexOf('cost you sleep') >= 0);

/* ---------------- 9. networking is not a bottomless well ---------------- */
M.newGame({ name:'Ada', city:'lagos', profile:'grad', difficulty:'realistic', seed: 4242 });
S().p.debt = 0; S().p.spent = 0; S().p.acts = {}; S().fin.cash = 9000000;
const net = M.CAREER.find(c => c.id === 'network');
const nets = [];
let guard = 0;
while (net.can(M.getS()) && guard++ < 40) {
  const n0 = S().p.skills.network;
  net.run();
  nets.push(+(S().p.skills.network - n0).toFixed(2));
}
console.log('lunches in a quarter :', nets.length, '| gains', nets.slice(0, 6).join(', '));
ck(nets.length < 20, 'networking is effectively unlimited: ' + nets.length + ' lunches in one quarter');
ck(nets.length >= 3, 'networking became impossible too quickly: ' + nets.length);
ck(nets[0] > nets[nets.length - 1], 'the last lunch of the quarter pays like the first');
ck(net.can(M.getS()) === false, 'networking should stop once the hours are gone');

console.log(bad.length ? ('\nHOURS ISSUES:\n' + [...new Set(bad)].map(m => ' - ' + m).join('\n')) : '\nHOURS CLEAN');
process.exit(0);
