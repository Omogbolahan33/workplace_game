/*
  Legacy › Season — the finish line, what the run is scored on, and the board.

  Three cards, and the middle one is the honest part: a season is not scored on
  net worth alone, so the six axes are shown with their weights and with the
  reason each one is on the list. The score in the first card is a **live
  projection** while the run is going, and the card says so in as many words —
  "where this run stands right now, not where it will finish" — because a number
  that looks final and is not is the worst thing a scored screen can show.

  Two states matter here and both are converted: not in a season (a single card
  explaining what a season is and where to set one), and in one (the three
  cards). `seasonRefreshLeaderboard()` is called before the board is read, the
  same side effect the string version keeps: the board is whatever that call
  left in `S._lb`, and skipping it would quietly show the previous quarter's
  table.

  The axis bars and the three headline figures are core's own `bar()` and
  `bigStat()` embedded, not re-drawn: `bigStat()` is on six screens and a second
  definition of it would drift the first time one of them changed.
*/
import { S, bar, bigStat, esc, seasonStatus, scoreRun, seasonRefreshLeaderboard, cloudReady, seedName, SEASON_AXES } from '@ledger/core';

function NotInASeason() {
  return (
    <div className="card">
      <h3>Season <span className="tag">not in one</span></h3>
      <div className="small" style={{ lineHeight: '1.7' }}>
        This run has no finish line. It ends when it ends — retirement at 65, collapse, or turn 168.<br /><br />
        A season is the alternative: an end date fixed before you begin, a shared seed,
        and a score out of 1000 that lets several people play the same run and be compared.
        You set one from the start screen when you begin your next run.
      </div>
    </div>
  );
}

function HeadCard({ s, st, sc, live }) {
  return (
    <div className="card">
      <h3>{s.name || 'Season'} <span className="tag">{s.code}</span></h3>
      <div className="grid g3" style={{ marginTop: '8px' }}>
        <div dangerouslySetInnerHTML={{ __html: bigStat('Ends', 'Q' + st.end.q + ' ' + st.end.year, (st.total || 0) + ' quarters in all') }} />
        <div dangerouslySetInnerHTML={{ __html: bigStat('Left', st.left + '', live ? 'quarters to the finish line' : 'the run is over', (st.left !== undefined && st.left <= 4) ? 'warn' : '') }} />
        <div dangerouslySetInnerHTML={{ __html: bigStat('Your score', sc.total + '', 'out of 1000') }} />
      </div>
      <div className="tiny muted" style={{ marginTop: '8px' }}>
        World <b>{s.seed ? seedName(s.seed) : 'random'}</b> · hard stop at the finish line
        {' · '}conditions pinned, so everybody in this season faces the same world however much they have played
        {s.organiser ? ' · you created this season' : ''}.{' '}
        {live
          ? <>The score below is where this run stands <b>right now</b>, not where it will finish.</>
          : 'The run is finished. This is the score that was submitted.'}
      </div>
    </div>
  );
}

function AxesCard({ sc }) {
  return (
    <div className="card">
      <h3>Scored on six axes <span className="tag">{sc.rank}</span></h3>
      <div className="tiny muted" style={{ marginBottom: '9px' }}>
        A season is not scored on net worth alone. You can get rich by running a business into the ground,
        and a leaderboard that rewards that is a leaderboard nobody should believe.
      </div>
      {SEASON_AXES.map((ax) => {
        const v = sc.axes[ax.id] || 0;
        return (
          <div key={ax.id} style={{ marginBottom: '9px' }}>
            <div className="between">
              <span className="tiny"><b>{ax.label}</b> <span className="muted">{ax.weight}%</span></span>
              <span className="mono tiny">{v.toFixed(0)}<span className="muted">/100</span></span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: bar(v, 100, 'var(--acc)') }} />
            <div className="tiny muted" style={{ marginTop: '2px' }}>{ax.why}</div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({ sc, code, rows, online }) {
  return (
    <div className="card">
      <h3>The board <span className="tag">
        {rows.length ? rows.length + ' entr' + (rows.length === 1 ? 'y' : 'ies') : 'empty'}
      </span></h3>
      {!online ? (
        <div className="tiny muted">
          You are not signed in, so this board cannot be read.
          The season itself plays fine offline — your score is submitted automatically
          at the end if you sign in before then.
        </div>
      ) : !rows.length ? (
        <div className="tiny muted">Nobody has posted a score yet. Finish the season and yours will appear here.</div>
      ) : (
        <>
          <table className="tbl">
            <thead><tr><th>#</th><th>Player</th><th>Score</th><th>Rank</th></tr></thead>
            <tbody>
              {rows.map((r, i) => {
                /* your own row: same name and the same total the last submit scored */
                const mine = r.player === (S.name || 'Anonymous') &&
                  Math.abs((r.total || 0) - (S._submitted === code ? sc.total : -1)) === 0;
                const sco = (r.score || {});
                return (
                  <tr key={i} style={mine ? { background: 'rgba(255,255,255,.04)' } : undefined}>
                    <td className="mono">{i + 1}</td>
                    <td>{r.player || '—'}{mine ? <> <span className="chip g">you</span></> : null}</td>
                    <td className="mono"><b>{r.total || 0}</b></td>
                    <td className="tiny muted">{sco.rank || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="tiny muted" style={{ marginTop: '7px' }}>
            Scores are written once, at the end of each run,
            and each player holds one place on the board.
          </div>
        </>
      )}
    </div>
  );
}

export default function ViewSeason() {
  const s = S.season;
  if (!s) return <NotInASeason />;

  const st = seasonStatus() || {};
  const sc = scoreRun();
  const live = !S.gameOver;
  const code = s.code;
  seasonRefreshLeaderboard(code);
  const rows = S._lb || [];
  const online = cloudReady();

  return (
    <>
      <HeadCard s={s} st={st} sc={sc} live={live} />
      <AxesCard sc={sc} />
      <BoardCard sc={sc} code={code} rows={rows} online={online} />
    </>
  );
}
