# Migrating LEDGER off the single file

Measured from `ledger/index.html` at 1,025,158 bytes / 16,002 lines.

## What is actually in there

| | lines | |
|---|---|---|
| CSS | 357 | hand-written, CSS custom properties |
| view / render functions | **2,593** (51 functions) | the UI |
| everything else | **7,602** (497 functions) | the simulation |
| data tables | 58 | pure data |
| non-view functions that touch the DOM | **14** | see below |

**97% of the code is already framework-free.** The 14 functions that need an
adapter are:

`toast` · `save` · `hasSave` · `load` · `wipe` · `loadProfile` · `saveProfile` ·
`cloudSyncBackground` · `startAdvanceAnim` · `applyDisclosure` ·
`buildStampInfo` · `copyText` · `bindInputs` · `doInstall`

That number decides the whole architecture.

## Recommendation

**Share the simulation. Do not try to share the UI.**

```
packages/core     483 pure functions + 58 data tables. No DOM, no React, no RN.
apps/web          Next.js
apps/mobile       Expo / React Native
```

Next.js and React Native share no UI primitives. Every "write once" layer —
react-native-web, Tamagui, Solito — buys that sharing by giving up web
affordances this app has started to use deliberately: hover popovers (now
correctly scoped behind `@media (hover:hover)`), `<input type="range">`, and
`grid-template-columns: repeat(auto-fit, minmax(...))` for the lever map.
You would be trading 2,593 lines of duplicated UI for fights on both
platforms. Not worth it. The simulation is the hard-won part, and it is
already pure.

### The one library that matters: Valtio

The app is a single mutable global `S` plus `render()` after every action.
Rewriting that into immutable React state means touching all 483 functions.
Valtio makes a mutable object reactive — `useSnapshot(S)` — so `S` and every
function that mutates it move across unchanged.

Cheaper still, and probably enough: `useSyncExternalStore` plus a version
counter bumped inside `render()`, about twenty lines with no dependency. Try
that first. Drop in Valtio if it gets awkward.

### Web: Next.js — on one condition

Next.js is fine, and you asked for it. **The condition is a single-file build
target.**

`next export` emits `_next/static/*.js`. That cannot be opened from `file://`
— ES modules are blocked by CORS on the `file:` origin, which is exactly the
error in your console. Your actual workflow (download, double-click, play with
the network off) would break. So: develop in Next, but also emit one
self-contained `index.html`. `step 0` below already does this, and it is what
the zip should keep containing.

There is no server here. Use `output: 'export'`. Next's value is structure,
conventions and tooling — not SSR.

### Mobile: Expo (React Native)

- Managed workflow, EAS Build, and **OTA updates** — for a game you are still
  rebalancing, shipping a JS update without an App Store review is worth more
  than anything else on this list.
- Supabase via `@supabase/supabase-js` with the AsyncStorage adapter.
- The 51 screens restyle with RN primitives. They are cards, key-value rows,
  bars and sliders. The five hover popovers become tap-to-open, which the CSS
  already handles correctly on touch.

### Consider before committing to RN: Capacitor

If the goal is "a real app on my phone", wrapping the web build in Capacitor
is roughly a tenth of the work: same UI, native shell, App Store, offline by
default. You lose native feel because it is a webview — but for a data-dense
game with no gestures and no animation, a webview is honestly fine. I would
ship Capacitor first and only build the RN app if you later want native
navigation, widgets, or store polish.

### Testing

26 of the 29 gates are pure simulation and already run in Node with no
browser. They move to `packages/core` unchanged. The three browser gates
(mobile layout, the partnership click-through, the build stamp) point at
whichever web target is running.

## Phased plan

### Step 0 — Extract. Done, and since superseded.

`index.html` is no longer the source; it is a build output. The first pass cut
it into `src/parts/NN-*.js` (45 parts) with `build.mjs` reassembling them and
SHA-comparing the result. That pass is what proved the extraction mechanical.

**It has since been replaced, and the step-0 artifacts are gone** (FEATURES.md
§22.24 accounts for each one before deletion). What exists now:

