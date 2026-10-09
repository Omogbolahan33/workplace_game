/* =========================================================================
   The world, drawn
   ========================================================================= */
/* core's worldModel() says what the city contains and worldHTML() writes its
   labels; this draws it. The page carries the renderer as inert text
   (<script type="text/plain" id="three-src">, built by tools/vendor-three.mjs)
   and it is evaluated the first time a world is on screen.

   The world has its own container, #scene, between the header and the page,
   on every screen: the whole city above the overview, and above any other
   screen that screen's building, close, with a ring under it. Nothing but this
   file writes #scene, so neither renderer shares a node with it - the React
   tree and the string path both leave it alone, and it leaves #main alone.

   Rules this file keeps:
   - it draws and never decides. Navigation is the labels' job, and the labels
     are ordinary buttons with ordinary actions: a tap on a building clicks its
     label, so every move still goes through the one dispatcher, is measured
     there and saved there.
   - it never breaks the game. No WebGL, no renderer, a lost context: the world
     stays a list of working places (the `.flat` look), and nothing else on the
     page knows.
   - it costs nothing when nobody is looking. The loop runs while the world is on
     the page and the tab is visible, idles after a few seconds without a move,
     and stops when there is no world to draw.
   - no binding here can be read before it exists. boot() runs at the end of
     the actions section and a restored run renders at once - before this
     section has run in the single file, and possibly before this module has
     been evaluated in the app. So the state is a bare `var` (hoisted, never
     reset by an initialiser) and every table is a function. A `let` here threw
     on every reload of a saved run. */
var WORLD;

/* the renderer, from the page's own copy of three.js */
function threeLib(){
  const w = /** @type {any} */ (window);
  if(w.THREE) return w.THREE;
  const src = document.getElementById('three-src');
  if(!src || !src.textContent) return null;
  /* evaluated by appending a script, which runs at once - and removed at once,
     so document.scripts holds what the build shipped and nothing else (the
     build stamp hashes it, and a second copy changed the stamp mid-session) */
  const s = document.createElement('script');
  s.textContent = src.textContent;
  document.head.appendChild(s);
  s.remove();
  return w.THREE || null;
}
/* A context is asked for before three.js is: a renderer that fails to get one
   logs an error, and a page that cannot draw 3D is not an error, it is a phone. */
function worldGL(){
  const c = document.createElement('canvas');
  if(typeof c.getContext !== 'function') return null;
  const ctx = c.getContext('webgl2') || c.getContext('webgl');
  return ctx ? {canvas:c, ctx:ctx} : null;
}

