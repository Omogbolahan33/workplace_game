/*
  The public surface of @ledger/ui, written down.

  This file exists because of what happened twice in this migration. The app
  asked `@ledger/ui` for `installAvailable()` and got `undefined is not a
  function` — the ui's entry file forwards almost nothing by name, because
  `export * from './registry.js'` carries the registry's own two exports and not
  the four hundred names inside it. The comment that said otherwise cost an hour
  and a browser console to find. The same mistake was made again with
  `seasonCanScan()`, and this time the typecheck found it in the app before
  anybody pressed Scan.

  So an app does not read the ui's internals: it reads this. Everything a
  platform may call is here, and `.harness/types.js` checks both directions -
  every name declared here is really exported by index.js, and the app compiles
  against nothing else.

  Deliberately `any` where the value is a handle the app passes straight back
  (a drawer, a screens map): the app's own signature for those is checked where
  it is written, and re-declaring it here would be a second copy of the truth.
*/

/* ---- booting a platform --------------------------------------------------
 *
 * A platform mounts its shell, then installs the host and boots. `install()`
 * tells the ui where to draw (its own `el()`, `render()`, storage and network);
 * `boot()` restores a save or opens the start screen.
 */
export function install(): any;
export function boot(): any;

/* ---- who draws what ------------------------------------------------------
 *
 * Five seams, and each one answers the same question for a different region of
 * the page: screens, the route, the three pieces of chrome, the whole page. The
 * app declares what it draws; the ui asks before it writes markup.
 *
 *   overrideScreens(map)        screen name -> component renderer
 *   setBuiltinRenderer(fn)      the panels a converted screen embeds by name
 *   setRouteDrawer(fn | null)   draw the route, or let go of it
 *   setAppShell(map)            which pieces of chrome the app draws
 *   setShellDrawer(fn | null)   draw a piece of chrome
 *   setPageDrawer(fn | null)    draw the whole page
 *   setAppGroups(names)         routes whose screens arrange their own sections
 *   setAppRoutes(names)         routes the app assembles itself
 */
export function overrideScreens(map: Record<string, any>): number;
export function builtinScreen(name: string, ...args: any[]): string;
export function setRouteDrawer(fn: ((names: string[], host: Element) => boolean) | null): boolean;
export function setAppShell(map: Record<string, any>): number;
export function setShellDrawer(fn: ((piece: string | null, hosts: any) => boolean) | null): boolean;
export function setPageDrawer(fn: ((hosts: any) => boolean) | null): boolean;
export function setAppGroups(names: string[]): number;
export function setAppRoutes(names: string[]): number;

/* ...and the same questions asked back, for an app that wants to know before it
   draws rather than after. */
export function routeOwnership(): { owned: boolean, names: string[], why: string };
export function pageOwnership(): { owned: boolean, why: string };
export function shellOwnership(): string[];

/* ---- platform facts ------------------------------------------------------
 *
 * Two things a screen cannot know by itself: whether the browser can install
 * this game, and whether the device can point a camera at a QR code. The app
 * hands its own answers in through `setPlatformFacts`, and these are the ui's.
 */
export function installAvailable(): boolean;
export function seasonCanScan(): boolean;

/* ---- the registry --------------------------------------------------------
 *
 * `screenNames()` is every screen the ui knows, and `screenFor()` resolves one
 * by name. Both are the registry's own exports; the four hundred screens inside
 * it are not, deliberately - a platform reaches them through the host seam
 * (`view(name)`) or through `builtinScreen()`, never by importing one.
 */
export function screenNames(): string[];
export function screenFor(name: string): any;
export function exported(): any;
