# The redesign — one screen at a time, no feature lost

*"The UI is too text bulky. Take each screen individually and start redesigning.
Redesign only, not losing features."*

A design complaint is a feeling until it is a number. This is the number, the
plan, and the rules that keep the plan honest.

---

## 1. What was measured

`node tools/textaudit.mjs` renders every route through the real screens — the
single-file build, the same module the gates drive — and counts the text a player
actually meets:

- **in the way** — characters on screen *by default*. Text behind a closed
  `<details>`, or in a popover, is not in the way and is not counted here. This is
  the number the redesign is judged on.
- **total** — including everything folded away. The words may move; they may not
  vanish.
- **controls** — every button by the action it fires, so "redesign" can never
  quietly mean "removed".

Two worlds are measured, because a screen's weight depends on what exists: *early*
(a person, no company) and *trading* (ten years in, staff, a board, a group).

**Today, in the way, across 22 routes:**

| world | in the way | median per route | worst five |
|---|---|---|---|
| early | **20,369** | 855 | markets 2,566 · **settings 1,955** · people 1,817 · career 1,758 · household 1,605 |
| trading | **23,795** | 949 | chronicle 3,966 · markets 2,542 · settings 1,955 · people 1,813 · career 1,760 |

### The finding

It is not that screens have a lot of text. It is *where* the text is, and it is
the same mistake on every screen:

> **Screens open with a lecture, at exactly the place the player is trying to
> decide.**

The longest single blocks in the game, and what they are:

| chars | screen | the block |
|---|---|---|
| 307 | Money › Group | "A company's profit is not your money. It belongs to the company until the board declares it, and when it…" |
| 287 | Work › Household | "Start with a housekeeper or a cook. Add a nanny when there are children and a driver when traffic costs…" |
| 227 | Legacy › Settings | "No fixed setting. The game reads your record and sets the difficulty itself, then keeps raising it for a…" |
| 208 | Money › Markets | "When inflation exceeds the policy rate, holding cash is a guaranteed loss. When the currency is falling,…" |
| 201 | Legacy › Ambition | "Nobody at your funeral is going to mention your quarterly returns. The game keeps the other score anyway…" |

Every one of these is a **teaching paragraph standing between the player and the
controls**. Each is well written. Each is in the wrong place. A player reading
Money › Markets for the fourth time does not need the lesson again; a player
reading it for the first time wants the lesson *available*, not *in front*.

---

## 2. The vocabulary — six moves, and nothing else

The redesign uses a closed set of patterns, all of them already in the game's own
language. No new visual system, no new component library: the screens keep their
cards, chips, tables and colours.

1. **Lead with the decision.** The first thing on a card is the number or the
   control. Prose never sits above the fold.
2. **A card heading is one line of fact, not a paragraph.** `Heading` +
   `status chip`, on one line. Anything longer is not a heading.
3. **Teaching goes behind the question mark.** The `?` affordance already exists
   (`whyq` / `whyopen` / `hidewhy`, with a per-screen memory). A card's explanation
   becomes a `<details class="note"><summary>Why</summary>…</details>` — closed by
   default, one tap to open, remembered by the browser, costing nothing until it is
   wanted.
4. **Rules become chips; sentences become tables.** "Add a nanny when there are
   children" is a condition, and conditions are one-liners. Repetition of the shape
   *label — value — value* is a table with headings, once.
5. **Machine text is never unfolded.** The portable save string, the SQL, a
   payload: behind a disclosure, closed, with the button that acts on it outside.
