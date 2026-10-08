/* Gate: the profile and the record of finished runs.

   The profile is the only thing that survives a run. It is what the game
   remembers about you, it is what adaptive difficulty reads, and it is the
   thing that syncs to the cloud. Two rules bound it and both are enforced
   here:

     - a run is recorded once, at the end, and never rewritten afterwards
     - portability is sync, never a file: there is no export/import, and
       there must not be one again

   Claims:
     1.  a finished run is recorded exactly once, not once per render
     2.  profileSummary reports the run back (count, years, best, band)
     3.  no record means no rating - the game takes you at face value
     4.  the rating moves with the quality of the runs, in the right direction
     5.  the rating is bounded, and a bankruptcy is worth less than a survival
     6.  the record survives starting a new game
     7.  the profile and run-info screens render
     8.  there is no file export or import - portability is by sync only

   Deliberately not asserted: the exact rating numbers. Those are balance.
   Direction, bounds, and persistence are what must hold. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
try { M.UI.noAnim = true; } catch (e) {}

M.profReset();

/* a run worth having: retired comfortably, wealthy, mostly good calls */
const goodRun = (i) => ({
  id: 'g' + i, ended: new Date().toISOString(), name: 'Ada', seed: 1000 + i,
  profile: 'grad', difficulty: 'realistic', reason: 'retire',
  years: 30, turns: 120, age: 65, nw: 900000000, nwReal: 400000000,
  freedom: 88, quality: 82, dec: { good: 40, bad: 4, neutral: 30, total: 74 }
});
/* and one worth forgetting */
const badRun = (i) => ({
  id: 'b' + i, ended: new Date().toISOString(), name: 'Ada', seed: 2000 + i,
  profile: 'grad', difficulty: 'realistic', reason: 'bankrupt',
  years: 6, turns: 24, age: 32, nw: -2000000, nwReal: -1500000,
  freedom: 4, quality: 12, dec: { good: 3, bad: 26, neutral: 12, total: 41 }
});

/* ---- 3: no record means no rating ------------------------------------- */
{
  const p = M.ensureProfile();
  ck((p.runs || []).length === 0, 'a reset profile should start with no runs');
  ck(M.skillRating(p) === null, 'with no runs the rating must be null, got ' + M.skillRating(p));
  const sum = M.profileSummary();
  ck(sum.n === 0, 'summary should report zero runs');
  ck(/no record/i.test(sum.band.label), 'the band should say there is no record yet, said: ' + sum.band.label);
}

/* ---- 5: run quality is bounded and ordered ---------------------------- */
{
  const qg = M.runQuality(goodRun(1)), qb = M.runQuality(badRun(1));
  ck(qg > qb, 'a good run must be worth more than a bankruptcy: ' + qg.toFixed(1) + ' vs ' + qb.toFixed(1));
  ck(qg >= 0 && qg <= 100, 'run quality out of bounds: ' + qg);
  ck(qb >= 0 && qb <= 100, 'run quality out of bounds: ' + qb);
  /* survival is worth something on its own, at equal wealth and freedom */
  const retired  = Object.assign({}, goodRun(9), { reason: 'retire'  });
  const bankrupt = Object.assign({}, goodRun(9), { reason: 'bankrupt' });
  ck(M.runQuality(retired) > M.runQuality(bankrupt),
     'retiring should beat going bust at the same numbers');
  /* and the tier you played on is weighted */
  const hard = Object.assign({}, goodRun(10), { difficulty: 'hardcore' });
  const easy = Object.assign({}, goodRun(10), { difficulty: 'apprentice' });
  ck(M.runQuality(hard) > M.runQuality(easy),
     'the same run on hardcore should be worth more than on apprentice');
  console.log('run quality      : good ' + qg.toFixed(0) + ' · bust ' + qb.toFixed(0));
}

