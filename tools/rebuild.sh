#!/usr/bin/env bash
# Rebuild the modules and the single file from the package sources.
#
#   packages/{core,ui}/src/*.js   the sources: the game's sections, flat, in the
#                                 order they run. Hand-edited.
#   packages/core/core.js         generated: one module, the whole simulation
#   packages/ui/modules/*.js      generated: ES modules importing @ledger/core
#   dist/index.html               generated: the single file the game ships as
#
#   tomodules --check   resolves every name core uses (siblings, globals, host
#                       seam) and asserts core touches no DOM
#   makecore            core sections + host + shims -> core.js
#   tomodules           ui sections -> ui/modules/*.js
#   declared-changes    re-transcribes packages/changes.json from the reference
#                       and the sections, so the ledger's list of declared
#                       differences is never a hand-copied one
#   bundle              the sections back into one file, and measures it against
#                       reference/baseline-single-file.html
#
#   The last two steps are not optional and used to be missed: mkcheck copies
#   dist/index.html into .harness/check.js (the page script every gate drives)
#   and build.js turns that into .harness/mod.js. Without them, `npm test`
#   happily tests the *previous* build - which is how a gate can go on passing
#   about code that was edited an hour ago.
set -e
cd "$(dirname "$0")/.."
node tools/tomodules.mjs packages/core/src --check --out=packages/core
node tools/tables.mjs --verify
node tools/makecore.mjs
node tools/tomodules.mjs packages/ui/src --out=packages/ui/modules \
  --external packages/core/exports.json --external-spec=@ledger/core --allow-dom
node tools/declared-changes.mjs
node tools/bundle.mjs
node .harness/mkcheck.js
node .harness/build.js
node .harness/zip.js
node tools/supabase-sql.mjs
node tools/mobile.mjs
node tools/native-assets.mjs
node tools/faces.mjs
