/* Gate: partnership offers on the Deals screen.

   "Shake hands" threw `Cannot read properties of undefined (reading 'min')`
   every time it was pressed, and had done since the offers were written. The
   button called ACT.acceptpartner, which is the handler for starting a NEW
   business alongside a partner: it read UI.modal.offers and UI.modal.typeId,
   and the Deals screen sets neither. So M.offers[…] came back undefined, or
   BIZ.find() did, and T.min blew up.

   Nothing caught it because nothing ever pressed it. This gate presses it.

   It claims:
     1. the old crash is gone — acceptpartner survives being called with no
        partner modal open, and so does every other action on that screen
     2. handing over equity actually hands over the percentage it says,
        measured after the new shares exist (the classic dilution error)
     3. the capital lands in the company, not with the player
     4. what they asked for is minuted as an undertaking
     5. the offer is consumed, and declining consumes it too
     6. the button on the card names an action that exists */
require('./dom.js');
const M = require('./mod.js');

const bad = [];
const ck = (c, m) => { if (!c) bad.push(m); };

M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
const S = M.getS();
S.fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) { M.advanceQuarter(); M.UI.modal = null; }
M.UI.modal = null;
let b = S.biz;
ck(!!b, 'the fixture never started a business');

/* ---------------- 1. the reported crash ---------------------------------- */
/* Pressing it with no partner modal open is exactly what the player did. */
S.offers = [M.genPartnerOffer(), M.genPartnerOffer()];
M.UI.tab = 'money'; M.UI.sub = 'deals';
let threw = '';
try { M.ACT.acceptpartner({ dataset: { i: '0' } }); }
catch (e) { threw = e.message; }
ck(!threw, 'acceptpartner still throws with no partner modal open: ' + threw);
console.log('old crash        : acceptpartner with no modal open → ' + (threw ? 'THREW' : 'no-op, no throw'));

/* and every action the Deals screen emits must survive being pressed */
const dealsHTML = String(M.viewDeals());
const acts = [];
(dealsHTML.match(/data-a="([^"]+)"/g) || []).forEach(m => {
  const a = m.slice(8, -1);
  if (acts.indexOf(a) < 0) acts.push(a);
});
acts.forEach(a => {
  ck(a in M.ACT, 'the Deals screen emits an action with no handler: ' + a);
  let err = '';
  try { M.ACT[a]({ dataset: { i: '0', d: (S.deals || [{}])[0] ? S.deals[0].id : 'x' } }); }
  catch (e) { err = e.message; }
  ck(!err, 'pressing "' + a + '" on the Deals screen throws: ' + err);
  M.UI.modal = null;
});
console.log('deals actions    : ' + acts.length + ' pressed · none threw · ' + acts.join(' '));

/* ---------------- 2. the dilution maths --------------------------------- */
/* 20% of the company AFTER the shares exist, not before. */
[10, 20, 35].forEach(pct => {
  const n = M.partnerSharesFor(b, pct);
  const after = n / (M.totalShares(b) + n) * 100;
  ck(Math.abs(after - pct) < 0.6,
     'offering ' + pct + '% would hand over ' + after.toFixed(1) + '%');
});
console.log('dilution maths   : 10 / 20 / 35% offered → ' +
  [10, 20, 35].map(p => {
    const n = M.partnerSharesFor(b, p);
    return (n / (M.totalShares(b) + n) * 100).toFixed(1) + '%';
  }).join(' / ') + ' actually given');

/* ---------------- 3. the money goes into the company, not to you -------- */
S.offers = [M.genPartnerOffer()];
const offer = S.offers[0];
const equityBefore = M.yourPct(b);
const cashBiz = b.cash, cashYou = S.fin.cash;
const sharesBefore = M.totalShares(b);

M.ACT.takepartner({ dataset: { i: (M.getS().offers || [])[0].id } });
ck(!!(M.UI.modal && M.UI.modal.cb), 'takepartner did not ask for confirmation');
M.UI.modal.cb();

ck(!(S.offers || []).some(o => o.id === offer.id), 'the offer was not consumed');
const holders = M.extHolders(b);
ck(holders.length > 0, 'no holder was created — nobody actually joined');
const h = holders[holders.length - 1];
ck(h.name === offer.name, 'the holder is called ' + h.name + ', the offer was ' + offer.name);
const gained = (h.pct || 0);
ck(gained > 1, 'the new partner holds ' + gained.toFixed(1) + '% — nothing was handed over');
ck(Math.abs(gained - offer.equity) < 1.5,
   'the card said ' + offer.equity + '% and the register says ' + gained.toFixed(1) + '%');
