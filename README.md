# LEDGER — a life in decisions

A single-player business and life simulation. You start with a name, a city and a
stake; every quarter asks you to commit something you cannot take back, and the
decisions compound for thirty years.

**One simulation. Two apps. One HTML file.** The game logic is a package with no
DOM and no framework in it (`packages/core`), the Chrome-less drawing lives in
another (`packages/ui`), and there are two ways to run the result:

| | what it is | how you ship it |
|---|---|---|
| **the single file** | `ledger/index.html` (built from `dist/`) — 1.2 MB, self-contained, **zero external requests**, offline-capable | unzip `ledger-app.zip` anywhere, or `Dockerfile.static` |
| **the web app** | `apps/web` — Next.js 15 + React 19; the shell, the modal, the page and all 29 routes drawn as React components | Vercel, or `Dockerfile` |

They are the same game: the app imports the same core module and draws the same
screens. Every route in the app is a React tree; the single file draws the same
routes as markup.

---

## Play it in ten seconds

```bash
unzip ledger-app.zip -d ledger && open ledger/index.html
```

That is the whole install. The file needs no server, no network and no build
step; open it off a flash drive and it plays. Install it to a home screen (needs
https or localhost) and it works offline afterwards, because it caches itself.

## Run the app

```bash
npm install
npm run web                 # http://0.0.0.0:3007
```

## Build and test everything

There are five layers, and one command runs them all:

```bash
npm test                    # build, then unit -> integration -> e2e -> gates (~6 min)
npm run test:unit           # one function at a time - seconds, no browser
npm run test:fast           # unit + integration
npm run test:e2e            # a real browser: three surfaces, and the design at 390px
npm run test:shell          # the shell audit: 8 modal surfaces, no control lost
npm run test:gates          # the 42 invariants that make drift impossible
```

**Tests state what the game claims. Gates make a class of mistake impossible.**
That is the difference in one line; `tests/README.md` has the rest - what each
layer covers, why the e2e suite builds the app once and reuses it, and the four
rules these tests follow (a relationship rather than a pixel count, a fixed seed,
a failure that names the thing, and fixtures a player can actually be in).


```bash
npm run build               # compose the single file + the zip (tools/rebuild.sh)
npm test                    # build, then unit -> integration -> e2e -> gates
```

`npm run build` is not a bundler: the single file is **assembled** from the
packages, statement by statement, and every build proves it (see *Why the gates
exist* below).

---

## Deploying

Three deliverables, three paths, and a check that runs before any of them: see
**[DEPLOY.md](DEPLOY.md)**. The short version — `npm run deploy:check`, then
`npm test`, then either drag `ledger/` at a static host, or import the repo into
Vercel / build `Dockerfile` for the app, or `npm run sync --workspace @ledger/phone`
for the store build. The details below are the same story in longer form.

### The single file

Anything that serves static files will do; it is one HTML file and five
companions (manifest, worker, three icons).

```bash
docker build -f Dockerfile.static -t ledger-static .
docker run --rm -p 8080:80 ledger-static
```

Or drop `ledger/` on S3 / Netlify / Cloudflare Pages / GitHub Pages / a folder
behind nginx — the config in `deploy/nginx.conf` is the whole requirement
(correct MIME types, and no caching of `sw.js`). **Installability and offline
need https**: browsers only hand a service worker to a secure origin, so a bare
`http://` host serves the game fine and installs nothing.

### The React app

**Vercel:** import the repo. `vercel.json` at the root already sets the install
command, the build command (`npm --workspace apps/web run build`) and the output
directory; the app builds clean (`next build` → static `/`, 104 kB First Load JS,
types checked).

**Docker:**

```bash
docker build -t ledger-app .
docker run --rm -p 3007:3007 ledger-app
```

The app ships its own `manifest.webmanifest`, PNG icons (192, 512, maskable,
apple-touch-icon) and a `sw.js` that precaches the shell, serves navigations
network-first with a cached fallback, and treats `/_next/static/*` as immutable —
Next's chunk names are content hashes, so a hand-written precache list would be a
list that expires on every deploy.

### On a phone

There are two answers here and they are not the same answer.

**The store build** (`apps/phone`) is Capacitor around the file this repo
already ships: an icon, a splash screen, a status bar, and a listing in the App
Store and Play Store, with no second implementation of the game to keep in step.
`tools/mobile.mjs` fills `www/` from `ledger/` on every build and refuses to pass
if a byte differs, so the app on a phone and the file in the zip are the same
game. It installs nothing new at the root — the shell's dependencies live in
`apps/phone/`.

```bash
npm run build                     # writes ledger/, dist/, the zip — and www/
npm run sync --workspace @ledger/phone      # npx cap sync: copies www/ into the native projects
npm run assets --workspace @ledger/phone    # draws every icon and splash from ledger/icon.svg
npm run open:android --workspace @ledger/phone
```

Every icon and splash is drawn from the game's own `icon.svg`: a store build
carrying the template's blue cross is a store build with somebody else's face on
it, so the `phone` gate compares the pictures — pixel by pixel, decoded — and not
their filenames.