/* ---- 4: the rating moves in the right direction ----------------------- */
{
  const p = M.ensureProfile();
  p.runs = [];
  for (let i = 0; i < 8; i++) p.runs.push(goodRun(i));
  const high = M.skillRating(p);
  p.runs = [];
  for (let i = 0; i < 8; i++) p.runs.push(badRun(i));
  const low = M.skillRating(p);
  ck(high > low, 'strong runs should rate above weak ones: ' + high.toFixed(1) + ' vs ' + low.toFixed(1));
  ck(high <= 100 && low >= 0, 'rating out of bounds');
  const bHigh = M.skillBand(high), bLow = M.skillBand(low);
  ck(bHigh.label !== bLow.label, 'a strong and a weak record should not share a band');
  console.log('rating           : strong ' + high.toFixed(1) + ' (' + bHigh.label +
              ') · weak ' + low.toFixed(1) + ' (' + bLow.label + ')');
}

/* ---- 1 & 2: a real run is recorded once ------------------------------- */
{
  M.profReset();
  M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
  const S = M.getS();
  S.season = null;
  /* play to a natural end, rather than calling the recorder directly */
  let n = 0;
  while (!S.gameOver && n < 400) { try { M.ACT.advance(); } catch (e) {} M.UI.modal = null; n++; }
  ck(!!S.gameOver, 'the run should have ended (turn ' + S.turn + ')');
  const p = M.ensureProfile();
  const recorded = (p.runs || []).length;
  ck(recorded === 1, 'one finished run should be recorded once, got ' + recorded);
  /* rendering the report repeatedly must not record it again */
  M.endModal(); M.endModal(); M.endModal();
  ck((M.ensureProfile().runs || []).length === 1,
     're-rendering the report must not record the run again');
  const sum = M.profileSummary();
  ck(sum.n === 1, 'summary should report one run');
  ck(sum.years > 0, 'summary should report years played');
  const rec = (M.ensureProfile().runs || [])[0];
  ck(rec && rec.difficulty === 'realistic', 'the record should carry the difficulty it was played on');
  ck(rec && typeof rec.nwReal === 'number', 'the record should carry inflation-adjusted wealth');
  console.log('recorded run     : ' + sum.n + ' run · ' + sum.years + ' years · ' +
              (rec ? rec.reason : '?') + ' · rating ' +
              (sum.skill === null ? 'null' : sum.skill.toFixed(0)));
}

/* ---- 6: the record survives a new game -------------------------------- */
{
  const before = (M.ensureProfile().runs || []).length;
  M.newGame({ name: 'Bisi', city: 'abuja', profile: 'founder', difficulty: 'realistic', seed: 4242 });
  const after = (M.ensureProfile().runs || []).length;
  ck(after === before, 'starting a new game must not wipe the record: ' + before + ' -> ' + after);
  ck(M.getS().name === 'Bisi', 'the new run should carry the new name');
}

/* ---- 7: the screens render -------------------------------------------- */
{
  const pm = M.profileModal();
  ck(pm && pm.length > 100, 'the profile screen should render');
  const p = M.ensureProfile();
  if ((p.runs || []).length) {
    const ri = M.runInfoModal(p.runs[0].id);
    ck(ri && ri.length > 60, 'the run-info screen should render for a recorded run');
  }
  M.UI.tab = 'legacy'; M.UI.sub = 'record';
  const v = M.viewCareerRecord();
  ck(v && v.length > 100, 'the record tab should render');
}

/* ---- 8: no file export or import. Ever. ------------------------------- */
{
  ck(typeof M.profexport !== 'function', 'profexport must not exist - portability is sync, not a file');
  ck(typeof M.profimport !== 'function', 'profimport must not exist - portability is sync, not a file');
  ['profexport', 'profimport'].forEach(a => {
    ck(!(M.ACT && M.ACT[a]), 'there must be no ' + a + ' action');
  });
}

if (bad.length) { console.log('\nPROF ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nPROF CLEAN');
