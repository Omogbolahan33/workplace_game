# Deploying LEDGER

Three things can be deployed, and they are the same game. Pick by what you want,
not by what is hardest to set up.

| you want | deploy | time | what a player gets |
|---|---|---|---|
| a link somebody can play in ten seconds | **the single file** | ~2 minutes | one page, offline after first load, installable on https |
| an installable app with a proper URL | **the React app** | ~5 minutes | the same game in a Next.js shell, PWA-installable, offline |
| an app in the App Store / Play Store | **the phone build** | an afternoon, mostly signing | the same file in a native shell with an icon and a splash |
| cloud saves + season leaderboards | **the backend** (optional) | ~2 minutes, no code | a record that follows them between devices, and scoreboards |

**None of the four needs the next one.** The game is local-first: it plays
completely offline on all three builds with no backend, and the backend is a
player's own — not something the person deploying the game has to run.

```
npm run deploy:check      # before anything: every input the three paths need
npm test                  # and the thing that says the build is good
```

`deploy:check` asserts what a deploy would otherwise fail on: that every `COPY`
source in both Dockerfiles exists, that `vercel.json` describes this workspace,
that the payload is ten files, that the Android project holds the same game as
the zip, and that the app reads no configuration. It is not a build — there is no
Docker in this repository's dev container — it is the first failure of each build,
removed.

---

## 1. The single file (fastest, and the real deliverable)

`ledger/` is the whole product: `index.html` plus a manifest, a service worker and
three icons. Any static host serves it.

```bash
npm run build          # writes ledger/ and ledger-app.zip
```

Then pick one:

| host | what to do |
|---|---|
| Docker | `npm run deploy:static` — `Dockerfile.static` and `deploy/nginx.conf` on :8080 |
| Netlify / Cloudflare Pages | drag `ledger/` into the dashboard; no build command, no environment |
| GitHub Pages | commit `ledger/` to a `gh-pages` branch (the zip from CI works too) |
| S3 | `aws s3 sync ledger/ s3://your-bucket --delete`, then `no-cache` on `sw.js` |
| any nginx | copy `ledger/` to `/var/www/ledger` and include `deploy/nginx.conf` |
| nothing at all | email `ledger-app.zip`; it unzips and opens without a server |

**Two things to know.**

- **The worker needs https.** Browsers give a service worker only to a secure
  origin. Over plain `http://` the game plays perfectly and installs nothing —
  offline and "install" come from https (all the hosts above provide it).
- **Serve `sw.js` uncached.** A new worker behind a cached one is a deploy nobody
  receives. `deploy/nginx.conf` already does this; on S3 set
  `Cache-Control: no-cache` on `sw.js` and `manifest.webmanifest`.

Want a file to email instead? `ledger-app.zip` (334 kB, ten files) is it — unzip
and open `index.html`, no server required.

---

## 2. The React app (a URL, installable, server-rendered shell)

### Vercel — the five-minute path

```bash
git log --oneline   # the repository already exists: two commits, clean tree
git remote add origin <your repo> && git push -u origin main
```

Then **import the repository** at vercel.com. `vercel.json` at the root already
sets everything: `npm install`, `npm --workspace apps/web run build`, output
`apps/web/.next`, framework `nextjs`.

If Vercel's dashboard disagrees about the app's location, set **Root Directory =
`apps/web`** in the project settings and leave the framework preset on Next.js.
Both routes build the same thing; the root one is what this repo is configured
for.

### Docker — anywhere you can run a container

```bash
npm run deploy:app                  # builds and runs on :3007
# or by hand:
docker build -t ledger-app .
docker run --rm -p 3007:3007 ledger-app
```

Two stages, so the toolchain stays out of the image, and the run stage installs
production dependencies only. The container binds `0.0.0.0:3007`, so a platform
that fronts it with TLS (Fly, Render, Railway, Cloud Run, a plain VM) works
unchanged.

### Any Node host

```bash
npm install
npm --workspace apps/web run build
npx next start -p 3007 -H 0.0.0.0   --prefix apps/web   # or: cd apps/web && npx next start -p 3007
```

**There is nothing to configure.** No environment variables, no secrets, no API
keys: the game is local-first, and a player who wants the optional backend enters
their own Supabase details in **Settings**, where they are stored on their device.
That is why there is no `.env.example` in this repository.

---

## 3. On a phone (the store build)

The shell is Capacitor around the same file, so the deploy is: verify the payload,
generate the native project, sign it.

