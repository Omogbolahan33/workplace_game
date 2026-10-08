/*
  The data tables as typed source, and the transcript they are spliced back into.

  The game's 57 data tables are a third of the simulation by weight (331 kB of
  literals) and every screen and every rule reads them by field name. They were
  the first thing the migration plan named for TypeScript (`language = ts_tables`)
  because they are pure data: a type costs nothing at runtime and catches the one
  class of bug that has actually bitten this codebase - a field named `rate` in
  the table and read as `r.rate` in some places and `r.int` in others.

  The constraint that shapes everything here is the deliverable: `ledger/index.html`
  is ONE file, and `tools/bundle.mjs` holds a statement ledger against the original
  transcript, comparing statements token for token (whitespace-insensitive). So the
  tables cannot simply become `.ts` files that the build compiles: a compiler
  reformats, renames and rewrites, and the ledger would (correctly) report that
  every statement in the game had changed.

  So the arrangement is:

    packages/core/tables/<Name>.ts   the source of truth: an interface, then the
                                     literal, byte for byte as it was in the game
    packages/core/src/*.js           keep their code and lose their literals to a
                                     one-line directive: /*@table:NAME@*​/
    compose() / makecore()           splice the literal back in where the directive
                                     is, so what is composed, bundled, saved and
                                     played is the same text as before

  The literal is never retyped. `--extract` lifts it out of the section files and
  the splice puts the identical characters back, which `--verify` proves by
  comparing the spliced text against the baseline single file token for token. Type
  annotations only ever live on the declaration line, which the splicer removes.

  Types are *inferred* from the data rather than typed by hand, because 57 tables
  of hand-typed interfaces is a week of transcription with its own typos in it. The
  inference walks every element and unions what it finds: a field present in some
  elements and missing in others becomes optional, a field that is a string in one
  element and a number in another becomes `string | number`, a field holding a
  function becomes a function type. Nested objects get their own interface, named
  after the table and the path that found them. What it cannot infer it declares
  `any` - and says so, so `any` in these files is a to-do rather than a shrug.

    node tools/tables.mjs --extract     write tables/*.ts from the section files,
                                        and leave the directives behind
    node tools/tables.mjs --verify      every directive resolves, and the spliced
                                        text still matches the baseline
    node tools/tables.mjs --list        what is typed, and how many fields are any
    node tools/tables.mjs --restore     put the literals back and drop the table
                                        files, so --extract can be run again
*/
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* ROOT is defined here rather than imported from compose.mjs, and the modes
   below only run when this file is the entry point. Both matter: compose.mjs
   imports `splice` from this module, so an import-time side effect here would
   run against a compose.mjs that has not been evaluated yet - which is exactly
   the `Cannot access 'ROOT' before initialization` this file shipped for one
   build. */
const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const SRC = 'packages/core/src';
const DIR = 'packages/core/tables';
const DIRECTIVE = (name) => `/*@table:${name}@*/`;
const RE_DIRECTIVE = /\/\*@table:([A-Za-z0-9_]+)@\*\//g;

/* ---- finding the tables ------------------------------------------------- */

/* A table is a top-level `const NAME = <array or object literal>;` whose name is
   upper case. That is the convention the reference already follows, and it is
   what makes this findable without a marker having been written by hand. */
function tablesIn(text) {
  const ast = acorn.parse(text, { ecmaVersion: 2022 });
  const out = [];
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration' || node.kind !== 'const') continue;
    if (node.declarations.length !== 1) continue;
    const d = node.declarations[0];
    if (!d.id || d.id.type !== 'Identifier' || !/^[A-Z][A-Z0-9_]*$/.test(d.id.name)) continue;
    if (!d.init || (d.init.type !== 'ArrayExpression' && d.init.type !== 'ObjectExpression')) continue;
    out.push({ name: d.id.name, start: node.start, end: node.end, init: d.init, text: text.slice(node.start, node.end) });
  }
  return out;
}

/* ---- inferring a type from the data -------------------------------------
 *
 * Deliberately structural and total: every node gets a type string, and the
 * shapes found along the way become named interfaces. `any` is a result, not a
 * failure - it is counted and reported so it can be worked down.
 */
