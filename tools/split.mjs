/*
  Split the single-file build into packages/core and packages/ui.

  Uses acorn for structure - a regex or a hand-rolled brace counter cannot know
  where a template literal ends, and both of the earlier attempts got it wrong
  in ways that still produced a byte-identical rebuild and would only have hurt
  later. Every statement's exact span comes from the AST.

  Two guarantees:
    - the pieces reassemble to the original script character for character
      (checked here, then again by tools/bundle.mjs)
    - anything deleted on the way is declared in DELETIONS below, so the source
      of every difference from the original is a thing someone wrote down
*/
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';

const ROOT = path.join(import.meta.dirname, '..');
/* The file the player had before any of this started. It is never written to
   again: ledger/index.html and dist/index.html are outputs now, so reading
   this from them would mean reading yesterday's build as tomorrow's source. */
const BASELINE = path.join(ROOT, 'reference', 'baseline-single-file.html');
const html = fs.readFileSync(BASELINE, 'utf8');

/* ---- it refuses to run by accident ----
   This script overwrites packages/{core,ui}/src/* from the baseline. That was
   the right thing once, when the sections did not exist yet. It is the wrong
   thing now: every hand edit to a section lives in those files, and the copy in
   packages/flat is only the record of what the module converter was handed.
   Running it without the flag used to silently revert an afternoon. */
/* It also refuses to run from anywhere but the workspace root, because ROOT
   below is a constant rather than a relative path. Running it "in a copy of
   the workspace" - which is what it looks like you are doing, since the script
   is right there in the copy - rewrites the real sections and reverts every
   hand edit, including the ones in packages/flat. That happened, once: a
   throwaway-copy test reverted the four setters, the boot guard and eighteen
   disabled-control reasons, and the only reason it was recoverable is that
   every one of them was declared in packages/changes.json with its full text
   (tools/apply-changes.mjs puts them back). */
if (process.cwd() !== ROOT) {
  console.error(
    'tools/split.mjs writes to ' + ROOT + ' — not to the directory it is run from.\n' +
    '\n' +
    '  you are in : ' + process.cwd() + '\n' +
    '  it writes  : ' + ROOT + '\n' +
    '\n' +
    'Running it from a copy of the workspace re-cuts the real sections from the\n' +
    'baseline and reverts every hand edit. If that is genuinely what you want,\n' +
    'run it from ' + ROOT + ' — do not experiment on the original from a copy.');
  process.exit(1);
}

if (!process.argv.includes('--bootstrap')) {
  console.error(
    'tools/split.mjs is bootstrap-only: it rewrites packages/*/src from the\n' +
    'reference file and would revert every hand edit to the sections.\n' +
    '\n' +
    '  to cut the sections again from scratch   : node tools/split.mjs --bootstrap\n' +
    '  to turn the sections into modules        : bash tools/rebuild.sh\n' +
    '  to remove a fragment on purpose          : declare it in packages/changes.json\n');
  process.exit(1);
}

/* ---- declarations that do not survive the move, and why ---- */
const DELETIONS = [{
  name: 'ownerTime (the first one)',
  match: `export function ownerTime(){\n  if(!S.p.job) return 1.0;\n  return S.flags.moonlight ? 0.62 : 0.32;\n}\n`.replace('export ', ''),
  replacement: `/* A SECOND ownerTime() was declared after this one and shadowed it: in the
   flat build a later function declaration of the same name simply overwrote
   the earlier one, so this was dead code no gate could see. Deleted rather
   than kept, and safe to delete - the surviving version returns the same value
   when handed no business. This is the class of bug a module boundary finds
   for free. */
`,
  why: 'shadowed by a later declaration of the same name; nothing could call it'
}];

/* ---- shell, styles, script ---- */
const st = html.indexOf('<style>') + 7;
const en = html.indexOf('</style>');
const css = html.slice(st, en);
const si = html.lastIndexOf('<script>') + 8;
const sj = html.lastIndexOf('</script>');
const source = html.slice(si, sj);

let js = source;
const applied = [];
for (const d of DELETIONS) {
  if (!js.includes(d.match)) { console.log('DELETION NOT FOUND: ' + d.name); process.exit(1); }
  /* function replacer: a replacement string is not inert, `$&` and friends
     mean something to String.replace, and this file is full of them */
  const m = d.match, r = d.replacement;
  js = js.replace(m, () => r);
  applied.push({ name: d.name, why: d.why, chars: r.length - m.length });
}
/* first extraction only: from here on the shell and the stylesheet are
   hand-written files in the ui package, and rewriting them from the baseline
   would throw away every edit made since */
const tplPath = path.join(ROOT, 'packages', 'ui', 'index.template.html');
if (!fs.existsSync(tplPath) || process.argv.includes('--force')) {
  fs.mkdirSync(path.join(ROOT, 'packages', 'ui'), { recursive: true });
  fs.writeFileSync(tplPath, html.slice(0, st) + '<!--STYLES-->' + html.slice(en, si) + '<!--SCRIPT-->' + html.slice(sj));
  fs.writeFileSync(path.join(ROOT, 'packages', 'ui', 'styles.css'), css);
  console.log('extracted the shell and the stylesheet into packages/ui');
}

