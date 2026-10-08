# The tests

Three layers, one command. They are not the same thing as the gates, and the
difference is worth knowing before adding to either.

| | what it is | how many | runs |
|---|---|---|---|
| **`tests/unit/`** | one function at a time. No DOM, no browser, no filesystem writes | 42 tests | `npm run test:unit` |
| **`tests/integration/`** | real modules together, and the build's own contracts: the payload, the zip, the faces | 23 tests | `npm run test:integration` |
| **`tests/e2e/`** | a player's journey in Chromium, on all three surfaces, plus the design measured at 390px and 1440px | 8 tests | `npm run test:e2e` |
| **`.harness/`** | 41 **gates** — see below | 41 | `npm run test:gates` |

`npm test` runs all four, in that order, after a build.

## Tests and gates are different jobs

A **test** says what the game claims and fails when the claim stops being true. A
**gate** exists to make one specific class of drift impossible — a statement in
the shipped file that is not in the original, a section edited in one place and
not mirrored, a table typed in one place and read in another. Gates print a
sentence a maintainer can act on and live in `.harness/`; they are the reason this
repository can be edited at all.

So: a new *claim* goes in `tests/`, a new *invariant* goes in `.harness/`. Both
run in CI, in separate jobs, so a failure says which kind of thing broke.

## What each layer covers

**`unit/`**

| file | what it pins down |
|---|---|
| `png.test.js` | the PNG reader the two app gates rely on — against pictures written by a second, independent implementation (`tests/helpers/png-writer.js`) |
| `bridge.test.js` | every string that crosses between the WebView and React Native: ten types, thirteen shapes of nonsense refused, and a body that must be an object or nothing |
| `host-mirror.test.js` | the native host: a save readable the instant it is written, the write-behind flush, a cold start, slot wiping, the mirror's bound, the seam's eleven slots, and a real run saved and loaded byte for byte |
| `boundary.test.js` | where the backend ends and the game begins: no request primitive in the UI, no DOM in core, one place where core touches the page, the four credential fields the form draws are the four the client reads back, no request at all until a player supplies their own project, and the API surface itself — one file, five endpoints, ten request sites, all of them documented in that file's header |

**`integration/`**

| file | what it pins down |
|---|---|
| `save-crosses.test.js` | a run crossing between the browser and the phone: the same blob, the same keys one prefix apart, four quarters across two runtimes equal to four quarters in one, and the modal that a save deliberately does not carry |
| `backend.test.js` | the schema in `deploy/supabase.sql` and the requests in core describe the same world: every column written exists, the `on_conflict` target is a real unique constraint, the leaderboard's `select=` names real columns, and no `service_role` key is anywhere |
| `payload.test.js` | the build's contracts: ten files in the zip, every copy of the game the same bytes, stamps that describe what they are stamped against, every face the mark, the launcher and splash sets complete, and the copier idempotent |

**`e2e/`**

| file | what it pins down |
|---|---|
| `player-journey.test.js` | open → begin → play a quarter → reload keeps it, on the zip, on the store build's payload, and from a `file://` URL the way an installed WebView loads it |
| `web-app.test.js` | the React app: the same journey, plus installability — manifest, worker, and a cold navigation with the network off |
| `layout-and-copy.test.js` | the design, measured: no sideways scroll at 390px or 1440px, chrome at most 15% of the screen, every control a fingertip, no type under 11px, no text spilling out of a box that cannot scroll, no label over 42 characters, no paragraph over 320 — on Overview and on all five tabs |

## Running one thing

```bash
npm run test:unit                             # seconds, no browser
npm run test:fast                             # unit + integration
node --test tests/unit/png.test.js             # a single file
node --test --test-name-pattern="mirror" tests/unit/host-mirror.test.js
cd .harness && node run.js single               # one gate, by substring
```

The e2e suite needs Chromium (`cd .harness && npx playwright install chromium`)
and builds the React app into `.next/gate`, reusing it when it is newer than every
source file. If `playwright` itself has gone missing, an earlier `npm install
--prefix tools` pruned it — install in the order the repository documents (root,
then `tools`, then `.harness`, then the browser) and it comes back. A failing layout or journey test writes the picture it failed on and
the console it captured to `tests/artifacts/` — which is gitignored, and empty on
a green run.

## The rules these tests follow

1. **A relationship, never a pixel count.** "The chrome takes at most 15% of the
   phone", not "the chrome is 87 pixels" — 87 was true until the type floor moved.
   Where a number is unavoidable it is a *measurement written down with the date
   it was taken* and the two things it is compared against, the way the face
   distances are (2.5–8.6 for the mark, 153.9 for the template's cross, and 30
   between them).
2. **A fixed seed.** `4242`, and `4242 + i` for a different world. A test that
   plays a run picks its seed; it never inherits one.
3. **A failure that names the thing.** Assertions carry the value, the name and
   what was expected — `the bridge accepted {"type":"save","body":123}` rather than
   `expected true, got false`.
4. **Fixture state that a player can be in.** The auto-save contract is the
   clearest example: `newGame()` writes a save through whatever host is installed,
   so a test that starts a second game must expect the first one's slot to be
   overwritten. Two tests were written the other way round first and taught the
   suite this.