function worldTone(k){
  return ({good:'#4cc38a', bad:'#e5484d', warn:'#f5a524', info:'#5aa9ff', acc:'#f5b301'})[k] || '#ece6da';
}
function worldSky(k){
  return ({good:'#0f1d18', bad:'#1c1115', warn:'#1c1a11', info:'#0f1726'})[k] || '#0e1620';
}
/* a stable number from a string: which windows are lit, which way a car goes */
function worldHash(s){
  let h = 2166136261;
  for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
/* a screen-axis position on the ground: the same turn core's worldAt() makes */
function worldGround(sx, sy){
  const r = Math.SQRT1_2;
  return {x:(sx + sy) * r, z:(sy - sx) * r};
}

/* a long lens: depth without distortion at the edges */
function worldFov(){ return 30; }

function worldInit(){
  const gl = worldGL();
  const T = gl ? threeLib() : null;
  if(!gl || !T) return {flat:true};
  const renderer = new T.WebGLRenderer({canvas:gl.canvas, context:gl.ctx, antialias:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(worldFov(), 1, 1, 600);
  const hemi = new T.HemisphereLight(0xe6eeff, 0x3a3020, 2.1);
  const sun = new T.DirectionalLight(0xfff1d6, 2.9);
  sun.position.set(-26, 52, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -44; sc.right = 44; sc.top = 44; sc.bottom = -44; sc.near = 1; sc.far = 160;
  scene.add(hemi, sun);
  const root = new T.Group();
  scene.add(root);
  gl.canvas.className = 'world-canvas';
  gl.canvas.addEventListener('click', worldTap);
  gl.canvas.addEventListener('webglcontextlost', function(ev){ ev.preventDefault(); worldFlat(); });
  return {T:T, renderer:renderer, scene:scene, camera:camera, root:root, canvas:gl.canvas,
          mats:{}, picks:[], walkers:[], cars:[], grows:[], coins:[], lots:{}, heights:{}, ring:null,
          sig:'', here:null, focus:null,
          view:{x:0, y:0, z:0, size:30}, goal:{x:0, y:0, z:0, size:30},
          raf:0, last:0, drawn:0, idleAt:0, host:null, stage:null, w:0, h:0,
          still: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)};
}
/* from here on this session draws the list, not the city */
function worldFlat(){
  if(WORLD && WORLD.raf) cancelAnimationFrame(WORLD.raf);
  WORLD = {flat:true};
  const host = document.getElementById('world');
  if(host){ host.classList.remove('live'); host.classList.add('flat'); }
}

function worldMat(colour, opts){
  const W = WORLD, key = colour + (opts ? JSON.stringify(opts) : '');
  if(!W.mats[key]) W.mats[key] = new W.T.MeshLambertMaterial(Object.assign({color: new W.T.Color(colour)}, opts || {}));
  return W.mats[key];
}
/* light that is not lit by the sun: windows, lamps, coins, the ring */
function worldGlow(colour, opacity){
  const W = WORLD, key = 'glow' + colour + (opacity || 1);
  if(!W.mats[key]) W.mats[key] = new W.T.MeshBasicMaterial(opacity ? {color: new W.T.Color(colour), transparent:true, opacity:opacity}
                                                                    : {color: new W.T.Color(colour)});
  return W.mats[key];
}
function worldBox(group, w, h, d, x, y, z, colour){
  const W = WORLD, m = new W.T.Mesh(new W.T.BoxGeometry(w, h, d), worldMat(colour));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  return m;
}
/* a colour pulled toward another, for muted lots and darker pads */
function worldMix(a, b, t){
  const W = WORLD, c = new W.T.Color(a);
  c.lerp(new W.T.Color(b), t);
  return '#' + c.getHexString();
}
/* windows on the two faces the camera sees, some of them lit; which ones is a
   function of the building, so the same city lights the same windows */
function worldWindows(g, b, w, d, h, from){
  const W = WORLD, T = W.T, seed = worldHash(b.id);
  const dark = worldMat('#1a2129'), lit = worldGlow(b.muted ? '#8a8f96' : '#ffd38a');
  for(let y = from, f = 0; y < h - 0.5; y += 1, f++){
    for(let i = 0; i < 3; i++){
      const on = ((seed >> ((f * 3 + i) % 29)) & 3) !== 0;
      const off = (i - 1) * (w / 3.4);
      const a = new T.Mesh(new T.BoxGeometry(0.42, 0.42, 0.04), on ? lit : dark);
      a.position.set(off, y, d/2 + 0.02); g.add(a);
      const c = new T.Mesh(new T.BoxGeometry(0.04, 0.42, 0.42), ((seed >> ((f * 3 + i + 7) % 29)) & 3) !== 0 ? lit : dark);
      c.position.set(w/2 + 0.02, y, (i - 1) * (d / 3.4)); g.add(c);
    }
  }
}

/* One building, by shape. Every part is a box, a cone or a cylinder: it reads as
   a city at 390px and costs a few hundred triangles. */
function worldMesh(b){
  const W = WORLD, T = W.T, g = new T.Group();
  const body = b.muted ? worldMix(b.colour, '#4a5460', 0.65) : b.colour;
  const accent = b.muted ? '#6b7682' : worldTone(b.tone);
  const dark = worldMix(body, '#10161d', 0.55);
  const h = b.h;
  if(b.shape === 'tower'){
    worldBox(g, 2.6, h, 2.6, 0, h/2, 0, body);
    worldWindows(g, b, 2.6, 2.6, h, 0.9);
    worldBox(g, 2.8, 0.26, 2.8, 0, h + 0.13, 0, accent);
  } else if(b.shape === 'shop'){
    worldBox(g, 3.4, h, 2.6, 0, h/2, 0, body);
    worldBox(g, 3.6, 0.16, 0.95, 0, Math.min(1.3, h*0.6), 1.65, accent);
    const glass = new T.Mesh(new T.BoxGeometry(2.6, 0.8, 0.05), worldGlow(b.muted ? '#5a6068' : '#ffe2a8'));
    glass.position.set(0, 0.55, 1.32); g.add(glass);
    if(h > 2.4) worldWindows(g, b, 3.4, 2.6, h, 2.0);
    worldBox(g, 3.5, 0.2, 2.7, 0, h + 0.1, 0, dark);
  } else if(b.shape === 'house'){
    worldBox(g, 2.8, h, 2.6, 0, h/2, 0, body);
    worldWindows(g, b, 2.8, 2.6, h, 0.9);
    const roof = new T.Mesh(new T.ConeGeometry(2.25, 1.25, 4), worldMat(accent));
    roof.position.set(0, h + 0.62, 0); roof.rotation.y = Math.PI/4; roof.castShadow = true;
    g.add(roof);
  } else if(b.shape === 'plot'){
    worldBox(g, 3.4, 0.16, 3.0, 0, 0.08, 0, b.muted ? '#3a4a3f' : '#3e6e4a');
    [[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3]].forEach(function(q){ worldBox(g, 0.12, 0.7, 0.12, q[0], 0.35, q[1], accent); });
  } else if(b.shape === 'monument'){
    worldBox(g, 2.2, 0.4, 2.2, 0, 0.2, 0, dark);
    const ob = new T.Mesh(new T.CylinderGeometry(0.32, 0.72, h, 4), worldMat(body));
    ob.position.set(0, 0.4 + h/2, 0); ob.rotation.y = Math.PI/4; ob.castShadow = true;
    g.add(ob);
    const top = new T.Mesh(new T.SphereGeometry(0.42, 12, 8), b.muted ? worldMat(accent) : worldGlow(accent));
    top.position.set(0, 0.4 + h + 0.3, 0);
    g.add(top);
  } else if(b.shape === 'hall'){
    worldBox(g, 3.6, h, 2.8, 0, h/2, 0, body);
    [-1.3, -0.45, 0.45, 1.3].forEach(function(x){ worldBox(g, 0.22, h*0.85, 0.22, x, h*0.425, 1.55, dark); });
    worldBox(g, 3.9, 0.3, 3.3, 0, h + 0.15, 0.15, accent);
  } else {
    worldBox(g, 1.9, h, 1.9, 0, h/2, 0, body);
    const pane = new T.Mesh(new T.BoxGeometry(1.2, 0.6, 0.05), worldGlow(b.muted ? '#5a6068' : '#ffe2a8'));
    pane.position.set(0, Math.min(1.1, h*0.5), 0.97); g.add(pane);
    worldBox(g, 2.3, 0.22, 2.3, 0, h + 0.11, 0, accent);
  }
  g.position.set(b.x, 0.25, b.z);
  g.traverse(function(o){ o.userData.lot = b.id; });
  return g;
}
function worldTree(root, x, z, s){
  const W = WORLD, T = W.T;
  const trunk = new T.Mesh(new T.CylinderGeometry(0.1*s, 0.14*s, 0.8*s, 6), worldMat('#4a3826'));
  trunk.position.set(x, 0.4*s, z); trunk.castShadow = true;
  const crown = new T.Mesh(new T.ConeGeometry(0.75*s, 1.7*s, 7), worldMat('#2f6b46'));
  crown.position.set(x, 1.55*s, z); crown.castShadow = true;
  root.add(trunk, crown);
}
function worldLamp(root, x, z){
  const W = WORLD, T = W.T;
  const post = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, 1.7, 6), worldMat('#2a323c'));
  post.position.set(x, 0.85, z);
  const bulb = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), worldGlow('#ffd98a'));
  bulb.position.set(x, 1.75, z);
  root.add(post, bulb);
}
function worldCar(root, i){
  const W = WORLD, T = W.T, g = new T.Group();
  const colours = ['#d24b3e', '#e9e4d8', '#3f6fb5', '#f2b33d', '#5a6470', '#2f8f6a'];
  const c = colours[i % colours.length];
  const body = new T.Mesh(new T.BoxGeometry(1.1, 0.34, 0.56), worldMat(c));
  body.position.y = 0.32; body.castShadow = true;
  const cab = new T.Mesh(new T.BoxGeometry(0.6, 0.28, 0.5), worldMat(worldMix(c, '#10161d', 0.35)));
  cab.position.set(-0.08, 0.62, 0);
  const lamp = new T.Mesh(new T.BoxGeometry(0.04, 0.1, 0.4), worldGlow('#fff2c4'));
  lamp.position.set(0.56, 0.34, 0);
  g.add(body, cab, lamp); root.add(g);
  /* half the cars run along the avenue that crosses the screen, half along the
     one that runs into it, in both directions, never through the plaza */
  const across = i % 2 === 0;
  const dir = (i >> 1) % 2 === 0 ? 1 : -1;
  W.cars.push({g:g, across:across, dir:dir, lane: dir * 0.75, span: across ? 30 : 27,
    phase: (worldHash('car' + i) % 1000) / 1000, speed: 0.000028 * (0.8 + (i % 3) * 0.2)});
}

