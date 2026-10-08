/*
  Turn a flat package into ES modules.

  Every top-level declaration is exported; every name a file uses that lives
  elsewhere is imported explicitly; every name that lives outside the package
  entirely is a host slot and gets a shim (see packages/core/host.js).

  Parsed with acorn, not pattern-matched. A regex cannot tell a local variable
  from a module-level one, and importing a name a file declares three functions
  deep is a silent behaviour change.

  Two passes, because the shim file has to exist before anything imports it.

  Fails hard on a name that is neither declared, imported, a shim, nor a known
  global: a module graph with holes in it fails at run time, on a screen nobody
  has opened yet. And it fails if core touches the DOM, because "no DOM in
  core" is the premise the whole split rests on and an unchecked premise is
  just a hope.

  Run: node tools/tomodules.mjs packages/core/src
*/
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';

const dir = process.argv[2];
const OUT_ARG = process.argv.find(a => a.startsWith('--out='));
if (!dir) { console.error('usage: tomodules.mjs packages/ui/src --out=packages/ui/modules'); process.exit(1); }
/* keys are recorded as the path the bundler will look them up by */
const KIND = path.basename(path.dirname(dir));

/* packages/<kind>/src holds the sections and nothing else: it is what the
   single file is assembled from, so a module or a generated file in there would
   be bundled into the game. The host and the shims live one level up. */
const SHIM_FILE = 'host-shims.js';
/* Where the shim file gets the host object from. A package that owns a host.js
   imports it (`./host.js` beside the output, or `../host.js` one level up when
   the output is a modules/ dir); a package that borrows another package's host
   imports that package by name. Getting this wrong used to write an import of a
   file that does not exist - the ui's shim pointed at a host.js nobody has, and
   nothing noticed because nothing imported the shim yet. */
const _hostOut = OUT_ARG ? OUT_ARG.split('=')[1] : dir;
function hostSpec(){
  return (process.argv.find(a => a.startsWith('--host-spec=')) || '').split('=')[1]
    || (fs.existsSync(path.join(_hostOut, 'host.js')) ? './host.js'
      : fs.existsSync(path.join(_hostOut, '..', 'host.js')) ? '../host.js'
      : extSpec);
}
const SKIP = new Set();
const here = path.dirname(new URL(import.meta.url).pathname);
const hostSlots = JSON.parse(fs.readFileSync(path.join(here, 'host-slots.json'), 'utf8'));

/* A package can consume another package's exports: --external <file of names>
   --external-spec @ledger/core. Passing the names in rather than reading the
   other package's files keeps the dependency one-way and explicit. */
const extIdx = process.argv.indexOf('--external');
const external = extIdx > -1 && process.argv[extIdx + 1]
  ? new Set(Object.keys(JSON.parse(fs.readFileSync(process.argv[extIdx + 1], 'utf8')))) : null;
const extSpec = (process.argv.find(a => a.startsWith('--external-spec=')) || '').split('=')[1] || '@ledger/core';
/* the ui package exists to touch the DOM; core is forbidden from it */
const ALLOW_DOM = process.argv.includes('--allow-dom');
/* check only: report the graph, write the shims, leave the sources alone. The
   simulation is consumed as one module (packages/core/core.js) because it is
   one system - 50 of its sections reference each other - so rewriting those
   sections into ESM would be a lie about its shape. What is still worth doing
   on every build is finding names that do not resolve and DOM that has leaked
   into the simulation. */
const CHECK_ONLY = process.argv.includes('--check');

const GLOBALS = new Set(['Math', 'JSON', 'Date', 'Number', 'String', 'Boolean', 'Array', 'Object',
  'console', 'isNaN', 'isFinite', 'parseInt', 'parseFloat', 'undefined', 'NaN', 'Infinity',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'Promise', 'Map', 'Set', 'Error',
  'performance', 'requestAnimationFrame', 'encodeURIComponent', 'decodeURIComponent',
  'crypto', 'Intl', 'RegExp', 'Symbol', 'BigInt', 'globalThis', 'Function', 'Symbol']);
