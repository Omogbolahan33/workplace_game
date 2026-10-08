/* Gate: the project runs from wherever it is unpacked.

   This gate exists because a fresh-checkout test found the whole build dying
   the moment it was unpacked somewhere else: `tools/declared-changes.mjs`
   imported acorn by absolute path and five tools pinned an absolute root.
   Everything passed on the machine it was written on, which is exactly how this
   class of mistake survives — the download is the first place it shows up, and
   by then it is a stranger's problem.

   Two relational claims, no counts:

     1. No code file (js/mjs/cjs/ts/tsx/py/sh/yml) hardcodes an absolute home
        path. A path like that can only be right on one machine.
     2. Every tool that needs the repository root derives it from *itself* —
        `import.meta.url`, `import.meta.dirname` or `__dirname` — never from the
        current working directory, which is a property of the caller.

   And because claim 2 is only worth anything if a tool actually survives being
   called from elsewhere, the gate runs one from a temp directory and requires
   it to find the repo anyway.

   The needle is assembled from parts so this file does not trip its own scan.
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const HOME_NEEDLE = '/' + 'home' + '/';
const USERS_NEEDLE = '/' + 'Users' + '/';
const WIN_NEEDLE = ':' + '\\' + 'Users' + '\\';

const SCAN = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.sh', '.yml', '.yaml']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.cache', '.npm', 'coverage',
  'build', 'out', 'target', '__pycache__', '.next', '.venv', 'artifacts']);
const SKIP_FILES = new Set(['mod.js', 'check.js', 'registry.js', 'audit.json',
  'shell-baseline.json', 'text-baseline.json']);

const problems = [];
let scanned = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name));
      continue;
    }
    if (!e.isFile()) continue;
    if (SKIP_FILES.has(e.name)) continue;
    if (!SCAN.has(path.extname(e.name))) continue;
    scanned++;
    check(path.join(dir, e.name));
  }
}

function check(file) {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [name, needle] of [['home', HOME_NEEDLE], ['Users', USERS_NEEDLE], ['windows', WIN_NEEDLE]]) {
      if (line.indexOf(needle) === -1) continue;
      // a comment naming the path in prose is still a path that goes stale - but
      // the scan's job is code that *resolves* to it, so only flag lines that
      // look like they hand the path to the runtime.
      if (/^\s*(\/\/|\*|#)/.test(line)) continue;
      problems.push(rel + ':' + (i + 1) + ' hardcodes an absolute ' + name + ' path: ' + line.trim().slice(0, 90));
    }
  });
}

walk(ROOT);

/* claim 2: tools that need the repo root say where they are, not where you ran them.
   A local alias counts if the alias itself is self-locating (tools/mobile.mjs
   writes `const HERE = path.dirname(fileURLToPath(import.meta.url))`). */
const SELF = /import\.meta\.(url|dirname)|__dirname|fileURLToPath|os\.path\.dirname|Path\(__file__/;
const toolsDir = path.join(ROOT, 'tools');
for (const f of fs.readdirSync(toolsDir)) {
  if (!/\.(mjs|js|py)$/.test(f)) continue;
  const src = fs.readFileSync(path.join(toolsDir, f), 'utf8');
  const aliases = [...src.matchAll(/^[ \t]*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.+)$/gm)]
    .filter(m => SELF.test(m[2])).map(m => m[1]);
  for (const m of src.matchAll(/^[ \t]*(?:const|let|var)\s+ROOT\s*=\s*(.+)$/gm)) {
    const rhs = m[1].trim();
    const ok = SELF.test(rhs) || aliases.some(a => new RegExp('\\b' + a + '\\b').test(rhs));
    if (!ok) problems.push('tools/' + f + ' derives ROOT from something other than its own location: ' + rhs.slice(0, 80));
  }
}

/* the honest test of claim 2: call a tool from somewhere else */
let probe = '';
try {
  probe = execFileSync('node', [path.join(toolsDir, 'tables.mjs'), '--verify'],
    { cwd: os.tmpdir(), encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  probe = (e.stdout || '') + (e.stderr || '');
  problems.push('tables.mjs cannot run from another directory (cwd is a property of the caller, not the repo): '
    + probe.trim().split('\n').slice(-2).join(' '));
}

if (problems.length) {
  console.log('PORTABILITY BROKEN — ' + problems.length + ' problem(s):');
  problems.forEach(p => console.log('  ' + p));
  process.exit(1);
}
console.log('portability CLEAN — ' + scanned + ' code files, no absolute home path; tools locate the repo '
  + 'from their own file and ' + (probe.trim().split('\n').pop() || '').slice(0, 60));
