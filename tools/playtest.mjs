/* The playtest seat: measures LEDGER on a fixed yardstick, so a sitting in
   another game can be compared with numbers instead of impressions.

   Why this exists: a competitor (FINDINGS.md) is a real-time, multiplayer life sim
   in the same city, and the honest question is not "is it better" but "what does
   its loop actually cost a player, in the same units ours does". That question
   needs a yardstick that does not care which game it is pointed at. This file is
   our half of it.

   It measures **structure**, never feel: turns in a life, what interrupts you,
   what is scarce, what cannot be undone, how many things ask for a decision, what
   the artifact costs to load. Behavioural fields (minutes per decision, time to
   first commitment, session length) need a human with a stopwatch and live in
   `playtest/seat-lagos-life.csv` beside the ledger seat this tool writes.

   Everything here is read out of the game as it runs — no field is typed by hand.

   Usage:
     node tools/playtest.mjs                 # measure, write the seat, print it
     node tools/playtest.mjs --compare playtest/seat-lagos-life.csv
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(import.meta.dirname, '..');
require(path.join(ROOT, '.harness', 'dom.js'));
const M = require(path.join(ROOT, '.harness', 'mod.js'));

const SEED = 4242;
const FIXTURE = { name: 'Seat', city: 'lagos', profile: 'grad', difficulty: 'realistic', seed: SEED };
const SAMPLES = [0, 8, 16, 32, 64, 96, 128, 160];

/* ---- 1. a life with no choices at all: what the simulation does to you ------ */
M.newGame(FIXTURE);
const S = M.getS();
const interrupts = {};
let turns = 0;
for (let i = 0; i < 260; i++) {
  M.UI.modal = null;
  M.advanceQuarter();
  turns++;
  if (M.UI.modal) interrupts[M.UI.modal.type || '?'] = (interrupts[M.UI.modal.type || '?'] || 0) + 1;
  if (S.gameOver) break;
}
const gameOver = S.gameOver || {};

/* ---- 2. what asks for a decision, sampled at fixed quarters --------------- */
M.newGame(FIXTURE);
const openNow = [];
const count = (v) => Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0);
for (let turn = 0; turn <= 160; turn++) {
  if (SAMPLES.indexOf(turn) !== -1) {
    let agenda = [];
    try { agenda = M.nextActions() || []; } catch (e) { agenda = []; }
    openNow.push({
      quarter: turn,
      agenda: agenda.length,
      deals: count(S.deals), candidates: count(S.candidates),
      houseCands: count(S.houseCands), offers: count(S.offers),
    });
  }
  M.UI.modal = null;
  M.advanceQuarter();
  if (S.gameOver) break;
}
const asked = openNow.map(o => o.agenda + o.deals + o.candidates + o.houseCands + o.offers);

/* ---- 3. what is scarce, and what it costs to undo ------------------------- */
const personal = ['health', 'stress', 'happy', 'family', 'rep'].filter(k => S.p && k in S.p);
const money = ['cash', 'usdCash', 'debt', 'credit', 'overdrawn'].filter(k => S.fin && k in S.fin);
const undo = {};
for (const [name, what] of [['commitDrop', 'free'], ['commitDropCost', 'at a cost'], ['commitBreak', 'sunk'], ['commitSunk', 'sunk']]) {
  if (typeof M[name] === 'function') undo[name] = what;
}
const recurring = Math.abs((S.quarter && S.quarter.expense) || 0);