const DOM_GLOBALS = new Set(['document', 'window', 'localStorage', 'navigator', 'location',
  'alert', 'confirm', 'prompt', 'fetch', 'Blob', 'URL', 'Image', 'FileReader', 'HTMLElement',
  'Node', 'getComputedStyle', 'matchMedia', 'history', 'screen']);

const addNames = (d, out) => {
  if (!d) return;
  if (d.type === 'Identifier') out.push(d.name);
  else if (d.type === 'ObjectPattern') d.properties.forEach(p => addNames(p.value || p.argument, out));
  else if (d.type === 'ArrayPattern') d.elements.forEach(x => addNames(x, out));
  else if (d.type === 'AssignmentPattern') addNames(d.left, out);
  else if (d.type === 'RestElement') addNames(d.argument, out);
};

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !SKIP.has(f)).sort();

/* ---- read everything, and learn who declares what ---- */
const parsed = new Map(), topNames = new Map(), owner = new Map();
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const ast = acorn.parse(text, { ecmaVersion: 2022, locations: true });
  parsed.set(f, { text, ast });
  const names = new Set();
  for (const n of ast.body) {
    const tmp = [];
    if (n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') addNames(n.id, tmp);
    else if (n.type === 'VariableDeclaration') n.declarations.forEach(d => addNames(d.id, tmp));
    tmp.forEach(x => names.add(x));
  }
  topNames.set(f, names);
  names.forEach(x => { if (!owner.has(x)) owner.set(x, f); });
}

/* ---- pass one: what does each file need? ---- */
const used = (ast, topLevel) => {
  const declaredAnywhere = new Set(), refs = [];
  (function walk(n, parent, key) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'VariableDeclaration') {
      const tmp = []; n.declarations.forEach(d => addNames(d.id, tmp));
      tmp.forEach(x => declaredAnywhere.add(x));
    }
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' ||
        n.type === 'ArrowFunctionExpression') {
      const tmp = []; n.params.forEach(p => addNames(p, tmp));
      tmp.forEach(x => declaredAnywhere.add(x));
      if (n.id) declaredAnywhere.add(n.id.name);
    }
    if (n.type === 'ClassDeclaration' && n.id) declaredAnywhere.add(n.id.name);
    if (n.type === 'CatchClause' && n.param) {
      const tmp = []; addNames(n.param, tmp); tmp.forEach(x => declaredAnywhere.add(x));
    }
    if (n.type === 'Identifier') {
      const skip = parent && (
        (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) ||
        (parent.type === 'Property' && key === 'key' && !parent.computed && !parent.shorthand) ||
        (parent.type === 'MethodDefinition' && key === 'key' && !parent.computed) ||
        (parent.type === 'PropertyDefinition' && key === 'key' && !parent.computed) ||
        ((parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' ||
          parent.type === 'ContinueStatement') && key === 'label'));
      if (!skip) refs.push(n.name);
    }
    for (const k in n) {
      if (k === 'loc' || k === 'start' || k === 'end' || k === 'parent') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => walk(c, n, k));
      else if (v && typeof v.type === 'string') walk(v, n, k);
    }
  })(ast, null, null);
  return { declaredAnywhere, refs };
};

const shimmed = new Set();
const plan = new Map();
const unknown = [], dom = [];
for (const f of files) {
  const { text, ast } = parsed.get(f);
  const mine = topNames.get(f);
  const { declaredAnywhere, refs } = used(ast, mine);
  const local = new Set([...declaredAnywhere].filter(x => !mine.has(x)));
  const need = new Map(), externals = new Set();
  for (const u of refs) {
    if (mine.has(u) || local.has(u) || GLOBALS.has(u)) continue;
    /* A package's own names win over everything: `render` is a host slot in
       core and a real function here, and getting that order wrong made the UI
       import a shim of itself. */
    const o = owner.get(u);
    if (o && o !== f) {
      if (!need.has(o)) need.set(o, new Set());
      need.get(o).add(u);
      continue;
    }
    if (external && external.has(u)) { externals.add(u); continue; }
    if (u in hostSlots || /^view[A-Z]/.test(u) || /^render[A-Z]/.test(u)) {
      shimmed.add(u);
      if (!need.has(SHIM_FILE)) need.set(SHIM_FILE, new Set());
      need.get(SHIM_FILE).add(u);
      continue;
    }
    if (DOM_GLOBALS.has(u)) { if (!ALLOW_DOM) dom.push(f + ': ' + u); continue; }
    unknown.push(f + ': ' + u);
  }
  plan.set(f, { text, ast, need, externals });
}

