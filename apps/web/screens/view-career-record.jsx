/*
  Legacy › Your record — what every finished run says about you.

  One card, and it is the profile's: how many runs, how many years, a band and a
  note, the challenge index this run is being played at, your best figures, and
  then every run newest-first with the one line it ended on.

  Two readings on it are easy to get subtly wrong and are kept exactly:

  - the experience bar is drawn **dim** when there is no rating yet
    (`sk === null` draws 45 and grey), because a bar at zero and a bar with no
    answer are different things;
  - the run list's left border is a colour with a meaning — green for a
    retirement, red for bankruptcy, amber for anything else — and the same colour
    drives the chip beside the rank.

  The tier table is embedded (`DIFFS`), the run rows carry `data-i` because the
  profile modal opens by id, and `MAX_RUNS` is printed from the same constant the
  profile trims to, so the sentence about older runs cannot go stale.
*/
import { S, fmt, esc, bar, DIFFS, MAX_RUNS, profileSummary, ensureProfile, challengeLabel, profileHeadHTML } from '@ledger/core';

const toneClass = (tone) => (tone === 'bad' ? 'r' : tone === 'warn' ? 'y' : tone === 'good' ? 'g' : '');

export default function ViewCareerRecord() {
  const ps = profileSummary();
  const pr = ensureProfile();
  const runs = (pr.runs || []).slice().reverse();
  const sk = ps.skill;
  const t = S && S.tune ? S.tune : null;

  /* Who this is and whether their progress is safe — the same card the string
     path draws, embedded rather than restated, so the two renderers cannot drift
     by a word. */
  const head = profileHeadHTML(pr, ps);

  return (
    <>
    <div dangerouslySetInnerHTML={{ __html: head }} />
    <div className="card">
      <h3>
        Your record <span className="tag">{ps.n} run{ps.n === 1 ? '' : 's'}{ps.n ? ' · ' + Math.round(ps.years) + ' years played' : ''}</span>
      </h3>

      <div className="statline">
        <span className="lbl">Experience</span>
        <span dangerouslySetInnerHTML={{
          __html: bar(sk === null ? 45 : sk, 100,
            sk === null ? 'var(--dim)' : sk > 60 ? 'var(--bad)' : sk > 46 ? 'var(--warn)' : 'var(--good)')
        }} />
        <span className="val">{sk === null ? '—' : Math.round(sk)}</span>
      </div>

      <div className="between" style={{ marginBottom: '5px' }}>
        <b>{ps.band.label}</b>
        <span className={'chip ' + toneClass(ps.band.tone)}>{pr.handle ? pr.handle : 'no handle set'}</span>
      </div>
      <div className="tiny muted" style={{ marginBottom: '8px' }}>{ps.band.note}</div>

      {t ? (
        <div className="principle" style={{ marginBottom: '9px' }}>
          <b>This run — {challengeLabel(t)}.</b>{' '}
          Shocks ×{t.shock.toFixed(2)} · failure ×{t.fail.toFixed(2)} · inflation ×{t.infl.toFixed(2)} ·
          pay ×{t.pay.toFixed(2)} · talent market ×{(t.talent || 1).toFixed(2)} · official heat ×{(t.heat || 1).toFixed(2)}
          {' '}— on top of {(DIFFS[t.tier] || {}).name || t.tier} (challenge index {t.ci}).{' '}
          {t.skill === null
            ? 'You have no record yet, so nothing is being adjusted.'
            : 'Set from a rating of ' + t.skill + ' across ' + (pr.runs || []).length + ' recorded run' +
              ((pr.runs || []).length === 1 ? '' : 's') + '. Beat it and this number goes up; there is no point ' +
              'at which it stops rising.'}
        </div>
      ) : null}

      {ps.n ? (
        <>
          <div className="grid g3" style={{ gap: '8px', marginBottom: '8px' }}>
            <div><div className="tiny muted">Best worth (real)</div><div>{fmt(ps.bestNW)}</div></div>
            <div><div className="tiny muted">Best freedom</div><div>{ps.bestFreedom}</div></div>
            <div><div className="tiny muted">Best run rating</div><div>{ps.bestQuality}</div></div>
          </div>
          {Object.keys(ps.byDiff).length ? (
            <div className="tiny muted" style={{ marginBottom: '8px' }}>
              Tiers played:{' '}
              {Object.keys(ps.byDiff).map((k) => ((DIFFS[k] || {}).name || k) + ' ×' + ps.byDiff[k]).join(' · ')}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="row wrap" style={{ gap: '5px', marginBottom: '8px' }}>
        <button className="btn xs" data-a="profile">Profile, sync &amp; export</button>
      </div>

      {!ps.n ? (
        <div className="small muted">
          No finished runs yet. The record starts the first time a run ends — at 65, after 42 years, or earlier
          than either if it goes badly.
        </div>
      ) : (
        <>
          <hr className="sep" />
          <div className="tiny muted" style={{ marginBottom: '6px' }}>
            Every run, newest first. Open one to see what you did and what it cost you.
          </div>
          {runs.slice(0, 8).map((r) => {
            const tone = r.reason === 'retire' ? 'g' : r.reason === 'bankrupt' ? 'r' : 'y';
            const col = tone === 'g' ? 'var(--good)' : tone === 'r' ? 'var(--bad)' : 'var(--warn)';
            return (
              <div className="logline" key={r.id} data-a="runinfo" data-i={r.id}
                style={{ borderLeftColor: col, cursor: 'pointer' }}>
                <div className="t">{String(r.ended || '').slice(0, 10)}</div>
                <b>{r.rank || '—'}</b>{' '}
                <span className={'chip ' + tone}>{(DIFFS[r.difficulty] || {}).name || r.difficulty}</span>{' '}
                <span className="tiny muted">{r.years} yrs · {fmt(r.nwReal || 0)} real · freedom {r.freedom}</span>
                <div className="tiny muted">{String(r.epitaph || '').slice(0, 110)}</div>
              </div>
            );
          })}
          {runs.length > 8 ? (
            <div className="tiny muted" style={{ marginTop: '6px' }}>
              {runs.length - 8} earlier runs not shown. The profile keeps the last {MAX_RUNS}.
            </div>
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