```bash
npm run build                                  # fills apps/phone/www
npm run sync --workspace @ledger/phone         # npx cap sync: copies www/ into the native projects
npm run assets --workspace @ledger/phone       # draws every icon and splash from ledger/icon.svg
npm run open:android --workspace @ledger/phone # Android Studio, then build a signed AAB
```

On a machine with the SDK (this dev container has neither the Android SDK nor
macOS):

```bash
cd apps/phone
npm install
npx cap add android            # once; writes android/ (gitignored — it is generated)
npx cap add ios                # once, on macOS with Xcode
npm run assets                 # paint the icons and splashes for this project
npm run build:android          # cap sync android && ./gradlew assembleRelease
```

Then sign it the usual way — a keystore for Android, an Apple Developer account
and Xcode's archive flow for iOS — and upload. The face it ships is already the
game's own (the `phone` gate compares the launcher icons, the round icons, the
adaptive foregrounds and eleven splash screens to `ledger/icon.svg`, pixel by
pixel, and fails on a template's artwork).

`apps/mobile` (Expo + React Native) is the other phone path and it is not a store
deploy yet: it needs `npx eas build` with an Expo account, and it exists for the
day native navigation or widgets are worth paying for. See `apps/phone/README.md`
and `apps/mobile` for the split.

---

## 4. The backend (optional — the game plays without it)

There is no server in this repository, and deploying the game does not require
one. What exists is a schema a *player* can run in their own Supabase project,
and two features that use it:

| feature | table | what it does |
|---|---|---|
| **Your record** | `profiles` | the profile and run history, uploaded and merged across devices |
| **Seasons** | `seasons` | a finish line fixed in advance, published once, joined by code / link / QR |
| **Season leaderboard** | `season_runs` | one row per player per season, upserted, readable by everyone |

Everything else — all thirty screens, every quarter, every decision, saves,
offline play, installability — works with no network and no account.

### Standing it up (two minutes, no code)

1. Create a project at **supabase.com** (free tier: three small tables).
2. Open **Database → SQL editor → New query**, paste **`deploy/supabase.sql`**, Run.
3. Copy the **Project URL** and **anon/public key** from Project Settings → API.
4. In the game: **Settings → Your record**, paste both, plus an email and a
   password, and press **Create account** (or **Sign in** on the second device).

`deploy/supabase.sql` is **generated** from the client's own `CLOUD_SQL` constant
by `tools/supabase-sql.mjs` (which `npm run build` runs), so the schema and the
queries that use it cannot drift — and `tests/integration/backend.test.js` fails,
by column name, if they ever do.

### Why this is safe to ship

- **The anon key is public by design.** It identifies the project, not the user.
  Row level security is on for all three tables: with the key alone you can read
  nobody's profile and write nothing.
- **A profile is private; a leaderboard is not.** Policies use `auth.uid()`, so a
  signed-in player can read and write only their own row in `profiles` and
  `season_runs`, and may read every season and every score.
- **The password is never stored.** It goes from the form to Supabase's auth
  endpoint; the game keeps the access and refresh tokens and nothing else.
- **No secret belongs to the deployer.** That is why there is no `.env.example`
  in this repository: a deployment ships zero credentials.

To host the whole thing with *your* project instead of each player's, you would
change `cloudCfg()` to read a default — but the deliberate choice here is the
opposite: the game asks the player, and a deploy stays a static file.

---

## Before you push, always

```bash
npm test
```

Runs the build, then 32 unit tests, 15 integration tests, 8 end-to-end tests in a
real browser (including the design measured at 390px and 1440px), and the 41
gates that make drift impossible. If it is green, what you are deploying is what
was tested; if it is not, the failure names the thing that broke.

CI does the same on every push (`.github/workflows/tests.yml`, five jobs), and
uploads the zip, the single file and the faces page as artifacts.

## What is verified here, and what is not

**Verified in this workspace:** the payload is complete and current; every
`COPY` source exists; `vercel.json` matches the workspace layout; the app builds
and starts (`next build` → `next start`) and the e2e tests play it in a browser,
with the network off; the Android project holds a byte-identical copy of the game;
the faces are the game's own; there is no configuration to get wrong.

**Not verified here, honestly:** no Supabase project was created and no row was
ever written to one — the backend tests check the *contract* (every column the
client reads or writes exists in the schema, every table is behind RLS, the SQL
file matches the client's `CLOUD_SQL` verbatim) without a network, which is what
can be checked without asking you for an account. No Docker image has been built (Docker is not
installed in this container), no APK or AAB has been produced (no Android SDK),
no iOS project exists (no macOS), and nothing has been pushed to Vercel or a store
from here. Each of those is one command on a machine that has the tool — and the
`deploy:check` above is the part of each that can go wrong from the repository
side.