/* ---- the shim file ---- */
const shimBody = [...shimmed].sort().map(n => {
  if (/^view[A-Z]/.test(n)) {
    /* the whole name goes to the host, not a prettified key: a translation
       step here is a table that can fall out of step with the router, and a
       screen that resolves to nothing renders as an empty page rather than an
       error - which is exactly what happened the first time this shipped */
    return `export function ${n}() { return host.view.apply(host, ['${n}'].concat([].slice.call(arguments))); }`;
  }
  const slot = hostSlots[n] || 'call';
  if (slot === 'call') return `export function ${n}() { return hostCalls.call('${n}', arguments); }`;
  if (slot.includes('.')) {
    const [obj, fn] = slot.split('.');
    return `export function ${n}() { return host.${obj}.${fn}.apply(host.${obj}, arguments); }`;
  }
  return `export function ${n}() { return host.${slot}.apply(host, arguments); }`;
}).join('\n');
const OUT = OUT_ARG ? OUT_ARG.split('=')[1] : dir;
fs.mkdirSync(OUT, { recursive: true });
/* Write into an empty directory. A module left over from a previous run is
   not harmless: when a section is renamed the old module keeps its old name,
   both get imported, and the stale one wins the resolution - which is how a
   `_syncing` that had moved into the ui went on being imported from
   @ledger/core, as a name core no longer exports, and the module build threw
   a SyntaxError instead of drawing the game. */
if (!CHECK_ONLY) {
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.js')) fs.rmSync(path.join(OUT, f));
  }
}
fs.writeFileSync(path.join(OUT, SHIM_FILE), `"use strict";
/* =========================================================================
   Generated by tools/tomodules.mjs — do not edit by hand.

   The simulation calls ${shimmed.size} things that live outside it: the drawn
   screens, the redraw, the toast, storage, and the two services it cannot own
   (the network and the URL a join link points at). Each is answered by the host
   object in host.js, which a platform installs at boot.
   ========================================================================= */
import { host, hostCalls } from '${hostSpec()}';

${shimBody}
`);