/* ---- parse ---- */
const comments = [];
const ast = acorn.parse(js, { ecmaVersion: 2022, locations: true, onComment: comments });
comments.sort((a, b) => a.start - b.start);

const DOM = /^(document|window|localStorage|navigator|alert|confirm|prompt)$/;
function touchesDom(node) {
  let hit = false;
  (function walk(n) {
    if (hit || !n || typeof n.type !== 'string') return;
    if (n.type === 'Identifier' && DOM.test(n.name)) hit = true;
    if (n.type === 'MemberExpression' && !n.computed && n.property && n.property.type === 'Identifier' &&
        /^(getElementById|querySelector|querySelectorAll|innerHTML|outerHTML|textContent|className|classList|style)$/.test(n.property.name)) hit = true;
    for (const k in n) {
      if (k === 'loc' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v);
    }
  })(node);
  return hit;
}
function addNames(d, out) {
  if (!d) return;
  if (d.type === 'Identifier') out.push(d.name);
  else if (d.type === 'ObjectPattern') d.properties.forEach(p => addNames(p.value || p.argument, out));
  else if (d.type === 'ArrayPattern') d.elements.forEach(x => addNames(x, out));
  else if (d.type === 'AssignmentPattern') addNames(d.left, out);
  else if (d.type === 'RestElement') addNames(d.argument, out);
}
function namesDeclared(node) {
  const out = [];
  if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') addNames(node.id, out);
  else if (node.type === 'VariableDeclaration') node.declarations.forEach(d => addNames(d.id, out));
  return out;
}

/* each statement owns the text from the previous statement's end, so the
   comments in between travel with the code they describe */
const stmts = ast.body.map((n, i) => {
  const lead = i === 0 ? 0 : ast.body[i - 1].end;
  return {
    node: n, lead, nodeStart: n.start, start: lead, end: n.end,
    text: js.slice(lead, n.end),
    names: namesDeclared(n),
    ui: touchesDom(n) || namesDeclared(n).some(x => /^(view|render)[A-Z]/.test(x))
  };
});
{
  const last = ast.body[ast.body.length - 1];
  if (last.end < js.length) {
    const t = stmts[stmts.length - 1];
    t.text += js.slice(last.end);
    t.end = js.length;
  }
}

const sectionTitle = i => {
  const from = stmts[i].lead, to = stmts[i].nodeStart;
  const before = comments.filter(c => c.end <= to && c.start >= from);
  const last = before[before.length - 1];
  if (!last) return null;
  const raw = js.slice(last.start, last.end).replace(/\/\*+|\*+\//g, ' ');
  const line = raw.split('\n').map(s => s.trim()).filter(s => s.length > 6 && !/^=+$/.test(s))[0];
  return line ? line.replace(/^Section\s+\d+[a-z]?[:.]\s*/i, '').slice(0, 40) : null;
};
const isSection = i => {
  const from = stmts[i].lead, to = stmts[i].nodeStart;
  return comments.some(c => c.end <= to && c.start >= from && /Section\s+\d+/i.test(js.slice(c.start, c.end)));
};
const firstDecl = g => {
  for (const i of g.items) if (stmts[i].names.length) return stmts[i].names[0];
  return null;
};

/* ---- group consecutive statements of one package into files ---- */
const groups = { core: [], ui: [] };
let cur = null;
stmts.forEach((s, i) => {
  const kind = s.ui ? 'ui' : 'core';
  const title = sectionTitle(i);
  const big = cur && (cur.items.length >= 12 ||
    cur.items.reduce((a, x) => a + stmts[x].text.length, 0) > 12000);
  if (!cur || cur.kind !== kind || (big && isSection(i))) {
    cur = { kind, title: title || null, items: [] };
    groups[kind].push(cur);
  }
  cur.items.push(i);
});
/* absorb slivers: a five-line file between two big ones is noise */
for (const kind of ['core', 'ui']) {
  const keep = [];
  for (const g of groups[kind]) {
    const chars = g.items.reduce((a, x) => a + stmts[x].text.length, 0);
    if (keep.length && chars < 2200 && keep[keep.length - 1].items.length + g.items.length <= 60) {
      keep[keep.length - 1].items.push(...g.items);
      continue;
    }
    keep.push(g);
  }
  groups[kind] = keep;
}

/* ---- write ----
   Only what this script generates is removed. The hand-written files in
   packages/ - the host seam, the two package entries, the stylesheet, the
   HTML template, changes.json - are not touched.

   They used to be deleted and restored from a second copy under src/manual,
   which meant every hand edit to the stylesheet or the host had to be made
   twice, in two places, or it was silently reverted at the next bootstrap.
   That is the same class of bug as the unmirrored section, and the fix is the
   same: keep one copy. src/manual is gone. */
const HAND_WRITTEN = [
  'core/host.js', 'core/index.js', 'core/package.json',
  'ui/index.js', 'ui/package.json', 'ui/styles.css', 'ui/index.template.html',
  'changes.json'
];
const GENERATED = [
  'core/src', 'core/core.js', 'core/host-shims.js', 'core/exports.json', 'core/graph.json',
  'ui/src', 'ui/modules', 'ui/registry.js',
  'flat', 'order.json', 'ranges.json', 'deletions.json'
];
for (const g of GENERATED) fs.rmSync(path.join(ROOT, 'packages', g), { recursive: true, force: true });
const missingHandWritten = HAND_WRITTEN.filter(f => !fs.existsSync(path.join(ROOT, 'packages', f)));
if (missingHandWritten.length) {
  console.error('refusing to bootstrap: these hand-written files are missing and this script does\n' +
    'not generate them, so the packages would come out incomplete and the build would fail\n' +
    'somewhere less obvious than here:\n' +
    missingHandWritten.map(f => '  packages/' + f).join('\n') + '\n\n' +
    'Restore them from version control and run again.');
  process.exit(1);
}

const ranges = {}, order = [], fileOf = [];
const slug = t => (t || 'main').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 40) || 'main';
for (const kind of ['core', 'ui']) {
  fs.mkdirSync(path.join(ROOT, 'packages', kind, 'src'), { recursive: true });
  groups[kind].forEach((g, n) => {
    const file = `${kind}/src/${String(n).padStart(2, '0')}-${slug(g.title || firstDecl(g) || 'main')}.js`;
    fs.writeFileSync(path.join(ROOT, 'packages', file), g.items.map(i => stmts[i].text).join(''));
    let off = 0;
    const rs = [];
    for (const i of g.items) {              /* the file is its chunks concatenated */
      rs.push({ stmt: i, start: off, end: off + stmts[i].text.length });
      fileOf[i] = file;
      off += stmts[i].text.length;
    }
    ranges[file] = rs;
  });
}
for (let i = 0; i < stmts.length; i++) order.push({ file: fileOf[i], stmt: i });
fs.writeFileSync(path.join(ROOT, 'packages/order.json'), JSON.stringify(order));
/* recorded so tools/bundle.mjs can prove the standalone file is the packages' output
   apart from these named deletions, and nothing else */