```
packages/core/src/01..31-*.js   the simulation, 34 sections, in run order
                                · 10a-cloud-api.js is every request the game makes
                                · 20a-profile-and-cloud-modal.js is the account screen
packages/ui/src/01..17-*.js     the screens and the DOM, 18 sections
packages/flat/                  the same sections, plain — kept in step by
                                `npm run mirror`, because the bootstrap would
                                otherwise revert anything not recorded there
packages/core/host.js           the hand-written seam
packages/ui/index.js            the hand-written entry; names no module file
packages/changes.json           every declared deviation, with full text
tools/rebuild.sh                THE command: modules, bundle, harness, zip
tools/apply-changes.mjs         replays changes.json onto a fresh cut
dist/index.html                 the artifact (also ledger/index.html)
```

`packages/*/src` is the source of truth; `reference/baseline-single-file.html`
is never written to and exists so every build can be measured against the file
the player had. The sections can be re-cut from it with
`node tools/split.mjs --bootstrap`, and **the declared changes replayed onto
the result with `node tools/apply-changes.mjs`** — which is the recovery path
if the sections are ever lost, and it has already been used once (§22.25).

One bug found doing it: `String.replace()` gives meaning to `$&`, `$'` and `` $` ``
inside the replacement string, and a 16,000-line script certainly contains
one. The first build differed by 653 characters and only the SHA caught it.
The build now uses function replacers.

### Step 1 — Adapters (a weekend)

Define a `Host` interface covering the 14 DOM functions. Web implements it
with the DOM; React Native implements it with native modules.

Gate: `packages/core` must not import `document`, `window` or `localStorage`
anywhere. That is a one-line grep in CI.

### Step 2 — Modules

Turn the 45 concatenated parts into real ES modules with explicit imports.
This is where the ten "mixed" parts get split, because they contain views
alongside simulation:

| part | lines | functions | views |
|---|---|---|---|
| `parts/08-part.js` | 273 | 20 | 2 |
| `parts/25-part.js` | 258 | 12 | 5 |
| `parts/26-part.js` | 1396 | 43 | 16 |
| `parts/28-part.js` | 296 | 15 | 1 |
| `parts/31-part.js` | 1079 | 31 | 14 |
| `parts/33-part.js` | 827 | 32 | 1 |
| `parts/34-part.js` | 1848 | 74 | 9 |
| `parts/37-part.js` | 208 | 3 | 1 |
| `parts/38-part.js` | 1400 | 5 | 1 |
| `parts/42-business-arcs.js` | 1058 | 8 | 1 |

8,643 lines, and the rest (6,967) is already clean.

### Step 3 — TypeScript

Rename `.js` to `.ts`, starting with the 58 data tables. They are pure data,
so the types pay for themselves immediately and catch typos in the field names
the simulation reads.

### Step 4 — Reactivity, then screens  ← SCREENS, SHELL AND PAGE DONE: 30 components converted; the app draws all 29 routes whole (arranging 13 of them itself), the header, the tab strip, the modal, and the page those four sit in

Screens are converting one name at a time behind `host.view(name)`. **Done:**
`viewMoneyBudget`, `viewMoneyPosition`, `viewMoneyProperty`, `viewRival`,
`viewLedgerChronicle`, `viewLevers`, `viewAgenda`, `viewInvestPortfolio`,
`viewPeople`, `viewGovernance`, `viewCommitments`, `viewWorkingCapital`,
`viewStaffDeep`, `viewContracts`, `viewOutlets`, `viewLegacy`,
`viewLedgerSettings`, `viewInvestMarkets`, `viewOverview`, `viewCareer`,
`viewCareerRecord`, `viewPulse`, `viewPressure`, `viewEngine`, `viewBiz`,
`viewDeals`, `viewGroup`, `viewHousehold`, `viewSeason`, `viewLife` — which is
every screen a route draws. What is left in the ui registry is thirteen panels,
none of them a route: four (`viewPack`, `viewRegister`, `viewPromises`,
`viewDeed`) embedded by the converted `viewGovernance`, and the tab-level screens
the consolidated routes replaced — `viewWork`, `viewMoney`, `viewInvest`,
`viewLedger`, `viewDash` — which the §22.18 inventory accounted for as dead.

**Under it all, the third renderer: the shell.** `apps/web/shell/` holds the
header, the tab strip with its second level and the screen hint, and the modal.
They are declared with `ui.setAppShell({ top, tabs, modal })` and drawn through
`ui.setShellDrawer(drawShell)` whenever the ui would have written that piece's
markup — so the single file, which declares nothing, keeps every one of them as
markup, line for line as before. `.harness/react-shell.js` compares the chrome and
15 modal types against the markup the game drew, state for state.

A converted screen renders with `renderToStaticMarkup`, so the host contract
stays synchronous, the router and the delegated `data-a` event model are
untouched, and a conversion is reverted by deleting one line from the map —
which is the entire point of doing them one at a time. `positionStrip()` shows
the general case: a converted screen may still embed an unconverted string from
core rather than reimplementing it.

A converted screen may be a container around unconverted panels, and then it
reaches them through one seam: the app hands the built-in renderer in at boot
(`setBuiltinRenderer((name, ...args) => ui.builtinScreen(name, ...args))`) and the
screen asks for `builtin('viewPack', b)`. It cannot import `@ledger/ui` (that is
the package that called it) and it must not call `screenFor` (that consults the
overrides, so it could call itself); `builtinScreen` reads the registry and
ignores every override — the panel as this app drew it before anything was
converted. `viewGovernance` is the worked example: one frame, eight built-in
panels, its side effects kept.

Each converted screen also stamps `data-react="<name>"` on its first element,
added centrally in `index.jsx`, so a check outside the game can ask the DOM which
renderer answered a route instead of trusting a console line that only lists
declared names. `.harness/browser-screens.cjs` does exactly that against the
running app at 390px, and it separates three claims rather than two: routes the app
draws whole (route stamp **and** screen wrappers), routes the game still arranges
whose screen is converted (screen marker, **no** route stamp), and routes with no
React screen at all (no marker anywhere). The last two lists are empty now — every
route is React — and they stay, because the distinction is what keeps the marker
honest and the walk prints both counts: it caught a listing mistake when
Governance › Pack and Register were filed as React routes while `react-route.js`
was proving the opposite about the same two routes.

`.harness/react-screen.js` compares both renderers on the same fixture and
asserts they offer the same controls, inputs, headings, numbers, **text**, CSS
classes and the `data-react` stamp that says which renderer answered — run for
every converted screen, in nine states, across both builds. Its `REACH` table
asserts that the fixture a screen is compared in actually draws the branch that
screen is interesting for; a fixture that reaches nothing fails rather than
passing quietly. Selects are compared too (target attribute, selected value, the
whole option list).

A screen inside a group with `open: 0` is not in the markup until its header is
tapped — the header is a switch that re-renders the route — so anything looking
for a converted screen in the DOM must open the group first.
`.harness/browser-screens.cjs` does exactly that, walks every converted route
and card in the running app at 390px, fires the real install-prompt event at the
Install button, and fails on any page error.

The game's composition lives in `tools/compose.mjs`; `tools/bundle.mjs` writes
the single file from it and reads both copies back to make sure what is on disk
is what was composed. `tools/declared-changes.mjs` reads the same composition,
so transcribing the declaration list no longer depends on the build having run
first.

A converted screen may embed a **converted** screen as a component
(`viewOverview` renders `ViewAgenda`); `builtin()` is only for panels that have
not been converted yet. Screens may also render from platform facts the app
hands in (`setPlatformFacts({ canInstall, canScan })`), which is how Settings
knows whether the browser can install the game.

The ledger in `tools/bundle.mjs` fails on a lost statement, on a new statement
nobody declared, and on a **declaration that has rotted** (a declared `now` that
is no longer in the bundle). `tools/declared-changes.mjs` re-transcribes the
declared list from the two files and runs as part of `tools/rebuild.sh`. It
fails a screen whose every fixture renders an empty page, because agreeing about
an empty screen proves nothing. Proven to fail on nine deliberate breaks
(FEATURES §22.26, §22.27), and it has caught two real bugs in the ports — the
second one being `esc()` double-escaping React children, which turns
`Delta & Co` into `Delta &amp; Co`, and the third being a separator space the
port made unconditional, which put a space before every clean company's name.

**Who draws the route (done).** A route whose every screen is converted is drawn
by the app as one React tree, so a change of state re-renders it in place rather
than replacing `#main`. The ui decides (`routeOwnership()`: every screen on the
route converted, no arguments to lose, and **nothing left for core to group**)
and the app draws, in a wrapper per screen that is `display:contents` — no box,
so the layout does not know it is there. `flushSync`, because the host contract
is synchronous. The app hands the container back when core needs it, and clears
its `data-react-route` claim when it does.