ck(M.yourPct(b) < equityBefore - 0.5,
   'you were not diluted (' + equityBefore.toFixed(1) + '% → ' + M.yourPct(b).toFixed(1) + '%)');
ck(M.totalShares(b) > sharesBefore, 'no shares were issued');

/* the capital is the company's, not the player's */
ck(b.cash > cashBiz, 'the capital did not land in the company (was ' + M.fmt(Math.round(cashBiz)) +
   ', now ' + M.fmt(Math.round(b.cash)) + ')');
ck(S.fin.cash <= cashYou, 'the partnership money landed in the player\'s pocket — it should go into the company');
console.log('capital          : ' + M.fmt(Math.round(b.cash - cashBiz)) + ' into the company · ' +
            'player cash unchanged at ' + M.fmt(Math.round(S.fin.cash)));
console.log('equity           : you ' + equityBefore.toFixed(0) + '% → ' + M.yourPct(b).toFixed(0) +
            '% · ' + h.name + ' takes ' + gained.toFixed(1) + '% (card said ' + offer.equity + '%)');

/* ---------------- 4. the ask is minuted, and can be delivered ----------- */
const us = (b.undertakings || []).filter(u => u.dirName === offer.name);
ck(us.length === 1, 'what they asked for was not minuted — ' + us.length + ' undertaking(s) recorded');
if (us.length) {
  ck(us[0].text === offer.ask, 'the minuted undertaking is not the thing they asked for');
  ck(us[0].due > S.turn, 'the undertaking has no deadline');
}

/* Every ask the generator can produce, tested. A whitelist of kinds would
   have gone stale the moment a kind was added — which is exactly what
   happened: two asks ('a signed founders agreement' and 'their cousin on the
   payroll') had no kind that meant anything, so both were being minuted as
   monthly reporting. Assert behaviour instead: whatever kind an ask maps to,
   undertakingMet() must understand it and fulfilUndertaking() must be able to
   deliver it rather than falling through to "Noted." */
const ASKS = ['wants a board seat', 'wants monthly reporting',
              'wants a signed founders agreement', 'wants their cousin on the payroll'];
const seen = [];
ASKS.forEach(ask => {
  const st = M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
  const s2 = M.getS();
  s2.fin.cash = 40000000;
  M.startBiz('tech', 'Testco', 6000000, null);
  for (let i = 0; i < 6; i++) { M.advanceQuarter(); M.UI.modal = null; }
  M.UI.modal = null;
  const bb = s2.biz;
  const o = M.genPartnerOffer();
  o.ask = ask;
  s2.offers = [o];
  M.ACT.takepartner({ dataset: { i: (M.getS().offers || [])[0].id } });
  if (!M.UI.modal || !M.UI.modal.cb) { bad.push('takepartner did not confirm for "' + ask + '"'); return; }
  M.UI.modal.cb();
  const u = (bb.undertakings || []).filter(x => x.dirName === o.name).pop();
  if (!u) { bad.push('"' + ask + '" was not minuted at all'); return; }
  ck(u.text === ask, '"' + ask + '" was minuted as "' + u.text + '"');
  ck(!M.undertakingMet(bb, u), '"' + ask + '" counts as delivered before it has been');
  const res = M.fulfilUndertaking(bb, u.id);
  ck(res !== 'Noted.', 'the Promises card cannot deliver "' + ask + '" (kind ' + u.kind +
     ') — fulfilUndertaking fell through to the default');
  ck(res !== 'Nothing to do.', '"' + ask + '" could not be actioned at all');
  if (/seat|job/.test(u.kind))
    ck(M.undertakingMet(bb, u), '"' + ask + '" still reads as undelivered after being delivered');
  seen.push(u.kind);
});
console.log('asks             : ' + ASKS.length + ' possible · all minuted and all deliverable');
console.log('  kinds          : ' + seen.join(', '));