function inferrer(tableName) {
  const shapes = new Map();          /* signature (or merge key) -> interface name */
  const shapeRegistry = new Map();   /* interface name -> { props, total } */
  const names = new Set();
  let anys = 0;

  const any = (why) => { anys++; return why ? 'any' : 'any'; };

  function nameFor(base, hint) {
    let n = hint ? base + hint : base + 'Shape';
    n = n.replace(/[^A-Za-z0-9_$]/g, '');
    let i = 2;
    while (names.has(n)) { n = n.replace(/\d+$/, '') + i++; }
    names.add(n);
    return n;
  }

  /* the property's name, unquoted: how it is written in the interface is
     decided where the interface is written, so `'Secondary'` comes out as
     "Secondary" once and not as a quoted quote */
  function keyText(key) {
    if (key.type === 'Identifier') return key.name;
    if (key.type === 'Literal') return String(key.value);
    return key.value == null ? '?' : String(key.value);
  }

  function union(parts) {
    const flat = [];
    for (const p of parts) for (const q of p.split(' | ')) if (flat.indexOf(q) < 0) flat.push(q);
    /* every part a shape -> one shape with optional fields */
    if (flat.length > 1 && flat.every((f) => shapeRegistry.has(f))) {
      const merged = mergeShapes(flat, tableName);
      if (merged) return merged;
    }
    /* a function type in a union has to be parenthesised, or TypeScript reads
       `() => any | string` as a function returning a union of any and string.
       The test is whether the string is *enclosed* by its first and last
       parenthesis - `(any) => any` starts with one and is not enclosed by it. */
    const enclosed = (t) => {
      if (t[0] !== '(' || t[t.length - 1] !== ')') return false;
      let d = 0;
      for (let i = 0; i < t.length; i++) {
        if (t[i] === '(') d++;
        else if (t[i] === ')') { d--; if (d === 0) return i === t.length - 1; }
      }
      return false;
    };
    for (let i = 0; i < flat.length; i++) {
      if (flat[i].indexOf('=>') >= 0 && !enclosed(flat[i])) flat[i] = '(' + flat[i] + ')';
    }
    /* a literal string in one element and a computed string in another is just
       a string; keeping `'warn' | string` would make every reader narrow for no
       reason */
    if (flat.length > 1 && flat.indexOf('string') >= 0) return flat.filter((f) => !/^'/.test(f)).join(' | ');
    if (flat.length > 1 && flat.indexOf('number') >= 0) return flat.filter((f) => /^[0-9-]/.test(f)).length === flat.length - 1 ? 'number' : flat.join(' | ');
    return flat.join(' | ');
  }

  function typeOf(node, hint) {
    switch (node.type) {
      case 'Literal': {
        if (typeof node.value === 'string') return 'string';
        if (typeof node.value === 'number') return 'number';
        if (typeof node.value === 'boolean') return 'boolean';
        if (node.value === null) return 'null';
        if (node.regex) return 'RegExp';
        return any();
      }
      case 'TemplateLiteral': return 'string';
      case 'ArrayExpression': {
        if (!node.elements.length) return 'any[]';
        const els = node.elements.filter(Boolean);
        /* a list of objects is one shape with optional fields, not a union of
           twenty near-identical interfaces: that is the shape a screen reads */
        if (els.every((e) => e.type === 'ObjectExpression')) return shapeOf(els, hint) + '[]';
        const inner = union(els.map((e) => typeOf(e, hint)));
        /* one type throughout is a list; a mixture is a list of the mixture, not
           of the first thing in it - `['friend', 1.4]` is a pair, and a table of
           pairs is an array of arrays of both */
        if (inner.indexOf(' | ') < 0) return inner + '[]';
        return 'Array<' + inner + '>';
      }
      case 'ObjectExpression': return shapeOf([node], hint);
      case 'UnaryExpression': return node.operator === '-' || node.operator === '+' ? 'number' : any();
      case 'BinaryExpression':
        if (['-', '*', '/', '%', '**'].indexOf(node.operator) >= 0) return 'number';
        if (node.operator === '+') return 'string | number';
        return 'boolean';
      case 'LogicalExpression': return union([typeOf(node.left, hint), typeOf(node.right, hint)]);
      case 'ConditionalExpression': return union([typeOf(node.consequent, hint), typeOf(node.alternate, hint)]);
      case 'ArrowFunctionExpression':
      case 'FunctionExpression': {
        /* parameters are named by position: `(any, any) => boolean` is two
           parameters both called `any`, which TypeScript reads as a duplicate */
        const params = node.params.map((p, i) => 'a' + i + ': any');
        const ret = node.body.type === 'BlockStatement' ? 'any' : typeOf(node.body, hint);
        return '(' + params.join(', ') + ') => ' + ret;
      }
      case 'Identifier': return any();
      case 'CallExpression':
        if (node.callee.type === 'Identifier' && node.callee.name === 'Object' && node.arguments.length === 0) return '{}';
        return any();
      case 'MemberExpression': return any();
      case 'NewExpression': return node.callee && node.callee.name === 'RegExp' ? 'RegExp' : any();
      default: return any();
    }
  }

  function shapeOf(objects, hint) {
    const props = new Map();          /* key -> { types:Set, seen, optional, keyText } */
    let n = 0;
    for (const el of objects) {
      if (!el || el.type !== 'ObjectExpression') continue;
      n++;
      for (const p of el.properties) {
        if (p.type !== 'Property' || p.computed) continue;
        const kt = keyText(p.key);
        const rec = props.get(kt) || { types: new Set(), seen: 0, keyText: p.key.type === 'Identifier' ? kt : kt };
        rec.seen++;
        rec.types.add(typeOf(p.value, hint));
        props.set(kt, rec);
      }
    }
    const total = Math.max(n, 1);
    const signature = [...props.entries()].map(([k, v]) => k + ':' + [...v.types].sort().join('|') + (v.seen < total ? '?' : '')).sort().join(',');
    const cached = shapes.get(signature);
    if (cached) return cached;
    const name = nameFor(tableName, hint || '');
    shapes.set(signature, name);         /* registered before the body, so a shape inside itself terminates */
    shapeRegistry.set(name, { props, total });
    const body = [...props.entries()].map(([k, v]) => {
      const opt = v.seen < total ? '?' : '';
      const kk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return '  ' + kk + opt + ': ' + union([...v.types]) + ';';
    }).join('\n');
    shapes.set(signature, name);
    interfaces.push({ name, body: 'interface ' + name + ' {\n' + body + '\n}' });
    return name;
  }

  const interfaces = [];
  /* A union of two shapes is a shape: the same fields with the optional ones
     optional. Without this, a list whose elements carry different `eff` objects
     types as `A | B | C`, and reading `.happy` off it is an error - which says
     "you cannot do that" about a line the game has run for a year. The merge is
     what the code actually assumes: some elements have the field, so reading it
     gives a number or undefined. */
  function mergeShapes(names, hint) {
    const sig = 'merged:' + names.slice().sort().join('+');
    if (shapes.has(sig)) return shapes.get(sig);
    const fields = new Map();
    for (const n of names) {
      const rec = shapeRegistry.get(n);
      if (!rec) return null;                    /* not all shapes: a union it is */
      for (const [k, v] of rec.props) {
        const f = fields.get(k) || { types: new Set(), full: 0, shapes: 0 };
        v.types.forEach((t) => f.types.add(t));
        f.shapes++;
        if (v.seen >= rec.total) f.full++;
        fields.set(k, f);
      }
    }
    const name = nameFor((hint || 'Merged') + 'Shapes', '');
    shapes.set(sig, name);
    const body = [...fields.entries()].map(([k, v]) => {
      const opt = v.full < names.length ? '?' : '';
      const kk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return '  ' + kk + opt + ': ' + union([...v.types]) + ';';
    }).join('\n');
    interfaces.push({ name, body: 'interface ' + name + ' {\n' + body + '\n}' });
    return name;
  }

  return {
    root(node) { return { type: typeOf(node, ''), interfaces }; },
    counters: () => ({ anys, shapes: interfaces.length })
  };
}

/* A literal can hold an interface declaration inside it? No - but the empty
   array case and the object case both need somewhere to put their interfaces. */

/* ---- writing a table file ----------------------------------------------- */

function tableFile(name, section, literal) {
  const inf = inferrer(name);
  const { type, interfaces } = inf.root(acorn.parseExpressionAt(literal, 0, { ecmaVersion: 2022 }));
  const body = [
    `/*`,
    `  ${name} — from ${section}, typed here and spliced back into the transcript`,
    `  by tools/tables.mjs. Edit this file, never the built single file.`,
    ``,
    `  The literal below is character for character what the game has always run:`,
    `  the annotation on the declaration line is the only thing TypeScript added,`,
    `  and the splicer removes it. Do not reformat it.`,
    `*/`,
    ...interfaces.map((i) => i.body),
    ``,
    `const ${name}: ${type} = ${literal}`,
    ``
  ].join('\n');
  return { text: body, type, anys: inf.counters().anys };
}

/* ---- the splice --------------------------------------------------------- */

/* The literal back out of a table file: everything after the annotation on the
   declaration line, which is the last `const <Name>` in the file. Textual on
   purpose - this file is TypeScript, and the tools here have no TypeScript
   parser - and narrow on purpose: one line, one annotation, the rest verbatim. */
export function tableJS(name) {
  const file = path.join(DIR, name + '.ts');
  if (!exists(file)) throw new Error('no table file for ' + name + ' (looked for ' + file + ')');
  const text = read(file);
  const at = text.lastIndexOf('\nconst ' + name);
  if (at < 0) throw new Error(name + '.ts has no `const ' + name + '` declaration line');
  const decl = text.slice(at + 1);
  const eq = decl.indexOf(' = ');
  if (eq < 0) throw new Error(name + '.ts: the declaration line has no ` = `');
  /* everything after the annotation, verbatim, minus the newline the table file
     itself ends with - so what the build splices in is the original statement,
     character for character, and no whitespace moves */
  const after = decl.slice(eq + 3).replace(/\n$/, '');
  if (!after.endsWith(';')) throw new Error(name + '.ts: the literal does not end with a semicolon');
  /* The annotation goes on the statement in the transcript too, and this is the
     whole point of the arrangement: the table file's interface is a global
     declaration, so a JSDoc type here makes every READ of a table field in the
     simulation checkable - `BIZ[0].nmae` is then a type error rather than
     `undefined` three screens later. (TypeScript does not report an unknown
     property on an object literal type INFERRED in a .js file, which is exactly
     what the spliced literal would otherwise be.)
     It is a comment: the single file carries 57 of them and no behaviour, and
     the ledger reports them as comments rewritten, which they are. */
  const type = declaredType(name);
  return (type ? '/** @type {' + type + '} */\n' : '') + 'const ' + name + ' = ' + after;
}

/* the statement WITHOUT the annotation: what --restore writes back into a
   section. The section is the pre-extraction source, and the annotation belongs
   to the transcript the build composes, not to the file it composes from. */
export function tableLiteral(name) {
  return tableJS(name).replace(/^\/\*\* @type \{[^}]*\} \*\/\n/, '');
}