Grouping is now a component too (`apps/web/screens/group.jsx`). A converted
screen arranges its own sections with `<Group route="overview" i={2}>`, the spec
still comes from `ROUTE_GROUPS`, and the app declares the routes it groups itself
(`setAppGroups`) — which is what lets `routeOwnership()` stop refusing a grouped
route. **Thirteen routes arrange their own sections** — overview, money/position,
money/markets, money/deals, money/group, governance/pack, governance/register,
work/career, work/life, legacy/people, legacy/ambition, legacy/settings, and
Work › Business (assembled rather than grouped: its shape is not a list of
screens) —
each compared with the game's own rendering card for card, header for header, in
two fixtures. Three behaviours of core's matcher have to be reproduced rather
than guessed, and all three are documented where the port does it: a group is
emitted at the level of its first member (so a card the spec names can sit
outside its own section); a card no group names stays where it was, between the
sections; and **a section belongs to one route** — the same screens are on Money
and on Money › Markets, and only the sub-tab is grouped, so `Group` asks
`routeKey()` and renders unwrapped anywhere else. The layout is the spec's too
(`layout:'g2'`), and the member count is the members *found*, not the children a
port happened to pass.

**Not every route is a list of screens (done).** `Work › Business` — the largest
route in the game — puts cards from two different panels into one section and has
the router emit `portfolioBar()` between them, which is not a screen the host is
ever asked for. A route drawn as a list of screens therefore loses the company
switcher outright. So the app declares such a route and assembles it:

