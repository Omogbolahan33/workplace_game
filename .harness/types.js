/* Gate: the simulation is typed, and the typing is real.
 *
 * The migration's answer for the data tables was TypeScript (`language =
 * ts_tables`), and this gate is what makes that mean something: it runs the
 * compiler over `packages/core` - the composed module and the 57 table files -
 * and fails on a single error.
 *
 * The shape of the arrangement is in tools/tables.mjs; what matters here is what
 * is checked and what would make a green result a lie:
 *
 *   1. **No DOM in the programme.** The tsconfig lists `lib: ["es2022"]`, so
 *      `document` is not a name TypeScript knows. A DOM usage anywhere in the
 *      simulation is a type error rather than a runtime surprise on a phone -
 *      and this is checked by reading the config, because "we set lib" is a
 *      claim about a file that can be edited without anybody noticing.
 *   2. **Every table is a table file, and every table file is a table.** A
 *      directive in a section with no file behind it means the build spliced
 *      nothing; a file with no directive means a table nothing reads. Both are
 *      reported, and so is a manifest that has fallen out of step with either.
 *   3. **The literal is not the thing being typed.** Each table file's value is
 *      compared, token for token, with the baseline statement of that name: the
 *      annotation is the only thing TypeScript added, and `--verify` in
 *      tools/tables.mjs is what proves it. This gate runs it.
 *   4. **The to-do list is visible.** Fields the inference could not name are
 *      declared `any` and counted, and a name in tables-globals.d.ts that no
 *      table uses any more is reported - both as notes, because both are work
 *      that is *known*, not a failure that is hiding.
 *
 * Proved to fail on three deliberate breaks: a field read that the table does
 * not have, a value of the wrong type in a table, and a `document.body` in a
 * section. Each was reverted.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const bad = [];
const notes = [];
const ck = (c, m) => { if (!c) bad.push(m); };

const TSC = path.join(ROOT, 'tools', 'node_modules', '.bin', 'tsc');
if (!fs.existsSync(TSC)) {
  console.log('the compiler is not installed — cd tools && npm install');
  process.exit(1);
}

/* 1. the config, read rather than assumed */
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', 'core', 'tsconfig.json'), 'utf8'));
const lib = config.compilerOptions.lib || [];
ck(lib.length && lib.every((l) => l.indexOf('dom') < 0),
  'the simulation is being checked with the DOM available, which is how a browser-only line gets in: lib = ' + JSON.stringify(lib));
ck(config.compilerOptions.checkJs === true && config.compilerOptions.allowJs === true,
  'the composed module is JavaScript, so the check has to be asked for: checkJs/allowJs are not both on');

/* 2. the compiler, on the module and the tables */
let output = '';
let failed = false;
try {
  output = execFileSync(TSC, ['-p', path.join(ROOT, 'packages', 'core', 'tsconfig.json')], { encoding: 'utf8' });
} catch (e) {
  failed = true;
  output = (e.stdout || '') + (e.stderr || '');
}
const errors = (output.match(/error TS\d+/g) || []).length;
const first = output.split('\n').filter((l) => /error TS\d+/.test(l)).slice(0, 6);
ck(!failed && errors === 0, 'the simulation does not type-check: ' + errors + ' error(s)\n      ' + first.join('\n      '));

/* 3. every directive has a table file, and every table file has a directive */
const srcDir = path.join(ROOT, 'packages', 'core', 'src');
const tblDir = path.join(ROOT, 'packages', 'core', 'tables');
const directives = new Map();          /* name -> section */
for (const f of fs.readdirSync(srcDir).filter((x) => x.endsWith('.js')).sort()) {
  const text = fs.readFileSync(path.join(srcDir, f), 'utf8');
  let m;
  const re = /\/\*@table:([A-Za-z0-9_]+)@\*\//g;
  while ((m = re.exec(text))) {
    if (directives.has(m[1])) bad.push(m[1] + ' is spliced twice: ' + directives.get(m[1]) + ' and ' + f);
    directives.set(m[1], f);
  }
}
const files = fs.readdirSync(tblDir).filter((x) => x.endsWith('.ts') && !x.endsWith('.d.ts'));
for (const name of directives.keys()) {
  ck(files.indexOf(name + '.ts') >= 0, name + ' is spliced from ' + directives.get(name) + ' but there is no tables/' + name + '.ts');
}
for (const f of files) {
  const name = f.replace(/\.ts$/, '');
  ck(directives.has(name), 'tables/' + f + ' is a table no section splices — nothing would read it');
}
ck(directives.size > 50, 'only ' + directives.size + ' tables are spliced: the tables went missing');