`android/` and `ios/` are generated, gitignored, and need the SDK to build — no
Android SDK lives in this sandbox, so the `phone` gate checks everything up to the
point where the SDK takes over (the synced payload, the icons, the config, the
launcher activity, the wired plugin projects) and says so rather than pretending
to produce an APK.

**The native host** (`apps/mobile`) is the other direction: React Native with the
simulation running *in* the app, for the day native navigation, widgets, a store
listing with its polish, or background sync are wanted. Expo managed workflow,
EAS Build for the binaries, OTA updates for the JSON. The WebView still draws —
React Native's job is to answer the seam — and `packages/core` runs on a phone
with no DOM at all: `.harness/rn.js` proves it in a process that has no
`document`, no `window` and no `localStorage`, by playing eight quarters through
the shipped host file, killing and restarting it, and passing a save between the
browser and the phone until both runtimes agree, quarter by quarter.

```bash
npm run mobile                    # expo start, from apps/mobile
```

Ship Capacitor first. Take React Native when there is a native feature to pay for
it.

### The backend (optional — the game works without one)

**There is a backend, and deploying the game does not need it.** It is three
tables in a *player's own* Supabase project: `deploy/supabase.sql` is the file
they run, generated from the client's own schema constant so the two cannot
drift. A player pastes their project URL, anon key, email and password into
Settings; the game then syncs their record across devices, publishes seasons and
shows a leaderboard. No network, no account, no backend: the game plays fully.


There is **no server to deploy**. A run lives in `localStorage`; the single file
has no backend at all.

What exists is bring-your-own-Supabase for **seasons**: open **Settings › Cloud**
in the game, paste your project URL and anon key (they are stored on the device,
not in this repo), and the screen prints the exact `create table profiles …`
SQL — including the `user_id uuid references auth.users` row-level-security
policy — for you to run in the Supabase SQL editor. Sync is local-first: the game
plays offline and merges when the network is there. There are **no environment
variables** in this repository because none are read; the configuration is a
player's, entered in Settings.

---

## Your home, behind every screen

The game shows the life you are living. Behind every screen is your home, drawn
from the run: a room in a face-me-I-face-you, then a flat, a house in an estate,
a mansion — by what you spend on housing against what housing costs a single
person in your city. The generator, the solar panels and the cars are the goods
you bought; your spouse, your children and your household staff stand in the
compound; the windows are lit by the grid, or by your generator (smoke and
all), or not at all ("NEPA has taken light"); the air is the quarter's season,
harmattan in Q1 and the rains in Q2 and Q3; a boom puts cranes on the skyline.
Nothing in it is random, and nothing in it is a control: the HUD sits over it,
the moves on the screen run along its foot as tiles, and the page is a sheet
that slides up over it.

| piece | where | what it does |
|---|---|---|
| what your home looks like | `packages/core/src/33-your-home.js` | `homeLook()` reads the run; `homeSceneSVG(look, vh)` draws it as layered SVG, `vh` tall so a tall phone shows more sky rather than cropping the house. No DOM, no random draw |
| the scene's markup | `packages/core/src/32-the-world.js` | `worldHTML()` puts the scene under the HUD (`worldHUD()`); the pictures every screen uses — icons, rings, gauges, bars — live here too |
| where it is placed | `packages/ui/src/18-world.js` | `worldSync()` runs after every render in both renderers and on the start screen, writes `#scene` (its own container — no renderer touches it), measures the view, and places the HUD and the move tiles in the band the player can see |

What is drawn next, and why, is in **[VISUAL.md](VISUAL.md)**: the brief every
picture is checked against, and the roadmap — your work, the quarter as
pictures, every event as a moment, consequences arriving at your gate.

## What is in here

The download (`ledger-workspace.zip`) is this whole repository — source, tests,
tools, docs and the playable file — with no caches and nothing generated in it.
`ledger-app.zip` sits inside it for the fast path: that one is just the game.

```
packages/core/        the simulation: 615 exports, no DOM, no framework
  src/                50 sections, the source the single file is assembled from
  tables/             57 data tables as typed TypeScript (232 kB of literals)
  core.js             the composed module — generated, never hand-edited
  host.js             the host seam: 11 slots the outside world answers
  tsconfig.json       type-checks with lib ["es2022"] — no DOM in the programme
packages/ui/          the drawing, in sections + a seam for apps
  src/                29 sections: screens, the modal, the shell, the render loop
  index.js            the app seam: setAppShell, setPageDrawer, overrideScreens…
  index.d.ts          the 18-name public surface (checked against real exports)
packages/flat/        the same sections as plain files, for the bootstrap path
apps/web/             Next.js + React 19: the shell React draws, and 30 components
  app/                boot, layout, globals
  screens/            the converted screens (jsx) and their props contracts
  shell/              top bar, tab strip, modal, page
  public/             manifest, service worker, icons
tests/               unit, integration and e2e — what the game claims
.harness/             42 gates — the invariants, and why they exist
tools/                the transcriber: extract, splice, verify, rebuild
deploy/               nginx.conf for the static deploy, supabase.sql for the backend
ledger/               what the zip contains: index.html + manifest + sw + icons
apps/phone/           the store build: Capacitor around that same file (www/)
apps/mobile/          the native host: Expo + React Native, core in the app
                      (the WebView draws; the host answers the seam)
dist/index.html       the single file
ledger-app.zip        the deliverable
```