/* the city, rebuilt only when what it shows has changed; a building whose
   height changed grows or shrinks into its new size instead of jumping */
function worldBuild(m){
  const W = WORLD, T = W.T, root = W.root;
  for(let i = root.children.length - 1; i >= 0; i--){
    const c = root.children[i];
    c.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
    root.remove(c);
  }
  W.picks = []; W.walkers = []; W.cars = []; W.coins = []; W.lots = {};
  const now = performance.now();
  const sky = worldSky(m.tone);
  W.scene.background = new T.Color(sky);
  W.scene.fog = new T.Fog(sky, 90, 200);
  const ground = new T.Mesh(new T.PlaneGeometry(220, 220), worldMat('#243140'));
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
  root.add(ground);
  /* the two avenues between the districts, laid on the screen's axes like the
     districts themselves, and the plaza where they cross */
  [[64, 3.0], [3.0, 58]].forEach(function(s){
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
  W.plazaTop = 0.3 + m.plaza.h;
  for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2 + Math.PI/8; worldLamp(root, Math.cos(a) * 4.3, Math.sin(a) * 4.3); }
  m.districts.forEach(function(d){
    const pad = new T.Mesh(new T.BoxGeometry(d.w, 0.25, d.d), worldMat(worldMix(d.colour, '#243140', 0.62)));
    pad.position.set(d.x, 0.125, d.z); pad.rotation.y = Math.PI/4; pad.receiveShadow = true;
    pad.userData.district = d.tab;
    root.add(pad); W.picks.push(pad);
  });
  /* trees on each district's edge and around the city, lamps along the avenue */
  m.districts.forEach(function(d){
    const c = {sx: (d.x - d.z) * Math.SQRT1_2, sy: (d.x + d.z) * Math.SQRT1_2};
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0]].forEach(function(q){
      const p = worldGround(c.sx + q[0] * (d.w/2 - 0.9), c.sy + q[1] * (d.d/2 - 0.9));
      worldTree(root, p.x, p.z, 0.9);
    });
  });
  for(let sx = -30; sx <= 30; sx += 6){
    [-29, 29].forEach(function(sy){ const p = worldGround(sx, sy); worldTree(root, p.x, p.z, 1.15); });
  }
  for(let sy = -24; sy <= 24; sy += 6){
    [-30, 30].forEach(function(sx){ const p = worldGround(sx, sy); worldTree(root, p.x, p.z, 1.15); });
  }
  for(let sx = -26; sx <= 26; sx += 6.5){
    if(Math.abs(sx) < 5) continue;
    [-1.75, 1.75].forEach(function(sy){ const p = worldGround(sx, sy); worldLamp(root, p.x, p.z); });
  }
  m.buildings.forEach(function(b){
    const g = worldMesh(b);
    g.userData.district = b.tab;
    root.add(g);
    W.lots[b.id] = b;
    g.traverse(function(o){ if(o.isMesh){ o.userData.district = b.tab; W.picks.push(o); } });
    const was = W.heights[b.id];
    if(was && Math.abs(was - b.h) > 0.05 && !W.still){
      g.scale.y = was / b.h;
      W.grows.push({g:g, from:was / b.h, start:now});
    }
    W.heights[b.id] = b.h;
  });
  /* the ring under the building the page is showing */
  W.ring = new T.Mesh(new T.CylinderGeometry(2.7, 2.7, 0.06, 48), worldGlow('#f5b301', 0.42));
  W.ring.visible = false;
  root.add(W.ring);
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
  for(let i = 0; i < 8; i++) worldCar(root, i);
}

