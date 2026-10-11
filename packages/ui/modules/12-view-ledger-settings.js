
/* ── Legacy › Settings, redesigned (the redesign's phase 1) ─────────────────
   What was wrong with it, measured: 1,955 characters of text in the way, the
   longest single block 227, and ten thousand more characters of save string
   unfolded in the middle of the page — on a screen a player opens to *do* three
   things. The controls were buried between paragraphs and the paragraphs
   explained the controls.

   What it is now: four cards that each lead with their controls, one line of
   status per row, and three explanations folded behind a `Why` — closed until
   asked for. The portable save string is behind a disclosure, which is what
   machine text is for.

   Nothing was removed. The same controls fire the same actions; the check that
   proves it is `node tools/textaudit.mjs --check`, which fails if an action
   loses its control anywhere in the game. */
/* The row itself is core's (`saveSlotRowHTML`), because the app's React screen
   draws it too and a converted screen may not reach back into the ui package
   that called it. This file supplies the one thing core cannot read for itself:
   the blob, from localStorage. */
import { CITIES, D, S, SAVE, buildStamp, diffListHTML, esc, exportStr, saveSlotRowHTML, savedAtLabel } from '@ledger/core';
import { saveInfo } from './01-view-working-capital.js';
import { viewLedgerChronicle } from './11-view-legacy.js';
import { _installEvt } from './17-actions.js';

/* Generated from src/12-view-ledger-settings.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export function slotRowHTML(slot, label){ return saveSlotRowHTML(slot, label, saveInfo(slot)); }
export function viewLedgerSettings(){
  let h = buildStamp();

  /* 1. this run: what is saved, and whether it is being saved for you */
  const hardcore = !D().saveScum;   /* the tier with no rewinding is Hardcore */
  h += '<div class="card"><h3>Save &amp; load</h3>'+
    '<div class="stiles">'+slotRowHTML('s1','Slot 1') + slotRowHTML('s2','Slot 2') + slotRowHTML('s3','Slot 3')+'</div>'+
    '<div class="tiny '+(hardcore?'':'muted')+'" style="margin-top:9px'+(hardcore?';color:var(--warn)':'')+'">'+
      (hardcore ? 'Hardcore: nothing is auto-saved. Save a slot before you close.'
                : 'Auto-saved after every move'+(SAVE.at ? ' \u00b7 last at '+savedAtLabel() : '')+'.')+
    '</div>'+
    '<details class="fold"><summary>Why autosave</summary><div>'+
      'Autosave runs every quarter'+(D().saveScum?'. You may reload it freely — this is the honest way to explore consequences.'
        :'. On Hardcore there is one slot and it overwrites every quarter. There is no rewind.')+
    '</div></details></div>';

  /* 2. the run's rules: the tier you are on, and where you are playing */
  h += '<div class="card" style="margin-top:12px"><h3>Run settings</h3>'+
    diffListHTML()+
    '<details class="fold"><summary>Changing your mind</summary><div>'+
      'Difficulty is not locked. Change it whenever you like — the world simply becomes gentler or less so '+
      'from that quarter onward.'+
    '</div></details>'+
    '<hr class="sep">'+
    '<div class="between" style="margin-bottom:6px"><span class="tiny muted">Location</span>'+
      '<span class="tiny muted">re-bases prices, wages, rent and inflation</span></div>'+
    '<div class="row wrap">'+CITIES.map(function(c){
      return '<button class="btn xs '+(S.city===c.id?'primary':'')+'" data-a="setcity" data-c="'+c.id+'">'+c.label+'</button>';
    }).join('')+'</div>'+
    '<details class="fold"><summary>Why locations</summary><div>'+
      'Switching re-bases local prices, wages, rent and inflation. Useful if you want to replay the same run '+
      'in a different economy.'+
    '</div></details></div>';

  /* 3. the device: whether this thing installs, and what it would carry */
  h += '<div class="card" style="margin-top:12px"><h3>Device &amp; data</h3>'+
    '<div class="tiny muted" id="installNote">LEDGER keeps no external resources — it runs with the network off.</div>'+
    '<div class="row wrap" style="margin-top:8px">'+(_installEvt?'<button class="btn sm primary" data-a="installapp">Install app</button>':'')+
    '</div>'+
    '<hr class="sep">'+
    '<details class="fold"><summary>Portable save string \u00b7 '+Math.round(exportStr().length/1024)+' KB</summary>'+
      '<textarea id="exp" rows="4" style="font-size:11px;margin-top:6px" onclick="this.select()">'+esc(exportStr())+'</textarea>'+
      '<div class="row wrap" style="margin-top:8px">'+
      '<button class="btn sm" data-a="copyexp">Copy</button>'+
      '<button class="btn sm" data-a="import">Import from box</button></div>'+
    '</div></details>'+
    '<div class="row wrap" style="margin-top:10px;gap:5px;align-items:center">'+
      '<button class="btn sm bad" data-a="restart">Abandon run</button>'+
      '<span class="tiny muted">ends this life and returns to setup — export first if you want it back</span>'+
    '</div></div>';

  /* 4. the one setting about the interface itself */
  const hid = Object.keys(S.why||{}).length;
  h += '<div class="card" style="margin-top:12px"><h3>Screen tips</h3>'+
    '<div class="tiny muted" style="margin-bottom:8px">Every screen carries one line on why it exists, '+
    'behind the <b>?</b> in the bar above it. '+
    (hid ? 'You have taken '+hid+' of them away.' : 'None taken away yet.')+'</div>'+
    '<button class="btn sm" data-a="showwhy"'+(hid?'':' disabled aria-disabled="true" title="Every tip is already showing — dismiss one first"')+'>Show all tips again</button></div>';
  return h;
}
/* Kept whole for anyone still calling it; the router uses the pieces. */
export function viewLedger(){
  return '<div class="grid g2"><div>' + viewLedgerChronicle() + '</div><div>' + viewLedgerSettings() + '</div></div>';
}
