# Playtest protocol — one yardstick, two games

*Companion to `FINDINGS.md`. That file says what Lagos Life is and what might be
worth taking from it. This file says how to find out whether any of it is true
before we copy a single mechanic.*

The instrument has to point at both games or it is not an instrument, it is an
opinion with numbers stapled on. So: a fixed session design, one event log format,
units named in the log itself, and one column already filled — ours, measured
mechanically by `tools/playtest.mjs`.

---

## 1. The rule this protocol exists to obey

**Copy nothing that the log does not show working.** For each mechanic from
`FINDINGS.md` §8 the sitting has to produce one of three verdicts:

| verdict | when |
|---|---|
| **copy** | the log shows it causing a *return*, a *share*, or a *decision* we do not have — and it survives the cost sheet below |
| **decline** | the log shows nothing, or shows a cost we will not pay (offline, determinism, accounts) |
| **unmeasurable** | we could not see it in three sittings — which is itself a finding, usually about our instrument |

That is the whole point of playing first: not to imitate, to *convict*.

---

## 2. The yardstick — five groups, every field with a unit

### A. Cost of entry *(both games, measured from the outside)*
| field | unit | how |
|---|---|---|
| artifact bytes | bytes | our side: `tools/playtest.mjs` reads the shipped file. Theirs: devtools, transferred size, cold cache |
| seconds to interactive | s | stopwatch, first tap → a control responds |
| account required | yes/no | is there a wall before play |
| offline | yes/no | aeroplane mode, reload |
| price | — | what money buys; whether play is gated by it |

### B. The arc *(the unit most likely to be fudged — write it down anyway)*
| field | unit | how |
|---|---|---|
| a full arc | *their* unit | ours: quarters (measured: **168**, age 23 → 65). Theirs: note it in **real days** and convert to hours played |
| terminal | hard/soft/none | what ends a run, and who decides |
| is the world paused when you leave | yes/no | their real-time clock vs our quarter waiting for you. This is the axis where the two products differ most |
| consequential state reached at | minutes | first moment a choice still matters 10 minutes later |

### C. Decision economics *(per 30-minute sitting, and normalised per hour)*
| field | unit | how |
|---|---|---|
| decisions offered | count | every *commitment*: spends money, spends time, or cannot be undone |
| decisions taken | count | the ones you actually press |
| minutes per decision | min | sitting length ÷ decisions taken |
| irreversible share | % | of decisions taken, the ones with no way back |
| visible price share | % | of decisions offered, the ones whose cost is shown *before* you commit |
| worst available mistake | % of starting stock | the most expensive action on offer ÷ what you hold |
| surprise rate | % | decisions whose consequence you could not have predicted — judge it, then say why in the note |

### D. Pressure and appointments
| field | unit | how |
|---|---|---|
| named obligations | count | things with a name and a date (rent Saturday, a governor election) |
| period of each | days | per obligation |
| cost of not showing up | graded | nothing / delayed / permanent loss / dead run |
| forced interruptions | per hour | events that happen whether or not you act (ours: **0.99 per quarter**, measured) |
| can you bank progress | yes/no | does the world move while you are away |

### E. Social
| field | unit | how |
|---|---|---|
| other players visible | count/form | in the room with you, or a leaderboard |
| what they change about your run | none/visit/trade/compete | be precise — "multiplayer" is not a mechanic |
| what your run does alone | — | offline behaviour, if any |

**Not applicable is a valid value.** A real-time shared city has no honest
analogue for "pause"; write `n/a` and the reason. Do not manufacture a number.

---

## 3. The sitting — three sessions, fixed shape

Do it in this order; the order is the measurement.

**Sitting 1 — cold, 30 minutes.** Join, or open the file. Log every event with a
timestamp. Stop at 30:00 whether or not you want to.
Record: seconds to interactive; **minutes to your first commitment**; the moment
you understood the loop (mm:ss — trust the gut, not the manual); what you were
doing at 30:00 and whether stopping annoyed you.

**Sitting 2 — return, ≥24h later, 15 minutes.** The return hook is the thing a
real-time game claims and a file-based game must earn differently.
Record: seconds to re-orient (until you knew what to do); what was waiting for
you; what you **lost** while away; whether the reason you came back was a name, a
clock, or a number.

**Sitting 3 — mature, ≥5h total, 30 minutes.** Breadth becomes depth or it does
not.
Record: the biggest decision available and its price; whether you did anything
new or optimised something old; the ratio of *new* decisions to *repeated* ones;
the one screen you keep opening.