/* Where the camera wants to be: the whole city; one district filling the frame;
   or, on any screen but the overview, that screen's building, close. Framed by
   width, because a phone in portrait runs out of width first. */
function worldGoal(m, focus, here){
  const W = WORLD, aspect = W.w && W.h ? W.w / W.h : 1;
  const b = here ? m.buildings.find(function(x){ return x.id === here; }) : null;
  /* close on the building, and tall enough to hold all of it and its label */
  if(b) return {x:b.x, y:b.h * 0.45, z:b.z, size: Math.max(4.6, 7.4 / aspect, b.h * 0.62 + 1.6)};
  const d = focus ? m.districts.find(function(x){ return x.tab === focus; }) : null;
  if(d) return {x:d.x, y:1, z:d.z - 0.6, size: Math.max(12.5, (d.w / 2 + 0.8) / aspect)};
  return {x:0, y:0, z:0, size: Math.max(23, 25.4 / aspect)};
}
/* The camera looks along the city's diagonal from above, through a long lens.
   `size` is the half-height of what it frames at the target, so the distance
   follows from the field of view. */
function worldCamera(){
  const W = WORLD, v = W.view, cam = W.camera;
  const dist = v.size / Math.tan(worldFov() / 2 * Math.PI / 180);
  cam.aspect = W.w / Math.max(1, W.h);
  cam.position.set(v.x + dist * 0.519, v.y + dist * 0.685, v.z + dist * 0.519);
  cam.near = Math.max(1, dist * 0.2); cam.far = dist * 3;
  cam.lookAt(v.x, v.y, v.z);
  cam.updateProjectionMatrix();
  if(W.scene.fog){ W.scene.fog.near = dist * 1.05; W.scene.fog.far = dist * 2.4; }
}
function worldResize(){
  const W = WORLD, st = W.stage;
  if(!st) return;
  const w = st.clientWidth, h = st.clientHeight;
  if(w === W.w && h === W.h) return;
  W.w = w; W.h = h;
  W.renderer.setSize(w, h, false);
}
/* The labels ride on their buildings: each anchor is projected to the stage.
   A district's name is held inside the frame; a building out of frame hides
   its label rather than piling it against the edge. */
