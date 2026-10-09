import Game from './game.jsx';
import THREE_SRC from '../../../packages/ui/vendor/three-world.text.mjs';

/* The 3D world's renderer: the same committed slice of three.js the single
   file carries (tools/vendor-three.mjs), inlined the same way - as inert text
   the world evaluates the first time it is shown. This is a server component,
   so the string lands in the HTML and is not shipped again as client code. */

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
      <script type="text/plain" id="three-src" dangerouslySetInnerHTML={{ __html: THREE_SRC }} />
      <Game />
    </>
  );
}
