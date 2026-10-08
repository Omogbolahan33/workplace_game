"""Split the single-file app into core/ui packages at real top-level boundaries.

The first attempt split at structural comment markers, which cut inside an
object literal: `BUSINESS_ARCS = {` closed one part and its contents opened the
next. Concatenation hid it completely - the rebuild was byte-identical - and it
only surfaced when the parts had to become modules. So the scanner here tracks
braces, parens, brackets, strings and comments, and will only cut at depth 0.
"""
import re, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'ledger/index.html'), encoding='utf-8').read()

st = html.index('<style>') + len('<style>')
en = html.index('</style>')
css = html[st:en]
si = html.rindex('<script>') + len('<script>')
sj = html.rindex('</script>')
js = html[si:sj]

os.makedirs(os.path.join(ROOT, 'src'), exist_ok=True)
open(os.path.join(ROOT, 'src/styles.css'), 'w', encoding='utf-8').write(css)
open(os.path.join(ROOT, 'src/index.template.html'), 'w', encoding='utf-8').write(
    html[:st] + '<!--STYLES-->' + html[en:si] + '<!--SCRIPT-->' + html[sj:])

lines = js.split('\n')

def depths(lines):
    """Depth of (), {}, [] at the START of each line, skipping strings and comments."""
    out = []
    d = 0
    for line in lines:
        out.append(d)
        i = 0
        n = len(line)
        while i < n:
            c = line[i]
            if c == '/' and i + 1 < n and line[i+1] == '/':
                break
            if c == '/' and i + 1 < n and line[i+1] == '*':
                j = line.find('*/', i + 2)
                if j < 0: i = n; continue
                i = j + 2; continue
            if c in '"\'`':
                q = c; i += 1
                while i < n:
                    if line[i] == '\\': i += 2; continue
                    if line[i] == q: break
                    i += 1
                i += 1; continue
            if c in '([{': d += 1
            elif c in ')]}': d -= 1
            i += 1
    return out

D = depths(lines)
START = re.compile(r'^(?:async\s+)?function\s+[A-Za-z_$]|^(?:export\s+)?(?:const|let|var)\s+[A-Za-z_$]|^/\*\s*=')
starts = [i for i in range(len(lines)) if D[i] == 0 and START.match(lines[i])]
if not starts or starts[0] != 0: starts = [0] + starts
starts = sorted(set(starts))
blocks = []
for n, s in enumerate(starts):
    e = starts[n+1] if n+1 < len(starts) else len(lines)
    blocks.append((s, e))

DOM = re.compile(r"Q\('|\.innerHTML|document\.|window\.|localStorage|addEventListener|navigator\.|getElementById")
def title_of(s, e):
    for l in lines[max(0, s-4):s]:
        t = l.strip().lstrip('/* ').rstrip(' */')
        if len(t) > 6 and not t.startswith('=') and not t.startswith('//'):
            t = re.sub(r'^Section\s+\d+[a-z]?[:.]\s*', '', t, flags=re.I)
            return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:36]
    return 'block-%03d' % s

# classify and group consecutive same-kind blocks into files
out = {'core': [], 'ui': []}          # [(filename, [block indices])]
order = []
cur = None
for n, (s, e) in enumerate(blocks):
    body = '\n'.join(lines[s:e])
    ui = bool(DOM.search(body)) or bool(re.search(r'^function\s+(view|render)[A-Z]', body, re.M))
    kind = 'ui' if (ui and n > 0) else 'core'
    if body.strip() == '' and kind == 'core':
        kind = 'core'
    t = title_of(s, e)
    if cur and cur[0] == kind:
        cur[1].append(n)
    else:
        cur = [kind, [n], t]
        out[kind].append(cur)
    order.append({'kind': kind, 'block': n})

files = {}
for kind in ('core', 'ui'):
    for idx, (k, idxs, t) in enumerate(out[kind]):
        name = '%02d-%s%s.js' % (idx, t, '' if kind == 'core' else '.ui')
        files[(kind, idx)] = name

# write
loc = {}
for kind in ('core', 'ui'):
    os.makedirs(os.path.join(ROOT, 'packages', kind, 'src'), exist_ok=True)
seen = {}
for kind, idxs, t in [g for g in out['core']] + [g for g in out['ui']]:
    pass
loc = {}
for kind in ('core', 'ui'):
    for idx, (k, idxs, t) in enumerate(out[kind]):
        name = files[(kind, idx)]
        chunks = ['\n'.join(lines[blocks[n][0]:blocks[n][1]]) for n in idxs]
        open(os.path.join(ROOT, 'packages', kind, 'src', name), 'w', encoding='utf-8').write('\n'.join(chunks))
        for j, n in enumerate(idxs):
            loc[idxs[j]] = {'file': '%s/src/%s' % (kind, name), 'chunk': j}

# rebuild order: block n is chunk loc[n] within its file
seq = []
for n in range(len(blocks)):
    seq.append({'file': loc[n]['file'], 'block': n})
json.dump(seq, open(os.path.join(ROOT, 'packages/order.json'), 'w'), indent=0)
# line ranges within each file, for the byte-exact rebuild
ranges = {}
for kind in ('core', 'ui'):
    for idx, (k, idxs, t) in enumerate(out[kind]):
        name = files[(kind, idx)]
        off = 0
        key = '%s/src/%s' % (kind, name)
        for n in idxs:
            cnt = blocks[n][1] - blocks[n][0]
            ranges.setdefault(key, []).append({'block': n, 'start': off, 'end': off + cnt})
            # two chunks joined by a newline share a line at the boundary,
            # so the next chunk starts at off + cnt, not off + cnt + 1
            off += cnt
json.dump(ranges, open(os.path.join(ROOT, 'packages/ranges.json'), 'w'), indent=0)

# prove it: reassemble in Python from the written files and compare to the source
rebuilt = []
for n in range(len(blocks)):
    ent = seq[n]
    r = [x for x in ranges[ent['file']] if x['block'] == n][0]
    fl = open(os.path.join(ROOT, 'packages', ent['file']), encoding='utf-8').read().split('\n')
    rebuilt.append('\n'.join(fl[r['start']:r['end']]))
rebuilt = '\n'.join(rebuilt)
if rebuilt == js:
    print('SELF-CHECK: reassembles to the original script exactly')
else:
    print('SELF-CHECK FAILED — %d vs %d chars' % (len(rebuilt), len(js)))
    i = 0
    while i < min(len(rebuilt), len(js)) and rebuilt[i] == js[i]: i += 1
    print('  diverges at char %d' % i)
    print('  source:', repr(js[max(0,i-50):i+50]))
    print('  built :', repr(rebuilt[max(0,i-50):i+50]))
    raise SystemExit(1)

core_files = [f for f in os.listdir(os.path.join(ROOT, 'packages/core/src'))]
ui_files = [f for f in os.listdir(os.path.join(ROOT, 'packages/ui/src'))]
print('blocks: %d · core files: %d · ui files: %d' % (len(blocks), len(core_files), len(ui_files)))
print('lines: script %d · css %d' % (len(lines), css.count('\n') + 1))