function worldLabels(){
  const W = WORLD, T = W.T, host = W.host;
  if(!host) return;
  const v = new T.Vector3();
  host.querySelectorAll('.wl[data-wx]').forEach(function(node){
    const el = /** @type {HTMLElement} */ (node);
    v.set(+el.dataset.wx, +el.dataset.wy, +el.dataset.wz).project(W.camera);
    let x = (v.x + 1) / 2 * W.w, y = (1 - v.y) / 2 * W.h;
    /* measured while shown: a label hidden last frame is 0px wide */
    el.style.display = '';
    const ow = el.offsetWidth, oh = el.offsetHeight;
    if(!el.classList.contains('wd') && (x < ow * 0.3 || x > W.w - ow * 0.3 || y < oh * 0.6 || y > W.h - 8 || v.z > 1)){
      el.style.display = 'none';
      return;
    }
    el.style.display = '';
    x = Math.max(ow/2 + 6, Math.min(W.w - ow/2 - 6, x));
    y = Math.max(oh + 6, Math.min(W.h - 30, y));
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
    el.classList.add('placed');
  });
}
/* coins in flight: from a building home to the plaza when money comes in, from
   the plaza out to the building when it goes */
function worldPulse(fx){
  const W = WORLD;
  if(!W || W.flat || !W.host || W.still) return;
  const money = (fx || []).filter(function(x){ return x.money === 1 && (x.k === 'cash' || x.k === 'biz'); });
  if(!money.length) return;
  const d = money.reduce(function(s, x){ return s + x.d; }, 0);
  const lot = W.lots[worldHere()] || W.lots['money/position'];
  if(!lot || !d) return;
  const T = W.T, n = Math.max(4, Math.min(12, Math.round(Math.log10(Math.abs(d) + 1) * 1.6)));
  /* on the overview the plaza is in frame and the coins travel between it and
     the building; on a screen it is not, so the money drops into the building
     from above when it comes in and rises out of it when it goes */
  const house = new T.Vector3(lot.x, lot.h + 0.9, lot.z);
  const away = W.here ? new T.Vector3(lot.x - 1.2, lot.h + 7.5, lot.z - 1.2) : new T.Vector3(0, W.plazaTop + 0.3, 0);
  const from = d > 0 ? (W.here ? away : house) : (W.here ? house : away);
  const to = d > 0 ? (W.here ? house : away) : (W.here ? away : house);
  const arc = W.here ? 1.2 : 4.5;
  const now = performance.now();
  for(let i = 0; i < n; i++){
    const c = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.06, 14), worldGlow(d > 0 ? '#f5c542' : '#ffb067'));
    c.rotation.x = Math.PI / 2;
    W.root.add(c);
    W.coins.push({m:c, from:from, to:to, arc:arc, start: now + i * 70, dur: 950});
  }
  worldKick();
}
function worldDraw(t){
  const W = WORLD;
  W.walkers.forEach(function(p){
    const a = p.phase + (W.still ? 0 : t * p.speed);
    p.g.position.set(Math.cos(a) * p.ring, 0, Math.sin(a) * p.ring);
    p.g.rotation.y = -a;
  });
  W.cars.forEach(function(c){
    const u = ((c.phase + (W.still ? 0 : t * c.speed)) % 1);
    const s = (u * 2 - 1) * c.span * c.dir;
    const p = c.across ? worldGround(s, c.lane) : worldGround(c.lane, s);
    c.g.position.set(p.x, 0.06, p.z);
    c.g.rotation.y = (c.across ? Math.PI/4 : -Math.PI/4) + (c.dir < 0 ? Math.PI : 0);
    c.g.visible = Math.abs(s) > 4.6;
  });
  W.grows = W.grows.filter(function(g){
    const k = Math.min(1, (t - g.start) / 900), e = 1 - Math.pow(1 - k, 3);
    g.g.scale.y = g.from + (1 - g.from) * e;
    return k < 1;
  });
  W.coins = W.coins.filter(function(c){
    const k = (t - c.start) / c.dur;
    if(k < 0){ c.m.visible = false; return true; }
    if(k >= 1){ W.root.remove(c.m); c.m.geometry.dispose(); return false; }
    c.m.visible = true;
    c.m.position.lerpVectors(c.from, c.to, k);
    c.m.position.y += Math.sin(k * Math.PI) * c.arc;
    c.m.rotation.z = k * 9;
    return true;
  });
  const here = W.here ? W.lots[W.here] : null;
  if(W.ring){
    W.ring.visible = !!here;
    if(here){
      W.ring.position.set(here.x, 0.29, here.z);
      const s = 1 + (W.still ? 0 : Math.sin(t / 420) * 0.06);
      W.ring.scale.set(s, 1, s);
    }
  }
  worldCamera();
  W.renderer.render(W.scene, W.camera);
  worldLabels();
  W.drawn = t;
}
function worldFrame(t){
  const W = WORLD;
  if(!W || W.flat) return;
  W.raf = 0;
  if(!W.host || !W.host.isConnected || document.hidden) return;
  const dt = Math.min(0.1, (t - (W.last || t)) / 1000);
  W.last = t;
  worldResize();
  const k = W.still ? 1 : 1 - Math.exp(-dt * 4.5);
  ['x', 'y', 'z', 'size'].forEach(function(a){ W.view[a] += (W.goal[a] - W.view[a]) * k; });
  const flying = ['x', 'y', 'z', 'size'].some(function(a){ return Math.abs(W.goal[a] - W.view[a]) > 0.02; });
  const busy = flying || W.coins.length > 0 || W.grows.length > 0;
  /* about 30 frames a second while the city moves; flights, coins and growth
     at full rate */
  if(busy || t - W.drawn > 32) worldDraw(t);
  const awake = t - W.idleAt < 10000;
  if(busy || (awake && !W.still)) W.raf = requestAnimationFrame(worldFrame);
}
function worldKick(){
  const W = WORLD;
  if(!W || W.flat) return;
  W.idleAt = performance.now();
  if(!W.raf) W.raf = requestAnimationFrame(worldFrame);
}
/* A tap on the city is a tap on a label. From the whole city a district opens;
   with a district open, or from a screen, a building opens its screen. A
   building whose label is not on the page (another district, seen from a
   screen) gets a one-off label of the same kind, clicked and removed - so the
   move still goes through the dispatcher like every other move in the game. */