/* ---- 4. the artifact ------------------------------------------------------ */
const htmlBuf = fs.readFileSync(path.join(ROOT, 'ledger', 'index.html'));
const html = htmlBuf.toString('utf8');
const external = (html.match(/(?:src|href)\s*=\s*["']https?:\/\//gi) || []).length;
const act = Object.keys(M.ACT);
const COMMIT_LIKE = /^(commit|start|do|buy|sell|nego|hire|fire|grant|sign|apply|borrow|repay|drop|take|raise)/;
const NAV_LIKE = /^(tab|sub|goto|close|help|settings|advance|skip|anim|view|toggle|pick|sort|back)/;

const seat = {
  game: 'LEDGER — A Life in Decisions',
  seat_taken: new Date().toISOString().slice(0, 10),
  measured_by: 'tools/playtest.mjs · seed 4242 · profile grad · city lagos · difficulty realistic',
  structure: {
    a_full_arc: {
      unit: 'quarters',
      value: turns,
      note: `a run that makes no choices at all still reaches the terminal: ${gameOver.reason || 'end'} at ${gameOver.at || turns} quarters, age ${gameOver.age || S.p.age}`,
    },
    forced_interruptions_per_quarter: {
      unit: 'events/quarter',
      value: Number((Object.values(interrupts).reduce((a, b) => a + b, 0) / Math.max(1, turns)).toFixed(2)),
      note: 'things that happen to you whether or not you act: ' + JSON.stringify(interrupts),
    },
    things_asking_for_a_decision: {
      unit: 'per sampled quarter',
      value: asked.length ? Number((asked.reduce((a, b) => a + b, 0) / asked.length).toFixed(1)) : 0,
      note: 'the game’s own agenda + open deals + candidates + house candidates + offers, sampled at quarters ' + SAMPLES.join(', '),
      samples: openNow,
    },
    controls_that_change_state: {
      unit: 'controls',
      value: act.length,
      note: `the action registry: ${act.filter(a => COMMIT_LIKE.test(a)).length} commitment-shaped by name, ${act.filter(a => NAV_LIKE.test(a)).length} navigation-shaped, rest are modal fields and toggles`,
    },
  },
  scarcity: {
    money: { resources: money, unit: 'naira' },
    time: { resource: 'hours per quarter', note: 'hoursBudget() − hoursSpent(); unspent time is the one thing that never carries' },
    personal: { resources: personal, unit: '0–100', note: 'none of them can be bought back with money alone' },
    recurring_charge: { unit: 'naira/quarter', value: Math.round(recurring), note: 'the charge the quarter imposes on the sampled state' },
  },
  irreversibility: {
    classes: undo,
    note: 'three ways a commitment can end, read from the handlers the game ships: undo free, undo at a cost, sunk',
  },
  artifact: {
    bytes: htmlBuf.length,   /* bytes, not characters: the file is not ASCII */
    external_requests: external,
    offline: external === 0,
    account_required: false,
    price: 'none',
  },
  behavioural: {
    note: 'needs a human with a stopwatch — fill in seat-lagos-life.csv and copy the fields here, or run --compare',
  },
};

const out = path.join(ROOT, 'playtest', 'seat-ledger.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(seat, null, 1));

const line = (k, v) => console.log('  ' + String(k).padEnd(38) + String(v));
console.log('LEDGER seat — measured, not typed (seed ' + SEED + ')');
line('a full arc', seat.structure.a_full_arc.value + ' quarters → ' + (gameOver.reason || 'end') + ', age ' + (gameOver.age || S.p.age));
line('forced interruptions', seat.structure.forced_interruptions_per_quarter.value + ' per quarter');
line('things asking to decide', seat.structure.things_asking_for_a_decision.value + ' at a sampled moment');
line('controls that change state', seat.structure.controls_that_change_state.value);
line('scarce', money.length + ' money fields · hours/quarter · ' + personal.length + ' personal states');
line('undo classes', Object.entries(undo).map(([k, v]) => k + '=' + v).join(' '));
line('artifact', seat.artifact.bytes + ' bytes · ' + external + ' external requests · no account · free');
console.log('  written: playtest/seat-ledger.json');

/* ---- 5. and the other column, when someone has played it ------------------ */
const cmpAt = process.argv.indexOf('--compare');
if (cmpAt !== -1 && process.argv[cmpAt + 1]) {
  const rows = fs.readFileSync(process.argv[cmpAt + 1], 'utf8').trim().split('\n')
    .map(l => l.split(',').map(s => s.trim()))
    .filter(r => r.length >= 3 && !/^\s*#/.test(r[0]) && r[0] !== 'field');
  /* keys are the CSV's own field names — the sheet is the schema, both ways */
  const mine = {
    'a full arc': seat.structure.a_full_arc.value + ' quarters',
    'terminal': 'hard (age 65 / season close)',
    'is the world paused when you leave': 'yes — a quarter waits for you',
    'forced interruptions': seat.structure.forced_interruptions_per_quarter.value,
    'things asking to decide': seat.structure.things_asking_for_a_decision.value,
    'controls that change state': seat.structure.controls_that_change_state.value,
    'scarce resources': money.length + ' money + hours + ' + personal.length + ' states',
    'artifact bytes': seat.artifact.bytes,
    'external requests': seat.artifact.external_requests,
    'account required': 'no',
    'price': 'none — and none planned',
    'what your run does alone': 'plays and saves offline, no server',
  };
  const w = Math.max(26, ...Object.values(mine).map(v => String(v).length + 2));
  console.log('\n' + 'field'.padEnd(40) + 'LEDGER'.padEnd(w) + 'Lagos Life');
  console.log('-'.repeat(40 + w + 22));
  for (const r of rows) {
    console.log(String(r[0]).padEnd(40) + String(mine[r[0]] === undefined ? '—' : mine[r[0]]).padEnd(w) + String(r[1] || '').padEnd(10) + ' ' + (r[2] || ''));
  }
}
