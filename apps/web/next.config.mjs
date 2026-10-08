/*
  The game's two packages are ES modules in the workspace, so Next has to
  compile them rather than treat them as prebuilt dependencies.
*/
const nextConfig = {
  transpilePackages: ['@ledger/core', '@ledger/ui'],
  /* React 19 runs effects twice in development, and the game boots by
     attaching to the document once. Rendering twice is harmless but booting
     twice is not, so strict mode is off for the game and the boot is guarded
     as well. */
  reactStrictMode: false,
  /* the preview host this runs behind is not localhost */
  allowedDevOrigins: ['*.e2b.app', '127.0.0.1', 'localhost'],
  /* The build directory is overridable because a gate builds this app while a
     dev server may be running: two Next processes sharing one `.next` fight
     over it, and the loser is whichever the player is looking at. The gate
     builds into `.next/gate` — inside `.next`, so it is ignored by git and by
     any archive of the workspace; a deploy leaves this unset and gets `.next`. */
  distDir: process.env.LEDGER_DIST_DIR || '.next',
  /* the service worker and the manifest must not be cached by the browser, or a
     deploy ships new code behind an old worker for a day */
  async headers() {
    return [
      { source: '/sw.js', headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' } ] },
      { source: '/manifest.webmanifest', headers: [
        { key: 'Cache-Control', value: 'no-cache' },
        { key: 'Content-Type', value: 'application/manifest+json' } ] }
    ];
  }
};
export default nextConfig;