function worldTap(ev){
  const W = WORLD;
  if(!W || W.flat || !W.host) return;
  const r = W.canvas.getBoundingClientRect();
  const ndc = new W.T.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  const ray = new W.T.Raycaster();
  ray.setFromCamera(ndc, W.camera);
  const hit = ray.intersectObjects(W.picks, false)[0];
  if(!hit) return;
  const u = hit.object.userData, here = worldHere(), focus = here ? here.split('/')[0] : (UI.worldFocus || '');
  if(!here && (!focus || u.district !== focus)){
    const d = /** @type {HTMLElement} */ (W.host.querySelector('.wl[data-a="worldfocus"][data-d="' + u.district + '"]'));
    if(d) d.click();
    return;
  }
  if(!u.lot) return;
  const parts = u.lot.split('/');
  let btn = /** @type {HTMLElement} */ (W.host.querySelector('.wl[data-a="goto"][data-t="' + parts[0] + '"][data-s="' + parts[1] + '"]'));
  if(btn){ btn.click(); return; }
  btn = document.createElement('button');
  btn.dataset.a = 'goto'; btn.dataset.t = parts[0]; btn.dataset.s = parts[1];
  btn.style.display = 'none';
  W.host.appendChild(btn);
  btn.click();
  btn.remove();
}

