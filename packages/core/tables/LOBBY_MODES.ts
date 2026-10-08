/*
  LOBBY_MODES — from 26-governance-register-board.js, typed here and spliced back into the transcript
  by tools/tables.mjs. Edit this file, never the built single file.

  The literal below is character for character what the game has always run:
  the annotation on the declaration line is the only thing TypeScript added,
  and the splicer removes it. Do not reformat it.
*/
interface LOBBY_MODESShape {
  label: string;
  cost: number;
  push: number;
  note: string;
}
interface LOBBY_MODESShape2 {
  brief: LOBBY_MODESShape;
  concede: LOBBY_MODESShape;
  pay: LOBBY_MODESShape;
  equity: LOBBY_MODESShape;
  pressure: LOBBY_MODESShape;
  favour: LOBBY_MODESShape;
}

const LOBBY_MODES: LOBBY_MODESShape2 = {
  brief:   {label:'Brief them yourself', cost:0,     push:16, note:'An evening of your time. Works better the better you know people.'},
  concede: {label:'Promise them something', cost:0,  push:30, note:'They will hold you to it. Break it and the whole board hears.'},
  pay:     {label:'A consulting fee', cost:1200000, push:34, note:'Cash. Fast, effective, and a permanent entry in somebody\u2019s file.'},
  equity:  {label:'Shares out of your own holding', cost:0, push:38, note:'Permanent dilution, and they become harder to remove.'},
  pressure:{label:'Lean on them', cost:0, push:22, note:'Your reputation does the work. It costs loyalty even when it succeeds.'},
  favour:  {label:'Call in a favour', cost:0, push:28, note:'Needs someone in your network who owes you, and it uses the favour up.'}
};