/* 4. the literal is what the game ran: tools/tables.mjs --verify says so */
let verifyFailed = false;
try {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'tables.mjs'), '--verify'], { cwd: ROOT, encoding: 'utf8' });
} catch (e) { verifyFailed = true; output = (e.stdout || '') + (e.stderr || ''); }
ck(!verifyFailed, 'a spliced table is not the statement the game ran:\n      ' +
  output.split('\n').filter((l) => / - /.test(l)).slice(0, 4).join('\n      '));

/* 5. the transcript carries the types, which is what makes the checking reach
      the simulation at all. Without the annotation the spliced literal is an
      object literal type INFERRED in a .js file, and TypeScript does not report
      an unknown property against one of those - so a build that stopped emitting
      these would turn every read of a table field back into unchecked code while
      this gate stayed green. */
const dist = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');
const inTranscript = new Set();
for (const f of files) {
  const name = f.replace(/\.ts$/, '');
  const re = new RegExp('/\\*\\* @type \\{[^}]*\\} \\*/\\nconst ' + name + ' =');
  if (re.test(dist)) inTranscript.add(name);
}
const unchecked = files.map((f) => f.replace(/\.ts$/, '')).filter((n) => !inTranscript.has(n));
ck(unchecked.length === 0, unchecked.length + ' table(s) are spliced without their type, so nothing reads them ' +
  'through the checker: ' + unchecked.slice(0, 6).join(', '));

/* 6. the known work, counted rather than hidden */
let anys = 0;
for (const f of files) anys += (fs.readFileSync(path.join(tblDir, f), 'utf8').match(/[:<]\s*any\b|=>\s*any\b|\bany\[\]/g) || []).length;
const ambient = fs.readFileSync(path.join(ROOT, 'packages', 'core', 'tables-globals.d.ts'), 'utf8');
const ambientNames = (ambient.match(/^declare const ([A-Za-z0-9_$]+)/gm) || []).map((l) => l.replace('declare const ', ''));
const allTables = files.map((f) => fs.readFileSync(path.join(tblDir, f), 'utf8')).join('\n');
/* counted against the tables and the module both: `console` is declared here for
   the module rather than for the data, and a name used by either is not rot */
const moduleText = fs.readFileSync(path.join(ROOT, 'packages', 'core', 'core.js'), 'utf8');
const haystack = allTables + '\n' + moduleText;
const unused = ambientNames.filter((n) => !new RegExp('\\b' + n + '\\b')
  .test(haystack.replace(new RegExp('declare const ' + n, 'g'), '')));
if (unused.length) notes.push('tables-globals.d.ts declares ' + unused.length + ' name(s) no table uses any more: ' + unused.join(', '));

/* 7. the app is checked too, against the same core and a declared ui */

/* The app consumes @ledger/core as the module (so it sees the typed tables) and
   @ledger/ui through `packages/ui/index.d.ts` - the ui's public surface, written
   down, because `export * from './registry.js'` forwards almost none of the
   names an app reaches for. This is the check that found `ui.seasonCanScan()`
   missing and, later, a duplicate declaration that would have been a SyntaxError
   the moment the app loaded. */
let appOut = '';
let appFailed = false;
try {
  appOut = execFileSync(TSC, ['-p', path.join(ROOT, 'apps', 'web', 'tsconfig.json')], { encoding: 'utf8' });
} catch (e) { appFailed = true; appOut = (e.stdout || '') + (e.stderr || ''); }
const appErrors = (appOut.match(/error TS\d+/g) || []).length;
ck(!appFailed && appErrors === 0, 'the app does not type-check: ' + appErrors + ' error(s)\n      ' +
  appOut.split('\n').filter((l) => /error TS\d+/.test(l)).slice(0, 6).join('\n      '));

/* 7b. the ui's own sources are checked, with a DOM and against the same core */

/* The ui is where the DOM meets the simulation, so its programme needs both
   libs, and it consumes core by name (`@ledger/core`) exactly as the app does.
   Before this leg existed the ui's internals had never been through a checker -
   78 findings, and the first thing to look at is always the biggest group, not
   the first line. What the leg has to prove is that the count stays at zero:
   the sections the single file is assembled from are the same statements. */
let uiOut = '';
let uiFailed = false;
try {
  uiOut = execFileSync(TSC, ['-p', path.join(ROOT, 'packages', 'ui', 'tsconfig.json')], { encoding: 'utf8' });
} catch (e) { uiFailed = true; uiOut = (e.stdout || '') + (e.stderr || ''); }
const uiErrors = (uiOut.match(/error TS\d+/g) || []).length;
ck(!uiFailed && uiErrors === 0, 'the ui does not type-check: ' + uiErrors + ' error(s)\n      ' +
  uiOut.split('\n').filter((l) => /error TS\d+/.test(l)).slice(0, 6).join('\n      '));

/* 7c. the generated shim imports a host that is really there */

