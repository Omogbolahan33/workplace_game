/* =========================================================================
   The world, drawn
   ========================================================================= */
/* core's worldModel() says what the city contains; this draws it. The page
   carries the renderer as inert text (<script type="text/plain"
   id="three-src">, built by tools/vendor-three.mjs) and it is evaluated the
   first time a world is on screen, so a player who never looks at it never pays
   to parse it.

   Three rules this file keeps:
   - it draws and never decides. Navigation is the labels' job, and the labels
     are ordinary buttons with ordinary actions: a tap on a building clicks its
     label, so every move still goes through the one dispatcher, is measured
     there and saved there.
   - it never breaks the game. No WebGL, no renderer, a lost context: the world
     stays a list of working places (the `.flat` look), and nothing else on the
     page knows.
   - it costs nothing when nobody is looking. The loop runs while the world is on
     the page and the tab is visible, slows to idle after a few seconds without
     a move, and stops when the world leaves the page.

   No binding in this file can be read before it exists. boot() runs at the end
   of the actions section, and a restored run renders at once - before this
   section has run in the single file, and possibly before this module has been
   evaluated in the app. So the state is a bare `var` (hoisted, undefined, never
   reset by an initialiser) and the colour tables are functions. A `let` here
   threw on every reload of a saved run. */
import { UI, worldModel } from '@ledger/core';
import { render } from './03-render.js';

/* Generated from src/18-world.js by tools/tomodules.mjs. Edit the section in src/, not this file. */
export var WORLD;

/* the renderer, from the page's own copy of three.js */
export function threeLib(){
  const w = /** @type {any} */ (window);
  if(w.THREE) return w.THREE;
  const src = document.getElementById('three-src');
  if(!src || !src.textContent) return null;
  const s = document.createElement('script');
  s.textContent = src.textContent;
  document.head.appendChild(s);
  return w.THREE || null;
}
/* A context is asked for before three.js is: a renderer that fails to get one
   logs an error, and a page that cannot draw 3D is not an error, it is a phone. */
export function worldGL(){
  const c = document.createElement('canvas');
  if(typeof c.getContext !== 'function') return null;
  const ctx = c.getContext('webgl2') || c.getContext('webgl');
  return ctx ? {canvas:c, ctx:ctx} : null;
}

export function worldTone(k){
  return ({good:'#4cc38a', bad:'#e5484d', warn:'#f5a524', info:'#5aa9ff', acc:'#f5b301'})[k] || '#ece6da';
}
export function worldSky(k){
  return ({good:'#0f1d18', bad:'#1c1115', warn:'#1c1a11', info:'#0f1726'})[k] || '#0e1620';
}

