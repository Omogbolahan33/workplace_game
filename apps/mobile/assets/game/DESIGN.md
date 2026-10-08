# LEDGER — A Life in Decisions

Design & engineering notes. The game itself is `index.html` (single file, no build step, no network).

---

## 1. What it is

A quarter-by-quarter simulation of a working life. You allocate money, run (or don't run) a business,
hire and fire, invest, borrow, get married, disappoint your family, and live with the consequences —
including the ones that don't arrive for three years.

The design goal is **not** a score-chase. It is that the player's own decisions visibly compound.
A bad hire in Q3 still costs money in Q14. Skipping a ₦180k medical check-up in 2026 costs ₦1.4m in 2028.

**One turn = one quarter.** 168 quarters (42 years) is a full run; retirement at 65 ends it.

---

## 2. Architecture

```
index.html  (~2,900 lines, single file)
├─ §1  World data      cities, profiles, assets, goods, business types, names, staff traits
├─ §2  Utilities       seeded RNG (mulberry32), money formatting, clamps
├─ §3  State           blankState(), newGame(), difficulty matrix
├─ §4  Macro economy   inflation, FX, policy rate, oil, demand, policy shocks
├─ §5  Personal        needs, budget satisfaction, health/stress/happiness, debt service
├─ §6  Business        capacity × demand model, staff, partners, valuation
├─ §7  Investments     13 asset classes with per-class return models
├─ §8  Consequences    applyEff() — the single mutation point for every decision
├─ §9–10 Event decks   22 life events, 16 business events
├─ §11 Resolution      resolveOption() — odds, effects, coaching principles
├─ §12 Time/endings    advanceQuarter(), insolvency, final report
├─ §13 Persistence     localStorage, export/import string
├─ §14–17 Presentation views, modals, vignettes, actions
└─ §18 Boot
```

### The mutation rule
Every consequence in the game flows through **one function**, `applyEff(eff)`.
`eff` is always plain data (`{cash:-450000, family:12, delay:{...}}`), never a function.
This is what makes the whole game state JSON-serialisable, which is what makes save/load,
export/import and seeded reproducibility possible.

Effects support: `cash, usd, health, stress, happy, family, rep, credit, skill{}, flag{}, informal,
debt{}, asset{}, good, bizcash, bizrep, bizcap, bizqual, bizloc, kid, marry, job, log, delay{}`.

### Delayed consequences
`eff.delay` pushes `{turn, title, text, eff}` onto `S.pending`. `flushPending()` fires them at the
start of the due quarter. Anything that depends on live state at resolution time is written as
`effFn / okEffFn / failEffFn / delayFn` on the *option* (options live in the static deck, so
functions there are fine) and is evaluated when chosen — never at deck-definition time.

### Determinism
`R` is a mulberry32 PRNG whose state (`R.s`) is saved alongside `S`. Same seed + same choices =
same run. This is also what made headless balance-testing meaningful.

---

## 3. Core systems

### Needs vs. budget
`needs()` computes five monthly figures (housing, food, transport, lifestyle, family) from household
size, dependants and city cost index, **multiplied by cumulative inflation**. Your budget sliders are
nominal and do not move unless you move them. That gap is the central quiet pressure of the game:
prices rise, a budget you set in 2029 is worthless in 2041, and the game tells you so in the Money tab
with a one-click "Adjust for inflation" button. Underfunding food shows up in health; underfunding
family shows up in family standing; underfunding lifestyle shows up in stress.

### Business: capacity × demand
```
capacity = (staff productivity + owner attention) × (230 / labourIntensity) × locations^0.85 × capexFactor
demand   = marketSize × reputation × price^−elasticity × brand × marketing × quality × ramp
units    = min(capacity, demand, workingCapitalUnits, ceilingUnits)
revenue  = units × basePrice × priceIndex × cumulativeInflation × cityPayMult
profit   = revenue − cogs − (salaries + rent + marketing + overhead + power + quality) − tax
```
Three things make this feel like a real business rather than a number go up:

1. **Working capital.** You can only sell what you can afford to stock. `wcUnits` binds hard and
   per-sector (`wc` ranges from 0.10 for consulting to 0.60 for property development). Founders who
   pay themselves everything quietly strangle their own company.
2. **Ramp.** Demand starts at 22% and takes ~6 quarters to reach 100%. Nobody has customers on day one.
3. **Margin compression.** Margins erode with age (up to 12 points) and can only be defended by
   investing in quality. Businesses that coast die slowly.

Reputation is deliberately the dominant term: `repF = 0.15 + (rep/100)^1.6 × 1.35`, so at rep 45 you
reach ~53% of your addressable market and at rep 90 you reach ~129%.

### Labour market
Salaries converge on `marketMonthly()` — a function of skills, experience, education and reputation.
Job-hopping closes the gap to your market rate; it does not compound past it. There is a 6-quarter
cooldown on switching and a 4-quarter cooldown on asking for a raise. (An earlier build let you
job-hop every quarter for +22–65% each time; the simulation produced a player earning ₦362bn a month
by year 30. The market-rate anchor is the fix.)

### Macro
Inflation mean-reverts to a per-city structural rate; the policy rate tracks inflation with a real
premium; the exchange rate follows a damped PPP drift plus discrete devaluation events (4%/quarter,
+10–34%). Asset returns are drawn per class: fixed income tracks the policy rate, equities get
mean + volatility + a sentiment tilt, and anything marked `fx:true` earns in hard currency and is then
multiplied by the currency move — which is why dollar assets look spectacular in a devaluation year.
Volatile draws use a z-score clamped to ±2.1σ: fat tails are real, but a 6σ quarter turns a
simulation into a lottery.

---

## 4. Balance targets (verified by headless simulation)

| Scenario | 10 years | 30 years (real, start-of-game money) |
|---|---|---|
| Does nothing, never touches a slider | ₦23m nominal, health 34, stress 32 | — |
| Engaged, invests surplus, runs a business | — | ₦110m – ₦480m median; freedom 46–73 |

Cumulative inflation runs ~15%/yr (≈280× over 40 years); the currency moves ≈150× over the same
period. Cash in a current account is a guaranteed loss; that is not a metaphor, it is the arithmetic
on the screen.

Verification harness (not shipped, run during development):
5 profiles × 3 difficulties × 170 quarters, 6 cities, 10 business types, every event option
exercised at least once, and all seven views rendered — asserting zero runtime errors and zero
`undefined/NaN/[object Object]` in output.

---

## 5. Difficulty (switchable at any time, from Settings or the Ledger tab)

| | Shock | Inflation | Odds shown | Save scumming | Coaching notes |
|---|---|---|---|---|---|
| Apprentice | 0.55× | 0.68× | yes | yes | yes |
| Realistic | 1.00× | 1.00× | no | yes | no |
| Hardcore | 1.40× | 1.22× | no | no (single autosave) | no |

Apprentice mode surfaces the real-world principle behind every decision after you make it —
there is a `PRINCIPLES` entry keyed to each event id.

---

## 6. Porting to React + TypeScript + Supabase

The engine is deliberately framework-free. A mechanical port:

| Now | Then |
|---|---|
| `S` (module-level mutable) | Zustand store, or `useReducer` + context |
| `render()` → innerHTML strings | React components; one per `view*` function |
| `ACT` object of handlers | action creators / server actions |
| `S.journal`, `S.decisions`, `S.pending` | Postgres tables (`journals`, `decisions`, `pending_effects`) |
| `S.mkt` | computed server-side per quarter, or seeded client-side for determinism |
| `localStorage` save slots | Supabase row keyed by `user_id` + `slot`; RLS per user |
| `R.s` seed | stored on the run row → reproducible runs, server-verifiable |

Keep two rules during the port and it will stay correct:
1. **All game state stays serialisable.** No functions, no class instances, no DOM refs in `S`.
2. **`applyEff` remains the only mutation point.** Every event, action and delayed consequence goes
   through it. That is what makes undo, replay, telemetry and "what if I had chosen differently"
   all cheap to add later.

Suggested first additions once ported: leaderboards by Freedom Index, a "replay my worst decision"
deep-link, and async multiplayer (same seed, different players → comparable runs).

---

## 7. Known gaps / next work

- **Partnerships are shallow.** Partners add capital, a skill and a trust score, but the trust
  dynamics don't yet generate their own event stream (betrayal, strategy disagreements, buyout pressure).
- **Children are a cost, not a story.** Kids affect needs and stats but never appear as characters.
- **No sell-side for businesses.** You can wind one up but not sell it to a trade buyer or take it
  public, which is where the real money is in the model.
- **Cities are re-based, not re-imagined.** Switching to London or New York rescales pay, rent and
  inflation, but events are still written with a Lagos voice.
- **No mobile-specific layout pass** below 380px.
