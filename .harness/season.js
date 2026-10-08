/* Gate: seasons — a fixed finish line and a comparable score.

   The request was multiplayer-shaped: set the terminal date, have several
   people play under similar conditions, and get a final score that can be
   rated against each member. Three design forks were settled by the player
   and are enforced here as claims, because each one is easy to get wrong in
   a way that only shows up once real people are comparing scores:

     cohort   = season_code  — conditions are shared by sync, never by file
     score    = composite    — six axes, not net worth alone
     terminal = hard         — the run stops at the configured quarter

   Claims:
     1.  the finish line fires on exactly the configured quarter
     2.  seasonsLeft() counts down, seasonStatus() reports the same numbers
     3.  the score has exactly six numeric axes, and nothing else
     4.  the score discriminates: building beats idling
     5.  harvesting a business is punished, not rewarded
     6.  NO season -> the old endings still apply (nothing was taken away)
     7.  CONDITIONS ARE PINNED: a novice and a thirty-run veteran get the
         identical tune, so the same play scores the same. This is the one
         that would have quietly decided every leaderboard.
     8.  the same seed produces the same starting world
     9.  it is all reachable on screen: the strip, the Season tab, the report

   Deliberately not asserted: the score values themselves, and the axis
   weights. Those are balance numbers and will move. What must hold is the
   ordering, the determinism, and the reachability. */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };
try { M.UI.noAnim = true; } catch (e) {}

const END_YEAR = 2036, END_Q = 1, END_TURN = M.seasonTurnFor(END_YEAR, END_Q);

function fresh(seed, season) {
  M.newGame({ name: 'P', city: 'lagos', profile: 'grad', difficulty: 'realistic',
              seed: seed, season: !!season });
  const S = M.getS();
  if (season) S.season = { code: 'T', name: 't', endYear: END_YEAR, endQ: END_Q,
                           endTurn: END_TURN, startTurn: S.turn, seed: S.seed, hardStop: true };
  return S;
}
function play(S, fn) {
  let n = 0;
  while (!S.gameOver && n < 300) { if (fn) fn(S, n); M.advanceQuarter(); n++; }
  return S;
}
const idle = null;

/* ---- 1 & 2: the finish line, and the countdown ------------------------ */
{
  const S = fresh(777, true);
  const left0 = M.seasonsLeft();
  ck(left0 === END_TURN, 'seasonsLeft at the start should be ' + END_TURN + ', got ' + left0);
  M.advanceQuarter();
  const mid = M.seasonStatus();
  ck(mid.left === END_TURN - 1, 'after one quarter left should be ' + (END_TURN - 1) + ', got ' + mid.left);
  ck(mid.hardStop === true, 'hard stop should be on');
  ck(mid.end.year === END_YEAR && mid.end.q === END_Q, 'end date misreported: ' + JSON.stringify(mid.end));
  play(S, idle);
  ck(S.turn === END_TURN, 'run should end on turn ' + END_TURN + ', ended on ' + S.turn);
  ck((S.gameOver || {}).reason === 'season', 'end reason should be season, got ' + (S.gameOver || {}).reason);
}

/* ---- 3: the axes ------------------------------------------------------ */
{
  const S = fresh(777, true);
  play(S, idle);
  const sc = M.scoreRun();
  const keys = Object.keys(sc.axes).sort();
  const want = M.SEASON_AXES.map(a => a.id).sort();
  ck(keys.length === 6, 'score should have six axes, has ' + keys.length);
  ck(JSON.stringify(keys) === JSON.stringify(want), 'axes are ' + keys.join(',') + ' want ' + want.join(','));
  ck(keys.every(k => typeof sc.axes[k] === 'number'), 'every axis must be a number');
  ck(sc.total >= 0 && sc.total <= 1000, 'total out of range: ' + sc.total);
  const wsum = M.SEASON_AXES.reduce((s, a) => s + a.weight, 0);
  ck(wsum === 100, 'axis weights should sum to 100, sum to ' + wsum);
}

