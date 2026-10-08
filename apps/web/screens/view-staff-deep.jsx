/*
  Work › Business — "Team".

  The first converted screen with dropdowns on it: every person's role and the
  unit they are assigned to are `<select>` elements, and until this screen was
  converted the gate could not see them at all (it read `input`, and a select is
  not an input, and these carry `data-role` / `data-outlet` rather than `data-a`).
  So the gate was taught to compare selects - their target attribute, their
  selected value and their whole option list - before this file was written,
  rather than after the first time one came out wrong.

  The GM option rule is kept exactly: "make someone a general manager" only
  appears for someone at skill 6 or better who is not already one. It is a
  conditional option, not a disabled one, and the row above it explains why.
*/
import { S, fmt, bar, staffMonthly, TRAITS, STAFF_ROLES, hasGM } from '@ledger/core';

export default function ViewStaffDeep() {
  const b = S.biz;
  if (!b) return null;

  const staff = b.staff || [];
  const outlets = b.outlets || [];
  const moraleColour = (m) => (m > 60 ? 'var(--good)' : m > 35 ? 'var(--warn)' : 'var(--bad)');

  return (
    <div className="card">
      <h3>Team <span className="tag">{staff.length} staff · {fmt(staffMonthly(b))}/mo</span></h3>

      {!staff.length ? (
        <div className="small muted">
          No staff. You are the operations department, the sales team and the cleaner.
        </div>
      ) : (
        <>
          <table>
            <tr>
              <th>Name</th><th>Role</th><th>Unit</th><th className="num">Skill</th>
              <th className="num">Salary</th><th>Morale</th><th></th>
            </tr>
            {staff.map((st) => {
              const tr = TRAITS.find((x) => x.id === st.trait) || { name: '—' };
              return (
                <tr key={st.id}>
                  <td>{st.name}<div className="tiny muted">{tr.name}</div></td>
                  <td>
                    <select data-role={st.id} style={{ fontSize: '11px', padding: '2px' }}>
                      {Object.keys(STAFF_ROLES)
                        .filter((k) => k !== 'gm' || st.role === 'gm' || st.skill >= 6)
                        .map((k) => (
                          <option key={k} value={k} selected={(st.role || 'ops') === k}>
                            {STAFF_ROLES[k].label}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <select data-outlet={st.id} style={{ fontSize: '11px', padding: '2px' }}>
                      <option value="" selected={!st.outlet}>— none —</option>
                      {outlets.map((o) => (
                        <option key={o.id} value={o.id} selected={st.outlet === o.id}>{o.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="num">
                    {st.skill}/10{st.trained ? <span className="tiny good"> +{st.trained}</span> : null}
                  </td>
                  <td className="num">{fmt(st.salary)}</td>
                  <td><div dangerouslySetInnerHTML={{ __html: bar(st.morale, 100, moraleColour(st.morale)) }} /></td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn xs" data-a="trainstaff" data-s={st.id}>Train</button>{' '}
                    <button className="btn xs" data-a="raisenego" data-s={st.id}>Pay review</button>{' '}
                    {st.role !== 'gm' && st.skill >= 6 && !hasGM(b)
                      ? <><button className="btn xs" data-a="promotegm" data-s={st.id}>Make GM</button>{' '}</>
                      : null}
                    <button className="btn xs bad" data-a="firenego" data-s={st.id}>Let go</button>
                  </td>
                </tr>
              );
            })}
          </table>
          <div className="tiny muted" style={{ marginTop: '8px' }}>
            A general manager frees your attention and lets you run other things. Someone assigned to a unit
            works better there; unassigned staff in a multi-unit business lose effectiveness.
          </div>
        </>
      )}
    </div>
  );
}
