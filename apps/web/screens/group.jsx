/*
  Group — one collapsible section of a screen, as a component.

  Grouping used to be a markup post-processor. `routeView()` built the route as
  a string, `groupRoute()` parsed it, matched each top-level card's heading
  against the route's spec, and rebuilt the string with `<div class="card sect">`
  wrappers around the members and their key figures promoted onto the collapsed
  headers. That worked because there was one renderer and it produced markup.
  It cannot work on a React tree — there is no string to post-process — which is
  why eleven of the twenty-nine routes were still drawn by markup with every one
  of their screens converted.

  So grouping moves into the screen. A converted screen that arranges its own
  sections renders

      <Group route="overview" i={2}>
        <ViewPulse />
        <ViewPressure />
      </Group>

  and this component draws exactly what `sect()` drew: the same wrapper classes,
  the same header button with the same `data-a="toggrp"` and the same
  `data-k="route.index"` (so core's own toggle handler works untouched), the
  same chevron, the same member count when there is more than one, the same
  promoted key figures on a collapsed header, the same note, and no body at all
  when it is collapsed.

  **The spec stays core's.** Title, note, whether it starts open, how many
  members it has and which cards belong to it come from `ROUTE_GROUPS`, the same
  table the string path reads. The port decides *where* the section sits and
  *which* cards go in it; the spec decides everything a player reads. That is
  the point: there is one description of what groups exist, and two renderers of
  it, and `.harness/react-route.js` compares them card for card on every route.

  **Cards that live inside a built-in panel.** Two routes — Governance › Pack
  and Governance › Register — keep their cards in a string built by core, and the
  app matches those cards to the spec itself. There the members arrive as markup
  rather than as elements: `html` is the members' markup already joined, and `n`
  is how many members that is. The body is put on `.sectBody` itself (or on the
  `grid g2` inside it), never in a wrapper div, because a wrapper div would be a
  box the game does not have — the string path's cards are direct children of the
  section body and the layout is entitled to say so.

  Two more things are passed in rather than derived, and both are deliberate:

  - **`tags`** — the key figures shown on a collapsed header. The string path
    reads them out of the member cards' `<h3>` tags at grouping time. This
    component cannot: when it is collapsed its members are not rendered, which
    is the whole point of being collapsed (§ the cards are not in the markup).
    So the port passes the same strings its cards show, and the route comparison
    gate checks them against both the cards and the string path.
  - **the member count** comes from the children it was handed, because the port
    composing a section is exactly the statement "these cards are its members".
    A React child that is not an element (a conditional that resolved to false)
    is not a member, which matches the grouping layer's behaviour of only
    counting cards it actually found.

  **The layout is the spec's too.** `groupLevel()` wraps a group's body in
  `<div class="grid g2">` when the spec says `layout:'g2'`, and the members then
  sit in two columns. That is a decision about the *section*, not about the
  screen, so it belongs here with the rest of the spec - a port that wrapped its
  own members in a grid would look right and count wrong, because a grid is one
  child and four cards are four members.

  **A section belongs to one route.** The same screens are on more than one
  route - Money and Money > Markets are both the Portfolio card and the Markets
  card - and core groups only the route its spec names, so the bare tab route
  draws them as two plain cards with no sections at all. A converted screen that
  always wrapped itself in its section would put headers on a route the game does
  not put headers on, which is a change to a screen the player reads plus a lie
  about who grouped it. A component cannot know which route it is being drawn on,
  so it asks: the current route is core's own `routeKey()`, and a group whose
  route is not the current one renders its children unwrapped.

  A group whose spec is missing renders its children unwrapped and says so once:
  a stale spec should degrade to ungrouped, not to a crash and not to silence.
*/
import { Children, isValidElement } from 'react';
import { ROUTE_GROUPS, S, UI, routeKey, worldGlyph } from '@ledger/core';

const warned = new Set();

/* The rail's "take me there" points at a card. The string path opens whichever
   group is hiding that card, because a target the player cannot see is worse
   than no target - and the group only opens if the player has not already
   decided about it themselves (`S.grp` wins over everything). */