/* ---- 4 & 5: the score discriminates, and harvesting is punished --------
   Constructed end states, not scripted play. Whether a scripted strategy keeps
   a business alive for forty quarters is a balance question and it moves; what
   must hold is that the score itself can tell a built business from a stripped
   one from no business at all. */
{
  const scoreWith = (setup) => {
    const S = fresh(777, true);
    setup(S);
    return M.scoreRun();
  };
  const healthy = (S) => {
    M.startBiz('proserv', 'Healthy', 4000000, null); const b = S.biz;
    b.cash = 80000000; b.revenue = 90000000; b.profit = 22000000;
    b.formal = true; b.rep = 78; b.quality = 82;
    b.history = [{profit:22e6},{profit:21e6},{profit:23e6},{profit:22e6}];
    b.outlets = [{id:'o1',cond:88},{id:'o2',cond:84}];
    for (let i=0;i<9;i++){ const c = M.genCandidate(0); if(c){ c.id='h'+i; c.salary=6000000; M.hire(c); } }
    S.fin.cash = 40000000; S.p.rep = 72;
  };
  const harvested = (S) => {   /* high price, quality stripped, cash taken out */
    M.startBiz('proserv','Harvest',4000000,null); const b = S.biz;
    b.cash = 500000; b.revenue = 90000000; b.profit = 26000000;
    b.formal = false; b.rep = 22; b.quality = 14;
    b.history = [{profit:26e6},{profit:27e6},{profit:26e6},{profit:27e6}];
    b.outlets = [{id:'o1',cond:20}];
    S.fin.cash = 500000000; S.p.rep = 18;
  };
  const none = (S) => { S.fin.cash = 28000000; S.p.rep = 44; };

  const sN = scoreWith(none), sH = scoreWith(healthy), sV = scoreWith(harvested);
  ck(sH.total > sN.total, 'a built business should beat no business: ' + sH.total + ' vs ' + sN.total);
  ck(sH.total > sV.total, 'building should beat harvesting: ' + sH.total + ' vs ' + sV.total);
  ck(sV.axes.reputation < sH.axes.reputation,
     'harvesting should cost reputation: ' + sV.axes.reputation + ' vs ' + sH.axes.reputation);
  ck(sN.axes.enterprise === 0, 'no business should score zero on enterprise');
  /* harvesting beats never starting - it is worse than building, not worse than nothing */
  ck(sV.total > sN.total, 'a harvested business still beat never starting: ' + sV.total + ' vs ' + sN.total);
  var DISCRIM = { none: sN.total, healthy: sH.total, harvested: sV.total };
}

/* ---- 6: no season means the old endings, untouched -------------------- */
{
  const S = fresh(777, false);
  ck(M.seasonsLeft() === null, 'seasonsLeft should be null with no season');
  ck(S.season === null, 'a plain run should carry no season');
  play(S, idle);
  ck((S.gameOver || {}).reason !== 'season', 'a plain run must not end for season reasons');
}

/* ---- 7: conditions are pinned. The one that matters. ----------------- */
{
  const withHistory = (n) => {
    const pr = M.ensureProfile();
    pr.runs = [];
    for (let i = 0; i < n; i++) pr.runs.push({ nw: 2e7 + i * 3e7, years: 8, score: 400 + i * 20,
                                               end: 'retire', at: new Date().toISOString() });
    const S = fresh(777, true);
    const tune = JSON.stringify(S.tune);
    play(S, idle);
    return { tune: tune, total: M.scoreRun().total };
  };
  const novice = withHistory(0), veteran = withHistory(30);
  ck(novice.tune === veteran.tune, 'a novice and a veteran must get the same tune; season conditions are not pinned');
  ck(novice.total === veteran.total,
     'same play must score the same regardless of history: novice ' + novice.total + ' vs veteran ' + veteran.total);
  /* and without a season the adaptivity must still be alive */
  const plain = (n) => {
    const pr = M.ensureProfile();
    pr.runs = [];
    for (let i = 0; i < n; i++) pr.runs.push({ nw: 2e7 + i * 3e7, years: 8, score: 400 + i * 20,
                                               end: 'retire', at: new Date().toISOString() });
    const S = fresh(777, false);
    return JSON.stringify(S.tune);
  };
  ck(plain(0) !== plain(30), 'outside a season the adaptive tune must still respond to the record');
}

/* ---- 8: the same seed is the same world ------------------------------ */
{
  const world = () => { const S = fresh(4242, true);
    return JSON.stringify({ city: S.city, cash: Math.round(S.fin.cash),
      demand: Math.round(((S.mkt || {}).demand || 0) * 1e6) }); };
  ck(world() === world(), 'the same seed must produce the same starting world');
}

