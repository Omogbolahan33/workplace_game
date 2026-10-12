# LEDGER — Complete Feature Inventory

Source: `ledger/index.html` — 1,016,355 chars, 15,862 lines, 543 functions, 58 data tables.
Every feature below is extracted from the source. Nothing is to be removed in the
UI rebuild unless it is ticked off here first.

**Status column:** `[ ]` not yet rebuilt · `[x]` carried into the new UI and verified.

---

## 0. Shell & navigation

| # | Feature | Where | Status |
|---|---|---|---|
| 0.1 | Setup screen (name, city, starting profile, difficulty, ambition) | `renderStart()` | [x] |
| 0.2 | Begin / Continue saved run / How to play | start modal | [x] |
| 0.3 | ~~10 tabs~~ 5 tabs with second-level nav | `TABS` `SUBS` | [x] |
| 0.4 | Tab switching preserves scroll + focus | `render()` | [x] |
| 0.5 | Top bar: city, quarter, age, net worth + delta, cash, freedom | `renderTop()` | [x] |
| 0.6 | Help button, Settings button, Advance button | top bar | [x] |
| 0.7 | Help modal ("How this works") | `helpModal()` | [x] |
| 0.8 | ~5s animated quarter transition, counting values, skippable | `advanceModal()` | [x] |
| 0.9 | Animation on/off toggle | `animtoggle` | [x] |
| 0.10 | Toast notifications | `toast()` | [x] |
| 0.11 | PWA install prompt | `installapp` / `doInstall()` | [x] |
| 0.12 | Mobile-first 390px → laptop responsive layout | CSS | [x] |
| 0.13 | Progressive disclosure (collapsing cards) | `applyDisclosure()` | [x] |
| 0.14 | Vignette — a sentence of everyday life | `makeVignette()` | [x] |

### The 10 tabs
`Overview · People · Deals · Work · Governance · Group · Market · Property · Legacy · Ledger`

---

## 1. Tab: Overview (`viewDash`)

| # | Feature | Status |
|---|---|---|
| 1.1 | **Position** card — net worth, cash, freedom index | [x] |
| 1.2 | **This quarter** card — income, expense, business P&L, investment | [x] |
| 1.3 | **You** card — health, stress, happiness, family, reputation, age | [x] |
| 1.4 | **Skills** card — finance, ops, hustle, network, tech | [x] |
| 1.5 | **The economy** card — inflation, rates, FX, era, policy | [x] |
| 1.6 | Agenda (things waiting on you) surfaces here via `viewAgenda()` | [x] |
| 1.7 | Vignette line | [x] |

---

## 2. Tab: People (`viewPeople`)

| # | Feature | Status |
|---|---|---|
| 2.1 | **The cast** — named people who remember what you did | [x] |
| 2.2 | Cast member detail: relationship, temperament, history | [x] |
| 2.3 | **Household & family** — partner, children, parents | [x] |
| 2.4 | **Your rival** — named competitor with their own trajectory | [x] |
| 2.5 | Favours: ask / give / cut off | `favour` `give` `cutoff` | [x] |

---

## 3. Tab: Deals (`viewDeals`)

| # | Feature | Status |
|---|---|---|
| 3.1 | **On the table** — deal flow, 8 deal types | [x] |
| 3.2 | Deal detail: terms, risk, capital required | [x] |
| 3.3 | Take the deal / pass | `takedeal` `passdeal` | [x] |
| 3.4 | **Committed capital** — what you're already in | [x] |
| 3.5 | **How to read these** — teaching copy | [x] |
| 3.6 | **Partnership offers** — accept, seek, buy out | `acceptpartner` `seekpartner` `buyout` | [x] |
| 3.7 | **Last twelve months** — deal history | [x] |
| 3.8 | Negotiation on deals (tactics, rounds, walk-away) | `negoaccept` `hirenego` `supplnego` | [x] |
| 3.9 | 7 negotiation tactics, 10 term types | `NEG_TACTICS` `NEG_TERM_POOL` | [x] |

---

## 4. Tab: Work (`viewWork`)

The largest tab. Composed of nine sub-views.

| # | Feature | Sub-view | Status |
|---|---|---|---|
| 4.1 | **Waiting on you** — agenda of pending decisions | `viewAgenda` | [x] |
| 4.2 | **Levers** — pricing, staffing, marketing, quality | `viewEngine` | [x] |
| 4.3 | **Position** — business P&L snapshot | `viewEngine` | [x] |
| 4.4 | **Conditions** — demand, competition, regulation | `viewEngine` | [x] |
| 4.5 | **Units** — outlets: open, close, upgrade, maintain | `viewOutlets` | [x] |
| 4.6 | **Contracts** — bid, renew, drop, negotiate | `viewContracts` | [x] |
| 4.7 | 5 contract kinds, 14 client types | `CONTRACT_KINDS` `CONTRACT_CLIENTS` | [x] |
| 4.8 | **Team** — deep staff management | `viewStaffDeep` | [x] |
| 4.9 | Hire / fire / raise / train / promote to GM | `hire` `fire` `raise` `trainstaff` `promotegm` | [x] |
| 4.10 | Salary negotiation with staff & candidates | `raisenego` `firenego` `hirenego` | [x] |
| 4.11 | 5 staff roles, 8 traits | `STAFF_ROLES` `TRAITS` | [x] |
| 4.12 | **Start a company** — 10 business types | `viewBiz` | [x] |
| 4.13 | Start solo or with a partner | `startbiz` `startbizpartner` | [x] |
| 4.14 | **Operations** — expand, formalise, inject, draw, insure, accountant, automate | `viewBiz` | [x] |
| 4.15 | **People** — business staff roster | `viewBiz` | [x] |
| 4.16 | **Candidates this quarter** — 3 generated | `viewBiz` | [x] |
| 4.17 | **Partner / largest outside holder** panel | `viewBiz` | [x] |
| 4.18 | Close/wind up the business | `closebiz` | [x] |
| 4.19 | Sell the business | `sellbiz` | [x] |
| 4.20 | Switch active company (multi-business) | `switchbiz` | [x] |
| 4.21 | Start another company | `anotherbiz` | [x] |
| 4.22 | **Employment** — your job, title, monthly, performance | `viewCareer` | [x] |
| 4.23 | **What you can do this quarter** — 7 career actions | `CAREER` | [x] |
| 4.24 | Look for a job | `findjob` | [x] |
| 4.25 | **Capability** — the five skills | `viewCareer` | [x] |
| 4.26 | **Recent career log** | `viewCareer` | [x] |
| 4.27 | **Your household** — 20 roles you can employ personally | `viewHousehold` | [x] |
| 4.28 | Household staff: skill, morale, loyalty, output, quarters served | `viewHousehold` | [x] |
| 4.29 | Perks / terms on household staff (5 perks) | `houseperk` | [x] |
| 4.30 | Payer: you or a company (benefit in kind) | `houseSetPayer` | [x] |
| 4.31 | Declare / undeclare the benefit (tax exposure) | `housedeclare` | [x] |
| 4.32 | Train, pay review, raise, let go | `housetrain` `housereview` `houseraise` `housefire` | [x] |
| 4.33 | Reassign a household staff member to a role | `houseReassign` | [x] |
| 4.34 | **People looking for work** — candidates with references | `viewHousehold` | [x] |
| 4.35 | Take at asking price, or negotiate | `houseask` `housenego` | [x] |
| 4.36 | **Your life** — the `viewLife()` shell | `viewLife` | [x] |
| 4.37 | What it costs to run this life | `viewLife` | [x] |
| 4.38 | Decisions on record | `viewLife` | [x] |
| 4.39 | Life log | `viewLife` | [x] |
| 4.40 | Attention model — owner time, freed by staff & GM | `ownerTime` `ownerTimeEff` | [x] |
| 4.41 | **Hours budget** — finite discretionary hours per quarter | new | [x] |
| 4.42 | **Sleep debt** — borrow hours, repay later, health/performance cost | new | [x] |
| 4.43 | Moonlighting toggle (evenings too) | `toggle` | [x] |

---

## 5. Tab: Governance (`viewGovernance`)

Six sub-tabs (`GOV_SUBS`): pack, register, board, votes, deed, bids.

| # | Feature | Sub-tab | Status |
|---|---|---|---|
| 5.1 | **The pack** — shareholders, percentages, option pool | pack | [x] |
| 5.2 | Cap table (progressively disclosed) | pack | [x] |
| 5.3 | Issue shares to a holder | `issueTo` | [x] |
| 5.4 | Grant options, top up the pool | `grantopt` `dogrant` `tablepool` | [x] |
| 5.5 | Vesting | pack | [x] |
| 5.6 | **Register** — who owns what, widened holders | register | [x] |
| 5.7 | Add a holder | `addHolder` | [x] |
| 5.8 | **Board** — directors, seats, chair | board | [x] |
| 5.9 | Appoint / remove a director, pick from candidates | `appointdir` `pickdir` `removedir` | [x] |
| 5.10 | 9 board archetypes | `BOARD_ARCHETYPES` | [x] |
| 5.11 | Board skill, chair, seat entitlement | board | [x] |
| 5.12 | **Votes** — 21 resolution kinds | votes / `RES_KINDS` | [x] |
| 5.13 | Table a resolution, withdraw, call a vote | `tableres` `withdrawres` `callvote` | [x] |
| 5.14 | Whip count, lobbying (3 modes) | `whip` `lobby` `LOBBY_MODES` | [x] |
| 5.15 | **Deed** — reserved matters, amendments | deed | [x] |
| 5.16 | Amend the deed, pick provisions | `amenddeed` `pickdeed` | [x] |
| 5.17 | Shotgun / drag-along / tag-along | `shotgun` | [x] |
| 5.18 | Undertakings & promises, fulfil them | `fulfil` | [x] |
| 5.19 | **Bids** — inbound offers, diligence, negotiate, accept/reject | bids | [x] |
| 5.20 | Buy out a minority holder | `buyoutminority` | [x] had no button anywhere — wired into the Business screen (2026-09-11) |
| 5.21 | CEO hiring — pick from candidates | `pickceo` | [x] |
| 5.22 | Liquidation waterfall (progressively disclosed) | pack | [x] |
| 5.23 | Covenant strip | `covenantsOf` | [x] |
| 5.24 | 6 covenant kinds, sector multiples | `COVENANT_KINDS` `SECTOR_MULT` | [x] |
| 5.25 | The plan — propose, submit, variance, grade | `proposeplan` `submitplan` | [x] |
| 5.26 | 11 governance-only events | `GOV_EVENTS` | [x] |

---

## 6. Tab: Group (`viewGroup`)

| # | Feature | Status |
|---|---|---|
| 6.1 | Holdco name & structure | [x] |
| 6.2 | **Cash, debt and reserves** across the group | [x] |
| 6.3 | **Getting cash out of a subsidiary** — dividends, capacity, notes | [x] |
| 6.4 | **Intercompany balances** — loans, repay, interest | [x] |
| 6.5 | **Management charges** — fee %, arm's-length rules | [x] |
| 6.6 | **Group obligations** — cross-default, group breaches | [x] |
| 6.7 | Group eliminations (progressively disclosed) | [x] |
| 6.8 | Subsidiary selector | [x] |
| 6.9 | Several companies and no hard cap — the limit is *attention*, not a number: a company without a GM takes a full share of yours. The document claimed "up to 4"; no such cap exists in the code | [x] |

---

## 7. Tab: Market (`viewInvest`)

| # | Feature | Status |
|---|---|---|
| 7.1 | **Portfolio** — 13 asset classes | [x] |
| 7.2 | Buy / sell assets | `buyasset` `sellasset` | [x] |
| 7.3 | **Markets** — 11 goods, price tracking | [x] |
| 7.4 | Buy goods | `buygood` | [x] |
| 7.5 | **Macro picture** — inflation, rates, FX, credit | [x] |
| 7.6 | **Recent market news** | [x] |
| 7.7 | **How returns work here** — teaching copy | [x] |
| 7.8 | FX / dollar cash holdings | [x] |
| 7.9 | Inflation adjustment of held value | `infladj` | [x] |

---

## 8. Tab: Property (`viewMoney`)

| # | Feature | Status |
|---|---|---|
| 8.1 | **Monthly budget** — sliders across spending categories | [x] |
| 8.2 | Budget presets | `preset` | [x] |
| 8.3 | Peg budget (stop it drifting with inflation) | `pegBudget` | [x] |
| 8.4 | **Buy something** — house, car, land, etc. | `buyasset` | [x] |
| 8.5 | **Cash & debt** — cash, USD, credit score, overdrawn | [x] |
| 8.6 | **Liabilities** — list, repay | `repay` | [x] |
| 8.7 | **Borrow** — new facilities | `borrow` | [x] |
| 8.8 | **What you own** — 13 asset classes held | [x] |
| 8.9 | Sell an asset | `sellasset` | [x] |
| 8.10 | **What this tab is really asking** — teaching copy | [x] |

---

## 9. Tab: Legacy (`viewLegacy`)

| # | Feature | Status |
|---|---|---|
| 9.1 | **Your record** — career history, experience rating | `viewCareerRecord` | [x] |
| 9.2 | Experience bar & band label | | [x] |
| 9.3 | "This run" challenge readout (6 levers) | | [x] |
| 9.4 | Best worth / best freedom / best rating | | [x] |
| 9.5 | Tiers played breakdown | | [x] |
| 9.6 | Last 8 runs as clickable rows | `runinfo` | [x] |
| 9.7 | **What you are actually trying to do** — ambition | [x] |
| 9.8 | Set an ambition (5 of them) | `setambition` `AMBITIONS` | [x] |
| 9.9 | **Where you stand** — standing with family, industry, community, state, street | [x] |
| 9.10 | **The scoreboard that matters at 65** | [x] |
| 9.11 | **Posterity** — make a will, set up a trust | `makewill` `trust` | [x] |
| 9.12 | Spend on family/community | `spend` | [x] |
| 9.13 | End-of-run report & rank | `endModal` `rank()` | [x] |

---

## 10. Tab: Ledger (`viewLedger`)

| # | Feature | Status |
|---|---|---|
| 10.1 | **Chronicle** — full journal, filterable | [x] |
| 10.2 | Journal categories (career, life, money, business, governance…) | [x] |
| 10.3 | **Save & load** — 4 slots + auto | `save` `load` | [x] |
| 10.4 | Export save string / copy to clipboard | `copyexp` | [x] |
| 10.5 | Import save string | `import` | [x] |
| 10.6 | **Install** — PWA | [x] |
| 10.7 | **Run settings** — difficulty, location, abandon run | [x] |
| 10.8 | Difficulty switcher (7 tiers, some gated) | `setdiff` | [x] |
| 10.9 | Location switcher (6 cities) | `setcity` | [x] |
| 10.10 | Abandon run (confirm) | `restart` | [x] |

---

## 11. Modals (23 types)

| # | Modal | Status |
|---|---|---|
| 11.1 | `start` — setup (name/city/profile/difficulty) | [x] |
| 11.2 | `help` — how this works | [x] |
| 11.3 | `settings` — run settings | [x] |
| 11.4 | `advance` — animated quarter transition | [x] |
| 11.5 | `event` — life/business event with options | [x] |
| 11.6 | `pending` — stacked decision | [x] |
| 11.7 | `result` — outcome of a decision | [x] |
| 11.8 | `confirm` — confirm with callback | [x] |
| 11.9 | `amount` — ask for a number | [x] |
| 11.10 | `message` — plain notice | [x] |
| 11.11 | `nego` — negotiation table | [x] |
| 11.12 | `partner` — partnership offer | [x] |
| 11.13 | `anotherbiz` — start another company | [x] |
| 11.14 | `govappoint` — appoint a director | [x] |
| 11.15 | `govceo` — hire a CEO | [x] |
| 11.16 | `govdeed` — amend the deed | [x] |
| 11.17 | `govfin` — financing choice | [x] |
| 11.18 | `govopt` — grant options | [x] |
| 11.19 | `govplan` — propose the plan | [x] |
| 11.20 | `govvote` — vote on a resolution | [x] |
| 11.21 | `year` — year in review | [x] |
| 11.22 | `profile` — profile, sync & export | [x] |
| 11.23 | `runinfo` — detail of one past run | [x] |
| 11.24 | `end` — end of run report | [x] |

---

## 12. Simulated systems (no UI of their own — must keep running)

| # | System | Detail | Status |
|---|---|---|---|
| 12.1 | Macro economy | inflation, rates, FX, credit conditions, policy events (12) | [x] |
| 12.2 | 6 cities with pay multipliers & economies | `CITIES` | [x] |
| 12.3 | 7 eras — the decade you're living through | `ERAS` | [x] |
| 12.4 | Business engine | demand, pricing, staff, quality, marketing, outlets | [x] |
| 12.5 | 10 business types | `BIZ` | [x] |
| 12.6 | Business stages | `BIZ_STAGES` | [x] |
| 12.7 | Outlets — open/close/upgrade/maintain | | [x] |
| 12.8 | Contracts — 5 kinds, 14 clients, bid/renew/drop | | [x] |
| 12.9 | Staff — 5 roles, 8 traits, morale, loyalty, performance drift | | [x] |
| 12.10 | Household — **10** roles (the document said 20; HOUSE_ROLES has 10), 5 perks, payer, declaration | | [x] |
| 12.11 | Market salary & wage inflation | `marketSalary` | [x] |
| 12.12 | Personal finance — budget, needs, tax, PAYE | | [x] |
| 12.13 | Credit score & borrowing | | [x] |
| 12.14 | Assets & goods — 13 assets, 11 goods | | [x] |
| 12.15 | Investment income | `stepAssets` | [x] |
| 12.16 | Event deck — life (23), business (14), wider (27), governance (11) | | [x] |
| 12.17 | Consequence engine — effects applied to state | | [x] |
| 12.18 | Arcs — multi-year stories | `ARCS` | [x] |
| 12.19 | The cast — people who age, sicken, die, remember | `stepCast` | [x] |
| 12.20 | Threads — pending decision chains | | [x] |
| 12.21 | Rivals — named competitor, 8 archetypes | `stepRival` | [x] |
| 12.22 | Black swans — 8 | `SWANS` | [x] |
| 12.23 | Governance simulation — board proposes, votes, covenants | `stepGovernance` | [x] |
| 12.24 | Group simulation — intercompany, cross-default | `stepGroup` | [x] |
| 12.25 | Endings — retirement at 65, bankruptcy, health collapse | `checkEnd` | [x] |
| 12.26 | Scoring — rank on real net worth & freedom | `rank()` | [x] |
| 12.27 | 5 starting profiles | `PROFILES` | [x] |
| 12.28 | Education multipliers | `EDU` | [x] |
| 12.29 | 8 principles (teaching text) | `PRINCIPLES` | [x] |
| 12.30 | Deterministic seeded RNG | `R` | [x] |

---

## 13. Profile, persistence & cloud

| # | Feature | Status |
|---|---|---|
| 13.1 | Profile stored in its own slot, survives `wipe()` | `PKEY` | [x] |
| 13.2 | Run appended to profile exactly once at end of run | `endGame` | [x] |
| 13.3 | History capped (80 runs) | `MAX_RUNS` | [x] |
| 13.4 | Experience rating from run history | `skillRating` | [x] |
| 13.5 | Difficulty scales with experience (challenge index, 6 levers) | `computeTune` | [x] |
| 13.6 | 7 difficulty tiers, 3 gated by rating | `DIFFS` | [x] |
| 13.7 | Local save slots (**3** + auto — the document said 4) | | [x] |
| 13.8 | Legacy save migration | | [x] |
| 13.9 | Cloud sync (Supabase), local-first, background | `cloudSyncBackground` | [x] |
| 13.10 | Sign in / sign up / sign out, token refresh | `cloudAuth` | [x] |
| 13.11 | Push / pull / merge by run id | `mergeProfiles` | [x] |
| 13.12 | One-time SQL shown in the panel | `CLOUD_SQL` | [x] |
| 13.13 | Profile handle | | [x] |
| 13.14 | Clear record (with confirm) | `profclear` | [x] |

---

## 14. Settings & difficulty

| # | Feature | Status |
|---|---|---|
| 14.1 | Difficulty switchable at any time | | [x] |
| 14.2 | Gated tiers show rating required | `diffListHTML` | [x] |
| 14.3 | Apprentice shows odds & coaching; others don't | | [x] |
| 14.4 | Save-scum rules per tier (rewinds allowed or not) | | [x] |
| 14.5 | Location switch re-bases prices, wages, rent, inflation | | [x] |
| 14.6 | Abandon run | | [x] |

---

## 15. Complete action index — all 175 entries in `ACT`

Every one of these must still be reachable after the rebuild, or explicitly
marked for removal here.

| # | action | status |
|---|---|---|
| 15.1 | `tab` | [x] |
| 15.2 | `discall` | [x] |
| 15.3 | `help` | [x] |
| 15.4 | `settings` | [x] |
| 15.5 | `close` | [x] |
| 15.6 | `advance` | [x] |
| 15.7 | `skipanim` | [x] |
| 15.8 | `animtoggle` | [x] |
| 15.9 | `keepplaying` | [x] |
| 15.10 | `pickcity` | [x] |
| 15.11 | `installapp` | [x] |
| 15.12 | `grpdiv` | [x] |
| 15.13 | `grploan` | [x] |
| 15.14 | `grprepay` | [x] |
| 15.15 | `grpmgmt` | [x] |
| 15.16 | `startgame` | [x] |
| 15.17 | `setdiff` | [x] |
| 15.18 | `pickdiff` | [x] |
| 15.19 | `profile` | [x] |
| 15.20 | `runinfo` | [x] |
| 15.21 | `cloudin` | [x] |
| 15.22 | `cloudup` | [x] |
| 15.23 | `cloudpush` | [x] |
| 15.24 | `cloudpull` | [x] |
| 15.25 | `cloudout` | [x] |
| 15.26 | ~~`profexport`~~ | [x] REMOVED — rejected outright: <i>"I won't be exporting anything. That's not how profile should work."</i> — the dead `ACT` entry was still in the file with no button anywhere; it is now deleted, not merely unreachable |
| 15.27 | ~~`profimport`~~ | [x] REMOVED — same instruction; portability is by sync, never by file — dead `ACT` entry deleted with it |
| 15.28 | `profclear` | [x] |
| 15.29 | `setcity` | [x] |
| 15.30 | `restart` | [x] |
| 15.31 | `preset` | [x] |
| 15.32 | `infladj` | [x] |
| 15.33 | `buygood` | [x] |
| 15.34 | `buyasset` | [x] |
| 15.35 | `sellasset` | [x] |
| 15.36 | `repay` | [x] |
| 15.37 | `borrow` | [x] |
| 15.38 | `startbiz` | [x] |
| 15.39 | `startbizpartner` | [x] |
| 15.40 | `_start` | [x] internal — shared body behind startbiz/startbizpartner, called directly, never a control |
| 15.41 | `housenego` | [x] |
| 15.42 | `houseask` | [x] |
| 15.43 | `housereview` | [x] |
| 15.44 | `houseraise` | [x] |
| 15.45 | `housetrain` | [x] |
| 15.46 | `houseperk` | [x] |
| 15.47 | `housedeclare` | [x] |
| 15.48 | `housefire` | [x] |
| 15.49 | `hireask` | [x] |
| 15.50 | `negoaccept` | [x] |
| 15.51 | `hirenego` | [x] |
| 15.52 | `supplnego` | [x] |
| 15.53 | `transfer` | [x] |
| 15.54 | `appointdir` | [x] |
| 15.55 | `pickdir` | [x] |
| 15.56 | `removedir` | [x] |
| 15.57 | `lobby` | [x] |
| 15.58 | `govsub` | [x] superseded — governance sub-tabs dispatch through the generic `sub` action; feature intact |
| 15.59 | `proposeplan` | [x] |
| 15.60 | `submitplan` | [x] |
| 15.61 | `tablepool` | [x] |
| 15.62 | `grantopt` | [x] |
| 15.63 | `dogrant` | [x] |
| 15.64 | `whip` | [x] |
| 15.65 | `callvote` | [x] |
| 15.66 | `withdrawres` | [x] |
| 15.67 | `tableres` | [x] |
| 15.68 | `pickceo` | [x] |
| 15.69 | `amenddeed` | [x] |
| 15.70 | `pickdeed` | [x] |
| 15.71 | `fulfil` | [x] |
| 15.72 | `shotgun` | [x] |
| 15.73 | `buyoutminority` | [x] |
| 15.74 | `biddd` | [x] |
| 15.75 | `bidnego` | [x] |
| 15.76 | `bidaccept` | [x] |
| 15.77 | `bidreject` | [x] |
| 15.78 | `tgtdd` | [x] |
| 15.79 | `tgtbid` | [x] |
| 15.80 | `pickfin` | [x] |
| 15.81 | `rentnego` | [x] |
| 15.82 | `sellbiz` | [x] |
| 15.83 | `switchbiz` | [x] |
| 15.84 | `anotherbiz` | [x] |
| 15.85 | `openoutlet` | [x] |
| 15.86 | `closeoutlet` | [x] |
| 15.87 | `upgradeoutlet` | [x] |
| 15.88 | `maintainoutlet` | [x] |
| 15.89 | `bid` | [x] |
| 15.90 | `renewc` | [x] |
| 15.91 | `dropc` | [x] |
| 15.92 | `trainstaff` | [x] |
| 15.93 | `promotegm` | [x] |
| 15.94 | `raisenego` | [x] |
| 15.95 | `firenego` | [x] |
| 15.96 | `negtactic` | [x] |
| 15.97 | `negclose` | [x] |
| 15.98 | `bizinsure` | [x] |
| 15.99 | `bizacct` | [x] |
| 15.100 | `bizauto` | [x] |
| 15.101 | `takedeal` | [x] |
| 15.102 | `passdeal` | [x] |
| 15.103 | `favour` | [x] |
| 15.104 | `give` | [x] |
| 15.105 | `cutoff` | [x] |
| 15.106 | `setambition` | [x] |
| 15.107 | `makewill` | [x] |
| 15.108 | `trust` | [x] |
| 15.109 | `spend` | [x] |
| 15.110 | `acceptpartner` | [x] |
| 15.111 | `seekpartner` | [x] |
| 15.112 | `buyout` | [x] |
| 15.113 | `hire` | [x] superseded — hiring now goes through hireask (lead-timed commitment); hire() is the pre-commitment path |
| 15.114 | `fire` | [x] |
| 15.115 | `raise` | [x] |
| 15.116 | `expand` | [x] |
| 15.117 | `formalize` | [x] |
| 15.118 | `inject` | [x] |
| 15.119 | `draw` | [x] |
| 15.120 | `closebiz` | [x] |
| 15.121 | `toggle` | [x] |
| 15.122 | `career` | [x] |
| 15.123 | `findjob` | [x] |
| 15.124 | `opt` | [x] |
| 15.125 | `okamount` | [x] |
| 15.126 | `okconfirm` | [x] |
| 15.127 | `save` | [x] |
| 15.128 | `load` | [x] |
| 15.129 | `copyexp` | [x] |
| 15.130 | `import` | [x] |
| 15.131 | `abandon` | [x] added by the rebuild — not in the original list |
| 15.132 | `doact` | [x] added by the rebuild — not in the original list |
| 15.133 | `goto` | [x] added by the rebuild — not in the original list |
| 15.134 | `hidewhy` | [x] added by the rebuild — not in the original list |
| 15.135 | `showwhy` | [x] added by the rebuild — not in the original list |
| 15.136 | `sub` | [x] added by the rebuild — not in the original list |
| 15.137 | `toggrp` | [x] added by the rebuild — not in the original list |
| 15.138 | `seasonopen` | [x] added by the Seasons work — opens the season setup from the start screen |
| 15.139 | `seasoncreate` | [x] added by the Seasons work — creates a season and mints its code |
| 15.140 | `seasonjoin` | [x] added by the Seasons work — joins by code, then pulls the conditions |
| 15.141 | `seasonclear` | [x] added by the Seasons work — drops the season and plays open-ended |
| 15.142 | `seasetyear` | [x] added by the Seasons work — sets the terminal year |
| 15.143 | `seasetq` | [x] added by the Seasons work — sets the terminal quarter |
| 15.144 | `seasonpickseed` | [x] added by the Seasons work — picks the world by codename |
| 15.145 | `seasonreroll` | [x] added by the Seasons work — offers four different worlds |
| 15.146 | `seasonrecode` | [x] added by the Seasons work — mints a different season code |
| 15.147 | `seasoncopy` | [x] added by the Seasons work — copies the season code to the clipboard |
| 15.148 | `seasoncopylink` | [x] added by the Seasons work — copies the invite link |
| 15.149 | `seasonscan` | [x] added by the Seasons work — scans a QR code, where the browser can |
| 15.150 | `seasonscancancel` | [x] added by the Seasons work — leaves the scanner |
| 15.151 | `whyopen` | [x] added by the Seasons work — opens/pins the screen hint behind the `?` |
| 15.152 | `seasetcity` | [x] added by the Seasons work — the city everyone starts in |
| 15.153 | `seasetprof` | [x] added by the Seasons work — the profile everyone starts as |
| 15.154 | `seasetdiff` | [x] added by the Seasons work — the difficulty everyone plays on |
| 15.155 | `seasontoggle` | [x] added by the Seasons work — opens/pins the season chip's detail |
| 15.156 | `belltoggle` | [x] opens/pins the notification panel (§22.13) |
| 15.157 | *notification row* | [x] `Do it` / `Take me there` — reuses `doact` and `goto`, nothing new to learn |
| 15.158 | *notification footer* | [x] `Open the overview` — reuses `tab`, for when you want the whole picture |
| 15.159 | `eratoggle` | [x] added by the era-chip work — opens/pins the era chip's detail (§22.14) |
| 15.160 | `levershift` | [x] added by Phase 12 — commit to a second shift: 2q lead, 8q term, capacity +35%, wages +45% |
| 15.161 | `leversupply` | [x] added by Phase 12 — lock your input cost: 1q lead, 8q term, COGS about −10% against whatever the world does |
| 15.162 | `leverchannel` | [x] added by Phase 12 — hand selling to a distributor: 1q lead, 6q term, demand +22% for 6% of revenue |
| 15.163 | `leverdrop` | [x] added by Phase 12 — stand a running commitment down early, for a quoted price |
| 15.164 | `takepartner` | [x] brings a partnership offer from the Deals screen into the company you already have — capital in, equity out, the ask minuted (§22.17) |
| 15.165 | `declineoffer` | [x] turns a partnership offer down, and it does not come back |
| 15.166 | `goprofile` | [x] added with §22.61 — the header's save line and the record screen's own buttons land on Legacy › Your record |
| 15.167 | `step` | [x] added with §22.61 — the start screen's step rail: jump to You / Start / Rules |
| 15.168 | `stepnext` | [x] added with §22.61 — step forward, and the only validation in the flow: a name is required and it says so |
| 15.169 | `stepback` | [x] added with §22.61 — step back, with every answer kept |
| 15.170 | `fmdone` | [x] added with §22.61 — dismiss the first-quarter coach, for good, on this save |
| 15.171 | `dealtoday` | [x] added with F4 — deal today's life: the profile, birth circumstance, seed, city and tier from the date in Lagos, the same for everyone that day |
| 15.172 | `undeal` | [x] added with F4 — put today's life back and choose who you are instead |
| 15.173 | ~~`worldfocus`~~ | [x] REMOVED with the city's districts (VISUAL.md, M1) — the scene behind every screen is your home, and the tabs are the way between screens |
| 15.174 | `details` | [x] added with the world-first screen — the HUD's (i): shows or folds away every explanation (folds, coaching notes, the vignette, the screen hint) |
| 15.175 | `hot` | [x] added with the scene you can tap (VISUAL.md, M11) — a tap on a person in the scene opens their card (the cast tile: favour, send money, let it lapse), and a tap on yourself opens yours (your rings and the household's three: help family, private care, be seen). Every other place in the scene is a plain `goto` |
---

## 16. Game state shape (the spine)

```js
S = {
  v, seed, city, difficulty, name, profile, turn, gameOver, startedAt,
  p:      { age, edu, health, stress, happy, family, rep,
            skills:{finance,ops,hustle,network,tech},
            job, jobPerf, jobYears, married, kids, parents, partner,
            spent, debt, acts },                    // spent/debt/acts = hours budget
  fin:    { cash, usdCash, debt[], goods[], budget, credit, overdrawn },
  assets[], biz, bizs[], activeBiz, offers[], informalIncome, cumInfl, creditCrunch,
  cast[], threads[], deals[], rival, ambition, era, digest[], stand, pegBudget,
  mkt, hist[], journal[], pending[], flags{}, cd{}, seq, decisions[], candidates[],
  quarter:{ income, expense, bizProfit, invest, note },
  house[], houseCands[],
  tune                                              // adaptive difficulty
}
```

---

## 17. Known problems the rebuild must fix

Recorded before any UI work starts, so the rebuild is measured against them:

| # | Problem | Status |
|---|---|---|
| P1 | Not intuitive — no coherent mental model; the player cannot tell what matters | [x] 5 tabs, position-first Overview, second-level strip |
| P2 | Ten tabs is too many; related things are scattered across unrelated tabs | [x] 10 → 5, all 23 old routes reachable (§21) |
| P3 | Long unbroken scrolling lists with no grouping or priority | [x] declarative per-route grouping with collapsible sections and priority defaults |
| P4 | Important numbers (cash burn, runway, what's at risk) are not surfaced | [x] `positionStrip()` — net worth, income, burn, runway, exposures |
| P5 | No sense of "what should I do next" | [x] `nextActions()`, surfaced once as a counted bell in the header (§22.13) — was `nextRail()` on every route; each item still names the (tab, sub) and card that owns it |
| P6 | Governance is the deepest system and the hardest to find | [x] own top-level tab, 6 sub-tabs, all dispatching correctly |
| P7 | Teaching copy is buried at the bottom of tabs where nobody reads it | [x] promoted to a dismissible per-screen hint; long-form cards deliberately kept |
| P8 | Sliders and inputs have had focus/layout bugs | [x] `slider` gate clean |
| P9 | The business runs on three child's-play dials — price, quality, marketing — all instant, free and reversible | [x] **Phase 7** made them commitments — lumpy, lead-timed, expensive to break. **Phase 9** made price a position you earn and can spend. **Phase 10** made quality a five-quarter process whose bill arrives six quarters late. **Phase 11** made marketing buy a decaying stock of customers at a rising CAC, with a rival who answers. **Phase 12** added three levers that were never dials at all — a second shift, a locked input contract and a distribution deal, each with a lead time, a term, and a price for getting out — and put the whole machine on one screen sorted by cost of changing your mind (§22.16). None of the three is a dial any more. |

Legend: `[x]` done · `[~]` partially addressed · `[ ]` not started.

---

## 18. Rules for the rebuild

1. Nothing is deleted until it is ticked `[x]` in sections 0–15.
2. A feature may be **moved** to a better tab, **collapsed** behind disclosure, or
   **restated** — but it may not be dropped silently.
3. Every `ACT` entry stays reachable unless explicitly struck through here.
4. Simulated systems (section 12) are untouched by UI work; only their
   presentation changes.
   **LIFTED — see Phase 7.** Presentation-only was the right rule while the
   job was navigation. It stopped being right the moment the complaint was
   that the engine *itself* was shallow: "the child's play tweaking of just
   price, quality and marketing… this is not child's play bro". A rule that
   forbids fixing the thing that is actually wrong is not a guard rail, it is
   a blindfold. Sim changes are now allowed, and every one of them is
   recorded here with what it replaced and which gate covers it.

---

## 19. Governance sub-view mapping

| # | Sub-view | Sub-tab | Status |
|---|---|---|---|
| 19.1 | `viewPack` | pack | [x] |

| 19.2 | `viewRegister` | register | [x] |

| 19.3 | `viewBoard` | board | [x] |

| 19.4 | `viewResolutions` | votes | [x] |

| 19.5 | `viewDeed` | deed | [x] |

| 19.6 | `viewPromises` | (undertakings) | [x] |

| 19.7 | `viewInbound` | bids | [x] |

| 19.8 | `viewTargets` | bids | [x] |


## 20. Complete data tables

| # | Table | Entries | Status |
|---|---|---|---|
| 20.1 | `CITIES` | 6 | [x] |
| 20.2 | `PROFILES` | 5 | [x] |
| 20.3 | `ASSETS` | 13 | [x] |
| 20.4 | `GOODS` | 11 | [x] |
| 20.5 | `BIZ` | 10 | [x] |
| 20.6 | `TRAITS` | 8 | [x] |
| 20.7 | `POLICY_EVENTS` | 12 | [x] |
| 20.8 | `CAREER` | 7 | [x] |
| 20.9 | `EDU` | 52 | [x] |
| 20.10 | `BIZ_STAGES` | 6 | [x] |
| 20.11 | `STAFF_ROLES` | 5 | [x] |
| 20.12 | `HOUSE_ROLES` | 30 | [x] |
| 20.13 | `HOUSE_PERKS` | 5 | [x] |
| 20.14 | `LIFE_EVENTS` | 23 | [x] |
| 20.15 | `BIZ_EVENTS` | 14 | [x] |
| 20.16 | `MORE_EVENTS` | 27 | [x] |
| 20.17 | `GOV_EVENTS` | 11 | [x] |
| 20.18 | `PRINCIPLES` | 37 | [x] |
| 20.19 | `BUDGET_KEYS` | 7 | [x] |
| 20.20 | `FAVOURS` | 30 | [x] |
| 20.21 | `NEG_TACTICS` | 7 | [x] |
| 20.22 | `NEG_TERM_POOL` | 10 | [x] |
| 20.23 | `CONTRACT_KINDS` | 5 | [x] |
| 20.24 | `CONTRACT_CLIENTS` | 14 | [x] |
| 20.25 | `BOARD_ARCHETYPES` | 9 | [x] |
| 20.26 | `RES_KINDS` | 21 | [x] |
| 20.27 | `LOBBY_MODES` | 6 | [x] |
| 20.28 | `BID_BUYERS` | 6 | [x] |
| 20.29 | `GOV_SUBS` | 6 | [x] |
| 20.30 | `SECTOR_MULT` | 2 | [x] |
| 20.31 | `COVENANT_KINDS` | 6 | [x] |
| 20.32 | `ROLES` | 10 | [x] |
| 20.33 | `CAST_TRAITS` | 3 | [x] |
| 20.34 | `ROLE_POOL` | 2 | [x] |
| 20.35 | `ERAS` | 7 | [x] |
| 20.36 | `ARCS` | 467 | [x] |
| 20.37 | `DEAL_TYPES` | 8 | [x] |
| 20.38 | `AMBITIONS` | 5 | [x] |
| 20.39 | `RIVAL_NAMES` | 8 | [x] |
| 20.40 | `SWANS` | 8 | [x] |
| 20.41 | `DIFFS` | 14 | [x] |
| 20.42 | `FIRST` | 8 | [x] |
| 20.43 | `LAST` | 8 | [x] |
| 20.44 | `ALL_EVENTS` | 37 | [x] |
| 20.45 | `CUR` | 1 | [x] |

Plus scalar/derived constants: `SKEY` `PKEY` `WEEKS_PER_QUARTER` `START_YEAR`
`WHT_RATE` `IC_RATE` `ARMS_LENGTH`

---

## 21. The rebuild: where everything went

**Principle (your call):** organised by *time* — one primary screen that says
where you stand this quarter and what needs you; everything else is drill-down.
**Tabs:** ten consolidated into five, with a second-level strip.
**Home:** net worth, freedom, and where you stand against the ambition.

### Old tab → new home

| Old tab | New location | Notes |
|---|---|---|
| Overview (dash) | **Overview** | Rebuilt. `viewDash` superseded by `viewOverview` |
| People | **Legacy › People** | Cast, household & family, rival |
| — | **Work › Rival** | Rival also reachable here on its own |
| Deals | **Money › Deals** | |
| Work | **Work** | Split into 5 sub-tabs: Business · Career · Household · Your life · Rival |
| Governance | **Governance** | Kept its 6 sub-tabs; its own strip removed (chrome owns it) |
| Group | **Money › Group** | |
| Market (invest) | **Money › Markets** | Portfolio lives under Money › Position |
| Property (money) | **Money › Budget / Property** | |
| Legacy | **Legacy › Ambition** | Ambition, standing, scoreboard, posterity |
| — | **Legacy › Record** | Career record (was prepended inside `viewLegacy`) |
| Ledger | **Legacy › Chronicle / Settings** | |

### Mapping table (every route)

| Route | Renders | Status |
|---|---|---|
| Overview | `viewOverview` (position, alerts, agenda, pulse, pressure, skills, economy, vignette, advance) | [x] |
| Work › Business | `viewAgenda` + `viewEngine` + `viewOutlets` + `viewContracts` + `viewStaffDeep` + `viewBiz` | [x] |
| Work › Career | `viewCareer` | [x] |
| Work › Household | `viewHousehold` | [x] |
| Work › Your life | `viewLife` | [x] |
| Work › Rival | `viewRival` | [x] |
| Money › Position | `positionStrip` + `viewMoneyPosition` (net worth, income, burn, runway, exposures; cash & debt; liabilities; borrow) | [x] |
| Money › Budget | `viewMoneyBudget` (monthly budget only) | [x] |
| Money › Property | `viewMoneyProperty` (buy something + what you own) | [x] |
| Money › Markets | `viewInvestPortfolio` + `viewInvestMarkets` (holdings left, markets right) | [x] |
| Money › Deals | `viewDeals` | [x] |
| Money › Group | `viewGroup` | [x] |
| Governance › Pack | `viewPack` + `viewPromises` | [x] |
| Governance › Register | `viewRegister` + `viewPromises` + `viewDeed` | [x] |
| Governance › Board | `viewBoard` | [x] |
| Governance › Votes | `viewResolutions` | [x] |
| Governance › Deed | `viewDeed` + `viewRegister` | [x] |
| Governance › Bids | `viewInbound` + `viewTargets` | [x] |
| Legacy › Record | `viewCareerRecord` | [x] |
| Legacy › People | `viewPeople` | [x] |
| Legacy › Ambition | `viewLegacy` | [x] |
| Legacy › Chronicle | `viewLedgerChronicle` | [x] |
| Legacy › Settings | `viewLedgerSettings` (save & load, install, run settings) | [x] |

### Verified by the `nav` gate

- 5 tabs, 23 routes, every one renders real content (>200 chars)
- 32 view functions: **zero orphaned**, zero broken
- All 9 children of the old `viewWork` are individually routed
- 16 features of the old Overview confirmed present in the new one
  (net worth, freedom, years to 65, ambition, this quarter, income, health,
  stress, happiness, family, reputation, all five skills, the economy,
  inflation, advance button, sparkline)

### Phase 2 — sub-tabs separated (DONE)

The three monolithic views were whole-function assignments, so several
sub-tabs rendered byte-identical screens. Each has been lifted into
per-sub-tab builders. **No content was rewritten or removed** — the bodies
were moved verbatim and the router now composes them per sub-tab.

| Was | Now |
|---|---|
| `viewMoney` (7 cards) | `viewMoneyBudget`, `viewMoneyProperty`, `viewMoneyPosition` |
| `viewInvest` (5 cards) | `viewInvestPortfolio`, `viewInvestMarkets` |
| `viewLedger` (4 cards) | `viewLedgerChronicle`, `viewLedgerSettings` |

The original `viewMoney` / `viewInvest` / `viewLedger` names are kept as
thin wrappers that concatenate the pieces, so anything still calling them
gets the same screen it always did. Nothing is orphaned.

Card placement decisions:
- **What you own** moved from the right column to sit with **Buy something**
  under Property (it is the same subject: possessions).
- **What this tab is really asking** (the teaching card) stayed under
  Position, where a player first meets the tab.
- **Markets** splits left/right: what you hold on the left, what you could
  buy plus the macro picture on the right.

### Phase 2b — burn, runway and risk surfaced (DONE, §17 P4)

Position opened on a bare list of accounts, which is exactly the complaint
in §17 P4. It now opens on a `positionStrip()` answering the four numbers
that decide whether a run survives the year:

- **Net worth** — after debt
- **Income** — salary + side income + yields
- **Burn** — budget + asset upkeep + debt service
- **Runway** — cash ÷ monthly bleed, in months under 4 quarters, capped at
  "12+ qtrs" because beyond that it stops being the binding constraint

Below them an **Exposures** row lists only checkable risks: informal-lender
debt, covenant breaches, open resolutions, a company that lost money last
quarter, a credit score under 45, inflation above 25%. When there is
nothing to flag it says so plainly rather than inventing something.

### Phase 2c — teaching copy promoted to a per-screen hint (DONE, §17 P7)

The two long-form teaching cards answered "what is this tab actually asking
of me", but they sat at the *bottom* of their cards, which is the one place
a player never scrolls to on a phone. They were not deleted — §18 forbids
that — they were **promoted**: every route now opens with a one-line
dismissible hint.

- **`ROUTE_WHY`** — a table of 23 one-sentence hints, one per route
  including Overview, keyed by `tab/sub`.
- **`whyStrip()`** — renders "Why this screen matters. …" with a **Got it**
  button whenever a hint exists for the route and has not been dismissed.
- **`routeView()`** is now a thin wrapper: `whyStrip() + routeViewInner()`.
  The old dispatcher was renamed, so no call site changed.
- **Dismissal is per-screen, not global.** `S.why` is a map of dismissed
  keys, saved and loaded with the run. Dismissing the hint on
  `money/position` leaves every other screen's hint intact.
- **Settings gained a "Screen tips" card** reporting how many have been
  dismissed, with a single button to restore them all — so the choice is
  reversible and a player who dismissed a hint early can get it back.

The long-form cards "What this tab is really asking" and "How returns work
here" are untouched, and the gate asserts both still exist. The hint is a
*signpost*, not a replacement: it tells you why the screen matters in one
line; the card still teaches the mechanism.

### Verified by the `why` gate (new)

- All 23 routes render a hint, Overview included
- `ROUTE_WHY` covers **exactly** the routes that exist — no orphan keys,
  no gaps
- Dismissal is per-screen and persists in `S.why`
- Settings shows the dismissed count and `showwhy` restores every hint
- Both original long-form teaching cards are still present

### Harness note

`node_modules` is excluded from the workspace snapshot, so `jsdom` must be
reinstalled with `npm install` inside `/home/user/.harness` at the start of
every session. Six gates (`disc slider anim nego house prof`) construct a
real `JSDOM`; the other seven boot through `dom.js` and run without it.
Separately, `nav.js` located the router by slicing from `function
routeView()`; because the dispatcher was renamed to `routeViewInner()` in
phase 2c that slice captured only the new one-line wrapper and reported
every view as orphaned. It now slices from `routeViewInner`.

### Phase 3 — in-tab grouping and collapse (DONE, §17 P3)

Sub-tab splitting removed the *duplicated* screens, but each screen was
still a flat wall of cards: `work/business` rendered fifteen cards with no
grouping and no sense of what mattered. Screens now have shape.

**`ROUTE_GROUPS`** is a declarative table: for each route it names which
cards belong together under a heading, and which groups start collapsed.
Thirteen routes are grouped. Defaults encode priority — the thing you came
to the screen for is open; reference material starts closed:

- **Work → Business** — *The machine* and *The company* open;
  *Where you trade* and *The people* closed
- **Overview** — *Where you stand* / *Waiting on you* / *This quarter* open;
  *Background* (skills, macro) closed
- **Money → Position** — *Your money* open; *How to think about it* closed
- **Legacy → Settings** — *Your run* open; *How this run is tuned* closed

**The safety contract.** A card that no group names is left exactly where
it was. Grouping can therefore never hide or drop anything: if a spec goes
stale the card simply stays visible, outside every group. The `group` gate
asserts this — with all groups forced open, **zero** headings may differ
from the ungrouped render.

**Collapse state is per-screen and durable**, stored in `S.grp` (true =
collapsed) so it survives a reload. It is deliberately *not* global:
collapsing a group on Position leaves Markets untouched.

Two things are deliberately **not** grouped, and the specs say why:

- **Install** lives inside the Save & load card — pulling it into its own
  group would tear it away from its parent.
- **Screen tips** is the control that brings back dismissed hints. A control
  that undoes a decision must never sit behind a collapsed group.

Grouping is applied in `routeView()` by `groupRoute()`, so no view
function was restructured to get it.

### Verified by the `group` gate (new)

- **0 phantom groups** — every spec matches at least one real card
- **0 headings dropped** — forcing all groups open reproduces the
  ungrouped render exactly
- Collapsing one group hides that group's content and nothing else,
  and shortens the screen
- Collapse state is per-screen and survives a re-render
- `work/business` 15,609 → 13,743 chars; `legacy/settings` 38,302 → 33,301

### Phase 3b — a collapsed group keeps its numbers (DONE)

P7's operation was "surface buried information". Collapsing a group hid
information again, one layer down: `The people` collapsed to a title and a
count, so the player had to open it to learn there are 0 staff. That is
detail hidden, but it is also **state hidden**, and state is the one thing a
summary must never lose.

So a collapsed header now promotes its members' own figures:

```
cardTag(html)   // <h3|h4> -> <span class="tag"> -> strip tags and entities
groupLevel()    // tags: members[g].map(j => cardTag(units[j].html)).filter(Boolean)
sect()          // when !open: up to 3 tags joined with ' \u00b7 ', plus '+N'
                // overflow, in a .secttags pill after the count chip
```

Rules the implementation holds to:

1. **The grouping layer invents nothing.** It reads the `.tag` span the card
   itself already authors, so a promoted figure can never disagree with the
   card it summarises.
2. **At most three, with `+N`.** A header is a summary, not a table.
3. **Only when collapsed.** An open group must not repeat its own figures
   underneath itself — gate-asserted.
4. No `.tag` in a member card means no promotion, silently.

Verified headlines (tech business, six quarters in):

```
The people             0 staff \u00b7 \u20a60/mo
Where you trade        1 \u00b7 \u20a6348k/q rent \u00b7 0 live
The company            Tech Startup (SaaS) \u00b7 Informal
Who owns what          \u20a672.99m equity value
What it is worth       \u20a672.99m equity \u00b7 none
Side deals             0 live \u00b7 0 amendment(s)
```

### Verified by the `group` gate (block 5)

- A collapsed `The people` still shows staff count and monthly cost
- An **open** group does **not** duplicate those figures on its header
- A collapsed `governance/register.0` still shows `equity value`

### Phase 4 — what next (DONE, §17 P5)

The gap was not "the game has no help". It was that the game never said what
to do next, and it was worst exactly when nothing was on fire.

`agendaItems()` / `viewAgenda()` already existed and did one job well: list
what is broken. Three things it did not do:

1. it only appeared on two screens
2. its `Go` button called `switchbiz` — it changed which company you were
   looking at but never took you anywhere
3. it says **nothing** when there is nothing wrong, which is precisely the
   moment a player is lost

So the agenda is now the *source*, not the answer. `nextActions()` consumes
it and adds a destination to every item, then adds a third tier the agenda
never had — the deliberate move:

```
1. put out the fire             lv 'bad'
2. handle it before advancing   lv 'warn'
3. make one deliberate move     lv 'go'   - never empty by construction
```

Tier 3 is ordered by how soon the chance expires: an open resolution closes,
a live bid lapses, partnership offers lapse, deals close on their own, the
quarter's hours go unused, cash sits still, and only last the ambition you
have not set yet. If every source is empty the function still returns one
entry — *"Nothing needs you. This is the part where you choose."* Being told
there is nothing to do is itself the answer a lost player needs.

Destinations are declared, not inferred. Each `out.push` in `agendaItems()`
gained a `kind`, and `NEXT_DEST` maps a kind to a `{tab, sub, focus}`:

```
lease / condition / unassigned   -> work/business   focus 'Units'
renewal / margin                 -> work/business   focus 'Contracts'
tender                           -> work/business   focus 'On tender'
morale / underpaid / gm / cover
        / nostaff                -> work/business   focus 'Team'
capacity                         -> work/business   focus 'Levers'
insolvent                        -> money/position
household staff                  -> work/household
undeclared payroll               -> governance/register
```

`focus` is the point of the whole exercise. A rail that says "go to Work"
is a tab; a rail that opens **Work › Business**, expands *The people* and
flashes the **Team** card is guidance. Three places cooperate:

- `groupLevel()` force-opens any group whose member card matches `UI.focus`
- `applyDisclosure()` refuses to collapse that card
- `render()` scrolls it into view, flashes it once, then clears `UI.focus`

Two new actions carry it. `goto` sets tab, sub and `UI.govSub` (the flag
whose neglect already broke every governance sub-tab once), switches
business, and scrolls. `doact` switches business *first* and then runs the
action — the agenda's own button used to act on whichever company happened
to be active, whichever one the item was about.

The rail itself sits at the top of every route except Overview, where the
full agenda card lives. It will not offer to send you to the screen you are
already on; when the only thing left points at the current screen the button
becomes **Close the quarter ▸**, because that *is* what you do next. The
agenda card on Overview shares `nextBtn()` with the rail, so the two can
never disagree about where a thing lives.

### Verified by the `next` gate (new, 15th)

- A rail on all 22 non-Overview routes, and **not** on Overview
- `nextActions()` is never empty — checked before a company exists and again
  six quarters in
- Every `(tab, sub)` the rail names exists in `TABS` / `SUBS`
- The top pick never points at the route it is rendered on
- `focus` opens the group hiding the card: *The people* collapsed hides
  **Team**; with `focus='Team'` it is visible
- `goto` lands on the right tab *and* sets `UI.govSub`; focus is consumed
- A focus string matching nothing must not throw

Deliberately **not** asserted: the ranking. Which fire matters most is a
design judgement that will keep moving, and pinning it would freeze the one
part that should stay easy to change.

### Phase 5 — the two carried bugs (DONE)

Two defects had been carried across phases on the strength of a note rather
than a test. Both are now settled, one by fixing and one by checking.

**1. `viewInvestMarkets()` never closed its card — fixed.**

The function opened

```
h += '<div class="card" style="margin-top:12px"><h3>Markets</h3>';
```

and never closed it, so *Macro picture*, *Recent market news* and *How
returns work here* were all nested **inside** the Markets card. The page
looked almost right, which is why it survived so long: browsers absorb an
unbalanced div without complaint. What it actually cost was structural — any
depth-based walk of the screen, `splitTop()` included, swallowed everything
after it. Phase 3 had to make the walker *tolerant* of this rather than fix
it, and that tolerance is now a fallback rather than a load-bearing part of
the design.

One `h += '</div>'` closes it. `money/markets` now reports **5 top-level
cards** instead of one card with four inside it, and all 23 routes balance
(`probe15.js`).

**2. The sabbatical cooldown — investigated, already correct.**

The standing note claimed a cooldown bug. The `hours` gate has asserted the
whole thing since phase 2 and passes:

```
sabbatical cooldown  : one year, reopens at turn +4 = true
```

`can` is `(!s.cd.sab || (s.turn - s.cd.sab) >= 4)`, `run` stamps
`S.cd.sab = S.turn`, and the hint — "a month off every quarter is not a
sabbatical, it is unemployment" — is what the code does. The note was stale,
not the code. **The lesson is the one from phase 3: a carried note is not
evidence; a gate is.**

### Phase 6 — mobile-first, measured (DONE)

"Mobile-first, 390px to laptop" was declared before any UI work started and
then never tested. Not because it was forgotten — because every gate up to
this point ran against a stub DOM that cannot lay anything out. `jsdom`
answers "is the `<div>` there", never "is it off the side of the screen".
**"It works on mobile" was an assumption, and it had been an assumption for
six phases.**

So the 16th gate drives a real Chromium at 390×844. It found two real
defects and one thing that was genuinely fine.

**Genuinely fine: nothing scrolls sideways.** All 23 routes and both modals
report `scrollWidth` 390 against a 390px viewport. No element pokes past the
edge. That half of the constraint was already honoured.

**Defect 1 — the header ate a fifth of the phone.** The sticky `#top` held
the stat row, the tabs and the sub-tabs: **162px of an 844px screen, pinned
there permanently.**

The obvious fix is to compress it, so that was measured first — five
variants, prototyped in the live browser with `addStyleTag` before a single
line was committed:

```
hide the brand subtitle      162 -> 157
hide the quarter stat        162 -> 162   (nothing: it never fit anyway)
smaller header buttons       162 -> 162
all three together           162 -> 155
```

**Seven pixels, for two live numbers.** Compressing was rejected on
evidence. The alternative was structural: let the stat row scroll away with
the content and keep only the two nav strips pinned. **162px -> 75px.**

Which is where the interesting bug was. `position:static` on `#top` is not
enough:

```
phone   scrollY=900   tabwrap(top -805)   <- the nav left with the stats
```

A `position:sticky` child is trapped inside its parent's box, so a merely
static `#top` dragged the nav off-screen with it. The fix is
`display:contents`, which dissolves `#top`'s box altogether and makes the
page itself the containing block:

```
phone   scrollY=900   toprow(-900..-805)  tabwrap(top 0)   <- pinned
laptop  scrollY=900   toprow(0..51)       tabwrap(51)      <- unchanged
```

**Defect 2 — the controls were not thumb-sized.**

| control | before | after |
|---|---|---|
| `.btn.xs` | 25px | 33px |
| `.btn.sm` | 27 × 30 | 37px |
| `<select>` | 20px | 33px |
| text `<input>` | 28px | 33px |
| `<input type=range>` | 28px | 36px |

Sliders are the one case worth a note. A slider is *dragged*, not tapped, so
it must not be padded like a button — but its box **is** its hit area, and
28px is thin. Transparent vertical padding grows the target without touching
the painted track. That padding alone did nothing at first, because
`*{box-sizing:border-box}` means padding cannot grow a fixed-height element;
it needed an explicit `height:36px` as well.

The laptop is untouched and the gate now says so: `#top` sticky,
`#tabwrap` static, stat row pinned at 0 with the nav stacked at 51px.

### Verified by the `mobile` gate (new, 16th)

- 23 routes at 390×844: **0** overflow, **0** controls under 30px
- Pinned chrome **75px** (budget 90; it was 162)
- Scrolled 900px: nav still pinned at top 0, stat row gone
- Laptop: header still sticky, nav still stacked at 51px
- Both modals fit

**A gate that measures but does not fail is decoration.** The first version
of this gate counted 13 undersized controls, printed them, and exited 0.
The assertion was added in the same pass as the fix it was meant to catch.

### Harness note

`mobile.js` needs a browser, which is heavier than the other 15 gates:

```
npm install playwright && npx playwright install chromium
sudo npx playwright install-deps chromium     # libnspr4 and friends
```

`node_modules` and `.cache` are **not** in the workspace snapshot, so this
is reinstalled at the start of any session that runs the mobile gate. The
gate serves its own copy of the app on an ephemeral port, so a dead preview
server cannot make it pass by accident.

### Phase 7 — a business is a set of promises, not a set of dials (DONE, §17 P9)

The complaint: *"the child's play tweaking of just price, quality and
marketing to make business improve? What's even that? This is not child's
play bro."*

It was worse than three sliders. Every one of them shared five properties,
and **not one of those five is true of any lever a real manager has**:

| | the sliders | reality |
|---|---|---|
| continuous | any value, any time | commitments come in lumps |
| free to change | nothing | someone has to agree, something has to be signed |
| instant | `units = min(capacity, demand)` this quarter | everything arrives late |
| reversible | nothing constrains next quarter | most of it cannot be unmade |
| independent | the three never interact | they are substitutes and complements |

`expandBiz()` added a location the same quarter you paid for it — a ₦16m+
commitment materialising instantly. `hire()` delivered a fully productive
human being the day you signed them. `fire()` made someone vanish. None of it
was management; it was a control panel.

**The reframe:** a manager does not choose *levels*, they make *commitments*.
The commitment is the hard part, not the number.

#### What was built

`b.commitments[]`, and the three properties that make a commitment a
commitment:

```
commitNew(b, spec)      // delay:      lead quarters before it exists
                        // bleed:      perQ drawn from b.cash while it builds
                        // irreversible: commitBreak() > commitSunk(), always
commitBreak(c)  = paid + (total - paid) * breakPct
stepCommitments(b)      // draws, activates on readyAt, releases people on notice
stepRamp(b)             // nobody is productive on day one
committedFixedQ(b)      // what you owe next quarter whatever you sell
viewCommitments()       // the promises, on screen
ACT.abandon             // walk away, at the price quoted
```

No closures are stored in state — it serialises — so a commitment carries
plain data and `commitActivate()` switches on its `kind`.

**Measured, live:**

```
location    24,000,000 all in · 8,400,000 now · 7,800,000/q · arrives in 2q
            locations unchanged the quarter you commit
            abandon: 18,719,470 to walk away, 12,021,678 already sunk
hire        0 staff the quarter you offer · joins next quarter at ramp 0.52
            ramp: 0.52 -> 0.74 -> 0.96 -> 1.00   (about four quarters)
fire        headcount unchanged · staffProd 0.91 -> 0.59 · gone next quarter
locked in   762,716/q owed whatever you sell (rent + salaries + builds)
```

The location is the important one. It arrives **two quarters after** you
commit, it takes money out every quarter in between, and abandoning it costs
**more than you have already spent**. That last property is the whole trap:
it is painful enough that finishing feels rational even when finishing is
wrong. You commit in a boom, it lands as demand turns.

#### What changed in existing behaviour

| before | after |
|---|---|
| `expandBiz()` adds a location instantly | places a unit commitment, 2–3q lead, deposit up front |
| `hire()` pushes a fully productive person | 1q notice, joins at ramp 0.30, ramps to 1.0 over ~4q |
| `fire()` removes someone that quarter | works a notice quarter at 65% output, then leaves |
| `hireask` (accept without negotiating) instant | defers the same way — accepting an offer is accepting an offer |
| staff productivity | `staffProd()` now multiplies by `ramp` and by 0.65 for anyone serving notice |

`hireask` deferring was a deliberate call: the standing requirement is that
you can *accept an offer without negotiating*, and that still works — you
just don't get the person this quarter, because they have a job to leave.

#### The deliberate asymmetry

**Household staff still start the day you hire them.** `hireHouse()` was
left alone. That is a scope decision, not a design opinion: the household is
a separate system with its own `quarters`/`perf`/`morale` mechanics, and
giving it a notice pipeline is a second system, not a line change. It is
recorded here as an inconsistency a player can see, and it is the first
candidate for the next pass.

#### Verified by the `commit` gate (new, 17th)

- **Delay** — a location does not appear the quarter it is paid for; a hire
  does not join the quarter they are offered the job
- **Bleed** — money leaves the business every quarter while a unit builds
- **Irreversible** — abandoning costs strictly more than what is sunk, and
  the abandoned unit never arrives
- **People** — joins below full productivity, ramps to 1.0 over several
  quarters; firing leaves them on the books at reduced output
- **No regression** — a business with no commitments trades and produces
  exactly as before
- `committedFixedQ` counts rent for a live lease

Deliberately **not** asserted: the exact lead times, ramp rates and break
percentages. Those are balance numbers and will be tuned. The *shape* is
what must hold.

Two gate bugs worth recording, because both are the same lesson as the
sabbatical note in Phase 5:

- the first version hired one candidate at a fixed ₦200k, which was below
  market, so the hire quit and the gate reported **turnover** as a failure.
  It was measuring its own mistake. Now hires five at 1.25× market.
- the `house` gate asserted `hireask` increased headcount immediately. That
  encoded the old instant-hire behaviour and had to be **rewritten**, not
  silenced — the new assertion is that the headcount does *not* move and a
  commitment *does* appear.

#### What is still a dial

`priceIdx`, `marketing` and `qualitySpendMonthly` are untouched. The full
list from the proposal that is **not** built yet:

1. price as positioning, with customer memory and asymmetric response
2. quality as a process with a discovery delay (the harvest trap)
3. demand as cohorts with channel CAC, payback and retention
4. working capital and the cash-conversion cycle (growth kills cash)
5. competitors that actually respond to your price

---

### Phase 8 — growth is financed before it is earned (DONE)

**What was wrong.** Working capital did not exist. Inventory, receivables and
payables were decoration: the only consequence of running out of cash was
`if (b.cash < 0) units *= 0.78`. A business could grow 300% a year and never
notice, because the cash that funds growth leaves the building quarters before
the profit arrives and nothing ever said so. *Profitable companies go bust
because they are growing* is the most counterintuitive lesson in business, and
the model made it impossible to learn.

**What it is now.**

| Piece | What it does |
|---|---|
| `cccOf(b)` | the cash conversion cycle — DSO + DIO − DPO in days, and the naira tied up |
| `growthBill(b, g)` | what the next increment of growth costs in cash, before it earns anything |
| `wcFunded` | how much of the stock you *want* you can actually afford to hold |
| service effect | an empty shelf serves measurably fewer customers than a stocked one |
| `viewWorkingCapital()` | the card that makes all of it visible on Work → Working capital |

The three levers the player already had now mean something. **Credit terms**
(`wcPolicy`) buy revenue today and cost you DSO. **Stock depth**
(`wcTargetInv`) buys service and costs you DIO. Both are paid for out of cash
that never appears on the P&L.

**Measured (`wc` gate):** six quarters of growth took revenue ₦9.82m → ₦26.91m
(**+174%**) and pulled cash locked in the cycle ₦2.70m → ₦6.88m. The business
got more valuable and poorer at the same time, which is the whole point.

**Bugs found while gating it.** (1) `cccOf` rounded the whole *after* summing
unrounded parts, so the displayed DSO + DIO − DPO did not equal the displayed
CCC. The player does that arithmetic, so the parts are now rounded first.
(2) The gate asserted cash absorption *per quarter*, which is simply wrong — a
growing quarter can be served out of stock bought earlier. Rewritten to
measure a window.

---

### Phase 9 — price is a position, not a number (DONE)

**What was wrong.** Price was `units *= (1/priceIdx)^elasticity`. Cut the price,
get the volume, raise it back, get the volume back. Nothing was remembered,
nothing was earned, and there was no such thing as selling *below your station*.
Every quarter the market was born again.

**What it is now.**

| Piece | What it does |
|---|---|
| `priceBand(b)` | the range of prices your quality, reputation and service have *earned* |
| `b.positioning` | a 0–100 standing you build by being good and spend by discounting |
| `b.discountMemory` | what the market learned while you were cheap |
| `stepPriceMemory(b)` | cuts teach it fast, staying on sale teaches it slowly, selling at list lets it forget |
| `_climb` | the penalty on *raising* price back, which is not the same as elasticity |

**The asymmetry is the lesson.** Measured over three runs of the `price` gate:
demand 443 at full price → 592 after cutting to 70% → climbing back to full
price recovers 501 **without** the discount habit and 255 **with** it.
**49% of the recovery is lost to the memory of the cut.** Elasticity alone
hands the volume straight back; the model no longer does.

Charging above your earned band costs demand *and* reputation. Earning better
positioning widens the band, so the reward for getting good is the right to
charge more.

**Bugs found while gating it.** (1) `stepPriceMemory` wrote `lastPriceIdx`
*before* demand read it, so `priceRaising` was dead code and the asymmetry was
literally zero. Momentum must be captured before it is mutated. (2) My own
test raised *to* 1.00, where `1^elasticity = 1` no matter what the memory says —
elasticity cannot produce asymmetry at list price, so the penalty had to sit
on the *change* (`priceRise`), not the level. (3) The first rule keyed memory
off the band, which was self-defeating: discounting erodes positioning, which
lowers the band, which stopped counting as discounting, so memory *decayed
while the business was still on sale*.

---

### Phase 10 — quality is a process, and you find out late (DONE)

**What was wrong.** `qualitySpendMonthly` was charged to opex every quarter and
the money went nowhere. The only thing that ever moved `b.quality` was a random
event. It was a money incinerator with a label on it.

**What it is now.**

| Piece | What it does |
|---|---|
| `stepQuality(b, units)` | spend feeds a target; `b.qualInvest` closes on it over ~5 quarters |
| `b.qualInvest` | the only writer of `b.quality` — events now move the investment, not the score |
| defects pipeline | units built at low quality are queued and surface **3–6 quarters later** |
| `b.pendingDefects` / `b.defectBill` | the bill, visible *before* it lands |
| warranty cost + reputation hit | what surfaces when it does |

**The harvest trap, measured (`quality` gate).** Six quarters of spend took
quality to 87 with nothing in the pipeline. Cutting the spend to zero:

```
quarter        7      8      9     10     11     12     13     14     15     16
profit      1.40m  1.24m  1.18m  1.02m  1.14m  1.15m  1.05m  1.05m  1.19m  1.02m
quality       73     62     53     46     40     35     31     28     26     24
warranty       0      0      0      0      0    9.7k     0   330k   347k   304k
reputation    43     42     42     41     40     38     37     34     30     26
```

Costs drop the quarter you cut. Quality decays for five. The bill arrives in
quarter 12 — **six quarters after the decision** — and keeps arriving.
Reputation falls 43 → 26. This is what "you don't find out for a year" means.

**Calibration note.** The first version floored quality at 14, so a business
that never spent settled near 19 and could not grow whatever else it did — the
trap with no way out and no explanation. Raised to 38, which settles near 48:
visibly mediocre, survivable, and spending is still the only way above it.

---

### Phase 11 — customers are a stock, and a rival is a rival (DONE)

**What was wrong.** Marketing was `1 + 0.35*(m/(m+250000))`. Spend more, get
more demand, instantly, forever — and stop spending and all of it vanishes at
once. Neither is true. Meanwhile the rival in `S.rival` made moves at random
and never once responded to anything the player did.

**What it is now.**

| Piece | What it does |
|---|---|
| `b.custBase` | a stock of customers, not a demand multiplier |
| churn | quality, service and price discipline set retention; ~10%/quarter at average |
| `stepCustomers(b)` | spend buys customers at a CAC that **rises as you fish out the market** |
| word of mouth | above a quality threshold, the base grows by itself — the only channel that compounds |
| `stepCompetitor(b)` | cut your price and the rival matches it, a quarter or two later, and takes part of it back |

**Measured (`market` gate).** CAC climbs ₦13k → ₦23k as the pool fills; the
same spend buys 151 customers and later 87. Stop spending and the base decays
163 → 102 → 63 → 39 → 24 → 15 — gradual, not a cliff. Word of mouth is **0**
at quality 30 and positive at 92. A 38% price cut moves `rivalCut` from 0.12
to 0.23 over four quarters, never instantly.

**Quality is now the highest-leverage decision in the game.** Twelve quarters
in, holding everything else equal:

| Quality spend | Quality | Churn | Revenue | Profit |
|---|---|---|---|---|
| 0% of revenue | 45 | 11.4% | ₦18.37m | **₦17k** |
| 3% of revenue | 65 | 3.9% | ₦22.57m | **₦6.42m** |
| 6% of revenue | 85 | 3.9% | ₦34.54m | **₦9.07m** |

**Bug found while gating it.** Two, both real and both pre-existing:
(1) **Nobody quits in the quarter they joined** — they used to be able to, so
you paid a recruitment fee and got nobody, making hiring a coin flip in any
mediocre firm. (2) **A rival would poach a probationer** — `R.pick(b.staff)`
picked at random, so with one employee it was always the person who had
started that same quarter, before they had finished ramping and after you had
already paid for them. Poachers now only take people with three quarters of
track record, and if nobody qualifies the rival does something else.


### Bugs found and fixed during phase 3

1. **`viewInvestMarkets()` emitted an unclosed `<div>`** (99 open, 98
   close). Any depth-based scan of the page silently swallowed every card
   after it. `splitTop()` is now tolerant: an unclosed block is emitted at
   the end of the string, a stray `</div>` is ignored, and a new `<div>` at
   depth 0 closes off whatever was left open. Markup passes through exactly
   as it arrived — unbalanced in, unbalanced out.
2. **Grouping only saw top-level cards.** Several views return their cards
   wrapped in a layout div, so a top-level scan found a fraction of them.
   `groupRoute()` now recurses into non-card wrappers, keeping the wrapper
   itself intact.
3. **`cardTitle()` only read `<h3>`.** Cards are not consistent — several
   render their title in `<h4>` — so those cards never matched a spec.
4. **`open:0` passed a `!== false` check.** A group marked collapsed
   rendered open. Now `!!opt.open`.

### Harness note

`check.js` is a generated extract of the page script and `build.js` reads
it, so **`node mkcheck.js` must be re-run after every edit to
`index.html`**, followed by `node build.js`. Skipping `mkcheck.js` leaves
the harness testing stale code that passes while the app is broken.
`mkcheck.js` now exists so this is a command, not a memory.

### Bug found and fixed during phase 2

`viewGovernance()` dispatched on `UI.govSub`, the retired pre-consolidation
flag. The new shell writes `UI.sub`, so **all six governance sub-tabs were
rendering the Pack screen**. It now reads `UI.sub` when the tab is
governance and falls back to `UI.govSub` otherwise.

### Verified by the `dedupe` gate (new)

- All 23 routes render; **no two are identical**
- No route throws during render
- All 16 cards that existed before the split are still present somewhere
- Position renders Net worth / Income / Burn / Runway / Where you stand
- A genuinely broke run reports a finite runway in months and flags its
  informal lender; it does not report "Indefinite"

Route sizes after the split (chars, turn 8, with a car and a bank loan):

```
money/position 1866 → 4266 with strip   money/budget 3577   money/property 6129
money/markets 11540    money/deals 2997    money/group 7939
governance/pack 5767   register 3203   board 406   votes 1115   deed 3054   bids 475
legacy/record 1082     people 8945     ambition 4276   chronicle 1603   settings 39070
```

---

## 22. Seasons — a fixed finish line and a comparable score

**Request.** *"I should be able to set the final game terminal year and month
(maybe final retirement, maybe a particular quarter). Think multiplayer where I
want to have several people play using similar conditions and also want to
control the timing and game conditions. And also, we should be able to get
detailed report and a final score which can be rated against each member."*

Three forks were settled by the player before any of this was built, and each
one is now enforced by the `season` gate:

| fork | chosen | why |
|---|---|---|
| how a cohort forms | **season code**, synced | portability is sync, never a file (§15.26/15.27) — a score that leaves the device as a file is a score anyone can edit |
| what the score is | **composite**, six axes | net worth alone rewards one style of play and ignores everything the game also says matters |
| what happens at the end | **hard stop** | the run ends on the configured quarter and the report locks; a leaderboard where somebody quietly played eight more quarters is worthless |

### 22.1 What was there before

Nothing. Endings were fixed at age 65, turn 168, health 0, or bankruptcy, with
no way to set a date. `finalReport()` produced a prose rank (`Tycoon`,
`Getting There`…) but **no comparable number** — two players could not be
placed against each other at all.

### 22.2 The model

```
SEASON_AXES:  wealth 25 · enterprise 20 · reputation 15
              family 15 · health 10 · integrity 15
seasonTurnFor(year, q) = ((year - START_YEAR) * 4) + (q - 1)
scoreRun() -> { total /1000, pct, axes, rank, rankNote, counts }
```

Wealth and business value both use a **log scale** (`100·log10(real/2e6)/3`,
clamped 0–100) so a three-decade spread stays comparable and the top of a board
is not a lottery.

| axis | what it reads |
|---|---|
| wealth | net worth in start-of-game money, log-scaled |
| enterprise | business value (log) 0.60 + reach (outlets, staff) 0.25 + 15 if trading |
| reputation | personal rep 0.60 + business rep 0.40 |
| family | counted in people, not money spent on them |
| health | health 0.70 + (100 − stress) 0.30 |
| integrity | compliance 0.45 + (100 − tax risk) 0.25 + share of decisions that were good |

### 22.3 Measured, not assumed

Finish line — fires on exactly the configured turn, every time:

```
end turn 40 -> Q1 2036 · seasonsLeft 40 at the start, 39 after one quarter
ended at turn 40 | reason season | expected 40 | EXACT
```

Score discrimination — constructed end states, so the answer depends on the
score and nothing else:

```
no business   391   wealth 38  enterprise  0  reputation 42
harvested     621   wealth 91  enterprise 73  reputation 20
built         706   wealth 87  enterprise 79  reputation 74
```

Harvesting (high price, quality stripped, cash taken out) buys real wealth and
pays for it in reputation. It beats never having started a business, and loses
to building one. The integrity axis was separately isolated to prove it does
not merely punish success:

```
neglected  integrity 35  (compliance 26, tax risk 65)
well-run   integrity 79  (compliance 88, tax risk  4)
crooked    integrity 19  (compliance  5, tax risk 92)
```

### 22.4 The bug worth naming: conditions were not actually shared

The season pins the tune, and it has to. `newGame` was:

```js
S.tune = computeTune(skillRating(ensureProfile()), S.difficulty);
```

The adaptive difficulty is keyed to **your own record**. Two people joining the
same season would therefore get different worlds because one of them had played
more. Measured:

| runs in record | rating | shock | fail |
|---|---|---|---|
| 0 | — | 1.000 | 1.000 |
| 3 | 31.3 | 0.867 | 0.892 |
| 10 | 23.1 | 0.764 | 0.808 |
| 30 | 19.1 | 0.754 | 0.800 |

A veteran faced shocks **32.6% more intense** than a novice in the same season —
enough to decide the board on its own, before either of them made a decision.

A season run now pins the tune to the untuned baseline for everybody:

```js
S.tune = computeTune(cfg.season ? null : skillRating(ensureProfile()), S.difficulty);
```

Verified: a novice and a thirty-run veteran now hold an identical tune and,
playing identically, score identically. Outside a season the adaptivity is
untouched and still responds to the record — the gate asserts both.

### 22.5 Determinism

Six identical runs scored 278–279 (spread 1 in 1000) and all ended on turn 40.
The residual was traced to `closeOutlet`, which was the last unseeded
`Math.random()` left in the simulation path; it now draws from the seeded `R`.
Every other `Math.random()` in the file is seed, ID or season-code generation,
which is not supposed to be reproducible.

### 22.6 Where it lives

| piece | where |
|---|---|
| axes, `seasonTurnFor`, `seasonDateOf`, `seasonsLeft`, `seasonStatus`, `scoreAxes`, `scoreRun` | `index.html`, before `checkEnd()` |
| the finish line | top of `checkEnd()`, so it wins over age 65 / turn 168 |
| setup | `startModal()` → `seasonModal()`, held in `_sea` until the run begins |
| progress | `seasonStrip()`, on every screen for the whole run |
| the board | Legacy → **Season** (`viewSeason()`) |
| the score | `scoreBlock()`, in `endModal()` and on the Season tab |
| sync | `seasonPublish` / `seasonFetchAsync` / `seasonSubmit` / `seasonLeaderboard`, extending the `CLOUD_SQL` RLS pattern |

Two Supabase tables are added to the same setup SQL: `seasons` (readable by
anyone holding the code; writable by its creator) and `season_runs` (one row
per player per season, upserted on `(code, user_id)`, so nobody holds two
places on the board). Every call is best-effort — a season is fully playable
offline, and the only thing that degrades is seeing other people's scores.

### 22.7 What is deliberately not done

- **No file export of a season or a score.** Same rule as the profile.
- **No in-game chat or turn passing.** It is a shared finish line with a shared
  score, not simultaneous play.
- **The axis weights are not settled.** They are balance numbers and will move;
  the gate asserts the ordering and the determinism, not the values.

### 22.8 Seeds and codes are offered, not typed

Two pieces of the season setup originally asked the player to invent a
string. Both were replaced with something to choose from.

**Seeds are codenames.** A seed is a six-digit number, and nobody can remember
or reliably retype one — and a typo does not fail, it silently produces a third
world that matches nobody else's, which reads as a broken season. So the setup
offers four named worlds plus *Random*, and shows the number never:

```
Green Harbour | Quiet Tide | Iron Field | Soft Yard | Random
```

The four are drawn once and held, so they do not reshuffle every time a year or
quarter button re-renders the modal, and no first or second word is repeated
across them — "Iron Bell" beside "Iron Field" beside "Quiet Field" are three
names that read as the same one at a glance. `↻` offers a different four.

**The code is prefilled.** `seaCode()` used to run only on *Create*, so the
setup screen had no code on it at all. The code is now minted when the setup
opens and sits in a readonly field with `Copy` beside it, so the organiser has
something to send before they have committed to anything. A `↻` mints another.

It is held in `_sea.draft` until *Create* is pressed. That matters: prefilling
`_sea.code` directly would mean opening the setup and backing out leaves a
season half-configured, because `_sea.code` is also the flag the start screen
reads to decide whether a season is set at all.

### 22.9 Invites: a link, a QR code, and a scan

A code you have to read off one screen and type into another is where a season
loses people. Three ways in, in the order people actually use them.

**A link.** `seasonLink(code)` builds `…/index.html?season=CODE` from whatever
address the page is running at. Opening it pre-fills the join box and opens the
setup on it, so the only thing left to press is Join. The parameter is read
fresh on every render rather than cached — caching it meant the first render,
which can happen before there is an address to read, froze the answer at "no
invite" for the rest of the session and the link silently did nothing.

**A QR code, generated on the device.** No library and no network: the game
ships as a single file and the preview sandbox has neither. The encoder is
byte mode, error-correction level M, versions 1–6 — 108 bytes, far more than a
join link needs, and staying under version 7 avoids version-information blocks
entirely. It renders as an inline SVG data URI, so there is no canvas and no
file to fetch.

Writing this is the sort of thing that is easy to get subtly wrong, so it was
verified rather than assumed: 336 payloads rendered and decoded with a real
decoder, **333 of 333 scanned**, and 325 came out bit-identical to a reference
encoder's output. The other 8 differ only because the reference chose a more
compact encoding mode; all 8 still scan. Two real bugs came out of it:

- the generator polynomial was built ascending but indexed as descending,
  which made every error-correction codeword wrong;
- format bit 8 was written into the first copy of the format information but
  not the second, leaving the module at `(size-7, 8)` unset — one wrong module
  in the format area, and the code stops scanning.

**A scan, where the browser can.** `BarcodeDetector` is used if it exists; if
it does not, the button is never drawn, because a scan button that cannot work
is worse than no scan button. Camera denial and a 30-second timeout both fall
back cleanly. The code is read on the device and put in the box — nothing is
uploaded.

| piece | where |
|---|---|
| `qrEncode` / `qrSVG` | `index.html`, in the season block |
| `seasonLink` / `seasonFromURL` / `seasonCodeFrom` | `index.html`, beside the season setup |
| the invite block | `seasonModal()`, under the code row |
| the scanner | `ACT.seasonscan`, screen `seasonscan` |

**Verification.** The `qr` gate covers what is checkable without a decoder:
capacity and refusal, finder-pattern structure, determinism, and a real round
trip — encode, serialise to SVG, reparse the path, compare against the matrix.
Full decode testing lives outside the gate because it needs a decoder, and a
decoder is not a dependency worth adding to the project.

### 22.10 The screen hint moved behind a `?`

Every screen carries one line on why it exists. It was a banner above the
content, which is right the first time you open a screen and wrong every time
after — you scroll past the same paragraph to reach the numbers you came for,
on all twenty-four screens, forever.

It is now a `?` in the sticky header bar, right-aligned on the sub-tab row:
hover on a desktop, tap on a phone, "Got it" to take it away. Settings keeps
its *Show all tips again*, so dismissing one is not permanent.

| | before | after |
|---|---|---|
| where | a paragraph card above every screen | a 24px `?` in the header row |
| how you read it | it was always there | hover, or tap to pin |
| height it costs | ~60px on every screen | 0 |

Two details worth keeping:

- The hover rule is inside `@media (hover:hover) and (pointer:fine)`. On a
  touch screen `:hover` sticks after a tap and would leave the popover hanging
  open, so those devices get the click-to-pin path only.
- The popover is pinned by a click as well as by hover, so re-rendering must
  not clear the pinned state — otherwise it slams shut the moment you press
  anything.

**Two pre-existing bugs this exposed.** Both are the same class of mistake: an
identifier that does not match what the tables are keyed by, which fails
silently rather than loudly.

1. **The overview screen had no hint, no grouping and no sub-tabs.** Starting a
   run set `UI.tab = 'dash'`, but `TABS`, `ROUTE_WHY` and `ROUTE_GROUPS` are
   all keyed `'overview'`. Nothing matched, and the one screen everybody lands
   on first was the one missing them. `normTab()` now folds `'dash'` to
   `'overview'` wherever a tab id is read or assigned, including saved games
   that still carry the old value.
2. **A sub-tab could outlive its tab.** `ACT.tab` resets `UI.sub`, but
   `startgame` did not, and any route that sets `UI.tab` alone leaves a stale
   sub behind — producing a key like `overview/business` that exists in no
   table. `routeKey()` now only appends a sub that belongs to the current tab.

The `why` gate walks the ids from `TABS`, so it passed while both of these were
broken. It now also enters a run the way the game does — `ACT.startgame()` —
and asserts the landing screen resolves.

**Regression guard.** The gate asserts the hint is *not* in `routeView()`. If
the banner is ever put back, the gate fails rather than the screen quietly
getting noisy again.

### 22.11 The starting conditions belong to the season

Two people playing to the same quarter are not comparable if one starts in
Lagos with ₦400k as a graduate on Realistic and the other in Abuja as a founder
on Hardcore. The finish line was never the only thing that had to match.

A season now carries the **city**, the **starting profile** and the
**difficulty** alongside the seed and the end date. The organiser sets them
once in the setup; everyone who joins starts as the same person, in the same
place, on the same tier. On the start screen they are shown with a *set by the
season* tag and the other options are disabled, so nobody drifts off the cohort
by accident. Removing the season hands the choice back.

**A locked tier is overridden, not enforced.** Difficulty tiers unlock as you
play, so a season set to Hardcore can be joined by someone who has not unlocked
it. Blocking them would have meant either refusing the join or silently running
them on an easier tier — and the second is a season-breaker, because their run
would quietly differ from everyone else's. The season wins, and the screen says
so: *"This tier is locked for you normally. The season overrides that."*

**Old seasons still work.** The three fields live inside `config`, which is a
`jsonb` column, so no migration is needed — but a season created before this
change has none of them. An absent field is treated as *not pinned* rather than
as a value, so the player chooses for themselves instead of being blocked.
Same for joining while offline, when the conditions never arrive.

| | before | after |
|---|---|---|
| shared | end date, seed | end date, seed, city, profile, difficulty |
| a run's city | the player's | the season's, if it sets one |
| locked tier on join | n/a | allowed, and announced |
| season without them | n/a | player chooses, not blocked |

**Measured.** Creating a season in Abuja as a founder on Hardcore: the start
screen disables the other cities and difficulties, offers only the one profile,
and the run begins with `S.city === 'abuja'`, `S.profile === 'founder'`,
`S.difficulty === 'hardcore'`. The published payload carries all three
alongside the original fields.

One small thing fixed while in here: the season code is named for the *season's*
city rather than the organiser's own, and re-mints when the city changes — an
Abuja season carrying a `LAGOS-` code is the kind of small lie that makes
people doubt the rest of it.

### 22.12 The header, tidied

The header had grown into five numbers with `flex-wrap` and no plan, and it
showed differently on every width:

| | before | after |
|---|---|---|
| mobile height | 95px | 87px |
| stats visible on mobile | **3 of 5** | 5 of 5 |
| rows on mobile | 2, unevenly filled | 2, deliberate |
| season | 3-line block in the page body | 55px chip in the header |
| desktop height | 51px | 46px |

**Two of the five stats were simply missing on a phone.** `.hstat.sec{display:none}`
hid Age and Freedom below 640px — the least important numbers, chosen by
someone, but invisible rather than deprioritised. All five now show at every
width; they shrink instead of disappearing.

**The numbers are one group, not five loose items.** They were siblings in a
`flex-wrap` row, so on a narrow screen they wrapped one at a time and the row
filled raggedly. They are now a single `.stats` element that wraps as a unit:
brand and actions share the first line, the numbers take the second.

**Vertical dividers instead of spacing.** Each stat carries a `border-left`
and equal flex basis, so they read as a scale rather than as five separate
things that happen to be near each other.

**The season is a chip, not a block.** It was a card above the content on every
screen — name, code, quarters left, then a second line repeating the end date
and the percentage played. What you need at a glance is how long is left; the
rest is a hover away. The chip shows `80 left`, and turns amber inside the last
four quarters. Hover or tap for the code, the end date, the percentage and the
hard-stop note.

**One gate assertion was bad and is fixed.** The mobile gate hard-coded
*"the nav sits at top 51px"* — a pixel count of the old header. Any change to
the header failed it regardless of whether the layout was right. It now asserts
the relationship: nav top equals header height.


### 22.13 Notifications moved into one bell in the header

*The ask:* *"why is this scattered everywhere? there should be an
announcement/notification icon containing all these: 2 deals are open. Most of
them close on their own if you ignore them."*

**What was scattered.** `nextRail()` returned one card and `routeView()`
prepended it to **every screen except Overview** — 23 of 24 routes. The same
card, the same sentence, forever, and the one thing it could never do was
count. On Money › Deals it read *"2 deals are open…"* with *"Money › Deals"*
underneath, which is a screen telling you that you are on it.

**What it is now.** A bell at the left of the header action group.

| | before | after |
|---|---|---|
| where | top of 23 of 24 screens | one bell in the header |
| how many you can see | 1, plus "5 other things waiting" | all of them, grouped |
| count | none | badge, only when something needs you |
| height cost | ~70px of every screen | 0 |

**The badge counts what needs you, and nothing else.** `nextActions()` returns
three severities: `bad` (a fire), `warn` (a deadline), `go` (a suggestion). The
badge counts `bad + warn` only. It is red when there is a fire, amber when
there is merely a deadline, and **absent** when there is nothing urgent — even
though the panel is never empty. A number that is never zero is a number you
have trained yourself not to see, and the `go` list always has something in it.

**Opening it gives the whole list, worst first**, under
`Needs you now · Before you advance · Worth doing`, one row per item, each row
keeping the button the rail used to have — `Do it` where there is a one-button
fix, otherwise `Take me there`, which opens the group hiding the card and
flashes it. Reading about a fire you cannot act on from where you are was the
rail's old sin; nothing in the list is buttonless (asserted).

**Hover previews it, tap pins it**, exactly like the `?` and the season chip.
The pin lives on `UI.bellOpen` and the renderer re-emits it, so a re-render
does not slam it shut — and acting from inside closes it, because you acted.

**One source.** The badge and every row come out of a single call to
`nextActions()` (`notifModel()`), so the bell and the Overview's *Waiting on
you* card cannot disagree for a render. The Overview card and the one on
Work › Business stay: those are two screens where what is on fire *is* the
content. Twenty-three screens was the problem; two is a home.

**The panel hung 176px off the phone screen and only measuring found it.**
Anchored to the 30px bell with `right:0`, a 340px panel on a 390px viewport
started at x=-176 — the bell sits at x=134 because the action group is pushed
right by `margin-left:auto`. It now anchors to `.acts`, whose right edge is the
right edge of the row: 40..380 on a phone, 878..1218 on a laptop. The mobile
gate measures this now, so it cannot regress silently.

**Measured, both breakpoints:**

```
              mobile (390)        laptop (1280)
toprow        87px (unchanged)    46px (unchanged)
bell          30x30 at x134       30x30 at x996
badge         4, red              3, red
panel         40..380             878..1218
rows          8 · 8 buttons       6 · 6 buttons
body          scrolls at 430px    scrolls at 430px
doc overflow  none                none
```

**One defect fixed in passing.** The `?` popover and the season chip were
written with a bare `:hover` rule alongside their `.open` rule. On a touch
screen `:hover` sticks after a tap, so both could be left hanging over the page
with no tap to dismiss them. Hover is now confined to
`@media (hover:hover) and (pointer:fine)` on all three popovers; the click pin
works everywhere.

**Deleted, and accounted for:** `nextRail()` is gone rather than left as a
stub, and removed from the harness export list. Its content is not lost — it is
the panel — and §17 P5 is restated below. The `next` gate was rewritten: it
still asserts *never empty*, *honest destinations*, *reaches the control*, and
adds *the badge counts only what needs you*, *nothing is scattered through any
route body*, and *the pin survives a render and closes when you act*.


### 22.14 The era moved into a header chip too

*The ask, after the notifications went into a bell:* the era card was sitting
at the top of four screens — Overview, People, Deals and the money screen —
each carrying the same line of explanation. Fold it in as well.

**It is a chip beside the season chip now.** Tone dot, era name (where there is
room), and the count: `● The Bust · 9q`. Hover or tap for the headline, what
the era is doing to the economy, when it runs to, and the one line of
explanation that used to be repeated four times.

| | before | after |
|---|---|---|
| where | 4 screens | one chip in the header |
| countdown | **always read "turning"** | a real number |
| explanation | repeated on all 4 | once, behind the tap |

**The countdown had never worked.** The banner computed

```js
const left = (S.era.until || 0) - S.turn;
```

and the era object has no `until` — `initEra()` writes `end`, and `stepEra()`
writes `end`. So `left` was always zero minus the turn number, always negative,
and the card always read *"turning"*. It shipped like that. No test could have
caught it because no test looked, and no player could have noticed because a
card that appears on four screens is not a card you read closely on any of
them. The `era` gate asserts the countdown ticks, is positive after a rollover,
and that the word "turning" never appears again.

**The popover had to be worth opening.** A chip showing a number is only an
improvement if opening it tells you more than the card did. So it carries the
headline, the effect on the economy — `inflation +2.0% · demand -20% ·
confidence -24 · returns -2.0% · shocks ×1.5` — and the run-out date. *Ordinary
Times* genuinely does nothing, so it says *"Nothing out of the ordinary"*
rather than printing a row of zeros.

**Two layout regressions, both found by measuring and both now gated.**

*The popover hung off the screen.* Anchored to its own chip with `right:0`, the
270px panel started at **x=-107** on a 390px viewport — the chip sits at x=112
because the action group is pushed right by `margin-left:auto`. All three
popovers (bell, era, season) now anchor to `.acts`, whose right edge is the
right edge of the row: `.bellpop 40..380 · .erapop 110..380 · .seapop
130..380`. The season chip had the same latent bug and is fixed with it.

*The header grew to three rows.* Adding the era chip pushed `.acts` from 261px
to 315px, which no longer fit beside the brand, so the actions wrapped onto
their own line and the stats onto a third: **87px → 118px**. Two changes bought
it back: *How to play* moved out of the header into Settings (**only on a
phone** — it is still a `?` on a laptop, and it is reachable either way), and
*Settings* becomes a gear below 640px, 75px → 39px. The header is **87px and
two rows again, with a season running and without**.

**Measured, both breakpoints, season active:**

```
              mobile (390)        laptop (1280)
toprow        87px · 2 rows       46px
brand + acts  70 + 279            219 + 392
era chip      52px (name hidden)  109px (name shown)
settings      39px (gear)         67px (word)
popovers      40..380 110..380    878..1218 948..1218
              130..380            968..1218
```

**One gate bug fixed while writing this.** The new row check counted distinct
`top` edges of the header's children and reported **three rows for a two-row
header**: the children are `align-items:center`, so two items on the same row
have different tops whenever they have different heights. Rows are now counted
by clustering vertical centres.

**One new gate.** `era.js`, the 25th: countdown ticks, rolls over, and is
positive; the era is in the header and in no route body; every one of the seven
eras renders with the right tone and a non-empty effect line; the pin survives
a re-render; and a run with no era shows no chip.


### 22.15 The suite was lying one time in forty

Adding the 25th gate did not break anything, but running the suite did:
`slider.js` failed with `cannot read property 'priceIdx' of null` — the
business had not started. It passed five times in a row when run on its own.

The cause was not the era work. **Thirteen of the gates called `newGame()`
without a seed**, so each process rolled a fresh RNG and played a different
world; roughly one seed in forty the fixture never gets a company off the
ground. The gate was not wrong and the game was not broken — the *fixture* was
a different game every time it ran. Forty runs reproduced it once.

All 25 fixtures now pass `seed: 4242`, matching the convention `commit.js`
already used and states the reason for.

**One of them should not have been seeded the same way, and that is the
interesting part.** `hours.js` runs `stepPersonal()` thirty times and averages
the result, because job performance drifts randomly and one sample cannot
separate the penalty from the noise. Seeding all thirty identically turned
thirty different worlds into the same world thirty times — the average of one
number taken thirty times, which averages nothing. It now uses `4242 + i`:
thirty distinct worlds, and still identical from one run of the suite to the
next. A fixture that needs noise needs *reproducible* noise, not no noise.

This is the fourth time this session that a gate was green while the thing it
claimed to check was broken or brittle — after `why` walking `TABS` instead of
the real gameplay path, the mobile gate hard-coding the old header's pixel
height, and the row counter that reported three rows for a two-row header.


### 22.16 Phase 12 — the lever map, and three levers that are not dials

*The standing objection:* *"Lol. The child's play tweaking of just price,
quality, and marketing… This is not child's play bro."*

**What was wrong.** Everything a player could move was a dial: continuous,
reversible, and effective next quarter. There is nothing hard about turning
one. What a manager actually cannot do is reverse a decision cheaply or see
its consequence quickly — and apart from property and hiring, the business had
no lever with that shape at all.

**What was added.** Three term commitments, built on the phase-7 machinery so
they inherit its three properties — a lead time before anything arrives, money
leaving the whole time it does, and a price for changing your mind that is
meant to hurt. Each also has a **term**, which the existing commitments did
not: you are in it for a number of quarters, and it ends on its own whether
you are ready or not.

| lever | lead | term | you get | it costs you |
|---|---|---|---|---|
| Second shift | 2q | 8q | capacity ×1.35 | wages ×1.45, morale −3.2/q |
| Input supply contract | 1q | 8q | COGS about −10% | a deposit, and a fixed price against a moving world |
| Distribution deal | 1q | 6q | demand ×1.22 | 6% of revenue, every quarter |

Each is worth taking because it trades a certain cost now for a bigger number
later. Each is dangerous for the same reason the term exists.

**The supply contract is the one that can turn on you.** It locks your input
price against an index that moves with inflation *and* with demand — when the
market goes quiet, suppliers cut their prices, and you keep paying the old
one. `supplyCogsMult()` marks the locked price against the world every
quarter, so the discount you were sold (0.90) can become an overpay (up to
1.15). When it does, the cannot-control column says so in a number: *"Your
locked input price is above the market — 24% over."* A lever whose only
outcome is "good" is not a lever, it is a rebate.

**The screen.** Work › Levers. Everything that moves the business, on one
screen, sorted by the only property that matters when you are deciding: **how
much it costs you to change your mind.**

1. **Set each quarter** — the six dials, with their current setting, what it is
   doing, and a button that opens the card that owns it.
2. **Commit to** — what is in flight, what is running and for how long, and
   the three you can take on, each stating its lead, its term and its price.
3. **Negotiate** — leases, renewals, tenders, pay reviews, supplier terms.
   Only rows where there is something to settle.
4. **Cannot control** — demand against capacity, a locked price going the
   wrong way, the rival, the era, people leaving.

**The fourth column only appears when something in it is biting.** That was
the design decision worth arguing about: a permanent list of things you cannot
change is wallpaper, and you stop reading it by the second quarter. The same
list appearing the week a competitor undercuts you is information. It is
absent from the screen entirely when nothing in it is costing you money, and
the gate asserts both directions.

Measured: one column at 390px, four at 1280px, no overflow at either, every
control the same 25px as every other small button in the app (30px on a phone).

**Two bugs, both found by gates that had been green while they were live.**

*The shifts button did nothing.* The three take-a-lever buttons were emitted
as `'data-a="lever' + k + '"'`, and for the shifts lever that assembled
**`levershifts`** while the handler is called **`levershift`**. The button
rendered, looked finished, and did nothing at all. The check meant to catch it
searched for `'lever' + k` too, so it found the same wrong string and passed.
The gate now extracts every `data-a` the screen emits — across three different
game states, because a screen only emits the buttons its state allows — and
asserts each one is a key of `ACT`.

*The audit gate was reporting undocumented actions and passing anyway.* It
printed *"UNDOCUMENTED 4 — in ACT, no row in §15"* and then reached its
verdict, which only tested `unreachable` and `missing`. An action in `ACT`
with no row in §15 is exactly what the rebuild rules forbid — an entry that
exists in the game and is unaccounted for in the feature list — and the gate
was watching it happen and saying CLEAN. It fails on `undocumented` now.
Writing the four lever rows into §15 (15.160–163) is what surfaced it.

That is the sixth and seventh time this session a gate was green while the
thing it claimed to check was broken.


### 22.17 "Shake hands" never worked

*The report:* *"check the shake hands in partnerships offers. it doesn't work"* —
`Uncaught TypeError: Cannot read properties of undefined (reading 'min')` at
`acceptpartner`, thrown every time the button was pressed.

**Why.** The Deals screen's button called `ACT.acceptpartner`, which is the
handler for starting a **new** business *alongside* a partner. It reads
`UI.modal.offers` and `UI.modal.typeId` — and the Deals screen sets neither,
because it is not a modal. So `BIZ.find(x => x.id === M.typeId)` came back
`undefined` and `T.min` threw. The button has rendered, looked finished, and
done nothing since partnership offers were written.

Nothing caught it because nothing ever pressed it. There was no gate for
partnerships at all.

**The fix.** `acceptpartner` is left alone for the job it actually does, and
guarded so it cannot throw when no partner modal is open. The Deals screen
gets its own action, `takepartner`, which does what the card always promised:

- `partnerSharesFor()` issues the shares so the partner ends up with the
  percentage **after** the new shares exist. Computing it against the
  pre-issue total is the classic way to hand over more of a company than was
  agreed; the gate checks 10%, 20% and 35% land within 0.6 points.
- The capital is paid into the **company**, not to the player. You are selling
  a share of everything it ever earns.
- What they asked for is minuted as an undertaking with a four-quarter
  deadline, so it lands on the Promises card and is held to.
- `declineoffer` lets you say no, and the offer does not come back.

**Two asks had no vocabulary.** The Promises card can resolve `seat`,
`reporting`, `audit`, `cap`, `dividend` and now `agreement` and `job` — but
*"wants a signed founders agreement"* and *"wants their cousin on the payroll"*
were both being minuted as **monthly reporting**, so the button offered to
"Pay for proper reporting" for a promise to hire somebody's cousin. Two kinds
were added:

| ask | kind | delivering it |
|---|---|---|
| a board seat | `seat` | gives them the seat |
| monthly reporting | `reporting` | pays for a bookkeeper, +22 compliance |
| a signed founders agreement | `agreement` | formalises the company |
| their cousin on the payroll | `job` | hires them, at 8% over market, below average |

The gate takes a partner once for each of the four asks and asserts the
undertaking is minuted and `fulfilUndertaking()` can actually deliver it —
rather than checking the kind against a whitelist, which would have gone stale
the moment a kind was added. That is exactly what would have happened here.

**On the CORS warnings in the same report:** those are what opening the file
directly looks like. A `file://` page has a unique origin, so the browser
refuses to read `manifest.webmanifest` and the PWA will not install. The game
itself is unaffected — it has no external resources and runs with the network
off. Serve the folder over http (or use the preview) and the warnings go.

### 22.18 The inventory is closed

272 rows across §0–14, §19 and §20 had sat unticked through the whole rebuild.
The line had been *"unticked is not missing"* — true, but it is not proof
either. This closes it.

**How each row was checked, not guessed:**

- **199 rows** name code — `renderStart()`, `takedeal`, `viewPack`,
  `cloudAuth`, `type:'nego'`. Every one was resolved to a real declaration: a
  function, an `ACT` handler, a `data-a` attribute, a modal type, a constant
  or a state field. 0 of them were missing.
- **73 rows** are prose (*"The cast — named people who remember what you did"*).
  33 name a bold heading that is also a real card title in the game, so those
  were matched against the source. The other 40 were checked one at a time
  against the evidence: the view function that renders them, the data table
  behind them, or the state they read.
- Every countable claim in the document was counted against the real tables.

**Three claims were simply wrong, and the document has been corrected:**

| row | the document said | the code does |
|---|---|---|
| 12.10 | Household — **20** roles | `HOUSE_ROLES` has **10** |
| 13.7 | **4** save slots + auto | the settings screen offers **3** + auto |
| 6.9 | *Up to 4 companies* | **no cap at all** — the limit is attention, not a number |

The third is the interesting one: it was not a wrong number, it was a
description of a constraint that does not exist. Nothing in the code stops you
running five companies. What stops you is that each one without a general
manager takes a full share of your attention.

**The `inventory` gate** (the 28th) asserts all 19 countable claims against
the live tables, re-checks the three corrected rows so a well-meaning edit
cannot put the wrong number back, and fails if any inventory row is left open.
It is 447 rows, 447 closed, 0 open.

**One thing it does not claim:** that a ticked row is a *good* feature. A tick
means the thing the row names exists and a player can reach it. Nothing more.

**One thing left open for a decision, not taken unilaterally:** Settings still
carries an **Export / import (portable save string)** box — `exportStr()` /
`importStr()` / `copyexp` / `import`. The standing instruction was that
portability is by sync and never by file, but that was said about the
*profile*, and profile portability is by sync now. This box moves a *run*
between devices, which sync does not currently do. It works, it is
documented, and removing it is irreversible — so it is still there. Say the
word and it goes.


### 22.19 A build stamp, because a stale file looks exactly like a bug

The partnership crash (§22.17) was reported against code that had already been
fixed. Both people were right and neither could tell: the file being run was a
download from before the fix, and the stack trace pointed at line 13052 of a
build nobody had open. The current build has `acceptpartner` at line 13483.
There was no way to see that from inside the app.

**Every screen opening the file now names its build** — a hash of the script
as it is running, at the foot of the **opening screen** and again in Settings:

```
Build 46920620 · 992,346 chars of code.
Quote it with any bug report — if it differs from mine, you are running an
older copy.
```

It is on the opening screen and not only in Settings because Settings is where
a stamp belongs and the last place anyone looks. The whole point is to identify
a file *before* playing it: somebody with three copies of `index (1).html` in a
Downloads folder cannot otherwise tell them apart, and a report written against
one of them describes a build nobody has open.

It is a hash of the **code**, not the document. Hashing `outerHTML` was the
first attempt and it was wrong in an instructive way: the page carries live
state, so the stamp changed between two renders of the same build and
identified nothing. The `inventory` gate now asserts the stamp is identical
across a quarter and a re-render, which is the property that makes it useful
and the property the first version did not have.

It needs no maintenance — no version number for anyone to remember to bump.
Any edit to the script changes it.

**On the `file://` warnings in the same report.** Those are what opening the
file directly looks like, and they are not the game misbehaving:

- A `file://` page has a unique origin, so the browser refuses to read
  `manifest.webmanifest` and the PWA will not install. Serve the folder over
  http and they go.
- The two Cloudflare lines (`/cdn-cgi/challenge-platform/...`) are not from
  this app at all — nothing in it references a CDN. They come from whatever
  site the copy was downloaded through.

LEDGER has no external resources and runs with the network off. Everything
except installing it as an app works identically from a file.

### 22.20 What the partnership bug taught about the gates

The fix was not the interesting part. The interesting part is that a button
had been dead for as long as the feature existed, and the suite was green the
whole time.

`partner.js` originally called `M.ACT.takepartner({ dataset: { i: '0' } })`
directly. That is not how a player reaches it. The bug was in the *delegate*
between the button and the handler — the button existed, the handler existed,
and the wiring between them named the wrong handler. Calling the handler
directly cannot see that, so the gate passed while the button was dead.

The gate now ends by loading the built page in a real browser and **clicking
Shake hands**, then reading the register:

```
real click        : Shake hands → confirm → Emeka Fashola 45.0%
                    you 55% · company cash ₦16.43m · 0 offer(s) left
  minuted         : ["wants a board seat"]
  console errors  : none
```

Two smaller things fell out of writing it. The harness's static server handed
every file over as `text/html`, which made Chrome report *"unsupported MIME
type"* — the same family of noise the player sees opening the file from disk,
and it would have been mistaken for a game bug. And the gate asserts every
action the Deals screen emits survives being pressed, so a handler that throws
on a route nobody walks cannot ship again.


### 22.21 Three buttons called "Shake hands", one of them dead

*The follow-up:* *"shake hands doesn't do anything in partnerships and doesn't
throw errors either. but it doesn't work."*

Not throwing was the clue. It meant the new build was running — and on the new
build `acceptpartner` had become a **silent no-op**, because of the guard I had
just added. I had converted a visible crash into an invisible one.

**There are three buttons with that label, and they are three different
transactions:**

| where | what it does | action |
|---|---|---|
| Start a company → *With partner* | found a company **with** this person | `acceptpartner` |
| Business → *Sound people out* | bring this person **into** the company you have | `takepartner` |
| Money → *Deals* card | same, from the offers list | `takepartner` |

I had fixed the third and left the second.

**Why the second was dead.** `seekpartner` opened the shared partnership modal
with `typeId: null`. That modal was built for *founding* a company with
someone, where `acceptpartner` needs a business type to price your
contribution; `BIZ.find(x => x.id === null)` returns `undefined` and `T.min`
threw. Then I added the guard — `if (!o || !T) return;` — and the same click
began doing precisely nothing and saying nothing. **Both failures came from the
same design error: one modal, two transactions, one label.**

**The fix.** The modal now carries `mode`:

- `mode: 'start'` — founding with someone. Shake hands asks what you are
  putting in, then starts the business.
- `mode: 'join'` — the company exists. Shake hands gives them shares in it.

Headings differ too (*Start with a partner* vs *Partnership offers*), and
`seekpartner` now refuses with a toast if there is no company to bring anyone
into, instead of opening a modal whose only button cannot work.

**Offers are addressed by id, not by position.** With an index, the same click
meant different things depending on which list was checked first: with the
modal open, index 0 was the modal's first offer, so a click aimed at the Deals
screen acted on the wrong person. `offerById()` resolves one offer wherever it
is showing.

**And a guard is never silent again.** `acceptpartner` toasts when it cannot
proceed. A thrown error at least gets reported; a button that does nothing is
the worse failure and I had just built one.

**The gate clicks all three.** `partner.js` ends by loading the built page and
pressing every Shake hands in it:

```
shake hands      : 3 buttons in the file · this gate clicks all of them
start handshake  : founded Tech Startup (SaaS) · partner in the register · you 62%
modal handshake  : Halima Adeyemi / Nneka Chukwu → 2 outside holder(s) · 1 offer(s) left · modal closed
real click       : Shake hands → confirm → Emeka Fashola 45.0%
                   you 55% · company cash ₦16.43m · 0 offer(s) left
  console errors : none
```

It also counts them: if a fourth Shake hands ever appears, the gate fails
until it is covered. Counting `>Shake hands<` and not the phrase, because the
phrase appears in these comments and reported five buttons when there were
three.

**The lesson, stated plainly:** there were two bugs with the same name, and
fixing one while guarding the other produced a symptom that looked like *my fix
had not worked*. The user was right three times in a row. I was testing the
path I had fixed, not the paths the label pointed at.


### 22.22 "I can't find the option to start a new business"

It was there. All ten of them, and **every one was disabled**.

On a fresh run you hold ₦180,000 (graduate) or ₦620,000 (founder). The
cheapest company costs ₦1,500,000. So `viewBiz()` rendered ten cards with ten
greyed-out Start buttons and no explanation — no shortfall, no reason, no
pointer to the one route that was open.

**Ten disabled controls with no stated reason are indistinguishable from a
feature that does not exist.** That is the same failure as the silent guard in
§22.21: a thing that says nothing when it cannot proceed.

**Four bugs, one symptom:**

| # | bug | effect |
|---|---|---|
| 1 | no explanation when nothing is affordable | the reported symptom |
| 2 | **"With partner" was disabled alongside "Start"** | the route a broke player actually has was closed |
| 3 | `BIZ.startCost` does not exist | the Work tab priced every company at **₦NaN** |
| 4 | three pickers computed the price three ways | the same business cost different amounts on different screens |

**The second is the one that matters.** `startBiz()` only ever takes what you
have — `Math.min(capital, S.fin.cash)` — so `t.min` is a *UI* gate, not a rule.
Which means "With partner" was switched off at exactly the moment a partner is
for: covering a gap you cannot cover. It is open now, on every company, at any
price, and the handshake says what each side is putting in.

Measured from a fresh graduate run:

```
broke player      : 10/10 Start disabled · "With partner" open (10 of 10)
                    · shortfall stated · no NaN
broke + partner   : founded Tech Startup (SaaS) with Ronke Balogun
                    · put in ₦150,000 of ₦180,000 · owns 62%
```

**The screen now says what it used to leave silent:**

> **None of these is within reach yet.** The cheapest is ₦1.50m and you have
> ₦180k — short by **₦1.32m**. Two ways in. Earn it: work (Work › Career), or
> take a deal. Or bring someone in: **With partner** is open on every one of
> these at any price, because covering a gap you cannot cover is exactly what a
> partner is for — and it costs you a share of everything, forever.

Each card also carries a `short ₦1.32m` chip, so the gap is visible per option
rather than only once at the top.

**One canonical price.** `startBizCost()` is now used by all three pickers.
It had been three different calculations: `T.min`, `T.min * S.cumInfl`, and
`BIZ.startCost` — the last of which is not a field, so `Math.round(undefined *
S.cumInfl)` produced `NaN` and `fmt(NaN)` printed `₦NaN`. (Its body also
contained `Math.pow(1.0, 0)`, a no-op someone had left as a placeholder.)

**Why no gate caught the NaN.** `render.js` already scans every screen for the
string `NaN` — but it calls `startBiz()` before scanning, because most screens
need a company to be interesting. The NaN only appeared in the *no-business*
state, which is the one state the gate never looked at. It now scans that state
first.

**And the start-a-company affordances are inventoried and gated:** a broke
player must be offered companies, must be told the shortfall, and must have
"With partner" available.

### 22.23 Every disabled control says why — the rule, applied to all of them

§22.22 fixed the start-a-company screen because that is where the complaint
came from. It left the *rule* unenforced everywhere else, and the rule was
already stated:

> A disabled control with no stated reason is indistinguishable from a missing
> feature.

So the rule was made mechanical. `.harness/disabled.js` walks every route in
**two worlds** — a fresh run with ₦180k and no company, and a comfortable one
with two companies and ₦40m — parses the markup it renders, and inspects every
disabled control on every screen.

**Claims**

1. every disabled button carries a reason *on the control* — `title` or
   `aria-label` — because a reason in the paragraph above it does not travel to
   a thumb, and mobile has no hover;
2. the reason is a sentence, not a shrug: the checker rejects `""`,
   `"Unavailable"`, `"Locked"`, `"No"`, and the checker itself is self-tested
   inside the gate, so it cannot quietly begin accepting silence;
3. the screen that is *about* being stuck must never have zero ways forward:
   with nothing affordable, at least one start-a-business button stays enabled
   (the partner route), and the notice must offer only routes that exist;
4. the shortfall it states must equal the arithmetic on the card — the gate
   recomputes `cheapest − cash` and compares it to the figure in the copy.

**What the two worlds found.** 26 disabled controls on a fresh run, 24 on a
comfortable one — and, before this pass, **0 of 50 said anything**, because
the gate that should have caught it did not exist. The comfortable world
disables a completely different set: the 0% floor and 15% ceiling of the
management charge, "Declare dividend" on a subsidiary with no reserves,
"Show all tips again" when nothing has been dismissed. One world alone would
have checked half the rule.

**Every refusal now names one of three things** — a number, a condition, or the
route that is still open:

| screen | control | what it says |
|---|---|---|
| Work › Business | Start alone | `Needs ₦8.00m · you have ₦180k · short ₦7.82m · or take a partner` |
| Work › Business | With partner | `Covers the ₦7.82m you cannot, for a permanent share of it` |
| Work › Business | the notice | two buttons that *walk you there*: `Work › Career — earn it`, `Money › Deals — borrow or sell` |
| Work › Business | buy the minorities out | `Costs ₦907k · you have ₦0 · short ₦907k` |
| Work › Career | Do it | `Not open to you yet: <the card's own hint>` — one button covered two different refusals, so it now distinguishes them |
| Money › Property | Buy | `Costs ₦483k · you have ₦0 · short ₦483k` |
| Money › Group | Declare dividend | `Nothing to declare: after what it owes, this company can pay up ₦0` |
| Money › Group | Lend up to holdco | `This company has no cash to lend` |
| Money › Group | subsidiary → subsidiary | `Subsidiary-to-subsidiary funding comes later — for now money moves through the holdco` |
| Money › Group | management fee −/+ | `The charge is already 0% — there is nothing to reduce` / `15% is the ceiling for an arms-length charge; above that it is the tax office asking questions` |
| Work › Levers | Extend, Open a unit | `Needs ₦3.25m in the company · it has ₦0 · short ₦3.25m` |
| Work › Levers | Insure | `This company is fully insured already` — disabled *in its own success state* read as broken rather than done |
| Work › Levers | Commit a deal | `Needs ₦2.00m · you have ₦0 · short ₦2.00m · pass it and it is gone` |
| Money › Position | Start another company | the same stated shortfall as the first-company screen, with the same two goto buttons |
| Legacy › Settings | Show all tips again | `Every tip is already showing — dismiss one first` |
| season picker | profile / city / tier | `This season is played as <name> / in <city> / at <tier> — everyone in it starts the same` |
| season list | Active | `You are playing this season now` |

**The gate had to be lied to before it could tell the truth.** Its first draft
reported a clean sweep — 0 disabled controls across 25 routes — for two
reasons, both now asserted against:

- **the harness DOM is a stub.** `.harness/dom.js` exists so the game can run
  under node at all: `querySelectorAll()` returns `[]` and `innerHTML` is a
  dead string. A gate that inspects markup through it inspects nothing. The
  gate now parses with jsdom and **fails if it parsed 0 buttons**.
- **grouping collapses sections**, so an unopened group renders no buttons at
  all. Every group is forced open before a route is judged, exactly as
  `nav.js` does.

**One more thing this pass fixed: the gates were testing an old build.**
`tools/rebuild.sh` rebuilt `dist/` and stopped; `.harness/check.js` (the page
script every gate drives) and `.harness/mod.js` were only regenerated as a
side-effect of running `npm test`, so `node .harness/disabled.js` right after a
rebuild read the previous bundle and reported 50 unreasoned controls that no
longer existed. The one command now ends with the two steps that keep the
harness in step:

```
node .harness/mkcheck.js   # dist/index.html -> check.js
node .harness/build.js     # check.js -> mod.js
```

31 gates, all passing.

### 22.24 The step-0 pipeline retires, and hand-written files get one copy

**The rule this follows.** *"Never delete anything without first accounting for
it in the feature list."* So here is the accounting, file by file, before
anything was removed.

The first extraction pass (MIGRATION.md, Step 0) cut the single file into
`src/parts/NN-part.js` — 45 parts — plus `src/index.template.html`,
`src/styles.css`, `src/manifest.json` and a root `build.mjs` that reassembled
them and compared a SHA against the shipped file. That pass is what proved the
extraction was mechanical. **All five of those artifacts are now superseded by
`packages/` and `tools/`**, and each one was checked before removal:

| file | what it was | superseded by | evidence it was dead |
|---|---|---|---|
| `build.mjs` | step-0 reassembler, SHA-compares against the shipped file | `tools/bundle.mjs` (statement ledger, deletions, declared changes) | referenced only in MIGRATION.md's history and its own usage line |
| `src/parts/*.js` (45) | the step-0 cut of the script | `packages/{core,ui}/src/*.js` (50 sections, kept in step with `packages/flat`) | nothing reads them; `tools/split.mjs` re-cuts from `reference/baseline-single-file.html`, not from parts |
| `src/index.template.html` | step-0 shell with two placeholders | `packages/ui/index.template.html` (what `bundle.mjs` actually reads) | `bundle.mjs` reads the `packages/` path |
| `src/styles.css` | step-0 stylesheet | `packages/ui/styles.css` | **they had already diverged** — 24,536 vs 24,998 bytes, the `packages/` copy carrying the 390px header fix. The `src/` copy was three features stale, which is the whole argument for one copy |
| `src/manifest.json` | step-0 part order + measurements | `packages/order.json`, `packages/ranges.json` (written by split, read by bundle) | nothing reads it |

**And `src/manual/` — the second copy of the hand-written files — is gone.**

Every hand-written file existed twice: once in `packages/` where it is used,
and once in `src/manual/` where bootstrap restored it from after wiping
`packages/`. All eight were verified byte-identical (`host.js`, both
`index.js`, both `package.json`, `styles.css`, `index.template.html`,
`changes.json`) — the mirror had been kept honestly — and then the mirror was
deleted, because *a copy you have to remember is a copy that will drift.*

`tools/split.mjs` no longer wipes `packages/`. It deletes only what it
generates (`*/src`, `flat`, `core.js`, `host-shims.js`, `exports.json`,
`graph.json`, `ui/modules`, `ui/registry.js`, `order/ranges/deletions.json`)
and **asserts the eight hand-written files are present**, naming any that are
missing and refusing to run, because it does not generate them and a
half-written packages/ fails somewhere far less obvious than the bootstrap.

The new bootstrap was tested on a throwaway copy of the workspace (never on
the real one — it re-cuts the sections from the baseline by design): 643
statements, 32 core + 18 ui sections re-cut, **8 hand-written files left
untouched**, `styles.css` still 24,998 bytes with the header fix, self-check
exact at 998,412 chars.

**Also fixed while pointing things at live paths:** `npm run bootstrap` did not
pass `--bootstrap`, so the documented way to bootstrap exited 1. `tools/
declared-changes.mjs` was still copying `changes.json` into `src/manual/`, and
`makecore.mjs` and `tomodules.mjs` still told you to look for the host seam in
`src/manual/core/00-host.js`. All four now point at the one live copy.

**And the section files got their real names.** 16 came out of the splitter as
truncated sentences (`13-kept-as-a-thin-wrapper-so-anything-still.js`,
`26-governance-the-register-the-board-th.js`, `11-legac.js`). They are now
named for the system each holds — `13-route-why-and-the-screen-hint.js`,
`26-governance-register-board.js`, `11-view-legacy.js` — **with the numeric
prefixes untouched**, because that prefix is the run order and the sections
depend on it. The bundle is byte-identical afterwards, which is the proof the
rename was cosmetic.

### 22.25 The bootstrap reverted a day of work, and every change was recovered from the ledger

**What happened.** `tools/split.mjs` takes its root from a constant:

```js
const ROOT = '/home/user';
```

I wanted to test the new bootstrap behaviour, so I copied the workspace to
`/tmp/boot` and ran `node tools/split.mjs --bootstrap` **inside the copy**. The
script read the copy's `reference/baseline-single-file.html`, then wrote to
`/home/user` — because ROOT does not care where you are. It re-cut all 50
sections from the baseline and reverted **every hand edit in the project**:

- the four setters and the `boot` guard (the ESM seam),
- all 18 disabled-control reasons and the two "walk you there" notices,
- the file renames,
- and, silently, `packages/flat`, `order.json`, `ranges.json`.

The rebuild after it still exited 0 and still printed *"every other statement is
present, once, character for character"* — because the ledger compares the
bundle against the reference, and a bundle that is the reference passes. The
only number that moved was the statement count: **644 · 648 → 644 · 643**, the
four additions and the boot guard having gone. A build that reports success
while the work is missing is the worst possible failure, and it is the second
time this session that a "green" result was measuring the wrong thing.

**Why it was fully recoverable.** `packages/changes.json` is not a summary; the
generator writes the *whole statement* —

```json
{ "name": "core: setS", "why": "...", "was": [], "now": ["// live game state\n/* ... */\nfunction setS(v){ S = v; return S; }"] }
```

— and it was untouched by the bootstrap, because it is hand-written, not
generated. So the declared changes are a **patch series**, and
`tools/apply-changes.mjs` replays it: 26 entries, 18 statements replaced, 4
additions inserted after the binding each one acts on, 2 declarations moved
(`_syncing`, `_installEvt`), verified by asserting that every `now` statement is
present exactly once afterwards.

Two things went wrong while writing *that*, both worth recording:

1. **Replacing only the code duplicates comments.** A ledger span is
   `[previous statement's end .. this statement's end]`, so the recorded text
   includes its leading comment. Replacing just the code of the statement left
   the old comment in place and inserted the new one in front of it: 1,144
   characters of duplicated comments in the bundle. The restore now replaces
   from the start of the leading comment. The final build is 32 characters off
   the pre-incident one, all of it comment placement.
2. **A stale generated module shadows the new one.** After the rename,
   `packages/ui/modules/` held both `01-view-working-capital.js` and the old
   `01-working-capital-on-screen-the-cycle-is.js`. The stale one went on
   importing `_syncing` **from `@ledger/core`**, a name core had stopped
   exporting, and the module build died with `SyntaxError: The requested module
   '@ledger/core' does not provide an export named '_syncing'`. `tomodules.mjs`
   now empties its output directory before writing.

**Three guards now stand where there was nothing:**

- `tools/split.mjs` refuses to run from any directory but the root, and says
  which path it writes to and where you actually are;
- it refuses to run without `--bootstrap`, on purpose, by name;
- and it no longer wipes `packages/` — it deletes only what it generates, and
  **asserts the eight hand-written files are present**, naming any that are
  missing rather than producing a half-written tree.

**And the last name-based coupling is gone.** `packages/ui/index.js` used to
name eighteen module files directly (`./modules/01-working-capital-on-screen-
the-cycle-is.js`), so renaming a section broke the app with a module-not-found
thrown from the entry file — while the single-file build, which loads no ES
module at all, stayed green. It now takes everything from the generated
`registry.js`, which is every module's exports merged. **Nothing in the ui
names a file.** Renaming a section changes the registry and nothing else.

**Verified after recovery:** 31 gates · 31 passed. In the browser at 390px: the
game boots, the Work tab shows 10 disabled controls with 10 reasons and both
hand-over routes, the partner flow completes (Shake hands → contribution →
funded, ₦2.18m net worth), all five tabs draw, 0 console errors.

The lesson, stated plainly: **a source of truth that can be re-cut from an
older document, by a script, without warning, is not a source of truth.** The
recovery worked because the changes were declared in full text, and that is the
argument for declaring changes in full text rather than in prose.

### 22.26 Two screens now render in React, and a gate proves they render the same game

The migration's whole bet is that screens can move from string-building to React
**one at a time, safely**. This is that bet being placed for the first time.

**What a conversion is here.** core calls `viewMoneyBudget()`; in the module
build that arrives at the host as `host.view('viewMoneyBudget')`. Whoever
answers decides what draws:

```
core ── host.view('viewMoneyBudget') ─┬─ apps/web/screens   (React)   ← moved
                                      └─ @ledger/ui registry (strings) ← everything else
```

`apps/web/screens/index.jsx` maps screen name → a function returning markup, and
the app hands the map over before the host is installed:

```js
const { converted } = await import('../screens/index.jsx');
ui.overrideScreens(converted);       // warns on a name core never asks for
ui.install();
ui.boot();
```

**Converted so far:** `viewMoneyBudget` (Money › Budget) and `viewMoneyPosition`
(Money › Position).

**The bridge is `renderToStaticMarkup`, deliberately.** The host contract is
synchronous — core asks for a screen and gets markup in the same tick — so a
React screen is rendered to a string and handed back. That keeps the router, the
render loop and the delegated `data-a` event model exactly where they were, which
is what makes a conversion **revertible by deleting one line from the map**. A
converted screen is a component; it is not yet a different application. Moving
the render pipeline itself is a later step, and when it happens these component
files do not change.

**Two conversions are partial on purpose, and say so.** `positionStrip()` — the
four-stat readout at the top of Position — is core's, returns a string, and is
used by two screens, so the React screen embeds it with
`dangerouslySetInnerHTML` rather than reimplementing it. That is the rule "one
screen at a time" working as intended: a converted screen may depend on an
unconverted piece, and the alternative — writing the same numbers twice — is how
a screen and its own summary drift apart.

**The gate: `.harness/react-screen.js`.** A rewrite like this fails silently —
every figure re-derived, every class re-typed, and nothing in a screenshot shows
a button that no longer does anything. So the gate renders **both versions of the
same screen from the same fixture** and compares what they *offer*, not what they
look like:

| compared | why |
|---|---|
| every control: `data-a` + all its `data-*` attributes, as multisets | a missing button is a missing feature; a changed `data-t` is a button that acts on the wrong thing |
| every input: type, `data-inp`, `data-k`, min, max, step, value | a slider with a different max is a lever that stops working in the wrong place |
| every `h3` heading, as a multiset | the shape of the screen |
| every money figure printed anywhere, as a multiset | catches an arithmetic slip in the port |
| every CSS class token | the React version may **add** a class, never drop one — a dropped class is styling that vanished |

Not asserted: element order, attribute order, inline styles, wording, or which
renderer is better. This gate exists to prove a rewrite changed nothing a player
can act on, and a gate that demanded identical bytes would be deleted the first
time it was right for the wrong reason.

**Both builds, one fixture.** The legacy renderer is driven from the single-file
harness build (`mod.js`); the React screens import `@ledger/core`, which is the
same code as a real module and therefore a *different instance with its own
`S`*. So each fixture is a **script** — written against a game API, run twice,
same seed, same profile — and the screens are compared across the two. That is
stronger than comparing one state with itself: `modules.js` already proves the
two builds resolve 40 quarters to the same 53 fields, so a difference here is
the conversion, and a drift between builds shows up here as well.

**Three states, because two comfortable ones prove nothing.** Fresh run;
comfortable, four quarters in; and **in debt, both kinds** — a bank loan and an
informal lender. That last one exists because the liabilities table and its
Repay buttons only exist for a player who owes something: Position goes from 2
controls to 4 and 15 classes to 19 in that state, and both renderers still agree.

**The gate was proved to have teeth before it was trusted.** Five deliberate
breaks, one at a time:

| break | caught |
|---|---|
| delete the "Status & family" preset button | yes — *missing from React: preset/flex* |
| change one slider's max by 100,000 | yes — *missing: range\|budget\|housing\|0\|400000\|5000\|63645* |
| shift one printed figure by ₦1,000 | yes — *missing from React: ₦64k · ₦66k · ₦23k …* |
| change `<span class="chip g">` to `<span class="chip">` | yes — *CSS classes lost: g* |
| (a fifth case was my test's own bad pattern, not a gate failure) | — |

**Verified live in the browser at 390px:** the console logs `screens served by
React: viewMoneyBudget, viewMoneyPosition`; Money › Position draws 3,211 chars
with its headings and 9 figures; Money › Budget draws 3,333 chars; dragging the
food slider from ₦65k to its maximum changes the committed total from ₦229k to
₦563k and flips the summary to *"That is more than you earn"* — the delegated
event model driving React-rendered markup; every other tab and sub-tab still
draws from the registry, 0 console errors. **32 gates, all passing.**

**What is left of the migration:** 27 routed screens still to move (every one of
them named in `routeViewInner()`), then the render loop, then the store
subscription that replaces `render()`, then React Native — deliberately last,
per the standing decision.

### 22.27 Six screens in React, and the gate that caught two bugs in my own ports

**Converted now:** `viewMoneyBudget` · `viewMoneyPosition` · `viewMoneyProperty` ·
`viewRival` · `viewLedgerChronicle` · `viewLevers` — 6 of the 29 routed screens.

The three new shapes this batch added:

- **A pure readout with no controls at all** (`viewRival`). Worth converting
  anyway: the two readings that need judgement — the three-word relationship
  scale, and whether the scale bar is drawn in one colour or two — are exactly
  the inline ternaries a string builder hides.
- **A list with one colour map** (`viewLedgerChronicle`). The tone lookup was
  rebuilt inside the loop, once per entry, forty times a render; it is now a
  module constant with the fallback visible at the top of the file.
- **A container around core's own widgets** (`viewLevers`). Its four columns are
  core's (`leverColSet/Commit/Nego/React`), large, and shared with the "what
  next" machinery, so they are embedded and what converts is the screen: the
  empty state, the four-column container, and the card explaining how to read
  it. Same pattern as `positionStrip()` on Position.

**The gate grew two claims, both because a mutation proved it was blind.**

**1. Text is compared now.** The first version compared controls, inputs,
headings, naira figures and CSS classes — and no words at all. Moving Rival's
`relation >= 20` threshold to `>= 25` flipped a status chip from *Wary* to
*Hostile* on screen, and the gate rendered exactly as before: nothing was
reading the words. A *port* check has to compare the text, because "the player
reads something different" is the change a port must never make. It now compares
the whitespace-normalised text as one string and reports the first character
that differs, with context.

**2. A coverage guard, because agreeing about an empty screen proves nothing.**
The first run of the batch reported `viewRival · 4 states · 0 controls · 0
figures` — every fixture rendered *"Nobody is competing with you yet."* three
times and called it agreement. The guard now counts what was actually compared
per screen and **fails** a screen whose every fixture is empty:

```
viewMoneyProperty     55 controls and 335 figures compared across 5 states
viewMoneyBudget       26 controls and 167 figures compared across 5 states
viewMoneyPosition     13 controls and 147 figures compared across 5 states
viewLevers            28 controls and  88 figures compared across 5 states
viewLedgerChronicle    0 controls and  62 figures compared across 5 states
viewRival              0 controls and  31 figures compared across 5 states
```

The metric had to be widened first: it counted buttons and naira, and a readout
screen has neither, so "all numbers that reach the screen" now counts too.

**Two fixtures added because branches need one standing in them.** Five states
now, and the last two exist because a mutation rendered identically in the first
three:

| state | why it exists |
|---|---|
| fresh run | the empty/starting case |
| comfortable, four quarters in | a company, trading |
| trading, with a rival and staff | levers, outlets, a rival — and `relation = 22`, **on the boundary** of the Wary/Hostile threshold, because a fixture comfortably inside a band cannot see a threshold move |
| overspending: budget above income | the Budget screen's "more than you earn" warning only renders when spending outruns income |
| in debt, both kinds | the liabilities table and its Repay buttons |

**The gate then caught a real bug in the ports — mine.** React escapes children
itself, so calling core's `esc()` on a value handed to React as a child
double-escapes it: the player sees `Delta &amp; Co`. The string builder needed
`esc`; the component must not use it. It surfaced on a rival whose generated name
happened to contain an ampersand, and only in the one fixture that reached a rival
— nine call sites across three files. `esc()` stays for anything going through
`dangerouslySetInnerHTML`, which is not escaped for you. The rule is written at
the top of `apps/web/screens/index.jsx`, where the next person will be.

**Mutation results, second round** (each applied alone, gate re-run, file restored):

| mutation | caught | by |
|---|---|---|
| Rival: `relation + 100` → `+ 99` | yes | `missing from React: 151` |
| Rival: move the *Wary* threshold 20 → 25 | yes, after text comparison | `the text read differently from character 29` |
| Rival: reword one sentence | yes, after text comparison | `…from character 129` |
| Chronicle: show one fewer entry | n/a | the fixtures never hold 40 entries — noted, not claimed |
| Property: change the price formula | yes | `missing from React: buygood/phone` |
| Budget: reword the overspend warning | yes, after the new fixture | `the text read differently` |

**Live at 390px:** all six screens serve from React
(`screens served by React: viewMoneyBudget, viewMoneyPosition, viewMoneyProperty,
viewRival, viewLedgerChronicle, viewLevers`), every one draws with its headings
and figures, no literal `&amp;` anywhere on screen, 0 console errors. **32 gates,
all passing**; the single file is untouched at 1,030,986 chars, 644/648.

---

### 22.28 Ten screens in React, and the seam that lets a converted screen contain an unconverted one

**Converted now:** the six from §22.27 plus `viewAgenda` · `viewInvestPortfolio` ·
`viewPeople` · `viewGovernance` — **10 of the 29 routed screens**. Every one of
them is registered in `apps/web/screens/index.jsx`, compared against its own
former self by `.harness/react-screen.js`, and walked in the running app at
390px.

The four new shapes and the one new problem they created:

- **A card that is usually absent** (`viewAgenda`). `agendaItems()` is empty
  until something is waiting on the player, so in a fresh run the whole screen
  is the empty string. It is converted anyway, and the interesting part is what
  that did to the gate — see below.
- **A table that is empty by default** (`viewInvestPortfolio`). Nothing is held
  in the first quarter of any run, so the screen that exists is a heading and a
  sentence. The port keeps core's `lastQuarter()` reading and its skip of
  assets no longer in `ASSETS`, because a portfolio can outlive the table it was
  bought from.
- **A screen built around another screen's card** (`viewPeople`). The rival card
  `viewRival` draws is now `RivalCard`, exported from `view-rival.jsx` and
  mounted by both screens. The string version had the card duplicated and the
  two copies had already drifted.
- **A tab that is a frame around sub-screens** (`viewGovernance`). It keeps
  `ensureGov(b)`, keeps the second-level strip's `UI.sub`-then-`UI.govSub`
  fallback, and embeds eight unconverted panels — which is the new seam:

  ```
  a converted screen cannot import @ledger/ui
      (that is the package that called it, so it would be a cycle)
  and it must not call screenFor(anotherName)
      (that consults the overrides, so it could call itself)
  so the app hands the built-in renderer in once, at boot:
      setBuiltinRenderer((name, ...args) => ui.builtinScreen(name, ...args))
  and the screen asks:   builtin('viewPack', b)
  ```

  `builtinScreen` reads the generated registry and ignores every override, which
  is exactly the right meaning: *draw me the panel the way this app drew it
  before anything was converted*. Both the app and the gate install one, so a
  screen that asks for a panel that does not exist is a gate failure rather than
  an empty box.

**The gate grew a seventh claim: who drew it.** Registering a screen in the
overrides map and *rendering* it are two different claims, and only the second
one is worth anything — a name misspelt against the registry is a screen that is
listed, warns, and is quietly drawn by the old string builder forever. So
`converted` now stamps each screen's first element with `data-react="<name>"`,
centrally, in one place, because an attribute every screen has to remember is an
attribute some screen will not have; and the gate asserts the stamp appears
exactly once, that the built-in output never carries one, and that a screen which
legitimately renders nothing (the agenda, in three of six fixtures) is not
accused of it.

That check paid for itself within the hour: `.harness/browser-screens.cjs` now
walks the running app at 390px, state by state, and asks **the DOM** which
renderer answered each route. Ten routes, all ten `REACT`; six unconverted routes
(`Money › Deals`, `Money › Group`, `Legacy › Settings`, `Overview`, `Work › Career`,
`Legacy › Season`) carry no marker at all, which is what makes the marker mean
anything; no literal `&amp;` on any screen; no empty pane; 0 console errors.

**The sixth fixture, and the second real defect it found in my ports.** Every
fixture until now gave the player no assets and no second company, so the
portfolio table was empty and the company switcher had nothing to switch
between — five states "agreeing" about a table nobody had filled. The new state
buys into every asset and takes on a second company, and it immediately caught
this, in Governance:

```
the text read differently from character 13:
  built-in: …Which companyTestco 100%Secondco 100%Management accou…
  React   : …Which company Testco 100% Secondco 100%Management acc…
```

The built-in adds a space only *when* the company has something open against it,
as the separator belonging to the dot (`'<span class="dot"></span> '`); my port
had written the space unconditionally, so every clean company's name gained a
leading space. A player reads that. It is fixed, and the lesson is the same one
§22.27 ended on, twice over: *a fixture comfortably inside a branch cannot see
the branch, and a fixture that never reaches the populated state is a comparison
against emptiness.*

**Also this batch:** `viewAgenda` was reached through the seam the whole time —
it is one of the 28 names core asks the host for by name — so the conversion is
mounted in three places (Work's top, and inside Overview and Levers, where the
unconverted screens still call their own copy, as they should).

**State of the migration:** 10 of 29 routed screens in React; 12 `.jsx` files in
`apps/web/screens/` plus `index.jsx` and `runtime.js`; the single file untouched
at **1,030,986 chars · 644/648 statements · 1 declared deletion · 26 declared
changes**; zip 313,206 bytes; **32 gates · 32 passed · ALL GATES CLEAN**.

---

### 22.29 Twelve screens, and a gate that now asserts its own reach

**Converted now:** the ten from §22.28 plus `viewCommitments` · `viewWorkingCapital`
— **12 of the 29 routed screens**, and the gate compares all twelve in **seven**
fixture states.

Both new screens are cards inside Work › Business rather than routes of their
own, which makes them the first conversions the browser walk had to reach by a
different door. It does: after the walk has started a company, `Work › Business`
is checked for the cards as well as the screen (see below).

**The seventh fixture, and why it exists.** `viewCommitments` has exactly one
control — *Abandon* — and it exists only for a build that is still arriving.
Six fixtures with no build in flight compared the card's opening paragraph and
never its button; the coverage line said `0 controls`, which is the signal this
project has learned to read. The new state places a build in flight (a location
with three quarters to run, and a cold room due now), puts one person on notice
and one still ramping, and squeezes working capital — under-funded shelf,
payables past 45 days, cash smaller than half the growth bill. One fixture, and
`viewCommitments` goes from 0 controls to 2 and `viewWorkingCapital` from 51
figures to 72.

**Then the gate was taught to assert its own reach, because that keeps
happening.** Three separate times a fixture that never drew the interesting
branch "agreed" with itself and printed a pass: the Wary threshold (§22.27), the
empty portfolio table and the empty company switcher (§22.28). Waiting to be
caught by the next accident is not a method. So `.harness/react-screen.js` now
carries a `REACH` table — screen, fixture, phrase, plain-English label — and
fails if a named fixture does not show the phrase it is there for:

```
viewWorkingCapital · thin working capital · the amber bill-for-growth box
viewCommitments    · thin working capital · the Abandon control
viewMoneyBudget    · overspending          · the overspend warning
viewMoneyPosition  · in debt, both kinds   · the Repay controls
viewRival          · trading               · a named relationship
viewInvestPortfolio· portfolio held        · a held asset
viewGovernance     · portfolio held        · the company switcher
```

12 entries, all reached. Its teeth were proved the way every claim in this
migration has been: one entry was pointed at a phrase that does not exist
(`Give up on this` instead of `Abandon`), the gate failed with *"this fixture was
supposed to reach the Abandon control, and the built-in screen does not show it —
the comparison is weaker than it looks"*, and the file was restored.

**The browser walk, at 390px, against the running app:**

```
screens served by React: viewMoneyBudget, viewMoneyPosition, viewMoneyProperty,
  viewRival, viewLedgerChronicle, viewLevers, viewAgenda, viewInvestPortfolio,
  viewPeople, viewGovernance, viewCommitments, viewWorkingCapital

Money › budget        viewMoneyBudget       REACT       765 ch
Money › position      viewMoneyPosition     REACT       702 ch
Money › property      viewMoneyProperty     REACT      1189 ch
Money › markets       viewInvestPortfolio   REACT      2259 ch
Work › levers         viewLevers            REACT      2781 ch
Work › rival          viewRival             REACT       162 ch
Work › business       viewAgenda            REACT      5060 ch  agenda card present
Legacy › people       viewPeople            REACT      1787 ch
Legacy › chronicle    viewLedgerChronicle   REACT       968 ch
Governance            viewGovernance        REACT      1075 ch
Work › business       viewAgenda / viewCommitments / viewWorkingCapital   (cards)

Money › deals · Money › group · Legacy › settings · Overview · Work › career ·
Legacy › season — built-in, no marker
```

`.harness/browser-screens.cjs` drives that walk with real player actions — pick a
city, a profile and a tier, advance two quarters, then reach a company the only
way a poor player can: **With partner**, because on Apprentice in Lagos every
*Start alone* is disabled with the shortfall stated on it. It is worth recording
that this is the door the walk had to find, and that it exercises the partner
modal on the way in.

Two smaller things fixed while here: `view-agenda.jsx` was still importing `S`
and `esc` (the last of the `esc()`-on-a-child cleanup, and a conversion is not
allowed to carry a rule it no longer follows), and the walk's summary line now
counts what it saw rather than saying "all ten", which stopped being true an
afternoon after it was written.

**State:** 12 of 29 routed screens in React · the single file untouched at
**1,030,986 chars · 644/648 statements · 1 declared deletion · 26 declared
changes** · zip 313,206 bytes · **32 gates · 32 passed · ALL GATES CLEAN**.

---

### 22.30 Fifteen screens, a gate that reads dropdowns, and a collapsed group that explained itself

**Converted now:** the twelve from §22.29 plus `viewStaffDeep` · `viewContracts` ·
`viewOutlets` — **15 of the 29 routed screens**, compared in seven fixture states,
and all sixteen converted units (ten routes plus six cards) proven to be serving
in the running app at 390px.

**The gate learned a seventh thing to compare: dropdowns.** `viewStaffDeep` is
the first converted screen with `<select>` elements — each person's role and the
unit they are assigned to. Until this screen, the gate read `input` elements and
anything carrying `data-a`, and a select is neither: its attributes are
`data-role` and `data-outlet`. So a conversion could have shipped with every role
dropdown pointing at the wrong person, or missing an option, and the comparison
would have printed a pass. It now compares each select's target attribute, its
selected value **and its whole option list**, as a multiset. Proved by mutation:
changing one option label from `— none —` to `— unassigned —` and, separately,
deleting the rule that offers *General manager* only to someone at skill 6 or
better — both caught, the second as
`missing from React: data-role=st46 | selected=ops | ops:Operations · … · gm:General manager`.

**`REACH` grew to 20 entries.** The fixture from §22.29 was enriched until it
reaches what these three screens exist for: two units (so *Close unit* exists at
all), one lease with a quarter left and one already due — two branches of one
line — somebody at skill 7 (the only way *Make GM* appears), two live contracts
normalised through core's own `normaliseContract` so they are the shape the
engine writes, one with a quarter to run and one with three. The census then
failed on the first run, correctly: *"this fixture was supposed to reach a live
contract with its walk-away control, and the built-in screen does not show it."*

**And the gate caught a word order.** In `viewOutlets` the disabled reason has to
read `Needs ₦4.98m in the company to open in Abuja · it has ₦849k · short ₦4.13m`;
my port appended the city to the end of the sentence. Same three numbers, one
different sentence, and a player reads the sentence. Fixed.

**The thing worth remembering: a collapsed group is not in the markup.**
The browser walk reported `viewStaffDeep`, `viewContracts` and `viewOutlets` as
*not* coming from React, on a route where the gate proved they render. Four
theories later — stale Next bundle, stale `.next`, a rejected override, a
throw — the answer was in `sect()`: a group with `open: 0` emits **its header and
nothing else**, because the header is a switch that re-renders the route with the
group open. The three cards live in *Where you trade* and *The people*, both
closed by default, so they were never in the DOM to carry a marker, and neither
was the built-in version of them. The walk now taps every collapsed header before
asking (the way a player does), and the header meanwhile carries the members' key
figures — `0 staff · ₦0/mo`, `1 · ₦723k/q rent · 0 live` — which is what keeps a
closed group honest rather than merely hidden.

That also means the conversion of these three screens is *invisible* until the
group is opened, and it correctly says so: a screen behind a disclosure is not a
screen a marker can see, and the walk now opens what a player would open.

**State:** 15 of 29 routed screens in React · the single file untouched at
**1,030,986 chars · 644/648 statements · 1 declared deletion · 26 declared
changes** · zip 313,206 bytes · **32 gates · 32 passed · ALL GATES CLEAN** · the
dev server restarted clean (`.next` wiped) and serving on 0.0.0.0:3007.

---

### 22.31 A bug that had been in the game its whole life, and four more screens

**Converted now:** 19 of the 29 routed screens — the fifteen from §22.30 plus
`viewLegacy` · `viewLedgerSettings` · `viewInvestMarkets` · `viewOverview`.
Twenty units (14 routes + 6 cards) are proven to serve from React in the running
app at 390px, with **no page errors** and no literal `&amp;` anywhere.

#### 1. The Install button was unreachable — and it was unreachable in the original file too

`viewLedgerSettings()` renders the Install button with `style="display:none"`
while no install prompt is outstanding:

```
'<button class="btn sm primary" data-a="installapp"' + (_installEvt ? '' : ' style="display:none"') + '>Install app</button>'
```

Two listeners were supposed to reveal it, by looking up an element:

```
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); _installEvt = ev;
  var b = document.getElementById('installBtn'); if(b) b.style.display = ''; });
if(_installEvt){ var b = document.getElementById('installBtn'); if(b) b.style.display=''; }   // in boot()
```

**No element in the game has ever had the id `installBtn`.** Both lookups are
guarded by `if (b)`, so both did nothing, silently, forever. On any browser that
can install the game, Settings showed an Install heading, a note, and no button
— which is indistinguishable from a feature nobody built. It is in
`reference/baseline-single-file.html` exactly as it is here, so this is a bug the
conversion *found*, not one it caused.

**Fixed properly, in three parts, because there were three faults:**

1. **The state was never re-rendered.** The screen already renders correctly
   from `_installEvt`; what was missing was anything that would make it render
   again when that changed. Both listeners now call `render()` and the boot-time
   poke is deleted — there is nothing left to poke.
2. **The built-in shipped an invisible control.** It now omits the button when
   there is no prompt, instead of emitting it hidden. A control that does not
   exist cannot be found; a control that exists and cannot be seen is a missing
   feature wearing a disguise.
3. **The screen needed a fact about its platform.** The prompt is a browser
   event; the simulation has no business holding it, and a React screen has no
   DOM node to poke. So `installAvailable()` is now a named export of
   `@ledger/ui`, and the app hands it to its own screens at boot through
   `setPlatformFacts({ canInstall, canScan })` — the same seam shape as
   `setBuiltinRenderer`. A converted Settings screen renders from one reading.

**And three separate pieces of this project would have hidden it, so all three
were fixed too:**

- **`.harness/dom.js` swallowed every listener.** Its window was
  `{ addEventListener(){} }` — one line, and it meant no test in the suite could
  ever fire `beforeinstallprompt`, `appinstalled`, or the service-worker hook.
  A harness that silently drops the code under test is worse than no harness,
  because the suite still prints CLEAN. The window now records what is
  registered and can dispatch.
- **`@ledger/ui`'s entry did not export the name.** `export * from './registry.js'`
  carries the registry's own two exports (`exported`, `screenNames`) and *not*
  the four hundred names inside them — and the comment above it claimed the
  opposite. The app called `ui.installAvailable()` and got
  `undefined is not a function`, four times, on every render of the screen.
  `installAvailable` is now declared in the entry file, and the comment says
  what the star actually does.
- **The browser walk printed page errors and passed anyway.** It reported
  "console errors: 4" and still summarised "no empty pane". A page error is the
  app failing to run: the walk now fails on any, and exits non-zero when it has
  problems.

**Proven, not asserted.** `.harness/react-screen.js` compares the install branch
in both directions: with no prompt neither renderer offers the button, with one
both do — and a mutation that made the converted screen ignore the fact was
caught (`the converted Settings does not offer Install while a prompt is
outstanding (0)`). `.harness/browser-screens.cjs` fires the real
`beforeinstallprompt` event at the running app and reads the DOM:

```
Legacy › settings   (Install button)   WORKS   absent → Install app → absent
```

#### 2. The ledger can no longer rot, and an unexplained addition fails the build

The statement ledger compares the bundle against the original file and fails on
anything nobody wrote down — but its escape hatch was the declared list itself,
and a declaration could quietly stop being true. Edit a statement a second time
and its old `now` text stays in `changes.json` explaining a difference that no
longer exists, while the *new* difference is explained by nothing; because the
old text was declared, the `missing` check stayed silent. That is exactly what
happened to the install-prompt listeners while this fix was being written, and
the ledger said **644 · 649 · LOST (0) · every other statement is present,
character for character.**

Two invariants close it:

```
ROTTED DECLARATIONS (n):  a declared "now" is not in the bundle any more (or a
                           declared "was" is not in the reference)
new statements in the bundle: n   → now a failure, not a note
```

`node tools/declared-changes.mjs` re-transcribes the whole list from the two
files (it is the tool that pulls `was`/`now` out of the source rather than
typing them by hand); it is now wired into `tools/rebuild.sh`, so the
declaration list is regenerated on every build and a marker that has been
renamed or deleted stops the build instead of drifting. Proven by mutation:
corrupting one declaration → **exit 1, ROTTED DECLARATIONS (1)**; appending one
undeclared function → **exit 1**; appending a comment → exit 0 with
`comments rewritten` (a comment is a note to the reader, not a change to the
game).

**Current ledger: reference 644 · bundle 649 · 1 declared deletion · 28 declared
changes · 0 lost · every other statement present once, character for character.**

#### 3. The gate reads what a player can see

`read()` now ignores anything inside `display:none` / `visibility:hidden` /
`hidden` — for controls, headings, and for the text. A gate that counts hidden
markup can be satisfied by a screen no player can use, and it reported the
install-branch difference as a *missing control*: the built-in emitted the
button hidden, the port omitted it. That is the one thing this gate must never
be wrong about, wrong for a reason that had nothing to do with the conversion.
Fixed on both sides: the built-in stopped emitting an unreachable control, and
the gate stopped reading one.

#### 4. The four screens

- **`viewLegacy`** — ambition, the five constituencies, the scoreboard that
  matters at 65, and posterity. Three colour rules (`chip` green at 100 / red
  below 50, the bar green at 100 / accent below, a constituency green at 60 /
  accent at 35) now sit next to the things they colour, instead of in two
  different places as they were.
- **`viewLedgerSettings`** — the screen above. Three save slots, the difficulty
  table, the city, the tips, and the portable save string, kept in place: whether
  a run should be portable at all is a product decision, and a conversion may
  not answer it by deleting the box.
- **`viewInvestMarkets`** — the market grouped by asset class, the macro
  picture, the news, and how returns work. The amount input keeps its
  `id="amt_<asset>"`, because the buy handler reads the value back out of the
  DOM by that id and a converted screen may not break a handler it does not own.
  **Fixed while converting:** the string version never closed the Markets card,
  so every card after it nested inside it and any depth-based walk of the page
  swallowed the ones before it.
- **`viewOverview`** — the opening screen, and the first converted screen to have
  a **converted screen inside it**: `threadStrip()` and `bigStat()` are core's,
  `viewPulse()` and `viewPressure()` come through `builtin()`, and the agenda is
  imported as a component (`import ViewAgenda from './view-agenda.jsx'`).
  A converted screen may depend on another converted screen; the rule that
  forbids reaching into `@ledger/ui` exists because that package is the caller.

#### 5. The fixtures' reach is asserted

`REACH` is 29 entries now, including the two new branches that only exist in one
fixture each: `viewInvestMarkets` shows `holding …` only where something is
held, and `viewOverview` shows `Waiting on you` only where the nested agenda has
something to say.

**State:** 19 of 29 routed screens in React · single file untouched at
**1,030,986 chars** · ledger **644 / 649, 0 lost, 1 deletion, 28 declared
changes** · zip **313,791 bytes** · **32 gates · 32 passed · ALL GATES CLEAN** ·
dev server on 0.0.0.0:3007, started with a wiped `.next` (a stale compile served
`ui.installAvailable is not a function` from a cache that predated the export —
worth remembering, because the symptom looks exactly like a wiring bug).

---

### 22.32 Twenty-one screens, and a third piece of dead code found on the way

**Converted now:** the nineteen from §22.31 plus `viewCareer` ·
`viewCareerRecord` — **21 of the 29 routed screens**. Twenty-two units (16 routes
+ 6 cards) are proven to serve from React in the running app at 390px: no page
errors, no literal `&amp;`, no empty pane.

- **`viewCareer`** is the screen where a control's enabledness is a two-part
  question (is it open to you yet · can you afford it) and the card carries a
  third (do you have the hours). The string version answered all three with one
  nested ternary on the button; it is now a named expression and a sentence a
  reader can check — `Not open to you yet: <hint>`, or
  `Costs ₦x · you have ₦y · short ₦z`. An action that overspends the quarter's
  hours is *not* disabled: it says how many hours it borrows from sleep, which is
  what the hours system is for.
- **`viewCareerRecord`** keeps the two readings that are easy to get subtly
  wrong: the experience bar is drawn **dim at 45 when there is no rating yet**
  (a bar at zero and a bar with no answer are different things), and the run
  list's left border is the same colour with the same meaning as the chip beside
  the rank. The tier sentence prints `MAX_RUNS` from the constant the profile
  actually trims to, so it cannot go stale.

#### Dead code, found and accounted for rather than deleted

`viewDash()` — the old dashboard, in `packages/ui/src/05-view-dash.js` — **has no
callers anywhere in the codebase.** Not in the router, not from another screen,
not from the harness build. It joins `viewWork()` (recorded as dead in §22.24)
and `viewLife()` (dead, reserved, recorded in the same place). Per the rule that
nothing is deleted without being accounted for first, it is recorded here rather
than removed: **a candidate for the next deletion pass, with the same file-by-file
evidence §22.24 used** — what it was, what replaced it, and the grep that proves
nothing reaches it. It is not deleted in this batch because the next deletion
pass should also carry the two cards it draws (they are `viewPulse`/`viewPressure`
material, and one of them may still be reachable from Overview — which is exactly
the kind of thing to check with the ledger in front of you, not in a hurry).

#### The shape of the remaining work

```
converted : 21 of 29 routed screens  ·  16 routes + 6 cards served by React
left      : viewDeals · viewSeason · viewHousehold · viewEngine · viewGroup · viewBiz
            (4.1KB · 4.1KB · 7.7KB · 8.5KB · 12.1KB · 16.9KB)
dead      : viewWork · viewLife (reserved) · viewDash — none reachable from the router
then      : render() becomes a store subscription; React Native last
```

**State:** single file untouched at **1,030,986 chars** · ledger **644 / 649 ·
0 lost · 1 declared deletion · 28 declared changes** · zip **313,791 bytes** ·
**32 gates · 32 passed · ALL GATES CLEAN**.

---

### 22.33 The gate that was found by looking at a screenshot

Every structural gate in this suite compares the game to itself. `react-screen`
asks whether the port says what the string version said; the ledger asks whether
every statement of the original is still in the bundle; the walk asks whether
every converted screen answers from React. **They all passed while the opening
screen printed this:**

```
Living + debt     \u2212₹688k
```

One line in `viewPulse()` had **two backslashes** before `u2212`:

```
h += '...<span class="mono bad">\\\\u2212'+fmt(exp)+'</span></div>';
```

In JavaScript that is an escaped backslash followed by the four characters
`u2212`, so the minus sign was never drawn — it was printed, on the Overview,
the first screen of the game, for the whole life of the single file. **Fourteen
other lines in the same file spell the same escape correctly**, which is what
makes it a typo and not a decision. (The second `Living + debt` line, on the
budget screen, spells it correctly with a literal `−`.)

Nothing caught it because no gate was asking whether the text on a screen is
text a human would read. `react-screen` compared the two renderers and both
rendered the same wrong thing; the ledger compares statements and this statement
was present, character for character.

**It was found by taking a screenshot and looking at it.** That is the lesson,
and it is the third time in this migration that a gate has been confident about
something it had never actually read — so it now has a gate of its own.

#### `.harness/escapes.js` — a new gate, 33rd in the suite

It asks the question directly, twice over, because the two halves catch different
things:

1. **every route the router can produce is rendered and its text scanned** for
   `\uXXXX`, `\n`, `\t` — twenty routes plus the start screen, the season screen,
   the chronicle and the career record. On the mutated game it prints where the
   player is being shown an escape and what surrounds it:
   `near "Business P&L -₦814k  Living + debt  \u2212₦688k  Net  -₦…"`;
2. **the sections' own source is scanned** for a backslash-doubled letter, which
   also covers modals, cards and log lines no fixture reaches. This half is what
   caught the mutation first, before the build even regenerated.

**Proven by mutation, both halves:** re-introducing the exact typo fails the gate
(source scan: `packages/ui/src/02-view-overview.js:84`) and fails the rendered
scan (`overview: the player is shown "\u2212" as text`), exit 1; the fix restores
`ESCAPES CLEAN`. A fixture that rendered nothing at all would have passed
silently — which is why the rendered half prints its route count (`20 routes
clean`) rather than only its verdict.

#### Three findings while making the fix honest

- **The composition existed in two places, and the check for it was circular.**
  `tools/declared-changes.mjs` read `dist/index.html` for its "now" side — the
  *built* file — while the build refused to finish until the declarations were
  un-rotted. The transcription therefore silently depended on the order of the
  steps in `tools/rebuild.sh`: run it before the bundle and it transcribes
  yesterday's script and declares that as today's intent. The composition of the
  game now lives in one place, **`tools/compose.mjs`**, which both tools read.
  The transcriber no longer needs a build to have happened, and the build still
  checks the declaration against the built file, which is the claim worth making.
- **A build was reporting on a file it no longer wrote.** Pulling the
  composition out of `bundle.mjs` silently dropped its two `fs.writeFileSync`
  calls: the build kept printing `bundle : dist/index.html 1,032,337 chars` while
  `dist/index.html` and `ledger/index.html` were never touched, and the statement
  ledger said clean — because the ledger compares the *sections* to the original
  and had never once looked at the file the player is served. The served copy
  could have drifted arbitrarily far from the source and the ledger would still
  have printed `every other statement is present, once, character for character`.
  The build now reads both files back and compares them to what it composed:
  `on disk : dist/index.html and ledger/index.html hold exactly what was composed,
  byte for byte`, and when they differ it says exactly that and exits 1 — proven
  by editing a section while removing the write (`dist/index.html is 1,032,337
  chars, composed 1,032,344`).
  *Its limit, stated rather than implied:* it catches the on-disk file disagreeing
  with the composition. A skipped write when nothing changed produces a file that
  is still correct, and no check on content can see that — which is fine, because
  nothing observable is wrong with the game in that case.
- **The screenshot driver is now a tool people can run.** `.harness/shots.cjs`
  plays into a run, accepts the services company offer, advances a quarter and
  captures Overview · Work › Career · Legacy › Settings · Work › Business at
  390px, so "does it look right" is a command rather than a memory. It asserts
  nothing on purpose — `.harness/browser-screens.cjs` is the check. The two are
  different instruments and should not be folded together.

**State:** 21 of 29 routed screens in React · 22 units (16 routes + 6 cards)
answering from React in the live app · single file **1,032,337 chars** · ledger
**644 / 649 · 0 lost · 1 declared deletion · 29 declared changes** · zip
**313,786 bytes** · **33 gates · 33 passed · 0 failed · ALL GATES CLEAN** ·
server on 0.0.0.0:3007 (fresh `.next`, curl 200).

---

### 22.34 The app draws the route — a state change stops rebuilding the page

Step 4 had two halves. The first was **the screens**: converting them one name at
a time behind `host.view(name)`, 21 of 29 done, each proved against the screen it
replaced. The second is this one, and it is the half that changes what the game
*is*: **a route whose every screen is React is drawn by the app as one React
tree, and a change of state re-renders that tree in place instead of replacing
`#main`'s markup.**

React owns the page and the shell; core still owns the simulation, the router,
the event model and the render loop. Nothing about that changed. What changed is
who fills the container on a converted route — and that a redraw no longer throws
away the page's focus, selection, scroll position and half-typed figures.

```
core: render()
  +- recompute · renderTop · renderTabs        (unchanged, markup)
  +- the route:
  |    if (!appDrawsRoute()) Q('main').innerHTML = routeView()      <- one line
  |    else the app re-renders the tree it already has
  +- renderModal · bindInputs · applyDisclosure · scroll · focus     (all unchanged)
```

#### The seam, and why it is where it is

- **`setAppRoute` / `appDrawsRoute` / `releaseAppRoute`** in `packages/ui/src/03-render.js`.
  The ui asks the app on every render. The single file has no app, `APP_ROUTE` is
  null, `appDrawsRoute()` returns false, and `render()` writes markup exactly as
  it always has. The delegation costs one call.
- **`routeOwnership()` in `@ledger/ui`** decides whether the app may draw: every
  screen on the route converted, none called with arguments, and **nothing left
  for core to group**. That last one is the load-bearing condition — `groupRoute()`
  parses the route's *markup* and rearranges cards into collapsible sections, and
  a React tree cannot be handed to it. A grouped route keeps the string path,
  which is why `Work › Business` is still markup with eight converted screens in
  it. **Making grouping a component is the next unit of work, not an afterthought.**
- **`asked`, not a second list.** `routeOwnership()` gets the route's screen names
  by composing the route through `routeViewInner()` with the host answering
  nothing — each screen call arrives as `host.view(name)` and is recorded instead
  of drawn. Right answer, no screen runs, and there is no hand-kept table of
  which screens make up which route to fall out of step with the router.
- **`setRouteDrawer(drawRoute)`** is the app's side: createRoot on `#main`, render
  the names, `flushSync` so the DOM exists when `render()` returns (the host
  contract is synchronous; React 19 is concurrent by default, and without flush
  `render()` would be a lie). Called with `null` means the container is wanted
  back — the app unmounts **and clears its own claim on the container**, because a
  React root whose nodes were replaced behind its back is a crash waiting for the
  next click, and `data-react-route` left on a route the string builder just drew
  is a false claim in the DOM.
- **`releaseAppRoute()`** is called by the two places that write markup into
  `#main` directly: `render()` on an unconverted route, and `renderStart()`.

#### One wrapper per screen, and it is not a box

Each screen the app draws sits in `<div data-react="viewX" style="display:contents">`.
The wrapper exists so the stamp cannot be wrong: **a screen may legitimately render
more than one top-level element** — `viewLevers` emits four columns and then the
card that explains them — so stamping "the i-th child" would silently mislabel
every screen after the first. A wrapper cannot be wrong. And `display: contents`
means the wrapper generates no box, so the route's geometry is exactly what it
would have been without it. Verified by eye on three React-owned routes at 390px.

#### The gate: `.harness/react-route.js` — 34th in the suite

Three claims:

1. **The boundary is the one written down.** The gate keeps its own table of the
   **29 routes** the router can produce — bare tabs included, because `UI.tab` is
   global and a stale sub-tab is deliberately tolerated rather than refused — and
   fails if reality moves and the table does not. It also walks `subsFor()` for
   every tab and fails on any route the router can reach that the table omits.
2. **The stated reason is the true one.** `routeOwnership()` returns `why`, and a
   reason nobody checks is decoration: the gate recomputes all three conditions
   from core's own facts and requires the reason to name the one that actually
   fails.
3. **The page survives a state change.** On a route React draws, the element
   captured before an action is *the same object* afterwards and its text has
   moved on. On a route the string builder draws, the same experiment gives the
   **opposite** answer — which is what makes this a test rather than a mood: the
   two paths are distinguishable, and the gate proves it can tell them apart.

**Result: 13 of the 29 routes are drawn by React, 16 by markup, every reason
true, and the reason for each of the 16 is the condition that actually fails:**

```
React  (13): money · legacy · governance · governance/board · governance/votes ·
             governance/deed · governance/bids · work/rival · work/levers ·
             money/budget · money/property · legacy/chronicle · legacy/record
markup (16): every grouped route - overview, work, work/business, work/career,
             work/life, money/position, money/markets, money/deals, money/group,
             legacy/people, legacy/ambition, legacy/settings - plus the four
             with a screen nobody has converted yet: work/household,
             legacy/season, governance/pack, governance/register
```

Read that table and the next unit of work is obvious: **eleven of the sixteen
are grouped routes.** `groupRoute()` is what stands between this app and drawing
Work › Business — eight converted screens, the biggest screen in the game, still
assembled from markup.

Thirteen, not the five the probe first suggested, because a bare tab is a route
too: `UI.tab` is global, a sub-tab from another tab is deliberately tolerated
rather than refused, and `money` on its own is a legitimate destination whose
default screen is React. That is exactly the kind of thing a written-down table
catches and a derived one would have agreed with.

#### What the gate caught, immediately

- **`data-react-route` was never cleared on release.** The app unmounted, but the
  container went on claiming React drew it. The stamp is on the *container*, so
  replacing the container's contents does not remove it — an attribute that
  outlives its truth. The drawer now remembers the container it owns and clears
  the claim when it lets go.
- **Two of the gate's own assertions were wrong**, which is worth recording
  because a gate that is wrong for the right reason is still wrong: a style set
  through React is not `style="display:contents"` with a semicolon in the
  attribute, and `#main` legitimately *does* keep its contents after the app
  releases it — the string builder writes over them a line later.

#### In the live app

`.harness/browser-screens.cjs` now reads `data-react-route` off `#main` on every
route and checks it against the wrappers present (a stamp with no wrapper behind
it is a sentence with nothing behind it), and drives the phase's own claim in the
browser:

```
  Legacy › settings       (Install button)      WORKS      absent → Install app → absent
  Money › budget          (reactivity)          IN PLACE   route viewMoneyBudget
all 22 converted screens answered by React (16 routes + 6 cards) · 3 unconverted routes
carried no marker · a quarter advanced on a React route without rebuilding the page ·
no literal &amp; · no empty pane · no page error
console errors: 0
```

**State:** 21 of 29 screens converted · **13 of 29 routes drawn by the app whole**
· single file **1,035,076 chars** · ledger **644 / 653 · 0 lost · 1 declared
deletion · 35 declared changes (10 additions)** · zip **314,910 bytes** ·
**34 gates · 34 passed · 0 failed · ALL GATES CLEAN** · dev server on 0.0.0.0:3007.

**Next:** `groupRoute()` as a component would take the grouped routes back —
`Work › Business` is eight converted screens still drawn as markup because of it,
and it is the largest single win left. Then `viewPulse`, `viewPressure`,
`viewSeason`, `viewDeals`, `viewHousehold`, `viewEngine`, `viewGroup`, `viewBiz`.

---

### 22.35 Grouping becomes a component — the Overview is drawn by React whole

The last unit kept eleven of the twenty-nine routes on the string path for one
reason: **`groupRoute()` parses the route's markup.** It matches each top-level
card's heading against the route's spec and rebuilds the string with
`<div class="card sect">` wrappers around the members. That is post-processing on
a string, and a React tree cannot be handed to it — so `Work › Business` was
eight converted screens still assembled from markup, `money/position` was a
converted screen with section headers drawn by core, and so on.

Grouping is now a component. A converted screen that arranges its own sections
renders

```jsx
<Group route="overview" i={2}>
  <ViewPulse />
  <ViewPressure />
</Group>
```

and `apps/web/screens/group.jsx` draws exactly what `sect()` drew: the same
wrapper classes, the same header button with the same `data-a="toggrp"` and the
same `data-k="overview.2"` (so core's toggle handler works untouched), the same
chevron, the same member count when there is more than one, the same promoted key
figures on a collapsed header, the same note, and **no body at all when it is
collapsed** — a collapsed group's cards are not in the markup, which is the
behaviour that confused this project's own walks for a whole cycle.

**The spec stays core's.** Title, note, whether it starts open, how many members
it has and which cards belong to it all come from `ROUTE_GROUPS`: the spec says
what groups exist, the port says where they sit. And the app *declares* the routes
it arranges itself (`setAppGroups(['overview'])`), which is what makes
`routeOwnership()` stop refusing a grouped route; a route is listed only when
every section on it is a `<Group>` in a converted screen.

- **`Overview` is now drawn by React whole — 14 of the 29 routes** — and it is the
  first screen in the game that arranges its own sections, nesting them exactly as
  the string path did (the quarter and background sections inside their `grid g2`
  wrappers, which is why both renderers agree card for card).
- **`viewPulse` and `viewPressure` are converted too**, because Overview's
  sections had to own their members. So is the quiet detail that had been wrong
  since the beginning: `Living + debt` prints a real **U+2212** now rather than a
  literal `\u2212` (§22.33).

#### The gate, and the three bugs it found in its first hour

`.harness/react-route.js` compares **the route the app draws** with **the route
the game draws**, on the same state in the same process: sections (key, title,
count, promoted tags, note, open), the cards inside them in order, every control
with its `data-*`, the money figures, and the whole text. The other leg is
produced by emptying the override map and un-declaring the grouped routes.

Three real defects, none of which any existing gate could have seen:

1. **The disclosure chrome stacked.** `applyDisclosure()` appends a chevron to
   every heading, moves the card's contents into a `.discbody` and inserts an
   Expand all / Collapse all row at the top of the page. It had only ever run on a
   container whose contents were replaced by `innerHTML` on every render, so it
   never had a way to run twice — and on the React path the container is
   re-rendered **in place**, on purpose. Four renders on the Overview put four
   chevrons in one heading (*"Where you stand Lagos ▾▾▾▾"*) and four Expand-all
   rows on the page, each card one wrapper deeper than the last. Worse, moving a
   node React owns into a wrapper of our own making is the one thing a React tree
   cannot survive: React removes a child through the parent it mounted it in.
   `releaseDisclosure()` now runs **before React patches** and puts the container
   back exactly as React left it — bodies unwrapped, chevrons gone, attributes
   gone — and `applyDisclosure()` starts by calling it, so it is idempotent by
   construction. The player's open/closed state is untouched: it lives in
   `UI.collapsed`, not in the DOM.
2. **An empty section was drawn.** With nothing waiting on you the agenda renders
   nothing, and the port wrapped it anyway — a header saying *Waiting on you* over
   an empty body, on the first screen of the game. The string path never emitted
   a group with no members. Fixed in `Group` (no members, no section) **and** at
   the composition site (`hasAgenda()`), because the two are different failures:
   one is the component being wrong, the other is the port claiming a section it
   does not have.
3. **A gate that could not reach the state it was about, twice.** The route
   comparison passed while the empty section existed, because its fixture always
   had a company and therefore always had an agenda; it now runs in **two states**
   — with a company, and a fresh run where nothing is waiting — and fails loudly
   on both counts (`section "Waiting on you" is open and holds no cards`). The
   browser walk's chrome check passed too, reporting `STABLE 0 chevrons` — it was
   counting on a route with no disclosure chrome at all; it now runs on the
   Overview and fails if it finds no chrome to stack.

**Proven by mutation.** Restoring the un-released disclosure (`releaseDisclosure`
returns 0) makes the walk report `STACKED 22 chevrons / 7 tool rows` against 5
headings, and fails. Composing the agenda group unconditionally makes the route
gate fail with the empty section and the section-key shift it causes.

**Also corrected:** `.harness/react-screen.js`, the per-screen gate, now compares
a self-grouped screen against **the grouped panel** (`groupRoute(M[name](), key)`)
rather than the raw one — otherwise it demanded that a port arranging its own
sections also reproduce section headers it was not responsible for, and reported
the cards a collapsed section correctly does not render as missing.

**State:** 21 of 29 screens converted · **14 of 29 routes drawn by React whole** ·
**1 route arranged by the app** (`overview`: 4 sections, 4 cards, 8 controls, 6
money figures, identical to the game's own rendering in both fixtures) · single
file **1,037,956 chars** · ledger **644 / 654 · 0 lost · 1 declared deletion ·
37 declared changes** · zip **315,890 bytes** · **34 gates · 34 passed · ALL
GATES CLEAN** · dev server on 0.0.0.0:3007, curl 200.

**Next:** the same move on the other ten grouped routes — each one needs its
screen(s) converted and then its sections arranged by hand, `Work › Business`
first (eight converted screens, four sections) — then `viewSeason`, `viewHousehold`,
`viewDeals`, `viewEngine`, `viewGroup`, `viewBiz`; then `renderTop`,
`renderTabs` and the modal as components, at which point `render()` stops being a
markup writer at all and the imperative path exists only for the single file.

---

### 22.36 Grouping in the screens — 20 of 29 routes now drawn by React

Six more routes arrange their own sections, taking the count from 14 to **20 of
29** and leaving only the routes that still hold an unconverted screen:

```
overview · money/position · money/markets · work/career ·
legacy/people · legacy/ambition · legacy/settings        ← the app arranges these
grouped but waiting on a screen:
  work/business (viewEngine · viewBiz) · money/deals (viewDeals) ·
  money/group (viewGroup) · work/life (viewHousehold)
```

**Not one line of the game changed.** This whole unit is `apps/web/screens/*.jsx`
— the sections moved into the screens that own those cards, and the ledger
confirms the rest: **644 / 654 · 0 lost · 37 declared changes**, the same numbers
as before it started. The single file is byte for byte the same size.

#### The arrangement is the same, quirks and all

Placing a section is easy; placing it where core placed it is not, because core's
matcher has two behaviours that a port can only get right by reading them:

- **A group is emitted at the level where its FIRST member was found.** So a card
  the spec names can end up *outside* the section it is named in — `Household &
  family` on Legacy › People and `Capability` on Work › Career are both named by
  a group and both sit outside it, because the section had already been claimed
  one level up. Reproduced, and the route gate compares the two arrangements
  card for card so a future reader does not have to re-derive it.
- **A card no group names stays exactly where it was, between the sections.**
  `Liabilities` on Money › Position sits between `Your money` and `How to think
  about it`, and `Borrow` — which the spec does name in the first group — is
  carried *up* past it into that group. `Position` on the screenshot is the
  string path's arrangement, not a re-imagining of it.
- **`Screen tips` on Legacy › Settings is deliberately ungrouped**, and the spec
  says why: *"it is the control that brings back the hints a player has
  dismissed, and a control that undoes a decision must never be hidden behind a
  collapsed group."* The port leaves it outside the section, with that reason in
  the code.

#### What the gates caught

- **`Group is not defined`** in two ports: the generated import was inserted by
  matching a single-line import statement, and those two files import across
  several lines. Both screens rendered *nothing at all* in the browser, which is
  what a React tree does when a component is undefined — no error a player would
  notice, an empty route. Caught by rendering them, not by reading them.
- **Two ports had a mis-nested close** (`</div>` where `</Group>` belonged). JSX
  nesting is checked by the compiler, so esbuild refused to bundle rather than
  shipping a route that renders wrong. That is the difference between this and
  the string builders it replaces: markup built by concatenation is checked by
  nothing at all.
- **`REACH` was reading the wrong body.** It checks that a fixture actually draws
  the branch a screen is interesting for — and after grouping it was reading the
  *grouped* markup, where `Legacy › Ambition`'s `The long view` starts collapsed
  and therefore legitimately hides Posterity and the will controls. It reported
  "this fixture reached nothing" about the grouping working correctly. REACH is
  about the fixture, so it now reads the screen's own markup; the comparison
  below it still reads the grouped arrangement, which is what the claim is about.
- **The gate's own table failed first, loudly** — six routes it had written down
  as markup changed hands, which is exactly what a written-down table is for:
  `route work/career is drawn by React and this gate says it should be markup`.

#### Live, at 390px

```
Money › position      viewMoneyPosition     REACT     734 ch
Money › markets       viewInvestMarkets     REACT    2259 ch
Legacy › people       viewPeople            REACT    1751 ch
Legacy › ambition     viewLegacy            REACT     536 ch
Work › career         viewCareer            REACT    1856 ch
disclosure chrome     (3 renders)           STABLE   4 chevrons / 1 tool rows
all 22 converted screens answered by React · 0 page errors · 0 console errors
```

**State:** 21 of 29 screens converted · **20 of 29 routes drawn by React whole** ·
**7 routes arranged by the app**, each compared with the game's own rendering in
two fixtures (14 comparisons, all identical) · single file **1,037,956 chars,
unchanged by this unit** · ledger **644 / 654 · 0 lost · 1 declared deletion · 37
declared changes** · zip **315,890 bytes** · **34 gates · 34 passed · ALL GATES
CLEAN** · dev server on 0.0.0.0:3007, curl 200.

**Next:** `work/business` — the largest screen in the game, eight converted
screens and four sections, blocked on `viewEngine` and `viewBiz`, which are 8.5KB
and 16.9KB of markup; then `viewDeals`, `viewGroup`, `viewHousehold`,
`viewSeason`. After that, `renderTop`/`renderTabs`/the modal as components, at
which point `render()` stops writing markup at all outside the single file.

---

### 22.37 A route is not always a list of screens — Work › Business, and 22 of 29

`viewEngine` and `viewBiz` are converted, and **Work › Business** — the largest
route in the game — is drawn by React. So is the bare **Work** tab. That takes
the count to **22 of 29 routes drawn by React, 7 by markup**, and it needed a new
idea rather than two more screens, because this route is not a list of screens:

```
core's routeViewInner(), Work:  viewAgenda + portfolioBar() + viewCommitments +
  viewWorkingCapital + viewEngine + viewOutlets + viewContracts + viewStaffDeep + viewBiz
core's grouping, work/business: The machine (4 cards from viewEngine) ·
  Where you trade (Units from viewOutlets, Contracts from viewContracts) ·
  The people (Team from viewStaffDeep) · The company (2 cards from viewBiz,
  the rest of viewBiz left ungrouped beside them)
```

A section here holds cards from **two different panels**, and the router emits
**`portfolioBar()`**, which is not a screen at all — the host is never asked for
it, so a route drawn as a list of screens silently loses the company switcher:
the only control that tells you that you own three companies, and the only way to
change which one you are looking at. Two more things a list of screens cannot
say. So the app declares the route and assembles it:

```js
export const composedRoutes = Object.keys(ROUTES);   // 'work' and 'work/business'
ui.setAppRoutes(composedRoutes);                     // routeOwnership() honours it
```

`routeOwnership()` answers for such a route with one name — the route's own —
and the drawer renders one component. The claim is the strongest one in the
project, so it is the one the gate checks hardest.

#### What was wrong, and how it was found

Widening the route comparison from *the eight grouped routes* to **every route
React draws** — 22 routes × 2 states = 44 comparisons — found three real defects
on its first run, none of which any existing gate could see:

- **The bare Work tab had no company switcher.** Explained above; it is exactly
  the class of loss the comparison exists to catch, and it was live.
- **A screen that arranges its own sections did it on *every* route it appears
  on.** Money and Money › Markets are both the Portfolio and the Markets cards,
  and core groups only `money/markets` — so the bare Money tab was drawing two
  section headers the game does not draw. Fixed in `Group`: **a section belongs
  to one route**, and a group whose route is not the current one (`routeKey()`)
  renders its children unwrapped. That is core's own behaviour, and no bare tab
  is a grouped key, so nothing else moved.
- **A section's member count was a React child count.** Core counts the members
  it *found*: `Where you trade` names `[Units, Contracts, On tender]`, but there
  is no On tender card — "On tender" is a heading *inside* the Contracts card —
  so the string path finds two members and the header says `2`. The port put
  three children in a grid of its own and said nothing. The spec was right and
  the port was wrong: the layout is the **spec's** (`layout:'g2'`, as
  `groupLevel()` does it) and the members are the cards themselves, so one child
  that is a grid is not one member. The stale third name is harmless by design —
  a card no group names stays where it was.

#### The gate is now about the route, not about the arrangement

```
route ownership   : 29 routes, 22 drawn by React
  44 comparisons across 22 routes in two states — every one of them identical
ROUTE CLEAN — 22 routes drawn by React, 7 by markup, every reason true,
              and a state change re-renders in place
```

Both legs are rendered in the same process on the same fixture: the app's route
against the game's own screens with core's own grouping (`overrideScreens` only
ever adds, so the string leg is built by deleting the keys and un-declaring the
route). Compared: sections (key, title, count, tags, note, open, members), cards,
every `data-*` control, ₦ figures and the whole text. The boundary table is
hand-written and had to move twice more (`work` → React, `work/business` → React),
which is the point of it.

**The one experiment that had to move:** "a state change replaces the page on the
markup path" used to run on Work › Business, because that is where it was true.
It is React now, so the experiment runs on Work › Household, which is still
markup. An experiment on the wrong subject proves nothing.

#### Live, at 390px

```
Work › business       (the whole route)     REACT     22 of 22 cards inside one wrapper
Money › deals         (not converted)       built-in  786 ch
Money › group         (not converted)       built-in 2156 ch
Legacy › season       (not converted)       built-in  340 ch
disclosure chrome     (3 renders)           STABLE    4 chevrons / 1 tool rows
all 17 converted screens answered by React · 0 page errors · 0 console errors
```

The walk's Work › Business rows changed shape: on a route the app assembles there
are no per-screen wrappers by design, so the claim is "every card on the route is
inside the one thing the app drew" (**22 of 22**) rather than "each card carries
a stamp". A card outside it is markup the route left behind.

#### A disabled control with no stated reason, again

`viewBiz`'s no-company path already stated its shortfall, and both ways in are
open at any price — **With partner is never disabled by cash**, because covering
a gap you cannot cover is what a partner is for (§22.23). The new screens keep
that line.

#### One defect fixed on the way past

The string version of `viewBiz` closed its layout grid early and opened the
hiring column outside it — an extra `</div>` that a browser silently ignores, so
the right-hand column rendered full width underneath instead of beside. The port
nests the column where its own comment says it goes. Re-nesting is allowed;
changing a word the player reads is not, and none changed.

**State:** 23 screens converted (21 routed + 2 panels) · **22 of 29 routes drawn
by React whole** · **8 routes arranged by the app** (7 self-grouped + Work ›
Business, assembled) · single file **1,037,956 chars, unchanged by this unit** ·
ledger **644 / 654 · 0 lost · 37 declared changes** · zip **315,890 bytes** ·
**34 gates · 34 passed · ALL GATES CLEAN (50s)** · dev server on 0.0.0.0:3007,
curl 200.

**Next:** `viewDeals` · `viewGroup` · `viewHousehold` · `viewSeason` — the last
four screens, which turn the remaining 7 markup routes into React; then
`renderTop`/`renderTabs`/the modal as components.

---

### 22.38 `viewDeals` — where the spec names a card the matcher cannot give it

The Deals screen, ported, and one behaviour of core's matcher that a reader would
not guess unless they were told:

```
ROUTE_GROUPS['money/deals']
  Live        On the table · Partnership offers
  Committed   Committed capital
  Background  How to read these · Last twelve months
```

`Partnership offers` **ends up outside `Live`.** The two cards are in different
columns of the same grid, and `groupLevel()` walks the route's markup one level
at a time: `Live` is claimed in the left column by `On the table`, and by the time
the walk reaches the right column the group is used, so `Partnership offers`
matches nothing and stays exactly where it was — in the right column, below the
`Background` section. `Last twelve months` goes the other way: it is gathered
*into* `Background` even though `Partnership offers` sits between them in the
source, because a section is emitted where its first member was found.

Both are reproduced, and the port says why in the file. A port that gathered both
partnership cards into `Live` would look tidier, would render a card in a place
the player is not used to finding it, and would put a member in a section the
game's section does not have — which is exactly what `.harness/react-route.js`
compares, card for card, in two states.

#### A screen compared only with nothing on it is half checked

Deals, offers, running commitments and deal history all live behind `S.deals`,
`S.offers`, `S.active` and `S.digest`, and **no fixture filled them** — so this
screen would have been compared only in its empty states, where the deal row, the
offer box and the commitment line are not in the markup at all. One more fixture
was added (`deals on the table, an offer, and one commitment`, seed 4249) and
five `REACH` entries hold it to it: a deal row with its odds and Commit control,
a deal somebody introduced, a partnership offer, a commitment already running,
and the history. If the fixture stops reaching any of them, the gate fails rather
than quietly comparing two "nothing here yet" paragraphs.

#### The walk's two lists moved with it

`browser-screens.cjs` keeps a list of routes nobody has converted and checks the
marker appears on none of them, and a list of routes to walk that must answer
from React. Money › Deals left the first and joined the second — and the walk
said so before it was edited (`the marker appeared on an unconverted route: Money
› deals -> viewDeals`), which is the list doing its job.

**State:** 26 converted components (22 routed screens + viewEngine, viewBiz,
viewDeals, viewPulse, viewPressure) · **23 of 29 routes drawn by React** · **9
routes arranged by the app** (7 self-grouped + Work › Business and the bare Work
tab, both assembled) · single file **1,037,956 chars, unchanged by this unit** ·
ledger **644 / 654 · 0 lost · 37 declared changes** · zip **315,890 bytes** ·
**34 gates · 34 passed · ALL GATES CLEAN (48s)** · walk **18 screens answered by
React, 2 unconverted routes clean, 0 console errors** · dev server 0.0.0.0:3007.

**Next:** `viewGroup` (money/group) · `viewHousehold` (work/household) ·
`viewSeason` (legacy/season) — the last three screens, and the route count goes
to 29 of 29 with `grouping` and `pack`/`register` (whose sections cross panel
boundaries and will need the composed-route seam).

### 22.39 — `viewGroup`, `viewHousehold`, `viewSeason`: the last three screens, and a bug found in the game by porting one of them

Three screens, three routes out of the "still markup" column, and one of them
turned up a defect in the **game** rather than in the port.

#### `viewGroup` — Money › Group, and the stray close tag

The route is grouped (`The structure` · `Moving money around` · `What the group
owes`), so the port arranges its own sections with `<Group route="money/group"
i={0|1|2}>`, and the consolidated accounts are embedded as the strings core's own
`_gcell()`/`_glabel()` build them — a nine-line P&L across every company in the
group is arithmetic, and re-typing it in JSX would be a second definition of it.

The route gate refused the first version: `text: app and game differ (2051 vs
2051 chars)`. Equal lengths and no information — so the gate's diff was fixed
first, to say **where**: character 508, app "…start to matter. *This quarter
Testco Group Revenue ₦0…*" against game "…start to matter. *Cash, debt and
reserves ▾ Entity Cash Debt…*". The consolidation table was in the card in the
app and outside it in the game.

A probe of the raw markup (`routeView()`, one company) showed why: the "One
company is not a group" note closes the card — `…matter.</div></div>` — and then
the P&L block is emitted after it, so with a single subsidiary the table and the
TTM row render **outside the card they belong to**, as ungrouped siblings between
section 0 and section 1. The trailing `</div>` after the block is the stray the
browser swallows. Two companies: the table is inside the card, as intended.

This is not an arrangement quirk to reproduce — it is a bug, and the port would
have had to encode it by rendering a card and then a table that is not in it. It
was fixed in the game: `packages/ui/src/16-view-group.js` (and the flat mirror)
close the card once, after the table, and `tools/declared-changes.mjs` carries the
statement — `viewGroup — the consolidation table stays inside the card that owns
it`. Rebuild green: **38 declared changes**, single file 1,037,956 → **1,037,950
chars**, check.js 1,011,140 → 1,011,134, zip 315,890 → **315,886 bytes** — six
bytes, which is the removed `</div>`, and nothing else moved.

The port keeps every stated reason on the six controls that can be off: a
dividend with nothing to declare out of reserves, an upstream loan from a company
holding no cash, a disabled subsidiary-to-subsidiary button that says
cross-funding comes later, and the management-charge steppers off at each end of
the 0–15% rail with the reason on the control.

#### `viewHousehold` — Work › Household

Not a grouped route, so no sections — one card for the roster and one for the
people looking for work, exactly as core draws it. The payroll block
(`housePayrollSummary()`), the three stat rows per person (`statRow()`) and the
attention bar (`bar()`) are embedded from core rather than re-drawn. The two
dropdowns — which role a person is, and who pays them — are controls and are
rendered uncontrolled (`defaultValue`), because a select with a `value` and no
change handler is a dropdown that refuses to be used; the role list is filtered
the way core filters it, keeping the role a person already has even when it can
no longer be hired for. `refreshHouseCands()` is still called on the way in.

#### `viewSeason` — Legacy › Season

One card when the run is not in a season, three when it is. `seasonStatus()`,
`scoreRun()`, `seasonRefreshLeaderboard(code)` and `cloudReady()` are called in
core's order, and the live-score sentence is kept verbatim, because a number that
looks final and is not is the worst thing a scored screen can show.

**All eight fixtures left `S.season` null**, so both renderers were being compared
on the same "not in one" paragraph eight times. A ninth fixture — `in a season,
twelve quarters from the finish line`, seed 4250 — starts a season twelve
quarters out, signs the player in (`ensureProfile().cloud`, a handle) and fills
the board cache with three rows, so the table, the `you` chip and the six axis
bars are drawn by both sides. The screen now agrees across **nine** states.

#### The string experiment moved twice, and had to be moved to a state with figures

`react-route.js` keeps one route drawn by markup to prove the two paths are
different. It ran on Work › Business, which became React; then on Work ›
Household, which became React in this unit; now on **Governance › Pack**. The
first run there failed with `nothing on governance/pack changed after a quarter
was advanced` — true, and nothing to do with the renderer: with no company on the
books that route is a page of zeroes. The experiment now sets up a company
before it measures, which is the rule the fixtures already followed.

#### The walk gained a third category, because the second one started lying

`browser-screens.cjs` had two lists: routes that must answer React, and routes
that must carry no marker. Governance › Pack and Governance › Register were moved
into the first, the walk passed, and the walk was wrong — `react-route.js` proves
those two routes are still arranged by core's grouping (`core still groups this
route's cards`). The marker is on the page because a converted screen answers
`host.view` with React markup **wherever it is asked for**, grouping or no
grouping. Two gates would have disagreed while both passing, so the walk now
checks three things separately: routes React draws whole (stamp + wrappers),
routes core still arranges whose screen is converted (screen marker, **no** route
stamp), and routes with no React screen at all (no marker). It reports
`20 routes walked answered from React (20 screens…) · 1 unconverted route carried
no marker · 2 screens answered React inside a route the game still arranges, with
no route stamp · console errors: 0`.

**State:** **29 converted screen components** · **26 of the 29 routes drawn by
React** · **10 routes arranged by the app** (8 self-grouped + Work › Business and
the bare Work tab, both assembled) · single file **1,037,950 chars** · ledger
**644 / 654 · 0 lost · 38 declared changes** · zip **315,886 bytes** · **34 gates
· 34 passed · ALL GATES CLEAN (51s)** · route gate **52 comparisons across 26
routes in two states** · screen gate **REACT CLEAN, 29 screens × 9 fixtures** ·
walk **20 routes React, 1 unconverted, 2 screens inside markup routes, 0 console
errors** · dev server 0.0.0.0:3007.

**Next:** the two Governance routes whose cards the game still arranges (Pack,
Register — `viewGovernance` already draws the screens; what is missing is the
app arranging those sections), then Work › Life (`viewLife`), then
`renderTop`/`renderTabs`/the modal as components.

### 22.40 — Governance › Pack and Register: the last two routes the game arranged, and three things the gates found

Pack and Register were the odd pair: their screen (`viewGovernance`) had been
converted long ago, and yet `routeOwnership()` still refused both routes — "core
still groups this route's cards". The screen was React; the *arrangement* was
core's, running on markup the app had produced. Two gates proved opposite halves
of that at the same time and neither was wrong: `react-route.js` said markup,
the browser walk said the screen marker was on the page.

The fix is not to stop core grouping — it is to arrange the sections in the port.

#### The cards arrive as markup, so the matching had to move into the app

`viewPack` emits seven cards in one string; `viewRegister`, `viewPromises` and
`viewDeed` one each. A converted screen that arranges its own sections hands
`Group` React elements; here there are no elements, so `apps/web/screens/
sections.js` splits the panels and matches the cards to the route's spec — **with
core's own `splitTop()`, `cardTitle()` and `cardTag()`**, because the one thing
this must not do is disagree with the game about what a card is called, and with
core's rule rather than a new one: walk a level, read every top-level card's
heading, take the first spec group (in spec order) whose pattern the heading
starts with, claim those cards, mark the group used so a deeper level cannot
claim it again, emit the section where its first member sat, and leave a card no
group names exactly where it was.

Two consequences are load-bearing, and both are visible in the arrangement: the
columns of the `grid g2` are the levels (which is why `Who owns what` is in the
left column and `Side deals` in the right, from two different panels), and `used`
is shared across columns (which is why Promises is inside `The terms you live
under` on Pack — the spec names it there — and a leftover card is untouched).

`Group` gained one thing for this: `html` and `n`, for members that arrive as
markup. The body goes **on `.sectBody` itself** (or on the `grid g2` inside it),
never in a wrapper div, because the string path's cards are direct children of
the section body and a wrapper would be a box the game does not have.

#### Three things the gates found

**My reading of the spec was wrong, and a live probe said so.** The pack spec's
third group is `cards:['Covenants','Option pool','Promises']` — I had read a
truncated line and built the matcher against a two-name list, which put the
Promises card in the right column as a leftover where the game puts it in the
section. The port's own output (one section with the tag `0 live` and a missing
middle section) is what sent me back to the file.

**A group rendered outside its route rendered nothing.** `Group` unwraps when the
route being drawn is not the route the section belongs to — and the bare
Governance tab draws the same panels as the Pack sub-tab. The unwrapped branch
returned `children`, and when the members came in as markup there were no
children: the bare tab rendered an empty pane, which the route gate reported as
`the route the app draws for governance is not the route the game draws ... text:
app and game differ at character 0 of 0`. `arrangeRoute()` now asks the same
question `Group` asks (`routeKey()`), so on the bare tab the cards stay in the
order the panels emitted them with no sections at all — and `Group`'s unwrapped
branch renders markup members as markup.

**The screen gate compared one screen against the wrong build's `UI`.** The two
legs render from two builds — the string leg is the single-file build's own
`viewGovernance`, and it reads *that* build's `UI` — so setting only the module
build's `UI.sub` compared the app's Register panels against the single-file
build's Pack panels. Both builds are told the route now. And because
`viewGovernance` draws **two** arranged routes, the gate had been keeping one key
per screen and comparing the other route's arrangement never: `groupedScreens`
holds a list, and a screen on two routes is compared once per route —
`viewGovernance` is now 18 comparisons (9 fixtures × 2 routes), all agreeing.

The string-drawn experiment moved for the **fourth** time in this project's life
— Work › Business, Work › Household, Governance › Pack, and now **Work › Life**,
the last route drawn by markup — which is why the route it runs on is written
into the comment rather than looked up.

**State:** **29 converted screen components** · **28 of the 29 routes drawn by
React** · **12 routes arranged by the app** (8 self-grouped + Work › Business
assembled + money/deals + money/group + governance/pack + governance/register) ·
single file **1,037,950 chars, unchanged by this unit** · ledger **644 / 654 · 0
lost · 38 declared changes** · zip **315,886 bytes** · **34 gates · 34 passed ·
ALL GATES CLEAN (53s)** · route gate **56 comparisons across 28 routes in two
states** · screen gate **REACT CLEAN** · walk **22 routes answered from React, 1
unconverted route (Work › Life) clean, 0 screens inside a markup route, 0 console
errors** · dev server 0.0.0.0:3007.

**Next:** Work › Life (`viewLife` — the last route drawn by markup), then
`render()`/`renderTop()`/`renderTabs()` and the modal as components.

### 22.41 — Work › Life: the last route the game drew, and the experiment that ran out of routes

`viewLife` was the one screen this project had deliberately never drawn, and the
last route `core` drew itself — 29 of 29 routes are now React.

The port is a two-column screen with three sections: `Where you are` and `What it
costs` each hold one card in the left column, and `Record` holds *both* right-hand
cards — `Decisions on record` and `Life log` are siblings inside that column, so
both are its members and neither is grouped across the column. `Record` starts
collapsed, which is why the port passes its `tags` explicitly: the string path
promotes the members' key figures onto a collapsed header (`N made` from the
decisions card, nothing from the life log, which has no tag) and a collapsed
section does not render its members, so the tags cannot be read out of the DOM.
`statRow()` ×4 are embedded — a stat row defined twice would drift — and the
`.kv` rows are ordinary elements and are ordinary JSX.

#### The string-drawn experiment had nowhere left to move

It has moved four times — Work › Business, Work › Household, Governance › Pack,
Work › Life — each time because the route under it became React, and this time it
has no route left to run on. So it stopped looking for a markup route and started
**making** one: the gate removes the overrides, drops the group declarations and
the composed-route declarations, renders `work/life`, and asserts the route stamp
and the screen wrapper are both gone, that a redraw replaces the element (the
string path rewrites `#main`), and that a quarter moves the text. Then it puts the
declarations back and asserts the app takes the route back
(`data-react-route="viewLife"`). A gate that can take a difference away and hand
it back is worth more than one that happens to find a route nobody has converted.

#### What is left unconverted, and why most of it is not a gap

The ui registry holds **43 `view*` names; 30 are converted**. The thirteen that
are not are not routes: `viewPack`, `viewRegister`, `viewPromises` and `viewDeed`
are panels the converted `viewGovernance` embeds by name (`builtin()`), and
`viewWork`, `viewMoney`, `viewInvest`, `viewLedger`, `viewDash` are the
tab-level screens the consolidated routes replaced — the dead ones the inventory
accounted for in §22.18. So the honest count of *work remaining* on screens is
zero; what remains is the shell.

**State:** **30 converted screen components** · **29 of 29 routes drawn by React,
0 by markup** · **13 routes arranged by the app** (10 self-grouped + Work ›
Business assembled + governance/pack + governance/register) · single file
**1,037,950 chars, unchanged by this unit** · ledger **644 / 654 · 0 lost · 38
declared changes** · zip **315,886 bytes** · **34 gates · 34 passed · ALL GATES
CLEAN (58s)** · route gate **58 comparisons across 29 routes in two states** ·
screen gate **REACT CLEAN**, viewLife agreeing in 9 fixtures (27 controls and 270
figures) · walk **23 routes answered from React (21 screens) · 0 unconverted
routes carried no marker · 0 screens inside a markup route · 0 console errors** ·
dev server 0.0.0.0:3007.

**Next:** the shell — `render()`, `renderTop()`, `renderTabs()` and the modal as
components, which is what makes the imperative path exist only for the single
file.

### 22.42 — The shell: the header, the tab strip and the hint become the app's

With every route converted, what was left rebuilt as strings on every render was
the chrome *around* the route: `renderTop()` replaced the whole header row,
`renderTabs()` replaced the strip, its second level and the hint popover. A
quarter advanced and the net-worth arrow, the tab dots and the chip row were all
thrown away and built again.

They are React now — `apps/web/shell/top.jsx`, with `drawShell` in
`apps/web/shell/index.jsx` — behind the same kind of seam as the route drawer,
one level up: **the app declares the pieces it draws** (`ui.setAppShell`) and the
ui asks for a piece when it would have written that piece
(`ui.setShellDrawer`). A piece nobody claims is never asked for, which is what
lets the shell move one piece at a time.

**What is the app's and what is not:** `top` (the header row), `tabs` (the strip,
its second level and the hint — three containers, one piece) and **not** `modal`,
which stays markup and says so in `shellPieces`. The walk checks that the modal
host carries no stamp, because a stamp that appears wherever any part of the
chrome is React would stop meaning "this part is React".

**The words stay core's.** `bellHTML()`, `eraChipHTML()`, `seasonChipHTML()`,
`whyHTML()` and `tabDot()` are embedded, not reimplemented: they are not screens,
core calls them directly, and a second definition of the bell would drift. The
hint popover is the sole exception, and deliberately: `whyHTML()` returns the
panel *plus* its own question-mark button, and that button has to carry the open
state, so the port draws the button and the panel around the same `whyHTML()`
inside — there is still one definition of what the hint says.

#### Four things the port had to get right, and the gates found three of them

**The start screen writes markup into the header.** `renderStart()` sets
`#toprow.innerHTML` and `#tabs.innerHTML`, and `setAppShell`'s release only ran
when the *claim* changed. So a React root was left sitting on a container the
markup builder then overwrote — `NotFoundError: The node to be removed is not a
child of this node`, thrown from React's own unmount, reproducibly, at boot.
Fixed twice over: `setAppShell` now releases any container it stops claiming, and
`renderStart()` releases the shell before it writes (and takes the second level
and the hint down with `shellClear()`, so a new run cannot start wearing the last
one's chrome — a `display:none` row and an `open` class the app had set).

**`setAppShell` had to be declared, not just added.** The ledger failed the build
with one undeclared statement (`shellClear`, whose addition the first declaration
pass missed). 52 declared changes now, and the bundle's own statement count is
checked against them on every rebuild.

**The shell claim is read through `||`, like `APP_ROUTE`.** `var` hoists but its
initialiser runs in source order, and `packages/ui` is in a cycle: the tail of
`17-actions.js` calls `boot()` at module top level, `boot()` calls `render()`, and
`render()` calls `renderTop()` — which can happen before the seam's `var`s have
run. `TypeError: Cannot read properties of undefined (reading 'top')`, from
`shellOwned`, in `react-screen.js` and nowhere else — the one gate that imports
the ui with no app. Not declared yet now means "markup draws the shell", which is
the right answer and the same answer `APP_ROUTE = null` has always given.

**And the gate caught itself comparing nothing.** `react-shell.js`'s first version
passed with `0 subs` in every state: all three fixtures stayed on Overview, where
there is no second level, so the strip's second half was two empty containers
compared three times. Every state now names the route it looks at, three of the
four have a second level (6 entries each), and the gate fails if **no** state in
the run drew one. That is the same rule the fixtures have followed since §22.38 —
a screen compared only in its empty state is half checked.

#### The gate

`.harness/react-shell.js` — **the 35th gate** — captures the header, strip, second
level and hint twice on the same state, once from the markup path with the app
claiming nothing and once from the app, and compares every control (tag, classes,
`data-*`, disabled, title), the figures, the visible text, the class list **and the
two facts the string path sets on the containers rather than inside them** (the
second level's `display`, the hint host's `open` class). Then: an element captured
from the header is the *same object* after a quarter is advanced and its text has
changed; and `setShellDrawer(null)` takes the stamp off every container, after
which the markup path has the header back — Advance button and all.

The boundary is a hand-written table, like the route gate's, and a piece the app
claims that the table does not know about fails.

**State:** **35 gates · 35 passed · ALL GATES CLEAN (62s)** · the app draws 30
screen components, all 29 routes, and now the shell (2 of 3 pieces; the modal is
next, and says so) · single file 1,037,950 → **1,043,471 chars** (the seam, at
about 5.5k, plus the declaration comments) · ledger **644 / 664 · 0 lost · 52
declared changes** · **`SHELL CLEAN — 16 pieces of chrome compared across 4
states`** · walk **23 routes React · the shell REACT · the modal built-in with no
stamp · 0 console errors** · dev server 0.0.0.0:3007.

**Next:** the modal. `renderModal()` is the last piece of the shell, and it is a
dispatcher over ~25 modal types plus a `nego` post-render step — converted in the
same shape as `viewGovernance`: the frame becomes React, each modal body stays
core's until it is converted too.

### 22.43 — The modal: the last string on the page

`renderModal()` was the final thing the game rebuilt from a string on every
render, and the piece most likely to be on screen *while* the state changes
underneath it: the quarter-close animation runs for five seconds, an event card
stays open across a render, and the negotiation modal has a slider in it.

`apps/web/shell/modal.jsx` draws it now, and it is the same shape as
`viewGovernance`: **the frame is React, and the bodies are core's where core
already builds them whole.** The dispatcher has two halves and the port keeps
both:

- **Whole modals** — start, profile, run details, the quarter-close animation,
  another company, the year wrap, the end of the run, help, seasons, settings and
  a negotiation — are embedded as the strings core builds. Eleven types, one line
  each in a table.
- **Composed modals** — an event, a result, consequences arriving, the governance
  modals (vote, appointment, managing director, shareholders' agreement,
  operating plan, option grant, how it is paid for), a negotiation's outcome, the
  season scanner, partner offers, the amount box, a confirmation, a message — are
  assembled here with the same words in the same order.

**Two behaviours are kept on purpose**, because both are about the page rather
than about who drew it: the negotiation's tactic row is appended inside the modal
box by an effect that runs on commit and is idempotent (create it if missing,
remove it when the modal is no longer a negotiation — the string version could
not have this bug and cannot have this guarantee either), and the amount box takes
the cursor **at commit** by ref instead of in a 30ms timeout.

**A stale event is dismissed where the string version dismissed it**: if the
event's own `cond` no longer holds, the modal is cleared and nothing is drawn.

#### Two things only a live gate could find

**`extra` is a style string.** `modalHTML()` takes a raw attribute string and the
governance vote box is the one that uses it (`style="max-width:620px"`). Writing
that through as a prop made React throw
`The `style` prop expects a mapping from style properties to values`, and the vote
modal rendered **nothing** while the gate reported `text differs at character 0`
— a modal the player would never have seen. React owns these nodes, so the string
is parsed into a mapping; the rendered attribute is identical.

**A `govvote` with no vote in it is a modal the game cannot draw either.**
`govVoteModal()` dereferences `res.kind`, so the gate's first fixture for that
type crashed the *markup* leg — the fixture was wrong, not the port. It now
carries a vote that has actually been taken, which is the only state that type
exists in.

#### The gates

- `.harness/react-shell.js` compares **15 modal types** one by one against the
  markup dispatcher on the same state: every control (tag, classes, `data-*`,
  disabled, title), the figures, the visible text, the class list, and the
  `negoacts` count, which is `0` in both for every type but the negotiation. The
  list of types is written out by hand like every other boundary here.
- The browser walk opens the modal **the way a player does** (the gear in the
  header), asks the host who drew it, checks there is exactly one box and it has a
  close control, then closes it and checks the host is empty again — a modal that
  claims to be the app's and then does not empty the host is worse than one that
  never claimed it.

**State:** **35 gates · 35 passed · ALL GATES CLEAN (71s)** · the app draws 30
screen components, all 29 routes, and **all three pieces of the shell** · single
file 1,043,471 → **1,043,825 chars** · ledger **644 / 664 · 0 lost · 53 declared
changes** · **`SHELL CLEAN — 16 pieces of chrome across 4 states and 15 modal
types`** · walk **23 routes React · the chrome (header, strip and modal) React ·
0 console errors** · dev server 0.0.0.0:3007.

**Next:** `render()` itself — the last imperative function in the loop. Then it is
not a store subscription, it *is* React, and the string path exists only for the
single file.

### 22.44 — The page: the app composes the loop

Three seams had turned the header, the strip and the modal into the app's, and one
had turned the route into the app's. What was left was the thing that *orders*
them: `render()` still made four decisions and four markup writes on every render,
in an order the app could not see. With all four pieces the app's, that function
has nothing to write — so this step is the last one it had to give up, not a fifth
renderer: **the app composes the four draws it already owned.**

```js
ui.setPageDrawer(drawPage);   /* offered {main, top, tabs, subs, why, modal} */
ui.setAppShell(shellPieces);  /* and the claim is the intersection of both */
```

**The claim is the intersection.** `appDrawsPage()` asks the ui for one thing: are
all three chrome pieces the app's, and is the route? `pageOwnership()` says the
same thing in words — *the app draws the header, the strip, the route and the
modal* — and it is what keeps this honest, because a page drawer for an app that
had not converted the modal would be a page drawer that silently drops it. Set
`setAppShell({})` and the page claim goes off with it, which is also what makes
the whole thing testable: one call and the game is back to drawing the page piece
by piece.

**A page drawer that refuses is a correct answer.** `drawPage` returns false when
the route is not the app's, and the ui then falls back to the markup path for the
whole page — the same three shell pieces (which the app still answers for) plus
the route as markup. That is the safety property of the seam: an unconverted route
degrades to exactly the behaviour the game had before any of this existed. What
does *not* change is the page-level work underneath, because none of it is about
who filled the container in: the input bindings, the disclosure chrome, the scroll
position and the focus still run afterwards, on the container as it now stands.

**A stamp for the page.** `<body data-react-page="1">` while the app owns it, and
gone when it lets go — asserted by the gate and by the walk, because a page that
claims to be the app's and then shows the last run's chrome is worse than one that
never claimed it.

#### Three things only running it could find

**The disclosure chrome has to come off *before* anyone draws.** `applyDisclosure`
is DOM the ui adds to a container React owns — a chevron into each heading, the
rest of each card wrapped in a `.discbody`, an Expand all row at the top — and it
is released at the start of every render precisely because React cannot patch its
way around chrome it does not know about. This ran *after* the route was drawn for
one cycle, which is exactly one cycle too late: the first page the app drew after
the start screen threw `insertBefore ... is not a child of this node`, and Work
threw `removeChild` on the same cause. Both were in the **walk**, as page errors —
the gates were green, because jsdom fixtures never render twice into a container
that has chrome in it. Order is the whole of it: chrome off, whoever draws, chrome
back on.

**The gate's markup leg was not the game.** The whole-page comparison must compare
"the app drew this page" against "the game drew this page", and the game's path
includes core's own grouping: with the app's screens *still declared*, core's
`routeView()` grouped the sections the screens had already drawn, and the left leg
rendered a page with two nested section headers — `▾Where you stand▾Where you
stand` — that no player has ever seen. Titling them by hand would have been a
gate measuring itself; the leg now undeclares the screens, both route
declarations, the route drawer and the shell pieces, renders, and restores, which
is the same leg `.harness/react-route.js` has always used. The diff is what
exposed it: the counts were *identical* (3 chevrons, 3 headings, 3 bodies in both
legs) and only the text said the left leg had the title twice.

**An import reordered the boot and it died at the first render.** Wiring the page
drawer meant the app imported the shell module, which re-exports the screens — and
`drawRoute` was then read one line above its `const`, so the whole app threw
`Cannot access 'drawRoute' before initialization` and rendered nothing at all. No
gate could see it: they import the modules directly. The walk, which drives the
real app through a real browser, found it in one run.

#### The gates

- `.harness/react-shell.js` gained a **page section**: the whole page — header,
  strip, route and modal as one — compared against the markup the game drew in
  four states (a fresh run, a company four quarters in, in debt with deals
  waiting, a legacy route with a season running), plus the claim and its
  refusal, the two stamps, and the identity of the route wrapper across a quarter.
- `.harness/browser-screens.cjs` asks the running app the same question through
  the DOM and prints a row: `the page (header+route+modal) REACT 5 cards`. It
  reports page errors as failures, which is what caught the ordering bug above.

**State:** **35 gates · 35 passed · ALL GATES CLEAN (65s)** · the app draws 30
screen components, all 29 routes, all three pieces of the shell and **the page**
· single file 1,046,906 → **1,047,324 chars** · ledger **644 / 669 · 0 lost · 59
declared changes** · **`SHELL CLEAN — 16 pieces of chrome across 4 states, 4 whole
pages and 15 modal types`** · walk **23 routes React · the page React (5 cards) ·
0 console errors · 0 page errors** · zip **319,035 B · fresh** · dev server
0.0.0.0:3007.

**Next:** the single file's last string path — `render()` in the ui — and then the
Step 5 work on `packages/core`: the 58 data tables to TypeScript, a core test that
runs without a browser, and only then React Native.

### 22.45 — The simulation with no browser in the process

Thirty-five gates loaded the single file under a DOM stub, which is the right way
to test the game the player gets. It also means "core is framework-free" was, until
now, a claim about the **source** rather than about the **run**: nothing in the
suite had ever executed the simulation in a process with no `document` in it. The
next platform has no DOM either, and the migration's own answer
(`rn_verify = core_only`) says the check that matters is this one — core, alone,
playing.

`.harness/headless.js` (the **36th gate**) imports `packages/core` **directly** —
not `mod.js`, which is the app for node — and asserts four things that are only
true if the separation is real:

1. **Nothing in a whole run reaches for the browser.** `document`, `window`,
   `localStorage`, `sessionStorage`, `XMLHttpRequest`, `navigator`, `fetch`,
   `requestAnimationFrame`, `alert`, `location` and `performance` are replaced by
   getters that throw and record the name, *after* the import and before the first
   quarter. A single stray access anywhere in three decades of play fails here, by
   name.
2. **The module exports exactly what the package declares.** `exports.json` is the
   surface a React Native app is written against, so the gate compares it name for
   name with the live module: 615 declared, 615 exported, none missing, none extra.
3. **The same seed is the same world and a different seed is not.** Twelve
   quarters, replayed — identical, turn for turn — and seed `4243` differs. Every
   fixture in this suite leans on that; this is the gate that says so.
4. **A save is the state.** The whole object is walked for JSON-native values —
   nothing non-finite (JSON turns `NaN` into `null`), no `undefined`, no class
   instance, no cycle — and then stringified, parsed and stringified again to the
   same characters. 15,433 characters of state, round-tripped unchanged.

It also plays **four worlds to their end** (the hard terminal: all four retire at
turn 156 — the terminal is a rule, so that sameness is the rule working, and the
gate asserts the *ending* is deterministic instead: the same seed finishes the
same way, which is what would catch an ending that read the clock), checks the
history has a point per quarter and that its last point agrees with the net worth
the header prints, and that a quarter after the run ends does not move the turn.

**It was proved to fail**, on three deliberate breaks, each reverted:

| break | what the gate said |
|---|---|
| `var _leak = document.body;` at the top of `advanceQuarter()` | `a quarter threw with nothing drawing it: reached for document` · `the simulation reached for the browser: document` |
| the seeded RNG replaced by `Math.floor(Math.random()*1e9)` | `the same seed played a different world the second time — every fixture in this suite depends on it` |
| one extra `export const` in the package entry | `the module and exports.json have drifted: missing nothing, extra __driftedName` |

**State:** **36 gates · 36 passed · ALL GATES CLEAN (68s)** · the app draws 30
screen components, all 29 routes, all three pieces of the shell and the page ·
single file **1,047,324 chars** · ledger **644 / 669 · 0 lost · 59 declared
changes** · zip **319,035 B · fresh** · **`HEADLESS CLEAN — the simulation plays a
life in a process with no browser in it`** · dev server 0.0.0.0:3007.

**Next:** Step 5 opens — the data tables to TypeScript behind a transcriber that
strips types for the single-file build, so the deliverable stays one file while
the source stops being untyped.

### 22.46 — The data tables become typed source, and the transcript does not move

The migration's answer for the tables was TypeScript (`language = ts_tables`).
They are the right first thing to type: **57 tables, 332 kB of literals** — a third
of the simulation by weight — and every rule and every screen reads them by field
name. `TRAITS` is read by seven rules; the decks are read by the event engine;
`CITIES` decides what the header says.

**The constraint is the deliverable.** `ledger/index.html` is one file, and
`tools/bundle.mjs` holds a statement ledger against the original transcript. A
compiler reformats, renames and rewrites, so compiling the tables and shipping the
output would mean declaring that every statement in the game had changed — the
ledger would be telling the truth and saying nothing.

So the arrangement is a **splice**, not a compile:

| | |
|---|---|
| `packages/core/tables/<Name>.ts` | the source of truth: an interface, then the literal — **byte for byte what the game has always run** |
| `packages/core/src/*.js` | keep their code, lose their literals to a one-line directive `/*@table:NAME@*/` |
| `tools/compose.mjs`, `tools/makecore.mjs` | splice the literal back in where the directive is |
| `tools/tables.mjs --verify` | compares every spliced table against the **baseline** statement of that name, token for token — it runs before every build |

Nothing was retyped. `--extract` lifted each literal out of its section and the
splice puts the same characters back; the annotation on the declaration line is
the only thing TypeScript added and the splicer removes it. The proof is the
ledger and `--verify` together: **57 directives, every one the statement the game
ran.**

**The types are inferred from the data** (`--extract` walks every element and
unions what it finds): a field in some elements and not others becomes optional; a
field that is a string in one element and a number in another becomes a union; an
array of objects becomes one shape with optional fields rather than twenty
near-identical interfaces; a mix inside one list is a list of the mixture. Fields
it cannot name are declared `any` — and **counted**, 130 of them, so the to-do
list is visible instead of being a shrug.

The names the tables call (`clamp`, `fmt`, `R`, the generators — 47 of them, mostly
inside the decks) are declared once in `packages/core/tables-globals.d.ts`, which
is a contract like `host.js` rather than a build artefact, and the gate reports a
name there that no table uses any more.

**The check is the point of the exercise**: `packages/core/tsconfig.json` checks
`core.js` (with `checkJs`) and every table file, with **`lib: ["es2022"]` — no DOM
in the programme at all**, so `document.title` inside the simulation is a type
error rather than a surprise on a phone.

#### Two live bugs the typing found

**The hiring message printed the word "undefined".** `hire()` looked the candidate's
trait up by comparing it to itself — `TRAITS.find(t=>t.id===t.trait)` — which never
matches, so the player was told:

```
You offered Emeka Mbachu the job — skill 4/10, ₦363k/month. undefined. They work their notice and join next quarter.
```

Seven rules did the same lookup with `||{}` and read fields off the empty object,
which is why none of them could be checked against the table. They now go through
**one typed function** (`traitOf(id)`), and the message names the trait it was
always meant to name — or says so plainly when the candidate has none.

**Every invite link in the app was a bare code.** The module build *shims*
`location` to the host (`location()` is the host's url) while the single file has
the browser's object under that name, so `location.href` in the app build was
`undefined` and `seasonLink()` fell back to the code with no address in it — the
row a player would paste said nothing about where to go. `_href()` now asks the
shim when the name is callable.

#### The gate

`.harness/types.js` — the **37th gate** — reads the tsconfig (rather than assuming
it), runs the compiler, asserts **zero errors**, and checks that every directive
has a table file, every table file has a directive, and no table is spliced twice.
**Proved to fail** on two deliberate breaks, both reverted:

| break | what the gate said |
|---|---|
| a required field added to `CITIESShape` that the data does not have | `Property 'code' is missing in type … but required in type 'CITIESShape'` (×6, one per city) |
| `const _breakThree = document.title;` in a section | `Cannot find name 'document'. Do you need to change your target library?` |

**What it does not catch yet, and says so:** reading a field name that no element
of a table has *from a JavaScript file*. TypeScript does not report unknown
property access on inferred object types in `.js`, so `BIZ[0].nmae` compiles. The
fix is annotating the consumer sites (`/** @type {Biz} */`) — that is the next
step of the migration, not something this step can claim.

**State:** **37 gates · 37 passed · ALL GATES CLEAN (70s)** · 57 tables typed and
spliced · single file **1,049,008 chars** · ledger **644 / 670 · 0 lost · 68
declared changes** · zip **319,763 B · fresh** · walk **23 routes React · the page
React · 0 console errors · 0 page errors** · `TYPES CLEAN — the simulation
type-checks with no DOM in the programme`.

**Next:** the consumer annotations (`@type` on the handful of places that read a
table by name), then Step 5's other half — a core test that runs without a browser
(the `headless` gate is that, in place) — and only then React Native.

### 22.47 — The tables are checked where they are *read*, and the app is checked against the packages

§22.46 typed the tables and left one thing open, said out loud: a field read by
name from a `.js` file was still unchecked, because **TypeScript does not report
an unknown property access on an object literal type inferred inside a `.js`
file.** The tables were typed and nothing was reading them through the checker.

**The fix is one line of the splicer.** The statement the build composes into the
transcript now carries the table's own type:

```js
/** @type {BIZShape[]} */
const BIZ = [ … ];
```

That is a comment — the single file carries 57 of them and no behaviour — and it
is the entire difference between a typed table and a **checked** one: a JSDoc
annotated declaration makes the checker treat every read of it as `BIZShape`, so
`T.plan[0].name` where the field is `f` is now a type error.

**It found three things in the first minute:**

- **`R.weightedN` does not exist, and never did.** `buildCast()` opened with
  `const roles = R.weightedN ? null : null;` — a local bound to `null` either way
  and read nowhere in the function, on a generator that has no `weightedN` member.
  It had been dead since it was written (declared as a change, not deleted
  quietly).
- **A union of shapes is not a union of *uses*.** A list whose elements carry
  different `eff` objects typed as `A | B | C`, so `eff.happy` — a line the game
  has run for a year — was an error. The inference now **merges** shapes into one
  with the missing fields optional, which is what the code actually assumes: some
  elements have the field, so reading it gives a number or `undefined`.
- **`packages/flat/ui/src` drifted** — the mirror gate caught it, as designed.

#### Four live bugs the app's typecheck found

- **`ui.seasonCanScan()` was never exported.** `apps/web` fills its platform
  facts with it; the name was destructured inside `@ledger/ui` for the host and
  never exported, so the ask would have been `undefined is not a function` the
  first time a player pressed **Scan** on a phone. This is the *exact* mistake
  the ui's own entry file warns about for `installAvailable()` — found this time
  by a checker rather than by a console.
- **The service worker never registered in the app.** `location.protocol` in the
  module build reads the **host shim** (`location()` asks the host for its url),
  so the condition was `undefined === 'http:'` — false — and the whole offline
  half of the game was switched off by a name collision. `pageProtocol()` now
  answers the same question in both builds.
- **A duplicate declaration that would have been a SyntaxError.** Fixing the
  first bug, I exported `seasonCanScan()` next to a destructuring of the same
  name: one module scope, two declarations, and the ui would not have loaded at
  all. The checker said `TS2395` before anything ran; the entry file now says
  why it does *not* destructure the names an app asks for.
- **Seven names I invented in the ui's own declaration file.** `/index.d.ts`
  declared `render`, `toast`, `wipe`, `copyText`, `setBuiltinRenderer`,
  `setAppRoute` and `convertedNames` as part of the public surface. The gate
  compares the declaration against the module's real exports, and none of the
  seven are exported — an app written against them would have compiled and then
  thrown. They are gone.

#### What is checked now

| | |
|---|---|
| `packages/core` | type-checks with **no DOM lib**; 57 tables spliced with their types; 58 typed declarations in the transcript |
| `apps/web` | type-checks against the real core module **and** the declared ui surface — `apps/web/tsconfig.json`, 0 errors |
| `packages/ui/index.d.ts` | 18 names, **every one verified to be exported** by the module (20 exports) |
| the app's screens | props contracts written where TypeScript reads them: `Group`, `Frame`, `Raw`, `StaffBox`, `Line`, `Person` |

**Proved to fail** on three more breaks, all reverted: `T.nmae` at a `BIZ` read
site (`Property 'nmae' does not exist on type 'BIZShape'`), a required field
added to a table interface, and `document.title` in a section.

**State:** **37 gates · 37 passed · ALL GATES CLEAN (70s)** · single file
**1,051,496 chars** · ledger **644 / 671 · 0 lost · 71 declared changes** · zip
**320,602 B · fresh** · `TYPES CLEAN` — core, the app and the ui's surface, 57
tables typed in the transcript · walk **23 routes React · the page React · 0
console errors** · dev server 0.0.0.0:3007.

**Next:** Step 5's remainder — the ui's own internals (2,300 findings, mostly the
names it already borrows from core) are the last thing unchecked, and after that
the ground is clear for React Native.

### 22.48 — The ui is checked too, and the last unchecked region is closed

§22.47 left one region out of the programme on purpose, and wrote down why: the
ui's own sections had never been through a checker, because pointing a checker at
them meant resolving the 615 names they borrow from core. Once the ui's tsconfig
consumes `@ledger/core` **by name**, exactly as the app does, that reservation is
gone. The first run found **78 things**, and they were not noise:

| what the checker saw | how many | what it was |
|---|---|---|
| `.dataset` / `.value` / `.type` / `.select` on an `Element` | 39 | `querySelectorAll` hands back an `Element`; the code has always known what it actually queried |
| `.value` on `HTMLElement` | 10 | six reads written as `(Q('x')\|\|{}).value`, a type with no fields at all |
| `.left` / `.total` / `.end` on `{}` | 5 | `seasonStatus()\|\|{}` — a fallback described as an empty object |
| `.closest()` on an `EventTarget` | 2 | the delegated click target |
| an arithmetic operand that may be a string | 3 | a P&L figure out of a `[label, figure]` pair |
| `.protocol` on the host's `location` shim | 1 | see below |
| the ui's generated shim importing a host that is not there | 1 | see below |

**Every one is the same complaint in different clothes**: the ui reads the DOM
through names that say what the code means and not what the type is. None of the
39 was a bug; all 39 were rooms where a bug could stand unnoticed. So the fix is
typing at the source, never a blanket `any`:

- **`Q(id)` says it returns `HTMLElement | null`**, and the few places that ask
  it for an input cast once, at the top of the row they are binding.
- **`inputValue(id)`** replaces six hand-written `(Q('x')||{}).value || ''`
  reads — one typed helper, and it answers `''` for a box that is not in the
  page yet, which is exactly what the six did.
- **`seasonStatus()` and `_sea` carry their shapes.** `_sea.seed` is `''` until
  a season pins one and a number after; the type now says so instead of
  describing half the field's life. `viewSeason()`'s fallback carries the status
  shape rather than `{}`.
- **the toast handle moved off the element.** `h._t` was a property the DOM does
  not have; it is one module-level slot now, with the same behaviour (only the
  newest toast clears the host).

**Two real defects came out of this leg, and one of them was the same mistake for
the third time:**

1. **`location` means two things, again.** In the module build `location` is the
   **host shim** — the name collision that made the service worker never
   register (§22.47). Fixing that left one branch of `pageProtocol()` asking a
   shim function for `.protocol`; the browser's own url is read through
   `window.location`, which is unambiguous in both builds.
2. **The generated `host-shims.js` imported a host that does not exist.**
   `tomodules` hard-coded `from './host.js'`, which is right for core and wrong
   for the ui (whose host *is* core's). Latent, because nothing imports the ui's
   shim yet — the kind of file that works until the day it is needed. The
   generator now looks for the host beside the output, one level up, and
   otherwise imports the package it borrows from; the gate asserts the file
   behind every written import exists.

#### What is checked now — three legs, one command

| leg | programme | result |
|---|---|---|
| **the simulation** | `core.js` + the 57 typed tables, **no DOM lib** | 0 errors · 57 of 57 tables typed in the transcript |
| **the app** | `apps/web` (screens, shell, app) against the real core module **and** the declared ui surface | 0 errors |
| **the ui** | the sections **and** the seam, with a DOM, against the same core module | 0 errors |

`packages/ui/index.d.ts` is still 18 names against 20 real exports, every one
verified by the module.

**State:** **37 gates · 37 passed · ALL GATES CLEAN (76s)** · single file
**1,054,333 chars** · ledger **644 / 673 · 0 lost · 81 declared changes** · zip
**321,658 B · fresh** · walk **23 routes React · the page React · 0 console
errors** · dev server 0.0.0.0:3007 · TYPES CLEAN on **all three legs**.

**Next:** the ui's `render()` string path — the last of the old drawing code that
the converted screens no longer need — and after that the ground is clear for
React Native.

### 22.49 — The file a player downloads, played in a browser (gate 38)

Every gate in this harness either runs the simulation headlessly, drives the
sections directly, or walks the **Next app**. None of them opened `ledger/` —
the thing a player downloads, unzips, and plays. That gap sat under a claim this
document has made for weeks: *the single file still draws the whole game as
markup, with no app on the page.* A claim with no gate behind it is a sentence.

`single.js` is that gate. It serves `ledger/` (index.html, the service worker,
the manifest, the icons — the archive's own contents), opens it in Chromium at
390×844, and plays:

| what it does | what must be true |
|---|---|
| boots | **0 React markers anywhere** · and the ui's own seam, asked directly, answers `pageOwnership() = {owned:false, why:"no app handed a page drawer in"}` with an empty `shellOwnership()` |
| presses **Begin** | a game starts, the tabs appear, the modal host empties — the button is exercised, not bypassed |
| starts a company | by clicking **Start alone** and confirming the capital box |
| walks 23 route entries | every one drawn as **markup**, every one with a card on it, none saying `undefined` / `NaN` / `[object Object]` / a literal `&amp;` |
| redraws | the player is still on the same route, with the same heading |
| clicks a chevron, redraws | the disclosure state survives (the `.discbody` and the glyph, not a class name) |
| holds a budget row, redraws | the row keeps focus and the value the player set |
| scrolls, redraws | the scroll position survives |
| advances a quarter | the page is redrawn by `render()` and still markup, modal answered or closed |
| opens Settings, closes it | markup, one box, and the host empties again |
| reloads | the same game comes back — from its own storage, with no backend |
| the whole run | **0 console errors, 0 page errors** |

**Three things it settled by asking rather than assuming:**

1. **The seam is in the single file, and that is correct.** The gate first
   asserted "no seam names exist" and failed: `setAppShell`, `shellOwnership`,
   `appDrawsPage` are all there, because the seam is the *ui's* and the file is
   the ui. The honest claim is not that the names are absent but that **nothing
   has declared anything** — so the gate asks the seam and prints its answer.
   (`routeOwnership` and `setPageDrawer` are module-only; the single file has no
   need of them, which is what "the single file has `APP_PAGE = null`" means.)
2. **A world at seed 4242 has to be chosen with care, and the gate says why.**
   At 4242 a fresh graduate in Lagos has ₦180k and **cannot afford one of the
   ten companies** — a real state, a real screen, and a walk of 22 routes over
   it would be the same short page 22 times. The same seed as a returnee affords
   four; the world behind them is the same world. The gate asserts that at least
   one company can be started, so a change to the economy cannot quietly turn the
   walk into fiction.
3. **The disabled company buttons state their reason** — ₦ and a number, the
   §22.23 rule — on the screen where a player is most likely to meet a control
   they cannot press. The gate counts any that do not.

**And one shared list.** Both walks now read `.harness/routes.js`: the app walk
asks which of these pages React drew, the single-file walk asks that the file
draws every one of them as markup. Two lists that drift are two gates quietly
covering different games — a route added to one and not the other is a route
nobody checks.

### 22.50 — `render()`'s markup path gets names

The last item of Step 4 was `render()` itself: "the page-level work, and the
string path for the single file". The work was already separated — bindings,
disclosure, scroll and focus run whether or not an app drew the page — and what
remained was that the string path was two `if(!page)` blocks inside the loop:

```js
if(!page){ renderTop(); renderTabs(); }        →  if(!page) renderChrome();
...
if(!page){ if(!appDrawsRoute()) Q('main').innerHTML = v(); renderModal(); }
                                               →  if(!page) renderMarkupPage(v);
```

**Nothing moved.** The same statements, in the same order, in two functions that
name the path — so "the markup path" is a place in the file, and the gates that
compare it against React (`react-shell`, `react-route`, and now `single`) have
something to point at.

**State:** **38 gates · 38 passed · ALL GATES CLEAN (94s)** · single file
**1,055,178 chars** · ledger **644 / 675 · 0 lost · 83 declared changes** · zip
**321,975 B · fresh (6 files)** · **TYPES CLEAN** on all three legs · the app walk
**23 route entries → React** · the single-file walk **23 entries → markup, 0
console errors**.

### 22.51 — The app was deployable and not installable (gate 39)

`next build` passed, the walks passed, and the app was missing every resource an
*app* has: no `public/`, so no `/manifest.webmanifest`, no `/sw.js`, no icons, no
apple-touch-icon; and `layout.jsx` linked no manifest, so a browser never offered
to install it. Nothing in 38 gates could see it, because every one of them asked
whether something **renders** and none asked whether the app is **installable**.

That is now gate 39, `appshell.js`, and it builds and starts the app itself (in a
build directory of its own, `.next-gate`, so it can run while a dev server is up)
before asking:

| | |
|---|---|
| the manifest | parses, names the app, asks for `standalone`, has a `theme_color`, and carries a 192 PNG, a 512 PNG and a **maskable** icon |
| every icon it names | really there, really a PNG, and really the size it claims — the bytes are read, not the filename |
| `/apple-touch-icon.png` | exists and is a 180px PNG, because iOS ignores an SVG one and falls back to a screenshot of the page |
| `/sw.js` | served, has install and fetch handlers, and **is not cacheable** — a deploy that ships behind a cached worker is a deploy nobody receives |
| the page's head | links the manifest and the apple icon, and fits a notch (`viewport-fit=cover`) |
| the worker, in a browser | registers, **activates**, and caches a shell |
| **the network off** | a cold navigation still opens the app — and in practice it opens *mid-run from its own save*, which is the stronger claim |
| the app it serves | the header, strip and sub-strip are React's, the page is React's, and Money › budget is a React route |

#### Two real bugs, and the second one was hiding behind the first

1. **The service worker registered on no deploy of the app.** The registration
   sat inside `window.addEventListener('load', …)`, which is right in the single
   file (the statement runs while the page is arriving) and wrong in the app,
   where the ui is imported *after* `load` has fired — so the listener was
   attached to an event that would never come again. It registers at once when
   the page is already complete now.
2. **And then it still did not register**, because `pageProtocol()` asked the
   host's `url` slot, which the app does not install and which defaults to `''`.
   A host that says nothing was able to switch a feature off by staying silent.
   The host's answer wins when it has one; otherwise the page's own location is
   the truth. (This is the third bug in this family — `location` meaning two
   things — and the first where the fix was *not* to prefer the host.)

**A gate bug worth recording too:** the first version of `appshell.js` fixed
port 3009 and leaked its server, because killing `npx` does not kill the server
`npx` started. The next run's build then replaced the directory the stale server
was still serving from memory, and the gate reported the app broken while a ghost
answered on the port — for two runs, with a 400-Bad-Request console error as the
only clue. It now asks the kernel for a free port and kills its own process
*group*.

### 22.52 — Deploy kit, and PNG icons everywhere

**The app**: `public/manifest.webmanifest` (PNG icons, maskable, `id`, scope),
`public/sw.js` — a worker that precaches the shell, serves navigations
network-first with a cached fallback, treats `/_next/static/*` as immutable
(content-hashed, so the URL *is* the version) and stale-while-revalidate
everywhere else — plus `app/icon.svg`, the apple-touch-icon link, and
`themeColor`/`colorScheme` moved from `metadata` into `viewport`, which is where
Next 15 wants them (and where they belong: they describe framing, not identity).

**The single file**: the head now declares a real `apple-touch-icon.png`, a
192 and a 512 PNG — the **inline SVG favicon stays**, so a file copied off a
flash drive on its own still draws its own mark, and the zip carries the PNGs for
the home screen iOS wants. The worker precaches all four.

**Both**: the four PNGs are rendered from the two SVGs by the same Chromium the
gates use — the same drawing, not a redrawn approximation — and the zip is now
**10 files**.

| shipped | what |
|---|---|
| `Dockerfile` | the app: two stages, `npm ci` from the lockfile, `next build`, then a production image that runs `next start` on 0.0.0.0:3007 |
| `Dockerfile.static` | the single file on nginx, with `deploy/nginx.conf`: correct MIME types for `.webmanifest`/`.svg`/`.png`, `sw.js` not cached, no directory listing |
| `vercel.json` | install command, `npm --workspace apps/web run build`, output directory |
| `.github/workflows/gates.yml` | all 39 gates on push, with the three installs and chromium |
| `README.md` | what the two deliverables are, how to ship each, the Supabase-is-optional truth (**no env vars: the configuration is a player's, entered in Settings**), the repo map, the gate table, and the fresh-checkout commands |
| `.dockerignore` / `.gitignore` | so an image and a repo do not carry `node_modules`, `.next` or the zip |

**Not claimed:** Docker is not installed in this sandbox, so the images were not
built here. What *was* done instead: every `COPY` source is asserted to exist,
and both Dockerfiles run the same commands the gates run — `next build`,
`next start`, and nginx serving `ledger/` — so the build path is exercised even
though the container is not.

**State:** **39 gates · 39 passed · ALL GATES CLEAN (123s)** · single file
**1,056,389 chars** · ledger **644 / 675 · 0 lost · 85 declared changes** · zip
**341,339 B · fresh (10 files)** · the app walk **23 entries → React** · the
single-file walk **23 entries → its own resources + markup, 0 console errors** ·
the app-shell gate **manifest, icons, worker, offline, 0 console errors**.

### 22.53 — The game on a phone, two ways, and the bug the second way found

Step 5 of the migration asked for React Native, with its own advice attached:
ship the shell first, take the native host when there is a native feature to pay
for. Both exist now, and neither of them duplicates the game.

**The shell — `apps/phone`, Capacitor.** An icon, a splash screen, a status bar
and a store listing around the file the zip already contains. `tools/mobile.mjs`
fills `www/` from `ledger/` on every build, byte for byte, stamps `build.json`
with the source, the file count, the size and the hash, and **deletes anything in
the web directory that is not part of the game** — so the payload is the build and
the build is the payload, with no third thing to drift. The first scaffold of the
shell carried `@capacitor/app` and `@capacitor/share` for a back button and a
share sheet; nothing in a payload that must stay byte-identical could call them,
so they were installed, synced into Gradle, and did nothing. `navigator.clipboard`
is how the game copies a code, and it never calls `navigator.share`. Both are gone,
and the gate fails on any future plugin that is declared and never configured.

| the `phone` gate (41st) checks | and says so when it is wrong |
|---|---|
| `www/` against `ledger/`, file by file | *the phone's web directory is not the build: index.html (differs)* |
| the stamp against the bytes it names | *the phone build stamp disagrees with the game it claims to carry* |
| the four icons, **parsed** — PNG magic and a real IHDR width | *icon-512.png is 192px, not 512* |
| the config as an app: reverse-domain id, name, `webDir`, dark splash and bar | *the shell has no dark background, so the layout flashes white before the game paints* |
| **no remote `server.url`** | *the config points the shell at a remote URL — then the app is a browser with an icon* |
| declared plugins == configured plugins | *declared but neither configured nor called: @capacitor/share* |
| with `android/` present: the synced copy, the launcher activity, label, icon, theme, `applicationId`, and every plugin's Gradle project wired in | *these configured plugins are not wired into the Android build — run `npx cap sync android`* |

**The native host — `apps/mobile`, Expo + React Native.** Expo managed workflow,
EAS Build for binaries, OTA updates for the JSON, Supabase through the AsyncStorage
adapter the local-first store already had. React Native draws nothing: the WebView
carries the same single file, and the host's job is to answer the seam so
`packages/core` can run on the device for native features. `createRnHost({core,
store, toast, url, canScan, fetch, cloudSync})` takes the **core as an argument** —
which is what makes the gate able to run it in a process with no DOM.

The one hard constraint, recorded here because it shaped the whole file: **the
save runs mid-simulation and the game reads back what it just wrote.** A device
file system has no synchronous write, so the host keeps a 12 MB in-memory mirror of
the save keys and flushes 250 ms behind the write, hydrating *before* the host is
installed and flushing on teardown. The keys are the browser's (`ledger.save.auto`)
and the blob is the browser's format (`{S, rs, ui:{tab}}`), so a run crosses
between the two without a translation layer. The seam is never made async to suit a
platform: 11 of 11 slots answered.

#### The bug: a save is not a fork point (and net worth cannot see it)

The gate's cross-runtime check — write a save on the phone, boot it in a **real
browser child process** through `ui.boot()`, play a quarter, save, load it back on
the phone — failed, and it failed in the most instructive way available: the two
states differed by a hash while **net worth was identical on both sides,
₦27,060,246**. Not an economy difference, then. Diffing the two states key by key
left exactly one line:

```
cd.network_event: undefined vs 4
```

The cooldown the event deck records when an event fires, set on the browser and
unset on the phone. The cause was nothing in the host, the mirror or the flush:
**the save does not carry the open modal.** Save with a decision on the table and
the reload has nothing on the table — so the browser had forked with the quarter's
event fired and waiting to be answered, and the phone, which had loaded through the
host, had not. Two runtimes, same save, different quarters.

The fix belongs in the gate, and its honest shape is "play it the way a player
plays it": advance, then answer whatever the quarter put on the table — first
option on both sides, resolved through `resolveOption` and `afterThreadChoice`,
both of them core's own functions, so a gate's choice goes through the same code a
tap does. The fork is asserted clean, in those words (*booting from a save opened a
X — the save is a fork point, so nothing should be pending on the other side of
it*), then a quarter each and the hashes compared: `e05b81404bd97906`,
`673eedd0286c4cfd`, `2da56f4183af3979`, identical in both runtimes.

**What it exposed is the file's behaviour and is left open, said out loud:** a
reload loses a decision that was already on the table. The event has fired, its
cooldown is recorded, and the choice is never offered again — so the quarter is
played out with an unanswered prompt. It does not move money, which is exactly why
it survived a year of play and 39 gates. Carrying it would change the save format,
so it is recorded rather than fixed quietly.

#### Two gate bugs fixed in the gate, not in the code

- **The bridge accepted a body that was not an object.** `{"type":"save",
  "body":123}` parsed into `{}` — a message that means something else, coerced
  into "save nothing" without a word. A body is optional; a number, a string or an
  array in that position is a rejected message now, and the gate's junk list names
  thirteen of them.
- **The import scanner read prose.** Part 3 reported that `native.js` imports
  whatever the app happens to be, which `package.json` does not list — a sentence
  from a comment about invite links. Comments are stripped before anything is read
  as an import now. A scanner that reads prose finds problems nobody can fix.

**What is stated and not built:** a native share sheet and an in-app back button.
Both need a call from inside the payload, and the payload is the one artifact this
path keeps byte-identical to the zip — so they are written down in
`apps/phone/README.md` as the shortfall they are, not half-wired. And no APK was
built: there is no Android SDK in this container, so the gate checks everything up
to the point where the SDK takes over.

#### One more lie, printed on every build

`.harness/build.js` re-exports the names the gates call out of the composed
source, and reports the ones it could not find. Every build for as long as anyone
can remember ended with `missing: snap, switchbiz, genHouseCands, houseCands,
viewCast` — five names that read like five features the harness had lost. They were
five names that were never functions: `snap` and `genHouseCands` are typos of
`snapshot` and `genHouseCand`, `houseCands` is the state field the generator fills
(`S.houseCands`), `switchbiz` is an action id the ui dispatches, and `viewCast` has
never existed — the cast screen is `viewPeople`. The list named them now, and both
of the real functions are exported to the gates for the first time. It prints
`missing: (none)`, which is the point: a line that is always wrong trains everyone
reading it to ignore the one time it is right.

**State:** **41 gates · 41 passed · ALL GATES CLEAN (126s)** · the seam **11/11**
· a world on a phone **seed 4242 · 8 quarters · turn 8 · save 10,867 chars · 2
device keys** · determinism **seed 4242 twice → ₦25,851,210** · the bridge **10
types, 13 malformed rejected** · the save crosses **both directions, quarter by
quarter** · the shell's payload **1,057,104 chars, sha `67c277af1403dfab`,
identical in `ledger/`, `apps/mobile/assets/game/`, `apps/phone/www/` and
`apps/phone/android/app/src/main/assets/public/`**.

### 22.54 — The app's own face, and a gate that looks at pixels

The question that found this was the simplest one available: *is this now a
deployable app with all its resources?* Everything the gate checked said yes — the
payload byte-identical to the zip, the web icons parsed at the right sizes, a store
id, a dark splash config, plugins wired into Gradle. So the answer was checked
against the one place a gate cannot see with a filename: `npx cap add android`
writes a **template**, and a template has its own face.

Looking at the files:

| the Android project shipped | should have been |
|---|---|
| Capacitor's light-blue cross on a white plate, in `ic_launcher.png`, `ic_launcher_round.png` and `ic_launcher_foreground.png`, at all five densities | the game's gold **L** on `#080b10` |
| `ic_launcher_background.xml` = `#FFFFFF` | `#080b10` — a *white* plate behind a dark game, and the adaptive icon is the shape a launcher actually draws |
| `splash.png` in eleven folders — a white splash | dark, or the app flashes white before the first frame |

Every dimension was correct and every picture was somebody else's. Same class as
§22.51, one layer down: an app that installs, launches, and wears the framework's
logo.

**The fix is one drawing.** `tools/native-assets.mjs` renders from
`ledger/icon.svg` — the same file the PWA icons, the favicon and the zip carry —
at the background colour read from `capacitor.config.json`. The plate rect is
stripped for the adaptive foreground, which is drawn inside the 62% safe zone on
transparency so a player's launcher shape shows the app's colour, not white. It
writes the five densities (48/72/96/144/192), round and adaptive-foreground
flavours, the eleven splash screens (portrait, landscape, five densities), the
plate colour, and committed **masters** in `apps/phone/resources/` for a store
listing and for the next `cap add`. It is idempotent (a second run reports every
file unchanged), it is in `tools/rebuild.sh`, and where playwright is not installed
it skips rather than failing a build over a drawing tool.

**The gate learned to look.** Dimension checks cannot tell one icon from another,
so `.harness/png.js` — a dependency-free PNG decoder, `zlib` and nothing else,
8-bit non-interlaced, RGB/RGBA/grey — turns any PNG into an 8×8 grid of average
colours, and the `phone` gate compares each native icon to the web icon rendered
from the same SVG, cell by cell.

* Measured: the game's mark sits **2.5–8.6** from the web icon at every size
  (resampling, nothing else); the template's cross sat at **153.9**. The threshold
  is 30, and the number worth remembering is the gap.
* Proved to fail, then reverted: one template icon restored →
  `mipmap-mdpi/ic_launcher.png is not the game's mark — it is whatever cap add
  shipped, and a distance of 153.9 says so`; plate set to white →
  `the adaptive icon's plate is #FFFFFF and the app is #080b10 — a light plate
  behind the mark is the template talking`.
* Also checked, because they are the same class of mistake: the adaptive
  foreground must be mostly transparent (`>60% drawn` fails — it would be cropped
  by the launcher's shape), the splashes' corner pixel is the app's colour, and the
  masters exist and are the mark.
* The four library functions are exported (`decode`, `signature`, `distance`,
  `coverage`) because comparing a picture to a picture is a thing the next gate
  will want, too.

#### The same bug, one project over

The React Native app had it too, and in the more embarrassing direction:
`expo.icon` pointed at `./assets/game/icon-512.png` — the *web* icon, at half the
size a store listing asks for — `expo.splash` pointed at the maskable web icon, and
`android.adaptiveIcon` was not declared at all, so Expo would have used the plain
icon for the layer Android crops to the player's chosen shape. Per the rule that
learned this lesson twice now: one drawing, one colour. `tools/native-assets.mjs`
now paints both apps' faces from `ledger/icon.svg` — `apps/mobile/assets/icon.png`
(1024), `adaptive-icon.png` (the mark alone, inside the safe zone), `splash-icon.png`
and `favicon.png` — and `app.json` names them, with the adaptive plate at
`#080b10`. The `rn` gate checks the same way the `phone` gate does: decode, compare
to the web icon pixel by pixel, assert the icon is at least 1024 for a store, and
assert the adaptive foreground is mostly transparent. Proved to fail by putting a
48px template picture in its place: *icon is 48px - a store wants at least 1024px;
icon is not the game's mark (distance 153.9)*.

#### The page that lets a person look

A gate can prove the pixels are right and still leave the question "which picture
is ours" unanswered to anyone who is not reading gate output. `tools/faces.mjs`
writes `LEDGER-faces.html`: every picture the three apps ship, inlined as data
URIs and inline SVG — 478 kB, no network, opens from a filesystem or the zip like
the game itself — with its size, its decoded corner colour, and its measured
distance to the mark. Byte-identical files are counted rather than repeated
(thirteen of them: the zip, `apps/phone/www/`, the synced Android payload and
`apps/mobile/assets/game/` carry the same bytes), the splash folders are listed
with the corner colour that proves there is no white flash, and the adaptive
layers are shown on a chequerboard so "the plate is not drawn" is visible rather
than asserted. Regenerated by `tools/rebuild.sh`.

**State:** **41 gates · 41 passed · ALL GATES CLEAN (128s)** · the faces: **36
files from one SVG** (5 densities × 3 flavours, 11 splashes, plate, 5 masters, 4
Expo) ·
single file **1,056,389 chars** · ledger **644 / 675 · 0 lost · 85 declared** · zip
**341,339 B · 10 files** · the app's game **1,057,104 chars · sha
`67c277af1403dfab`**, identical in `ledger/`, `apps/mobile/assets/game/`,
`apps/phone/www/` and the synced Android project.

**Still not claimed:** no APK is built here (no Android SDK in this container) and
no iOS project exists (no macOS) — the masters in `resources/` are what both need.
A native share sheet and an in-app back button remain stated shortfalls, and a save
still cannot carry a decision that is already on the table.

### 22.55 — The workspace, accounted for, file by file

The rule this project has kept since §22.24: nothing goes until it is written
down, with what it was and the evidence it was dead. Deleted, in one pass, with
that evidence collected first:

| what | size | what it was | evidence it was dead |
|---|---|---|---|
| `apps/web/web-*.png` — 31 files | 4.6 MB | screenshots of the app walk | no code writes them (no `screenshot(` call anywhere in `.harness/`), no document names them, and the 31 filenames appear in zero files in the repository. They were the evidence trail of a walk that has since been replaced by gates that assert instead of photograph |
| `apps/web/.next-gate/` | 132 MB | the `appshell` gate's own build of the app | **not dead — relocated.** It existed because a gate must be able to build while a dev server holds `.next`. It is now `.next/gate`: inside `.next`, which git, the snapshot and any checkout already ignore, so the gate keeps its independence and the workspace stops carrying 132 MB of it |
| `.harness/check.js`, `.harness/mod.js` | 2.0 MB | the composed module and the name loader the gates require | regenerated by `tools/rebuild.sh` on every build, which `npm test` runs first; `run.js` already refused to run without them and said *"mod.js is missing — run `npm run build` first"*, so the failure mode was a sentence, not a stack trace |
| `apps/web/tsconfig.tsbuildinfo` | 38 KB | TypeScript's incremental cache | written by `tsc`, named by nothing, now gitignored alongside `.next/` |
| `apps/phone/android/app/build/` | 0 B | an empty directory from `cap sync` | nothing in it |
| `apps/web/.next/` | 138 MB | the dev server's build | **kept, and deliberately**: it is needed by the server that is running, and it is already excluded from snapshots and from git |

Also left alone, with the reason: `dist/index.html` (1.1 MB) is *not* a duplicate of
`ledger/index.html` — `tools/bundle.mjs` composes the file, writes both, and then
asserts the two are byte-identical, which is a check, not a spare copy.
`apps/phone/android/` (1.7 MB) is generated and gitignored, and would be restored
by `npx cap add android` — but the launcher icons, the round icons, the adaptive
foregrounds and the eleven splash screens in it are the app's face, and a gate
compares them pixel by pixel, so it stays. `reference/baseline-single-file.html`
is the immutable original the whole statement ledger is measured against: nothing
deletes it, ever.

**Workspace:** 1.2 GB → **1.0 GB** where 0.9 GB of that is `node_modules`,
`.next`, `.cache` (playwright's browser) and `.npm` — all of it excluded from
snapshots and git, and all of it regenerable by the installs in README's *Fresh
checkout*. **apps/web: 223 MB → 87 MB. `.harness`: 2.7 MB → 724 KB of source only
(no generated intermediates).**

### 22.56 — The design measured, the tests split into three layers, and a workspace that is only the project

Four things were asked for at once, and they turned out to be one thing: make this
repository *legible* — its design, its tests, its CI, and its files.

#### The design, measured rather than asserted

`tests/e2e/layout-and-copy.test.js` walks the game in a real Chromium at **390×844**
and **1440×900** and measures the claims responsive design always makes by eye:

| the claim | the rule | what it found |
|---|---|---|
| it fits the phone | no sideways scroll (≤2px of rounding) | held |
| the chrome leaves you the screen | at most **15% of the viewport height** at 390px — a proportion, so a taller phone gets the same share rather than the same 87 pixels | 87px → **90px** after the type floor moved, still 10.7% |
| every control is a fingertip | ≥30px in both dimensions, at every width | **four controls failed**: the "?" on a card (24×24), the "?" in the header (27×30), Expand all / Collapse all (25 tall), the era chip (27 tall). All four were under the thumb minimum on *every* device — the phone block grew the buttons that were merely small and never covered the ones that are small by design |
| you can read it | no type under **11px** | **eleven declarations** were under it — 8.5, 9, 9.5, 10, 10.5px across metric labels, table headings, tags, tier headings, the header's stat labels ("Net worth", "Freedom" at 8.5px) and the brand line. All raised; the marks that are glyphs (the chevrons, the dot) kept theirs, because a mark does not need to be read |
| nothing is cut off | no text spilling out of a box that cannot scroll (measured per text node, scrollers exempt) | held |
| the copy is copy, not paragraphs | no control label over 42 characters, no body paragraph over 320 | held — and the rule caught its own bug first: the era chip measured as a **216-character label** because `textContent` reads a hidden popover too. A length is a length only if the player can see it |

Before the fix, the widest failure was five labels at 8.5px on the phone. After
it: **0 tiny, 0 spills, 0 long labels, 0 sideways scroll, 5 tabs measured, 0
controls under a fingertip**. The rules assert relationships, so a future
`font-size` or a new chip cannot quietly pass — and the `.harness/mobile.js` gate,
which asserts *rows* plus a 95px budget, still passes at 90px.

#### The tests, in three layers

The gates were never a test suite in the ordinary sense and never claimed to be:
they make specific classes of drift impossible and they print sentences. What was
missing was the layer below and the layer beside. `tests/` is now:

| layer | contents | runtime |
|---|---|---|
| **unit** (32 tests) | the PNG reader against a second, independent writer (`helpers/png-writer.js`); the WebView bridge — ten types, thirteen shapes of refusal; the native host's mirror, write-behind flush, cold start, slot wiping, mirror bound and eleven seam slots | seconds, no DOM, no browser |
| **integration** (15 tests) | a run crossing between the browser and the phone — same blob, same keys one prefix apart, four quarters across two runtimes equal to four in one — and the build's own contracts: ten files in the zip, every copy of the game the same bytes, stamps that describe what they are stamped against, every face the mark, the copier idempotent | a few seconds |
| **e2e** (8 tests) | the player's journey — open, begin, play a quarter, reload keeps it — on the zip, on the store build's payload, **from a `file://` URL the way an installed WebView loads it**, and on the React app; installability with the network off; and the design table above | ~1 minute, Chromium |

`npm test` runs all three and then the gates, in that order. Two lessons are
written into it: a test's fixture has to be state a player can be in (the
auto-save contract — `newGame()` writes through the installed host — rewrote two
tests), and a failure has to name the thing (every assertion carries the value and
the expectation).

#### Continuous integration

`.github/workflows/tests.yml`: **build** (composes, syncs every payload, uploads
the zip, the single file and the faces page), **unit** on Node 20 *and* 22,
**integration**, **e2e** (Chromium, failure screenshots uploaded), **gates**, and
a **summary** job that prints all five results on one line. The browser binary is
cached keyed on the lockfile, and each job installs only what it runs.

#### The workspace, accounted for

| removed | why it was dead |
|---|---|
| `.github/workflows/gates.yml` | superseded by `tests.yml`, which runs the same 41 gates as one job among five. Two workflows running the same suite is two places to update and one of them silently stale |
| 31 `apps/web/web-*.png`, `tsconfig.tsbuildinfo`, `.next-gate/` (132 MB), `apps/phone/android/app/build/`, `.harness/{check,mod}.js` (2 MB) | accounted for in §22.55, earlier in this batch |

#### One more thing the cleanup broke, and caught

Moving the gate's build from `.next-gate` to `.next/gate` was done by editing the
string with `=` in it — the log line — and leaving the two `env:` literals alone.
So the gate *checked* `.next/gate` for freshness while Next *built* into
`.next-gate`: it rebuilt the app on every run instead of reusing it, served from
the directory it had just written, and left 125 MB in the one place the move was
supposed to stop leaving anything. It passed every gate the whole time, because a
stale-check that always says "stale" is a slow gate, not a wrong one.

Found by measuring the workspace after the cleanup rather than by reading the diff:
`du -sh apps/web` was 125 MB when it should have been 87. The four references —
`DIST`, both `env:` values, and `apps/web/tsconfig.json`'s include — now agree, the
directory is gone, and the gate reports `reusing .next/gate (newer than every
source file)`, which is the line that proves it.

**State:** **41 gates · 41 passed** · **unit 32 · integration 15 · e2e 8, all
passing** · single file **1,058,832 chars** · ledger **644 / 675 · 0 lost · 85
declared** · zip **342,048 B · 10 files** · the app's game **sha `0ec5278b810a138c`**,
identical in all four places · the design: **chrome 90px of 844 (10.7%) · 0 tiny ·
0 spills · 0 long labels · 0 sideways scroll · 5 tabs**.

### 22.57 — How to deploy, and the check that says you can

The repository had three deploy paths and no page that put them together, and one
of its own claims was a sentence from a batch: §22.52 said *"every `COPY` source is
asserted to exist"* — asserted once, by hand, and never again. That is the shape of
claim that goes stale silently, so it is `tools/deploy-check.mjs` now and
`npm run deploy:check` runs it.

**What it checks, because it is the first failure of each build:**

| deploy | checked |
|---|---|
| the single file | both `Dockerfile.static` COPY sources exist; the payload is ten files with all five companions; `nginx.conf` has the manifest MIME type, does not cache `sw.js`, and never lists a directory; `ledger-app.zip` is newer than the game inside it |
| the React app | `vercel.json` builds the workspace and points at a real output directory; the lockfile npm ci needs is committed; **all seven** `Dockerfile` COPY sources exist in both stages; the image binds `0.0.0.0:3007` |
| the phone build | `capacitor.config.json` parses, the appId is set, `webDir` is the directory the build writes; `www/` and the synced Android project both hold the game **byte for byte**; the store icon and splash masters exist; the shell's README exists |
| before any of it | the single file is built; there is a **git repository** (there was not — Vercel and Actions deploy from one) |

It also checks the claim that a deploy is unconfigured — no environment variables,
no secrets — and it names them rather than counting them, because the first
version failed on `next.config.mjs` reading `LEDGER_DIST_DIR`, which is a build
knob. The rule is now a short allow-list (`LEDGER_DIST_DIR`, `NODE_ENV`, `BUILD_ID`,
`PORT`) and anything else is a blocker.

**What it is not:** a build. There is no Docker in this container and no Android
SDK, so no image and no APK are produced here, and the page says so instead of
implying otherwise. What it removes is the class of failure that *is* the
repository's to make: a file the build names and the tree does not have.

**`DEPLOY.md`** is the page: pick by what you want (a link somebody can play, an
installable app on a URL, or a store listing), the commands for each, the two
things that actually bite (a service worker needs https; `sw.js` must never be
served from a cache), and a closing section that separates what was verified in
this workspace from what needs a machine with the toolchain.

**State:** `npm run deploy:check` **clean** — 40 inputs checked, 1 blocker found
and fixed in the writing of it (the env-var rule above), 5 notes printed. Two new
scripts (`deploy:check`, `deploy:static`, `deploy:app`) and `DEPLOY.md`; README's
Deploying section now opens by pointing at it.

### 22.58 — What a fresh sandbox taught the build, in one turn

The workspace persists; the toolchain does not. `node_modules`, `dist/` and the
browser cache are excluded from snapshots by design, so the session that started
by asking "how to deploy" began with none of them — and running the integration
suite without a build produced this:

```
ENOENT: no such file or directory, open '/home/user/dist/index.html'
ERR_MODULE_NOT_FOUND: Cannot find package '@ledger/core' imported from packages/ui/index.js
```

Both are correct and both are terrible diagnostics: a missing `npm run build` and a
missing `npm install` arrived as the kind of error that reads like broken code.
Four fixes, each of them a thing this repository was relying on somebody
remembering:

1. **The integration suite says the step.** Its first test is now a preflight —
   *"there is no dist/index.html — run `npm run build` (this suite asserts the built
   payload, it cannot invent it)"* and *"the workspace is not linked — run `npm
   install` at the repository root, which is what makes `@ledger/core` resolvable
   by name"*. Six assertions deep became one sentence at the top.
2. **`npm run test:integration` and `test:e2e` build first** (`pretest:integration`,
   `pretest:e2e`). Both assert built artifacts; neither should depend on the caller
   having built. `test:unit` deliberately does not — it needs no build, no DOM and
   no browser, and that is what makes it the fast layer.
3. **The face painter skips instead of half-finishing.** Chromium could not start
   (no `libnspr4` until a system apt-install), and `tools/native-assets.mjs` died
   *after* the payloads had been copied and *before* the icons were painted —
   leaving the tree in a state nobody asked for. It now catches a launch failure
   the same way it already caught a missing playwright: one line naming what is
   missing, exit 0, the faces already in the tree untouched, and the gates still
   comparing them pixel by pixel. Proved by pointing `PLAYWRIGHT_BROWSERS_PATH` at
   a directory that does not exist: skip, exit 0, build continues.
4. **The build prints one unit.** `bundle.mjs` logged JavaScript string length
   while the payload copier, the zip and every test reported bytes — 1,058,117
   against 1,058,832 for the same file, because the game carries 715 multi-byte
   characters (₦, ▸, ·). Chasing that at midnight is exactly the kind of hour this
   repository is built to avoid; the build reports bytes now, and both numbers say
   **1,058,832**.

**State:** **41 gates · 41 passed · ALL GATES CLEAN (134s)** · unit **32** ·
integration **16** · e2e **8** · `deploy:check` **clean** · single file
**1,058,832 bytes** sha `de89a07e694f77ef` · zip **342,048 B · 10 files**.

---

### 22.59 — The backend was never absent; it was unaudited

**Request.** *"so no backend?"* — after §22.57 described four ways to deploy and
mentioned a *fourth, optional* one the reader could be forgiven for not believing.

There is a backend, and there has been since §15: a player's own Supabase
project, which the game uses for exactly two things — syncing the save across the
player's devices, and publishing a season score to a leaderboard. It is optional
in the strict sense: `packages/core/src/10a-cloud-api.js` is the whole of it (it was
`10-ensureprofile.js` until §22.60 split the requests out of the profile),
and with the four Settings fields empty the game boots, plays and banks a whole
career without ever making a request. `CLOUD_SQL` — the schema, 1,695 characters
of it — has been sitting inside that file, inlined into the shipped page, since
the day it was written, and was never once run against anything.

#### What ships now

| what | where | what it is |
|---|---|---|
| `deploy/supabase.sql` | generated by `tools/supabase-sql.mjs` | `CLOUD_SQL` **verbatim** under a header: how to stand it up, what the browser holds, why the RLS is written as it is, and *GENERATED — do not hand-edit* |
| `tests/integration/backend.test.js` | 7 tests | parses the `.sql` and the client's actual requests, and makes them agree |
| `tools/deploy-check.mjs` § THE BACKEND | 6 checks | the file exists · is marked generated · has 3 tables · has RLS · still matches `CLOUD_SQL` (`--check`) · ships no `service_role` key |
| `DEPLOY.md` §4 | the fourth path | honest about what was verified (the file, the paths, the tests) and what was not (no live project was ever contacted) |

The three tables and what they are for:

| table | columns | used by |
|---|---|---|
| `profiles` | `id`·`user_id`·`data`·`updated_at` | push/pull the save — `POST /rest/v1/profiles?on_conflict=id` |
| `seasons` | `code`·`config`·`created_by`·`created_at` | publishing a season's fixed finish line |
| `season_runs` | `id`·`code`·`user_id`·`player`·`total`·`score`·`submitted_at`, **unique (code, user_id)** | one row per player per season — the unique constraint *is* the anti-cheat: a resubmission updates your row, it does not add one |

Seven policies, every one of them keyed on `auth.uid()`; RLS on all three tables.
A player's `data` is readable by nobody but its owner; a `season_runs` row is
readable by the cohort and writable only by its author. The anon key is public by
design — that is what an anon key *is* — and no `service_role` key exists anywhere
in the tree, which deploy-check now asserts rather than assumes.

#### The test is a parser, and a parser that finds nothing passes everything

`backend.test.js` does not run SQL and does not talk to Supabase. It reads
`deploy/supabase.sql` and recovers the schema from it, reads
`packages/core/core.js` and recovers the requests from it, and asserts the two
describe the same world: every column the client writes exists in the table, the
`on_conflict` target is a real unique constraint, the leaderboard's
`select=player,total,score,submitted_at&order=total.desc` names columns that
exist, no body carries a field the schema would reject.

Which means the failure mode is silence. Two things prevent it:

1. **It prints what it saw** — *8 queries found*, including the leaderboard's four
   columns. If the parser stops finding things, the run says so.
2. **The drift was proved** — renaming `player` to `player_name` in the schema
   fired tests 2 and 3 by name. Restored. (Same lesson as §22.58's byte-count:
   a check nobody has watched fail is a check nobody knows the shape of.)

Recovering the requests needed one piece of care worth recording: reading *only
the literal after a regex* misses `seasonUrl('seasons?code=eq.' + x + '&select=config')`
and quietly leaves half the backend unchecked — join the whole argument's string
literals, placeholder the dynamic parts. A URL builder also appears bare
(`'/rest/v1/' + path`), which is the pattern itself and must be skipped.

#### Two sandbox lessons, both about diagnostics

* **"Target page, context or browser has been closed" is not a concurrency bug.**
  It is what playwright says when Chromium cannot start because `libnspr4` and
  eleven other shared libraries are missing — they live outside `/home/user`, so a
  fresh container always loses them, and the message points nowhere near the
  cause. `tests/helpers/web.js` now exports `launch()`, which runs `ldd` on the
  chromium binary, finds the missing libraries and prints the install line;
  `tools/native-assets.mjs` does the same inline. All three e2e files launch
  through the helper. Proved by removing one library and reading what comes out
  (`libnspr4` was uninstalled, the message read, the library put back):

  ```
  browserType.launch: Target page, context or browser has been closed
    chromium cannot start: 4 shared libraries are missing (libnspr4.so, libnss3.so,
    libnssutil3.so, libsmime3.so). Install them:
    sudo apt-get install -y libnspr4 libnss3 libasound2t64 libatk1.0-0t64 …
  ```

  The sentence that used to be the whole message is still first — playwright's own
  wording is not hidden, it is corrected.
* **The three installs have an order.** npm treats this tree as one project, so
  `npm install --prefix tools` after `.harness/` prunes `.harness/node_modules` as
  misplaced — playwright "disappears", the face painter skips, the browser gates
  cannot start. `npm run setup` does all four steps in the order that works —
  root, `tools`, `.harness`, then `npx playwright install chromium` — and so does
  *Fresh checkout* in MIGRATION.md, which now states the rule instead of the
  recipe. (`--prefix` from the root does not cross-prune; that is why the script
  is shaped this way.)

#### Is the backend mangled with the frontend?

Asked plainly, and the answer had to be measured rather than asserted — so it was:
`tests/unit/boundary.test.js`, **9 tests**, added in the same breath.

**The wire is clean.** The UI package (`packages/ui/src`, 18 files) contains no
`fetch`, no `XMLHttpRequest`, no `WebSocket`, no beacon, no `supabase`, no
`/rest/v1`, no `/auth/v1`, no table name and no SQL — its entire contact with the
backend is five action handlers and one background-sync call. Core contains no
`document`, no `window`, no storage and no `innerHTML`; its type check compiles
with `"lib": ["es2022"]`, which has no DOM types in it at all. The dependency runs
one way: core never imports the UI.

**Everything core knows about the page goes through one function.** `Q()` is
`host.el`, installed by whichever platform is running — and across 32 sections
there is exactly **one** call site: `cloudReadForm()`, reading the four credential
fields back out of the form. That is the whole seam, in one place, for one reason.

**What is genuinely muddled is the file layout, not the wire.** The backend's own
form — URL, key, email, password, Sign in, Create account, Upload, Download &
merge, Sign out, and the `<details>` box holding the DDL — is emitted as markup by
`profileModal()` — in `20-runinfomodal.js` then, in `20a-profile-and-cloud-modal.js`
after §22.60 — and drawn
by the UI as markup (`host.innerHTML`) rather than as a converted React tree.
`settingsModal()`, the modal a player would call "Settings", lives in a third file
and holds no backend fields. So "where is the backend's UI?" is a question the
filenames answer wrongly. Fixing that is a *declared change* (it moves a modal onto
the React path), so it is proposed rather than done quietly.

**The seam's silent failure is now tested behaviourally.** `profileModal()` draws
the inputs; `cloudReadForm()` reads them back by id. Rename either side and nothing
throws — the player is told "add your project URL and anon key first" while looking
at the four fields they filled in. So the test draws the form, types four values
into the fields it drew, reads them back with the client's own reader, and compares
the credentials object. It installs the host the way the web build installs it
(`el: Q`) rather than a lookalike — without a host, core's `el` returns `null` and
every field reads empty, which would let this test pass on a form that is broken.

**Both guards were made to fail before they were trusted:**

| drift introduced | what fired |
|---|---|
| `id="pUrl"` → `id="projectUrl"` in the form | *the form does not draw every field the client reads back: missing pUrl (it draws modal, projectUrl, pKey, pMail, pPw)* |
| a `fetch()` added to a UI action | *the UI package makes no requests: it draws, and core talks. Found: packages/ui/src/17-actions.js → fetch(* |

Both restored; `tools/makecore.mjs` reproduces `packages/core/core.js` byte for
byte afterwards, so the drift proven against the built file is the drift a source
edit would produce. One finding came out of writing it: the first version compared
the *built* markup against the *source* reader — two different artifacts, a guard
that could not fail. The round trip replaced it. (Same lesson as §22.58's byte
count and §22.59's parser: a check nobody has watched fail is a check nobody knows
the shape of.)

And the offline claim got the strongest form it can have: not that the request
fails, but that there is none — `cloudReady()` is a three-way AND over the player's
own configuration, asserted at the source, so an unconfigured game is an offline
game.

**State:** **41 gates · 41 passed · ALL GATES CLEAN (113s)** · unit **41/41**
(png 8 · host-mirror 15 · bridge 9 · **boundary 9**) ·
integration **23/23** (save-crosses 6 · payload 10 · backend 7) · e2e **8/8** ·
`deploy:check` **clean** · single file **1,058,832 bytes** sha `de89a07e694f77ef` ·
zip **342,048 B · 10 files** · faces **36 files** painted from `ledger/icon.svg`.

---

### 22.60 — The API layer, separated

**Request.** *"are there actual APIs? separate them abeg"*

There are, and they are not ours. The game is a client of the two APIs a Supabase
project exposes: **PostgREST** (the REST API generated over the three tables) and
**GoTrue** (Supabase's auth service). Ten request sites reach five endpoints:

| what | method and path |
|---|---|
| create an account | `POST /auth/v1/signup` |
| sign in | `POST /auth/v1/token?grant_type=password` |
| stay signed in | `POST /auth/v1/token?grant_type=refresh_token` |
| upload / download the save | `POST|GET /rest/v1/profiles?on_conflict=id`, `?select=data&id=eq.{profile}` |
| publish / read a season | `POST|GET /rest/v1/seasons` |
| submit a run / the board | `POST /rest/v1/season_runs` · `GET …?select=player,total,score,submitted_at&order=total.desc` |

Every one of them used to be scattered: the profile file held the schema string,
the season calls, the auth calls and the push/pull; `11-cloudpull.js` held the
pull. The file that named the whole surface said "profiles, runs, ratings".

#### What moved, and what it cost

| was | is | evidence |
|---|---|---|
| `src/10-ensureprofile.js` (416 lines: profile **and** every request) | `src/10-ensureprofile.js` (177 lines: the record, the rating, the tuning) + **`src/10a-cloud-api.js`** (the schema, `seasonUrl`, the season calls, auth, push/pull) | the split lands on a clean seam: everything from `const CLOUD_SQL` down was already the API, and nothing above it was |
| `src/11-cloudpull.js` (cloudPull, profileSummary, exportStr/importStr, subsFor, bigStat) | `cloudPull` moved into the API file; the file is now **`src/11-profilesummary-and-strings.js`** | its name described 21 of its 70 lines |
| `src/20-runinfomodal.js` (run history **and** the account/cloud modal) | `src/20-runinfomodal.js` (run history) + **`src/20a-profile-and-cloud-modal.js`** | two modals, two questions, one file |

**Two steps, so the claim could be proved rather than asserted.** First the move
alone, with not one character added or removed: the bundle came back
**1,058,832 bytes, sha `de89a07e694f77ef`** — the identical file, statement ledger
644/675, so the separation is structural and provably changes no behaviour. Then
the three headers, which cost **3,285 bytes** and took the payload to 1,062,117
(sha `eb0f12a0941905c8`, zip 343,166 B) — a 0.3% increase, all of it prose a
reader wants: the endpoint table, what the anon key is for, and what is *not* in
the file.

**A 289-byte phantom bug, filed and then un-filed.** The headers measured 2,998
characters and the bundle grew by 3,287, so 289 bytes were unaccounted for. They
were not a bug: `len()` counts characters, the build counts bytes, and those
headers are full of `─`, `—` and `·` — 145 multi-byte characters, 3,285 bytes
exactly. This is §22.58's lesson in the other direction: there the byte count was
wrong because string length was used, here a *correct* byte count looked wrong
because a character count was used to check it. **Both numbers are now stated in
the unit the other one is not.**

#### The surface is locked, not reviewed

`tests/unit/boundary.test.js` grew two claims, and both were made to fail first:

| claim | drift introduced | what fired |
|---|---|---|
| the API is **one file** | a `fetch()` added to another section | *the game makes its requests in one file and nowhere else. Found: 10a-cloud-api.js, 12-main.js* |
| the surface is **five endpoints, ten sites, all documented** | an eleventh call site added | *ten request sites reach those five endpoints… Found: 11 — if this is 11, a new call was added and the table in the header needs it too* |

The endpoint scan reads **both spellings**, because the code has two: the auth and
profiles calls are written as paths, the season calls go through
`seasonUrl('seasons?code=eq.…')`. A scan that reads only the literal after the
builder finds three endpoints and misses two — the mistake §22.59 records, in the
same family as a check that cannot fail.

#### What the separation immediately broke, and what that bought

Three guards went red the moment the files moved, and every one of them was
right to. Two were mine, pinned to old filenames. The third was the backend
suite, and its failure was the interesting one:

> *profiles has no column "id | [{id" (the client reads it)*

The API file documents its endpoints in a header table — and the backend parser
was scanning raw text, so it read the **documentation as requests**. The fix is
the distinction the two suites now state in opposite directions: `boundary`
strips comments so a note saying "we never call X" is not counted as calling X;
`backend` strips comments so the table describing the calls is not counted as the
calls. Both directions cost a red test to learn.

#### And the mirror stopped being a ritual

Splitting a section left five files unmirrored in `packages/flat`, and only the
`modules` gate knew:

> *sections edited but not mirrored into packages/flat: core/10a-cloud-api.js
> (missing from flat) … — mirror them, or the bootstrap will quietly undo them*

That directory is the record of what the module converter was handed, kept so a
future `split.mjs --bootstrap` cannot silently revert hand work. It used to be
kept by hand, and the hand forgot. **`npm run mirror`** now copies `src → flat`,
drops sections that no longer exist (a stale record would restore code that was
deliberately removed), and `--check` reports drift for CI.

**State:** **unit 42/42** (png 8 · host-mirror 15 · bridge 9 · boundary 10) ·
integration **23/23** · e2e **8/8** · **gates 41/41 — MODULES CLEAN among them** ·
`deploy:check` clean · single file **1,062,117 bytes** sha `eb0f12a0941905c8` ·
zip **343,166 B · 10 files** · **34 core sections**.

---

### 22.61 — The onboarding, the profile, and knowing your progress is kept

The ask was three things at once: *"proper onboarding and profile and information
slash progress autosave."* The game had a one-wall start modal with a name box,
eleven fields and a difficulty rail on it; a profile screen that only existed
behind a Settings button; and no way, anywhere, to know whether the run you were
playing would still be there tomorrow.

#### The start screen is three steps now

The wall became a rail — `1 You · 2 Start · 3 Rules` — and the rail is the
navigation: `data-a="step"` jumps, `stepnext` / `stepback` walk, and the step you
are on carries `aria-current="step"`.

| step | what is on it |
|---|---|
| **1 You** | the name, where you live, and — when a save exists — the resume card: *Continue* (`data-a="load" data-s="auto"`) or *Start fresh* (`data-a="restart"`), with the run's name, quarter and net worth on it |
| **2 Start** | who you are on day one: four profiles as cards, the chosen one keeping its blurb and its trait chips |
| **3 Rules** | difficulty and the season row, with the season-pinned tier disabled and the override note where it applies |

Every string that was on the wall is still on a step; nothing was reworded to fit.
The name is the only thing required, and the only thing that can refuse: pressing
Next with an empty name says *"Give your character a name first."* and stays put.
A who-line under the rail says `Ada · Lagos`, so you can see what you have
answered without walking back.

Three step bodies that render separately are three places for a field to be drawn
and never read, which is exactly what happened (below).

#### Progress is kept, and it says so

`save()` writes after every move — debounced, then flushed on
`visibilitychange` and `pagehide` — and the save blob now carries two fields that
make the *when* and the *who* recoverable from the blob alone:

- **`at`** — when it was last written
- **`head`** — `{name, age, turn, nw, city}`, one line about the run

Pre-header saves return `head: null` and the callers say what they can rather
than inventing a quarter. Coming back announces itself exactly once: *"Welcome
back, Ada — Q2 2026 · ₦132k · saved just now."* Hardcore never autosaves, and
says so in words rather than by a chip that is quietly absent.

**The header says whether you are safe.** It was built as a chip beside the bell
first, and the phone budget killed it: in the widest case (era chip and season
chip both showing) the action row has about **fourteen pixels of slack**, so a
fourth control there wrapped the header to **three rows and 121px** against a
**95px** budget. The save state is now a line under the brand instead. Measured,
that costs no width at all — it is narrower than the word LEDGER — and the brand
block stacks on a phone so it does not push the row. It is still a control
(`data-a="goprofile"`, opening the record), and its hit area is padded to 30px
with a negative margin, so the thumb gets the 30px and the header keeps its two
rows: **2 rows · 90px · 0 controls under 30px**.

The same facts get a full card at the top of the record screen, which is where a
player goes to ask: the handle, how the profile is stored (*stored on this device
only* / *synced across your devices*), when it was last written, and buttons to
sync and to the slots. The profile modal no longer repeats it — one fact, one
place, and the modal is the handle and the sign-in.

**And the name you type is your handle.** It was not: the profile said *"No handle
yet"* to a player who had been Ada since the first screen. A run's start now sets
the handle if none is set. It is a default, not a rule — the profile can be
renamed.

#### The bug underneath, and the two it hid

**The name box had no listener at all.** `renderStart()` draws its own markup and
called `renderModal()` instead of `render()`, so `bindInputs()` — which lives in
the render path — never ran on the start screen. `#inName` had no `input` handler
and `_cfg.name` stayed empty however much you typed. Latent since the original
file; invisible until a step button asked `_cfg` instead of the DOM, at which
point the flow simply did not advance. Fixed in the way that generalises: **a
screen that draws itself binds what it draws, and a field is read where it
lives** — `renderStart()` now binds, and every reader reads
`inputValue('inName') || _cfg.name`.

The first-quarter coach stayed for two quarters. Its guard was `S.turn > 1`, and
`S.turn` is zero-based — the first quarter *is* turn 0 — so it showed on Q2 as
well. It is now `S.turn > 0`, with the comment that says why, and the probe that
told the difference: `.fmcard` present at Q2, absent after one more quarter,
absent after a reload.

#### Four gates had to learn the new flow

The staged screen is a change to where things are, and four gates were asserting
they were all on one screen. Each was updated by **walking the flow, never by
weakening the assertion**:

- `season` — the same four assertions (other cities disabled, other difficulties
  disabled, only the season profile offered, *set by the season* shown), each read
  on the step it now lives on.
- `single` — the boot check now asserts the thing that greets a player is the
  start screen *with its rail and its name field*, and its Begin walk fills the
  name, walks two steps and presses the button.
- `appshell` — the same, through the app's React shell.
- `mobile` — the header budget and the 30px tap-target rule, which is what
  caught the save line measuring 29.65px and the brand block costing 76px when it
  was a flex sibling.

Two gates that reach *into* core needed the new functions to be reachable at all:
`.harness/build.js` now exports `noteSaved`, `savedAtLabel`, `saveLineHTML` and
`profileHeadHTML` from the single-file build, and complains by name when one is
missing (`missing: (none)`).

`react-screen` was red for a different reason, and the honest fix was to remove
nondeterminism rather than to mask it: it compares 29 routes drawn two ways, in
one process, by two game instances — and the profile id is minted randomly
(`pm` + eight characters), so the two instances printed different ids for the
same unset profile. The fixture now pins the id, and pins the save timestamp the
same way, for the same reason it already froze the clock.

#### A generator ran with the wrong argument, and took the package with it

`node tools/tomodules.mjs packages/core/src --out=packages/core` — the tool's
usage line is `--out=packages/ui/modules`, and pointed at the package root it
treated `packages/core` as its output directory: it wrote **35 section copies**
into the package root, and **deleted the files it does not produce** —
`core.js`, `index.js`, and `host.js`. `core.js` is generated and came back on the
next build; `index.js` is fifteen lines and was restored verbatim; **`host.js` is
hand-written and existed nowhere on disk.** Its text was recovered from the Next
build's webpack cache, where a previous build had inlined `core.js` — and with it
the host's whole body, comments and all.

Recovery is proved, not asserted:

- the shipped single file is **byte-identical** across the incident
  (`80307e2355b8e10a` before and after), because it is built from `src/`, not from
  the host;
- `modules` and `headless` — the gates that bundle `@ledger/core` and play a life
  in a process with no browser in it — were green against the recovered host, and
  all 41 are green now;
- the 35 stray copies and the stray `packages/registry.js` were removed **by
  name**, and `packages/core` holds exactly `index.js`, `host.js`,
  `host-shims.js`, `core.js` (generated), `exports.json`, `graph.json`,
  `insertions.json`, `package.json`, `tsconfig.json`, `src/`, `tables/`.

The lesson is the tool's, not the file's: **a generator whose output directory is
the package root deletes everything in it that it did not write**, and a usage
line is the interface.

#### And then a 289-byte phantom, which was characters versus bytes

The three new docblocks measured 2,242 + 281 + 475 = **2,998 characters**, and the
bundle grew by **3,287 bytes**. Two hundred and eighty-nine bytes had walked in
from nowhere, and the arithmetic was repeated three times before the answer —
which is that the headers are full of box-drawing rules, em dashes and `·`, and
UTF-8 charges three bytes for a `─`. The exact cost is the encoding's, and the
"phantom" was a unit mismatch in the person measuring. §22.58 was this same
mistake from the other direction, when `bundle.mjs` printed string length where
it meant bytes. Count bytes when you are comparing to a build.

#### The last mile, and the path that had no way back

The verification sweep found something the feature list had been assuming was
fine. **A Hardcore run could not be resumed.** Hardcore is never auto-saved — that
is the whole of the mode — so on a cold start the auto slot is empty and the
start screen, which offered to resume *the auto slot*, offered such a player
nothing. The only way back into a decade of play was to begin a new game, go to
the Ledger tab, and find the load buttons. The card now reads **every slot** and
resumes the newest (`bestSave()`), so what it offers is what the device is
actually holding; it names the slot, and it says *Hardcore — this run is only in
this slot. Nothing is saved for you.* in the warning colour. Two things follow:
`wipe()` clears the offer as well as the slots, because an offer that outlives the
thing offered is a lie; and the resume greeting says which slot it came from.

**And the header was lying about it.** `saveLineHTML()` asked the remembered flag,
so a hardcore run that was *loaded* rather than written — which is every hardcore
run — announced "Saved" over a run nothing was saving. It asks the run in front of
you now. Measured in the browser: `Not auto-saved` on the loaded hardcore run,
`Saved` the moment the same run is switched to Realistic.

The path is a test now, not a probe: **"a Hardcore run comes back from its slot,
and the header says nothing is being saved"** plays a quarter, saves to slot 1,
deletes the auto slot — the honest hardcore state — closes the tab, and comes
back. It asserts the card is offered, that it is pointed at `s1`, that it carries
the warning, that Continue lands on the same quarter, and that the header still
refuses to claim the run is safe. **Proved by watching it fail first:** with the
card put back to the auto slot alone, it fails with *"a hardcore run in a slot was
not offered on the start screen — the way back in is gone."*

Five statements from this last mile are declared in the ledger (`RESUME`,
`noteResume`, `resumeInfo`, `bestSave`, and the `wipe()` edit), the e2e layer
gained the test above, and the three stale start-screen walks learned the rail.

#### And the suite passed while the runner never exited

`npm test` printed `# pass 8 · # fail 0` and then **sat there**. Not failing —
hanging, with no CPU time used, until a timeout killed it. The new test had not
closed the HTTP server it started, and **a listening server keeps the process
alive**: `node --test` finishes its work, prints its summary, and waits for a loop
that will never drain. In CI that is worse than a failure — a job that hangs until
its timeout, with a log that says everything passed.

The proof is a two-line experiment, and it is worth keeping in mind as a
technique: the same test run twice, once with `server.close()` and once without.

> without closing the server: **exit=124** (killed at the timeout)
> with the server closed: **exit=0**

The other tests in that file already closed theirs — which is exactly why this
one looked like a broken test rather than a broken suite. All four e2e files now
close what they open, and `npm test` (the command CI runs) **exits 0 in 3m04s**
with 42/42, 23/23 and 9/9.

**The repository.** `git init` has been run and the tree committed — **`04472cf`**,
1,251 files, working tree clean — because both deploy paths (Vercel and the
GitHub Actions workflow) deploy *from a repository*, and `deploy:check` names the
missing repository as a blocker until there is one. It now checks out clean.

**State after §22.62:** **unit 42/42** · integration **23/23** · e2e **10/10** ·
**gates 41/41** · `deploy:check` clean · single file **1,084,764 bytes** sha
`9df03ae8f5436453` · zip **350,660 B · 10 files** · phone **30 files, byte for
byte** (sha `9df03ae8f5436453`) · statements 644 reference · 697 bundle · **35 core
sections** · **18 ui sections** · declared changes **121** · the junk sweep left
the rebuild **byte-identical** (`2770d308b1e7a82f` before it, the same after),
which is the proof that nothing removed was load-bearing.

---

### 22.62 — The junk sweep, accounted for

*"remove any junk in codebase."* Deletion is irreversible and this tree has been
bitten before by a removal nobody wrote down, so every file below is here with
what it was, what supersedes it, and the evidence it was dead. Nothing was
removed that any tool, gate, test or document names.

| file | what it was | why it goes | evidence |
|---|---|---|---|
| `.tmp-phone.png` | a 57 kB screenshot, root | nothing writes it and nothing reads it: a stray from a session that took a picture and forgot it | `grep -rl ".tmp-phone.png" .` → no file outside itself |
| `.tmp-record.png` | a 76 kB screenshot, root | the same | same |
| `.harness/.screens-17770.mjs` · `.screens-18074.mjs` · `.shell-17810.mjs` · `.shell-18056.mjs` · `.route-screens-17794.mjs` | five generated temporary modules, 1.06 MB together, each a whole copy of the game | the three React gates write one per run and `fs.rmSync` it on the way out; these five are the ones whose runs I **killed** during the last sweep, so their cleanup never ran. They regenerate on the next gate run. | `react-screen.js:92`, `react-route.js:79`, `react-shell.js:84` all `rmSync(tmp)` |
| `.harness/audit.json` | 24 kB of the audit gate's own report | a gate *output*: `audit.js:216` writes it and nothing in the tree reads it. The gate prints what matters; this file is a leftover copy | nothing reads it; rewritten every run |
| `.sudo_as_admin_successful` | zero bytes | the container's sudo marker, not this project's. It **comes back the moment anything runs `sudo`** — it did, twice, while this sweep was being verified — so the durable fix is the ignore rule below, not the deletion | created by sudo, read by sudo |
| `.config/nextjs-nodejs/config.json` | Next's telemetry state — a timestamp and an anonymous machine id | machine state, not source: it says something about *this* container and nothing about the game | written by Next on first run; listed nowhere in the project |

**Not** removed, because the evidence said no:

- **`.harness/shots.cjs`** — the only file in `.harness/` that no gate names, and it
  looked like the obvious orphan. It is documented: §22.44 made it *"a tool people
  can run"*, a screenshot driver for a human to look at, next to the
  `browser-screens` gate which does the asserting. Nothing calls it **because it is
  not a check** — it is for eyes. Kept.
- **`LEDGER-faces.html`** (489 kB), **`.harness/check.js`** (1.0 MB),
  **`.harness/mod.js`** (1.0 MB), **`apps/phone/www`**, **`apps/phone/android`** —
  all *build outputs*, regenerated by `npm run build` (`tools/faces.mjs`,
  `.harness/mkcheck.js`, `.harness/build.js`, `tools/native-assets.mjs`). Deleting
  them would just mean they come back on the next build, so the fix is to keep them
  out of the repository rather than out of the tree: `.gitignore` now lists them,
  along with `*.tmp-*`, `.config/` and the two Android/iOS folders that `DEPLOY.md`
  already *claimed* were ignored and, until now, were not.

#### The queue's next item, because the sweep walked past it

**"A save cannot carry a pending decision"** was on the queue as a rule to
enforce. Inspecting it in a browser turned it into a bug to fix, and then into a
feature: the rule was the wrong way round.

Measured first, on the shipped file:

> `a decision is on screen : {"savedTurn":1, "opts":3, "head":"money Q2 2026 You have been pre-approved A bank has written to say you"}`
> `after reload            : {"open":false, "opts":0}` — **the decision is gone**

A decision lives in `UI.modal`, which is UI, and the save blob holds `{S, rs, ui}`
— so a save written while a decision was open resumed into a quarter with **no
decision in it at all**. The bank's letter, its three options, and the choice they
led to: gone. It happened on the ordinary path, because the autosave fires 500 ms
after the *advance*, by which time `advanceQuarter()` has already put the event on
the table.

The obvious fix — refuse to save while a decision is open — would have made the
save *smaller* than the player asked for: "saved after every move" would quietly
mean "except the moves that matter most". So the save carries it instead:

- **`S.asking`** records the waiting decision by *name* — `{kind:'event', id}` or
  `{kind:'thread', id}`. Not the event itself: events hold functions (their odds,
  their effects) and cannot be serialised.
- **`askAgain()`** puts it back on resume. An event is looked up in the decks by
  id, so it is the *same* letter; a thread stage is derived from the thread record
  by `renderThreadStage()`, so a mid-thread save resumes at the stage it was on.
  A record that cannot be rebuilt is forgotten rather than allowed to lock the
  game — which is exactly what every save did before this.
- **`resolveOption()`** clears it, because answering is the only thing that ends a
  decision. A thread stage that opens next records itself.
- **`boot()` and the slot `load`** both call `askAgain()`, and both say so: the
  greeting becomes *"Welcome back… · a decision was waiting"*, and a loaded slot
  says *"Loaded — and it had a decision waiting."*

Proved from both sides, on the same probe, before it was trusted:

> before: **THE DECISION IS GONE**
> after: **THE SAME DECISION CAME BACK** — `life Q4 2026 Somebody needs bail money…`, three options, the same text after the reload

and it is a test now (`a decision waiting in a save comes back on reload, and an
answered one does not`), which also asserts the other half: an answered decision
is **not** asked twice, and the save stops claiming one is waiting.

Five statements are declared for it (`askNow`, `askAgain`, and the three edited:
`fireEvent`, `resolveOption`, `advanceQuarter`).

**One honest residual, recorded rather than hidden:** the *coda* — the "Decision
made. Take it and put it into the business." panel that follows an answer — is not
re-shown on resume, because it is answered text and the choice is already in
`S.decisions` and the digest. The player resumes with the decision's effects in
place and its outcome in the ledger; what is not replayed is the sentence.

**And a scan for dead code, rather than dead files.** Every one of the **589**
top-level function names in the shipped file is read somewhere in it — the scan
that finds "declared once, never mentioned again" returns **0 of 589**. The one
dead statement this tree ever had (`ownerTime`, shadowed by a later declaration of
the same name) was found and removed in §22.61's ledger and is recorded there.

### 22.63 — The redesign, phase 1: Legacy › Settings

*"The UI is too text bulky. Take each screen individually and start redesigning.
Redesign only, not losing features."* A design complaint is a feeling until it is
a number, so the first thing built was the number: `tools/textaudit.mjs` renders
every route through the real screens and counts the characters a player meets **in
the way**, the same count including what is folded away, and every control by the
action it fires. Two worlds, because a screen weighs what exists: *early* and
*trading*. Baseline frozen in `tools/text-baseline.json`: **22 routes · 108
controls · median 855 / 949 in the way**.

This is the first screen through it, the worst one that is also the most typical:
**Legacy › Settings**, 1,955 characters in the way, four cards, twenty controls, and
a ten-thousand-character save string unfolded in the middle of the page.

| | before | after |
|---|---|---|
| in the way | 1,955 | **992** (−49%) |
| longest single block | 227 | **125** |
| written on the screen, folds included | 1,955 | **2,416** — up 461, because the moved prose is folded, not deleted |
| folded away | nothing | 1,424 characters behind **5** folds |
| controls lost | — | **0** (`node tools/textaudit.mjs --check`: *0 lost · 0 added · 6 relabelled*) |

**The screen, in four cards that each lead with their controls** — *Save & load*
(three rows, each saying what is in the slot: name · quarter · net worth) · *Run
settings* (the seven difficulty tiers as a comparison table — odds shown, coaching,
reload, pay multiplier — with the tier you are playing highlighted, and each tier's
own sentence one tap away) · *Device & data* (the install control, and the save
string behind `Portable save string · 12 KB` with Copy and Import inside it) ·
*Screen tips*. Three explanations moved behind a `Why` fold.

**What the row learned, and what it says now.** "Load 1" was a button with no way to
know what slot 1 held: you pressed it and found out. A slot row now carries the
run's name, quarter and net worth when the slot is filled, and costs nothing when it
is empty.

#### One control fewer in the raw count, and it is named

The audit's raw button count went **20 → 19** while the *act* multiset stayed
identical. The missing one is the old difficulty row's `<button class="btn xs"
disabled>` on the tier you are *already playing*: markup that could not be pressed
and fired nothing. It is a marker on the row now ("playing"), plus the highlighted
row and the summary sentence above the table. Proved against the original game
rather than argued: the baseline single file was rebuilt through the harness module
pipeline and its buttons diffed with the new screen's — 23 → 21, and the two are
that button and the install button, which only exists while the browser holds an
install prompt.

#### Two gates that were lying

The redesign is checked by a frozen baseline, so a gate that cannot see the thing
it claims to check would have turned a −49% into a lie. Two were found, both by this
screen, both repaired and both left *stronger*:

- **`inventory`** asserted "the settings screen offers 3 save slots" by grepping
  the **source** for `data-s="s1"`. A slot written in a loop is invisible to that,
  so it reported six slot controls as none — and would have said the same about any
  loop-written control forever. It now **renders** Legacy › Settings and counts the
  slots on the screen (clearing `S.grp` first: a collapsed group renders no body at
  all, and a gate that passes by finding nothing is the other way a gate lies), and
  it now asserts six controls — a Save and a Load per slot — not merely three.
- **`react-screen`** guards against a vacuous comparison: each fixture must prove
  the screen reached a named section. Its entry for this screen keyed the install
  section on the word `/Install/`, which after the redesign only appears on the
  button — a button that is rendered only while the browser holds an install
  prompt. The guard would have failed for a reason with nothing to do with the
  section, so it now keys on the section's own line (*runs with the network off*).
  The real check — the button appears in both renderers when a prompt arrives — is
  untouched.

#### Both renderers, one screen

This screen is markup in the single file and React in the app, and `react-screen`
compares them **character for character** (that is how the "None taken away yet"
sentence was caught differing by half a line). A converted screen may not import
`@ledger/ui` — that is the package that called it, the cycle `runtime.js` exists to
prevent — and it may not re-type the markup either, or the gate would be comparing a
copy against its original. So:

- **`parseSaveRaw(raw)`** and **`saveSlotRowHTML(slot, label, info)`** moved into
  **core**, beside `diffListHTML` and `buildStamp`, which are the same kind of
  thing: markup both renderers embed. The parse of a stored save is now written
  once; the *read* stays with whoever owns storage — the ui's host, and the app's
  platform layer, one line each.
- The ui keeps a one-line adapter (`slotRowHTML`) onto core's row; the JSX imports
  core directly and supplies the blob.
- Declared changes **121 → 126**, each with its why in `tools/declared-changes.mjs`.

#### Not touched: the frozen data

The plan named the cards *This run · Device · Preferences*. Two of the headings the
grouping table already names — `Save & load` and `Run settings` — were kept instead,
because `ROUTE_GROUPS` is **frozen reference data** (`tools/tables.mjs --verify`
compares it to the original game token for token, and a card rename would have meant
re-baselining it to suit a redesign). The content moved under the headings that
existed; the table, the `group` gate and the baseline all passed unedited.

**Verified, not assumed:** unit **42/42** · integration **23/23** · e2e **10/10** ·
`.harness/run.js` **41/41 · ALL GATES CLEAN** · `deploy:check` CLEAN · bundle
**1,091,603 B · sha `c22f72e7e5745302`** · zip **353,269 B · 10 files** · phone
artifacts byte for byte. The full account, with the plan and the vocabulary, is in
`REDESIGN.md` — §6 is this phase.

**Next phase:** Money › Markets, 2,566 in the way, whose 208-character lecture
("when inflation exceeds the policy rate…") sits directly above the prices it
describes.

### 22.64 — The junk sweep, second pass: the repository weighed 451 MB

*"purge junk files from workspace."* §22.62 swept the tree. This pass swept the
**repository**, which is a different place and had a bigger problem: `.gitinit` +
`git add -A` had committed the two machine caches in the workspace — the Playwright
browser download and the npm package cache — so a repository of 420 source files
weighed **451 MB**.

| what | size | why it goes | evidence |
|---|---|---|---|
| `.cache/ms-playwright/` (606 files) | ~420 MB | the browser Playwright drives `npm test` with. It is a **download**, owned by `npm run setup`, and nothing in this project names it | `grep -rl "ms-playwright"` outside `node_modules` → nothing; it is re-fetched by `npx playwright install chromium` |
| `.npm/_cacache/` (215 files) | ~40 MB | npm's own content-addressed package cache. Machine state with a hash for a name | referenced by nothing; rebuilt by any `npm install` |
| `.npm/_logs/` (11 files, 8 kB) | — | npm debug logs, one per install this session | referenced by nothing |
| `.sudo_as_admin_successful` | 0 bytes | the container's sudo marker. **Back again**, exactly as §22.62 predicted — the ignore rule is the durable fix, not the deletion | created by `sudo`, read by `sudo` |
| `.config/nextjs-nodejs/config.json` | — | Next telemetry state: a timestamp and an anonymous machine id, about this container and not the game | written by Next on first run |
| `.harness/audit.json` | 24 kB | the audit gate's own report. **Back again** after the gate re-ran, also as §22.62 predicted | nothing reads it; rewritten every run |
| `apps/web/tsconfig.tsbuildinfo` | 32 kB | TypeScript's incremental cache. **Back again** after the typecheck gate | regenerated by the next typecheck |

**What did *not* go, and why:** `LEDGER-faces.html` (489 kB), `.harness/check.js` and
`.harness/mod.js` (1.0 MB each), `dist/`, `ledger/`, `tests/artifacts/` (531 kB of
e2e evidence), `apps/phone/android|ios` — every one a build output or a documented
record, all regenerated, all already ignored. The browsers and the npm cache stay
**on disk** too: deleting them would break the test suite and save the download
nothing, because neither directory is part of a workspace snapshot. The fix is not
to delete them, it is to keep them out of the repository.

#### The repository, repacked

Untracking the caches left the blobs reachable from the first commit, so `.git` was
still 424 MB. The repository was created this session and has no remote, so it was
rebuilt as **one clean root commit** rather than carrying a history of machine
state:

> `.git` **451 MB → 2.5 MB** · tracked files **1,241 → 420** · the commit message
> keeps the record of both milestones (phase 1 of the redesign, and this sweep).

`.gitignore` now names `.cache/` and `.npm/` with the reason, and the duplicated
`tests/artifacts/` line is gone.

**Proved by the build, not by inspection.** Nothing above was load-bearing, and the
proof is the same one §22.62 used: the bundle after the sweep is **byte-identical** —
`dist/index.html` 1,091,603 B · sha **`c22f72e7e5745302`**, tables *every one, token
for token*, `missing: (none)`, `deploy:check` CLEAN.

### 22.65 — The redesign, phases 2 and 3: Money › Markets, Money › Group

Two screens through the same pipeline as phase 1 — **measure → redesign → check →
gates → record** — and the same test of honesty throughout: *in the way* must fall,
*total* must not, and `node tools/textaudit.mjs --check` must report no control lost
against the frozen baseline (22 routes · 108 controls · both worlds).

| phase | screen | in the way | total | folds | controls lost |
|---|---|---|---|---|---|
| 2 | Money › Markets (`viewInvestMarkets`) | 2,566 → **915** (−64%) · trading 2,542 → **887** | 2,566 → 2,836 | 0 → 4 | **0** |
| 3 | Money › Group (`viewGroup`) | 1,531 → **566** (−63%) | 1,531 → 1,579 | 0 → 3 | **0** |

#### Phase 2 — the market as a price sheet

Markets was the worst route in the game and it was built as **a set of little
lessons, one per instrument**: thirteen bordered boxes, each with a sentence of
teaching under it, and two paragraphs explaining the numbers sitting next to the
numbers. It is now a sheet you read down: one row per instrument — name, the chips
that decide it (expected return, volatility, FX-linked, illiquid, pays income, what
you hold), the amount box and Buy on the row itself.

The text did not go anywhere. The thirteen notes are **What each asset is for**; the
macro lecture is **What those rates mean**; the "how returns work here" paragraph is
a fold that **kept its own title**, on the card it explains, which is why the screen
went from four cards to three; the news shows three items with the tail behind
**Earlier news · N more**. The longest block still *in the way* is now 43 characters
— a news line — against 208 before.

**The thirteen buys are the same thirteen buys.** The amount boxes keep their
`amt_<asset>` ids because the buy handler reads the value out of the DOM by that id;
a redesign may not break a handler it does not own, and the audit would have failed
if thirteen `buyasset` controls had lost their buttons. The `.mrow` rule in the
stylesheet is the only CSS added: a hairline between rows instead of a box around
each one.

**One copy fix, recorded because it changes words:** the macro lecture read *"the
currency is falling,anything priced in hard currency"* — a missing space, in both
renderers since the port. It now reads `falling, anything`. No test asserted the
typo.

#### Phase 3 — a screen that was all teaching

Money › Group has no state worth redacting and no controls to lose: 1,531 characters
in the way, of which **782 were three paragraphs** — what a group is (307, the
longest single block in the game), dividend versus upstream loan (179), and how a
management charge works (296). They are now folded under **What a group is**, **The
two doors** and **How the charge works**, word for word, on the cards they belong
to. 1,531 → **566** in the way, total 1,531 → 1,579.

The tables on that screen — the consolidated P&L, where the cash and debt actually
sit, intercompany balances, the management-charge rows, the covenant strip — were
already numbers on rows and were left untouched. **On this screen the bulk was never
the data.**

#### Where the redesign stands

| world | worst in the way, before | after three phases |
|---|---|---|
| early | markets 2,566 · settings 1,955 · people 1,817 | **people 1,817** · career 1,758 · household 1,605 |
| trading | chronicle 3,966 · markets 2,542 · settings 1,955 | **chronicle 3,966** (a log, budgeted 1,500) · people 1,813 · career 1,760 |

**Verified, not assumed:** unit **42/42** · integration **23/23** · e2e **10/10** ·
`.harness/run.js` **41/41 · ALL GATES CLEAN** · `react-screen` and `react-route`
clean across 29 routes and 9 states (the app's React copy of both screens was
rewritten to match, character for character) · `deploy:check` CLEAN · bundle
**1,094,565 B · sha `83a3b9c0674f778d`** · zip 354,416 B · 10 files. Declared changes
**121 → 131**, each with its why.

**Next:** Legacy › People (1,817, the widest screen in the game at 27 controls) and
then Work › Career (1,758, a ladder that wants to be a table).

### 22.66 — The junk sweep, third pass: what a workspace restore leaves, and phases 4–5 of the redesign

#### The sweep, and the thing that swept itself

The tree was already clean (§22.62, §22.64), so this pass was mostly a check — and
the check found that **the platform had done the sweeping for me**: between sessions
the workspace was restored, and `.cache/`, `.npm/`, `node_modules/` and `dist/` were
gone with it, because none of them are part of a snapshot. The repository, which is
the part that persists, came back **420 files and 3.8 MB**, with no cache in it. The
ignore rules held.

What was back — and this is the honest part, because §22.62 predicted all of it —
were the four machine-state items the build and the gate suite regenerate:

| what | who brought it back | fix |
|---|---|---|
| `.sudo_as_admin_successful` | `sudo apt-get install` during the toolchain restore | deleted; the ignore rule is the durable fix (§22.62) |
| `.config/nextjs-nodejs/config.json` | any Next build | deleted, ignored |
| `.harness/audit.json` | the audit gate running | deleted, ignored |
| `apps/web/tsconfig.tsbuildinfo` | the typecheck gate | deleted; `.gitignore` now matches `*.tsbuildinfo`, not one path |

**Kept, by rule:** `LEDGER-faces.html`, `.harness/check.js`, `.harness/mod.js`,
`dist/`, `tests/artifacts/` (531 kB of e2e evidence), `apps/phone/android|ios`,
`ledger/`, `ledger-app.zip` — build outputs and documented records, all regenerated,
all ignored. Deleting them would only mean they come back.

**And the restore is itself a test that passes.** The toolchain was rebuilt from the
record in `MIGRATION.md` — `apt-get update -qq`, the thirteen libraries Chromium
links against, then `npm run setup` — and the first build afterwards produced
`dist/index.html` at **1,094,565 B · sha `83a3b9c0674f778d`**, byte for byte what was
shipped before the restore. A container that rebuilt the same game from the same
files is the strongest possible statement that nothing load-bearing was ever
deleted.

#### Phases 4 and 5 of the redesign

| phase | screen | in the way | total (folds in) | folds | controls lost |
|---|---|---|---|---|---|
| 4 | Legacy › People (`viewPeople`) | 1,817 → **1,344** (−26%) | 1,485 | 0 → 1 | **0** |
| 5 | Work › Career (`viewCareer`) | 1,758 → **414** (−76%) | 1,841 | 0 → 10 | **0** |

**People was a rendering defect as much as a design one.** The line that made the
screen heavy was, per person:

> `generous, careless · means 16.778310123996636/100 · standing 22.88567320808015/100`

Two facts at ninety-odd characters, two of them **raw floats** — a fraction of 100
that nothing ever rounded. It is four chips of whole numbers now, the 0–100 scale
stated once in the heading instead of eighteen times in the rows, and each person a
hairline row. Its total fell by 332, and the record says why rather than claiming a
clean −473 of prose: about 250 of that was digits and repeated units, not meaning.

**Career was all teaching.** Four of its six longest blocks were a single action's own
hint (188, 177, 169, 148 characters) and the rest were three card notes. The actions
are rows with their own **Why** fold now — and the hint is still what a disabled
`Do it` says when it refuses, so a reason is never further than the control. 1,758 →
**414**.

**Two things the phases produced that are not screens:**

- **`foldHTML(label, html)`** — the fold markup had been hand-written on four screens;
  a fifth copy is where copies start to differ. One helper, in the ui.
- **A staleness guard in the audit.** While folding Career, `--check` reported the
  screen at 1,758 with zero folds: the rebuild had stopped before `mkcheck` over an
  undeclared statement, so the audit measured the **previous** build while the new
  one sat on disk. A tool whose purpose is that it cannot flatter a screen had spent a
  minute quietly flattering one. It now compares `.harness/mod.js` against
  `dist/index.html` and **refuses to report** when the module is older — proved by
  making it happen (`touch dist/index.html` → `STALE BUILD`, exit 2).

**And one gate earned its keep:** `react-screen` failed the first Career fold with
*"CSS classes lost: mrow"* — the built-in drew the new row, the React copy still drew
its own bordered box. No screenshot shows that and no reading catches it.

**Verified:** unit **42/42** · integration **23/23** · e2e **10/10** · `.harness/run.js`
**41/41 · ALL GATES CLEAN** · both worlds `NO CONTROL LOST` · `deploy:check` CLEAN ·
bundle **1,096,295 B · sha `52c6e69f29776cf9`** · zip **355,189 B · 10 files**.
Declared changes **121 → 134**.

**Next:** Work › Household (1,605, whose 287-character role paragraph is the biggest
single block left in the game), then Deals, Ambition and the chronicle.

### 22.67 — The redesign, phase 6: Work › Household

*Measured first: 1,605 characters in the way for eight controls.*

| | before | after |
|---|---|---|
| in the way — early | 1,605 | **637** (−60%) |
| in the way — trading | 1,537 | **577** (−62%) |
| written on the screen, folds included | 1,605 | **1,822** — up 217 |
| folds | 0 | **3** |
| controls lost | — | **0** (`--check`: 0 lost · 0 added) |

The two heaviest blocks were **both lectures, both in front of a decision**: the
empty-roster explanation (160) and *"Start with a housekeeper or a cook. Add a nanny
when there are children and a driver when traffic costs you more than the driver
does…"* (287 — the longest single block anywhere in the game), sitting directly above
the people you can hire. Both are folds under **Why hire anybody, and where to
start**.

**And then the duplication.** Four candidates, each repeating *"Going rate for this
work is about ₦N/mo."* and each spelling its trait out in full, so the same eight
trait sentences appeared up to five times on one screen. The fix is the move the
plan already named — *say a thing once*:

- the going rate is a chip (`going rate ₦261k/mo`) instead of a sentence;
- the trait is a chip on the row, and the eight meanings are one **What the traits
  mean** glossary, read from the same `TRAITS` table the rows read, so a trait's
  meaning cannot drift from the trait;
- the negotiation paragraph (*"You can take them at what they are asking and be done
  with it, or make an offer and argue…"*) is a fold on the card it belongs to.

**The total went up** — 1,605 → 1,822 — while what is in the way fell 60%, because
the glossary includes all eight traits rather than only the ones on screen this
quarter. Nothing was traded to buy the number, and the audit's two columns are what
say so.

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · `.harness/run.js`
**41/41 · ALL GATES CLEAN** · `react-screen` and `react-route` clean (the app's React
copy was rewritten to match, character for character) · both worlds `NO CONTROL LOST`
· bundle **1,097,940 B · sha `b26e211b1ddbd63e`** · zip 355,743 B · 10 files ·
declared changes **134 → 136**.

**Standings after six phases** (in the way, early world): people 1,344 (floor ~1,300,
budgeted) · deals 1,200 · ambition 1,127 · property 1,111 · settings 992 · markets 915
· overview 898 · budget 855 · position 831 · life 695 · chronicle 684 (3,966 in a
mature run — a log, its own phase) · household 637 · group 566 · career 414.

**Next:** Money › Deals (1,200, whose four open deals carry eight prose blocks), then
Legacy › Ambition (1,127), Money › Property (1,111), and the chronicle last.

### 22.68 — The redesign, phases 7–9: Deals, Ambition, Property

| phase | screen | in the way | folds | controls lost |
|---|---|---|---|---|
| 7 | Money › Deals | 1,200 → **416** (−65%) | 0 → 5 | 0 |
| 8 | Legacy › Ambition | 1,127 → **781** (−31%) | 0 → 3 | 0 |
| 9 | Money › Property | 1,111 → **603** (−46%) | 0 → 1 | 0 |

**The order the phases ran in was not the order they were planned in, and that is
the method working.** The plan was written worst-first from one measurement; after
each phase the audit re-ranks, and Property — which was not in anyone's top five at
the start — came into view at 1,111 once Household, People and Career were down.
`REDESIGN.md` §4 says so in the table itself now.

**Deals: a screen where a third of the text was a card about the screen.** 429 of
its 1,200 characters were three paragraphs of background — how to think about deal
odds, position sizing and introductions — and the deal rows carried a description
above the odds it described. The deals are rows that lead with their terms as chips
(quarters · upside · how often they work out · who introduced it · what it asks for)
with the sentence under **What it is**; the background card keeps its heading — the
grouping table names it — and its paragraphs move under **The three rules**.

**Ambition: three explanations folded, and an honest floor.** 346 characters were
teaching (*what nobody mentions at your funeral* at 201, the five constituencies at
96, *"People do."* at 49). What remains is the five ambition names as buttons, the
active ambition's own description (63), the scoreboard's figures, and the posterity
card's live state. **781 is the floor**, and the longest block on the screen is that
63-character description — there is no paragraph left.

**Property: the notes were the screen.** Every one of its 1,111 characters was a note
under a good's name, in a bordered box, with thirty pixels of height held open for
it. The row now leads with the effects and the price; all eleven sentences are kept in
one fold at the foot of the card. Same eleven Buy buttons and the same disabled
reasons, down to the shortfall arithmetic.

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · `.harness/run.js`
**41/41 · ALL GATES CLEAN** · both worlds `NO CONTROL LOST` · `react-screen` and
`react-route` clean (every React copy rewritten to match) · `deploy:check` CLEAN ·
bundle **1,099,818 B · sha `ecd9755d17ae5752`** · zip **356,478 B · 10 files** ·
declared changes **121 → 139**.

**Project standing: median 617 in the way** (from 855), one route above 1,200
(Legacy › People, 1,344 — budgeted at 1,400, §22.66), and the worst of the rest is
Settings at 992. Remaining phases: Overview (898), Budget (855), Position (831),
Life (695), the chronicle (684 early, 3,966 in a mature run — a log, its own phase),
and the shell.

### 22.69 — The redesign, phases 10–12: Position, Budget, Overview — and a bug the module build caught

| phase | screen | in the way | folds | controls lost |
|---|---|---|---|---|
| 10 | Money › Position | 831 → **469** (−44%) | 0 → 3 | 0 |
| 11 | Money › Budget | 855 → **806** (−6%) | 0 → 1 | 0 |
| 12 | Overview | 898 → **767** (−15%) | 0 → 2 | 0 |

**Position.** The biggest block was 189 characters of philosophy at the foot of a
screen about cash; the credit score moved onto the **Borrow** heading as a chip,
because *"Credit score: 42/100. Determines whether anyone lends to you and at what
rate."* is one number and one explanation, and only one of them is state.

**Budget is a floor, and it should be.** 855 → 806, because a budget screen's text
*is* its data — sliders, labels and figures. The one piece of prose was a real state
change (prices have risen, so this budget buys less life), so the state and the
**Adjust for inflation** control stayed and only the explanation folded.

**Overview keeps its voice.** Two notes fold; the **112-character vignette stays** —
*"Third Mainland Bridge, 6:40pm. Two podcasts, four kilometres, one profound
reconsideration of your life choices."* The redesign's rule is that the game's voice
is what makes the folded text worth opening; folding that line would have been the
project mistaking itself for the enemy.

#### `foldHTML is not defined` — and why that is the best news of the session

`foldHTML` was written in the **ui**. Then a **core** strip — `threadStrip`, the open
stories on Overview — used it. The modular build threw immediately, from an
integration test about a save crossing between a browser and a phone, which has
nothing to do with folds:

```
not ok 20 - a browser save loads on the phone, and a phone save loads in the browser
  error: 'foldHTML is not defined'
    threadStrip (packages/core/core.js:6044)
    viewOverview (packages/ui/modules/02-view-overview.js:51)
```

In the single-file build this cannot happen: one scope, so a helper written in one
package is visible to the other, and it would have shipped. **The fix was not to
duplicate the helper but to move it to core**, beside `esc` — both renderers write it
and core's own strips need it, the same reasoning that put `saveSlotRowHTML` and
`parseSaveRaw` in core during phase 1. That is now four functions that live in core
because two renderers and one simulation all touch them, and each one is declared
with its why.

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · `.harness/run.js` **41/41 ·
ALL GATES CLEAN** · `react-screen`, `react-route`, `dedupe` clean · both worlds
`NO CONTROL LOST` · `deploy:check` CLEAN · bundle **1,100,815 B · sha
`311031999aa402e7`** · zip **356,890 B · 10 files** · declared changes **121 → 143**.

**Twelve phases in:** median **855 → 584** characters in the way · one route over
1,200 (Legacy › People, budgeted and explained) · next worst 992 · **no control and no
sentence lost**. Remaining: the chronicle (684 early, 3,966 in a mature run — a log,
its own phase) and the shell/Overview polish.

### 22.70 — The redesign, final phase: the chronicle, and where the project got to

| | before | after |
|---|---|---|
| Legacy › Chronicle, mature run (40 entries) | 3,966 | **823** (−79%) |
| Legacy › Chronicle, early (a dozen quarters) | 684 | 693 |

The heaviest route in the game — and the defect was not entry length but **all forty
entries in the way at once, oldest first**, so a player at the end of a decade opened
the log on 2026 and scrolled four years to reach this quarter. The log reads newest
first now; the eight latest entries are the screen; everything older is grouped by the
year in the entry's own date behind a fold that says how much it holds (*"2027 · 14
entries"*). Same entry markup, same category, same colour.

**No outcome chip was added, and that was a decision.** The plan sketched "the outcome
in a chip", but the log already carries the outcome as the border colour — good, bad,
warning, macro news, a beginning — so a chip would have been text where there is
already colour.

**The early-world number barely moves (684 → 693), which is the measurement working.**
A dozen quarters produce about eight entries; eight is exactly what the screen now
shows unfolded. The chronicle was never heavy early. It was heavy at the end of a run,
which is when a player most wants to read it — hence its own budget.

#### Thirteen phases, and the whole thing measured

| | before | after |
|---|---|---|
| median route, in the way | 855 early / 949 trading | **584 / 571** |
| worst route | 2,566 (markets) | **1,344** (people — budgeted 1,400, §22.66) |
| routes over 1,200 | 6 | **1** |
| total text on the screens | 20,369 / 23,795 | **higher**, because words moved into folds rather than being deleted |
| controls | 108 | **108** — none lost, 6 deliberately relabelled |
| folds | 0 | one on almost every screen, each with a label a player can predict |

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · `.harness/run.js` **41/41 ·
ALL GATES CLEAN** · `react-screen`/`react-route` clean across 29 routes and 9 states ·
both worlds `NO CONTROL LOST` · `deploy:check` CLEAN · bundle **1,102,918 B · sha
`5485e259c618db0f`** · zip **357,730 B · 10 files** · declared changes **121 → 144**.

**What remains is the shell** — the top bar, the rail, the bell, the modals — where the
vocabulary has to feel like one game rather than fourteen screens that each learned
it. It has no route to measure (the header is budgeted in pixels, not characters) and
it deserves its own pass rather than the tail of a batch.

### 22.71 — The redesign's last phase: the shell, and its own audit

Thirteen phases had a number to move because `tools/textaudit.mjs` measures routes.
The shell had none — and **a phase without a number is decoration** — so the shell
got the same treatment: **`tools/shellaudit.mjs`**, eight surfaces the player meets
outside a route, the same three measures (in the way / total / controls), a frozen
baseline in `tools/shell-baseline.json`, `--check` failing on a lost control, and the
staleness guard the route audit learned the hard way in phase 5. It is now part of
`npm test`.

| surface | before | after | what was wrong |
|---|---|---|---|
| Start another company | 1,633 | **565** (−65%) | ten companies as bordered boxes with a paragraph each, plus an opening lecture — the Money › Property pattern, in a modal |
| Season | 1,300 | **914** (−30%) | a setup form wearing three explanatory notes |
| How this works (help) | 1,142 | **1,147** | one wall of seven bold-led paragraphs: no index, so a player opening Help could not find the rule they wanted |
| Settings · Profile · Negotiation · Board vote · Run info | 1,618 | 1,618 | already the vocabulary (a popover is a fold; the settings modal was done in phase 1) |
| **total** | **5,693** | **4,244** | **77 controls before, 77 after, none lost** |

**Help is the one surface where the project's own rules point the other way, and the
record says so.** It is opened deliberately, so the fix was not to shorten it but to
make it *scannable*: the seven rules are a table — rule on the left, what it means on
the right, one row each — with every sentence kept word for word. It is 5 characters
*longer* than before, and it is the better screen. A −1% would have been a lie to
report as a win; this is a shape change, and the shape is what a help screen needs.

**Nothing in the chrome needed changing**, which is itself the finding: the bell
popover, the era popover and the per-screen `?` hint were already the vocabulary —
popovers are folds, the bell's badge can be zero, its footer carries the count — and
the e2e layout gate already holds their budget (chrome ≤ 15% of a 390px viewport).

#### The plan, at the end

| promised | delivered |
|---|---|
| median route ≤ 500 in the way | **584 / 571** from 855 / 949 — **not met**, and §9/§13 of `REDESIGN.md` say why for the screens that hold it up |
| no route over 1,200 (except the chronicle) | **met** — one route over, Legacy › People at 1,344, budgeted at 1,400 with the arithmetic shown |
| chronicle ≤ 1,500 | **823**, from 3,966 |
| zero controls lost | **met** — 108 route controls + 77 shell controls, none lost, 6 relabelled and reported |
| nothing deleted | **met** — total text is higher on every redesigned screen than before |
| every phase recorded | **met** — `REDESIGN.md` §6–§20, `FEATURES.md` §22.63–§22.72 |

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · **41/41 gates clean** ·
`textaudit --check` `NO CONTROL LOST` (both worlds) · `shellaudit --check`
`NO CONTROL LOST` · `react-screen`/`react-route` clean · `deploy:check` CLEAN ·
bundle **1,104,445 B · sha `b5bc961f13a707d4`** · zip **358,324 B · 10 files** ·
declared changes **121 → 147**.

### 22.72 — The download is the first machine that is not this one

**Asked for:** one zip of the workspace, so the whole thing can be taken in one
download. **What the request actually turned out to be:** the first time any of
this code was ever asked to run somewhere that is not this machine.

The archive was easy (`git archive` of the tracked tree — source, tests, tools,
docs, the playable `ledger/index.html` and the ready `ledger-app.zip`; no caches,
nothing generated). The project's own rules then said what to do with it: *prove
every check by watching it fail first*, and a gate asserts a relationship, not a
pixel count. So the download was treated as a stranger's checkout — extract it
somewhere else, `npm run setup`, `npm test` — and it died twelve seconds in, at
`npm run build`.

Everything passed on the machine it was written on. That is the whole bug.

| what was wrong | where | why it survived every gate until now |
|---|---|---|
| acorn imported by absolute path | `tools/declared-changes.mjs`, `tools/apply-changes.mjs` | the path is correct on exactly one machine |
| `const ROOT = '<absolute home>'` | `declared-changes`, `apply-changes`, `split.mjs`, `split.py`, `textaudit.mjs` | ditto — and the five tools that got it right (`shellaudit`, `tables`, `mirror`, `mobile`, `zip`) already had the pattern to copy |
| screenshots written to an absolute path | `.harness/browser-screens.cjs`, `.harness/shots.cjs` | harness-only, so no shipped code was ever affected |
| the build crashed on a folder a fresh checkout *correctly* does not have | `tools/faces.mjs` | it printed "platform folders: none in the tree" and then read them — the report and the code disagreed, and the code won |
| the phone gate and four integration tests demanded the generated Android project | `.harness/phone.js`, `tests/integration/payload.test.js` | the author's tree had it from an earlier `cap add android`; `android/` is generated and gitignored on purpose |

**The fix is one rule:** a tool finds the repository from its own file
(`import.meta.url`, `__dirname`, `__file__`), never from the working directory,
because the working directory is a property of the caller. And a *generated* file
that is absent is not a defect — the checks that need it say which half they could
not verify instead of passing quietly:

```
the app’s face    : the masters are measured below; the native copies are not in
                    this tree — android/ is generated (`npx cap add android` …)
```

**Gate 42, `portable`,** makes the class of mistake impossible rather than fixing
one instance: no code file (js/mjs/cjs/ts/tsx/py/sh/yml) may hardcode an absolute
home path, every tool's `ROOT` must come from its own location, and — the honest
half — the gate *runs* `tools/tables.mjs` from a temp directory and requires it to
find the repo anyway. Written first and watched fail: it reported 17 problems,
including one nobody had noticed (`tables.mjs` could not run from another
directory).

**Watch it fail, then pass:**

```
before  PORTABILITY BROKEN — 17 problem(s): tools/split.mjs:19 hardcodes an absolute home path …
after   portability CLEAN — 289 code files, no absolute home path; tools locate the repo from their own file
```

**The download, checked as a download** (`git archive` → `/tmp`, no `.git`, no
`node_modules`, nothing generated): `npm run setup` → `npm run build` produced
**1,104,445 B · `b5bc961f13a707d4` — byte for byte the file this repository
verified** — and then the whole suite: unit **42/42** · integration **21/21 with 2
skipped and named** (the two that need the generated Android project) · e2e
**10/10** · shell audit `NO CONTROL LOST` · gates **42/42 ALL GATES CLEAN** ·
`deploy:check` CLEAN.

**Cost to the game: nothing.** Tools, harness and tests are not shipped, so the
bundle is unchanged at 1,104,445 B — the player never sees any of this. Gates 41 →
**42**; `npm test` is now the same command in a stranger's checkout as it is here.

### 22.73 — Lagos Life: the market read, and the instrument that measures it

**Asked for:** a competitor launched in the same city before us — *"check it out
and see if you can see proper difference and things to use to improve this
product."* **Delivered:** `MARKET.md` (what they are, the honest comparison, nine
things to take, six to refuse) and `playtest/` — a protocol that measures both
games on one yardstick, with **our column already filled**.

**Them, in their numbers** (their page, 7 Oct 2026): launched 1 Oct, free,
browser, 18+, login required, one shared city, ~97k online and 21.3M visits;
their stats page claims >1.1M players. 31 locations, 275 activities, 21 careers ×
5 levels (₦6,600 → ₦99,000 a shift), rent every Saturday, a weekly governor
election, and **the birth lottery** — dealt once per account, Nepo Baby
(₦500,000 + a Lekki flat) or LAPO Baby (a ₦60,000 loan at ₦12,000/week), which
cannot be re-rolled and is the thing their players screenshot.

**The difference that matters:** they won distribution — a shared world, instant
entry and Lagos nouns on every screen. We hold the economics — six cities, real
FX and inflation, negotiation, a board, a household, a legacy, and a single file
that runs offline with no account. **Theirs is a city you log into; ours is a life
you can hold.** The strategy is not to become them; it is to take the four things
that cost us nothing (§3.1–§3.4) and let the depth be what players tell each other
about.

**And then the honest part:** everything above was read from the *outside* — the
public lobby, their own stats page, and a wiki built from their data. The game
itself is 18+, login-gated and server-side, so its loop can only be measured by
playing it. So the deliverable became an instrument rather than a verdict:

| file | what it is |
|---|---|
| `playtest/PROTOCOL.md` | five groups of fields with units; three fixed sittings (cold 30 min · return ≥24 h later · mature); an event-log format; a cost sheet for every mechanic; ethics (own account, no real money, no scraping) |
| `playtest/seat-ledger.json` | **our column, generated** by `tools/playtest.mjs` — never typed |
| `playtest/seat-lagos-life.csv` | the blank sheet for their side, same field names |
| `tools/playtest.mjs` | measures our seat from the running game and prints the two columns side by side (`--compare`) |

**Our seat, measured (seed 4242, the project's standard fixture):** 168 quarters
to a terminal (age 65); **0.99 forced interruptions per quarter** — an event
happens whether or not you act; 10 things asking for a decision at a sampled
moment; 166 controls that change state; scarcity = 5 money fields + hours per
quarter + 5 personal states; undo classes = free, at a cost, sunk; artifact
1,104,445 bytes, 0 external requests, no account, free.

**Two findings that change how the game should be argued about:**

1. **A run that makes no choices still reaches retirement** (age 65, ₦2.03bn
   passive). The sim has a floor — so a commitment is a *deliberate* move above
   it, not a survival tax. That is why a quarterly loop can hold where a weekly
   one is needed to keep a real-time world alive.
2. **Hours are the only resource that never carries**: money is re-earned, a
   quarter is gone. Scarcity in this game is time, and the copy should say so.

**The rule the protocol enforces:** copy nothing the log does not show working —
each mechanic gets *copy*, *decline* or *unmeasurable*, and the reason must be a
line from the sitting. No mechanic from `MARKET.md` §3 is built until then.

**Nothing shipped changed:** the bundle is untouched at 1,104,445 B ·
`b5bc961f13a707d4`; 42/42 gates clean afterwards.

### 22.74 — The visual read: their screens, and the six changes worth making

**Asked for:** *"What about visuals? I'm not copying them, I just want to pick
things that work and be better."* Delivered as a design brief, not a restyle:
`visual/REVIEW.md` + `visual/compare.html` (self-contained side-by-side, images
embedded, no external requests) + real captures of both products in
`visual/shots/`.

**Evidence base, stated honestly:** theirs is 18+, login-gated and server-side, so
what exists to look at is the public lobby at 1280×800 and a player's phone
capture (the OS grid of Lagos apps, the drawn city map with pinned landmarks) —
labelled as *unseen in play*. Ours was rendered by me at 390px in Chromium: the
start modal, the first quarter, the record screen, the help table.

**Seven principles that work there** — the setting as the interface; render the
familiar; label everything tiny and consistently; make the room visible; one
accent, one action; ambient colour; show what is coming in place. Each is turned
into something in *our* language rather than copied: their crowd counters become
**the player's own evidence** (chronicle count, quarters left, live commitments),
because faking presence in a single-player file would be a lie about the model.

**Six things refused:** isometric illustration, emoji as iconography, live player
counters, NEW badges, uniform loudness, their green palette.

**The shortlist** (impact ÷ cost, each with the gate that proves it and the rule
that nothing is removed): an **hours instrument** (24 pips that visibly empty —
hours are the one resource that never carries), **the life map** (30-year timeline
with pins over the chronicle — index *and* share-card artwork, one drawing two
jobs), **one 24px state-tinted SVG icon set** (≤3 KB inline, request count stays
zero), **a face for the protagonist**, **era tint on the chrome**, **primary
actions in the thumb zone**.

**And a false alarm caught by measuring:** our help table's rule column *looked*
centre-aligned in a scaled screenshot and was one edit from being "fixed" — it is
left-aligned; both wrapped lines start at x=43 and the cell computes
`text-align:start`. Recorded in the brief's method note: a visual review that
trusts its impressions is a review that breaks working screens.

**Nothing in the product changed yet** — no code, no copy, no palette. The brief
is the deliverable and the shortlist waits on the word.

### 22.75 — The journey, measured: what a player does next and what it costs

**Asked for, after a correction:** *"I mean UI/UX and user flows and journey while
playing, not simply icons and emojis."* Delivered as a flow review with an
instrument behind it: `tools/journey.mjs`, `ux/UX.md`, `ux/journey.html`,
`ux/journey-ours.json`.

**The instrument** walks the shipped page in Chromium at 390px — the way a player
does, through re-renders and disabled controls — and records taps, seconds, the
screen you stand on, whether an action is left on screen, the loop's recurring
cost, and the tap distance to every destination. It reads the header before and
after each milestone, **because a click is not an outcome**: the first version
reported "a deal taken" for a deal that was refused — an in-page `click()` on a
disabled button returns true and changes nothing. A journey tool that counts
clicks instead of outcomes is a journey tool that lies.

**Our journey, measured** (Tunde · Lagos · Fresh Graduate · Realistic · default
seed): **0 taps / 0.8 s to a playable screen** (no account, no install — the deal
is the landing state); **3 taps / 2.6 s to Q1**; **every one of 11 destinations is
exactly 2 taps away** (tab + sub — uniform IA worth protecting); **2.83 taps and
1.83 interruptions per quarter**, which is ≈300 interruptions across 168 quarters.

**Three flow defects found by walking, with evidence:**

1. **F1 — the reason on a disabled control is a tooltip.** At Q1 both deals cost
   more than the player holds; `takedeal` is correctly disabled with
   `title="Needs ₦3.12m · you have ₦180k · short ₦2.94m"` — and a 390px phone
   never shows it. The project's own rule inverted: the reason exists, but only to
   a mouse.
2. **F1b — the agenda leads with what you cannot do.** The Q1 agenda names the
   deals first; the first *actionable* commitment (a career action — hours, not
   money) is nine taps away.
3. **F2 — the modal tax.** 1.83 interruptions per quarter, every advance costing a
   tap plus "Closing the quarter". Whether that is rhythm or tax is the most
   important flow question in the product, and it should be decided rather than
   inherited.

Plus the two already on the queue, now with numbers behind them: **F3 no way back**
(11 destinations at 2 taps in, none with a one-tap return) and **F4 the missing
reveal** (`MARKET.md` §3.2's dealt life).

**The reframing this produced — the most useful sentence in the review:** their
loop is kept alive by *appointments* (a shift, a Saturday, a weekly election), so
their modal rhythm is a dispatch from a world that kept happening without you.
**Our world does not move without us** — a quarter waits. Copying their modal
rhythm would copy the cost and leave the benefit. Ours is a *re-entry* hook, not a
return hook: the chronicle newest-first, the agenda that says what is live, the
season with a terminal date.

**Nothing changed in the product** — no control moved, no text left, no palette
touched. The instrument and the review are the deliverable; the five fixes await
the word.

### 22.76 — Sweep: the raw search output, accounted for before deletion

The visual review pulled five images from an image search. **Two** are the evidence
the review actually cites and are kept, renamed, in `visual/shots/`:
`their-01-phone-os.jpg` (the phone screen) and `their-02-city-map.webp` (the city
map). The other **three** — a directory illustration, an install walkthrough, a
forum capture — are unused, and `visual/compare.html` embeds its own copies as
base64 anyway, so nothing depends on the folder.

| item | accounting | action |
|---|---|---|
| `image-search/` (5 files, 1.6 MB) | 2 kept as `visual/shots/their-0*.{jpg,webp}`, 3 unused, 0 referenced by any script or doc | **deleted**, folder gone |
| `LEDGER-faces.html` (490 KB) | generated by `tools/faces.mjs` on every build, already `.gitignore`d (FEATURES §22.62) | left on disk, never committed, never shipped |
| `tests/artifacts/` (531 KB) | e2e screenshots from the last run, regenerated, gitignored | left on disk, not in the download |
| `.npm/_logs`, `.config/`, `.harness/audit.json`, `*.tsbuildinfo` | machine state that returns after every build/setup (documented, expected) | deleted again; ignore rules already hold |

Nothing referenced was removed: `grep -r image-search` across the repo finds no
code, doc or test that reads that folder. The download is re-cut after the sweep —
444 files → 439, and the two pieces of visual evidence still ship inside it.

### 22.77 — The book of the game: what you can do, what happens, what it costs

**Asked for:** *"can you get interactions, repercussions, events, what you can do,
what happens, etc.? … Then update zip"* — the rulebook, not a description of it.

**Delivered as a generated document, not a written one.** `tools/systems.mjs`
(`npm run content`) reads the shipped module and emits `CONTENT.md` +
`content/inventory.json`. Nothing in it is typed by hand: if a table changes, the
book changes on the next run. It renders all 43 screens in a live state (17
quarters played, a business running, seed 4242) and harvests every control with
its label, so "what you can do" is read off the renderer rather than remembered.

**What the book contains:**

| section | content |
|---|---|
| the mental model | the five things a turn gives you to spend: hours · money · capital · influence · household |
| the engine room | the **21 steps of a quarter, in order** — each verified to exist in the shipped bundle (`flushPending` → `stepEra` → `stepMarket` → `maybeSwan` → `stepAssets` → `simBusiness` → `stepGovernance` → `stepGroup` → `stepHouse` → `stepPersonal` → `stepCast` → `stepRival` → `refreshDeals` → `refreshContractOffers` → `resolveDeals` → `maybeOfferPartner` → `snapshot` → `checkEnd` → `dueThread` → `pickEvent` → annual review) |
| endings | retire · season · bankrupt · health, with conditions read from the source |
| what happens to you | **87 events** in five decks (23 life, 27 more, 12 policy, 14 business, 11 government), each with its description and option count, plus **26 multi-stage arcs** |
| what you can do | **43 screens · 249 labelled controls**, per screen, with the busiest named (Work 44, Money 19, People 18) |
| what you can pull | 7 careers · 10 businesses · 11 goods · 13 assets · 8 deal types · 6 covenants · 21 board resolutions · 10 household roles · 7 negotiation tactics · 3 levers · 8 traits · 5 ambitions · 7 eras · 7 difficulties · 6 season axes · 9 board archetypes · 6 cities · 5 profiles — every column read from the table |
| repercussions | 14 mechanism entries: delayed consequences, insolvency, debt service, inflation, covenants, group cross-default, the board, the rival, the cast, stress and health, business failure, deal outcomes, partner offers, arcs |
| the registry | all 166 registered actions, alphabetised, in a fold |

**Two self-inflicted bugs, both caught by checking output rather than trusting it:**
the first harvest put its marker *inside* the HTML tag, so stripping tags deleted
the marker and the book reported **0 controls on all 43 screens**; and an earlier
version passed `800` where a wait was expected, so a milestone was measured
against a click that never happened. Both are recorded in the tool's own comments —
the rule is that a generator which prints zero should look suspicious, not final.

**The product did not change:** the bundle is untouched at 1,104,445 B ·
`b5bc961f13a707d4`, and the suite re-ran clean after the tool was added.

### 22.78 — One file: the findings consolidated, and the duplicates accounted for

**Asked for:** *"put our findings in one file. structure them properly and remove
any unnecessary one, then update zip."*

**Before:** the competitive and UX read was spread across three prose documents
(527 lines) that repeated each other — the "what not to take" list appeared twice,
the competitor facts twice, the method notes three times — plus two self-contained
HTML presentations that embedded the same content and the same images as base64
(672 KB of duplicate).

**After: `FINDINGS.md`** — one structure, no repetition:

| section | content |
|---|---|
| 0 | evidence base: what was seen, what was **not** (their play session is unplayed, 18+ and gated) |
| 1 | the competitor in facts, sourced |
| 2 | the difference that decides it — the axes table and the one-paragraph verdict |
| 3 | what works in their screens *and* their journey: seven principles, each translated into our language |
| 4 | our journey, measured — the walk, the loop's tax, the two findings that reframe the argument |
| 5a | **flow defects** F1, F1b, F2, F3, F4 — each with its evidence and the gate that proves the fix |
| 5b | **surface changes**, ranked by impact ÷ cost |
| 5c | **growth moves** — the rest of their playbook, costed |
| 6 | what not to take, and why |
| 7 | evidence, instruments, commands, ethics |
| 8 | method notes: the four mistakes this review caught — every one of them mine |
| 9 | if you only do three things |

**Accounting for every removed file** (nothing was deleted without a line here):

| removed | why | where it went |
|---|---|---|
| `MARKET.md` (13 KB, 242 lines) | superseded | merged into FINDINGS §1, §2, §5c, §7 |
| `visual/REVIEW.md` (8 KB, 119 lines) | superseded | merged into FINDINGS §3, §5b, §6 |
| `ux/UX.md` (9 KB, 166 lines) | superseded | merged into FINDINGS §3 (journey), §4, §5a, §8 |
| `visual/compare.html` (415 KB) | a second copy of the review, with the images embedded | its four images are the captures listed below; the prose is FINDINGS §3 |
| `ux/journey.html` (242 KB) | same, for the journey | prose is FINDINGS §4; the numbers are `ux/journey-ours.json` |
| `visual/shots/01-first-quarter.png`, `05-help-table.png` | screens of our own game, reproducible from the repo | deleted |
| `visual/shots/` (folder) | held only the two competitor captures | renamed **`evidence/`** |
| `ux/shot-silent-refusal.png` | our own screen, captured for F1 | deleted; F1's evidence is the `title` attribute quoted in FINDINGS §5a |

**Kept, deliberately:** `evidence/lagoslife-phone.jpg` and
`evidence/lagoslife-city-map.webp` — the only artifacts here that cannot be
reproduced, because they need an account to reach. Plus the instruments
(`tools/playtest.mjs`, `tools/journey.mjs`, `npm run content`), the protocol and
its sheet (`playtest/`), the recorded measurements (`playtest/seat-ledger.json`,
`ux/journey-ours.json`), and `CONTENT.md` — which is not a finding but the game's
own content, generated from the module.

**References repaired, not left dangling:** `README.md` (four bullets → two),
`playtest/PROTOCOL.md` (its cost sheet rewritten to mirror FINDINGS §5a–5c, and
its section pointers corrected), `tools/playtest.mjs` header, and the seat CSV.

**One mistake, caught by the gates, worth recording.** Appending this entry I wrote
`open(FEATURES,'w').write(open(FEATURES).read() + entry)` — the outer `open` for
writing **truncates the file before the inner read runs**, so the read returned
nothing and 6,689 lines were replaced by 57. `npm test` failed within the minute:
`inventory` reported "§12.10 has gone back to claiming 20 household roles" and
`audit` reported every action undocumented, because both gates parse this file.
Restored from git, re-appended in the safe order, and the same suite then passed.
The gates are not decoration: they caught a data-loss bug in the act of writing
the record of them.

**Nothing shipped changed:** the bundle is untouched at 1,104,445 B ·
`b5bc961f13a707d4`.
