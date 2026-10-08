/*
  The modal, as a component — the last piece of the shell.

  `renderModal()` is a dispatcher over about twenty-five modal types, and it has
  two halves:

  - **Whole modals**, built by core in one piece: the start screen, the profile,
    a run's details, the quarter-close animation, another company, the year
    wrap, the end of the run, help, seasons, settings, and a negotiation. Their
    markup is embedded exactly as core builds it.
  - **Composed modals**, where the dispatcher itself writes the head, the body
    and the foot: an event, a result, consequences arriving, the governance
    modals, a negotiation's outcome, the season scanner, the partner offers, the
    amount box, a confirmation, a message. These are assembled here, with the
    same words in the same order — a modal is where the game asks the player for
    something, and the two things that must never move are what it says and which
    control it hands over.

  **Why this is worth doing.** The modal was the one part of the page rewritten
  as a string on every render, and it is the part most likely to be on screen
  while the state changes underneath it: the quarter-close animation runs for
  five seconds, an event card stays open across a render, and the negotiation
  modal has a slider in it. React owning the host means the shell of the box
  survives; the parts that are still core's markup are patched only when their
  text actually changes.

  **Two behaviours of the string version are kept deliberately**, because both
  are about the page rather than about who drew it:

  - `nego` appends a tactic row inside the modal box *after* the modal is drawn.
    With one string for the whole modal there is nothing for React to compose
    around, so the row is appended by an effect that runs on commit and is
    idempotent — create it if it is missing, remove it when the modal is no
    longer a negotiation. That is exactly what the string path does, minus the
    duplicate-it-every-render bug it cannot have.
  - `amount` focuses and selects the box. The ref does it at commit instead of
    in a 30ms timeout, which is the same thing without the race.

  A stale event is handled where the string version handled it: if the event's
  own `cond` no longer holds, the modal is dismissed and nothing is drawn — a
  card about a company that has since failed is not a card.
*/
import { useEffect } from 'react';
import {
  S, UI, D, esc, fmt, pct, clamp, dateLabel, PRINCIPLES,
  optLabel, optHint, evText, evBody, negFmt, archOf, bizById, deedOf, bizAccounts,
  startModal, profileModal, runInfoModal, advanceModal, anotherBizModal,
  yearModal, endModal, helpModal, seasonModal, settingsModal, negoModal,
  negoTacticButtons, govVoteModal
} from '@ledger/core';

/* ---- the frame ---------------------------------------------------------
   `modalHTML()` in core is `<div id="modal"><div class="modalbox" extra>` +
   head + body + foot. The same three parts, as elements, so the box survives a
   re-render. `extra` is a raw attribute string in core's version (the
   governance vote box is the one that uses it), so it is split into attributes
   rather than written as a string: React owns these nodes, and an attribute
   string is not something it can take. */
function attrsFrom(extra) {
  if (!extra) return {};
  const out = {};
  String(extra).replace(/([a-zA-Z-]+)="([^"]*)"/g, (_, k, v) => {
    if (k === 'style') {
      /* a bare style STRING is not a React prop - React wants a mapping - so it
         is parsed into one. The rendered attribute is the same either way. */
      const style = {};
      v.split(';').forEach((pair) => {
        const i = pair.indexOf(':');
        if (i <= 0) return;
        const prop = pair.slice(0, i).trim().replace(/-([a-z])/g, (m, c) => c.toUpperCase());
        style[prop] = pair.slice(i + 1).trim();
      });
      out.style = style;
    } else out[k] = v;
    return '';
  });
  return out;
}

/* head, body and foot are markup core built; `extra` is the raw attribute
   string a couple of modals carry (the vote box sets a max-width). Only one
   modal in the game uses it, so it is optional - and when it is absent the box
   gets no attributes at all, which is what the string path did. */
/**
 * @param {{ head: string, body: string, foot?: string, extra?: string }} props
 */
