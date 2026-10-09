# FINDINGS.md — the competitive and UX read

*First written 7 October 2026 from outside Lagos Life. Rewritten 9 October 2026
after playing it: two logged-in sessions in Lagos Life (8 Oct night, 9 Oct
early morning, WAT), an account created and played in PH Lifestyle, the press
and creator reports up to 8 Oct, and the work this read has already shipped in
LEDGER.*

*Companion files, all of them instruments or raw data rather than prose:
`playtest/PROTOCOL.md` (how to measure their game), `CONTENT.md` (what our game
contains, generated), `tools/playtest.mjs`, `tools/journey.mjs`, and the
evidence in `evidence/` — the 30 captures from the sessions are in
`evidence/session-2026-10-08/`.*

**How to read the labels.** Every claim about another game is one of:
**observed** (seen in the running game, with the capture named), **reported**
(press or the creator's own posts — their numbers, not verified), **fan guide**
(unofficial guide sites; numbers may lag the game), or **inference** (what the
observation suggests, not checked). Claims about LEDGER come from the tools named
beside them and can be re-run.

---

## 0. What changed in this revision

| the 7 Oct version said | what is true | how we know |
|---|---|---|
| their play session was **not seen** | played: two Lagos Life sessions on an existing account, one PH Lifestyle account created and played | observed, §3 and §4 |
| entry needs an **account, email**, 18+ | username + password + an 18+ tick; **email is optional** in both games | observed (PH sign-up form, `ph-09`), fan guide (Lagos Life) |
| money comes from **IAP naira top-ups** | early revenue is mostly **in-world advertising** (billboards, music in clubs, stats-page slots); top-ups exist but were not the reported earner | reported (Techpoint, WeeTracker); observed (`My Ads` app, billboards on the map) |
| **21 careers** × 5 levels | **32 careers × 5 levels (160 positions)** per the 5 Oct guide; Abuja adds its own 5 | fan guide |
| "they ship a **support page** for Reconnecting to Lagos" | that page is an **unofficial fan guide** (lagoslifeguide.com/support); the game has no status page | fan guide says so itself |
| "Baba Landlord and Gov @Franka are remembered" | @Franka is real and is **governor this week**; "Baba Landlord" was not seen in either session | observed (`ll-13`); landlord unverified |
| their loop is "kept alive by appointments" (from outside) | **confirmed and stronger than thought**: a job that starts at 9AM tomorrow, a court case **lost for missing the hearing**, an election closing Sunday 8pm, bets settling at 9pm, quests and gem hunts resetting at midnight | observed |
| "six needs and 275 activities is chores-as-retention — do not take" | the **needs grind** is still not for us, but the **activity card** — cost, time and effect shown before the tap — is the best pattern in both games and we should take it | observed (`ll-03`, `ph-08`) |
| F4 would be "a beat between naming yourself and Q1, permanent for the run" | F4 shipped as **Today's life**: dealt from the date, the same for everyone that day, opt-in on step 2 — permanence comes from the date, not the run | `git log`, `tests/unit/todays-life.test.js` |
| the Lagos Life numbers (1.1M players, 97k online) | 3.06M players reported by 7 Oct; **160k online** seen at 22:39 WAT on 8 Oct, **22k** at 05:08 on 9 Oct | reported; observed |

Two things I said *in conversation* during the session that do not hold, recorded
so they are not repeated:

- **"The server takes the client's word for its money."** I saw the client
  `PUT /api/save` (the whole save). Whether the server validates that save is not
  visible from the client. The exploit is consistent with weak validation; it is
  not proof of it. **Inference.**
- **"PH Lifestyle's Cook is a silent failure."** Wrong. The kitchen panel opened
  after my capture window had closed. It is in fact the clearest refusal in
  either game (`ph-08`, §4).

---

## 1. Lagos Life, in facts

| | |
|---|---|
| What | **Lagos Life** — free, browser-based, multiplayer, Sims-style life sim set in Lagos, live 3D world |
| Who | **Shalom Rayhamen** (@Shalom_HeyEliy), operating as **Eliy**; reported elsewhere as **Shalom Mathew**, a UK-based Nigerian developer, and (Arise) as Ijeoma Shalom Rayhamen. Same person, three spellings in the press |
| When | launched **1 October 2026** (Independence Day) |
| Where | lagoslife.app (also lagoslife.eliysites.com); no store app. Abuja and Port Harcourt **added as cities on 6 Oct** (reported; both appear as map tabs, observed) |
| Inspired by | **Lagos Run** (Opeyemi Adeniran, Berlin-based engineer, released 26 Sept): drive a danfo through Lagos traffic, tens of thousands of players in days. The creator credits it and The Sims 3 |
| Entry | username (3–20 chars) + password (≥ 8), **email optional**, 18+ by the Terms; sign-up comes *after* you have seen the world |
| Money | free; in-world advertising is the reported earner; an optional wallet top-up buys in-game naira (Terms s.6), non-withdrawable (s.5), purchases final (s.10) |
| Stack | Next.js (turbopack chunks), REST under `/api/*`, a WebSocket at `wss://lagoslife.app/live` (observed) |
| Weight | **864 requests** on a cold load of the landing page at phone size (observed, headless). Ours: **0** |

**Their numbers over time** — all **reported** from their own dashboard unless marked:

| when | players | online now | visits | source |
|---|---|---|---|---|
| ~3 Oct | — | 11k+ | — | creator |
| 5 Oct 07:15 | 1,173,086 | 55,083 | 9.12M | TechNext |
| 5 Oct | 1,212,477 | 71,625 (peak 109k+) | 9.6M | Techpoint |
| 5 Oct | 2M+ | 145k+ concurrent | 16.5M | WeeTracker |
| 6 Oct | 2,806,144 | 111,427 | 25.9M | Marie Claire |
| 7 Oct | 3,058,259 | ~122k | — | search summary |
| 8 Oct 20:5x WAT | — | **138k** | **26.2M** | **observed** (landing) |
| 8 Oct 22:34–22:39 | — | **155k–160k** | **26.4M** | **observed** (in game) |
| 9 Oct 05:08–05:25 | — | **22k–23k** | **27.0M** | **observed** (in game) |

Treat the totals as marketing: a visit of a few minutes counts as a player, and one
user claims sign-ups need no email verification (Techpoint). The order of magnitude
is not in dispute, and the 7× night-to-dawn swing in "online now" is what a
real-time game looks like when its players sleep.

**Revenue (reported).** **$46,900 in the first four days**, shared by the creator
(WeeTracker). The documented streams: **38 roadside billboards at ₦5,000/week**
(full occupancy ₦190,000/week), **lagoon plots at ₦18,000/week**, **artists'
music played in the virtual clubs at ₦50,000**, and **stats-page ad slots** —
₦50,000 for 30 days on 3 Oct, ₦100,000 for 7 days on 5 Oct, **₦150,000 for 7 days
on 8 Oct (observed)**. One campaign recorded **3,686 taps from 9,826 opens (~38%)**
on 2 Oct. Named advertisers: Salary Index (the biggest sponsor), Leadway Lifestyle
Fair, MyDecorTrade, ONErpm, small businesses, independent artists. Booking needs no
account: upload a logo, pay, it goes live (Techpoint). On the map the billboards
are real ads (`ll-10`: "CyberLadder — You don survive Lagos. Make your street
sense win you money"). Seven of the first twelve phone apps carry a **NEW** badge
and look like sponsor slots (Meetumo, PopOut Tickets, Eleventhco, Nollywood, Bet
Tips, versiah.com, a second Games) — **inference** for the sponsorship, observed for
the badges (`ll-05`).

**Why ads and not purchases:** Nigeria's credit-card penetration is about **3.5%**,
which makes paid downloads and in-app purchase hard; about **87%** of African
gamers play on smartphones (WeeTracker). In 2016 Gamsole's founder said Nigerian
games could not be monetised without a telco; Lagos Life is testing whether a big
enough audience changes that.

**What went wrong in week one (reported):**
- **2 Oct outage**; every player compensated with ₦100,000 in virtual cash.
- **An exploit minted billions and trillions of virtual naira.** Balances were
  reset, honest ones restored, and an **income tax** was promised. The guide now
  lists weekly tax at 20% above ₦1m, 40% above ₦10m, 45% above ₦50m (fan guide).
  The rich list now **tops out at exactly ₦5.0bn** for dozens of players (`ll-17`) —
  **inference**: a cap. The test account still holds ₦236.8bn, and the Police app
  shows it **lost an "unexplained wealth" case by missing the hearing** (`ll-12`).
- **Chat load**: one X user argued the global chat was hitting bandwidth limits
  (unverified analysis).
- An unrelated **$LAGOSLIFE crypto token** claimed developer support; **look-alike
  domains** (lagoslife.org, .xyz, .site, lagoslifeguide.com, lagoslifewiki.com …)
  rank for the name — most are honest fan guides, but the password risk is real.
- **Retention is unknown.** Nobody has published active-player data past launch week.

**What critics said.** A Substack essay ("People got kidnapped and you were playing
Lagos Life") reads the game as a mirror: the Nepo/LAPO question "shows our level of
classism, and it reeks all through the game"; **crime pays better than honest work**
(ATM hacks, pickpocketing, fake designer bags); players **buy votes** to become
"President"; money feels "endlessly unsatisfying" with "not much to buy"; the
developer raised prices so the rich could not easily spend. It ends by defending
fun. Players mostly joke that they do not want real-life hardship in the game
(TechNext). Google searches for "Lagos life" rose **5,000%+** in a week, peaking
10pm on 4 Oct, strongest in Ekiti, Ogun, Osun and Lagos.

**The copycat wave.** Lagos Run (26 Sept) → Lagos Life (1 Oct) → London Red Bus
(1 Oct), **PH Lifestyle** (Port Harcourt, §4), Road to Number One (music stardom),
and Abuja/Port Harcourt cities inside Lagos Life itself. The format — a free link,
a Nigerian city, recognisable nouns — is now a genre, and the window for "the
first" has closed. The window for "the best at something" has not.

---

## 2. The difference that decides it

They are not making our game, and we are not making theirs.

| axis | Lagos Life | LEDGER |
|---|---|---|
| **Time** | real time: a game day is a real day; shifts at 9AM, rent on Saturday, the election closes Sunday 8pm | **30 years in about an hour**, quarterly commitments; the world waits for you |
| **World** | one live shared 3D city; other humans *are* the content (chat, robbery, lawsuits, votes, hiring) | deterministic solo sim; same seed, same life; optional player-owned season backend |
| **Depth** | breadth: 37 phone apps, 31 Lagos places, needs, jobs, crime, courts, elections, betting | **compounding**: markets, FX and inflation across six cities, portfolio, negotiation, board votes, household, legacy |
| **Entry** | account (username + password, email optional), 18+, a server, 864 requests | open a 1.1 MB file; offline; no account, no ads, no trackers, 0 requests |
| **Failure mode** | "Reconnecting to Lagos…"; "Your game hasn't saved where you are yet"; a slow 3D map with a data-saver fallback | a deterministic sim cannot disconnect |
| **Money** | in-world advertising + optional top-ups | none, and none planned |
| **Consequences** | **people and institutions**: a police record, an EFCC file, a court date, a governor's policy, a robber with a name | **numbers**: the effect of a choice, now shown (§7), and scheduled consequences, now listed |
| **Local flavour** | the whole product | Lagos-default among six cities; texture growing (Today's life draws, events like aso-ebi) |

> **Theirs is a city you log into; ours is a life you can hold.**
> They won the distribution game and a copycat genre followed within a week. We
> will not beat a million-player social loop with a single HTML file, and we should
> not try. What playing them showed is sharper than that: **their consequences have
> faces and addresses; ours have decimals.** That gap is closable without a server,
> and it is where the next work goes (§8).

---

## 3. Inside Lagos Life — what playing it is like

*Observed in two sessions on an existing account (a LAPO Baby start, Tech career
applied for during the session), 8 Oct 20:50–22:40 and 9 Oct 05:08–05:25 WAT,
390 × 844, a real Chromium window for the 3D. Read-only except: Continue, opening
panels, applying for a job, one ₦25,000 activity, one danfo trip, Say Hello and
Crack Joke to two players. No chat typed, no money sent, no top-up, no crime.*

### 3.1 The screen

- **The place is the backdrop.** You land in a 3D venue with real players walking
  in it, name tags floating (`ll-02` Balogun Market at night, `ll-06` MindSpace
  Wellness). A top bar: clock, mood, sound, cash with a green **+** (top-up).
  Under it two pills: **👀 visits** and **● online**.
- **A coach chip, always one next step.** "🎯 Get a job · Open Phone → Jobs";
  after applying it became "Work a shift · Leave for work on time".
- **Six needs, always visible** as bars: 🍛 ⚡ 🎉 💬 🫧 🚽 (belle, energy, fun,
  social, hygiene, bladder). A status chip when something is wrong: "🤒 Sick · treat it".
- **A shared daily counter** — "💎 Daily gem hunt · 73,198 found · next prize
  ₦3,000" — that every player moves (+87 in one minute at 22:35; reset to 8,961 by
  05:08).
- **The place panel**: the place's name, a rotating **ambient line** ("💸 Every
  price here is 'negotiable'", "🚚 A truck is offloading at the depot", "🧵 New
  Ankara just arrived from Kano"; at MindSpace "🌿 Plants, soft light and nobody
  rushing you"), a chat box ("Say something to the 6 players here…"), the place's
  sub-spots as chips (Foodstuff stall · Alhaji's fabrics · Wholesale depot ·
  Loading bay · Iya Agbo), a **People** count, a running **bill** (🧾 ₦25k).
- **Bottom bar**: Home · Buy · Map · Phone. "⌃ Clean screen" hides the HUD.

### 3.2 Doing something

- **Every activity is a card that says its price, time and effect before you
  tap** — "🥤 Gala & LaCasera · ₦5,000 · 5s · +Hunger +Fun"; risky ones are
  flagged "🚨 Risky · Pickpocket a Trader" (`ll-03`).
- **Prices scale with wealth**: "🎩 VIP prices for your table (×50)" — the rich
  account paid ₦25,000 for a ₦500 journal and tea. This is their answer to
  "money means nothing".
- **While it runs**: a chip "Journal & Tea · × tap to cancel" with a progress
  ring, and an icon bubble over the avatar (`ll-09`).
- **When it lands**: one plain sentence — "You wrote down what's been on your
  mind. It looks smaller on paper." — the mood moves (😐 → 🙂 Happy), and the
  **bill grows** (🧾 ₦25k → ₦50k). Numbers on the needs move; no number is spoken.
- **Real-world care where it belongs**: MindSpace carries "💛 If you're struggling
  in real life, talk to someone you trust…"; LagosBet carries "18+ · Just for fun…
  The house always has an edge."

### 3.3 Rewards and goals

- **Applying for one job fired five toasts in a row**: "Goal complete: Get a job
  · +₦1,000 +1 ✨", "Visit the buka · +₦1,500 +1 ✨", "Make a new friend · +₦1,500
  +1 ✨", "Buy something new · +₦1,000 +1 ✨", then "You're hired! Intern I at
  CcHub, 9AM. No need to find it: when it's time, tap 💼 Go to work." (`ll-08`).
- **Goals tab** (`ll-07`): **Today's Hustle** (daily reward, 0/3 missions);
  a **Lifetime dream** with a progress bar ("🦄 Yaba Unicorn — Get your startup
  funded at CcHub, Yaba · 59%", change once a week); the **birth lottery kept as a
  badge** ("🏦 LAPO Baby · Self-made hits different. Loan paid off. Self-made 💪🏾");
  **Wishes** that pay ✨ ("Watch some TV +1✨", "Eat at Amala Shitta +3✨", "Visit
  Elegushi Beach +3✨", each swappable); **Certificates** (Software Developer 2/5).
- **✨ buys permanent perks**: Iron Belle (belle drops 25% slower), Steel Bladder,
  Early Bird, Never Dull, Sweet Mouth (+15% social), **Hustle Juice (+25% work
  performance)**, Connected (10% off), **Fast Learner (+20% skills)**, Clean Freak,
  Social Butterfly, Power Napper, **Good Lawyer (jail sentences 25% shorter)**,
  Charmer, Good Vibes. Your play style becomes your build.

### 3.4 Work

- Phone → **Jobs**: every career is a card with its first rung, pay per shift,
  shift pattern and a one-line story — "💻 Tech · Intern I · ₦8,600 per shift ·
  From Yaba intern to CTO. Coding pushes promotions"; Banking ₦10,100; Trading
  ₦7,200 ("Six days in Balogun. Hustle your way to Market Oga"); Nursing ₦7,900;
  Music ₦6,400 ("Night shifts at the Shrine"); Hairstyling ₦6,400. Every card says
  **"Apply — start tomorrow"**. The card says "1-hour shifts, any time"; the hire
  message said "9AM". Work is an appointment. (Not played: a shift. It starts the
  next real day.)

### 3.5 Moving around

- **Map** (`ll-10`): an isometric 3D Lagos with a lagoon, landmark pins and real
  billboards; filters **Ads · Homes · Sea · Gov · Walk**; city tabs **Lagos · PH ·
  Abuja**; **Names** toggles labels. It loads slowly ("Loading map… 1% → 67%") and
  says so: **"📶 Network slow, Saver mode don on to save your data."**
- **A place sheet** before you go: description ("Braids, low cuts, nails and the
  best gist in Surulere"), services, "🛍️ Player shops here", and **five ways to get
  there with prices**: 🚶 Trek free · 🛺 Keke ₦5,000 · 🚐 Danfo ₦5,000 · 🏍️ Okada
  ₦10,000 · 🚕 Cab ₦17,500 — plus "🖤 Odogwu Box · Free" (the account's own car).
- **The trip is instant**, and it can cost you something you did not choose:
  **"🧾 Agbero at the park collected ₦50 'levy' 🙄"**.
- Each place has its own weather: "💇🏾‍♀️ Knotless braids are the trend this
  week", "📻 Afrobeats playing loud", "🗣️ The gist today is HOT".

### 3.6 Other people

- **People list**: real players labelled with what they are doing *right now* —
  "@Timi_26 · Pickpocket a Trader", "@Bonfreyy · Carry Load (Alabaru)" — and named
  NPCs with trades: "Deji · Fabric trader", "Funmi · Pepper seller", "Sadiq ·
  Haggling", "Simi · Hawking pure water" (`ll-04`).
- **Tap a player** (`ll-11`): 💬 Chat · 👪 Add as family · 🧰 Hire for a job ·
  🥷🏾 Rob · risky · 🚓 Report to police · 🚫 Block · ⚑ Report, and four one-tap
  social moves **with their odds and effects shown**: "👋 Say Hello · +Social",
  "Gist · +Fun +Social", "😂 Crack Joke · **69%** · +Fun +Social", "😒 Throw Shade
  · +Fun +Social". Public status on the sheet: "💘 Dating @Hamara", "Hustle ★3.0".
- **A locked action says why and how far**: "💘 Ask to be my Bae opens when you're
  closer **(0/40)**. Chat, gist and hang out more."
- **Outcomes come back as the other person's line, in Pidgin** — written by the
  game, not typed by them: Say Hello → "@colorr smiled: 'How far? Nice to meet
  you!'"; Crack Joke (failed) → "@levi27: 'Na wa for you o. That one no enter.'"
- **Messages** are mostly receipts of one-tap moves — "You threw shade 😒", "You
  said hello 👋", "You invited them over 🏠" — and the replies they provoke: "So
  this is where you live?", "As you dey throw the shade, throw money too 🤔".
- **Your house is a link**: `lagoslife.app/v/<handle>` — "Anyone with your link
  comes to your door. You decide who enters · fits 5 guests… New players who sign
  up from your link show up here" — a referral loop inside the Sim panel.
- **Hustle board**: players hire players, "The fee is held safe until the job is
  done" — masons for a house foundation in Imota (₦34,800), an interior designer
  (₦10,000,000), a sales girl (₦10,000), and some posts that are plainly not jobs
  (`ll-15`).

### 3.7 Consequences are institutions

This is the part that was invisible from outside and matters most.

- **Police** (`ll-12`): "Eko Police Division · Clean record 😇 · 2 you got away
  with". **Your cases**: "LD/9159EF/2026 · unexplained wealth · **Lost (missed the
  hearing)**". **Robberies on you**: "@botyfe · Tried, and got caught · MindSpace
  Wellness Centre · 7 min ago" — someone tried to rob this account while I sat
  there — with **⚖️ Sue** and **Report**. "Your tries lately: 2 got away, 0
  caught." "Robbing a player: … At most ₦50,000, and the police catch most
  people." "Robbing gets riskier for whoever the police have reports on."
- **EFCC**: "The EFCC notices sudden wealth, big transfers out and money passed
  straight through, and sometimes digs into past crimes. Money people send you
  never opens a file on its own. **A raid never takes what you topped up.**"
- **Court** (`ll-14`): "Lagos High Court. Take them to court. Pick your lawyer, say
  what happened, and the judge rules: live, at Igbosere." "Sue a robber or a
  Hustle no-pay." "**The court only hears what the game itself recorded.**"
- **Government** (`ll-13`): "Governor of Lagos · this week · @Franka · 'Good Lagos
  ahead' · 9,543 votes · **Food subsidy · Groceries and food are 30% cheaper** ·
  Term ends in 2d 14h · Sunday 8pm"; a **cabinet of players** (Commissioners for
  Finance, Works, Health, Transport); Senator and President tabs; 200 candidates;
  "Vote in person at the Polling Unit · Lagos Island · get accredited, cast your
  vote and watch the live count". The manifestos are vote-buying satire, written
  by players: "VOTE AND DM FOR 100B", "1Trillion to all my voters", "Dm me for 50b
  after voting".
- **Shared stakes**: **LagosBet** — "Today's games · results at 9 PM. **Everyone in
  Lagos bets on the same games.**" Football odds, High-Low, Roulette (`ll-16`).
  **Forbes** — "The richest in Lagos Life · 16,291 players ranked", each with home
  and career ("Face-me-I-face-you", "Mansion · Banking") (`ll-17`).

### 3.8 The phone

37 apps (`ll-05`): Jobs, Messages, Games, Meetumo*, PopOut Tickets*, Eleventhco*,
Games*, Nollywood*, Bet Tips*, versiah.com*, Contacts, Help & guide, Courses, Ride,
Chowdeck, Bank, Boutique, Forbes, Houses, Cars, Invite, Health, Invest, Assurance,
LagosBet, Family, Staff, Hustle, Bus Co., Company, Shops, Lagos Gist, Lagos Gov,
Police, Court, My Ads, Settings (* = NEW badge). The OS chrome is a real phone's:
clock, signal, "4G", battery, "Friday 9 October · Lagos".

### 3.9 Engineering, as seen from the client

- Calls observed in one session: `/api/visit`, `/api/daily`, `/api/auth/me`,
  `/api/wallet/pending`, `/api/save` (GET and **PUT**), `/api/save/backup`,
  `/api/save/old-account`, `/api/version`, `/api/hunt`, `/api/gov`,
  `/api/politics`, `/api/world`, `/api/live`, `/api/family`, `/api/verified`,
  `/api/food-gift`, `/api/ads/verify`, and the WebSocket `/live`.
- The client uploads the whole save (PUT). Whether the server checks it is not
  visible — **inference** only, see §0.
- Location is saved periodically, not on arrival: "Your game hasn't saved where
  you are yet. Try again in a minute."

---

## 4. Inside PH Lifestyle — the copycat that went 3D

*phlifestyle.fun, "PH Lifestyle | Port Harcourt Multiplayer Life Game". An account
was created (no email given) and played on 8–9 Oct: the start roll, one bucket
bath, two bus rides, the quests screen, the kitchen, one meal and the bole side
hustle (the last two not confirmed — the map covered the scene in those frames).
No press coverage was found.*

- **Small**: 123–142 "people in Garden City right now" in the evening, ~30 after
  midnight. three.js 3D; the game server is a separate host
  (`world-production-…up.railway.app`, WebSocket `/ws`); 258 requests on the
  landing page; one third-party analytics script.
- **Three doors**: Sign up free · Log in · **"Just looking? Play as a guest"**
  (`ph-01`). "Everyone you see is a real person online, except the people marked
  NPC." "Links and phone numbers are blocked, and you can mute or report anyone."
- **Sign-up** (`ph-09`): name, @username, password, email *(optional)*, an 18+
  tick, a look picker (Senator, Ankara, Injiri check, Akwete weave…), and the
  promise: "When you enter, Port Harcourt rolls where you start: your class, your
  cash and your fame. Waterside pikin? Oil money? **Na luck.**"
- **The roll** (`ph-02`): "THE CITY DON ROLL. YOU BE… **Waterside pikin** ·
  Regular · No loan, no family money. Just you. Born by the creek. Small money, big
  street love. Everybody rates you." — **₦10,000 · ★8 fame** — one button, "**Make
  we go**". A copy of Lagos Life's birth lottery, done better as a moment.
- **The room** (`ph-03`): a detailed 3D room (Ankara bedspread, standing fan,
  wardrobe, zinc roof) under a sign "YOUR ROOM · RUMUOLA · PORT HARCOURT"; HUD of
  cash, three needs and a mood face; a **NEXT** coach ("Take a bus to the
  owambe"); actions by place (Sleep · Bucket bath · Wardrobe · Cook · Toilet ·
  Furnish · Go out); Pidgin **Quick lines** ("How body?", "Light don come!",
  "Lagos no reach PH"), stickers, a mic, Dance.
- **Other people as notifications**: "Gist · Money rain: Teekay don spray ₦8,000
  for Riverbreeze Cruise Jetty", "EFCC don carry Ayomide_ph for the Garden City
  Bank job", "Police don carry Daniel for pickpocket", "It is just_ade's birthday
  today. Tap them to wish them well."
- **Today's quests** — "New quests at midnight, West Africa Time. **Everybody gets
  the same three.**" (Eat bole and fish · ₦800; Catch cruise at Pleasure Park ·
  ₦500; Say five things to people · ₦500). The NEXT chip opens this list; it does
  not route you.
- **A real map** (`ph-04`): OpenStreetMap Port Harcourt with 42 real places
  (Uniport, Mile 1 Market, Garrison Junction, Choba Bridge…) and live counts — "42
  places · 60 people out now", "Trans-Amadi Yard · 15 here".
- **Every trip is a three-way choice with a risk on it**: "Bus · ₦400 —
  Sky-blue bus. Cheap, but the Creek Lions sometimes block the road" · "Drop ·
  ₦2,000 — Charter. AC. Rarely stopped" · "Trek · Free — Costs energy and vibe."
- **The ride is a skippable cut-scene** with Pidgin lines (`ph-05`): "Radio:
  'Garden City 101.9, your number one pidgin station…'", "Passenger: 'Driver, abeg
  no jam anybody o.'", "Conductor: 'Hold-up don start. Buy your gala for window, we
  no dey go anywhere.'" Fare taken: ₦10,000 → ₦9,600 → ₦9,200.
- **Arrival warns you** (`ph-06`): "Night for Waterlines Junction: **phone
  snatchers dey work here. Hold your phone well.**" and an NPC offers work in a
  speech bubble: "Mallam Musa: You wan work? The bus people need loaders. Carry
  bag, collect money."
- **The kitchen** (`ph-08`) is the best refusal in either game: "Nothing in the
  kitchen. Buy foodstuff at Mile 1 Market, Mile 3 Park or the Creek Road fish
  market, then come home and cook." Each recipe shows effect, time and ingredient
  cost **before** you commit: "Jollof rice · +70 belle · +8 vibe · 8s · Rice,
  Tomato and pepper, Palm oil · about ₦850 for the pot".
- **Weak spots**: a home action gives only an animation and a progress ring
  (`ph-07`), no words, no numbers; panels open late; **location resets to your
  room on every reload**; the map can sit over the scene; it is heavy on a cheap
  phone. The developer ships nightly and says so in-game: "Small update going live
  in the next 10 minutes: Gist posts, Whot, voice notes, the PlayStation spot and
  more."

---

## 5. What works in their screens and their journeys

The seven principles from the first read still stand. Playing added eight more,
and they are the ones that decide the next work.

**From the first read (outside):**

| what works there | what we do with it |
|---|---|
| **The setting is the interface** — every landmark a door | our chronicle should read as a place in time: decades as bands, commitments as pins |
| **Render the familiar** — a phone OS grid of Lagos apps | fixed instruments for recurring quantities (a quarter ring, an hours strip) |
| **Label everything, tiny and consistent** | one inline 24px SVG set, state-tinted, zero requests |
| **Make the room visible** — live counters | never fake a crowd; show the player's own evidence |
| **One accent, one action** | gold means state change; primary actions full-width in the thumb zone |
| **Ambient colour** | era tones tint the chrome by decade |
| **Show what is coming, in place** | keep the reason on every disabled control |

**From playing (inside):**

| what works there | the evidence | what we do with it |
|---|---|---|
| **The effect before the tap** | activity cards (`ll-03`), social moves with odds (`ll-11`), the kitchen (`ph-08`), priced transport with stated risk | every commitment card shows cost, hours, effect and odds before you press it — both games do it, we do it only *after* |
| **A lock says why and how far** | "opens when you're closer (0/40)"; "Nothing in the kitchen. Buy foodstuff at…" | F1 already puts the shortfall on the row; extend it: progress toward the unlock, and where to go to fix it |
| **Consequences are institutions** | the police record, the EFCC file, a case **lost for missing the hearing**, a court that "only hears what the game recorded", a governor whose policy makes food 30% cheaper | our tax risk, compliance, debts and rival become a **file** you can open, with dates you must meet |
| **Outcomes are somebody's line** | "Na wa for you o. That one no enter."; "It looks smaller on paper." | each result gets a line from the person on the other side, in their voice, under the chips we already show |
| **Small, unchosen costs** | "Agbero at the park collected ₦50 'levy' 🙄"; a bill that grows at the venue | a running bill for the quarter — our transaction ledger already holds it — and the occasional levy on an ordinary move |
| **Rewards stack** | five "Goal complete" toasts from one action; wishes → ✨ → permanent perks; the birth deal kept as a badge | Today's three (§8), small wishes, a handful of earned perks; Today's life's draw on the profile |
| **The same for everyone today** | "Everybody gets the same three" quests; "Everyone in Lagos bets on the same games"; one gem-hunt counter | this is Today's life — it is the right shape; give it daily goals and a result worth comparing |
| **The place talks** | ambient lines per place and per hour; arrival warnings; NPCs offering work; the radio on the bus | one line per screen and per era, in Lagos voice, from the vignette system we already have |

---

## 6. Our journey, measured

`node tools/journey.mjs` · 390px · Tunde · Lagos · Fresh Graduate · Realistic ·
default seed. One walk, one machine, one seed.

| beat | cost | what happens |
|---|---|---|
| open the file | **0 taps · 0.8 s** | the deal is already on screen — no account, no install, no landing page |
| name, start, rules | **3 taps · 2.6 s** | three steps, each reversible with Back; step 2 now offers **Today's life** first |
| Q1 2026 | 3 taps | the screen states the loop and the agenda says what is next |
| follow the agenda → Money › Deals | 5 taps | the agenda names the deals first (F1b, still open) |
| **the refused commitment** | 6 taps | both deals cost more than a Fresh Graduate holds; Commit is disabled — **and now says "short ₦N" on the row** (F1, shipped) |
| the thing you can actually do | 9 taps | a career action — you spend *hours*, not money; **the toast now says what it did** ("hours −52 · stress +10 · happiness −2 · performance +8") |
| **the loop** | **2.83 taps · 1.83 interruptions per quarter** | "Closing the quarter" every time, plus an event most quarters (F2, still open) |
| thirty years | 168 quarters | ≈ **300 interruptions** across a life |

**Every destination is exactly 2 taps away** — eleven tried, eleven at 2.

From `tools/playtest.mjs`: a full arc is **168 quarters**; **0.99 forced
interruptions per quarter**; **10 things asking for a decision** at a sampled
moment; **166 registered actions** (now 172 in `ACT` — `dealtoday` and `undeal`
added); undo classes **free / at a cost / sunk**; the artifact is about 1.1 MB with
**0 external requests**.

**Two findings that change how the game should be argued about:**

1. **A run that makes no choices still retires at 65 with ₦2.03bn (nominal).**
   The first read called that a floor that makes commitments deliberate. Playing
   Lagos Life — where the rich list had to be capped and critics said money was
   "endlessly unsatisfying" — makes it an **open question**: what is ₦2.03bn worth
   in start-of-game money after 42 years of inflation? If it is real wealth, a
   passive run is a comfortable run, and our decisions risk feeling as weightless as
   their money. **Not yet measured.**
2. **Hours are the only resource that never carries.** Money is re-earned; a
   quarter is gone.

---

## 7. What this read has already shipped

On `main` at `github.com/Omogbolahan33/workplace_game` (commits `044204f`,
`d0f2b25`, `6c2ca5a`). 42/42 gates, 49 unit, 21 integration and 10 end-to-end tests
pass; checked by eye in a 390px browser (`ours-01` … `ours-04`).

| item | what it is now | verified by |
|---|---|---|
| **F1** shortfall on the row | a refused Commit on Money › Deals carries "short ₦N" in the row, both renderers | the disabled-control gate asserts the chip and its arithmetic (2 of 2 deals on a fresh run) |
| **F4** the reveal → **Today's life** | step 2 offers a life dealt from the date in Lagos: profile, one of six birth circumstances (Daddy's name, a microfinance loan, first child and breadwinner, an uncle in Houston, raised in Mushin, mother runs the fellowship), seed, city, tier. Everyone that day gets the same life; each draw gives something and costs something; written into the chronicle | `tests/unit/todays-life.test.js` (same day, same deal; days differ; every draw costs; no seeded randomness drawn) |
| **R1** visible repercussions | an event's result card shows "What that did" as chips and "Comes back Q3 2027 — …" for anything it scheduled; Overview lists **Coming back to you** with the choice behind each; every other action toasts its effect where it was pressed | `tests/unit/repercussions.test.js`; the React and string renderers draw the same core HTML |

PH Lifestyle's daily quests ("everybody gets the same three") and Lagos Life's
"everyone bets on the same games" are independent evidence that the shape of Today's
life is right.

---

## 8. The fix list

### 8a. Flow defects — found by walking

| # | defect | status | fix |
|---|---|---|---|
| **F1** | the reason on a disabled control is a tooltip | **shipped** (Deals). Outlets and units still say it only in a title | the same chip on the outlet rows |
| **F1b** | the agenda leads with what you cannot do | open | rank by what is actionable now |
| **F2** | the modal tax: 1.83 interruptions a quarter | open | the quarter digest lands in place; only real news interrupts |
| **F3** | no way back | open | an in-app back, previous route, in the header |
| **F4** | the reveal is missing | **shipped as Today's life** | — |

### 8b. From playing them — ranked by what it changes ÷ what it costs

| # | change | cost | what it is |
|---|---|---|---|
| **A1** | **The effect before the tap** | M | every commitment shows cost, hours, effect chips and odds *before* you press it; computed by the engine, not hand-written — R1 already measures effects after the fact |
| **A2** | **Consequences as institutions** | M/L | a **Your file** screen: the tax office, the EFCC, the bank, the court. Sudden wealth or a tax-risk spike opens a file; a hearing gets a date in Coming back to you; **missing it loses the case**. Built on tax risk, compliance, debts, the rival and the cast we already simulate |
| **A3** | **Outcomes are somebody's line; small costs nobody chose** | S/M | a Pidgin line from the other party under each result; a running bill for the quarter from the transaction ledger; the occasional levy on an ordinary move |
| **A4** | **Today's three** | S/M | three goals inside Today's life, the same for everyone that day, small rewards; a result line worth comparing |
| **A5** | **A NEXT chip** | S | one tap to the single most useful thing now (subsumes F1b) |
| **A6** | **Wishes and a few earned perks** | M | small aims that pay a token; tokens buy a handful of permanent perks; the dealt life shown as a badge on the record |
| **A7** | **The place talks** | S | one ambient line per screen and per era, in Lagos voice, from the vignette system; a Gist feed of the cast's lives between quarters |
| **A8** | **The locked thing says how far** | S | progress toward an unlock ("opens at credit 60 · you are at 48") and where to go to fix it |

### 8c. The surface set — from the first read, all still open

| change | cost | what it is |
|---|---|---|
| **An hours instrument** | S | 24 pips per quarter that visibly empty as you spend, on Work and Money, identical in both renderers |
| **The life map** | M | a 30-year timeline over the chronicle: era bands, a pin per decision, gold for the irreversible; also the share card's artwork |
| **One 24px state-tinted icon set** | M | inline SVG sprite, ≤ 3 KB: five resources, five tabs, three decision classes |
| **A face for the protagonist** | S | one of the 36 faces in the chronicle header and the share card, aged by era |
| **Era tint on the chrome** | S | `ERA_TONE` on the header rule, active tab and chart strokes, by decade |
| **Primary actions in the thumb zone** | S | modal primary buttons full-width and bottom-anchored below 640px — both competitors keep every action within a thumb |

### 8d. Growth moves — the rest of the playbook, costed

| move | cost | status / note |
|---|---|---|
| **Be public** | S | the single file is still not hosted anywhere; drag `ledger/` onto a static host. Nothing else here matters until a stranger can open it |
| **The share card** | M | a dealt start, a city, year-30 net worth, three decisions, through the native share sheet; Today's life makes it comparable. Their house link (`/v/<handle>`) is the same move as a referral loop |
| **Lagos nouns** | M | a copy pass, no mechanics; their ambient lines and our draws show the register |
| **A season page** | M | runs this cohort, median real net worth — honest social proof from data we already store |
| **Be findable** | M/L | a public guide generated from the tables; strangers built eight guide sites for them |
| **Add to home screen on the first run** | S | their "no download" is advertised; ours is not |
| **A one-line answer to "what is this?"** | S | theirs is "the Sims in Lagos". Ours: "30 years of Lagos in an hour — one link, no sign-up, works offline" |
| **A cheat-proof leaderboard** | M | theirs trusts the client and had to be capped. A deterministic run can be *checked*: replay the seed and the decisions, and the score is either true or it is not |

---

## 9. What not to take, and why

- **Server-authoritative real-time multiplayer.** It costs offline play, the single
  file, determinism and the test story — and their first week is the bill:
  an outage, an exploit, a chat that strains the servers, a location that saves
  "in a minute".
- **Trusting the client for a score.** Their rich list ended up capped at ₦5.0bn.
  If our season board ever counts, it is verified by replay.
- **Top-up currency.** Theirs is honest about it and 18+; ours has no scarcity to
  sell that would not corrupt the sim. Scarcity is the game.
- **Accounts required to play.** Our entry is opening a file. Keep it.
- **Live counters, NEW badges, notification dots.** Seven NEW chips on their phone
  is an ad-slot pattern. Our bell means something; keep it the only badge.
- **Emoji as iconography.** Charming; renders differently everywhere; cannot be
  tinted by state.
- **3D and isometric illustration.** A year of art; 864 and 258 requests; a blank
  scene on a weak GPU and a "Saver mode" to apologise for it. The place is the ledger.
- **The needs grind.** Six bars that drain while you live is chores-as-retention.
  Take the *card* (§5), not the *chore*.
- **Crime that pays better than work, and betting.** It made their headlines and
  their critics; it is not the game we are making. Risky choices yes, with honest
  odds; a casino no.
- **Re-rollable randomness.** Today's life cannot be re-dealt because the date
  cannot be re-rolled. Keep it that way.
- **Their green-on-bright palette and uniform loudness.** Our dark base with gold
  reserved for change is a real advantage for a thirty-year game.

---

## 10. Evidence, instruments, and how to extend them

| file | what it is | command |
|---|---|---|
| `evidence/lagoslife-phone.jpg` · `evidence/lagoslife-city-map.webp` | the two captures the first visual read used | — |
| `evidence/session-2026-10-08/ll-*.jpg` (17) | Lagos Life, logged in: HUD, activity cards, people, phone, goals, reward cascade, activity in progress, map, player sheet, Police, Government, Court, Hustle, LagosBet, Forbes | — |
| `evidence/session-2026-10-08/ph-*.jpg` (9) | PH Lifestyle: landing, sign-up, roll, room, OSM map, bus cut-scene, arrival warning, progress ring, kitchen | — |
| `evidence/session-2026-10-08/ours-*.jpg` (4) | LEDGER after this read: Today's life, result with "What that did", Coming back to you, the action toast | `npm run build`, open `ledger/index.html` at 390px |
| `playtest/PROTOCOL.md` | how to measure **their** loop with a stopwatch: three fixed sittings | read, then sit |
| `playtest/seat-lagos-life.csv` | the sheet for their side — **still blank**: the sessions above were exploration, not the timed sittings the protocol asks for | fill during the sittings |
| `tools/playtest.mjs` · `tools/journey.mjs` | our seat, and the walk in §6 | `node tools/playtest.mjs` · `node tools/journey.mjs` |
| `CONTENT.md` | what the game contains, generated | `npm run content` |

**Driving their clients.** The sessions were driven by short Playwright scripts
(phone viewport, touch taps), kept out of this repository. Two things are needed to
reproduce them: **a real browser window** (`headless: false`) — headless software
WebGL leaves the 3D scene blank or too slow to capture — and, on macOS 13, a
chromium Playwright can still launch (`LEDGER_CHROMIUM`, see README). Credentials
come from the person whose account it is, never from a file in the repo.

**Ethics for their side.** 18+ and a real sign-up are theirs to set; use your own
account; never put credentials anywhere but their sign-in page. No top-ups. Do not
use another player's game as a test fixture — the sessions said hello and told one
joke, and did not rob, sue or message anyone. Being logged in from a headless
browser can trip their fraud checks (Terms s.18); expect it.

---

## 11. Method notes — the mistakes this review caught

All of them are the same class of error: trusting an impression or a return value
instead of checking the thing itself.

1. **A scaled screenshot lied about our own help table.** It is left-aligned;
   both wrapped lines start at x=43.
2. **A journey tool that counts clicks lies.** An in-page `click()` on a disabled
   button returns `true` and changes nothing; the instrument now reads the header
   before and after.
3. **A harness argument swallowed a click.** `tap(sel, 800)` passed `800` as the
   text to match.
4. **The content generator harvested zero controls** because its marker was deleted
   with the tag. Zero should look suspicious, not final.
5. **A blank frame is not a finding.** Headless WebGL rendered PH Lifestyle's and
   Lagos Life's scenes as flat navy; "the job did nothing" was the renderer, not
   the game. Only frames from a real window count.
6. **A panel that opens late is not a silent failure.** I called PH Lifestyle's
   Cook silent; the kitchen opened after the capture window closed and turned out
   to be the best refusal in either game.
7. **A list that re-sorts between taps sends you somewhere else.** The places list
   is ordered by live occupancy; a tap aimed at the owambe boarded a bus to
   Waterlines Junction. Search, or tap by name, never by position.
8. **A control's accessible name is not its label.** Matching buttons by role and
   name missed "Map", "Load buses" and the app icons; matching what the button
   *shows* found them.
9. **Watching the wrong game.** Half a session went into PH Lifestyle while the
   competitor that took the market was Lagos Life. The copycat taught two patterns
   (the kitchen, the three-way trip); the market leader taught the one that matters
   (§3.7). Play the leader first.
10. **"Reported" is not "observed".** Every player count in §1 is theirs; the
    three we saw ourselves are marked. The same goes for the save `PUT` in §3.9 —
    seen; what the server does with it — not seen.

---

## 12. If you only do three things

1. **Be public.** Put `ledger/` on a static host today. Today's life, the
   repercussions and F1 are shipped and nobody can play them.
2. **A1 — the effect before the tap.** Both competitors do it; we do it only
   afterwards. The engine already measures effects, so this is presentation, not
   simulation.
3. **A2 — consequences as institutions.** The deepest thing playing them
   revealed: a case lost for missing a hearing is a consequence you *remember*.
   We simulate tax risk, compliance, debt and a rival; give them a file, a date
   and a door.

---

### Sources

Press and creator: [Techpoint Africa](https://techpoint.africa/news/lagos-life-1m-players/) ·
[TechNext](https://technext24.com/reviews/lagos-life-1-million-players-nigerian-games/) ·
[WeeTracker](https://weetracker.com/2026/10/06/lagos-life-game-nigeria-browser-gaming-explodes/) ·
[Marie Claire NG](https://marieclaire.ng/shalom-rayhamen-turned-lagos-experiences-into-a-game) ·
[Arise](https://www.arise.tv/how-lagos-life-is-capturing-young-nigerians-online/) ·
[Vanguard](https://www.vanguardngr.com/2026/10/lagos-life-game-crosses-2-million-users-heres-how-to-play/) ·
[Okiki's Substack](https://iamnotokiki.substack.com/p/people-got-kidnapped-and-you-were) ·
[X: chat bandwidth thread](https://x.com/FavourYusuf1/status/2105939619858518333)

Their own pages: [lagoslife.app](https://lagoslife.app) ·
[lagoslife.app/stats](https://lagoslife.app/stats) ·
[lagoslife.app/terms](https://lagoslife.app/terms) ·
[phlifestyle.fun](https://www.phlifestyle.fun/)

Fan guides (unofficial): [lagoslifeguide.com](https://lagoslifeguide.com/) ·
[beginner guide](https://lagoslifeguide.com/beginner-guide/) ·
[make money](https://lagoslifeguide.com/make-money/) ·
[support](https://lagoslifeguide.com/support/)