/* Called at the end of every render, by both renderers, and by the start
   screen with `off` - the start screen can open while a run still exists (a new
   run from Settings), and it is no place for a city. It writes #scene (and only
   #scene) and draws into it. The canvas outlives the markup: each write
   replaces the world's container, and the same canvas, with its GL context, is
   moved into the new one. */
function worldSync(off){
  const scene = document.getElementById('scene');
  if(!scene) return;
  if(off || !S){
    scene.innerHTML = '';
    if(WORLD && WORLD.raf){ cancelAnimationFrame(WORLD.raf); WORLD.raf = 0; }
    if(WORLD && !WORLD.flat) WORLD.host = null;
    return;
  }
  scene.innerHTML = worldHTML();
  const host = /** @type {HTMLElement} */ (scene.querySelector('#world'));
  /* a document that does not parse markup (a test's stub) has no world to draw */
  if(!host) return;
  if(!WORLD) WORLD = worldInit();
  if(WORLD.flat){ host.classList.add('flat'); return; }
  const stage = /** @type {HTMLElement} */ (host.querySelector('.world-stage'));
  stage.appendChild(WORLD.canvas);
  host.classList.add('live');
  WORLD.host = host; WORLD.stage = stage;
  worldResize();
  const m = worldModel();
  const sig = JSON.stringify([m.buildings, m.people, m.plaza, m.tone]);
  if(sig !== WORLD.sig){ worldBuild(m); WORLD.sig = sig; }
  const here = worldHere(), focus = here ? here.split('/')[0] : (UI.worldFocus || '');
  WORLD.goal = worldGoal(m, focus, here);
  if(WORLD.focus === null) WORLD.view = Object.assign({}, WORLD.goal);
  WORLD.focus = focus; WORLD.here = here;
  worldDraw(performance.now());
  worldKick();
}
document.addEventListener('visibilitychange', function(){ if(!document.hidden) worldKick(); });
window.addEventListener('resize', function(){ if(WORLD && !WORLD.flat && WORLD.host){ worldResize(); worldKick(); } });