```js
export const composedRoutes = Object.keys(ROUTES);  // 'work' and 'work/business'
ui.setAppRoutes(composedRoutes);                    // routeOwnership() honours it
```

`routeOwnership()` answers with the route's own name, the drawer renders one
component, and `.harness/react-route.js` compares it against the game's own
screens *and* core's own grouping on the same fixture. The comparison now covers
**every route React draws** — 29 routes × 2 states = 58 comparisons — rather than
only the grouped ones, which is what found three live defects the narrower check
could not see (a missing company switcher on the bare Work tab, sections drawn on
a route core does not group, and a section header counting its React children).

**The page is done (done).** With the three pieces of chrome and the route the
app's, there is nothing left for the ui's loop to write, and the app composes it
instead: `ui.setPageDrawer(drawPage)`, offered `{main, top, tabs, subs, why,
modal}` and drawing all four in the order a component tree can express. `render()`
asks **once** (`appDrawsPage()`), and if the answer is yes it writes no markup at
all — it does the page-level work underneath, which is about the page rather than
about who filled it in: the input bindings, the disclosure chrome, the scroll and
the focus. The claim is the **intersection** of the pieces (`pageOwnership()`: all
three chrome pieces AND the route, or nothing), so an app that has not converted
the modal cannot claim the page and silently drop it, and a page drawer that
refuses is a *correct* answer: the markup path then draws the page piece by piece,
the same three shell pieces plus the route as markup, which is exactly the
behaviour that existed before any of this. The app stamps `<body data-react-page>`
while it owns the page, and its release removes the stamp with the roots.

What that leaves, in order:

1. **`render()` itself — done.** The page-level work (bindings, disclosure,
   scroll, focus) runs whether or not an app drew the page, and the string path
   the single file runs is now two named functions (`renderChrome`,
   `renderMarkupPage`) called from the same two places, with the same statements
   in the same order. And the claim that path carries is no longer a sentence in
   a document: **`single.js` (gate 38)** serves `ledger/` as it ships, boots it
   in Chromium with no app on the page, presses Begin, starts a company, walks
   the same 23 route entries `browser-screens.cjs` walks — as markup, with a card
   on each — and then holds it to the page-level work: the route, the disclosure,
   the focused row and its value, the scroll, a quarter advance, the modal, and a
   reload that brings the game back from its own storage. The two walks now read
   one route list (`.harness/routes.js`), because two lists that drift are two
   gates covering different games.
2. **The panels that are not routes stay as they are**: `viewPack`,
   `viewRegister`, `viewPromises` and `viewDeed` are embedded by the converted
   `viewGovernance` through `builtin()`; `viewWork`, `viewMoney`, `viewInvest`,
   `viewLedger` and `viewDash` are the tab-level screens the consolidated routes
   replaced and are dead by the §22.18 inventory.

**Step 4 is finished.** 30 components, 29 of 29 routes drawn by React, the shell,
the modal and the page owned by the app in the module build, and the markup path
still whole — now with a browser gate of its own.

