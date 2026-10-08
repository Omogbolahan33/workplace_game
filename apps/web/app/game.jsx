'use client';
/*
  The game, mounted once, into the shell React rendered.

  The shape of this file is the shape of the migration: React owns the page and
  the shell; the game's screens are still the imperative renderers they always
  were, and they fill in the containers below. Screens move over one at a time
  behind host.view(name) - core asks for a screen by name and does not care who
  answers - so converting Work, say, is a change to this app and to nothing
  else.

  Everything here is deliberately client-side. The game's UI package touches
  document at import time, which is what a DOM renderer does; it has no business
  running on a server, and it never will.
*/
import './boot-flag.js';
import { useEffect, useRef, useState } from 'react';

export default function Game() {
  const booted = useRef(false);
  const [state, setState] = useState('loading');

  useEffect(() => {
    if (booted.current) return;          /* React may mount twice in dev */
    booted.current = true;
    let cancelled = false;
    (async () => {
      try {
        const ui = await import('@ledger/ui');
        /* the shell module first: it re-exports the screens, so the two imports
           below are one graph and the app's own draws are in hand before
           anything is wired to them */
        const { drawShell, drawPage, drawRoute, shellPieces } = await import('../shell/index.jsx');
        /* the screens this app renders itself, before anything can ask for one */
        const { converted, convertedNames, groupedRoutes, composedRoutes, setBuiltinRenderer, setPlatformFacts } =
          await import('../screens/index.jsx');
        ui.overrideScreens(converted);
        /* converted screens are sometimes containers around unconverted panels:
           they ask for those by name, and this is what answers */
        setBuiltinRenderer((name, ...args) => ui.builtinScreen(name, ...args));
        /* and the few facts about this platform that a screen renders from */
        setPlatformFacts({
          canInstall: () => ui.installAvailable(),
          canScan: () => ui.seasonCanScan()
        });
        /* and the route drawer: when every screen on a route is converted, this
           app draws the whole route and keeps it, so a change of state is a
           re-render of a live tree rather than a replacement of the page */
        ui.setRouteDrawer(drawRoute);
        /* and the shell: the header, the tab strip with its second level and the
           screen hint. With one exception - the modal, which is not converted
           yet and says so in shellPieces - every piece of chrome is drawn by this
           app, and the ui asks for it whenever it would have written it */
        ui.setAppShell(shellPieces);
        ui.setShellDrawer(drawShell);
        /* and the loop itself: with all three pieces of chrome and the route the
           app's, the page is drawn by the app in one place, and the ui writes no
           markup at all - it does the page-level work underneath (bindings,
           disclosure, scroll, focus), which is about the page rather than about
           who filled it in */
        ui.setPageDrawer(drawPage);
        /* the routes whose converted screens arrange their own sections, so a
           route that core used to have to group can be drawn by React whole */
        ui.setAppGroups(groupedRoutes);
        ui.setAppRoutes(composedRoutes || []);
        if (convertedNames.length) {
          console.log('screens served by React: ' + convertedNames.join(', '));
        }
        ui.install();                    /* the host can draw now */
        ui.boot();                       /* restore the save, or open the start screen */
        if (!cancelled) setState('ready');
      } catch (err) {
        console.error('ledger failed to start', err);
        if (!cancelled) setState('failed:' + (err && err.message));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {state !== 'ready' && (
        <div style={{
          position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
          background: '#080b10', color: '#8a97a8', font: '13px system-ui', zIndex: 9999
        }}>
          {state.startsWith('failed')
            ? 'The game failed to start: ' + state.slice(7)
            : 'Loading…'}
        </div>
      )}
    </>
  );
}
