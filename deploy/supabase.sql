-- LEDGER — the backend, in one file.
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
-- read and write only their own row in `profiles` and `season_runs`, and may
-- read every season and every score — a leaderboard that nobody can read is a
-- leaderboard nobody has. The policies use auth.uid(), so they cannot be talked
-- around from the client.
--
-- GENERATED — do not hand-edit. This file is written from `CLOUD_SQL` in
-- packages/core by tools/supabase-sql.mjs, which `npm run build` runs, and
-- tests/integration/backend.test.js fails if the file and the client's queries
-- ever disagree. Change the schema in the source, not here.
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  id           text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  data         jsonb not null,
  updated_at   timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "own_profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- seasons: a finish line fixed in advance, shared by everyone who joins
create table if not exists seasons (
  code        text primary key,
  config      jsonb not null,
  created_by  uuid not null default auth.uid(),
  created_at  timestamptz not null default now()
);
alter table seasons enable row level security;
create policy "seasons_read"   on seasons for select using (true);
create policy "seasons_insert" on seasons for insert with check (auth.uid() = created_by);
create policy "seasons_update" on seasons for update using (auth.uid() = created_by);

-- one entry per player per season; re-submitting updates theirs and only theirs
create table if not exists season_runs (
  id           bigserial primary key,
  code         text not null references seasons(code) on delete cascade,
  user_id      uuid not null default auth.uid(),
  player       text not null,
  total        int  not null,
  score        jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (code, user_id)
);
alter table season_runs enable row level security;
create policy "runs_read"   on season_runs for select using (true);
create policy "runs_insert" on season_runs for insert with check (auth.uid() = user_id);
create policy "runs_update" on season_runs for update using (auth.uid() = user_id);