**And it ships.** The app was deployable and not *installable*: no `public/`, no
manifest link, and a service worker that registered on no deploy because its
registration waited for a `load` event that had already fired, and then because
`pageProtocol()` asked a host slot that defaults to `''` — a host saying nothing
was switching a feature off. Gate 39 (`appshell`) builds and starts the app
itself, asks it for its manifest, icons, apple-touch-icon and worker, watches the
worker register and activate, turns the network **off** and opens the app again.
The deploy kit is in place: `Dockerfile` (the app, two stages), `Dockerfile.static`
(the single file on nginx, with `deploy/nginx.conf`), `vercel.json`, a GitHub
Actions workflow that runs all 39 gates, and a README that says how to ship both
deliverables and that Supabase is optional and configured by the *player*, not by
env vars. Both the zip and the app now carry PNG icons at the sizes an iOS home
screen and an Android splash actually want.

### Step 5 — React Native

Only after `packages/core` is framework-free, tested, and shipping on web.

**The data tables are TypeScript, and the transcript did not move (done).** 57
tables / 332 kB of literals now live in `packages/core/tables/*.ts` as typed source
(interface + the literal, byte for byte as it was), the sections carry a one-line
directive where each literal was, and `tools/compose.mjs` + `tools/makecore.mjs`
splice them back at build time — so the single file stays one file and the statement
ledger keeps comparing token for token (`tools/tables.mjs --verify` proves every
spliced table against the baseline before every build). `packages/core/tsconfig.json`
checks `core.js` and the tables with **no DOM lib**, and `.harness/types.js` (the
37th gate) fails on a single error. Two live bugs fell out of it — the hiring
message that printed "undefined", and invite links that never carried the address
in the app build. The consumer annotations are the next increment: a table *field*
read by name from a `.js` file is not checked yet, and this step says so.

**The tables are read through the checker now, and so is the app (done).** The
splicer emits the table's own type onto the statement it composes
(`/** @type {BIZShape[]} */ const BIZ = [ … ]`) — a comment, and the whole
difference between a typed table and a checked one, because TypeScript will not
report an unknown property on an object literal type it inferred in a `.js` file.
That immediately made a union of shapes merge into one shape with optional fields
(a list whose `eff` objects differ was typing as a union, so `eff.happy` — a line
the game has run for a year — was an error), and found `R.weightedN`, a dead
first line of `buildCast()` that named a member the generator table does not have.

`apps/web/tsconfig.json` checks the app against the real core module and against
`packages/ui/index.d.ts` — the ui's public surface, written down because
`export * from './registry.js'` forwards almost none of its four hundred names.
Four live bugs came out of that: `ui.seasonCanScan()` was never exported (Scan on
a phone would have thrown), the service worker never registered in the app
(`location.protocol` reads the host shim there, so the offline half was silently
off), a duplicate declaration that would have been a SyntaxError at load, and
seven names The declaration file claimed the module exported and did not. The
gate checks both directions, so the surface cannot rot into a wish list.

**The ui is checked too (done).** The ui's own sections were the last region out
of the programme, on purpose: pointing a checker at them meant resolving the 615
names they borrow from core. With the ui's tsconfig consuming `@ledger/core` by
name — the same way the app does — that reservation is gone, and the first run
found 78 things. All of them were the same complaint (the ui reads the DOM
through names that say what the code means and not what the type is), none was a
bug, and all of them were rooms where a bug could stand. Typed at the source: a
`Q(id)` that returns `HTMLElement | null`, one `inputValue(id)` helper replacing
six `(Q('x')||{}).value` reads, the season status and `_sea` carrying their
shapes, the toast handle moved off the element. Two real defects fell out — the
`location` name collision a third time (the host shim, asked for `.protocol`),
and a generated `host-shims.js` importing a host file that does not exist, which
the *ui* would have hit the day anything imported its shim.

The gate now has **three legs and one command**: the simulation with no DOM lib,
the app against the real core module and the declared ui surface, and the ui
with a DOM against the same core module. All three at 0 errors.

**The precondition is met and checked (done).** `.harness/headless.js` is the
36th gate, and it is the only one that runs with **no DOM in the process**: it
imports `packages/core` directly, replaces `document`, `window`, `localStorage`,
`fetch` and seven more with getters that throw, plays four worlds to their end,
and asserts the module exports exactly the 615 names `exports.json` declares and
that a save is plain JSON that round-trips unchanged. Proved to fail on three
deliberate breaks — a `document` read inside `advanceQuarter()`, an unseeded RNG
and one extra export — each reverted.

