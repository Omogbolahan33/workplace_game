import Game from './game.jsx';

/*
  The shell. Eight elements, exactly the ones the game's renderers expect, and
  the only markup React is responsible for at this point in the migration.

  Kept as JSX rather than an injected HTML string on purpose: this is the part
  that becomes React, screen by screen, and it should be readable as structure
  from the first commit.
*/
export default function Page() {
  return (
    <>
      <div id="top">
        <div className="toprow" id="toprow" />
        <div id="tabwrap">
          <div className="tabs" id="tabs" />
          <div id="subrow">
            <div className="subs" id="subs" />
            <div id="why" />
          </div>
        </div>
      </div>
      <div id="main" />
      <div id="modalHost" />
      <div id="toastHost" />
      <Game />
    </>
  );
}
