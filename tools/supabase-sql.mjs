/* The backend, as a file somebody can run.

   The schema has always existed — it is `CLOUD_SQL` in `packages/core`, and the
   game even shows it to the player in Run info so they can copy it into their own
   Supabase project. A string in a modal is not a deploy artifact, though: it
   cannot be reviewed, diffed, or run without a browser. This writes it as
   `deploy/supabase.sql`, from the constant the client actually uses, so the file
   and the client cannot disagree.

     node tools/supabase-sql.mjs            # write it
     node tools/supabase-sql.mjs --check    # fail if it is not what core says

   The SQL is not wrapped in "if not exists" twice or reworded: it is `CLOUD_SQL`,
   verbatim, under a header that says what to do with it.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'deploy', 'supabase.sql');
const check = process.argv.includes('--check');

const core = await import('file://' + path.join(ROOT, 'packages', 'core', 'index.js'));
const sql = core.CLOUD_SQL;
if (typeof sql !== 'string' || sql.length < 500) {
  console.error('supabase-sql: core exports no CLOUD_SQL — run `npm run build` first');
  process.exit(1);
}

const header = `-- LEDGER — the backend, in one file.
--
-- Optional. The game is local-first and plays completely offline; nothing here is
-- needed to play it, on any of the three builds. What it adds:
--
--   profiles      a backup of your record that follows you between devices
--   seasons       a finish line fixed in advance and shared by everyone who joins,
--                 published once and joined by code, link or QR
--   season_runs   the leaderboard for a season: one row per player, upserted
--
-- HOW TO STAND IT UP (two minutes, no code):
--
--   1. Create a project at supabase.com (the free tier is enough: this is three
--      small tables and one row per player).
--   2. Open Database -> SQL editor -> New query, paste this whole file, Run.
--   3. In Project Settings -> API, copy the Project URL and the anon/public key.
--   4. In the game: Settings -> Your record -> paste both, plus an email and a
--      password, and press Create account (or Sign in on your second device).
--
-- WHAT THE PLAYER'S BROWSER HOLDS: the project URL, the anon key, their email and
-- their access token. The anon key is *designed* to be public — it identifies the
-- project, not the user — so this is safe to ship in a page. The password is read
-- from the form, posted to Supabase's auth endpoint, and never stored: the game
-- keeps the access and refresh tokens and nothing else. Nobody deploying the game
-- needs a secret, which is why this repository has no .env file anywhere.
--
-- HOW IT IS PROTECTED: row level security is on for all three tables, so the anon
-- key alone can read nobody's profile and write nothing. A signed-in player can
-- read and write only their own row in \`profiles\` and \`season_runs\`, and may
-- read every season and every score — a leaderboard that nobody can read is a
-- leaderboard nobody has. The policies use auth.uid(), so they cannot be talked
-- around from the client.
--
-- GENERATED — do not hand-edit. This file is written from \`CLOUD_SQL\` in
-- packages/core by tools/supabase-sql.mjs, which \`npm run build\` runs, and
-- tests/integration/backend.test.js fails if the file and the client's queries
-- ever disagree. Change the schema in the source, not here.
-- ---------------------------------------------------------------------------

`;

const body = sql.trimEnd() + '\n';
const wanted = header + body;

if (check) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  if (have !== wanted) {
    console.error('deploy/supabase.sql is not what core says — run `node tools/supabase-sql.mjs`');
    process.exit(1);
  }
  console.log('deploy/supabase.sql: current (' + body.split('\n').length + ' lines of SQL from CLOUD_SQL)');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  fs.writeFileSync(OUT, wanted);
  const tables = (sql.match(/create table if not exists (\w+)/g) || []).map((m) => m.split(' ').pop());
  console.log('the backend        : deploy/supabase.sql ' +
    (before === wanted ? '(unchanged)' : 'written') + ' · ' + tables.length + ' tables (' + tables.join(', ') + ') · ' +
    (sql.match(/create policy/g) || []).length + ' RLS policies · from CLOUD_SQL, not hand-written');
}