function Frame({ head, body, foot, extra }) {
  return (
    <div id="modal">
      <div className="modalbox" {...attrsFrom(extra)}>
        <div className="head" dangerouslySetInnerHTML={{ __html: head }} />
        <div className="body" dangerouslySetInnerHTML={{ __html: body }} />
        {foot ? <div className="foot" dangerouslySetInnerHTML={{ __html: foot }} /> : null}
      </div>
    </div>
  );
}

/* core's own whole modals, by type: one string each, embedded as they are */
const WHOLE = {
  start: startModal,
  profile: profileModal,
  anotherbiz: anotherBizModal,
  year: yearModal,
  end: endModal,
  help: helpModal,
  season: seasonModal,
  settings: settingsModal,
  nego: negoModal,
  advance: (M) => advanceModal(M),
  runinfo: (M) => runInfoModal(M.id)
};

function Body({ M }) {
  const whole = WHOLE[M.type];
  if (whole) return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: whole(M) }} />;

  if (M.type === 'event') {
    const ev = M.ev;
    const opts = ev.opts.map((o, i) => {
      let odds;
      try { odds = (typeof o.odds === 'function') ? clamp(o.odds(S), 0, 1) : o.odds; }
      catch (e) { odds = undefined; }   /* a stale option shows no chance rather than throwing */
      return '<button class="opt" data-a="opt" data-i="' + i + '">' +
        '<div class="ol">' + esc(optLabel(o)) + ((odds !== undefined && D().showOdds) ? '<span class="odds">' + pct(odds, 0) + ' chance</span>' : '') + '</div>' +
        '<div class="od">' + esc(optHint(o)) + '</div></button>';
    }).join('');
    const principle = D().coaching ? (ev.principle || PRINCIPLES[ev.id]) : null;
    return (
      <Frame
        head={'<div class="between"><span class="chip ' + (ev.cat === 'biz' ? 'p' : ev.cat === 'money' ? 'b' : ev.cat === 'health' ? 'r' : '') + '">' + (ev.cat || 'life') + '</span>' +
          '<span class="tiny muted">' + dateLabel(S.turn) + '</span></div>' +
          '<h2 style="margin-top:8px;font-size:19px">' + esc(evText(ev)) + '</h2>'}
        body={'<div style="font-size:14.5px;line-height:1.65">' + esc(evBody(ev)) + '</div>' +
          (principle ? '<div class="principle"><b>Coaching note.</b> ' + esc(principle) + '</div>' : '') +
          '<hr class="sep">' + opts}
        foot={'<button class="btn ghost" data-a="close">Not now</button>'}
      />
    );
  }

  if (M.type === 'result') {
    const r = M.res;
    return (
      <Frame
        head={'<span class="chip ' + (r.kind === 'good' ? 'g' : r.kind === 'bad' ? 'r' : '') + '">' + (r.kind === 'good' ? 'Worked out' : r.kind === 'bad' ? 'Cost you' : 'Noted') + '</span>' +
          '<h2 style="margin-top:8px;font-size:18px">' + esc(optLabel(M.opt)) + '</h2>'}
        body={'<div style="font-size:14.5px;line-height:1.6">' + esc(r.text) + '</div>' +
          (r.principle ? '<div class="principle"><b>The principle.</b> ' + esc(r.principle) + '</div>'
            : (D().coaching ? '' : '<div class="tutorial">Turn on Apprentice difficulty in Settings to see the underlying principle behind every decision.</div>'))}
        foot={'<button class="btn primary" data-a="close">Continue</button>'}
      />
    );
  }

  if (M.type === 'pending') {
    return (
      <Frame
        head={'<h2>Consequences arrive</h2>'}
        body={M.items.map((i) => '<div class="logline" style="border-left-color:' +
          (i.kind === 'good' ? 'var(--good)' : 'var(--bad)') + '"><div class="t">' + esc(i.title) + '</div>' + esc(i.text) + '</div>').join('')}
        foot={'<button class="btn primary" data-a="close">Understood</button>'}
      />
    );
  }

  if (M.type === 'govvote') {
    const g = govVoteModal();
    return <Frame head={g.head} body={g.body} foot={g.foot} extra={'style="max-width:620px"'} />;
  }

  if (M.type === 'govappoint') {
    let body = '<div class="tiny muted" style="margin-bottom:9px">Three people a search would put in front of you. None of them are free and all of them will have opinions, which is rather the point.</div>';
    body += M.cands.map((d, i) => {
      const A = archOf(d.arc);
      return '<button class="opt" data-a="pickdir" data-i="' + i + '"><div class="ol">' + esc(d.name) + '<span class="chip b">' + esc(A.label) + '</span></div>' +
        '<div class="od">' + esc(A.blurb) + '. Strongest on <b>' + esc(A.skill) + '</b> (' + Math.round(d.skill[A.skill] || 0) + '). Fee ' + fmt(d.fee) + ' a year. Starts ' +
        (d.loyalty > 66 ? 'loyal' : d.loyalty > 45 ? 'neutral' : 'sceptical') + ' and ' + (d.patience > 60 ? 'patient' : 'impatient') + '.</div></button>';
    }).join('');
    return <Frame head={'<h2>Fill a board seat</h2>'} body={body} foot={'<button class="btn ghost" data-a="close">Not now</button>'} />;
  }

  if (M.type === 'govceo') {
    let body = '<div class="tiny muted" style="margin-bottom:9px">Handing over the day-to-day buys back your time and costs you the last word. The board votes, and they will have views about which one.</div>';
    body += M.cands.map((m, i) =>
      '<button class="opt" data-a="pickceo" data-i="' + i + '"><div class="ol">' + esc(m.name) + '<span class="chip b">' + fmt(m.salary) + ' / quarter</span></div>' +
      '<div class="od">' + esc(m.style) + '. Capability ' + m.skill + '/100.</div></button>').join('');
    return <Frame head={'<h2>Appoint a managing director</h2>'} body={body} foot={'<button class="btn ghost" data-a="close">Not now</button>'} />;
  }

  if (M.type === 'govdeed') {
    const b = bizById(M.biz) || S.biz;
    const dd = deedOf(b);
    const O = [{ k: 'preEmption', label: 'Pre-emption rights', on: 'New shares offered to existing holders first.', off: 'New shares can be placed with anybody.' },
      { k: 'drag', label: 'Drag-along', on: 'A qualifying majority can force everyone to sell.', off: 'Nobody can be dragged into a sale.' },
      { k: 'tag', label: 'Tag-along', on: 'Minorities can join any sale on identical terms.', off: 'Minorities can be left behind.' },
      { k: 'deadlock', label: 'Deadlock mechanism', cyc: true },
      { k: 'infoRights', label: 'Reporting to holders', cyc: true }];
    let body = '<div class="tiny muted" style="margin-bottom:9px">Every one of these cuts both ways, and which way depends entirely on which side of the register you end up on.</div>';
    body += O.map((o, i) => {
      const cur = o.cyc ? String(dd[o.k]) : (dd[o.k] ? o.on : o.off);
      return '<button class="opt" data-a="pickdeed" data-i="' + i + '"><div class="ol">' + esc(o.label) +
        '<span class="chip ' + (o.cyc ? 'b' : (dd[o.k] ? 'g' : 'r')) + '">' + esc(o.cyc ? String(dd[o.k]) : (dd[o.k] ? 'on' : 'off')) + '</span></div>' +
        '<div class="od">Currently: ' + esc(cur) + '</div></button>';
    }).join('');
    return <Frame head={'<h2>Amend the shareholders\u2019 agreement</h2>'} body={body} foot={'<button class="btn ghost" data-a="close">Not now</button>'} />;
  }

  if (M.type === 'govplan') {
    const b = bizById(M.biz) || S.biz;
    const p = M.plan;
    const step = (v) => Math.max(100000, Math.round(v / 120));
    const implied = () => Math.round(p.revenue * Math.max(0, (p.gm / 100) - (p.opex / Math.max(1, p.revenue))));
    let body = '<div class="tiny muted" style="margin-bottom:10px">This is the number the board will hold you to every quarter. ' +
      'Ambitious plans are approved more readily and forgiven considerably less. ' + esc(b.name) + ' did ' + fmt(bizAccounts(b).revTTM) + ' in the last four quarters.</div>';
    body += '<div class="slider"><span>Revenue</span><input type="range" data-inp="planrev" min="0" max="' + Math.round(p.revenue * 2.5) + '" step="' + step(p.revenue) + '" value="' + p.revenue + '"><span class="mono" style="text-align:right">' + fmt(p.revenue) + '</span></div>';
    body += '<div class="slider"><span>Gross margin</span><input type="range" data-inp="plangm" min="5" max="90" step="1" value="' + p.gm + '"><span class="mono" style="text-align:right">' + p.gm + '%</span></div>';
    body += '<div class="slider"><span>Operating costs</span><input type="range" data-inp="planopex" min="0" max="' + Math.round(p.revenue * 0.6) + '" step="' + step(p.opex) + '" value="' + p.opex + '"><span class="mono" style="text-align:right">' + fmt(p.opex) + '</span></div>';
    body += '<div class="slider"><span>Capital spend</span><input type="range" data-inp="plancapex" min="0" max="' + Math.round(p.revenue * 0.35) + '" step="' + step(Math.max(1000000, p.capex)) + '" value="' + p.capex + '"><span class="mono" style="text-align:right">' + fmt(p.capex) + '</span></div>';
    body += '<div class="slider"><span>Headcount</span><input type="range" data-inp="planhead" min="0" max="' + Math.max(6, (p.headcount || 1) * 3) + '" step="1" value="' + (p.headcount || 1) + '"><span class="mono" style="text-align:right">' + (p.headcount || 1) + '</span></div>';
    body += '<div class="kv"><span><b>Implied EBITDA</b></span><span class="mid">' + fmt(implied()) + '</span></div>';
    body += '<div class="tiny muted" style="margin-top:7px">The board votes on this as an ordinary resolution. Once approved, every director\u2019s patience and loyalty moves with your variance against it.</div>';
    return (
      <Frame head={'<h2>Operating plan for ' + esc(b.name) + '</h2>'} body={body}
        foot={'<button class="btn primary" data-a="submitplan">Put it to the board</button><button class="btn ghost" data-a="close">Not now</button>'} />
    );
  }

  if (M.type === 'govopt') {
    const b = bizById(M.biz) || S.biz;
    let body = '<div class="tiny muted" style="margin-bottom:10px">Unallocated pool: ' + pct((b.pool || 0) / 100, 1) + '. ' +
      'Options vest over four years and dilute every holder, including you, on an exit.</div>';
    if (!(b.staff || []).length) body += '<div class="tiny muted">There is nobody to grant options to.</div>';
    (b.staff || []).forEach((st) => {
      const has = st.options ? pct(st.options.pct / 100, 2) + ' already granted' : 'nothing granted';
      body += '<button class="opt" data-a="dogrant" data-s="' + st.id + '" data-p="1"><div class="ol">' + esc(st.name) +
        '<span class="chip b">' + esc(st.role || 'staff') + '</span></div><div class="od">' + esc(has) +
        ' · skill ' + st.skill + '/10 · morale ' + Math.round(st.morale || 0) + '. Granting 1% here moves loyalty and morale a long way, and costs you on exit.</div></button>';
    });
    return <Frame head={'<h2>Grant options</h2>'} body={body} foot={'<button class="btn ghost" data-a="close">Not now</button>'} />;
  }

  if (M.type === 'govfin') {
    const t = (S.mkt.targets || []).find((x) => x.id === M.tid);
    if (!t) { UI.modal = null; return null; }
    const b = bizById(M.bid) || S.biz;
    let body = '<div class="tiny muted" style="margin-bottom:9px">' + esc(t.name) + ' at ' + fmt(M.price) +
      '. Company cash: ' + fmt(b.cash || 0) + '. Your personal cash: ' + fmt(S.fin.cash) + '.</div>';
    body += [['cash', 'Cash', 'Straight from the company\u2019s balance sheet. Cleanest, and it empties the thing you need for working capital.'],
      ['debt', 'Bank facility', '65% borrowed at 5.5% a quarter, secured on the target. The bank will want covenants.'],
      ['seller', 'Seller note', '45% left with the vendors at 3.5% a quarter. Cheaper money, and they stay in the business.']]
      .map((r) => '<button class="opt" data-a="pickfin" data-k="' + r[0] + '"><div class="ol">' + esc(r[1]) + '</div><div class="od">' + esc(r[2]) + '</div></button>').join('');
    return <Frame head={'<h2>How is it paid for?</h2>'} body={body} foot={'<button class="btn ghost" data-a="close">Not now</button>'} />;
  }

  if (M.type === 'negoResult') {
    const r = M.res, N = S.nego;
    const kind = r.status === 'deal' ? 'good' : r.status === 'walked' ? 'bad' : 'warn';
    return (
      <Frame
        head={'<span class="chip ' + (kind === 'good' ? 'g' : kind === 'bad' ? 'r' : '') + '">' +
          (r.status === 'deal' ? 'Agreed' : r.status === 'walked' ? 'Broken off' : 'No agreement') + '</span>' +
          '<h2 style="margin-top:8px;font-size:19px">' + esc(N ? N.title : 'Negotiation') + '</h2>'}
        body={'<div style="font-size:14.5px;line-height:1.65">' + esc(r.text) + '</div>' +
          (r.gaveTerm ? '<div class="tiny muted" style="margin-top:8px">You gave: ' + esc(r.gaveTerm) + '</div>' : '') +
          (r.status === 'deal' && N ? '<div class="principle"><b>The number.</b> ' + negFmt(N.kind, r.value) + ', against a range of ' + negFmt(N.kind, N.low) + ' to ' + negFmt(N.kind, N.high) + '.</div>' : '')}
        foot={'<button class="btn primary" data-a="negclose">Continue</button>'}
      />
    );
  }

  if (M.type === 'seasonscan') {
    return (
      <Frame head={'<h2>Scan a season code</h2>'}
        body={'<div class="small muted" style="margin-bottom:10px">Point the camera at the QR code ' +
          'whoever started the season is showing you.</div>' +
          '<div id="scanHost" style="width:100%;background:#000;border-radius:10px;overflow:hidden;min-height:220px"></div>' +
          '<div class="tiny muted" style="margin-top:8px">Nothing is sent anywhere. The code is read ' +
          'on your device and filled into the join box.</div>'}
        foot={'<button class="btn ghost" data-a="seasonscancancel">Cancel</button>'} />
    );
  }

  if (M.type === 'partner') {
    /* One modal, two different transactions, and it has to say which it is - see
       the string version for the story of the heading they used to share. */
    const starting = M.mode !== 'join';
    const body = M.offers.map((o, i) =>
      '<div style="border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:9px">' +
      '<div class="between"><b>' + esc(o.name) + '</b><span class="chip p">' + o.equity + '% for ' + fmt(o.capital) + '</span></div>' +
      '<div class="tiny muted" style="margin:5px 0">' + o.bg + '. Brings <b>' + o.skill + '</b>. ' + o.ask + '.</div>' +
      '<div class="tiny muted">Starting trust: ' + o.trust + '/100. You can buy them out later, at a premium that rises as trust falls.</div>' +
      '<div class="row wrap" style="gap:6px;margin-top:8px">' +
      (starting
        ? '<button class="btn sm primary" data-a="acceptpartner" data-i="' + i + '">Shake hands</button>'
        : '<button class="btn sm primary" data-a="takepartner" data-i="' + o.id + '">Shake hands</button>' +
          '<button class="btn sm ghost" data-a="declineoffer" data-i="' + o.id + '">Not now</button>') +
      '</div></div>').join('');
    return (
      <Frame head={'<h2>' + (starting ? 'Start with a partner' : 'Partnership offers') + '</h2>'} body={body}
        foot={'<button class="btn ghost" data-a="close">' + (starting ? 'No thanks' : 'Not interested') + '</button>'} />
    );
  }

  if (M.type === 'amount') {
    return (
      <Frame head={'<h2>' + esc(M.title) + '</h2>'}
        body={'<div class="small muted" style="margin-bottom:10px">' + M.note + '</div>' +
          '<input type="text" class="mono" id="amtBox" value="' + M.def + '" style="font-size:16px">' +
          '<div class="tiny muted" style="margin-top:6px">You can write 500k, 2m, 1.5bn.</div>'}
        foot={'<button class="btn primary" data-a="okamount">Confirm</button><button class="btn ghost" data-a="close">Cancel</button>'} />
    );
  }

  if (M.type === 'confirm') {
    return (
      <Frame head={'<h2>' + esc(M.title) + '</h2>'} body={'<div class="small">' + M.text + '</div>'}
        foot={'<button class="btn bad" data-a="okconfirm">' + esc(M.okLabel || 'Confirm') + '</button><button class="btn ghost" data-a="close">Cancel</button>'} />
    );
  }

  if (M.type === 'message') {
    return (
      <Frame head={'<h2>' + esc(M.title) + '</h2>'} body={'<div class="small">' + M.text + '</div>'}
        foot={'<button class="btn primary" data-a="close">Close</button>'} />
    );
  }

  /* endx, and anything a future version adds that this one does not know: an
     empty host. A modal type nobody has converted yet must draw NOTHING, not
     half a box - and `renderModal()` still has the whole dispatcher for the
     single file, where this component does not exist. */
  return null;
}

