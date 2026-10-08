/* Shared simulation seam for every gate that drives the game loop.

   dom.js installs a stub DOM; mod.js is the page script extracted from
   index.html by build.js. This module is the thin join between them: require
   both in the right order, switch animation off so no gate ever waits on a
   five-second quarter transition, and re-export the game surface.

   It is infrastructure, not scratch — nine gates require it by name. */
require('./dom.js');
const M = require('./mod.js');
try { M.UI.noAnim = true; } catch (e) {}
module.exports = M;