let CACHE = null;
export function tables() {
  if (CACHE) return CACHE;
  CACHE = new Map();
  const dir = path.join(ROOT, DIR);
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts') && !x.endsWith('.d.ts')).sort()) {
      CACHE.set(f.replace(/\.ts$/, ''), tableJS(f.replace(/\.ts$/, '')));
    }
  }
  return CACHE;
}

/* The type a table file declares, so the statement the build splices can carry
   it. Read from the manifest (written by --extract) rather than parsed out of
   the .ts, because the manifest is the one place that already knows. */
function declaredType(name) {
  const file = path.join(DIR, 'manifest.json');
  if (!exists(file)) return null;
  const row = JSON.parse(read(file)).find((m) => m.name === name);
  return row && row.type ? row.type : null;
}

/* What a section says, with its directives resolved. This is the one function
   the build calls: sections go in as they are on disk, the text that is
   composed, bundled and played comes out. */
export function splice(text, where) {
  return text.replace(RE_DIRECTIVE, (m, name) => {
    const js = tables().get(name);
    if (!js) throw new Error('the directive ' + m + ' in ' + where + ' names a table with no file');
    return js;
  });
}
export function hasDirective(text) { return RE_DIRECTIVE.test(text); }
export function directiveNames(text) {
  const out = [];
  let m;
  RE_DIRECTIVE.lastIndex = 0;
  while ((m = RE_DIRECTIVE.exec(text))) out.push(m[1]);
  return out;
}