6. **Say a thing once.** Guidance that appears on several screens belongs in one
   place (the header's bell), not repeated on each.

What is *not* in the vocabulary: hiding a control, disabling without explanation,
moving a feature to another screen, or shortening a string into ambiguity.

---

## 3. The rules of the project

These are checks, not intentions.

| rule | how it is enforced |
|---|---|
| **No control lost** | `node tools/textaudit.mjs --check` compares every route's controls against `tools/text-baseline.json` (108 controls recorded) and **fails** if one is gone. |
| **No figure lost without saying so** | The audit reports the counts; a phase that removes a number must name it in its record. |
| **Text moves, meaning stays** | `total` (including disclosures) is reported beside `in the way`. A phase that lowers *in the way* while lowering *total* is deleting, not redesigning. |
| **The budgets hold** | The e2e copy gate: control labels ≤ 42 characters, paragraphs ≤ 320, chrome ≤ 15% of the viewport, nothing under 11px, nothing spilling. |
| **Every screen still works** | 41 gates + unit/integration/e2e. A redesigned screen must pass the layout gate at 390px *and* the React comparison (`react-screen`), because both renderers draw it. |
| **Both renderers** | A screen is markup in the single file and React in the app. The redesign lands in core/ui, so both get it; `screens/*.jsx` follows when a screen's structure changes. |

---

## 4. The phases

One screen per phase. Each phase is: **measure → redesign → check → gates → record
in FEATURES.md**. Ordered by measurement, worst first — and **re-measured after every
phase**, because fixing one screen changes which screen is worst. That is why the
order below is not the order the phases ran in: Property measured at 1,111 only came
into view once Household (1,605), People (1,817) and Career (1,758) were down.

| phase | screen | in the way now | worst block | the specific work |
|---|---|---|---|---|
| **1 ✓** | **Legacy › Settings** — *done, see §6* | ~~1,955~~ **992** (+ 9,859 machine) | ~~227~~ 125 | The biggest screen: 4 cards, 20 controls, the portable save string unfolded in the middle of the page. Group it into *This run · Device · Preferences*; the save string goes behind a closed disclosure with its buttons; the difficulty lecture becomes a one-line status + `Why`. |
| **2 ✓** | **Money › Markets** — *done, see §7* | ~~2,566~~ **915** | ~~208~~ 43 in the way | The lecture above the numbers ("when inflation exceeds the policy rate…") becomes a `Why` disclosure; the market table leads. |
| **3 ✓** | **Money › Group** — *done, see §8* | ~~1,531~~ **566** | 307, now folded | The worst single block in the game, on a screen with **no controls at all** — pure reading. Group accounts become a table; the 307-char lesson becomes a one-line rule + `Why`. |
| **6 ✓** | **Work › Household** — *done, see §11* | ~~1,605~~ **637** | 287, now folded | Roles: the "start with a housekeeper, add a nanny when…" paragraph becomes the role rows' own one-line conditions. |
| **4 ✓** | **Legacy › People** — *done, see §9* | ~~1,817~~ **1,344** | 54 (an action label) | 27 controls, the widest screen. One row per person with their state as chips, instead of paragraphs per person. |
| **5 ✓** | **Work › Career** — *done, see §10* | ~~1,758~~ **414** | 43 | The career ladder becomes a table; the "relationship capital compounds" note becomes a `Why`. |
| **8 ✓** | **Legacy › Ambition** — *done, see §13* | ~~1,127~~ **781** | ~~201~~ 63 | Ambitions as comparable rows (target, progress, payoff) instead of four descriptions. |
| 9 | Money › Position | 831 | 189 | Figures lead; the "every naira you spend here" note to `Why`. |
| 11 ✓ | **Money › Budget** (855 → 806) and **Overview** (898 → 767) — *see §16* | A log, not a screen: group by era, one line per decision, the outcome in a chip. |
| **13 ✓** | **Legacy › Chronicle** — *done, see §17* | ~~3,966~~ **823** in a mature run | 113, folded |
| **14 ✓** | **The shell** — *done, see §19* | ~~5,693~~ **4,244** across 8 surfaces | where the vocabulary is either felt or not |

### Done when

- **median route** ≤ **500** characters in the way (from 855/949);
- **no route** over **1,200** in the way, except two, both named and measured
  rather than excused: the **chronicle** (a log, budgeted at 1,500 with its
  grouping) and **Legacy › People**, which is nine people's own data — a name, a
  role, an age, two traits, two scores and up to three actions each, with no
  paragraph left on the screen at all. Its floor is about 1,300; it is budgeted at
  **1,400**, and §9 records the arithmetic;
- **zero controls lost**, across both worlds;
- every gate and test green at each phase, not just at the end;
- every phase recorded in FEATURES.md with its own before/after numbers.

---

## 5. What this project is not

- **Not a re-skin.** No new colours, no new spacing system, no new icon set. The
  complaint is bulk, and the fix is placement.
- **Not a simplification.** Every mechanic, control and figure survives. If a phase
  cannot lower the text without losing something, it says so and stops.
- **Not a rewrite of the copy.** A sentence that is in the way moves; the game's
  voice (plain, dry, Nigerian, unsentimental) is the thing that makes it worth
  reading when you *do* open it.

---

## 6. Phase 1, done — Legacy › Settings

Measured on the built file, both worlds, `node tools/textaudit.mjs --check`:

| | before | after |
|---|---|---|
| in the way | 1,955 | **992** (−49%) |
| longest single block | 227 | **125** |
| written on the screen, folds included | 1,955 | **2,416** — *up* 461, because the prose the redesign moved is folded, not deleted |
| machine text (the portable save string) | ~17 KB, **unfolded** in the middle of the page | the same ~17 KB, behind a disclosure |
| folded away | 0 characters, 0 folds | 1,424 characters behind 5 folds |
| controls lost | — | **0** (6 relabelled, listed below) |

**What the screen is now.** Four cards, each leading with its controls:

1. **Save & load** — three rows, and each row says *what is in the slot* (name ·
   quarter · net worth), which the old screen did not: "Load 1" was a button with
   no way to know what slot 1 held. You pressed it and found out.
2. **Run settings** — the seven difficulty tiers as a **comparison table** (tier ·
   odds shown · coaching · reload · pay multiplier) with the row you are playing
   highlighted, instead of six paragraphs you cannot compare; each tier's own
   sentence is one tap away under *What each tier plays like*. Location is a row of
   chips.
3. **Device & data** — the note, the install control, and the save string behind
   `Portable save string · 12 KB` with Copy and Import inside.
4. **Screen tips** — unchanged in substance, one line shorter.

Three explanations live behind a `Why` fold and one behind a disclosure: **5 folds
where there were 0**.

**The nine moves the plan allowed, as used here:** lead with the control (the
buttons are at the top of every card) · headings are one line · teaching behind a
disclosure · rules as a table · machine text never unfolded · say a thing once
(the autosave sentence now appears once, as a fold, instead of as a paragraph
above the buttons); the other moves (chips for state, one row per thing) are for
the screens in phases 2–10.

**Deviations from the plan, and why:**

- The plan named the cards *This run · Device · Preferences*. They are *Save & load
  · Run settings · Device & data · Screen tips* — the first two headings are the
  ones `ROUTE_GROUPS` already names, and that table is **frozen reference data**
  (`--verify` compares it to the original game token for token). Renaming a card
  would have meant re-baselining frozen data to suit a redesign, so the heading
  stayed and the content moved under it. `group` — the gate that catches a spec
  naming a card that no longer exists — passed untouched and unedited.
- The plan said the difficulty lecture becomes "a one-line status + Why". It became
  a table plus a fold, which is strictly better: the facts the tiers differ by are
  now comparable, and the sentences survived in the fold. The `--check` total
  proves nothing was deleted to achieve the −49%.

**One control the raw button count lost, named:** the count went 20 → 19 while the
*act* multiset stayed identical (0 lost, 0 added). The missing button is the old
difficulty row's disabled, inert `<button class="btn xs" disabled>` on the tier you
are *already playing* — markup that could not be pressed and fired nothing. It is
now a marker on the row ("playing") plus the highlighted row and the summary above
it. Proved by rendering the original game (`reference/baseline-single-file.html`)
and diffing buttons: 23 → 21, and the two are that button and the install button
that only exists while the browser holds an install prompt.

**Relabelled controls (reported, not hidden):** `save|Save slot 1→Save` ·
`save|Save slot 2→Save` · `save|Save slot 3→Save` · `load|Load 1→Load` ·
`load|Load 2→Load` · `load|Load 3→Load`. The row already says which slot it is, on
the same line as the button, so the button no longer has to.

**Two gates that were lying, and are now stronger:**

- **`inventory`** asserted "the settings screen offers 3 save slots" by grepping
  the *source* for `data-s="s1"`. A slot built in a loop cannot be seen that way,
  so it reported a screen with six slot controls as a screen with none — and would
  have reported the same about any loop-written control, forever. It now renders
  Legacy › Settings (clearing `S.grp` first, because a collapsed group renders no
  body and a gate that passes by finding nothing is the other way a gate lies) and
  counts the slots on the screen, plus asserts there are six of them (a Save and a
  Load per slot), not merely three.
- **`react-screen`** has a guard list that proves each comparison is not vacuous by
  asserting a screen reaches a named section. It keyed the install section on the
  word `/Install/`, which after the redesign only appears on the button — a button
  that exists only while the browser holds an install prompt, so the guard would
  have failed for a reason with nothing to do with the section. It now keys on the
  section's own line (*runs with the network off*), and the real check — that the
  button appears in both renderers when a prompt arrives — is untouched.

**Both renderers, and the plumbing that keeps them one screen.** A converted React
screen may not import `@ledger/ui` (that is the package that called it — the cycle
`runtime.js` exists to prevent), and it may not duplicate the markup either, or the
comparison gate would be comparing a copy with its original. So:

- `parseSaveRaw(raw)` and `saveSlotRowHTML(slot, label, info)` now live in **core**,
  beside `diffListHTML` and `buildStamp`, which are the same kind of thing: markup
  both renderers embed. The *parse* of a stored save is now written once, in core;
  the *read* stays with whoever owns storage (the ui's host, and the app's own
  platform layer, one line each).
- `packages/ui/src/12-view-ledger-settings.js` keeps a one-line adapter
  (`slotRowHTML`) onto core's row; `apps/web/screens/view-ledger-settings.jsx`
  supplies the blob from the app's platform layer and calls core directly.
- Declared changes: **121 → 126** (`viewLedgerSettings`, `diffListHTML`,
  `parseSaveRaw`, `saveSlotRowHTML`, `slotRowHTML`), each with its why.

**Verified after the phase, not just at the end:** unit 42/42 · integration 23/23 ·
e2e 10/10 · `node .harness/run.js` **41/41 · ALL GATES CLEAN** · `deploy:check`
CLEAN · bundle **1,091,603 B · sha `c22f72e7e5745302`** · zip 353,269 B · 10 files.

---

## 7. Phase 2, done — Money › Markets

The worst route in the game, and the one that shows the pattern most clearly:
**the screen was built as a set of little lessons, one per instrument.**

| | before | after |
|---|---|---|
| in the way — early world | 2,566 | **915** (−64%) |
| in the way — trading world | 2,542 | **887** (−65%) |
| written on the screen, folds included | 2,566 | **2,836** — up 270, because the notes are folded, not deleted |
| folds | 0 | **4** |
| longest block still in the way | 208 | **43** (a news line) |
| controls lost | — | **0** — the same 13 Buy buttons and 13 amount boxes |

**What it is now.** A **price sheet**. One row per instrument — name, then the
chips that actually decide it (expected return, volatility, FX-linked, illiquid,
pays income, and what you hold) with the amount box and Buy on the row itself —
under its class heading, thirteen of them readable in one pass. What used to be
one bordered box with four stacked lines per instrument is now two lines with a
hairline between rows (`.mrow`).

**Where the text went.** The thirteen asset notes — *"Instant access. Loses to
inflation, every single quarter."* — are one disclosure, **What each asset is for**,
in the same order, each with its instrument's name. The 208-character macro lecture
is **What those rates mean** on the card holding those rates. The 430-character
"how returns work here" paragraph is a fold that kept its own title, on the card it
explains — which is also why the screen is **four cards → three**. The news shows
the three most recent items with the tail behind **Earlier news · N more**.

**One deliberate copy fix, recorded because it is a change to the words:** the macro
lecture read *"the currency is falling,anything priced in hard currency"* — a
missing space, in both renderers. It now reads `falling, anything`. No test asserted
the typo, and `react-screen` still compares the two renderers character for
character.

## 8. Phase 3, done — Money › Group

A screen with no state and no controls to lose, 1,531 characters of which **782 were
three paragraphs of teaching**: what a group is (307 — the longest single block in
the game), dividend versus upstream loan (179), and how a management charge works
(296).

| | before | after |
|---|---|---|
| in the way | 1,531 | **566** (−63%) |
| written on the screen, folds included | 1,531 | **1,579** — up 48, the three fold labels |
| folds | 0 | **3** |
| controls lost | — | **0** (0 added) |

The paragraphs are kept **word for word**; they are folded under **What a group is**,
**The two doors** and **How the charge works**, each on the card it belongs to. The
tables — the consolidated P&L, where cash and debt sit, intercompany balances,
management charges, the covenant strip — were already numbers on rows and were not
touched: on this screen the bulk was never the data.

**Verified for both phases:** unit 42/42 · integration 23/23 · e2e 10/10 ·
**41/41 gates clean** · `deploy:check` CLEAN · `react-screen` and `react-route` clean
across **29 routes / 9 states** · bundle **1,094,565 B · sha `83a3b9c0674f778d`** ·
zip 354,416 B · 10 files.

**Standings after three phases.** Worst in the way, both worlds: *people 1,817 ·
career 1,758 · household 1,605 · deals 1,200 · ambition 1,127*. Next is
**Legacy › People** (27 controls) and then **Work › Career** (a ladder that wants to
be a table).

---

## 9. Phase 4, done — Legacy › People

The widest screen in the game: 27 controls, nine people, 1,817 characters in the
way. Measured, the weight was one line per person and it was a *rendering defect*
as much as a design one:

```
generous, careless · means 16.778310123996636/100 · standing 22.88567320808015/100
```

That is ninety-odd characters carrying two facts, and two of them printed at full
float precision — the value is a fraction of 100 and nothing ever rounded it.
Nobody reads `16.778310123996636`.

| | before | after |
|---|---|---|
| in the way — early | 1,817 | **1,344** (−26%) |
| in the way — trading | 1,813 | **1,343** (−26%) |
| written on the screen, folds included | 1,817 | **1,485** |
| folds | 0 | **1** |
| longest block still in the way | 124 | **54** (an action's own label) |
| controls lost | — | **0** — 27 before, 27 after |

**It is rows now.** Four chips of whole numbers per person — two traits, `means 17`,
`standing 23` — with the 0–100 scale stated **once** in the card's heading instead
of eighteen times in the rows, the relation chip and its bar unchanged, the memory
line unchanged, and every action on the row. A person is a hairline row rather than
a bordered box. The card's sentence about mortality (*"These people get older,
richer, poorer and dead whether you are paying attention or not"*) sits folded at
the foot of the card it is about.

**The total fell by 332, and most of that is not text.** Rounding the two floats and
stating the scale once removed about 250 characters of *digits and repeated units* —
noise that was never meaning. The rest is the sentence moving behind its fold. The
record says so rather than claiming a clean −473 of prose.

**Where its budget went.** The remaining text is per-entity data: nine people ×
(name, role, age, two traits, two scores) plus the three things you can do for
each, plus the household card and the rival. There is now no paragraph on the
screen — the longest single block is a 54-character action label — and its floor
is ~1,300. This is why the done-when in §3 was amended to budget People separately
instead of pretending it could reach 1,200 without deleting people.

## 10. Phase 5, done — Work › Career

| | before | after |
|---|---|---|
| in the way — early | 1,758 | **414** (−76%) |
| in the way — trading | 1,760 | **416** (−76%) |
| written on the screen, folds included | 1,758 | **1,841** — up 83, which is ten fold labels |
| folds | 0 | **10** |
| controls lost | — | **0** |

Almost all of Career was teaching, and four of its six longest blocks were a single
action's own hint — 188, 177, 169 and 148 characters each:

> *Relationship capital compounds faster than money capital early on. It takes
> afternoons, though, and you have a finite number of them.*

The actions are rows now, and each carries its own **Why** fold. The hint is not
hidden from the decision it belongs to: it is still exactly what a wrong `Do it`
button says when it refuses (`title="Not open to you yet: …"`), so the reason is
never further away than the control. The three card notes — why performance drifts,
where the hours come from, how skills rise — are folded too.

**Two things this phase produced that are not this screen:**

- **`foldHTML(label, html)`** — the fold markup had been hand-written on four
  screens across three phases; a fifth copy is where copies start to differ. One
  helper, in the ui, used by the settings, markets and career screens.
- **A staleness guard in the audit.** Writing this phase, `--check` reported Career
  at 1,758 with *zero* folds — because the rebuild had aborted before `mkcheck`
  (an undeclared statement) and the audit was measuring the **previous** build while
  the new one sat on disk. A tool whose entire purpose is that it cannot flatter a
  screen had spent a minute quietly flattering one. It now compares the timestamp of
  `.harness/mod.js` against `dist/index.html` and **refuses to report at all** when
  the module is older. Proved by making it happen: `touch dist/index.html` →
  `STALE BUILD — … run bash tools/rebuild.sh`, exit 2.

**And one gate did its job on the way.** `react-screen` failed the first time
Career was folded — *"CSS classes lost: mrow"* — because the built-in drew the new
row while the React copy still drew its own bordered box. That is the class of
difference no screenshot shows and no reading catches, which is the whole reason the
gate exists.

**Verified for phases 4 and 5:** unit 42/42 · integration 23/23 · e2e 10/10 ·
**41/41 gates clean** · `react-screen` and `react-route` clean (29 routes, 9 states) ·
both worlds `NO CONTROL LOST` · `deploy:check` CLEAN · bundle **1,096,295 B · sha
`52c6e69f29776cf9`** · zip 355,189 B · 10 files. Declared changes **131 → 134**.

**Standings after five phases** (worst in the way, early world): *household 1,605 ·
people 1,344 · deals 1,200 · ambition 1,127 · property 1,111 · settings 992*.

---

## 11. Phase 6, done — Work › Household

| | before | after |
|---|---|---|
| in the way — early | 1,605 | **637** (−60%) |
| in the way — trading | 1,537 | **577** (−62%) |
| written on the screen, folds included | 1,605 | **1,822** — up 217 |
| folds | 0 | **3** |
| controls lost | — | **0** (8 before, 8 after) |

**Where the weight was.** Two lectures, in the two places a player decides
something: *"Nobody works for you personally. Every hour the house takes is an hour
you are not spending on the thing that makes you money…"* (160) on the empty roster,
and *"Start with a housekeeper or a cook. Add a nanny when there are children…"*
(287 — the longest single block in the game) directly above the hire list. Both are
folds now, under **Why hire anybody, and where to start**.

Then the four candidates. Each carried the boilerplate line *"Going rate for this
work is about ₦261k/mo."* and each spelled out its trait in full — so the same eight
sentences about traits appeared **up to five times on one screen**. The going rate is
a chip, the trait is a chip, and the meanings are a single **What the traits mean**
glossary, one tap away.

**This is the phase where "say a thing once" does real work.** The total text went
*up* by 217 while what is in the way fell 60%, because the glossary lists all eight
traits with their descriptions — including traits no candidate happened to have —
and every sentence that was on the screen is still there. Nothing was traded away to
buy the number.

**Note on the traits:** the glossary comes from `TRAITS`, the same table the rows
read, so a trait's meaning cannot drift from the trait. `inventory` counts that
table at 8 entries and passed untouched.

---

## 12. Phase 7, done — Money › Deals

| | before | after |
|---|---|---|
| in the way | 1,200 | **416** (−65%) |
| written on the screen, folds included | 1,200 | **1,262** |
| folds | 0 | **3 per deal + 2** |
| controls lost | — | **0** (4 before, 4 after) |

429 of the 1,200 were **a card of pure background** — three paragraphs on how to
think about deals — and the rest was a description sitting above the odds it
described. Each deal is a row now: quarters, upside, how often they work out, who
introduced it, what it asks for, as chips; its own sentence under **What it is**.
The background card keeps its heading (the grouping table names it) and its three
paragraphs move under **The three rules**. Commit and Pass are untouched, refusal
text included.

## 13. Phase 8, done — Legacy › Ambition

| | before | after |
|---|---|---|
| in the way | 1,127 | **781** (−31%) |
| written on the screen, folds included | 1,127 | **1,172** |
| folds | 0 | **3** |
| controls lost | — | **0** (7 before, 7 after) |

346 of it was teaching: *"Nobody at your funeral is going to mention your quarterly
returns…"* (201), the five constituencies (96), and the aside about changing your
mind (49). All three fold onto the cards they belong to.

**781 is this screen's floor and it is worth stating why.** What is left is the five
ambition names as buttons (133), the active ambition's own description (63, and it is
the thing you are aiming at), the scoreboard's five stat labels and their figures, and
the posterity card's live state — what your estate is worth and what happens without a
will. There is no paragraph left on the screen; the longest block is that 63-character
description.

## 14. Phase 9, done — Money › Property

| | before | after |
|---|---|---|
| in the way | 1,111 | **603** (−46%) |
| written on the screen, folds included | 1,111 | **1,266** |
| folds | 0 | **1** |
| controls lost | — | **0** (11 before, 11 after) |

All 1,111 characters were **notes**: eleven goods, each a bordered box with a sentence
under the name — *"The single most Nigerian purchase in existence. Fuel not included."*
— and thirty pixels of height held open for it, which is screen spent on flavour
exactly where the price and the effects should be. Each good is a compact row now
(effects and price as chips, the Buy button under them) and all eleven sentences are
kept, in order, in one **What each thing is for** fold. Same eleven buttons, same
disabled reasons, same prices.

**Verified for phases 7–9:** unit 42/42 · integration 23/23 · e2e 10/10 ·
**41/41 gates clean** · `react-screen`/`react-route` clean · both worlds
`NO CONTROL LOST` · `deploy:check` CLEAN · bundle **1,099,818 B · sha
`ecd9755d17ae5752`** · zip 356,478 B · declared changes **136 → 139**.

**Where the whole project stands: median 617 in the way** (from 855), **one route over
1,200** — Legacy › People at 1,344, the one the plan budgets at 1,400 and §9 explains —
and nothing else above **992**. Nine phases in, no control has been lost and no
sentence has been.

---

## 15. Phase 10, done — Money › Position

| | before | after |
|---|---|---|
| in the way | 831 | **469** (−44%) |
| folds | 0 | **3** |
| controls lost | — | **0** |

The largest block was **189 characters of philosophy at the foot of a screen about
cash** — *"Every naira you spend here is a naira that is not compounding somewhere
else…"* — on a card whose whole purpose is a number. The credit score moved onto the
**Borrow** heading as a chip, because *"Credit score: 42/100. Determines whether
anyone lends to you and at what rate."* is one number and one explanation, and only
one of them is state. Three folds: what the tab is asking, why repaying early
matters, and how borrowing works. Every figure, both borrow buttons, and every
`Repay` button untouched.

## 16. Phases 11 and 12, done — Budget, and the Overview

| screen | before | after | what it was |
|---|---|---|---|
| Money › Budget | 855 | **806** (−6%) | sliders, labels and figures — **this is a floor**, and it should be: a budget screen's text *is* its data. The one piece of prose was the inflation warning: a real state change (*prices have risen 44% since you last set this budget*) with the explanation wrapped around it. The state and the **Adjust for inflation** control stay; the sentence about what that costs you in buying power folds. |
| Overview | 898 | **767** (−15%) | six cards of *state* — where you stand, what is at risk, the economy — plus two notes. The "living inside your means" sentence folds; the open-stories note folds; the **112-character vignette stays** (*"Third Mainland Bridge, 6:40pm. Two podcasts, four kilometres, one profound reconsideration of your life choices."*) because that is the game's voice and the voice is the thing worth reading. |

### The bug these two phases found, which is worth more than the percentages

`foldHTML` was written in the **ui**. Then a **core** strip (`threadStrip`, the open
stories on Overview) used it — and the module build said so immediately:

> `foldHTML is not defined` — thrown from an integration test about saves crossing
> between a browser and a phone, which has nothing to do with folds.

The single-file build hid it completely: one scope, so a helper written in one
package is visible to the other. The modular build did not, and a test that looked
unrelated caught it. **The fix was not to duplicate the helper, it was to move it to
core**, beside `esc`, because both renderers write it and core's own strips need it —
the same reasoning that put `saveSlotRowHTML` and `parseSaveRaw` there in phase 1.
The declaration in `tools/declared-changes.mjs` records all of it, including why the
guard the audit now carries (`tools/textaudit.mjs` refusing to measure a stale build)
exists at all.

**Verified:** unit 42/42 · integration 23/23 · e2e 10/10 · **41/41 gates clean** ·
`react-screen`, `react-route` and `dedupe` clean · both worlds `NO CONTROL LOST` ·
`deploy:check` CLEAN · bundle **1,100,815 B · sha `311031999aa402e7`** · zip 356,890 B ·
declared changes **139 → 143**.

**Twelve phases in:**
- **median 584** characters in the way, from **855**;
- **one route over 1,200** — Legacy › People at 1,344, budgeted at 1,400 and explained
  in §9 — and the next worst is Settings at 992;
- **zero controls lost, zero sentences deleted**, across every phase.

---

## 17. Phase 13, done — Legacy › Chronicle

| | before | after |
|---|---|---|
| in the way — a mature run (ten years, 40 entries) | 3,966 | **823** (−79%) |
| in the way — early (a dozen quarters) | 684 | 693 (the tag adds 9) |
| budget | 1,500 | **823** |
| controls lost | — | **0** (0 before, 0 after) |

The heaviest route in the game, and the problem was never the length of an entry. It
was that **all forty were in the way at once, in one column, oldest first** — so a
player arriving at the end of a decade opened the log on 2026 and scrolled through
four years of history to find out what happened this quarter.

The log reads **newest first** now, the eight latest entries are the screen, and
everything older is grouped by the year in the entry's own date behind a fold that
says how much it holds — *"2027 · 14 entries"*. The entry markup is unchanged:
same date, same category, same colour. **That colour is why no outcome chip was
added**, which the plan had suggested: the left border already says whether an entry
was good, bad, a warning, macro news or a beginning, and a chip would have been text
where there is already colour.

**Note the early-world number barely moves (684 → 693).** That is not a failure, it is
the measurement: a dozen quarters produce about eight entries, which is exactly the
number the screen now shows unfolded. The chronicle was never heavy early. It was
heavy *at the end of a run* — and the end of a run is when a player most wants to
read it, which is why it is budgeted separately.

---

## 19. Phase 14, done — the shell (the chrome and the modals)

Thirteen phases had a number to move because `tools/textaudit.mjs` measures routes.
The shell had none — and a phase without a number is decoration. So the shell got
the same treatment as the routes: **`tools/shellaudit.mjs`**, measuring eight
surfaces the player meets *outside* a route, with the same rules (in the way / total
/ controls, machine text separated, closed folds and popovers not counted), a frozen
baseline in `tools/shell-baseline.json`, a `--check` that fails on a lost control,
and a staleness guard that refuses to report when `.harness/mod.js` is older than
`dist/index.html` — the trap the route audit fell into in phase 5.

| surface | where it is | before | after |
|---|---|---|---|
| Start another company | from Business | 1,633 | **565** (−65%) |
| Season | the season chip | 1,300 | **914** (−30%) |
| How this works (help) | the `?` in the bar | 1,142 | **1,147** (same length, now a table) |
| Settings | the gear | 576 | 576 |
| Profile | the save line | 521 | 521 |
| Negotiation | mid-deal, mid-hire | 262 | 262 |
| Board vote result | after a resolution | 204 | 204 |
| Run info | the date chip | 55 | 55 |
| **total** | | **5,693** | **4,244** (−26%) |

**Controls: 77 before, 77 after — none lost.** Folds: 7.

### The three that were heavy, and what was actually wrong

- **Start another company (1,633, 13 controls)** was heavy for the same reason
  Money › Property was: ten companies as bordered boxes, each carrying a paragraph,
  with an opening lecture above them. Name, price and Start lead; the ten sentences
  are one fold, in order; the lecture is a fold. Same ten Start buttons, same
  disabled reasons and shortfall arithmetic.
- **Season (1,300)** is a setup form — codes, a QR, a link, year and quarter
  pickers — wearing three explanatory notes. The form is untouched; the notes fold.
- **Help (1,142 → 1,147) is the one surface where this project's own rules point the
  other way.** Help is opened *deliberately*: the player wants to find the rule they
  are unsure about, and 1,142 characters of prose has no index. It is a **table**
  now — the rule on the left, what it means on the right, one row each — so the eye
  can run down the rules and stop where it needs to. It is not shorter. It is
  usable, and the number says so out loud rather than pretending a −1% is a win.

### What is *not* in the audit, and why

The **bell popover**, the **era popover** and the **per-screen `?` hint** are already
the vocabulary — a popover is a fold, the bell's badge can be zero, and the bell's
footer carries the count. They are chrome rather than a surface with a route, their
text is never in the way by construction, and the e2e layout gate holds their
budget (chrome ≤ 15% of a 390px viewport, no label over 42 characters, nothing under
11px). `governance/pack`'s internal tabs and the four sub-modals that only appear
mid-flow are the same: reachable, measured by their own gates, not in this table.

**The shell audit is now part of the suite** — `npm test` runs
`node tools/shellaudit.mjs --check` before the gates, so the shell is frozen the
same way the routes are.

---

## 18. Where the project got to

| | before the redesign | after 13 phases |
|---|---|---|
| median route, in the way | 855 / 949 (early / trading) | **584 / 571** |
| worst route | 2,566 (markets) | **1,344** (people, budgeted 1,400) |
| routes over 1,200 | 6 | **1** |
| total text written on the screens | 20,369 / 23,795 | **higher** — every phase moved words into folds rather than deleting them |
| controls | 108 | **108**, none lost, 6 deliberately relabelled |
| folds on the game's screens | 0 | **40-ish**, every one with a label a player can predict |

**The one remaining phase is the shell** — the top bar, the rail, the bell and the
modals — where the redesign's vocabulary has to feel like one game rather than ten
screens that each learned it. That is a different kind of work from these thirteen
(no route to measure; the header has a measured budget of ~14px of slack that §22.x
already recorded), and it is the piece that should not be rushed inside a phase
batch.

---

## 20. The end of the plan

Fourteen phases, every screen in the game and the shell around them. What the plan
promised, and what happened:

| promised | delivered |
|---|---|
| median route ≤ 500 in the way | **584** early / **571** trading, from 855 / 949 — not met, and §9 and §13 say exactly why for the two screens that hold it up |
| no route over 1,200 except the chronicle | **met**: one route over it, Legacy › People at 1,344, budgeted at 1,400 with its arithmetic shown |
| chronicle ≤ 1,500 | **823** in a mature run, from 3,966 |
| zero controls lost | **met**: 41 gates then (42 now — the portability gate, `FEATURES.md` §22.72) + both audits, 108 route controls and 77 shell controls, none lost, 6 relabelled and reported |
| every phase recorded with before/after | **met**: §6–§19, plus `FEATURES.md` §22.63–§22.72 |
| nothing deleted | **met**: total text is *higher* on every screen than before the redesign, because words moved into folds |

**What "not met" means here.** The median target assumed the redesign could get
every screen under 500 without deleting content. Two screens are data-dense rather
than wordy — Legacy › People (nine people's names, roles, ages, traits, scores and
three actions each) and Money › Budget (sliders and their figures) — and their floors
are around 1,300 and 800. The plan's own rule was that a phase unable to lower the
text without losing something should say so and stop. Both said so; the numbers are
in §9 and §16 rather than quietly rounded.

---

## 21. After the plan: the download

The plan ended, and the thing that came next was not a screen. It was packaging
the whole repository into one zip — and treating that zip as what it is: **the
first machine that is not this one.** Extracted into `/tmp` with no `.git`, no
`node_modules` and nothing generated, the build died at once, because `tools/`
had the author's home directory written into it and the phone gate demanded an
Android folder that is generated on purpose and therefore absent.

That is not a redesign finding, so it is recorded where it belongs —
`FEATURES.md` §22.72 — but it belongs in this file too, for one reason: it is the
redesign's method used on something that is not a screen. Take the claim
seriously enough to test it from outside, watch the check fail before trusting it,
and make the class of mistake impossible rather than the instance fixed. Gate 42
does exactly that, and the game itself did not change by a single byte
(1,104,445 B · `b5bc961f13a707d4`) because tools are not shipped to players.