function focusOpens(spec) {
  const f = String((UI && UI.focus) || '').toLowerCase();
  if (!f) return false;
  return (spec.cards || []).some((p) => String(p).toLowerCase().indexOf(f) >= 0);
}

/* The prop contract, written down, because everything that renders a section
   goes through this component and TypeScript reads this as the type of every
   call site. `route` and `i` are required - a section that does not say which
   section it is, is a section that cannot be checked against ROUTE_GROUPS -
   and everything else is what a *specific* way of rendering it needs:

     tags    the key figures on a collapsed header (elements as children)
     html    members as markup, from a built-in panel, with n marking how many
     n       how many members that markup holds
     children  the members as elements, n derived from what is an element

   Two ways to hand over members and only one of them is used at any call site,
   which is why the pairs are optional and checked by the component. */
/**
 * @param {{ route: string, i: number, tags?: string[], html?: string, n?: number, children?: any, key?: any }} props
 */
export default function Group({ route, i, tags, html, n, children }) {
  const groups = ROUTE_GROUPS[route];
  const spec = groups && groups[i];
  /* the members, in whatever shape they arrived: elements, or markup from a
     built-in panel. Used by every branch that renders them without a section. */
  const unwrapped = html !== undefined
    ? <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />
    : <>{children}</>;

  if (!spec) {
    const key = route + '#' + i;
    if (!warned.has(key)) {
      warned.add(key);
      console.warn('Group: no group ' + i + ' on route "' + route + '" in ROUTE_GROUPS, so ' +
        'these cards are rendered ungrouped. The spec and the screen have drifted apart.');
    }
    return unwrapped;
  }

  /* not my route: the game does not group these cards here, so neither do I */
  const here = typeof routeKey === 'function' ? routeKey() : null;
  if (here && here !== route) return unwrapped;

  const members = Children.toArray(children).filter(isValidElement);
  /* how many members there are: the elements handed in, or - when the members
     are markup from a built-in panel - the count the screen matched */
  const count = html !== undefined ? (n || 0) : members.length;
  const body = html !== undefined
    ? (spec.layout === 'g2' ? '<div class="grid g2">' + html + '</div>' : html)
    : null;

  /* A group with nothing in it is not a group. The string path never emits one -
     `groupLevel()` only wraps a section around members it actually matched - and
     this is the same rule: an agenda with nothing waiting on you renders nothing,
     so its section renders nothing either. Without this the card-free header sat
     on the screen saying "Waiting on you" about nothing at all. */
  if (!count) return null;

  const id = route + '.' + i;
  /* the same rule as core's: while the explanations are folded away the
     first section opens and the rest start closed, unless "take me there"
     named a card in one */
  const open = (S.grp && (id in S.grp)) ? !S.grp[id] : ((!!spec.open && (!!UI.details || i === 0)) || focusOpens(spec));
  /* a section folded only by the world-first default shows its picture and
     title, not figures - the same rule as core's */
  const list = (spec.open && !(S.grp && (id in S.grp))) ? [] : (tags || []).filter(Boolean);
  const shown = list.slice(0, 3);

  return (
    <div className="card sect">
      <button className="sectHead" data-a="toggrp" data-k={id}>
        <span className="sectchev">{open ? '\u25be' : '\u25b8'}</span>
        <span className="gfx sico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: worldGlyph(spec.t) }} />
        <b>{spec.t}</b>
        {count > 1 ? <span className="tag">{count}</span> : null}
        {!open && shown.length
          ? <span className="secttags">{shown.join(' \u00b7 ')}{list.length > 3 ? '+' + (list.length - 3) : ''}</span>
          : null}
        {spec.note ? <span className="sectnote">{spec.note}</span> : null}
      </button>
      {open ? (
        body !== null
          ? <div className="sectBody" dangerouslySetInnerHTML={{ __html: body }} />
          : (
            <div className="sectBody">
              {spec.layout === 'g2' ? <div className="grid g2">{children}</div> : children}
            </div>
          )
      ) : null}
    </div>
  );
}