**Step 5, as built (done).** The advice in this step was to ship the shell first
and take the native host when there is a reason to. Both halves exist now, and
each is checked by a gate that can fail.

**The shell (`apps/phone`, Capacitor — the path to a store).** The React Native
question above was "does the simulation still run without a browser"; this one is
"does the game a player installs carry the game the zip ships". `tools/mobile.mjs`
copies all ten files of `ledger/` into `apps/phone/www/` at build time, byte for
byte, stamps `build.json` with the source, the count, the size and the hash, and
deletes anything that is no longer part of the game. The `.harness/phone.js` gate
compares the synced copy to the build, checks the icon set is real PNGs at the
sizes they claim, checks the config describes an app (reverse-domain id, dark
splash and status bar, no remote URL — a shell pointing at a server is a browser
with an icon), and, where a platform folder is present, checks the copy inside the
Android project, the launcher activity, and that every configured plugin's Gradle
project is really wired in. It also fails on a dependency that is declared and
never used: `@capacitor/app` and `@capacitor/share` were installed in the first
scaffold and nothing in a payload that must stay byte-identical could call them,
so they are gone and the gate keeps them gone. What the gate cannot do is build an
APK — there is no Android SDK here — and it says so rather than pretending.

**The native host (`apps/mobile`, Expo + React Native — the path to native
navigation and widgets).** Expo managed, EAS Build, OTA updates, Supabase through
the same AsyncStorage adapter the local-first store already uses. RN draws
nothing: the WebView carries the same single file, and the host answers the seam
so `packages/core` can run for native features. `apps/mobile/src/host.js` is
written around an **injected core** — `createRnHost({core, store, toast, url,
canScan, fetch, cloudSync})` — because the save runs mid-simulation and the game
reads back what it just wrote. A device file system is not synchronous, so the
host keeps a 12 MB in-memory mirror of the save keys and flushes 250 ms behind
the write, hydrating before install and flushing on teardown; the keys are the
browser's (`ledger.save.auto`), and the blob is the browser's format
(`{S, rs, ui:{tab}}`), so a run crosses from one to the other unchanged.

**`.harness/rn.js` (the 40th gate) proves it.** It runs in a process with no
`document`, no `window` and no `localStorage` — the gate asserts that about
itself, which is the whole `rn_verify = core_only` claim — and then: all 11 slots
of the seam answered by the shipped host file; a world played eight quarters on a
phone host (seed 4242, decisions answered, a save 10,867 chars long, a device
holding two keys); a cold start that hydrates and reloads to the same state hash;
determinism (same seed twice → the same net worth); the bridge accepting ten
message types and rejecting thirteen malformed ones in both directions; and the
save **crossing runtimes** — written on the phone, booted in a real browser child
process through `ui.boot()`, a quarter played there, saved, loaded back on the
phone, and the state hashes compared.

