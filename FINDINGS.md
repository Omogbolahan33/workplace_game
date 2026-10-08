# FINDINGS.md — the competitive and UX read

*7 October 2026. This file is the whole analysis in one place: it merges what were
`MARKET.md` (the competitor), `visual/REVIEW.md` (their screens) and `ux/UX.md`
(the player's journey), removes the repetition between them, and keeps only the
conclusions that are backed by something measurable.*

*Companion files, all of them instruments or raw data rather than prose:
`playtest/PROTOCOL.md` (how to measure their game), `CONTENT.md` (what our game
actually contains, generated), `tools/playtest.mjs`, `tools/journey.mjs`, and the
evidence in `evidence/`.*

---

## 0. Evidence base — what was seen, and what was not

| | |
|---|---|
| **Their side** | Public lobby at `lagoslife.app` (desktop and phone), their own stats page, an unofficial wiki built from their game's data, two game-index pages, and two player captures. |
| **Not seen** | **Their play session.** Lagos Life is 18+, login-gated and server-side. Everything below about their *loop* is observed from outside it, and marked as such wherever it matters. Nothing here claims to know how their game feels to play. |
| **Our side** | Measured, not described: `tools/playtest.mjs` (structure, scarcity, irreversibility, artifact) and `tools/journey.mjs` (the walk: taps, seconds, interruptions) against the shipped file at 390px, seed 4242. |

Numbers attributed to them are **their numbers**, reported by them. Numbers about
us were produced by the tools named beside them and can be reproduced with
`node tools/playtest.mjs` and `node tools/journey.mjs`.

---

## 1. The competitor, in facts

| | |
|---|---|
| What | **Lagos Life** — free, browser-based, multiplayer, Sims-style life sim set in Lagos |
| Who | Shalom Rayhamen (@Shalom_HeyEliy), operating as **Eliy** |
| When | launched **1 October 2026** |
| Where | lagoslife.app (also lagoslife.eliysites.com); no store app, no download |
| How | one shared live city for every player; chat, visit homes, send money; sign-up required, 18+ |
| Money | free to play; optional wallet top-up that buys in-game naira; explicitly no cash-out |
| Their claims | their stats page: **>1.1M players, 8.4M visits, 60k+ concurrent** (5 Oct). Their lobby on 7 Oct: **97k online, 21.3M visits**. Treat as marketing; the order of magnitude is not in dispute |

**What is in it** (from the wiki's reading of the game's own data): **31 locations**
— Afrika Shrine, Amala Shitta, CcHub, Freedom Park, Quilox, Elegushi, UNILAG, the
polling unit, the mosque, the church — each with opening hours; **275 activities**,
each with a time cost, a naira cost and a skill it trains; **21 careers × 5 levels**
(₦6,600 → ₦99,000 a shift); **8 businesses from ₦150,000**, a haulage trailer, **6
land plots from ₦250,000**, sea plots, 400 homes, a CcHub startup pitch; six needs,
two traits, a lifetime dream; **rent every Saturday** (₦1,200 hall · ₦2,400 Mushin ·
₦6,000 Yaba); a **weekly governor election**; and **the birth lottery** — dealt once
per account, not chosen: **Nepo Baby** (₦500,000 and a Lekki flat) or **LAPO Baby**
(a ₦60,000 loan repaid at ₦12,000 a week).

**Why it spread:** a Lagosian recognises every noun on the first screen; there is
nothing to install and nothing to pay to start; the lobby shows real people and
live counters; the start is **dealt, permanent and unfair** — a screenshot and an
argument; and the whole thing can be described in one WhatsApp message.

---

## 2. The difference that decides it

They are not making our game, and we are not making theirs.

| axis | Lagos Life | LEDGER |
|---|---|---|
| **Time** | real-time, a week at a time, rent every Saturday, weekly election | **30 years in about an hour**, quarterly commitments |
| **World** | one live shared city; other humans *are* the content | deterministic solo sim; same seed, same life; optional player-owned cohort backend |
| **Depth** | 275 activities, six needs — breadth and grind | markets, FX and inflation **across six cities**, portfolio, negotiation, board votes, household, legacy |
| **Entry** | account, email, 18+, server | open a 1.1 MB file; offline; no account, no ads, no trackers |
| **Failure mode** | "Reconnecting to Lagos…" (they ship a support page for it) | a deterministic sim cannot disconnect |
| **Money** | IAP naira top-ups | none, and none planned |
| **Local flavour** | the whole product | a Lagos-default city among six, mostly generic nouns |

> **Theirs is a city you log into; ours is a life you can hold.**
> They won the distribution game before we entered it, and we will not beat a
> million-player social loop with a single HTML file. We can be the *other* thing
> in the same city: serious, private, deterministic, deep — and it is not a
> consolation prize, it is a different title. Somebody won the week. We are
> building the thirty years.

---

## 3. What works in their screens and their journey

Seven principles, each turned into something in **our** language rather than
copied. These apply to both the surface and the flow.

| what works there | the evidence | what we do with it |
|---|---|---|
| **The setting is the interface** | a drawn Lagos where every landmark is a door: Afrika Shrine, Amala Shitta, the Lagoon, "Airport · Coming soon" | not the illustration — the *orientation*: our chronicle should read as a place in time, decades as bands and commitments as pins, so a player can point at where a life went wrong |
| **Render the familiar** | their first screen is a phone OS grid of Lagos apps — Jobs, Bank, Chowdeck, Nollywood, Bet Tips | our dials and sliders already work; make the recurring quantities into fixed instruments (a quarter ring, an hours strip) that never move between screens |
| **Label everything, tiny and consistent** | a 12px caption under every icon, a name chip on every landmark | one inline 24px SVG set, state-tinted: five resources, five tabs, three decision classes. A sprite inside the single file — request count stays zero |
| **Make the room visible** | "109k Lagosians playing right now", avatars, live counters in the chrome | we must not fake a crowd — that would be a lie about the model (one player, one file). Show **the player's own evidence**: chronicle count, quarters left, live commitments |
| **One accent, one action** | "Sign up free" is a huge green pill top and bottom; everything else is a quiet white chip | we hold one accent (gold). Formalise it: the accent means **state change** — advance, commit, confirm. Never decoration. Primary modal actions go full-width in the thumb zone below 640px |
| **Ambient colour** | a purple→orange wallpaper and a drawn skyline: the background carries mood, not information | we already have era tones; let them tint the chrome by decade so thirty years is *felt*, not just read — the one place colour may be decorative, because it is information about time |
| **Show what is coming, in place** | "Airport · Coming soon" sits on the map where the airport will be | keep our version ("Relentless (locked)") and keep the *reason* attached to every disabled control |

**Their journey**, observed from outside (the play session itself is unplayed):
arrive on the map with no account → sign up *after* the world, not before →
create a Sim in three familiar nouns → **the birth lottery**, dealt once and
permanent → a home with a price and a weekly clock → a job on a phone you
recognise → shifts and Saturday rent → a weekly election everyone shares.

**And the one thing their journey has that ours cannot copy:** their loop is kept
alive by **appointments** — a shift, a Saturday, an election. The world moves while
you are away, so their modal beat is a dispatch from a place that kept happening
without you. **Our world does not move without us: a quarter waits.** Copying
their modal rhythm would copy the cost and leave the benefit. Ours has to be a
*re-entry* hook — the chronicle newest-first, the agenda that says what is live,
the season with a terminal date. That is what F2 and F3 below are for.

---

## 4. Our journey, measured

`node tools/journey.mjs` · 390px · name Tunde · Lagos · Fresh Graduate · Realistic ·
default seed. One walk, one machine, one seed: these are the numbers of that walk.

| beat | cost | what happens |
|---|---|---|
| open the file | **0 taps · 0.8 s** | the deal is already on screen — no account, no install, no landing page |
| name, difficulty, finish line | **3 taps · 2.6 s** | three steps, each reversible with Back; the rules are shown, not hidden |
| Q1 2026 | 3 taps | the screen states the loop and the agenda says what is next |
| follow the agenda → Money › Deals | 5 taps | the agenda names the deals first |
| **the refused commitment** | 6 taps | both deals cost more than a Fresh Graduate holds; Commit is disabled with its reason in a `title` tooltip |
| the thing you can actually do | 9 taps | a career action — you spend *hours*, not money |
| **the loop** | **2.83 taps · 1.83 interruptions per quarter** | "Closing the quarter" every time, plus an event most quarters |
| thirty years | 168 quarters | ≈ **300 interruptions** across a life |

**Every destination in the game is exactly 2 taps away** — tab, then sub. Eleven
tried, eleven at 2. That is uniform IA worth protecting.

From `tools/playtest.mjs`: a full arc is **168 quarters** (age 23 → 65); **0.99
forced interruptions per quarter**; **10 things asking for a decision** at a
sampled moment; **166 registered actions**; scarcity is 5 money fields + hours per
quarter + 5 personal states; undo classes are **free / at a cost / sunk**; the
artifact is 1,104,445 bytes with **0 external requests**, no account, free.

**Two findings that change how the game should be argued about:**

1. **A run that makes no choices still reaches retirement** (age 65, ₦2.03bn
   passive). The sim has a floor, so a commitment is a *deliberate* move above it,
   not a survival tax — which is why a quarterly loop can hold where a weekly one
   is needed to keep a live world alive.
2. **Hours are the only resource that never carries.** Money is re-earned; a
   quarter is gone. Scarcity in this game is time, and the copy should say so.

---

## 5. The fix list

### 5a. Flow defects — found by walking, each with its evidence

| # | defect | measured | fix | proves it |
|---|---|---|---|---|
| **F1** | **The reason on a disabled control is a tooltip** | at Q1 both deals are unaffordable; `takedeal` is correctly disabled with `title="Needs ₦3.12m · you have ₦180k · short ₦2.94m"` — a 390px phone never shows it | put the shortfall in the row as visible text (one chip); keep the tooltip for desktop | `.harness/disabled.js` gains an assertion that affordability-disabled controls carry a *visible* reason |
| **F1b** | **The agenda leads with what you cannot do** | the Q1 agenda names the deals first; the first *actionable* commitment is nine taps away | rank agenda items by what is actionable now; keep unaffordable deals as teaching, not as the lead | a journey assertion that the first agenda item is actionable in the default deal |
| **F2** | **The modal tax** | **1.83 interruptions per quarter**, ~300 across a life; every advance costs a tap plus "Closing the quarter" | the quarter-close digest lands in place on the screen you are already on; only genuine news interrupts | `tools/journey.mjs` thresholds: interruptions must fall, taps must not rise, `textaudit --check` must show no text lost |
| **F3** | **No way back** | 11 destinations, all 2 taps in, none with a one-tap return; the start modal has Back, no route does | the in-app back already on the queue: previous route, in the header | a journey walk that goes three taps deep and returns in one |
| **F4** | **The reveal is missing** | we offer five profiles, all chosen; theirs is dealt once, permanently, and is their players' favourite screenshot | **Deal me a life**: a beat between naming yourself and Q1, permanent for the run, printed into the chronicle | a fixed-seed test: same seed, same life; the deal line is in the chronicle |

### 5b. Surface changes — ranked by impact ÷ cost

| change | cost | what it is | why it beats theirs |
|---|---|---|---|
| **An hours instrument** | S | 24 pips per quarter that visibly empty as you spend, present on Work and Money, identical in both renderers | hours are our scarcest resource and today they are a sentence; their scarce resources are hidden inside activities |
| **The life map** | M | a 30-year timeline over the chronicle: era bands toned by `ERA_TONE`, a pin per decision, gold for the irreversible — tap a pin to scroll to the entry | it is the chronicle's index *and* the share card's artwork: one drawing, two jobs |
| **One 24px state-tinted icon set** | M | inline SVG sprite, ≤ 3 KB: five resources, five tabs, three decision classes | emoji (theirs) render differently per platform and cannot be tinted by state |
| **A face for the protagonist** | S | we have 36 faces in People and none for the run; put one in the chronicle header and the share card, aged by era | a life needs somebody to look at |
| **Era tint on the chrome** | S | apply `ERA_TONE` to the header rule, active tab underline and chart strokes by decade | their mood colour is decoration; ours would be information about time |
| **Primary actions in the thumb zone** | S | modal primary buttons full-width and bottom-anchored below 640px | their one big CTA is their best surface decision |

### 5c. Growth moves — the rest of their playbook, costed

| move | cost | what it is | why it is worth it |
|---|---|---|---|
| **The share card** | M | a share affordance on the chronicle and the run-over card: a compact card — dealt start, city, year-30 net worth, three chosen decisions — through the native share sheet, falling back to clipboard + a `data:` image on desktop | the chronicle is our best-looking artifact and there is no way out of the file; their growth engine is a screenshot travelling through WhatsApp, and ours needs no server to travel the same way |
| **Lagos nouns** | M | a copy pass, no mechanics: the landlord has a name, transport quotes danfo and okada, the power shock has a Lagos rhythm, rent day is a day | the one axis where they beat us outright, and it is copy, not balance. Keep every number exactly as it is — `textaudit --check` and `tables.mjs --verify` must both stay clean |
| **An appointment** | S/M | when a season runs, the chip counts down to the close and the season modal shows the cohort's standing | theirs has rent every Saturday and a weekly election; we have the season system already and it is quiet |
| **Named pressure** | S | name the recurring antagonists once and reuse them: the landlord, the tax officer, the bank, the board chair | their Baba Landlord and Gov @Franka are remembered; our arcs, covenants and board archetypes are procedural and mostly anonymous |
| **Publish our own numbers** | M | a season page over the optional backend: runs this cohort, median real net worth at the terminal, best and worst deal — opt-in, no tracking | it is the social proof we can show honestly, from data we already store |
| **Be findable** | M/L | a public site generated from the tables the game already runs on, so docs cannot drift from the sim | they are found by search and documented by strangers; we have one HTML file and no indexable pages |
| **Add to home screen, on the first run** | S | the install affordance exists; put it where a first-time player walks | their "no download" is a feature they advertise; ours is the same feature, unadvertised |
| **A one-line answer to "what is this?"** | S | a first-run line shaped like the sentence a stranger would repeat | theirs is "the Sims in Lagos" — one sentence, told by other people |

**Order of work:** F1 → F1b → F4 → the share card → F2 → F3 → the surface set →
the Lagos nouns pass, then the rest of §5c as the season backend allows. F1, F1b and F4 are each a
day's work and each removes a leak a player actually hits.

---

## 6. What not to take, and why

- **Server-authoritative realtime multiplayer.** It would cost offline, the single
  file, determinism and the whole test story — the four things that make this
  product defensible.
- **IAP currency top-ups.** Theirs is honest about it and 18+; ours has no scarcity
  to sell that would not corrupt the sim. Scarcity is the game.
- **Accounts required to play.** Our entry is opening a file. Keep it.
- **Live player counters, NEW badges, notification dots.** Six red NEW chips on
  their first screen is an ad-slot pattern. Our bell means something; keep it the
  only badge.
- **Emoji as iconography.** Charming, but they render differently on every platform
  and cannot be tinted by state. Charm is fine; a system is better.
- **Isometric illustration.** A year of art, and it fights data density. We are not
  a place sim; the place is the ledger.
- **Six needs and 275 activities.** That is chores-as-retention. Our quarterly
  commitment is the opposite bet.
- **Re-rollable randomness.** The lottery only works because it cannot be re-dealt.
  Ours must be permanent per run, or it is a slot machine.
- **Their green-on-bright palette.** Wrong for us, and a second accent would break
  the one-accent rule.
- **Uniform loudness.** Their map has no quiet: labels, billboards, a cookie bar and
  two competing CTAs. Our dark base with gold reserved for change is a real
  advantage for a thirty-year game; protect it.

---

## 7. Evidence, instruments, and how to extend them

| file | what it is | command |
|---|---|---|
| `evidence/lagoslife-phone.jpg` · `evidence/lagoslife-city-map.webp` | the two competitor captures the visual read is based on (not reproducible without an account) | — |
| `playtest/PROTOCOL.md` | how to measure **their** loop with a stopwatch: five groups of fields with units, three fixed sittings (cold 30 min · return ≥24 h later · mature), an event-log format, a cost sheet, ethics | read, then sit |
| `playtest/seat-lagos-life.csv` | the blank sheet for their side, field names matching ours | fill during the sittings |
| `tools/playtest.mjs` | our seat, measured from the running game; prints both columns side by side | `node tools/playtest.mjs --compare playtest/seat-lagos-life.csv` |
| `playtest/seat-ledger.json` · `ux/journey-ours.json` | our seat, and the raw record of the walk in §4 | `node tools/playtest.mjs` · `node tools/journey.mjs` |
| `tools/journey.mjs` | walks the shipped page and counts taps, seconds, interruptions, destination cost | `node tools/journey.mjs` |
| `CONTENT.md` · `content/inventory.json` | what the game contains — 87 events, 26 arcs, 21-step quarter, 249 controls across 43 screens — generated from the module | `npm run content` |

**The rule the protocol enforces: copy nothing the log does not show working.**
Each mechanic on the shortlist gets *copy*, *decline* or *unmeasurable* once their
side has been played, and the reason has to be a line from the sitting.

**Ethics for their side:** 18+ and a real sign-up are theirs to set — use your own
account, never share credentials, never enter them anywhere but `lagoslife.app`.
Do not spend real money on top-ups. No scraping their backend, no automating their
client: the numbers wanted are the ones a human produces.

---

## 8. Method notes — four mistakes this review caught

All four are the same class of error: trusting an impression or a return value
instead of checking the thing itself.

1. **A scaled screenshot lied about our own help table.** I was certain the rule
   column was centre-aligned and was one edit from "fixing" it. It is left-aligned:
   both wrapped lines start at **x=43**, and the cell computes `text-align:start`.
2. **A journey tool that counts clicks lies.** The first run recorded "a deal
   taken" for a deal that was *refused* — an in-page `click()` on a disabled button
   returns `true` and changes nothing. The instrument now reads the header before
   and after every milestone; the walk above records the refusal as a refusal.
3. **A harness argument swallowed a click.** `tap(sel, 800)` passed `800` as the
   *text to match* rather than a wait, so three clicks silently never happened and
   the game looked broken at the start modal. The probe that found this then found
   F1 for real, in the DOM.
4. **The content generator harvested zero controls on all 43 screens** because its
   marker was placed *inside* the HTML tag and was deleted with the tag. Zero should
   look suspicious, not final.

---

## 9. If you only do three things

1. **F1 — put the shortfall on the row.** The cheapest fix in this file, and the
   one a new player hits in their first minute.
2. **F4 — Deal me a life.** The reveal their players screenshot, built from five
   profiles we already have.
3. **The share card.** The chronicle is our best-looking artifact and there is
   currently no way out of the file; their growth engine is that screenshot
   travelling through WhatsApp, and ours can travel the same way without a server.
