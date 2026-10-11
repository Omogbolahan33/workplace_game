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
2. **Lagos first, real detail.** Zinc and louvres, burglar-proof bars, the GP
   tank on its stand, the generator and its smoke, power lines, harmattan dust,
   rain, NEPA taking light. Other cities get their own skins later (M10).
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
| M4 | The quarter as pictures | advancing is a short sequence of scenes from the three months that just happened, before any number | the quarter's digest and log |
| M5 | Moments | every event, arc and black swan has its own picture with its decision card under it: the sibling at the gate, the robbery, the wedding, the raid | the event decks, arcs, swans |
| M6 | What comes back | consequences you set in motion are seen on their way and arriving at your gate on the quarter they land | threads, pending, commitments |
| M7 | The boardroom | the cap table as who sits at the table, votes as hands, the bank's man watching the covenants | governance state |
| M8 | Your city | your footprint across real neighbourhoods: home, outlets, land, rentals | assets, outlets, property |
| M9 | People | the cast as people in your scenes, ageing; the rival across the street | `S.cast`, `S.rival` |
| M10 | Other cities | Abuja, Accra, Nairobi, London, New York skins for every scene | `S.city` |
| M11 | Screens become places | the remaining cards turn into taps on the scene and decision cards | every route |

Progress is measured with `tools/visual.mjs` (graphic against interface over the
whole page at 390×844) and by looking at the pictures.