That last check is what found the bug this step was worth. The two runtimes
disagreed after one quarter, with net worth identical on both sides — so not an
economy difference. Diffing the two states field by field left exactly one line:
`cd.network_event` — the cooldown table an event writes when it fires — set on
the browser and unset on the phone. The cause was not the host, the mirror, or
the flush: **the save does not carry the open modal**, so a save written with a
decision on the table reloads with nothing on the table. The browser child had
forked from the phone's save with the quarter's event already fired and waiting;
the phone, having loaded through the host, had cleared it. The fix was in the
gate, and the honest version of what it should do: a quarter is played the way a
player plays it — advance, then answer whatever the quarter puts on the table
(first option, both sides, `resolveOption` + `afterThreadChoice`, both of them
core's own functions, so the choice goes through the same code a tap does) — and
the fork itself is asserted clean (`booting from a save opened a X — the save is a
fork point, so nothing should be pending on the other side of it`). Two quarters
each side, same state hashes on both.

The behaviour it exposed is the file's, not the shell's, and it is worth saying
out loud: **a reload loses a decision that was already on the table.** The event
has fired (its cooldown is recorded) and its effect never applies, so the quarter
is played out with an unanswered prompt the player never sees again. It does not
move net worth — the two runtimes stayed equal in money throughout — which is
exactly why it survived a year of testing. Recorded as open, not silently fixed:
carrying it would change the save format, and that is a decision, not a cleanup.

**What is still open in this step:** the divergence above (a save that can carry a
pending decision), and the two shell affordances that need a payload hook before
they can exist — a native share sheet and an in-app back button. Both are stated
in `apps/phone/README.md` rather than half-wired, and neither is a dependency
until something calls it.

## If the sections are ever lost

`packages/changes.json` holds the full text of every declared deviation, both
`was` and `now`, which makes it a patch series rather than a summary:

```
node tools/split.mjs --bootstrap     # re-cut the sections from the reference
node tools/apply-changes.mjs         # replay every declared change onto them
bash tools/rebuild.sh                # rebuild, and check the ledger
```

`tools/apply-changes.mjs` asserts afterwards that every declared `now`
statement is present exactly once, so a partial replay cannot pass quietly.
Use it rather than recovering from memory, and run `split.mjs` **only from the
workspace root** — it writes to a constant path, not to the current directory,
and a bootstrap run from a copy of the workspace rewrites the original.

## Running this in a fresh sandbox

The workspace persists; the toolchain does not. `node_modules` is on the
snapshot's excluded list, and anything installed outside `/home/user` is gone at
the start of the next session - so a fresh session needs:

```bash
npm install                                            # root (workspaces)
(cd tools && npm install)                              # acorn + typescript: the transcriber and the typecheck
(cd .harness && npm install)                           # jsdom, esbuild, react, playwright
                                                       # (the typecheck needs tools/, not .harness/)
(cd .harness && npx playwright install chromium)       # the browser binary
sudo apt-get install -y libnspr4 libnss3 libasound2t64 libatk1.0-0t64 \
  libatk-bridge2.0-0t64 libcups2t64 libdrm2 libgbm1 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2      # what chromium links against
```

Without the last two, `mobile`, `partner`, `inventory` and the browser walk fail
with `exitCode=127` / `libnspr4.so: cannot open shared object file`, which reads
like a broken gate and is a broken container. `npm install` inside `.harness/`
also removes the browser binary when it was not installed by that same install
run, so install the browser *after* the packages, not before.

**`npm run mirror` keeps `packages/flat` in step with the sections.** That
directory is the bootstrap's record of what the converter was handed; an edit
that is not mirrored there is an edit the next `split.mjs --bootstrap` would
revert, and the `modules` gate fails when it finds one. It is one command now
(§22.60) because it was a hand ritual, and the hand forgot five files.

**`npm run setup` does all four steps in that order** — root, `tools`, `.harness`,
then the browser. It exists because the order is not obvious and getting it wrong
looks like a broken repository. **The three installs have an order, because npm
treats this tree as one project.** Running `npm install` in `tools/` after `.harness/` moves the
transcriber's dependencies into `tools/node_modules` and prunes
`.harness/node_modules` as misplaced — after which `playwright` is "not
installed", the face painter skips, and the browser gates cannot start. It is not
a broken repository and nothing is lost: re-run the installs **in the order above**
(root, `tools`, `.harness`, then the browser) and everything is back. Install the
layer you want last, or install all three in order.

Then: `bash tools/rebuild.sh` · `(cd .harness && npm test)` · start the app with
`npm run dev --workspace @ledger/web` (0.0.0.0:3007) before the browser walk,
which drives `http://127.0.0.1:3007/`.

## Risks

- **`S` is one deep mutable object and saves are `JSON.stringify(S)`.** Any
  class instance breaks every existing save. Keep the data plain, and make it
  a lint rule rather than a convention.
- **The gates scrape `check.js` out of `index.html`.** Repoint them at
  `packages/core` **before** step 2, or the suite stays green against a file
  that is no longer the source. This exact mistake has cost me three
  green-but-lying gates this session.
- **Do not run steps 2 to 4 together.** Step 0 is done and provably safe.
  Step 1 is a weekend. Step 4 is weeks.

## My actual advice

If this is one developer: do step 0 (done) and step 1 now. They are
low-risk and they are what makes the question "React Native or Capacitor?"
answerable later with real numbers.

**Do not start the React rewrite until the game's design stops moving.** Every
mechanic you change while porting gets paid for twice — once in the old UI and
once in the new one. The single file is a genuine feature, not just a
compromise: it runs offline from a USB stick and has no toolchain to rot.