/* ---- pass two: write the modules ---- */
let imports = 0, exports = 0;
if (CHECK_ONLY) {
  fs.writeFileSync(path.join(dir, '..', 'graph.json'), JSON.stringify(
    Object.fromEntries([...plan].map(([f, v]) => [f, {
      needs: [...v.need].map(([o, ns]) => o + ': ' + [...ns].sort().join(', ')),
      externals: [...v.externals].sort()
    }])), null, 1));
  console.log('graph             : packages/core/graph.json');
  console.log('\nchecked only — packages/core/src is consumed as one module, not as ESM');
  process.exit(0);
}
const insertions = {};
for (const f of files) {
  const { text, ast, need, externals } = plan.get(f);
  need.delete(f);
  const header = [...need.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([o, ns]) => `import { ${[...ns].sort().join(', ')} } from './${o}';`);
  if (externals.size) {
    header.unshift(`import { ${[...externals].sort().join(', ')} } from '${extSpec}';`);
  }
  imports += header.length;

  const inserts = [];
  for (const n of ast.body) {
    const names = [];
    if (n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') addNames(n.id, names);
    else if (n.type === 'VariableDeclaration') n.declarations.forEach(d => addNames(d.id, names));
    if (!names.length) continue;
    inserts.push({ at: n.start, text: 'export ' });
    exports++;
  }
  let out = text;
  const marks = [];
  for (const ins of inserts.sort((a, b) => b.at - a.at)) {
    marks.push(ins.at);
    out = out.slice(0, ins.at) + ins.text + out.slice(ins.at);
  }
  const firstCode = ast.body.find(n => !(n.type === 'ExpressionStatement' && n.expression.type === 'Literal'));
  const at = firstCode ? firstCode.start : 0;
  const banner = '/* Generated from src/' + f + ' by tools/tomodules.mjs. Edit the section in src/, not this file. */\n';
  const importText = (header.length ? header.join('\n') + '\n\n' : '') + banner;
  out = out.slice(0, at) + importText + out.slice(at);
  /* into the generated directory, never over the source section: modules are
     a build artifact, the sections in src/ are what a person edits */
  fs.writeFileSync(path.join(OUT, f), out);
  /* recorded so the bundler can reverse every insertion exactly, instead of
     searching the code for the word "export" and hoping */
  /* Offsets in the file as it now stands. Each export insertion is applied
     back to front, so an insertion shifts only the ones after it; the import
     header then shifts all of them. Recording the raw AST offsets instead -
     which is what this did first - made the unwrap eat four characters at a
     time from wherever it looked. */
  const sorted = marks.sort((x, y) => x - y);
  insertions[KIND + '/src/' + f] = {
    importAt: at, importLen: importText.length,
    exports: sorted.map((x, i) => x + i * 'export '.length + importText.length)
  };
}
fs.writeFileSync(path.join(dir, '..', 'insertions.json'), JSON.stringify(insertions, null, 1));
/* what this package offers, for whoever consumes it */
const exportList = {};
for (const f of files) for (const n of topNames.get(f)) exportList[n] = 'src/' + f;
fs.writeFileSync(path.join(dir, '..', 'exports.json'), JSON.stringify(exportList, null, 1));

/* A generated registry of everything the modules export, so a consumer can
   look a name up without a hand-maintained table. Reading the package's index
   instead - which is what the first version did - sees only what the index
   re-exports, and a screen missing from that list renders as an empty page. */
{
  const mods = fs.readdirSync(OUT).filter(f => f.endsWith('.js') && f !== SHIM_FILE).sort();
  const reg = mods.map((f, i) => `import * as m${i} from './modules/${f}';`).join('\n');
  const merged = mods.map((f, i) => `  ...m${i}`).join(',\n');
  fs.writeFileSync(path.join(OUT, '..', 'registry.js'), `/*
  Generated by tools/tomodules.mjs — do not edit.

  Every export of every module in this package, merged into one object, so a
  name can be looked up without a list somewhere falling out of step with the
  code. ${mods.length} modules.
*/
${reg}

export const exported = {
${merged}
};

export function screenNames() {
  return Object.keys(exported).filter(k => /^view[A-Z]/.test(k) && typeof exported[k] === 'function').sort();
}
`);
  console.log('registry          : ' + mods.length + ' modules merged into registry.js');
}

/* ---- report ---- */
console.log(files.length + ' files · ' + exports + ' declarations exported · ' +
  imports + ' import statements');
console.log('host shims        : ' + shimmed.size + ' (in ' + SHIM_FILE + ')');
if (unknown.length) {
  console.log('\nUNRESOLVED (' + unknown.length + ') — neither declared, imported, a host slot, nor a global:');
  [...new Set(unknown)].forEach(u => console.log('  ' + u));
  console.log('\nEach one is a name to import, a global to allow, or a host slot to declare in');
  console.log('tools/host-slots.json. Hard stop: a module graph with a hole in it throws at');
  console.log('run time, on a screen nobody opened yet.');
  process.exit(1);
}
console.log('unresolved names : none');
if (dom.length) {
  console.log('\nDOM WHERE IT DOES NOT BELONG (' + dom.length + ') — the split boundary is wrong:');
  [...new Set(dom)].slice(0, 20).forEach(u => console.log('  ' + u));
  process.exit(1);
}
console.log('DOM in ' + (ALLOW_DOM ? 'ui (allowed)' : 'core      : none (asserted)'));