/* ---- modes -------------------------------------------------------------- */

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const mode = isMain ? (process.argv[2] || '--list') : null;
const files = fs.readdirSync(path.join(ROOT, SRC)).filter((f) => f.endsWith('.js')).sort();

if (!isMain) {
  /* imported by the build: the exports above are the whole interface */
} else if (mode === '--extract') {
  fs.mkdirSync(path.join(ROOT, DIR), { recursive: true });
  let written = 0, anyTotal = 0;
  const manifest = [];
  for (const f of files) {
    const text = read(`${SRC}/${f}`);
    const found = tablesIn(text);
    if (!found.length) continue;
    let out = text;
    for (const t of found.reverse()) {
      if (exists(`${DIR}/${t.name}.ts`)) {
        throw new Error(t.name + ' is already a table file — refusing to overwrite it from the section');
      }
      const lit = t.text.slice(t.text.indexOf('= ') + 2);
      if (!lit.endsWith(';')) throw new Error(t.name + ': the statement does not end with a semicolon');
      const made = tableFile(t.name, f, lit);
      fs.writeFileSync(path.join(ROOT, DIR, t.name + '.ts'), made.text);
      anyTotal += made.anys;
      out = out.slice(0, t.start) + DIRECTIVE(t.name) + out.slice(t.end);
      manifest.push({ name: t.name, section: f, type: made.type, chars: t.text.length });
      written++;
    }
    fs.writeFileSync(path.join(ROOT, SRC, f), out);
  }
  fs.writeFileSync(path.join(ROOT, DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('wrote ' + written + ' table files from ' + files.length + ' sections');
  console.log('fields the inference could not name: ' + anyTotal);
} else if (mode === '--restore') {
  /* Put the literals back into the sections and delete the table files - the
     inverse of --extract, and the way to regenerate them (the inference changed,
     or a name in tables-globals.d.ts did): restore, extract, rebuild. It is the
     same splice the build uses, so what comes back is what went in. */
  if (!exists(DIR)) { console.log('no ' + DIR + ' — nothing to restore from'); process.exit(0); }
  let done = 0;
  for (const f of files) {
    const p = path.join(ROOT, SRC, f);
    let text = fs.readFileSync(p, 'utf8');
    if (!/\/\*@table:/.test(text)) continue;
    /* A previous restore may have left the annotation the build emits sitting
       above the directive, and splicing over the directive would then leave it
       there for the transcript to carry twice. Off first. */
    /* one or MORE of them: a restore that ran, then an extract, then a restore
       again stacks them, and the transcript would carry every one */
    text = text.replace(/(?:\/\*\* @type \{[^}]*\} \*\/\n)+(?=\/\*@table:)/g, '');
    text = text.replace(RE_DIRECTIVE, (m, name) => tableLiteral(name));
    fs.writeFileSync(p, text);
    done++;
  }
  fs.rmSync(path.join(ROOT, DIR), { recursive: true, force: true });
  console.log('restored ' + done + ' section(s) from the table files, and removed ' + DIR);
} else if (mode === '--verify') {
  /* The strong form of the check: every spliced table must be the baseline's
     statement for that name, token for token. Whitespace is allowed to differ -
     the section files were split out of the single file and normalised a blank
     line or two on the way - but a retyped literal, a reordered field or a
     dropped entry shows up here, and this runs before every build. */
  const baseline = exists('reference/baseline-single-file.html') ? read('reference/baseline-single-file.html') : '';
  const squash = (t) => t.replace(/\s+/g, ' ').trim();
  const refStmts = new Map();
  if (baseline) {
    const script = baseline.slice(baseline.lastIndexOf('<script>') + 8, baseline.lastIndexOf('</script>'));
    const ast = acorn.parse(script, { ecmaVersion: 2022 });
    for (const n of ast.body) {
      if (n.type !== 'VariableDeclaration') continue;
      for (const d of n.declarations) {
        if (d.id && d.id.type === 'Identifier') refStmts.set(d.id.name, script.slice(n.start, n.end));
      }
    }
  }
  let checked = 0;
  const bad = [];
  for (const f of files) {
    const text = read(`${SRC}/${f}`);
    for (const name of directiveNames(text)) {
      checked++;
      let js;
      try { js = tableJS(name); } catch (e) { bad.push(e.message); continue; }
      js = js.replace(/^\/\*\* @type \{[^}]*\} \*\/\n/, '');   /* the annotation is not the statement */
      if (!baseline) continue;
      const ref = refStmts.get(name);
      if (!ref) { bad.push(name + ': no such statement in the baseline transcript'); continue; }
      if (squash(ref) !== squash(js)) {
        const A = squash(ref), B = squash(js);
        let i = 0;
        while (i < A.length && A[i] === B[i]) i++;
        bad.push(name + ': the spliced literal is not the statement the game ran — differs at ' + i +
          ' of ' + A.length + '\n      was: ' + A.slice(Math.max(0, i - 30), i + 30) +
          '\n      now: ' + B.slice(Math.max(0, i - 30), i + 30));
      }
    }
  }
  console.log('tables spliced      : ' + checked + ' directives');
  console.log('against the baseline: ' + (baseline ? (bad.length ? 'MISMATCH' : 'every one, token for token') : 'no baseline to compare against'));
  if (bad.length) { bad.forEach((b) => console.log(' - ' + b)); process.exit(1); }
} else {
  const manifest = exists(`${DIR}/manifest.json`) ? JSON.parse(read(`${DIR}/manifest.json`)) : [];
  const total = manifest.reduce((n, m) => n + m.chars, 0);
  console.log(manifest.length + ' tables typed · ' + total.toLocaleString() + ' characters of data · ' + DIR);
  for (const m of manifest) console.log('  ' + m.name.padEnd(18) + m.type.padEnd(16) + m.section);
}
