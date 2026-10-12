# LEDGER, seen — the visual brief and the roadmap

This is the reference every visual change is checked against. If a screen, a
picture or an animation does not serve what is below, it does not ship.

## What the pictures are for

LEDGER is *a life in decisions*: every quarter you commit something you cannot
take back, and it compounds for thirty years. The people remember. The bill
arrives late. The score that matters at 65 is freedom.

So the game shows **real, vivid pictures of what is happening in your life** —
and because every one of them is drawn from the game's state, you can watch the
life compound: the single room becomes a flat, the flat a house in an estate;
the kiosk becomes a shop, the shop a chain; the children grow; your hair greys.
Nothing in a picture is decoration and nothing is random. If it is drawn, it is
true of your run.

What players accepted in Lagos Life and PH Lifestyle — a person in a real place,
your things and your people visible, acting on the place, consequences with
faces — is the grammar. What LEDGER adds is **time**: a picture of the same
place on Q1 and on Q90 is two different lives.

## The rules

1. **Drawn from state, never random.** Every layer is a reading of the run.
2. **Each city as itself, real detail.** Zinc and louvres, burglar-proof bars,
   the GP tank on its stand, the generator and its smoke, power lines,
   harmattan dust, rain, NEPA taking light in Lagos; slate, sash windows,
   street lamps and snow where those are the truth. `CITY_SKINS` holds it.
3. **Pictures replace dashboards, not decisions.** Words appear at the moment
   of choice: a decision card with what it costs, the hours, the effect, the
   odds, and *when it comes back*.
4. **Drawn in code, layered.** Scenes are SVG built from layers so they follow
   the state exactly and stay offline. Photographs are not used for your life:
   they cannot show your state, rarely match each other, and the freely
   licensed ones of Lagos are mostly of real, identifiable residents.
5. **One function, both renderers.** Every picture is a core function that
   returns markup; the single file and the app draw the same one.

## Roadmap

Each milestone ships on its own, is measured, and is pushed and deployed. ✓ marks what has shipped.

| | milestone | what you see | driven by |
|---|---|---|---|
| **M1** ✓ | **Your home** | the place you live, behind every screen: room → flat → duplex → estate house; generator, solar, car(s); spouse, children, household staff; the grid, the season, the era, the time of day | housing spend against the city's need, goods, marriage and children, `S.house`, `S.mkt.power`, the quarter, the era, the clock |
| **M2** ✓ | Retire the 3D city | the districts, roads and generic buildings go, with three.js (~480 KB) and the walking characters | — |
| **M3** ✓ | Your work | employed: the office tower, your desk a floor higher with each promotion; your own company: premises by type and stage — buka → restaurant → chain, two bikes → truck depot, laptop at home → office floor, workshop → factory; staff at stations, customers through the door, a second shift lit at night, outlets as more premises | job and level, `BIZ` type, stage, staff, demand, capacity, quality, commitments, outlets |
| **M4** ✓ | The quarter as pictures | advancing shows up to four pictures of the three months that just happened — your home with what changed (a move, a wedding, a birth, a car), your work with the line that mattered there, the person whose news it was, the headline if the world turned — leading the advance screen, with the figures counting under them (the figures start at once, so the money is never hidden) | the snapshot before and after, the journal, the digest |
| **M5** ✓ | Moments | every event, story arc and black swan has its picture above its choices: the place it happens (your home or work, an event hall, the hospital, a government office, the bank, the court, a church, a school, the airport, a plot of land, the street, the market, a boardroom, the paper), the people in it (the person a story is with, in their own colours) and what is in hand | `MOMENTS`, the event decks, arcs, swans |
| **M6** ✓ | What comes back | what you set in motion walks up the road to your door behind every home screen, nearer the sooner it lands, carrying a letter or money, the news's colour above it; the road ahead strip (now to eight quarters) leads Coming back to you and is never folded away; when it lands, the Consequences arrive card shows it at your gate | `comingBack()`: pending consequences and committed deals |
| **M7** ✓ | The boardroom | behind every Governance screen: the board at the table with chairs as big as their stakes, the register framed on the wall with your share in gold, hands up for the open resolution and arms folded against it, the chair's mark, and the bank's man by the window with his folder - red, and a warning, when a covenant is breached | the register, the board, open resolutions and each director's stance, covenants |
| **M8** ✓ | Your city | behind Money's position, markets, deals and group screens, Lagos from above - the lagoon, the islands, the peninsula, the Atlantic, Third Mainland and the link bridge - with a pin for everything you own where it stands: your home in a neighbourhood that fits it, each company where its trade lives, every branch, land, a rental, money on Marina; each pin as big as what stands behind it. Budget and property stay at home | `cityLook()`: home tier, companies and outlets, assets, cash |
| **M9** ✓ | People | the People screen is everyone gathered in your compound - you and your household in the middle, the cast as close as they feel, the cold with arms folded, the hostile at the edge, the dead on an easel - each in their own colours, grey with age, in agbada once they have money, with a stick past seventy; at home, whoever a story is open with is at your gate; at work, the rival's place is across the street, as big as their business, with them outside when they want a fight | `S.cast`, `S.threads`, `S.rival` |
| **M10** ✓ | Other cities | each city has its own skin in every scene - seasons (harmattan and the rains, Nairobi's cool months, a London winter, New York snow), its word for the lights going off (or none), zinc or slate, louvres and bars or sash windows, the water on the roof, poles or street lamps, its landmark - and its own map behind the money screens: the lagoon and the Atlantic, Jabi Lake and Aso Rock, the Gulf of Guinea, Nairobi National Park, the Thames, the Hudson and the East River, with homes and trades in their own neighbourhoods | `CITY_SKINS`, `CITY_MAPS`, `S.city` |
| **M11** — first step ✓ | Screens become places | the scene is a place you can tap: the house opens the budget, the generator, solar and cars what you own, you your own card, a person (in the gathering or at your gate) their card, your premises the business, the rival's place the rival, the boardroom's table, register and bank's man their screens, a pin on the map what it stands for. Next: more of each screen's decisions as cards opened from the scene, until the sheet holds only what has no place | every route |

Progress is measured with `tools/visual.mjs` (graphic against interface over the
whole page at 390×844) and by looking at the pictures.