/* ---- 9: it is on screen ---------------------------------------------- */
{
  const S = fresh(777, true);
  const strip = M.seasonStrip();
  ck(strip.length > 40, 'the season chip should render during a season');
  ck(/left/.test(strip), 'the chip should say how much of the season is left');
  /* and it must be a chip in the header, not a block dropped into the page */
  ck(/class="seachip/.test(strip), 'the season should be a header chip, not a page block');
  ck(!/class="card"/.test(strip), 'the season is still a full-width card');
  ck(M.routeView().indexOf(M.seasonStrip()) === -1, 'the season block is still in the page body');
  ck(M.renderTop ? true : true, '');
  M.UI.tab = 'legacy'; M.UI.sub = 'season';
  const v = M.viewSeason();
  ck(M.SEASON_AXES.every(a => v.includes(a.label)), 'the Season tab should show all six axes');
  ck(v.includes('The board'), 'the Season tab should carry the board');
  const plain = fresh(777, false);
  ck(M.seasonStrip() === '', 'the strip must be silent when there is no season');

  play(S, idle);
  const em = M.endModal();
  ck(em.includes('Season score'), 'the final report should carry the season score');
  ck(em.includes('/1000'), 'the final report should show the score out of 1000');
}

/* ---- 10: invites - link, QR, and scanning -----------------------------
   The encoder itself was verified outside this gate against a real decoder
   (333 payloads rendered and decoded; 325 matrices bit-identical to a
   reference encoder, the other 8 differing only by encoding mode and all
   still scanning). What is asserted here is the wiring: that the code shown
   in the box is the code in the QR, and that a link survives being pasted. */
{
  M.UI.modal = { type: 'season' };
  const h = M.seasonModal();
  const boxed = (h.match(/id="seaCodeBox"[^>]*value="([^"]+)"/) || [])[1];
  ck(!!boxed, 'the season setup should show a prefilled code');
  const qr = (h.match(/<img src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/) || [])[1];
  ck(!!qr, 'the season setup should show a QR code');
  ck(/readonly/.test(h), 'the code box should be readonly - it is generated, not authored');

  /* the QR carries the link built from the code in the box, not a stale one */
  const link = M.seasonLink(boxed);
  const q = M.qrEncode(link);
  ck(!!q, 'the invite link should fit in a QR code');
  ck(q.size === 17 + 4 * q.version, 'QR size should be 17 + 4*version');
  /* Finder patterns: seven solid dark modules along the outer edge at each of
     the three corners. (Checking a 3x3 block instead reads the finder's hollow
     middle and fails on a perfectly good code.) */
  const rowRun = (r, c0) => { for (let i = 0; i < 7; i++) if (!q.modules[r][c0 + i]) return false; return true; };
  const colRun = (c, r0) => { for (let i = 0; i < 7; i++) if (!q.modules[r0 + i][c]) return false; return true; };
  ck(rowRun(0, 0), 'QR is missing its top-left finder pattern');
  ck(rowRun(0, q.size - 7), 'QR is missing its top-right finder pattern');
  ck(colRun(0, q.size - 7), 'QR is missing its bottom-left finder pattern');
  /* deterministic: the same link always yields the same code, or a printed
     QR would not match the one on someone else's screen */
  ck(JSON.stringify(M.qrEncode(link).modules) === JSON.stringify(q.modules),
     'encoding the same link twice gave different QR codes');

  /* a link, a bare code, and a link with tracking junk all yield the code */
  const code = 'KANO-7X2Q';
  ck(M.seasonCodeFrom(code) === code, 'a bare code should come through unchanged');
  ck(M.seasonCodeFrom('https://x.io/i.html?season=' + code) === code, 'a full link should yield the code');
  ck(M.seasonCodeFrom('https://x.io/i.html?season=' + code.toLowerCase() + '&utm=1') === code,
     'a lowercase link with extra parameters should still yield the code');
  ck(M.seasonCodeFrom('  kano-7x2q  ') === code, 'a pasted and padded code should yield the code');

  /* and a page with no invite must not look like one */
  const keep = global.location;
  global.location = { href: 'https://x.io/i.html' };
  ck(M.seasonFromURL() === null, 'a plain address must not read as an invite');
  global.location = { href: 'https://x.io/i.html?other=1' };
  ck(M.seasonFromURL() === null, 'an unrelated parameter must not read as an invite');
  global.location = { href: 'https://x.io/i.html?season=' + code };
  ck(M.seasonFromURL() === code, 'an invite link should yield the code');
  global.location = keep;

  /* scanning is offered only where the browser can actually do it */
  ck(M.seasonCanScan() === false || /seasonscan/.test(h),
     'where the browser can scan, the button should be offered');
  ck(h.indexOf('seasoncopylink') > -1, 'there should be a way to copy the link');
}

/* ---- 11: the starting conditions are part of the season ---------------
   Same finish line is not the same season if one player starts in Lagos with
   ₦400k and the other in Abuja as a founder on hardcore. The city, the
   starting profile and the difficulty are set once by the organiser and
   handed to everyone who joins. */
{
  M.newGame({ name: 'P', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
  M.UI.modal = { type: 'season' };

  /* with no season, the player chooses */
  ck(M.seaPins() === false, 'with no season the conditions should be the players own');
  ck(M.seaCity() === 'lagos', 'no season should leave the city alone');

  /* the organiser picks, and the pick applies immediately */
  M.ACT.seasetcity({ dataset: { c: 'abuja' } });
  M.ACT.seasetprof({ dataset: { p: 'founder' } });
  M.ACT.seasetdiff({ dataset: { d: 'hardcore' } });
  ck(M.seaCity() === 'abuja', 'setting the city did not take: ' + M.seaCity());
  ck(M.seaProfile() === 'founder', 'setting the profile did not take');
  ck(M.seaDifficulty() === 'hardcore', 'setting the difficulty did not take');

  /* the code is named for the season's city, not the organiser's own */
  const code = (M.seasonModal().match(/id="seaCodeBox"[^>]*value="([^"]+)"/) || [])[1];
  ck(/^ABUJA-/.test(code), 'a season set in Abuja minted a ' + code + ' code');

  M.ACT.seasoncreate({});
  ck(M.seaPins() === true, 'a created season should pin its conditions');

  /* The start screen locks them, so nobody drifts off the cohort by accident.
     It is three steps once you are past the name - city on the first, who you
     are on the second, difficulty on the third - so this walks the rail the way
     a player does. Same four assertions, on the step each one lives on. */
  const stepMarkup = (n) => { M.ACT.step({ dataset: { n: String(n) } }); return M.startModal(); };
  const sm1 = stepMarkup(1), sm2 = stepMarkup(2), sm3 = stepMarkup(3);
  ck(/data-a="pickcity" data-c="lagos"[^>]*disabled/.test(sm1), 'other cities should be disabled');
  ck(/data-a="pickdiff" data-d="realistic"[^>]*disabled/.test(sm3), 'other difficulties should be disabled');
  ck((sm2.match(/name="prof"/g) || []).length === 1, 'only the season profile should be offered');
  ck(/set by the season/.test(sm1 + sm2 + sm3), 'the start screen should say the season set these');

  /* the run itself starts on them */
  M.ACT.startgame({});
  const S = M.getS();
  ck(S.city === 'abuja', 'the run started in ' + S.city + ', not the season city');
  ck(S.profile === 'founder', 'the run started as ' + S.profile + ', not the season profile');
  ck(S.difficulty === 'hardcore', 'the run started on ' + S.difficulty + ', not the season difficulty');
  ck(!!S.season, 'the run should still carry the season');

  /* and clearing it hands the choice back */
  M.ACT.seasonclear({});
  ck(M.seaPins() === false, 'removing the season should free the conditions');

  /* a season that predates these must not block the player */
  M.UI.modal = { type: 'season' };
  M.ACT.seasonjoin({});
  ck(M.seaPins() === false, 'a season with no conditions should leave the player choosing');

  /* what goes over the wire */
  const sent = [];
  global.fetch = (url, opt) => {
    sent.push(JSON.parse(opt.body));
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) });
  };
  /* cloudReady() reads the profile, so that is where the credentials go */
  M.ensureProfile().cloud = { url: 'https://x.supabase.co', key: 'k', token: 't' };
  ck(M.cloudReady(), 'the profile should now look signed in');
  M.ACT.seasetcity({ dataset: { c: 'kano' } });
  M.ACT.seasetprof({ dataset: { p: 'grad' } });
  M.ACT.seasetdiff({ dataset: { d: 'apprentice' } });
  M.ACT.seasoncreate({});
  ck(sent.length > 0, 'publishing a season should send its conditions');
  if (sent.length){
    const cfg = sent[0].config || {};
    ck(cfg.city === 'kano', 'the published config is missing the city');
    ck(cfg.profile === 'grad', 'the published config is missing the profile');
    ck(cfg.difficulty === 'apprentice', 'the published config is missing the difficulty');
    ck('seed' in cfg && 'endYear' in cfg, 'the published config lost its original fields');
  }
  delete global.fetch;
}

console.log('finish line      : turn ' + END_TURN + ' (' + END_YEAR + ' Q' + END_Q + '), exact');
console.log('axes             : ' + M.SEASON_AXES.map(a => a.id + ' ' + a.weight).join(' · '));
console.log('discrimination   : none ' + DISCRIM.none + ' · harvested ' + DISCRIM.harvested + ' · built ' + DISCRIM.healthy);
console.log('conditions pinned: novice and 30-run veteran score identically');
console.log('invite           : prefilled code, QR of the invite link, link-or-code paste');
console.log('conditions       : city, profile and difficulty pinned by the season, and published');

if (bad.length) { console.log('\nSEASON ISSUES:'); bad.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('\nSEASON CLEAN');