fs.writeFileSync(path.join(ROOT, 'packages/deletions.json'),
  JSON.stringify(DELETIONS.map(d => ({ name: d.name, why: d.why, match: d.match, replacement: d.replacement })), null, 1));
fs.writeFileSync(path.join(ROOT, 'packages/ranges.json'), JSON.stringify(ranges));

/* ---- a pristine copy of the flat statements ----
   tomodules.mjs rewrites the package files in place, adding imports and
   exports. This copy is what those files looked like before, so the bundler
   can prove that stripping the module syntax gives back exactly the same
   statements, character for character, rather than trusting itself. */
for (const kind of ['core', 'ui']) {
  fs.mkdirSync(path.join(ROOT, 'packages', 'flat', kind, 'src'), { recursive: true });
  const srcDir = path.join(ROOT, 'packages', kind, 'src');
  if (!fs.existsSync(srcDir)) continue;
  for (const f of fs.readdirSync(srcDir)) {
    if (f === '00-host.js') continue;              /* hand-written, already a module */
    fs.copyFileSync(path.join(srcDir, f), path.join(ROOT, 'packages', 'flat', kind, 'src', f));
  }
}

/* the hand-written files are left where they are; there is no second copy */

/* ---- prove it, in the same process that wrote it ---- */
const cache = new Map();
const textOf = f => {
  if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(ROOT, 'packages', f), 'utf8'));
  return cache.get(f);
};
const rebuilt = order.map(o => {
  const r = ranges[o.file].find(x => x.stmt === o.stmt);
  return textOf(o.file).slice(r.start, r.end);
}).join('');

console.log('statements        : ' + stmts.length);
console.log('bootstrap         : packages/flat is the plain-text copy of the sections');
console.log('                    packages/*/src is the working copy you edit');
console.log('core files        : ' + groups.core.length);
console.log('ui files          : ' + groups.ui.length);
console.log('hand-written      : ' + HAND_WRITTEN.length + ' file(s) left untouched in packages/');
for (const a of applied) console.log('deleted           : ' + a.name + ' (' + a.why + ')');
if (rebuilt === js) console.log('SELF-CHECK        : reassembles exactly (' + js.length + ' chars)');
else {
  let i = 0;
  const n = Math.min(rebuilt.length, js.length);
  while (i < n && rebuilt[i] === js[i]) i++;
  console.log('SELF-CHECK FAILED  expected ' + js.length + ', rebuilt ' + rebuilt.length);
  console.log('  first difference at char ' + i);
  console.log('  source : ' + JSON.stringify(js.slice(Math.max(0, i - 30), i + 30)));
  console.log('  rebuilt: ' + JSON.stringify(rebuilt.slice(Math.max(0, i - 30), i + 30)));
  process.exit(1);
}