/* tomodules writes host-shims.js into the output dir and has to know where the
   host object comes from: beside the output, one level up, or another package
   by name. It used to hard-code './host.js', which was right for core and wrong
   for the ui - an import of a file the package does not have. Nothing noticed,
   because nothing imported the ui's shim yet. This asserts the file behind every
   written import exists (a package name means it is another package's job). */
for (const [pkg, spec] of [['core', './host.js'], ['ui', '@ledger/core']]) {
  const shim = path.join(ROOT, 'packages', pkg, pkg === 'core' ? 'host-shims.js' : 'modules/host-shims.js');
  if (!fs.existsSync(shim)) continue;
  const m = fs.readFileSync(shim, 'utf8').match(/from '([^']+)'/);
  const got = m ? m[1] : '';
  const local = got.startsWith('.');
  const file = local ? path.join(path.dirname(shim), got) : null;
  ck(got === spec, 'packages/' + pkg + '/host-shims.js imports the host as ' + JSON.stringify(got) +
    ', which is not ' + JSON.stringify(spec) + ' - the shim would import ' +
    (local ? 'a file that does not exist' : 'the wrong package'));
  if (file) ck(fs.existsSync(file), 'packages/' + pkg + '/host-shims.js imports ' + got + ' and there is no such file');
}

/* 8. the declared ui surface is not a wish: every name in it is really exported */
const acorn = require(path.join(ROOT, 'tools', 'node_modules', 'acorn'));
const declaredUi = [];
{
  const text = fs.readFileSync(path.join(ROOT, 'packages', 'ui', 'index.d.ts'), 'utf8');
  let m;
  const re = /^export (?:function|const|let|var) ([A-Za-z0-9_$]+)/gm;
  while ((m = re.exec(text))) declaredUi.push(m[1]);
}
const realUi = new Set();
{
  const file = path.join(ROOT, 'packages', 'ui', 'index.js');
  const ast = acorn.parse(fs.readFileSync(file, 'utf8'), { ecmaVersion: 2022, sourceType: 'module' });
  const addExports = (a) => {
    for (const n of a.body) {
      if (n.type !== 'ExportNamedDeclaration') continue;
      if (n.declaration && n.declaration.declarations) {
        for (const d of n.declaration.declarations) if (d.id && d.id.type === 'Identifier') realUi.add(d.id.name);
      }
      if (n.declaration && n.declaration.id) realUi.add(n.declaration.id.name);
      for (const sp of n.specifiers || []) realUi.add((sp.exported || sp.local).name);
    }
  };
  addExports(ast);
  /* `export * from './registry.js'` contributes the registry's own exports */
  for (const n of ast.body) {
    if (n.type === 'ExportAllDeclaration' && n.source) {
      const reg = path.join(ROOT, 'packages', 'ui', String(n.source.value).replace(/^\.\//, ''));
      addExports(acorn.parse(fs.readFileSync(reg, 'utf8'), { ecmaVersion: 2022, sourceType: 'module' }));
    }
  }
}
const invented = declaredUi.filter((n) => !realUi.has(n));
ck(invented.length === 0, 'packages/ui/index.d.ts declares ' + invented.length +
  ' name(s) the module does not export, so an app written against them would compile and then throw: ' +
  invented.join(', '));

console.log('typed tables        : ' + files.length + ' files, ' + directives.size + ' spliced into ' +
  new Set([...directives.values()]).size + ' sections, every literal the one the game ran');
console.log('type-checked        : packages/core/core.js + the tables, with no DOM in the programme (lib ' +
  JSON.stringify(lib) + ')');
console.log('errors              : ' + errors);
console.log('fields declared any : ' + anys + ' (the to-do list, counted rather than hidden)');
console.log('names the tables call: ' + ambientNames.length + ' declared in tables-globals.d.ts');
console.log('typed in the transcript: ' + inTranscript.size + ' of ' + files.length +
  ' tables, so reads of their fields are checked where the game runs');
console.log('the app             : ' + appErrors + ' error(s) across apps/web, against the same core and ' +
  'the declared ui surface');
console.log("the ui's surface    : " + declaredUi.length + ' names declared, all of them really exported (' +
  realUi.size + ' exports in @ledger/ui)');
console.log('the ui              : ' + uiErrors + ' error(s) across packages/ui (sections + the seam), ' +
  'with a DOM and against the same core module the app imports');
notes.forEach((n) => console.log('note                : ' + n));

if (bad.length) { console.log('\nTYPE ISSUES:'); bad.forEach((x) => console.log(' - ' + x)); process.exit(1); }
console.log('\nTYPES CLEAN — the simulation type-checks with no DOM in the programme, the app ' +
  'type-checks against it plus the declared ui surface, and every one of the ' + files.length +
  ' data tables is typed source that the transcript still contains word for word');
