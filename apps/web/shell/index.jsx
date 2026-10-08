/*
  The app's shell drawer.

  @ledger/ui asks who draws the chrome around the route. This is the answer, and
  it is the same arrangement as the route drawer one level up: the app declares
  which pieces it draws (`setAppShell`), the ui asks for a piece whenever it
  would have written that piece's markup (`setShellDrawer`), and this renders it
  from live state into the container it is handed.

  The ui calls in on three occasions, and all three are "the markup was about to
  be written":

    render()                 - every render
    renderTop()/renderWhy()  - called directly by actions (the bell, the hint)
    setShellDrawer(null)     - the app is being let go of

  A piece the app does not claim is never asked for, so the modal can stay markup
  while the header is React - which is what makes this land one piece at a time
  rather than all at once.

  **A container can hold more than one screen but only one root.** The tab strip
  is three containers - `#tabs`, `#subs`, `#why` - and they belong to one piece,
  so each gets its own root, mounted and released together. The alternative,
  portals, would need a detached container somewhere in the document to root
  them all in, which is a node in the page that has no reason to exist.

  **The host-level facts stay with whoever owns the container.** React owns the
  *children* of the container it is rooted in, not the container: whether the
  second level is hidden, and whether the hint's host carries `open`, are
  attributes on the hosts themselves and this sets them, reading the same core
  state the string path reads (`subsFor`, `UI.whyOpen`). Nothing here decides
  what either thing means; it copies the two lines the string path writes.

  Stamps, like the route drawer's: each container carries `data-react-shell` with
  the name of the piece in it, so a check outside the app can ask the DOM who
  drew the chrome instead of trusting a list. They are removed on release: a
  claim left on a container the markup builder has just filled is a claim that is
  now false.
*/
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { UI, subsFor } from '@ledger/core';
/* the app asks the ui who owns the route rather than being told: the drawer the
   ui holds answers by drawing, and a question that draws is not a question */
import { routeOwnership } from '@ledger/ui';
import { drawRoute } from '../screens/index.jsx';
/* the route drawer is part of the page, so it goes out the same door: an app or a
   gate that wants the page wants the whole page, and two imports of the screens
   would mean two copies of the component map */
export { drawRoute, converted, groupedRoutes, composedRoutes } from '../screens/index.jsx';
import { Top, Tabs, Subs, Why } from './top.jsx';
import Modal from './modal.jsx';

/* container element -> { root, piece } */
const mounted = new Map();

function draw(el, piece, node) {
  if (!el) return false;
  let rec = mounted.get(el);
  if (!rec) {
    el.innerHTML = '';                  /* a React root starts from an empty container */
    rec = { root: createRoot(el), piece };
    mounted.set(el, rec);
  }
  /* flushSync, because the host contract is synchronous: core asks for the
     header and the header has to be in the DOM when the call returns */
  flushSync(() => rec.root.render(node));
  el.setAttribute('data-react-shell', rec.piece);
  return true;
}

function release() {
  mounted.forEach((rec, el) => {
    flushSync(() => rec.root.unmount());
    el.removeAttribute('data-react-shell');
  });
  mounted.clear();
  /* the page claim goes with them: an attribute on <body> that says the app drew
     the page, left there after the markup builder took it back, is a claim that
     is now false - and a false claim in the DOM is worse than no stamp at all */
  if (typeof document !== 'undefined' && document.body) document.body.removeAttribute('data-react-page');
  return false;
}

export function drawShell(piece, hosts) {
  if (!piece) return release();

  if (piece === 'top') return draw(hosts, 'top', <Top />);

  if (piece === 'tabs') {
    const subs = subsFor(UI.tab);
    const none = !subs || subs.length < 2;
    /* the second level: hidden rather than absent when the tab has none, which
       is what the string path does - the host keeps its place in the row */
    if (hosts.subs) hosts.subs.style.display = none ? 'none' : '';
    if (hosts.why) hosts.why.className = UI.whyOpen ? 'open' : '';
    draw(hosts.tabs, 'tabs', <Tabs />);
    draw(hosts.subs, 'subs', <Subs subs={none ? [] : subs} />);
    return draw(hosts.why, 'why', <Why />);
  }

  if (piece === 'modal') {
    draw(hosts, 'modal', <Modal host={hosts} />);
    /* the modal's DOM work that cannot be a render: React is rooted on the host,
       so the component is handed the element and does the rest itself */
    return true;
  }

  /* not a piece this app draws yet: the ui keeps it, and the markup is drawn as
     it always was. Saying so by returning false rather than throwing is the
     difference between "not converted" and "converted and broken". */
  return false;
}

export const shellPieces = { top: true, tabs: true, modal: true };

/* ---- the page -----------------------------------------------------------

   The loop, composed by the app instead of by the ui. Four draws in one place,
   in an order a component tree can express, so the ui writes no markup at all on
   this path:

       the header   (the pieces above)
       the strip, its second level and the hint
       the route    - only when the route is the app's to draw, which is the
                      question routeOwnership() answers, asked here rather than
                      through a drawer that would have to draw to answer it
       the modal

   **If the route is not the app's, this returns false and nothing is drawn.**
   That is deliberate and it is the safety property of the whole seam: the markup
   path then draws the page piece by piece - the same three shell pieces, which
   the app still answers for, plus the route as markup - so an unconverted route
   (there are none today, and there will be one the moment someone adds a screen)
   degrades to exactly the behaviour the game had before any of this existed. */
export function drawPage(hosts) {
  const own = routeOwnership();
  if (!own.owned) return false;
  drawShell('top', hosts.top);
  drawShell('tabs', { tabs: hosts.tabs, subs: hosts.subs, why: hosts.why });
  drawRoute(own.names, hosts.main);
  drawShell('modal', hosts.modal);
  /* one stamp for the whole page, so a check outside the app can ask who built
     it rather than inferring it from four containers being stamped */
  if (typeof document !== 'undefined' && document.body) document.body.setAttribute('data-react-page', '1');
  return true;
}