export function worldInit(){
  const gl = worldGL();
  const T = gl ? threeLib() : null;
  if(!gl || !T) return {flat:true};
  const renderer = new T.WebGLRenderer({canvas:gl.canvas, context:gl.ctx, antialias:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
  const hemi = new T.HemisphereLight(0xe6eeff, 0x3a3020, 2.1);
  const sun = new T.DirectionalLight(0xfff1d6, 2.9);
  sun.position.set(-26, 52, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 140;
  scene.add(hemi, sun);
  const root = new T.Group();
  scene.add(root);
  gl.canvas.className = 'world-canvas';
  gl.canvas.addEventListener('click', worldTap);
  gl.canvas.addEventListener('webglcontextlost', function(ev){ ev.preventDefault(); worldFlat(); });
  return {T:T, renderer:renderer, scene:scene, camera:camera, root:root, canvas:gl.canvas,
          mats:{}, picks:[], walkers:[], sig:'', focus:null,
          view:{x:0, z:0, size:30}, goal:{x:0, z:0, size:30},
          raf:0, last:0, drawn:0, idleAt:0, host:null, stage:null, w:0, h:0,
          still: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)};
}
/* from here on this session draws the list, not the city */
export function worldFlat(){
  if(WORLD && WORLD.raf) cancelAnimationFrame(WORLD.raf);
  WORLD = {flat:true};
  const host = document.getElementById('world');
  if(host){ host.classList.remove('live'); host.classList.add('flat'); }
}

export function worldMat(colour, opts){
  const W = WORLD, key = colour + (opts ? JSON.stringify(opts) : '');
  if(!W.mats[key]) W.mats[key] = new W.T.MeshLambertMaterial(Object.assign({color: new W.T.Color(colour)}, opts || {}));
  return W.mats[key];
}
export function worldBox(group, w, h, d, x, y, z, colour){
  const W = WORLD, m = new W.T.Mesh(new W.T.BoxGeometry(w, h, d), worldMat(colour));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  return m;
}
/* a colour pulled toward another, for muted lots and darker pads */
export function worldMix(a, b, t){
  const W = WORLD, c = new W.T.Color(a);
  c.lerp(new W.T.Color(b), t);
  return '#' + c.getHexString();
}

/* One building, by shape. Every part is a box, a cone or a cylinder: it reads as
   a city at 390px and costs a few hundred triangles. */
export function worldMesh(b){
  const W = WORLD, T = W.T, g = new T.Group();
  const body = b.muted ? worldMix(b.colour, '#4a5460', 0.65) : b.colour;
  const accent = b.muted ? '#6b7682' : worldTone(b.tone);
  const dark = worldMix(body, '#10161d', 0.55);
  const h = b.h;
  if(b.shape === 'tower'){
    worldBox(g, 2.6, h, 2.6, 0, h/2, 0, body);
    for(let y = 1; y < h - 0.4; y += 1) worldBox(g, 2.66, 0.14, 2.66, 0, y, 0, dark);
    worldBox(g, 2.8, 0.26, 2.8, 0, h + 0.13, 0, accent);
  } else if(b.shape === 'shop'){
    worldBox(g, 3.4, h, 2.6, 0, h/2, 0, body);
    worldBox(g, 3.6, 0.16, 0.95, 0, Math.min(1.3, h*0.6), 1.65, accent);
    worldBox(g, 1.1, 1.0, 0.1, 0, 0.5, 1.33, dark);
    worldBox(g, 3.5, 0.2, 2.7, 0, h + 0.1, 0, dark);
  } else if(b.shape === 'house'){
    worldBox(g, 2.8, h, 2.6, 0, h/2, 0, body);
    const roof = new T.Mesh(new T.ConeGeometry(2.25, 1.25, 4), worldMat(accent));
    roof.position.set(0, h + 0.62, 0); roof.rotation.y = Math.PI/4; roof.castShadow = true;
    g.add(roof);
    worldBox(g, 0.8, 1.1, 0.1, 0.5, 0.55, 1.33, dark);
  } else if(b.shape === 'plot'){
    worldBox(g, 3.4, 0.16, 3.0, 0, 0.08, 0, b.muted ? '#3a4a3f' : '#3e6e4a');
    [[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3]].forEach(function(q){ worldBox(g, 0.12, 0.7, 0.12, q[0], 0.35, q[1], accent); });
  } else if(b.shape === 'monument'){
    worldBox(g, 2.2, 0.4, 2.2, 0, 0.2, 0, dark);
    const ob = new T.Mesh(new T.CylinderGeometry(0.32, 0.72, h, 4), worldMat(body));
    ob.position.set(0, 0.4 + h/2, 0); ob.rotation.y = Math.PI/4; ob.castShadow = true;
    g.add(ob);
    const top = new T.Mesh(new T.SphereGeometry(0.42, 12, 8), worldMat(accent));
    top.position.set(0, 0.4 + h + 0.3, 0);
    g.add(top);
  } else if(b.shape === 'hall'){
    worldBox(g, 3.6, h, 2.8, 0, h/2, 0, body);
    [-1.3, -0.45, 0.45, 1.3].forEach(function(x){ worldBox(g, 0.22, h*0.85, 0.22, x, h*0.425, 1.55, dark); });
    worldBox(g, 3.9, 0.3, 3.3, 0, h + 0.15, 0.15, accent);
  } else {
    worldBox(g, 1.9, h, 1.9, 0, h/2, 0, body);
    worldBox(g, 2.3, 0.22, 2.3, 0, h + 0.11, 0, accent);
  }
  g.position.set(b.x, 0.25, b.z);
  g.traverse(function(o){ o.userData.lot = b.id; });
  return g;
}

/* the city, rebuilt only when what it shows has changed */
export function worldBuild(m){
  const W = WORLD, T = W.T, root = W.root;
  for(let i = root.children.length - 1; i >= 0; i--){
    const c = root.children[i];
    c.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
    root.remove(c);
  }
  W.picks = []; W.walkers = [];
  const sky = worldSky(m.tone);
  W.scene.background = new T.Color(sky);
  W.scene.fog = new T.Fog(sky, 70, 140);
  const ground = new T.Mesh(new T.PlaneGeometry(160, 160), worldMat('#243140'));
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
  root.add(ground);
  /* the two avenues between the districts, laid on the screen's axes like the
     districts themselves, and the plaza where they cross */
  [[58, 3.0], [3.0, 50]].forEach(function(s){
    const r = new T.Mesh(new T.BoxGeometry(s[0], 0.06, s[1]), worldMat('#151d27'));
    r.position.y = 0.03; r.rotation.y = Math.PI/4; r.receiveShadow = true; root.add(r);
  });
  const plaza = new T.Mesh(new T.CylinderGeometry(3.4, 3.4, 0.3, 40), worldMat('#3a4652'));
  plaza.position.y = 0.15; plaza.receiveShadow = true; root.add(plaza);
  const ring = new T.Mesh(new T.CylinderGeometry(3.65, 3.65, 0.12, 40), worldMat('#f5b301'));
  ring.position.y = 0.06; root.add(ring);
  /* the plaza's column is your net worth, the one number the overview leads with */
  const col = new T.Mesh(new T.CylinderGeometry(0.4, 0.68, m.plaza.h, 6), worldMat(worldTone(m.plaza.tone)));
  col.position.y = 0.3 + m.plaza.h/2; col.castShadow = true; root.add(col);
  m.districts.forEach(function(d){
    const pad = new T.Mesh(new T.BoxGeometry(d.w, 0.25, d.d), worldMat(worldMix(d.colour, '#243140', 0.62)));
    pad.position.set(d.x, 0.125, d.z); pad.rotation.y = Math.PI/4; pad.receiveShadow = true;
    pad.userData.district = d.tab;
    root.add(pad); W.picks.push(pad);
  });
  m.buildings.forEach(function(b){
    const g = worldMesh(b);
    g.userData.district = b.tab;
    root.add(g);
    g.traverse(function(o){ if(o.isMesh){ o.userData.district = b.tab; W.picks.push(o); } });
  });
  /* the people in your life, walking the plaza */
  m.people.forEach(function(p){
    const g = new T.Group();
    const bodyC = new T.Color().setHSL(p.hue/360, 0.5, 0.58);
    const body = new T.Mesh(new T.CylinderGeometry(0.2, 0.26, 0.75, 8), new T.MeshLambertMaterial({color:bodyC}));
    body.position.y = 0.38 + 0.3; body.castShadow = true;
    const head = new T.Mesh(new T.SphereGeometry(0.19, 10, 8), worldMat('#6b4a32'));
    head.position.y = 1.0 + 0.3; head.castShadow = true;
    g.add(body, head); root.add(g);
    W.walkers.push({g:g, ring:p.ring, phase:p.phase, speed:0.00012 * (1 + (p.hue % 3) * 0.25)});
  });
}

/* where the camera wants to be: the whole city, or one district filling the frame */
export function worldGoal(m, focus){
  const W = WORLD, aspect = W.w && W.h ? W.w / W.h : 1;
  const d = focus ? m.districts.find(function(x){ return x.tab === focus; }) : null;
  /* framed by width, because a phone in portrait runs out of width first: half
     a district's width plus a margin, or the whole city's */
  if(d) return {x:d.x, z:d.z - 0.6, size: Math.max(12.5, (d.w / 2 + 0.8) / aspect)};
  return {x:0, z:0, size: Math.max(23, 25.4 / aspect)};
}
export function worldCamera(){
  const W = WORLD, v = W.view, cam = W.camera, aspect = W.w / Math.max(1, W.h);
  cam.left = -v.size * aspect; cam.right = v.size * aspect; cam.top = v.size; cam.bottom = -v.size;
  cam.position.set(v.x + 50, 66, v.z + 50);
  cam.lookAt(v.x, 0, v.z);
  cam.updateProjectionMatrix();
}
export function worldResize(){
  const W = WORLD, st = W.stage;
  if(!st) return;
  const w = st.clientWidth, h = st.clientHeight;
  if(w === W.w && h === W.h) return;
  W.w = w; W.h = h;
  W.renderer.setSize(w, h, false);
}
/* the labels ride on their buildings: project each one's anchor to the stage */
export function worldLabels(){
  const W = WORLD, T = W.T, host = W.host;
  if(!host) return;
  const v = new T.Vector3();
  host.querySelectorAll('.wl[data-wx]').forEach(function(node){
    const el = /** @type {HTMLElement} */ (node);
    v.set(+el.dataset.wx, +el.dataset.wy, +el.dataset.wz).project(W.camera);
    const ow = el.offsetWidth, oh = el.offsetHeight;
    const x = Math.max(ow/2 + 6, Math.min(W.w - ow/2 - 6, (v.x + 1) / 2 * W.w));
    const y = Math.max(oh + 6, Math.min(W.h - 30, (1 - v.y) / 2 * W.h));
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
    el.classList.add('placed');
  });
}
export function worldDraw(t){
  const W = WORLD;
  W.walkers.forEach(function(p){
    const a = p.phase + (W.still ? 0 : t * p.speed);
    p.g.position.set(Math.cos(a) * p.ring, 0, Math.sin(a) * p.ring);
    p.g.rotation.y = -a;
  });
  worldCamera();
  W.renderer.render(W.scene, W.camera);
  worldLabels();
  W.drawn = t;
}
export function worldFrame(t){
  const W = WORLD;
  if(!W || W.flat) return;
  W.raf = 0;
  if(!W.host || !W.host.isConnected || document.hidden) return;
  const dt = Math.min(0.1, (t - (W.last || t)) / 1000);
  W.last = t;
  worldResize();
  const k = W.still ? 1 : 1 - Math.exp(-dt * 5);
  W.view.x += (W.goal.x - W.view.x) * k;
  W.view.z += (W.goal.z - W.view.z) * k;
  W.view.size += (W.goal.size - W.view.size) * k;
  const flying = Math.abs(W.goal.size - W.view.size) > 0.02 || Math.abs(W.goal.x - W.view.x) > 0.02 || Math.abs(W.goal.z - W.view.z) > 0.02;
  /* about 30 frames a second while anything moves; the camera's flight at full rate */
  if(flying || t - W.drawn > 32) worldDraw(t);
  const awake = t - W.idleAt < 10000;
  if(flying || (awake && !W.still)) W.raf = requestAnimationFrame(worldFrame);
}
export function worldKick(){
  const W = WORLD;
  if(!W || W.flat) return;
  W.idleAt = performance.now();
  if(!W.raf) W.raf = requestAnimationFrame(worldFrame);
}
/* A tap on the city is a tap on a label: a district from the city view, a
   building once a district is open. Clicking the label is the point - the move
   goes through the dispatcher like every other move in the game. */
export function worldTap(ev){
  const W = WORLD;
  if(!W || W.flat || !W.host) return;
  const r = W.canvas.getBoundingClientRect();
  const ndc = new W.T.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  const ray = new W.T.Raycaster();
  ray.setFromCamera(ndc, W.camera);
  const hit = ray.intersectObjects(W.picks, false)[0];
  if(!hit) return;
  const u = hit.object.userData, focus = UI.worldFocus || '';
  let sel = '';
  if(!focus || u.district !== focus) sel = '.wl[data-a="worldfocus"][data-d="' + u.district + '"]';
  else if(u.lot) sel = '.wl[data-a="goto"][data-t="' + u.lot.split('/')[0] + '"][data-s="' + u.lot.split('/')[1] + '"]';
  const btn = sel ? /** @type {HTMLElement} */ (W.host.querySelector(sel)) : null;
  if(btn) btn.click();
  else if(u.district && u.district !== focus){ UI.worldFocus = u.district; render(); }
}

/* Called at the end of every render, by both renderers. The canvas outlives the
   markup: a render replaces the world's container, and the same canvas (and its
   GL context) is moved into the new one. */
export function worldSync(){
  const host = document.getElementById('world');
  if(!host){ if(WORLD && WORLD.raf){ cancelAnimationFrame(WORLD.raf); WORLD.raf = 0; } if(WORLD && !WORLD.flat) WORLD.host = null; return; }
  if(!WORLD) WORLD = worldInit();
  if(WORLD.flat){ host.classList.add('flat'); return; }
  const stage = /** @type {HTMLElement} */ (host.querySelector('.world-stage'));
  if(!stage) return;
  if(WORLD.canvas.parentNode !== stage) stage.appendChild(WORLD.canvas);
  host.classList.add('live');
  WORLD.host = host; WORLD.stage = stage;
  worldResize();
  const m = worldModel();
  const sig = JSON.stringify([m.buildings, m.people, m.plaza, m.tone]);
  if(sig !== WORLD.sig){ worldBuild(m); WORLD.sig = sig; }
  const focus = UI.worldFocus || '';
  WORLD.goal = worldGoal(m, focus);
  if(WORLD.focus === null) WORLD.view = Object.assign({}, WORLD.goal);
  WORLD.focus = focus;
  worldDraw(performance.now());
  worldKick();
}
document.addEventListener('visibilitychange', function(){ if(!document.hidden) worldKick(); });
window.addEventListener('resize', function(){ if(WORLD && !WORLD.flat && WORLD.host){ worldResize(); worldKick(); } });