/* The host element is handed in rather than wrapped: React is rooted ON
   `#modalHost`, so a wrapper would put the modal one level deeper than the game
   puts it and every `#modal` rule would still match while the container's direct
   child changed. The effects need the element; a prop is the honest way to give
   it to them. */
export default function Modal({ host }) {
  const M = UI.modal;

  /* the one thing the string version did after drawing: a negotiation's tactic
     row lives inside the modal box, and the box is a string */
  useEffect(() => {
    if (!host) return;
    const box = host.querySelector('.modalbox');
    if (!box) return;
    const has = box.querySelector(':scope > .negoacts');
    if (M && M.type === 'nego' && !has) {
      const wrap = document.createElement('div');
      wrap.className = 'negoacts';
      wrap.innerHTML = negoTacticButtons();
      box.appendChild(wrap);
    } else if ((!M || M.type !== 'nego') && has) {
      has.remove();
    }
  });

  /* the amount box takes the cursor, as it always has */
  useEffect(() => {
    if (!M || M.type !== 'amount') return;
    const el = host.querySelector('#amtBox');
    if (el) { el.focus(); el.select(); }
  });

  let inner = null;
  if (M) {
    if (M.type === 'endx') inner = null;
    else if (M.type === 'event') {
      /* an event can go stale while it is still open; see the string version */
      const ev = M.ev;
      let dead = false;
      if (ev.cond) {
        try { if (!ev.cond(S)) dead = true; } catch (e) { dead = true; }
      }
      if (dead) { UI.modal = null; inner = null; }
      else inner = <Body M={M} />;
    } else inner = <Body M={M} />;
  }

  return inner;
}