/* ---------------- 4b. "Sound people out" — the second Shake hands -------
   Two buttons in this game are labelled "Shake hands" and they are not the
   same button. One is on the Deals screen; the other lives in the partner
   modal that "Sound people out" opens. The first was fixed and the second
   was left calling acceptpartner with no business type behind it, so it did
   nothing when pressed and said nothing about why. Same label, different
   path, one of them never tested. Both are now. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
M.getS().fin.cash = 40000000;
M.startBiz('tech', 'Testco', 6000000, null);
for (let i = 0; i < 6; i++) { M.advanceQuarter(); M.UI.modal = null; }
M.UI.modal = null;
M.ACT.seekpartner();
const pm = M.UI.modal;
ck(pm && pm.type === 'partner', 'seekpartner opened no partner modal');
ck(pm && M.BIZ.some(b => b.id === pm.typeId),
   'seekpartner opened a modal with typeId ' + JSON.stringify(pm && pm.typeId) +
   ' — no business type, so its Shake hands cannot price anything and will silently do nothing');
ck(pm && pm.offers && pm.offers.length === 2, 'seekpartner produced ' + (pm && pm.offers ? pm.offers.length : 0) + ' offers');
/* the offers must be findable from where the button will look for them */
ck(M.offerById(pm.offers[0].id) && M.offerById(pm.offers[0].id).id === pm.offers[0].id,
   'offerById() cannot find the offer the modal is showing');
ck(M.offerById('nope') === null, 'offerById() returned something for an id that does not exist');
console.log('sound people out  : modal typeId ' + pm.typeId + ' · ' + pm.offers.length + ' offers · offerById() resolves them');

/* Three buttons share this label and they are three different transactions:
   founding a company with someone, bringing someone into the company you
   have, and the same thing from the Deals screen. One of them was dead for
   as long as the feature existed and nothing noticed, because they all look
   alike. If a fourth appears, this gate clicks three of them and the fourth
   ships untested — so count them.

   Count `>Shake hands<`, not the phrase: it appears in these comments too,
   and counting prose reported five buttons when there are three. */
const shakes = (require('fs').readFileSync(require('path').join(__dirname, 'check.js'), 'utf8')
  .match(/>Shake hands</g) || []).length;
ck(shakes === 3, 'there are ' + shakes + ' "Shake hands" buttons in the file and this gate clicks three — ' +
   'a fourth would ship untested, which is how the second one stayed broken');
console.log('shake hands      : ' + shakes + ' buttons in the file · this gate clicks all of them');

/* ---------------- 5. declining consumes the offer ---------------------- */
/* M.getS() every time from here: section 4 calls newGame, so the S captured
   at the top is no longer the state the game is actually running on. */
const S5 = M.getS();
S5.offers = [M.genPartnerOffer(), M.genPartnerOffer()];
const keep = S5.offers[1];
M.ACT.declineoffer({ dataset: { i: (S5.offers || [])[0].id } });
ck((S5.offers || []).length === 1, 'declining left ' + (S5.offers || []).length + ' offers behind');
ck(S5.offers[0] && S5.offers[0].id === keep.id, 'declining removed the wrong offer');
console.log('declining        : 2 offers → 1, the right one');

/* ---------------- 6. the card's button names a real action ------------- */
M.getS().offers = [M.genPartnerOffer()];
M.UI.tab = 'money'; M.UI.sub = 'deals';
const card = String(M.viewDeals());
ck(card.indexOf('data-a="takepartner"') >= 0, 'the Deals card still offers no way to shake hands');
ck(card.indexOf('data-a="acceptpartner"') < 0,
   'the Deals card still calls acceptpartner — the handler for a different feature');
ck('takepartner' in M.ACT, 'takepartner is not in ACT');
console.log('card             : emits takepartner, not acceptpartner');

/* and the offers card only shows while there is a company to bring them into */
M.getS().biz = null;
ck(String(M.viewDeals()).indexOf('data-a="takepartner"') < 0,
   'the partnership card offers a handshake with no company to shake it on');


/* ---------------- 6b. a broke player must still have a route in --------- */
/* "Why can't I find the option to start a new business?" Because on a fresh
   run you hold ₦180k and the cheapest company costs ₦1.5m, so all ten Start
   buttons were disabled - and nothing said why, or what the gap was. Ten
   greyed-out cards with no explanation are indistinguishable from a feature
   that does not exist. Worse, the one route that IS open to a broke player,
   "With partner", was disabled alongside them: taking a partner is precisely
   how you afford what you cannot afford alone. */
M.newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
M.UI.tab = 'work'; M.UI.sub = 'business'; M.UI.focus = '';
const broke = String(M.routeView());
const startAll = (broke.match(/data-a="startbiz"/g) || []).length;
const startOff = (broke.match(/data-a="startbiz"[^>]*disabled/g) || []).length;
const partnerOff = (broke.match(/data-a="startbizpartner"[^>]*disabled/g) || []).length;
ck(startAll > 0, 'a player with no company is offered no companies at all');
ck(M.getS().fin.cash < Math.min.apply(null, M.BIZ.map(t => M.startBizCost(t.id))),
   'the fixture is not actually broke — this section tests nothing');
