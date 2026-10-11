import Game from './game.jsx';

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
      {/* the scene behind every screen: written by the ui's worldSync(), never by React */}
      <div id="scene" />
      <div id="main" />
      <div id="modalHost" />
      <div id="toastHost" />
      <Game />
    </>
  );
}
