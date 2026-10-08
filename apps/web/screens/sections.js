/*
  Sections for the two routes whose cards come out of a built-in panel.

  Governance › Pack and Governance › Register are the odd ones out. Their screens
  are converted (`viewGovernance` draws the frame and its sub-tabs), and their
  cards arrive as markup from built-in panels — `viewPack` emits seven cards in
  one string, `viewRegister` one, `viewPromises` one, `viewDeed` one. A converted
  screen that arranges its own sections hands `Group` React elements; here there
  are no elements to hand, so the app has to do what core's grouping layer used
  to do: split the panels, match each card to the route's spec, and put the
  matched cards in the section they belong to.

  **The matching is core's rule, not a new one.** `groupLevel()` walks the markup
  one level at a time; at each level it reads every top-level card's heading,
  finds the first spec group (in spec order) whose pattern the heading STARTS
  with, claims the cards that match, and then marks those groups used so a deeper
  level cannot claim them again. A card no group names is emitted where it was.
  That is what is reproduced here, with core's own `splitTop()`, `cardTitle()` and
  `cardTag()` rather than a second HTML parser — the one thing this module must
  not do is disagree with the game about what a card is called.

  Two consequences of that rule are load-bearing and are why the function returns
  whole brackets rather than a flat list:

  - **Why the columns are separate levels.** In the built-in frame the columns of
    the `grid g2` are the levels: the register panel sits in one column, the
    promises and the deed panels in the other, so promise and deed cards are
    siblings at one level and both land in `Side deals`. A section is emitted
    where its FIRST member sits, which is what puts `Who owns what` in the left
    column and `Side deals` in the right.
  - **Why `used` is shared across columns.** A group claimed in an earlier column
    cannot be claimed again later, which is the same reason the string path never
    emits a section twice.

  A leftover card is returned as `{ html }` and stays where it was — on Pack that
  is the Promises card, which the spec does not name on that route.
*/
import { ROUTE_GROUPS, routeKey, splitTop, cardTitle, cardTag } from '@ledger/core';

/* Every top-level card of a panel's markup, in document order, recursing into
   wrappers exactly as `groupLevel()` does. */
function cardsIn(html) {
  const out = [];
  const walk = (h) => {
    for (const u of splitTop(h)) {
      if (u.tail !== undefined) continue;
      if (u.card) { out.push({ html: u.html }); continue; }
      walk(u.inner);
    }
  };
  walk(html);
  return out;
}

/* One route's arrangement: an array of columns, each an ordered list of items —
   `{ sect, html, tags, n }` for a section, `{ html }` for a card that stays put. */
export function arrangeRoute(route, columns) {
  const spec = ROUTE_GROUPS[route] || [];
  const used = new Set();

  /* A section belongs to one route. The bare Governance tab draws the same
     panels the Pack sub-tab draws, and the game groups only the route its spec
     names - so on the bare tab the cards stay in the order the panels emitted
     them, with no sections at all. Asking core which route is being drawn is the
     same question `Group` asks, for the same reason. */
  const here = typeof routeKey === 'function' ? routeKey() : null;
  const grouping = !here || here === route;

  return columns.map((html) => {
    const cards = cardsIn(html);
    if (!grouping) return [{ html: cards.map((c) => c.html).join('') }];
    const which = cards.map(() => -1);

    /* 1. claim. The first group, in spec order, whose pattern the card's heading
          starts with — skipping the groups an earlier level already claimed. */
    cards.forEach((c, i) => {
      const t = cardTitle(c.html).toLowerCase();
      if (!t) return;
      for (let g = 0; g < spec.length; g++) {
        if (used.has(g)) continue;
        const pats = spec[g].cards || [];
        for (let p = 0; p < pats.length; p++) {
          if (t.indexOf(pats[p].toLowerCase()) === 0) { which[i] = g; return; }
        }
      }
    });

    /* 2. a group is claimed by the whole level, not by the card: the string path
          only marks a group used once it has finished scanning, which is why two
          groups can never both take the same card and why the claim survives
          into the next column. */
    which.filter((g) => g >= 0).forEach((g) => used.add(g));

    /* 3. emit. A section appears where its first member sat; a card no group
          named appears where it was; the other members of a section do not
          appear again. */
    const items = [];
    cards.forEach((c, i) => {
      const g = which[i];
      if (g < 0) { items.push({ html: c.html }); return; }
      if (which.indexOf(g) !== i) return;
      const members = cards.filter((_, j) => which[j] === g).map((d) => d.html);
      items.push({
        sect: g,
        html: members.join(''),
        tags: members.map(cardTag).filter(Boolean),
        n: members.length
      });
    });
    return items;
  });
}