ck(/None of these is within reach yet/.test(broke),
   'a broke player gets ten greyed cards and no explanation of the shortfall');
ck(partnerOff === 0, '"With partner" is disabled for a broke player — that is the one route they have');
ck(!/NaN/.test(broke), 'a company is priced at NaN on the start screen');
console.log('broke player      : ' + startOff + '/' + startAll + ' Start disabled · "With partner" open (' +
            (startAll - partnerOff) + ' of ' + startAll + ') · shortfall stated · no NaN');
/* and the partner route actually founds something at that price */
M.ACT.startbizpartner({ dataset: { t: 'tech' } });
ck(M.UI.modal && M.UI.modal.type === 'partner', 'a broke player cannot even open the partner offers');
const po = M.UI.modal.offers[0];
const before = M.getS().fin.cash;
M.ACT.acceptpartner({ dataset: { i: '0' } });
ck(M.UI.modal && M.UI.modal.type === 'amount', 'the partner handshake did not ask what you are putting in');
M.UI.modal.cb(Math.max(0, Math.min(before, 150000)));
ck(!!M.getS().biz, 'a broke player took a partner and still has no company');
ck(M.getS().fin.cash >= 0, 'founding with a partner put the player into negative personal cash');
console.log('broke + partner   : founded ' + M.getS().biz.name + ' with ' + po.name +
            ' · put in ₦' + Math.round(before - M.getS().fin.cash).toLocaleString() + ' of ₦' +
            before.toLocaleString() + ' · owns ' + Math.round(M.yourPct(M.getS().biz)) + '%');

/* ---------------- 7. a real click, in a real browser ------------------- */
/* The unit checks above call M.ACT.takepartner({dataset:{i:'0'}}) directly,
   which is not how the player reaches it. The bug that shipped was invisible
   to that: the button existed, the handler existed, and the delegate between
   them was pointing at the wrong handler entirely. Only clicking finds that.
   So: load the built page, click Shake hands, confirm, and look. */