**Event log format** — one line each, in the notes app or the CSV's `note` column:

```
mm:ss | kind | what | cost | reversible?
03:41 | commit | took the Yaba room | ₦6,000/wk | no
07:02 | interrupt | landlord knocked | ₦12,000 | no
12:15 | nav | opened the map | — | —
18:30 | idle | waited for the shift to end | 4 min | —
```

kinds: `commit` · `nav` · `idle` · `interrupt` · `loss` · `share` · `pay`.

**Instruments:** a stopwatch, a notes app, and screen recording if the phone
allows it. One person, three sittings, no coaching from the guide sites until
sitting 3 is done — the wiki tells you what to do, and we are measuring what the
game tells you.

---

## 4. Our seat, already filled

`playtest/seat-ledger.json` — generated by `node tools/playtest.mjs`, never typed
by hand. Seed 4242, profile *The Fresh Graduate*, Lagos, realistic difficulty:
the same fixture every other measurement in this project uses.

| field | LEDGER |
|---|---|
| a full arc | **168 quarters** (age 23 → 65), retire |
| forced interruptions | **0.99 per quarter** — an event every quarter whether you act or not |
| things asking for a decision | **10** at a sampled moment (agenda + open deals + candidates + house + offers) |
| controls that change state | **166** in the action registry |
| scarce | money (cash, USD, debt, credit, overdraft) · **hours per quarter** · 5 personal states (health, stress, happy, family, rep) |
| undo classes | drop **free** · drop **at a cost** · **sunk** |
| artifact | **1,104,445 bytes · 0 external requests · no account · free** |

Two findings worth stating before their column is filled, because they set the
baseline a competitor has to beat:

1. **A run that makes no choices at all still reaches a terminal** — passive play
   retires at 65 with ₦2.03bn. The sim has a floor, and decisions are what move
   you above it. That makes every commitment a *deliberate* one rather than a
   survival tax, and it is why our loop can be quarterly while theirs is weekly.
2. **Time is the only resource that never carries** (hours reset each quarter,
   unspent hours are gone). Money can be re-earned; a quarter cannot.

---

## 5. Cost sheet — what a copy would actually cost us

Fill this before deciding. The items are `FINDINGS.md` §8: flow defects (8a),
what playing them showed (8b), surface changes (8c) and growth moves (8d). Three of them are cheap; the rest are
not.

| what | would cost us | still worth it? |
|---|---|---|
| **F1** shortfall visible on the row | one chip and one gate assertion | **yes** — the first thing a new player hits |
| **F1b** agenda ranked by what is actionable | a sort and a journey assertion | **yes** |
| **F2** the quarter digest lands in place | a layout change plus a textaudit re-run | **yes** — 300 interruptions a life is the whole question |
| **F3** in-app back | one control, already on the queue | **yes** |
| **F4** deal me a life | one button and a seed; five profiles exist | **yes** — cheapest tension in the game |
| **5b** the surface set | hours strip, life map, icon sprite, face, era tint, thumb zone | mostly yes; the life map pays twice (index and share art) |
| **5c** share card | a share affordance and a canvas render; no server | **yes** |
| **5c** Lagos nouns | a few hundred strings; both audits re-run | **yes** — copy, not mechanics |
| **5c** public site | a docs build from tables that already verify | maybe — a separate project |
| live shared city | **the whole product**: offline, determinism, tests, the single file | **no** |
| IAP currency | the only scarcity we have that means anything | **no** |

## 6. How to run the comparison

1. Play the three sittings; fill `playtest/seat-lagos-life.csv`
   (columns: `field,value,note`; `n/a` is allowed and encouraged — the `note`
   column is where the sitting lives).
2. `node tools/playtest.mjs --compare playtest/seat-lagos-life.csv`
   → the two columns side by side, field names matched, no arithmetic by hand.
3. Bring the log to the decision: each `FINDINGS.md` §5 and §8b mechanic gets **copy**,
   **decline** or **unmeasurable**, and the reason is a line from the log.

**Ethics, non-negotiable:** 18+ and a real sign-up are theirs to set — respect
them, use your own account, never share credentials, never enter them anywhere
but `lagoslife.app`. Do not spend real money on top-ups; if the game asks, log the
ask and stop. No scraping their backend, no automation of their client: this is a
playtest, and the numbers we want are the ones a human produces. Record their
public counters (online now, visits) once per sitting and label them *their claim*.