## Why the gates exist

The single file is not a build artifact in the usual sense — it is *the product*,
and it is composed out of the packages, so the failure this project has to avoid
is drift: the source says one thing, the shipped file another, and nothing
notices. That is what the 42 gates are for. The ones worth knowing:

| gate | what it refuses to let happen |
|---|---|
| `ledger` | a statement in the shipped file that is not in the original, or a change nobody declared |
| `modules` | a section edited in one place and not mirrored into `packages/flat` |
| `types` | three legs at once: core with no DOM, the app against it, the ui with a DOM — 0 errors, and all 57 tables typed where they are spliced into the shipped file |
| `headless` | the simulation needing a browser to run at all |
| `react-screen`, `react-route`, `react-shell` | a screen, a route or a piece of chrome that claims to be React and is not (or the reverse) |
| `mobile` | anything unattended at 390 px, a control under 30 px, pinned chrome over 90 px |
| `single` | the file a player downloads failing to boot on its own: 23 route entries drawn as markup, no app on the page, disclosure/focus/scroll surviving a redraw, a quarter advanced, a reload restored — 0 console errors |
| `appshell` | the **app** missing its own resources: manifest, icons, worker, a registered service worker, and a cold start with the network off |
| `rn` | the simulation needing a browser to run on a **phone**: it runs in a process with no `document`, no `window` and no `localStorage`, plays eight quarters through the shipped native host, kills and restarts it, and passes a save between the browser and the phone until both runtimes agree quarter by quarter |
| `phone` | the **store build** shipping a different game from the zip: the synced payload byte for byte, real PNG icons, a store id, a dark splash, no remote URL, and every declared plugin wired into the native project — or a dependency that does nothing |

Four of the gates run a real browser (`mobile`, `single`, `appshell`, and the
`rn` gate's browser child process), as do the e2e tests, which is why
`npm test` needs chromium: `cd .harness && npx playwright install chromium`.

## Continuous integration

`.github/workflows/tests.yml` runs five jobs on every push, split so a failure
names the layer: **build** (composes the file and uploads the artifacts),
**unit** (on Node 20 and 22 — the cheap place for a language-level surprise),
**integration**, **e2e** (Chromium, with the failure screenshots uploaded), and
**gates**. A sixth job prints the five results on one screen. The browser binary
is cached between runs, keyed on the lockfile.

## Fresh checkout

```bash
npm run setup                          # deps + playwright chromium (the four steps below)
sudo apt-get install -y zip            # the build writes ledger-app.zip
npm test
```

`npm run setup` is exactly:

```bash
npm install
npm install --prefix tools
npm install --prefix .harness
(cd .harness && npx playwright install chromium)
```

Nothing generated is in the download: `dist/`, `.harness/check.js` and
`.harness/mod.js` are rebuilt by `npm run build` (which `npm test` runs first),
and the rebuild is byte-identical, so a fresh checkout produces the same
`ledger/index.html` we last verified.

On macOS 13 the current Playwright no longer downloads chromium. Point the
browser gates, the e2e tests and the tools at any chromium you have with
`LEDGER_CHROMIUM=/path/to/Chromium`; unset, they launch Playwright's own.

On a slim Linux container chromium also needs its shared libraries
(`libnspr4 libnss3 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64
libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2`);
without them the browser gates exit 127 and read like broken tests.

## Read next

- **`FEATURES.md`** — every feature, every fix, what was removed and what
  superseded it. Anything deleted is accounted for here first.
- **`MIGRATION.md`** — how the single file became a project: the phases, what is
  done, and what is left (React Native is the last thing on the list).
- **`FINDINGS.md`** — the whole competitive and UX read in one file: Lagos Life
  (a browser life sim that launched in the same city) and PH Lifestyle, both played
  logged in, what works in their screens and journeys, our journey measured, what
  has shipped, the ranked fix list, and what not to take. Captures are in
  `evidence/session-2026-10-08/`.
- **`playtest/PROTOCOL.md`** — the yardstick for measuring their game the way ours
  is measured: five groups of fields with units, three fixed sittings, an event log.
  `node tools/playtest.mjs --compare playtest/seat-lagos-life.csv` prints both columns.
- **`CONTENT.md`** — the book of the game, generated by `npm run content`: every
  event, arc, career, business, deal, covenant, resolution and lever, the 21 steps
  of a quarter, and every control on every screen. Counts come out of the module,
  so the book cannot drift from the game.

## Licence

Private. Not for redistribution.