async function clickE2E() {
  const { chromium } = require('playwright');
  const http = require('http'), fsx = require('fs'), pp = require('path');
  const ROOT = pp.resolve(__dirname, '..', 'ledger');
  /* serve real MIME types, or the browser reports errors that are the test
     harness's fault rather than the app's - a manifest handed over as
     text/html is exactly the noise the player sees when opening the file
     directly, and it must not be mistaken for a game bug */
  const MIME = { '.webmanifest': 'application/manifest+json', '.json': 'application/json',
                 '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' };
  const srv = http.createServer((req, rq) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const f = pp.join(ROOT, rel);
    fsx.readFile(f, (e, d) => {
      if (e) { rq.writeHead(404); rq.end('no'); return; }
      rq.writeHead(200, { 'Content-Type': MIME[pp.extname(rel)] || 'text/html' }); rq.end(d);
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const b = await chromium.launch(process.env.LEDGER_CHROMIUM ? { executablePath: process.env.LEDGER_CHROMIUM } : undefined);
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto('http://127.0.0.1:' + port + '/index.html', { waitUntil: 'load' });

  const info = await page.evaluate(() => {
    newGame({ name: 'Ada', city: 'lagos', profile: 'founder', difficulty: 'realistic', seed: 4242 });
    S.fin.cash = 40000000;
    startBiz('tech', 'Testco', 6000000, null);
    for (let i = 0; i < 6; i++) advanceQuarter();
    if (UI._anim && UI._anim.finish) UI._anim.finish();
    UI.modal = null;
    const o = genPartnerOffer();
    o.ask = 'wants a board seat';
    S.offers = [o];
    UI.tab = 'money'; UI.sub = 'deals'; UI.focus = '';
    render();
    return { name: o.name, equity: o.equity, capital: Math.round(o.capital) };
  });

  const btns = page.locator('button[data-a="takepartner"]');
  if (await btns.count() === 0) {
    errs.push('no "Shake hands" button rendered on the Deals screen');
  } else {
    await btns.first().click();                       /* the click the player makes */
    const ok = page.locator('button[data-a="okconfirm"]');
    if (await ok.count() === 0) errs.push('clicking Shake hands opened no confirmation');
    else await ok.first().click();
  }

  const after = await page.evaluate(() => {
    const bb = S.biz;
    return {
      holders: (bb.shares || []).filter(h => !h.you).map(h => h.name + ' ' + (h.pct || 0).toFixed(1) + '%'),
      you: Math.round(yourPct(bb)),
      cash: Math.round(bb.cash),
      offers: (S.offers || []).length,
      undertakings: (bb.undertakings || []).map(u => u.text)
    };
  });

  /* the second Shake hands: the one inside the "Sound people out" modal.
     Same click, different code path, and the path that was silently dead. */
  /* the third Shake hands: founding a company WITH a partner, which is a
     different transaction wearing the same label. It asks what you are
     putting in, then starts the business. Needs a state with no company, so
     the page is reloaded rather than unwound. */
  await page.reload({ waitUntil: 'load' });
  const startName = await page.evaluate(() => {
    newGame({ name: 'Ada', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: 4242 });
    UI.modal = null;
    ACT.startbizpartner({ dataset: { t: 'tech' } });
    return UI.modal && UI.modal.mode;
  });
  ck(startName === 'start', 'startbizpartner opened a modal in mode "' + startName + '" — it should be "start"');
  const startBtn = page.locator('#modal button[data-a="acceptpartner"]');
  if (await startBtn.count() === 0) {
    errs.push('the start-with-a-partner modal shows no Shake hands button');
  } else {
    await startBtn.first().click();
    const box = page.locator('#amtBox');
    if (await box.count() === 0) {
      errs.push('Shake hands in the start modal did not ask what you are putting in');
    } else {
      await box.fill('3000000');
      await page.locator('button[data-a="okamount"]').first().click();
      const res = await page.evaluate(() => {
        const bb = S.biz;
        return bb ? { name: bb.name, holders: (bb.shares || []).filter(h => !h.you).length,
                      you: Math.round(yourPct(bb)) } : null;
      });
      if (!res) errs.push('the start-with-a-partner handshake founded no company');
      else if (res.holders === 0) errs.push('the start-with-a-partner handshake founded a company with no partner in it');
      else console.log('start handshake  : founded ' + res.name + ' · partner in the register · you ' + res.you + '%');
    }
  }

  const modalInfo = await page.evaluate(() => {
    UI.modal = null;
    ACT.seekpartner();
    const m = UI.modal;
    return { type: m && m.type, offers: m ? m.offers.map(o => o.name) : [], typeId: m && m.typeId };
  });
  const modalBtn = page.locator('#modal button[data-a="takepartner"]');
  if (await modalBtn.count() === 0) {
    errs.push('the partner modal shows no Shake hands button');
  } else {
    await modalBtn.first().click();
    const ok2 = page.locator('button[data-a="okconfirm"]');
    if (await ok2.count() === 0) {
      errs.push('clicking Shake hands in the partner modal did nothing at all — no confirmation appeared');
    } else {
      await ok2.first().click();
      const res = await page.evaluate(() => ({
        modal: UI.modal ? UI.modal.type : null,
        holders: (S.biz.shares || []).filter(h => !h.you).length,
        left: (S.offers || []).length
      }));
      if (res.holders === 0) errs.push('the modal handshake produced no holder');
      console.log('modal handshake  : ' + modalInfo.offers.join(' / ') +
                  ' → ' + res.holders + ' outside holder(s) · ' + res.left + ' offer(s) left · modal ' +
                  (res.modal === null ? 'closed' : 'still open (' + res.modal + ')'));
    }
  }
  if (!after.holders.some(h => h.indexOf(info.name) === 0))
    errs.push('a real click did not bring ' + info.name + ' into the company');
  if (after.offers !== 0) errs.push('a real click left the offer on the table');
  console.log('real click        : Shake hands → confirm → ' + after.holders.join(', '));
  console.log('                    you ' + after.you + '% · company cash ' + M.fmt(after.cash) +
              ' · ' + after.offers + ' offer(s) left');
  console.log('  minuted         : ' + JSON.stringify(after.undertakings));
  console.log('  console errors  : ' + (errs.length ? errs.join(' | ') : 'none'));

  await b.close(); srv.close();
  return errs;
}

const finish = extra => {
  const all = bad.concat(extra || []);
  if (all.length) { console.log('\nPARTNER ISSUES:'); all.forEach(x => console.log(' - ' + x)); process.exit(1); }
  console.log('\nPARTNER CLEAN');
};
clickE2E().then(finish).catch(e => { console.log('\nE2E FAILED: ' + e.message); process.exit(1); });
